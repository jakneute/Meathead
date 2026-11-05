// THE LAZY RIVER, drawn (a crude first pass: readable boxes and strokes, the SNES pass comes later). Hour 11, the small
// hours; the river on fire lighting everything from below.
//
// Depth, back to front (each step's own draw, in this order):
//   the backdrop (screen space): level 1's sky and far horizon (park1/art.ts), a red glow low along it off the fire,
//     the smoke hanging over the river (dark, banded, drifting).
//   drawBack2 (world, behind everything that moves): the far bank (dimmed: the jungle-themed rockwork, burning palms
//     along it: nothing to stand on); the pergola's posts back in the river (dimmed), the river itself (its oily water,
//     the burning surface: fire.ts), its channel walls under the decks' edges; the jets; the footbridges' far posts;
//     the tube rental and the dock at the head; the decks (lit top edges: stood on); the patches burning on them; the
//     signs on the decks; the logs (logs.ts), the towers (towers.ts), the vines and their beams (vines.ts); the grotto
//     (its rock, its door, inside: the back wall, his beanbag, the lava lamp, the bong); level 3's gate building.
//   (the engine: enemies, him; the shots and the son over them)
//   drawFront2 (world, in front of him): the footbridges' hung walls and near posts; the grotto's mouth's near rock.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH as W, CANVAS_HEIGHT as H } from '../../../m1/constants';
import { stamp } from '../../../m1/game/render/stamp';
import { mix, hazeBands } from '../../intro/art/kit';
import { sign } from '../park1/art';
import { GY, B, DECKS, HEAD, RIVER, RIVER_Y, SIGNS2, GROTTO, L3, L2_FROM, VINES2, JETS } from './geo';
import { flame, fireRow, FIRE } from './fire';
import { L2 } from '../park1/geo';

type Ctx = CanvasRenderingContext2D;
const INK = '#0A0604';
const R = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const vis = (state: GameState, a: number, b: number, m = 80) => b > state.camera.x - m && a < state.camera.x + W + m;
/** Scenery behind the play, dimmed toward the night air (nothing back there to stand on). */
const dim = (col: string, k = 0.5) => mix(col, '#0A0818', k);

// ---------------------------------------------------------------------------------------------------------------
// The backdrop's extra (screen space, over level 1's): the fire's glow low along the horizon, the smoke over the river

export const drawBackdrop2 = (c: Ctx, state: GameState) => {
  const f = state.frame, cy = state.camera.y, horizon = Math.round(GY - 120 - cy);
  hazeBands(c, 0, horizon - 120, W, 160, '#B91C1C', 0, 0.28, 6);
  // (the smoke: big dark banks drifting slowly left, parallax a little)
  for (let i = 0; i < 7; i++) {
    const x = ((i * 190 - state.camera.x * 0.25 - f * 0.15) % (W + 300) + W + 300) % (W + 300) - 150, y = horizon - 140 - (i % 3) * 60;
    c.globalAlpha = 0.32; c.fillStyle = '#1A1218';
    c.beginPath(); c.ellipse(x, y, 140, 34, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#2A1A20'; c.beginPath(); c.ellipse(x - 30, y - 10, 90, 22, 0, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The far bank (world, dimmed): fake jungle rockwork along the river's far side, palms on it, burning

const FAR_TILE = 480;
const paintFarBank = (g: Ctx, k: number) => {
  // (the rockwork: humps of fiberglass rock in steps, dimmed; the waterline's glow)
  const rk = ['#2A2026', '#3A2C30', '#4A383A', '#5A4644'].map(c => dim(c, 0.35));
  R(g, 0, GY - 70, FAR_TILE, 70, rk[0]);
  for (let i = 0; i < 6; i++) {
    const x = i * 80 + hash(k * 7 + i) * 30, w = 70 + hash(k + i * 3) * 50, h = 40 + hash(k * 3 + i) * 60;
    g.fillStyle = rk[1]; g.beginPath(); g.ellipse(x + w / 2, GY - 40, w / 2, h, 0, Math.PI, 0); g.fill();
    g.fillStyle = rk[2]; g.beginPath(); g.ellipse(x + w / 2 - 8, GY - 44, w / 3, h * 0.7, 0, Math.PI, 0); g.fill();
    R(g, x + w * 0.3, GY - 40 - h * 0.8, w * 0.2, 2, rk[3]);
  }
  // (palms: two or three, leaning, their trunks ringed; the crowns are the live fire's (drawn over))
  for (let i = 0; i < 3; i++) {
    const x = 60 + i * 160 + hash(k * 11 + i) * 60, h = 200 + hash(k + i) * 90, lean = (hash(k * 5 + i) - 0.5) * 60;
    g.strokeStyle = dim('#2A1A10', 0.3); g.lineWidth = 9; g.beginPath(); g.moveTo(x, GY - 40); g.quadraticCurveTo(x + lean * 0.3, GY - 40 - h * 0.6, x + lean, GY - 40 - h); g.stroke();
    g.strokeStyle = dim('#4A3020', 0.3); g.lineWidth = 5; g.stroke();
    // (the burnt fronds: black ribs)
    for (let a = 0; a < 6; a++) { const ang = Math.PI + 0.3 + a * 0.5; g.strokeStyle = '#120A08'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + lean, GY - 40 - h); g.quadraticCurveTo(x + lean + Math.cos(ang) * 30, GY - 40 - h + Math.sin(ang) * 20 - 10, x + lean + Math.cos(ang) * 50, GY - 40 - h + Math.sin(ang) * 30 + 14); g.stroke(); }
  }
};
const palmTops = (k: number) => [0, 1, 2].map(i => ({ x: 60 + i * 160 + hash(k * 11 + i) * 60 + (hash(k * 5 + i) - 0.5) * 60, y: GY - 40 - (200 + hash(k + i) * 90) }));

const drawFarBank = (c: Ctx, state: GameState) => {
  const f = state.frame, x0 = Math.max(HEAD - 600, Math.floor((state.camera.x - 100) / FAR_TILE) * FAR_TILE), x1 = Math.min(L3.wall, state.camera.x + W + 100);
  for (let tx = x0 - (x0 % FAR_TILE); tx < x1; tx += FAR_TILE) {
    const k = Math.floor(tx / FAR_TILE);
    c.save(); c.translate(tx, -70); stamp(c, `wp2-farbank-${k % 8}`, 0, GY - 420, FAR_TILE, 420, g => paintFarBank(g, k % 8)); c.restore();
    // (their crowns burning: live, stamped flames)
    for (const p of palmTops(k % 8)) fireRow(c, tx + p.x - 26, tx + p.x + 26, p.y - 70 + 10, 30, f, 16, k * 3);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The decks: a boardwalk of planks on piles, its top edge lit (stood on); the channel's concrete under it

const DECK_T = 64;
const paintDeck = (g: Ctx, k: number) => {
  // (the top: the lit lip, the planks' ends in steps, a nail or two)
  R(g, 0, GY, DECK_T, 3, '#F0D8A8'); R(g, 0, GY + 3, DECK_T, 2, '#C8A070');
  for (let x = 0; x < DECK_T; x += 16) { R(g, x, GY + 5, 15, 12, ['#8A6238', '#7A5430', '#946A3E', '#82582E'][(x / 16 + k) % 4]); R(g, x, GY + 5, 15, 1, '#A88050'); R(g, x + 15, GY + 5, 1, 12, '#3A2412'); R(g, x + 3, GY + 8, 1, 1, '#2A1A0A'); }
  // (the stringer under it, dark; the piles going down to the channel's wall)
  R(g, 0, GY + 17, DECK_T, 6, '#3A2412'); R(g, 0, GY + 17, DECK_T, 1, '#5A3A1C');
  R(g, 0, GY + 23, DECK_T, 60, '#2A2420'); for (let y = GY + 30; y < GY + 83; y += 12) R(g, 0, y, DECK_T, 1, '#3A322C');
  if (k % 2 === 0) { R(g, 20, GY + 23, 10, 60, '#3A2412'); R(g, 20, GY + 23, 2, 60, '#5A3A1C'); }
};
const drawDecks = (c: Ctx, state: GameState) => {
  const bot = state.camera.y + H + 40;
  for (const [a, b] of DECKS) {
    if (!vis(state, a, b, 20)) continue;
    const x0 = Math.max(a, state.camera.x - 40), x1 = Math.min(b, state.camera.x + W + 40);
    c.save(); c.beginPath(); c.rect(x0, GY, x1 - x0, bot - GY); c.clip();
    for (let tx = Math.floor(x0 / DECK_T) * DECK_T; tx < x1; tx += DECK_T) { const k = Math.floor(hash(tx / DECK_T + 0.5) * 4); c.save(); c.translate(tx, 0); stamp(c, `wp2-deck-${k}`, 0, GY, DECK_T, 84, g => paintDeck(g, k)); c.restore(); }
    if (bot > GY + 84) R(c, x0, GY + 84, x1 - x0, bot - GY - 84, '#1A1410');
    c.restore();
    // (its ends: the boardwalk's cut end, lit at the corner; charred where the fire's got at it)
    for (const e of [a, b]) if (e > x0 - 2 && e < x1 + 2) { const s = e === a ? 0 : -6; R(c, e + s, GY, 6, 3, '#FFF0C8'); R(c, e + s, GY + 3, 6, 30, '#2A1A10'); R(c, e + s, GY + 12, 6, 6, '#120A06'); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The pergola: posts back in the river (dimmed) under each vine's beam, its crossbeams up off the top of the screen

const drawPergola = (c: Ctx, state: GameState) => {
  for (const v of VINES2) {
    if (!vis(state, v.x - 70, v.x + 70)) continue;
    for (const dx of [-50, 50]) { R(c, v.x + dx - 4, v.y - 200, 9, RIVER_Y - v.y + 200, dim('#2A1A10', 0.55)); R(c, v.x + dx - 4, v.y - 200, 2, RIVER_Y - v.y + 200, dim('#4A3020', 0.55)); }
    R(c, v.x - 60, v.y - 26, 120, 8, dim('#2A1A10', 0.5));
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The head: the tube rental hut (back, dimmed), its stacks of tubes, the dock at the end where the son was

const HUT_X = B + 160;
const paintHead = (g: Ctx) => {
  // (the hut: thatch roof, bamboo posts, a counter; TUBE RENTAL on a board; behind the play: dimmed)
  const d = (col: string) => dim(col, 0.35);
  R(g, HUT_X, GY - 150, 260, 150, d('#3A2A1A')); R(g, HUT_X + 6, GY - 140, 248, 70, d('#140C08'));
  R(g, HUT_X, GY - 70, 260, 10, d('#6A4A2A')); R(g, HUT_X, GY - 70, 260, 2, d('#9A7448'));
  g.fillStyle = d('#7A6438'); g.beginPath(); g.moveTo(HUT_X - 30, GY - 140); g.lineTo(HUT_X + 130, GY - 210); g.lineTo(HUT_X + 290, GY - 140); g.closePath(); g.fill();
  for (let x = HUT_X - 26; x < HUT_X + 290; x += 8) R(g, x, GY - 146 + Math.abs(x - HUT_X - 130) * 0.0, 3, 8, d('#5A4A28'));
  R(g, HUT_X + 60, GY - 190, 140, 28, d('#0E7490')); g.font = '10px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = d('#FEF3C7'); g.fillText('TUBE RENTAL', HUT_X + 130, GY - 171); g.textAlign = 'left';
  // (stacks of tubes against it, in the park's colors)
  const C = ['#EC4899', '#22D3EE', '#FACC15', '#A3E635', '#F97316'];
  for (let s = 0; s < 3; s++) for (let k = 0; k < 4 + s; k++) { const x = HUT_X + 280 + s * 54, y = GY - 10 - k * 14; g.fillStyle = INK; g.beginPath(); g.ellipse(x, y, 24, 8, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = d(C[(s + k) % 5]); g.beginPath(); g.ellipse(x, y, 22, 6.5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = d('#0A0608'); g.beginPath(); g.ellipse(x, y - 1, 8, 2, 0, 0, Math.PI * 2); g.fill(); }
};
const drawHead = (c: Ctx, state: GameState) => {
  if (!vis(state, HUT_X - 60, HEAD + 60)) return;
  stamp(c, 'wp2-head', HUT_X - 40, GY - 220, 520, 222, g => paintHead(g));
  // (the dock's end over the river: a few planks out past the deck, posts down into it, a mooring cleat; drawn on
  // the deck's own run (it is the deck's end))
  R(c, HEAD - 6, GY + 3, 8, RIVER_Y - GY + 8, '#3A2412');
};

// ---------------------------------------------------------------------------------------------------------------
// The grotto: SKULL GROTTO, the river's cave (fiberglass rock in a skull's shape over the mouth: its eye holes, its
// teeth over the door), the son's hangout inside (the back wall in purple rock, his beanbag, a lava lamp, a bong, a
// black-light poster); its back wall at the right (opened after: the way out to level 3)

const ROCK = ['#1A1218', '#2A1E26', '#3A2A34', '#4E3A46', '#6A525E'];
const CAVE_TOP = GY - 470;
const paintGrotto = (g: Ctx) => {
  const L = GROTTO.L, Rr = GROTTO.R;
  // (inside: the back wall, rock in bands, lit purple by the lamp; the floor's rug)
  R(g, L, CAVE_TOP, Rr - L, GY - CAVE_TOP, ROCK[1]);
  for (let y = CAVE_TOP + 20; y < GY; y += 40) for (let x = L + ((y / 40) % 2) * 30; x < Rr; x += 70) { g.fillStyle = ROCK[2]; g.beginPath(); g.ellipse(x + 30, y + 12, 34, 16, 0, 0, Math.PI * 2); g.fill(); R(g, x + 10, y, 30, 2, ROCK[3]); }
  hazeBands(g, L, CAVE_TOP, Rr - L, 160, '#05030A', 0.6, 0, 5);
  // (a black-light poster: a skull in a triangle, glowing; another, torn)
  R(g, L + 220, GY - 300, 90, 120, INK); R(g, L + 224, GY - 296, 82, 112, '#1A0A2A');
  g.strokeStyle = '#A3E635'; g.lineWidth = 3; g.beginPath(); g.moveTo(L + 265, GY - 280); g.lineTo(L + 296, GY - 200); g.lineTo(L + 234, GY - 200); g.closePath(); g.stroke();
  g.fillStyle = '#F0ABFC'; g.beginPath(); g.ellipse(L + 265, GY - 226, 12, 11, 0, 0, Math.PI * 2); g.fill(); R(g, L + 259, GY - 228, 4, 4, '#1A0A2A'); R(g, L + 268, GY - 228, 4, 4, '#1A0A2A');
  R(g, Rr - 330, GY - 280, 70, 90, INK); R(g, Rr - 326, GY - 276, 62, 82, '#2A0A18'); g.font = '8px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = '#F472B6'; g.fillText('NOTHING', Rr - 295, GY - 240); g.fillText('MATTERS', Rr - 295, GY - 226); g.textAlign = 'left';
  // (the rug: round, black and purple rings)
  for (let k = 0; k < 4; k++) { g.fillStyle = ['#1A0A20', '#3A1450', '#1A0A20', '#2A0E3A'][k]; g.beginPath(); g.ellipse(L + 420, GY - 2, 240 - k * 50, 10 - k * 2, 0, 0, Math.PI * 2); g.fill(); }
  // (the lava lamp on a crate; the bong; a pizza box)
  R(g, Rr - 240, GY - 40, 44, 40, '#4A3220'); R(g, Rr - 240, GY - 40, 44, 3, '#7A5A38');
  R(g, Rr - 228, GY - 96, 20, 56, INK); R(g, Rr - 226, GY - 94, 16, 52, '#7E22CE'); R(g, Rr - 230, GY - 46, 24, 6, '#A1A1AA'); R(g, Rr - 228, GY - 100, 20, 6, '#A1A1AA');
  R(g, L + 520, GY - 70, 16, 70, INK); R(g, L + 522, GY - 68, 12, 66, 'rgba(120, 200, 160, 0.6)'); R(g, L + 534, GY - 40, 12, 3, '#A1A1AA'); R(g, L + 518, GY - 8, 20, 8, INK);
  R(g, L + 140, GY - 8, 60, 8, INK); R(g, L + 142, GY - 7, 56, 6, '#C2A070'); g.font = '6px "Press Start 2P"'; g.fillStyle = '#B91C1C'; g.fillText('PIZZA', L + 152, GY - 2);
};
/** Its outside: the skull of rock over the mouth (its eyes glowing with the smoke inside, teeth over the door), the
 *  rock off up out of the screen either side; the grotto's sign stands on the deck before it (SIGNS2). */
const paintSkull = (g: Ctx) => {
  const x0 = GROTTO.door - 150, x1 = GROTTO.door + 170, top = CAVE_TOP - 140;
  R(g, x0, top, x1 - x0, GY - top, ROCK[2]);
  for (let y = top; y < GY; y += 36) R(g, x0, y, x1 - x0, 2, ROCK[1]);
  // (the skull: a dome over the mouth, two eye holes, a nose hole, teeth along the top of the door)
  g.fillStyle = INK; g.beginPath(); g.ellipse(GROTTO.door + 10, GY - 260, 150, 170, 0, Math.PI, 0); g.fill();
  g.fillStyle = ROCK[3]; g.beginPath(); g.ellipse(GROTTO.door + 10, GY - 260, 144, 164, 0, Math.PI, 0); g.fill();
  R(g, GROTTO.door - 134, GY - 262, 288, 262, ROCK[3]);
  for (const ex of [-60, 70]) { g.fillStyle = INK; g.beginPath(); g.ellipse(GROTTO.door + 10 + ex, GY - 300, 34, 28, 0, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = INK; g.beginPath(); g.moveTo(GROTTO.door + 10, GY - 270); g.lineTo(GROTTO.door - 4, GY - 236); g.lineTo(GROTTO.door + 24, GY - 236); g.closePath(); g.fill();
  // (the mouth: the cave's opening, dark, the door in it)
  R(g, GROTTO.door - 70, GY - 200, 150, 200, INK);
  for (let k = 0; k < 6; k++) { R(g, GROTTO.door - 66 + k * 24, GY - 212, 20, 18, '#D8CCB8'); R(g, GROTTO.door - 66 + k * 24, GY - 212, 20, 3, '#F4ECDC'); R(g, GROTTO.door - 48 + k * 24, GY - 212, 2, 18, INK); }
  g.font = '10px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = INK; g.fillText('SKULL GROTTO', GROTTO.door + 11, GY - 389); g.fillStyle = '#FDE047'; g.fillText('SKULL GROTTO', GROTTO.door + 10, GY - 390); g.textAlign = 'left';
};
/** The door: a plywood board over the mouth (KEEP OUT. SERIOUSLY. sprayed on), `down` 0..1 kicked in flat. */
const drawDoor = (c: Ctx, down: number) => {
  const x = GROTTO.door - 60, w = 130, h = 196;
  if (down >= 1) { R(c, x - 8, GY - 10, w + 16, 10, INK); R(c, x - 6, GY - 9, w + 12, 8, '#B08A58'); return; }
  const k = down, hh = h * (1 - k * 0.95);
  R(c, x, GY - hh, w, hh, INK); R(c, x + 2, GY - hh + 2, w - 4, hh - 2, '#C8A26C');
  for (let y = GY - hh + 18; y < GY; y += 22) R(c, x + 2, y, w - 4, 1, '#A8824C');
  if (k < 0.3) { c.font = '9px "Press Start 2P"'; c.textAlign = 'center'; c.fillStyle = '#1A1A1A'; c.fillText('KEEP OUT.', x + w / 2, GY - hh + 70); c.fillText('SERIOUSLY.', x + w / 2, GY - hh + 90); c.fillStyle = '#B91C1C'; c.fillText('- M', x + w / 2 + 30, GY - hh + 114); c.textAlign = 'left'; }
};
/** The back of the grotto (the way out, after): a wall of rock (shut), or the rock slab rolled aside (`open`). */
const drawBackWall = (c: Ctx, open: number) => {
  const x = GROTTO.R;
  R(c, x - 10, CAVE_TOP, 80, GY - CAVE_TOP, ROCK[2]);
  if (open > 0) { R(c, x - 6, GY - 180, 76, 180, INK); for (let k = 0; k < 4; k++) R(c, x - 6, GY - 40 - k * 36, 76, 36, ['#2A1208', '#1E0E08', '#140A08', '#0E0808'][k]); }
  for (let y = CAVE_TOP; y < GY - (open > 0 ? 180 : 0); y += 30) R(c, x - 10, y, 80, 2, ROCK[1]);
};
/** The beanbag (his): a slumped black-and-purple sack, his ass's dent in it. */
const drawBeanbag = (c: Ctx, x: number) => {
  c.fillStyle = INK; c.beginPath(); c.ellipse(x, GY - 24, 50, 28, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#2A1440'; c.beginPath(); c.ellipse(x, GY - 24, 47, 25, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#3E1E5A'; c.beginPath(); c.ellipse(x - 12, GY - 32, 26, 12, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#160A22'; c.beginPath(); c.ellipse(x + 6, GY - 34, 20, 8, 0, 0, Math.PI * 2); c.fill();
};

export interface Draw2 { door: number; backOpen: number; inGrotto: boolean; beanbag: number }
/** World space, behind everything that moves. */
export const drawBack2 = (c: Ctx, state: GameState, d: Draw2, river: () => void, mid: () => void) => {
  if (state.camera.x + W < L2_FROM - 200) return;
  drawFarBank(c, state);
  drawPergola(c, state);
  river();
  drawHead(c, state);
  drawDecks(c, state);
  for (const [x, a, b2] of SIGNS2) if (vis(state, x - 120, x + 120)) sign(c, x, GY, [a, b2], x === SIGNS2[SIGNS2.length - 1][0] ? '#4A1D5A' : '#7C2D12', '#FEF3C7', `wp2-${x}`);
  mid();
  // (the grotto: its outside, its inside, the door, the back wall, the beanbag)
  if (vis(state, GROTTO.door - 220, GROTTO.R + 80)) {
    stamp(c, 'wp2-grotto-in', GROTTO.L, CAVE_TOP, GROTTO.R - GROTTO.L, GY - CAVE_TOP + 2, g => paintGrotto(g));
    // (the lava lamp's blobs: live)
    const fr = state.frame, lx = GROTTO.R - 218;
    for (let k = 0; k < 3; k++) { const y = GY - 50 - (((fr * 0.3 + k * 17) % 44)); c.fillStyle = '#F472B6'; c.beginPath(); c.ellipse(lx, y, 4 + (k % 2) * 2, 5, 0, 0, Math.PI * 2); c.fill(); }
    if (d.beanbag) drawBeanbag(c, d.beanbag);
    drawBackWall(c, d.backOpen);
    // (outside: the skull's face of rock over the mouth; inside (the fight, after it), the mouth from in here: a dark
    // arch, the night through it)
    if (!d.inGrotto) stamp(c, 'wp2-skull', GROTTO.door - 150, CAVE_TOP - 140, 320, GY - CAVE_TOP + 142, g => paintSkull(g));
    else { R(c, GROTTO.L, CAVE_TOP, GROTTO.door - 70 - GROTTO.L, GY - CAVE_TOP, ROCK[2]); R(c, GROTTO.door - 70, GY - 200, 150, 200, '#0E1430'); for (let k = 0; k < 4; k++) R(c, GROTTO.door - 70, GY - 200 + k * 50, 150, 50, ['#0A1028', '#101838', '#162044', '#1C2650'][k]); for (const [sx, sy] of [[-40, -170], [20, -150], [50, -184], [-10, -120]]) R(c, GROTTO.door + sx, GY + sy, 2, 2, '#E0E7FF'); R(c, GROTTO.door - 76, GY - 212, 162, 12, ROCK[3]); R(c, GROTTO.door - 76, GY - 212, 162, 2, ROCK[4]); }
    drawDoor(c, d.door);
    // (the grotto's floor: rock, over the boardwalk's run under it)
    R(c, GROTTO.L, GY, GROTTO.R + 50 - GROTTO.L, 3, ROCK[4]); R(c, GROTTO.L, GY + 3, GROTTO.R + 50 - GROTTO.L, 120, ROCK[1]);
    for (let x = GROTTO.L + 10; x < GROTTO.R + 40; x += 44) R(c, x, GY + 3 + (x % 3) * 6, 24, 3, ROCK[2]);
    // (the smoke inside, hanging in bands under the ceiling)
    for (let k = 0; k < 4; k++) { c.globalAlpha = 0.18; c.fillStyle = '#6A5A7A'; c.fillRect(GROTTO.L, CAVE_TOP + 30 + k * 40 + Math.sin(fr * 0.01 + k) * 6, GROTTO.R - GROTTO.L, 26); }
    c.globalAlpha = 1;
  }
  // (level 3's start (a stub): the landing at the river's end, a maintenance tunnel's door, shut)
  if (vis(state, L3.wall - 260, L3.wall + 340)) stamp(c, 'wp2-maint', L3.wall - 260, GY - 470, 600, 472, g => paintMaint(g));
};
/** World space, in front of him: the grotto's mouth's near rock and its ceiling over the arena (the cave's roof). */
export const drawFront2 = (c: Ctx, state: GameState) => {
  if (!vis(state, GROTTO.L - 40, GROTTO.R + 80)) return;
  // (the ceiling: rock hanging over the top of the screen, stalactites)
  R(c, GROTTO.L - 20, CAVE_TOP - 400, GROTTO.R - GROTTO.L + 100, 420, ROCK[0]);
  for (let x = GROTTO.L; x < GROTTO.R + 60; x += 46) { c.fillStyle = ROCK[1]; c.beginPath(); c.moveTo(x, CAVE_TOP + 18); c.lineTo(x + 18, CAVE_TOP + 18); c.lineTo(x + 8, CAVE_TOP + 40 + hash(x) * 40); c.closePath(); c.fill(); }
};

/** Level 3's start: the river's end, a concrete service wall with a steel door in it, MAINTENANCE stenciled over,
 *  AUTHORIZED PERSONNEL ONLY, a caged bulb; shut (the stub: the owner's next). */
const paintMaint = (g: Ctx) => {
  const x0 = L3.wall - 40, x1 = L3.wall + 340, top = GY - 470;
  R(g, x0 - 2, top, x1 - x0 + 2, GY - top, INK); R(g, x0, top, x1 - x0, GY - top, '#4A4A52');
  for (let y = top + 10; y < GY; y += 30) for (let x = x0 + ((y / 30) % 2) * 30; x < x1; x += 60) { R(g, x, y, 58, 28, '#55555E'); R(g, x, y, 58, 1, '#6A6A74'); }
  R(g, x0, top, 6, GY - top, '#6A6A74');
  // (the door: steel, riveted, its handle, a kick plate; the frame)
  const dx = L3.wall + 10, dw = 90, dh = 170;
  R(g, dx - 6, GY - dh - 6, dw + 12, dh + 6, INK); R(g, dx - 4, GY - dh - 4, dw + 8, dh + 4, '#2A2A30');
  R(g, dx, GY - dh, dw, dh, '#6B7280'); R(g, dx, GY - dh, dw, 3, '#9CA3AF'); R(g, dx + dw - 4, GY - dh, 4, dh, '#4B5563');
  for (const [rx, ry] of [[6, 8], [dw - 10, 8], [6, dh - 12], [dw - 10, dh - 12]]) R(g, dx + rx, GY - dh + ry, 3, 3, '#D1D5DB');
  R(g, dx + dw - 22, GY - dh / 2 - 4, 14, 6, INK); R(g, dx + dw - 21, GY - dh / 2 - 3, 12, 4, '#E5E7EB');
  R(g, dx + 4, GY - 26, dw - 8, 22, '#4B5563');
  g.font = '8px "Press Start 2P"'; g.textAlign = 'center';
  R(g, dx - 10, GY - dh - 46, dw + 20, 30, '#FACC15'); R(g, dx - 10, GY - dh - 46, dw + 20, 2, '#FEF08A');
  g.fillStyle = INK; g.fillText('MAINTENANCE', dx + dw / 2, GY - dh - 27);
  R(g, dx + 6, GY - dh + 36, dw - 12, 44, '#F8FAFC'); g.fillStyle = '#B91C1C'; g.font = '6px "Press Start 2P"'; g.fillText('AUTHORIZED', dx + dw / 2, GY - dh + 50); g.fillText('PERSONNEL', dx + dw / 2, GY - dh + 62); g.fillText('ONLY', dx + dw / 2, GY - dh + 74);
  g.textAlign = 'left';
  // (the caged bulb over it)
  R(g, dx + dw / 2 - 8, GY - dh - 70, 16, 18, INK); R(g, dx + dw / 2 - 6, GY - dh - 68, 12, 14, '#FDE68A');
  for (let k = 0; k < 3; k++) R(g, dx + dw / 2 - 6 + k * 5, GY - dh - 68, 1, 14, INK);
};
/** The lights: the fire's along the river (warm, low, flickering), the grotto's lamp. */
export const lamps2 = (state: GameState): Light[] => {
  const out: Light[] = [], f = state.frame;
  for (const [a, b] of RIVER) {
    if (!vis(state, a, b, 200)) continue;
    for (let x = Math.max(a, Math.floor((state.camera.x - 200) / 260) * 260); x < Math.min(b, state.camera.x + W + 200); x += 260) out.push({ x: x + 130, y: RIVER_Y - 30, r: 260, a: 0.34 + 0.06 * Math.sin(f * 0.13 + x), color: '#F97316' } as Light);
  }
  for (const [x] of JETS) if (vis(state, x - 100, x + 100)) out.push({ x, y: RIVER_Y - 120, r: 220, a: 0.2, color: '#FDE047' } as Light);
  if (vis(state, GROTTO.L, GROTTO.R)) out.push({ x: GROTTO.R - 218, y: GY - 70, r: 300, a: 0.4, color: '#C084FC' } as Light);
  return out;
};
/** For the level's first stretch (before the river): level 1's gate building, open (park1/art.ts draws it). */
export const GATE_X = L2.wall;
export { FIRE, flame };
