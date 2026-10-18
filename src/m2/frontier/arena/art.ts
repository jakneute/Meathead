// The catch-up and the arena, crude (the prototype first pass: flat colors, simple shapes, readable silhouettes; Tucker
// is drawn at full detail by tucker.ts): REAL woods out past the park (real pines and turning hardwoods, a dirt trail,
// leaf litter; no park lettering out here), opening into a clearing round one giant old oak: a gnarled trunk, a crown
// going orange, and a long pointed branch out of it at a man's chest height (with Tucker on it, after). The bikes:
// his kid's bike parked on its stand, the one Tucker stole nosed into the oak and wrecked. The fight's placeholder board
// (painted plywood on stakes).

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { drawTodSky } from '../../timeOfDay';
import { signText } from '../../signLetters';
import { box, mix, hash, INK, painted, onScreen, type Ctx } from '../kit';
import { groundBox } from '../section';
import { drawBough } from '../tucker';
import { drawDirtBike } from '../woods/teens';
import { x0, x1, X, GY, TREE_X, TRUNK_W, ROOT, PIERCE, TIP, branchY, branchR, BOARD_X, TUCK_BIKE, AXE_TREE_X, AXE_TR, CUT_H, LOG_LEN, LOG_X, LOG_BARE, MH_CHOP_X } from './layout';
import type { Arena } from './state';

const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
const far = (col: string, k: number) => mix(col, '#9DB4C8', k);

// ---------------------------------------------------------------------------------------------------------------
// The backdrop (screen space): the sky by the hour, real ridges (snow on the high ones; no fire mountains), a wall of
// real pines

export const drawArenaBackdrop = (c: Ctx, state: GameState) => {
  drawTodSky(c, 0, 0, W, H, ['#1E40AF', '#3B82F6', '#7DB8F0', '#BFE0F8', '#E8EEF2', '#F2E6C4'], { horizon: 400, sun: [620, 100], moon: [160, 90] });
  const ridge = (par: number, base: number, amp: number, col: string, seed: number, snow: boolean) => {
    const off = -((state.camera.x * par) % 600);
    const n = (wx: number) => Math.sin(wx * 0.011 + seed) * 0.6 + Math.sin(wx * 0.027 + seed * 2) * 0.3 + Math.sin(wx * 0.071) * 0.1;
    c.fillStyle = col; c.beginPath(); c.moveTo(0, H);
    for (let x = -40; x <= W + 40; x += 20) c.lineTo(x, base - n(x - off) * amp);
    c.lineTo(W, H); c.closePath(); c.fill();
    if (snow) { c.fillStyle = far('#EEF2F7', 0.4); for (let x = -40; x <= W + 40; x += 20) { const v = n(x - off); if (v > 0.55) c.fillRect(x - 6, base - v * amp, 14, (v - 0.5) * 30); } }
  };
  ridge(0.03, 320, 90, far('#7C8CA8', 0.3), 4.7, true);
  ridge(0.06, 372, 46, far('#5A7A6A', 0.45), 1.9, false);
  const off = -((state.camera.x * 0.18) % 44);
  for (let i = -1; i < W / 44 + 2; i++) {
    const x = off + i * 44, wx = Math.floor((state.camera.x * 0.18) / 44) + i, h = 56 + hash(wx + 30) * 56, y = 446 - hash(wx + 37) * 18;
    c.fillStyle = far('#2E4A30', 0.25); c.beginPath(); c.moveTo(x, y - h); c.lineTo(x + 22 + hash(wx + 33) * 8, y); c.lineTo(x - 22 - hash(wx + 35) * 8, y); c.closePath(); c.fill();
  }
  box(c, 0, 440, W, H - 440, far('#24382A', 0.2));
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// The world, behind the cast

const along = (state: GameState, a: number, b: number, step: number, fn: (rx: number) => void) => {
  const lo = Math.max(a, Math.floor((state.camera.x - 200 - x0) / step) * step), hi = Math.min(b, state.camera.x + W + 200 - x0);
  for (let rx = lo; rx <= hi; rx += step) fn(rx);
};
/** A real pine (layered, ragged, dark). */
const pine = (c: Ctx, x: number, feet: number, h: number, seed: number, dim = 0) => {
  const g = mix(hash(seed) > 0.5 ? '#1F4A2A' : '#2A5530', '#2A3A40', dim), gl = mix(g, '#7DB87A', 0.18);
  box(c, x - 4, feet - h * 0.3, 8, h * 0.3, mix('#4A3420', '#2A3A40', dim));
  for (let k = 0; k < 4; k++) {
    const ty = feet - h + k * h * 0.2, w = h * (0.14 + k * 0.07) * (0.85 + hash(seed + k) * 0.3);
    c.fillStyle = mix(INK, '#2A3A40', dim); c.beginPath(); c.moveTo(x, ty - 2); c.lineTo(x + w + 2, ty + h * 0.32); c.lineTo(x - w - 2, ty + h * 0.32); c.closePath(); c.fill();
    c.fillStyle = g; c.beginPath(); c.moveTo(x, ty); c.lineTo(x + w, ty + h * 0.3); c.lineTo(x - w, ty + h * 0.3); c.closePath(); c.fill();
    c.fillStyle = gl; c.beginPath(); c.moveTo(x, ty); c.lineTo(x - w * 0.2, ty + h * 0.3); c.lineTo(x - w, ty + h * 0.3); c.closePath(); c.fill();
  }
};
/** A real hardwood, turning. */
const hardwood = (c: Ctx, x: number, feet: number, h: number, seed: number, dim = 0) => {
  const leaf = mix(['#4D7C0F', '#CA8A04', '#D97706', '#B45309', '#9A3412'][Math.floor(hash(seed) * 5)], '#2A3A40', dim);
  const trunk = mix('#5A4630', '#2A3A40', dim);
  box(c, x - 6, feet - h * 0.55, 12, h * 0.55, mix(INK, '#2A3A40', dim)); box(c, x - 5, feet - h * 0.55, 10, h * 0.55, trunk); box(c, x - 5, feet - h * 0.55, 3, h * 0.55, mix(trunk, '#FFFFFF', 0.15));
  c.strokeStyle = trunk; c.lineWidth = 4; c.beginPath(); c.moveTo(x, feet - h * 0.5); c.lineTo(x - h * 0.18, feet - h * 0.72); c.moveTo(x, feet - h * 0.45); c.lineTo(x + h * 0.2, feet - h * 0.7); c.stroke();
  const blobs = [[0, -0.78, 0.26], [-0.2, -0.7, 0.2], [0.22, -0.68, 0.2], [0.05, -0.92, 0.18]] as const;
  for (const [dx, dy, r] of blobs) { c.fillStyle = mix(INK, '#2A3A40', dim); c.beginPath(); c.arc(x + dx * h, feet + dy * h, r * h + 2, 0, Math.PI * 2); c.fill(); }
  for (const [dx, dy, r] of blobs) {
    c.fillStyle = leaf; c.beginPath(); c.arc(x + dx * h, feet + dy * h, r * h, 0, Math.PI * 2); c.fill();
    c.fillStyle = mix(leaf, '#FFFFFF', 0.18); c.beginPath(); c.arc(x + dx * h - r * h * 0.3, feet + dy * h - r * h * 0.3, r * h * 0.45, 0, Math.PI * 2); c.fill();
  }
};

/** The woods, the trail, the clearing, the oak's trunk and crown; the bikes and the branch are separate (see below). */
export const drawArenaBack = (c: Ctx, state: GameState) => {
  const clearing = (rx: number) => Math.abs(X(rx) - TREE_X) < 520;
  // ---- the back rank: real trees, dimmer (thinned out round the clearing)
  along(state, -200, 4200, 70, rx => {
    if (clearing(rx) && hash(rx + 2) < 0.7) return;
    const x = X(rx) + (hash(rx) - 0.5) * 30, h = 150 + hash(rx + 1) * 110;
    if (hash(rx + 3) > 0.45) pine(c, x, GY - 52, h, rx, 0.35); else hardwood(c, x, GY - 52, h * 0.8, rx, 0.35);
  });
  box(c, x0 - 200, GY - 56, x1 - x0 + 400, 60, '#5A4A2A');
  box(c, x0 - 200, GY - 56, x1 - x0 + 400, 3, '#7A8A3A');
  along(state, -200, 4200, 23, rx => { const h = hash(rx * 3 + 1); if (h > 0.4) { c.fillStyle = ['#B45309', '#92400E', '#CA8A04', '#7C2D12'][Math.floor(h * 10) % 4]; c.fillRect(X(rx), GY - 50 + h * 44, 4, 2); } });
  // ---- the near trees by the trail (none in the clearing)
  along(state, -200, 4200, 170, rx => {
    if (clearing(rx)) return;
    const x = X(rx) + (hash(rx + 9) - 0.5) * 50, h = 190 + hash(rx + 4) * 90;
    if (hash(rx + 5) > 0.5) pine(c, x, GY - 30, h, rx + 50); else hardwood(c, x, GY - 30, h * 0.85, rx + 50);
  });
  // ---- the trail: dirt, its ruts, the grass and the leaves at its edges; the bikes' tracks
  groundBox(c, x0 - 200, x1 + 200, GY, '#5A4028', '#6B8A3A');
  box(c, x0 - 200, GY + 4, x1 - x0 + 400, 6, '#4A3420');
  along(state, -200, 4200, 31, rx => { const h = hash(rx + 0.5); box(c, X(rx), GY + 14 + h * 30, 10 + h * 10, 2, '#3F2E1C'); if (h > 0.7) box(c, X(rx) + 4, GY - 3, 3, 4, '#7A9A4A'); });
  // ---- the oak: a giant, gnarled, its roots spread, a crown going orange
  if (onScreen(state, TREE_X - 260, TREE_X + 260)) oak(c);
};

const oak = (c: Ctx) => {
  const x = TREE_X, w = TRUNK_W;
  // (the crown, behind the trunk: big, lumpy, turning)
  const blobs = [[-120, -330, 90], [0, -380, 110], [120, -320, 88], [-60, -270, 80], [70, -260, 84], [-170, -250, 60], [175, -240, 58]] as const;
  for (const [dx, dy, r] of blobs) { c.fillStyle = INK; c.beginPath(); c.arc(x + dx, GY + dy, r + 3, 0, Math.PI * 2); c.fill(); }
  blobs.forEach(([dx, dy, r], i) => {
    const col = ['#B45309', '#D97706', '#9A3412', '#CA8A04'][i % 4];
    c.fillStyle = col; c.beginPath(); c.arc(x + dx, GY + dy, r, 0, Math.PI * 2); c.fill();
    c.fillStyle = mix(col, '#FFFFFF', 0.16); c.beginPath(); c.arc(x + dx - r * 0.3, GY + dy - r * 0.32, r * 0.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = mix(col, '#000000', 0.22); c.beginPath(); c.arc(x + dx + r * 0.25, GY + dy + r * 0.35, r * 0.45, 0, Math.PI * 2); c.fill();
  });
  // (the limbs up into it)
  for (const [ax, ay, bx, by, lw] of [[0, -170, -110, -300, 16], [0, -190, 100, -300, 14], [-6, -230, -20, -360, 12]] as const) {
    c.strokeStyle = INK; c.lineWidth = lw + 2; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + ax, GY + ay); c.lineTo(x + bx, GY + by); c.stroke();
    c.strokeStyle = '#5A4630'; c.lineWidth = lw; c.beginPath(); c.moveTo(x + ax, GY + ay); c.lineTo(x + bx, GY + by); c.stroke();
  }
  c.lineCap = 'butt';
  // (the trunk: thick, flaring into roots, its bark furrowed, lit down its left)
  c.fillStyle = INK; c.beginPath(); c.moveTo(x - w - 26, GY + 2); c.quadraticCurveTo(x - w - 2, GY - 12, x - w - 1, GY - 60); c.lineTo(x - w + 6, GY - 230); c.lineTo(x + w - 4, GY - 230); c.lineTo(x + w + 1, GY - 60); c.quadraticCurveTo(x + w + 2, GY - 12, x + w + 28, GY + 2); c.closePath(); c.fill();
  c.fillStyle = '#5A4630'; c.beginPath(); c.moveTo(x - w - 22, GY); c.quadraticCurveTo(x - w + 1, GY - 12, x - w + 1, GY - 60); c.lineTo(x - w + 8, GY - 228); c.lineTo(x + w - 6, GY - 228); c.lineTo(x + w - 1, GY - 60); c.quadraticCurveTo(x + w, GY - 12, x + w + 24, GY); c.closePath(); c.fill();
  box(c, x - w + 4, GY - 226, 10, 222, '#7A6448');
  box(c, x + w - 16, GY - 226, 12, 222, '#3F3020');
  for (let k = 0; k < 22; k++) box(c, x - w + 10 + ((k * 13) % (2 * w - 18)), GY - 220 + k * 10, 3, 14 + (k % 3) * 4, '#3F3020');
  // (a hollow, a scar where a limb came off long ago)
  c.fillStyle = '#1C1209'; c.beginPath(); c.ellipse(x + 6, GY - 150, 7, 12, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#7A6448'; c.beginPath(); c.ellipse(x - 8, GY - 190, 5, 3, 0.4, 0, Math.PI * 2); c.fill();
};

/** The oak's pointed branch: whole (before), on into his chest (him hung on it: from where it goes into him to the
 *  trunk), or snapped off short at the trunk (he took the rest with him). World; drawn over him when he's on it. */
export const drawOakBranch = (c: Ctx, how: 'whole' | 'him' | 'snapped') => {
  if (how === 'snapped') {
    drawBough(c, ROOT.x - 14, ROOT.x + 6, branchY, branchR, { jag: false, step: 1, seed: 21 });
    // (the break: raw pale wood, splinters sticking out)
    const y = branchY(ROOT.x - 14), r = branchR(ROOT.x - 14);
    c.fillStyle = '#D8B886'; c.beginPath(); c.moveTo(ROOT.x - 14, y - r); c.lineTo(ROOT.x - 22, y - r * 0.4); c.lineTo(ROOT.x - 16, y); c.lineTo(ROOT.x - 23, y + r * 0.5); c.lineTo(ROOT.x - 14, y + r); c.closePath(); c.fill();
    c.strokeStyle = INK; c.lineWidth = 1; c.stroke();
    return;
  }
  const from = how === 'him' ? PIERCE.x - 3 : TIP.x;
  drawBough(c, from, ROOT.x + 8, branchY, branchR, { step: 1, seed: 21, bloodTo: how === 'him' ? PIERCE.x + 5 : undefined });
  // (a twig off it, a few leaves left on it)
  const tx = PIERCE.x + 22, ty = branchY(tx) - branchR(tx);
  c.strokeStyle = INK; c.lineWidth = 2.4; c.beginPath(); c.moveTo(tx, ty); c.lineTo(tx - 4, ty - 12); c.lineTo(tx - 10, ty - 16); c.stroke();
  c.strokeStyle = '#7A5634'; c.lineWidth = 1.2; c.stroke();
  for (const [lx, ly, col] of [[tx - 9, ty - 17, '#D97706'], [tx - 4, ty - 13, '#B45309']] as const) { c.fillStyle = col; c.beginPath(); c.ellipse(lx, ly, 3, 1.5, -0.4, 0, Math.PI * 2); c.fill(); }
  // (blood down the branch to the trunk, and dripping off it into the leaves under him)
  if (how === 'him') { box(c, PIERCE.x - 2, GY - 1, 26, 2, '#7A0E0E'); c.fillStyle = '#7A0E0E'; c.beginPath(); c.ellipse(PIERCE.x + 6, GY, 18, 3, 0, 0, Math.PI * 2); c.fill(); }
};

/** The bike Tucker stole, nosed into the oak and wrecked: on its tail against the trunk, the front wheel folded, the
 *  back one turning still, smoking. */
export const drawWreck = (c: Ctx, state: GameState) => {
  const f = state.frame, bx = TREE_X - TRUNK_W - 28;
  c.save(); c.translate(bx, GY - 2); c.rotate(-0.55);
  drawDirtBike(c, 0, 0, 1, 1, 0, f * 0.05, TUCK_BIKE, 66);
  c.restore();
  // (the front fender bent up, gas in the leaves)
  c.globalAlpha = 0.5; c.fillStyle = '#4C1D95'; c.beginPath(); c.ellipse(bx + 6, GY + 1, 22, 3, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
  for (let i = 0; i < 3; i++) {
    const t = ((f * 0.012 + i / 3) % 1);
    c.globalAlpha = 0.35 * (1 - t); c.fillStyle = '#57534E';
    c.beginPath(); c.arc(bx + 18 + Math.sin(t * 5 + i) * 6, GY - 30 - t * 70, 5 + t * 12, 0, Math.PI * 2); c.fill();
  }
  c.globalAlpha = 1;
};

/** The fight's placeholder: a plywood board on two stakes, hand-painted. */
export const drawBoard = (c: Ctx, state: GameState) => {
  if (!onScreen(state, BOARD_X - 90, BOARD_X + 90)) return;
  const x = BOARD_X, top = GY - 112, w = 150, h = 52;
  for (const sx of [x - 50, x + 46]) { box(c, sx - 1, top, 8, GY - top, INK); box(c, sx, top, 6, GY - top, '#8A6A40'); }
  box(c, x - w / 2 - 1, top - 1, w + 2, h + 2, INK); box(c, x - w / 2, top, w, h, '#C8A070'); box(c, x - w / 2, top, w, 2, '#E0C090');
  signText(c, 'TUCKER', x, top + 18, painted(2, '#7F1D1D', '#C8A070'));
  signText(c, 'THE FIGHT:', x, top + 33, painted(1, '#1C1917', '#C8A070'));
  signText(c, 'COMING SOON', x, top + 45, painted(1, '#1C1917', '#C8A070'));
};

// ---------------------------------------------------------------------------------------------------------------
// The axe tree (the arena entry): a tall pine past the oak, a lumberjack's axe stuck in its near side; the stump once
// it's chopped through, the trunk coming down, then down along the ground (its bare part a low ledge with a lit top);
// the axe planted in the stump after (scenery, not a pickup)

const BARK_L = '#A8865A', BARK = '#6E4E30', BARK_D = '#4A3220', BARK_DD = '#2E1E12';

/** The pine above the cut, in its own frame: its butt's middle at the origin, up along -y `len` long (any tip). */
const pineTrunk = (c: Ctx, len: number, tr: number, seed: number) => {
  // (the trunk: bark, lit down one side, its furrows; tapering up)
  c.fillStyle = INK; c.beginPath(); c.moveTo(-tr - 1, 1); c.lineTo(-3, -len); c.lineTo(3, -len); c.lineTo(tr + 1, 1); c.closePath(); c.fill();
  c.fillStyle = BARK; c.beginPath(); c.moveTo(-tr, 0); c.lineTo(-2, -len); c.lineTo(2, -len); c.lineTo(tr, 0); c.closePath(); c.fill();
  c.fillStyle = BARK_L; c.beginPath(); c.moveTo(-tr, 0); c.lineTo(-2, -len); c.lineTo(-0.5, -len); c.lineTo(-tr + 5, 0); c.closePath(); c.fill();
  c.fillStyle = BARK_D; c.beginPath(); c.moveTo(tr - 4, 0); c.lineTo(1, -len); c.lineTo(2, -len); c.lineTo(tr, 0); c.closePath(); c.fill();
  for (let k = 0; k < 14; k++) { const y = -8 - k * len * 0.025, w = tr * (1 + y / len); box(c, -w * 0.4 + ((k * 7) % 5), y, 2, 7, BARK_DD); }
  // (the boughs: ragged tiers, darker under, widening down to a third of the way up)
  for (let k = 0; k < 6; k++) {
    const ty = -len + k * len * 0.11, w = len * (0.07 + k * 0.034) * (0.9 + hash(seed + k) * 0.2), h = len * 0.17;
    const g = hash(seed + k * 3) > 0.5 ? '#1F4A2A' : '#2A5530';
    c.fillStyle = INK; c.beginPath(); c.moveTo(0, ty - 3); c.lineTo(w + 2, ty + h + 1); c.lineTo(-w - 2, ty + h + 1); c.closePath(); c.fill();
    c.fillStyle = g; c.beginPath(); c.moveTo(0, ty); c.lineTo(w, ty + h); c.lineTo(-w, ty + h); c.closePath(); c.fill();
    c.fillStyle = mix(g, '#7DB87A', 0.2); c.beginPath(); c.moveTo(0, ty); c.lineTo(-w * 0.25, ty + h); c.lineTo(-w, ty + h); c.closePath(); c.fill();
    c.fillStyle = mix(g, '#000000', 0.3); c.fillRect(-w * 0.8, ty + h - 3, w * 1.6, 3);
  }
};

/** Where the trunk's butt is (world): on the cut, sliding off the stump to the ground as it lands (`drop` 0..1). */
const buttAt = (drop: number) => ({ x: AXE_TREE_X + (LOG_X - AXE_TREE_X) * drop, y: GY - CUT_H + (CUT_H - AXE_TR) * drop * drop });

/** The trunk above the cut, tipped `th` (radians from upright, toward the right) about its butt. */
const trunkAt = (c: Ctx, th: number, drop: number, clipGround: boolean) => {
  const b = buttAt(drop);
  c.save();
  if (clipGround) { c.beginPath(); c.rect(b.x - 400, GY - 900, 1200, 900 + 3); c.clip(); }
  c.translate(b.x, b.y); c.rotate(th);
  pineTrunk(c, LOG_LEN, AXE_TR, 77);
  c.restore();
};

/** A lumberjack's axe, its head at (hx, hy), the handle back from it along angle `a` (butt to head): hickory, the head
 *  painted red; `buried`: its bit's in the wood (not drawn). Its handle's 33 long. */
const axeAt = (c: Ctx, hx: number, hy: number, a: number, buried: boolean) => {
  const dx = Math.cos(a), dy = Math.sin(a), bx = hx - dx * 33, by = hy - dy * 33;
  c.lineCap = 'round';
  c.strokeStyle = '#3B2412'; c.lineWidth = 3.4; c.beginPath(); c.moveTo(bx, by); c.lineTo(hx, hy); c.stroke();
  c.strokeStyle = '#A0703C'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(bx, by); c.lineTo(hx, hy); c.stroke();
  c.lineCap = 'butt';
  c.save(); c.translate(hx, hy); c.rotate(a);
  const poly = (pts: number[], col: string) => { c.fillStyle = col; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.fill(); };
  const reach = buried ? 3 : 10;
  poly([-3.4, -6, 3.4, -6, 3.4, Math.min(2, reach), -3.4, Math.min(2, reach)], '#1C1917');
  poly([-2.6, -5.2, 2.6, -5.2, 2.6, Math.min(2.2, reach), -2.6, Math.min(2.2, reach)], '#B91C1C');
  if (!buried) {
    poly([-3.4, 2, 3.4, 2, 5.6, 10, -5.6, 10], '#1C1917'); poly([-2.6, 2.2, 2.6, 2.2, 4.6, 9, -4.6, 9], '#B91C1C');
    poly([-4.2, 6.6, 4.2, 6.6, 4.6, 9, -4.6, 9], '#D6DAE0');
  }
  c.restore();
};

/** The axe tree in the world (behind the cast): standing with the axe in it; the stump once it's chopped (the axe planted
 *  in it after); the trunk down along the ground. (Coming down it's drawn in front: drawFallingTree.) */
export const drawAxeTree = (c: Ctx, state: GameState, s: Arena) => {
  if (!onScreen(state, AXE_TREE_X - 200, LOG_X + LOG_LEN + 120)) return;
  const x = AXE_TREE_X, w = AXE_TR, top = GY - CUT_H;
  // ---- the stump (the bottom of the trunk), its roots spread
  c.fillStyle = INK; c.beginPath(); c.moveTo(x - w - 12, GY + 2); c.quadraticCurveTo(x - w - 1, GY - 6, x - w - 1, top); c.lineTo(x + w + 1, top); c.quadraticCurveTo(x + w + 1, GY - 6, x + w + 12, GY + 2); c.closePath(); c.fill();
  c.fillStyle = BARK; c.beginPath(); c.moveTo(x - w - 10, GY); c.quadraticCurveTo(x - w, GY - 6, x - w, top); c.lineTo(x + w, top); c.quadraticCurveTo(x + w, GY - 6, x + w + 10, GY); c.closePath(); c.fill();
  box(c, x - w, top, 5, CUT_H - 4, BARK_L); box(c, x + w - 4, top, 4, CUT_H - 4, BARK_D);
  for (let k = 0; k < 4; k++) box(c, x - w + 6 + k * 4, top + 6 + k * 7, 2, 8, BARK_DD);
  if (s.tree === 'up') {
    trunkAt(c, 0, 0, false);
    // (the axe, stuck in its near side at the height he'll cut it; a few old chops round it)
    for (const dy of [-14, 9]) { c.fillStyle = '#D8B886'; c.beginPath(); c.moveTo(x - w, top + dy - 3); c.lineTo(x - w + 5, top + dy); c.lineTo(x - w, top + dy + 2); c.closePath(); c.fill(); }
    if (s.axe === 'tree') axeAt(c, MH_CHOP_X + 34.8, GY - 54.2, -0.7, true);
    return;
  }
  // ---- chopped through: the cut's face (pale, its rings, a splintered lip on the far side where it broke)
  c.fillStyle = '#D8B886'; c.beginPath(); c.ellipse(x, top, w, 3, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#A88A5A'; c.lineWidth = 0.8; for (const r of [3, 6, 9]) { c.beginPath(); c.ellipse(x, top, Math.min(r, w - 1), Math.min(r, w - 1) * 0.27, 0, 0, Math.PI * 2); c.stroke(); }
  c.fillStyle = '#C8A070'; c.beginPath(); c.moveTo(x + w - 5, top - 1); c.lineTo(x + w - 2, top - 7); c.lineTo(x + w, top - 1); c.closePath(); c.fill();
  if (s.tree === 'down') {
    trunkAt(c, Math.PI / 2, 1, true);
    // (the lit top of the bare trunk: it's a ledge)
    box(c, LOG_X + 4, GY - 2 * AXE_TR, LOG_BARE - 4, 2, mix(BARK_L, '#FFFFFF', 0.25));
  }
  if (s.axe === 'stump') axeAt(c, x + 2, top + 1, 0.93, true);
};

/** The trunk coming down (in front of everybody: it comes down on his head). */
export const drawFallingTree = (c: Ctx, s: Arena) => {
  if (s.tree === 'falling') trunkAt(c, s.treeTh, s.treeDrop, s.treeDrop > 0);
};

/** The leaves (shaken off the oak, burst off the branch), in front. */
export const drawLeaves = (c: Ctx, s: Arena) => {
  for (const l of s.leaves) { c.save(); c.translate(l.x, l.y); c.rotate(l.rot); c.fillStyle = l.col; c.beginPath(); c.ellipse(0, 0, 4, 2, 0, 0, Math.PI * 2); c.fill(); c.restore(); }
};
export const tickLeaves = (s: Arena) => {
  for (const l of s.leaves) { l.vy = Math.min(1.4, l.vy + 0.16); l.vx *= 0.97; l.x += l.vx + Math.sin(l.life * 0.1) * 0.4; l.y += l.vy; l.rot += l.vr; l.life--; if (l.y > GY + 2) { l.y = GY + 2; l.vx = 0; l.vr = 0; } }
  s.leaves = s.leaves.filter(l => l.life > 0);
};
export const leafBurst = (s: Arena, x: number, y: number, n: number, up = 6, spread = 80) => {
  for (let i = 0; i < n; i++) s.leaves.push({ x: x + (Math.random() - 0.5) * spread, y: y - Math.random() * 30, vx: (Math.random() - 0.5) * 6, vy: -Math.random() * up, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, col: ['#B45309', '#D97706', '#92400E', '#CA8A04', '#7C2D12'][i % 5], life: 200 + Math.random() * 90 });
};
