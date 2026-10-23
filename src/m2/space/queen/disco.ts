// GALACTIC GROOVE, the space disco, drawn (the SNES pass): the hall (its walls banded dark to purple, the mural band of
// planets and starbursts, the tufted vinyl down low, the lighting truss up top with its par cans), the chrome pillars,
// the speaker stacks, the DJ ZORP booth (a saucer pod up on its pole: the two operators in it), the bar and its back
// bar, the extinguisher's cabinet, the refill's first-aid cabinet; and the live show: the light-up dance floor (its
// tiles stepping through patterns on the beat), the mirror ball (faceted, turning, throwing its spots round the
// hall), the par cans panning, the neon chasing.
//
// The lighting does the shining: the hall's dark (deep when the lights are down; the color pops out of it when they're
// up) with every tile, spot, can, the ball, the neon and the booth as lights in it (discoLighting); and after the
// lighting, over it (discoGlow: screen space, the world's transform), the light you can see in the air: the ball's
// rays, the cans' beams, the neon's bloom, the glow up off the floor. All stepped and stippled (no gradients).

import type { GameState } from '../../../m1/game/core/state';
import type { Light, SceneLight } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { stamp } from '../../../m1/game/render/stamp';
import { bandedGradient, tilePattern } from '../../../m1/game/render/pixelArt';
import { ALIEN } from '../../../m1/game/scenes/alienLook';
import { GY } from '../geometry';
import { drawAlien, type AlienPose } from '../crater/aliens';
import { DOOR_X, DISCO_L, DISCO_R, DJ, BALL, EXTINGUISHER_X, REFILL_X } from './geo';
import { type Ramp, CHROME, dith, tube, hose, quad, blob, hash } from './paint';
import { neon, neonW, chrome, square, print, lightbox } from './letters';
import { DOORWAY, DOOR_SIGN } from './basement';

type Ctx = CanvasRenderingContext2D;
const W = DISCO_R - DISCO_L;
const shown = (state: GameState, a: number, b: number) => { const v = state.view ?? { x: state.camera.x, w: CANVAS_WIDTH }; return b > v.x - 80 && a < v.x + v.w + 80; };
const px = (c: Ctx, x: number, y: number, w: number, h: number, col: string | CanvasPattern) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };

/** The booth's operators: at the controls; after her, fists shaking, stomping; running out the back; gone. */
export interface BoothOps { mode: 'on' | 'mad' | 'run' | 'gone'; t: number }

// ---------------------------------------------------------------------------------------------------------------
// The show's clock and its colors

/** The beat (frames): 120 to the minute. */
const BEAT = 30;
/** The floor's colors (each a ramp: frame, deep, base, lit, hot), and the same as light. */
const TILE: Ramp[] = [
  ['#3B0420', '#9D174D', '#EC4899', '#F9A8D4', '#FFF1F7'],
  ['#1E0B4B', '#5B21B6', '#8B5CF6', '#C4B5FD', '#F5F3FF'],
  ['#083344', '#0E7490', '#22D3EE', '#A5F3FC', '#F0FDFF'],
  ['#422006', '#A16207', '#FDE047', '#FEF08A', '#FFFFF0'],
  ['#052E16', '#15803D', '#22C55E', '#86EFAC', '#F0FFF4'],
];
const TILE_RGB = ['236, 72, 153', '139, 92, 246', '34, 211, 238', '253, 224, 71', '34, 197, 94'];
/** The floor's tiles: how wide, from where, how many. */
const TW = 36, T0 = DISCO_L + 40, TN = Math.floor((W - 60) / TW);
/** A tile's color this frame (-1: dark), by the pattern of the moment: a chase, the checker on the beat, a ripple out
 *  from the ball, sparkle. */
const tileAt = (i: number, row: number, f: number, on: boolean): number => {
  if (!on) return -1;
  const beat = Math.floor(f / BEAT), mode = Math.floor(f / (BEAT * 16)) % 4;
  if (mode === 0) { const k = (i + row * 2 - Math.floor(f / 6)) % 10; return k < 4 ? ((Math.floor((i + row * 2 - Math.floor(f / 6)) / 10) % 5) + 5) % 5 : -1; }
  if (mode === 1) return (i + row + beat) % 2 === 0 ? (beat + Math.floor(i / 4)) % 5 : -1;
  if (mode === 2) { const ball = (BALL.x - T0) / TW, d = Math.abs(i - ball) + row; const k = (Math.floor(d) - Math.floor(f / 5)) % 6; return ((k + 6) % 6) < 2 ? (Math.floor(d / 6) + beat) % 5 : -1; }
  return hash(i * 7.3 + row * 13 + beat * 1.7) < 0.45 ? Math.floor(hash(i + beat * 3.1) * 5) : -1;
};

/** The ball's spots: where each is on the walls this frame, (x, y). */
const SPOTS = 16;
const spotAt = (k: number, f: number) => {
  const a = f * 0.012 + k * (Math.PI * 2 / SPOTS) + Math.sin(k * 2.3) * 0.2, d = 260 + (k % 4) * 150;
  return { x: BALL.x + Math.cos(a) * d * 1.55, y: BALL.y + 150 + Math.sin(a) * d * 0.42 + (k % 3) * 30, front: Math.sin(a) > -0.75 };
};
/** The par cans along the truss: where each hangs, its color, where its beam lands on the floor this frame. */
const CANS = [0.08, 0.2, 0.33, 0.62, 0.76, 0.9].map((u, i) => ({ x: DISCO_L + u * W, col: [0, 2, 3, 1, 4, 2][i] }));
const TRUSS_Y = GY - 528;
const canHit = (k: number, f: number) => { const cn = CANS[k]; return cn.x + Math.sin(f * 0.015 + k * 1.9) * 260; };

/** The big neon over the booth: its board (x, y, w, h), each word's middle. */
const NEON_S = 3;
const N_PINK: Ramp = ['#1A0410', '#3A1A30', '#EC4899', '#F9A8D4', '#FFF1F7'];
const N_CYAN: Ramp = ['#04161C', '#14343C', '#22D3EE', '#A5F3FC', '#F0FDFF'];
const NEON = (() => {
  const wa = neonW('GALACTIC', NEON_S, 1), wr = neonW('GROOVE', NEON_S, 1), sp = 16, cx = DJ.x + DJ.w / 2, w = wa + sp + wr;
  return { x: Math.round(cx - w / 2 - 22), y: GY - 474, w: Math.round(w + 44), h: 44, ga: cx - w / 2 + wa / 2, gr: cx + w / 2 - wr / 2 };
})();

// ---------------------------------------------------------------------------------------------------------------
// The hall (stamped once)

const WALL = ['#05020B', '#0B0418', '#150826', '#200C38', '#2A0F48', '#331257', '#2A0F48', '#1C0A33'];
const tufted = (c: Ctx) => tilePattern(c, 'sp-q-tuft', 24, 24, g => {
  g.fillStyle = '#3A0A55'; g.fillRect(0, 0, 24, 24);
  // (the diamonds: their pleats in, lit along one side)
  g.fillStyle = '#4C1270'; g.beginPath(); g.moveTo(12, 1); g.lineTo(23, 12); g.lineTo(12, 23); g.lineTo(1, 12); g.closePath(); g.fill();
  g.fillStyle = '#5E1A86'; g.beginPath(); g.moveTo(12, 3); g.lineTo(20, 11); g.lineTo(12, 11); g.lineTo(4, 11); g.closePath(); g.fill();
  g.fillStyle = '#26063A'; for (let k = 0; k < 12; k++) { g.fillRect(k, 12 - k, 1, 1); g.fillRect(12 + k, k, 1, 1); g.fillRect(k, 12 + k, 1, 1); g.fillRect(12 + k, 24 - k, 1, 1); }
  // (the button at each corner)
  for (const [x, y] of [[0, 0], [24, 0], [0, 24], [24, 24], [12, 12]]) { g.fillStyle = '#1A0428'; g.fillRect(x - 2, y - 2, 4, 4); g.fillStyle = '#9F5BD0'; g.fillRect(x - 1, y - 1, 2, 1); }
});

const paintWall = (g: Ctx, tx: number) => {
  bandedGradient(g, tx, GY - 600, 400, 600, WALL, 14);
  // (the stars painted up high: twinkle dots, some crossed)
  for (let i = 0; i < 46; i++) {
    const x = tx + hash(i + tx) * 400, y = GY - 590 + hash(i * 3 + tx) * 300, big = i % 7 === 0;
    px(g, x, y, 2, 2, i % 3 ? '#A78BFA' : '#F0ABFC');
    if (big) { px(g, x - 3, y, 8, 1, '#C4B5FD'); px(g, x, y - 3, 1, 8, '#C4B5FD'); }
  }
  // (the mural band: a black field of space, a planet or two in steps, a ringed one, chrome-trimmed (dim: it's no ledge))
  const my = GY - 254, mh = 82;
  px(g, tx, my, 400, mh, '#0A0418'); px(g, tx, my - 3, 400, 3, '#4A4458'); px(g, tx, my + mh, 400, 3, '#4A4458'); px(g, tx, my - 3, 400, 1, '#6A6478');
  for (let i = 0; i < 30; i++) px(g, tx + hash(i * 9 + tx) * 400, my + 4 + hash(i * 5 + tx) * (mh - 8), 1, 1, '#E9D5FF');
  const k = Math.round((tx - DISCO_L) / 400);
  const pr: Ramp[] = [['#1C0A2E', '#7C2D12', '#EA580C', '#FDBA74', '#FFF7ED'], ['#0B1E3A', '#1D4ED8', '#60A5FA', '#BFDBFE', '#FFFFFF'], ['#1A2E05', '#4D7C0F', '#A3E635', '#D9F99D', '#F7FEE7']];
  const P = pr[((k % 3) + 3) % 3], cx = tx + 120 + (k % 2) * 160, cy = my + mh / 2, r = 26;
  blob(g, cx, cy, r, r, P);
  if (k % 2 === 0) { g.strokeStyle = '#0A0418'; g.lineWidth = 6; g.beginPath(); g.ellipse(cx, cy, r * 1.8, r * 0.45, -0.2, 0, Math.PI * 2); g.stroke(); g.strokeStyle = P[3]; g.lineWidth = 3; g.beginPath(); g.ellipse(cx, cy, r * 1.8, r * 0.45, -0.2, Math.PI * 0.95, Math.PI * 2.05); g.stroke(); g.strokeStyle = P[1]; g.lineWidth = 1; g.beginPath(); g.ellipse(cx, cy, r * 1.6, r * 0.38, -0.2, Math.PI * 0.95, Math.PI * 2.05); g.stroke(); }
  // (a shooting star across it)
  for (let j = 0; j < 14; j++) px(g, tx + 300 - j * 5, my + 16 + j * 2, 5 - j * 0.3, 1, j < 3 ? '#FFFFFF' : j < 8 ? '#F0ABFC' : '#7C3AED');
  // (Googie starbursts, gold, on the wall between)
  for (const sx of [tx + 60, tx + 270]) {
    const sy = GY - 336 + (sx % 3) * 6;
    for (let a = 0; a < 12; a++) { const an = a * Math.PI / 6, l = a % 2 ? 9 : 18; g.strokeStyle = a % 2 ? '#A16207' : '#FACC15'; g.lineWidth = a % 2 ? 1 : 2; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + Math.cos(an) * l, sy + Math.sin(an) * l); g.stroke(); }
    blob(g, sx, sy, 3, 3, ['#422006', '#CA8A04', '#FACC15', '#FEF08A', '#FFFFFF']);
  }
  // (down low: the tufted vinyl, a chrome rail along its top, the baseboard)
  g.fillStyle = tufted(g); g.fillRect(tx, GY - 150, 400, 142);
  px(g, tx, GY - 150, 400, 2, 'rgba(10, 2, 18, 0.6)'); g.fillStyle = dith(g, 'rgba(10, 2, 18, 0.5)'); g.fillRect(tx, GY - 148, 400, 4);
  g.fillStyle = dith(g, '#14041F'); g.fillRect(tx, GY - 40, 400, 32); px(g, tx, GY - 24, 400, 16, 'rgba(10, 2, 18, 0.55)');
  px(g, tx, GY - 156, 400, 6, '#2E2A3A'); px(g, tx, GY - 156, 400, 1, '#4A4658'); px(g, tx, GY - 151, 400, 1, '#18181F');
  px(g, tx, GY - 8, 400, 8, '#52525B'); px(g, tx, GY - 8, 400, 2, '#A1A1AA'); px(g, tx, GY - 2, 400, 2, '#27272A');
};

/** A chrome pillar, floor to ceiling: banded round in steps, a flared foot and head. */
const pillar = (g: Ctx, x: number, w = 30) => {
  const bands = ['#2A2A31', '#52525B', '#8E8E99', '#C9CBD3', '#F4F4F5', '#A1A1AA', '#6B6B76', '#3F3F46'];
  const bw = w / bands.length;
  bands.forEach((col, i) => px(g, x + i * bw, GY - 600, Math.ceil(bw), 600, col));
  // (the hall's colors caught in it, down its shine)
  for (let y = GY - 560; y < GY - 20; y += 34) px(g, x + bw * 4, y, bw, 6, ['#F9A8D4', '#A5F3FC', '#C4B5FD', '#FEF08A'][((Math.floor(y / 34) % 4) + 4) % 4]);
  // (its foot and its head: stepped chrome collars, three tiers each (widest at the floor, and at the ceiling), each
  // inked, banded round like the shaft, lit along its top, shaded under)
  const tier = (y: number, ex: number, h: number) => {
    const l = x - ex, tw = w + ex * 2, cb = tw / bands.length;
    px(g, l - 1, y - 1, tw + 2, h + 2, '#05050A');
    bands.forEach((col, i) => px(g, l + i * cb, y, Math.ceil(cb), h, col));
    px(g, l, y, tw, 1, '#F4F4F5'); px(g, l, y + h - 1, tw, 1, '#18181B');
    g.fillStyle = dith(g, '#18181B'); g.fillRect(l, y + h - 3, tw, 2);
  };
  tier(GY - 26, 3, 6); tier(GY - 20, 6, 6); tier(GY - 14, 9, 14);
  tier(GY - 600, 9, 8); tier(GY - 592, 6, 5); tier(GY - 587, 3, 5);
  g.fillStyle = dith(g, 'rgba(5, 2, 11, 0.6)'); g.fillRect(x, GY - 582, w, 6);
};

/** A speaker stack: two cabinets, woofers and a horn each, on the floor. */
const speakers = (g: Ctx, x: number) => {
  for (let k = 0; k < 2; k++) {
    const y = GY - 130 - k * 124;
    // (the cabinet: inked, its tolex stippled, bevelled (lit top and left edge, its side face in shade), the baffle
    // inset, chrome corner caps, a handle cut in its side)
    px(g, x - 1, y - 1, 82, 126, '#05050A'); px(g, x, y, 80, 124, '#18181D');
    g.fillStyle = dith(g, '#22222A', 1, k); g.fillRect(x, y, 74, 124);
    px(g, x, y, 80, 2, '#3A3A44'); px(g, x, y, 80, 1, '#52525E'); px(g, x, y, 1, 124, '#2E2E38'); px(g, x + 74, y, 6, 124, '#0E0E12'); px(g, x + 74, y, 1, 124, '#05050A');
    px(g, x + 75, y + 54, 4, 16, '#05050A'); px(g, x + 75, y + 54, 4, 1, '#26262E');
    px(g, x + 4, y + 4, 66, 108, '#0C0C10'); px(g, x + 4, y + 111, 66, 1, '#2A2A33'); px(g, x + 4, y + 4, 66, 1, '#05050A');
    for (const [cx, cy, fx, fy] of [[x, y, 1, 1], [x + 74, y, -1, 1], [x, y + 117, 1, -1], [x + 74, y + 117, -1, -1]] as const) {
      const ox = fx > 0 ? cx : cx - 1, oy = fy > 0 ? cy : cy;
      px(g, ox - 1, oy - 1, 9, 9, '#05050A'); px(g, ox, oy, 7, 7, CHROME[1]); px(g, ox, oy, 7, 1, CHROME[3]); px(g, ox, oy, 1, 7, CHROME[2]); px(g, ox + 3, oy + 3, 1, 1, CHROME[4]);
    }
    for (let i = 0; i < 2; i++) {
      const cx = x + 40, cy = y + 30 + i * 60;
      blob(g, cx, cy, 24, 24, ['#05050A', '#2A2A33', '#3F3F4C', '#5A5A6A', '#8A8A9A'], true);
      g.strokeStyle = '#7A7A8A'; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, 22.5, Math.PI * 1.05, Math.PI * 1.55); g.stroke();
      blob(g, cx, cy, 14, 14, ['#05050A', '#18181D', '#2A2A33', '#4A4A58', '#6A6A7A'], false);
      blob(g, cx, cy, 5, 5, ['#05050A', '#3A3A44', '#71717A', '#A1A1AA', '#E4E4E7'], false);
      for (let s = 0; s < 4; s++) { const a = Math.PI / 4 + s * Math.PI / 2; px(g, cx + Math.cos(a) * 26 - 1, cy + Math.sin(a) * 26 - 1, 2, 2, '#05050A'); px(g, cx + Math.cos(a) * 26 - 1, cy + Math.sin(a) * 26 - 1, 1, 1, '#8E8E99'); }
    }
    // (the badge on its foot: a chrome plate, a lit dot)
    px(g, x + 50, y + 116, 20, 6, '#05050A'); px(g, x + 51, y + 117, 18, 4, '#52525B'); px(g, x + 51, y + 117, 18, 1, '#D4D4D8'); px(g, x + 53, y + 118, 2, 2, '#F472B6'); px(g, x + 57, y + 119, 10, 1, '#18181B');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The DJ booth: a saucer pod up on a chrome pole. Stamped: the pod (dome, ribs, portholes, the cabin's chrome frame,
// the saucer rim and its neon front panel, the LED strip's sockets, the cables down the pole); the cabin's back wall
// (record crates on a shelf, the cue monitor, the reel-to-reel, spare cans on a hook); the console (two turntables,
// the mixer, the lava lamp, the plasma ball). Live over them, all small: the records' labels turning, the reels, the
// VU meters, faders and the LED chase on the beat (the floor's beat), the lamp's blobs, the plasma's arcs, the neon
// starbursts, the speakers' cones pumping, the mirror ball's glints sliding over the pod.

/** Where the booth's bits are: the pod's middle, the window's foot, the rim's middle and size. */
const BCX = DJ.x + DJ.w / 2, BH = DJ.y + DJ.h, RIM_Y = BH + 14, RIM_RX = DJ.w / 2 + 40, RIM_RY = 22;
/** The decks (x), the mixer's upright (x, top), the console's deck surface (y). */
const DECKS = [DJ.x + 60, DJ.x + 140], MIX_X = DJ.x + 88, MIX_TOP = BH - 34, DESK_Y = BH - 16;
/** The lava lamp, the plasma ball. */
const LAVA_X = DJ.x + 9, PLASMA = { x: DJ.x + 191, y: BH - 23, r: 7 };
/** The rim's neon starbursts (x, y) and the LED bulbs round its lower edge. */
const BURSTS = [BCX - 64, BCX + 64], BURST_Y = BH + 20;
const RIM_LEDS = Array.from({ length: 22 }, (_, i) => { const a = Math.PI * (0.1 + 0.8 * (i / 21)); return { x: BCX + Math.cos(a) * (RIM_RX - 4), y: RIM_Y + Math.sin(a) * (RIM_RY - 1) }; });
/** The speaker stacks round the booth (x): one left of the pole, two to the right. */
const STACKS = [DJ.x - 30, DJ.x + DJ.w + 30, DJ.x + DJ.w + 118];
/** The reel-to-reel's reels. */
const REELS = [{ x: DJ.x + 126, y: DJ.y + 13 }, { x: DJ.x + 143, y: DJ.y + 13 }];
const CABLE: Ramp = ['#05050A', '#18181B', '#27272A', '#3F3F46', '#71717A'];
const RECORD_COLS = ['#BE185D', '#1D4ED8', '#CA8A04', '#15803D', '#7C3AED', '#E4E4E7', '#B91C1C', '#0E7490', '#F97316', '#18181B'];

/** The pod, outside: the pole and its cables, the dome, the cabin's frame, the rim and its panel. */
const booth = (g: Ctx) => {
  const cx = BCX;
  // (the pole down to the floor, its foot; the cables down it in loose loops to a junction box at its foot)
  tube(g, cx, BH + 46, cx, GY - 8, 14, CHROME);
  for (let y = BH + 70; y < GY - 30; y += 46) { px(g, cx - 9, y, 18, 5, '#18181B'); px(g, cx - 8, y + 1, 16, 3, '#52525B'); px(g, cx - 8, y + 1, 16, 1, '#A1A1AA'); }
  hose(g, quad(cx - 4, BH + 34, cx - 34, (BH + GY) / 2 - 20, cx - 6, GY - 70, 12), 3, CABLE);
  hose(g, quad(cx + 3, BH + 36, cx + 26, (BH + GY) / 2 + 30, cx + 16, GY - 52, 12), 2, CABLE);
  hose(g, quad(cx - 6, GY - 70, cx - 22, GY - 20, cx - 60, GY - 10, 8), 3, CABLE);
  px(g, cx + 9, GY - 66, 22, 30, '#05020B'); px(g, cx + 10, GY - 65, 20, 28, '#3F3F46'); px(g, cx + 10, GY - 65, 20, 2, '#71717A');
  for (let i = 0; i < 3; i++) { px(g, cx + 13 + i * 6, GY - 58, 3, 4, '#18181B'); px(g, cx + 14 + i * 6, GY - 57, 1, 1, i === 0 ? '#22C55E' : '#71717A'); }
  print(g, 'HI', cx + 20, GY - 49, 1, 1, ['#FDE047', '#A16207']);
  px(g, cx + 10, GY - 40, 20, 2, '#FACC15'); for (let i = 0; i < 5; i++) px(g, cx + 10 + i * 4, GY - 40, 2, 2, '#18181B');
  // (the dome: banded in steps, chrome meridian ribs, a row of portholes round its foot, the beacon up top)
  g.fillStyle = '#05020B'; g.beginPath(); g.ellipse(cx, DJ.y - 6, DJ.w / 2 + 6, 30, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#4C1D95'; g.beginPath(); g.ellipse(cx, DJ.y - 6, DJ.w / 2 + 4, 28, 0, Math.PI, 0); g.fill();
  g.fillStyle = dith(g, '#5B21B6'); g.beginPath(); g.ellipse(cx - 6, DJ.y - 7, DJ.w / 2 - 6, 25, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#6D28D9'; g.beginPath(); g.ellipse(cx - 10, DJ.y - 10, DJ.w / 2 - 20, 20, 0, Math.PI, 0); g.fill();
  g.fillStyle = dith(g, '#A78BFA'); g.beginPath(); g.ellipse(cx - 24, DJ.y - 16, DJ.w / 2 - 50, 12, 0, Math.PI, 0); g.fill();
  px(g, cx - 40, DJ.y - 30, 24, 2, '#DDD6FE');
  for (const s of [0.36, 0.72]) {
    g.lineWidth = 3; g.strokeStyle = '#2E1065'; g.beginPath(); g.ellipse(cx, DJ.y - 6, s * (DJ.w / 2 + 4), 28, 0, Math.PI, 0); g.stroke();
    g.lineWidth = 1; g.strokeStyle = '#A1A1AA'; g.beginPath(); g.ellipse(cx, DJ.y - 7, s * (DJ.w / 2 + 4) + 1, 28, 0, Math.PI * 1.02, Math.PI * 1.45); g.stroke();
  }
  for (let i = 0; i < 7; i++) {
    const u = (i - 3) / 3.6, x = cx + u * (DJ.w / 2 - 6), y = DJ.y - 13 - (1 - u * u) * 3;
    blob(g, x, y, 4, 3, ['#05020B', '#3F3F46', '#8E8E99', '#D4D4D8', '#FFFFFF']);
    px(g, x - 2, y - 1, 4, 2, i % 2 ? '#155E75' : '#831843'); px(g, x - 2, y - 1, 1, 1, '#E0F2FE');
  }
  px(g, cx - DJ.w / 2 - 2, DJ.y - 8, DJ.w + 4, 2, '#8E8E99'); px(g, cx - DJ.w / 2 - 2, DJ.y - 8, DJ.w + 4, 1, '#E4E4E7');
  tube(g, cx, DJ.y - 34, cx, DJ.y - 58, 3, CHROME);
  for (const [ax, ay] of [[cx - 8, DJ.y - 44], [cx + 8, DJ.y - 48]]) { px(g, Math.min(cx, ax), ay, Math.abs(ax - cx), 1, '#A1A1AA'); px(g, ax - 1, ay - 1, 3, 3, '#D4D4D8'); }
  blob(g, cx, DJ.y - 60, 5, 5, ['#450A0A', '#7F1D1D', '#991B1B', '#B91C1C', '#EF4444']);
  // (the cabin's frame round the window: stepped chrome, rivets along it)
  px(g, DJ.x - 12, DJ.y - 8, DJ.w + 24, DJ.h + 16, '#05020B');
  px(g, DJ.x - 10, DJ.y - 6, DJ.w + 20, DJ.h + 12, '#71717A');
  px(g, DJ.x - 10, DJ.y - 6, DJ.w + 20, 2, '#D4D4D8'); px(g, DJ.x - 10, DJ.y - 4, DJ.w + 20, 1, '#A1A1AA');
  px(g, DJ.x - 10, DJ.y - 6, 2, DJ.h + 12, '#A1A1AA'); px(g, DJ.x + DJ.w + 4, DJ.y - 4, 6, DJ.h + 8, '#3F3F46'); px(g, DJ.x + DJ.w + 4, DJ.y - 4, 1, DJ.h + 8, '#52525B');
  px(g, DJ.x - 10, BH + 4, DJ.w + 20, 2, '#3F3F46');
  px(g, DJ.x - 2, DJ.y - 2, DJ.w + 4, DJ.h + 4, '#18181B'); px(g, DJ.x - 2, BH, DJ.w + 4, 2, '#A1A1AA');
  for (let x = DJ.x - 6; x < DJ.x + DJ.w + 6; x += 16) for (const y of [DJ.y - 5, BH + 3]) { px(g, x, y, 2, 2, '#27272A'); px(g, x, y, 1, 1, '#F4F4F5'); }
  px(g, DJ.x, DJ.y, DJ.w, DJ.h, '#0A0510');
  // (the saucer rim under it: banded, its lit top lip)
  g.fillStyle = '#05020B'; g.beginPath(); g.ellipse(cx, RIM_Y, RIM_RX, RIM_RY, 0, 0, Math.PI * 2); g.fill();
  const rim = ['#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95', '#3B0F7A', '#2E1065'];
  g.save(); g.beginPath(); g.ellipse(cx, RIM_Y, RIM_RX - 2, RIM_RY - 2, 0, 0, Math.PI * 2); g.clip();
  for (let i = 0; i < 6; i++) px(g, cx - RIM_RX, BH - 6 + i * 7, RIM_RX * 2, 7, rim[i]);
  for (let i = 0; i < 5; i++) { g.fillStyle = dith(g, rim[i], 1, i % 2); g.fillRect(cx - RIM_RX, BH + 1 + i * 7, RIM_RX * 2, 1); }
  // (a seam ring round it, chrome; the panel in its face: dark glass, chrome-trimmed, its ends following the rim)
  g.strokeStyle = '#A1A1AA'; g.lineWidth = 1; g.beginPath(); g.ellipse(cx, RIM_Y + 2, RIM_RX - 8, RIM_RY - 6, 0, Math.PI * 0.05, Math.PI * 0.95); g.stroke();
  px(g, cx - 88, BH + 6, 176, 26, '#05020B'); px(g, cx - 87, BH + 7, 174, 24, '#14061F');
  g.fillStyle = dith(g, '#1E0B33'); g.fillRect(cx - 87, BH + 7, 174, 10);
  px(g, cx - 87, BH + 7, 174, 1, '#8E8E99'); px(g, cx - 87, BH + 30, 174, 1, '#3F3F46');
  g.restore();
  px(g, cx - RIM_RX + 20, BH - 2, RIM_RX * 2 - 40, 1, '#C4B5FD');
  // (the neon starbursts in it, unlit glass (lit live), either side of the sign)
  for (const sx of BURSTS) {
    for (let a = 0; a < 12; a++) { const an = a * Math.PI / 6, l = a % 2 ? 6 : 10; g.strokeStyle = '#2A1030'; g.lineWidth = 2; g.beginPath(); g.moveTo(sx + Math.cos(an) * 2, BURST_Y + Math.sin(an) * 2); g.lineTo(sx + Math.cos(an) * l, BURST_Y + Math.sin(an) * l * 0.8); g.stroke(); }
    px(g, sx - 1, BURST_Y - 1, 3, 3, '#3A1A30');
  }
  for (const sx of [cx - 50, cx + 46]) for (let k = 0; k < 3; k++) px(g, sx + k * 2, BH + 12 + k * 6, 2, 2, '#3A1A30');
  // (the LED strip's sockets round its lower edge)
  for (const p of RIM_LEDS) { px(g, p.x - 2, p.y - 2, 4, 4, '#05020B'); px(g, p.x - 1, p.y - 1, 2, 2, '#3A1530'); }
  // (its sign, on the rim's face: DJ ZORP)
  px(g, cx - 40, BH + 11, 80, 22, '#05020B'); px(g, cx - 39, BH + 12, 78, 20, '#1E0B33'); px(g, cx - 39, BH + 12, 78, 1, '#5B21B6');
  for (const sx of [cx - 37, cx + 35]) { px(g, sx, BH + 20, 2, 2, '#71717A'); px(g, sx, BH + 20, 1, 1, '#E4E4E7'); }
  chrome(g, 'DJ ZORP', cx, BH + 15, 1, 2, { shadow: '#6B21A8', glint: false });
};

/** The cabin's back wall (inside the window, behind them): paneled, the record crates on their shelf, the cue
 *  monitor, the reel-to-reel, spare cans on a hook, the back door's frame. */
const paintCabin = (g: Ctx) => {
  const X = DJ.x, Y = DJ.y, w = DJ.w, h = DJ.h;
  px(g, X, Y, w, h, '#0E1A14');
  for (let i = 0; i < 6; i++) { px(g, X + 4 + i * 34, Y + 2, 30, h - 4, i % 2 ? '#14261C' : '#10201A'); g.fillStyle = dith(g, '#0A140F'); g.fillRect(X + 4 + i * 34, Y + h - 30, 30, 26); }
  for (let i = 0; i <= 6; i++) { px(g, X + 2 + i * 34, Y, 2, h, '#24342A'); px(g, X + 2 + i * 34, Y, 1, h, '#3E5246'); }
  px(g, X, Y, w, 2, '#05080A');
  // (the shelf: chrome, two milk crates of records on it, the sleeves standing up out of them)
  px(g, X + 3, Y + 22, 84, 3, '#71717A'); px(g, X + 3, Y + 22, 84, 1, '#D4D4D8'); px(g, X + 3, Y + 25, 84, 1, '#05020B');
  for (const bx of [X + 10, X + 78]) px(g, bx, Y + 26, 3, 6, '#3F3F46');
  ([[X + 5, ['#05020B', '#9A3412', '#EA580C', '#FDBA74']], [X + 46, ['#05020B', '#1E3A8A', '#2563EB', '#93C5FD']]] as const).forEach(([cx0, cr], k) => {
    for (let j = 0; j < 11; j++) {
      const sx = cx0 + 2 + j * 3, sh = 11 + Math.floor(hash(j * 3.1 + k * 7) * 5), col = RECORD_COLS[Math.floor(hash(j * 1.7 + k * 11) * RECORD_COLS.length)];
      px(g, sx, Y + 22 - sh, 3, sh, '#05020B'); px(g, sx, Y + 22 - sh, 2, sh, col); px(g, sx, Y + 22 - sh, 2, 1, '#FFFFFF');
    }
    px(g, cx0, Y + 13, 37, 9, cr[0]); px(g, cx0 + 1, Y + 14, 35, 8, cr[1]); px(g, cx0 + 1, Y + 14, 35, 2, cr[2]); px(g, cx0 + 1, Y + 14, 35, 1, cr[3]);
    for (let s = 0; s < 4; s++) px(g, cx0 + 4 + s * 8, Y + 17, 5, 3, cr[0]);
  });
  // (the cue monitor: a bezel, its green screen (the waveform's live))
  px(g, X + 89, Y + 3, 26, 21, '#05020B'); px(g, X + 90, Y + 4, 24, 19, '#3F3F46'); px(g, X + 90, Y + 4, 24, 1, '#A1A1AA');
  px(g, X + 92, Y + 6, 20, 13, '#052E16'); px(g, X + 92, Y + 12, 20, 1, '#14532D'); px(g, X + 98, Y + 21, 8, 2, '#18181B');
  // (the reel-to-reel: its body, the heads, the tape between; the reels' flanges (their spokes live))
  px(g, X + 117, Y + 2, 35, 32, '#05020B'); px(g, X + 118, Y + 3, 33, 30, '#52525B'); px(g, X + 118, Y + 3, 33, 1, '#D4D4D8'); px(g, X + 149, Y + 4, 2, 29, '#3F3F46');
  for (const r of REELS) { blob(g, r.x, r.y, 7, 7, ['#05050A', '#3B2416', '#5C3A22', '#7C5030', '#A0704A']); g.strokeStyle = '#A1A1AA'; g.lineWidth = 1; g.beginPath(); g.arc(r.x, r.y, 7.5, Math.PI * 1.1, Math.PI * 1.6); g.stroke(); }
  px(g, X + 129, Y + 24, 10, 5, '#18181B'); px(g, X + 130, Y + 25, 3, 3, '#A1A1AA'); px(g, X + 135, Y + 25, 3, 3, '#A1A1AA');
  g.strokeStyle = '#3B2416'; g.lineWidth = 1; g.beginPath(); g.moveTo(REELS[0].x - 6, REELS[0].y + 3); g.lineTo(X + 130, Y + 25); g.lineTo(X + 138, Y + 25); g.lineTo(REELS[1].x + 6, REELS[1].y + 3); g.stroke();
  for (let i = 0; i < 4; i++) { px(g, X + 121 + i * 7, Y + 30, 4, 2, '#18181B'); px(g, X + 121 + i * 7, Y + 30, 4, 1, '#A1A1AA'); }
  // (spare cans on a hook)
  px(g, X + 15, Y + 28, 3, 3, '#A1A1AA');
  g.strokeStyle = '#05020B'; g.lineWidth = 3; g.beginPath(); g.arc(X + 16, Y + 39, 8, Math.PI, 0); g.stroke();
  g.strokeStyle = '#71717A'; g.lineWidth = 1; g.beginPath(); g.arc(X + 16, Y + 39, 8, Math.PI * 1.05, Math.PI * 1.7); g.stroke();
  for (const hx of [X + 6, X + 22]) { px(g, hx, Y + 37, 6, 10, '#05020B'); px(g, hx + 1, Y + 38, 4, 8, '#831843'); px(g, hx + 1, Y + 38, 4, 2, '#EC4899'); }
  hose(g, quad(X + 9, Y + 47, X + 12, Y + 58, X + 4, Y + 64, 6), 1, CABLE, false);
  // (the back door's frame)
  px(g, X + w - 48, Y + 4, 42, h - 4, '#3F3F46'); px(g, X + w - 48, Y + 4, 42, 1, '#A1A1AA');
  print(g, 'EXIT', X + w - 27, Y + 30, 1, 1, ['#4ADE80', '#14532D']);
};

/** The console, in front of them: its deck and its face (chrome-trimmed, the LED strip's sockets, a starburst decal);
 *  the two turntables (plinths, platters, records, the tonearms), the mixer's upright (the VU ladders' sockets, the
 *  fader slots, the knobs) and its crossfader slot, the lava lamp's glass, the plasma ball's globe. */
const paintDesk = (g: Ctx) => {
  const X = DJ.x, w = DJ.w;
  // (the mixer's upright: a dark box, bevelled; VU sockets either side, two fader slots, three knobs)
  px(g, MIX_X - 1, MIX_TOP - 1, 26, DESK_Y - MIX_TOP + 1, '#05020B'); px(g, MIX_X, MIX_TOP, 24, DESK_Y - MIX_TOP, '#27272A'); px(g, MIX_X, MIX_TOP, 24, 1, '#71717A'); px(g, MIX_X + 23, MIX_TOP, 1, DESK_Y - MIX_TOP, '#18181B');
  for (const vx of [MIX_X + 2, MIX_X + 19]) for (let s = 0; s < 6; s++) px(g, vx, MIX_TOP + 3 + s * 3, 3, 2, '#14141A');
  for (const fx of [MIX_X + 8, MIX_X + 15]) px(g, fx, MIX_TOP + 4, 1, 14, '#05020B');
  for (let k = 0; k < 3; k++) { px(g, MIX_X + 10, MIX_TOP + 3 + k * 6, 4, 4, '#05020B'); px(g, MIX_X + 11, MIX_TOP + 4 + k * 6, 2, 2, ['#E4E4E7', '#F472B6', '#22D3EE'][k]); }
  // (the deck: its top surface, the face under it)
  px(g, X, DESK_Y, w, 4, '#3F3A4A'); px(g, X, DESK_Y, w, 1, '#8E8A9A');
  px(g, X, DESK_Y + 4, w, 12, '#1E0B33'); px(g, X, DESK_Y + 4, w, 2, '#D4D4D8'); px(g, X, DESK_Y + 5, w, 1, '#8E8E99'); px(g, X, BH - 2, w, 2, '#52525B');
  g.fillStyle = dith(g, '#2E1065'); g.fillRect(X, DESK_Y + 6, w, 4);
  for (let i = 0; i < 24; i++) px(g, X + 5 + i * 8, BH - 7, 4, 3, '#14061F');
  for (let a = 0; a < 8; a++) { const an = a * Math.PI / 4, l = a % 2 ? 3 : 5; g.strokeStyle = '#A16207'; g.lineWidth = 1; g.beginPath(); g.moveTo(X + w / 2, DESK_Y + 9); g.lineTo(X + w / 2 + Math.cos(an) * l, DESK_Y + 9 + Math.sin(an) * l * 0.6); g.stroke(); }
  // (the crossfader's slot on the deck in front of the upright)
  px(g, MIX_X + 3, DESK_Y + 1, 18, 2, '#05020B');
  // (the turntables: plinth, platter, record and its grooves, the tonearm on its pivot)
  for (const tx of DECKS) {
    px(g, tx - 22, DESK_Y - 4, 44, 6, '#05020B'); px(g, tx - 21, DESK_Y - 3, 42, 4, '#27272A'); px(g, tx - 21, DESK_Y - 3, 42, 1, '#71717A');
    g.fillStyle = '#05050A'; g.beginPath(); g.ellipse(tx, DESK_Y - 5, 17, 4.5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#52525B'; g.beginPath(); g.ellipse(tx, DESK_Y - 5.5, 16, 4, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#111114'; g.beginPath(); g.ellipse(tx, DESK_Y - 6, 15, 3.4, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#26262E'; g.lineWidth = 1; for (const r of [12, 9]) { g.beginPath(); g.ellipse(tx, DESK_Y - 6, r, r * 0.23, 0, 0, Math.PI * 2); g.stroke(); }
    g.strokeStyle = '#3F3F46'; g.beginPath(); g.ellipse(tx, DESK_Y - 6, 13, 3, 0, Math.PI * 1.15, Math.PI * 1.45); g.stroke();
    px(g, tx + 17, DESK_Y - 9, 4, 4, '#18181B'); px(g, tx + 18, DESK_Y - 8, 2, 2, '#A1A1AA');
    g.strokeStyle = '#05020B'; g.lineWidth = 2; g.beginPath(); g.moveTo(tx + 19, DESK_Y - 8); g.lineTo(tx + 9, DESK_Y - 6); g.stroke();
    g.strokeStyle = '#D4D4D8'; g.lineWidth = 1; g.beginPath(); g.moveTo(tx + 19, DESK_Y - 8.5); g.lineTo(tx + 9, DESK_Y - 6.5); g.stroke();
    px(g, tx + 7, DESK_Y - 7, 3, 2, '#E4E4E7');
    px(g, tx - 20, DESK_Y - 1, 3, 2, '#05020B'); px(g, tx - 15, DESK_Y - 1, 3, 2, '#05020B');
  }
  // (the lava lamp: chrome cone foot and cap, the glass between; the plasma ball's globe on its black base)
  px(g, LAVA_X - 5, DESK_Y - 4, 10, 4, '#05020B'); px(g, LAVA_X - 4, DESK_Y - 4, 8, 3, '#A1A1AA'); px(g, LAVA_X - 4, DESK_Y - 4, 8, 1, '#F4F4F5');
  g.fillStyle = '#05020B'; g.beginPath(); g.moveTo(LAVA_X - 3, BH - 40); g.lineTo(LAVA_X + 3, BH - 40); g.lineTo(LAVA_X + 5, DESK_Y - 4); g.lineTo(LAVA_X - 5, DESK_Y - 4); g.closePath(); g.fill();
  g.fillStyle = '#7C2D12'; g.beginPath(); g.moveTo(LAVA_X - 2, BH - 39); g.lineTo(LAVA_X + 2, BH - 39); g.lineTo(LAVA_X + 4, DESK_Y - 4); g.lineTo(LAVA_X - 4, DESK_Y - 4); g.closePath(); g.fill();
  px(g, LAVA_X - 3, BH - 43, 6, 4, '#A1A1AA'); px(g, LAVA_X - 3, BH - 43, 6, 1, '#F4F4F5');
  px(g, PLASMA.x - 6, DESK_Y - 5, 12, 5, '#05020B'); px(g, PLASMA.x - 5, DESK_Y - 5, 10, 1, '#52525B');
  blob(g, PLASMA.x, PLASMA.y, PLASMA.r, PLASMA.r, ['#05020B', '#1E0B33', '#2E1065', '#3B0F7A', '#6D28D9']);
};

/** The booth's live bits, in front of them: the records turning, the VU meters, faders, the LED chase on the beat, the
 *  lava lamp, the plasma ball. `run`: the gear's on (the show's going, or they're at it). */
const deskLive = (c: Ctx, f: number, run: boolean, on: boolean) => {
  const ph = (f % BEAT) / BEAT, kick = on ? Math.pow(1 - ph, 1.6) : 0;
  // (the records: their labels, a mark on each turning round, a glint off the grooves)
  DECKS.forEach((tx, i) => {
    const a = run ? f * 0.26 * (i ? 1 : 1.04) + i : 0.6, y = DESK_Y - 6;
    c.fillStyle = i ? '#22D3EE' : '#F472B6'; c.beginPath(); c.ellipse(tx, y, 5, 1.4, 0, 0, Math.PI * 2); c.fill();
    px(c, tx + Math.cos(a) * 3.5 - 1, y + Math.sin(a) * 0.9 - 0.5, 2, 1, '#FFFFFF');
    px(c, tx + Math.cos(a + Math.PI) * 11 - 1, y + Math.sin(a + Math.PI) * 2.5 - 0.5, 3, 1, '#71717A');
    px(c, tx, y, 1, 1, '#E4E4E7');
  });
  // (the VU ladders: green, green... yellow, red; up on the kick)
  for (let k = 0; k < 2; k++) {
    const lv = on ? Math.min(1, kick * 0.85 + hash(Math.floor(f / 3) * 1.3 + k * 9.7) * 0.3) : run ? 0.15 : 0, n = Math.round(lv * 6);
    for (let s = 0; s < n; s++) px(c, MIX_X + (k ? 19 : 2), MIX_TOP + 3 + (5 - s) * 3, 3, 2, s >= 5 ? '#EF4444' : s >= 4 ? '#FDE047' : '#4ADE80');
  }
  // (the channel faders, riding a little each bar; the crossfader cutting on the beat)
  const bar = Math.floor(f / (BEAT * 4));
  for (let k = 0; k < 2; k++) { const fy = MIX_TOP + 4 + Math.round((run ? hash(bar * 2.1 + k * 5.3) : 0.5) * 10); px(c, MIX_X + 7 + k * 7, fy, 3, 3, '#05020B'); px(c, MIX_X + 7 + k * 7, fy, 3, 1, '#F4F4F5'); }
  const xf = MIX_X + 4 + Math.round((run ? (Math.floor(f / BEAT) % 2 ? 0.8 : 0.2) + Math.sin(f * 0.07) * 0.15 : 0.5) * 12);
  px(c, xf, DESK_Y, 3, 3, '#05020B'); px(c, xf, DESK_Y, 3, 1, '#E4E4E7');
  // (the LED strip in the console's face: chasing, all of it flashing on the kick)
  if (on) for (let i = 0; i < 24; i++) {
    const lit = ph < 0.1 || (i + Math.floor(f / 3)) % 6 < 2 || (24 - i + Math.floor(f / 3)) % 6 === 0;
    if (lit) px(c, DJ.x + 5 + i * 8, BH - 7, 4, 3, ['#F472B6', '#22D3EE', '#FDE047'][(i + Math.floor(f / BEAT)) % 3]);
  }
  // (the lava lamp: two blobs of wax rising and sinking)
  for (let k = 0; k < 2; k++) {
    const u = (Math.sin(f * 0.02 + k * 2.4) + 1) / 2, y = BH - 22 - u * 13 + k * 4, r = 2 + k;
    c.fillStyle = '#F97316'; c.beginPath(); c.ellipse(LAVA_X + (k ? 1 : -1), y, r, r + 1, 0, 0, Math.PI * 2); c.fill();
    px(c, LAVA_X - 1 + (k ? 1 : -1), y - r, 1, 1, '#FED7AA');
  }
  px(c, LAVA_X - 3, DESK_Y - 6, 6, 2, '#EA580C');
  // (the plasma ball: arcs out from the core, jumping every few frames)
  const p = PLASMA, seed = Math.floor(f / 4);
  c.lineWidth = 1;
  for (let k = 0; k < 3; k++) {
    const an = hash(seed * 1.9 + k * 3.7) * Math.PI * 2, mid = an + (hash(seed + k) - 0.5);
    c.strokeStyle = k ? '#E879F9' : '#F5D0FE'; c.beginPath(); c.moveTo(p.x, p.y);
    c.lineTo(p.x + Math.cos(mid) * 3.5, p.y + Math.sin(mid) * 3.5); c.lineTo(p.x + Math.cos(an) * (p.r - 1), p.y + Math.sin(an) * (p.r - 1)); c.stroke();
  }
  px(c, p.x - 1, p.y - 1, 3, 3, '#FFFFFF');
};

/** The pod's live bits outside: the rim's neon starbursts and LED strip on the beat, the beacon blinking, the speakers'
 *  cones pumping, the mirror ball's glints sliding over it all. */
const boothOutLive = (c: Ctx, state: GameState, f: number, on: boolean) => {
  const ph = (f % BEAT) / BEAT, beat = Math.floor(f / BEAT);
  // (the beacon on the dome: on with each beat)
  if (ph < 0.35) { px(c, BCX - 3, DJ.y - 63, 6, 6, '#FCA5A5'); px(c, BCX - 2, DJ.y - 62, 2, 2, '#FFFFFF'); }
  // (the speakers: each woofer's cone out on the kick, its dust cap catching the light)
  if (on && ph < 0.2) for (const sx of STACKS) {
    if (!shown(state, sx, sx + 80)) continue;
    for (let k = 0; k < 2; k++) for (let i = 0; i < 2; i++) {
      const x = sx + 40, y = GY - 130 - k * 124 + 30 + i * 60, s = ph < 0.1 ? 1 : 0;
      c.fillStyle = '#5A5A6A'; c.beginPath(); c.ellipse(x, y, 15 + s, 15 + s, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#3F3F4C'; c.beginPath(); c.ellipse(x, y, 12 + s, 12 + s, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#A1A1AA'; c.beginPath(); c.ellipse(x - 1, y - 1, 6 + s, 6 + s, 0, 0, Math.PI * 2); c.fill();
      px(c, x - 3, y - 4, 2, 2, '#F4F4F5');
    }
  }
  if (!on) return;
  // (the neon starbursts: pink left, cyan right; the long rays on the beat, the short ones between)
  BURSTS.forEach((sx, k) => {
    const hot = k ? ['#0E7490', '#22D3EE', '#ECFEFF'] : ['#9D174D', '#EC4899', '#FDF2F8'], longs = ph < 0.5;
    for (let a = 0; a < 12; a++) {
      if ((a % 2 === 0) !== longs && ph > 0.1) continue;
      const an = a * Math.PI / 6, l = a % 2 ? 6 : 10, x0 = sx + Math.cos(an) * 2, y0 = BURST_Y + Math.sin(an) * 2, x1 = sx + Math.cos(an) * l, y1 = BURST_Y + Math.sin(an) * l * 0.8;
      c.strokeStyle = hot[1]; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
      c.strokeStyle = hot[2]; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
    }
    px(c, sx - 1, BURST_Y - 1, 3, 3, '#FFFFFF');
  });
  for (const sx of [BCX - 50, BCX + 46]) for (let k = 0; k < 3; k++) if ((k + beat) % 3 !== 0) px(c, sx + k * 2, BH + 12 + k * 6, 2, 2, '#FDE047');
  // (the LED strip round the rim: a chase both ways, meeting in the middle; all on with the kick)
  const n = RIM_LEDS.length;
  RIM_LEDS.forEach((p, i) => {
    const j = Math.min(i, n - 1 - i), lit = ph < 0.08 || (j - Math.floor(f / 3) % 11 + 11) % 11 < 3;
    if (lit) { px(c, p.x - 1, p.y - 1, 2, 2, ['#F472B6', '#A78BFA', '#22D3EE', '#FDE047'][(j + beat) % 4]); }
  });
  // (the mirror ball's glints: a few spots sliding over the dome, the frame and the rim)
  for (let k = 0; k < 6; k++) {
    const u = (f * 0.0035 + k * 0.173) % 1, x = BCX - RIM_RX + 10 + u * (RIM_RX * 2 - 20), d = (x - BCX) / RIM_RX;
    const y = k % 3 === 0 ? DJ.y - 8 - Math.sqrt(Math.max(0, 1 - d * d * 1.8)) * 24 + 6 : k % 3 === 1 ? DJ.y - 5 : RIM_Y - Math.sqrt(Math.max(0, 1 - d * d)) * (RIM_RY - 3);
    if (k % 3 === 0 && Math.abs(d) > 0.7) continue;
    if (k % 3 === 1 && Math.abs(x - BCX) > DJ.w / 2 + 8) continue;
    px(c, x - 1, y - 1, 3, 3, k % 2 ? '#F5F3FF' : '#FBCFE8'); px(c, x - 3, y, 7, 1, 'rgba(255, 255, 255, 0.7)'); px(c, x, y - 3, 1, 7, 'rgba(255, 255, 255, 0.7)');
  }
};

const paintFixtures = (g: Ctx) => {
  // (the lighting truss along the ceiling: two chrome chords, a zigzag between, its hangers)
  for (const y of [TRUSS_Y - 10, TRUSS_Y + 10]) { px(g, DISCO_L - 40, y - 2, W + 80, 5, '#18181B'); px(g, DISCO_L - 40, y - 1, W + 80, 3, '#8E8E99'); px(g, DISCO_L - 40, y - 1, W + 80, 1, '#E4E4E7'); }
  g.strokeStyle = '#6B6B76'; g.lineWidth = 2; g.beginPath();
  for (let x = DISCO_L - 40, k = 0; x < DISCO_R + 40; x += 16, k++) { g.lineTo(x, k % 2 ? TRUSS_Y + 9 : TRUSS_Y - 9); }
  g.stroke();
  // (the hangers up to the ceiling: chrome rods, a clamp on the top chord, a turnbuckle half way)
  for (let x = DISCO_L + 100; x < DISCO_R; x += 420) {
    tube(g, x + 1, GY - 600, x + 1, TRUSS_Y - 12, 3, CHROME);
    const mY = Math.round((GY - 600 + TRUSS_Y) / 2);
    px(g, x - 3, mY - 6, 9, 12, '#05050A'); px(g, x - 2, mY - 5, 7, 10, '#52525B'); px(g, x - 2, mY - 5, 7, 1, '#D4D4D8'); px(g, x, mY - 3, 3, 6, '#18181B');
    px(g, x - 6, TRUSS_Y - 15, 15, 7, '#05050A'); px(g, x - 5, TRUSS_Y - 14, 13, 5, '#3F3F46'); px(g, x - 5, TRUSS_Y - 14, 13, 1, '#A1A1AA'); px(g, x + 6, TRUSS_Y - 13, 1, 3, '#D4D4D8');
  }
  // (the par cans under it: a C-clamp on the bottom chord, the yoke round each can, the can (banded round, ribbed,
  // inked), its lens ring and the gel's frame; the lens dark glass (lit live))
  const CAN = ['#05050A', '#18181D', '#2A2A33', '#3F3F4C', '#5A5A6A', '#44444F', '#2A2A33', '#1E1E24', '#18181D', '#101014', '#05050A'];
  for (const cn of CANS) {
    const x = Math.round(cn.x), y = TRUSS_Y + 16, L = TILE[cn.col];
    // (the clamp)
    px(g, x - 5, TRUSS_Y + 7, 10, 8, '#05050A'); px(g, x - 4, TRUSS_Y + 8, 8, 6, '#3F3F46'); px(g, x - 4, TRUSS_Y + 8, 8, 1, '#8E8E99'); px(g, x + 3, TRUSS_Y + 6, 3, 3, '#A1A1AA');
    // (the yoke: a U of flat steel round the can, its pivot knobs either side)
    px(g, x - 2, TRUSS_Y + 14, 4, 4, '#18181B');
    px(g, x - 15, y - 1, 30, 4, '#05050A'); px(g, x - 14, y, 28, 2, '#52525B'); px(g, x - 14, y, 28, 1, '#A1A1AA');
    for (const ax of [x - 15, x + 12]) { px(g, ax, y - 1, 4, 18, '#05050A'); px(g, ax + 1, y, 2, 16, '#52525B'); px(g, ax + 1, y, 1, 16, '#8E8E99'); }
    for (const kx of [x - 14, x + 13]) blob(g, kx, y + 14, 2.5, 2.5, CHROME);
    // (the can: inked, banded round in steps, its ribs (dark grooves, a lit row over each), the rim flared at its foot)
    g.fillStyle = '#05050A'; g.beginPath(); g.roundRect(x - 11, y, 22, 26, 3); g.fill();
    CAN.forEach((col, i) => { if (i && i < CAN.length - 1) px(g, x - 11 + i * 2, y + 2, 2, 20, col); });
    for (let r = 0; r < 4; r++) { px(g, x - 9, y + 4 + r * 5, 18, 1, '#05050A'); px(g, x - 9, y + 5 + r * 5, 18, 1, 'rgba(138, 138, 154, 0.35)'); }
    px(g, x - 12, y + 21, 24, 5, '#05050A'); px(g, x - 11, y + 22, 22, 3, '#3F3F46'); px(g, x - 11, y + 22, 22, 1, '#A1A1AA'); px(g, x - 11, y + 22, 3, 3, '#71717A');
    // (the gel frame's edge in its slot, the gel's color showing; the lens: dark glass, stippled)
    px(g, x - 10, y + 21, 20, 1, L[2]);
    px(g, x - 9, y + 24, 18, 6, '#05050A'); px(g, x - 8, TRUSS_Y + 40, 16, 4, L[1]);
    g.fillStyle = dith(g, L[0]); g.fillRect(x - 8, TRUSS_Y + 42, 16, 2);
    px(g, x - 6, TRUSS_Y + 40, 3, 1, L[2]);
    // (the safety cable: a loop up round the chord)
    g.strokeStyle = '#71717A'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 7, y + 2); g.quadraticCurveTo(x + 14, TRUSS_Y + 4, x + 6, TRUSS_Y + 8); g.stroke();
  }
  // (the pillars)
  for (const x of [DISCO_L + 260, DISCO_L + 1060, DISCO_L + 1560, DISCO_R - 40]) pillar(g, x);
  // (the speaker stacks round the booth)
  for (const sx of STACKS) speakers(g, sx);
  booth(g);
  // (the bar at the far end: the back bar (a chrome frame, its mirror in panels, the hall's color streaking down it, the
  // glass shelves lit from under, the bottles shaped and labelled); the sign; the counter (dim: it's no ledge); the
  // padded front, its foot rail and kick strip; the stools)
  const bx = DISCO_R - 300;
  px(g, bx - 6, GY - 254, 252, 146, '#05020B'); px(g, bx - 4, GY - 252, 248, 142, '#3F3F46'); px(g, bx - 4, GY - 252, 248, 1, '#A1A1AA'); px(g, bx - 4, GY - 252, 1, 142, '#71717A'); px(g, bx + 243, GY - 251, 1, 141, '#18181B');
  const MIR = ['#120C24', '#181030', '#1E1638', '#241B44', '#1E1638', '#181030'];
  for (let i = 0; i < 6; i++) {
    const mx = bx + 1 + i * 40, my = GY - 247, mw = 38, mh = 133;
    px(g, mx - 1, my - 1, mw + 2, mh + 2, '#05020B');
    MIR.forEach((col, k) => px(g, mx, my + Math.round(k * mh / MIR.length), mw, Math.ceil(mh / MIR.length), col));
    // (the reflections: slanted streaks, a hard one and its dithered fringe, the hall's pink and cyan caught in them)
    g.save(); g.beginPath(); g.rect(mx, my, mw, mh); g.clip();
    for (const [o, sw, col] of [[4, 5, '#3A3060'], [16, 2, '#4A4078'], [26, 3, i % 2 ? '#3A2050' : '#203A50']] as const) {
      g.fillStyle = col; g.beginPath(); g.moveTo(mx + o + 30, my); g.lineTo(mx + o + 30 + sw, my); g.lineTo(mx + o + sw - 10, my + mh); g.lineTo(mx + o - 10, my + mh); g.closePath(); g.fill();
      g.fillStyle = dith(g, col, 1, i % 2); g.beginPath(); g.moveTo(mx + o + 30 + sw, my); g.lineTo(mx + o + 34 + sw, my); g.lineTo(mx + o + sw - 6, my + mh); g.lineTo(mx + o + sw - 10, my + mh); g.closePath(); g.fill();
    }
    g.restore();
    px(g, mx, my, mw, 1, '#5A4E8A');
  }
  const BOT: Ramp[] = [['#05020B', '#14532D', '#15803D', '#4ADE80', '#DCFCE7'], ['#05020B', '#78350F', '#B45309', '#F59E0B', '#FEF3C7'], ['#05020B', '#831843', '#BE185D', '#F472B6', '#FCE7F3'], ['#05020B', '#164E63', '#0E7490', '#22D3EE', '#ECFEFF'], ['#05020B', '#713F12', '#CA8A04', '#FDE047', '#FEFCE8']];
  for (const sy of [GY - 200, GY - 150]) {
    for (let i = 0; i < 16; i++) {
      const x = Math.round(bx + 6 + i * 14.5), h = Math.round(18 + hash(i * 3.3 + sy) * 14), r = BOT[Math.floor(hash(i + sy) * 5)], top = sy - h;
      // (each: inked, its shoulder narrowing to the neck, the foil cap; shaded round, a label, a glint down it)
      px(g, x - 1, top + 5, 10, h - 5, r[0]); px(g, x + 2, top - 1, 4, 8, r[0]);
      px(g, x, top + 6, 8, h - 6, r[1]); px(g, x + 1, top + 6, 4, h - 6, r[2]); px(g, x + 1, top + 7, 1, h - 9, r[3]);
      px(g, x + 1, top + 5, 6, 1, r[1]); px(g, x + 3, top, 2, 6, r[1]); px(g, x + 3, top, 1, 6, r[2]);
      px(g, x + 2, top - 1, 4, 2, i % 3 ? '#A1A1AA' : '#CA8A04'); px(g, x + 2, top - 1, 4, 1, '#F4F4F5');
      const ly = top + Math.round(h * 0.5);
      px(g, x, ly, 8, 6, '#E7E5E4'); px(g, x, ly, 8, 1, '#FFFFFF'); px(g, x + 6, ly, 2, 6, '#A8A29E'); px(g, x + 1, ly + 2, 4, 1, r[1]); px(g, x + 1, ly + 4, 3, 1, '#78716C');
      px(g, x + 2, top + 8, 1, 3, r[4]);
    }
    // (the glass shelf: its chrome edge, lit from under (a teal strip, its light stippled down the mirror))
    px(g, bx, sy, 240, 4, '#05020B'); px(g, bx, sy, 240, 3, '#A1A1AA'); px(g, bx, sy, 240, 1, '#F4F4F5');
    px(g, bx, sy + 3, 240, 1, '#5EEAD4'); g.fillStyle = dith(g, 'rgba(45, 212, 191, 0.45)'); g.fillRect(bx, sy + 4, 240, 4); g.fillStyle = dith(g, 'rgba(45, 212, 191, 0.25)', 2, 1); g.fillRect(bx, sy + 8, 240, 6);
  }
  // (its sign over the back bar: a lit box on two rods (a chrome frame, the box's face backlit, banded), the words in
  // the park's marquee type)
  for (const rx of [bx + 60, bx + 180]) { tube(g, rx, GY - 300, rx, GY - 276, 2, CHROME); px(g, rx - 3, GY - 281, 7, 4, '#05020B'); px(g, rx - 2, GY - 280, 5, 2, '#71717A'); }
  px(g, bx + 42, GY - 278, 156, 26, '#05020B'); px(g, bx + 43, GY - 277, 154, 24, '#71717A'); px(g, bx + 43, GY - 277, 154, 1, '#E4E4E7'); px(g, bx + 43, GY - 254, 154, 1, '#27272A');
  px(g, bx + 45, GY - 275, 150, 20, '#0F2A2A'); px(g, bx + 45, GY - 275, 150, 6, '#123434'); g.fillStyle = dith(g, '#164040'); g.fillRect(bx + 45, GY - 269, 150, 4);
  px(g, bx + 45, GY - 275, 150, 1, '#2DD4BF'); px(g, bx + 45, GY - 256, 150, 1, '#042F2E');
  for (const sx of [bx + 47, bx + 191]) { px(g, sx, GY - 266, 2, 2, '#A1A1AA'); px(g, sx, GY - 266, 1, 1, '#FFFFFF'); }
  square(g, 'COSMIC COCKTAILS', bx + 120, GY - 272, 1, 2, ['#042F2E', '#0F766E', '#2DD4BF', '#5EEAD4', '#CCFBF1'], { spacing: 1 });
  // (the front: inked, the padding (the tufts, the pink vinyl), shaded under the counter's lip, darker to the floor,
  // chrome battens between its bays)
  g.fillStyle = '#05020B'; g.beginPath(); g.roundRect(bx - 4, GY - 94, 248, 94, 6); g.fill();
  g.fillStyle = tufted(g); g.fillRect(bx, GY - 82, 240, 78);
  px(g, bx, GY - 82, 240, 78, 'rgba(219, 39, 119, 0.35)');
  px(g, bx, GY - 82, 240, 3, 'rgba(10, 2, 18, 0.6)'); g.fillStyle = dith(g, 'rgba(10, 2, 18, 0.55)'); g.fillRect(bx, GY - 79, 240, 4);
  g.fillStyle = dith(g, 'rgba(10, 2, 18, 0.5)', 2, 1); g.fillRect(bx, GY - 30, 240, 16);
  for (const sx of [bx, bx + 118, bx + 236]) { px(g, sx, GY - 82, 4, 68, '#05020B'); px(g, sx + 1, GY - 82, 2, 68, '#52525B'); px(g, sx + 1, GY - 82, 1, 68, '#A1A1AA'); }
  // (the counter: mahogany, its edge rolled, lit only dimly)
  px(g, bx - 4, GY - 94, 248, 12, '#05020B'); px(g, bx - 3, GY - 93, 246, 10, '#3A140E'); g.fillStyle = dith(g, '#4A1C12', 2, 1); g.fillRect(bx - 3, GY - 92, 246, 4);
  px(g, bx - 3, GY - 93, 246, 1, '#5C2618'); px(g, bx - 3, GY - 87, 246, 3, '#2A0E0A'); px(g, bx - 3, GY - 84, 246, 1, '#160604');
  // (the kick strip: chrome, banded; the foot rail on its brackets)
  for (let k = 0; k < 4; k++) px(g, bx, GY - 14 + k * 3, 240, 3, ['#D4D4D8', '#8E8E99', '#52525B', '#27272A'][k]);
  for (const fx of [bx + 14, bx + 90, bx + 150, bx + 226]) { px(g, fx - 1, GY - 30, 4, 10, '#05020B'); px(g, fx, GY - 30, 2, 10, '#71717A'); }
  tube(g, bx + 4, GY - 22, bx + 236, GY - 22, 5, CHROME);
  // (the stools: the base (a stepped disc), a chrome stem, the foot ring; the seat a cushion (its side band, its top
  // shaded round, its button))
  for (let i = 0; i < 4; i++) {
    const sx = bx + 30 + i * 60;
    g.fillStyle = '#05020B'; g.beginPath(); g.ellipse(sx, GY - 4, 13, 4, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#3F3F46'; g.beginPath(); g.ellipse(sx, GY - 5, 12, 3, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#A1A1AA'; g.beginPath(); g.ellipse(sx - 2, GY - 6, 7, 1.5, 0, 0, Math.PI * 2); g.fill();
    tube(g, sx, GY - 52, sx, GY - 6, 4, CHROME);
    g.lineWidth = 3; g.strokeStyle = '#05020B'; g.beginPath(); g.ellipse(sx, GY - 26, 10, 3, 0, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 1; g.strokeStyle = '#71717A'; g.beginPath(); g.ellipse(sx, GY - 26, 10, 3, 0, 0, Math.PI); g.stroke();
    g.strokeStyle = '#C9CBD3'; g.beginPath(); g.ellipse(sx, GY - 26, 10, 3, 0, Math.PI, Math.PI * 2); g.stroke();
    g.fillStyle = '#05020B'; g.beginPath(); g.ellipse(sx, GY - 53, 15, 7, 0, 0, Math.PI * 2); g.fill(); g.fillRect(sx - 15, GY - 60, 30, 7);
    g.fillStyle = '#831843'; g.beginPath(); g.ellipse(sx, GY - 54, 14, 6, 0, 0, Math.PI * 2); g.fill(); g.fillRect(sx - 14, GY - 59, 28, 5);
    g.fillStyle = '#9D174D'; g.fillRect(sx - 14, GY - 58, 8, 4);
    g.fillStyle = '#DB2777'; g.beginPath(); g.ellipse(sx, GY - 59, 14, 6, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = dith(g, '#F472B6'); g.beginPath(); g.ellipse(sx - 2, GY - 60, 11, 4.5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#F472B6'; g.beginPath(); g.ellipse(sx - 3, GY - 61, 7, 2.5, 0, 0, Math.PI * 2); g.fill();
    px(g, sx - 6, GY - 63, 3, 1, '#FCE7F3'); px(g, sx - 1, GY - 60, 2, 1, '#500724');
  }
  // (the extinguisher's cabinet on the wall: red enamel (inked, bevelled, its side face in shade), the chrome-framed
  // glass door (dark, streaked), hinges, the latch; the sign over it: a backlit red box, a flame, IN CASE OF FIRE)
  const ex = EXTINGUISHER_X;
  px(g, ex - 22, GY - 152, 44, 74, '#05020B'); px(g, ex - 20, GY - 150, 40, 70, '#991B1B');
  px(g, ex - 20, GY - 150, 40, 3, '#EF4444'); px(g, ex - 20, GY - 150, 40, 1, '#FCA5A5'); px(g, ex - 20, GY - 147, 2, 67, '#B91C1C'); px(g, ex - 20, GY - 82, 40, 2, '#450A0A');
  g.fillStyle = dith(g, '#7F1D1D'); g.fillRect(ex - 18, GY - 92, 32, 10);
  px(g, ex + 14, GY - 147, 6, 67, '#7F1D1D'); px(g, ex + 14, GY - 147, 1, 67, '#5A0F0F');
  px(g, ex - 17, GY - 145, 32, 60, '#05020B'); px(g, ex - 16, GY - 144, 30, 58, '#A1A1AA'); px(g, ex - 16, GY - 144, 30, 1, '#F4F4F5'); px(g, ex - 16, GY - 144, 1, 58, '#D4D4D8'); px(g, ex + 13, GY - 143, 1, 57, '#52525B'); px(g, ex - 16, GY - 87, 30, 1, '#3F3F46');
  px(g, ex - 14, GY - 142, 26, 54, '#1A0606'); g.fillStyle = dith(g, '#2A0A0A'); g.fillRect(ex - 14, GY - 112, 26, 24); px(g, ex - 14, GY - 142, 26, 3, '#0A0202');
  for (const [o, sw, a] of [[0, 3, 0.26], [7, 1, 0.2]] as const) { g.fillStyle = `rgba(255, 255, 255, ${a})`; g.beginPath(); g.moveTo(ex - 6 + o, GY - 142); g.lineTo(ex - 6 + o + sw, GY - 142); g.lineTo(ex - 14 + o + sw, GY - 112); g.lineTo(ex - 14 + o, GY - 112); g.closePath(); g.fill(); }
  for (const hy of [GY - 138, GY - 96]) { px(g, ex - 19, hy, 3, 6, '#05020B'); px(g, ex - 18, hy + 1, 1, 4, '#D4D4D8'); }
  px(g, ex + 9, GY - 120, 3, 10, '#05020B'); px(g, ex + 10, GY - 119, 1, 8, '#E4E4E7');
  const sgx = ex - 36, sgy = GY - 180;
  px(g, sgx - 1, sgy - 1, 74, 25, '#05020B');
  for (let k = 0; k < 5; k++) px(g, sgx, sgy + k * 5, 72, 5, ['#DC2626', '#D02020', '#C81E1E', '#B91C1C', '#991B1B'][k]);
  px(g, sgx, sgy, 72, 1, '#FCA5A5'); px(g, sgx, sgy + 22, 72, 1, '#450A0A');
  px(g, sgx + 2, sgy + 2, 68, 1, '#FECACA'); px(g, sgx + 2, sgy + 20, 68, 1, '#FECACA'); px(g, sgx + 2, sgy + 2, 1, 19, '#FECACA'); px(g, sgx + 69, sgy + 2, 1, 19, '#FECACA');
  // (the flame: stepped, white with its yellow core)
  const fl = [[3, 0, 1], [2, 1, 3], [1, 2, 4], [1, 3, 5], [0, 4, 7], [0, 5, 7], [0, 6, 7], [0, 7, 7], [1, 8, 5], [2, 9, 3]];
  for (const [ox, oy, w] of fl) px(g, sgx + 6 + ox, sgy + 4 + oy * 1.4, w, 2, '#FFFFFF');
  for (const [ox, oy, w] of fl) if (oy > 3) px(g, sgx + 7 + ox, sgy + 5 + oy * 1.4, Math.max(1, w - 2), 1, '#FDE047');
  print(g, 'IN CASE', sgx + 42, sgy + 4, 1, 1, ['#FFFFFF', '#FEE2E2'], { shadow: '#450A0A' });
  print(g, 'OF FIRE', sgx + 42, sgy + 13, 1, 1, ['#FFFFFF', '#FEE2E2'], { shadow: '#450A0A' });
  // (the refill's alcove by the door: recessed in the wall (its header's shadow, the left jamb's face, the back wall
  // banded), a downlight in its head; the first-aid cabinet (white enamel, inked, bevelled; the cross, shaded); its plate)
  const rx = REFILL_X;
  px(g, rx - 32, GY - 152, 76, 152, '#05020B');
  ['#14123A', '#181540', '#1B1846', '#1E1B4B', '#211E52'].forEach((col, k) => px(g, rx - 30, GY - 150 + k * 30, 72, 30, col));
  g.fillStyle = '#312E81'; g.beginPath(); g.moveTo(rx - 30, GY - 150); g.lineTo(rx - 22, GY - 142); g.lineTo(rx - 22, GY - 6); g.lineTo(rx - 30, GY); g.closePath(); g.fill();
  px(g, rx - 30, GY - 150, 1, 150, '#4338CA'); px(g, rx - 22, GY - 142, 1, 136, '#1E1B4B');
  px(g, rx - 30, GY - 150, 72, 4, '#0A0920'); g.fillStyle = dith(g, '#0A0920'); g.fillRect(rx - 22, GY - 146, 64, 6);
  px(g, rx - 34, GY - 156, 80, 5, '#05020B'); px(g, rx - 33, GY - 155, 78, 3, '#71717A'); px(g, rx - 33, GY - 155, 78, 1, '#D4D4D8');
  px(g, rx + 1, GY - 146, 12, 4, '#05020B'); px(g, rx + 2, GY - 145, 10, 2, '#FFF7ED');
  g.fillStyle = dith(g, 'rgba(255, 245, 230, 0.10)'); g.beginPath(); g.moveTo(rx + 2, GY - 142); g.lineTo(rx + 12, GY - 142); g.lineTo(rx + 34, GY - 6); g.lineTo(rx - 20, GY - 6); g.closePath(); g.fill();
  px(g, rx - 22, GY - 6, 64, 6, '#0E0C2A');
  px(g, rx - 18, GY - 134, 36, 36, '#05020B'); px(g, rx - 17, GY - 133, 34, 34, '#E7E5E4'); px(g, rx - 17, GY - 133, 34, 3, '#FFFFFF'); px(g, rx - 17, GY - 133, 1, 34, '#FFFFFF');
  g.fillStyle = dith(g, '#D6D3D1'); g.fillRect(rx - 16, GY - 112, 28, 13); px(g, rx - 17, GY - 100, 34, 1, '#78716C');
  px(g, rx + 12, GY - 130, 5, 31, '#A8A29E'); px(g, rx + 12, GY - 130, 1, 31, '#78716C');
  px(g, rx + 9, GY - 120, 2, 6, '#57534E');
  px(g, rx - 4, GY - 129, 8, 24, '#7F1D1D'); px(g, rx - 11, GY - 121, 22, 8, '#7F1D1D');
  px(g, rx - 3, GY - 128, 6, 22, '#DC2626'); px(g, rx - 10, GY - 120, 20, 6, '#DC2626');
  px(g, rx - 3, GY - 128, 2, 22, '#F87171'); px(g, rx - 10, GY - 120, 20, 1, '#F87171'); px(g, rx + 1, GY - 114, 2, 8, '#991B1B'); px(g, rx - 10, GY - 115, 20, 1, '#991B1B');
  const fw = 56;
  px(g, rx - fw / 2 - 1, GY - 93, fw + 2, 12, '#05020B'); px(g, rx - fw / 2, GY - 92, fw, 10, '#B91C1C'); px(g, rx - fw / 2, GY - 92, fw, 1, '#F87171'); px(g, rx - fw / 2, GY - 83, fw, 1, '#7F1D1D');
  print(g, 'FIRST AID', rx, GY - 91, 1, 1, ['#FFFFFF', '#FEE2E2'], { shadow: '#450A0A' });
};

/** The neon's board, still: its rods up to the truss (clamped), the board (inked, a chrome frame banded round it, riveted,
 *  its black backing banded and stippled so the glass reads off it), the bulb row's sockets along its foot. */
const paintNeonBoard = (g: Ctx) => {
  const N = NEON;
  for (const rx of [N.x + 24, N.x + N.w - 26]) {
    tube(g, rx + 1, TRUSS_Y + 12, rx + 1, N.y - 2, 2, CHROME);
    px(g, rx - 3, TRUSS_Y + 9, 9, 5, '#05020B'); px(g, rx - 2, TRUSS_Y + 10, 7, 3, '#52525B'); px(g, rx - 2, TRUSS_Y + 10, 7, 1, '#A1A1AA');
    px(g, rx - 4, N.y - 6, 11, 5, '#05020B'); px(g, rx - 3, N.y - 5, 9, 3, '#71717A'); px(g, rx - 3, N.y - 5, 9, 1, '#D4D4D8');
  }
  px(g, N.x - 4, N.y - 4, N.w + 8, N.h + 8, '#05020B');
  const fr = ['#E4E4E7', '#A1A1AA', '#71717A', '#3F3F46'];
  fr.forEach((col, k) => { px(g, N.x - 3 + k, N.y - 3 + k, N.w + 6 - k * 2, 1, col); px(g, N.x - 3 + k, N.y - 3 + k, 1, N.h + 6 - k * 2, col); });
  fr.slice().reverse().forEach((col, k) => { px(g, N.x - 3 + k, N.y + N.h + 2 - k, N.w + 6 - k * 2, 1, col === '#E4E4E7' ? '#52525B' : col); px(g, N.x + N.w + 2 - k, N.y - 3 + k, 1, N.h + 6 - k * 2, col === '#E4E4E7' ? '#52525B' : col); });
  ['#160822', '#12061E', '#0F051A', '#0C0416'].forEach((col, k) => px(g, N.x + 1, N.y + 1 + k * ((N.h - 2) / 4), N.w - 2, Math.ceil((N.h - 2) / 4), col));
  g.fillStyle = dith(g, '#1C0A2C'); g.fillRect(N.x + 1, N.y + 1, N.w - 2, 4);
  px(g, N.x + 1, N.y + 1, N.w - 2, 1, '#3A2A4C');
  for (let x = N.x + 6; x < N.x + N.w - 4; x += 40) for (const y of [N.y - 2, N.y + N.h + 1]) { px(g, x, y, 2, 2, '#27272A'); px(g, x, y, 1, 1, '#F4F4F5'); }
  for (let i = 0; i < 24; i++) { const bx = N.x + 6 + i * ((N.w - 12) / 24); px(g, bx - 1, N.y + N.h - 8, 5, 4, '#05020B'); px(g, bx, N.y + N.h - 7, 3, 2, '#3F2A12'); px(g, bx, N.y + N.h - 7, 1, 1, '#6A4A1A'); }
};

/** The booth's back door, still (the two ways it's seen): shut (a purple slab, bevelled, its lit EXIT sign up top, a
 *  porthole, the push bar, the light by it), or open (the dark corridor out the back, a strip of light down it, the
 *  door swung back edge-on). */
const DOOR_BX = DJ.x + DJ.w - 46, DOOR_BY = DJ.y + 6, DOOR_BW = 38, DOOR_BH = DJ.h - 6;
const paintBoothDoor = (open: boolean) => (g: Ctx) => {
  const x = DOOR_BX, y = DOOR_BY, w = DOOR_BW, h = DOOR_BH;
  px(g, x, y, w, h, '#05020B');
  if (open) {
    px(g, x + 2, y + 2, w - 4, h - 2, '#020103');
    ['#0A0414', '#07030F', '#05020B'].forEach((col, k) => px(g, x + 8 + k * 4, y + 2, 4, h - 2, col));
    g.fillStyle = dith(g, '#1A0B2E'); g.fillRect(x + 20, y + 2, 4, h - 2);
    px(g, x + 22, y + 2, 1, h - 2, '#2E1650');
    px(g, x + w - 8, y + 2, 6, h - 2, '#3B0F7A'); px(g, x + w - 8, y + 2, 1, h - 2, '#7C3AED'); px(g, x + w - 3, y + 2, 1, h - 2, '#1E0B4B');
    return;
  }
  const dx = x + 2, dy = y + 2, dw = w - 4, dh = h - 2;
  px(g, dx, dy, dw, dh, '#4C1D95');
  g.fillStyle = dith(g, '#3B0F7A'); g.fillRect(dx, dy + dh - 24, dw, 24);
  px(g, dx, dy, dw, 2, '#7C3AED'); px(g, dx, dy, 1, dh, '#6D28D9'); px(g, dx + dw - 2, dy, 2, dh, '#2E1065');
  // (the EXIT sign over it: a backlit box)
  px(g, x + 5, dy + 2, w - 10, 12, '#05020B'); px(g, x + 6, dy + 3, w - 12, 10, '#0B2A18');
  lightbox(g, 'EXIT', x + w / 2, dy + 4, 1, '#4ADE80', '#DCFCE7', '#14532D');
  // (the porthole: a chrome ring, dark glass, a glint)
  const cx = x + w / 2 - 1, cy = dy + 26;
  blob(g, cx, cy, 8, 8, CHROME);
  g.fillStyle = '#05020B'; g.beginPath(); g.arc(cx, cy, 5.5, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#0A1A12'; g.beginPath(); g.arc(cx, cy, 4.5, 0, Math.PI * 2); g.fill();
  px(g, cx - 3, cy - 3, 2, 2, '#A7F3D0'); px(g, cx - 1, cy - 4, 1, 1, '#FFFFFF');
  // (the push bar: chrome on two brackets)
  for (const bx of [dx + 3, dx + dw - 6]) { px(g, bx, dy + 38, 3, 5, '#05020B'); px(g, bx + 1, dy + 38, 1, 5, '#A1A1AA'); }
  tube(g, dx + 3, dy + 40, dx + dw - 3, dy + 40, 3, CHROME);
  px(g, x + w - 18, DJ.y + 40, 4, 6, '#05020B'); px(g, x + w - 17, DJ.y + 41, 2, 4, '#FDE047'); px(g, x + w - 17, DJ.y + 41, 1, 1, '#FFFFF0');
};

/** The floor past the tiles at each end: diamond plate on a dark riser, its lip lit (it's floor: stand on it), a chrome
 *  edge strip where it meets the tiles. */
const FLOOR_END = T0 + TN * TW;
const paintFloorEnd = (a: number, b: number, tileSide: number) => (g: Ctx) => {
  const w = b - a;
  px(g, a, GY, w, 56, '#18181D');
  ['#2A2A31', '#24242A', '#1E1E24', '#18181D', '#121216'].forEach((col, k) => px(g, a, GY + 2 + k * 10, w, 10, col));
  for (let y = GY + 5, r = 0; y < GY + 52; y += 6, r++) for (let x = a + (r % 2 ? 3 : 0); x < b - 2; x += 6) { px(g, x, y, 3, 1, '#4A4A55'); px(g, x + 1, y + 1, 2, 1, '#0A0A0E'); px(g, x, y, 1, 1, '#8E8E99'); }
  px(g, a, GY, w, 2, '#E4E4E7'); px(g, a, GY + 2, w, 1, '#52525B');
  const ex = tileSide < 0 ? a : b - 3;
  px(g, ex, GY, 3, 56, '#05020B'); px(g, ex + 1, GY + 2, 1, 54, '#A1A1AA');
};

// ---------------------------------------------------------------------------------------------------------------
// Live

/** One floor tile: a frame, its glass; lit, stepped from its edge in to a hot middle. */
const tile = (c: Ctx, x: number, y: number, w: number, h: number, k: number) => {
  px(c, x, y, w, h, '#07050C');
  if (k < 0) { px(c, x + 2, y + 2, w - 4, h - 4, '#1A1824'); px(c, x + 2, y + 2, w - 4, 1, '#2E2A3C'); px(c, x + 4, y + 4, 6, 1, '#3A3650'); return; }
  const r = TILE[k];
  px(c, x + 2, y + 2, w - 4, h - 4, r[1]);
  c.fillStyle = dith(c, r[2]); c.fillRect(x + 3, y + 3, w - 6, h - 6);
  px(c, x + 5, y + 5, w - 10, h - 10, r[2]);
  c.fillStyle = dith(c, r[3], 2, 1); c.fillRect(x + 7, y + 7, w - 14, h - 14);
  px(c, x + 10, y + 9, w - 20, h - 18, r[3]);
  px(c, x + 13, y + 11, w - 26, Math.max(1, h - 22), r[4]);
  px(c, x + 2, y + 2, w - 4, 1, r[4]);
};

export const drawDisco = (c: Ctx, state: GameState, o: { lights: number; ops: BoothOps | null; extinguisher: boolean }) => {
  if (!shown(state, DISCO_L - 60, DISCO_R + 60)) return;
  const f = state.frame, on = o.lights > 0.5;
  // (the hall's walls, in tiles)
  for (let tx = DISCO_L - 40; tx < DISCO_R + 40; tx += 400) {
    if (!shown(state, tx, tx + 400)) continue;
    stamp(c, `sp-q-disco2-${tx - DISCO_L}`, tx, GY - 600, 400, 604, g => paintWall(g, tx));
  }
  stamp(c, 'sp-q-disco2-fix', DISCO_L - 40, GY - 600, W + 80, 604, paintFixtures);
  // The ball's spots on the walls (the light itself is the lighting's; these are the bright cores)
  if (on) for (let k = 0; k < SPOTS; k++) {
    const s = spotAt(k, f);
    if (!s.front || !shown(state, s.x - 10, s.x + 10)) continue;
    px(c, s.x - 2, s.y - 2, 5, 5, k % 4 === 1 ? '#F0ABFC' : '#F8FAFC'); px(c, s.x - 4, s.y, 9, 1, '#E2E8F0'); px(c, s.x, s.y - 4, 1, 9, '#E2E8F0');
  }
  // The neon: GALACTIC GROOVE on its sign board (hung off the truss on two rods), bent glass, the letters chasing (dark
  // glass till the lights come up)
  if (shown(state, NEON.x - 30, NEON.x + NEON.w + 30)) {
    const N = NEON;
    stamp(c, 'sp-q-neon-board', N.x - 4, TRUSS_Y + 8, N.w + 8, N.y + N.h + 4 - (TRUSS_Y + 8), paintNeonBoard);
    if (on) for (let i = 0; i < 24; i++) if ((i + (f >> 2)) % 4 === 0) { const bx = N.x + 6 + i * ((N.w - 12) / 24); px(c, bx, N.y + N.h - 7, 3, 2, '#FDE047'); px(c, bx + 1, N.y + N.h - 7, 1, 1, '#FFFFF0'); }
    const lit = (k: number) => (i: number) => { const j = i + k; return !on || ((j + Math.floor(f / 5)) % 9 === 0 && f % 4 < 2) ? 0 : (j + Math.floor(f / 5)) % 4 === 0 ? 2 : 1; };
    neon(c, 'GALACTIC', N.ga, N.y + 10, NEON_S, N_PINK, { slant: 1, lit: lit(0) });
    neon(c, 'GROOVE', N.gr, N.y + 10, NEON_S, N_CYAN, { slant: 1, lit: lit(9) });
  }
  // The floor: light-up tiles, two rows, the patterns stepping on the beat; its lip lit (stand on it)
  for (let i = 0; i < TN; i++) {
    const x = T0 + i * TW;
    if (!shown(state, x, x + TW)) continue;
    tile(c, x, GY, TW, 26, tileAt(i, 0, f, on));
    tile(c, x, GY + 26, TW, 30, tileAt(i, 1, f, on));
  }
  if (shown(state, DISCO_L, T0)) stamp(c, 'sp-q-floor-end-l', DISCO_L, GY, T0 - DISCO_L, 56, paintFloorEnd(DISCO_L, T0, 1));
  if (shown(state, FLOOR_END, DISCO_R + 40)) stamp(c, 'sp-q-floor-end-r', FLOOR_END, GY, DISCO_R + 40 - FLOOR_END, 56, paintFloorEnd(FLOOR_END, DISCO_R + 40, -1));
  if (shown(state, DISCO_L, DISCO_R)) { px(c, DISCO_L, GY - 1, W, 2, '#E4E4E7'); px(c, DISCO_L, GY + 1, W, 1, '#52525B'); }
  // The mirror ball, turning: its chain and motor; the facets, each catching the light as it comes round
  const bx = BALL.x, by = BALL.y, R = 30;
  if (shown(state, bx - 60, bx + 60)) {
    px(c, bx - 1, TRUSS_Y + 10, 3, by - R - TRUSS_Y - 10, '#71717A'); for (let y = TRUSS_Y + 14; y < by - R; y += 6) px(c, bx - 2, y, 5, 2, '#A1A1AA');
    px(c, bx - 8, by - R - 8, 16, 8, '#18181B'); px(c, bx - 7, by - R - 7, 14, 6, '#52525B'); px(c, bx - 7, by - R - 7, 14, 1, '#A1A1AA');
    c.fillStyle = '#05050A'; c.beginPath(); c.arc(bx, by, R + 1.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#334155'; c.beginPath(); c.arc(bx, by, R, 0, Math.PI * 2); c.fill();
    const rot = f * 0.02;
    for (let lat = -5; lat <= 5; lat++) {
      const la = lat / 5.6 * (Math.PI / 2), ry = Math.sin(la) * R, rr = Math.cos(la) * R, n = Math.max(4, Math.round(16 * Math.cos(la)));
      for (let j = 0; j < n; j++) {
        const lo = (j / n) * Math.PI * 2 + rot + lat * 0.1, cz = Math.cos(lo);
        if (cz < 0.05) continue;
        const fx = bx + Math.sin(lo) * rr, fy = by + ry, sz = Math.max(2, 5 * cz * Math.cos(la));
        // (lit from up and to the left: the facets there bright; one now and then flashing; some the neon's color)
        const lum = cz * 0.6 + (-Math.sin(lo) * 0.3 - Math.sin(la) * 0.4) + 0.2;
        const flash = on && ((j * 7 + lat * 3 + (f >> 2)) % 29 === 0);
        const col = flash ? '#FFFFFF' : lum > 0.85 ? '#F1F5F9' : lum > 0.6 ? '#CBD5E1' : lum > 0.35 ? '#94A3B8' : lum > 0.15 ? '#64748B' : '#475569';
        const tint = on && (j + lat) % 7 === 0 ? (j % 2 ? '#F9A8D4' : '#A5F3FC') : col;
        px(c, fx - sz / 2, fy - 2.5, sz, 4, tint);
      }
    }
    // (the grout lines, the rim in shade)
    c.strokeStyle = 'rgba(15, 23, 42, 0.6)'; c.lineWidth = 1; for (let lat = -4; lat <= 4; lat += 2) { c.beginPath(); c.ellipse(bx, by + Math.sin(lat / 5.6 * Math.PI / 2) * R, Math.cos(lat / 5.6 * Math.PI / 2) * R, 1.5, 0, 0, Math.PI * 2); c.stroke(); }
    c.strokeStyle = '#1E293B'; c.lineWidth = 2; c.beginPath(); c.arc(bx, by, R - 1, -0.3, Math.PI * 0.9); c.stroke();
    if (on) { px(c, bx - 14, by - 16, 4, 4, '#FFFFFF'); px(c, bx - 18, by - 14, 12, 1, '#FFFFFF'); px(c, bx - 12, by - 20, 1, 12, '#FFFFFF'); }
  }
  // The par cans' lenses lit (their beams are the glow pass's)
  if (on) for (const cn of CANS) if (shown(state, cn.x - 20, cn.x + 20)) { px(c, cn.x - 8, TRUSS_Y + 40, 16, 4, TILE[cn.col][3]); px(c, cn.x - 5, TRUSS_Y + 41, 10, 2, TILE[cn.col][4]); }
  // The fog off the smoke machine by the booth, low over the floor: stippled, drifting
  if (on && shown(state, DJ.x - 300, DJ.x + 600)) for (let i = 0; i < 7; i++) {
    const u = ((f * 0.0015 + i * 0.143) % 1), fx = DJ.x - 200 + u * 900, fy = GY - 14 - Math.sin(u * Math.PI) * 10;
    c.fillStyle = dith(c, i % 2 ? '#A78BFA' : '#E9D5FF', 2, i % 2); c.globalAlpha = 0.35 * Math.sin(u * Math.PI);
    c.beginPath(); c.ellipse(fx, fy, 70 + i * 6, 12, 0, 0, Math.PI * 2); c.fill();
  }
  c.globalAlpha = 1;
  // The DJ booth: the two of them in there (headsets on, working her), or losing it after, or gone out the back
  if (shown(state, DJ.x - 40, DJ.x + DJ.w + 40)) {
    c.save(); c.beginPath(); c.rect(DJ.x, DJ.y, DJ.w, DJ.h); c.clip();
    // (the cabin inside: its back wall, stamped; the cue monitor's waveform and the reels turning, live)
    stamp(c, 'sp-q-booth-cabin', DJ.x, DJ.y, DJ.w, DJ.h, paintCabin);
    const ops = o.ops, open = !ops || ops.mode === 'run' || ops.mode === 'gone';
    const run = on || (!!ops && ops.mode === 'on');
    if (run) {
      for (let i = 0; i < 10; i++) { const hgt = 1 + Math.round((on ? Math.pow(1 - (f % BEAT) / BEAT, 1.5) * 0.6 : 0.15) * 5 + hash(i * 3.3 + Math.floor(f / 4)) * 3); px(c, DJ.x + 93 + i * 2, DJ.y + 12 - hgt, 1, hgt * 2, '#4ADE80'); }
      px(c, DJ.x + 92 + ((f >> 1) % 20), DJ.y + 6, 1, 13, '#D9F99D');
    }
    REELS.forEach((r, k) => {
      const a = run ? f * (k ? 0.09 : 0.07) : 0.4;
      c.strokeStyle = '#D4D4D8'; c.lineWidth = 1; c.beginPath();
      for (let s = 0; s < 3; s++) { const an = a + s * Math.PI * 2 / 3; c.moveTo(r.x, r.y); c.lineTo(r.x + Math.cos(an) * 5, r.y + Math.sin(an) * 5); }
      c.stroke(); px(c, r.x - 1, r.y - 1, 2, 2, '#F4F4F5');
    });
    // (the back door out of it, at the right: open once they've run)
    stamp(c, open ? 'sp-q-booth-door-open' : 'sp-q-booth-door-shut', DOOR_BX, DOOR_BY, DOOR_BW, DOOR_BH, paintBoothDoor(open));
    if (ops && ops.mode !== 'gone') for (let i = 0; i < 2; i++) {
      let x = DJ.x + 50 + i * 100, bob = 0;
      let pose: AlienPose = 'operate';
      if (ops.mode === 'mad') { pose = (ops.t + i * 5) % 12 < 6 ? 'point' : 'tell'; bob = (ops.t + i * 3) % 10 < 5 ? -3 : 0; x += Math.sin(ops.t * 0.9 + i) * 2; }
      else if (ops.mode === 'run') { pose = 'run'; x += Math.max(0, ops.t - i * 10) * 6; }
      if (x > DJ.x + DJ.w - 20) continue;
      c.save(); c.translate(x, DJ.y + DJ.h + 50 + bob);
      drawAlien(c, { seed: 201 + i * 7, headset: true, woman: i === 1 }, pose, f + i * 9, 0.85);
      c.restore();
    }
    // (the console: stamped; its live bits over it)
    stamp(c, 'sp-q-booth-desk', DJ.x, MIX_TOP - 10, DJ.w, BH - MIX_TOP + 10, paintDesk);
    deskLive(c, f, run, on);
    // (the glass: a sheen across it, their green on it; dust out the back as they run)
    c.fillStyle = 'rgba(74, 222, 128, 0.12)'; c.fillRect(DJ.x, DJ.y, DJ.w, DJ.h);
    c.fillStyle = dith(c, 'rgba(255, 255, 255, 0.18)'); c.beginPath(); c.moveTo(DJ.x + 20, DJ.y); c.lineTo(DJ.x + 50, DJ.y); c.lineTo(DJ.x + 20, DJ.y + DJ.h); c.lineTo(DJ.x - 10, DJ.y + DJ.h); c.closePath(); c.fill();
    if (ops && ops.mode === 'run' && ops.t > 6) for (let k = 0; k < 6; k++) { const u = ((ops.t - 6) * 0.04 + k * 0.17) % 1; c.fillStyle = u < 0.5 ? '#D6D3D1' : dith(c, '#D6D3D1', 2, k % 2); c.beginPath(); c.ellipse(DJ.x + DJ.w - 40 - u * 60 + k * 6, DJ.y + DJ.h - 20 - u * 20 + (k % 3) * 6, 10 + u * 14, 8 + u * 8, 0, 0, Math.PI * 2); c.fill(); }
    c.restore();
  }
  if (shown(state, DJ.x - 80, DJ.x + DJ.w + 220)) boothOutLive(c, state, f, on);
  void ALIEN; void o.extinguisher;
};

/** The shutter in the doorway (the same opening the doors were in): a heavy steel roll-down out of its housing up
 *  under the casing's head, slatted, hazard stripes along its foot (0 up, 1 down). World, behind him. */
// ---------------------------------------------------------------------------------------------------------------
// The building round the hall, cut away (only seen pulled right back, her weakness death: the whole hall on screen, wall
// to wall, so the screen's taller than the hall): over the ceiling, its slab, the long-span joists in the dark of the
// plenum (the ducts, the sprinkler main, the hangers), the roof deck, black above; under the floor, its slab, the piers
// under the pillars, black below; the outer wall past the far end. Drawn before the hall, which covers its own part.

const SHELL_TOP = GY - 1700, SHELL_BOT = GY + 600;
const CONC = ['#0E0C12', '#16141B', '#1C1A22', '#26232D', '#34303C'];
const STEEL_S = ['#101015', '#1F1F26', '#2E2E37', '#4A4A55'];
export const drawDiscoShell = (c: Ctx, state: GameState) => {
  if (!shown(state, DISCO_L - 60, DISCO_R + 60)) return;
  const xl = DISCO_L - 240, xr = DISCO_R + 240, ww = xr - xl, top = GY - 600;
  // (black, all of it, first)
  px(c, xl, SHELL_TOP, ww, SHELL_BOT - SHELL_TOP, '#020104');
  // Over the ceiling. The roof deck (corrugated, its ribs lit along the top), the membrane over it; black above
  const deck = top - 330;
  px(c, xl, deck - 26, ww, 26, '#0A0910'); px(c, xl, deck - 26, ww, 2, '#17151C');
  px(c, xl, deck, ww, 30, CONC[1]);
  for (let x = xl; x < xr; x += 14) { px(c, x, deck + 2, 6, 26, CONC[2]); px(c, x, deck + 2, 6, 1, CONC[3]); px(c, x + 6, deck + 2, 1, 26, CONC[0]); }
  // (the plenum: dark, banded darker up toward the deck)
  const PLEN = ['#06040A', '#08060D', '#0A0710', '#0C0913'];
  for (let k = 0; k < 4; k++) px(c, xl, deck + 30 + k * 64, ww, k === 3 ? top - 40 - (deck + 30 + k * 64) : 64, PLEN[k]);
  // (the joists, open web: top chord under the deck, bottom chord over the slab, the webs zigzag between; a column of
  // each pillar's up through it to the roof)
  const tc = deck + 34, bc = top - 76;
  for (const y of [tc, bc]) { px(c, xl, y, ww, 7, STEEL_S[1]); px(c, xl, y, ww, 1, STEEL_S[3]); px(c, xl, y + 6, ww, 1, STEEL_S[0]); }
  c.strokeStyle = STEEL_S[1]; c.lineWidth = 3; c.beginPath();
  for (let x = xl, k = 0; x <= xr; x += 48, k++) c.lineTo(x, k % 2 ? bc : tc + 7);
  c.stroke();
  c.strokeStyle = STEEL_S[2]; c.lineWidth = 1; c.beginPath();
  for (let x = xl, k = 0; x <= xr; x += 48, k++) c.lineTo(x - 1, k % 2 ? bc : tc + 7);
  c.stroke();
  for (const x of [DISCO_L + 260, DISCO_L + 1060, DISCO_L + 1560, DISCO_R - 40]) { px(c, x - 10, deck + 30, 20, top - 40 - deck - 30, STEEL_S[1]); px(c, x - 10, deck + 30, 3, top - 40 - deck - 30, STEEL_S[2]); px(c, x + 8, deck + 30, 2, top - 40 - deck - 30, STEEL_S[0]); }
  // (the supply duct along it, galvanized: its seams, its top lit; the sprinkler main under it in red, its hangers)
  const dy = deck + 120;
  px(c, xl, dy, ww, 46, '#1E2128'); px(c, xl, dy, ww, 2, '#3A3F4A'); px(c, xl, dy + 2, ww, 10, '#252931'); px(c, xl, dy + 44, ww, 2, '#0C0D11');
  for (let x = xl + 20; x < xr; x += 96) { px(c, x, dy, 3, 46, '#2E333D'); px(c, x + 3, dy, 1, 46, '#0F1014'); }
  const sy = bc - 34;
  px(c, xl, sy, ww, 7, '#3A0C0C'); px(c, xl, sy, ww, 2, '#7F1D1D'); px(c, xl, sy + 6, ww, 1, '#1A0505');
  for (let x = xl + 40; x < xr; x += 140) { px(c, x, sy - 10, 2, 10, STEEL_S[2]); px(c, x - 3, sy + 7, 8, 2, '#5A1414'); px(c, x, sy + 9, 2, 6, '#71717A'); }
  // (the slab hung off the bottom chords: rods down to it)
  for (let x = xl + 24; x < xr; x += 96) px(c, x, bc + 7, 2, top - 40 - bc - 7, STEEL_S[2]);
  // (the ceiling slab, cut: concrete, its aggregate stippled, its top edge lit dimly, its underside the hall's ceiling)
  px(c, xl, top - 40, ww, 40, CONC[2]); px(c, xl, top - 40, ww, 2, CONC[3]); px(c, xl, top - 4, ww, 4, CONC[0]);
  for (let i = 0; i < ww / 6; i++) { const x = xl + hash(i * 1.7) * ww, y = top - 36 + hash(i * 2.3) * 30; px(c, x, y, 2, 1, i % 3 ? CONC[1] : CONC[3]); }
  // Under the floor. Its structure under the tiles (the ends past them), the slab, the piers under the pillars and
  // their footings; black below
  px(c, xl, GY + 4, ww, 52, CONC[1]);
  px(c, xl, GY + 56, ww, 40, CONC[2]); px(c, xl, GY + 56, ww, 2, CONC[3]); px(c, xl, GY + 94, ww, 2, CONC[0]);
  for (let i = 0; i < ww / 6; i++) { const x = xl + hash(i * 3.1 + 7) * ww, y = GY + 60 + hash(i * 1.3 + 2) * 30; px(c, x, y, 2, 1, i % 3 ? CONC[1] : CONC[3]); }
  const PIT = ['#07050A', '#050307', '#030205'];
  for (let k = 0; k < 3; k++) px(c, xl, GY + 96 + k * 40, ww, 40, PIT[k]);
  for (const x of [DISCO_L - 40, DISCO_L + 260, DISCO_L + 1060, DISCO_L + 1560, DISCO_R - 40, DISCO_R + 40]) {
    px(c, x - 18, GY + 96, 36, 90, CONC[1]); px(c, x - 18, GY + 96, 4, 90, CONC[2]); px(c, x + 15, GY + 96, 3, 90, CONC[0]);
    px(c, x - 36, GY + 186, 72, 18, CONC[1]); px(c, x - 36, GY + 186, 72, 2, CONC[3]);
  }
  // The outer walls past each end, the hall's height and the plenum's: block, its courses
  for (const [x0, w] of [[DISCO_R + 40, 60], [DISCO_L - 100, 60]] as const) {
    px(c, x0, deck, w, GY + 96 - deck, CONC[1]);
    for (let y = deck; y < GY + 96; y += 20) px(c, x0, y, w, 1, CONC[0]);
    for (let y = deck, r = 0; y < GY + 96; y += 20, r++) for (let x = x0 + (r % 2 ? 20 : 0); x < x0 + w; x += 40) px(c, x, y, 1, 20, CONC[0]);
    px(c, x0, deck, 2, GY + 96 - deck, CONC[2]);
  }
};

export const drawShutter = (c: Ctx, state: GameState, k: number) => {
  const D = DOORWAY;
  if (k <= 0 || !shown(state, D.l - 20, D.r + 20)) return;
  const x = D.l, w = D.r - D.l, top = D.top + 12, h = Math.round((GY - top) * k);
  // (its housing: a steel drum box across the top of the opening, bolted)
  px(c, x, D.top, w, 12, '#05050A'); px(c, x + 1, D.top + 1, w - 2, 10, '#3F3F46'); px(c, x + 1, D.top + 1, w - 2, 2, '#A1A1AA'); px(c, x + 1, D.top + 8, w - 2, 2, '#27272A');
  for (const bx of [x + 4, x + w - 7]) px(c, bx, D.top + 4, 3, 3, '#D4D4D8');
  // (the slats: each rounded, lit along its top, shadowed under; the guides either side)
  px(c, x, top, w, h, '#05050A');
  for (let y = top; y < top + h - 10; y += 8) { px(c, x + 2, y, w - 4, 8, '#5A5A64'); px(c, x + 2, y, w - 4, 2, '#9A9AA6'); px(c, x + 2, y + 6, w - 4, 2, '#33333B'); c.fillStyle = dith(c, '#45454E', 1, (y >> 3) % 2); c.fillRect(x + w - 16, y + 2, 12, 4); }
  px(c, x, top, 2, h, '#27272A'); px(c, x + w - 2, top, 2, h, '#27272A');
  // (its foot: the bottom bar, the hazard stripes, a handle)
  c.save(); c.beginPath(); c.rect(x + 2, top + h - 10, w - 4, 10); c.clip();
  for (let i = -1; i < w / 6 + 1; i++) { c.fillStyle = i % 2 ? '#18181B' : '#FACC15'; c.beginPath(); c.moveTo(x + i * 6, top + h - 10); c.lineTo(x + i * 6 + 6, top + h - 10); c.lineTo(x + i * 6 + 2, top + h); c.lineTo(x + i * 6 - 4, top + h); c.closePath(); c.fill(); }
  c.restore();
  px(c, x + 2, top + h - 11, w - 4, 1, '#FEF08A');
  px(c, x + w / 2 - 8, top + h - 16, 16, 4, '#18181B'); px(c, x + w / 2 - 7, top + h - 16, 14, 1, '#A1A1AA');
  px(c, x, top + h - 1, w, 1, '#0A0A0A');
};

// ---------------------------------------------------------------------------------------------------------------
// The lighting

/** The hall's light: dark till they come up; then every tile, spot, can, the ball, the neon, the booth lit in it. */
export const discoLighting = (state: GameState, lights: number): SceneLight => {
  const f = state.frame, ls: Light[] = [], on = lights > 0.5, l = lights;
  const v0 = state.camera.x - 300, v1 = state.camera.x + CANVAS_WIDTH + 300;
  const inView = (x: number) => x > v0 && x < v1;
  if (on) {
    // (the floor: each lit tile's color up off it; pairs of tiles, one light)
    for (let i = 0; i < TN; i += 2) {
      const x = T0 + i * TW + TW;
      if (!inView(x)) continue;
      const k = tileAt(i, 0, f, true), k2 = tileAt(i + 1, 0, f, true), kk = k >= 0 ? k : k2;
      if (kk >= 0) ls.push({ x, y: GY - 4, r: 96, a: 0.55 * l, color: `rgba(${TILE_RGB[kk]}, 0.2)` });
    }
    // (the ball's spots round the walls and the floor)
    for (let k = 0; k < SPOTS; k++) { const s = spotAt(k, f); if (s.front && inView(s.x)) ls.push({ x: s.x, y: s.y, r: 34, a: 0.7 * l, color: k % 4 === 1 ? 'rgba(240, 171, 252, 0.25)' : 'rgba(248, 250, 252, 0.22)' }); }
    // (where the cans' beams land: a pool each)
    CANS.forEach((cn, k) => { const hx = canHit(k, f); if (inView(hx)) ls.push({ x: hx, y: GY - 60, r: 130, a: 0.6 * l, color: `rgba(${TILE_RGB[cn.col]}, 0.2)` }); });
    // (the ball itself, catching it all)
    ls.push({ x: BALL.x, y: BALL.y, r: 150, a: 0.85 * l, color: 'rgba(226, 232, 240, 0.14)' });
    // (the neon: pink along GALACTIC, cyan along GROOVE)
    ls.push({ x: NEON.ga, y: NEON.y + 20, r: 190, a: 0.75 * l, color: 'rgba(244, 114, 182, 0.2)' });
    ls.push({ x: NEON.gr, y: NEON.y + 20, r: 170, a: 0.75 * l, color: 'rgba(34, 211, 238, 0.18)' });
    // (the bar's back bar)
    ls.push({ x: DISCO_R - 180, y: GY - 180, r: 200, a: 0.6 * l, color: 'rgba(94, 234, 212, 0.14)' });
  }
  // (the booth's rim: its neon panel and LED strip, pink, brighter on the kick)
  if (on) ls.push({ x: BCX, y: BH + 22, r: 150, a: (0.45 + 0.25 * Math.pow(1 - (f % BEAT) / BEAT, 2)) * l, color: 'rgba(236, 72, 153, 0.16)' });
  // (the booth: their screens' green; the door's light; the refill's alcove (always: he must see it))
  ls.push({ x: DJ.x + DJ.w / 2, y: DJ.y + DJ.h / 2, r: 170, a: 0.75, color: 'rgba(74, 222, 128, 0.14)' });
  ls.push({ x: DOOR_X, y: GY - 100, r: 160, a: 0.6 });
  // (the doorway's neon, over it on the header: always on)
  ls.push({ x: DOOR_X - 20, y: DOOR_SIGN.y + 14, r: 160, a: 0.7, color: 'rgba(244, 114, 182, 0.16)' });
  ls.push({ x: DOOR_X + 10, y: DOOR_SIGN.y + 34, r: 120, a: 0.5, color: 'rgba(34, 211, 238, 0.12)' });
  ls.push({ x: REFILL_X, y: GY - 100, r: 120, a: 0.6, color: 'rgba(255, 245, 230, 0.08)' });
  ls.push({ x: EXTINGUISHER_X, y: GY - 115, r: 70, a: 0.5, color: 'rgba(239, 68, 68, 0.14)' });
  ls.push({ x: state.player.pos.x + 20, y: state.player.pos.y + 30, r: 130, a: 0.5 });
  return { dark: on ? 0.84 - 0.24 * l : 0.86, shade: [12, 3, 26], lights: ls, rim: 0.55 };
};

// ---------------------------------------------------------------------------------------------------------------
// The glow pass: the light you see in the air, over the lit frame (call from drawHud with the world's transform on)

export const discoGlow = (c: Ctx, state: GameState, lights: number) => {
  if (lights <= 0.5 || !shown(state, DISCO_L - 60, DISCO_R + 60)) return;
  const f = state.frame, l = Math.min(1, lights);
  c.save();
  // (nothing drawn over the signs: the light in the air keeps off the neon's board and the doorway's sign)
  const v = state.view ?? { x: state.camera.x, w: CANVAS_WIDTH };
  c.beginPath(); c.rect(v.x - 400, GY - 1200, v.w + 800, 1600);
  c.rect(NEON.x - 2, NEON.y - 2, NEON.w + 4, NEON.h + 4); c.rect(DOOR_SIGN.x - 4, DOOR_SIGN.y - 12, DOOR_SIGN.w + 8, DOOR_SIGN.h + 14);
  c.clip('evenodd');
  c.globalCompositeOperation = 'lighter';
  // (the ball's rays: thin stippled lines out to each spot, faint)
  for (let k = 0; k < SPOTS; k++) {
    const s = spotAt(k, f);
    if (!s.front) continue;
    c.strokeStyle = dith(c, k % 4 === 1 ? 'rgba(240, 171, 252, 0.36)' : 'rgba(226, 232, 240, 0.3)', 2, k % 2); c.lineWidth = 2;
    c.beginPath(); c.moveTo(BALL.x, BALL.y); c.lineTo(s.x, s.y); c.stroke();
    // (the spot's own bloom: two rings)
    c.fillStyle = 'rgba(248, 250, 252, 0.10)'; c.beginPath(); c.arc(s.x, s.y, 12, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(248, 250, 252, 0.14)'; c.beginPath(); c.arc(s.x, s.y, 6, 0, Math.PI * 2); c.fill();
  }
  // (the cans' beams: from each lens down to its pool, stippled color, three steps wide)
  CANS.forEach((cn, k) => {
    const hx = canHit(k, f), top = TRUSS_Y + 44, rgb = TILE_RGB[cn.col];
    for (let s = 0; s < 3; s++) {
      const hw = 10 + s * 22, tw = 6 + s * 3, a = [0.09, 0.05, 0.03][s] * l;
      c.fillStyle = s === 2 ? dith(c, `rgba(${rgb}, ${a * 2})`, 2, k % 2) : `rgba(${rgb}, ${a})`;
      c.beginPath(); c.moveTo(cn.x - tw, top); c.lineTo(cn.x + tw, top); c.lineTo(hx + hw, GY); c.lineTo(hx - hw, GY); c.closePath(); c.fill();
    }
  });
  // (the ball's own glow: stepped rings)
  for (let r = 3; r >= 1; r--) { c.fillStyle = `rgba(226, 232, 240, ${(0.05 * r * l).toFixed(3)})`; c.beginPath(); c.arc(BALL.x, BALL.y, 30 + (4 - r) * 16, 0, Math.PI * 2); c.fill(); }
  // (the neon's bloom: a band of its color round the board, stepped (the board itself kept clear))
  for (let s = 0; s < 3; s++) {
    const pad = 6 + s * 10, a = [0.10, 0.06, 0.035][s] * l, mid = (NEON.ga + NEON.gr) / 2;
    c.fillStyle = `rgba(244, 114, 182, ${a})`; c.fillRect(NEON.x - pad, NEON.y - pad, mid - NEON.x + pad, NEON.h + pad * 2);
    c.fillStyle = `rgba(34, 211, 238, ${a})`; c.fillRect(mid, NEON.y - pad, NEON.x + NEON.w - mid + pad, NEON.h + pad * 2);
  }
  // (the glow up off the floor: each lit tile's color rising in three stepped bands)
  const v0 = state.camera.x - 100, v1 = state.camera.x + CANVAS_WIDTH + 100;
  for (let i = 0; i < TN; i++) {
    const x = T0 + i * TW;
    if (x < v0 || x > v1) continue;
    const k = tileAt(i, 0, f, true);
    if (k < 0) continue;
    for (let s = 0; s < 3; s++) { c.fillStyle = `rgba(${TILE_RGB[k]}, ${([0.16, 0.09, 0.045][s] * l).toFixed(3)})`; c.fillRect(x + 2, GY - 6 - s * 8, TW - 4, 8); }
  }
  // (the booth's windows: its green out through the glass)
  c.fillStyle = 'rgba(74, 222, 128, 0.07)'; c.fillRect(DJ.x - 8, DJ.y - 6, DJ.w + 16, DJ.h + 12);
  c.restore();
};
