// THE PADDOCK GATE HACK's last shot (the owner, 2026-11-02: "we then cut to meathead who pulls the shard he now gets out of
// the fuse box that was hidden after solving the puzzle. he goes 'worth it'"): a cut after the massacre, full screen, close
// on him and the panel up the tree. Solving it dropped the keypad open on its hinge: behind it the fuse box, the CHARGE
// SHARD clamped in as the main fuse, glowing. He reaches in with his left (from the front: the screen's right), gets a
// grip, tugs, and yanks it: the panel dies (sparks, the screen dark, smoke), the shard up by his face. His line (hack.ts).
//
// Painted at 400 x 300, drawn 2x. The backdrop (sky, the far jungle, the smoke off the grandstand, the deck) is stamped
// once; the panel is its own stamp (hackArt.ts drawPanel), blown up; the fuse box a few boxes; him the walk-away's big
// figure from the front (walkAway/meathead.ts: its arms' elbows are limb.ts's), his left fist where this puts it.

import { CANVAS_WIDTH } from '../../../m1/constants';
import { skyTint, dayProgress } from '../../timeOfDay';
import { drawMeatheadFront, hangFist, type Pose, type Pt } from '../../walkAway/meathead';
import { type Ctx, INK, box, pixelBlob, steppedGlow, stamp, hash, bandedGradient, checker } from './art/kit';
import { drawPanel, drawShardGem } from './hackArt';

const W = 400, S = CANVAS_WIDTH / W;
/** Him (his feet: below the frame, a waist-up shot), the panel (its deck), blown up PZ. */
const MX = 146, MY = 334, PX = 254, PY = 280, PZ = 2;
/** The fuse box (the keypad's hole), panel-local; where the shard sits in it. */
const BOX = { x: -27, y: -47, w: 34, h: 24 };
const FUSE: Pt = [-10, -35];
/** Frames: in from black, the reach, the grip and tug, the yank, the shard up to his face. */
export const PULL_REACH = 34, PULL_GRIP = 66, PULL_YANK = 92, PULL_UP = 116;

export interface Pull { t: number; sparks: { x: number; y: number; vx: number; vy: number; life: number }[] }
export const makePull = (): Pull => ({ t: 0, sparks: [] });

/** The fuse in the picture's px. */
const fuseAt = (): Pt => [PX + FUSE[0] * PZ, PY + FUSE[1] * PZ];
/** ...in his frame (feet at the origin). */
const fuseHis = (): Pt => { const [x, y] = fuseAt(); return [x - MX, y - MY]; };

const ease = (k: number) => { const u = Math.max(0, Math.min(1, k)); return u * u * (3 - 2 * u); };
const lerp = (a: Pt, b: Pt, k: number): Pt => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];

/** His left fist (his frame) and its elbow's hint this frame. */
const leftFist = (t: number): { F: Pt; E: Pt } => {
  const rest = hangFist(1, 0), at = fuseHis(), up: Pt = [34, -156];
  // (into the box a touch past the fuse's middle: the fist round it)
  const grip: Pt = [at[0] + 2, at[1] + 1];
  if (t < PULL_REACH) return { F: rest, E: [47, -97] };
  if (t < PULL_GRIP) return { F: lerp(rest, grip, ease((t - PULL_REACH) / (PULL_GRIP - PULL_REACH))), E: [52, -100] };
  if (t < PULL_YANK) {
    // (the tug: back toward him in jerks, it won't come)
    const j = Math.abs(Math.sin((t - PULL_GRIP) * 0.55)) * 3;
    return { F: [grip[0] - j, grip[1] + (j > 2 ? 1 : 0)], E: [52, -100] };
  }
  // (out: a big yank back, then up by his face)
  const k = ease((t - PULL_YANK) / (PULL_UP - PULL_YANK));
  const back: Pt = [grip[0] - 18, grip[1] + 4];
  const F = k < 0.3 ? lerp(grip, back, k / 0.3) : lerp(back, up, (k - 0.3) / 0.7);
  return { F, E: [60, -112] };
};

export const pulled = (p: Pull) => p.t >= PULL_YANK;

/** A frame of it. Returns 'yank' the frame the shard comes out (hack.ts: the sounds, the panel dead). */
export const stepPull = (p: Pull): 'yank' | null => {
  p.t++;
  for (const s of p.sparks) { s.vy += 0.25; s.x += s.vx; s.y += s.vy; s.life--; }
  p.sparks = p.sparks.filter(s => s.life > 0);
  const [fx, fy] = fuseAt();
  if (p.t > PULL_GRIP && p.t < PULL_YANK && p.t % 7 === 0) for (let i = 0; i < 3; i++) p.sparks.push({ x: fx, y: fy, vx: (Math.random() - 0.3) * 3, vy: -1 - Math.random() * 2, life: 10 + Math.random() * 8 });
  if (p.t === PULL_YANK) {
    for (let i = 0; i < 34; i++) p.sparks.push({ x: fx + (Math.random() - 0.5) * 10, y: fy + (Math.random() - 0.5) * 10, vx: (Math.random() - 0.5) * 7, vy: -2 - Math.random() * 4, life: 16 + Math.random() * 20 });
    return 'yank';
  }
  return null;
};

export interface PullLook { nude: boolean; shat: boolean; talking: boolean }

const pose: Pose = { step: 0, t: 0, wx: 0, wy: -102, rot: 0, turn: 0, face: 'smirk', green: 0, headY: 0, nude: false, shat: false, rim: '#FFE7B0' };
const NO_GRIP: [[number, number], [number, number]] = [[0, 0], [0, 0]];
const noToy = () => {};
const shardToy = (c: Ctx, t: number) => drawShardGem(c, 0, 0, 0.8, t);

/** Draws it; returns where his mouth is and the top of his head (the screen's px), for his bubble. */
export const drawPull = (c: Ctx, p: Pull, f: number, look: PullLook): { mouth: Pt; head: Pt } => {
  c.save();
  c.scale(S, S);
  const tod = Math.round(dayProgress() * 9);
  stamp(c, `hk-pull-${tod}`, 0, 0, W, 300, paintBack);
  const out = pulled(p);
  // The panel, blown up: alive till the shard's out, then dead (sparking, smoking: hackArt.ts)
  c.save(); c.translate(PX, PY); c.scale(PZ, PZ);
  drawPanel(c, 0, 0, f, { dead: out, using: true, sparkAt: f - (p.t - PULL_YANK) });
  fuseBox(c, f, out);
  c.restore();
  // Him: his right arm down, his left at the fuse; the shard in his fist once it's out
  const { F, E } = leftFist(p.t);
  pose.t = p.t; pose.nude = look.nude; pose.shat = look.shat;
  pose.face = look.talking ? 'chuckle' : out ? 'grin' : p.t > PULL_GRIP ? 'yell' : 'smirk';
  pose.hold = { wx: F[0] + 1, wy: F[1] - 11, rot: -0.2, draw: out ? shardToy : null, left: F, right: null, elbowL: E };
  const marks = drawMeatheadFront(c, MX, MY, pose, NO_GRIP, noToy);
  // The sparks over it all
  for (const s of p.sparks) box(c, s.x, s.y, 2, 2, s.life % 4 < 2 ? '#FDE047' : '#FFFFFF');
  c.restore();
  return { mouth: [marks.mouth[0] * S, marks.mouth[1] * S], head: [MX * S, (MY - 200) * S] };
};

/** The hidden fuse box (panel-local, under the panel's PZ): the keypad dropped open on its hinge under it, the shard
 *  clamped in it as the main fuse (glowing), or the clamps empty and spitting once it's out. */
const fuseBox = (c: Ctx, f: number, out: boolean) => {
  const b = BOX;
  // (the recess: inked, dark, its back plate, lit along the top edge inside)
  box(c, b.x - 1, b.y - 1, b.w + 2, b.h + 2, INK);
  box(c, b.x, b.y, b.w, b.h, '#101614'); box(c, b.x + 2, b.y + 2, b.w - 4, b.h - 4, '#1C2622'); box(c, b.x + 2, b.y + 2, b.w - 4, 1, '#2E3C36');
  checker(c, b.x + 2, b.y + b.h - 4, b.w - 4, 2, '#101614');
  // (wires down the back: red and black, into the corners)
  box(c, b.x + 4, b.y + 3, 1, b.h - 6, '#B91C1C'); box(c, b.x + 6, b.y + 3, 1, b.h - 6, '#27272A');
  box(c, b.x + b.w - 6, b.y + 3, 1, b.h - 6, '#B91C1C'); box(c, b.x + b.w - 8, b.y + 3, 1, b.h - 6, '#27272A');
  // (a sticker: MAIN, a bolt)
  box(c, b.x + b.w - 11, b.y + 3, 7, 6, '#FACC15'); box(c, b.x + b.w - 8, b.y + 4, 2, 2, INK); box(c, b.x + b.w - 9, b.y + 6, 2, 2, INK);
  // (the clamps, copper, top and bottom of the fuse)
  const [fx, fy] = FUSE;
  for (const dy of [-8, 7]) { box(c, fx - 5, fy + dy - 1, 10, 3, INK); box(c, fx - 4, fy + dy, 8, 1, '#D08A3A'); box(c, fx - 4, fy + dy + 1, 8, 1, '#8A5220'); }
  if (!out) {
    // (the shard as the fuse: lit up, its glow on the box)
    steppedGlow(c, fx, fy, 14, '#22D3EE', 0.25, 0.04, 3);
    drawShardGem(c, fx, fy, 0.55, f);
  } else if ((f >> 2) % 3 === 0) {
    // (empty: an arc across the clamps now and then)
    box(c, fx - 1, fy - 6, 1, 3, '#E0F2FE'); box(c, fx, fy - 3, 1, 3, '#7DD3FC'); box(c, fx - 1, fy, 1, 3, '#E0F2FE'); box(c, fx, fy + 3, 1, 3, '#7DD3FC');
  }
  // The keypad, dropped open on its hinge under the hole: its back's bare steel, a ribbon cable up into the box
  const hy = b.y + b.h + 1;
  box(c, b.x - 1, hy - 1, b.w + 2, 2, INK); box(c, b.x + 2, hy - 1, 3, 2, '#9AA4B0'); box(c, b.x + b.w - 5, hy - 1, 3, 2, '#9AA4B0');
  c.fillStyle = INK; c.beginPath(); c.moveTo(b.x - 1, hy); c.lineTo(b.x + b.w + 1, hy); c.lineTo(b.x + b.w + 3, hy + 16); c.lineTo(b.x - 3, hy + 16); c.closePath(); c.fill();
  c.fillStyle = '#566070'; c.beginPath(); c.moveTo(b.x, hy + 1); c.lineTo(b.x + b.w, hy + 1); c.lineTo(b.x + b.w + 2, hy + 15); c.lineTo(b.x - 2, hy + 15); c.closePath(); c.fill();
  box(c, b.x - 1, hy + 12, b.w + 2, 3, '#3E4650'); box(c, b.x + 1, hy + 2, b.w - 2, 1, '#707A88');
  for (const rx of [b.x + 2, b.x + b.w - 4]) box(c, rx, hy + 4, 2, 2, '#9AA4B0');
  box(c, b.x + 12, hy - 4, 10, 6, '#C8C0AC'); for (let k = 0; k < 5; k++) box(c, b.x + 12 + k * 2, hy - 4, 1, 6, '#8A8270');
};

/** The backdrop (painted once): the sky over the canopy, the far jungle, the grandstand's smoke off in it, the deck's
 *  planks along the bottom (lit lip: he's stood on it), the tree's trunk up behind the panel. */
const paintBack = (g: Ctx) => {
  const sky = ['#5AA8E0', '#78BCE8', '#98CEEE', '#BCE0F2'].map((col, i) => skyTint(col, i / 3));
  bandedGradient(g, 0, 0, W, 210, sky, 8, 2);
  // (the far jungle below us, in steps: we're up a tree)
  const L = ['#142A12', '#1E3A18', '#2A4C22', '#3A622C', '#4E7A3A'];
  for (let i = 0; i < 22; i++) { const x = i * 20 + hash(i * 1.7) * 12, y = 176 + hash(i * 2.3) * 16; pixelBlob(g, x, y, 22, 16, L[1], 2); pixelBlob(g, x - 4, y - 5, 14, 8, L[2], 2); pixelBlob(g, x - 7, y - 8, 7, 4, L[3], 2); }
  box(g, 0, 190, W, 110, L[0]);
  // (off left, down in it: the grandstand's smoke going up, a red glow under it)
  for (let k = 0; k < 6; k++) pixelBlob(g, 40 + k * 7 + hash(k) * 8, 176 - k * 18, 12 + k * 4, 8 + k * 2, ['#3A3A40', '#4A4A52', '#5A5A62', '#6A6A72', '#7A7A82', '#8A8A92'][k], 2);
  for (let k = 0; k < 3; k++) box(g, 34 + k * 6, 186 - k * 2, 30 - k * 12, 2 + k, ['#7F1D1D', '#B91C1C', '#F97316'][k]);
  // (near canopy, top corners: leaves in steps, inked)
  for (const [cx, cy] of [[12, 8], [60, -6], [370, 4], [404, 40], [-6, 60]] as const) {
    pixelBlob(g, cx, cy, 52, 30, INK); pixelBlob(g, cx, cy, 49, 27, '#24401C'); pixelBlob(g, cx - 6, cy - 6, 34, 16, '#30522A'); pixelBlob(g, cx - 12, cy - 11, 18, 8, '#46703A');
  }
  // (the tree's trunk, up behind the panel: fiberglass bark in bands)
  const B = ['#2A1E12', '#3E2E1E', '#5A4430', '#6E5640'];
  box(g, 318, 0, 60, 300, INK);
  box(g, 320, 0, 14, 300, B[3]); box(g, 334, 0, 22, 300, B[2]); box(g, 356, 0, 12, 300, B[1]); box(g, 368, 0, 8, 300, B[0]);
  checker(g, 332, 0, 2, 300, B[3]); checker(g, 354, 0, 2, 300, B[1]);
  for (let y = 8, k = 0; y < 300; y += 22, k++) { const px = 322 + (k % 3) * 14; box(g, px, y, 16, 12, B[1]); box(g, px, y, 16, 2, B[3]); }
  // The deck: planks, their front lip lit (somewhere to stand)
  box(g, 0, PY - 2, W, 300 - PY + 2, INK);
  box(g, 0, PY, W, 300 - PY, '#6E5434'); box(g, 0, PY, W, 2, '#C8A26A'); box(g, 0, PY + 2, W, 2, '#A07E4E');
  for (let x = 6; x < W; x += 34) box(g, x, PY + 4, 1, 300 - PY, '#4A3826');
};
