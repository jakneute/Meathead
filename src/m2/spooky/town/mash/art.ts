// MONSTER MASH's fighters, drawn: one skeleton for all of them (limbs off src/m2/art/limb.ts, so every elbow and knee
// bends the right way), dressed per fighter (a head, a costume, a cape, a hump, bandages), every pose painted ONCE
// into its own little canvas the first time it's wanted (pose(...)), its edges hardened to pixels; the game only ever
// draws those (flipped for facing left: a mirror, never a turn). The select screen's portraits (cheap gross-ups, the
// SNES way: ramps, banded, dithered) are baked the same way.
//
// THE INVISIBLE MAN has no frames. None. That's the joke: pose() hands back an empty canvas for him.
//
// Local space: facing right, the feet's middle at (0, 0), up is -y. One unit is one of the cabinet's screen pixels.

import { elbow, knee, type P2 } from '../../../art/limb';
import type { CharId, PoseId } from './data';

type Ctx = CanvasRenderingContext2D;
export const INK = '#0B0710';
export type SkinId = Exclude<CharId, 'invis'> | 'hyde';
export type ArtId = SkinId | 'invis';

const mk = (w: number, h: number) => {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d')!; g.imageSmoothingEnabled = false;
  return [cv, g] as const;
};
export const px = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
/** An ellipse, inked round, banded (dark at the back and foot, the middle, lit up front and on top). */
const blob = (c: Ctx, x: number, y: number, rx: number, ry: number, r: string[], ink = true) => {
  const e = (ex: number, ey: number, a: number, b: number, col: string) => { c.fillStyle = col; c.beginPath(); c.ellipse(ex, ey, Math.max(0.5, a), Math.max(0.5, b), 0, 0, Math.PI * 2); c.fill(); };
  if (ink) e(x, y, rx + 1, ry + 1, INK);
  e(x, y, rx, ry, r[0]);
  e(x + rx * 0.15, y - ry * 0.12, rx * 0.8, ry * 0.78, r[1]);
  e(x + rx * 0.35, y - ry * 0.35, rx * 0.38, ry * 0.32, r[2]);
};
/** Hard pixels: every edge pixel either there or not (the antialiased strokes painted crisp, once). */
const harden = (cv: HTMLCanvasElement) => {
  const g = cv.getContext('2d')!, d = g.getImageData(0, 0, cv.width, cv.height), a = d.data;
  for (let i = 3; i < a.length; i += 4) a[i] = a[i] > 110 ? 255 : 0;
  g.putImageData(d, 0, 0);
};
const add = (a: P2, b: P2, k = 1): P2 => [a[0] + b[0] * k, a[1] + b[1] * k];

// ---------------------------------------------------------------------------------------------------------------
// Skins

interface Skin {
  s: number;
  /** Arm length scale (Quasimodo's knuckle-draggers), leg length scale. */
  armK?: number; legK?: number;
  arm: number; leg: number;
  /** Torso half-widths: hips, shoulders. */
  hips: number; shoulders: number;
  skin: string[]; top: string[]; sleeve?: string[]; hand?: string[]; legs: string[]; shoe: string; shoeBig?: boolean;
  head: (c: Ctx) => void;
  cape?: { out: string[]; lining: string[] };
  collar?: boolean; tails?: boolean; hump?: boolean; wrap?: boolean;
  chest?: (c: Ctx, hip: P2, neck: P2, n: P2) => void;
  /** Bare forearms (Hyde's burst sleeves, the monster's short ones). */
  bareFore?: boolean;
  /** How far the head's middle sits off the neck. */
  headUp: number;
}

const PALE = ['#6E8078', '#A9BAB0', '#DCE8E0'];
const GREEN = ['#33502A', '#5E8044', '#94B86A'];
const BAND = ['#6E5E40', '#AE9A70', '#E2D4AA'];
const FLESH = ['#9A6248', '#D49A78', '#F2C6A4'];
const RUDDY = ['#5E3A2C', '#8E5C44', '#C08466'];
const QFLESH = ['#7E5038', '#B87A58', '#DEA47E'];
const GAUNT = ['#5E4A44', '#8E7468', '#BCA092'];
const BLACK = ['#0C0C14', '#1E1E2A', '#34344A'];
const RED = ['#4E0810', '#86101A', '#B81C26'];

const shirtFront = (white: string, accent: string) => (c: Ctx, hip: P2, neck: P2, n: P2) => {
  // (a shirt front down the middle, the tie or the medallion at the throat)
  const a = add(neck, n, 1.2), b = add(hip, n, 2.2);
  c.strokeStyle = white; c.lineWidth = 3; c.beginPath(); c.moveTo(a[0], a[1] + 1); c.lineTo(b[0], b[1] - 4); c.stroke();
  px(c, a[0] - 1, a[1] + 1, 3, 2, accent);
};

const SKINS: Record<SkinId, Skin> = {
  drac: {
    s: 1.04, arm: 4, leg: 5, hips: 5, shoulders: 6, headUp: 7, skin: PALE, top: BLACK, legs: BLACK, shoe: '#050508',
    cape: { out: ['#07070C', '#15151F', '#262636'], lining: RED }, collar: true,
    chest: shirtFront('#E8E4DC', '#C81E1E'),
    head: c => {
      blob(c, 0, 0, 5, 6, PALE);
      // (the hair: slicked back, black, the widow's peak; the shine on it)
      px(c, -6, -7, 10, 3, '#0A0A0E'); px(c, -6, -5, 4, 7, '#0A0A0E'); px(c, 1, -4, 2, 2, '#0A0A0E'); px(c, -4, -7, 5, 1, '#3A3A5A');
      // (the ear, pointed)
      px(c, -2, -2, 2, 4, PALE[0]); px(c, -2, -3, 1, 1, PALE[0]);
      // (the brow, the red eye, the hook nose, the fangs)
      px(c, 1, -3, 4, 1, '#0A0A0E'); px(c, 2, -1, 3, 1, '#FFFFFF'); px(c, 3, -1, 1, 1, '#E01010');
      px(c, 5, 0, 1, 2, PALE[0]); px(c, 6, 1, 1, 1, PALE[0]);
      px(c, 2, 3, 4, 1, '#4A0610'); px(c, 3, 4, 1, 2, '#FFFFFF'); px(c, 5, 4, 1, 1, '#FFFFFF');
      px(c, -1, 2, 3, 2, PALE[0]);
    },
  },
  monster: {
    s: 1.18, arm: 6, leg: 6, hips: 8, shoulders: 10, headUp: 8, skin: GREEN, top: ['#16140F', '#2E2A22', '#48423A'], legs: ['#1A1A1E', '#303036', '#4A4A52'], shoe: '#060606', shoeBig: true, bareFore: true,
    chest: (c, hip, neck, n) => { const a = add(neck, n, -2); px(c, a[0], a[1] + 4, 6, 1, '#5A5040'); px(c, a[0] + 1, a[1] + 8, 6, 1, '#5A5040'); void hip; },
    head: c => {
      // (the flat-top block)
      px(c, -6, -8, 13, 15, INK); px(c, -5, -7, 11, 13, GREEN[0]); px(c, -4, -7, 10, 11, GREEN[1]); px(c, 0, -6, 5, 4, GREEN[2]);
      px(c, -6, -9, 13, 4, '#121212'); for (let i = -5; i < 7; i += 2) px(c, i, -5, 1, 1, '#121212');
      // (the stitches over the brow, the shelf of a brow, the dead eye, the slot of a mouth)
      px(c, -3, -3, 6, 1, '#2A140C'); for (let i = -3; i < 3; i += 2) px(c, i, -4, 1, 3, '#2A140C');
      px(c, 0, -1, 7, 1, GREEN[0]); px(c, 2, 0, 3, 2, '#E6E0A0'); px(c, 3, 0, 1, 1, '#141414');
      px(c, 6, 1, 1, 2, GREEN[0]); px(c, 1, 4, 6, 1, INK); px(c, 2, 5, 1, 1, '#E6E0A0');
      // (the bolts)
      px(c, -8, 4, 3, 2, '#9A9AA4'); px(c, -8, 4, 1, 2, '#D4D4DC'); px(c, 6, 4, 3, 2, '#9A9AA4'); px(c, 8, 4, 1, 2, '#D4D4DC');
    },
  },
  mummy: {
    s: 1.0, arm: 4, leg: 5, hips: 5, shoulders: 6, headUp: 7, skin: BAND, top: BAND, legs: BAND, hand: BAND, shoe: BAND[0], wrap: true,
    chest: (c, hip, neck, n) => {
      // (the wraps round the middle, a loose end)
      for (let k = 0.15; k < 1; k += 0.18) { const a = add(add(hip, [neck[0] - hip[0], neck[1] - hip[1]], k), n, -6), b = add(a, n, 12); c.strokeStyle = BAND[0]; c.lineWidth = 1; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1] + 2); c.stroke(); }
    },
    head: c => {
      blob(c, 0, 0, 5, 6, BAND);
      for (let y = -5; y < 6; y += 3) px(c, -5, y, 10, 1, BAND[0]);
      px(c, 1, -1, 4, 2, '#1A1206'); px(c, 2, -1, 2, 1, '#FDE047');
      px(c, 2, 3, 3, 1, '#1A1206'); px(c, -6, 2, 2, 1, BAND[1]); px(c, -8, 3, 2, 1, BAND[1]);
    },
  },
  jekyll: {
    s: 1.0, arm: 4, leg: 4, hips: 5, shoulders: 6, headUp: 7, skin: FLESH, top: ['#24180E', '#463020', '#6A4A30'], legs: ['#2A2A32', '#46464E', '#66666E'], shoe: '#120C08', tails: true,
    chest: shirtFront('#ECE6D8', '#7A1E3A'),
    head: c => {
      blob(c, 0, 0, 5, 6, FLESH);
      // (the top hat; the parted hair, the chops; the monocle; the mustache)
      px(c, -4, -13, 8, 7, '#141414'); px(c, -4, -9, 8, 1, '#6A1E2A'); px(c, -6, -7, 12, 2, '#141414'); px(c, -3, -13, 2, 6, '#2E2E36');
      px(c, -5, -5, 3, 6, '#5A3A1E'); px(c, -1, 2, 2, 3, '#5A3A1E');
      px(c, 2, -1, 2, 1, '#FFFFFF'); px(c, 3, -1, 1, 1, '#2A4A8A'); c.strokeStyle = '#D4AF37'; c.lineWidth = 1; c.strokeRect(1.5, -2.5, 4, 3);
      px(c, 5, 0, 1, 2, FLESH[0]); px(c, 2, 2, 5, 1, '#5A3A1E'); px(c, 3, 4, 2, 1, '#8A3A30');
    },
  },
  hyde: {
    s: 1.12, arm: 6, leg: 5, hips: 7, shoulders: 10, headUp: 7, skin: RUDDY, top: ['#20140C', '#3E2A1A', '#5E422A'], legs: ['#26262C', '#3E3E46', '#5A5A62'], shoe: '#100A06', bareFore: true, tails: true,
    chest: (c, hip, neck, n) => { const a = add(neck, n, 0); for (let i = 0; i < 4; i++) px(c, a[0] - 2 + (i % 2) * 3, a[1] + 2 + i * 2, 1, 1, '#2A1408'); void hip; },
    head: c => {
      blob(c, 1, 0, 6, 7, RUDDY);
      // (the wild hair, the crushed hat on it, the one brow, the beady eye, the snaggle teeth, the stubble)
      px(c, -7, -8, 12, 4, '#0E0806'); px(c, -8, -5, 4, 8, '#0E0806'); px(c, 4, -8, 2, 2, '#0E0806');
      px(c, -5, -12, 8, 4, '#141414'); px(c, -7, -9, 10, 1, '#141414');
      px(c, 1, -2, 7, 2, '#0E0806'); px(c, 3, 0, 2, 1, '#FFE0A0'); px(c, 4, 0, 1, 1, '#B01010');
      px(c, 7, 1, 2, 2, RUDDY[0]); px(c, 2, 4, 6, 2, '#2A0A06'); px(c, 3, 4, 1, 2, '#E8E0C0'); px(c, 6, 3, 1, 2, '#E8E0C0');
      for (let i = 0; i < 6; i++) px(c, -1 + (i * 3) % 8, 4 + (i % 3), 1, 1, '#3A2418');
    },
  },
  phantom: {
    s: 1.05, arm: 4, leg: 4, hips: 5, shoulders: 6, headUp: 7, skin: GAUNT, top: BLACK, legs: BLACK, hand: ['#9A9A9A', '#DADADA', '#FFFFFF'], shoe: '#050508', tails: true,
    cape: { out: ['#07070C', '#15151F', '#262636'], lining: ['#3A0608', '#6E0C12', '#9A1620'] },
    chest: shirtFront('#F0EEE6', '#F0EEE6'),
    head: c => {
      blob(c, 0, 0, 5, 6, GAUNT);
      // (the fedora; the white half-mask over the front of the face, its eye hole; the bare back half sunken, the thin lips)
      px(c, -7, -7, 14, 2, '#0A0A0E'); px(c, -4, -11, 8, 5, '#0A0A0E'); px(c, -4, -8, 8, 1, '#3A0608');
      px(c, 0, -5, 6, 7, '#F1F0EA'); px(c, 0, -5, 6, 1, '#FFFFFF'); px(c, 0, 1, 6, 1, '#B8B6AC');
      px(c, 2, -2, 3, 2, '#0A0A0E'); px(c, 3, -2, 1, 1, '#E8E030');
      px(c, -3, 0, 2, 3, GAUNT[0]); px(c, 1, 3, 4, 1, '#4A1A1A');
    },
  },
  quasi: {
    s: 0.88, armK: 1.25, legK: 0.85, arm: 5, leg: 5, hips: 6, shoulders: 7, headUp: 6, skin: QFLESH, top: ['#2E200E', '#52381A', '#76562C'], legs: ['#28321C', '#44522C', '#62723E'], shoe: '#1A1008', hump: true,
    chest: (c, hip, neck, n) => { const b = add(hip, n, -6), e = add(hip, n, 6); c.strokeStyle = '#B89A5A'; c.lineWidth = 2; c.beginPath(); c.moveTo(b[0], b[1] - 3); c.lineTo(e[0], e[1] - 3); c.stroke(); void neck; },
    head: c => {
      blob(c, 1, 1, 6, 6, QFLESH);
      // (the shag of red hair; the wart over one eye, the little eye; the big jutting underbite, a tooth up over the lip)
      px(c, -6, -6, 10, 4, '#9A3A12'); px(c, -7, -3, 4, 6, '#9A3A12'); px(c, -3, -7, 6, 2, '#C85820'); px(c, 3, -6, 2, 2, '#9A3A12');
      blob(c, 3, -1, 2.5, 2.5, ['#8A5A3A', '#B88060', '#D8A882']); px(c, 6, 0, 2, 1, '#FFFFFF'); px(c, 7, 0, 1, 1, '#1A1A1A');
      px(c, 2, 4, 6, 3, '#3A1408'); px(c, 2, 4, 6, 1, '#E8DCB0'); px(c, 4, 2, 1, 2, '#E8DCB0'); px(c, 7, 3, 1, 1, '#E8DCB0');
    },
  },
};

// ---------------------------------------------------------------------------------------------------------------
// Poses (base units: a 64-tall figure; scaled by each skin)

interface J { hip: P2; neck: P2; fh: P2; bh: P2; ff: P2; bf: P2; prop?: string }
const STAND = { hip: [0, -29] as P2, neck: [2, -49] as P2, ff: [7, 0] as P2, bf: [-7, 0] as P2 };
const CROUCH = { hip: [-1, -17] as P2, neck: [5, -35] as P2, ff: [9, 0] as P2, bf: [-8, 0] as P2 };
const AIR = { hip: [0, -34] as P2, neck: [2, -53] as P2, ff: [6, -20] as P2, bf: [-6, -24] as P2 };

const BASE: Record<PoseId, J> = {
  idle0: { ...STAND, fh: [10, -38], bh: [-2, -36] },
  idle1: { ...STAND, hip: [0, -28], neck: [2, -48], fh: [10, -37], bh: [-2, -35] },
  walk0: { ...STAND, neck: [3, -49], fh: [10, -38], bh: [-1, -36], ff: [10, 0], bf: [-8, 0] },
  walk1: { ...STAND, hip: [0, -30], neck: [3, -50], fh: [9, -39], bh: [-2, -37], ff: [3, -3], bf: [-2, 0] },
  crouch: { ...CROUCH, fh: [12, -27], bh: [2, -25] },
  jump: { ...AIR, fh: [9, -44], bh: [-5, -42] },
  block: { ...STAND, hip: [-1, -29], neck: [0, -49], fh: [6, -47], bh: [4, -44], ff: [6, 0], bf: [-9, 0] },
  cblock: { ...CROUCH, neck: [3, -35], fh: [8, -35], bh: [6, -32] },
  hit: { ...STAND, hip: [-2, -29], neck: [-7, -47], fh: [-2, -34], bh: [-13, -38], ff: [6, 0], bf: [-9, 0] },
  chit: { ...CROUCH, neck: [-2, -33], fh: [2, -22], bh: [-8, -24] },
  air: { hip: [0, -26], neck: [-15, -34], fh: [-6, -44], bh: [-20, -28], ff: [12, -18], bf: [8, -12] },
  down: { hip: [2, -5], neck: [-17, -6], fh: [-8, -2], bh: [-22, -2], ff: [20, -1], bf: [17, -4] },
  sp: { ...STAND, hip: [1, -29], neck: [5, -49], fh: [23, -41], bh: [-1, -37], ff: [9, 0], bf: [-8, 0] },
  sk: { ...STAND, hip: [-1, -30], neck: [-5, -49], fh: [4, -40], bh: [-7, -38], ff: [25, -27], bf: [-3, 0] },
  cp: { ...CROUCH, neck: [7, -35], fh: [23, -27], bh: [2, -24] },
  ck: { hip: [-2, -15], neck: [1, -32], fh: [8, -24], bh: [-5, -21], ff: [27, -1], bf: [-6, 0] },
  jp: { ...AIR, fh: [19, -35], bh: [-4, -42] },
  jk: { ...AIR, fh: [6, -46], bh: [-6, -44], ff: [21, -13], bf: [-4, -26] },
  wind: { ...STAND, hip: [-1, -29], neck: [-2, -49], fh: [-5, -51], bh: [-9, -40], ff: [8, 0], bf: [-8, 0] },
  sn: { ...STAND, fh: [20, -44], bh: [14, -42] },
  sd: { ...CROUCH, fh: [18, -2], bh: [10, -2] },
  su: { ...STAND, hip: [0, -32], neck: [4, -52], fh: [10, -72], bh: [-6, -38], ff: [6, -4], bf: [-6, 0] },
  win: { ...STAND, fh: [7, -68], bh: [-6, -66] },
};

/** Each fighter's specials (and a stance or two of his own). */
const OWN: Partial<Record<SkinId, Partial<Record<PoseId, J>>>> = {
  drac: {
    sn: { ...STAND, fh: [17, -47], bh: [12, -52], prop: 'capeSpread' },
    sd: { ...STAND, hip: [2, -29], neck: [11, -45], fh: [17, -40], bh: [13, -36] },
    su: { ...AIR, hip: [0, -30], neck: [3, -50], fh: [17, -27], bh: [-11, -52], ff: [4, -14], bf: [-8, -18], prop: 'capeUp' },
    win: { ...STAND, fh: [14, -50], bh: [-12, -50], prop: 'capeSpread' },
  },
  monster: {
    sn: { ...STAND, neck: [11, -45], fh: [23, -44], bh: [19, -41], ff: [11, 0], bf: [-10, 0] },
    sd: { hip: [-1, -21], neck: [8, -37], fh: [17, -1], bh: [11, -1], ff: [9, 0], bf: [-9, 0] },
    su: { ...STAND, neck: [1, -49], fh: [7, -71], bh: [-2, -69] },
    idle0: { ...STAND, fh: [14, -40], bh: [10, -40] }, idle1: { ...STAND, hip: [0, -28], neck: [2, -48], fh: [14, -39], bh: [10, -39] },
  },
  mummy: {
    sn: { ...STAND, fh: [27, -40], bh: [-4, -36], prop: 'whip' },
    sd: { ...STAND, fh: [9, -67], bh: [-4, -65] },
    su: { hip: [0, -22], neck: [7, -40], fh: [21, -6], bh: [5, -20], ff: [9, 0], bf: [-9, 0] },
    idle0: { ...STAND, fh: [16, -42], bh: [12, -42] }, idle1: { ...STAND, hip: [0, -28], neck: [2, -48], fh: [16, -41], bh: [12, -41] },
    walk0: { ...STAND, fh: [16, -42], bh: [12, -42], ff: [10, 0], bf: [-8, 0] }, walk1: { ...STAND, fh: [16, -41], bh: [12, -41], ff: [3, -3], bf: [-2, 0] },
  },
  jekyll: {
    sn: { ...STAND, fh: [12, -62], bh: [-6, -36], prop: 'potion' },
    sd: { ...STAND, fh: [7, -55], bh: [-4, -36], prop: 'flask' },
  },
  hyde: {
    sn: { ...STAND, fh: [12, -62], bh: [-6, -36], prop: 'potion' },
    sd: { ...STAND, fh: [7, -55], bh: [-4, -36], prop: 'flask' },
    idle0: { ...STAND, hip: [0, -27], neck: [6, -45], fh: [14, -34], bh: [4, -32] }, idle1: { ...STAND, hip: [0, -26], neck: [6, -44], fh: [14, -33], bh: [4, -31] },
  },
  phantom: {
    sn: { ...STAND, fh: [19, -36], bh: [15, -34], prop: 'notes' },
    sd: { ...STAND, fh: [9, -68], bh: [-6, -36] },
    su: { ...STAND, neck: [6, -48], fh: [25, -48], bh: [-9, -40], prop: 'capeSwirl' },
  },
  quasi: {
    idle0: { ...STAND, hip: [0, -27], neck: [8, -42], fh: [12, -24], bh: [2, -22] }, idle1: { ...STAND, hip: [0, -26], neck: [8, -41], fh: [12, -23], bh: [2, -21] },
    walk0: { ...STAND, hip: [0, -27], neck: [8, -42], fh: [13, -24], bh: [3, -22], ff: [10, 0], bf: [-8, 0] }, walk1: { ...STAND, hip: [0, -28], neck: [8, -43], fh: [12, -25], bh: [2, -23], ff: [3, -3], bf: [-2, 0] },
    sn: { ...STAND, hip: [0, -28], neck: [8, -44], fh: [19, -50], bh: [15, -46], prop: 'bell' },
    sd: { ...CROUCH, fh: [23, -8], bh: [8, -12], prop: 'gargoyle' },
    su: { hip: [0, -34], neck: [3, -54], fh: [6, -76], bh: [2, -72], ff: [15, -18], bf: [9, -22], prop: 'rope' },
    win: { ...STAND, hip: [0, -27], neck: [7, -44], fh: [8, -68], bh: [-4, -66], prop: 'bellUp' },
  },
};

// ---------------------------------------------------------------------------------------------------------------
// The figure

/** A limb: root, joint, end; thick, inked, banded (dark under, the middle, a lit line along it). */
const limb = (c: Ctx, a: P2, m: P2, b: P2, w: number, r: string[], wrap = false) => {
  const path = () => { c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(m[0], m[1]); c.lineTo(b[0], b[1]); };
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.strokeStyle = INK; c.lineWidth = w + 2; path(); c.stroke();
  c.strokeStyle = r[0]; c.lineWidth = w; path(); c.stroke();
  c.save(); c.translate(-0.6, -0.6); c.strokeStyle = r[1]; c.lineWidth = Math.max(1, w - 2); path(); c.stroke(); c.restore();
  if (w >= 4) { c.save(); c.translate(-1, -1); c.strokeStyle = r[2]; c.lineWidth = 1; path(); c.stroke(); c.restore(); }
  if (wrap) { c.setLineDash([1, 2]); c.strokeStyle = r[0]; c.lineWidth = w - 1; path(); c.stroke(); c.setLineDash([]); }
};

interface Meta { head: P2; neck: P2; hip: P2; fh: P2; bh: P2; ff: P2 }
export interface Sprite { cv: HTMLCanvasElement; ox: number; oy: number; meta: Meta }
const CW = 200, CH = 112, OX = 70, OY = 104;

const headCache = new Map<SkinId, HTMLCanvasElement>();
const headOf = (id: SkinId) => {
  let h = headCache.get(id);
  if (!h) { const [cv, g] = mk(32, 32); g.translate(16, 16); SKINS[id].head(g); headCache.set(id, cv); h = cv; }
  return h;
};

const drawFigure = (c: Ctx, id: SkinId, pose: PoseId): Meta => {
  const sk = SKINS[id], j0 = OWN[id]?.[pose] ?? BASE[pose], s = sk.s;
  const S = (p: P2): P2 => [p[0] * s, p[1] * s];
  const hip = S(j0.hip), neck = S(j0.neck);
  const ua = 11 * s * (sk.armK ?? 1), fa = 11 * s * (sk.armK ?? 1), th = 15 * s * (sk.legK ?? 1), sh = 15 * s * (sk.legK ?? 1);
  // (the legs root a little off the hips' middle; the feet as posed, lifted for a short-legged one)
  const lift = (sk.legK ?? 1) < 1 && hip[1] < -10 ? (1 - (sk.legK ?? 1)) * 30 * s : 0;
  const hipL: P2 = [hip[0], hip[1] + lift], neckL: P2 = [neck[0], neck[1] + lift];
  const ff = S(j0.ff), bf = S(j0.bf);
  const tdx = neckL[0] - hipL[0], tdy = neckL[1] - hipL[1], tl = Math.hypot(tdx, tdy) || 1, t: P2 = [tdx / tl, tdy / tl], n: P2 = [-t[1], t[0]];
  // (the shoulders: Quasimodo's hunched forward and down)
  const sho = add(neckL, t, -1.5);
  const fh = add(S(j0.fh), [0, lift]), bh = add(S(j0.bh), [0, lift]);
  const fs = add(sho, n, 1.5), bs = add(sho, n, -1.5);
  const fe = elbow(fs[0], fs[1], fh[0], fh[1], ua, fa, 1), be = elbow(bs[0], bs[1], bh[0], bh[1], ua, fa, 1);
  const fk = knee(hipL[0] + 1, hipL[1], ff[0], ff[1], th, sh, 1), bk = knee(hipL[0] - 1, hipL[1], bf[0], bf[1], th, sh, 1);
  const headC = add(neckL, t, sk.headUp * (s > 1 ? 1.05 : 1));
  const sleeve = sk.sleeve ?? sk.top, hand = sk.hand ?? sk.skin;
  const dark = (r: string[]) => [INK, r[0], r[1]];

  // THE CAPE (behind it all)
  if (sk.cape) {
    const hem = add(hipL, t, -22 * s);
    if (j0.prop === 'capeSpread') {
      // (spread like wings: the lining showing, red)
      const a = add(sho, n, -3), b = add(sho, n, 3);
      c.fillStyle = INK; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(a[0] - 26 * s, a[1] - 12 * s); c.lineTo(a[0] - 30 * s, a[1] + 26 * s); c.lineTo(hem[0] - 6, hem[1]); c.lineTo(hem[0] + 8, hem[1]); c.lineTo(b[0] + 26 * s, b[1] + 22 * s); c.lineTo(b[0] + 22 * s, b[1] - 14 * s); c.lineTo(b[0], b[1]); c.closePath(); c.fill();
      c.fillStyle = sk.cape.lining[1]; c.beginPath(); c.moveTo(a[0], a[1] + 1); c.lineTo(a[0] - 24 * s, a[1] - 9 * s); c.lineTo(a[0] - 27 * s, a[1] + 24 * s); c.lineTo(hem[0], hem[1] - 2); c.lineTo(b[0] + 24 * s, b[1] + 20 * s); c.lineTo(b[0] + 20 * s, b[1] - 11 * s); c.closePath(); c.fill();
      c.fillStyle = sk.cape.lining[2]; c.beginPath(); c.moveTo(a[0] - 3, a[1] + 3); c.lineTo(a[0] - 20 * s, a[1] - 5 * s); c.lineTo(a[0] - 18 * s, a[1] + 6 * s); c.closePath(); c.fill();
      c.fillStyle = sk.cape.lining[0]; for (let k = 1; k < 4; k++) { c.fillRect(Math.round(a[0] - k * 7 * s), Math.round(a[1] + 2), 1, Math.round(18 * s)); c.fillRect(Math.round(b[0] + k * 6 * s), Math.round(b[1] + 2), 1, Math.round(16 * s)); }
    } else if (j0.prop === 'capeSwirl') {
      // (swept round in front of him, the lining out)
      c.fillStyle = INK; c.beginPath(); c.moveTo(sho[0] - 4, sho[1]); c.quadraticCurveTo(sho[0] + 36 * s, sho[1] - 10 * s, hipL[0] + 30 * s, hipL[1] + 18 * s); c.lineTo(hem[0] - 10 * s, hem[1]); c.closePath(); c.fill();
      c.fillStyle = sk.cape.lining[1]; c.beginPath(); c.moveTo(sho[0] - 2, sho[1] + 1); c.quadraticCurveTo(sho[0] + 33 * s, sho[1] - 8 * s, hipL[0] + 27 * s, hipL[1] + 16 * s); c.lineTo(hem[0] - 8 * s, hem[1] - 1); c.closePath(); c.fill();
      c.fillStyle = sk.cape.lining[2]; c.fillRect(Math.round(sho[0] + 6 * s), Math.round(sho[1] + 1), Math.round(16 * s), 2);
    } else {
      const flare = j0.prop === 'capeUp' ? -10 * s : 0;
      const p = [add(sho, n, -4), add(sho, n, 3), add(hem, n, 3), add(add(hem, n, -15 * s), t, flare), add(add(hipL, n, -11 * s), t, 4)];
      c.fillStyle = INK; c.beginPath(); p.forEach((q, i) => (i ? c.lineTo(q[0], q[1] + 1) : c.moveTo(q[0], q[1] - 1))); c.closePath(); c.fill();
      c.fillStyle = sk.cape.out[1]; c.beginPath(); p.forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); c.closePath(); c.fill();
      // (the lining's edge showing down the back, its folds)
      c.strokeStyle = sk.cape.lining[1]; c.lineWidth = 2; c.beginPath(); c.moveTo(p[4][0], p[4][1]); c.lineTo(p[3][0], p[3][1]); c.stroke();
      c.strokeStyle = sk.cape.out[2]; c.lineWidth = 1; for (let k = 1; k < 3; k++) { const a = add(sho, n, -k * 3), b = add(add(hem, n, -k * 5 * s), t, flare * 0.5); c.beginPath(); c.moveTo(a[0], a[1] + 3); c.lineTo(b[0], b[1]); c.stroke(); }
    }
  }
  // THE BACK LEG, THE BACK ARM
  limb(c, [hipL[0] - 1, hipL[1]], bk, bf, sk.leg, dark(sk.legs), sk.wrap);
  foot(c, bf, sk, true);
  if (sk.bareFore) { limb(c, bs, be, be, sk.arm, dark(sleeve)); limb(c, be, be, bh, sk.arm - 1, dark(sk.skin)); }
  else limb(c, bs, be, bh, sk.arm, dark(sleeve), sk.wrap);
  blob(c, bh[0], bh[1], sk.arm * 0.55 + 0.6, sk.arm * 0.55 + 0.6, dark(hand), true);
  // THE HUMP; THE COAT TAILS
  if (sk.hump) { const hp = add(add(sho, t, -6 * s), n, -6 * s); blob(c, hp[0], hp[1], 7 * s, 8 * s, sk.top); }
  if (sk.tails) {
    const a = add(hipL, n, -sk.hips), b = add(add(hipL, t, -15 * s), n, -sk.hips - 4), d = add(add(hipL, t, -12 * s), n, 1);
    c.fillStyle = INK; c.beginPath(); c.moveTo(a[0] - 1, a[1]); c.lineTo(b[0] - 1, b[1] + 1); c.lineTo(d[0] + 1, d[1] + 1); c.lineTo(hipL[0] + 1, hipL[1]); c.closePath(); c.fill();
    c.fillStyle = sk.top[0]; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(d[0], d[1]); c.lineTo(hipL[0], hipL[1]); c.closePath(); c.fill();
  }
  // THE TORSO: hips to shoulders, banded
  const hb = add(hipL, n, -sk.hips), hf = add(hipL, n, sk.hips), sf = add(sho, n, sk.shoulders), sb = add(sho, n, -sk.shoulders);
  c.fillStyle = INK; c.beginPath(); c.moveTo(hb[0], hb[1]); c.lineTo(hf[0], hf[1]); c.lineTo(sf[0], sf[1]); c.lineTo(sb[0], sb[1]); c.closePath(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
  c.fillStyle = sk.top[1]; c.fill();
  c.fillStyle = sk.top[0]; c.beginPath(); c.moveTo(hb[0], hb[1]); c.lineTo(hipL[0], hipL[1]); c.lineTo(sho[0], sho[1]); c.lineTo(sb[0], sb[1]); c.closePath(); c.fill();
  c.strokeStyle = sk.top[2]; c.lineWidth = 1; c.beginPath(); const l0 = add(hf, n, -1.5), l1 = add(sf, n, -1.5); c.moveTo(l0[0], l0[1] - 1); c.lineTo(l1[0], l1[1] + 1); c.stroke();
  if (sk.wrap) for (let k = 0.2; k < 1; k += 0.25) { const a = add(add(hb, t, k * tl), n, 0), b = add(add(hf, t, k * tl - 2), n, 0); c.strokeStyle = BAND[0]; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
  sk.chest?.(c, hipL, sho, n);
  // THE FRONT LEG
  limb(c, [hipL[0] + 1, hipL[1]], fk, ff, sk.leg, sk.legs, sk.wrap);
  foot(c, ff, sk, false);
  // THE COLLAR (Dracula's, up behind his head), THE HEAD
  if (sk.collar) {
    const a = add(sho, n, -5), b = add(sho, n, 4), up = add(headC, t, 4);
    c.fillStyle = INK; c.beginPath(); c.moveTo(a[0], a[1] + 1); c.lineTo(add(up, n, -8)[0], add(up, n, -8)[1]); c.lineTo(add(headC, n, -3)[0], add(headC, n, -3)[1]); c.lineTo(b[0], b[1]); c.closePath(); c.fill();
    c.fillStyle = RED[1]; c.beginPath(); c.moveTo(a[0] + 1, a[1]); c.lineTo(add(up, n, -7)[0], add(up, n, -7)[1] + 1); c.lineTo(add(headC, n, -3)[0], add(headC, n, -3)[1] + 1); c.closePath(); c.fill();
  }
  const ang = Math.atan2(t[1], t[0]) + Math.PI / 2;
  c.save(); c.translate(Math.round(headC[0]), Math.round(headC[1])); c.rotate(Math.round(ang * 8) / 8); c.drawImage(headOf(id), -16, -16); c.restore();
  // THE FRONT ARM (over it all), its hand
  if (sk.bareFore) { limb(c, fs, fe, fe, sk.arm, sleeve); limb(c, fe, fe, fh, sk.arm - 1, sk.skin); }
  else limb(c, fs, fe, fh, sk.arm, sleeve, sk.wrap);
  blob(c, fh[0], fh[1], sk.arm * 0.55 + 0.6, sk.arm * 0.55 + 0.6, hand);
  // (what he's holding)
  prop(c, j0.prop, fh, s);
  return { head: headC, neck: sho, hip: hipL, fh, bh, ff };
};

const foot = (c: Ctx, f: P2, sk: Skin, back: boolean) => {
  const w = sk.shoeBig ? 9 : 6, h = sk.shoeBig ? 4 : 3;
  px(c, f[0] - 3, f[1] - h, w + 2, h + 1, INK);
  px(c, f[0] - 2, f[1] - h + 1, w, h - 1, back ? INK : sk.shoe);
  if (!back) px(c, f[0] - 1, f[1] - h + 1, w - 3, 1, 'rgba(255,255,255,0.25)');
};

const prop = (c: Ctx, what: string | undefined, h: P2, s: number) => {
  if (!what) return;
  if (what === 'whip') {
    // (the bandage lashed out, unrolling, a loose end)
    c.lineCap = 'round';
    c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(h[0], h[1]); c.quadraticCurveTo(h[0] + 50, h[1] - 6, h[0] + 98, h[1] + 2); c.stroke();
    c.strokeStyle = BAND[1]; c.lineWidth = 2; c.beginPath(); c.moveTo(h[0], h[1]); c.quadraticCurveTo(h[0] + 50, h[1] - 6, h[0] + 98, h[1] + 2); c.stroke();
    c.strokeStyle = BAND[2]; c.lineWidth = 1; c.setLineDash([2, 3]); c.beginPath(); c.moveTo(h[0], h[1] - 1); c.quadraticCurveTo(h[0] + 50, h[1] - 7, h[0] + 98, h[1] + 1); c.stroke(); c.setLineDash([]);
  } else if (what === 'potion' || what === 'flask') {
    blob(c, h[0] + 1, h[1] - 3, 3, 3, ['#1E6A1E', '#3AB83A', '#B8FFB0']); px(c, h[0], h[1] - 9, 2, 4, '#D8D0C0'); px(c, h[0] - 1, h[1] - 10, 4, 1, '#7A4A20');
  } else if (what === 'bell' || what === 'bellUp') {
    // (a hand bell the size of his head, bronze, banded)
    const x = h[0] + 4, y = h[1] + (what === 'bellUp' ? -14 : -4);
    c.fillStyle = INK; c.beginPath(); c.moveTo(x - 9, y + 10); c.quadraticCurveTo(x - 8, y - 9, x, y - 10); c.quadraticCurveTo(x + 8, y - 9, x + 9, y + 10); c.closePath(); c.fill();
    const B = ['#6A4410', '#A8701C', '#E0A838', '#FFE08A'];
    for (let k = 0; k < 4; k++) { c.fillStyle = B[k]; c.beginPath(); c.moveTo(x - 8 + k * 2, y + 9); c.quadraticCurveTo(x - 7 + k * 2, y - 8 + k, x + k, y - 9 + k); c.quadraticCurveTo(x + 6 - k, y - 6, x + 7 - k * 2, y + 9); c.closePath(); c.fill(); }
    px(c, x - 10, y + 9, 20, 2, B[0]); px(c, x - 2, y + 11, 4, 3, '#3A2408');
  } else if (what === 'rope') {
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(h[0], h[1] + 6); c.lineTo(h[0] + 2, -104); c.stroke();
    c.strokeStyle = '#B08A50'; c.lineWidth = 1; c.beginPath(); c.moveTo(h[0], h[1] + 6); c.lineTo(h[0] + 2, -104); c.stroke();
  } else if (what === 'gargoyle') {
    blob(c, h[0] + 6, h[1] - 4, 7, 6, ['#3A3A42', '#6A6A74', '#9A9AA4']); px(c, h[0] + 9, h[1] - 6, 2, 1, '#E01010'); px(c, h[0] + 2, h[1] - 12, 2, 3, '#3A3A42');
  } else if (what === 'notes') {
    px(c, h[0] + 6, h[1] - 10, 1, 7, INK); blob(c, h[0] + 5, h[1] - 3, 2, 1.5, ['#B89A20', '#FDE047', '#FFF6C0']);
  }
  void s;
};

// ---------------------------------------------------------------------------------------------------------------
// The bakes

const poses = new Map<string, Sprite>();
const EMPTY = (() => { let e: Sprite | null = null; return () => (e ??= { cv: mk(4, 4)[0], ox: 2, oy: 4, meta: { head: [0, -58], neck: [0, -48], hip: [0, -29], fh: [10, -38], bh: [-2, -36], ff: [7, 0] } }); })();

/** A fighter's pose, painted once (the Invisible Man: nothing, every time). */
export const pose = (id: ArtId, p: PoseId): Sprite => {
  if (id === 'invis') return EMPTY();
  const key = `${id}:${p}`;
  let sp = poses.get(key);
  if (!sp) {
    const [cv, g] = mk(CW, CH);
    g.translate(OX, OY);
    const m = drawFigure(g, id, p);
    harden(cv);
    const to = (q: P2): P2 => [q[0] + OX, q[1] + OY];
    sp = { cv, ox: OX, oy: OY, meta: { head: to(m.head), neck: to(m.neck), hip: to(m.hip), fh: to(m.fh), bh: to(m.bh), ff: to(m.ff) } };
    poses.set(key, sp);
  }
  return sp;
};

/** A pose's silhouette in one flat color (a husk, a shadow, a flash), painted once. */
const flats = new Map<string, HTMLCanvasElement>();
export const flat = (id: ArtId, p: PoseId, col: string) => {
  const key = `${id}:${p}:${col}`;
  let cv = flats.get(key);
  if (!cv) {
    const src = pose(id, p).cv, [c2, g] = mk(src.width, src.height);
    g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, src.width, src.height);
    flats.set(key, c2); cv = c2;
  }
  return cv;
};
/** A pose wrapped in bandages head to foot (the Mummy's squeeze), painted once. */
const wraps = new Map<string, HTMLCanvasElement>();
export const wrapped = (id: ArtId, p: PoseId) => {
  const key = `${id}:${p}`;
  let cv = wraps.get(key);
  if (!cv) {
    const src = pose(id, p).cv, [c2, g] = mk(src.width, src.height);
    g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-in';
    for (let y = 0; y < src.height; y += 3) { g.fillStyle = BAND[(y / 3) % 3 === 0 ? 0 : (y / 3) % 3 === 1 ? 1 : 2]; g.fillRect(0, y, src.width, 3); }
    g.globalCompositeOperation = 'source-over'; g.fillStyle = 'rgba(0,0,0,0.25)';
    for (let y = 1; y < src.height; y += 6) for (let x = (y * 3) % 7; x < src.width; x += 7) g.fillRect(x, y, 1, 1);
    wraps.set(key, c2); cv = c2;
  }
  return cv;
};

/** A piece cut out of a copy of the pose (the copy keeps a hole where it was): for the endings that take him apart. */
export const cut = (body: HTMLCanvasElement, x: number, y: number, w: number, h: number) => {
  const [pc, g] = mk(Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
  g.drawImage(body, Math.round(x), Math.round(y), Math.round(w), Math.round(h), 0, 0, Math.round(w), Math.round(h));
  body.getContext('2d')!.clearRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  return pc;
};
export const copyOf = (src: HTMLCanvasElement) => { const [cv, g] = mk(src.width, src.height); g.drawImage(src, 0, 0); return cv; };

// ---------------------------------------------------------------------------------------------------------------
// The select screen's portraits: 44 x 52, cheap gross-ups (bloodshot, veined, warted, dripping)

export const PW = 44, PH = 52;
const dither = (c: Ctx, x: number, y: number, w: number, h: number, col: string, step = 2) => { c.fillStyle = col; for (let yy = 0; yy < h; yy++) for (let xx = (yy % 2) * (step / 2); xx < w; xx += step) c.fillRect(x + xx, y + yy, 1, 1); };
/** A bloodshot eye: the white, veins in it, the iris, the pupil, a glint. */
const eye = (c: Ctx, x: number, y: number, r: number, iris: string, look = 0) => {
  blob(c, x, y, r + 0.5, r, ['#C8C0A8', '#F0E8D0', '#FFFFFF']);
  c.strokeStyle = '#C0202A'; c.lineWidth = 1;
  for (let k = 0; k < 4; k++) { const a = k * 1.6 + 0.4; c.beginPath(); c.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.9); c.lineTo(x + Math.cos(a) * r * 0.45 + 1, y + Math.sin(a) * r * 0.4); c.stroke(); }
  blob(c, x + look, y, r * 0.48, r * 0.5, [iris, iris, '#FFFFFF'], false);
  px(c, x + look - 1, y - 1, 2, 2, '#050505'); px(c, x + look - 1, y - 2, 1, 1, '#FFFFFF');
};
const teeth = (c: Ctx, x: number, y: number, n: number, w: number, h: number, yel = '#E8DCA8') => { for (let i = 0; i < n; i++) { px(c, x + i * w, y, w - 1, h + (i % 3 === 1 ? 1 : 0), yel); px(c, x + i * w, y + h - 1, w - 1, 1, '#B0A070'); } };

const PORTRAITS: Record<CharId, (c: Ctx) => void> = {
  drac: c => {
    px(c, 0, 0, PW, PH, '#2A0A14');
    blob(c, 22, 30, 15, 19, PALE);
    dither(c, 8, 34, 28, 12, PALE[0], 3);
    px(c, 6, 8, 32, 8, '#0A0A0E'); px(c, 18, 14, 8, 6, '#0A0A0E'); px(c, 6, 12, 5, 16, '#0A0A0E'); px(c, 33, 12, 5, 16, '#0A0A0E'); px(c, 12, 9, 12, 1, '#3A3A5A');
    px(c, 11, 22, 9, 2, '#0A0A0E'); px(c, 25, 22, 9, 2, '#0A0A0E');
    eye(c, 16, 27, 4, '#C01010'); eye(c, 29, 27, 4, '#C01010');
    px(c, 21, 28, 3, 9, PALE[0]); px(c, 20, 35, 5, 2, PALE[0]); px(c, 20, 36, 1, 1, '#2A0A10'); px(c, 24, 36, 1, 1, '#2A0A10');
    px(c, 13, 40, 18, 5, '#3A0610'); teeth(c, 14, 40, 6, 3, 2); px(c, 15, 41, 2, 6, '#FFFFFF'); px(c, 27, 41, 2, 6, '#FFFFFF'); px(c, 16, 46, 1, 3, '#B81020');
    px(c, 0, 46, 8, 6, RED[1]); px(c, 36, 46, 8, 6, RED[1]); px(c, 0, 44, 4, 8, '#0A0A0E'); px(c, 40, 44, 4, 8, '#0A0A0E');
  },
  monster: c => {
    px(c, 0, 0, PW, PH, '#0E2014');
    px(c, 5, 6, 34, 42, INK); px(c, 6, 7, 32, 40, GREEN[0]); px(c, 8, 9, 27, 34, GREEN[1]); px(c, 18, 11, 12, 12, GREEN[2]);
    dither(c, 8, 30, 27, 14, GREEN[0], 3);
    px(c, 4, 3, 36, 9, '#101010'); for (let i = 5; i < 39; i += 3) px(c, i, 12, 2, 2, '#101010');
    px(c, 9, 16, 26, 1, '#2A140C'); for (let i = 10; i < 34; i += 3) px(c, i, 14, 1, 5, '#2A140C');
    px(c, 8, 21, 28, 3, GREEN[0]); eye(c, 15, 26, 3.5, '#8A8A3A', 1); eye(c, 29, 26, 3.5, '#8A8A3A', -1);
    px(c, 20, 27, 4, 9, GREEN[0]); px(c, 19, 34, 6, 2, '#1E3018');
    px(c, 11, 39, 22, 4, INK); teeth(c, 12, 39, 7, 3, 2, '#C8C890'); px(c, 13, 43, 2, 4, '#8AA0A0');
    px(c, 0, 36, 6, 5, '#9A9AA4'); px(c, 0, 36, 2, 5, '#D4D4DC'); px(c, 38, 36, 6, 5, '#9A9AA4'); px(c, 42, 36, 2, 5, '#D4D4DC');
    c.strokeStyle = '#2A140C'; c.beginPath(); c.moveTo(30, 34); c.lineTo(36, 44); c.stroke(); for (let k = 0; k < 4; k++) px(c, 30 + k * 1.5, 35 + k * 2.5, 3, 1, '#2A140C');
  },
  mummy: c => {
    px(c, 0, 0, PW, PH, '#2A2010');
    blob(c, 22, 27, 16, 21, BAND);
    for (let y = 8; y < 48; y += 4) { c.strokeStyle = BAND[0]; c.beginPath(); c.moveTo(6, y + 3); c.lineTo(38, y - 1); c.stroke(); }
    dither(c, 8, 30, 28, 16, BAND[0], 3);
    px(c, 10, 21, 10, 7, '#140E04'); px(c, 25, 21, 10, 7, '#140E04'); eye(c, 15, 24, 3, '#E0C020'); px(c, 28, 23, 4, 3, '#2A1E08'); px(c, 29, 24, 1, 1, '#FDE047');
    px(c, 20, 29, 4, 6, BAND[0]); px(c, 12, 38, 20, 6, '#140E04'); teeth(c, 13, 38, 6, 3, 2, '#8A7A50'); px(c, 15, 43, 1, 1, '#6A8A30'); px(c, 24, 42, 2, 5, '#6A8A30');
    px(c, 34, 8, 8, 2, BAND[1]); px(c, 38, 10, 4, 6, BAND[1]); px(c, 4, 40, 3, 3, '#3A2A10');
  },
  jekyll: c => {
    // (half and half down the middle: the doctor on the left, Hyde bursting out on the right)
    px(c, 0, 0, 22, PH, '#1A2A3A'); px(c, 22, 0, 22, PH, '#3A0A0A');
    blob(c, 22, 30, 15, 19, FLESH);
    c.save(); c.beginPath(); c.rect(22, 0, 22, PH); c.clip(); blob(c, 23, 30, 17, 20, RUDDY); dither(c, 24, 32, 18, 16, RUDDY[0], 3); c.restore();
    px(c, 6, 6, 16, 8, '#141414'); px(c, 4, 13, 20, 2, '#141414'); px(c, 22, 8, 18, 6, '#0E0806'); px(c, 36, 12, 6, 14, '#0E0806');
    px(c, 7, 15, 5, 12, '#5A3A1E');
    eye(c, 15, 26, 3.5, '#2A4A8A'); c.strokeStyle = '#D4AF37'; c.strokeRect(10.5, 21.5, 9, 9);
    px(c, 24, 21, 14, 3, '#0E0806'); eye(c, 30, 27, 4.5, '#B01010', 1);
    px(c, 20, 28, 4, 9, FLESH[0]); px(c, 11, 38, 11, 2, '#5A3A1E'); px(c, 12, 41, 9, 2, '#8A3A30');
    px(c, 22, 38, 14, 7, '#2A0A06'); teeth(c, 23, 38, 4, 3, 3, '#D8C890'); px(c, 31, 36, 2, 4, '#E8E0C0'); px(c, 33, 44, 2, 5, '#E8E8F0');
    px(c, 21, 0, 2, PH, '#0A0A0A');
  },
  invis: c => {
    // (nothing: an empty frame, as advertised; the box's own static)
    px(c, 0, 0, PW, PH, '#0A0A12');
    for (let i = 0; i < 70; i++) px(c, (i * 37) % PW, (i * 53) % PH, 1, 1, i % 3 ? '#26263A' : '#3A3A54');
    c.font = '16px "Press Start 2P"'; c.textAlign = 'center'; c.fillStyle = '#3A3A54'; c.fillText('?', 23, 34); c.textAlign = 'left';
  },
  phantom: c => {
    px(c, 0, 0, PW, PH, '#160A20');
    blob(c, 22, 30, 15, 19, GAUNT); dither(c, 8, 30, 14, 16, GAUNT[0], 2);
    // (the bare half: the skull showing through, rotten; the mask over the other half, white, its glint)
    px(c, 10, 30, 5, 8, '#3A2A28'); px(c, 13, 24, 6, 5, '#140808'); eye(c, 15, 26, 2.5, '#A0A020');
    px(c, 22, 14, 16, 26, '#F1F0EA'); px(c, 22, 14, 16, 2, '#FFFFFF'); px(c, 36, 16, 2, 22, '#C8C6BC'); px(c, 24, 22, 9, 6, '#0A0A0E'); eye(c, 29, 25, 2.5, '#E8E030');
    px(c, 4, 10, 36, 4, '#0A0A0E'); px(c, 10, 2, 24, 9, '#0A0A0E'); px(c, 10, 8, 24, 2, '#5A0A10');
    px(c, 13, 40, 17, 4, '#2A0A0A'); teeth(c, 14, 40, 5, 3, 3, '#D8D0A0'); px(c, 12, 33, 1, 7, '#6A4A40');
    px(c, 0, 46, 44, 6, '#F0EEE6'); px(c, 20, 46, 4, 6, '#0A0A0E');
  },
  quasi: c => {
    px(c, 0, 0, PW, PH, '#2A1608');
    blob(c, 23, 30, 17, 19, QFLESH); dither(c, 8, 36, 30, 12, QFLESH[0], 3);
    px(c, 4, 4, 34, 10, '#9A3A12'); px(c, 2, 10, 8, 18, '#9A3A12'); px(c, 12, 4, 14, 3, '#C85820'); px(c, 34, 8, 6, 8, '#9A3A12');
    // (the wart the size of a plum over his left eye, its hair; the right eye, tiny, worried)
    blob(c, 15, 22, 7, 7, ['#7A4A2A', '#B07850', '#D8A882']); px(c, 13, 18, 1, 3, '#2A1408'); px(c, 17, 17, 1, 3, '#2A1408'); dither(c, 10, 22, 10, 6, '#7A4A2A', 2);
    eye(c, 31, 26, 2.5, '#5A7A3A');
    px(c, 22, 27, 6, 10, QFLESH[0]); blob(c, 26, 35, 4, 3, QFLESH);
    px(c, 10, 39, 26, 9, '#3A1408'); teeth(c, 11, 39, 7, 3, 2, '#E8DCB0'); px(c, 14, 35, 3, 5, '#E8DCB0'); px(c, 28, 34, 3, 6, '#D8C890');
    px(c, 12, 47, 1, 4, '#9AB0B8'); px(c, 13, 50, 1, 2, '#9AB0B8');
  },
};
const portraits = new Map<CharId, HTMLCanvasElement>();
export const portrait = (id: CharId) => {
  let cv = portraits.get(id);
  if (!cv) { const [p, g] = mk(PW, PH); PORTRAITS[id](g); portraits.set(id, p); cv = p; }
  return cv;
};

/** A baked canvas drawn with its origin (ox, oy) at (x, y): mirrored for facing left; stretched, turned or faded only
 *  as the endings ask (a turn of something already painted, never painted turned). */
export const blit = (c: Ctx, cv: HTMLCanvasElement, ox: number, oy: number, x: number, y: number, face: number, sx = 1, sy = 1, rot = 0, alpha = 1) => {
  if (alpha <= 0) return;
  const plain = sx === 1 && sy === 1 && rot === 0 && alpha === 1;
  if (plain && face === 1) { c.drawImage(cv, Math.round(x - ox), Math.round(y - oy)); return; }
  c.save();
  c.globalAlpha = alpha;
  c.translate(Math.round(x), Math.round(y));
  if (rot) c.rotate(rot);
  c.scale(face * sx, sy);
  c.drawImage(cv, -ox, -oy);
  c.restore();
};
