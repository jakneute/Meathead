// His poses on a ladder (Meathead 2's ladders: src/m2/moves/ladders.ts; Player.ladder). Drawn in his local frame
// (feet at 0, facing +x; the ladder runs up the middle of him, its rails at ±14).
//
//   Climbing (and the rush up), holding on still (the last frame held), climbing over the top, and the slide down:
//   seen from behind, facing into the ladder, the classic way (the back
//   of his head, his back, the belt and the seat of his pants from behind: clean, shitty or bare). Hand over hand, each
//   hand and foot on a real rung (where the rungs are, from how far up it he is), a hand and the opposite foot moving
//   together, each held on its rung while he goes up past it, then let go and reached up two rungs; the gun stays in
//   one fist, up along the rail. The slide: both hands up on the rails, smoking, the boots out on the rails.
//   Hanging (turned out to shoot): side-on, drawn in drawPlayer's vine pose: the far hand on a rung over his head (here),
//   a foot on a rung and the near knee up on the next (here), the gun arm out level (the vine's).

import type { Player } from '../../../types';
import { drawArmTo, drawLeg, drawPantLeg, pantsColor, pantsShadow, skinTone, skinShadow, skinHighlight, beltColor, bootColor, glassesOn } from './body';

type Ctx = CanvasRenderingContext2D;
type Ladder = NonNullable<Player['ladder']>;

/** How long, of each two-rung cycle, a hand or foot stays on its rung (the rest: reaching for the next). */
const HOLD = 0.62;
const frac = (v: number) => v - Math.floor(v);

/**
 * Where a hand or foot is (local y), on its rung `k` rungs over his feet, in the cycle `off` rungs on (0 or 1: the two
 * pairs), and how far through a reach it is (0: on a rung).
 */
const limb = (l: Ladder, k: number, off: number) => {
  const R = l.rung, a = frac((l.up / R + off) / 2);
  // (no higher than the tops of the rails: up there, it's hold of them)
  const top = -l.reach + 3;
  if (a <= HOLD) return { y: Math.max(top, (2 * a - k) * R), reach: 0 };
  const t = (a - HOLD) / (1 - HOLD), e = t * t * (3 - 2 * t);
  const from = (2 * HOLD - k) * R, to = (2 * a - k - 2) * R;
  return { y: Math.max(top, from + (to - from) * e), reach: Math.sin(Math.PI * t) };
};

/** The rung nearest `y` (local), as it is up the ladder. */
const rungNear = (l: Ladder, y: number) => {
  const R = l.rung, o = frac(l.up / R) * R;
  return Math.max(-l.reach + 3, o + Math.round((y - o) / R) * R);
};

// ---------------------------------------------------------------------------------------------------------------
// Hanging, turned out to shoot (side-on: the rest of him is drawPlayer's vine pose)

/** A leg from the hip to the foot on (fx, fy) (the ankle; the boot's sole on the rung under it), the knee forward. */
const legTo = (ctx: Ctx, hipX: number, fx: number, rungY: number, back: boolean) => {
  const hip: [number, number] = [hipX, -22], L1 = 11, L2 = 10.5;
  let fy = rungY - 3.5;
  let dx = fx - hip[0], dy = fy - hip[1], d = Math.hypot(dx, dy);
  const max = L1 + L2 - 0.5;
  if (d > max) { fy = hip[1] + (dy / d) * max; dx = fx - hip[0]; dy = fy - hip[1]; d = Math.hypot(dx, dy); }
  // (the knee out in front, whichever bend puts it there)
  const phi = Math.atan2(dy, dx), al = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * (d || 1)))));
  const k1 = Math.cos(phi + al), k2 = Math.cos(phi - al), ang = k1 > k2 ? phi + al : phi - al;
  const knee: [number, number] = [hip[0] + Math.cos(ang) * L1, hip[1] + Math.sin(ang) * L1];
  drawLeg(ctx, hip, knee, [fx, fy], 0, back);
};

/** Hanging: the far arm up, its hand on a rung over his head. */
export const drawLadderBackArm = (ctx: Ctx, l: Ladder) => {
  const sh: [number, number] = [-9, -46], fist: [number, number] = [-2, rungNear(l, -88)];
  drawArmTo(ctx, sh, [(sh[0] + fist[0]) / 2 - 6, (sh[1] + fist[1]) / 2 + 3], fist, true, 5.5);
};

/** Hanging: stood on a rung, the near knee up on the next one (if it's not too high: otherwise on the same one). */
export const drawLadderLegs = (ctx: Ctx, l: Ladder) => {
  const r = rungNear(l, -3), r2 = r - l.rung >= -20 ? r - l.rung : r;
  legTo(ctx, -4, -4, r, true);
  legTo(ctx, 5, 6, r2, false);
};

// ---------------------------------------------------------------------------------------------------------------
// Climbing and sliding: from behind

/** What his pants are like: blown off him (`nude`), and shitty (the seat, or with them gone, the backs of his legs). */
export interface LadderPants { nude: boolean; shat: boolean }

const PALE = '#F3D0AC', PALE_SHADE = '#D9A97C', STAIN = 'rgba(92, 58, 22, 0.8)', STAIN_DARK = 'rgba(64, 38, 12, 0.85)';
const HAIR = '#18181B', HAIR_LIT = '#3F3F46';

/** A limb segment, a to b, `w` wide: a pant leg (or bare leg) along it. */
const seg = (ctx: Ctx, ax: number, ay: number, bx: number, by: number, w: number, color: string) => {
  const len = Math.hypot(bx - ax, by - ay);
  ctx.save(); ctx.translate(ax, ay); ctx.rotate(Math.atan2(by - ay, bx - ax) - Math.PI / 2);
  drawPantLeg(ctx, -w / 2, 0, w, len + 1, color);
  ctx.restore();
};

/**
 * A leg from behind: hip at (hx, -22), the ankle at (fx, fy). The higher the foot, the more the knee's bent (toward the
 * ladder, away from us: the thigh foreshortened, the calf under it); the boot from behind, its sole showing when it's
 * up off its rung.
 */
const backLeg = (ctx: Ctx, side: number, fx: number, fy: number, pants: LadderPants, lifted: number, hx = side * 6, hy = -22, kneeOut = 0) => {
  const kx = (hx + fx) / 2 + side * (1.5 + kneeOut), ky = Math.min((hy + fy) / 2 + 2, fy - 6);
  const col = side < 0 ? pantsShadow : pantsColor;
  seg(ctx, kx, ky, fx, fy, 9, col);
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(kx, ky, 4.8, 0, Math.PI * 2); ctx.fill();
  seg(ctx, hx, hy, kx, ky, 11, col);
  // (the crease behind the knee)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'; ctx.fillRect(kx - 4, ky - 0.5, 8, 1);
  if (pants.shat) {
    // (run down the back of it, the inside)
    ctx.fillStyle = STAIN; ctx.fillRect(hx - side * 3.5 - 1, hy + 2, 2.5, Math.max(4, ky - hy + 2));
  }
  // The boot from behind: the shaft, the heel; the sole tipped up at us when it's lifted
  ctx.fillStyle = bootColor; ctx.beginPath(); ctx.roundRect(fx - 5.5, fy - 4, 11, 8, 2); ctx.fill();
  ctx.fillStyle = '#3F3F46'; ctx.fillRect(fx - 4.5, fy - 3.5, 9, 1);
  ctx.fillStyle = '#27272A'; ctx.fillRect(fx - 4, fy + 1, 8, 2);
  if (lifted > 0.15) {
    const sh = 1 + Math.round(lifted * 3);
    ctx.fillStyle = '#52525B'; ctx.fillRect(fx - 5.5, fy + 4, 11, sh);
    ctx.fillStyle = '#18181B'; for (let k = 0; k < sh; k += 2) ctx.fillRect(fx - 4.5, fy + 4 + k, 9, 1);
  }
};

/** His seat and the belt from behind: the back pockets, the seam; shitty; or bare (white as the rest of him isn't), and the lot hanging down. */
const seat = (ctx: Ctx, pants: LadderPants, frame: number, sway: number) => {
  const top = -27;
  if (pants.nude) {
    // (the gap between his thighs, dark; the cheeks, the crack)
    ctx.fillStyle = '#2A160A'; ctx.fillRect(-2, -20, 4, 6);
    ctx.fillStyle = PALE;
    ctx.beginPath(); ctx.ellipse(-5.5, -21.5, 6.5, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(5.5, -21.5, 6.5, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = PALE_SHADE; ctx.fillRect(-11, -16.5, 9, 1); ctx.fillRect(2, -16.5, 9, 1);
    ctx.fillStyle = '#8A5A3A'; ctx.fillRect(-0.5, -26, 1, 9);
    // (the tan line round his waist)
    ctx.fillStyle = PALE; ctx.fillRect(-12, top, 24, 3);
    // (between his legs, from behind: swinging as he climbs)
    const sx = sway * 1.8;
    ctx.fillStyle = '#7A4626'; ctx.beginPath(); ctx.ellipse(sx - 1.6, -13.5, 2.4, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(sx + 1.8, -13, 2.4, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4A2812'; ctx.fillRect(sx - 0.3, -15.5, 0.8, 4);
    if (pants.shat) {
      ctx.fillStyle = STAIN; ctx.beginPath(); ctx.ellipse(0, -18.5, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
    }
    return;
  }
  // (the seat of his jeans: each cheek lit a little, the seam down the middle, a back pocket on each)
  ctx.fillStyle = pantsColor; ctx.beginPath(); ctx.roundRect(-12.5, top, 25, 12, [0, 0, 5, 5]); ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'; ctx.beginPath(); ctx.ellipse(-6, -22, 4.5, 3.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(6, -22, 4.5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'; ctx.fillRect(-0.6, top + 2, 1.2, 10); ctx.fillRect(-12, -15.5, 24, 1);
  for (const px of [-6.5, 6.5]) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; ctx.beginPath(); ctx.moveTo(px - 4, -23.5); ctx.lineTo(px + 4, -23.5); ctx.lineTo(px + 3.5, -18.5); ctx.lineTo(px, -17); ctx.lineTo(px - 3.5, -18.5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#CA8A04'; ctx.fillRect(px - 3, -22, 6, 0.7);
  }
  // (the ring a can of dip's worn into the one pocket)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(6.5, -20.5, 2, 0, Math.PI * 2); ctx.stroke();
  if (pants.shat) {
    // (the seat soaked through, dark in the middle, running)
    ctx.fillStyle = STAIN; ctx.beginPath(); ctx.ellipse(0, -19, 8, 4.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = STAIN_DARK; ctx.beginPath(); ctx.ellipse(0, -18, 4.5, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(200, 160, 100, 0.35)'; ctx.fillRect(-3, -21, 3, 0.8);
    ctx.fillStyle = STAIN; ctx.fillRect(-2.5, -15, 2, 3 + ((frame >> 4) % 3));
  }
  // The belt, wide at the back: the strap, studs, stitching
  ctx.fillStyle = beltColor; ctx.fillRect(-13, top, 26, 6);
  ctx.fillStyle = '#451A03'; ctx.fillRect(-13, top + 5, 26, 1);
  ctx.fillStyle = '#D97706'; for (let x = -12; x < 12; x += 2.5) { ctx.fillRect(x, top + 0.8, 1.3, 0.6); ctx.fillRect(x, top + 4.2, 1.3, 0.6); }
  ctx.fillStyle = '#E5E7EB'; for (const x of [-8, -3, 2, 7]) ctx.fillRect(x, top + 2.2, 1.5, 1.5);
};

/** His back: the lats flared out, the shoulder blades (riding up with whichever arm's up), the spine, the traps. */
const back = (ctx: Ctx, lift: number) => {
  const top = -50;
  ctx.fillStyle = skinTone;
  ctx.beginPath(); ctx.moveTo(-15, top + 1); ctx.lineTo(15, top + 1); ctx.lineTo(17, top + 9); ctx.lineTo(13, -27); ctx.lineTo(-13, -27); ctx.lineTo(-17, top + 9); ctx.closePath(); ctx.fill();
  // (the far side of him in shadow, the lats' edges)
  ctx.fillStyle = 'rgba(150, 90, 35, 0.3)'; ctx.fillRect(-15, top + 2, 4, 22);
  ctx.fillStyle = skinShadow; ctx.fillRect(-16, top + 9, 2, 7); ctx.fillRect(14, top + 9, 2, 7);
  // (the spine, the ridge of muscle each side of it)
  ctx.fillStyle = skinShadow; ctx.fillRect(-0.6, top + 4, 1.2, 21);
  ctx.fillStyle = skinHighlight; ctx.fillRect(-3.5, -36, 2, 8); ctx.fillRect(1.5, -36, 2, 8);
  // (the shoulder blades, each up with its arm)
  for (const side of [-1, 1]) {
    const up = (side < 0 ? lift : -lift) * 1.5;
    ctx.fillStyle = skinHighlight; ctx.beginPath(); ctx.ellipse(side * 7, top + 8 - up, 4.5, 3.5, side * 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = skinShadow; ctx.fillRect(side * 7 - 4, top + 12 - up, 8, 1);
  }
  // (the traps, up to his neck)
  ctx.fillStyle = skinTone; ctx.beginPath(); ctx.moveTo(-13, top + 2); ctx.lineTo(-5, top - 6); ctx.lineTo(5, top - 6); ctx.lineTo(13, top + 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = skinShadow; ctx.fillRect(-6, top + 2, 12, 0.9);
  // (sweat)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; ctx.fillRect(4, -40, 1, 1.5); ctx.fillRect(-9, -34, 1, 1);
};

/** The back of his head: the flat-top, the back cropped short, the ears, the thick neck. */
const backOfHead = (ctx: Ctx, hy0: number) => {
  // (on whole pixels: crisp, like the side-on head; the same size as it, 20 wide, the flat-top on top)
  const hy = Math.round(hy0);
  // The thick neck, down into the traps (in shadow under his skull, lit down the middle)
  ctx.fillStyle = skinShadow; ctx.fillRect(-7, hy + 3, 14, 9);
  ctx.fillStyle = skinTone; ctx.fillRect(-5, hy + 5, 10, 7);
  ctx.fillStyle = skinShadow; ctx.fillRect(0, hy + 6, 1, 6);
  // The ears, out either side (the rim lit, the hollow dark)
  for (const x of [-13, 10]) {
    ctx.fillStyle = skinTone; ctx.beginPath(); ctx.roundRect(x, hy - 7, 3, 7, 1); ctx.fill();
    ctx.fillStyle = '#A0662E'; ctx.fillRect(x + 1, hy - 5, 1, 3);
  }
  // The skull: skin at the nape, the back cropped short (dark), rounded off at the bottom corners
  ctx.fillStyle = skinTone; ctx.beginPath(); ctx.roundRect(-10, hy - 12, 20, 18, [3, 3, 6, 6]); ctx.fill();
  ctx.fillStyle = '#27272A'; ctx.beginPath(); ctx.roundRect(-10, hy - 12, 20, 13, [3, 3, 4, 4]); ctx.fill();
  // (the hairline at the nape: a ragged edge of stubble onto the skin band)
  ctx.fillStyle = '#3F3F46'; for (let x = -8; x < 8; x += 2) ctx.fillRect(x, hy + 1, 1, 1);
  ctx.fillStyle = skinHighlight; ctx.fillRect(-6, hy + 3, 12, 1);
  // (the crop lit from above, a little, down the one side)
  ctx.fillStyle = '#3F3F46'; ctx.fillRect(3, hy - 10, 5, 1); ctx.fillRect(6, hy - 9, 2, 6);
  // The flat-top: flat across, squared off at the sides, the bristles
  ctx.fillStyle = HAIR; ctx.fillRect(-10, hy - 16, 20, 5); ctx.fillRect(-11, hy - 14, 22, 6);
  ctx.fillStyle = HAIR_LIT; ctx.fillRect(-8, hy - 15, 14, 1);
  ctx.fillStyle = '#52525B'; for (let i = 0; i < 7; i++) ctx.fillRect(-9 + i * 3, hy - 17, 1, 1);
  // (Meathead 2's glasses: their arms over the tops of his ears, hooked down behind them)
  if (glassesOn()) for (const s of [-1, 1]) {
    const x = s < 0 ? -13.5 : 9.5;
    ctx.fillStyle = '#09090B'; ctx.fillRect(x, hy - 7, 4, 1.3); ctx.fillRect(s < 0 ? x + 0.4 : x + 2.6, hy - 6, 1, 3);
    ctx.fillStyle = '#52525B'; ctx.fillRect(x + 0.6, hy - 7, 2.8, 0.4);
  }
};

/**
 * Climbing or sliding down a ladder, seen from behind. `weapon` draws what's in his hand as it's drawn held stood up
 * (at the origin, the barrel along +x): up along the rail in his +x fist.
 */
export const drawLadderClimb = (ctx: Ctx, l: Ladder, frame: number, pants: LadderPants, weapon: (c: Ctx) => void) => {
  const slide = l.mode === 'slide', mount = l.mode === 'mount';
  // Climbing over the top: crouched over it (squashed down, most of the way through), both hands on the lip, a knee
  // up onto it, his head down between his shoulders
  const bend = mount ? Math.sin(Math.PI * Math.min(1, (l.k ?? 0) * 1.15)) : 0, sq = 1 - 0.38 * bend;
  if (mount) { ctx.save(); ctx.scale(1, sq); }
  const lipY = Math.max(-95, Math.min(-30, -l.lip / sq - 2));
  // (the hands and feet: on their rungs, by the cycle, held where they were when he stops; sliding, up on the rails
  // and the boots out on them)
  const hA = slide ? { y: Math.max(-l.reach + 3, -88), reach: 0 } : mount ? { y: lipY, reach: 0 } : limb(l, 7, 0);
  const hB = slide ? { y: Math.max(-l.reach + 3, -88), reach: 0 } : mount ? { y: lipY, reach: 0 } : limb(l, 7, 1);
  const span = 2 * HOLD * l.rung, step = (y: number) => -15 + (y + l.rung) * (15 / span) - 3.5;
  const still = slide || mount;
  const fA = still ? { y: 0, reach: 0 } : limb(l, 1, 1), fB = still ? { y: 0, reach: 0 } : limb(l, 1, 0);
  const fAy = slide || mount ? -3.5 : step(fA.y), fBy = slide ? -3.5 : mount ? -15 : step(fB.y);
  // (his hips shift toward the leg that's down, his back rises with the arm that's up)
  const lift = still ? 0 : Math.max(-1, Math.min(1, (hB.y - hA.y) / 16));
  const sway = still ? 0 : Math.sin((l.up / l.rung) * Math.PI);
  // Legs (the -x one in shadow), the seat and belt over their tops
  backLeg(ctx, -1, slide ? -9 : -6, fAy, pants, still ? 0 : Math.max(0, (-fAy - 4) / 11));
  backLeg(ctx, 1, slide ? 9 : 6, fBy, pants, slide ? 0 : mount ? 0.8 : Math.max(0, (-fBy - 4) / 11));
  seat(ctx, pants, frame, sway);
  // (bent over the top: his head down under the line of his shoulders, behind his back)
  // (bent over the top: his head down under the line of his shoulders, behind his back; drawn unsquashed, crisp)
  if (mount) { ctx.restore(); backOfHead(ctx, -55 + (-56 * sq + 3 + 55) * bend); ctx.save(); ctx.scale(1, sq); }
  back(ctx, lift);
  // Arms: up to the rungs (or down on the lip), the elbows out; the gun up along the rail in the +x fist
  const arm = (side: number, h: { y: number; reach: number }, lit: boolean) => {
    const sh: [number, number] = [side * 14, -47];
    const fist: [number, number] = [side * (mount ? 17 : 13) + side * h.reach * 3, h.y];
    const el: [number, number] = [(sh[0] + fist[0]) / 2 + side * 7, (sh[1] + fist[1]) / 2 + 2];
    drawArmTo(ctx, sh, el, fist, !lit, 5.5);
    return fist;
  };
  const fa = arm(-1, hA, false);
  ctx.save(); ctx.translate((mount ? 17 : 13) + hB.reach * 3, hB.y); ctx.rotate(-Math.PI / 2); ctx.translate(-1, -4); weapon(ctx); ctx.restore();
  const fb = arm(1, hB, true);
  // (his head between his arms, over them: they're out beside it)
  if (!mount) backOfHead(ctx, -55);
  if (slide) { smoke(ctx, fa[0], fa[1], frame); smoke(ctx, fb[0], fb[1], frame + 7); }
  if (mount) ctx.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Hauling on something over his head with both hands (Player.leverPull): from behind, facing into the wall it's on

export type OverheadPull = NonNullable<Player['leverPull']>;

/** An arm from the shoulder to the fist, the elbow bent (out to its side, and down) as far as the arm's too long for the reach. */
const reachArm = (ctx: Ctx, side: number, sh: [number, number], fist: [number, number], lit: boolean) => {
  const dx = fist[0] - sh[0], dy = fist[1] - sh[1], d = Math.hypot(dx, dy) || 1, ARM = 15;
  const out = Math.sqrt(Math.max(0, ARM * ARM - (d / 2) * (d / 2)));
  // (the perpendicular that points out his side of him)
  let nx = -dy / d, ny = dx / d;
  if (nx * side < 0) { nx = -nx; ny = -ny; }
  // (bent a lot, it's mostly forward, toward the wall, away from us: the elbow down more than out)
  const el: [number, number] = [(sh[0] + fist[0]) / 2 + nx * out * 0.45, (sh[1] + fist[1]) / 2 + ny * out * 0.45 + out * 0.55 + 1];
  drawArmTo(ctx, sh, el, fist, !lit, 5.5);
};

/**
 * Hauling on a lever (or anything) over his head, seen from behind (the ladder's back view: the back of his head, his
 * back, the seat of his pants, clean, shitty or bare). In his local frame: `l.gx`, `l.gy` the grip, from his feet.
 * Reaching up for it (up on his toes), taking hold, the haul (sunk down, the knees out, the one foot stepped out
 * and braced, the hips swung out away from the way it's going and his back leant into it, shaking with the strain),
 * the jolt as it hits its stop, letting go of it (his hands back down at his sides). His weapon's put away.
 */
export const drawOverheadPull = (ctx: Ctx, l: OverheadPull, frame: number, pants: LadderPants) => {
  const { hold, load, jolt } = l, lean = l.lean;
  // (the strain: a shake, on whole pixels, while he's hauling, not once it's down)
  const shake = load > 0.25 && jolt === 0 && hold > 0.9 ? ((frame >> 1) % 2 ? 0.7 : -0.7) * load : 0;
  // (up on his toes reaching; sunk down under the load; knocked down a little more by the jolt)
  const sink = Math.round(-3 * hold * (1 - load) + 12 * load + 3 * jolt);
  const hipX = -lean * load * 4 + shake, tilt = lean * load * 0.14 - lean * jolt * 0.05;
  // Legs: the one away from the pull stepped out wide and braced, the other under him; the knees out as he sinks
  const toes = Math.max(0, hold * (1 - load) - 0.3);
  backLeg(ctx, -1, -7 - 6 * load * (lean >= 0 ? 1 : 0.3), -3.5, pants, toes, hipX - 6, -22 + sink, 3 * load);
  backLeg(ctx, 1, 7 + 6 * load * (lean < 0 ? 1 : 0.3), -3.5, pants, toes, hipX + 6, -22 + sink, 3 * load);
  // The rest of him: down with his hips, leant over about them
  ctx.save();
  ctx.translate(hipX, sink); ctx.translate(0, -24); ctx.rotate(tilt); ctx.translate(0, 24);
  seat(ctx, pants, frame, shake * 1.5 + jolt * 1.5);
  // (where the grip is, in this frame: back out of the sink and the lean)
  const gx0 = l.gx - hipX, gy0 = l.gy - sink + 24, c = Math.cos(-tilt), s = Math.sin(-tilt);
  const gx = gx0 * c - gy0 * s, gy = gx0 * s + gy0 * c - 24;
  // (his fists either side of the grip along the handle: the one on his side of it each)
  const ux = Math.cos(l.ang) * 5, uy = Math.sin(l.ang) * 5;
  const a: [number, number] = [gx - ux, gy - uy], b: [number, number] = [gx + ux, gy + uy];
  const [left, right] = a[0] - a[1] * 0.05 <= b[0] - b[1] * 0.05 ? [a, b] : [b, a];
  // (from down at his sides, up onto it)
  const e = hold * hold * (3 - 2 * hold);
  const fist = (side: number, on: [number, number]): [number, number] => [side * 17 + (on[0] - side * 17) * e, -21 + (on[1] + 21) * e];
  // (the arm reaching across him, the far side of him from us: behind his back)
  const fl = fist(-1, left), fr = fist(1, right), across = (side: number, f: [number, number]) => f[0] * side < 4;
  if (across(-1, fl)) reachArm(ctx, -1, [-14, -47], fl, false);
  if (across(1, fr)) reachArm(ctx, 1, [14, -47], fr, true);
  back(ctx, lean * load * 0.8);
  if (!across(-1, fl)) reachArm(ctx, -1, [-14, -47], fl, false);
  if (!across(1, fr)) reachArm(ctx, 1, [14, -47], fr, true);
  // (his head between his arms, sunk down between his shoulders with the effort)
  backOfHead(ctx, -55 + Math.round(load * 2));
  ctx.restore();
};

/** Hands on the rails going down fast: smoke off them. */
const smoke = (ctx: Ctx, x: number, y: number, frame: number) => {
  for (let k = 0; k < 3; k++) {
    const t = ((frame + k * 5) % 15) / 15;
    ctx.fillStyle = `rgba(214, 211, 209, ${(0.55 * (1 - t)).toFixed(2)})`;
    ctx.beginPath(); ctx.arc(x + Math.sin(k * 2.3 + frame) * 3, y - 4 - t * 14, 2 + t * 4, 0, Math.PI * 2); ctx.fill();
  }
};
