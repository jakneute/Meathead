// The town's enemies, drawn crude but readable (the game-feel pass: flat colors, inked outlines, a clear silhouette
// and a clear tell for each; the real look comes in the final pass). Feet at the origin, facing right (the engine
// mirrors them). The staff are real people under cheap costumes: who's in there (skin, hair, build, man or woman) is
// by seed (lookOf), and it shows at the face hole and the hands.

import type { Enemy } from '../../../m1/types';
import { lookOf } from '../../adventure/temple/people';
import { INK, fb, ob, poly, oval, bar, words } from './crude';

type Ctx = CanvasRenderingContext2D;

// ---------------------------------------------------------------------------------------------------------------
// Wildlife

export const drawBat = (c: Ctx, e: Enemy, f: number) => {
  const swoop = e.aiState === 'swoop';
  const up = !swoop && Math.sin(f * 0.7 + (e.initialX ?? 0)) > 0;
  const wy = swoop ? -12 : up ? -24 : -4;
  // (wings: scalloped, out either side)
  for (const s of [-1, 1]) poly(c, [s * 5, -12, s * 22, wy, s * 30, wy + 4, s * 24, wy + 6, s * 18, wy + 10, s * 12, -6], '#292524', 1.5);
  oval(c, 0, -10, 7, 8, '#1C1917', 1.5);
  poly(c, [-5, -15, -3, -22, -1, -16], '#1C1917', 1); poly(c, [5, -15, 3, -22, 1, -16], '#1C1917', 1);
  fb(c, -4, -12, 2, 2, '#EF4444'); fb(c, 2, -12, 2, 2, '#EF4444');
  fb(c, -2, -6, 1, 3, '#F5F5F4'); fb(c, 1, -6, 1, 3, '#F5F5F4');
};

export const drawCrow = (c: Ctx, e: Enemy, f: number) => {
  const sat = e.aiState === 'idle' || e.aiState === 'caw' || !e.aiState;
  const caw = e.aiState === 'caw';
  // (tail, body, head, the beak: open cawing)
  poly(c, [-10, -14, -22, -18, -22, -10, -10, -8], '#27272A', 1.5);
  oval(c, -1, -12, 12, 7, '#18181B', 1.5);
  oval(c, 9, -19, 6, 6, '#18181B', 1.5);
  poly(c, [13, -21, 22, -19, 13, -17], '#CA8A04', 1);
  if (caw) poly(c, [13, -17, 21, -13, 13, -15], '#CA8A04', 1);
  fb(c, 10, -21, 2, 2, '#FDE68A');
  if (sat) { poly(c, [-8, -16, 6, -16, 2, -9, -6, -9], '#3F3F46', 1); bar(c, -3, -5, -3, 0, 2, '#A16207', false); bar(c, 3, -5, 3, 0, 2, '#A16207', false); }
  else { const up = Math.sin(f * 0.6) > 0; poly(c, [-6, -14, 6, -14, up ? -2 : 4, up ? -34 : 2], '#3F3F46', 1.5); }
};

export const drawRat = (c: Ctx, e: Enemy, f: number) => {
  const run = Math.abs(e.vel.x) > 0.3 && Math.floor(f / 3) % 2;
  bar(c, -14, -6, -30, -4 + Math.sin(f * 0.3) * 2, 2, '#F9A8D4', false);
  oval(c, -1, -7, 13, 6, '#6B6560', 1.5);
  poly(c, [9, -11, 20, -6, 9, -3], '#6B6560', 1.5);
  fb(c, 19, -7, 3, 3, '#F9A8D4');
  oval(c, 8, -12, 3, 3, '#A8A29E', 1);
  fb(c, 12, -9, 2, 2, '#EF4444');
  fb(c, -8 + (run ? 2 : 0), -2, 3, 2, '#F9A8D4'); fb(c, 4 - (run ? 2 : 0), -2, 3, 2, '#F9A8D4');
};

export const drawCat = (c: Ctx, e: Enemy, f: number) => {
  const arch = e.aiState === 'hiss', leap = e.aiState === 'pounce';
  const body = '#111114';
  const step = Math.floor(f / 5) % 2 && Math.abs(e.vel.x) > 0.3 ? 2 : 0;
  // (legs, the body arched hissing, the tail straight up and bushed out)
  for (const lx of [-12, -5, 6, 12]) bar(c, lx + (lx < 0 ? step : -step), leap ? -12 : arch ? -14 : -9, lx + (leap ? (lx < 0 ? -6 : 6) : 0), 0, 3, body, false);
  if (arch) poly(c, [-15, -14, -8, -28, 6, -28, 13, -14], body, 1.5);
  else oval(c, -1, leap ? -16 : -13, 15, 6, body, 1.5);
  // (mangy: bald patches)
  fb(c, -6, arch ? -24 : -15, 4, 3, '#57534E'); fb(c, 4, arch ? -21 : -12, 3, 2, '#78716C');
  if (arch) bar(c, -14, -16, -18, -40, 5, body); else bar(c, -15, -13, -26, -22, 3, body);
  oval(c, 14, arch ? -22 : -19, 7, 6, body, 1.5);
  poly(c, [9, -24, 10, -31, 14, -26], body, 1); poly(c, [15, -26, 19, -31, 20, -23], body, 1);
  fb(c, 13, arch ? -24 : -21, 2, 2, '#FACC15'); fb(c, 17, arch ? -24 : -21, 2, 2, '#FACC15');
  if (arch) poly(c, [16, -19, 21, -18, 16, -16], '#F87171', 0);
};

// ---------------------------------------------------------------------------------------------------------------
// People in costumes

const person = (seed: number) => {
  const L = lookOf(seed);
  return { L, w: L.heavy ? 30 : L.woman ? 22 : 25 };
};
/** A face in a face hole: skin, eyes (angry), the mouth (open when they yell). */
const face = (c: Ctx, x: number, y: number, skin: string, open = false, w = 12, h = 12) => {
  fb(c, x, y, w, h, skin);
  fb(c, x + w * 0.3, y + 3, 2, 2, INK); fb(c, x + w * 0.72, y + 3, 2, 2, INK);
  fb(c, x + w * 0.22, y + 1, 4, 1, INK); fb(c, x + w * 0.65, y + 1, 4, 1, INK);
  fb(c, x + w * 0.4, y + h - 4, open ? 5 : 4, open ? 3 : 1, INK);
};
/** Two legs from the hips: in trousers (or tights), the shoes on the end. */
const legs = (c: Ctx, hip: number, stride: number, col: string, shoe: string, gap = 5, w = 8) => {
  bar(c, -gap + stride, hip, -gap + stride * 1.4, -4, w, col);
  bar(c, gap - stride, hip, gap - stride * 1.4, -4, w, col);
  ob(c, -gap + stride * 1.4 - 4, -5, 11, 5, shoe, 1.5);
  ob(c, gap - stride * 1.4 - 4, -5, 11, 5, shoe, 1.5);
};

export const drawGhost = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const { L, w } = person(seed);
  const boo = e.aiState === 'boo' || e.aiState === 'lunge';
  const step = Math.abs(e.vel.x) > 0.3 ? Math.sin(f * 0.25) * 3 : 0;
  // (sneakers and ankles showing under the sheet: somebody's in there)
  ob(c, -10 + step, -5, 10, 5, L.shirt, 1.5); ob(c, 2 - step, -5, 10, 5, L.shirt, 1.5);
  fb(c, -8 + step, -12, 5, 7, L.pants); fb(c, 4 - step, -12, 5, 7, L.pants);
  const sheet = ['#F5F5F4', '#E7E5E4', '#FAFAF9', '#E2E8F0'][seed % 4];
  const sw = w + 14, arms = boo ? 12 : 0;
  // (the sheet: a round head, arms up under it for BOO, a wavy hem)
  const hem: number[] = [];
  for (let i = 0; i <= 6; i++) hem.push(sw / 2 - (i * sw) / 6, -10 + (i % 2 ? -5 : 0) + Math.sin(f * 0.2 + i) * 1.5);
  poly(c, [-sw / 2 - arms, -44, -10, -60, -6, -68, 8, -68, 12, -60, sw / 2 + arms, -44, sw / 2, -10, ...hem, -sw / 2, -10], sheet);
  // (the eyeholes, and the eyes in them; the hole torn for the mouth, BOO)
  oval(c, 0, -56, 3.5, 4, L.skin, 1); oval(c, 8, -56, 3.5, 4, L.skin, 1);
  fb(c, 0, -57, 2, 2, INK); fb(c, 8, -57, 2, 2, INK);
  if (boo) oval(c, 4, -45, 4, 5, INK, 0);
  bar(c, -sw / 2 + 8, -36, -sw / 2 + 6, -14, 1, '#D6D3D1', false);
};

export const drawWolfman = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const { L, w } = person(seed);
  const fur = ['#78350F', '#57534E', '#44403C', '#92400E'][seed % 4], belly = '#A16207';
  const run = e.aiState === 'rush', howl = e.aiState === 'howl';
  const stride = run ? Math.sin(f * 0.6) * 8 : Math.abs(e.vel.x) > 0.3 ? Math.sin(f * 0.25) * 4 : 0;
  legs(c, -30, stride, fur, '#A8A29E');
  c.save(); if (run) { c.translate(0, -30); c.rotate(0.28); c.translate(0, 30); }
  // (the body, the shaggy edge of the suit, the zipper up its back)
  poly(c, [-w / 2, -30, -w / 2 - 2, -56, w / 2 + 2, -56, w / 2, -30, w / 4, -26, 0, -30, -w / 4, -26], fur);
  oval(c, 2, -42, w / 2 - 4, 9, belly, 0);
  fb(c, -w / 2, -54, 2, 24, '#D4D4D8');
  // (arms: claws out in front running, up howling)
  if (howl) { bar(c, w / 2 - 3, -52, w / 2 + 4, -76, 8, fur); bar(c, -w / 2 + 3, -52, -w / 2 - 4, -76, 8, fur); }
  else { bar(c, w / 2 - 3, -52, w / 2 + 16, -46, 8, fur); for (let i = 0; i < 3; i++) poly(c, [w / 2 + 18, -50 + i * 3, w / 2 + 26, -49 + i * 3, w / 2 + 18, -47 + i * 3], '#E7E5E4', 0); }
  // (the wolf mask: ears, a long snout, teeth; the face showing through its open jaws)
  const hy = howl ? -84 : -76;
  c.save(); if (howl) { c.translate(4, hy + 10); c.rotate(-0.5); c.translate(-4, -(hy + 10)); }
  poly(c, [-10, hy, -6, hy - 12, -1, hy - 2, 4, hy - 12, 8, hy, 12, hy + 4, 26, hy + 8, 26, hy + 14, 12, hy + 16, 12, hy + 22, -10, hy + 22], fur);
  fb(c, 24, hy + 7, 3, 3, INK);
  for (let i = 0; i < 3; i++) poly(c, [14 + i * 4, hy + 14, 16 + i * 4, hy + 18, 18 + i * 4, hy + 14], '#F5F5F4', 0);
  face(c, -4, hy + 8, L.skin, howl || run, 13, 12);
  if (L.woman || L.long) fb(c, -12, hy + 10, 4, 16, L.hair);
  c.restore();
  c.restore();
};

export const drawMonster = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const { L, w: w0 } = person(seed);
  const w = w0 + 12;
  const jacket = ['#1F2937', '#292524', '#3F3F46', '#1E1B4B'][seed % 4];
  const raise = e.aiState === 'raise', smash = e.aiState === 'smash';
  const step = Math.abs(e.vel.x) > 0.3 ? Math.sin(f * 0.15) * 4 : 0;
  // (platform boots, huge; trousers too short, the shins showing)
  ob(c, -16 + step, -16, 16, 16, '#09090B'); ob(c, 2 - step, -16, 16, 16, '#09090B');
  fb(c, -16 + step, -16, 16, 3, '#52525B'); fb(c, 2 - step, -16, 16, 3, '#52525B');
  fb(c, -13 + step, -21, 10, 5, L.skin); fb(c, 4 - step, -21, 10, 5, L.skin);
  ob(c, -14 + step, -44, 12, 23, '#44403C'); ob(c, 3 - step, -44, 12, 23, '#44403C');
  // (the jacket, a size too small, square-shouldered)
  ob(c, -w / 2, -76, w, 34, jacket);
  fb(c, -2, -76, 4, 34, '#111827');
  fb(c, -w / 2 + 4, -60, 8, 2, '#A8A29E'); fb(c, -w / 2 + 6, -63, 2, 8, '#A8A29E');
  // (the arms: big fists down, both up over his head (the tell), or brought down in front)
  if (raise) { bar(c, -6, -72, -2, -112, 10, jacket); bar(c, 10, -72, 6, -112, 10, jacket); ob(c, -8, -124, 22, 14, L.skin); }
  else if (smash) { bar(c, w / 2 - 4, -70, w / 2 + 22, -40, 10, jacket); ob(c, w / 2 + 16, -44, 16, 16, L.skin); }
  else { bar(c, w / 2 - 2, -72, w / 2 + 2, -44, 10, jacket); ob(c, w / 2 - 6, -46, 14, 14, L.skin); }
  // (the head: grey face paint over whoever it is, stitches, a foam flat-top)
  const hy = -98;
  ob(c, -10, hy, 24, 22, L.skin);
  fb(c, -10, hy, 24, 22, 'rgba(120,113,130,0.55)');
  ob(c, -12, hy - 10, 28, 10, '#18181B');
  bar(c, -6, hy + 4, 6, hy + 4, 1, INK, false);
  for (let i = 0; i < 3; i++) fb(c, -4 + i * 4, hy + 2, 1, 5, INK);
  fb(c, 3, hy + 9, 3, 3, INK); fb(c, 9, hy + 9, 3, 3, INK);
  fb(c, 3, hy + 16, 9, smash ? 3 : 1, INK);
};

export const drawWitch = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const { L } = person(seed);
  const robe = ['#1F1235', '#18181B', '#14532D', '#3B0764'][seed % 4];
  const cackle = e.aiState === 'cackle';
  // (the broom under her: the handle, the bristles behind, tied)
  bar(c, -30, -12, 32, -14, 4, '#78350F');
  poly(c, [-28, -16, -48, -24, -50, -2, -28, -8], '#CA8A04');
  fb(c, -30, -16, 4, 10, '#7F1D1D');
  // (sat side-saddle: striped tights, pointed boots)
  bar(c, 4, -16, 8, -2, 6, '#F5F5F4');
  fb(c, 3, -12, 8, 2, '#7F1D1D'); fb(c, 4, -7, 8, 2, '#7F1D1D');
  poly(c, [4, -4, 18, -4, 22, -8, 12, -1, 4, 0], '#09090B', 1);
  // (the robe, ragged at the hem; an arm up with the potion, or out holding on)
  poly(c, [-12, -44, 12, -44, 16, -14, 8, -18, 2, -12, -6, -18, -14, -14], robe);
  if (cackle) { bar(c, 8, -40, 12, -60, 6, robe); oval(c, 13, -64, 4, 4, L.skin, 1); oval(c, 14, -72, 5, 6, '#65A30D', 1.5); }
  else { bar(c, 8, -38, 24, -18, 6, robe); oval(c, 25, -16, 4, 4, L.skin, 1); }
  // (the face: a green-paint nose, a rubber wart; the hair out under a tall bent hat)
  const hy = -58;
  fb(c, -11, hy, 6, 24, L.hair);
  ob(c, -6, hy, 15, 14, L.skin, 1.5);
  poly(c, [8, hy + 5, 14, hy + 9, 8, hy + 10], '#65A30D', 1); fb(c, 12, hy + 9, 2, 2, '#3F6212');
  fb(c, 2, hy + 4, 2, 2, INK);
  fb(c, 1, hy + 11, cackle ? 6 : 4, cackle ? 3 : 1, INK);
  ob(c, -16, hy - 2, 32, 3, '#09090B', 1);
  poly(c, [-9, hy - 2, 9, hy - 2, 4, hy - 18, -6, hy - 30 + Math.sin(f * 0.1) * 2, -2, hy - 16], '#09090B', 1.5);
  fb(c, -8, hy - 5, 16, 2, '#A855F7');
};

export const drawSkeleton = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const { L, w } = person(seed);
  const up = e.isShieldActive !== false && e.aiState !== 'throw';
  const step = Math.abs(e.vel.x) > 0.2 ? Math.sin(f * 0.2) * 3 : 0;
  const suit = '#0C0A09', bone = '#E7E5E4';
  // (legs in the black suit, bones printed down them)
  legs(c, -32, step, suit, '#27272A');
  fb(c, -6 + step, -28, 3, 22, bone); fb(c, 4 - step, -28, 3, 22, bone);
  // (the body: ribs printed on)
  ob(c, -w / 2, -62, w, 32, suit);
  for (let i = 0; i < 4; i++) fb(c, -w / 2 + 4, -57 + i * 6, w - 8, 2, bone);
  fb(c, -1, -62, 2, 32, bone);
  oval(c, 0, -32, 8, 3, bone, 0);
  // (the hood, the face painted white, the black sockets)
  const hy = -78;
  ob(c, -10, hy - 2, 21, 18, suit);
  fb(c, -6, hy + 1, 14, 13, L.skin);
  fb(c, -6, hy + 1, 14, 13, 'rgba(250,250,249,0.82)');
  fb(c, -3, hy + 4, 4, 4, INK); fb(c, 4, hy + 4, 4, 4, INK);
  fb(c, -1, hy + 11, 8, 1, INK);
  for (let i = 0; i < 4; i++) fb(c, -1 + i * 2, hy + 10, 1, 3, INK);
  // (the foam tombstone: up in front of him (shots off it), or down at his side, the bone up to throw)
  if (up) {
    poly(c, [w / 2 - 2, -8, w / 2 - 2, -60, w / 2 + 2, -70, w / 2 + 16, -74, w / 2 + 30, -70, w / 2 + 34, -60, w / 2 + 34, -8], '#8A8A93');
    fb(c, w / 2 + 2, -66, 28, 3, '#B4B4BC');
    words(c, 'RIP', w / 2 + 16, -44, '#27272A', 7);
    bar(c, w / 2 + 6, -30, w / 2 + 26, -30, 1, '#6B6B73', false);
  } else {
    poly(c, [-w / 2 - 22, -4, -w / 2 - 22, -40, -w / 2 - 14, -46, -w / 2 - 6, -40, -w / 2 - 6, -4], '#8A8A93');
    bar(c, w / 2 - 4, -58, w / 2 + 2, -80, 6, suit);
    bar(c, w / 2 - 6, -84, w / 2 + 10, -84, 4, bone);
  }
};

export const drawPumpkinHead = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const { L, w } = person(seed);
  const heave = e.aiState === 'heave';
  const shirt = ['#7C2D12', '#166534', '#1E3A8A', '#57534E'][seed % 4];
  // (overalls, plaid shirt, work boots: a scarecrow's outfit)
  legs(c, -32, 0, '#1E40AF', '#3F2A1A');
  ob(c, -w / 2, -64, w, 34, shirt);
  for (let i = 0; i < 3; i++) fb(c, -w / 2, -58 + i * 10, w, 2, 'rgba(0,0,0,0.3)');
  ob(c, -w / 2 + 3, -46, w - 6, 16, '#1E40AF', 1.5);
  fb(c, -w / 2 + 5, -64, 3, 18, '#1E40AF'); fb(c, w / 2 - 8, -64, 3, 18, '#1E40AF');
  // (the arms: holding a pumpkin up over the head (the tell), or down)
  if (heave) { bar(c, -w / 2 + 2, -60, -6, -104, 7, shirt); bar(c, w / 2 - 2, -60, 10, -104, 7, shirt); oval(c, 2, -114, 14, 11, '#EA580C'); fb(c, 0, -127, 4, 4, '#166534'); }
  else { bar(c, w / 2 - 2, -60, w / 2 + 6, -34, 7, shirt); oval(c, w / 2 + 7, -32, 4, 4, L.skin, 1); bar(c, -w / 2 + 2, -60, -w / 2 - 4, -34, 7, shirt); }
  // (the head: a huge foam jack-o'-lantern, the face looking out through its mouth)
  oval(c, 0, -78, 17, 15, '#F97316');
  bar(c, -6, -92, -6, -64, 1, '#C2410C', false); bar(c, 6, -92, 6, -64, 1, '#C2410C', false);
  fb(c, -2, -98, 4, 6, '#166534');
  poly(c, [-11, -84, -4, -84, -7, -90], INK, 0); poly(c, [4, -84, 11, -84, 8, -90], INK, 0);
  fb(c, -9, -76, 18, 8, INK);
  fb(c, -6, -75, 12, 6, L.skin); fb(c, -3, -74, 2, 2, INK); fb(c, 2, -74, 2, 2, INK);
  void f;
};

// ---------------------------------------------------------------------------------------------------------------
// What they throw (at the origin, turned by the caller)

export const drawPotion = (c: Ctx) => {
  oval(c, 0, 2, 6, 6, '#65A30D', 1.5);
  ob(c, -2, -8, 4, 5, '#A3E635', 1);
  fb(c, -2, -11, 4, 3, '#78350F');
  fb(c, -3, 0, 2, 2, '#D9F99D');
};
export const drawBone = (c: Ctx) => {
  bar(c, -9, 0, 9, 0, 4, '#F5F5F4');
  oval(c, -10, -2, 3, 3, '#F5F5F4', 1); oval(c, -10, 2, 3, 3, '#F5F5F4', 1);
  oval(c, 10, -2, 3, 3, '#F5F5F4', 1); oval(c, 10, 2, 3, 3, '#F5F5F4', 1);
};
