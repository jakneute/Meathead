// The page side of `npm run icon:m2` (see make.mjs): Meathead 2's icon. The same face as Meathead 1's (the close-up's
// dumb look, see render.ts), a day into Happy Land: a souvenir ears hat jammed down on the flat-top (red, the park's own
// ears: two yellow smiley discs, nobody's mouse; MEATHEAD stitched on the band), and a chocolate cone's worth of ice
// cream all round his mouth, a drip off his chin, a dab on the end of his nose, sprinkles stuck in it.

import { drawMeatheadCloseUp, type MeatheadMood } from '../../src/m1/game/scenes/ending';

type G = CanvasRenderingContext2D;

const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d')!; g.imageSmoothingEnabled = false;
  return [c, g] as const;
};

/** A light ring round whatever's painted (`r` px thick), under it (as Meathead 1's). */
const outlined = (src: HTMLCanvasElement, r: number, color: string) => {
  const [sil, sg] = canvas(src.width, src.height);
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (dx * dx + dy * dy <= r * r) sg.drawImage(src, dx, dy);
  sg.globalCompositeOperation = 'source-in'; sg.fillStyle = color; sg.fillRect(0, 0, src.width, src.height);
  const d = sg.getImageData(0, 0, src.width, src.height);
  for (let i = 3; i < d.data.length; i += 4) d.data[i] = d.data[i] > 40 ? 255 : 0;
  sg.putImageData(d, 0, 0);
  sg.globalCompositeOperation = 'source-over'; sg.drawImage(src, 0, 0);
  return sil;
};

const RING = '#f4ead8';
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bayer = (x: number, y: number) => BAYER[(y & 3) * 4 + (x & 3)] / 16;
const noise = (x: number, y: number) => { const v = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return v - Math.floor(v); };
const INK = '#120a10';
const CAP = ['#3a0608', '#6e1214', '#a01c1c', '#c82a26', '#e8463a', '#fa7a62'];
const YEL = ['#6a4004', '#a86a08', '#d8a010', '#f4c828', '#fde047', '#fff3a8'];
const BAND = ['#8a8274', '#b8b0a0', '#e0d8c8', '#fbf6ea'];
const CHOC = ['#2a1006', '#4a2410', '#6a3a1c', '#8a522c', '#ac7042'];

const px = (g: G, x: number, y: number, w: number, h: number, col: string) => { g.fillStyle = col; g.fillRect(x, y, w, h); };

/** Every pixel `inside`, lit by `light` (0 dark .. 1 lit) in the ramp's steps, ordered-dithered between them; an ink edge. */
const form = (g: G, x0: number, y0: number, x1: number, y1: number, inside: (x: number, y: number) => boolean,
  light: (x: number, y: number) => number, ramp: string[], ink: string | null = INK) => {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if (!inside(x, y)) continue;
    const edge = !inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1);
    const l = Math.max(0, Math.min(0.999, light(x, y))) * (ramp.length - 1);
    px(g, x, y, 1, 1, edge && ink ? ink : ramp[Math.min(ramp.length - 1, Math.floor(l + bayer(x, y)))]);
  }
};

// A 3 x 5 pixel font: just the letters MEATHEAD needs
const FONT: Record<string, string[]> = {
  M: ['101', '111', '111', '101', '101'], E: ['111', '100', '110', '100', '111'], A: ['010', '101', '111', '101', '101'],
  T: ['111', '010', '010', '010', '010'], H: ['101', '101', '111', '101', '101'], D: ['110', '101', '101', '101', '110'],
};
const stitch = (g: G, text: string, x: number, y: number, col: string, shadow: string) =>
  [...text].forEach((ch, i) => FONT[ch].forEach((row, r) => [...row].forEach((b, c) => {
    if (b === '1') { px(g, x + i * 4 + c, y + r + 1, 1, 1, shadow); px(g, x + i * 4 + c, y + r, 1, 1, col); }
  })));

/** The ears hat, over the close-up, in its coordinates (the flat-top x 87..169 from y 4; the hairline at 30). */
const hat = (g: G) => {
  // The ears: yellow discs out at the hat's top corners, lit up and to the left, a dumb smile on each (drawn first:
  // the crown's over their roots)
  for (const [cx, cy, s] of [[79, -2, -1], [177, -2, 1]] as const) {
    const r = 12.5;
    form(g, cx - 14, cy - 14, cx + 14, cy + 14, (x, y) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r,
      (x, y) => 0.95 - ((x - cx) + (y - cy)) / (r * 3) - Math.hypot(x - cx, y - cy) / r * 0.3, YEL);
    for (let k = -6; k <= -2; k++) px(g, cx + k, cy - 9 + Math.round(((k + 4) / 2.5) ** 2), 1, 1, YEL[5]);
    const fx = cx + s;
    px(g, fx - 4, cy - 5, 2, 3, INK); px(g, fx + 2, cy - 5, 2, 3, INK);
    for (let k = -5; k <= 5; k++) px(g, fx + k, cy + 1 + Math.round(3 - (k / 5) ** 2 * 3), 1, 1, INK);
    px(g, fx - 6, cy + 1, 1, 1, INK); px(g, fx + 6, cy + 1, 1, 1, INK);
    px(g, fx - 8, cy, 2, 2, '#f08a5a'); px(g, fx + 7, cy, 2, 2, '#e07a4a');
  }
  // The crown: red panels pulled down over the flat-top, its corners rounded, the seams running up to the button
  const X0 = 85, X1 = 171, Y0 = -4, Y1 = 21, RR = 7;
  const inCrown = (x: number, y: number) => {
    if (x < X0 || x > X1 || y < Y0 || y > Y1) return false;
    const cx = x < X0 + RR ? X0 + RR : x > X1 - RR ? X1 - RR : x;
    return y >= Y0 + RR || (x - cx) ** 2 + (y - (Y0 + RR)) ** 2 <= RR * RR;
  };
  form(g, X0, Y0, X1, Y1, inCrown, (x, y) => 0.95 - (x - X0) / (X1 - X0) * 0.5 - (y - Y0) / (Y1 - Y0) * 0.3, CAP);
  for (const bx of [100, 156]) for (let y = Y0 + 2; y < 14; y++) {
    const x = Math.round(128 + (bx - 128) * ((y - Y0 - 2) / (14 - Y0 - 2)) ** 0.7);
    px(g, x, y, 1, 1, CAP[1]); if (y % 2 === 0) px(g, x + (x < 128 ? -1 : 1), y, 1, 1, CAP[x < 128 ? 5 : 3]);
  }
  for (let y = Y0 + 2; y < 14; y++) { px(g, 128, y, 1, 1, CAP[1]); if (y % 2 === 0) px(g, 127, y, 1, 1, CAP[4]); }
  // (the button on top)
  px(g, 125, Y0 - 3, 6, 4, INK); px(g, 126, Y0 - 2, 4, 2, CAP[3]); px(g, 126, Y0 - 2, 2, 1, CAP[5]);
  // The band: a white strip round the bottom, MEATHEAD stitched across it in red
  px(g, X0 + 1, 13, X1 - X0 - 1, 1, CAP[0]);
  for (let y = 14; y <= 20; y++) for (let x = X0 + 1; x < X1; x++) {
    const right = (x - X0) / (X1 - X0) > 0.62 + bayer(x, y) * 0.2;
    px(g, x, y, 1, 1, BAND[y === 14 ? 3 : y === 20 ? 0 : right ? 1 : 2]);
  }
  stitch(g, 'MEATHEAD', 113, 15, '#c81e1e', '#9a8a78');
};

/** The ice cream, all round his mouth (the dumb look's lip line: y 87, x 114..142), and a dab on his nose. */
const iceCream = (g: G) => {
  const blobs: [number, number, number, number][] = [[128, 87, 20, 6.5], [117, 90, 9, 5.5], [140, 85, 8, 5], [135, 92, 7, 4]];
  const inSmear = (x: number, y: number) => {
    const n = (noise(x, y) - 0.5) * 0.35;
    if (blobs.some(([bx, by, rx, ry]) => ((x - bx) / rx) ** 2 + ((y - by) / ry) ** 2 < 1 + n)) return true;
    if (x >= 140 && x <= 142 && y >= 90 && y <= 101) return true; // (the drip, down off his chin)
    return (x - 141) ** 2 + (y - 102.5) ** 2 <= 5;
  };
  form(g, 104, 76, 152, 106, inSmear, (x, y) => 0.8 - (y - 80) / 30 - (x - 110) / 120, CHOC, CHOC[0]);
  // (his lips pressed together in it; the shine along the top lip; the light down the drip)
  for (let x = 113; x <= 143; x++) px(g, x, 87, 1, 1, '#140602');
  for (let x = 116; x <= 138; x += 2) px(g, x, 85, 1, 1, CHOC[4]);
  px(g, 140, 92, 1, 7, CHOC[4]); px(g, 140, 101, 1, 2, '#c89060');
  // (sprinkles)
  const SPR: [number, number, number, number, string][] = [[111, 90, 2, 1, '#f472b6'], [121, 83, 1, 2, '#60a5fa'], [133, 90, 2, 1, '#fde047'],
    [145, 83, 1, 2, '#4ade80'], [124, 92, 2, 1, '#f8fafc'], [138, 89, 1, 1, '#f472b6']];
  for (const [x, y, w, h, col] of SPR) px(g, x, y, w, h, col);
  // The dab on the end of his nose
  form(g, 122, 66, 134, 72, (x, y) => ((x - 128) / 5) ** 2 + ((y - 69) / 3) ** 2 < 1 + (noise(x, y) - 0.5) * 0.3,
    (x, y) => 0.9 - (y - 66) / 8 - (x - 123) / 30, CHOC, CHOC[0]);
  px(g, 126, 67, 2, 1, '#c89060');
};

/** Every size as a PNG data URL, keyed by size. */
(window as unknown as { makeIcons: (mood: MeatheadMood) => Record<number, string> }).makeIcons = mood => {
  const D = 16; // (the close-up drawn this far down, so the ears up top fit on the canvas)
  const [art, ag] = canvas(256, 144 + D);
  ag.translate(0, D);
  drawMeatheadCloseUp(ag, 40, false, mood, { bg: () => {}, medal: false });
  iceCream(ag);
  hat(ag);
  ag.setTransform(1, 0, 0, 1, 0, 0);
  const crop = (x: number, y: number, s: number) => { const [c, g] = canvas(s, s); g.drawImage(art, x, y + D, s, s, 0, 0, s, s); return c; };

  const out: Record<number, string> = {};
  // Big: ear disc to ear disc, the ears' tops to his chin, 126 square in a 128 (the ring in the edge pixel); 256 doubled
  const head = crop(65, -15, 126);
  const [f128, g128] = canvas(128, 128); g128.drawImage(head, 1, 1);
  const big = outlined(f128, 1, RING);
  out[128] = big.toDataURL('image/png');
  const [f256, g256] = canvas(256, 256); g256.drawImage(big, 0, 0, 256, 256); out[256] = f256.toDataURL('image/png');
  const shrink = (src: HTMLCanvasElement, s: number) => {
    const [c, g] = canvas(s, s); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    g.drawImage(src, 1, 1, s - 2, s - 2);
    return outlined(c, 1, RING).toDataURL('image/png');
  };
  out[64] = shrink(head, 64);
  out[48] = shrink(head, 48);
  // (32 and under: tighter, the discs' outer edges and the chin's point trimmed, so it's all face and hat)
  const face = crop(70, -12, 116);
  out[32] = shrink(face, 32);
  out[24] = shrink(face, 24);
  out[16] = shrink(face, 16);
  return out;
};
