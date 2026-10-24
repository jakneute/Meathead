// THE DYNAMITE (the user's: "show dynamite fall into any decoupled cars. can't be interacted with. let's the player know
// they really need to get off"): the moment a cut goes (the coupling parted, the cut-off end dropping back: cars.ts),
// bundles of it come lobbed back over the gap from the train ahead, tumbling, and land in the cut-off cars near the
// screen: on the floor of the car he's inside, else on its top (the roof, the logs, the ore, the tank) where he'll see
// them; a bounce, they lie there, the fuses fizzing down, sparks spitting. Only looks: nothing hits them, nothing picks
// them up, they hit nothing. They go up with the cars (derail: the blast, the wrecks).
//
// The bundle (three red sticks, tape, the fuse's stub) painted once and kept; the live fuse and its sparks over it.

import type { GameState } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { CARS, DECK, ROOF, COUPLER, TOP, ENTERABLE } from './layout';
import { trainOf, type Train } from './state';
import { carXNow, insideCar } from './where';
import { inView } from './view';

type Ctx = CanvasRenderingContext2D;

export interface Dyn {
  car: number;
  /** Where it is along its car (x from the car's left end now, y in the world), its fall, its turn. */
  lx: number; y: number; vx: number; vy: number; rot: number; spin: number;
  /** Frames till it's thrown (staggered), frames since; where it lands (y), landed. */
  wait: number; t: number; floor: number; down: boolean; seed: number;
}

const G = 0.35, FLIGHT = 38;
/** The fuses' burn: frames from the cut to the blast (cars.ts BLOW_AT) less the throw. */
const BURN = 150;

/** The cut's gone (cars `rear`..`k` cut loose): the bundles thrown into the ones near the screen. */
export const throwDynamite = (state: GameState, tr: Train, k: number) => {
  let n = 0;
  for (let i = k; i >= tr.rear; i--) {
    const d = CARS[i], x = carXNow(tr, i);
    if (tr.cars[i]?.gone || !inView(state, x, x + d.len, 200)) continue;
    const inside = insideCar(state, tr, i);
    const floor = inside ? DECK : ENTERABLE.includes(d.kind) ? ROOF : TOP[d.kind] ?? DECK;
    const count = i === k ? 3 : 2;
    for (let j = 0; j < count; j++) {
      // (from over the gap ahead of the cut, lobbed back; low through the door into a car he's in)
      const lx0 = d.len + COUPLER * 0.5 + 10, y0 = inside ? DECK - 130 : floor - 150;
      const lxT = d.len * (0.82 - (j / count) * 0.6) + ((i * 37 + j * 53) % 40) - 20;
      const vx = (lxT - lx0) / FLIGHT, vy = (floor - y0 - 0.5 * G * FLIGHT * FLIGHT) / FLIGHT;
      tr.dyn.push({ car: i, lx: lx0, y: y0, vx, vy, rot: 0, spin: -0.25 - ((j * 7) % 3) * 0.05, wait: 6 + n * 9, t: 0, floor, down: false, seed: i * 11 + j * 5 });
      n++;
    }
  }
  if (n) playSound('whoosh', 0.6, 4);
};

/** Each frame: in the air, falling and turning; landed, a bounce and lying flat. */
export const updateDynamite = (state: GameState) => {
  const tr = trainOf(state);
  if (!tr.dyn.length) return;
  // (gone with their cars, or the cut called off)
  tr.dyn = tr.dyn.filter(q => !tr.cars[q.car]?.gone && tr.cut && tr.cut.phase === 'drift' && q.car <= tr.cut.k);
  for (const q of tr.dyn) {
    if (q.wait > 0) { q.wait--; continue; }
    q.t++;
    if (q.down) { q.rot += (Math.round(q.rot / Math.PI) * Math.PI - q.rot) * 0.3; continue; }
    q.lx += q.vx; q.vy += G; q.y += q.vy; q.rot += q.spin;
    if (q.y >= q.floor && q.vy > 0) {
      q.y = q.floor;
      // (one bounce, then down)
      if (q.vy > 3) { q.vy = -q.vy * 0.3; q.vx *= 0.4; q.spin *= 0.5; playSound('thud', 0.35, 6); } else { q.down = true; q.vy = 0; q.vx = 0; }
    }
  }
};

// ---- the bundle: painted once
const BW = 30, BH = 15;
let sprite: HTMLCanvasElement | null | undefined;
const bundle = () => {
  if (sprite !== undefined) return sprite;
  if (typeof document === 'undefined') return (sprite = null);
  const cv = document.createElement('canvas'); cv.width = BW; cv.height = BH;
  const g = cv.getContext('2d')!;
  const px = (x: number, y: number, w: number, h: number, col: string) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  // (three sticks, stacked two and one: inked, stepped red, lit along the top, the paper ends)
  for (const [sx, sy] of [[1, 1], [1, 6], [1, 10]] as const) {
    px(sx, sy, 26, 5, '#1A0606');
    px(sx + 1, sy + 1, 24, 3, '#B91C1C'); px(sx + 1, sy + 1, 24, 1, '#F87171'); px(sx + 1, sy + 3, 24, 1, '#7F1D1D');
    px(sx + 22, sy + 1, 3, 3, '#E8D8B0'); px(sx + 23, sy + 2, 1, 1, '#8A7A5A');
    px(sx + 1, sy + 1, 2, 3, '#E8D8B0');
  }
  // (the tape round them)
  for (const tx of [7, 17]) { px(tx, 0, 3, BH, '#1A0606'); px(tx, 1, 3, BH - 2, '#D6CFC0'); px(tx, 1, 1, BH - 2, '#FFFFFF'); px(tx + 2, 1, 1, BH - 2, '#8A8478'); }
  // (TNT stenciled, a hint)
  px(12, 7, 1, 3, '#1A0606'); px(11, 7, 3, 1, '#1A0606'); px(14, 7, 1, 3, '#1A0606');
  return (sprite = cv);
};

/** In the world, with its car (drawn after the car's insides or its top, under the cast): the bundles, the fuses
 *  fizzing. */
export const drawDynamite = (c: Ctx, state: GameState, car: number, carX: number) => {
  const tr = trainOf(state);
  if (!tr.dyn.length) return;
  const img = bundle(), f = state.frame;
  for (const q of tr.dyn) {
    if (q.car !== car || q.wait > 0) continue;
    const x = carX + q.lx, y = q.y - BH / 2 - 1;
    c.save();
    c.translate(Math.round(x), Math.round(y));
    c.rotate(q.rot);
    if (img) c.drawImage(img, -BW / 2, -BH / 2);
    // (the fuse: out of the bundle's end, burning down; its spark at the tip, spitting)
    const left = Math.max(0, 1 - q.t / BURN), len = 3 + 12 * left;
    const fx = -BW / 2 - 1, fy = -1;
    c.strokeStyle = '#3A2A1A'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(fx + 2, fy); c.quadraticCurveTo(fx - len * 0.5, fy - len * 0.6, fx - len * 0.7, fy - len); c.stroke();
    const tx = fx - len * 0.7, ty = fy - len;
    c.fillStyle = f % 4 < 2 ? '#FFFFFF' : '#FDE047'; c.fillRect(Math.round(tx - 1), Math.round(ty - 1), 3, 3);
    c.fillStyle = '#FB923C'; c.fillRect(Math.round(tx - 2), Math.round(ty), 1, 1); c.fillRect(Math.round(tx + 2), Math.round(ty - 1), 1, 1);
    c.restore();
    // (sparks off it, up and out: upright, whatever way the bundle's lying)
    const ca = Math.cos(q.rot), sa = Math.sin(q.rot), sx = x + tx * ca - ty * sa, sy = y + tx * sa + ty * ca;
    for (let k = 0; k < 4; k++) {
      const ph = ((f + k * 5 + q.seed) % 14) / 14, a = -Math.PI / 2 + Math.sin(k * 2.1 + q.seed) * 1.1;
      c.fillStyle = k % 2 ? '#FDE047' : '#FFF7C2';
      c.fillRect(Math.round(sx + Math.cos(a) * ph * 12), Math.round(sy + Math.sin(a) * ph * 12 + ph * ph * 6), ph < 0.5 ? 2 : 1, ph < 0.5 ? 2 : 1);
    }
    // (a wisp of fuse smoke)
    c.fillStyle = 'rgba(120, 113, 108, 0.45)';
    const w = ((f + q.seed * 3) % 30) / 30;
    c.fillRect(Math.round(sx - 2 + w * 4), Math.round(sy - 6 - w * 18), 3 + Math.round(w * 4), 3 + Math.round(w * 4));
  }
};
