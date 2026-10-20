// The big-kid zone's cast, drawn (a first pass: crude but clean, on Spooky Land's person drawer, costume.ts, so whoever's
// in the costume shows: their skin, build and face, man or woman). Each seeded: no two the same. Each drawn hurt (eyes
// shut), knocked about (held, flung, dazed) and dead (limp, crossed-out eyes); dead, the costume gives (the ride op's
// headset off, Rad Rat's head off: the sweaty performer underneath, the Flea's cowl and antennae off, the churro hat
// off, Gloppy's top blob off). Feet at the origin, facing right (the engine mirrors them: no lettering on them). The
// people's frames painted once into a stamp; Gloppy drawn as he goes.
//
//   rideop     the zone's teal polo, khaki shorts, a lanyard and a name tag, a headset with its mic boom, an orange
//              traffic wand (hand to the headset: the tell; a cone hoisted overhead: the other tell)
//   skatepunk  RAD RAT: a grey rat costume head (big round ears, buck teeth, neon shades, a backwards red cap, a
//              purple mohawk of spikes), a baggy lime tee, cargo shorts, high-tops, the board (crouched on it: the
//              tell; stomped up into his hand: the other; flat on his ass in the bail)
//   gloppy     a big lumpy green slime suit, drips, eye stalks with googly eyes, the performer's face in the mouth hole
//              (cheeks puffed: the tell)
//   flea       a blue muscle suit (the chest padded out to here), red boots and gloves, a red flea on the chest, a
//              blue cowl with white lenses, two antennae bobbing (fists on hips: the wind-up; hanging fist down: the
//              tell; diving; stuck head first)
//   churro     a red-striped shirt, a white apron, a paper hat, the churro cart in front (striped awning, a churro
//              painted on it) (shaking the sugar bag: the tell; leaning on the handle: the other)

import type { Enemy } from '../../../m1/types';
import {
  type Pose, type Body, type Frame, INK, dk, lt, part, px, ball, limb,
  bodyOf, flailHands, legs, torso, arm, headShape, faceOn, whiskers, glasses, hairTop, hairBack, frameOf, putFrame,
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
const BOX: [number, number, number, number] = [-90, -170, 190, 176];
const face = (g: Ctx, B: Body, F: Frame, eyes: 'open' | 'angry' | 'wide' | 'tired' | 'smug', mouth: 'flat' | 'grin' | 'smile' | 'teeth' | 'o' | 'smirk') => {
  headShape(g, B, B.L.skin);
  faceOn(g, B, { skin: B.L.skin, eyes, mouth, md: F.md, blink: F.blink });
};
const handsAt = (B: Body, F: Frame, far: [number, number], near: [number, number]): { far: [number, number]; near: [number, number]; held: boolean } => {
  const fl = flailHands(B, F.fr);
  return fl ? { far: fl[0], near: fl[1], held: true } : { far, near, held: false };
};
const dead = (F: Frame) => F.md === 'dead';

// ---------------------------------------------------------------------------------------------------------------
// The ride op

const POLO = '#0D9488', KHAKI = '#C8B48A';
/** The headset: a band over the head, the ear cup, the mic boom round to the mouth. */
const headset = (g: Ctx, x: number, y: number, a = 0) => {
  g.save(); g.translate(x, y); g.rotate(a);
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 10, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
  g.strokeStyle = '#3F3F46'; g.lineWidth = 1.5; g.stroke();
  part(g, () => g.ellipse(-6, 2, 3.5, 4.5, 0, 0, Math.PI * 2), '#27272A', -9.5, -2.5, 7, 9, 1);
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(-5, 5); g.quadraticCurveTo(0, 12, 8, 9); g.stroke();
  px(g, 7, 8, 3, 3, '#18181B');
  g.restore();
};
const cone = (g: Ctx, x: number, y: number, a = 0) => {
  g.save(); g.translate(x, y); g.rotate(a);
  part(g, () => { g.moveTo(-9, 0); g.lineTo(9, 0); g.lineTo(2, -20); g.lineTo(-2, -20); g.closePath(); }, '#F97316', -9, -20, 18, 20, 1);
  px(g, -5, -11, 10, 3, '#FFFFFF');
  part(g, () => g.rect(-11, 0, 22, 3), '#EA580C', -11, 0, 22, 3, 1);
  g.restore();
};
const paintRideOp = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const radio = F.v === 'radio', coneUp = F.v === 'cone', jab = F.pose === 'strike';
  legs(g, B, { col: KHAKI, shoe: 'sneaker', shoeCol: '#E5E7EB', bareBelow: true });
  const H = handsAt(B, F,
    radio ? [B.hx - 7, B.hy + 2] : coneUp ? [B.hx - 9, B.hy - 22] : [-B.w / 2 - 4, B.shY + 18],
    coneUp ? [B.hx + 10, B.hy - 22] : jab ? [B.w / 2 + 20, B.shY + 8] : [B.w / 2 + 7, B.shY + 16]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: POLO, hand: L.skin, len: 0.4 });
  torso(g, B, POLO);
  // (the collar, the lanyard and its name tag, the park's little logo)
  part(g, () => { g.moveTo(-6, B.shY); g.lineTo(0, B.shY + 6); g.lineTo(6, B.shY); g.closePath(); }, lt(POLO, 0.3), -6, B.shY, 12, 6, 0.8);
  g.strokeStyle = '#DC2626'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-5, B.shY + 1); g.lineTo(-2, B.shY + 16); g.lineTo(3, B.shY + 1); g.stroke();
  part(g, () => g.rect(-6, B.shY + 15, 9, 6), '#F8FAFC', -6, B.shY + 15, 9, 6, 0.8);
  px(g, -5, B.shY + 17, 7, 1, '#1D4ED8');
  px(g, 5, B.shY + 6, 4, 3, '#FDE047');
  hairBack(g, B);
  face(g, B, F, radio ? 'tired' : jab ? 'angry' : 'tired', radio ? 'o' : jab ? 'teeth' : 'flat');
  whiskers(g, B); glasses(g, B);
  hairTop(g, B);
  if (dead(F)) headset(g, B.hx + 30, -6, 2.6);
  else headset(g, B.hx, B.hy, 0);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: POLO, hand: L.skin, len: 0.4 });
  // (the wand: an orange glow-stick of a thing; the cone held up overhead in both hands)
  if (!H.held && coneUp) cone(g, (H.far[0] + H.near[0]) / 2, Math.min(H.far[1], H.near[1]) - 2, 0.1);
  else if (!H.held && !dead(F)) {
    g.save(); g.translate(H.near[0], H.near[1]); g.rotate(jab ? 0 : 0.9);
    part(g, () => g.roundRect(-2, -2.5, 28, 5, 2), '#FB923C', -2, -2.5, 28, 5, 1);
    px(g, 4, -1.5, 18, 1.5, '#FED7AA');
    part(g, () => g.rect(-6, -3, 6, 6), '#1F2937', -6, -3, 6, 6, 1);
    g.restore();
  }
};
export const drawRideOp = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const st = e.aiState ?? '';
  const F = frameFor(e, f, seed, poseOf(e, ['radio', 'coneWind', 'wandWind'], ['wand']), st === 'radio' ? 'radio' : st === 'coneWind' ? 'cone' : '');
  putFrame(c, 'ct-rideop', F, BOX, g => paintRideOp(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// Rad Rat

const TEE = '#84CC16', SHORTS = '#4B5563', RAT = '#9CA3AF';
/** A skateboard at its middle (x, y: the wheels' bottoms), tilted. */
const board = (g: Ctx, x: number, y: number, a = 0) => {
  g.save(); g.translate(x, y); g.rotate(a);
  for (const wx of [-13, 13]) { ball(g, wx, -3, 3, '#FDE047', 1); }
  px(g, -15, -7, 30, 2, '#A1A1AA');
  part(g, () => { g.moveTo(-22, -10); g.quadraticCurveTo(-26, -11, -24, -7); g.lineTo(24, -7); g.quadraticCurveTo(26, -11, 22, -10); g.closePath(); }, '#7C3AED', -26, -11, 52, 4, 1);
  px(g, -6, -10, 12, 2, '#FDE047');
  g.restore();
};
/** The rat costume head (its middle at x, y): big ears, a snout, buck teeth, neon shades, a backwards cap, the mohawk
 *  of purple spikes along the top. */
export const ratHead = (g: Ctx, x: number, y: number, a = 0) => {
  g.save(); g.translate(x, y); g.rotate(a);
  for (const [ex, ey] of [[-9, -12], [7, -15]] as [number, number][]) { ball(g, ex, ey, 7, RAT, 1); ball(g, ex, ey, 4, '#F9A8D4', 0); }
  part(g, () => g.ellipse(0, 0, 14, 12, 0, 0, Math.PI * 2), RAT, -14, -12, 28, 24, 1.2);
  part(g, () => { g.moveTo(6, -5); g.quadraticCurveTo(22, -2, 22, 4); g.quadraticCurveTo(16, 8, 4, 6); g.closePath(); }, lt(RAT, 0.15), 4, -5, 18, 13, 1);
  ball(g, 22, 2, 3, '#F472B6', 1);
  px(g, 13, 7, 3, 4, '#FFFFFF'); px(g, 16, 7, 3, 4, '#FFFFFF');
  g.strokeStyle = INK; g.lineWidth = 0.8; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(17, 3); g.lineTo(27, 3 + s * 3); g.stroke(); }
  // (the shades: neon pink frames, black lenses)
  part(g, () => g.roundRect(-1, -6, 16, 6, 2), '#18181B', -1, -6, 16, 6, 1);
  px(g, -2, -6, 18, 1.5, '#EC4899'); px(g, 2, -5, 3, 1, '#A1A1AA');
  // (the cap on backwards: the brim out the back)
  part(g, () => { g.moveTo(-12, -6); g.quadraticCurveTo(-10, -16, 2, -15); g.quadraticCurveTo(10, -14, 10, -7); g.closePath(); }, '#DC2626', -12, -16, 22, 10, 1);
  part(g, () => g.roundRect(-22, -9, 12, 4, 2), '#B91C1C', -22, -9, 12, 4, 1);
  // (the mohawk: spikes up out of the cap, through a hole cut in it)
  for (let i = 0; i < 5; i++) { const sx = -6 + i * 3.5; part(g, () => { g.moveTo(sx - 2, -14); g.lineTo(sx + 0.5, -25 - (i % 2) * 3); g.lineTo(sx + 3, -14); g.closePath(); }, '#A855F7', sx - 2, -28, 5, 14, 0.9); }
  g.restore();
};
const paintSkate = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr);
  const riding = F.v.includes('ride'), boardless = F.v.includes('nob'), pop = F.v.includes('pop'), crouch = F.v.includes('crouch'), rush = F.v.includes('rush'), bail = F.v.includes('bail');
  g.save();
  if (bail) { g.translate(-6, 12); g.rotate(-0.35); }
  if (riding || crouch || rush) g.translate(0, -9);
  if (crouch) { g.translate(0, 6); g.scale(1, 0.9); }
  if (rush) g.rotate(0.14);
  legs(g, B, { col: SHORTS, shoe: 'sneaker', shoeCol: '#111827', bareBelow: true, stripe: undefined });
  const H = handsAt(B, F, pop ? [-B.w / 2 - 2, B.shY + 16] : rush ? [-B.w / 2 - 14, B.shY + 2] : [-B.w / 2 - 4, B.shY + 18], pop ? [B.w / 2 + 2, B.shY - 10] : rush ? [B.w / 2 + 14, B.shY + 2] : [B.w / 2 + 7, B.shY + 16]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: TEE, hand: '#E5E7EB', len: 0.45 });
  torso(g, B, TEE, B.shY, B.hipY + 6, 4);
  // (a lightning bolt on the tee, the wallet chain)
  part(g, () => { g.moveTo(2, B.shY + 4); g.lineTo(-3, B.shY + 12); g.lineTo(1, B.shY + 12); g.lineTo(-2, B.shY + 20); g.lineTo(5, B.shY + 10); g.lineTo(1, B.shY + 10); g.closePath(); }, '#FDE047', -3, B.shY + 4, 8, 16, 0.8);
  g.strokeStyle = '#D4D4D8'; g.lineWidth = 1; g.beginPath(); g.moveTo(-B.hipW / 2, B.hipY + 2); g.quadraticCurveTo(-B.hipW / 2 + 2, B.hipY + 12, 4, B.hipY + 6); g.stroke();
  if (dead(F)) {
    // (the head's come off: lying by him; the performer underneath, sweaty)
    hairBack(g, B); face(g, B, F, 'open', 'o'); whiskers(g, B); hairTop(g, B);
    ratHead(g, B.hx + 34, -12, 1.6);
  } else ratHead(g, B.hx + 1, B.hy - 3, rush ? 0.12 : 0);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: TEE, hand: '#E5E7EB', len: 0.45 });
  // (the gloves: grey rat paws)
  g.restore();
  // (the board: under him riding; up in his hand popped; rolled off in the bail; none if he threw it)
  if (!boardless && !dead(F)) {
    if (pop && !H.held) board(g, H.near[0] + 4, H.near[1] + 18, -1.4);
    else if (bail) board(g, 26, 0, 0.05);
    else if (riding || crouch || rush) board(g, 0, 0, 0);
    else if (!H.held) board(g, -B.w / 2 - 10, -4, -1.2);
  }
};
export const drawSkatePunk = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const st = e.aiState ?? '', s = e as { boardless?: boolean };
  const riding = Math.abs(e.vel.x) > 0.3 && !s.boardless;
  const v = [riding ? 'ride' : '', s.boardless ? 'nob' : '', st === 'pop' ? 'pop' : '', st === 'crouch' ? 'crouch' : '', st === 'rush' ? 'rush' : '', st === 'bail' ? 'bail' : ''].join('');
  const F = frameFor(e, f, seed, poseOf(e, ['crouch', 'pop'], ['rush']), v);
  // (riding: his legs stood still on the board, not walking)
  const F2 = riding && F.pose === 'walk' ? { ...F, pose: 'stand' as Pose, fr: 0 } : F;
  putFrame(c, 'ct-skate', F2, BOX, g => paintSkate(g, F2));
  // (bailed: birdies)
  if (st === 'bail' && e.health > 0) for (let i = 0; i < 3; i++) { const a = f * 0.2 + (i / 3) * Math.PI * 2; c.fillStyle = INK; c.fillRect(Math.round(Math.cos(a) * 14) - 2, -70 + Math.round(Math.sin(a) * 4) - 2, 5, 5); c.fillStyle = '#FDE047'; c.fillRect(Math.round(Math.cos(a) * 14) - 1, -70 + Math.round(Math.sin(a) * 4) - 1, 3, 3); }
};

// ---------------------------------------------------------------------------------------------------------------
// The Flea

const SUIT = '#2563EB', RED = '#DC2626';
const antennae = (g: Ctx, x: number, y: number, f: number, a = 0) => {
  g.save(); g.translate(x, y); g.rotate(a);
  for (const [s, ph] of [[-1, 0], [1, 1.3]] as [number, number][]) {
    const tx = s * 8 + Math.sin(f * 0.25 + ph) * 3, ty = -20;
    g.strokeStyle = INK; g.lineWidth = 2.6; g.beginPath(); g.moveTo(s * 3, -2); g.quadraticCurveTo(s * 10, -10, tx, ty); g.stroke();
    g.strokeStyle = dk(SUIT, 0.2); g.lineWidth = 1.2; g.stroke();
    ball(g, tx, ty, 3, RED, 1);
  }
  g.restore();
};
const paintFlea = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr);
  const pose = F.v === 'pose', hang = F.v === 'hang', dive = F.v === 'dive', stuck = F.v === 'stuck';
  if (hang || dive) { B.feet = [-6, 8]; B.lift = [12, 6]; }
  if (stuck) { const k = F.fr % 2; B.feet = [k ? -8 : 2, k ? 6 : -4]; B.lift = [k ? 10 : 2, k ? 2 : 10]; }
  if (pose) B.lean = -3;
  legs(g, B, { col: SUIT, shoe: 'boot', shoeCol: RED });
  const H = handsAt(B, F,
    pose ? [-B.w / 2 - 1, B.hipY - 2] : hang ? [-B.w / 2 - 12, B.shY - 10] : dive ? [-B.w / 2 - 6, B.shY + 14] : stuck ? [-B.w / 2 - 14, B.shY + 2] : [-B.w / 2 - 4, B.shY + 18],
    pose ? [B.w / 2 + 2, B.hipY - 2] : hang ? [B.w / 2 + 6, -2] : dive ? [B.w / 2 + 24, B.shY - 2] : stuck ? [B.w / 2 + 14, B.shY + 2] : [B.w / 2 + 8, B.shY + 16]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: SUIT, hand: RED, w: B.armW + 2 });
  // (the chest padded out to here, the belt, the emblem)
  torso(g, B, SUIT, B.shY - 2, B.hipY + 2, 10);
  g.strokeStyle = dk(SUIT, 0.35); g.lineWidth = 1.2; g.beginPath(); g.moveTo(-8, B.shY + 10); g.quadraticCurveTo(-2, B.shY + 14, 2, B.shY + 9); g.moveTo(4, B.shY + 9); g.quadraticCurveTo(9, B.shY + 14, 13, B.shY + 9); g.stroke();
  px(g, -B.hipW / 2 - 4, B.hipY - 2, B.hipW + 8, 4, '#111827'); px(g, -2, B.hipY - 2, 5, 4, '#FDE047');
  ball(g, 3, B.shY + 18, 5, '#FDE047', 1);
  part(g, () => g.ellipse(3, B.shY + 18, 3, 2, 0, 0, Math.PI * 2), RED, 0, B.shY + 16, 6, 4, 0.6);
  // (the head: the cowl over the top half, white lenses; the performer's square jaw under it)
  if (dead(F)) {
    hairBack(g, B); face(g, B, F, 'open', 'o'); whiskers(g, B); hairTop(g, B);
    // (the cowl and its antennae off, lying by him)
    g.save(); g.translate(B.hx + 34, -8); g.rotate(1.3); part(g, () => g.ellipse(0, 0, 9, 7, 0, Math.PI, 0), SUIT, -9, -7, 18, 7, 1); antennae(g, 0, -4, 0, 0); g.restore();
  } else {
    face(g, B, F, pose ? 'smug' : hang ? 'angry' : 'open', pose ? 'grin' : dive ? 'teeth' : stuck ? 'o' : 'grin');
    whiskers(g, B);
    part(g, () => { g.moveTo(B.hx - B.rx - 1, B.hy + 1); g.quadraticCurveTo(B.hx - B.rx, B.hy - B.ry - 2, B.hx, B.hy - B.ry - 1); g.quadraticCurveTo(B.hx + B.rx + 1, B.hy - B.ry, B.hx + B.rx + 1, B.hy + 1); g.lineTo(B.hx + 7, B.hy + 1); g.lineTo(B.hx - 4, B.hy + 3); g.closePath(); }, SUIT, B.hx - B.rx - 1, B.hy - B.ry - 2, B.rx * 2 + 2, B.ry + 5, 1.1);
    part(g, () => g.ellipse(B.hx + 4, B.hy - 2, 3, 2.2, 0, 0, Math.PI * 2), '#F8FAFC', B.hx + 1, B.hy - 4, 6, 4.4, 0.8);
    antennae(g, B.hx, B.hy - B.ry, F.fr + (F.seed % 7), 0);
  }
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: SUIT, hand: RED, w: B.armW + 2 });
};
export const drawFlea = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const st = e.aiState ?? '';
  const v = ['pose', 'hang', 'dive', 'stuck'].includes(st) ? st : '';
  const F = frameFor(e, f, seed, st === 'pose' ? 'tell' : st === 'hang' || st === 'dive' ? 'fly' : st === 'stuck' ? 'stun' : moving(e), v);
  c.save();
  // (diving: tipped over along the dive, fist leading; stuck: upside down, head in the street, legs kicking)
  if (st === 'dive' && e.health > 0) { const a = Math.atan2(e.vel.y, Math.abs(e.vel.x) + 0.01); c.translate(0, -40); c.rotate(a); c.translate(0, 40); }
  else if (st === 'stuck' && e.health > 0) { c.translate(0, -84); c.scale(1, -1); c.translate(0, -2); }
  else if (st === 'hang' && e.health > 0) { c.translate(0, -4); c.rotate(0.3); }
  putFrame(c, 'ct-flea', { ...F, fr: st === 'stuck' ? Math.floor(f / 5) % 2 : F.fr }, BOX, g => paintFlea(g, { ...F, fr: st === 'stuck' ? Math.floor(f / 5) % 2 : F.fr }));
  c.restore();
  // (stuck: dust and a few stars round the hole he's in)
  if (st === 'stuck' && e.health > 0) for (let i = 0; i < 3; i++) { const a = f * 0.25 + (i / 3) * Math.PI * 2; c.fillStyle = INK; c.fillRect(Math.round(Math.cos(a) * 16) - 2, -6 + Math.round(Math.sin(a) * 4) - 2, 5, 5); c.fillStyle = '#FDE047'; c.fillRect(Math.round(Math.cos(a) * 16) - 1, -6 + Math.round(Math.sin(a) * 4) - 1, 3, 3); }
};

// ---------------------------------------------------------------------------------------------------------------
// The churro vendor

const STRIPE = '#DC2626', APRON = '#F8FAFC';
/** A churro: ridged, sugared. */
const churroStick = (g: Ctx, x: number, y: number, a: number, len = 26) => {
  g.save(); g.translate(x, y); g.rotate(a);
  part(g, () => g.roundRect(-2, -3, len, 6, 3), '#C2853F', -2, -3, len, 6, 1);
  g.strokeStyle = '#8B5A2B'; g.lineWidth = 0.8; for (let k = 2; k < len - 2; k += 4) { g.beginPath(); g.moveTo(k, -3); g.lineTo(k + 2, 3); g.stroke(); }
  for (let k = 0; k < 5; k++) px(g, 2 + k * 4, -2, 1, 1, '#FFF7ED');
  g.restore();
};
/** The cart, in front of him (its back edge at x): a striped awning on two poles, the box, two wheels, a big churro
 *  painted on its side; tipped over on its side (dead). */
const cart = (g: Ctx, x: number, f: number, tipped: boolean, squeak: boolean) => {
  g.save(); g.translate(x, 0);
  if (tipped) { g.translate(30, 0); g.rotate(1.35); g.translate(-30, -4); }
  for (const wx of [10, 44]) { ball(g, wx, -7, 7, '#3F3F46', 1); ball(g, wx, -7, 2.5, '#D4D4D8', 0); }
  if (squeak) { px(g, 8 + (f % 2), -16, 2, 2, '#FFFFFF'); }
  part(g, () => g.rect(0, -42, 54, 30), '#FDE68A', 0, -42, 54, 30, 1.2);
  px(g, 0, -20, 54, 4, '#B45309');
  // (a big churro painted on its side, a sugar sparkle)
  g.save(); g.translate(8, -30); g.rotate(-0.15); part(g, () => g.roundRect(0, -4, 38, 8, 4), '#C2853F', 0, -4, 38, 8, 1); g.restore();
  for (let k = 0; k < 4; k++) px(g, 12 + k * 8, -36, 2, 2, '#FFFFFF');
  // (the awning on its poles)
  for (const pxx of [3, 51]) { limb(g, pxx, -42, pxx, -76, 2.5, '#D4D4D8'); }
  g.save(); g.beginPath(); g.moveTo(-6, -74); g.lineTo(60, -74); g.lineTo(56, -84); g.lineTo(-2, -84); g.closePath(); g.clip();
  for (let k = -6; k < 62; k += 10) px(g, k, -86, 5, 14, '#EF4444'); for (let k = -1; k < 62; k += 10) px(g, k, -86, 5, 14, '#FFFFFF');
  g.restore();
  g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-6, -74); g.lineTo(60, -74); g.lineTo(56, -84); g.lineTo(-2, -84); g.closePath(); g.stroke();
  for (let k = -6; k < 60; k += 11) { g.fillStyle = k % 2 ? '#EF4444' : '#FFFFFF'; g.beginPath(); g.arc(k + 5.5, -74, 5.5, 0, Math.PI); g.fill(); g.strokeStyle = INK; g.lineWidth = 0.8; g.stroke(); }
  g.restore();
};
const paintChurro = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const sugar = F.v === 'sugar', push = F.v === 'push' || F.v === 'ram', winded = F.v === 'winded', throwing = F.v === 'throw';
  const cartX = B.w / 2 + 14;
  if (push) B.lean = 5;
  if (winded) B.lean = 7;
  // (the cart: in front, unless he's dead (tipped over beside him) or knocked about)
  const held = !!B.held;
  if (dead(F)) cart(g, cartX + 6, F.fr, true, false);
  legs(g, B, { col: '#1F2937', shoe: 'shoe', shoeCol: '#18181B' });
  const H = handsAt(B, F,
    sugar ? [B.w / 2 - 2, B.shY + 12] : [-B.w / 2 - 4, B.shY + 18],
    sugar ? [B.w / 2 + 8, B.shY + 2 + (F.fr % 2) * 3] : throwing ? [B.w / 2 + 18, B.shY - 6] : push || !held ? [cartX - 2 + (push ? 3 : 0), B.shY + 22 + (winded ? 6 : 0)] : [B.w / 2 + 8, B.shY + 16]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: '#FFFFFF', hand: L.skin, len: 0.45 });
  torso(g, B, '#FFFFFF');
  g.save(); g.beginPath(); g.rect(-B.w / 2 - 2, B.shY, B.w + 6, B.hipY - B.shY + 3); g.clip();
  for (let y = B.shY + 2; y < B.hipY + 3; y += 5) px(g, -B.w / 2 - 2, y, B.w + 6, 2, STRIPE);
  g.restore();
  // (the apron, chest to knees, a sugar smear)
  part(g, () => { g.moveTo(-B.w / 2 + 3, B.shY + 8); g.lineTo(B.w / 2 - 1, B.shY + 8); g.lineTo(B.w / 2 + 3, -16); g.lineTo(-B.w / 2 - 1, -16); g.closePath(); }, APRON, -B.w / 2 - 1, B.shY + 8, B.w + 4, -24 - B.shY);
  px(g, -2, B.shY + 20, 6, 3, '#E7B676');
  hairBack(g, B);
  face(g, B, F, sugar ? 'smug' : push ? 'angry' : winded ? 'tired' : 'open', sugar ? 'grin' : push ? 'teeth' : winded ? 'o' : 'smile');
  whiskers(g, B); glasses(g, B);
  hairTop(g, B);
  // (the paper hat (dead: off))
  const hat = (x: number, y: number, a: number) => { g.save(); g.translate(x, y); g.rotate(a); part(g, () => { g.moveTo(-10, 0); g.lineTo(10, 0); g.lineTo(6, -7); g.lineTo(-7, -7); g.closePath(); }, '#FFFFFF', -10, -7, 20, 7, 1); px(g, -9, -2, 18, 2, STRIPE); g.restore(); };
  if (dead(F)) hat(B.hx - 30, -2, -0.3); else hat(B.hx, B.hy - 8, -0.08);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: '#FFFFFF', hand: L.skin, len: 0.45 });
  // (the sugar bag, the churro shaking in it; the churro cocked back to throw)
  if (sugar && !H.held) { part(g, () => g.rect(H.near[0] - 6, H.near[1] - 6, 12, 14), '#F5F5F4', H.near[0] - 6, H.near[1] - 6, 12, 14, 1); churroStick(g, H.near[0], H.near[1] - 6, -1.4, 20); }
  if (throwing && !H.held) churroStick(g, H.near[0], H.near[1], -0.4);
  // (the cart in front of him, his hands on its handle)
  if (!dead(F) && !held) {
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(cartX - 2, B.shY + 22 + (winded ? 6 : 0)); g.lineTo(cartX + 2, -42); g.stroke();
    g.strokeStyle = '#A1A1AA'; g.lineWidth = 1.5; g.stroke();
    cart(g, cartX + 2, F.fr, false, push);
  }
};
export const drawChurro = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const st = e.aiState ?? '';
  const v = st === 'sugar' ? 'sugar' : st === 'pushWind' ? 'push' : st === 'ram' ? 'ram' : st === 'winded' ? 'winded' : st === 'after' || st === 'throw2' ? 'throw' : '';
  const F = frameFor(e, f, seed, poseOf(e, ['sugar', 'pushWind'], ['ram']), v);
  putFrame(c, 'ct-churro', { ...F, fr: st === 'pushWind' || st === 'ram' ? Math.floor(f / 3) % 2 : F.fr }, BOX, g => paintChurro(g, { ...F, fr: st === 'pushWind' || st === 'ram' ? Math.floor(f / 3) % 2 : F.fr }));
};

// ---------------------------------------------------------------------------------------------------------------
// Gloppy (drawn as he goes)

const GLOP = '#65D11B', GLOP_DK = '#3F8A0E', GLOP_LT = '#B5F05A';
const blob = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string, rot = 0) => {
  c.fillStyle = INK; c.beginPath(); c.ellipse(x, y, rx + 1.8, ry + 1.8, rot, 0, Math.PI * 2); c.fill();
  c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), rot, 0, Math.PI * 2); c.fill();
};
const performerFace = (c: Ctx, e: Enemy, x: number, y: number, r: number, md: 'ok' | 'hurt' | 'dead', puff: boolean) => {
  const L = lookOf(Math.abs(Math.round(e.initialX || 0)) + (e.variant ?? 0) * 31);
  c.fillStyle = INK; c.beginPath(); c.ellipse(x, y, r + (puff ? 3 : 0) + 2, r * 0.8 + 2, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = L.skin; c.beginPath(); c.ellipse(x, y, r + (puff ? 3 : 0), r * 0.8, 0, 0, Math.PI * 2); c.fill();
  const b = (bx: number, by: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(bx), Math.round(by), w, h); };
  if (md === 'dead') { b(x - 5, y - 3, 3, 1, INK); b(x - 4, y - 4, 1, 3, INK); b(x + 2, y - 3, 3, 1, INK); b(x + 3, y - 4, 1, 3, INK); }
  else if (md === 'hurt') { b(x - 5, y - 2, 3, 1, INK); b(x + 2, y - 2, 3, 1, INK); }
  else { b(x - 5, y - 4, 3, 3, INK); b(x + 2, y - 4, 3, 3, INK); }
  if (puff) { c.fillStyle = dk(L.skin, 0.12); c.beginPath(); c.arc(x - r, y + 1, 3, 0, Math.PI * 2); c.arc(x + r + 1, y + 1, 3, 0, Math.PI * 2); c.fill(); b(x - 2, y + 2, 5, 2, INK); }
  else b(x - 3, y + 3, 7, md === 'ok' ? 2 : 3, INK);
  b(x + r - 3, y - r * 0.5, 2, 3, '#BFE8FF');
};
export const drawGloppy = (c: Ctx, e: Enemy, f: number) => {
  const r = reaction(e), md = r?.md ?? moodOf(e), isDead = md === 'dead';
  const pose = r?.pose ?? (e.aiState === 'hock' ? 'tell' : moving(e));
  const isFlat = pose === 'limp' || (isDead && !r);
  const hock = e.aiState === 'hock', bump = e.aiState === 'bumpWind', bumped = e.aiState === 'bump';
  const seed = Math.abs(Math.round(e.initialX || 0));
  c.save();
  if (isFlat) { c.translate(0, -2); c.rotate(-Math.PI / 2 + 0.05); c.translate(-40, -12); }
  else if (pose === 'thrown') c.rotate(Math.sin(f * 0.6) * 0.3);
  if (bump) c.rotate(-0.12);
  if (bumped) c.translate(6, 0);
  const walk = pose === 'walk' ? Math.sin(f * 0.3) * 4 : 0, wob = Math.sin(f * 0.15) * 1.5;
  // (the stubby legs, the green feet)
  blob(c, -12 - walk, -8, 11, 9, GLOP_DK); blob(c, 14 + walk, -8, 11, 9, GLOP);
  // (the far arm: a drippy stub)
  blob(c, -30, -48 + wob, 9, 15, GLOP_DK, 0.4);
  // (the body: a big lump, lighter down the left, drips off it)
  blob(c, 0, -46, 30 + (hock ? 2 : 0), 34 + wob, GLOP);
  c.fillStyle = GLOP_LT; c.beginPath(); c.ellipse(-12, -58, 9, 14, -0.3, 0, Math.PI * 2); c.fill();
  c.fillStyle = GLOP_DK; c.beginPath(); c.ellipse(16, -36, 9, 16, 0.2, 0, Math.PI * 2); c.fill();
  for (let i = 0; i < 4; i++) { const dx = -20 + i * 13, len = 6 + ((f / 4 + i * 7 + seed) % 14); c.fillStyle = INK; c.fillRect(dx - 2, -16, 6, len + 1); c.fillStyle = GLOP; c.fillRect(dx - 1, -16, 4, len); c.beginPath(); c.arc(dx + 1, -16 + len, 3, 0, Math.PI * 2); c.fill(); }
  // (the head: the top lump, its eye stalks (or off, lying by him: dead), the mouth hole with the performer in it)
  if (isDead) {
    blob(c, 52, -14, 18, 12, GLOP);
    performerFace(c, e, 2, -84, 9, 'dead', false);
    c.fillStyle = lookOf(seed).hair; c.fillRect(-7, -96, 16, 4);
  } else {
    const hy = -78 + wob;
    blob(c, 0, hy, 24, 18, GLOP);
    c.fillStyle = GLOP_LT; c.beginPath(); c.ellipse(-8, hy - 8, 8, 5, -0.3, 0, Math.PI * 2); c.fill();
    for (const [sx, ph] of [[-10, 0], [10, 1.7]] as [number, number][]) {
      const ex = sx + Math.sin(f * 0.12 + ph) * 4, ey = hy - 30;
      c.strokeStyle = INK; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(sx * 0.6, hy - 12); c.quadraticCurveTo(sx * 1.2, hy - 22, ex, ey); c.stroke();
      c.strokeStyle = GLOP; c.lineWidth = 3.5; c.stroke();
      c.fillStyle = INK; c.beginPath(); c.arc(ex, ey, 7, 0, Math.PI * 2); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(ex, ey, 5.8, 0, Math.PI * 2); c.fill();
      const a = f * 0.25 + ph * 2; c.fillStyle = INK; c.beginPath(); c.arc(ex + Math.cos(a) * 2.5, ey + Math.sin(a) * 2.5, 2.4, 0, Math.PI * 2); c.fill();
    }
    // (the mouth hole: the performer's face in there, cheeks puffed in the tell; a string of drool)
    c.fillStyle = INK; c.beginPath(); c.ellipse(4, hy + 4, 15, 11, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#7F1D1D'; c.beginPath(); c.ellipse(4, hy + 4, 13, 9, 0, 0, Math.PI * 2); c.fill();
    performerFace(c, e, 4, hy + 4, 8, md === 'hurt' ? 'hurt' : 'ok', hock);
    c.fillStyle = GLOP_LT; c.fillRect(14, hy + 12, 3, 6 + (f % 30) * 0.4);
  }
  // (the near arm: up in the bump, a hand at his mouth in the hock)
  const ax = hock ? 18 : bump ? 34 : 30, ay = hock ? -70 : bump ? -58 : -46 + wob;
  blob(c, ax, ay, 10, 15, GLOP, hock ? -0.8 : 0.5);
  c.restore();
};
