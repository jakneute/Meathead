// What he does with his new toy on the walk-away (walkAway.ts), weapon by weapon: each its own loop, in step with his
// stride (a step every STEP frames). The crossbow's is the walk-away's own (turned over in both hands, sniffed, gagged
// on: poseAt in walkAway.ts); everything else is here. Each act fills in a Pose (meathead.ts: his face, his head, the
// Hold: where his fists, elbows and the toy are) and makes its noises and spatter (tick).
//
//   GUN          the ray gun, gunslinger: twirled, blown on, rested on his shoulder
//   FLINTLOCK    smoke blown off it, tucked in his waistband, strutting; quick-drawn and fired in the air
//   SPELLBOOK    read as he walks, the pages going over, the light up on his face; slammed shut, carried, opened again
//   STUNT_CAR    the clapperboard: carried, held up, snapped: CUT!
//   MALLET       over his shoulder, bouncing; bonked on his own head, stars
//   SPAWNER      shaken like a snow globe; peered into; it squirts him in the face
//   SOUVENIR     on his shoulder like a bazooka; tossed up spinning, caught; junk falls out of the bag
//   SOUL_SUCKER  carried by the handle, the gore bag sloshing; the nozzle stuck on his own face, pulled off: a hickey

import type { SoundType, WeaponType } from '../../m1/types';
import { type Ctx, INK, box, smoke } from './kit';
import { type Pose, type Pt, type Hold, hangFist, ELBOW_L, ELBOW_R } from './meathead';
import * as T from './toys';

/** What an act can set off: a sound, a bit of spatter (his frame: his feet at the origin; it falls with `g`). */
export interface ActFx {
  sound: (type: SoundType, vol: number, pitch?: number) => void;
  bit: (x: number, y: number, vx: number, vy: number, col: string, g?: number, life?: number) => void;
}
export interface Act {
  cycle: number;
  /** Fills in `p` (its step, t, nude, shat, rim are set) for frame `t`. */
  pose: (t: number, p: Pose) => void;
  /** Once a frame (u: the frame in the cycle). */
  tick?: (t: number, u: number, fx: ActFx) => void;
}

// ---------------------------------------------------------------------------------------------------------------
// The machinery: keyframed holds, eased between

const ease = (k: number) => { const u = Math.max(0, Math.min(1, k)); return u * u * (3 - 2 * u); };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerpP = (a: Pt, b: Pt, k: number): Pt => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
/** The shortest way round from a to b. */
const lerpA = (a: number, b: number, k: number) => { let d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return a + d * k; };
/** 0..1 across frames a..b of the cycle, eased. */
const seg = (u: number, a: number, b: number) => ease((u - a) / (b - a));
const rot2 = ([x, y]: Pt, a: number, sx = 1, sy = 1): Pt => { x *= sx; y *= sy; return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)]; };
/** A point on the toy (its frame) where it is in his. */
const onToy = (h: { at: Pt; rot: number; sx?: number; sy?: number }, q: Pt): Pt => { const [x, y] = rot2(q, h.rot, h.sx ?? 1, h.sy ?? 1); return [h.at[0] + x, h.at[1] + y]; };

/** A hold, keyframed: his left fist (L), his right (R; null: hanging), elbows (left out: worked out from the fists), the
 *  toy's origin (at; left out: in his left fist), its tilt, its flip. */
interface K { L?: Pt | null; R?: Pt | null; EL?: Pt; ER?: Pt; at?: Pt; rot: number; sx?: number; sy?: number }
interface Full { L: Pt; R: Pt; EL: Pt; ER: Pt; at: Pt; rot: number; sx: number; sy: number }

/** The elbows for fists there: down by his sides, coming up and out as the fist comes up toward his face. */
const elbowFor = (side: number, f: Pt): Pt => {
  const up = Math.max(0, -(f[1] + 72));
  const base = side > 0 ? ELBOW_L : ELBOW_R;
  return [base[0] + side * Math.min(14, up * 0.22) + (f[0] - base[0]) * 0.08, base[1] - up * 0.32];
};
const full = (k: K, step: number): Full => {
  const L = k.L ?? hangFist(1, step), R = k.R ?? hangFist(-1, step);
  return { L, R, EL: k.EL ?? elbowFor(1, L), ER: k.ER ?? elbowFor(-1, R), at: k.at ?? L, rot: k.rot, sx: k.sx ?? 1, sy: k.sy ?? 1 };
};
const mixFull = (a: Full, b: Full, k: number): Full => ({
  L: lerpP(a.L, b.L, k), R: lerpP(a.R, b.R, k), EL: lerpP(a.EL, b.EL, k), ER: lerpP(a.ER, b.ER, k), at: lerpP(a.at, b.at, k),
  rot: lerpA(a.rot, b.rot, k), sx: k < 0.5 ? a.sx : b.sx, sy: k < 0.5 ? a.sy : b.sy,
});
/**
 * Keyframes: [from frame, how long it takes to get there, the hold (a function of the frame)]. Each one eases in from
 * where the one before left off; the last eases round into the first (the loop).
 */
type Key = [number, number, (u: number, step: number) => K];
const play = (keys: Key[], u: number, step: number): Full => {
  let i = keys.length - 1;
  while (i > 0 && keys[i][0] > u) i--;
  const [at, dur, f] = keys[i];
  const cur = full(f(u, step), step);
  if (u - at >= dur) return cur;
  const prev = keys[(i - 1 + keys.length) % keys.length];
  return mixFull(full(prev[2](u, step), step), cur, ease((u - at) / dur));
};
const toHold = (f: Full, draw: Hold['draw'], extra: Partial<Hold> = {}): Hold => ({
  wx: f.at[0], wy: f.at[1], rot: f.rot, sx: f.sx, sy: f.sy, draw, left: f.L, right: f.R, elbowL: f.EL, elbowR: f.ER, ...extra,
});

/** Where his mouth is (his frame, before the bob). */
const MOUTH = (p: Pose): Pt => [0, -154 + p.headY];

/** A wisp of smoke off a point (his frame, the bob added): a few puffs curling up, thinning out. */
const wisp = (c: Ctx, x: number, y: number, t: number, drift = 0.01, n = 5) =>
  smoke(c, x, y, 10, t, 3, { n, rise: 0.05, drift, size: 0.32, col: ['#E5E7EB', '#D4D4D8', '#A1A1AA', '#71717A'] });

// ---------------------------------------------------------------------------------------------------------------
// The ray gun: a gunslinger. Down at his side; twirled (three times round his finger); up to his lips to blow the
// muzzle off; resting on his shoulder, tapping it, chuckling; back down.

const GUN: Act = {
  cycle: 540,
  pose: (t, p) => {
    const u = t % 540, step = p.step;
    const sw = Math.sin(step);
    const keys: Key[] = [
      [0, 30, (_u, s) => ({ rot: Math.PI / 2 - 0.1 + Math.sin(s) * 0.06 })],
      [120, 25, () => ({ L: [52, -80], rot: Math.PI / 2 })],
      // (twirling: three times round, quickest in the middle)
      [145, 6, uu => ({ L: [52, -80 - Math.sin(seg(uu, 145, 225) * Math.PI) * 4], rot: Math.PI / 2 + seg(uu, 145, 225) * Math.PI * 6 })],
      [225, 26, () => ({ L: [21, -114], rot: -Math.PI / 2 - 0.3 })],
      [262, 8, uu => ({ L: [21, -114 + Math.sin(uu * 0.3)], rot: -Math.PI / 2 - 0.34 })],
      // (on his shoulder: the muzzle up past his ear, tapping it with his stride)
      [318, 28, () => ({ L: [38, -128 + Math.abs(sw) * 1.5], rot: -Math.PI / 2 + 0.32 - Math.abs(sw) * 0.05, EL: [62, -108] })],
      [500, 34, (_u, s) => ({ rot: Math.PI / 2 - 0.1 + Math.sin(s) * 0.06 })],
    ];
    const f = play(keys, u, step);
    const blowing = u >= 262 && u < 318;
    p.face = blowing ? 'blow' : u >= 145 && u < 230 ? 'smirk' : u >= 380 && u < 430 ? 'chuckle' : 'grin';
    p.headY = blowing ? -1 : u >= 380 && u < 430 ? -((t >> 3) % 2) : 0;
    p.hold = toHold(f, T.rayGun, {
      over: (c, ty) => {
        // (blown off the muzzle: a curl of smoke going off sideways; and a last wisp up while it's on his shoulder)
        if (u >= 240 && u < 340) {
          const m = onToy(f, T.RAY_MUZZLE);
          wisp(c, m[0], m[1] + ty, t, blowing ? 0.04 : 0.008, blowing ? 6 : 3);
        }
      },
    });
  },
  tick: (_t, u, fx) => {
    for (const k of [160, 180, 197, 212]) if (u === k) fx.sound('whoosh', 0.1, 12 + (k % 3));
    if (u === 225) fx.sound('click', 0.25, 4);
    if (u === 266) fx.sound('whoosh', 0.14, 14);
    if (u === 346) fx.sound('thud', 0.1, 8);
  },
};

// ---------------------------------------------------------------------------------------------------------------
// The flintlock: smoking by his face; the smoke blown off it; spun once and tucked in his waistband (no pants: down
// by his side); strutting; quick-drawn and fired in the air, BANG; back up by his face, smoking.

const FLINTLOCK: Act = {
  cycle: 600,
  pose: (t, p) => {
    const u = t % 600, step = p.step;
    const tucked = !p.nude;
    const belt: K = tucked ? { at: [17, -79], rot: Math.PI / 2 + 0.1, L: null } : { rot: Math.PI / 2 - 0.1 };
    const keys: Key[] = [
      [0, 30, () => ({ L: [24, -112], rot: -Math.PI / 2 - 0.12 })],
      [50, 16, () => ({ L: [19, -114], rot: -Math.PI / 2 - 0.36 })],
      // (spun once, down to the belt)
      [112, 6, uu => ({ L: [44, -96], rot: -Math.PI / 2 + seg(uu, 112, 140) * Math.PI * 2 })],
      [140, 14, () => ({ L: [22, -80], at: [22, -80], rot: Math.PI / 2 + 0.1 })],
      [156, 22, () => belt],
      // (the draw: hand to it, up, BANG)
      [400, 12, () => ({ L: [22, -82], at: [22, -82], rot: Math.PI / 2 + 0.1 })],
      [412, 9, () => ({ L: [58, -150], rot: -Math.PI / 2 + 0.55, EL: [64, -116] })],
      [430, 4, uu => ({ L: [56, -146 + (uu < 440 ? 3 : 0)], rot: -Math.PI / 2 + 0.75 - (uu < 445 ? 0.25 : 0), EL: [64, -114] })],
      [470, 30, () => ({ L: [24, -112], rot: -Math.PI / 2 - 0.12 })],
    ];
    const f = play(keys, u, step);
    const inBelt = tucked && u >= 156 && u < 404;
    const blowing = u >= 54 && u < 108;
    p.face = blowing ? 'blow' : u >= 425 && u < 440 ? 'yell' : u >= 230 && u < 275 ? 'chuckle' : u < 54 || u >= 470 ? 'smirk' : 'grin';
    p.headY = u >= 425 && u < 432 ? -2 : u >= 230 && u < 275 ? -((t >> 3) % 2) : 0;
    const draw = inBelt ? null : T.flintlock;
    p.hold = toHold(f, draw, {
      mid: (c, ty) => {
        // (tucked in the front of his jeans, by the buckle: the stock and the lock up out of it, the rest down his pants)
        if (!inBelt) return;
        c.save(); c.beginPath(); c.rect(-40, -200 + ty, 80, 114); c.clip();
        c.translate(f.at[0], f.at[1] + ty); c.rotate(f.rot); T.flintlock(c, t);
        c.restore();
        box(c, 10, -86 + ty, 18, 2, '#5C2A0B');
      },
      over: (c, ty) => {
        const m = onToy(f, T.FLINT_MUZZLE);
        // (the muzzle flash)
        if (u >= 430 && u < 436) {
          const fl = ['#FFFBEB', '#FDE047', '#F59E0B'];
          for (let i = 0; i < 3; i++) { c.fillStyle = fl[i]; c.beginPath(); c.arc(m[0] + 4, m[1] - 6 + ty, 9 - i * 3 + (u - 430), 0, Math.PI * 2); c.fill(); }
        }
        // (smoking: off the muzzle, blown off it, a big puff after the shot)
        if (u < 112 || u >= 430) wisp(c, m[0], m[1] + ty, t, blowing ? 0.05 : 0.006, blowing ? 7 : u >= 430 && u < 480 ? 7 : 4);
      },
    });
  },
  tick: (_t, u, fx) => {
    if (u === 58) fx.sound('whoosh', 0.14, 14);
    if (u === 118) fx.sound('whoosh', 0.1, 10);
    if (u === 150) fx.sound('click', 0.2, -2);
    if (u === 430) { fx.sound('flintlock', 0.32, 0); for (let i = 0; i < 6; i++) fx.bit(60 + i, -200, (Math.random() - 0.3) * 1.4, -0.6 - Math.random(), ['#FDE047', '#F59E0B', '#78716C'][i % 3], 0.08, 30); }
  },
};

// ---------------------------------------------------------------------------------------------------------------
// The spellbook: read as he goes, the book up in both hands, its light on his face, the pages going over, the runes
// floating up out of it (a chuckle at something in it); slammed shut, puff; swung by his side; up, opened again.

const SPELLBOOK: Act = {
  cycle: 600,
  pose: (t, p) => {
    const u = t % 600, step = p.step;
    const open = u < 320 ? 1 : u < 334 ? 1 - seg(u, 320, 334) : u >= 548 ? seg(u, 548, 580) : 0;
    const shut = u >= 362 && u < 540;
    const wsp = 4 + open * 22;
    const sway = Math.sin(step) * 1.2;
    const reading = (): K => ({ at: [0, -98 + sway * 0.5], rot: Math.sin(step * 0.5) * 0.03, L: [wsp + 3, -114 + sway * 0.5], R: [-wsp - 3, -114 + sway * 0.5], EL: [46, -104], ER: [-46, -104] });
    const keys: Key[] = [
      [0, 20, reading],
      [334, 26, () => ({ at: [40, -84], L: [42, -86], R: [34, -88], rot: 0.15 })],
      [362, 6, (_u, s) => ({ rot: Math.PI / 2 - 0.15 + Math.sin(s) * 0.05 })],
      [540, 10, () => ({ at: [4, -98], L: [8, -112], R: [-8, -112], rot: 0, EL: [46, -104], ER: [-46, -104] })],
      [552, 30, reading],
    ];
    const f = play(keys, u, step);
    // (a page over every so often)
    const flipAt = [50, 140, 215, 265].find(a => u >= a && u < a + 22);
    const flip = flipAt !== undefined ? (u - flipAt) / 22 : 0;
    const lit = open > 0.4;
    p.face = u >= 160 && u < 205 ? 'chuckle' : lit ? 'smirk' : u >= 336 && u < 360 ? 'grin' : 'grin';
    p.headY = lit ? 1 : 0;
    p.hold = toHold(f, shut ? T.bookShut : (c, tt) => T.bookOpen(c, tt, open, flip), {
      over: (c, ty) => {
        if (!lit) {
          // (slammed: a puff of purple)
          if (u >= 334 && u < 356) { const k = (u - 334) / 22; c.fillStyle = '#C084FC'; for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; box(c, f.at[0] + Math.cos(a) * 18 * k, f.at[1] - 18 + Math.sin(a) * 12 * k + ty, 2, 2, (i + (u >> 2)) % 2 ? '#E9D5FF' : '#A855F7'); } }
          return;
        }
        // (its light on his face: from under, purple)
        const hy = ty + p.headY;
        c.save(); c.globalAlpha = 0.16 + 0.06 * Math.sin(t * 0.15);
        c.fillStyle = '#C084FC'; c.beginPath(); c.ellipse(0, -156 + hy, 13, 8, 0, 0, Math.PI * 2); c.fill();
        c.restore();
        // (runes floating up off the pages, wobbling, fading)
        for (let i = 0; i < 4; i++) {
          const age = (t + i * 23) % 92, k = age / 92;
          if (k > 0.9) continue;
          const rx = f.at[0] + Math.sin(i * 2.3 + age * 0.08) * 12, ry = f.at[1] - 40 - age * 0.55 + ty;
          const col = k < 0.5 ? '#F5D0FE' : '#C084FC';
          box(c, rx, ry, 3, 1, col); box(c, rx + (i % 2 ? 0 : 2), ry - 2, 1, 3, col); if (i % 3 === 0) box(c, rx, ry - 2, 3, 1, col);
        }
      },
    });
  },
  tick: (_t, u, fx) => {
    for (const a of [50, 140, 215, 265]) if (u === a + 4) fx.sound('whoosh', 0.07, 18);
    if (u === 172) fx.sound('spell', 0.08, 6);
    if (u === 333) { fx.sound('slam', 0.25, 4); for (let i = 0; i < 8; i++) fx.bit((Math.random() - 0.5) * 30, -134, (Math.random() - 0.5) * 2, -0.6 - Math.random(), ['#E9D5FF', '#C084FC', '#A855F7'][i % 3], 0.04, 40); }
    if (u === 566) fx.sound('spell', 0.08, -2);
  },
};

// ---------------------------------------------------------------------------------------------------------------
// The clapperboard: carried by his side; up in front of him, the clapper opened; SNAP, CUT! (yelled); held there a
// moment, pleased with himself; back down.

const CUT = (c: Ctx, x: number, y: number, k: number) => {
  // (a burst behind it, the word over it, bouncing in)
  const s = k < 0.15 ? 0.6 + (k / 0.15) * 0.6 : k < 0.25 ? 1.2 - ((k - 0.15) / 0.1) * 0.2 : 1;
  c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(s, s);
  const pts: number[][] = [];
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, r = i % 2 ? 13 : 22; pts.push([Math.cos(a) * r * 1.3, Math.sin(a) * r * 0.8]); }
  c.beginPath(); pts.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py))); c.closePath();
  c.fillStyle = '#FDE047'; c.fill(); c.strokeStyle = INK; c.lineWidth = 1; c.stroke();
  c.font = '8px "Press Start 2P"'; c.textAlign = 'center'; c.textBaseline = 'middle';
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1]]) { c.fillStyle = INK; c.fillText('CUT!', dx, 1 + dy); }
  c.fillStyle = '#DC2626'; c.fillText('CUT!', 0, 1);
  c.restore();
};

const STUNT_CAR: Act = {
  cycle: 540,
  pose: (t, p) => {
    const u = t % 540, step = p.step;
    const open = u < 200 ? 0 : u < 236 ? seg(u, 206, 232) * 0.75 : u < 246 ? 0.75 : u < 250 ? 0.75 * (1 - (u - 246) / 4) : 0;
    // (the hinge's on the screen's right (flipped): his right hand on the clapper's end, out to the left)
    const UP: Pt = [24, -104];
    const hinge: Pt = [UP[0] + 18, UP[1] - 37];
    const tip: Pt = [hinge[0] - Math.cos(open) * 36, hinge[1] - Math.sin(open) * 36];
    const hang = (_u: number, s: number): K => ({ at: hangFist(1, s), rot: Math.PI / 2 + 0.25 + Math.sin(s) * 0.05, sx: -1 });
    const keys: Key[] = [
      [0, 30, hang],
      [200, 28, () => ({ L: UP, at: UP, rot: 0, sx: -1, EL: [52, -96], R: [tip[0] + 1, tip[1] + 5], ER: [-34, -114] })],
      [330, 36, hang],
    ];
    const f = play(keys, u, step);
    const snapped = u >= 248 && u < 330;
    p.face = u >= 247 && u < 272 ? 'yell' : u >= 272 && u < 320 ? 'chuckle' : u >= 200 && u < 247 ? 'smirk' : 'grin';
    p.headY = u >= 247 && u < 252 ? -2 : u >= 272 && u < 320 ? -((t >> 3) % 2) : 0;
    p.hold = toHold(f, (c, tt) => T.slate(c, tt, open), {
      over: (_c, ty) => { if (snapped) CUT(_c, -48, -176 + ty, (u - 248) / 82); },
    });
  },
  tick: (_t, u, fx) => {
    if (u === 248) { fx.sound('clap', 0.4, 0); for (let i = 0; i < 6; i++) fx.bit(10 + Math.random() * 30, -160, (Math.random() - 0.5) * 1.5, -0.4 - Math.random() * 0.6, '#E5E7EB', 0.05, 30); }
  },
};

// ---------------------------------------------------------------------------------------------------------------
// The mallet: slung over his shoulder, bouncing with his stride; up and over and BONK on his own flat-top, stars round
// his head, cross-eyed; shakes it off, grins; back on his shoulder.

const MALLET: Act = {
  cycle: 600,
  pose: (t, p) => {
    const u = t % 600, step = p.step;
    const bnc = Math.abs(Math.sin(step));
    const shoulder = (): K => ({ L: [34, -112 + bnc * 2], rot: -Math.PI / 2 + 0.5 - bnc * 0.08, EL: [58, -100] });
    const keys: Key[] = [
      [0, 30, shoulder],
      [380, 24, () => ({ L: [58, -158], rot: -Math.PI / 2 - 0.5, EL: [66, -122] })],
      // (down on his head)
      [404, 6, () => ({ L: [60, -196], rot: Math.PI - 0.12, EL: [64, -150] })],
      [420, 30, () => ({ L: [58, -160], rot: -Math.PI / 2 + 0.2, EL: [66, -124] })],
      [470, 30, shoulder],
    ];
    const f = play(keys, u, step);
    const dazed = u >= 410 && u < 490;
    const squash = u >= 409 && u < 418 ? 4 - (u - 409) * 0.4 : 0;
    p.face = dazed ? 'dazed' : u >= 380 && u < 410 ? 'smirk' : u >= 490 && u < 530 ? 'chuckle' : 'grin';
    p.headY = Math.round(squash) + (u >= 490 && u < 530 ? -((t >> 3) % 2) : 0);
    p.hold = toHold(f, T.mallet, {
      under: u < 384 || u >= 476,
      over: (c, ty) => {
        if (!dazed) return;
        // (stars round his head)
        const hy = -194 + ty + p.headY;
        for (let i = 0; i < 4; i++) {
          const a = t * 0.12 + (i / 4) * Math.PI * 2, sx = Math.cos(a) * 20, sy = hy + Math.sin(a) * 5;
          const col = (i + (t >> 3)) % 2 ? '#FDE047' : '#FFFFFF';
          box(c, sx - 1, sy - 3, 2, 6, INK); box(c, sx - 3, sy - 1, 6, 2, INK);
          box(c, sx, sy - 2, 1, 4, col); box(c, sx - 2, sy, 4, 1, col);
        }
      },
    });
  },
  tick: (_t, u, fx) => {
    if (u === 386) fx.sound('whoosh', 0.14, 4);
    if (u === 409) fx.sound('bonk', 0.4, 0);
    if (u === 418) fx.sound('twinkle', 0.2, 0);
  },
};

// ---------------------------------------------------------------------------------------------------------------
// The spawner: held up in front of him, looking at what's squirming in it; shaken like a snow globe (both hands, the
// litter flung about, chittering); up to his face, the hole at him, peering in, it clenches: SPLAT, in the face; he
// gags, then licks his lips; back down.

const SPAWNER: Act = {
  cycle: 600,
  pose: (t, p) => {
    const u = t % 600, step = p.step;
    const sw = Math.sin(step);
    const shakeK = u >= 176 && u < 244 ? 1 : 0;
    const jig = shakeK ? Math.sin(u * 0.9) * 7 : 0;
    const keys: Key[] = [
      [0, 30, () => ({ L: [34, -98 + sw * 1.5], rot: -0.12 + sw * 0.03 })],
      [170, 12, () => ({ L: [16, -112 + jig], R: [-4, -126 + jig], rot: 0, ER: [-44, -106] })],
      [244, 26, () => ({ L: [62, -140], rot: -0.28, sx: -1, EL: [68, -110] })],
      [300, 6, () => ({ L: [64, -138], rot: -0.4, sx: -1, EL: [68, -110] })],
      [380, 30, () => ({ L: [34, -98 + sw * 1.5], rot: -0.12 + sw * 0.03 })],
    ];
    const f = play(keys, u, step);
    const squeeze = u >= 268 && u < 288 ? seg(u, 268, 286) : u >= 288 && u < 300 ? 1 - (u - 288) / 12 : 0;
    const gooed = u >= 288 && u < 470;
    p.face = u >= 270 && u < 288 ? 'sniff' : u >= 288 && u < 330 ? 'gag' : u >= 330 && u < 380 ? 'chuckle' : u >= 176 && u < 244 ? 'grin' : 'smirk';
    p.green = u >= 290 && u < 320 ? 0.4 : 0;
    p.headY = u >= 288 && u < 296 ? -2 : u >= 330 && u < 380 ? -((t >> 3) % 2) : 0;
    p.hold = toHold(f, (c, tt) => T.spawner(c, tt, shakeK, squeeze), {
      over: (c, ty) => {
        if (!gooed) return;
        // (the slime on his face: down his nose and chin, dripping)
        const hy = ty + p.headY, k = Math.min(1, (u - 288) / 120);
        const G = ['#4D7C0F', '#84CC16', '#BEF264'];
        for (const [x, y, w, d] of [[-8, -168, 6, 10], [1, -166, 5, 14], [-3, -158, 8, 12], [5, -156, 4, 8]]) {
          box(c, x, y + hy, w, 4, G[1]); box(c, x, y + hy, w, 1, G[2]);
          box(c, x + 1, y + 4 + hy, 2, Math.round(d * k), G[1]); box(c, x + 1, y + 4 + hy + Math.round(d * k), 2, 2, G[0]);
        }
        // (licking it off)
        if (u >= 336 && u < 372) box(c, 2 + Math.round(Math.sin(u * 0.4) * 2), -152 + hy, 3, 3, '#E11D48');
      },
    });
  },
  tick: (_t, u, fx) => {
    if (u >= 176 && u < 244 && u % 14 === 0) fx.sound('chitter', 0.12, (u % 3) * 2);
    if (u === 288) {
      fx.sound('splat', 0.35, 4);
      for (let i = 0; i < 14; i++) fx.bit(-2 + Math.random() * 14, -164 + Math.random() * 10, (Math.random() - 0.6) * 2.4, -1.4 - Math.random() * 1.2, ['#4D7C0F', '#84CC16', '#BEF264'][i % 3], 0.14, 50);
    }
    if (u === 340) fx.sound('glug', 0.15, 6);
  },
};

// ---------------------------------------------------------------------------------------------------------------
// The souvenir launcher: on his shoulder like a bazooka; dipped and tossed up spinning, caught one-handed, junk
// rattling out of the bag; a smaller flip later.

const SOUVENIR: Act = {
  cycle: 480,
  pose: (t, p) => {
    const u = t % 480, step = p.step;
    const bnc = Math.abs(Math.sin(step));
    const shoulder = (): K => ({ L: [48, -102 + bnc * 1.5], rot: -1.42 - bnc * 0.04, sy: -1, EL: [60, -96] });
    const toss = (a: number, b: number, h: number, turns: number) => (uu: number): K => {
      const k = (uu - a) / (b - a), y = -92 - h * 4 * k * (1 - k);
      return { L: [46, -100 + Math.sin(k * Math.PI) * 6], at: [44 - 12 * Math.sin(k * Math.PI), y], rot: -0.4 + k * Math.PI * 2 * turns, EL: [62, -98] };
    };
    const keys: Key[] = [
      [0, 30, shoulder],
      [110, 26, () => ({ L: [46, -90], rot: -0.4 })],
      [146, 0, toss(146, 196, 100, 2)],
      [196, 4, () => ({ L: [44, -94], rot: -0.4 })],
      [210, 30, shoulder],
      [340, 20, () => ({ L: [46, -92], rot: -0.4 })],
      [360, 0, toss(360, 386, 40, 1)],
      [386, 4, () => ({ L: [44, -94], rot: -0.4 })],
      [396, 30, shoulder],
    ];
    const f = play(keys, u, step);
    const flying = (u >= 146 && u < 196) || (u >= 360 && u < 386);
    if (flying) f.L = [46, -102];
    const caught = (u >= 196 && u < 216) || (u >= 386 && u < 400);
    p.face = flying ? 'smirk' : caught ? 'chuckle' : 'grin';
    p.headY = u >= 150 && u < 190 ? -2 : caught ? -((t >> 3) % 2) : 0;
    p.hold = toHold(f, (c, tt) => T.souvenir(c, tt, caught ? Math.sin(u * 0.8) * 2 : 0), { under: !flying && !caught && (u < 110 || u >= 220) });
  },
  tick: (_t, u, fx) => {
    if (u === 146 || u === 360) fx.sound('whoosh', 0.16, 2);
    if (u === 196 || u === 386) {
      fx.sound('souvenir', 0.18, 6);
      if (u === 196) for (let i = 0; i < 4; i++) fx.bit(40 + i * 3, -120, (Math.random() - 0.5) * 1.6, -1 - Math.random(), ['#FDE047', '#38BDF8', '#F472B6', '#A3E635'][i], 0.15, 60);
    }
  },
};

// ---------------------------------------------------------------------------------------------------------------
// The soul sucker: carried by its handle, swinging with his stride, the gore bag sloshing, the grinder's crank going
// round, the nozzle in his other fist; the nozzle up and stuck on his own face (the vac howling, his eyes squeezed
// shut, shaking); POP, off: a round red hickey round his mouth he chuckles about the rest of the way.

const SOUL_SUCKER: Act = {
  cycle: 600,
  pose: (t, p) => {
    const u = t % 600, step = p.step;
    const sucking = u >= 218 && u < 276;
    const jit = sucking ? ((t >> 1) % 2) * 2 - 1 : 0;
    const keys: Key[] = [
      [0, 30, (_u, s) => ({ L: [44, -72 + Math.sin(s) * 1], rot: -Math.sin(s - 0.6) * 0.12 })],
      [180, 34, (_u, s) => ({ L: [44, -72 + Math.sin(s) * 1], rot: -Math.sin(s - 0.6) * 0.12, R: [-20 + jit, -148 + p.headY], ER: [-50, -112] })],
      [276, 6, (_u, s) => ({ L: [44, -72], rot: -Math.sin(s - 0.6) * 0.12, R: [-44, -132], ER: [-56, -108] })],
      [300, 40, (_u, s) => ({ L: [44, -72 + Math.sin(s) * 1], rot: -Math.sin(s - 0.6) * 0.12 })],
    ];
    const f = play(keys, u, step);
    const slosh = Math.sin(step - 0.9) * 0.9;
    // (the nozzle: down by his right side, pointing at the ground; up at his mouth, pointing in at it)
    const up = u >= 180 && u < 300 ? (u < 214 ? seg(u, 180, 214) : u >= 276 ? 1 - seg(u, 276, 300) : 1) : 0;
    const na = lerp(Math.PI / 2 + 0.3, 0, up);
    p.face = sucking ? 'gag' : u >= 276 && u < 330 ? 'chuckle' : u >= 180 && u < 218 ? 'smirk' : 'grin';
    p.headY = sucking ? jit : u >= 276 && u < 282 ? -2 : u >= 280 && u < 330 ? -((t >> 3) % 2) : 0;
    const hickey = u >= 276 && u < 560;
    p.hold = toHold(f, (c, tt) => T.suckerBody(c, sucking ? tt * 4 : tt, slosh), {
      mid: (c, ty) => {
        // (the hose, off the vac to the nozzle in his right fist; the nozzle)
        const h = onToy(f, T.SUCK_HOSE);
        const tipOff: Pt = [Math.cos(na) * 12, Math.sin(na) * 12];
        const tip: Pt = [f.R[0] + tipOff[0], f.R[1] + tipOff[1]];
        const back: Pt = [f.R[0] - Math.cos(na) * 12, f.R[1] - Math.sin(na) * 12];
        T.suckerHose(c, h[0], h[1] + ty, back[0], back[1] + ty, 18 - up * 10);
        c.save(); c.translate(tip[0], tip[1] + ty); T.suckerNozzle(c, na); c.restore();
      },
      over: (c, ty) => {
        if (!hickey) return;
        // (the hickey: a ring round his mouth, red going purple)
        const [mx, my] = MOUTH(p);
        const col = u < 400 ? '#DC2626' : '#9D174D';
        c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.ellipse(mx, my + ty, 7, 6, 0, 0, Math.PI * 2); c.stroke();
        box(c, mx - 5, my - 5 + ty, 2, 1, '#FCA5A5');
      },
    });
  },
  tick: (_t, u, fx) => {
    if (u === 218) fx.sound('suck', 0.3, 0);
    if (u === 240) fx.sound('grind', 0.18, 2);
    if (u === 276) fx.sound('boing', 0.3, 6);
    if (u % 60 === 15 && (u < 180 || u > 300)) fx.sound('glug', 0.06, 4);
  },
};

/** Each weapon's act (none: the crossbow's own, the walk-away's default). */
export const ACTS: Partial<Record<WeaponType, Act>> = { GUN, FLINTLOCK, SPELLBOOK, STUNT_CAR, MALLET, SPAWNER, SOUVENIR, SOUL_SUCKER };

/** Its toy for the bottom bar's icon (side on, about the size of the walk-away's own; the crossbow's scenes draw theirs). */
export const toyIcon = (weapon: WeaponType) => {
  switch (weapon) {
    case 'GUN': return (c: Ctx, t: number) => { c.translate(-16, 10); T.rayGun(c, t); };
    case 'FLINTLOCK': return (c: Ctx, t: number) => { c.translate(-22, 6); T.flintlock(c, t); };
    case 'SPELLBOOK': return (c: Ctx, t: number) => { c.translate(-12, 0); T.bookShut(c, t); };
    case 'STUNT_CAR': return (c: Ctx, t: number) => { c.translate(0, 18); T.slate(c, t, 0.3); };
    case 'MALLET': return (c: Ctx) => { c.translate(-10, 18); c.rotate(-0.5); c.scale(0.7, 0.7); T.mallet(c); };
    case 'SPAWNER': return (c: Ctx, t: number) => { c.translate(-18, 12); T.spawner(c, t); };
    case 'SOUVENIR': return (c: Ctx, t: number) => { c.translate(-12, 16); c.scale(0.8, 0.8); T.souvenir(c, t); };
    case 'SOUL_SUCKER': return (c: Ctx, t: number) => { c.translate(0, -20); c.scale(0.8, 0.8); T.suckerBody(c, t, Math.sin(t * 0.1) * 0.5); };
    default: return null;
  }
};
