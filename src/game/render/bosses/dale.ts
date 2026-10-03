// Drug Trade Dale's sprite and the drugs he's using (his truck is in ../daleTruck.ts): a pharmacist,
// license revoked, delivering "care" across the desert. A purple double-breasted suit with shoulders out
// to here, a pocket square, a gold chain with a dollar medallion, a pompadour with his aviators pushed up
// into it, a gold tooth, a pill bottle in his breast pocket and a row of foil blister packs pinned to his
// lapel like medals. Drawn in the boss's local space (0,0 = his top-left corner), in an 80x80 box.

import { Enemy } from '../../../types';
import { COLORS, ARENA_LEFT, ARENA_RIGHT, DALE_SPEED_WINDUP } from '../../../constants';
import { drawCocaineBag, drawMethDrum } from '../projectiles';
import { pixelBlob } from '../pixelArt';
import { FaceStyle, Mood, drawHead, headAt, facingOf, goreOf, moodOf, limb, hand, shoe, foil, bodyBlood, breath } from './kit';

const SKIN = '#EDC3A0', SKIN_DARK = '#BB8F6E';
const FACE: FaceStyle = {
  skin: SKIN, shadow: SKIN_DARK, highlight: '#FBDFC7', brow: '#111111', iris: '#4D7C0F',
  jaw: 'square', stubble: '#4B5563', bags: '#8B6A8E', lips: '#9C6450', goldTooth: true, age: 0.3,
};
const SUIT = '#8E44AD', SUIT_DARK = '#5B2C6F', SUIT_LIGHT = '#A569BD';

export const drawDale = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  // Speed: twitching harder and harder as the needle goes in (the strobing colours are daleFx's)
  const windingUp = e.bossState === 'using_shipment' && e.shipmentType === 'speed';
  if (windingUp) {
    const t = 1 - (e.stateTimer || 0) / DALE_SPEED_WINDUP;
    if (t > 0.55) {
      const j = (t - 0.55) * 10;
      ctx.translate((Math.random() - 0.5) * j, (Math.random() - 0.5) * j);
    }
  }
  const f = facingOf(e);
  const gore = goreOf(e);
  const sick = daleSick(e, frame);
  const pose = daleThrow(e, frame);
  const base = sick ? (frame % 50 < 34 ? 'dazed' : 'hurt') : moodOf(e, frame, { speed_dash: 'manic', using_shipment: windingUp ? 'shock' : 'blissed', running: 'fierce' });
  // (the throw's face, unless he's just been hit; stood in the barf, a grossed-out version of it)
  const hit = e.health <= 0 || (e.hitCooldown ?? 0) > 30;
  const mood: Mood = pose?.mood && !hit ? (sick ? SICK_THROW_MOOD[pose.mood] ?? pose.mood : pose.mood) : base;
  const b = breath(frame);
  const td = THROW_DIR, X = (p: Pt) => 40 + td * p[0];
  ctx.save();
  ctx.scale(e.width / 80, e.height / 80);
  // The heave: squashed down into the squat, stretched up with it overhead, a jolt as it goes (about his feet)
  if (pose) { ctx.translate(40 + pose.jolt, 80); ctx.scale(pose.sx, pose.sy); ctx.translate(-40, -80); }

  // Two-tone shoes, purple slacks
  shoe(ctx, 30, 80, 14, 5, f, '#111111', '#000000', 'rgba(255,255,255,0.45)');
  shoe(ctx, 50, 80, 14, 5, f, '#111111', '#000000', 'rgba(255,255,255,0.45)');
  ctx.fillStyle = SUIT_DARK;
  ctx.beginPath(); ctx.moveTo(23, 54); ctx.lineTo(57, 54); ctx.lineTo(56, 76); ctx.lineTo(43, 76); ctx.lineTo(40, 62); ctx.lineTo(37, 76); ctx.lineTo(24, 76); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#6C3483'; ctx.fillRect(30, 57, 0.7, 18); ctx.fillRect(50, 57, 0.7, 18);

  ctx.save(); ctx.translate(0, -b);
  // (twisting at the waist: wound back away from the throw, then into it)
  if (pose?.lean) { ctx.translate(40, 56); ctx.rotate(td * pose.lean); ctx.translate(-40, -56); }
  // Shirt, open at the neck, and the chest it's open over
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.moveTo(33, 32); ctx.lineTo(47, 32); ctx.lineTo(42, 48); ctx.lineTo(38, 48); ctx.closePath(); ctx.fill();
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.moveTo(36.5, 32); ctx.lineTo(43.5, 32); ctx.lineTo(40, 42); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#44403C'; for (let i = 0; i < 5; i++) ctx.fillRect(38 + (i * 1.7) % 4, 33 + i * 1.5, 0.6, 0.6); // chest hair
  // The jacket: double-breasted, lapels, shoulders out past his arms
  ctx.fillStyle = SUIT;
  ctx.beginPath(); ctx.moveTo(14, 33); ctx.lineTo(36, 31); ctx.lineTo(40, 48); ctx.lineTo(44, 31); ctx.lineTo(66, 33); ctx.lineTo(62, 57); ctx.lineTo(18, 57); ctx.closePath(); ctx.fill();
  ctx.fillStyle = SUIT_DARK; ctx.fillRect(17, 35, 3.5, 21);
  ctx.fillStyle = SUIT_LIGHT;
  ctx.beginPath(); ctx.moveTo(36, 31); ctx.lineTo(31, 36); ctx.lineTo(38, 44); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(44, 31); ctx.lineTo(49, 36); ctx.lineTo(42, 44); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#FFD700';
  for (const [x, y] of [[35, 50], [45, 50], [35, 54], [45, 54]] as const) { ctx.beginPath(); ctx.arc(x, y, 1.3, 0, Math.PI * 2); ctx.fill(); }
  // Pocket square, and a pill bottle in the breast pocket
  ctx.fillStyle = SUIT_DARK; ctx.fillRect(50, 40, 8, 1);
  ctx.fillStyle = '#FF1493'; ctx.beginPath(); ctx.moveTo(51, 40); ctx.lineTo(53, 36.5); ctx.lineTo(55, 40); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#F97316'; ctx.fillRect(55.5, 36, 2.6, 4); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(55.3, 35, 3, 1.4);
  // Blister packs pinned to the lapel like medals
  for (let i = 0; i < 3; i++) {
    const x = 26 + i * 3.6, y = 38 + (i % 2) * 1.5;
    ctx.fillStyle = ['#DC2626', '#2563EB', '#16A34A'][i]; ctx.fillRect(x + 1, y - 3, 1.4, 3); // ribbons
    foil(ctx, [x, y, x + 3.4, y, x + 3.4, y + 5, x, y + 5], frame, i + 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; ctx.fillRect(x + 0.6, y + 0.8, 1, 1); ctx.fillRect(x + 1.9, y + 2.6, 1, 1);
  }
  bodyBlood(ctx, gore, [[48, 47, 3.5], [27, 50, 3], [40, 38, 2.5], [56, 52, 2.5], [33, 44, 2.5], [22, 40, 2.5]], frame);

  // The chain and the dollar medallion
  ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(35.5, 31.5); ctx.quadraticCurveTo(40, 45, 44.5, 31.5); ctx.stroke();
  ctx.save(); ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 4;
  ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.arc(40, 43, 4, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  ctx.strokeStyle = '#B7950B'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(40, 43, 4, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#2E1045'; ctx.font = 'bold 6px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', 40, 43.3);
  if (frame % 60 < 6) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(41.5, 40.5, 1, 1); }

  // The drum he's heaving (in front of him coming up off the floor, then up behind his head), and the smear the
  // throwing arm leaves going over
  if (pose?.drum) drawMethDrum(ctx, X(pose.drum.at), pose.drum.at[1], 40 * 80 / e.width, 50 * 80 / e.height, td * pose.drum.rot, frame);
  if (pose?.smear) drawSmear(ctx, pose.smear, X, pose.meth);

  // Shoulder pads, and the arms out of them (the needle in one when he's dashing on speed)
  for (const side of [-1, 1]) {
    const sx = 40 + side * 22, sy = 36;
    ctx.fillStyle = SUIT; ctx.beginPath(); ctx.roundRect(sx - 6, sy - 5, 12, 9, 3); ctx.fill();
    ctx.fillStyle = SUIT_LIGHT; ctx.fillRect(sx - 4, sy - 4.5, 8, 1);
    // (where the throw has this hand: the near one throws, both of them for a drum)
    const held = pose ? (side === td ? pose.near : pose.far) : undefined;
    if (held) {
      const hx = X(held), hy = held[1];
      const [ex, ey] = elbowOf(sx, sy + 1, hx, hy, side);
      limb(ctx, sx, sy + 1, ex, ey, 7.5, SUIT, SUIT_DARK);
      limb(ctx, ex, ey, hx, hy, 6.5, SUIT, SUIT_DARK);
      // (the cuff round the wrist, whichever way the forearm's pointing)
      const fl = Math.hypot(hx - ex, hy - ey) || 1, ux = (hx - ex) / fl, uy = (hy - ey) / fl;
      limb(ctx, hx - ux * 4.2, hy - uy * 4.2, hx - ux * 3, hy - uy * 3, 6.8, '#FFFFFF');
      if (side === td && pose!.bag) drawCocaineBag(ctx, hx - td * 1.5, hy - 3, 8.5, -td * 0.5);
      hand(ctx, hx, hy, 3.6, SKIN, SKIN_DARK);
      ctx.fillStyle = '#FFD700'; ctx.fillRect(hx - 2, hy - 1.2, 1.4, 1.4);
      // (his hand in under the far lapel, going for the stash in his inside pocket)
      if (side === td && pose!.inJacket) {
        ctx.fillStyle = SUIT_LIGHT;
        ctx.beginPath(); ctx.moveTo(40 - td * 4, 31); ctx.lineTo(40 - td * 9, 36); ctx.lineTo(40 - td * 2, 44); ctx.closePath(); ctx.fill();
      }
      continue;
    }
    const ex = sx + side * 2, ey = sy + 10;
    const hx = sx + side * 1.5 + Math.sin(frame * 0.07 + side) * 1.2, hy = sy + 19;
    limb(ctx, sx, sy + 1, ex, ey, 7.5, SUIT, SUIT_DARK);
    limb(ctx, ex, ey, hx, hy, 6.5, SUIT, SUIT_DARK);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(hx - 3, hy - 4, 6, 1.4); // shirt cuff
    hand(ctx, hx, hy, 3.6, SKIN, SKIN_DARK);
    ctx.fillStyle = '#FFD700'; ctx.fillRect(hx - 2, hy - 1.2, 1.4, 1.4); // pinky ring
  }
  if (e.bossState === 'speed_dash') {
    ctx.save(); ctx.translate(16, 46); ctx.rotate(-0.5);
    ctx.fillStyle = COLORS.PROJECTILE_DART; ctx.fillRect(0, -2, 16, 4);
    ctx.fillStyle = 'red'; ctx.fillRect(16, -4, 6, 8); ctx.restore();
  }

  // The head: pompadour, aviators pushed up into it
  drawHead(ctx, headAt(e, f, 40, 19), FACE, mood, frame, gore, {
    hair: () => {
      ctx.fillStyle = '#0A0A0A';
      ctx.beginPath();
      ctx.moveTo(-11.5, -2); ctx.quadraticCurveTo(-13, -14, -4, -15); ctx.quadraticCurveTo(6, -21, 14, -15);
      ctx.quadraticCurveTo(10, -12.5, 6, -12); ctx.lineTo(-8, -9.5); ctx.lineTo(-10, -5); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#6B7280'; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(-6, -14.5); ctx.quadraticCurveTo(3, -19, 11, -15.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-8, -12); ctx.quadraticCurveTo(0, -15.5, 7, -13.5); ctx.stroke();
      // Sideburns
      ctx.fillStyle = '#0A0A0A'; ctx.fillRect(-11, -5, 2, 6);
    },
    hat: () => {
      // Gold aviators up in the pompadour, the sunset in the lenses
      ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(-10, -14); ctx.lineTo(-7, -14.5); ctx.moveTo(0, -15.5); ctx.lineTo(1.5, -15.5); ctx.stroke();
      for (const x of [-4, 5]) {
        ctx.fillStyle = '#111111'; ctx.beginPath(); ctx.ellipse(x, -15, 3.4, 2.2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FF007F'; ctx.fillRect(x - 2.6, -16.2, 5.2, 1);
        ctx.fillStyle = '#00F0FF'; ctx.fillRect(x - 2.2, -14.6, 4.4, 0.8);
        ctx.stroke();
      }
      if (pose?.veins) strainVeins(ctx, frame);
      if (pose && sick) grossedOut(ctx, frame);
    },
  });
  // A puff of the powder off his hand and sleeve as the bag goes
  if (pose && !pose.meth && pose.since >= 0) drawPowderPuff(ctx, pose.since, X);
  ctx.restore();
  // The floor's dust kicked up round his feet as the drum goes
  if (pose?.meth && pose.since >= 0) drawHeaveDust(ctx, pose.since);
  ctx.restore();
};

// ---------------------------------------------------------------------------
// The throws: drawn from the timer he already counts down to each bag or drum, and the frame he let the last one go
// (the logic's timing is untouched). Points are [toward the throw from his middle, down], in his 80x80 box.
// ---------------------------------------------------------------------------

type Pt = [number, number];
/** Which way he throws: the bags and drums always fly left (see bosses/dale.ts), whichever way he's looking. */
const THROW_DIR = -1;
/** Frames of wind-up before the bag leaves his hand, and of follow-through after (both inside the 20 between bags). */
const COKE_WIND = 10, COKE_FOLLOW = 10;
/** ...and for a drum (inside the 45 between drums, and the 30 before the first). */
const METH_WIND = 26, METH_FOLLOW = 16;

interface ThrowPose {
  meth: boolean;
  /** Frames since it left his hands (-1 still winding up). */
  since: number;
  /** The throwing hand (the one on the side he throws to), and the other one (a drum takes both). */
  near?: Pt; far?: Pt;
  /** Twist at the waist (+ into the throw), squash/stretch about his feet, a sideways jolt. */
  lean: number; sx: number; sy: number; jolt: number;
  mood?: Mood; veins?: boolean;
  /** A bag palmed in the throwing hand; his hand in his jacket for it. */
  bag?: boolean; inJacket?: boolean;
  drum?: { at: Pt; rot: number };
  smear?: { from: Pt; via: Pt; to: Pt; a: number; t0: number };
}

const ease = (t: number) => { const k = Math.max(0, Math.min(1, t)); return k * k * (3 - 2 * k); };
const mix = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
/** Through keyframes [frame, point], eased between them. */
const track = (keys: [number, Pt][], s: number): Pt => {
  for (let i = 1; i < keys.length; i++) if (s <= keys[i][0]) return mix(keys[i - 1][1], keys[i][1], ease((s - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0])));
  return keys[keys.length - 1][1];
};

const REST_NEAR: Pt = [23.5, 55], REST_FAR: Pt = [-23.5, 55];
// The bag: in under the far lapel, out with it, cocked back across him by the far shoulder, flicked out side-arm
const JACKET: Pt = [-6, 41], PALMED: Pt = [2, 33], COCKED: Pt = [-21, 25], FLICK: Pt = [37, 33];
// The drum: hugged up off the floor in front of him, up behind his head, wound back, heaved
const DRUM_LOW: Pt = [12, 56], DRUM_HIGH: Pt = [-2, 1], DRUM_BACK: Pt = [-11, 3];

const cokeWindup = (k: number): ThrowPose => {
  const p: ThrowPose = { meth: false, since: -1, lean: 0, sx: 1, sy: 1, jolt: 0 };
  if (k < 0.35) { const t = ease(k / 0.35); p.near = mix(REST_NEAR, JACKET, t); p.inJacket = t > 0.7; }
  else if (k < 0.55) { const t = ease((k - 0.35) / 0.2); p.near = mix(JACKET, PALMED, t); p.inJacket = t < 0.3; p.bag = t >= 0.3; }
  else { const t = ease((k - 0.55) / 0.45); p.near = mix(PALMED, COCKED, t); p.bag = true; p.lean = -0.08 * t; p.mood = 'grin'; }
  return p;
};

const cokeRelease = (s: number): ThrowPose => ({
  meth: false, since: s, sx: 1, sy: 1, jolt: 0,
  // (the wrist snaps over, the arm whips on past and down, then back to his side)
  near: track([[0, FLICK], [1, [39, 39]], [2, [34, 46]], [4, [31, 50]], [COKE_FOLLOW - 1, REST_NEAR]], s),
  lean: s < 2 ? 0.09 : 0.09 * (1 - ease((s - 2) / (COKE_FOLLOW - 3))),
  mood: s < 7 ? 'wink' : undefined,
  smear: s < 3 ? { from: COCKED, via: [14, 16], to: FLICK, a: 1 - s / 3, t0: s * 0.3 } : undefined,
});

/** The drum in both hands, gripped round its sides (low down hugging it, round the bottom with it up overhead). */
const gripDrum = (p: ThrowPose, at: Pt, rot: number, lift: number) => {
  const gy = 2 + lift * 15, c = Math.cos(rot), sn = Math.sin(rot);
  const grip = (gx: number): Pt => [at[0] + gx * c - gy * sn, at[1] + gx * sn + gy * c];
  p.drum = { at, rot }; p.near = grip(19); p.far = grip(-19);
};

const methWindup = (k: number, frame: number): ThrowPose => {
  const p: ThrowPose = { meth: true, since: -1, lean: 0, sx: 1, sy: 1, jolt: 0, veins: k > 0.15 };
  if (k < 0.3) {
    // Down into a squat over it
    const t = ease(k / 0.3);
    p.sx = 1 + 0.07 * t; p.sy = 1 - 0.1 * t; p.mood = 'hurt';
    gripDrum(p, DRUM_LOW, 0, 0);
  } else if (k < 0.72) {
    // Up with it (shaking under the weight), the squat springing up into a stretch
    const t = ease((k - 0.3) / 0.42), shake = frame % 4 < 2 ? 0.7 : -0.7;
    p.sx = 1.07 - 0.1 * t; p.sy = 0.9 + 0.15 * t; p.mood = 'hurt';
    const at = mix(DRUM_LOW, DRUM_HIGH, t);
    gripDrum(p, [at[0] + shake * t, at[1]], -0.12 * t, t);
  } else {
    // Wound back with it, twisting away from the throw
    const t = ease((k - 0.72) / 0.28);
    p.sx = 0.97; p.sy = 1.05 - 0.02 * t; p.lean = -0.14 * t; p.mood = 'fierce';
    gripDrum(p, mix(DRUM_HIGH, DRUM_BACK, t), -0.12 - 0.33 * t, 1);
  }
  return p;
};

const methRelease = (s: number): ThrowPose => {
  // Stretched out after it as it goes, then landing back on his heels (squashed), and settling
  const settle = 1 - ease((s - 4) / 8);
  const sq = s < 1 ? [0.95, 1.06] : s < 4 ? [1.07, 0.93] : [1 + 0.07 * settle, 1 - 0.07 * settle];
  return {
    meth: true, since: s, sx: sq[0], sy: sq[1],
    jolt: [2.2, -1.8, 1.4, -1, 0.6, -0.3][s] ?? 0,
    near: track([[0, [40, 24]], [3, [38, 34]], [6, [32, 44]], [METH_FOLLOW - 1, REST_NEAR]], s),
    far: track([[0, [24, 21]], [3, [22, 31]], [6, [8, 44]], [METH_FOLLOW - 1, REST_FAR]], s),
    lean: s < 4 ? 0.16 : 0.16 * (1 - ease((s - 4) / (METH_FOLLOW - 5))),
    mood: s < 9 ? 'roar' : undefined, veins: s < 6,
    smear: s < 3 ? { from: DRUM_BACK, via: [12, -20], to: [44, 20], a: 1 - s / 3, t0: s * 0.3 } : undefined,
  };
};

/** Where he is in a throw this frame, if he's in one. */
const daleThrow = (e: Enemy, frame: number): ThrowPose | null => {
  const meth = e.shipmentType === 'meth';
  if ((!meth && e.shipmentType !== 'cocaine') || e.health <= 0) return null;
  const s = e.daleThrowAt === undefined ? -1 : frame - e.daleThrowAt;
  if (s >= 0 && s < (meth ? METH_FOLLOW : COKE_FOLLOW)) return meth ? methRelease(s) : cokeRelease(s);
  const T = e.stateTimer ?? 0, wind = meth ? METH_WIND : COKE_WIND;
  if (e.bossState !== 'using_shipment' || (e.shipmentCount ?? 0) <= 0 || T <= 0 || T > wind) return null;
  const k = (wind - T) / (wind - 1);
  return meth ? methWindup(k, frame) : cokeWindup(k);
};

/** An elbow between shoulder and hand, bent outward (dead straight when it can't reach). */
const elbowOf = (sx: number, sy: number, hx: number, hy: number, side: number): Pt => {
  const l1 = 10.2, l2 = 9.2, dx = hx - sx, dy = hy - sy, d = Math.hypot(dx, dy) || 1;
  if (d >= l1 + l2 - 0.01) return [sx + dx * l1 / (l1 + l2), sy + dy * l1 / (l1 + l2)];
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const nx = -dy / d, ny = dx / d, out = nx * side + ny * 0.5 >= 0 ? 1 : -1;
  return [sx + dx * a / d + nx * h * out, sy + dy * a / d + ny * h * out];
};

/** The arm's smear going over: banded (lavender, then white, then a hot white core), tapering off toward its tail. */
const drawSmear = (ctx: CanvasRenderingContext2D, sm: NonNullable<ThrowPose['smear']>, X: (p: Pt) => number, heavy: boolean) => {
  const at = (t: number): Pt => {
    const u = 1 - t;
    return [u * u * X(sm.from) + 2 * u * t * X(sm.via) + t * t * X(sm.to), u * u * sm.from[1] + 2 * u * t * sm.via[1] + t * t * sm.to[1]];
  };
  const w = heavy ? 11 : 6, N = 10;
  ctx.save();
  ctx.lineCap = 'round';
  for (const [k, color, alpha] of [[1, '#C39BD3', 0.75], [0.6, '#F4ECF7', 0.85], [0.25, '#FFFFFF', 1]] as const) {
    ctx.strokeStyle = color; ctx.globalAlpha = alpha * sm.a;
    for (let i = 0; i < N; i++) {
      const t1 = sm.t0 + (1 - sm.t0) * (i / N), t2 = sm.t0 + (1 - sm.t0) * ((i + 1) / N);
      const [x1, y1] = at(t1), [x2, y2] = at(t2);
      // (stepped thicker toward the hand)
      ctx.lineWidth = Math.max(1, Math.round(w * k * (0.35 + 0.65 * (i + 1) / N)));
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
  }
  // Speed lines trailing under it
  ctx.globalAlpha = 0.8 * sm.a; ctx.fillStyle = '#FFFFFF';
  for (const t of [0.45, 0.65, 0.85]) { const [x, y] = at(t); ctx.fillRect(Math.round(x) - 1, Math.round(y + (heavy ? 8 : 5)), 3, 1); }
  ctx.restore();
};

/** White powder puffing off his hand and sleeve as the bag leaves it, and dusting the cuff a moment after. */
const drawPowderPuff = (ctx: CanvasRenderingContext2D, s: number, X: (p: Pt) => number) => {
  const fade = 1 - s / COKE_FOLLOW;
  for (let i = 0; i < 6; i++) {
    const a = -0.9 + i * 0.32, r = 3 + s * 1.3 + (i % 3) * 0.8;
    const x = X([FLICK[0] - 2 + Math.cos(a) * r, 0]), y = FLICK[1] - 1 + Math.sin(a) * r - s * 0.6;
    const pr = Math.max(1, 2.6 - s * 0.15 + (i % 2) * 0.8);
    pixelBlob(ctx, x, y, pr, pr, `rgba(255, 255, 255, ${(0.85 * fade).toFixed(2)})`, 1);
  }
  // (a cloud off the sleeve, behind the hand)
  pixelBlob(ctx, X([FLICK[0] - 9 - s * 0.5, 0]), FLICK[1] - 3 - s * 0.8, 3 + s * 0.4, 2 + s * 0.3, `rgba(241, 245, 249, ${(0.6 * fade).toFixed(2)})`, 1);
  ctx.fillStyle = `rgba(255, 255, 255, ${fade.toFixed(2)})`;
  for (let i = 0; i < 4; i++) ctx.fillRect(Math.round(X([FLICK[0] - 4 - i * 2.3, 0])), Math.round(FLICK[1] + 2 + (i % 2) * 2 + s * 0.5), 1, 1);
};

/** Dust kicked up off the floor round his feet as the drum goes: chunky puffs rolling out both ways, shaded in bands. */
const drawHeaveDust = (ctx: CanvasRenderingContext2D, s: number) => {
  const fade = 1 - s / METH_FOLLOW;
  for (const dir of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const x = 40 + dir * (15 + s * 2.2 + i * 7), y = 78 - i * 1.5 - s * 0.35, r = 4.5 + s * 0.45 - i * 0.6;
      pixelBlob(ctx, x, y + 1, r, r * 0.7, `rgba(125, 118, 106, ${(0.85 * fade).toFixed(2)})`, 1);
      pixelBlob(ctx, x, y, r * 0.85, r * 0.6, `rgba(168, 160, 144, ${(0.95 * fade).toFixed(2)})`, 1);
      pixelBlob(ctx, x - dir * 0.8, y - 1, r * 0.5, r * 0.35, `rgba(226, 220, 208, ${fade.toFixed(2)})`, 1);
    }
  }
};

/** The throw's faces when he's stood in the barf: the flick's grin and wink go to a pursed, squinting sneer, the
 * heave's bellow goes to a gag (tongue out), and he grits his teeth winding back rather than shouting. */
const SICK_THROW_MOOD: Partial<Record<Mood, Mood>> = { grin: 'grump', wink: 'grump', fierce: 'hurt', roar: 'dazed' };

/** Grossed out, throwing anyway: his nose wrinkled up, his eyes watering (in the head's space). */
const grossedOut = (ctx: CanvasRenderingContext2D, frame: number) => {
  ctx.save();
  // Wrinkles across the bridge of his nose, and a curled-up nostril
  ctx.strokeStyle = SKIN_DARK; ctx.lineWidth = 0.6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-0.6, -1.8); ctx.lineTo(1.6, -2.1); ctx.moveTo(-0.3, -0.8); ctx.lineTo(1.9, -1.1); ctx.moveTo(2.6, 1.4); ctx.lineTo(3.6, 0.6); ctx.stroke();
  // Tears welling up and running down
  for (const [x, ph] of [[-5, 0], [4.5, 9]] as const) {
    const t = ((frame + ph) % 18) / 18;
    ctx.fillStyle = '#1E6FA8'; ctx.fillRect(x - 0.9, -1.6 + t * 6, 1.8, 1.8 + t * 0.6);
    ctx.fillStyle = '#BAE6FD'; ctx.fillRect(x - 0.6, -1.4 + t * 6, 1.2, 1.2 + t * 0.6);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x - 0.5, -1.4 + t * 6, 0.5, 0.5);
  }
  ctx.restore();
};

/** Veins standing out on his forehead and temple under the strain, pulsing (in the head's space). */
const strainVeins = (ctx: CanvasRenderingContext2D, frame: number) => {
  const w = frame % 12 < 6 ? 0.9 : 0.7;
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const [color, lw] of [['#7B2D3B', w + 0.5], ['#C0566A', w]] as const) {
    ctx.strokeStyle = color; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(2.5, -9.5); ctx.lineTo(4, -8); ctx.lineTo(3, -6.5); ctx.moveTo(4, -8); ctx.lineTo(5.6, -7.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-8.5, -6); ctx.lineTo(-7.5, -4.2); ctx.lineTo(-8.2, -2.5); ctx.stroke();
  }
  ctx.restore();
};

/** Speed: a strobing high over the whole of him while he dashes, and coming on as the needle goes in. */
/** He's stood in the asset's barf (it's eating at him): sick as a dog. */
const daleSick = (e: Enemy, frame: number) => e.health > 0 && frame - (e.sludgeDotFrame ?? -99) <= 3;

export const daleFx = (e: Enemy, frame: number) => {
  if (e.bossState === 'speed_dash') return { filter: `hue-rotate(${frame * 10}deg) saturate(3)` };
  // (green about the gills)
  if (daleSick(e, frame)) return { filter: 'sepia(0.35) hue-rotate(55deg) saturate(1.3) brightness(0.95)' };
  if (e.bossState === 'using_shipment' && e.shipmentType === 'speed') {
    const t = 1 - (e.stateTimer || 0) / DALE_SPEED_WINDUP;
    if (t > 0.55) return { filter: `hue-rotate(${Math.floor(frame * 12 * t)}deg) saturate(${1 + t * 2})` };
  }
  return null;
};

export const drawDaleDrugs = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  if (daleSick(e, frame)) drawDaleSick(ctx, e, frame);
  if (e.bossState === 'using_shipment' && e.shipmentType === 'speed' && e.stateTimer! > 0) {
    drawSpeedWindup(ctx, e, frame);
    return;
  }
  if (e.bossState === 'using_shipment' && e.shipmentCount! > 0) {
    // What's left of the shipment, piled up beside him: the same bags and drums he throws
    const right = e.pos.x - 6, groundY = 550;
    const pile = e.shipmentType === 'cocaine' ? { gap: 22, rowH: 18, perRow: [4, 3, 2, 1] } : { gap: 42, rowH: 50, perRow: [3, 2] };
    // (less the drum he's got hold of)
    const holding = e.shipmentType === 'meth' && (e.stateTimer ?? 0) > 0 && (e.stateTimer ?? 0) <= METH_WIND;
    let left = e.shipmentCount! - (holding ? 1 : 0);
    pile.perRow.forEach((n, row) => {
      for (let c = 0; c < n && left > 0; c++, left--) {
        const cx = right - pile.gap / 2 - c * pile.gap - row * pile.gap / 2;
        if (e.shipmentType === 'cocaine') {
          drawCocaineBag(ctx, cx, groundY - 12 - row * pile.rowH, 12.5, ((c * 7 + row * 3) % 5 - 2) * 0.15);
        } else if (e.shipmentType === 'meth') {
          drawMethDrum(ctx, cx, groundY - 25 - row * pile.rowH, 40, 50, 0, frame);
        }
      }
    });
  }
};

/** A big, glowing syringe. (0,0) is the needle tip; it points along -x before rotation. */
const drawBigSyringe = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, fill: number, plunge: number, frame: number) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  // Glow
  ctx.shadowColor = '#ff2fa0';
  ctx.shadowBlur = 16;
  // Needle
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(24, 0); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#9ca3af';
  ctx.fillRect(22, -4, 6, 8);
  // Barrel
  const barrelX = 28, barrelL = 46;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fillRect(barrelX, -9, barrelL, 18);
  // Neon drug inside, draining as the plunger goes in
  const juice = barrelL * fill;
  ctx.shadowColor = '#ff2fa0';
  ctx.shadowBlur = 12;
  ctx.fillStyle = frame % 8 < 4 ? '#ff2fa0' : '#ff6fcf';
  ctx.fillRect(barrelX + 2, -7, juice, 14);
  ctx.shadowBlur = 0;
  // Bubbles
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  for (let b = 0; b < 3; b++) {
    const bx = barrelX + 4 + ((frame * 1.5 + b * 13) % Math.max(4, juice - 4));
    ctx.fillRect(bx, -3 + (b % 2) * 4, 2, 2);
  }
  // Graduation marks and outline
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(barrelX, -9, barrelL, 18);
  for (let m = 1; m < 5; m++) { ctx.beginPath(); ctx.moveTo(barrelX + m * 9, -9); ctx.lineTo(barrelX + m * 9, -4); ctx.stroke(); }
  // Finger flange
  ctx.fillStyle = '#e5e7eb';
  ctx.fillRect(barrelX + barrelL, -15, 4, 30);
  // Plunger rod + red thumb press (slides in as it plunges)
  const rodOut = 34 * (1 - plunge);
  ctx.fillStyle = '#9ca3af';
  ctx.fillRect(barrelX + barrelL - 2 - (barrelL - 4) * plunge, -3, rodOut + (barrelL - 4) * plunge + 6, 6);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(barrelX + barrelL + 4 + rodOut, -12, 6, 24);
  // Glint
  if (frame % 30 < 6) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(barrelX + 6 + (frame % 30) * 6, -8, 3, 16);
  }
  ctx.restore();
};

/**
 * Dale's speed wind-up, made unmissable: he hoists a giant syringe, jabs it
 * into his neck and pumps it, while a danger lane shows where he'll charge.
 */
const drawSpeedWindup = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  const t = 1 - (e.stateTimer || 0) / DALE_SPEED_WINDUP; // 0 -> 1
  const cx = e.pos.x + e.width / 2;
  const top = e.pos.y;

  // Danger lane across the arena at Dale's height, chevrons racing toward his first dash (left)
  if (t > 0.15) {
    ctx.save();
    const flash = 0.18 + 0.14 * Math.sin(frame * 0.6);
    ctx.fillStyle = `rgba(255, 30, 60, ${flash * Math.min(1, (t - 0.15) * 4)})`;
    ctx.fillRect(ARENA_LEFT, top + 8, ARENA_RIGHT - ARENA_LEFT, e.height - 8);
    ctx.fillStyle = `rgba(255, 220, 220, ${0.6 * Math.min(1, (t - 0.15) * 4)})`;
    const off = (frame * 6) % 40;
    for (let x = ARENA_RIGHT - off; x > ARENA_LEFT; x -= 40) {
      ctx.beginPath();
      ctx.moveTo(x, top + e.height / 2);
      ctx.lineTo(x + 14, top + 18);
      ctx.lineTo(x + 20, top + 18);
      ctx.lineTo(x + 6, top + e.height / 2);
      ctx.lineTo(x + 20, top + e.height - 6);
      ctx.lineTo(x + 14, top + e.height - 6);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // Pulse rings once it's in
  if (t > 0.55) {
    ctx.save();
    for (let r = 0; r < 2; r++) {
      const ring = ((frame * 3 + r * 30) % 60) / 60;
      ctx.strokeStyle = `rgba(255, 47, 160, ${0.7 * (1 - ring)})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, top + e.height / 2, 30 + ring * 60, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // The syringe: raise overhead, stab into the neck, then pump
  const neck = { x: cx + 6, y: top + 14 };
  // The barrel extends along +x from the tip, so an angle near -1.9 holds it
  // up and behind his head with the needle pointing down into his neck.
  let sx, sy, angle, plunge = 0;
  if (t < 0.4) {
    // Hoist it up from his side
    const k = t / 0.4;
    const ease = 1 - Math.pow(1 - k, 2);
    sx = cx - 56 + ease * 40;
    sy = top + 34 - ease * 70;
    angle = -0.5 - ease * 1.4;
  } else if (t < 0.55) {
    // Stab down into the neck
    const k = (t - 0.4) / 0.15;
    sx = cx - 16 + (neck.x - (cx - 16)) * k;
    sy = top - 36 + (neck.y - (top - 36)) * k;
    angle = -1.9;
  } else {
    // Pump it in
    sx = neck.x;
    sy = neck.y;
    angle = -1.9;
    plunge = (t - 0.55) / 0.45;
  }
  drawBigSyringe(ctx, sx, sy, angle, 1 - plunge * 0.95, plunge, frame);

  // Impact burst at the moment of the jab
  if (t >= 0.55 && t < 0.65) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.fillRect(neck.x + Math.cos(a) * 16 - 2, neck.y + Math.sin(a) * 16 - 2, 4, 4);
    }
    ctx.restore();
  }

  // Flashing warning over his head
  if (Math.floor(frame / 5) % 2 === 0) {
    ctx.save();
    ctx.font = 'bold 26px "Press Start 2P", sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#000000';
    ctx.strokeText('!!', cx, top - 58);
    ctx.fillStyle = '#ff2fa0';
    ctx.fillText('!!', cx, top - 58);
    ctx.restore();
  }
};

/** Sick, stood in the barf: green fumes coming up round his legs, sweat flying off him, flies at him, and every so
 * often he retches (a gout of it out of his mouth, down his front). World space. */
const drawDaleSick = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  const sx = e.width / 80, sy = e.height / 80;
  const hx = e.pos.x + 40 * sx, hy = e.pos.y + 19 * sy, feet = e.pos.y + e.height;
  ctx.save();
  for (let k = 0; k < 6; k++) {
    const t = ((frame * 0.9 + k * 13) % 60) / 60;
    ctx.fillStyle = `rgba(132, 204, 22, ${(0.45 * (1 - t)).toFixed(2)})`;
    ctx.beginPath(); ctx.arc(e.pos.x + e.width * (0.15 + k * 0.14) + Math.sin(t * 6 + k) * 4, feet - t * e.height * 0.8, 4 + t * 8, 0, Math.PI * 2); ctx.fill();
  }
  for (let k = 0; k < 3; k++) {
    const t = ((frame * 1.2 + k * 20) % 40) / 40, side = k % 2 ? 1 : -1;
    ctx.fillStyle = 'rgba(186, 230, 253, 0.9)';
    ctx.beginPath(); ctx.ellipse(hx + side * (8 + t * 14), hy - 6 + t * t * 20, 1.4, 2.2, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#111111';
  for (let k = 0; k < 5; k++) { const a = frame * (0.2 + k * 0.03) + k * 1.3; ctx.fillRect(hx + Math.cos(a) * (18 + k * 3), hy + Math.sin(a * 1.4) * 10 - 4, 2, 2); }
  const r = frame % 90;
  if (r < 16) {
    ctx.fillStyle = 'rgba(101, 163, 13, 0.85)';
    for (let k = 0; k < 6; k++) { const t = (r + k * 2) / 18; ctx.beginPath(); ctx.arc(hx + 6 * sx + t * 10 * (e.facing ?? 1), hy + 6 * sy + t * t * 40, 3 - k * 0.3, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.restore();
};
