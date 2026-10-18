// What the train goes by, set off by where he's got to (layout.ts EVENTS), each coming in from the right at the world's
// speed, warned of first at the right edge of the screen (what it is, and what to do about it):
//
//   LOW BRIDGE    a timber road bridge over the line, its underside a few feet over the roofs: up there standing (or
//                 jumping), it clotheslines him back along the roof; duck (or be inside, or down on a deck). It takes
//                 the brakemen off the roofs and the robbers off their horses too
//   WATER TOWER   the spout swung out over the line, pouring: up on top of anything it hoses him back hard; inside or
//                 down on a deck, it goes over him. The cast on top get hosed off too
//   TUNNEL        a fake-rock portal (bolts and all) and the dark inside it (the lighting system: never black; the cars'
//                 lanterns light pools); longer and closer together toward the front. Its portal scrapes the robbers
//                 off their horses
//   ROBBERS       bandits galloping up from behind on horses, along the embankment behind the train (kinds.ts)

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Enemy, EnemyKind } from '../../../m1/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { floorTopAt } from '../../../m1/game/core/terrain';
import { hazardVictims, hazardHit, hazardKill, boxHits } from '../../hazardHit';
import { meatheadSays, byPants, label } from '../section';
import { GY } from '../geometry';
import { box, mix, INK, painted, burned, type Ctx } from '../kit';
import { signText } from '../../signLetters';
import { trainOf, type Passer } from './state';
import { carAt, insideCar } from './cars';
import { EVENTS, eventX, DECK, ROOF, V_FULL } from './layout';
import { RIDE_FEET, riding } from './kinds';
import { drawRider, drawHorse } from './kindArt';
import { tubeSay } from './tube';
import { TUBE_TUNNEL, TUBE_ROBBERS, TRAIN_GAGS } from './lines';

/** The low bridge's underside (stood on a roof, his head's over it; ducked, it's not). */
export const BRIDGE_Y = ROOF - 48;
const BRIDGE_W = 64, TOWER_W = 46;
/** Frames of warning before one comes on screen. */
const WARN = 100;
/** The embankment behind the train the robbers ride along. */
export const BERM_Y = RIDE_FEET + 50;

const riders = new WeakSet<Enemy>();
/** Each one hits each of the cast the once as it goes by. */
const struck = new WeakMap<Passer, WeakSet<Enemy>>();
const once = (q: Passer, e: Enemy) => {
  let s = struck.get(q);
  if (!s) { s = new WeakSet(); struck.set(q, s); }
  if (s.has(e)) return false;
  s.add(e); return true;
};

/** Each frame: set off what he's got to, move what's coming by along, what it does to whoever's in its way. */
export const updatePassers = (ctx: FrameContext) => {
  const { state } = ctx, tr = trainOf(state), p = state.player;
  const cx = p.pos.x + p.width / 2;
  if (tr.phase === 'ride' && p.health > 0) {
    EVENTS.forEach((ev, i) => {
      if (tr.fired.has(i) || cx < eventX(ev)) return;
      // (robbers don't ride up in a tunnel: they wait for daylight)
      if (ev.kind === 'robbers' && tr.dark > 0.1) return;
      tr.fired.add(i);
      if (ev.kind === 'robbers') spawnRobbers(state, ev.n ?? 1);
      // (it gets to him about WARN frames after it's set off, wherever he is then; off the screen till then, warned of)
      else tr.passers.push({ kind: ev.kind, x: Math.max(state.camera.x + CANVAS_WIDTH + 10, cx + V_FULL * WARN), len: ev.kind === 'tunnel' ? ev.len ?? 1500 : ev.kind === 'bridge' ? BRIDGE_W : TOWER_W, t: 0 });
    });
  }
  tr.hitCd = Math.max(0, tr.hitCd - 1);
  for (const q of tr.passers) { q.t++; q.x -= tr.v; }
  tr.passers = tr.passers.filter(q => q.x + q.len > state.camera.x - 600 || q.kind === 'bumper');
  // (the dark: how much of a tunnel's over the middle of the screen)
  const mid = state.camera.x + CANVAS_WIDTH / 2;
  let dark = 0;
  for (const q of tr.passers) if (q.kind === 'tunnel') dark = Math.max(dark, Math.max(0, Math.min(1, (mid - q.x) / 220, (q.x + q.len - mid) / 220)));
  tr.dark += (dark - tr.dark) * 0.12;
  if (dark > 0.5 && !tr.said.tunnel) { tr.said.tunnel = true; tubeSay(state, TUBE_TUNNEL); }
  if (dark > 0.8 && !tr.said.tunnelMe && tr.said.tunnel && !tr.tubeBusy) { tr.said.tunnelMe = true; meatheadSays(state, pickLine(byPants(state, TRAIN_GAGS.tunnel))); }
  // (what they do)
  for (const q of tr.passers) {
    if (q.kind === 'bridge') bridgeHits(ctx, q);
    else if (q.kind === 'tower') towerHits(ctx, q);
    else if (q.kind === 'tunnel') portalHits(ctx, q);
  }
  // (riders: noted while they ride (their horses drawn under them); off the horse (boarded, shot off), the horse runs on
  // riderless and drops back)
  for (const e of state.enemies) {
    if (riding(e)) { riders.add(e); continue; }
    if (riders.has(e)) { riders.delete(e); tr.horses.push({ x: e.pos.x + e.width / 2, vx: e.health > 0 ? -1 : -2, t: 0, seed: Math.abs(Math.round(e.initialX || 0)) }); }
  }
  for (const h of tr.horses) { h.t++; h.vx -= 0.03; h.x += h.vx; }
  tr.horses = tr.horses.filter(h => h.t < 300);
};

const spawnRobbers = (state: GameState, n: number) => {
  const tr = trainOf(state);
  for (let k = 0; k < n; k++) {
    const x = state.camera.x - 80 - k * 120;
    const e = makeKindEnemy('m2:fr_robber' as EnemyKind, x, RIDE_FEET);
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
  const { state } = ctx, p = state.player, tr = trainOf(state);
  if (q.x > state.camera.x + CANVAS_WIDTH + 40) return;
  const over = p.pos.x + p.width - 6 > q.x && p.pos.x + 6 < q.x + q.len && p.pos.y < BRIDGE_Y;
  if (over && !(p.isDucking && p.isGrounded) && tr.hitCd <= 0 && p.health > 0 && !p.inCutscene) {
    tr.hitCd = 40;
    hurtPlayer(ctx, 14, 'm2:fr_bridge', { x: -7, y: -3 });
    p.pos.x = Math.min(p.pos.x, q.x - p.width + 2);
    playSound('thud', 1, -8); playSound('crack', 0.6, -4);
  }
  for (const e of hazardVictims(state, { flyers: true })) {
    if (!boxHits(e, q.x, -2000, q.len, BRIDGE_Y + 2000)) continue;
    if (riding(e)) hazardKill(ctx, e, q.x + q.len, 'LOW BRIDGE!', { fling: { x: -10, y: -6 } });
    else if (once(q, e)) hazardHit(ctx, e, 40, q.x + q.len, 'LOW BRIDGE!', { knock: 10 });
  }
};

/** Up on top of anything under it: hosed back hard. Inside, or down on a deck, it goes over him. */
const towerHits = (ctx: FrameContext, q: Passer) => {
  const { state } = ctx, p = state.player, tr = trainOf(state);
  if (q.x > state.camera.x + CANVAS_WIDTH + 40) return;
  const feet = p.pos.y + p.height;
  const under = p.pos.x + p.width - 4 > q.x && p.pos.x + 4 < q.x + q.len;
  const car = carAt(tr, p.pos.x + p.width / 2), covered = car >= 0 && insideCar(state, tr, car);
  if (under && !covered && feet < DECK - 10 && tr.hitCd <= 0 && p.health > 0 && !p.inCutscene) {
    tr.hitCd = 30;
    hurtPlayer(ctx, 12, 'm2:fr_spout', { x: -9, y: -2 });
    playSound('splash', 1, -2);
    for (let n = 0; n < 14; n++) state.particles.push({ pos: { x: p.pos.x + p.width / 2, y: p.pos.y + 10 }, vel: { x: -2 - Math.random() * 6, y: (Math.random() - 0.7) * 6 }, life: 30, color: n % 2 ? '#BAE6FD' : '#E0F2FE', size: 3 });
  }
  for (const e of hazardVictims(state, { flyers: true })) {
    if (!boxHits(e, q.x, -2000, q.len, 4000) || e.pos.y + e.height > DECK - 10 || riding(e)) continue;
    if (once(q, e)) hazardHit(ctx, e, 24, q.x + q.len, 'HOSED!', { knock: 12 });
  }
};

/** The tunnel's portals: the robbers on their horses (up over the roof line) are scraped off against them. */
const portalHits = (ctx: FrameContext, q: Passer) => {
  const { state } = ctx;
  for (const e of state.enemies) {
    if (!riding(e)) continue;
    for (const px of [q.x, q.x + q.len]) if (e.pos.x + e.width > px && e.pos.x < px + 30) hazardKill(ctx, e, px + 30, 'SPLAT!', { fling: { x: -6, y: -2 }, sound: 'splat' });
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const STONE = '#2A2622', STONE_L = '#3A3530';

/** Screen space, over the sky: the inside of whatever tunnel's on screen (dark stone, a lamp on the wall now and then). */
export const drawTunnelInside = (c: Ctx, state: GameState) => {
  const tr = trainOf(state), cam = state.camera.x;
  for (const q of tr.passers) {
    if (q.kind !== 'tunnel') continue;
    const a = Math.max(0, q.x - cam), b = Math.min(CANVAS_WIDTH, q.x + q.len - cam);
    if (b <= a) continue;
    box(c, a, 0, b - a, CANVAS_HEIGHT, STONE);
    // (the courses of the fake rock, and its bolts: it's the park's tunnel too)
    for (let y = 30; y < CANVAS_HEIGHT; y += 46) box(c, a, y, b - a, 3, STONE_L);
    for (let x = q.x - cam + 45; x < b; x += 90) if (x > a) for (let y = 52; y < 400; y += 92) box(c, x, y, 3, 3, '#57534E');
    // (lamps on the wall going by)
    for (let x = q.x + 200; x < q.x + q.len - 100; x += 420) {
      const sx = x - cam;
      if (sx < a - 20 || sx > b + 20) continue;
      box(c, sx - 4, 300, 8, 12, INK); box(c, sx - 3, 301, 6, 10, '#FDE68A');
    }
  }
};
/** The tunnels' lamps (world), for the lighting. */
export const tunnelLamps = (state: GameState) => {
  const tr = trainOf(state), out: { x: number; y: number; r: number; a: number; color: string }[] = [];
  for (const q of tr.passers) if (q.kind === 'tunnel') for (let x = q.x + 200; x < q.x + q.len - 100; x += 420) if (x > state.camera.x - 100 && x < state.camera.x + CANVAS_WIDTH + 100) out.push({ x, y: state.camera.y + 306, r: 90, a: 0.7, color: '#FDE68A' });
  return out;
};

/** Behind the train: the bridges' legs, the water towers, the robbers on their horses, the riderless horses. */
export const drawPassersBack = (c: Ctx, state: GameState) => {
  const tr = trainOf(state), f = state.frame;
  for (const q of tr.passers) {
    if (q.x > state.camera.x + CANVAS_WIDTH + 100 || q.x + q.len < state.camera.x - 100) continue;
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
    }
  }
  // (the robbers on their horses, along the embankment)
  for (const e of state.enemies) if (riding(e)) drawRider(c, e, e.pos.x + e.width / 2, e.pos.y + e.height, f, Math.abs(Math.round(e.initialX || 0)) + (e.variant ?? 0) * 31);
  for (const h of tr.horses) drawHorse(c, h.x, BERM_Y, 1, f, h.seed);
};

/** In front of the train: the bridges' decks, the water pouring, the tunnels' portals. */
export const drawPassersFront = (c: Ctx, state: GameState) => {
  const tr = trainOf(state), f = state.frame, top = state.camera.y - 40;
  for (const q of tr.passers) {
    if (q.x > state.camera.x + CANVAS_WIDTH + 100 || q.x + q.len < state.camera.x - 100) continue;
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
    }
  }
};

/** A portal: a fake-rock face over the line (its bolts showing), a timber arch round the bore, its sign. */
const portal = (c: Ctx, x: number, top: number, entry: boolean) => {
  const archTop = ROOF - 76;
  box(c, x - 2, top, 74, archTop - top + 2, INK);
  box(c, x, top, 70, archTop - top, '#7A6A58');
  for (let y = top + 12; y < archTop - 10; y += 26) { box(c, x + 6 + ((y * 3) % 20), y, 22, 10, mix('#7A6A58', '#FFFFFF', 0.12)); box(c, x + 40 - ((y * 5) % 16), y + 12, 18, 8, mix('#7A6A58', '#000000', 0.2)); }
  for (let y = top + 30; y < archTop - 20; y += 60) { box(c, x + 8, y, 3, 3, '#A8A29E'); box(c, x + 58, y + 20, 3, 3, '#A8A29E'); }
  box(c, x - 4, archTop - 14, 78, 14, '#5A3A1E'); box(c, x - 4, archTop - 14, 78, 3, '#8A5A30');
  if (entry) { box(c, x + 2, archTop - 34, 66, 16, '#A0703C'); signText(c, 'TUNNEL', x + 35, archTop - 22, burned(1, 5)); }
};

/** Screen space: the warnings at the right edge for what's coming (what, and what to do). */
export const drawWarnings = (c: Ctx, state: GameState) => {
  const tr = trainOf(state), f = state.frame;
  let y = 250;
  for (const q of tr.passers) {
    const sx = q.x - state.camera.x;
    if (sx < CANVAS_WIDTH + 4 || q.kind === 'bumper') continue;
    if (f % 20 < 6) { y += 52; continue; }
    const [what, todo] = q.kind === 'bridge' ? ['LOW BRIDGE', 'DUCK!'] : q.kind === 'tower' ? ['WATER TOWER', 'GET INSIDE!'] : ['TUNNEL', ''];
    box(c, CANVAS_WIDTH - 142, y - 22, 136, todo ? 44 : 30, INK); box(c, CANVAS_WIDTH - 140, y - 20, 132, todo ? 40 : 26, '#7F1D1D');
    label(c, `${what} >`, CANVAS_WIDTH - 74, y - 3, '#FDE047', 8);
    if (todo) label(c, todo, CANVAS_WIDTH - 74, y + 13, '#FEF3C7', 8);
    y += 52;
  }
};
