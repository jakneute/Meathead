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

// DONNIE DRACULA (spooky/donnie.ts): body in his feet frame, leaned (his shirt over the gut x -14..18.7, y -60..-22;
// the seat of his trousers at the back, -x, y -24..-12); head about its middle, its own units (crown about -15, jaw 13).
//   normal: SHAT HIMSELF INTO THE CEILING: his ass sewn shut in a big X with a cork in it, the brown still soaked in
//           round it; his dome seamed and stapled where it went up through the ceiling.
//   weakness: BURNT TO ASH (the little Jesus): put back together out of the ash, bound with gravy: ash-gray patches on
//           his face and his shirt, gravy weeping out of the seams.
const GRAVY = '#6A4420', GRAVY_HI = '#9A6A34', ASH2 = '#8A8682', ASH2_HI = '#B4B0AA';
BOSSES.spooky = {
  body: (c, look) => {
    if (look === 'weakness') {
      patch(c, [0, -54, 10, -52, 12, -44, 2, -42], ASH2, '#2A1A0A', ASH2_HI);
      patch(c, [-12, -40, -2, -38, -3, -30, -12, -31], ASH2, '#2A1A0A', ASH2_HI);
      for (const [x, y, l] of [[2, -42, 6], [-6, -30, 5], [11, -44, 4]] as const) drip(c, x, y, l, GRAVY, GRAVY_HI);
      return;
    }
    blot(c, -12, -17, 5, 6, '#5C3A12', 0.45);
    seam(c, [-15, -24, -9, -12], '#F5F5F4', 2.2); seam(c, [-9, -24, -15, -12], '#F5F5F4', 2.2);
    c.fillStyle = INK; c.fillRect(-14.4, -20.6, 5.2, 4.4); c.fillStyle = '#B07A3A'; c.fillRect(-13.8, -20, 4, 3.2); c.fillStyle = '#D8A060'; c.fillRect(-13.8, -20, 4, 1.2);
  },
  head: (c, look) => {
    if (look === 'weakness') {
      patch(c, [-2, -12, 9, -9, 10, 1, 1, 3, -3, -4], ASH2, '#2A1A0A', ASH2_HI, 2.2);
      drip(c, 5, 3, 5, GRAVY, GRAVY_HI);
      return;
    }
    seam(c, [-10, -11, -3, -15.4, 5, -15, 11, -10], '#F5F5F4', 2.2);
    staple(c, -6, -13.6, -0.5); staple(c, 1, -15.4, 0); staple(c, 8, -12.8, 0.6);
  },
};

// PIPER THE PIXIE (fantasy/piper.ts): body in her feet frame drawn to her width (the gown x -58..66, y -114..-18; she's
// 176 tall); head about her face's middle (the face about 36 across, 32 tall).
//   normal: CORKED (a cork went through her head; the floor had her to the waist): a cork jammed back in the top of her
//           head, a nicer one, sewn round; a seam right round her middle, staples where it pinched.
//   weakness: POPPED (the flintlock let the air out of her): black bike-tire patches glued over the holes, their orange
//           feathered edges; a seam down her front where she split; one on her cheek.
const tire = (c: Ctx, x: number, y: number, r: number) => {
  c.fillStyle = '#EA580C'; c.beginPath(); c.ellipse(x, y, r + 1.6, r * 0.8 + 1.6, 0.3, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#18181B'; c.beginPath(); c.ellipse(x, y, r, r * 0.8, 0.3, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#52525B'; c.fillRect(x - r * 0.5, y - r * 0.4, r * 0.7, 1);
};
BOSSES.fantasy = {
  body: (c, look) => {
    if (look === 'weakness') {
      seam(c, [4, -110, 6, -80, 3, -50, 5, -22], INK, 3);
      for (const [x, y, r] of [[-30, -88, 6], [30, -72, 5], [-14, -50, 7], [40, -96, 4.4], [18, -40, 5]] as const) tire(c, x, y, r);
      return;
    }
    seam(c, [-56, -66, -20, -62, 20, -61, 62, -66], '#F5F5F4', 3);
    for (const x of [-38, -6, 26, 52]) staple(c, x, -63.4, 0.05, 1.3);
  },
  head: (c, look) => {
    if (look === 'weakness') { tire(c, -9, 6, 4.4); seam(c, [6, -14, 9, -4], INK, 2.4); return; }
    // (the cork, in the top of her head, the beehive's foot: a nicer one, its brand on it)
    c.fillStyle = INK; c.fillRect(-9, -26, 18, 14);
    c.fillStyle = '#9A7040'; c.fillRect(-8, -25, 16, 12); c.fillStyle = '#C49A60'; c.fillRect(-8, -25, 16, 3); c.fillStyle = '#6A4A24'; c.fillRect(4, -25, 4, 12);
    for (let k = 0; k < 6; k++) c.fillRect(-6 + k * 2.4, -20 + (k % 2) * 3, 1, 1);
    seam(c, [-12, -12, -4, -9.6, 4, -9.6, 12, -12], '#F5F5F4', 2.4);
  },
};

// HELICOPTER HARRY (foreign/harry/rambo.ts): body in his feet frame, leaned (bare torso, the V: shoulders x -16..17 at
// y -71, the jeans' top about y -42); head about its middle (heli/harryArt.ts's head at (1, -86): face about x -10..12,
// y -12..12, the ponytail off the back).
//   spin: SHOT BY HIS OWN ROUNDS (the spin): holes all over him, every one sewn shut in a cross.
//   buried: BURIED IN CEMENT (her puke): chiseled out, some of him still cement: gray crust patches, seamed round.
//   barfed: PUKED HIMSELF TO DEATH: a seam right across his gut where a new stomach went in, green round it; his lips
//           sewn shut in crosses so it can't happen again.
const CEM = '#9A968E', CEM_HI = '#C4C0B8', SICK = '#5E8A2A';
BOSSES.foreign = {
  body: (c, look) => {
    if (look === 'buried') {
      patch(c, [-14, -68, -4, -70, -2, -60, -12, -58], CEM, '#3A3630', CEM_HI);
      patch(c, [6, -56, 16, -58, 15, -48, 5, -46], CEM, '#3A3630', CEM_HI);
      patch(c, [-8, -50, 0, -51, 0, -44, -9, -43], CEM, '#3A3630');
      return;
    }
    if (look === 'barfed') {
      blot(c, 1, -50, 14, 5, SICK, 0.35);
      seam(c, [-14, -51, -4, -48, 6, -48, 16, -51], '#E8E0D0', 2.4);
      staple(c, -9, -49.6, 0.15); staple(c, 11, -49.6, -0.15);
      return;
    }
    for (const [x, y] of [[-10, -64], [-3, -58], [8, -66], [12, -56], [-6, -48], [4, -46], [14, -46], [-12, -54], [2, -68]] as const) holeX(c, x, y, '#E8E0D0', 1.3);
  },
  head: (c, look) => {
    if (look === 'buried') { patch(c, [-6, -8, 11, -7, 12, 6, 2, 9, -6, 4], CEM, '#3A3630', CEM_HI, 2.2); return; }
    if (look === 'barfed') {
      c.strokeStyle = '#E8E0D0'; c.lineWidth = 0.6; c.beginPath();
      for (let k = 0; k < 4; k++) { const x = 3 + k * 2.4; c.moveTo(x - 1, 5); c.lineTo(x + 1, 8.6); c.moveTo(x + 1, 5); c.lineTo(x - 1, 8.6); }
      c.stroke();
      blot(c, 7, 2, 5, 3, SICK, 0.3);
      return;
    }
    holeX(c, 4, -6, '#E8E0D0', 1.7); holeX(c, -4, 2, '#E8E0D0', 1.7); holeX(c, 9, 5, '#E8E0D0', 1.5); holeX(c, 0, 9, '#E8E0D0', 1.4);
  },
};

// THE QUEEN (space/queen/sprite.ts): body in her frame, leaned (the ribbed torso x -38..48, y -238..-110); head about
// her dome's root, turned (the dome x -14..56, y -28..8, the snout and jaws on forward to 60, the crest back to -110).
// She's rebuilt, not raised: the aliens put her back.
//   normal: BURNT TO THE SKELETON: a dollar store's peach latex glued back over her in patches, riveted, the price tag
//           still on her dome.
//   weakness: FLATTENED BY THE MALLET: her dome hammered back out (dents all over it), a steel plate bolted over the
//           worst, a seam down her neck; dents in her chest.
const LATEX = '#D8A08A', LATEX_HI = '#F0C4AE';
const rivet = (c: Ctx, x: number, y: number) => { c.fillStyle = INK; c.fillRect(x - 1.6, y - 1.6, 3.2, 3.2); c.fillStyle = '#C8CCD4'; c.fillRect(x - 1, y - 1, 2, 2); c.fillStyle = '#FFFFFF'; c.fillRect(x - 1, y - 1, 1, 1); };
const dent = (c: Ctx, x: number, y: number, r: number) => {
  c.fillStyle = 'rgba(8, 6, 12, 0.55)'; c.beginPath(); c.ellipse(x, y, r, r * 0.7, 0.3, 0, Math.PI * 2); c.fill();
  c.strokeStyle = 'rgba(200, 200, 220, 0.5)'; c.lineWidth = 1; c.beginPath(); c.ellipse(x, y, r, r * 0.7, 0.3, Math.PI * 0.9, Math.PI * 1.7); c.stroke();
};
BOSSES.space = {
  body: (c, look) => {
    if (look === 'weakness') { for (const [x, y, r] of [[-10, -200, 7], [14, -178, 6], [-20, -150, 5], [20, -140, 6]] as const) dent(c, x, y, r); return; }
    for (const pts of [[-24, -214, 8, -220, 10, -196, -22, -190], [-30, -160, -4, -164, -6, -138, -26, -132], [14, -170, 38, -176, 34, -150, 12, -146]]) {
      patch(c, pts, LATEX, '#8A8A90', LATEX_HI, 4);
      for (let i = 0; i < pts.length; i += 2) rivet(c, pts[i], pts[i + 1]);
    }
  },
  head: (c, look) => {
    if (look === 'weakness') {
      for (const [x, y, r] of [[4, -16, 6], [32, -18, 5], [46, -10, 4], [18, -6, 4]] as const) dent(c, x, y, r);
      c.fillStyle = INK; c.fillRect(10, -27, 28, 13); c.fillStyle = '#6B7280'; c.fillRect(11, -26, 26, 11); c.fillStyle = '#9CA3AF'; c.fillRect(11, -26, 26, 3);
      for (const x of [13, 24, 34]) rivet(c, x, -18);
      seam(c, [-8, 6, -14, 18, -18, 32], '#D1D5DB', 4, 1.6);
      return;
    }
    patch(c, [2, -24, 30, -27, 34, -10, 6, -6], LATEX, '#8A8A90', LATEX_HI, 4);
    for (const [x, y] of [[2, -24], [30, -27], [34, -10], [6, -6]] as const) rivet(c, x, y);
    // (the price tag, on its string)
    c.strokeStyle = '#E8E0D0'; c.lineWidth = 1; c.beginPath(); c.moveTo(20, -26); c.lineTo(24, -36); c.stroke();
    c.fillStyle = INK; c.fillRect(20, -46, 18, 11); c.fillStyle = '#F4F0E0'; c.fillRect(21, -45, 16, 9); c.fillStyle = '#C81E1E'; c.fillRect(23, -43, 12, 2); c.fillRect(23, -40, 8, 2);
  },
};

// DAD GUY (cartoon/amphi/dad.ts): body about his belly's middle, in its own units (the belly a disc of radius 30, his
// front +x); head in his head's own frame (the skull about (-2, -4), radius 14 or so, his face toward -x).
//   normal: DROWNED IN BEER (wrung out like a towel): the seams twisted round his gut like a wrung rag, beer still soaked
//           into him in yellow blots, a drip off his chin.
//   weakness: FLATTENED BY THE STUNT CAR (pumped back up with a bike pump): a bike valve in his belly, its cap on a chain;
//           the tire's tread sewn across his gut and across his face.
const BEER = '#E9B23A';
const tread = (c: Ctx, x0: number, y0: number, x1: number, y1: number, w: number) => {
  const len = Math.hypot(x1 - x0, y1 - y0), a = Math.atan2(y1 - y0, x1 - x0);
  c.save(); c.translate(x0, y0); c.rotate(a);
  c.fillStyle = 'rgba(20, 18, 22, 0.55)'; c.fillRect(0, -w / 2, len, w);
  c.fillStyle = 'rgba(20, 18, 22, 0.75)'; for (let x = 2; x < len - 2; x += 5) { c.beginPath(); c.moveTo(x, -w / 2); c.lineTo(x + 3, 0); c.lineTo(x, w / 2); c.lineTo(x + 1.6, 0); c.closePath(); c.fill(); }
  c.restore();
  seam(c, [x0, y0, x1, y1], '#F5F5F4', 3);
};
BOSSES.cartoon = {
  body: (c, look) => {
    if (look === 'weakness') {
      tread(c, -26, -16, 26, 18, 9);
      c.fillStyle = INK; c.fillRect(2.4, -6, 5.2, 12); c.fillStyle = '#B8BCC4'; c.fillRect(3, -6, 4, 11); c.fillStyle = '#E5E7EB'; c.fillRect(3, -6, 1.4, 11);
      c.fillStyle = '#1F2937'; c.fillRect(1.6, -10, 6.8, 5); c.strokeStyle = '#9CA3AF'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(8, -8); c.quadraticCurveTo(13, -2, 8, 4); c.stroke();
      return;
    }
    for (const k of [-1, 0, 1]) seam(c, [-26, -14 + k * 12, -8, -6 + k * 12, 10, -12 + k * 12, 26, -4 + k * 12], '#F5F5F4', 3.4, 1.2);
    blot(c, -10, 10, 9, 6, BEER, 0.4); blot(c, 14, -8, 7, 5, BEER, 0.35);
  },
  head: (c, look) => {
    if (look === 'weakness') { tread(c, -14, -14, 8, 8, 6); staple(c, 4, -2, 0.8); return; }
    seam(c, [-14, -10, -4, -16, 6, -12, 10, -4], '#F5F5F4', 2.6);
    drip(c, -8, 15, 4, BEER, '#FFE08A');
  },
};

// SAFARI ARTIE (adventure/river/artie.ts): body in his feet frame, bent (the shirt x -10.5..10.5, the belt at y -31, up
// to his shoulders about y -60); head about its middle, its own units (crown about -15, jaw 13).
//   normal: GORED BY THE RHINO: the hole the horn left through his gut plugged with half a coconut, sewn round; his spine
//           seamed down his back where it folded, stapled.
//   weakness: EATEN ALIVE (the litter): what they ate made up out of a store mannequin: smooth beige plastic sewn into
//           his shirt and half his face, a bolt at the joint, a painted-on eye.
const MANNY = '#E8D2B4', MANNY_HI = '#FFF0DC';
BOSSES.adventure = {
  body: (c, look) => {
    if (look === 'weakness') {
      patch(c, [-10, -58, 4, -56, 3, -44, -10, -46], MANNY, '#3A2A1A', MANNY_HI);
      patch(c, [2, -42, 10, -43, 10, -33, 1, -34], MANNY, '#3A2A1A', MANNY_HI);
      c.fillStyle = '#6A6A70'; c.beginPath(); c.arc(-3, -50, 1.6, 0, Math.PI * 2); c.fill();
      return;
    }
    // (the coconut half, plugged in the hole: its husk, its three eyes; sewn round)
    c.fillStyle = INK; c.beginPath(); c.arc(2, -40, 6.2, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#6A4220'; c.beginPath(); c.arc(2, -40, 5.4, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#8A5A2E'; c.beginPath(); c.arc(1, -41, 3.4, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#3A2410'; for (const [x, y] of [[0, -42], [3, -42], [1.5, -39.4]] as const) c.fillRect(x, y, 1.2, 1.2);
    seam(c, [-5, -44, 2, -47.4, 9, -44, 9, -36, 2, -32.6, -5, -36, -5, -44], '#F5F5F4', 2.4);
    seam(c, [-10.6, -58, -11.4, -48, -10.6, -36], '#F5F5F4', 2.4);
    staple(c, -11.2, -52, 0.1); staple(c, -11, -42, -0.1);
  },
  head: (c, look) => {
    if (look === 'weakness') {
      patch(c, [0, -6, 12, -5, 13, 8, 2, 11, -1, 1], MANNY, '#3A2A1A', MANNY_HI, 2.2);
      c.fillStyle = '#1A1A2A'; c.fillRect(6, -3, 3, 2); c.fillStyle = '#2A3A8A'; c.fillRect(6, -3, 2, 1);
      return;
    }
    seam(c, [-12, 8, -6, 12, 2, 12.6], '#F5F5F4', 2.2);
  },
};

setStitch((c, who, part, look) => {
  const p = BOSSES[who]?.[part];
  if (!p) return;
  c.save(); p(c, look); c.restore();
});

/** (dev: the sheet) The painters, for drawing a figure's look by hand. */
export const lookPaint = (who: string, part: StitchPart, look: string, c: Ctx) => BOSSES[who]?.[part]?.(c, look);
