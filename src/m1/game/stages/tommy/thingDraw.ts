// The thing in the cistern: a great heaving mound of the muck up out of its
// pool, and everyone the water killed in it. Bones and skulls drifting about
// inside, hands and faces pressed against the inside of its skin (the faces
// all talk at once), two huge arms made of arms. When it's had what it asked
// for it shivers and glows; when it's ignored, one of the arms goes up and up
// and comes down on the walkway. And it dies the way it's killed: frozen and
// shattered, boiled down to charred bones, burst like a water balloon with
// the bodies spilling out, thinned out by clean water till there's nothing
// holding them together, or just melting down into the pool.
//
// Drawn 16-bit: one inked silhouette, its skin banded in steps (lit round the
// upper left, the deep down the right and under it), mottled, veined,
// pustuled and glistening; the skin and every bone, face, hand and arm in it
// painted once into a canvas and kept (it's the size of the room and it's
// drawn every frame), only the heave, the eyes, the mouths and the drips live.

import type { Enemy } from '../../../types';
import type { GameState } from '../../core/state';
import { GROUND_Y } from '../../../constants';
import { COURSE, WALK_Y } from './course';
import { Thing, FIST_UP, FIST_LAND, FIST_DONE, WANT_NAME, THING_SURFACE, NEED, inGrace, GRACE_FRAMES, DROP_FROM, DROP_WARN, PUDDLE_R, PUDDLE_FRAMES } from './thing';
import { getTommy } from './runtime';
import { saying } from './script';
import { INK, ink, shaded } from '../../render/npc/kit';
import { mix } from '../../render/backdrops/core';
import { bandedGradient, checker, hazeBands } from '../../render/pixelArt';
import { sewerBrick } from './sewerDraw';

type Ctx = CanvasRenderingContext2D;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const TAU = Math.PI * 2;

/** Its colors, a lit rim then five steps down to the deep under it: the muck as it is, and what it goes as it dies (frozen, thinned out by clean water, boiled). */
type Ramp = [string, string, string, string, string, string, string];
const MUCK: Ramp = ['#A3B850', '#6E8028', '#56661B', '#435115', '#323C0E', '#212808', '#121604'];
const ICE: Ramp = ['#F4FBFF', '#BAE6FD', '#8CCBEA', '#62A9CF', '#41819F', '#2A5C78', '#163449'];
const CLEAR: Ramp = ['#E0FAF3', '#8FD3C4', '#6DB5A6', '#4F9688', '#3A786C', '#285A50', '#163830'];
const BOILED: Ramp = ['#9A8650', '#5E4F26', '#4A3D1C', '#3A2F15', '#2C230F', '#1E180A', '#100C05'];
/** The people in it: their skin (grey-green, drowned; or frozen), lit to dark. Their bones, and the bones charred. */
const FLESH = ['#C7CC94', '#A3AA6E', '#7F8650', '#5A6034'], FLESH_ICE = ['#F0F9FF', '#C4E4F4', '#93C2DC', '#5F93B3'];
const BONE = ['#F6F3E4', '#DCD6BE', '#B0A98D', '#7A745C'], CHAR = ['#7A6E62', '#4A433D', '#2E2925', '#1A1715'];
/** The muck it drips (brighter, fresher than its hide), lit to dark. */
const SLIME = ['#D9F99D', '#84CC16', '#65A30D', '#4D7C0F', '#365314'];

/** Parts painted once and kept: by key, w x h, `paint` drawing into the fresh canvas. */
const sprites = new Map<string, HTMLCanvasElement>();
const sprite = (key: string, w: number, h: number, paint: (g: Ctx) => void) => {
  let c = sprites.get(key);
  if (!c) { c = document.createElement('canvas'); c.width = w; c.height = h; paint(c.getContext('2d')!); sprites.set(key, c); }
  return c;
};

/** What's floating around in it (from its middle): what, where, how big, how it turns. */
const REMAINS = Array.from({ length: 16 }, (_, i) => ({
  look: ['skull', 'ribs', 'hand', 'skull', 'femur', 'shoe', 'skull', 'hand'][i % 8],
  x: (hash(i * 3.1) - 0.5) * 220, y: -60 - hash(i * 5.7) * 260, s: 0.8 + hash(i * 7.3) * 0.6, spin: (hash(i * 9.1) - 0.5) * 0.02, phase: hash(i) * 6,
}));
/** Faces pressed against its skin, and hands. */
const FACES = [{ x: -40, y: -300, s: 1.3 }, { x: 36, y: -280, s: 1.1 }, { x: -70, y: -210, s: 1 }, { x: 60, y: -190, s: 1.2 }, { x: -10, y: -150, s: 0.9 }, { x: 0, y: -330, s: 1 }];

/** One of the bits of people in it (40 x 40, its middle the middle): bone, inked, lit from the upper left; or charred black, an ember or two in it. */
const remainSprite = (look: string, charred: boolean) => sprite(`remain|${look}|${charred}`, 40, 40, g => {
  const P = charred ? CHAR : BONE;
  g.translate(20, 20);
  switch (look) {
    case 'skull':
      // (the jaw, then the cranium over it: the teeth, the sockets, the nose hole, a glint on the dome)
      shaded(g, () => g.rect(-5, 5, 10, 7), P[1], -5, 5, 10, 7, 1);
      g.fillStyle = P[3]; for (let x = -3; x <= 3; x += 2) g.fillRect(x, 6, 1, 4);
      shaded(g, () => g.arc(0, -1, 9, 0, TAU), P[1], -9, -10, 18, 18, 1.2);
      g.fillStyle = '#14120C'; g.beginPath(); g.ellipse(-3.5, 0, 2.6, 3, 0, 0, TAU); g.ellipse(3.5, 0, 2.6, 3, 0, 0, TAU); g.fill();
      g.fillRect(-1, 4, 2, 3);
      g.fillStyle = P[0]; g.fillRect(-6, -7, 4, 2); g.fillRect(-7, -5, 2, 2);
      break;
    case 'ribs':
      // (the spine, the ribs curving off it, ink under bone, each rib lit along its top)
      for (const [c, lw] of [[INK, 4], [P[1], 2]] as [string, number][]) {
        g.strokeStyle = c; g.lineWidth = lw; g.lineCap = 'round';
        g.beginPath(); g.moveTo(0, -14); g.lineTo(0, 14);
        for (let k = -10; k <= 10; k += 5) { g.moveTo(0, k); g.quadraticCurveTo(-12, k + 2, -10, k + 8); g.moveTo(0, k); g.quadraticCurveTo(12, k + 2, 10, k + 8); }
        g.stroke();
      }
      g.fillStyle = P[0]; for (let k = -10; k <= 10; k += 5) { g.fillRect(-7, k + 1, 3, 1); g.fillRect(4, k + 1, 3, 1); }
      g.fillStyle = P[3]; for (let k = -13; k <= 13; k += 4) g.fillRect(-1, k, 2, 1);
      break;
    case 'hand':
      // (the finger bones, their knuckles, the palm and the thumb)
      for (let k = 0; k < 4; k++) ink(g, () => g.rect(-5 + k * 3, -10, 2, 9), P[1], 1);
      g.fillStyle = P[3]; for (let k = 0; k < 4; k++) g.fillRect(-5 + k * 3, -6, 2, 1);
      shaded(g, () => g.rect(-5, -2, 10, 9), P[1], -5, -2, 10, 9, 1);
      ink(g, () => g.rect(5, 0, 5, 2), P[1], 1);
      g.fillStyle = P[0]; g.fillRect(-4, -1, 3, 1);
      break;
    case 'femur':
      // (the knobs, then the shaft over them, lit along its top)
      for (const [x, y] of [[-14, -2], [-14, 2], [14, -2], [14, 2]]) ink(g, () => g.arc(x, y, 3, 0, TAU), P[1], 1);
      shaded(g, () => g.rect(-14, -2, 28, 4), P[1], -14, -2, 28, 4, 1);
      g.fillStyle = P[0]; g.fillRect(-12, -2, 22, 1);
      break;
    case 'shoe': {
      // (somebody's sneaker: the upper, the laces, the red sole)
      const up = charred ? CHAR[1] : '#F4F4F5', sole = charred ? CHAR[2] : '#DC2626';
      shaded(g, () => { g.moveTo(-10, 2); g.lineTo(-10, -5); g.lineTo(-2, -5); g.quadraticCurveTo(10, -3, 10, 2); g.closePath(); }, up, -10, -5, 20, 7, 1);
      shaded(g, () => g.rect(-11, 2, 22, 3), sole, -11, 2, 22, 3, 1);
      g.fillStyle = charred ? CHAR[3] : '#9CA3AF'; for (let k = 0; k < 3; k++) g.fillRect(-4 + k * 3, -4, 2, 1);
      break;
    }
  }
  // (charred: a couple of embers still in it)
  if (charred) { g.fillStyle = '#F97316'; g.fillRect(-2, 2, 2, 1); g.fillStyle = '#FDBA74'; g.fillRect(3, -4, 1, 1); }
});

const drawRemain = (ctx: Ctx, look: string, alpha: number, charred = false) => {
  const a = ctx.globalAlpha;
  ctx.globalAlpha = a * alpha;
  ctx.drawImage(remainSprite(look, charred), -20, -20);
  ctx.globalAlpha = a;
};

/** The body's own size: across at the waterline, tall. */
const W = 330, H = 370;
/** Its skin's box (a touch bigger than the body, for the heave). */
const SW = Math.ceil(W * 1.04), SH = Math.ceil(H * 1.04);

/**
 * Its skin, painted once per ramp over the body's box (its bottom middle the body's foot): banded top to bottom, lit
 * down the left and in shadow down the right in dithered steps, mottled, veined, pustules lit from the upper left,
 * glints of slime and runs of it. Clipped to the heaving outline each frame, stretched to it as it sags.
 */
const skin = (name: string, r: Ramp) => sprite('skin|' + name, SW, SH, g => {
  bandedGradient(g, 0, 0, SW, SH, [r[2], r[3], r[4], r[5]], 6, 2);
  // (round: two lit steps down the left, two dark ones down the right, each seam dithered)
  const step = (x0: number, x1: number, c: string, a: number, seamAt: number) => {
    g.globalAlpha = a; g.fillStyle = c; g.fillRect(x0, 0, x1 - x0, SH);
    checker(g, seamAt, 0, 4, SH, c, 0, 2); g.globalAlpha = 1;
  };
  step(0, SW * 0.2, r[0], 0.22, SW * 0.2);
  step(0, SW * 0.36, r[0], 0.12, SW * 0.36);
  step(SW * 0.64, SW, r[6], 0.22, SW * 0.64 - 4);
  step(SW * 0.82, SW, r[6], 0.3, SW * 0.82 - 4);
  const snap = (v: number) => Math.round(v / 2) * 2;
  // (inside its dome, roughly: where the detail goes)
  const inside = (x: number, y: number, m = 0.82) => ((x - SW / 2) / (SW / 2)) ** 2 + ((SH - y) / SH) ** 2 < m;
  // (mottling: blotches of the darker and the lighter step, in chunky cells)
  for (let i = 0; i < 110; i++) {
    const x = snap(hash(i * 1.37) * SW), y = snap(hash(i * 2.71) * SH), n = 2 + Math.floor(hash(i * 4.1) * 4);
    g.fillStyle = i % 3 ? r[5] : r[1]; g.globalAlpha = i % 3 ? 0.3 : 0.22;
    g.fillRect(x, y, n * 2, 2); g.fillRect(x + 2, y + 2, n * 2 - 2, 2); if (n > 3) g.fillRect(x + 4, y - 2, n * 2 - 6, 2);
  }
  g.globalAlpha = 1;
  // (veins: dark, wandering, each lit along its upper edge)
  for (let v = 0; v < 6; v++) {
    let x = SW * (0.15 + hash(v * 6.1) * 0.7), y = SH * (0.25 + hash(v * 3.3) * 0.6);
    const pts: [number, number][] = [];
    for (let s = 0; s < 9; s++) { pts.push([snap(x), snap(y)]); x += (hash(v * 9 + s) - 0.5) * 16; y += 4 + hash(v * 7 + s * 3) * 6; }
    for (const [c, oy, lw] of [[r[0], -2, 1], [r[6], 0, 2]] as [string, number, number][]) {
      g.strokeStyle = c; g.lineWidth = lw; g.globalAlpha = c === r[0] ? 0.18 : 0.4;
      g.beginPath(); pts.forEach(([px, py], i) => (i ? g.lineTo(px, py + oy) : g.moveTo(px, py + oy))); g.stroke();
    }
  }
  g.globalAlpha = 1;
  // (pustules: a dark ring, the swelling, a lit cap and a glint)
  const pus = mix(r[1], '#E2F79A', 0.2);
  for (let i = 0; i < 30; i++) {
    const x = snap(SW * (0.08 + hash(i * 5.3) * 0.84)), y = snap(SH * (0.1 + hash(i * 8.9) * 0.82)), rr = 3 + Math.floor(hash(i * 2.2) * 5);
    if (!inside(x, y)) continue;
    g.fillStyle = r[6]; g.beginPath(); g.arc(x + 1, y + 1, rr + 1.5, 0, TAU); g.fill();
    g.fillStyle = r[4]; g.beginPath(); g.arc(x, y, rr, 0, TAU); g.fill();
    g.fillStyle = pus; g.beginPath(); g.arc(x - rr * 0.25, y - rr * 0.3, rr * 0.7, 0, TAU); g.fill();
    g.fillStyle = r[0]; g.fillRect(snap(x - rr * 0.5), snap(y - rr * 0.6), 2, 2);
  }
  // (slime runs: a lit streak down the skin, a bead at the end of it, its shadow down the right)
  for (let i = 0; i < 8; i++) {
    const x = snap(SW * (0.12 + hash(i * 3.9) * 0.6)), y = snap(SH * (0.1 + hash(i * 6.6) * 0.5)), len = snap(12 + hash(i * 1.9) * 26);
    if (!inside(x, y, 0.7)) continue;
    run(g, x, y, len, r, 0.7);
  }
  // (glints of wet on the lit side: short bright dashes, a white pixel atop each)
  for (let i = 0; i < 12; i++) {
    const x = snap(SW * (0.1 + hash(i * 7.7) * 0.35)), y = snap(SH * (0.08 + hash(i * 4.4) * 0.55)), len = 2 + Math.floor(hash(i * 2.9) * 2) * 2;
    if (!inside(x, y, 0.72)) continue;
    g.fillStyle = r[0]; g.globalAlpha = 0.7; g.fillRect(x, y, 2, len); g.globalAlpha = 1;
  }
});

/** A face pressed against the inside of its skin (`s` its size), its eyes and mouth left out (they're live): the skin of it lit in steps, the sockets sunk, the brow, the nose. */
const faceSprite = (s: number, frozen: boolean) => {
  const cw = Math.ceil(36 * s) + 6, ch = Math.ceil(44 * s) + 6;
  return { cw, ch, c: sprite(`face|${s}|${frozen}`, cw, ch, g => {
    const P = frozen ? FLESH_ICE : FLESH, hole = frozen ? '#0C2D48' : '#1E2608';
    g.translate(cw / 2, ch / 2); g.scale(s, s);
    const oval = () => g.ellipse(0, 0, 16, 20, 0, 0, TAU);
    const blob = (x: number, y: number, rx: number, ry: number, c: string) => { g.fillStyle = c; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill(); };
    g.save(); g.beginPath(); oval(); g.clip();
    g.fillStyle = P[3]; g.fillRect(-18, -22, 36, 44);
    blob(-1.5, -2, 15, 18.5, P[2]); blob(-3, -4, 12.5, 15.5, P[1]); blob(-6, -10, 5, 5, P[0]);
    // (the sockets, sunk: shadow round them, the holes)
    blob(-6, -4, 6, 7, P[2]); blob(6, -4, 6, 7, P[2]);
    blob(-6, -5, 4, 5, hole); blob(6, -5, 4, 5, hole);
    // (the brow lit over them, the nose's shadow and its lit ridge, the hollow cheeks, round the mouth)
    g.fillStyle = P[0]; g.fillRect(-10, -12, 7, 2); g.fillRect(3, -12, 7, 2); g.fillRect(-1, -1, 1, 5);
    g.fillStyle = P[3]; g.fillRect(0, 0, 3, 5); g.fillRect(-13, 3, 3, 7); g.fillRect(10, 3, 3, 7);
    blob(0, 9.5, 7.5, 5, P[2]);
    g.restore();
    g.beginPath(); oval(); g.strokeStyle = INK; g.lineWidth = 1.6; g.stroke();
  }) };
};

/** A hand pressed flat against the inside of it (its palm at the origin's top middle): grey-green, lit along its left, the muck's dark round it rather than ink. */
const handSprite = () => sprite('hand', 20, 28, g => {
  g.translate(10, 15);
  g.strokeStyle = MUCK[5]; g.lineWidth = 1;
  for (let q = 0; q < 4; q++) {
    const x = -6 + q * 3.5, top = -12 + (q === 0 || q === 3 ? 2 : 0);
    g.fillStyle = FLESH[1]; g.fillRect(x, top, 2.5, 10); g.strokeRect(x, top, 2.5, 10);
    g.fillStyle = FLESH[0]; g.fillRect(x, top, 1, 8);
  }
  g.fillStyle = FLESH[1]; g.fillRect(-6, -2, 12, 12); g.strokeRect(-6, -2, 12, 12);
  g.fillStyle = FLESH[0]; g.fillRect(-6, -2, 4, 11);
  g.fillStyle = FLESH[2]; g.fillRect(-2, 6, 8, 4); g.fillRect(3, -2, 3, 12);
  g.fillStyle = FLESH[1]; g.fillRect(6, 1, 4, 3); g.strokeRect(6, 1, 4, 3);
});

/** One of the arms an arm's made of (40 x 20, its middle the middle): the forearm, the elbow, the hand at the end, grey-green and inked. */
const armSprite = () => sprite('arm', 40, 20, g => {
  ink(g, () => g.arc(7, 10, 4, 0, TAU), FLESH[2], 1);
  shaded(g, () => g.rect(7, 7, 19, 6), FLESH[1], 7, 7, 19, 6, 1);
  g.fillStyle = FLESH[0]; g.fillRect(8, 8, 17, 1);
  for (let q = 0; q < 3; q++) ink(g, () => g.rect(32, 5 + q * 3, 5, 2), FLESH[1], 1);
  shaded(g, () => g.rect(26, 5, 7, 9), FLESH[1], 26, 5, 7, 9, 1);
  ink(g, () => g.rect(27, 2, 2, 4), FLESH[1], 1);
});

/** The fist: a lump of the muck the size of a car, stepped round like a ball lit from the upper left, fists all over it, knuckles out (110 x 110, its middle the middle). */
const fistSprite = () => sprite('fist', 110, 110, g => {
  g.translate(55, 55);
  g.fillStyle = INK; g.beginPath(); g.arc(0, 0, 45.5, 0, TAU); g.fill();
  g.save(); g.beginPath(); g.arc(0, 0, 44, 0, TAU); g.clip();
  const disc = (x: number, y: number, rr: number, c: string) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, rr, 0, TAU); g.fill(); };
  disc(0, 0, 44, MUCK[5]); disc(-3, -4, 40, MUCK[4]); disc(-7, -9, 32, MUCK[3]); disc(-12, -15, 20, MUCK[2]);
  checker(g, -44, 30, 88, 14, MUCK[6], 0, 2);
  g.fillStyle = MUCK[0]; g.fillRect(-26, -32, 6, 2); g.fillRect(-30, -28, 2, 4);
  g.restore();
  // (the fists in it: each a block of knuckles, lit along its top, the fingers' creases)
  // (the fists in it, every which way: each a lump of curled fingers, a row of knuckles along its top lit, the
  // creases between the fingers, the thumb folded across)
  [[-24, -28, -0.5], [2, -34, 0.1], [26, -22, 0.6], [-32, 4, -1.3], [32, 10, 1.4], [-10, 22, 2.9], [14, 24, -2.8], [0, -4, 0.3]].forEach(([x, y, a]) => {
    g.save(); g.translate(x, y); g.rotate(a);
    shaded(g, () => g.ellipse(0, 1, 10, 7.5, 0, 0, TAU), FLESH[1], -10, -7, 20, 16, 1);
    for (let k = 0; k < 4; k++) { const kx = -6 + k * 4; ink(g, () => g.arc(kx, -4, 2.6, 0, TAU), FLESH[k ? 1 : 0], 1); g.fillStyle = FLESH[0]; g.fillRect(kx - 1.5, -6, 2, 1); }
    g.fillStyle = FLESH[3]; for (let k = 0; k < 3; k++) g.fillRect(-4.5 + k * 4, -1, 1, 4);
    g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(-7, 5); g.quadraticCurveTo(-1, 2, 5, 5); g.stroke();
    g.fillStyle = FLESH[0]; g.fillRect(-5, 3, 6, 1);
    g.restore();
  });
});

/** One of them, out of it: a person, grey-green, a bit dissolved, a bone showing (30 x 52, the origin at their middle, 40 down). */
const SHIRTS = ['#78716C', '#9F1239', '#1E3A8A', '#A16207', '#3F6212', '#6B21A8'];
const corpseSprite = (i: number) => sprite('corpse|' + (i % SHIRTS.length), 30, 52, g => {
  g.translate(15, 40);
  shaded(g, () => g.rect(-6, -4, 5, 12), '#44403C', -6, -4, 5, 12, 1);
  shaded(g, () => g.rect(1, -4, 5, 12), '#44403C', 1, -4, 5, 12, 1);
  ink(g, () => g.rect(-2, -26, 4, 7), FLESH[2], 1);
  shaded(g, () => g.arc(0, -30, 6, 0, TAU), FLESH[2], -6, -36, 12, 12, 1);
  g.fillStyle = INK; g.fillRect(-3, -31, 2, 2); g.fillRect(2, -31, 2, 2); g.fillRect(-1, -27, 3, 1);
  shaded(g, () => g.rect(-7, -20, 14, 16), SHIRTS[i % SHIRTS.length], -7, -20, 14, 16, 1);
  checker(g, -6, -12, 12, 6, 'rgba(77, 124, 15, 0.7)', 0, 2); // (the muck soaked into it)
  ink(g, () => g.rect(-10, -18, 3, 10), BONE[1], 1); // (bone showing)
  g.fillStyle = BONE[0]; g.fillRect(-10, -18, 1, 9);
});
const drawCorpse = (ctx: Ctx, i: number) => ctx.drawImage(corpseSprite(i), -15, -40);

/** A chunk of it frozen solid (34 x 26, its middle the middle): faceted, lit on its top facet, dark on its right, a glint. */
const shardSprite = (v: number) => sprite('shard|' + v, 34, 26, g => {
  g.translate(17, 13);
  const P = v ? ['#F0F9FF', '#E0F2FE', '#BAE6FD', '#7DD3FC'] : ['#E0F2FE', '#BAE6FD', '#7DD3FC', '#38BDF8'];
  const outline = () => { g.moveTo(-14, -7); g.lineTo(-3, -11); g.lineTo(14, -8); g.lineTo(12, 7); g.lineTo(-5, 11); g.lineTo(-15, 3); g.closePath(); };
  ink(g, outline, P[1], 1.4);
  g.fillStyle = P[0]; g.beginPath(); g.moveTo(-14, -7); g.lineTo(-3, -11); g.lineTo(14, -8); g.lineTo(-1, -1); g.closePath(); g.fill();
  g.fillStyle = P[3]; g.beginPath(); g.moveTo(14, -8); g.lineTo(12, 7); g.lineTo(-5, 11); g.lineTo(-1, -1); g.closePath(); g.fill();
  g.beginPath(); outline(); g.strokeStyle = '#0C2D48'; g.lineWidth = 1.4; g.stroke();
  g.fillStyle = '#FFFFFF'; g.fillRect(-9, -7, 4, 2); g.fillRect(-10, -5, 2, 2);
});

/** A run of slime down it (from x, y, `len` long, in ramp `r`): wide at the top and narrowing in steps, a bead at the foot, its shadow down the right, lit down the left. */
const run = (g: Ctx, x: number, y: number, len: number, r: readonly string[], a: number) => {
  const q = Math.max(2, Math.round(len / 3));
  g.globalAlpha = a * 0.6; g.fillStyle = r[6];
  g.fillRect(x + 4, y + 1, 1, q); g.fillRect(x + 3, y + q, 1, q); g.fillRect(x + 2, y + q * 2, 1, len - q * 2); g.fillRect(x - 1, y + len + 4, 5, 1);
  g.globalAlpha = a; g.fillStyle = r[2];
  g.fillRect(x - 1, y, 5, q); g.fillRect(x, y + q, 3, q); g.fillRect(x, y + q * 2, 2, len - q * 2);
  g.fillRect(x, y + len - 2, 3, 1); g.fillRect(x - 1, y + len - 1, 5, 3); g.fillRect(x, y + len + 2, 3, 1);
  g.fillStyle = r[1]; g.fillRect(x - 1, y, 2, q); g.fillRect(x, y + q, 1, q * 2 - 2); g.fillRect(x - 1, y + len - 1, 2, 2);
  g.globalAlpha = 1;
};

/** The body's outline: a mound, heaving, `h` tall, `w` across at the waterline. */
const bodyPath = (ctx: Ctx, w: number, h: number, f: number, sag: number) => {
  ctx.beginPath();
  ctx.moveTo(-w / 2, 0);
  for (let k = 0; k <= 20; k++) {
    const a = Math.PI - (k / 20) * Math.PI;
    const r = 1 + Math.sin(k * 1.7 + f * 0.06) * 0.03;
    const x = Math.cos(a) * w / 2 * r * (1 + sag * 0.5), y = -Math.sin(a) * h * r * (1 - sag);
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w / 2, 0);
  ctx.closePath();
};
/** A point on that outline (k of 20, from the left), for what runs down it. */
const bodyPoint = (w: number, h: number, f: number, sag: number, k: number) => {
  const a = Math.PI - (k / 20) * Math.PI, r = 1 + Math.sin(k * 1.7 + f * 0.06) * 0.03;
  return { x: Math.cos(a) * w / 2 * r * (1 + sag * 0.5), y: -Math.sin(a) * h * r * (1 - sag) };
};

export const drawThing = (ctx: Ctx, e: Enemy, th: Thing, state: GameState) => {
  const f = state.frame;
  const cx = e.pos.x + e.width / 2, base = THING_SURFACE;
  const rt = getTommy(state);
  const talking = !!rt && !!saying(rt.talk, 'thing');
  const d = th.death, dt = th.deathT;
  // Rising up out of the pool at the start
  const rise = th.phase === 'rise' ? clamp01(th.t / 90) : 1;
  // How it's going, dying
  const freeze = d === 'SHOTGUN' ? clamp01(dt / 60) : 0;
  const shattered = d === 'SHOTGUN' && dt > 130;
  const boil = d === 'FLAMETHROWER' ? clamp01(dt / 180) : 0;
  const burst = d === 'BOULDER' && dt > 50;
  const clear = d === 'TSUNAMI' ? clamp01(dt / 90) : 0;
  const melt = d && d !== 'SHOTGUN' && d !== 'BOULDER' ? clamp01((dt - (d === 'TSUNAMI' ? 90 : 0)) / 150) : 0;
  if (th.phase === 'dead' || th.phase === 'dying') { drawRemains(ctx, th, cx, base, f); if (shattered || burst || melt >= 1 || boil >= 1) return; }
  ctx.save();
  ctx.translate(cx, base + (1 - rise) * 380);
  const w = W, h = H;
  const sag = Math.max(melt, boil * 0.8);
  const bulge = d === 'BOULDER' ? 1 + clamp01(dt / 50) * 0.18 : 1;
  ctx.scale(bulge, bulge);
  // Its colors: the muck, going icy, boiling dark, or clearing as it dies (the new skin coming up over the old)
  const [toName, to, k] = (freeze > 0 ? ['ice', ICE, freeze] : clear > 0 ? ['clear', CLEAR, clear] : boil > 0 ? ['boiled', BOILED, boil] : ['muck', MUCK, 0]) as [string, Ramp, number];
  const tone = (i: number) => mix(MUCK[i], to[i], k);
  const alpha = clear > 0 ? 1 - clear * 0.45 : 1;
  const glow = th.full > 0 ? 0.25 + Math.sin(f * 0.4) * 0.1 : 0;
  // The arms (behind): made of arms, reaching up out of the pool either side; the near one's the fist
  if (!d) drawArms(ctx, th, f, w, h);
  const heave = f + (th.full ? f * 0.6 : 0);
  const outline = (ox = 0, oy = 0) => { ctx.translate(ox, oy); bodyPath(ctx, w, h, heave, sag); ctx.translate(-ox, -oy); };
  const bw = w / 2 * (1 + sag * 0.5) * 1.04, bh = h * (1 - sag) * 1.04;
  // The hide, in a clip of its outline: the deep down the right, a lit rim round the upper left, the banded skin between
  ctx.save();
  ctx.globalAlpha = alpha;
  outline(); ctx.clip();
  ctx.fillStyle = tone(6); ctx.fillRect(-bw - 10, -bh - 10, bw * 2 + 20, bh + 20);
  outline(-7, -2); ctx.clip();
  ctx.fillStyle = mix(tone(0), tone(1), 0.45); ctx.fillRect(-bw - 10, -bh - 10, bw * 2 + 20, bh + 20);
  outline(3, 4); ctx.clip();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(skin('muck', MUCK), -bw, -bh, bw * 2, bh);
  if (k > 0) { ctx.globalAlpha = alpha * k; ctx.drawImage(skin(toName, to), -bw, -bh, bw * 2, bh); ctx.globalAlpha = alpha; }
  // (bubbles working up through it: a ring, lit on its top)
  if (!shattered) for (let i = 0; i < 5; i++) {
    const t = ((f * 0.6 + i * 53) % 260) / 260, bx = (hash(i * 4.4) - 0.5) * w * 0.6 + Math.sin(f * 0.05 + i) * 4, by = -20 - t * h * 0.85 * (1 - sag), br = 3 + (i % 3) * 2;
    ctx.strokeStyle = tone(1); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(bx, by, br, 0, TAU); ctx.stroke();
    ctx.fillStyle = tone(0); ctx.fillRect(bx - br * 0.6, by - br * 0.7, 2, 2);
  }
  ctx.restore();
  // Slime running down the front of it from up top, a bead swelling at the end of each run
  if (!d || boil > 0) for (const kk of [6, 8, 12, 14]) {
    const p = bodyPoint(w, h, heave, sag, kk), t = ((f * 0.5 + kk * 37) % 140) / 140, len = Math.round(8 + t * 40);
    const sx = Math.round(p.x * 0.85), sy = Math.round(p.y + 10);
    run(ctx, sx, sy, len, [tone(0), tone(1), tone(2), tone(3), tone(4), tone(5), tone(6)], alpha * (t > 0.85 ? (1 - t) / 0.15 : 1));
  }
  // What's in it (inside its skin, a little in from the edge)
  ctx.save();
  bodyPath(ctx, w - 20, h - 20, f, sag); ctx.clip();
  for (const r of REMAINS) {
    const bob = Math.sin(f * 0.02 + r.phase) * 10;
    ctx.save(); ctx.translate(r.x + Math.sin(f * 0.013 + r.phase) * 8, r.y * (1 - sag) + bob); ctx.rotate(f * r.spin + r.phase); ctx.scale(r.s, r.s);
    drawRemain(ctx, r.look, (clear > 0 ? 0.6 + clear * 0.4 : 0.5) * alpha, boil > 0.6);
    ctx.restore();
  }
  ctx.restore();
  // The faces against its skin: eyes rolling toward him, mouths going when it talks
  const px = state.player.pos.x + state.player.width / 2;
  const look = px < cx ? -2 : 2;
  FACES.forEach((fc, i) => {
    const fs = faceSprite(fc.s, freeze > 0.5);
    ctx.save(); ctx.translate(Math.round(fc.x + Math.sin(f * 0.03 + i) * 3), Math.round(fc.y * (1 - sag)));
    ctx.globalAlpha = 0.95 * alpha;
    ctx.drawImage(fs.c, -fs.cw / 2, -fs.ch / 2);
    ctx.scale(fc.s, fc.s);
    // (the eyes: pale points deep in the sockets, a sick green glow under each)
    ctx.fillStyle = '#FEF9C3'; ctx.fillRect(-7 + look, -6, 2, 2); ctx.fillRect(5 + look, -6, 2, 2);
    ctx.fillStyle = '#A3E635'; ctx.fillRect(-7 + look, -4, 2, 1); ctx.fillRect(5 + look, -4, 2, 1);
    // (the mouth: shut, or going, the top teeth showing)
    const open = talking && (f + i * 3) % 10 < 5 ? 7 : 2;
    ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(0, 9, 5.5, open + 0.6, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#1A2E05'; ctx.beginPath(); ctx.ellipse(0, 9.5, 4.2, open - 0.6, 0, 0, TAU); ctx.fill();
    if (open > 4) { ctx.fillStyle = BONE[1]; ctx.fillRect(-3, 3, 2, 2); ctx.fillRect(0, 3, 2, 2); ctx.fillStyle = '#7F1D1D'; ctx.fillRect(-2, 13, 4, 2); }
    ctx.restore();
  });
  // Hands pressed flat against the inside
  const hand = handSprite();
  ctx.save(); ctx.globalAlpha = 0.75 * (1 - sag) * alpha;
  for (let q = 0; q < 5; q++) {
    const hx = -120 + q * 60 + Math.sin(f * 0.02 + q) * 6, hy = (-100 - hash(q * 11) * 120) * (1 - sag);
    ctx.drawImage(hand, Math.round(hx) - 10, Math.round(hy) - 15);
  }
  ctx.restore();
  // Its ink line round the lot
  ctx.save(); ctx.globalAlpha = alpha; outline(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
  // Where it comes up out of the pool: the muck churning round its foot, lit crests going by
  {
    const fw = Math.round(bw);
    ctx.fillStyle = tone(5); ctx.fillRect(-fw, -3, fw * 2, 3);
    ctx.fillStyle = tone(1);
    for (let i = 0; i < 16; i++) { const x = -fw + ((i * 47 + f * 0.6) % (fw * 2)); ctx.fillRect(Math.round(x), -5, 10, 2); }
    ctx.fillStyle = tone(0);
    for (let i = 0; i < 16; i += 2) { const x = -fw + ((i * 47 + f * 0.6) % (fw * 2)); ctx.fillRect(Math.round(x) + 2, -6, 4, 1); }
  }
  // Hit: the whole of it flashes; had its fill: it glows, shimmering
  if (th.flash > 0) { outline(); ctx.fillStyle = 'rgba(255,255,255,0.32)'; ctx.fill(); }
  if (glow > 0) {
    outline(); ctx.fillStyle = `rgba(217, 249, 157, ${glow * 0.8})`; ctx.fill();
    ctx.save(); outline(); ctx.clip(); checker(ctx, -bw, -bh, bw * 2, bh, `rgba(236, 252, 203, ${glow})`, Math.floor(f / 4) % 2, 2); ctx.restore();
  }
  // Boiling: steam off it (two-tone puffs) and bubbles bursting on its skin; frozen: frost and cracks
  if (boil > 0) {
    for (let q = 0; q < 6; q++) {
      const t = ((f * 1.5 + q * 25) % 120) / 120, sx = -120 + q * 50, sy = -h * (1 - sag) - t * 120, sr = 10 + t * 20;
      ctx.fillStyle = `rgba(168, 162, 158, ${0.35 * (1 - t * 0.5)})`; ctx.beginPath(); ctx.arc(sx, sy, sr, 0, TAU); ctx.fill();
      ctx.fillStyle = `rgba(245, 245, 244, ${0.35 * (1 - t * 0.5)})`; ctx.beginPath(); ctx.arc(sx - sr * 0.25, sy - sr * 0.3, sr * 0.55, 0, TAU); ctx.fill();
    }
    for (let q = 0; q < 7; q++) {
      const t = ((f * 2 + q * 17) % 40) / 40, bx = (hash(q * 2.3) - 0.5) * w * 0.8, by = -(0.15 + hash(q * 5.1) * 0.6) * h * (1 - sag), br = 2 + t * 7;
      if (t > 0.85) { ctx.fillStyle = tone(0); ctx.fillRect(bx - br, by - 2, 2, 2); ctx.fillRect(bx + br - 2, by - 2, 2, 2); ctx.fillRect(bx - 1, by - br, 2, 2); continue; }
      ctx.fillStyle = tone(2); ctx.beginPath(); ctx.arc(bx, by, br, Math.PI, 0); ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = tone(0); ctx.fillRect(bx - br * 0.5, by - br * 0.7, 2, 2);
    }
  }
  if (freeze > 0) {
    ctx.save(); outline(); ctx.clip();
    checker(ctx, -bw, -bh, bw * 2, bh * 0.45, `rgba(255, 255, 255, ${freeze * 0.35})`, 0, 2);
    checker(ctx, -bw, -bh, bw * 2, bh * 0.2, `rgba(255, 255, 255, ${freeze * 0.35})`, 1, 2);
    ctx.restore();
    for (let q = 0; q < 10; q++) {
      const a = hash(q) * Math.PI, x1 = Math.cos(a) * 100, y1 = -Math.sin(a) * 250, x2 = Math.cos(a) * 140, y2 = -Math.sin(a) * 300;
      const mx = (x1 + x2) / 2 + (hash(q * 3) - 0.5) * 14, my = (y1 + y2) / 2;
      for (const [c, lw, o] of [['rgba(12, 74, 110, ' + freeze * 0.8 + ')', 3, 1], ['rgba(255, 255, 255, ' + freeze * 0.9 + ')', 1.5, 0]] as [string, number, number][]) {
        ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x1 + o, y1 + o); ctx.lineTo(mx + o, my + o); ctx.lineTo(x2 + o, y2 + o); ctx.stroke();
      }
    }
  }
  ctx.restore();
};

/** The two arms, made of arms: the far one resting on the pool's lip, the near one the fist (up, over, and down). */
const drawArms = (ctx: Ctx, th: Thing, f: number, w: number, h: number) => {
  const arm = armSprite();
  const limb = (x1: number, y1: number, x2: number, y2: number, r: number) => {
    const qx = (x1 + x2) / 2 + 30, qy = Math.min(y1, y2) - 40;
    // (a tube of the muck: ink, then its steps toward the light up and to the left, a wet line along the top)
    const pass = (c: string, lw: number, o: number) => {
      ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.beginPath();
      ctx.moveTo(x1 - r * o, y1 - r * o * 1.15); ctx.quadraticCurveTo(qx - r * o, qy - r * o * 1.15, x2 - r * o, y2 - r * o * 1.15); ctx.stroke();
    };
    ctx.lineCap = 'round';
    pass(INK, r + 5, 0); pass(MUCK[5], r, 0); pass(MUCK[4], r * 0.8, 0.06); pass(MUCK[3], r * 0.56, 0.13); pass(MUCK[2], r * 0.28, 0.2); pass(MUCK[1], 2, 0.3);
    ctx.lineCap = 'butt';
    // (the arms it's made of, along it, every which way)
    for (let k = 1; k < 5; k++) {
      const t = k / 5, u = 1 - t;
      const x = u * u * x1 + 2 * u * t * qx + t * t * x2, y = u * u * y1 + 2 * u * t * qy + t * t * y2;
      const dx = 2 * u * (qx - x1) + 2 * t * (x2 - qx), dy = 2 * u * (qy - y1) + 2 * t * (y2 - qy);
      ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.rotate(Math.atan2(dy, dx) + (k % 2 ? 0.7 : -0.8) + Math.sin(f * 0.05 + k) * 0.08);
      if (k % 2) ctx.scale(1, -1);
      ctx.globalAlpha = 0.9; ctx.drawImage(arm, -20, -10); ctx.restore();
    }
  };
  // Far arm: resting, fingers drumming on the lip
  limb(w * 0.4, -h * 0.5, w * 0.62, -20, 46);
  // Near arm: the fist. Down at its side, or going up, or coming down on the walkway
  const reach = WALK_Y - GROUND_Y - 20;
  let fx = -w * 0.62, fy = -60;
  if (th.fist) {
    const t = th.fist;
    if (t < FIST_UP) { const k = t / FIST_UP; fx = -w * 0.62 - k * 120; fy = -60 - k * 480; }
    else if (t < FIST_LAND) { const k = (t - FIST_UP) / (FIST_LAND - FIST_UP); fx = -w * 0.62 - 120 - k * 200; fy = -540 + (k * k) * (540 + reach); }
    else { const k = clamp01((t - FIST_LAND) / (FIST_DONE - FIST_LAND)); fx = -w * 0.62 - 320 + k * 200; fy = reach - k * 80; }
  } else { fy = -60 + Math.sin(f * 0.04) * 10; }
  limb(-w * 0.35, -h * 0.55, fx, fy, 54);
  // The fist itself: a lump of fists
  ctx.drawImage(fistSprite(), Math.round(fx) - 55, Math.round(fy) - 55);
  // Its shadow on the walkway, growing, while it's up there (stepped: a dark middle, two rings out from it)
  if (th.fist && th.fist < FIST_LAND) {
    const k = th.fist / FIST_LAND, a = 0.15 + k * 0.4;
    for (let s = 0; s < 3; s++) {
      ctx.fillStyle = `rgba(0, 0, 0, ${(a * (s ? 0.45 : 0.6)).toFixed(3)})`;
      ctx.beginPath(); ctx.ellipse(fx, reach + 4, (60 + k * 120) * (1 - s * 0.3), (8 + k * 6) * (1 - s * 0.25), 0, 0, TAU); ctx.fill();
    }
  }
};

/** What's left of it: however it went. */
const drawRemains = (ctx: Ctx, th: Thing, cx: number, base: number, f: number) => {
  const d = th.death, dt = th.deathT;
  const walkL = COURSE.sewer.cistern.x1 + 180;
  ctx.save();
  if (d === 'SHOTGUN' && dt > 130) {
    // Shattered: chunks of ice flying, then a heap of them with frozen bits of people in it
    const k = clamp01((dt - 130) / 40);
    for (let i = 0; i < 26; i++) {
      const a = hash(i) * Math.PI, sp = 80 + hash(i * 3) * 220;
      const x = cx + Math.cos(a) * sp * k * (i % 2 ? 1 : -1), y = base - 180 + Math.sin(a) * -120 * k + k * k * 200;
      ctx.save(); ctx.translate(x, Math.min(y, base - 10)); ctx.rotate(i + k * 3); ctx.drawImage(shardSprite(i % 3 ? 0 : 1), -17, -13); ctx.restore();
      if (i % 4 === 0) { ctx.save(); ctx.translate(x, Math.min(y, base - 10)); drawRemain(ctx, REMAINS[i % REMAINS.length].look, 0.9); ctx.restore(); }
    }
  } else if (d === 'BOULDER' && dt > 50) {
    // Burst: the muck thrown right across the room (a slick of it in steps, lit along its top), and the bodies spilled out onto the walkway
    const k = clamp01((dt - 50) / 30);
    const sx = cx - 200 * k, rw = 120 + 260 * k;
    ctx.globalAlpha = 0.9 - k * 0.5;
    ctx.fillStyle = MUCK[5]; ctx.beginPath(); ctx.ellipse(sx, WALK_Y - 4, rw, 14, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = MUCK[3]; ctx.beginPath(); ctx.ellipse(sx - 6, WALK_Y - 6, rw - 10, 10, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = MUCK[1]; ctx.beginPath(); ctx.ellipse(sx - 14, WALK_Y - 10, rw * 0.8, 3, 0, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1;
    for (let i = 0; i < 9; i++) {
      const x = walkL + 30 + i * 36 + hash(i) * 12, y = WALK_Y - 6;
      const t = clamp01((dt - 50 - i * 3) / 30);
      ctx.save(); ctx.translate(cx + (x - cx) * t, base - 200 * (1 - t) - Math.sin(t * Math.PI) * 120 + (y - base) * t); ctx.rotate(t * (6 + i));
      drawCorpse(ctx, i);
      ctx.restore();
    }
  } else if (d === 'FLAMETHROWER' && dt > 150) {
    // Boiled down: charred bones in a smoking heap on the pool
    for (let i = 0; i < 10; i++) { ctx.save(); ctx.translate(cx - 120 + i * 26, base - 8 - hash(i) * 14); ctx.rotate(hash(i * 3) * 3); drawRemain(ctx, REMAINS[i].look, 1, true); ctx.restore(); }
    for (let q = 0; q < 4; q++) {
      const t = ((f * 0.7 + q * 30) % 120) / 120, sx = cx - 60 + q * 40, sy = base - 20 - t * 160, sr = 10 + t * 24;
      ctx.fillStyle = `rgba(41, 37, 36, ${0.4 * (1 - t * 0.6)})`; ctx.beginPath(); ctx.arc(sx, sy, sr, 0, TAU); ctx.fill();
      ctx.fillStyle = `rgba(120, 113, 108, ${0.3 * (1 - t * 0.6)})`; ctx.beginPath(); ctx.arc(sx - sr * 0.25, sy - sr * 0.3, sr * 0.55, 0, TAU); ctx.fill();
    }
  } else if (d && (d === 'TSUNAMI' || d !== 'SHOTGUN') && dt > 150) {
    // Thinned out or melted down: the bodies floating face down in the pool (one hand still up, then not)
    for (let i = 0; i < 6; i++) { ctx.save(); ctx.translate(cx - 130 + i * 50, base - 4); ctx.rotate(Math.PI / 2 + Math.sin(f * 0.02 + i) * 0.05); drawCorpse(ctx, i); ctx.restore(); }
    if (d !== 'TSUNAMI' && dt < 400) {
      const k = clamp01((dt - 250) / 150), up = Math.round(40 * (1 - k));
      if (up > 0) {
        ctx.save(); ctx.beginPath(); ctx.rect(cx, base - 70, 40, 70); ctx.clip();
        shaded(ctx, () => ctx.rect(cx + 20, base - up, 10, up + 4), FLESH[1], cx + 20, base - up, 10, up + 4, 1);
        for (let q = 0; q < 4; q++) ink(ctx, () => ctx.rect(cx + 20 + q * 2.5, base - up - 10, 2, 10), FLESH[1], 0.8);
        ctx.restore();
      }
    }
  }
  ctx.restore();
};

/** Its health: top right, clear of his own gauges top left (it's the size of a boss, it gets a boss's bar). */
export const drawThingBar = (ctx: Ctx, th: Thing, frame: number) => {
  if (th.phase !== 'fight' || !th.e) return;
  const k = clamp01(th.e.health / th.e.maxHealth);
  ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(420, 10, 368, 30);
  ctx.fillStyle = '#44403C'; ctx.fillRect(426, 26, 356, 9);
  ctx.fillStyle = '#65A30D'; ctx.fillRect(426, 26, 356 * k, 9);
  ctx.fillStyle = '#D9F99D'; ctx.font = 'bold 8px "Press Start 2P"'; ctx.fillText('THE EAST SIDE', 428, 22);
  drawWantPanel(ctx, th, frame);
  // The start of the fight: hold off till it's said what it wants
  if (inGrace(th)) {
    const a = Math.min(1, (GRACE_FRAMES - th.t) / 30);
    ctx.save();
    ctx.globalAlpha = a * (Math.floor(frame / 16) % 2 ? 1 : 0.55);
    ctx.textAlign = 'center'; ctx.font = 'bold 22px "Press Start 2P"';
    ctx.lineWidth = 6; ctx.strokeStyle = '#1C1917'; ctx.strokeText('HOLD YOUR FIRE', 400, 190);
    ctx.fillStyle = '#FDE047'; ctx.fillText('HOLD YOUR FIRE', 400, 190);
    ctx.restore();
  }
};

/** What it wants, big, on the screen where nothing's in the way of it: an icon, the word, how close it is to its fill, how much patience it's got left. It changes when it says so. */
const drawWantPanel = (ctx: Ctx, th: Thing, frame: number) => {
  // (right-aligned under its health bar, well clear of his own gauges top left)
  const x = 528, y = 48, w = 260, h = 70;
  const angry = th.fist > 0, full = th.full > 0;
  const want = th.shown;
  const fresh = frame - th.shownAt < 50;
  ctx.save();
  ctx.fillStyle = angry ? 'rgba(69, 10, 10, 0.9)' : full ? 'rgba(20, 46, 5, 0.9)' : 'rgba(12, 10, 9, 0.88)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = angry ? (frame % 10 < 5 ? '#EF4444' : '#7F1D1D') : fresh && frame % 8 < 4 ? '#FFFFFF' : '#A3E635';
  ctx.lineWidth = fresh || angry ? 4 : 2.5; ctx.strokeRect(x, y, w, h);
  if (angry) {
    ctx.fillStyle = '#FCA5A5'; ctx.font = 'bold 12px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText("IT'S ANGRY", x + w / 2, y + 30); ctx.font = 'bold 7px "Press Start 2P"'; ctx.fillText('BRACE YOURSELF', x + w / 2, y + 52);
  } else if (full) {
    ctx.fillStyle = '#D9F99D'; ctx.font = 'bold 12px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText('SATISFIED...', x + w / 2, y + 40);
  } else if (!want || th.shown !== th.want) {
    // (it's about to tell him)
    ctx.fillStyle = '#A3E635'; ctx.font = 'bold 12px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText('LISTEN' + '...'.slice(0, 1 + Math.floor(frame / 15) % 3), x + w / 2, y + 42);
  } else if (want) {
    drawWantIcon(ctx, want, x + 36, y + 35, frame);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#A3E635'; ctx.font = 'bold 7px "Press Start 2P"'; ctx.fillText('IT WANTS:', x + 72, y + 20);
    ctx.fillStyle = '#FFFFFF'; ctx.font = `bold ${fresh ? 16 : 14}px "Press Start 2P"`; ctx.fillText(WANT_NAME[want]! + '!', x + 72, y + 42);
    // How close it is to its fill
    ctx.fillStyle = '#44403C'; ctx.fillRect(x + 72, y + 52, 170, 6);
    ctx.fillStyle = '#A3E635'; ctx.fillRect(x + 72, y + 52, 170 * clamp01(th.fed / (NEED[want] ?? 1300)), 6);
    // Its patience: two marks, one gone per time he ignores it
    for (let k = 0; k < 2; k++) { ctx.fillStyle = k < 2 - th.strikes ? '#FACC15' : '#44403C'; ctx.fillRect(x + w - 30 + k * 12, y + 10, 8, 8); }
  }
  ctx.textAlign = 'left';
  ctx.restore();
};

/** The icon for what it wants: an ice crystal, a flame, a rock, a wave. */
const drawWantIcon = (ctx: Ctx, w: string, x: number, y: number, f: number) => {
  ctx.save(); ctx.translate(x, y);
  const pulse = 1 + Math.sin(f * 0.2) * 0.06; ctx.scale(pulse, pulse);
  if (w === 'SHOTGUN') {
    ctx.strokeStyle = '#7DD3FC'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3; ctx.beginPath(); ctx.moveTo(-Math.cos(a) * 22, -Math.sin(a) * 22); ctx.lineTo(Math.cos(a) * 22, Math.sin(a) * 22); ctx.stroke(); }
    ctx.fillStyle = '#E0F2FE'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
  } else if (w === 'FLAMETHROWER') {
    ctx.fillStyle = '#F97316'; ctx.beginPath(); ctx.moveTo(0, -26); ctx.quadraticCurveTo(22, -2, 12, 18); ctx.quadraticCurveTo(0, 26, -12, 18); ctx.quadraticCurveTo(-22, -2, 0, -26); ctx.fill();
    ctx.fillStyle = '#FDE047'; ctx.beginPath(); ctx.moveTo(0, -8); ctx.quadraticCurveTo(10, 6, 6, 14); ctx.quadraticCurveTo(0, 18, -6, 14); ctx.quadraticCurveTo(-10, 6, 0, -8); ctx.fill();
  } else if (w === 'BOULDER') {
    ctx.fillStyle = '#78716C'; ctx.beginPath(); ctx.moveTo(-20, 8); ctx.lineTo(-16, -12); ctx.lineTo(0, -20); ctx.lineTo(18, -12); ctx.lineTo(22, 6); ctx.lineTo(8, 20); ctx.lineTo(-12, 18); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#A8A29E'; ctx.beginPath(); ctx.moveTo(-10, -8); ctx.lineTo(0, -14); ctx.lineTo(8, -8); ctx.lineTo(0, -4); ctx.fill();
  } else {
    ctx.fillStyle = '#38BDF8'; ctx.beginPath(); ctx.moveTo(-24, 20); ctx.quadraticCurveTo(-20, -24, 14, -14); ctx.quadraticCurveTo(-4, -8, 4, 6); ctx.quadraticCurveTo(14, 16, 24, 20); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#E0F2FE'; ctx.beginPath(); ctx.arc(10, -14, 5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
};

/** A glob of the muck (a drip, a falling drop): inked, stepped toward the light at the upper left, a glint. */
const glob = (ctx: Ctx, x: number, y: number, rx: number, ry: number) => {
  ink(ctx, () => ctx.ellipse(x, y, rx, ry, 0, 0, TAU), SLIME[3], 1.2);
  ctx.fillStyle = SLIME[2]; ctx.beginPath(); ctx.ellipse(x - rx * 0.15, y - ry * 0.15, rx * 0.75, ry * 0.75, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = SLIME[1]; ctx.beginPath(); ctx.ellipse(x - rx * 0.3, y - ry * 0.32, rx * 0.4, ry * 0.4, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = SLIME[0]; ctx.fillRect(Math.round(x - rx * 0.5), Math.round(y - ry * 0.6), 2, 3);
};

/** The muck off the roof: the drip forming up there and its mark swelling on the walkway, the glob coming down, the puddle. */
export const drawThingDrops = (ctx: Ctx, th: Thing, frame: number) => {
  // Where they come from: the muck's up the dome over the walkway too, hanging off it, sagging, dripping (it's always
  // been up there: before he walks in, and after)
  {
    const C = COURSE.sewer.cistern, x1 = C.x1, x2 = C.pool + 20, y = DROP_FROM;
    // The ceiling over the walkway: a low slab of old brick (banded darker up into it) on an iron beam, riveted, lit
    // along its lower edge by the muck's glow
    const L = x1 - 20, W = x2 - x1 + 40, top = y - 150;
    ctx.fillStyle = sewerBrick(ctx, 'thingRoof', 34, 14, ['#342D28', '#2E2823', '#3A322C'], '#1F1A17'); ctx.fillRect(L, top, W, 104);
    hazeBands(ctx, L, top, W, 60, '#0C0A09', 0.7, 0, 4);
    ctx.fillStyle = INK; ctx.fillRect(L, y - 49, W, 12);
    ctx.fillStyle = '#44403C'; ctx.fillRect(L, y - 48, W, 10);
    ctx.fillStyle = '#5C5650'; ctx.fillRect(L, y - 48, W, 2);
    ctx.fillStyle = '#2E2A27'; ctx.fillRect(L, y - 40, W, 2);
    for (let xx = x1 + 20; xx < x2; xx += 110) { ctx.fillStyle = '#1C1917'; ctx.fillRect(xx, y - 48, 12, 10); ctx.fillStyle = '#78716C'; ctx.fillRect(xx - 5, y - 45, 2, 2); ctx.fillRect(xx + 15, y - 45, 2, 2); }
    // (the muck's glow on the underside of the beam, in steps)
    ctx.fillStyle = 'rgba(132, 204, 22, 0.22)'; ctx.fillRect(L, y - 40, W, 2);
    // The muck clinging under it: a sagging sheet, banded dark to light down toward its edge (lit from the pool below),
    // its edge ragged and slowly heaving, a lip of fresh slime along it
    const edgeAt = (x: number) => Math.round(y - 8 + Math.sin(x * 0.045 + frame * 0.025) * 3 + Math.sin(x * 0.13 + 1.7) * 2 + (hash(Math.floor(x / 8)) - 0.5) * 3);
    const bands: [number, string][] = [[0, '#22350B'], [0.3, SLIME[4]], [0.55, '#41660F'], [0.75, SLIME[3]], [0.9, SLIME[2]]];
    for (const [k, col] of bands) {
      ctx.fillStyle = col;
      for (let x = x1; x < x2; x += 4) { const e = edgeAt(x), t = Math.round(y - 38 + (e - (y - 38)) * k); ctx.fillRect(x, t, 4, e - t); }
    }
    // (a dithered seam where it meets the brick, and the lit lip along its edge)
    checker(ctx, x1, y - 40, x2 - x1, 4, SLIME[4], 0);
    for (let x = x1; x < x2; x += 4) { const e = edgeAt(x); ctx.fillStyle = SLIME[1]; ctx.fillRect(x, e - 3, 4, 2); ctx.fillStyle = INK; ctx.fillRect(x, e, 4, 1); if (hash(x * 0.37) > 0.8) { ctx.fillStyle = SLIME[0]; ctx.fillRect(x + 1, e - 3, 2, 1); } }
    // Lumps in it (whatever it's taken up there with it): rounded, lit on top, a glint; one with a skull showing through
    for (let i = 0; i < 7; i++) {
      const bx = Math.round(x1 + 30 + hash(i * 4.1) * (x2 - x1 - 60)), by = Math.round(y - 28 + hash(i * 2.3) * 10), r = 3 + Math.round(hash(i * 8.7) * 3);
      ink(ctx, () => ctx.ellipse(bx, by, r + 2, r, 0, 0, TAU), SLIME[4], 1);
      ctx.fillStyle = SLIME[3]; ctx.fillRect(bx - r, by - r + 1, r * 2, 2);
      ctx.fillStyle = SLIME[1]; ctx.fillRect(bx - r + 1, by - r + 1, 2, 1);
      if (i === 3) { ctx.fillStyle = BONE[1]; ctx.fillRect(bx - 3, by - 2, 6, 5); ctx.fillStyle = BONE[0]; ctx.fillRect(bx - 3, by - 2, 6, 1); ctx.fillStyle = INK; ctx.fillRect(bx - 2, by, 1, 1); ctx.fillRect(bx + 1, by, 1, 1); }
    }
    // Bubbles swelling in it and popping
    for (let i = 0; i < 5; i++) {
      const cyc = 70 + i * 13, q = ((frame + i * 29) % cyc) / cyc, bx = Math.round(x1 + 50 + hash(i * 6.7 + Math.floor((frame + i * 29) / cyc)) * (x2 - x1 - 100)), by = y - 26;
      if (q < 0.8) { const r = Math.round(1 + q * 4); ink(ctx, () => ctx.arc(bx, by, r, 0, TAU), SLIME[2], 1); ctx.fillStyle = SLIME[0]; ctx.fillRect(bx - Math.max(1, r - 2), by - r + 1, 1, 1); }
      else { ctx.fillStyle = SLIME[0]; for (const [dx, dy] of [[-4, -2], [4, -3], [0, -5]]) ctx.fillRect(bx + dx, by + dy, 1, 1); }
    }
    // Tendrils hanging off the edge, stretching and slowly drawing back up: inked, banded, a lit stripe, a bead on the end
    for (let x = x1 + 14; x < x2 - 10; x += 29) {
      const sway = Math.sin(frame * 0.02 + x * 0.3);
      const len = Math.round(10 + ((x * 13) % 19) + sway * 5), w = 3 + ((x * 7) % 3), e = edgeAt(x);
      for (let j = 0; j < len; j += 2) { const ww = Math.max(1, Math.round(w * (1 - j / (len + 6)))); ctx.fillStyle = INK; ctx.fillRect(x - ww - 1, e + j, ww * 2 + 2, 2); ctx.fillStyle = j < len * 0.5 ? SLIME[3] : SLIME[2]; ctx.fillRect(x - ww, e + j, ww * 2, 2); ctx.fillStyle = SLIME[1]; ctx.fillRect(x - ww, e + j, 1, 2); }
      glob(ctx, x, e + len + 2, 3 + (x % 2), 4 + (x % 3));
    }
  }
  for (const d of th.drops) {
    if (d.state === 'warn') {
      if (d.t < 0) continue;
      const k = Math.min(1, d.t / DROP_WARN);
      // Up on the roof: a bulge of it, swelling, about to let go
      ink(ctx, () => ctx.ellipse(d.x, DROP_FROM, 16, 6, 0, 0, TAU), SLIME[4], 1);
      const gy = DROP_FROM + 4 + k * 8, grx = 5 + k * 6, gry = 5 + k * 9;
      glob(ctx, d.x, gy, grx, gry);
      // Down on the walkway: where it'll land, growing, blinking faster at the end
      const on = k < 0.6 || Math.floor(frame / 3) % 2 === 0;
      ctx.fillStyle = `rgba(101, 163, 13, ${on ? 0.25 + k * 0.35 : 0.15})`;
      ctx.beginPath(); ctx.ellipse(d.x, GROUND_Y - 1, 8 + k * (PUDDLE_R - 8), 4 + k * 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(217, 249, 157, ${on ? 0.4 + k * 0.5 : 0.2})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(d.x, GROUND_Y - 1, PUDDLE_R, 7, 0, 0, Math.PI * 2); ctx.stroke();
    } else if (d.state === 'fall') {
      // (its streak behind it, in two steps, then the glob: inked, lit to the upper left, a bit of someone in it)
      ctx.fillStyle = 'rgba(101, 163, 13, 0.2)'; ctx.fillRect(d.x - 3, d.y - 36, 6, 36);
      ctx.fillStyle = 'rgba(132, 204, 22, 0.4)'; ctx.fillRect(d.x - 2, d.y - 22, 4, 22);
      glob(ctx, d.x, d.y, 10, 14);
      ink(ctx, () => ctx.rect(d.x - 2, d.y - 1, 6, 4), BONE[1], 1); ctx.fillStyle = BONE[0]; ctx.fillRect(d.x - 2, d.y - 1, 6, 1);
    } else {
      // The puddle: bubbling, eating at the walkway, drying up at the end
      const fade = Math.min(1, (PUDDLE_FRAMES - d.t) / 30);
      ctx.globalAlpha = fade;
      // (in steps: its dark edge, the body of it, a lit pool toward the upper left, a glint)
      ctx.fillStyle = SLIME[4]; ctx.beginPath(); ctx.ellipse(d.x, GROUND_Y - 1, PUDDLE_R + 1, 7.5, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = SLIME[3]; ctx.beginPath(); ctx.ellipse(d.x - 1, GROUND_Y - 1.5, PUDDLE_R - 2, 6, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = SLIME[2]; ctx.beginPath(); ctx.ellipse(d.x - 4, GROUND_Y - 2, PUDDLE_R - 8, 4, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = SLIME[1]; ctx.beginPath(); ctx.ellipse(d.x - 8, GROUND_Y - 3, PUDDLE_R - 16, 2, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = SLIME[0]; ctx.fillRect(d.x - 14, GROUND_Y - 4, 4, 1);
      for (let i = 0; i < 3; i++) {
        const bt = ((((frame + i * 13 + d.x) % 30) + 30) % 30) / 30;
        ctx.strokeStyle = `rgba(217, 249, 157, ${0.8 * (1 - bt)})`; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(d.x - 18 + i * 18, GROUND_Y - 3, 2 + bt * 4, Math.PI, 0); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(163, 230, 53, 0.25)'; for (let i = 0; i < 2; i++) { const q = ((frame * 0.7 + i * 20) % 40) / 40; ctx.beginPath(); ctx.arc(d.x + (i ? 10 : -10), GROUND_Y - 8 - q * 30, 4 + q * 6, 0, Math.PI * 2); ctx.fill(); }
      ctx.globalAlpha = 1;
    }
  }
};
