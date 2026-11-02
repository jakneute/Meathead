// The cheap shot's RIP (the owner: "the nut crunches should use meathead's hands to rip out their own nuts/ovaries
// instead of kicking them. he just tears them out" / "make it more barbaric, the act"): every close-up but the White
// House pundits' (they keep the boot). His arm comes up into the X-ray from below, the big white cartoon glove of the
// hand armor open; it clamps on (GRIP, the old boot's CLOSE_HIT); then he WRENCHES, in savage jerks, the forearm's veins
// standing out, the tissue stretching down to his fist (STRAIN, the effort word trembling), till at RIP it tears free in
// a gush; the fist whips away with it and comes back up holding it, shaking it. Each boss's own close-up draws what's
// in there and what flies out; this is the hand, its timing, the stretched cords, the snapped ends and the effort.
//
// Still parts baked once (closeUp.ts bakeOnce, on first use): the open glove, the fist, the forearm (and its straining
// copy). A frame is three or four drawImages and a dozen strokes.

import { bakeOnce, clamp, lerp, rnd, OPEN, CLOSE_HIT, PANEL_H } from '../closeUp';
import { has } from '../state';

type Ctx = CanvasRenderingContext2D;
type R = readonly string[];
const TAU = Math.PI * 2;
const INK = '#0A0608';

/** The beats (close-up frames, of CLOSE_LEN): the glove clamps on, then it tears free. */
export const GRIP = CLOSE_HIT, RIP = 48;
/** The strain, 0..1 (0 before the grip, 1 at the rip). */
export const strainOf = (t: number) => clamp((t - GRIP) / (RIP - GRIP));

export interface Hand {
  /** The fist's grip point (what it holds is here). */
  x: number; y: number;
  /** Clamped shut; holding it, torn free; how hard he's pulling (0..1); this frame's jerk (0..1); a tilt. */
  shut: boolean; held: boolean; strain: number; jerk: number; rot: number;
}

/**
 * Where the hand is, frame `t`, grabbing at (gx, gy). Up from under the panel's bottom left, open, fast; shut on it at
 * GRIP; then four hard yanks down (each further, a little give back between, trembling), `pull` px in all by RIP; torn
 * free, it whips down and away, and comes back up to (showX, showY) holding it, shaking it like a trophy.
 */
export const handAt = (t: number, gx: number, gy: number, o: { from?: number; pull?: number; showX?: number; showY?: number } = {}): Hand => {
  const from = o.from ?? OPEN, pull = o.pull ?? 46, sx = o.showX ?? 112, sy = o.showY ?? 176;
  if (t < GRIP) {
    const k = clamp((t - from) / (GRIP - from)), e = 1 - (1 - k) ** 3;
    return { x: lerp(gx - 110, gx, e), y: lerp(PANEL_H + 170, gy, e), shut: false, held: false, strain: 0, jerk: 0, rot: lerp(-0.55, 0, e) };
  }
  if (t < RIP) {
    const u = strainOf(t), ph = u * 4, f = ph - Math.floor(ph);
    const jerk = f < 0.3 ? f / 0.3 : Math.max(0, 1 - (f - 0.3) / 0.5);
    const d = pull * (Math.floor(ph) / 4 * 0.85 + jerk * 0.3 * (0.5 + u * 0.5));
    const tr = (t % 2 ? 1 : -1) * (1 + u * 3);
    return { x: gx + tr - jerk * 6, y: gy + d, shut: true, held: false, strain: u, jerk, rot: -jerk * 0.12 + tr * 0.01 };
  }
  const k = t - RIP;
  if (k < 4) { const e = k / 4; return { x: lerp(gx - 6, gx - 70, e), y: lerp(gy + pull, gy + pull + 70, e), shut: true, held: true, strain: 1, jerk: 1, rot: -0.3 * e }; }
  if (k < 14) { const e = 1 - (1 - (k - 4) / 10) ** 2; return { x: lerp(gx - 70, sx, e), y: lerp(gy + pull + 70, sy, e), shut: true, held: true, strain: 1, jerk: 0, rot: lerp(-0.3, 0.1, e) }; }
  const w = Math.sin((k - 14) * 0.75);
  return { x: sx + w * 12, y: sy - Math.abs(w) * 8, shut: true, held: true, strain: 0.6, jerk: 0, rot: w * 0.18 };
};

// ---------------------------------------------------------------------------------------------------------------------
// The arm and the glove (bake)

const SKIN: R = ['#5A3414', '#8A5A2E', '#B8844C', '#E0AC69', '#F4CC94'];
const GLOVE = '#FFFFFF', GLOVE_SH = '#C9CED8', GLOVE_DK = '#9AA1B0';

/** The open glove, reaching up (the back of his left hand to us: the thumb on the right), 110x120; its grip point
 *  (where the fingers will close) at (55, 30), the wrist at (55, 112). */
const OPEN_GRIP: [number, number] = [55, 30];
const gloveOpen = () => bakeOnce('rip-glove-open', g => {
  const blob = (x: number, y: number, rx: number, ry: number, rot: number) => {
    g.fillStyle = INK; g.beginPath(); g.ellipse(x, y, rx + 3, ry + 3, rot, 0, TAU); g.fill();
    g.fillStyle = GLOVE; g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, TAU); g.fill();
    g.fillStyle = GLOVE_SH; g.beginPath(); g.ellipse(x + rx * 0.35, y + ry * 0.2, rx * 0.5, ry * 0.75, rot, 0, TAU); g.fill();
  };
  // (four fat fingers splayed up, the thumb out to the right, the palm, the rolled cuff)
  for (let k = 0; k < 4; k++) blob(26 + k * 18, 32 - (k === 1 || k === 2 ? 6 : 0), 9, 22, (k - 1.5) * 0.16);
  blob(92, 64, 9, 18, 0.7);
  blob(56, 70, 34, 30, 0);
  g.strokeStyle = GLOVE_DK; g.lineWidth = 2.5; g.beginPath();
  for (let k = 0; k < 3; k++) { g.moveTo(42 + k * 12, 62); g.lineTo(44 + k * 12, 80); }
  g.stroke();
  g.fillStyle = INK; g.beginPath(); g.roundRect(22, 92, 68, 26, 8); g.fill();
  g.fillStyle = GLOVE; g.beginPath(); g.roundRect(25, 95, 62, 20, 6); g.fill();
  g.fillStyle = GLOVE_SH; g.fillRect(25, 107, 62, 6);
  g.fillStyle = '#FFFFFF'; g.fillRect(30, 97, 40, 2);
}, 110, 120);

/** The fist, clamped on (knuckles to us), 120x104; its grip point (what's in it shows over the top) at (60, 26). */
const FIST_GRIP: [number, number] = [60, 26];
const gloveFist = (strain: boolean) => bakeOnce(strain ? 'rip-glove-fist-s' : 'rip-glove-fist', g => {
  const blob = (x: number, y: number, rx: number, ry: number, rot: number, col = GLOVE) => {
    g.fillStyle = INK; g.beginPath(); g.ellipse(x, y, rx + 3, ry + 3, rot, 0, TAU); g.fill();
    g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, TAU); g.fill();
  };
  blob(60, 58, 44, 32, 0);
  g.fillStyle = GLOVE_SH; g.beginPath(); g.ellipse(70, 68, 30, 18, 0, 0, TAU); g.fill();
  // (the four curled fingers across the top, wrapped round it, knuckles white with the squeeze)
  for (let k = 0; k < 4; k++) {
    const x = 28 + k * 21, y = 38 + (k === 0 || k === 3 ? 4 : 0);
    blob(x, y, 12, 14, 0);
    g.fillStyle = GLOVE_SH; g.fillRect(x - 8, y + 6, 16, 4);
    g.fillStyle = '#FFFFFF'; g.fillRect(x - 6, y - 10, 7, 3);
    g.strokeStyle = GLOVE_DK; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 8, y + 2); g.quadraticCurveTo(x, y + 6, x + 8, y + 2); g.stroke();
  }
  // (the thumb clamped across the front)
  blob(76, 72, 24, 11, -0.25);
  g.fillStyle = GLOVE_SH; g.fillRect(62, 76, 30, 4);
  // (three stitches on the back)
  g.strokeStyle = GLOVE_DK; g.lineWidth = 2.5; g.beginPath();
  for (let k = 0; k < 3; k++) { g.moveTo(34 + k * 10, 60); g.lineTo(34 + k * 10, 74); }
  g.stroke();
  // (the cuff)
  g.fillStyle = INK; g.beginPath(); g.roundRect(28, 82, 64, 22, 7); g.fill();
  g.fillStyle = GLOVE; g.beginPath(); g.roundRect(31, 85, 58, 16, 5); g.fill();
  g.fillStyle = GLOVE_SH; g.fillRect(31, 95, 58, 5);
  if (strain) {
    // (the squeeze: the glove's seams straining, little stress lines)
    g.strokeStyle = INK; g.lineWidth = 1.5; g.beginPath();
    for (let k = 0; k < 5; k++) { const x = 22 + k * 19; g.moveTo(x, 20); g.lineTo(x - 3, 12); }
    g.stroke();
  }
}, 120, 104);

/** His forearm, 64 across, 230 long: the wrist at the top middle, banded round (lit from the left), hairy; the strain
 *  copy: the veins up like ropes, flushed, sweat. */
const forearm = (strain: boolean) => bakeOnce(strain ? 'rip-arm-s' : 'rip-arm', g => {
  const path = () => { g.moveTo(14, 0); g.lineTo(50, 0); g.quadraticCurveTo(64, 120, 60, 230); g.lineTo(4, 230); g.quadraticCurveTo(0, 120, 14, 0); g.closePath(); };
  g.save(); g.beginPath(); path(); g.clip();
  const cols = [SKIN[4], SKIN[3], SKIN[3], SKIN[2], SKIN[1]];
  for (let i = 0; i < 5; i++) { g.fillStyle = cols[i]; g.fillRect(i * 13, 0, 14, 230); }
  for (let i = 1; i < 5; i++) { g.fillStyle = cols[i - 1]; for (let y = 0; y < 230; y += 2) g.fillRect(i * 13 + (y / 2) % 2, y, 1, 1); }
  // (the hair)
  g.strokeStyle = SKIN[0]; g.lineWidth = 1; g.beginPath();
  for (let i = 0; i < 40; i++) { const x = 8 + rnd(i * 3.1) * 48, y = 30 + rnd(i * 5.7) * 190; g.moveTo(x, y); g.lineTo(x + 3, y - 4); }
  g.stroke();
  if (strain) {
    g.fillStyle = 'rgba(220,38,38,0.22)'; g.fillRect(0, 0, 64, 230);
    for (let i = 0; i < 4; i++) {
      let x = 16 + i * 10, y = 4;
      g.lineCap = 'round';
      const pts: [number, number][] = [[x, y]];
      for (let s = 0; s < 7; s++) { x += (rnd(i * 9 + s) - 0.5) * 12; y += 30; pts.push([x, y]); }
      for (const [col, w, o] of [[SKIN[1], 6, 0], ['#7C5CC4', 4, 0], ['#B9A6F0', 1.5, -1]] as const) {
        g.strokeStyle = col; g.lineWidth = w; g.beginPath(); pts.forEach(([px, py], k) => (k ? g.lineTo(px + o, py + o) : g.moveTo(px + o, py + o))); g.stroke();
      }
      g.lineCap = 'butt';
    }
    g.fillStyle = '#E0F2FE'; for (let i = 0; i < 8; i++) { const x = 10 + rnd(i * 7.7) * 44, y = 20 + rnd(i * 2.9) * 180; g.fillRect(x, y, 3, 4); }
  }
  g.restore();
  g.beginPath(); path(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
  // (the BEEF BRACERS on it, if he has them: a band of riveted leather up from the wrist)
  if (has('armguards')) {
    g.fillStyle = INK; g.fillRect(8, 40, 50, 46);
    g.fillStyle = '#7C4A1E'; g.fillRect(11, 43, 44, 40);
    g.fillStyle = '#A9692E'; g.fillRect(11, 43, 10, 40);
    g.fillStyle = '#D6D3D1'; for (let i = 0; i < 4; i++) { g.fillRect(16 + i * 10, 48, 3, 3); g.fillRect(16 + i * 10, 74, 3, 3); }
  }
}, 64, 230);

/** The arm and the glove, the hand at `h`. */
export const drawHand = (c: Ctx, h: Hand, t: number) => {
  // (the forearm: from the wrist down off the panel's bottom left, toward his elbow)
  const wx = h.x - Math.sin(h.rot) * 70, wy = h.y + (h.shut ? 64 : 82);
  const ex = h.x - 150, ey = PANEL_H + 190, a = Math.atan2(ey - wy, ex - wx) - Math.PI / 2, len = Math.hypot(ex - wx, ey - wy);
  c.save(); c.translate(wx, wy); c.rotate(a); c.scale(1, Math.max(0.6, len / 230));
  c.drawImage(forearm(false), -32, -6);
  if (h.strain > 0) { c.globalAlpha = clamp(h.strain * 1.4); c.drawImage(forearm(true), -32, -6); c.globalAlpha = 1; }
  c.restore();
  // (the glove: open reaching, clamped shut after, jerking)
  c.save(); c.translate(h.x, h.y); c.rotate(h.rot);
  if (!h.shut) c.drawImage(gloveOpen(), -OPEN_GRIP[0], -OPEN_GRIP[1]);
  else {
    const sq = h.jerk > 0.5 ? 1.04 : 1;
    c.scale(sq, 2 - sq);
    c.drawImage(gloveFist(h.strain > 0.4), -FIST_GRIP[0], -FIST_GRIP[1]);
  }
  c.restore();
  // (the squeeze's lines off the knuckles, each jerk)
  if (h.shut && !h.held && h.jerk > 0.4) {
    c.strokeStyle = '#FDE047'; c.lineWidth = 3;
    for (let i = 0; i < 4; i++) { const an = -Math.PI * (0.15 + i * 0.23); c.beginPath(); c.moveTo(h.x + Math.cos(an) * 66, h.y + 30 + Math.sin(an) * 46); c.lineTo(h.x + Math.cos(an) * 84, h.y + 30 + Math.sin(an) * 58); c.stroke(); }
  }
  void t;
};

// ---------------------------------------------------------------------------------------------------------------------
// What's between: the stretched cords, the snapped ends, the effort

/**
 * The cords (and whatever else holds it in: tubes, wires, hoses), from where they're rooted (ax, ay) down to the fist
 * (bx, by), stretched thin as he pulls (`strain`), trembling; `cols` dark, base, lit; `n` strands, `w` wide.
 */
export const drawTether = (c: Ctx, t: number, ax: number, ay: number, bx: number, by: number, strain: number, cols: R, n = 2, w = 9, spread = 16) => {
  c.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const s = n === 1 ? 0 : (i / (n - 1)) * 2 - 1;
    const x0 = ax + s * spread, x1 = bx + s * spread * 0.35, ww = Math.max(2, w * (1 - strain * 0.65));
    const bow = s * 14 * (1 - strain) + (t % 2 ? 1 : -1) * strain * 2;
    const mx = (x0 + x1) / 2 + bow, my = (ay + by) / 2;
    for (const [col, lw] of [[cols[0], ww + 3], [cols[1], ww], [cols[2], Math.max(1, ww * 0.3)]] as const) {
      c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(x0, ay); c.quadraticCurveTo(mx, my, x1, by); c.stroke();
    }
  }
  c.lineCap = 'butt';
};

/** Snapped ends, `k` frames after the rip, whipping back up where they were rooted (ax, ay), slowing to a dangle,
 *  dripping `drip`. */
export const drawSnapped = (c: Ctx, k: number, ax: number, ay: number, cols: R, drip: string, n = 2, w = 7, len = 34, spread = 16) => {
  if (k < 0) return;
  c.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const s = n === 1 ? 0 : (i / (n - 1)) * 2 - 1;
    const x0 = ax + s * spread, whip = Math.sin(k * 0.7 + i * 2) * 1.6 * Math.exp(-k / 10) + s * 0.3;
    const L = len * (0.7 + 0.5 * Math.exp(-k / 6)), ex = x0 + Math.sin(whip) * L, ey = ay + Math.cos(whip) * L;
    for (const [col, lw] of [[cols[0], w + 3], [cols[1], w], [cols[2], Math.max(1, w * 0.3)]] as const) {
      c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(x0, ay); c.quadraticCurveTo(x0 + Math.sin(whip) * L * 0.3, ay + L * 0.6, ex, ey); c.stroke();
    }
    // (the torn end, frayed, dripping)
    c.fillStyle = drip; c.fillRect(ex - 4, ey - 2, 8, 6);
    const dy = (k * 4 + i * 11) % 40; c.fillRect(ex - 2, ey + 4 + dy, 4, 5);
  }
  c.lineCap = 'butt';
};

/** The tissue tenting down to his fist: a sheet of `col` (skin, rubber, latex) dragged down from a wide base. */
export const drawTent = (c: Ctx, ax: number, ay: number, bx: number, by: number, strain: number, col: string, edge: string, base = 70) => {
  if (strain <= 0) return;
  const hw = base * (0.5 + strain * 0.5), tip = 26 * (1 - strain * 0.5);
  c.fillStyle = col; c.strokeStyle = edge; c.lineWidth = 2;
  c.beginPath(); c.moveTo(ax - hw, ay); c.quadraticCurveTo(ax - hw * 0.3, (ay + by) / 2, bx - tip, by); c.lineTo(bx + tip, by); c.quadraticCurveTo(ax + hw * 0.3, (ay + by) / 2, ax + hw, ay); c.closePath();
  c.globalAlpha = 0.85; c.fill(); c.globalAlpha = 1; c.stroke();
  // (stretch lines down it)
  c.beginPath(); for (let i = -2; i <= 2; i++) { c.moveTo(ax + i * hw * 0.3, ay + 4); c.lineTo(bx + i * tip * 0.4, by - 4); } c.stroke();
};

/** His effort, up left (under the tag): a trembling NNNGH as he wrenches, the ROAR as it tears. */
export const effort = (c: Ctx, t: number) => {
  const u = t - GRIP - 4, k = t - RIP;
  if (u < 0 || k > 16) return;
  const text = k < 0 ? 'NNNNGH!' : 'RRRAAAGH!', size = k < 0 ? 12 + Math.min(6, u / 5) : 18;
  c.save(); c.translate(110 + (t % 2 ? 2 : -2), 66 + (t % 3) - 1); c.rotate(-0.08);
  c.font = `${Math.round(size)}px "Press Start 2P"`; c.textAlign = 'center';
  c.fillStyle = '#000'; c.fillText(text, 3, 3); c.fillStyle = k < 0 ? '#FDE68A' : '#FCA5A5'; c.fillText(text, 0, 0);
  c.restore();
};

/** The tear's flash: hard white, then the color. */
export const ripFlash = (c: Ctx, t: number, col = '255,40,40', w: number, h: number) => {
  const k = t - RIP;
  if (k < 0 || k > 5) return;
  c.fillStyle = k < 2 ? `rgba(255,255,255,${k ? 0.45 : 0.85})` : `rgba(${col},${(0.3 - (k - 2) * 0.08).toFixed(2)})`;
  c.fillRect(-20, -20, w + 40, h + 40);
};

/** The ripping shake: a tremble that grows as he strains, a big jolt at the tear (translate; the caller's save round
 *  it). */
export const ripShake = (c: Ctx, t: number, amp = 14) => {
  const u = strainOf(t), k = t - RIP;
  if (t >= GRIP && t < RIP) c.translate((t % 2 ? 1 : -1) * u * 3, 0);
  if (k >= 0 && k < 12) { const q = (12 - k) / 12; c.translate((k % 2 ? 1 : -1) * amp * q, ((k >> 1) % 2 ? 1 : -1) * amp * 0.4 * q); }
};

/** A splat of `col` over the glove, after (it's covered in it). */
export const gloveGore = (c: Ctx, h: Hand, cols: R) => {
  if (!h.held) return;
  c.save(); c.translate(h.x, h.y); c.rotate(h.rot);
  for (let i = 0; i < 7; i++) { const x = -40 + rnd(i * 3.3) * 80, y = 6 + rnd(i * 5.1) * 50, r = 4 + rnd(i) * 6; c.fillStyle = cols[i % cols.length]; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
  c.fillStyle = cols[0]; for (let i = 0; i < 4; i++) c.fillRect(-30 + i * 18, 60, 5, 8 + (i % 2) * 10);
  c.restore();
};
