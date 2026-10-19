// The enchanted glen's new cast, drawn (a first pass: crude but readable). The huntsman and the dwarfs on Spooky Land's
// person drawer (costume.ts: whoever's in the costume shows, their skin, build, face, man or woman; seeded, no two the
// same; painted once a frame into a stamp); the witch, the gingerbread man and the unicorn drawn as they go (the
// performers' faces through the costumes). Each drawn hurt (eyes shut), knocked about (held, flung, dazed: reaction())
// and dead (limp, crossed-out eyes), so the engine's special deaths play out on their real sprites; and dead, the
// costume gives (the huntsman's cap off, the dwarf's hat and beard askew and the candle out, the witch off her broom and
// her hat beside her, the cookie's head bitten and off, the unicorn's head off and its horn snapped). Feet at the
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
// The witch on her broom, flown on wires

const DRESSES = ['#18181B', '#3B0764', '#14532D', '#1E1B4B'];
const broom = (c: Ctx, x: number, y: number, a: number) => {
  c.save(); c.translate(x, y); c.rotate(a);
  stub(c, -34, 0, 30, 0, 3, '#8A5A30');
  // (the bristles, out behind, bound)
  c.fillStyle = INK; c.beginPath(); c.moveTo(-30, -2); c.lineTo(-52, -9); c.lineTo(-54, 9); c.lineTo(-30, 3); c.closePath(); c.fill();
  c.fillStyle = '#CA8A04'; c.beginPath(); c.moveTo(-31, -1); c.lineTo(-51, -7); c.lineTo(-52, 7); c.lineTo(-31, 2); c.closePath(); c.fill();
  box(c, -33, -3, 3, 6, '#7F1D1D');
  c.restore();
};
export const drawWitch = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const L = lookOf(seed), dress = DRESSES[seed % DRESSES.length], face = '#7AC74F';
  c.save();
  const { md, isDead, pose } = laid(c, e, f, -20, -6);
  const onBroom = !isDead && !pose;
  const cackle = e.aiState === 'cackle', tilt = cackle ? -0.3 : Math.sin(f * 0.08) * 0.06;
  // (the wire she's flown on, up out of the picture: dimmed, thin)
  if (onBroom) { c.strokeStyle = 'rgba(200, 200, 220, 0.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-2, -44); c.lineTo(-2, -700); c.stroke(); }
  c.rotate(onBroom ? tilt : 0);
  if (onBroom) broom(c, 0, -10, 0);
  // (sat sideways on it: the skirt over the handle, striped stockings, pointed boots)
  stub(c, 4, -18, 14, -4, 5, '#F5F5F4'); stub(c, -2, -18, 6, -2, 5, '#F5F5F4');
  for (const [x, y] of [[9, -11], [2, -10]]) box(c, x, y, 5, 2, '#7C3AED');
  box(c, 12, -6, 10, 4, INK); box(c, 3, -4, 10, 4, INK);
  c.fillStyle = INK; c.beginPath(); c.moveTo(-16, -16); c.lineTo(18, -16); c.lineTo(10, -40); c.lineTo(-8, -40); c.closePath(); c.fill();
  c.fillStyle = dress; c.beginPath(); c.moveTo(-15, -17); c.lineTo(17, -17); c.lineTo(9, -39); c.lineTo(-7, -39); c.closePath(); c.fill();
  // (the arms: one on the broom, one up with the bottle (the tell) or out)
  const bx = cackle ? 4 : 14, by = cackle ? -66 : -30;
  stub(c, 4, -36, bx, by, 4, dress); oval(c, bx, by, 3, 3, L.skin);
  if (cackle) { box(c, bx - 4, by - 14, 8, 12, INK); box(c, bx - 3, by - 13, 6, 10, '#22C55E'); box(c, bx - 1, by - 17, 2, 4, '#7A4A22'); }
  stub(c, -2, -36, 10, -14, 4, dk(dress, 0.2));
  // (the head: green makeup over whoever's under it, long stringy hair, a wart; the pointed hat (off, dead))
  if (L.long || L.woman) { c.fillStyle = INK; c.fillRect(-12, -52, 6, 22); c.fillStyle = L.hair; c.fillRect(-11, -51, 4, 20); }
  oval(c, 1, -46, 9, 9.5, face);
  box(c, 8, -46, 4, 3, dk(face, 0.2)); box(c, 10, -44, 2, 2, '#4D7C0F');
  if (md === 'dead') { box(c, 0, -49, 3, 1, INK); box(c, 1, -50, 1, 3, INK); box(c, 5, -49, 3, 1, INK); box(c, 6, -50, 1, 3, INK); }
  else if (md === 'hurt') { box(c, 0, -49, 3, 1, INK); box(c, 5, -49, 3, 1, INK); }
  else { box(c, 1, -50, 2, 3, INK); box(c, 6, -50, 2, 3, INK); }
  box(c, 2, -41, cackle ? 7 : 5, cackle ? 4 : 2, INK);
  if (isDead) {
    c.fillStyle = INK; c.beginPath(); c.moveTo(18, 2); c.lineTo(38, 2); c.lineTo(30, -24); c.closePath(); c.fill();
    c.fillStyle = '#18181B'; c.beginPath(); c.moveTo(19, 1); c.lineTo(37, 1); c.lineTo(30, -22); c.closePath(); c.fill();
    broom(c, 40, 4, 0.3);
  } else {
    c.fillStyle = INK; c.beginPath(); c.moveTo(-14, -52); c.lineTo(16, -52); c.lineTo(4, -86); c.lineTo(-6, -64); c.closePath(); c.fill();
    c.fillStyle = '#18181B'; c.beginPath(); c.moveTo(-13, -53); c.lineTo(15, -53); c.lineTo(4, -84); c.lineTo(-5, -64); c.closePath(); c.fill();
    box(c, -6, -58, 15, 3, '#7C3AED');
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
