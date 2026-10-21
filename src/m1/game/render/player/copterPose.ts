// In the helicopter's seat (Player.copterSeat: Meathead 2's Foreign Lands, HELICOPTER RIDES ACROSS THE WORLD): his own
// poses, side on, facing +x (the nose's way), his boots on the cabin floor at (0, 0), the seat cushion 10 up.
//
//   passenger  the tour: slumped back, arms crossed, bored stiff, scowling.
//   pilot      his: hunched forward over the controls, elbows out, the near fist on the cyclic between his knees, the
//              far one on the collective at his side, boots on the pedals. Leaning harder into a boost; the stick hand
//              jittering with the chin gun's recoil while he fires; the stick yanked back into his gut for an up boost;
//              hanging off his seatbelt upside down (his arms and the slack of him toward the roof) for the down flip; a
//              snarl after a kill, a flinch (head back, eyes shut) when he's hit.
// Pants as ever: jeans; shat (the stain where he sits); naked (bare legs and lap).

import type { Player } from '../../../types';
import { drawArmTo, drawTorso, drawHead, drawGlasses, drawBoot, drawLeg, drawBelt, skinTone, skinShadow, skinHighlight, type Mood } from './body';
import type { LadderPants } from './ladder';

type Ctx = CanvasRenderingContext2D;
type Seat = NonNullable<Player['copterSeat']>;
type Pt = [number, number];

/** The elbow for an arm from shoulder s to fist f (upper arm 12, forearm 11): out (up and away) or down. */
const elbow = (s: Pt, f: Pt, out: boolean): Pt => {
  const a = 12, b = 11, dx = f[0] - s[0], dy = f[1] - s[1], d = Math.min(a + b - 0.5, Math.hypot(dx, dy) || 1);
  const base = Math.atan2(dy, dx), off = Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))));
  const ang = base + (out ? -off : off);
  return [s[0] + Math.cos(ang) * a, s[1] + Math.sin(ang) * a];
};
const reach = (s: Pt, f: Pt): Pt => { const dx = f[0] - s[0], dy = f[1] - s[1], d = Math.hypot(dx, dy), m = 22.5; return d <= m ? f : [s[0] + (dx / d) * m, s[1] + (dy / d) * m]; };
const bare = (ctx: Ctx, a: Pt, b: Pt, w: number, far: boolean) => {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  ctx.save(); ctx.translate(a[0], a[1]); ctx.rotate(Math.atan2(b[1] - a[1], b[0] - a[0]));
  ctx.fillStyle = far ? skinShadow : skinTone; ctx.beginPath(); ctx.roundRect(-w / 2, -w / 2, len + w, w, w / 2); ctx.fill();
  if (!far) { ctx.fillStyle = skinHighlight; ctx.fillRect(1, -w / 2 + 1, len - 2, 1.2); }
  ctx.restore();
};
const leg = (ctx: Ctx, hip: Pt, knee: Pt, foot: Pt, far: boolean, pants: LadderPants) => {
  if (!pants.nude) { drawLeg(ctx, hip, knee, foot, -0.2, far); return; }
  bare(ctx, hip, knee, far ? 9 : 10, far); bare(ctx, knee, foot, far ? 8 : 9, far);
  ctx.save(); ctx.translate(foot[0], foot[1]); ctx.rotate(-0.2); drawBoot(ctx, -5, -4.5, 15, 8, !far); ctx.restore();
};

/** Him in the helicopter's seat (local frame, facing +x). */
export const drawCopterSeatPose = (ctx: Ctx, q: Seat, frame: number, pants: LadderPants) => {
  const pilot = q.mode === 'pilot', hang = pilot && q.hang;
  // (the lean about his hips: forward over the controls, harder into a boost; back, slumped, as a passenger)
  const lean = pilot ? 0.28 + q.lean : -0.14;
  const jit = pilot && q.fire ? ((frame >> 1) % 2 ? 0.8 : -0.8) : 0;
  const HX = 0, HY = -12, DY = 12, up = hang ? -3 : 0;
  const T = (x: number, y: number): Pt => {
    const c = Math.cos(lean), s = Math.sin(lean), vx = x - HX, vy = y + DY - HY;
    return [HX + vx * c - vy * s, HY + vx * s + vy * c + up];
  };
  const sB = T(-8, -45), sF = T(6, -45);
  // (the controls: the collective at his far side, the cyclic between his knees, yanked back for an up boost)
  const stickTop: Pt = pilot ? (q.yank ? [9, -24] : [17 + jit, -22]) : [17, -20];
  // (each a steel rod inked, lit along one edge; the cyclic's black grip, its trigger and red button; the collective's
  // twist grip; the boot in its rubber at the cyclic's foot)
  const rod = (x0: number, y0: number, x1: number, y1: number) => {
    ctx.strokeStyle = '#1A0B06'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.strokeStyle = '#71717A'; ctx.lineWidth = 2; ctx.stroke();
    ctx.strokeStyle = '#D4D4D8'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(x0 - 0.6, y0); ctx.lineTo(x1 - 0.6, y1); ctx.stroke();
  };
  ctx.fillStyle = '#18181B'; ctx.beginPath(); ctx.ellipse(16, -2, 4, 1.8, 0, 0, Math.PI * 2); ctx.fill();
  rod(16, -2, stickTop[0], stickTop[1]);
  rod(-14, -6, -4, -16);
  ctx.fillStyle = '#1A0B06'; ctx.fillRect(stickTop[0] - 3, stickTop[1] - 7, 6, 8); ctx.fillStyle = '#27272A'; ctx.fillRect(stickTop[0] - 2, stickTop[1] - 6, 4, 6); ctx.fillStyle = '#52525B'; ctx.fillRect(stickTop[0] - 2, stickTop[1] - 6, 1, 6);
  ctx.fillStyle = '#DC2626'; ctx.fillRect(stickTop[0] - 1, stickTop[1] - 8, 3, 2); ctx.fillStyle = '#FCA5A5'; ctx.fillRect(stickTop[0] - 1, stickTop[1] - 8, 1, 1);
  ctx.fillStyle = '#1A0B06'; ctx.fillRect(-6, -19, 5, 5); ctx.fillStyle = '#3F3F46'; ctx.fillRect(-5, -18, 3, 3);
  // (the far arm: the collective, or crossed over his chest; hanging, up toward the roof)
  const fB = reach(sB, hang ? [-10, -62] : pilot ? [-4, -16] : T(8, -30));
  drawArmTo(ctx, sB, elbow(sB, fB, pilot), fB, true);
  // (the legs: knees up, boots on the pedals; the far one first)
  leg(ctx, [2, -12], [15, -16], [24, -3], true, pants);
  // (his lap on the seat: jeans, the stain if he's shat; or bare)
  ctx.fillStyle = pants.nude ? skinTone : '#1E3A8A'; ctx.beginPath(); ctx.ellipse(1, -12, 9, 5, 0, 0, Math.PI * 2); ctx.fill();
  if (pants.shat && !pants.nude) { ctx.fillStyle = 'rgba(92, 58, 22, 0.85)'; ctx.beginPath(); ctx.ellipse(-4, -10, 5, 3, 0, 0, Math.PI * 2); ctx.fill(); }
  leg(ctx, [4, -12], [18, -15], [27, -2], false, pants);
  // The upper body, leaned about his hips
  ctx.save();
  ctx.translate(HX, HY + up); ctx.rotate(lean); ctx.translate(-HX, -HY + DY);
  if (!pants.nude) drawBelt(ctx, -26, 4);
  drawTorso(ctx, -50, 24, -48);
  const mood: Mood = q.mood === 'flinch' ? 'yell' : q.mood === 'snarl' ? 'roar' : q.mood === 'bored' ? 'scowl' : 'grit';
  const hy = -54;
  if (q.mood === 'flinch') { ctx.save(); ctx.translate(1, hy); ctx.rotate(-0.25); ctx.translate(-1, -hy); }
  drawHead(ctx, 1, hy, mood, frame);
  if (q.mood === 'flinch') {
    // (eyes screwed shut)
    ctx.fillStyle = skinTone; ctx.fillRect(-7.5, hy - 5.8, 7, 4); ctx.fillRect(2, hy - 5.8, 7, 4);
    ctx.fillStyle = '#18181B'; ctx.fillRect(-7, hy - 4, 6, 1.3); ctx.fillRect(2.5, hy - 4, 6, 1.3);
    drawGlasses(ctx, 1, hy - 4);
    ctx.restore();
  }
  // (bored: heavy-lidded)
  if (q.mood === 'bored') { ctx.fillStyle = skinTone; ctx.fillRect(-7.5, hy - 6.5, 16, 2.6); drawGlasses(ctx, 1, hy - 4); }
  ctx.restore();
  // (the near arm, last: the stick, elbow out; or crossed over the other; hanging, up toward the roof)
  const fF = reach(sF, hang ? [12, -64] : pilot ? stickTop : T(-6, -32));
  drawArmTo(ctx, sF, elbow(sF, fF, pilot), fF, false);
};
