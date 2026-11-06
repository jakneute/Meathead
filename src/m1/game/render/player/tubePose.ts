// Parked in an inner tube (Player.tubeSit: Meathead 2's water park tube rides, endgame/park1/tube.ts). The owner's
// "make it really look like meathead is parking his giant ass in the tube": sunk down in its hole, his butt in the ring,
// slouched back, both legs hung over its front (the knees up on the rim, the boots dangling down past it, swinging with
// the ride), the free arm thrown back over its back rim. The gun hand's his own (aimed as anywhere: the shots still come
// out of it). In the air (jumping a gap) the tube's stuck to his ass: the knees come up, the boots kick. Ducked, he
// hunches forward down into it. Hit, he's rocked back in it, the boots kicked up.
//
// Local frame: his body's (facing +x, feet at 0, 0), after tubeLean's turn, which is about his butt (TUBE_PIVOT), not his
// feet: sat, that's what he turns on. The ring itself is the ride's (endgame/park1/art.ts drawTubeRing): its middle at
// TUBE_RING (rx 25 across, its fat rubber 21 thick: a donut), its back half behind him, its front half over his hips.

import { drawArmTo, drawLeg, armorOn } from './body';
import { elbow, knee } from '../../../../m2/art/limb';

type Ctx = CanvasRenderingContext2D;
type P = [number, number];

/** Where the ring's middle is (local, from his feet), and its half-width: kept in step with drawTubeRing. */
export const TUBE_RING = { x: -1, y: -15, rx: 25, th: 21 };
/** What he turns about, sat in it: his butt. */
export const TUBE_PIVOT = -20;

export interface TubeLook { air: boolean; duck: boolean; hurt: boolean; squash: number; f: number; fall: number }

/** His slouch in it and how far he's sunk (bodyRot, bodyY). Kept small enough that the gun stays where the shots come
 *  out (combat/muzzle.ts): a couple of pixels at most. */
export const tubeLean = (k: TubeLook) => {
  if (k.hurt) return { rot: -0.26, y: 1 };
  if (k.duck) return { rot: 0.2, y: 4 };
  if (k.air) return { rot: -0.06 + k.fall * 0.08, y: -1 };
  // (sat: slouched back, bobbing as the tube flexes under him)
  return { rot: -0.12, y: 2.5 + k.squash * 1.5 + Math.sin(k.f * 0.13) * 0.8 };
};

const BACK_SHOULDER: P = [-6, -40];
const UPPER = 13, FORE = 13;
/** The free arm thrown back over the ring's back rim, the fist hooked over it (in the air: gripping it hard, up by his
 *  hip; hurt: flung up and back). */
export const drawTubeBackArm = (ctx: Ctx, k: TubeLook) => {
  const r = TUBE_RING;
  const fist: P = k.hurt ? [-24, -50] : k.air ? [-17, -24] : k.duck ? [-14, -22] : [r.x - r.rx + 5, r.y - r.th / 2 - 5 + Math.sin(k.f * 0.13 + 0.6) * 0.8];
  const el = elbow(BACK_SHOULDER[0], BACK_SHOULDER[1], fist[0], fist[1], UPPER, FORE, 1);
  drawArmTo(ctx, BACK_SHOULDER, el, fist, true, 4.8);
  armorOn()?.fist(ctx, fist[0], fist[1], 4.8, 1.6, true);
};

const THIGH = 12.5, SHIN = 13;
/** Both legs hung over the ring's front: the far one first (in his shadow), the near one over it. The knees from
 *  limb.ts (they point forward, up over the rim); the boots toe down past the rubber. */
export const drawTubeLegs = (ctx: Ctx, k: TubeLook) => {
  const swing = Math.sin(k.f * 0.13 + 1.1);
  for (const near of [false, true]) {
    const hip: P = near ? [5, -21] : [-3, -21];
    let foot: P;
    if (k.hurt) foot = [near ? 25 : 20, near ? -34 : -31];
    else if (k.air) foot = [near ? 26 : 21, (near ? -20 : -18) + k.fall * 6 + (near ? swing : -swing) * 1.5];
    else if (k.duck) foot = [near ? 27 : 23, near ? -13 : -12];
    else foot = [(near ? 29 : 24) + swing * (near ? 0.8 : -0.8), (near ? -15 : -14) + k.squash * 1.5 + (near ? swing : -swing) * 1.2];
    const kn = knee(hip[0], hip[1], foot[0], foot[1], THIGH, SHIN, 1);
    // (the boot toes down and forward off the shin)
    const toe = Math.atan2(foot[1] - kn[1], foot[0] - kn[0]) - Math.PI / 2 + 0.55;
    drawLeg(ctx, hip, kn, foot, toe, !near);
  }
};
