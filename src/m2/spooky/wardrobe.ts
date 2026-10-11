// The costume department: every costume Spooky Land's staff wear, each put on over the one person drawer (costume.ts),
// so the costumes all match (proportions, shading, ink) and whoever's in one shows (their skin at the hands and the face
// hole, their build, their hair, a man's mustache under a bride's veil). One costume is one theme-park character
// wherever it's worn: the town's witch and the castle's are the same hat, nose and robe; the castle's igor and the
// tower's the same burlap and hump (only the fork in hand differs); the same with the brides, the mummies, the skeletons.
//
// Each `draw...` puts a frame down from its stamp: feet at the origin, facing right.

import {
  type Pose, type Mood, type Body, type Frame, INK, dk, lt, mix, part, partTop, flat, px, dither, limb, ball,
  bodyOf, legs, torso, arm, headShape, faceOn, whiskers, glasses, hairTop, hairBack, frameOf, putFrame, pickOf,
} from './costume';

type Ctx = CanvasRenderingContext2D;

export interface Wear { seed: number; f: number; pose: Pose; md: Mood; t?: number; woman?: boolean }

const angry = (p: Pose) => p === 'tell' || p === 'strike';
/** Their whole head, as themselves: hair, head, face, whiskers, glasses. */
const ownHead = (g: Ctx, B: Body, F: Frame, eyes: 'open' | 'angry' | 'wide' | 'tired', mouth: 'flat' | 'frown' | 'teeth' | 'grin' | 'o' | 'smile', skin = B.L.skin) => {
  hairBack(g, B);
  headShape(g, B, skin);
  faceOn(g, B, { skin, eyes, mouth, md: F.md, blink: F.blink });
  whiskers(g, B); glasses(g, B);
  hairTop(g, B);
};

// ---------------------------------------------------------------------------------------------------------------
// Props (shared: the thrown ones are drawn live, small)

/** A potion bottle (a round flask of green, a cork). */
export const potion = (g: Ctx, x: number, y: number) => {
  ball(g, x, y + 2, 5.5, '#4D9A2A', 1.2);
  part(g, () => g.rect(x - 2, y - 8, 4, 5), '#9ED16B', x - 2, y - 8, 4, 5, 1);
  px(g, x - 2, y - 11, 4, 3, '#8A5A2B');
  px(g, x - 3, y - 1, 2, 2, '#E3F5C8'); px(g, x + 1, y + 4, 2, 1, '#2F6B17');
};
/** A plastic bone (a prop: the whitest bone you ever saw). */
export const bone = (g: Ctx) => {
  limb(g, -8, 0, 8, 0, 4, '#F2EEE2');
  for (const [x, y] of [[-9.5, -2], [-9.5, 2], [9.5, -2], [9.5, 2]]) ball(g, x, y, 2.8, '#F2EEE2', 1);
  px(g, -6, -1, 10, 1, '#FFFFFF');
};
/** A bouquet of dead roses, stems wrapped (the brides'): about (0, 0), its blooms up (-y). */
export const bouquet = (g: Ctx) => {
  limb(g, -1, 2, 0, 13, 4, '#4D5A26');
  px(g, -3, 4, 6, 3, '#6B1F3A');
  for (const [x, y, r] of [[-5, -4, 3.6], [3, -5, 3.6], [-1, -9, 3.4], [6, -1, 3], [-7, 1, 2.8]] as const) {
    ball(g, x, y, r, '#5E0F24', 1);
    px(g, x - 1, y - 1, 2, 1, '#9B2C4A');
  }
  px(g, -9, 3, 3, 2, '#3F4A1E'); px(g, 7, 3, 3, 2, '#3F4A1E');
};

// ---------------------------------------------------------------------------------------------------------------
// The gift shop's clerks and hawkers: their own clothes, a red vest with a name tag, devil horns on a headband

const vest = (g: Ctx, B: Body, tp: () => void) => {
  const top = B.shY, bot = B.hipY + 2, ln = B.lean;
  g.save(); g.beginPath(); tp(); g.clip();
  part(g, () => g.rect(-B.w / 2 - 4 + ln, top, B.w + 8, bot - top), '#B91C1C', -B.w / 2 - 4 + ln, top, B.w + 8, bot - top, 0);
  // (open down the front: their shirt in a V, and a strip of it to the hem)
  part(g, () => { g.moveTo(-5 + ln, top - 1); g.lineTo(7 + ln, top - 1); g.lineTo(2.5 + ln, top + 14); g.lineTo(2.5 + ln, bot); g.lineTo(-0.5 + ln, bot); g.lineTo(-0.5 + ln, top + 14); g.closePath(); }, B.L.shirt, -5 + ln, top, 12, bot - top, 1);
  g.restore();
  g.beginPath(); tp(); g.strokeStyle = INK; g.lineWidth = 1.2; g.stroke();
  part(g, () => g.rect(5 + ln, top + 7, 7, 4), '#F8FAFC', 5 + ln, top + 7, 7, 4, 0.8);
  px(g, 6 + ln, top + 8.5, 5, 1, '#1E3A8A');
};
const horns = (g: Ctx, B: Body) => {
  const { hx, hy } = B;
  g.strokeStyle = INK; g.lineWidth = 2.6; g.beginPath(); g.arc(hx, hy - 1, 10, Math.PI * 1.08, Math.PI * 1.92); g.stroke();
  g.strokeStyle = '#27272A'; g.lineWidth = 1.2; g.stroke();
  for (const [x, lean] of [[hx - 5, -1], [hx + 5, 1]] as const) part(g, () => { g.moveTo(x - 3, hy - 9); g.quadraticCurveTo(x - 2 + lean, hy - 16, x + lean * 3, hy - 20); g.quadraticCurveTo(x + 1, hy - 14, x + 3, hy - 9.5); g.closePath(); }, '#DC2626', x - 3, hy - 20, 7, 11, 1);
};
const pitchfork = (g: Ctx, x: number, y: number, a: number, handle: string, len = 46, tines = 3) => {
  g.save(); g.translate(x, y); g.rotate(a);
  limb(g, -len * 0.35, 0, len * 0.65, 0, 3, handle);
  const tx = len * 0.65;
  part(g, () => g.rect(tx - 1, -(tines - 1) * 2.6 - 1.5, 3, (tines - 1) * 5.2 + 3), '#3F3F46', tx - 1, -8, 3, 16, 1);
  for (let k = 0; k < tines; k++) { const ty = -(tines - 1) * 2.6 + k * 5.2; flat(g, () => { g.moveTo(tx + 1, ty - 1); g.lineTo(tx + 13, ty - 0.5); g.lineTo(tx + 16, ty); g.lineTo(tx + 13, ty + 1); g.lineTo(tx + 1, ty + 1); g.closePath(); }, '#D4D4D8', 0.9); px(g, tx + 3, ty - 0.6, 8, 0.6, '#FFFFFF'); }
  g.restore();
};

const paintShop = (g: Ctx, F: Frame, kind: 'clerk' | 'hawker') => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const sl = { sleeve: L.shirt, hand: L.skin, len: 0.45 };
  let far: [number, number], near: [number, number];
  if (kind === 'clerk') {
    far = F.pose === 'tell' ? [0, -45] : F.pose === 'strike' ? [B.w / 2 + 4, -46] : [B.w / 2 - 3, -41];
    near = F.pose === 'tell' ? [B.w / 2 - 1, -47] : F.pose === 'strike' ? [B.w / 2 + 15, -47] : [B.w / 2 + 7, -42];
  } else {
    const sw = F.pose === 'walk' ? Math.sin((F.fr / 6) * Math.PI * 2) * 4 : 0;
    far = [-B.w / 2 - 1 - sw, -33];
    near = F.pose === 'tell' ? (F.t < 0.75 ? [B.w / 2 - 3, -82] : [B.w / 2 + 14, -60]) : [B.w / 2 + 1 + sw, -33];
  }
  legs(g, B, { col: L.pants, shoe: 'sneaker', shoeCol: '#27272A' });
  arm(g, B, -1, far[0], far[1], sl);
  vest(g, B, torso(g, B, L.shirt));
  ownHead(g, B, F, angry(F.pose) ? 'angry' : 'open', F.pose === 'strike' ? 'teeth' : F.pose === 'tell' ? 'grin' : 'frown');
  horns(g, B);
  if (kind === 'clerk') {
    const a = F.pose === 'tell' ? -0.3 : F.pose === 'strike' ? 0 : -0.12;
    pitchfork(g, near[0] - 6, near[1] + 1, a, '#B91C1C', 48);
  } else if (F.pose === 'tell' && F.t < 0.75) globe(g, near[0], near[1] - 7, 0);
  else if (F.pose !== 'tell') {
    // (the crate of them at his feet)
    part(g, () => g.rect(-28, -16, 18, 16), '#A16207', -28, -16, 18, 16, 1.2);
    px(g, -28, -10, 18, 1, '#713F12');
    for (const x of [-25, -19]) { ball(g, x + 1, -18, 2.6, '#BAE6FD', 0.8); }
  }
  arm(g, B, 1, near[0], near[1], sl);
};
export const drawShopStaff = (c: Ctx, kind: 'clerk' | 'hawker', w: Wear) => {
  const F = frameOf(w.seed, w.f, w.pose, w.md, w.t, w.woman, kind);
  putFrame(c, 'shop', F, [-36, -96, 116, 100], g => paintShop(g, F, kind));
};

/** An I SURVIVED HELL snow globe: the base, the dome, the glitter (drawn live in the air). */
export const globe = (g: Ctx, x: number, y: number, spin: number) => {
  g.save(); g.translate(Math.round(x), Math.round(y)); g.rotate(spin);
  part(g, () => g.rect(-6, 2, 12, 5), '#7F1D1D', -6, 2, 12, 5, 1);
  part(g, () => g.arc(0, -2, 6, 0, Math.PI * 2), '#BAE6FD', -6, -8, 12, 12, 1);
  px(g, -2, -3, 4, 5, '#DC2626'); px(g, -1, -5, 2, 2, '#DC2626');
  for (let i = 0; i < 5; i++) px(g, -4 + ((i * 3.3) % 8), -6 + ((i * 2.1) % 6), 1, 1, '#F97316');
  px(g, -3, -6, 2, 2, '#FFFFFF');
  g.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The ghost: a bedsheet with eyeholes, sneakers showing under it

const SHEETS = ['#F2EFE9', '#ECE8F0', '#F5F1E4', '#E7EBF0'];
const paintGhost = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose === 'strike' ? 'strike' : F.pose, F.fr), L = B.L;
  g.scale(0.92, 0.92);
  const sheet = pickOf(F.seed, 1, SHEETS);
  legs(g, B, { col: L.pants, shoe: 'sneaker', shoeCol: L.shirt });
  const boo = F.pose === 'tell' || F.pose === 'strike';
  const hw = B.w / 2 + 8, ln = F.pose === 'strike' ? 5 : 0, sway = [0, 1, 0, -1, 0, 1][F.fr];
  const { hx, hy } = B;
  const path = () => {
    g.moveTo(-hw, -11);
    g.lineTo(-hw + 1 + ln, B.shY + 10);
    if (boo) { g.lineTo(-hw - 9 + ln, B.shY - 10); g.lineTo(-B.w / 2 + ln, B.shY - 2); }
    g.quadraticCurveTo(hx - 13 + ln, hy + 4, hx - 11 + ln, hy - 2);
    g.arc(hx + ln, hy - 1, 11, Math.PI, 0);
    g.quadraticCurveTo(hx + 12 + ln, hy + 6, B.w / 2 + 2 + ln, B.shY + 1);
    if (boo) { g.lineTo(hw + 12 + ln, B.shY - 12); g.lineTo(hw + 4 + ln, B.shY + 8); }
    g.lineTo(hw + 2, -12);
    for (let i = 0; i <= 6; i++) g.lineTo(hw - (i * hw * 2) / 6, -10 + (i % 2 ? -4 : 1) + (i % 3 === 1 ? sway : 0));
    g.closePath();
  };
  part(g, path, sheet, -hw - 10, hy - 12, hw * 2 + 24, 80, 1.4);
  // (the folds: hanging from under the arms, a step darker)
  g.save(); g.beginPath(); path(); g.clip();
  for (const fx of [-hw + 6, -2, hw - 7]) { px(g, fx + ln * 0.5, B.shY + 8, 1, -B.shY - 18, dk(sheet, 0.2)); px(g, fx + 1 + ln * 0.5, B.shY + 12, 1, -B.shY - 24, lt(sheet, 0.4)); }
  dither(g, -hw, -18, hw * 2, 8, dk(sheet, 0.14));
  // (the seed's own: a laundry tag, a coffee stain, a patch)
  const odd = F.seed % 3;
  if (odd === 0) { px(g, -hw + 3, B.shY + 14, 4, 5, '#FFFFFF'); px(g, -hw + 4, B.shY + 16, 2, 1, '#2563EB'); }
  else if (odd === 1) dither(g, 2, -36, 7, 6, '#B08A5A');
  else { part(g, () => g.rect(-6, -32, 7, 7), pickOf(F.seed, 4, ['#93C5FD', '#FDA4AF', '#FCD34D']), -6, -32, 7, 7, 0.8); }
  g.restore();
  // (the eyeholes, their eyes in them; the mouth hole torn for the BOO)
  for (const ex of [hx + 0.5 + ln, hx + 7 + ln]) {
    flat(g, () => g.ellipse(ex, hy - 1, 3, 3.6, 0, 0, Math.PI * 2), L.skin, 1.2);
    if (F.md === 'dead') { g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(ex - 1.5, hy - 2.5); g.lineTo(ex + 1.5, hy + 0.5); g.moveTo(ex + 1.5, hy - 2.5); g.lineTo(ex - 1.5, hy + 0.5); g.stroke(); }
    else if (F.md === 'hurt' || F.blink) px(g, ex - 1.5, hy - 1, 3, 1, INK);
    else { px(g, ex - 0.5, hy - 2, 2, 2.5, INK); px(g, ex - 0.5, hy - 2, 1, 1, '#FFFFFF'); }
    if (boo) px(g, ex - 2.5, hy - 4.5, 5, 1.2, INK);
  }
  if (boo || F.md !== 'ok') { flat(g, () => g.ellipse(hx + 4 + ln, hy + 8, 3.5, 4.5, 0, 0, Math.PI * 2), '#3B1414', 1.2); px(g, hx + 2.5 + ln, hy + 5, 3, 1, L.skin); }
};
export const drawGhostCostume = (c: Ctx, w: Wear) => {
  const F = frameOf(w.seed, w.f, w.pose, w.md, 0, w.woman, 'g');
  putFrame(c, 'ghost', F, [-44, -84, 92, 88], g => paintGhost(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The wolfman: a rented fur suit, a wolf's-head hood (the person's face under the snout), claws

const FURS = ['#6B4423', '#5A524C', '#3F3833', '#7C4A1E'];
const paintWolf = (g: Ctx, F: Frame) => {
  const run = F.pose === 'strike', howl = F.pose === 'tell';
  const B = bodyOf(F.seed, run ? 'walk' : F.pose, run ? F.fr : F.fr), L = B.L;
  if (run) { const a = (F.fr / 6) * Math.PI * 2, s = Math.sin(a) * 10; B.feet = [-s, s]; }
  const fur = pickOf(F.seed, 2, FURS), belly = mix(fur, '#D9B88A', 0.45);
  legs(g, B, { col: fur, shoe: 'paw', shoeCol: dk(fur, 0.1) });
  g.save(); if (run) { g.translate(0, -30); g.rotate(0.3); g.translate(0, 30); }
  const furArm = { sleeve: fur, hand: dk(fur, 0.15), claw: true, w: B.armW + 1.5 };
  arm(g, B, -1, howl ? -B.w / 2 - 4 : run ? B.w / 2 + 10 : -B.w / 2 - 1, howl ? B.shY - 24 : run ? -50 : -33, furArm);
  const tp = torso(g, B, fur);
  g.save(); g.beginPath(); tp(); g.clip();
  part(g, () => g.ellipse(3, (B.shY + B.hipY) / 2 + 2, B.w / 2 - 4, 10, 0, 0, Math.PI * 2), belly, 3 - B.w / 2, B.shY, B.w - 8, 24, 0);
  // (the zipper up the back)
  px(g, -B.w / 2 + 2, B.shY + 4, 1, -B.shY + B.hipY - 4, '#D4D4D8');
  for (let y = B.shY + 5; y < B.hipY; y += 3) px(g, -B.w / 2 + 1, y, 3, 1, '#9CA3AF');
  g.restore();
  // (shaggy tufts down its sides)
  for (const s of [-1, 1]) for (let y = B.shY + 6; y < B.hipY; y += 5) flat(g, () => { const x = s * (B.w / 2 + (B.L.heavy ? 2 : 0)) - s; g.moveTo(x, y); g.lineTo(x + s * 4, y + 2); g.lineTo(x, y + 4); g.closePath(); }, dk(fur, 0.1), 0.8);
  // The head: their face, the wolf hood over it (ears, the snout out over the forehead, teeth hanging off it)
  g.save(); if (howl) { g.translate(B.hx, B.hy + 8); g.rotate(-0.55); g.translate(-B.hx, -B.hy - 8); }
  const { hx, hy } = B;
  part(g, () => g.ellipse(hx - 1, hy + 1, B.rx + 4, B.ry + 3.5, 0, 0, Math.PI * 2), fur, hx - B.rx - 5, hy - B.ry - 3, B.rx * 2 + 9, B.ry * 2 + 8);
  if (L.long || L.woman) hairBack(g, B);
  headShape(g, B, L.skin, false);
  faceOn(g, B, { skin: L.skin, eyes: run ? 'angry' : 'open', mouth: howl ? 'o' : run ? 'teeth' : 'frown', md: F.md, blink: F.blink });
  whiskers(g, B);
  for (const ex of [hx - 6, hx + 2]) {
    part(g, () => { g.moveTo(ex - 3, hy - 8); g.lineTo(ex + 1, hy - 21); g.lineTo(ex + 5, hy - 8); g.closePath(); }, fur, ex - 3, hy - 21, 8, 13, 1);
    flat(g, () => { g.moveTo(ex - 0.5, hy - 9); g.lineTo(ex + 1, hy - 16); g.lineTo(ex + 2.5, hy - 9); g.closePath(); }, '#C98E8E', 0);
  }
  part(g, () => { g.moveTo(hx - 9, hy - 4); g.quadraticCurveTo(hx - 6, hy - 13, hx + 4, hy - 11); g.lineTo(hx + 19, hy - 6); g.quadraticCurveTo(hx + 22, hy - 4, hx + 19, hy - 1); g.lineTo(hx - 2, hy - 3); g.closePath(); }, fur, hx - 9, hy - 13, 31, 12);
  ball(g, hx + 19.5, hy - 4.5, 2.2, '#18181B', 0.8);
  for (let x = hx + 4; x < hx + 18; x += 3.5) flat(g, () => { g.moveTo(x, hy - 2.5); g.lineTo(x + 1.2, hy + 0.5); g.lineTo(x + 2.4, hy - 2.5); g.closePath(); }, '#F5F5F4', 0.6);
  ball(g, hx + 5, hy - 9, 1.6, '#FDE047', 0.6); px(g, hx + 5, hy - 9.5, 1, 1, INK);
  g.restore();
  arm(g, B, 1, howl ? B.w / 2 + 4 : run ? B.w / 2 + 18 : B.w / 2 + 14, howl ? B.shY - 26 : run ? -46 : -42, furArm);
  g.restore();
};
export const drawWolfCostume = (c: Ctx, w: Wear) => {
  const F = frameOf(w.seed, w.f, w.pose, w.md, 0, w.woman, 'w');
  putFrame(c, 'wolf', F, [-40, -100, 92, 104], g => paintWolf(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The monster: a big one on platform boots, a jacket a size too small, the face painted a corpse's patchwork, stitched

const JACKETS = ['#2B2A33', '#3B2F2A', '#2F3B35', '#2A2547'];
const paintMonster = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose === 'strike' ? 'tell' : F.pose, F.fr), L = B.L;
  g.scale(1.18, 1.18); g.translate(0, -9);
  const jacket = pickOf(F.seed, 3, JACKETS), paint = mix(L.skin, '#93A88E', 0.62);
  B.w += 8; B.armW += 2.5; B.legW += 2; B.rx += 1.6; B.ry += 1.6; B.hy -= 2;
  legs(g, B, {
    col: '#4A4540', shoe: 'platform', shoeCol: '#141218',
    detail: (gg, _h, k, f, near) => { gg.save(); limb(gg, f[0] + (k[0] - f[0]) * 0.3, f[1] + (k[1] - f[1]) * 0.3, f[0], f[1] + 4, B.legW - 1, near ? L.skin : dk(L.skin, 0.12)); gg.restore(); },
  });
  const raise = F.pose === 'tell', smash = F.pose === 'strike';
  const jk = { sleeve: jacket, hand: L.skin, len: 0.8, w: B.armW };
  const fists: [number, number][] = raise ? [[B.hx - 4, B.hy - 26], [B.hx + 6, B.hy - 28]] : smash ? [[B.w / 2 + 14, -40], [B.w / 2 + 22, -36]] : [[-B.w / 2 - 2, -32], [B.w / 2 + 2, -34]];
  arm(g, B, -1, fists[0][0], fists[0][1], jk);
  torso(g, B, jacket, B.shY - 2);
  // (square shoulder pads, the lapels, two buttons that don't match, a patch)
  for (const s of [-1, 1]) part(g, () => g.roundRect(s < 0 ? -B.w / 2 - 2 : B.w / 2 - 8, B.shY - 3, 10, 5, 1), jacket, s < 0 ? -B.w / 2 - 2 : B.w / 2 - 8, B.shY - 3, 10, 5, 1);
  flat(g, () => { g.moveTo(-3, B.shY); g.lineTo(1, B.shY + 14); g.lineTo(5, B.shY); g.closePath(); }, '#E7E5E4', 1);
  flat(g, () => { g.moveTo(-3, B.shY); g.lineTo(1, B.shY + 14); g.lineTo(-7, B.shY + 1); g.closePath(); }, dk(jacket, 0.3), 1);
  ball(g, 3, B.shY + 18, 1.4, '#CA8A04', 0.6); ball(g, 3, B.shY + 24, 1.4, '#9CA3AF', 0.6);
  part(g, () => g.rect(-B.w / 2 + 3, B.shY + 14, 6, 6), mix(jacket, '#7C5A3A', 0.5), -B.w / 2 + 3, B.shY + 14, 6, 6, 0.8);
  // The head: patchwork paint over their face, a stitched scar, a shaggy black wig, heavy brows
  const { hx, hy } = B;
  headShape(g, B, paint);
  g.save(); g.beginPath(); g.ellipse(hx, hy, B.rx, B.ry, 0, 0, Math.PI * 2); g.clip();
  part(g, () => { g.moveTo(hx - 12, hy + 2); g.lineTo(hx + 3, hy + 4); g.lineTo(hx + 1, hy + 14); g.lineTo(hx - 12, hy + 14); g.closePath(); }, mix(paint, '#7A8C9A', 0.5), hx - 12, hy + 2, 15, 12, 0);
  g.restore();
  faceOn(g, B, { skin: paint, eyes: raise || smash ? 'angry' : 'tired', mouth: smash ? 'teeth' : 'frown', md: F.md, blink: F.blink });
  px(g, hx - 1, hy - 5.5, 10, 1.6, INK);
  g.strokeStyle = INK; g.lineWidth = 0.9; g.beginPath(); g.moveTo(hx - 7, hy - 7); g.lineTo(hx + 6, hy - 8); for (let x = hx - 6; x < hx + 6; x += 2.5) { g.moveTo(x, hy - 9); g.lineTo(x + 0.5, hy - 6); } g.stroke();
  g.beginPath(); g.moveTo(hx - 3, hy + 3); g.lineTo(hx + 2, hy + 11); for (let k = 0; k < 3; k++) { g.moveTo(hx - 2 + k * 1.6, hy + 4 + k * 2.6); g.lineTo(hx + 0.5 + k * 1.6, hy + 3 + k * 2.6); } g.stroke();
  part(g, () => { g.moveTo(hx - B.rx - 1, hy + 1); g.quadraticCurveTo(hx - B.rx, hy - B.ry - 4, hx + 2, hy - B.ry - 3); g.quadraticCurveTo(hx + B.rx + 2, hy - B.ry - 2, hx + B.rx + 1, hy - 5); for (let k = 0; k < 6; k++) g.lineTo(hx + B.rx - 2 - k * 3, hy - 7 + (k % 2 ? 3 : 0)); g.lineTo(hx - B.rx + 1, hy - 4); g.closePath(); }, '#17151C', hx - B.rx - 1, hy - B.ry - 4, B.rx * 2 + 3, 14);
  arm(g, B, 1, fists[1][0], fists[1][1], jk);
  if (raise) { ball(g, hx + 1, hy - 28, 6, L.skin, 1.2); }
};
export const drawMonsterCostume = (c: Ctx, w: Wear) => {
  const F = frameOf(w.seed, w.f, w.pose, w.md, 0, w.woman, 'm');
  putFrame(c, 'monster', F, [-46, -140, 112, 144], g => paintMonster(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The witch: a tall bent hat, green face paint, a rubber nose with a wart, striped tights, pointy boots

const ROBES = ['#2E1A47', '#1E1C26', '#173B2A', '#3B1030'];
const witchHead = (g: Ctx, B: Body, F: Frame, cackle: boolean) => {
  const L = B.L, { hx, hy } = B;
  const paint = mix(L.skin, '#6FBF5A', 0.68);
  hairBack(g, B, L.bald ? '#57534E' : L.hair, 20);
  // (stringy hair out from under the hat, both sides: their own, or a wig if they've none)
  const hair = L.bald ? '#57534E' : L.hair;
  part(g, () => { g.moveTo(hx - 10, hy - 6); g.lineTo(hx - 13, hy + 14); g.lineTo(hx - 7, hy + 8); g.lineTo(hx - 6, hy - 4); g.closePath(); }, hair, hx - 13, hy - 6, 7, 20, 1);
  headShape(g, B, paint, false);
  faceOn(g, B, { skin: paint, eyes: cackle ? 'angry' : 'open', mouth: cackle ? 'grin' : 'smirk', md: F.md, blink: F.blink, nose: false });
  // (the rubber nose, hooked, the wart on it)
  part(g, () => { g.moveTo(hx + 4, hy - 1); g.quadraticCurveTo(hx + 13, hy + 1, hx + 12, hy + 6); g.quadraticCurveTo(hx + 9, hy + 4, hx + 5, hy + 4); g.closePath(); }, mix(paint, '#4F8F3A', 0.4), hx + 4, hy - 1, 9, 7, 1);
  ball(g, hx + 9, hy + 1.5, 1.2, '#7A5A2A', 0.5);
  // (the hat: a wide brim, the cone bent back at the tip, a purple band and a buckle)
  const H = '#1D1726';
  part(g, () => g.ellipse(hx + 1, hy - 8, 16, 3.4, -0.05, 0, Math.PI * 2), H, hx - 15, hy - 11, 32, 7);
  part(g, () => { g.moveTo(hx - 8, hy - 9); g.quadraticCurveTo(hx - 5, hy - 18, hx - 3, hy - 25); g.lineTo(hx - 13, hy - 33); g.lineTo(hx + 2, hy - 28); g.quadraticCurveTo(hx + 6, hy - 17, hx + 10, hy - 9); g.closePath(); }, H, hx - 13, hy - 33, 23, 24);
  px(g, hx - 7, hy - 13, 16, 2.5, '#7C3AED'); part(g, () => g.rect(hx, hy - 14, 4, 4), '#FACC15', hx, hy - 14, 4, 4, 0.8);
};
const paintWitch = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose === 'tell' ? 'stand' : F.pose, F.fr), L = B.L;
  const robe = pickOf(F.seed, 5, ROBES), cackle = F.pose === 'tell';
  legs(g, B, { col: '#1A1A1A', stripe: '#8B5CF6', shoe: 'pointy', shoeCol: '#141218' });
  const sl = { sleeve: robe, hand: L.skin };
  arm(g, B, -1, -B.w / 2 - 2, -36, sl);
  // (the robe: to the shins, ragged at the hem)
  const hw = B.hipW / 2 + 7;
  part(g, () => { g.moveTo(-B.w / 2, B.shY + 3); g.quadraticCurveTo(-B.w / 2, B.shY, -B.w / 2 + 4, B.shY); g.lineTo(B.w / 2 - 4, B.shY); g.quadraticCurveTo(B.w / 2, B.shY, B.w / 2, B.shY + 3); g.lineTo(hw, -12); for (let i = 0; i <= 6; i++) g.lineTo(hw - (i * hw * 2) / 6, -12 + (i % 2 ? -5 : 0)); g.closePath(); }, robe, -hw, B.shY, hw * 2, -B.shY - 8);
  px(g, -B.hipW / 2, B.hipY - 1, B.hipW, 2.5, '#5B3A1E');
  part(g, () => g.rect(-1, B.hipY - 2, 4, 4), '#CA8A04', -1, B.hipY - 2, 4, 4, 0.8);
  witchHead(g, B, F, cackle);
  const hand: [number, number] = cackle ? [B.w / 2 - 2, B.shY - 18] : [B.w / 2 + 2, -36];
  arm(g, B, 1, hand[0], hand[1], sl);
  if (cackle) potion(g, hand[0] + 1, hand[1] - 9);
};
export const drawWitchCostume = (c: Ctx, w: Wear) => {
  const F = frameOf(w.seed, w.f, w.pose, w.md, 0, w.woman, 'wk');
  putFrame(c, 'witch', F, [-34, -112, 76, 116], g => paintWitch(g, F));
};
/** The town's witch: the same costume, sat side-saddle on a broom (on a stunt rig), up in the air. */
const paintBroomWitch = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, 'stand', 0), L = B.L;
  const robe = pickOf(F.seed, 5, ROBES), cackle = F.pose === 'tell';
  const bob = F.fr % 2 ? -1 : 0;
  B.hipY = -17 + bob; B.shY = -41 + bob; B.hy = B.shY - 11;
  // (the broom: the handle, the bristles out the back, bound with red cord)
  limb(g, -32, -12, 34, -15, 3.4, '#7C4A1E');
  part(g, () => { g.moveTo(-30, -16); g.lineTo(-52, -25); g.lineTo(-55, -1); g.lineTo(-30, -8); g.closePath(); }, '#C9A23A', -55, -25, 25, 24);
  for (let k = 0; k < 5; k++) px(g, -52 + k, -21 + k * 4, 18, 1, dk('#C9A23A', 0.3));
  part(g, () => g.rect(-32, -17, 4, 10), '#991B1B', -32, -17, 4, 10, 1);
  // (her legs off the near side: thigh along the broom, the shin down, striped; pointy boots)
  for (const s of [0, 1]) {
    const o = s ? 0 : -3, col = s ? '#1A1A1A' : '#121212';
    limb(g, -2 + o, -18 + bob, 9 + o, -17 + bob, B.legW, col);
    limb(g, 9 + o, -17 + bob, 12 + o, -4, B.legW - 0.5, col);
    for (let y = -14; y < -5; y += 3) px(g, 9 + o, y, B.legW - 1, 1.4, s ? '#8B5CF6' : dk('#8B5CF6', 0.14));
    part(g, () => { g.moveTo(9 + o, -5); g.lineTo(18 + o, -5); g.quadraticCurveTo(22 + o, -6, 24 + o, -10); g.quadraticCurveTo(23 + o, -1, 17 + o, -1); g.lineTo(9 + o, -1); g.closePath(); }, '#141218', 9 + o, -10, 15, 9, 1);
  }
  const sl = { sleeve: robe, hand: L.skin };
  arm(g, B, -1, 20, -16, sl);
  part(g, () => { g.moveTo(-B.w / 2, B.shY + 3); g.lineTo(B.w / 2, B.shY + 3); g.lineTo(B.w / 2 + 6, -10); for (let i = 0; i <= 5; i++) g.lineTo(B.w / 2 + 6 - i * (B.w + 12) / 5, -10 + (i % 2 ? -5 : 0)); g.closePath(); }, robe, -B.w / 2 - 6, B.shY, B.w + 12, -B.shY - 8);
  px(g, -B.w / 2 + 1, B.hipY - 3, B.w - 2, 2.5, '#5B3A1E');
  witchHead(g, B, F, cackle);
  const hand: [number, number] = cackle ? [B.w / 2 + 1, B.shY - 14] : [25, -16];
  arm(g, B, 1, hand[0], hand[1], sl);
  if (cackle) potion(g, hand[0] + 1, hand[1] - 9);
};
export const drawBroomWitch = (c: Ctx, w: Wear) => {
  const F = frameOf(w.seed, w.f, w.pose, w.md, 0, w.woman, 'wb');
  F.fr = Math.floor((w.f + w.seed) / 20) % 2;
  putFrame(c, 'witch', F, [-58, -96, 108, 100], g => paintBroomWitch(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The skeleton: a black bodysuit with the bones printed on, a hood, the face painted a skull

const SUIT = '#1E1B24', BONE = '#E9E4D4';
const boneLine = (g: Ctx, x1: number, y1: number, x2: number, y2: number, w = 2.2) => {
  limb(g, x1, y1, x2, y2, w, BONE, false);
  for (const [x, y] of [[x1, y1], [x2, y2]]) px(g, x - 1.5, y - 1, 3, 2, BONE);
};
const paintSkeleton = (g: Ctx, F: Frame, prop: 'tomb' | 'lid', up: boolean) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  legs(g, B, { col: SUIT, shoe: 'boot', shoeCol: '#0E0D12', detail: (gg, h, k, f, near) => { if (near || true) { boneLine(gg, h[0], h[1] + 2, k[0], k[1] - 1, near ? 2.2 : 1.8); boneLine(gg, k[0], k[1] + 2, f[0], f[1] - 3, near ? 2 : 1.6); } } });
  // (the shield down: set aside, behind)
  if (!up && prop === 'tomb') tombstone(g, -B.w / 2 - 34, 0, false);
  const throwing = !up && prop === 'tomb';
  const far: [number, number] = up ? [B.w / 2 + 2, -46] : [-B.w / 2 - 2, -34];
  const near: [number, number] = throwing ? (F.t < 0.5 ? [B.w / 2 - 3, B.shY - 20] : [B.w / 2 + 14, -60]) : up ? [B.w / 2 + 6, -44] : [B.w / 2 + 3, -36];
  const a1 = arm(g, B, -1, far[0], far[1], { sleeve: SUIT, hand: L.skin });
  boneLine(g, a1.sx, a1.sy, a1.ex, a1.ey, 1.6);
  torso(g, B, SUIT);
  // (the print: ribs either side of the breastbone, the spine, the pelvis)
  const cy = B.shY + 5;
  px(g, -0.5, cy, 2, 14, BONE);
  for (let k = 0; k < 4; k++) for (const s of [-1, 1]) { const y = cy + 1 + k * 3.6, wv = B.w / 2 - 4 - k * 0.8; g.strokeStyle = BONE; g.lineWidth = 1.7; g.beginPath(); g.moveTo(0.5, y); g.quadraticCurveTo(s * wv * 0.8 + 0.5, y - 1.5, s * wv + 0.5, y + 1.5); g.stroke(); }
  for (let y = cy + 15; y < B.hipY - 2; y += 2.5) px(g, -0.5, y, 2, 1.6, BONE);
  flat(g, () => { g.moveTo(-6, B.hipY - 3); g.quadraticCurveTo(-7, B.hipY + 3, -2, B.hipY + 2); g.lineTo(0.5, B.hipY - 1); g.lineTo(3, B.hipY + 2); g.quadraticCurveTo(8, B.hipY + 3, 7, B.hipY - 3); g.closePath(); }, BONE, 0);
  // The head: the hood, the skull paint over their face (their own chin and lips below it), their eyes in the sockets
  const { hx, hy } = B;
  part(g, () => g.ellipse(hx - 1, hy, B.rx + 3, B.ry + 2.5, 0, 0, Math.PI * 2), SUIT, hx - B.rx - 4, hy - B.ry - 3, B.rx * 2 + 7, B.ry * 2 + 5);
  headShape(g, B, L.skin, false);
  g.save(); g.beginPath(); g.ellipse(hx, hy, B.rx, B.ry, 0, 0, Math.PI * 2); g.clip();
  part(g, () => g.rect(hx - B.rx, hy - B.ry, B.rx * 2, B.ry + 5), '#EDEAE0', hx - B.rx, hy - B.ry, B.rx * 2, B.ry + 5, 0);
  g.restore();
  for (const ex of [hx - 1, hx + 6]) { flat(g, () => g.ellipse(ex, hy - 1, 3, 3.4, 0, 0, Math.PI * 2), '#121016', 0); if (F.md === 'ok' && !F.blink) { px(g, ex - 1, hy - 2, 2, 2, '#FFFFFF'); px(g, ex, hy - 1.5, 1, 1.5, INK); } }
  flat(g, () => { g.moveTo(hx + 2.5, hy + 2); g.lineTo(hx + 4.5, hy + 2); g.lineTo(hx + 3.5, hy + 4); g.closePath(); }, '#121016', 0);
  const open = F.pose === 'tell' || F.pose === 'strike' || F.md !== 'ok';
  px(g, hx - 1, hy + 5.5, 9, open ? 3 : 1.2, INK);
  for (let k = 0; k < 5; k++) px(g, hx - 1 + k * 2, hy + 4.6, 1, open ? 4.5 : 3, INK);
  const a2 = arm(g, B, 1, near[0], near[1], { sleeve: SUIT, hand: L.skin });
  boneLine(g, a2.sx, a2.sy, a2.ex, a2.ey, 1.6);
  if (throwing && F.t < 0.5) { g.save(); g.translate(near[0], near[1] - 4); g.rotate(-0.4); bone(g); g.restore(); }
  if (up) { if (prop === 'tomb') tombstone(g, B.w / 2 - 2, 0, true); else coffinLid(g, F.pose === 'strike' ? 22 : 13, -68, true); }
  if (!up && prop === 'lid') coffinLid(g, 14, -42, false);
};
/** The foam tombstone (the town skeleton's shield): RIP on it, moss at the foot, cracked. */
const tombstone = (g: Ctx, x: number, y: number, held: boolean) => {
  const w = held ? 34 : 26, h = held ? 66 : 44, top = y - 8 - h;
  const path = () => { g.moveTo(x, y - 6); g.lineTo(x, top + 12); g.quadraticCurveTo(x, top, x + w / 2, top); g.quadraticCurveTo(x + w, top, x + w, top + 12); g.lineTo(x + w, y - 6); g.closePath(); };
  part(g, path, '#8D8C98', x, top, w, h + 2, 1.4);
  g.save(); g.beginPath(); path(); g.clip();
  dither(g, x, y - 16, w, 10, '#4F7A3A');
  px(g, x, y - 9, w, 3, '#4F7A3A');
  g.strokeStyle = '#5E5D68'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + w * 0.7, top + 4); g.lineTo(x + w * 0.6, top + 16); g.lineTo(x + w * 0.75, top + 24); g.stroke();
  g.restore();
  if (held) {
    // R I P, in chisel steps
    const c = '#3F3E48', lx = x + 6, ly = top + 22;
    px(g, lx, ly, 2, 9, c); px(g, lx, ly, 5, 2, c); px(g, lx + 4, ly + 1, 2, 3, c); px(g, lx, ly + 4, 5, 1.5, c); px(g, lx + 3, ly + 5, 2, 4, c);
    px(g, lx + 9, ly, 2, 9, c);
    px(g, lx + 14, ly, 2, 9, c); px(g, lx + 14, ly, 5, 2, c); px(g, lx + 18, ly + 1, 2, 3, c); px(g, lx + 14, ly + 4, 5, 1.5, c);
    px(g, x + 6, top + 38, w - 12, 1, '#6E6D78');
  }
};
/** The coffin lid (the castle skeleton's shield): wood, a brass cross, handles. */
const coffinLid = (g: Ctx, x: number, y: number, up: boolean) => {
  g.save(); g.translate(x, y); if (!up) g.rotate(0.5);
  const path = () => { g.moveTo(1, 0); g.lineTo(11, 0); g.lineTo(15, 18); g.lineTo(11, 64); g.lineTo(1, 64); g.lineTo(-3, 18); g.closePath(); };
  part(g, path, '#7C4A2D', -3, 0, 18, 64, 1.4);
  g.save(); g.beginPath(); path(); g.clip();
  for (const gx of [2, 7, 11]) px(g, gx, 4, 1, 56, dk('#7C4A2D', 0.2));
  g.restore();
  part(g, () => { g.rect(4.5, 10, 3, 20); g.rect(1, 15, 10, 3); }, '#D4A72C', 1, 10, 10, 20, 0.8);
  for (const hy of [36, 50]) part(g, () => g.rect(12, hy, 3, 5), '#A1A1AA', 12, hy, 3, 5, 0.8);
  g.restore();
};
export const drawSkeletonCostume = (c: Ctx, w: Wear, prop: 'tomb' | 'lid', up: boolean) => {
  const F = frameOf(w.seed, w.f, w.pose, w.md, w.t, w.woman, `${prop}${up ? 1 : 0}`);
  putFrame(c, 'skel', F, [-70, -110, 140, 114], g => paintSkeleton(g, F, prop, up));
};

// ---------------------------------------------------------------------------------------------------------------
// The pumpkin-head: a big foam jack-o'-lantern (their face looking out of its mouth), a plaid shirt, overalls

const PLAIDS = ['#8C2D19', '#2E5E2A', '#283E7A', '#6B5B2A'];
const pumpkin = (g: Ctx, x: number, y: number, rx: number, ry: number) => {
  const O = '#E2701C';
  part(g, () => g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2), O, x - rx, y - ry, rx * 2, ry * 2, 1.4);
  g.save(); g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.clip();
  g.strokeStyle = dk(O, 0.28); g.lineWidth = 1.2;
  for (const k of [-0.55, 0, 0.55]) { g.beginPath(); g.ellipse(x + k * rx * 0.6, y, rx * (0.35 + Math.abs(k) * 0.4), ry, 0, -Math.PI / 2, Math.PI / 2); g.stroke(); }
  g.restore();
  part(g, () => g.roundRect(x - 2, y - ry - 6, 4, 8, 1), '#4D5A26', x - 2, y - ry - 6, 4, 8, 1);
};
const paintPumpkin = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose === 'tell' ? 'tell' : F.pose, F.fr), L = B.L;
  const shirt = pickOf(F.seed, 6, PLAIDS), denim = '#2F4F8F';
  legs(g, B, { col: denim, shoe: 'boot', shoeCol: '#4A3020' });
  const heave = F.pose === 'tell';
  const far: [number, number] = heave ? [B.hx - 12, -106] : [-B.w / 2 - 3, -33];
  const near: [number, number] = heave ? [B.hx + 14, -106] : [B.w / 2 + 3, -33];
  const sl = { sleeve: shirt, hand: L.skin };
  arm(g, B, -1, far[0], far[1], sl);
  const tp = torso(g, B, shirt);
  g.save(); g.beginPath(); tp(); g.clip();
  for (let x = -B.w; x < B.w; x += 5) px(g, x, B.shY, 1.4, 40, dk(shirt, 0.3));
  for (let y = B.shY + 2; y < B.hipY + 2; y += 5) px(g, -B.w, y, B.w * 2, 1.4, dk(shirt, 0.3));
  g.restore();
  part(g, () => g.rect(-B.w / 2 + 3, B.shY + 10, B.w - 6, B.hipY - B.shY - 6), denim, -B.w / 2 + 3, B.shY + 10, B.w - 6, 20, 1);
  for (const s of [-1, 1]) { px(g, s * (B.w / 2 - 5) - 1.5, B.shY, 3, 11, denim); ball(g, s * (B.w / 2 - 5), B.shY + 11, 1.3, '#D4A72C', 0.6); }
  part(g, () => g.rect(-3, B.shY + 14, 6, 5), dk(denim, 0.1), -3, B.shY + 14, 6, 5, 0.8);
  // (straw at the collar)
  for (let k = 0; k < 5; k++) flat(g, () => { const x = -6 + k * 3; g.moveTo(x, B.shY + 1); g.lineTo(x + 1 + (k % 2 ? 2 : -2), B.shY - 4); g.lineTo(x + 2, B.shY + 1); g.closePath(); }, '#E8C547', 0.6);
  // The head: the foam pumpkin, triangle eyes, their face in its mouth
  const x = 1, y = B.shY - 13;
  pumpkin(g, x, y, 17, 15);
  for (const ex of [x - 7, x + 6]) flat(g, () => { g.moveTo(ex - 4, y - 3); g.lineTo(ex + 4, y - 3); g.lineTo(ex + (ex > x ? 1 : -1), y - 10); g.closePath(); }, '#24120A', 1);
  const mpath = () => { g.moveTo(x - 10, y + 1); g.lineTo(x + 10, y + 1); g.lineTo(x + 8, y + 10); g.lineTo(x + 4, y + 8); g.lineTo(x + 1, y + 11); g.lineTo(x - 3, y + 8); g.lineTo(x - 8, y + 10); g.closePath(); };
  flat(g, mpath, '#24120A', 1.2);
  g.save(); g.beginPath(); mpath(); g.clip();
  part(g, () => g.ellipse(x, y + 7, 8, 7, 0, 0, Math.PI * 2), L.skin, x - 8, y, 16, 14, 0);
  if (F.md === 'ok' && !F.blink) { for (const ex of [x - 3, x + 3]) { px(g, ex - 1, y + 3, 2.4, 2.4, '#FFFFFF'); px(g, ex, y + 3.5, 1.2, 1.6, INK); } }
  else for (const ex of [x - 3, x + 3]) px(g, ex - 1, y + 4, 3, 1, INK);
  g.restore();
  if (heave) pumpkin(g, x + 1, -112, 14, 11);
  arm(g, B, 1, near[0], near[1], sl);
};
export const drawPumpkinCostume = (c: Ctx, w: Wear) => {
  const F = frameOf(w.seed, w.f, w.pose, w.md, 0, w.woman, 'p');
  putFrame(c, 'pumpkin', F, [-36, -132, 76, 136], g => paintPumpkin(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The knight: tin-foil armor, a red tabard, a bucket for a helm with spikes welded on top, a sword that is not plastic

const FOIL = '#B4B9C4';
const crinkle = (g: Ctx, x: number, y: number, w: number, h: number, seed: number) => {
  for (let i = 0; i < (w * h) / 22; i++) {
    const s = Math.sin(seed * 12.9 + i * 78.2) * 43758.5, k = s - Math.floor(s), s2 = Math.sin(seed * 3.1 + i * 19.7) * 1e4, k2 = s2 - Math.floor(s2);
    px(g, x + k * w, y + k2 * h, 1, 1, i % 3 ? '#F1F5F9' : dk(FOIL, 0.3));
  }
};
const paintKnight = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  legs(g, B, { col: FOIL, shoe: 'boot', shoeCol: '#6B7280', detail: (gg, _h, k) => ball(gg, k[0], k[1], 3, FOIL, 1) });
  const wind = F.pose === 'tell', swing = F.pose === 'strike';
  const near: [number, number] = wind ? [B.w / 2 - 4, B.shY - 14] : swing ? [B.w / 2 + 14, -48] : [B.w / 2 + 3, -38];
  const far: [number, number] = wind ? [B.w / 2 - 8, B.shY - 10] : swing ? [B.w / 2 + 8, -47] : [-B.w / 2 - 2, -34];
  const ar = { sleeve: FOIL, hand: L.skin };
  arm(g, B, -1, far[0], far[1], ar);
  const tp = torso(g, B, FOIL);
  g.save(); g.beginPath(); tp(); g.clip(); crinkle(g, -B.w / 2, B.shY, B.w, 26, F.seed); g.restore();
  // (the tabard, the emblem, the belt)
  part(g, () => g.rect(-7 + B.lean, B.shY + 3, 14, B.hipY - B.shY + 6), '#9F1D1D', -7, B.shY + 3, 14, 30, 1);
  flat(g, () => { const cx = B.lean, cy = B.shY + 12; g.moveTo(cx, cy - 5); g.lineTo(cx + 4, cy); g.lineTo(cx, cy + 5); g.lineTo(cx - 4, cy); g.closePath(); }, '#FACC15', 0.8);
  px(g, -B.hipW / 2, B.hipY - 2, B.hipW, 2.5, '#5B3A1E');
  for (const s of [-1, 1]) ball(g, s * (B.w / 2 - 2) + B.lean, B.shY + 3, 4.5, FOIL, 1);
  // The bucket helm: its rim, rivets, the slit (their eyes in it), the bail, the spikes up top
  const { hx, hy } = B;
  if (L.long && !L.bald) part(g, () => g.rect(hx - 11, hy + 4, 5, 12), L.hair, hx - 11, hy + 4, 5, 12, 1);
  const helm = () => { g.moveTo(hx - 9, hy - 11); g.lineTo(hx + 10, hy - 11); g.lineTo(hx + 12, hy + 10); g.lineTo(hx - 11, hy + 10); g.closePath(); };
  part(g, helm, '#9CA3AF', hx - 11, hy - 11, 23, 21, 1.3);
  px(g, hx - 11, hy + 6, 23, 2, dk('#9CA3AF', 0.25));
  for (const rx of [hx - 7, hx + 9]) ball(g, rx, hy - 7, 1, '#D4D4D8', 0.5);
  flat(g, () => g.rect(hx - 1, hy - 3, 12, 3.4), '#0E0D12', 1);
  if (F.md === 'ok' && !F.blink) { px(g, hx + 2, hy - 2, 2, 1.6, '#F5F5F4'); px(g, hx + 7, hy - 2, 2, 1.6, '#F5F5F4'); px(g, hx + 3, hy - 2, 1, 1.6, INK); px(g, hx + 8, hy - 2, 1, 1.6, INK); }
  for (let k = 0; k < 3; k++) px(g, hx + 5 + k * 2.2, hy + 3, 1, 1, '#0E0D12');
  g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.arc(hx - 10, hy - 2, 4, Math.PI * 0.5, Math.PI * 1.5); g.stroke();
  for (const [sx, sh] of [[-6, 11], [1, 15], [8, 11]] as const) {
    part(g, () => { g.moveTo(hx + sx - 3, hy - 10); g.lineTo(hx + sx, hy - 10 - sh); g.lineTo(hx + sx + 3, hy - 10); g.closePath(); }, '#CBD5E1', hx + sx - 3, hy - 10 - sh, 6, sh, 1);
    px(g, hx + sx - 1, hy - 7 - sh, 1, sh - 5, '#FFFFFF');
  }
  // (the sword: shouldered walking; raised back winding up; out level swinging)
  const a = wind ? -2.3 : swing ? 0.05 : -1.15;
  g.save(); g.translate(near[0], near[1]); g.rotate(a);
  part(g, () => { g.moveTo(4, -2); g.lineTo(42, -2); g.lineTo(47, 0); g.lineTo(42, 2); g.lineTo(4, 2); g.closePath(); }, '#D4D8DE', 4, -2, 43, 4, 1);
  px(g, 6, -1, 34, 0.8, '#FFFFFF'); px(g, 6, 0.6, 34, 0.6, '#8E96A3');
  part(g, () => g.rect(2, -6, 3, 12), '#C99A2E', 2, -6, 3, 12, 1);
  part(g, () => g.rect(-7, -1.5, 9, 3), '#5B3A1E', -7, -1.5, 9, 3, 1);
  ball(g, -8, 0, 2, '#C99A2E', 0.8);
  g.restore();
  arm(g, B, 1, near[0], near[1], ar);
};
export const drawKnightCostume = (c: Ctx, w: Wear) => {
  const F = frameOf(w.seed, w.f, w.pose, w.md, 0, w.woman, 'k');
  putFrame(c, 'knight', F, [-56, -112, 132, 116], g => paintKnight(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The igor: a burlap robe and hood, a foam hump, one big rubber eye, sandals; a roasting fork (the castle's kitchen,
// with a chef's hat on over the hood) or a pitchfork (the tower's)

const BURLAP = ['#7A5A36', '#6B5B45', '#6E4F2E'];
const paintIgor = (g: Ctx, F: Frame, kit: 'chef' | 'farm') => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const robe = pickOf(F.seed, 2, BURLAP);
  B.lean = 6; B.hx = 9; B.hy = B.shY - 3;
  legs(g, B, { col: robe, shoe: 'sandal', shoeCol: '#5B3A1E', bareBelow: true });
  const wind = F.pose === 'tell', thrust = F.pose === 'strike';
  const out = thrust ? 18 : wind ? -14 : 0;
  const far: [number, number] = [B.w / 2 - 2 + out, -36], near: [number, number] = [B.w / 2 + 8 + out, -38];
  const sl = { sleeve: robe, hand: L.skin, len: 0.8 };
  arm(g, B, -1, far[0], far[1], sl);
  // (the robe to the knees, its ragged hem; the rope belt; the hump)
  const hw = B.hipW / 2 + 4;
  part(g, () => { g.moveTo(-B.w / 2 + B.lean, B.shY + 3); g.lineTo(B.w / 2 + B.lean, B.shY + 2); g.lineTo(hw + 2, -15); for (let i = 0; i <= 5; i++) g.lineTo(hw + 2 - i * (hw * 2 + 2) / 5, -15 + (i % 2 ? -3 : 1)); g.closePath(); }, robe, -hw, B.shY, hw * 2 + 8, -B.shY - 13);
  part(g, () => g.ellipse(-B.w / 2 + 3, B.shY + 4, 10, 9, -0.3, 0, Math.PI * 2), robe, -B.w / 2 - 7, B.shY - 5, 20, 18);
  g.save(); g.beginPath(); g.ellipse(-B.w / 2 + 3, B.shY + 4, 10, 9, -0.3, 0, Math.PI * 2); g.clip(); dither(g, -B.w / 2 - 7, B.shY - 5, 20, 18, dk(robe, 0.18)); g.restore();
  px(g, -B.hipW / 2 - 1, B.hipY - 3, B.hipW + 4, 2.5, '#D6C08A'); limb(g, 3, B.hipY - 2, 4, B.hipY + 8, 1.6, '#D6C08A');
  // The head, low and forward in the hood: their face, a big rubber eye, a unibrow, bad teeth
  const { hx, hy } = B;
  part(g, () => g.ellipse(hx - 2, hy - 1, B.rx + 3, B.ry + 3, 0, 0, Math.PI * 2), robe, hx - B.rx - 5, hy - B.ry - 4, B.rx * 2 + 6, B.ry * 2 + 6);
  headShape(g, B, L.skin, false);
  faceOn(g, B, { skin: L.skin, eyes: wind || thrust ? 'angry' : 'tired', mouth: 'teeth', md: F.md, blink: F.blink, skipEyes: true });
  if (F.md === 'ok' && !F.blink) {
    ball(g, hx + 6.5, hy - 1, 3.6, '#FAFAFA', 1); ball(g, hx + 7.5 + (wind ? -1 : 0.5), hy - 0.5, 1.2, INK, 0);
    ball(g, hx - 1, hy - 0.5, 1.8, '#FAFAFA', 0.8); px(g, hx - 0.5, hy - 1, 1, 1.4, INK);
  } else { px(g, hx + 4, hy - 1, 5, 1, INK); px(g, hx - 2.5, hy - 1, 3, 1, INK); }
  px(g, hx - 3, hy - 5.5, 12, 1.6, L.bald ? '#3F3F46' : L.hair);
  if (!L.bald) for (let k = 0; k < 3; k++) px(g, hx - 6 + k * 2.5, hy - 9, 1.5, 4, L.hair);
  whiskers(g, B);
  part(g, () => { g.moveTo(hx - B.rx - 3, hy + 6); g.quadraticCurveTo(hx - B.rx - 4, hy - B.ry - 4, hx + 1, hy - B.ry - 3); g.quadraticCurveTo(hx + B.rx + 3, hy - B.ry - 2, hx + B.rx + 2, hy - 4); g.quadraticCurveTo(hx + 2, hy - B.ry, hx - 4, hy - 4); g.quadraticCurveTo(hx - 7, hy + 2, hx - B.rx - 3, hy + 6); g.closePath(); }, robe, hx - B.rx - 4, hy - B.ry - 4, B.rx * 2 + 7, B.ry + 10);
  if (kit === 'chef') {
    part(g, () => g.rect(hx - 7, hy - B.ry - 4, 15, 4), '#E2E8F0', hx - 7, hy - B.ry - 4, 15, 4, 1);
    partTop(g, () => { g.moveTo(hx - 7, hy - B.ry - 4); g.quadraticCurveTo(hx - 13, hy - B.ry - 14, hx - 3, hy - B.ry - 16); g.quadraticCurveTo(hx + 1, hy - B.ry - 22, hx + 6, hy - B.ry - 15); g.quadraticCurveTo(hx + 14, hy - B.ry - 13, hx + 8, hy - B.ry - 4); g.closePath(); }, '#F8FAFC', hx - 13, hy - B.ry - 22, 27, 18);
  }
  // (the fork: drawn back for the windup, a glint on it; jabbed out for the thrust)
  if (kit === 'farm') pitchfork(g, near[0] - 2, near[1] + 1, 0, '#8A5A2B', 58, 3);
  else {
    g.save(); g.translate(near[0] - 2, near[1] + 1);
    limb(g, -14, 0, 18, 0, 3, '#7C4A1E');
    part(g, () => g.rect(17, -4, 3, 8), '#6B7280', 17, -4, 3, 8, 1);
    for (const ty of [-3.5, 2.5]) { flat(g, () => { g.moveTo(19, ty - 0.8); g.lineTo(34, ty - 0.4); g.lineTo(38, ty + 0.2); g.lineTo(34, ty + 1); g.lineTo(19, ty + 1); g.closePath(); }, '#D4D4D8', 0.9); px(g, 22, ty - 0.5, 10, 0.6, '#FFFFFF'); }
    g.restore();
  }
  if (wind) { const gx = near[0] + (kit === 'farm' ? 50 : 34), gy = near[1] - 3; px(g, gx, gy - 3, 1, 7, '#FFFBEB'); px(g, gx - 3, gy, 7, 1, '#FFFBEB'); }
  arm(g, B, 1, near[0], near[1], sl);
};
export const drawIgorCostume = (c: Ctx, w: Wear, kit: 'chef' | 'farm') => {
  const F = frameOf(w.seed, w.f, w.pose, w.md, 0, w.woman, kit);
  putFrame(c, 'igor', F, [-40, -110, 140, 114], g => paintIgor(g, F, kit));
};

// ---------------------------------------------------------------------------------------------------------------
// The bride: a gown gone gray (tattered at the hem), a long black wig, a veil, pale makeup, plastic fangs

const GOWNS = ['#D8D2DA', '#CFCAC0', '#D3D6DA'];
const paintBride = (g: Ctx, F: Frame, kit: 'rush' | 'toss') => {
  const B = bodyOf(F.seed, F.pose, F.fr, F.woman), L = B.L;
  const gown = pickOf(F.seed, 3, GOWNS), pale = mix(L.skin, '#F2EEF2', 0.55);
  const rush = kit === 'rush' && F.pose === 'strike', hiss = kit === 'rush' && F.pose === 'tell', toss = kit === 'toss' && F.pose === 'tell';
  if (rush) { g.translate(0, -2); g.rotate(0.2); g.translate(0, 2); }
  // (the shoes peeking out under the hem)
  for (const s of [0, 1]) part(g, () => { const x = (s ? 3 : -3) + B.feet[s] * 0.7; g.moveTo(x - 3, 0); g.lineTo(x - 3, -4); g.lineTo(x + 7, -3); g.quadraticCurveTo(x + 9, -1, x + 7, 0); g.closePath(); }, s ? '#18181B' : '#0E0E10', -8, -4, 18, 4, 1);
  // (the veil, behind: down the back to the hips, stippled)
  const { hx, hy } = B;
  g.save(); g.beginPath(); g.moveTo(hx - 4, hy - 10); g.quadraticCurveTo(hx - 16, hy + 6, hx - 18 - (rush ? 6 : 0), B.hipY + 4); g.lineTo(hx - 6, B.hipY); g.lineTo(hx - 2, hy - 8); g.closePath(); g.clip();
  dither(g, hx - 26, hy - 12, 26, 50, '#F1EEF4'); dither(g, hx - 26, hy - 12, 26, 50, '#B8B2C0', 1);
  g.restore();
  // (the wig: long, black, down past the shoulders)
  part(g, () => { g.moveTo(hx - 7, hy - 9); g.quadraticCurveTo(hx - 15, hy, hx - 13, B.shY + 18); g.lineTo(hx - 3, B.shY + 14); g.quadraticCurveTo(hx - 6, hy + 4, hx - 1, hy - 4); g.closePath(); }, '#16121C', hx - 15, hy - 9, 14, 40, 1);
  const sl = { sleeve: gown, hand: L.skin };
  const far: [number, number] = rush ? [B.w / 2 + 12, -52] : hiss ? [-B.w / 2 - 9, B.shY - 6] : [-B.w / 2 - 1, -36];
  const near: [number, number] = rush ? [B.w / 2 + 17, -48] : hiss ? [B.w / 2 + 10, B.shY - 8] : toss ? (F.t < 0.75 ? [-4, B.shY - 22] : [B.w / 2 + 10, B.shY - 14]) : kit === 'toss' ? [B.w / 2 + 6, -42] : [B.w / 2 + 2, -35];
  arm(g, B, -1, far[0], far[1], sl);
  // (the skirt, a bell to the floor, its hem in tatters; grime at the hem)
  const hw = B.hipW / 2 + 12, sway = [0, 1, 0, -1, 0, 1][F.fr];
  const skirt = () => { g.moveTo(-B.hipW / 2 - 1, B.hipY - 2); g.lineTo(B.hipW / 2 + 1, B.hipY - 2); g.lineTo(hw + sway, -2); for (let i = 0; i <= 8; i++) g.lineTo(hw + sway - (i * (hw * 2)) / 8, (i % 2 ? -5 : 0)); g.closePath(); };
  part(g, skirt, gown, -hw, B.hipY - 2, hw * 2 + 2, -B.hipY + 2, 1.3);
  g.save(); g.beginPath(); skirt(); g.clip();
  for (const fx of [-hw * 0.5, 0, hw * 0.5]) px(g, fx, B.hipY + 4, 1, -B.hipY, dk(gown, 0.2));
  dither(g, -hw, -9, hw * 2 + 2, 9, dk(gown, 0.3));
  g.restore();
  torso(g, B, gown, B.shY, B.hipY);
  dither(g, -B.w / 2 + 3, B.shY + 1, B.w - 6, 3, '#FFFFFF');
  px(g, -B.hipW / 2, B.hipY - 3, B.hipW, 2.5, '#6B1F3A');
  // The head: the makeup (pale, dark round the eyes, dark lips), the fangs
  headShape(g, B, pale);
  faceOn(g, B, { skin: pale, eyes: rush || hiss ? 'angry' : 'open', mouth: rush || hiss ? 'teeth' : 'flat', md: F.md, blink: F.blink, brows: L.hair });
  px(g, hx + 0.5, hy + 1.6, 3, 1, '#7E5A8E'); px(g, hx + 4.5, hy + 1.6, 3, 1, '#7E5A8E');
  px(g, hx + 2, hy + 5.4, 5, 1.6, '#4C0519');
  px(g, hx + 2.5, hy + 7, 1, 2, '#FFFFFF'); px(g, hx + 5.5, hy + 7, 1, 2, '#FFFFFF');
  whiskers(g, B);
  part(g, () => { g.moveTo(hx - 9, hy - 1); g.quadraticCurveTo(hx - 8, hy - 12, hx + 1, hy - 11.5); g.quadraticCurveTo(hx + 9.5, hy - 11, hx + 9.5, hy - 3); g.quadraticCurveTo(hx + 3, hy - 8, hx - 5, hy + 2); g.closePath(); }, '#16121C', hx - 9, hy - 12, 19, 14, 1);
  // (the comb that holds the veil: white flowers)
  for (const [x, y] of [[hx - 5, hy - 10], [hx - 1, hy - 12], [hx - 8, hy - 7]] as const) ball(g, x, y, 1.8, '#F5F5F4', 0.7);
  if (toss) { g.save(); g.translate(near[0], near[1] - 2); g.rotate(-0.5 + F.t); bouquet(g); g.restore(); }
  else if (kit === 'toss') { g.save(); g.translate(near[0] + 2, near[1] - 3); g.rotate(0.3); bouquet(g); g.restore(); }
  arm(g, B, 1, near[0], near[1], sl);
  if (rush || hiss) for (const [x, y] of [far, near]) for (let k = -1; k <= 1; k++) px(g, x + 2, y + k * 2 - 0.5, 3, 1, '#4C0519');
};
export const drawBrideCostume = (c: Ctx, w: Wear, kit: 'rush' | 'toss') => {
  const F = frameOf(w.seed, w.f, w.pose, w.md, w.t, w.woman, kit);
  putFrame(c, 'bride', F, [-44, -104, 104, 108], g => paintBride(g, F, kit));
};

// ---------------------------------------------------------------------------------------------------------------
// The bat suit: rubber, a hood with round floppy ears, wings on the arms, a harness on a stunt rig

const RUBBER = '#2E2638';
const paintBatsuit = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, 'stand', 0), L = B.L;
  const dive = F.pose === 'strike';
  B.feet = [-3, 2]; B.lift = [2, 0];
  legs(g, B, { col: RUBBER, shoe: 'boot', shoeCol: '#18141E' });
  const flap = dive ? 0 : [-12, -4, 6, -4][F.fr];
  // (the wings: membrane from the arm out to the hand and back to the body, scalloped, the struts)
  for (const s of [-1, 1] as const) {
    const sx = s * (B.w / 2 - 3), sy = B.shY + 3;
    const tipX = dive ? s * 22 - 14 : s * 44, tipY = dive ? B.shY - 18 : B.shY - 6 + flap;
    const elx = dive ? s * 14 - 8 : s * 24, ely = dive ? B.shY - 8 : B.shY - 4 + flap * 0.5;
    const col = s < 0 ? dk(RUBBER, 0.15) : RUBBER;
    const wing = () => { g.moveTo(sx, sy); g.lineTo(elx, ely); g.lineTo(tipX, tipY); g.quadraticCurveTo(tipX - s * 2, tipY + 12, tipX - s * 8, tipY + 16); g.quadraticCurveTo(tipX - s * 12, tipY + 12, tipX - s * 16, tipY + 20); g.quadraticCurveTo(elx - s * 6, B.hipY - 4, s * (B.w / 2 - 6), B.hipY - 2); g.closePath(); };
    part(g, wing, col, Math.min(sx, tipX) - 2, Math.min(tipY, ely) - 2, Math.abs(tipX - sx) + 4, B.hipY - Math.min(tipY, ely) + 4, 1.2);
    g.strokeStyle = dk(col, 0.4); g.lineWidth = 1; g.beginPath(); g.moveTo(elx, ely); g.lineTo(tipX - s * 8, tipY + 16); g.moveTo(elx, ely); g.lineTo(tipX - s * 16, tipY + 20); g.stroke();
    limb(g, sx, sy, elx, ely, B.armW, col); limb(g, elx, ely, tipX, tipY, B.armW - 1, col);
    ball(g, tipX, tipY, 2.6, L.skin, 1);
  }
  torso(g, B, RUBBER);
  part(g, () => g.ellipse(2, (B.shY + B.hipY) / 2 + 2, B.w / 2 - 4, 9, 0, 0, Math.PI * 2), '#4A3B56', 2 - B.w / 2, B.shY, B.w, 24, 0);
  // (the harness: a strap across, a steel ring at the back for the wire)
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(-B.w / 2, B.shY + 3); g.lineTo(B.w / 2, B.hipY - 3); g.stroke();
  g.strokeStyle = '#A16207'; g.lineWidth = 1.6; g.stroke();
  part(g, () => g.rect(-3, B.shY - 2, 6, 5), '#71717A', -3, B.shY - 2, 6, 5, 1);
  // The head: the hood, round ears, their face in the opening, plastic fangs
  const { hx, hy } = B;
  for (const s of [-1, 1]) { part(g, () => g.ellipse(hx + s * 8, hy - 11, 5.5, 6.5, s * 0.5, 0, Math.PI * 2), RUBBER, hx + s * 8 - 6, hy - 18, 12, 14, 1.2); flat(g, () => g.ellipse(hx + s * 8, hy - 11, 2.5, 3.5, s * 0.5, 0, Math.PI * 2), '#9F7A8A', 0); }
  part(g, () => g.ellipse(hx - 1, hy, B.rx + 2.5, B.ry + 2, 0, 0, Math.PI * 2), RUBBER, hx - B.rx - 4, hy - B.ry - 2, B.rx * 2 + 5, B.ry * 2 + 4);
  part(g, () => g.ellipse(hx + 2, hy + 1, B.rx - 1.5, B.ry - 2, 0, 0, Math.PI * 2), L.skin, hx - B.rx + 3, hy - B.ry + 3, B.rx * 2 - 3, B.ry * 2 - 4, 1);
  B.hx = hx + 0.5;
  faceOn(g, B, { skin: L.skin, eyes: 'angry', mouth: dive ? 'teeth' : 'grin', md: F.md, blink: F.blink });
  px(g, B.hx + 2.5, hy + 7, 1, 2, '#FFFFFF'); px(g, B.hx + 5.5, hy + 7, 1, 2, '#FFFFFF');
  whiskers(g, B);
};
export const drawBatsuitCostume = (c: Ctx, w: Wear) => {
  const F = frameOf(w.seed, w.f, w.pose === 'strike' ? 'strike' : 'fly', w.md, 0, w.woman, 'b');
  putFrame(c, 'batsuit', F, [-56, -96, 112, 100], g => paintBatsuit(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The mummy: a big one, wrapped in toilet paper (a lot of it), their eyes through the slit, a loose end trailing

const TP = '#ECE8DC';
const wraps = (g: Ctx, x: number, y: number, w: number, h: number, seed: number) => {
  for (let k = 0, yy = y; yy < y + h; k++, yy += 4.5) {
    const tilt = (k + seed) % 2 ? 2 : -2;
    g.strokeStyle = dk(TP, 0.26); g.lineWidth = 1; g.beginPath(); g.moveTo(x, yy); g.lineTo(x + w, yy + tilt); g.stroke();
    g.strokeStyle = '#FFFFFF'; g.beginPath(); g.moveTo(x, yy + 1.2); g.lineTo(x + w * 0.4, yy + 1.2 + tilt * 0.4); g.stroke();
  }
};
const paintMummy = (g: Ctx, F: Frame, scale: number) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  g.scale(scale, scale);
  B.w = 30; B.hipW = 29; B.legW = 9; B.armW = 7.5; B.rx = 9.4;
  legs(g, B, { col: TP, shoe: 'boot', shoeCol: TP, detail: (gg, h, k, f) => { gg.save(); gg.strokeStyle = dk(TP, 0.26); gg.lineWidth = 1; for (let t = 0.15; t < 1; t += 0.22) { const x = h[0] + (f[0] - h[0]) * t, y = h[1] + (f[1] - h[1]) * t; gg.beginPath(); gg.moveTo(x - 4, y - 1); gg.lineTo(x + 4, y + 1); gg.stroke(); } void k; gg.restore(); } });
  const up = F.pose === 'tell', down = F.pose === 'strike';
  const far: [number, number] = up ? [-4, B.shY - 30] : down ? [B.w / 2 + 16, -30] : [B.w / 2 + 14, -50];
  const near: [number, number] = up ? [8, B.shY - 32] : down ? [B.w / 2 + 24, -26] : [B.w / 2 + 20, -46];
  const sl = { sleeve: TP, hand: TP, w: B.armW };
  const a1 = arm(g, B, -1, far[0], far[1], { ...sl, sleeve: dk(TP, 0.1), hand: dk(TP, 0.1) });
  void a1;
  const tp = torso(g, B, TP);
  g.save(); g.beginPath(); tp(); g.clip(); wraps(g, -B.w, B.shY + 2, B.w * 2, 30, F.seed); g.restore();
  // (the loose end, trailing from the hip)
  const sw = [0, 2, 3, 2, 0, -1][F.fr];
  part(g, () => { g.moveTo(-B.hipW / 2, B.hipY - 6); g.quadraticCurveTo(-B.hipW / 2 - 8 - sw, B.hipY + 6, -B.hipW / 2 - 6 - sw, -6); g.lineTo(-B.hipW / 2 - 1 - sw, -8); g.quadraticCurveTo(-B.hipW / 2 - 3, B.hipY + 6, -B.hipW / 2 + 4, B.hipY - 4); g.closePath(); }, TP, -B.hipW / 2 - 10, B.hipY - 6, 14, 30, 1);
  // The head: wrapped; the slit, their skin and eyes in it; a tuft of their hair out the top
  const { hx, hy } = B;
  if (!L.bald) part(g, () => { g.moveTo(hx - 5, hy - B.ry + 3); g.lineTo(hx - 6, hy - B.ry - 2); g.lineTo(hx - 3, hy - B.ry); g.lineTo(hx - 1, hy - B.ry - 3); g.lineTo(hx + 1, hy - B.ry + 3); g.closePath(); }, L.hair, hx - 6, hy - B.ry - 3, 7, 6, 1);
  headShape(g, B, TP, false);
  g.save(); g.beginPath(); g.ellipse(hx, hy, B.rx, B.ry, 0, 0, Math.PI * 2); g.clip(); wraps(g, hx - B.rx, hy - B.ry + 1, B.rx * 2, B.ry * 2, F.seed + 1); g.restore();
  flat(g, () => g.rect(hx - 3, hy - 4, 13, 5), L.skin, 1);
  if (F.md === 'ok' && !F.blink) for (const ex of [hx + 0.5, hx + 6]) { px(g, ex - 1, hy - 3, 3, 3, '#FFFFFF'); px(g, ex + (up ? 0 : 0.5), hy - 2.5, 1.4, 2, INK); }
  else for (const ex of [hx + 0.5, hx + 6]) px(g, ex - 1.5, hy - 2, 3.5, 1, INK);
  if (up || down || F.md !== 'ok') { flat(g, () => g.ellipse(hx + 5, hy + 6, 2.5, 2, 0, 0, Math.PI * 2), '#3B1414', 1); }
  arm(g, B, 1, near[0], near[1], sl);
};
export const drawMummyCostume = (c: Ctx, w: Wear, scale: number) => {
  const F = frameOf(w.seed, w.f, w.pose, w.md, 0, w.woman, `s${scale}`);
  putFrame(c, 'mummy', F, [-48 * scale, -112 * scale, 110 * scale, 116 * scale], g => paintMummy(g, F, scale));
};

// ---------------------------------------------------------------------------------------------------------------
// LIL' LUCIFER, the gift shop's mascot: a fat red foam devil (a person sweating in it, their face in the mouth hole)

const paintMascot = (g: Ctx, F: Frame) => {
  const L = bodyOf(F.seed, 'stand', 0).L;
  const wind = F.pose === 'tell', bump = F.pose === 'strike';
  const step = F.pose === 'walk' ? [3, 2, 0, -3, -2, 0][F.fr] : 0;
  const R = '#D7262B';
  for (const s of [-1, 1]) { const x = s * 11 + s * step; part(g, () => g.rect(x - 6, -18, 12, 13), dk(R, 0.08), x - 6, -18, 12, 13, 1.2); part(g, () => g.roundRect(x - 8, -6, 18, 6, [3, 4, 1, 1]), '#1E1B22', x - 8, -6, 18, 6, 1.2); }
  g.rotate(bump ? 0.25 : wind ? -0.15 : 0);
  // (the tail)
  limb(g, -24, -30, -36, -36, 3, R); limb(g, -36, -36, -38, -46, 3, R);
  flat(g, () => { g.moveTo(-38, -46); g.lineTo(-45, -55); g.lineTo(-33, -51); g.closePath(); }, R, 1);
  // (the arms: up for the windup, out for the bump)
  const ay = wind ? -74 : bump ? -44 : -34, ax = wind ? 20 : bump ? 34 : 28;
  limb(g, -22, -50, -ax, ay, 8, dk(R, 0.12)); ball(g, -ax, ay, 5, '#1E1B22', 1);
  part(g, () => g.ellipse(0, -40, 29, 25, 0, 0, Math.PI * 2), R, -29, -65, 58, 50, 1.6);
  part(g, () => g.ellipse(6, -36, 14, 14, 0, 0, Math.PI * 2), '#F4A0A0', -8, -50, 28, 28, 1);
  // (sweat patches, darker: it's hot in there)
  dither(g, -18, -50, 8, 8, dk(R, 0.25));
  // The foam head (wobbling), felt horns, googly eyes, the face in the mouth hole
  g.save(); g.translate(2, -72); g.rotate(wind ? [-0.15, 0.15][F.fr % 2] : 0);
  for (const hx of [-10, 10]) part(g, () => { g.moveTo(hx - 5, -11); g.lineTo(hx + (hx < 0 ? -4 : 4), -24); g.lineTo(hx + 5, -11); g.closePath(); }, '#F2D27A', hx - 5, -24, 10, 13, 1);
  part(g, () => g.ellipse(0, 0, 18, 16, 0, 0, Math.PI * 2), '#E8343A', -18, -16, 36, 32, 1.6);
  for (const [ex, k] of [[-6, 0], [8, 1]] as const) { ball(g, ex, -5, 5, '#FFFFFF', 1); const a = F.fr * 1.3 + k * 2; ball(g, ex + Math.sin(a) * 2.2, -5 + Math.cos(a) * 2.2, 2, INK, 0); }
  flat(g, () => g.ellipse(2, 6, 10, 6.5, 0, 0, Math.PI * 2), '#2A0A0A', 1.2);
  part(g, () => g.ellipse(2, 6.5, 7.5, 4.8, 0, 0, Math.PI * 2), L.skin, -6, 2, 16, 10, 0);
  if (F.md === 'ok' && !F.blink) { px(g, -1, 4.5, 2, 2, '#FFFFFF'); px(g, 4, 4.5, 2, 2, '#FFFFFF'); px(g, -0.5, 5, 1, 1.4, INK); px(g, 4.5, 5, 1, 1.4, INK); } else { px(g, -1.5, 5, 3, 1, INK); px(g, 3.5, 5, 3, 1, INK); }
  px(g, 0, 8.6, 5, 1, INK);
  px(g, 7, 3 + F.fr, 1, 2, '#7DD3FC');
  g.restore();
  limb(g, 22, -50, ax, ay, 8, R); ball(g, ax, ay, 5, '#1E1B22', 1);
};
export const drawMascotCostume = (c: Ctx, w: Wear) => {
  const F = frameOf(w.seed, w.f, w.pose, w.md, 0, w.woman, 'l');
  if (w.pose === 'tell') F.fr = Math.floor(w.f / 4) % 2;
  putFrame(c, 'mascot', F, [-52, -102, 104, 106], g => paintMascot(g, F));
};


