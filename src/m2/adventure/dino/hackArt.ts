// THE PADDOCK GATE HACK's look (hack.ts runs it): the tall tree on the dino park's last stretch with the control panel
// up in it, in the world; and the panel's terminal, full screen, round the puzzle (hackPuzzle.ts draws what's on its
// glass).
//
//   the tree:     the last stretch's big fake trees, but taller (a fiberglass trunk at the trees' depth, its canopy up
//                 over the others'), three branch decks bolted round it zigzagging up (the land's platform look: lit
//                 lip), the panel on the top one.
//   the panel:    a weathered steel maintenance box on a post: DINO PADDOCK / GATE CONTROL plate, a little CRT (green,
//                 flickering), blinking lamps, a keypad, a coin return (where the shard pays out), DO NOT TOUCH sticker,
//                 rust running down it, a conduit down into the trunk. Hacked: the CRT's smashed dark, the door's
//                 sprung, sparks and smoke (for good).
//   the terminal: the panel's CRT up close, full screen: the bezel's grimy beige plastic, the park's dino badge, the
//                 model plate, DO NOT TOUCH, a keypad and speaker grille; the glass green phosphor with scanlines, the
//                 boot text typed out, then the puzzle; ACCESS GRANTED.
//
// Still art is stamped (painted once); the lamps, the glow, sparks and the text on the glass are drawn live over it.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { GY } from '../geometry';
import { type Ctx, INK, box, text, slab, pole, checker, pixelBlob, steppedGlow, stamp, hash, P, seg, eyeOf, viewOf, bandedGradient } from './art/kit';
import { signAt, enamel, print, dino, stencil } from '../letters';
import { platform } from './art/world';
import { D } from './layout';
import { PHOS, AMBER, CRT, type HackPuzzle } from './hackPuzzle';

// ---------------------------------------------------------------------------------------------------------------
// Where it is: the last stretch, between the third tree and the fourth, up a taller one

/** The tall tree's trunk (its middle), and its decks: [x, top, w], bottom to top. The panel's on the top one. */
export const HACK_TREE_X = D + 9775;
export const HACK_LEDGES: [number, number, number][] = [[D + 9700, GY - 250, 130], [D + 9800, GY - 360, 100], [D + 9655, GY - 470, 120]];
export const PANEL_X = D + 9688, PANEL_DECK = GY - 470;
const TREE_D = 0.95, TRUNK_TOP = GY - 600, T = 12;

/** The panel's state, for its look. */
export interface PanelLook { dead: boolean; using: boolean; sparkAt: number }

const atDepth = (c: Ctx, ex: number, ey: number, d: number, paint: () => void) => {
  c.save(); c.translate(ex, ey); c.scale(d, d); c.translate(-ex, -ey); paint(); c.restore();
};

export const drawHackTree = (c: Ctx, state: GameState, f: number, look: PanelLook) => {
  const eye = eyeOf(state), v = viewOf(state);
  const sx = eye.x + (HACK_TREE_X - eye.x) * TREE_D;
  if (sx + 260 < v.x || sx - 260 > v.x + v.w) return;
  // The decks (their backs go behind the trunk: the trunk's drawn over all but their front edges)
  for (const [x, y, w] of HACK_LEDGES) platform(c, state, eye, x, y, w, f);
  c.save();
  c.beginPath(); c.rect(HACK_TREE_X - 500, GY - 1100, 1000, 1700);
  for (const [x, y, w] of HACK_LEDGES) { const yb = P(eye, x + w / 2, y, TREE_D)[1]; c.rect(x - 4, Math.min(y, yb) - 1, w + 8, y + T + 2 - Math.min(y, yb)); }
  c.clip('evenodd');
  atDepth(c, eye.x, eye.y, TREE_D, () => stamp(c, 'hack-tree', HACK_TREE_X - 130, TRUNK_TOP - 110, 260, GY - TRUNK_TOP + 110, paintTree));
  // (the panel's conduit, down the trunk from where it's bolted)
  const [qx, qy] = P(eye, HACK_TREE_X - 14, PANEL_DECK + 4, TREE_D), [, qy2] = P(eye, HACK_TREE_X - 14, GY - 30, TREE_D);
  box(c, qx - 2, qy, 5, qy2 - qy, INK); box(c, qx - 1, qy, 3, qy2 - qy, '#6A727C'); box(c, qx - 1, qy, 1, qy2 - qy, '#A8B0BA');
  for (let y = qy + 30; y < qy2; y += 60) box(c, qx - 3, y, 7, 3, '#4A525C');
  // (a vine off it, swaying)
  const sw = Math.sin(f * 0.03) * 4, [vx, vy] = P(eye, HACK_TREE_X + 34, TRUNK_TOP + 30, TREE_D);
  c.strokeStyle = '#3A6A2A'; c.lineWidth = 2; c.beginPath(); c.moveTo(vx, vy); c.quadraticCurveTo(vx + sw, vy + 90, vx + sw * 2, vy + 170); c.stroke();
  c.restore();
  // The boughs each deck's bolted to (in front of the trunk)
  for (const [x, y, w] of HACK_LEDGES) for (const s of [-1, 1]) {
    const a = P(eye, s < 0 ? x + 12 : x + w - 12, y + T, 0.985), b = P(eye, HACK_TREE_X + s * 12, y + T + 36, TREE_D);
    if (Math.abs(a[0] - b[0]) < 6) continue;
    seg(c, a, b, '#4A3826', 6); seg(c, [a[0], a[1] - 1], [b[0], b[1] - 2], '#6E5434', 2);
    const bx = s < 0 ? x + 8 : x + w - 14; box(c, bx, y + T, 6, 6, '#5A626C'); box(c, bx + 2, y + T + 2, 2, 2, '#C8D0DA');
  }
  drawPanel(c, PANEL_X, PANEL_DECK, f, look);
};

/** The trunk and canopy (painted once): the last stretch's trees' look, taller. */
const paintTree = (g: Ctx) => {
  const tx = HACK_TREE_X, r = 24, top = TRUNK_TOP, rw = r * 2;
  const B = ['#2A1E12', '#3E2E1E', '#5A4430', '#6E5640', '#8A7052'];
  box(g, tx - r - 2, top, rw + 4, GY - top, INK);
  const bands: [number, number, string][] = [[0, 0.18, B[3]], [0.18, 0.55, B[2]], [0.55, 0.8, B[1]], [0.8, 1, B[0]]];
  for (const [u0, u1, col] of bands) box(g, tx - r + rw * u0, top, rw * (u1 - u0) + 1, GY - top, col);
  checker(g, tx - r + rw * 0.18 - 2, top, 2, GY - top, B[3]); checker(g, tx - r + rw * 0.55, top, 2, GY - top, B[1]); checker(g, tx - r + rw * 0.8, top, 2, GY - top, B[0]);
  box(g, tx - r + 2, top, 2, GY - top, B[4]);
  for (let yy = top + 10, k = 0; yy < GY - 10; yy += 16, k++) {
    const px = tx - r + 3 + ((k * 7) % 3) * 11, pw = 13;
    box(g, px, yy, pw, 10, B[1]); box(g, px, yy, pw, 2, B[3]); box(g, px + pw - 2, yy + 2, 2, 8, B[0]);
  }
  box(g, tx + r * 0.3, top, 1, GY - top, B[0]);
  // (a mold seam, a patch of bark knocked off showing the steel, a maintenance tag)
  box(g, tx - 6, GY - 300, 16, 26, '#7A828C'); box(g, tx - 4, GY - 298, 2, 22, '#A8B0BA'); for (let k = 0; k < 4; k++) box(g, tx - 6, GY - 294 + k * 6, 16, 1, '#4A525C');
  slab(g, tx + 4, GY - 150, 16, 10, '#D6CDB4', { ink: true }); box(g, tx + 6, GY - 146, 12, 1, '#5A4A3A'); box(g, tx + 6, GY - 143, 8, 1, '#5A4A3A');
  for (const s of [-1, 1]) {
    g.fillStyle = INK; g.beginPath(); g.moveTo(tx + s * (r + 1), GY - 44); g.quadraticCurveTo(tx + s * (r + 33), GY - 7, tx + s * (r + 52), GY); g.lineTo(tx + s * r * 0.4, GY); g.closePath(); g.fill();
    g.fillStyle = s < 0 ? B[3] : B[1]; g.beginPath(); g.moveTo(tx + s * r, GY - 42); g.quadraticCurveTo(tx + s * (r + 32), GY - 6, tx + s * (r + 50), GY); g.lineTo(tx + s * r * 0.4, GY); g.closePath(); g.fill();
  }
  // (boughs up into the canopy, dim: nothing to stand on)
  g.strokeStyle = '#3E2E1E'; g.lineWidth = 7;
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(tx + s * 10, top + 60); g.quadraticCurveTo(tx + s * 54, top + 30, tx + s * 96, top - 10); g.stroke(); }
  // (the canopy: clumps inked round, four steps lit from up left, flecks of light, fronds hanging under)
  const L = ['#142A12', '#24401C', '#30522A', '#46703A', '#6A9A4A'];
  const clumps: [number, number][] = [];
  for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI; clumps.push([tx + Math.cos(a) * 92, top - 14 - Math.sin(a) * 54]); }
  for (const [cx, cy] of clumps) pixelBlob(g, cx, cy, 49, 29, INK);
  for (const [cx, cy] of clumps) { pixelBlob(g, cx, cy, 46, 26, L[1]); pixelBlob(g, cx + 6, cy + 8, 36, 14, L[0]); }
  for (const [cx, cy] of clumps) { pixelBlob(g, cx - 6, cy - 6, 32, 15, L[2]); pixelBlob(g, cx - 12, cy - 11, 18, 8, L[3]); }
  for (const [cx, cy] of clumps) for (let k = 0; k < 5; k++) box(g, Math.round(cx - 26 + hash(cx + k) * 34), Math.round(cy - 16 + hash(cy + k * 3) * 10), 4, 2, L[4]);
  for (let k = 0; k < 10; k++) { const fx = tx - 118 + k * 26 + hash(tx + k) * 10, len = 14 + hash(k * 3 + tx) * 26; for (let yy = 0; yy < len; yy += 4) box(g, Math.round(fx + Math.sin(yy * 0.2) * 2), top + 6 + yy, 3, 4, yy % 8 ? L[2] : L[1]); }
};

// ---------------------------------------------------------------------------------------------------------------
// The panel

/** Its cabinet, from the deck: the post's height, the box's. */
const POST = 22, BOX_W = 64, BOX_H = 66;
/** Where its coin return is (the shard pays out of it), in the world. */
export const panelSlot = () => ({ x: PANEL_X + 18, y: PANEL_DECK - POST - BOX_H + 55 });

export const drawPanel = (c: Ctx, x: number, deck: number, f: number, look: PanelLook) => {
  const top = deck - POST - BOX_H, l = x - BOX_W / 2;
  stamp(c, `hack-panel-${look.dead ? 1 : 0}`, l - 6, top - 8, BOX_W + 16, BOX_H + POST + 10, g => paintPanel(g, x, deck, look.dead));
  // Live: the CRT, the lamps
  const sx = l + 6, sy = top + 16;
  if (!look.dead) {
    const fl = (f % 97) < 3 ? 0.6 : 1;
    box(c, sx, sy, 30, 22, look.using ? PHOS[2] : PHOS[1]);
    for (let k = 0; k < 4; k++) box(c, sx + 3, sy + 4 + k * 4, ((f >> 3) + k * 5) % 3 === 0 ? 10 : 20 - k * 3, 1, fl < 1 ? PHOS[2] : PHOS[4]);
    if ((f >> 4) % 2) box(c, sx + 3 + ((f >> 2) % 20), sy + 19, 3, 2, PHOS[5]);
    steppedGlow(c, sx + 15, sy + 11, 22, '#22C55E', 0.16 * fl, 0.02, 3);
    (['#EF4444', '#FBBF24', '#22C55E'] as const).forEach((col, i) => { const on = ((f >> (4 + i)) + i) % 2 === 0; box(c, l + 42 + i * 7, top + 18, 4, 4, on ? col : '#2A2A2A'); });
  } else {
    // (dead: sparks out of the smashed screen now and then, smoke off it)
    const since = f - look.sparkAt;
    const burst = since < 40 || (f % 90) < 6;
    if (burst) for (let k = 0; k < 4; k++) { const a = hash(f + k * 13) * Math.PI * 2, d = 3 + hash(f * 3 + k) * 10; box(c, sx + 15 + Math.cos(a) * d, sy + 11 + Math.sin(a) * d, 2, 2, k % 2 ? '#FDE047' : '#FFFFFF'); }
    for (let k = 0; k < 3; k++) { const u = ((f + k * 40) % 120) / 120; pixelBlob(c, sx + 15 + Math.sin(u * 6 + k) * 4, sy - u * 46, 3 + u * 7, 2 + u * 5, `rgba(70, 70, 76, ${(0.5 * (1 - u)).toFixed(2)})`); }
  }
};

const paintPanel = (g: Ctx, x: number, deck: number, dead: boolean) => {
  const top = deck - POST - BOX_H, l = x - BOX_W / 2;
  const M = ['#1E2A26', '#2E403A', '#44584E', '#5E7468', '#86988A'];
  // The post, bolted to the deck
  pole(g, x - 4, deck - POST, 8, POST, '#5A626C');
  slab(g, x - 10, deck - 4, 20, 4, '#4A525C');
  // The cabinet: a ramp across it (lit left), its lid's lip, rivets, rust running down from the seams
  box(g, l - 1, top - 1, BOX_W + 2, BOX_H + 2, INK);
  box(g, l, top, BOX_W, BOX_H, M[2]);
  box(g, l, top, 4, BOX_H, M[3]); box(g, l, top, 1, BOX_H, M[4]); checker(g, l + 4, top, 2, BOX_H, M[3]);
  box(g, l + BOX_W - 6, top, 6, BOX_H, M[1]); checker(g, l + BOX_W - 8, top, 2, BOX_H, M[1]);
  box(g, l - 3, top - 4, BOX_W + 6, 6, INK); box(g, l - 2, top - 3, BOX_W + 4, 4, M[3]); box(g, l - 2, top - 3, BOX_W + 4, 1, M[4]);
  for (const [rx, ry] of [[l + 2, top + 3], [l + BOX_W - 4, top + 3], [l + 2, top + BOX_H - 4], [l + BOX_W - 4, top + BOX_H - 4]]) { box(g, rx, ry, 2, 2, M[4]); box(g, rx + 1, ry + 1, 1, 1, M[0]); }
  for (const [rx, len] of [[l + 10, 18], [l + 36, 22], [l + 54, 14]]) { box(g, rx, top + 2, 2, len, '#7A3E1A'); box(g, rx, top + 2 + len, 1, 4, '#5A2A10'); }
  // The plate: GATE CONTROL
  box(g, l + 5, top + 3, BOX_W - 10, 10, INK); box(g, l + 6, top + 4, BOX_W - 12, 8, '#D6CDB4');
  text(g, 'GATE CONTROL', x, top + 11, '#1A0B06', 4, 'center', null);
  // The CRT's bezel (its glass drawn live), the lamps' strip
  box(g, l + 4, top + 14, 34, 26, INK); box(g, l + 5, top + 15, 32, 24, '#8A8270'); box(g, l + 5, top + 15, 32, 1, '#B0A890');
  box(g, l + 40, top + 16, 21, 8, INK); box(g, l + 41, top + 17, 19, 6, '#1A1A1A');
  // DO NOT TOUCH (a hazard-edged sticker)
  box(g, l + 38, top + 26, 25, 18, INK); box(g, l + 39, top + 27, 23, 16, '#FACC15');
  for (let k = 0; k < 23; k += 4) box(g, l + 39 + k, top + 27, 2, 2, '#1A1A1A');
  text(g, 'DO NOT', l + 50, top + 35, '#1A0B06', 4, 'center', null);
  text(g, 'TOUCH', l + 50, top + 41, '#B91C1C', 4, 'center', null);
  // The keypad: 3 x 4, worn keys (the enter rubbed red)
  for (let r = 0; r < 4; r++) for (let q = 0; q < 3; q++) {
    const kx = l + 7 + q * 10, ky = top + 43 + r * 5;
    box(g, kx, ky, 9, 4, INK); box(g, kx, ky, 8, 3, r === 3 && q === 2 ? '#B91C1C' : (r + q) % 4 === 1 ? '#E2DCCB' : '#B8B0A0');
  }
  // The coin return (the shard pays out of it)
  box(g, l + 41, top + 49, 18, 12, INK); box(g, l + 42, top + 50, 16, 10, '#0E0E10'); box(g, l + 42, top + 50, 16, 1, '#5A626C');
  if (dead) {
    // (hacked: the screen caved in, the door sprung off its latch, scorch up the front)
    box(g, l + 5, top + 15, 32, 24, '#060606');
    g.strokeStyle = '#5A5A5A'; g.lineWidth = 1; g.beginPath(); g.moveTo(l + 21, top + 27); g.lineTo(l + 7, top + 17); g.moveTo(l + 21, top + 27); g.lineTo(l + 35, top + 19); g.moveTo(l + 21, top + 27); g.lineTo(l + 14, top + 38); g.moveTo(l + 21, top + 27); g.lineTo(l + 33, top + 37); g.stroke();
    box(g, l + 41, top + 17, 19, 6, '#0A0A0A');
    for (let k = 0; k < 8; k++) box(g, l + 6 + k * 7, top - 2 + (k % 3) * 3, 5, 10 - (k % 3) * 3, 'rgba(20, 16, 12, 0.55)');
    box(g, l + BOX_W, top + 6, 4, BOX_H - 10, INK); box(g, l + BOX_W + 1, top + 7, 2, BOX_H - 12, M[1]);
  }
};

/** The charge shard (popping out of the coin return; in his hand). */
export const drawShardGem = (c: Ctx, x: number, y: number, s: number, f: number) => {
  const w = Math.abs(Math.cos(f * 0.09)) * 0.7 + 0.3;
  steppedGlow(c, x, y, 22 * s, '#22D3EE', 0.3, 0.03, 4);
  const pts = (k: number) => { c.beginPath(); c.moveTo(x, y - 12 * s * k); c.lineTo(x + 6 * s * w * k, y - 3 * s * k); c.lineTo(x + 4 * s * w * k, y + 10 * s * k); c.lineTo(x - 4 * s * w * k, y + 10 * s * k); c.lineTo(x - 6 * s * w * k, y - 3 * s * k); c.closePath(); };
  pts(1.2); c.fillStyle = INK; c.fill();
  pts(1); c.fillStyle = '#0E7490'; c.fill();
  c.save(); pts(1); c.clip();
  box(c, x - 6 * s, y - 12 * s, 6 * s * w, 24 * s, '#22D3EE'); box(c, x - 4 * s * w, y - 8 * s, 2 * s, 13 * s, '#CFFAFE');
  c.restore();
  if (f % 30 < 4) { box(c, x - 1, y - 18 * s, 2, 6 * s, '#FFFFFF'); box(c, x - 3 * s, y - 16 * s, 6 * s, 2, '#FFFFFF'); }
};

// ---------------------------------------------------------------------------------------------------------------
// The terminal (full screen)

export interface TermNow {
  /** How far it's powered up (0..1: the CRT's line opening out), its clock since, the boot text's length. */
  on: number; t: number;
  puzzle: HackPuzzle | null;
  /** Frames since ACCESS GRANTED (-1 not yet). */
  granted: number;
}
export const BOOT_LINES = [
  'PRE-HYSTERIC PARK SECURITY OS V1.0',
  '(C) 1993 ANIMATRONIC SOLUTIONS INC.',
  'MEMORY CHECK..... 640K OK',
  'PADDOCK GATES: LOCKED',
  '> LOGIN: GARY',
  '> PASSWORD: ********',
  'ACCESS DENIED.',
  'GARY, STOP WRITING IT DOWN.',
];
/** Frames per character typed. */
export const BOOT_RATE = 0.9;
export const bootLength = () => BOOT_LINES.reduce((n, l) => n + l.length + 8, 0) / BOOT_RATE;

export const drawTerminal = (c: Ctx, f: number, o: TermNow) => {
  stamp(c, 'hack-bezel', 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, paintBezel);
  const g = CRT;
  // The glass: off (dark), the line opening out as it warms up, then on
  box(c, g.x, g.y, g.w, g.h, '#010402');
  if (o.on < 1) {
    const h = Math.max(2, g.h * o.on * o.on);
    box(c, g.x, g.y + (g.h - h) / 2, g.w, h, o.on < 0.25 ? PHOS[5] : PHOS[0]);
    box(c, g.x + g.w * 0.1, g.y + g.h / 2 - 1, g.w * 0.8, 2, PHOS[5]);
  } else {
    box(c, g.x, g.y, g.w, g.h, PHOS[0]);
    c.save(); c.beginPath(); c.rect(g.x, g.y, g.w, g.h); c.clip();
    if (!o.puzzle) bootText(c, f, o.t);
    else o.puzzle.draw(c, f, g);
    if (o.granted >= 0) granted(c, f, o.granted);
    // (a band rolling down it, the scanlines, the curve's dark corners and the glare: painted once)
    const roll = (f * 2) % (g.h + 60) - 30;
    box(c, g.x, g.y + roll, g.w, 22, 'rgba(134, 239, 172, 0.05)');
    stamp(c, 'hack-glass', g.x, g.y, g.w, g.h, paintGlass);
    c.restore();
  }
  if (o.puzzle?.drawBezel) o.puzzle.drawBezel(c, f);
  // (the power lamp on the bezel)
  box(c, 704, 520, 8, 6, o.on > 0 ? '#4ADE80' : '#14361E');
  if (o.on > 0) steppedGlow(c, 708, 523, 10, '#4ADE80', 0.25, 0.03, 3);
};

const bootText = (c: Ctx, f: number, t: number) => {
  let n = Math.floor(t * BOOT_RATE);
  const x = CRT.x + 24;
  let y = CRT.y + 34;
  for (const line of BOOT_LINES) {
    if (n <= 0) break;
    const shown = line.slice(0, n);
    text(c, shown, x, y, line.startsWith('ACCESS DENIED') || line.startsWith('GARY') ? AMBER : PHOS[4], 9, 'left', null);
    n -= line.length + 8;
    if (n < 0 && (f >> 4) % 2) box(c, x + shown.length * 9 + 2, y - 9, 8, 10, PHOS[4]);
    y += 22;
  }
};

const granted = (c: Ctx, f: number, t: number) => {
  const g = CRT, cx = g.x + g.w / 2, cy = g.y + g.h / 2;
  const flash = t < 50 ? (t >> 3) % 2 === 0 : true;
  box(c, g.x + 40, cy - 54, g.w - 80, 108, flash ? PHOS[4] : PHOS[0]);
  box(c, g.x + 46, cy - 48, g.w - 92, 96, flash ? PHOS[0] : PHOS[4]);
  text(c, 'ACCESS GRANTED', cx, cy - 4, flash ? PHOS[5] : PHOS[0], 24, 'center', null);
  if (t > 40) text(c, 'PADDOCK GATES: OPENING', cx, cy + 30, flash ? AMBER : PHOS[0], 10, 'center', null);
  void f;
};

const paintGlass = (g: Ctx) => {
  const r = CRT;
  for (let y = r.y; y < r.y + r.h; y += 3) box(g, r.x, y, r.w, 1, 'rgba(0, 0, 0, 0.28)');
  // (the tube's curve: darker in steps toward the edges, the corners darkest)
  for (let k = 0; k < 4; k++) {
    const a = 0.1 + k * 0.06, m = 18 - k * 5;
    g.fillStyle = `rgba(0, 0, 0, ${a})`;
    g.fillRect(r.x, r.y, r.w, m); g.fillRect(r.x, r.y + r.h - m, r.w, m); g.fillRect(r.x, r.y, m, r.h); g.fillRect(r.x + r.w - m, r.y, m, r.h);
  }
  for (const [cx, cy] of [[r.x, r.y], [r.x + r.w, r.y], [r.x, r.y + r.h], [r.x + r.w, r.y + r.h]]) for (let k = 0; k < 3; k++) { g.fillStyle = `rgba(0, 0, 0, ${0.25 + k * 0.15})`; g.beginPath(); g.arc(cx, cy, 46 - k * 14, 0, Math.PI * 2); g.fill(); }
  // (glare, up left)
  g.fillStyle = 'rgba(220, 255, 230, 0.06)'; g.beginPath(); g.ellipse(r.x + 130, r.y + 70, 120, 40, -0.25, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(220, 255, 230, 0.05)'; g.beginPath(); g.ellipse(r.x + 110, r.y + 60, 60, 16, -0.25, 0, Math.PI * 2); g.fill();
};

const paintBezel = (g: Ctx) => {
  // The plastic: grimy beige, banded darker toward the bottom, dithered at each step; finger grease, a crack, rust
  // round the screws (it's been out in a fake jungle since 1993)
  bandedGradient(g, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, ['#C9BFA6', '#B5AB92', '#9E957E', '#857C68'], 10);
  for (let k = 0; k < 60; k++) box(g, Math.floor(hash(k * 7.1) * CANVAS_WIDTH), Math.floor(hash(k * 3.7) * CANVAS_HEIGHT), 2 + Math.floor(hash(k) * 4), 2, 'rgba(60, 50, 30, 0.18)');
  // The screen's surround: stepped in to the glass (a deep inset, lit from up left)
  const r = CRT;
  for (let k = 0; k < 4; k++) {
    const m = 30 - k * 7;
    box(g, r.x - m, r.y - m, r.w + m * 2, r.h + m * 2, ['#6E6654', '#8A8270', '#4E4838', '#2A261C'][k]);
    box(g, r.x - m, r.y - m, r.w + m * 2, 2, ['#D8CFB6', '#B0A890', '#6A624E', '#3A3428'][k]);
  }
  box(g, r.x - 4, r.y - 4, r.w + 8, r.h + 8, INK);
  // The badge, top: the park's logo, the system's name
  slab(g, 250, 18, 300, 52, '#2E5A3A', { ink: true });
  box(g, 254, 22, 292, 2, '#5E8A6A');
  rexHead(g, 266, 26, 3);
  signAt(g, 'PRE-HYSTERIC PARK', 420, 38, 7, dino({ sx: 1, sy: 2 }, ['#FFF6C0', '#FDE047', '#F2B21E', '#D07A1A'], '#3A1A0A', '#3A1A0A'));
  signAt(g, 'PADDOCK GATE CONTROL', 420, 58, 5, enamel(5, '#F2E8C8', '#122A18'));
  // The model plate, screws, a crack running off one
  slab(g, 590, 468, 150, 22, '#9AA0A6', { ink: true });
  signAt(g, 'MODEL PG-1993', 665, 479, 4, print(4, '#1A1A1A'));
  for (const [sx, sy] of [[24, 24], [776, 24], [24, 576], [776, 576]]) { box(g, sx - 6, sy - 6, 12, 12, '#6A4A2A'); box(g, sx - 5, sy - 5, 10, 10, '#A8A090'); box(g, sx - 4, sy, 8, 1, '#3A3428'); }
  g.strokeStyle = '#4E4838'; g.lineWidth = 1; g.beginPath(); g.moveTo(776, 576); g.lineTo(752, 560); g.lineTo(748, 540); g.lineTo(730, 532); g.stroke();
  // DO NOT TOUCH, big, top right (hazard striped)
  box(g, 608, 14, 170, 60, INK); box(g, 610, 16, 166, 56, '#FACC15');
  for (let k = 0; k < 166; k += 12) { box(g, 610 + k, 16, 6, 6, '#1A1A1A'); box(g, 616 + k, 66, 6, 6, '#1A1A1A'); }
  signAt(g, 'DO NOT TOUCH', 693, 38, 6, stencil(6, '#1A0B06'));
  signAt(g, 'THIS MEANS YOU, GARY', 693, 54, 4, print(4, '#B91C1C'));
  // The keypad, bottom right, and the speaker grille, bottom middle
  slab(g, 590, 498, 104, 84, '#5E5848', { ink: true });
  for (let rr = 0; rr < 4; rr++) for (let q = 0; q < 3; q++) {
    const kx = 598 + q * 32, ky = 504 + rr * 19;
    box(g, kx, ky, 28, 16, INK); box(g, kx, ky, 26, 14, (rr + q) % 4 === 1 ? '#E8E2D0' : '#C8C0AC'); box(g, kx, ky + 12, 26, 2, '#8A8270');
    text(g, rr === 3 ? ['*', '0', '#'][q] : String(rr * 3 + q + 1), kx + 13, ky + 11, '#3A3428', 7, 'center', null);
  }
  for (let k = 0; k < 7; k++) { box(g, 260 + k * 40, 500, 30, 4, '#3A3428'); box(g, 260 + k * 40, 512, 30, 4, '#3A3428'); box(g, 260 + k * 40, 524, 30, 4, '#3A3428'); }
  signAt(g, 'PWR', 708, 540, 4, print(4, '#3A3428'));
  // (somebody's initials scratched in, a Jurassic-era sticker peeling)
  text(g, 'G.R. WAS HERE', 160, 586, 'rgba(60, 50, 30, 0.5)', 6, 'left', null);
  slab(g, 40, 300, 54, 40, '#F97316', { ink: true }); signAt(g, 'I DIG', 67, 314, 4, print(4, '#FFFFFF')); signAt(g, 'DINOS', 67, 326, 4, print(4, '#FFFFFF'));
};

/** The park's dino badge: a T. rex head, pixel by pixel (cells s px). */
const REX = [
  '....#######.',
  '...#########',
  '..###.######',
  '..##########',
  '.###########',
  '.#####......',
  '######.#.#..',
  '#######.....',
  '.######.....',
  '..####......',
];
const rexHead = (g: Ctx, x: number, y: number, s: number) => {
  for (let r = 0; r < REX.length; r++) for (let q = 0; q < REX[r].length; q++) if (REX[r][q] === '#') { box(g, x + q * s - 1, y + r * s - 1, s + 2, s + 2, INK); }
  for (let r = 0; r < REX.length; r++) for (let q = 0; q < REX[r].length; q++) if (REX[r][q] === '#') box(g, x + q * s, y + r * s, s, s, r < 4 ? '#FDE047' : '#F2B21E');
  box(g, x + 5 * s, y + 2 * s, s, s, '#B91C1C');
};
