// The HAPPYWOOD WATER TOWER and CON-FUCK-TIOUS's tank on top of it (benTower.ts), painted (peak SNES, on the boulevard's
// kit: stepped ramps by the hour, lit from the upper left, inked in the warm plum-brown).
//
// THE TOWER (outdoors: the time of day's light; the sky through it): its legs straddling the street (the back two set
// back and dimmed, the front two at the play plane), then the scaffold: its side walls (laced steel columns with chain
// link stretched between their chords: nobody's getting through that), the rear frame's X bracing set back and dimmed
// (scenery: nothing to stand on), the decks (steel grating, a lit lip along every top: standable reads standable), the
// RIG HATCHES (hazard-striped double trapdoors, their leaves swinging down when one opens), stenciled level boards
// (LEVEL n, how many feet up, the trick for it: CHARGE AT THE END, CATCH THE DOLLY, JUMP RIG TO RIG, HOLD UP: REEL IN,
// HOP. CATCH. RIDE.), level 4's perch, the tank's riveted underside and its manhole ring over the top level.
//
// THE TANK (its own signature, no other lair has it): a drained water tank turned gym-bro hideout. Riveted staves
// curving round (lit down the middle, dark at the sides), rust bleeding down from every rivet, the old WATERLINE scummed
// across them (darker and water-stained under it, mineral crust over it), a puddle that never dries; the roof's pipes
// with his sandbags hung off them. His junk, all studio props: a dressing-room mirror ringed with bulbs (a polaroid of
// the two of them at the Iron Pit tucked in its corner), his director's chair (BEN on its back), a five-high stack of
// film cans (DAILIES '87), the knockoff award statue on its column (BEST SUPPORTING SPOTTER), a boom pole for a barbell
// with film reels for plates on two apple boxes, a clapperboard (LEG DAY, TAKE 9000), a fresnel on its C-stand throwing
// a beam across, a rubber raft strung up on chains for his hammock (he naps up there: it holds you), the stunt cannon
// under the roof vent. His stage curtain (red velvet, gold fringe) rolled up under the roof, dropped for the trial. The
// tank's shell cut away round it, its cone roof over it with HAPPYWOOD round the band and the red light on the finial.
// More of his things (paintDen): the CRAFTY mini fridge with a hot plate and chili, a styrofoam saguaro, two one-sheets
// (LEG DAY II, THE SPOTTER), the fold-down bench with the next shin-dig half taped up, a welded patch and its scorch, a
// carton of the gift shop's knockoff statuettes, chalk handprints; a near roof pipe across the top in front.
// Still art painted once (stamps by the hour; the tank in chunks); only the bags, the curtain, the hatches' leaves, the
// dust in the beam and Ben move.

import type { GameState } from '../../../m1/game/core/state';
import type { SceneLight, Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { drawSkipPrompt, SKIP_AFTER } from '../../../m1/game/platform/skip';
import { drawCannon, HOLLYWOOD } from '../../upgrades/returnCannon';
import { drawBen, benHeadY, drawBenGross, drawBenGrossBack, drawGate, drawCannonChain, gateK } from '../../upgrades/confucktious';
import { saidOver } from '../section';
import { GY } from '../geometry';
import { type Ctx, INK, box, checker, mix, hash, stamp, still, ramp6, hour, dimmed, LIP, VELVET, BRASS, signText, plain, timeOfDay } from '../blvd/kit';
import { X, Y } from './layout';
import {
  IN_A, IN_B, WALL, DECK_T, DECKS, HATCH_W, HATCH_X, TANK, VENT, TANK_F, PERCH, RAFT, BEN_X, CURTAIN, BAG_W, BAG_H,
  towerOf, inTank, tankView, bagBox, type Hatch,
} from './benTower';

const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
const seenBox = (state: GameState, x0: number, x1: number, y0: number, y1: number, pad = 40) =>
  x1 > state.camera.x - pad && x0 < state.camera.x + W + pad && y1 > state.camera.y - pad && y0 < state.camera.y + H + pad;
/** The street's underside of the first deck, and the scaffold's walls' bottom. */
const D1B = DECKS[1] - DECK_T;
const HAZ = '#FACC15';
/** Feet up for a height (Meathead's 64 px is six feet). */
const feet = (h: number) => Math.round((h / 64) * 6);

// ---------------------------------------------------------------------------------------------------------------
// The scaffold's parts

/** A side wall's tile: two riveted angle-iron chords, the lacing zigzagging between, chain link stretched behind (40 x
 *  240; tiles up seamless). */
const paintWallTile = (g: Ctx) => {
  const S = ramp6(hour('#6A727E')), D = ramp6(hour('#3A4048'));
  // (the chain link: diamonds in two dim tones, dithered at the crossings)
  box(g, 0, 0, 40, 240, D[1]);
  for (let y = -40; y < 280; y += 8) for (let x = 0; x < 40; x++) { const yy = y + x; if (yy >= 0 && yy < 240) box(g, x, yy, 1, 1, D[3]); const y2 = y - x + 40; if (y2 >= 0 && y2 < 240) box(g, x, y2, 1, 1, D[2]); }
  checker(g, 0, 0, 40, 240, D[0], 0, 4);
  // (the lacing: steel flats zigzag up between the chords)
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); for (let y = 0; y <= 240; y += 60) { g.moveTo(8, y); g.lineTo(32, y + 30); g.lineTo(8, y + 60); } g.stroke();
  g.strokeStyle = S[3]; g.lineWidth = 2; g.beginPath(); for (let y = 0; y <= 240; y += 60) { g.moveTo(8, y); g.lineTo(32, y + 30); g.lineTo(8, y + 60); } g.stroke();
  // (the chords: lit down their left faces, shaded right, rivets every 12)
  for (const cx of [0, 31]) {
    box(g, cx, 0, 9, 240, INK); box(g, cx + 1, 0, 7, 240, S[3]); box(g, cx + 1, 0, 2, 240, S[4]); box(g, cx + 6, 0, 2, 240, S[1]);
    for (let y = 6; y < 240; y += 12) { box(g, cx + 3, y, 3, 3, S[1]); box(g, cx + 3, y, 2, 2, S[5]); }
  }
  // (a gusset plate where the lacing meets the chords; grime down it)
  for (let y = 26; y < 240; y += 60) { box(g, 26, y, 8, 8, S[2]); box(g, 26, y, 8, 1, S[4]); }
  checker(g, 0, 200, 40, 40, S[0], 1, 3);
};
/** The rear frame's tile (set back, dimmed: scenery): its posts every 200, X bracing between, 800 x 240. */
const paintBackTile = (g: Ctx) => {
  const R = ramp6(dimmed('#5A6270'));
  for (let x = 0; x < 800; x += 200) {
    // (thin and dark: well back, the sky through it)
    g.globalAlpha = 0.55;
    g.strokeStyle = R[0]; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 8, 0); g.lineTo(x + 192, 240); g.moveTo(x + 192, 0); g.lineTo(x + 8, 240); g.stroke();
    g.strokeStyle = R[2]; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 8, 0); g.lineTo(x + 192, 240); g.stroke();
    g.globalAlpha = 1;
    box(g, x + 96, 116, 8, 8, R[2]); box(g, x + 96, 116, 8, 1, R[4]);
  }
  for (let x = 0; x <= 800; x += 200) { box(g, x - 5, 0, 10, 240, R[0]); box(g, x - 4, 0, 8, 240, R[2]); box(g, x - 4, 0, 2, 240, R[3]); for (let y = 10; y < 240; y += 20) box(g, x - 1, y, 2, 2, R[1]); }
};
/** A leg down from the first deck to the street (40 wide, `h` tall): laced like the walls, no mesh; its footing. */
const paintLeg = (g: Ctx, h: number, far: boolean) => {
  const S = ramp6(far ? dimmed('#5A6270') : hour('#6A727E'));
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); for (let y = 0; y < h - 20; y += 50) { g.moveTo(8, y); g.lineTo(32, y + 25); g.lineTo(8, y + 50); } g.stroke();
  g.strokeStyle = S[3]; g.lineWidth = 1.5; g.beginPath(); for (let y = 0; y < h - 20; y += 50) { g.moveTo(8, y); g.lineTo(32, y + 25); g.lineTo(8, y + 50); } g.stroke();
  for (const cx of [0, 31]) { box(g, cx, 0, 9, h, INK); box(g, cx + 1, 0, 7, h, S[3]); box(g, cx + 1, 0, 2, h, S[4]); box(g, cx + 6, 0, 2, h, S[1]); for (let y = 6; y < h - 12; y += 14) box(g, cx + 3, y, 2, 2, S[5]); }
  // (the footing: a concrete pyramid stump, the anchor bolts)
  const C = ramp6(far ? dimmed('#8A8478') : hour('#8A8478'));
  g.fillStyle = INK; g.beginPath(); g.moveTo(-6, h); g.lineTo(2, h - 14); g.lineTo(38, h - 14); g.lineTo(46, h); g.closePath(); g.fill();
  g.fillStyle = C[3]; g.beginPath(); g.moveTo(-4, h); g.lineTo(3, h - 13); g.lineTo(37, h - 13); g.lineTo(44, h); g.closePath(); g.fill();
  g.fillStyle = C[4]; g.beginPath(); g.moveTo(-4, h); g.lineTo(3, h - 13); g.lineTo(8, h - 13); g.lineTo(4, h); g.closePath(); g.fill();
  for (const bx of [6, 30]) { box(g, bx, h - 18, 4, 5, INK); box(g, bx + 1, h - 17, 2, 3, S[5]); }
};
/** A deck (its top at 0, `w` wide, DECK_T deep): steel grating, the lit lip along its top, the beam under it riveted;
 *  hazard stripes at an end that meets a hatch (`l`, `r`); `tank`: the tank's floor (riveted plate, a dish under it). */
const paintDeck = (g: Ctx, w: number, l: boolean, r: boolean, tank: boolean) => {
  const S = ramp6(hour(tank ? '#6E625A' : '#626A76'));
  box(g, -1, -1, w + 2, DECK_T + 2, INK);
  if (tank) {
    box(g, 0, 0, w, DECK_T, S[2]);
    for (let x = 0; x < w; x += 46) { box(g, x, 3, 1, DECK_T - 3, S[0]); box(g, x + 1, 3, 1, DECK_T - 3, S[4]); for (let y = 7; y < DECK_T - 2; y += 6) box(g, x + 3, y, 2, 2, S[1]); }
    checker(g, 0, DECK_T - 8, w, 8, S[0], 0, 2); box(g, 0, DECK_T - 3, w, 3, S[0]);
    for (let x = 8; x < w; x += 40) box(g, x, DECK_T - 6, 3, 1, '#8A4A22');
  } else {
    box(g, 0, 0, w, DECK_T, S[1]);
    for (let x = 1; x < w; x += 4) box(g, x, 4, 2, 10, S[3]);
    box(g, 0, 9, w, 1, S[2]);
    box(g, 0, 14, w, DECK_T - 14, S[2]); box(g, 0, 14, w, 1, S[4]);
    for (let x = 6; x < w; x += 14) { box(g, x, 17, 3, 3, S[0]); box(g, x, 17, 2, 2, S[5]); }
    checker(g, 0, DECK_T - 4, w, 4, S[0], 1, 2);
  }
  // (the lit lip: standable)
  box(g, 0, 0, w, 3, LIP[2]); box(g, 0, 0, w, 1, LIP[3]); box(g, 0, 3, w, 1, LIP[0]);
  // (hazard stripes on the ends meeting a hatch)
  for (const [on, x] of [[l, 0], [r, w - 12]] as const) if (on) for (let k = 0; k < 4; k++) box(g, x + k * 3, 4, 2, DECK_T - 6, k % 2 ? INK : HAZ);
};

/** A level's board, bolted to the rear frame: LEVEL n, how high, the trick for it. */
const paintBoard = (g: Ctx, lines: string[], w: number) => {
  const R = ramp6(dimmed('#2A2E36'));
  box(g, -2, -2, w + 4, 14 + lines.length * 11 + 4, INK); box(g, 0, 0, w, 14 + lines.length * 11, R[2]); box(g, 0, 0, w, 2, R[4]); box(g, w - 2, 0, 2, 14 + lines.length * 11, R[0]);
  for (const bx of [3, w - 6]) { box(g, bx, 3, 3, 3, R[0]); box(g, bx, 3, 2, 2, R[5]); }
  lines.forEach((t, i) => signText(g, t, w / 2, 12 + i * 11, plain(1, 1, i === 0 ? '#FACC15' : '#E8E0D0', '#0A0608')));
};
const BOARDS: [number, number, string[]][] = [
  // (rx, height of the board's top, its lines)
  [5880, 300, ['HAPPYWOOD WATER TOWER', 'RIGGERS ONLY', 'RIDE THE RIG UP', 'CHARGE AT THE END']],
  [5090, DECKS[1] + 230, [`LEVEL 1 - ${feet(DECKS[1])} FT`, 'CATCH THE DOLLY']],
  [5690, DECKS[2] + 360, [`LEVEL 2 - ${feet(DECKS[2])} FT`, 'JUMP RIG TO RIG']],
  [5640, DECKS[3] + 340, [`LEVEL 3 - ${feet(DECKS[3])} FT`, 'HOLD UP: REEL IN', 'THEN CHARGE']],
  [5420, DECKS[4] + 330, [`LEVEL 4 - ${feet(DECKS[4])} FT`, 'HOP. CATCH. RIDE.']],
];

// ---------------------------------------------------------------------------------------------------------------
// The tank (local: x from TANK.a, y up from its floor negative)

const TW = TANK.b - TANK.a, TH = TANK.h;
const PLATE = ['#2A2420', '#433A33', '#5E5248', '#7A6C60', '#9A8A7C', '#BCAE9E'];
const RUST = ['#3A1A0A', '#5E2C12', '#8A4A22', '#B06A34'];
const GOLDR = ['#5A3A04', '#8A5E08', '#C08A10', '#EAB516', '#FAD43A', '#FFF08A'];
const wallTank = (g: Ctx) => {
  // (the staves: plates 46 wide, lit down the middle of the room, dark at its ends: the tank curving round)
  for (let x = 0, i = 0; x < TW; x += 46, i++) {
    const u = (x + 23) / TW, lit = 1 - Math.abs(u - 0.45) * 2.2, k = Math.max(0, Math.min(4, Math.round(1 + lit * 3)));
    box(g, x, -TH, 46, TH, PLATE[k]); box(g, x, -TH, 3, TH, PLATE[Math.min(5, k + 1)]); box(g, x + 43, -TH, 3, TH, PLATE[Math.max(0, k - 1)]);
    checker(g, x + 40, -TH, 3, TH, PLATE[Math.max(0, k - 1)], 0, 2);
    // (rivets down its seam, rust bleeding down off them)
    for (let y = -TH + 8; y < -4; y += 13) { box(g, x + 1, y, 3, 3, PLATE[0]); box(g, x + 1, y, 2, 2, PLATE[5]); if (hash(i * 7 + y) > 0.72) { box(g, x + 2, y + 3, 1, 10 + Math.floor(hash(y + i) * 26), RUST[2]); box(g, x + 3, y + 3, 1, 6, RUST[1]); } }
  }
  // (the horizontal seams, riveted)
  for (const y of [-TH + 95, -TH + 190, -TH + 285]) { box(g, 0, y, TW, 2, PLATE[0]); box(g, 0, y + 2, TW, 1, PLATE[4]); for (let x = 6; x < TW; x += 11) box(g, x, y - 3, 2, 2, PLATE[1]); }
  // (the waterline: under it the plates water-stained, a scum band, a mineral crust over it, drips down)
  const wl = -250;
  for (let y = wl; y < 0; y += 2) { const a = 0.18 + (y - wl) / 250 * 0.12; g.fillStyle = `rgba(40, 50, 30, ${a.toFixed(3)})`; g.fillRect(0, y, TW, 1); }
  box(g, 0, wl - 2, TW, 2, '#C8C4B0'); checker(g, 0, wl - 4, TW, 2, '#B0AA94', 0, 2);
  box(g, 0, wl, TW, 5, '#3A4626'); box(g, 0, wl + 5, TW, 2, '#4A5A30'); checker(g, 0, wl + 7, TW, 3, '#3A4626', 1, 2);
  for (let x = 5; x < TW; x += 17 + Math.floor(hash(x) * 20)) box(g, x, wl + 7, 2, 6 + Math.floor(hash(x * 3) * 30), '#3A4626');
  // (the roof's pipes the sandbags hang off; a work light caged on one)
  const S = ramp6('#5A626C');
  box(g, 0, -TH + 18, TW, 7, INK); box(g, 0, -TH + 19, TW, 5, S[3]); box(g, 0, -TH + 19, TW, 1, S[5]); box(g, 0, -TH + 23, TW, 1, S[1]);
  for (let x = 30; x < TW; x += 160) { box(g, x, -TH, 4, 20, INK); box(g, x + 1, -TH, 2, 20, S[4]); }
};
/** His mirror: a dressing-room mirror ringed with bulbs (two dead), the glass with a streak, the polaroid. */
const mirror = (g: Ctx, x: number, y: number) => {
  const F = ramp6('#2A2A30');
  box(g, x - 2, y - 2, 104, 84, INK); box(g, x, y, 100, 80, F[2]); box(g, x, y, 100, 2, F[4]);
  const G = ['#26323E', '#34485A', '#4A6278', '#7A96AE', '#B8CCDC'];
  box(g, x + 12, y + 12, 76, 56, G[1]); box(g, x + 12, y + 12, 76, 20, G[2]); checker(g, x + 12, y + 30, 76, 4, G[2], 0, 2);
  g.fillStyle = G[3]; g.beginPath(); g.moveTo(x + 20, y + 66); g.lineTo(x + 50, y + 14); g.lineTo(x + 58, y + 14); g.lineTo(x + 28, y + 66); g.closePath(); g.fill();
  box(g, x + 14, y + 13, 30, 1, G[4]);
  for (let k = 0; k < 14; k++) {
    const bx = k < 5 ? x + 10 + k * 20 : k < 7 ? x + 94 : k < 12 ? x + 90 - (k - 7) * 20 : x + 6, by = k < 5 ? y + 6 : k < 7 ? y + 26 + (k - 5) * 28 : k < 12 ? y + 74 : y + 26 + (k - 12) * 28;
    const dead = k === 3 || k === 9;
    g.fillStyle = INK; g.beginPath(); g.arc(bx, by, 4, 0, Math.PI * 2); g.fill();
    g.fillStyle = dead ? '#6A6458' : '#FFF4C8'; g.beginPath(); g.arc(bx, by, 3, 0, Math.PI * 2); g.fill();
    if (!dead) { g.fillStyle = '#FFFFFF'; g.fillRect(bx - 1, by - 2, 1, 1); }
  }
  // (the polaroid in the frame's corner: two blobs flexing, IRON PIT '04)
  box(g, x + 70, y + 46, 18, 20, INK); box(g, x + 71, y + 47, 16, 18, '#F4F2EA'); box(g, x + 72, y + 48, 14, 11, '#6A5040');
  box(g, x + 74, y + 51, 4, 7, '#D59C6C'); box(g, x + 80, y + 50, 4, 8, '#E8B898'); box(g, x + 73, y + 50, 2, 2, '#D59C6C'); box(g, x + 84, y + 49, 2, 2, '#E8B898');
  box(g, x + 73, y + 61, 12, 1, '#8A8478');
};
const chair = (g: Ctx, x: number) => {
  const Wd = ramp6(dimmed('#6A4A2A')), Cv = ramp6(dimmed('#2A2A30'));
  // (the X legs, the seat, the canvas back with BEN on it)
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 40, -36); g.moveTo(x + 40, 0); g.lineTo(x, -36); g.stroke();
  g.strokeStyle = Wd[3]; g.lineWidth = 2; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 40, -36); g.moveTo(x + 40, 0); g.lineTo(x, -36); g.stroke();
  box(g, x - 2, -40, 44, 6, INK); box(g, x - 1, -39, 42, 4, Cv[3]);
  for (const px of [x - 2, x + 38]) { box(g, px, -84, 5, 50, INK); box(g, px + 1, -84, 3, 50, Wd[3]); }
  box(g, x - 2, -82, 44, 20, INK); box(g, x - 1, -81, 42, 18, Cv[2]); box(g, x - 1, -81, 42, 2, Cv[4]);
  signText(g, 'BEN', x + 20, -67, plain(1, 2, dimmed('#F4EEE2')));
};
const filmCans = (g: Ctx, x: number) => {
  const C = ramp6(dimmed('#7A7E86'));
  for (let i = 0; i < 5; i++) {
    const y = -12 - i * 12, off = Math.round((hash(i * 3.3) - 0.5) * 6);
    box(g, x + off - 1, y - 1, 46, 13, INK); box(g, x + off, y, 44, 11, C[3]); box(g, x + off, y, 44, 2, C[5]); box(g, x + off, y + 9, 44, 2, C[1]);
    box(g, x + off + 12, y + 3, 20, 5, i % 2 ? dimmed('#E8DCB8') : dimmed('#F4F0E4')); box(g, x + off + 14, y + 4, 16, 1, dimmed('#B91C1C'));
  }
  // (DAILIES '87 on a strip of camera tape across the top can)
  box(g, x - 13, -61, 70, 11, INK); box(g, x - 12, -60, 68, 9, dimmed('#ECE6D6')); box(g, x - 12, -60, 68, 1, dimmed('#FFFFFF'));
  signText(g, "DAILIES '87", x + 22, -52, plain(1, 1, dimmed('#1C1C22')));
};
const award = (g: Ctx, x: number) => {
  const P = ramp6(dimmed('#1C1C22'));
  // (the column (a thin plinth: nothing to stand on), the plaque, the big gold man on top)
  box(g, x - 9, -74, 18, 74, INK); box(g, x - 8, -74, 16, 74, P[2]); box(g, x - 8, -74, 3, 74, P[4]); box(g, x + 5, -74, 3, 74, P[0]);
  box(g, x - 14, -78, 28, 6, INK); box(g, x - 13, -77, 26, 4, P[3]);
  const G = GOLDR;
  g.fillStyle = INK; g.beginPath(); g.moveTo(x - 11, -116); g.lineTo(x + 11, -116); g.lineTo(x + 8, -98); g.lineTo(x + 5, -80); g.lineTo(x - 5, -80); g.lineTo(x - 8, -98); g.closePath(); g.fill();
  g.fillStyle = G[3]; g.beginPath(); g.moveTo(x - 10, -115); g.lineTo(x + 10, -115); g.lineTo(x + 7, -98); g.lineTo(x + 4, -81); g.lineTo(x - 4, -81); g.lineTo(x - 7, -98); g.closePath(); g.fill();
  box(g, x - 9, -114, 4, 30, G[4]); box(g, x + 4, -114, 4, 30, G[2]); box(g, x - 1, -108, 2, 26, G[1]);
  g.fillStyle = INK; g.beginPath(); g.arc(x, -124, 9, 0, Math.PI * 2); g.fill();
  g.fillStyle = G[3]; g.beginPath(); g.arc(x, -124, 8, 0, Math.PI * 2); g.fill();
  g.fillStyle = G[5]; g.fillRect(x - 4, -129, 3, 2);
  // (its placard: a black plate screwed across the column, both lines on it)
  box(g, x - 34, -72, 68, 34, INK); box(g, x - 33, -71, 66, 32, P[1]); box(g, x - 33, -71, 66, 1, P[4]); box(g, x - 31, -69, 62, 28, P[2]);
  for (const bx of [x - 31, x + 29]) { box(g, bx, -69, 2, 2, BRASS[2]); box(g, bx, -43, 2, 2, BRASS[2]); }
  signText(g, 'BEST', x, -61, plain(1, 1, dimmed('#E8C25A'), '#0A0608'));
  signText(g, 'SUPPORTING', x, -52, plain(1, 1, dimmed('#E8C25A'), '#0A0608'));
  signText(g, 'SPOTTER', x, -43, plain(1, 1, dimmed('#E8C25A'), '#0A0608'));
};
const weights = (g: Ctx, x: number) => {
  const A = ramp6(dimmed('#9A7A4A')), S = ramp6(dimmed('#7A828E'));
  // (two apple boxes, the boom pole across them, film reels for plates, two sandbag dumbbells)
  for (const ax of [x, x + 92]) { box(g, ax - 1, -23, 32, 23, INK); box(g, ax, -22, 30, 22, A[3]); box(g, ax, -22, 30, 2, A[5]); box(g, ax + 8, -14, 14, 4, A[1]); signText(g, 'APPLE', ax + 15, -2, plain(1, 1, A[1])); }
  box(g, x - 30, -36, 184, 5, INK); box(g, x - 29, -35, 182, 3, S[3]); box(g, x - 29, -35, 182, 1, S[5]);
  for (const rx of [x - 22, x + 144]) for (const d of [0, 7]) {
    const cx = rx + d;
    g.fillStyle = INK; g.beginPath(); g.arc(cx, -33, 21, 0, Math.PI * 2); g.fill();
    g.fillStyle = S[3]; g.beginPath(); g.arc(cx, -33, 20, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#121216'; g.beginPath(); g.arc(cx, -33, 14, 0, Math.PI * 2); g.fill();
    g.fillStyle = S[4]; g.beginPath(); g.arc(cx, -33, 4, 0, Math.PI * 2); g.fill();
  }
  for (const sx of [x + 40, x + 62]) { box(g, sx - 1, -15, 18, 15, INK); box(g, sx, -14, 16, 14, dimmed('#B8A47A')); box(g, sx + 6, -18, 4, 4, dimmed('#5A4630')); }
};
const clapper = (g: Ctx, x: number, y: number) => {
  box(g, x - 1, y - 1, 62, 46, INK); box(g, x, y + 10, 60, 34, '#1C1C22');
  for (let k = 0; k < 6; k++) { box(g, x + k * 10, y, 10, 9, k % 2 ? '#F4F4F0' : '#1C1C22'); }
  box(g, x, y + 9, 60, 1, '#F4F4F0');
  signText(g, 'LEG DAY', x + 30, y + 22, plain(1, 1, '#F4F4F0'));
  signText(g, 'TAKE 9000', x + 30, y + 32, plain(1, 1, '#F4F4F0'));
  signText(g, 'DIR: BEN', x + 30, y + 42, plain(1, 1, '#FACC15'));
};
const fresnel = (g: Ctx, x: number) => {
  const S = ramp6('#3A3A42');
  // (the C-stand's three legs, its column, the lamp head turned left: the lens, the barn doors)
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(x, -70); g.lineTo(x - 22, 0); g.moveTo(x, -70); g.lineTo(x + 20, 0); g.moveTo(x, -70); g.lineTo(x + 4, 0); g.stroke();
  g.strokeStyle = S[4]; g.lineWidth = 1; g.beginPath(); g.moveTo(x, -70); g.lineTo(x - 22, 0); g.moveTo(x, -70); g.lineTo(x + 20, 0); g.stroke();
  box(g, x - 3, -150, 6, 82, INK); box(g, x - 2, -150, 4, 82, S[3]); box(g, x - 2, -150, 1, 82, S[5]);
  box(g, x - 22, -180, 40, 34, INK); box(g, x - 21, -179, 38, 32, S[2]); box(g, x - 21, -179, 38, 3, S[4]); for (let k = 0; k < 4; k++) box(g, x - 4 + k * 5, -176, 2, 8, S[0]);
  box(g, x - 30, -178, 9, 30, INK); box(g, x - 29, -177, 7, 28, '#FFF4C8'); box(g, x - 29, -177, 2, 28, '#FFFFFF');
  for (const [dy, len] of [[-188, 12], [-142, 12]] as const) { box(g, x - 34, dy, 14, 4, INK); box(g, x - 33, dy + 1, len, 2, S[3]); }
};
const raft = (g: Ctx) => {
  const [a, b] = [RAFT[0] - TANK.a, RAFT[1] - TANK.a], y = -(RAFT[2] - TANK_F), w = b - a;
  const Yl = ['#6A4A06', '#A6760E', '#D8A818', '#F6D23A', '#FCE880'];
  // (the chains up to the roof's eyes)
  for (const cx of [a + 8, b - 8]) for (let yy = -TH + 20; yy < y; yy += 5) { box(g, cx - 1, yy, 3, 4, INK); box(g, cx, yy + 1, 1, 2, '#9A9AA6'); }
  // (the raft: a fat yellow tube round it, its floor sagging, a patch, a beer can in it)
  box(g, a - 1, y - 1, w + 2, 18, INK);
  box(g, a, y, w, 16, Yl[2]); box(g, a, y + 3, w, 4, Yl[3]); box(g, a, y + 11, w, 5, Yl[1]);
  g.fillStyle = INK; g.beginPath(); g.arc(a + 4, y + 8, 9, 0, Math.PI * 2); g.arc(b - 4, y + 8, 9, 0, Math.PI * 2); g.fill();
  g.fillStyle = Yl[2]; g.beginPath(); g.arc(a + 4, y + 8, 8, 0, Math.PI * 2); g.arc(b - 4, y + 8, 8, 0, Math.PI * 2); g.fill();
  box(g, a + 40, y + 6, 14, 6, '#5A5A66'); box(g, a + 41, y + 7, 12, 1, '#8A8A96');
  box(g, a + 90, y - 9, 6, 9, INK); box(g, a + 91, y - 8, 4, 8, '#B91C1C');
  // (its lip, lit: it holds him)
  box(g, a, y, w, 2, LIP[2]); box(g, a, y, w, 1, LIP[3]);
};
const curtainRolled = (g: Ctx) => {
  const cx = (CURTAIN.a + CURTAIN.b) / 2 - TANK.a;
  box(g, cx - 30, -TH + 26, 60, 24, INK); box(g, cx - 29, -TH + 27, 58, 22, VELVET[2]); box(g, cx - 29, -TH + 29, 58, 5, VELVET[3]); box(g, cx - 29, -TH + 44, 58, 4, VELVET[0]);
  for (const tx of [cx - 18, cx + 14]) { box(g, tx, -TH + 24, 4, 28, BRASS[3]); box(g, tx, -TH + 24, 1, 28, BRASS[5]); box(g, tx - 1, -TH + 50, 6, 6, BRASS[2]); }
};
/** More of his things (dimmed: none of it's stood on): the craft-services mini fridge (CRAFTY on it) with a hot plate
 *  and a pot of chili; a styrofoam saguaro off the western town; two one-sheets on the staves in his words (LEG DAY II,
 *  THE SPOTTER); the fold-down bench bolted to the staves where the next shin-dig's being built (a shin guard, a gold
 *  statuette half gaffer-taped down it, the glue gun, the soldering iron, a tub of whey), the welding's scorch and a
 *  fresh plate welded over a hole behind it; a carton of the gift shop's knockoff statuettes under it; chalk handprints
 *  on the plates by the weights and its dust on the floor. */
const paintDen = (g: Ctx) => {
  const D = (c: string) => ramp6(dimmed(c));
  // ---- the mini fridge: white, CRAFTY on its door on gaffer tape, the hot plate on it, a pot of chili, the ladle
  { const x = 6, w = 46, t = -52, Fr = D('#D8D4CC'), S = D('#3A3A42');
    box(g, x - 1, t - 1, w + 2, -t + 1, INK); box(g, x, t, w, -t, Fr[3]); box(g, x, t, 4, -t, Fr[4]); box(g, x + w - 6, t, 6, -t, Fr[2]);
    box(g, x, t + 16, w, 2, Fr[1]); box(g, x + w - 10, t + 22, 3, 14, S[2]); box(g, x + w - 10, t + 4, 3, 8, S[2]);
    box(g, x + 6, t + 24, 26, 9, D('#C8C0A8')[3]); signText(g, 'CRAFTY', x + 19, t + 32, plain(1, 1, dimmed('#1C1C22')));
    box(g, x + 4, -3, w - 8, 3, S[1]);
    box(g, x + 6, t - 6, w - 12, 6, INK); box(g, x + 7, t - 5, w - 14, 4, S[2]); box(g, x + 10, t - 6, w - 20, 1, '#E8603A');
    box(g, x + 9, t - 22, 28, 16, INK); box(g, x + 10, t - 21, 26, 15, S[3]); box(g, x + 10, t - 21, 5, 15, S[4]); box(g, x + 30, t - 21, 6, 15, S[1]);
    box(g, x + 7, t - 24, 32, 4, INK); box(g, x + 8, t - 23, 30, 2, S[4]); box(g, x + 11, t - 24, 24, 1, dimmed('#8A2A10'));
    box(g, x + 4, t - 18, 6, 2, INK); box(g, x + 36, t - 18, 6, 2, INK);
    box(g, x + 26, t - 38, 2, 16, INK); box(g, x + 26, t - 38, 1, 15, S[5]); }
  // ---- the styrofoam saguaro off the western town (a chunk bitten out of it, the white foam showing)
  { const x = 138, C = D('#3A7A3A');
    for (const [ax, ay, aw, ah] of [[x - 5, -58, 10, 58], [x - 15, -42, 6, 18], [x + 9, -48, 6, 22]] as const) { box(g, ax - 1, ay - 1, aw + 2, ah + 2, INK); box(g, ax, ay, aw, ah, C[2]); box(g, ax + 1, ay, 2, ah, C[4]); box(g, ax + aw - 2, ay, 1, ah, C[1]); }
    box(g, x - 15, -26, 10, 5, INK); box(g, x - 14, -25, 9, 3, C[2]); box(g, x + 5, -28, 10, 5, INK); box(g, x + 5, -27, 9, 3, C[2]);
    for (let y = -54; y < -4; y += 6) { box(g, x - 3, y, 1, 1, C[5]); box(g, x + 3, y + 3, 1, 1, C[5]); }
    box(g, x + 1, -36, 5, 7, dimmed('#E8E4DA')); box(g, x + 1, -36, 1, 7, dimmed('#B8B4AA'));
    box(g, x - 9, -6, 18, 6, INK); box(g, x - 8, -5, 16, 5, D('#8A6A4A')[3]); }
  // ---- two one-sheets on the staves over the waterline, in his words (taped up, a corner lifting)
  const sheet = (x: number, title: string[], tag: string, art: (cx: number, cy: number) => void, bg: string, ink: string) => {
    const w = 76, y = -346, h = 84, B = D(bg);
    box(g, x - 1, y - 1, w + 2, h + 2, INK);
    for (let i = 0; i < 4; i++) box(g, x, y + i * (h / 4), w, h / 4 + 1, B[[2, 3, 3, 2][i]]);
    checker(g, x, y + h / 4 - 1, w, 2, B[2], 0, 2); checker(g, x, y + (h * 3) / 4 - 1, w, 2, B[2], 0, 2);
    art(x + w / 2, y + 38);
    title.forEach((t, i) => signText(g, t, x + w / 2, y + 12 + i * 9, plain(1, 1, hour(ink), '#0A0608')));
    signText(g, tag, x + w / 2, y + h - 5, plain(1, 1, hour('#F4EEE2'), '#0A0608'));
    for (const [tx, ty] of [[x - 2, y - 2], [x + w - 8, y - 2], [x - 2, y + h - 3]] as const) box(g, tx, ty, 10, 5, dimmed('#9A9A90'));
    g.fillStyle = dimmed('#C8C0A8'); g.beginPath(); g.moveTo(x + w + 1, y + h - 10); g.lineTo(x + w + 1, y + h + 1); g.lineTo(x + w - 10, y + h + 1); g.closePath(); g.fill();
  };
  sheet(650, ['LEG DAY II'], 'NO EXCUSES', (cx, cy) => {
    // (a huge calf and a sneaker, kicking up across it)
    const SK = D('#D59C6C');
    g.fillStyle = INK; g.beginPath(); g.moveTo(cx - 26, cy + 30); g.lineTo(cx - 14, cy - 2); g.quadraticCurveTo(cx - 4, cy - 14, cx + 8, cy - 8); g.lineTo(cx - 2, cy + 30); g.closePath(); g.fill();
    g.fillStyle = SK[3]; g.beginPath(); g.moveTo(cx - 24, cy + 29); g.lineTo(cx - 13, cy - 1); g.quadraticCurveTo(cx - 4, cy - 12, cx + 6, cy - 7); g.lineTo(cx - 4, cy + 29); g.closePath(); g.fill();
    box(g, cx - 16, cy + 2, 3, 16, SK[4]);
    box(g, cx + 2, cy - 18, 26, 12, INK); box(g, cx + 3, cy - 17, 24, 10, dimmed('#F4F4F0')); box(g, cx + 3, cy - 9, 24, 2, dimmed('#B91C1C')); box(g, cx + 4, cy - 16, 6, 2, dimmed('#B91C1C'));
    for (let k = 0; k < 3; k++) box(g, cx + 22 + k * 3, cy - 24 + k * 2, 2, 8, dimmed('#FACC15'));
  }, '#1E3A8A', '#FACC15');
  sheet(756, ['THE SPOTTER', 'STARRING BEN'], "HE'S GOT YOU.", (cx, cy) => {
    // (a barbell over a bench, two big hands up under it)
    const S = D('#7A828E'), SK = D('#C68A5E');
    box(g, cx - 30, cy - 4, 60, 3, INK); box(g, cx - 29, cy - 3, 58, 1, S[4]);
    for (const s of [-1, 1]) { box(g, cx + s * 26 - 4, cy - 12, 8, 19, INK); box(g, cx + s * 26 - 3, cy - 11, 6, 17, S[3]); }
    for (const s of [-1, 1]) { box(g, cx + s * 10 - 5, cy - 2, 10, 14, INK); box(g, cx + s * 10 - 4, cy - 1, 8, 12, SK[3]); box(g, cx + s * 10 - 4, cy - 1, 8, 2, SK[4]); box(g, cx + s * 10 - 3, cy + 11, 6, 14, SK[2]); }
    box(g, cx - 24, cy + 26, 48, 4, INK); box(g, cx - 23, cy + 27, 46, 2, D('#2A2A30')[3]);
  }, '#5A0C14', '#F4EEE2');
  // ---- the welding: a fresh plate welded over a hole in a stave behind the bench (its bead bright), scorch round it
  for (let i = 0; i < 4; i++) { g.fillStyle = `rgba(8,6,4,${(0.12 + i * 0.07).toFixed(2)})`; g.beginPath(); g.ellipse(690, -140 - i * 3, 34 - i * 7, 22 - i * 4, 0, 0, Math.PI * 2); g.fill(); }
  { const P = D('#8A8A92'); box(g, 700, -168, 26, 20, INK); box(g, 701, -167, 24, 18, P[3]); box(g, 701, -167, 24, 2, P[4]);
    for (let k = 0; k < 24; k += 3) { box(g, 700 + k, -169, 2, 1, dimmed('#E8C890')); box(g, 700 + k, -148, 2, 1, dimmed('#C8A060')); } }
  for (let k = 0; k < 16; k++) box(g, 664 + hash(k + 900) * 60, -160 + hash(k + 910) * 34, 1, 1, k % 3 ? '#6A5A48' : '#E8C890');
  // ---- the fold-down bench on its drop brackets (off the floor: the tank's floor hatch is under it)
  { const y = -100, a = 636, b = 730, Wd = D('#6A4A2A'), S = D('#7A828E');
    for (const bx of [a + 8, b - 8]) { box(g, bx - 1, y, 3, 26, INK); box(g, bx, y, 1, 26, S[3]); g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(bx, y + 24); g.lineTo(bx + (bx < 680 ? 16 : -16), y + 4); g.stroke(); }
    box(g, a - 1, y - 1, b - a + 2, 8, INK); box(g, a, y, b - a, 6, Wd[3]); box(g, a, y, b - a, 1, Wd[5]); box(g, a, y + 5, b - a, 1, Wd[1]);
    // (the shin guard: white plastic, its straps; the gold statuette half taped down it in silver gaffer)
    box(g, a + 8, y - 14, 40, 14, INK); box(g, a + 9, y - 13, 38, 12, D('#E8E4DA')[3]); box(g, a + 9, y - 13, 38, 3, D('#E8E4DA')[4]); for (const sx of [a + 14, a + 38]) box(g, sx, y - 14, 4, 14, D('#1C1C22')[3]);
    const G = GOLDR.map(c => dimmed(c));
    box(g, a + 14, y - 22, 28, 7, INK); box(g, a + 15, y - 21, 26, 5, G[3]); box(g, a + 15, y - 21, 26, 1, G[5]); g.fillStyle = INK; g.beginPath(); g.arc(a + 44, y - 18, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = G[3]; g.beginPath(); g.arc(a + 44, y - 18, 4, 0, Math.PI * 2); g.fill();
    for (const tx of [a + 20, a + 32]) { box(g, tx, y - 24, 6, 12, dimmed('#9A9AA2')); box(g, tx, y - 24, 6, 1, dimmed('#C8C8D0')); }
    // (the gaffer roll, the glue gun, the soldering iron in its stand, a tub of whey, screws)
    g.fillStyle = INK; g.beginPath(); g.arc(a + 56, y - 7, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = dimmed('#8A8A92'); g.beginPath(); g.arc(a + 56, y - 7, 6, 0, Math.PI * 2); g.fill(); g.fillStyle = Wd[1]; g.beginPath(); g.arc(a + 56, y - 7, 2.5, 0, Math.PI * 2); g.fill();
    box(g, a + 66, y - 12, 12, 6, INK); box(g, a + 67, y - 11, 10, 4, dimmed('#E89A1A')); box(g, a + 70, y - 7, 4, 7, INK); box(g, a + 70, y - 7, 3, 6, dimmed('#E89A1A'));
    g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(a + 80, y - 1); g.lineTo(a + 92, y - 16); g.stroke(); box(g, a + 78, y - 3, 10, 3, S[2]);
    box(g, a + 76, y - 40, 16, 22, INK); box(g, a + 77, y - 39, 14, 21, D('#2A2A30')[3]); box(g, a + 77, y - 39, 14, 3, D('#2A2A30')[4]); box(g, a + 78, y - 31, 12, 6, dimmed('#F0C020')); box(g, a + 80, y - 29, 8, 1, INK);
    for (let k = 0; k < 6; k++) box(g, a + 4 + hash(k + 950) * 80, y - 1, 2, 1, S[5]); }
  // ---- the carton of knockoff statuettes under it (one sticking up out of the flaps)
  { const x = 640, w = 44, t = -26, C = D('#B08A5A');
    box(g, x - 1, t - 1, w + 2, -t + 1, INK); box(g, x, t, w, -t, C[3]); box(g, x, t, w, 2, C[4]); box(g, x + w / 2 - 1, t, 2, 8, C[1]);
    box(g, x - 4, t - 4, 14, 4, C[2]); box(g, x + w - 10, t - 5, 14, 4, C[2]);
    signText(g, 'GIFT SHOP', x + w / 2, t + 18, plain(1, 1, dimmed('#3A2414')));
    const G = GOLDR.map(c => dimmed(c));
    box(g, x + 14, t - 20, 8, 20, INK); box(g, x + 15, t - 19, 6, 19, G[3]); box(g, x + 15, t - 19, 2, 19, G[4]); g.fillStyle = INK; g.beginPath(); g.arc(x + 18, t - 23, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = G[3]; g.beginPath(); g.arc(x + 18, t - 23, 4, 0, Math.PI * 2); g.fill(); }
  // ---- chalk: handprints slapped on the plates by the weights, its dust on the floor under the bar
  for (const [hx, hy] of [[458, -118], [552, -126], [470, -96]] as const) { g.fillStyle = 'rgba(232,228,218,0.2)'; g.beginPath(); g.ellipse(hx, hy, 4, 5, 0, 0, Math.PI * 2); g.fill(); for (let k = 0; k < 4; k++) box(g, hx - 4 + k * 2.4, hy - 9, 1, 4, 'rgba(232,228,218,0.18)'); box(g, hx - 3, hy + 4, 6, 12, 'rgba(232,228,218,0.08)'); }
  checker(g, 440, -3, 120, 2, 'rgba(232,228,218,0.35)', 0, 2);
};

/** The tank's inside (the room), one chunk of it. */
const paintTankChunk = (g: Ctx) => {
  wallTank(g);
  mirror(g, 140, -250);
  clapper(g, 560, -230);
  // (a QUIET ON SET sign; a rolled HAPPYWOOD banner leaning)
  box(g, 380, -300, 70, 22, INK); box(g, 381, -299, 68, 20, '#7F1D1D'); signText(g, 'QUIET ON SET', 415, -285, plain(1, 1, '#FDE68A'));
  chair(g, 160);
  filmCans(g, 250);
  award(g, 340);
  weights(g, 420);
  fresnel(g, 760);
  raft(g);
  paintDen(g);
  // (the floor's puddle that never dries, the crust along the wall's foot)
  for (let r = 0; r < 4; r++) { const hw = 46 - r * 9; box(g, 650 - hw, -2 + 0 * r, hw * 2, 1, r % 2 ? '#3A4A50' : '#4A6068'); }
  checker(g, 0, -6, TW, 4, '#B0AA94', 0, 3);
};

// ---------------------------------------------------------------------------------------------------------------
// The live bits

let bagCv: HTMLCanvasElement | null | undefined;
/** A sandbag (burlap, 25 LB stenciled, its neck tied off, the rope up off the top), baked once: drawn turned. */
const bagCanvas = () => {
  if (bagCv !== undefined) return bagCv;
  if (typeof document === 'undefined') { bagCv = null; return null; }
  const cv = document.createElement('canvas'); cv.width = BAG_W + 8; cv.height = BAG_H + 10;
  const g = cv.getContext('2d')!;
  const B = ['#4A3A22', '#6E5836', '#968050', '#B8A270', '#D6C494'];
  g.translate(4, 8);
  g.fillStyle = INK; g.beginPath(); g.moveTo(BAG_W / 2 - 4, -2); g.lineTo(BAG_W / 2 + 4, -2); g.lineTo(BAG_W + 1, 10); g.lineTo(BAG_W + 1, BAG_H - 3); g.quadraticCurveTo(BAG_W / 2, BAG_H + 3, -1, BAG_H - 3); g.lineTo(-1, 10); g.closePath(); g.fill();
  g.fillStyle = B[2]; g.beginPath(); g.moveTo(BAG_W / 2 - 3, 0); g.lineTo(BAG_W / 2 + 3, 0); g.lineTo(BAG_W, 10); g.lineTo(BAG_W, BAG_H - 4); g.quadraticCurveTo(BAG_W / 2, BAG_H + 1, 0, BAG_H - 4); g.lineTo(0, 10); g.closePath(); g.fill();
  g.fillStyle = B[3]; g.fillRect(1, 11, 6, BAG_H - 16); g.fillStyle = B[4]; g.fillRect(1, 11, 2, BAG_H - 18);
  g.fillStyle = B[1]; g.fillRect(BAG_W - 6, 11, 5, BAG_H - 16);
  for (let y = 12; y < BAG_H - 4; y += 3) for (let x = 2; x < BAG_W - 1; x += 3) { g.fillStyle = (x + y) % 2 ? B[1] : B[3]; g.fillRect(x, y, 1, 1); }
  g.fillStyle = '#7F1D1D'; g.font = '6px monospace';
  g.fillRect(6, 18, 16, 1); g.fillRect(6, 26, 16, 1);
  g.fillStyle = '#5A1414'; for (const [x, y, w] of [[8, 20, 2], [11, 20, 2], [15, 20, 2], [18, 20, 3], [8, 23, 3], [13, 23, 2], [17, 23, 4]] as const) g.fillRect(x, y, w, 2);
  // (the tie at the neck, the rope's end up off it)
  g.fillStyle = INK; g.fillRect(BAG_W / 2 - 5, 2, 10, 4); g.fillStyle = '#C8A870'; g.fillRect(BAG_W / 2 - 4, 3, 8, 2);
  g.fillStyle = INK; g.fillRect(BAG_W / 2 - 1, -8, 3, 10); g.fillStyle = '#E0C890'; g.fillRect(BAG_W / 2, -8, 1, 10);
  bagCv = cv;
  return cv;
};
const drawBags = (c: Ctx, state: GameState) => {
  const h = towerOf(state), cv = bagCanvas(), roof = Y(TANK_F + TANK.h) + 22, f = state.frame;
  for (const b of h.bags) {
    const [x, y] = bagBox(b);
    if (!b.down) {
      // (the rope down off the pipe to it; it, swinging about the rope's top)
      const cx = X(b.x), rope = y - roof;
      c.save(); c.translate(cx, roof); c.rotate(b.sway);
      c.fillStyle = INK; c.fillRect(-1, 0, 3, rope); c.fillStyle = '#C8A870'; c.fillRect(0, 0, 1, rope);
      if (cv) c.drawImage(cv, -BAG_W / 2 - 4, rope - 8);
      c.restore();
    } else {
      // (down: dropped to the floor, split, its sand out in a heap; the rope's cut end swinging)
      const t = f - b.at, k = Math.min(1, t / 14), fy = Y(TANK_F);
      const by = y + (fy - BAG_H + 10 - y) * k * k;
      const cx = X(b.x);
      c.fillStyle = INK; c.fillRect(cx - 1, roof, 3, 30 + Math.sin(t * 0.2) * 3); c.fillStyle = '#C8A870'; c.fillRect(cx, roof, 1, 28);
      if (k < 1) { if (cv) c.drawImage(cv, x - 4, by - 8); }
      else {
        for (let r = 0; r < 5; r++) { const hw = 24 - r * 4; box(c, cx - hw, fy - 2 - r * 2, hw * 2, 2, r % 2 ? '#C8B07A' : '#D8C08A'); }
        box(c, cx - 15, fy - 12, 26, 10, INK); box(c, cx - 14, fy - 11, 24, 8, '#968050'); box(c, cx - 14, fy - 11, 24, 2, '#B8A270');
      }
    }
  }
};
/** The curtain down across the tank (the trial): red velvet in deep folds from the pipe to a gap over the floor, the
 *  gold fringe along its hem. In front of him (he slides under it). */
const drawCurtainDown = (c: Ctx, state: GameState) => {
  const a = X(CURTAIN.a) - 4, w = CURTAIN.b - CURTAIN.a + 8, top = Y(TANK_F + TANK.h) + 18, bot = Y(TANK_F + CURTAIN.gap);
  c.save(); c.translate(a, top);
  stamp(c, 'hwt-curtain', -2, -2, w + 4, bot - top + 12, g => {
    const hh = bot - top;
    box(g, -1, 0, w + 2, hh, INK);
    for (let x = 0; x < w; x++) { const k = [3, 4, 3, 2, 1, 0, 1, 2][x % 8]; box(g, x, 0, 1, hh, VELVET[Math.min(4, k)]); }
    checker(g, 0, 0, w, hh, VELVET[1], 0, 3);
    box(g, -3, 0, w + 6, 6, BRASS[2]); box(g, -3, 0, w + 6, 2, BRASS[4]);
    box(g, 0, hh - 8, w, 8, BRASS[2]); for (let x = 1; x < w; x += 3) box(g, x, hh - 2, 1, 6, BRASS[x % 2 ? 3 : 4]);
  });
  c.restore();
  void state;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** Behind him (before the rigs): the rear frame, the legs, the level boards; the tank's room, its bags, its rolled
 *  curtain, the cannon, Ben. */
export const drawTowerBack = (c: Ctx, state: GameState) => {
  const ax = X(IN_A), bx = X(IN_B);
  if (!seenBox(state, X(TANK.a - WALL) - 60, X(TANK.b + WALL) + 60, Y(TANK_F + TANK.h + 220), GY + 20)) return;
  // The rear frame, tile by tile up the scaffold (set back: scenery)
  for (let h0 = D1B; h0 < TANK_F; h0 += 240) {
    const y = Y(h0 + 240);
    if (!seenBox(state, ax, bx, y, y + 240)) continue;
    still(c, 'hwt-back', ax, y, -6, 0, 812, 240, paintBackTile);
  }
  // The legs (the back two set back, dimmed; the front two at the play plane), over the street
  if (seenBox(state, ax - 60, bx + 60, Y(D1B), GY)) {
    for (const [x, far] of [[ax + 80, true], [bx - 120, true], [ax - WALL, false], [bx, false]] as const) still(c, `hwt-leg-${far ? 1 : 0}`, x, Y(D1B), -8, 0, 56, D1B + 2, g => paintLeg(g, D1B, far));
  }
  // The level boards
  for (const [rx, top, lines] of BOARDS) {
    const x = X(rx), y = Y(top), w = 132;
    if (!seenBox(state, x - 70, x + 70, y, y + 60)) continue;
    still(c, `hwt-board-${rx}`, x - w / 2, y, -3, -3, w + 6, 14 + lines.length * 11 + 8, g => paintBoard(g, lines, w));
  }
  // The tank
  const tx = X(TANK.a), ty = Y(TANK_F);
  if (seenBox(state, tx - 60, tx + TW + 60, ty - TH - 60, ty + 30)) {
    const CH = 3, cw = Math.ceil(TW / CH);
    c.save(); c.translate(tx, ty);
    for (let i = 0; i < CH; i++) {
      const x0 = i * cw;
      if (!seenBox(state, tx + x0, tx + x0 + cw, ty - TH, ty)) continue;
      stamp(c, `hwt-tank-${i}`, x0, -TH - 2, cw, TH + 4, g => { g.save(); g.beginPath(); g.rect(x0, -TH - 2, cw, TH + 4); g.clip(); paintTankChunk(g); g.restore(); });
    }
    const h = towerOf(state);
    const rcx = (CURTAIN.a + CURTAIN.b) / 2 - TANK.a;
    if (!h.curtain) stamp(c, 'hwt-rolled', rcx - 36, -TH + 20, 72, 40, curtainRolled);
    c.restore();
    // (the dust in the fresnel's beam)
    const f = state.frame;
    for (let i = 0; i < 9; i++) {
      const u = ((f * 0.3 + i * 41) % 260) / 260;
      c.fillStyle = `rgba(255,240,200,${(0.12 + 0.3 * Math.sin(u * Math.PI)).toFixed(2)})`;
      c.fillRect(Math.round(tx + 720 - u * 260 + Math.sin(f * 0.02 + i) * 6), Math.round(ty - 162 + (i % 3) * 7 + u * 30), 2, 2);
    }
    // (the chili's steam off the hot plate on the fridge)
    for (let i = 0; i < 3; i++) { const u = ((f * 0.5 + i * 33) % 100) / 100; c.fillStyle = `rgba(230,230,220,${(0.32 * (1 - u)).toFixed(2)})`; c.fillRect(Math.round(tx + 28 + Math.sin(f * 0.05 + i) * 4), Math.round(ty - 80 - u * 40), Math.round(3 + u * 4), Math.round(3 + u * 4)); }
    drawBags(c, state);
    drawCannon(c, h.cannon, HOLLYWOOD);
    drawCannonChain(c, h.cannon, gateK(state, h.gate));
    drawGate(c, state, h.gate, 'trapdoor');
    const b = h.ben;
    drawBen(c, X(BEN_X), ty, b.facing, b.pose, Math.floor(b.poseT / 5), b.piece);
  }
};

/** Over the rigs (still behind him): the walls, the decks and their hatches, the perch, the tank's shell and roof. */
export const drawTowerOver = (c: Ctx, state: GameState) => {
  if (!seenBox(state, X(TANK.a - WALL) - 60, X(TANK.b + WALL) + 60, Y(TANK_F + TANK.h + 220), GY + 20)) return;
  const h = towerOf(state);
  // The side walls, up from under the first deck to the tank
  for (const x of [X(IN_A - WALL), X(IN_B)]) for (let h0 = D1B; h0 < TANK_F; h0 += 240) {
    const top = Math.min(TANK_F, h0 + 240), y = Y(top);
    if (!seenBox(state, x, x + WALL, y, y + 240)) continue;
    c.save(); c.beginPath(); c.rect(x - 2, y, WALL + 4, top - h0); c.clip();
    still(c, 'hwt-wall', x, Y(h0 + 240), -1, 0, WALL + 2, 240, paintWallTile);
    c.restore();
  }
  // The decks (either side of each hatch) and the hatches
  for (const hk of h.hatches) {
    const k = hk.k, tank = k === 5, a = tank ? TANK.a - WALL : IN_A - WALL, b = tank ? TANK.b + WALL : IN_B + WALL;
    const y = hk.top;
    if (!seenBox(state, X(a), X(b), y - 10, y + 160)) continue;
    const x0 = HATCH_X[k], x1 = x0 + HATCH_W;
    still(c, `hwt-deck-${k}-l`, X(a), y, -2, -2, x0 - a + 4, DECK_T + 4, g => paintDeck(g, x0 - a, false, true, tank));
    still(c, `hwt-deck-${k}-r`, X(x1), y, -2, -2, b - x1 + 4, DECK_T + 4, g => paintDeck(g, b - x1, true, false, tank));
    drawHatch(c, hk, tank);
  }
  // The perch on level 4 (a cantilevered grating shelf off the rear frame, lit along its lip)
  {
    const [a, b, hh] = PERCH, x = X(a), y = Y(hh), w = b - a;
    if (seenBox(state, x, x + w, y - 20, y + 40)) still(c, 'hwt-perch', x, y, -2, -2, w + 4, 40, g => {
      const S = ramp6(hour('#626A76'));
      g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(8, 12); g.lineTo(22, 34); g.moveTo(w - 8, 12); g.lineTo(w - 22, 34); g.stroke();
      g.strokeStyle = S[3]; g.lineWidth = 1; g.beginPath(); g.moveTo(8, 12); g.lineTo(22, 34); g.moveTo(w - 8, 12); g.lineTo(w - 22, 34); g.stroke();
      box(g, -1, -1, w + 2, 14, INK); box(g, 0, 0, w, 12, S[1]); for (let k = 1; k < w; k += 4) box(g, k, 3, 2, 6, S[3]);
      box(g, 0, 0, w, 3, LIP[2]); box(g, 0, 0, w, 1, LIP[3]);
    });
  }
  // The tank's shell (cut away round the room), its ceiling, the cone roof over it, HAPPYWOOD round the band, the finial
  const tx = X(TANK.a), ty = Y(TANK_F);
  if (seenBox(state, tx - WALL - 40, tx + TW + WALL + 40, ty - TH - 220, ty + 10)) {
    c.save(); c.translate(tx, ty);
    stamp(c, `hwt-shell-${timeOfDay().key}`, -WALL - 30, -TH - 210, TW + WALL * 2 + 60, TH + 216, paintShell);
    c.restore();
    // (the vent's lid: shut, or blown open)
    const vx = X(VENT.a), vy = Y(TANK_F + TANK.h + 40), open = !h.lid;
    box(c, vx - 1, vy - 1, VENT.b - VENT.a + 2, open ? 6 : 42, INK);
    if (!open) { box(c, vx, vy, VENT.b - VENT.a, 40, '#4A505C'); box(c, vx, vy, VENT.b - VENT.a, 3, '#8890A0'); for (let k = 6; k < VENT.b - VENT.a; k += 10) box(c, vx + k, vy + 8, 3, 24, '#2C3038'); }
    else { c.save(); c.translate(vx, vy); c.rotate(-1.2); box(c, 0, -4, VENT.b - VENT.a, 6, '#4A505C'); c.restore(); }
    // (the finial's light, blinking after dark)
    if (timeOfDay().lamps > 0.25 && (state.frame >> 5) % 2 === 0) box(c, tx + TW / 2 - 3, ty - TH - 206, 6, 4, '#FF5A5A');
  }
};
/** The tank's shell round the room (local: x from its inside's left, y up from its floor): the two walls (thick riveted
 *  steel, the cut face lit), the ceiling, the cone roof over it with HAPPYWOOD round its band, the finial. */
const paintShell = (g: Ctx) => {
  const S = ramp6(hour('#7A8088')), T = ramp6(hour('#9AA2AC'));
  for (const x of [-WALL, TW]) {
    box(g, x - 1, -TH - 41, WALL + 2, TH + 41 + DECK_T, INK);
    box(g, x, -TH - 40, WALL, TH + 40 + DECK_T, S[2]);
    box(g, x + (x < 0 ? WALL - 4 : 0), -TH - 40, 4, TH + 40, S[4]);
    for (let y = -TH - 30; y < DECK_T; y += 14) { box(g, x + 10, y, 3, 3, S[0]); box(g, x + 26, y + 7, 3, 3, S[0]); }
    checker(g, x, -TH - 40, WALL, TH + 40 + DECK_T, S[1], 0, 3);
  }
  // (the ceiling, its riveted underside; the vent's gap left for the lid)
  box(g, -WALL - 1, -TH - 41, VENT.a - TANK.a + WALL + 1, 42, INK);
  box(g, -WALL, -TH - 40, VENT.a - TANK.a + WALL, 40, S[2]); box(g, -WALL, -2 - TH, VENT.a - TANK.a + WALL, 2, S[0]);
  for (let x = -30; x < VENT.a - TANK.a; x += 16) box(g, x, -TH - 6, 3, 3, S[1]);
  // (the cone roof: banded, lit up its left slope; HAPPYWOOD round the band under it)
  const cx = TW / 2, base = -TH - 40;
  g.fillStyle = INK; g.beginPath(); g.moveTo(-WALL - 26, base + 1); g.lineTo(cx, base - 170); g.lineTo(TW + WALL + 26, base + 1); g.closePath(); g.fill();
  g.fillStyle = T[3]; g.beginPath(); g.moveTo(-WALL - 24, base); g.lineTo(cx, base - 167); g.lineTo(cx, base); g.closePath(); g.fill();
  g.fillStyle = T[1]; g.beginPath(); g.moveTo(cx, base - 167); g.lineTo(TW + WALL + 24, base); g.lineTo(cx, base); g.closePath(); g.fill();
  for (let k = 1; k < 6; k++) { const yy = base - 167 + k * 28, hw = (k * 28 / 167) * (TW / 2 + WALL + 24); box(g, cx - hw, yy, hw * 2, 2, T[2]); box(g, cx - hw, yy - 1, hw * 2, 1, T[4]); }
  box(g, -WALL - 24, base - 30, TW + WALL * 2 + 48, 30, T[0]); box(g, -WALL - 24, base - 30, TW + WALL * 2 + 48, 2, T[4]);
  signText(g, 'HAPPYWOOD', cx, base - 6, plain(3, 2, hour('#3B6AC8'), '#14306A'));
  box(g, cx - 3, base - 196, 6, 30, INK); box(g, cx - 2, base - 196, 4, 30, S[4]);
  g.fillStyle = INK; g.beginPath(); g.arc(cx, base - 198, 6, 0, Math.PI * 2); g.fill(); g.fillStyle = S[5]; g.beginPath(); g.arc(cx, base - 198, 4, 0, Math.PI * 2); g.fill();
};
/** A rig hatch: shut, a tread plate flush with the deck (hazard-striped round it, lit along its lip: you can stand on
 *  it); opening, its two leaves swinging down off their hinges at the hatch's sides. */
const drawHatch = (c: Ctx, hk: Hatch, tank: boolean) => {
  const x = hk.x0, y = hk.top, half = HATCH_W / 2, S = ramp6(hour(tank ? '#6E625A' : '#7A828E'));
  const leaf = () => {
    box(c, -1, -1, half + 2, DECK_T - 8, INK); box(c, 0, 0, half, DECK_T - 10, S[3]);
    for (let k = 4; k < half - 2; k += 8) for (let r = 4; r < DECK_T - 12; r += 6) box(c, k + (r % 12 ? 4 : 0), r, 3, 1, S[5]);
    for (let k = 0; k < half; k += 6) box(c, k, DECK_T - 12, 3, 2, (k / 6) % 2 ? INK : HAZ);
  };
  if (hk.swing <= 0.01) {
    // (shut: both leaves flat, the seam down the middle, the latch and its pull line's eye; lit along the top)
    for (const s of [0, 1]) { c.save(); c.translate(x + s * half, y); leaf(); c.restore(); }
    box(c, x + half - 1, y, 2, DECK_T - 10, INK); box(c, x + half - 6, y + 4, 12, 6, '#2A2A30'); box(c, x + half - 4, y + 5, 8, 2, '#C8CCD4');
    box(c, x, y, HATCH_W, 3, LIP[2]); box(c, x, y, HATCH_W, 1, LIP[3]);
    if (tank) { c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.ellipse(x + half, y + 7, half + 6, 9, 0, 0, Math.PI); c.stroke(); }
  } else {
    // (opening: each leaf turned down about its hinge, at the hatch's side; the frame's dark hole between)
    box(c, x, y, HATCH_W, DECK_T, '#0E0C10');
    for (const s of [0, 1]) {
      c.save(); c.translate(s ? x + HATCH_W : x, y + 2); c.rotate((s ? -1 : 1) * hk.swing * Math.PI / 2); if (s) c.scale(-1, 1); leaf(); c.restore();
    }
  }
};

/** In front of him: the curtain while it's down (he slides under it), Ben's words over his head (not while his
 *  gross-up has them). */
export const drawTowerFront = (c: Ctx, state: GameState) => {
  if (!seenBox(state, X(TANK.a), X(TANK.b), Y(TANK_F + TANK.h), Y(TANK_F) + 10)) return;
  const h = towerOf(state);
  if (h.curtain) drawCurtainDown(c, state);
  // (the near roof pipe and a sagging cable across the top of the tank, in silhouette)
  { const tx = X(TANK.a), ty = Y(TANK_F);
    c.save(); c.translate(tx, ty);
    stamp(c, 'hwt-near', -WALL, -TH - 4, TW + WALL * 2, 30, g => {
      box(g, -WALL, -TH, TW + WALL * 2, 10, '#08060A'); box(g, -WALL, -TH + 10, TW + WALL * 2, 1, '#2A2028');
      for (let x = 40; x < TW; x += 180) { box(g, x, -TH - 2, 12, 16, '#08060A'); box(g, x + 1, -TH + 15, 10, 1, '#2A2028'); }
      g.strokeStyle = '#08060A'; g.lineWidth = 2; g.beginPath(); g.moveTo(250, -TH + 8); g.quadraticCurveTo(330, -TH + 24, 420, -TH + 8); g.stroke();
    });
    c.restore(); }
  if (h.ben.said && !h.script?.gross) saidOver(c, h.ben.said.text, X(BEN_X), benHeadY(Y(TANK_F)), '#FFFFFF', 220);
};

/** Screen space: his gross-up while it's up; SKIP >> while the scene can be skipped. */
export const drawTowerHud = (c: Ctx, state: GameState) => {
  if (!inTank(state)) return;
  const h = towerOf(state), sc = h.script;
  if ((h.phase === 'meet' || h.phase === 'gift') && sc?.gross) {
    drawBenGrossBack(c, W, H);
    drawBenGross(c, W / 2, H / 2 - 10, 0.9 + 0.1 * Math.min(1, sc.grossT / 10), state.frame, h.phase === 'meet' ? 'legs' : null, !!h.ben.said);
    if (h.ben.said) saidOver(c, h.ben.said.text, W / 2 + 60, 120);
  }
  if ((h.phase === 'meet' || h.phase === 'gift') && h.all > SKIP_AFTER) drawSkipPrompt(c, W);
};

/** The tank's own dark (deeper, a rusty brown), the fresnel's beam across it, the mirror's bulbs, the daylight up
 *  through the manhole while it's open, the sky down the vent while it's blown, a glow about him. Null out of it. */
export const tankLighting = (state: GameState): SceneLight | null => {
  if (!tankView(state)) return null;
  const h = towerOf(state), p = state.player, tx = X(TANK.a), ty = Y(TANK_F);
  const lights: Light[] = [
    { x: tx + 730, y: ty - 162, r: 380, cone: 70, a: 0.75, color: 'rgba(255,236,190,0.10)' },
    { x: tx + 730, y: ty - 162, r: 90, a: 0.7, color: 'rgba(255,236,190,0.14)' },
    { x: tx + 190, y: ty - 210, r: 120, a: 0.65, color: 'rgba(255,220,150,0.12)' },
    { x: tx + 28, y: ty - 58, r: 60, a: 0.45, color: 'rgba(248,113,80,0.12)' },
    { x: p.pos.x + p.width / 2, y: p.pos.y + 24, r: 150, a: 0.35 },
  ];
  const hk5 = h.hatches[4];
  if (hk5 && hk5.swing > 0) lights.push({ x: (hk5.x0 + hk5.x1) / 2, y: hk5.top, r: 160, a: 0.6 * hk5.swing, color: 'rgba(220,235,255,0.10)' });
  if (!h.lid) lights.push({ x: X((VENT.a + VENT.b) / 2), y: Y(TANK_F + TANK.h), r: 180, a: 0.6, color: 'rgba(220,235,255,0.10)' });
  void mix;
  return { dark: 0.5, shade: [18, 12, 8], lights };
};
