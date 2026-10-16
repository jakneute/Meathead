// THE STAR TOILETS (an easter egg, prompted now: the user). Once a stop's staff are all dead, by its toilet the prompt
// comes up (HOLD down: SHIT ON IT, the real buttons, App.tsx's holdDownPrompt); never before (nor does it work before).
// Hold crouch by any of the three shrines' toilets (on the deck by the plinth, or up on it), and he hops up onto it, jeans
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
import { checker, mix } from '../../intro/art/kit';
import { signText, signW } from '../../signLetters';
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

/** The toilet he's by (on the deck by its plinth, or up on it, on his feet), its stop's staff all dead, the toilet
 *  still there: which (-1 none). Only then does holding down sit him on it, and only then is its prompt up. */
const throneBy = (state: GameState) => {
  const p = state.player, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  if (!p.isGrounded || p.health <= 0 || onWire(state)) return -1;
  for (let i = 0; i < 3; i++) {
    const g = throneAt(i);
    if (Math.abs(cx - g.mx) > g.sw / 2 + 70 || feet < g.top - 8 || feet > g.deck + 8) continue;
    if (!state.stageMemo[CLEARED_MEMO(i)] || throneState(state, i) === 'exploded') continue;
    return i;
  }
  return -1;
};
/** HOLD down's prompt is up (by one he can sit on, not sat on it yet). */
export const throneHere = (state: GameState, co: Coaster) => !co.sit && throneBy(state) >= 0;

/** Each frame, off the train: the crouch by a toilet, and him on one. Controls to pass on (none while he's sat). */
export const updateThrones = (ctx: FrameContext, co: Coaster, controls: Controls, pa: (line: string) => void): Controls | null => {
  const { state } = ctx, p = state.player;
  if (co.sit) return sitting(ctx, co, controls, pa);
  // Crouched by one (on the deck by its plinth, or up on it), the stop's staff dead, the toilet still there
  const by = controls.down && !p.isSliding && !p.isCharging ? throneBy(state) : -1;
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
      // (after the uh-oh and the narrator's, in turn)
      meatheadSays(state, pickLine(L.THRONE_BLOW), true);
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

const INK = '#1C1014';
/** Poo, in steps (darkest first). */
const POO = ['#1E1006', '#3A220C', '#5C3A16', '#7A4E1E', '#9A6A2E', '#BC8A48'];
const flies = (c: Ctx, x: number, y: number, f: number, n: number) => {
  for (let k = 0; k < n; k++) { const a = f * 0.13 + k * 0.9, fx = x + Math.cos(a * 1.3) * (16 + k * 3), fy = y + Math.sin(a) * 12; box(c, fx, fy, 2, 2, INK); if ((f + k) % 4 < 2) box(c, fx - 1, fy - 1, 1, 1, '#C8D4E0'); else box(c, fx + 2, fy - 1, 1, 1, '#C8D4E0'); }
};
/** A note taped up (a printed sheet, tilted), stenciled. */
const note = (c: Ctx, x: number, y: number, text: string, bg: string, fg: string, rot: number) => {
  c.save(); c.translate(x, y); c.rotate(rot);
  const L = { sx: 1, sy: 1, fill: fg, stencil: true }, w = signW(text, L) + 10;
  box(c, -w / 2 - 1, -8, w + 2, 16, INK); box(c, -w / 2, -7, w, 14, bg); box(c, -w / 2, -7, w, 1, '#FFFFFF'); box(c, -w / 2, 5, w, 2, 'rgba(0,0,0,0.15)');
  box(c, -w / 2 + 2, -9, 8, 3, 'rgba(240,240,220,0.75)'); box(c, w / 2 - 10, -9, 8, 3, 'rgba(240,240,220,0.75)');
  signText(c, text, 0, 4, L);
  c.restore();
};
/** A drip: down from y0 to y1, a bead at its foot, lit down its left. */
const drip = (c: Ctx, x: number, y0: number, y1: number, w: number) => {
  box(c, x - 1, y0, w + 2, y1 - y0, INK); box(c, x, y0, w, y1 - y0, POO[2]); box(c, x, y0, 1, y1 - y0, POO[4]);
  c.fillStyle = INK; c.beginPath(); c.ellipse(x + w / 2, y1, w / 2 + 2, 3, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = POO[2]; c.beginPath(); c.ellipse(x + w / 2, y1, w / 2 + 1, 2, 0, 0, Math.PI * 2); c.fill();
  box(c, x + 1, y1 - 1, 1, 1, POO[5]);
};
/** The lake on the deck: banded, a sheen. */
const lake = (c: Ctx, x: number, y: number, rx: number) => {
  for (const [k, col, dy] of [[1, INK, 0], [0.97, POO[1], -0.5], [0.8, POO[2], -1], [0.5, POO[3], -1.5]] as const) { c.fillStyle = col; c.beginPath(); c.ellipse(x, y + dy, rx * k, 6 * k, 0, 0, Math.PI * 2); c.fill(); }
  box(c, x - rx * 0.3, y - 3, rx * 0.25, 1, POO[5]);
};

/** A toilet's state on the shrine (behind him): the clog (heaped, overflowing, the lake on the deck), or the wreck. */
export const drawThroneMess = (c: Ctx, state: GameState, i: number) => {
  const ts = throneState(state, i), f = state.frame, g = throneAt(i), tx = g.mx - 6;
  if (ts === 'clean') return;
  lake(c, g.mx + 10, g.deck - 1, g.sw / 2 + 120);
  if (ts === 'shitty') {
    if (i === 2) {
      // (in the case: brown up the inside of the glass in bands, fogged; seeping out of its seams down the base)
      for (let k = 0; k < 3; k++) { c.fillStyle = `rgba(92, 58, 22, ${0.6 - k * 0.15})`; c.fillRect(g.sx + 6, g.top + 72 - (k + 1) * 14, g.sw - 12, 14); }
      c.fillStyle = 'rgba(120, 90, 40, 0.25)'; c.fillRect(g.sx + 6, g.top + 4, g.sw - 12, 26);
      for (const x of [g.sx + 2, g.sx + g.sw - 8]) drip(c, x, g.top + 72, g.deck - 3, 5);
    } else {
      // (heaped over the rim in steps, down the bowl and the plinth's front)
      const hx = tx + 16, hy = g.base - 30;
      c.fillStyle = INK; c.beginPath(); c.ellipse(hx, hy, 23, 15, 0, Math.PI, 0); c.fill();
      c.fillStyle = POO[2]; c.beginPath(); c.ellipse(hx, hy, 21, 13, 0, Math.PI, 0); c.fill();
      c.fillStyle = POO[3]; c.beginPath(); c.ellipse(hx - 3, hy - 3, 14, 8, 0, Math.PI, 0); c.fill();
      c.fillStyle = POO[4]; c.beginPath(); c.ellipse(hx - 6, hy - 6, 7, 4, 0, Math.PI, 0); c.fill();
      box(c, hx - 9, hy - 10, 3, 2, POO[5]);
      checker(c, hx - 20, hy - 2, 40, 2, POO[1], 0, 2);
      for (const [x, w, y1] of [[tx + 26, 6, g.deck - 2], [tx + 33, 4, g.base - 4], [tx + 6, 5, g.deck - 2]] as const) drip(c, x, g.base - 30, y1, w);
      for (const [x, w] of [[g.sx + 8, 7], [g.sx + g.sw - 20, 9]] as const) drip(c, x, g.base, g.deck - 2, w);
    }
    flies(c, g.mx + 6, g.base - 60, f, 9);
    // (the stink coming off it: wavy, in steps)
    c.lineWidth = 2;
    for (let k = 0; k < 3; k++) {
      const x = g.mx - 14 + k * 16, u = ((f + k * 20) % 60) / 60, y = g.base - 50 - u * 30;
      c.strokeStyle = `rgba(132, 204, 22, ${0.6 * (1 - u)})`;
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 6, y - 8, x, y - 16); c.quadraticCurveTo(x - 6, y - 24, x, y - 32); c.stroke();
    }
    note(c, g.sx - 40, g.deck - 36, 'OUT OF ORDER', '#FEF9C3', '#7F1D1D', -0.08);
  } else {
    // EXPLODED: a stump of it (porcelain, stepped), shards, brown up everything; the case blown open (stop 3)
    const col = i === 0 ? '#F4A6CC' : i === 1 ? '#9CAE3E' : '#2A2830', lt2 = mix(col, '#FFFFFF', 0.35), dk2 = mix(col, '#000000', 0.3);
    c.fillStyle = INK; c.beginPath(); c.moveTo(tx - 3, g.base); c.lineTo(tx - 1, g.base - 13); c.lineTo(tx + 5, g.base - 8); c.lineTo(tx + 9, g.base - 17); c.lineTo(tx + 14, g.base - 10); c.lineTo(tx + 17, g.base); c.closePath(); c.fill();
    c.fillStyle = col; c.beginPath(); c.moveTo(tx - 1, g.base); c.lineTo(tx, g.base - 10); c.lineTo(tx + 5, g.base - 5); c.lineTo(tx + 9, g.base - 14); c.lineTo(tx + 13, g.base - 7); c.lineTo(tx + 15, g.base); c.closePath(); c.fill();
    box(c, tx, g.base - 8, 2, 8, lt2); box(c, tx + 11, g.base - 6, 4, 6, dk2);
    for (let k = 0; k < 11; k++) { const sx = g.sx - 70 + ((k * 53) % (g.sw + 160)), sy = (k % 3 === 0 ? g.top : g.deck) - 3, w = 4 + (k % 3) * 2; box(c, sx - 1, sy - 1, w + 2, 5, INK); box(c, sx, sy, w, 3, col); box(c, sx, sy, w, 1, lt2); }
    // (splattered up the plinth and the back of the shrine: blobs, stepped)
    for (let k = 0; k < 16; k++) {
      const a = k * 2.4, r = 30 + (k * 37) % 100, ex = g.mx + Math.cos(a) * r, ey = g.base - 40 + Math.sin(a) * r * 0.6, rw = 4 + (k % 4) * 2, rh = 3 + (k % 3);
      c.fillStyle = POO[1]; c.beginPath(); c.ellipse(ex, ey, rw + 1, rh + 1, a, 0, Math.PI * 2); c.fill();
      c.fillStyle = POO[k % 2 ? 2 : 3]; c.beginPath(); c.ellipse(ex, ey, rw, rh, a, 0, Math.PI * 2); c.fill();
      box(c, ex - rw * 0.4, ey - rh * 0.5, 1, 1, POO[5]);
      if (k % 3 === 0) drip(c, ex - 1, ey, ey + 10 + (k % 5) * 4, 2);
    }
    flies(c, g.mx, g.base - 30, f, 12);
    if (i === 2) {
      // (the case's steel posts bent out, jagged glass at their feet; no glow now)
      c.lineCap = 'round';
      for (const [w, cl] of [[8, INK], [6, '#71717A'], [2, '#B4BCC8']] as const) {
        c.strokeStyle = cl; c.lineWidth = w;
        c.beginPath(); c.moveTo(g.sx + 3, g.base); c.quadraticCurveTo(g.sx - 6, g.top + 30, g.sx - 22, g.top + 4); c.stroke();
        c.beginPath(); c.moveTo(g.sx + g.sw - 3, g.base); c.quadraticCurveTo(g.sx + g.sw + 6, g.top + 30, g.sx + g.sw + 22, g.top + 4); c.stroke();
      }
      c.lineCap = 'butt';
      for (let x = g.sx + 6; x < g.sx + g.sw - 6; x += 12) {
        const h = 8 + ((x * 7) % 10);
        c.fillStyle = INK; c.beginPath(); c.moveTo(x - 1, g.base); c.lineTo(x + 5, g.base - h - 1); c.lineTo(x + 11, g.base); c.closePath(); c.fill();
        c.fillStyle = 'rgba(190, 242, 100, 0.55)'; c.beginPath(); c.moveTo(x, g.base); c.lineTo(x + 5, g.base - h); c.lineTo(x + 10, g.base); c.closePath(); c.fill();
        box(c, x + 4, g.base - h + 2, 1, 3, 'rgba(255,255,255,0.7)');
      }
    }
    note(c, g.sx - 40, g.deck - 36, 'CLOSED FOREVER', '#FACC15', '#000000', 0.06);
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
    // (the case down over him: tinted glass in bands, fogging brown from the floor up, glare; the steel corners, the lid)
    const fog = Math.min(1, st.t / 900);
    for (let k = 0; k < 3; k++) { c.fillStyle = `rgba(132, 204, 22, ${0.1 + k * 0.04})`; c.fillRect(g.sx, g.top + k * 24, g.sw, 24); }
    const fh = 72 * fog * 0.6;
    for (let k = 0; k < 3; k++) { c.fillStyle = `rgba(92, 58, 22, ${0.45 * fog * (1 - k * 0.25)})`; c.fillRect(g.sx, g.top + 72 - fh * (k + 1) / 3, g.sw, fh / 3); }
    c.fillStyle = 'rgba(255, 255, 255, 0.35)'; c.fillRect(g.sx + 12, g.top + 6, 3, 60); c.fillRect(g.sx + 20, g.top + 6, 2, 40);
    for (const px of [g.sx, g.sx + g.sw - 7]) { box(c, px - 1, g.top - 1, 9, 74, INK); box(c, px, g.top, 7, 72, '#71717A'); box(c, px, g.top, 2, 72, '#B4BCC8'); box(c, px + 6, g.top, 1, 72, '#3F3F46'); }
    box(c, g.sx - 2, g.top - 2, g.sw + 4, 7, INK); box(c, g.sx - 1, g.top - 1, g.sw + 2, 5, '#52525B'); box(c, g.sx - 1, g.top - 1, g.sw + 2, 2, '#F2D79A');
  }
};
