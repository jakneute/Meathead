// What the alien looks like: the thing that was wearing the President. One place for his colors and his build, so the
// cutscenes (game/scenes/endingAlien.ts) and the fight draw the same animal.
//
// Big, bulky and dumb: a tiny cranium perched on the front of a neck that's wider than it is, and under that cranium a
// jaw like a cinder block with an under-bite, a row of yellow pegs jutting up out of it over his top lip. Beady little
// eyes, close-set, yellow, bloodshot round the rims. Veiny olive-grey hide (purple veins like garden hoses), always a
// bit wet. A barrel chest, a gut, short bowed legs and three-toed feet; arms that hang to his knees, Popeye forearms,
// two fat fingers and a thumb with black claws. A ray gun grafted onto his right forearm (chrome, a pink coil glowing
// in it). Shreds of the President still on him: the white shirt collar round that neck, the red tie stuck to his
// chest (far too short on him now), rags of the navy jacket off his shoulders.
//
// All pixel art in the cutscenes' 16-bit way: stepped ramps (game/scenes/art/snes.ts), lit from up and to the left.

import { shaded, ball, box, RAMP } from './art/snes';
import type { Voice } from '../platform/speech';

type Ctx = CanvasRenderingContext2D;

/** His voice: slow, deep, dumb (`boss.alien`: cast in tools/voices/cast.json, the same as the fight's BOSS_VOICES). */
export const ALIEN_VOICE: Voice = { id: 'boss.alien', pitch: 0.5, rate: 0.85 };

/** His colors. Ramps run darkest to lightest. */
export const ALIEN = {
  /** The hide: olive going grey, a sick green in the lights. */
  hide: ['#0b140c', '#15241a', '#203826', '#2f4d30', '#416536', '#587f40', '#74994e', '#97b46a', '#c0d494'],
  /** His gut and the underside of his jaw: pale, yellowish, like a frog's. */
  belly: ['#2e2e16', '#4a4a24', '#6a6834', '#8e8a48', '#b0aa64', '#cec888', '#e6e0ae'],
  /** The veins over all of him (raised: a shadow under, a lit line along the top). */
  vein: '#5b3a78', veinLight: '#9a72b8', veinShadow: '#22142e',
  /** The wet on him: slime, its glints, where it's thick. */
  slime: '#a8e03a', slimeLight: '#eaffb0', slimeDark: '#5e8a18',
  /** Inside the mouth, the gums. */
  mouth: '#1c0610', gum: '#9a3a5c', gumDark: '#5c1a34', gumLight: '#c86a8a',
  /** The pegs of teeth: yellow, brown at the roots. */
  teeth: ['#4a3e18', '#7a6a30', '#a89a58', '#d8cc8c', '#f4ecc0'],
  /** The beady eyes: yellow, a pinprick pupil, a red rim. */
  sclera: '#e8d84a', scleraShade: '#a8962a', pupil: '#0a0a0a', eyeRim: '#7a1a10', glint: '#ffffff',
  /** Claws and toenails. */
  claw: ['#0c0a06', '#2a2214', '#4a3e26', '#6e6040'],
  /** The ray gun's beam and its coil: white-hot in the middle, pink, magenta, out to purple. */
  laser: ['#3c0630', '#7a0c5e', '#c01c98', '#ec44c4', '#ff8ce4', '#ffd8f6', '#ffffff'],
  /** The gun's chrome. */
  steel: RAMP.steel,
  /** What's left of the President's clothes on him. */
  suit: RAMP.navy, shirt: RAMP.shirt, tie: RAMP.red,
} as const;

/**
 * His build, as fractions of his height (feet to the top of his head), standing. Hunched: his head's in front of his
 * chest, not on top of it.
 */
export const ALIEN_SHAPE = {
  /** Top of the head down to the bottom of the jaw. The cranium is the small part of it; the jaw's most of it. */
  headH: 0.17, craniumW: 0.17, craniumH: 0.08,
  /** The jaw: wider than the cranium, jutting forward; the lower teeth stand this far up over the top lip. */
  jawW: 0.27, jawH: 0.1, jawJut: 0.05, underbite: 0.035,
  /** The neck's wider than his head. */
  neckW: 0.36,
  /** Shoulder to shoulder (the traps humped up nearly to his ears), and the barrel of the chest. */
  shoulderW: 0.8, chestH: 0.36,
  /** The gut, hanging. */
  gutW: 0.56, gutH: 0.24,
  /** Short, bowed legs; arms that reach his knees, the forearms twice the upper arms. */
  legH: 0.3, armReach: 0.28, upperArmR: 0.07, forearmR: 0.12,
  /** How far his head sits forward of his chest (the hunch). */
  hunch: 0.07,
} as const;

/** Height of the standing figure drawAlienFigure draws (a head taller than Meathead's 66). */
export const ALIEN_FIGURE_H = 90;

// ---------------------------------------------------------------------------
// The figure: full length, in the wide shots
// ---------------------------------------------------------------------------

/** The light off a tapered limb from (x0, y0) r0 thick to (x1, y1) r1 thick, for a box at (bx, by) w x h. */
const limbLight = (bx: number, by: number, w: number, h: number, x0: number, y0: number, r0: number, x1: number, y1: number, r1: number, amb = 0.12) => {
  const lx = -0.45, ly = -0.6, lz = Math.sqrt(1 - lx * lx - ly * ly);
  const dx = x1 - x0, dy = y1 - y0, l2 = dx * dx + dy * dy || 1;
  return (u: number, v: number) => {
    const px = bx + u * w, py = by + v * h;
    const k = Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / l2));
    const r = r0 + (r1 - r0) * k, nx = (px - (x0 + dx * k)) / r, ny = (py - (y0 + dy * k)) / r, d = nx * nx + ny * ny;
    if (d > 1) return -1;
    return amb + (1 - amb) * Math.max(0, nx * lx + ny * ly + Math.sqrt(1 - d) * lz);
  };
};

/** A tapered limb in `ramp`, shaded (cached by key: keep each pose's limbs at fixed coordinates relative to the figure). */
export const alienLimb = (ctx: Ctx, key: string, ramp: readonly string[], x0: number, y0: number, r0: number, x1: number, y1: number, r1: number) => {
  const bx = Math.floor(Math.min(x0 - r0, x1 - r1)), by = Math.floor(Math.min(y0 - r0, y1 - r1));
  const w = Math.ceil(Math.max(x0 + r0, x1 + r1)) - bx, h = Math.ceil(Math.max(y0 + r0, y1 + r1)) - by;
  // (cached in figure space: the key carries the shape, the offset's only where it lands)
  shaded(ctx, `${key}|${(x0 - bx).toFixed(1)},${(y0 - by).toFixed(1)},${(x1 - bx).toFixed(1)},${(y1 - by).toFixed(1)}`, bx, by, w, h, [...ramp], limbLight(bx, by, w, h, x0, y0, r0, x1, y1, r1));
};

const P = (ctx: Ctx, x: number, y: number, w: number, h: number, c: string) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };

export interface AlienPose {
  /** Which way he's facing. */
  facing?: 1 | -1;
  /** The gun arm: hanging, or up and aimed (`aim`: how far below level it points, radians; 0 dead ahead). */
  arm?: 'down' | 'aim';
  aim?: number;
  /** His mouth hanging open (talking, or just breathing through it). */
  open?: boolean;
  /** How much of the President's skin is still hanging off him, peeled down to his waist like a wetsuit (0: none). */
  peel?: number;
  /** Frame counter: breathing, the slime, the coil's glow. */
  t?: number;
}

/**
 * The alien, full length, feet at (cx, baseY): ALIEN_FIGURE_H tall. Hunched, arms to his knees, gut out. `pose.facing`
 * 1 faces right.
 */
export const drawAlienFigure = (ctx: Ctx, cx: number, baseY: number, pose: AlienPose = {}) => {
  const f = pose.facing ?? 1, t = pose.t ?? 0, arm = pose.arm ?? 'down';
  const X = (x: number) => cx + f * x, Y = (y: number) => baseY + y;
  const Rf = (x: number, y: number, w: number, h: number, c: string) => P(ctx, f > 0 ? cx + x : cx - x - w, baseY + y, w, h, c);
  const breathe = Math.round(Math.sin(t * 0.12));
  const H = ALIEN.hide, B = ALIEN.belly, k = (s: string) => `al-${s}${f}`;

  // --- Legs: short, bowed, thick; the knees out, three-toed feet ---
  for (const [i, s] of [[0, -1], [1, 1]] as const) {
    alienLimb(ctx, k(`thigh${i}`), H, X(s * 10), Y(-32), 9, X(s * 15), Y(-16), 8);
    alienLimb(ctx, k(`shin${i}`), H, X(s * 15), Y(-16), 8, X(s * 13), Y(-4), 6);
    // Feet: a slab, three toes out the front, black nails
    shaded(ctx, k(`foot${i}`), X(s * 13) - 9 + f * 3, Y(-6), 18, 7, [...H], box(-0.4, -0.8, 0.12, 1, 0.6));
    for (let toe = 0; toe < 3; toe++) {
      Rf(s * 13 + 2 + toe * 4 - (f > 0 ? 0 : 0), -2, 3, 2, H[2]);
      Rf(s * 13 + 5 + toe * 4, -1, 2, 1, ALIEN.claw[0]);
    }
  }

  // --- The gut and the chest: a barrel, the gut hanging pale under it ---
  shaded(ctx, k('chest'), X(-1) - 27, Y(-80) + breathe, 54, 46, [...H], box(-0.45, -0.5, 0.13, 1, 0.55));
  shaded(ctx, k('gut'), X(2) - 21, Y(-50) + breathe, 42, 26, [...B], ball(-0.4, -0.65, 0.16));
  // (the navel, a crease where the gut hangs over)
  Rf(1, -38 + breathe, 2, 2, B[1]);
  Rf(-14, -26, 30, 1, B[1]);
  // (the pecs' undersides)
  Rf(-20, -60 + breathe, 16, 1, H[2]); Rf(4, -60 + breathe, 16, 1, H[2]);

  // --- What's left of the jacket, hanging off his shoulders in rags ---
  for (const s of [-1, 1]) {
    for (let r = 0; r < 4; r++) {
      const rx = s * (16 + r * 3), len = 10 + ((r * 7 + (s > 0 ? 3 : 0)) % 9);
      Rf(rx - 1, -78, 3, len, ALIEN.suit[r % 2 ? 2 : 3]);
      Rf(rx - 1, -78 + len, 2, 1, ALIEN.suit[1]);
    }
  }

  // --- The back arm (hanging) ---
  const back = -1;
  alienLimb(ctx, k('uarmB'), H, X(back * 25), Y(-74), 7, X(back * 31), Y(-52), 7);
  alienLimb(ctx, k('farmB'), H, X(back * 31), Y(-52), 9, X(back * 31), Y(-28), 12);
  shaded(ctx, k('fistB'), X(back * 31) - 9, Y(-30), 18, 14, [...H], ball(-0.45, -0.6, 0.14));
  Rf(back * 31 - 6, -18, 3, 3, ALIEN.claw[1]); Rf(back * 31 + 2, -17, 3, 3, ALIEN.claw[1]);

  // --- The neck: wider than his head; the shirt collar round it; the tie on his chest ---
  shaded(ctx, k('neck'), X(4) - 18, Y(-92), 36, 20, [...H], box(-0.5, -0.2, 0.14, 1, 0.3));
  // (traps humped up either side)
  shaded(ctx, k('trapL'), X(-14) - 13, Y(-88), 26, 16, [...H], ball(-0.4, -0.75, 0.14));
  shaded(ctx, k('trapR'), X(18) - 12, Y(-87), 24, 15, [...H], ball(-0.4, -0.75, 0.14));
  Rf(-12, -77, 34, 3, ALIEN.shirt[3]); Rf(-12, -77, 34, 1, ALIEN.shirt[4]); Rf(-12, -75, 34, 1, ALIEN.shirt[1]);
  Rf(3, -77, 6, 4, ALIEN.tie[3]);                          // (the knot)
  Rf(4, -73 + breathe, 4, 9, ALIEN.tie[3]); Rf(4, -73 + breathe, 1, 9, ALIEN.tie[4]); Rf(4, -64 + breathe, 4, 1, ALIEN.tie[1]); // (too short now)

  // --- The head: the jaw like a block, the under-bite, the tiny cranium perched on top, the beady eyes ---
  const hx = 10;
  shaded(ctx, k('jaw'), X(hx) - 13, Y(-98), 26, 14, [...H], box(-0.5, -0.4, 0.15, 1, 0.6));
  shaded(ctx, k('chin'), X(hx + 3) - 11, Y(-90), 22, 7, [...B], box(-0.4, -0.7, 0.2, 1, 0.8));
  shaded(ctx, k('cranium'), X(hx - 3) - 7, Y(-108), 14, 12, [...H], ball(-0.4, -0.6, 0.16));
  // (the brow, a ridge; the eyes under it, tiny and close-set)
  Rf(hx - 9, -102, 13, 2, H[3]);
  for (const ex of [hx - 7, hx - 1]) { Rf(ex, -100, 3, 2, ALIEN.eyeRim); Rf(ex + (f > 0 ? 1 : 1), -100, 1, 1, ALIEN.sclera); Rf(ex + 1, -99, 1, 1, ALIEN.pupil); }
  // (the nostrils: two slits)
  Rf(hx + 4, -96, 1, 2, H[0]); Rf(hx + 6, -96, 1, 2, H[0]);
  // The mouth: a slot across the jaw, the lower teeth up over the top lip
  const open = pose.open && t % 12 < 7;
  Rf(hx - 6, -93, 18, open ? 4 : 2, ALIEN.mouth);
  if (open) Rf(hx - 4, -91, 14, 1, ALIEN.gum);
  for (let tooth = 0; tooth < 5; tooth++) { Rf(hx - 5 + tooth * 4, -95 + (tooth % 2), 2, 3 - (tooth % 2), ALIEN.teeth[3]); Rf(hx - 5 + tooth * 4, -93, 2, 1, ALIEN.teeth[1]); }
  // (veins up the neck, over the temple)
  for (let v = 0; v < 6; v++) Rf(-2 + v * 2, -90 + (v % 3), 1, 2, ALIEN.vein);
  Rf(hx - 6, -106, 1, 3, ALIEN.vein); Rf(hx - 5, -104, 2, 1, ALIEN.vein);

  // --- The President's skin, if it's still hanging off him: peeled down round his middle like a wetsuit, the empty
  // arms of it dangling, the face hanging off the front of it upside down, the hair still on ---
  if (pose.peel && pose.peel > 0) {
    const T = RAMP.tSkin, Hh = RAMP.tHair, p = pose.peel;
    const top = -50 + Math.round((1 - p) * 26);
    // (the bunched band of it, its top edge rolled over, folds)
    for (let x = -28; x <= 27; x++) {
      const ct = top + Math.round(Math.sin(x * 0.45) * 1.5 + Math.sin(x * 0.17) * 1.2), ch = 10 + (Math.abs(x) % 6 === 0 ? 2 : 0);
      Rf(x, ct, 1, 1, T[5]); Rf(x, ct + 1, 1, 2, T[4]); Rf(x, ct + 3, 1, ch - 6, T[3]); Rf(x, ct + ch - 3, 1, 3, T[2]);
      if ((x + 30) % 7 === 0) Rf(x, ct + 2, 1, ch - 3, T[1]);
    }
    // (the empty arms of it hanging off the sides, the hands on the ends like rubber gloves)
    for (const s of [-1, 1]) {
      const ax = s * 29 - 1;
      Rf(ax, top + 4, 3, 16, T[2]); Rf(ax + (s > 0 ? 0 : 2), top + 4, 1, 16, T[4]);
      Rf(ax - 1, top + 20, 5, 4, T[3]); for (let f = 0; f < 3; f++) Rf(ax - 1 + f * 2, top + 24, 1, 2 + (f % 2), T[2]);
    }
    // (the face, hanging off the front of it upside down: eye holes, the mouth a sag, the hair hanging under it)
    const fx = 2, fy = top + 10;
    for (let r = 0; r < 9; r++) { const hw = Math.round(6 * Math.sqrt(1 - ((r - 4) / 5) ** 2)); Rf(fx - hw, fy + r, hw * 2, 1, r < 2 ? T[2] : r < 6 ? T[4] : T[3]); }
    Rf(fx - 4, fy + 5, 2, 2, ALIEN.mouth); Rf(fx + 2, fy + 5, 2, 2, ALIEN.mouth); Rf(fx - 2, fy + 1, 4, 1, '#500000');
    Rf(fx - 6, fy + 9, 12, 2, Hh[3]); Rf(fx - 5, fy + 11, 9, 2, Hh[4]); Rf(fx - 2, fy + 13, 5, 1, Hh[2]); Rf(fx - 4, fy + 9, 6, 1, Hh[5]);
    for (let d = 0; d < 4; d++) Rf(-20 + d * 12, top + 11 + (d % 2) * 2, 1, 2 + ((t * 0.3 + d * 3) % 5), ALIEN.slime);
  }

  // --- The front arm: hanging, or up with the gun aimed dead ahead ---
  const front = 1;
  if (arm === 'aim') {
    const a = aimArm(pose.aim ?? 0);
    alienLimb(ctx, k(`uarmA${a.key}`), H, X(a.sx), Y(a.sy), 8, X(a.ex), Y(a.ey), 8);
    alienLimb(ctx, k(`farmA${a.key}`), H, X(a.ex), Y(a.ey), 10, X(a.hx), Y(a.hy), 11);
    shaded(ctx, k(`fistA${a.key}`), X(a.hx) - 7, Y(a.hy) - 7, 14, 14, [...H], ball(-0.45, -0.6, 0.14));
    // (two fat fingers and the thumb curled under, black claws)
    for (let c = 0; c < 2; c++) P(ctx, X(a.hx + a.dx * 6 + a.nx * (c * 4 - 2)) - 1, Y(a.hy + a.dy * 6 + a.ny * (c * 4 - 2)) - 1, 2, 2, ALIEN.claw[1]);
    // (veins along the forearm)
    for (let v = 1; v < 5; v++) P(ctx, X(a.ex + (a.hx - a.ex) * v / 5 - a.nx * 3), Y(a.ey + (a.hy - a.ey) * v / 5 - a.ny * 3), 1, 1, ALIEN.vein);
    gunLine(ctx, k(`gunA${a.key}`), X(a.gx0), Y(a.gy0), X(a.gx1), Y(a.gy1), t);
  } else {
    alienLimb(ctx, k('uarmD'), H, X(front * 26), Y(-74), 8, X(front * 33), Y(-52), 8);
    alienLimb(ctx, k('farmD'), H, X(front * 33), Y(-52), 10, X(front * 34), Y(-26), 12);
    shaded(ctx, k('fistD'), X(front * 34) - 9, Y(-28), 18, 14, [...H], ball(-0.45, -0.6, 0.14));
    gun(ctx, X(front * 34) - 6, Y(-50), t);
    for (let v = 0; v < 5; v++) Rf(30, -48 + v * 4, 1, 3, ALIEN.vein);
  }

  // --- Wet: slime glinting on his shoulders and head, a drip off the jaw ---
  Rf(hx - 6, -107, 3, 1, ALIEN.slimeLight); Rf(-16, -86, 4, 1, ALIEN.slimeLight); Rf(18, -84, 3, 1, ALIEN.slimeLight);
  const drip = (t * 0.4) % 14;
  Rf(hx + 6, -86 + drip, 1, 2, ALIEN.slime);
};

/** The aimed arm's joints, in figure space (facing right): shoulder, elbow, hand; the gun along the top of the forearm. */
const aimArm = (aim: number) => {
  const q = Math.round(aim * 20) / 20, ea = q * 0.55;
  const sx = 22, sy = -74, ex = sx + Math.cos(ea) * 19, ey = sy + Math.sin(ea) * 19;
  const dx = Math.cos(q), dy = Math.sin(q), hx = ex + dx * 18, hy = ey + dy * 18;
  // (the normal off the top of the forearm, where the gun's bolted on)
  const nx = dy, ny = -dx;
  const gx0 = ex + dx * 2 + nx * 7, gy0 = ey + dy * 2 + ny * 7, gx1 = gx0 + dx * 24, gy1 = gy0 + dy * 24;
  return { key: q.toFixed(2), sx, sy, ex, ey, hx, hy, dx, dy, nx, ny, gx0, gy0, gx1, gy1, mx: gx1 + dx * 2, my: gy1 + dy * 2 };
};

/** Where the muzzle is on a figure at (cx, baseY) aiming (`arm: 'aim'`, `aim` radians below level). */
export const alienMuzzle = (cx: number, baseY: number, facing: 1 | -1 = 1, aim = 0) => {
  const a = aimArm(aim);
  return { x: cx + facing * a.mx, y: baseY + a.my };
};

/** The light off a chrome cylinder from (x0, y0) to (x1, y1), r thick: a hard bright band near the top, dark under. */
const chrome = (bx: number, by: number, w: number, h: number, x0: number, y0: number, x1: number, y1: number, r: number) => {
  const dx = x1 - x0, dy = y1 - y0, l2 = dx * dx + dy * dy || 1, l = Math.sqrt(l2);
  return (u: number, v: number) => {
    const px = bx + u * w, py = by + v * h;
    const k = ((px - x0) * dx + (py - y0) * dy) / l2;
    if (k < -0.02 || k > 1.02) return -1;
    const off = ((px - x0) * -dy + (py - y0) * dx) / l / r;
    if (Math.abs(off) > 1) return -1;
    // (ribs every few pixels along it)
    const rib = Math.floor(k * l) % 5 === 0 ? -0.25 : 0;
    return Math.max(0, (off < -0.35 ? 0.95 : off < 0.1 ? 0.6 : 0.25 - (off - 0.1) * 0.2) + rib);
  };
};

/** The ray gun along the forearm, at any angle: a ribbed chrome barrel, the coil glowing pink through its middle. */
const gunLine = (ctx: Ctx, key: string, x0: number, y0: number, x1: number, y1: number, t: number) => {
  const r = 3.6, bx = Math.floor(Math.min(x0, x1) - r), by = Math.floor(Math.min(y0, y1) - r);
  const w = Math.ceil(Math.max(x0, x1) + r) - bx, h = Math.ceil(Math.max(y0, y1) + r) - by;
  shaded(ctx, `${key}|${(x0 - bx).toFixed(1)},${(y0 - by).toFixed(1)},${(x1 - bx).toFixed(1)},${(y1 - by).toFixed(1)}`, bx, by, w, h, [...ALIEN.steel], chrome(bx, by, w, h, x0, y0, x1, y1, r));
  const L = ALIEN.laser, n = 8, pulse = t % 8 < 4;
  for (let i = 0; i < n; i++) {
    const u = 0.3 + (i / n) * 0.4;
    P(ctx, x0 + (x1 - x0) * u - 1, y0 + (y1 - y0) * u - 1, 2, 2, L[(i + (pulse ? 1 : 0)) % 2 ? 3 : 4]);
  }
  // (the muzzle: a flared ring)
  P(ctx, x1 - 2, y1 - 2, 4, 4, ALIEN.steel[4]); P(ctx, x1 - 1, y1 - 1, 2, 2, L[pulse ? 5 : 4]);
};

/** The ray gun hanging along his forearm, pointing at the floor. */
const gun = (ctx: Ctx, x: number, y: number, t: number) => {
  const S = ALIEN.steel, L = ALIEN.laser;
  P(ctx, x, y, 7, 22, S[2]); P(ctx, x + 1, y, 2, 22, S[4]); P(ctx, x + 5, y, 2, 22, S[1]);
  for (let r = 0; r < 4; r++) P(ctx, x, y + 3 + r * 5, 7, 1, S[0]);
  P(ctx, x + 2, y + 6, 3, 8, L[t % 8 < 4 ? 3 : 4]);
  P(ctx, x - 1, y + 21, 9, 3, S[3]);
};

/**
 * The beam: from (x0, y0) to (x1, y1), `k` (0..1) of the way out. A white-hot core, pink round it, magenta round that,
 * wobbling; a flare at the muzzle and (when it's arrived) a splash of sparks where it hits.
 */
export const laserBeam = (ctx: Ctx, x0: number, y0: number, x1: number, y1: number, k: number, t: number) => {
  const L = ALIEN.laser, ex = x0 + (x1 - x0) * k, ey = y0 + (y1 - y0) * k;
  const steps = Math.max(1, Math.ceil(Math.hypot(ex - x0, ey - y0)));
  for (const [w, c] of [[5, L[2]], [3, L[4]], [1, L[6]]] as const) {
    for (let i = 0; i <= steps; i++) {
      const u = i / steps, wob = w > 1 ? Math.round(Math.sin(i * 0.7 + t * 1.3)) * (w > 3 ? 1 : 0) : 0;
      P(ctx, x0 + (ex - x0) * u, y0 + (ey - y0) * u - Math.floor(w / 2) + wob, 1, w, c);
    }
  }
  // (the flare at the muzzle)
  P(ctx, x0 - 3, y0 - 1, 7, 3, L[5]); P(ctx, x0 - 1, y0 - 3, 3, 7, L[5]); P(ctx, x0, y0, 1, 1, L[6]);
  if (k >= 1) {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + t * 0.5, d = 3 + ((t + i * 3) % 6);
      P(ctx, x1 + Math.cos(a) * d, y1 + Math.sin(a) * d, 1, 1, i % 2 ? L[5] : '#fce0a8');
    }
    P(ctx, x1 - 2, y1 - 2, 5, 5, L[5]); P(ctx, x1 - 1, y1 - 1, 3, 3, L[6]);
  }
};
