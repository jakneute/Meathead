// Meathead from behind, on his dragon car (the ride from behind's own poses; crude but readable, the first pass): his
// bare back (lats, the spine's groove, his shoulder blades), the back of his buzzed head, his ears and the arms of his
// nerdy glasses over them, his jeans (or his bare ass), his boots. Elbows and knees from art/limb.ts (a back-on figure:
// out to the sides, never in). Local frame: his car's floor under his boots at the origin, up is -y, the handrails'
// knobs at (+-RAIL_X, -(RAIL_Y - FLOOR_Y)).
//
// He's a huge swaggering gym bro (the owner's: "fit his character more"): from behind, a big V (traps bunched up round
// his neck, lats flared wide, a small waist), every pose cocky and powerful.
//   ride    a wide, low crouch, knees out, elbows out, a fist on each handrail, his traps up
//   duck    hunched like a bull: squatted right down, head sunk between his traps, elbows out, both fists on the rails
//           (the grip: ducking always holds on)
//   jump    an explosive spring: one knee driven up, the other leg kicked down, one fist pumped up over his head, the
//           other arm flexed out wide, lats flared, leaning into it
//   hop     a sideways lunge-leap like a linebacker: the lead shoulder dipped into it, the lead fist tucked in front,
//           the far arm thrown out and up behind, the trailing leg kicked out, the lead knee up
//   land    a heavy squat landing: knees wide, sunk deep, fists on the rails, a bounce out of it
//   grip    hung on through a roll: both fists on the rails, his body swung the way gravity has him (`hang`), leaning
//           (`side`) into the high side
//   dangle  one hand torn off (the warning: almost gone): hanging off the low rail by one fist, the other arm clawing
//           at the air, legs kicking, eyes like dinner plates
//   fling   thrown off: spread-eagled, tumbling

import { elbowFront, kneeFront, reachTo, type P2 } from '../../../art/limb';
import { INK, box, type Ctx } from '../../kit';
import { RAIL_X, RAIL_Y, FLOOR_Y } from './sprites';

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

const SKIN = ['#6E3F1C', '#A0662E', '#C68B45', '#E0AC69', '#F5D0A9'];
const JEANS = ['#0B1438', '#172554', '#1E3A8A', '#2D4FA8', '#4A6CC4'];
const BOOT = ['#050507', '#18181B', '#27272A', '#3F3F46'];
const HAIR = ['#050507', '#18181B', '#2A2A30'];

/** The rail knobs he grips (local frame). */
export const GRIP_L: P2 = [-RAIL_X, -(RAIL_Y - FLOOR_Y)], GRIP_R: P2 = [RAIL_X, -(RAIL_Y - FLOOR_Y)];
const UPPER = 18, FORE = 17, THIGH = 17, SHIN = 17;

const limb = (c: Ctx, a: P2, b: P2, w: number, col: string, lit?: string) => {
  c.strokeStyle = INK; c.lineWidth = w + 2; c.lineCap = 'round';
  c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
  c.strokeStyle = col; c.lineWidth = w;
  c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
  if (lit) { c.strokeStyle = lit; c.lineWidth = Math.max(1, w * 0.25); c.beginPath(); c.moveTo(a[0] - w * 0.2, a[1]); c.lineTo(b[0] - w * 0.2, b[1]); c.stroke(); }
  c.lineCap = 'butt';
};

/** A body: where its parts go (local frame), all joints found. */
interface Body { hip: P2; sho: P2; lean: number; feet: [P2, P2]; hands: [P2, P2]; head: number; plates?: boolean; kick?: number;
  /** Lats flared wider (a jump, a leap); his head sunk down into his traps (a duck, a landing). */
  flare?: number; sink?: number }

const arm = (c: Ctx, s: P2, h: P2, out: number) => {
  const hh = reachTo(s[0], s[1], h[0], h[1], UPPER, FORE);
  const e = elbowFront(s[0], s[1], hh[0], hh[1], UPPER, FORE, out);
  limb(c, s, e, 11, SKIN[3], SKIN[4]); limb(c, e, hh, 9, SKIN[3], SKIN[4]);
  // (the bicep's bulge, the delt's cap)
  const mx = (s[0] + e[0]) / 2, my = (s[1] + e[1]) / 2;
  c.fillStyle = INK; c.beginPath(); c.arc(mx, my, 6.6, 0, Math.PI * 2); c.fill();
  c.fillStyle = SKIN[3]; c.beginPath(); c.arc(mx, my, 5.4, 0, Math.PI * 2); c.fill();
  box(c, mx - 3, my - 4, 3, 2, SKIN[4]);
  c.fillStyle = INK; c.beginPath(); c.arc(s[0], s[1], 7.6, 0, Math.PI * 2); c.fill();
  c.fillStyle = SKIN[3]; c.beginPath(); c.arc(s[0], s[1], 6.4, 0, Math.PI * 2); c.fill();
  // (the fist, knuckles round the rail)
  c.fillStyle = INK; c.beginPath(); c.arc(hh[0], hh[1], 5.5, 0, Math.PI * 2); c.fill();
  c.fillStyle = SKIN[3]; c.beginPath(); c.arc(hh[0], hh[1], 4.3, 0, Math.PI * 2); c.fill();
  box(c, hh[0] - 3, hh[1] - 2, 6, 1, SKIN[1]);
};
const leg = (c: Ctx, h: P2, f: P2, out: number, q: MeQ) => {
  const ff = reachTo(h[0], h[1], f[0], f[1], THIGH, SHIN);
  const k = kneeFront(h[0], h[1], ff[0], ff[1], THIGH, SHIN, out);
  const R = q.nude ? SKIN : JEANS;
  limb(c, h, k, 13, R[2], R[3]); limb(c, k, ff, 11, R[2], R[3]);
  // (the boot's heel, from behind)
  c.fillStyle = INK; c.beginPath(); c.roundRect(ff[0] - 7, ff[1] - 6, 14, 11, 3); c.fill();
  box(c, ff[0] - 6, ff[1] - 5, 12, 9, BOOT[1]); box(c, ff[0] - 6, ff[1] - 5, 12, 3, BOOT[3]); box(c, ff[0] - 6, ff[1] + 2, 12, 2, BOOT[0]);
};

/** His torso from behind (hips to shoulders, leaned), his belt or his bare ass, the back of his head. */
const torso = (c: Ctx, b: Body, q: MeQ, f: number) => {
  const [hx, hy] = b.hip, [sx, sy] = b.sho;
  c.save(); c.translate(hx, hy); c.rotate(Math.atan2(sx - hx, hy - sy));
  const L = Math.hypot(sx - hx, sy - hy);
  // (the back: a wedge, narrow at the waist, wide at the lats; inked; banded light to shade)
  const back = (w0: number, w1: number, col: string) => { c.fillStyle = col; c.beginPath(); c.moveTo(-w0, 2); c.lineTo(w0, 2); c.lineTo(w1, -L + 4); c.quadraticCurveTo(0, -L - 6, -w1, -L + 4); c.closePath(); c.fill(); };
  const fl = b.flare ?? 0, w1 = 29 + fl * 5;
  back(14, w1 + 1.5, INK); back(12.5, w1, SKIN[2]); back(8, w1 - 7, SKIN[3]);
  // (the traps bunched up round his neck, the spine's groove, the shoulder blades, the lats' edges)
  for (const s of [-1, 1]) {
    c.fillStyle = INK; c.beginPath(); c.ellipse(s * 10, -L + 1, 12, 8, s * 0.35, 0, Math.PI * 2); c.fill();
    c.fillStyle = SKIN[3]; c.beginPath(); c.ellipse(s * 10, -L + 1, 10.8, 6.8, s * 0.35, 0, Math.PI * 2); c.fill();
    box(c, s * 8 - 3, -L - 3, 6, 2, SKIN[4]);
  }
  box(c, -1, -L + 8, 2, L - 10, SKIN[1]);
  for (const s of [-1, 1]) { box(c, s * 8 - 5, -L + 10, 10, 2, SKIN[4]); box(c, s * (w1 - 9) - 1, -L * 0.62, 2, 13, SKIN[1]); box(c, s * 5 - 1, -L * 0.45, 2, 8, SKIN[1]); }
  // (the belt and his jeans' seat; or his bare ass; the stain, shat)
  if (q.nude) {
    for (const s of [-1, 1]) { c.fillStyle = INK; c.beginPath(); c.ellipse(s * 6.5, 6, 8, 8, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = SKIN[3]; c.beginPath(); c.ellipse(s * 6.5, 6, 7, 7, 0, 0, Math.PI * 2); c.fill(); }
    box(c, -0.5, 1, 1, 11, SKIN[0]);
  } else {
    box(c, -15, -2, 30, 13, INK); box(c, -14, -1, 28, 11, JEANS[2]); box(c, -14, -1, 28, 4, '#5C2A0B'); box(c, -3, -1, 6, 4, '#B8652E');
    box(c, -10, 4, 8, 6, JEANS[3]); box(c, 2, 4, 8, 6, JEANS[3]);
    if (q.shat) { c.fillStyle = 'rgba(92, 58, 22, 0.85)'; c.beginPath(); c.ellipse(0, 7, 9, 5, 0, 0, Math.PI * 2); c.fill(); }
  }
  // (the neck, the back of his head: buzzed black, his ears, the arms of his glasses over them)
  const ny = -L - 2 + (b.sink ?? 0);
  box(c, -6, ny - 6, 12, 8, INK); box(c, -5, ny - 6, 10, 8, SKIN[2]);
  c.translate(0, ny - 8); c.rotate(b.head);
  c.fillStyle = INK; c.beginPath(); c.ellipse(0, -2, 11, 12, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = SKIN[2]; c.beginPath(); c.ellipse(0, -2, 10, 11, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = HAIR[1]; c.beginPath(); c.ellipse(0, -5, 10, 9, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = HAIR[2]; c.beginPath(); c.ellipse(-2, -9, 6, 4, 0, 0, Math.PI * 2); c.fill();
  for (const s of [-1, 1]) {
    c.fillStyle = INK; c.beginPath(); c.ellipse(s * 11, -1, 3.5, 5, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = SKIN[3]; c.beginPath(); c.ellipse(s * 11, -1, 2.4, 3.8, 0, 0, Math.PI * 2); c.fill();
    box(c, s * 10 - (s > 0 ? 0 : 2), -4, 2, 2, INK);
  }
  // (the glasses' arms, round the back of his ears to the frames poking out each side)
  box(c, -12, -4, 24, 1.6, INK); box(c, -14, -5, 3, 3, INK); box(c, 11, -5, 3, 3, INK);
  // (hurt: his head snapped back, a red flush; scared: sweat flying)
  if (q.hurt) { c.fillStyle = 'rgba(220, 38, 38, 0.35)'; c.beginPath(); c.ellipse(0, -2, 10, 11, 0, 0, Math.PI * 2); c.fill(); }
  if (b.plates) for (let i = 0; i < 3; i++) { const u = ((f + i * 9) % 18) / 18; box(c, -14 - u * 12 + i * 14, -12 - u * 8, 2, 2, '#BAE6FD'); }
  c.restore();
};

const rot = (p: P2, o: P2, a: number): P2 => { const c = Math.cos(a), s = Math.sin(a), dx = p[0] - o[0], dy = p[1] - o[1]; return [o[0] + dx * c - dy * s, o[1] + dx * s + dy * c]; };

/** The body for a pose (local frame). */
const bodyOf = (q: MeQ, f: number): Body => {
  const bob = Math.sin(f * 0.3) * 0.8;
  switch (q.mode) {
    case 'duck':
      // (hunched like a bull: low, wide, head sunk, elbows out)
      return { hip: [0, -18], sho: [0, -44], lean: 0, feet: [[-19, 0], [19, 0]], hands: [GRIP_L, GRIP_R], head: 0, sink: 7 };
    case 'land':
      // (a heavy squat landing: knees wide, sunk deep, a bounce)
      return { hip: [0, -14 + bob * 2], sho: [0, -42 + bob * 2], lean: 0, feet: [[-22, 0], [22, 0]], hands: [GRIP_L, GRIP_R], head: 0, sink: 5, flare: 0.5 };
    case 'jump':
      // (an explosive spring: his left knee driven up, his right leg kicked down; his left fist pumped up, his right
      // flexed out wide)
      return { hip: [2, -50], sho: [5, -84], lean: 0, feet: [[-12, -34], [16, -6]], hands: [[-22, -126], [48, -96]], head: 0.08, flare: 1 };
    case 'hop': {
      // (a sideways lunge-leap: the lead shoulder dipped into it, the lead fist tucked, the far arm thrown out behind,
      // the trailing leg kicked out, the lead knee up)
      const s = q.side;
      return { hip: [-s * 6, -46], sho: [s * 14, -76], lean: 0, feet: [[s > 0 ? -34 : 10, s > 0 ? -6 : -26], [s > 0 ? -10 : 34, s > 0 ? -26 : -6]],
        hands: s > 0 ? [[-56, -98], [30, -66]] : [[-30, -66], [56, -98]], head: s * 0.25, flare: 1, plates: false };
    }
    case 'fling':
      return { hip: [0, -40], sho: [0, -72], lean: 0, feet: [[-24, -10], [24, -6]], hands: [[-46, -92], [46, -88]], head: Math.sin(f * 0.5) * 0.3, plates: true };
    case 'grip':
    case 'dangle':
    case 'ride':
    default:
      return { hip: [0, -30 + bob], sho: [0, -60 + bob], lean: 0, feet: [[-19, 0], [19, 0]], hands: [GRIP_L, GRIP_R], head: 0, sink: 3 };
  }
};

/** Him from behind, on his car's floor at the origin (local frame, unscaled). */
export const drawMeBack = (c: Ctx, q: MeQ, f: number) => {
  let b = bodyOf(q, f);
  if (q.mode === 'grip') {
    // (swung from his shoulders the way gravity has him, leaning in toward the high side: the hands stay on the rails)
    const d = bodyOf({ ...q, mode: 'duck' }, f);
    const piv: P2 = [q.side * 6, d.sho[1]];
    const a = q.hang;
    b = { ...d, hip: rot([d.hip[0] + q.side * 8, d.hip[1]], piv, a), sho: rot([d.sho[0] + q.side * 6, d.sho[1]], piv, a),
      feet: [rot(d.feet[0], piv, a), rot(d.feet[1], piv, a)], hands: [GRIP_L, GRIP_R], head: q.side * 0.2 };
  } else if (q.mode === 'dangle') {
    // (hanging off the low rail by one fist: the body under it the way gravity has him, the free arm clawing, legs kicking)
    const gs = q.side, grip = gs < 0 ? GRIP_L : GRIP_R;
    const a = q.hang, kick = Math.sin(f * 0.6);
    const H = (x: number, y: number) => rot([grip[0] + x, grip[1] + y], grip, a);
    const free: P2 = H(-gs * (40 + Math.sin(f * 0.8) * 8), 6 + Math.cos(f * 0.7) * 10);
    b = { hip: H(-gs * 10, 68), sho: H(-gs * 4, 30), lean: 0, feet: [H(-gs * 4 - 8 + kick * 8, 102), H(-gs * 16 + 8 - kick * 8, 100)],
      hands: gs < 0 ? [grip, free] : [free, grip], head: -gs * 0.3, plates: true };
  }
  const lean = Math.atan2(b.sho[0] - b.hip[0], b.hip[1] - b.sho[1]);
  const T = (x: number, y: number): P2 => rot([b.sho[0] + x, b.sho[1] + y], b.sho, lean);
  const H2 = (x: number, y: number): P2 => rot([b.hip[0] + x, b.hip[1] + y], b.hip, lean);
  // (legs, then the torso and head, then the arms over them: from behind, the arms reach out past the back)
  leg(c, H2(-7, 0), b.feet[0], -1, q);
  leg(c, H2(7, 0), b.feet[1], 1, q);
  torso(c, b, q, f);
  arm(c, T(-19, 4), b.hands[0], -1);
  arm(c, T(19, 4), b.hands[1], 1);
};
