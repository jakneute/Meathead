// Sawdust Gulch and the mines, drawn (the final pass: peak SNES; matched to the wilds' and the train's passes). The
// PARK's frontier town: plywood false fronts on their 2x4 braces, fake gold, a GENERAL STORE that's a gift shop, the
// Wild West Show, guests; then the mill and its pond, the lumber yard, the Mother Lode Mine (a fiberglass mountain with
// its armature showing at its ends, real rock inside, murky and lantern-lit: never black) and the log ride's queue.
//
// One eye for the scene (paint.ts): back to front, the far off (far.ts), the ground going back and the pond's surface
// (ground.ts), the back lots, the stores' bracing and bodies round their ends and the fronts themselves back at
// FRONT_D (fronts.ts), then at the play plane the depot and FIRST AID, the crash's wreck (crash.ts), the bank's balcony,
// the water tower, the snake-oil wagon, the saloon (saloon.ts), the rooftops' stores, the showdown, the livery and the
// smithy, the mill, the yard (places.ts), the mine (mine.ts), the queue (queue.ts); the floor under him (bent), the
// water's body, the rock over the flooded shaft, the ledges and the solids he stands on, the signs, the canaries.
//
// Standable reads standable: every ledge, roof, deck, table, crate and landing has its lit top lip; the awnings, the
// porch roofs, the painted-on balcony, the queue's deck and everything stood back are dimmed or lipless. Impassable
// reads impassable: the barred batwings, the locked back door, the showdown's gates (SHOW IN PROGRESS), the mill's
// works stacked solid under its deck.

import type { GameState } from '../../../m1/game/core/state';
import { parkSign } from '../kit';
import { GY } from '../geometry';
import { drawTracks } from '../wilds/ground';
import { type Ctx, type TownView, box, checker, hash, at, topBack, sideBack, INK, hr, hr7, viewIn, PLANK, HAY, MINE, TIMBER, STEEL, TOPLIP, VARNISH, FRONT_D } from './paint';
import { GROUND, LEDGES, SOLIDS, COVER, SIGNS, LANTERNS, LADDER, X, Y, inSaloon } from './layout';
import { onScreen } from './view';
import { wreckHere } from './scenes';
import { drawWreck, drawCanopy, firstAidOpen, wreckLights, depotStoveIn } from './crash';
import { drawGroundBack, drawGroundFloor, drawWaterBack } from './ground';
import { drawFronts, drawBalcony, drawStores, FRONTS } from './fronts';
import { timeOfDay } from '../../timeOfDay';
import { drawSaloon, drawBar } from './saloon';
import { drawDepot, drawFirstAid, drawRebuilt, drawWaterTower, drawWagon, drawSquareBack, drawSquareFront, drawMarks, drawLivery, drawMill, drawYard } from './places';
import { drawMineBack, drawMineRock, drawCanaries, mineCut } from './mine';
import { drawQueue } from './queue';

export { drawTownBackdrop } from './far';
export { drawWaterFront } from './ground';

const lipAt = (c: Ctx, x: number, y: number, w: number, L = hr('lip', TOPLIP)) => { box(c, x, y - 1, w, 1, INK); box(c, x, y, w, 1, L[3]); box(c, x, y + 1, w, 1, L[2]); box(c, x, y + 2, w, 1, L[1]); };

// ---------------------------------------------------------------------------------------------------------------
// The world, behind everything that moves

export const drawTownBack = (c: Ctx, state: GameState, wreck: boolean) => {
  const f = state.frame, v = viewIn(state);
  const on = (a: number, b: number, m = 60) => onScreen(state, X(a), X(b), m);
  // ---- going back: the ground, the pond's surface
  drawGroundBack(c, v);
  // ---- back from the play plane: the showdown's bleachers and board, the back lots, the stores, the smithy, the mill's
  //      back wall, the yard's piles
  if (on(5900, 7000, 200)) drawSquareBack(c, state, v);
  if (on(700, 7000, 300)) drawFronts(c, state, v);
  if (on(10780, 11300, 200)) drawYard(c, v);
  // ---- at the play plane
  if (on(-1000, 1100, 200)) drawEndOfLine(c, state, v, wreck);
  if (on(1500, 1850)) drawBalcony(c, v, 1560, 1800, 160);
  if (on(2600, 2800, 120)) drawWaterTower(c, v, X(2700));
  if (on(2100, 2400)) drawWagon(c, v, X(2250), f);
  if (on(3700, 5000, 160)) drawSaloon(c, state, v);
  if (on(4900, 5900, 160)) drawStores(c, state, v);
  if (on(5900, 7000, 100)) drawSquareFront(c, state, v);
  if (on(6980, 8300, 200)) drawLivery(c, state, v);
  if (on(9500, 11100, 200)) drawMill(c, state, v);
  if (on(11000, 14800, 200)) drawMineBack(c, state, v);
  if (on(14400, 15900, 200)) drawQueue(c, state, v);
  // ---- the mine's landings (all the ledges below the ground line: the rest draw their own), before the floor: from
  //      the street the bent floor fans out over the shafts' tops and must hide them (the playtest: a landing poking out
  //      past the floor's corner, at the entry and at the exit)
  for (const [a, b, h] of LEDGES) if (on(a - 20, b + 20)) drawLedge(c, v, a, b, h);
  // ---- the floor under him (bent), the water's body, the rock over the flooded shaft
  drawGroundFloor(c, v);
  if (on(6100, 6800)) drawMarks(c);
  drawWaterBack(c, state);
  drawMineRock(c, state, v);
  // ---- the mine's floors' lips (lit rock: he stands on them)
  const M = hr('mine', MINE, 0.08);
  for (const [a, b, h1] of GROUND) if (h1 < -300 && h1 > -800 && on(a, b)) { box(c, X(a), Y(h1) - 1, X(b) - X(a), 1, INK); box(c, X(a), Y(h1), X(b) - X(a), 2, M[5]); box(c, X(a), Y(h1) + 2, X(b) - X(a), 2, M[4]); checker(c, X(a), Y(h1) + 4, X(b) - X(a), 2, M[3], 0); }
  // ---- the solids he stands on, the showdown's cover
  for (const s of SOLIDS) drawSolid(c, state, v, s);
  for (const [a, b, h] of COVER) if (on(a, b)) drawTrough(c, v, X(a), X(b), Y(h));
  // ---- signs (the park's planks; warnings painted on)
  //      (each kept on its own stretch of ground: never out over an edge (the playtest: signs hanging off ledges))
  for (const [rx, h, words, warn] of SIGNS) {
    if (!words.length || !on(rx - 160, rx + 160)) continue;
    const run = GROUND.find(([a, b, h1, h2]) => h1 === h && h2 === h && rx >= a && rx <= b);
    parkSign(c, X(rx), Y(h), words, { warn, seed: rx, tall: h < -100 ? 64 + 14 * (words.length - 2) : 104, within: run ? [X(run[0]), X(run[1])] : undefined });
  }
  // ---- the canaries in their cages
  drawCanaries(c, state);
};

// ---------------------------------------------------------------------------------------------------------------
// The pieces

/** The end of the line: the rails coming in, the depot, FIRST AID, and the crash's wreck (crash.ts) or the stop rebuilt. */
const drawEndOfLine = (c: Ctx, state: GameState, v: TownView, wreck: boolean) => {
  drawTracks(c, v, X(-900), X(100));
  drawDepot(c, v, wreck && depotStoveIn());
  drawFirstAid(c, v, wreck && firstAidOpen());
  if (wreck) {
    // (the crash (crash.ts): happening, or as it ended up: the engine through the stop and stove into the depot, the
    // tender up on its cab, the coach jackknifed behind, fires, steam, wreckage; the guests well back gawking)
    drawWreck(c, state);
  } else {
    drawCanopy(c, 0);
    drawRebuilt(c);
  }
};

/** A ledge at the play plane: the mine's landings and alcoves (timber, its top going back into the shaft, its lip
 *  lit); the rest have their own drawing (the balconies, the catwalk, the loft, the saloon's). */
const drawLedge = (c: Ctx, v: TownView, a: number, b: number, h: number) => {
  if (h >= 0) return;
  const xa = X(a), xb = X(b), y = Y(h), T = hr('timber', TIMBER, 0.08), S = hr('steel', STEEL, 0.08);
  // (kept inside the shaft or the tunnel it's in: its top going back used to swing out through the rock either side
  // as he came up to it (the playtest's: ledges clipping into the walls before you go down))
  const [cx0, cy0, cx1, cy1] = mineCut(a, b);
  c.save(); c.beginPath(); c.rect(cx0, cy0, cx1 - cx0, cy1 - cy0); c.clip();
  drawLanding(c, v, xa, xb, y, T, S);
  c.restore();
};
const drawLanding = (c: Ctx, v: TownView, xa: number, xb: number, y: number, T: string[], S: string[]) => {
  topBack(c, v.eye, xa, xb, y, 1, 0.88, [T[2], T[3], T[4], T[4], T[5]], 2);
  box(c, xa - 1, y - 1, xb - xa + 2, 14, INK); box(c, xa, y, xb - xa, 12, T[3]); box(c, xa, y + 10, xb - xa, 2, T[1]);
  for (let x = xa + 4; x < xb - 4; x += 18) box(c, x, y + 3, 1, 8, T[1]);
  lipAt(c, xa, y, xb - xa);
  // (the brackets under it into the rock, their bolts)
  for (const bx of [xa + 8, xb - 14]) { c.fillStyle = INK; c.beginPath(); c.moveTo(bx - 1, y + 12); c.lineTo(bx + 7, y + 12); c.lineTo(bx + 7, y + 30); c.closePath(); c.fill(); c.fillStyle = S[3]; c.beginPath(); c.moveTo(bx, y + 12); c.lineTo(bx + 6, y + 12); c.lineTo(bx + 6, y + 27); c.closePath(); c.fill(); box(c, bx + 3, y + 14, 2, 2, S[6]); }
};

/** The small solids (a crate, the bales; the bar from inside): their fronts, their tops going back, lit along the front.
 *  The rest (the wagon's bed, the stores, the saloon, the mill's works, the mountain) have their own drawing. */
const drawSolid = (c: Ctx, state: GameState, v: TownView, [a, b, h, h2]: [number, number, number, number?]) => {
  const xa = X(a), xb = X(b), top = Y(h), bot = Y(h2 ?? 0);
  if (!onScreen(state, xa, xb)) return;
  if (a === 4250) { if (inSaloon(state.player.pos.x + state.player.width / 2, state.player.pos.y + state.player.height)) drawBar(c, state, xa, xb, top); return; }
  if (a === 7040) {
    // (hay bales stacked: twine bands, straw sticking out, lit along the top)
    const H = hr('hay', HAY);
    topBack(c, v.eye, xa, xb, top, 1, 0.92, [H[2], H[3], H[4], H[4], H[5]], 2);
    for (const [e, side] of [[xa, -1], [xb, 1]] as const) sideBack(c, v.eye, e, side, top, bot, 1, 0.92, [H[1], H[2], H[2], H[3], H[4]], 2, bot >= GY - 1);
    box(c, xa - 1, top - 1, xb - xa + 2, bot - top + 1, INK);
    for (let y = top, r = 0; y < bot; y += 35, r++) { box(c, xa, y, xb - xa, 35, H[3]); box(c, xa, y, xb - xa, 3, H[5]); box(c, xa, y + 32, xb - xa, 3, H[1]); for (let k = 0; k < 14; k++) box(c, xa + hash(k + r * 7) * (xb - xa - 4), y + 4 + hash(k * 3 + r) * 26, 3, 1, k % 2 ? H[5] : H[2]); for (const tx of [xa + 14, xb - 18]) box(c, tx, y, 2, 35, '#6A4A20'); }
    for (let x = xa; x < xb; x += 3) box(c, x, top - 2 - hash(x) * 3, 1, 3, H[5]);
    lipAt(c, xa, top, xb - xa, [H[1], H[4], H[5], H[6]]);
    return;
  }
  if (![2560, 4965, 5280, 5580].includes(a)) return;
  // (a crate: planked, cross-braced, stenciled, its top going back; its lid's edge lit)
  const P = hr7('#A07848'), W = hr('varn', VARNISH);
  topBack(c, v.eye, xa, xb, top, 1, 0.93, [P[2], P[3], P[4], P[4], P[5]], 2);
  for (const [e, side] of [[xa, -1], [xb, 1]] as const) sideBack(c, v.eye, e, side, top, bot, 1, 0.93, [P[1], P[2], P[2], P[3], P[4]], 2, bot >= GY - 1);
  box(c, xa - 1, top - 1, xb - xa + 2, bot - top + 1, INK); box(c, xa, top, xb - xa, bot - top, P[3]);
  for (let y = top + 10; y < bot; y += 10) { box(c, xa, y, xb - xa, 1, P[1]); box(c, xa, y + 1, xb - xa, 1, P[4]); }
  box(c, xa, top, 4, bot - top, P[5]); box(c, xb - 4, top, 4, bot - top, P[1]);
  c.strokeStyle = W[2]; c.lineWidth = 3; c.beginPath(); c.moveTo(xa + 3, top + 3); c.lineTo(xb - 3, bot - 3); c.stroke();
  c.strokeStyle = P[5]; c.lineWidth = 1; c.beginPath(); c.moveTo(xa + 3, top + 1); c.lineTo(xb - 3, bot - 5); c.stroke();
  box(c, xa + 4, bot - 16, 14, 6, W[1]); box(c, xa + 5, bot - 15, 12, 1, P[2]);
  lipAt(c, xa, top, xb - xa);
};

/** The showdown's water trough (cover: shots stop in it), planked, the water in it. */
const drawTrough = (c: Ctx, v: TownView, xa: number, xb: number, top: number) => {
  const P = hr7('#6B4423');
  topBack(c, v.eye, xa, xb, top, 1, 0.94, ['#1E3A4A', '#2A4E62', '#3A6A88', '#3A6A88', '#5A8AA8'], 2);
  for (const [e, side] of [[xa, -1], [xb, 1]] as const) sideBack(c, v.eye, e, side, top, GY, 1, 0.94, [P[1], P[2], P[2], P[3], P[4]], 2);
  box(c, xa - 1, top - 1, xb - xa + 2, GY - top + 1, INK); box(c, xa, top, xb - xa, GY - top, P[3]);
  box(c, xa, top + 9, xb - xa, 1, P[1]); box(c, xa, top + 10, xb - xa, 1, P[5]); box(c, xa, top, 3, GY - top, P[5]); box(c, xb - 3, top, 3, GY - top, P[1]);
  for (const bx of [xa + 6, xb - 8]) box(c, bx, top + 2, 2, GY - top - 4, hr('steel', STEEL)[2]);
  lipAt(c, xa, top, xb - xa);
};

/** The lit things for the lighting system: the mine's lanterns (muted: soft warm glows, the playtest's, as the train's
 *  tunnels), the saloon's chandeliers (soft), the jack ladder's lamp, the street's lamps after dark (soft, never
 *  spotlights), the wreck's fires. */
export const townLamps = (state: GameState) => {
  const out = LANTERNS.map(([lx, lh]) => ({ x: X(lx), y: Y(lh), r: 120, a: 0.32, color: '#4A3818' }));
  for (const lx of [4000, 4400, 4750]) out.push({ x: X(lx), y: Y(400), r: 220, a: 0.4, color: '#5A4420' });
  out.push({ x: LADDER.foot, y: Y(120), r: 140, a: 0.35, color: '#5A4420' });
  // (the stores' door lamps (back at the fronts' depth) and the saloon's, after dark: small, warm)
  if (timeOfDay().lamps > 0.3) {
    const eye = { x: state.camera.x + 400, y: state.camera.y + 252 };
    for (const F of FRONTS) { const lx = X(F.rx) + F.w / 2 + 38, ly = GY - 115; out.push({ x: eye.x + (lx - eye.x) * FRONT_D, y: eye.y + (ly - eye.y) * FRONT_D, r: 80, a: 0.26, color: '#5A4018' }); }
    for (const sx of [3866, 4416, 4846]) out.push({ x: X(sx), y: GY - 152, r: 90, a: 0.28, color: '#5A4018' });
  }
  if (wreckHere(state)) out.push(...wreckLights(state));
  return out.filter(l => onScreen(state, l.x - l.r, l.x + l.r));
};

void at; void PLANK; void FRONT_D;
