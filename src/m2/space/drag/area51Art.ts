// ALIEN GIFTS & NOVELTIES, painted (area51.ts runs it): the "top secret government containment" past Space Needle 2's
// lobby, dressed up (badly) as a souvenir shop. The square's kit (peak SNES: ramps, banded, dithered; still art painted
// once into a stamp by the hour, only what moves drawn live).
//
//   THE FRONT   mint stucco over a blast-proof plinth (the old stencil, TOP SECRET GOVERNMENT CONTAINMENT, showing
//               through the coat of paint), the googie board ALIEN GIFTS & NOVELTIES with a waving cartoon alien, the
//               IMPORTED FROM AREA 51! board, the windows painted black (CLOSED FOR INVENTORY taped up, a scratched
//               peephole with a glow behind it), a bench with a man in black's sunglasses left on it, a dish on the
//               roof, the door's steel jamb in hazard stripes, a retina scanner duct-taped on beside it, the razor-wire
//               fence at the street's end with its NO GOVERNMENT HERE placard. Live: the door itself (two feet of
//               riveted steel with a PUSH sticker, a CLOSED sign and a shop bell; rattles when rammed, swings open once
//               it's picked) and the security camera, turning to watch him.
//   THE ROOM    behind it, a screen and three quarters wide (the camera follows him: the owner's "maybe make it scroll
//               just a bit too"): an institutional bunker under fluorescent tubes, a duct and a cable tray along its
//               ceiling. BAY 1, the autopsy end: MKULTRA OVERFLOW, the cover-up plan's whiteboard, a dissected grey on
//               the autopsy table under its lamp (toe-tagged PROPERTY OF THE US GOV'T), the moon landing set (TAKE 47),
//               the CHARGE SHARD in a containment jar on its pedestal. The pier (BAY 2 REVERSE ENGINEERING). BAY 2: TOP
//               SECRET cabinets, the saucer engine on the wall (DO NOT LICK) over its transformer, the workbench (a ray
//               gun in the vise) under a shelf of jars (JFK?), the consoles and their blueprint, a chunk of crashed
//               saucer (EVIDENCE #2), crates of ray guns, the TV with FAKE NEWS on, up clear of every sign. Background,
//               all of it: dimmed, no lit tops (nothing in there reads as somewhere to stand); the floor's lip lit.
//   THE LOCK    the minigame's close-up (screen space): the brass lock body cut away, five pin chambers, the springs,
//               the tumblers, his meaty hand with the bobby pin under them, the tension wrench.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { GY } from '../geometry';
import { type Ctx, INK, box, checker, poly, mix, still, inView, board, ramp6, slab, words, ball, chromePole, starburst, lit, CHROME, CONCRETE, ORANGE } from '../square/paint';
import { stamp } from '../../intro/art/kit';
import { drawShardGem } from '../../hollywood/coaster/plunge';
import { X, STORE, A51_DOOR, ROOM, STREET1 } from './layout';

const SW = STORE.b - STORE.a, WALL_H = 200;
/** The door (local to the store's left): its left, width, top. */
const DL = A51_DOOR - STORE.a - 32, DW = 64, DT = -130;
const MINT = ramp6('#BDEFD8'), STEEL = ['#1A1E26', '#2C323E', '#444C5C', '#636D80', '#8C96A8', '#B8C0CE', '#E2E7EE'];
const GREEN = ramp6('#6BD66B');

// ---------------------------------------------------------------------------------------------------------------
// The front

/** A little green man (the store's mascot, waving): a big head, black eyes, a grin. */
const mascot = (g: Ctx, x: number, y: number, s: number) => {
  const G = GREEN;
  // (the waving arm, the body)
  g.strokeStyle = INK; g.lineWidth = 5 * s; g.lineCap = 'round'; g.beginPath(); g.moveTo(x + 8 * s, y + 18 * s); g.lineTo(x + 22 * s, y + 4 * s); g.lineTo(x + 26 * s, y - 8 * s); g.stroke();
  g.strokeStyle = G[3]; g.lineWidth = 3 * s; g.beginPath(); g.moveTo(x + 8 * s, y + 18 * s); g.lineTo(x + 22 * s, y + 4 * s); g.lineTo(x + 26 * s, y - 8 * s); g.stroke();
  g.lineCap = 'butt';
  for (const [dx, k] of [[-3, 1], [-2, 2], [-1, 3]] as const) { g.fillStyle = k === 1 ? INK : G[k]; g.beginPath(); g.ellipse(x + dx * 0.3 * s, y + 24 * s, (11 - k) * s, 12 * s, 0, 0, Math.PI * 2); g.fill(); }
  // (the head: an upside-down egg, stepped, lit up and left)
  const head = (rx: number, ry: number, col: string, ox = 0, oy = 0) => { g.fillStyle = col; g.beginPath(); g.ellipse(x + ox, y + oy, rx, ry, 0, 0, Math.PI * 2); g.fill(); };
  head(17 * s, 15 * s, INK); head(15.5 * s, 13.5 * s, G[1]); head(14 * s, 12 * s, G[2], -1 * s, -1 * s); head(10 * s, 8 * s, G[3], -3 * s, -3 * s); head(4 * s, 3 * s, G[5], -7 * s, -7 * s);
  // (the eyes: big, black, almond, a glint each)
  for (const sd of [-1, 1]) { g.fillStyle = INK; g.beginPath(); g.ellipse(x + sd * 6 * s, y + 1 * s, 5 * s, 3.2 * s, sd * 0.5, 0, Math.PI * 2); g.fill(); box(g, x + sd * 6 * s - 2 * s, y - 1 * s, 1.5 * s, 1.5 * s, '#FFFFFF'); }
  // (the grin)
  g.strokeStyle = INK; g.lineWidth = 1.5 * s; g.beginPath(); g.arc(x, y + 6 * s, 4 * s, 0.2, Math.PI - 0.2); g.stroke();
  // (antennae, bobbles)
  for (const sd of [-1, 1]) { g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(x + sd * 5 * s, y - 12 * s); g.lineTo(x + sd * 10 * s, y - 22 * s); g.stroke(); ball(g, x + sd * 10 * s, y - 23 * s, 2.5 * s, '#FDE047'); }
};

/** A strip of silver duct tape (a quad from (x0,y0) to (x1,y1), `w` wide): lit along one edge, its torn end. */
const tape = (g: Ctx, x0: number, y0: number, x1: number, y1: number, w = 5) => {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = (-dy / L) * w / 2, ny = (dx / L) * w / 2;
  poly(g, [[x0 + nx, y0 + ny], [x1 + nx, y1 + ny], [x1 - nx, y1 - ny], [x0 - nx, y0 - ny]], '#9CA3AF');
  poly(g, [[x0 + nx, y0 + ny], [x1 + nx, y1 + ny], [x1 + nx * 0.4, y1 + ny * 0.4], [x0 + nx * 0.4, y0 + ny * 0.4]], '#D1D5DB');
  for (let k = 0.15; k < 1; k += 0.22) box(g, x0 + dx * k, y0 + dy * k, 1, 1, '#6B7280');
};

/** Hazard stripes (yellow and black, slanted) in a box. */
const hazard = (g: Ctx, x: number, y: number, w: number, h: number) => {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  box(g, x, y, w, h, '#EAB308');
  g.fillStyle = '#1C1917';
  for (let k = -h; k < w + h; k += 10) { g.beginPath(); g.moveTo(x + k, y + h); g.lineTo(x + k + 5, y + h); g.lineTo(x + k + 5 + h, y); g.lineTo(x + k + h, y); g.fill(); }
  box(g, x, y, 1, h, 'rgba(255,255,255,0.25)');
  g.restore();
};

/** The front (still: everything but the door's slab and the camera). Local: x from the store's left, y up from the
 *  ground (negative), the fence out past its right end to the street's. */
const paintFront = (g: Ctx) => {
  const R = MINT, w = SW, h = WALL_H, on = lit();
  // THE WALL: mint stucco, banded, stippled; lit down its left, shaded down its right
  box(g, -2, -h - 2, w + 4, h + 2, INK);
  slab(g, 0, -h, w, h, R, false);
  for (let y = -h + 4; y < -44; y += 6) for (let x = (y * 7) % 11 + 4; x < w - 6; x += 13) box(g, x, y, 1, 1, R[2]);
  checker(g, 0, -h + 34, w, 2, R[2], 0, 2);
  // (a patch where the stucco's come off: riveted armor plate under it)
  poly(g, [[222, -86], [262, -92], [270, -62], [254, -50], [226, -56]], INK);
  poly(g, [[224, -84], [260, -89], [267, -63], [253, -52], [228, -58]], STEEL[3]);
  box(g, 226, -80, 38, 1, STEEL[2]); box(g, 228, -72, 36, 1, STEEL[5]); for (const [rx, ry] of [[232, -82], [252, -84], [236, -62], [256, -64]]) { box(g, rx, ry, 2, 2, STEEL[1]); box(g, rx, ry, 1, 1, STEEL[6]); }
  // (the trim band along the top: green, lit, studs)
  box(g, 0, -h + 18, w, 9, INK); box(g, 0, -h + 19, w, 7, GREEN[2]); box(g, 0, -h + 19, w, 2, GREEN[4]); box(g, 0, -h + 25, w, 1, GREEN[0]);
  for (let x = 6; x < w - 4; x += 14) box(g, x, -h + 21, 2, 2, GREEN[5]);
  // THE PLINTH: bare blast concrete; the old stencil on it, rollered over in mint (it shows through)
  const C = CONCRETE;
  box(g, 0, -44, w, 44, C[3]); box(g, 0, -44, w, 2, C[5]); box(g, 0, -42, w, 1, C[4]); checker(g, 0, -10, w, 4, C[2], 0, 1); box(g, 0, -6, w, 6, C[2]);
  for (let x = 40; x < w; x += 60) box(g, x, -42, 1, 42, C[1]);
  words(g, 'TOP SECRET GOVERNMENT CONTAINMENT', 146, -17, '#2E2E36', 8);
  // (the roller's coat over it: streaky, a strip of it missed: TOP SECRET and CONTAINMENT still show)
  g.globalAlpha = 0.6;
  for (const [x0, x1, y0] of [[96, 196, -30], [118, 176, -16], [4, 40, -32], [258, 286, -30]] as const) { box(g, x0, y0, x1 - x0, 9, R[3]); box(g, x0, y0, x1 - x0, 1, R[4]); checker(g, x1 - 6, y0, 6, 9, R[3], 0, 1); }
  g.globalAlpha = 1;
  // THE WINDOWS: painted black (the brush's strokes in it), a chrome frame; the left one CLOSED FOR INVENTORY, the right
  // one scratched clear at a spot: a green glow in there and something yellow and round with a black trefoil on it
  for (const wx of [18, 112]) {
    box(g, wx - 3, -157, 86, 106, INK); box(g, wx - 2, -156, 84, 104, CHROME[4]); box(g, wx - 2, -156, 84, 1, CHROME[6]);
    box(g, wx, -154, 80, 100, '#0B0B12');
    for (let k = 0; k < 9; k++) box(g, wx + 2, -150 + k * 11, 76, 3, k % 2 ? '#14141E' : '#101018');
    box(g, wx + 6, -150, 2, 92, 'rgba(255,255,255,0.08)');
    // (the sill)
    box(g, wx - 4, -52, 88, 5, INK); box(g, wx - 3, -51, 86, 3, CHROME[3]); box(g, wx - 3, -51, 86, 1, CHROME[5]);
  }
  // (the paper sign, taped)
  box(g, 30, -128, 56, 40, INK); box(g, 31, -127, 54, 38, '#F5F5F0'); box(g, 31, -127, 54, 3, '#FFFFFF'); box(g, 31, -92, 54, 3, '#D8D6CC');
  words(g, 'CLOSED', 58, -114, '#B91C1C', 6); words(g, 'FOR', 58, -105, '#1F2937', 5); words(g, 'INVENTORY', 58, -97, '#B91C1C', 5);
  for (const [tx, ty] of [[28, -130], [80, -130], [28, -91], [80, -91]]) { box(g, tx, ty, 9, 5, '#E7E2C8'); box(g, tx, ty, 9, 1, '#FFFFFF'); }
  // (the scratched peephole)
  poly(g, [[140, -118], [160, -122], [166, -104], [148, -98]], '#0F2A14');
  poly(g, [[142, -116], [158, -119], [163, -106], [149, -101]], '#3EE06A');
  ball(g, 152, -110, 4, '#FACC15', false); box(g, 151, -111, 2, 2, INK); box(g, 149, -108, 2, 1, INK); box(g, 154, -108, 2, 1, INK);
  g.strokeStyle = '#2A2A36'; g.lineWidth = 1; g.beginPath(); g.moveTo(138, -124); g.lineTo(168, -100); g.moveTo(144, -96); g.lineTo(162, -124); g.stroke();
  // THE BOARDS: IMPORTED FROM AREA 51! under the trim, on yellow with starbursts
  board(g, 156, -h + 46, 'IMPORTED FROM AREA 51!', '#FDE047', '#B91C1C', 8, 7, false, 'small');
  starburst(g, 20, -h + 46, 9, '#F472B6'); starburst(g, 262, -h + 46, 9, '#22D3EE');
  // (a little OPEN 24 HOURS that's been crossed out: NEVER)
  board(g, 250, -126, 'OPEN 24 HRS', '#0F172A', '#F87171', 6, 4, false, 'small');
  g.strokeStyle = '#FDE047'; g.lineWidth = 2; g.beginPath(); g.moveTo(218, -132); g.lineTo(282, -120); g.stroke();
  words(g, 'NEVER', 250, -104, '#FDE047', 6, INK);
  // THE BENCH against the wall under the windows (back there: dimmed, a flat seat, no lit lip) and the sunglasses on it
  const bench = mix('#7C5A3A', '#3A4A78', 0.32);
  box(g, 34, -30, 120, 6, INK); box(g, 35, -29, 118, 4, bench); box(g, 35, -27, 118, 1, mix(bench, INK, 0.3));
  for (const lx of [42, 142]) { box(g, lx, -24, 4, 24, INK); box(g, lx + 1, -24, 2, 24, mix(bench, INK, 0.25)); }
  // (the shades: two black lenses, a bridge, a glint: somebody in a suit was just here)
  for (const lx of [94, 106]) { box(g, lx, -36, 10, 6, INK); box(g, lx + 1, -35, 8, 4, '#1A1A24'); box(g, lx + 2, -35, 3, 1, '#9AA6C0'); }
  box(g, 104, -35, 2, 1, INK); box(g, 90, -35, 4, 1, INK); box(g, 116, -35, 4, 1, INK);
  // THE DOOR'S JAMB: two feet of steel, hazard-striped, bolted into the wall; the lintel; a shop bell on a bracket; the
  // lock (a dinky brass cylinder: the one he picks) on the slab is the slab's
  box(g, DL - 12, DT - 14, DW + 24, -DT + 14, INK);
  hazard(g, DL - 10, DT - 12, 9, -DT + 12); hazard(g, DL + DW + 1, DT - 12, 9, -DT + 12); hazard(g, DL - 10, DT - 12, DW + 20, 9);
  box(g, DL - 1, DT - 2, DW + 2, -DT + 2, '#05050A');
  for (const by of [DT + 10, -60, -14]) for (const bx of [DL - 6, DL + DW + 5]) { box(g, bx - 1, by, 3, 3, STEEL[1]); box(g, bx - 1, by, 1, 1, STEEL[6]); }
  // (the scanner, taped on: a beige box, a red eye, SCAN EYE, the tape every which way)
  const sx = DL + DW + 16;
  box(g, sx - 1, -97, 20, 34, INK); box(g, sx, -96, 18, 32, '#D6CFB8'); box(g, sx, -96, 18, 2, '#F0EBD8'); box(g, sx + 15, -96, 3, 32, '#A8A08A');
  box(g, sx + 3, -90, 12, 10, '#1A1A24'); ball(g, sx + 9, -85, 3, '#EF4444', false); box(g, sx + 7, -87, 1, 1, '#FFFFFF');
  for (let k = 0; k < 3; k++) box(g, sx + 4 + k * 4, -74, 2, 2, '#4A4A50');
  tape(g, sx - 4, -100, sx + 22, -64, 5); tape(g, sx + 22, -98, sx - 4, -66, 5); tape(g, sx - 6, -80, sx + 24, -82, 4);
  words(g, 'SCAN EYE', sx + 9, -54, '#1F2937', 5);
  // (the keycard reader over it: a black box, the card slot, a thumbprint pad, a keypad's worth of buttons; serious)
  box(g, sx - 2, -136, 22, 34, INK); box(g, sx - 1, -135, 20, 32, '#27272A'); box(g, sx - 1, -135, 20, 2, '#52525B');
  box(g, sx + 3, -131, 12, 3, '#05050A'); box(g, sx + 3, -131, 12, 1, '#71717A');
  for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) { box(g, sx + 2 + k * 5, -124 + r * 5, 4, 3, '#3F3F46'); box(g, sx + 2 + k * 5, -124 + r * 5, 4, 1, '#A1A1AA'); }
  ball(g, sx + 9, -107, 3, '#64748B', false);
  words(g, 'CARD', sx + 9, -139, '#1F2937', 4);
  // (a cable from it to nowhere: unplugged, the plug on the ground)
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(sx + 9, -64); g.quadraticCurveTo(sx + 14, -30, sx + 4, -4); g.stroke(); box(g, sx, -6, 8, 5, '#3A3A40');
  // (the camera's bracket over the door: the camera itself is live)
  box(g, DL + DW + 4, DT - 46, 4, 34, INK); box(g, DL + DW + 5, DT - 46, 2, 34, STEEL[4]);
  // THE ROOF: a satellite dish, an antenna or two (a gift shop with a dish on it)
  const dx = 372;
  box(g, dx - 2, -h - 22, 4, 22, INK); box(g, dx - 1, -h - 22, 2, 22, STEEL[4]);
  g.fillStyle = INK; g.beginPath(); g.ellipse(dx, -h - 34, 22, 14, -0.5, 0, Math.PI * 2); g.fill();
  g.fillStyle = STEEL[5]; g.beginPath(); g.ellipse(dx, -h - 34, 20, 12, -0.5, 0, Math.PI * 2); g.fill();
  g.fillStyle = STEEL[3]; g.beginPath(); g.ellipse(dx + 3, -h - 32, 14, 8, -0.5, 0, Math.PI * 2); g.fill();
  g.strokeStyle = INK; g.lineWidth = 1.5; g.beginPath(); g.moveTo(dx, -h - 34); g.lineTo(dx + 14, -h - 52); g.stroke(); ball(g, dx + 14, -h - 53, 2, '#EF4444');
  for (const ax of [404, 420]) { box(g, ax, -h - 40 + (ax % 3) * 6, 2, 40 - (ax % 3) * 6, INK); box(g, ax - 4, -h - 34 + (ax % 3) * 6, 10, 1, INK); }
  // THE BIG BOARD up on the roof on chrome legs: ALIEN GIFTS & NOVELTIES in green neon, the mascot waving by it
  for (const px of [60, 250]) chromePole(g, px, -h - 34, -h, 4);
  board(g, 160, -h - 48, 'ALIEN GIFTS & NOVELTIES', '#0B1B10', on ? '#9BFFA0' : '#4ADE80', 10, 8, true, 'neon');
  mascot(g, 300, -h - 50, 1.25);
  // THE FENCE at the street's end (in front, at the play plane): chain-link on posts, razor wire coiled along its top,
  // NO GOVERNMENT HERE hung on it
  const f0 = DL + DW + 44, f1 = STREET1 - STORE.a + 8, top = -236;
  for (const px of [f0, (f0 + f1) / 2, f1]) chromePole(g, px, top, 0, 5, STEEL);
  g.save(); g.beginPath(); g.rect(f0, top + 6, f1 - f0, -top - 8); g.clip();
  g.fillStyle = 'rgba(20, 26, 34, 0.28)'; g.fillRect(f0, top + 6, f1 - f0, -top);
  g.strokeStyle = STEEL[4]; g.lineWidth = 1;
  for (let k = -260; k < 120; k += 9) { g.beginPath(); g.moveTo(f0 + k, top); g.lineTo(f0 + k + 240, top + 240); g.moveTo(f0 + k + 240, top); g.lineTo(f0 + k, top + 240); g.stroke(); }
  g.restore();
  box(g, f0, top + 4, f1 - f0, 3, INK); box(g, f0, top + 5, f1 - f0, 1, STEEL[5]);
  for (let x = f0 - 4; x < f1 + 4; x += 7) { g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(x, top - 4, 6, 0, Math.PI * 2); g.stroke(); g.strokeStyle = STEEL[5]; g.lineWidth = 1; g.beginPath(); g.arc(x, top - 4, 6, Math.PI, Math.PI * 1.6); g.stroke(); box(g, x + 4, top - 10, 2, 2, STEEL[6]); }
  board(g, (f0 + f1) / 2, -128, 'NO\nGOVERNMENT\nHERE', '#F8FAFC', '#B91C1C', 6, 5, false);
  board(g, (f0 + f1) / 2, -72, 'KEEP OUT', '#EAB308', '#1C1917', 5, 4, false);
};

/** The door's slab (live): `open` 0 shut .. 1 swung all the way in; `jolt` its rattle (px). */
const drawSlab = (c: Ctx, x0: number, open: number, jolt: number, f: number) => {
  const x = x0 + DL, top = GY + DT;
  if (open <= 0) {
    const jx = jolt > 0.5 ? Math.round((f % 2 ? 1 : -1) * jolt) : 0;
    const S = STEEL;
    box(c, x + jx, top, DW, -DT, INK);
    box(c, x + 1 + jx, top + 1, DW - 2, -DT - 1, S[3]);
    box(c, x + 1 + jx, top + 1, 3, -DT - 1, S[5]); box(c, x + DW - 5 + jx, top + 1, 4, -DT - 1, S[2]); checker(c, x + DW - 8 + jx, top + 1, 3, -DT - 1, S[2], 0, 1);
    // (its plates, riveted)
    for (const py of [top + 30, top + 66, top + 102]) { box(c, x + 2 + jx, py, DW - 4, 1, S[1]); box(c, x + 2 + jx, py + 1, DW - 4, 1, S[5]); for (let k = 6; k < DW - 4; k += 9) box(c, x + k + jx, py - 4, 2, 2, S[1]); }
    // (the cheap shop bits stuck on it: PUSH, the CLOSED sign on its string, the dinky lock)
    box(c, x + 8 + jx, top + 40, 24, 10, INK); box(c, x + 9 + jx, top + 41, 22, 8, '#F8FAFC'); words(c, 'PUSH', x + 20 + jx, top + 48, '#B91C1C', 5);
    c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 22 + jx, top + 6); c.lineTo(x + 14 + jx, top + 16); c.moveTo(x + 22 + jx, top + 6); c.lineTo(x + 40 + jx, top + 16); c.stroke();
    const sw = Math.sin(f * 0.05) * (1 + jolt);
    box(c, x + 10 + jx + sw, top + 15, 34, 14, INK); box(c, x + 11 + jx + sw, top + 16, 32, 12, '#DC2626'); words(c, 'CLOSED', x + 27 + jx + sw, top + 25, '#FFFFFF', 5);
    box(c, x + DW - 16 + jx, top + 72, 10, 12, INK); box(c, x + DW - 15 + jx, top + 73, 8, 10, '#CA8A04'); box(c, x + DW - 15 + jx, top + 73, 8, 2, '#FDE047'); box(c, x + DW - 12 + jx, top + 76, 2, 4, INK);
    box(c, x + DW - 20 + jx, top + 88, 16, 4, INK); box(c, x + DW - 19 + jx, top + 89, 14, 2, '#D4A017');
    // (the bell over it, jangling when it's shaken)
    const bj = jolt > 0.5 ? Math.sin(f * 1.3) * 3 : 0;
    ball(c, x + DW / 2 + bj, top - 4, 3, '#EAB308');
  } else {
    // Swung in: the doorway dark, the room's fluorescent light coming out of it, the slab edge-on at the hinge (left)
    box(c, x, top, DW, -DT, '#0C1410');
    for (let k = 0; k < 4; k++) box(c, x + 6 + k * 3, top + 4, DW - 12 - k * 6, -DT - 4, `rgba(200, 255, 220, ${0.05 + k * 0.03})`);
    box(c, x + 10, top + 8, DW - 20, -DT - 10, 'rgba(200, 255, 220, 0.12)');
    // (the floor of the room's light thrown out onto the walk)
    c.fillStyle = 'rgba(210, 255, 225, 0.14)'; c.beginPath(); c.moveTo(x, GY); c.lineTo(x + DW, GY); c.lineTo(x + DW + 18, GY + 12); c.lineTo(x - 18, GY + 12); c.fill();
    const ww = Math.round(DW * (1 - open * 0.82));
    poly(c, [[x, top], [x + ww, top + 10 * open], [x + ww, GY - 4 * open], [x, GY]], INK);
    poly(c, [[x + 1, top + 1], [x + ww - 1, top + 10 * open + 1], [x + ww - 1, GY - 4 * open - 1], [x + 1, GY - 1]], STEEL[2]);
    box(c, x + 1, top + 1, 3, -DT - 2, STEEL[4]);
    // (its edge: two feet thick, banded)
    box(c, x + ww - 1, top + 10 * open, 6, -DT - 14 * open, STEEL[1]); box(c, x + ww, top + 10 * open, 2, -DT - 14 * open, STEEL[3]);
  }
};

/** The security camera over the door (live), turned toward `look` (world x). */
const drawCam = (c: Ctx, x0: number, look: number, f: number) => {
  const bx = x0 + DL + DW + 6, by = GY + DT - 46;
  const a = Math.max(-0.9, Math.min(0.9, (look - bx) / 300)), dir = a < 0 ? -1 : 1;
  const len = 20 - Math.abs(a) * 6;
  c.save(); c.translate(bx, by);
  box(c, -3, -3, 6, 6, INK); box(c, -2, -2, 4, 4, STEEL[3]);
  // (the body: a box going toward where it looks, its lens)
  const ex = dir * len;
  poly(c, [[0, -6], [ex, -4], [ex, 6], [0, 5]], INK);
  poly(c, [[0, -5], [ex - dir, -3], [ex - dir, 5], [0, 4]], '#E5E7EB');
  poly(c, [[0, -5], [ex - dir, -3], [ex - dir, -1], [0, -2]], '#FFFFFF');
  box(c, ex - (dir > 0 ? 3 : 0), -3, 3, 7, '#111827'); box(c, ex - (dir > 0 ? 2 : -1), -1, 1, 2, '#60A5FA');
  // (REC: the red light blinking)
  if (f % 50 < 30) box(c, dir * 4 - 1, -4, 2, 2, '#EF4444');
  c.restore();
};

/** The bent paperclip lying on the walk by the door (till he's picked it up): silver wire, a glint now and then to catch
 *  the eye. Live (tiny), drawn over the walk. */
export const drawClip = (c: Ctx, x: number, f: number) => {
  const y = GY + 3;
  const pts: [number, number][] = [[x - 7, y], [x + 5, y], [x + 7, y - 2], [x + 5, y - 4], [x - 5, y - 4], [x - 6, y - 3], [x - 5, y - 2], [x + 2, y - 2], [x + 9, y - 6], [x + 12, y - 5]];
  for (const [w, col] of [[3, INK], [1.5, '#C8CCD4']] as const) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); pts.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py))); c.stroke(); }
  if (f % 70 < 8) { box(c, x + 1, y - 9, 1, 7, '#FFFFFF'); box(c, x - 2, y - 6, 7, 1, '#FFFFFF'); }
};
/** Over the door (live): the access panel, ACCESS DENIED flashing red the whole time, open or shut (none of the fancy
 *  security does anything: the paperclip opened it); faster once it's open. */
const drawDenied = (c: Ctx, x0: number, open: number, f: number) => {
  const x = x0 + DL + 2, y = GY + DT - 30, w = DW - 4, on = (f % (open > 0 ? 16 : 50)) < (open > 0 ? 9 : 34);
  box(c, x - 1, y - 1, w + 2, 12, INK); box(c, x, y, w, 10, '#120606');
  if (on) { box(c, x, y, w, 10, '#3A0A0A'); words(c, 'ACCESS DENIED', x + w / 2, y + 8, '#FF3B3B', 5); }
  box(c, x + w - 4, y + 2, 2, 2, on ? '#FF3B3B' : '#4A1010');
};
/** The store, on the walk (drawn with the shops). `open` the door's swing (0..1), `jolt` its rattle, `look` the camera's
 *  target. */
export const drawStore = (c: Ctx, state: GameState, open: number, jolt: number, look: number) => {
  const x0 = X(STORE.a);
  if (!inView(state, x0 - 60, X(STREET1) + 60)) return;
  still(c, 'spc-a51-front', x0, GY, -12, -WALL_H - 110, SW + 140, WALL_H + 112, paintFront);
  drawSlab(c, x0, open, jolt, state.frame);
  drawDenied(c, x0, open, state.frame);
  drawCam(c, x0, look, state.frame);
};
/** The store's block (its side going back, in with the street's: art.ts). */
export const STORE_BLOCK = { x0: X(STORE.a), x1: X(STORE.b), top: GY - WALL_H, bottom: GY, col: '#BDEFD8', noTop: true };
/** Its sign's glow after dark (green), and the doorway's once it's open. */
export const storeLamps = (open: boolean) => [
  { x: X(STORE.a) + 160, y: GY - WALL_H - 48, r: 210, a: 0.8, color: '#86EFAC' },
  ...(open ? [{ x: X(A51_DOOR), y: GY - 60, r: 120, a: 0.8, color: '#D1FAE5' }] : []),
];

// ---------------------------------------------------------------------------------------------------------------
// The room

/** Where the room's things are (local x from the room's left): what he's walked past for his lines, and the shard. */
export const ROOM_AT = { exit: 70, cabinet: 160, board: 240, grey: 300, moon: 510, shard: 600, engine: 870, jars: 980, crates: 1336, tv: 1270 } as const;
const RW = ROOM.b - ROOM.a;
/** Back there: pulled toward the wall's color (nothing in here reads as somewhere to stand). */
const back = (col: string) => mix(col, '#3E4A48', 0.22);
/** The pier between the two bays (local x, width). */
const PIER = 700, PIER_W = 44;
/** The fluorescent fittings (local x): the second one blinks, the fifth one buzzes. */
const TUBES = [130, 390, 600, 880, 1120, 1330];
/** The TV's screen (local: its top left; 80 x 62). */
const TV = { x: 1258, y: -406 };
/** The engine's core (local). */
const CORE = { x: 870, y: -310 };

/** Cables drooping from (x0, y0) to (x1, y1), sagging `sag`: inked, colored, a glint. */
const cable = (g: Ctx, x0: number, y0: number, x1: number, y1: number, sag: number, col: string, w = 3) => {
  const mx = (x0 + x1) / 2, my = Math.max(y0, y1) + sag;
  for (const [lw, c2] of [[w + 2, INK], [w, col], [1, mix(col, '#FFFFFF', 0.35)]] as const) {
    g.strokeStyle = c2; g.lineWidth = lw; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(mx, my, x1, y1); g.stroke();
  }
};

/** A government filing cabinet, `n` drawers (`x`, its width, its height), the drawers' white card slots. */
const cabinet = (g: Ctx, x: number, w: number, h: number, n: number, col: string) => {
  const R = ramp6(back(col));
  box(g, x - 2, -h - 2, w + 4, h + 2, INK); slab(g, x, -h, w, h, R, true);
  for (let k = 0; k < n; k++) {
    const y = -h + 4 + (k * (h - 6)) / n, dh = (h - 6) / n;
    box(g, x + 3, y + dh - 2, w - 6, 2, R[1]); box(g, x + 3, y + dh - 3, w - 6, 1, R[4]);
    box(g, x + w / 2 - 9, y + dh * 0.45, 18, 4, INK); box(g, x + w / 2 - 8, y + dh * 0.45 + 1, 16, 2, '#D4D8DE');
    box(g, x + w / 2 - 7, y + dh * 0.15, 14, 6, INK); box(g, x + w / 2 - 6, y + dh * 0.15 + 1, 12, 4, '#F5F5F0');
  }
  box(g, x - 3, -h - 4, w + 6, 6, INK); box(g, x - 2, -h - 3, w + 4, 4, R[2]);
};

const paintRoom = (g: Ctx) => {
  const W = RW;
  // THE WALLS: institutional green painted block, banded darker down toward the wainscot (lit from the tubes), dithered
  // between the bands; the second bay's back wall riveted steel plate; government beige below; the ceiling, its duct,
  // its cable tray
  const WALL = ['#2E3B36', '#38473F', '#425349', '#4C5F53', '#566A5D', '#5F7466'];
  for (let k = 0; k < 6; k++) box(g, 0, -506 + k * 65, PIER, 66, WALL[5 - k]);
  for (let k = 0; k < 5; k++) checker(g, 0, -506 + (k + 1) * 65 - 3, PIER, 6, WALL[4 - k], k % 2, 2);
  for (let y = -500; y < -120; y += 20) {
    box(g, 0, y, PIER, 1, 'rgba(10, 20, 16, 0.22)');
    for (let x = (Math.abs(y / 20) % 2 ? 0 : 24); x < PIER; x += 48) box(g, x, y, 1, 19, 'rgba(10, 20, 16, 0.18)');
  }
  const SP = ['#232A33', '#2C3440', '#363F4D', '#414B5B', '#4C5769', '#586478'];
  const bx0 = PIER + PIER_W;
  for (let k = 0; k < 6; k++) box(g, bx0, -506 + k * 65, W - bx0, 66, SP[5 - k]);
  for (let k = 0; k < 5; k++) checker(g, bx0, -506 + (k + 1) * 65 - 3, W - bx0, 6, SP[4 - k], k % 2, 2);
  for (let x = bx0 + 48; x < W; x += 96) {
    box(g, x, -506, 2, 386, '#1A2028'); box(g, x + 2, -506, 1, 386, '#5E6A7E');
    for (let y = -496; y < -126; y += 40) { box(g, x + 6, y, 3, 3, '#1A2028'); box(g, x + 6, y, 2, 2, '#7A879C'); box(g, x - 7, y, 3, 3, '#1A2028'); box(g, x - 7, y, 2, 2, '#7A879C'); }
  }
  for (let y = -506 + 130; y < -120; y += 130) { box(g, bx0, y, W - bx0, 2, '#1A2028'); box(g, bx0, y + 2, W - bx0, 1, '#6A768A'); }
  // (the glow down the wall under each tube: stepped, banded)
  for (const fx of TUBES) for (let k = 0; k < 4; k++) { g.fillStyle = `rgba(220, 255, 235, ${0.035 + k * 0.012})`; g.fillRect(fx - 120 + k * 26, -500, 240 - k * 52, 260 - k * 50); }
  // (grime: streaks down from the ceiling, dithered)
  for (const sx of [60, 330, 560, 790, 1040, 1270]) for (let k = 0; k < 3; k++) checker(g, sx + k * 3, -500, 2, 90 - k * 26, 'rgba(10, 14, 12, 0.35)', k % 2, 1);
  // (the wainscot: beige, its rail, its panels; scuffed)
  box(g, 0, -120, W, 120, '#8A7F66'); box(g, 0, -120, W, 3, '#A89C80'); box(g, 0, -117, W, 1, '#6E6450'); checker(g, 0, -18, W, 6, '#6E6450', 0, 1); box(g, 0, -12, W, 12, '#5E5644');
  for (let x = 0; x < W; x += 64) { box(g, x, -117, 1, 105, '#7A705A'); box(g, x + 1, -117, 1, 105, '#9A8E72'); }
  for (let x = 20; x < W; x += 137) checker(g, x, -40, 26, 10, '#6E6450', 1, 2);
  // (the ceiling: dark, the big duct along it, ribbed; the cable tray under it; the fittings. Over it, solid poured
  // slab right up past the top of the picture: nothing of the street's sky shows over the room (the owner's: "make sure
  // the secret facility in future land with the shard has a ceiling"))
  box(g, -40, -900, W + 80, 340, '#141A17'); checker(g, -40, -600, W + 80, 40, '#1C2420', 0, 2); box(g, 0, -566, W, 6, '#2A332E');
  box(g, 0, -560, W, 54, '#1C2420'); box(g, 0, -508, W, 2, '#0E1210');
  box(g, 0, -552, W, 22, INK); box(g, 0, -551, W, 20, '#5C646E'); box(g, 0, -551, W, 4, '#8A939E'); box(g, 0, -537, W, 6, '#474E58'); checker(g, 0, -541, W, 4, '#474E58', 0, 1);
  for (let x = 12; x < W; x += 28) { box(g, x, -552, 3, 22, '#3A4048'); box(g, x + 3, -552, 1, 22, '#9AA2AC'); }
  box(g, 0, -524, W, 4, INK); box(g, 0, -523, W, 2, '#6B7280');
  for (const fx of TUBES) { box(g, fx - 70, -512, 140, 10, INK); box(g, fx - 68, -511, 136, 8, '#9CA3AF'); box(g, fx - 68, -511, 136, 2, '#D1D5DB'); box(g, fx - 40, -522, 2, 10, INK); box(g, fx + 38, -522, 2, 10, INK); }
  // (cables off the tray, drooping: the framing up top)
  cable(g, 220, -520, 330, -520, 26, '#1F2937'); cable(g, 470, -520, 540, -520, 18, '#7F1D1D', 2);
  cable(g, 760, -520, 820, -520, 30, '#14532D'); cable(g, 990, -520, 1060, -520, 20, '#BE185D', 2); cable(g, 1180, -520, 1240, -520, 22, '#1F2937');
  // (the floor: linoleum checks going back, banded darker toward the wall; the lit lip along its front edge (it's what
  // he stands on); the safety line painted along it)
  box(g, 0, 0, W, 60, '#A9A288');
  for (let r = 0; r < 4; r++) { const y = r * 12; for (let x = -(r * 6) % 24; x < W; x += 24) box(g, x, y, 12, 12, r % 2 ? '#C9C2A8' : '#A9A288'); checker(g, 0, y + 10, W, 2, '#8C8670', r % 2, 1); }
  box(g, 0, 0, W, 2, '#E8E2C8');
  box(g, 0, 4, W, 2, '#CA9A08'); checker(g, 0, 6, W, 1, '#8A6A08', 0, 2);
  hazard(g, PIER - 10, 2, PIER_W + 20, 8);

  // ===== BAY 1: THE AUTOPSY END =====
  // A FAKE SEAL (not anybody's real one), DEPARTMENT OF NORMAL STORES under it
  ball(g, 560, -402, 26, '#1E3A8A'); ball(g, 560, -402, 20, '#F8FAFC', false); ball(g, 560, -402, 12, '#CA8A04', false);
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; box(g, 560 + Math.cos(a) * 16 - 1, -402 + Math.sin(a) * 16 - 1, 2, 2, '#1E3A8A'); }
  words(g, '51', 560, -398, '#1E3A8A', 8);
  board(g, 560, -356, 'DEPARTMENT OF NORMAL STORES', '#1E3A8A', '#FDE68A', 6, 5, false);
  // THE WAY OUT: the inside of the blast door, ajar, EXIT (TO THE GIFT SHOP) over it; its frame hazard-banded
  box(g, 26, -138, 92, 138, INK); hazard(g, 28, -136, 88, 6);
  box(g, 34, -130, 76, 130, '#0E1612');
  for (let k = 0; k < 3; k++) box(g, 40 + k * 4, -124, 64 - k * 8, 124, `rgba(255, 220, 160, ${0.05 + k * 0.03})`);
  poly(g, [[34, -130], [52, -122], [52, -6], [34, 0]], STEEL[3]); box(g, 34, -130, 3, 130, STEEL[5]);
  for (let k = 0; k < 5; k++) box(g, 42, -116 + k * 24, 6, 3, STEEL[1]);
  board(g, 72, -152, 'EXIT (TO GIFT SHOP)', '#15803D', '#F0FDF4', 5, 4, false);
  // MKULTRA OVERFLOW: a filing cabinet, four drawers, files piled on top, spilling
  cabinet(g, 130, 60, 148, 4, '#8C929C');
  for (let k = 0; k < 6; k++) { box(g, 130 + k * 10, -162 - (k % 3) * 2, 8, 12, k % 2 ? '#F5E6B8' : '#E8D9A8'); box(g, 130 + k * 10, -162 - (k % 3) * 2, 8, 1, '#FFF8DC'); }
  box(g, 196, -14, 14, 2, '#F5E6B8'); box(g, 186, -8, 12, 2, '#E8D9A8'); box(g, 205, -6, 10, 2, '#F5F5F0');
  board(g, 160, -186, 'MKULTRA\nOVERFLOW', '#F5F5F0', '#1F2937', 5, 3, false);
  // THE COVER-UP PLAN: a whiteboard, aluminum frame, marker tray
  box(g, 108, -372, 216, 146, INK); box(g, 110, -370, 212, 142, '#C8CED6'); box(g, 110, -370, 212, 2, '#E8ECF0'); box(g, 113, -367, 206, 136, '#F4F6F8'); checker(g, 113, -240, 206, 6, '#E2E6EA', 0, 1);
  words(g, 'COVER-UP PLAN', 216, -350, '#DC2626', 7);
  g.font = '6px "Press Start 2P"'; g.textAlign = 'left';
  g.fillStyle = '#1D4ED8'; g.fillText('1. DISGUISE AS', 122, -330); g.fillText('   GIFT SHOP', 122, -320);
  g.fillStyle = '#16A34A'; g.fillText('v', 230, -320);
  g.fillStyle = '#1D4ED8'; g.fillText('2. ???', 122, -304);
  g.fillText('3. NOBODY CHECKS', 122, -288);
  g.fillStyle = '#DC2626'; g.fillText('LOCK: $4.99', 122, -268);
  g.textAlign = 'left';
  // (the doodles: a saucer with NOT REAL and an arrow; a crude dick somebody added)
  g.strokeStyle = '#111827'; g.lineWidth = 1.5;
  g.beginPath(); g.ellipse(282, -320, 22, 6, 0, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(282, -323, 9, Math.PI, 0); g.stroke();
  words(g, 'NOT REAL', 282, -300, '#DC2626', 5);
  g.beginPath(); g.moveTo(282, -306); g.lineTo(282, -312); g.stroke();
  g.strokeStyle = '#7C3AED'; g.beginPath(); g.ellipse(282, -258, 5, 3, 0, 0, Math.PI * 2); g.ellipse(292, -258, 5, 3, 0, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.moveTo(287, -260); g.lineTo(287, -276); g.arc(290, -276, 3, Math.PI, 0); g.lineTo(293, -260); g.stroke();
  box(g, 140, -230, 40, 4, '#9CA3AF'); box(g, 150, -232, 10, 3, '#DC2626'); box(g, 162, -232, 10, 3, '#1D4ED8');
  // THE AUTOPSY TABLE: steel on legs (back there), the grey laid out on it, opened up, his toe tagged; its lamp
  const stl = back('#A8B0BC');
  // (hung clear of the whiteboard: its cord past the board's right edge)
  const lp = 346;
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(lp, -506); g.lineTo(lp, -176); g.stroke();
  poly(g, [[lp - 28, -176], [lp + 28, -176], [lp + 38, -160], [lp - 38, -160]], INK); poly(g, [[lp - 26, -175], [lp + 26, -175], [lp + 34, -162], [lp - 34, -162]], '#6B7280'); box(g, lp - 32, -163, 64, 2, '#FEF9C3');
  g.fillStyle = 'rgba(254, 249, 195, 0.07)'; g.beginPath(); g.moveTo(lp - 34, -160); g.lineTo(lp + 34, -160); g.lineTo(390, -64); g.lineTo(210, -64); g.fill();
  for (const lx of [222, 362]) { box(g, lx, -54, 6, 54, INK); box(g, lx + 1, -54, 4, 54, mix(stl, INK, 0.3)); box(g, lx - 3, -4, 12, 4, INK); }
  box(g, 214, -54, 168, 2, INK); box(g, 216, -40, 164, 3, mix(stl, INK, 0.4));
  box(g, 210, -64, 176, 12, INK); box(g, 212, -63, 172, 10, stl); box(g, 212, -63, 172, 1, mix(stl, '#FFFFFF', 0.08)); box(g, 212, -55, 172, 2, mix(stl, INK, 0.3));
  box(g, 296, -30, 8, 24, INK); box(g, 297, -29, 6, 22, '#52525B');
  const GR = ['#3E4A4E', '#5C6A6E', '#7A8A8C', '#98A8A8', '#B6C4C2'];
  g.fillStyle = INK; g.beginPath(); g.ellipse(244, -82, 24, 18, -0.2, 0, Math.PI * 2); g.fill();
  g.fillStyle = GR[2]; g.beginPath(); g.ellipse(244, -82, 22, 16, -0.2, 0, Math.PI * 2); g.fill();
  g.fillStyle = GR[3]; g.beginPath(); g.ellipse(240, -87, 15, 9, -0.2, 0, Math.PI * 2); g.fill();
  box(g, 234, -92, 4, 2, GR[4]);
  g.fillStyle = INK; g.beginPath(); g.ellipse(250, -80, 8, 4, 0.5, 0, Math.PI * 2); g.fill(); box(g, 246, -82, 2, 1, '#FFFFFF');
  box(g, 262, -78, 60, 16, INK); box(g, 263, -77, 58, 14, GR[2]); box(g, 263, -77, 58, 3, GR[3]);
  box(g, 276, -76, 30, 9, '#7F1D1D'); box(g, 278, -75, 26, 6, '#B91C1C'); box(g, 282, -74, 8, 4, '#4ADE80'); box(g, 294, -74, 6, 3, '#F9A8D4');
  g.strokeStyle = '#1F2937'; g.lineWidth = 1; g.beginPath(); g.moveTo(272, -77); g.lineTo(291, -70); g.lineTo(310, -77); g.moveTo(291, -70); g.lineTo(291, -63); g.stroke();
  poly(g, [[320, -80], [378, -78], [382, -64], [318, -64]], INK); poly(g, [[321, -79], [376, -77], [380, -65], [320, -65]], '#E5E7EB'); box(g, 322, -79, 54, 2, '#FFFFFF');
  for (let k = 0; k < 4; k++) box(g, 330 + k * 12, -74, 1, 9, '#C8CCD2');
  box(g, 378, -80, 8, 6, INK); box(g, 379, -79, 6, 4, GR[3]);
  g.strokeStyle = INK; g.beginPath(); g.moveTo(384, -76); g.lineTo(398, -60); g.stroke();
  board(g, 404, -48, "PROPERTY OF\nTHE US GOV'T", '#F5E6B8', '#7F1D1D', 5, 3, false);
  // (a tray of his bits on a stand by the table)
  box(g, 182, -84, 26, 6, INK); box(g, 183, -83, 24, 4, stl); ball(g, 190, -88, 4, '#4ADE80', false); ball(g, 199, -87, 3, '#F472B6', false);
  box(g, 194, -78, 2, 78, INK); box(g, 186, -4, 18, 4, INK);
  // THE MOON LANDING SET: a black curtain with painted stars on its rail, a gray mound of a moon, the flag on its coat
  // hanger, a lander out of gold foil and cardboard, the clapperboard TAKE 47; the studio light over by the pier
  const mx = 30;
  box(g, 418 + mx, -230, 124, 230, INK); box(g, 420 + mx, -228, 120, 228, '#0B0B14');
  for (let k = 0; k < 22; k++) box(g, 424 + mx + (k * 37) % 112, -222 + (k * 53) % 180, k % 4 ? 1 : 2, k % 4 ? 1 : 2, '#E5E7EB');
  for (let k = 0; k < 6; k++) box(g, 420 + mx + k * 20, -228, 2, 228, '#14141E');
  box(g, 416 + mx, -236, 128, 6, INK); box(g, 417 + mx, -235, 126, 4, '#52525B');
  const mn = ['#4A4A50', '#6A6A70', '#8A8A90', '#AAAAAE', '#CACACC'];
  g.fillStyle = INK; g.beginPath(); g.ellipse(478 + mx, -2, 70, 22, 0, Math.PI, 0); g.fill();
  for (const [r, k] of [[68, 1], [58, 2], [40, 3]] as const) { g.fillStyle = mn[k]; g.beginPath(); g.ellipse(478 + mx - (68 - r) * 0.3, -2, r, 20 * r / 68, 0, Math.PI, 0); g.fill(); }
  for (const [cx, cy] of [[450, -10], [500, -14], [474, -6]]) { g.fillStyle = mn[1]; g.beginPath(); g.ellipse(cx + mx, cy, 6, 2, 0, 0, Math.PI * 2); g.fill(); }
  box(g, 484 + mx, -84, 40, 30, INK); box(g, 485 + mx, -83, 38, 28, '#CA8A04'); checker(g, 485 + mx, -83, 38, 28, '#EAB308', 0, 2); box(g, 485 + mx, -83, 38, 3, '#FDE047');
  box(g, 498 + mx, -78, 12, 14, '#1F2937'); box(g, 490 + mx, -96, 28, 13, INK); box(g, 491 + mx, -95, 26, 11, '#D4D4D8');
  for (const [lx, fx] of [[486, 476], [520, 532]]) { g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(lx + mx, -56); g.lineTo(fx + mx, -22); g.stroke(); box(g, fx + mx - 4, -24, 8, 3, INK); }
  words(g, 'U.S.A', 504 + mx, -60, '#1E3A8A', 5);
  box(g, 440 + mx, -110, 2, 96, INK);
  for (let k = 0; k < 7; k++) box(g, 442 + mx, -108 + k * 4, 34, 4, k % 2 ? '#F8FAFC' : '#DC2626');
  box(g, 442 + mx, -108, 14, 14, '#1E3A8A'); for (let k = 0; k < 6; k++) box(g, 444 + mx + (k % 3) * 4, -106 + Math.floor(k / 3) * 5, 1, 1, '#FFFFFF');
  g.strokeStyle = '#9CA3AF'; g.lineWidth = 1; g.beginPath(); g.moveTo(441 + mx, -110); g.lineTo(478 + mx, -110); g.lineTo(474 + mx, -114); g.stroke();
  box(g, 424 + mx, -34, 34, 26, INK); box(g, 425 + mx, -33, 32, 24, '#18181B');
  for (let k = 0; k < 4; k++) box(g, 425 + mx + k * 8, -33, 4, 5, '#F8FAFC');
  words(g, 'MOON', 441 + mx, -21, '#F8FAFC', 5); words(g, 'TAKE 47', 441 + mx, -12, '#F8FAFC', 4);
  board(g, 480 + mx, -252, 'MOON LANDING (1969)', '#18181B', '#E5E7EB', 5, 4, false);
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(672, -100); g.lineTo(660, 0); g.moveTo(672, -100); g.lineTo(684, 0); g.moveTo(672, -100); g.lineTo(672, 0); g.stroke();
  poly(g, [[662, -126], [682, -118], [682, -96], [662, -104]], INK); poly(g, [[663, -124], [681, -117], [681, -98], [663, -105]], '#3F3F46');
  poly(g, [[663, -124], [656, -122], [656, -106], [663, -105]], '#FEF9C3');
  // THE SHARD'S PEDESTAL: a white column, a plaque, a hazard rope round it; the containment jar's on it (live)
  box(g, 578, -46, 44, 46, INK); slab(g, 580, -44, 40, 44, ramp6(back('#E5E7EB')), false); box(g, 574, -50, 52, 6, INK); box(g, 575, -49, 50, 4, back('#E5E7EB'));
  board(g, 600, -22, 'ITEM 51-C', '#CA8A04', '#1C1917', 5, 2, false);
  for (const px of [556, 644]) { box(g, px - 2, -40, 4, 40, INK); box(g, px - 1, -40, 2, 40, '#EAB308'); box(g, px - 4, -2, 8, 2, INK); }
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(556, -38); g.quadraticCurveTo(568, -28, 578, -32); g.moveTo(622, -32); g.quadraticCurveTo(634, -28, 644, -38); g.stroke();
  g.strokeStyle = '#EAB308'; g.lineWidth = 1; g.beginPath(); g.moveTo(556, -38); g.quadraticCurveTo(568, -28, 578, -32); g.moveTo(622, -32); g.quadraticCurveTo(634, -28, 644, -38); g.stroke();

  // ===== THE PIER: concrete, banded, the bay's sign held up on it =====
  const PR = ramp6(back(CONCRETE[3]));
  box(g, PIER - 2, -506, PIER_W + 4, 506, INK); slab(g, PIER, -506, PIER_W, 506, PR, true);
  for (let y = -480; y < -40; y += 64) { box(g, PIER + 4, y, PIER_W - 8, 1, PR[1]); box(g, PIER + 4, y + 1, PIER_W - 8, 1, PR[4]); }
  hazard(g, PIER, -60, PIER_W, 20);
  board(g, PIER + PIER_W / 2, -300, 'BAY 2\nREVERSE\nENGINEERING', '#1C1917', '#FDE047', 5, 4, false);

  // ===== BAY 2: THE REVERSE ENGINEERING END =====
  // TOP SECRET: two filing cabinets by the pier, the label taped across them
  cabinet(g, 756, 40, 128, 4, '#7C8A6A'); cabinet(g, 800, 40, 128, 4, '#7C8A6A');
  board(g, 798, -148, 'TOP SECRET', '#F5F5F0', '#B91C1C', 5, 3, false);
  // THE SAUCER ENGINE on the wall: a disc cut in half on a steel frame, coils, cables down to its transformer; DO NOT
  // LICK over it (its core glows: live)
  const ex = CORE.x;
  box(g, ex - 53, -360, 6, 128, INK); box(g, ex - 52, -360, 4, 128, '#52525B'); box(g, ex + 47, -360, 6, 128, INK); box(g, ex + 48, -360, 4, 128, '#52525B');
  g.fillStyle = INK; g.beginPath(); g.ellipse(ex, -310, 62, 20, 0, 0, Math.PI * 2); g.fill();
  const sc = ['#3A3F52', '#565D78', '#7A84A0', '#A4AEC8', '#D0D8EC'];
  g.fillStyle = sc[2]; g.beginPath(); g.ellipse(ex, -310, 60, 18, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = sc[3]; g.beginPath(); g.ellipse(ex - 5, -314, 44, 9, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = sc[4]; g.beginPath(); g.ellipse(ex - 12, -316, 22, 3, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = sc[1]; g.beginPath(); g.ellipse(ex, -303, 56, 8, 0, 0, Math.PI); g.fill();
  for (let k = -3; k <= 3; k++) { box(g, ex + k * 15 - 2, -298, 4, 6, INK); box(g, ex + k * 15 - 1, -297, 2, 4, '#B45309'); }
  for (const cx of [ex - 43, ex + 43]) for (let k = 0; k < 6; k++) { box(g, cx - 5, -344 + k * 6, 10, 4, INK); box(g, cx - 4, -343 + k * 6, 8, 2, '#B87333'); }
  cable(g, ex - 13, -292, ex - 6, -74, 10, '#1F2937'); cable(g, ex + 13, -292, ex + 10, -74, -6, '#7F1D1D');
  board(g, ex, -382, 'REVERSE ENGINEERED: DO NOT LICK', '#FEF08A', '#7F1D1D', 5, 3, false);
  // (its transformer on the floor under it: a gray box, its fins, the hazard band, DANGER)
  box(g, ex - 26, -74, 52, 74, INK); slab(g, ex - 24, -72, 48, 72, ramp6(back('#6B7280')), true);
  for (let k = 0; k < 5; k++) box(g, ex - 20 + k * 9, -66, 4, 30, '#3F4652');
  hazard(g, ex - 24, -32, 48, 6);
  words(g, 'DANGER', ex, -14, '#FDE047', 5, INK);
  // THE WORKBENCH: a ray gun stripped down in a vise, its bits laid out, a desk lamp; the pegboard of tools behind it
  const bx = 912, bw = 128;
  box(g, bx, -200, bw, 112, INK); box(g, bx + 2, -198, bw - 4, 108, back('#B08A5A'));
  for (let y = -192; y < -92; y += 8) for (let x = bx + 6; x < bx + bw - 4; x += 8) box(g, x, y, 1, 1, back('#6A4E2E'));
  for (const [tx, kind] of [[928, 0], [948, 1], [970, 2], [994, 0], [1014, 1], [1030, 2]] as const) {
    if (kind === 0) { box(g, tx - 1, -186, 3, 30, INK); box(g, tx - 4, -186, 9, 6, '#B91C1C'); }
    else if (kind === 1) { box(g, tx - 1, -184, 2, 34, '#9CA3AF'); box(g, tx - 4, -152, 8, 4, '#9CA3AF'); }
    else { g.strokeStyle = '#9CA3AF'; g.lineWidth = 2; g.beginPath(); g.arc(tx, -170, 7, 0.3, Math.PI * 1.7); g.stroke(); }
  }
  box(g, bx - 4, -70, bw + 8, 10, INK); box(g, bx - 2, -69, bw + 4, 8, back('#8B5E34')); box(g, bx - 2, -69, bw + 4, 1, back('#9A6A3E'));
  for (const lx of [bx + 4, bx + bw - 10]) { box(g, lx, -60, 6, 60, INK); box(g, lx + 1, -60, 4, 60, back('#6B4A2A')); }
  box(g, bx + 4, -26, bw - 8, 4, INK);
  box(g, 940, -86, 22, 16, INK); box(g, 941, -85, 20, 14, '#3F6212'); box(g, 936, -92, 30, 6, INK); box(g, 937, -91, 28, 4, '#65A30D');
  box(g, 952, -104, 30, 10, INK); box(g, 953, -103, 28, 8, CHROME[4]); box(g, 953, -103, 28, 2, '#DC2626'); ball(g, 984, -99, 4, '#F472B6', true);
  for (const [px, col] of [[996, '#4ADE80'], [1006, '#FDE047'], [1016, '#60A5FA']] as const) { box(g, px, -76, 6, 6, INK); box(g, px + 1, -75, 4, 4, col); }
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(1030, -70); g.lineTo(1020, -100); g.lineTo(1034, -118); g.stroke();
  poly(g, [[1026, -126], [1044, -118], [1038, -108], [1022, -114]], INK); poly(g, [[1027, -124], [1042, -118], [1037, -110], [1024, -115]], '#15803D');
  g.fillStyle = 'rgba(254, 249, 195, 0.12)'; g.beginPath(); g.moveTo(1024, -112); g.lineTo(1038, -108); g.lineTo(1010, -70); g.lineTo(970, -70); g.fill();
  // THE JARS on a shelf up over the bench: a brain (JFK?), an eye, a toe
  const shelf = back('#7C5A3A');
  box(g, 912, -230, 132, 6, INK); box(g, 913, -229, 130, 4, shelf);
  for (const sx of [918, 1034]) box(g, sx, -224, 4, 14, INK);
  for (const [jx, what, lbl] of [[940, 'brain', 'JFK?'], [980, 'eye', 'EYE SPY'], [1020, 'toe', 'BIGFOOT']] as const) {
    box(g, jx - 17, -278, 34, 48, INK); box(g, jx - 16, -277, 32, 46, '#3F5F3A'); box(g, jx - 16, -277, 32, 46, 'rgba(180, 230, 160, 0.35)');
    checker(g, jx - 16, -246, 32, 14, 'rgba(30, 60, 30, 0.35)', 0, 2);
    box(g, jx - 18, -284, 36, 8, INK); box(g, jx - 17, -283, 34, 6, '#9CA3AF'); box(g, jx - 17, -283, 34, 2, '#D1D5DB');
    if (what === 'brain') { ball(g, jx, -262, 10, '#F9A8D4', false); g.strokeStyle = '#BE185D'; g.lineWidth = 1; g.beginPath(); g.moveTo(jx - 6, -266); g.quadraticCurveTo(jx - 2, -260, jx + 2, -266); g.quadraticCurveTo(jx + 5, -258, jx + 8, -262); g.moveTo(jx, -272); g.lineTo(jx, -254); g.stroke(); }
    if (what === 'eye') { ball(g, jx, -260, 7, '#F8FAFC', false); ball(g, jx + 1, -260, 3, '#2563EB', false); box(g, jx, -261, 2, 2, INK); g.strokeStyle = '#DC2626'; g.beginPath(); g.moveTo(jx - 7, -260); g.lineTo(jx - 12, -252); g.stroke(); }
    if (what === 'toe') { box(g, jx - 6, -266, 12, 18, '#8B6B4A'); box(g, jx - 6, -266, 12, 4, '#D4B48A'); box(g, jx - 4, -267, 8, 3, '#A16207'); }
    box(g, jx - 20, -247, 40, 13, INK); box(g, jx - 19, -246, 38, 11, '#F5F5F0'); words(g, lbl, jx, -237, '#1F2937', 5);
    box(g, jx - 14, -276, 3, 28, 'rgba(255,255,255,0.3)');
  }
  // THE CONSOLES: a bank of them, tape reels, the screen (live), a slanted desk of lights and switches
  const cx0 = 1050, cw = 90;
  box(g, cx0, -170, cw, 170, INK); slab(g, cx0 + 2, -168, cw - 4, 168, ramp6(back('#9CA3AF')), true);
  for (const [rx, ry] of [[cx0 + 24, -148], [cx0 + 66, -148]]) { ball(g, rx, ry, 13, '#3F3F46'); ball(g, rx, ry, 5, '#A1A1AA', false); box(g, rx - 1, ry - 12, 2, 24, '#18181B'); }
  box(g, cx0 + 8, -128, cw - 16, 40, INK); box(g, cx0 + 10, -126, cw - 20, 36, '#05140A');
  poly(g, [[cx0 - 6, -76], [cx0 + cw + 6, -76], [cx0 + cw + 10, -60], [cx0 - 10, -60]], INK); poly(g, [[cx0 - 5, -75], [cx0 + cw + 5, -75], [cx0 + cw + 8, -61], [cx0 - 8, -61]], back('#6B7280'));
  for (let k = 0; k < 8; k++) { box(g, cx0 + 2 + k * 11, -72, 5, 5, INK); box(g, cx0 + 3 + k * 11, -71, 3, 3, ['#DC2626', '#FDE047', '#22C55E', '#F8FAFC'][k % 4]); }
  for (let k = 0; k < 6; k++) { box(g, cx0 + 8 + k * 13, -54, 6, 10, INK); box(g, cx0 + 9 + k * 13, -53, 4, 4, '#D4D4D8'); }
  // (the blueprint taped up over them: the saucer in white line, SAUCER: HOW?)
  const bpx = 1050, bpy = -300;
  box(g, bpx, bpy, 90, 76, INK); box(g, bpx + 1, bpy + 1, 88, 74, '#1E40AF'); checker(g, bpx + 1, bpy + 1, 88, 60, '#1D3A9E', 0, 2);
  for (let k = 1; k < 6; k++) { box(g, bpx + 1 + k * 15, bpy + 1, 1, 60, 'rgba(147, 197, 253, 0.35)'); box(g, bpx + 1, bpy + 1 + k * 11, 88, 1, 'rgba(147, 197, 253, 0.35)'); }
  g.strokeStyle = '#E0F2FE'; g.lineWidth = 1; g.beginPath(); g.ellipse(bpx + 45, bpy + 32, 32, 8, 0, 0, Math.PI * 2); g.moveTo(bpx + 31, bpy + 28); g.arc(bpx + 45, bpy + 28, 14, Math.PI, 0); g.stroke();
  box(g, bpx + 1, bpy + 62, 88, 13, '#F8FAFC'); words(g, 'SAUCER: HOW?', bpx + 45, bpy + 72, '#1E3A8A', 5);
  for (const tx of [bpx + 2, bpx + 80]) box(g, tx, bpy - 2, 8, 5, 'rgba(245, 230, 184, 0.9)');
  board(g, 1150, -392, 'AREA 51: GIFT SHOP ANNEX\n(STAFF ONLY)', '#7F1D1D', '#FEF3C7', 5, 4, false);
  // THE CRASHED SAUCER: a chunk of its hull rim-first in the floor, scorched, its portholes; a tarp half off it; the
  // evidence tag on its string; the posts round it. Back there: dimmed, no lit top
  const hull = ramp6(back('#8C96A8'));
  g.fillStyle = INK; g.beginPath(); g.moveTo(1150, 0); g.quadraticCurveTo(1170, -150, 1286, -132); g.lineTo(1296, 0); g.fill();
  g.fillStyle = hull[2]; g.beginPath(); g.moveTo(1154, -2); g.quadraticCurveTo(1174, -144, 1284, -128); g.lineTo(1292, -2); g.fill();
  g.fillStyle = hull[3]; g.beginPath(); g.moveTo(1172, -2); g.quadraticCurveTo(1190, -118, 1282, -110); g.lineTo(1288, -2); g.fill();
  checker(g, 1176, -60, 100, 58, hull[2], 0, 2);
  for (const [px, py] of [[1196, -80], [1228, -96], [1260, -100]]) { ball(g, px, py, 7, '#1F2937'); ball(g, px - 1, py - 1, 4, '#67E8F9', false); box(g, px - 3, py - 4, 2, 2, '#ECFEFF'); }
  checker(g, 1152, -40, 60, 40, 'rgba(20, 14, 10, 0.55)', 1, 1); checker(g, 1270, -132, 24, 60, 'rgba(20, 14, 10, 0.5)', 0, 1);
  poly(g, [[1236, -126], [1290, -134], [1300, -60], [1282, -40], [1266, -70], [1246, -100]], INK);
  poly(g, [[1238, -124], [1288, -131], [1297, -62], [1283, -44], [1268, -72], [1248, -102]], back('#4D7C0F'));
  for (let k = 0; k < 4; k++) box(g, 1256 + k * 9, -118 + k * 16, 18, 1, back('#365314'));
  g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(1180, -112); g.lineTo(1168, -96); g.stroke();
  board(g, 1168, -84, 'EVIDENCE\n#2', '#FDE047', '#1C1917', 5, 3, false);
  for (const px of [1140, 1300]) { box(g, px - 2, -34, 4, 34, INK); box(g, px - 1, -34, 2, 34, '#EAB308'); }
  // THE CRATES of ray guns (back against the wall: dimmed, no lit tops): stencilled; the top one open, guns poking up
  const crate = back('#9A7442'), CR = ramp6(crate);
  for (const [cx, cy, cw2, ch] of [[1310, -66, 80, 66], [1318, -124, 64, 58]] as const) {
    box(g, cx - 1, cy - 1, cw2 + 2, ch + 1, INK); box(g, cx, cy, cw2, ch, CR[2]);
    for (let k = 1; k < 4; k++) box(g, cx, cy + (ch * k) / 4, cw2, 1, CR[1]);
    box(g, cx, cy, 4, ch, CR[3]); box(g, cx + cw2 - 4, cy, 4, ch, CR[1]);
    g.strokeStyle = CR[1]; g.lineWidth = 3; g.beginPath(); g.moveTo(cx + 4, cy + 4); g.lineTo(cx + cw2 - 4, cy + ch - 4); g.stroke();
  }
  for (const [sx2, sy2] of [[1350, -34], [1350, -96]]) { ball(g, sx2, sy2, 9, back('#7F1D1D'), false); ball(g, sx2, sy2, 6, CR[2], false); box(g, sx2 - 1, sy2 - 9, 2, 18, back('#7F1D1D')); box(g, sx2 - 9, sy2 - 1, 18, 2, back('#7F1D1D')); }
  board(g, 1350, -176, 'RAY GUNS\nDO NOT SELL\nIN GIFT SHOP', '#F5E6B8', '#7F1D1D', 5, 3, false);
  for (let k = 0; k < 4; k++) { const gx = 1328 + k * 12, gy = -138 - (k % 2) * 6; box(g, gx - 1, gy - 1, 8, 16, INK); box(g, gx, gy, 6, 14, CHROME[4]); box(g, gx, gy, 6, 3, '#DC2626'); ball(g, gx + 3, gy - 2, 3, '#F472B6', true); }
  // THE TV, wall-mounted up in the corner on its bracket, clear of every sign (what's on it is live)
  box(g, TV.x + 38, -436, 4, 26, INK);
  box(g, TV.x - 8, -414, 104, 82, INK); box(g, TV.x - 6, -412, 100, 78, '#27272A'); box(g, TV.x - 6, -412, 100, 3, '#3F3F46');
  box(g, TV.x, -406, 80, 62, '#05050A');
  box(g, TV.x + 84, -404, 6, 6, '#52525B'); box(g, TV.x + 84, -394, 6, 6, '#52525B'); box(g, TV.x + 85, -380, 4, 2, '#22C55E');
  // (the room's far end: the corner, in shadow)
  box(g, W - 8, -506, 8, 506, '#151A20'); checker(g, W - 14, -506, 6, 506, '#151A20', 0, 1);
  void ORANGE; void CANVAS_HEIGHT;
};

/** The room (drawn over everything behind it: it's the whole screen while he's in there). `shard`: still in its jar. */
export const drawRoom = (c: Ctx, state: GameState, shard: boolean, taken: number) => {
  const x0 = X(ROOM.a), f = state.frame;
  if (!inView(state, x0, X(ROOM.b), 0)) return;
  still(c, 'spc-a51-room3', x0, GY, -40, -900, RW + 80, 980, paintRoom);
  // (the tubes: one of them on the blink, one buzzing, as they always are in a place like this)
  TUBES.forEach((fx, k) => {
    if (!inView(state, x0 + fx - 180, x0 + fx + 180, 0)) return;
    const on = k === 1 ? (f % 170 > 6 && f % 170 < 150) || (f % 170 > 154 && f % 170 < 160) : k === 4 ? f % 47 !== 3 && f % 47 !== 5 : true;
    box(c, x0 + fx - 64, GY - 506, 128, 3, on ? '#F0FFF4' : '#5A6460');
    if (on) { c.fillStyle = 'rgba(220, 255, 230, 0.06)'; c.beginPath(); c.moveTo(x0 + fx - 64, GY - 503); c.lineTo(x0 + fx + 64, GY - 503); c.lineTo(x0 + fx + 170, GY); c.lineTo(x0 + fx - 170, GY); c.fill(); }
  });
  // (the saucer engine's core: a slow purple throb)
  const th = 0.5 + 0.5 * Math.sin(f * 0.07), ex = x0 + CORE.x, ey = GY + CORE.y;
  for (const [r, a] of [[30, 0.1], [20, 0.16], [11, 0.3]] as const) { c.fillStyle = `rgba(192, 132, 252, ${a * (0.6 + th * 0.6)})`; c.beginPath(); c.ellipse(ex, ey, r * 1.8, r * 0.6, 0, 0, Math.PI * 2); c.fill(); }
  box(c, ex - 10, ey - 3, 20, 5, th > 0.5 ? '#F5D0FE' : '#C084FC');
  // (the consoles: the lights chasing, the screen's readout)
  const cx0 = x0 + 1050;
  for (let k = 0; k < 8; k++) if ((Math.floor(f / 9) + k * 3) % 5 === 0) box(c, cx0 + 3 + k * 11, GY - 71, 3, 3, '#FFFFFF');
  const sx = cx0 + 10, sy = GY - 126;
  c.fillStyle = '#4ADE80'; c.font = '5px "Press Start 2P"'; c.textAlign = 'left';
  c.fillText('SETI: 0 HITS', sx + 3, sy + 10); c.fillText('SAUCER: NO', sx + 3, sy + 20);
  if (f % 60 < 40) c.fillText('LOCK: OK', sx + 3, sy + 30);
  box(c, sx, sy + ((f * 0.5) % 36), 70, 2, 'rgba(74, 222, 128, 0.15)');
  // (the TV: FAKE NEWS, an anchor's head and shoulders, the crawl going by, a roll bar)
  const tx = x0 + TV.x, ty = GY + TV.y;
  box(c, tx, ty, 80, 62, '#1E3A8A'); box(c, tx, ty, 80, 20, '#2563EB');
  box(c, tx + 30, ty + 18, 20, 30, '#111827'); ball(c, tx + 40, ty + 16, 7, '#E0B48A'); box(c, tx + 33, ty + 8, 14, 4, '#3A2A1A'); box(c, tx + 38, ty + 26, 4, 14, '#DC2626');
  box(c, tx, ty + 44, 80, 10, '#DC2626'); words(c, 'FAKE NEWS', tx + 40, ty + 52, '#FFFFFF', 6);
  box(c, tx, ty + 54, 80, 8, '#0F172A');
  c.save(); c.beginPath(); c.rect(tx, ty + 54, 80, 8); c.clip();
  c.font = '5px "Press Start 2P"'; c.fillStyle = '#FDE047'; c.fillText('ALIENS NOT REAL * MOON LANDING REAL * NOTHING IN THE GIFT SHOP * ', tx + 80 - ((f * 0.6) % 420), ty + 60);
  c.restore();
  box(c, tx, ty + ((f * 0.8) % 70) - 6, 80, 4, 'rgba(255,255,255,0.08)');
  if (f % 4 < 2) box(c, tx, ty, 80, 62, 'rgba(0,0,0,0.06)');
  // (the containment jar: glass, its lid and base hazard-banded; the shard floating in it, or not (the lid up))
  const jx = x0 + ROOM_AT.shard, jb = GY - 50;
  box(c, jx - 20, jb - 8, 40, 8, INK); hazard(c, jx - 19, jb - 7, 38, 6);
  if (shard) {
    drawShardGem(c, jx, jb - 42 + Math.sin(f * 0.06) * 4, 0.95, f);
  } else if (taken > 0 && taken < 40) {
    drawShardGem(c, jx, jb - 42 - taken * 3, 0.95 + taken * 0.01, f);
  }
  c.fillStyle = 'rgba(190, 240, 255, 0.16)'; c.fillRect(jx - 17, jb - 78, 34, 70);
  box(c, jx - 17, jb - 78, 1, 70, 'rgba(220, 250, 255, 0.5)'); box(c, jx + 16, jb - 78, 1, 70, 'rgba(120, 160, 180, 0.6)'); box(c, jx - 13, jb - 74, 3, 60, 'rgba(255,255,255,0.35)');
  const lid = shard ? 0 : 14;
  box(c, jx - 20, jb - 86 - lid, 40, 8, INK); hazard(c, jx - 19, jb - 85 - lid, 38, 6);
  if (!shard) { box(c, jx - 22, jb - 66, 44, 10, INK); box(c, jx - 21, jb - 65, 42, 8, '#F5F5F0'); words(c, 'GONE', jx, jb - 58, '#B91C1C', 5); }
};

// ---------------------------------------------------------------------------------------------------------------
// The lock (screen space)

/** What the lock's close-up needs from the minigame. */
export interface LockView {
  /** Each tumbler: how far up (0..1), set, its spring's wobble. */
  pins: { h: number; set: boolean; wob: number }[];
  /** The pick: where along (0..pins-1, eased), its tip's push up (0..1); `snap` frames into a break (its bits falling). */
  pick: number; push: number; snap: number;
  /** Picks snapped so far; the lock turning at the end (0..1); a flash for a set (frames). */
  broken: number; turn: number; flash: number;
}
const LX0 = 150, LX1 = 650, LTOP = 210, SHEAR = 380, PLUG_B = 452;
export const pinX = (i: number, n: number) => LX0 + 90 + i * ((LX1 - LX0 - 180) / Math.max(1, n - 1));
const RISE = 78;

/** The still part: the door's steel round it, the lock's brass body cut away, its chambers, the plug, the keyway. */
const paintLock = (g: Ctx, n: number) => {
  const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
  // (the door's steel, close: brushed, banded, riveted; PROPERTY OF THE U.S. GOV'T stamped on it)
  const S = STEEL;
  for (let k = 0; k < 6; k++) box(g, 0, (H * k) / 6, W, H / 6 + 1, S[5 - k > 1 ? 5 - k : 1]);
  for (let y = 0; y < H; y += 4) box(g, 0, y, W, 1, 'rgba(0,0,0,0.08)');
  for (const [rx, ry] of [[40, 40], [W - 40, 40], [40, H - 40], [W - 40, H - 40], [W / 2, 30]]) { ball(g, rx, ry, 6, S[4]); }
  words(g, "PROPERTY OF THE U.S. GOV'T", W / 2, 80, 'rgba(20,24,32,0.55)', 10);
  words(g, 'TOP SECRET LOCK. MODEL: GIFT SHOP. $4.99', W / 2, 104, 'rgba(20,24,32,0.5)', 7);
  // THE BODY: brass, cut away (its cut face hatched darker), stepped
  const B = ['#4A2E06', '#6E460C', '#966214', '#BE861E', '#E0AC38', '#F6D070', '#FFF0B8'];
  box(g, LX0 - 6, LTOP - 6, LX1 - LX0 + 12, PLUG_B - LTOP + 40, INK);
  box(g, LX0 - 4, LTOP - 4, LX1 - LX0 + 8, PLUG_B - LTOP + 36, B[1]);
  box(g, LX0, LTOP, LX1 - LX0, PLUG_B - LTOP + 28, B[3]);
  box(g, LX0, LTOP, LX1 - LX0, 4, B[5]); box(g, LX0, LTOP, 4, PLUG_B - LTOP + 28, B[4]); box(g, LX1 - 6, LTOP, 6, PLUG_B - LTOP + 28, B[2]);
  for (let y = LTOP + 8; y < PLUG_B + 24; y += 6) for (let x = LX0 + 8 + ((y / 6) % 2) * 3; x < LX1 - 8; x += 6) box(g, x, y, 1, 1, B[2]);
  // (the plug: the cylinder the key turns, its outline; the shear line between it and the body)
  box(g, LX0 + 30, SHEAR, LX1 - LX0 - 60, PLUG_B - SHEAR, INK);
  box(g, LX0 + 32, SHEAR + 2, LX1 - LX0 - 64, PLUG_B - SHEAR - 4, B[4]);
  box(g, LX0 + 32, SHEAR + 2, LX1 - LX0 - 64, 4, B[6]); box(g, LX0 + 32, PLUG_B - 10, LX1 - LX0 - 64, 8, B[2]);
  // (the keyway, a black slot along the plug's foot, open at the left)
  box(g, 0, PLUG_B - 34, LX1 - 70, 22, INK); box(g, 0, PLUG_B - 32, LX1 - 72, 18, '#0A0806');
  // THE CHAMBERS: a bore up through the body over each tumbler (dark, its sides lit and shaded)
  for (let i = 0; i < n; i++) {
    const x = pinX(i, n);
    box(g, x - 17, LTOP + 14, 34, SHEAR - LTOP - 14 + 6, INK);
    box(g, x - 15, LTOP + 16, 30, SHEAR - LTOP - 16 + 4, '#1A1206');
    box(g, x - 15, LTOP + 16, 3, SHEAR - LTOP - 12, B[2]); box(g, x + 12, LTOP + 16, 3, SHEAR - LTOP - 12, B[0]);
    // (the bore carries on down into the plug)
    box(g, x - 15, SHEAR, 30, PLUG_B - 34 - SHEAR, '#1A1206');
    words(g, String(i + 1), x, LTOP + 6, B[0], 7);
  }
  // (the shear line marked: the line the tumblers have to clear)
  for (let x = LX0 + 32; x < LX1 - 32; x += 8) box(g, x, SHEAR - 1, 4, 1, '#FDE68A');
};

/** A bent wire along `pts`: inked, steel, a glint. */
const wireOn = (c: Ctx, pts: [number, number][]) => {
  for (const [w, col] of [[5, INK], [3, '#A1A1AA'], [1, '#F4F4F5']] as const) {
    c.strokeStyle = col; c.lineWidth = w; c.lineJoin = 'round'; c.lineCap = 'round';
    c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  }
  c.lineJoin = 'miter'; c.lineCap = 'butt';
};
/** The paperclip's base shapes, baked (0: coiled up as it came, both loops; to 1: its inner loop unbent, straightened
 *  out up and away past his fingers, the wire fed in). */
export const CLIP_STEPS = 7;
const CLIP_COILED: [number, number][] = [[96, 0], [40, 0], [30, -8], [30, -20], [40, -28], [112, -28], [122, -20], [122, -10], [112, -4], [52, -4], [46, -10], [46, -16], [52, -20], [100, -20]];
const CLIP_OPEN: [number, number][] = [[96, 0], [40, 0], [30, -8], [30, -20], [40, -28], [70, -34], [92, -44], [108, -56], [118, -70], [125, -84], [130, -98], [133, -110], [135, -120], [136, -128]];
/** A base `k` 0..1 unfurled: the outer turn stays in his fingers; past it the wire eases from the coil to the straight,
 *  the far end first (the bend works back along it as it opens). */
export const clipBase = (k: number, ky: number): [number, number][] => CLIP_COILED.map(([x0, y0], i) => {
  const [x1, y1] = CLIP_OPEN[i];
  const lag = Math.max(0, (i - 4) / (CLIP_COILED.length - 5));
  const u = Math.max(0, Math.min(1, k * 1.6 - (1 - lag) * 0.6)), e = u * u * (3 - 2 * u);
  return [x0 + (x1 - x0) * e, ky + y0 + (y1 - y0) * e];
});

/** The lock's close-up, over the whole screen. */
export const drawLock = (c: Ctx, v: LockView, f: number) => {
  const n = v.pins.length;
  c.save();
  stamp(c, `spc-a51-lock-${n}`, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, g => paintLock(g, n));
  // (the plug turning at the end: it shades over, the keyway tilting)
  if (v.turn > 0) { c.fillStyle = `rgba(20, 12, 4, ${0.35 * v.turn})`; c.fillRect(LX0 + 32, SHEAR + 2, LX1 - LX0 - 64, PLUG_B - SHEAR - 4); }
  // THE TUMBLERS: each a spring (top) pressing a driver pin (steel) on a key pin (brass) that rides on the pick
  for (let i = 0; i < n; i++) {
    const p = v.pins[i], x = pinX(i, n);
    const up = p.h * RISE + (p.set ? 0 : Math.sin(f * 0.9) * p.wob * 3);
    const keyB = PLUG_B - 30 - up, keyT = keyB - 46, drvT = keyT - 40;
    // (the spring, squashed as the pins go up: zigzag)
    const sTop = LTOP + 18, sBot = drvT;
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(x, sTop);
    const coils = 9; for (let k = 1; k <= coils; k++) c.lineTo(x + (k % 2 ? -10 : 10), sTop + ((sBot - sTop) * k) / coils);
    c.lineTo(x, sBot); c.stroke();
    c.strokeStyle = '#C0C8D6'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, sTop);
    for (let k = 1; k <= coils; k++) c.lineTo(x + (k % 2 ? -10 : 10), sTop + ((sBot - sTop) * k) / coils);
    c.lineTo(x, sBot); c.stroke();
    // (the driver pin: steel, flat-ended)
    box(c, x - 11, drvT, 22, 40, INK); box(c, x - 10, drvT + 1, 20, 38, STEEL[4]); box(c, x - 10, drvT + 1, 5, 38, STEEL[6]); box(c, x + 6, drvT + 1, 4, 38, STEEL[2]);
    // (the key pin: brass, its foot rounded to ride the pick; set: lit green, held up)
    const K = p.set ? ['#14532D', '#16A34A', '#4ADE80', '#BBF7D0'] : ['#6E460C', '#BE861E', '#E0AC38', '#FFF0B8'];
    box(c, x - 11, keyT, 22, 46, INK); box(c, x - 10, keyT + 1, 20, 42, K[1]); box(c, x - 10, keyT + 1, 5, 42, K[2]); box(c, x - 10, keyT + 1, 2, 42, K[3]); box(c, x + 6, keyT + 1, 4, 42, K[0]);
    c.fillStyle = INK; c.beginPath(); c.moveTo(x - 11, keyB - 3); c.lineTo(x, keyB + 6); c.lineTo(x + 11, keyB - 3); c.fill();
    c.fillStyle = K[1]; c.beginPath(); c.moveTo(x - 9, keyB - 3); c.lineTo(x, keyB + 4); c.lineTo(x + 9, keyB - 3); c.fill();
    // (at the top, in the window: it glints)
    if (!p.set && p.h > 0.9) { box(c, x - 14, drvT - 4, 28, 3, '#FFFFFF'); box(c, x - 2, drvT - 10, 4, 14, 'rgba(255,255,255,0.7)'); }
    if (p.set && v.flash > 0 && i === v.pins.findIndex(q => q === p)) { /* (the flash is drawn below) */ }
  }
  if (v.flash > 0) { c.fillStyle = `rgba(190, 255, 200, ${v.flash / 40})`; c.fillRect(LX0, LTOP, LX1 - LX0, SHEAR - LTOP); }
  // THE PICK: a bobby pin in through the keyway from the left, its hooked tip under the tumbler it's at, pushed up;
  // his meaty fingers on the end of it; the tension wrench along the keyway's foot
  const tipX = pinX(Math.max(0, Math.min(n - 1, v.pick)), n), tipY = PLUG_B - 22 - v.push * RISE * 0.18;
  // (the paperclip: its loops out by his fingers, one leg pulled straight in along the keyway, bent up into a hook at
  // the tip; slipped, the straight leg kinked and the tip sagging, bent out of shape)
  const wire = (pts: [number, number][]) => wireOn(c, pts);
  const ky = PLUG_B - 20;
  // (the loops: the clip's body, outside the lock: the owner's "the base of the paperclip should change shape as it
  // furls/unfurls": the further in the pick's fed (and the harder it's pushed), the more its loops unbend, out of
  // CLIP_STEPS baked shapes)
  const out = Math.max(0, Math.min(1, (v.pick / Math.max(1, n - 1)) * 0.8 + v.push * 0.2));
  const st = Math.round(out * (CLIP_STEPS - 1));
  stamp(c, `spc-a51-clipbase-${st}`, 14, ky - 132, 136, 146, g => wireOn(g, clipBase(st / (CLIP_STEPS - 1), ky)));
  if (v.snap <= 0) {
    wire([[96, ky], [tipX - 16, ky + 2], [tipX - 4, tipY + 6], [tipX, tipY]]);
  } else {
    const t = Math.min(1, v.snap / 12), mid = (96 + tipX) / 2;
    wire([[96, ky], [mid - 30, ky + 2], [mid, ky - 10 * t], [mid + 24, ky + 8 * t], [tipX - 10, ky + 14 * t], [tipX + 4, ky + 22 * t]]);
  }
  // (the wrench: an L of steel along the bottom of the keyway, bent down out of it)
  box(c, -10, PLUG_B - 14, 120, 5, INK); box(c, -10, PLUG_B - 13, 120, 3, '#71717A');
  box(c, 0, PLUG_B - 14, 6, 60, INK); box(c, 1, PLUG_B - 13, 4, 58, '#71717A');
  // (his fingers: three fat sausages round the pin's end, hairy knuckles, a bitten nail)
  const hx = 34, hy = PLUG_B - 16 + v.push * -2;
  const SK = ['#7A3A20', '#A65632', '#C87A50', '#E6A078', '#F6C8A4'];
  for (let k = 0; k < 3; k++) {
    const fy = hy - 22 + k * 15;
    box(c, -20, fy - 1, hx + 22 - k * 6, 16, INK);
    box(c, -20, fy, hx + 20 - k * 6, 14, SK[2]); box(c, -20, fy, hx + 20 - k * 6, 4, SK[3]); box(c, -20, fy + 11, hx + 20 - k * 6, 3, SK[1]);
    box(c, hx - 10 - k * 6, fy + 2, 7, 8, SK[4]); box(c, hx - 10 - k * 6, fy + 2, 7, 1, '#FFFFFF');
    for (let h = 0; h < 4; h++) box(c, 2 + h * 6 - k * 2, fy + 1, 1, 3, '#3A1A0A');
  }
  c.restore();
};
/** The lock's words: picks snapped (the box of them), a verdict (SET!, SNAP!). */
export const drawLockWords = (c: Ctx, broken: number, verdict: string | null, good: boolean, setN: number, n: number) => {
  if (verdict) words(c, verdict, CANVAS_WIDTH / 2, 186, good ? '#86EFAC' : '#F87171', 14, INK);
  words(c, `TUMBLERS SET: ${setN} / ${n}`, CANVAS_WIDTH / 2, 512, '#FDE047', 9, INK);
  words(c, `ONE BENT PAPERCLIP.  BENT BACK: ${broken} TIMES`, CANVAS_WIDTH / 2, 534, '#E5E7EB', 7, INK);
  words(c, 'PUSH ONE UP. SET IT WHILE IT HANGS AT THE TOP.', CANVAS_WIDTH / 2, 552, '#A1A1AA', 6, INK);
};
