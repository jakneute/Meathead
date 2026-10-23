// Disaster: The Ride, the lobby's one-sheets (the final pass: peak SNES). The franchise's posters in their cinema
// cases on the lobby's back wall (painted into the wall's chunks: stamped once, at the wall's depth): a deco gold case
// ringed with little bulbs, its lamp's hood over it throwing a stepped fan of light down the flock and across the top
// of the sheet, the glass's glare in a corner (never over the title). The sheets themselves are proper 90s disaster
// one-sheets, knocked off: a tagline up top, the key art (banded storm skies, stepped water and wind, the one figure
// singled out grossed up to the pore), the title in its own display lettering, the tagline, the billing block in
// its condensed smear, Steve's tiny credit.

import { type Ctx, INK, box, checker, mix, poly, hash, bandedGradient, pixelBlob, words, plain } from '../blvd/kit';
import { type Look, fit } from '../../signLetters';
import { grossHead, eyesOf, r6 } from './gross';
import { GOLD, WATER } from './paint';

const H = (n: number) => hash(n);
const dot = (g: Ctx, x: number, y: number, col: string) => box(g, x, y, 1, 1, col);

// ---------------------------------------------------------------------------------------------------------------
// The case

/** A cinema poster case on the wall (its middle at x, its top at y; the sheet w x h): the lamp's fan of light on the
 *  wall, the deco gold frame (stepped, inked, rosettes at its corners) ringed with bulbs, the black mat, the sheet
 *  (`art`, clipped to it), the lamp's light across its top, the glass's glare in its top right corner, the hood. */
export const posterCase = (g: Ctx, x: number, y: number, w: number, h: number, art: (g: Ctx, l: number, t: number, w: number, h: number) => void) => {
  const l = Math.round(x - w / 2), G = GOLD, cx = l + w / 2;
  // (the lamp's light down the flock round the case, a stepped fan)
  for (let r = 0; r < 3; r++) poly(g, [[cx - 14, y - 12], [cx + 14, y - 12], [cx + w / 2 + 10 + r * 6, y + 30 + r * 20], [cx - w / 2 - 10 - r * 6, y + 30 + r * 20]], `rgba(253, 230, 138, ${(0.09 - r * 0.025).toFixed(3)})`);
  // (the frame: inked, a six-step bevel lit up its top and left)
  box(g, l - 9, y - 9, w + 18, h + 18, INK);
  for (let i = 0; i < 6; i++) {
    const o = 8 - i;
    box(g, l - o, y - o, w + o * 2, h + o * 2, i % 2 ? G[3] : G[2]);
    box(g, l - o, y - o, w + o * 2, 1, i < 3 ? G[5] : G[4]);
    box(g, l - o, y - o, 1, h + o * 2, i < 3 ? G[4] : G[3]);
    box(g, l - o, y + h + o - 1, w + o * 2, 1, G[1]);
    box(g, l + w + o - 1, y - o, 1, h + o * 2, i < 3 ? G[1] : G[2]);
  }
  // (the bulbs round it: in their sockets, lit, a speck of glare on each)
  const bulb = (bx: number, by: number) => { box(g, bx - 1, by - 1, 4, 4, G[0]); box(g, bx, by, 2, 2, '#FFF4C8'); dot(g, bx, by, '#FFFFFF'); };
  for (let k = l - 4; k <= l + w + 2; k += 10) { bulb(k, y - 6); bulb(k, y + h + 4); }
  for (let k = y + 6; k <= y + h - 6; k += 10) { bulb(l - 6, k); bulb(l + w + 4, k); }
  // (the rosettes at its corners)
  for (const [rx, ry] of [[l - 8, y - 8], [l + w + 1, y - 8], [l - 8, y + h + 1], [l + w + 1, y + h + 1]] as const) {
    box(g, rx - 1, ry - 1, 9, 9, INK); box(g, rx, ry, 7, 7, G[3]); box(g, rx, ry, 7, 1, G[5]); box(g, rx, ry, 1, 7, G[4]);
    box(g, rx + 2, ry + 2, 3, 3, G[1]); dot(g, rx + 3, ry + 3, G[5]);
  }
  // (the mat)
  box(g, l - 2, y - 2, w + 4, h + 4, '#0A0608'); box(g, l - 2, y + h + 1, w + 4, 1, G[1]);
  // (the sheet)
  g.save(); g.beginPath(); g.rect(l, y, w, h); g.clip();
  art(g, l, y, w, h);
  // (the lamp's light across its top, stepped down; its shade under the frame's top rail)
  for (let r = 0; r < 4; r++) box(g, l, y + r * 8, w, 8, `rgba(255, 236, 190, ${(0.1 - r * 0.025).toFixed(3)})`);
  box(g, l, y, w, 1, 'rgba(0, 0, 0, 0.35)');
  // (the glass: glare in the top right corner, two streaks and their soft edge)
  poly(g, [[l + w - 26, y], [l + w - 16, y], [l + w, y + 16], [l + w, y + 26]], 'rgba(255, 255, 255, 0.14)');
  poly(g, [[l + w - 12, y], [l + w - 8, y], [l + w, y + 8], [l + w, y + 12]], 'rgba(255, 255, 255, 0.22)');
  checker(g, l + w - 30, y, 4, 4, 'rgba(255, 255, 255, 0.1)', 0, 1);
  // (and a sliver of the lobby reflected down its left edge)
  box(g, l, y, 1, h, 'rgba(255, 220, 200, 0.12)');
  g.restore();
  // (the lamp's hood: a deco shade on its arm, the bulb's lip of light under it)
  box(g, cx - 1, y - 18, 3, 8, INK); box(g, cx, y - 18, 1, 8, G[4]);
  poly(g, [[cx - 16, y - 10], [cx + 16, y - 10], [cx + 12, y - 16], [cx - 12, y - 16]], INK);
  poly(g, [[cx - 14, y - 11], [cx + 14, y - 11], [cx + 11, y - 15], [cx - 11, y - 15]], G[2]);
  box(g, cx - 11, y - 15, 22, 1, G[5]); for (let f = -8; f <= 8; f += 4) box(g, cx + f, y - 14, 1, 3, G[4]);
  box(g, cx - 14, y - 10, 28, 1, '#FFF4C8');
};

// ---------------------------------------------------------------------------------------------------------------
// The sheets' shared parts

/** The billing block: rows of the credits' condensed smear (a word a dash, a pixel high, stepped light), centered. */
const billing = (g: Ctx, cx: number, y: number, rows: number, w: number, col: string, seed: number) => {
  for (let r = 0; r < rows; r++) {
    const rw = w - (r % 2) * 10;
    let x = Math.round(cx - rw / 2);
    const end = cx + rw / 2;
    while (x < end) {
      const len = 2 + Math.floor(H(seed + x * 1.3 + r * 7.1) * 6);
      box(g, x, y + r * 2, Math.min(len, end - x), 1, H(seed + x + r) > 0.85 ? mix(col, '#FFFFFF', 0.4) : col);
      x += len + 1 + (H(seed * 2 + x) > 0.8 ? 2 : 0);
    }
  }
};
/** Rain in slanted streaks, lit at their heads. */
const rain = (g: Ctx, l: number, t: number, w: number, h: number, n: number, col: string, seed: number) => {
  for (let i = 0; i < n; i++) {
    const x = l + Math.floor(H(seed + i * 1.7) * w), y = t + Math.floor(H(seed + i * 2.9) * h), len = 3 + Math.floor(H(i * 3.3) * 3);
    for (let k = 0; k < len; k++) dot(g, x - Math.floor(k / 2), y + k, k === 0 ? mix(col, '#FFFFFF', 0.4) : col);
  }
};
/** A lightning fork from (x, y) down `len`: a white core, a pale violet glow either side, a branch. */
const bolt = (g: Ctx, x: number, y: number, len: number, seed: number) => {
  const pts: [number, number][] = [[x, y]];
  let cx = x;
  for (let i = 1; i <= len / 4; i++) { cx += Math.round((H(seed + i) - 0.5) * 6); pts.push([cx, y + i * 4]); }
  for (const [lw, col] of [[5, 'rgba(196, 181, 253, 0.25)'], [3, 'rgba(221, 214, 254, 0.6)'], [1, '#FFFFFF']] as const) {
    g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); pts.forEach(([px, py], i) => (i ? g.lineTo(px + 0.5, py) : g.moveTo(px + 0.5, py))); g.stroke();
  }
  const [bx, by] = pts[Math.floor(pts.length / 2)];
  g.strokeStyle = '#E9E3FF'; g.lineWidth = 1; g.beginPath(); g.moveTo(bx + 0.5, by); g.lineTo(bx + 6.5, by + 5); g.lineTo(bx + 8.5, by + 11); g.stroke();
};
/** Storm clouds: stepped balls of three tones, lit along their tops. */
const clouds = (g: Ctx, l: number, y: number, w: number, T: string[], seed: number) => {
  for (let i = 0; i < 9; i++) { const cx = l + H(seed + i) * w, r = 8 + H(seed + i * 2) * 8; pixelBlob(g, cx, y + 2, r, r * 0.6, T[0], 1); }
  for (let i = 0; i < 9; i++) { const cx = l + H(seed + i) * w, r = 8 + H(seed + i * 2) * 8; pixelBlob(g, cx - 1, y - 1, r * 0.8, r * 0.45, T[1], 1); }
  for (let i = 0; i < 9; i++) { const cx = l + H(seed + i) * w, r = 8 + H(seed + i * 2) * 8; pixelBlob(g, cx - 3, y - 3, r * 0.5, r * 0.25, T[2], 1); }
};
/** A rating box: inked, a letter in it, the small print under. */
const rating = (g: Ctx, x: number, y: number, letter: string) => {
  box(g, x, y, 11, 11, '#F8FAFC'); box(g, x + 1, y + 1, 9, 9, INK);
  words(g, letter, x + 6, y + 9, plain(1, 1, '#F8FAFC'));
};

// ---------------------------------------------------------------------------------------------------------------
// FLOOD 4: STILL WET (a sweaty man on his roof, a wave curling over him, a cow going by on her back)

const floodTitle: Look = { sx: 2, sy: 3, fill: ['#F0F9FF', '#BAE6FD', '#60A5FA', '#2563EB', '#1E3A8A'], dither: true, ink: '#020617', shadow: '#000000', drop: 1, gap: 1, drip: { col: '#3B82F6', tip: '#BFDBFE', rate: 0.6, len: 5 }, seed: 4 };

export const floodSheet = (g: Ctx, l: number, t: number, w: number, h: number) => {
  const W = WATER, cx = l + w / 2;
  // (the sky: storm, banded, down to a sick green-gray at the horizon)
  bandedGradient(g, l, t, w, 82, ['#05070E', '#0E1A2A', '#1A2E44', '#2E4A5E', '#4A6A6E'], 7, 1);
  clouds(g, l - 6, t + 20, w + 12, ['#0A1220', '#1A2638', '#2E3E54'], 7);
  bolt(g, l + 16, t + 22, 40, 3);
  rain(g, l, t + 14, w, 70, 70, '#6A8AA8', 11);
  // (the tagline over it all)
  words(g, "IT'S NOT SWEAT.", cx, t + 11, plain(1, 1, '#E2E8F0', '#000000'));
  // (the wave: its back, its face in steps, the curl's lip feathered in foam, spray off it)
  poly(g, [[l + w, t + 22], [l + w, t + 92], [l + 46, t + 92], [l + 58, t + 60], [l + 66, t + 44], [l + 78, t + 30], [l + 92, t + 24]], W[1]);
  poly(g, [[l + w, t + 34], [l + w, t + 92], [l + 56, t + 92], [l + 64, t + 66], [l + 72, t + 50], [l + 84, t + 38]], W[2]);
  poly(g, [[l + w, t + 50], [l + w, t + 92], [l + 66, t + 92], [l + 72, t + 72], [l + 80, t + 58]], W[3]);
  poly(g, [[l + w, t + 64], [l + w, t + 92], [l + 78, t + 92], [l + 84, t + 76]], W[4]);
  for (let i = 0; i < 9; i++) { const y = t + 40 + i * 6; box(g, l + 70 + i * 3 - (i % 2) * 4, y, 10 - (i % 3) * 2, 1, W[5]); }
  checker(g, l + 60, t + 46, 30, 30, 'rgba(166, 206, 242, 0.25)', 0, 1);
  // (the lip curling over: a hook of foam, its underside in shadow)
  poly(g, [[l + 66, t + 44], [l + 74, t + 30], [l + 88, t + 22], [l + 100, t + 20], [l + 92, t + 28], [l + 80, t + 34], [l + 72, t + 46]], '#E8F4FC');
  poly(g, [[l + 72, t + 46], [l + 80, t + 34], [l + 92, t + 28], [l + 84, t + 36], [l + 76, t + 48]], W[4]);
  poly(g, [[l + 66, t + 44], [l + 60, t + 50], [l + 62, t + 42], [l + 70, t + 36]], '#FFFFFF');
  for (let i = 0; i < 22; i++) { const sx = l + 54 + H(i * 1.9) * 40, sy = t + 16 + H(i * 3.7) * 30; box(g, sx, sy, i % 3 ? 1 : 2, i % 3 ? 1 : 2, i % 2 ? '#FFFFFF' : W[5]); }
  // (the roof poking out of the water: shingles row by row, the chimney, the antenna bent over)
  poly(g, [[l + 4, t + 92], [l + 34, t + 70], [l + 64, t + 92]], INK);
  poly(g, [[l + 6, t + 92], [l + 34, t + 72], [l + 62, t + 92]], '#6A1A16');
  for (let r = 0; r < 5; r++) {
    const y = t + 75 + r * 4, half = 4 + r * 6;
    box(g, l + 34 - half, y, half * 2, 1, '#3E0E0C');
    for (let k = l + 34 - half + (r % 2) * 3; k < l + 34 + half; k += 6) { box(g, k, y + 1, 1, 3, '#3E0E0C'); box(g, k + 1, y + 1, 4, 1, '#8E2A22'); }
  }
  poly(g, [[l + 6, t + 92], [l + 34, t + 72], [l + 34, t + 76], [l + 12, t + 92]], 'rgba(255, 220, 200, 0.12)');
  box(g, l + 46, t + 70, 7, 12, INK); box(g, l + 47, t + 71, 5, 11, '#7A3A2A'); box(g, l + 47, t + 71, 5, 1, '#A85A44'); for (let k = 0; k < 3; k++) box(g, l + 47, t + 74 + k * 3, 5, 1, '#4A2018');
  g.strokeStyle = '#8A949E'; g.lineWidth = 1; g.beginPath(); g.moveTo(l + 14.5, t + 86); g.lineTo(l + 14.5, t + 70); g.lineTo(l + 6.5, t + 66); g.moveTo(l + 10.5, t + 72); g.lineTo(l + 19.5, t + 72); g.stroke();
  // (him: on the ridge, his Hawaiian shirt soaked, both arms up, screaming; his head grossed up, twice the size)
  const hx = l + 34, foot = t + 80;
  for (const s of [-1, 1]) {
    // (his arms: thrown up, the sleeve, the forearm's hair, the hand splayed)
    const sx = hx + s * 12, hdx = hx + s * 30, hdy = t + 36;
    g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.moveTo(sx, foot - 4); g.lineTo(hx + s * 24, t + 56); g.lineTo(hdx, hdy + 6); g.stroke();
    g.strokeStyle = '#D8A07A'; g.lineWidth = 5; g.beginPath(); g.moveTo(sx, foot - 4); g.lineTo(hx + s * 24, t + 56); g.lineTo(hdx, hdy + 6); g.stroke();
    g.strokeStyle = '#F2C8A8'; g.lineWidth = 1; g.beginPath(); g.moveTo(sx - 2, foot - 6); g.lineTo(hx + s * 24 - 2, t + 56); g.lineTo(hdx - 2, hdy + 6); g.stroke();
    for (let i = 0; i < 5; i++) dot(g, hx + s * (24 + i), t + 48 - i * 2, '#5A3A20');
    box(g, hdx - 4, hdy - 1, 9, 8, INK); box(g, hdx - 3, hdy, 7, 6, '#D8A07A'); box(g, hdx - 3, hdy, 7, 1, '#F2C8A8');
    for (let f = 0; f < 4; f++) { box(g, hdx - 4 + f * 2 + (s > 0 ? 1 : 0), hdy - 5 + (f === 0 || f === 3 ? 2 : 0), 2, 5, INK); dot(g, hdx - 3 + f * 2 + (s > 0 ? 1 : 0), hdy - 4 + (f === 0 || f === 3 ? 2 : 0), '#E8B898'); }
    box(g, hdx + s * 5, hdy + 2, 2, 2, INK);
  }
  // (the torso: the shirt (parrots, hibiscus), soaked dark down its front)
  box(g, hx - 13, foot - 12, 26, 14, INK); box(g, hx - 12, foot - 11, 24, 13, '#C2410C'); box(g, hx - 12, foot - 11, 24, 2, '#F97316');
  for (let i = 0; i < 7; i++) { const fx = hx - 10 + Math.floor(H(i * 2.2) * 19), fy = foot - 9 + Math.floor(H(i * 4.4) * 9); box(g, fx, fy, 2, 2, i % 2 ? '#FDE047' : '#22C55E'); dot(g, fx, fy, '#FFFFFF'); }
  checker(g, hx - 12, foot - 5, 24, 7, 'rgba(10, 26, 58, 0.45)', 0, 1);
  box(g, hx - 1, foot - 11, 2, 13, '#7C2D12');
  g.save(); g.translate(hx, t + 22); g.scale(2, 2);
  grossHead(g, 0, 0, { skin: '#D8A07A', hair: '#5A3A20', seed: 23, shirt: '#C2410C', pants: '#1E3A8A', pose: 'up' });
  // (his pupils, pinpricks rolled up at the wave)
  for (const [ex, ey] of eyesOf(0, 0)) { box(g, ex - 1, ey - 2, 1, 1, INK); dot(g, ex, ey - 2, '#3A2410'); }
  g.restore();
  // (the floodwater over his chest: banded, the foam lines, a cow going by on her back, legs up)
  for (let i = 0; i < 4; i++) box(g, l, t + 82 + i * 4, w, 4, [W[4], W[3], W[2], W[1]][i]);
  for (let i = 0; i < 8; i++) box(g, l + i * 13 + (i % 2) * 4, t + 82 + (i % 3), 8, 1, W[5]);
  box(g, l + 72, t + 80, 22, 7, INK); box(g, l + 73, t + 81, 20, 5, '#F4F0E8'); box(g, l + 73, t + 84, 20, 2, '#C8C0B4');
  box(g, l + 77, t + 81, 5, 3, INK); box(g, l + 86, t + 82, 4, 2, INK);
  for (const lx of [l + 75, l + 80, l + 85, l + 90]) { box(g, lx, t + 72 + (lx % 3), 2, 9 - (lx % 3), INK); box(g, lx, t + 71 + (lx % 3), 2, 2, '#3A2410'); }
  box(g, l + 66, t + 81, 8, 6, INK); box(g, l + 67, t + 82, 6, 4, '#E8D8C8'); box(g, l + 66, t + 85, 3, 2, '#E8A0A0'); dot(g, l + 69, t + 82, INK);
  box(g, l + 82, t + 79, 3, 2, '#F0A0B0');
  // (down to the deep: dark under the title)
  bandedGradient(g, l, t + 96, w, h - 96, [W[1], '#08142C', '#040A18'], 3, 1);
  // (the title: water-blue, inked, running)
  words(g, 'FLOOD 4', cx, t + 110, fit('FLOOD 4', floodTitle, w - 8));
  words(g, 'STILL WET.', cx, t + 122, plain(1, 1, '#FDE047', '#000000'));
  billing(g, cx - 7, t + 125, 2, 72, '#64748B', 5);
  words(g, 'STUNTS: STEVE', cx - 6, t + 135, plain(1, 1, '#94A3B8'));
  rating(g, l + w - 14, t + h - 12, 'W');
};

// ---------------------------------------------------------------------------------------------------------------
// COWNADO: UDDER CHAOS (a twister over the plains, a cow's face grossed up in its middle, the farm going up with her)

const cowTitle: Look = { sx: 2, sy: 3, fill: ['#FFEDD5', '#FDBA74', '#EA580C', '#9A3412', '#5A1A08'], dither: true, ink: '#140804', shadow: '#000000', drop: 1, gap: 1, slant: 0.5 };

/** The cow, grossed up, her face 40 x 44 from (cx - 20, top): the hide to the pore, black patches, horns, ears out
 *  sideways (her tag: 3), the bulging bloodshot eyes rolled two ways, the wet muzzle's wrinkles and nose hair, snot,
 *  her mouth wide: the flat teeth, the tongue flapping, slobber flung. */
const cowFace = (g: Ctx, cx: number, top: number) => {
  const S = ['#4A4440', '#8A847C', '#B8B2A8', '#E2DCD0', '#F4F0E6', '#FFFFFF'], P = r6('#E8A0A8'), B = '#1A1412';
  // (the horns, the ears out sideways, the tag)
  for (const s of [-1, 1]) {
    poly(g, [[cx + s * 9, top + 4], [cx + s * 15, top - 2], [cx + s * 19, top - 6], [cx + s * 16, top + 2], [cx + s * 12, top + 7]], INK);
    poly(g, [[cx + s * 10, top + 4], [cx + s * 15, top - 1], [cx + s * 18, top - 5], [cx + s * 15, top + 2], [cx + s * 12, top + 6]], '#D8CCAA');
    dot(g, cx + s * 17, top - 4, '#5A4A30');
    poly(g, [[cx + s * 13, top + 10], [cx + s * 26, top + 6], [cx + s * 27, top + 12], [cx + s * 14, top + 16]], INK);
    poly(g, [[cx + s * 14, top + 11], [cx + s * 25, top + 7], [cx + s * 26, top + 11], [cx + s * 14, top + 15]], S[3]);
    poly(g, [[cx + s * 16, top + 12], [cx + s * 24, top + 9], [cx + s * 24, top + 11], [cx + s * 16, top + 14]], P[3]);
  }
  box(g, cx + 20, top + 12, 7, 8, INK); box(g, cx + 21, top + 13, 5, 6, '#FDE047'); box(g, cx + 22, top + 14, 3, 1, INK); dot(g, cx + 24, top + 15, INK); box(g, cx + 22, top + 16, 3, 1, INK); dot(g, cx + 24, top + 17, INK); box(g, cx + 22, top + 18, 3, 1, INK);
  // (the head: inked, the hide in steps, lit up its left)
  g.fillStyle = INK; g.beginPath(); g.ellipse(cx, top + 14, 15, 14, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(cx, top + 31, 14, 11, 0, 0, Math.PI * 2); g.fill();
  g.save(); g.beginPath(); g.ellipse(cx, top + 14, 14, 13, 0, 0, Math.PI * 2); g.ellipse(cx, top + 31, 13, 10, 0, 0, Math.PI * 2); g.clip();
  box(g, cx - 16, top, 32, 42, S[3]);
  box(g, cx + 5, top, 11, 42, S[2]); checker(g, cx + 2, top, 3, 42, S[2], 0, 1); box(g, cx + 10, top, 6, 42, S[1]);
  box(g, cx - 13, top + 2, 8, 14, S[4]); checker(g, cx - 13, top + 16, 8, 4, S[4], 0, 1); box(g, cx - 11, top + 3, 3, 4, S[5]);
  // (her black patches, the one over her eye)
  pixelBlob(g, cx + 7, top + 9, 8, 7, B, 1); pixelBlob(g, cx - 10, top + 2, 5, 4, B, 1); box(g, cx + 4, top + 4, 2, 1, '#3A3230');
  // (every pore and hair)
  for (let py = 0; py < 42; py++) for (let px = -15; px <= 15; px++) { const k = H(px * 13.7 + py * 5.3); if (k < 0.08) dot(g, cx + px, top + py, S[1]); else if (k > 0.97) dot(g, cx + px, top + py, S[5]); }
  // (the muzzle: pink, wet, its wrinkles lit under each, nostrils huge, their hair, snot down to her lip)
  g.fillStyle = P[1]; g.beginPath(); g.ellipse(cx, top + 31, 13, 9, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = P[3]; g.beginPath(); g.ellipse(cx - 1, top + 30, 12, 8, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = P[4]; g.beginPath(); g.ellipse(cx - 4, top + 27, 6, 3, 0, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 4; i++) for (let x = cx - 8; x <= cx + 8; x++) { const wy = top + 23 + i * 2 + (H(x + i) > 0.6 ? 1 : 0); dot(g, x, wy, P[1]); dot(g, x, wy + 1, P[5]); }
  for (let i = 0; i < 18; i++) dot(g, cx - 10 + Math.floor(H(i * 7.7) * 20), top + 24 + Math.floor(H(i * 3.1) * 12), '#8A4A50');
  g.restore();
  for (const s of [-1, 1]) {
    const nx = cx + s * 6;
    g.fillStyle = INK; g.beginPath(); g.ellipse(nx, top + 30, 3.5, 4.5, s * 0.3, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#3A0A10'; g.beginPath(); g.ellipse(nx, top + 30, 2.2, 3.2, s * 0.3, 0, Math.PI * 2); g.fill();
    for (let i = 0; i < 3; i++) box(g, nx - 2 + i * 2, top + 33, 1, 2, '#4A3A30');
  }
  box(g, cx - 7, top + 34, 2, 7, '#B8D84A'); box(g, cx - 7, top + 34, 1, 7, '#E2F48A'); box(g, cx - 7, top + 41, 2, 2, '#A8C83A');
  // (the eyes: out on stalks almost, the whites bulging, veins from their corners, the lids heavy; pupils rolled apart)
  for (const s of [-1, 1]) {
    const ex = cx + s * 9 - 5, ey = top + 10;
    box(g, ex - 1, ey - 1, 12, 11, INK); box(g, ex, ey, 10, 9, '#F2EEDC'); box(g, ex, ey + 6, 10, 3, '#E2D2C0'); box(g, ex + 1, ey, 5, 1, '#FFFFFF');
    for (let i = 0; i < 4; i++) { const vx = s < 0 ? ex + i : ex + 9 - i; dot(g, vx, ey + 3 + (i % 2), '#C8282A'); dot(g, vx, ey + 6 - (i % 2), '#D8484A'); }
    box(g, ex - 1, ey - 2, 12, 2, s < 0 ? S[2] : B); box(g, ex, ey + 10, 10, 1, '#6A4A5A');
    const pxp = s < 0 ? ex + 1 : ex + 7, pyp = s < 0 ? ey + 1 : ey + 5;
    box(g, pxp, pyp, 2, 2, INK); dot(g, pxp, pyp, '#5A3A20');
    for (let i = 0; i < 4; i++) box(g, ex + 1 + i * 3, ey - 3, 1, 2, B);
  }
  // (her mouth: wide open under the muzzle, the flat yellow teeth, the tongue flapping out to her left, slobber flung)
  box(g, cx - 9, top + 40, 18, 7, INK); box(g, cx - 8, top + 41, 16, 5, '#2A0606');
  for (let k = -7; k < 8; k += 2) { box(g, cx + k, top + 41, 2, 2, k % 4 ? '#E8DCA0' : '#C8B870'); dot(g, cx + k, top + 41, '#FFF8D8'); }
  poly(g, [[cx - 4, top + 44], [cx - 14, top + 46], [cx - 22, top + 50], [cx - 20, top + 53], [cx - 10, top + 50], [cx, top + 46]], INK);
  poly(g, [[cx - 4, top + 45], [cx - 14, top + 47], [cx - 21, top + 50], [cx - 19, top + 52], [cx - 10, top + 49], [cx - 1, top + 46]], P[3]);
  box(g, cx - 18, top + 49, 10, 1, P[1]); box(g, cx - 14, top + 47, 6, 1, P[5]);
  for (let i = 0; i < 6; i++) { box(g, cx + 6 + i * 3, top + 44 + (i % 2) * 2 + i, 2, 1, 'rgba(220, 236, 248, 0.85)'); dot(g, cx + 8 + i * 3, top + 46 + i, '#FFFFFF'); }
  box(g, cx - 23, top + 52, 2, 3, 'rgba(220, 236, 248, 0.8)');
  // (sweat, or worse, beading on her brow)
  for (let i = 0; i < 5; i++) { const bx = cx - 6 + i * 3, by = top + 2 + (i % 2) * 2; box(g, bx, by, 2, 2, '#CFE4EE'); dot(g, bx, by, '#FFFFFF'); }
};

export const cowSheet = (g: Ctx, l: number, t: number, w: number, h: number) => {
  const cx = l + w / 2;
  // (the sky: tornado green, banded, sick yellow down at the horizon)
  bandedGradient(g, l, t, w, 92, ['#0A0E08', '#1A2216', '#2E3A24', '#4E5A34', '#8A8A44', '#C8B860'], 8, 1);
  clouds(g, l - 6, t + 18, w + 12, ['#141A10', '#242E1C', '#3A462C'], 19);
  words(g, 'UDDER CHAOS.', cx, t + 11, plain(1, 1, '#FDE68A', '#000000'));
  // (the plains: a field in bands, the fence going off, the farmhouse and its silo small on the horizon)
  bandedGradient(g, l, t + 86, w, 12, ['#5A5A28', '#3E4220', '#262A16'], 3, 1);
  box(g, l + 6, t + 80, 10, 6, '#2A1E14'); poly(g, [[l + 5, t + 80], [l + 11, t + 76], [l + 17, t + 80]], '#3A140E'); dot(g, l + 9, t + 82, '#FDE68A');
  box(g, l + 18, t + 76, 4, 10, '#3A3A40'); box(g, l + 18, t + 75, 4, 1, '#6A6A72');
  for (let k = l + 60; k < l + w; k += 7) { box(g, k, t + 85, 1, 5, '#2A1E14'); } box(g, l + 60, t + 86, w - 60, 1, '#4A3A24');
  // (the twister: banded rows wobbling down to its foot, swirl stripes, lit up its left, dark down its right; dust at
  // the foot)
  for (let y = t + 16; y < t + 90; y++) {
    const k = (y - t - 16) / 74, half = Math.max(2, Math.round(40 * Math.pow(1 - k, 1.25) + 3)), mid = Math.round(cx + Math.sin(k * 5.5) * 7 * k + 2);
    const stripe = (y + Math.round(k * 9)) % 7, base = stripe < 2 ? '#3A3E34' : stripe < 4 ? '#5A5E4E' : '#4A4E40';
    box(g, mid - half, y, half * 2, 1, base);
    box(g, mid - half, y, 2, 1, '#8A8C78'); box(g, mid + half - 3, y, 3, 1, '#262A20');
    if (stripe === 4) for (let x = mid - half + 3; x < mid + half - 3; x += 2) dot(g, x + (y % 2), y, '#6E7260');
  }
  for (let i = 0; i < 10; i++) pixelBlob(g, cx + 6 + (H(i) - 0.5) * 34, t + 88 - H(i * 2) * 6, 3 + H(i * 3) * 4, 2 + H(i * 5) * 2, i % 2 ? '#5A4A30' : '#7A6A48', 1);
  // (what it's taken up: a fence section, a trailer, a lawn chair, an outhouse, a calf (smaller, also screaming))
  const junk = (x: number, y: number, k: number) => {
    if (k === 0) { box(g, x, y, 12, 1, '#8A6A40'); box(g, x, y + 3, 12, 1, '#8A6A40'); box(g, x + 1, y - 1, 1, 6, '#5A4428'); box(g, x + 9, y - 1, 1, 6, '#5A4428'); }
    else if (k === 1) { box(g, x - 1, y - 1, 14, 8, INK); box(g, x, y, 12, 6, '#C8CCD0'); box(g, x, y, 12, 1, '#F2F4F6'); box(g, x + 2, y + 2, 3, 2, '#3A6A8A'); box(g, x + 7, y + 2, 3, 2, '#3A6A8A'); box(g, x, y + 4, 12, 1, '#2E7A78'); }
    else if (k === 2) { box(g, x, y, 1, 6, '#E2E8F0'); box(g, x + 5, y, 1, 6, '#E2E8F0'); for (let i = 0; i < 4; i++) box(g, x, y + i * 2, 6, 1, i % 2 ? '#22C55E' : '#FDE68A'); }
    else if (k === 3) { box(g, x - 1, y - 1, 8, 11, INK); box(g, x, y, 6, 9, '#7A5A34'); box(g, x, y, 6, 1, '#A07A4A'); poly(g, [[x + 2, y + 2], [x + 4, y + 2], [x + 3, y + 1]], '#FDE68A'); }
    else { box(g, x - 1, y - 1, 11, 6, INK); box(g, x, y, 9, 4, '#F4F0E6'); box(g, x + 2, y, 3, 2, '#1A1412'); box(g, x + 8, y - 2, 4, 4, INK); box(g, x + 9, y - 1, 2, 2, '#E8A0A8'); dot(g, x + 11, y + 1, '#2A0606'); for (const lx of [x, x + 3, x + 6]) box(g, lx, y + 4, 1, 3, INK); }
  };
  junk(l + 6, t + 34, 0); junk(l + 82, t + 30, 1); junk(l + 10, t + 58, 2); junk(l + 82, t + 54, 3); junk(l + 70, t + 70, 4);
  for (let i = 0; i < 26; i++) dot(g, l + H(i * 4.1) * w, t + 22 + H(i * 6.3) * 60, i % 2 ? '#2A2416' : '#8A8C78');
  bolt(g, l + 88, t + 18, 24, 9);
  // (her, in it: grossed up, front and center)
  cowFace(g, cx, t + 22);
  // (down to dark under the title)
  bandedGradient(g, l, t + 96, w, h - 96, ['#262A16', '#120E08', '#080604'], 3, 1);
  words(g, 'COWNADO', cx - 1, t + 111, fit('COWNADO', cowTitle, w - 8));
  words(g, 'SOON SINCE 1991', cx, t + 121, plain(1, 1, '#FDBA74', '#000000'));
  billing(g, cx - 7, t + 124, 2, 72, '#6A6048', 13);
  words(g, 'COW: STEVE', cx - 6, t + 135, plain(1, 1, '#A8A088'));
  rating(g, l + w - 14, t + h - 12, 'M');
};
