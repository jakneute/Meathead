// Sawdust Gulch's and the mines' hazards (each taught alone first, then built on; every one hurts the cast too, and
// keeps them out of its way while it's live: hazardHit.ts's zones):
//
//   TIMBER!         a feller chops a prop pine (thunks, chips flying, TIMBER!: the tell) and it comes down the way it
//                   leans: whoever's under it is flattened. Down in the water, it floats off; on land it lies there.
//   THE HEAD SAW    the sawmill's: belt one carries him (and its logs) right into it; belt two runs back at him with
//                   logs on it (they shove him: jump them, or ride them). The blade cuts the logs (sawdust) and him.
//   CAVE-INS        under a cracked bit of the mine's ceiling: dust trickling and a creak (the tell), then the rocks.
//                   The rubble's not in the way, and clears; it can come down again a while later.
//   ORE CHUTES      in the ceiling: a rattle and a trickle (the tell), then a ton of ore.
//   RUNAWAY CARTS   down the cart track, right to left: the rumble and a lamp at the right edge (the tell), then the
//                   cart, fast; into the buffer at the bottom. Jump them or get up into an alcove.
//   THE RIDE CART   over the trestle's chasm: stand in it and it goes to the other end (it comes to whichever end he's
//                   waiting at); the LOW BEAMS over the track: duck, or they clout him.
//   COVER           the showdown's trough and barrels: shots stop in them (his and theirs).
//
// And the water: the mill ponds and the flooded sump (swimming and drowning are index.ts's).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { WaterBody } from '../../../m1/game/stages/index';
import { playSound } from '../../../m1/game/platform/audio';
import { heard } from '../../bossQuiet';
import { shakeScreen } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { pickLine } from '../../../m1/game/platform/speech';
import { hazardVictims, hazardHit, boxHits, setHazardZones, type Zone } from '../../hazardHit';
import { makeMover, moveMover, riding } from '../../foreign/movers';
import { ledge, meatheadSays, byPants } from '../section';
import { drawLog } from '../wilds/logs';
import { box, mix, INK, hash, type Ctx } from '../kit';
import { hr, PLY, TIMBER, STEEL, TOPLIP } from './paint';
import { drawMineBitsArt, drawCartArt, drawRockArt, drawDumpArt, drawPileArt } from './mine';
import { onScreen, viewOf } from './view';
import { townOf } from './state';
import { WATERS, PINES, CAVEINS, CHUTES, CART_RUN, RIDE, BEAMS, BEAM_GAP, HEAD_UP, HEAD_DUCKED, BELTS, SAW, MILL_DECK, COVER, CHASM, FY, CEIL_Y, X, Y } from './layout';
import { CARTS, RIDE_CART } from './lines';

const AWAY = -99999;

// ---------------------------------------------------------------------------------------------------------------
// The water

export const waterAt = (x: number, y: number): WaterBody | null => {
  for (const w of WATERS) if (x > w.a && x < w.b && y > w.surface - 14 && y < w.bed + 10) return { key: w.key, x1: w.a, x2: w.b, surface: w.surface, bottom: w.bed, kind: 'clean' };
  return null;
};
/** Walkers keep out of the water (they stop at its edge); every frame. */
export const waterZones = (state: GameState) =>
  setHazardZones(state, 'fr-town-water', WATERS.map(w => ({ x0: w.a, x1: w.b, y0: w.surface - 30, y1: w.bed, ground: true })));
export const layWaterSteps = (state: GameState) => {
  for (const w of WATERS) { ledge(state, w.a, w.surface + 26, 50, { hidden: true }); ledge(state, w.b - 50, w.surface + 26, 50, { hidden: true }); }
};

// ---------------------------------------------------------------------------------------------------------------
// Building

export const buildHazards = (state: GameState) => {
  const tw = townOf(state);
  tw.pines = PINES.map(([rx, h, dir, len]) => ({ x: X(rx), y: Y(h), dir, len, state: 'up', t: 0, by: null, water: false }));
  tw.caves = CAVEINS.map(([rx, half]) => ({ x: X(rx), half, state: 'quiet', t: 0, rocks: [] }));
  tw.chutes = CHUTES.map(rx => ({ x: X(rx), state: 'quiet', t: 0, pile: 0 }));
  tw.ride = { m: makeMover(state, RIDE.a, FY - 34, RIDE.w, 'fr-ride-cart'), x: RIDE.a, v: 0, at: 'a', goal: RIDE.a, hitCd: 0 };
  moveMover(state, tw.ride.m, RIDE.a, FY - 34);
  tw.beltLogs = [];
  // (the cover: walls to stand behind and on)
  for (const [a, b, h] of COVER) state.blocks.push({ x: X(a), y: Y(h), w: X(b) - X(a), h, type: 'wall', hidden: true, tag: 'fr-cover' });
};

// ---------------------------------------------------------------------------------------------------------------
// TIMBER!

const FALL = 32;
const pineSpan = (p: { x: number; dir: number; len: number }) => [Math.min(p.x, p.x + p.dir * p.len), Math.max(p.x, p.x + p.dir * p.len)] as const;

export const updatePines = (ctx: FrameContext) => {
  const { state } = ctx, tw = townOf(state), pl = state.player;
  const zones: Zone[] = [];
  for (const p of tw.pines) {
    p.t++;
    const [a, b] = pineSpan(p);
    if (p.state === 'chop') {
      zones.push({ x0: a, x1: b, y0: p.y - 60, y1: p.y, ground: true });
      // (the feller's been stopped: it stays up)
      if (!p.by || p.by.health <= 0 || p.by.aiState !== 'chop') { p.state = 'up'; p.by = null; }
    } else if (p.state === 'fall') {
      zones.push({ x0: a, x1: b, y0: p.y - 60, y1: p.y, ground: true });
      if (p.t === FALL) {
        // (down: whoever's under it)
        const water = WATERS.find(w => (a + b) / 2 > w.a && (a + b) / 2 < w.b);
        p.water = !!water;
        playSound(p.water ? 'splash' : 'crash', 1, -6); shakeScreen(state, 8, 4);
        for (let n = 0; n < 16; n++) state.particles.push({ pos: { x: a + Math.random() * (b - a), y: p.y - 10 }, vel: { x: (Math.random() - 0.5) * 4, y: -2 - Math.random() * 3 }, life: 30, color: p.water ? '#E0F2FE' : n % 2 ? '#2F5A2A' : '#C8A070', size: 3 + Math.random() * 3 });
        const top = p.y - 60;
        if (pl.health > 0 && !pl.inCutscene && pl.pos.x + pl.width > a && pl.pos.x < b && pl.pos.y + pl.height > top && pl.pos.y < p.y + 30) {
          pl.invincibilityTimer = 0;
          hurtPlayer(ctx, 18, 'm2:fr_timber', { x: p.dir * 4, y: -3 });
        }
        for (const e of hazardVictims(state)) if (e !== p.by && boxHits(e, a, top, b - a, 90)) hazardHit(ctx, e, 50, p.x, 'TIMBER!', { knock: 8 });
      }
      if (p.t > FALL) { p.state = 'down'; p.t = 0; }
    } else if (p.state === 'down' && p.water && p.t > 90) p.t = 90;
  }
  setHazardZones(state, 'fr-timber', zones);
};

/** A prop pine (the park's: a plywood cutout painted too regular, its raw ply edge showing, on a 4x4 trunk, a brace
 *  behind): standing, shaking as it's chopped (the notch, chips), falling, down. */
const drawPine = (c: Ctx, p: ReturnType<typeof townOf>['pines'][number], f: number) => {
  let ang = 0;
  if (p.state === 'chop') ang = Math.sin(f * 0.8) * 0.02;
  else if (p.state === 'fall') ang = (p.t / FALL) ** 2 * (Math.PI / 2) * p.dir;
  else if (p.state === 'down') ang = (Math.PI / 2) * p.dir;
  const P = hr('ply', PLY), G = hr('ppine', ['#0E2414', '#18381E', '#22502A', '#2E6636', '#3E7E44', '#56985A', '#78B278']), T = hr('timber', TIMBER);
  // (the brace behind it while it stands)
  if (p.state === 'up' || p.state === 'chop') { c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(p.x - p.dir * 4, p.y - p.len * 0.45); c.lineTo(p.x - p.dir * p.len * 0.32, p.y); c.stroke(); c.strokeStyle = P[2]; c.lineWidth = 3; c.stroke(); box(c, p.x - p.dir * p.len * 0.32 - 8, p.y - 6, 16, 6, INK); box(c, p.x - p.dir * p.len * 0.32 - 7, p.y - 5, 14, 5, '#8A7A5A'); }
  if (p.state === 'down' && p.water) { c.globalAlpha = Math.max(0, 1 - p.t / 90); }
  c.save(); c.translate(p.x, p.y + (p.state === 'down' && p.water ? 22 : 0)); c.rotate(ang);
  // (the trunk: a 4x4 post, lit down its left, its notch)
  box(c, -6, -p.len * 0.42, 12, p.len * 0.42, INK); box(c, -5, -p.len * 0.42, 10, p.len * 0.42, T[3]); box(c, -5, -p.len * 0.42, 3, p.len * 0.42, T[5]); box(c, 2, -p.len * 0.42, 3, p.len * 0.42, T[1]);
  if (p.state === 'chop' || p.state === 'fall') { c.fillStyle = INK; c.beginPath(); c.moveTo(p.dir > 0 ? 6 : -6, -26); c.lineTo(0, -19); c.lineTo(p.dir > 0 ? 6 : -6, -12); c.closePath(); c.fill(); c.fillStyle = '#E8C890'; c.beginPath(); c.moveTo(p.dir > 0 ? 5 : -5, -24); c.lineTo(p.dir > 0 ? 1 : -1, -19); c.lineTo(p.dir > 0 ? 5 : -5, -14); c.closePath(); c.fill(); }
  // (the cutout's tiers: its raw ply edge offset right and down (the sheet's thickness), then the paint in two greens
  // and a lit flank, brushed needles)
  const tiers = 5;
  const tierPts = (k: number): [number, number][] => { const y = -p.len + 6 + k * (p.len * 0.62) / tiers, w = 24 + k * 13; return [[0, y - 18], [w / 2, y + 16], [-w / 2, y + 16]]; };
  for (let k = 0; k < tiers; k++) { const tp = tierPts(k); c.fillStyle = P[4]; c.beginPath(); tp.forEach(([x, y], i) => (i ? c.lineTo(x + 3, y + 1) : c.moveTo(x + 3, y + 1))); c.closePath(); c.fill(); }
  for (let k = 0; k < tiers; k++) {
    const tp = tierPts(k);
    c.fillStyle = INK; c.beginPath(); tp.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke(); c.fill();
    c.fillStyle = G[2 + (k % 2)]; c.beginPath(); c.moveTo(tp[0][0], tp[0][1] + 2); c.lineTo(tp[1][0] - 1, tp[1][1] - 1); c.lineTo(tp[2][0] + 1, tp[2][1] - 1); c.closePath(); c.fill();
    c.fillStyle = G[4]; c.beginPath(); c.moveTo(tp[0][0], tp[0][1] + 3); c.lineTo(tp[2][0] + 3, tp[2][1] - 1); c.lineTo(tp[0][0] - 3, tp[2][1] - 1); c.closePath(); c.fill();
    for (let n = 0; n < 4; n++) box(c, -6 + n * 4, tp[1][1] - 6 - (n % 2) * 3, 2, 3, G[5]);
    box(c, tp[2][0] + 2, tp[2][1] - 2, tp[1][0] - tp[2][0] - 4, 1, G[1]);
  }
  c.restore();
  c.globalAlpha = 1;
  // (its stump once it's down: the cut lit, the rings)
  if (p.state === 'down' || p.state === 'fall') { box(c, p.x - 7, p.y - 12, 14, 12, INK); box(c, p.x - 6, p.y - 11, 12, 11, T[3]); box(c, p.x - 6, p.y - 11, 12, 2, '#E8C890'); box(c, p.x - 3, p.y - 11, 6, 1, '#B08A5A'); }
};

// ---------------------------------------------------------------------------------------------------------------
// The mine: cave-ins, ore chutes, runaway carts, the ride cart and its beams

const CAVE_TELL = 64, CAVE_FALL = 50, RUBBLE = 200, CAVE_REARM = 360;
const CHUTE_TELL = 44, CHUTE_DUMP = 34, CHUTE_EVERY = 170;

export const updateMine = (ctx: FrameContext) => {
  const { state } = ctx, tw = townOf(state), p = state.player;
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  const down = feet > FY - 220 && feet < FY + 40 && p.health > 0;
  const zones: Zone[] = [];
  // (cave-ins: he's under it)
  for (const cv of tw.caves) {
    cv.t++;
    if (cv.state === 'quiet') { if (down && Math.abs(cx - cv.x) < cv.half + 10 && cv.t > CAVE_REARM) { cv.state = 'tell'; cv.t = 0; playSound('rumble', 0.6, 4); } }
    else if (cv.state === 'tell') {
      zones.push({ x0: cv.x - cv.half, x1: cv.x + cv.half, y0: CEIL_Y, y1: FY });
      if (cv.t % 6 === 0) state.particles.push({ pos: { x: cv.x - cv.half + Math.random() * cv.half * 2, y: CEIL_Y + 4 }, vel: { x: 0, y: 1.5 + Math.random() }, life: 40, color: '#A8A29E', size: 2 });
      if (cv.t % 20 === 0) playSound('crack', 0.4, -8 + cv.t / 8);
      if (cv.t >= CAVE_TELL) {
        cv.state = 'fall'; cv.t = 0; playSound('crash', 0.9, -8); shakeScreen(state, 10, 5);
        cv.rocks = Array.from({ length: 7 }, (_, i) => ({ x: cv.x - cv.half + (i + 0.5) * (cv.half * 2 / 7) + (Math.random() - 0.5) * 8, y: CEIL_Y + Math.random() * 20, vy: Math.random() * 2, r: 9 + Math.random() * 7 }));
      }
    } else if (cv.state === 'fall') {
      zones.push({ x0: cv.x - cv.half, x1: cv.x + cv.half, y0: CEIL_Y, y1: FY });
      for (const r of cv.rocks) {
        if (r.y < FY - r.r) { r.vy += 0.5; r.y = Math.min(FY - r.r, r.y + r.vy); }
        if (r.y < FY - r.r - 2) {
          if (p.health > 0 && p.invincibilityTimer <= 0 && !p.inCutscene && Math.abs(cx - r.x) < r.r + p.width / 2 - 4 && r.y + r.r > p.pos.y && r.y - r.r < feet) hurtPlayer(ctx, 16, 'm2:fr_cavein', { x: cx < r.x ? -3 : 3, y: -2 });
          for (const e of hazardVictims(state)) if (boxHits(e, r.x - r.r, r.y - r.r, r.r * 2, r.r * 2)) hazardHit(ctx, e, 40, r.x, 'CAVE-IN!', { knock: 4 });
        }
      }
      if (cv.t >= CAVE_FALL) { cv.state = 'rubble'; cv.t = 0; }
    } else if (cv.state === 'rubble' && cv.t > RUBBLE) { cv.state = 'quiet'; cv.t = 0; cv.rocks = []; }
  }
  // (ore chutes: he's near, it goes now and then)
  for (const ch of tw.chutes) {
    ch.t++;
    const near = down && Math.abs(cx - ch.x) < 420;
    if (ch.state === 'quiet') { if (near && ch.t > CHUTE_EVERY) { ch.state = 'tell'; ch.t = 0; playSound('rumble', 0.4, 10); } }
    else if (ch.state === 'tell') {
      zones.push({ x0: ch.x - 32, x1: ch.x + 32, y0: CEIL_Y, y1: FY });
      if (ch.t % 5 === 0) state.particles.push({ pos: { x: ch.x + (Math.random() - 0.5) * 16, y: CEIL_Y + 10 }, vel: { x: 0, y: 2 }, life: 50, color: '#78716C', size: 2 });
      if (ch.t % 12 === 0) playSound('clink', 0.3, 4);
      if (ch.t >= CHUTE_TELL) { ch.state = 'dump'; ch.t = 0; playSound('crash', 0.7, 2); }
    } else {
      zones.push({ x0: ch.x - 32, x1: ch.x + 32, y0: CEIL_Y, y1: FY });
      if (ch.t % 2 === 0) state.particles.push({ pos: { x: ch.x + (Math.random() - 0.5) * 40, y: CEIL_Y + 14 }, vel: { x: (Math.random() - 0.5) * 1, y: 5 + Math.random() * 3 }, life: 26, color: ch.t % 4 ? '#57534E' : '#CA8A04', size: 4 + Math.random() * 4 });
      if (p.health > 0 && p.invincibilityTimer <= 0 && !p.inCutscene && Math.abs(cx - ch.x) < 30 + p.width / 2 - 6 && feet > CEIL_Y) hurtPlayer(ctx, 14, 'm2:fr_ore', { x: cx < ch.x ? -4 : 4, y: -2 });
      if (ch.t % 10 === 0) for (const e of hazardVictims(state)) if (boxHits(e, ch.x - 30, CEIL_Y, 60, FY - CEIL_Y)) hazardHit(ctx, e, 30, ch.x, 'DUMPED ON!', { knock: 6 });
      if (ch.t >= CHUTE_DUMP) { ch.state = 'quiet'; ch.t = 0; ch.pile = Math.min(3, ch.pile + 1); }
    }
  }
  // (runaway carts: while he's on the cart track, one now and then, warned first)
  const onRun = down && cx > CART_RUN.a - 60 && cx < CART_RUN.b + 20;
  if (onRun && ++tw.runT > 190 && !tw.runaways.some(r => r.dead === 0)) {
    tw.runT = 0;
    { const v = viewOf(state); tw.runaways.push({ x: Math.min(CART_RUN.b, v.x + v.w + 60), warn: 70, t: 0, dead: 0 }); }
    playSound('rumble', 0.8, -4);
    if (!tw.said.carts) { tw.said.carts = true; meatheadSays(state, pickLine(byPants(state, CARTS)), false); }
  }
  for (const r of tw.runaways) {
    r.t++;
    if (r.dead > 0) { r.dead++; continue; }
    zones.push({ x0: CART_RUN.a, x1: r.x + 80, y0: FY - 40, y1: FY, ground: true });
    if (r.warn > 0) { r.warn--; if (r.warn % 14 === 0) playSound('rumble', 0.5, 0); continue; }
    r.x -= 7;
    if (r.t % 8 === 0) playSound('clink', 0.4, -10);
    // (him; the cast; a TNT crate in its way)
    if (p.health > 0 && p.invincibilityTimer <= 0 && !p.inCutscene && cx > r.x - 6 && cx < r.x + 76 && feet > FY - 36) { hurtPlayer(ctx, 18, 'm2:fr_minecart', { x: -9, y: -6 }); playSound('slam', 0.9, -4); }
    for (const e of hazardVictims(state)) if (boxHits(e, r.x, FY - 36, 70, 36)) hazardHit(ctx, e, 60, r.x + 70, 'RUN OVER!', { knock: 12 });
    for (const cr of tw.crates) if (cr.health > 0 && boxHits(cr, r.x, FY - 36, 70, 36)) { cr.health = 0; }
    if (r.x <= CART_RUN.a) { r.dead = 1; playSound('crash', 1, -6); shakeScreen(state, 8, 4); for (let n = 0; n < 14; n++) state.particles.push({ pos: { x: CART_RUN.a + 20, y: FY - 20 }, vel: { x: Math.random() * 5, y: -2 - Math.random() * 4 }, life: 30, color: n % 2 ? '#57534E' : '#CA8A04', size: 3 + Math.random() * 3 }); }
  }
  tw.runaways = tw.runaways.filter(r => r.dead < 60);
  setHazardZones(state, 'fr-mine', zones);
};

/** The ride cart: stood in, it goes to the other end; waiting at an end it's not at, it comes to him. The beams. */
export const updateRide = (ctx: FrameContext) => {
  const { state } = ctx, tw = townOf(state), r = tw.ride, p = state.player;
  if (!r) return;
  const on = riding(state, r.m) && p.health > 0;
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  // (just ridden over: not off again till he's got out of it)
  if (!on) r.hitCd = 0;
  if (r.at !== 'go') {
    const other = r.at === 'a' ? RIDE.b : RIDE.a;
    // (in it: off to the other end)
    if (on && r.hitCd === 0) { r.goal = other; r.at = 'go'; playSound('clang', 0.7, -4); if (!tw.said.ride) { tw.said.ride = true; meatheadSays(state, pickLine(byPants(state, RIDE_CART)), false); } }
    // (him at the other end, waiting on the floor: it comes for him)
    else if (Math.abs(feet - FY) < 4 && p.isGrounded && Math.abs(cx - (other + RIDE.w / 2)) < 140) { r.goal = other; r.at = 'go'; }
  } else {
    const d = r.goal - r.x, sp = 3.4;
    r.x += Math.abs(d) < sp ? d : Math.sign(d) * sp;
    if (state.frame % 7 === 0) playSound('clink', 0.3, -12);
    if (r.x === r.goal) { r.at = r.goal === RIDE.a ? 'a' : 'b'; r.hitCd = on ? 1 : 0; playSound('thud', 0.6, -6); }
  }
  moveMover(state, r.m, r.x, FY - 34);
  // (the low beams: his head into one, it clouts him: stood up (or hopping) it is; ducked, it's well under)
  tw.beamCd = Math.max(0, tw.beamCd - 1);
  if (tw.beamCd === 0 && p.health > 0 && !p.inCutscene) for (const [bx, half] of BEAMS) {
    const x = X(bx), bottom = FY - 34 - BEAM_GAP, head = feet - (p.isDucking && p.isGrounded ? HEAD_DUCKED : HEAD_UP);
    if (p.pos.x + p.width - 6 > x - half && p.pos.x + 6 < x + half && head < bottom && feet > bottom) {
      tw.beamCd = 40; p.invincibilityTimer = 0;
      hurtPlayer(ctx, 10, 'm2:fr_beam', { x: 0, y: 0 });
      playSound('thud', 0.9, -2); shakeScreen(state, 4, 2);
      break;
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The sawmill: the belts, their logs, the head saw

const BELT_LOG = 120;
const beltY = MILL_DECK;
export const updateMill = (ctx: FrameContext) => {
  const { state } = ctx, tw = townOf(state), p = state.player;
  const near = Math.abs(p.pos.x - SAW.x) < 900 && Math.abs(p.pos.y - SAW.y) < 500;
  // (the belts carry whoever's on them)
  const feet = p.pos.y + p.height, cx = p.pos.x + p.width / 2;
  BELTS.forEach(([a, b, v]) => {
    if (p.isGrounded && Math.abs(feet - beltY) < 3 && cx > X(a) && cx < X(b)) p.pos.x += v;
    for (const e of state.enemies) if (e.health > 0 && e.vel.y === 0 && Math.abs(e.pos.y + e.height - beltY) < 3 && e.pos.x + e.width / 2 > X(a) && e.pos.x + e.width / 2 < X(b)) e.pos.x += v;
  });
  // (logs onto the belts: one at a time, off the end of each, while he's about)
  BELTS.forEach(([a, b, v], i) => {
    if (!near) return;
    if (++tw.beltT[i] > (i === 0 ? 260 : 170)) {
      tw.beltT[i] = 0;
      const x = v > 0 ? X(a) : X(b) - BELT_LOG;
      const clear = !(p.pos.x + p.width > x - 40 && p.pos.x < x + BELT_LOG + 40 && Math.abs(p.pos.y + p.height - beltY) < 80);
      if (clear && !tw.beltLogs.some(L => L.belt === i && Math.abs(L.x - x) < BELT_LOG + 20)) {
        const L = { belt: i, x, len: BELT_LOG, m: makeMover(state, x, beltY - 28, BELT_LOG, 'fr-belt-log'), cut: 0 };
        moveMover(state, L.m, x, beltY - 28);
        tw.beltLogs.push(L);
        if (heard(state, x)) playSound('thud', 0.5, -8);
      }
    }
  });
  for (const L of tw.beltLogs) {
    if (L.cut > 0) { L.cut++; continue; }
    const [, , v] = BELTS[L.belt];
    L.x += v;
    moveMover(state, L.m, L.x, beltY - 28);
    // (it shoves whoever's in its way along (not stood on it))
    const top = beltY - 28;
    if (p.health > 0 && feet > top + 6 && feet <= beltY + 2 && p.pos.x + p.width > L.x && p.pos.x < L.x + L.len) {
      p.pos.x = v > 0 ? L.x + L.len : L.x - p.width;
    }
    // (into the saw: cut in two, in a spray of sawdust)
    const front = v > 0 ? L.x + L.len : L.x;
    if (Math.abs(front - SAW.x) < SAW.r * 0.5) {
      L.cut = 1; moveMover(state, L.m, L.x, beltY - 28, true);
      if (heard(state, SAW.x)) playSound('grind', 0.9, 4);
      for (let n = 0; n < 24; n++) state.particles.push({ pos: { x: SAW.x, y: beltY - 20 }, vel: { x: (Math.random() - 0.5) * 6, y: -2 - Math.random() * 5 }, life: 40, color: n % 2 ? '#E8C890' : '#C8A070', size: 2 + Math.random() * 2 });
    }
  }
  tw.beltLogs = tw.beltLogs.filter(L => L.cut < 40);
  // (the saw: him, the cast)
  tw.sawCd = Math.max(0, tw.sawCd - 1);
  const sx0 = SAW.x - SAW.r + 6, sx1 = SAW.x + SAW.r - 6, sy0 = SAW.y - SAW.r + 4;
  setHazardZones(state, 'fr-saw', [{ x0: sx0 - 10, x1: sx1 + 10, y0: sy0, y1: SAW.y, ground: true }]);
  if (tw.sawCd === 0 && p.health > 0 && !p.inCutscene && p.pos.x + p.width > sx0 && p.pos.x < sx1 && feet > sy0 + 8 && p.pos.y < SAW.y) {
    tw.sawCd = 50; p.invincibilityTimer = 0;
    hurtPlayer(ctx, 16, 'm2:fr_millsaw', { x: cx < SAW.x ? -7 : 7, y: -9 });
    playSound('grind', 1, 8);
    for (let n = 0; n < 10; n++) state.particles.push({ pos: { x: cx, y: feet - 10 }, vel: { x: (Math.random() - 0.5) * 6, y: -2 - Math.random() * 4 }, life: 24, color: '#B91C1C', size: 2 + Math.random() * 2 });
  }
  for (const e of hazardVictims(state)) if (boxHits(e, sx0, sy0, sx1 - sx0, SAW.r)) hazardHit(ctx, e, 80, SAW.x, 'SAWED!', { knock: 10 });
};

// ---------------------------------------------------------------------------------------------------------------
// The cover stops shots (theirs and his)

export const updateCover = (state: GameState) => {
  const covers = state.blocks.filter(b => b.tag === 'fr-cover');
  state.projectiles = state.projectiles.filter(q => {
    if (q.thrown || q.isBoulder || q.custom) return true;
    const hit = covers.some(b => q.pos.x + q.width > b.x && q.pos.x < b.x + b.w && q.pos.y + q.height > b.y && q.pos.y < b.y + b.h);
    if (hit) { playSound('thud', 0.4, 10); for (let n = 0; n < 5; n++) state.particles.push({ pos: { x: q.pos.x, y: q.pos.y }, vel: { x: -Math.sign(q.vel.x) * Math.random() * 3, y: -Math.random() * 3 }, life: 16, color: '#C8A070', size: 2 }); }
    return !hit;
  });
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

export const drawHazardsBack = (c: Ctx, state: GameState) => {
  const tw = townOf(state), f = state.frame;
  for (const p of tw.pines) if (onScreen(state, p.x - p.len - 40, p.x + p.len + 40)) drawPine(c, p, f);
  // (the belts: the steel frame, rollers turning, the rubber running with its cleats, its top lit (he rides it); the
  // saw's housing behind the blade)
  if (onScreen(state, X(BELTS[0][0]) - 40, X(BELTS[1][1]) + 40)) {
    const S = hr('steel', STEEL), R = hr('rubber', ['#08080A', '#121216', '#1C1C22', '#26262E', '#363642', '#4A4A58', '#6A6A7A']), L = hr('lip', TOPLIP);
    // (the saw's housing: a riveted iron hood behind the blade, the arbor's pulley and belt)
    box(c, SAW.x - SAW.r - 14, SAW.y - SAW.r - 18, SAW.r * 2 + 28, SAW.r + 18, INK); box(c, SAW.x - SAW.r - 13, SAW.y - SAW.r - 17, SAW.r * 2 + 26, SAW.r + 17, S[2]);
    box(c, SAW.x - SAW.r - 13, SAW.y - SAW.r - 17, SAW.r * 2 + 26, 3, S[4]); box(c, SAW.x - SAW.r - 13, SAW.y - SAW.r - 17, 4, SAW.r + 17, S[4]);
    for (let x = SAW.x - SAW.r - 8; x < SAW.x + SAW.r + 12; x += 9) { box(c, x, SAW.y - SAW.r - 13, 2, 2, INK); box(c, x, SAW.y - SAW.r - 13, 1, 1, S[6]); }
    BELTS.forEach(([a, b, v]) => {
      const xa = X(a), xb = X(b);
      box(c, xa, beltY - 2, xb - xa, 22, INK);
      box(c, xa, beltY + 8, xb - xa, 12, S[2]); box(c, xa, beltY + 8, xb - xa, 1, S[4]);
      for (let x = xa + 10; x < xb; x += 40) { c.fillStyle = INK; c.beginPath(); c.arc(x, beltY + 12, 6.5, 0, Math.PI * 2); c.fill(); c.fillStyle = S[3]; c.beginPath(); c.arc(x, beltY + 12, 5, 0, Math.PI * 2); c.fill(); const q = f * v * 0.3; box(c, x + Math.cos(q) * 3 - 1, beltY + 11 + Math.sin(q) * 3, 2, 2, S[6]); }
      box(c, xa, beltY, xb - xa, 7, R[3]); box(c, xa, beltY + 5, xb - xa, 2, R[1]);
      const off = ((f * v) % 18 + 18) % 18;
      for (let x = xa + off; x < xb; x += 18) { box(c, x, beltY, 3, 5, R[1]); box(c, x + 3, beltY, 1, 5, R[5]); }
      box(c, xa, beltY, xb - xa, 1, L[3]); box(c, xa, beltY + 1, xb - xa, 1, L[2]);
      for (const ex of [xa - 6, xb]) { box(c, ex, beltY - 4, 6, 26, INK); box(c, ex + 1, beltY - 3, 4, 24, S[3]); }
    });
    for (const L of tw.beltLogs) if (L.cut === 0) drawLog(c, L.x, beltY - 28, L.len, -L.x / 14);
    // (the cut halves, tipping off the deck)
    for (const L of tw.beltLogs) if (L.cut > 0) { c.globalAlpha = Math.max(0, 1 - L.cut / 40); drawLog(c, SAW.x - 70, beltY - 28 + L.cut * 1.5, 60, 0); drawLog(c, SAW.x + 10, beltY - 28 + L.cut * 1.8, 60, 0); c.globalAlpha = 1; }
  }
};

/** The saw's blade (over him: it's in front), spinning, the teeth a blur; and the mine's things that fall. */
export const drawHazardsFront = (c: Ctx, state: GameState) => {
  const tw = townOf(state), f = state.frame;
  if (onScreen(state, SAW.x - 60, SAW.x + 60)) {
    // (the blade: stepped steel, its gullets and set teeth going round, a blur ring, the arbor nut; half under the deck)
    const S = hr('steel', STEEL);
    c.save(); c.beginPath(); c.rect(SAW.x - SAW.r - 8, SAW.y - SAW.r - 8, SAW.r * 2 + 16, SAW.r + 8); c.clip();
    for (let k = 0; k < 18; k++) {
      const a = k * (Math.PI / 9) + f * 0.5;
      c.fillStyle = INK; c.beginPath(); c.moveTo(SAW.x + Math.cos(a) * (SAW.r - 4), SAW.y + Math.sin(a) * (SAW.r - 4)); c.lineTo(SAW.x + Math.cos(a + 0.1) * (SAW.r + 7), SAW.y + Math.sin(a + 0.1) * (SAW.r + 7)); c.lineTo(SAW.x + Math.cos(a + 0.3) * (SAW.r - 4), SAW.y + Math.sin(a + 0.3) * (SAW.r - 4)); c.closePath(); c.fill();
      c.fillStyle = k % 2 ? S[4] : S[6]; c.beginPath(); c.moveTo(SAW.x + Math.cos(a) * (SAW.r - 3), SAW.y + Math.sin(a) * (SAW.r - 3)); c.lineTo(SAW.x + Math.cos(a + 0.1) * (SAW.r + 5), SAW.y + Math.sin(a + 0.1) * (SAW.r + 5)); c.lineTo(SAW.x + Math.cos(a + 0.26) * (SAW.r - 3), SAW.y + Math.sin(a + 0.26) * (SAW.r - 3)); c.closePath(); c.fill();
    }
    c.fillStyle = INK; c.beginPath(); c.arc(SAW.x, SAW.y, SAW.r - 1, 0, Math.PI * 2); c.fill();
    c.fillStyle = S[3]; c.beginPath(); c.arc(SAW.x, SAW.y, SAW.r - 2, 0, Math.PI * 2); c.fill();
    c.fillStyle = S[5]; c.beginPath(); c.arc(SAW.x, SAW.y, SAW.r - 2, Math.PI * 1.05, Math.PI * 1.6); c.lineTo(SAW.x, SAW.y); c.fill();
    c.fillStyle = S[4]; c.beginPath(); c.arc(SAW.x, SAW.y, SAW.r - 12, 0, Math.PI * 2); c.fill();
    c.strokeStyle = S[6]; c.lineWidth = 1; c.beginPath(); c.arc(SAW.x, SAW.y, SAW.r - 6, Math.PI * 1.1 + (f * 0.2) % 0.6, Math.PI * 1.5 + (f * 0.2) % 0.6); c.stroke();
    c.strokeStyle = S[1]; c.beginPath(); c.arc(SAW.x, SAW.y, SAW.r - 8, Math.PI * 1.6, Math.PI * 1.95); c.stroke();
    box(c, SAW.x - 6, SAW.y - 6, 12, 12, INK); box(c, SAW.x - 5, SAW.y - 5, 10, 10, S[2]); box(c, SAW.x - 5, SAW.y - 5, 3, 3, S[5]);
    c.restore();
    // (the slot in the deck it comes up through)
    box(c, SAW.x - SAW.r - 6, SAW.y, SAW.r * 2 + 12, 4, INK); box(c, SAW.x - SAW.r - 6, SAW.y + 3, SAW.r * 2 + 12, 1, '#3A2A1A');
  }
  // (the cave-ins' rocks and rubble; the chute's pile)
  for (const cv of tw.caves) {
    if (!onScreen(state, cv.x - cv.half - 20, cv.x + cv.half + 20)) continue;
    for (const r of cv.rocks) drawRockArt(c, r.x, r.y, r.r);
    if (cv.state === 'rubble') { const k = Math.min(1, (RUBBLE - cv.t) / 40); c.globalAlpha = k; for (const r of cv.rocks) drawRockArt(c, r.x, FY - r.r * 0.4, r.r * 0.7); c.globalAlpha = 1; }
  }
  for (const ch of tw.chutes) {
    if (!onScreen(state, ch.x - 60, ch.x + 60)) continue;
    drawPileArt(c, ch.x, ch.pile);
    if (ch.state === 'dump') drawDumpArt(c, ch.x, f);
  }
  // (the runaway carts: their lamp at the screen's edge while warned (a soft glow, the red warning plate, no words),
  // then the cart itself)
  for (const r of tw.runaways) {
    if (r.dead > 0) continue;
    if (r.warn > 0) {
      const v = viewOf(state), ex = Math.min(v.x + v.w - 20, r.x + 30), y = FY - 30;
      c.globalAlpha = 0.25 + 0.25 * Math.sin(f * 0.4);
      for (const [rr, col] of [[30, '#C8A040'], [20, '#F2D27A'], [10, '#FFF4C8']] as const) { c.fillStyle = col; c.beginPath(); c.arc(ex, y, rr, 0, Math.PI * 2); c.fill(); }
      c.globalAlpha = 1;
      box(c, ex - 31, y - 51, 24, 28, INK); box(c, ex - 30, y - 50, 22, 26, '#B91C1C'); box(c, ex - 30, y - 50, 22, 2, '#E85A4A'); box(c, ex - 22, y - 46, 6, 12, '#FFFFFF'); box(c, ex - 22, y - 30, 6, 4, '#FFFFFF');
      continue;
    }
    drawCartArt(c, r.x, FY, f, true);
  }
  // (the ride cart)
  if (tw.ride && onScreen(state, tw.ride.x - 20, tw.ride.x + RIDE.w + 20)) drawCartArt(c, tw.ride.x, FY - 34 + 34, f, false);
};

/** The mine's own: the rails, the trestle over the chasm, the beams, the chute, the cracked ceiling over a cave-in. */
export const drawMineBits = (c: Ctx, state: GameState) => drawMineBitsArt(c, state);
void AWAY; void CHASM; void CAVEINS; void CHUTES; void BEAMS; void BEAM_GAP; void CART_RUN; void hash; void mix;
