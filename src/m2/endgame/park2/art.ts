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
import { mix, hazeBands, checker } from '../../intro/art/kit';
import { sign } from '../park1/art';
import { GY, B, DECKS, DECK_DY, GAPS, HEAD, RIVER_Y, SIGNS2, GROTTO, L3, L2_FROM, VINES2, JETS, deckY, waterY } from './geo';
import { zoneAt, drawZoneMid, drawZoneBank, drawPergolaPost, DECK_STYLE, type DeckStyle } from './zones';
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
  drawZoneMid(c, state, L2_FROM - 200);
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
// The decks: what each zone's made of (zones.ts DECK_STYLE: pool-deck tile, temple slabs, boardwalk planks, bamboo,
// ship's planking, sandstone, rock), at its own height (geo.ts DECK_DY); its top edge lit always (stood on); the
// channel's wall under it down out of sight

const DECK_T = 64;
const paintDeck = (g: Ctx, k: number, st: DeckStyle) => {
  const P = st.planks;
  R(g, 0, GY, DECK_T, 3, st.lip); R(g, 0, GY + 3, DECK_T, 2, st.lip2);
  if (st.kind === 'planks') {
    for (let x = 0; x < DECK_T; x += 16) { const col = P[(x / 16 + k) % 4]; R(g, x, GY + 5, 15, 12, col); R(g, x, GY + 5, 15, 1, mix(col, '#FFFFFF', 0.2)); R(g, x + 15, GY + 5, 1, 12, st.seam); R(g, x + 3, GY + 8, 1, 1, st.seam); R(g, x + 6, GY + 12, 6, 1, mix(P[0], INK, 0.3)); }
  } else if (st.kind === 'bamboo') {
    for (let y = GY + 5, n = 0; y < GY + 17; y += 4, n++) { const col = P[(n + k) % 4]; R(g, 0, y, DECK_T, 4, col); R(g, 0, y, DECK_T, 1, mix(col, '#FFFFFF', 0.3)); R(g, 0, y + 3, DECK_T, 1, st.seam); for (let x = (n * 13 + k * 7) % 22; x < DECK_T; x += 22) R(g, x, y, 2, 4, st.seam); }
  } else {
    const bw = st.kind === 'tile' ? 16 : st.kind === 'rock' ? 21 : 32;
    for (let x = -(k % 2) * (bw / 2); x < DECK_T; x += bw) { const col = P[Math.floor(hash(x + k * 17) * 4)]; R(g, x, GY + 5, bw - 1, 12, col); R(g, x, GY + 5, bw - 1, 1, mix(col, '#FFFFFF', 0.25)); R(g, x + bw - 1, GY + 5, 1, 12, st.seam); }
    if (st.kind === 'rock') for (let x = 4; x < DECK_T; x += 11) R(g, x, GY + 9 + (x % 3) * 2, 3, 2, mix(P[0], INK, 0.3));
    if (st.kind === 'sand') checker(g, 0, GY + 13, DECK_T, 4, mix(P[0], INK, 0.15));
  }
  // (the stringer or the coping's shadow under it; the wall going down to the channel)
  R(g, 0, GY + 17, DECK_T, 6, st.seam); R(g, 0, GY + 17, DECK_T, 1, mix(st.seam, '#FFFFFF', 0.15));
  paintFace(g, k, st);
};
/** The deck's face under its stringer (in its shadow, so it never reads as a second thing to stand on: no lit
 *  horizontal edges, only vertical ones lit from the left), down to FACE_H, then dithered into its dark: what holds it
 *  up, by what it's made of (pilings and cross braces under a boardwalk, ashlar under temple slabs, poles under bamboo,
 *  the pool's concrete wall, sandstone, rock), so a raised deck reads as a built thing stood up in the river, not a slab
 *  floating over it. */
const FACE_H = 200;
const paintFace = (g: Ctx, k: number, st: DeckStyle) => {
  const y0 = GY + 23, y1 = GY + FACE_H, U = st.under, P = st.planks;
  const sh = (col: string, t: number) => mix(col, INK, t);
  R(g, 0, y0, DECK_T, y1 - y0, U);
  if (st.kind === 'planks') {
    // (the pilings: a round post every other tile, lit down its left; the cross braces between, the waling beam)
    const post = st.post ?? st.seam, pc = sh(P[1], 0.35);
    g.strokeStyle = sh(P[0], 0.55); g.lineWidth = 4;
    g.beginPath(); g.moveTo(k % 2 ? -39 : 25, y0 + 14); g.lineTo(k % 2 ? 25 : 89, y0 + 120); g.moveTo(k % 2 ? 25 : 89, y0 + 14); g.lineTo(k % 2 ? -39 : 25, y0 + 120); g.stroke();
    R(g, 0, y0 + 34, DECK_T, 8, sh(P[2], 0.5)); R(g, 0, y0 + 40, DECK_T, 2, sh(P[2], 0.7));
    if (k % 2 === 0) { R(g, 18, y0, 14, y1 - y0, INK); R(g, 19, y0, 12, y1 - y0, pc); R(g, 19, y0, 3, y1 - y0, sh(P[2], 0.1)); R(g, 28, y0, 3, y1 - y0, post); for (let y = y0 + 60; y < y1; y += 46) R(g, 19, y, 12, 2, post); }
  } else if (st.kind === 'bamboo') {
    // (poles, side by side, their nodes; lashed with a band of rope)
    for (let x = 2, n = 0; x < DECK_T; x += 12, n++) { const col = sh(P[(n + k) % 4], 0.45); R(g, x, y0, 10, y1 - y0, col); R(g, x, y0, 2, y1 - y0, sh(P[2], 0.2)); R(g, x + 8, y0, 2, y1 - y0, sh(col, 0.4)); for (let y = y0 + 18 + ((n * 7) % 13); y < y1; y += 34) R(g, x, y, 10, 2, sh(col, 0.5)); }
    R(g, 0, y0 + 8, DECK_T, 5, sh('#8A7448', 0.45)); checker(g, 0, y0 + 8, DECK_T, 5, sh('#5A4A30', 0.4));
  } else if (st.kind === 'rock') {
    for (let y = y0, n = 0; y < y1; y += 22, n++) for (let x = -(n % 2) * 14 + ((k * 9) % 14); x < DECK_T; x += 28) { g.fillStyle = sh(P[(n + Math.round(x)) & 3], 0.4); g.beginPath(); g.ellipse(x + 14, y + 11, 14, 10, 0, 0, Math.PI * 2); g.fill(); R(g, x + 4, y + 4, 2, 10, sh(P[2], 0.1)); }
  } else {
    // (blocks in courses: temple ashlar, sandstone, the pool's concrete; each lit down its left edge, its joints dark)
    const bw = st.kind === 'tile' ? 32 : st.kind === 'sand' ? 24 : 30, ch = st.kind === 'tile' ? 40 : 20;
    for (let y = y0, n = 0; y < y1; y += ch, n++) for (let x = -(n % 2) * (bw / 2); x < DECK_T; x += bw) {
      const col = sh(P[Math.floor(hash(x * 0.7 + n * 3.1 + k * 17) * 4)], 0.42);
      R(g, x, y, bw - 1, ch - 1, col); R(g, x, y, 2, ch - 1, sh(P[2], 0.15)); R(g, x + bw - 1, y, 1, ch, st.seam); R(g, x, y + ch - 1, bw, 1, st.seam);
    }
    if (st.kind === 'tile') R(g, 0, y0 + 2, DECK_T, 6, sh('#0E7490', 0.4));
  }
  // (the face's top in the stringer's shadow; its foot dithered down into the dark)
  checker(g, 0, y0, DECK_T, 4, st.seam);
  for (let i = 0; i < 3; i++) checker(g, 0, y1 - 36 + i * 12, DECK_T, 12 - i * 2, mix(U, INK, 0.2 + i * 0.1));
};
/** A deck's end (`side` -1 its left, +1 its right): the corner post of what it's made of, stood down into the river
 *  (its outer edge lit warm by the fire below it, the lit corner of the deck's top on it), so the end reads as the side
 *  of a built thing and where it stops. */
const paintEnd = (g: Ctx, side: number, st: DeckStyle, drop: number) => {
  const P = st.planks, w = 12, x = side < 0 ? 0 : -w, bot = GY + drop;
  const col = mix(P[2], INK, 0.25), dark = mix(P[0], INK, 0.55);
  R(g, x - (side < 0 ? 1 : 0), GY + 5, w + 1, bot - GY - 5, INK);
  R(g, x + (side < 0 ? 1 : 0), GY + 5, w - 1, bot - GY - 5, col);
  // (lit down its outer edge, shaded on its inner one)
  const ox = side < 0 ? x + 1 : x + w - 3, ix = side < 0 ? x + w - 3 : x + 1;
  R(g, ox, GY + 5, 2, bot - GY - 5, mix(P[2], '#FFFFFF', 0.15)); R(g, ix, GY + 5, 2, bot - GY - 5, dark);
  if (st.kind === 'planks' || st.kind === 'bamboo') for (let y = GY + 30; y < bot; y += 40) R(g, x, y, w, 2, dark);
  else for (let y = GY + 26; y < bot; y += 22) R(g, x + 1, y, w - 2, 1, dark);
  // (the fire's light up its foot: warm bands, dithered)
  for (let i = 0; i < 4; i++) { const yy = bot - 12 - i * 12; R(g, ox, yy, 2, 12, ['#FDBA74', '#F59E0B', '#C2410C', '#7C2D12'][i]); checker(g, x + 1, yy, w - 2, 12 - i * 2, ['#C2410C', '#9A3412', '#7C2D12', '#451A03'][i]); }
  // (the deck's top's corner on it: its lip turned the corner)
  R(g, x, GY, w, 3, st.lip); R(g, x, GY + 3, w, 2, st.lip2);
};
const drawDecks = (c: Ctx, state: GameState) => {
  DECKS.forEach(([a, b], i) => {
    if (!vis(state, a, b, 20)) return;
    const dy = DECK_DY[i] ?? 0, top = GY + dy, bot = state.camera.y + H + 40;
    const x0 = Math.max(a, state.camera.x - 40), x1 = Math.min(b, state.camera.x + W + 40);
    c.save(); c.beginPath(); c.rect(x0, top, x1 - x0, bot - top); c.clip();
    for (let tx = Math.floor(x0 / DECK_T) * DECK_T; tx < x1; tx += DECK_T) {
      // (a deck's all one zone's: the one its middle's in (no change of material partway along it))
      const k = Math.floor(hash(tx / DECK_T + 0.5) * 4), z = zoneAt((a + b) / 2);
      c.save(); c.translate(tx, dy); stamp(c, `wp2-deck2-${z}-${k}`, 0, GY, DECK_T, FACE_H, g => paintDeck(g, k, DECK_STYLE[z])); c.restore();
    }
    if (bot > top + FACE_H) R(c, x0, top + FACE_H, x1 - x0, bot - top - FACE_H, mix(DECK_STYLE[zoneAt((a + b) / 2)].under, INK, 0.5));
    c.restore();
    // (its ends: the corner post stood down into the river, the river's fire lighting its foot; down to the water by it)
    for (const e of [a, b]) if (e > x0 - 14 && e < x1 + 14) {
      const side = e === a ? -1 : 1, z = zoneAt((a + b) / 2), drop = Math.max(40, Math.round(waterY(e + side * 20) - top) + 4);
      c.save(); c.translate(e, dy); stamp(c, `wp2-end-${z}-${side}-${drop}`, side < 0 ? -1 : -13, GY, 14, drop + 2, g => paintEnd(g, side, DECK_STYLE[z], drop)); c.restore();
    }
  });
};

/** Where the river steps down (geo.ts: a gap's water lower than the last's), it pours out of a culvert in the deck's
 *  wall between them: a burning cascade, the splash at its foot (over the lower gap's left end: the river's own). */
const drawCascades = (c: Ctx, state: GameState) => {
  const f = state.frame;
  for (let i = 1; i < GAPS.length; i++) {
    const g0 = GAPS[i - 1], g1 = GAPS[i], drop = g1.water - g0.water;
    if (drop <= 0 || !vis(state, g1.a - 40, g1.a + 60)) continue;
    const x = g1.a, y0 = RIVER_Y + g0.water - 6, y1 = RIVER_Y + g1.water;
    // (the culvert's mouth in the wall: a concrete lip, the dark pipe)
    R(c, x - 2, y0 - 14, 22, 20, INK); R(c, x, y0 - 12, 18, 16, '#14100E'); R(c, x - 2, y0 - 16, 24, 4, '#6A5E52'); R(c, x - 2, y0 - 16, 24, 1, '#9A8E80');
    // (the sheet of burning oil pouring out and down, in bands, flames up it, the splash)
    for (let y = y0; y < y1; y += 6) { const k = (y - y0) / Math.max(1, y1 - y0), w = 14 + k * 8; R(c, x + 2, y, w, 6, ((y + f * 2) >> 3) % 2 ? FIRE[2] : FIRE[1]); R(c, x + 2, y, 3, 6, FIRE[3]); }
    for (let y = y0 + 8; y < y1 - 6; y += 20) flame(c, x + 12, y + 14, 10, 16, f, i * 3 + y);
    fireRow(c, x - 4, x + 40, y1 + 2, 30, f, 12, i * 11);
  }
};

/** The pergola: posts back in the river (dimmed) under each vine's beam, their crossbeams; the zone's own (zones.ts). */
const drawPergola = (c: Ctx, state: GameState) => { for (const v of VINES2) drawPergolaPost(c, state, v.x, v.y); };

// ---------------------------------------------------------------------------------------------------------------
// The head: the tube rental hut (back, dimmed), its stacks of tubes, the dock at the end where the son was

const HUT_X = B + 160;
const paintHead = (g: Ctx) => {
  // (the hut: a thatched roof in bands of straw, bamboo posts ringed, a counter with its lit lip (not stood on: dimmed),
  // the dark inside with racks of tubes, TUBE RENTAL on a board; behind the play: dimmed)
  const d = (col: string) => dim(col, 0.35);
  const ramp = (col: string) => [d(mix(col, INK, 0.5)), d(mix(col, INK, 0.25)), d(col), d(mix(col, '#FFFFFF', 0.2)), d(mix(col, '#FFFFFF', 0.4))];
  const W5 = ramp('#6A4A2A'), T5 = ramp('#B08A48'), Bm = ramp('#A8843E');
  R(g, HUT_X - 1, GY - 151, 262, 152, INK); R(g, HUT_X, GY - 150, 260, 150, W5[1]);
  for (let y = GY - 146; y < GY; y += 10) { R(g, HUT_X, y, 260, 8, W5[2]); R(g, HUT_X, y, 260, 1, W5[3]); }
  R(g, HUT_X + 6, GY - 140, 248, 70, d('#140C08'));
  for (let k = 0; k < 6; k++) { const x = HUT_X + 20 + k * 38; for (let n = 0; n < 3; n++) { g.fillStyle = d(['#EC4899', '#22D3EE', '#FACC15', '#A3E635'][(k + n) % 4]); g.beginPath(); g.ellipse(x, GY - 118 + n * 16, 15, 5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = d('#0A0608'); g.beginPath(); g.ellipse(x, GY - 119 + n * 16, 5, 1.5, 0, 0, Math.PI * 2); g.fill(); } }
  checker(g, HUT_X + 6, GY - 80, 248, 10, d('#2A1A10'));
  R(g, HUT_X - 2, GY - 72, 264, 12, INK); R(g, HUT_X, GY - 71, 260, 10, W5[2]); R(g, HUT_X, GY - 71, 260, 2, W5[3]); R(g, HUT_X, GY - 63, 260, 2, W5[0]);
  for (const px of [HUT_X - 4, HUT_X + 252]) { R(g, px, GY - 150, 12, 150, INK); R(g, px + 1, GY - 150, 10, 150, Bm[2]); R(g, px + 1, GY - 150, 3, 150, Bm[3]); R(g, px + 8, GY - 150, 3, 150, Bm[1]); for (let y = GY - 140; y < GY; y += 18) { R(g, px + 1, y, 10, 2, Bm[0]); R(g, px + 1, y + 2, 10, 1, Bm[4]); } }
  // (the thatch: bands of straw, each a fringe of strands over the one under it, burnt black at one corner)
  for (let b = 0; b < 5; b++) {
    const y0 = GY - 210 + b * 14, half = 40 + b * 32;
    g.fillStyle = INK; g.beginPath(); g.moveTo(HUT_X + 130 - half - 2, y0 + 16); g.lineTo(HUT_X + 130, y0 - 2); g.lineTo(HUT_X + 130 + half + 2, y0 + 16); g.closePath(); g.fill();
    g.fillStyle = T5[b % 2 ? 2 : 3]; g.beginPath(); g.moveTo(HUT_X + 130 - half, y0 + 15); g.lineTo(HUT_X + 130, y0); g.lineTo(HUT_X + 130 + half, y0 + 15); g.closePath(); g.fill();
    for (let x = HUT_X + 130 - half + 2; x < HUT_X + 130 + half - 2; x += 4) R(g, x, y0 + 12 - Math.abs(x - HUT_X - 130) * 0.1, 1, 4, T5[0]);
  }
  checker(g, HUT_X + 200, GY - 168, 90, 26, d('#120806'));
  R(g, HUT_X + 58, GY - 192, 144, 32, INK); R(g, HUT_X + 60, GY - 190, 140, 28, d('#0E7490')); R(g, HUT_X + 60, GY - 190, 140, 2, d('#38BDF8')); R(g, HUT_X + 60, GY - 164, 140, 2, d('#155E75'));
  g.font = '10px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = INK; g.fillText('TUBE RENTAL', HUT_X + 131, GY - 170); g.fillStyle = d('#FEF3C7'); g.fillText('TUBE RENTAL', HUT_X + 130, GY - 171); g.textAlign = 'left';
  // (stacks of tubes against it, in the park's colors, each stepped: shade under, a lit band, the hole dark)
  const C = ['#EC4899', '#22D3EE', '#FACC15', '#A3E635', '#F97316'];
  for (let s = 0; s < 3; s++) for (let k = 0; k < 4 + s; k++) {
    const x = HUT_X + 280 + s * 54, y = GY - 10 - k * 14, col = C[(s + k) % 5];
    g.fillStyle = INK; g.beginPath(); g.ellipse(x, y, 24, 8, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = d(mix(col, INK, 0.3)); g.beginPath(); g.ellipse(x, y, 22, 6.5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = d(col); g.beginPath(); g.ellipse(x - 1, y - 1, 20, 5, 0, 0, Math.PI * 2); g.fill();
    R(g, x - 14, y - 5, 10, 1, d(mix(col, '#FFFFFF', 0.4)));
    g.fillStyle = d('#0A0608'); g.beginPath(); g.ellipse(x, y - 1, 8, 2, 0, 0, Math.PI * 2); g.fill();
  }
};
const drawHead = (c: Ctx, state: GameState) => {
  if (!vis(state, HUT_X - 60, HEAD + 60)) return;
  stamp(c, 'wp2-head2', HUT_X - 40, GY - 220, 520, 222, g => paintHead(g));
  // (the dock's end over the river: a few planks out past the deck, posts down into it, a mooring cleat; drawn on
  // the deck's own run (it is the deck's end))
  R(c, HEAD - 6, GY + 3, 8, RIVER_Y - GY + 8, '#3A2412');
};

// ---------------------------------------------------------------------------------------------------------------
// The grotto: SKULL GROTTO, the river's cave (fiberglass rock in a skull's shape over the mouth: its eye holes, its
// teeth over the door), the son's hangout inside (the back wall in purple rock, his beanbag, a lava lamp, a bong, a
// black-light poster); its back wall at the right (opened after: the way out to level 3)

const ROCK = ['#1A1218', '#2A1E26', '#3A2A34', '#4E3A46', '#6A525E', '#8A6E7C'];
const CAVE_TOP = GY - 470;
/** A lump of fiberglass rock in its steps: inked, lit up its top-left (the lamp's violet), shaded under, dithered. */
const rockLump = (g: Ctx, x: number, y: number, rx: number, ry: number, R5 = ROCK) => {
  g.fillStyle = INK; g.beginPath(); g.ellipse(x, y, rx + 1.5, ry + 1.5, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = R5[1]; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = R5[2]; g.beginPath(); g.ellipse(x - rx * 0.12, y - ry * 0.14, rx * 0.84, ry * 0.78, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = R5[3]; g.beginPath(); g.ellipse(x - rx * 0.3, y - ry * 0.34, rx * 0.5, ry * 0.44, 0, 0, Math.PI * 2); g.fill();
  checker(g, x - rx * 0.7, y + ry * 0.3, rx * 1.2, Math.max(2, ry * 0.3), R5[0]);
  R(g, x - rx * 0.42, y - ry * 0.6, rx * 0.3, 1, R5[4]);
};
/** Inside: the cave's back wall in banded rock (lit violet by the lava lamp from the right, black up top in the smoke),
 *  stepped lumps of it, the black-light posters, the rug, the crate and the lava lamp, the bong, a pizza box. */
const paintGrotto = (g: Ctx) => {
  const L = GROTTO.L, Rr = GROTTO.R;
  R(g, L, CAVE_TOP, Rr - L, GY - CAVE_TOP, ROCK[1]);
  for (let y = CAVE_TOP + 10, n = 0; y < GY; y += 34, n++) for (let x = L + (n % 2) * 36 - 20; x < Rr + 30; x += 72) rockLump(g, x + 30, y + 14, 34 + hash(x + y) * 8, 15);
  hazeBands(g, L, CAVE_TOP, Rr - L, 200, '#05030A', 0.7, 0, 6);
  hazeBands(g, Rr - 360, GY - 260, 360, 260, '#7E22CE', 0, 0.16, 5);
  // (a black-light poster: a skull in a triangle, glowing; another, torn: NOTHING MATTERS)
  R(g, L + 218, GY - 302, 94, 124, INK); R(g, L + 222, GY - 298, 86, 116, '#1A0A2A'); checker(g, L + 222, GY - 298, 86, 116, '#240E38');
  g.strokeStyle = '#3F6212'; g.lineWidth = 5; g.beginPath(); g.moveTo(L + 265, GY - 280); g.lineTo(L + 296, GY - 200); g.lineTo(L + 234, GY - 200); g.closePath(); g.stroke();
  g.strokeStyle = '#A3E635'; g.lineWidth = 2; g.stroke();
  g.fillStyle = '#86198F'; g.beginPath(); g.ellipse(L + 265, GY - 225, 13, 12, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#F0ABFC'; g.beginPath(); g.ellipse(L + 264, GY - 227, 11, 10, 0, 0, Math.PI * 2); g.fill();
  R(g, L + 258, GY - 229, 4, 4, '#1A0A2A'); R(g, L + 267, GY - 229, 4, 4, '#1A0A2A'); R(g, L + 261, GY - 220, 7, 2, '#1A0A2A');
  R(g, L + 222, GY - 298, 86, 2, '#3A1A50');
  R(g, Rr - 332, GY - 282, 74, 94, INK); R(g, Rr - 328, GY - 278, 66, 86, '#2A0A18'); checker(g, Rr - 328, GY - 278, 66, 86, '#3A0E22');
  g.fillStyle = INK; g.beginPath(); g.moveTo(Rr - 262, GY - 282); g.lineTo(Rr - 258, GY - 240); g.lineTo(Rr - 276, GY - 230); g.lineTo(Rr - 258, GY - 188); g.lineTo(Rr - 258, GY - 282); g.fill();
  g.font = '8px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = '#831843'; g.fillText('NOTHING', Rr - 296, GY - 239); g.fillText('MATTERS', Rr - 296, GY - 225); g.fillStyle = '#F472B6'; g.fillText('NOTHING', Rr - 297, GY - 240); g.fillText('MATTERS', Rr - 297, GY - 226); g.textAlign = 'left';
  // (the rug: round, black and purple rings, its fringe)
  for (let k = 0; k < 5; k++) { g.fillStyle = ['#0E0612', '#1A0A20', '#3A1450', '#1A0A20', '#2A0E3A'][k]; g.beginPath(); g.ellipse(L + 420, GY - 2, 244 - k * 48, 11 - k * 2, 0, 0, Math.PI * 2); g.fill(); }
  for (let x = L + 190; x < L + 650; x += 6) R(g, x, GY - 2 + Math.round(Math.abs(Math.sin((x - L - 420) / 244 * 1.5)) * 2), 2, 3, '#4A1D5A');
  // (the crate the lava lamp's on; the bong; a pizza box)
  const C = ['#2A1A0E', '#4A3220', '#6A4A2E', '#8A6A44'];
  R(g, Rr - 241, GY - 41, 46, 41, INK); R(g, Rr - 240, GY - 40, 44, 40, C[1]); R(g, Rr - 240, GY - 40, 44, 3, C[3]); R(g, Rr - 240, GY - 40, 3, 40, C[2]); for (let y = GY - 30; y < GY; y += 10) R(g, Rr - 238, y, 40, 1, C[0]);
  g.strokeStyle = C[0]; g.lineWidth = 2; g.beginPath(); g.moveTo(Rr - 238, GY - 38); g.lineTo(Rr - 198, GY - 2); g.stroke();
  R(g, Rr - 229, GY - 98, 22, 60, INK); R(g, Rr - 227, GY - 96, 18, 54, '#581C87'); R(g, Rr - 227, GY - 96, 4, 54, '#7E22CE'); R(g, Rr - 213, GY - 96, 3, 54, '#3B0764');
  R(g, Rr - 231, GY - 47, 26, 8, INK); R(g, Rr - 230, GY - 46, 24, 6, '#71717A'); R(g, Rr - 230, GY - 46, 24, 2, '#D4D4D8');
  R(g, Rr - 229, GY - 102, 22, 8, INK); R(g, Rr - 228, GY - 101, 20, 6, '#71717A'); R(g, Rr - 228, GY - 101, 20, 2, '#D4D4D8');
  R(g, L + 519, GY - 71, 18, 71, INK); R(g, L + 521, GY - 69, 14, 67, '#2A5A4A'); R(g, L + 522, GY - 68, 4, 64, '#5AAA8A'); R(g, L + 521, GY - 30, 14, 26, '#3A6A4A');
  R(g, L + 534, GY - 42, 14, 4, INK); R(g, L + 535, GY - 41, 12, 2, '#A1A1AA'); R(g, L + 516, GY - 9, 24, 9, INK); R(g, L + 518, GY - 8, 20, 6, '#3A3A44');
  R(g, L + 139, GY - 9, 62, 9, INK); R(g, L + 141, GY - 8, 58, 7, '#C2A070'); R(g, L + 141, GY - 8, 58, 2, '#E2C898'); g.font = '6px "Press Start 2P"'; g.fillStyle = '#B91C1C'; g.fillText('PIZZA', L + 152, GY - 2);
  R(g, L + 156, GY - 12, 14, 4, '#F5D27A'); R(g, L + 158, GY - 12, 3, 2, '#B91C1C');
};
/** Its outside: the skull of rock over the mouth (its eye holes, its nose hole, its teeth over the door), lit from below
 *  by the fire, a candle in each eye; SKULL GROTTO across its brow; rock off up out of the screen either side. */
const paintSkull = (g: Ctx) => {
  const x0 = GROTTO.door - 150, x1 = GROTTO.door + 170, top = CAVE_TOP - 140, cx = GROTTO.door + 10;
  R(g, x0, top, x1 - x0, GY - top, ROCK[2]);
  for (let y = top, n = 0; y < GY; y += 30, n++) for (let x = x0 - 20 + (n % 2) * 30; x < x1 + 20; x += 60) rockLump(g, x + 30, y + 12, 30, 13);
  // (the skull: a dome over the mouth, banded in its bone-rock ramp, cheekbones, eye holes, a nose hole)
  const S = ['#3A2A30', '#5A4650', '#7A6470', '#9A8490', '#BCA8B0'];
  g.fillStyle = INK; g.beginPath(); g.ellipse(cx, GY - 260, 152, 172, 0, Math.PI, 0); g.fill(); R(g, cx - 152, GY - 262, 304, 262, INK);
  for (let k = 0; k < 4; k++) { g.fillStyle = S[1 + k]; g.beginPath(); g.ellipse(cx - k * 10, GY - 262 - k * 8, 148 - k * 30, 168 - k * 34, 0, Math.PI, 0); g.fill(); }
  R(g, cx - 148, GY - 262, 296, 262, S[1]); R(g, cx - 148, GY - 262, 296, 40, S[2]); checker(g, cx - 148, GY - 226, 296, 4, S[1]);
  R(g, cx - 148, GY - 262, 30, 262, S[3]); R(g, cx + 118, GY - 262, 30, 262, S[0]);
  for (const ex of [-60, 70]) { g.fillStyle = INK; g.beginPath(); g.ellipse(cx + ex, GY - 300, 36, 30, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#1A0A10'; g.beginPath(); g.ellipse(cx + ex + 4, GY - 296, 26, 20, 0, 0, Math.PI * 2); g.fill(); R(g, cx + ex - 30, GY - 322, 40, 3, S[4]); }
  g.fillStyle = INK; g.beginPath(); g.moveTo(cx, GY - 270); g.lineTo(cx - 16, GY - 234); g.lineTo(cx + 16, GY - 234); g.closePath(); g.fill();
  for (const sx of [-1, 1]) { g.fillStyle = S[0]; g.beginPath(); g.ellipse(cx + sx * 96, GY - 240, 40, 12, 0, 0, Math.PI); g.fill(); }
  // (cracks across it)
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(cx - 40, GY - 420); g.lineTo(cx - 30, GY - 380); g.lineTo(cx - 44, GY - 350); g.moveTo(cx + 100, GY - 360); g.lineTo(cx + 84, GY - 330); g.stroke();
  // (the mouth: the cave's opening, dark, its teeth along the top)
  R(g, GROTTO.door - 70, GY - 200, 150, 200, INK);
  for (let k = 0; k < 6; k++) { const tx = GROTTO.door - 66 + k * 24; R(g, tx - 1, GY - 214, 22, 22, INK); R(g, tx, GY - 213, 20, 18, '#B4A894'); R(g, tx, GY - 213, 20, 3, '#7A6E5E'); R(g, tx, GY - 210, 3, 15, '#C8BCA8'); R(g, tx + 16, GY - 210, 4, 15, '#8A7E6C'); R(g, tx + 3, GY - 198, 14, 2, '#E2D6C2'); }
  // (its name across the brow: bone letters, inked, dropped)
  g.font = '10px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = INK; g.fillText('SKULL GROTTO', cx + 2, GY - 387); g.fillStyle = '#A16207'; g.fillText('SKULL GROTTO', cx + 1, GY - 389); g.fillStyle = '#FDE047'; g.fillText('SKULL GROTTO', cx, GY - 390); g.textAlign = 'left';
  // (lit from below by the fire: warm bands up its foot)
  g.globalCompositeOperation = 'source-atop'; hazeBands(g, x0, GY - 160, x1 - x0, 160, '#C2410C', 0, 0.3, 5); g.globalCompositeOperation = 'source-over';
};
/** The door: a plywood board over the mouth (KEEP OUT. SERIOUSLY. sprayed on), `down` 0..1 kicked in flat. */
const PLY = ['#6A4A26', '#A8824C', '#C8A26C', '#DEC08A', '#F2DCAE'];
const drawDoor = (c: Ctx, down: number) => {
  const x = GROTTO.door - 60, w = 130, h = 196;
  if (down >= 1) { R(c, x - 8, GY - 10, w + 16, 10, INK); R(c, x - 6, GY - 9, w + 12, 8, PLY[2]); R(c, x - 6, GY - 9, w + 12, 2, PLY[4]); R(c, x - 6, GY - 3, w + 12, 2, PLY[0]); return; }
  const k = down, hh = h * (1 - k * 0.95);
  R(c, x, GY - hh, w, hh, INK); R(c, x + 2, GY - hh + 2, w - 4, hh - 2, PLY[2]);
  R(c, x + 2, GY - hh + 2, w - 4, 2, PLY[4]); R(c, x + 2, GY - hh + 2, 3, hh - 2, PLY[3]); R(c, x + w - 6, GY - hh + 2, 4, hh - 2, PLY[1]);
  for (let y = GY - hh + 18; y < GY; y += 22) { R(c, x + 2, y, w - 4, 1, PLY[1]); R(c, x + 2, y + 1, w - 4, 1, PLY[3]); }
  for (let y = GY - hh + 10; y < GY - 8; y += 40) for (const nx of [x + 8, x + w - 10]) R(c, nx, y, 2, 2, '#52525B');
  if (k < 0.3) { c.font = '9px "Press Start 2P"'; c.textAlign = 'center'; c.fillStyle = '#7F1D1D'; c.fillText('KEEP OUT.', x + w / 2 + 1, GY - hh + 71); c.fillText('SERIOUSLY.', x + w / 2 + 1, GY - hh + 91); c.fillStyle = '#1A1A1A'; c.fillText('KEEP OUT.', x + w / 2, GY - hh + 70); c.fillText('SERIOUSLY.', x + w / 2, GY - hh + 90); c.fillStyle = '#B91C1C'; c.fillText('- M', x + w / 2 + 30, GY - hh + 114); c.textAlign = 'left'; for (let k2 = 0; k2 < 3; k2++) R(c, x + 30 + k2 * 26, GY - hh + 74, 1, 6 + k2 * 3, '#1A1A1A'); }
};
/** The back of the grotto (the way out, after): a wall of rock (shut), or the rock slab rolled aside (`open`). */
const drawBackWall = (c: Ctx, open: number) => {
  const x = GROTTO.R;
  stamp(c, `wp2-backwall-${open > 0 ? 1 : 0}`, x - 12, CAVE_TOP, 86, GY - CAVE_TOP, g => {
    R(g, x - 10, CAVE_TOP, 80, GY - CAVE_TOP, ROCK[2]);
    for (let y = CAVE_TOP + 10, n = 0; y < GY - (open > 0 ? 190 : 0); y += 30, n++) rockLump(g, x + 30 + (n % 2) * 10, y + 10, 34, 13);
    if (open > 0) { R(g, x - 6, GY - 180, 76, 180, INK); for (let k = 0; k < 4; k++) R(g, x - 6, GY - 40 - k * 36, 76, 36, ['#2A1208', '#1E0E08', '#140A08', '#0E0808'][k]); checker(g, x - 6, GY - 44, 76, 4, '#2A1208'); /* (the opening's top: ragged rock hanging over it, its underside shaded, no lit lip (nothing to stand on)) */ for (let k = 0; k < 6; k++) { const tx = x - 6 + k * 13; g.fillStyle = ROCK[1]; g.beginPath(); g.moveTo(tx, GY - 182); g.lineTo(tx + 13, GY - 182); g.lineTo(tx + 7, GY - 170 + (k % 2) * 5); g.closePath(); g.fill(); } R(g, x - 6, GY - 184, 76, 3, ROCK[1]); }
    R(g, x - 10, CAVE_TOP, 3, GY - CAVE_TOP, ROCK[4]);
  });
};
/** The cave's mouth from inside (the fight): its top a ragged hang of rock over the night (lit from below by the fire
 *  out there along its underside, no lit lip on top: it's no ledge, nothing to stand on: standable-reads-standable). */
const paintMouthArch = (g: Ctx) => {
  const x0 = GROTTO.door - 82, x1 = GROTTO.door + 92, y = GY - 200;
  R(g, x0, y - 34, x1 - x0, 26, ROCK[1]); checker(g, x0, y - 34, x1 - x0, 6, ROCK[0]);
  // (the hang: lumps of rock, inked, shaded on top (into the dark), warm along their undersides)
  for (let k = 0; k < 7; k++) {
    const cx = x0 + 10 + k * 26, ry = 9 + (k % 3) * 3, cy = y - 8 + (k % 2) * 3;
    g.fillStyle = INK; g.beginPath(); g.ellipse(cx, cy, 16, ry + 1, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = ROCK[1]; g.beginPath(); g.ellipse(cx, cy, 15, ry, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = ROCK[2]; g.beginPath(); g.ellipse(cx, cy + ry * 0.3, 12, ry * 0.6, 0, 0, Math.PI); g.fill();
    R(g, cx - 8, cy + ry - 2, 16, 1, '#7A3A2A');
  }
  // (a drip or two of rock hanging off it)
  for (const [dx, h] of [[30, 12], [96, 9], [140, 14]]) { g.fillStyle = INK; g.beginPath(); g.moveTo(x0 + dx - 5, y); g.lineTo(x0 + dx + 5, y); g.lineTo(x0 + dx, y + h); g.closePath(); g.fill(); g.fillStyle = ROCK[2]; g.beginPath(); g.moveTo(x0 + dx - 3, y); g.lineTo(x0 + dx + 3, y); g.lineTo(x0 + dx, y + h - 2); g.closePath(); g.fill(); }
};
/** The beanbag (his): a slumped black-and-purple sack, his ass's dent in it. */
const drawBeanbag = (c: Ctx, x: number) => {
  c.save(); c.translate(Math.round(x), GY);
  stamp(c, 'wp2-beanbag', -54, -56, 108, 60, g => {
    g.fillStyle = INK; g.beginPath(); g.ellipse(0, -24, 51, 29, 0, 0, Math.PI * 2); g.fill();
    for (const [rx, ry, dx, dy, col] of [[48, 26, 0, 0, '#1E0E30'], [44, 22, -2, -2, '#2A1440'], [32, 15, -10, -8, '#3E1E5A'], [16, 7, -18, -14, '#5A2E7A']] as const) { g.fillStyle = col; g.beginPath(); g.ellipse(dx, -24 + dy, rx, ry, 0, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = '#160A22'; g.beginPath(); g.ellipse(6, -34, 20, 8, 0, 0, Math.PI * 2); g.fill();
    checker(g, -40, -12, 80, 6, '#160A22');
    g.strokeStyle = '#4A2A6A'; g.lineWidth = 1; g.beginPath(); g.moveTo(-30, -40); g.quadraticCurveTo(0, -48, 30, -40); g.stroke();
  });
  c.restore();
};
export interface Draw2 { door: number; backOpen: number; inGrotto: boolean; beanbag: number }
/** World space, behind everything that moves. */
export const drawBack2 = (c: Ctx, state: GameState, d: Draw2, river: () => void, mid: () => void) => {
  if (state.camera.x + W < L2_FROM - 200) return;
  drawZoneBank(c, state, HEAD - 960);
  drawPergola(c, state);
  river();
  drawHead(c, state);
  drawDecks(c, state);
  drawCascades(c, state);
  for (const [x, a, b2] of SIGNS2) if (vis(state, x - 120, x + 120)) sign(c, x, deckY(x), [a, b2], x === SIGNS2[SIGNS2.length - 1][0] ? '#4A1D5A' : '#7C2D12', '#FEF3C7', `wp2-${x}`);
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
    else { R(c, GROTTO.L, CAVE_TOP, GROTTO.door - 70 - GROTTO.L, GY - CAVE_TOP, ROCK[2]); R(c, GROTTO.door - 70, GY - 200, 150, 200, '#0E1430'); for (let k = 0; k < 4; k++) R(c, GROTTO.door - 70, GY - 200 + k * 50, 150, 50, ['#0A1028', '#101838', '#162044', '#1C2650'][k]); for (const [sx, sy] of [[-40, -170], [20, -150], [50, -184], [-10, -120]]) R(c, GROTTO.door + sx, GY + sy, 2, 2, '#E0E7FF'); stamp(c, 'wp2-mouth-in', GROTTO.door - 84, GY - 236, 178, 54, g => paintMouthArch(g)); }
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
  stamp(c, 'wp2-ceiling', GROTTO.L - 20, CAVE_TOP - 400, GROTTO.R - GROTTO.L + 100, 490, g => {
    R(g, GROTTO.L - 20, CAVE_TOP - 400, GROTTO.R - GROTTO.L + 100, 420, ROCK[0]);
    checker(g, GROTTO.L - 20, CAVE_TOP + 10, GROTTO.R - GROTTO.L + 100, 6, ROCK[1]);
    // (stalactites: inked, lit down their left, dripping)
    for (let x = GROTTO.L; x < GROTTO.R + 60; x += 46) {
      const h = 40 + hash(x) * 40;
      g.fillStyle = INK; g.beginPath(); g.moveTo(x - 1, CAVE_TOP + 16); g.lineTo(x + 19, CAVE_TOP + 16); g.lineTo(x + 8, CAVE_TOP + h + 2); g.closePath(); g.fill();
      g.fillStyle = ROCK[2]; g.beginPath(); g.moveTo(x, CAVE_TOP + 18); g.lineTo(x + 18, CAVE_TOP + 18); g.lineTo(x + 8, CAVE_TOP + h); g.closePath(); g.fill();
      g.fillStyle = ROCK[3]; g.beginPath(); g.moveTo(x + 1, CAVE_TOP + 18); g.lineTo(x + 7, CAVE_TOP + 18); g.lineTo(x + 8, CAVE_TOP + h - 4); g.closePath(); g.fill();
      R(g, x + 7, CAVE_TOP + h, 2, 3, ROCK[4]);
    }
  });
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
  for (const { a, b, water } of GAPS) {
    if (!vis(state, a, b, 200)) continue;
    for (let x = Math.max(a, Math.floor((state.camera.x - 200) / 260) * 260); x < Math.min(b, state.camera.x + W + 200); x += 260) out.push({ x: x + 130, y: RIVER_Y + water - 30, r: 260, a: 0.34 + 0.06 * Math.sin(f * 0.13 + x), color: '#F97316' } as Light);
  }
  for (const [x] of JETS) if (vis(state, x - 100, x + 100)) out.push({ x, y: waterY(x) - 120, r: 220, a: 0.2, color: '#FDE047' } as Light);
  if (vis(state, GROTTO.L, GROTTO.R)) out.push({ x: GROTTO.R - 218, y: GY - 70, r: 300, a: 0.4, color: '#C084FC' } as Light);
  return out;
};
/** For the level's first stretch (before the river): level 1's gate building, open (park1/art.ts draws it). */
export const GATE_X = L2.wall;
export { FIRE, flame };
