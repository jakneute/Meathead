// On a dragon coaster's back (Player.tragon: Meathead 2's Fairy Land, TRUELLING TRAGONS): his own poses, side on,
// facing +x (the ride's way), his boots on the dragon's back at (0, 0), its grab rail along the back 16 up. No gun on
// the ride: both hands are for hanging on.
//
//   ride   crouched low, knees bent, leaning into it, the near fist on the rail ahead, the far one behind; shuffling
//          along it (moving), his boots stepping
//   duck   flat on his belly along the back, both fists on the rail ahead, chin down, eyes shut
//   jump   up off it: knees tucked up, arms out for balance, mouth open
//   hop    the leap to another car: spread-eagled, arms and legs out, eyes wide, yelling
//   brace  a steep drop: crouched right down, leaning back, both fists on the rail, eyes wide, teeth gritted
//   loop   locked in through a loop or a corkscrew: both fists on the rail, white-knuckled, the rest of him flung round
//          it the way gravity has him (hanging off it upside down at the top, laid out along the back at the bottom),
//          swinging, legs flailing, a grimace
//   slip   the same with one hand torn off the rail, clawing at the air, eyes like dinner plates
// Hurt: the head snapped back, eyes shut. Pants as ever: jeans; shat (the stain on the seat); naked (bare legs).

import type { Player } from '../../../types';
import { drawArmTo, drawTorso, drawHead, drawBoot, drawLeg, drawBelt, skinTone, skinShadow, skinHighlight, type Mood } from './body';
import type { LadderPants } from './ladder';

type Ctx = CanvasRenderingContext2D;
type Pose = NonNullable<Player['tragon']>;
type Pt = [number, number];

/** The rail along the dragon's back, up from its top (the ride's art draws it there). */
export const TRAGON_RAIL = 16;

/** The elbow for an arm from shoulder s to fist f (upper arm 12, forearm 11), bent out (up and away) or down. */
const elbow = (s: Pt, f: Pt, out: boolean): Pt => {
  const a = 12, b = 11, dx = f[0] - s[0], dy = f[1] - s[1], d = Math.min(a + b - 0.5, Math.hypot(dx, dy) || 1);
  const base = Math.atan2(dy, dx), off = Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))));
  const ang = base + (out ? -off : off);
  return [s[0] + Math.cos(ang) * a, s[1] + Math.sin(ang) * a];
};
const reach = (s: Pt, f: Pt, m = 22.5): Pt => { const dx = f[0] - s[0], dy = f[1] - s[1], d = Math.hypot(dx, dy); return d <= m ? f : [s[0] + (dx / d) * m, s[1] + (dy / d) * m]; };
/** The knee for a leg from hip h to foot f (thigh 14, shin 13), bent forward (+x) or back. */
const knee = (h: Pt, f: Pt, fwd: boolean): Pt => {
  const a = 14, b = 13, dx = f[0] - h[0], dy = f[1] - h[1], d = Math.min(a + b - 0.5, Math.hypot(dx, dy) || 1);
  const base = Math.atan2(dy, dx), off = Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))));
  const ang = base + (fwd ? -off : off);
  return [h[0] + Math.cos(ang) * a, h[1] + Math.sin(ang) * a];
};
const bare = (ctx: Ctx, a: Pt, b: Pt, w: number, far: boolean) => {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  ctx.save(); ctx.translate(a[0], a[1]); ctx.rotate(Math.atan2(b[1] - a[1], b[0] - a[0]));
  ctx.fillStyle = far ? skinShadow : skinTone; ctx.beginPath(); ctx.roundRect(-w / 2, -w / 2, len + w, w, w / 2); ctx.fill();
  if (!far) { ctx.fillStyle = skinHighlight; ctx.fillRect(1, -w / 2 + 1, len - 2, 1.2); }
  ctx.restore();
};
const leg = (ctx: Ctx, hip: Pt, kn: Pt, foot: Pt, toe: number, far: boolean, pants: LadderPants) => {
  if (!pants.nude) { drawLeg(ctx, hip, kn, foot, toe, far); return; }
  bare(ctx, hip, kn, far ? 9 : 10, far); bare(ctx, kn, foot, far ? 8 : 9, far);
  ctx.save(); ctx.translate(foot[0], foot[1]); ctx.rotate(toe); drawBoot(ctx, -5, -4.5, 15, 8, !far); ctx.restore();
};

/** A figure: where his hips are and how far his upper body leans about them (radians, + forward), his fists, his
 *  feet (knees found), his face. */
export interface Fig {
  hip: Pt; lean: number; fN: Pt; fF: Pt; tN: Pt; tF: Pt; kneeFwd: boolean;
  mood: Mood; eyes?: 'wide' | 'shut' | 'plates'; white?: boolean; headBack?: number; freeF?: boolean;
}
/** The standing figure's hips (his torso's drawn about them). */
const HIP: Pt = [0, -26];

export const drawFig = (ctx: Ctx, q: Fig, frame: number, pants: LadderPants) => {
  const c = Math.cos(q.lean), s = Math.sin(q.lean);
  const T = (x: number, y: number): Pt => { const vx = x - HIP[0], vy = y - HIP[1]; return [q.hip[0] + vx * c - vy * s, q.hip[1] + vx * s + vy * c]; };
  const sB = T(-8, -45), sF = T(6, -45);
  const fB = reach(sB, q.fF), fN = reach(sF, q.fN);
  // (the far arm, the far leg)
  drawArmTo(ctx, sB, elbow(sB, fB, true), fB, true);
  const hF: Pt = T(-3, -24), hN: Pt = T(3, -24);
  leg(ctx, hF, knee(hF, q.tF, q.kneeFwd), q.tF, -0.1, true, pants);
  // (his seat: the stain on it, shat)
  if (pants.shat && !pants.nude) { const [x, y] = T(-8, -22); ctx.fillStyle = 'rgba(92, 58, 22, 0.85)'; ctx.beginPath(); ctx.ellipse(x, y, 5, 4, q.lean, 0, Math.PI * 2); ctx.fill(); }
  leg(ctx, hN, knee(hN, q.tN, q.kneeFwd), q.tN, -0.1, false, pants);
  // The upper body, leaned about his hips
  ctx.save();
  ctx.translate(q.hip[0], q.hip[1]); ctx.rotate(q.lean); ctx.translate(-HIP[0], -HIP[1]);
  if (!pants.nude) drawBelt(ctx, -26, 4);
  else { ctx.fillStyle = skinTone; ctx.beginPath(); ctx.roundRect(-12, -28, 24, 8, 3); ctx.fill(); }
  drawTorso(ctx, -50, 24, -48);
  const hx = 1, hy = -54, ey = hy - 4;
  if (q.headBack) { ctx.save(); ctx.translate(hx, hy + 8); ctx.rotate(-q.headBack); ctx.translate(-hx, -hy - 8); }
  drawHead(ctx, hx, hy, q.mood, frame);
  if (q.eyes === 'shut') {
    ctx.fillStyle = skinTone; ctx.fillRect(hx - 8.5, ey - 1.8, 7, 4); ctx.fillRect(hx + 1, ey - 1.8, 7, 4);
    ctx.fillStyle = '#18181B'; ctx.fillRect(hx - 8, ey, 6, 1.3); ctx.fillRect(hx + 1.5, ey, 6, 1.3);
  } else if (q.eyes) {
    const r = q.eyes === 'plates' ? 4 : 3.2;
    for (const ex of [hx - 5, hx + 4]) {
      ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(ex, ey, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#09090B'; ctx.fillRect(ex - 0.6, ey - 0.6, q.eyes === 'plates' ? 1.2 : 1.6, q.eyes === 'plates' ? 1.2 : 1.6);
    }
  }
  // (sweat flying off him)
  if (q.eyes === 'wide' || q.eyes === 'plates') for (let i = 0; i < 2; i++) {
    const u = ((frame + i * 13) % 26) / 26;
    ctx.fillStyle = 'rgba(186, 230, 253, 0.9)'; ctx.fillRect(hx - 12 - u * 10, hy - 8 + i * 6 - u * 4, 1.6, 1.6);
  }
  if (q.headBack) ctx.restore();
  ctx.restore();
  // (the near arm, last)
  drawArmTo(ctx, sF, elbow(sF, fN, false), fN, false);
  // (white knuckles on the rail)
  if (q.white) for (const [x, y] of q.freeF ? [fN] : [fN, fB]) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x - 2, y - 3, 1.4, 1.4); ctx.fillRect(x + 0.4, y - 3.4, 1.4, 1.4); ctx.fillRect(x + 2.6, y - 2.8, 1.4, 1.4); }
};

/** Him on the dragon (local frame, facing +x). */
export const drawTragonPose = (ctx: Ctx, q: Pose, frame: number, pants: LadderPants) => {
  const R = -TRAGON_RAIL, ow = q.hurt ? 0.35 : 0;
  const mood: Mood = q.hurt ? 'yell' : 'grit';
  switch (q.mode) {
    case 'ride': {
      // (crouched, gripping on; shuffling: his boots stepping in turn, bobbing)
      const st = q.move ? Math.sin(frame * 0.42) : 0, bob = q.move ? Math.abs(st) * 1.5 : Math.sin(frame * 0.12) * 0.6;
      drawFig(ctx, { hip: [-4, -19 - bob], lean: 0.55, fN: [17, R], fF: [9, R], tN: [7 + st * 4, -Math.max(0, st) * 3], tF: [-9 - st * 4, -Math.max(0, -st) * 3], kneeFwd: true, mood, eyes: q.hurt ? 'shut' : undefined, headBack: ow, white: true }, frame, pants);
      return;
    }
    case 'duck':
      // (flat on his belly along the back, fists on the rail ahead)
      drawFig(ctx, { hip: [-14, -7], lean: 1.32, fN: [22, R], fF: [15, R + 1], tN: [-38, -4], tF: [-36, -2], kneeFwd: false, mood, eyes: 'shut', white: true }, frame, pants);
      return;
    case 'jump':
      drawFig(ctx, { hip: [0, -24], lean: 0.1, fN: [20, -58], fF: [-17, -55], tN: [8, -6], tF: [-4, -4], kneeFwd: true, mood: 'yell', eyes: 'wide', headBack: ow }, frame, pants);
      return;
    case 'hop': {
      // (spread-eagled through the air, limbs going)
      const w = Math.sin(frame * 0.6) * 3;
      drawFig(ctx, { hip: [0, -26], lean: 0.18, fN: [24, -64 + w], fF: [-19, -66 - w], tN: [18, -3 - w], tF: [-15, -5 + w], kneeFwd: true, mood: 'yell', eyes: 'wide' }, frame, pants);
      return;
    }
    case 'brace': {
      const sh = Math.sin(frame * 2.3) * 0.6;
      drawFig(ctx, { hip: [-8 + sh, -13], lean: -0.12, fN: [13, R], fF: [7, R], tN: [9, 0], tF: [1, 0], kneeFwd: true, mood: 'grit', eyes: 'wide', white: true, headBack: 0.25 + ow }, frame, pants);
      return;
    }
    case 'loop': case 'slip': {
      // Hung off the rail by his fists, the rest of him flung round it: drawn as if stood with his arms up over his
      // head, then turned about his near fist so his body goes off it along `hang`, the far fist on the rail too (or,
      // slipping, torn off and clawing), legs flailing
      const slip = q.mode === 'slip';
      const kick = Math.sin(frame * (slip ? 0.9 : 0.55)), kick2 = Math.sin(frame * (slip ? 0.75 : 0.47) + 1.7);
      const FN: Pt = [4, -80];
      const fig: Fig = {
        hip: [0, -26], lean: kick * 0.08,
        fN: FN, fF: slip ? [-12 + kick2 * 8, -70 + kick * 8] : [-3, -79],
        tN: [7 + kick * 10, -kick2 * 6], tF: [-6 - kick2 * 10, kick * 5], kneeFwd: kick > 0,
        mood: 'yell', eyes: slip ? 'plates' : 'wide', white: true, freeF: slip,
      };
      ctx.save();
      // (the near fist on the rail just ahead of where he'd stand; the body turned off it: standing's fist-to-feet is
      // straight down the screen, PI/2)
      ctx.translate(6, R); ctx.rotate(q.hang - Math.PI / 2); ctx.translate(-FN[0], -FN[1]);
      drawFig(ctx, fig, frame, pants);
      ctx.restore();
      return;
    }
  }
};
