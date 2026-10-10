// Meathead from behind, walking away from the camera into a land (the portal walk's: portalWalk.ts). The walk-away's
// Meathead (meathead.ts) turned round: the same build, the same colors, in the same picture pixels (2x on the screen),
// his feet at the origin, up -y. Lit from the upper left, backlit from wherever he's headed (the rim round his edges).
//
// His back: the traps, the shoulder blades, the spine down the middle, the lats flared out, the bacne. His arms hanging
// at his sides, swinging with his stride; his weapon in his left fist (he's left-handed), hanging down by his thigh,
// muzzle to the ground. The lifting belt's wide at the back. His seat: clean jeans (the back pockets, the stitching, the
// ring a can of dip's worn into one of them); shitty (the seat soaked through, running down the backs of his legs); or
// his pants gone (his bare ass, as white as the rest of him is brown: the jeans' tan line; and hanging down between his
// legs, swinging with every step, the lot, uncensored). His boots' heels; the soles coming up as each foot pushes off.

import { type Ctx, INK, box, lump, poly, mix, stipple, hash } from './kit';
import { SKIN, JEANS, BOOT, BELT, GOLD, HAIR, BAND, limb } from './meathead';

/** Where the sun never gets (under his jeans). */
const PALE = ['#A2704C', '#C9946A', '#E4B890', '#F3D0AC', '#FFE8CE'];
/** What hangs down between his legs: darker, wrinkled. */
const SACK = ['#4A2812', '#7A4626', '#9A5C36', '#B4744A', '#CC8C60'];
const STAIN = ['#3A2208', '#5C3A16', '#7A5224', '#9A6A34'];

export interface BackPose {
  /** His walk: the step's phase (radians: a step every π). */
  step: number;
  t: number;
  /** Pants blown off him; shitty pants. */
  nude: boolean; shat: boolean;
  /** The light coming at him from where he's headed (his edges). */
  rim: string;
  /** What he's carrying (as he holds it in the game: its grip at the origin, pointing +x), or nothing. */
  weapon: ((c: Ctx, t: number) => void) | null;
}

/** His weapon's drawn this much bigger than it is in the game (to his size here). */
const WS = 2.4;

/** A leg from behind: the back of the thigh, the knee, the calf, the boot's heel (the sole showing as it pushes off). */
const leg = (c: Ctx, side: number, p: BackPose, bob: number) => {
  const s = Math.sin(p.step) * side;
  // (ahead: this foot's out in front of him, further off, so higher up; behind: its heel coming up off the ground)
  const fwd = Math.max(0, s), back = Math.max(0, -s);
  const R = p.nude ? SKIN : JEANS;
  const lx = side * 13, hipY = -74 + bob;
  const bootTop = -15 - fwd * 5 - back * 5;
  limb(c, lx, hipY, 25, lx - side * 1, bootTop + 3, 20 - fwd * 2, R, side > 0 ? p.rim : undefined);
  if (side < 0) box(c, lx - 12, hipY + 4, 1, bootTop - hipY - 4, p.rim);
  const ky = Math.round(hipY + (bootTop - hipY) * 0.52);
  if (!p.nude) {
    // (the creases behind the knee, the seams down the back, bunched at the ankle)
    for (let i = 0; i < 3; i++) box(c, lx - 7 + i, ky - 3 + i * 3, 13 - i * 2, 1, R[1]);
    box(c, lx - 6, ky - 2, 10, 1, R[3]);
    box(c, lx + side * 8, hipY + 6, 1, bootTop - hipY - 8, R[4]);
    for (let i = 0; i < 3; i++) box(c, lx - 8 + i * 2, bootTop - 6 + i * 2, 15 - i * 2, 1, R[1]);
    if (p.shat) {
      // (down the backs of his legs, the insides: soaked through, running)
      c.fillStyle = stipple(c, STAIN[1], 0); c.fillRect(lx - side * 9 - 3, hipY + 6, 8, 22);
      box(c, lx - side * 7 - 1, hipY + 6, 3, 14 + ((p.t >> 4) % 3), STAIN[1]);
      box(c, lx - side * 4, hipY + 8, 2, 9, STAIN[2]);
    }
  } else {
    // (the back of the knee, the calf bulging under it; hairy)
    box(c, lx - 6, ky - 1, 12, 1, R[1]);
    lump(c, lx - side * 1, ky + 9, 9, 9, side < 0 ? R : [R[0], R[1], R[2], R[2], R[3]], false);
    for (let i = 0; i < 6; i++) box(c, lx - 7 + ((i * 5) % 13), hipY + 20 + ((i * 13) % Math.max(4, bootTop - hipY - 24)), 1, 2, SKIN[1]);
  }
  // The boot, from behind: the shaft, the pull tab, the heel cup; the sole as it comes up off the ground
  const bw = 21 - fwd * 2, bx = Math.round(lx - bw / 2 - side * 0.5), by = Math.round(bootTop), bh = 15;
  c.fillStyle = INK; c.beginPath(); c.roundRect(bx - 1, by - 1, bw + 2, bh + 2, 3); c.fill();
  box(c, bx, by, bw, bh, BOOT[2]);
  box(c, bx, by, 3, bh, BOOT[3]); box(c, bx + bw - 3, by, 3, bh, BOOT[1]);
  box(c, bx + bw / 2 - 2, by - 3, 4, 4, BOOT[1]); box(c, bx + bw / 2 - 1, by - 2, 2, 2, BOOT[0]);
  // (the heel cup: a darker curve round the bottom, a stitch line over it)
  box(c, bx + 2, by + bh - 6, bw - 4, 4, BOOT[1]); box(c, bx + 3, by + bh - 7, bw - 6, 1, BOOT[3]);
  if (back > 0.15) {
    // (the sole tipping up at us as the heel comes up: the tread, lugs across it)
    const sh = Math.round(back * 7);
    box(c, bx - 1, by + bh - 1, bw + 2, sh + 2, INK);
    box(c, bx, by + bh, bw, sh, '#2A2A2E');
    for (let k = 1; k < sh; k += 2) box(c, bx + 2, by + bh + k, bw - 4, 1, '#121214');
  } else box(c, bx - 1, by + bh - 1, bw + 2, 2, INK);
  if (side > 0) box(c, bx + bw - 1, by, 1, bh - 3, p.rim);
};

/** An arm hanging at his side from behind: the rear delt, the tricep, the elbow, the forearm, the fist; one piece, inked
 * round the outside of the lot. Returns the fist. */
const arm = (c: Ctx, side: number, p: BackPose, ty: number, swing: number): [number, number] => {
  const S = side < 0 ? SKIN : [SKIN[0], SKIN[1], SKIN[2], SKIN[2], SKIN[3]];
  const sx = side * 45, sy = -132 + ty;
  // (the elbow out a touch, the forearm back in toward his thigh; swung forward (away from us): the fist up and in a
  // touch, back: down and out)
  const ex = side * 50, ey = -99 + ty;
  const fx = side * (44 - swing * 1.5), fy = -64 + ty - swing * 4;
  // (the ink round the whole arm first, then the arm over it: no seams at the elbow)
  c.strokeStyle = INK; c.lineCap = 'round'; c.lineJoin = 'round';
  c.lineWidth = 22; c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.stroke();
  c.lineWidth = 15; c.beginPath(); c.moveTo(ex, ey); c.lineTo(fx, fy - 4); c.stroke();
  c.lineCap = 'butt'; c.lineJoin = 'miter';
  limb(c, sx, sy, 20, ex, ey, 14, S, side > 0 ? p.rim : undefined, null);
  limb(c, ex, ey, 14, fx, fy - 4, 11, S, side > 0 ? p.rim : undefined, null);
  c.fillStyle = S[2]; c.beginPath(); c.ellipse(ex, ey, 7, 5, 0, 0, Math.PI * 2); c.fill();
  // (the tricep's horseshoe down the back of the upper arm, the point of the elbow, the forearm's meat under it)
  lump(c, side * 47, -117 + ty, 8, 11, S, false);
  box(c, side * 47 - 4, -108 + ty, 8, 1, S[1]);
  box(c, ex - 2, ey - 1, 4, 3, S[1]); box(c, ex - 1, ey - 1, 2, 1, S[3]);
  lump(c, ex + (fx - ex) * 0.3 - side * 1, ey + (fy - ey) * 0.3, 5, 8, S, false);
  // (the wristband)
  const wx = ex + (fx - ex) * 0.8, wy = ey + (fy - 4 - ey) * 0.8;
  c.fillStyle = INK; c.beginPath(); c.ellipse(wx, wy, 7, 4, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = BAND[2]; c.beginPath(); c.ellipse(wx, wy, 6, 3, 0, 0, Math.PI * 2); c.fill();
  box(c, wx - 4, wy - 2, 4, 1, BAND[4]);
  // The rear delt: the round cap over the top of it (its edge inked only up over the shoulder)
  c.fillStyle = INK; c.beginPath(); c.ellipse(side * 43, -132 + ty, 13, 11, 0, Math.PI, 0); c.fill();
  lump(c, side * 43, -131 + ty, 12, 10, S, false);
  c.strokeStyle = p.rim; c.lineWidth = 1;
  if (side > 0) { c.beginPath(); c.ellipse(side * 43, -131 + ty, 11, 10, 0, -Math.PI / 2.2, Math.PI / 2.6); c.stroke(); }
  else { c.beginPath(); c.ellipse(side * 43, -131 + ty, 11, 10, 0, Math.PI - Math.PI / 2.6, Math.PI + Math.PI / 2.2); c.stroke(); }
  // (the outer edge of the arm, lit from where he's going)
  box(c, side * 56 - (side > 0 ? 1 : 0), -126 + ty, 1, 24, p.rim);
  return [fx, fy];
};

/** A fist from behind (the back of his hand, the knuckles' ridge). */
const fist = (c: Ctx, x: number, y: number) => {
  lump(c, x, y, 6, 7, SKIN);
  box(c, x - 4, y - 4, 8, 1, SKIN[3]); box(c, x - 4, y + 2, 8, 1, SKIN[1]); box(c, x - 4, y + 4, 7, 1, SKIN[1]);
};

export const drawMeatheadBack = (c: Ctx, x: number, y: number, p: BackPose) => {
  c.save();
  c.translate(Math.round(x), Math.round(y));
  const step = p.step;
  // (up highest with his legs passing, down on each foot; his shoulders rolling with it)
  const bob = Math.round(-(1 - Math.abs(Math.sin(step))) * 3);
  const roll = Math.sin(step) * 1.2;
  const S = SKIN;
  // His shadow (stippled)
  c.fillStyle = stipple(c, '#000000'); c.beginPath(); c.ellipse(0, 0, 40, 6, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.ellipse(0, 0, 30, 4, 0, 0, Math.PI * 2); c.fill();
  // Legs: the one out in front of him first (it's further off)
  const hipY = -74 + bob;
  const ahead = Math.sin(step) > 0 ? 1 : -1;
  leg(c, ahead, p, bob);
  leg(c, -ahead, p, bob);
  // His seat
  const seat = [[-26, hipY - 2], [26, hipY - 2], [26, hipY + 12], [22, hipY + 18], [13, hipY + 20], [3, hipY + 17], [0, hipY + 15], [-3, hipY + 17], [-13, hipY + 20], [-22, hipY + 18], [-26, hipY + 12]];
  if (p.nude) {
    // (his bare ass, white as the rest of him isn't; each cheek riding up as its leg goes back)
    const R = PALE;
    // (the gap between his thighs, under it: in the dark)
    poly(c, [[-4, hipY + 12], [4, hipY + 12], [5, hipY + 34], [-5, hipY + 34]], '#2A160A', null);
    poly(c, seat, R[2]);
    for (const side of [-1, 1]) {
      const up = Math.max(0, -Math.sin(step) * side) * 2;
      lump(c, side * 12, hipY + 8 - up, 13, 11, side < 0 ? R : [R[0], R[1], R[2], R[2], R[3]], false);
      // (the crease under it)
      box(c, side * 12 - 9, hipY + 19 - up, 18, 1, R[0]); box(c, side * 12 - 7, hipY + 18 - up, 14, 1, R[1]);
    }
    // (the crack, deepening as it goes down)
    box(c, -1, hipY - 1, 1, 6, R[1]); box(c, -1, hipY + 5, 2, 12, R[0]); box(c, 0, hipY + 5, 1, 10, INK);
    // Between his legs, from behind: the lot, hanging down, swinging side to side with his stride (a beat behind
    // it), bouncing on each footfall
    const sw = Math.sin(step - 0.7) * 3.5, bo = Math.abs(Math.cos(step)) * 2;
    const by = hipY + 22 + bo;
    c.fillStyle = '#1C0E06'; c.beginPath(); c.ellipse(sw * 0.5, hipY + 17, 5, 3, 0, 0, Math.PI * 2); c.fill();
    // (the tip of it, peeking out under them as they swing)
    box(c, sw * 1.4 - 1, by + 6, 3, 4, S[2]); box(c, sw * 1.4 - 1, by + 9, 3, 1, '#C9806C');
    lump(c, sw - 3, by, 5, 6, SACK); lump(c, sw + 3.5, by + 1, 5, 6, [SACK[0], SACK[1], SACK[2], SACK[2], SACK[3]]);
    // (wrinkled; the odd hair)
    for (let k = 0; k < 3; k++) box(c, sw - 5 + k * 3, by - 1 + k * 2, 3, 1, SACK[1]);
    box(c, sw - 6, by - 6, 1, 2, INK); box(c, sw + 5, by - 5, 1, 2, INK); box(c, sw + 1, by + 6, 1, 2, INK);
  } else {
    const R = JEANS;
    poly(c, seat, R[2]);
    // (each cheek: lit up and left, rolling with the stride)
    for (const side of [-1, 1]) {
      const up = Math.max(0, -Math.sin(step) * side) * 1.5;
      c.fillStyle = R[3]; c.beginPath(); c.ellipse(side * 12 - 3, hipY + 6 - up, 7, 5, 0, 0, Math.PI * 2); c.fill();
      box(c, side * 12 - 9, hipY + 18 - up, 18, 1, R[1]);
      // (the back pocket: its outline, the gold stitching inside it, the wings stitched across it)
      const px = side * 13, py = hipY + 3 - up;
      const pk = [[px - 8, py], [px + 8, py], [px + 7, py + 11], [px, py + 14], [px - 7, py + 11]];
      poly(c, pk, R[2], R[0]);
      c.fillStyle = GOLD[1];
      for (let k = -6; k <= 6; k += 2) c.fillRect(Math.round(px + k), Math.round(py + 4 - Math.abs(k) * 0.35), 1, 1);
      box(c, px - 8, py + 1, 16, 1, R[3]);
    }
    // (the ring a can of dip's worn in his right pocket)
    c.strokeStyle = R[4]; c.lineWidth = 1; c.beginPath(); c.arc(13, hipY + 9, 4, 0, Math.PI * 2); c.stroke();
    // (the seam down the middle, the yoke across the top)
    box(c, -1, hipY - 2, 2, 18, R[0]); box(c, 1, hipY - 2, 1, 16, GOLD[0]);
    c.strokeStyle = R[1]; c.beginPath(); c.moveTo(-25, hipY + 1); c.lineTo(0, hipY + 5); c.lineTo(25, hipY + 1); c.stroke();
    box(c, -26, hipY - 2, 4, 14, R[3]); box(c, 22, hipY - 2, 4, 14, R[1]);
    if (p.shat) {
      // (the seat: soaked through, dark in the middle, a wet shine on it, stippled out round the edge)
      c.fillStyle = stipple(c, STAIN[1], 1); c.beginPath(); c.ellipse(0, hipY + 11, 21, 12, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = STAIN[1]; c.beginPath(); c.ellipse(0, hipY + 12, 15, 9, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = STAIN[0]; c.beginPath(); c.ellipse(0, hipY + 14, 8, 6, 0, 0, Math.PI * 2); c.fill();
      box(c, -6, hipY + 7, 3, 1, STAIN[3]); box(c, 4, hipY + 9, 2, 1, STAIN[3]); box(c, -4, hipY + 8, 1, 1, '#C8A070');
    }
  }
  c.translate(roll * 0.4, 0);
  const ty = bob;
  // The back: lats flared out from his waist to his armpits, the traps up to his neck
  const torso = [[-25, -84 + ty], [-38, -118 + ty], [-42, -131 + ty], [-30, -141 + ty], [-12, -147 + ty], [12, -147 + ty], [30, -141 + ty], [42, -131 + ty], [38, -118 + ty], [25, -84 + ty]];
  poly(c, torso, S[2]);
  c.save(); c.beginPath(); torso.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py))); c.closePath(); c.clip();
  // (lit down the left, shaded down the right, the rim of the light ahead round both)
  box(c, -44, -150 + ty, 8, 70, S[3]); box(c, -36, -150 + ty, 2, 70, stipple(c, S[3]) as never);
  box(c, 34, -150 + ty, 10, 70, S[1]); box(c, 32, -150 + ty, 2, 70, stipple(c, S[1], 1) as never);
  // (the lats' sweep: the shade along under each one, from the armpit in to the waist)
  for (const side of [-1, 1]) {
    c.strokeStyle = side < 0 ? S[1] : S[0]; c.lineWidth = 2;
    c.beginPath(); c.moveTo(side * 37, -124 + ty); c.quadraticCurveTo(side * 22, -108 + ty, side * 17, -88 + ty); c.stroke();
  }
  // (the traps: a diamond, neck to shoulders and down to a point between the blades, lit across the top)
  poly(c, [[-12, -147 + ty], [12, -147 + ty], [32, -140 + ty], [0, -116 + ty], [-32, -140 + ty]], S[2], null);
  poly(c, [[-12, -147 + ty], [12, -147 + ty], [26, -142 + ty], [-26, -142 + ty]], S[3], null);
  box(c, -10, -147 + ty, 8, 1, S[4]);
  // (the shoulder blades: the ridge across the top of each, its edge down toward the spine, the shade under)
  for (const side of [-1, 1]) {
    c.strokeStyle = S[1]; c.lineWidth = 1;
    c.beginPath(); c.moveTo(side * 11, -134 + ty); c.lineTo(side * 15, -114 + ty); c.lineTo(side * 27, -112 + ty); c.stroke();
    c.strokeStyle = side < 0 ? S[4] : S[3]; c.beginPath(); c.moveTo(side * 12, -137 + ty); c.lineTo(side * 34, -139 + ty); c.stroke();
    box(c, side * 13 - (side > 0 ? 18 : 0), -136 + ty, 18, 1, S[1]);
    // (the teres bulging out under the armpit)
    lump(c, side * 33, -124 + ty, 6, 5, side < 0 ? S : [S[0], S[1], S[2], S[2], S[3]], false);
  }
  // (the spine: a groove down the middle, deeper down low between the two ridges of muscle either side of it)
  box(c, -1, -145 + ty, 2, 30, S[1]);
  box(c, -1, -115 + ty, 2, 30, S[0]);
  for (const side of [-1, 1]) {
    box(c, side * 5 - (side > 0 ? 3 : 0), -112 + ty, 3, 24, side < 0 ? S[3] : S[2]);
    box(c, side * 9 - (side > 0 ? 1 : 0), -110 + ty, 1, 22, S[1]);
  }
  // (bacne: what the gear does)
  for (let i = 0; i < 11; i++) {
    const bx = -30 + hash(i * 3.7) * 60, byy = -142 + hash(i * 5.3) * 26;
    if (Math.abs(bx) < 4) continue;
    box(c, bx, byy + ty, 1, 1, '#B4532A'); if (i % 3 === 0) box(c, bx + 1, byy + ty, 1, 1, '#E8A070');
  }
  c.restore();
  box(c, -43, -132 + ty, 1, 20, p.rim); box(c, 42, -132 + ty, 1, 20, p.rim);
  // The lifting belt (wide at the back); or with his pants gone (the belt with them), the tan line round his waist:
  // where the belt sat, a hand's width of white
  {
    const by = -90 + bob;
    if (!p.nude) {
      poly(c, [[-28, by], [28, by], [27, by + 16], [-27, by + 16]], BELT[2]);
      box(c, -27, by + 1, 54, 2, BELT[3]); box(c, -27, by + 13, 54, 2, BELT[1]);
      for (let i = -24; i < 24; i += 3) { box(c, i, by + 3, 1, 1, BELT[4]); box(c, i, by + 12, 1, 1, BELT[4]); }
      // (the leather's worn shiny across the middle; the end of the strap tucked through a keeper on his left)
      box(c, -10, by + 6, 20, 2, BELT[3]);
      box(c, -24, by + 2, 6, 12, BELT[1]); box(c, -23, by + 3, 4, 10, BELT[2]);
      box(c, -27, by, 3, 16, BELT[3]);
    } else {
      // (his lower back, down to where his jeans sat; the dimples either side of his spine)
      poly(c, [[-27, by], [27, by], [26, by + 16], [-26, by + 16]], S[2], null);
      box(c, -27, by, 3, 16, S[3]); box(c, 24, by, 3, 16, S[1]); box(c, -1, by, 2, 12, S[1]);
      box(c, -9, by + 9, 3, 2, S[1]); box(c, 6, by + 9, 3, 2, S[1]);
      // (the tan line: brown to white, a dithered row between)
      c.fillStyle = stipple(c, PALE[2]); c.fillRect(-26, by + 14, 52, 2);
    }
  }
  // Arms: swinging against his legs (his left, with the weapon in it, hardly at all)
  const sw = Math.sin(step);
  const [lx, ly] = arm(c, -1, p, ty, -sw * 0.35);
  const [rx, ry] = arm(c, 1, p, ty, sw);
  // His weapon, in his left fist, hanging down by his thigh, muzzle to the ground (out a touch from his leg)
  if (p.weapon) {
    c.save(); c.translate(lx, ly + 1); c.rotate(Math.PI / 2 + 0.22 + sw * 0.04); c.scale(WS, WS); c.translate(-5, -6);
    p.weapon(c, p.t);
    c.restore();
  }
  fist(c, lx, ly); fist(c, rx, ry);
  // The neck: a stump, the rolls at the bottom of his skull
  const hy = ty;
  poly(c, [[-13, -140 + ty], [13, -140 + ty], [12, -152 + hy], [-12, -152 + hy]], S[2]);
  box(c, -12, -150 + hy, 4, 9, S[3]); box(c, 8, -150 + hy, 4, 9, S[1]);
  box(c, -1, -150 + hy, 2, 8, S[1]);
  // The back of his head: shaved up the back and sides (stubble, dithered), the ears sticking out
  const head = [[-13, -174 + hy], [13, -174 + hy], [14, -160 + hy], [12, -151 + hy], [-12, -151 + hy], [-14, -160 + hy]];
  lump(c, -15, -163 + hy, 3, 4, S); lump(c, 15, -163 + hy, 3, 4, [S[0], S[1], S[1], S[2], S[2]]);
  box(c, -17, -166 + hy, 1, 6, p.rim); box(c, 17, -166 + hy, 1, 6, p.rim);
  poly(c, head, S[2]);
  box(c, -13, -172 + hy, 4, 18, S[3]); box(c, 9, -172 + hy, 4, 18, S[1]);
  // (the fade: dark stubble from the flat-top down, thinning out toward his neck)
  c.fillStyle = stipple(c, mix(S[1], HAIR[2], 0.55)); c.fillRect(-13, -173 + hy, 26, 14);
  c.fillStyle = stipple(c, mix(S[1], HAIR[2], 0.35), 1); c.fillRect(-13, -173 + hy, 26, 8);
  box(c, -12, -173 + hy, 24, 3, mix(S[1], HAIR[2], 0.6));
  // (the rolls of his neck, where it meets his skull)
  box(c, -9, -153 + hy, 18, 1, S[0]); box(c, -8, -152 + hy, 16, 1, S[3]);
  box(c, -10, -156 + hy, 20, 1, S[1]);
  box(c, 12, -170 + hy, 1, 14, p.rim); box(c, -13, -170 + hy, 1, 14, p.rim);
  // The flat-top, from behind and a little below: a slab of black, the back of it squared off, the top edge lit
  box(c, -15, -186 + hy, 30, 14, INK);
  box(c, -14, -185 + hy, 28, 12, HAIR[2]);
  box(c, -14, -185 + hy, 28, 2, HAIR[4]);
  for (let i = 0; i < 12; i++) box(c, -13 + i * 2.3, -183 + hy + (i % 2) * 4, 1, 3, HAIR[3]);
  box(c, -14, -175 + hy, 28, 2, HAIR[1]);
  box(c, -15, -185 + hy, 1, 12, p.rim); box(c, 14, -185 + hy, 1, 12, p.rim);
  c.restore();
};
