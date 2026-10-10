// The tour launch: Safari Artie's boat (the river's, and the one waiting at the end of the queue's dock). A proper
// Jungle Cruise boat: a white hull with a green boot stripe, her name on the bow, life rings hung on the side, a
// striped awning on poles with a scalloped valance, benches, the skipper's wheel up front, an outboard on the back.
// Its left end at x, its deck at `deck` (what's stood on: the lit gunwale), `w` long; the bow's the right end.

import { type Ctx, INK, rampOf, box, checker, PIX, dark, lite, text, bamboo } from '../queue/depth';
import { timeOfDay } from '../../timeOfDay';

const HULL = '#E8E2D2', BOOT = '#2F6A3A', RED = '#A8322A', TEAK = '#9A6A3A', STRIPE_A = '#2F7A44', STRIPE_B = '#EDE4C8';

/** The hull's outline: the bow raked up, the stern square. */
const hullPath = (c: Ctx, x: number, d: number, w: number, depth: number) => {
  c.beginPath(); c.moveTo(x - 10, d); c.lineTo(x + w + 18, d - 4); c.lineTo(x + w - 8, d + depth); c.lineTo(x + 6, d + depth); c.lineTo(x - 10, d + 6); c.closePath();
};

export const drawLaunch = (c: Ctx, x: number, d: number, f: number, opts: { w?: number; name?: boolean; rock?: number; dry?: boolean } = {}) => {
  const w = opts.w ?? 240, depth = 34;
  x = Math.round(x); d = Math.round(d + (opts.rock ?? 0));
  const hr = rampOf(HULL), tr = rampOf(TEAK);
  // The far side (over the deck, seen from a little above): its gunwale, the benches along it
  box(c, x - 4, d - 12, w + 14, 4, INK); box(c, x - 3, d - 11, w + 12, 2, tr[1]);
  box(c, x + 2, d - 9, w + 4, 9, dark(HULL, 0.45));
  for (const bx of [x + 22, x + 96]) { box(c, bx - 1, d - 8, 64, 5, INK); box(c, bx, d - 7, 62, 3, tr[2]); box(c, bx, d - 7, 62, 1, tr[4]); }
  // The awning's poles (behind: the far ones; the near ones go in front of the awning's back)
  const poles = [x + 4, x + w / 2 - 4, x + w - 30];
  for (const px of poles) bamboo(c, px + 3, d - 118, d - 8, 3, '#B8BCC4');
  // The skipper's wheel up front, on its pedestal
  {
    const wx = x + w - 18, wy = d - 30;
    box(c, wx - 5, wy + 4, 10, 26, INK); box(c, wx - 4, wy + 4, 8, 26, tr[2]); box(c, wx - 4, wy + 4, 3, 26, tr[3]);
    const a0 = f * 0.0;
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.arc(wx, wy, 9, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = tr[3]; c.lineWidth = 2; c.beginPath(); c.arc(wx, wy, 9, 0, Math.PI * 2); c.stroke();
    for (let k = 0; k < 8; k++) { const a = a0 + (k * Math.PI) / 4; box(c, wx + Math.cos(a) * 12 - 1, wy + Math.sin(a) * 12 - 1, 3, 3, tr[3]); }
    c.strokeStyle = tr[1]; c.lineWidth = 1; c.beginPath(); for (let k = 0; k < 4; k++) { const a = (k * Math.PI) / 4; c.moveTo(wx + Math.cos(a) * 9, wy + Math.sin(a) * 9); c.lineTo(wx - Math.cos(a) * 9, wy - Math.sin(a) * 9); } c.stroke();
    box(c, wx - 2, wy - 2, 4, 4, '#D4A82A');
  }
  // The awning: striped canvas, its top seen just from under (dim: not somewhere to stand), a scalloped valance
  {
    const top = d - 128, ax0 = x - 6, ax1 = x + w + 2;
    box(c, ax0 - 1, top - 1, ax1 - ax0 + 2, 12, INK);
    for (let k = ax0; k < ax1; k += 12) {
      const col = ((k - ax0) / 12) % 2 ? STRIPE_B : STRIPE_A, r = rampOf(col);
      box(c, k, top, Math.min(12, ax1 - k), 10, r[1]);
      box(c, k, top + 6, Math.min(12, ax1 - k), 4, r[2]);
      // (the valance: a scallop under each stripe)
      c.fillStyle = INK; c.beginPath(); c.arc(k + 6, top + 10, 7, 0, Math.PI); c.fill();
      c.fillStyle = r[2]; c.beginPath(); c.arc(k + 6, top + 10, 6, 0, Math.PI); c.fill();
      box(c, k + 2, top + 11, 3, 2, r[3]);
    }
    box(c, ax0, top + 9, ax1 - ax0, 2, '#C8A23A');
    // (the pennant up on the front pole, flapping)
    const fx = x + w - 28, fy = top - 22;
    box(c, fx, fy, 2, 22, '#8A8E96');
    for (let k = 0; k < 16; k += 2) { const wv = Math.round(Math.sin(f * 0.15 + k * 0.4) * 1.5); box(c, fx + 2 + k, fy + 1 + wv + k * 0.25, 2, Math.max(1, 8 - k * 0.5), k < 6 ? RED : lite(RED, 0.1)); }
    // (a lantern on a hook under it: lit as the day goes)
    const lx = x + w / 2 + 34, ly = top + 16, lamps = timeOfDay().lamps;
    box(c, lx, ly, 1, 6, INK);
    box(c, lx - 4, ly + 6, 9, 11, INK); box(c, lx - 3, ly + 7, 7, 9, lamps > 0.2 ? '#FFD27A' : '#C8B488'); box(c, lx - 3, ly + 7, 7, 2, '#3A3A3A'); box(c, lx - 1, ly + 10, 3, 4, lamps > 0.2 ? '#FFF4C0' : '#E8D8A8');
  }
  // The hull, its near side: white, a green boot stripe, red at the waterline, the rubrail along the top
  c.fillStyle = INK; hullPath(c, x - 1, d - 1, w + 2, depth + 2); c.fill();
  c.save(); hullPath(c, x, d, w, depth); c.clip();
  box(c, x - 14, d, w + 36, depth + 4, hr[2]);
  box(c, x - 14, d, w + 36, 6, hr[3]); checker(c, x - 14, d + 6, w + 36, PIX, hr[3]);
  box(c, x - 14, d + 18, w + 36, 7, BOOT); box(c, x - 14, d + 18, w + 36, 1, lite(BOOT, 0.3));
  box(c, x - 14, d + 25, w + 36, 12, RED); box(c, x - 14, d + 25, w + 36, 2, lite(RED, 0.2));
  box(c, x - 14, d + depth - 6, w + 36, 6, dark(RED, 0.3));
  // (the planks' seams, faint)
  for (let k = 8; k < 18; k += 5) box(c, x - 14, d + k, w + 36, 1, hr[1]);
  c.restore();
  // (the rubrail: teak, lit along its top: the lip he stands on)
  box(c, x - 10, d - 1, w + 28, 5, INK); box(c, x - 9, d, w + 26, 3, tr[2]); box(c, x - 9, d, w + 26, 1, tr[4]);
  // Her name on the bow, her number on the stern
  if (opts.name !== false) {
    text(c, 'AFRICAN QUEASY', x + w - 66, d + 15, '#1F3A26', 5, 'center', null);
    text(c, 'No.7', x + 22, d + 15, '#1F3A26', 5, 'center', null);
  }
  // Life rings, hung on the side
  for (const rx of [x + 46, x + 106]) {
    c.fillStyle = INK; c.beginPath(); c.arc(rx, d + 10, 9, 0, Math.PI * 2); c.fill();
    for (let k = 0; k < 8; k++) { c.fillStyle = k % 2 ? '#F4F0E6' : '#D2402E'; c.beginPath(); c.moveTo(rx, d + 10); c.arc(rx, d + 10, 8, (k * Math.PI) / 4, ((k + 1) * Math.PI) / 4); c.fill(); }
    c.fillStyle = dark(HULL, 0.3); c.beginPath(); c.arc(rx, d + 10, 4, 0, Math.PI * 2); c.fill();
    box(c, rx - 5, d + 3, 3, 2, '#FFFFFF');
    box(c, rx - 1, d - 2, 2, 4, '#8A6A3A');
  }
  // The outboard on the back: a gray cowl, its shaft down into the water
  {
    const ex = x - 30, ey = d - 18;
    box(c, ex + 9, ey + 22, 6, 30, INK); box(c, ex + 10, ey + 22, 4, 30, '#5A5E66');
    box(c, ex - 1, ey - 1, 24, 26, INK);
    const er = rampOf('#6A6E78');
    box(c, ex, ey, 22, 24, er[2]); box(c, ex, ey, 22, 5, er[3]); box(c, ex, ey, 4, 24, er[3]); box(c, ex + 18, ey, 4, 24, er[1]); box(c, ex, ey + 20, 22, 4, er[1]);
    box(c, ex + 4, ey + 9, 14, 4, '#C8322A'); box(c, ex, ey, 22, 1, er[4]);
    // (out of gas: the low-fuel light on its cowl, blinking red, and its little E plate)
    if (opts.dry) {
      box(c, ex + 6, ey + 15, 10, 5, INK); box(c, ex + 7, ey + 16, 3, 3, (f >> 4) % 2 ? '#FF3030' : '#5A1010');
      box(c, ex + 11, ey + 16, 1, 3, '#E8E8E8'); box(c, ex + 11, ey + 16, 3, 1, '#E8E8E8'); box(c, ex + 11, ey + 17, 2, 1, '#E8E8E8'); box(c, ex + 11, ey + 18, 3, 1, '#E8E8E8');
      if ((f >> 4) % 2) { c.fillStyle = 'rgba(255, 48, 48, 0.25)'; c.fillRect(ex + 4, ey + 13, 8, 9); }
    }
  }
};
