// The town's crude drawing kit (the game-feel pass: still flat colors and simple shapes, but every one of them inked
// round, so it reads as what it is at a glance; the peak-SNES look comes in the final pass).

type Ctx = CanvasRenderingContext2D;
export const INK = '#0B0710';

/** A flat box. */
export const fb = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
/** A box inked round (`t` the ink's width). */
export const ob = (c: Ctx, x: number, y: number, w: number, h: number, col: string, t = 2) => {
  fb(c, x - t, y - t, w + t * 2, h + t * 2, INK);
  fb(c, x, y, w, h, col);
};
/** A polygon, filled, inked round. */
export const poly = (c: Ctx, pts: number[], col: string, t = 2) => {
  c.beginPath(); c.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.closePath();
  c.fillStyle = col; c.fill();
  if (t > 0) { c.strokeStyle = INK; c.lineWidth = t; c.lineJoin = 'round'; c.stroke(); }
};
/** A circle (an ellipse), filled, inked round. */
export const oval = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string, t = 2) => {
  c.beginPath(); c.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, Math.PI * 2);
  c.fillStyle = col; c.fill();
  if (t > 0) { c.strokeStyle = INK; c.lineWidth = t; c.stroke(); }
};
/** A thick line (a pole, a rope, a rail), inked either side. */
export const bar = (c: Ctx, x1: number, y1: number, x2: number, y2: number, w: number, col: string, ink = true) => {
  c.lineCap = 'round';
  if (ink) { c.strokeStyle = INK; c.lineWidth = w + 3; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); }
  c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
  c.lineCap = 'butt';
};
/** Words, small, centered (a sign's, a plate's). */
export const words = (c: Ctx, s: string, x: number, y: number, col: string, size = 8) => {
  c.font = `${size}px "Press Start 2P"`; c.textAlign = 'center'; c.fillStyle = col; c.fillText(s, Math.round(x), Math.round(y)); c.textAlign = 'left';
};
/** A board with words on it, inked, its middle at (x, y) (mount it on something: a post, a wall, a pole). */
export const board = (c: Ctx, x: number, y: number, s: string, col: string, ink: string, size = 8) => {
  c.font = `${size}px "Press Start 2P"`;
  const w = c.measureText(s).width + 14, h = size + 12;
  ob(c, x - w / 2, y - h / 2, w, h, col);
  fb(c, x - w / 2, y - h / 2, w, 2, 'rgba(255,255,255,0.18)');
  words(c, s, x, y + size / 2, ink, size);
  return w;
};
/** A board on one post (or two, wide), standing on the ground at (x, feetY), the board's middle `up` above it. */
export const signPost = (c: Ctx, x: number, feetY: number, up: number, s: string, col: string, ink: string, size = 8) => {
  c.font = `${size}px "Press Start 2P"`;
  const w = c.measureText(s).width + 14;
  if (w > 160) { ob(c, x - w / 2 + 10, feetY - up, 6, up, '#3F3F46'); ob(c, x + w / 2 - 16, feetY - up, 6, up, '#3F3F46'); }
  else ob(c, x - 3, feetY - up, 6, up, '#3F3F46');
  board(c, x, feetY - up, s, col, ink, size);
};
