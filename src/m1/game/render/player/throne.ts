// On the throne (Player.throne: Meathead 2's star toilets on Thrones of the Stars): sat on a famous toilet, side on,
// facing +x (the bowl's way), his jeans down round his boots, bare thighs out level, going. Drawn in his local frame:
// (0, 0) is the floor the toilet stands on, under his hips; the seat's top is 34 up.
//
//   'push'    hunched forward, fists on his knees, trembling with it, red in the face, eyes squeezed shut, the vein up,
//             sweating.
//   'relief'  slumped back against the tank, one hand dangling between his knees, eyes shut, a grin.
//   'uhoh'    bolt upright, gripping the seat, eyes wide, mouth open, sweating buckets.
// Bare legs (pants down) whatever he's wearing; the jeans bunched at his ankles (shat: brown in them; naked: no jeans).

import type { Player } from '../../../types';
import { drawArmTo, drawTorso, drawHead, drawGlasses, drawBoot, skinTone, skinShadow, skinHighlight, skinVein, isTalkingNow, type Mood } from './body';
import type { LadderPants } from './ladder';

type Ctx = CanvasRenderingContext2D;
type Throne = NonNullable<Player['throne']>;
type Pt = [number, number];

/** The seat's top, up from the floor the toilet's on (the coaster's toilets: art.ts). */
export const THRONE_SEAT = 34;

/** An elbow for an arm from shoulder `s` to fist `f` (upper arm 12, forearm 11), bent out `down` or up. */
const elbow = (s: Pt, f: Pt, down: boolean): Pt => {
  const a = 12, b = 11, dx = f[0] - s[0], dy = f[1] - s[1], d = Math.min(a + b - 0.5, Math.hypot(dx, dy) || 1);
  const base = Math.atan2(dy, dx), off = Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))));
  const ang = base + (down ? off : -off);
  return [s[0] + Math.cos(ang) * a, s[1] + Math.sin(ang) * a];
};
const reach = (s: Pt, f: Pt): Pt => { const dx = f[0] - s[0], dy = f[1] - s[1], d = Math.hypot(dx, dy), m = 22.5; return d <= m ? f : [s[0] + dx / d * m, s[1] + dy / d * m]; };

/** A bare limb from a to b, `w` thick: skin, shaded under, lit over, hairy. */
const bare = (ctx: Ctx, a: Pt, b: Pt, w: number, far: boolean) => {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  ctx.save(); ctx.translate(a[0], a[1]); ctx.rotate(Math.atan2(b[1] - a[1], b[0] - a[0]));
  ctx.fillStyle = far ? skinShadow : skinTone; ctx.beginPath(); ctx.roundRect(-w / 2, -w / 2, len + w, w, w / 2); ctx.fill();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.14)'; ctx.fillRect(0, w / 2 - 2.5, len, 2);
  if (!far) { ctx.fillStyle = skinHighlight; ctx.fillRect(1, -w / 2 + 1, len - 2, 1.2); }
  ctx.fillStyle = 'rgba(60, 35, 15, 0.55)';
  for (let i = 0; i < Math.floor(len / 3.5); i++) ctx.fillRect(1 + i * 3.5, -w / 2 + 1.5 + ((i * 2.7) % (w - 3)), 1.3, 1);
  ctx.restore();
};

interface Look { lean: number; back: Pt; front: Pt; mood: Mood }
const lookOf = (q: Throne): Look => {
  if (q.mood === 'uhoh') return { lean: 0.02, back: [-9, -35], front: [5, -33], mood: 'yell' };
  if (q.mood === 'relief') return { lean: -0.08, back: [9, -27], front: [13, -41], mood: 'grit' };
  // (pushing: hunched over his knees, fists on them)
  return { lean: 0.24 + 0.06 * q.push, back: [13, -44], front: [18, -43], mood: 'grit' };
};

/** Him on the throne (local frame, facing +x). */
export const drawThronePose = (ctx: Ctx, q: Throne, frame: number, pants: LadderPants) => {
  const k = lookOf(q);
  // (trembling with it, pushing)
  const shake = q.mood === 'push' ? Math.sin(frame * 1.9) * 0.7 * q.push : q.mood === 'uhoh' ? Math.sin(frame * 2.7) * 0.5 : 0;
  // The upper body: the standing torso set on his hips down on the seat (14 lower), leaned about them
  const DY = -14, PX = 0, PY = -38;
  const T = (x: number, y: number): Pt => {
    const c = Math.cos(k.lean), s = Math.sin(k.lean), vx = x - PX, vy = y + DY - PY;
    return [PX + vx * c - vy * s + shake, PY + vx * s + vy * c];
  };
  const sB = T(-8, -45), sF = T(6, -45);
  const fB = reach(sB, k.back), fF = reach(sF, k.front);
  // (the far arm, the far leg)
  drawArmTo(ctx, sB, elbow(sB, fB, true), fB, true);
  bare(ctx, [0, -39], [15, -39], 9, true); bare(ctx, [15, -39], [17, -9], 8, true);
  drawBoot(ctx, 13, -8, 12, 7, false);
  // (his bare ass on the seat, hanging over the back of it)
  ctx.fillStyle = skinTone; ctx.beginPath(); ctx.ellipse(-3, -37, 10, 6.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = skinShadow; ctx.beginPath(); ctx.ellipse(-4, -33.5, 8, 2.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = skinHighlight; ctx.fillRect(-9, -42, 6, 1.2);
  // (the near leg)
  bare(ctx, [3, -37], [19, -37], 10, false); bare(ctx, [19, -37], [21, -8], 9, false);
  ctx.fillStyle = skinTone; ctx.beginPath(); ctx.arc(19, -37, 5, 0, Math.PI * 2); ctx.fill();
  drawBoot(ctx, 16, -8, 14, 8, true);
  // (the jeans round his boots, the belt hanging off them; shat in: brown in the waistband)
  if (!pants.nude) {
    ctx.fillStyle = '#172554'; ctx.beginPath(); ctx.ellipse(16, -10, 11, 6, -0.1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1E3A8A'; ctx.beginPath(); ctx.ellipse(19, -11, 10, 5.5, -0.1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; for (const x of [12, 17, 22]) ctx.fillRect(x, -14, 1, 7);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'; ctx.fillRect(12, -15.5, 14, 1);
    if (pants.shat) { ctx.fillStyle = '#5C3A16'; ctx.beginPath(); ctx.ellipse(18, -14.5, 6, 2, 0, 0, Math.PI * 2); ctx.fill(); }
    // (the belt: down off the waistband, the buckle on the floor)
    ctx.strokeStyle = '#78350F'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(25, -12); ctx.quadraticCurveTo(31, -8, 30, -2); ctx.stroke();
    ctx.fillStyle = '#FACC15'; ctx.fillRect(27.5, -3, 6, 3);
  }
  // The upper body
  ctx.save();
  ctx.translate(PX + shake, PY); ctx.rotate(k.lean); ctx.translate(-PX, -PY + DY);
  // (bare to the hips: no belt, it's round his boots)
  ctx.fillStyle = skinTone; ctx.beginPath(); ctx.roundRect(-12, -28, 24, 8, 3); ctx.fill();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)'; ctx.fillRect(-12, -28, 6, 8);
  drawTorso(ctx, -50, 24, -48);
  const hx = 1, hy = -54, ey = hy - 4, talking = isTalkingNow();
  drawHead(ctx, hx, hy, k.mood, frame);
  if (q.mood === 'push') {
    // (red in the face; eyes squeezed shut; the vein up; sweat)
    ctx.fillStyle = `rgba(220, 38, 38, ${0.15 + 0.35 * q.push})`; ctx.beginPath(); ctx.roundRect(hx - 10, hy - 11, 20, 19, [3, 3, 3, 3]); ctx.fill();
    ctx.fillStyle = skinTone; ctx.fillRect(hx - 8.5, ey - 1.8, 7, 4); ctx.fillRect(hx + 1, ey - 1.8, 7, 4);
    ctx.fillStyle = '#18181B';
    ctx.fillRect(hx - 8, ey, 6, 1.3); ctx.fillRect(hx + 1.5, ey, 6, 1.3);
    ctx.fillRect(hx - 8, ey - 1.5, 1, 1); ctx.fillRect(hx - 8, ey + 1.6, 1, 1); ctx.fillRect(hx + 7, ey - 1.5, 1, 1); ctx.fillRect(hx + 7, ey + 1.6, 1, 1);
    ctx.strokeStyle = skinVein; ctx.lineWidth = 1.6 + q.push;
    ctx.beginPath(); ctx.moveTo(hx + 2, hy - 11); ctx.lineTo(hx + 5, hy - 8); ctx.lineTo(hx + 3, hy - 6); ctx.stroke();
  } else if (q.mood === 'relief') {
    // (eyes shut, content)
    ctx.fillStyle = skinTone; ctx.fillRect(hx - 8.5, ey - 1.8, 7, 4); ctx.fillRect(hx + 1, ey - 1.8, 7, 4);
    ctx.strokeStyle = '#18181B'; ctx.lineWidth = 1.1;
    for (const ex of [hx - 5, hx + 4]) { ctx.beginPath(); ctx.arc(ex, ey - 0.5, 2.6, 0.2, Math.PI - 0.2); ctx.stroke(); }
    if (!talking) {
      ctx.fillStyle = skinTone; ctx.fillRect(hx - 7, hy + 2, 14, 5);
      ctx.strokeStyle = '#18181B'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(hx + 1, hy + 1.5, 5, 0.35, Math.PI - 0.35); ctx.stroke();
    }
  } else {
    // (eyes wide)
    for (const ex of [hx - 5, hx + 4]) {
      ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(ex, ey, 3.3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#09090B'; ctx.fillRect(ex - 0.6, ey - 0.6, 1.4, 1.4);
    }
  }
  drawGlasses(ctx, hx, ey);
  if (q.mood !== 'relief') {
    // (sweat, running down off his head)
    const n = q.mood === 'uhoh' ? 3 : 2;
    for (let i = 0; i < n; i++) {
      const s = ((frame + i * 17) % 40) / 40;
      ctx.fillStyle = 'rgba(186, 230, 253, 0.9)';
      ctx.beginPath(); ctx.ellipse(hx + (i % 2 ? 10 : -10) + (i === 2 ? 4 : 0), hy - 10 + s * 18, 1.3, 2, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
  // (the near arm, last)
  drawArmTo(ctx, sF, elbow(sF, fF, true), fF, false);
};
