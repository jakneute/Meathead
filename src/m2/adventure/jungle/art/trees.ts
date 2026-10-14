// The jungle's trees: the ones at the play plane (the branches he stands on growing out of them, the lianas he climbs
// run up them), the ones further back (standing on the ground going back, dimmer and hazier with it), the boughs the
// swinging vines hang off and the boas wrap round (dark, leaves on top: not to stand on), the lookout's planks, the
// bromeliads and moss on the trunks, the crowns. Trunks are a bark tile repeated up (stamped), roots a stamp each.

import { GROUND_Y } from '../../../../m1/constants';
import { timeOfDay, farTint, skyAt } from '../../../timeOfDay';
import { stamp } from '../../../intro/art/kit';
import { BRANCHES, VINES, BOA_BRANCHES, X, Y } from '../layout';
import { RUNS, FAR, atDepth } from './ground';
import { type Ctx, type View, INK, box, mix, hash, bark, roots, limb, clump, leaf, plank, lashing, LEAF, BARK, MOSS } from './paint';
import { signText, print } from '../../letters';

const GY = GROUND_Y;
const SEG = 128;

export interface Tree { x: number; w: number; base: number; seed: number; door?: boolean }
const groundUnder = (x: number) => RUNS.find(r => x >= r.a && x <= r.b)?.y ?? null;

/** The trees at the play plane: one for each branch (the climbing vine up its side, if there is one), and the big one
 *  with the cast members' door in it. */
export const TREES: Tree[] = (() => {
  const out: Tree[] = [];
  BRANCHES.forEach(([r0, r1], i) => {
    const cv = VINES.find(v => v.kind === 'climb' && v.x >= X(r0) - 40 && v.x <= X(r0) + 60);
    const w = cv ? 54 : 44 + (i % 3) * 6;
    const x = cv ? cv.x - w + 4 : (X(r0) + X(r1)) / 2 - w / 2;
    out.push({ x, w, base: groundUnder(x + w / 2) ?? GY, seed: i * 17 + 5 });
  });
  out.push({ x: X(8690), w: 96, base: GY, seed: 99, door: true });
  return out;
})();
/** Which tree a branch grows out of. */
const branchTree = (i: number) => TREES[i];

/** The trees further back: on the ground going back, never in a ravine, clear of the ends of things. */
const BACK: { x: number; d: number; w: number; base: number; seed: number }[] = (() => {
  const out: { x: number; d: number; w: number; base: number; seed: number }[] = [];
  for (let rx = 80, i = 0; rx < 11900; rx += 170 + hash(i * 3.7) * 190, i++) {
    const x = X(rx), r = RUNS.find(q => x > q.a + 90 && x < q.b - 90);
    if (!r) continue;
    const d = [0.72, 0.8, 0.88][i % 3];
    out.push({ x, d, w: 34 + hash(i * 5.5) * 40, base: r.y, seed: i * 7 + 1 });
  }
  return out.sort((a, b) => a.d - b.d);
})();

/** A trunk: bark tiles from its foot up past the top of the screen; its roots; a bromeliad or two; moss strands. */
const trunk = (c: Ctx, v: View, t: { x: number; w: number; base: number; seed: number }, pal: string[], key: string, topY: number) => {
  const variant = t.seed % 3, w = Math.round(t.w);
  for (let y = t.base - SEG, k = 0; y + SEG > topY; y -= SEG, k++) {
    c.save(); c.translate(Math.round(t.x), Math.round(y));
    stamp(c, `jg-bark-${key}-${w}-${(variant + k) % 3}`, -2, 0, w + 4, SEG, g => bark(g, 0, 0, SEG, w, (variant + k) % 3 * 31 + 7, pal));
    c.restore();
  }
  c.save(); c.translate(Math.round(t.x), Math.round(t.base));
  stamp(c, `jg-roots-${key}-${w}-${variant}`, -w * 1.8 - 30, -160, w * 4.6 + 60, 166, g => roots(g, 0, w, 0, variant * 13 + 3, pal));
  c.restore();
  void v;
};

/** Things growing on a trunk: bromeliads (a rosette of spiky leaves, a red flower), moss hanging. */
const epiphytes = (c: Ctx, t: Tree, f: number) => {
  for (let k = 0; k < 2; k++) {
    const y = t.base - 200 - hash(t.seed + k * 3.3) * 380, side = k % 2 ? 1 : -1, x = t.x + (side > 0 ? t.w - 2 : 2);
    for (let i = 0; i < 7; i++) leaf(c, x, y, 12 + (i % 3) * 3, -Math.PI / 2 + (i - 3) * 0.42 + side * 0.2, LEAF, i < 3 ? 4 : 3);
    box(c, x - 2, y - 10, 4, 6, INK); box(c, x - 1, y - 9, 2, 4, '#E0457B'); box(c, x - 1, y - 9, 1, 1, '#FFB0C8');
  }
  // (moss strands off it, swaying)
  for (let k = 0; k < 3; k++) {
    const y = t.base - 120 - hash(t.seed + k * 7.7) * 420, x = t.x + t.w * (0.2 + 0.3 * k), len = 20 + hash(t.seed + k) * 40;
    for (let d = 0; d < len; d += 2) box(c, x + Math.sin(d * 0.15 + f * 0.03 + k) * (d / len) * 3, y + d, 2, 2, (d >> 1) % 3 ? '#7E8E5E' : '#5E6E44');
  }
};

/** A bough off in the leaves (the swinging vines hang off them; the boas wrap round them): dark, leaves over the top
 *  of it, so it never reads as somewhere to stand. */
const bough = (c: Ctx, x: number, y: number, w: number, seed: number) => {
  c.save(); c.translate(Math.round(x), Math.round(y));
  stamp(c, `jg-bough-${w}-${seed % 4}`, -w - 60, -200, w * 2 + 120, 230, g => {
    // (a limb arching in from up in the canopy, down to where the vine's tied on, and on a little past it)
    const r = BARK.map(col => mix(col, '#000000', 0.2));
    const s0 = seed % 2 ? 1 : -1;
    const P = (t: number): [number, number] => {
      const ax = s0 * -w, ay = -190, bx = s0 * w * 0.35, by = -10, cx2 = s0 * -w * 0.2, cy2 = 6;
      return [(1 - t) * (1 - t) * ax + 2 * t * (1 - t) * cx2 + t * t * bx, (1 - t) * (1 - t) * ay + 2 * t * (1 - t) * cy2 + t * t * by];
    };
    const N = 18;
    for (const [col, wd, dy] of [[INK, 2, 0], [r[2], 0, 0], [r[4], -5, -2]] as [string, number, number][]) {
      g.strokeStyle = col; g.lineCap = 'round';
      for (let i = 1; i <= N; i++) { const [x0, y0] = P((i - 1) / N), [x1, y1] = P(i / N); g.lineWidth = Math.max(1, 14 - i * 0.45 + wd); g.beginPath(); g.moveTo(x0, y0 + dy); g.lineTo(x1, y1 + dy); g.stroke(); }
    }
    g.lineCap = 'butt';
    // (the knot the vine's tied round; moss hanging; leaves along the top of it, dark undersides)
    g.fillStyle = INK; g.beginPath(); g.ellipse(0, 0, 9, 7, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = r[3]; g.beginPath(); g.ellipse(-1, -1, 7, 5, 0, 0, Math.PI * 2); g.fill();
    for (let i = 2; i < N; i += 3) { const [mx, my] = P(i / N); for (let d = 0; d < 10 + (i % 4) * 6; d += 2) box(g, mx + Math.sin(d * 0.3 + i) * 1.5, my + 6 + d, 2, 2, (d >> 1) % 3 ? '#6E7E50' : '#4E5E38'); }
    for (const t of [0.15, 0.45, 0.8]) { const [lx, ly] = P(t); clump(g, lx, ly - 14, 34, 20, seed * 3 + Math.round(t * 10), LEAF, 1); }
  });
  c.restore();
};

/** The lookout up the first tree: planks across two bearers, lashed, a strut down to the trunk. */
const lookout = (c: Ctx, x0: number, x1: number, y: number, tx: number) => {
  stamp(c, `jg-lookout`, x0 - 20, y - 8, x1 - x0 + 40, 90, g => {
    // (the strut from the trunk up under the far end)
    g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.moveTo(tx, y + 80); g.lineTo(x1 - 24, y + 14); g.stroke();
    g.strokeStyle = BARK[3]; g.lineWidth = 6; g.beginPath(); g.moveTo(tx, y + 80); g.lineTo(x1 - 24, y + 14); g.stroke();
    g.strokeStyle = BARK[5]; g.lineWidth = 2; g.beginPath(); g.moveTo(tx, y + 78); g.lineTo(x1 - 26, y + 12); g.stroke();
    // (the bearer under the planks)
    plank(g, x0, y + 12, x1 - x0, 8, '#4A3220', 3, false);
    // (the planks: their ends showing, staggered a little)
    plank(g, x0, y, x1 - x0, 12, '#7A5634', 11);
    for (let px = x0 + 22; px < x1; px += 22 + (px % 3)) { box(g, px, y + 2, 1, 9, '#3A2614'); box(g, px + 1, y + 2, 1, 9, '#9A7650'); }
    // (the lip: worn, lit, a little moss on it)
    box(g, x0, y, x1 - x0, 2, '#D8B884'); box(g, x0, y, x1 - x0, 1, '#F2DCAE');
    for (let mx = x0 + 10; mx < x1 - 10; mx += 37) box(g, mx, y - 1, 8, 2, MOSS[4]);
    lashing(g, x0 + 8, y + 10, 8, 3); lashing(g, x1 - 12, y + 10, 8, 3);
  });
};

/** The door in the big tree: a cast members' door, bark-painted, a keypad, a lamp. */
const door = (c: Ctx, t: Tree, f: number) => {
  const dx = t.x + t.w / 2 - 19, dy = t.base - 78;
  stamp(c, 'jg-door', dx - 30, dy - 40, 120, 124, g => {
    // (the frame, hidden in the bark: a seam round it)
    g.fillStyle = INK; g.beginPath(); g.moveTo(dx - 3, dy + 78); g.lineTo(dx - 3, dy + 14); g.quadraticCurveTo(dx + 19, dy - 10, dx + 41, dy + 14); g.lineTo(dx + 41, dy + 78); g.fill();
    g.fillStyle = '#5A3E24'; g.beginPath(); g.moveTo(dx, dy + 78); g.lineTo(dx, dy + 14); g.quadraticCurveTo(dx + 19, dy - 6, dx + 38, dy + 14); g.lineTo(dx + 38, dy + 78); g.fill();
    // (painted to look like bark: grooves; the paint chipped, steel showing)
    for (let i = 0; i < 5; i++) box(g, dx + 4 + i * 7, dy + 10, 2, 66, i % 2 ? '#3E2A18' : '#4A3320');
    for (let i = 0; i < 4; i++) box(g, dx + 6 + i * 7, dy + 12, 1, 60, '#7A5A3A');
    box(g, dx + 8, dy + 50, 6, 3, '#8A949E'); box(g, dx + 26, dy + 28, 4, 2, '#8A949E');
    // (the handle, a plaque, a keypad)
    box(g, dx + 30, dy + 44, 5, 3, INK); box(g, dx + 30, dy + 44, 4, 2, '#C0C4CC');
    box(g, dx + 4, dy + 19, 30, 21, INK); box(g, dx + 5, dy + 20, 28, 19, '#E8E4D8'); box(g, dx + 5, dy + 20, 28, 1, '#FFFFFF');
    signText(g, 'CAST', dx + 19, dy + 28, print(1, '#1E3A8A')); signText(g, 'ONLY', dx + 19, dy + 37, print(1, '#1E3A8A'));
    box(g, dx + 44, dy + 36, 10, 14, INK); box(g, dx + 45, dy + 37, 8, 12, '#3A3F48');
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) box(g, dx + 46 + j * 4, dy + 41 + i * 3, 2, 2, '#9CA3AF');
    // (the lamp over it: a caged bulb)
    box(g, dx + 15, dy - 14, 8, 6, INK); box(g, dx + 16, dy - 13, 6, 4, '#3A3F48');
    box(g, dx + 16, dy - 9, 6, 6, '#D8D0A8'); box(g, dx + 15, dy - 9, 1, 6, INK); box(g, dx + 22, dy - 9, 1, 6, INK); box(g, dx + 18, dy - 9, 1, 6, '#3A3F48');
    // (the step, worn)
    box(g, dx - 6, dy + 76, 50, 4, INK); box(g, dx - 5, dy + 76, 48, 3, '#6E6A60'); box(g, dx - 5, dy + 76, 48, 1, '#A8A296');
  });
  // (the keypad's light, blinking)
  box(c, dx + 47, dy + 38, 2, 1, (f >> 5) % 2 ? '#4ADE80' : '#14532D');
  // (the bulb, lit after dark)
  const lamps = timeOfDay().lamps;
  if (lamps > 0.05) { c.fillStyle = `rgba(255, 236, 170, ${(0.15 * lamps).toFixed(3)})`; c.beginPath(); c.arc(dx + 19, dy - 6, 14, 0, Math.PI * 2); c.fill(); box(c, dx + 16, dy - 9, 6, 6, '#FFF4C0'); }
};
/** Where the door's lamp is (for the night's light). */
export const doorLamp = () => { const t = TREES.find(q => q.door)!; return { x: t.x + t.w / 2, y: t.base - 84 }; };

/** The trees going back (behind everything at the play plane). */
export const drawBackTrees = (c: Ctx, v: View) => {
  const tod = timeOfDay(), haze = skyAt(0.9, tod);
  for (const t of BACK) {
    // (where it is on screen, roughly: off it, skip it)
    const sx = v.eye.x + (t.x - v.eye.x) * t.d;
    if (sx + t.w * 2 < v.v0 || sx - t.w * 2 > v.v1) continue;
    if (v.eye.y > t.base + 400) continue;
    const k = (1 - t.d) * 1.6;
    const pal = BARK.map(col => mix(farTint(mix(col, '#000000', 0.1), 0.5, tod), haze, k * 0.5));
    atDepth(c, v.eye, t.d, () => {
      const topY = v.eye.y + (v.top - v.eye.y) / t.d;
      trunk(c, v, t, pal, `b${Math.round(t.d * 100)}-${tod.key}`, topY);
      // (a crown up in the leaves, if it's that low)
      const lf = LEAF.map(col => mix(farTint(col, 0.5, tod), haze, k * 0.5));
      const cy = t.base - 640 - hash(t.seed) * 160;
      if (cy > topY - 80) { c.save(); c.translate(Math.round(t.x + t.w / 2), Math.round(cy)); stamp(c, `jg-crown-${Math.round(t.d * 100)}-${t.seed % 3}-${tod.key}`, -120, -70, 240, 140, g => clump(g, 0, 0, 100, 50, t.seed % 3 * 11 + 4, lf, 1)); c.restore(); }
    });
  }
  void FAR;
};

/** The trees at the play plane, their branches, the boughs, the lookout. */
export const drawTrees = (c: Ctx, v: View) => {
  const tod = timeOfDay(), f = v.f;
  for (const t of TREES) {
    if (t.x + t.w * 3 < v.v0 || t.x - t.w * 2 > v.v1) continue;
    trunk(c, v, t, BARK, 'p', v.top);
    epiphytes(c, t, f);
    if (t.door) door(c, t, f);
    // (its crown, up in the canopy)
    const cy = t.base - 760 - hash(t.seed) * 120;
    if (cy > v.top - 80) { c.save(); c.translate(Math.round(t.x + t.w / 2), Math.round(cy)); stamp(c, `jg-pcrown-${t.seed % 3}`, -150, -80, 300, 160, g => clump(g, 0, 0, 130, 60, t.seed % 3 * 7 + 2, LEAF, 0)); c.restore(); }
  }
  // The boughs the swinging vines hang off, and the boas' (dark, leafy on top)
  VINES.forEach((d, i) => { if (d.kind === 'swing' && d.x > v.v0 - 200 && d.x < v.v1 + 200) bough(c, d.x, d.y, 120 + (i % 3) * 30, i); });
  for (const s of BOA_BRANCHES) if (s.x > v.v0 - 200 && s.x < v.v1 + 200) bough(c, s.x - 8, s.y - 2, 110, 7);
  // The branches to stand on: real wood out of their trees, the lit lip along the top
  BRANCHES.forEach(([r0, r1, h], i) => {
    const a = X(r0), b = X(r1), y = Y(h);
    if (b < v.v0 - 50 || a > v.v1 + 50) return;
    const t = branchTree(i);
    if (i === 0) { lookout(c, a, b, y, t.x + t.w / 2); return; }
    const tl = t.x, tr = t.x + t.w;
    const left: 'trunk' | 'cut' | 'taper' = a >= tl - 4 && a <= tr ? 'trunk' : 'taper';
    const right: 'trunk' | 'cut' | 'taper' = b >= tl && b <= tr + 4 ? 'trunk' : i % 2 ? 'cut' : 'taper';
    stamp(c, `jg-limb-${i}`, a - 20, y - 8, b - a + 40, 50, g => {
      limb(g, a, y, b - a, 16, i * 11 + 3, { left, right });
      // (where it meets the trunk: a collar of bark round the joint)
      for (const jx of [tl, tr]) if (jx > a - 2 && jx < b + 2) { g.fillStyle = BARK[2]; g.beginPath(); g.ellipse(jx, y + 8, 7, 12, 0, 0, Math.PI * 2); g.fill(); box(g, jx - 5, y - 2, 10, 3, MOSS[4]); }
    });
  });
  void tod;
};
