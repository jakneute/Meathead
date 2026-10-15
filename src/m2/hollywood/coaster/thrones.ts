// THE STAR TOILETS (an easter egg: no prompt, ever; found by crouching beside one). Hold crouch by any of the three
// shrines' toilets (on the deck by the plinth, or up on it) once the stop's staff are dead, and he hops up onto it, jeans
// down round his boots, and goes: a big steaming one (render/player/throne.ts: his own pose: pushing red-faced,
// slumped in relief). Keep holding:
//
//   15 s on a clean toilet   he clogs it (SHITTY: heaped, overflowing down the plinth, a brown lake on the deck).
//   15 s more (or 15 s from   the UH OH (the last 2.5 s: rumbling, his face), then the BLOWOUT (committed: no getting
//   sitting on a SHITTY one)  up), and the toilet EXPLODES and kills him (EXPLODED: a stump, shards, brown everywhere).
//
// Let go of crouch before a stage is done: he stands up, nothing changes (a SHITTY one starts its 15 s over next time).
// No gut, no meter, his pants never count as shat. Each toilet's state is its own, kept across deaths in
// state.stageMemo (THRONE_MEMO), like the stops' staff. Stop 3's is in its hazmat case: he lifts the case, sits, and it
// drops back down over him (shut in with it: it doesn't vent while he's in there; blown up, it never vents again).

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import { hands, meatheadSays, box } from '../section';
import { pickLine, isTalking } from '../../../m1/game/platform/speech';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { onWire } from '../wires';
import { X, Y, STOPS, CLEARED_MEMO } from './layout';
import type { Coaster, Sitting } from './state';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;

export type ThroneState = 'clean' | 'shitty' | 'exploded';
export const THRONE_MEMO = (i: number) => `hollywood-coaster-throne${i}`;
export const throneState = (state: GameState, i: number): ThroneState => (state.stageMemo[THRONE_MEMO(i)] as ThroneState | undefined) ?? 'clean';
export const THRONE_SOURCE = 'm2:hwc_throne';

/** Frames: crouch held to sit; the hop on; to clog it (a clean one); to the blowout from clogging it (or from sitting
 *  on a SHITTY one); the UH OH's warning before it; the blowout to the bang. */
const HOLD = 18, HOP = 12, CLOG = 900, BLOW = 900, WARN = 150, BANG = 50;

/** Where each toilet is: its middle (his hips over the seat), the floor it stands on (his feet), the plinth's top. */
export const throneAt = (i: number) => {
  const s = STOPS[i], mx = X(s.shrine.x + s.shrine.w / 2), top = Y(s.h) - s.shrine.h;
  return { mx, base: i === 2 ? top + 72 : top, top, deck: Y(s.h), sx: X(s.shrine.x), sw: s.shrine.w };
};
/** How far the case is lifted off stop 3's toilet (px), him getting in. */
export const caseLift = (co: Coaster) => {
  const st = co.sit;
  if (!st || st.i !== 2) return 0;
  const t = st.t;
  return t < 10 ? 80 * t / 10 : t < 20 ? 80 : t < 25 ? 80 * (25 - t) / 5 : 0;
};
/** He's shut in stop 3's case (it doesn't vent). */
export const inCase = (co: Coaster) => !!co.sit && co.sit.i === 2 && co.sit.t >= 25;

const brownBits = (state: GameState, x: number, y: number, n: number, sp: number, up: number) => {
  for (let i = 0; i < n; i++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 16, y }, vel: { x: (Math.random() - 0.5) * sp, y: -Math.random() * up - 1 }, life: 40 + Math.random() * 40, color: ['#5C3A16', '#78350F', '#3F2A10', '#92400E'][i % 4], size: 3 + Math.random() * 5, grav: 0.35 });
};

/** Off it, on his feet on the deck in front of the plinth. */
const getUp = (state: GameState, co: Coaster) => {
  const p = state.player, st = co.sit!, g = throneAt(st.i);
  co.sit = null; co.squat = { i: -1, t: 0 };
  p.throne = undefined; p.carried = false;
  p.pos.x = g.sx + g.sw + 26 - p.width / 2; p.pos.y = g.deck - p.height; p.vel.x = 0; p.vel.y = 0; p.isGrounded = true;
};

/** Each frame, off the train: the crouch by a toilet, and him on one. Controls to pass on (none while he's sat). */
export const updateThrones = (ctx: FrameContext, co: Coaster, controls: Controls, pa: (line: string) => void): Controls | null => {
  const { state } = ctx, p = state.player;
  if (co.sit) return sitting(ctx, co, controls, pa);
  // Crouched by one (on the deck by its plinth, or up on it), the stop's staff dead, the toilet still there
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  let by = -1;
  if (controls.down && p.isGrounded && !p.isSliding && !p.isCharging && p.health > 0 && !onWire(state)) {
    for (let i = 0; i < 3; i++) {
      const g = throneAt(i);
      if (Math.abs(cx - g.mx) > g.sw / 2 + 70 || feet < g.top - 8 || feet > g.deck + 8) continue;
      if (!state.stageMemo[CLEARED_MEMO(i)] || throneState(state, i) === 'exploded') continue;
      by = i;
    }
  }
  if (by < 0) { co.squat = { i: -1, t: 0 }; return null; }
  if (co.squat.i !== by) co.squat = { i: by, t: 0 };
  if (++co.squat.t < HOLD) return null;
  // Up onto it
  const shitty = throneState(state, by) === 'shitty';
  co.sit = { i: by, t: 0, from: { x: p.pos.x, y: p.pos.y }, blowAt: shitty ? BLOW : CLOG + BLOW, blow: 0, steam: false, said: {} };
  p.isDucking = false; p.isCharging = false; p.isSliding = false;
  p.throne = { t: 0, mood: 'push', push: 0 };
  playSound('jump', 0.5, 4);
  meatheadSays(state, pickLine(shitty ? L.THRONE_SIT_AGAIN : L.THRONE_SIT[by]), true);
  pa(shitty ? pickLine(L.SPIEL_THRONE_AGAIN) : L.SPIEL_THRONE_SIT[by][0]);
  return hands();
};

const sitting = (ctx: FrameContext, co: Coaster, controls: Controls, pa: (line: string) => void): Controls => {
  const { state } = ctx, p = state.player, st: Sitting = co.sit!, g = throneAt(st.i);
  st.t++;
  // (hurt, or dead of something else: off it)
  if (p.health <= 0 || p.pushbackTimer > 0) { getUp(state, co); return hands(); }
  // Let go before the blowout: up he gets, nothing changes
  if (!controls.down && st.blow === 0 && st.t > HOP) {
    const clogged = !!st.said.clog;
    getUp(state, co);
    if (clogged) meatheadSays(state, pickLine(L.THRONE_DONE), true);
    else if (st.t > 200 && !isTalking()) meatheadSays(state, pickLine(L.THRONE_STAND), false);
    return hands();
  }
  // On it (hopped up from where he crouched)
  p.carried = true; p.vel.x = 0; p.vel.y = 0; p.facing = 1; p.isDucking = false;
  const k = Math.min(1, st.t / HOP), seatX = g.mx - p.width / 2, seatY = g.base - p.height;
  p.pos.x = st.from.x + (seatX - st.from.x) * k;
  p.pos.y = st.from.y + (seatY - st.from.y) * k - Math.sin(k * Math.PI) * 26;
  if (st.t === HOP) playSound('thud', 0.4, 6);
  if (st.i === 2 && st.t === 25) { playSound('clang', 0.6, -6); playSound('glass', 0.3, -4); }
  if (st.i === 2 && st.t === 120 && !st.said.inCase) { st.said.inCase = true; meatheadSays(state, pickLine(L.THRONE_CASE), true); }
  // Going: pushing (red, trembling), then out it comes (plop, steam), slumped in relief; again
  const warn = st.t >= st.blowAt - WARN || st.blow > 0;
  const c = Math.max(0, st.t - 20) % 220;
  const th = p.throne ?? (p.throne = { t: 0, mood: 'push', push: 0 });
  th.t = st.t;
  if (warn) { th.mood = 'uhoh'; th.push = 1; }
  else if (c < 140) { th.mood = 'push'; th.push = Math.min(1, c / 60); }
  else th.mood = 'relief';
  if (!warn && st.t > 20 && c === 140) {
    st.steam = true;
    playSound('fart', 0.7, -6 - Math.random() * 4); playSound('splash', 0.5, -8);
    if (!isTalking() && Math.random() < 0.6) meatheadSays(state, pickLine(L.THRONE_PLOP), false);
  }
  if (!warn && c === 70 && !isTalking() && (st.t < 300 || Math.random() < 0.5)) meatheadSays(state, pickLine(L.THRONE_STRAIN), false);
  // Clogged (a clean one, 15 s on it)
  if (st.t === CLOG && throneState(state, st.i) === 'clean') {
    state.stageMemo[THRONE_MEMO(st.i)] = 'shitty'; st.said.clog = true;
    playSound('glug', 1, -6); playSound('splash', 0.8, -10);
    brownBits(state, g.mx + 20, g.base - 30, 18, 6, 4);
    meatheadSays(state, pickLine(L.THRONE_CLOG), true);
    pa(pickLine(L.SPIEL_THRONE_CLOG));
  }
  // The warning: the pipes rumbling, the toilet shaking
  if (st.t === st.blowAt - WARN) { meatheadSays(state, pickLine(L.THRONE_UHOH), true); pa(pickLine(L.SPIEL_THRONE_UHOH)); }
  if (warn && st.blow === 0 && st.t % 18 === 0) { playSound('rumble', 0.5, -4); shakeScreen(state, 3, 2); }
  // THE BLOWOUT: no getting up now; then the bang
  if (st.t >= st.blowAt) {
    st.blow++;
    if (st.blow === 1) {
      meatheadSays(state, pickLine(L.THRONE_BLOW), false);
      playSound('fart', 1, -16); playSound('rumble', 1, -10);
    }
    if (st.blow % 3 === 0) brownBits(state, g.mx + 16, g.base - 34, 4, 5, 14);
    shakeScreen(state, 4 + st.blow / 6, 2);
    if (st.blow >= BANG) {
      state.stageMemo[THRONE_MEMO(st.i)] = 'exploded';
      playSound('boom', 1, -6); playSound('poopsplat', 1, -4); playSound('crunch', 0.8);
      if (st.i === 2) playSound('glass', 1, -2);
      shakeScreen(state, 24, 12);
      brownBits(state, g.mx, g.base - 30, 60, 22, 18);
      for (let i = 0; i < 22; i++) state.particles.push({ pos: { x: g.mx + (Math.random() - 0.5) * 30, y: g.base - 30 }, vel: { x: (Math.random() - 0.5) * 18, y: -4 - Math.random() * 12 }, life: 60 + Math.random() * 40, color: st.i === 0 ? '#F9A8D4' : st.i === 1 ? '#84CC16' : (i % 2 ? '#D9F99D' : '#18181B'), size: 3 + Math.random() * 4, grav: 0.4 });
      for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: g.mx + (Math.random() - 0.5) * 40, y: g.base - 40 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 50, color: 'rgba(120, 90, 40, 0.35)', size: 18 + Math.random() * 14 });
      // (off it, dead where he sat: his feet back on what's under him, so he goes to pieces there)
      co.sit = null; co.squat = { i: -1, t: 0 };
      p.throne = undefined; p.carried = false; p.isGrounded = true;
      if (st.i === 2) p.pos.y = g.top - p.height;
      hurtPlayer(ctx, 9999, THRONE_SOURCE, { x: -8, y: -12 });
      return hands();
    }
  }
  return hands();
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const flies = (c: Ctx, x: number, y: number, f: number, n: number) => {
  for (let k = 0; k < n; k++) { const a = f * 0.13 + k * 0.9; box(c, x + Math.cos(a * 1.3) * (16 + k * 3), y + Math.sin(a) * 12, 2, 2, '#000'); }
};
const note = (c: Ctx, x: number, y: number, text: string, bg: string, fg: string, rot: number) => {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.font = '6px "Press Start 2P"';
  const w = c.measureText(text).width + 8;
  box(c, -w / 2 - 1, -7, w + 2, 14, '#000'); box(c, -w / 2, -6, w, 12, bg);
  c.fillStyle = fg; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, 0, 0.5);
  c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  c.restore();
};

/** A toilet's state on the shrine (behind him): the clog (heaped, overflowing, the lake on the deck), or the wreck. */
export const drawThroneMess = (c: Ctx, state: GameState, i: number) => {
  const ts = throneState(state, i), f = state.frame, g = throneAt(i), tx = g.mx - 6;
  if (ts === 'clean') return;
  // (the lake on the deck: both)
  c.fillStyle = '#4A2E10'; c.beginPath(); c.ellipse(g.mx + 10, g.deck - 1, g.sw / 2 + 120, 6, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#6B4219'; c.beginPath(); c.ellipse(g.mx + 30, g.deck - 2, g.sw / 2 + 60, 3, 0, 0, Math.PI * 2); c.fill();
  if (ts === 'shitty') {
    if (i === 2) {
      // (in the case: brown up the inside of the glass, fogged)
      c.fillStyle = 'rgba(92, 58, 22, 0.55)'; c.fillRect(g.sx + 6, g.top + 34, g.sw - 12, 38);
      c.fillStyle = 'rgba(120, 90, 40, 0.3)'; c.fillRect(g.sx + 6, g.top + 4, g.sw - 12, 30);
      for (const x of [g.sx + 2, g.sx + g.sw - 8]) box(c, x, g.top + 72, 6, 48, '#5C3A16');
    } else {
      // (heaped over the rim, down the bowl and the plinth's front)
      c.fillStyle = '#000'; c.beginPath(); c.ellipse(tx + 16, g.base - 30, 22, 14, 0, Math.PI, 0); c.fill();
      c.fillStyle = '#5C3A16'; c.beginPath(); c.ellipse(tx + 16, g.base - 30, 21, 13, 0, Math.PI, 0); c.fill();
      c.fillStyle = '#78350F'; c.beginPath(); c.ellipse(tx + 12, g.base - 36, 10, 6, 0, Math.PI, 0); c.fill();
      for (const [x, w] of [[tx + 26, 7], [tx + 34, 5], [tx + 6, 6]]) box(c, x, g.base - 30, w, 30 + (g.deck - g.base), '#5C3A16');
      for (const [x, w] of [[g.sx + 8, 8], [g.sx + g.sw - 20, 10]]) box(c, x, g.base, w, g.deck - g.base, '#78350F');
    }
    flies(c, g.mx + 6, g.base - 60, f, 9);
    // (the stink coming off it)
    c.strokeStyle = 'rgba(132, 204, 22, 0.55)'; c.lineWidth = 2;
    for (let k = 0; k < 3; k++) { const x = g.mx - 14 + k * 16, y = g.base - 50 - ((f + k * 20) % 60) * 0.5; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 6, y - 8, x, y - 16); c.quadraticCurveTo(x - 6, y - 24, x, y - 32); c.stroke(); }
    note(c, g.sx - 40, g.deck - 36, 'OUT OF ORDER', '#FEF9C3', '#7F1D1D', -0.08);
  } else {
    // EXPLODED: a stump of it, shards, brown up everything; the case blown open (stop 3)
    const col = i === 0 ? '#F9A8D4' : i === 1 ? '#84CC16' : '#18181B';
    c.fillStyle = '#000'; c.beginPath(); c.moveTo(tx - 3, g.base); c.lineTo(tx - 1, g.base - 12); c.lineTo(tx + 5, g.base - 7); c.lineTo(tx + 9, g.base - 16); c.lineTo(tx + 14, g.base - 9); c.lineTo(tx + 17, g.base); c.closePath(); c.fill();
    c.fillStyle = col; c.beginPath(); c.moveTo(tx - 1, g.base); c.lineTo(tx, g.base - 10); c.lineTo(tx + 5, g.base - 5); c.lineTo(tx + 9, g.base - 14); c.lineTo(tx + 13, g.base - 7); c.lineTo(tx + 15, g.base); c.closePath(); c.fill();
    for (let k = 0; k < 9; k++) { const sx = g.sx - 60 + ((k * 53) % (g.sw + 140)), sy = (k % 3 === 0 ? g.top : g.deck) - 3; box(c, sx, sy, 4 + (k % 3) * 2, 3, col); }
    // (splattered up the plinth and the back of the shrine)
    for (let k = 0; k < 14; k++) {
      const a = k * 2.4, r = 30 + (k * 37) % 90;
      c.fillStyle = k % 2 ? '#5C3A16' : '#78350F';
      c.beginPath(); c.ellipse(g.mx + Math.cos(a) * r, g.base - 40 + Math.sin(a) * r * 0.6, 4 + (k % 4) * 2, 3 + (k % 3), a, 0, Math.PI * 2); c.fill();
    }
    flies(c, g.mx, g.base - 30, f, 12);
    if (i === 2) {
      // (the case's steel posts bent out, jagged glass at their feet; no glow now)
      c.strokeStyle = '#71717A'; c.lineWidth = 6;
      c.beginPath(); c.moveTo(g.sx + 3, g.base); c.quadraticCurveTo(g.sx - 6, g.top + 30, g.sx - 22, g.top + 4); c.stroke();
      c.beginPath(); c.moveTo(g.sx + g.sw - 3, g.base); c.quadraticCurveTo(g.sx + g.sw + 6, g.top + 30, g.sx + g.sw + 22, g.top + 4); c.stroke();
      c.fillStyle = 'rgba(190, 242, 100, 0.5)';
      for (let x = g.sx + 6; x < g.sx + g.sw - 6; x += 12) { c.beginPath(); c.moveTo(x, g.base); c.lineTo(x + 5, g.base - 8 - ((x * 7) % 10)); c.lineTo(x + 10, g.base); c.closePath(); c.fill(); }
    }
    note(c, g.sx - 40, g.deck - 36, 'CLOSED FOREVER', '#FACC15', '#000', 0.06);
  }
};

/** In front of him: the steam off it while he's going; stop 3's case down over him (glass, fogging brown). */
export const drawThroneFront = (c: Ctx, state: GameState, co: Coaster) => {
  const st = co.sit;
  if (!st) return;
  const g = throneAt(st.i), f = state.frame;
  if (st.steam) {
    for (let k = 0; k < 7; k++) {
      const u = ((f * 0.9 + k * 23) % 90) / 90, x = g.mx + 14 + Math.sin(k * 1.7 + u * 5) * (6 + u * 14), y = g.base - 30 - u * 90;
      c.fillStyle = `rgba(245, 245, 244, ${0.42 * (1 - u)})`;
      c.beginPath(); c.arc(x, y, 5 + u * 14, 0, Math.PI * 2); c.fill();
    }
  }
  if (st.i === 2 && inCase(co)) {
    const fog = Math.min(1, st.t / 900);
    c.fillStyle = `rgba(132, 204, 22, ${0.16})`; c.fillRect(g.sx, g.top, g.sw, 72);
    c.fillStyle = `rgba(92, 58, 22, ${0.45 * fog})`; c.fillRect(g.sx, g.top + 72 * (1 - fog * 0.6), g.sw, 72 * fog * 0.6);
    c.fillStyle = 'rgba(255, 255, 255, 0.35)'; c.fillRect(g.sx + 12, g.top + 6, 3, 60); c.fillRect(g.sx + 20, g.top + 6, 2, 40);
    box(c, g.sx, g.top, 6, 72, '#71717A'); box(c, g.sx + g.sw - 6, g.top, 6, 72, '#71717A'); box(c, g.sx, g.top, g.sw, 4, '#D9F99D');
  }
};
