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
import { wallSign, postSign, ledgeBox, box, label, ledge, speak, meatheadSays, saidOver } from '../section';
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
    d.barkAt = state.frame + 330 + Math.floor(Math.random() * 200);
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
// Drawing (crude, but each thing reads as itself)

const INK = '#1A0B06';
const ol = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { box(c, x - 1, y - 1, w + 2, h + 2, INK); box(c, x, y, w, h, col); };

/** World space, behind everything: the shop. */
export const drawShop = (c: Ctx, state: GameState, sh: Shop) => {
  const v = state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: CANVAS_HEIGHT };
  const f = state.frame;
  const vis = (a: number, z: number) => z > v.x - 120 && a < v.x + v.w + 120;
  const L0 = Math.max(G.SHOP_X, v.x - 120), R0 = Math.min(G.BALL_DOOR + 200, v.x + v.w + 120);
  if (R0 <= L0) return;
  // The walls: painted rock (it's "hell"), a band of painted flames, plastic stalactites along the top
  box(c, L0, GY - 900, R0 - L0, 460, '#1F0505'); box(c, L0, GY - 440, R0 - L0, 440, '#3B0A0A');
  for (let x = Math.floor(L0 / 60) * 60; x < R0; x += 60) {
    box(c, x + 10, GY - 420 + ((x / 60) % 3) * 30, 24, 14, '#450A0A');
    c.fillStyle = '#5B1414'; c.beginPath(); c.moveTo(x, GY - 440); c.lineTo(x + 30, GY - 440); c.lineTo(x + 15, GY - 404 - ((x / 60) % 2) * 14); c.closePath(); c.fill();
    // (the painted flames: tongues, orange in yellow)
    const h = 50 + ((x / 60) % 3) * 16;
    c.fillStyle = '#9A3412'; c.beginPath(); c.moveTo(x, GY); c.quadraticCurveTo(x + 8, GY - h * 0.6, x + 20, GY - h); c.quadraticCurveTo(x + 26, GY - h * 0.5, x + 40, GY - h * 0.7); c.quadraticCurveTo(x + 46, GY - h * 0.3, x + 60, GY); c.closePath(); c.fill();
    c.fillStyle = '#EA580C'; c.beginPath(); c.moveTo(x + 10, GY); c.quadraticCurveTo(x + 16, GY - h * 0.4, x + 22, GY - h * 0.65); c.quadraticCurveTo(x + 30, GY - h * 0.3, x + 42, GY); c.closePath(); c.fill();
  }
  // The floor: red carpet, a flame-pattern runner down it (lit along its top: walked on)
  box(c, L0, GY, R0 - L0, 400, '#7F1D1D'); box(c, L0, GY, R0 - L0, 4, '#F87171');
  for (let x = Math.floor(L0 / 48) * 48; x < R0; x += 48) { box(c, x, GY + 10, 24, 6, '#9A3412'); box(c, x + 8, GY + 8, 8, 4, '#EA580C'); }
  // The section signs, hung from the ceiling on chains
  for (const [rel, text] of [[150, 'APPAREL OF THE DAMNED'], [850, 'CHECKOUT'], [1900, 'SOUVENIR HALL'], [2780, 'PHOTO WITH SATAN'], [3300, 'CLEARANCE: EVERYTHING MUST BURN'], [3950, 'BALLROOM THIS WAY']] as const) {
    const x = at(rel);
    if (!vis(x - 160, x + 160)) continue;
    box(c, x - 60, GY - 440, 2, 70, '#57534E'); box(c, x + 58, GY - 440, 2, 70, '#57534E');
    wallSign(c, x, GY - 360, text, '#450A0A', '#FDE68A');
  }
  // The racks (and the tipped ones lying across the aisle)
  for (const r of sh.racks) if (vis(r.x - 120, r.x + 60)) drawRack(c, r, f);
  // The stands: counter, display tower, stairs, mezzanine, booth roof, shelf
  for (const [rel, h, w, kind] of STANDS) { const x = at(rel); if (vis(x, x + w)) drawStand(c, x, h, w, kind, f); }
  // The photo booth, the cardboard Satan
  if (vis(at(BOOTH) - 140, at(BOOTH) + 140)) drawBooth(c, sh, f);
  // The pickups' table, its sign on a post
  if (vis(G.PICKUP_X - 80, G.PICKUP_X + 140)) { ol(c, G.PICKUP_X - 50, GY - 8, 100, 8, '#78350F'); postSign(c, G.PICKUP_X + 90, GY, 'FREE SAMPLES', '#450A0A', '#FDE68A'); }
};

const drawStand = (c: Ctx, x: number, h: number, w: number, kind: Stand[3], f: number) => {
  const top = GY - h;
  if (kind === 'counter') {
    // (the checkout: a front panel, the register on top, a pile of I SURVIVED HELL bags)
    ol(c, x, top, w, h, '#7C2D12'); box(c, x + 6, top + 10, w - 12, h - 16, '#9A3412');
    ledgeBox(c, x - 4, top, w + 8, '#57534E', '#FBBF24');
    ol(c, x + 20, top - 26, 40, 26, '#3F3F46'); box(c, x + 24, top - 22, 32, 8, '#22C55E'); for (let i = 0; i < 6; i++) box(c, x + 24 + (i % 3) * 11, top - 12 + Math.floor(i / 3) * 5, 8, 3, '#A1A1AA');
    ol(c, x + 120, top - 18, 22, 18, '#F8FAFC'); box(c, x + 124, top - 14, 14, 3, '#DC2626');
  } else if (kind === 'tower') {
    // (a tall glass display case of snow globes, stood on)
    ol(c, x + 8, top + 16, w - 16, h - 16, '#1F2937'); box(c, x + 12, top + 20, w - 24, h - 24, '#BAE6FD');
    for (let k = 0; k < 3; k++) { box(c, x + 12, top + 40 + k * 32, w - 24, 3, '#E5E7EB'); for (let j = 0; j < 3; j++) { c.fillStyle = '#7DD3FC'; c.beginPath(); c.arc(x + 26 + j * 28, top + 32 + k * 32, 7, 0, Math.PI * 2); c.fill(); box(c, x + 20 + j * 28, top + 37 + k * 32, 12, 3, INK); } }
    ledgeBox(c, x, top, w, '#78350F', '#FBBF24');
  } else if (kind === 'stair') {
    ol(c, x, top + 14, w, h - 14, '#57534E'); ledgeBox(c, x, top, w, '#78350F', '#FBBF24');
  } else if (kind === 'mezz') {
    // (the mezzanine: a walkway on posts, a railing along its front, posters on the wall behind it)
    for (let px = x + 20; px < x + w; px += 160) ol(c, px, top + 16, 10, h - 16, '#44403C');
    ledgeBox(c, x, top, w, '#57534E', '#FBBF24');
    box(c, x, top - 30, w, 3, '#A16207'); for (let px = x; px <= x + w; px += 20) box(c, px, top - 30, 2, 30, '#A16207');
    for (const [px, col] of [[x + 100, '#DC2626'], [x + 420, '#7C3AED'], [x + 700, '#16A34A']] as const) { ol(c, px, top - 140, 60, 80, col); box(c, px + 18, top - 120, 24, 24, '#FDE68A'); box(c, px + 10, top - 86, 40, 4, '#FDE68A'); }
  } else if (kind === 'shelf') {
    ol(c, x + 8, top + 16, 10, h - 16, '#44403C'); ol(c, x + w - 18, top + 16, 10, h - 16, '#44403C');
    ledgeBox(c, x, top, w, '#78350F', '#FBBF24');
    for (let i = 0; i < 5; i++) ol(c, x + 8 + i * 24, top - 14, 16, 14, ['#DC2626', '#F8FAFC', '#18181B', '#FDE047', '#DC2626'][i]);
  } else if (kind === 'booth') { /* drawn with the booth */ }
  void f;
};

const drawBooth = (c: Ctx, sh: Shop, f: number) => {
  const x = at(BOOTH), top = GY - 150;
  // The booth: a box, its roof stood on, the curtain (drawn back while he's in it), the camera's window, the slot
  ol(c, x - 55, top, 110, 150, '#1F2937');
  ledgeBox(c, x - 55, top, 110, '#374151', '#FBBF24');
  box(c, x - 46, top + 26, 92, 6, '#FDE047');
  label(c, '4 PHOTOS $5', x, top + 46, '#FDE047', 6);
  const open = sh.booth.t >= 0;
  box(c, x - 30, top + 54, 60, 96, '#0B0B0D');
  if (!open) { box(c, x - 30, top + 54, 60, 96, '#7F1D1D'); for (let i = 0; i < 6; i++) box(c, x - 30 + i * 10, top + 54, 2, 96, '#991B1B'); }
  else { box(c, x + 18, top + 54, 12, 96, '#7F1D1D'); }
  // (the flash)
  const t = sh.booth.t;
  if (t >= 0 && [30, 60, 90, 120].some(k => t >= k && t < k + 5)) { c.fillStyle = 'rgba(255, 255, 255, 0.8)'; c.fillRect(x - 80, top - 20, 160, 180); }
  // (the slot, the strip hanging out of it: four frames, him in each, Satan's cardboard horns behind)
  box(c, x + 40, top + 90, 14, 4, INK);
  if (sh.booth.strip) {
    ol(c, x + 41, top + 94, 12, 46, '#F8FAFC');
    for (let k = 0; k < 4; k++) { box(c, x + 43, top + 96 + k * 11, 8, 9, '#57534E'); box(c, x + 45, top + 98 + k * 11, 4, 4, '#E8B48A'); box(c, x + 43, top + 96 + k * 11, 2, 3, '#DC2626'); box(c, x + 49, top + 96 + k * 11, 2, 3, '#DC2626'); }
  }
  // The cardboard Satan beside it: horns, a grin, a hole to put your face in, propped on its stand
  const sx = x + 100;
  c.fillStyle = INK; c.beginPath(); c.moveTo(sx - 26, GY); c.lineTo(sx - 22, GY - 130); c.lineTo(sx - 18, GY - 160); c.lineTo(sx - 10, GY - 140); c.lineTo(sx + 10, GY - 140); c.lineTo(sx + 18, GY - 160); c.lineTo(sx + 22, GY - 130); c.lineTo(sx + 26, GY); c.closePath(); c.fill();
  c.fillStyle = '#B91C1C'; c.beginPath(); c.moveTo(sx - 24, GY - 2); c.lineTo(sx - 20, GY - 128); c.lineTo(sx - 17, GY - 154); c.lineTo(sx - 9, GY - 138); c.lineTo(sx + 9, GY - 138); c.lineTo(sx + 17, GY - 154); c.lineTo(sx + 20, GY - 128); c.lineTo(sx + 24, GY - 2); c.closePath(); c.fill();
  c.fillStyle = '#0B0B0D'; c.beginPath(); c.ellipse(sx, GY - 114, 9, 11, 0, 0, Math.PI * 2); c.fill();
  box(c, sx - 12, GY - 96, 24, 3, '#FDE047'); box(c, sx - 2, GY - 80, 4, 40, '#7F1D1D');
  box(c, sx + 20, GY - 60, 30, 4, '#78350F');
  void f;
};

const drawRack = (c: Ctx, r: Rack, f: number) => {
  if (r.broken) {
    // (in bits on the floor)
    for (let i = 0; i < 6; i++) box(c, r.x - RACK_W + i * 14, GY - 4 - (i % 2) * 3, 10, 3, ['#A1A1AA', '#DC2626', '#18181B'][i % 3]);
    return;
  }
  c.save(); c.translate(r.x, GY - (r.down ? 34 * r.fall * r.fall : 0));
  // (tipped: over toward him, onto its side across the aisle)
  if (r.down) c.rotate(-(Math.PI / 2) * (r.fall * r.fall));
  // The stand: a T of chrome pipe on a cross foot
  box(c, -3, -96, 6, 96, '#A1A1AA'); box(c, -2, -96, 2, 96, '#E4E4E7');
  box(c, -34, -98, 68, 5, '#A1A1AA'); box(c, -18, -3, 36, 3, '#71717A');
  if (r.kind === 'shirts') for (let i = 0; i < 5; i++) {
    // (tees on hangers: the hook, the shoulders, the sleeves, the print)
    const sx = -30 + i * 13, col = ['#18181B', '#DC2626', '#18181B', '#F8FAFC', '#DC2626'][i];
    box(c, sx + 5, -96, 2, 4, '#E4E4E7');
    c.fillStyle = INK; c.beginPath(); c.moveTo(sx - 2, -91); c.lineTo(sx + 14, -91); c.lineTo(sx + 16, -84); c.lineTo(sx + 12, -84); c.lineTo(sx + 12, -64); c.lineTo(sx, -64); c.lineTo(sx, -84); c.lineTo(sx - 4, -84); c.closePath(); c.fill();
    c.fillStyle = col; c.beginPath(); c.moveTo(sx - 1, -90); c.lineTo(sx + 13, -90); c.lineTo(sx + 14.5, -85); c.lineTo(sx + 11, -85); c.lineTo(sx + 11, -65); c.lineTo(sx + 1, -65); c.lineTo(sx + 1, -85); c.lineTo(sx - 2.5, -85); c.closePath(); c.fill();
    box(c, sx + 3, -80, 6, 4, col === '#F8FAFC' ? '#DC2626' : '#FDE047');
  }
  if (r.kind === 'horns') for (let i = 0; i < 4; i++) { const hx = -26 + i * 15; box(c, hx, -86, 12, 2, INK); for (const k of [0, 8]) { c.fillStyle = '#DC2626'; c.beginPath(); c.moveTo(hx + k, -86); c.lineTo(hx + k + 2, -94); c.lineTo(hx + k + 4, -86); c.closePath(); c.fill(); } box(c, hx + 5, -84, 2, 10, '#A1A1AA'); }
  if (r.kind === 'globes') for (let i = 0; i < 4; i++) { const gx = -22 + i * 15; box(c, gx - 5, -80, 11, 4, INK); c.fillStyle = INK; c.beginPath(); c.arc(gx, -86, 6, 0, Math.PI * 2); c.fill(); c.fillStyle = '#BAE6FD'; c.beginPath(); c.arc(gx, -86, 5, 0, Math.PI * 2); c.fill(); box(c, gx - 1, -88, 2, 3, '#DC2626'); box(c, gx - 3, -89, 1, 1, '#FFFFFF'); }
  if (r.kind === 'forks') { ol(c, -16, -40, 32, 40, '#78350F'); box(c, -16, -30, 32, 3, '#451A03'); box(c, -16, -14, 32, 3, '#451A03'); for (let i = 0; i < 5; i++) { box(c, -14 + i * 7, -96, 2, 56, '#991B1B'); box(c, -16 + i * 7, -100, 6, 2, '#D4D4D8'); box(c, -16 + i * 7, -106, 1, 6, '#D4D4D8'); box(c, -13.5 + i * 7, -106, 1, 6, '#D4D4D8'); box(c, -11 + i * 7, -106, 1, 6, '#D4D4D8'); } }
  c.restore();
  // (its price sign on a little stand beside it, standing up)
  if (!r.down) { const t = r.kind === 'shirts' ? 'I SURVIVED HELL TEES $25' : r.kind === 'forks' ? 'PITCHFORKS $15' : r.kind === 'horns' ? 'HORNS $5' : 'SNOW GLOBES $12'; box(c, r.x + 40, GY - 40, 3, 40, '#57534E'); c.font = '6px "Press Start 2P"'; const w = c.measureText(t).width + 8; ol(c, r.x + 41 - w / 2, GY - 56, w, 14, '#FEF3C7'); label(c, t, r.x + 41, GY - 46, '#7F1D1D', 6); }
  void f;
};

/** World space, in front: Donnie, his barrels, his words. */
export const drawShopFront = (c: Ctx, state: GameState, sh: Shop) => {
  const f = state.frame;
  for (const b of sh.barrels) {
    if (b.dead) continue;
    // (a wooden barrel on its side, rolling: its hoops going round, pitchfork tines out the end)
    c.save(); c.translate(b.x, GY - BARREL_R); c.rotate(b.spin);
    c.fillStyle = INK; c.beginPath(); c.arc(0, 0, BARREL_R + 1, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#92400E'; c.beginPath(); c.arc(0, 0, BARREL_R, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#57534E'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, BARREL_R - 4, 0, Math.PI * 2); c.stroke();
    for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2; box(c, Math.cos(a) * 8 - 1, Math.sin(a) * 8 - 1, 3, 3, '#D4D4D8'); }
    c.restore();
  }
  const d = sh.d;
  if (d && d.mode !== 'gone') {
    const pose = d.mode === 'throw' ? (d.throwT < 14 ? 'reach' : 'panic') : d.mode === 'wait' || d.mode === 'door' ? 'panic' : 'run';
    drawDonnie(c, d.x, GY, d.facing, f, pose, 0, { wig: true, cape: true, fangs: true, held: d.mode === 'throw' && d.throwT < 14 && SPOTS[d.spot]?.what === 'globes' ? null : null });
    if (sh.said) saidOver(c, sh.said, d.x, GY - DONNIE_H - 14, '#FDE68A');
  }
};
