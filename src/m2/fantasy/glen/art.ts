// The enchanted glen, painted (the prototype first pass: crude but readable; peak-SNES later). The park's storybook
// forest: far off, the sky and the hills with THE GREAT PIXIE'S CASTLE bigger than over the wheel (monument.ts), a
// row of dark forest and giant toadstools in front of them; behind the play plane (dimmed, no lit edges: scenery),
// giant trees hung with fairy lights and more toadstools. In the play plane, lit along every top he can stand on: the
// mossy ground, the cliff, the pillars, the candy cottage's roof, the tree stand, the lair's shelves and its back
// wall. The set pieces: the glen's gate, the storybook bridge (out), the witch's cottage and its oak, the dwarf mine's
// portal and the shaft, the unicorn meadow's rainbow, the dragon's fiberglass bones, the ride's entrance (three dragon
// heads: fire, ice, lightning) and its queue. The signs: storybook shingles on posts (kit.ts storySign), the ride's
// fixed to its front; Piper's PA horns on toadstool posts.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { timeOfDay, farTint } from '../../timeOfDay';
import { signText } from '../../signLetters';
import { box, mix, hash, onScreen, storySign, fairySky, gilt, INK, type Ctx } from '../kit';
import { MONUMENT_AT } from '../monument';
import { GY } from '../geometry';
import { drawToadstool, cauldronAt } from './hazards';
import {
  X, Y, x0, x1, GAP1, GAP2, PIL, COT, CLIFF, P1, P2, P3, L1, LAIR_WALL, STAND, LEDGES, CAULDRONS, PA_AT, QUEUE,
} from './layout';

export const drawGlenBackdrop = (c: Ctx, state: GameState) => {
  fairySky(c, state, MONUMENT_AT.glen, { near: '#1E3A2A' });
  // (a row of dark forest in front of the hills, the castle's crag still clear over it: rounded crowns, a giant
  // toadstool here and there; scrolling a little faster)
  const tod = timeOfDay(), W = CANVAS_WIDTH;
  const off = -((state.camera.x * 0.22) % 720);
  const crown = farTint('#20402E', 0.45, tod), cap = farTint('#9B2C2C', 0.45, tod), spot = farTint('#F5EEDC', 0.45, tod), stalk = farTint('#D8D0BC', 0.45, tod);
  for (let k = -1; k < 3; k++) {
    const bx = off + k * 720;
    for (let i = 0; i < 9; i++) {
      const x = bx + i * 80 + (hash(i + k * 9) - 0.5) * 30, r = 34 + hash(i * 3 + k) * 22;
      c.fillStyle = crown; c.beginPath(); c.arc(x, 446 - r * 0.6, r, 0, Math.PI * 2); c.fill();
    }
    for (const [i, s] of [[1, 1], [5, 0.7]] as const) {
      const x = bx + i * 140 + 40;
      c.fillStyle = stalk; c.fillRect(Math.round(x - 6 * s), Math.round(446 - 70 * s), Math.round(12 * s), Math.round(70 * s));
      c.fillStyle = cap; c.beginPath(); c.ellipse(x, 446 - 70 * s, 44 * s, 26 * s, 0, Math.PI, 0); c.fill();
      c.fillStyle = spot; for (const dx of [-0.5, 0, 0.45]) { c.beginPath(); c.arc(x + dx * 44 * s, 446 - 70 * s - 12 * s, 4 * s, 0, Math.PI * 2); c.fill(); }
    }
  }
  box(c, 0, 446, W, 600 - 446, farTint('#16281E', 0.4, tod));
  // (fireflies, after dark)
  if (tod.lamps > 0.2) for (let i = 0; i < 16; i++) { const x = (i * 97 + state.frame * 0.3 - state.camera.x * 0.22) % W, y = 360 + Math.sin(i + state.frame * 0.03) * 40; if (Math.sin(state.frame * 0.1 + i * 2) > 0.2) box(c, (x + W) % W, y, 2, 2, '#FDE68A'); }
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// The forest behind the play plane (scenery: dimmed)

const DIM = 0.42;
const T = (col: string, dim = DIM) => mix(farTint(col, 0.25, timeOfDay()), timeOfDay().haze, dim);

const tree = (c: Ctx, x: number, w: number, top: number, seed: number) => {
  // (a giant gnarled trunk going up out of the picture, roots spread, a hollow)
  const bark = T('#4A3424'), dark = T('#2E2018');
  c.fillStyle = T(INK); c.beginPath(); c.moveTo(x - w / 2 - 22, GY); c.quadraticCurveTo(x - w / 2, GY - 30, x - w / 2 + 4, top); c.lineTo(x + w / 2 - 4, top); c.quadraticCurveTo(x + w / 2, GY - 30, x + w / 2 + 22, GY); c.closePath(); c.fill();
  c.fillStyle = bark; c.beginPath(); c.moveTo(x - w / 2 - 20, GY); c.quadraticCurveTo(x - w / 2 + 2, GY - 30, x - w / 2 + 6, top); c.lineTo(x + w / 2 - 6, top); c.quadraticCurveTo(x + w / 2 - 2, GY - 30, x + w / 2 + 20, GY); c.closePath(); c.fill();
  box(c, x + w / 2 - 22, top, 14, GY - top, dark);
  for (let y = top + 30; y < GY - 20; y += 46) box(c, x - w / 2 + 14 + (hash(y + seed) * 20), y, 3, 22, dark);
  if (seed % 2) { c.fillStyle = dark; c.beginPath(); c.ellipse(x - 6, GY - 130, 14, 22, 0, 0, Math.PI * 2); c.fill(); }
};

const drawForest = (c: Ctx, state: GameState) => {
  const L = state.camera.x - 300, R = state.camera.x + CANVAS_WIDTH + 300;
  for (let rx = 0; rx < x1 - x0; rx += 520) {
    const x = X(rx + hash(rx) * 180);
    if (x < L || x > R) continue;
    // (no trees where the gorges and the cottage's oak and the ride's front are)
    if ((rx > GAP1.a - 200 && rx < GAP1.b + 100) || (rx > GAP2.a - 200 && rx < GAP2.b + 100) || (rx > QUEUE.a - 400)) continue;
    tree(c, x, 70 + hash(rx * 3) * 40, -2000, Math.floor(rx / 520));
    // (fairy lights strung off it: soft)
    const tod = timeOfDay();
    for (let k = 0; k < 9; k++) { const lx = x + 40 + k * 26, ly = GY - 300 + Math.sin(k * 0.6) * 22 + k * 6; box(c, lx, ly, 3, 3, (state.frame / 20 + k) % 3 < 1.5 ? (tod.lamps > 0.3 ? '#FDE68A' : T('#FDE68A', 0.2)) : T('#F9A8D4', 0.2)); }
  }
  // (giant toadstools behind (not stood on: dimmed, no lit top))
  for (let rx = 260; rx < x1 - x0; rx += 690) {
    const x = X(rx), s = 0.8 + hash(rx) * 0.6;
    if (x < L || x > R) continue;
    if ((rx > GAP1.a - 100 && rx < GAP1.b + 100) || (rx > GAP2.a - 100 && rx < GAP2.b + 100)) continue;
    drawToadstool(c, x, GY - 150 * s, 130 * s, 0, state.frame, 0.5);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The play plane

const SOIL = '#2E2420', MOSS = '#4D7C3A', MOSS_LIT = '#E2F2B0';
const drawGround = (c: Ctx, state: GameState) => {
  const L = state.camera.x - 40, R = state.camera.x + CANVAS_WIDTH + 40;
  const runs: [number, number][] = [[X(-200), X(GAP1.a)], [X(GAP1.b), X(GAP2.a)], [X(GAP2.b), X(x1 - x0 + 200)]];
  for (const [a, b] of runs) {
    const s = Math.max(a, L), e = Math.min(b, R);
    if (e <= s) continue;
    box(c, s, GY, e - s, 600, SOIL);
    box(c, s, GY, e - s, 14, MOSS);
    box(c, s, GY, e - s, 3, MOSS_LIT);
    for (let x = Math.floor(s / 22) * 22; x < e; x += 22) { box(c, x + 4, GY + 6, 6, 2, '#6A9A4A'); box(c, x + 13, GY + 20, 3, 3, '#3A2A24'); if (hash(x) > 0.75) { box(c, x + 8, GY - 4, 2, 4, '#F9A8D4'); box(c, x + 7, GY - 6, 4, 2, '#FDE68A'); } }
  }
};

/** A gorge: its cliffs, mist going down; `mine`: the shaft (dark, timbered, lanterns). */
const drawGorge = (c: Ctx, state: GameState, a: number, b: number, mine: boolean) => {
  if (!onScreen(state, X(a) - 40, X(b) + 40)) return;
  const tod = timeOfDay(), A = X(a), B = X(b);
  if (mine) {
    box(c, A, GY, B - A, 900, farTint('#1A1418', 0.3, tod));
    for (let y = GY + 40; y < GY + 600; y += 90) for (let x = A + 30; x < B; x += 180) { box(c, x, y, 6, 60, farTint('#5A3A1E', 0.3, tod)); box(c, x - 20, y, 46, 6, farTint('#6A4A24', 0.3, tod)); }
    for (let x = A + 120; x < B; x += 260) { c.save(); c.globalAlpha = 0.3; c.fillStyle = '#FDBA74'; c.beginPath(); c.arc(x, GY + 120, 26, 0, Math.PI * 2); c.fill(); c.restore(); box(c, x - 3, GY + 114, 6, 10, '#F59E0B'); }
  } else {
    box(c, A, GY, B - A, 900, farTint('#7E9AC8', 0.5, tod));
    for (let i = 0; i < 5; i++) { c.fillStyle = farTint(['#C8D8F4', '#E0E8FA', '#F4F6FE'][i % 3], 0.4, tod); c.beginPath(); c.ellipse(A + 60 + i * 180, GY + 300 + (i % 2) * 30, 120, 30, 0, 0, Math.PI * 2); c.fill(); }
    c.save(); c.globalAlpha = 0.35; c.fillStyle = '#F5F3FF'; c.fillRect(A, GY + 60, B - A, 50); c.restore();
  }
  for (const [x, dir] of [[A, -1], [B, 1]] as const) {
    c.fillStyle = INK; c.beginPath(); c.moveTo(x, GY); c.lineTo(x - dir * 4, GY + 400); c.lineTo(x + dir * 30, GY + 400); c.lineTo(x + dir * 30, GY); c.closePath(); c.fill();
    c.fillStyle = mine ? '#4A3A34' : '#4A5A48'; c.beginPath(); c.moveTo(x - dir * 2, GY); c.lineTo(x - dir * 6, GY + 400); c.lineTo(x + dir * 30, GY + 400); c.lineTo(x + dir * 30, GY); c.closePath(); c.fill();
  }
};

const ROCK = '#7A8A6A';
/** A solid, lit along its top (standable reads standable): rock with moss over it. */
const solidBox = (c: Ctx, a: number, b: number, top: number, bottom: number, col = ROCK) => {
  box(c, a - 1, top - 1, b - a + 2, bottom - top + 2, INK);
  box(c, a, top, b - a, bottom - top, col);
  box(c, b - 10, top, 10, bottom - top, mix(col, '#000000', 0.22));
  for (let y = top + 16; y < bottom; y += 18) box(c, a + ((y * 3) % 17), y, Math.min(24, b - a - 10), 2, mix(col, '#000000', 0.25));
  box(c, a, top, b - a, 8, MOSS); for (let x = a + 4; x < b - 4; x += 12) box(c, x, top + 8, 4, 3 + ((x * 7) % 5), MOSS);
  box(c, a, top, b - a, 3, MOSS_LIT);
};
/** A one-way shelf (wood, or `rock`), lit along its top. */
const shelf = (c: Ctx, a: number, b: number, y: number, rock = false) => {
  const col = rock ? '#6A6A5A' : '#7A5A3A';
  box(c, a - 1, y - 1, b - a + 2, 14, INK); box(c, a, y, b - a, 12, col); box(c, a, y + 9, b - a, 3, mix(col, '#000000', 0.3)); box(c, a, y, b - a, 3, MOSS_LIT);
  if (!rock) for (let x = a + 14; x < b - 6; x += 30) { box(c, x, y + 12, 4, 10, INK); box(c, x + 1, y + 12, 2, 9, mix(col, '#000000', 0.15)); }
};

// ---------------------------------------------------------------------------------------------------------------
// The set pieces

/** The glen's gate: an arch of twisted branches over the path, hung with lanterns (scenery: dimmed). */
const drawGate = (c: Ctx, state: GameState) => {
  const a = X(40), b = X(230);
  if (!onScreen(state, a - 40, b + 40)) return;
  const w = T('#4A3424', 0.3);
  c.strokeStyle = T(INK, 0.3); c.lineWidth = 16; c.beginPath(); c.moveTo(a, GY); c.quadraticCurveTo(a - 10, GY - 200, (a + b) / 2, GY - 240); c.quadraticCurveTo(b + 10, GY - 200, b, GY); c.stroke();
  c.strokeStyle = w; c.lineWidth = 12; c.stroke();
  for (const [x, y] of [[a + 20, GY - 150], [b - 20, GY - 150], [(a + b) / 2, GY - 226]]) { box(c, x - 4, y, 8, 12, T('#F59E0B', 0.2)); box(c, x - 1, y - 6, 2, 6, T(INK, 0.3)); }
};

/** The storybook bridge, out: its arched ends on each bank, planks dangling, a rope hanging into the gorge. */
const drawBridge = (c: Ctx, state: GameState) => {
  if (!onScreen(state, X(GAP1.a) - 160, X(GAP1.b) + 160)) return;
  const wood = T('#8A5A30', 0.25), dark = T('#5A3A1E', 0.25);
  for (const [x, dir] of [[X(GAP1.a), 1], [X(GAP1.b), -1]] as const) {
    // (the end posts, the rail, the broken arch reaching out a little way, splintered)
    box(c, x - dir * 70 - 4, GY - 70, 8, 70, dark); box(c, x - 4, GY - 60, 8, 60, dark);
    c.strokeStyle = wood; c.lineWidth = 5; c.beginPath(); c.moveTo(x - dir * 70, GY - 66); c.quadraticCurveTo(x, GY - 76, x + dir * 60, GY - 50); c.stroke();
    for (let k = 0; k < 4; k++) { const px = x + dir * (10 + k * 14), py = GY + 6 + k * 4; c.save(); c.translate(px, py); c.rotate(dir * (0.3 + k * 0.25)); box(c, -6, 0, 12, 22, wood); box(c, -6, 0, 12, 2, dark); c.restore(); }
    c.strokeStyle = dark; c.lineWidth = 2; c.beginPath(); c.moveTo(x + dir * 30, GY - 52); c.quadraticCurveTo(x + dir * 50, GY + 60, x + dir * 40, GY + 140); c.stroke();
  }
};

/** The witch's cottage: gingerbread walls, sugar-glass windows, a chocolate-bar door; its roof flat-topped and frosted
 *  (it's stood on: lit), candy canes up its corners, gumdrops, icing dripping over its edges. Behind it, the oak whose
 *  branches the cauldrons hang off. */
const drawCottage = (c: Ctx, state: GameState) => {
  if (!onScreen(state, X(COT.a) - 500, X(COT.b) + 500)) return;
  // (the trees whose branches carry the cauldrons: behind, dimmed)
  for (let i = 0; i < CAULDRONS.length; i++) {
    const [px, ph] = CAULDRONS[i], tx = X(px) + (i === 1 ? -200 : 170), k = cauldronAt(state, i);
    tree(c, tx, 60, Y(ph) - 60, i);
    c.strokeStyle = T(INK); c.lineWidth = 14; c.beginPath(); c.moveTo(tx, Y(ph) - 30); c.quadraticCurveTo((tx + k.px) / 2, Y(ph) - 40, k.px + (tx < k.px ? 70 : -70), k.py - 3); c.stroke();
    c.strokeStyle = T('#4A3424'); c.lineWidth = 10; c.stroke();
  }
  const a = X(COT.a), b = X(COT.b), top = Y(COT.top);
  // (the walls)
  box(c, a - 1, top - 1, b - a + 2, GY - top + 2, INK);
  box(c, a, top, b - a, GY - top, '#B8743A'); box(c, b - 14, top, 14, GY - top, '#8A5A30');
  for (let y = top + 40; y < GY; y += 40) for (let x = a + 8; x < b - 14; x += 24) box(c, x, y, 10, 3, '#FFF7ED');
  // (two sugar-glass windows, a chocolate-bar door)
  for (const wx of [a + 50, b - 110]) { box(c, wx - 1, top + 60, 52, 42, INK); box(c, wx, top + 61, 50, 40, timeOfDay().lamps > 0.3 ? '#FDE68A' : '#BAE6FD'); box(c, wx + 24, top + 61, 2, 40, '#F472B6'); box(c, wx, top + 80, 50, 2, '#F472B6'); }
  const dx = (a + b) / 2 - 24;
  box(c, dx - 1, GY - 90, 50, 90, INK); box(c, dx, GY - 89, 48, 89, '#5A2E12');
  for (let y = GY - 84; y < GY - 6; y += 20) for (const xx of [dx + 4, dx + 26]) box(c, xx, y, 18, 16, '#7A3E1A');
  // (the roof: frosting over the top, drips over the edges, gumdrops, candy-cane corners)
  box(c, a - 8, top - 10, b - a + 16, 14, INK); box(c, a - 7, top - 9, b - a + 14, 12, '#FBCFE8');
  for (let x = a; x < b; x += 26) { c.fillStyle = '#FBCFE8'; c.beginPath(); c.ellipse(x + 10, top + 4, 7, 9 + (x % 3) * 3, 0, 0, Math.PI); c.fill(); }
  box(c, a - 7, top - 9, b - a + 14, 3, '#FFF7ED');
  for (const [x, col] of [[a + 60, '#EF4444'], [a + 160, '#22C55E'], [a + 260, '#3B82F6']] as const) { c.fillStyle = INK; c.beginPath(); c.ellipse(x, top - 9, 9, 6, 0, Math.PI, 0); c.fill(); c.fillStyle = col; c.beginPath(); c.ellipse(x, top - 9, 7, 5, 0, Math.PI, 0); c.fill(); }
  for (const x of [a - 4, b + 4]) { box(c, x - 4, top, 8, GY - top, '#FFFFFF'); for (let y = top + 4; y < GY; y += 16) box(c, x - 4, y, 8, 6, '#DC2626'); }
  // (the woodpile round the back)
  const wa = X(6690), wb = X(6770);
  for (let r = 0; r < 4; r++) for (let k = 0; k < 4 - r; k++) { const lx = wa + 8 + k * 18 + r * 9, ly = GY - 14 - r * 24; c.fillStyle = INK; c.beginPath(); c.arc(lx + 8, ly, 11, 0, Math.PI * 2); c.fill(); c.fillStyle = '#8A5A30'; c.beginPath(); c.arc(lx + 8, ly, 9.5, 0, Math.PI * 2); c.fill(); c.fillStyle = '#C8A070'; c.beginPath(); c.arc(lx + 8, ly, 5, 0, Math.PI * 2); c.fill(); }
  shelf(c, wa, wb, Y(105));
};

/** The dwarf mine's portal in the hillside (scenery: dimmed), its rails, a cart of fake gems. */
const drawMine = (c: Ctx, state: GameState) => {
  const a = X(7500), b = X(8150);
  if (!onScreen(state, a - 100, b + 100)) return;
  c.fillStyle = T('#4A5A3A'); c.beginPath(); c.moveTo(a - 100, GY); c.quadraticCurveTo((a + b) / 2, GY - 420, b + 60, GY); c.closePath(); c.fill();
  const m = X(7820);
  box(c, m - 70, GY - 150, 140, 150, T(INK)); box(c, m - 60, GY - 140, 120, 140, T('#0A0808', 0.2));
  box(c, m - 76, GY - 156, 16, 156, T('#6A4A24')); box(c, m + 60, GY - 156, 16, 156, T('#6A4A24')); box(c, m - 84, GY - 166, 168, 16, T('#7A5A2A'));
  for (let x = m - 60; x < m + 60; x += 16) box(c, x, GY - 6, 8, 6, T('#5A4030'));
  box(c, m - 60, GY - 10, 120, 3, T('#9CA3AF'));
  // (the cart of gems by the portal)
  const cx = X(8040);
  box(c, cx - 30, GY - 40, 60, 30, T('#5A5862')); for (const k of [-16, 0, 16]) box(c, cx + k - 5, GY - 50, 10, 10, T(['#A78BFA', '#F472B6', '#60A5FA'][(k + 16) / 16]));
  for (const k of [-18, 18]) { c.fillStyle = T(INK); c.beginPath(); c.arc(cx + k, GY - 8, 7, 0, Math.PI * 2); c.fill(); }
};

/** The meadow: a rainbow arch far behind (dimmed), the tree stand's trunk. */
const drawMeadow = (c: Ctx, state: GameState) => {
  const a = X(GAP2.b + 200), b = X(11000);
  if (onScreen(state, a, b)) {
    const cx = X(10300), R = 520;
    ['#F87171', '#FBBF24', '#FDE047', '#4ADE80', '#60A5FA', '#A78BFA'].forEach((col, i) => { c.strokeStyle = T(col, 0.55); c.lineWidth = 12; c.beginPath(); c.arc(cx, GY + 40, R - i * 12, Math.PI, 0); c.stroke(); });
  }
  if (onScreen(state, X(STAND.a) - 60, X(STAND.b) + 60)) {
    // (the tree the stand's built round: its trunk behind the stand, a ladder of nailed boards up it (scenery))
    tree(c, X((STAND.a + STAND.b) / 2), 50, -2000, 3);
    for (let y = Y(STAND.h) + 30; y < GY - 20; y += 34) box(c, X(STAND.a) + 40, y, 30, 4, T('#8A5A30', 0.3));
  }
};

/** The dragon's lair: the cave behind (dark rock), the fiberglass dragon's bones (a skull with its price tag, ribs),
 *  a pile of foam gold. */
const drawLair = (c: Ctx, state: GameState) => {
  const a = X(11080), b = X(13060);
  if (!onScreen(state, a - 100, b + 100)) return;
  c.fillStyle = T('#2E2A30', 0.25); c.beginPath(); c.moveTo(a, GY); c.quadraticCurveTo(a + 60, GY - 640, (a + b) / 2, GY - 700); c.quadraticCurveTo(b - 60, GY - 640, b, GY); c.closePath(); c.fill();
  const bone = T('#E8E0C8', 0.35), shade = T('#B8AE94', 0.35);
  // (the ribs, arching up out of the floor)
  for (let k = 0; k < 6; k++) { const x = X(11480 + k * 90); c.strokeStyle = bone; c.lineWidth = 10; c.beginPath(); c.moveTo(x, GY); c.quadraticCurveTo(x + 20, GY - 260 + k * 10, x + 80, GY - 300 + k * 12); c.stroke(); c.strokeStyle = shade; c.lineWidth = 3; c.stroke(); }
  // (the skull: on the floor by the way in, its jaw open, a price tag on a string off a horn)
  const sx = X(11250), sy = GY - 10;
  c.fillStyle = bone; c.beginPath(); c.moveTo(sx - 80, sy); c.lineTo(sx - 90, sy - 70); c.quadraticCurveTo(sx - 40, sy - 120, sx + 40, sy - 90); c.lineTo(sx + 110, sy - 50); c.lineTo(sx + 100, sy - 30); c.lineTo(sx - 20, sy - 40); c.closePath(); c.fill();
  c.fillStyle = T('#1A1418', 0.3); c.beginPath(); c.arc(sx - 30, sy - 78, 13, 0, Math.PI * 2); c.fill();
  c.fillStyle = bone; c.beginPath(); c.moveTo(sx - 60, sy); c.lineTo(sx + 100, sy - 10); c.lineTo(sx + 90, sy); c.closePath(); c.fill();
  for (let k = 0; k < 6; k++) box(c, sx + k * 18, sy - 40, 5, 10, bone);
  c.strokeStyle = bone; c.lineWidth = 8; c.beginPath(); c.moveTo(sx - 60, sy - 104); c.quadraticCurveTo(sx - 110, sy - 150, sx - 140, sy - 140); c.stroke();
  box(c, sx - 146, sy - 132, 22, 14, T('#FFF7ED', 0.3)); box(c, sx - 142, sy - 128, 14, 2, T('#9B1C1C', 0.3)); box(c, sx - 142, sy - 124, 10, 2, T('#9B1C1C', 0.3));
  // (the foam gold, heaped by the far wall)
  for (let k = 0; k < 9; k++) { c.fillStyle = T('#E0AE3A', 0.3); c.beginPath(); c.ellipse(X(12100) + k * 24, GY - 6 - (k % 3) * 8, 16, 8, 0, Math.PI, 0); c.fill(); }
};

/** TRUELLING TRAGONS' entrance: a storybook keep's front, three dragon heads over the door (fire, ice, lightning), the
 *  name fixed across it, the dark way in; the queue's rails in front (scenery). */
const drawRide = (c: Ctx, state: GameState) => {
  const a = X(QUEUE.a - 40), b = X(QUEUE.b + 260);
  if (!onScreen(state, a - 200, b + 200)) return;
  const f = state.frame;
  // (the keep's front)
  const top = GY - 360;
  box(c, a - 1, top - 1, b - a + 2, GY - top + 2, T(INK, 0.2));
  box(c, a, top, b - a, GY - top, T('#7A6A9A', 0.2));
  for (let x = a; x < b; x += 40) box(c, x, top - 24, 24, 24, T('#7A6A9A', 0.2));
  for (let y = top + 30; y < GY; y += 30) box(c, a, y, b - a, 2, T('#5A4A7A', 0.2));
  // (the door: dark, in, an arch)
  const d = X(QUEUE.door);
  box(c, d - 50, GY - 150, 120, 150, T(INK, 0.1)); c.fillStyle = '#0A0612'; c.beginPath(); c.moveTo(d - 44, GY); c.lineTo(d - 44, GY - 110); c.quadraticCurveTo(d + 10, GY - 160, d + 64, GY - 110); c.lineTo(d + 64, GY); c.closePath(); c.fill();
  // (the ride's PA horn over the door: Piper calls trial two out of it)
  c.fillStyle = INK; c.beginPath(); c.moveTo(d + 4, GY - 178); c.lineTo(d + 36, GY - 196); c.lineTo(d + 36, GY - 160); c.closePath(); c.fill();
  c.fillStyle = T('#F472B6', 0.15); c.beginPath(); c.moveTo(d + 6, GY - 178); c.lineTo(d + 34, GY - 193); c.lineTo(d + 34, GY - 163); c.closePath(); c.fill();
  // (the three dragon heads over the door, their elements)
  const heads: [number, string, string][] = [[d - 160, '#DC2626', 'fire'], [d + 10, '#38BDF8', 'ice'], [d + 180, '#FACC15', 'bolt']];
  for (const [hx, col, kind] of heads) {
    const hy = GY - 250;
    c.fillStyle = INK; c.beginPath(); c.moveTo(hx - 40, hy - 30); c.lineTo(hx + 50, hy - 10); c.lineTo(hx + 50, hy + 20); c.lineTo(hx - 40, hy + 34); c.closePath(); c.fill();
    c.fillStyle = T(col, 0.15); c.beginPath(); c.moveTo(hx - 37, hy - 27); c.lineTo(hx + 47, hy - 8); c.lineTo(hx + 47, hy + 18); c.lineTo(hx - 37, hy + 31); c.closePath(); c.fill();
    box(c, hx + 10, hy - 14, 8, 6, '#FFF7ED'); box(c, hx + 14, hy - 13, 3, 4, INK);
    for (const s of [-1, 1]) { c.fillStyle = T('#F5F0DC', 0.15); c.beginPath(); c.moveTo(hx - 30, hy - 20 + s * 4); c.lineTo(hx - 60, hy - 50 + s * 6); c.lineTo(hx - 22, hy - 26 + s * 4); c.closePath(); c.fill(); }
    // (their breath: fire flickering, ice glittering, lightning sparking)
    const mx = hx + 52, my = hy + 6;
    if (kind === 'fire') for (let k = 0; k < 3; k++) box(c, mx + k * 8, my - 4 + ((f + k * 3) % 6) - 3, 8, 6, ['#FDE047', '#F97316', '#DC2626'][(f / 4 + k) % 3 | 0]);
    if (kind === 'ice') for (let k = 0; k < 4; k++) { box(c, mx + k * 7, my + 12, 3, 8 + (k % 2) * 6, '#E0F2FE'); if ((f + k * 9) % 30 < 4) box(c, mx + k * 7, my - 2, 2, 2, '#FFFFFF'); }
    if (kind === 'bolt' && f % 40 < 8) { c.strokeStyle = '#FEF08A'; c.lineWidth = 2; c.beginPath(); c.moveTo(mx, my); c.lineTo(mx + 10, my + 8); c.lineTo(mx + 4, my + 12); c.lineTo(mx + 18, my + 22); c.stroke(); }
  }
  // (the name, fixed across the front on its own board, in gilt)
  const sx = d + 10, sy = GY - 330;
  box(c, sx - 220, sy - 22, 440, 44, INK); box(c, sx - 218, sy - 20, 436, 40, '#3B0764'); box(c, sx - 218, sy - 20, 436, 2, '#E0AE3A'); box(c, sx - 218, sy + 18, 436, 2, '#E0AE3A');
  signText(c, 'TRUELLING TRAGONS', sx, sy + 8, gilt(3));
  // (the queue's rails, a switchback in front of the door)
  const rail = T('#C8A070', 0.15);
  for (const ry of [GY - 34, GY - 20]) box(c, X(QUEUE.a), ry, X(QUEUE.door) - 50 - X(QUEUE.a), 3, rail);
  for (let x = X(QUEUE.a); x < X(QUEUE.door) - 50; x += 60) box(c, x, GY - 36, 4, 36, rail);
};

/** Piper's PA horn, on a toadstool-capped post (scenery: dimmed, no lit top), pink-glowing while she's talking. */
const paPost = (c: Ctx, x: number, talking: boolean, f: number) => {
  box(c, x - 4, GY - 220, 8, 220, T('#3A3448', 0.25));
  c.fillStyle = T('#9B2C2C', 0.25); c.beginPath(); c.ellipse(x, GY - 222, 26, 14, 0, Math.PI, 0); c.fill();
  for (const dx of [-12, 2, 14]) box(c, x + dx - 2, GY - 230, 4, 3, T('#F5EEDC', 0.25));
  // (the horn: a pink flared trumpet off the post)
  c.fillStyle = INK; c.beginPath(); c.moveTo(x + 2, GY - 196); c.lineTo(x + 34, GY - 214); c.lineTo(x + 34, GY - 176); c.closePath(); c.fill();
  c.fillStyle = T('#F472B6', 0.2); c.beginPath(); c.moveTo(x + 4, GY - 196); c.lineTo(x + 32, GY - 211); c.lineTo(x + 32, GY - 179); c.closePath(); c.fill();
  if (talking) { c.save(); c.globalAlpha = 0.35 + 0.2 * Math.sin(f * 0.5); c.strokeStyle = '#F9A8D4'; c.lineWidth = 2; for (let k = 1; k <= 3; k++) { c.beginPath(); c.arc(x + 34, GY - 195, 6 + k * 8 + (f % 8), -0.6, 0.6); c.stroke(); } c.restore(); }
};

// ---------------------------------------------------------------------------------------------------------------

/** Behind everything that moves. `piperX`: the horn she's talking out of, if she is. */
export const drawGlenBack = (c: Ctx, state: GameState, piperX: number | null) => {
  drawForest(c, state);
  drawMeadow(c, state);
  drawLair(c, state);
  drawMine(c, state);
  drawRide(c, state);
  drawGate(c, state);
  drawGorge(c, state, GAP1.a, GAP1.b, false);
  drawGorge(c, state, GAP2.a, GAP2.b, true);
  drawGround(c, state);
  drawBridge(c, state);
  drawCottage(c, state);
  for (const [x] of PA_AT) if (onScreen(state, X(x) - 60, X(x) + 80)) paPost(c, X(x), piperX === X(x), state.frame);
  // (the solids: the cliff, the bridge's pillar, the shaft's timbered pillars, the lair's back wall; the cottage is drawn above)
  const solids: [number, number, number, number, string?][] = [
    [CLIFF.a, CLIFF.b, CLIFF.top, 0], [PIL.a, PIL.b, 0, -1600],
    [P1.a, P1.a + P1.w, P1.top, -1600, '#6A5A4A'], [P2.a, P2.a + P2.w, P2.top, -1600, '#6A5A4A'], [P3.a, P3.a + P3.w, P3.top, -1600, '#6A5A4A'],
    [LAIR_WALL.a, LAIR_WALL.b, LAIR_WALL.top, 0, '#5A5660'],
  ];
  for (const [a, b, top, bot, col] of solids) if (onScreen(state, X(a) - 20, X(b) + 20)) solidBox(c, X(a), X(b), Y(top), Y(bot), col);
  for (const [a, b, h] of LEDGES) {
    if (!onScreen(state, X(a) - 20, X(b) + 20) || a === 6690) continue;
    shelf(c, X(a), X(b), Y(h), a >= L1.a);
  }
  // (the tree stand's rail, so it reads as a stand)
  if (onScreen(state, X(STAND.a), X(STAND.b))) { box(c, X(STAND.a), Y(STAND.h) - 22, STAND.b - STAND.a, 3, '#5A3A1E'); for (const x of [STAND.a + 2, STAND.b - 6]) box(c, X(x), Y(STAND.h) - 22, 4, 22, '#5A3A1E'); }
  // (the signs, on their posts)
  const signs: [number, string[], object?][] = [
    [470, ['THE ENCHANTED GLEN', 'MIND THE MUSHROOMS']], [1580, ['TOADSTOOL HOLLOW']], [2620, ['THE BRIAR PATCH', 'PLEASE STAY ON THE PATH']],
    [4080, ['THE STORYBOOK BRIDGE', 'CLOSED FOR REFURBISHMENT'], { warn: true }], [5420, ["THE WITCH'S COTTAGE", 'DO NOT EAT THE HOUSE']],
    [7540, ['THE DWARF MINE', 'HARD HATS REQUIRED']], [GAP2.b + 80, ['UNICORN MEADOW', 'NO RIDING THE UNICORNS']],
    [11120, ["THE DRAGON'S LAIR", 'THE BONES ARE FIBERGLASS']], [13250, ['WAIT TIME', '3 SUITORS'], { board: '#3B0764' }],
  ];
  for (const [x, words, o] of signs) if (onScreen(state, X(x) - 160, X(x) + 160)) storySign(c, X(x), GY, words, o as { warn?: boolean });
};

/** The lamps after dark: the glowing toadstools, the mine's lanterns, the ride's front. */
export const glenLamps = (state: GameState): Light[] => {
  if (timeOfDay().lamps < 0.05) return [];
  const out: Light[] = [];
  for (const x of [135, 1760, 2430, 2900, 3400, 6000, 7820, 10420, 10660, 11560, 12200, QUEUE.door]) if (onScreen(state, X(x) - 200, X(x) + 200)) out.push({ x: X(x), y: GY - 110, r: 110, a: 0.5, color: x === QUEUE.door ? '#F0ABFC' : '#FBCFE8' });
  return out;
};
