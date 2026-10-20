// The cartoon White House's rooms, part one (the SNES pass): each room a set cut away along its back, drawn to the one
// eye (the middle of the screen): the back wall at D_BACK painted once for the hour into a stamp (the windows show the
// grounds by the hour), the ceiling and the floor going back from it to the play plane in stepped bands with their
// patterns (coffers and medallions; marble squares, the Seal inlaid, runners, parquet, rugs), the house's own brick
// above the ceiling (the cartoon's cutaway, its slab inked fat), the doorways between the rooms (pilastered, a glimpse
// of the next room through them). Live over the walls: the candles flickering, the State Dining Room's fire, the
// entrance's clock's pendulum.
//
// Every room specific and full (what's on its back wall):
//   ENTRANCE HALL   marble columns, the front doors under a fanlight and a pediment, a grandfather clock, Washington
//                   over a marble bust behind a velvet rope line, the window to the North Lawn in red drapes, the flags
//                   (the Stars and Stripes, the President's), the beagle's portrait, sconces, molded panels
//   CROSS HALL      the colonnade, gold-striped paper, Lincoln, a First Lady, Teddy (BULLY), FDR; console tables with
//                   flowers, busts, sconces, two chandeliers
//   EAST ROOM       the big cream and gold ballroom: three tall windows in gold swags, pilasters, the full-length
//                   Washington, the fireplace with its mirror and candelabra, the bandstand's bunting, two great
//                   chandeliers
//   PRESS ROOM      blue drapes all along, THE WHITE HOUSE / WASHINGTON oval, flags, the show's cardboard press corps in
//                   rows of folding chairs, TV cameras on tripods, Perot's flip charts
//   STATE DINING    oak paneling, Lincoln over the fireplace (live fire) and the Adams prayer carved in the mantel,
//                   silver candelabra, china cabinets of plates, windows in green drapes, two chandeliers
//   GRAND STAIRCASE the tall hall: a Palladian window, portraits climbing with the stairs, sconces climbing, the
//                   PRESIDENTIAL BOWLING LANE sign, the lane itself through an arch up on the landing (the pins)
//   CENTER HALL     the residence's yellow hall: columns, bookcases, a sofa and a lamp, the beagle, FDR, PRIVATE
//                   RESIDENCE, the Lincoln Bedroom's door
//   LINCOLN BEDROOM green damask, the carved headboard (dimmed: scenery), Lincoln, the Gettysburg Address under glass,
//                   a wardrobe, a dresser and lamp, his stovepipe hat on a peg, LINCOLN SLEPT HERE in a sampler
//   WEST SITTING    the big half-moon fan window (the sky by the hour through it), palms, a sofa, lamps

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { signText } from '../../signLetters';
import { timeOfDay, skyAt } from '../../timeOfDay';
import { box, mix, hash, checker, still, INK, toonLetters, type Ctx } from '../kit';
import {
  R, GILT, MARBLE, VELVET, NAVY, OAK, inkP, slabI, stepsAcross, stepsDown, column, pilaster, crown, wainscot, wallpaper,
  giltFrame, portrait, plaque, seal, sconce, sconceFlames, candleFlames, drapes, windowAt, door, fireplace, fireAt, bust,
  flagStand, grandfatherClock, clockPendulum, consoleVase, bookcase, pottedPalm, sofa, ropeLine, chandelierArt,
  chandelierFlames, cutaway, starAt, ENGRAVED, tinyLetters, type R6,
} from './paint';
import { ROOMS, D_BACK, F2, STAIRS, BALCONY_EDGE, X, Y, type Room } from './layout';
import { GY } from '../geometry';

export type P = { x: number; y: number };
export const eyeOf = (state: GameState): P => ({ x: state.camera.x + CANVAS_WIDTH / 2, y: state.camera.y + CANVAS_HEIGHT / 2 });
export const proj = (E: P, x: number, y: number, s: number): P => ({ x: E.x + (x - E.x) * s, y: E.y + (y - E.y) * s });
export const atDepth = (c: Ctx, E: P, s: number, fn: () => void) => { c.save(); c.translate(E.x, E.y); c.scale(s, s); c.translate(-E.x, -E.y); fn(); c.restore(); };
export const seenAt = (state: GameState, E: P, x0: number, x1: number, s: number, m = 40) => { const a = proj(E, x0, 0, s).x, b = proj(E, x1, 0, s).x; return b > state.camera.x - m && a < state.camera.x + CANVAS_WIDTH + m; };
export const quad = (c: Ctx, pts: P[], fill: string) => { c.beginPath(); c.moveTo(pts[0].x, pts[0].y); for (const p of pts.slice(1)) c.lineTo(p.x, p.y); c.closePath(); c.fillStyle = fill; c.fill(); };

// ---------------------------------------------------------------------------------------------------------------
// The rooms' looks

interface Look { wall: string; paper: string; ceil: string; floor: 'marble' | 'runner' | 'parquet' | 'carpet' | 'rug' | 'checker'; floorCol: string; floorCol2?: string; dado: string }
const LOOK: Record<string, Look> = {
  entrance: { wall: '#F6E2B8', paper: 'none', ceil: '#F7E7C4', floor: 'marble', floorCol: '#F2ECE0', floorCol2: '#2E2A3E', dado: '#E6D2A6' },
  crosshall: { wall: '#FFE6B4', paper: 'stripe', ceil: '#F7E2B8', floor: 'runner', floorCol: '#ECE4D4', floorCol2: '#C81E3C', dado: '#E8C890' },
  eastroom: { wall: '#FFF4DE', paper: 'none', ceil: '#FFF0CF', floor: 'parquet', floorCol: '#C98A4B', floorCol2: '#B57438', dado: '#F2E2C2' },
  press: { wall: '#2D4EA8', paper: 'none', ceil: '#E9E4D8', floor: 'carpet', floorCol: '#2E4486', floorCol2: '#E2B33C', dado: '#22408E' },
  dining: { wall: '#C89A5A', paper: 'none', ceil: '#F9EECB', floor: 'rug', floorCol: '#9C5B2E', floorCol2: '#8E1E32', dado: '#A87440' },
  stairhall: { wall: '#FDE2C6', paper: 'stripe', ceil: '#F5E1BC', floor: 'checker', floorCol: '#EDE6D8', floorCol2: '#C8A8B8', dado: '#E8C99A' },
  centerhall: { wall: '#FDE68A', paper: 'dots', ceil: '#FFF3C4', floor: 'carpet', floorCol: '#3E6FB0', floorCol2: '#F2C84A', dado: '#E8C860' },
  lincoln: { wall: '#3F7D56', paper: 'fleur', ceil: '#E8E0C8', floor: 'rug', floorCol: '#6A3A1E', floorCol2: '#7A1E2E', dado: '#2E5A3E' },
  sitting: { wall: '#F8D4C0', paper: 'stripe', ceil: '#FBEBDD', floor: 'carpet', floorCol: '#4A7A9E', floorCol2: '#F6E2B8', dado: '#E8B8A0' },
};

// ---------------------------------------------------------------------------------------------------------------
// The back walls (painted in the wall's own coordinates: x 0 at the room's left, y 0 its floor, up is minus)

/** A molded panel on a wall (a frame of molding, its field a touch darker). */
const moldPanel = (g: Ctx, x: number, y: number, w: number, h: number, W: R6) => {
  box(g, x, y, w, h, W[2]); box(g, x + 2, y + 2, w - 4, h - 4, W[4]); box(g, x + 4, y + 4, w - 8, h - 8, W[3]);
  box(g, x + 4, y + 4, w - 8, 1, W[2]); box(g, x + 4, y + 4, 1, h - 8, W[2]);
};
/** A doorway between rooms on the back wall (its middle x, its foot y): pilasters, an arch with a keystone, the passage
 *  dark going back, the next room's floor glinting at the far end. */
const doorway = (g: Ctx, x: number, foot: number, W: R6, next: string) => {
  const w = 80, h = 200;
  pilaster(g, x - w / 2 - 10, foot, foot - h - 10, 18, W);
  pilaster(g, x + w / 2 + 10, foot, foot - h - 10, 18, W);
  const path = () => { g.moveTo(x - w / 2, foot); g.lineTo(x - w / 2, foot - h + 46); g.quadraticCurveTo(x, foot - h - 30, x + w / 2, foot - h + 46); g.lineTo(x + w / 2, foot); g.closePath(); };
  g.save(); g.beginPath(); path(); g.clip();
  const D = ['#120A1A', '#1E1028', '#2A1836', '#3A2446'];
  for (let i = 0; i < 4; i++) box(g, x - w / 2, foot - h - 40 + i * 46, w, 48, D[3 - i]);
  checker(g, x - w / 2, foot - h + 6, w, 2, D[1], 0, 1);
  // (the far end: a lit sliver of the next room: its wall, its floor)
  const N = R(next);
  box(g, x - 22, foot - 120, 44, 120, N[2]); box(g, x - 22, foot - 120, 44, 6, N[3]); box(g, x - 22, foot - 18, 44, 18, N[1]);
  box(g, x - 22, foot - 120, 2, 120, N[4]);
  g.restore();
  g.beginPath(); path(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
  g.strokeStyle = W[4]; g.lineWidth = 2; g.beginPath(); g.moveTo(x - w / 2 - 4, foot - h + 46); g.quadraticCurveTo(x, foot - h - 36, x + w / 2 + 4, foot - h + 46); g.stroke();
  slabI(g, x - 9, foot - h - 30, 18, 20, GILT);
};

/** What goes on each room's back wall, painted once (the live bits' points returned: flames, the fire, the clock). */
interface Live { flames: [number, number][]; fire?: [number, number]; clock?: [number, number] }
const paintWall = (g: Ctx, r: Room, live: Live) => {
  const L = LOOK[r.id], w = r.b - r.a, H = r.ceil - r.floor, W = R(L.wall), Dd = R(L.dado);
  // (the wall's field: paper, a dado and wainscot, the crown)
  if (r.id === 'press') {
    // (blue drapes all along it: pleats in steps)
    for (let x = 0; x < w; x += 40) stepsAcross(g, () => { g.moveTo(x, -H + 30); g.quadraticCurveTo(x + 6, -H / 2, x - 2, 0); g.lineTo(x + 42, 0); g.quadraticCurveTo(x + 36, -H / 2, x + 40, -H + 30); g.closePath(); }, x - 2, -H + 30, 44, H - 30, NAVY, 1.4);
  } else if (r.id === 'dining') {
    // (oak paneling to the ceiling: tall raised panels)
    box(g, 0, -H, w, H, W[3]);
    for (let x = 10; x < w - 60; x += 96) moldPanel(g, x, -H + 50, 86, H - 190, W);
    wainscot(g, 0, w, -120, 0, Dd, 96);
  } else {
    wallpaper(g, 0, -H, w, H, L.paper, W);
    if (L.paper === 'none') for (let x = 20; x < w - 100; x += 150) moldPanel(g, x, -H + 60, 130, H - 210, W);
    wainscot(g, 0, w, -110, 0, Dd);
  }
  crown(g, 0, w, -H, r.id === 'press' ? MARBLE : W);
  const flames = (x: number, y: number) => { sconce(g, x, y); live.flames.push(...sconceFlames(x, y)); };
  const lamp = (x: number, drop: number, cw = 70) => { chandelierArt(g, x, -H + 28, drop, cw); live.flames.push(...chandelierFlames(x, -H + 28, drop, cw)); };
  switch (r.id) {
    case 'entrance': {
      door(g, 150, 0, 120, 236, '#7C4A1E', true);
      signText(g, 'NORTH ENTRANCE', 150, -296, ENGRAVED);
      grandfatherClock(g, 262, 0); live.clock = [262, 0];
      portrait(g, 490, -300, 'washington', 74, 92);
      bust(g, 490, 0);
      ropeLine(g, 380, 600, 0);
      flames(420, -220); flames(560, -220);
      windowAt(g, 790, -96, 92, 210, 0); drapes(g, 790, -330, 96, 330, '#B91C1C');
      flagStand(g, 1000, 0, false); flagStand(g, 1150, 0, true);
      portrait(g, 1090, -320, 'beagle', 62, 76);
      for (const x of [350, 620, 960, 1200]) column(g, x, 0, -H + 30, 32);
      break;
    }
    case 'crosshall': {
      const who = ['lincoln', 'firstlady', 'teddy', 'fdr'] as const;
      [220, 500, 780, 1000].forEach((x, i) => { portrait(g, x, -300, who[i], 66, 84); flames(x - 64, -250); if (i < 3) flames(x + 64, -250); });
      consoleVase(g, 220, 0, '#F472B6'); bust(g, 500, 0); consoleVase(g, 780, 0, '#FDE047');
      for (const x of [90, 360, 640, 920]) column(g, x, 0, -H + 30, 30);
      lamp(360, 60); lamp(780, 60);
      break;
    }
    case 'eastroom': {
      for (const x of [220, 580, 1300]) { windowAt(g, x, -110, 100, 250, x); drapes(g, x, -420, 104, 420, '#E2B33C'); }
      for (const x of [400, 1100]) pilaster(g, x, 0, -H + 30, 26, W);
      fireplace(g, 760, 0, 140, 118); live.fire = [760, 0];
      giltFrame(g, 700, -330, 120, 180); box(g, 708, -322, 104, 164, '#C6DCEA'); box(g, 708, -322, 104, 60, '#DCEAF2'); checker(g, 708, -262, 104, 2, '#DCEAF2', 0, 1); g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.moveTo(716, -170); g.lineTo(730, -170); g.lineTo(790, -310); g.lineTo(776, -310); g.closePath(); g.fill();
      for (const s of [-1, 1]) { inkP(g, () => g.rect(760 + s * 48 - 2, -150, 4, 20), GILT[3], 1); for (const k of [-6, 0, 6]) { inkP(g, () => g.rect(760 + s * 48 + k - 1.5, -164, 3, 12), '#FFFDF2', 1); live.flames.push([760 + s * 48 + k, -166]); } }
      portrait(g, 960, -270, 'washington', 92, 190);
      // (the bandstand's backdrop: bunting swagged along the top)
      for (let x = 1110; x < 1460; x += 60) { const k = Math.round((x - 1110) / 60) % 3, B = R(['#DC2626', '#FFFFFF', '#1D4ED8'][k]); stepsDown(g, () => { g.moveTo(x, -H + 44); g.quadraticCurveTo(x + 30, -H + 90, x + 60, -H + 44); g.closePath(); }, x, -H + 44, 60, 30, B, 1.6); inkP(g, () => g.arc(x, -H + 46, 4, 0, Math.PI * 2), GILT[4], 1); }
      lamp(390, 70, 100); lamp(1180, 70, 100);
      break;
    }
    case 'press': {
      const mx = 600, my = -260;
      // (the oval sign: navy, a gilt ring, the letters)
      inkP(g, () => g.ellipse(mx, my, 156, 74, 0, 0, Math.PI * 2), NAVY[1], 3);
      inkP(g, () => g.ellipse(mx, my, 144, 64, 0, 0, Math.PI * 2), GILT[3], 2);
      box(g, mx - 110, my - 62, 120, 2, GILT[5]);
      inkP(g, () => g.ellipse(mx, my, 134, 56, 0, 0, Math.PI * 2), NAVY[2], 2);
      for (let i = 0; i < 11; i++) { const a = Math.PI + (i / 10) * Math.PI; starAt(g, mx + Math.cos(a) * 118, my + Math.sin(a) * 44, 3, GILT[5]); }
      signText(g, 'THE WHITE HOUSE', mx, my + 4, toonLetters(2));
      signText(g, 'WASHINGTON', mx, my + 30, toonLetters(1, ['#FFFFFF', '#FFFFFF', '#FDE68A', '#F59E0B']));
      flagStand(g, 400, 0, false); flagStand(g, 760, 0, true);
      // (the show's cardboard press corps in rows of folding chairs: cutouts, flat, propped)
      for (let i = 0; i < 8; i++) {
        const x = 290 + i * 98;
        // (the chair's back and seat, then the cutout propped in it)
        slabI(g, x - 18, -86, 36, 10, R('#7A7A86')); box(g, x - 16, -76, 3, 76, INK); box(g, x + 13, -76, 3, 76, INK);
        cutoutReporter(g, x, -30, i);
        slabI(g, x - 18, -46, 36, 6, R('#8A8A96'));
      }
      // (a TV camera on its tripod; Perot's flip charts on easels)
      tvCam(g, 210, 0); tvCam(g, 1060, 0);
      for (const [x, k] of [[120, 0], [1180, 1]] as [number, number][]) flipChart(g, x, 0, k);
      break;
    }
    case 'dining': {
      fireplace(g, 700, 0, 230, 150); live.fire = [700, 0];
      // (the Adams prayer carved in the mantel's frieze)
      signText(g, 'I PRAY HEAVEN TO BESTOW THE BEST', 700, -137, { sx: 1, sy: 1, gap: 1, fill: ['#6A5E80', '#5A4E70'] });
      signText(g, 'OF BLESSINGS ON THIS HOUSE', 700, -128, { sx: 1, sy: 1, gap: 1, fill: ['#6A5E80', '#5A4E70'] });
      portrait(g, 700, -330, 'lincoln', 110, 140, true);
      plaque(g, 700, -256, 'A.LINCOLN');
      // (silver candelabra on the mantel shelf)
      for (const s of [-1, 1]) { const cx = 700 + s * 80; inkP(g, () => g.ellipse(cx, -164, 8, 3, 0, 0, Math.PI * 2), '#D8DCE6', 1); inkP(g, () => g.rect(cx - 2, -184, 4, 20), '#D8DCE6', 1); box(g, cx - 1, -184, 1, 20, '#FFFFFF'); box(g, cx - 11, -186, 22, 3, '#D8DCE6'); for (const k of [-9, 0, 9]) { inkP(g, () => g.rect(cx + k - 1.5, -198, 3, 12), '#FFFDF2', 1); live.flames.push([cx + k, -200]); } }
      for (const x of [250, 1150]) { windowAt(g, x, -100, 90, 220, x + 1); drapes(g, x, -400, 94, 400, '#15803D'); }
      for (const x of [430, 970]) chinaCabinet(g, x, 0);
      lamp(500, 60, 80); lamp(900, 60, 80);
      break;
    }
    case 'stairhall': {
      windowAt(g, 600, -330, 130, 280, 2); drapes(g, 600, -660, 134, 330, '#B91C1C');
      for (const x of [460, 740]) { box(g, x - 34, -560, 68, 230, W[2]); windowAt(g, x, -380, 44, 160, 5); }
      portrait(g, 200, -170, 'jefferson', 62, 80); portrait(g, 300, -420, 'taft', 70, 86); portrait(g, 840, -480, 'jfk', 62, 80);
      // (sconces climbing with the stairs)
      for (let k = 0; k < 5; k++) flames(240 + k * 165, -150 - k * 64);
      // (up on the landing: through an arch, the PRESIDENTIAL BOWLING LANE: the boards going off to the pins)
      const lx = 1030, lf = -F2;
      const arch = () => { g.moveTo(lx - 80, lf); g.lineTo(lx - 80, lf - 130); g.quadraticCurveTo(lx, lf - 200, lx + 80, lf - 130); g.lineTo(lx + 80, lf); g.closePath(); };
      inkP(g, arch, '#2A1836', 3);
      g.save(); g.beginPath(); arch(); g.clip();
      for (let k = 0; k < 7; k++) { const t = k / 7; box(g, lx - 76 + t * 44, lf - 6 - t * 70, 152 - t * 88, 12, k % 2 ? OAK[3] : OAK[4]); box(g, lx - 76 + t * 44, lf - 6 - t * 70, 152 - t * 88, 1, OAK[5]); }
      for (const s of [-1, 1]) { g.strokeStyle = '#1A0E22'; g.lineWidth = 6; g.beginPath(); g.moveTo(lx + s * 76, lf); g.lineTo(lx + s * 30, lf - 80); g.stroke(); }
      box(g, lx - 36, lf - 140, 72, 52, '#1A0E22');
      for (const [row, n] of [[0, 4], [1, 3], [2, 2], [3, 1]] as [number, number][]) for (let i = 0; i < n; i++) {
        const px = lx - (n - 1) * 5 + i * 10, py = lf - 98 + row * 4;
        inkP(g, () => g.ellipse(px, py, 3.4, 7, 0, 0, Math.PI * 2), '#FFFFFF', 1); box(g, px - 2, py - 4, 4, 1.5, '#DC2626'); box(g, px - 2, py - 6, 1, 2, '#FFFFFF');
      }
      g.restore();
      g.strokeStyle = W[4]; g.lineWidth = 3; g.beginPath(); g.moveTo(lx - 84, lf); g.lineTo(lx - 84, lf - 132); g.quadraticCurveTo(lx, lf - 206, lx + 84, lf - 132); g.lineTo(lx + 84, lf); g.stroke();
      // (its sign up over it: a marquee board, bulbs round it)
      inkP(g, () => g.roundRect(lx - 100, -560, 200, 60, 10), '#111827', 4);
      for (let k = 0; k < 22; k++) { const a = (k / 22) * Math.PI * 2; box(g, lx + Math.cos(a) * 92 - 2, -530 + Math.sin(a) * 24 - 2, 4, 4, k % 2 ? '#FDE047' : '#F472B6'); }
      signText(g, 'PRESIDENTIAL', lx, -534, toonLetters(1, ['#FDE047', '#FDE047', '#F59E0B', '#F59E0B']));
      signText(g, 'BOWLING LANE', lx, -516, toonLetters(1, ['#F472B6', '#F472B6', '#EC4899', '#DB2777']));
      column(g, 110, 0, -H + 30, 34);
      lamp(300, 90, 100);
      break;
    }
    case 'centerhall': {
      plaque(g, 240, -380, 'PRIVATE RESIDENCE');
      bookcase(g, 135, 0, 210, 190, 3);
      portrait(g, 240, -290, 'beagle', 62, 76);
      sofa(g, 410, 0, 200, '#3E6FB0');
      portrait(g, 510, -300, 'fdr', 66, 84);
      flames(445, -250); flames(575, -250);
      door(g, 735, 0, 70, 200, '#5B2E1A', false, 'LINCOLN BEDROOM');
      for (const x of [100, 380, 640]) column(g, x, 0, -H + 30, 28, R('#FFF7E6'));
      break;
    }
    case 'lincoln': {
      // (a wardrobe, the portrait, his hat on a peg, the carved headboard (scenery: dimmed), the dresser and lamp, the
      // Gettysburg Address under glass, the sampler, the window)
      slabI(g, 60, -210, 96, 210, OAK); for (const x of [66, 110]) { box(g, x, -196, 40, 180, OAK[2]); box(g, x + 2, -194, 36, 176, OAK[3]); box(g, x + 2, -194, 36, 1, OAK[4]); }
      inkP(g, () => g.arc(104, -110, 3, 0, Math.PI * 2), GILT[4], 1); inkP(g, () => g.arc(114, -110, 3, 0, Math.PI * 2), GILT[4], 1);
      inkP(g, () => { g.moveTo(52, -210); g.quadraticCurveTo(108, -236, 164, -210); g.closePath(); }, OAK[3], 2);
      portrait(g, 230, -300, 'lincoln', 70, 90);
      box(g, 284, -150, 8, 4, GILT[3]);
      inkP(g, () => g.rect(270, -186, 26, 34), '#16161E', 1.4); inkP(g, () => g.rect(262, -154, 42, 5), '#16161E', 1.4); box(g, 272, -184, 4, 30, '#2E2E3A');
      const hd = (col: string) => mix(col, '#7E7AA4', 0.32);
      inkP(g, () => { g.moveTo(350, 0); g.lineTo(350, -220); g.quadraticCurveTo(455, -330, 560, -220); g.lineTo(560, 0); g.closePath(); }, hd('#5B2E1A'), 4);
      inkP(g, () => { g.moveTo(366, -10); g.lineTo(366, -210); g.quadraticCurveTo(455, -306, 544, -210); g.lineTo(544, -10); g.closePath(); }, hd('#6B3820'), 2);
      inkP(g, () => g.ellipse(455, -250, 30, 20, 0, 0, Math.PI * 2), hd('#7C3A1E'), 3);
      for (const s of [-1, 1]) inkP(g, () => g.ellipse(455 + s * 22, -262, 10, 6, s * 0.5, 0, Math.PI * 2), hd('#8A4A26'), 1.6);
      slabI(g, 600, -76, 140, 76, OAK); slabI(g, 594, -84, 152, 10, MARBLE);
      for (const x of [612, 672]) { box(g, x, -66, 54, 24, OAK[2]); box(g, x + 1, -65, 52, 1, OAK[4]); inkP(g, () => g.arc(x + 27, -54, 2.5, 0, Math.PI * 2), GILT[4], 1); }
      inkP(g, () => g.rect(714, -120, 6, 36), GILT[3], 1); inkP(g, () => { g.moveTo(702, -150); g.lineTo(732, -150); g.lineTo(738, -120); g.lineTo(696, -120); g.closePath(); }, '#F2E2B0', 1.4);
      inkP(g, () => g.roundRect(624, -100, 16, 16, 3), '#E2E8F0', 1); box(g, 627, -96, 4, 4, '#FFFFFF');
      giltFrame(g, 600, -260, 90, 80); box(g, 608, -252, 74, 64, '#F5EBD0'); box(g, 608, -252, 74, 2, '#FFFFFF');
      for (let k = 0; k < 7; k++) box(g, 612, -246 + k * 8, 62 - (k % 3) * 9, 2, '#6B5B4E');
      g.fillStyle = 'rgba(255,255,255,0.4)'; g.beginPath(); g.moveTo(612, -192); g.lineTo(620, -192); g.lineTo(652, -248); g.lineTo(644, -248); g.closePath(); g.fill();
      plaque(g, 645, -176, 'GETTYSBURG');
      slabI(g, 584, -350, 70, 56, R('#F5EBD0')); for (let k = 0; k < 12; k++) box(g, 588 + k * 5, -348, 3, 3, k % 2 ? '#B91C1C' : '#15803D');
      signText(g, 'LINCOLN', 619, -330, tinyLetters(['#B91C1C', '#991B1B'])); signText(g, 'SLEPT', 619, -320, tinyLetters(['#15803D', '#166534'])); signText(g, 'HERE', 619, -310, tinyLetters(['#1D4ED8', '#1E3A8A']));
      windowAt(g, 792, -100, 54, 220, 4); drapes(g, 792, -380, 58, 380, '#7F1D1D');
      break;
    }
    case 'sitting': {
      const mx = 300, base = -120;
      // (the big half-moon fan window: the sky by the hour through it, the treetops, its glazing bars)
      const tod = timeOfDay();
      g.save(); g.beginPath(); g.moveTo(mx - 156, base + 120); g.lineTo(mx - 156, base); g.arc(mx, base, 156, Math.PI, 0); g.lineTo(mx + 156, base + 120); g.closePath(); g.clip();
      for (let i = 0; i < 8; i++) box(g, mx - 160, base - 160 + i * 30, 320, 31, skyAt(0.1 + i * 0.11, tod));
      for (let k = 0; k < 12; k++) { g.fillStyle = mix('#2E7A3A', skyAt(0.9, tod), 0.2 + (k % 2) * 0.1); g.beginPath(); g.arc(mx - 150 + k * 28, base + 40 - hash(k) * 30, 22, 0, Math.PI * 2); g.fill(); }
      box(g, mx - 160, base + 60, 320, 60, mix('#4AA04A', tod.haze, 0.15));
      if (tod.lamps > 0.3) checker(g, mx - 160, base - 160, 320, 280, '#FFE8A0', 0, 2);
      g.restore();
      inkP(g, () => { g.moveTo(mx - 170, base); g.arc(mx, base, 170, Math.PI, 0); g.lineTo(mx + 156, base); g.arc(mx, base, 156, 0, Math.PI, true); g.closePath(); }, MARBLE[4], 3);
      g.strokeStyle = INK; g.lineWidth = 4; for (let k = 1; k < 8; k++) { const t = Math.PI + (k / 8) * Math.PI; g.beginPath(); g.moveTo(mx, base); g.lineTo(mx + Math.cos(t) * 156, base + Math.sin(t) * 156); g.stroke(); }
      g.strokeStyle = '#FFFFFF'; g.lineWidth = 2; g.stroke();
      for (let k = 1; k < 8; k++) { const t = Math.PI + (k / 8) * Math.PI; g.beginPath(); g.moveTo(mx, base); g.lineTo(mx + Math.cos(t) * 156, base + Math.sin(t) * 156); g.stroke(); }
      inkP(g, () => g.arc(mx, base, 30, Math.PI, 0), MARBLE[4], 3);
      for (const x of [mx - 104, mx - 52, mx, mx + 52, mx + 104]) { box(g, x - 2, base, 4, 120, INK); box(g, x - 1, base, 2, 120, '#FFFFFF'); }
      box(g, mx - 170, base - 2, 340, 4, INK);
      sofa(g, mx - 120, 0, 240, '#C8582A');
      pottedPalm(g, 70, 0, 130); pottedPalm(g, 530, 0, 110);
      flames(110, -250); flames(490, -250);
      break;
    }
  }
};
/** A cardboard cutout reporter in a folding chair (the show's press corps): flat, a notepad up, a fedora or a perm. */
const cutoutReporter = (g: Ctx, x: number, foot: number, i: number) => {
  const skin = ['#F2BC98', '#C98A6A', '#8A5A3E', '#E8B08A'][i % 4], coat = ['#7A6A4A', '#4A5A7A', '#8A3A3A', '#5A6A4A'][i % 4];
  stepsAcross(g, () => { g.moveTo(x - 16, foot); g.lineTo(x - 14, foot - 44); g.quadraticCurveTo(x, foot - 50, x + 14, foot - 44); g.lineTo(x + 16, foot); g.closePath(); }, x - 16, foot - 50, 32, 50, R(coat), 1.4);
  inkP(g, () => g.ellipse(x, foot - 58, 9, 10, 0, 0, Math.PI * 2), skin, 1.4);
  if (i % 2) { inkP(g, () => g.rect(x - 12, foot - 68, 24, 3), '#3A3020', 1); inkP(g, () => g.rect(x - 8, foot - 76, 16, 8), '#3A3020', 1); box(g, x - 8, foot - 70, 16, 2, '#C8202E'); }
  else inkP(g, () => g.ellipse(x, foot - 64, 11, 7, 0, Math.PI, 0), ['#3A2416', '#E8C060', '#1A1A1A', '#8A4A2A'][i % 4], 1.2);
  box(g, x - 4, foot - 59, 2, 2, INK); box(g, x + 3, foot - 59, 2, 2, INK); box(g, x - 2, foot - 53, 5, 1, INK);
  slabI(g, x + 6, foot - 40, 12, 14, R('#F8F4E8'), 1); box(g, x + 8, foot - 36, 8, 1, '#8A8A96'); box(g, x + 8, foot - 32, 6, 1, '#8A8A96');
  // (the prop's cardboard edge and its easel back showing)
  box(g, x - 17, foot - 2, 34, 2, '#C8A060');
};
const tvCam = (g: Ctx, x: number, foot: number) => {
  for (const s of [-18, 0, 18]) { g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(x, foot - 90); g.lineTo(x + s, foot); g.stroke(); g.strokeStyle = '#8A8AA0'; g.lineWidth = 1.4; g.stroke(); }
  slabI(g, x - 26, foot - 126, 52, 34, R('#3A3A48'));
  inkP(g, () => g.rect(x + 26, foot - 120, 18, 22), '#1A1A22', 1.4); inkP(g, () => g.arc(x + 46, foot - 109, 7, 0, Math.PI * 2), '#22408E', 1.4); box(g, x + 43, foot - 113, 3, 3, '#9CBCF0');
  slabI(g, x - 18, foot - 140, 22, 12, R('#2A2A36'), 1); signText(g, 'CAM', x - 7, foot - 132, tinyLetters(['#FDE047', '#F59E0B']));
};
const flipChart = (g: Ctx, x: number, foot: number, k: number) => {
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(x - 22, foot); g.lineTo(x, foot - 170); g.lineTo(x + 22, foot); g.moveTo(x, foot); g.lineTo(x, foot - 70); g.stroke();
  g.strokeStyle = OAK[3]; g.lineWidth = 2; g.stroke();
  slabI(g, x - 44, foot - 210, 88, 100, R('#F8F6EE'));
  box(g, x - 44, foot - 214, 88, 6, INK); for (let i = 0; i < 6; i++) box(g, x - 40 + i * 16, foot - 216, 6, 6, '#8A8AA0');
  if (k) { g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(x - 34, foot - 130); g.lineTo(x - 12, foot - 152); g.lineTo(x + 6, foot - 144); g.lineTo(x + 32, foot - 196); g.stroke(); g.strokeStyle = '#DC2626'; g.lineWidth = 2.4; g.stroke(); box(g, x - 36, foot - 124, 72, 2, '#3A3A48'); box(g, x - 36, foot - 200, 2, 78, '#3A3A48'); }
  else { const cuts = [0, 0.38, 0.62, 0.83, 1], cols = ['#EF4444', '#3B82F6', '#FACC15', '#22C55E']; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(x, foot - 160); g.arc(x, foot - 160, 32, cuts[i] * Math.PI * 2, cuts[i + 1] * Math.PI * 2); g.closePath(); g.fillStyle = cols[i]; g.fill(); g.strokeStyle = INK; g.lineWidth = 1.4; g.stroke(); } box(g, x - 20, foot - 186, 8, 3, '#FFFFFF'); }
};
const chinaCabinet = (g: Ctx, x: number, foot: number) => {
  slabI(g, x - 50, foot - 230, 100, 230, OAK);
  inkP(g, () => { g.moveTo(x - 56, foot - 230); g.quadraticCurveTo(x, foot - 262, x + 56, foot - 230); g.closePath(); }, OAK[3], 2);
  box(g, x - 42, foot - 218, 84, 130, INK); box(g, x - 41, foot - 217, 82, 128, '#2A1A22');
  for (let s = 0; s < 3; s++) {
    const sy = foot - 210 + s * 42;
    box(g, x - 41, sy + 34, 82, 3, OAK[4]);
    for (let k = 0; k < 4; k++) { const px = x - 30 + k * 20; inkP(g, () => g.ellipse(px, sy + 20, 9, 13, 0, 0, Math.PI * 2), '#F8FAFC', 1); inkP(g, () => g.ellipse(px, sy + 20, 5, 8, 0, 0, Math.PI * 2), ['#1D4ED8', '#E2B33C', '#B91C1C'][(k + s) % 3], 0.8); }
  }
  box(g, x - 1, foot - 218, 2, 130, OAK[1]);
  g.fillStyle = 'rgba(255,255,255,0.3)'; g.beginPath(); g.moveTo(x - 38, foot - 92); g.lineTo(x - 30, foot - 92); g.lineTo(x - 4, foot - 214); g.lineTo(x - 12, foot - 214); g.closePath(); g.fill();
  for (const yy of [foot - 74, foot - 40]) { box(g, x - 42, yy, 84, 28, OAK[2]); box(g, x - 40, yy + 2, 80, 24, OAK[3]); inkP(g, () => g.arc(x, yy + 14, 3, 0, Math.PI * 2), GILT[4], 1); }
};

// ---------------------------------------------------------------------------------------------------------------
// The shell: ceiling, floor, cutaway, the wall's stamp, the live bits

const lives = new Map<string, Live>();
/** The live bits' points (worked out the once by running the painter over a canvas that's thrown away). */
const liveOf = (r: Room): Live | null => {
  let live = lives.get(r.id);
  if (live) return live;
  const g = nullCtx();
  if (!g) return null;
  live = { flames: [] };
  paintWall(g, r, live);
  lives.set(r.id, live);
  return live;
};
/** The arches' foot heights (local y) at a room's left and right ends (null: no doorway there). */
const archFeet = (r: Room): [number | null, number | null] => {
  if (r.id === 'entrance') return [null, 0];
  if (r.id === 'stairhall') return [0, -F2];
  if (r.id === 'sitting') return [0, null];
  return [0, 0];
};
const NEXT: Record<string, [string, string]> = {
  entrance: ['#F6E2B8', '#FFE6B4'], crosshall: ['#F6E2B8', '#FFF4DE'], eastroom: ['#FFE6B4', '#2D4EA8'], press: ['#FFF4DE', '#C89A5A'],
  dining: ['#2D4EA8', '#FDE2C6'], stairhall: ['#C89A5A', '#FDE68A'], centerhall: ['#FDE2C6', '#3F7D56'], lincoln: ['#FDE68A', '#F8D4C0'], sitting: ['#3F7D56', '#9DD6F5'],
};
const wallOf = (c: Ctx, r: Room) => {
  const w = r.b - r.a, H = r.ceil - r.floor, L = LOOK[r.id];
  still(c, `wh1-wall-${r.id}`, X(r.a), Y(r.floor), -70, -H - 12, w + 140, H + 20, g => {
    paintWall(g, r, { flames: [] });
    const [la, ra] = archFeet(r), W = R(L.wall), [nl, nr] = NEXT[r.id];
    if (la !== null) doorway(g, 0, la, W, nl);
    if (ra !== null) doorway(g, w, ra, W, nr);
    g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(0, -H, w, H);
  });
};
/** A 1x1 canvas the live bits' points are worked out on (nothing of it's ever shown). */
let nc: Ctx | null = null;
const nullCtx = (): Ctx | null => {
  if (nc) return nc;
  if (typeof document === 'undefined') return null;
  const cv = document.createElement('canvas'); cv.width = 1; cv.height = 1;
  nc = cv.getContext('2d');
  return nc;
};

/** The floor going back from the back wall to the play plane: stepped bands, its pattern. */
const floorOf = (c: Ctx, E: P, r: Room) => {
  const L = LOOK[r.id], a = X(r.a), b = X(r.b), fy = Y(r.floor), F = R(L.floorCol);
  const dAt = (k: number) => D_BACK + (1 - D_BACK) * k;
  const band = (k0: number, k1: number, col: string, x0 = a, x1 = b) => quad(c, [proj(E, x0, fy, dAt(k0)), proj(E, x1, fy, dAt(k0)), proj(E, x1, fy, dAt(k1)), proj(E, x0, fy, dAt(k1))], col);
  // (the base, darker going back)
  for (let i = 0; i < 4; i++) band(i / 4, (i + 1) / 4, F[1 + i] ?? F[4]);
  const line = (x: number, k0: number, k1: number, col: string, w = 1) => { const p0 = proj(E, x, fy, dAt(k0)), p1 = proj(E, x, fy, dAt(k1)); c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke(); };
  const across = (k: number, col: string, w = 1, x0 = a, x1 = b) => { const p0 = proj(E, x0, fy, dAt(k)), p1 = proj(E, x1, fy, dAt(k)); c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke(); };
  if (L.floor === 'marble' || L.floor === 'checker') {
    // (squares, alternating, a dither of veining on the light ones)
    const B = R(L.floorCol2!);
    for (let x = r.a; x < r.b; x += 60) for (let k = 0; k < 4; k++) {
      if (((Math.floor((x - r.a) / 60)) + k) % 2 === 0) continue;
      quad(c, [proj(E, X(x), fy, dAt(k / 4)), proj(E, X(x + 60), fy, dAt(k / 4)), proj(E, X(x + 60), fy, dAt((k + 1) / 4)), proj(E, X(x), fy, dAt((k + 1) / 4))], B[1 + k]);
    }
    for (let x = r.a; x < r.b; x += 60) line(X(x), 0, 1, mix(F[1], INK, 0.3));
    for (let k = 1; k < 4; k++) across(k / 4, mix(F[1], INK, 0.3));
    if (r.id === 'entrance') {
      // (the Seal inlaid in the middle of the floor, squashed into the floor's plane)
      // (as deep as it's wide on the floor: its height is the floor's own depth on screen, near enough)
      const m = proj(E, X(520), fy, dAt(0.5)), sy = Math.max(0.03, (Math.abs(fy - E.y) * (1 - D_BACK) * 0.7) / 144);
      c.save(); c.translate(m.x, m.y); c.scale(0.9, sy); seal(c, 0, 0, 72); c.restore();
    }
  } else if (L.floor === 'runner') {
    // (marble each side; the red runner down the middle, gold borders, a pattern of diamonds)
    const Rr = R(L.floorCol2!);
    band(0.22, 0.78, Rr[2]); band(0.32, 0.68, Rr[3]); band(0.42, 0.58, Rr[4]);
    across(0.22, GILT[4], 2); across(0.78, GILT[2], 2); across(0.28, GILT[3], 1); across(0.72, GILT[3], 1);
    for (let x = r.a + 30; x < r.b; x += 60) { const p = proj(E, X(x), fy, dAt(0.5)); c.fillStyle = GILT[3]; c.beginPath(); c.moveTo(p.x - 7, p.y); c.lineTo(p.x, p.y - 2); c.lineTo(p.x + 7, p.y); c.lineTo(p.x, p.y + 2); c.closePath(); c.fill(); }
    for (let x = r.a; x < r.b; x += 60) { line(X(x), 0, 0.22, mix(F[1], INK, 0.25)); line(X(x), 0.78, 1, mix(F[1], INK, 0.25)); }
  } else if (L.floor === 'parquet') {
    const P2 = R(L.floorCol2!);
    for (let x = r.a; x < r.b; x += 40) for (let k = 0; k < 4; k++) if (((x - r.a) / 40 + k) % 2 === 0) quad(c, [proj(E, X(x), fy, dAt(k / 4)), proj(E, X(x + 40), fy, dAt(k / 4)), proj(E, X(x + 40), fy, dAt((k + 1) / 4)), proj(E, X(x), fy, dAt((k + 1) / 4))], P2[1 + k]);
    for (let x = r.a; x < r.b; x += 20) line(X(x), 0, 1, mix(F[1], INK, 0.2));
    for (let k = 1; k < 4; k++) across(k / 4, mix(F[1], INK, 0.35));
  } else if (L.floor === 'carpet') {
    // (the carpet's border, a field of little gold stars / medallions)
    across(0.1, L.floorCol2!, 2); across(0.9, L.floorCol2!, 2);
    for (let x = r.a + 20; x < r.b; x += 50) for (const k of [0.3, 0.55, 0.8]) { const p = proj(E, X(x + (k * 100) % 25), fy, dAt(k)); c.fillStyle = mix(L.floorCol2!, F[3], 0.2); c.fillRect(p.x - 2, p.y - 1, 4, 2); c.fillRect(p.x - 1, p.y - 2, 2, 4); }
  } else if (L.floor === 'rug') {
    // (the boards, then a rug laid over the middle: its border and field)
    for (let x = r.a; x < r.b; x += 26) line(X(x), 0, 1, mix(F[1], INK, 0.25));
    const G = R(L.floorCol2!), ra = X(r.a + 60), rb = X(r.b - 60);
    band(0.15, 0.85, G[2], ra, rb); band(0.25, 0.75, G[3], ra + 20, rb - 20);
    across(0.18, GILT[3], 2, ra, rb); across(0.82, GILT[2], 2, ra, rb);
    for (let x = r.a + 100; x < r.b - 80; x += 70) { const p = proj(E, X(x), fy, dAt(0.5)); c.fillStyle = GILT[3]; c.beginPath(); c.ellipse(p.x, p.y, 10, 2.5, 0, 0, Math.PI * 2); c.fill(); }
  }
  // (the floor's back edge under the wall: a skirting shadow)
  across(0.02, INK, 2);
};
/** The ceiling going back: stepped bands (darker toward the front), coffers, a cove along the back, medallions. */
const ceilingOf = (c: Ctx, E: P, r: Room) => {
  const L = LOOK[r.id], a = X(r.a), b = X(r.b), cy = Y(r.ceil), Cc = R(L.ceil);
  const dAt = (k: number) => D_BACK + (1 - D_BACK) * k;
  for (let i = 0; i < 4; i++) quad(c, [proj(E, a, cy, dAt(i / 4)), proj(E, b, cy, dAt(i / 4)), proj(E, b, cy, dAt((i + 1) / 4)), proj(E, a, cy, dAt((i + 1) / 4))], Cc[4 - i]);
  // (coffers: beams across and along)
  for (let x = r.a + 80; x < r.b; x += 160) {
    const p0 = proj(E, X(x), cy, dAt(0)), p1 = proj(E, X(x), cy, dAt(1));
    c.strokeStyle = Cc[1]; c.lineWidth = 4; c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke();
    c.strokeStyle = Cc[5]; c.lineWidth = 1; c.beginPath(); c.moveTo(p0.x - 2, p0.y); c.lineTo(p1.x - 2, p1.y); c.stroke();
  }
  for (const k of [0.33, 0.66]) { const p0 = proj(E, a, cy, dAt(k)), p1 = proj(E, b, cy, dAt(k)); c.strokeStyle = Cc[1]; c.lineWidth = 3; c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke(); c.strokeStyle = GILT[3]; c.lineWidth = 1; c.beginPath(); c.moveTo(p0.x, p0.y + 2); c.lineTo(p1.x, p1.y + 2); c.stroke(); }
};

/** One room: the brick above it, its ceiling, its floor, its back wall, the doorways, the live bits. */
export const drawRoom = (c: Ctx, state: GameState, E: P, r: Room) => {
  if (!LOOK[r.id]) return;
  const a = X(r.a), b = X(r.b), fy = Y(r.floor), cy = Y(r.ceil);
  if (!seenAt(state, E, a - 80, b + 80, D_BACK, 80) && !(b > state.camera.x - 80 && a < state.camera.x + CANVAS_WIDTH + 80)) return;
  // (the house above the ceiling: the cutaway's brick)
  cutawayAt(c, state, a, b, cy);
  ceilingOf(c, E, r);
  floorOf(c, E, r);
  atDepth(c, E, D_BACK, () => {
    wallOf(c, r);
    const live = liveOf(r);
    if (!live) return;
    c.save(); c.translate(a, fy);
    candleFlames(c, live.flames, state.frame);
    if (live.fire) fireAt(c, live.fire[0], live.fire[1], state.frame);
    if (live.clock) clockPendulum(c, live.clock[0], live.clock[1], state.frame);
    c.restore();
  });
};
/** The brick above a stretch of ceiling (play plane), painted in 400-wide stamps. */
const cutawayAt = (c: Ctx, state: GameState, a: number, b: number, cy: number) => {
  const v0 = state.camera.x - 40, v1 = state.camera.x + CANVAS_WIDTH + 40;
  if (cy < state.camera.y - 10) return;
  for (let x = Math.floor(Math.max(a, v0) / 400) * 400; x < Math.min(b, v1); x += 400) {
    const x0 = Math.max(a, x), x1 = Math.min(b, x + 400);
    still(c, `wh1-cut-${x0}-${x1}-${cy}`, x0, cy, 0, -1200, x1 - x0, 1200, g => cutaway(g, 0, x1 - x0, 0, 1200));
  }
};
/** Every room (back to front: walls first, all at the one depth). */
export const drawRooms = (c: Ctx, state: GameState, E: P) => { for (const r of ROOMS) if (!r.outdoors) drawRoom(c, state, E, r); };

// ---------------------------------------------------------------------------------------------------------------
// The ground floor under the second floor (the play plane's face from the stairs' top to the balcony): the second
// floor's slab cut away (joists end on), and under it the ground floor's hall: wainscot, doors with their brass plates
// (the Library, the China Room, the Vermeil Room, the Map Room, the Diplomatic Reception Room), portraits, sconces.

const UNDER_ROOMS = ['THE LIBRARY', 'THE CHINA ROOM', 'THE VERMEIL ROOM', 'THE MAP ROOM', 'DIPLOMATIC RECEPTION', 'THE GROUND FLOOR'];
export const drawUnderDeck = (c: Ctx, state: GameState) => {
  const e0 = X(STAIRS.b), e1 = X(BALCONY_EDGE), top = Y(F2);
  const v0 = state.camera.x - 40, v1 = state.camera.x + CANVAS_WIDTH + 40;
  if (e1 < v0 || e0 > v1) return;
  // (its chair rail and panels kept muted: it's a wall in the play plane, nothing on it to stand on)
  const W = R('#F4DCB0'), Dd = R('#E0BC86').map((col, i) => (i >= 4 ? mix(col, '#B89A7A', 0.55) : col));
  // (the stretches: the hall under the residence; the last, under the Truman Balcony, outdoors: the house's south front)
  const cuts = [STAIRS.b, 7880, 8360, 8840, 9320, 9950, BALCONY_EDGE].map(X);
  for (let i = 0; i < cuts.length - 1; i++) {
    const x = cuts[i], x1 = cuts[i + 1];
    if (x1 < v0 || x > v1) continue;
    const w = x1 - x, outside = i === cuts.length - 2;
    still(c, `wh1-under-${i}`, x, GY, 0, -F2 - 4, w, F2 + 44, g => {
      const h = F2;
      if (outside) {
        // (the ground floor's outside under the balcony: white ashlar, an arched window either side of a door, the
        // portico's column bases, a lantern; the balcony's slab over it)
        slabI(g, 0, -h, w, h, MARBLE);
        for (let y = -h + 40; y < 0; y += 22) { box(g, 0, y, w, 1, MARBLE[2]); for (let k = ((y / 22) & 1) * 30; k < w; k += 60) box(g, k, y, 1, 22, MARBLE[2]); }
        for (const wx of [70, w - 70]) windowAt(g, wx, -60, 60, 150, 7);
        door(g, w / 2, 0, 66, 170, '#2E5A3E', true);
        for (const cx of [20, w - 20]) slabI(g, cx - 22, -40, 44, 40, MARBLE);
        box(g, 0, -h - 4, w, 34, INK); box(g, 0, -h, w, 26, MARBLE[3]); box(g, 0, -h, w, 3, MARBLE[5]); for (let k = 8; k < w; k += 20) box(g, k, -h + 8, 10, 14, MARBLE[2]);
        box(g, 0, -h + 26, w, 4, INK); checker(g, 0, -h + 30, w, 6, MARBLE[1], 0, 1);
        return;
      }
      wallpaper(g, 0, -h, w, h, 'diamond', W);
      wainscot(g, 0, w, -90, 0, Dd, 80);
      // (a door to one of the ground floor's rooms, its plate; a portrait and sconces)
      const dx = Math.round(w * 0.5);
      door(g, dx, 0, 70, 160, '#7C4A1E', false);
      plaque(g, dx, -214, UNDER_ROOMS[i % UNDER_ROOMS.length]);
      if (w > 300) { portrait(g, Math.round(w * 0.18), -150, (['nixon', 'jfk', 'taft', 'firstlady', 'jefferson', 'teddy'] as const)[i % 6], 54, 68); sconce(g, Math.round(w * 0.82), -160); }
      // (the second floor's slab cut away along the top: plaster, joists end on, the floor's boards; inked fat)
      box(g, 0, -h - 4, w, 34, INK); box(g, 0, -h, w, 26, '#D8C4A8'); box(g, 0, -h, w, 3, '#F2E2C8');
      for (let k = 10; k < w; k += 48) { box(g, k, -h + 6, 14, 16, '#8A5A30'); box(g, k, -h + 6, 14, 2, '#B07A44'); box(g, k + 4, -h + 11, 6, 6, '#6A4020'); }
      box(g, 0, -h + 26, w, 4, INK);
      checker(g, 0, -h + 30, w, 6, '#5A3A2A', 0, 1);
    });
    void Dd;
  }
  // (live: the sconces' flames)
  for (let i = 0; i < cuts.length - 2; i++) { const x = cuts[i], w = cuts[i + 1] - x; if (w > 300 && x < v1 && x + w > v0) candleFlames(c, sconceFlames(x + Math.round(w * 0.82), GY - 160), state.frame); }
  // (the second floor's edge: its lit lip, all along)
  box(c, e0, top, e1 - e0, 3, '#FFF6E0'); box(c, e0 + 4, top, (e1 - e0) * 0.3, 1, '#FFFFFF');
  void MARBLE; void VELVET; void OAK;
};
export { LOOK };
