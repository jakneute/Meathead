// What the train goes by, set off by where he's got to (layout.ts EVENTS), each coming in from the right at the world's
// speed, warned of first at the right edge of the screen (what it is, and what to do about it):
//
//   LOW BRIDGE    a timber road bridge over the line, its underside a few feet over the roofs: up there standing (or
//                 jumping), it clotheslines him back along the roof; duck (or be inside, or down on a deck). It takes
//                 the brakemen off the roofs too
//   WATER TOWER   the spout swung out over the line, pouring: up on top of anything it hoses him back hard; inside or
//                 down on a deck, it goes over him. The cast on top get hosed off too
//   TUNNEL        a fake-rock portal (bolts and all) and the dark inside it (the lighting system: murky, never black; the
//                 playtest's: only inside a car, its lamps lit, can he see clearly, or by waiting it out); longer and
//                 closer together toward the front
//   WATERFALL     the playtest's: the line runs under a waterfall pouring off the park's fake cliff: outside under it
//                 (on a roof, a load, a platform, a coupling) he's battered and swept off the train (dead, its death
//                 screen); inside a car it goes over the roof (the water down the windows). Telegraphed: a sign up by
//                 the line, the roar, the mist ahead, the warning at the edge (WATERFALL: GET INSIDE!); the first one
//                 short, with cars to duck into, the second long, over the open cars. It sweeps the cast off too
//   GRADES        the playtest's: up and down hills, more and steeper toward the front: the line climbs and drops under
//                 the train, and the view tilts with it (the whole train on the rails, the horizon level); slower up,
//                 faster down
//   ROBBERS       bandits galloping up from behind on horses, along the NEAR side of the line (the foreground: one eye
//                 for the scene, so nearer is bigger and lower, drawn in front of the train), only where the lane's
//                 clear (kinds.ts; they board before anything closes it)

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Enemy, EnemyKind } from '../../../m1/types';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { floorTopAt } from '../../../m1/game/core/terrain';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { hazardVictims, hazardHit, hazardKill, boxHits } from '../../hazardHit';
import { meatheadSays, byPants, label } from '../section';
import { GY } from '../geometry';
import { box, mix, INK, painted, burned, type Ctx } from '../kit';
import { signText } from '../../signLetters';
import { trainOf, type Passer } from './state';
import { carAt, insideCar, playerRoom, roomAt, carXNow } from './where';
import { EVENTS, eventX, RAIL, DECK, ROOF, CEIL, END, CARS, V_FULL } from './layout';
import { FG_GROUND, FG_SCALE, riding, boarding, leapK, laneBlocked } from './kinds';
import { drawRider, drawHorse, drawRobberAt } from './kindArt';
import { seedOf } from './kinds';
import { tubeSay } from './tube';
import { viewOf } from './view';
import { TUBE_TUNNEL, TUBE_ROBBERS, TUBE_FALLS, TRAIN_GAGS } from './lines';

/** The low bridge's underside (stood on a roof, his head's over it; ducked, it's not). */
export const BRIDGE_Y = ROOF - 48;
const BRIDGE_W = 64, TOWER_W = 46;
/** Frames of warning before one comes on screen (the waterfall's longer: there's a car to find). */
const WARN = 100, WARN_FALLS = 240;
/** The embankment behind the train (the far side). */
export const BERM_Y = GY - 120;
/** The waterfall: frames battered under it before it has him off the train. */
const SWEPT = 54;

const riders = new WeakSet<Enemy>();
/** Each one hits each of the cast the once as it goes by. */
const struck = new WeakMap<Passer, WeakSet<Enemy>>();
const once = (q: Passer, e: Enemy) => {
  let s = struck.get(q);
  if (!s) { s = new WeakSet(); struck.set(q, s); }
  if (s.has(e)) return false;
  s.add(e); return true;
};
const notRiding = (e: Enemy) => riding(e) || boarding(e);

/** The grade at world x (radians, climbing above zero), and how far the line's climbed there, from the hills. */
const gradeAt = (passers: Passer[], x: number) => {
  let g = 0, h = 0;
  for (const q of passers) {
    if (q.kind !== 'hill' || x < q.x || x > q.x + q.len) continue;
    const u = (x - q.x) / q.len, a = q.amp ?? 0;
    g += a * Math.sin(2 * Math.PI * u);
    h += a * q.len / (2 * Math.PI) * (1 - Math.cos(2 * Math.PI * u));
  }
  return { g, h };
};

/** Each frame: set off what he's got to, move what's coming by along, what it does to whoever's in its way. */
export const updatePassers = (ctx: FrameContext) => {
  const { state } = ctx, tr = trainOf(state), p = state.player;
  const cx = p.pos.x + p.width / 2, v = viewOf(state), right = v.x + v.w;
  if (tr.phase === 'ride' && p.health > 0) {
    EVENTS.forEach((ev, i) => {
      if (tr.fired.has(i) || cx < eventX(ev)) return;
      // (robbers ride up only where there's a clearing for them: not in a tunnel, nor with one, a bridge or the falls
      // coming; they wait for it)
      if (ev.kind === 'robbers' && (tr.dark > 0.1 || laneBlocked(state, v.x - 300, right + 900))) return;
      tr.fired.add(i);
      if (ev.kind === 'robbers') { spawnRobbers(state, ev.n ?? 1); return; }
      // (a grade starts just off the right of the screen)
      if (ev.kind === 'hill') {
        const after = Math.max(0, ...tr.passers.filter(q => q.kind === 'hill').map(q => q.x + q.len));
        tr.passers.push({ kind: 'hill', x: Math.max(right + 10, after), len: ev.len ?? 2000, t: 0, amp: ev.amp ?? 0.04 });
        return;
      }
      // (it gets to him about WARN frames after it's set off, wherever he is then; off the screen till then, warned of;
      // never on top of a tunnel or a waterfall still going by)
      const warn = ev.kind === 'falls' ? WARN_FALLS : WARN;
      const big = ev.kind === 'tunnel' || ev.kind === 'falls';
      const clear = Math.max(0, ...tr.passers.filter(q => (big ? q.kind === 'tunnel' || q.kind === 'falls' || q.kind === 'bridge' : q.kind === 'tunnel' || q.kind === 'falls')).map(q => q.x + q.len + 300));
      const x = Math.max(right + 10, cx + V_FULL * warn, clear);
      const len = big ? ev.len ?? 1500 : ev.kind === 'bridge' ? BRIDGE_W : TOWER_W;
      tr.passers.push({ kind: ev.kind as Passer['kind'], x, len, t: 0 });
      // (the waterfall's sign up by the line well before it)
      if (ev.kind === 'falls') tr.passers.push({ kind: 'sign', x: x - 700, len: 120, t: 0, text: ['FALLS AHEAD', 'STAY IN', 'YOUR CAR'] });
    });
  }
  tr.hitCd = Math.max(0, tr.hitCd - 1);
  for (const q of tr.passers) { q.t++; q.x -= tr.v; }
  tr.passers = tr.passers.filter(q => q.x + q.len > v.x - 600 || q.kind === 'bumper');
  // (the dark: how much of a tunnel's over the middle of the screen)
  const mid = state.camera.x + CANVAS_WIDTH / 2;
  let dark = 0;
  for (const q of tr.passers) if (q.kind === 'tunnel') dark = Math.max(dark, Math.max(0, Math.min(1, (mid - q.x) / 220, (q.x + q.len - mid) / 220)));
  tr.dark += (dark - tr.dark) * 0.12;
  if (dark > 0.5 && !tr.said.tunnel) { tr.said.tunnel = true; tubeSay(state, TUBE_TUNNEL); }
  if (dark > 0.8 && !tr.said.tunnelMe && tr.said.tunnel && !tr.tubeBusy) { tr.said.tunnelMe = true; meatheadSays(state, pickLine(byPants(state, TRAIN_GAGS.tunnel))); }
  // (the grade: the hills under the middle of the screen; the view tilts to it (not after the crash))
  const gr = gradeAt(tr.passers, mid);
  tr.grade = tr.phase === 'still' ? 0 : gr.g;
  tr.climb += ((tr.phase === 'still' ? 0 : gr.h) - tr.climb) * 0.2;
  tr.tilt += (tr.grade - tr.tilt) * 0.08;
  // (the waterfall coming: the roar first, louder as it nears; the first time, Tucker and him on it)
  const falls = tr.passers.find(q => q.kind === 'falls' && q.x + q.len > v.x);
  if (falls) {
    const dx = falls.x - right;
    if (dx < 1400 && ++tr.roarT % Math.max(8, Math.round(26 - (1400 - Math.max(0, dx)) / 70)) === 0) playSound('splash', Math.min(1, 0.35 + (1400 - Math.max(0, dx)) / 2000), -16);
    if (dx < 1200 && !tr.said.falls) {
      tr.said.falls = true;
      tubeSay(state, TUBE_FALLS, () => { if (!tr.said.fallsMe) { tr.said.fallsMe = true; meatheadSays(state, pickLine(byPants(state, TRAIN_GAGS.falls))); } });
    }
  }
  // (what they do)
  let under = false;
  for (const q of tr.passers) {
    if (q.kind === 'bridge') bridgeHits(ctx, q);
    else if (q.kind === 'tower') towerHits(ctx, q);
    else if (q.kind === 'falls') { if (fallsHits(ctx, q)) under = true; }
  }
  soakHim(ctx, under);
  // (riders: noted while they ride (their horses drawn under them); off the horse (boarded, shot off), the horse runs on
  // riderless and drops back)
  for (const e of state.enemies) {
    if (riding(e)) { riders.add(e); continue; }
    if (riders.has(e)) { riders.delete(e); tr.horses.push({ x: e.pos.x + e.width / 2, vx: e.health > 0 ? -1 : -2, t: 0, seed: seedOf(e) }); }
  }
  for (const h of tr.horses) { h.t++; h.vx -= 0.03; h.x += h.vx; }
  tr.horses = tr.horses.filter(h => h.t < 300);
};

const spawnRobbers = (state: GameState, n: number) => {
  const tr = trainOf(state), v = viewOf(state);
  for (let k = 0; k < n; k++) {
    const x = v.x - 90 - k * 130;
    const e = makeKindEnemy('m2:fr_robber' as EnemyKind, x, FG_GROUND);
    e.variant = (Math.round(x) + k) % 7; e.aiState = 'ride'; e.facing = 1; e.seen = true;
    state.enemies.push(e);
  }
  if (!tr.said.robbers) {
    tr.said.robbers = true;
    tubeSay(state, TUBE_ROBBERS);
    meatheadSays(state, pickLine(byPants(state, TRAIN_GAGS.robbers)));
  }
};

/** Stood up in its way (or jumping): the bridge's underside clotheslines him back along the roof. */
const bridgeHits = (ctx: FrameContext, q: Passer) => {
  const { state } = ctx, p = state.player, tr = trainOf(state), v = viewOf(state);
  if (q.x > v.x + v.w + 40) return;
  const over = p.pos.x + p.width - 6 > q.x && p.pos.x + 6 < q.x + q.len && p.pos.y < BRIDGE_Y;
  if (over && !(p.isDucking && p.isGrounded) && tr.hitCd <= 0 && p.health > 0 && !p.inCutscene) {
    tr.hitCd = 40;
    hurtPlayer(ctx, 14, 'm2:fr_bridge', { x: -7, y: -3 });
    p.pos.x = Math.min(p.pos.x, q.x - p.width + 2);
    playSound('thud', 1, -8); playSound('crack', 0.6, -4);
  }
  for (const e of hazardVictims(state, { flyers: true, not: notRiding })) {
    if (!boxHits(e, q.x, -2000, q.len, BRIDGE_Y + 2000)) continue;
    if (once(q, e)) hazardHit(ctx, e, 40, q.x + q.len, 'LOW BRIDGE!', { knock: 10 });
  }
};

/** Up on top of anything under it: hosed back hard. Inside, or down on a deck, it goes over him. */
const towerHits = (ctx: FrameContext, q: Passer) => {
  const { state } = ctx, p = state.player, tr = trainOf(state), v = viewOf(state);
  if (q.x > v.x + v.w + 40) return;
  const feet = p.pos.y + p.height;
  const under = p.pos.x + p.width - 4 > q.x && p.pos.x + 4 < q.x + q.len;
  const car = carAt(tr, p.pos.x + p.width / 2), covered = car >= 0 && insideCar(state, tr, car);
  if (under && !covered && feet < DECK - 10 && tr.hitCd <= 0 && p.health > 0 && !p.inCutscene) {
    tr.hitCd = 30;
    hurtPlayer(ctx, 12, 'm2:fr_spout', { x: -9, y: -2 });
    playSound('splash', 1, -2);
    for (let n = 0; n < 14; n++) state.particles.push({ pos: { x: p.pos.x + p.width / 2, y: p.pos.y + 10 }, vel: { x: -2 - Math.random() * 6, y: (Math.random() - 0.7) * 6 }, life: 30, color: n % 2 ? '#BAE6FD' : '#E0F2FE', size: 3 });
  }
  for (const e of hazardVictims(state, { flyers: true, not: notRiding })) {
    if (!boxHits(e, q.x, -2000, q.len, 4000) || e.pos.y + e.height > DECK - 10) continue;
    if (once(q, e)) hazardHit(ctx, e, 24, q.x + q.len, 'HOSED!', { knock: 12 });
  }
};

/** The waterfall: him outside under it (true); the cast outside under it, swept off. */
const fallsHits = (ctx: FrameContext, q: Passer) => {
  const { state } = ctx, p = state.player, tr = trainOf(state);
  const pcx = p.pos.x + p.width / 2;
  for (const e of [...state.enemies]) {
    if (e.health <= 0 || e.type === 'boss' || e.isBlownAway || notRiding(e)) continue;
    const ex = e.pos.x + e.width / 2;
    if (ex < q.x || ex > q.x + q.len || e.pos.y + e.height > GY - 4 || roomAt(tr, ex, e.pos.y + e.height - 2) >= 0) continue;
    if (e.seen) hazardKill(ctx, e, q.x + q.len, 'SWEPT AWAY!', { fling: { x: -9, y: 5 }, sound: 'splash' });
    else state.enemies = state.enemies.filter(o => o !== e);
  }
  return pcx > q.x && pcx < q.x + q.len && p.health > 0 && !p.inCutscene && playerRoom(state, tr) < 0;
};

/** Him under the waterfall, outside: battered (pushed back, pressed down), then swept off the train. Inside, it eases. */
const soakHim = (ctx: FrameContext, under: boolean) => {
  const { state } = ctx, tr = trainOf(state), p = state.player;
  if (!under) { tr.soak = Math.max(0, tr.soak - 2); return; }
  tr.soak++;
  p.pos.x -= 1.6; p.vel.y = Math.max(p.vel.y, 1.2);
  if (state.frame % 3 === 0) for (let n = 0; n < 3; n++) state.particles.push({ pos: { x: p.pos.x + Math.random() * p.width, y: p.pos.y + Math.random() * 20 }, vel: { x: -1 - Math.random() * 3, y: 2 + Math.random() * 3 }, life: 18, color: n % 2 ? '#E0F2FE' : '#BAE6FD', size: 3 });
  if (tr.soak === 1 || tr.soak === 28) { hurtPlayer(ctx, 10, 'm2:fr_falls', { x: -6, y: 2 }); playSound('splash', 1, -6); }
  if (tr.soak >= SWEPT && p.health > 0) {
    // (off the train with it: down past the cars into the gorge)
    p.invincibilityTimer = 0;
    p.vel.x = -7; p.vel.y = 8;
    for (let n = 0; n < 30; n++) state.particles.push({ pos: { x: p.pos.x + p.width / 2, y: p.pos.y + 20 }, vel: { x: (Math.random() - 0.8) * 8, y: Math.random() * 8 }, life: 40, color: n % 3 ? '#E0F2FE' : '#7DD3FC', size: 3 + Math.random() * 3 });
    playSound('splash', 1, -12); playSound('screams', 0.7, 2);
    hurtPlayer(ctx, 9999, 'm2:fr_falls');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const STONE = '#2A2622', STONE_L = '#3A3530';

/** World, behind the train: the inside of whatever tunnel's on screen (dark stone, a lamp on the wall now and then),
 *  over the far side's embankment and the scenery. */
export const drawTunnelInside = (c: Ctx, state: GameState) => {
  const tr = trainOf(state), v = viewOf(state), top = v.y - 60;
  for (const q of tr.passers) {
    if (q.kind !== 'tunnel') continue;
    const a = Math.max(v.x - 60, q.x), b = Math.min(v.x + v.w + 60, q.x + q.len);
    if (b <= a) continue;
    box(c, a, top, b - a, GY - 6 - top, STONE);
    // (the courses of the fake rock, and its bolts: it's the park's tunnel too)
    for (let y = top + 30; y < GY - 10; y += 46) box(c, a, y, b - a, 3, STONE_L);
    for (let x = q.x + 45; x < b; x += 90) if (x > a) for (let y = top + 52; y < GY - 40; y += 92) box(c, x, y, 3, 3, '#57534E');
    // (lamps on the wall going by: small, dim)
    for (let x = q.x + 200; x < q.x + q.len - 100; x += 420) {
      if (x < a - 20 || x > b + 20) continue;
      box(c, x - 4, BERM_Y - 40, 8, 12, INK); box(c, x - 3, BERM_Y - 39, 6, 10, '#B8A060');
    }
  }
};
/** The tunnels' lamps (world), for the lighting: dim little pools (the playtest: no spotlights). */
export const tunnelLamps = (state: GameState) => {
  const tr = trainOf(state), v = viewOf(state), out: { x: number; y: number; r: number; a: number; color: string }[] = [];
  for (const q of tr.passers) if (q.kind === 'tunnel') for (let x = q.x + 200; x < q.x + q.len - 100; x += 420) if (x > v.x - 100 && x < v.x + v.w + 100) out.push({ x, y: BERM_Y - 34, r: 80, a: 0.32, color: '#3A2E14' });
  return out;
};

/** Behind the train: the bridges' far legs, the water towers, the waterfall's cliff and its water behind the train, the
 *  signs up by the line. */
export const drawPassersBack = (c: Ctx, state: GameState) => {
  const tr = trainOf(state), f = state.frame, v = viewOf(state), top = v.y - 60;
  for (const q of tr.passers) {
    if (q.x > v.x + v.w + 100 || q.x + q.len < v.x - 100) continue;
    if (q.kind === 'bridge') {
      // (the far trestle: timber legs down to the far bank, cross-braced)
      for (const lx of [q.x + 6, q.x + q.len - 14]) box(c, lx, BRIDGE_Y, 8, GY - BRIDGE_Y, '#4A3220');
      c.strokeStyle = '#4A3220'; c.lineWidth = 3; c.beginPath(); c.moveTo(q.x + 10, BRIDGE_Y + 10); c.lineTo(q.x + q.len - 10, GY - 20); c.moveTo(q.x + q.len - 10, BRIDGE_Y + 10); c.lineTo(q.x + 10, GY - 20); c.stroke();
    } else if (q.kind === 'tower') {
      // (the tower beside the line: the wooden tank on its legs, its spout swung out over the train)
      const tx = q.x + q.len / 2;
      for (const lx of [tx - 50, tx + 42]) box(c, lx, ROOF - 120, 8, GY - ROOF + 120, '#5A3A1E');
      box(c, tx - 60, ROOF - 230, 120, 112, INK); box(c, tx - 58, ROOF - 228, 116, 108, '#8A5A30'); box(c, tx - 58, ROOF - 228, 116, 6, '#B07A48');
      for (let k = 0; k < 4; k++) box(c, tx - 58, ROOF - 210 + k * 24, 116, 3, '#3F3F46');
      c.fillStyle = INK; c.beginPath(); c.moveTo(tx - 64, ROOF - 228); c.lineTo(tx, ROOF - 266); c.lineTo(tx + 64, ROOF - 228); c.closePath(); c.fill();
      box(c, tx - 4, ROOF - 140, 8, 40, '#3F3F46');
    } else if (q.kind === 'falls') {
      // (the park's fake cliff over the line, its lip up out of the top of the screen, and the water pouring off it
      // behind the train, white and churning)
      const a = Math.max(v.x - 60, q.x - 60), b = Math.min(v.x + v.w + 60, q.x + q.len + 60);
      box(c, a, top, b - a, BERM_Y - top, '#6A5A48');
      for (let y = top + 20; y < BERM_Y; y += 34) box(c, a, y, b - a, 2, '#5A4A3A');
      for (let x = Math.ceil(q.x / 80) * 80; x < b; x += 80) if (x > a) box(c, x, top + 40 + ((x / 80) % 3) * 30, 3, 3, '#A8A29E');
      const wa = Math.max(a, q.x), wb = Math.min(b, q.x + q.len);
      if (wb > wa) {
        box(c, wa, top, wb - wa, RAIL - 1 - top, '#9BD4F0');
        for (let x = wa - ((wa - q.x) % 14); x < wb; x += 14) { const o = (f * 11 + x * 3) % 60; box(c, Math.max(wa, x), top + o, 4, 40, '#E0F2FE'); box(c, Math.max(wa, x) + 6, top + ((o + 30) % 60) + 30, 3, 26, '#C8EAF8'); }
      }
    } else if (q.kind === 'sign') {
      // (up on two tall posts by the line, over the roofs: readable, nothing over it)
      const sx = q.x, sy = ROOF - 150;
      for (const px of [sx + 14, sx + q.len - 22]) box(c, px, sy, 8, BERM_Y - sy, '#5A3A1E');
      box(c, sx - 2, sy - 2, q.len + 4, 70, INK); box(c, sx, sy, q.len, 66, '#A0703C'); box(c, sx, sy, q.len, 3, '#C89A5C');
      (q.text ?? []).forEach((l, i) => signText(c, l, sx + q.len / 2, sy + 18 + i * 18, burned(1, 4)));
    }
  }
};

/** In front of the train: the bridges' decks, the water pouring, the tunnels' portals, the waterfall coming down over
 *  everything outside (inside the car he's in, it's down the windows). */
export const drawPassersFront = (c: Ctx, state: GameState) => {
  const tr = trainOf(state), f = state.frame, v = viewOf(state), top = v.y - 60;
  for (const q of tr.passers) {
    if (q.x > v.x + v.w + 100 || q.x + q.len < v.x - 100) continue;
    if (q.kind === 'bridge') {
      // (the deck seen end on: heavy timbers, a railing on top, the underside striped: it's low, and it's solid)
      box(c, q.x - 2, top, q.len + 4, BRIDGE_Y - top, INK);
      box(c, q.x, top, q.len, BRIDGE_Y - top - 2, '#6B4423');
      for (let y = BRIDGE_Y - 34; y > top; y -= 18) box(c, q.x, y, q.len, 2, '#4A2C16');
      box(c, q.x, BRIDGE_Y - 34, q.len, 3, '#9A6A3A');
      for (let k = 0; k < q.len; k += 12) box(c, q.x + k, BRIDGE_Y - 10, 6, 8, (k / 12) % 2 ? '#18181B' : '#FACC15');
      signText(c, 'LOW', q.x + q.len / 2, BRIDGE_Y - 40, painted(2, '#FACC15', '#1C1209'));
    } else if (q.kind === 'tower') {
      // (the water coming down out of the spout, onto whatever's under it)
      const xm = q.x + q.len / 2, land = floorTopAt(state.blocks, xm, ROOF - 120, 0) ?? GY;
      c.globalAlpha = 0.85; box(c, q.x + 6, ROOF - 100, q.len - 12, land - ROOF + 100, '#7DD3FC'); c.globalAlpha = 1;
      for (let y = ROOF - 100 + (f * 9) % 24; y < land; y += 24) box(c, q.x + 10 + ((y * 7) % 14), y, 4, 12, '#E0F2FE');
      for (let n = 0; n < 4; n++) { const k = ((f * 0.1 + n / 4) % 1); box(c, xm - 30 + k * 60 - 30 * (n % 2), land - k * 16, 5, 5, '#E0F2FE'); }
    } else if (q.kind === 'tunnel') {
      for (const [px, near] of [[q.x, true], [q.x + q.len - 70, false]] as const) portal(c, px, top, near);
    } else if (q.kind === 'falls') {
      drawFallsFront(c, state, q, top);
    }
  }
};

/** The waterfall's sheet over the train (clipped out of the inside of the car he's in: there it streams down the
 *  windows), its mist ahead and behind. */
const drawFallsFront = (c: Ctx, state: GameState, q: Passer, top: number) => {
  const tr = trainOf(state), f = state.frame;
  const room = playerRoom(state, tr);
  c.save();
  if (room >= 0) {
    const rx = carXNow(tr, room) + END, rw = CARS[room].len - 2 * END;
    c.beginPath(); c.rect(q.x - 200, top - 10, q.len + 400, GY + 400 - top); c.rect(rx, CEIL, rw, DECK - CEIL); c.clip('evenodd');
  }
  // (the mist off it, either side)
  for (let n = 0; n < 10; n++) {
    const side = n % 2 ? q.x - 40 - ((f * 1.3 + n * 37) % 160) : q.x + q.len + ((f * 1.1 + n * 41) % 160);
    c.globalAlpha = 0.18; c.fillStyle = '#E0F2FE'; c.beginPath(); c.arc(side, GY - 80 - ((n * 57) % 260), 30 + (n % 3) * 12, 0, Math.PI * 2); c.fill();
  }
  // (the sheet: pale blue, see-through enough to make out the train under it, white streaks pouring)
  c.globalAlpha = 0.62; box(c, q.x, top, q.len, GY + 40 - top, '#A5DAF4'); c.globalAlpha = 1;
  for (let x = q.x + ((f * 2) % 10); x < q.x + q.len; x += 10) { const o = (f * 14 + x * 5) % 90; box(c, x, top + o, 3, 54, 'rgba(240, 249, 255, 0.75)'); box(c, x + 4, top + ((o + 45) % 90) + 40, 2, 34, 'rgba(224, 242, 254, 0.6)'); }
  // (spray thrown up off the roofs)
  for (let n = 0; n < 14; n++) { const sx = q.x + ((n * 97 + f * 3) % Math.max(1, q.len)), k = (f * 0.07 + n / 14) % 1; box(c, sx, ROOF - k * 40, 4, 4, '#F0F9FF'); }
  c.restore();
  // (inside: the water down the windows of the car he's in)
  if (room >= 0) {
    const rx = carXNow(tr, room) + END, rw = CARS[room].len - 2 * END;
    const a = Math.max(rx, q.x), b = Math.min(rx + rw, q.x + q.len);
    if (b > a) { c.globalAlpha = 0.25; for (let x = a; x < b; x += 7) { const o = (f * 9 + x * 3) % 40; box(c, x, CEIL + 60 + o, 2, 30, '#BAE6FD'); } c.globalAlpha = 1; }
  }
};

/** A portal: a fake-rock face over the line (its bolts showing), a timber arch round the bore, its sign. */
const portal = (c: Ctx, x: number, top: number, entry: boolean) => {
  const archTop = ROOF - 80;
  box(c, x - 2, top, 74, archTop - top + 2, INK);
  box(c, x, top, 70, archTop - top, '#7A6A58');
  for (let y = top + 12; y < archTop - 10; y += 26) { box(c, x + 6 + ((y * 3) % 20), y, 22, 10, mix('#7A6A58', '#FFFFFF', 0.12)); box(c, x + 40 - ((y * 5) % 16), y + 12, 18, 8, mix('#7A6A58', '#000000', 0.2)); }
  for (let y = top + 30; y < archTop - 20; y += 60) { box(c, x + 8, y, 3, 3, '#A8A29E'); box(c, x + 58, y + 20, 3, 3, '#A8A29E'); }
  box(c, x - 4, archTop - 14, 78, 14, '#5A3A1E'); box(c, x - 4, archTop - 14, 78, 3, '#8A5A30');
  if (entry) { box(c, x + 2, archTop - 34, 66, 16, '#A0703C'); signText(c, 'TUNNEL', x + 35, archTop - 22, burned(1, 5)); }
};

/** The near side of the line, nearest the eye (drawn over the train): its bank going by (dark stone in a tunnel, the
 *  plunge pool's churn under a waterfall), the robbers on their horses and leaping off them, the riderless horses. */
export const drawNearLane = (c: Ctx, state: GameState) => {
  const tr = trainOf(state), f = state.frame, v = viewOf(state);
  const a = v.x - 80, b = v.x + v.w + 80, y0 = GY + 8, h = v.y + v.h + 200 - y0;
  box(c, a, y0, b - a, h, '#5E6A38'); box(c, a, y0, b - a, 3, '#3A4422');
  for (let x = Math.floor((a + tr.dist * 1.25) / 46) * 46 - tr.dist * 1.25; x < b; x += 46) { box(c, x, y0 + 10 + ((Math.abs(Math.round(x)) * 7) % 22), 10, 3, '#4A5A2A'); box(c, x + 20, y0 + 30 + ((Math.abs(Math.round(x)) * 3) % 26), 6, 6, '#7A8A48'); }
  for (const q of tr.passers) {
    const qa = Math.max(a, q.x), qb = Math.min(b, q.x + q.len);
    if (qb <= qa) continue;
    if (q.kind === 'tunnel') { box(c, qa, y0, qb - qa, h, STONE); for (let y = y0 + 20; y < y0 + h; y += 40) box(c, qa, y, qb - qa, 2, STONE_L); }
    else if (q.kind === 'falls') { box(c, qa, y0, qb - qa, h, '#5BA8D0'); for (let x = qa - ((qa * 1) % 12); x < qb; x += 12) box(c, Math.max(qa, x), y0 + ((f * 5 + x) % 30), 6, 3, '#E0F2FE'); }
  }
  // (the robbers on their horses, in the near lane: bigger, nearer)
  for (const e of state.enemies) {
    if (riding(e)) {
      c.save(); c.translate(Math.round(e.pos.x + e.width / 2), FG_GROUND); c.scale(FG_SCALE, FG_SCALE);
      drawRider(c, e, 0, -50, f, seedOf(e));
      c.restore();
    } else if (boarding(e)) {
      const s = FG_SCALE + (1 - FG_SCALE) * leapK(e);
      c.save(); c.translate(Math.round(e.pos.x + e.width / 2), Math.round(e.pos.y + e.height)); c.scale(s, s);
      drawRobberAt(c, e, f, seedOf(e));
      c.restore();
    }
  }
  for (const hh of tr.horses) { c.save(); c.translate(hh.x, FG_GROUND); c.scale(FG_SCALE, FG_SCALE); drawHorse(c, 0, 0, 1, f, hh.seed); c.restore(); }
};

/** Screen space: the warnings at the right edge for what's coming (what, and what to do). */
export const drawWarnings = (c: Ctx, state: GameState) => {
  const tr = trainOf(state), f = state.frame, v = viewOf(state);
  let y = 250;
  for (const q of tr.passers) {
    if (q.x < v.x + v.w + 4 || q.kind === 'bumper' || q.kind === 'hill' || q.kind === 'sign') continue;
    if (f % 20 < 6) { y += 52; continue; }
    const [what, todo] = q.kind === 'bridge' ? ['LOW BRIDGE', ''] : q.kind === 'tower' ? ['WATER TOWER', 'GET INSIDE!'] : q.kind === 'falls' ? ['WATERFALL', 'GET INSIDE!'] : ['TUNNEL', ''];
    box(c, CANVAS_WIDTH - 142, y - 22, 136, todo ? 44 : 30, INK); box(c, CANVAS_WIDTH - 140, y - 20, 132, todo ? 40 : 26, q.kind === 'falls' ? '#1E3A5F' : '#7F1D1D');
    label(c, `${what} >`, CANVAS_WIDTH - 74, y - 3, '#FDE047', 8);
    if (todo) label(c, todo, CANVAS_WIDTH - 74, y + 13, '#FEF3C7', 8);
    y += 52;
  }
};
