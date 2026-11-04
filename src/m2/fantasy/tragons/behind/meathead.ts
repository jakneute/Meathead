// Meathead from behind, on his dragon car, at the walk-in's fidelity (walkAway/meatheadBack.ts: the same build, the
// same ramps, his limbs one shaded mass each from walkAway/flesh.ts, Ben's armor from upgrades/walkArmor.ts): his bare
// back (the traps bunched round his neck, the shoulder blades, the spine's groove, the lats flared, the bacne), the back
// of his head (the fade up to the flat-top, his ears, the thick arms of his glasses over them), his lifting belt and
// his jeans' seat (or the seat soaked through, or his bare white ass and the lot hanging), the backs of his legs, his
// boots' heels. Every pose: ride, duck, jump, hop left and right, the land, the loop grip, the one-hand dangle left and
// right, the fling.
//
// He's a huge swaggering gym bro (the owner's: "fit his character more"): from behind, a big V, every pose cocky and
// powerful.
//   ride    a wide, low crouch, knees out, elbows out, a fist on each handrail
//   duck    hunched like a bull: squatted right down, head sunk between his traps, both fists on the rails (the grip:
//           ducking always holds on)
//   jump    an explosive spring: one knee driven up, the other leg kicked down, one fist pumped up over his head, the
//           other arm flexed out wide, leaning into it
//   hop     a sideways lunge-leap like a linebacker: the lead shoulder dipped into it, the lead fist tucked, the far arm
//           thrown out and up behind, the trailing leg kicked out, the lead knee up
//   land    a heavy squat landing: knees wide, sunk deep, fists on the rails
//   grip    hung on through a roll: both fists on the rails, his body swung the way gravity has him (`hang`), leaning
//           (`side`) into the high side
//   dangle  one hand torn off (the warning: almost gone): hanging off the rail by one fist, the other arm clawing at the
//           air, legs kicking
//   fling   thrown off: spread-eagled, tumbling
//
// Painted once, in parts (the walk figure's units: his feet at the origin, his flat-top's top 186 up): his torso with
// its seat and belt (per pants and armor), his head, an upper arm, a forearm and fist, a thigh, a shin, a boot (each
// part baked pointing down, lit from the upper left, and put down turned along its bone: the stamp cache isn't used, so
// turned is fine). Each frame the pose's joints are worked out (elbows and knees from art/limb.ts: a back-on figure,
// out to the sides) and the parts put down along them: a dozen drawImages, no painting.
// Local frame (drawMeBack's): his car's floor under his boots at the origin, up is -y, the car's units (the walk figure
// is drawn S of its size).

import { elbowFront, kneeFront, reachTo, type P2 } from '../../../art/limb';
import { type Ctx, INK, box, lump, poly, mix, stipple, hash } from '../../../walkAway/kit';
import { SKIN, JEANS, BOOT, BELT, GOLD, HAIR, BAND } from '../../../walkAway/meathead';
import { flesh, wristband, type Mass, type Node, type Arm } from '../../../walkAway/flesh';
import { walkBoot, walkShin, walkShoulder, walkForearm, walkFist, walkHelmet, walkAmulet, walkCapeBack } from '../../../upgrades/walkArmor';
import { ownedPieces } from '../../../upgrades/state';
import { RAIL_X, RAIL_Y, FLOOR_Y } from './cars';

export type MePose = 'ride' | 'duck' | 'jump' | 'hop' | 'land' | 'grip' | 'dangle' | 'fling';
export interface MeQ {
  mode: MePose;
  /** The lean / hop's way (-1 left, 1 right). */
  side: number;
  /** (grip, dangle) the way gravity has him, as a turn of his body (radians: 0 hanging down, + clockwise on screen). */
  hang: number;
  hurt: boolean;
  nude: boolean; shat: boolean;
}

/** The walk figure's units to the car's. */
const S = 0.47;
/** The rail knobs he grips (walk units, his floor at the origin). */
const GRIP_L: P2 = [-RAIL_X / S, -(RAIL_Y - FLOOR_Y) / S], GRIP_R: P2 = [RAIL_X / S, -(RAIL_Y - FLOOR_Y) / S];
/** The bones (walk units): upper arm, forearm (to the fist's middle), thigh, shin (to the ankle). */
const UP = 40, FORE = 42, THIGH = 34, SHIN = 36;
/** From his hip: the shoulders' joints, the neck's base; the hips' joints out each side. */
const SHO: P2 = [44, -54], NECK = -68, HIPX = 13;

const PALE = ['#A2704C', '#C9946A', '#E4B890', '#F3D0AC', '#FFE8CE'];
const SACK = ['#4A2812', '#7A4626', '#9A5C36', '#B4744A', '#CC8C60'];
const STAIN = ['#3A2208', '#5C3A16', '#7A5224', '#9A6A34'];
const RIM = '#F3D9B8';

// ---------------------------------------------------------------------------------------------------------------
// The parts, painted once (per pants and armor)

type Cv = HTMLCanvasElement;
interface Part { cv: Cv; ox: number; oy: number }
const parts = new Map<string, Part | null>();
const RES = 1;
const part = (key: string, w: number, h: number, ox: number, oy: number, paint: (g: Ctx) => void): Part | null => {
  let p = parts.get(key);
  if (p !== undefined) return p;
  p = null;
  if (typeof document !== 'undefined') {
    const cv = document.createElement('canvas'); cv.width = Math.ceil(w * RES); cv.height = Math.ceil(h * RES);
    const g = cv.getContext('2d')!;
    g.imageSmoothingEnabled = false;
    g.setTransform(RES, 0, 0, RES, ox * RES, oy * RES);
    paint(g);
    p = { cv, ox, oy };
  }
  if (parts.size > 200) parts.clear();
  parts.set(key, p);
  return p;
};
/** Puts a part down with its origin at (x, y), turned a. */
const put = (c: Ctx, p: Part | null, x: number, y: number, a = 0) => {
  if (!p) return;
  if (a) { c.save(); c.translate(x, y); c.rotate(a); c.drawImage(p.cv, -p.ox, -p.oy, p.cv.width / RES, p.cv.height / RES); c.restore(); }
  else c.drawImage(p.cv, x - p.ox, y - p.oy, p.cv.width / RES, p.cv.height / RES);
};
/** A bone from a to b, its part painted pointing down (+y): the turn to put it down by. */
const along = (a: P2, b: P2) => Math.atan2(b[1] - a[1], b[0] - a[0]) - Math.PI / 2;

const nd = (x: number, y: number, r: number): Node => [x, y, r];

/** The upper arm, shoulder (origin) down to the elbow: the rear delt's cap, the triceps' horseshoe, the elbow. */
const upperArm = (side: number, armor: string) => part(`ua${side}${armor}`, 40, UP + 30, 20, 16, g => {
  const R = side < 0 ? SKIN : [SKIN[0], SKIN[1], SKIN[2], SKIN[3], SKIN[3]];
  const m: Mass = { chain: [nd(-side, -3, 14), nd(0, UP * 0.42, 12.2), nd(0, UP * 0.82, 9.4), nd(0, UP, 8.4)], blobs: [nd(side * 3, UP * 0.36, 10.4), nd(-side * 3, UP * 0.5, 9.6)], peaks: [nd(-side, -3, 14), nd(side * 3, UP * 0.36, 10.4)] };
  flesh(g, m, R, side > 0 ? RIM : undefined, undefined, c => {
    // (the deltoid's edge, the triceps' horseshoe, the point of the elbow)
    c.strokeStyle = R[1]; c.lineWidth = 1;
    c.beginPath(); c.arc(-side, -3, 11, Math.PI * 0.2, Math.PI * 0.8); c.stroke();
    c.beginPath(); c.moveTo(-5, UP * 0.34); c.quadraticCurveTo(0, UP * 0.78, 5, UP * 0.34); c.stroke();
    box(c, -2, UP - 2, 4, 2, R[1]); box(c, -1, UP - 2, 2, 1, R[3]);
  });
});

/** The forearm, elbow (origin) down to the fist (the back of his hand, the knuckles' ridge), the wrist wrap; the armguard
 *  and the glove if he's got them. */
const foreArm = (side: number, armor: string) => part(`fa${side}${armor}`, 40, FORE + 30, 20, 12, g => {
  const R = side < 0 ? SKIN : [SKIN[0], SKIN[1], SKIN[2], SKIN[3], SKIN[3]];
  const W = FORE - 6;
  const m: Mass = { chain: [nd(0, 0, 8.6), nd(-side * 1.4, FORE * 0.28, 10.2), nd(0, FORE * 0.66, 8), nd(0, W, 6.4)], blobs: [], peaks: [nd(-side * 1.4, FORE * 0.28, 10.2)] };
  flesh(g, m, R, side > 0 ? RIM : undefined, undefined, c => {
    c.strokeStyle = R[1]; c.lineWidth = 1; c.beginPath(); c.moveTo(-2, FORE * 0.2); c.lineTo(-3, FORE * 0.5); c.lineTo(-2, FORE * 0.8); c.stroke();
    c.strokeStyle = R[3]; c.beginPath(); c.moveTo(-3, FORE * 0.2); c.lineTo(-4, FORE * 0.5); c.stroke();
  });
  const a: Arm = { side, S: [0, -UP], E: [0, 0], W: [0, W], F: [0, FORE], dir: [0, 1], flex: [1, 0], mass: m };
  wristband(g, a, BAND);
  walkForearm(g, [0, 0], [0, W], 0);
  // (the fist from behind: the back of his hand, the knuckles' ridge)
  lump(g, 0, FORE, 7, 7.5, SKIN);
  box(g, -5, FORE - 4, 10, 1, SKIN[3]); box(g, -5, FORE + 2, 9, 1, SKIN[1]); box(g, -4, FORE + 4, 8, 1, SKIN[1]);
  walkFist(g, 0, FORE, 7, Math.PI / 2);
});

/** A thigh, hip (origin) down to the knee: jeans (their seams, creased) or bare (hairy); the stain running, shat. */
const thigh = (side: number, pants: string) => part(`th${side}${pants}`, 40, THIGH + 28, 20, 14, g => {
  const bare = pants === 'nude', R = bare ? SKIN : JEANS;
  const m: Mass = { chain: [nd(0, 0, 13), nd(side * 0.8, THIGH * 0.45, 13.2), nd(0, THIGH, 11)], blobs: bare ? [nd(-side * 3, THIGH * 0.5, 9)] : [], peaks: [nd(side * 0.8, THIGH * 0.45, 13.2)] };
  flesh(g, m, R, side > 0 ? (bare ? RIM : '#6A86D0') : undefined, undefined, c => {
    if (!bare) { box(c, side * 9, 2, 1, THIGH - 4, R[4]); for (let i = 0; i < 3; i++) box(c, -7 + i, THIGH - 4 + i * 2, 13 - i * 2, 1, R[1]); }
    else for (let i = 0; i < 7; i++) box(c, -8 + ((i * 5) % 15), 4 + ((i * 11) % (THIGH - 6)), 1, 2, SKIN[1]);
    if (pants === 'shitty') { c.fillStyle = stipple(c, STAIN[1], 0); c.fillRect(-side * 9 - 4, 0, 9, THIGH * 0.8); box(c, -side * 7 - 1, 0, 3, THIGH * 0.6, STAIN[1]); box(c, -side * 4, 2, 2, 10, STAIN[2]); }
  });
});

/** A shin, knee (origin) down to the ankle: the calf from behind; the leg armor's tape and statuette if he's got it. */
const shin = (side: number, pants: string, armor: string) => part(`sh${side}${pants}${armor}`, 40, SHIN + 26, 20, 12, g => {
  const bare = pants === 'nude', R = bare ? SKIN : JEANS;
  const m: Mass = { chain: [nd(0, 0, 11), nd(side * 0.6, SHIN * 0.32, 11.2), nd(0, SHIN, 9)], blobs: bare ? [nd(-side * 1.5, SHIN * 0.3, 9.5)] : [], peaks: [nd(side * 0.6, SHIN * 0.32, 11.2)] };
  flesh(g, m, R, side > 0 ? (bare ? RIM : '#6A86D0') : undefined, undefined, c => {
    box(c, -6, 0, 12, 1, R[1]); box(c, -5, 1, 10, 1, R[3]);
    if (!bare) for (let i = 0; i < 3; i++) box(c, -8 + i * 2, SHIN - 6 + i * 2, 15 - i * 2, 1, R[1]);
    if (pants === 'shitty') { box(c, -side * 6 - 1, 0, 3, 10, STAIN[1]); box(c, -side * 6, 8, 2, 4, STAIN[2]); }
  });
  walkShin(g, 0, 0, SHIN + 4, side, false);
});

/** A boot from behind, its top at the ankle (origin): the shaft, the pull tab, the heel cup, the sole's edge; the
 *  sabatons over it if he's got them. */
const boot = (side: number, armor: string) => part(`bt${side}${armor}`, 34, 30, 17, 4, g => {
  const bw = 22, bh = 16, bx = -11, by = -2;
  g.fillStyle = INK; g.beginPath(); g.roundRect(bx - 1, by - 1, bw + 2, bh + 2, 3); g.fill();
  box(g, bx, by, bw, bh, BOOT[2]);
  box(g, bx, by, 3, bh, BOOT[3]); box(g, bx + bw - 3, by, 3, bh, BOOT[1]);
  box(g, bx + bw / 2 - 2, by - 3, 4, 4, BOOT[1]); box(g, bx + bw / 2 - 1, by - 2, 2, 2, BOOT[0]);
  box(g, bx + 2, by + bh - 6, bw - 4, 4, BOOT[1]); box(g, bx + 3, by + bh - 7, bw - 6, 1, BOOT[3]);
  box(g, bx - 1, by + bh - 1, bw + 2, 3, INK); box(g, bx, by + bh, bw, 1, '#2A2A2E');
  if (side > 0) box(g, bx + bw - 1, by, 1, bh - 3, '#6A6A74');
  walkBoot(g, bx, by, bw, bh, side, false, 0);
});

/** His torso from behind, his hip's middle at the origin: the seat (clean, shitty or nude), the belt (or the tan line),
 *  his back up to the traps (lats flared, the blades, the spine, the bacne, the rim of the light), the cape and the
 *  amulet's chain if he's got them, the neck's stump. Painted in the walk figure's own coordinates (hip at -74). */
const torso = (pants: string, armor: string) => part(`to${pants}${armor}`, 110, 140, 55, 96, g => {
  g.translate(0, 74);
  const Sk = SKIN, hipY = -74;
  const seat = [[-27, hipY - 4], [27, hipY - 4], [27, hipY + 12], [22, hipY + 18], [13, hipY + 20], [3, hipY + 17], [0, hipY + 15], [-3, hipY + 17], [-13, hipY + 20], [-22, hipY + 18], [-27, hipY + 12]];
  if (pants === 'nude') {
    const R = PALE;
    poly(g, [[-4, hipY + 12], [4, hipY + 12], [5, hipY + 30], [-5, hipY + 30]], '#2A160A', null);
    const by = hipY + 22;
    g.fillStyle = '#1C0E06'; g.beginPath(); g.ellipse(0, hipY + 17, 5, 3, 0, 0, Math.PI * 2); g.fill();
    box(g, -1, by + 6, 3, 4, Sk[2]); box(g, -1, by + 9, 3, 1, '#C9806C');
    lump(g, -3, by, 5, 6, SACK); lump(g, 3.5, by + 1, 5, 6, [SACK[0], SACK[1], SACK[2], SACK[2], SACK[3]]);
    for (let k = 0; k < 3; k++) box(g, -5 + k * 3, by - 1 + k * 2, 3, 1, SACK[1]);
    box(g, -6, by - 6, 1, 2, INK); box(g, 5, by - 5, 1, 2, INK);
    poly(g, seat, R[2]);
    for (const side of [-1, 1]) {
      lump(g, side * 12, hipY + 8, 13, 11, side < 0 ? R : [R[0], R[1], R[2], R[2], R[3]], false);
      box(g, side * 12 - 9, hipY + 19, 18, 1, R[0]); box(g, side * 12 - 7, hipY + 18, 14, 1, R[1]);
      if (side > 0) { box(g, 17, hipY + 4, 2, 2, '#D9534F'); box(g, 17, hipY + 4, 1, 1, '#FFF1E0'); }
    }
    box(g, -1, hipY - 3, 1, 8, R[1]); box(g, -1, hipY + 5, 2, 12, R[0]); box(g, 0, hipY + 5, 1, 10, INK);
  } else {
    const R = JEANS;
    poly(g, seat, R[2]);
    for (const side of [-1, 1]) {
      g.fillStyle = R[3]; g.beginPath(); g.ellipse(side * 12 - 3, hipY + 6, 7, 5, 0, 0, Math.PI * 2); g.fill();
      box(g, side * 12 - 9, hipY + 18, 18, 1, R[1]);
      const px = side * 13, py = hipY + 2;
      poly(g, [[px - 8, py], [px + 8, py], [px + 7, py + 11], [px, py + 14], [px - 7, py + 11]], R[2], R[0]);
      g.fillStyle = GOLD[1];
      for (let k = -6; k <= 6; k += 2) g.fillRect(Math.round(px + k), Math.round(py + 4 - Math.abs(k) * 0.35), 1, 1);
      box(g, px - 8, py + 1, 16, 1, R[3]);
    }
    g.strokeStyle = R[4]; g.lineWidth = 1; g.beginPath(); g.arc(13, hipY + 8, 4, 0, Math.PI * 2); g.stroke();
    box(g, -1, hipY - 4, 2, 20, R[0]); box(g, 1, hipY - 4, 1, 18, GOLD[0]);
    box(g, -27, hipY - 4, 4, 16, R[3]); box(g, 23, hipY - 4, 4, 16, R[1]);
    if (pants === 'shitty') {
      g.fillStyle = stipple(g, STAIN[1], 1); g.beginPath(); g.ellipse(0, hipY + 10, 22, 13, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = STAIN[1]; g.beginPath(); g.ellipse(0, hipY + 11, 16, 10, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = STAIN[0]; g.beginPath(); g.ellipse(0, hipY + 13, 8, 6, 0, 0, Math.PI * 2); g.fill();
      box(g, -6, hipY + 6, 3, 1, STAIN[3]); box(g, 4, hipY + 8, 2, 1, STAIN[3]);
      for (const [x, l] of [[-12, 8], [8, 11], [16, 5]] as const) box(g, x, hipY + 18, 2, l, STAIN[1]);
    }
  }
  // The back: lats flared out from his waist to his armpits, the traps up to his neck
  const torsoP = [[-26, -84], [-40, -116], [-46, -131], [-32, -142], [-12, -148], [12, -148], [32, -142], [46, -131], [40, -116], [26, -84]];
  poly(g, torsoP, Sk[2]);
  g.save(); g.beginPath(); torsoP.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.closePath(); g.clip();
  box(g, -48, -150, 8, 70, Sk[3]); g.fillStyle = stipple(g, Sk[3]); g.fillRect(-40, -150, 2, 70);
  box(g, 38, -150, 10, 70, Sk[1]); g.fillStyle = stipple(g, Sk[1], 1); g.fillRect(36, -150, 2, 70);
  for (const side of [-1, 1]) { g.strokeStyle = side < 0 ? Sk[1] : Sk[0]; g.lineWidth = 2; g.beginPath(); g.moveTo(side * 40, -124); g.quadraticCurveTo(side * 24, -108, side * 18, -88); g.stroke(); }
  poly(g, [[-12, -148], [12, -148], [34, -141], [0, -116], [-34, -141]], Sk[2], null);
  poly(g, [[-12, -148], [12, -148], [27, -143], [-27, -143]], Sk[3], null);
  box(g, -10, -148, 8, 1, Sk[4]);
  for (const side of [-1, 1]) {
    g.strokeStyle = Sk[1]; g.lineWidth = 1;
    g.beginPath(); g.moveTo(side * 11, -134); g.lineTo(side * 15, -114); g.lineTo(side * 28, -112); g.stroke();
    g.strokeStyle = side < 0 ? Sk[4] : Sk[3]; g.beginPath(); g.moveTo(side * 12, -137); g.lineTo(side * 35, -139); g.stroke();
    box(g, side * 13 - (side > 0 ? 18 : 0), -136, 18, 1, Sk[1]);
    lump(g, side * 35, -124, 6, 5, side < 0 ? Sk : [Sk[0], Sk[1], Sk[2], Sk[2], Sk[3]], false);
  }
  box(g, -1, -146, 2, 30, Sk[1]); box(g, -1, -116, 2, 32, Sk[0]);
  for (const side of [-1, 1]) { box(g, side * 5 - (side > 0 ? 3 : 0), -112, 3, 24, side < 0 ? Sk[3] : Sk[2]); box(g, side * 9 - (side > 0 ? 1 : 0), -110, 1, 22, Sk[1]); }
  for (let i = 0; i < 12; i++) { const bx = -30 + hash(i * 3.7) * 60, byy = -142 + hash(i * 5.3) * 26; if (Math.abs(bx) < 4) continue; box(g, bx, byy, 1, 1, '#B4532A'); if (i % 3 === 0) box(g, bx + 1, byy, 1, 1, '#E8A070'); }
  g.restore();
  box(g, -45, -132, 1, 20, RIM); box(g, 45, -132, 1, 20, RIM);
  // The lifting belt (wide at the back); or, his pants gone, the tan line round his waist
  const by = -90;
  if (pants !== 'nude') {
    poly(g, [[-28, by], [28, by], [27, by + 16], [-27, by + 16]], BELT[2]);
    box(g, -27, by + 1, 54, 2, BELT[3]); box(g, -27, by + 13, 54, 2, BELT[1]);
    for (let i = -24; i < 24; i += 3) { box(g, i, by + 3, 1, 1, BELT[4]); box(g, i, by + 12, 1, 1, BELT[4]); }
    box(g, -10, by + 6, 20, 2, BELT[3]);
    box(g, -24, by + 2, 6, 12, BELT[1]); box(g, -23, by + 3, 4, 10, BELT[2]);
    box(g, -27, by, 3, 16, BELT[3]);
  } else {
    poly(g, [[-27, by], [27, by], [26, by + 16], [-26, by + 16]], Sk[2], null);
    box(g, -27, by, 3, 16, Sk[3]); box(g, 24, by, 3, 16, Sk[1]); box(g, -1, by, 2, 12, Sk[1]);
    box(g, -9, by + 9, 3, 2, Sk[1]); box(g, 6, by + 9, 3, 2, Sk[1]);
    g.fillStyle = stipple(g, PALE[2]); g.fillRect(-26, by + 14, 52, 2);
  }
  walkCapeBack(g, 0, 0.5, 0);
  // The neck: a stump, the rolls at the bottom of his skull
  poly(g, [[-13, -140], [13, -140], [12, -152], [-12, -152]], Sk[2]);
  box(g, -12, -150, 4, 9, Sk[3]); box(g, 8, -150, 4, 9, Sk[1]); box(g, -1, -150, 2, 8, Sk[1]);
  walkAmulet(g, 0, false, 0);
});

/** The back of his head, the neck's base at the origin: his ears, the fade up to the flat-top, the rolls of his neck,
 *  the arms of his glasses over his ears; the helmet if he's got it. Walk coordinates (the neck's base at -142). */
const head = (armor: string) => part(`hd${armor}`, 110, 90, 55, 74, g => {
  g.translate(0, 142);
  const Sk = SKIN;
  const hd = [[-13, -174], [13, -174], [14, -160], [12, -151], [-12, -151], [-14, -160]];
  lump(g, -15, -163, 3, 4, Sk); lump(g, 15, -163, 3, 4, [Sk[0], Sk[1], Sk[1], Sk[2], Sk[2]]);
  box(g, -17, -166, 1, 6, RIM); box(g, 17, -166, 1, 6, RIM);
  poly(g, hd, Sk[2]);
  box(g, -13, -172, 4, 18, Sk[3]); box(g, 9, -172, 4, 18, Sk[1]);
  g.fillStyle = stipple(g, mix(Sk[1], HAIR[2], 0.55)); g.fillRect(-13, -173, 26, 14);
  g.fillStyle = stipple(g, mix(Sk[1], HAIR[2], 0.35), 1); g.fillRect(-13, -173, 26, 8);
  box(g, -12, -173, 24, 3, mix(Sk[1], HAIR[2], 0.6));
  box(g, -9, -153, 18, 1, Sk[0]); box(g, -8, -152, 16, 1, Sk[3]); box(g, -10, -156, 20, 1, Sk[1]);
  box(g, 12, -170, 1, 14, RIM); box(g, -13, -170, 1, 14, RIM);
  // (the flat-top: a slab of black, squared off, the top lit, its comb lines)
  box(g, -15, -186, 30, 14, INK);
  box(g, -14, -185, 28, 12, HAIR[2]);
  box(g, -14, -185, 28, 2, HAIR[4]);
  for (let i = 0; i < 12; i++) box(g, -13 + i * 2.3, -183 + (i % 2) * 4, 1, 3, HAIR[3]);
  box(g, -14, -175, 28, 2, HAIR[1]);
  box(g, -15, -185, 1, 12, RIM); box(g, 14, -185, 1, 12, RIM);
  walkHelmet(g, 0, false);
  // (his glasses: the thick black arms over the tops of his ears, hooked down behind them, a glint; the frames' corners
  // poking out past his temples)
  for (const side of [-1, 1]) {
    const ax = side < 0 ? -18 : 13;
    box(g, ax, -167, 5, 2, INK); box(g, side < 0 ? ax : ax + 4, -165, 1, 4, INK);
    box(g, ax + 1, -167, 3, 1, BAND[3]); box(g, side < 0 ? ax + 1 : ax + 3, -167, 1, 1, BAND[4]);
    box(g, side * 15 - (side < 0 ? 3 : 0), -170, 3, 5, INK); box(g, side * 15 - (side < 0 ? 2 : -1), -169, 1, 3, '#8EC5E8');
  }
});

// ---------------------------------------------------------------------------------------------------------------
// The poses

/** A body: where its parts go (walk units, his floor at the origin). `tilt` his torso's lean (radians, + clockwise),
 *  `head` his head's, `sink` his head down into his traps. */
interface Body { hip: P2; tilt: number; feet: [P2, P2]; hands: [P2, P2]; head: number; sink?: number; plates?: boolean }

const rot = (p: P2, o: P2, a: number): P2 => { const c = Math.cos(a), s = Math.sin(a), dx = p[0] - o[0], dy = p[1] - o[1]; return [o[0] + dx * c - dy * s, o[1] + dx * s + dy * c]; };
const off = (b: Body, x: number, y: number): P2 => rot([b.hip[0] + x, b.hip[1] + y], b.hip, b.tilt);

const bodyOf = (q: MeQ, f: number): Body => {
  const bob = Math.sin(f * 0.3) * 1.6;
  switch (q.mode) {
    case 'duck':
      return { hip: [0, -38], tilt: 0, feet: [[-44, 0], [44, 0]], hands: [GRIP_L, GRIP_R], head: 0, sink: 12 };
    case 'land':
      return { hip: [0, -34 + bob], tilt: 0, feet: [[-50, 0], [50, 0]], hands: [GRIP_L, GRIP_R], head: 0, sink: 8 };
    case 'jump':
      // (his left knee driven up, his right leg kicked down; his left fist pumped up, his right flexed out wide)
      return { hip: [4, -110], tilt: 0.06, feet: [[-24, -82], [36, -16]], hands: [[-40, -270], [110, -200]], head: 0.1 };
    case 'hop': {
      const s = q.side;
      return { hip: [-s * 12, -100], tilt: s * 0.28, feet: s > 0 ? [[-74, -14], [-20, -58]] : [[20, -58], [74, -14]],
        hands: s > 0 ? [[-124, -210], [62, -142]] : [[-62, -142], [124, -210]], head: s * 0.25 };
    }
    case 'fling':
      return { hip: [0, -86], tilt: Math.sin(f * 0.4) * 0.2, feet: [[-58, -24], [58, -14]], hands: [[-112, -200], [112, -190]], head: Math.sin(f * 0.5) * 0.3, plates: true };
    case 'grip':
    case 'dangle':
    case 'ride':
    default:
      return { hip: [0, -54 + bob], tilt: 0, feet: [[-42, 0], [42, 0]], hands: [GRIP_L, GRIP_R], head: 0, sink: 4 };
  }
};

const armorKey = () => ownedPieces().map(p => p[0] + p[1]).join('');
const pantsKey = (q: MeQ) => (q.nude ? 'nude' : q.shat ? 'shitty' : 'clean');

/** Him from behind, on his car's floor at the origin (local frame, the car's units). */
export const drawMeBack = (c: Ctx, q: MeQ, f: number) => {
  let b = bodyOf(q, f);
  if (q.mode === 'grip') {
    // (swung from his shoulders' line the way gravity has him, leaning in toward the high side: the fists stay on the
    // rails)
    const d = bodyOf({ ...q, mode: 'duck' }, f);
    const piv: P2 = [q.side * 12, d.hip[1] - 50];
    const a = q.hang;
    b = { ...d, hip: rot([d.hip[0] + q.side * 16, d.hip[1]], piv, a), tilt: a, feet: [rot(d.feet[0], piv, a), rot(d.feet[1], piv, a)], hands: [GRIP_L, GRIP_R], head: q.side * 0.2 - a * 0.5 };
  } else if (q.mode === 'dangle') {
    // (hanging off the rail by one fist: his body under it the way gravity has him, the free arm clawing, legs kicking)
    const gs = q.side, grip = gs < 0 ? GRIP_L : GRIP_R;
    const a = q.hang, kick = Math.sin(f * 0.6);
    const Hd = (x: number, y: number) => rot([grip[0] + x, grip[1] + y], grip, a);
    const free: P2 = Hd(-gs * (86 + Math.sin(f * 0.8) * 16), 10 + Math.cos(f * 0.7) * 22);
    b = { hip: Hd(-gs * 30, 142), tilt: a, feet: [Hd(-gs * 30 - 30 + kick * 18, 214), Hd(-gs * 30 + 30 - kick * 18, 210)],
      hands: gs < 0 ? [grip, free] : [free, grip], head: -gs * 0.3, plates: true };
  }
  const pk = pantsKey(q), ak = armorKey();
  c.save();
  c.scale(S, S);
  const sm = c.imageSmoothingEnabled; c.imageSmoothingEnabled = true;
  // (legs, the far ones first: thigh, shin, boot; then the torso, the head, the arms over them)
  for (const side of [-1, 1] as const) {
    const H = off(b, side * HIPX, 0), F = b.feet[side < 0 ? 0 : 1];
    const A = reachTo(H[0], H[1], F[0], F[1], THIGH, SHIN);
    const K = kneeFront(H[0], H[1], A[0], A[1], THIGH, SHIN, side);
    put(c, shin(side, pk, ak), K[0], K[1], along(K, A));
    put(c, thigh(side, pk), H[0], H[1], along(H, K));
    put(c, boot(side, ak), A[0], A[1], 0);
  }
  put(c, torso(pk, ak), b.hip[0], b.hip[1], b.tilt);
  const nk = off(b, 0, NECK + (b.sink ?? 0));
  put(c, head(ak), nk[0], nk[1], b.tilt + b.head);
  if (q.hurt) { c.globalAlpha = 0.35; c.fillStyle = '#DC2626'; c.beginPath(); c.ellipse(nk[0], nk[1] - 20, 16, 20, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
  for (const side of [-1, 1] as const) {
    const Sh = off(b, side * SHO[0], SHO[1]), Hn = b.hands[side < 0 ? 0 : 1];
    const W = reachTo(Sh[0], Sh[1], Hn[0], Hn[1], UP, FORE);
    const E = elbowFront(Sh[0], Sh[1], W[0], W[1], UP, FORE, side);
    put(c, foreArm(side, ak), E[0], E[1], along(E, W));
    put(c, upperArm(side, ak), Sh[0], Sh[1], along(Sh, E));
    walkShoulder(c, Sh[0], Sh[1], side);
  }
  // (scared: sweat flying off him)
  if (b.plates) for (let i = 0; i < 4; i++) { const u = ((f + i * 9) % 18) / 18; box(c, nk[0] - 30 - u * 26 + i * 20, nk[1] - 40 - u * 18, 3, 3, '#BAE6FD'); }
  c.imageSmoothingEnabled = sm;
  c.restore();
};

/** Him put down from a picture of the whole of him (per pose, its moment, his pants, his armor and his size on screen,
 *  painted from the parts the first time it's wanted): one drawImage a frame. `k` his size (the caller's scale). The
 *  moving bits (his bob, a kick, a wobble) go in steps of four frames, the hang in steps of a tenth of a radian. */
const figs = new Map<string, HTMLCanvasElement>();
const FB = [0.5, 0.7, 0.9, 1.1, 1.35, 1.7];
/** The picture's box about his floor (local units): hanging off a rail he needs the room, otherwise it's tight. */
const boxOf = (q: MeQ) => (q.mode === 'dangle' ? { FW: 250, FH: 270, FOX: 125, FOY: 150 } : { FW: 172, FH: 196, FOX: 86, FOY: 154 });
export const drawMe = (c: Ctx, q: MeQ, f: number, k: number) => {
  // (hung on through a roll his body swings every frame: drawn from the parts as it goes)
  if (typeof document === 'undefined' || q.mode === 'grip' || q.mode === 'dangle') { drawMeBack(c, q, f); return; }
  let kb = FB[FB.length - 1]; for (const b of FB) if (b >= k * 0.98) { kb = b; break; }
  const fd = (Math.floor(f / 4) * 4) % 64, hang = Math.round(q.hang * 10) / 10;
  const key = `${q.mode}${q.side}${hang}${q.hurt ? 1 : 0}${pantsKey(q)}${armorKey()}${kb}${q.mode === 'jump' || q.mode === 'hop' || q.mode === 'duck' ? 0 : fd}`;
  const { FW, FH, FOX, FOY } = boxOf(q);
  let cv = figs.get(key);
  if (!cv) {
    cv = document.createElement('canvas'); cv.width = Math.ceil(FW * kb); cv.height = Math.ceil(FH * kb);
    const g = cv.getContext('2d')!;
    g.setTransform(kb, 0, 0, kb, FOX * kb, FOY * kb);
    drawMeBack(g, { ...q, hang }, fd);
    if (figs.size > 400) figs.clear();
    figs.set(key, cv);
  }
  const sm = c.imageSmoothingEnabled; c.imageSmoothingEnabled = true;
  c.drawImage(cv, -FOX, -FOY, FW, FH);
  c.imageSmoothingEnabled = sm;
};

/** (off out of Fairy Land, or the armor changed: painted again) */
export const clearMeParts = () => { parts.clear(); figs.clear(); };

// ---------------------------------------------------------------------------------------------------------------
// (dev only) The contact sheet: every pose in every pants, for looking at (the headless check reads it)

if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as unknown as { __tragonsSheet: () => string }).__tragonsSheet = () => {
    parts.clear();
    const poses: { name: string; q: Partial<MeQ> }[] = [
      { name: 'RIDE', q: { mode: 'ride' } }, { name: 'DUCK', q: { mode: 'duck' } }, { name: 'JUMP', q: { mode: 'jump' } },
      { name: 'HOP L', q: { mode: 'hop', side: -1 } }, { name: 'HOP R', q: { mode: 'hop', side: 1 } }, { name: 'LAND', q: { mode: 'land' } },
      { name: 'GRIP', q: { mode: 'grip', side: 0, hang: 0 } }, { name: 'GRIP ROLLED', q: { mode: 'grip', side: 1, hang: 0.5 } },
      { name: 'DANGLE L', q: { mode: 'dangle', side: -1, hang: 0.35 } }, { name: 'DANGLE R', q: { mode: 'dangle', side: 1, hang: -0.35 } }, { name: 'FLING', q: { mode: 'fling' } },
    ];
    const pantsAll = [{ nude: false, shat: false }, { nude: false, shat: true }, { nude: true, shat: true }];
    const cw = 200, ch = 260, cv = document.createElement('canvas');
    cv.width = cw * poses.length; cv.height = ch * pantsAll.length;
    const g = cv.getContext('2d')!;
    g.fillStyle = '#5A7AB0'; g.fillRect(0, 0, cv.width, cv.height);
    pantsAll.forEach((pt, row) => poses.forEach((p, col) => {
      const x = col * cw + cw / 2, y = row * ch + 170;
      g.fillStyle = (row + col) % 2 ? '#6A8AC0' : '#5A7AB0'; g.fillRect(col * cw, row * ch, cw, ch);
      // (the rail knobs and the floor, for where his fists and boots go)
      g.save(); g.translate(x, y); g.scale(1.6, 1.6);
      g.fillStyle = '#C42828'; g.fillRect(-58, 0, 116, 10);
      g.fillStyle = '#D09A30'; for (const s of [-1, 1]) { g.fillRect(s * RAIL_X - 2, -(RAIL_Y - FLOOR_Y), 4, RAIL_Y - FLOOR_Y); g.beginPath(); g.arc(s * RAIL_X, -(RAIL_Y - FLOOR_Y), 4, 0, Math.PI * 2); g.fill(); }
      drawMeBack(g, { mode: 'ride', side: 0, hang: 0, hurt: false, ...pt, ...p.q } as MeQ, 0);
      g.restore();
      g.fillStyle = '#FFFFFF'; g.font = '12px monospace'; g.fillText(p.name, col * cw + 6, row * ch + 16);
    }));
    return cv.toDataURL('image/png');
  };
}
