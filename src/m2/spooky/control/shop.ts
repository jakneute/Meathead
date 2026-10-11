// THE GIFT SHOP OF THE DAMNED: the chase. Donnie runs ahead of Meathead through it, and throws the shop at him on the
// way: racks tipped over across the aisle (jump them, or charge through them), snow globes lobbed back over his
// shoulder, a barrel of souvenir pitchforks rolled back at him (jump it, or charge it to bits). Each taught on its own
// first, then mixed with the staff. He never throws anything Meathead can't see coming: at each of his spots he waits,
// looking back, till Meathead's close enough to see it, then does it.
//
// The beats, left to right (x from the shop's start):
//   0     APPAREL      tee racks; one clerk (the pitchfork: teaches not charging them); Donnie tips the first rack.
//   700   CHECKOUT     the counter (stand on it) and a display tower above it, a hawker up on the tower (the globes:
//                      teaches the arc), a small health up there; Donnie lobs his own globes back at the far end.
//   1300  SOUVENIR HALL  two ways through: stairs up to a mezzanine (a hawker on it, a small ammo and a small health),
//                      or the floor under it (two clerks, and Donnie's first barrel rolled back down it).
//   2500  PHOTO BOOTH  the mascot in front of the booth (over him off its roof, or through him); step into the booth and
//                      it takes your picture: the flash, the strip of four out of the slot.
//   3100  THE GAUNTLET Donnie all at once (a rack, globes, a barrel) with a clerk and a hawker on a shelf.
//   3750  REST         the big health and ammo; the ballroom's doors; Donnie's last line, and in.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { EnemyKind, Block } from '../../../m1/types';
import { ledge, speak, meatheadSays, saidOver } from '../section';
import { GY } from '../geometry';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { playSound } from '../../../m1/game/platform/audio';
import { say, pickLine } from '../../../m1/game/platform/speech';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { shakeScreen } from '../../../m1/game/core/state';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { registerHurtLines } from '../../kinds';
import { drawDonnie, DONNIE_H } from '../../cast/donnie';
import { voice } from '../section';
import { CLERK, HAWKER, MASCOT, throwGlobe, staffTalking, setStaffHush } from './staff';
import { hazardVictims, hazardHit, boxHits, setHazardZones } from '../../hazardHit';
import * as L from './lines';
import { INK, box, text, slab, pole, ball, sign, rampOf, checker, stamp, eyeOf, at as at3, quad, inked, standTop, plaque, type Eye } from './paint';
import { drawShopRoom, hangingSign } from './shopArt';
import { drawPartitionSide } from './room';

type Ctx = CanvasRenderingContext2D;
const pick = pickLine;
const dressed = (state: GameState): L.Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');

/** Where the shop runs (set by the section: index.ts). */
export interface ShopGeo { SHOP_X: number; BALL_DOOR: number; PICKUP_X: number }
let G: ShopGeo = { SHOP_X: 0, BALL_DOOR: 0, PICKUP_X: 0 };
export const setShopGeo = (g: ShopGeo) => { G = g; };
const at = (rel: number) => G.SHOP_X + rel;

const BARREL = 'm2:spk_barrel';
registerHurtLines(BARREL, L.HURT_BARREL, L.DEATH_BARREL);

// ---------------------------------------------------------------------------------------------------------------
// The layout (x from the shop's start)

/** Things he stands on: [x, height of its top off the floor, width, what it is]. */
type Stand = [number, number, number, 'counter' | 'tower' | 'stair' | 'mezz' | 'booth' | 'shelf'];
const STANDS: Stand[] = [
  [760, 64, 200, 'counter'], [1000, 140, 110, 'tower'],
  [1330, 60, 90, 'stair'], [1440, 115, 90, 'stair'], [1560, 170, 880, 'mezz'],
  [2700, 150, 110, 'booth'],
  [3420, 110, 130, 'shelf'],
];
/** The racks along the floor (background, till Donnie tips one): x, what's on it, and whether he tips it. */
const RACKS: { rel: number; kind: 'shirts' | 'horns' | 'forks' | 'globes'; tip: boolean }[] = [
  { rel: 200, kind: 'shirts', tip: false }, { rel: 330, kind: 'shirts', tip: true }, { rel: 560, kind: 'horns', tip: false },
  { rel: 1200, kind: 'globes', tip: false }, { rel: 1750, kind: 'forks', tip: false }, { rel: 2200, kind: 'horns', tip: false },
  { rel: 3000, kind: 'shirts', tip: false }, { rel: 3200, kind: 'shirts', tip: true }, { rel: 3600, kind: 'globes', tip: false },
];
/** Donnie's spots: where he stops (looking back) till Meathead's near enough to see it, then what he throws. */
const SPOTS: { rel: number; what: 'rack' | 'globes' | 'barrel'; rack?: number }[] = [
  { rel: 420, what: 'rack', rack: 1 }, { rel: 1300, what: 'globes' }, { rel: 2420, what: 'barrel' },
  { rel: 3260, what: 'rack', rack: 7 }, { rel: 3330, what: 'globes' }, { rel: 3700, what: 'barrel' },
];
/** The booth (step in: it takes your picture). */
const BOOTH = 2755;

// ---------------------------------------------------------------------------------------------------------------
// The state

interface Rack { x: number; kind: typeof RACKS[number]['kind']; tip: boolean; fall: number; down: boolean; block: Block | null; broken: boolean }
interface Barrel { x: number; vx: number; spin: number; dead: number }
export interface Shop {
  /** Donnie, ahead: where, which way, what he's at; his next spot; his throw (frames into it). */
  d: { x: number; facing: 1 | -1; mode: 'run' | 'jog' | 'wait' | 'throw' | 'door' | 'gone'; spot: number; throwT: number; barkAt: number; doorSaid: boolean } | null;
  said: string | null;
  racks: Rack[]; barrels: Barrel[];
  booth: { t: number; strip: number; used: boolean };
  gags: boolean[];
}
export const makeShop = (): Shop => ({
  d: null, said: null,
  racks: RACKS.map(r => ({ x: at(r.rel), kind: r.kind, tip: r.tip, fall: 0, down: false, block: null, broken: false })),
  barrels: [], booth: { t: -1, strip: 0, used: false }, gags: [false, false, false, false],
});

/** Donnie off up ahead (`from`: where he starts; `wait`: stood looking back for him). */
export const startChase = (state: GameState, sh: Shop, from: number, wait: boolean) => {
  sh.d = { x: from, facing: wait ? -1 : 1, mode: wait ? 'wait' : 'run', spot: SPOTS.findIndex(s => at(s.rel) > from), throwT: 0, barkAt: state.frame + 200, doorSaid: false };
  if (sh.d.spot < 0) sh.d.spot = SPOTS.length;
  // (anything he'd already have thrown over: over)
  for (const s of SPOTS) if (at(s.rel) <= from && s.what === 'rack' && s.rack !== undefined) tipRack(state, sh.racks[s.rack], true);
  setStaffHush(() => !!sh.said);
};
/** Once the land's cleared: the racks he tipped are still over. */
export const shopAftermath = (state: GameState, sh: Shop) => { for (const r of sh.racks) if (r.tip) tipRack(state, r, true); };

// ---------------------------------------------------------------------------------------------------------------
// Building it

export const buildShop = (state: GameState) => {
  for (const [rel, h, w] of STANDS) ledge(state, at(rel), GY - h, w, { hidden: true, tag: 'shop-stand' });
  const put = (kind: string, rel: number, variant: number, feet = GY) => { const e = makeKindEnemy(kind as EnemyKind, at(rel), feet); e.variant = variant; e.facing = -1; state.enemies.push(e); };
  // APPAREL: the clerk (the pitchfork's taught alone)
  put(CLERK, 560, 0);
  // CHECKOUT: the hawker up on the display tower (the arc, taught alone)
  put(HAWKER, 1055, 1, GY - 140);
  // SOUVENIR HALL: the mezzanine's hawker; the floor's two clerks
  put(HAWKER, 2050, 2, GY - 170);
  put(CLERK, 1820, 3); put(CLERK, 2150, 4);
  // PHOTO BOOTH: the mascot in front of it
  put(MASCOT, 2600, 5);
  // THE GAUNTLET: a clerk on the floor, a hawker up on the shelf, another clerk after
  put(CLERK, 3360, 6); put(HAWKER, 3485, 7, GY - 110); put(CLERK, 3640, 8);
  // The small pickups up the risky ways: the display tower, the mezzanine (two)
  const small = (id: string, rel: number, h: number, type: 'small_health' | 'small_ammo') => state.pickups.push({ id, pos: { x: at(rel), y: GY - h - 18 }, vel: { x: 0, y: 0 }, width: 16, height: 16, type, life: 1e9 } as never);
  small('shop-tower-health', 1020, 140, 'small_health');
  small('shop-mezz-ammo', 1780, 170, 'small_ammo');
  small('shop-mezz-health', 2380, 170, 'small_health');
  // REST: the big health and the big ammo, before the ballroom's doors
  state.pickups.push(
    { id: 'control-health', pos: { x: G.PICKUP_X - 30, y: GY - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_health', life: 1e9 } as never,
    { id: 'control-ammo', pos: { x: G.PICKUP_X + 10, y: GY - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_ammo', life: 1e9 } as never,
  );
};

// ---------------------------------------------------------------------------------------------------------------
// The racks: tipped across the aisle (a low wall: jump it, or charge through it)

const RACK_W = 84, RACK_H = 56;
const tipRack = (state: GameState, r: Rack, instant = false) => {
  if (r.down || r.broken) return;
  r.down = true; r.fall = instant ? 1 : 0.001;
  r.block = { x: r.x - RACK_W - 6, y: GY - RACK_H, w: RACK_W, h: RACK_H, type: 'wall', hidden: true, tag: 'shop-rack' } as Block;
  state.blocks.push(r.block);
  if (!instant) { playSound('crash', 0.7, 2); playSound('whoosh', 0.5, -2); }
};
const charging = (state: GameState) => { const p = state.player; return !!(p.isCharging || p.isSliding || p.isUppercutting || p.isDivekicking); };
const smash = (state: GameState, x: number, y: number, cols: string[]) => {
  playSound('crash', 0.8, 0); playSound('crunch', 0.6, 4); shakeScreen(state, 5, 3);
  for (let i = 0; i < 16; i++) state.particles.push({ pos: { x, y }, vel: { x: (Math.random() - 0.3) * 6, y: -2 - Math.random() * 5 }, life: 40, color: cols[i % cols.length], size: 3 + Math.random() * 4, grav: 0.35 });
};
const tickRacks = (ctx: FrameContext, sh: Shop) => {
  const { state } = ctx, p = state.player;
  // (where the ones he'll tip come down: the staff keep out from under them)
  setHazardZones(state, 'shop-racks', sh.racks.filter(r => r.tip && !(r.down && r.fall >= 1)).map(r => ({ x0: r.x - RACK_W - 6, x1: r.x - 6, y0: GY - RACK_H - 40, y1: GY })));
  for (const r of sh.racks) {
    if (r.down && r.fall < 1) {
      r.fall = Math.min(1, r.fall + 0.09); if (r.fall >= 1) { playSound('thud', 0.8, -2); shakeScreen(state, 3, 2); }
      // (coming down on one of the staff: flat under it)
      if (r.fall > 0.5) for (const e of hazardVictims(state, { flyers: false })) if (boxHits(e, r.x - RACK_W - 6, GY - RACK_H, RACK_W, RACK_H)) hazardHit(ctx, e, 60, r.x - 6, 'FLATTENED!', { knock: 6 });
    }
    // (charged into: through it, in bits)
    const b = r.block;
    if (b && charging(state) && p.pos.x + p.width > b.x - 8 && p.pos.x < b.x + b.w + 8 && p.pos.y + p.height > b.y - 4) {
      state.blocks = state.blocks.filter(o => o !== b); r.block = null; r.broken = true;
      smash(state, b.x + b.w / 2, GY - 20, ['#DC2626', '#18181B', '#F8FAFC', '#A1A1AA']);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The barrels: rolled back at him (jump them, or charge them to bits)

const BARREL_R = 16;
const tickBarrels = (ctx: FrameContext, sh: Shop) => {
  const { state } = ctx, p = state.player;
  for (const b of sh.barrels) {
    if (b.dead) { b.dead++; continue; }
    b.x += b.vx; b.spin += b.vx / BARREL_R;
    if (state.frame % 8 === 0) playSound('land', 0.25, -6);
    const left = b.x - BARREL_R, right = b.x + BARREL_R;
    // (into one of the tipped racks: it bursts on it)
    const hit = sh.racks.find(r => r.block && right > r.block.x && left < r.block.x + r.block.w);
    if (hit || b.x < G.SHOP_X + 20) { b.dead = 1; smash(state, b.x, GY - 16, ['#78350F', '#991B1B', '#D4D4D8']); continue; }
    // (one of the staff in its way: bowled over, and the pitchforks all over the floor)
    const e = hazardVictims(state, { flyers: false }).find(o => boxHits(o, left, GY - BARREL_R * 2, BARREL_R * 2, BARREL_R * 2));
    if (e) { hazardHit(ctx, e, 45, b.x - Math.sign(b.vx) * 30, 'BOWLED OVER!', { knock: 9 }); b.dead = 1; smash(state, b.x, GY - 16, ['#78350F', '#991B1B', '#D4D4D8']); continue; }
    const over = p.pos.x + p.width > left && p.pos.x < right && p.pos.y + p.height > GY - BARREL_R * 2 + 4;
    if (!over || p.health <= 0 || state.deathTimer > 0) continue;
    if (charging(state)) { b.dead = 1; smash(state, b.x, GY - 16, ['#78350F', '#991B1B', '#D4D4D8']); continue; }
    if (p.invincibilityTimer <= 0) { hurtPlayer(ctx, 10, BARREL, { x: Math.sign(b.vx) * 5, y: -6 }, 14); b.dead = 1; smash(state, b.x, GY - 16, ['#78350F', '#991B1B', '#D4D4D8']); }
  }
  sh.barrels = sh.barrels.filter(b => b.dead < 30);
};

// ---------------------------------------------------------------------------------------------------------------
// Donnie, ahead

const RUN = 5.4, JOG = 3.2;
/** How near Meathead has to be before Donnie does his thing at a spot (so it's seen coming). */
const SEEN = 560;
const tickDonnie = (state: GameState, sh: Shop) => {
  const d = sh.d;
  if (!d || d.mode === 'gone') return;
  const px = state.player.pos.x + state.player.width / 2, gap = d.x - px;
  const spot = SPOTS[d.spot];
  if (d.mode === 'throw') {
    // (the throw: a beat to turn and wind up, it goes, a beat after)
    d.throwT++; d.facing = -1;
    const s = spot!;
    if (d.throwT === 14) {
      if (s.what === 'rack' && s.rack !== undefined) tipRack(state, sh.racks[s.rack]);
      if (s.what === 'barrel') { sh.barrels.push({ x: d.x - 30, vx: -4.4, spin: 0, dead: 0 }); playSound('thud', 0.7, -4); }
    }
    if (s.what === 'globes' && (d.throwT === 14 || d.throwT === 30 || d.throwT === 46)) throwGlobe(state, d.x - 10, GY - 80, 40);
    if (d.throwT >= (s.what === 'globes' ? 58 : 30)) { d.spot++; d.mode = 'run'; }
    return;
  }
  // (Meathead's got to the ballroom's doors (they stand open) before him: he bolts for them, past everything, and
  // through: they slam behind him before Meathead's through)
  if (px > G.BALL_DOOR - 400) {
    d.mode = 'run'; d.facing = 1; d.x = Math.max(d.x, G.BALL_DOOR - 650) + RUN * 2.6;
    if (d.x >= G.BALL_DOOR) { d.mode = 'gone'; playSound('slam', 0.9); shakeScreen(state, 4, 3); }
    return;
  }
  // At his next spot: wait (looking back) till Meathead's near enough to see it
  if (spot && d.x >= at(spot.rel)) {
    d.x = at(spot.rel);
    if (gap < SEEN) { d.mode = 'throw'; d.throwT = 0; if (!sh.said && !staffTalking() && Math.random() < 0.5) bark(state, sh, L.DONNIE_THROW); }
    else { d.mode = 'wait'; d.facing = -1; }
    return;
  }
  d.mode = gap < 380 ? 'run' : gap > 680 ? 'wait' : 'jog';
  if (d.mode !== 'wait') { d.x += gap < 120 ? RUN * 1.6 : d.mode === 'run' ? RUN : JOG; d.facing = 1; } else d.facing = -1;
  if (spot && d.x > at(spot.rel)) d.x = at(spot.rel);
  // (over his shoulder, now and then: one voice at a time)
  if (state.frame >= d.barkAt && d.x < G.BALL_DOOR - 500 && !sh.said && !staffTalking()) {
    d.barkAt = state.frame + 480 + Math.floor(Math.random() * 240);
    bark(state, sh, L.DONNIE_CHASE);
  }
  // (at the ballroom's doors: his piece, waiting for him there; then in)
  if (d.x >= G.BALL_DOOR - 260 && !d.doorSaid && gap < 500) {
    d.doorSaid = true;
    speak('m2.donnie', pick(L.DONNIE_DOOR[dressed(state)]), s => { sh.said = s?.text ?? null; }, true);
  }
  if (d.x > G.BALL_DOOR - 260 && (!d.doorSaid || sh.said)) { d.x = G.BALL_DOOR - 260; d.facing = -1; d.mode = 'door'; }
  if (d.x >= G.BALL_DOOR) { d.mode = 'gone'; playSound('slam', 0.9); shakeScreen(state, 4, 3); }
};
const bark = (state: GameState, sh: Shop, lines: L.ByPants) => {
  const text = pick(lines[dressed(state)]);
  say(text, voice('m2.donnie'), 'casual', {
    always: true,
    onShow: spoken => { sh.said = text; if (!spoken) setTimeout(() => { if (sh.said === text) sh.said = null; }, Math.max(1800, text.length * 65)); },
    onHide: () => { if (sh.said === text) sh.said = null; },
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The photo booth: step in, the flash (three), the strip out of the slot

const tickBooth = (state: GameState, sh: Shop) => {
  const p = state.player, px = p.pos.x + p.width / 2, b = sh.booth;
  const inside = Math.abs(px - at(BOOTH)) < 26 && p.isGrounded && p.pos.y + p.height >= GY - 2;
  if (inside && b.t < 0 && !b.used) { b.t = 0; b.used = true; playSound('beep', 0.6, 8); }
  if (b.t >= 0) {
    b.t++;
    if (b.t === 30 || b.t === 60 || b.t === 90 || b.t === 120) { playSound('click', 0.8, 6); playSound('ding', 0.3, 12); }
    if (b.t === 150) { playSound('alert', 0.4, 10); b.strip = 1; meatheadSays(state, L.MEATHEAD_SHOP[2], false); }
    if (b.t > 400) b.t = -1;
  }
};

/** Each frame. */
export const tickShop = (ctx: FrameContext, sh: Shop) => {
  const { state } = ctx, p = state.player, px = p.pos.x + p.width / 2;
  tickDonnie(state, sh);
  tickRacks(ctx, sh);
  tickBarrels(ctx, sh);
  tickBooth(state, sh);
  // (the merchandise: his say on it, each the once, as he goes by; one voice at a time)
  ([[200, 0], [540, 3], [1700, 1]] as const).forEach(([rel, i]) => { if (!sh.gags[i] && px > at(rel) && px < at(rel) + 200) { sh.gags[i] = true; if (!sh.said) meatheadSays(state, L.MEATHEAD_SHOP[i], false); } });
};
export const shopDonnieGone = (sh: Shop) => !sh.d || sh.d.mode === 'gone';
export const shopDonnieOut = (sh: Shop) => { if (sh.d) sh.d.mode = 'gone'; };

// ---------------------------------------------------------------------------------------------------------------
// Drawing: the room (shopArt.ts), its signs, then its stuff at his plane, each stood-on thing's top lit along its
// front (and its top and near side going back, the one eye's way: paint.ts)

/** World space, behind everything: the shop. */
export const drawShop = (c: Ctx, state: GameState, sh: Shop) => {
  const v = state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: CANVAS_HEIGHT };
  const eye = eyeOf(state);
  const vis = (a: number, z: number) => z > v.x - 120 && a < v.x + v.w + 120;
  // (the room: its back wall on from the staff door, behind the wall between)
  const L0 = Math.max(G.SHOP_X - 60, v.x - 160), R0 = Math.min(G.BALL_DOOR + 400, v.x + v.w + 160);
  if (R0 <= L0) return;
  drawShopRoom(c, state, eye, L0, R0);
  drawPartitionSide(c, state, 1);
  // The section signs, hung from the ceiling on chains
  for (const [rel, words] of [[250, 'APPAREL OF THE DAMNED'], [850, 'CHECKOUT'], [1900, 'SOUVENIR HALL'], [2780, 'PHOTO WITH SATAN'], [3300, 'CLEARANCE: EVERYTHING MUST BURN'], [3870, 'BALLROOM THIS WAY']] as const) {
    const x = at(rel);
    if (vis(x - 180, x + 180)) hangingSign(c, x, words);
  }
  // The stands: counter, display tower, stairs, mezzanine, booth roof, shelf
  for (const [rel, h, w, kind] of STANDS) { const x = at(rel); if (vis(x - 40, x + w + 40)) drawStand(c, eye, x, h, w, kind); }
  // The racks (and the tipped ones lying across the aisle)
  for (const r of sh.racks) if (vis(r.x - 120, r.x + 100)) drawRack(c, r);
  // The photo booth, the cardboard Satan
  if (vis(at(BOOTH) - 160, at(BOOTH) + 160)) drawBooth(c, eye, sh);
  // The pickups' table, its sign on a post
  if (vis(G.PICKUP_X - 170, G.PICKUP_X + 60)) stamp(c, 'shop-samples', G.PICKUP_X - 160, GY - 110, 220, 112, paintSamples);
};

const DB = 0.95;
/** A solid thing at his plane, x to x + w, `top` to `bottom`: its near side and its top going back to DB, then its
 *  front (stamped by `key`), its lip lit if it's stood on. */
const standBlock = (c: Ctx, eye: Eye, x: number, top: number, w: number, col: string, key: string, front: (g: Ctx) => void, lip: string | null, bottom = GY) => {
  const r = rampOf(col);
  const side = eye.x < x ? x : eye.x > x + w ? x + w : null;
  if (side !== null) {
    const a = at3(eye, side, top, 1), b = at3(eye, side, top, DB), cc = at3(eye, side, bottom, DB), d = at3(eye, side, bottom, 1);
    quad(c, INK, [a[0], a[1] - 1], [b[0], b[1] - 1], [cc[0], cc[1] + 1], [d[0], d[1] + 1]);
    quad(c, r[1], a, b, cc, d);
  }
  if (eye.y < top) {
    const a = at3(eye, x, top, 1), b = at3(eye, x + w, top, 1), cc = at3(eye, x + w, top, DB), d = at3(eye, x, top, DB);
    quad(c, INK, [a[0] - 1, a[1]], [b[0] + 1, b[1]], [cc[0] + 1, cc[1] - 1], [d[0] - 1, d[1] - 1]);
    quad(c, lip ? rampOf(lip)[1] : r[2], a, b, cc, d);
  }
  stamp(c, key, x - 4, top - 4, w + 8, bottom - top + 8, g => { front(g); if (lip) standTop(g, x, top, w, col, lip); });
};

const ROCKY = '#6B2418';

const drawStand = (c: Ctx, eye: Eye, x: number, h: number, w: number, kind: Stand[3]) => {
  const top = GY - h;
  if (kind === 'counter') {
    standBlock(c, eye, x, top, w, '#1F1F24', 'shop-counter', g => {
      // (the checkout: black laminate, flame decals along it, a kick strip)
      slab(g, x, top, w, h, '#1F1F24', { edge: 2 });
      for (let k = 0; k < 6; k++) flameDecal(g, x + 10 + k * 32, GY - 12, 22 + (k % 2) * 10, 22);
      box(g, x + 2, GY - 8, w - 4, 6, '#0E0E10');
      box(g, x + 70, top + 14, 60, 12, '#FDE68A'); text(g, 'PAY HERE', x + 100, top + 23, '#7F1D1D', 6, 'center', null);
    }, '#B45309');
    // (on it: the register, the pile of I SURVIVED HELL bags, a tub of horns at the end)
    stamp(c, 'shop-register', x + 10, top - 40, 190, 40, g => {
      slab(g, x + 20, top - 26, 40, 26, '#3F3F46', { edge: 2 });
      box(g, x + 24, top - 22, 32, 8, '#14532D'); text(g, '$666', x + 40, top - 15, '#4ADE80', 6, 'center', null);
      for (let i = 0; i < 6; i++) box(g, x + 25 + (i % 3) * 11, top - 11 + Math.floor(i / 3) * 5, 8, 3, '#A1A1AA');
      for (let i = 0; i < 3; i++) { slab(g, x + 116 + i * 9, top - 18 - i * 2, 20, 18 + i * 2, '#F1EFEA', { edge: 2 }); box(g, x + 120 + i * 9, top - 12 - i * 2, 12, 3, '#DC2626'); }
      slab(g, x + 156, top - 14, 30, 14, '#27272A', { edge: 2 });
      for (let i = 0; i < 4; i++) { box(g, x + 159 + i * 7, top - 19, 2, 5, '#DC2626'); box(g, x + 162 + i * 7, top - 19, 2, 5, '#DC2626'); }
    });
  } else if (kind === 'tower') {
    standBlock(c, eye, x, top, w, '#1F2937', 'shop-tower', g => {
      // (a tall glass case of snow globes: the frame, the glass, the shelves, the globes on their bases, glints)
      slab(g, x + 6, top + 6, w - 12, h - 6, '#1F2937', { edge: 4 });
      box(g, x + 12, top + 14, w - 24, h - 24, '#5A8FB0');
      box(g, x + 12, top + 14, w - 24, 8, '#7FB2D0'); checker(g, x + 12, top + 22, w - 24, 2, '#7FB2D0');
      for (let k = 0; k < 3; k++) {
        const sy = top + 42 + k * 32;
        box(g, x + 12, sy, w - 24, 3, '#D9E3EA'); box(g, x + 12, sy + 3, w - 24, 1, '#2A4A60');
        for (let j = 0; j < 3; j++) { const gx = x + 30 + j * 25; box(g, gx - 6, sy - 5, 12, 5, INK); box(g, gx - 5, sy - 4, 10, 3, '#3F2A1C'); ball(g, gx, sy - 11, 6, '#BAE6FD'); box(g, gx - 1, sy - 12, 3, 4, '#EA580C'); }
      }
      for (let k = 0; k < 3; k++) box(g, x + 20 + k * 6, top + 20 + k * 30, 3, 40, 'rgba(255, 255, 255, 0.25)');
      box(g, x + 12, GY - 12, w - 24, 8, '#111827');
    }, '#A16207');
  } else if (kind === 'stair') {
    standBlock(c, eye, x, top, w, ROCKY, `shop-stair-${h}`, g => {
      // (foam rock steps: painted, a seam up the middle)
      slab(g, x, top, w, h, ROCKY, { edge: 4 });
      for (let k = 0; k < Math.floor(h / 24); k++) for (let j = 0; j < 3; j++) { const bx = x + 8 + j * 26 + (k % 2) * 8, by = top + 16 + k * 24; box(g, bx, by, 16, 10, rampOf(ROCKY)[1]); box(g, bx, by, 16, 2, rampOf(ROCKY)[3]); }
      box(g, x + w / 2, top + 8, 1, h - 8, rampOf(ROCKY)[0]);
    }, '#D97706');
  } else if (kind === 'mezz') {
    // (the mezzanine: a steel walkway on posts, a railing along its front)
    for (let px = x + 20; px < x + w; px += 160) { c.save(); c.translate(px, 0); stamp(c, 'shop-mezz-post', -4, top + 6, 22, h - 4, g => { pole(g, 0, top + 8, 10, h - 8, '#44403C'); box(g, -3, GY - 4, 16, 4, '#27272A'); }); c.restore(); }
    standBlock(c, eye, x, top, w, '#3F3A36', 'shop-mezz', g => {
      slab(g, x, top, w, 16, '#3F3A36', { edge: 2 });
      for (let k = 0; k < w; k += 40) box(g, x + k, top + 8, 1, 8, '#2A2522');
    }, '#CA8A04', top + 16);
    stamp(c, 'shop-mezz-rail', x - 2, top - 34, w + 4, 34, g => {
      slab(g, x, top - 32, w, 4, '#A16207', { edge: 1 });
      for (let px = x; px <= x + w; px += 20) { box(g, px, top - 28, 3, 28, INK); box(g, px, top - 28, 2, 28, '#A16207'); }
      box(g, x, top - 14, w, 2, '#854D0E');
    });
  } else if (kind === 'shelf') {
    standBlock(c, eye, x, top, w, '#44403C', 'shop-shelf', g => {
      // (a gondola: uprights, pegboard, a low shelf of plush devils, a peg of horns; its top's stood on)
      box(g, x + 4, top + 8, w - 8, h - 8, '#2A2522');
      for (let yy = top + 14; yy < GY - 10; yy += 8) for (let xx = x + 10; xx < x + w - 8; xx += 8) box(g, xx, yy, 1, 1, '#120E0C');
      pole(g, x + 6, top + 6, 8, h - 6, '#71717A'); pole(g, x + w - 14, top + 6, 8, h - 6, '#71717A');
      slab(g, x + 4, GY - 44, w - 8, 6, '#57534E', { edge: 1 });
      for (let i = 0; i < 4; i++) plush(g, x + 24 + i * 26, GY - 44);
      for (let i = 0; i < 3; i++) { box(g, x + 26 + i * 34, top + 40, 2, 10, '#A1A1AA'); slab(g, x + 20 + i * 34, top + 50, 14, 18, '#DC2626', { edge: 1 }); box(g, x + 23 + i * 34, top + 56, 8, 2, '#FDE68A'); }
    }, '#B45309');
    stamp(c, 'shop-shelf-top', x, top - 18, w, 18, g => { for (let i = 0; i < 5; i++) slab(g, x + 8 + i * 24, top - 14, 16, 14, ['#DC2626', '#F1EFEA', '#18181B', '#F59E0B', '#DC2626'][i], { edge: 2 }); });
  }
};

/** A flame decal (a sticker): red, orange, yellow, no ink. */
const flameDecal = (g: Ctx, x: number, y: number, h: number, w: number) => {
  const t = (k: number, col: string) => { g.fillStyle = col; g.beginPath(); g.moveTo(x + w * (0.5 - 0.5 * k), y); g.lineTo(x + w * 0.5 - w * 0.3 * k, y - h * 0.55 * k); g.lineTo(x + w * 0.45, y - h * k); g.lineTo(x + w * 0.62, y - h * 0.6 * k); g.lineTo(x + w * (0.5 + 0.4 * k), y - h * 0.35 * k); g.lineTo(x + w * (0.5 + 0.5 * k), y); g.closePath(); g.fill(); };
  t(1, '#B91C1C'); t(0.7, '#EA580C'); t(0.4, '#FBBF24');
};
/** A plush devil, sat (feet at x, y). */
const plush = (g: Ctx, x: number, y: number) => {
  inked(g, () => g.ellipse(x, y - 7, 7, 7, 0, 0, Math.PI * 2), '#DC2626', 2);
  inked(g, () => g.ellipse(x, y - 17, 6, 5, 0, 0, Math.PI * 2), '#EF4444', 2);
  box(g, x - 5, y - 25, 2, 4, '#FDE68A'); box(g, x + 3, y - 25, 2, 4, '#FDE68A');
  box(g, x - 3, y - 18, 2, 2, INK); box(g, x + 1, y - 18, 2, 2, INK); box(g, x - 2, y - 15, 4, 1, INK);
};

const paintSamples = (g: Ctx) => {
  const px = G.PICKUP_X;
  // (a folding table, a paper cloth on it; FREE SAMPLES on a sign on a post)
  slab(g, px - 50, GY - 10, 100, 6, '#7F1D1D', { edge: 1 });
  box(g, px - 50, GY - 4, 100, 2, '#F1EFEA');
  box(g, px - 44, GY - 4, 3, 4, '#3F3F46'); box(g, px + 41, GY - 4, 3, 4, '#3F3F46');
  pole(g, px - 92, GY - 76, 5, 76, '#57534E');
  plaque(g, px - 90, GY - 88, 'FREE SAMPLES', '#450A0A', '#FDE68A');
};

const drawBooth = (c: Ctx, eye: Eye, sh: Shop) => {
  const x = at(BOOTH), top = GY - 150;
  standBlock(c, eye, x - 55, top, 110, '#2A1A3A', 'shop-booth', g => {
    // The booth: a cabinet, its marquee of bulbs, the camera's window, the slot (the curtain's drawn live)
    slab(g, x - 55, top, 110, 150, '#2A1A3A', { edge: 4 });
    slab(g, x - 48, top + 12, 96, 30, '#18181B', { edge: 2 });
    for (let i = 0; i < 11; i++) { box(g, x - 46 + i * 9, top + 13, 3, 3, '#FDE047'); box(g, x - 46 + i * 9, top + 38, 3, 3, '#FDE047'); }
    text(g, 'PHOTOS', x, top + 32, '#F9A8D4', 8, 'center', '#831843');
    text(g, '4 FOR $5', x, top + 52, '#FDE047', 6, 'center', INK);
    box(g, x - 32, top + 56, 64, 94, '#0B0B0D');
    slab(g, x + 38, top + 84, 14, 12, '#3F3F46', { edge: 1 }); box(g, x + 40, top + 90, 10, 2, INK);
  }, '#A16207');
  const open = sh.booth.t >= 0;
  // (the curtain: red velvet in folds; drawn back while he's in it)
  if (!open) { box(c, x - 32, top + 56, 64, 94, '#7F1D1D'); for (let i = 0; i < 8; i++) { box(c, x - 32 + i * 8, top + 56, 3, 94, '#991B1B'); box(c, x - 29 + i * 8, top + 56, 1, 94, '#B91C1C'); } box(c, x - 32, top + 56, 64, 3, '#450A0A'); }
  else { box(c, x + 18, top + 56, 14, 94, '#7F1D1D'); box(c, x + 21, top + 56, 3, 94, '#991B1B'); box(c, x + 26, top + 56, 1, 94, '#B91C1C'); }
  // (the flash)
  const t = sh.booth.t;
  if (t >= 0 && [30, 60, 90, 120].some(k => t >= k && t < k + 5)) { c.fillStyle = 'rgba(255, 255, 255, 0.8)'; c.fillRect(x - 80, top - 20, 160, 180); }
  // (the strip hanging out of the slot: four frames, him in each, the cardboard horns behind)
  if (sh.booth.strip) {
    box(c, x + 40, top + 95, 14, 48, INK); box(c, x + 41, top + 96, 12, 46, '#F8FAFC');
    for (let k = 0; k < 4; k++) { box(c, x + 43, top + 98 + k * 11, 8, 9, '#57534E'); box(c, x + 45, top + 100 + k * 11, 4, 5, '#E8B48A'); box(c, x + 43, top + 98 + k * 11, 2, 3, '#DC2626'); box(c, x + 49, top + 98 + k * 11, 2, 3, '#DC2626'); }
  }
  // The cardboard Satan beside it: horns, the grin, the hole to put your face in; its easel behind it
  stamp(c, 'shop-satan', x + 66, GY - 166, 76, 168, paintSatan);
};

const paintSatan = (g: Ctx) => {
  const sx = at(BOOTH) + 100;
  g.strokeStyle = '#8A6A44'; g.lineWidth = 3; g.beginPath(); g.moveTo(sx + 4, GY - 90); g.lineTo(sx + 30, GY); g.stroke();
  const shape = () => { g.moveTo(sx - 26, GY); g.lineTo(sx - 22, GY - 128); g.lineTo(sx - 18, GY - 160); g.lineTo(sx - 10, GY - 140); g.lineTo(sx + 10, GY - 140); g.lineTo(sx + 18, GY - 160); g.lineTo(sx + 22, GY - 128); g.lineTo(sx + 26, GY); g.closePath(); };
  // (its cardboard edge, then the print: a red guy, darker down his right, a lit edge up his left; a black suit)
  g.save(); g.translate(3, 0); inked(g, shape, '#A8865A', 2); g.restore();
  inked(g, shape, '#B91C1C', 2);
  g.save(); g.beginPath(); shape(); g.clip();
  box(g, sx + 8, GY - 170, 30, 170, '#8E1414'); checker(g, sx + 4, GY - 170, 4, 170, '#8E1414');
  box(g, sx - 30, GY - 170, 8, 170, '#D93A2E');
  box(g, sx - 30, GY - 60, 60, 60, '#18181B'); box(g, sx - 30, GY - 60, 60, 2, '#3F3F46');
  g.restore();
  g.fillStyle = INK; g.beginPath(); g.ellipse(sx, GY - 114, 10, 12, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#0B0B0D'; g.beginPath(); g.ellipse(sx, GY - 114, 9, 11, 0, 0, Math.PI * 2); g.fill();
  box(g, sx - 9, GY - 132, 6, 3, INK); box(g, sx + 3, GY - 132, 6, 3, INK);
  box(g, sx - 12, GY - 98, 24, 4, INK); box(g, sx - 11, GY - 97, 22, 2, '#FDE047');
  box(g, sx - 4, GY - 92, 8, 6, '#18181B'); box(g, sx - 3, GY - 88, 6, 6, '#18181B');
  box(g, sx - 2, GY - 80, 4, 20, '#7F1D1D');
  text(g, 'SAY CHEESE', sx, GY - 30, '#FDE68A', 6, 'center', INK);
};

// ---------------------------------------------------------------------------------------------------------------
// The racks: a T of chrome pipe on a cross foot, and what's on it (painted round its foot, 0, 0)

const paintRackBody = (g: Ctx, kind: Rack['kind']) => {
  pole(g, -3, -96, 6, 94, '#A1A1AA');
  slab(g, -36, -100, 72, 5, '#B4B4BC', { edge: 1 });
  slab(g, -20, -4, 40, 4, '#71717A', { edge: 1 });
  ball(g, -36, -98, 3, '#D4D4D8'); ball(g, 36, -98, 3, '#D4D4D8');
  if (kind === 'shirts') for (let i = 0; i < 5; i++) {
    // (tees on hangers: the hook, the shoulders, the sleeves, the print)
    const sx = -31 + i * 13, col = ['#18181B', '#B91C1C', '#18181B', '#E7E5E4', '#B91C1C'][i], r = rampOf(col);
    box(g, sx + 5, -96, 2, 4, '#E4E4E7');
    const tee = () => { g.moveTo(sx - 2, -91); g.lineTo(sx + 14, -91); g.lineTo(sx + 16, -84); g.lineTo(sx + 12, -83); g.lineTo(sx + 12, -60); g.lineTo(sx, -60); g.lineTo(sx, -83); g.lineTo(sx - 4, -84); g.closePath(); };
    inked(g, tee, col, 2);
    box(g, sx, -88, 3, 27, r[3]); box(g, sx + 9, -84, 3, 23, r[1]); box(g, sx - 1, -90, 15, 1, r[4]);
    box(g, sx + 3, -79, 6, 5, col === '#E7E5E4' ? '#B91C1C' : '#F59E0B'); box(g, sx + 4, -78, 4, 1, '#FDE68A');
  }
  if (kind === 'horns') for (let i = 0; i < 4; i++) {
    const hx = -27 + i * 15;
    box(g, hx + 5, -96, 2, 6, '#A1A1AA');
    box(g, hx - 1, -90, 14, 4, INK); box(g, hx, -89, 12, 2, '#18181B');
    for (const k of [0, 8]) { inked(g, () => { g.moveTo(hx + k, -89); g.lineTo(hx + k + 2, -99); g.lineTo(hx + k + 4, -89); g.closePath(); }, '#DC2626', 1); box(g, hx + k + 1, -94, 1, 3, '#F87171'); }
    for (let j = 0; j < 2; j++) { box(g, hx + 2, -82 + j * 18, 9, 4, INK); box(g, hx + 3, -81 + j * 18, 7, 2, '#DC2626'); box(g, hx + 3, -84 + j * 18, 1, 3, '#DC2626'); box(g, hx + 9, -84 + j * 18, 1, 3, '#DC2626'); }
  }
  if (kind === 'globes') {
    slab(g, -32, -60, 64, 4, '#57534E', { edge: 1 });
    for (let i = 0; i < 4; i++) { const gx = -22 + i * 15; box(g, gx - 6, -66, 12, 6, INK); box(g, gx - 5, -65, 10, 4, '#3F2A1C'); ball(g, gx, -73, 6, '#BAE6FD'); box(g, gx - 1, -75, 3, 4, '#EA580C'); }
    for (let i = 0; i < 3; i++) { const gx = -15 + i * 15; box(g, gx - 6, -88, 12, 6, INK); box(g, gx - 5, -87, 10, 4, '#3F2A1C'); ball(g, gx, -95 + 2, 5, '#BAE6FD'); }
  }
  if (kind === 'forks') {
    // (a barrel of souvenir pitchforks: staves, hoops, tines up out of it)
    for (let i = 0; i < 5; i++) { box(g, -14 + i * 7, -100, 2, 64, '#7F1D1D'); box(g, -16 + i * 7, -104, 6, 2, '#D4D4D8'); for (const t of [0, 2.5, 5]) box(g, -16 + i * 7 + t, -110, 1, 6, '#D4D4D8'); }
    slab(g, -18, -42, 36, 42, '#8A4A1C', { edge: 3 });
    for (const y of [-34, -14]) { box(g, -18, y, 36, 4, INK); box(g, -17, y + 1, 34, 2, '#71717A'); }
    box(g, -6, -40, 1, 40, '#5A2E0E'); box(g, 6, -40, 1, 40, '#5A2E0E');
  }
};
const RACK_TAG: Record<Rack['kind'], string> = { shirts: 'HELL TEES $25', forks: 'PITCHFORKS $15', horns: 'HORNS $5', globes: 'SNOW GLOBES $12' };

const drawRack = (c: Ctx, r: Rack) => {
  if (r.broken) {
    // (in bits on the floor: pipe, hangers, tees)
    for (let i = 0; i < 7; i++) { const bx = r.x - RACK_W + i * 13; box(c, bx - 1, GY - 5 - (i % 2) * 3, 12, 5, INK); box(c, bx, GY - 4 - (i % 2) * 3, 10, 3, ['#A1A1AA', '#B91C1C', '#18181B', '#E7E5E4'][i % 4]); }
    return;
  }
  if (!r.down) {
    // (standing: the rack and its price card on a little stand beside it, both stamped)
    c.save(); c.translate(r.x, 0);
    stamp(c, `shop-rack-${r.kind}`, -44, GY - 116, 190, 118, g => {
      g.save(); g.translate(0, GY); paintRackBody(g, r.kind); g.restore();
      const t = RACK_TAG[r.kind];
      pole(g, 40, GY - 44, 3, 44, '#57534E');
      g.font = '6px "Press Start 2P"'; const w = Math.ceil(g.measureText(t).width) + 10;
      sign(g, 41 - w / 2, GY - 58, w, 14, '#FEF3C7', t, '#7F1D1D', 6);
    });
    c.restore();
    return;
  }
  // (tipped: over toward him, onto its side across the aisle)
  c.save(); c.translate(r.x, GY - 34 * r.fall * r.fall); c.rotate(-(Math.PI / 2) * (r.fall * r.fall));
  paintRackBody(c, r.kind);
  c.restore();
};

/** World space, in front: Donnie, his barrels, his words. */
export const drawShopFront = (c: Ctx, state: GameState, sh: Shop) => {
  const f = state.frame;
  for (const b of sh.barrels) {
    if (b.dead) continue;
    // (a wooden barrel on its side, rolling at him, its end on: staves and hoops going round, pitchfork tines out of
    // it; lit from up on the left whichever way it's turned)
    const r = BARREL_R;
    c.fillStyle = INK; c.beginPath(); c.arc(b.x, GY - r, r + 1.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#6B3412'; c.beginPath(); c.arc(b.x, GY - r, r, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#8A4A1C'; c.beginPath(); c.arc(b.x - 1.5, GY - r - 1.5, r - 3, 0, Math.PI * 2); c.fill();
    c.save(); c.translate(b.x, GY - r); c.rotate(b.spin);
    c.strokeStyle = '#4A220A'; c.lineWidth = 1;
    for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI; c.beginPath(); c.moveTo(Math.cos(a) * (r - 3), Math.sin(a) * (r - 3)); c.lineTo(-Math.cos(a) * (r - 3), -Math.sin(a) * (r - 3)); c.stroke(); }
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; box(c, Math.cos(a) * 7 - 1.5, Math.sin(a) * 7 - 1.5, 3, 3, '#D4D4D8'); }
    c.restore();
    c.strokeStyle = '#71717A'; c.lineWidth = 2; c.beginPath(); c.arc(b.x, GY - r, r - 1, 0, Math.PI * 2); c.stroke();
    c.fillStyle = '#B08050'; c.beginPath(); c.arc(b.x - 5, GY - r - 6, 3, 0, Math.PI * 2); c.fill();
  }
  const d = sh.d;
  if (d && d.mode !== 'gone') {
    const pose = d.mode === 'throw' ? (d.throwT < 14 ? 'reach' : 'panic') : d.mode === 'wait' || d.mode === 'door' ? 'panic' : 'run';
    drawDonnie(c, d.x, GY, d.facing, f, pose, 0, { wig: true, cape: true, fangs: true, held: d.mode === 'throw' && d.throwT < 14 && SPOTS[d.spot]?.what === 'globes' ? null : null });
    if (sh.said) saidOver(c, sh.said, d.x, GY - DONNIE_H - 14, '#FDE68A');
  }
};
