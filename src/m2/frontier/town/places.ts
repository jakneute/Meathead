// Sawdust Gulch's other places (the final pass: peak SNES):
//
//   the end of the line   the depot (at the play plane: the engine's stove into it), a clapboard station with its
//                         bay, its name board, the platform; FIRST AID (the park's own shack in frontier dress, its red
//                         cross, its door open while they carry him in); later visits, the stop rebuilt in fresh lumber
//                         with the bill (REPAIRS BILLED TO: YOU KNOW WHO) on a sawhorse
//   the water tower       a cedar tank in iron hoops on X-braced timber legs, its spout, its catwalk (a ledge: lit)
//   the snake-oil wagon   DR. PEABODY'S: the painted box wagon (its bed a solid: lit), its canvas, spoked wheels, the
//                         bottles racked on its tailboard
//   the showdown          the Wild West Show's bleachers packed with guests (cheering, booing, scared), the rope, the
//                         loudspeakers on their pole, the board up on its posts, the marks in the dirt, the gates
//   the livery            a red barn at the play plane (its hay loft a ledge: the loft door open on the hay, lit), the
//                         stalls, a fiberglass horse's rump; the smithy back a step (its forge glowing, the bellows,
//                         the chimney's smoke), the anvil out front
//   the mill              the sawmill's open shed (posts, the roof's underside, its back wall with windows), the works
//                         stacked solid under the deck, the gears turning, the JACK LADDER sign
//   the lumber yard       stacked lumber back a step (stickered piles, dimmed), a crane
//
// Standable reads standable: every ledge, deck and catwalk lit along its top; the rest dimmed or lipless.

import type { GameState } from '../../../m1/game/core/state';
import { signText, fit } from '../../signLetters';
import { burned } from '../kit';
import { GY } from '../geometry';
import {
  type Ctx, type TownView, box, checker, mix, hash, at, poly, still, stillAt, atDepth, seen, sideBack, topBack, underBack, INK, timeOfDay,
  hr, hr7, back7, clapboard, batten, sash, door, western, signPaint, warmth, lampsOn, puff, flame,
  PLANK, PLY, STEEL, BRASS, TAR, SHINGLE, BARN, TOPLIP, VARNISH, WEATHER, IRON, BLACK, HAY, FRONT_D, SAWDUST, TIMBER,
} from './paint';
import { townOf } from './state';
import { SQUARE, X, Y } from './layout';
import { squareShut } from './scenes';
import { drawGuest } from './people';
import { drawBalcony } from './fronts';

const lipAt = (c: Ctx, x: number, y: number, w: number) => { const L = hr('lip', TOPLIP); box(c, x, y - 1, w, 1, INK); box(c, x, y, w, 1, L[3]); box(c, x, y + 1, w, 1, L[2]); box(c, x, y + 2, w, 1, L[1]); };

// ---------------------------------------------------------------------------------------------------------------
// The end of the line

/** The depot: a clapboard station at the play plane, its bay window, its name board, the eaves on brackets. */
export const drawDepot = (c: Ctx, v: TownView) => {
  const xa = X(380), w = 240, h = 260, top = GY - h, eye = v.eye;
  const R = hr7('#7A6A4A'), T = hr7('#E8D8B0'), Sh = hr('shingle', SHINGLE);
  sideBack(c, eye, xa, -1, top, GY, 1, 0.84, R, 4);
  sideBack(c, eye, xa + w, 1, top, GY, 1, 0.84, R, 4);
  topBack(c, eye, xa - 10, xa + w + 10, top - 24, 1, 0.84, [Sh[1], Sh[2], Sh[3], Sh[3], Sh[4]], 3);
  still(c, 'depot', xa, GY, -16, -h - 40, w + 32, h + 42, g => {
    box(g, -1, -h - 1, w + 2, h + 1, INK);
    batten(g, 0, -h, w, h, R, 14, 380);
    box(g, 0, -h, 6, h, T[3]); box(g, w - 6, -h, 6, h, T[2]);
    // (the eaves overhanging on brackets, shingled)
    box(g, -12, -h - 26, w + 24, 26, INK); box(g, -11, -h - 25, w + 22, 24, Sh[3]);
    for (let r = 0; r < 3; r++) for (let x = -11 + (r % 2) * 6; x < w + 11; x += 12) { box(g, x, -h - 25 + r * 8, 11, 7, Sh[2 + ((x + r) & 1)]); box(g, x, -h - 19 + r * 8, 11, 1, Sh[5]); }
    for (let x = 10; x < w - 4; x += 38) { box(g, x, -h, 6, 14, T[2]); box(g, x, -h, 2, 14, T[4]); box(g, x + 1, -h + 14, 4, 2, T[1]); }
    // (the name board, burned)
    box(g, 21, -h + 15, w - 40, 34, INK); box(g, 22, -h + 16, w - 42, 32, hr('plank', PLANK)[5]); box(g, 22, -h + 16, w - 42, 2, hr('plank', PLANK)[6]);
    signText(g, 'SAWDUST GULCH', w / 2, -h + 38, fit('SAWDUST GULCH', burned(2, 7), w - 52));
    signText(g, 'DEPOT', w / 2, -h + 66, western(2, '#E8D8B0', R[0]));
    // (the bay window, the ticket window (CLOSED), the door)
    sash(g, 24, -150, 40, 56, T, warmth(), '#B8302A'); sash(g, w - 64, -150, 40, 56, T, warmth(), '#B8302A');
    box(g, 24, -82, 40, 28, INK); box(g, 25, -81, 38, 26, '#2A1A10'); box(g, 27, -76, 34, 12, '#F2E8C8'); signText(g, 'CLOSED', 44, -66, { sx: 1, sy: 1, fill: '#7F1D1D' });
    door(g, w / 2 - 25, -104, 50, 104, hr('door', VARNISH));
    checker(g, 0, -10, w, 10, R[1], 0);
  });
};

/** FIRST AID: the park's own shack in frontier dress (board and batten painted white, a red cross, the park's green
 *  trim); its door open while they carry him in. */
export const drawFirstAid = (c: Ctx, v: TownView, open: boolean) => {
  const xa = X(690), w = 130, h = 160, eye = v.eye, R = hr7('#E4E2DA'), T = hr7('#2E6A4A');
  sideBack(c, eye, xa, -1, GY - h, GY, 1, 0.86, R, 3);
  sideBack(c, eye, xa + w, 1, GY - h, GY, 1, 0.86, R, 3);
  still(c, 'firstaid', xa, GY, -10, -h - 24, w + 20, h + 26, g => {
    box(g, -1, -h - 1, w + 2, h + 1, INK); batten(g, 0, -h, w, h, R, 12, 690);
    box(g, -6, -h - 10, w + 12, 12, INK); box(g, -5, -h - 9, w + 10, 10, T[3]); box(g, -5, -h - 9, w + 10, 2, T[5]);
    box(g, 50, -152, 30, 30, '#F8FAFC'); box(g, 60, -150, 10, 26, '#D81E1E'); box(g, 52, -142, 26, 10, '#D81E1E'); box(g, 61, -150, 3, 26, '#F0503A');
    box(g, 30, -128, 70, 18, INK); box(g, 31, -127, 68, 16, '#D81E1E'); box(g, 31, -127, 68, 2, '#F0503A');
    signText(g, 'FIRST AID', 65, -114, signPaint(1, '#FFFFFF', '#5A0A0A'));
    sash(g, 8, -96, 22, 30, T, warmth());
    box(g, 99, -60, 18, 12, '#2A6A4A'); box(g, 100, -59, 16, 1, '#5AA87A');
  });
  // (the door: shut, or open (dark) while they carry him in)
  const dx = X(728);
  box(c, dx - 1, GY - 105, 56, 105, INK);
  if (open) { box(c, dx, GY - 104, 54, 104, '#140C08'); box(c, dx, GY - 104, 6, 104, '#2A1A10'); }
  else { box(c, dx, GY - 104, 54, 104, R[2]); box(c, dx, GY - 104, 3, 104, R[4]); box(c, dx + 6, GY - 96, 42, 40, R[1]); box(c, dx + 6, GY - 50, 42, 40, R[1]); box(c, dx + 44, GY - 54, 5, 4, BRASS[4]); }
};

/** The stop rebuilt (a later visit): fresh lumber, the striped beam, the bill on a sawhorse; the rails up to it. */
export const drawRebuilt = (c: Ctx) => {
  still(c, 'rebuilt', X(100), GY, -4, -76, 240, 80, g => {
    const P = hr7('#D8B068'), S = hr('steel', STEEL);
    box(g, 0, -5, 100, 4, INK); box(g, 0, -5, 100, 2, S[5]);
    for (let x = 0; x < 100; x += 26) { box(g, x, -3, 14, 4, P[1]); box(g, x, -3, 14, 1, P[3]); }
    const bx = 90;
    box(g, bx - 16, -52, 34, 52, INK); box(g, bx - 15, -51, 32, 51, P[3]); box(g, bx - 15, -51, 4, 51, P[5]);
    for (let k = 0; k < 3; k++) { box(g, bx - 15, -46 + k * 14, 32, 7, k % 2 ? '#F2F0EA' : '#C81E1E'); box(g, bx - 15, -46 + k * 14, 32, 1, k % 2 ? '#FFFFFF' : '#E85A4A'); }
    // (the sawhorse and the bill on it)
    box(g, 130, -40, 70, 6, INK); box(g, 131, -39, 68, 4, '#F2D02A'); box(g, 131, -39, 68, 1, '#FFF08A');
    for (const lx of [136, 192]) { g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(lx, -36); g.lineTo(lx - 6, 0); g.moveTo(lx, -36); g.lineTo(lx + 6, 0); g.stroke(); g.strokeStyle = P[3]; g.lineWidth = 2; g.stroke(); }
    box(g, 120, -74, 92, 30, INK); box(g, 121, -73, 90, 28, '#F2ECD8'); box(g, 121, -73, 90, 2, '#FFFFFF');
    signText(g, 'REPAIRS BILLED TO', 166, -62, { sx: 1, sy: 1, fill: '#2A1A10' });
    signText(g, 'YOU KNOW WHO', 166, -51, { sx: 1, sy: 1, fill: '#B91C1C' });
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The water tower (its catwalk a ledge: lit)

export const drawWaterTower = (c: Ctx, v: TownView, x: number) => {
  still(c, 'tower', x, GY, -100, -432, 206, 434, g => {
    const T = hr7('#6B4423'), C = hr7('#8A5A30'), S = hr('iron', IRON);
    // (the legs: heavy timbers, X-braced between, the bracing's bolts)
    for (const lx of [-80, 80]) { box(g, lx - 6, -200, 12, 200, INK); box(g, lx - 5, -200, 10, 200, T[3]); box(g, lx - 5, -200, 3, 200, T[5]); box(g, lx + 2, -200, 3, 200, T[1]); box(g, lx - 8, -8, 16, 8, T[2]); }
    for (const [y0, y1] of [[-186, -110], [-104, -26]] as const) {
      g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-78, y0); g.lineTo(78, y1); g.moveTo(78, y0); g.lineTo(-78, y1); g.stroke();
      g.strokeStyle = T[3]; g.lineWidth = 4; g.stroke();
      g.strokeStyle = T[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(-78, y0 - 1); g.lineTo(78, y1 - 1); g.stroke();
    }
    box(g, -82, -108, 164, 6, INK); box(g, -81, -107, 162, 4, T[3]);
    // (the tank: cedar staves in iron hoops, lit down its left, a seep stain)
    box(g, -77, -381, 154, 178, INK);
    for (let sx = -76; sx < 76; sx += 8) { const k = (sx + 76) / 152; const col = k < 0.2 ? C[5] : k < 0.45 ? C[4] : k < 0.75 ? C[3] : k < 0.9 ? C[2] : C[1]; box(g, sx, -380, 8, 176, col); box(g, sx, -380, 1, 176, C[1]); }
    for (let y = -368; y < -210; y += 30) { box(g, -77, y, 154, 4, S[2]); box(g, -77, y, 154, 1, S[5]); for (let bx = -60; bx < 70; bx += 40) box(g, bx, y, 3, 4, S[4]); }
    box(g, -40, -260, 8, 50, C[1]); checker(g, -42, -240, 12, 30, C[2], 0);
    // (SAWDUST GULCH painted on it)
    signText(g, 'SAWDUST GULCH', 0, -288, western(1, '#F5F0DC', C[0]));
    // (the conical roof, shingled, its finial)
    g.fillStyle = INK; g.beginPath(); g.moveTo(-86, -378); g.lineTo(0, -422); g.lineTo(86, -378); g.closePath(); g.fill();
    const Sh = hr('shingle', SHINGLE);
    for (let r = 0; r < 5; r++) { const y0 = -380 - r * 8, half = 82 - r * 16; for (let x = -half; x < half; x += 10) { box(g, x, y0 - 8, 9, 7, Sh[2 + ((x / 10 + r) & 1)]); box(g, x, y0 - 2, 9, 1, Sh[5]); } }
    box(g, -2, -428, 4, 10, S[3]);
    // (the spout, swung up, its chain)
    box(g, 70, -250, 30, 8, INK); box(g, 71, -249, 28, 6, S[3]); box(g, 71, -249, 28, 1, S[5]); for (let y = -320; y < -250; y += 4) box(g, 96, y, 2, 3, S[4]);
  });
  // (the catwalk round it: its planks going back, the lit lip, the rail)
  const y = Y(190), xa = x - 80, xb = x + 80, P = hr7('#7A5230');
  topBack(c, v.eye, xa, xb, y, 1, 0.9, [P[1], P[2], P[3], P[4], P[5]], 2);
  box(c, xa - 1, y - 1, xb - xa + 2, 12, INK); box(c, xa, y, xb - xa, 10, P[3]); box(c, xa, y + 8, xb - xa, 2, P[1]);
  lipAt(c, xa, y, xb - xa);
  for (let rx = xa + 2; rx < xb; rx += 16) { box(c, rx - 1, y - 30, 4, 30, INK); box(c, rx, y - 29, 2, 29, P[4]); }
  box(c, xa - 1, y - 33, xb - xa + 2, 5, INK); box(c, xa, y - 32, xb - xa, 3, P[3]); box(c, xa, y - 32, xb - xa, 1, P[5]);
  // (a ladder up a leg)
  for (let ly = y + 14; ly < GY - 6; ly += 14) { box(c, xa - 14, ly, 14, 3, INK); box(c, xa - 13, ly, 12, 2, P[4]); }
  box(c, xa - 15, y + 10, 3, GY - y - 10, P[2]); box(c, xa - 3, y + 10, 3, GY - y - 10, P[2]);
};

// ---------------------------------------------------------------------------------------------------------------
// The snake-oil wagon

export const drawWagon = (c: Ctx, v: TownView, x: number, f: number) => {
  const xa = X(2150), xb = X(2350), top = Y(80), eye = v.eye;
  const B = hr7('#7F1D1D'), G = hr7('#E8C25A'), Cv = hr7('#E7D8B0'), W = hr('varn', VARNISH);
  topBack(c, eye, xa, xb, top, 1, 0.92, [B[1], B[2], B[3], B[3], B[4]], 2);
  sideBack(c, eye, xa, -1, top, GY - 40, 1, 0.92, B, 2);
  sideBack(c, eye, xb, 1, top, GY - 40, 1, 0.92, B, 2);
  still(c, 'wagon', xa, GY, -14, -262, xb - xa + 28, 264, g => {
    const w = xb - xa;
    // (the canvas bonnet over the bed: dimmed (not a platform), its hoops)
    g.globalAlpha = 0.78;
    g.fillStyle = INK; g.beginPath(); g.moveTo(2, -80); g.quadraticCurveTo(w / 2, -262, w - 2, -80); g.closePath(); g.fill();
    g.fillStyle = Cv[3]; g.beginPath(); g.moveTo(8, -82); g.quadraticCurveTo(w / 2, -254, w - 8, -82); g.closePath(); g.fill();
    g.fillStyle = Cv[4]; g.beginPath(); g.moveTo(8, -82); g.quadraticCurveTo(w * 0.3, -230, w / 2, -172); g.lineTo(w * 0.32, -82); g.closePath(); g.fill();
    for (const hx of [0.25, 0.5, 0.75]) { g.strokeStyle = Cv[1]; g.lineWidth = 2; g.beginPath(); g.moveTo(w * hx, -82); g.lineTo(w * hx, -82 - Math.sin(hx * Math.PI) * 168); g.stroke(); }
    g.globalAlpha = 1;
    // (DR. PEABODY'S board on the bonnet)
    box(g, w / 2 - 70, -172, 140, 44, INK); box(g, w / 2 - 69, -171, 138, 42, B[3]); box(g, w / 2 - 69, -171, 138, 2, B[5]);
    for (let k = 0; k < 2; k++) box(g, w / 2 - 66 + k * 128, -168, 4, 36, G[3]);
    signText(g, "DR. PEABODY'S", w / 2, -154, western(1, '#F2D24A', B[0]));
    signText(g, 'MIRACLE TONIC', w / 2, -136, western(1, '#F5F0DC', B[0]));
    // (the box: painted red, gilt scrollwork, the tailboard racked with bottles)
    box(g, -1, -81, w + 2, 42, INK); box(g, 0, -80, w, 40, B[3]); box(g, 0, -80, w, 2, B[5]); box(g, 0, -44, w, 4, B[1]);
    for (let k = 0; k < 4; k++) { const px = 12 + k * ((w - 24) / 4); box(g, px, -74, (w - 24) / 4 - 8, 26, B[2]); g.strokeStyle = G[3]; g.lineWidth = 1; g.strokeRect(px + 2, -72, (w - 24) / 4 - 12, 22); }
    for (let k = 0; k < 9; k++) { const bx = 10 + k * 20; box(g, bx - 1, -100, 10, 20, INK); box(g, bx, -99, 8, 18, '#3E7A3A'); box(g, bx + 1, -97, 2, 12, '#7ABA6A'); box(g, bx + 2, -104, 4, 5, '#3E7A3A'); box(g, bx + 1, -93, 6, 5, '#F5E6C0'); }
    box(g, 4, -82, w - 8, 3, W[4]);
    // (the wheels: spoked, iron tires, hubs; the shafts down in front)
    for (const wx of [30, w - 30]) {
      g.fillStyle = INK; g.beginPath(); g.arc(wx, -22, 23, 0, Math.PI * 2); g.fill();
      g.strokeStyle = hr('steel', STEEL)[4]; g.lineWidth = 3; g.beginPath(); g.arc(wx, -22, 20, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = G[3]; g.lineWidth = 2; g.beginPath(); g.arc(wx, -22, 17, 0, Math.PI * 2); g.stroke();
      for (let k = 0; k < 12; k++) { const a = (k * Math.PI) / 6; g.strokeStyle = G[k % 2 ? 2 : 4]; g.lineWidth = 2; g.beginPath(); g.moveTo(wx, -22); g.lineTo(wx + Math.cos(a) * 17, -22 + Math.sin(a) * 17); g.stroke(); }
      g.fillStyle = INK; g.beginPath(); g.arc(wx, -22, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = G[4]; g.beginPath(); g.arc(wx, -22, 4, 0, Math.PI * 2); g.fill();
    }
    g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(-4, -44); g.lineTo(-14, -6); g.stroke(); g.strokeStyle = W[3]; g.lineWidth = 3; g.stroke();
  });
  lipAt(c, xa, top, xb - xa);
  void x; void f;
};

// ---------------------------------------------------------------------------------------------------------------
// The showdown

/** The showdown's back: the bleachers, the board, the loudspeakers (before the bank and the jail). */
export const drawSquareBack = (c: Ctx, state: GameState, v: TownView) => {
  const f = state.frame, tw = townOf(state), eye = v.eye;
  // (the bleachers back a step, packed: tiers of planks on their frame, the guests on them, the rope in front)
  const BD = 0.86, bx = X(6300), bw = 320;
  atDepth(c, eye, BD, () => {
    const P = back7('#7A5230', 0.08), S = back7(STEEL[3], 0.08);
    for (let k = 0; k < 5; k++) { const y = GY - 50 - k * 30; box(c, bx + k * 10 - 1, y - 1, bw - k * 20 + 2, 12, INK); box(c, bx + k * 10, y, bw - k * 20, 10, P[3]); box(c, bx + k * 10, y, bw - k * 20, 2, P[5]); box(c, bx + k * 10, y + 8, bw - k * 20, 2, P[1]); }
    for (let x = bx; x <= bx + bw; x += 40) { box(c, x - 2, GY - 190, 4, 190, S[2]); }
    c.strokeStyle = S[2]; c.lineWidth = 2; c.beginPath(); for (let x = bx; x < bx + bw; x += 40) { c.moveTo(x, GY - 10); c.lineTo(x + 40, GY - 160); } c.stroke();
    const cheer = tw.duel.phase === 'won' || tw.duel.phase === 'done' || tw.duel.phase === 'intro', boo = tw.duel.phase === 'posse';
    for (let k = 0; k < 5; k++) for (let i = 0; i < 7 - k; i++) {
      const seed = k * 13 + i * 7 + 3, gx = bx + 26 + k * 10 + i * ((bw - k * 20 - 36) / (7 - k)), gy = GY - 50 - k * 30;
      const pose = cheer && (i + k + Math.floor(f / 30)) % 3 === 0 ? 'cheer' : boo && (i + k) % 3 === 0 ? 'point' : (i * 3 + k) % 5 === 0 ? 'photo' : 'stand';
      drawGuest(c, gx, gy, { seed, f, pose, mood: cheer ? 'happy' : boo ? 'angry' : tw.duel.phase === 'duel' ? 'scared' : 'bored', facing: i % 2 ? -1 : 1, scale: 0.78 });
    }
    // (the rope on its stanchions)
    for (let x = bx - 20; x < bx + bw + 20; x += 40) { box(c, x - 1, GY - 31, 6, 31, INK); box(c, x, GY - 30, 4, 30, BRASS[3]); box(c, x, GY - 30, 1, 30, BRASS[5]); box(c, x - 2, GY - 33, 8, 4, BRASS[4]); }
    c.strokeStyle = '#8A1426'; c.lineWidth = 3; c.beginPath(); for (let x = bx - 20; x < bx + bw - 20; x += 40) { c.moveTo(x + 2, GY - 28); c.quadraticCurveTo(x + 22, GY - 18, x + 42, GY - 28); } c.stroke();
  });
  // (the board up on its posts behind it all; the loudspeakers on their pole)
  const mid = (SQUARE.a + SQUARE.b) / 2;
  stillAt(c, v, 0.82, 'showdown-board', mid, GY, -150, -470, 300, 472, g => {
    const P = back7('#7A5230', 0.06), Pl = back7(PLANK[4], 0.04);
    for (const px of [-120, 120]) { box(g, px - 5, -440, 10, 440, INK); box(g, px - 4, -440, 8, 440, P[3]); box(g, px - 4, -440, 2, 440, P[5]); }
    box(g, -141, -465, 282, 64, INK); box(g, -140, -464, 280, 62, Pl[3]); box(g, -140, -464, 280, 2, Pl[5]); box(g, -140, -404, 280, 2, Pl[1]);
    for (let y = -460; y < -406; y += 4) box(g, -136 + ((y * 7) % 23), y, 120, 1, Pl[2]);
    signText(g, 'THE SHOWDOWN', 0, -432, fit('THE SHOWDOWN', western(2, '#7F1D1D', Pl[1]), 260));
    signText(g, 'DAILY. NOBODY GETS HURT.', 0, -414, burned(1, 3));
  });
  atDepth(c, eye, 0.88, () => {
    const S = back7(STEEL[3], 0.06);
    box(c, mid - 3, Y(330), 6, 330, INK); box(c, mid - 2, Y(330), 4, 330, S[3]); box(c, mid - 2, Y(330), 1, 330, S[5]);
    for (const dx of [-1, 1]) { const hx = mid + dx * 10; c.fillStyle = INK; c.beginPath(); c.moveTo(hx, Y(320)); c.lineTo(hx + dx * 18, Y(330)); c.lineTo(hx + dx * 18, Y(306)); c.closePath(); c.fill(); c.fillStyle = S[4]; c.beginPath(); c.moveTo(hx, Y(319)); c.lineTo(hx + dx * 16, Y(328)); c.lineTo(hx + dx * 16, Y(308)); c.closePath(); c.fill(); }
  });
};

/** The showdown's play plane: the balconies (ledges), the marks in the dirt, the gates. */
export const drawSquareFront = (c: Ctx, state: GameState, v: TownView) => {
  const shut = squareShut(state);
  // (the balconies (ledges): at the play plane, on posts)
  drawBalcony(c, v, 6000, 6180, 170);
  drawBalcony(c, v, 6740, 6920, 170);
  // (the gates at the ends: posts, and shut while it's on (SHOW IN PROGRESS))
  const P = hr7('#7A5230');
  for (const gx of [SQUARE.a - 14, SQUARE.b + 2]) {
    for (const px of [gx - 4, gx + 12]) { box(c, px - 1, GY - 201, 8, 201, INK); box(c, px, GY - 200, 6, 200, P[2]); box(c, px, GY - 200, 2, 200, P[4]); }
    box(c, gx - 8, GY - 206, 30, 8, INK); box(c, gx - 7, GY - 205, 28, 6, P[3]); box(c, gx - 7, GY - 205, 28, 1, P[5]);
    if (shut) {
      box(c, gx - 6, GY - 200, 26, 200, INK); box(c, gx - 5, GY - 199, 24, 198, P[3]);
      for (let y = GY - 190; y < GY; y += 24) { box(c, gx - 5, y, 24, 4, P[1]); box(c, gx - 5, y + 4, 24, 1, P[5]); }
      c.strokeStyle = P[1]; c.lineWidth = 3; c.beginPath(); c.moveTo(gx - 4, GY - 10); c.lineTo(gx + 18, GY - 190); c.stroke();
      box(c, gx - 3, GY - 130, 20, 90, '#7F1D1D'); box(c, gx - 3, GY - 130, 20, 2, '#B83A2A');
      c.save(); c.translate(gx + 7, GY - 85); c.rotate(-Math.PI / 2); signText(c, 'SHOW IN PROGRESS', 0, 3, signPaint(1, '#FDE047', '#3A0A06')); c.restore();
    }
  }
};

/** The duel's marks in the dirt (on the floor: after it's down): an X each, chalked, scuffed. */
export const drawMarks = (c: Ctx) => {
  for (const mx of [SQUARE.mine, SQUARE.his]) {
    for (const [w, col] of [[4, '#5A4A34'], [2, '#F5F0DC']] as const) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(mx - 9, GY + 3); c.lineTo(mx + 9, GY + 11); c.moveTo(mx + 9, GY + 3); c.lineTo(mx - 9, GY + 11); c.stroke(); }
    box(c, mx - 12, GY + 12, 6, 1, '#F5F0DC'); box(c, mx + 6, GY + 2, 4, 1, '#F5F0DC');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The livery and the smithy

export const drawLivery = (c: Ctx, state: GameState, v: TownView) => {
  const f = state.frame, eye = v.eye;
  // ---- the smithy, back a step: stone forge, the chimney, the bellows, the doors open on the glow
  stillAt(c, v, 0.92, 'smithy', X(7550), GY, -10, -380, 320, 382, g => {
    const W = back7(WEATHER[3], 0.06), St = back7('#6A6460', 0.06), Sh = back7(SHINGLE[3], 0.06);
    box(g, -1, -241, 302, 241, INK); clapboard(g, 0, -240, 300, 240, W, 9, 7550);
    g.fillStyle = INK; g.beginPath(); g.moveTo(-10, -238); g.lineTo(150, -300); g.lineTo(310, -238); g.closePath(); g.fill();
    g.fillStyle = Sh[3]; g.beginPath(); g.moveTo(-6, -240); g.lineTo(150, -296); g.lineTo(306, -240); g.closePath(); g.fill();
    for (let r = 0; r < 5; r++) { const y = -246 - r * 11; box(g, 150 - (5 - r) * 30, y, (5 - r) * 60, 1, Sh[5]); }
    // (the chimney: fieldstone)
    box(g, 239, -361, 28, 130, INK); for (let y = -360, r = 0; y < -232; y += 10, r++) for (let x = 240 + (r % 2) * 7; x < 266; x += 13) { box(g, x, y, 12, 9, St[2 + ((x + r) & 1)]); box(g, x, y, 12, 1, St[5]); }
    // (the name board)
    box(g, 99, -221, 102, 30, INK); box(g, 100, -220, 100, 28, back7(PLANK[4], 0.04)[3]);
    signText(g, 'SMITHY', 150, -199, western(2, '#3A2A1A', back7(PLANK[2], 0.04)[3]));
    // (the doors wide open, the dark inside, the forge's hearth)
    box(g, 196, -150, 90, 150, INK); box(g, 197, -149, 88, 149, '#140C08');
    box(g, 212, -60, 60, 60, St[2]); box(g, 212, -60, 60, 3, St[5]);
    box(g, 30, -150, 70, 100, INK); box(g, 31, -149, 68, 98, W[2]); for (let x = 33; x < 98; x += 10) box(g, x, -149, 1, 98, W[1]);
    // (horseshoes nailed up over the door, points up: luck)
    for (let k = 0; k < 3; k++) { g.strokeStyle = back7(STEEL[4], 0.04)[3]; g.lineWidth = 2; g.beginPath(); g.arc(215 + k * 24, -160, 5, 0, Math.PI); g.stroke(); }
  });
  atDepth(c, eye, 0.92, () => {
    // (the forge's glow in there, its coals, sparks; the chimney's smoke)
    const glow = f % 10 < 5;
    box(c, X(7768), GY - 74, 44, 14, glow ? '#F97316' : '#FDBA74'); box(c, X(7774), GY - 70, 32, 6, '#FDE047');
    if (f % 6 === 0) box(c, X(7780) + (f % 30), GY - 84 - (f % 18), 2, 2, '#FDE047');
    for (let k = 0; k < 4; k++) { const t = ((f * 0.01 + k / 4) % 1); puff(c, X(7803) - t * 60, GY - 380 - t * 120, 8 + t * 20, ['#5A5A60', '#7A7A82', '#9A9AA2'], 0.5 * (1 - t)); }
  });
  // ---- the anvil out front on its stump
  still(c, 'anvil', X(7628), GY, -34, -52, 68, 54, g => {
    const S = hr('iron', IRON), T = hr('timber', TIMBER);
    box(g, -13, -28, 26, 28, INK); box(g, -12, -27, 24, 27, T[3]); box(g, -12, -27, 6, 27, T[5]); box(g, -12, -27, 24, 3, T[4]);
    g.fillStyle = INK; g.beginPath(); g.moveTo(-28, -50); g.lineTo(22, -50); g.lineTo(30, -46); g.lineTo(14, -40); g.lineTo(10, -32); g.lineTo(-10, -32); g.lineTo(-14, -40); g.lineTo(-30, -44); g.closePath(); g.fill();
    g.fillStyle = S[3]; g.beginPath(); g.moveTo(-26, -49); g.lineTo(21, -49); g.lineTo(27, -46); g.lineTo(13, -41); g.lineTo(9, -33); g.lineTo(-9, -33); g.lineTo(-13, -41); g.lineTo(-27, -44); g.closePath(); g.fill();
    box(g, -26, -49, 47, 2, S[5]); box(g, -26, -49, 47, 1, S[6]);
  });
  // ---- the livery barn (at the play plane): red board and batten, white trim, the gambrel roof, the loft door open on
  //      the hay (the loft a ledge), the stalls, a fiberglass horse's rump
  const xa = X(7050), xb = X(7450), top = Y(330), Bn = hr('barn', BARN), T = hr7('#F2ECE0'), Sh = hr('shingle', SHINGLE);
  // (its left side going back stops at the showdown's gate (nearer: it used to be drawn over the gate's posts))
  c.save(); c.beginPath(); c.rect(SQUARE.b + 24, v.top - 200, xb - SQUARE.b + 400, v.bot - v.top + 400); c.clip();
  sideBack(c, eye, xa, -1, top, GY, 1, 0.84, Bn, 4);
  c.restore();
  sideBack(c, eye, xb, 1, top, GY, 1, 0.84, Bn, 4);
  still(c, 'livery', xa, GY, -20, Y(426) - GY, xb - xa + 40, GY - Y(426) + 2, g => {
    const w = xb - xa, t = top - GY;
    box(g, -1, t - 1, w + 2, -t + 1, INK); batten(g, 0, t, w, -t, Bn, 18, 7050);
    // (the gambrel roof)
    g.fillStyle = INK; g.beginPath(); g.moveTo(-16, t + 2); g.lineTo(40, t - 56); g.lineTo(w / 2, t - 92); g.lineTo(w - 40, t - 56); g.lineTo(w + 16, t + 2); g.closePath(); g.fill();
    g.fillStyle = Sh[3]; g.beginPath(); g.moveTo(-11, t); g.lineTo(42, t - 53); g.lineTo(w / 2, t - 88); g.lineTo(w - 42, t - 53); g.lineTo(w + 11, t); g.closePath(); g.fill();
    g.fillStyle = Sh[4]; g.beginPath(); g.moveTo(-11, t); g.lineTo(42, t - 53); g.lineTo(w / 2, t - 88); g.lineTo(w / 2, t - 80); g.lineTo(48, t - 48); g.lineTo(0, t); g.closePath(); g.fill();
    for (let r = 1; r < 8; r++) { const k = r / 8; box(g, -11 + 53 * k, t - 53 * k, w + 22 - 106 * k, 1, Sh[1]); }
    // (the white trim: corner boards, an X on the doors)
    box(g, 0, t, 8, -t, T[3]); box(g, w - 8, t, 8, -t, T[2]);
    // (LIVERY painted up top)
    signText(g, 'LIVERY', w / 2, t + 38, western(3, '#F2ECE0', Bn[0]));
    // (the loft door: open, dark in there, the hay heaped (the loft floor lit: he stands on it), a pulley beam)
    const ly = Y(270) - GY, lb = Y(170) - GY;
    box(g, 130 - 1, ly - 1, 142, lb - ly + 1, INK); box(g, 130, ly, 140, lb - ly, '#1A0E08');
    const H = hr('hay', HAY);
    for (let k = 0; k < 8; k++) { g.fillStyle = H[2 + (k % 3)]; g.beginPath(); g.ellipse(140 + k * 17, lb - 8, 16, 14 - (k % 3) * 2, 0, Math.PI, 0); g.fill(); }
    for (let k = 0; k < 30; k++) box(g, 134 + hash(k * 3.3) * 130, lb - 4 - hash(k * 1.7) * 18, 4, 1, H[5]);
    box(g, 196, ly - 30, 8, 30, T[3]); box(g, 190, ly - 34, 60, 6, T[2]); box(g, 244, ly - 30, 3, 40, '#3A2A1A');
    // (the big doors below: rolled open on the dark, the stalls, the horse's rump)
    box(g, 129, Y(140) - GY - 1, 162, -(Y(140) - GY) + 1, INK); box(g, 130, Y(140) - GY, 160, -(Y(140) - GY), '#140C08');
    for (const sx of [150, 220]) { box(g, sx, -70, 3, 70, Bn[1]); box(g, sx, -70, 50, 3, Bn[2]); }
    box(g, 160, -96, 70, 52, INK); box(g, 161, -95, 68, 50, '#E8E4DC'); box(g, 161, -95, 68, 6, '#FFFFFF'); box(g, 161, -60, 68, 15, '#C8C0B4'); box(g, 154, -90, 10, 46, '#D6D0C6'); box(g, 150, -60, 8, 30, '#3A2A1A');
    box(g, 290, -150, 80, 150, INK); box(g, 291, -149, 78, 149, Bn[3]); g.strokeStyle = T[3]; g.lineWidth = 4; g.beginPath(); g.moveTo(293, -147); g.lineTo(367, -3); g.moveTo(367, -147); g.lineTo(293, -3); g.stroke(); g.strokeRect(293, -147, 74, 144);
    box(g, 0, -10, w, 10, Bn[1]); checker(g, 0, -16, w, 6, Bn[1], 0);
  });
  // (the loft's floor going back, seen only through the loft door (it's inside the barn: it used to show on the barn's
  // boards either side of the door); its lip lit)
  const ly = Y(170);
  c.save(); c.beginPath(); c.rect(xa + 130, Y(270), 140, ly - Y(270) + 1); c.clip();
  topBack(c, eye, X(7120), X(7400), ly, 1, 0.9, hr('hay', HAY).slice(1), 2);
  c.restore();
  lipAt(c, X(7120), ly, X(7400) - X(7120));
};

// ---------------------------------------------------------------------------------------------------------------
// The mill and the lumber yard

export const drawMill = (c: Ctx, state: GameState, v: TownView) => {
  const eye = v.eye, a = X(9780), b = X(10800), top = Y(560), wt = Y(220);
  // ---- the back wall of the shed, back a step: weathered boards, windows, the mill's name, the JACK LADDER sign
  stillAt(c, v, 0.88, 'mill-back', a, wt, -10, top - wt - 10, b - a + 20, wt - top + 12, g => {
    const W = back7(WEATHER[3], 0.06), w = b - a, t = top - wt;
    box(g, 0, t, w, -t, W[3]); batten(g, 0, t, w, -t, W, 20, 9780);
    for (let k = 0; k < 4; k++) { const wx = 120 + k * 230; sash(g, wx, Y(470) - wt, 70, 64, back7('#E8D8B0', 0.04), warmth()); }
    box(g, w / 2 - 151, t + 21, 302, 50, INK); box(g, w / 2 - 150, t + 22, 300, 48, back7(PLANK[4], 0.04)[3]); box(g, w / 2 - 150, t + 22, 300, 2, back7(PLANK[6], 0.04)[3]);
    signText(g, 'SAWDUST GULCH', w / 2, t + 44, western(2, '#3A2A1A', back7(PLANK[2], 0.04)[3]));
    signText(g, 'LUMBER MILL', w / 2, t + 64, burned(2, 9));
    box(g, 50, Y(380) - wt, 160, 36, INK); box(g, 51, Y(380) - wt + 1, 158, 34, '#E8C82A'); box(g, 51, Y(380) - wt + 1, 158, 2, '#FFF08A');
    signText(g, 'JACK LADDER', 130, Y(380) - wt + 15, signPaint(1, '#1C1209', '#B89A1A'));
    signText(g, 'LOGS UP. PEOPLE NOT ALLOWED.', 130, Y(380) - wt + 28, { sx: 1, sy: 1, fill: '#1C1209' });
    // (belts and pulleys on the wall, the line shaft)
    box(g, 0, t + 90, w, 4, back7(STEEL[2], 0.04)[3]);
    for (let x = 80; x < w; x += 200) { g.fillStyle = INK; g.beginPath(); g.arc(x, t + 92, 12, 0, Math.PI * 2); g.fill(); g.fillStyle = back7(STEEL[4], 0.04)[3]; g.beginPath(); g.arc(x, t + 92, 10, 0, Math.PI * 2); g.fill(); box(g, x - 2, t + 92, 4, 120, back7('#3A2A1A', 0.04)[3]); }
  });
  // ---- the shed's roof over it: its underside going back, the posts at the front, the fascia (no lip: not to stand on)
  const Tm = hr('timber', TIMBER);
  underBack(c, eye, a - 24, b + 24, top, 1, 0.88, [Tm[1], Tm[2], Tm[2]], 3);
  for (const px of [a + 10, (a + b) / 2, b - 10]) { box(c, px - 7, top, 14, wt - top, INK); box(c, px - 6, top, 12, wt - top, Tm[3]); box(c, px - 6, top, 3, wt - top, Tm[5]); box(c, px + 3, top, 3, wt - top, Tm[1]); }
  box(c, a - 25, top - 15, b - a + 50, 18, INK); box(c, a - 24, top - 14, b - a + 48, 16, hr('tar', TAR)[2]); box(c, a - 24, top - 14, b - a + 48, 2, hr('tar', TAR)[4]);
  // ---- the works under the deck: stacked lumber, stickered, a wall of it (solid), the gears turning
  const wa = X(9800), wb = X(10780);
  still(c, 'mill-works', wa, wt, -2, -4, wb - wa + 4, GY - wt + 6, g => {
    const P = hr7('#A07848'), w = wb - wa, h = GY - wt;
    box(g, -1, 0, w + 2, h, INK); box(g, 0, 1, w, h - 1, P[1]);
    for (let y = 12, r = 0; y < h; y += 16, r++) for (let x = (r % 2) * 30; x < w; x += 60) { box(g, x, y, 56, 12, P[3]); box(g, x, y, 56, 2, P[5]); box(g, x + 54, y, 2, 12, P[1]); box(g, x + 2, y + 4, 2, 4, P[2]); box(g, x + 50, y + 4, 2, 4, P[2]); box(g, x + 4, y + 12, 48, 4, P[0]); }
  });
  for (const gx of [wa + 200, wa + 620]) {
    const S = hr('iron', IRON);
    c.fillStyle = INK; c.beginPath(); c.arc(gx, wt + 100, 41, 0, Math.PI * 2); c.fill();
    c.save(); c.translate(gx, wt + 100); c.rotate(state.frame * 0.02);
    for (let k = 0; k < 12; k++) { c.rotate(Math.PI / 6); box(c, -5, -44, 10, 10, INK); box(c, -4, -43, 8, 8, S[3]); box(c, -4, -43, 8, 2, S[5]); }
    c.fillStyle = S[3]; c.beginPath(); c.arc(0, 0, 36, 0, Math.PI * 2); c.fill();
    c.fillStyle = S[2]; c.beginPath(); c.arc(0, 0, 28, 0, Math.PI * 2); c.fill();
    for (let k = 0; k < 6; k++) { c.rotate(Math.PI / 3); box(c, -3, 6, 6, 22, S[4]); }
    c.fillStyle = S[5]; c.beginPath(); c.arc(0, 0, 7, 0, Math.PI * 2); c.fill();
    c.restore();
  }
  // (the deck's lit edge)
  lipAt(c, wa, wt, wb - wa);
};

export const drawYard = (c: Ctx, v: TownView) => {
  // (stickered lumber piles back a step (dimmed: not to stand on), a boom crane)
  for (const [rx, n] of [[10880, 5], [11140, 4]] as const) {
    stillAt(c, v, 0.87, `yard-${rx}`, X(rx), GY, -70, -130, 140, 132, g => {
      const P = back7('#B08A58', 0.06);
      for (let k = 0; k < n; k++) {
        const y = -20 - k * 20, x0 = -60 + k * 8, w = 120 - k * 16;
        box(g, x0 - 1, y - 1, w + 2, 18, INK); box(g, x0, y, w, 16, P[3]);
        for (let bx = x0; bx < x0 + w; bx += 12) { box(g, bx, y, 1, 16, P[1]); box(g, bx + 1, y, 1, 16, P[5]); }
        box(g, x0, y, w, 2, P[4]); box(g, x0 + 4, y + 16, 6, 4, back7('#5A3A1E', 0.06)[3]); box(g, x0 + w - 10, y + 16, 6, 4, back7('#5A3A1E', 0.06)[3]);
      }
    });
  }
  stillAt(c, v, 0.84, 'yard-crane', X(11010), GY, -90, -300, 180, 302, g => {
    const T = back7(TIMBER[4], 0.06), S = back7(STEEL[3], 0.06);
    box(g, -6, -280, 12, 280, INK); box(g, -5, -280, 10, 280, T[3]); box(g, -5, -280, 3, 280, T[5]);
    g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(0, -270); g.lineTo(84, -200); g.stroke(); g.strokeStyle = T[3]; g.lineWidth = 4; g.stroke();
    g.strokeStyle = S[2]; g.lineWidth = 1; g.beginPath(); g.moveTo(0, -280); g.lineTo(84, -200); g.moveTo(80, -202); g.lineTo(80, -110); g.stroke();
    box(g, 70, -112, 20, 6, S[3]); box(g, -30, -40, 60, 40, INK); box(g, -29, -39, 58, 39, back7(WEATHER[3], 0.06)[3]);
  });
};

void mix; void poly; void seen; void at; void timeOfDay; void clapboard; void door; void flame; void PLY; void BLACK; void SAWDUST; void FRONT_D; void lampsOn;
