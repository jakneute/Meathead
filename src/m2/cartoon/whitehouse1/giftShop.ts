// THE GIFT SHOP STOCKROOM: Cartoon Land's hidden MAX HEALTH find, off the Rose Garden (the owner, 2026-11-01: "cartoon
// land - another health pickup. the part shortly after the falwell fight. when you drop down to the lawn, there will be
// a 'gift shop' arrow pointing left. if you re-enter the white house from there, you'll drop down to a tricky tilting
// tower platforming challenge with instant death instead of ejections. similar to the jungle one.")
//
//   THE ARROW: on the lawn just off the balcony's drop, a park sign, GIFT SHOP, pointing left (back under the balcony).
//   THE WAY IN: the porch under the Truman Balcony (layout.ts PORCH: open from the garden now, the balcony a slab over
//     it), its door (the one rooms.ts always drew) hung with a GIFT SHOP shingle. Up at it (the real prompt: GIFT SHOP)
//     and in he goes: the shop bell, and he drops down a hatch into the stockroom. That makes the Rose Garden his
//     checkpoint (a death down there puts him back on the lawn, a short walk from the door).
//   THE STOCKROOM (world: deep under the garden, nothing of the house's near it): stacks of unsold souvenirs on
//     pallets, leaning towers of them rising out of THE RETURNS CHUTE, a bottomless dark. Cartoon Land's towers
//     (sway.ts: they lean toward where he stands on the lid, further the further out; spring back off it), four of them
//     between three crate stacks, each gap too far to jump unless the tower he's on is leaned out over it (stand out on
//     its far edge), the lids narrower each time (96, 88, 80, 72). Tricky, fair: every jump off a fully leaned lid has
//     room to spare.
//   DEATH: no ejections here. Over the edge, he drops out of the bottom of the screen (a yell, the fall whistle) and
//     he's dead: THE RETURNS CHUTE's death screen (NO REFUNDS...), back at the checkpoint.
//   THE HEART CANISTER: on the last stack, on a velvet display plinth, tagged FREE. Touched: it's his for good
//     (upgrades/healthAward.ts: +1 health find, +10 max health, the save written there and then), the YOU GOT card
//     (HealthGotCard.tsx, the buffer), then his line. Found on this save already: not there.
//   THE CANNON (upgrades/returnCannon.ts, Cartoon Land's circus look): past the plinth, only once the heart's gone (no
//     getting in by accident before). It stays pointing straight up and fires him up out of the stockroom; he comes down
//     out of the sky onto the Rose Garden's bench, past the arrow (safe: nobody there, the thorns well clear).
//
// Nothing here outlives a death but the find (in the save). giftShopArt.ts draws it all.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { NO_CONTROLS } from '../../../m1/game/platform/input';
import { playSound } from '../../../m1/game/platform/audio';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { CANVAS_HEIGHT } from '../../../m1/constants';
import { registerHurtLines } from '../../kinds';
import { setUi } from '../../store';
import { onFloorish, upStart } from '../../upZone';
import { awardHealth, healthWon, openHealthCard, tickHealthCard, type HealthCard } from '../../upgrades/healthAward';
import { makeCannon, updateCannon, cannonBusy, type Cannon } from '../../upgrades/returnCannon';
import { makeTowers, updateTowers, ridingTower, type Tower, type TowerDef } from '../sway';
import { teleport, solid, meatheadSays, byPants } from '../section';
import { GY } from '../geometry';
import { whMust } from './onceLines';
import { COLLAPSED_MEMO } from './state';
import { PORCH, BENCH, X, Y } from './layout';
import { STOCK_IN, STOCK_LEAN, STOCK_FALL, STOCK_GOT, STOCK_BYE, STOCK_HURT, PIT_SRC } from './giftShopLines';

for (const [source, l] of Object.entries(STOCK_HURT)) registerHurtLines(source, l.hurt, l.death);

// ---------------------------------------------------------------------------------------------------------------
// Where

/** The stockroom (world): its ends, and the datum its heights are from (the towers' feet, down in the dark). */
export const STOCK = { a: X(9500), b: X(12000), floor: GY + 3000 };
/** World x of a stockroom x; world y of a height over the datum. */
export const SL = (lx: number) => STOCK.a + lx;
export const SH = (h: number) => STOCK.floor - h;
/** The room's right wall (lx), the ceiling's height (the hatch he drops through is in it). */
export const STOCK_W = 2500, CEIL_H = 900;
/** The porch door (its middle: rooms.ts draws it at the porch's middle), the arrow sign on the lawn. */
export const DOOR_X = X((PORCH.a + PORCH.b) / 2), ARROW_X = X(10360);
/** Once the screen's down (the real stage): the arrow stands out on the open stage floor between the scaffold steps
 *  down off the deck (to 10530) and the bench (from 10640), clear of both (on the lawn's spot it ran across the steps). */
export const ARROW_REAL_X = X(10585);
/** The crate stacks he stands on: [lx from, lx to, top height] (down into the dark, lit along their tops). */
export const STACKS: [number, number, number][] = [[0, 260, 400], [760, 850, 330], [2170, STOCK_W, 300]];
/** The towers (sway.ts): each one's lean takes its lid out over the next gap; narrower lids as it goes. */
const T = (lx: number, h: number, w: number, lean: number, tiers: string[], lid: string): TowerDef => ({ x: SL(lx), y: STOCK.floor, h, w, lean, tiers, lid, pit: true });
export const STOCK_TOWERS: TowerDef[] = [
  T(420, 380, 96, 0.5, ['#F4F2FA', '#DC3442', '#2A5CBC', '#F4F2FA', '#D8A818'], '#C8924A'),
  T(1040, 410, 88, 0.5, ['#2A5CBC', '#F6D23A', '#DC3442', '#F4F2FA', '#2A5CBC'], '#C8924A'),
  T(1440, 330, 80, 0.55, ['#DC3442', '#F4F2FA', '#D8A818', '#2A5CBC'], '#C8924A'),
  T(1820, 380, 72, 0.5, ['#F6D23A', '#2A5CBC', '#F4F2FA', '#DC3442', '#F4F2FA'], '#C8924A'),
];
/** Where he drops in (feet, under the hatch), the heart canister's plinth (its middle, on the last stack), the cannon. */
const DROP = { x: SL(120), y: SH(CEIL_H - 110) };
export const HEART_X = SL(2265), HEART_Y = SH(300), CANNON_X = SL(2410);
/** Out of the sky over the Rose Garden, straight down onto its bench (past the arrow; nobody near, the thorns clear). */
const DEST = { x: X((BENCH.a + BENCH.b) / 2), y: Y(BENCH.h) }, EXIT = { x: DEST.x, y: Y(760) };
/** Once the screen's down (the real stage), the sky's the lighting grid (a solid: out of the sky he came down on top of
 *  it and stuck there): he's shot up out of a stage trap in the floor past the bench instead, onto the bench, the arc's
 *  top well under the grid. */
const EXIT_REAL = { x: X(10790), y: GY };
/** Where he's kept on screen down here (the camera's row: low enough to see the chute's dark under the lids). */
export const STOCK_ROW = 340;
/** The find, in the save. */
export const FIND_LAND = 'cartoon', FIND_ID = 'health-giftshop';
/** The Rose Garden's checkpoint (layout.ts CHECKPOINTS): his from the moment he goes in. */
const GARDEN_CP = 26;

/** He's down in the stockroom (or on his way out of it). */
export const inStock = (state: GameState) => {
  const p = state.player, cx = p.pos.x + p.width / 2;
  return p.pos.y + p.height > GY + 1600 && cx > STOCK.a - 200 && cx < STOCK.b + 200;
};

// ---------------------------------------------------------------------------------------------------------------
// State (keyed on state.stage: rebuilt with the stage on every death)

export interface Shop {
  towers: Tower[];
  /** The cannon in use: the show's (out of the sky) or, once the screen's down, the real stage's (up out of a trap). */
  cannon: Cannon; cannonShow: Cannon; cannonReal: Cannon;
  /** The heart canister's on its plinth (not found on this save); its card, up. */
  heart: boolean; card: HealthCard | null;
  /** This life: his lines said; the fall's begun (the yell, the whistle). */
  inSaid: boolean; leanSaid: boolean; falling: boolean;
  upWas: boolean; upBuf?: number;
}
const shops = new WeakMap<object, Shop>();
export const shopOf = (state: GameState): Shop | null => shops.get((state.stage ?? state) as object) ?? null;

/** In the section's build: the stockroom's stacks and walls, its towers, the cannon. */
export const buildGiftShop = (state: GameState) => {
  for (const [a, b, h] of STACKS) solid(state, SL(a), SH(h), b - a, h + 600, { hidden: true, tag: `wh1-stock-${a}` });
  // (the end walls, from over the ceiling to under the dark)
  solid(state, STOCK.a - 60, SH(CEIL_H + 400), 60, CEIL_H + 1200, { hidden: true, tag: 'wh1-stock-l' });
  solid(state, SL(STOCK_W), SH(CEIL_H + 400), 60, CEIL_H + 1200, { hidden: true, tag: 'wh1-stock-r' });
  const show = makeCannon(CANNON_X, SH(300), EXIT, DEST);
  shops.set((state.stage ?? state) as object, {
    towers: makeTowers(state, STOCK_TOWERS),
    cannon: show, cannonShow: show, cannonReal: makeCannon(CANNON_X, SH(300), EXIT_REAL, DEST),
    heart: !healthWon(FIND_LAND, FIND_ID), card: null,
    inSaid: false, leanSaid: false, falling: false, upWas: false,
  });
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame (the section's update, first: the towers lean before he moves)

export const updateGiftShop = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, p = state.player, s = shopOf(state);
  if (!s) return controls;
  // (the show's cannon or the real stage's, by whether the screen's down; never swapped mid-shot)
  const want = state.stageMemo[COLLAPSED_MEMO] ? s.cannonReal : s.cannonShow;
  if (s.cannon !== want && !cannonBusy(s.cannon)) s.cannon = want;
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  const upNow = !!controls.up, upPress = upNow && !s.upWas;
  s.upWas = upNow;
  if (!inStock(state)) {
    // The porch door: up at it, and in
    // (the door and a good step either side, on the porch or hopping: upZone.ts)
    const atDoor = p.health > 0 && !p.inCutscene && Math.abs(cx - DOOR_X) < 56 && onFloorish(feet, GY) && !cannonBusy(s.cannon);
    if (atDoor) setUi({ upPrompt: 'GIFT SHOP' });
    if (upStart(s, upPress, atDoor, p.isGrounded)) { goIn(state); return { ...NO_CONTROLS }; }
    // (on his way back out: the cannon's flight down onto the bench)
    return cannonBusy(s.cannon) ? updateCannon(ctx, s.cannon, controls) : controls;
  }
  updateTowers(ctx, s.towers);
  // (on his feet in here the first time this life: what this place is)
  if (!s.inSaid && p.isGrounded && p.health > 0) { s.inSaid = true; meatheadSays(state, whMust(byPants(state, STOCK_IN)), false); }
  const t = ridingTower(state, s.towers);
  if (t && Math.abs(t.ang) > 0.12 && !s.leanSaid && !s.falling) { s.leanSaid = true; meatheadSays(state, whMust(byPants(state, STOCK_LEAN)), false); }
  // Over the edge: the yell and the whistle on the way down; out of the bottom of the screen, dead (no ejections here)
  if (p.health > 0 && !p.isGrounded && p.vel.y > 0 && feet > SH(200)) {
    if (!s.falling) {
      s.falling = true;
      playSound('fallwhistle', 0.9);
      meatheadSays(state, whMust(byPants(state, STOCK_FALL)), false);
    }
    if (p.pos.y > state.camera.y + CANVAS_HEIGHT + 30 || feet > SH(-300)) {
      // (nothing gets him out of it: not the i-frames, not a breather)
      p.invincibilityTimer = 0;
      hurtPlayer(ctx, 99999, PIT_SRC);
      // (whatever turned the hit aside, it's still the chute that got him: its death screen)
      if (p.health > 0 && !ctx.cheats.invincible) { p.health = 0; state.lastHurt = { source: PIT_SRC, at: state.frame }; }
    }
  }
  let out = controls;
  // The heart canister: touched, it's his (kept for good, the save written), the card up with its buffer
  if (s.card) {
    p.inCutscene = true; p.vel.x = 0;
    out = { ...NO_CONTROLS };
    if (tickHealthCard(s.card, state.frame)) {
      s.card = null; p.inCutscene = false;
      meatheadSays(state, whMust(byPants(state, STOCK_GOT)), false);
    }
  } else if (s.heart && p.health > 0 && !p.inCutscene && Math.abs(cx - HEART_X) < 34 && feet > HEART_Y - 110 && feet < HEART_Y + 6) {
    s.heart = false;
    for (let i = 0; i < 22; i++) state.particles.push({ pos: { x: HEART_X + (Math.random() - 0.5) * 30, y: HEART_Y - 62 + (Math.random() - 0.5) * 30 }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 4 }, life: 34, color: i % 3 ? '#F87171' : '#FFFFFF', size: 4 });
    playSound('twinkle', 0.8, 2);
    if (awardHealth(FIND_LAND, FIND_ID)) { s.card = openHealthCard(); p.inCutscene = true; p.vel.x = 0; out = { ...NO_CONTROLS }; }
  }
  // The cannon: only once the heart's gone (nothing to get in by accident before)
  if (!s.heart && !s.card) {
    out = updateCannon(ctx, s.cannon, out, {
      onBoard: st => meatheadSays(st, whMust(byPants(st, STOCK_BYE)), false),
      onExit: (st, x, y) => {
        // (out of the sky in a puff of gift shop: tissue paper and confetti)
        for (let i = 0; i < 26; i++) st.particles.push({ pos: { x: x + (Math.random() - 0.5) * 50, y: y + 10 }, vel: { x: (Math.random() - 0.5) * 8, y: -2 - Math.random() * 6 }, life: 44, color: ['#DC3442', '#F4F2FA', '#2A5CBC', '#F6D23A'][i % 4], size: 5, grav: 0.3 } as typeof st.particles[number]);
      },
    });
  }
  return out;
};

/** In at the porch door: the shop's bell, and down the hatch into the stockroom; the garden's his checkpoint now. */
const goIn = (state: GameState) => {
  const p = state.player, s = shopOf(state)!;
  playSound('ding', 0.8, 4); playSound('whoosh', 0.6, -6);
  state.checkpoint = Math.max(state.checkpoint, GARDEN_CP);
  teleport(state, DROP.x, DROP.y);
  p.vel.y = 3; p.vel.x = 0; p.facing = 1;
  state.camera.y = SH(STACKS[0][2]) - STOCK_ROW;
  s.falling = false;
};
