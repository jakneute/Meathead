// THE KAIJU FINALE's tiny world under his feet: the guests and staff running for it as he comes (a few pixels each,
// legs going), the little cars on the park's service road driving off, both pooled; a tiny one under his foot is
// gone in a red speck. And the CALLBACKS (the owner's: "there will be tons of callbacks like 'oh no, we need to shoot
// someplace else' when you destroy the set for the revengers"): when a landmark goes, one of the people from it the
// first time through says their piece, a tiny figure stood by the rubble, the words over it only while they're said;
// only when nobody else is talking (no talk-over), picked with pickLine (no repeat inside 45 s).

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH as W } from '../../../m1/constants';
import { pickLine, isTalking } from '../../../m1/game/platform/speech';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { speak, saidOver } from '../../adventure/section';
import { floorY } from './geo';
import { CALLBACKS, type Callback } from './lines';
import type { Lm } from './landmarks';

type Ctx = CanvasRenderingContext2D;

interface Runner { on: boolean; x: number; y: number; vx: number; ph: number; t: number; shirt: string; skin: string; car: boolean }
const RUNNERS: Runner[] = Array.from({ length: 90 }, () => ({ on: false, x: 0, y: 0, vx: 0, ph: 0, t: 0, shirt: '', skin: '', car: false }));
const SHIRTS = ['#DC2626', '#2563EB', '#16A34A', '#F59E0B', '#F8FAFC', '#A855F7', '#EC4899', '#0EA5E9'];
const SKINS = ['#F2C9A0', '#C68A5E', '#8A5A3A', '#E8B48A', '#5A3A24'];
const CARS = ['#DC2626', '#F8FAFC', '#1D4ED8', '#FDE047', '#16A34A', '#111827'];
let ri = 0;
export const clearTiny = () => { for (const r of RUNNERS) r.on = false; said.on = false; queue.length = 0; };

/** A handful of them, out of a landmark he's coming up on: running off away from him (and a car or two). */
export const scatter = (state: GameState, x: number, w: number, n: number) => {
  const px = state.player.pos.x + state.player.width / 2;
  for (let k = 0; k < n; k++) {
    const r = RUNNERS[ri]; ri = (ri + 1) % RUNNERS.length;
    const car = k % 5 === 4;
    r.on = true; r.car = car; r.x = x + (Math.random() - 0.5) * w; r.y = 0; r.t = 0; r.ph = Math.random() * 6;
    const away = Math.sign(r.x - px) || 1;
    r.vx = away * (car ? 1.6 + Math.random() : 0.5 + Math.random() * 0.7);
    r.shirt = car ? CARS[k % CARS.length] : SHIRTS[(k * 3 + Math.floor(x)) % SHIRTS.length];
    r.skin = SKINS[(k * 7 + Math.floor(x / 3)) % SKINS.length];
  }
};

/** Each frame: them going; under his foot (or a boss's), gone in a speck. */
export const updateTiny = (state: GameState, feet: { x0: number; x1: number }[], speck: (x: number, y: number) => void) => {
  const L = state.camera.x - 200, Rr = state.camera.x + W + 200;
  for (const r of RUNNERS) {
    if (!r.on) continue;
    r.t++; r.x += r.vx; r.ph += Math.abs(r.vx) * 0.6;
    r.y = floorY(r.x);
    if (r.x < L || r.x > Rr || r.t > 900) { r.on = false; continue; }
    for (const f of feet) if (r.x > f.x0 && r.x < f.x1) { r.on = false; speck(r.x, r.y); break; }
  }
};
export const drawTiny = (c: Ctx, state: GameState) => {
  const L = state.camera.x - 10, Rr = state.camera.x + W + 10;
  for (const r of RUNNERS) {
    if (!r.on || r.x < L || r.x > Rr) continue;
    const x = Math.round(r.x), y = Math.round(r.y);
    if (r.car) {
      c.fillStyle = '#0B0A10'; c.fillRect(x - 4, y - 4, 9, 4);
      c.fillStyle = r.shirt; c.fillRect(x - 3, y - 4, 7, 3); c.fillStyle = '#9ADCF4'; c.fillRect(x + (r.vx > 0 ? 1 : -2), y - 4, 2, 1);
      c.fillStyle = '#0B0A10'; c.fillRect(x - 3, y - 1, 2, 1); c.fillRect(x + 2, y - 1, 2, 1);
      continue;
    }
    const leg = Math.sin(r.ph) > 0 ? 1 : 0;
    c.fillStyle = '#1F2937'; c.fillRect(x - 1 + leg, y - 2, 1, 2); c.fillRect(x + 1 - leg, y - 2, 1, 2);
    c.fillStyle = r.shirt; c.fillRect(x - 1, y - 4, 3, 2);
    c.fillStyle = r.skin; c.fillRect(x, y - 5, 1, 1);
    // (arms up: running for it)
    if ((r.t >> 3) % 2) { c.fillRect(x - 1, y - 6, 1, 1); c.fillRect(x + 2, y - 6, 1, 1); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The callbacks

interface Said { on: boolean; x: number; y: number; cb: Callback | null; text: string | null; t: number }
const said: Said = { on: false, x: 0, y: 0, cb: null, text: null, t: 0 };
/** Landmarks down, waiting their turn to be talked about (no talk-over: a few seconds, then let go). */
const queue: { m: Lm; at: number }[] = [];
let tok = 0;

const dressed = (state: GameState) => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');
/** A landmark's down: its people's piece, when there's a gap. */
export const callbackFor = (state: GameState, m: Lm) => { if (!m.said && CALLBACKS[m.def.id]) queue.push({ m, at: state.frame }); m.said = true; };
/** Is a callback being said now (the rest of the finale's talk holds off). */
export const callbackOn = () => said.on;

/** Each frame: the next in line, said, if nothing else is (and it's still near enough to see). */
export const updateCallbacks = (state: GameState, blocked: boolean) => {
  while (queue.length && state.frame - queue[0].at > 300) queue.shift();
  if (said.on) { said.t++; if (said.t > 60 * 9) said.on = false; return; }
  if (!queue.length || blocked || isTalking()) return;
  const { m } = queue.shift()!;
  const list = CALLBACKS[m.def.id];
  const cb = list[Math.floor(Math.random() * list.length)];
  const text = pickLine(cb.lines[dressed(state)]);
  // (stood by the rubble on the side nearer the middle of the screen: always in view)
  const mid = state.camera.x + W / 2, side = m.x < mid ? 1 : -1;
  said.on = true; said.cb = cb; said.text = null; said.t = 0;
  said.x = Math.max(state.camera.x + 40, Math.min(state.camera.x + W - 40, m.x + side * (m.def.w / 2 + 8)));
  said.y = floorY(said.x);
  const my = ++tok;
  speak(cb.voice, text, s => { if (my === tok) said.text = s?.text ?? null; }, false, () => { if (my === tok) { said.on = false; said.text = null; } });
};

/** The tiny speaker (a few pixels more than the rest: a look of theirs), and their words over them. */
export const drawCallback = (c: Ctx) => {
  if (!said.on || !said.cb) return;
  const x = Math.round(said.x), y = Math.round(said.y), cb = said.cb;
  c.fillStyle = '#0B0A10'; c.fillRect(x - 2, y - 9, 5, 9);
  c.fillStyle = '#1F2937'; c.fillRect(x - 1, y - 3, 1, 3); c.fillRect(x + 1, y - 3, 1, 3);
  c.fillStyle = cb.col; c.fillRect(x - 1, y - 7, 3, 4);
  c.fillStyle = cb.look === 'alien' ? '#86EFAC' : cb.look === 'monster' ? '#7F1D1D' : cb.look === 'robot' ? '#9CA3AF' : '#E8B48A'; c.fillRect(x - 1, y - 9, 3, 2);
  if (cb.look === 'cop' || cb.look === 'staff') { c.fillStyle = '#111827'; c.fillRect(x - 1, y - 10, 3, 1); }
  if (cb.look === 'cowboy') { c.fillStyle = '#7C2D12'; c.fillRect(x - 2, y - 10, 5, 1); }
  // (an arm up, shaking a fist at him)
  if ((said.t >> 3) % 2) { c.fillStyle = cb.col; c.fillRect(x + 2, y - 9, 1, 2); }
  if (said.text) saidOver(c, said.text, x, y - 14, '#FDE68A');
};
