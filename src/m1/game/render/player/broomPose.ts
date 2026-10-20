// Astride a broomstick, side on (Player.broomRide: Meathead 2's Fairy Land, the runway's mount and takeoff): sat on
// the shaft (4 under his feet' line, keep/runway.ts drawBroom: its tip 40 ahead, the bristles' binding 22 behind),
// straddling it, knees bent forward, his boots tucked back toward the bristles, both fists on the shaft ahead, leaning
// into the flight (`lean` 0 sat up .. 1 tucked low, taking off). Local frame facing +x, his feet' line at y 0.
// Pants as ever: jeans; shat (the stain on the seat); naked (bare legs, the balls hung over the shaft and the boner
// laid along it, crude, the urinal gag's way).

import type { Player } from '../../../types';
import { drawFig } from './tragonPose';
import type { LadderPants } from './ladder';

type Ctx = CanvasRenderingContext2D;
type Pose = NonNullable<Player['broomRide']>;

/** The shaft's line under his feet' line. */
export const BROOM_SHAFT = 4;

export const drawBroomRidePose = (ctx: Ctx, q: Pose, frame: number, pants: LadderPants, hurt: boolean) => {
  const S = BROOM_SHAFT, k = Math.max(0, Math.min(1, q.lean)), bob = Math.sin(frame * 0.15) * 0.6;
  const hip: [number, number] = [0, S - 7 + bob];
  drawFig(ctx, {
    hip, lean: 0.35 + k * 0.45,
    fN: [24 + k * 4, S - 1], fF: [19 + k * 4, S - 1],
    tN: [-7, S + 16], tF: [-10, S + 14], kneeFwd: true,
    mood: hurt ? 'yell' : 'grit', eyes: hurt ? 'shut' : k > 0.6 ? 'wide' : undefined, headBack: hurt ? 0.3 : 0, white: true,
  }, frame, pants);
  if (!pants.nude) return;
  // (naked: the balls hung either side of the shaft, the boner along it, pointing the way he's flying)
  const cx = hip[0] + 5, cy = S - 3 + bob;
  ctx.fillStyle = '#A8663A'; ctx.beginPath(); ctx.ellipse(cx - 1, S + 3, 2.8, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#C68B45'; ctx.beginPath(); ctx.ellipse(cx + 2, S + 3.6, 2.8, 3, 0, 0, Math.PI * 2); ctx.fill();
  const tx = cx + 15 + k * 2, ty = cy - 1;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#4A2410'; ctx.lineWidth = 5.4; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(tx, ty); ctx.stroke();
  ctx.strokeStyle = '#E89A86'; ctx.lineWidth = 3.6; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(tx, ty); ctx.stroke();
  ctx.fillStyle = '#4A2410'; ctx.beginPath(); ctx.ellipse(tx + 1, ty, 3.4, 2.8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#C8505A'; ctx.beginPath(); ctx.ellipse(tx + 1, ty, 2.6, 2.1, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#F4C0B0'; ctx.fillRect(cx + 3, cy - 1.6, 8, 0.9);
};
