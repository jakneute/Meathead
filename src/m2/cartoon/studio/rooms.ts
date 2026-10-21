// The studio's rooms, painted (the SNES pass): each room's back wall (still: stamped at the back wall's depth, D_BACK)
// and the tableau in front of it (still: stamped at D_PROPS; what moves drawn live over it), a 1994 studio at its
// most specific: fake-wood paneling, drop ceilings, CRTs, fax machines, light tables, cels and model sheets pinned up,
// awards, motivational posters. No empty wall: every stretch of every room has something particular on it. Dim, it
// all reads by its silhouettes (inked, big shapes against the wall); lit, by its detail. The signs: each room's
// placard on its brass stand, the lobby's marquee on chains, the park's banner over the night shift, the show's promo
// board on its truss, all in the park's lettering.
//
// Everything here is in world coordinates (x from the section's start via X(), heights up from the ground via Y()),
// pushed back to its depth by art.ts.

import { timeOfDay, skyRamp, farTint } from '../../timeOfDay';
import { signW } from '../../signLetters';
import { stamp } from '../../../m1/game/render/stamp';
import { part, px, ball, flat, limb, INK as SINK } from '../../spooky/costume';
import { toonLetters } from '../kit';
import {
  box, mix, hash, INK, checker, type Ctx, slab, bands, footShadow, PRINT, MARKER, txt, paneling, rail, baseboard, cinder,
  memphis, eggCrate, drape, swag, crt, colorBars, fax, deskPhone, cooler, fileCab, ficus, wallClock, motivator, pinned,
  pictureLight, gilt, shelf, tubeLamp, tapes, wires, R6,
  PANEL, WALNUT, CORK, BEIGE, PAPER, STEEL, CHARCOAL, TEAL, PURPLE, VELVET, GOLD, CHROME, GREENWALL, CREAMWALL, FOAM,
  BLACKOUT, NAVYWALL, SLATE, BLUEPLAS, REDPLAS,
} from './paint';
import { sitter, behind, socks, chelsea, paintDaveStill, paintStar, ASIAN_SKIN, ASIAN_HAIR } from './people';
import { CEIL, X, Y, type Room, type RoomId } from './layout';
import { WALL_EXTRAS, PROP_EXTRAS } from './clutter';
import { grossSocks, grossChelsea, grossBack } from './gross';
import { GY } from '../geometry';

/** The park's letters (fat, bouncing). */
export const park = (cell = 2, fill?: string[]) => toonLetters(cell, fill);
const WALL_TOP = CEIL + 26;

// ---------------------------------------------------------------------------------------------------------------
// The shells' looks (art.ts draws the ceilings, floors and partitions going back in these)

export interface Shell { wall: string[]; floor: string[]; ceil: string[]; trim: string[]; floorKind: 'carpet' | 'lino' | 'parquet' | 'rubber' | 'concrete' | 'red' }
export const SHELLS: Record<string, Shell> = {
  lobby: { wall: PURPLE, floor: TEAL, ceil: R6('#3A2458'), trim: GOLD, floorKind: 'carpet' },
  vision: { wall: WALNUT, floor: R6('#6B1F2A'), ceil: R6('#3A2618'), trim: GOLD, floorKind: 'carpet' },
  writers: { wall: CREAMWALL, floor: R6('#5E6A72'), ceil: R6('#C8C2B0'), trim: PANEL, floorKind: 'carpet' },
  storyboards: { wall: R6('#9C8A6A'), floor: R6('#6E6458'), ceil: R6('#C8C2B0'), trim: PANEL, floorKind: 'lino' },
  voice: { wall: FOAM, floor: R6('#3A3D48'), ceil: R6('#2E3038'), trim: SLATE, floorKind: 'rubber' },
  models: { wall: R6('#D8D4C8'), floor: R6('#8C8578'), ceil: R6('#CCC6B8'), trim: R6('#9E978A'), floorKind: 'lino' },
  overseas: { wall: GREENWALL, floor: R6('#6E7266'), ceil: R6('#B9BBAE'), trim: GREENWALL, floorKind: 'lino' },
  inkpaint: { wall: R6('#AFC3CF'), floor: R6('#79858C'), ceil: R6('#C3CED4'), trim: R6('#7F96A3'), floorKind: 'concrete' },
  camera: { wall: BLACKOUT, floor: R6('#26262E'), ceil: R6('#141419'), trim: CHARCOAL, floorKind: 'rubber' },
  premiere: { wall: NAVYWALL, floor: R6('#8E1B26'), ceil: R6('#141B3A'), trim: GOLD, floorKind: 'red' },
};

/** The wall's top under the drop ceiling: the ceiling's T-bar angle and a shadow line. */
const wallTop = (g: Ctx, a: number, b: number, R: string[]) => {
  box(g, a, CEIL, b - a, 26, R[0]); checker(g, a, CEIL + 22, b - a, 4, R[1], 0, 1);
  box(g, a, CEIL + 24, b - a, 3, INK); box(g, a, CEIL + 25, b - a, 1, '#D8D4CC');
};

// ---------------------------------------------------------------------------------------------------------------
// 0. The lobby

/** Sillyville Square through the lobby's glass doors (x, y the doors' top left, w across both, h tall), by the hour:
 *  the land's water tower up over the square (its pink tank, the face, the beanie), a striped onion dome and a floppy
 *  cone in their ramps, a Truffula tuft and puff trees, the candy cobbles banded toward the doors. */
const squareView = (g: Ctx, x: number, y: number, w: number, h: number, tod: ReturnType<typeof timeOfDay>) => {
  const T = (c: string) => farTint(c, 0.32, tod), R3 = (c: string) => [T(mix(c, INK, 0.3)), T(c), T(mix(c, '#FFFFFF', 0.35))];
  const foot = y + h - 40;
  // (THE WATER TOWER far off up on its hill: bandy lilac legs, the pink tank, its face, the beanie)
  { const tx = x + 132, ty = y + 70, L = R3('#B8A4DC'), P = R3('#F49AC8');
    for (const s of [-1, 1]) { box(g, tx + s * 9 - 1, ty + 18, 3, 40, L[1]); box(g, tx + s * 9 - 1, ty + 18, 1, 40, L[2]); }
    for (let k = 0; k < 3; k++) { g.strokeStyle = L[0]; g.lineWidth = 1; g.beginPath(); g.moveTo(tx - 9, ty + 22 + k * 12); g.lineTo(tx + 9, ty + 32 + k * 12); g.stroke(); }
    box(g, tx - 15, ty - 2, 30, 24, T(INK)); box(g, tx - 14, ty - 1, 28, 22, P[1]); box(g, tx - 14, ty - 1, 6, 22, P[2]); box(g, tx + 8, ty - 1, 6, 22, P[0]);
    box(g, tx - 14, ty + 14, 28, 4, T('#7C3AED')); box(g, tx - 14, ty + 14, 28, 1, T('#F2C84A'));
    for (const s of [-1, 1]) { box(g, tx + s * 5 - 3, ty + 3, 6, 6, T('#FFFFFF')); box(g, tx + s * 5 - 1, ty + 5, 2, 3, T(INK)); }
    box(g, tx - 3, ty + 10, 6, 3, T('#FFFFFF')); box(g, tx, ty + 10, 1, 3, T('#C8C4D8'));
    const B = ['#EF4444', '#FDE047', '#22C55E', '#3B82F6'];
    for (let k = 0; k < 4; k++) { g.fillStyle = T(B[k]); g.beginPath(); g.moveTo(tx, ty - 14); g.lineTo(tx - 15 + k * 7.5, ty - 2); g.lineTo(tx - 7.5 + k * 7.5, ty - 2); g.closePath(); g.fill(); }
    box(g, tx - 1, ty - 18, 2, 4, T(INK)); box(g, tx - 7, ty - 19, 14, 2, T('#E2E8F0')); }
  // (the domes: a pink-and-cream striped onion, a floppy blue cone drooping over)
  { const ox = x + 46, oy = foot - 60;
    g.save(); g.beginPath(); g.moveTo(ox - 34, foot); g.lineTo(ox - 34, oy); g.bezierCurveTo(ox - 44, oy - 30, ox - 6, oy - 36, ox, oy - 64); g.bezierCurveTo(ox + 6, oy - 36, ox + 44, oy - 30, ox + 34, oy); g.lineTo(ox + 34, foot); g.closePath(); g.clip();
    for (let k = -40; k < 40; k += 10) { box(g, ox + k, oy - 70, 5, 140, T('#F472B6')); box(g, ox + k + 5, oy - 70, 5, 140, T('#FFF1F7')); }
    box(g, ox + 14, oy - 70, 26, 140, 'rgba(40,16,48,0.16)'); box(g, ox - 34, oy - 70, 6, 140, 'rgba(255,255,255,0.18)'); g.restore();
    box(g, ox - 36, oy, 72, 4, T('#F2C84A')); box(g, ox - 1, oy - 72, 2, 9, T('#5A4A6A')); box(g, ox + 1, oy - 72, 7, 4, T('#5EC4F4'));
    const C = R3('#4A7AE0'), cx2 = x + 112, cy2 = foot - 48;
    g.fillStyle = C[1]; g.beginPath(); g.moveTo(cx2 - 26, foot); g.lineTo(cx2 - 22, cy2); g.quadraticCurveTo(cx2 - 4, cy2 - 70, cx2 + 30, cy2 - 54); g.quadraticCurveTo(cx2 + 4, cy2 - 40, cx2 + 22, cy2); g.lineTo(cx2 + 26, foot); g.closePath(); g.fill();
    g.fillStyle = C[2]; g.beginPath(); g.moveTo(cx2 - 22, cy2); g.quadraticCurveTo(cx2 - 4, cy2 - 70, cx2 + 30, cy2 - 54); g.quadraticCurveTo(cx2 - 8, cy2 - 52, cx2 - 12, cy2); g.closePath(); g.fill();
    for (let k = 0; k < 3; k++) box(g, cx2 - 22 + k * 2, cy2 + 6 + k * 14, 44 - k * 4, 3, T('#FDE047'));
    box(g, cx2 - 24, cy2, 48, foot - cy2, T('#FCEBB0')); box(g, cx2 + 14, cy2, 10, foot - cy2, T('#E8D090'));
    for (let k = 0; k < 2; k++) { box(g, cx2 - 14 + k * 18, cy2 + 10, 8, 10, T(INK)); box(g, cx2 - 13 + k * 18, cy2 + 11, 6, 8, tod.lamps > 0.3 ? '#FFE08A' : T('#7AA6D8')); } }
  // (a Truffula tuft and puff trees)
  { const fx = x + 86; for (let yy = 0; yy < 70; yy += 3) box(g, fx + Math.sin(yy * 0.06) * 3, foot - yy, 3, 3, (yy / 3) % 3 ? T('#F4ECD8') : T('#2A2638'));
    const Tf = R3('#FDE047'); for (const [dx, dy, r, c] of [[0, -76, 12, 0], [-2, -78, 9, 1], [-5, -81, 4, 2]] as const) { g.fillStyle = Tf[c]; g.beginPath(); g.arc(fx + dx, foot + dy, r, 0, Math.PI * 2); g.fill(); }
    const Pf = R3('#34D399'); for (const tx of [x + 12, x + 162]) { box(g, tx - 1, foot - 40, 3, 40, T('#6A4A3A')); for (const [dx, dy, r, c] of [[0, -48, 14, 0], [-2, -50, 11, 1], [-6, -54, 4, 2]] as const) { g.fillStyle = Pf[c]; g.beginPath(); g.arc(tx + dx, foot + dy, r, 0, Math.PI * 2); g.fill(); } } }
  // (the candy cobbles: rows banded toward the doors, the joints dithered)
  const COB = ['#FAD27A', '#F9A8D4', '#A7F3D0', '#C4B5FD', '#FDBA74'];
  for (let r = 0; r < 5; r++) { const ry = foot + r * 8, rh = 8; for (let k = 0; k * 14 < w + 14; k++) { const cx = x + k * 14 - (r % 2) * 7; box(g, cx, ry, 13, rh - 1, T(COB[(k + r * 2) % 5])); box(g, cx, ry, 13, 1, T(mix(COB[(k + r * 2) % 5], '#FFFFFF', 0.4))); } box(g, x, ry + rh - 1, w, 1, T('#B88A6A')); }
  box(g, x, foot - 2, w, 3, T('#E2465E')); checker(g, x, foot - 2, w, 3, T('#FFFFFF'), 0, 4);
};

const paintLobby = (g: Ctx, r: Room) => {
  const a = X(r.a), b = X(r.b);
  memphis(g, a, WALL_TOP, b - a, GY - 130 - WALL_TOP, 11);
  wallTop(g, a, b, PURPLE);
  // (teal wainscot under a chrome rail)
  bands(g, a, GY - 130, b - a, 116, [TEAL[2], TEAL[3], TEAL[3], TEAL[2]]);
  for (let x = a; x < b; x += 40) { box(g, x, GY - 126, 1, 112, TEAL[1]); box(g, x + 1, GY - 126, 1, 112, TEAL[4]); }
  rail(g, a, GY - 134, b - a, CHROME);
  baseboard(g, a, GY - 14, b - a, 14, CHARCOAL);
  // (the front doors, out to the square: the square's sky by the hour through the glass, a puff tree, the candy path)
  const dx = X(40), tod = timeOfDay();
  slab(g, dx - 10, GY - 262, 200, 262, CHROME);
  for (const k of [0, 1]) {
    const gx = dx + k * 92, gy = GY - 250, gw = 84, gh = 244;
    bands(g, gx, gy, gw, gh, skyRamp(['#5AA6E8', '#86C4F0', '#B6DCF6', '#E2F2FA'], tod));
    // (Sillyville Square out there, one picture across both doors: the water tower up over it, the domes, the trees, the
    //  candy cobbles)
    g.save(); g.beginPath(); g.rect(gx, gy, gw, gh); g.clip(); squareView(g, dx, gy, 176, gh, tod); g.restore();
    // (the glass: a tint, two glints, the frame, the push bar)
    g.fillStyle = 'rgba(160,200,240,0.22)'; g.fillRect(gx, gy, gw, gh);
    box(g, gx + 8, gy + 6, 14, gh - 12, 'rgba(255,255,255,0.22)'); box(g, gx + 26, gy + 6, 4, gh - 12, 'rgba(255,255,255,0.16)');
    box(g, gx - 2, gy - 2, gw + 4, 3, CHROME[4]); box(g, gx - 2, gy + gh - 1, gw + 4, 3, CHROME[1]);
    slab(g, gx + 6, GY - 128, gw - 12, 7, CHROME);
    box(g, gx + 2, gy + 30, gw - 4, 12, INK); box(g, gx + 3, gy + 31, gw - 6, 10, '#FFFFFF'); txt(g, k ? 'PULL' : 'PUSH', gx + gw / 2, gy + 39, PRINT('#B91C1C'));
  }
  box(g, dx + 86, GY - 262, 8, 262, CHROME[2]); box(g, dx + 86, GY - 262, 2, 262, CHROME[4]);
  // (EXIT over them, lit, in its box)
  slab(g, dx + 34, GY - 300, 112, 30, REDPLAS);
  box(g, dx + 38, GY - 296, 104, 22, '#5A0A0A'); txt(g, 'EXIT', dx + 90, GY - 278, park(2, ['#FFFFFF', '#FECACA', '#FCA5A5', '#F87171']));
  txt(g, 'TO SILLYVILLE SQUARE', dx + 90, GY - 306, PRINT('#FDE68A'));
  // (the posters, in chrome snap frames: MEET DAVE (a visionary), THIS FALL (something wacky), the rules)
  const frame = (x: number, y: number, w: number, h: number, bg: string[]) => { slab(g, x - 6, y - 6, w + 12, h + 12, CHROME); bands(g, x, y, w, h, bg); };
  frame(X(290), GY - 340, 120, 170, ['#0A1030', '#141C48', '#1E2A60']);
  g.save(); g.beginPath(); g.rect(X(290), GY - 340, 120, 170); g.clip();
  for (let i = 0; i < 9; i++) { const ang = -Math.PI / 2 + (i - 4) * 0.22; g.fillStyle = 'rgba(253,224,71,0.18)'; g.beginPath(); g.moveTo(X(350), GY - 270); g.lineTo(X(350) + Math.cos(ang - 0.06) * 120, GY - 270 + Math.sin(ang - 0.06) * 120); g.lineTo(X(350) + Math.cos(ang + 0.06) * 120, GY - 270 + Math.sin(ang + 0.06) * 120); g.closePath(); g.fill(); }
  g.restore();
  part(g, () => { g.moveTo(X(316), GY - 172); g.quadraticCurveTo(X(350), GY - 236, X(384), GY - 172); g.closePath(); }, '#141414', X(316), GY - 236, 68, 64, 1.2);
  ball(g, X(350), GY - 262, 22, '#F0C8A2', 1.4);
  part(g, () => g.ellipse(X(350), GY - 280, 22, 9, 0, Math.PI, 0), '#5B4636', X(328), GY - 289, 44, 10, 1);
  part(g, () => g.ellipse(X(328), GY - 262, 5, 14, 0.3, 0, Math.PI * 2), '#5B4636', X(323), GY - 276, 10, 28, 1);
  for (const ex of [341, 359]) { g.strokeStyle = SINK; g.lineWidth = 2; g.beginPath(); g.arc(X(ex), GY - 264, 6, 0, Math.PI * 2); g.stroke(); px(g, X(ex) - 1, GY - 265, 3, 3, '#1A1A1A'); }
  part(g, () => { g.moveTo(X(343), GY - 248); g.quadraticCurveTo(X(350), GY - 234, X(357), GY - 248); g.closePath(); }, '#5B4636', X(343), GY - 248, 14, 14, 1);
  txt(g, 'MEET DAVE', X(350), GY - 192, park(1)); txt(g, 'A VISIONARY', X(350), GY - 180, PRINT('#FFFFFF'));
  frame(X(460), GY - 340, 120, 170, ['#08080C', '#101018', '#181826']);
  part(g, () => { g.arc(X(520), GY - 262, 30, 0, Math.PI * 2); }, '#18181E', X(490), GY - 292, 60, 60, 1.2);
  flat(g, () => { g.moveTo(X(498), GY - 280); g.lineTo(X(494), GY - 312); g.lineTo(X(512), GY - 288); g.closePath(); g.moveTo(X(542), GY - 280); g.lineTo(X(546), GY - 312); g.lineTo(X(528), GY - 288); g.closePath(); }, '#18181E', 1);
  for (const ex of [508, 532]) { g.fillStyle = '#FDE047'; g.beginPath(); g.ellipse(X(ex), GY - 266, 6, 4, 0, 0, Math.PI * 2); g.fill(); box(g, X(ex) - 1, GY - 269, 2, 6, INK); }
  g.strokeStyle = '#F6F4EC'; g.lineWidth = 2; g.beginPath(); g.arc(X(520), GY - 250, 9, 0.2, Math.PI - 0.2); g.stroke();
  txt(g, 'THIS FALL...', X(520), GY - 192, park(1, ['#FFFFFF', '#FCE7F3', '#F9A8D4', '#EC4899'])); txt(g, 'SOMETHING WACKY', X(520), GY - 180, PRINT('#FFFFFF'));
  slab(g, X(612), GY - 330, 104, 70, PAPER);
  txt(g, 'PLEASE:', X(664), GY - 316, PRINT('#1E3A8A')); txt(g, 'NO FLASH', X(664), GY - 302, PRINT('#B91C1C')); txt(g, 'NO FOOD', X(664), GY - 290, PRINT('#B91C1C')); txt(g, 'NO TOUCHING', X(664), GY - 278, PRINT('#B91C1C'));
  // (the TV bank on its bracket up by the ceiling: the show's logo, color bars, the narrator's tour tape)
  const tv = (x: number, scr: (g: Ctx, sx: number, sy: number, sw: number, sh: number) => void) => crt(g, x, CEIL + 52, 56, scr, CHARCOAL);
  slab(g, X(600), CEIL + 34, 200, 12, STEEL); wires(g, [X(620), X(780)], WALL_TOP, CEIL + 34);
  tv(X(604), colorBars);
  tv(X(668), (q, sx, sy, sw, sh) => { bands(q, sx, sy, sw, sh, ['#7DD3FC', '#BAE6FD']); socks(q, sx + sw / 2, sy + sh - 2, 0.42, 0); });
  tv(X(732), (q, sx, sy, sw, sh) => { bands(q, sx, sy, sw, sh, ['#4C1D95', '#6D28D9']); txt(q, 'TOUR', sx + sw / 2, sy + 14, PRINT('#FDE047')); txt(q, 'NEXT:', sx + sw / 2, sy + 24, PRINT('#FFFFFF')); txt(q, 'NOW', sx + sw / 2, sy + 34, PRINT('#86EFAC')); });
  wallClock(g, X(560), CEIL + 90, 18, 10, 25);
  txt(g, 'BURBANK', X(560), CEIL + 122, PRINT('#FDE68A'));
};
const paintLobbyProps = (g: Ctx) => {
  // (the ticket podium: laminate, a CRT, a ticket roll, a bell)
  slab(g, X(226), GY - 112, 78, 112, PURPLE); for (let i = 0; i < 3; i++) box(g, X(232), GY - 96 + i * 30, 66, 2, PURPLE[1]);
  slab(g, X(218), GY - 124, 94, 14, TEAL);
  crt(g, X(232), GY - 166, 40, (q, sx, sy, sw, sh) => { box(q, sx, sy, sw, sh, '#0A2A12'); for (let l = 0; l < 4; l++) box(q, sx + 2, sy + 3 + l * 5, sw - 6 - (l * 7) % 12, 2, '#5CF06A'); }, BEIGE);
  slab(g, X(282), GY - 138, 16, 14, PAPER); ball(g, X(296), GY - 128, 4, CHROME[4], 1);
  txt(g, 'TOURS', X(265), GY - 72, park(1));
  footShadow(g, X(222), GY, 90);
  // (the queue's chrome stanchions and their velvet ropes)
  for (let i = 0; i < 5; i++) {
    const x = X(330 + i * 95);
    box(g, x - 4, GY - 74, 8, 74, INK); box(g, x - 3, GY - 73, 6, 72, CHROME[3]); box(g, x - 3, GY - 73, 2, 72, CHROME[5]); box(g, x + 1, GY - 73, 2, 72, CHROME[1]);
    ball(g, x, GY - 76, 5, CHROME[4], 1); part(g, () => g.ellipse(x, GY - 2, 12, 3, 0, 0, Math.PI * 2), CHROME[3], x - 12, GY - 5, 24, 6, 1);
    if (i < 4) { g.strokeStyle = SINK; g.lineWidth = 6; g.beginPath(); g.moveTo(x, GY - 64); g.quadraticCurveTo(x + 47, GY - 40, x + 95, GY - 64); g.stroke(); g.strokeStyle = VELVET[3]; g.lineWidth = 4; g.stroke(); g.strokeStyle = VELVET[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 6, GY - 63); g.quadraticCurveTo(x + 47, GY - 42, x + 89, GY - 63); g.stroke(); }
  }
  // (the brochure rack; a trash can, THANK YOU; the ficus by the corner)
  slab(g, X(150), GY - 110, 50, 110, CHROME);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { const bx = X(154 + j * 23), by = GY - 104 + i * 34; box(g, bx, by, 19, 26, INK); box(g, bx + 1, by + 1, 17, 24, ['#F472B6', '#38BDF8', '#FDE047', '#86EFAC', '#C084FC', '#FB923C'][i * 2 + j]); box(g, bx + 3, by + 4, 13, 2, '#FFFFFF'); box(g, bx + 1, by + 20, 17, 5, CHROME[2]); }
  slab(g, X(712), GY - 48, 30, 48, TEAL); slab(g, X(708), GY - 54, 38, 8, TEAL); txt(g, 'THANK', X(727), GY - 30, PRINT('#FFFFFF')); txt(g, 'YOU', X(727), GY - 20, PRINT('#FFFFFF'));
  ficus(g, X(770), GY, 92, 3);
};

// ---------------------------------------------------------------------------------------------------------------
// 1. The Vision (Dave's office as a shrine)

const paintVision = (g: Ctx, r: Room) => {
  const a = X(r.a), b = X(r.b);
  // (real walnut, raised panels, a crown moulding, a dado)
  box(g, a, WALL_TOP, b - a, GY - WALL_TOP, WALNUT[2]);
  for (let x = a + 16; x < b - 40; x += 92) {
    slab(g, x, WALL_TOP + 30, 76, GY - WALL_TOP - 160, WALNUT); box(g, x + 6, WALL_TOP + 36, 64, GY - WALL_TOP - 172, WALNUT[2]);
    paneling(g, x + 8, WALL_TOP + 38, 60, GY - WALL_TOP - 176, WALNUT, x, 12);
    slab(g, x, GY - 118, 76, 96, WALNUT); box(g, x + 8, GY - 110, 60, 80, WALNUT[2]);
  }
  rail(g, a, WALL_TOP + 6, b - a, GOLD); rail(g, a, GY - 128, b - a, WALNUT);
  wallTop(g, a, b, WALNUT);
  baseboard(g, a, GY - 18, b - a, 18, WALNUT);
  // (THE PORTRAIT: Dave in oils, arms crossed, smug, a gilt frame, a picture light, the brass plate)
  const px0 = X(980), py0 = CEIL + 90;
  gilt(g, px0, py0, 200, 250);
  bands(g, px0, py0, 200, 250, ['#141A30', '#1E2646', '#2A3458', '#3A4466']);
  // (the painter's sky behind him: a brushy glow)
  g.fillStyle = 'rgba(242,200,74,0.18)'; g.beginPath(); g.ellipse(px0 + 100, py0 + 110, 80, 90, 0, 0, Math.PI * 2); g.fill();
  part(g, () => { g.moveTo(px0 + 24, py0 + 250); g.quadraticCurveTo(px0 + 100, py0 + 120, px0 + 176, py0 + 250); g.closePath(); }, '#141414', px0 + 24, py0 + 120, 152, 130, 1.4);
  part(g, () => g.roundRect(px0 + 82, py0 + 138, 36, 16, 5), '#1E1E1E', px0 + 82, py0 + 138, 36, 16, 1);
  ball(g, px0 + 100, py0 + 102, 42, '#F0C8A2', 1.6);
  part(g, () => g.ellipse(px0 + 100, py0 + 70, 44, 18, 0, Math.PI, 0), '#5B4636', px0 + 56, py0 + 52, 88, 18, 1.4);
  part(g, () => g.ellipse(px0 + 56, py0 + 104, 9, 26, 0.3, 0, Math.PI * 2), '#5B4636', px0 + 47, py0 + 78, 18, 52, 1.2);
  for (const ex of [84, 116]) { g.strokeStyle = SINK; g.lineWidth = 3; g.beginPath(); g.arc(px0 + ex, py0 + 100, 10, 0, Math.PI * 2); g.stroke(); px(g, px0 + ex - 2, py0 + 99, 4, 4, '#1A1A1A'); px(g, px0 + ex - 5, py0 + 95, 3, 2, 'rgba(255,255,255,0.7)'); }
  flat(g, () => { g.moveTo(px0 + 72, py0 + 86); g.lineTo(px0 + 92, py0 + 90); }, '#3A2A1A', 2); flat(g, () => { g.moveTo(px0 + 108, py0 + 90); g.lineTo(px0 + 128, py0 + 84); }, '#3A2A1A', 2);
  px(g, px0 + 95, py0 + 110, 10, 4, '#C4936A');
  part(g, () => { g.moveTo(px0 + 86, py0 + 126); g.quadraticCurveTo(px0 + 100, py0 + 152, px0 + 114, py0 + 126); g.closePath(); }, '#5B4636', px0 + 86, py0 + 126, 28, 26, 1);
  g.strokeStyle = SINK; g.lineWidth = 2; g.beginPath(); g.moveTo(px0 + 88, py0 + 120); g.quadraticCurveTo(px0 + 104, py0 + 127, px0 + 116, py0 + 115); g.stroke();
  limb(g, px0 + 46, py0 + 200, px0 + 154, py0 + 206, 24, '#1F1F1F'); limb(g, px0 + 154, py0 + 194, px0 + 46, py0 + 210, 22, '#262626');
  ball(g, px0 + 52, py0 + 206, 7, '#F0C8A2', 1); ball(g, px0 + 148, py0 + 198, 7, '#F0C8A2', 1);
  // (the varnish's sheen, and the brushwork's dabs)
  for (let i = 0; i < 40; i++) { const t = hash(i * 3.3), u = hash(i * 7.1); px(g, px0 + 6 + t * 188, py0 + 6 + u * 120, 2, 1, 'rgba(255,255,255,0.12)'); }
  pictureLight(g, px0 + 100, py0 - 10, 90);
  slab(g, px0 + 40, py0 + 272, 120, 22, GOLD);
  txt(g, 'DAVE. VISIONARY.', px0 + 100, py0 + 287, PRINT('#3B2A10'));
  // (THE GOLDEN DOODLE AWARDS: a lit walnut cabinet behind glass, three shelves of gold pencils and plaques)
  const cx0 = X(1430), cw = 300;
  slab(g, cx0 - 8, CEIL + 96, cw + 16, 300, WALNUT); box(g, cx0, CEIL + 104, cw, 284, '#2A1608');
  bands(g, cx0, CEIL + 104, cw, 284, ['#3A2410', '#2A1608', '#1E1006']);
  for (let k = 0; k < 3; k++) {
    const sy = CEIL + 170 + k * 90;
    shelf(g, cx0, sy, cw, GOLD);
    for (let i = 0; i < 6; i++) {
      const tx = cx0 + 22 + i * 46, kind = (i + k) % 3;
      if (kind === 2) { slab(g, tx - 12, sy - 36, 26, 36, WALNUT); slab(g, tx - 8, sy - 32, 18, 14, GOLD); px(g, tx - 6, sy - 14, 14, 2, GOLD[2]); }
      else {
        slab(g, tx - 8, sy - 10, 16, 10, CHARCOAL);
        part(g, () => { g.moveTo(tx - 3, sy - 10); g.lineTo(tx + 3, sy - 10); g.lineTo(tx + 3, sy - 42); g.lineTo(tx, sy - 50); g.lineTo(tx - 3, sy - 42); g.closePath(); }, '#E5B53A', tx - 3, sy - 50, 6, 40, 1);
        px(g, tx - 3, sy - 44, 6, 2, GOLD[1]); px(g, tx - 1, sy - 50, 2, 3, CHARCOAL[1]);
      }
    }
  }
  // (the glass over the cabinet: two long glints)
  g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(cx0, CEIL + 104, cw, 284);
  for (let k = 0; k < 2; k++) { g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.moveTo(cx0 + 40 + k * 120, CEIL + 104); g.lineTo(cx0 + 60 + k * 120, CEIL + 104); g.lineTo(cx0 + k * 120 - 40, CEIL + 388); g.lineTo(cx0 + k * 120 - 60, CEIL + 388); g.closePath(); g.fill(); }
  slab(g, cx0 + 60, CEIL + 70, cw - 120, 22, GOLD); txt(g, 'GOLDEN DOODLE AWARDS', cx0 + cw / 2, CEIL + 86, PRINT('#3B2A10'));
  // (the framed quote; a TV GUIDE cover; the VISION poster)
  gilt(g, X(1250), CEIL + 110, 140, 70, '#F5EFDF');
  txt(g, '"I SEE THINGS."', X(1320), CEIL + 142, { sx: 1, sy: 2, fill: '#3B2A10' }); txt(g, '- DAVE', X(1350), CEIL + 168, MARKER('#3B2A10', 3));
  slab(g, X(1256), CEIL + 200, 64, 86, STEEL); box(g, X(1260), CEIL + 204, 56, 78, '#F8FAFC');
  box(g, X(1260), CEIL + 204, 56, 14, '#DC2626'); txt(g, 'TV GUIDE', X(1288), CEIL + 214, PRINT('#FFFFFF'));
  ball(g, X(1288), CEIL + 244, 14, '#F0C8A2', 1); part(g, () => g.ellipse(X(1288), CEIL + 234, 14, 6, 0, Math.PI, 0), '#5B4636', X(1274), CEIL + 228, 28, 6, 1);
  txt(g, 'THE MAN', X(1288), CEIL + 268, PRINT('#111827')); txt(g, 'WHO SEES', X(1288), CEIL + 277, PRINT('#B91C1C'));
  motivator(g, X(1336), CEIL + 200, 64, 'VISION', 'HIS. NOT YOURS.', 'eagle');
  // (the credenza under the portrait: a VCR, a CRT, his tapes)
  slab(g, X(870), GY - 92, 90, 92, WALNUT); box(g, X(876), GY - 86, 36, 76, WALNUT[2]); box(g, X(918), GY - 86, 36, 76, WALNUT[2]);
  tapes(g, X(874), GY - 92, 82, 9);
  slab(g, X(868), GY - 210, 94, 10, WALNUT); tapes(g, X(872), GY - 210, 86, 13);
  txt(g, "DAVE'S FAVORITES", X(915), GY - 190, PRINT('#E5C158'));
};
const paintVisionProps = (g: Ctx) => {
  const nx = X(1220);
  // (THE NAPKIN: on a white marble plinth, under glass, in a gilt frame: a stick cat in ballpoint, a coffee ring)
  slab(g, nx - 40, GY - 120, 80, 120, R6('#E7E5E4')); for (let i = 0; i < 5; i++) { g.strokeStyle = 'rgba(120,120,130,0.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(nx - 36 + i * 14, GY - 116); g.quadraticCurveTo(nx - 30 + i * 16, GY - 70, nx - 34 + i * 15, GY - 6); g.stroke(); }
  slab(g, nx - 48, GY - 132, 96, 12, R6('#F5F5F4'));
  gilt(g, nx - 24, GY - 190, 48, 46, '#FAFAF9');
  for (let k = 0; k < 6; k++) px(g, nx - 24 + k * 8, GY - 190, 1, 46, '#ECEAE4');
  g.strokeStyle = '#1D4ED8'; g.lineWidth = 1.5;
  g.beginPath(); g.arc(nx, GY - 172, 7, 0, Math.PI * 2); g.moveTo(nx - 5, GY - 178); g.lineTo(nx - 7, GY - 184); g.lineTo(nx - 2, GY - 179); g.moveTo(nx + 5, GY - 178); g.lineTo(nx + 7, GY - 184); g.lineTo(nx + 2, GY - 179);
  g.moveTo(nx, GY - 165); g.lineTo(nx, GY - 152); g.moveTo(nx - 8, GY - 160); g.lineTo(nx + 8, GY - 160); g.moveTo(nx, GY - 152); g.lineTo(nx - 5, GY - 146); g.moveTo(nx, GY - 152); g.lineTo(nx + 5, GY - 146); g.stroke();
  g.strokeStyle = 'rgba(146,64,14,0.55)'; g.lineWidth = 2; g.beginPath(); g.arc(nx + 12, GY - 156, 9, 0.3, Math.PI * 1.8); g.stroke();
  g.fillStyle = 'rgba(191,219,254,0.22)'; g.fillRect(nx - 40, GY - 214, 80, 84); box(g, nx - 41, GY - 215, 82, 1, INK); box(g, nx - 41, GY - 215, 1, 84, INK); box(g, nx + 40, GY - 215, 1, 84, INK);
  box(g, nx - 40, GY - 214, 80, 1, 'rgba(255,255,255,0.8)'); px(g, nx - 34, GY - 210, 5, 60, 'rgba(255,255,255,0.4)'); px(g, nx - 26, GY - 210, 2, 60, 'rgba(255,255,255,0.3)');
  slab(g, nx - 30, GY - 84, 60, 20, GOLD);
  txt(g, 'THE NAPKIN', nx, GY - 74, PRINT('#3B2A10')); txt(g, '1993', nx, GY - 66, PRINT('#3B2A10'));
  for (const sx of [-70, 70]) { box(g, nx + sx - 3, GY - 60, 6, 60, INK); box(g, nx + sx - 2, GY - 59, 4, 58, GOLD[3]); box(g, nx + sx - 2, GY - 59, 1, 58, GOLD[5]); ball(g, nx + sx, GY - 62, 4, GOLD[4], 1); }
  g.strokeStyle = SINK; g.lineWidth = 6; g.beginPath(); g.moveTo(nx - 70, GY - 54); g.quadraticCurveTo(nx, GY - 26, nx + 70, GY - 54); g.stroke(); g.strokeStyle = VELVET[3]; g.lineWidth = 4; g.stroke();
  // (a little sign on a stand: INSURED FOR $2,000,000)
  slab(g, nx + 80, GY - 52, 54, 22, PAPER); txt(g, 'INSURED', nx + 107, GY - 42, PRINT('#1E3A8A')); txt(g, '$2,000,000', nx + 107, GY - 34, PRINT('#B91C1C'));
  limb(g, nx + 107, GY - 30, nx + 107, GY, 2, GOLD[3]);
  // (Dave's desk: big, glossy, a Rolodex, a phone, one gold pencil, nothing else)
  const dx = X(1400);
  slab(g, dx, GY - 78, 190, 16, WALNUT); box(g, dx, GY - 78, 190, 2, WALNUT[5]);
  slab(g, dx + 10, GY - 62, 46, 62, WALNUT); slab(g, dx + 136, GY - 62, 46, 62, WALNUT);
  for (let i = 0; i < 3; i++) { box(g, dx + 18, GY - 54 + i * 18, 30, 14, WALNUT[2]); box(g, dx + 28, GY - 48 + i * 18, 10, 2, GOLD[4]); box(g, dx + 144, GY - 54 + i * 18, 30, 14, WALNUT[2]); box(g, dx + 154, GY - 48 + i * 18, 10, 2, GOLD[4]); }
  box(g, dx + 58, GY - 62, 76, 40, WALNUT[0]);
  slab(g, dx + 150, GY - 98, 12, 20, GOLD);
  deskPhone(g, dx + 66, GY - 78, CHARCOAL);
  slab(g, dx + 100, GY - 92, 22, 14, CHARCOAL); for (let i = 0; i < 6; i++) box(g, dx + 102 + i * 3, GY - 100, 2, 9, PAPER[4]);
  paintDaveStill(g, dx, GY);
  footShadow(g, dx - 6, GY, 200);
};

// ---------------------------------------------------------------------------------------------------------------
// 2. The Writers' Room

const paintWriters = (g: Ctx, r: Room) => {
  const a = X(r.a), b = X(r.b);
  box(g, a, WALL_TOP, b - a, GY - WALL_TOP, CREAMWALL[3]);
  checker(g, a, WALL_TOP, b - a, 60, CREAMWALL[2], 0, 2);
  paneling(g, a, GY - 160, b - a, 146, PANEL, 22);
  rail(g, a, GY - 164, b - a, PANEL);
  baseboard(g, a, GY - 14, b - a, 14, PANEL);
  wallTop(g, a, b, CREAMWALL);
  // (water stains off the drop ceiling)
  for (let i = 0; i < 5; i++) { const sx = a + 80 + i * 190; g.fillStyle = 'rgba(150,110,50,0.25)'; g.beginPath(); g.ellipse(sx, WALL_TOP + 6, 20 + (i % 3) * 6, 8, 0, 0, Math.PI); g.fill(); }
  // (the whiteboard of bits)
  const wx = X(1880), wy = CEIL + 120;
  slab(g, wx - 8, wy - 8, 376, 216, CHROME); box(g, wx, wy, 360, 200, '#F8FAFC');
  bands(g, wx, wy, 360, 200, ['#FFFFFF', '#F4F6F8', '#ECEFF2']);
  for (let k = 0; k < 5; k++) { g.fillStyle = 'rgba(120,130,150,0.12)'; g.fillRect(wx + 30 + k * 70, wy + 20 + (k % 2) * 60, 50, 14); }
  const scrawl: [string, number, number, string][] = [
    ['WACKY??', 20, 26, '#1D4ED8'], ['SOCKS = FUNNY?', 20, 52, '#111827'], ['CHELSEA BRACES JOKE', 20, 78, '#B91C1C'],
    ['CATCHPHRASE:', 20, 104, '#111827'], ['"MEOW-VAL OFFICE"', 30, 124, '#1D4ED8'], ['WACKY!!!', 210, 150, '#16A34A'],
    ['PIZZA?', 250, 30, '#B91C1C'], ['ELEVEN WRITERS', 200, 182, '#111827'], ['NO POLITICS', 200, 58, '#111827'],
  ];
  for (const [s, dx, dy, col] of scrawl) txt(g, s, wx + dx, wy + dy, MARKER(col, s.length), 'left');
  g.strokeStyle = '#B91C1C'; g.lineWidth = 2; g.beginPath(); g.moveTo(wx + 18, wy + 46); g.lineTo(wx + 140, wy + 46); g.stroke();
  g.beginPath(); g.moveTo(wx + 196, wy + 54); g.lineTo(wx + 290, wy + 54); g.stroke();
  g.beginPath(); g.ellipse(wx + 240, wy + 145, 56, 16, 0, 0, Math.PI * 2); g.stroke();
  slab(g, wx + 10, wy + 198, 340, 6, CHROME); for (let i = 0; i < 3; i++) slab(g, wx + 30 + i * 14, wy + 193, 10, 4, R6(['#1D4ED8', '#B91C1C', '#111827'][i]));
  slab(g, wx + 300, wy + 192, 24, 6, R6('#F2C230'));
  // (the corkboard: index cards, the season's episodes)
  slab(g, X(2300), CEIL + 140, 220, 160, PANEL); box(g, X(2306), CEIL + 146, 208, 148, CORK[3]); checker(g, X(2306), CEIL + 146, 208, 148, CORK[2], 0, 2);
  for (let i = 0; i < 10; i++) { const cx = X(2312 + (i % 5) * 42), cy = CEIL + 156 + Math.floor(i / 5) * 70; pinned(g, cx, cy, 34, 50, i % 3 ? '#FEF9C3' : '#FFFFFF', ['#DC2626', '#2563EB', '#16A34A'][i % 3], q => { txt(q, `EP ${i + 1}`, cx + 17, cy + 10, PRINT('#1E3A8A')); for (let l = 0; l < 4; l++) px(q, cx + 4, cy + 16 + l * 8, 24 - (l * 5) % 10, 2, '#64748B'); }); }
  // (TEAMWORK; the dartboard (darts nowhere near the middle) and the Nerf hoop over it)
  motivator(g, X(2534), CEIL + 120, 58, 'TEAMWORK', 'MOSTLY DAVE', 'rowers');
  const bx = X(2650), by = CEIL + 230;
  ball(g, bx, by, 36, '#1C1917', 1.4);
  for (let k = 0; k < 20; k++) { const a0 = (k * Math.PI) / 10; g.fillStyle = k % 2 ? '#F5F0E1' : '#18181B'; g.beginPath(); g.moveTo(bx, by); g.arc(bx, by, 28, a0, a0 + Math.PI / 10); g.closePath(); g.fill(); }
  g.strokeStyle = '#DC2626'; g.lineWidth = 3; g.beginPath(); g.arc(bx, by, 26, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(bx, by, 15, 0, Math.PI * 2); g.stroke();
  ball(g, bx, by, 4, '#16A34A', 1);
  for (const [ddx, ddy] of [[44, -34], [-50, 22], [34, 46], [-20, -52]]) { px(g, bx + ddx, by + ddy, 10, 2, '#F2C230'); px(g, bx + ddx + 8, by + ddy - 2, 3, 6, '#DC2626'); }
  slab(g, X(2620), CEIL + 120, 60, 40, PAPER); g.strokeStyle = '#F97316'; g.lineWidth = 2; g.beginPath(); g.ellipse(X(2650), CEIL + 162, 18, 5, 0, 0, Math.PI * 2); g.stroke();
  for (let k = 0; k < 6; k++) { g.strokeStyle = '#F6F4EC'; g.lineWidth = 1; g.beginPath(); g.moveTo(X(2634) + k * 6, CEIL + 164); g.lineTo(X(2638) + k * 5, CEIL + 186); g.stroke(); }
  // (the joke jar on its shelf, one dollar in it)
  shelf(g, X(2560), CEIL + 330, 180, PANEL);
  g.fillStyle = 'rgba(191,219,254,0.5)'; g.fillRect(X(2600), CEIL + 296, 34, 34); box(g, X(2599), CEIL + 295, 36, 1, INK); box(g, X(2599), CEIL + 295, 1, 36, INK); box(g, X(2634), CEIL + 295, 1, 36, INK);
  slab(g, X(2598), CEIL + 290, 38, 6, CHROME); px(g, X(2606), CEIL + 318, 20, 9, '#4D7C0F'); px(g, X(2608), CEIL + 320, 6, 4, '#86C46A');
  txt(g, 'JOKE JAR', X(2617), CEIL + 284, PRINT('#2A1A0E'));
  // (the trophies of the trade: a Nerf gun, a lava lamp, a stack of comics)
  slab(g, X(2660), CEIL + 312, 18, 18, R6('#F97316'));
  g.fillStyle = INK; g.beginPath(); g.roundRect(X(2700), CEIL + 296, 14, 34, 5); g.fill(); g.fillStyle = '#A855F7'; g.beginPath(); g.roundRect(X(2701), CEIL + 300, 12, 26, 5); g.fill(); ball(g, X(2707), CEIL + 310, 4, '#F472B6', 0);
  // (the coat rack, flannel on it)
  limb(g, X(1840), CEIL + 120, X(1840), GY - 4, 3, PANEL[2]); limb(g, X(1828), GY - 2, X(1852), GY - 2, 3, PANEL[2]);
  part(g, () => { g.moveTo(X(1832), CEIL + 130); g.lineTo(X(1850), CEIL + 130); g.lineTo(X(1854), CEIL + 210); g.lineTo(X(1828), CEIL + 210); g.closePath(); }, '#B91C1C', X(1828), CEIL + 130, 26, 80, 1);
  for (let k = 0; k < 6; k++) px(g, X(1830), CEIL + 140 + k * 12, 22, 1, '#1A1A1A');
};
const paintWritersProps = (g: Ctx) => {
  const ty = GY - 70;
  const who: [number, number, Parameters<typeof behind>[2]][] = [
    [2050, 11, { shirt: '#B91C1C', cap: '#1D4ED8', mouth: 'grin', plaid: '#7F1D1D' }], [2160, 23, { shirt: '#14532D', asleep: true }],
    [2270, 7, { shirt: '#1E3A8A', cap: '#B91C1C', mouth: 'talk' }], [2380, 40, { shirt: '#7C2D12', phone: true, mouth: 'smirk', plaid: '#451A03' }],
    [2490, 15, { shirt: '#4B5563', cap: '#111827', mouth: 'grin' }],
  ];
  for (const [rx, seed, o] of who) { g.save(); g.translate(X(rx), ty); behind(g, seed * 13 + 2, o); g.restore(); }
  // (the long table: fake wood, steel legs)
  slab(g, X(1990), ty, 580, 14, PANEL); box(g, X(1990), ty, 580, 2, PANEL[5]);
  for (const lx of [2000, 2552]) slab(g, X(lx), ty + 14, 8, GY - ty - 14, STEEL);
  box(g, X(2008), ty + 14, 544, 40, 'rgba(10,6,20,0.25)');
  // (pizza boxes, a slice gone; soda cans; a legal pad; a QUIET PLEASE tent)
  slab(g, X(2110), ty - 6, 70, 6, R6('#D6B98C'));
  part(g, () => { g.moveTo(X(2116), ty - 7); g.lineTo(X(2172), ty - 7); g.lineTo(X(2160), ty - 16); g.lineTo(X(2128), ty - 16); g.closePath(); }, '#F59E0B', X(2116), ty - 16, 56, 9, 1);
  for (let i = 0; i < 6; i++) ball(g, X(2126 + i * 8), ty - 11, 1.6, '#B91C1C', 0);
  for (let i = 0; i < 4; i++) slab(g, X(2220 + i * 70), ty - 16, 8, 16, R6(['#DC2626', '#16A34A', '#2563EB', '#DC2626'][i]));
  slab(g, X(2300), ty - 3, 30, 3, R6('#FDE68A'));
  slab(g, X(2420), ty - 26, 90, 22, PAPER);
  txt(g, 'QUIET PLEASE', X(2465), ty - 12, PRINT('#B91C1C'));
  // (the TV cart: a CRT, a VCR, a tangle of cables; the mini fridge)
  slab(g, X(2610), GY - 70, 76, 8, STEEL); slab(g, X(2610), GY - 18, 76, 6, STEEL); for (const lx of [2612, 2680]) box(g, X(lx), GY - 62, 3, 56, STEEL[2]);
  slab(g, X(2618), GY - 30, 60, 12, CHARCOAL); box(g, X(2624), GY - 26, 24, 3, INK); box(g, X(2660), GY - 26, 6, 2, '#5CF06A');
  crt(g, X(2616), GY - 124, 64, (q, sx, sy, sw, sh) => { bands(q, sx, sy, sw, sh, ['#1A3A9E', '#2A4AB4']); txt(q, 'PLAY >', sx + sw / 2, sy + sh / 2, PRINT('#FFFFFF')); }, CHARCOAL);
  slab(g, X(2700), GY - 62, 52, 62, PAPER); box(g, X(2700), GY - 40, 52, 1, PAPER[1]); box(g, X(2742), GY - 56, 3, 12, CHROME[2]);
  pinned(g, X(2708), GY - 58, 16, 12, '#FDE68A');
  footShadow(g, X(2604), GY, 152);
};
/** The nerf ball (live), thrown up and caught by the writer on the end; the sleeper's Zs. */
export const drawWritersLive = (c: Ctx, f: number) => {
  const t = (f % 70) / 70, x = X(2490) + 8, y = GY - 120 - Math.sin(t * Math.PI) * 60;
  ball(c, x, y, 5, '#F97316', 1); px(c, x - 2, y - 2, 2, 2, '#FDBA74');
  for (let i = 0; i < 3; i++) { const u = ((f + i * 40) % 120) / 120; c.globalAlpha = 1 - u; c.fillStyle = '#F6F4EC'; c.fillRect(X(2160) + u * 14 + i * 2, GY - 92 - u * 30, 5, 1); c.fillRect(X(2160) + u * 14 + i * 2, GY - 88 - u * 30, 5, 1); c.fillRect(X(2162) + u * 14 + i * 2, GY - 90 - u * 30, 1, 2); }
  c.globalAlpha = 1;
};

// ---------------------------------------------------------------------------------------------------------------
// 3. Storyboards

const STORY_SCENES = ['SC 1', 'PAN', 'ZOOM', 'CUT', 'WACKY', 'SC 2'];
const panel = (g: Ctx, cx: number, cy: number, k: number) => {
  pinned(g, cx, cy, 64, 46, PAPER[4], ['#DC2626', '#2563EB', '#16A34A'][k % 3], q => {
    q.strokeStyle = '#334155'; q.lineWidth = 1.2; q.beginPath();
    if (k === 0) { q.arc(cx + 32, cy + 16, 6, 0, Math.PI * 2); q.moveTo(cx + 32, cy + 22); q.lineTo(cx + 32, cy + 34); q.moveTo(cx + 24, cy + 28); q.lineTo(cx + 40, cy + 28); q.moveTo(cx + 32, cy + 34); q.lineTo(cx + 26, cy + 42); q.moveTo(cx + 32, cy + 34); q.lineTo(cx + 38, cy + 42); }
    else if (k === 1) { q.arc(cx + 32, cy + 24, 11, 0, Math.PI * 2); q.moveTo(cx + 24, cy + 16); q.lineTo(cx + 22, cy + 6); q.lineTo(cx + 29, cy + 13); q.moveTo(cx + 40, cy + 16); q.lineTo(cx + 42, cy + 6); q.lineTo(cx + 35, cy + 13); }
    else if (k === 2) { q.moveTo(cx + 10, cy + 40); q.lineTo(cx + 54, cy + 40); q.moveTo(cx + 14, cy + 20); q.lineTo(cx + 32, cy + 10); q.lineTo(cx + 50, cy + 20); for (let p = 0; p < 4; p++) { q.moveTo(cx + 18 + p * 9, cy + 22); q.lineTo(cx + 18 + p * 9, cy + 40); } }
    else if (k === 3) { q.moveTo(cx + 10, cy + 23); q.lineTo(cx + 50, cy + 23); q.lineTo(cx + 42, cy + 15); q.moveTo(cx + 50, cy + 23); q.lineTo(cx + 42, cy + 31); }
    else if (k === 4) { q.rect(cx + 12, cy + 10, 40, 26); q.moveTo(cx + 12, cy + 10); q.lineTo(cx + 52, cy + 36); }
    else { q.arc(cx + 22, cy + 24, 6, 0, Math.PI * 2); q.arc(cx + 44, cy + 24, 6, 0, Math.PI * 2); }
    q.stroke();
    if (k === 1 || k === 4) { q.fillStyle = 'rgba(100,116,139,0.25)'; q.fillRect(cx + 4, cy + 30, 56, 12); }
  });
  txt(g, STORY_SCENES[k], cx + 32, cy + 56, PRINT('#2A1A0E'));
};
const paintStoryboards = (g: Ctx, r: Room) => {
  const a = X(r.a), b = X(r.b);
  box(g, a, WALL_TOP, b - a, GY - WALL_TOP, R6('#9C8A6A')[3]);
  paneling(g, a, GY - 70, b - a, 56, PANEL, 33);
  rail(g, a, GY - 74, b - a, PANEL);
  baseboard(g, a, GY - 14, b - a, 14, PANEL);
  wallTop(g, a, b, R6('#9C8A6A'));
  // (two long corkboards in oak frames, wall to wall, the whole episode pinned up in order; red yarn for the gags)
  for (const [x0, x1] of [[a + 24, a + 504], [a + 524, b - 24]] as [number, number][]) {
    slab(g, x0 - 8, CEIL + 62, x1 - x0 + 16, 346, PANEL); box(g, x0, CEIL + 70, x1 - x0, 330, CORK[3]); checker(g, x0, CEIL + 70, x1 - x0, 330, CORK[2], 0, 2); checker(g, x0, CEIL + 70, x1 - x0, 330, CORK[4], 1, 4);
    box(g, x0, CEIL + 70, x1 - x0, 3, CORK[1]);
  }
  for (let row = 0; row < 4; row++) for (let i = 0; i < 12; i++) {
    const cx = a + 40 + i * 78 + (i >= 6 ? 30 : 0), cy = CEIL + 98 + row * 76;
    if (cx > b - 110) continue;
    panel(g, cx, cy, (row * 12 + i) % 6);
  }
  // (the sequence cards across the top; the yarn)
  for (let s = 0; s < 4; s++) { const sx = a + 60 + s * 230; slab(g, sx, CEIL + 76, 120, 14, R6('#FDE68A')); txt(g, `SEQ ${s + 1}`, sx + 60, CEIL + 87, PRINT('#7F1D1D')); }
  g.strokeStyle = '#DC2626'; g.lineWidth = 1.5;
  for (const [p0, p1] of [[[a + 72, CEIL + 120], [a + 384, CEIL + 280]], [[a + 540, CEIL + 196], [a + 850, CEIL + 120]], [[a + 230, CEIL + 350], [a + 700, CEIL + 350]]] as [number, number][][]) { g.beginPath(); g.moveTo(p0[0], p0[1]); g.quadraticCurveTo((p0[0] + p1[0]) / 2, Math.max(p0[1], p1[1]) + 20, p1[0], p1[1]); g.stroke(); }
  // (a crank pencil sharpener on the frame, and a clip lamp)
  slab(g, b - 70, CEIL + 420, 26, 18, CHROME); limb(g, b - 44, CEIL + 428, b - 34, CEIL + 438, 2, CHROME[2]); ball(g, b - 33, CEIL + 439, 2.5, '#DC2626', 1);
};
const paintStoryboardsProps = (g: Ctx) => {
  // (a board artist at the drafting table: drawing stick figures, a coffee, the lamp on its arm)
  g.save(); g.translate(X(3560), GY - 40); sitter(g, 61, { shirt: '#0E7490', drawing: true, reach: 12, nod: 0.1, cap: '#1C1917' }); g.restore();
  part(g, () => { g.moveTo(X(3590), GY - 56); g.lineTo(X(3660), GY - 76); g.lineTo(X(3662), GY - 70); g.lineTo(X(3592), GY - 50); g.closePath(); }, '#F5F0E1', X(3590), GY - 76, 72, 26, 1.2);
  limb(g, X(3622), GY - 54, X(3622), GY, 3, STEEL[3]); limb(g, X(3604), GY - 2, X(3640), GY - 2, 3, STEEL[3]);
  slab(g, X(3660), GY - 82, 9, 11, PAPER);
  limb(g, X(3668), GY - 76, X(3690), GY - 128, 2, STEEL[3]); limb(g, X(3690), GY - 128, X(3654), GY - 140, 2, STEEL[3]);
  part(g, () => { g.moveTo(X(3646), GY - 146); g.lineTo(X(3664), GY - 146); g.lineTo(X(3668), GY - 132); g.lineTo(X(3642), GY - 132); g.closePath(); }, '#16A34A', X(3642), GY - 146, 26, 14, 1);
  // (the overflowing wastebasket; a stool)
  slab(g, X(3700), GY - 34, 30, 34, STEEL);
  for (let i = 0; i < 6; i++) ball(g, X(3704 + (i % 3) * 10), GY - 36 - Math.floor(i / 3) * 8, 6, PAPER[4 - (i % 2)], 1);
  ball(g, X(3740), GY - 6, 6, PAPER[4], 1); ball(g, X(3690), GY - 5, 5, PAPER[3], 1);
  footShadow(g, X(3540), GY, 200);
};

// ---------------------------------------------------------------------------------------------------------------
// 4. The Voice Booth

const paintVoice = (g: Ctx, r: Room) => {
  const a = X(r.a), b = X(r.b);
  eggCrate(g, a, WALL_TOP, b - a, GY - WALL_TOP - 14, FOAM);
  // (bass traps in the corners, colored acoustic panels between)
  for (const [x, col] of [[a + 10, '#7C2D12'], [a + 300, '#1E3A8A'], [a + 590, '#3F6212']] as [number, string][]) { slab(g, x, CEIL + 70, 60, 200, R6(col)); for (let k = 0; k < 6; k++) box(g, x + 6, CEIL + 82 + k * 32, 48, 2, mix(col, INK, 0.3)); }
  baseboard(g, a, GY - 14, b - a, 14, SLATE);
  wallTop(g, a, b, FOAM);
  // (gold records and the platinum one, framed)
  for (let i = 0; i < 3; i++) {
    const gx = X(4480 + i * 100); gilt(g, gx, CEIL + 110, 70, 86, '#0F0F12');
    ball(g, gx + 35, CEIL + 148, 26, i === 1 ? '#D4D8E0' : '#E5B53A', 1); for (let k = 0; k < 3; k++) { g.strokeStyle = 'rgba(0,0,0,0.2)'; g.lineWidth = 1; g.beginPath(); g.arc(gx + 35, CEIL + 148, 12 + k * 5, 0, Math.PI * 2); g.stroke(); }
    ball(g, gx + 35, CEIL + 148, 6, '#B91C1C', 0.8); slab(g, gx + 10, CEIL + 180, 50, 10, GOLD);
  }
  txt(g, 'GOLD', X(4515), CEIL + 210, PRINT('#E5B53A')); txt(g, 'PLATINUM', X(4615), CEIL + 210, PRINT('#D4D8E0')); txt(g, 'GOLD', X(4715), CEIL + 210, PRINT('#E5B53A'));
  // (the wall of headshots by the door: 8x10s, signed)
  for (let i = 0; i < 6; i++) {
    const hx = X(3880 + (i % 2) * 56), hy = CEIL + 80 + Math.floor(i / 2) * 70;
    slab(g, hx, hy, 46, 58, CHARCOAL); box(g, hx + 3, hy + 3, 40, 52, '#E8E4D6');
    const sk = ['#F0C8A2', '#8D5A3B', '#D9A877', '#F6DCC8', '#C68E5E', '#5E3A24'][i];
    ball(g, hx + 23, hy + 24, 10, sk, 1); part(g, () => g.ellipse(hx + 23, hy + 16, 11, 6, 0, Math.PI, 0), ['#141414', '#5B4636', '#A16207', '#1F1611', '#E5C158', '#141414'][i], hx + 12, hy + 10, 22, 6, 1);
    part(g, () => { g.moveTo(hx + 8, hy + 54); g.quadraticCurveTo(hx + 23, hy + 32, hx + 38, hy + 54); g.closePath(); }, ['#1E3A8A', '#7C2D12', '#18181B', '#BE185D', '#14532D', '#4B5563'][i], hx + 8, hy + 32, 30, 22, 1);
    g.strokeStyle = '#1D4ED8'; g.lineWidth = 1; g.beginPath(); g.moveTo(hx + 8, hy + 46); g.bezierCurveTo(hx + 16, hy + 40, hx + 22, hy + 52, hx + 38, hy + 42); g.stroke();
  }
};
const paintVoiceProps = (g: Ctx) => {
  // (THE BOOTH: a box of its own, a double-glazed window, its door, the star inside at take forty)
  const bx = X(3960), bw = 380, bt = GY - 300;
  slab(g, bx, bt, bw, 300, SLATE);
  for (let k = 0; k < 6; k++) box(g, bx + 6, bt + 220 + k * 12, bw - 12, 1, SLATE[2]);
  box(g, bx + 26, bt + 36, bw - 52, 178, INK); bands(g, bx + 30, bt + 40, bw - 60, 170, ['#0E1A24', '#14222E', '#1A2C3A']);
  eggCrate(g, bx + 30, bt + 40, bw - 60, 120, FOAM);
  paintStar(g, bx + 160, bt + 210);
  txt(g, 'MEOW.', bx + 245, bt + 132, PRINT('#111827')); txt(g, 'TAKE 40', bx + 245, bt + 144, PRINT('#B91C1C'));
  g.fillStyle = 'rgba(147,197,253,0.16)'; g.fillRect(bx + 30, bt + 40, bw - 60, 170);
  g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.moveTo(bx + 50, bt + 40); g.lineTo(bx + 76, bt + 40); g.lineTo(bx + 40, bt + 210); g.lineTo(bx + 30, bt + 210); g.lineTo(bx + 30, bt + 120); g.closePath(); g.fill();
  px(g, bx + 90, bt + 40, 4, 170, 'rgba(255,255,255,0.12)');
  slab(g, bx + 26, bt + 210, bw - 52, 8, SLATE);
  // (its door: a porthole, a heavy handle)
  slab(g, bx + bw - 24, bt + 60, 20, 240, SLATE); ball(g, bx + bw - 14, bt + 90, 7, '#0E1A24', 1.4); slab(g, bx + bw - 22, bt + 170, 6, 22, CHROME);
  // (the RECORDING box over the window)
  slab(g, bx + bw / 2 - 64, bt - 40, 128, 32, CHARCOAL); box(g, bx + bw / 2 - 58, bt - 35, 116, 22, '#3F0A0A');
  txt(g, 'RECORDING', bx + bw / 2, bt - 17, park(1, ['#FFFFFF', '#FECACA', '#F87171', '#DC2626']));
  // (the engineer's console: faders, knobs, the reel-to-reel, a CRT with the waveform, the talkback mic)
  const cx = X(4440);
  part(g, () => { g.moveTo(cx, GY - 60); g.lineTo(cx + 240, GY - 60); g.lineTo(cx + 230, GY - 92); g.lineTo(cx + 10, GY - 92); g.closePath(); }, '#3A3D48', cx, GY - 92, 240, 32, 1.4);
  slab(g, cx + 8, GY - 60, 224, 60, SLATE);
  for (let i = 0; i < 18; i++) { px(g, cx + 20 + i * 12, GY - 88, 2, 22, '#18181B'); slab(g, cx + 17 + i * 12, GY - 82 + (i * 7) % 12, 8, 5, i % 4 ? CHROME : REDPLAS, false); for (let k = 0; k < 2; k++) ball(g, cx + 21 + i * 12, GY - 66 - k * 0 + k * 4 - 2, 1.4, ['#F2C84A', '#38BDF8'][k], 0); }
  slab(g, cx + 160, GY - 160, 70, 52, CHARCOAL); for (const rx of [cx + 176, cx + 214]) { ball(g, rx, GY - 140, 13, '#3A3A46', 1.2); ball(g, rx, GY - 140, 4, CHROME[4], 0.8); }
  g.strokeStyle = '#7C4A1E'; g.lineWidth = 1; g.beginPath(); g.moveTo(cx + 176, GY - 127); g.lineTo(cx + 214, GY - 127); g.stroke();
  crt(g, cx + 10, GY - 168, 60, (q, sx, sy, sw, sh) => { box(q, sx, sy, sw, sh, '#041A0A'); q.strokeStyle = '#5CF06A'; q.lineWidth = 1; q.beginPath(); for (let k = 0; k < sw; k += 2) q.lineTo(sx + k, sy + sh / 2 + Math.sin(k * 0.8) * (sh * 0.35) * Math.sin(k * 0.13)); q.stroke(); txt(q, '00:40', sx + sw / 2, sy + 9, PRINT('#5CF06A')); }, BEIGE);
  limb(g, cx + 120, GY - 92, cx + 132, GY - 120, 2, STEEL[3]); ball(g, cx + 133, GY - 122, 3, CHARCOAL[3], 1);
  g.save(); g.translate(cx - 30, GY - 40); sitter(g, 88, { shirt: '#4B5563', reach: 20, nod: 0.25, cardigan: '#7C6A55' }); g.restore();
  // (the director's chair: TALENT)
  const dc = X(4720);
  slab(g, dc - 18, GY - 92, 40, 24, CHARCOAL); txt(g, 'TALENT', dc + 2, GY - 76, PRINT('#F8FAFC'));
  slab(g, dc - 18, GY - 56, 40, 6, CHARCOAL);
  limb(g, dc - 14, GY - 50, dc + 18, GY, 3, '#8B6B4A'); limb(g, dc + 18, GY - 50, dc - 14, GY, 3, '#8B6B4A');
  limb(g, dc - 18, GY - 92, dc - 18, GY - 50, 3, '#8B6B4A'); limb(g, dc + 22, GY - 92, dc + 22, GY - 50, 3, '#8B6B4A');
  footShadow(g, cx - 40, GY, 320);
};
/** The VU meters on the desk (live: bouncing to the meows); the RECORDING lamp, gently pulsing. */
export const drawVoiceLive = (c: Ctx, f: number) => {
  const cx = X(4440);
  for (let i = 0; i < 2; i++) {
    const mx = cx + 74 + i * 42, my = GY - 128;
    slab(c, mx, my, 36, 28, CHARCOAL); bands(c, mx + 3, my + 3, 30, 20, ['#FFF4C8', '#F5E6B8']);
    box(c, mx + 22, my + 4, 10, 3, '#DC2626');
    const a = -2.4 + (0.5 + 0.5 * Math.sin(f * 0.21 + i * 1.7) * Math.sin(f * 0.07)) * 1.6;
    c.strokeStyle = SINK; c.lineWidth = 1.2; c.beginPath(); c.moveTo(mx + 18, my + 22); c.lineTo(mx + 18 + Math.cos(a) * 16, my + 22 + Math.sin(a) * 16); c.stroke();
  }
  const bx = X(3960) + 190, bt = GY - 340;
  c.fillStyle = `rgba(248,113,113,${(0.14 + 0.08 * Math.sin(f * 0.08)).toFixed(3)})`; c.beginPath(); c.ellipse(bx, bt + 14, 84, 26, 0, 0, Math.PI * 2); c.fill();
  // (the reels turning)
  for (const rx of [cx + 176, cx + 214]) { const a = f * 0.06; c.fillStyle = INK; for (let k = 0; k < 3; k++) { const q = a + (k * Math.PI * 2) / 3; c.fillRect(Math.round(rx + Math.cos(q) * 8) - 1, Math.round(GY - 140 + Math.sin(q) * 8) - 1, 3, 3); } }
};

// ---------------------------------------------------------------------------------------------------------------
// 5. Model Sheets

const paintModels = (g: Ctx, r: Room) => {
  const a = X(r.a), b = X(r.b), W = R6('#D8D4C8');
  box(g, a, WALL_TOP, b - a, GY - WALL_TOP, W[3]);
  // (a pegboard under the sheets: curves, rulers, a triangle, scissors on their pegs)
  box(g, a, GY - 150, b - a, 136, R6('#B89A6A')[3]);
  for (let y = GY - 146; y < GY - 18; y += 8) for (let x = a + 4; x < b; x += 8) box(g, x, y, 2, 2, R6('#B89A6A')[1]);
  for (let i = 0; i < 9; i++) {
    const tx = a + 40 + i * 86, ty = GY - 130, k = i % 4;
    if (k === 0) { g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(tx + 20, ty + 30, 20, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.strokeStyle = 'rgba(200,120,200,0.8)'; g.lineWidth = 2; g.stroke(); }
    else if (k === 1) { slab(g, tx, ty + 6, 6, 90, R6('#E8C28A')); for (let m = 0; m < 9; m++) box(g, tx + 1, ty + 10 + m * 10, 3, 1, INK); }
    else if (k === 2) { g.fillStyle = INK; g.beginPath(); g.moveTo(tx, ty + 60); g.lineTo(tx + 44, ty + 60); g.lineTo(tx, ty + 10); g.closePath(); g.fill(); g.fillStyle = 'rgba(56,189,248,0.6)'; g.beginPath(); g.moveTo(tx + 3, ty + 57); g.lineTo(tx + 37, ty + 57); g.lineTo(tx + 3, ty + 18); g.closePath(); g.fill(); }
    else { limb(g, tx + 6, ty + 10, tx + 20, ty + 50, 2.6, CHROME[3]); limb(g, tx + 24, ty + 10, tx + 10, ty + 50, 2.6, CHROME[3]); ball(g, tx + 8, ty + 54, 5, '#DC2626', 1); ball(g, tx + 22, ty + 54, 5, '#DC2626', 1); }
  }
  rail(g, a, GY - 154, b - a, R6('#9E978A'));
  baseboard(g, a, GY - 14, b - a, 14, R6('#9E978A'));
  wallTop(g, a, b, W);
  // (STAY ON MODEL!, across the top)
  slab(g, a + 260, CEIL + 36, 300, 26, R6('#1E3A8A')); txt(g, 'STAY ON MODEL!', a + 410, CEIL + 54, park(1));
  const sheet = (x: number, w: number, title: string) => {
    pinned(g, x, CEIL + 90, w, 230, '#FAFAF5', '#DC2626');
    box(g, x + 6, CEIL + 96, w - 12, 22, '#EEF2F8'); txt(g, title, x + w / 2, CEIL + 112, PRINT('#1E3A8A')); px(g, x + 10, CEIL + 120, w - 20, 1, '#94A3B8');
    for (let k = 0; k < 4; k++) px(g, x + 10, CEIL + 300 - k * 40, w - 20, 1, 'rgba(148,163,184,0.4)');
    pinned(g, x + w - 18, CEIL + 86, 6, 1, '#FAFAF5', '#2563EB');
  };
  sheet(X(4860), 300, 'SOCKS - MODEL SHEET - DO NOT DEVIATE');
  for (let i = 0; i < 4; i++) socks(g, X(4900 + i * 72), CEIL + 290, 1.2, i === 3 ? 2 : i === 2 ? 1 : 0);
  txt(g, 'FRONT     3/4     SIDE     BACK', X(5010), CEIL + 310, PRINT('#64748B'));
  sheet(X(5190), 160, 'CHELSEA - TURNAROUND');
  chelsea(g, X(5230), CEIL + 300, 1.3); chelsea(g, X(5310), CEIL + 300, 1.3, true);
  sheet(X(5380), 190, 'SOCKS - WACKY FACES');
  for (let i = 0; i < 6; i++) { const fx = X(5410 + (i % 3) * 62), fy = CEIL + 170 + Math.floor(i / 3) * 76; ball(g, fx, fy, 18, '#18181B', 1.6); ball(g, fx + 2, fy + 6, 9, '#FFFFFF', 0); px(g, fx - 7, fy - 6, 4, 5, '#FFFFFF'); px(g, fx + 4, fy - 6, 4, 5, '#FFFFFF'); px(g, fx - 6 + (i % 2), fy - 4, 2, 2, INK); px(g, fx + 5 + (i % 2), fy - 4, 2, 2, INK); txt(g, ['WACKY', 'ZANY', 'MADCAP', 'WACKY', 'NUTTY', 'WACKY'][i], fx, fy + 34, PRINT('#64748B')); }
  for (const [sx, sy] of [[X(5100), CEIL + 260], [X(5320), CEIL + 150], [X(5500), CEIL + 300], [X(4940), CEIL + 150]]) {
    g.save(); g.translate(sx, sy); g.rotate(-0.25); g.strokeStyle = 'rgba(220,38,38,0.85)'; g.lineWidth = 2; g.strokeRect(-36, -11, 72, 18); g.strokeRect(-33, -8, 66, 12);
    txt(g, 'APPROVED', 0, 3, PRINT('rgba(220,38,38,0.85)')); g.restore();
  }
  // (clip lamps over the sheets)
  for (const lx of [X(4930), X(5375), X(5540)]) { limb(g, lx, CEIL + 30, lx, CEIL + 64, 2, STEEL[3]); part(g, () => { g.moveTo(lx - 12, CEIL + 76); g.lineTo(lx - 6, CEIL + 62); g.lineTo(lx + 6, CEIL + 62); g.lineTo(lx + 12, CEIL + 76); g.closePath(); }, '#475569', lx - 12, CEIL + 62, 24, 14, 1); }
};
const paintModelsProps = (g: Ctx) => {
  // (the art director's table: sheets in a stack, the ink pad, a mug of brushes)
  slab(g, X(5060), GY - 72, 160, 12, WALNUT); box(g, X(5060), GY - 72, 160, 2, WALNUT[5]);
  slab(g, X(5068), GY - 60, 8, 60, STEEL); slab(g, X(5202), GY - 60, 8, 60, STEEL);
  for (let i = 0; i < 6; i++) part(g, () => g.rect(X(5150) + i, GY - 78 - i * 3, 48, 3), '#FAFAF5', X(5150), GY - 78 - i * 3, 48, 3, 0.6);
  slab(g, X(5130), GY - 78, 14, 6, R6('#B91C1C'));
  slab(g, X(5208), GY - 88, 10, 16, PAPER); for (let i = 0; i < 4; i++) px(g, X(5209) + i * 2, GY - 100, 1, 12, ['#DC2626', '#2563EB', '#16A34A', '#18181B'][i]);
  // (a Socks maquette on its plinth (painted clay, under a dome))
  slab(g, X(5440), GY - 90, 40, 90, R6('#6B6458'));
  socks(g, X(5460), GY - 92, 0.8, 1);
  g.fillStyle = 'rgba(191,219,254,0.2)'; g.beginPath(); g.ellipse(X(5460), GY - 128, 22, 36, 0, Math.PI, 0); g.lineTo(X(5482), GY - 92); g.lineTo(X(5438), GY - 92); g.closePath(); g.fill();
  px(g, X(5446), GY - 150, 3, 40, 'rgba(255,255,255,0.4)');
  // (a flat-file cabinet and a light box along the back)
  fileCab(g, X(4870), GY, 120, 3, STEEL, 5);
  slab(g, X(4876), GY - 84, 108, 12, R6('#F4F4E8'));
  footShadow(g, X(5054), GY, 172);
};

// ---------------------------------------------------------------------------------------------------------------
// 6. Overseas (the long room: the night shift)

/** The city at night through a window (the far side of the world, a quarter to three): a hill, the tower on it,
 *  apartment blocks with a few lit windows, a neon sign, a strip of street. */
const nightCity = (g: Ctx, x: number, y: number, w: number, h: number, seed: number) => {
  bands(g, x, y, w, h, ['#060A1E', '#0A1230', '#121C42', '#1C2A54', '#2A3060']);
  for (let i = 0; i < 14; i++) px(g, x + hash(seed + i) * w, y + hash(seed * 2 + i) * h * 0.4, 1, 1, '#E8ECFF');
  // (the hill, the broadcast tower on it, its red lamp)
  g.fillStyle = '#0C1430'; g.beginPath(); g.moveTo(x, y + h * 0.7); g.quadraticCurveTo(x + w * 0.35, y + h * 0.3, x + w * 0.7, y + h * 0.62); g.lineTo(x + w, y + h * 0.7); g.lineTo(x + w, y + h); g.lineTo(x, y + h); g.closePath(); g.fill();
  const tx = x + w * 0.36;
  box(g, tx - 1, y + h * 0.18, 3, h * 0.24, '#141E40'); box(g, tx - 5, y + h * 0.26, 11, 5, '#1C2A50'); box(g, tx - 4, y + h * 0.27, 9, 2, '#F6D9A0');
  box(g, tx, y + h * 0.14, 1, 6, '#FF4A4A');
  // (the blocks: numbered, rows of windows, a few lit at this hour)
  for (let i = 0; i < 9; i++) {
    const bw = 16 + (i % 3) * 3, bx = x + 4 + i * (w / 9), bh = 34 + hash(seed + i * 3.3) * (h * 0.45);
    box(g, bx, y + h - bh, bw, bh, '#141C3E'); box(g, bx, y + h - bh, 1, bh, '#1E2A56');
    for (let j = 0; j < bh / 6 - 1; j++) for (let k = 0; k < 2; k++) if (hash(seed + i * 7 + j * 1.3 + k) > 0.72) px(g, bx + 3 + k * 7, y + h - bh + 4 + j * 6, 3, 2, hash(i + j + k) > 0.5 ? '#FDE68A' : '#BFE3FF');
  }
  // (a neon sign down a block's side; the street lamps' strip)
  box(g, x + w * 0.78, y + h - 60, 6, 30, '#3A0A2A'); for (let k = 0; k < 4; k++) px(g, x + w * 0.78 + 1, y + h - 58 + k * 7, 4, 5, k % 2 ? '#F472B6' : '#38BDF8');
  bands(g, x, y + h - 8, w, 8, ['#2A2440', '#4A3A4A']);
  for (let k = 0; k < 6; k++) px(g, x + 8 + k * (w / 6), y + h - 7, 2, 2, '#FCD26A');
};
const paintOverseas = (g: Ctx, r: Room) => {
  const a = X(r.a), b = X(r.b);
  // (institutional: painted block, cream above a green dado, scuffs, a fluorescent-lit ceiling line)
  cinder(g, a, WALL_TOP, b - a, 220, CREAMWALL, 61);
  cinder(g, a, WALL_TOP + 220, b - a, GY - WALL_TOP - 234, GREENWALL, 62);
  rail(g, a, WALL_TOP + 218, b - a, GREENWALL);
  baseboard(g, a, GY - 14, b - a, 14, R6('#2A3A26'));
  wallTop(g, a, b, CREAMWALL);
  for (let i = 0; i < 14; i++) px(g, a + 70 + i * 140, GY - 40 - (i % 3) * 12, 24, 3, 'rgba(40,40,30,0.3)');
  // (the clock: quarter to three)
  wallClock(g, X(5820), CEIL + 120, 30, 2, 45, CREAMWALL);
  // (the calendar: every day crossed off, DEADLINE circled)
  const kx = X(6000), ky = CEIL + 80;
  pinned(g, kx, ky, 110, 120, PAPER[4], '#2563EB');
  box(g, kx, ky, 110, 20, '#B91C1C'); txt(g, 'NOVEMBER 1994', kx + 55, ky + 14, PRINT('#FFFFFF'));
  for (let d = 0; d < 28; d++) { const dx = kx + 6 + (d % 7) * 14.5, dy = ky + 28 + Math.floor(d / 7) * 21; box(g, dx - 1, dy - 1, 13, 15, PAPER[2]); g.strokeStyle = '#B91C1C'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(dx, dy); g.lineTo(dx + 10, dy + 12); g.moveTo(dx + 10, dy); g.lineTo(dx, dy + 12); g.stroke(); }
  g.strokeStyle = '#B91C1C'; g.lineWidth = 2; g.beginPath(); g.ellipse(kx + 96, ky + 104, 12, 10, 0, 0, Math.PI * 2); g.stroke();
  txt(g, 'DEADLINE', kx + 72, ky + 132, MARKER('#B91C1C', 4));
  // (the windows on the city, a radiator under each)
  for (const wx of [X(6420), X(6900), X(7300)]) {
    slab(g, wx, CEIL + 64, 200, 160, CREAMWALL);
    nightCity(g, wx + 8, CEIL + 72, 184, 144, wx);
    box(g, wx + 98, CEIL + 72, 4, 144, CREAMWALL[2]); box(g, wx + 8, CEIL + 140, 184, 4, CREAMWALL[2]); box(g, wx + 98, CEIL + 72, 1, 144, CREAMWALL[4]);
    g.fillStyle = 'rgba(160,190,230,0.08)'; g.fillRect(wx + 8, CEIL + 72, 184, 144);
    slab(g, wx - 6, CEIL + 222, 212, 8, CREAMWALL);
    slab(g, wx + 30, CEIL + 280, 140, 60, CREAMWALL); for (let k = 0; k < 12; k++) box(g, wx + 36 + k * 11, CEIL + 284, 6, 52, CREAMWALL[2]);
  }
  // (the strip lights hung on chains along the room, a water cooler by the side table)
  for (let x = a + 150; x < b - 100; x += 300) tubeLamp(g, x, CEIL + 50, 120, true, 18);
  cooler(g, X(6140), GY);
  // (the fax machine on its cart, spitting a long page from Dave)
  const fx = X(6700);
  slab(g, fx - 6, GY - 76, 102, 8, STEEL); for (const lx of [fx - 2, fx + 88]) box(g, lx, GY - 68, 4, 68, STEEL[2]);
  fax(g, fx + 20, GY - 76, 0);
  part(g, () => { g.moveTo(fx + 30, GY - 82); g.lineTo(fx + 58, GY - 82); g.lineTo(fx + 62, GY - 290); g.quadraticCurveTo(fx + 90, GY - 300, fx + 102, GY - 270); g.lineTo(fx + 96, GY - 250); g.quadraticCurveTo(fx + 86, GY - 280, fx + 72, GY - 280); g.lineTo(fx + 64, GY - 82); g.closePath(); }, '#FAFAF5', fx + 30, GY - 300, 72, 218, 1);
  txt(g, 'NEED 9000', fx + 47, GY - 250, PRINT('#111827')); txt(g, 'MORE BY', fx + 47, GY - 238, PRINT('#111827')); txt(g, 'FRIDAY!!', fx + 47, GY - 226, PRINT('#111827')); txt(g, 'THX - DAVE', fx + 47, GY - 210, PRINT('#1D4ED8'));
  txt(g, ':)', fx + 47, GY - 196, PRINT('#1D4ED8'));
  // (coats on hooks; a kettle and noodle cups on a side table; boxes of finished drawings going out, AIR FREIGHT)
  for (let i = 0; i < 5; i++) { const hx = X(5700 + i * 34); box(g, hx, CEIL + 270, 6, 3, STEEL[3]); part(g, () => { g.moveTo(hx - 8, CEIL + 274); g.lineTo(hx + 12, CEIL + 274); g.lineTo(hx + 16, CEIL + 340 - (i % 2) * 14); g.lineTo(hx - 12, CEIL + 340 - (i % 2) * 14); g.closePath(); }, ['#4B5563', '#7C2D12', '#1E3A8A', '#14532D', '#6B21A8'][i], hx - 12, CEIL + 274, 28, 66, 1); }
  slab(g, X(6180), GY - 70, 120, 10, PANEL); for (const lx of [6184, 6290]) box(g, X(lx), GY - 60, 4, 60, PANEL[1]);
  slab(g, X(6190), GY - 96, 22, 26, CHROME); limb(g, X(6212), GY - 90, X(6220), GY - 84, 3, CHROME[2]);
  for (let i = 0; i < 4; i++) { slab(g, X(6226 + i * 16), GY - 84, 12, 14, PAPER); px(g, X(6226 + i * 16), GY - 84, 12, 3, '#DC2626'); }
  for (let i = 0; i < 6; i++) { const bx = X(7380 + (i % 3) * 52), by = GY - 40 - Math.floor(i / 3) * 40; slab(g, bx, by, 50, 40, CORK); box(g, bx + 20, by, 10, 40, '#C8A86A'); txt(g, 'BURBANK', bx + 25, by + 24, PRINT('#3B2A10')); }
  txt(g, 'AIR FREIGHT', X(7458), GY - 90, PRINT('#7F1D1D'));
  // (a box fan on a stool; family photos taped up by the desks)
  for (let i = 0; i < 6; i++) { const px0 = X(5900 + i * 270), py0 = CEIL + 254; slab(g, px0, py0, 22, 16, PAPER); box(g, px0 + 2, py0 + 2, 18, 11, ['#86C4F0', '#F9A8D4', '#86EFAC'][i % 3]); ball(g, px0 + 8, py0 + 9, 2.5, ASIAN_SKIN[i % 6], 0); ball(g, px0 + 14, py0 + 10, 2, ASIAN_SKIN[(i + 2) % 6], 0); px(g, px0 + 6, py0 + 6, 4, 1, ASIAN_HAIR[i % 4]); }
};
/** The light tables, rows going back, and who's at them. */
export const OVERSEAS_ROWS: { d: number; xs: number[] }[] = [
  { d: 0.80, xs: Array.from({ length: 12 }, (_, i) => 5680 + i * 160) },
  { d: 0.84, xs: Array.from({ length: 11 }, (_, i) => 5760 + i * 165) },
  { d: 0.88, xs: Array.from({ length: 10 }, (_, i) => 5700 + i * 180) },
];
/** A light table (its left at x): legs, the tilted glowing top, a peg bar, a stack of drawings, a lamp, a noodle cup or a
 *  thermos, a cot under some. */
export const lightTable = (g: Ctx, x: number, k: number) => {
  for (const lx of [x + 4, x + 74]) slab(g, lx, GY - 66, 5, 66, STEEL, false);
  box(g, x + 4, GY - 26, 74, 3, STEEL[2]);
  part(g, () => { g.moveTo(x, GY - 66); g.lineTo(x + 84, GY - 66); g.lineTo(x + 80, GY - 92); g.lineTo(x + 4, GY - 80); g.closePath(); }, '#C9C4AE', x, GY - 92, 84, 26, 1.2);
  flat(g, () => { g.moveTo(x + 10, GY - 70); g.lineTo(x + 76, GY - 70); g.lineTo(x + 73, GY - 87); g.lineTo(x + 12, GY - 79); g.closePath(); }, '#FFF8DA', 0);
  flat(g, () => { g.moveTo(x + 10, GY - 70); g.lineTo(x + 40, GY - 70); g.lineTo(x + 40, GY - 83); g.lineTo(x + 12, GY - 79); g.closePath(); }, '#FFFDF0', 0);
  // (the drawing on it, its line showing through the paper; the peg bar)
  g.strokeStyle = 'rgba(60,60,70,0.55)'; g.lineWidth = 1; g.beginPath(); g.arc(x + 44, GY - 78, 4, 0, Math.PI * 2); g.moveTo(x + 44, GY - 74); g.lineTo(x + 46, GY - 72); g.stroke();
  px(g, x + 30, GY - 85, 28, 2, STEEL[3]);
  part(g, () => g.rect(x + 50, GY - 98 - (k % 4) * 4, 26, 6 + (k % 4) * 4), '#FAFAF5', x + 50, GY - 98 - (k % 4) * 4, 26, 6 + (k % 4) * 4, 0.8);
  for (let l = 0; l < (k % 4) + 1; l++) px(g, x + 51, GY - 95 - l * 4, 24, 1, PAPER[2]);
  if (k % 3 === 0) { part(g, () => g.rect(x + 14, GY - 98, 12, 14), '#F8FAFC', x + 14, GY - 98, 12, 14, 0.9); px(g, x + 14, GY - 98, 12, 3, '#DC2626'); px(g, x + 18, GY - 106, 1, 8, '#D6A86A'); px(g, x + 21, GY - 106, 1, 8, '#D6A86A'); }
  else if (k % 3 === 1) { part(g, () => g.roundRect(x + 14, GY - 106, 8, 20, 2), '#1E3A8A', x + 14, GY - 106, 8, 20, 0.9); px(g, x + 14, GY - 106, 8, 3, CHROME[3]); }
  else { limb(g, x + 6, GY - 80, x + 2, GY - 120, 1.6, STEEL[3]); limb(g, x + 2, GY - 120, x + 20, GY - 124, 1.6, STEEL[3]); part(g, () => { g.moveTo(x + 14, GY - 128); g.lineTo(x + 28, GY - 128); g.lineTo(x + 30, GY - 118); g.lineTo(x + 12, GY - 118); g.closePath(); }, '#475569', x + 12, GY - 128, 18, 10, 1); }
  if (k % 5 === 2) { px(g, x + 36, GY - 66, 30, 4, '#4B5563'); part(g, () => g.rect(x + 30, GY - 30, 50, 22), '#6B7F6A', x + 30, GY - 30, 50, 22, 1); }
  if (k % 4 === 1) { slab(g, x + 60, GY - 18, 22, 18, CORK); for (let i = 0; i < 3; i++) ball(g, x + 64 + i * 7, GY - 20, 4, PAPER[4 - i], 0.8); }
};
/** Draws one row's person (stamped by frame: drawing, flipping a page, asleep, yawning) and the cot sleeper. */
export const nightShift = (c: Ctx, x: number, k: number, f: number) => {
  const seed = 400 + k * 13, asleep = k % 9 === 4, yawn = k % 11 === 7 && (f % 300) < 60;
  const fr = asleep ? 0 : ((f + k * 17) >> 3) % 4;
  stamp(c, `ct-st2-anim-${k}-${fr}-${yawn ? 1 : 0}`, x - 60, GY - 120, 110, 124, g => {
    g.save(); g.translate(x - 26, GY - 44);
    sitter(g, seed, { asian: true, shirt: ['#6B7280', '#4B5563', '#7C6A55', '#3F5160', '#5B6B5B', '#8B7E74'][k % 6], pants: '#374151', drawing: true, reach: 18, nod: asleep ? 1 : 0.4 + (k % 3) * 0.1, hand: [0, 2, 4, 2][fr], yawn, cardigan: k % 4 === 0 ? '#8B6B4A' : k % 4 === 2 ? '#3F3F46' : undefined });
    g.restore();
  });
  if (k % 5 === 2) stamp(c, `ct-st2-cot-${k}`, x + 20, GY - 46, 70, 46, g => {
    ball(g, x + 40, GY - 34, 7, ASIAN_SKIN[k % 6], 1); px(g, x + 35, GY - 42, 11, 5, ASIAN_HAIR[k % 4]);
    part(g, () => g.roundRect(x + 44, GY - 41, 34, 12, 4), '#8B5CF6', x + 44, GY - 41, 34, 12, 1);
    px(g, x + 46, GY - 40, 30, 2, '#A78BFA');
  });
};
/** The park's banner over the night shift (hung on two wires from the ceiling): OUR OVERSEAS PARTNERS!, a grinning globe. */
export const paintBanner = (g: Ctx) => {
  const x = X(6600), y = Y(380), w = 420, h = 76;
  wires(g, [x - w / 2 + 30, x + w / 2 - 30], CEIL, y);
  g.fillStyle = INK; g.beginPath(); g.roundRect(x - w / 2 - 2, y - 2, w + 4, h + 4, 11); g.fill();
  g.save(); g.beginPath(); g.roundRect(x - w / 2, y, w, h, 10); g.clip();
  bands(g, x - w / 2, y, w, h, ['#7DD3FC', '#38BDF8', '#0EA5E9', '#0284C7']);
  for (let k = 0; k < 14; k++) { box(g, x - w / 2 + k * 32, y, 14, 3, '#FDE047'); }
  g.restore();
  box(g, x - w / 2 + 10, y + 1, w - 20, 1, '#E0F2FE');
  // (the globe, grinning, a thumbs up)
  const gx = x - w / 2 + 44, gy = y + h / 2;
  ball(g, gx, gy, 27, '#3B82F6', 1.6);
  flat(g, () => { g.moveTo(gx - 14, gy - 14); g.quadraticCurveTo(gx - 4, gy - 22, gx + 10, gy - 12); g.lineTo(gx + 4, gy + 2); g.closePath(); }, '#22C55E', 1);
  flat(g, () => { g.moveTo(gx + 8, gy + 8); g.quadraticCurveTo(gx + 18, gy + 4, gx + 20, gy + 14); g.lineTo(gx + 10, gy + 18); g.closePath(); }, '#22C55E', 1);
  px(g, gx - 10, gy - 8, 6, 7, '#FFFFFF'); px(g, gx + 4, gy - 8, 6, 7, '#FFFFFF'); px(g, gx - 8, gy - 6, 3, 4, INK); px(g, gx + 6, gy - 6, 3, 4, INK);
  g.strokeStyle = SINK; g.lineWidth = 2; g.beginPath(); g.arc(gx, gy + 4, 11, 0.2, Math.PI - 0.2); g.stroke(); box(g, gx - 7, gy + 8, 14, 3, '#FFFFFF');
  limb(g, gx + 24, gy + 4, gx + 34, gy - 6, 5, '#FFFFFF'); ball(g, gx + 35, gy - 8, 5, '#FFFFFF', 1); limb(g, gx + 35, gy - 12, gx + 35, gy - 20, 3, '#FFFFFF');
  txt(g, 'OUR OVERSEAS', x + 24, y + 34, park(2));
  txt(g, 'PARTNERS!', x + 24, y + 62, park(2, ['#FFFFFF', '#FCE7F3', '#F9A8D4', '#EC4899']));
};

// ---------------------------------------------------------------------------------------------------------------
// 7. Ink and Paint

const paintInkpaint = (g: Ctx, r: Room) => {
  const a = X(r.a), b = X(r.b), W = R6('#AFC3CF');
  // (tile to shoulder height, a pale blue wall over it)
  box(g, a, WALL_TOP, b - a, GY - WALL_TOP, W[3]);
  for (let y = GY - 170; y < GY - 14; y += 14) for (let x = a + ((y / 14) % 2 ? 0 : 7); x < b; x += 14) { box(g, x, y, 13, 13, W[4]); box(g, x, y, 13, 1, W[5]); box(g, x + 12, y, 1, 13, W[2]); }
  rail(g, a, GY - 174, b - a, R6('#7F96A3'));
  baseboard(g, a, GY - 14, b - a, 14, R6('#5A6E7A'));
  wallTop(g, a, b, W);
  // (drying racks full of cels, the paint showing through the acetate)
  for (const rx of [7640, 8240]) {
    const x = X(rx);
    slab(g, x, CEIL + 76, 300, 208, STEEL);
    box(g, x + 6, CEIL + 82, 288, 196, STEEL[1]);
    for (let i = 0; i < 28; i++) {
      const cx = x + 8 + i * 10.4;
      px(g, cx, CEIL + 86, 7, 188, 'rgba(219,234,254,0.55)'); px(g, cx, CEIL + 86, 1, 188, 'rgba(255,255,255,0.7)');
      px(g, cx + 1, CEIL + 150 + (i % 5) * 10, 5, 30, ['#DC2626', '#18181B', '#FACC15', '#7C3AED', '#16A34A'][i % 5]);
      px(g, cx + 1, CEIL + 120 + (i % 3) * 8, 5, 4, '#F6F4EC');
    }
    for (let k = 0; k < 4; k++) box(g, x + 6, CEIL + 128 + k * 46, 288, 2, STEEL[3]);
  }
  // (paint jars on shelves, every color the show uses, numbered)
  for (let s = 0; s < 3; s++) {
    const sy = CEIL + 120 + s * 70;
    shelf(g, X(7960), sy, 260, WALNUT);
    for (let j = 0; j < 13; j++) {
      const jx = X(7966 + j * 20), col = ['#DC2626', '#F97316', '#FACC15', '#16A34A', '#2563EB', '#7C3AED', '#EC4899', '#18181B', '#A16207', '#FFFFFF', '#0EA5E9', '#84CC16', '#9CA3AF'][(j + s * 4) % 13];
      slab(g, jx, sy - 24, 14, 24, R6('#E5E7EB')); box(g, jx + 1, sy - 16, 12, 15, col); box(g, jx + 1, sy - 16, 3, 15, mix(col, '#FFFFFF', 0.3)); slab(g, jx + 1, sy - 28, 12, 4, CHARCOAL);
      px(g, jx + 3, sy - 12, 8, 3, '#FFFFFF');
    }
  }
  // (the color chart: SOCKS BLACK 1, WHITE 3, the reds; a sink; smocks on hooks)
  slab(g, X(7964), CEIL + 300, 254, 64, PAPER);
  txt(g, 'SOCKS: BLACK 1  WHITE 3  BOW TIE RED 7', X(8091), CEIL + 314, PRINT('#1E3A8A'));
  for (let i = 0; i < 10; i++) { slab(g, X(7974 + i * 24), CEIL + 322, 18, 18, R6(['#18181B', '#FFFFFF', '#DC2626', '#7C3AED', '#F0C8A2', '#A0522D', '#1E3A8A', '#FACC15', '#16A34A', '#F472B6'][i])); txt(g, `${i + 1}`, X(7983 + i * 24), CEIL + 354, PRINT('#334155')); }
  for (let i = 0; i < 4; i++) { const hx = X(8560 + (i % 2) * 20); box(g, hx, CEIL + 300 + Math.floor(i / 2) * 2, 6, 3, STEEL[3]); }
  part(g, () => { g.moveTo(X(8548), CEIL + 304); g.lineTo(X(8576), CEIL + 304); g.lineTo(X(8584), CEIL + 380); g.lineTo(X(8540), CEIL + 380); g.closePath(); }, '#E5E7EB', X(8540), CEIL + 304, 44, 76, 1);
  for (let k = 0; k < 8; k++) px(g, X(8548) + (k * 7) % 30, CEIL + 320 + k * 7, 3, 3, ['#DC2626', '#2563EB', '#FACC15'][k % 3]);
};
const paintInkpaintProps = (g: Ctx) => {
  // (two long tables, painters at them painting the backs of cels laid flat, jars and brushes by them)
  for (const [t0, n] of [[7680, 4], [8180, 4]] as [number, number][]) {
    for (let i = 0; i < n; i++) { const x = X(t0 + i * 95); g.save(); g.translate(x, GY - 44); sitter(g, 700 + t0 + i * 29, { asian: true, shirt: ['#E7E5E4', '#D6D3C4', '#CBD5E1'][i % 3], pants: '#475569', reach: 22, nod: 0.45, drawing: false }); g.restore(); }
    slab(g, X(t0 + 10), GY - 66, n * 95 + 20, 10, R6('#9CA3AF'));
    slab(g, X(t0 + 16), GY - 56, 6, 56, STEEL); slab(g, X(t0 + n * 95 + 20), GY - 56, 6, 56, STEEL);
    for (let i = 0; i < n; i++) {
      const cx = X(t0 + 40 + i * 95);
      px(g, cx, GY - 70, 40, 4, 'rgba(219,234,254,0.9)'); px(g, cx + 8, GY - 70, 14, 4, ['#DC2626', '#18181B', '#FACC15', '#7C3AED'][i % 4]);
      slab(g, cx + 44, GY - 76, 8, 10, R6('#E5E7EB')); px(g, cx + 45, GY - 72, 6, 5, ['#DC2626', '#2563EB', '#16A34A', '#18181B'][i % 4]); px(g, cx + 47, GY - 84, 1, 10, '#A16207');
    }
  }
  footShadow(g, X(7660), GY, 420); footShadow(g, X(8160), GY, 420);
};

// ---------------------------------------------------------------------------------------------------------------
// 8. The Camera

const paintCamera = (g: Ctx, r: Room) => {
  const a = X(r.a), b = X(r.b);
  drape(g, a, WALL_TOP, b - a, GY - WALL_TOP, BLACKOUT, 22);
  wallTop(g, a, b, CHARCOAL);
  // (the film can racks: steel shelving, cans labeled by episode)
  slab(g, X(8612), CEIL + 70, 216, 330, STEEL); box(g, X(8618), CEIL + 76, 204, 318, STEEL[0]);
  for (let s = 0; s < 4; s++) {
    const sy = CEIL + 140 + s * 80;
    slab(g, X(8618), sy, 204, 6, STEEL);
    for (let j = 0; j < 7; j++) { const cx = X(8626 + j * 28); g.fillStyle = INK; g.beginPath(); g.ellipse(cx + 11, sy - 16, 12, 16, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = CHROME[3]; g.beginPath(); g.ellipse(cx + 11, sy - 16, 11, 15, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = CHROME[4]; g.beginPath(); g.ellipse(cx + 9, sy - 18, 6, 10, 0, 0, Math.PI * 2); g.fill(); box(g, cx + 3, sy - 20, 16, 6, '#F8FAFC'); px(g, cx + 5, sy - 18, 12, 1, '#334155'); }
  }
  // (the exposure sheets pinned up on a board; QUIET: SHOOTING over the door)
  slab(g, X(9032), CEIL + 110, 160, 150, CORK);
  for (let i = 0; i < 3; i++) pinned(g, X(9040 + i * 50), CEIL + 120, 40, 126, '#FAFAF5', '#DC2626', q => { for (let l = 0; l < 13; l++) px(q, X(9042 + i * 50), CEIL + 132 + l * 9, 36, 1, '#94A3B8'); for (let l = 0; l < 4; l++) px(q, X(9054 + i * 50), CEIL + 134 + l * 27, 14, 4, '#334155'); });
  slab(g, X(9050), CEIL + 300, 110, 26, CHARCOAL); box(g, X(9055), CEIL + 304, 100, 18, '#4A0A0A'); txt(g, 'QUIET: SHOOTING', X(9105), CEIL + 316, PRINT('#FCA5A5'));
};
const paintCameraProps = (g: Ctx) => {
  // (the rostrum camera: a tall column, the camera up top looking down at the table, the soft boxes either side)
  const cx = X(8960);
  slab(g, cx - 9, GY - 400, 18, 330, STEEL); for (let k = 0; k < 16; k++) box(g, cx - 5, GY - 394 + k * 20, 10, 1, STEEL[1]);
  slab(g, cx - 42, GY - 334, 84, 54, CHARCOAL);
  for (const s of [-1, 1]) { ball(g, cx + s * 26, GY - 344, 14, '#27272A', 1.2); ball(g, cx + s * 26, GY - 344, 4, CHROME[3], 0.8); }
  slab(g, cx - 14, GY - 282, 28, 26, CHARCOAL);
  ball(g, cx, GY - 254, 10, '#3F3F46', 1); ball(g, cx, GY - 254, 5, '#1E3A8A', 0); px(g, cx - 3, GY - 257, 2, 2, '#BFE3FF');
  for (const s of [-1, 1]) {
    part(g, () => { g.moveTo(cx + s * 90 - 26, GY - 206); g.lineTo(cx + s * 90 + 26, GY - 206); g.lineTo(cx + s * 90 + 20, GY - 164); g.lineTo(cx + s * 90 - 20, GY - 164); g.closePath(); }, '#27272A', cx + s * 90 - 26, GY - 206, 52, 42, 1.2);
    box(g, cx + s * 90 - 18, GY - 170, 36, 6, '#FDE68A'); box(g, cx + s * 90 - 18, GY - 170, 36, 1, '#FFFBEA');
    limb(g, cx + s * 90, GY - 164, cx + s * 90, GY - 4, 3, STEEL[3]); limb(g, cx + s * 90 - 16, GY - 2, cx + s * 90 + 16, GY - 2, 3, STEEL[3]);
  }
  slab(g, cx - 70, GY - 82, 140, 16, CHARCOAL);
  px(g, cx - 40, GY - 86, 80, 4, 'rgba(219,234,254,0.9)'); slab(g, cx - 64, GY - 66, 8, 66, STEEL); slab(g, cx + 56, GY - 66, 8, 66, STEEL);
  for (let k = 0; k < 4; k++) px(g, cx - 34 + k * 20, GY - 86, 2, 4, CHROME[4]);
  g.save(); g.translate(cx + 90, GY - 44); sitter(g, 913, { shirt: '#1F2937', reach: 4, nod: 0.2, chair: '#27272A' }); g.restore();
  // (film cans stacked on the floor, a Moviola by the curtain)
  for (let i = 0; i < 4; i++) { g.fillStyle = INK; g.fillRect(X(9100) - 1, GY - 10 - i * 9 - 1, 46, 10); g.fillStyle = CHROME[3 - (i % 2)]; g.fillRect(X(9100), GY - 10 - i * 9, 44, 8); px(g, X(9104), GY - 8 - i * 9, 20, 3, '#F8FAFC'); }
  slab(g, X(9150), GY - 80, 40, 80, R6('#3A4A3A')); ball(g, X(9160), GY - 94, 10, '#27272A', 1); ball(g, X(9182), GY - 94, 10, '#27272A', 1); slab(g, X(9154), GY - 72, 30, 18, CHARCOAL); box(g, X(9158), GY - 69, 22, 12, '#9AD0E8');
  footShadow(g, cx - 120, GY, 240);
};

// ---------------------------------------------------------------------------------------------------------------
// 9. Premiere Night

const paintPremiere = (g: Ctx, r: Room) => {
  const a = X(r.a), b = X(r.b);
  drape(g, a, WALL_TOP, b - a, GY - WALL_TOP, VELVET, 26);
  wallTop(g, a, b, VELVET);
  // (the step-and-repeat: the studio's star and the show's cat head in a grid on a white backdrop on its frame)
  const sx0 = a + 30, sx1 = b - 30, sy0 = CEIL + 60, sy1 = GY - 40;
  slab(g, sx0 - 6, sy0 - 6, sx1 - sx0 + 12, sy1 - sy0 + 6, CHARCOAL);
  bands(g, sx0, sy0, sx1 - sx0, sy1 - sy0, ['#F8FAFC', '#F1F5F9', '#E2E8F0']);
  for (let x = sx0 + 10; x < sx1 - 40; x += 90) for (let y = sy0 + 12; y < sy1 - 50; y += 70) {
    const k = ((x - a) / 90 + (y - CEIL) / 70) | 0;
    if (k % 2) {
      ball(g, x + 20, y + 20, 13, '#18181B', 1.2);
      flat(g, () => { g.moveTo(x + 10, y + 12); g.lineTo(x + 8, y); g.lineTo(x + 17, y + 8); g.closePath(); g.moveTo(x + 30, y + 12); g.lineTo(x + 32, y); g.lineTo(x + 23, y + 8); g.closePath(); }, '#18181B', 1);
      px(g, x + 14, y + 16, 4, 4, '#FFFFFF'); px(g, x + 22, y + 16, 4, 4, '#FFFFFF'); px(g, x + 15, y + 25, 10, 3, '#DC2626');
      txt(g, 'WACKY!', x + 20, y + 44, PRINT('#7C3AED'));
    } else {
      flat(g, () => { for (let i = 0; i < 10; i++) { const ang = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 6 : 14; g.lineTo(x + 20 + Math.cos(ang) * rr, y + 20 + Math.sin(ang) * rr); } g.closePath(); }, '#F2C94C', 1);
      px(g, x + 17, y + 12, 3, 3, '#FFF0A8');
      txt(g, 'STUDIOS', x + 20, y + 44, PRINT('#1E3A8A'));
    }
  }
  // (velvet swags along the top, gold tassels)
  for (let x = a; x < b; x += 160) swag(g, x, CEIL + 30, 160, 16, VELVET);
  // (WORLD PREMIERE, in marquee letters over it all)
  slab(g, a + 300, CEIL + 34, 200, 22, GOLD); txt(g, 'WORLD PREMIERE', a + 400, CEIL + 50, PRINT('#3B2A10'));
};
/** The show's big promo board on its truss: CHELSEA CLINTON AND SOCKS THE CAT'S WACKY WHITE HOUSE ADVENTURES! */
export const PROMO = { x: X(9330), y: GY - 440, w: 300, h: 290 };
export const paintPromo = (g: Ctx) => {
  const x0 = PROMO.x, y0 = PROMO.y, w = PROMO.w, h = PROMO.h;
  // (the truss legs: box truss, zigzag lacing, base plates)
  for (const lx of [x0 + 30, x0 + w - 30]) {
    for (const dx of [-7, 5]) { box(g, lx + dx - 1, y0 + h, 4, GY - y0 - h, INK); box(g, lx + dx, y0 + h, 2, GY - y0 - h, CHROME[4]); }
    for (let y = y0 + h; y < GY - 8; y += 14) { g.strokeStyle = CHROME[2]; g.lineWidth = 1.2; g.beginPath(); g.moveTo(lx - 6, y); g.lineTo(lx + 6, y + 7); g.lineTo(lx - 6, y + 14); g.stroke(); }
    slab(g, lx - 14, GY - 6, 28, 6, STEEL);
  }
  g.fillStyle = INK; g.fillRect(x0 - 2, y0 - 2, w + 4, h + 4);
  slab(g, x0, y0, w, h, BLUEPLAS, false);
  // (the show stopped on a gross-up: Socks lovingly over-rendered, Chelsea's grin in an inset (gross.ts))
  grossBack(g, x0 + 6, y0 + 6, w - 12, h - 12);
  const hx = x0 + w / 2;
  g.save(); g.beginPath(); g.rect(x0 + 6, y0 + 6, w - 12, h - 12); g.clip();
  grossSocks(g, hx - 22, y0 + 196, 58);
  g.restore();
  grossChelsea(g, x0 + w - 56, y0 + h - 84, 34);
  // (the title, in the park's letters, on a burst)
  g.fillStyle = INK; g.beginPath(); for (let i = 0; i < 24; i++) { const ang = (i * Math.PI) / 12, rr = i % 2 ? 66 : 82; g.lineTo(hx + Math.cos(ang) * rr * 1.7, y0 + 64 + Math.sin(ang) * rr * 0.62); } g.closePath(); g.fill();
  g.fillStyle = '#FDE047'; g.beginPath(); for (let i = 0; i < 24; i++) { const ang = (i * Math.PI) / 12, rr = i % 2 ? 62 : 78; g.lineTo(hx + Math.cos(ang) * rr * 1.7, y0 + 64 + Math.sin(ang) * rr * 0.62); } g.closePath(); g.fill();
  g.fillStyle = '#FACC15'; g.beginPath(); g.ellipse(hx, y0 + 72, 96, 30, 0, 0, Math.PI); g.fill();
  txt(g, 'CHELSEA CLINTON AND', hx, y0 + 38, park(1, ['#FFFFFF', '#FFFFFF', '#FEF3C7', '#FDE68A']));
  txt(g, "SOCKS THE CAT'S", hx, y0 + 54, park(1, ['#FFFFFF', '#FFFFFF', '#FEF3C7', '#FDE68A']));
  txt(g, 'WACKY', hx, y0 + 86, park(3, ['#FFFFFF', '#FDF2F8', '#F9A8D4', '#EC4899']));
  txt(g, 'WHITE HOUSE ADVENTURES!', hx, y0 + 108, park(1, ['#FFFFFF', '#FEF3C7', '#FDE047', '#F59E0B']));
  slab(g, hx - 90, y0 + h - 36, 180, 24, REDPLAS);
  txt(g, 'SATURDAY MORNINGS!', hx, y0 + h - 20, PRINT('#FFFFFF'));
};
/** The promo board's marquee bulbs chasing round it (live). */
export const drawPromoBulbs = (c: Ctx, f: number) => {
  const x0 = PROMO.x, y0 = PROMO.y, w = PROMO.w, h = PROMO.h, n = 32;
  for (let i = 0; i < n; i++) {
    const per = (w + h) * 2, d = (i / n) * per;
    const p = d < w ? [x0 + d, y0] : d < w + h ? [x0 + w, y0 + d - w] : d < w * 2 + h ? [x0 + w - (d - w - h), y0 + h] : [x0, y0 + h - (d - w * 2 - h)];
    const on = (i + (f >> 3)) % 3 === 0;
    c.fillStyle = INK; c.beginPath(); c.arc(p[0], p[1], 4.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = on ? '#FFF7C2' : '#B45309'; c.beginPath(); c.arc(p[0], p[1], 3.2, 0, Math.PI * 2); c.fill();
    if (on) { c.fillStyle = '#FFFFFF'; c.fillRect(Math.round(p[0]) - 1, Math.round(p[1]) - 2, 1, 1); }
  }
};
/** The press, cardboard cut-outs behind the rope along the carpet: seeded, varied, fedoras and big cameras. */
export const paintPaparazzi = (g: Ctx) => {
  for (let i = 0; i < 5; i++) {
    const x = X(9360 + i * 64), lean = (i % 2) ? 0.06 : -0.04;
    const skin = ['#F0C8A2', '#8D5A3B', '#D9A877', '#F6DCC8', '#5E3A24'][i], coat = ['#475569', '#7C2D12', '#1E3A8A', '#3F3F46', '#14532D'][i];
    g.save(); g.translate(x, GY); g.rotate(lean);
    // (the cardboard's edge: brown showing round it; a strut behind)
    limb(g, -6, -10, -18, 0, 3, CORK[3]);
    flat(g, () => { g.moveTo(-15, 0); g.lineTo(-17, -54); g.quadraticCurveTo(0, -62, 17, -54); g.lineTo(15, 0); g.closePath(); }, CORK[4], 1.4);
    part(g, () => { g.moveTo(-12, 0); g.lineTo(-14, -50); g.quadraticCurveTo(0, -58, 14, -50); g.lineTo(12, 0); g.closePath(); }, coat, -14, -58, 28, 58, 1);
    px(g, -1, -50, 2, 30, mix(coat, '#FFFFFF', 0.2));
    ball(g, 0, -66, 10, skin, 1.2);
    if (i % 2 === 0) { part(g, () => g.rect(-12, -80, 24, 6), '#334155', -12, -80, 24, 6, 1); part(g, () => g.rect(-7, -88, 14, 9), '#334155', -7, -88, 14, 9, 1); px(g, -7, -82, 14, 2, '#B91C1C'); }
    else part(g, () => g.ellipse(0, -72, 10, 6, 0, Math.PI, 0), ['#141414', '#E5C158', '#5B4636', '#141414', '#A16207'][i], -10, -78, 20, 6, 1);
    slab(g, 4, -74, 18, 13, CHARCOAL); ball(g, 14, -68, 4, '#3F3F46', 1); slab(g, 10, -86, 11, 11, CHROME);
    limb(g, 8, -50, 6, -66, 4, coat);
    g.restore();
  }
};
/** Their flashes (live). */
export const drawPaparazziLive = (c: Ctx, f: number) => {
  for (let i = 0; i < 5; i++) {
    if (((f + i * 37) % 97) > 5) continue;
    const x = X(9360 + i * 64) + 15, y = GY - 80;
    c.fillStyle = 'rgba(255,255,255,0.85)'; c.beginPath(); c.arc(x, y, 7, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.3)'; c.beginPath(); c.arc(x, y, 16, 0, Math.PI * 2); c.fill();
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The lookups

const BACK_PAINT: Record<string, (g: Ctx, r: Room) => void> = {
  lobby: paintLobby, vision: paintVision, writers: paintWriters, storyboards: paintStoryboards, voice: paintVoice,
  models: paintModels, overseas: paintOverseas, inkpaint: paintInkpaint, camera: paintCamera, premiere: paintPremiere,
};
const PROP_PAINT: Record<string, ((g: Ctx) => void) | undefined> = {
  lobby: paintLobbyProps, vision: paintVisionProps, writers: paintWritersProps, storyboards: paintStoryboardsProps,
  voice: paintVoiceProps, models: paintModelsProps, inkpaint: paintInkpaintProps, camera: paintCameraProps,
};
/** Each room's back wall, its clutter over it (clutter.ts). */
export const BACKS: Record<string, (g: Ctx, r: Room) => void> = Object.fromEntries(Object.entries(BACK_PAINT).map(([id, fn]) => [id, (g: Ctx, r: Room) => { fn(g, r); WALL_EXTRAS[id as RoomId]?.(g, r); }]));
/** Each room's tableau, the clutter in it (clutter.ts) behind. */
export const PROPS: Record<string, ((g: Ctx) => void) | undefined> = Object.fromEntries(Object.keys(BACK_PAINT).filter(id => PROP_EXTRAS[id as RoomId] || PROP_PAINT[id]).map(id => [id, (g: Ctx) => { PROP_EXTRAS[id as RoomId]?.(g); PROP_PAINT[id]?.(g); }]));
/** What changes the back wall's look (the lobby's doors show the hour). */
export const backKey = (id: string) => (id === 'lobby' ? timeOfDay().key : '');

// ---------------------------------------------------------------------------------------------------------------
// The signs: each room's placard on its brass stand; the lobby's marquee

/** Where each room's placard stands (from its start): clear of what's on the path and what's behind it. */
const PLACARD_AT: Partial<Record<string, number>> = { camera: 460, premiere: 30 };
export const placardX = (r: Room) => X(r.a + (PLACARD_AT[r.id] ?? 150));
/** A film-frame placard on a brass stand (its foot at the path's back edge): the room's number and name. */
export const paintPlacard = (g: Ctx, r: Room) => {
  const title = `${r.num}. ${r.name}`, look = park(1), w = Math.max(120, signW(title, look) + 30);
  box(g, -4, -152, 8, 152, INK); box(g, -3, -151, 6, 150, GOLD[3]); box(g, -3, -151, 2, 150, GOLD[5]); box(g, 1, -151, 2, 150, GOLD[1]);
  part(g, () => g.ellipse(0, -2, 18, 5, 0, 0, Math.PI * 2), '#B08A3A', -18, -7, 36, 10, 1.2);
  box(g, -w / 2 - 1, -197, w + 2, 52, INK); bands(g, -w / 2, -196, w, 50, [CHARCOAL[3], CHARCOAL[2], CHARCOAL[1]]);
  for (let k = -w / 2 + 6; k < w / 2 - 6; k += 12) { box(g, k, -192, 6, 5, '#E5E7EB'); box(g, k, -155, 6, 5, '#E5E7EB'); box(g, k, -192, 6, 1, '#FFFFFF'); }
  bands(g, -w / 2 + 6, -184, w - 12, 26, [PURPLE[4], PURPLE[3], PURPLE[2]]);
  txt(g, title, 0, -167, look);
};
export const placardW = (r: Room) => Math.max(120, signW(`${r.num}. ${r.name}`, park(1)) + 30);
/** The lobby's marquee (hung on chains): LEARN THE MAGIC OF HOW CARTOONS ARE MADE, EST. 1994. */
export const paintMarquee = (g: Ctx) => {
  box(g, -192, -2, 384, 104, INK);
  bands(g, -190, 0, 380, 100, [CHARCOAL[3], CHARCOAL[2], CHARCOAL[1]]);
  for (let k = -182; k < 180; k += 16) { box(g, k, 5, 9, 7, '#E5E7EB'); box(g, k, 88, 9, 7, '#E5E7EB'); box(g, k, 5, 9, 1, '#FFFFFF'); }
  bands(g, -180, 16, 360, 68, [PURPLE[4], PURPLE[3], PURPLE[2], PURPLE[1]]);
  checker(g, -180, 16, 360, 68, PURPLE[2], 0, 2);
  txt(g, 'LEARN THE MAGIC OF', 0, 38, park(2));
  txt(g, 'HOW CARTOONS ARE MADE', 0, 60, park(2));
  txt(g, 'EST. 1994', 0, 78, park(1, ['#FFFFFF', '#FCE7F3', '#F9A8D4', '#EC4899']));
};
export const MARQUEE = { x: X(470), y: Y(400) };
