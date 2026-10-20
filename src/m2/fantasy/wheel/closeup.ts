// THE FAIRY WHEEL, UP CLOSE (the user's: "when you get in a tussel for the qte sections, do a closeup. show a detailed
// closeup of meathead and the suitor getting in a tussel. show a special closeup animation of meathead killing the suitor
// too or him getting thrown off."). A picture-in-picture over the world, painted at half resolution and blown up 2x
// (chunky like everything else): inside the gondola, its petal back and posts, the cap's frilled underside and its
// fairy lights, the sky and the wheel's spokes through the top; the two of them from the waist up (from the knees,
// whoever's lifted), every form shaded in stepped ramps toward the upper left, inked.
//
//   THE TUSSLE  the whole QTE: grappling, rocking the gondola, sweat flying, teeth gritted. Who's winning (qteEdge,
//               eased: w.cuBal) is who's leaning on whom: the suitor's palm in Meathead's face, the two of them forehead
//               to forehead, or the suitor in a headlock. The box sits under the QTE panel, clear of the HUD.
//   THE KILLS   a cutscene (no HUD, SKIP >> takes it all), ~2 s, then the side view takes the kill on (kills.ts RESUME):
//               SMASH  spun round by the hair and his face driven into the gondola's post, three times, teeth out,
//                      sliding down it; THROW  hoisted overhead (shitting himself on Meathead's head) and heaved out;
//               FLOOR  upended and piledriven through the floor, his legs kicking up out of the hole, then not;
//               FLING  swung round by the ankles, shitting in a spiral, let go; CHOKE  his own bouquet stuffed down his
//               throat a fistful at a time, purple, eyes bulging, gone. Every one of them shits himself.
//   THROWN OUT  (a QTE lost) the suitor's sneer as he hoists Meathead up and heaves him over the side, Meathead's face as
//               he goes (his pants as they are: clean, shitty, or none), the suitor leaning out laughing at the drop;
//               then the side view's fall (w.thrown).
//
// Meathead's on the left in all of them (the camera's own side: he's left-handed, and a mirrored picture would make him
// a righty). Speech in the box only while it's being said.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { shakeScreen } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { playSound } from '../../../m1/game/platform/audio';
import { SKIP_AFTER, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { RAMP } from '../../../m1/game/scenes/art/snes';
import { skyRamp } from '../../timeOfDay';
import { saidOver, pantsOf } from '../section';
import type { SuitorLook } from '../suitors';
import { box, mix, INK, ramp6, GOLD, type Ctx } from '../kit';
import { ROSTER } from './layout';
import { CAPS, drawItem } from './art';
import { closeupYell } from './kills';
import type { KillKind } from './lines';
import type { Wheel, Closeup } from './state';

type P = [number, number];
type Pants = 'clean' | 'shitty' | 'nude';
type Face = 'grit' | 'roar' | 'shock' | 'grin' | 'strain' | 'sneer' | 'scream' | 'pain' | 'dazed' | 'dead' | 'choke' | 'smug';
/** Who's drawn: Meathead (his pants as they are), or a suitor (his look; L's unused for Meathead). */
interface Who { mh: boolean; pants: Pants; L: SuitorLook }

/** The picture's own pixels (2x on screen). */
const W = 200, H = 100;
/** Where it sits: the tussle's under the QTE panel; a cutscene's in the middle, letterboxed. */
const TX = (CANVAS_WIDTH - W * 2) / 2, TY = 350, CX = TX, CY = 196;

/** How long each close-up runs (frames). */
export const CU_DUR: Record<KillKind, number> = { smash: 120, throw: 110, floor: 120, fling: 110, choke: 130 };
export const THROWN_DUR = 100;
const HITS = [34, 64, 94];

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp01(t);
const lerpP = (a: P, b: P, t: number): P => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
const ease = (v: number) => { const x = clamp01(v); return x * x * (3 - 2 * x); };
const rot = (x: number, y: number, a: number): P => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// ---------------------------------------------------------------------------------------------------------------
// Ramps (darkest first: shadow line, shade, base, lit, highlight)

const MSK = [RAMP.mSkin[2], RAMP.mSkin[3], RAMP.mSkin[4], RAMP.mSkin[5], RAMP.mSkin[6]];
const MHAIR = RAMP.mHair;
const JEANS = ['#0B1438', '#172554', '#1E3A8A', '#2D4FA8', '#4A6CC4'];
const STEEL = ['#2A2A34', '#5A5A66', '#8A8A94', '#B8B8C4', '#E4E4EC'];
const CREAM = ['#8A7A68', '#B8A890', '#E2D4BC', '#F6ECDA', '#FFFFFF'];
const POOP = ['#3A220C', '#5A3414', '#6B4423', '#8B5A2B', '#A87440'];
const r5 = (col: string) => { const r = ramp6(col); return [r[0], r[1], r[3], r[4], r[5]]; };
const skinOf = (who: Who) => (who.mh ? MSK : [mix(who.L.skin[2], INK, 0.3), who.L.skin[2], who.L.skin[1], who.L.skin[0], mix(who.L.skin[0], '#FFFFFF', 0.35)]);

// ---------------------------------------------------------------------------------------------------------------
// Painting kit (the picture's pixels)

const ell = (g: Ctx, x: number, y: number, rx: number, ry: number, col: string) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, Math.PI * 2); g.fill(); };
/** A round form in steps: an ink rim, the shades stacked in toward the light. */
const orb = (g: Ctx, x: number, y: number, rx: number, ry: number, R: string[]) => {
  ell(g, x, y, rx + 1, ry + 1, INK);
  ell(g, x, y, rx, ry, R[1]);
  ell(g, x - rx * 0.1, y - ry * 0.1, rx * 0.86, ry * 0.86, R[2]);
  ell(g, x - rx * 0.26, y - ry * 0.28, rx * 0.5, ry * 0.46, R[3]);
  ell(g, x - rx * 0.42, y - ry * 0.44, rx * 0.18, ry * 0.16, R[4]);
};
/** A shape in steps: `path` (begins its own path), inked, filled shade, then the lit steps shrunk in toward (lx, ly). */
const slab = (g: Ctx, path: () => void, R: string[], lx: number, ly: number) => {
  g.save();
  path(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); g.fillStyle = R[1]; g.fill(); g.clip();
  for (const [k, col] of [[0.88, R[2]], [0.6, R[3]], [0.28, R[4]]] as [number, string][]) {
    g.save(); g.translate(lx, ly); g.scale(k, k); g.translate(-lx, -ly); path(); g.fillStyle = col; g.fill(); g.restore();
  }
  g.restore();
};
const poly = (pts: number[]) => (g: Ctx) => () => { g.beginPath(); g.moveTo(pts[0], pts[1]); for (let k = 2; k < pts.length; k += 2) g.lineTo(pts[k], pts[k + 1]); g.closePath(); };
/** A thick limb: inked, the shade, the base toward the light, a lit streak. */
const limb = (g: Ctx, a: P, b: P, w: number, R: string[]) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
  let nx = -dy / d, ny = dx / d;
  if (nx + ny > 0) { nx = -nx; ny = -ny; }
  g.lineCap = 'round';
  const line = (o: number, lw: number, col: string) => { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(a[0] + nx * o, a[1] + ny * o); g.lineTo(b[0] + nx * o, b[1] + ny * o); g.stroke(); };
  line(0, w + 2, INK); line(0, w, R[1]); line(w * 0.14, w * 0.62, R[2]); line(w * 0.3, Math.max(1, w * 0.22), R[3]);
  g.lineCap = 'butt';
};
/** An impact: a stepped starburst. */
const burst = (g: Ctx, x: number, y: number, r: number, u: number) => {
  const rr = r * (0.6 + u * 0.6);
  for (const [s, col] of [[1.15, INK], [1, '#F472B6'], [0.75, '#FEF08A'], [0.42, '#FFFFFF']] as const) {
    g.fillStyle = col; g.beginPath();
    for (let i = 0; i < 16; i++) { const a = (i * Math.PI) / 8 + 0.2, q = (i % 2 ? 0.45 : 1) * rr * s; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); }
    g.closePath(); g.fill();
  }
};
const drop = (g: Ctx, x: number, y: number, col: string, lit: string) => { box(g, x - 1, y - 1, 4, 4, INK); box(g, x, y, 2, 2, col); box(g, x, y, 1, 1, lit); };
/** Sweat flying off a head now and then. */
const sweat = (g: Ctx, x: number, y: number, f: number, seed: number) => {
  for (let i = 0; i < 3; i++) {
    const t = ((f + seed * 7 + i * 9) % 24) / 24, dir = i % 2 ? 1 : -1;
    if (t > 0.8) continue;
    drop(g, x + dir * (8 + t * 14), y - 8 - Math.sin(t * Math.PI) * 10 + t * 10, '#A5F3FC', '#FFFFFF');
  }
};
/** A cloud of it coming up from (x, y), `a` frames in: brown puffs, green wisps, flies. */
const stink = (g: Ctx, x: number, y: number, a: number) => {
  if (a < 0) return;
  for (let k = 0; k < 5; k++) {
    const r = Math.min(9, 2 + a * 0.35) * (1 - k * 0.12), px = x + (hash(k) - 0.5) * 18 + Math.sin(a * 0.1 + k) * 2, py = y - a * 0.5 - k * 4;
    if (a < 70) { ell(g, px, py, r + 1, r * 0.8 + 1, INK); ell(g, px, py, r, r * 0.8, POOP[2]); ell(g, px - r * 0.3, py - r * 0.3, r * 0.5, r * 0.4, POOP[4]); }
  }
  for (let k = 0; k < 3; k++) {
    const sx = x - 8 + k * 8;
    for (let s = 0; s < 6; s++) box(g, sx + Math.round(Math.sin(a * 0.25 + s * 0.9 + k) * 2), y - 10 - s * 4 - (a % 12), 2, 3, s % 2 ? '#86C232' : '#5A8A1E');
  }
};
const flies = (g: Ctx, x: number, y: number, f: number, n = 3) => {
  for (let k = 0; k < n; k++) { const a = f * 0.3 + k * 2.1; box(g, x + Math.cos(a) * 12 + Math.sin(a * 2.3) * 3, y + Math.sin(a * 1.3) * 7, 2, 1, INK); box(g, x + Math.cos(a) * 12 + Math.sin(a * 2.3) * 3, y - 1 + Math.sin(a * 1.3) * 7, 1, 1, '#C8D8F0'); }
};

// ---------------------------------------------------------------------------------------------------------------
// The two of them: a figure from the waist (0, 0) up (the shoulders at -34, the head's middle at (2, -52)), its legs
// under the waist if it's lifted off its feet, facing +x (dir: -1 mirrored), turned `rot` about the waist, the body
// tipped `lean` about it, the head `tilt` on the neck (0, -40); its hands anywhere in the picture.

interface Fig {
  who: Who; x: number; y: number; rot: number; dir: 1 | -1; lean: number; tilt: number; face: Face;
  /** Near hand, far hand (picture). */
  hands: [P, P];
  /** Its legs (lifted): their kick's phase; null, cut off by the frame's bottom. */
  legs: number | null;
  sc?: number; squash?: number; purple?: number; stuffed?: number; pooped?: boolean; bloody?: number; alpha?: number;
}

/** A point of the figure's (0 legs, 1 the body, 2 the head) in the picture. */
const xf = (F: Fig, p: P, part: 0 | 1 | 2): P => {
  let [x, y] = p;
  if (part === 2) { [x, y] = rot(x, y + 40, F.tilt); y -= 40; }
  if (part >= 1) [x, y] = rot(x, y, F.lean);
  const s = F.sc ?? 1;
  [x, y] = rot(x * F.dir * s, y * s, F.rot);
  return [F.x + x, F.y + y];
};
const headOf = (F: Fig) => xf(F, [2, -52], 2);

const SHOULDER: [P, P] = [[9, -31], [-9, -33]];
const drawArm = (g: Ctx, F: Fig, near: boolean) => {
  const R = skinOf(F.who), s = F.sc ?? 1, seg = 17 * s;
  const sh = xf(F, SHOULDER[near ? 0 : 1], 1);
  let h = F.hands[near ? 0 : 1];
  const dx = h[0] - sh[0], dy = h[1] - sh[1], d = Math.hypot(dx, dy) || 1;
  if (d > seg * 2) h = [sh[0] + (dx / d) * seg * 2, sh[1] + (dy / d) * seg * 2];
  const dd = Math.min(d, seg * 2), off = Math.sqrt(Math.max(0, seg * seg - (dd / 2) ** 2));
  let nx = -dy / d, ny = dx / d;
  if (ny < 0) { nx = -nx; ny = -ny; }
  const el: P = [(sh[0] + h[0]) / 2 + nx * off, (sh[1] + h[1]) / 2 + ny * off];
  const w = F.who.mh ? 9 : 10.5;
  limb(g, sh, el, w * s, R); limb(g, el, h, (w - 1.5) * s, R);
  orb(g, h[0], h[1], 4.6 * s, 4.2 * s, R);
  box(g, h[0] - 2 * s, h[1] - 1, 4 * s, 1, R[0]);
};

const legColOf = (who: Who): string[] => {
  if (who.mh) return who.pants === 'nude' ? MSK : JEANS;
  const L = who.L;
  return L.kit === 'cape' ? skinOf(who) : L.kit === 'viking' ? r5('#5A4A3A') : L.kit === 'tee' ? r5('#3A4A6A') : L.kit === 'knight' ? STEEL : L.kit === 'wizard' ? r5(L.main) : r5('#2A2A34');
};
/** Its legs, kicking (k: the kick's phase), boots on (barefoot naked). */
const paintLegs = (g: Ctx, F: Fig, k: number) => {
  const R = legColOf(F.who), nude = F.who.mh && F.who.pants === 'nude';
  for (const [s, ph] of [[-1, 0], [1, Math.PI]] as [number, number][]) {
    const a = Math.sin(k + ph) * 0.55;
    const hip: P = [s * 7, 3], knee: P = [hip[0] + rot(0, 19, a)[0], hip[1] + rot(0, 19, a)[1]], foot: P = [knee[0] + rot(0, 18, a * 1.6 - 0.25)[0], knee[1] + rot(0, 18, a * 1.6 - 0.25)[1]];
    limb(g, hip, knee, 11, R); limb(g, knee, foot, 10, R);
    if (nude) orb(g, foot[0] + 2, foot[1] + 1, 5, 3, MSK);
    else { box(g, foot[0] - 5, foot[1] - 3, 12, 7, INK); box(g, foot[0] - 4, foot[1] - 2, 10, 5, F.who.mh ? '#27272A' : '#3A2A1A'); box(g, foot[0] - 3, foot[1] - 2, 5, 1, F.who.mh ? '#52525B' : '#6A4A2A'); }
  }
  // (the seat of his pants, behind: the shitty stain; naked, his ass)
  if (F.who.mh && F.who.pants === 'shitty') { ell(g, -12, 6, 7, 8, INK); ell(g, -12, 6, 6, 7, POOP[2]); ell(g, -13, 4, 3, 3, POOP[3]); box(g, -14, 13, 2, 4, POOP[2]); }
  if (nude) { orb(g, -11, 6, 8, 8, MSK); box(g, -11, 0, 1, 12, MSK[0]); }
  if (F.pooped) { ell(g, -12, 7, 8, 8, INK); ell(g, -12, 7, 7, 7, POOP[2]); ell(g, -13, 5, 3, 3, POOP[4]); box(g, -15, 14, 2, 5, POOP[2]); box(g, -10, 14, 2, 3, POOP[1]); }
};

/** The torso, from the waist (0, 0) to the shoulders (-34): his own, or the suitor's kit over his. */
const paintTorso = (g: Ctx, F: Fig) => {
  const R = skinOf(F.who), who = F.who;
  if (who.mh) {
    slab(g, poly([-24, -34, -10, -41, 10, -41, 24, -34, 22, -20, 16, 2, -16, 2, -22, -20])(g), R, -12, -34);
    // (pecs, abs, the line down the middle)
    box(g, -14, -25, 12, 2, R[0]); box(g, 2, -25, 13, 2, R[0]); box(g, 0, -33, 1, 9, R[0]); box(g, -12, -31, 6, 2, R[4]); box(g, 4, -31, 5, 1, R[3]);
    for (let k = 0; k < 3; k++) { box(g, -7, -19 + k * 6, 6, 1, R[0]); box(g, 2, -19 + k * 6, 6, 1, R[0]); box(g, -6, -18 + k * 6, 3, 2, R[3]); }
    // (the waist: belt and jeans, stained; or nothing on)
    if (who.pants === 'nude') { box(g, -15, 0, 30, 6, R[2]); box(g, -8, -2, 2, 6, R[0]); box(g, 7, -2, 2, 6, R[0]); box(g, -2, 3, 6, 3, '#18181B'); }
    else {
      box(g, -17, -2, 34, 12, INK); box(g, -16, 2, 32, 8, JEANS[2]); box(g, -16, 2, 32, 1, JEANS[3]); box(g, 6, 4, 1, 6, JEANS[1]);
      box(g, -16, -1, 32, 3, '#5C2A0B'); box(g, -16, -1, 32, 1, '#9A4A1A'); box(g, 2, -2, 6, 5, INK); box(g, 3, -1, 4, 3, '#FACC15'); box(g, 3, -1, 2, 1, '#FEF9C3');
      if (who.pants === 'shitty') { box(g, -16, 2, 9, 8, POOP[2]); for (let y = 2; y < 10; y++) for (let x = -7 + (y % 2); x < -3; x += 2) box(g, x, y, 1, 1, POOP[2]); box(g, -14, 3, 3, 2, POOP[3]); }
    }
    return;
  }
  const L = who.L, M = r5(L.main), T = r5(L.trim);
  if (L.kit === 'cape') { slab(g, poly([-20, -38, -36, 8, -8, 8])(g), M, -26, -30); }
  slab(g, poly([-27, -34, -10, -42, 10, -42, 27, -34, 25, -18, 18, 2, -18, 2, -24, -18])(g), R, -14, -36);
  box(g, -15, -25, 13, 2, R[0]); box(g, 2, -25, 14, 2, R[0]); box(g, 0, -34, 1, 10, R[0]); box(g, -13, -32, 7, 2, R[4]);
  if (L.gut > 0.3) orb(g, 4, -8, 14 + L.gut * 4, 9, R);
  else for (let k = 0; k < 3; k++) { box(g, -7, -19 + k * 6, 6, 1, R[0]); box(g, 2, -19 + k * 6, 6, 1, R[0]); }
  if (L.kit === 'cape') { box(g, -4, -42, 8, 5, INK); box(g, -3, -41, 6, 3, T[2]); box(g, -3, -41, 2, 1, T[4]); for (const [x, y] of [[-12, -30], [8, -28], [-4, -14], [14, -20]]) box(g, x, y, 2, 1, '#FFFFFF'); box(g, -17, -3, 34, 7, INK); box(g, -16, -2, 32, 5, M[2]); box(g, -16, -2, 32, 1, T[3]); }
  if (L.kit === 'tee') { slab(g, poly([-17, -36, -6, -36, 0, -30, 6, -36, 17, -36, 18, 2, -18, 2])(g), M, -8, -32); box(g, -18, -20, 36, 3, T[2]); box(g, -18, -20, 36, 1, T[4]); box(g, -18, 0, 36, 6, '#3A4A6A'); }
  if (L.kit === 'knight') {
    box(g, -27, -37, 54, 11, INK); box(g, -26, -36, 52, 9, STEEL[2]);
    for (let y = -36; y < -27; y += 2) for (let x = -26 + (y % 4 === 0 ? 0 : 1); x < 26; x += 2) box(g, x, y, 1, 1, STEEL[1]);
    box(g, -26, -36, 52, 1, STEEL[4]);
    slab(g, poly([-16, -28, 16, -28, 16, 6, -16, 6])(g), M, -8, -26);
    box(g, -2, -24, 4, 26, T[2]); box(g, -10, -16, 20, 4, T[2]); box(g, -2, -24, 1, 26, T[4]);
  }
  if (L.kit === 'viking') {
    limb(g, [14, -32], [-16, 0], 4, r5('#4A3018'));
    orb(g, 13, -33, 15, 8, r5(L.main)); for (let k = 0; k < 7; k++) box(g, 1 + k * 4, -27 + (k % 2) * 2, 2, 4, mix(L.main, INK, 0.4));
    box(g, -20, -4, 40, 7, INK); box(g, -19, -3, 38, 5, '#4A3018'); box(g, -4, -4, 8, 7, STEEL[3]); box(g, -3, -3, 3, 2, STEEL[4]);
  }
  if (L.kit === 'wizard') {
    slab(g, poly([-24, -36, -6, -38, 0, -22, 6, -38, 24, -36, 20, 4, -20, 4])(g), M, -12, -32);
    box(g, -19, -6, 38, 2, '#D8C890'); box(g, -6, -6, 3, 8, '#D8C890');
    for (const [x, y] of [[-14, -20], [12, -14], [-8, -8]]) { box(g, x, y, 2, 2, T[3]); box(g, x - 1, y + 0.5, 4, 1, T[3]); }
  }
  if (L.kit === 'prince') {
    slab(g, poly([-18, -36, -8, -36, -3, -14, 3, -14, 8, -36, 18, -36, 17, 2, -17, 2])(g), M, -8, -32);
    g.lineCap = 'butt'; g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.moveTo(-21, -34); g.lineTo(17, 0); g.stroke();
    g.strokeStyle = '#E8B4C8'; g.lineWidth = 6; g.stroke(); g.strokeStyle = '#FFF6E8'; g.lineWidth = 2; g.stroke();
    g.strokeStyle = T[3]; g.lineWidth = 1.5; g.beginPath(); g.arc(1, -40, 9, 0.5, Math.PI - 0.5); g.stroke(); g.beginPath(); g.arc(1, -38, 13, 0.6, Math.PI - 0.6); g.stroke();
    box(g, -18, 0, 36, 6, '#2A2A34');
  }
};

/** The head (its middle at the origin, facing +x): the face by `face`, the hair, the hat. */
const paintHead = (g: Ctx, F: Fig, f: number) => {
  const who = F.who, R = skinOf(who), face = F.face;
  const big = who.mh ? 0 : 1;
  // (the neck: thick)
  box(g, -8 - big, 8, 16 + big * 2, 9, INK); box(g, -7 - big, 8, 14 + big * 2, 8, R[1]); box(g, -7 - big, 8, 4, 8, R[2]);
  // (the ear, the head (a square jaw), the cleft (theirs))
  orb(g, -10 - big, 1, 3, 4, R);
  if (F.squash && F.squash !== 1) { g.save(); g.scale(F.squash, 1 / F.squash); }
  slab(g, poly(who.mh ? [-11, -11, 9, -12, 12, -4, 13, 3, 11, 9, 6, 13, -5, 13, -11, 8] : [-12, -12, 10, -13, 13, -5, 14, 4, 12, 11, 6, 15, -6, 15, -12, 9])(g), R, -5, -8);
  if (!who.mh) { box(g, 9, 12, 1, 2, R[0]); box(g, -2, -7, 14, 3, R[0]); box(g, -1, -7, 12, 1, mix(R[0], who.L.hair, 0.5)); }
  // (stubble, dithered: his)
  if (who.mh) { g.fillStyle = 'rgba(60, 30, 10, 0.5)'; for (let y = 5; y < 13; y++) for (let x = -7 + (y % 2); x < 11; x += 2) g.fillRect(x, y, 1, 1); }
  // (purple: choking)
  if (F.purple) { g.globalAlpha = 0.55 * F.purple; poly(who.mh ? [-11, -11, 9, -12, 12, -4, 13, 3, 11, 9, 6, 13, -5, 13, -11, 8] : [-12, -12, 10, -13, 13, -5, 14, 4, 12, 11, 6, 15, -6, 15, -12, 9])(g)(); g.fillStyle = '#6E2898'; g.fill(); g.globalAlpha = 1; }
  if (face === 'strain') { g.globalAlpha = 0.25; poly([-11, -11, 9, -12, 12, -4, 13, 3, 11, 9, 6, 13, -5, 13, -11, 8])(g)(); g.fillStyle = '#E02020'; g.fill(); g.globalAlpha = 1; }
  // (the nose)
  box(g, 11 + big, -2, 4, 6, INK); box(g, 11 + big, -1, 3, 4, R[2]); box(g, 11 + big, 3, 3, 1, R[0]); box(g, 12 + big, -1, 1, 1, R[4]);
  // EYES
  const ey = -3;
  if (face === 'dead') for (const ex of [2, 8]) { box(g, ex - 1, ey - 1, 1, 1, INK); box(g, ex + 2, ey - 1, 1, 1, INK); box(g, ex, ey, 2, 2, INK); box(g, ex - 1, ey + 2, 1, 1, INK); box(g, ex + 2, ey + 2, 1, 1, INK); }
  else if (face === 'strain' || face === 'pain') { box(g, 0, ey, 4, 1, INK); box(g, 6, ey, 5, 1, INK); box(g, 0, ey + 1, 1, 1, INK); box(g, 10, ey + 1, 1, 1, INK); }
  else if (face === 'shock' || face === 'scream' || face === 'choke') { box(g, 0, ey - 2, 5, 5, INK); box(g, 1, ey - 1, 3, 3, '#FFFFFF'); box(g, 6, ey - 2, 6, 5, INK); box(g, 7, ey - 1, 4, 3, '#FFFFFF'); box(g, 2, ey, 1, 1, INK); box(g, 9, ey, 1, 1, INK); if (face === 'choke') { box(g, 1, ey + 1, 3, 1, '#F87171'); box(g, 7, ey + 1, 4, 1, '#F87171'); } }
  else if (face === 'dazed') { box(g, 0, ey - 1, 5, 4, INK); box(g, 1, ey, 3, 2, '#FFFFFF'); box(g, 6, ey - 1, 6, 4, INK); box(g, 7, ey, 4, 2, '#FFFFFF'); box(g, 3, ey, 1, 2, INK); box(g, 7, ey, 1, 2, INK); }
  else if (face === 'sneer' || face === 'smug') { box(g, 0, ey, 4, 2, INK); box(g, 1, ey, 2, 1, '#FFFFFF'); box(g, 6, ey, 5, 2, INK); box(g, 7, ey, 3, 1, '#FFFFFF'); }
  else { box(g, 1, ey - 1, 3, 3, '#FFFFFF'); box(g, 3, ey - 1, 1, 2, INK); box(g, 6, ey - 1, 4, 3, '#FFFFFF'); box(g, 8, ey - 1, 2, 2, INK); box(g, 1, ey + 2, 9, 1, R[0]); }
  // BROWS: crushed into a V (raised in shock; one up, sneering)
  const browCol = who.mh ? '#09090B' : who.L.hair;
  if (face === 'shock' || face === 'scream' || face === 'choke') { box(g, -1, ey - 6, 5, 2, browCol); box(g, 6, ey - 6, 6, 2, browCol); }
  else if (face === 'sneer' || face === 'smug') { box(g, -1, ey - 3, 5, 2, browCol); box(g, 6, ey - 5, 6, 2, browCol); box(g, 10, ey - 6, 2, 1, browCol); }
  else if (face !== 'dead') for (let i = 0; i < 5; i++) { box(g, -1 + i, ey - 6 + Math.floor(i * 0.7), 2, 2, browCol); box(g, 11 - i, ey - 6 + Math.floor(i * 0.7), 2, 2, browCol); }
  // MOUTH
  const my = 6 + big;
  if (face === 'grit' || face === 'strain') { box(g, 2, my - 1, 10, 5, INK); box(g, 3, my, 8, 3, '#FFFFFF'); box(g, 3, my + 1, 8, 1, '#D4D4D8'); box(g, 5, my, 1, 3, INK); box(g, 8, my, 1, 3, INK); }
  else if (face === 'roar') { box(g, 2, my - 2, 10, 8, INK); box(g, 3, my - 1, 8, 6, '#7F1D1D'); box(g, 3, my - 1, 8, 1, '#FFFFFF'); box(g, 4, my + 3, 5, 2, '#E0607A'); }
  else if (face === 'shock') { box(g, 5, my - 1, 5, 6, INK); box(g, 6, my, 3, 4, '#5A0A0A'); }
  else if (face === 'scream') { box(g, 2, my - 3, 11, 10, INK); box(g, 3, my - 2, 9, 8, '#7F1D1D'); box(g, 3, my - 2, 9, 2, '#FFFFFF'); box(g, 7, my, 1, 2, '#E0607A'); box(g, 4, my + 4, 6, 2, '#E0607A'); }
  else if (face === 'grin' || face === 'smug') { box(g, 2, my, 10, 3, INK); box(g, 3, my, 8, 2, '#FFFFFF'); box(g, 11, my - 1, 2, 1, INK); box(g, 6, my, 1, 2, '#D4D4D8'); }
  else if (face === 'sneer') { box(g, 3, my + 1, 9, 2, INK); box(g, 8, my, 4, 2, '#FFFFFF'); box(g, 11, my - 1, 2, 1, INK); box(g, 8, my + 1, 4, 1, INK); }
  else if (face === 'pain') { box(g, 3, my, 10, 4, INK); box(g, 4, my + 1, 8, 2, '#FFFFFF'); box(g, 6, my + 1, 1, 2, INK); box(g, 9, my + 1, 1, 2, INK); }
  else if (face === 'dazed' || face === 'dead') { box(g, 4, my, 7, 4, INK); box(g, 6, my + 2, 4, 5, '#E0607A'); box(g, 6, my + 2, 2, 1, '#F49AAE'); box(g, 6, my + 6, 4, 1, INK); }
  else if (face === 'choke') {
    // (cheeks blown out round his own roses, stems out of his mouth)
    orb(g, 9, my + 1, 5, 4, R);
    const n = F.stuffed ?? 0;
    for (let k = 0; k < n; k++) { const sx = 10 + (k % 3) * 3, sy = my + (k % 2) * 2; box(g, sx, sy - 1, 8 + k, 2, '#2A6A2A'); orb(g, sx + 8 + k, sy - 2 + (k % 2) * 3, 3, 3, r5(['#E11D48', '#F472B6', '#FB7185'][k % 3])); }
  }
  // (blood: a broken nose, a split brow, teeth gone)
  const bl = F.bloody ?? 0;
  if (bl > 0) { box(g, 12 + big, 3, 2, 3 + bl * 3, '#B91C1C'); box(g, 12 + big, 3, 1, 2 + bl * 3, '#EF4444'); }
  if (bl > 1) { box(g, 6, -10, 5, 3, '#7A1A6A'); box(g, 8, -8, 2, 6, '#B91C1C'); box(g, 4, my, 2, 2, INK); }
  if (bl > 2) { box(g, -4, -4, 5, 4, 'rgba(90, 30, 110, 0.6)'); box(g, 10, my + 2, 3, 6, '#B91C1C'); }
  if (who.mh) {
    // (the flat-top, the rage vein)
    box(g, -12, -20, 23, 11, INK); box(g, -11, -19, 21, 9, MHAIR[2]); box(g, -11, -19, 21, 1, MHAIR[4]); box(g, -11, -11, 21, 1, MHAIR[1]);
    for (let x = -10; x < 10; x += 2) box(g, x, -20, 1, 1, MHAIR[3]);
    box(g, -12, -11, 3, 8, INK); box(g, -11, -10, 2, 6, MHAIR[1]);
    box(g, -4, -8, 1, 1, '#B04A3A'); box(g, -3, -7, 1, 2, '#B04A3A'); box(g, -4, -5, 1, 1, '#B04A3A');
  } else paintHat(g, who.L, f);
  if (F.squash && F.squash !== 1) g.restore();
};

/** The suitor's hair and hat, his beard, by his kit. */
const paintHat = (g: Ctx, L: SuitorLook, f: number) => {
  const Hr = r5(L.hair), M = r5(L.main), T = r5(L.trim);
  if (L.kit === 'tee') {
    box(g, -12, -7, 3, 9, L.hair);
    orb(g, 0, -12, 13, 8, M); box(g, -13, -7, 26, 3, INK); box(g, -12, -6, 24, 1, T[2]);
    box(g, -24, -12, 12, 5, INK); box(g, -23, -11, 10, 3, M[1]); box(g, -23, -11, 10, 1, M[3]);
    box(g, -13, -10, 3, 2, L.hair);
  }
  if (L.kit === 'cape') {
    box(g, -12, -15, 24, 6, INK); box(g, -11, -14, 22, 5, Hr[2]); box(g, -8, -13, 7, 1, Hr[4]);
    g.save(); g.translate(0, -14); g.rotate(-0.18);
    slab(g, poly([-11, 0, -11, -11, -6, -5, -1, -14, 4, -5, 9, -11, 9, 0])(g), T, -6, -8);
    box(g, -2, -5, 3, 3, '#DC2626'); box(g, -2, -5, 1, 1, '#FCA5A5'); box(g, -10, -2, 19, 1, T[1]);
    g.restore();
  }
  if (L.kit === 'knight') {
    orb(g, -16, -20, 9, 4, T);
    orb(g, 0, -9, 14, 11, STEEL);
    box(g, -14, -8, 4, 16, INK); box(g, -13, -7, 3, 14, STEEL[1]);
    box(g, -3, -26, 18, 6, INK); box(g, -2, -25, 16, 4, STEEL[3]); box(g, -2, -25, 16, 1, STEEL[4]); box(g, 1, -23, 10, 1, INK);
    box(g, 9, 3, 4, 6, L.hair);
  }
  if (L.kit === 'viking') {
    for (const s of [-1, 1]) { const x0 = s > 0 ? 9 : -10; slab(g, poly([x0, -11, x0 + s * 11, -17, x0 + s * 10, -31, x0 + s * 5, -15])(g), CREAM, x0 + s * 6, -20); }
    orb(g, 0, -10, 13, 9, STEEL); box(g, -12, -4, 25, 2, INK); box(g, -11, -4, 23, 1, STEEL[3]);
    for (let x = -10; x < 12; x += 5) box(g, x, -4, 2, 2, STEEL[4]);
    box(g, 9, -10, 3, 9, INK); box(g, 10, -9, 1, 7, STEEL[3]);
    slab(g, poly([0, 7, 15, 5, 13, 22, 9, 36, 5, 24, 2, 16])(g), Hr, 6, 10);
    for (const y of [18, 27]) { box(g, 7, y, 5, 2, T[2]); box(g, 7, y, 2, 1, T[4]); }
    box(g, 3, 4, 12, 3, INK); box(g, 4, 4, 10, 2, Hr[2]);
  }
  if (L.kit === 'wizard') {
    slab(g, poly([-1, 6, 15, 4, 12, 20, 7, 50, 2, 24])(g), Hr, 6, 12);
    box(g, 3, 4, 12, 3, INK); box(g, 4, 4, 10, 2, Hr[3]);
    ell(g, 0, -11, 19, 5, INK); ell(g, 0, -11, 18, 4, M[1]); ell(g, -2, -12, 12, 2, M[2]);
    slab(g, poly([-11, -13, 11, -13, 4, -28, -8, -46, -4, -28])(g), M, -4, -26);
    for (const [x, y] of [[-3, -20], [2, -16], [-5, -32]]) { box(g, x, y, 2, 2, T[3]); box(g, x - 1, y + 0.5, 4, 1, T[3]); }
    void f;
  }
  if (L.kit === 'prince') {
    box(g, -12, -15, 24, 6, INK); box(g, -11, -14, 22, 5, Hr[2]); box(g, -6, -13, 8, 1, Hr[4]);
    orb(g, -9, -18, 5, 4, Hr); box(g, -6, -18, 2, 3, T[2]);
  }
};

/** A whole figure: its legs, its body tipped, its head on its neck (no arms: those go round everybody, drawArm). */
const drawFig = (g: Ctx, F: Fig, f: number) => {
  g.save();
  if (F.alpha !== undefined) g.globalAlpha = F.alpha;
  g.translate(F.x, F.y); g.rotate(F.rot); g.scale(F.dir * (F.sc ?? 1), F.sc ?? 1);
  if (F.legs !== null) paintLegs(g, F, F.legs);
  g.rotate(F.lean);
  paintTorso(g, F);
  g.translate(0, -40); g.rotate(F.tilt); g.translate(0, 40);
  g.translate(2, -52);
  paintHead(g, F, f);
  g.restore();
};
/** Everybody: the far arms behind all of them, the bodies (back to front), the near arms over all of them. */
const drawAll = (g: Ctx, figs: Fig[], f: number, mid?: () => void) => {
  for (const F of figs) { if (F.alpha !== undefined) g.globalAlpha = F.alpha; drawArm(g, F, false); g.globalAlpha = 1; }
  for (const F of figs) drawFig(g, F, f);
  mid?.();
  for (const F of figs) { if (F.alpha !== undefined) g.globalAlpha = F.alpha; drawArm(g, F, true); g.globalAlpha = 1; }
};

// ---------------------------------------------------------------------------------------------------------------
// The gondola round them

const paintGondola = (g: Ctx, f: number, cap: string, opts: { floor?: boolean; hole?: number | null } = {}) => {
  // (the sky through the open top, banded by the hour; the wheel's spokes going off behind)
  const sky = skyRamp(['#7EC0F0', '#A8D8F8', '#D2ECFA', '#FFE4F0']);
  sky.forEach((col, i) => box(g, 0, (i * 50) / sky.length, W, 50 / sky.length + 1, col));
  g.strokeStyle = '#3A3450'; g.lineWidth = 3;
  for (let k = 0; k < 4; k++) { const a = 2.4 + k * 0.32 + f * 0.0016; g.beginPath(); g.moveTo(260, -60); g.lineTo(260 + Math.cos(a) * 400, -60 + Math.sin(a) * 400); g.stroke(); }
  g.strokeStyle = '#5A5470'; g.lineWidth = 1;
  for (let k = 0; k < 4; k++) { const a = 2.4 + k * 0.32 + f * 0.0016; g.beginPath(); g.moveTo(259, -61); g.lineTo(259 + Math.cos(a) * 400, -61 + Math.sin(a) * 400); g.stroke(); }
  // (the petal back: five big petals, stepped, veined)
  const Pt = r5(mix(cap, '#FFFFFF', 0.45));
  for (const p of [0, 4, 1, 3, 2]) {
    const px = 20 + p * 40, top = 26 - (2 - Math.abs(p - 2)) * 6;
    slab(g, () => { g.beginPath(); g.ellipse(px, top + 46, 26, 46, 0, Math.PI, 0); g.lineTo(px + 26, H + 2); g.lineTo(px - 26, H + 2); g.closePath(); }, Pt, px - 10, top + 20);
    g.strokeStyle = Pt[0]; g.lineWidth = 1; g.beginPath(); g.moveTo(px, H); g.quadraticCurveTo(px + 3, top + 40, px, top + 6); g.stroke();
  }
  // (the posts: cream stalks, ringed)
  for (const x of [0, 186]) { box(g, x, 0, 14, H, INK); box(g, x + 1, 0, 12, H, CREAM[2]); box(g, x + 1, 0, 3, H, CREAM[3]); box(g, x + 2, 0, 1, H, CREAM[4]); box(g, x + 10, 0, 3, H, CREAM[1]); for (let y = 8; y < H; y += 16) { box(g, x, y, 14, 3, INK); box(g, x + 1, y + 1, 12, 1, CREAM[1]); } }
  // (the cap's underside: frilled gills, and the fairy lights along its rim, twinkling)
  const Cp = r5(cap);
  box(g, 0, 0, W, 9, INK); box(g, 0, 0, W, 8, Cp[0]);
  for (let x = 0; x < W; x += 6) { box(g, x, 1, 3, 7, Cp[1]); box(g, x, 1, 1, 7, Cp[2]); }
  for (let x = -4; x < W; x += 12) { ell(g, x + 6, 9, 7, 4, INK); ell(g, x + 6, 9, 6, 3, Cp[2]); ell(g, x + 4, 8, 3, 1.5, Cp[3]); }
  for (let i = 0; i < 13; i++) {
    const lx = 6 + i * 16, on = (i + Math.floor(f / 10)) % 4 !== 0, col = i % 3 ? '#FEF08A' : (i % 2 ? '#A5F3FC' : '#F9A8D4');
    box(g, lx - 1, 13, 4, 4, INK); box(g, lx, 14, 2, 2, on ? col : mix(col, INK, 0.5)); if (on) box(g, lx, 14, 1, 1, '#FFFFFF');
  }
  void opts;
};
/** The gondola's floor, edge on across the bottom (the piledriver's): its lit lip, gilt, the hole once he's through. */
const paintFloor = (g: Ctx, hole: number | null, cap: string) => {
  const Cp = r5(cap), Gd = r5(GOLD[3]);
  box(g, 0, 86, W, 14, INK); box(g, 0, 88, W, 12, '#A85A98'); box(g, 0, 87, W, 2, '#F2D79A'); box(g, 0, 87, W, 1, '#FFF6D8'); box(g, 0, 92, W, 1, Gd[3]);
  for (let x = 6; x < W; x += 14) box(g, x, 92, 2, 2, Gd[4]);
  box(g, 0, 96, W, 4, Cp[0]);
  if (hole !== null) {
    g.fillStyle = INK; g.beginPath(); g.moveTo(hole - 18, 86);
    for (let k = 0; k <= 8; k++) g.lineTo(hole - 18 + k * 4.5, 86 + (k % 2 ? 6 : 1) + (k === 4 ? 4 : 0));
    g.lineTo(hole + 16, 100); g.lineTo(hole - 16, 100); g.closePath(); g.fill();
    for (const [dx, h] of [[-19, 6], [-12, 4], [13, 5], [18, 7]]) { box(g, hole + dx, 86 - h, 3, h, INK); box(g, hole + dx + 1, 87 - h, 1, h - 1, '#E2A0D8'); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The scenes (frame by frame: where everybody is)

const mhWho = (state: GameState): Who => ({ mh: true, pants: pantsOf(state), L: ROSTER[0].look });
const suWho = (i: number): Who => ({ mh: false, pants: 'clean', L: ROSTER[i].look });
const fig = (who: Who, x: number, y: number, dir: 1 | -1, face: Face): Fig => ({ who, x, y, rot: 0, dir, lean: 0.15, tilt: 0.05, face, hands: [[x + dir * 14, y], [x + dir * 6, y + 2]], legs: null });

/** The tussle: the grapple, who's on top by `bal` (-1 him on the losing end .. 1 him winning), a surge on a flash. */
const tussle = (g: Ctx, f: number, me: Who, su: Who, bal: number, flash: 'good' | 'bad' | null) => {
  const mk = clamp01((bal - 0.25) / 0.5), sk = clamp01((-bal - 0.25) / 0.5);
  const jit = (f % 4 < 2 ? 1 : -1) * 0.6, surge = flash === 'good' ? 3 : flash === 'bad' ? -3 : 0;
  const c0 = 100 + bal * 8 + surge;
  const M = fig(me, c0 - 27 + jit, 92, 1, sk > 0.3 ? 'strain' : bal > 0.35 ? (Math.floor(f / 20) % 3 === 0 ? 'grin' : 'roar') : 'grit');
  M.lean = 0.2 + 0.1 * mk - 0.22 * sk; M.tilt = 0.12 + 0.2 * mk - 0.5 * sk;
  const S = fig(su, c0 + 27 - jit, 92 + mk * 6, -1, mk > 0.3 ? 'pain' : sk > 0.3 ? 'sneer' : 'grit');
  S.lean = 0.2 + 0.55 * mk - 0.12 * sk; S.tilt = 0.1 + 0.45 * mk;
  const mh = headOf(M), sh = headOf(S);
  M.hands = [lerpP(lerpP([sh[0] - 6, sh[1] + 16], [sh[0] + 4, sh[1] - 6], mk), [S.x - 14, S.y - 40], sk), [c0 + 2, 72 + jit]];
  S.hands = [lerpP(lerpP([mh[0] + 6, mh[1] + 16], [c0 - 2, 70 - jit * 2], mk), [mh[0] + 9, mh[1] + 1], sk), [c0 - 6, 76]];
  drawAll(g, [M, S], f);
  sweat(g, mh[0], mh[1] - 6, f, 1); sweat(g, sh[0], sh[1] - 6, f + 11, 4);
  if (me.mh && me.pants === 'shitty') { flies(g, M.x - 10, 90, f); stink(g, M.x - 12, 100, (f % 60) + 10); }
  if (flash) burst(g, c0, 52, 9, (f % 6) / 6);
  else if (f % 26 < 3) burst(g, c0, 56, 6, (f % 26) / 3);
};

const smashLean = (t: number) => {
  if (t < 10) return 0.1;
  for (const h of HITS) {
    if (t < h - 4) return lerp(h === HITS[0] ? 0.1 : 0.55, -0.3, ease((t - (h - 24)) / 20));
    if (t < h) return lerp(-0.3, 0.6, (t - (h - 4)) / 4);
    if (t < h + 6) return 0.6;
  }
  return 0.6 + Math.min(0.15, (t - 100) * 0.01);
};

/** A kill, up close, `t` frames in. */
const killScene = (g: Ctx, f: number, t: number, how: KillKind, me: Who, su: Who, cap: string) => {
  const hitsDone = HITS.filter(h => t >= h).length;
  switch (how) {
    case 'smash': {
      // (spun round, grabbed by the hair from behind, his face into the post: three times; down it)
      paintGondola(g, f, cap);
      const S = fig(su, 141, 92 + Math.max(0, t - 100) * 1.1, t < 6 ? -1 : 1, t < 34 ? 'scream' : t < 64 ? 'pain' : t < 94 ? 'dazed' : 'dead');
      S.lean = smashLean(t); S.tilt = 0.2; S.bloody = hitsDone;
      const p = HITS.map(h => t - h).find(d => d >= 0 && d < 3);
      S.squash = p !== undefined ? 0.8 : 1;
      const sh = headOf(S);
      const flap = t < 94 ? [Math.sin(t * 0.7) * 6, Math.cos(t * 0.9) * 6] : [0, 0];
      S.hands = t < 94 ? [[S.x + 18 + flap[0], S.y - 30 + flap[1]], [S.x + 8 - flap[0], S.y - 26 - flap[1]]] : [[S.x + 14, S.y - 2], [S.x + 4, S.y]];
      const M = fig(me, Math.max(68, Math.min(126, sh[0] - 48)), 92, 1, t >= 100 ? 'grin' : 'roar');
      M.lean = 0.25 + (S.lean > 0.4 ? 0.15 : 0); M.tilt = 0.15;
      M.hands = t < 100 ? [[sh[0] - 10, sh[1] - 7], [sh[0] - 12, sh[1] + 2]] : [[M.x + 18, 70], [M.x + 12, 74]];
      // (the post's blood: a splat a hit, smeared down it as he slides)
      for (let k = 0; k < hitsDone; k++) { ell(g, 186, 50 + k * 3, 4 + k, 6 + k, '#7F1D1D'); ell(g, 186, 49 + k * 3, 3 + k, 4 + k, '#B91C1C'); box(g, 186, 54 + k * 4, 2, 6 + k * 3, '#991B1B'); }
      if (t > 100) { box(g, 184, 50, 4, Math.min(40, (t - 100) * 1.1), '#991B1B'); box(g, 185, 50, 1, Math.min(40, (t - 100) * 1.1), '#DC2626'); }
      drawAll(g, [M, S], f);
      // (teeth out of him, a couple a hit)
      for (const h of HITS) if (t >= h) for (let k = 0; k < 2; k++) { const a = t - h, x = 182 - a * (1.4 + k * 0.5), y = 50 - a * (2 - k * 0.4) + a * a * 0.12; if (y < H) { box(g, x - 1, y - 1, 4, 4, INK); box(g, x, y, 2, 2, '#FFFBEA'); } }
      for (const h of HITS) if (t >= h && t < h + 6) burst(g, 184, 50, 12, (t - h) / 6);
      if (t < 94) sweat(g, headOf(M)[0], headOf(M)[1] - 8, f, 2);
      stink(g, S.x - 12, 102, t - 104);
      if (t >= 104) flies(g, S.x - 10, 84, f);
      break;
    }
    case 'throw': {
      // (by the belt and the chest, up over his head, shaken, heaved out; he shits on the way up)
      paintGondola(g, f, cap);
      const lift = ease((t - 20) / 30), heave = clamp01((t - 74) / 18);
      const S = fig(su, 134, 92, -1, t < 10 ? 'grit' : 'scream');
      S.legs = t * 0.5; S.pooped = t >= 62; S.lean = 0; S.tilt = 0.3 * lift;
      if (heave <= 0) { S.x = lerp(134, 92, lift); S.y = lerp(92, 30, lift) + (t >= 50 ? Math.sin(t * 1.7) * 2 : 0); S.rot = lift * Math.PI / 2; }
      else { S.x = 92 + heave * 160; S.y = 30 - heave * 30 + heave * heave * 10; S.rot = Math.PI / 2 + heave * 3; S.sc = 1 - heave * 0.45; }
      S.hands = [xf(S, [16 + Math.sin(t * 0.8) * 8, -44 + Math.cos(t * 0.6) * 8], 1), xf(S, [-14 + Math.cos(t * 0.7) * 6, -46], 1)];
      const M = fig(me, 70, 92, 1, t < 20 ? 'grit' : t < 92 ? 'roar' : 'grin');
      M.lean = t < 20 ? lerp(0.15, 0.4, t / 20) : heave > 0 ? 0.3 * heave : lerp(0.4, -0.15, lift); M.tilt = t < 20 ? 0.2 : -0.2;
      M.hands = t < 20 ? [lerpP([84, 80], [S.x - 8, 94], t / 12), lerpP([80, 84], [S.x - 4, 70], t / 12)] : heave < 0.25 ? [xf(S, [2, 6], 0), xf(S, [0, -28], 1)] : [[M.x + 30, 30], [M.x + 26, 36]];
      if (heave > 0) for (let k = 0; k < 6; k++) box(g, S.x - 40 - hash(k + t) * 30, S.y - 20 + k * 7, 24 + hash(k) * 20, 1, k % 2 ? '#FFFFFF' : '#FDE68A');
      drawAll(g, [M, S], f);
      const mh = headOf(M);
      // (it drips on his flat-top; it stays there)
      if (t >= 62 && heave < 0.3) for (let k = 0; k < 5; k++) { const a = t - 62 - k * 3, butt = xf(S, [-12, 8], 0); if (a >= 0 && butt[1] + a * a * 0.3 < mh[1] - 18) drop(g, butt[0] + k, butt[1] + a * a * 0.3, POOP[2], POOP[4]); }
      if (t >= 72) { ell(g, mh[0] - 2, mh[1] - 20, 7, 3, INK); ell(g, mh[0] - 2, mh[1] - 20, 6, 2, POOP[2]); box(g, mh[0] - 6, mh[1] - 19, 2, 4, POOP[2]); box(g, mh[0] + 1, mh[1] - 19, 2, 6, POOP[2]); }
      if (t >= 20 && t < 74) sweat(g, mh[0], mh[1] - 8, f, 3);
      break;
    }
    case 'floor': {
      // (upended, a hop, driven down through the floor; his legs out of the hole, kicking, then not)
      paintGondola(g, f, cap);
      const flip = ease((t - 4) / 16), hop = t >= 36 && t < 48 ? Math.sin(((t - 36) / 12) * Math.PI) * 14 : 0, drive = clamp01((t - 48) / 8);
      const S = fig(su, lerp(132, 112, flip), lerp(92, 34, flip) - hop + drive * 44, -1, t < 8 ? 'shock' : 'scream');
      S.rot = flip * Math.PI; S.lean = 0; S.tilt = 0;
      S.legs = t < 92 ? t * 0.6 : t < 100 ? 1.2 + Math.sin(t * 2) * 0.1 : 1.6;
      S.pooped = t >= 100;
      S.hands = t < 56 ? [xf(S, [18 + Math.sin(t) * 5, -30], 1), xf(S, [-16, -34 + Math.cos(t) * 5], 1)] : [xf(S, [10, -60], 1), xf(S, [-6, -60], 1)];
      const M = fig(me, 80, 92 - hop + drive * 4, 1, t < 70 ? 'roar' : 'grin');
      M.lean = 0.1 + flip * 0.25;
      M.hands = t < 60 ? [xf(S, [-4, 14], 0), xf(S, [6, 18], 0)] : t < 80 ? [[M.x + 18, 70], [M.x + 12, 72]] : [[M.x + 14, 62 + (t % 8 < 4 ? 0 : 3)], [M.x + 10, 64 - (t % 8 < 4 ? 0 : 3)]];
      drawAll(g, [M, S], f, () => paintFloor(g, t >= 56 ? S.x : null, cap));
      if (t >= 56 && t < 64) burst(g, S.x, 88, 16, (t - 56) / 8);
      if (t >= 56) for (let k = 0; k < 8; k++) { const a = t - 56, ang = 0.3 + (k / 7) * 2.5, x = S.x + Math.cos(ang) * a * 3, y = 88 - Math.sin(ang) * a * 3 + a * a * 0.2; if (y < H) { box(g, x - 1, y - 1, 6, 4, INK); box(g, x, y, 4, 2, k % 2 ? '#A85A98' : '#6E2A6E'); } }
      if (t >= 100) { const butt = xf(S, [-12, 8], 0); stink(g, butt[0], butt[1], t - 100); flies(g, butt[0], butt[1] - 6, f); }
      if (t < 56) sweat(g, headOf(M)[0], headOf(M)[1] - 8, f, 5);
      break;
    }
    case 'fling': {
      // (by the ankles, round and round overhead, shitting in a spiral, let go off up into the sky)
      paintGondola(g, f, cap);
      const e = ease(t / 16);
      const phiAt = (tt: number) => (tt < 16 ? lerp(-Math.PI / 2, -2.706, ease(tt / 16)) : -2.706 + 0.3 * (tt - 16));
      const pivot: P = t < 16 ? lerpP([132, 136], [78, 22], e) : [78 + Math.sin(t * 0.4) * 2, 22];
      const at = (tt: number, alpha?: number): Fig => {
        const tc = Math.min(tt, 80), ph = phiAt(tc), d: P = [Math.cos(ph), Math.sin(ph)];
        const F = fig(su, pivot[0] + d[0] * 44, pivot[1] + d[1] * 44, -1, 'scream');
        F.rot = ph + Math.PI / 2; F.lean = 0; F.tilt = 0; F.legs = 0.4; F.alpha = alpha; F.pooped = tt >= 46;
        if (tt > 80) { const a = tt - 80; F.x += 9.3 * a; F.y += -9.3 * a + a * a * 0.25; F.rot += 0.3 * a; F.sc = Math.max(0.4, 1 - a * 0.04); }
        F.hands = [xf(F, [6, -76], 1), xf(F, [-6, -74], 1)];
        return F;
      };
      const S = at(t);
      const M = fig(me, 76, 92, 1, t < 92 ? 'roar' : 'grin');
      M.lean = t < 92 ? Math.sin(t * 0.3) * 0.1 : Math.sin(t * 0.2) * 0.15; M.tilt = M.lean;
      M.hands = t < 80 ? [[pivot[0] + 3, pivot[1] + 2], [pivot[0] - 3, pivot[1] + 3]] : [[M.x + 24, 30], [M.x + 20, 34]];
      const figs = t >= 16 && t < 80 ? [at(t - 2, 0.3), at(t - 1, 0.5), S] : [S];
      for (const F of figs.slice(0, -1)) drawFig(g, F, f);
      drawAll(g, [M, S], f);
      // (the spiral of it, flung off him)
      for (let k = 0; k < 18; k++) {
        const te = 46 + k * 2; if (te > Math.min(t, 80)) break;
        const a = t - te, F = at(te), butt = xf(F, [-12, 8], 0), ph = phiAt(te);
        const x = butt[0] - Math.sin(ph) * 8 * a * 0.6, y = butt[1] + Math.cos(ph) * 8 * a * 0.6 + a * a * 0.2;
        if (a < 24 && x > -4 && x < W && y < H) drop(g, x, y, POOP[2], POOP[4]);
      }
      if (t >= 92) for (let k = 0; k < 3; k++) { const a = t * 0.2 + (k * Math.PI * 2) / 3, h = headOf(M); box(g, h[0] + Math.cos(a) * 13 - 2, h[1] - 18 + Math.sin(a) * 3 - 2, 4, 4, INK); box(g, h[0] + Math.cos(a) * 13 - 1, h[1] - 18 + Math.sin(a) * 3 - 1, 2, 2, '#FEF08A'); }
      break;
    }
    case 'choke': {
      // (the bouquet off him; a fistful at a time down his throat; purple, bulging; gone)
      paintGondola(g, f, cap);
      const k = Math.floor((t - 14) / 12), j = (t - 14) % 12, reach = t >= 14 && t < 96 ? (j < 6 ? j / 6 : 1 - (j - 6) / 6) : 0;
      const S = fig(su, 132, 92 + (t >= 96 ? Math.min(10, (t - 96) * 0.3) : 0), -1, t < 14 ? 'sneer' : t < 96 ? 'choke' : 'dead');
      S.lean = t < 96 ? 0.1 - reach * 0.12 : lerp(0.1, -0.35, (t - 96) / 20); S.tilt = t >= 96 ? -0.4 : -reach * 0.15;
      S.purple = clamp01((t - 14) / 82); S.stuffed = t >= 20 ? Math.min(6, k + 1) : 0;
      const M = fig(me, 72, 92, 1, t < 100 ? 'roar' : 'grin');
      M.lean = 0.2 + reach * 0.15; M.tilt = 0.1;
      const mouth = xf(S, [8, -45], 2);
      const cocked: P = [M.x + 22, 56];
      M.hands = [t < 14 ? lerpP([M.x + 16, 74], [S.x - 26, 58], t / 10) : t < 100 ? lerpP(cocked, [mouth[0] + 4, mouth[1]], reach) : [M.x + 18, 66 + (t % 8 < 4 ? 0 : 3)], t < 100 ? [M.x + 14, 72] : [M.x + 12, 68]];
      S.hands = t < 14 ? [[S.x - 26, 58], [S.x - 10, 76]] : t < 96 ? [[M.hands[0][0] + 6, M.hands[0][1] + 5], xf(S, [6, -36], 1)] : [[S.x - 6, S.y + 2], [S.x + 4, S.y + 4]];
      drawAll(g, [M, S], f);
      if (t < 10) drawItem(g, 'bouquet', S.x - 26, 50, -0.3);
      else if (t < 100) drawItem(g, 'bouquet', M.x + 14, 66, 0.4);
      // (petals out of his mouth at every fistful)
      for (let q = 0; q <= k && q < 7; q++) {
        const ti = 14 + 12 * q + 6, a = t - ti;
        if (a >= 0 && a < 22) for (let p = 0; p < 6; p++) { const ang = -0.4 - p * 0.45, x = mouth[0] + Math.cos(ang) * a * 1.4 + 4, y = mouth[1] + Math.sin(ang) * a * 1.1 + a * a * 0.08; box(g, x - 1, y - 1, 4, 3, INK); box(g, x, y, 2, 1, ['#E11D48', '#F472B6', '#FB7185'][p % 3]); }
        if (a >= 0 && a < 3) burst(g, mouth[0], mouth[1], 7, a / 3);
      }
      if (t < 96) sweat(g, headOf(S)[0], headOf(S)[1] - 8, f, 6);
      stink(g, S.x - 12, 102, t - 112);
      if (t >= 112) flies(g, S.x - 8, 86, f);
      break;
    }
  }
};

/** Him thrown out of the gondola (a QTE lost), `t` frames in. */
const thrownScene = (g: Ctx, f: number, t: number, me: Who, su: Who, cap: string) => {
  paintGondola(g, f, cap);
  const lift = ease((t - 16) / 30), heave = clamp01((t - 50) / 20), h2 = heave * heave;
  const M = fig(me, 74, 92, 1, t < 10 ? 'grit' : 'shock');
  M.legs = t < 16 ? null : t * 0.7 * lift;
  if (heave <= 0) { M.x = lerp(74, 64, lift); M.y = lerp(92, 34, lift); M.rot = -lift * Math.PI / 2; M.tilt = -0.2 * lift; }
  else { M.x = 64 - h2 * 150; M.y = 34 + h2 * 80 - heave * 10; M.rot = -Math.PI / 2 - heave * 2.6; M.sc = 1 - heave * 0.3; }
  if (t >= 16) M.hands = [xf(M, [16 + Math.sin(t) * 8, -46 + Math.cos(t * 1.3) * 8], 1), xf(M, [-12 + Math.cos(t * 1.1) * 8, -48], 1)];
  const S = fig(su, 136 - (t >= 70 ? Math.min(10, t - 70) : 0), 92, -1, t >= 70 ? 'smug' : 'sneer');
  S.lean = t < 16 ? 0.2 : heave <= 0 ? lerp(0.2, -0.1, lift) : t < 70 ? 0.35 : 0.45; S.tilt = t >= 70 ? 0.3 : 0.05;
  if (t < 16) { M.hands = [[S.x - 20, 66], [S.x - 16, 72]]; S.hands = [lerpP([S.x - 14, 90], xf(M, [4, -36], 1), t / 8), lerpP([S.x - 6, 92], xf(M, [0, 0], 0), t / 8)]; }
  else if (heave <= 0) S.hands = [xf(M, [-4, -24], 1), xf(M, [-2, 6], 0)];
  else if (t < 70) S.hands = [[S.x - 40, 30], [S.x - 34, 38]];
  else S.hands = [[S.x - 46, 72], [S.x - 4, 76]];
  drawAll(g, [S, M], f);
  if (t >= 70) { const hd = S.hands[0]; box(g, hd[0] - 8, hd[1] - 1, 7, 3, INK); box(g, hd[0] - 7, hd[1], 6, 1, skinOf(su)[2]); }
  const mh = headOf(M);
  if (t >= 16 && heave < 0.5) sweat(g, mh[0], mh[1], f, 7);
  if (me.mh && me.pants === 'shitty' && t >= 16) {
    const butt = xf(M, [-12, 8], 0);
    flies(g, butt[0], butt[1], f, 4);
    if (heave > 0) for (let k = 0; k < 6; k++) drop(g, butt[0] + 6 + k * 7, butt[1] - 4 + Math.sin(k * 1.7) * 5, POOP[2], POOP[4]);
  }
  if (heave > 0) for (let k = 0; k < 6; k++) box(g, M.x + 30 + hash(k + t) * 30, M.y - 20 + k * 7, 24 + hash(k) * 20, 1, k % 2 ? '#FFFFFF' : '#FDE68A');
};

// ---------------------------------------------------------------------------------------------------------------
// The update's side: the sounds, the yells, the shakes; done?

export const tickCloseup = (ctx: FrameContext, w: Wheel, cu: Closeup): boolean => {
  const t = ++cu.t, { state } = ctx;
  const fart = () => { playSound('fart', 0.9, -4); playSound('fart', 0.5, -12); };
  if (cu.kind === 'thrown') {
    if (t === 2) playSound('slam', 0.8, -6);
    if (t === 22) playSound('whoosh', 0.6, -12);
    if (t === 52) playSound('whoosh', 1, -8);
    return t >= cu.dur;
  }
  switch (cu.how) {
    case 'smash':
      if (HITS.includes(t)) { playSound('crunch', 1, -4 + t / 20); playSound('clang', 0.6, -8); shakeScreen(state, 6, 3); }
      if (t === 36) closeupYell(w, cu.i, 'smash');
      if (t === 104) fart();
      break;
    case 'throw':
      if (t === 4) playSound('slam', 0.6, -6);
      if (t === 24) playSound('whoosh', 0.6, -12);
      if (t === 30) closeupYell(w, cu.i, 'throw');
      if (t === 62) fart();
      if (t === 76) playSound('whoosh', 1, -10);
      break;
    case 'floor':
      if (t === 6) playSound('whoosh', 0.6, -6);
      if (t === 20) closeupYell(w, cu.i, 'floor');
      if (t === 56) { playSound('crack', 1, -6); playSound('crunch', 1, -10); shakeScreen(state, 10, 5); }
      if (t === 100) fart();
      break;
    case 'fling':
      if (t === 20) closeupYell(w, cu.i, 'fling');
      if (t >= 16 && t < 80 && t % 10 === 0) playSound('whoosh', 0.6, 4);
      if (t === 46) fart();
      if (t === 82) playSound('whoosh', 1, -10);
      break;
    case 'choke':
      if (t === 8) playSound('whoosh', 0.5, 6);
      if (t >= 14 && t < 96 && (t - 14) % 12 === 6) playSound('punch', 0.6, 4);
      if (t === 26) closeupYell(w, cu.i, 'choke');
      if (t === 112) fart();
      break;
  }
  return t >= cu.dur;
};

// ---------------------------------------------------------------------------------------------------------------
// Onto the screen

/** The words that go up over a hit (picture px), and when. */
const POWS: Record<KillKind | 'thrown', [string, number, number, number][]> = {
  smash: [['WHAM!', 34, 160, 26], ['CRUNCH!', 64, 158, 24], ['CRACK!', 94, 160, 28], ['PFFRRT!', 104, 124, 78]],
  throw: [['PFFRRT!', 62, 96, 14], ['WHOOSH!', 76, 150, 26]],
  floor: [['KRAKK!', 56, 112, 72], ['PFFRRT!', 100, 120, 22]],
  fling: [['WHOOSH!', 30, 44, 18], ['PFFRRT!', 46, 130, 28]],
  choke: [['GLURK!', 40, 150, 24], ['PFFRRT!', 112, 140, 78]],
  thrown: [['HA HA!', 72, 128, 22]],
};
const pow = (c: Ctx, s: string, x: number, y: number, a: number) => {
  const k = a < 4 ? 1.5 - a * 0.12 : 1;
  c.save(); c.translate(x, y); c.rotate(-0.12); c.scale(k, k);
  c.font = '16px "Press Start 2P"'; c.textAlign = 'center';
  for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2], [2, 2], [-2, 2], [2, -2], [-2, -2]]) { c.fillStyle = INK; c.fillText(s, dx, dy + 3); }
  c.fillStyle = s === 'PFFRRT!' ? '#8B5A2B' : '#DC2626'; c.fillText(s, 2, 2);
  c.fillStyle = s === 'PFFRRT!' ? '#D9B07A' : '#FDE047'; c.fillText(s, 0, 0);
  c.restore();
};

let off: HTMLCanvasElement | null = null;
const born = new WeakMap<object, number>();
const picture = () => {
  if (!off) { off = document.createElement('canvas'); off.width = W; off.height = H; }
  const g = off.getContext('2d')!;
  g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = false; g.clearRect(0, 0, W, H);
  return g;
};
/** The picture into a gilt frame on the screen, opening, shaking. */
const blit = (c: Ctx, sx: number, sy: number, open: number, shake: number, t: number) => {
  if (!off || open <= 0.01) return;
  const x = Math.round(sx + (hash(t) - 0.5) * 8 * shake), y0 = Math.round(sy + (hash(t * 3) - 0.5) * 6 * shake);
  const h = Math.round(H * 2 * open), top = y0 + Math.round((H * 2 - h) / 2);
  const Gd = r5(GOLD[3]);
  c.save();
  c.fillStyle = 'rgba(0, 0, 0, 0.45)'; c.fillRect(x + 8, top + 8, W * 2 + 8, h + 8);
  c.fillStyle = INK; c.fillRect(x - 8, top - 8, W * 2 + 16, h + 16);
  c.fillStyle = Gd[2]; c.fillRect(x - 6, top - 6, W * 2 + 12, h + 12);
  c.fillStyle = Gd[4]; c.fillRect(x - 6, top - 6, W * 2 + 12, 2); c.fillStyle = Gd[3]; c.fillRect(x - 6, top - 6, 2, h + 12);
  c.fillStyle = Gd[0]; c.fillRect(x - 6, top + h + 4, W * 2 + 12, 2); c.fillStyle = Gd[1]; c.fillRect(x + W * 2 + 4, top - 6, 2, h + 12);
  c.fillStyle = INK; c.fillRect(x - 2, top - 2, W * 2 + 4, h + 4);
  for (const [bx, by] of [[x - 5, top - 5], [x + W * 2 + 1, top - 5], [x - 5, top + h + 1], [x + W * 2 + 1, top + h + 1]]) { c.fillStyle = INK; c.fillRect(bx - 1, by - 1, 6, 6); c.fillStyle = '#F472B6'; c.fillRect(bx, by, 4, 4); c.fillStyle = '#FFE4F2'; c.fillRect(bx, by, 2, 2); }
  c.imageSmoothingEnabled = false;
  c.drawImage(off, 0, 0, W, H, x, top, W * 2, h);
  c.restore();
};

/** Screen space (the section's drawHud): the tussle's box under the QTE panel; a close-up cutscene's, letterboxed. */
export const drawCloseups = (c: Ctx, state: GameState, w: Wheel) => {
  if (typeof document === 'undefined') return;
  const f = state.frame;
  if (w.qte) {
    const q = w.qte, i = q.i;
    if (!born.has(q)) born.set(q, f);
    const t = f - (born.get(q) ?? f);
    c.fillStyle = 'rgba(10, 4, 20, 0.35)'; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const g = picture();
    // (the gondola rocking with it)
    g.translate(W / 2, H + 20); g.rotate(Math.sin(f * 0.07) * 0.035 + w.cuBal * 0.02); g.translate(-W / 2, -(H + 20));
    paintGondola(g, f, CAPS[ROSTER[i].cart % CAPS.length]);
    tussle(g, f, mhWho(state), suWho(i), w.cuBal, q.flash);
    blit(c, TX, TY, ease(t / 8), q.flash === 'bad' ? 0.6 : 0, f);
    const said = w.barks.get(i);
    if (said && t > 4) saidOver(c, said.text, CANVAS_WIDTH / 2, TY + 22, '#FDE68A', 360);
    return;
  }
  const cu = w.cu;
  if (!cu) return;
  const t = cu.t, i = cu.i, cap = CAPS[ROSTER[i].cart % CAPS.length];
  c.fillStyle = 'rgba(10, 4, 20, 0.6)'; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const bar = Math.round(Math.min(1, t / 10) * 44);
  c.fillStyle = '#000'; c.fillRect(0, 0, CANVAS_WIDTH, bar); c.fillRect(0, CANVAS_HEIGHT - bar, CANVAS_WIDTH, bar);
  const g = picture();
  if (cu.kind === 'thrown') thrownScene(g, f, t, mhWho(state), suWho(i), cap);
  else killScene(g, f, t, cu.how, mhWho(state), suWho(i), cap);
  // (a white flash on a hit)
  const hit = cu.kind === 'kill' && ((cu.how === 'smash' && HITS.some(h => t >= h && t < h + 2)) || (cu.how === 'floor' && t >= 56 && t < 58));
  if (hit) { g.fillStyle = 'rgba(255, 255, 255, 0.7)'; g.fillRect(0, 0, W, H); }
  const shake = cu.kind === 'kill' && cu.how === 'smash' ? Math.max(0, ...HITS.map(h => (t >= h && t < h + 12 ? (12 - (t - h)) / 12 : 0))) : cu.kind === 'kill' && cu.how === 'floor' && t >= 56 && t < 70 ? (70 - t) / 14 : 0;
  const open = Math.min(ease(t / 8), ease((cu.dur - t) / 6 + 0.2));
  blit(c, CX, CY, open, shake, f);
  if (open > 0.9) for (const [s, at, px, py] of POWS[cu.kind === 'thrown' ? 'thrown' : cu.how]) { const a = t - at; if (a >= 0 && a < 26) pow(c, s, CX + px * 2, CY + py * 2, a); }
  const said = w.barks.get(i);
  if (said) saidOver(c, said.text, CANVAS_WIDTH / 2, CY - 14, '#FDE68A', 520);
  if (t > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
};
