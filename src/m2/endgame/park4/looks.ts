// Stitched up the way he died, on the boss's own figure (the owner: "all bosses are stiched together in a different way
// depending on how they died"). Each land's boss art calls hook.ts stitchOver right after it draws his body and his
// head, in that part's own frame (so the seams turn, lean and bob with him); this paints the refight's look there.
// The look's the save's kill record (or the cheats build's picker): refightOn().look. Looks only: never the fight.
//
// Every part's frame is that boss's own (his art's numbers, noted per boss): +x is the way he faces. All of it small
// vector work (a few seams, staples, patches a part), nothing read back, nothing per pixel.

import { setStitch, type StitchPart } from './hook';

type Ctx = CanvasRenderingContext2D;
const INK = '#120A08';

// ---------------------------------------------------------------------------------------------------------------
// The kit (in the part's frame, its own units)

/** A sewn seam along `pts`: the cut (dark), the thread crossing it every `step`. */
export const seam = (c: Ctx, pts: number[], thread: string, step = 2.6, w = 1) => {
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.strokeStyle = INK; c.lineWidth = w * 1.1; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.stroke();
  c.strokeStyle = thread; c.lineWidth = w * 0.6; c.beginPath();
  for (let i = 0; i + 3 < pts.length; i += 2) {
    const x0 = pts[i], y0 = pts[i + 1], x1 = pts[i + 2], y1 = pts[i + 3], len = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.floor(len / step));
    const nx = (-(y1 - y0) / (len || 1)) * 1.6 * w, ny = ((x1 - x0) / (len || 1)) * 1.6 * w;
    for (let k = 0; k <= n; k++) { const t = k / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t; c.moveTo(x - nx - 0.4, y - ny); c.lineTo(x + nx + 0.4, y + ny); }
  }
  c.stroke();
};
/** A staple, across (x, y), turned `a`. */
export const staple = (c: Ctx, x: number, y: number, a = 0, s = 1) => {
  c.save(); c.translate(x, y); c.rotate(a);
  c.fillStyle = INK; c.fillRect(-2.4 * s, -0.9 * s, 4.8 * s, 1.8 * s);
  c.fillStyle = '#C8CCD4'; c.fillRect(-2 * s, -0.5 * s, 4 * s, 0.9 * s); c.fillStyle = '#6A6E78'; c.fillRect(-2 * s, -0.5 * s, 0.7 * s, 1.6 * s); c.fillRect(1.3 * s, -0.5 * s, 0.7 * s, 1.6 * s);
  c.restore();
};
/** A patch of something else (`pts`: its outline), sewn round. */
export const patch = (c: Ctx, pts: number[], fill: string, thread: string, hi?: string, step = 2.6) => {
  c.fillStyle = fill; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.fill();
  if (hi) { c.fillStyle = hi; c.beginPath(); c.moveTo(pts[0], pts[1]); c.lineTo(pts[2], pts[3]); c.lineTo((pts[0] + pts[2] + pts[4]) / 3, (pts[1] + pts[3] + pts[5]) / 3); c.closePath(); c.fill(); }
  seam(c, [...pts, pts[0], pts[1]], thread, step);
};
/** A hole sewn shut: the dark of it, a cross stitched over. */
export const holeX = (c: Ctx, x: number, y: number, thread: string, r = 1.4) => {
  c.fillStyle = INK; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#3A0A08'; c.beginPath(); c.arc(x - 0.3, y - 0.3, r * 0.6, 0, Math.PI * 2); c.fill();
  c.strokeStyle = thread; c.lineWidth = 0.6; c.beginPath(); c.moveTo(x - r * 1.8, y - r * 1.4); c.lineTo(x + r * 1.8, y + r * 1.4); c.moveTo(x - r * 1.8, y + r * 1.4); c.lineTo(x + r * 1.8, y - r * 1.4); c.stroke();
};
/** A blot of something soaked in (`a` its strength), stepped (two rings). */
export const blot = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string, a = 0.5) => {
  c.save(); c.globalAlpha = a * 0.6; c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill();
  c.globalAlpha = a; c.beginPath(); c.ellipse(x - rx * 0.1, y + ry * 0.1, rx * 0.65, ry * 0.65, 0, 0, Math.PI * 2); c.fill(); c.restore();
};
/** A drip down from (x, y), `len` long. */
export const drip = (c: Ctx, x: number, y: number, len: number, col: string, hi?: string) => {
  c.fillStyle = col; c.fillRect(x - 0.6, y, 1.2, len); c.fillRect(x - 1, y + len - 1, 2, 1.6);
  if (hi) { c.fillStyle = hi; c.fillRect(x - 0.6, y, 0.5, len * 0.7); }
};

// ---------------------------------------------------------------------------------------------------------------
// Per boss: (look, part) -> the paint. Frames noted each.

type Paint = (c: Ctx, look: string) => void;
const BOSSES: Record<string, Partial<Record<StitchPart, Paint>>> = {};

// STUNTMAN STEVE (hollywood/stunt/steve.ts): body in his feet frame (torso x -13..18.6, y -70..-37, his back at -x);
// head about its middle (skull x -12..12, y -14..14, his face +x).
//   normal: MISSED THE MAT (head first, folded): his neck seamed right round where it was turned back the right way, the
//           crown of his skull stapled shut, his spine seamed down his back where it folded.
//   weakness: STRUCK TO ASH (lightning): glued back together out of the ash: gray patches on his face and his suit, the
//           glue run out of the seams in yellow drips.
const ASH = '#7A7470', ASH_HI = '#A8A29E', GLUE = '#E8C860', GLUE_D = '#9A7A20';
BOSSES.hollywood = {
  body: (c, look) => {
    if (look === 'weakness') {
      patch(c, [2, -66, 10, -64, 12, -56, 4, -54], ASH, '#2A2624', ASH_HI);
      patch(c, [-12, -52, -4, -50, -5, -42, -12, -43], ASH, '#2A2624', ASH_HI);
      patch(c, [8, -46, 16, -47, 15, -40, 7, -40], ASH, '#2A2624');
      for (const [x, y, l] of [[4, -54, 5], [-8, -42, 4], [11, -40, 3]] as const) drip(c, x, y, l, GLUE_D, GLUE);
      return;
    }
    // (the spine: a seam down his back, staples where it bent double; the collar seam)
    seam(c, [-11.6, -67, -12.6, -58, -12.4, -48, -11, -40], '#F5F5F4');
    staple(c, -12.4, -55, 0.1); staple(c, -12, -45, -0.1);
    seam(c, [-6, -69.4, 0, -70, 6, -69.2], '#B8B0A4', 3, 0.8);
  },
  head: (c, look) => {
    if (look === 'weakness') {
      patch(c, [0, -12, 10, -10, 11, 0, 3, 2, -2, -4], ASH, '#2A2624', ASH_HI, 2.2);
      drip(c, 6, 2, 4, GLUE_D, GLUE);
      seam(c, [-10, 6, -2, 10, 6, 9], '#2A2624', 2.2);
      return;
    }
    // (the neck turned back round: a seam right round its foot; the crown stapled where it hit)
    seam(c, [-8, 12, -2, 14.5, 4, 14, 9, 11], '#B8B0A4', 3, 0.8);
    staple(c, -4, -13.4, -0.2); staple(c, 2, -14, 0.1); staple(c, 7.6, -11.6, 0.5);
    seam(c, [-6, -12, -1, -9, 5, -11], '#F5F5F4', 2);
  },
};

// TUCKER (frontier/tucker.ts): body in his feet frame (the vest over his barrel belly x -12.8..15.5, y -59..-31); head
// about its middle, its own units (the skull about 26 across: crown at (0, -15), the jaw at (0, 13)).
//   normal: THE GRIZZLY (it ate half of him; Ned finished him off with a bear): three claw seams raked down his vest, a
//           patch of the bear's brown fur sewn into his belly, a bear's round ear stitched onto his head, a claw seam
//           across his cheek.
//   weakness: THE LIONS (torn in half at the waist): sewn back together right round the middle, a hand's width off
//           true, a red raw lip along it, staples where the thread ran out; a lion's bite sewn up on his jaw.
const FUR = ['#2A180A', '#4A2C14', '#6A4220', '#8A5A2E'];
const furPatch = (c: Ctx, pts: number[]) => {
  patch(c, pts, FUR[2], '#E8E0D0', FUR[3]);
  c.strokeStyle = FUR[0]; c.lineWidth = 0.6; c.beginPath();
  const xs = pts.filter((_, i) => i % 2 === 0), ys = pts.filter((_, i) => i % 2 === 1);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  for (let x = x0 + 1.5; x < x1 - 1; x += 1.6) for (let y = y0 + 1.5; y < y1 - 1; y += 3) { c.moveTo(x, y); c.lineTo(x - 0.8, y + 1.8); }
  c.stroke();
};
BOSSES.frontier = {
  body: (c, look) => {
    if (look === 'weakness') {
      c.fillStyle = INK; c.beginPath(); c.moveTo(-13.4, -35.4); c.lineTo(15.8, -39.6); c.lineTo(15.8, -35.6); c.lineTo(-13.4, -31.4); c.closePath(); c.fill();
      c.fillStyle = '#8A1414'; c.beginPath(); c.moveTo(-13.4, -34.6); c.lineTo(15.8, -38.8); c.lineTo(15.8, -36.4); c.lineTo(-13.4, -32.2); c.closePath(); c.fill();
      seam(c, [-13.4, -33.4, 1, -35.6, 15.8, -37.6], '#E8E0D0', 2.2);
      staple(c, -8, -34, -0.15); staple(c, 5, -36, -0.15); staple(c, 12.6, -37.2, -0.15);
      return;
    }
    seam(c, [-6, -57, 2, -46, 8, -36], '#E8E0D0'); seam(c, [-1, -58, 7, -48, 12.6, -39], '#E8E0D0'); seam(c, [-10, -54, -3, -43, 2, -33], '#E8E0D0');
    furPatch(c, [3, -44, 13, -45, 13.6, -37, 4, -35.6]);
  },
  head: (c, look) => {
    if (look === 'weakness') {
      seam(c, [2, 7, 7, 12, 12, 9], '#E8E0D0', 2.2); holeX(c, 5, 10, '#E8E0D0', 1); holeX(c, 10, 9.6, '#E8E0D0', 1);
      return;
    }
    // (the bear's ear, sewn on up top at the back)
    c.fillStyle = INK; c.beginPath(); c.arc(-6, -15, 6.4, 0, Math.PI * 2); c.fill();
    c.fillStyle = FUR[2]; c.beginPath(); c.arc(-6, -15, 5.4, 0, Math.PI * 2); c.fill();
    c.fillStyle = FUR[1]; c.beginPath(); c.arc(-6, -14.4, 3, 0, Math.PI * 2); c.fill();
    c.fillStyle = FUR[3]; c.fillRect(-9.6, -19.4, 3, 1.2);
    seam(c, [-11, -11.6, -6, -9.4, -1, -11.4], '#E8E0D0', 2);
    seam(c, [3, -2, 8, 3, 12, 8], '#E8E0D0', 2.2);
  },
};

setStitch((c, who, part, look) => {
  const p = BOSSES[who]?.[part];
  if (!p) return;
  c.save(); p(c, look); c.restore();
});

/** (dev: the sheet) The painters, for drawing a figure's look by hand. */
export const lookPaint = (who: string, part: StitchPart, look: string, c: Ctx) => BOSSES[who]?.[part]?.(c, look);
