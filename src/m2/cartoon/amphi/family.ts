// STUPID DAD's TV family on the live show: CHEAP ANIMATRONICS (the user's) on the tapes of the dead actors' voices, each
// one done up as the show drew them (bigkid/art.ts dadArt's family: MOM's big brown perm, pearls and pink sweater; THE
// BOY's buzz cut and striped shirt; SIS's ponytail and braces; GRAMPS bald in his cardigan and glasses). Stiff, jerky,
// wrong: waxy plastic skin too shiny under the lights, a ventriloquist's seam each side of the chin (the jaw drops as a
// block on the tape's words and sometimes when there aren't any), glass eyes that don't track together, wigs on a bit
// crooked, a bolt in the neck, a cable out the back to the floor; everything moves in steps (eight frames a pose).
// Glitching (the intro: the show's stopped and they haven't): heads ticking round, eyes spinning, sparks at the neck,
// the arm's loop at triple time. Off (the show's over: a revisit): slumped, heads down, jaws hanging, eyes dark.
//
// Each is drawn about its feet's point (the floor under it), facing left, at STUPID DAD's scale.

import { mix } from '../kit';
import { DAD_K } from './dad';
import { type Ctx, type Ramp, rampOf, rampMix, shape, shapeTop, ell, px, line, limb, fill, sparks } from './paint';

export type Mode = 'run' | 'glitch' | 'off';
export interface Anim { mode: Mode; f: number; talking: boolean }

const WAX: Ramp = ['#FFF0E2', '#F4CFB2', '#DCAC8C', '#B8876C', '#5E3A2A'];
const SWEATER = rampOf('#F472B6'), PERM = rampOf('#8A4A1C'), PEARL = '#FBF7EE';
const SHIRT = rampOf('#F4F1EA'), SHIRT_STRIPE = '#D63A3A', JEANS = rampOf('#3B5EA8');
const CARDIGAN = rampOf('#8A6A3A'), SLACKS = rampOf('#6B6F7A'), RECLINER = rampOf('#5E7A3E');
const SIS_TOP = rampOf('#65A30D'), SIS_HAIR = rampOf('#C2873A'), DENIM = rampOf('#4A6FB8');
const BOLT = '#9AA0A8', CABLE = '#1C1C1C';

/** Everything steps eight frames at a time (cheap servos). */
const stepF = (f: number, n = 8) => Math.floor(f / n) * n;
const offRamp = (r: Ramp, a: Anim): Ramp => (a.mode === 'off' ? rampMix(r, '#3A3A48', 0.28) : r);

/** A waxy animatronic face: the head's middle at (hx, hy), r its size; the glass eyes (one off), the seam, the jaw. */
const face = (c: Ctx, hx: number, hy: number, r: number, a: Anim, o: { cheeks?: string; braces?: boolean; freckles?: boolean; glasses?: boolean; smile?: boolean; seed: number }) => {
  const W = offRamp(WAX, a), f = stepF(a.f, 6);
  shape(c, () => c.ellipse(hx, hy, r, r * 1.06, 0, 0, Math.PI * 2), W, hx - r, hx + r);
  // (the shine: too much of it; the mask's seam round the face's edge; a chip in the paint showing the gray under)
  ell(c, hx - r * 0.35, hy - r * 0.45, r * 0.32, r * 0.16, 'rgba(255,255,255,0.55)', -0.4);
  c.strokeStyle = W[3]; c.lineWidth = 0.5; c.beginPath(); c.ellipse(hx - r * 0.12, hy + r * 0.05, r * 0.82, r * 0.9, 0, Math.PI * 0.55, Math.PI * 1.45); c.stroke();
  px(c, hx + r * 0.42, hy - r * 0.5, 2, 1.4, '#9A9AA4'); px(c, hx + r * 0.42, hy - r * 0.5 + 1.4, 2, 0.5, W[4]);
  if (o.cheeks && a.mode !== 'off') ell(c, hx - r * 0.5, hy + r * 0.25, r * 0.22, r * 0.14, o.cheeks);
  if (o.freckles) for (let k = 0; k < 5; k++) px(c, hx - r * 0.7 + k * r * 0.18, hy + r * 0.1 + (k % 2), 0.8, 0.8, '#B5774E');
  // (the glass eyes: big, round, a fixed stare; the far one off on its own (it never looks where the near one does))
  const eyeL = [hx - r * 0.55, hy - r * 0.12], eyeR = [hx + r * 0.05, hy - r * 0.14];
  for (const [i, [ex, ey]] of [eyeL, eyeR].entries()) {
    ell(c, ex, ey, r * 0.2, r * 0.22, a.mode === 'off' ? '#9A9A9A' : '#FBFBF8');
    if (a.mode === 'off') { line(c, [ex - r * 0.2, ey, ex + r * 0.2, ey], 0.8, W[4]); continue; }
    const spin = a.mode === 'glitch' ? f * 0.6 + i * 2 : 0;
    const look = i === 0 ? [-0.6, 0] : [0.3 + Math.sin(o.seed + stepF(a.f, 50) * 0.13) * 0.5, -0.4];
    const lx = spin ? Math.cos(spin) * 0.6 : look[0], ly = spin ? Math.sin(spin) * 0.6 : look[1];
    ell(c, ex + lx * r * 0.08, ey + ly * r * 0.08, r * 0.1, r * 0.1, '#2A4A6A'); px(c, ex + lx * r * 0.08 - 0.5, ey + ly * r * 0.08 - 0.5, 1, 1, '#000000');
    px(c, ex - r * 0.1, ey - r * 0.12, 1, 1, '#FFFFFF');
  }
  // (a snap blink now and then: the lids drop as one and come back up)
  if (a.mode === 'run' && (a.f + o.seed * 31) % 140 < 6) for (const [ex, ey] of [eyeL, eyeR]) ell(c, ex, ey, r * 0.22, r * 0.24, W[2]);
  if (o.glasses) for (const [ex, ey] of [eyeL, eyeR]) { c.strokeStyle = '#2A2A2A'; c.lineWidth = 1; c.strokeRect(ex - r * 0.26, ey - r * 0.22, r * 0.52, r * 0.44); }
  // (the nose, a painted dab)
  ell(c, hx - r * 0.42, hy + r * 0.2, r * 0.12, r * 0.09, W[2]);
  // (the jaw: a block on hinges either side, the seam lines, down when the tape's talking; hanging, off)
  const open = a.mode === 'off' ? 0.7 : a.talking ? [0, 0.7, 0.35, 0.9][Math.floor(a.f / 4) % 4] : a.mode === 'glitch' ? (Math.floor(a.f / 3) % 2) * 0.8 : 0;
  const jy = hy + r * 0.48, jw = r * 0.6, drop = open * r * 0.32;
  line(c, [hx - r * 0.62, hy + r * 0.32, hx - r * 0.62, jy + r * 0.38 + drop], 0.7, W[4]);
  line(c, [hx - r * 0.02, hy + r * 0.32, hx - r * 0.02, jy + r * 0.38 + drop], 0.7, W[4]);
  if (drop > 0.5) { px(c, hx - r * 0.6, jy, jw - 1, drop, '#2A0E0E'); if (o.braces) px(c, hx - r * 0.58, jy, jw - 2, 1, '#C9CDD4'); }
  const smile = o.smile !== false;
  if (smile) { c.strokeStyle = W[4]; c.lineWidth = 0.9; c.beginPath(); c.arc(hx - r * 0.32, jy - r * 0.06 + drop * 0.3, r * 0.22, 0.2, Math.PI - 0.2); c.stroke(); }
  else line(c, [hx - r * 0.52, jy, hx - r * 0.1, jy], 0.9, W[4]);
  px(c, hx - r * 0.6, jy + drop, jw - 1, 0.8, W[2]);
  if (o.braces && smile && drop < 0.5) px(c, hx - r * 0.5, jy - r * 0.04, r * 0.36, 0.8, '#C9CDD4');
};
/** A hobby servo showing where the skin doesn't cover it: a gray case, its label, the horn on top ticking round in
 *  steps, two wires off it. */
const SERVO: Ramp = ['#C4C8D0', '#9AA0AA', '#787E88', '#5A5E66', '#22262C'];
const servo = (c: Ctx, x: number, y: number, a: Anim, seed: number) => {
  shape(c, () => c.rect(x - 3.4, y - 2.4, 6.8, 4.8), SERVO, x - 3.4, x + 3.4, 0.6);
  px(c, x - 2.6, y - 0.6, 3.6, 1.2, '#E8E4D8');
  const turn = a.mode === 'off' ? 0 : (Math.floor((a.f + seed * 7) / (a.mode === 'glitch' ? 3 : 8)) % 4) * (Math.PI / 4);
  line(c, [x + 1.6, y - 2.6, x + 1.6 + Math.cos(turn) * 2.4, y - 2.6 + Math.sin(turn) * 1.2], 0.9, '#F4F4F0');
  line(c, [x - 3.4, y + 1.6, x - 5.4, y + 4], 0.5, '#C83A3A'); line(c, [x - 3.4, y + 2, x - 5, y + 4.6], 0.5, '#1A1A1A');
};
/** The bolt in the neck, the gap round the neck where the skin stops (the steel rod in it), the cable out the back
 *  (down to the floor), sparks off it glitching. */
const hardware = (c: Ctx, nx: number, ny: number, a: Anim, floorDy: number) => {
  px(c, nx - 9, ny - 1, 8, 2.4, '#1A1416'); px(c, nx - 6, ny - 1, 2, 2.4, SERVO[1]); px(c, nx - 6, ny - 1, 0.6, 2.4, SERVO[0]);
  ell(c, nx, ny, 1.8, 1.8, BOLT); px(c, nx - 0.6, ny - 1.4, 1.2, 2.8, '#5A5E66'); px(c, nx - 1, ny - 1.2, 0.6, 0.6, '#E8ECF2');
  c.strokeStyle = CABLE; c.lineWidth = 1.4; c.beginPath(); c.moveTo(nx + 3, ny + 2); c.quadraticCurveTo(nx + 14, ny + floorDy * 0.5, nx + 10, ny + floorDy); c.stroke();
  c.strokeStyle = '#3A3A44'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(nx + 2.6, ny + 1.6); c.quadraticCurveTo(nx + 13.4, ny + floorDy * 0.5, nx + 9.4, ny + floorDy); c.stroke();
  px(c, nx + 8, ny + floorDy * 0.6, 4, 2.4, '#C8B048');
  if (a.mode === 'glitch' && (a.f % 9) < 4) sparks(c, nx + 1, ny, a.f);
};
/** A glitching head's tick (a jolt off to one side, held, then snapped back), or the slump's droop. */
const headTurn = (a: Anim, seed: number) => (a.mode === 'off' ? 0.5 : a.mode === 'glitch' ? [0, 0.6, -0.4, 1.4, 0, -0.9, 2.6, 0.2][((Math.floor((a.f + seed * 5) / 7) % 8) + 8) % 8] : 0);

// ---------------------------------------------------------------------------------------------------------------

/** MOM: behind the couch, the casserole up in her oven mitts and down again; the perm, the pearls. */
export const drawMom = (c: Ctx, x: number, floorY: number, a: Anim) => {
  c.save(); c.translate(Math.round(x), Math.round(floorY)); c.scale(DAD_K, DAD_K);
  const f = stepF(a.f, a.mode === 'glitch' ? 3 : 8), off = a.mode === 'off';
  const lift = off ? -14 : Math.sin(f * (a.mode === 'glitch' ? 0.6 : 0.05)) * 8;
  // (the cable to the floor, the legs: a skirt, stiff legs on a post)
  px(c, -3, -46, 6, 46, '#3A3A3A');
  shape(c, () => { c.moveTo(-16, -48); c.lineTo(16, -48); c.lineTo(20, -18); c.lineTo(-20, -18); c.closePath(); }, offRamp(rampOf('#7C3A6A'), a), -20, 20);
  // (the sweater, the pearls)
  shape(c, () => { c.moveTo(-18, -86); c.quadraticCurveTo(0, -92, 18, -86); c.lineTo(17, -46); c.lineTo(-17, -46); c.closePath(); }, offRamp(SWEATER, a), -18, 18);
  for (let k = 0; k < 7; k++) ell(c, -9 + k * 2.8, -84 + Math.sin(k * 0.6) * 3, 1.3, 1.3, PEARL);
  // (the arms, out stiff, the oven mitts and the casserole)
  const hy = -64 + lift;
  for (const s of [-1, 1]) limb(c, s * 15, -82, 4.4, s * 10 - 12, hy, 3.8, offRamp(SWEATER, a));
  shape(c, () => c.roundRect(-30, hy - 7, 30, 10, 3), ['#F2E6D0', '#E4D2AE', '#C9B48A', '#A89268', '#5A4A2A'], -30, 0);
  px(c, -28, hy - 8, 26, 2, off ? '#5A3A1A' : '#9A5A2A'); ell(c, -15, hy - 9, 8, 2, off ? '#6A3A2A' : '#C24A2A'); px(c, -20, hy - 10, 3, 1, '#F2C94C');
  for (const s of [-1, 1]) { ell(c, -15 + s * 15, hy - 2, 5, 4, '#3F7A4A'); ell(c, -16 + s * 15, hy - 3, 2.4, 1.6, '#6AA874'); for (let k = 0; k < 3; k++) px(c, -18 + s * 15 + k * 2.4, hy - 1, 0.6, 2, '#2E5A36'); }
  // (the elbows' servos, where the sweater's split at the seam)
  for (const s of [-1, 1]) servo(c, s * 12 - 6, (-82 + hy) / 2, a, s + 2);
  // (the head: the perm, a wig on a bit crooked; her face)
  c.save(); c.translate(0, -100); c.rotate(headTurn(a, 1) * 0.4);
  for (let k = 0; k < 11; k++) { const a2 = (k / 11) * Math.PI * 2; shapeTop(c, () => c.ellipse(Math.cos(a2) * 13 + 2, Math.sin(a2) * 12 - 4, 7, 7, 0, 0, Math.PI * 2), offRamp(PERM, a), -24, 14, 0.8); }
  face(c, -1, 2, 11, a, { cheeks: '#F49AB0', seed: 1 });
  shapeTop(c, () => { c.moveTo(-12, -6); c.quadraticCurveTo(-4, -18, 12, -10); c.lineTo(10, -4); c.quadraticCurveTo(0, -10, -10, -2); c.closePath(); }, offRamp(PERM, a), -18, -2, 0.8);
  c.restore();
  hardware(c, 4, -88, a, 80);
  c.restore();
};

/** GRAMPS: in his recliner (green vinyl, a duct-tape patch), the newspaper in his lap; nodding off and jerking awake. */
export const drawGramps = (c: Ctx, x: number, floorY: number, a: Anim) => {
  c.save(); c.translate(Math.round(x), Math.round(floorY)); c.scale(DAD_K, DAD_K);
  const f = stepF(a.f, a.mode === 'glitch' ? 3 : 10), off = a.mode === 'off';
  const R = offRamp(RECLINER, a);
  // (the recliner: the back tipped, the seat, the footrest up, the arms)
  shape(c, () => { c.moveTo(4, -28); c.lineTo(30, -104); c.quadraticCurveTo(42, -108, 44, -96); c.lineTo(26, -26); c.closePath(); }, R, 4, 44);
  shapeTop(c, () => c.roundRect(-30, -36, 56, 14, 5), R, -36, -22);
  shape(c, () => c.roundRect(-58, -34, 28, 10, 3), R, -58, -30);
  px(c, -10, -22, 34, 22, R[3]); px(c, -46, -24, 4, 24, R[4]);
  shape(c, () => c.rect(28, -84, 10, 10), ['#D8D8D0', '#BDBDB4', '#A0A098', '#80807A', '#40403C'], 28, 38);
  shape(c, () => c.roundRect(-26, -54, 40, 12, 4), R, -26, 14);
  // (the duct-tape patch on the back, the motor box under the seat, its label)
  px(c, 30, -70, 9, 8, '#B4B8C0'); px(c, 30, -70, 9, 1.4, '#D4D8E0'); px(c, 31, -66, 7, 0.6, '#8A8E96');
  shape(c, () => c.rect(-6, -22, 22, 14), SERVO, -6, 16, 0.6); px(c, -3, -18, 12, 3, '#E8E4D8'); px(c, -2, -17, 6, 1, '#C83A3A');
  // (him: slacks out along the footrest, the cardigan, the newspaper)
  limb(c, -6, -38, 6, -48, -38, 4.6, offRamp(SLACKS, a)); limb(c, 0, -42, 6, -46, -44, 4.6, offRamp(SLACKS, a));
  for (const fy of [-40, -46]) shape(c, () => c.roundRect(-58, fy - 3, 10, 6, 2), ['#6A4A2A', '#4A321C', '#3A2614', '#2A1A0E', '#120A04'], -58, -48);
  shape(c, () => { c.moveTo(-8, -40); c.lineTo(20, -40); c.lineTo(26, -82); c.quadraticCurveTo(10, -90, -4, -82); c.closePath(); }, offRamp(CARDIGAN, a), -8, 26);
  for (let k = 0; k < 4; k++) ell(c, 6, -76 + k * 9, 1.2, 1.2, '#E8D8B0');
  shape(c, () => { c.moveTo(-22, -46); c.lineTo(4, -44); c.lineTo(2, -60); c.lineTo(-20, -62); c.closePath(); }, ['#FFFFFF', '#EDEAE0', '#D4D0C2', '#B0AC9E', '#6A665A'], -22, 4, 0.8);
  for (let k = 0; k < 4; k++) px(c, -18, -58 + k * 3, 16, 0.8, '#8A8678');
  for (const s of [-1, 1]) limb(c, s * 6 + 6, -78, 4, -10 + s * 4, -50, 3.4, offRamp(CARDIGAN, a));
  // (the head: bald, white tufts over the ears, the glasses; nodding, jerking up)
  const nod = off ? 0.9 : a.mode === 'glitch' ? headTurn(a, 3) : (f % 200 < 150 ? Math.min(0.5, (f % 200) / 260) : -0.1);
  c.save(); c.translate(10, -92); c.rotate(-nod * 0.7);
  face(c, 0, 0, 11, a, { glasses: true, seed: 3, smile: false });
  for (const s of [-1, 1]) fill(c, '#F4F4F0', () => c.ellipse(s * 10 + 3, -2, 3.4, 4, 0, 0, Math.PI * 2));
  ell(c, 2, -9, 2, 1.4, '#C99474');
  c.restore();
  hardware(c, 16, -82, a, 74);
  if (a.mode === 'run' && f % 200 > 40 && f % 200 < 150 && !a.talking) { for (let k = 0; k < 3; k++) px(c, 20 + k * 5, -112 - k * 6 - ((a.f / 6) % 6), 3, 3, '#E8E8F0'); }
  c.restore();
};

/** SIS: cross-legged on the rug in front of the couch, facing the TV; turning round to say her line, braces. */
export const drawSis = (c: Ctx, x: number, floorY: number, a: Anim) => {
  c.save(); c.translate(Math.round(x), Math.round(floorY)); c.scale(DAD_K, DAD_K);
  const off = a.mode === 'off';
  // (crossed legs, the jeans, the sneakers)
  shapeTop(c, () => c.ellipse(0, -6, 24, 7, 0, 0, Math.PI * 2), offRamp(DENIM, a), -13, 1);
  for (const s of [-1, 1]) shape(c, () => c.roundRect(s * 18 - 5, -8, 10, 6, 2), ['#FFFFFF', '#F0F0F0', '#D4D4D4', '#A8A8A8', '#4A4A4A'], s * 18 - 5, s * 18 + 5);
  // (the top: lime green, a smiley on it; the arms round her knees)
  shape(c, () => { c.moveTo(-12, -10); c.lineTo(12, -10); c.lineTo(10, -40); c.quadraticCurveTo(0, -46, -10, -40); c.closePath(); }, offRamp(SIS_TOP, a), -12, 12);
  ell(c, 0, -26, 4, 4, '#FDE047'); px(c, -1.6, -27.4, 1, 1, '#1A1A1A'); px(c, 0.8, -27.4, 1, 1, '#1A1A1A');
  for (const s of [-1, 1]) limb(c, s * 9, -38, 3.4, s * 14, -14, 3, offRamp(SIS_TOP, a));
  // (the near hand's skin split, the steel fingers showing; a servo at the shoulder through a torn seam)
  px(c, -16, -16, 4, 3, SERVO[2]); for (let k = 0; k < 3; k++) px(c, -17 + k * 1.4, -14, 0.8, 2.4, SERVO[0]);
  servo(c, 8, -36, a, 9);
  // (the head: turned to the TV, round to her dad on her line; the ponytail swinging in steps)
  const turn = off ? 0.6 : a.talking ? -0.5 : headTurn(a, 7) * 0.3;
  c.save(); c.translate(0, -54); c.rotate(turn * 0.4); if (a.talking && !off) c.scale(-1, 1);
  const swing = Math.sin(stepF(a.f, 8) * 0.08) * 4;
  limb(c, 9, -6, 3.4, 18 + swing, 8, 2.4, offRamp(SIS_HAIR, a));
  fill(c, '#EC4899', () => c.ellipse(10, -5, 2.4, 2, 0, 0, Math.PI * 2));
  face(c, 0, 0, 10, a, { braces: true, freckles: true, seed: 7, smile: !a.talking });
  shapeTop(c, () => { c.moveTo(-11, -2); c.quadraticCurveTo(-8, -14, 4, -12); c.quadraticCurveTo(12, -10, 11, 0); c.lineTo(8, -4); c.quadraticCurveTo(0, -10, -9, 0); c.closePath(); }, offRamp(SIS_HAIR, a), -14, 0, 0.8);
  c.restore();
  hardware(c, 6, -44, a, 40);
  c.restore();
};

/** THE BOY: on a little wheeled base on his floor track, the striped shirt, the buzz cut, the fixed grin; `arm` how far
 *  his arm's out (0 down, 1 out with the beer), `beer` whether he's got one. */
export const drawBoy = (c: Ctx, x: number, floorY: number, a: Anim, arm: number, beer: boolean) => {
  c.save(); c.translate(Math.round(x), Math.round(floorY)); c.scale(DAD_K, DAD_K);
  const off = a.mode === 'off';
  // (the base on the track: a gray box on castors, a whip antenna)
  shape(c, () => c.roundRect(-14, -10, 28, 8, 2), ['#B8BCC4', '#8E949E', '#6E747E', '#50565E', '#22262C'], -14, 14);
  for (const s of [-1, 1]) ell(c, s * 9, -2, 2.6, 2.6, '#222222');
  if (a.mode === 'run') px(c, 8, -12, 2, 2, (a.f % 30) < 15 ? '#22C55E' : '#14532D');
  for (let k = 0; k < 4; k++) px(c, -12 + k * 6, -8, 3, 1, '#C8B048'); px(c, -12, -6, 14, 1.2, '#3A3E46');
  // (the legs on their post: jeans, sneakers bolted to the base)
  for (const s of [-1, 1]) { limb(c, s * 5, -46, 5, s * 5, -14, 4.4, offRamp(JEANS, a)); shape(c, () => c.roundRect(s * 5 - 8, -15, 13, 5, 2), ['#FFFFFF', '#F0F0F0', '#D4D4D4', '#A8A8A8', '#4A4A4A'], s * 5 - 8, s * 5 + 5); }
  // (the striped shirt)
  shape(c, () => { c.moveTo(-14, -72); c.quadraticCurveTo(0, -76, 14, -72); c.lineTo(13, -44); c.lineTo(-13, -44); c.closePath(); }, offRamp(SHIRT, a), -14, 14);
  c.save(); c.beginPath(); c.moveTo(-14, -72); c.quadraticCurveTo(0, -76, 14, -72); c.lineTo(13, -44); c.lineTo(-13, -44); c.closePath(); c.clip();
  for (let y = -70; y < -44; y += 6) px(c, -15, y, 30, 3, off ? mix(SHIRT_STRIPE, '#3A3A48', 0.3) : SHIRT_STRIPE);
  c.restore();
  // (the far arm stiff down; the near arm out at the elbow, in steps, the can in the hand)
  limb(c, 10, -70, 3.6, 12, -46, 3, offRamp(SHIRT, a));
  const k = off ? 0 : Math.round(arm * 4) / 4, hx = -6 - k * 22, hy = -50 - k * 14;
  limb(c, -10, -70, 3.6, hx, hy, 3, offRamp(SHIRT, a));
  ell(c, hx, hy, 3, 3, offRamp(WAX, a)[1]);
  if (beer && !off) {
    c.save(); c.translate(hx - 2, hy - 6);
    shape(c, () => c.rect(-3.5, -7, 7, 14), ['#F25A6E', '#C8102E', '#9E0C24', '#760819', '#38030B'], -3.5, 3.5, 0.8);
    px(c, -3, -4, 6, 3, '#F4F1E8'); px(c, -3.5, -8, 7, 1.4, '#C9CDD4');
    c.restore();
  }
  // (the head: the buzz cut, the freckles, the grin that never changes)
  c.save(); c.translate(0, -84); c.rotate(headTurn(a, 5) * 0.5);
  face(c, 0, 0, 11, a, { freckles: true, cheeks: '#F49AA0', seed: 5 });
  fill(c, off ? '#5A4A3A' : '#7A5A3A', () => { c.moveTo(-11, -3); c.quadraticCurveTo(-8, -13, 2, -12); c.quadraticCurveTo(11, -11, 11, -2); c.quadraticCurveTo(4, -8, -11, -3); c.closePath(); });
  for (let k2 = 0; k2 < 8; k2++) px(c, -8 + k2 * 2.4, -10 + (k2 % 2), 0.8, 0.8, '#5A3E26');
  // (the access hatch on the back of his head hanging open: the board in there, a blinking LED, wires)
  shape(c, () => c.rect(5, -6, 7, 7), SERVO, 5, 12, 0.6); px(c, 6, -5, 5, 5, '#1E5A2E'); px(c, 7, -4, 1, 1, '#C8B048'); px(c, 9, -2, 1, 2, '#C8B048');
  px(c, 10, -4, 1, 1, a.mode === 'off' ? '#3A1A1A' : (a.f % 24) < 12 ? '#FF4040' : '#5A1A1A');
  line(c, [12, -6, 15, -9, 14, -11], 0.6, '#9AA0AA'); line(c, [12, 0, 15, 2], 0.6, '#C83A3A');
  c.restore();
  servo(c, -10, -64, a, 5);
  hardware(c, 6, -74, a, 64);
  c.restore();
};
