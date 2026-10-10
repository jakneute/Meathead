// The jungle's signs and the park showing through it: every sign's a real one, mounted (the park's carved wood on log
// posts, its bamboo gate, a safety sign on a steel post with the jungle growing up it, a brown scenic sign, a road sign
// with a plaque under it); the sprinkler buried in the floor (a real jungle!), the speakers hidden in rocks, the coin-op
// viewer on the overlook, and the way out (an arch over the path, torches, the park through the gap in the trees).
// After dark: fireflies; by day, morphos.

import type { Light } from '../../../../m1/game/render/lighting';
import { GROUND_Y } from '../../../../m1/constants';
import { timeOfDay, skyRamp, skyAt, farTint } from '../../../timeOfDay';
import { stamp, bandedGradient, steppedGlow } from '../../../intro/art/kit';
import { SIGNS, X, Y, type SignStyle } from '../layout';
import { atDepth } from './ground';
import { doorLamp } from './trees';
import { type Ctx, type View, INK, box, mix, hash, poly, clump, fern, leaf, plank, post, lashing, bamboo, carved, painted, textW, LEAF, MOSS, ROCK, BARK } from './paint';

const GY = GROUND_Y;
const WOOD = '#7A5634';

// ---------------------------------------------------------------------------------------------------------------
// Signs

/** A board of planks with words carved in it, on two log posts (lashed on), standing on the ground at foot. */
const woodSign = (g: Ctx, x: number, foot: number, a: string, b: string, sa = 8, sb = 7, seed = 0, icon?: (x: number, y: number) => void) => {
  const iw = icon ? 26 : 0;
  const w = Math.round(Math.max(textW(g, a, sa), textW(g, b, sb)) + 26 + iw), h1 = sa + 12, h2 = sb + 11;
  const top = foot - 86, l = x - w / 2;
  post(g, l + 10, top - 6, foot, 8); post(g, l + w - 18, top - 6, foot, 8);
  plank(g, l, top, w, h1, WOOD, seed + 1);
  plank(g, l + 4, top + h1 + 1, w - 8, h2, mix(WOOD, '#4A3220', 0.2), seed + 2);
  lashing(g, l + 14, top + 4, 10, 2); lashing(g, l + w - 14, top + 4, 10, 2);
  lashing(g, l + 14, top + h1 + 6, 10, 2); lashing(g, l + w - 14, top + h1 + 6, 10, 2);
  carved(g, a, x + iw / 2, top + h1 / 2 + sa / 2, sa);
  carved(g, b, x + iw / 2, top + h1 + 1 + h2 / 2 + sb / 2, sb);
  if (icon) icon(l + 16, top + h1 / 2 + 2);
  // (a creeper up one post, a fern at the foot)
  for (let y = foot; y > top + 10; y -= 5) leaf(g, l + w - 14 + Math.sin(y * 0.2) * 3, y, 7, y % 10 ? -0.4 : Math.PI + 0.4, LEAF, 3);
  fern(g, l + 8, foot, 22, seed + 5, 0, LEAF, 3);
};

/** A monkey's face, painted (for the feeding sign). */
const monkeyIcon = (g: Ctx, x: number, y: number) => {
  g.fillStyle = INK; g.beginPath(); g.arc(x, y, 10, 0, Math.PI * 2); g.fill();
  for (const s of [-1, 1]) { g.beginPath(); g.arc(x + s * 10, y - 1, 4, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#5A3418'; g.beginPath(); g.arc(x, y, 9, 0, Math.PI * 2); g.fill();
  for (const s of [-1, 1]) { g.fillStyle = '#5A3418'; g.beginPath(); g.arc(x + s * 10, y - 1, 3, 0, Math.PI * 2); g.fill(); g.fillStyle = '#D8A878'; g.beginPath(); g.arc(x + s * 10, y - 1, 1.5, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#E2B888'; g.beginPath(); g.ellipse(x, y + 2, 7, 6, 0, 0, Math.PI * 2); g.fill();
  box(g, x - 4, y - 2, 2, 2, INK); box(g, x + 2, y - 2, 2, 2, INK); box(g, x - 3, y + 4, 6, 1, INK);
  // (the red line through it: no feeding)
  g.strokeStyle = '#B91C1C'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 11, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.moveTo(x - 8, y - 8); g.lineTo(x + 8, y + 8); g.stroke();
};

/** Banana peels, thrown down (they are fed). */
const peels = (g: Ctx, x: number, y: number) => {
  for (let i = 0; i < 6; i++) {
    const px = x + i * 9 - 20 + hash(i) * 6, py = y - (i % 2) * 2;
    g.fillStyle = INK; g.beginPath(); g.ellipse(px, py - 2, 7, 3, (i - 3) * 0.3, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#E8C83A'; g.beginPath(); g.ellipse(px, py - 2, 6, 2, (i - 3) * 0.3, 0, Math.PI * 2); g.fill();
    box(g, px - 3, py - 3, 3, 1, '#FFF0A0'); box(g, px + 4, py - 3, 2, 2, '#5A3A16');
    for (const s of [-1, 1]) { g.strokeStyle = '#C8A82A'; g.lineWidth = 2; g.beginPath(); g.moveTo(px, py - 2); g.lineTo(px + s * 6, py + 1); g.stroke(); }
  }
};

/** The safety sign: steel post, the jungle growing up it; DANGER, the words, rust. */
const warnSign = (g: Ctx, x: number, foot: number, a: string, b: string) => {
  const w = Math.round(Math.max(textW(g, a, 7), textW(g, b, 6)) + 20), h = 54, top = foot - 116, l = x - w / 2;
  box(g, x - 4, top, 8, foot - top, INK); box(g, x - 3, top, 6, foot - top, '#6B7280'); box(g, x - 3, top, 2, foot - top, '#A8B0BC'); box(g, x + 2, top, 1, foot - top, '#3A3F48');
  box(g, l - 2, top - 2, w + 4, h + 4, INK);
  box(g, l, top, w, h, '#F1EFEA');
  box(g, l, top, w, 18, '#141414');
  g.fillStyle = '#C81E1E'; g.beginPath(); g.ellipse(x, top + 9, 34, 7, 0, 0, Math.PI * 2); g.fill();
  painted(g, 'DANGER', x, top + 13, 7, '#FFFFFF', null);
  painted(g, a, x, top + 31, 7, '#141414', null);
  painted(g, b, x, top + 46, 6, '#141414', null);
  // (rust running from the bolts, a dent)
  for (const bx of [l + 4, l + w - 6]) { box(g, bx, top + 22, 2, 2, '#5A5F68'); for (let k = 0; k < 8; k++) box(g, bx + (k % 2), top + 24 + k * 2, 1, 2, k < 4 ? '#B45A1E' : '#C88A5A'); }
  box(g, l + w - 22, top + h - 10, 12, 4, '#D8D4CC');
  // (a vine climbing the post, round it)
  for (let y = foot; y > top + h; y -= 4) { const sx = Math.sin(y * 0.18) * 6; box(g, x + sx - 1, y, 3, 4, sx > 0 ? LEAF[4] : LEAF[2]); if (y % 12 === 0) leaf(g, x + sx, y, 8, sx > 0 ? -0.3 : Math.PI + 0.3, LEAF, 3); }
  fern(g, x, foot, 26, 3, 0, LEAF, 3);
};

/** The brown scenic sign (routed letters, a binoculars mark), on two square posts. */
const scenicSign = (g: Ctx, x: number, foot: number, a: string, b: string, up: boolean) => {
  const w = Math.round(Math.max(textW(g, a, 7), textW(g, b, 6)) + 52), h = 40, top = foot - 92, l = x - w / 2;
  for (const px of [l + 12, l + w - 20]) { box(g, px - 1, top, 10, foot - top, INK); box(g, px, top, 8, foot - top, '#5A3A20'); box(g, px, top, 2, foot - top, '#7A5634'); }
  poly(g, [[l - 2, top + 4], [l + 4, top - 2], [l + w - 4, top - 2], [l + w + 2, top + 4], [l + w + 2, top + h + 2], [l - 2, top + h + 2]], INK);
  poly(g, [[l, top + 4], [l + 4, top], [l + w - 4, top], [l + w, top + 4], [l + w, top + h], [l, top + h]], '#5E3A1E');
  box(g, l + 3, top + 3, w - 6, 1, '#E8D8B0'); box(g, l + 3, top + h - 4, w - 6, 1, '#E8D8B0');
  box(g, l + 4, top + 1, w - 8, 1, '#8A5E36');
  // (routed: the cut's shadow over its top edge, cream in it)
  const routed = (s: string, cx: number, y: number, size: number) => { painted(g, s, cx, y - 1, size, '#2E1A0C', null); painted(g, s, cx, y, size, '#F2E6C4', null); };
  routed(a, x + 12, top + 18, 7); routed(b, x + 12, top + 32, 6);
  // (the binoculars mark)
  const bx = l + 18, by = top + h / 2;
  for (const s of [-1, 1]) { g.fillStyle = '#F2E6C4'; g.beginPath(); g.arc(bx + s * 5, by + 2, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = '#5E3A1E'; g.beginPath(); g.arc(bx + s * 5, by + 2, 2, 0, Math.PI * 2); g.fill(); }
  box(g, bx - 3, by - 6, 6, 6, '#F2E6C4');
  if (up) { const ax = l + w - 14, ay = top + 12; poly(g, [[ax, ay - 6], [ax + 6, ay + 1], [ax + 2, ay + 1], [ax + 2, ay + 10], [ax - 2, ay + 10], [ax - 2, ay + 1], [ax - 6, ay + 1]], '#F2E6C4'); }
  fern(g, l + 14, foot, 20, 9, 0, LEAF, 3);
};

/** The road sign: a yellow diamond (a jaguar on it), the plaques under it; claw marks through the bottom one. */
const jaguarSign = (g: Ctx, x: number, foot: number, a: string, b: string) => {
  const top = foot - 150;
  box(g, x - 4, top + 20, 8, foot - top - 20, INK); box(g, x - 3, top + 20, 6, foot - top - 20, '#6B7280'); box(g, x - 3, top + 20, 2, foot - top - 20, '#A8B0BC');
  const cy = top + 30, r = 30;
  poly(g, [[x, cy - r - 3], [x + r + 3, cy], [x, cy + r + 3], [x - r - 3, cy]], INK);
  poly(g, [[x, cy - r], [x + r, cy], [x, cy + r], [x - r, cy]], '#F2C21E');
  poly(g, [[x, cy - r + 3], [x + r - 3, cy], [x, cy + r - 3], [x - r + 3, cy]], '#141414');
  poly(g, [[x, cy - r + 5], [x + r - 5, cy], [x, cy + r - 5], [x - r + 5, cy]], '#F2C21E');
  poly(g, [[x - 6, cy - r + 12], [x, cy - r + 6], [x + 6, cy - r + 12]], '#FDE68A');
  // (the cat, leaping)
  g.fillStyle = '#141414';
  g.beginPath(); g.ellipse(x, cy + 2, 13, 5, -0.15, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(x + 13, cy - 2, 5, 4, 0, 0, Math.PI * 2); g.fill();
  box(g, x + 14, cy - 7, 2, 3, '#141414'); box(g, x + 11, cy - 7, 2, 3, '#141414');
  g.lineWidth = 2; g.strokeStyle = '#141414';
  g.beginPath(); g.moveTo(x - 12, cy + 1); g.quadraticCurveTo(x - 20, cy - 6, x - 18, cy - 12); g.stroke();
  for (const [lx, dx] of [[-8, -6], [-4, -2], [6, 6], [10, 9]]) { g.beginPath(); g.moveTo(x + lx, cy + 4); g.lineTo(x + lx + dx * 0.6, cy + 12); g.stroke(); }
  // (the plaques)
  const pw = Math.round(textW(g, a, 6) + 12), py = cy + r + 8;
  box(g, x - pw / 2 - 2, py - 2, pw + 4, 16, INK); box(g, x - pw / 2, py, pw, 12, '#F2C21E'); box(g, x - pw / 2, py, pw, 1, '#FDE68A');
  painted(g, a, x, py + 9, 6, '#141414', null);
  const qw = Math.round(textW(g, b, 6) + 12), qy = py + 18;
  box(g, x - qw / 2 - 2, qy - 2, qw + 4, 16, INK); box(g, x - qw / 2, qy, qw, 12, '#F1EFEA'); box(g, x - qw / 2, qy, qw, 1, '#FFFFFF');
  painted(g, b, x, qy + 9, 6, '#141414', null);
  // (and something's had a go at it)
  for (let k = 0; k < 3; k++) { g.strokeStyle = '#8A8A8A'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 14 + k * 5, qy - 6); g.lineTo(x + 2 + k * 5, qy + 14); g.stroke(); g.strokeStyle = '#FFFFFF'; g.beginPath(); g.moveTo(x - 13 + k * 5, qy - 6); g.lineTo(x + 3 + k * 5, qy + 14); g.stroke(); }
  fern(g, x - 6, foot, 24, 4, 0, LEAF, 3);
};

/** LAST VINES, carved, and screwed to its post under it, the park's lawyers' placard (with the fine print). */
const legalSign = (g: Ctx, x: number, foot: number, a: string, b: string) => {
  woodSign(g, x, foot - 20, a, '', 8, 6, 31);
  // (the posts carry on down to the ground)
  const w = Math.round(textW(g, a, 8) + 26), l = x - w / 2;
  post(g, l + 10, foot - 22, foot, 8); post(g, l + w - 18, foot - 22, foot, 8);
  const pw = Math.round(textW(g, b, 6) + 12), py = foot - 52;
  box(g, x - pw / 2 - 2, py - 2, pw + 4, 26, INK); box(g, x - pw / 2, py, pw, 22, '#F1EFEA'); box(g, x - pw / 2, py, pw, 1, '#FFFFFF');
  painted(g, b, x, py + 9, 6, '#1E293B', null);
  for (let k = 0; k < 3; k++) box(g, x - pw / 2 + 6, py + 13 + k * 3, pw - 12 - (k === 2 ? 30 : 0), 1, '#9CA3AF');
  for (const sx of [x - pw / 2 + 2, x + pw / 2 - 4]) box(g, sx, py + 2, 2, 2, '#6B7280');
};

/** The gate in: a bamboo frame, a thatch cap, the carved board hung under it. */
export const gateSign = (g: Ctx, x: number, foot: number, a: string, b: string) => {
  const top = foot - 150;
  bamboo(g, x - 112, top, foot - top, 9); bamboo(g, x + 103, top, foot - top, 9);
  bamboo(g, x - 126, top, 252, 8, true);
  // (a peaked thatch cap over the crossbar: straw in rows, the eaves ragged; a peak, so nothing up there to stand on)
  poly(g, [[x - 136, top + 6], [x, top - 36], [x + 136, top + 6]], INK);
  for (let row = 0; row < 4; row++) {
    const y0 = top - 34 + row * 10, hw = 20 + row * 36;
    poly(g, [[x - hw, y0], [x + hw, y0], [x + hw + 30, y0 + 12], [x - hw - 30, y0 + 12]], ['#6E5424', '#806228', '#8E6E2E', '#9A7A34'][row]);
    for (let k = -hw - 26; k < hw + 26; k += 3) box(g, x + k, y0 + 6 + (k & 2), 1, 6, '#5A4418');
  }
  for (let k = -134; k < 134; k += 4) box(g, x + k, top + 6, 2, 3 + ((k * 7) & 3), '#6E5424');
  // (the board hung on ropes)
  const w = Math.round(textW(g, a, 10) + 40), l = x - w / 2, by = top + 20;
  for (const rx of [l + 14, l + w - 14]) { box(g, rx, top + 6, 2, 16, '#C8A86A'); box(g, rx + 1, top + 6, 1, 16, '#7A6236'); }
  plank(g, l, by, w, 22, '#8A6038', 41);
  plank(g, l + 10, by + 23, w - 20, 16, '#6E4C2C', 42);
  carved(g, a, x, by + 16, 10);
  carved(g, b, x, by + 35, 7);
  // (tiki faces carved in the posts)
  for (const px of [x - 108, x + 107]) { box(g, px - 6, top + 40, 12, 22, '#5E432A'); box(g, px - 4, top + 44, 3, 3, INK); box(g, px + 1, top + 44, 3, 3, INK); box(g, px - 4, top + 54, 8, 4, INK); box(g, px - 3, top + 55, 6, 2, '#F2E6C4'); box(g, px - 6, top + 40, 12, 1, '#86653E'); }
  fern(g, x - 118, foot, 30, 7, 0, LEAF, 3); fern(g, x + 112, foot, 30, 8, 0, LEAF, 3);
};

/** The way out: an arch over the path (bamboo bundles, a thatched roof), lanterns, the arrow sign on its own post. */
const exitArch = (g: Ctx, x: number, foot: number, a: string, b: string) => {
  const top = foot - 196, l = x - 124, r = x + 116;
  for (const px of [l, r]) { bamboo(g, px, top, foot - top, 8); bamboo(g, px + 7, top + 8, foot - top - 8, 7); lashing(g, px + 7, top + 40, 18, 3); lashing(g, px + 7, foot - 50, 18, 3); }
  bamboo(g, l - 14, top + 6, r - l + 36, 9, true);
  // (the roof: thatch, sloped, eaves hanging ragged)
  poly(g, [[l - 30, top + 8], [x - 4, top - 44], [r + 38, top + 8]], INK);
  for (let row = 0; row < 5; row++) {
    const k = row / 5, y0 = top - 42 + row * 10;
    const hw = 30 + k * 150;
    poly(g, [[x - 4 - hw, y0 + 10], [x - 4 + hw, y0 + 10], [x - 4 + hw + 12, y0 + 18], [x - 4 - hw - 12, y0 + 18]], ['#7A5E26', '#8A6E2E', '#9A7C34', '#A4863A', '#B0923E'][row]);
    for (let k2 = -hw; k2 < hw; k2 += 3) box(g, x - 4 + k2, y0 + 13 + (k2 & 2), 1, 6, '#5E4818');
  }
  for (let k = l - 26; k < r + 36; k += 4) box(g, k, top + 6, 2, 4 + ((k * 7) % 6), '#8A6E2E');
  // (the board, hung under the beam)
  const w = Math.round(textW(g, a, 10) + 36), bl = x - w / 2;
  for (const rx of [bl + 12, bl + w - 12]) box(g, rx, top + 14, 2, 10, '#C8A86A');
  plank(g, bl, top + 22, w, 24, '#8A6038', 51);
  carved(g, a, x, top + 39, 10);
  // (a boat's oar crossed under it, and a life ring: it's the Jungle Cruise)
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(bl - 20, top + 60); g.lineTo(bl + 30, top + 26); g.stroke();
  g.strokeStyle = '#B08A5C'; g.lineWidth = 2; g.beginPath(); g.moveTo(bl - 20, top + 60); g.lineTo(bl + 30, top + 26); g.stroke();
  g.fillStyle = INK; g.beginPath(); g.arc(bl + w + 18, top + 40, 12, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#F1EFEA'; g.beginPath(); g.arc(bl + w + 18, top + 40, 11, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 4; i++) { g.fillStyle = '#C81E1E'; g.beginPath(); g.moveTo(bl + w + 18, top + 40); g.arc(bl + w + 18, top + 40, 11, i * Math.PI / 2, i * Math.PI / 2 + 0.6); g.fill(); }
  g.fillStyle = mix(BARK[2], '#000000', 0.2); g.beginPath(); g.arc(bl + w + 18, top + 40, 5, 0, Math.PI * 2); g.fill();
  // (the arrow sign, on its own post: this way)
  const ax = r + 70, ay = foot - 74, aw = Math.round(textW(g, b, 7) + 26);
  post(g, ax + aw / 2 - 4, ay, foot, 8);
  poly(g, [[ax - 2, ay - 2], [ax + aw - 2, ay - 2], [ax + aw + 12, ay + 9], [ax + aw - 2, ay + 20], [ax - 2, ay + 20]], INK);
  poly(g, [[ax, ay], [ax + aw - 2, ay], [ax + aw + 9, ay + 9], [ax + aw - 2, ay + 18], [ax, ay + 18]], '#8A6038');
  box(g, ax, ay, aw - 2, 2, '#B08A5C');
  carved(g, b.replace(/\s*>$/, ''), ax + aw / 2, ay + 13, 7);
};

const signPainter: Record<SignStyle, (g: Ctx, x: number, foot: number, a: string, b: string, i: number) => void> = {
  gate: (g, x, f, a, b) => gateSign(g, x, f, a, b),
  wood: (g, x, f, a, b, i) => woodSign(g, x, f, a, b, 8, 7, i * 7),
  monkey: (g, x, f, a, b, i) => { woodSign(g, x, f, a, b, 7, 7, i * 7, (ix, iy) => monkeyIcon(g, ix, iy)); peels(g, x + 34, f); },
  warn: (g, x, f, a, b) => warnSign(g, x, f, a, b),
  scenic: (g, x, f, a, b) => scenicSign(g, x, f, a, b, b.includes('UP')),
  jaguar: (g, x, f, a, b) => jaguarSign(g, x, f, a, b),
  legal: (g, x, f, a, b) => legalSign(g, x, f, a, b),
  exit: (g, x, f, a, b) => exitArch(g, x, f, a, b),
};

export const drawSigns = (c: Ctx, v: View) => {
  SIGNS.forEach(([rx, h, a, b, style], i) => {
    const x = X(rx), foot = Y(h);
    if (x < v.v0 - 300 || x > v.v1 + 300) return;
    stamp(c, `jg-sign-${i}`, x - 260, foot - 270, 620, 280, g => signPainter[style](g, x, foot, a, b, i));
  });
  exitLive(c, v);
};

// ---------------------------------------------------------------------------------------------------------------
// The way out, live: the torches, the lanterns; and the park through the gap in the trees (far back, drawn first)

const EXIT = SIGNS.find(s => s[4] === 'exit')!;
const exitX = X(EXIT[0]);
const TORCHES = [exitX - 160, exitX + 150];
const LANTERNS = [exitX - 120, exitX + 122];

const flame = (c: Ctx, x: number, y: number, f: number, s = 1) => {
  const k = (f >> 2) % 4;
  const hgt = [14, 17, 15, 18][k] * s;
  poly(c, [[x - 6 * s, y], [x - 4 * s, y - hgt * 0.6], [x + ([1, -1, 2, 0][k]) * s, y - hgt], [x + 4 * s, y - hgt * 0.5], [x + 6 * s, y]], '#C2410C');
  poly(c, [[x - 4 * s, y], [x - 2 * s, y - hgt * 0.5], [x + ([0, -1, 1, 0][k]) * s, y - hgt * 0.75], [x + 3 * s, y - hgt * 0.4], [x + 4 * s, y]], '#F59E0B');
  poly(c, [[x - 2 * s, y], [x, y - hgt * 0.4], [x + 2 * s, y]], '#FDE68A');
};

const exitLive = (c: Ctx, v: View) => {
  if (exitX < v.v0 - 400 || exitX > v.v1 + 400) return;
  const f = v.f, lamps = timeOfDay().lamps;
  for (const tx of TORCHES) {
    bamboo(c, tx - 3, GY - 70, 70, 6);
    box(c, tx - 7, GY - 80, 14, 12, INK); box(c, tx - 6, GY - 79, 12, 10, '#6A4A22'); box(c, tx - 6, GY - 79, 12, 2, '#8A6A3A');
    if (lamps > 0.05) steppedGlow(c, tx, GY - 90, 44, '#FFB04A', 0.22 * lamps, 0, 4);
    flame(c, tx, GY - 79, f + tx);
  }
  for (const lx of LANTERNS) {
    const sw = Math.round(Math.sin(f * 0.04 + lx) * 2);
    box(c, lx + sw, GY - 186, 1, 14, '#2A1A0C');
    box(c, lx - 5 + sw, GY - 172, 11, 14, INK); box(c, lx - 4 + sw, GY - 171, 9, 12, lamps > 0.05 ? '#FFE08A' : '#C8A060'); box(c, lx - 4 + sw, GY - 171, 9, 2, '#3A2A14'); box(c, lx - 4 + sw, GY - 161, 9, 2, '#3A2A14');
    if (lamps > 0.05) steppedGlow(c, lx + sw, GY - 165, 26, '#FFD27A', 0.2 * lamps, 0, 3);
  }
};

/** The park through the gap at the end: the sky, the Jungle Cruise's dock shed, bunting, the river; jungle round it. */
export const drawExitView = (c: Ctx, v: View) => {
  if (exitX < v.v0 - 900 || exitX > v.v1 + 900) return;
  const tod = timeOfDay(), d = 0.55;
  atDepth(c, v.eye, d, () => {
    const x0 = X(11780), x1 = X(12500), top = Y(560);
    stamp(c, `jg-exitview-${tod.key}`, x0 - 160, top - 140, x1 - x0 + 320, GY - top + 260, g => {
      g.save(); g.beginPath(); g.ellipse((x0 + x1) / 2, GY - 40, (x1 - x0) / 2, GY - top, 0, Math.PI, 0); g.lineTo(x1, GY + 100); g.lineTo(x0, GY + 100); g.closePath(); g.clip();
      bandedGradient(g, x0, top, x1 - x0, GY - top, skyRamp(['#8DB4E2', '#B4CEE6', '#DCE6E4'], tod, 0.4, 1), 8);
      // (the river, the far bank)
      const fh = (col: string) => mix(farTint(col, 0.8, tod), skyAt(0.9, tod), 0.2);
      box(g, x0, GY - 60, x1 - x0, 60, fh('#3E7A6A')); box(g, x0, GY - 60, x1 - x0, 3, fh('#9ACFC0'));
      for (let k = 0; k < 12; k++) box(g, x0 + hash(k) * (x1 - x0), GY - 52 + hash(k * 2) * 40, 18, 1, fh('#BCE4D8'));
      box(g, x0, GY - 80, x1 - x0, 20, fh('#3E6E2E'));
      // (the dock shed: thatch, posts, a sign)
      const sx = (x0 + x1) / 2 - 70;
      for (const px of [sx, sx + 46, sx + 92, sx + 136]) box(g, px, GY - 150, 6, 90, fh('#6A4A28'));
      poly(g, [[sx - 26, GY - 146], [sx + 70, GY - 200], [sx + 168, GY - 146]], fh('#A4863A'));
      for (let k = 0; k < 6; k++) box(g, sx - 20 + k * 32, GY - 146, 26, 3, fh('#7A6026'));
      box(g, sx + 30, GY - 140, 82, 16, fh('#F2E6C4')); box(g, sx + 32, GY - 138, 78, 12, fh('#2E5A3A'));
      painted(g, 'JUNGLE CRUISE', sx + 71, GY - 129, 5, fh('#F2E6C4'), null);
      // (a boat at the dock, its striped canopy)
      box(g, sx + 10, GY - 74, 120, 12, fh('#E8E0C8')); box(g, sx + 10, GY - 64, 120, 4, fh('#8A3A1E'));
      for (let k = 0; k < 8; k++) box(g, sx + 14 + k * 14, GY - 96, 14, 6, fh(k % 2 ? '#F1EFEA' : '#2E7A4A'));
      for (const px of [sx + 16, sx + 120]) box(g, px, GY - 90, 2, 16, fh('#6A4A28'));
      // (bunting across)
      for (let k = 0; k < 14; k++) { const bx = x0 + 40 + k * ((x1 - x0 - 80) / 14), by = top + 90 + Math.sin((k / 13) * Math.PI) * 26; poly(g, [[bx, by], [bx + 14, by], [bx + 7, by + 10]], fh(['#C81E1E', '#F2C21E', '#2E7A4A', '#1E5AA8'][k % 4])); }
      g.restore();
      // (the jungle round the gap)
      for (let i = 0; i < 16; i++) { const a = Math.PI + (i / 15) * Math.PI; clump(g, (x0 + x1) / 2 + Math.cos(a) * (x1 - x0) / 2, GY - 40 + Math.sin(a) * (GY - top), 54, 40, i * 3 + 70, LEAF.map(col => mix(farTint(col, 0.6, tod), skyAt(0.9, tod), 0.2)), 1); }
    });
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The park showing through: the sprinkler, the speaker rocks, the viewer on the overlook

const SPRINKLER = X(1640);
const SPEAKERS = [{ x: X(4580), y: GY }, { x: X(6340), y: Y(460) }];
const VIEWER = { x: X(6760), y: Y(460) };

const sprinkler = (c: Ctx, f: number) => {
  const cyc = f % 1100, on = cyc < 260, up = on ? Math.min(6, cyc) : Math.max(0, 6 - (cyc - 260));
  const x = SPRINKLER, y = GY;
  // (the head, flush with the ground till it pops up)
  box(c, x - 6, y - 2, 12, 3, INK); box(c, x - 5, y - 2, 10, 2, '#2A2A30');
  if (up > 0) { box(c, x - 3, y - 2 - up, 6, up, INK); box(c, x - 2, y - 2 - up, 4, up, '#3A3F48'); box(c, x - 2, y - 2 - up, 1, up, '#6B7280'); }
  if (!on || cyc < 8) return;
  // (spraying: a fan of drops sweeping back and forth, arcs of them, a mist)
  const sweep = Math.sin(cyc * 0.05) * 0.8;
  for (let j = 0; j < 22; j++) {
    const t = ((cyc * 0.02 + j / 22) % 1), a = -Math.PI / 2 + sweep + (hash(j) - 0.5) * 0.5;
    const sp = 5 + hash(j * 2) * 2, px = x + Math.cos(a) * sp * t * 26, py = y - 8 + Math.sin(a) * sp * t * 26 + t * t * 120;
    if (py > GY) continue;
    box(c, px, py, 2, 3, j % 3 ? 'rgba(200, 230, 255, 0.7)' : 'rgba(255, 255, 255, 0.85)');
  }
  c.fillStyle = 'rgba(220, 240, 255, 0.08)'; c.beginPath(); c.ellipse(x + sweep * 40, GY - 40, 60, 34, 0, 0, Math.PI * 2); c.fill();
};

const speakerRock = (c: Ctx, x: number, y: number, f: number, i: number) => {
  stamp(c, `jg-speaker-${i}`, x - 34, y - 46, 70, 50, g => {
    poly(g, [[x - 30, y + 1], [x - 26, y - 22], [x - 10, y - 34], [x + 12, y - 32], [x + 28, y - 16], [x + 32, y + 1]], INK);
    poly(g, [[x - 28, y], [x - 24, y - 21], [x - 10, y - 32], [x + 11, y - 30], [x + 26, y - 15], [x + 30, y]], ROCK[3]);
    poly(g, [[x - 24, y - 21], [x - 10, y - 32], [x + 11, y - 30], [x + 4, y - 24], [x - 16, y - 18]], ROCK[5]);
    poly(g, [[x + 26, y - 15], [x + 30, y], [x + 10, y], [x + 14, y - 12]], ROCK[2]);
    // (the seam where it's fiberglass, and the grille in it)
    box(g, x - 2, y - 30, 1, 30, ROCK[1]);
    box(g, x - 16, y - 18, 18, 14, INK); box(g, x - 15, y - 17, 16, 12, '#2A2C30');
    for (let k = 0; k < 4; k++) box(g, x - 14, y - 15 + k * 3, 14, 1, '#4A4E56');
    box(g, x - 15, y - 17, 16, 1, ROCK[4]);
    // (moss over it, to sell it)
    box(g, x - 22, y - 22, 20, 3, MOSS[3]); box(g, x - 20, y - 23, 12, 1, MOSS[5]);
    fern(g, x + 22, y, 18, i + 40, 0, LEAF, 3);
  });
  // (the jungle noises coming out of it: rings, stepping out; a bird's tweet now and then)
  const t = (f + i * 50) % 90;
  for (let k = 0; k < 3; k++) {
    const r = 8 + ((t + k * 30) % 90) * 0.5, a = 0.35 * (1 - ((t + k * 30) % 90) / 90);
    c.strokeStyle = `rgba(230, 240, 200, ${a.toFixed(3)})`; c.lineWidth = 2;
    c.beginPath(); c.arc(x - 7, y - 11, r, -Math.PI * 0.85, -Math.PI * 0.15); c.stroke();
  }
};

const viewer = (c: Ctx, f: number) => {
  const { x, y } = VIEWER;
  stamp(c, 'jg-viewer', x - 30, y - 90, 60, 94, g => {
    // (the post, the coin box, the head with its eyepieces, the hood)
    box(g, x - 4, y - 50, 8, 50, INK); box(g, x - 3, y - 50, 6, 50, '#3E6A4A'); box(g, x - 3, y - 50, 2, 50, '#5E8A6A');
    box(g, x - 14, y - 4, 28, 5, INK); box(g, x - 13, y - 4, 26, 4, '#2E5A3A');
    box(g, x - 10, y - 62, 20, 14, INK); box(g, x - 9, y - 61, 18, 12, '#3E6A4A'); box(g, x - 9, y - 61, 18, 2, '#7EAA8A');
    box(g, x - 2, y - 58, 4, 1, '#141414'); box(g, x + 3, y - 54, 4, 4, '#C0C4CC');
    box(g, x - 18, y - 80, 32, 18, INK); box(g, x - 17, y - 79, 30, 16, '#3E6A4A'); box(g, x - 17, y - 79, 30, 3, '#7EAA8A');
    for (const ex of [x + 8, x + 8]) { box(g, ex, y - 77, 8, 6, INK); box(g, ex + 1, y - 76, 6, 4, '#1E2A22'); }
    box(g, x + 8, y - 70, 8, 6, INK); box(g, x + 9, y - 69, 6, 4, '#1E2A22');
    box(g, x - 22, y - 76, 6, 10, INK); box(g, x - 21, y - 75, 4, 8, '#2E5A3A');
  });
  // (the lenses catch the light, now and then)
  if ((f >> 4) % 9 === 0) box(c, x + 11, y - 76, 2, 1, '#FFFFFF');
};

export const drawProps = (c: Ctx, v: View) => {
  const f = v.f;
  if (SPRINKLER > v.v0 - 100 && SPRINKLER < v.v1 + 100) sprinkler(c, f);
  SPEAKERS.forEach((s, i) => { if (s.x > v.v0 - 60 && s.x < v.v1 + 60) speakerRock(c, s.x, s.y, f, i); });
  if (VIEWER.x > v.v0 - 60 && VIEWER.x < v.v1 + 60) viewer(c, f);
};

// ---------------------------------------------------------------------------------------------------------------
// Life: fireflies after dark, morphos by day

export const drawLife = (c: Ctx, v: View) => {
  const tod = timeOfDay(), f = v.f, cell = 180;
  const night = Math.max(0, Math.min(1, (tod.lamps - 0.1) / 0.6));
  for (let cx = Math.floor(v.v0 / cell); cx * cell < v.v1; cx++) {
    if (night > 0) for (let k = 0; k < 2; k++) {
      const s = cx * 7.3 + k * 1.9;
      const x = cx * cell + hash(s) * cell + Math.sin(f * 0.013 + s) * 22, y = GY - 24 - hash(s * 2) * 220 + Math.cos(f * 0.017 + s * 3) * 14;
      const ph = (f + Math.floor(hash(s * 5) * 400)) % 400;
      if (ph > 220) continue;
      const a = night * (ph < 30 ? ph / 30 : ph > 190 ? (220 - ph) / 30 : 1);
      c.fillStyle = `rgba(200, 255, 120, ${(0.22 * a).toFixed(3)})`; c.fillRect(Math.round(x) - 3, Math.round(y) - 3, 8, 8);
      c.fillStyle = `rgba(232, 255, 154, ${a.toFixed(3)})`; c.fillRect(Math.round(x), Math.round(y), 2, 2);
    }
    // (a blue morpho, now and then, flapping along)
    if (night < 0.5 && hash(cx * 3.1) > 0.72) {
      const s = cx * 4.7, x = cx * cell + ((f * 0.6 + hash(s) * 300) % 300) - 60, y = GY - 120 - hash(s * 3) * 160 + Math.sin(f * 0.07 + s) * 18;
      const up = (f >> 3) % 2;
      c.fillStyle = INK; c.fillRect(Math.round(x), Math.round(y) - 1, 2, 4);
      const wc = up ? '#3B82F6' : '#1D4ED8';
      if (up) { box(c, x - 6, y - 6, 6, 5, wc); box(c, x + 2, y - 6, 6, 5, wc); box(c, x - 5, y - 6, 2, 1, '#93C5FD'); }
      else { box(c, x - 7, y, 7, 3, wc); box(c, x + 2, y, 7, 3, wc); }
    }
  }
};

/** The night's lights: the torches and lanterns at the way out, the lamp over the cast door. */
export const jungleLamps = (): Light[] => {
  const d = doorLamp();
  return [
    ...TORCHES.map(x => ({ x, y: GY - 90, r: 150, a: 0.85, color: '#FFB04A' })),
    ...LANTERNS.map(x => ({ x, y: GY - 165, r: 90, a: 0.6, color: '#FFD27A' })),
    { x: d.x, y: d.y, r: 110, a: 0.7, color: '#FFECAA' },
  ];
};

void BARK; void post;
