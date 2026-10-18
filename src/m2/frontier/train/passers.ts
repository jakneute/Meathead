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
import { painted, burned, parkSign } from '../kit';
import { type Ctx, box, mix, hash, checker, INK, stillAt, N, near, fiberglass, post, slab, planks, boards, lip, puff, FIBER, STONE, PLANK, STEEL, WATER, GRASS, DIRT, BLACK, VARNISH, RED, BRASS } from './paint';
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

/** The tunnel's inside wall, a tile 420 wide, from TUN_TOP down to the ballast: the park's fiberglass shell gone dark
 *  (molded courses, seams and bolts), steel arch ribs, a conduit along it, soot streaked up from the stacks. */
const TUN_W = 420, TUN_TOP = -460;
const paintTunnel = (g: Ctx) => {
  const F = FIBER.map(c => mix(c, '#0A0806', 0.55)), S = STEEL.map(c => mix(c, '#000000', 0.45));
  const h = GY - 6 - TUN_TOP;
  fiberglass(g, 0, TUN_TOP, TUN_W, h, F, 7, true);
  // (soot up the wall from the stacks, darker toward the crown)
  for (let i = 0; i < 6; i++) { g.globalAlpha = 0.12 + i * 0.05; g.fillStyle = '#060404'; g.fillRect(0, TUN_TOP, TUN_W, (h * (6 - i)) / 10); }
  g.globalAlpha = 1;
  // (the ribs: steel arches every 140, riveted)
  for (let x = 30; x < TUN_W; x += 140) { box(g, x - 1, TUN_TOP, 12, h, INK); box(g, x, TUN_TOP, 10, h, S[3]); box(g, x, TUN_TOP, 2, h, S[5]); box(g, x + 8, TUN_TOP, 2, h, S[1]); for (let y = TUN_TOP + 10; y < GY - 10; y += 22) { box(g, x + 4, y, 2, 2, INK); box(g, x + 4, y, 1, 1, S[6]); } }
  // (the conduit, its brackets; a cable sagging)
  box(g, 0, BERM_Y - 66, TUN_W, 6, INK); box(g, 0, BERM_Y - 65, TUN_W, 4, S[2]); box(g, 0, BERM_Y - 65, TUN_W, 1, S[4]);
  for (let x = 10; x < TUN_W; x += 70) { box(g, x, BERM_Y - 68, 4, 10, S[1]); }
  g.strokeStyle = 'rgba(0,0,0,0.7)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, BERM_Y - 52); g.quadraticCurveTo(TUN_W / 2, BERM_Y - 36, TUN_W, BERM_Y - 52); g.stroke();
  // (the foot of the wall: a gutter, wet)
  box(g, 0, GY - 30, TUN_W, 24, F[1]); box(g, 0, GY - 30, TUN_W, 2, F[3]); checker(g, 0, GY - 26, TUN_W, 2, F[2], 0);
  for (let x = 6; x < TUN_W; x += 23) box(g, x, GY - 22, 6, 1, '#3A4A5A');
};

/** World, behind the train: the inside of whatever tunnel's on screen (the park's shell, dark; a lantern on the wall now
 *  and then), over the far side's embankment and the scenery. */
export const drawTunnelInside = (c: Ctx, state: GameState) => {
  const tr = trainOf(state), v = viewOf(state), top = v.y - 60;
  for (const q of tr.passers) {
    if (q.kind !== 'tunnel') continue;
    const a = Math.max(v.x - 60, q.x), b = Math.min(v.x + v.w + 60, q.x + q.len);
    if (b <= a) continue;
    c.save(); c.beginPath(); c.rect(a, top, b - a, GY - 6 - top); c.clip();
    if (top < TUN_TOP) box(c, a, top, b - a, TUN_TOP - top + 2, '#0A0806');
    for (let x = q.x + Math.floor((a - q.x) / TUN_W) * TUN_W; x < b; x += TUN_W) stillAt(c, 'tr-tunnel', x, 0, 0, TUN_TOP, TUN_W, GY - 6 - TUN_TOP, paintTunnel);
    c.restore();
    // (the lanterns on the wall going by: caged, small, dim)
    for (let x = q.x + 200; x < q.x + q.len - 100; x += 420) {
      if (x < a - 20 || x > b + 20) continue;
      stillAt(c, 'tr-tunlamp', x, BERM_Y - 34, -8, -16, 16, 26, g => {
        box(g, -2, -16, 4, 4, INK); box(g, -6, -12, 12, 3, INK); box(g, -5, -11, 10, 1, BRASS[3]);
        box(g, -5, -9, 10, 12, INK); box(g, -4, -8, 8, 10, '#E8C870'); box(g, -4, -8, 3, 10, '#FFF0B8');
        for (const dx of [-3, 0, 3]) box(g, dx, -8, 1, 10, '#3A3020');
        box(g, -6, 3, 12, 3, INK); box(g, -5, 3, 10, 2, BRASS[2]);
      });
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
      // (the far bent: timber legs down to the far bank on their stone footing, cross-braced, the stringers' ends)
      stillAt(c, 'tr-bent', q.x, GY, -14, BRIDGE_Y - GY - 4, q.len + 28, GY - BRIDGE_Y + 6, g => {
        const P = PLANK.map(col => mix(col, '#1A120C', 0.25)), S = STONE;
        box(g, -12, -24, q.len + 24, 24, INK); box(g, -11, -23, q.len + 22, 22, S[3]); for (let x = -8; x < q.len + 8; x += 14) { box(g, x, -22, 12, 9, S[4]); box(g, x + 6, -12, 12, 9, S[2]); box(g, x, -22, 12, 1, S[5]); }
        for (const lx of [4, q.len - 14]) post(g, lx + 5, BRIDGE_Y - GY, -22, 10, P);
        g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(8, BRIDGE_Y - GY + 14); g.lineTo(q.len - 8, -34); g.moveTo(q.len - 8, BRIDGE_Y - GY + 14); g.lineTo(8, -34); g.stroke();
        g.strokeStyle = P[3]; g.lineWidth = 4; g.stroke();
        for (const by of [BRIDGE_Y - GY + 40, -120]) { box(g, 0, by, q.len, 7, INK); box(g, 1, by + 1, q.len - 2, 5, P[3]); box(g, 1, by + 1, q.len - 2, 1, P[5]); }
      });
    } else if (q.kind === 'tower') {
      // (the station's water tower beside the line: timber legs braced, the tank in staves and iron hoops, its cone of
      // shakes; its spout's swung out over the train (drawn in front))
      const tx = q.x + q.len / 2;
      stillAt(c, 'tr-tower', tx, BERM_Y, -86, ROOF - 284 - BERM_Y, 172, BERM_Y - ROOF + 288, g => paintTower(g, BERM_Y - (ROOF - 118)));
    } else if (q.kind === 'falls') {
      // (the park's fake cliff over the line (fiberglass in molded courses, seams, bolts), its lip up out of the top of
      // the screen, and the water pouring off it behind the train)
      const a = Math.max(v.x - 60, q.x - 60), b = Math.min(v.x + v.w + 60, q.x + q.len + 60);
      c.save(); c.beginPath(); c.rect(a, top, b - a, BERM_Y + 4 - top); c.clip();
      for (let x = q.x - 60 + Math.floor((a - (q.x - 60)) / CLIFF_W) * CLIFF_W; x < b; x += CLIFF_W) stillAt(c, 'tr-cliff', x, 0, 0, TUN_TOP, CLIFF_W, BERM_Y + 4 - TUN_TOP, paintCliff);
      if (top < TUN_TOP) box(c, a, top, b - a, TUN_TOP - top + 2, mix(FIBER[2], '#000000', 0.2));
      c.restore();
      const wa = Math.max(a, q.x), wb = Math.min(b, q.x + q.len);
      if (wb > wa) {
        const Wt = WATER;
        bandedGradientX(c, wa, top, wb - wa, RAIL - 1 - top, [Wt[7], Wt[6], Wt[7], Wt[6], Wt[7], Wt[8]]);
        for (let x = wa - ((wa - q.x) % 12); x < wb; x += 12) { const o = (f * 11 + x * 3) % 60; box(c, Math.max(wa, x), top + o, 3, 44, Wt[8]); box(c, Math.max(wa, x) + 6, top + ((o + 30) % 60) + 30, 2, 26, Wt[7]); box(c, Math.max(wa, x) + 3, top + ((o + 15) % 60) + 10, 1, 18, Wt[3]); }
        // (white water where it hits behind the line)
        for (let x = wa; x < wb; x += 16) puff(c, x + 8, RAIL - 12 - ((f * 2 + x) % 12), 12 + ((x * 7) % 6), ['#9ACCE0', '#D8EEF6', '#FFFFFF'], 0.9);
      }
    } else if (q.kind === 'sign') {
      // (up on two tall peeled posts by the line, over the roofs: readable, nothing over it: the park's warning plank)
      parkSign(c, q.x + q.len / 2, BERM_Y, q.text ?? [], { warn: true, tall: BERM_Y - (ROOF - 150), seed: 4 });
    }
  }
};

/** The near bank, a tile (nearest the eye: below the rails, going by faster than the train's own ground): the
 *  ballast's shoulder, then the park's mowed grass banded down, tufts bigger the nearer, stones, clover and
 *  wildflowers, a sprinkler head, a guest's dropped park map. */
const NEAR_W = 320, NEAR_H = 260;
const paintNear = (g: Ctx) => {
  const G = near(GRASS), D = near(DIRT), S = near(STONE);
  box(g, 0, -2, NEAR_W, 16, S[2]);
  for (let i = 0; i < 60; i++) { const x = hash(i * 2.1) * NEAR_W, y = -2 + hash(i * 5.7) * 14; box(g, x, y, 3, 2, i % 3 ? S[3] : S[5]); box(g, x, y + 2, 3, 1, S[1]); }
  box(g, 0, 12, NEAR_W, 4, D[2]); checker(g, 0, 10, NEAR_W, 2, D[3], 0);
  const bands = [G[4], G[3], G[3], G[3], G[2], G[2], G[1]];
  bands.forEach((col, i) => { const y = 16 + (i * (NEAR_H - 16)) / bands.length; box(g, 0, y, NEAR_W, (NEAR_H - 16) / bands.length + 1, col); if (i) checker(g, 0, y - 1, NEAR_W, 2, bands[i - 1], i % 2); });
  // (tufts: small up near the rails, bigger lower down (nearer))
  for (let i = 0; i < 90; i++) {
    const y = 18 + hash(i * 3.3) * (NEAR_H - 30), k = (y - 16) / NEAR_H, x = hash(i * 7.9) * NEAR_W, th = 3 + k * 10, n = 2 + Math.round(k * 3);
    for (let j = 0; j < n; j++) { box(g, x + j * 2, y - th + (j % 2) * 2, 1 + Math.round(k), th, j % 2 ? G[5] : G[4]); }
    box(g, x - 1, y, n * 2 + 2, 1, G[1]);
  }
  for (let i = 0; i < 10; i++) { const x = hash(i * 11.3) * NEAR_W, y = 40 + hash(i * 4.7) * (NEAR_H - 60), r = 3 + hash(i) * 5; box(g, x - 1, y - 1, r * 2 + 2, r + 2, INK); box(g, x, y, r * 2, r, S[3]); box(g, x, y, r, 1, S[5]); box(g, x + r, y + r - 1, r, 1, S[1]); }
  for (let i = 0; i < 18; i++) { const x = hash(i * 5.9 + 1) * NEAR_W, y = 30 + hash(i * 8.3) * (NEAR_H - 40); box(g, x, y, 2, 2, ['#F2E8C0', '#E8C840', '#C890D8', '#F2F2EE'][i % 4]); box(g, x, y + 2, 1, 3, G[2]); }
  // (the sprinkler head; the map)
  box(g, 200, 70, 8, 4, INK); box(g, 201, 70, 6, 3, '#3A3A3A'); box(g, 202, 69, 4, 1, '#6A6A6A');
  g.save(); g.translate(80, 150); g.rotate(-0.2); box(g, -1, -1, 22, 16, INK); box(g, 0, 0, 20, 14, '#F2E8C8'); box(g, 2, 2, 7, 5, '#6A9A4A'); box(g, 11, 3, 6, 8, '#4A8AC8'); box(g, 0, 6, 20, 1, '#C8B890'); g.restore();
};

/** The covered bridge's top (its gable's peak): well up, so it reads solid as high as he can get. */
const BRIDGE_TOP = BRIDGE_Y - 200;
/** The covered bridge end on (local: its underside at 0): the beam striped along its foot, LOW painted on the deck's
 *  fascia, the stringers' ends, the portal's board and batten round the dark bore (the far end's light a speck down
 *  it), WALK YOUR HORSE over it, the shake gable. */
const paintBridge = (g: Ctx, w: number) => {
  const P = N(PLANK), R = N(RED), top = BRIDGE_TOP - BRIDGE_Y;
  // (the portal's face: barn red board and batten)
  box(g, -2, top + 58, w + 4, -top - 58, INK);
  planks(g, 0, top + 59, w, -top - 59, R, 8, 5);
  // (the bore: dark, banded back, the far end's daylight a speck)
  g.fillStyle = INK; g.beginPath(); g.roundRect(9, -128, w - 18, 96, [18, 18, 0, 0]); g.fill();
  g.save(); g.beginPath(); g.roundRect(10, -127, w - 20, 95, [17, 17, 0, 0]); g.clip();
  for (let i = 0; i < 5; i++) box(g, 10, -127 + i * 19, w - 20, 20, mix('#2A1A10', '#0A0604', i / 5));
  box(g, w / 2 - 5, -60, 10, 14, '#C8D8C0'); box(g, w / 2 - 4, -59, 4, 12, '#F2F8E8');
  for (let k = 0; k < 4; k++) { const ix = 12 + k * 3, iw = w - 24 - k * 6; box(g, ix, -127 + k * 6, 1, 95 - k * 6, P[1]); box(g, ix + iw - 1, -127 + k * 6, 1, 95 - k * 6, P[1]); }
  g.restore();
  // (the gable: shakes in rows over the overhang, the bargeboards)
  g.fillStyle = INK; g.beginPath(); g.moveTo(-20, top + 62); g.lineTo(w / 2, top - 2); g.lineTo(w + 20, top + 62); g.closePath(); g.fill();
  g.save(); g.beginPath(); g.moveTo(-17, top + 60); g.lineTo(w / 2, top + 2); g.lineTo(w + 17, top + 60); g.closePath(); g.clip();
  for (let r = 0; r < 10; r++) for (let x = -20 + (r % 2) * 5; x < w + 20; x += 10) { box(g, x, top + 54 - r * 6, 9, 6, P[2 + ((x + r) & 1)]); box(g, x, top + 59 - r * 6, 9, 1, P[5]); box(g, x + 8, top + 54 - r * 6, 1, 6, P[1]); }
  g.restore();
  box(g, -20, top + 60, w + 40, 5, INK); box(g, -19, top + 61, w + 38, 3, P[4]); box(g, -19, top + 61, w + 38, 1, P[6]);
  // (WALK YOUR HORSE on its board)
  box(g, -20, top + 70, w + 40, 16, INK); slab(g, -19, top + 71, w + 38, 14, P);
  signText(g, 'WALK YOUR HORSE', w / 2, top + 82, burned(1, 2));
  // (the deck: its planks' edge, the stringers' ends, the fascia with LOW, the underside's beam striped)
  box(g, -6, -38, w + 12, 38, INK);
  boards(g, -5, -37, w + 10, 6, P, 6, 3);
  for (let x = -4; x < w + 2; x += 11) { box(g, x, -31, 10, 9, P[2]); box(g, x + 1, -30, 8, 2, P[5]); box(g, x + 3, -27, 4, 3, P[1]); }
  box(g, -5, -22, w + 10, 12, P[3]); box(g, -5, -22, w + 10, 1, P[5]);
  signText(g, 'LOW', w / 2, -12, painted(1, '#FACC15', '#1C1209'));
  for (let k = -5; k < w + 5; k += 12) box(g, k, -10, 6, 9, (Math.floor((k + 5) / 12)) % 2 ? '#18181B' : '#FACC15');
  box(g, -5, -10, w + 10, 1, INK); box(g, -5, -1, w + 10, 1, INK);
};

/** The station's water tower (local: its feet at 0, the tank's foot `legH` up): braced timber legs, the hooped tank in
 *  staves, the shake cone, the spout's elbow (its arm's drawn over the train). */
const paintTower = (g: Ctx, legH: number) => {
  const P = N(PLANK), B = N(BLACK), V = N(VARNISH);
  for (const lx of [-54, 46]) { box(g, lx - 1, -legH - 4, 12, legH + 4, INK); box(g, lx, -legH - 3, 10, legH + 3, P[2]); box(g, lx, -legH - 3, 3, legH + 3, P[4]); box(g, lx + 8, -legH - 3, 2, legH + 3, P[1]); }
  g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); for (let y = -legH + 6; y < -20; y += 44) { g.moveTo(-48, y); g.lineTo(50, y + 44); g.moveTo(50, y); g.lineTo(-48, y + 44); } g.stroke();
  g.strokeStyle = P[2]; g.lineWidth = 3; g.stroke();
  for (let y = -legH + 6; y < -20; y += 44) { box(g, -54, y - 2, 110, 5, INK); box(g, -53, y - 1, 108, 3, P[3]); box(g, -53, y - 1, 108, 1, P[5]); }
  box(g, -66, -legH - 8, 132, 8, INK); box(g, -65, -legH - 7, 130, 6, P[3]); box(g, -65, -legH - 7, 130, 1, P[5]);
  const t0 = -legH - 8 - 104;
  box(g, -61, t0 - 1, 122, 106, INK); box(g, -60, t0, 120, 104, V[3]);
  for (let x = -60; x < 60; x += 8) { box(g, x, t0, 1, 104, V[2]); box(g, x + 1, t0, 2, 104, V[4]); }
  box(g, -60, t0, 12, 104, V[5]); box(g, 48, t0, 12, 104, V[1]); checker(g, 40, t0, 8, 104, V[2], 0);
  for (const hy of [t0 + 8, t0 + 36, t0 + 64, t0 + 92]) { box(g, -61, hy, 122, 3, INK); box(g, -60, hy, 120, 1, B[5]); }
  g.fillStyle = INK; g.beginPath(); g.moveTo(-70, t0 + 2); g.lineTo(0, t0 - 44); g.lineTo(70, t0 + 2); g.closePath(); g.fill();
  g.fillStyle = P[2]; g.beginPath(); g.moveTo(-66, t0); g.lineTo(0, t0 - 40); g.lineTo(66, t0); g.closePath(); g.fill();
  g.fillStyle = P[4]; g.beginPath(); g.moveTo(-66, t0); g.lineTo(0, t0 - 40); g.lineTo(-12, t0); g.closePath(); g.fill();
  for (let k = 1; k < 5; k++) box(g, -66 + k * 13, t0 - k * 8, 132 - k * 26, 1, P[1]);
  box(g, -3, t0 - 48, 6, 6, INK); box(g, -2, t0 - 47, 4, 4, B[4]);
  // (the spout's elbow on the tank's front, the chain to swing it)
  box(g, -12, t0 + 70, 24, 16, INK); box(g, -11, t0 + 71, 22, 14, B[3]); box(g, -11, t0 + 71, 22, 2, B[5]);
};

/** The waterfall's cliff, a tile: the park's fiberglass in molded courses, seams with their bolts, moss where it's wet,
 *  the white gelcoat where it's chipped. */
const CLIFF_W = 360;
const paintCliff = (g: Ctx) => {
  const F = N(FIBER), h = BERM_Y + 4 - TUN_TOP;
  fiberglass(g, 0, TUN_TOP, CLIFF_W, h, F, 13, true);
  for (let i = 0; i < 30; i++) { const x = hash(i * 2.9) * CLIFF_W, y = TUN_TOP + hash(i * 6.1) * h; box(g, x, y, 4 + hash(i) * 8, 2, '#3A5A2A'); box(g, x + 1, y - 1, 3, 1, '#5A7A3A'); }
  for (let i = 0; i < 12; i++) { const x = hash(i * 9.1) * CLIFF_W, y = TUN_TOP + hash(i * 3.3) * h; box(g, x, y, 1, 10 + hash(i) * 30, F[1]); }
  box(g, 0, BERM_Y - 16, CLIFF_W, 20, F[1]); checker(g, 0, BERM_Y - 20, CLIFF_W, 4, F[2], 0);
};
/** A water column banded down (top to bottom), dithered seams. */
const bandedGradientX = (c: Ctx, x: number, y: number, w: number, h: number, stops: string[]) => {
  const n = stops.length;
  for (let i = 0; i < n; i++) { box(c, x, y + (i * h) / n, w, h / n + 1, stops[i]); if (i) checker(c, x, y + (i * h) / n - 1, w, 2, stops[i - 1], i % 2); }
};

/** In front of the train: the bridges' decks, the water pouring, the tunnels' portals, the waterfall coming down over
 *  everything outside (inside the car he's in, it's down the windows). */
export const drawPassersFront = (c: Ctx, state: GameState) => {
  const tr = trainOf(state), f = state.frame, v = viewOf(state), top = v.y - 60;
  for (const q of tr.passers) {
    if (q.x > v.x + v.w + 100 || q.x + q.len < v.x - 100) continue;
    if (q.kind === 'bridge') {
      // (a covered road bridge over the line, seen end on: its portal's board and batten under a shake gable, the deck's
      // timbers and stringer ends, the underside's beam striped: it's low, and it's solid all the way up)
      stillAt(c, 'tr-bridge', q.x, BRIDGE_Y, -22, BRIDGE_TOP - BRIDGE_Y - 6, q.len + 44, BRIDGE_Y - BRIDGE_TOP + 10, g => paintBridge(g, q.len));
    } else if (q.kind === 'tower') {
      // (the spout's arm swung out over the line, its canvas sleeve, and the water coming down out of it onto whatever's
      // under it, splashing)
      const xm = q.x + q.len / 2, land = floorTopAt(state.blocks, xm, ROOF - 120, 0) ?? GY, Wt = WATER, B = N(BLACK);
      box(c, xm - 6, ROOF - 152, 12, 54, INK); box(c, xm - 5, ROOF - 151, 10, 52, B[3]); box(c, xm - 5, ROOF - 151, 3, 52, B[5]);
      box(c, xm - 9, ROOF - 104, 18, 8, INK); box(c, xm - 8, ROOF - 103, 16, 6, '#8A7A5A'); box(c, xm - 8, ROOF - 103, 16, 1, '#B0A07A');
      c.globalAlpha = 0.85;
      bandedGradientX(c, q.x + 8, ROOF - 96, q.len - 16, land - ROOF + 96, [Wt[7], Wt[6], Wt[7], Wt[6]]);
      c.globalAlpha = 1;
      for (let y = ROOF - 96 + (f * 9) % 24; y < land; y += 24) { box(c, q.x + 11 + ((y * 7) % 14), y, 3, 14, Wt[8]); box(c, q.x + 24 - ((y * 3) % 10), y + 8, 2, 8, '#FFFFFF'); }
      for (let n = 0; n < 6; n++) { const k = ((f * 0.1 + n / 6) % 1); puff(c, xm - 34 + k * 68 - 34 * (n % 2), land - 4 - k * 18, 4 + (1 - k) * 4, ['#9ACCE0', '#D8EEF6', '#FFFFFF'], 1 - k * 0.6); }
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
  // (the mist off it, either side: soft stepped puffs drifting)
  for (let n = 0; n < 10; n++) {
    const side = n % 2 ? q.x - 40 - ((f * 1.3 + n * 37) % 160) : q.x + q.len + ((f * 1.1 + n * 41) % 160);
    puff(c, side, GY - 80 - ((n * 57) % 260), 30 + (n % 3) * 12, ['#B4DCE8', '#D8EEF6', '#F4FAFC'], 0.18);
  }
  // (the sheet: banded blue, see-through enough to make out the train under it, white streaks pouring, its own shading
  // in columns where it's thicker)
  const Wt = WATER, x0 = q.x, x1 = q.x + q.len;
  c.globalAlpha = 0.6;
  bandedGradientX(c, x0, top, q.len, GY + 40 - top, [Wt[7], Wt[6], Wt[7], Wt[7], Wt[6], Wt[8]]);
  c.globalAlpha = 0.25; for (let x = x0 + 20; x < x1; x += 70) box(c, x, top, 18 + ((x * 3) % 14), GY + 40 - top, Wt[4]);
  c.globalAlpha = 1;
  for (let x = x0 + ((f * 2) % 10); x < x1; x += 10) { const o = (f * 14 + x * 5) % 90; box(c, x, top + o, 3, 54, 'rgba(240, 249, 255, 0.75)'); box(c, x + 4, top + ((o + 45) % 90) + 40, 2, 34, 'rgba(180, 220, 232, 0.6)'); box(c, x + 2, top + ((o + 20) % 90) + 20, 1, 20, 'rgba(255,255,255,0.8)'); }
  // (spray thrown up off the roofs, the white water along the bottom)
  for (let n = 0; n < 14; n++) { const sx = q.x + ((n * 97 + f * 3) % Math.max(1, q.len)), k = (f * 0.07 + n / 14) % 1; puff(c, sx, ROOF - k * 40, 3 + (1 - k) * 3, ['#B4DCE8', '#E8F6FA', '#FFFFFF'], 1 - k * 0.5); }
  for (let x = x0; x < x1; x += 22) puff(c, x + 11, GY + 10 - ((f * 3 + x) % 14), 14, ['#9ACCE0', '#D8EEF6', '#FFFFFF'], 0.8);
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
  if (top < TUN_TOP) { box(c, x - 6, top, 82, TUN_TOP - top + 2, INK); box(c, x - 4, top, 78, TUN_TOP - top + 2, N(FIBER)[3]); }
  stillAt(c, `tr-portal-${entry ? 1 : 0}`, x, 0, -16, TUN_TOP - 2, 104, archTop - TUN_TOP + 4, g => paintPortal(g, archTop, entry));
};
/** A portal's face (local: x from its near edge, y world): the park's fiberglass "rock" over the bore in molded
 *  courses, bolted at its seams, a chip to the gelcoat, the timber header across the bore's top (its ends cut, lit
 *  along its top), the TUNNEL plank hung off it at the near end. */
const paintPortal = (g: Ctx, archTop: number, entry: boolean) => {
  const F = N(FIBER), P = N(PLANK);
  const path = () => { g.beginPath(); g.moveTo(-6, TUN_TOP); g.lineTo(76, TUN_TOP); g.lineTo(78, archTop - 60); g.lineTo(72, archTop - 30); g.lineTo(74, archTop); g.lineTo(-4, archTop); g.lineTo(-8, archTop - 40); g.lineTo(-2, archTop - 90); g.closePath(); };
  g.fillStyle = INK; path(); g.fill(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke();
  g.save(); path(); g.clip();
  fiberglass(g, -10, TUN_TOP, 90, archTop - TUN_TOP, F, entry ? 21 : 29, true);
  box(g, -10, TUN_TOP, 10, archTop - TUN_TOP, F[4]); checker(g, 0, TUN_TOP, 4, archTop - TUN_TOP, F[4], 0);
  box(g, 64, TUN_TOP, 16, archTop - TUN_TOP, F[2]); checker(g, 60, TUN_TOP, 4, archTop - TUN_TOP, F[2], 1);
  g.restore();
  box(g, -8, archTop - 16, 88, 16, INK); slab(g, -7, archTop - 15, 86, 14, P); lip(g, -7, archTop - 15, 86, ['#3A2410', '#8A6034', '#D8A464', '#F4D2A0']);
  for (const ex of [-7, 75]) { box(g, ex, archTop - 15, 4, 14, P[5]); box(g, ex + 1, archTop - 10, 2, 3, P[2]); }
  for (const bx of [6, 34, 62]) { box(g, bx, archTop - 10, 3, 3, '#26262C'); box(g, bx, archTop - 10, 1, 1, '#A1A1AA'); }
  if (entry) {
    for (const cx of [10, 60]) { box(g, cx, archTop - 2, 1, 10, '#3A3020'); }
    box(g, 2, archTop + 8, 66, 18, INK); slab(g, 3, archTop + 9, 64, 16, P);
    signText(g, 'TUNNEL', 35, archTop + 21, burned(1, 5));
  }
};

/** The near side of the line, nearest the eye (drawn over the train): its bank going by (dark stone in a tunnel, the
 *  plunge pool's churn under a waterfall), the robbers on their horses and leaping off them, the riderless horses. */
export const drawNearLane = (c: Ctx, state: GameState) => {
  const tr = trainOf(state), f = state.frame, v = viewOf(state);
  const a = v.x - 80, b = v.x + v.w + 80, y0 = GY + 8, h = v.y + v.h + 200 - y0;
  const sp = tr.dist * 1.25;
  for (let x = Math.floor((a + sp) / NEAR_W) * NEAR_W - sp; x < b; x += NEAR_W) stillAt(c, 'tr-near', x, y0, 0, -2, NEAR_W, NEAR_H + 2, paintNear);
  if (h > NEAR_H) box(c, a, y0 + NEAR_H, b - a, h - NEAR_H, N(GRASS)[1]);
  for (const q of tr.passers) {
    const qa = Math.max(a, q.x), qb = Math.min(b, q.x + q.len);
    if (qb <= qa) continue;
    if (q.kind === 'tunnel') {
      // (the tunnel's near wall: the shell's foot in the dark, a gutter)
      const F = FIBER.map(col => mix(col, '#0A0806', 0.6));
      c.save(); c.beginPath(); c.rect(qa, y0 - 2, qb - qa, h + 2); c.clip();
      for (let x = q.x + Math.floor((qa - q.x) / TUN_W) * TUN_W; x < qb; x += TUN_W) stillAt(c, 'tr-tunnear', x, y0, 0, -2, TUN_W, NEAR_H + 2, g => { fiberglass(g, 0, -2, TUN_W, NEAR_H + 2, F, 31, true); box(g, 0, -2, TUN_W, 6, F[1]); box(g, 0, 4, TUN_W, 1, F[3]); });
      if (h > NEAR_H) box(c, qa, y0 + NEAR_H, qb - qa, h - NEAR_H, F[1]);
      c.restore();
    } else if (q.kind === 'falls') {
      // (the plunge pool: banded water churning, foam rings, glints)
      const Wt = WATER;
      bandedGradientX(c, qa, y0, qb - qa, h, [Wt[6], Wt[5], Wt[4], Wt[3], Wt[2], Wt[1]]);
      for (let x = qa - (qa % 12); x < qb; x += 12) { box(c, Math.max(qa, x), y0 + ((f * 5 + x) % 30), 6, 2, Wt[8]); box(c, Math.max(qa, x) + 3, y0 + 30 + ((f * 3 + x * 7) % 50), 4, 1, Wt[7]); }
      for (let x = qa; x < qb; x += 26) puff(c, x + 13, y0 + 4 + ((f + x) % 8), 10, ['#9ACCE0', '#D8EEF6', '#FFFFFF'], 0.85);
    }
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
