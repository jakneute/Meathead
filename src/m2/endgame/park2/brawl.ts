// THE BRAWL (the owner, 2026-11-05: "when meathead turns them into a pretzel, show a big 'smoke dust tussel' with all
// three inside. right now meathead just stands there as a tiny cloud forms. the cloud should be much bigger and show
// their faces as the fight happens"). The classic cartoon fight cloud, big enough to own the screen: a rolling ball of
// dust and smoke (puffs in their ramps, lit warm from the lamp and the fire, shaded under, dithered), the three of them
// in it (he's hidden for it: end.ts), their faces popping out of it and back in (Meathead's grit in his glasses, the
// son's eyeliner and his little horns, the brother's mohawk and his big horns), fists and boots and horns and the
// guitar and stars flung out of it, a skirt of dust along the floor. Then it blows away (the pretzel in his hands).
//
// Everything that's drawn is baked: the puffs (three sizes), the faces (two looks each), the bits flung out; only
// where each goes is worked out per frame.

import { stamp } from '../../../m1/game/render/stamp';
import { GY } from './geo';

type Ctx = CanvasRenderingContext2D;
const INK = '#0A0604';
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const ell = (g: Ctx, x: number, y: number, rx: number, ry: number, col: string) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2); g.fill(); };
const R = (g: Ctx, x: number, y: number, w: number, h: number, col: string) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const poly = (g: Ctx, pts: [number, number][], col: string) => { g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };

// ---------------------------------------------------------------------------------------------------------------
// The puff: a ball of dust in five steps (lit top-left warm, shaded bottom-right violet), the seams dithered

const DUST = ['#3A2E30', '#66585A', '#94867E', '#C2B4A2', '#ECDFC8'];
/** A puff: a cauliflower of dust (a few balls of it lumped together), each ball in its steps, the lot inked round. */
const paintPuff = (g: Ctx, r: number) => {
  const lumps: [number, number, number][] = [[0, 0.15, 0.72], [-0.42, 0.05, 0.52], [0.44, 0.1, 0.5], [-0.15, -0.32, 0.56], [0.25, -0.28, 0.46]];
  for (const [dx, dy, k] of lumps) ell(g, dx * r, dy * r, k * r + 2, k * r + 2, INK);
  for (const [dx, dy, k] of lumps) ell(g, dx * r, dy * r, k * r, k * r, DUST[1]);
  for (const [dx, dy, k] of lumps) ell(g, dx * r - k * r * 0.12, dy * r - k * r * 0.14, k * r * 0.82, k * r * 0.78, DUST[2]);
  for (const [dx, dy, k] of lumps) ell(g, dx * r - k * r * 0.3, dy * r - k * r * 0.34, k * r * 0.48, k * r * 0.42, DUST[3]);
  for (const [dx, dy, k] of lumps.slice(3)) ell(g, dx * r - k * r * 0.42, dy * r - k * r * 0.46, k * r * 0.2, k * r * 0.16, DUST[4]);
  // (the dither under each step, the warm rim off the fire on its underside)
  for (let y = -r; y < r; y += 2) for (let x = -r + ((y >> 1) & 1) * 2; x < r; x += 4) { const d = Math.hypot(x / r, (y - r * 0.3) / r); if (d < 0.55 && y > 0) R(g, x, y, 1, 1, DUST[0]); }
  g.strokeStyle = '#C2410C'; g.lineWidth = 1.5; g.beginPath(); g.arc(0, r * 0.15, r * 0.7, 0.3, 1.4); g.stroke();
};
const SIZES = [22, 34, 48];
const puff = (c: Ctx, x: number, y: number, size: number) => {
  const r = SIZES[size];
  c.save(); c.translate(Math.round(x), Math.round(y)); stamp(c, `wp2-puff-${r}`, -r - 4, -r - 4, r * 2 + 8, r * 2 + 8, g => paintPuff(g, r)); c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The faces (about 50 tall: the cloud's scale), facing out of it; `look` 0 the grit / snarl, 1 the yell / ow

type Face = 'mh' | 'son' | 'bro';
const SKIN = ['#6E3F1C', '#A0662E', '#C68B45', '#E0AC69', '#F5D0A9'];
const LAV = ['#2A1E34', '#8A7A96', '#AEA0B8', '#CFC4D6', '#ECE4F0'];
const RED = ['#3A0606', '#7F1D1D', '#B91C1C', '#DC2626', '#F87171'];
const paintFace = (g: Ctx, who: Face, look: number) => {
  if (who === 'mh') {
    // (Meathead: the flat-top, the square jaw, stubble, his thick glasses, the scowl; gritting or bellowing)
    R(g, -19, -20, 38, 40, INK); R(g, -18, -19, 36, 38, SKIN[2]); R(g, -18, -19, 6, 38, SKIN[3]); R(g, 12, -19, 6, 38, SKIN[1]); R(g, -18, 15, 36, 4, SKIN[1]);
    for (let y = 6; y < 18; y += 2) for (let x = -16 + ((y / 2) % 2); x < 16; x += 2) R(g, x, y, 1, 1, '#7A4A22');
    R(g, -21, -32, 42, 14, INK); R(g, -20, -31, 40, 12, '#18181B'); R(g, -20, -31, 40, 3, '#2A2A30');
    for (let k = 0; k < 12; k++) R(g, -19 + k * 3.3, -31 + (k % 2), 1, 2, '#45454D');
    R(g, -23, -10, 6, 10, SKIN[1]); R(g, 17, -10, 6, 10, SKIN[1]);
    // (the brows: down hard)
    poly(g, [[-16, -14], [-2, -9], [-2, -6], [-16, -11]], INK); poly(g, [[16, -14], [2, -9], [2, -6], [16, -11]], INK);
    // (the glasses: the rims, the cold glass, a glint)
    for (const rx of [-17, 2]) { R(g, rx, -8, 15, 11, INK); g.fillStyle = 'rgba(190, 220, 248, 0.55)'; g.fillRect(rx + 2, -6, 11, 7); R(g, rx + 3, -5, 2, 2, '#F8FAFC'); R(g, rx + 6, -6, 1, 1, '#F8FAFC'); R(g, rx + 5, -3, 3, 2, INK); }
    R(g, -2, -5, 4, 2, INK);
    R(g, -2, 2, 5, 6, SKIN[1]); R(g, 1, 2, 2, 6, SKIN[3]);
    if (look === 0) { R(g, -10, 10, 21, 7, INK); R(g, -9, 11, 19, 5, '#F5F5F4'); for (let k = 0; k < 5; k++) R(g, -7 + k * 4, 11, 1, 5, '#A8A29E'); }
    else { R(g, -9, 8, 19, 11, INK); R(g, -8, 9, 17, 3, '#F5F5F4'); R(g, -6, 12, 13, 5, '#7F1D1D'); R(g, -3, 15, 7, 2, '#E11D48'); }
  } else if (who === 'son') {
    // (the son: long gray-lavender face, black hair down over one eye, little horns, raccoon eyeliner, black lips)
    R(g, -14, -22, 28, 44, INK); R(g, -13, -21, 26, 42, LAV[2]); R(g, -13, -21, 5, 42, LAV[3]); R(g, 9, -21, 4, 42, LAV[1]);
    poly(g, [[-8, -24], [-12, -38], [-4, -26]], INK); poly(g, [[-8, -25], [-10, -35], [-5, -26]], '#D6C8B0');
    poly(g, [[6, -24], [9, -38], [12, -24]], INK); poly(g, [[7, -25], [9, -35], [11, -25]], '#D6C8B0');
    poly(g, [[-16, -24], [16, -26], [16, -10], [10, -16], [4, -6], [-2, -14], [-8, -2], [-16, 4]], '#14101C');
    R(g, -6, -24, 16, 2, '#4A4058');
    ell(g, 6, -4, 7, 6, '#0A0610'); ell(g, 6, -4, 4, 3.5, '#F2E6E0'); ell(g, 7, -4, 1.6, 1.6, look ? '#FF3A2A' : '#8A1020');
    R(g, 0, 4, 12, 1, '#7A6A8A');
    poly(g, [[8, -2], [16, 6], [9, 8]], LAV[1]);
    if (look === 0) { R(g, -4, 12, 14, 3, '#141018'); R(g, -2, 12, 10, 1, '#3A3444'); }
    else { ell(g, 3, 14, 7, 6, '#141018'); ell(g, 3, 15, 5, 4, '#3A0E1A'); R(g, -1, 10, 8, 2, '#E8DCC8'); }
    R(g, 6, 18, 3, 3, '#A8A8B4');
  } else {
    // (the brother: red, a yellow mohawk up the middle, big studded horns, a snarl of fangs)
    R(g, -18, -20, 36, 40, INK); R(g, -17, -19, 34, 38, RED[2]); R(g, -17, -19, 6, 38, RED[3]); R(g, 11, -19, 6, 38, RED[1]);
    for (let k = 0; k < 6; k++) poly(g, [[-6 + k * 2.4, -19], [-5 + k * 2.4, -44 + Math.abs(k - 2.5) * 3], [-3 + k * 2.4, -19]], k % 2 ? '#FDE047' : '#EAB308');
    for (const s of [-1, 1]) { poly(g, [[s * 12, -14], [s * 30, -38], [s * 22, -12]], INK); poly(g, [[s * 13, -15], [s * 28, -35], [s * 21, -13]], '#F4EADC'); for (let k = 0; k < 2; k++) R(g, s * (17 + k * 4) - 1, -22 - k * 6, 2, 2, '#9CA3AF'); }
    poly(g, [[-15, -10], [-3, -5], [-3, -3], [-15, -7]], INK); poly(g, [[15, -10], [3, -5], [3, -3], [15, -7]], INK);
    for (const ex of [-9, 6]) { R(g, ex, -3, 6, 4, '#FDE047'); R(g, ex + 2, -3, 2, 4, INK); }
    R(g, -3, 2, 6, 5, RED[1]);
    if (look === 0) { R(g, -11, 10, 22, 6, INK); for (let k = 0; k < 5; k++) poly(g, [[-10 + k * 4.4, 10], [-8 + k * 4.4, 14], [-6 + k * 4.4, 10]], '#F5F5F4'); }
    else { R(g, -10, 8, 20, 11, INK); R(g, -8, 12, 16, 5, '#450A0A'); poly(g, [[-8, 8], [-6, 13], [-4, 8]], '#F5F5F4'); poly(g, [[4, 8], [6, 13], [8, 8]], '#F5F5F4'); }
    R(g, -15, 4, 2, 2, '#C8C8D0'); R(g, 13, 4, 2, 2, '#C8C8D0');
  }
};
const face = (c: Ctx, x: number, y: number, who: Face, look: number, flip: boolean) => {
  c.save(); c.translate(Math.round(x), Math.round(y)); if (flip) c.scale(-1, 1);
  stamp(c, `wp2-brawlface-${who}-${look}`, -34, -48, 68, 74, g => paintFace(g, who, look));
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The bits flung out of it: a fist (his), a bony hand (the son's), a red fist, a platform boot, a combat boot, a horn,
// the guitar, a star (each baked, put down turned: a canvas of its own)

type Bit = 'fist' | 'claw' | 'redfist' | 'boot' | 'cboot' | 'horn' | 'guitar' | 'star';
const BITS: Bit[] = ['fist', 'star', 'boot', 'redfist', 'horn', 'star', 'claw', 'cboot', 'guitar', 'star'];
const bitCv = new Map<Bit, HTMLCanvasElement>();
const paintBit = (g: Ctx, b: Bit) => {
  switch (b) {
    case 'fist': R(g, -14, -6, 18, 12, SKIN[1]); R(g, -14, -6, 18, 4, SKIN[2]); ell(g, 8, 0, 11, 10, INK); ell(g, 8, 0, 10, 9, SKIN[2]); ell(g, 5, -3, 5, 4, SKIN[3]); for (let k = 0; k < 3; k++) R(g, 12, -6 + k * 4, 5, 1, SKIN[0]); break;
    case 'claw': R(g, -14, -4, 16, 8, '#1C1A22'); ell(g, 6, 0, 7, 6, INK); ell(g, 6, 0, 6, 5, LAV[2]); for (let k = -1; k <= 2; k++) { R(g, 10, -4 + k * 3, 10, 2, LAV[2]); R(g, 19, -4 + k * 3, 2, 2, INK); } break;
    case 'redfist': R(g, -14, -6, 18, 12, '#18181B'); ell(g, 8, 0, 11, 10, INK); ell(g, 8, 0, 10, 9, RED[2]); ell(g, 5, -3, 5, 4, RED[3]); R(g, -14, -6, 18, 2, '#9CA3AF'); break;
    case 'boot': R(g, -10, -14, 12, 16, INK); R(g, -9, -13, 10, 14, '#22202A'); R(g, -12, 2, 26, 8, INK); R(g, -11, 3, 24, 6, '#2A2830'); R(g, -11, 3, 24, 1, '#5A5664'); break;
    case 'cboot': R(g, -10, -14, 12, 16, INK); R(g, -9, -13, 10, 14, '#3A2A20'); R(g, -11, 2, 22, 5, INK); R(g, -10, 2, 20, 3, '#4A3A28'); for (let k = 0; k < 3; k++) R(g, -8, -10 + k * 4, 6, 1, '#9CA3AF'); break;
    case 'horn': poly(g, [[-8, 6], [10, -14], [4, 8]], INK); poly(g, [[-6, 5], [9, -12], [3, 6]], '#F4EADC'); poly(g, [[-6, 5], [3, -4], [3, 6]], '#D6C8B0'); R(g, -6, 3, 6, 3, '#7F1D1D'); break;
    case 'guitar': g.save(); g.rotate(-0.5); R(g, -2, -26, 4, 26, INK); R(g, -1, -25, 2, 24, '#A16207'); ell(g, 0, 8, 10, 10, INK); ell(g, 0, 8, 9, 9, '#1A1A1A'); ell(g, -2, 6, 4, 4, '#3A3A3A'); R(g, -3, -30, 6, 6, INK); g.restore(); break;
    case 'star': { g.fillStyle = INK; g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 6 : 14; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); g.fillStyle = '#FDE047'; g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 4.5 : 12; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); R(g, -3, -6, 3, 3, '#FFF7D6'); break; }
  }
};
const bitImg = (b: Bit) => {
  let cv = bitCv.get(b);
  if (!cv && typeof document !== 'undefined') { cv = document.createElement('canvas'); cv.width = 128; cv.height = 128; const g = cv.getContext('2d')!; g.scale(2, 2); g.translate(32, 32); paintBit(g, b); bitCv.set(b, cv); }
  return cv;
};

// ---------------------------------------------------------------------------------------------------------------
// The cloud

/** The cloud at (x, y) (its middle), `t` frames in; `clear` 0..1 blowing away (the end of it). The cloud's ~460 wide,
 *  ~300 tall. */
export const drawBrawl = (c: Ctx, x: number, y: number, t: number, clear = 0) => {
  const grow = Math.min(1, t / 10), a = 1 - clear;
  if (a <= 0) return;
  const W2 = 200 * grow * (1 + clear * 0.4), H2 = 120 * grow * (1 + clear * 0.4);
  const jx = Math.round(Math.sin(t * 1.7) * 6 * a), jy = Math.round(Math.cos(t * 2.3) * 4 * a);
  c.save();
  /** (blowing away: puffs drop out of it one by one, the rest pushed outward; never faded (a see-through stamp's
   *  painted afresh at every step of a fade)) */
  const keep = (k: number) => hash(k * 7.3 + 0.5) >= clear;
  // (the skirt of dust along the floor, rolling)
  for (let k = 0; k < 9; k++) { if (!keep(k)) continue; const px = x - 230 + k * 58 + Math.sin(t * 0.2 + k) * 8, py = GY - 14; puff(c, px, py, k % 3 === 1 ? 1 : 0); }
  // (the back of the ball: the big puffs round its rim, rolling round)
  const N = 14;
  for (let k = 0; k < N; k++) {
    if (!keep(k + 20)) continue;
    const an = (k / N) * Math.PI * 2 + t * 0.06, rr = 0.82 + hash(k + Math.floor(t / 6)) * 0.14;
    puff(c, x + jx + Math.cos(an) * W2 * rr, y + jy + Math.sin(an) * H2 * rr, 2);
  }
  // (its middle, filled)
  for (let k = 0; k < 7; k++) { if (!keep(k + 40) || clear > 0.2) continue; const an = k * 0.9 + t * 0.11; puff(c, x + jx + Math.cos(an) * W2 * 0.4, y + jy + Math.sin(an) * H2 * 0.35, 2); }
  // (the front puffs, over the faces' lower halves: they're in it)
  for (let k = 0; k < 9; k++) { if (!keep(k + 60)) continue; const an = (k / 9) * Math.PI * 2 - t * 0.09, rr = 0.68 + hash(k * 5 + Math.floor(t / 5)) * 0.1; puff(c, x + jx + Math.cos(an) * W2 * rr, y + jy + Math.sin(an) * H2 * rr + 10, 1); }
  for (let k = 0; k < 5; k++) { if (clear > 0) continue; const an = k * 1.3 + t * 0.15; puff(c, x + jx + Math.cos(an) * W2 * 0.2, y + jy + Math.sin(an) * H2 * 0.2, 1); }
  if (clear < 0.3) {
    // (the faces: out of the ball and back in, three slots at a time round its rim, each face its own beat)
    const faces: Face[] = ['mh', 'son', 'bro'];
    for (let s = 0; s < 3; s++) {
      const beat = Math.floor((t + s * 7) / 14), u = ((t + s * 7) % 14) / 14;
      const who = faces[(beat + s) % 3], slot = Math.floor(hash(beat * 3 + s) * 8), an = -Math.PI * 0.85 + slot * (Math.PI * 1.7 / 7);
      const out = Math.sin(u * Math.PI);
      const fx = x + jx + Math.cos(an) * W2 * (0.66 + out * 0.36), fy = y + jy + Math.sin(an) * H2 * (0.58 + out * 0.38);
      face(c, fx, fy, who, (beat + s) % 2, Math.cos(an) < 0);
      // (the dust over its foot: it's coming out of the cloud, not stuck on it)
      puff(c, fx - Math.cos(an) * 26, fy + 26 - Math.sin(an) * 10, 0);
    }
    // (the bits flung out: a fist, a boot, a horn, stars; three at a time, flying out from the middle past the rim)
    for (let s = 0; s < 4; s++) {
      const beat = Math.floor((t + s * 5) / 10), u = ((t + s * 5) % 10) / 10;
      const b = BITS[(beat * 3 + s) % BITS.length], an = hash(beat * 7 + s * 13) * Math.PI * 2;
      const img = bitImg(b); if (!img) continue;
      const d = 0.5 + u * 0.75, bx = x + jx + Math.cos(an) * W2 * d, by = y + jy + Math.sin(an) * H2 * d;
      c.save(); c.translate(Math.round(bx), Math.round(by)); c.rotate(an + u * 4); c.drawImage(img, -32, -32, 64, 64); c.restore();
    }
  }
  // (the speed lines and impact flashes)
  if (clear === 0) for (let k = 0; k < 6; k++) {
    const an = hash(Math.floor(t / 3) * 11 + k) * Math.PI * 2, r0 = 1.05 + hash(k + t) * 0.1;
    const x0 = x + Math.cos(an) * W2 * r0, y0 = y + Math.sin(an) * H2 * r0;
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + Math.cos(an) * 26, y0 + Math.sin(an) * 18); c.stroke();
    c.strokeStyle = '#F5F0E6'; c.lineWidth = 1.4; c.stroke();
  }
  c.restore();
};
/** Warm the faces and the puffs (painted ahead of the brawl, the frames before it: no hitch as it starts). */
export const warmBrawl = (c: Ctx) => { c.save(); for (let s = 0; s < 3; s++) puff(c, -999, -999, s); for (const w of ['mh', 'son', 'bro'] as Face[]) for (const l of [0, 1]) face(c, -999, -999, w, l, false); for (const b of BITS) bitImg(b); c.restore(); };
