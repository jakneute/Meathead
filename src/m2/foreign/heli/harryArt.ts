// HELICOPTER HARRY, drawn in full (the land's boss: harry/rambo.ts draws him jacked with these same pieces, the same
// head). Late forties, a gray ponytail out the back of a white flight helmet with a peace sign on it, round amber
// granny glasses on a wire frame, a gray Van Dyke, stubble, crow's feet; a tie-dye shirt (a rainbow spiral) under an
// open olive flight jacket with a fleece collar, faded jeans, white tube socks and sandals. Nice: the big easy smile,
// the eyes crinkled up behind the lenses, brows up. Turned: red in the face, brows down hard, teeth bared, a vein, the
// forehead creased. On his back, once he's turned, the ride's emergency jetpack (two silver tanks, the flames under).
//
// The SNES grade (the land bosses': Steve's, Donnie's, Artie's): every material in its own five-step ramp (light, base,
// shade, deep, line) in stepped bands with a dithered seam between them, outlined in its own darkest tone, lit from the
// upper left. Feet at the origin, facing right (`facing` -1 mirrors him), about 84 px tall at scale 1.

type Ctx = CanvasRenderingContext2D;
const INK = '#1A0B06';

export type HarryPose = 'stand' | 'wave' | 'pilot' | 'shoved' | 'fall' | 'jet' | 'aim' | 'fire' | 'gloat' | 'run' | 'remote' | 'down';
/** burn: the jetpack's flames (a hop); remote: the ride's remote in his hand (keyed: its light on); aim: the launcher
 *  tipped up this far (radians); steam: steam blowing off his head (his rants; by default whenever he's yelling mad). */
export interface HarryLook { pose: HarryPose; f: number; facing?: 1 | -1; mad?: boolean; talking?: boolean; jetpack?: boolean; rot?: number; scale?: number; launcher?: boolean; burn?: boolean; remote?: boolean; keyed?: boolean; aim?: number; steam?: boolean; green?: number }

// ---------------------------------------------------------------------------------------------------------------
// Ramps (light, base, shade, deep, line) and the painting helpers (Steve's, Donnie's)

export type Ramp = readonly [string, string, string, string, string];
/** Weathered skin (fifty summers of festivals). */
export const SKIN_R: Ramp = ['#F6D2B0', '#E3AE86', '#C68A62', '#9A6444', '#4A2616'];
/** Red in the face (turned). */
export const MAD_R: Ramp = ['#F8C2A4', '#EC9A7A', '#CF7258', '#A04C3A', '#4E1C12'];
export const GRAY_R: Ramp = ['#F4F4F5', '#D4D4D8', '#A8A8B0', '#7A7A84', '#3A3A42'];
export const DENIM_R: Ramp = ['#A7BEDD', '#7393C2', '#52709F', '#38507A', '#17233C'];
export const BAND_R: Ramp = ['#F87171', '#DC2626', '#A51C1C', '#701414', '#360808'];
export const LEATHER_R: Ramp = ['#C99158', '#94602F', '#734620', '#4F2E13', '#24130A'];
export const SOCK_R: Ramp = ['#FFFFFF', '#F1F5F9', '#CBD5E1', '#94A3B8', '#475569'];
export const BRASS_R: Ramp = ['#FEF3A0', '#EAB308', '#B7791F', '#7C4A03', '#3A2002'];
export const STEEL_R: Ramp = ['#B8BEC8', '#5E6672', '#434A55', '#2A3038', '#0C1015'];
const JACKET_R: Ramp = ['#9AAA62', '#6F7F3C', '#56652C', '#3C481E', '#1A220C'];
const FLEECE_R: Ramp = ['#FBF3DE', '#E7D8B8', '#CDBB96', '#A8936E', '#5A4A30'];
const HELMET_R: Ramp = ['#FFFFFF', '#E9EEF3', '#C5CED8', '#909CAA', '#3E4652'];
const VISOR_R: Ramp = ['#7AA2E8', '#2E5BB8', '#1E3A8A', '#14275E', '#070F26'];

// (kept for the arena's pieces: harry/rambo.ts, harry/scene.ts)
export const SKIN = [SKIN_R[3], SKIN_R[2], SKIN_R[1], SKIN_R[0]];
export const DENIM = [DENIM_R[3], DENIM_R[2], DENIM_R[1], DENIM_R[0]];
export const GRAY = [GRAY_R[3], GRAY_R[2], GRAY_R[1], GRAY_R[0]];
export const TIEDYE = ['#DC2626', '#F97316', '#FACC15', '#22C55E', '#3B82F6', '#A855F7'];

/** Two hex colors mixed (k of the second). */
export const mixHex = (a: string, b: string, k: number) => {
  const p = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  const ch = (i: number) => Math.round(p(a, i) + (p(b, i) - p(a, i)) * k).toString(16).padStart(2, '0');
  return `#${ch(0)}${ch(1)}${ch(2)}`;
};
/** A ramp gone green (airsick: 0..1). */
export const sickR = (r: Ramp, g: number): Ramp => (g > 0 ? (r.map((c, i) => mixHex(c, ['#E4F5A8', '#A8CC62', '#86A848', '#5E7A32', '#26340E'][i], g * 0.55)) as unknown as Ramp) : r);

const dithers = new Map<string, CanvasPattern | string>();
/** A 2x2 checker of a color (the seam between two steps). */
export const dith = (c: Ctx, color: string): CanvasPattern | string => {
  let p = dithers.get(color);
  if (p) return p;
  if (typeof document === 'undefined') return color;
  const cv = document.createElement('canvas'); cv.width = 2; cv.height = 2;
  const g = cv.getContext('2d')!;
  g.fillStyle = color; g.fillRect(0, 0, 1, 1); g.fillRect(1, 1, 1, 1);
  p = c.createPattern(cv, 'repeat') ?? color;
  dithers.set(color, p);
  return p;
};
/** A shape in its ramp: the base, a lit band down its left, a shade then a deep band down its right (dithered seams
 *  between), outlined in the ramp's line. */
export const shapeR = (c: Ctx, path: () => void, r: Ramp, x0: number, x1: number, lw = 1) => {
  c.beginPath(); path(); c.fillStyle = r[1]; c.fill();
  c.save(); c.clip();
  const w = x1 - x0;
  c.fillStyle = r[0]; c.fillRect(x0 - 4, -999, w * 0.16 + 4, 1998);
  c.fillStyle = dith(c, r[0]); c.fillRect(x0 + w * 0.16, -999, Math.max(1, w * 0.07), 1998);
  c.fillStyle = dith(c, r[2]); c.fillRect(x0 + w * 0.56, -999, Math.max(1, w * 0.08), 1998);
  c.fillStyle = r[2]; c.fillRect(x0 + w * 0.64, -999, w + 4, 1998);
  c.fillStyle = dith(c, r[3]); c.fillRect(x0 + w * 0.8, -999, Math.max(1, w * 0.06), 1998);
  c.fillStyle = r[3]; c.fillRect(x0 + w * 0.86, -999, w + 4, 1998);
  c.restore();
  c.beginPath(); path(); c.strokeStyle = r[4]; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke();
};
export const pxR = (c: Ctx, x: number, y: number, w: number, h: number, col: string | CanvasPattern) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
export const lineR = (c: Ctx, pts: number[], w: number, col: string | CanvasPattern, cap: CanvasLineCap = 'round') => {
  c.strokeStyle = col; c.lineWidth = w; c.lineCap = cap; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.stroke();
};
export const ellR = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string | CanvasPattern, rot = 0) => {
  c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, Math.PI * 2); c.fill();
};
/** A run of tube (an arm, a leg): the outline, the base, a shade down the far side, a lit stripe up the near. */
export const tubeR = (c: Ctx, pts: number[], ws: number[], rs: Ramp[]) => {
  const n = pts.length / 2 - 1;
  for (let i = 0; i < n; i++) lineR(c, [pts[i * 2], pts[i * 2 + 1], pts[i * 2 + 2], pts[i * 2 + 3]], ws[i] + 2, rs[i][4]);
  for (let i = 0; i < n; i++) {
    const x1 = pts[i * 2], y1 = pts[i * 2 + 1], x2 = pts[i * 2 + 2], y2 = pts[i * 2 + 3], w = ws[i], r = rs[i];
    lineR(c, [x1, y1, x2, y2], w, r[1]);
    let nx = -(y2 - y1), ny = x2 - x1; const len = Math.hypot(nx, ny) || 1; nx /= len; ny /= len;
    if (nx + ny * 0.6 < 0) { nx = -nx; ny = -ny; }
    const sh = w * 0.28, hl = w * 0.3;
    lineR(c, [x1 + nx * sh, y1 + ny * sh, x2 + nx * sh, y2 + ny * sh], w * 0.38, r[2]);
    lineR(c, [x1 + nx * w * 0.42, y1 + ny * w * 0.42, x2 + nx * w * 0.42, y2 + ny * w * 0.42], Math.max(0.6, w * 0.12), dith(c, r[3]));
    lineR(c, [x1 - nx * hl, y1 - ny * hl, x2 - nx * hl, y2 - ny * hl], Math.max(0.6, w * 0.16), r[0]);
  }
};

// (the old flat helpers, kept for whoever still paints with them)
export const fill = (c: Ctx, col: string, path: () => void, line = 1.4) => {
  c.beginPath(); path(); c.fillStyle = col; c.fill(); c.strokeStyle = INK; c.lineWidth = line; c.lineJoin = 'round'; c.stroke();
};
export const rect = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
/** A limb: an inked tube from (x0, y0) to (x1, y1) (the base `col`, its lit edge `lit`), stepped. */
export const limb = (c: Ctx, x0: number, y0: number, x1: number, y1: number, w: number, col: string, lit: string) => {
  const r: Ramp = [lit, col, mixHex(col, '#000000', 0.22), mixHex(col, '#000000', 0.42), INK];
  tubeR(c, [x0, y0, x1, y1], [w], [r]);
};
/** A hand: a fist (knuckles in a row, the thumb over) or open (fingers spread). */
export const hand = (c: Ctx, x: number, y: number, fist = false, R: Ramp = SKIN_R) => {
  if (fist) {
    shapeR(c, () => c.roundRect(x - 4.4, y - 4, 8.8, 8, 2.6), R, x - 4.4, x + 4.4, 1);
    for (let k = 0; k < 3; k++) pxR(c, x - 3 + k * 2.6, y - 3.2, 1.6, 1, R[0]);
    lineR(c, [x - 3.2, y - 0.6, x + 3, y - 0.6], 0.7, R[3]);
    lineR(c, [x - 3.6, y + 1.6, x + 1.4, y + 2.4], 1.2, R[2]);
    return;
  }
  shapeR(c, () => c.ellipse(x, y, 3.6, 3.8, 0, 0, Math.PI * 2), R, x - 3.6, x + 3.6, 1);
  for (const [a, l] of [[-1.15, 5], [-0.7, 5.6], [-0.25, 5.4], [0.25, 4.6]] as const) {
    const ex = x + Math.cos(a) * (3 + l), ey = y + Math.sin(a) * (3 + l);
    lineR(c, [x + Math.cos(a) * 2.6, y + Math.sin(a) * 2.6, ex, ey], 2.6, R[4]);
    lineR(c, [x + Math.cos(a) * 2.6, y + Math.sin(a) * 2.6, ex, ey], 1.5, R[1]);
  }
  lineR(c, [x - 2, y + 1, x - 5, y + 3.4], 2.6, R[4]); lineR(c, [x - 2, y + 1, x - 5, y + 3.4], 1.5, R[1]);
  pxR(c, x - 2, y - 2.4, 2, 1.4, R[0]);
};

// ---------------------------------------------------------------------------------------------------------------
// The head (both Harrys': the hippie in his helmet, the Rambo in his bandana)

export type Mood = 'nice' | 'mad' | 'yell' | 'grin' | 'ouch' | 'queasy' | 'barf' | 'dead';
export interface HeadOpts {
  bandana?: boolean; green?: number; mood?: Mood;
  /** Dead: the bandana slipped down over his eyes. */
  slip?: boolean;
  /** Her concrete on him: the face gone gray. */
  gray?: number;
}

/** The face's outline: 3/4 to the right, a square jaw, the chin out front. */
const facePath = (c: Ctx, hx: number, hy: number, jaw: number) => {
  c.moveTo(hx - 9, hy - 5);
  c.quadraticCurveTo(hx - 10.4, hy + 5, hx - 6, hy + 9 + jaw * 0.4);
  c.lineTo(hx + 2, hy + 12.4 + jaw);
  c.quadraticCurveTo(hx + 8.4, hy + 12.6 + jaw, hx + 10, hy + 8.6 + jaw);
  c.lineTo(hx + 10.8, hy + 4);
  c.lineTo(hx + 11.4, hy + 0.6);
  c.lineTo(hx + 11, hy - 4.4);
  c.quadraticCurveTo(hx + 11.4, hy - 11.6, hx + 2, hy - 12.2);
  c.quadraticCurveTo(hx - 8.4, hy - 12, hx - 9, hy - 5);
  c.closePath();
};

export const head = (c: Ctx, f: number, mad: boolean, talking: boolean, hx: number, hy: number, o: HeadOpts = {}) => {
  const g = o.green ?? 0, gray = o.gray ?? 0;
  const tint = (r: Ramp) => { let q = sickR(r, g); if (gray > 0) q = q.map((cc, i) => mixHex(cc, ['#E2E0DC', '#B4B0AA', '#8C8780', '#66615A', '#2C2925'][i], Math.min(0.85, gray))) as unknown as Ramp; return q; };
  const mood: Mood = o.mood ?? (mad ? 'mad' : 'nice');
  const S = tint(mad && mood !== 'queasy' && mood !== 'barf' && mood !== 'dead' ? MAD_R : SKIN_R), G = GRAY_R;
  const open = talking && (f >> 2) % 2 === 0;
  // (how far the jaw's dropped: yelling, barfing, slack dead; talking)
  const jaw = mood === 'yell' || mood === 'barf' ? 2.6 : mood === 'dead' ? 1.8 : open ? 1.6 : 0;

  // The ponytail out the back, swinging: gray in strands, a hippie's hair tie with a bead
  const sw = Math.sin(f * 0.15) * 2;
  const tail = () => { c.moveTo(hx - 8, hy - 7); c.quadraticCurveTo(hx - 19, hy - 3 + sw, hx - 17.5, hy + 13 + sw); c.lineTo(hx - 13.5, hy + 14 + sw); c.quadraticCurveTo(hx - 12.6, hy + 1, hx - 5, hy - 2); c.closePath(); };
  shapeR(c, tail, G, hx - 19, hx - 5, 1);
  for (const k of [0, 1, 2]) lineR(c, [hx - 9 - k, hy - 4 + k, hx - 15 - k * 0.6, hy + 4 + sw * 0.6, hx - 15.6 + k * 0.6, hy + 12 + sw], 0.7, k === 1 ? G[0] : G[3]);
  pxR(c, hx - 16, hy + 2 + sw, 5, 2.4, BAND_R[4]); pxR(c, hx - 15.5, hy + 2.4 + sw, 4, 1.6, BAND_R[1]); pxR(c, hx - 15, hy + 2.4 + sw, 1.4, 0.8, BAND_R[0]);
  ellR(c, hx - 13.6, hy + 5.6 + sw, 1.2, 1.2, '#1D4ED8'); pxR(c, hx - 14, hy + 5 + sw, 0.8, 0.8, '#93C5FD');

  // The face
  c.beginPath(); facePath(c, hx, hy, jaw); c.fillStyle = S[1]; c.fill();
  c.save(); c.beginPath(); facePath(c, hx, hy, jaw); c.clip();
  // (the back of the head and the jaw behind the ear in shade, the seam dithered)
  pxR(c, hx - 11, hy - 13, 6, 30, S[2]); pxR(c, hx - 5, hy - 13, 1.6, 30, dith(c, S[2]));
  pxR(c, hx - 11, hy + 3, 4, 14, S[3]);
  // (the forehead and the cheekbone lit, the eye sockets in under the brow, the jaw's underside)
  pxR(c, hx - 2, hy - 12, 10, 4, S[0]); pxR(c, hx - 2, hy - 8, 10, 1.4, dith(c, S[0]));
  pxR(c, hx + 2, hy + 1, 6, 1.6, S[0]);
  pxR(c, hx + 1, hy - 4.4, 11, 1.4, dith(c, S[2]));
  pxR(c, hx - 6, hy + 9 + jaw, 18, 6, S[2]); pxR(c, hx - 6, hy + 8 + jaw, 18, 1.2, dith(c, S[2]));
  // (red in the cheeks, mad; pale and sweaty, sick)
  if (mad && mood !== 'queasy') pxR(c, hx + 2, hy + 2.6, 7, 2.4, dith(c, BAND_R[1]));
  // (stubble: gray, dithered over the jaw and the upper lip)
  pxR(c, hx - 4, hy + 4.6, 15, 9 + jaw, dith(c, G[3]));
  c.restore();
  c.beginPath(); facePath(c, hx, hy, jaw); c.strokeStyle = S[4]; c.lineWidth = 1; c.lineJoin = 'round'; c.stroke();

  // The ear (the far side's hidden), its inner fold
  shapeR(c, () => c.ellipse(hx - 5.4, hy + 1, 2.4, 3.4, 0, 0, Math.PI * 2), S, hx - 7.8, hx - 3, 0.9);
  lineR(c, [hx - 5, hy - 1, hx - 5.6, hy + 1, hx - 4.8, hy + 2.6], 0.8, S[3]);

  // The nose (a big one, broken once at Woodstock): its lit bridge, the shade under it, the nostril
  const nose = () => { c.moveTo(hx + 9.6, hy - 3.6); c.lineTo(hx + 13.2, hy + 1.8); c.quadraticCurveTo(hx + 12.6, hy + 3.4, hx + 10.4, hy + 3); c.closePath(); };
  c.beginPath(); nose(); c.fillStyle = S[1]; c.fill();
  pxR(c, hx + 10.6, hy - 1.6, 1, 2.6, S[0]); pxR(c, hx + 10.6, hy + 2, 2.6, 1, S[2]);
  c.beginPath(); nose(); c.strokeStyle = S[4]; c.lineWidth = 0.9; c.stroke();
  pxR(c, hx + 10.8, hy + 2.2, 1, 0.8, S[4]);

  // The eyes (through the lenses: dark pupils, crinkled when he smiles, squeezed shut when it hurts) and the brows
  const eyes: [number, number][] = [[hx + 4.6, hy - 2], [hx + 10, hy - 2]];
  const squeeze = mood === 'ouch' || mood === 'barf';
  for (const [i, [ex, ey]] of eyes.entries()) {
    const far = i === 1;
    if (mood === 'dead' && !o.slip) { lineR(c, [ex - 1.4, ey - 1.4, ex + 1.4, ey + 1.4], 0.9, INK); lineR(c, [ex + 1.4, ey - 1.4, ex - 1.4, ey + 1.4], 0.9, INK); continue; }
    if (squeeze) { lineR(c, [ex - 2, ey - 0.6, ex, ey + 0.4, ex + 2, ey - 0.6], 0.9, S[4]); continue; }
    if (mood === 'nice' || mood === 'grin') { lineR(c, [ex - 1.8, ey + 0.4, ex, ey - 0.9, ex + 1.8, ey + 0.4], 0.9, S[4]); continue; }
    // (the white, then the pupil: pinned small mad, rolling queasy)
    pxR(c, ex - 1.6, ey - 0.8, far ? 2.4 : 3.2, 1.8, '#FFF7ED');
    const roll = mood === 'queasy' ? Math.sin(f * 0.12 + i) * 0.8 : 0.4;
    pxR(c, ex - 0.4 + roll, ey - 0.6, 1.2, 1.4, INK);
    if (mood === 'queasy') pxR(c, ex - 1.6, ey - 0.9, far ? 2.4 : 3.2, 0.8, S[2]);
  }
  // (crow's feet, out past his near eye)
  lineR(c, [hx + 1, hy - 3, hx - 0.6, hy - 3.8], 0.6, S[3]); lineR(c, [hx + 1, hy - 1.6, hx - 0.6, hy - 1.2], 0.6, S[3]);
  // (the brows: thick, gray, by his mood)
  const brow = (x0: number, y0: number, x1: number, y1: number, cx: number, cy: number) => {
    c.strokeStyle = G[4]; c.lineWidth = 2.2; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(cx, cy, x1, y1); c.stroke();
    c.strokeStyle = G[1]; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, y0 - 0.4); c.quadraticCurveTo(cx, cy - 0.4, x1, y1 - 0.4); c.stroke();
  };
  const by = hy - 6.4;
  if (mood === 'mad' || mood === 'yell') { brow(hx + 1.6, by - 1.4, hx + 6.6, by + 1.4, hx + 4, by - 0.6); brow(hx + 8.4, by + 1.2, hx + 11.6, by - 1, hx + 10, by + 0.4); }
  else if (mood === 'grin') { brow(hx + 1.6, by, hx + 6.6, by + 0.6, hx + 4, by - 0.6); brow(hx + 8.4, by - 0.6, hx + 11.6, by - 2.6, hx + 10, by - 2.6); }
  else if (mood === 'ouch' || mood === 'queasy' || mood === 'barf') { brow(hx + 1.6, by + 0.6, hx + 6.6, by - 1.6, hx + 4.4, by - 0.6); brow(hx + 8.4, by - 1.6, hx + 11.6, by + 0.2, hx + 9.6, by - 1.4); }
  else if (mood !== 'dead') { brow(hx + 1.6, by - 0.2, hx + 6.6, by - 0.6, hx + 4, by - 2.4); brow(hx + 8.4, by - 0.6, hx + 11.6, by - 0.2, hx + 10, by - 2.2); }
  // (the creases across his forehead, and the vein, mad; a sweat drop, sick)
  if (mood === 'mad' || mood === 'yell') {
    lineR(c, [hx + 2, hy - 9.4, hx + 8, hy - 9.8], 0.6, S[3]);
    lineR(c, [hx - 3, hy - 11, hx - 1.4, hy - 8.6, hx - 3, hy - 6.6], 1, BAND_R[2]); pxR(c, hx - 2.6, hy - 9.4, 0.8, 0.8, BAND_R[0]);
  }
  if (mood === 'queasy' || g > 0.5) { const sd = (f % 60) / 60; ellR(c, hx - 1, hy - 4 + sd * 6, 0.9, 1.4, '#BAE6FD'); pxR(c, hx - 1.4, hy - 4.6 + sd * 6, 0.6, 0.6, '#FFFFFF'); }

  // The mouth, by his mood (its middle at hx+7, hy+6), then the Van Dyke over it
  const mx = hx + 7, my = hy + 6;
  const teeth = (x: number, y: number, w: number) => { pxR(c, x, y, w, 1.2, '#FAF6EC'); for (let k = x + 1.6; k < x + w - 0.5; k += 1.8) pxR(c, k, y, 0.4, 1.2, '#C9C2B4'); };
  if (mood === 'yell' || ((mood === 'mad') && open)) {
    // (wide, square, both rows of teeth, the tongue)
    shapeR(c, () => c.roundRect(mx - 4.4, my - 1.6, 8.8, 3.4 + jaw, 1.2), ['#7F1D1D', '#4A0A0A', '#300606', '#200404', '#120202'], mx - 4.4, mx + 4.4, 0.9);
    teeth(mx - 3.8, my - 1.4, 7.6); teeth(mx - 3.4, my + 0.8 + jaw, 6.8);
    pxR(c, mx - 2, my + jaw * 0.6, 4, 1.2, '#E06A6A');
  } else if (mood === 'mad' || mood === 'ouch') {
    // (teeth bared, clenched)
    shapeR(c, () => c.roundRect(mx - 4, my - 1.2, 8, 2.8, 1), ['#7F1D1D', '#4A0A0A', '#300606', '#200404', '#120202'], mx - 4, mx + 4, 0.9);
    teeth(mx - 3.6, my - 1, 7.2); teeth(mx - 3.4, my + 0.4, 6.8);
    if (mood === 'ouch') lineR(c, [mx - 5, my + 1, mx - 6, my + 2.6], 0.7, S[3]);
  } else if (mood === 'grin') {
    shapeR(c, () => { c.moveTo(mx - 4, my); c.quadraticCurveTo(mx, my + 2.6, mx + 4.6, my - 2); c.lineTo(mx + 3.6, my - 0.4); c.quadraticCurveTo(mx, my + 0.6, mx - 4, my); c.closePath(); }, ['#7F1D1D', '#4A0A0A', '#300606', '#200404', '#120202'], mx - 4, mx + 4.6, 0.8);
    teeth(mx - 2, my - 0.2, 5);
  } else if (mood === 'barf') {
    shapeR(c, () => c.ellipse(mx, my + jaw * 0.5, 3.8, 2.6 + jaw * 0.6, 0, 0, Math.PI * 2), ['#3F6212', '#1A2E05', '#132104', '#0C1603', '#050A01'], mx - 3.8, mx + 3.8, 0.9);
    pxR(c, mx - 2, my + jaw * 0.5 - 0.6, 4, 1.4, '#84CC16');
  } else if (mood === 'queasy') {
    // (cheeks blown out, a wobbly line, holding it in)
    if (g > 0.6) ellR(c, hx + 6, hy + 4.4, 3.4, 2.6, S[0]);
    lineR(c, [mx - 3.6, my, mx - 1.6, my - 0.8, mx, my + 0.4, mx + 1.8, my - 0.6, mx + 3.6, my + 0.2], 0.9, S[4]);
  } else if (mood === 'dead') {
    shapeR(c, () => c.roundRect(mx - 3.4, my - 1, 6.8, 2.6 + jaw, 1.4), ['#7F1D1D', '#4A0A0A', '#300606', '#200404', '#120202'], mx - 3.4, mx + 3.4, 0.9);
    // (the tongue lolling out the side)
    shapeR(c, () => c.roundRect(mx + 1.6, my + 0.4 + jaw, 3, 4.4, 1.4), ['#FCA5A5', '#E06A6A', '#C04848', '#902E2E', '#4A1010'], mx + 1.6, mx + 4.6, 0.8);
  } else if (open) {
    shapeR(c, () => c.ellipse(mx, my + 0.4, 3.4, 2.2, 0, 0, Math.PI * 2), ['#7F1D1D', '#4A0A0A', '#300606', '#200404', '#120202'], mx - 3.4, mx + 3.4, 0.9);
    teeth(mx - 2.4, my - 1.2, 4.8);
  } else {
    // (the big easy smile, its dimple)
    c.strokeStyle = S[4]; c.lineWidth = 1; c.beginPath(); c.arc(mx - 0.4, my - 3, 4.2, 0.35, Math.PI - 0.7); c.stroke();
    pxR(c, mx - 3, my - 0.4, 2.6, 0.8, '#FAF6EC'); pxR(c, mx - 4.6, my - 1.6, 0.8, 0.8, S[3]);
  }
  // (the mustache over the lip, the goatee down off the chin to a point)
  const stache = () => { c.moveTo(mx - 4.6, my - 1.4); c.quadraticCurveTo(mx, my - 3.8, mx + 4.8, my - 1.8); c.lineTo(mx + 4, my - 0.6); c.quadraticCurveTo(mx, my - 2, mx - 4, my - 0.2); c.closePath(); };
  shapeR(c, stache, G, mx - 4.6, mx + 4.8, 0.8);
  const goat = () => { c.moveTo(mx - 3.2, my + 3.2 + jaw); c.quadraticCurveTo(mx, my + 4.6 + jaw, mx + 3.2, my + 2.8 + jaw); c.lineTo(mx + 1.6, my + 8.6 + jaw); c.lineTo(mx - 0.2, my + 9.2 + jaw); c.closePath(); };
  shapeR(c, goat, G, mx - 3.2, mx + 3.2, 0.8);
  lineR(c, [mx - 0.6, my + 4.2 + jaw, mx + 0.4, my + 8 + jaw], 0.6, G[0]);

  // The glasses: round granny lenses, amber, on a wire frame; the far one foreshortened; the arm back to his ear
  const lensMad = mad && mood !== 'queasy';
  for (const [i, [ex, ey]] of eyes.entries()) {
    const rx = i ? 2.5 : 3.5, ry = 3.5;
    c.globalAlpha = 0.72;
    ellR(c, ex, ey, rx, ry, lensMad ? '#EA580C' : '#F59E0B');
    c.globalAlpha = 0.55;
    c.save(); c.beginPath(); c.ellipse(ex, ey, rx, ry, 0, 0, Math.PI * 2); c.clip();
    pxR(c, ex - rx, ey - ry, rx * 2, ry * 0.8, lensMad ? '#9A3412' : '#B45309');
    pxR(c, ex - rx, ey - ry * 0.2, rx * 2, 1, dith(c, lensMad ? '#9A3412' : '#B45309'));
    pxR(c, ex - rx, ey + ry * 0.5, rx * 2, ry, '#FDE68A');
    c.restore();
    c.globalAlpha = 1;
    c.strokeStyle = INK; c.lineWidth = 0.9; c.beginPath(); c.ellipse(ex, ey, rx, ry, 0, 0, Math.PI * 2); c.stroke();
    pxR(c, ex - rx * 0.6, ey - ry * 0.7, 1.2, 1.2, '#FFFBEB'); pxR(c, ex + rx * 0.3, ey + ry * 0.3, 0.6, 0.6, '#FFFBEB');
    pxR(c, ex - rx * 0.3, ey - ry - 0.3, rx * 0.8, 0.6, '#E5C07B');
  }
  lineR(c, [hx + 8.1, hy - 2.6, hx + 7.6, hy - 3, hx + 7.5, hy - 2.6], 0.8, INK);
  lineR(c, [hx + 1.1, hy - 2.4, hx - 4, hy - 0.4], 0.8, INK); pxR(c, hx - 2, hy - 1.6, 1.4, 0.5, '#E5C07B');

  // The bandana's slipped down over his eyes (dead)
  const band = (y0: number) => {
    const b = () => { c.moveTo(hx - 10.2, y0); c.lineTo(hx + 11.4, y0 - 0.8); c.lineTo(hx + 11.6, y0 + 4.2); c.lineTo(hx - 10, y0 + 5.4); c.closePath(); };
    shapeR(c, b, BAND_R, hx - 10.2, hx + 11.6, 1);
    // (its folds, the paisley's little marks)
    lineR(c, [hx - 8, y0 + 2, hx + 10, y0 + 1.2], 0.6, BAND_R[3]);
    for (let k = 0; k < 5; k++) { pxR(c, hx - 6 + k * 3.8, y0 + 1 + (k % 2), 1.2, 1, '#FEE2E2'); pxR(c, hx - 5.6 + k * 3.8, y0 + 3.2 - (k % 2), 0.8, 0.8, BAND_R[4]); }
    return b;
  };
  if (o.bandana) {
    // (his gray hair swept back over the top, the red bandana round his forehead, the knot and its tails flying)
    const hair = () => { c.moveTo(hx - 10, hy - 4); c.quadraticCurveTo(hx - 11.4, hy - 15.6, hx + 1, hy - 14.6); c.quadraticCurveTo(hx + 11.4, hy - 14.4, hx + 11.2, hy - 8); c.lineTo(hx - 9.4, hy - 6); c.closePath(); };
    shapeR(c, hair, G, hx - 11, hx + 11, 1);
    for (let k = 0; k < 4; k++) lineR(c, [hx + 8 - k * 4, hy - 13.4 + k * 0.4, hx + 2 - k * 4, hy - 12 + k * 0.6, hx - 4 - k * 2, hy - 9], 0.6, k % 2 ? G[0] : G[3]);
    band(hy - 9.6);
    const fl = Math.sin(f * 0.3) * 3, fl2 = Math.sin(f * 0.3 + 1.3) * 3;
    shapeR(c, () => { c.moveTo(hx - 12, hy - 8.6); c.quadraticCurveTo(hx - 20, hy - 9.6 + fl, hx - 25.6, hy - 6.4 + fl); c.lineTo(hx - 23.4, hy - 3.2 + fl); c.quadraticCurveTo(hx - 18, hy - 5.2 + fl, hx - 12, hy - 6); c.closePath(); }, BAND_R, hx - 25.6, hx - 12, 0.9);
    shapeR(c, () => { c.moveTo(hx - 12, hy - 6.4); c.quadraticCurveTo(hx - 18, hy - 2 + fl2, hx - 22.4, hy + 2.4 + fl2); c.lineTo(hx - 19.2, hy + 3.4 + fl2); c.quadraticCurveTo(hx - 16, hy - 1, hx - 11, hy - 5); c.closePath(); }, [BAND_R[1], BAND_R[2], BAND_R[3], BAND_R[3], BAND_R[4]], hx - 22.4, hx - 11, 0.9);
    shapeR(c, () => c.ellipse(hx - 11.2, hy - 7, 2.8, 2.4, 0, 0, Math.PI * 2), BAND_R, hx - 14, hx - 8.4, 0.9);
    if (o.slip) band(hy - 4.6);
    return;
  }
  // The flight helmet: white in steps, the visor flipped up (navy, a glint), the peace sign on its side, the strap
  const helm = () => { c.moveTo(hx - 11.4, hy - 2.4); c.quadraticCurveTo(hx - 12.8, hy - 17.6, hx + 1, hy - 17.6); c.quadraticCurveTo(hx + 13.4, hy - 17.4, hx + 12.4, hy - 6.6); c.lineTo(hx - 11, hy - 5.6); c.closePath(); };
  shapeR(c, helm, HELMET_R, hx - 12.8, hx + 13, 1);
  pxR(c, hx - 8, hy - 15.6, 5, 1.6, '#FFFFFF');
  lineR(c, [hx - 11, hy - 5.4, hx + 12.2, hy - 6.4], 1.4, HELMET_R[3]);
  const visor = () => { c.moveTo(hx - 1, hy - 16.4); c.quadraticCurveTo(hx + 8.6, hy - 18.6, hx + 13.6, hy - 12.2); c.lineTo(hx + 10.4, hy - 10.8); c.quadraticCurveTo(hx + 6, hy - 14.2, hx - 1, hy - 13.2); c.closePath(); };
  shapeR(c, visor, VISOR_R, hx - 1, hx + 13.6, 0.9);
  pxR(c, hx + 3, hy - 15.6, 3, 0.8, '#C7D8FA');
  c.strokeStyle = '#15803D'; c.lineWidth = 1.6; c.beginPath(); c.arc(hx - 4, hy - 9.6, 3.6, 0, Math.PI * 2); c.stroke();
  c.strokeStyle = '#4ADE80'; c.lineWidth = 1.1; c.beginPath(); c.arc(hx - 4, hy - 9.6, 3.6, 0, Math.PI * 2);
  c.moveTo(hx - 4, hy - 13.2); c.lineTo(hx - 4, hy - 6); c.moveTo(hx - 4, hy - 9.6); c.lineTo(hx - 6.5, hy - 7); c.moveTo(hx - 4, hy - 9.6); c.lineTo(hx - 1.5, hy - 7); c.stroke();
  lineR(c, [hx - 7, hy - 5, hx - 6.4, hy + 6, hx - 2, hy + 10], 0.9, '#3F3F46');
  shapeR(c, () => c.ellipse(hx - 6.2, hy - 1, 2.6, 3.6, 0, 0, Math.PI * 2), HELMET_R, hx - 8.8, hx - 3.6, 0.9);
};

/** Steam blowing off the top of his head in stepped puffs (his rants: it reads from way up there). */
export const steamOff = (c: Ctx, f: number, x: number, y: number) => {
  for (let k = 0; k < 3; k++) {
    const ph = ((f * 0.7 + k * 10) % 30) / 30, sx = x + (k - 1) * 8 + (k - 1) * ph * 6, sy = y - ph * 14;
    c.globalAlpha = 0.85 * (1 - ph);
    ellR(c, sx + 0.8, sy + 0.8, 2.6 + ph * 4, 2.2 + ph * 3.4, '#94A3B8');
    ellR(c, sx, sy, 2.4 + ph * 3.6, 2 + ph * 3, '#E2E8F0');
    ellR(c, sx - 0.8, sy - 0.8, 1.2 + ph * 1.8, 1 + ph * 1.4, '#FFFFFF');
    c.globalAlpha = 1;
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The kit: the jetpack, the remote, the launcher

/** The emergency jetpack (behind him): two tanks in steps with their red bands, the frame, the nozzles; flames. */
const jetpack = (c: Ctx, f: number, burn: boolean) => {
  pxR(c, -19, -60, 14, 3, STEEL_R[4]); pxR(c, -18.6, -59.6, 13.2, 2, STEEL_R[2]);
  for (const dx of [-17, -9]) {
    shapeR(c, () => c.roundRect(dx - 4.4, -67, 9, 31, 4.2), GRAY_R, dx - 4.4, dx + 4.6, 1);
    pxR(c, dx - 4, -58.6, 8.4, 2.6, BAND_R[1]); pxR(c, dx - 4, -58.6, 8.4, 0.8, BAND_R[0]); pxR(c, dx + 2, -58.6, 2.4, 2.6, BAND_R[3]);
    pxR(c, dx - 2.6, -65, 1.4, 4, '#FFFFFF');
    shapeR(c, () => { c.moveTo(dx - 3, -36); c.lineTo(dx + 4, -36); c.lineTo(dx + 5, -31); c.lineTo(dx - 4, -31); c.closePath(); }, STEEL_R, dx - 4, dx + 5, 0.9);
    if (burn) {
      const l = 12 + ((f >> 1) % 3) * 4;
      for (const [col, k, w] of [['#991B1B', 1.18, 5.4], ['#DC2626', 1, 4.8], ['#F97316', 0.78, 3.8], ['#FDE047', 0.5, 2.6], ['#FFFBEB', 0.24, 1.4]] as const) {
        c.fillStyle = col; c.beginPath(); c.moveTo(dx + 0.5 - w, -31); c.quadraticCurveTo(dx + 0.5 - w * 0.6, -31 + l * k * 0.6, dx + 0.5, -31 + l * k + 4); c.quadraticCurveTo(dx + 0.5 + w * 0.6, -31 + l * k * 0.6, dx + 0.5 + w, -31); c.closePath(); c.fill();
      }
    }
  }
};

/** The ride's remote (the one that runs the landmarks): a black brick, a long antenna, a big red button, its light. */
const remoteAt = (c: Ctx, x: number, y: number, f: number, keyed: boolean) => {
  shapeR(c, () => c.roundRect(x - 4, y - 9, 9, 13, 2), ['#71717A', '#3F3F46', '#27272A', '#18181B', '#050506'], x - 4, x + 5, 1.1);
  pxR(c, x - 3, y - 8, 7, 2, '#52525B'); pxR(c, x - 2.6, y + 1, 1.2, 1.2, '#A1A1AA'); pxR(c, x + 0.4, y + 1, 1.2, 1.2, '#A1A1AA'); pxR(c, x + 3, y + 1, 1.2, 1.2, '#A1A1AA');
  const lit = keyed && (f >> 2) % 2 === 1;
  ellR(c, x + 0.5, y - 2, 2.6, 2.6, INK); ellR(c, x + 0.5, y - 2, 2.1, 2.1, lit ? '#EF4444' : '#991B1B'); pxR(c, x - 0.6, y - 3.2, 1, 1, lit ? '#FECACA' : '#DC2626');
  lineR(c, [x + 3, y - 9, x + 7, y - 26], 1.6, INK); lineR(c, [x + 3, y - 9, x + 7, y - 26], 0.7, '#A1A1AA');
  const tip = keyed && (f >> 3) % 2 === 1;
  ellR(c, x + 7, y - 27, 2.2, 2.2, INK); ellR(c, x + 7, y - 27, 1.6, 1.6, tip ? '#FDE047' : '#A1A1AA');
  if (keyed) { c.strokeStyle = 'rgba(253,224,71,0.8)'; c.lineWidth = 1.2; for (const o of [0, 6]) { const k = ((f + o) % 12) / 12; c.beginPath(); c.arc(x + 7, y - 27, 4 + k * 10, -2.4, -0.7); c.stroke(); } }
};

/** The rocket launcher on his shoulder (a fat olive tube in steps, a sight, a grip), pointing right; a rocket's nose. */
const launcher = (c: Ctx, firing: boolean) => {
  shapeR(c, () => c.rect(-26, -64, 60, 11), ['#9AAA62', '#5E6E30', '#4D5B2A', '#323C1A', '#151A08'], -26, 34, 1.2);
  pxR(c, -26, -63, 60, 2, '#8A9A52'); pxR(c, -20, -64, 10, 11, dith(c, '#3A4520'));
  pxR(c, -10, -61, 16, 4, '#FACC15'); pxR(c, -10, -61, 16, 1, '#FEF08A');
  for (const x of [-28, 30]) { pxR(c, x, -66, 6, 15, INK); pxR(c, x + 1, -65, 4, 13, '#3F3F46'); pxR(c, x + 1, -65, 4, 2, '#71717A'); }
  shapeR(c, () => c.rect(4, -71, 8, 7), STEEL_R, 4, 12, 1);
  pxR(c, 9, -70, 2, 2, '#38BDF8');
  shapeR(c, () => c.rect(-2, -53, 5, 7), STEEL_R, -2, 3, 1);
  if (!firing) shapeR(c, () => { c.moveTo(34, -62); c.lineTo(41, -58.5); c.lineTo(34, -55); c.closePath(); }, BAND_R, 34, 41, 1);
  else for (let i = 0; i < 5; i++) ellR(c, 40 + i * 5, -58.5 + (i % 2 ? 2 : -2), 7.4 - i, 7.4 - i, ['#DC2626', '#F97316', '#FDE047', '#FFFBEB', '#FFFFFF'][i]);
};

/** The tie-dye shirt: a rainbow spiral of bands clipped to its shape, its far side in shade (dithered). */
export const tieDye = (c: Ctx, path: () => void, cx: number, cy: number, f: number) => {
  c.save(); c.beginPath(); path(); c.clip();
  for (let r = 24, i = 0; r > 0; r -= 3.2, i++) { c.fillStyle = TIEDYE[(i + (f >> 5)) % TIEDYE.length]; c.beginPath(); c.ellipse(cx + Math.sin(i) * 1.5, cy + Math.cos(i) * 1.5, r, r * 0.9, 0.4, 0, Math.PI * 2); c.fill(); }
  // (the dye's bleed between the bands; the shade round its far side and under the chest)
  c.fillStyle = dith(c, 'rgba(255,255,255,0.35)'); c.fillRect(cx - 30, cy - 30, 18, 60);
  c.fillStyle = dith(c, 'rgba(20,10,30,0.45)'); c.fillRect(cx + 3, cy - 30, 30, 60);
  c.fillStyle = 'rgba(20,10,30,0.3)'; c.fillRect(cx + 6, cy - 30, 30, 60);
  c.restore();
  c.beginPath(); path(); c.strokeStyle = INK; c.lineWidth = 1.2; c.stroke();
};

// ---------------------------------------------------------------------------------------------------------------
// Him

export const drawHarry = (c: Ctx, x: number, y: number, L: HarryLook) => {
  const { pose, f } = L, mad = !!L.mad;
  c.save();
  c.translate(Math.round(x), Math.round(y));
  c.scale((L.facing ?? 1) * (L.scale ?? 1), L.scale ?? 1);
  if (L.rot) { c.translate(0, -42); c.rotate(L.rot); c.translate(0, 42); }
  // (flat on his back where he came down: legs in the air, kicking)
  if (pose === 'down') { c.rotate(-Math.PI / 2); c.translate(-6, 10); }
  const seated = pose === 'pilot';
  const air = pose === 'jet' || pose === 'aim' || pose === 'fire' || pose === 'gloat' || pose === 'fall' || pose === 'shoved';
  const bob = air ? Math.sin(f * 0.12) * 1.5 : 0;
  c.translate(0, bob);
  if (L.jetpack) jetpack(c, f, air || !!L.burn);
  const run = pose === 'run';
  const stride = run ? Math.sin(f * 0.45) : 0;
  const S = sickR(SKIN_R, L.green ?? 0);
  // Legs (faded jeans in steps, white tube socks with their stripes, brown sandals, his toes)
  const kick = pose === 'fall' || pose === 'shoved' ? Math.sin(f * 0.5) * 8 : 0;
  const legs: [number, number, number, number][] = seated
    ? [[-2, -34, 16, -32], [4, -34, 22, -32]]
    : air ? [[-4, -34, -6 + kick, -4], [3, -34, 7 - kick, -6]]
    : run ? [[-4, -34, -4 + stride * 10, -3 - Math.max(0, stride) * 6], [4, -34, 5 - stride * 10, -3 - Math.max(0, -stride) * 6]]
    : [[-4, -34, -5, -3], [4, -34, 6, -3]];
  const shins: [number, number][] = seated ? [[16, -14], [22, -14]] : [];
  const back: Ramp = [DENIM_R[1], DENIM_R[2], DENIM_R[3], DENIM_R[3], DENIM_R[4]];
  legs.forEach(([a, b, cx, cy], i) => {
    const R = i ? DENIM_R : back;
    const fx = seated ? shins[i][0] : cx, fy = seated ? shins[i][1] : cy;
    const mxk = (a + cx) / 2 + (seated ? 0 : 1), myk = (b + cy) / 2;
    if (seated) tubeR(c, [a, b, cx, cy, fx, fy], [8, 7], [R, R]);
    else tubeR(c, [a, b, mxk, myk, fx, fy - 3], [8.4, 7.4], [R, R]);
    // (the knee's fade, the hem)
    if (!seated) { pxR(c, mxk - 1.6, myk - 1, 3, 2, dith(c, DENIM_R[0])); pxR(c, fx - 4, fy - 5, 8, 1.4, R[3]); }
    // (the tube sock: white, a red and a blue stripe; the sandal's straps and sole; his toes)
    shapeR(c, () => c.rect(fx - 3.2, fy - 3.4, 6.4, 5), SOCK_R, fx - 3.2, fx + 3.2, 0.9);
    pxR(c, fx - 3, fy - 2.6, 6, 0.8, '#DC2626'); pxR(c, fx - 3, fy - 1.4, 6, 0.8, '#2563EB');
    shapeR(c, () => c.roundRect(fx - 3.6, fy + 1.4, 11.6, 3.2, 1), LEATHER_R, fx - 3.6, fx + 8, 0.9);
    pxR(c, fx + 2, fy - 0.2, 2, 2, LEATHER_R[2]); pxR(c, fx + 5.4, fy + 0.6, 2.2, 1.2, S[1]); pxR(c, fx + 5.6, fy + 0.6, 0.8, 0.6, S[0]);
  });
  // (running: dust kicked up off the road behind him, in stepped puffs)
  if (run) for (let k = 0; k < 3; k++) {
    const ph = ((f * 0.9 + k * 9) % 27) / 27, px = -6 - ph * 20 - k * 3, py = -2 - ph * 8;
    c.globalAlpha = 0.55 * (1 - ph);
    ellR(c, px + 1, py + 1, 3 + ph * 5, 3 + ph * 5, '#8A7860');
    ellR(c, px - 0.5, py - 0.5, 2 + ph * 4, 2 + ph * 4, '#C8B898');
    c.globalAlpha = 1;
  }
  // Torso: the tie-dye under the open flight jacket (the jacket in steps, its seam dithered down the shadow side)
  const tx = 0, ty = -34;
  const torso = () => { c.moveTo(tx - 9, ty); c.lineTo(tx + 9, ty); c.lineTo(tx + 11, ty - 26); c.lineTo(tx - 10, ty - 26); c.closePath(); };
  shapeR(c, torso, JACKET_R, tx - 10, tx + 11, 1.2);
  tieDye(c, () => { c.moveTo(tx - 3, ty - 1); c.lineTo(tx + 8, ty - 1); c.lineTo(tx + 9, ty - 25); c.lineTo(tx - 2, ty - 25); c.closePath(); }, tx + 3, ty - 13, f);
  // (the jacket's open fronts: the zip, a chest pocket, the lit edge; the knit waistband; the fleece collar; the patch)
  shapeR(c, () => { c.moveTo(tx - 10, ty - 26); c.lineTo(tx - 2, ty - 26); c.lineTo(tx - 3, ty); c.lineTo(tx - 9, ty); c.closePath(); }, JACKET_R, tx - 10, tx - 2, 1);
  for (let k = ty - 24; k < ty - 2; k += 2) pxR(c, tx - 3.4, k, 1, 1, '#A1A1AA');
  shapeR(c, () => c.rect(tx - 8.4, ty - 13, 4.4, 4.4), JACKET_R, tx - 8.4, tx - 4, 0.8); pxR(c, tx - 8.4, ty - 13, 4.4, 1, JACKET_R[3]);
  shapeR(c, () => { c.moveTo(tx + 8, ty - 26); c.lineTo(tx + 11, ty - 26); c.lineTo(tx + 9.5, ty); c.lineTo(tx + 8, ty); c.closePath(); }, JACKET_R, tx + 8, tx + 11, 0.9);
  pxR(c, tx - 9.6, ty - 3, 19.6, 3, '#3F2A1C'); for (let k = tx - 9; k < tx + 9; k += 1.6) pxR(c, k, ty - 3, 0.6, 3, '#24170E');
  for (const s of [-1, 1]) {
    const col = () => { if (s < 0) { c.moveTo(tx - 10.6, ty - 26.6); c.lineTo(tx - 1.6, ty - 26.6); c.lineTo(tx - 4, ty - 19.4); c.closePath(); } else { c.moveTo(tx + 11.6, ty - 26.6); c.lineTo(tx + 5.6, ty - 26.6); c.lineTo(tx + 9.2, ty - 19.6); c.closePath(); } };
    shapeR(c, col, FLEECE_R, s < 0 ? tx - 10.6 : tx + 5.6, s < 0 ? tx - 1.6 : tx + 11.6, 0.9);
    c.save(); c.beginPath(); col(); c.clip(); pxR(c, tx - 12, ty - 28, 26, 10, dith(c, FLEECE_R[2])); c.restore();
  }
  // (the wings patch: gold on navy)
  pxR(c, tx - 9, ty - 17.4, 6, 3, '#1E3A8A'); pxR(c, tx - 8.6, ty - 16.6, 5.2, 1.2, '#FDE047'); pxR(c, tx - 6.6, ty - 17, 1.2, 2, '#FEF9C3');
  // Head (the steam: his rants; by default whenever he's yelling mad, as the helicopter has it)
  head(c, f, mad, !!L.talking, tx + 1, ty - 37, { green: L.green });
  const steam = L.steam ?? (mad && !!L.talking && pose !== 'pilot');
  if (steam) steamOff(c, f, tx + 1, ty - 55);
  // Arms: the jacket's sleeves in steps, a knit cuff, his hands
  const shX = tx - 4, shY = ty - 22, sh2X = tx + 6;
  const armTo = (sx: number, sy: number, ex: number, ey: number, hx: number, hy: number, fist = false) => {
    tubeR(c, [sx, sy, ex, ey, hx, hy], [6.8, 6.2], [JACKET_R, JACKET_R]);
    const d = Math.hypot(hx - ex, hy - ey) || 1, ux = (hx - ex) / d, uy = (hy - ey) / d;
    lineR(c, [hx - ux * 4.2, hy - uy * 4.2, hx - ux * 2.4, hy - uy * 2.4], 5.6, '#2A1E12', 'butt');
    hand(c, hx, hy, fist, S);
  };
  if (L.launcher || pose === 'aim' || pose === 'fire') {
    // (tipped up about his shoulder: he's shooting up at the sky)
    c.save(); c.translate(tx + 4, ty - 26); c.rotate(-(L.aim ?? 0)); c.translate(-(tx + 4), -(ty - 26));
    armTo(shX, shY, shX - 2, shY + 10, tx + 6, ty - 26 + 2);
    launcher(c, pose === 'fire');
    armTo(sh2X, shY, sh2X + 8, shY + 6, tx + 16, ty - 26 + 1, true);
    c.restore();
  } else if (pose === 'remote') {
    // (the remote held up high at the landmark, keyed; the other fist shaking)
    const s = Math.sin(f * 0.5) * 3;
    armTo(shX, shY, shX - 3, shY + 12, tx - 6, ty - 4 + s, true);
    armTo(sh2X, shY, sh2X + 8, shY - 12, tx + 14, ty - 46, true);
    remoteAt(c, tx + 14, ty - 46, f, true);
  } else if (pose === 'run') {
    armTo(shX, shY, shX - 2 - stride * 6, shY + 10, tx - 4 - stride * 10, ty - 6, true);
    armTo(sh2X, shY, sh2X + 2 + stride * 6, shY + 10, tx + 10 + stride * 10, ty - 8, true);
    if (L.remote) remoteAt(c, tx + 12 + stride * 10, ty - 6, f, !!L.keyed);
  } else if (pose === 'down') {
    armTo(shX, shY, shX - 10, shY + 6, tx - 14, ty + 4);
    armTo(sh2X, shY, sh2X + 10, shY + 6, tx + 18, ty + 2);
  } else if (pose === 'pilot') {
    armTo(shX, shY, shX + 6, shY + 10, tx + 18, ty - 6, true);
    armTo(sh2X, shY, sh2X + 8, shY + 8, tx + 20, ty - 8, true);
  } else if (pose === 'wave') {
    const w = Math.sin(f * 0.25) * 5;
    armTo(shX, shY, shX - 3, shY + 12, tx - 4, ty - 2);
    armTo(sh2X, shY, sh2X + 9, shY - 9, tx + 13 + w, ty - 44, false);
  } else if (pose === 'fall' || pose === 'shoved') {
    const w = Math.sin(f * 0.6) * 10;
    armTo(shX, shY, shX - 9, shY - 8, tx - 12 + w * 0.3, ty - 40 - w);
    armTo(sh2X, shY, sh2X + 9, shY - 8, tx + 16 - w * 0.3, ty - 40 + w);
  } else if (pose === 'jet' || pose === 'gloat') {
    // (shaking his fist at him, the other hand on the jetpack's throttle)
    const s = pose === 'gloat' ? Math.sin(f * 0.4) * 4 : Math.sin(f * 0.7) * 3;
    armTo(shX, shY, shX - 3, shY + 12, tx - 6, ty - 4, true);
    armTo(sh2X, shY, sh2X + 10, shY - 4, tx + 18, ty - 34 + s, true);
    if (pose === 'gloat') { lineR(c, [tx + 18, ty - 38 + s, tx + 18, ty - 46 + s], 3, S[4]); lineR(c, [tx + 18, ty - 38 + s, tx + 18, ty - 45.6 + s], 1.6, S[1]); }
  } else {
    armTo(shX, shY, shX - 3, shY + 12, tx - 5, ty - 2);
    armTo(sh2X, shY, sh2X + 3, shY + 12, tx + 9, ty - 2);
  }
  c.restore();
};
