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
import { shakeScreen } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { pickLine } from '../../../m1/game/platform/speech';
import { hazardVictims, hazardHit, boxHits, setHazardZones, type Zone } from '../../hazardHit';
import { makeMover, moveMover, riding } from '../../foreign/movers';
import { ledge, meatheadSays, byPants } from '../section';
import { drawLog } from '../wilds/logs';
import { box, mix, INK, hash, painted, type Ctx } from '../kit';
import { signText } from '../../signLetters';
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

/** A prop pine (plywood on a brace: the park's): standing, shaking as it's chopped, falling, down. */
const drawPine = (c: Ctx, p: ReturnType<typeof townOf>['pines'][number], f: number) => {
  let ang = 0;
  if (p.state === 'chop') ang = Math.sin(f * 0.8) * 0.02;
  else if (p.state === 'fall') ang = (p.t / FALL) ** 2 * (Math.PI / 2) * p.dir;
  else if (p.state === 'down') ang = (Math.PI / 2) * p.dir;
  if (p.state === 'down' && p.water) { c.globalAlpha = Math.max(0, 1 - p.t / 90); }
  c.save(); c.translate(p.x, p.y + (p.state === 'down' && p.water ? 22 : 0)); c.rotate(ang);
  // (the trunk, its notch; the plywood boughs in tiers)
  box(c, -6, -p.len, 12, p.len, INK); box(c, -5, -p.len, 10, p.len, '#7A4A2A'); box(c, -5, -p.len, 3, p.len, '#9A6A3A');
  if (p.state === 'chop' || p.state === 'fall') box(c, p.dir > 0 ? -5 : 1, -22, 4, 8, '#E8C890');
  for (let k = 0; k < 5; k++) {
    const y = -p.len + 10 + k * (p.len - 50) / 5, w = 22 + k * 10;
    c.fillStyle = INK; c.beginPath(); c.moveTo(0, y - 16); c.lineTo(w / 2 + 2, y + 16); c.lineTo(-w / 2 - 2, y + 16); c.closePath(); c.fill();
    c.fillStyle = k % 2 ? '#2F5A2A' : '#3A6A32'; c.beginPath(); c.moveTo(0, y - 14); c.lineTo(w / 2, y + 14); c.lineTo(-w / 2, y + 14); c.closePath(); c.fill();
  }
  c.restore();
  c.globalAlpha = 1;
  // (the brace behind it, and its stump once it's down)
  if (p.state === 'down' || p.state === 'fall') { box(c, p.x - 7, p.y - 12, 14, 12, INK); box(c, p.x - 6, p.y - 11, 12, 11, '#9A6A3A'); box(c, p.x - 6, p.y - 11, 12, 2, '#E8C890'); }
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
        playSound('thud', 0.5, -8);
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
      playSound('grind', 0.9, 4);
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
    if (q.thrown || q.isBoulder) return true;
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
  // (the belts: rollers turning, the rubber running; the saw's housing and its blade)
  if (onScreen(state, X(BELTS[0][0]) - 40, X(BELTS[1][1]) + 40)) {
    BELTS.forEach(([a, b, v]) => {
      const xa = X(a), xb = X(b);
      box(c, xa, beltY - 2, xb - xa, 10, INK); box(c, xa, beltY, xb - xa, 6, '#3F3F46'); box(c, xa, beltY, xb - xa, 2, '#71717A');
      const off = ((f * v) % 18 + 18) % 18;
      for (let x = xa + off; x < xb; x += 18) box(c, x, beltY + 1, 3, 4, '#27272A');
      for (let x = xa + 10; x < xb; x += 40) { c.fillStyle = INK; c.beginPath(); c.arc(x, beltY + 12, 6, 0, Math.PI * 2); c.fill(); c.fillStyle = '#71717A'; c.beginPath(); c.arc(x, beltY + 12, 4, 0, Math.PI * 2); c.fill(); }
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
    c.save(); c.beginPath(); c.rect(SAW.x - SAW.r - 4, SAW.y - SAW.r - 4, SAW.r * 2 + 8, SAW.r + 4); c.clip();
    c.fillStyle = INK; c.beginPath(); c.arc(SAW.x, SAW.y, SAW.r + 1, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#A1A1AA'; c.beginPath(); c.arc(SAW.x, SAW.y, SAW.r - 2, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#D4D4D8'; c.beginPath(); c.arc(SAW.x, SAW.y, SAW.r - 10, 0, Math.PI * 2); c.fill();
    for (let k = 0; k < 16; k++) {
      const a = k * (Math.PI / 8) + f * 0.5;
      c.fillStyle = k % 2 ? '#52525B' : '#E4E4E7';
      c.beginPath(); c.moveTo(SAW.x + Math.cos(a) * (SAW.r - 3), SAW.y + Math.sin(a) * (SAW.r - 3)); c.lineTo(SAW.x + Math.cos(a + 0.12) * (SAW.r + 5), SAW.y + Math.sin(a + 0.12) * (SAW.r + 5)); c.lineTo(SAW.x + Math.cos(a + 0.3) * (SAW.r - 3), SAW.y + Math.sin(a + 0.3) * (SAW.r - 3)); c.closePath(); c.fill();
    }
    box(c, SAW.x - 4, SAW.y - 4, 8, 8, '#3F3F46');
    c.restore();
    // (the slot in the deck it comes up through)
    box(c, SAW.x - SAW.r - 6, SAW.y, SAW.r * 2 + 12, 4, INK);
  }
  // (the cave-ins' rocks and rubble; the chute's pile)
  for (const cv of tw.caves) {
    if (!onScreen(state, cv.x - cv.half - 20, cv.x + cv.half + 20)) continue;
    for (const r of cv.rocks) { c.fillStyle = INK; c.beginPath(); c.arc(r.x, r.y, r.r + 1, 0, Math.PI * 2); c.fill(); c.fillStyle = '#78716C'; c.beginPath(); c.arc(r.x, r.y, r.r, 0, Math.PI * 2); c.fill(); c.fillStyle = '#A8A29E'; c.fillRect(r.x - r.r * 0.5, r.y - r.r * 0.6, r.r * 0.6, 2); }
    if (cv.state === 'rubble') { const k = Math.min(1, (RUBBLE - cv.t) / 40); c.globalAlpha = k; for (const r of cv.rocks) { c.fillStyle = '#57534E'; c.fillRect(r.x - r.r, FY - 6, r.r * 2, 6); } c.globalAlpha = 1; }
  }
  for (const ch of tw.chutes) {
    if (!onScreen(state, ch.x - 60, ch.x + 60)) continue;
    for (let k = 0; k < ch.pile; k++) { c.fillStyle = '#57534E'; c.beginPath(); c.ellipse(ch.x + (k - 1) * 18, FY, 22, 8 + k * 2, 0, Math.PI, 0); c.fill(); }
    if (ch.state === 'dump') { c.globalAlpha = 0.85; box(c, ch.x - 24, CEIL_Y + 10, 48, FY - CEIL_Y - 10, '#57534E'); for (let y = CEIL_Y + 10 + (f * 7) % 20; y < FY; y += 20) box(c, ch.x - 20 + hash(y) * 30, y, 8, 8, '#CA8A04'); c.globalAlpha = 1; }
  }
  // (the runaway carts: their lamp at the screen's edge while warned, then the cart itself)
  for (const r of tw.runaways) {
    if (r.dead > 0) continue;
    if (r.warn > 0) {
      const v = viewOf(state), ex = Math.min(v.x + v.w - 20, r.x + 30), y = FY - 30;
      c.globalAlpha = 0.4 + 0.4 * Math.sin(f * 0.4); c.fillStyle = '#FEF08A'; c.beginPath(); c.arc(ex, y, 26, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
      box(c, ex - 30, y - 50, 22, 26, '#B91C1C'); box(c, ex - 22, y - 46, 6, 12, '#FFFFFF'); box(c, ex - 22, y - 30, 6, 4, '#FFFFFF');
      continue;
    }
    drawCart(c, r.x, FY, f, true);
  }
  // (the ride cart)
  if (tw.ride && onScreen(state, tw.ride.x - 20, tw.ride.x + RIDE.w + 20)) drawCart(c, tw.ride.x, FY - 34 + 34, f, false);
};

/** A mine cart (its left end at x, its wheels on the rail at railY): iron, riveted, ore heaped in it (or not). */
const drawCart = (c: Ctx, x: number, railY: number, f: number, loaded: boolean) => {
  const w = RIDE.w, top = railY - 34;
  box(c, x - 1, top - 1, w + 2, 28, INK); box(c, x, top, w, 26, '#57534E'); box(c, x, top, w, 3, '#A1A1AA');
  for (let k = 0; k < 4; k++) box(c, x + 6 + k * 18, top + 8, 2, 2, '#A1A1AA');
  if (loaded) for (let k = 0; k < 5; k++) { c.fillStyle = k % 2 ? '#78716C' : '#CA8A04'; c.beginPath(); c.arc(x + 10 + k * 12, top - 2, 7, Math.PI, 0); c.fill(); }
  for (const wx of [x + 14, x + w - 14]) { c.fillStyle = INK; c.beginPath(); c.arc(wx, railY - 6, 7, 0, Math.PI * 2); c.fill(); c.fillStyle = '#3F3F46'; c.beginPath(); c.arc(wx, railY - 6, 5, 0, Math.PI * 2); c.fill(); const a = f * 0.4; box(c, wx + Math.cos(a) * 3 - 1, railY - 7 + Math.sin(a) * 3, 2, 2, '#A1A1AA'); }
};

/** The mine's own: the rails, the trestle over the chasm, the beams, the chute, the cracked ceiling over a cave-in. */
export const drawMineBits = (c: Ctx, state: GameState) => {
  const f = state.frame;
  // (rails: down the cart track, over the trestle)
  const rail = (a: number, b: number, y: number) => { box(c, a, y - 3, b - a, 3, '#71717A'); for (let x = a; x < b; x += 22) box(c, x, y - 1, 12, 3, '#5A3A1E'); };
  if (onScreen(state, CART_RUN.a - 40, RIDE.b + RIDE.w + 40)) {
    rail(CART_RUN.a - 30, RIDE.b + RIDE.w + 40, FY);
    // (the buffer at the track's foot)
    box(c, CART_RUN.a - 34, FY - 30, 16, 30, INK); box(c, CART_RUN.a - 33, FY - 29, 14, 28, '#B91C1C'); box(c, CART_RUN.a - 33, FY - 20, 14, 4, '#FDE047');
    // (the trestle: timbers down into the dark under the rails; the chasm black all the way down)
    const a = CHASM.a, b = CHASM.b;
    box(c, a, FY, b - a, 1200, '#050302');
    for (let x = a; x < b; x += 56) { box(c, x, FY, 8, 300, '#3F2A14'); c.strokeStyle = '#3F2A14'; c.lineWidth = 4; c.beginPath(); c.moveTo(x, FY + 10); c.lineTo(x + 56, FY + 120); c.moveTo(x + 56, FY + 10); c.lineTo(x, FY + 120); c.stroke(); }
    box(c, a, FY - 2, b - a, 8, '#5A3A1E');
  }
  for (const [bx, half] of BEAMS) {
    const x = X(bx);
    if (!onScreen(state, x - 30, x + 30)) continue;
    // (a beam: a timber down from the ceiling to the gap, full across: no standing under it; it comes down solid to the
    // line it hits at (BEAM_GAP over the cart's floor), its foot hazard-striped, a DUCK plate on it, its arrow down at
    // the gap)
    const bottom = FY - 34 - BEAM_GAP;
    box(c, x - half - 2, CEIL_Y, half * 2 + 4, bottom - CEIL_Y, INK); box(c, x - half, CEIL_Y, half * 2, bottom - CEIL_Y - 2, '#6B4423'); box(c, x - half, CEIL_Y, 3, bottom - CEIL_Y - 2, '#8A5A30');
    box(c, x - half - 14, bottom - 14, half * 2 + 28, 14, INK); box(c, x - half - 13, bottom - 13, half * 2 + 26, 12, '#7A5230');
    for (let k = 0; k < 4; k++) box(c, x - half - 13 + k * ((half * 2 + 26) / 4), bottom - 6, (half * 2 + 26) / 8, 5, '#FDE047');
    box(c, x - 18, bottom - 64, 36, 44, INK); box(c, x - 16, bottom - 62, 32, 40, '#F8FAFC');
    signText(c, 'DUCK', x, bottom - 50, painted(1, '#B91C1C', '#F8FAFC'));
    c.fillStyle = '#B91C1C'; c.beginPath(); c.moveTo(x - 8, bottom - 44); c.lineTo(x + 8, bottom - 44); c.lineTo(x, bottom - 28); c.closePath(); c.fill();
  }
  for (const ch of CHUTES) {
    const x = X(ch);
    if (!onScreen(state, x - 40, x + 40)) continue;
    box(c, x - 26, CEIL_Y - 2, 52, 18, INK); box(c, x - 24, CEIL_Y, 48, 14, '#57534E'); box(c, x - 20, CEIL_Y + 14, 40, 4, '#27272A');
  }
  for (const [cx, half] of CAVEINS) {
    const x = X(cx);
    if (!onScreen(state, x - half, x + half)) continue;
    c.strokeStyle = '#1C1209'; c.lineWidth = 2; c.beginPath();
    for (let k = -2; k <= 2; k++) { c.moveTo(x + k * half / 2.5, CEIL_Y); c.lineTo(x + k * half / 2.5 + 8, CEIL_Y + 12); c.lineTo(x + k * half / 2.5 - 4, CEIL_Y + 22); }
    c.stroke();
    box(c, x - half, CEIL_Y - 4, half * 2, 4, mix('#3A2A1A', '#000000', 0.3));
  }
  void f;
};
void AWAY;
