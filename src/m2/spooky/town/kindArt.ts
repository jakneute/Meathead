// The town's enemies, drawn crude (the prototype pass: flat boxes, readable shapes; the real look comes in the final
// pass). Feet at the origin, facing right (the engine mirrors them). The staff are real people under cheap costumes:
// who's in there (skin, hair, build, man or woman) is by seed (lookOf), so it shows at the face hole and the hands.

import type { Enemy } from '../../../m1/types';
import { lookOf } from '../../adventure/temple/people';

type Ctx = CanvasRenderingContext2D;
const b = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
const INK = '#0B0710';

// ---------------------------------------------------------------------------------------------------------------
// Wildlife

export const drawBat = (c: Ctx, e: Enemy, f: number) => {
  const flap = Math.sin(f * 0.7 + (e.initialX ?? 0)) > 0;
  const swoop = e.aiState === 'swoop';
  b(c, -6, -14, 12, 10, '#1C1917');
  b(c, -5, -18, 3, 4, '#1C1917'); b(c, 2, -18, 3, 4, '#1C1917');
  b(c, -3, -11, 2, 2, '#EF4444'); b(c, 2, -11, 2, 2, '#EF4444');
  b(c, 0, -6, 1, 2, '#F5F5F4');
  for (const s of [-1, 1]) {
    if (swoop) b(c, s > 0 ? 6 : -14, -14, 8, 4, '#292524');
    else if (flap) { b(c, s > 0 ? 6 : -14, -20, 8, 6, '#292524'); b(c, s > 0 ? 12 : -16, -24, 4, 4, '#292524'); }
    else { b(c, s > 0 ? 6 : -14, -10, 8, 5, '#292524'); b(c, s > 0 ? 12 : -16, -6, 4, 4, '#292524'); }
  }
};

export const drawCrow = (c: Ctx, e: Enemy, f: number) => {
  const sat = e.aiState === 'idle' || e.aiState === 'caw' || !e.aiState;
  b(c, -10, -16, 18, 10, '#18181B');
  b(c, 4, -22, 9, 8, '#18181B');
  b(c, 13, -19, 6, 3, '#CA8A04');
  if (e.aiState === 'caw') b(c, 13, -16, 5, 2, '#CA8A04');
  b(c, 9, -20, 2, 2, '#FDE68A');
  b(c, -16, -14, 7, 4, '#27272A');
  if (sat) { b(c, -6, -18, 12, 5, '#27272A'); b(c, -3, -6, 2, 6, '#57534E'); b(c, 2, -6, 2, 6, '#57534E'); }
  else { const up = Math.sin(f * 0.6) > 0; b(c, -8, up ? -28 : -10, 14, up ? 12 : 6, '#27272A'); }
};

export const drawRat = (c: Ctx, e: Enemy, f: number) => {
  const run = Math.abs(e.vel.x) > 0.3 && Math.floor(f / 3) % 2;
  b(c, -12, -12, 22, 10, '#57534E');
  b(c, 8, -10, 8, 7, '#57534E');
  b(c, 15, -8, 3, 3, '#F9A8D4');
  b(c, 9, -13, 4, 4, '#78716C');
  b(c, 12, -9, 2, 2, '#EF4444');
  b(c, -26, -6, 14, 2, '#F9A8D4');
  b(c, -9, -2, 3, 2, '#44403C'); b(c, 4, -2, 3, 2, '#44403C');
  if (run) { b(c, -6, -2, 3, 2, '#44403C'); b(c, 7, -2, 3, 2, '#44403C'); }
};

export const drawCat = (c: Ctx, e: Enemy, f: number) => {
  const arch = e.aiState === 'hiss';
  const leap = e.aiState === 'pounce';
  const body = '#111114';
  if (arch) { b(c, -14, -22, 26, 10, body); b(c, -10, -26, 18, 6, body); }
  else b(c, -14, leap ? -20 : -16, 26, 10, body);
  // (mangy: bald patches)
  b(c, -8, arch ? -24 : -14, 4, 3, '#57534E'); b(c, 4, arch ? -20 : -12, 3, 2, '#78716C');
  b(c, 10, -24, 10, 10, body);
  b(c, 10, -28, 3, 4, body); b(c, 17, -28, 3, 4, body);
  b(c, 13, -21, 2, 2, '#FACC15'); b(c, 17, -21, 2, 2, '#FACC15');
  if (arch) b(c, 15, -17, 4, 2, '#F87171');
  // (the tail: straight up and bushed out hissing)
  if (arch) b(c, -18, -38, 4, 18, body); else b(c, -22, -20, 10, 3, body);
  const step = Math.floor(f / 5) % 2 && Math.abs(e.vel.x) > 0.3;
  for (const x of [-12, -6, 4, 9]) b(c, x + (step ? 1 : 0), leap ? -10 : -6, 3, leap ? 4 : 6, body);
};

// ---------------------------------------------------------------------------------------------------------------
// People in costumes

const person = (seed: number) => {
  const L = lookOf(seed);
  return { L, w: L.heavy ? 30 : L.woman ? 22 : 25 };
};
/** A face in a face hole: skin, eyes (angry), maybe the mouth open. */
const face = (c: Ctx, x: number, y: number, skin: string, open = false) => {
  b(c, x, y, 12, 12, skin);
  b(c, x + 4, y + 3, 2, 2, INK); b(c, x + 9, y + 3, 2, 2, INK);
  b(c, x + 3, y + 1, 4, 1, INK); b(c, x + 8, y + 1, 4, 1, INK);
  b(c, x + 5, y + 8, open ? 5 : 4, open ? 3 : 1, INK);
};

export const drawGhost = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const { L, w } = person(seed);
  const boo = e.aiState === 'boo' || e.aiState === 'lunge';
  const step = Math.abs(e.vel.x) > 0.3 ? Math.sin(f * 0.25) * 3 : 0;
  // (sneakers showing under the sheet)
  b(c, -9 + step, -5, 9, 5, L.shirt); b(c, 2 - step, -5, 9, 5, L.shirt);
  b(c, -8 + step, -10, 6, 6, L.pants); b(c, 3 - step, -10, 6, 6, L.pants);
  const sheet = ['#F5F5F4', '#E7E5E4', '#FAFAF9', '#E2E8F0'][seed % 4];
  const sw = w + 12;
  // (the sheet: arms up under it, BOO, it's wider)
  if (boo) b(c, -sw / 2 - 8, -50, sw + 16, 12, sheet);
  b(c, -sw / 2, -56, sw, 46, sheet);
  b(c, -sw / 2 + 4, -64, sw - 8, 10, sheet);
  b(c, -sw / 2, -12, 5, 4, sheet); b(c, sw / 2 - 9, -12, 5, 4, sheet);
  // (the eyeholes: somebody in there)
  b(c, 0, -52, 5, 5, L.skin); b(c, 8, -52, 5, 5, L.skin);
  b(c, 1, -51, 2, 2, INK); b(c, 9, -51, 2, 2, INK);
  if (boo) b(c, 4, -42, 6, 6, INK);
  // (a crooked line where the sheet's folded)
  b(c, -sw / 2 + 6, -34, 2, 22, '#D6D3D1');
};

export const drawWolfman = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const { L, w } = person(seed);
  const fur = ['#78350F', '#57534E', '#44403C', '#92400E'][seed % 4], lite = '#A16207';
  const run = e.aiState === 'rush';
  const howl = e.aiState === 'howl';
  const stride = run ? Math.sin(f * 0.6) * 8 : Math.abs(e.vel.x) > 0.3 ? Math.sin(f * 0.25) * 4 : 0;
  // Legs, fur, bare feet with rubber claws
  b(c, -9 + stride, -28, 8, 26, fur); b(c, 2 - stride, -28, 8, 26, fur);
  b(c, -10 + stride, -4, 11, 4, '#A8A29E'); b(c, 1 - stride, -4, 11, 4, '#A8A29E');
  // Body (hunched forward running)
  c.save(); if (run) { c.translate(0, -28); c.rotate(0.25); c.translate(0, 28); }
  b(c, -w / 2, -54, w, 28, fur);
  b(c, -w / 2 + 4, -48, w - 8, 14, lite);
  // (the zipper up the back of the rented suit)
  b(c, -w / 2, -54, 2, 26, '#D4D4D8');
  // Arms: out in front running, up howling
  if (howl) { b(c, w / 2 - 4, -70, 7, 20, fur); b(c, -w / 2 - 3, -70, 7, 20, fur); }
  else { b(c, w / 2 - 2, -50, 16, 7, fur); b(c, w / 2 + 12, -50, 5, 7, '#E7E5E4'); }
  // Head: the wolf mask, the face showing through its open mouth
  const hy = howl ? -78 : -72;
  b(c, -8, hy, 20, 18, fur);
  b(c, -8, hy - 6, 5, 7, fur); b(c, 5, hy - 6, 5, 7, fur);
  b(c, 10, hy + 4, 10, 7, fur); b(c, 18, hy + 4, 3, 3, INK);
  b(c, 12, hy + 11, 7, 2, '#F5F5F4');
  face(c, -3, hy + 6, L.skin, howl || run);
  if (L.woman || L.long) b(c, -12, hy + 8, 5, 16, L.hair);
  c.restore();
};

export const drawMonster = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const { L, w: w0 } = person(seed);
  const w = w0 + 10;
  const jacket = ['#1F2937', '#292524', '#3F3F46', '#1E1B4B'][seed % 4];
  const raise = e.aiState === 'raise', smash = e.aiState === 'smash';
  const step = Math.abs(e.vel.x) > 0.3 ? Math.sin(f * 0.15) * 4 : 0;
  // Platform boots (huge), trousers too short
  b(c, -14 + step, -14, 14, 14, '#09090B'); b(c, 2 - step, -14, 14, 14, '#09090B');
  b(c, -14 + step, -14, 14, 2, '#52525B'); b(c, 2 - step, -14, 14, 2, '#52525B');
  b(c, -12 + step, -38, 11, 24, '#44403C'); b(c, 3 - step, -38, 11, 24, '#44403C');
  b(c, -11 + step, -16, 9, 3, L.skin); b(c, 4 - step, -16, 9, 3, L.skin);
  // The jacket, a size too small
  b(c, -w / 2, -70, w, 34, jacket);
  b(c, -2, -70, 4, 34, '#111827');
  // Arms: down, up (both fists over the head), or down hard in front
  if (raise) { b(c, -6, -104, 9, 34, jacket); b(c, 6, -104, 9, 34, jacket); b(c, -4, -110, 18, 10, L.skin); }
  else if (smash) { b(c, w / 2 - 4, -64, 26, 10, jacket); b(c, w / 2 + 20, -66, 12, 14, L.skin); }
  else { b(c, w / 2 - 4, -68, 9, 30, jacket); b(c, w / 2 - 4, -40, 9, 9, L.skin); }
  // The head: face paint gray over whoever it is, stitches, a foam flat-top
  const hy = -88;
  b(c, -9, hy, 22, 20, L.skin);
  b(c, -9, hy, 22, 20, 'rgba(120,113,130,0.55)');
  b(c, -10, hy - 8, 24, 9, '#18181B');
  b(c, -6, hy + 3, 12, 1, INK);
  for (let i = 0; i < 3; i++) b(c, -4 + i * 4, hy + 2, 1, 3, INK);
  b(c, 3, hy + 7, 3, 3, INK); b(c, 9, hy + 7, 3, 3, INK);
  b(c, 3, hy + 14, 8, smash ? 3 : 1, INK);
};

export const drawWitch = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const { L } = person(seed);
  const robe = ['#1F1235', '#18181B', '#14532D', '#3B0764'][seed % 4];
  const cackle = e.aiState === 'cackle';
  // The broom (under her, sideways), its bristles behind
  b(c, -28, -14, 56, 3, '#78350F');
  b(c, -40, -18, 14, 10, '#CA8A04');
  // Sat on it: legs down one side (striped tights, pointed boots)
  b(c, 2, -14, 6, 12, '#F5F5F4'); b(c, 2, -10, 6, 3, '#7F1D1D'); b(c, 2, -5, 6, 3, '#7F1D1D');
  b(c, 2, -2, 12, 4, '#09090B');
  // Robe, arms (one up throwing)
  b(c, -12, -40, 24, 28, robe);
  if (cackle) { b(c, 8, -52, 6, 16, robe); b(c, 8, -58, 6, 6, L.skin); }
  else { b(c, 8, -34, 14, 5, robe); b(c, 20, -34, 5, 5, L.skin); }
  // Head: the face (a green-paint nose and a rubber wart), the hair out under the hat, the hat
  const hy = -54;
  b(c, -10, hy, 6, 22, L.hair);
  b(c, -5, hy, 14, 13, L.skin);
  b(c, 6, hy + 5, 5, 3, '#65A30D'); b(c, 10, hy + 7, 2, 2, '#3F6212');
  b(c, 2, hy + 3, 2, 2, INK);
  b(c, 1, hy + 10, cackle ? 6 : 4, cackle ? 3 : 1, INK);
  b(c, -14, hy - 2, 28, 3, '#09090B');
  b(c, -8, hy - 10, 16, 8, '#09090B'); b(c, -5, hy - 18, 10, 8, '#09090B'); b(c, -2, hy - 24, 6, 6, '#09090B');
  b(c, -8, hy - 4, 16, 2, '#A855F7');
  void f;
};

export const drawSkeleton = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const { L, w } = person(seed);
  const up = e.isShieldActive !== false && e.aiState !== 'throw';
  const step = Math.abs(e.vel.x) > 0.2 ? Math.sin(f * 0.2) * 3 : 0;
  const suit = '#0C0A09', bone = '#E7E5E4';
  // Legs, bone print down them
  b(c, -9 + step, -30, 8, 28, suit); b(c, 2 - step, -30, 8, 28, suit);
  b(c, -7 + step, -28, 4, 24, bone); b(c, 4 - step, -28, 4, 24, bone);
  b(c, -10 + step, -4, 10, 4, '#27272A'); b(c, 1 - step, -4, 10, 4, '#27272A');
  // Body: ribs printed on
  b(c, -w / 2, -58, w, 30, suit);
  for (let i = 0; i < 4; i++) b(c, -w / 2 + 4, -54 + i * 6, w - 8, 2, bone);
  b(c, -1, -58, 2, 28, bone);
  // Head: face painted white, black sockets, the hood of the suit round it
  const hy = -72;
  b(c, -9, hy - 2, 20, 18, suit);
  b(c, -5, hy + 1, 13, 13, L.skin);
  b(c, -5, hy + 1, 13, 13, 'rgba(250,250,249,0.8)');
  b(c, -2, hy + 4, 4, 4, INK); b(c, 4, hy + 4, 4, 4, INK);
  b(c, 0, hy + 11, 7, 1, INK);
  for (let i = 0; i < 4; i++) b(c, 0 + i * 2, hy + 10, 1, 3, INK);
  // The foam tombstone: up in front of him, or down at his side (throwing)
  if (up) {
    b(c, w / 2 - 2, -66, 22, 52, '#71717A');
    b(c, w / 2, -70, 18, 6, '#71717A');
    b(c, w / 2 - 2, -66, 22, 3, '#A1A1AA');
    c.font = '6px "Press Start 2P"'; c.textAlign = 'center'; c.fillStyle = '#27272A'; c.fillText('RIP', w / 2 + 9, -48); c.textAlign = 'left';
  } else {
    b(c, -w / 2 - 20, -40, 16, 38, '#71717A');
    b(c, w / 2 - 4, -66, 7, 18, suit); b(c, w / 2 - 4, -72, 7, 6, L.skin);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// What they throw (at the origin, turned by the caller)

export const drawPotion = (c: Ctx) => {
  b(c, -5, -4, 10, 10, '#65A30D');
  b(c, -2, -9, 4, 5, '#A3E635');
  b(c, -2, -11, 4, 2, '#78350F');
  b(c, -3, -2, 3, 3, '#D9F99D');
};
export const drawBone = (c: Ctx) => {
  b(c, -9, -2, 18, 4, '#F5F5F4');
  b(c, -12, -4, 4, 4, '#F5F5F4'); b(c, -12, 0, 4, 4, '#F5F5F4');
  b(c, 8, -4, 4, 4, '#F5F5F4'); b(c, 8, 0, 4, 4, '#F5F5F4');
};
