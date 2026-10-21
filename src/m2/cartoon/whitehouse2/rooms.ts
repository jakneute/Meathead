// The cartoon West Wing's rooms (part two's SNES pass, on part one's kit: whitehouse1/paint.ts): each room a set cut
// away along its back, drawn to the one eye (the middle of the screen): the back wall at D_BACK painted once for the
// hour into a stamp (the windows show the grounds by the hour), the ceiling and the floor going back from it to the play
// plane in stepped bands with their patterns, the house's own brick above the ceiling (the cartoon's cutaway), the
// doorways between the rooms (pilastered, a lit sliver of the next room through them). Live over the walls: candle
// flames, the fireplaces' fires, the clock's pendulum, the ON AIR box, the phone lines, the water cooler's bubble, the
// fax's paper, the Situation Room's screens and its beacon.
//
// Every room specific and full (what's on its back wall):
//   OFFICES      mint pinstripe paper, binders in bookcases, a water cooler, desks of beige computers and in-trays (dimmed),
//                a corkboard of memos, venetian blinds onto the grounds, a copier, a fax spitting paper, DAYS WITHOUT A
//                SCANDAL: 0, NEVER FILE IN THE WRONG DRAWER!, the clock, a coat rack, a ficus
//   ROOSEVELT    the room as the EIB studio: Teddy over the fireplace, the moose head, the producer behind the booth's
//                glass, egg-crate foam behind the desk, THE EIB NETWORK banner, ON AIR, the studio clock, gold records,
//                TALENT ON LOAN FROM GOD, the call board (DITTO LINES 1-6, lit), the flags
//   KITCHENS     white tile with a blue band, the giant fridge (magnets, a drawing of Socks), shelves of cans, the hood
//                over the range, the utensil rail, the chalkboard menu, the sink under its window, the dish rack, the
//                spice rack, WASH YOUR HANDS, a mop in its bucket
//   CABINET      cream and gold, French windows in gold swags onto the Rose Garden, the fireplace and the eagle over
//                it, Washington, Jefferson and Franklin, sconces, the flags, a bust on a console, two chandeliers
//   MAP ROOM     oak paneling, the big cartoon war map (pins, yarn, MEAN MEN HQ?), framed charts, FDR, a ship's wheel, a
//                telescope on its stand, bookcases of atlases, a compass rose, a globe's empty bracket
//   SITUATION    slate acoustic panels, the wall of monitors (radar sweeps, a map with blinking dots, MEAN MEN ALERT), the
//                big screen, DEFCON 1, the world's clocks, the red phone, the beacon off the ceiling
//   OUTER OVAL   peach paper with dots, the secretary's desk (the typewriter, the intercom), the grandfather clock,
//                portraits, a sofa, PLEASE WAIT, the Oval Office's door under its eagle
//   OVAL OFFICE  the curved walls going round (niches with shelves, a door each side), three tall windows onto the Rose
//                Garden in gold drapes, the flags, the credenza of family photos (Socks's among them); the ceiling's
//                plaster Seal; the oval rug with the Seal going back to the eye

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { signText } from '../../signLetters';
import { timeOfDay, skyAt } from '../../timeOfDay';
import { box, mix, hash, checker, still, INK, toonLetters, type Ctx } from '../kit';
import {
  R, GILT, MARBLE, NAVY, OAK, VELVET, inkP, slabI, stepsAcross, stepsDown, pilaster, crown, wainscot, wallpaper,
  giltFrame, portrait, plaque, seal, sconce, sconceFlames, candleFlames, drapes, windowAt, door, fireplace, fireAt, bust,
  flagStand, grandfatherClock, clockPendulum, consoleVase, bookcase, pottedPalm, sofa, chandelierArt, chandelierFlames, cutaway,
  starAt, ENGRAVED, tinyLetters, type R6,
} from '../whitehouse1/paint';
import { proj, atDepth, seenAt, quad, type P } from '../whitehouse1/rooms';
import { ROOMS, D_BACK, CEIL, X, Y, type Room } from './layout';
import { GY } from '../geometry';

const H = CEIL;
const dim = (col: string) => mix(col, '#8E86B4', 0.3);
const dimR = (Rm: R6): R6 => Rm.map(dim);

// ---------------------------------------------------------------------------------------------------------------
// The rooms' looks

type Floor = 'carpet' | 'parquet' | 'checker' | 'tiles' | 'rug' | 'oval';
type Ceil = 'coffer' | 'drop' | 'dark';
interface Look { wall: string; paper: string; dado: string; ceil: string; ceilKind: Ceil; floor: Floor; floorCol: string; floorCol2: string }
const LOOK: Partial<Record<Room['id'], Look>> = {
  offices: { wall: '#CFE8D8', paper: 'stripe', dado: '#8EAE9C', ceil: '#EEF2F0', ceilKind: 'drop', floor: 'carpet', floorCol: '#5A6E8A', floorCol2: '#8A9AB4' },
  roosevelt: { wall: '#F2DEB2', paper: 'none', dado: '#B88A50', ceil: '#FBF1DC', ceilKind: 'coffer', floor: 'rug', floorCol: '#B57438', floorCol2: '#1E3A8A' },
  kitchen: { wall: '#F4F6F8', paper: 'tiles', dado: '#5A8ED8', ceil: '#EEF2F6', ceilKind: 'drop', floor: 'checker', floorCol: '#ECEAF2', floorCol2: '#2A2A3A' },
  cabinet: { wall: '#F5E6C0', paper: 'none', dado: '#E6D2A6', ceil: '#FFF8E6', ceilKind: 'coffer', floor: 'carpet', floorCol: '#22408E', floorCol2: '#E2B33C' },
  map: { wall: '#B88A54', paper: 'oak', dado: '#8A5A30', ceil: '#F5EBD5', ceilKind: 'coffer', floor: 'rug', floorCol: '#9C6A3A', floorCol2: '#7A1E2E' },
  situation: { wall: '#2E3A52', paper: 'panels', dado: '#1E2636', ceil: '#1E2434', ceilKind: 'dark', floor: 'tiles', floorCol: '#3A4458', floorCol2: '#22293A' },
  outer: { wall: '#FBDCC0', paper: 'dots', dado: '#E0AA8A', ceil: '#FFF3DE', ceilKind: 'coffer', floor: 'carpet', floorCol: '#3E6FB0', floorCol2: '#F2C84A' },
  oval: { wall: '#FFF0CC', paper: 'none', dado: '#EED8A4', ceil: '#FFFBEF', ceilKind: 'coffer', floor: 'oval', floorCol: '#E8D8A8', floorCol2: '#1E3A8A' },
};
/** The next room's color (the sliver seen through a doorway): left, right. */
const NEXT: Partial<Record<Room['id'], [string, string]>> = {
  offices: ['#F8F7F2', '#F2DEB2'], roosevelt: ['#CFE8D8', '#F4F6F8'], kitchen: ['#F2DEB2', '#F5E6C0'], cabinet: ['#F4F6F8', '#B88A54'],
  map: ['#F5E6C0', '#2E3A52'], situation: ['#B88A54', '#FBDCC0'], outer: ['#2E3A52', '#FFF0CC'],
};

/** The Oval Office's shape: its curve's ends (the room's ends at the play plane), the flat wall's ends at D_BACK. */
const OV = { a: 9950, fa: 10150, fb: 10650, b: 10850 };

// ---------------------------------------------------------------------------------------------------------------
// Bits for the walls (local: x from the room's left, y 0 the floor, up is minus)

/** A molded panel (a frame of molding, its field a touch darker). */
const moldPanel = (g: Ctx, x: number, y: number, w: number, h: number, W: R6) => {
  box(g, x, y, w, h, W[2]); box(g, x + 2, y + 2, w - 4, h - 4, W[4]); box(g, x + 4, y + 4, w - 8, h - 8, W[3]);
  box(g, x + 4, y + 4, w - 8, 1, W[2]); box(g, x + 4, y + 4, 1, h - 8, W[2]);
};
/** A doorway between rooms (its middle x, foot y): pilasters, an arch and a keystone, the passage dark, the next room lit. */
const doorway = (g: Ctx, x: number, foot: number, W: R6, next: string) => {
  const w = 80, h = 200;
  pilaster(g, x - w / 2 - 10, foot, foot - h - 10, 18, W);
  pilaster(g, x + w / 2 + 10, foot, foot - h - 10, 18, W);
  const path = () => { g.moveTo(x - w / 2, foot); g.lineTo(x - w / 2, foot - h + 46); g.quadraticCurveTo(x, foot - h - 30, x + w / 2, foot - h + 46); g.lineTo(x + w / 2, foot); g.closePath(); };
  g.save(); g.beginPath(); path(); g.clip();
  const D = ['#120A1A', '#1E1028', '#2A1836', '#3A2446'];
  for (let i = 0; i < 4; i++) box(g, x - w / 2, foot - h - 40 + i * 46, w, 48, D[3 - i]);
  checker(g, x - w / 2, foot - h + 6, w, 2, D[1], 0, 1);
  const N = R(next);
  box(g, x - 22, foot - 120, 44, 120, N[2]); box(g, x - 22, foot - 120, 44, 6, N[3]); box(g, x - 22, foot - 18, 44, 18, N[1]); box(g, x - 22, foot - 120, 2, 120, N[4]);
  g.restore();
  g.beginPath(); path(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
  g.strokeStyle = W[4]; g.lineWidth = 2; g.beginPath(); g.moveTo(x - w / 2 - 4, foot - h + 46); g.quadraticCurveTo(x, foot - h - 36, x + w / 2 + 4, foot - h + 46); g.stroke();
  slabI(g, x - 9, foot - h - 30, 18, 20, GILT);
};
/** A wall clock (its middle x, y; radius r): a rim in steps, the face, the ticks, the hands (the hour's). */
const wallClock = (g: Ctx, x: number, y: number, r: number, rim: R6 = R('#2A2A36'), face = '#FFFBEF') => {
  inkP(g, () => g.arc(x, y, r, 0, Math.PI * 2), rim[3], 2); box(g, x - r * 0.6, y - r + 1, r * 0.5, 2, rim[5]);
  inkP(g, () => g.arc(x, y, r - 4, 0, Math.PI * 2), face, 1.4);
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; box(g, x + Math.cos(a) * (r - 7) - 1, y + Math.sin(a) * (r - 7) - 1, 2, 2, INK); }
  const h = timeOfDay().key.length * 0.9 + 1.3;
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(h) * (r - 10), y + Math.sin(h) * (r - 10)); g.moveTo(x, y); g.lineTo(x + Math.cos(-1.2) * (r - 6), y + Math.sin(-1.2) * (r - 6)); g.stroke();
  box(g, x - 1, y - 1, 3, 3, '#DC2626');
};
/** Venetian blinds over a window (x the middle, the sill y, w × h): the grounds by the hour through the slats, a cord. */
const blinds = (g: Ctx, x: number, sill: number, w: number, h: number, view: number) => {
  const tod = timeOfDay(), x0 = Math.round(x - w / 2), y0 = Math.round(sill - h);
  slabI(g, x0 - 8, y0 - 8, w + 16, h + 14, MARBLE);
  g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip();
  for (let i = 0; i < 6; i++) box(g, x0, y0 + (i * h * 0.7) / 6, w, (h * 0.7) / 6 + 1, skyAt(0.2 + i * 0.12, tod));
  for (let k = 0; k < 6; k++) { const tx = x0 + (k / 5) * w, tr = 8 + hash(k + view) * 8; g.fillStyle = mix('#3A7A4A', skyAt(0.9, tod), 0.25); g.beginPath(); g.arc(tx, y0 + h * 0.66 - tr * 0.4, tr, 0, Math.PI * 2); g.fill(); }
  box(g, x0, y0 + h * 0.68, w, h * 0.32, mix('#5AB45A', tod.haze, 0.15));
  if (tod.lamps > 0.3) checker(g, x0, y0, w, h, '#FFE8A0', 0, 2);
  // (the slats: half drawn, tilted; lit edges)
  for (let y = y0; y < y0 + h * 0.55; y += 6) { box(g, x0, y, w, 4, '#E8E4D8'); box(g, x0, y, w, 1, '#FFFFFF'); box(g, x0, y + 3, w, 1, '#B8B4A8'); }
  box(g, x0, y0 + h * 0.55, w, 5, '#C8C4B8');
  g.restore();
  box(g, x0 + w - 8, y0, 1, h * 0.75, '#8A8676'); box(g, x0 + w - 10, y0 + h * 0.75, 5, 6, '#E8E4D8');
  slabI(g, x0 - 12, sill, w + 24, 8, MARBLE);
};
/** A beige office computer (x the middle, y the desk top): the CRT, its screen (green text), the keyboard. */
const crt = (g: Ctx, x: number, y: number, Rm = R('#D8CCA8')) => {
  slabI(g, x - 18, y - 36, 36, 32, Rm); box(g, x - 13, y - 31, 26, 20, INK); box(g, x - 12, y - 30, 24, 18, '#0E3A2A');
  for (let k = 0; k < 4; k++) box(g, x - 10, y - 27 + k * 4, 8 + ((k * 7) % 12), 1, '#4ADE80');
  slabI(g, x - 10, y - 4, 20, 4, Rm); slabI(g, x - 22, y - 2, 30, 3, Rm);
};
/** An office desk against the wall (dimmed: scenery), its drawers, a chair's back. */
const officeDesk = (g: Ctx, x0: number, w: number, top: number) => {
  const O = dimR(OAK);
  slabI(g, x0, -top, w, 6, O);
  slabI(g, x0 + 4, -top + 6, 46, top - 6, O); for (let k = 0; k < 3; k++) { box(g, x0 + 8, -top + 12 + k * ((top - 14) / 3), 38, 1, O[1]); box(g, x0 + 24, -top + 18 + k * ((top - 14) / 3), 6, 2, dim(GILT[4])); }
  slabI(g, x0 + w - 12, -top + 6, 8, top - 6, O);
};
const inTray = (g: Ctx, x: number, y: number) => { slabI(g, x - 14, y - 10, 28, 10, R('#7A7A86')); for (let k = 0; k < 3; k++) box(g, x - 12, y - 12 - k * 2, 24, 2, k % 2 ? '#F8F8F0' : '#E8E4D8'); };
/** A water cooler (x, foot): the jug (the bubble's live), the white body, the taps, a stack of cones. */
const cooler = (g: Ctx, x: number) => {
  slabI(g, x - 18, -96, 36, 96, R('#E8E8EE'));
  box(g, x - 10, -70, 6, 6, '#3B82F6'); box(g, x + 4, -70, 6, 6, '#DC2626'); box(g, x - 14, -40, 28, 2, MARBLE[2]);
  inkP(g, () => { g.moveTo(x - 16, -96); g.quadraticCurveTo(x - 20, -140, x - 8, -152); g.lineTo(x + 8, -152); g.quadraticCurveTo(x + 20, -140, x + 16, -96); g.closePath(); }, 'rgba(147,197,253,0.85)', 2);
  box(g, x - 12, -138, 4, 34, '#DBEAFE'); box(g, x - 6, -156, 12, 6, '#2563EB');
  for (let k = 0; k < 4; k++) inkP(g, () => { g.moveTo(x + 22, -60 - k * 4); g.lineTo(x + 32, -60 - k * 4); g.lineTo(x + 27, -52 - k * 4); g.closePath(); }, '#FFFFFF', 0.8);
};
/** A corkboard (x0, y0, w, h): the cork dithered, memos pinned (each its pin, lines of type). */
const corkboard = (g: Ctx, x0: number, y0: number, w: number, h: number, seed = 0) => {
  slabI(g, x0, y0, w, h, OAK);
  box(g, x0 + 6, y0 + 6, w - 12, h - 12, '#B8885A'); checker(g, x0 + 6, y0 + 6, w - 12, h - 12, '#A07446', 0, 1);
  for (let k = 0; k < 7; k++) {
    const mx = x0 + 10 + hash(seed + k) * (w - 44), my = y0 + 10 + hash(seed + k * 3) * (h - 44), mw = 22 + hash(k * 5 + seed) * 10, mh = 24;
    box(g, mx + 1, my + 1, mw, mh, '#6A4A2A'); box(g, mx, my, mw, mh, ['#FFFFFF', '#FDE68A', '#FBCFE8', '#BFDBFE'][k % 4]);
    for (let l = 0; l < 4; l++) box(g, mx + 3, my + 6 + l * 4, mw - 6 - (l % 2) * 6, 1, '#6A6A7A');
    box(g, mx + mw / 2 - 1, my - 1, 3, 3, ['#DC2626', '#2563EB', '#16A34A'][k % 3]);
  }
};
const copier = (g: Ctx, x: number) => {
  slabI(g, x - 40, -92, 80, 92, R('#C8C8D2'));
  slabI(g, x - 44, -104, 88, 12, R('#9A9AA8')); box(g, x - 30, -100, 40, 3, '#3A3A48');
  for (let k = 0; k < 3; k++) { box(g, x - 34, -80 + k * 24, 68, 18, '#A8A8B6'); box(g, x - 34, -80 + k * 24, 68, 1, '#E2E2EA'); box(g, x - 8, -72 + k * 24, 16, 3, '#6A6A7A'); }
  box(g, x + 18, -100, 14, 6, INK); box(g, x + 20, -99, 4, 4, '#22C55E');
  signText(g, 'XERX', x, -84, tinyLetters(['#3A3A48', '#1A1A28']));
};
const faxMachine = (g: Ctx, x: number, y: number) => {
  slabI(g, x - 22, y - 18, 44, 18, R('#E2DCC8')); box(g, x - 18, y - 22, 26, 4, '#3A3A48'); box(g, x + 10, y - 14, 8, 6, '#4ADE80');
  for (let k = 0; k < 6; k++) box(g, x - 18 + (k % 3) * 5, y - 12 + Math.floor(k / 3) * 4, 3, 2, '#6A6A7A');
};
const coatRack = (g: Ctx, x: number) => {
  box(g, x - 2, -190, 5, 190, INK); box(g, x - 1, -190, 3, 190, OAK[3]);
  inkP(g, () => g.ellipse(x, -2, 18, 4, 0, 0, Math.PI * 2), OAK[2], 1.4);
  for (const s of [-1, 1]) { g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(x, -180); g.quadraticCurveTo(x + s * 14, -186, x + s * 16, -176); g.stroke(); }
  // (a trench coat and a fedora on it)
  stepsAcross(g, () => { g.moveTo(x + 4, -176); g.lineTo(x + 24, -172); g.lineTo(x + 30, -90); g.lineTo(x + 6, -94); g.closePath(); }, x + 2, -178, 30, 90, R('#B89A6A'), 1.6);
  for (let k = 0; k < 3; k++) box(g, x + 14, -150 + k * 16, 2, 2, '#5A4A2A');
  inkP(g, () => g.ellipse(x - 12, -182, 14, 4, 0, 0, Math.PI * 2), '#4A3A2A', 1.2); inkP(g, () => g.roundRect(x - 20, -194, 16, 12, [6, 6, 0, 0]), '#4A3A2A', 1.2); box(g, x - 20, -186, 16, 2, '#1A1A22');
};
/** A wall sign: a board in steps, its words (two rows). */
const wallSign = (g: Ctx, x: number, y: number, w: number, h: number, board: string, rows: [string, string[]][]) => {
  slabI(g, x - w / 2, y, w, h, R(board));
  rows.forEach(([t, fill], i) => signText(g, t, x, y + 12 + i * 11, tinyLetters(fill)));
};

// ---------------------------------------------------------------------------------------------------------------
// The back walls

interface Live {
  flames: [number, number][]; fires: [number, number][]; clock?: [number, number];
  onair?: [number, number]; phones: [number, number][]; cooler?: [number, number]; fax?: [number, number];
  screens: [number, number, number, number, number][]; beacon?: [number, number]; defcon?: [number, number];
}
const fresh = (): Live => ({ flames: [], fires: [], phones: [], screens: [] });

const paintWall = (g: Ctx, r: Room, live: Live, w: number) => {
  const L = LOOK[r.id]!, W = R(L.wall), Dd = R(L.dado);
  const flames = (x: number, y: number) => { sconce(g, x, y); live.flames.push(...sconceFlames(x, y)); };
  const lamp = (x: number, drop: number, cw = 80) => { chandelierArt(g, x, -H + 28, drop, cw); live.flames.push(...chandelierFlames(x, -H + 28, drop, cw)); };
  // (the wall's field)
  if (L.paper === 'tiles') {
    box(g, 0, -H, w, H, W[3]);
    for (let y = -H + 30; y < 0; y += 20) for (let x = (((y / 20) | 0) % 2) * 10; x < w; x += 20) { box(g, x, y, 19, 19, W[4]); box(g, x, y, 19, 1, W[5]); box(g, x + 18, y, 1, 19, W[2]); }
    for (let x = 0; x < w; x += 20) { box(g, x, -130, 19, 19, Dd[3]); box(g, x, -130, 19, 2, Dd[4]); box(g, x + 18, -130, 1, 19, Dd[2]); }
    box(g, 0, -16, w, 16, Dd[2]); box(g, 0, -16, w, 2, Dd[4]);
  } else if (L.paper === 'oak') {
    box(g, 0, -H, w, H, W[3]);
    for (let x = 10; x < w - 60; x += 96) moldPanel(g, x, -H + 50, 86, H - 190, W);
    wainscot(g, 0, w, -120, 0, Dd, 96);
  } else if (L.paper === 'panels') {
    // (acoustic panels in a grid, each stepped, a seam between)
    box(g, 0, -H, w, H, W[1]);
    for (let y = -H + 36; y < -40; y += 70) for (let x = 6; x < w - 60; x += 80) { box(g, x, y, 74, 64, W[2]); box(g, x + 2, y + 2, 70, 60, W[3]); box(g, x + 2, y + 2, 70, 2, W[4]); checker(g, x + 4, y + 8, 66, 52, W[2], 0, 2); }
    box(g, 0, -40, w, 40, Dd[2]); box(g, 0, -40, w, 2, Dd[4]); box(g, 0, -12, w, 12, Dd[1]);
  } else {
    wallpaper(g, 0, -H, w, H, L.paper, W);
    if (L.paper === 'none') for (let x = 20; x < w - 100; x += 150) moldPanel(g, x, -H + 60, 130, H - 210, W);
    wainscot(g, 0, w, -110, 0, Dd);
  }
  crown(g, 0, w, -H, r.id === 'situation' ? R('#3A4660') : W);
  switch (r.id) {
    case 'offices': {
      bookcase(g, 70, 0, 180, 230, 11);
      cooler(g, 300); live.cooler = [300, -120];
      officeDesk(g, 370, 210, 74); crt(g, 420, -74); inTray(g, 500, -74); inkP(g, () => g.rect(540, -96, 4, 22), GILT[3], 1); inkP(g, () => { g.moveTo(530, -110); g.lineTo(554, -110); g.lineTo(560, -96); g.lineTo(524, -96); g.closePath(); }, '#2E7A3A', 1.2);
      corkboard(g, 380, -300, 190, 120, 3);
      blinds(g, 690, -120, 150, 170, 1);
      officeDesk(g, 610, 170, 74); faxMachine(g, 650, -74); live.fax = [650, -96]; crt(g, 730, -74, R('#C8BC98'));
      copier(g, 860);
      wallSign(g, 860, -300, 120, 40, '#FFFFFF', [['DAYS WITHOUT', ['#3A3A48', '#1A1A28']], ['A SCANDAL:', ['#3A3A48', '#1A1A28']]]);
      slabI(g, 832, -250, 56, 32, R('#2A2A36')); signText(g, '0', 860, -228, toonLetters(2, ['#FCA5A5', '#F87171', '#DC2626', '#991B1B']));
      giltFrame(g, 960, -330, 120, 90); box(g, 968, -322, 104, 74, '#FDE68A');
      signText(g, 'NEVER FILE IN', 1020, -298, tinyLetters(['#7C2D12', '#5A1E0A'])); signText(g, 'THE WRONG', 1020, -286, tinyLetters(['#7C2D12', '#5A1E0A'])); signText(g, 'DRAWER!', 1020, -262, toonLetters(2, ['#FCA5A5', '#F87171', '#DC2626', '#991B1B']));
      wallClock(g, 1020, -190, 22);
      coatRack(g, 1080);
      // (a wastebasket: wire mesh, crumpled memos)
      stepsAcross(g, () => { g.moveTo(1104, -34); g.lineTo(1132, -34); g.lineTo(1128, 0); g.lineTo(1108, 0); g.closePath(); }, 1104, -34, 28, 34, R('#6A6A7A'), 1.4);
      for (let k = 0; k < 4; k++) box(g, 1106, -30 + k * 8, 24, 1, '#3A3A48');
      for (const [bx, by] of [[1110, -40], [1120, -42], [1126, -37]]) inkP(g, () => g.arc(bx, by, 4, 0, Math.PI * 2), '#F8F8F0', 0.8);
      for (let k = 0; k < 3; k++) { slabI(g, 960 + k * 34, -40, 30, 40 - k * 2, R('#C8A878')); box(g, 966 + k * 34, -30, 18, 6, '#F8F4EC'); }
      break;
    }
    case 'roosevelt': {
      // (Teddy over the fireplace, the moose head; then the show's EIB studio dressing)
      fireplace(g, 160, 0, 150, 116); live.fires.push([160, 0]);
      portrait(g, 160, -280, 'teddy', 84, 106);
      flames(70, -250); flames(250, -250);
      // (the moose head: a gilt plaque, the head in steps, the antlers spread)
      slabI(g, 340, -330, 40, 50, OAK);
      stepsAcross(g, () => g.ellipse(360, -280, 24, 34, 0, 0, Math.PI * 2), 336, -314, 48, 68, R('#7C4A1E'), 2);
      inkP(g, () => g.ellipse(362, -252, 14, 12, 0, 0, Math.PI * 2), '#9A6A3E', 1.6); box(g, 356, -254, 3, 3, INK); box(g, 364, -254, 3, 3, INK);
      box(g, 350, -292, 3, 3, INK); box(g, 368, -292, 3, 3, INK); box(g, 351, -293, 1, 1, '#FFFFFF');
      for (const s of [-1, 1]) inkP(g, () => { g.moveTo(360 + s * 16, -306); g.lineTo(360 + s * 62, -346); g.lineTo(360 + s * 52, -320); g.lineTo(360 + s * 74, -330); g.lineTo(360 + s * 58, -306); g.lineTo(360 + s * 70, -300); g.lineTo(360 + s * 24, -292); g.closePath(); }, '#E7D7A8', 2);
      // (the producer's booth: the glass, a producer in headphones at the board, a SCREENER card)
      slabI(g, 410, -300, 200, 150, R('#5A5A6A'));
      box(g, 420, -290, 180, 112, INK); box(g, 421, -289, 178, 110, '#3A4A6A'); box(g, 421, -289, 178, 30, '#4A5A7A');
      inkP(g, () => g.ellipse(500, -230, 14, 16, 0, 0, Math.PI * 2), '#C98A6A', 1.4); inkP(g, () => g.ellipse(500, -242, 15, 8, 0, Math.PI, 0), '#3A2416', 1.2);
      g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(500, -234, 17, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); box(g, 482, -238, 6, 10, '#1A1A22'); box(g, 512, -238, 6, 10, '#1A1A22');
      stepsDown(g, () => g.roundRect(476, -214, 48, 36, 6), 476, -214, 48, 36, R('#E8E4D8'), 1.4);
      slabI(g, 430, -196, 160, 18, R('#2A2A36')); for (let k = 0; k < 10; k++) box(g, 436 + k * 15, -192, 4, 8, k % 3 ? '#FDE047' : '#22C55E');
      g.fillStyle = 'rgba(255,255,255,0.3)'; g.beginPath(); g.moveTo(430, -180); g.lineTo(446, -180); g.lineTo(500, -288); g.lineTo(484, -288); g.closePath(); g.fill();
      slabI(g, 470, -322, 80, 18, R('#FDE68A')); signText(g, 'SCREENER', 510, -309, tinyLetters(['#7C2D12', '#5A1E0A']));
      // (egg-crate foam behind the desk: the studio)
      for (let x = 640; x < 1140; x += 60) for (let y = -320; y < -130; y += 60) { box(g, x, y, 56, 56, '#3A3A4A'); for (let k = 0; k < 4; k++) for (let j = 0; j < 4; j++) { box(g, x + 3 + k * 13, y + 3 + j * 13, 10, 10, '#4A4A5C'); box(g, x + 3 + k * 13, y + 3 + j * 13, 10, 2, '#5E5E72'); box(g, x + 11 + k * 13, y + 5 + j * 13, 2, 8, '#2A2A36'); } }
      // (the banner: THE EIB NETWORK, LIVE FROM THE WHITE HOUSE! a gold mic on it)
      stepsDown(g, () => g.roundRect(660, -H + 50, 460, 74, 10), 660, -H + 50, 460, 74, NAVY, 3);
      box(g, 666, -H + 56, 448, 2, NAVY[5]);
      for (let k = 668; k < 1112; k += 8) box(g, k, -H + 120, 4, 6, GILT[3]);
      signText(g, 'THE EIB NETWORK', 900, -H + 84, toonLetters(2));
      signText(g, 'LIVE FROM THE WHITE HOUSE!', 900, -H + 108, toonLetters(1, ['#FFFFFF', '#FFFFFF', '#FDE68A', '#FDE047']));
      for (const s of [-1, 1]) { const mx = 900 + s * 200; stepsAcross(g, () => g.ellipse(mx, -H + 82, 10, 13, 0, 0, Math.PI * 2), mx - 10, -H + 69, 20, 26, GILT, 1.6); box(g, mx - 2, -H + 94, 4, 16, GILT[2]); }
      // (the ON AIR box (its light live), the studio clock)
      slabI(g, 840, -116 - 190, 120, 44, R('#3A3A48')); live.onair = [900, -284];
      wallClock(g, 1000, -360, 20, R('#3A3A48'), '#F8F8F0');
      // (gold records, TALENT ON LOAN FROM GOD)
      for (const [x, y] of [[680, -110], [760, -110]] as [number, number][]) { giltFrame(g, x - 30, y - 64, 60, 64, 5); box(g, x - 24, y - 58, 48, 52, '#1A1A22'); inkP(g, () => g.arc(x, y - 32, 18, 0, Math.PI * 2), GILT[3], 1.2); inkP(g, () => g.arc(x, y - 32, 5, 0, Math.PI * 2), '#DC2626', 1); box(g, x - 12, y - 46, 6, 2, GILT[5]); }
      slabI(g, 1040, -150, 120, 36, GILT); box(g, 1046, -144, 108, 24, GILT[1]);
      signText(g, 'TALENT ON LOAN', 1100, -134, ENGRAVED); signText(g, 'FROM GOD', 1100, -124, ENGRAVED);
      // (the call board: DITTO LINES, each lit)
      slabI(g, 1170, -330, 100, 150, R('#1E293B'));
      signText(g, 'DITTO LINES', 1220, -312, tinyLetters(['#FDE047', '#F59E0B']));
      for (let k = 0; k < 6; k++) { box(g, 1182, -300 + k * 18, 76, 14, '#0E1424'); signText(g, `${k + 1}`, 1190, -289 + k * 18, tinyLetters(['#E5E7EB', '#9CA3AF'])); live.phones.push([1244, -293 + k * 18]); }
      signText(g, '1-800-DITTOS', 1220, -176, tinyLetters(['#FDE68A', '#F59E0B']));
      break;
    }
    case 'kitchen': {
      // (the giant fridge: two doors, chrome handles, magnets, a kid's drawing of Socks)
      slabI(g, 70, -290, 150, 290, R('#E8ECF2')); box(g, 144, -290, 2, 290, '#9AA0B0'); box(g, 70, -190, 150, 2, '#9AA0B0');
      for (const x of [134, 154]) slabI(g, x, -260, 6, 60, R('#B8BEC8'));
      slabI(g, 90, -270, 40, 46, R('#FFFFFF')); g.strokeStyle = INK; g.lineWidth = 1.4; g.beginPath(); g.arc(110, -248, 9, 0, Math.PI * 2); g.moveTo(102, -254); g.lineTo(104, -262); g.lineTo(108, -256); g.moveTo(112, -256); g.lineTo(116, -262); g.lineTo(118, -254); g.stroke(); box(g, 104, -250, 2, 2, INK); box(g, 114, -250, 2, 2, INK); signText(g, 'SOCKS', 110, -228, tinyLetters(['#DC2626', '#991B1B']));
      for (const [mx, my, col] of [[176, -250, '#DC2626'], [190, -224, '#FDE047'], [168, -210, '#22C55E']] as [number, number, string][]) inkP(g, () => g.arc(mx, my, 4, 0, Math.PI * 2), col, 1);
      // (shelves of cans and boxes)
      for (let s = 0; s < 3; s++) {
        const sy = -250 + s * 70;
        slabI(g, 250, sy, 200, 8, OAK);
        for (let k = 0; k < 7; k++) { const cx = 258 + k * 27, col = ['#DC2626', '#16A34A', '#F59E0B', '#2563EB', '#F472B6'][(k + s) % 5]; if ((k + s) % 3) { stepsAcross(g, () => g.rect(cx, sy - 28, 20, 28), cx, sy - 28, 20, 28, R(col), 1.2); box(g, cx + 2, sy - 20, 16, 8, '#F8F4EC'); } else { slabI(g, cx, sy - 40, 22, 40, R(col)); box(g, cx + 4, sy - 30, 14, 10, '#FFFFFF'); } }
      }
      // (the hood over the range: stainless in steps, its vent slots, a lamp under it)
      const hd = () => { g.moveTo(480, -H + 60); g.lineTo(980, -H + 60); g.lineTo(960, -300); g.lineTo(500, -300); g.closePath(); };
      stepsDown(g, hd, 480, -H + 60, 500, H - 360, R('#AEB6C4'), 3);
      g.beginPath(); hd(); g.strokeStyle = INK; g.lineWidth = 2.5; g.stroke();
      for (const sx of [640, 820]) { g.strokeStyle = '#8A92A4'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(sx, -H + 62); g.lineTo(sx + (sx < 730 ? -8 : 8), -302); g.stroke(); }
      slabI(g, 496, -306, 468, 14, R('#9AA2B4'));
      for (let x = 540; x < 940; x += 18) box(g, x, -296 + 0, 10, 3, '#3A3A48');
      for (let x = 600; x < 900; x += 24) box(g, x, -H + 120, 14, 2, '#8A92A4');
      // (the utensil rail: ladles, whisks, spatulas)
      box(g, 500, -270, 460, 4, INK); box(g, 500, -269, 460, 2, MARBLE[2]);
      for (let k = 0; k < 9; k++) { const ux = 520 + k * 50; box(g, ux, -268, 2, 10, INK); if (k % 3 === 0) { box(g, ux - 1, -258, 3, 40, '#9AA0B0'); inkP(g, () => g.ellipse(ux, -214, 9, 6, 0, 0, Math.PI), '#B8BEC8', 1.2); } else if (k % 3 === 1) { g.strokeStyle = INK; g.lineWidth = 1; for (let j = -2; j <= 2; j++) { g.beginPath(); g.ellipse(ux + j, -236, 4 + Math.abs(j), 16, 0, 0, Math.PI * 2); g.stroke(); } } else { box(g, ux - 1, -258, 3, 26, OAK[3]); inkP(g, () => g.rect(ux - 8, -234, 16, 16), '#3A3A48', 1); } }
      // (the chalkboard: the menu)
      slabI(g, 1000, -330, 160, 120, OAK); box(g, 1008, -322, 144, 100, '#1E3A2E'); checker(g, 1008, -322, 144, 100, '#24432F', 0, 2);
      signText(g, "TODAY'S MENU", 1080, -306, tinyLetters(['#FFFFFF', '#E8E8E8']));
      for (const [i, t] of ['TATER TOTS', 'JELL-O MOLD', 'TUNA SURPRISE', 'NO CATS!!'].entries()) signText(g, t, 1080, -290 + i * 14, tinyLetters([i === 3 ? '#FCA5A5' : '#FDE68A', i === 3 ? '#F87171' : '#F6D23A']));
      // (the sink under its window, the dish rack, the spice rack, WASH YOUR HANDS, the mop)
      windowAt(g, 1260, -150, 90, 130, 4); drapes(g, 1260, -300, 94, 160, '#60A5FA');
      slabI(g, 1190, -110, 140, 110, R('#E8ECF2')); box(g, 1200, -104, 120, 8, '#9AA0B0');
      g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(1260, -110); g.quadraticCurveTo(1260, -134, 1276, -130); g.stroke(); g.strokeStyle = '#B8BEC8'; g.lineWidth = 1.5; g.stroke();
      for (let k = 0; k < 4; k++) inkP(g, () => g.ellipse(1210 + k * 10, -120, 4, 10, 0.2, 0, Math.PI * 2), '#F8FAFC', 1);
      slabI(g, 1080, -190, 90, 10, OAK); for (let k = 0; k < 8; k++) { inkP(g, () => g.rect(1086 + k * 10, -206, 7, 16), '#F8F4EC', 0.8); box(g, 1086 + k * 10, -206, 7, 4, ['#DC2626', '#16A34A', '#F59E0B', '#7C2D12'][k % 4]); }
      wallSign(g, 1080, -160, 120, 30, '#FFFFFF', [['EMPLOYEES MUST', ['#1E3A8A', '#172A62']], ['WASH HANDS', ['#DC2626', '#991B1B']]]);
      stepsAcross(g, () => { g.moveTo(1150, 0); g.lineTo(1146, -40); g.lineTo(1182, -40); g.lineTo(1178, 0); g.closePath(); }, 1146, -40, 36, 40, R('#FDE047'), 1.6);
      box(g, 1162, -150, 4, 120, INK); box(g, 1163, -150, 2, 120, OAK[4]); for (let k = -3; k <= 3; k++) box(g, 1162 + k * 3, -44, 2, 12, '#E8E4D8');
      break;
    }
    case 'cabinet': {
      for (const x of [170, 470]) { windowAt(g, x, -100, 100, 250, x); drapes(g, x, -400, 104, 400, '#E2B33C'); }
      pottedPalm(g, 320, 0, 120);
      portrait(g, 700, -300, 'jefferson', 70, 88);
      fireplace(g, 860, 0, 170, 120); live.fires.push([860, 0]);
      // (the eagle over the mantel: gilt, wings spread)
      inkP(g, () => { g.moveTo(860, -300); g.lineTo(790, -270); g.lineTo(818, -268); g.lineTo(800, -250); g.lineTo(840, -258); g.lineTo(860, -228); g.lineTo(880, -258); g.lineTo(920, -250); g.lineTo(902, -268); g.lineTo(930, -270); g.closePath(); }, GILT[3], 2.4);
      box(g, 806, -270, 40, 2, GILT[5]); inkP(g, () => g.arc(860, -296, 6, 0, Math.PI * 2), '#FFFFFF', 1.4); box(g, 862, -298, 5, 2, GILT[4]);
      portrait(g, 1020, -300, 'washington', 70, 88);
      for (const s of [-1, 1]) flames(860 + s * 110, -230);
      consoleVase(g, 1110, 0, '#F472B6'); bust(g, 1196, 0);
      flagStand(g, 1246, 0, false); flagStand(g, 1288, 0, true);
      lamp(400, 70, 90); lamp(1000, 70, 90);
      plaque(g, 700, -180, 'THE CABINET ROOM');
      break;
    }
    case 'map': {
      // (the war map: a big cartoon world, pins, yarn to MEAN MEN HQ?)
      const mx = 560, my = -380, mw = 520, mh = 230;
      giltFrame(g, mx - 8, my - 8, mw + 16, mh + 16, 8);
      box(g, mx, my, mw, mh, '#5AA0D8'); for (let k = 0; k < 5; k++) box(g, mx, my + k * (mh / 5), mw, 1, '#4A8CC4'); for (let k = 0; k < 8; k++) box(g, mx + k * (mw / 8), my, 1, mh, '#4A8CC4');
      for (const [x, y, w, h] of [[60, 40, 120, 70], [110, 120, 60, 90], [230, 30, 90, 60], [250, 90, 70, 110], [340, 40, 150, 80], [420, 150, 60, 50]] as [number, number, number, number][]) { stepsDown(g, () => g.ellipse(mx + x + w / 2, my + y + h / 2, w / 2, h / 2, 0.15, 0, Math.PI * 2), mx + x, my + y, w, h, R('#7AC86A'), 1.6); }
      const pins: [number, number][] = [[100, 70], [140, 160], [270, 60], [290, 150], [400, 80], [450, 170]];
      g.strokeStyle = '#DC2626'; g.lineWidth = 1; for (const [x, y] of pins) { g.beginPath(); g.moveTo(mx + x, my + y); g.lineTo(mx + 300, my + 110); g.stroke(); }
      for (const [x, y] of pins) { box(g, mx + x - 2, my + y - 2, 5, 5, INK); box(g, mx + x - 1, my + y - 1, 3, 3, '#DC2626'); }
      slabI(g, mx + 250, my + 98, 100, 22, R('#FDE68A')); signText(g, 'MEAN MEN HQ?', mx + 300, my + 113, tinyLetters(['#991B1B', '#7A0E1C']));
      // (framed charts, FDR, the ship's wheel, the telescope, bookcases of atlases, a compass rose)
      for (const [x, y] of [[140, -380], [1220, -380]] as [number, number][]) { giltFrame(g, x - 50, y, 100, 74, 6); box(g, x - 43, y + 7, 86, 60, '#F2E2B8'); g.strokeStyle = '#8A5A30'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 36, y + 50); g.quadraticCurveTo(x - 10, y + 16, x + 20, y + 40); g.quadraticCurveTo(x + 30, y + 54, x + 38, y + 20); g.stroke(); starAt(g, x + 30, y + 22, 5, '#B8862E'); }
      portrait(g, 300, -280, 'fdr', 72, 92);
      bookcase(g, 66, 0, 166, 220, 7); bookcase(g, 1170, 0, 160, 220, 23);
      // (the ship's wheel)
      const wx = 420, wy = -240;
      g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.arc(wx, wy, 34, 0, Math.PI * 2); g.stroke(); g.strokeStyle = OAK[3]; g.lineWidth = 4; g.stroke();
      for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(wx, wy); g.lineTo(wx + Math.cos(a) * 48, wy + Math.sin(a) * 48); g.stroke(); g.strokeStyle = OAK[4]; g.lineWidth = 2.5; g.stroke(); }
      inkP(g, () => g.arc(wx, wy, 9, 0, Math.PI * 2), GILT[3], 1.6);
      // (the telescope on its tripod)
      for (const s of [-16, 0, 16]) { g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(1100, -120); g.lineTo(1100 + s, 0); g.stroke(); g.strokeStyle = OAK[3]; g.lineWidth = 2; g.stroke(); }
      g.save(); g.translate(1100, -126); g.rotate(-0.4); stepsAcross(g, () => g.roundRect(-40, -8, 80, 16, 4), -40, -8, 80, 16, GILT, 1.8); box(g, 20, -8, 4, 16, GILT[1]); box(g, -30, -8, 4, 16, GILT[1]); g.restore();
      // (a compass rose painted on the wall above the dado)
      const cx = 760, cy = -60;
      for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2, l = k % 2 ? 18 : 34; g.fillStyle = k % 2 ? OAK[1] : GILT[3]; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a - 0.2) * 8, cy + Math.sin(a - 0.2) * 8); g.lineTo(cx + Math.cos(a) * l, cy + Math.sin(a) * l * 0.6); g.lineTo(cx + Math.cos(a + 0.2) * 8, cy + Math.sin(a + 0.2) * 8); g.closePath(); g.fill(); }
      signText(g, 'N', cx, cy - 22, tinyLetters([GILT[5], GILT[3]]));
      lamp(320, 60, 80); lamp(1050, 60, 80);
      plaque(g, 820, -130, 'THE MAP ROOM');
      break;
    }
    case 'situation': {
      // (the wall of monitors, the big screen in the middle, DEFCON, the world's clocks, the red phone)
      for (let x = 60; x < w - 80; x += 150) for (let k = 0; k < 2; k++) {
        if ((x > 560 && x < 900) || (k === 1 && x > 1200)) continue;
        slabI(g, x, -390 + k * 110, 130, 92, R('#2A2A36'));
        box(g, x + 7, -383 + k * 110, 116, 72, INK); live.screens.push([x + 8, -382 + k * 110, 114, 70, (x / 150 + k * 2) % 3 | 0]);
        box(g, x + 50, -298 + k * 110, 30, 4, '#3A3A48');
      }
      slabI(g, 590, -420, 330, 210, R('#2A2A36')); box(g, 600, -410, 310, 186, INK); live.screens.push([601, -409, 308, 184, 3]);
      signText(g, 'SITUATION ROOM', 755, -436, tinyLetters(['#E5E7EB', '#9CA3AF']));
      for (const [i, t] of ['WASHINGTON', 'MOSCOW', 'LONDON', 'TOKYO'].entries()) { const x = 620 + i * 90; wallClock(g, x, -170, 18, R('#2A2A36'), '#E8ECF2'); signText(g, t, x, -140, tinyLetters(['#E5E7EB', '#9CA3AF'])); }
      slabI(g, 1260, -284, 150, 100, R('#1E293B')); signText(g, 'DEFCON', 1335, -266, toonLetters(1, ['#FFFFFF', '#E5E7EB', '#9CA3AF', '#6B7280']));
      for (let k = 0; k < 5; k++) { box(g, 1270 + k * 28, -254, 24, 30, '#0E1424'); signText(g, `${5 - k}`, 1282 + k * 28, -232, tinyLetters(['#4A5468', '#3A4458'])); }
      live.defcon = [1382, -239];
      slabI(g, 1270, -80, 120, 10, R('#3A4660')); inkP(g, () => g.roundRect(1300, -98, 40, 18, 4), '#DC2626', 1.6); inkP(g, () => g.roundRect(1296, -106, 48, 8, 4), '#B91C1C', 1.4); box(g, 1306, -96, 26, 2, '#F87171');
      signText(g, 'HOTLINE', 1330, -64, tinyLetters(['#FCA5A5', '#F87171']));
      for (let x = 30; x < w; x += 160) { box(g, x, -H + 36, 60, 6, '#4A5468'); box(g, x + 4, -H + 37, 52, 2, '#C8D4E8'); }
      live.beacon = [755, -H + 64];
      break;
    }
    case 'outer': {
      // (the secretary's desk (dimmed): the typewriter, the intercom; the clock; portraits; a sofa; the Oval's door)
      const O = dimR(OAK);
      slabI(g, 60, -86, 200, 10, O); slabI(g, 66, -76, 60, 76, O); slabI(g, 196, -76, 58, 76, O);
      for (let k = 0; k < 3; k++) { box(g, 72, -70 + k * 24, 48, 1, O[1]); box(g, 202, -70 + k * 24, 46, 1, O[1]); }
      slabI(g, 100, -112, 56, 26, R('#3A4A6A')); box(g, 106, -124, 44, 12, '#F8F4EC'); for (let k = 0; k < 10; k++) box(g, 104 + k * 5, -98, 3, 3, '#E8E4D8');
      slabI(g, 200, -100, 30, 14, R('#2A2A36')); box(g, 206, -96, 6, 4, '#DC2626'); box(g, 216, -96, 8, 2, '#9CA3AF');
      grandfatherClock(g, 320, 0); live.clock = [320, 0];
      portrait(g, 160, -300, 'jfk', 64, 82); portrait(g, 440, -300, 'lincoln', 64, 82);
      sofa(g, 380, 0, 140, '#3E6FB0');
      wallSign(g, 160, -200, 100, 30, '#FFFBEF', [['PLEASE WAIT', ['#1E3A8A', '#172A62']], ['TO BE SEEN', ['#1E3A8A', '#172A62']]]);
      door(g, 580, 0, 96, 226, '#F4F0E4', true);
      inkP(g, () => { g.moveTo(580, -320); g.lineTo(530, -296); g.lineTo(552, -294); g.lineTo(540, -282); g.lineTo(568, -288); g.lineTo(580, -270); g.lineTo(592, -288); g.lineTo(620, -282); g.lineTo(608, -294); g.lineTo(630, -296); g.closePath(); }, GILT[3], 2);
      plaque(g, 580, -340, 'THE OVAL OFFICE');
      flames(500, -240);
      lamp(330, 70, 80);
      break;
    }
    case 'oval': {
      // (the flat wall behind the desk, local x from OV.fa: three tall windows in gold drapes, the flags, the credenza
      // of family photos)
      for (const x of [110, 270, 430]) { windowAt(g, x, -110, 96, 270, x + 3); drapes(g, x, -430, 100, 430, '#E2B33C'); }
      flagStand(g, 190, 0, false); flagStand(g, 350, 0, true);
      slabI(g, 200, -66, 140, 66, OAK); for (const x of [208, 272]) { box(g, x, -56, 58, 48, OAK[2]); box(g, x + 2, -54, 54, 44, OAK[3]); box(g, x + 2, -54, 54, 1, OAK[1]); inkP(g, () => g.arc(x + 29, -32, 2.5, 0, Math.PI * 2), GILT[4], 1); }
      slabI(g, 196, -72, 148, 8, OAK);
      // (the photos: the family, the dog... and Socks)
      for (const [i, px] of [214, 244, 278, 312].entries()) {
        giltFrame(g, px - 12, -104, 24, 30, 3); box(g, px - 8, -100, 16, 22, ['#9CC4F0', '#F2E2B8', '#C8E4C0', '#F8D4E0'][i]);
        if (i === 2) { inkP(g, () => g.arc(px, -88, 6, 0, Math.PI * 2), '#1A1A22', 1); box(g, px - 3, -86, 6, 3, '#FFFFFF'); box(g, px - 4, -91, 2, 2, '#FDE047'); box(g, px + 2, -91, 2, 2, '#FDE047'); }
        else { inkP(g, () => g.arc(px, -92, 4, 0, Math.PI * 2), '#F2BC98', 0.8); box(g, px - 5, -86, 10, 6, ['#1D4ED8', '#DC2626', '#7C3AED', '#16A34A'][i]); }
      }
      break;
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The shell: the brick above, the ceiling, the floor, the wall's stamp, the live bits

let nc: Ctx | null = null;
const nullCtx = (): Ctx | null => {
  if (nc) return nc;
  if (typeof document === 'undefined') return null;
  const cv = document.createElement('canvas'); cv.width = 1; cv.height = 1;
  nc = cv.getContext('2d');
  return nc;
};
const lives = new Map<string, Live>();
/** The wall's span (local 0 at its left): the Oval's is its flat middle only. */
const span = (r: Room): [number, number] => (r.id === 'oval' ? [OV.fa, OV.fb] : [r.a, r.b]);
const liveOf = (r: Room): Live | null => {
  let live = lives.get(r.id);
  if (live) return live;
  const g = nullCtx();
  if (!g) return null;
  live = fresh();
  const [a, b] = span(r);
  paintWall(g, r, live, b - a);
  lives.set(r.id, live);
  return live;
};
const wallOf = (c: Ctx, r: Room) => {
  const [a, b] = span(r), w = b - a, L = LOOK[r.id]!;
  still(c, `wh2-wall-${r.id}`, X(a), GY, -70, -H - 12, w + 140, H + 20, g => {
    paintWall(g, r, fresh(), w);
    const W = R(L.wall), nx = NEXT[r.id];
    if (nx && r.id !== 'oval') { doorway(g, 0, 0, W, nx[0]); if (r.id !== 'outer') doorway(g, w, 0, W, nx[1]); }
    g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(0, -H, w, H);
  });
};

const dAt = (k: number) => D_BACK + (1 - D_BACK) * k;
/** The floor going back from the back wall: stepped bands, its pattern. */
const floorOf = (c: Ctx, E: P, r: Room) => {
  const L = LOOK[r.id]!, a = X(r.a), b = X(r.b), fy = GY, F = R(L.floorCol), F2 = R(L.floorCol2);
  const band = (k0: number, k1: number, col: string, x0 = a, x1 = b) => quad(c, [proj(E, x0, fy, dAt(k0)), proj(E, x1, fy, dAt(k0)), proj(E, x1, fy, dAt(k1)), proj(E, x0, fy, dAt(k1))], col);
  const line = (x: number, k0: number, k1: number, col: string, w = 1) => { const p0 = proj(E, x, fy, dAt(k0)), p1 = proj(E, x, fy, dAt(k1)); c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke(); };
  const across = (k: number, col: string, w = 1, x0 = a, x1 = b) => { const p0 = proj(E, x0, fy, dAt(k)), p1 = proj(E, x1, fy, dAt(k)); c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke(); };
  for (let i = 0; i < 4; i++) band(i / 4, (i + 1) / 4, F[1 + i]);
  if (L.floor === 'checker') {
    for (let x = r.a; x < r.b; x += 50) for (let k = 0; k < 4; k++) { if ((Math.floor((x - r.a) / 50) + k) % 2 === 0) continue; quad(c, [proj(E, X(x), fy, dAt(k / 4)), proj(E, X(x + 50), fy, dAt(k / 4)), proj(E, X(x + 50), fy, dAt((k + 1) / 4)), proj(E, X(x), fy, dAt((k + 1) / 4))], F2[1 + k]); }
    for (let k = 1; k < 4; k++) across(k / 4, mix(F[1], INK, 0.2));
  } else if (L.floor === 'tiles') {
    // (the raised floor's tiles: a grid, every fourth a vent)
    for (let x = r.a; x < r.b; x += 60) line(X(x), 0, 1, F2[2], 2);
    for (let k = 1; k < 5; k++) across(k / 5, F2[2], 2);
    for (let x = r.a + 30; x < r.b; x += 240) { const p = proj(E, X(x), fy, dAt(0.5)); for (let j = -2; j <= 2; j++) box(c, p.x - 10, p.y + j * 1.2, 20, 1, F2[1]); }
  } else if (L.floor === 'carpet') {
    across(0.1, L.floorCol2, 2); across(0.9, L.floorCol2, 2);
    for (let x = r.a + 20; x < r.b; x += 50) for (const k of [0.3, 0.55, 0.8]) { const p = proj(E, X(x + (k * 100) % 25), fy, dAt(k)); c.fillStyle = mix(L.floorCol2, F[3], r.id === 'offices' ? 0.6 : 0.2); c.fillRect(p.x - 2, p.y - 1, 4, 2); c.fillRect(p.x - 1, p.y - 2, 2, 4); }
  } else if (L.floor === 'rug') {
    for (let x = r.a; x < r.b; x += 26) line(X(x), 0, 1, mix(F[1], INK, 0.25));
    const ra = X(r.a + 80), rb = X(r.b - 80);
    band(0.15, 0.85, F2[2], ra, rb); band(0.25, 0.75, F2[3], ra + 20, rb - 20);
    across(0.18, GILT[3], 2, ra, rb); across(0.82, GILT[2], 2, ra, rb);
    for (let x = r.a + 120; x < r.b - 100; x += 70) { const p = proj(E, X(x), fy, dAt(0.5)); c.fillStyle = GILT[3]; c.beginPath(); c.ellipse(p.x, p.y, 10, 2.5, 0, 0, Math.PI * 2); c.fill(); }
  }
  across(0.02, INK, 2);
};
/** The ceiling going back: coffered (formal), a drop ceiling of tiles and fluorescent panels (the offices, the kitchen),
 *  or dark with recessed lights (the Situation Room). */
const ceilingOf = (c: Ctx, E: P, r: Room) => {
  const L = LOOK[r.id]!, a = X(r.a), b = X(r.b), cy = Y(H), Cc = R(L.ceil);
  for (let i = 0; i < 4; i++) quad(c, [proj(E, a, cy, dAt(i / 4)), proj(E, b, cy, dAt(i / 4)), proj(E, b, cy, dAt((i + 1) / 4)), proj(E, a, cy, dAt((i + 1) / 4))], Cc[4 - i]);
  const line = (x: number, k0: number, k1: number, col: string, w: number) => { const p0 = proj(E, X(x), cy, dAt(k0)), p1 = proj(E, X(x), cy, dAt(k1)); c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke(); };
  const across = (k: number, col: string, w: number) => { const p0 = proj(E, a, cy, dAt(k)), p1 = proj(E, b, cy, dAt(k)); c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke(); };
  if (L.ceilKind === 'coffer') {
    for (let x = r.a + 80; x < r.b; x += 160) { line(x, 0, 1, Cc[1], 4); line(x - 2, 0, 1, Cc[5], 1); }
    for (const k of [0.33, 0.66]) { across(k, Cc[1], 3); }
  } else {
    for (let x = r.a + 40; x < r.b; x += 60) line(x, 0, 1, Cc[2], 1);
    for (const k of [0.33, 0.66]) across(k, Cc[2], 1);
    // (the panels: fluorescents (the offices, the kitchen), recessed spots (the Situation Room))
    for (let x = r.a + 100; x < r.b - 60; x += 240) {
      const q = [proj(E, X(x), cy, dAt(0.36)), proj(E, X(x + 60), cy, dAt(0.36)), proj(E, X(x + 60), cy, dAt(0.63)), proj(E, X(x), cy, dAt(0.63))];
      if (L.ceilKind === 'drop') { quad(c, q, '#FFFFFF'); quad(c, [q[0], q[1], { x: q[1].x, y: q[1].y + 1 }, { x: q[0].x, y: q[0].y + 1 }], '#C8D4E8'); }
      else { const p = proj(E, X(x + 30), cy, dAt(0.5)); c.fillStyle = '#C8D4E8'; c.beginPath(); c.ellipse(p.x, p.y, 8, 1.5, 0, 0, Math.PI * 2); c.fill(); }
    }
  }
};
/** The brick above a stretch of ceiling (play plane), painted in 400-wide stamps. */
const cutawayAt = (c: Ctx, state: GameState, a: number, b: number, cy: number) => {
  const v0 = state.camera.x - 40, v1 = state.camera.x + CANVAS_WIDTH + 40;
  if (cy < state.camera.y - 10) return;
  for (let x = Math.floor(Math.max(a, v0) / 400) * 400; x < Math.min(b, v1); x += 400) {
    const x0 = Math.max(a, x), x1 = Math.min(b, x + 400);
    still(c, `wh2-cut-${x0}-${x1}`, x0, cy, 0, -1200, x1 - x0, 1200, g => cutaway(g, 0, x1 - x0, 0, 1200));
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Live bits (world, over the wall's stamp: drawn at the wall's depth, local to the wall's left foot)

const liveBits = (c: Ctx, state: GameState, r: Room, live: Live) => {
  const f = state.frame;
  candleFlames(c, live.flames, f);
  for (const [x, y] of live.fires) fireAt(c, x, y, f);
  if (live.clock) clockPendulum(c, live.clock[0], live.clock[1], f);
  if (live.onair) {
    const [x, y] = live.onair, on = f % 60 < 42;
    box(c, x - 54, y - 18, 108, 36, INK); box(c, x - 52, y - 16, 104, 32, on ? '#DC2626' : '#5A0E14');
    if (on) { box(c, x - 52, y - 16, 104, 6, '#F87171'); checker(c, x - 52, y - 10, 104, 2, '#F87171', 0, 1); }
    signText(c, 'ON AIR', x, y + 7, toonLetters(2, on ? ['#FFFFFF', '#FFFFFF', '#FEE2E2', '#FECACA'] : ['#B87A7A', '#A06A6A', '#8A5A5A', '#7A4A4A']));
  }
  live.phones.forEach(([x, y], k) => { const on = ((f >> 4) + k * 3) % 5 < 2 + (k % 2); box(c, x - 4, y - 4, 9, 9, INK); box(c, x - 3, y - 3, 7, 7, on && (f % 20 < 14 || k % 2) ? '#22C55E' : '#14532D'); });
  if (live.cooler) { const [x, y] = live.cooler, t = (f % 90) / 90; if (t < 0.6) { c.fillStyle = '#EFF6FF'; c.beginPath(); c.arc(x - 2 + Math.sin(t * 9) * 2, y - t * 40, 2 + t * 2, 0, Math.PI * 2); c.fill(); } }
  if (live.fax) { const [x, y] = live.fax, k = (f % 240) / 240; if (k < 0.7) { const len = 6 + k * 40; box(c, x - 12, y - len, 22, len, '#F8F8F0'); for (let j = 0; j < len - 6; j += 5) box(c, x - 9, y - len + 3 + j, 14 - (j % 3) * 3, 1, '#6A6A7A'); box(c, x - 12, y - len, 22, 1, '#FFFFFF'); } }
  for (const [x, y, w, h, kind] of live.screens) screen(c, x, y, w, h, kind, f);
  if (live.beacon) {
    const [x, y] = live.beacon, a = f * 0.12, lx = Math.cos(a);
    box(c, x - 4, y - 24, 8, 12, INK); box(c, x - 3, y - 24, 6, 12, '#4A5468');
    c.fillStyle = INK; c.beginPath(); c.ellipse(x, y, 17, 13, 0, Math.PI, 0); c.fill(); box(c, x - 18, y - 1, 36, 6, INK);
    c.fillStyle = '#7F1D1D'; c.beginPath(); c.ellipse(x, y, 15, 11, 0, Math.PI, 0); c.fill();
    c.fillStyle = '#EF4444'; c.beginPath(); c.ellipse(x + lx * 7, y - 4, 6, 7, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#FECACA'; c.fillRect(x + lx * 7 - 1, y - 8, 2, 3);
    box(c, x - 17, y, 34, 4, '#3A4458');
  }
  if (live.defcon) { const [x, y] = live.defcon, on = f % 40 < 26; box(c, x - 11, y - 15, 24, 30, on ? '#DC2626' : '#5A0E14'); signText(c, '1', x + 1, y + 7, toonLetters(2, on ? ['#FFFFFF', '#FFFFFF', '#FEE2E2', '#FECACA'] : ['#B87A7A', '#A06A6A', '#8A5A5A', '#7A4A4A'])); }
  void r;
};
/** A monitor's picture (live): a radar sweep, the world map with blinking dots, a scrolling MEAN MEN ALERT; the big
 *  screen, the White House from above with red blips round it. */
const screen = (c: Ctx, x: number, y: number, w: number, h: number, kind: number, f: number) => {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  if (kind === 0) {
    box(c, x, y, w, h, '#03140A');
    const cx = x + w / 2, cy = y + h / 2, rr = Math.min(w, h) / 2 - 4;
    c.strokeStyle = '#166534'; c.lineWidth = 1; for (const k of [0.4, 0.75, 1]) { c.beginPath(); c.arc(cx, cy, rr * k, 0, Math.PI * 2); c.stroke(); }
    c.beginPath(); c.moveTo(cx - rr, cy); c.lineTo(cx + rr, cy); c.moveTo(cx, cy - rr); c.lineTo(cx, cy + rr); c.stroke();
    const a = f * 0.05 + x;
    c.fillStyle = 'rgba(74,222,128,0.35)'; c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, rr, a - 0.6, a); c.closePath(); c.fill();
    c.strokeStyle = '#4ADE80'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); c.stroke();
    for (let k = 0; k < 3; k++) { const b = hash(x + k) * Math.PI * 2, d = rr * (0.3 + hash(k * 3 + x) * 0.6), age = ((a - b) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2); if (age < 2) box(c, cx + Math.cos(b) * d - 1, cy + Math.sin(b) * d - 1, 3, 3, age < 0.6 ? '#BBF7D0' : '#22C55E'); }
  } else if (kind === 1) {
    box(c, x, y, w, h, '#0E2A5A');
    for (const [mx, my, mw, mh] of [[0.1, 0.2, 0.25, 0.3], [0.18, 0.55, 0.12, 0.35], [0.45, 0.15, 0.18, 0.3], [0.48, 0.48, 0.14, 0.4], [0.66, 0.2, 0.28, 0.35]] as [number, number, number, number][]) box(c, x + mx * w, y + my * h, mw * w, mh * h, '#2E7A4A');
    for (let k = 0; k < 4; k++) if ((f >> 3) % 4 === k || (f >> 4) % 3 === k) box(c, x + hash(k + x) * (w - 8) + 2, y + hash(k * 7 + x) * (h - 8) + 2, 4, 4, '#EF4444');
    for (let yy = y; yy < y + h; yy += 3) box(c, x, yy, w, 1, 'rgba(0,0,0,0.25)');
  } else if (kind === 2) {
    box(c, x, y, w, h, '#2A0A0A');
    box(c, x, y + h / 2 - 9, w, 18, (f >> 4) % 2 ? '#B91C1C' : '#7F1D1D');
    const t = 'MEAN MEN ALERT  *  CAT LOOSE IN WEST WING  *  ', tw = t.length * 6, ox = -(f % tw);
    for (const dx of [0, tw]) signText(c, t, x + ox + dx, y + h / 2 + 4, tinyLetters(['#FFFFFF', '#FECACA']), 'left');
    for (let yy = y; yy < y + h; yy += 3) box(c, x, yy, w, 1, 'rgba(0,0,0,0.25)');
  } else {
    // (the big screen: the White House from above, the West Wing lit, red blips going for it)
    box(c, x, y, w, h, '#0A1A0E');
    for (let k = 0; k < w; k += 20) box(c, x + k, y, 1, h, '#123A1E'); for (let k = 0; k < h; k += 20) box(c, x, y + k, w, 1, '#123A1E');
    const cx = x + w / 2, cy = y + h / 2;
    box(c, cx - 60, cy - 16, 120, 32, '#4ADE80'); box(c, cx - 58, cy - 14, 116, 28, '#0A1A0E'); box(c, cx + 60, cy - 6, 70, 12, '#4ADE80'); box(c, cx + 62, cy - 4, 66, 8, '#0A1A0E');
    if ((f >> 4) % 2) box(c, cx + 110, cy - 3, 6, 6, '#FDE047');
    for (let k = 0; k < 6; k++) { const a = hash(k) * Math.PI * 2, d = 120 - ((f * 0.3 + k * 20) % 90); box(c, cx + Math.cos(a) * d * 1.2 - 2, cy + Math.sin(a) * d * 0.6 - 2, 5, 5, '#EF4444'); }
    signText(c, 'TARGET: SOCKS', cx, y + 18, tinyLetters(['#4ADE80', '#22C55E']));
    for (let yy = y; yy < y + h; yy += 3) box(c, x, yy, w, 1, 'rgba(0,0,0,0.22)');
  }
  c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(x + 3, y + 3, w * 0.3, 2);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The Oval Office: the curved walls, the ceiling and its plaster Seal, the oval rug

/** A point on the Oval's wall: t 0 (the left end, at the play plane) .. 1 (round the left curve to the flat wall) .. 2
 *  (along the flat wall) .. 3 (round the right curve to the right end). Its world x and depth. */
const ovalAt = (t: number): [number, number] => {
  if (t <= 1) { const q = (t * Math.PI) / 2; return [X(OV.a + (OV.fa - OV.a) * (1 - Math.cos(q))), 1 - (1 - D_BACK) * Math.sin(q)]; }
  if (t <= 2) return [X(OV.fa + (OV.fb - OV.fa) * (t - 1)), D_BACK];
  const q = ((3 - t) * Math.PI) / 2;
  return [X(OV.b - (OV.b - OV.fb) * (1 - Math.cos(q))), 1 - (1 - D_BACK) * Math.sin(q)];
};
const CURVE_N = 14;
const ovalShell = (c: Ctx, state: GameState, E: P) => {
  const L = LOOK.oval!, W = R(L.wall), Dd = R(L.dado), Cc = R(L.ceil), fy = GY, cy = Y(H);
  const P = (t: number, y: number) => { const [x, d] = ovalAt(t); return proj(E, x, y, d); };
  // (the return at the left end: the partition's face going back, as seen from the outer office)
  quad(c, [proj(E, X(OV.a), fy, D_BACK), proj(E, X(OV.a), fy, 1), proj(E, X(OV.a), cy, 1), proj(E, X(OV.a), cy, D_BACK)], mix(W[2], INK, 0.15));
  // (the ceiling: round the curve and along, the front edge at the play plane; a cove, the plaster Seal)
  const ring = (k: number, y: number) => { const pts: P[] = []; for (let i = 0; i <= 3 * CURVE_N; i++) { const t = i / CURVE_N, [x, d] = ovalAt(t), dd = 1 - (1 - d) * k, mxw = (X(OV.a) + X(OV.b)) / 2; pts.push(proj(E, mxw + (x - mxw) * (0.6 + 0.4 * k), y, dd)); } return pts; };
  const poly = (pts: P[], col: string) => { c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y))); c.closePath(); c.fillStyle = col; c.fill(); };
  poly(ring(1, cy), Cc[3]); poly(ring(0.75, cy), Cc[4]); poly(ring(0.45, cy), Cc[5]);
  { const m = proj(E, X((OV.a + OV.b) / 2), cy, dAt(0.5)), sy = Math.max(0.03, (Math.abs(cy - E.y) * (1 - D_BACK) * 0.6) / 120); c.save(); c.translate(m.x, m.y); c.scale(0.9, sy); c.globalAlpha = 0.85; seal(c, 0, 0, 60); c.restore(); }
  // (the floor: round the curve; the oval rug, its border, the Seal)
  poly(ring(1, fy), R(L.floorCol)[2]);
  { const pts: P[] = [], pts2: P[] = [], mx = (OV.a + OV.b) / 2; for (let i = 0; i <= 40; i++) { const a = (i / 40) * Math.PI * 2; pts.push(proj(E, X(mx + Math.cos(a) * 380), fy, dAt(0.5 + Math.sin(a) * 0.44))); pts2.push(proj(E, X(mx + Math.cos(a) * 340), fy, dAt(0.5 + Math.sin(a) * 0.38))); }
    poly(pts, GILT[2]); poly(pts2, NAVY[2]);
    c.strokeStyle = GILT[4]; c.lineWidth = 1.5; c.beginPath(); pts2.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y))); c.closePath(); c.stroke();
    for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, p = proj(E, X(mx + Math.cos(a) * 300), fy, dAt(0.5 + Math.sin(a) * 0.33)); starAt(c, p.x, p.y, 2.5, GILT[4]); }
    const m = proj(E, X(mx), fy, dAt(0.5)), sy = Math.max(0.03, (Math.abs(fy - E.y) * (1 - D_BACK) * 0.7) / 144);
    c.save(); c.translate(m.x, m.y); c.scale(1.1, sy); seal(c, 0, 0, 72); c.restore(); }
  // (the curves: strips going round, lit by how they face; the wainscot and the crown round with them; a door and a
  // niche of shelves on each)
  for (const [t0, t1] of [[0, 1], [2, 3]] as [number, number][]) for (let i = 0; i < CURVE_N; i++) {
    const a = t0 + (i / CURVE_N) * (t1 - t0), b = t0 + ((i + 1) / CURVE_N) * (t1 - t0), k = i / CURVE_N, left = t0 === 0;
    const face = left ? W[2 + Math.min(2, Math.floor(k * 3))] : W[4 - Math.min(2, Math.floor(k * 3))];
    quad(c, [P(a, fy), P(b, fy), P(b, cy), P(a, cy)], face);
    quad(c, [P(a, fy), P(b, fy), P(b, fy - 110), P(a, fy - 110)], left ? Dd[2 + Math.min(1, Math.floor(k * 2))] : Dd[3 - Math.min(1, Math.floor(k * 2))]);
    quad(c, [P(a, fy - 110), P(b, fy - 110), P(b, fy - 116), P(a, fy - 116)], Dd[5]);
    quad(c, [P(a, cy), P(b, cy), P(b, cy + 30), P(a, cy + 30)], W[4]); quad(c, [P(a, cy + 11), P(b, cy + 11), P(b, cy + 17), P(a, cy + 17)], GILT[3]);
    // (a door round the curve: tall, white, paneled, a pediment over it)
    const kk = left ? k : 1 - k;
    if (kk > 0.22 && kk < 0.42) { quad(c, [P(a, fy), P(b, fy), P(b, fy - 230), P(a, fy - 230)], MARBLE[left ? 3 : 4]); quad(c, [P(a, fy - 6), P(b, fy - 6), P(b, fy - 210), P(a, fy - 210)], left ? MARBLE[4] : MARBLE[5]); if (Math.abs(kk - 0.32) < 0.03) quad(c, [P(a, fy), P(b, fy), P(b, fy - 210), P(a, fy - 210)], MARBLE[2]); quad(c, [P(a, fy - 238), P(b, fy - 238), P(b, fy - 250), P(a, fy - 250)], GILT[3]); }
    // (a niche: an arched recess, shelves of things)
    if (kk > 0.58 && kk < 0.86) { quad(c, [P(a, fy - 120), P(b, fy - 120), P(b, fy - 330), P(a, fy - 330)], mix(W[1], INK, 0.2)); for (const sy of [160, 230, 300]) quad(c, [P(a, fy - sy), P(b, fy - sy), P(b, fy - sy - 5), P(a, fy - sy - 5)], W[4]);
      if (i % 3 === 0) { const p = P((a + b) / 2, fy - 166); box(c, p.x - 4, p.y - 12, 8, 12, ['#1D4ED8', '#E2B33C', '#F8FAFC'][i % 3]); box(c, p.x - 3, p.y - 12, 2, 12, '#FFFFFF'); }
      if (i % 3 === 1) { const p = P((a + b) / 2, fy - 236); c.fillStyle = MARBLE[3]; c.beginPath(); c.arc(p.x, p.y - 9, 5, 0, Math.PI * 2); c.fill(); box(c, p.x - 4, p.y - 5, 8, 5, MARBLE[2]); } }
    // (pilasters between)
    if (i % 4 === 0) { quad(c, [P(a, fy), P(a + 0.02, fy), P(a + 0.02, cy + 30), P(a, cy + 30)], W[5]); }
  }
  // (the curves' ink: along their foot and their top, the cut edges at the play plane)
  c.strokeStyle = INK; c.lineWidth = 2;
  for (const [t0, t1] of [[0, 1], [2, 3]] as [number, number][]) for (const y of [fy, cy]) { c.beginPath(); for (let i = 0; i <= CURVE_N; i++) { const p = P(t0 + (i / CURVE_N) * (t1 - t0), y); if (i) c.lineTo(p.x, p.y); else c.moveTo(p.x, p.y); } c.stroke(); }
  // (the sconces round the curves: candle flames, live)
  for (const t of [0.5, 2.5]) { const [x, d] = ovalAt(t); atDepth(c, E, d, () => { c.save(); c.translate(x, fy); sconce(c, 0, -250); candleFlames(c, sconceFlames(0, -250), state.frame); c.restore(); }); }
};

// ---------------------------------------------------------------------------------------------------------------

/** One room: the brick above it, its ceiling, its floor, its back wall, the live bits. */
const drawRoom = (c: Ctx, state: GameState, E: P, r: Room) => {
  if (!LOOK[r.id]) return;
  const a = X(r.a), b = X(r.b), cy = Y(H);
  if (!seenAt(state, E, a - 80, b + 80, D_BACK, 80) && !(b > state.camera.x - 80 && a < state.camera.x + CANVAS_WIDTH + 80)) return;
  cutawayAt(c, state, a, b, cy);
  if (r.id === 'oval') ovalShell(c, state, E);
  else { ceilingOf(c, E, r); floorOf(c, E, r); }
  const [wa] = span(r);
  atDepth(c, E, D_BACK, () => {
    wallOf(c, r);
    const live = liveOf(r);
    if (!live) return;
    c.save(); c.translate(X(wa), GY);
    liveBits(c, state, r, live);
    c.restore();
  });
};
/** Every room (left to right: the Oval's curve over the outer office's end). */
export const drawRooms2 = (c: Ctx, state: GameState, E: P) => { for (const r of ROOMS) if (!r.outdoors) drawRoom(c, state, E, r); };
export { OV, LOOK as LOOK2 };
void VELVET; void stepsDown; void dim;
