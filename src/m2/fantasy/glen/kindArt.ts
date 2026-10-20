// The enchanted glen's new cast, drawn (a first pass: crude but readable). The huntsman and the dwarfs on Spooky Land's
// person drawer (costume.ts: whoever's in the costume shows, their skin, build, face, man or woman; seeded, no two the
// same; painted once a frame into a stamp); Cupid, the gingerbread man and the unicorn drawn as they go (the
// performers' faces through the costumes). Each drawn hurt (eyes shut), knocked about (held, flung, dazed: reaction())
// and dead (limp, crossed-out eyes), so the engine's special deaths play out on their real sprites; and dead, the
// costume gives (the huntsman's cap off, the dwarf's hat and beard askew and the candle out, Cupid's wings torn off
// beside it and its wire snapped, the cookie's head bitten and off, the unicorn's head off and its horn snapped). Feet at the
// origin, facing right (the engine mirrors them).

import type { Enemy } from '../../../m1/types';
import {
  type Pose, type Body, type Frame, INK, dk, lt, part, partTop, px, ball,
  bodyOf, flailHands, legs, torso, arm, headShape, faceOn, whiskers, hairTop, hairBack, frameOf, putFrame, pickOf,
  moodOf, reaction,
} from '../../spooky/costume';
import { lookOf } from '../../adventure/temple/people';

type Ctx = CanvasRenderingContext2D;

const moving = (e: Enemy, min = 0.3): Pose => (Math.abs(e.vel.x) > min ? 'walk' : 'stand');
const poseOf = (e: Enemy, tells: string[], strikes: string[]): Pose =>
  tells.includes(e.aiState ?? '') ? 'tell' : strikes.includes(e.aiState ?? '') ? 'strike' : moving(e);
const frameFor = (e: Enemy, f: number, seed: number, pose: Pose, v = '') => {
  const r = reaction(e);
  return frameOf(seed, f, r?.pose ?? pose, r?.md ?? moodOf(e), 0, undefined, v);
};
const BOX: [number, number, number, number] = [-80, -150, 170, 154];
const handsAt = (B: Body, F: Frame, far: [number, number], near: [number, number]): { far: [number, number]; near: [number, number]; held: boolean } => {
  const fl = flailHands(B, F.fr);
  return fl ? { far: fl[0], near: fl[1], held: true } : { far, near, held: false };
};
const dead = (F: Frame) => F.md === 'dead';

// (the live-drawn kit: an inked oval with a lit spot, a limb as a fat inked stroke, a box)
const box = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const oval = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string, rot = 0) => {
  c.fillStyle = INK; c.beginPath(); c.ellipse(x, y, rx + 1.5, ry + 1.5, rot, 0, Math.PI * 2); c.fill();
  c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), rot, 0, Math.PI * 2); c.fill();
  c.fillStyle = lt(col, 0.25); c.beginPath(); c.ellipse(x - rx * 0.35, y - ry * 0.35, Math.max(0.5, rx * 0.4), Math.max(0.5, ry * 0.3), rot, 0, Math.PI * 2); c.fill();
};
const stub = (c: Ctx, x1: number, y1: number, x2: number, y2: number, w: number, col: string) => {
  c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = w + 3; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
  c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
};
const seedOfE = (e: Enemy) => Math.abs(Math.round(e.initialX || 0)) + (e.variant ?? 0) * 31;
/** A performer's face, small, sweaty, through a hole in the costume. */
const performer = (c: Ctx, e: Enemy, x: number, y: number, r: number, hurt: boolean, isDead: boolean) => {
  const L = lookOf(seedOfE(e));
  c.fillStyle = INK; c.beginPath(); c.ellipse(x, y, r + 2, r * 0.8 + 2, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = L.skin; c.beginPath(); c.ellipse(x, y, r, r * 0.8, 0, 0, Math.PI * 2); c.fill();
  if (isDead) { box(c, x - 5, y - 3, 3, 1, INK); box(c, x - 4, y - 4, 1, 3, INK); box(c, x + 2, y - 3, 3, 1, INK); box(c, x + 3, y - 4, 1, 3, INK); }
  else if (hurt) { box(c, x - 5, y - 3, 3, 1, INK); box(c, x + 2, y - 3, 3, 1, INK); }
  else { box(c, x - 4, y - 4, 2, 3, INK); box(c, x + 3, y - 4, 2, 3, INK); }
  box(c, x - 2, y + 2, 5, 2, INK);
  box(c, x + r - 3, y - r * 0.4, 2, 3, '#BFE8FF');
};
/** Knocked flat (dead, or a body), or flung (spinning a bit): the costume's whole drawing turned for it. */
const laid = (c: Ctx, e: Enemy, f: number, flatDx: number, flatDy: number) => {
  const r = reaction(e), md = r?.md ?? moodOf(e), isDead = md === 'dead';
  const pose = r?.pose ?? null;
  const isFlat = pose === 'limp' || (isDead && !r);
  if (isFlat) { c.rotate(-Math.PI / 2 + 0.05); c.translate(flatDx, flatDy); }
  else if (pose === 'thrown' || pose === 'shaken' || pose === 'pinned') c.rotate(Math.sin(f * 0.6) * 0.3);
  return { r, md, isDead, pose };
};
const stars = (c: Ctx, x: number, y: number, f: number) => {
  for (let k = 0; k < 3; k++) { const a = f * 0.15 + (k * Math.PI * 2) / 3; const sx = x + Math.cos(a) * 16, sy = y + Math.sin(a) * 5; box(c, sx - 2, sy - 0.5, 5, 2, '#FDE047'); box(c, sx - 0.5, sy - 2, 2, 5, '#FDE047'); }
};

// ---------------------------------------------------------------------------------------------------------------
// The huntsman (a loaded crossbow out front: pointy)

const JERKINS = ['#3F6212', '#4D7C0F', '#166534', '#57534E', '#78350F'];
const crossbow = (g: Ctx, x: number, y: number, a: number, glint: boolean) => {
  g.save(); g.translate(x, y); g.rotate(a);
  // (the stock, the bow across its front, the string, the bolt loaded: its head out past the bow)
  part(g, () => g.rect(-14, -2, 30, 5), '#7A4A22', -14, -2, 30, 5, 1);
  part(g, () => { g.moveTo(14, -12); g.quadraticCurveTo(20, 0, 14, 12); g.lineTo(12, 12); g.quadraticCurveTo(17, 0, 12, -12); g.closePath(); }, '#3A2A1A', 12, -12, 8, 24, 1);
  g.strokeStyle = '#E7E5E4'; g.lineWidth = 1; g.beginPath(); g.moveTo(13, -11); g.lineTo(4, 0); g.lineTo(13, 11); g.stroke();
  px(g, 4, -1, 22, 2, '#D6D3D1');
  g.fillStyle = INK; g.beginPath(); g.moveTo(25, -3.5); g.lineTo(33, 0); g.lineTo(25, 3.5); g.closePath(); g.fill();
  g.fillStyle = '#A8A29E'; g.beginPath(); g.moveTo(26, -2); g.lineTo(31, 0); g.lineTo(26, 2); g.closePath(); g.fill();
  if (glint) { px(g, 29, -4, 2, 8, '#FFFFFF'); px(g, 26, -1, 8, 2, '#FFFFFF'); }
  g.restore();
};
const paintHuntsman = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, jerkin = pickOf(F.seed, 2, JERKINS);
  const aim = F.pose === 'tell', bash = F.pose === 'strike', reload = F.v === 'reload';
  legs(g, B, { col: '#57534E', shoe: 'boot', shoeCol: '#3A2A1A' });
  const H = handsAt(B, F, aim ? [B.w / 2 + 2, B.shY + 6] : [-B.w / 2 - 4, B.shY + 16], aim ? [B.w / 2 + 12, B.shY + 2] : bash ? [B.w / 2 + 16, B.shY + 4] : reload ? [B.w / 2 + 2, B.shY + 20] : [B.w / 2 + 8, B.shY + 14]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: dk(jerkin, 0.1), hand: L.skin });
  torso(g, B, jerkin);
  // (the belt, its pouch; a quiver of bolts over the back)
  px(g, -B.w / 2 + 1, B.hipY - 4, B.w - 2, 3, '#3A2A1A'); px(g, 2, B.hipY - 4, 4, 3, '#E0AE3A');
  part(g, () => g.rect(-B.w / 2 - 6, B.shY - 4, 6, 22), '#5A3A1E', -B.w / 2 - 6, B.shY - 4, 6, 22, 1);
  for (const k of [0, 3]) px(g, -B.w / 2 - 5 + k, B.shY - 9, 1, 6, '#D6D3D1');
  hairBack(g, B);
  headShape(g, B, L.skin);
  faceOn(g, B, { skin: L.skin, eyes: aim ? 'angry' : 'open', mouth: bash ? 'teeth' : aim ? 'flat' : 'smirk', md: F.md, blink: F.blink });
  whiskers(g, B);
  if (dead(F)) {
    // (dead: the cap's off, by him, its feather bent)
    hairTop(g, B);
    partTop(g, () => { g.moveTo(B.hx + 18, -2); g.lineTo(B.hx + 36, -2); g.lineTo(B.hx + 30, -10); g.closePath(); }, jerkin, B.hx + 18, -10, 18, 8, 1);
    px(g, B.hx + 30, -12, 8, 2, '#DC2626');
  } else {
    hairTop(g, B);
    // (the feathered cap: a peaked felt hat, a long red feather back off it)
    partTop(g, () => { g.moveTo(B.hx - 11, B.hy - 6); g.lineTo(B.hx + 13, B.hy - 6); g.lineTo(B.hx + 4, B.hy - 18); g.lineTo(B.hx - 6, B.hy - 14); g.closePath(); }, jerkin, B.hx - 11, B.hy - 18, 24, 12, 1);
    part(g, () => { g.moveTo(B.hx - 4, B.hy - 13); g.quadraticCurveTo(B.hx - 18, B.hy - 26, B.hx - 26, B.hy - 22); g.quadraticCurveTo(B.hx - 16, B.hy - 18, B.hx - 4, B.hy - 11); g.closePath(); }, '#DC2626', B.hx - 26, B.hy - 26, 22, 15, 1);
  }
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: jerkin, hand: L.skin });
  if (!H.held) crossbow(g, H.near[0] - 4, H.near[1], aim ? 0 : bash ? -0.2 : reload ? 0.9 : 0.15, aim && F.fr % 2 === 0);
};
export const drawHuntsman = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['aim'], ['bashWind', 'bash']), e.aiState === 'reload' ? 'reload' : '');
  // (the glint flickers through the aim)
  if (F.pose === 'tell' && e.aiState === 'aim') F.fr = Math.floor(f / 3) % 2;
  putFrame(c, 'fa-huntsman', F, BOX, g => paintHuntsman(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The dwarf (an adult in dwarf costume, a miner's hat and its candle (spiky), the beard, the pickaxe)

const TUNICS = ['#B91C1C', '#1D4ED8', '#CA8A04', '#7C3AED', '#15803D', '#C2410C'];
const BEARDS = ['#F5F5F4', '#A8A29E', '#78350F', '#1C1917', '#B45309'];
const pickaxe = (g: Ctx, x: number, y: number, a: number) => {
  g.save(); g.translate(x, y); g.rotate(a);
  part(g, () => g.rect(-3, -2, 34, 4), '#8A5A30', -3, -2, 34, 4, 1);
  part(g, () => { g.moveTo(26, -14); g.quadraticCurveTo(36, -2, 30, 14); g.lineTo(27, 13); g.quadraticCurveTo(31, -1, 23, -11); g.closePath(); }, '#9CA3AF', 23, -14, 13, 28, 1);
  g.restore();
};
const paintDwarf = (g: Ctx, F: Frame) => {
  g.save(); g.scale(0.78, 0.78);
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, tunic = pickOf(F.seed, 3, TUNICS), beard = pickOf(F.seed, 4, BEARDS);
  const raise = F.pose === 'tell' && F.v !== 'wind', stuck = F.v === 'stuck', wind = F.v === 'wind';
  legs(g, B, { col: '#57534E', shoe: 'boot', shoeCol: '#3A2A1A' });
  const H = handsAt(B, F, wind ? [-B.w / 2 - 10, B.shY - 14] : [-B.w / 2 - 4, B.shY + 16], raise ? [B.hx - 4, B.hy - 24] : stuck ? [B.w / 2 + 12, B.shY + 24] : [B.w / 2 + 6, B.shY + 12]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: dk(tunic, 0.1), hand: L.skin });
  if (wind && !H.held) ball(g, H.far[0] - 2, H.far[1] - 5, 5, '#A78BFA', 1);
  torso(g, B, tunic);
  px(g, -B.w / 2 + 1, B.hipY - 3, B.w - 2, 3, '#3A2A1A'); px(g, -2, B.hipY - 3, 4, 3, '#CA8A04');
  headShape(g, B, L.skin);
  faceOn(g, B, { skin: L.skin, eyes: raise ? 'angry' : 'open', mouth: raise ? 'teeth' : 'grin', md: F.md, blink: F.blink });
  // (the costume's beard: big, fake, down to the belt (askew, dead), the elastic over the ears)
  const bx = dead(F) ? 4 : 0;
  part(g, () => { g.moveTo(B.hx - 6 + bx, B.hy + 4); g.quadraticCurveTo(B.hx + 16 + bx, B.hy + 2, B.hx + 10 + bx, B.hy + 30); g.quadraticCurveTo(B.hx + 2 + bx, B.hy + 38, B.hx - 6 + bx, B.hy + 28); g.closePath(); }, beard, B.hx - 6 + bx, B.hy + 2, 22, 36, 1);
  px(g, B.hx - 8, B.hy - 2, 4, 1, '#E7E5E4');
  if (dead(F)) {
    hairTop(g, B);
    // (the hat's off, rolled away, the candle out: a wisp off it)
    partTop(g, () => g.ellipse(B.hx + 30, -6, 10, 6, 0.2, Math.PI, 0), '#CA8A04', B.hx + 20, -12, 20, 7, 1);
    px(g, B.hx + 29, -16, 3, 6, '#F5F5F4'); px(g, B.hx + 30, -20, 1, 3, '#A8A29E');
  } else {
    // (the miner's hat, the candle stuck on top, lit)
    partTop(g, () => g.ellipse(B.hx, B.hy - 7, 12, 8, 0, Math.PI, 0), '#CA8A04', B.hx - 12, B.hy - 15, 24, 9, 1);
    px(g, B.hx - 14, B.hy - 8, 28, 3, dk('#CA8A04', 0.2));
    px(g, B.hx - 2, B.hy - 23, 5, 9, INK); px(g, B.hx - 1, B.hy - 22, 3, 8, '#F5F5F4');
    ball(g, B.hx + 0.5, B.hy - 27, 2.5, F.fr % 2 ? '#FDE047' : '#FB923C', 0.6);
  }
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: tunic, hand: L.skin });
  if (!H.held) pickaxe(g, H.near[0], H.near[1], raise ? -1.9 : stuck ? 0.9 : -0.9);
  g.restore();
};
export const drawDwarf = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const v = e.aiState === 'stuck' ? 'stuck' : e.aiState === 'wind' ? 'wind' : '';
  const F = frameFor(e, f, seed, poseOf(e, ['pickWind', 'wind'], ['stuck', 'after']), v);
  putFrame(c, 'fa-dwarf', F, BOX, g => paintDwarf(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// Cupid, flown on wires: a grown cast member in a diaper and a toga sash, stubby wings, a laurel or a heart headband,
// a heart-tipped bow with the arrow always nocked out front (pointy)

const SASHES = ['#F9A8D4', '#FFFFFF', '#FCA5A5', '#F5D0FE'];
/** A little inked heart, its point `a` (radians) the way it points (0: forward). */
export const heart = (c: Ctx, x: number, y: number, r: number, col: string, a = Math.PI / 2) => {
  c.save(); c.translate(x, y); c.rotate(a - Math.PI / 2);
  c.beginPath(); c.moveTo(0, r * 1.1);
  c.bezierCurveTo(-r * 1.7, -r * 0.1, -r * 0.9, -r * 1.5, 0, -r * 0.5);
  c.bezierCurveTo(r * 0.9, -r * 1.5, r * 1.7, -r * 0.1, 0, r * 1.1); c.closePath();
  c.lineWidth = 2.5; c.strokeStyle = INK; c.stroke(); c.fillStyle = col; c.fill();
  c.restore();
};
/** A heart-tipped arrow pointing along `a` from (x, y) (its tip there): pink fletching, a red heart for a head. */
export const heartArrow = (c: Ctx, x: number, y: number, a: number, len = 26) => {
  c.save(); c.translate(x, y); c.rotate(a);
  box(c, -len, -1.5, len - 4, 3, INK); box(c, -len + 1, -0.5, len - 6, 1, '#FEF3C7');
  // (the fletching)
  c.fillStyle = INK; c.beginPath(); c.moveTo(-len - 2, -5); c.lineTo(-len + 7, -1); c.lineTo(-len + 7, 1); c.lineTo(-len - 2, 5); c.closePath(); c.fill();
  c.fillStyle = '#F472B6'; c.beginPath(); c.moveTo(-len - 1, -3.5); c.lineTo(-len + 6, -0.5); c.lineTo(-len + 6, 0.5); c.lineTo(-len - 1, 3.5); c.closePath(); c.fill();
  heart(c, -4, 0, 4.5, '#EF4444', 0);
  c.restore();
};
/** A stubby little wing off the back: fat, white, three feather tips, flapping. */
const wing = (c: Ctx, x: number, y: number, flap: number, col: string) => {
  c.save(); c.translate(x, y); c.rotate(-0.6 - flap);
  oval(c, -9, 0, 11, 6, col);
  for (let k = 0; k < 3; k++) oval(c, -17 + k * 5, 4, 3, 2.5, dk(col, 0.08));
  c.restore();
};
/** The bow: a recurve, held upright out front; its string pulled back to `sx`; the arrow nocked on it. */
const bow = (c: Ctx, bx: number, by: number, sx: number, glint: boolean) => {
  c.lineCap = 'round';
  for (const [w, col] of [[5, INK], [2.5, '#CA8A04']] as const) {
    c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(bx - 3, by - 17); c.quadraticCurveTo(bx + 9, by, bx - 3, by + 17); c.stroke();
  }
  c.strokeStyle = '#F5F5F4'; c.lineWidth = 1; c.beginPath(); c.moveTo(bx - 3, by - 16); c.lineTo(sx, by); c.lineTo(bx - 3, by + 16); c.stroke();
  heartArrow(c, bx + 12, by, 0, bx + 12 - sx);
  if (glint) { box(c, bx + 10, by - 6, 2, 12, '#FFFFFF'); box(c, bx + 5, by - 1, 12, 2, '#FFFFFF'); }
};
export const drawCupid = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const L = lookOf(seed), sash = SASHES[seed % SASHES.length], hearts = Math.floor(seed / 5) % 2 === 0;
  const fat = L.heavy ? 4 : 0, man = !L.woman;
  c.save();
  const { md, isDead, pose } = laid(c, e, f, -20, -6);
  const onWire = !isDead && !pose;
  const draw = e.aiState === 'draw', rear = e.aiState === 'rear', swoop = e.aiState === 'swoop';
  const flap = onWire ? Math.sin(f * (rear || swoop ? 0.9 : 0.4)) * 0.5 : 0.2;
  // (the wire it's flown on, up out of the picture from the harness between the wings: dimmed, thin)
  if (onWire) { c.strokeStyle = 'rgba(200, 200, 220, 0.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-6, -40); c.lineTo(-6, -700); c.stroke(); }
  c.rotate(onWire ? (swoop ? 0.35 : rear ? -0.25 : Math.sin(f * 0.08) * 0.05) : 0);
  // (the wings off its back: on it alive; dead, torn off and lying beside it)
  if (!isDead) { wing(c, -6, -42, flap + 0.25, '#E5E7EB'); wing(c, -9, -38, flap, '#FFFFFF'); }
  // (the legs dangling, bare, knees bent, kicking a little)
  const kick = onWire ? Math.sin(f * 0.2) * 3 : 0, lw = 6 + fat / 2;
  stub(c, -4, -18, -8 + kick, -3, lw, dk(L.skin, 0.12)); stub(c, 4, -18, 9 - kick, -5, lw, L.skin);
  oval(c, -6 + kick, -2, 4, 2.5, dk(L.skin, 0.12)); oval(c, 11 - kick, -4, 4, 2.5, L.skin);
  // (the body, bare (a belly on the heavy ones, chest hair on the hairy men); a woman's in a toga top)
  oval(c, 0, -32, 10 + fat, 13, L.skin);
  if (man && L.face >= 1) for (const [x, y] of [[-3, -38], [1, -36], [4, -39], [-1, -33], [3, -32]]) box(c, x, y, 2, 2, dk(L.hair, 0.1));
  // (the diaper: white, bulky, a safety pin)
  c.fillStyle = INK; c.beginPath(); c.roundRect(-12 - fat, -27, 24 + fat * 2, 13, [3, 3, 7, 7]); c.fill();
  c.fillStyle = '#FAFAF9'; c.beginPath(); c.roundRect(-11 - fat, -26, 22 + fat * 2, 11, [2, 2, 6, 6]); c.fill();
  box(c, -11 - fat, -26, 22 + fat * 2, 2, '#E7E5E4'); box(c, 5 + fat, -24, 4, 2, '#A8A29E'); box(c, 8 + fat, -25, 1, 4, '#A8A29E');
  // (the toga sash over a shoulder, across the chest; a woman's wide enough to cover)
  stub(c, -7, -44, 9 + fat, -24, L.woman ? 8 : 5, sash);
  if (L.woman) { box(c, -10 - fat, -41, 20 + fat * 2, 7, INK); box(c, -9 - fat, -40, 18 + fat * 2, 5, sash); }
  // (the arms: the far one out with the bow (it always has the arrow on it: the heart out front), the near one at the
  //  string, pulled back in the draw)
  const bx = 18, by = -34, pull = draw ? Math.min(1, (e.aiTimer ?? 0) / 18) : 0, sx = bx - 6 - pull * 12;
  if (!isDead) {
    stub(c, 4, -40, bx - 2, by, 4, dk(L.skin, 0.08));
    if (!pose) bow(c, bx, by, sx, draw && (e.aiTimer ?? 0) > 20 && f % 4 < 2);
    stub(c, -2, -40, pose ? -14 : sx, pose ? -58 : by, 4, L.skin);
  } else stub(c, 2, -40, 14, -22, 4, L.skin);
  // (the head: whoever's under the headband; long hair down the back, a beard or a mustache on the men)
  if (L.long) { box(c, -10, -56, 6, 20, INK); box(c, -9, -55, 4, 18, L.hair); }
  oval(c, 1, -50, 8.5, 9, L.skin);
  if (!L.bald) { box(c, -8, -60, 17, 5, INK); box(c, -7, -59, 15, 4, L.hair); }
  if (man && L.face === 2) { box(c, -5, -46, 13, 6, INK); box(c, -4, -45, 11, 4, L.hair); }
  if (man && L.face === 1) box(c, 1, -46, 7, 2, L.hair);
  if (md === 'dead') { box(c, 0, -53, 3, 1, INK); box(c, 1, -54, 1, 3, INK); box(c, 5, -53, 3, 1, INK); box(c, 6, -54, 1, 3, INK); }
  else if (md === 'hurt') { box(c, 0, -53, 3, 1, INK); box(c, 5, -53, 3, 1, INK); }
  else { box(c, 1, -54, 2, 3, INK); box(c, 6, -54, 2, 3, INK); if (draw) box(c, 0, -56, 9, 1, INK); }
  if (!(man && L.face === 2)) box(c, 2, -45, draw || swoop ? 5 : 4, draw ? 1 : 2, INK);
  // (the headband: a laurel wreath, or pink with a heart on the front; askew, dead)
  const tilt = isDead ? 3 : 0;
  if (hearts) { box(c, -8, -57 + tilt, 18, 4, INK); box(c, -7, -56 + tilt, 16, 2, '#F472B6'); heart(c, 7, -57 + tilt, 3.5, '#EF4444'); }
  else { for (let k = 0; k < 5; k++) oval(c, -7 + k * 4, -57 + tilt + (k % 2), 2.5, 1.5, '#4D7C0F', -0.5 + k * 0.25); }
  if (isDead) {
    // (dead: the wings off beside it, the bow dropped, the wire snapped: a curl of it on the harness)
    wing(c, 34, -4, 0.9, '#E5E7EB'); wing(c, 48, 0, 1.4, '#FFFFFF');
    c.strokeStyle = '#CA8A04'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(20, 4); c.quadraticCurveTo(30, -6, 40, 6); c.stroke();
    c.strokeStyle = 'rgba(200, 200, 220, 0.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-6, -40); c.bezierCurveTo(-18, -48, -20, -30, -10, -32); c.bezierCurveTo(-2, -34, -14, -22, -22, -26); c.stroke();
  }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The gingerbread man (a foam cookie suit, the performer's face through its mouth)

const COOKIE = '#B8743A', ICING = '#FFF7ED';
export const drawGinger = (c: Ctx, e: Enemy, f: number) => {
  c.save();
  const { md, isDead, pose } = laid(c, e, f, -34, -10);
  const crouch = e.aiState === 'crouch', leap = e.aiState === 'leap', down = e.aiState === 'down' && !pose;
  if (crouch) { c.translate(0, 0); c.scale(1.08, 0.86); }
  if (down) { c.rotate(0.35); c.translate(6, 4); }
  const walk = Math.abs(e.vel.x) > 0.3 ? Math.sin(f * 0.35) * 6 : 0;
  // (the legs: stubby cookie legs, icing zigzags at the ankles)
  stub(c, -10, -30, -12 - walk, -6, 14, dk(COOKIE, 0.15)); stub(c, 10, -30, 12 + walk, -6, 14, COOKIE);
  for (const x of [-12 - walk, 12 + walk]) box(c, x - 6, -12, 12, 2, ICING);
  // (the far arm)
  const ay = leap ? -84 : crouch ? -56 : -52;
  stub(c, -18, -58, -34, ay, 13, dk(COOKIE, 0.15)); box(c, -38, ay - 1, 8, 2, ICING);
  // (the body: three gumdrop buttons, a candy bow tie)
  oval(c, 0, -44, 24, 22, COOKIE);
  for (const [k, col] of [[0, '#EF4444'], [1, '#22C55E'], [2, '#3B82F6']] as const) oval(c, 2, -54 + k * 10, 3.5, 3.5, col);
  box(c, -6, -66, 5, 6, '#DB2777'); box(c, 3, -66, 5, 6, '#DB2777'); box(c, -1, -65, 4, 4, '#F9A8D4');
  if (isDead) {
    // (dead: the cookie head's off at his feet, a bite out of it; the performer's own head, small, on the big body)
    oval(c, 40, -14, 18, 16, COOKIE, 0.4);
    c.fillStyle = '#5A3A1E'; c.beginPath(); c.arc(54, -22, 8, 0, Math.PI * 2); c.fill();
    performer(c, e, 2, -74, 9, true, true);
  } else {
    // (the cookie head, round; icing eyes and an icing smile round the face hole)
    oval(c, 2, -86, 21, 20, COOKIE);
    c.strokeStyle = ICING; c.lineWidth = 2; c.beginPath(); c.arc(2, -86, 17, 0.2, Math.PI - 0.2); c.stroke();
    oval(c, -6, -96, 3, 3, ICING); oval(c, 10, -96, 3, 3, ICING);
    box(c, -9, -90, 22, 14, INK);
    performer(c, e, 2, -83, 7, md === 'hurt', false);
  }
  // (the near arm, out at him (up in the leap))
  stub(c, 18, -58, leap ? 34 : 30, leap ? -86 : crouch ? -52 : -40, 13, COOKIE); box(c, leap ? 30 : 26, (leap ? -86 : crouch ? -52 : -40) - 1, 8, 2, ICING);
  if (down) stars(c, 2, -110, f);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The unicorn mascot (a plush suit, a rainbow mane, a gold horn out front: pointy)

const COATS = ['#FFFFFF', '#FCE7F3', '#EDE9FE', '#E0F2FE'];
const MANE = ['#F87171', '#FBBF24', '#4ADE80', '#60A5FA', '#A78BFA'];
const horn = (c: Ctx, x: number, y: number, a: number, len = 26) => {
  c.save(); c.translate(x, y); c.rotate(a);
  c.fillStyle = INK; c.beginPath(); c.moveTo(0, -5); c.lineTo(len + 2, 0); c.lineTo(0, 5); c.closePath(); c.fill();
  c.fillStyle = '#F6D365'; c.beginPath(); c.moveTo(1, -4); c.lineTo(len, 0); c.lineTo(1, 4); c.closePath(); c.fill();
  for (let k = 4; k < len - 4; k += 5) box(c, k, -2, 1, 4, '#B07A1E');
  c.restore();
};
export const drawUnicorn = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const coat = COATS[seed % COATS.length];
  c.save();
  const { md, isDead } = laid(c, e, f, -36, -12);
  const paw = e.aiState === 'paw', charge = e.aiState === 'charge', dizzy = e.aiState === 'dizzy';
  const walk = charge ? Math.sin(f * 0.6) * 9 : Math.abs(e.vel.x) > 0.3 ? Math.sin(f * 0.25) * 5 : 0;
  const lean = charge ? 0.2 : paw ? 0.12 : 0;
  // (the tail: a rainbow swish out behind)
  for (let k = 0; k < 5; k++) { c.strokeStyle = MANE[k]; c.lineWidth = 3; c.beginPath(); c.moveTo(-22, -50 + k * 2); c.quadraticCurveTo(-44, -44 + k * 3 + Math.sin(f * 0.2) * 3, -40, -22 + k * 3); c.stroke(); }
  // (the legs, hooves; one pawing in the tell)
  const pawK = paw ? Math.abs(Math.sin(f * 0.3)) * 10 : 0;
  stub(c, -10, -30, -12 - walk, -6, 15, dk(coat, 0.12)); stub(c, 12, -30, 14 + walk + pawK * 0.5, -6 - pawK, 15, coat);
  oval(c, -12 - walk, -4, 9, 5, '#A78BFA'); oval(c, 16 + walk + pawK * 0.5, -4 - pawK, 9, 5, '#A78BFA');
  c.save(); c.translate(0, -40); c.rotate(lean); c.translate(0, 40);
  // (the body)
  oval(c, 0, -52, 26, 28, coat);
  oval(c, 6, -48, 13, 18, lt(coat, 0.4));
  if (isDead) {
    // (dead: the head's off, rolled away, the horn snapped beside it; the performer's own head on the plush body)
    oval(c, 48, -14, 18, 13, coat, 0.3);
    horn(c, 66, -6, 0.9, 14);
    performer(c, e, 4, -86, 9, true, true);
  } else {
    // (the neck up front, the performer's face through a hole in it; the horse head out front, the mane, the horn)
    const hd = charge || paw ? 10 : 0;
    stub(c, 6, -72, 18, -88 + hd, 18, coat);
    performer(c, e, 10, -76, 7, md === 'hurt' || dizzy, false);
    oval(c, 26, -92 + hd, 18, 13, coat);
    oval(c, 40, -88 + hd, 9, 8, lt(coat, 0.2));
    box(c, 44, -90 + hd, 2, 2, INK);
    oval(c, 24, -97 + hd, 3.5, 3.5, '#FFFFFF'); box(c, 25, -98 + hd, 2, 3, INK);
    for (let k = 0; k < 5; k++) box(c, 6 + k * 3, -104 + hd + k * 2, 5, 14, MANE[k]);
    horn(c, 30, -104 + hd, charge || paw ? -0.05 : -0.9);
  }
  c.restore();
  // (the arms, little, in front)
  stub(c, 14, -66, 28, paw ? -56 : -50, 10, coat); oval(c, 28, paw ? -55 : -49, 5, 5, '#A78BFA');
  if (dizzy) stars(c, 10, -120, f);
  c.restore();
};
