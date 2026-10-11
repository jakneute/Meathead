// The remains of earlier park guests, the dungeon's set dressing (gory and funny: undignified, as every death here is).
// Real people in their theme-park clothes: lanyards, mouse-ear-style souvenir hats (generic: two black discs on a cap),
// fanny packs, souvenir cups, a selfie stick, a stroller, a park map, ticket stubs. Every skin tone and build, men and
// women, picked by seed. All painted once into the props' stamps; dimmed a touch so nothing reads as an enemy.

import { INK, box, mix, rampOf, hash } from '../../intro/art/kit';

type Ctx = CanvasRenderingContext2D;
/** The dark they're dimmed toward. */
const DUN = '#0C0908';
const dm = (c: string, k = 0.22) => mix(c, DUN, k);
export const GORE = ['#2A0404', '#4A0808', '#6E1010', '#8E1A1A'];

const SKINS = ['#F0C8A8', '#D8A27A', '#B87A50', '#8A5634', '#5E3820', '#3E2414'];
const HAIRS = ['#1A1210', '#4A2A14', '#8A5A2A', '#C8A040', '#B04A1E', '#9A9A9A'];
const SHIRTS = ['#2A7AC8', '#D83A6A', '#E8C030', '#2AA86A', '#E86A2A', '#8A4AC8', '#F0F0F0'];
const PANTS = ['#2A3A6A', '#C8B890', '#3A3A3A', '#6A8A3A', '#8A2A2A'];

export interface Guest { skin: string; hair: string; shirt: string; pants: string; woman: boolean; long: boolean }
export const guestOf = (seed: number): Guest => {
  const p = (arr: string[], k: number) => arr[Math.floor(hash(seed * 7.13 + k) * arr.length) % arr.length];
  const woman = hash(seed * 3.3) < 0.5;
  return { skin: dm(p(SKINS, 1)), hair: dm(p(HAIRS, 2)), shirt: dm(p(SHIRTS, 3)), pants: dm(p(PANTS, 4)), woman, long: woman && hash(seed * 5.1) < 0.7 };
};

/** A splat of blood (a pool, a smear), its middle at (x, y): a stepped blob, darker at its rim, spatter round it. */
export const splat = (g: Ctx, x: number, y: number, w: number, h: number, seed = 0) => {
  const rows = Math.max(2, Math.round(h / 2));
  for (let r = 0; r < rows; r++) {
    const v = (r + 0.5) / rows * 2 - 1, half = Math.round((w / 2) * Math.sqrt(1 - v * v) * (0.8 + 0.4 * hash(seed + r)));
    const off = Math.round((hash(seed * 1.7 + r) - 0.5) * 4);
    box(g, x - half + off, y - h / 2 + r * 2, half * 2, 2, GORE[1]);
    if (half > 3) box(g, x - half + off + 2, y - h / 2 + r * 2, half * 2 - 4, 2, GORE[2]);
  }
  box(g, x - w / 6, y - h / 4, Math.max(2, w / 6), 1, GORE[3]);
  for (let k = 0; k < 7; k++) { const a = hash(seed + k * 1.7) * Math.PI * 2, rr = w * 0.55 + hash(seed * 2 + k) * 10; box(g, Math.round(x + Math.cos(a) * rr), Math.round(y + Math.sin(a) * rr * Math.max(0.3, h / w)), 2, 2, GORE[k % 2 ? 1 : 2]); }
};
/** Blood running down from (x, y), `n` streaks. */
export const drips = (g: Ctx, x: number, y: number, w: number, n: number, len: number, seed = 0) => {
  for (let k = 0; k < n; k++) { const dx = Math.floor(hash(seed + k * 2.3) * w), h = 6 + Math.floor(hash(seed * 3 + k) * len); box(g, x + dx, y, 2, h, GORE[1 + (k % 2)]); box(g, x + dx, y + h, 2, 2, GORE[1]); }
};

// ---------------------------------------------------------------------------------------------------------------
// The souvenirs

/** The ears hat: a cap, two black discs (generic souvenir ears), at (x, y) its brim's middle. */
export const earHat = (g: Ctx, x: number, y: number, tilt = 0) => {
  box(g, x - 7, y - 4, 14, 5, INK); box(g, x - 6, y - 3, 12, 3, '#1A1A1E');
  for (const s of [-1, 1]) { const ex = x + s * 7 + tilt; box(g, ex - 4, y - 11, 8, 8, INK); box(g, ex - 3, y - 10, 6, 6, '#141418'); box(g, ex - 2, y - 9, 2, 2, '#3A3A44'); }
  box(g, x - 6, y, 12, 2, '#B91C1C');
};
export const lanyard = (g: Ctx, x: number, y: number, len = 10) => {
  box(g, x - 3, y, 1, len, '#2563EB'); box(g, x + 3, y, 1, len, '#2563EB');
  box(g, x - 4, y + len, 9, 7, INK); box(g, x - 3, y + len + 1, 7, 5, '#F1EFEA'); box(g, x - 2, y + len + 2, 5, 1, '#B91C1C');
};
export const fannyPack = (g: Ctx, x: number, y: number) => { box(g, x - 7, y - 1, 14, 7, INK); box(g, x - 6, y, 12, 5, dm('#DB2777')); box(g, x - 6, y, 12, 1, dm('#F9A8D4')); box(g, x - 1, y + 2, 2, 2, '#E8E8F0'); };
export const souvenirCup = (g: Ctx, x: number, y: number, tipped = false) => {
  if (tipped) { box(g, x - 7, y - 7, 14, 8, INK); box(g, x - 6, y - 6, 12, 6, dm('#DC2626')); box(g, x - 6, y - 6, 12, 1, dm('#FCA5A5')); box(g, x + 6, y - 5, 8, 1, '#E8E8F0'); box(g, x - 14, y - 1, 8, 1, '#7A4A1A'); return; }
  box(g, x - 5, y - 15, 10, 15, INK); box(g, x - 4, y - 14, 8, 13, dm('#DC2626')); box(g, x - 4, y - 10, 8, 3, '#F1EFEA'); box(g, x + 1, y - 21, 1, 7, '#E8E8F0');
};
export const selfieStick = (g: Ctx, x: number, y: number, len = 40) => {
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + len, y - len * 0.35); g.stroke();
  g.strokeStyle = '#A8A8B2'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + len, y - len * 0.35); g.stroke();
  box(g, x + len - 2, y - len * 0.35 - 8, 7, 12, INK); box(g, x + len - 1, y - len * 0.35 - 7, 5, 10, '#1A1A2A'); box(g, x + len, y - len * 0.35 - 6, 2, 3, '#4A6A9A');
};
export const parkMap = (g: Ctx, x: number, y: number) => {
  box(g, x - 9, y - 4, 18, 5, INK); box(g, x - 8, y - 3, 16, 3, dm('#F1EFEA'));
  box(g, x - 6, y - 3, 4, 3, dm('#2AA86A')); box(g, x, y - 3, 3, 2, dm('#2A7AC8')); box(g, x + 4, y - 2, 3, 2, dm('#E8C030'));
};
export const ticket = (g: Ctx, x: number, y: number) => { box(g, x - 6, y - 3, 12, 4, INK); box(g, x - 5, y - 2, 10, 2, dm('#F9A8D4')); box(g, x + 1, y - 2, 1, 2, INK); };
export const stroller = (g: Ctx, x: number, y: number) => {
  // (on its side, a wheel in the air)
  const P = rampOf(dm('#DB2777'));
  box(g, x - 1, y - 21, 32, 18, INK); box(g, x, y - 20, 30, 16, P[2]); box(g, x, y - 20, 30, 3, P[3]); box(g, x + 4, y - 15, 22, 8, P[0]);
  box(g, x + 28, y - 30, 2, 12, '#8A8A92'); box(g, x + 28, y - 31, 10, 2, '#8A8A92');
  for (const [wx, wy] of [[x + 2, y - 3], [x + 24, y - 3], [x + 12, y - 28]] as const) { box(g, wx - 4, wy - 4, 8, 8, INK); box(g, wx - 3, wy - 3, 6, 6, '#2A2A30'); box(g, wx - 1, wy - 1, 2, 2, '#8A8A92'); }
};
export const bucketOfBits = (g: Ctx, x: number, y: number) => {
  const W = rampOf(dm('#5A3A20'));
  box(g, x - 13, y - 26, 26, 26, INK); box(g, x - 12, y - 25, 24, 24, W[2]); box(g, x - 12, y - 25, 4, 24, W[3]);
  for (const by of [-21, -8]) box(g, x - 12, y + by, 24, 3, '#3A3A40');
  box(g, x - 10, y - 29, 20, 5, GORE[2]); box(g, x - 6, y - 34, 6, 6, '#E2DDD0'); box(g, x + 2, y - 33, 5, 5, GORE[3]); box(g, x - 9, y - 31, 4, 3, dm('#D8A27A'));
  drips(g, x - 12, y - 24, 24, 4, 10, x);
};
export const severedHand = (g: Ctx, x: number, y: number, skin: string) => {
  // (round a bar at x: the fingers curled round it, the stump bloody, a drip)
  box(g, x - 9, y - 1, 9, 10, INK); box(g, x - 8, y, 7, 8, skin);
  for (let k = 0; k < 4; k++) { box(g, x - 1, y + k * 2, 5, 2, INK); box(g, x, y + k * 2, 3, 1, skin); }
  box(g, x - 10, y + 2, 3, 6, GORE[2]); box(g, x - 10, y + 8, 2, 8, GORE[1]);
};

// ---------------------------------------------------------------------------------------------------------------
// The guests (each painted at its own spot; x, y as given)

/** A head (its top-left at x, y; looking left or right), hair to suit; dead eyes (crosses). */
const head = (g: Ctx, x: number, y: number, q: Guest, s = 1) => {
  box(g, x - 1, y - 1, 12, 12, INK); box(g, x, y, 10, 10, q.skin); box(g, x, y, 10, 3, q.hair);
  if (q.long) box(g, x + (s > 0 ? -2 : 9), y, 3, 12, q.hair);
  for (const ex of [x + 2, x + 6]) { box(g, ex, y + 4, 2, 2, INK); }
  box(g, x + 3, y + 8, 4, 1, INK);
};

/** A guest flat on their back (head at x, body going right), y the floor under them. */
export const lyingGuest = (g: Ctx, x: number, y: number, q: Guest, stretch = 1) => {
  const T = Math.round(22 * stretch), L = Math.round(26 * stretch);
  head(g, x, y - 11, q);
  box(g, x + 10, y - 12, T + 1, 12, INK); box(g, x + 11, y - 11, T - 1, 10, q.shirt); box(g, x + 11, y - 11, T - 1, 2, mix(q.shirt, '#FFFFFF', 0.25));
  if (q.woman) box(g, x + 14, y - 13, 6, 2, q.shirt);
  box(g, x + 10 + T, y - 10, L + 1, 10, INK); box(g, x + 11 + T, y - 9, L - 1, 4, q.pants); box(g, x + 11 + T, y - 5, L - 1, 4, mix(q.pants, INK, 0.25));
  box(g, x + 10 + T + L, y - 10, 5, 10, '#1A1418');
  // (an arm flopped out)
  box(g, x + 14, y - 1, 16, 4, INK); box(g, x + 15, y, 14, 2, q.skin);
};
/** A guest on the rack, stretched half again as long, roped at wrist and ankle. */
export const rackedGuest = (g: Ctx, x: number, y: number, q: Guest) => {
  lyingGuest(g, x + 14, y, q, 1.45);
  box(g, x, y - 8, 16, 3, q.skin); box(g, x - 1, y - 9, 4, 5, '#B8A47A');
  box(g, x + 14 + 10 + 32 + 38, y - 6, 6, 2, '#B8A47A');
  splat(g, x + 60, y + 4, 30, 4, x);
};
/** A guest pinned upright in the maiden, arms out, head lolled, spikes through. Its feet at (x, y). */
export const pinnedGuest = (g: Ctx, x: number, y: number, q: Guest) => {
  for (const s of [-1, 1]) { box(g, x + s * 6 - 3, y - 46, 7, 46, INK); box(g, x + s * 6 - 2, y - 45, 5, 44, q.pants); box(g, x + s * 6 - 3, y - 4, 7, 4, '#1A1418'); }
  box(g, x - 12, y - 86, 24, 42, INK); box(g, x - 11, y - 85, 22, 40, q.shirt); box(g, x - 11, y - 85, 22, 3, mix(q.shirt, '#FFFFFF', 0.25));
  for (const s of [-1, 1]) { box(g, x + s * 12 - (s < 0 ? 14 : 0), y - 84, 14, 7, INK); box(g, x + s * 12 - (s < 0 ? 13 : 0), y - 83, 12, 5, q.skin); }
  fannyPack(g, x, y - 48);
  g.save(); g.translate(x, y - 84); g.rotate(0.35); head(g, -5, -11, q); g.restore();
  lanyard(g, x, y - 85, 12);
  // (the spikes through: tips out of the chest and the legs, bloody)
  for (const [sx, sy] of [[-6, -70], [5, -60], [-1, -30]] as const) { box(g, x + sx - 1, y + sy - 1, 6, 4, INK); box(g, x + sx, y + sy, 4, 2, '#C8C8D0'); box(g, x + sx, y + sy + 2, 4, 6, GORE[2]); }
  drips(g, x - 10, y - 46, 20, 6, 30, x);
};
/** A guest who was under the ceiling when it came down: flat, spread out, an ears hat flattened too. Feet at y. */
export const flatGuest = (g: Ctx, x: number, y: number, q: Guest) => {
  splat(g, x + 30, y - 2, 110, 6, x);
  box(g, x - 1, y - 6, 72, 6, INK); box(g, x, y - 5, 12, 4, q.skin); box(g, x, y - 5, 12, 1, q.hair);
  box(g, x + 12, y - 5, 30, 4, q.shirt); box(g, x + 42, y - 5, 26, 4, q.pants); box(g, x + 68, y - 5, 4, 4, '#1A1418');
  box(g, x + 14, y - 1, 18, 1, q.skin); box(g, x + 18, y - 8, 14, 2, q.skin);
  box(g, x - 10, y - 4, 10, 4, INK); box(g, x - 9, y - 3, 8, 2, '#141418'); box(g, x - 8, y - 5, 3, 1, '#B91C1C');
  // (the ceiling's spike holes all round them)
  for (let k = 0; k < 9; k++) box(g, x - 40 + k * 24, y - 2, 3, 2, INK);
};
/** A guest across the spike bed, run through, sagged down the spikes. Their back on the bed at y. */
export const impaledGuest = (g: Ctx, x: number, y: number, q: Guest, spikes: number[]) => {
  lyingGuest(g, x, y, q);
  for (const sx of spikes) {
    g.fillStyle = INK; g.beginPath(); g.moveTo(x + sx - 4, y - 8); g.lineTo(x + sx + 4, y - 8); g.lineTo(x + sx, y - 26); g.closePath(); g.fill();
    g.fillStyle = '#B8B8C2'; g.beginPath(); g.moveTo(x + sx - 3, y - 9); g.lineTo(x + sx + 3, y - 9); g.lineTo(x + sx, y - 24); g.closePath(); g.fill();
    box(g, x + sx - 1, y - 20, 3, 8, GORE[2]); box(g, x + sx - 2, y - 10, 5, 3, GORE[3]);
  }
  drips(g, x + 8, y - 2, 50, 7, 18, x);
};
/** A skeleton, flat out (head at x), how long it's been here. */
export const skeleton = (g: Ctx, x: number, y: number, hat = false) => {
  const B = ['#7A766C', '#A8A498', '#CAC6B8'];
  box(g, x - 1, y - 13, 14, 13, INK); box(g, x, y - 12, 12, 11, B[2]); box(g, x + 2, y - 9, 3, 3, INK); box(g, x + 7, y - 9, 3, 3, INK); box(g, x + 3, y - 3, 6, 1, INK);
  box(g, x + 14, y - 6, 22, 2, B[1]); for (let r = 0; r < 5; r++) box(g, x + 16 + r * 4, y - 10, 2, 9, B[1]);
  box(g, x + 36, y - 7, 6, 5, B[1]); box(g, x + 42, y - 5, 20, 2, B[1]); box(g, x + 44, y - 2, 18, 2, B[0]);
  box(g, x + 18, y - 1, 16, 2, B[0]);
  if (hat) earHat(g, x + 6, y - 12, 2);
};
