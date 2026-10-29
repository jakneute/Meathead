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
// state.stageMemo (THRONE_MEMO), like the stops' staff. Stop 3's, the Rock God's in its hazmat case, he won't sit on
// (the user's: "make sure you cannot shit on it; it's harmful"): crouched by it he says no. Its case can be shot to
// pieces instead (index.ts caseShots): the sludge everywhere, the toilet gone (EXPLODED), and it never vents again.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import { hands, meatheadSays, box } from '../section';
import { checker, mix, hash } from '../../intro/art/kit';
import { still, hour, ramp6, BRASS } from '../blvd/kit';
import { CHROME } from './paint';
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
    if (i === 2 || !state.stageMemo[CLEARED_MEMO(i)] || throneState(state, i) === 'exploded') continue;
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
  // (crouched by the Rock God's: no)
  if (by < 0 && controls.down && p.isGrounded && throneState(state, 2) !== 'exploded' && state.frame - co.nopeAt > 600) {
    const g = throneAt(2), cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
    if (Math.abs(cx - g.mx) <= g.sw / 2 + 70 && feet >= g.top - 8 && feet <= g.deck + 8) { co.nopeAt = state.frame; meatheadSays(state, pickLine(L.THRONE_NOPE), false); }
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

// ---------------------------------------------------------------------------------------------------------------
// THE CLOG (a SHITTY toilet), peak SNES, painted once per toilet (by the hour) into a stamp: origin at the toilet's
// middle (g.mx) on what it stands on (g.base); the toilet's own art sits at x -6 (its bowl -10..26, the seat -35..-25,
// the tank -32..-8 from -76 up to its lid at -82). Only the flies, the stink and the drops running down are live.

const PORC = ['#F4A6CC', '#9CAE3E', '#2A2830'];
/** Poo for the hour, darkest first. */
const pooH = () => POO.map(cc => hour(cc));
const GLINT = '#FFF6E0';
const ell = (g: Ctx, x: number, y: number, rx: number, ry: number, col: string, a = 0) => { if (rx <= 0 || ry <= 0) return; g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, a, 0, Math.PI * 2); g.fill(); };

/** One lump of it: inked, stepped (lit up its upper left), dithered into its shadow, a wet glint. */
const lump = (g: Ctx, P: string[], x: number, y: number, rx: number, ry: number, s: number) => {
  ell(g, x, y, rx + 1.2, ry + 1.2, INK);
  ell(g, x, y, rx, ry, P[1]);
  ell(g, x - rx * 0.08, y - ry * 0.14, rx * 0.86, ry * 0.8, P[2]);
  ell(g, x - rx * 0.2, y - ry * 0.3, rx * 0.6, ry * 0.52, P[3]);
  ell(g, x - rx * 0.32, y - ry * 0.46, rx * 0.3, ry * 0.26, P[4]);
  g.save(); g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.clip();
  checker(g, x - rx * 0.1, y + ry * 0.15, rx * 1.2, ry, P[0], 0, 1);
  checker(g, x - rx, y - ry * 0.25, rx * 0.9, 2, P[3], 1, 1);
  g.restore();
  // (texture: dark pits, a crease)
  for (let k = 0; k < 2 + (rx >> 2); k++) box(g, x - rx * 0.6 + hash(s + k * 3.1) * rx * 1.2, y - ry * 0.4 + hash(s + k * 7.7) * ry * 0.9, 1, 1, P[0]);
  if (rx > 6) box(g, x - rx * 0.3, y + ry * 0.2, rx * 0.5, 1, P[1]);
  box(g, x - rx * 0.45, y - ry * 0.6, Math.max(1, rx * 0.18), 1, GLINT);
  if (rx > 5) box(g, x + rx * 0.2, y - ry * 0.35, 1, 1, P[5]);
};
/** A corn kernel (it's always corn). */
const corn = (g: Ctx, x: number, y: number) => { box(g, x - 1, y - 1, 4, 4, INK); box(g, x, y, 2, 2, hour('#F2C230')); box(g, x, y, 1, 1, hour('#FFF0A0')); };
/** A run down something: wide where it came over, tapering, a bead at its foot, lit down its left. */
const run = (g: Ctx, P: string[], x: number, y0: number, y1: number, w: number) => {
  g.fillStyle = INK; g.beginPath(); g.moveTo(x - 1.5, y0); g.lineTo(x + w + 1.5, y0); g.lineTo(x + w * 0.62 + 1, y1); g.lineTo(x + w * 0.38 - 1, y1); g.closePath(); g.fill();
  g.fillStyle = P[2]; g.beginPath(); g.moveTo(x, y0); g.lineTo(x + w, y0); g.lineTo(x + w * 0.62, y1); g.lineTo(x + w * 0.38, y1); g.closePath(); g.fill();
  box(g, x + 1, y0, Math.max(1, w * 0.22), (y1 - y0) * 0.7, P[4]);
  box(g, x + w * 0.7, y0, 1, (y1 - y0) * 0.5, P[1]);
  ell(g, x + w / 2, y1 + 1, w * 0.3 + 2, w * 0.3 + 1.5, INK); ell(g, x + w / 2, y1 + 1, w * 0.3 + 1, w * 0.3 + 0.6, P[2]);
  box(g, x + w / 2 - 1, y1, 1, 1, GLINT);
};
/** A splat: the blob, flung droplets round it, sometimes a run off it. */
const splat = (g: Ctx, P: string[], x: number, y: number, r: number, s: number, runs = true) => {
  for (let k = 0; k < 6; k++) { const a = hash(s + k) * Math.PI * 2, d = r * (1.3 + hash(s + k * 5.3) * 1.4), dr = 0.8 + hash(s + k * 2.2) * r * 0.3; ell(g, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.8, dr + 1, dr + 1, INK); ell(g, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.8, dr, dr, P[k % 2 ? 2 : 3]); }
  ell(g, x, y, r + 1.2, r * 0.8 + 1.2, INK);
  ell(g, x, y, r, r * 0.8, P[2]); ell(g, x - r * 0.25, y - r * 0.2, r * 0.6, r * 0.45, P[3]);
  for (let k = 0; k < 3; k++) { const a = s + k * 2.1; ell(g, x + Math.cos(a) * r, y + Math.sin(a) * r * 0.7, r * 0.45 + 1, r * 0.35 + 1, INK); ell(g, x + Math.cos(a) * r, y + Math.sin(a) * r * 0.7, r * 0.45, r * 0.35, P[2]); }
  box(g, x - r * 0.4, y - r * 0.4, 1, 1, GLINT);
  if (runs && r > 2) run(g, P, x - 1, y + r * 0.5, y + r * 0.5 + 6 + hash(s * 3) * 12, Math.max(2, r * 0.6));
};
/** Toilet paper: a ribbon along the points (inked, lit, its perforations), stained in blots along it. */
const tp = (g: Ctx, P: string[], pts: [number, number][], s: number) => {
  const path = () => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let k = 1; k < pts.length; k++) g.lineTo(pts[k][0], pts[k][1]); };
  g.lineJoin = 'round'; g.lineCap = 'butt';
  path(); g.strokeStyle = INK; g.lineWidth = 7; g.stroke();
  path(); g.strokeStyle = hour('#C8C0B0'); g.lineWidth = 5; g.stroke();
  g.save(); g.translate(-1, -1); path(); g.strokeStyle = hour('#F4F0E6'); g.lineWidth = 3; g.stroke(); g.restore();
  for (let k = 0; k < pts.length - 1; k++) {
    const [ax, ay] = pts[k], [bx, by] = pts[k + 1];
    box(g, (ax + bx) / 2 - 1, (ay + by) / 2 - 1, 2, 2, hour('#A8A090'));
    if (hash(s + k) < 0.65) { const u = hash(s + k * 4.4); ell(g, ax + (bx - ax) * u, ay + (by - ay) * u, 2.4, 1.8, P[k % 2 ? 2 : 3]); }
  }
  g.lineJoin = 'miter';
};
/** The puddle on the floor: lobes run together, banded down to its middle, a dithered sheen, a ring round it. */
const puddle = (g: Ctx, P: string[], cx: number, y: number, rxL: number, rxR: number, s: number) => {
  const lobes: [number, number, number][] = [];
  for (let k = 0; k < 9; k++) { const u = k / 8, x = cx - rxL + (rxL + rxR) * u, rr = (k === 0 || k === 8 ? 0.35 : 0.55 + hash(s + k) * 0.45) * (rxL + rxR) / 7; lobes.push([x, y + (hash(s + k * 3) - 0.5) * 2, rr]); }
  const pass = (grow: number, k: number, col: string, dy = 0) => { for (const [x, yy, rr] of lobes) ell(g, x, yy + dy, rr * k + grow, (5 + rr * 0.12) * k + grow * 0.6, col); };
  pass(4, 1, 'rgba(60, 36, 12, 0.35)', 1); // (the wet ring soaking out round it)
  pass(1.5, 1, INK);
  pass(0, 1, P[1]);
  pass(0, 0.8, P[2], -0.5);
  pass(0, 0.5, P[3], -1);
  g.save(); g.beginPath(); for (const [x, yy, rr] of lobes) g.ellipse(x, yy - 1, rr * 0.5, (5 + rr * 0.12) * 0.5, 0, 0, Math.PI * 2); g.clip();
  checker(g, cx - rxL, y - 6, rxL + rxR, 3, P[4], 0, 1);
  g.restore();
  // (the shine on it: a broken streak of glare, a couple of glints)
  for (let k = 0; k < 5; k++) box(g, cx - rxL * 0.5 + k * (rxL + rxR) * 0.12, y - 3 + (k % 2), 4 + (k % 3) * 3, 1, P[5]);
  box(g, cx - rxL * 0.3, y - 4, 2, 1, GLINT); box(g, cx + rxR * 0.4, y - 3, 1, 1, GLINT);
  // (bubbles on it, floating chunks, corn)
  for (let k = 0; k < 6; k++) { const bx = cx - rxL * 0.8 + hash(s + k * 9.1) * (rxL + rxR) * 0.85, by = y - 2 + hash(s + k * 2.7) * 3; g.strokeStyle = P[4]; g.lineWidth = 1; g.beginPath(); g.arc(bx, by - 1, 1.5 + (k % 2), Math.PI, 0); g.stroke(); box(g, bx - 1, by - 2, 1, 1, GLINT); }
  for (let k = 0; k < 5; k++) lump(g, P, cx - rxL * 0.7 + hash(s + k * 5.5) * (rxL + rxR) * 0.8, y - 2, 3 + (k % 3), 2, s + k * 11);
  for (let k = 0; k < 4; k++) corn(g, cx - rxL * 0.6 + hash(s + k * 13.3) * (rxL + rxR) * 0.7, y - 2 + (k % 2));
};
/** The heap: coiled up out of the bowl in tiers (each a row of lumps), slumped over the rim, hanging off it in runs. */
const heap = (g: Ctx, P: string[], cx: number, rim: number, tiers: number, s: number) => {
  // (slopped over the rim and down the bowl's front, under the heap)
  for (const [x, w, d] of [[-12, 6, 14], [20, 7, 18], [4, 5, 22], [-4, 4, 10], [27, 4, 9]] as const) run(g, P, cx - 10 + x + 6, rim + 2, rim + d, w);
  // (the base tier spills wider than the bowl, sagging over the seat's edges)
  for (const [x, y, rx, ry] of [[-16, rim + 5, 7, 5], [34, rim + 4, 7, 5], [-20, rim + 10, 4, 4], [38, rim + 9, 4, 4]] as const) lump(g, P, cx - 10 + x + 2, y, rx, ry, s + x);
  const W = [26, 20, 14, 9, 6];
  for (let t = 0; t < tiers; t++) {
    const w = W[t] + (tiers > 3 ? 2 : 0), y = rim - 2 - t * 8, sx = cx + Math.sin(s + t * 1.7) * 2, n = Math.max(2, Math.round(w / 6));
    for (let k = 0; k < n; k++) { const u = n === 1 ? 0.5 : k / (n - 1), lx = sx - w + 6 + u * (w * 2 - 12); lump(g, P, lx, y + (hash(s + t * 7 + k) - 0.5) * 2, 6.5 - t * 0.7 + hash(s + k + t) * 1.5, 5 - t * 0.4, s + t * 13 + k); }
  }
  // (the coil's tip, curling over)
  const ty = rim - 2 - tiers * 8 + 2, tx = cx + Math.sin(s) * 2;
  g.fillStyle = INK; g.beginPath(); g.moveTo(tx - 6, ty + 2); g.quadraticCurveTo(tx - 4, ty - 10, tx + 5, ty - 9); g.quadraticCurveTo(tx + 7, ty - 4, tx + 4, ty + 2); g.closePath(); g.fill();
  g.fillStyle = P[3]; g.beginPath(); g.moveTo(tx - 4.5, ty + 1); g.quadraticCurveTo(tx - 3, ty - 8.5, tx + 4, ty - 7.5); g.quadraticCurveTo(tx + 5.5, ty - 4, tx + 3, ty + 1); g.closePath(); g.fill();
  box(g, tx - 3, ty - 6, 2, 2, P[4]); box(g, tx - 2, ty - 7, 1, 1, GLINT); box(g, tx + 1, ty - 2, 3, 2, P[1]);
  // (corn in it, a couple of peanuts' worth of bits, the wet sheen down its lit side)
  for (let k = 0; k < 5; k++) corn(g, cx - 14 + hash(s + k * 3.9) * 26, rim - 4 - hash(s + k * 8.3) * tiers * 7);
  for (let k = 0; k < tiers * 3; k++) box(g, cx - 16 + hash(s + k * 6.1) * 14, rim - 4 - k * 2.4, 1, 1, GLINT);
};

/** Paint a toilet's clog (stops 1 and 2, on their plinths: ph down to the deck; stop 3 in its case). */
const paintClog = (g: Ctx, i: number, sw: number, ph: number) => {
  const P = pooH(), R = ramp6(hour(PORC[i])), C = (i === 0 ? BRASS : CHROME).map(cc => hour(cc)), s = 17 + i * 31;
  const hw = sw / 2;
  // The puddle on the deck, spreading out past the ropes; the flush handle in it (snapped off)
  puddle(g, P, 14, ph - 1, hw + 110, hw + 130, s);
  { const hx = hw + 52, hy = ph - 4; box(g, hx - 1, hy - 3, 11, 5, INK); box(g, hx, hy - 2, 9, 3, C[3]); box(g, hx, hy - 2, 9, 1, C[5]); box(g, hx + 7, hy - 2, 2, 3, C[1]); lump(g, P, hx + 10, hy, 3, 2, s + 99); }
  // (stray bits flung further, and the wet footprints he didn't leave: just toilet paper scraps)
  for (let k = 0; k < 7; k++) { const x = (k % 2 ? 1 : -1) * (hw + 30 + hash(s + k * 4.1) * 120); lump(g, P, x, ph - 2, 2 + (k % 2), 1.6, s + k * 21); }
  for (const x of [-hw - 70, hw + 96]) { box(g, x - 1, ph - 4, 10, 4, INK); box(g, x, ph - 3, 8, 2, hour('#F4F0E6')); box(g, x + 3, ph - 3, 3, 2, P[3]); }
  if (i < 2) {
    // Down the plinth's front: sheets over its lip thinning into runs, one smeared right across the star
    for (const [x, w, d] of [[-hw + 6, 9, ph - 8], [-hw + 22, 5, ph * 0.55], [hw - 26, 10, ph - 6], [hw - 12, 4, ph * 0.4], [16, 6, ph * 0.35]] as const) run(g, P, x, 0, d, w);
    for (let x = -hw; x < hw; x += 3) { const h2 = 2 + hash(s + x) * 4; box(g, x, 0, 3, h2, P[2]); box(g, x, h2, 3, 1, INK); }
    box(g, -hw, 0, sw, 1, P[4]);
    splat(g, P, -3, ph / 2 - 3, 6, s + 5);
    splat(g, P, 6, ph / 2 + 4, 3, s + 9, false);
    // The brass plaque on its stand: it got some too
    splat(g, P, -hw - 168, ph - 78, 3.5, s + 41);
    splat(g, P, -hw - 132, ph - 66, 2.5, s + 43);
    splat(g, P, -hw - 150, ph - 30, 2, s + 47, false);
  } else {
    // Out of the case's seams and down the steel base, in runs
    for (const [x, w, d] of [[-hw + 2, 6, ph - 4], [-hw + 30, 4, ph * 0.5], [hw - 10, 7, ph - 3], [hw - 40, 4, ph * 0.6], [-6, 5, ph * 0.45]] as const) run(g, P, x, 0, d, w);
    for (let x = -hw; x < hw; x += 3) box(g, x, 0, 3, 1 + hash(s + x) * 3, P[2]);
  }
  // The porcelain: streaks down the bowl, the seat splattered, the tank and its lid hit (it went everywhere)
  for (const [x, d, w] of [[-8, 20, 4], [2, 26, 5], [12, 18, 3], [22, 24, 4]] as const) run(g, P, x, -25, -25 + d, w);
  splat(g, P, -10, -30, 2.5, s + 61, false); splat(g, P, 27, -31, 3, s + 63, false); splat(g, P, 18, -29, 2, s + 65, false);
  splat(g, P, -21, -52, 4, s + 71); splat(g, P, -14, -66, 2.5, s + 73); splat(g, P, -26, -42, 2, s + 75, false);
  splat(g, P, -23, -78, 3, s + 77); splat(g, P, -12, -79, 2, s + 79, false);
  // (the flush handle: snapped off at the tank, a stub left)
  box(g, -31, -64, 4, 4, R[4]); box(g, -27, -64, 3, 4, R[3]);
  box(g, -30, -63, 3, 2, INK); box(g, -29, -63, 1, 1, C[4]);
  // The heap, up out of the bowl and over the rim
  heap(g, P, 10, -30, i === 0 ? 4 : i === 1 ? 3 : 3, s);
  if (i === 1) {
    // (the plunger's still in there, buried to the stick: its stick up out of the heap, a ring of it where it goes in)
    g.save(); g.translate(8, -30); g.rotate(0.32);
    box(g, -3, -46, 6, 22, INK); box(g, -2, -45, 4, 20, hour('#A16207')); box(g, -2, -45, 1, 20, hour('#D4A040'));
    box(g, -3, -27, 6, 3, P[1]); box(g, -2, -28, 4, 1, P[3]); box(g, -2, -33, 2, 3, P[2]);
    g.restore();
  }
  if (i === 0) {
    // (it got up onto his fedora and into the martini)
    splat(g, P, -27, -86, 2.5, s + 81, false);
    box(g, -11, -90, 4, 2, P[2]); box(g, -11, -90, 1, 1, P[4]);
  }
  // Toilet paper: a wad stuck to the seat, a long tail trailing off the heap over the rim, down the bowl and onto the floor
  tp(g, P, [[-12, -36], [-8, -38], [-4, -35]], s + 3);
  tp(g, P, i < 2
    ? [[24, -40], [30, -33], [31, -26], [28, -16], [30, -6], [34, 0], [hw - 4, 3], [hw - 2, ph * 0.5], [hw + 6, ph - 4], [hw + 30, ph - 2]]
    : [[24, -40], [30, -33], [31, -26], [28, -16], [30, -6], [36, -1], [44, -2]], s + 7);
};

/** The clog's live bits: flies buzzing over it and the puddle, the stink coming off it in stepped squiggles, drops
 *  running down the plinth (or the base) and falling into the puddle, a bubble coming up in it. */
const clogLive = (c: Ctx, g: ReturnType<typeof throneAt>, f: number, i: number) => {
  const P = pooH(), ph = g.deck - g.base, hw = g.sw / 2;
  flies(c, g.mx + 8, g.base - 62, f, 8);
  flies(c, g.mx - hw - 30, g.deck - 18, f + 50, 4);
  flies(c, g.mx + hw + 60, g.deck - 14, f + 90, 3);
  // (the stink: wavy columns of green-brown squares, fading as they rise)
  for (let k = 0; k < 5; k++) {
    const bx = k < 3 ? g.mx - 6 + k * 14 : g.mx + (k === 3 ? -hw - 50 : hw + 70), by0 = k < 3 ? g.base - 58 : g.deck - 8;
    const u = ((f * 0.8 + k * 23) % 70) / 70;
    for (let j = 0; j < 6; j++) {
      const v = u + j * 0.06, y = by0 - v * 50, x = bx + Math.sin(v * 9 + k) * 5, a = Math.max(0, 0.7 * (1 - v));
      if (a <= 0) continue;
      c.fillStyle = j % 2 ? `rgba(132, 204, 22, ${a})` : `rgba(120, 100, 30, ${a})`;
      c.fillRect(Math.round(x), Math.round(y), 2, 2);
    }
  }
  // (drops running down the front and off into the puddle, a little splash)
  const rails = i < 2 ? [[-hw + 9, 0], [hw - 21, 0], [14, -25]] : [[-hw + 4, 0], [hw - 7, 0]];
  rails.forEach(([rx, y0], k) => {
    const len = (ph + (y0 < 0 ? 25 : 0)), u = ((f + k * 47) % 110) / 110, y = g.base + y0 + u * len, x = g.mx + rx;
    if (u < 0.9) { box(c, x - 1, y - 1, 4, 5, INK); box(c, x, y, 2, 3, P[2]); box(c, x, y, 1, 1, GLINT); }
    else { const sp = (u - 0.9) * 40; box(c, x - sp, g.deck - 4 - sp * 0.6, 2, 2, P[3]); box(c, x + sp, g.deck - 4 - sp * 0.6, 2, 2, P[3]); }
  });
  // (a bubble swelling up in the puddle and popping)
  const bu = (f % 150) / 150;
  if (bu < 0.3) { const bx = g.mx + 40 - (i * 37) % 60, r = 1 + bu * 12; c.strokeStyle = P[4]; c.lineWidth = 1; c.beginPath(); c.arc(bx, g.deck - 3, r, Math.PI, 0); c.stroke(); box(c, bx - r * 0.5, g.deck - 3 - r * 0.8, 1, 1, GLINT); }
};

/** A toilet's state on the shrine (behind him): the clog (heaped, overflowing, the lake on the deck), or the wreck. */
export const drawThroneMess = (c: Ctx, state: GameState, i: number) => {
  const ts = throneState(state, i), f = state.frame, g = throneAt(i), tx = g.mx - 6;
  if (ts === 'clean') return;
  if (ts === 'shitty') {
    const ph = g.deck - g.base, hw = g.sw / 2;
    still(c, `hwc-clog-${i}`, g.mx, g.base, -hw - 250, -110, g.sw + 520, ph + 24, gg => paintClog(gg, i, g.sw, ph));
    if (i === 2) {
      // (in the case: brown up the inside of the glass in bands, smeared, runs down it; fogged at the top)
      const x0 = g.sx + 7, w = g.sw - 14;
      for (let k = 0; k < 3; k++) { c.fillStyle = `rgba(92, 58, 22, ${0.5 - k * 0.13})`; c.fillRect(x0, g.top + 72 - (k + 1) * 12, w, 12); }
      c.fillStyle = 'rgba(120, 90, 40, 0.22)'; c.fillRect(x0, g.top + 4, w, 26);
      for (let k = 0; k < 6; k++) { const sx = x0 + 6 + ((k * 37) % (w - 12)), sy = g.top + 8 + ((k * 23) % 30), len = 12 + (k * 11) % 20; c.fillStyle = 'rgba(70, 42, 14, 0.55)'; c.fillRect(sx, sy, 3, len); c.fillRect(sx - 2, sy - 2, 7, 4); c.fillStyle = 'rgba(190, 140, 70, 0.4)'; c.fillRect(sx, sy, 1, len - 2); }
      // (a handprint smeared down the inside of the glass)
      const hx = x0 + w - 30, hy = g.top + 20;
      c.fillStyle = 'rgba(70, 42, 14, 0.6)'; c.fillRect(hx, hy + 6, 10, 9);
      for (let k = 0; k < 4; k++) c.fillRect(hx + k * 2.6, hy - 2 + Math.abs(k - 1.5) * 1.5, 2, 9);
      c.fillRect(hx + 10, hy + 7, 4, 2); c.fillRect(hx + 2, hy + 15, 6, 14);
    }
    clogLive(c, g, f, i);
    note(c, g.sx - 40, g.deck - 36, 'OUT OF ORDER', '#FEF9C3', '#7F1D1D', -0.08);
  } else {
    lake(c, g.mx + 10, g.deck - 1, g.sw / 2 + 120);
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
