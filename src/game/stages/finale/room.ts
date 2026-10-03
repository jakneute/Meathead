// The White House press room, at game scale: the room the ending's cutscene happens in (the blue curtain behind the
// podium, the oval WHITE HOUSE sign, the flags, the podium with the seal on it, the press seats, the TV cameras), with
// tall windows either side onto the lawn at night, a lighting truss under the coffered ceiling, two press risers to
// get up on, the blue carpet. Then, each time one of Meathead's guns runs dry, the room wrecked that weapon's way, for
// good, on top of whatever's wrecked it already:
//   the shotgun: iced over (frost on everything, icicles off the truss and the molding, the carpet a rink);
//   the flamethrower: on fire (the curtains and the drapes burning, scorched black, smoke under the ceiling);
//   the boulders: caved in (holes knocked through the walls to the night, cracks, the sign down, rubble);
//   the tsunami: flooded (the water standing a foot deep, the tide line up the walls, everything soaked);
//   the barfer: slimed (green muck splattered up the walls and over the ceiling, pooled in the corners);
//   the taser: blown (the lights dead, wires hanging sparking, the power flickering);
//   the oil rockets: oiled (black crude all over, a rainbow sheen on it, the floor slick);
//   the needles: needled (syringes stuck in everything).
// What doesn't move is painted the once (the room, and the room with each set of wrecks on it), at the screen's own
// resolution, and put down whole each frame; only what moves (flames, water, sparks, the doors) is drawn live.

import type { GameState } from '../../core/state';
import type { WeaponType } from '../../../types';
import { RENDER_SCALE, CANVAS_WIDTH, topBand } from '../../../constants';
import { INK, ink, shaded } from '../../render/npc/kit';
import { bandedGradient, pixelBlob, steppedGlow } from '../../render/pixelArt';
import { RAMP } from '../../scenes/art/snes';
import { drawFire } from '../../render/fx/fire';
import { hash } from '../../render/backdrops/core';
import { getFinale, FinaleRuntime } from './state';
import { WRECK_ORDER } from './runtime';
import {
  ROOM_L, ROOM_R, ROOM_MID, ROOM_TOP, FLOOR, VIEW_X, VIEW_Y, VIEW_W, VIEW_H, VIEW_SCALE, WALL_T,
  DOOR_H, WINDOW_TOP, WINDOW_BOTTOM, RISERS, RISER_H,
} from './geometry';
import { drawBeam } from '../../render/bosses/alien';
import { drawKillCamHud } from './killCam';

type Ctx = CanvasRenderingContext2D;

const CUR_L = ROOM_MID - 260, CUR_R = ROOM_MID + 260;
/** The two big windows in the back wall (x of their middles), how wide, top and bottom. */
const BACK_WINDOWS = [ROOM_L + 150, ROOM_R - 150];
const BW_W = 124, BW_TOP = -70, BW_BOT = 300;
const WAINSCOT = 330;
const DAIS_TOP = 506;
const PODIUM = { x: ROOM_MID - 38, y: 404, w: 76 };

const R = (g: Ctx, x: number, y: number, w: number, h: number, c: string) => { g.fillStyle = c; g.fillRect(x, y, w, h); };

// ---------------------------------------------------------------------------
// The room
// ---------------------------------------------------------------------------

const paintCeiling = (g: Ctx) => {
  bandedGradient(g, VIEW_X, VIEW_Y, VIEW_W, ROOM_TOP - VIEW_Y, ['#07070d', '#0d0d16', '#15151f', '#1d1d2a'], 6);
  // Coffers: recessed panels, a downlight in each
  for (let x = VIEW_X + 20; x < VIEW_X + VIEW_W - 60; x += 116) for (const y of [-272, -214]) {
    R(g, x, y, 100, 48, '#0a0a12'); R(g, x + 4, y + 4, 92, 40, '#13131d');
    R(g, x + 4, y + 42, 92, 2, '#2a2a3a'); R(g, x + 94, y + 4, 2, 40, '#22222f');
    steppedGlow(g, x + 50, y + 24, 18, '#fde68a', 0.16, 0, 4);
    R(g, x + 44, y + 21, 12, 6, '#fef3c7'); R(g, x + 46, y + 22, 8, 4, '#ffffff');
  }
  // The crown molding: gold, a dark line under it
  R(g, VIEW_X, ROOM_TOP - 8, VIEW_W, 8, '#8c6000'); R(g, VIEW_X, ROOM_TOP - 8, VIEW_W, 2, '#e8b400'); R(g, VIEW_X, ROOM_TOP - 2, VIEW_W, 2, '#3a2600');
  // The lighting truss under it: two chords, the zigzag between, the cans hanging off it
  const ty = ROOM_TOP + 6;
  R(g, ROOM_L, ty, ROOM_R - ROOM_L, 3, '#3a3f48'); R(g, ROOM_L, ty + 16, ROOM_R - ROOM_L, 3, '#2a2e35');
  R(g, ROOM_L, ty, ROOM_R - ROOM_L, 1, '#868e9a');
  g.strokeStyle = '#3a3f48'; g.lineWidth = 2; g.beginPath();
  for (let x = ROOM_L; x < ROOM_R; x += 24) { g.moveTo(x, ty + 2); g.lineTo(x + 12, ty + 17); g.lineTo(x + 24, ty + 2); }
  g.stroke();
  for (const [x, a] of TRUSS_LIGHTS) {
    // (the light falling from it: a faint cone, banded)
    g.save(); g.globalAlpha = 0.05;
    for (let k = 0; k < 3; k++) { g.fillStyle = '#fef3c7'; g.beginPath(); g.moveTo(x - 5, ty + 30); g.lineTo(x + 5, ty + 30); g.lineTo(x + Math.sin(a) * 600 + 60 - k * 18, FLOOR); g.lineTo(x + Math.sin(a) * 600 - 60 + k * 18, FLOOR); g.closePath(); g.fill(); }
    g.restore();
    paintCan(g, x, ty + 20, a, false);
  }
};
/** The stage lights on the truss: where, and which way they're pointed. */
const TRUSS_LIGHTS: [number, number][] = [[ROOM_L + 150, 0.35], [ROOM_MID - 250, 0.22], [ROOM_MID - 80, 0.06], [ROOM_MID + 80, -0.06], [ROOM_MID + 250, -0.22], [ROOM_R - 150, -0.35]];
const paintCan = (g: Ctx, x: number, y: number, a: number, blown: boolean) => {
  g.save(); g.translate(x, y); g.rotate(a);
  R(g, -2, -14, 4, 8, '#26262c');
  ink(g, () => g.roundRect(-9, -6, 18, 22, 3), '#18181c', 1);
  R(g, -7, -4, 3, 18, '#3a3a44');
  if (blown) { ink(g, () => g.rect(-7, 14, 14, 4), '#0c0c10', 0.8); R(g, -5, 15, 3, 2, '#52525b'); R(g, 1, 16, 4, 1, '#71717a'); }
  else { ink(g, () => g.rect(-7, 14, 14, 4), '#fef3c7', 0.8); R(g, -5, 15, 10, 2, '#ffffff'); }
  g.restore();
};

/** A back-wall window onto the lawn at night: the sky, the monument, the trees, the fountain lit; gold drapes. */
const paintBackWindow = (g: Ctx, cx: number, i: number) => {
  const x = cx - BW_W / 2, w = BW_W, top = BW_TOP, h = BW_BOT - BW_TOP;
  // (the arch at the top)
  const shape = () => { g.moveTo(x, top + 40); g.quadraticCurveTo(cx, top - 26, x + w, top + 40); g.lineTo(x + w, top + h); g.lineTo(x, top + h); g.closePath(); };
  g.save(); g.beginPath(); shape(); g.clip();
  bandedGradient(g, x, top - 30, w, h + 30, ['#02021a', '#06063a', '#0c0c4c', '#16165e', '#22226e', '#30307c', '#3c3c88'], 10);
  for (let s = 0; s < 22; s++) R(g, x + hash(s * 7 + i) * w, top - 10 + hash(s * 13 + i) * 160, 2, 2, s % 4 ? '#c8c8f0' : '#ffffff');
  // The Washington Monument (left window) or the Capitol dome (right), lit, far off
  if (i === 0) { R(g, cx + 14, top + 120, 10, 130, '#d4d0c8'); R(g, cx + 14, top + 120, 3, 130, '#f0ece4'); g.fillStyle = '#d4d0c8'; g.beginPath(); g.moveTo(cx + 14, top + 120); g.lineTo(cx + 19, top + 106); g.lineTo(cx + 24, top + 120); g.fill(); R(g, cx + 18, top + 112, 2, 3, '#ef4444'); }
  else { g.fillStyle = '#d8d4cc'; g.beginPath(); g.ellipse(cx - 10, top + 214, 26, 22, 0, Math.PI, 0); g.fill(); R(g, cx - 40, top + 214, 60, 30, '#c8c4bc'); R(g, cx - 12, top + 180, 4, 12, '#e8e4dc'); R(g, cx - 40, top + 214, 60, 2, '#f0ece4'); }
  // The lawn and trees, the lamps along the drive
  bandedGradient(g, x, top + 250, w, h - 250, ['#0c240c', '#123012', '#183c16'], 4);
  for (let t = 0; t < 4; t++) pixelBlob(g, x + 14 + t * 32, top + 254 - (t % 2) * 8, 18, 16, '#0a1c0a');
  for (let l = 0; l < 4; l++) { R(g, x + 10 + l * 34, top + 286, 2, 10, '#3c3c3c'); steppedGlow(g, x + 11 + l * 34, top + 285, 7, '#fde68a', 0.5, 0, 3); }
  g.restore();
  // The frame and the mullions
  g.beginPath(); shape(); g.strokeStyle = '#e8e4dc'; g.lineWidth = 5; g.stroke(); g.strokeStyle = INK; g.lineWidth = 1; g.stroke();
  R(g, cx - 2, top - 8, 4, h + 8, '#e8e4dc'); for (const yy of [top + 90, top + 190]) R(g, x, yy, w, 3, '#e8e4dc');
  R(g, x - 8, top + h, w + 16, 8, '#e8e4dc'); R(g, x - 8, top + h + 6, w + 16, 2, '#9c9890');
  // The drapes: gold, heavy, folds lit from the left, tied back with a tassel
  for (const side of [-1, 1]) {
    const dx = side < 0 ? x - 34 : x + w - 6;
    for (let k = 0; k < 5; k++) {
      const fx = dx + k * 8;
      shaded(g, () => { g.moveTo(fx, top - 40); g.lineTo(fx + 9, top - 40); g.quadraticCurveTo(fx + 8 + side * 4, top + 160, fx + 9 - side * 6, top + 210); g.lineTo(fx + 11, h + top + 20); g.lineTo(fx - 2, h + top + 20); g.quadraticCurveTo(fx - side * 8, top + 200, fx, top - 40); g.closePath(); }, k % 2 ? '#a07418' : '#c8961e', fx - 4, top - 40, 16, h + 60, 0.6);
    }
    ink(g, () => g.ellipse(side < 0 ? x - 6 : x + w + 6, top + 205, 10, 5, 0, 0, Math.PI * 2), '#e8b400', 0.8);
    R(g, (side < 0 ? x - 7 : x + w + 5), top + 210, 3, 18, '#c08c00');
  }
  // The pelmet over it all
  shaded(g, () => g.roundRect(x - 40, top - 52, w + 80, 22, 4), '#8c6000', x - 40, top - 52, w + 80, 22);
  for (let k = 0; k < 9; k++) R(g, x - 36 + k * ((w + 72) / 8), top - 30, 4, 6, '#e8b400');
};

/** The blue curtain behind the podium: folds lit from the upper left, the stage lights pooling down the middle. */
const paintCurtain = (g: Ctx) => {
  const top = ROOM_TOP + 26, h = DAIS_TOP - top, ramp = RAMP.curtain;
  for (let x = CUR_L; x < CUR_R; x += 2) {
    const u = (x - CUR_L) / (CUR_R - CUR_L), fold = 0.5 + 0.5 * Math.sin(((x - CUR_L) / 30) * Math.PI * 2 - 0.6);
    const pool = Math.exp(-((u - 0.5) ** 2) / 0.09);
    for (let b = 0; b < 8; b++) {
      const v = b / 8, l = (0.18 + fold * 0.55) * (0.55 + 0.45 * pool) * (1.05 - v * 0.35);
      const i = Math.max(0, Math.min(ramp.length - 1, Math.round(l * (ramp.length - 1) + ((x / 2 + b) % 2 ? 0.25 : -0.25))));
      R(g, x, top + (h * b) / 8, 2, Math.ceil(h / 8) + 1, ramp[i]);
    }
  }
  for (let x = CUR_L + 8; x < CUR_R; x += 30) R(g, x, top, 2, h, 'rgba(160, 200, 255, 0.16)');
  // (the rod it hangs from, gold)
  R(g, CUR_L - 10, top - 6, CUR_R - CUR_L + 20, 6, '#c08c00'); R(g, CUR_L - 10, top - 6, CUR_R - CUR_L + 20, 2, '#f8d440');
  for (const ex of [CUR_L - 14, CUR_R + 6]) ink(g, () => g.ellipse(ex + 4, top - 3, 6, 6, 0, 0, Math.PI * 2), '#e8b400', 0.8);
};

/** The oval WHITE HOUSE sign: a gold ring, navy inside, the building in white, the words round it. */
const paintSign = (g: Ctx, cx: number, cy: number) => {
  for (const [rx, ry, c] of [[124, 64, '#5c3c00'], [120, 60, '#e8b400'], [114, 55, '#8c6000'], [110, 52, '#141444'], [106, 49, '#1e1e5c']] as const) { g.fillStyle = c; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.fill(); }
  // (the building: the portico and its columns, the wings)
  R(g, cx - 46, cy - 2, 92, 22, '#f0f0f8'); R(g, cx - 46, cy + 18, 92, 3, '#a8a8bc');
  R(g, cx - 20, cy - 12, 40, 10, '#ffffff'); g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(cx - 24, cy - 12); g.lineTo(cx, cy - 26); g.lineTo(cx + 24, cy - 12); g.fill();
  for (let i = 0; i < 6; i++) R(g, cx - 18 + i * 7, cy - 10, 3, 30, i % 2 ? '#dcdce8' : '#ffffff');
  for (const wx of [-40, -32, 26, 34]) R(g, cx + wx, cy + 3, 5, 7, '#fce0a8');
  g.font = 'bold 10px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = '#e8b400';
  g.fillText('THE WHITE HOUSE', cx, cy - 31);
  g.font = 'bold 7px "Press Start 2P"'; g.fillText('WASHINGTON', cx, cy + 36);
};

/** A US flag on a gold pole, hanging in folds. */
const paintFlag = (g: Ctx, x: number) => {
  const top = ROOM_TOP + 70;
  R(g, x, top - 10, 4, DAIS_TOP - top + 10, '#c08c00'); R(g, x, top - 10, 1, DAIS_TOP - top + 10, '#f8d440');
  // (the eagle finial)
  g.fillStyle = '#e8b400'; g.beginPath(); g.moveTo(x - 10, top - 14); g.lineTo(x + 2, top - 24); g.lineTo(x + 14, top - 14); g.lineTo(x + 2, top - 18); g.fill();
  const fw = 64, fh = 150;
  for (let r = 0; r < 13; r++) for (let c = 0; c < fw; c += 2) {
    const fold = Math.sin(c * 0.22) * 0.5 + 0.5, red = r % 2 === 0;
    R(g, x + 4 + c, top + r * (fh / 13) + Math.sin(c * 0.22) * 2, 2, fh / 13 + 1, red ? (fold > 0.5 ? '#c81e1e' : '#8c1010') : (fold > 0.5 ? '#f4f4f8' : '#b8b8c4'));
  }
  R(g, x + 4, top, 28, 80, '#141444');
  for (let i = 0; i < 20; i++) R(g, x + 7 + (i % 4) * 6 + (Math.floor(i / 4) % 2) * 3, top + 5 + Math.floor(i / 4) * 15, 2, 2, '#ffffff');
};

/** The podium, the seal on its front, the two mics. */
const paintPodium = (g: Ctx) => {
  const { x, y, w } = PODIUM, h = DAIS_TOP - y;
  R(g, x - 6, y, w + 12, 8, '#c06c24'); R(g, x - 6, y, w + 12, 2, '#dc9044');
  shaded(g, () => g.rect(x, y + 8, w, h - 8), '#72340c', x, y + 8, w, h - 8);
  for (let k = 0; k < 6; k++) R(g, x + 4, y + 20 + k * 14, w - 8, 1, 'rgba(40, 16, 4, 0.4)');
  // The seal
  const sx = x + w / 2, sy = y + 46;
  for (const [r, c] of [[22, '#5c3c00'], [20, '#e8b400'], [16, '#141444'], [14, '#1e1e5c']] as const) { g.fillStyle = c; g.beginPath(); g.arc(sx, sy, r, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#e8b400'; g.beginPath(); g.moveTo(sx - 11, sy - 2); g.lineTo(sx, sy - 9); g.lineTo(sx + 11, sy - 2); g.lineTo(sx + 5, sy + 6); g.lineTo(sx - 5, sy + 6); g.closePath(); g.fill();
  R(g, sx - 2, sy - 6, 4, 12, '#fcf0a0'); for (let s = 0; s < 8; s++) R(g, sx + Math.cos(s * 0.785) * 18 - 1, sy + Math.sin(s * 0.785) * 18 - 1, 2, 2, '#fcf0a0');
  for (const side of [-1, 1]) { g.strokeStyle = '#26262c'; g.lineWidth = 2; g.beginPath(); g.moveTo(sx + side * 10, y); g.quadraticCurveTo(sx + side * 12, y - 18, sx + side * 4, y - 26); g.stroke(); R(g, sx + side * 4 - 3, y - 30, 6, 6, '#18181c'); }
};

/** The press seats in rows either side of the dais, their backs to us (background: dimmed). */
const paintSeats = (g: Ctx) => {
  for (const [x0, x1] of [[ROOM_L + 30, CUR_L - 20], [CUR_R + 20, ROOM_R - 30]]) {
    for (let x = x0; x < x1 - 34; x += 38) {
      ink(g, () => g.roundRect(x, 506, 32, 30, [5, 5, 1, 1]), '#1e2a5c', 0.8);
      R(g, x + 3, 509, 8, 22, '#2c3c7c'); R(g, x + 3, 534, 26, 2, '#0e1430');
      R(g, x + 5, 536, 3, 14, '#3a3f48'); R(g, x + 24, 536, 3, 14, '#3a3f48');
    }
  }
};

/** A TV camera on its tripod (up on a riser), its tally light (lit live). */
const paintCamera = (g: Ctx, x: number, y: number, f: number) => {
  for (const lx of [-16, 0, 16]) { g.strokeStyle = '#26262c'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y - 48); g.lineTo(x + lx, y); g.stroke(); }
  g.save(); g.translate(x, y - 56); g.scale(f, 1);
  ink(g, () => g.roundRect(-22, -14, 40, 24, 3), '#2e3138', 1);
  R(g, -20, -12, 14, 20, '#3a3f48');
  ink(g, () => g.roundRect(18, -10, 16, 16, 2), '#18181c', 1);
  g.fillStyle = '#3c5c8c'; g.beginPath(); g.arc(34, -2, 6, 0, Math.PI * 2); g.fill(); R(g, 32, -6, 3, 2, '#c8dcf8');
  R(g, -18, -22, 18, 8, '#18181c'); R(g, -14, -20, 4, 3, '#52525b');
  g.restore();
  g.font = 'bold 6px "Press Start 2P"'; g.fillStyle = '#e5e7eb'; g.textAlign = 'center'; g.fillText('NEWS', x - 2 * f, y - 50);
};

/** The room, plain (nothing wrecked yet). World coordinates. */
const paintRoom = (g: Ctx) => {
  paintCeiling(g);
  // The back wall: a deep blue above, walnut panelling below, a gold chair rail
  bandedGradient(g, ROOM_L, ROOM_TOP, ROOM_R - ROOM_L, WAINSCOT - ROOM_TOP, ['#1a2550', '#1e2a5a', '#223064', '#26346c', '#223064'], 8);
  for (let x = ROOM_L; x < ROOM_R; x += 16) for (let y = ROOM_TOP + 20; y < WAINSCOT - 10; y += 22) R(g, x + ((y / 22) % 2) * 8, y, 2, 2, 'rgba(160, 180, 240, 0.12)');
  R(g, ROOM_L, WAINSCOT - 6, ROOM_R - ROOM_L, 6, '#8c6000'); R(g, ROOM_L, WAINSCOT - 6, ROOM_R - ROOM_L, 2, '#e8b400');
  bandedGradient(g, ROOM_L, WAINSCOT, ROOM_R - ROOM_L, FLOOR - WAINSCOT, ['#4c2008', '#3e1a06', '#321404', '#260e02'], 5);
  for (let x = ROOM_L + 10; x < ROOM_R - 70; x += 86) {
    R(g, x, WAINSCOT + 18, 70, 140, '#2c1204'); R(g, x + 4, WAINSCOT + 22, 62, 132, '#5a2a0c');
    R(g, x + 4, WAINSCOT + 22, 62, 3, '#7a3c14'); R(g, x + 4, WAINSCOT + 22, 3, 132, '#72340c');
  }
  for (const [i, cx] of BACK_WINDOWS.entries()) paintBackWindow(g, cx, i);
  paintCurtain(g);
  paintSign(g, ROOM_MID, ROOM_TOP + 130);
  paintFlag(g, CUR_L + 14); paintFlag(g, CUR_R - 70);
  // The dais (dark: it's behind, not a step), the podium on it
  bandedGradient(g, CUR_L - 20, DAIS_TOP, CUR_R - CUR_L + 40, FLOOR - DAIS_TOP, ['#3c0804', '#4a0c06', '#3c0804', '#2c0402'], 4);
  paintPodium(g);
  paintSeats(g);
  // (the background dimmed, so none of it reads as somewhere to stand)
  R(g, ROOM_L, WAINSCOT, ROOM_R - ROOM_L, FLOOR - WAINSCOT, 'rgba(6, 6, 18, 0.3)');
  // The carpet: navy, a gold star pattern in rows, the floor's edge lit (it's what you stand on)
  bandedGradient(g, VIEW_X, FLOOR, VIEW_W, VIEW_Y + VIEW_H - FLOOR, ['#24306c', '#1e2a5c', '#18224c', '#121a3c'], 4);
  for (let r = 0; r < 3; r++) for (let x = VIEW_X + (r % 2) * 30; x < VIEW_X + VIEW_W; x += 60) {
    const y = FLOOR + 12 + r * 16;
    g.fillStyle = r === 0 ? '#8c6000' : '#c08c00'; g.beginPath(); g.moveTo(x, y - 4); g.lineTo(x + 3, y); g.lineTo(x, y + 4); g.lineTo(x - 3, y); g.closePath(); g.fill();
  }
  R(g, VIEW_X, FLOOR, VIEW_W, 3, '#5868b4'); R(g, VIEW_X, FLOOR, VIEW_W, 1, '#8c9ce0');
  // The risers: a lit lip along the deck, PRESS POOL down the front, legs to the floor, a TV camera on each
  for (const [i, r] of RISERS.entries()) {
    paintCamera(g, r.x + (i === 0 ? 40 : r.w - 40), r.y, i === 0 ? 1 : -1);
    for (const lx of [r.x + 10, r.x + r.w / 2 - 3, r.x + r.w - 16]) { R(g, lx, r.y + RISER_H, 6, FLOOR - r.y - RISER_H, '#26262c'); R(g, lx, r.y + RISER_H, 2, FLOOR - r.y - RISER_H, '#3a3f48'); }
    g.strokeStyle = '#2e3138'; g.lineWidth = 2; g.beginPath(); g.moveTo(r.x + 13, r.y + RISER_H); g.lineTo(r.x + r.w / 2, FLOOR - 10); g.lineTo(r.x + r.w - 13, r.y + RISER_H); g.stroke();
    R(g, r.x, FLOOR - 4, r.w, 4, 'rgba(0, 0, 0, 0.35)');
    shaded(g, () => g.rect(r.x, r.y, r.w, RISER_H), '#2e3138', r.x, r.y, r.w, RISER_H);
    R(g, r.x, r.y, r.w, 3, '#c8ccd4'); R(g, r.x, r.y, r.w, 1, '#ffffff');
    g.font = 'bold 8px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = '#fde047'; g.fillText('PRESS POOL', r.x + r.w / 2, r.y + 14);
  }
};

// ---------------------------------------------------------------------------
// The wrecks (the still part of each)
// ---------------------------------------------------------------------------

/**
 * A splat of something thrown at a wall: a ragged star of it (spikes where it hit hardest, droplets flung out past
 * them), its runs dribbling down, a lit edge on the wet.
 */
const splat = (g: Ctx, x: number, y: number, s: number, c: string, hi: string, seed: number, runs = true, spurts = true) => {
  pixelBlob(g, x, y, s * 0.8, s * 0.62, c);
  if (!spurts) { for (let k = 0; k < 4; k++) pixelBlob(g, x + (hash(seed + k) - 0.5) * s * 1.6, y + (hash(seed + k + 5) - 0.5) * s, s * 0.45, s * 0.35, c); }
  else {
  g.fillStyle = c; g.beginPath();
  const n = 28;
  for (let k = 0; k <= n; k++) {
    const a = (k / n) * Math.PI * 2, spike = hash(seed + k * 1.7);
    // (mostly a lumpy round of it, a few short spurts out where it hit hardest)
    const r = s * (spike > 0.86 ? 1.05 + spike * 0.35 : 0.62 + spike * 0.2);
    const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * 0.8;
    if (k === 0) g.moveTo(px, py); else g.lineTo(px, py);
  }
  g.closePath(); g.fill();
  }
  g.fillStyle = c;
  for (let k = 0; k < 7; k++) {
    const a = hash(seed + k * 3.1) * Math.PI * 2, d = s * (1.5 + hash(seed + k * 2.3) * 1.4), r = 1 + hash(seed + k) * s * 0.12;
    g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.8, r, 0, Math.PI * 2); g.fill();
  }
  if (runs) for (let k = 0; k < 3; k++) {
    const rx = x + (hash(seed + k * 3) - 0.5) * s * 1.1, len = s * (0.8 + hash(seed + k * 5) * 2.2), w = 2 + hash(seed + k * 7) * 3;
    R(g, rx, y, w, len, c); g.beginPath(); g.ellipse(rx + w / 2, y + len, w * 0.9, w * 1.1, 0, 0, Math.PI * 2); g.fill();
  }
  R(g, x - s * 0.5, y - s * 0.35, s * 0.45, 2, hi); R(g, x - s * 0.55, y - s * 0.2, 2, s * 0.25, hi);
}

/** A ragged-edged hole (or patch) as a path: `r` across, the edge bitten in and out. */
const ragged = (g: Ctx, x: number, y: number, rx: number, ry: number, seed: number, n = 18) => {
  g.beginPath();
  for (let k = 0; k <= n; k++) {
    const a = (k / n) * Math.PI * 2, j = 0.72 + hash(seed + k * 2.9) * 0.4;
    const px = x + Math.cos(a) * rx * j, py = y + Math.sin(a) * ry * j;
    if (k === 0) g.moveTo(px, py); else g.lineTo(px, py);
  }
  g.closePath();
};

const wreckIce = (g: Ctx) => {
  // Frost over the walls (blue-white, thickest up top), the windows frosted over
  g.save(); g.globalAlpha = 0.22; bandedGradient(g, ROOM_L, ROOM_TOP, ROOM_R - ROOM_L, FLOOR - ROOM_TOP, ['#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8'], 6); g.restore();
  for (let i = 0; i < 160; i++) R(g, ROOM_L + hash(i * 3.1) * (ROOM_R - ROOM_L), ROOM_TOP + hash(i * 7.7) * (FLOOR - ROOM_TOP) * 0.7, 2, 2, i % 3 ? 'rgba(255, 255, 255, 0.55)' : '#ffffff');
  for (const cx of BACK_WINDOWS) { g.save(); g.globalAlpha = 0.35; R(g, cx - BW_W / 2, BW_TOP, BW_W, BW_BOT - BW_TOP, '#e0f2fe'); g.restore(); }
  // Icicles off the molding and the truss, every length
  for (let x = VIEW_X + 4; x < VIEW_X + VIEW_W; x += 9) {
    const len = 6 + hash(x * 0.37) * 26 + (hash(x) < 0.15 ? 30 : 0);
    g.fillStyle = '#bae6fd'; g.beginPath(); g.moveTo(x, ROOM_TOP); g.lineTo(x + 6, ROOM_TOP); g.lineTo(x + 3, ROOM_TOP + len); g.closePath(); g.fill();
    R(g, x + 1, ROOM_TOP, 1, len * 0.7, '#ffffff');
  }
  for (let x = ROOM_L + 6; x < ROOM_R; x += 13) { const len = 4 + hash(x * 0.91) * 16; g.fillStyle = '#e0f2fe'; g.beginPath(); g.moveTo(x, ROOM_TOP + 25); g.lineTo(x + 4, ROOM_TOP + 25); g.lineTo(x + 2, ROOM_TOP + 25 + len); g.closePath(); g.fill(); }
  // The carpet a rink: pale blue ice, streaks of light on it, snow piled in the corners
  g.save(); g.globalAlpha = 0.6; bandedGradient(g, VIEW_X, FLOOR, VIEW_W, 60, ['#e0f2fe', '#bae6fd', '#93c5fd'], 3); g.restore();
  for (let i = 0; i < 20; i++) R(g, VIEW_X + hash(i * 5.3) * VIEW_W, FLOOR + 6 + hash(i * 2.1) * 40, 18 + hash(i) * 30, 2, 'rgba(255, 255, 255, 0.7)');
  for (const x of [ROOM_L + 30, ROOM_R - 30]) { pixelBlob(g, x, FLOOR - 4, 46, 16, '#f0f9ff'); pixelBlob(g, x + 10, FLOOR - 10, 24, 10, '#ffffff'); }
  R(g, VIEW_X, FLOOR, VIEW_W, 2, '#ffffff');
};

const wreckFire = (g: Ctx) => {
  // Burnt up the curtain from the bottom: charred tongues of black climbing it, brown at their edges, embers along
  // them; holes burnt right through (the wall behind, their rims still glowing)
  for (let i = 0; i < 9; i++) {
    const x0 = CUR_L + 10 + i * ((CUR_R - CUR_L - 20) / 9), w = 34 + hash(i * 2.1) * 30, top = DAIS_TOP - 120 - hash(i * 3.7) * 260;
    const tongue = (grow: number) => {
      g.beginPath(); g.moveTo(x0 - grow, DAIS_TOP);
      for (let k = 0; k <= 8; k++) { const u = k / 8; g.lineTo(x0 - grow + u * (w + grow * 2), top - grow + (k % 2 ? 26 : 0) * (0.6 + hash(i * 9 + k) * 0.8) + Math.abs(u - 0.5) * 80); }
      g.lineTo(x0 + w + grow, DAIS_TOP); g.closePath();
    };
    tongue(5); g.fillStyle = '#4a2410'; g.fill();
    tongue(0); g.fillStyle = 'rgba(14, 8, 6, 0.92)'; g.fill();
    for (let e = 0; e < 5; e++) R(g, x0 + hash(i * 4 + e) * w, top + 20 + hash(i * 7 + e) * 60, 2, 2, e % 2 ? '#f97316' : '#fde047');
  }
  for (const [i, [x, y]] of ([[CUR_L + 110, ROOM_TOP + 120], [CUR_R - 140, ROOM_TOP + 210], [ROOM_MID + 30, ROOM_TOP + 300]] as const).entries()) {
    ragged(g, x, y, 22, 26, i * 13); g.fillStyle = '#0e1430'; g.fill();
    g.strokeStyle = '#f97316'; g.lineWidth = 2; g.stroke(); g.strokeStyle = 'rgba(253, 224, 71, 0.6)'; g.lineWidth = 1; g.stroke();
  }
  // The drapes burnt black from the hem up, the flags burnt to rags
  for (const cx of BACK_WINDOWS) for (const sd of [-1, 1]) {
    const x = sd < 0 ? cx - BW_W / 2 - 34 : cx + BW_W / 2 - 6;
    for (let b = 0; b < 6; b++) { g.fillStyle = `rgba(12, 6, 2, ${(0.9 - b * 0.13).toFixed(2)})`; g.fillRect(x - 4, BW_BOT + 20 - (b + 1) * 40, 48, 40); }
  }
  for (const x of [CUR_L + 18, CUR_R - 66]) { ragged(g, x + 32, ROOM_TOP + 170, 34, 50, x); g.fillStyle = 'rgba(10, 6, 4, 0.9)'; g.fill(); }
  // Soot rolling along the ceiling and down the walls
  for (let b = 0; b < 8; b++) { g.fillStyle = `rgba(14, 9, 6, ${(0.62 - b * 0.075).toFixed(3)})`; g.fillRect(VIEW_X, VIEW_Y + b * ((ROOM_TOP + 150 - VIEW_Y) / 8), VIEW_W, (ROOM_TOP + 150 - VIEW_Y) / 8 + 1); }
  // Ash on the carpet
  for (let i = 0; i < 50; i++) R(g, VIEW_X + hash(i * 1.7) * VIEW_W, FLOOR + 4 + hash(i * 3.9) * 40, 4, 2, i % 2 ? '#3f3f46' : '#52525b');
};

const wreckRubble = (g: Ctx) => {
  // Holes knocked through the back wall to the night: a jagged edge, the brick inside the plaster showing round it,
  // cracks running off; chunks of it on the carpet
  for (const [i, [x, y, s]] of ([[ROOM_L + 330, 60, 46], [ROOM_MID + 330, -20, 38], [ROOM_R - 330, 210, 52], [ROOM_MID - 150, 380, 30]] as const).entries()) {
    ragged(g, x, y, s + 12, s * 0.85 + 10, i * 31, 22); g.fillStyle = '#6e3a26'; g.fill();
    for (let b = 0; b < 26; b++) { const a = hash(i * 40 + b) * Math.PI * 2, d = s * (0.85 + hash(b + i) * 0.3); R(g, x + Math.cos(a) * d - 5, y + Math.sin(a) * d * 0.85 - 2, 10, 5, b % 3 ? '#8a4a32' : '#5a2e1e'); R(g, x + Math.cos(a) * d - 5, y + Math.sin(a) * d * 0.85 - 2, 10, 1, '#b06a4a'); }
    ragged(g, x, y, s, s * 0.82, i * 17, 20); g.fillStyle = '#05051a'; g.fill();
    g.save(); ragged(g, x, y, s, s * 0.82, i * 17, 20); g.clip();
    bandedGradient(g, x - s, y - s, s * 2, s * 2, ['#02021a', '#08083c', '#12125c'], 4);
    for (let st = 0; st < 8; st++) R(g, x - s * 0.7 + hash(st + i * 9) * s * 1.4, y - s * 0.6 + hash(st * 3 + i) * s * 1.1, 2, 2, '#c8c8f0');
    g.restore();
    g.strokeStyle = '#0a0a14'; g.lineWidth = 2;
    for (let c = 0; c < 5; c++) { let cx = x, cy = y; const a = c * 1.3 + i; g.beginPath(); cx += Math.cos(a) * s; cy += Math.sin(a) * s * 0.8; g.moveTo(cx, cy); for (let k = 0; k < 5; k++) { cx += Math.cos(a + (hash(k + c * 7 + i) - 0.5) * 1.2) * 16; cy += Math.sin(a + (hash(k * 2 + c) - 0.5) * 1.2) * 16; g.lineTo(cx, cy); } g.stroke(); }
  }
  // The sign knocked crooked, one corner of its ring smashed; a boulder stuck in the wall; the podium split down the middle
  ragged(g, ROOM_MID + 90, ROOM_TOP + 110, 30, 22, 5); g.fillStyle = '#1a2550'; g.fill();
  for (let k = 0; k < 6; k++) R(g, ROOM_MID + 70 + k * 7, ROOM_TOP + 110 + (k % 2) * 6, 5, 3, '#e8b400');
  pixelBlob(g, ROOM_L + 520, 240, 28, 24, '#57534e'); pixelBlob(g, ROOM_L + 514, 234, 18, 14, '#78716c'); R(g, ROOM_L + 506, 228, 8, 3, '#a8a29e');
  g.strokeStyle = '#0a0a14'; g.lineWidth = 2; for (let c = 0; c < 6; c++) { g.beginPath(); g.moveTo(ROOM_L + 520, 240); g.lineTo(ROOM_L + 520 + Math.cos(c) * 50, 240 + Math.sin(c) * 40); g.stroke(); }
  R(g, PODIUM.x + PODIUM.w / 2 - 3, PODIUM.y, 6, DAIS_TOP - PODIUM.y, '#140802');
  g.beginPath(); g.moveTo(PODIUM.x + 30, PODIUM.y); g.lineTo(PODIUM.x + 44, PODIUM.y + 40); g.lineTo(PODIUM.x + 34, DAIS_TOP); g.strokeStyle = '#140802'; g.stroke();
  // Rubble heaped along the foot of the wall, chunks of plaster and brick
  for (let i = 0; i < 34; i++) {
    const x = ROOM_L + 20 + hash(i * 4.3) * (ROOM_R - ROOM_L - 40), s = 5 + hash(i * 1.9) * 14;
    ragged(g, x, FLOOR - s * 0.5, s, s * 0.6, i * 7, 8); g.fillStyle = i % 4 === 0 ? '#8a4a32' : i % 3 ? '#78716c' : '#57534e'; g.fill();
    R(g, x - s * 0.5, FLOOR - s * 0.95, s * 0.6, 2, '#a8a29e');
  }
  // (plaster dust over it all)
  g.save(); g.globalAlpha = 0.1; R(g, ROOM_L, ROOM_TOP, ROOM_R - ROOM_L, FLOOR - ROOM_TOP, '#a8a29e'); g.restore();
};

const wreckFlood = (g: Ctx) => {
  // Everything soaked: the tide line up the walls, the curtain darkened below it, the wainscot swollen
  const tide = FLOOR - 70;
  g.save(); g.globalAlpha = 0.3; R(g, ROOM_L, tide, ROOM_R - ROOM_L, FLOOR - tide, '#0c2a4a'); g.restore();
  R(g, ROOM_L, tide - 2, ROOM_R - ROOM_L, 2, 'rgba(160, 120, 80, 0.6)');
  g.save(); g.globalAlpha = 0.35; R(g, CUR_L, ROOM_TOP + 160, CUR_R - CUR_L, DAIS_TOP - ROOM_TOP - 160, '#000018'); g.restore();
  for (let i = 0; i < 26; i++) { const x = CUR_L + hash(i * 2.7) * (CUR_R - CUR_L); R(g, x, ROOM_TOP + 160 + hash(i) * 120, 2, 40 + hash(i * 3) * 120, 'rgba(0, 0, 30, 0.35)'); }
  // Water down the walls from the ceiling, papers stuck to them
  for (let i = 0; i < 10; i++) { const x = ROOM_L + hash(i * 6.1) * (ROOM_R - ROOM_L); R(g, x, ROOM_TOP, 3, 120 + hash(i) * 200, 'rgba(125, 211, 252, 0.25)'); }
  for (let i = 0; i < 8; i++) { g.save(); g.translate(ROOM_L + hash(i * 3.3) * (ROOM_R - ROOM_L), WAINSCOT + 40 + hash(i * 1.3) * 100); g.rotate((hash(i) - 0.5) * 0.8); R(g, -8, -10, 16, 20, '#e5e7eb'); for (let l = 0; l < 4; l++) R(g, -6, -7 + l * 4, 12, 1, '#9ca3af'); g.restore(); }
};

const wreckSludge = (g: Ctx) => {
  for (let i = 0; i < 26; i++) {
    const x = ROOM_L + hash(i * 3.7) * (ROOM_R - ROOM_L), y = ROOM_TOP + 10 + hash(i * 1.9) * (FLOOR - ROOM_TOP - 80);
    splat(g, x, y, 10 + hash(i * 5) * 22, i % 3 ? '#4d7c0f' : '#65a30d', '#bef264', i * 11);
  }
  // Hanging off the ceiling in sheets
  for (let x = ROOM_L; x < ROOM_R; x += 40) { const len = 10 + hash(x * 0.13) * 40; R(g, x, ROOM_TOP, 22, len * 0.4, '#4d7c0f'); for (let d = 0; d < 3; d++) R(g, x + d * 8, ROOM_TOP, 3, len * (0.5 + hash(x + d) * 0.6), '#65a30d'); }
  // The seal slimed over; pools of it in the corners
  splat(g, ROOM_MID, ROOM_TOP + 130, 40, '#4d7c0f', '#bef264', 77, true);
  for (const x of [ROOM_L + 40, ROOM_R - 40, ROOM_MID - 200]) { pixelBlob(g, x, FLOOR - 3, 54, 7, '#3f6212'); pixelBlob(g, x - 6, FLOOR - 5, 34, 4, '#65a30d'); R(g, x - 20, FLOOR - 7, 10, 2, '#bef264'); }
};

const wreckBlown = (g: Ctx) => {
  // Every light dead: the cans dark and smashed, the coffers' downlights out, glass on the carpet
  for (const [x, a] of TRUSS_LIGHTS) paintCan(g, x, ROOM_TOP + 26, a, true);
  for (let x = VIEW_X + 20; x < VIEW_X + VIEW_W - 60; x += 116) for (const y of [-272, -214]) { R(g, x + 30, y + 10, 40, 28, '#13131d'); R(g, x + 44, y + 21, 12, 6, '#27272a'); }
  for (let i = 0; i < 40; i++) R(g, VIEW_X + hash(i * 2.9) * VIEW_W, FLOOR + 2 + hash(i * 4.4) * 30, 3, 2, i % 2 ? '#e5e7eb' : '#a1a1aa');
  // Wires hanging out of the ceiling, the ends bare
  g.strokeStyle = '#18181b'; g.lineWidth = 2;
  for (const x of [ROOM_L + 180, ROOM_MID - 140, ROOM_MID + 210, ROOM_R - 160]) {
    g.beginPath(); g.moveTo(x, ROOM_TOP); g.quadraticCurveTo(x + 30, ROOM_TOP + 60, x + 4, -60 + (x % 40)); g.stroke();
    R(g, x + 2, -62 + (x % 40), 4, 4, '#ca8a04');
  }
  // Scorch round the sockets
  for (const [x] of TRUSS_LIGHTS) pixelBlob(g, x, ROOM_TOP + 30, 18, 12, 'rgba(0, 0, 0, 0.5)');
};

const wreckOil = (g: Ctx) => {
  // Crude over everything: running down from the ceiling in sheets, splattered up the walls, the seal blacked out;
  // glossy, a rainbow sheen on it where the light catches
  for (let x = ROOM_L; x < ROOM_R; x += 6) {
    const len = 14 + hash(x * 0.21) * 50 + (hash(x * 0.7) < 0.12 ? 120 : 0);
    R(g, x, ROOM_TOP, 6, len, 'rgba(10, 8, 7, 0.88)');
    g.fillStyle = 'rgba(10, 8, 7, 0.88)'; g.beginPath(); g.ellipse(x + 3, ROOM_TOP + len, 3, 4, 0, 0, Math.PI * 2); g.fill();
    if (hash(x) < 0.2) R(g, x + 1, ROOM_TOP + 4, 1, len * 0.6, '#57534e');
  }
  for (let i = 0; i < 34; i++) {
    const x = ROOM_L + hash(i * 4.1) * (ROOM_R - ROOM_L), y = ROOM_TOP + 30 + hash(i * 2.3) * (FLOOR - ROOM_TOP - 90);
    const s = 10 + hash(i * 3) * 22;
    splat(g, x, y, s, '#0c0a09', '#57534e', i * 7, true, false);
    // (the sheen on it: a thin slick of rainbow along its top)
    for (const [k, col] of ['#7c3aed', '#0ea5e9', '#22c55e', '#eab308'].entries()) R(g, x - s * 0.5 + k * s * 0.18, y - s * 0.42 + Math.abs(k - 1.5), s * 0.18, 1, col);
  }
  splat(g, ROOM_MID, ROOM_TOP + 130, 40, '#0c0a09', '#57534e', 99, true, false);
  // The carpet black and gleaming either side (the slicks themselves are the floor's: see bosses/oscar's oil)
  g.save(); g.globalAlpha = 0.55; R(g, VIEW_X, FLOOR + 2, VIEW_W, 58, '#0c0a09'); g.restore();
  for (let i = 0; i < 16; i++) R(g, VIEW_X + hash(i * 7.3) * VIEW_W, FLOOR + 8 + hash(i * 2.9) * 40, 30, 2, i % 3 ? 'rgba(124, 58, 237, 0.5)' : 'rgba(14, 165, 233, 0.5)');
};

const wreckNeedles = (g: Ctx) => {
  const syringe = (x: number, y: number, a: number) => {
    g.save(); g.translate(x, y); g.rotate(a);
    R(g, 0, -1, 7, 2, '#d4d4d8');
    ink(g, () => g.rect(7, -3, 16, 6), 'rgba(232, 240, 248, 0.95)', 0.7);
    R(g, 9, -2, 9, 4, '#e879f9'); R(g, 23, -1, 5, 2, '#a1a1aa'); R(g, 27, -4, 2, 8, '#71717a');
    R(g, 8, -3, 14, 1, '#ffffff');
    g.restore();
  };
  for (let i = 0; i < 70; i++) syringe(ROOM_L + 10 + hash(i * 3.9) * (ROOM_R - ROOM_L - 20), ROOM_TOP + 8 + hash(i * 6.1) * (FLOOR - ROOM_TOP - 30), Math.PI + (hash(i * 1.3) - 0.5) * 1.2);
  // In the ceiling (stuck up), in the podium, in the carpet
  for (let i = 0; i < 18; i++) syringe(VIEW_X + hash(i * 2.2) * VIEW_W, ROOM_TOP + 2, -Math.PI / 2 + (hash(i) - 0.5) * 0.6);
  for (let i = 0; i < 6; i++) syringe(PODIUM.x + 10 + i * 10, PODIUM.y + 30 + (i % 3) * 18, Math.PI + 0.3);
  for (let i = 0; i < 20; i++) syringe(VIEW_X + hash(i * 5.7) * VIEW_W, FLOOR + 8, Math.PI / 2 + (hash(i * 2) - 0.5) * 0.7);
};

const WRECKS: Record<string, (g: Ctx) => void> = {
  SHOTGUN: wreckIce, FLAMETHROWER: wreckFire, BOULDER: wreckRubble, TSUNAMI: wreckFlood, SLUDGE: wreckSludge, TASER: wreckBlown, OIL_ROCKET: wreckOil, NEEDLES: wreckNeedles,
};

// ---------------------------------------------------------------------------
// Painted once (for each set of wrecks), put down every frame
// ---------------------------------------------------------------------------

let painted: { key: string; c: HTMLCanvasElement } | null = null;
const wreckKey = (rt: FinaleRuntime | null) => WRECK_ORDER.filter(w => rt?.wrecked[w] !== undefined).join(',');

const roomCanvas = (rt: FinaleRuntime | null) => {
  if (typeof document === 'undefined') return null;
  const key = wreckKey(rt);
  if (painted?.key === key) return painted.c;
  const k = VIEW_SCALE * RENDER_SCALE;
  const c = painted?.c ?? document.createElement('canvas');
  c.width = Math.round(VIEW_W * k); c.height = Math.round(VIEW_H * k);
  const g = c.getContext('2d')!;
  g.setTransform(k, 0, 0, k, -VIEW_X * k, -VIEW_Y * k);
  paintRoom(g);
  for (const w of WRECK_ORDER) if (rt?.wrecked[w] !== undefined) WRECKS[w](g);
  painted = { key, c };
  return c;
};

/** The kill cam's bit of the room, painted at its zoom (once: he's dead, nothing in the room changes any more). */
let close: { key: string; c: HTMLCanvasElement } | null = null;
const closeCanvas = (rt: FinaleRuntime) => {
  if (typeof document === 'undefined' || !rt.cam) return null;
  const r = rt.cam.room;
  const key = `${wreckKey(rt)}|${r.x},${r.y},${r.w},${r.h},${r.k}`;
  if (close?.key === key) return close.c;
  const c = close?.c ?? document.createElement('canvas');
  c.width = Math.round(r.w * r.k); c.height = Math.round(r.h * r.k);
  const g = c.getContext('2d')!;
  g.setTransform(r.k, 0, 0, r.k, -r.x * r.k, -r.y * r.k);
  paintRoom(g);
  for (const w of WRECK_ORDER) if (rt.wrecked[w] !== undefined) WRECKS[w](g);
  close = { key, c };
  return c;
};

/** Paints the room ahead of time (and each of the wrecks on their own), so the first frame of each isn't a hitch. */
export const warmRoom = () => { roomCanvas(null); };

// ---------------------------------------------------------------------------
// Each frame
// ---------------------------------------------------------------------------

const has = (rt: FinaleRuntime | null, w: WeaponType) => rt?.wrecked[w] !== undefined;

export const drawRoomBack = (ctx: Ctx, state: GameState) => {
  const rt = getFinale(state);
  const c = roomCanvas(rt);
  if (c) ctx.drawImage(c, VIEW_X, VIEW_Y, VIEW_W, VIEW_H);
  // (the kill cam's close-up: its bit of the room painted again, sharp at that zoom)
  const cc = rt?.cam ? closeCanvas(rt) : null;
  if (cc && rt?.cam) ctx.drawImage(cc, rt.cam.room.x, rt.cam.room.y, rt.cam.room.w, rt.cam.room.h);
  const f = state.frame;
  // The cameras' tally lights (on air)
  for (const [i, r] of RISERS.entries()) if (f % 60 < 40) { const x = r.x + (i === 0 ? 40 : r.w - 40); steppedGlow(ctx, x - 6 * (i === 0 ? 1 : -1), r.y - 78, 6, '#ef4444', 0.6, 0, 3); R(ctx, x - 6 * (i === 0 ? 1 : -1) - 1, r.y - 79, 3, 3, '#fca5a5'); }
  if (!rt) return;
  // Scorch marks where the beam's hit
  for (const s of rt.scorch) { const a = Math.max(0.25, 1 - (f - s.at) / 2400); ctx.fillStyle = `rgba(20, 8, 16, ${(0.55 * a).toFixed(3)})`; ctx.beginPath(); ctx.ellipse(s.x, s.y, 14, 10, 0, 0, Math.PI * 2); ctx.fill(); if (f - s.at < 120) { ctx.fillStyle = `rgba(255, 140, 228, ${(1 - (f - s.at) / 120).toFixed(3)})`; ctx.fillRect(s.x - 3, s.y - 3, 6, 6); } }
  // The fire up the curtains and the drapes; smoke rolling under the ceiling
  if (has(rt, 'FLAMETHROWER')) {
    const k = Math.min(1, (rt.t - rt.wrecked.FLAMETHROWER!) / 90);
    for (const [i, [x, y, w, h]] of ([[CUR_L + 30, DAIS_TOP - 10, 60, 160], [CUR_R - 40, DAIS_TOP - 10, 60, 190], [ROOM_MID - 90, ROOM_TOP + 200, 40, 90], [BACK_WINDOWS[0] - BW_W / 2 - 20, BW_BOT + 10, 40, 140], [BACK_WINDOWS[1] + BW_W / 2 + 20, BW_BOT + 10, 40, 150], [ROOM_MID + 120, ROOM_TOP + 240, 34, 80]] as const).entries()) {
      drawFire(ctx, x, y, w, h, f + i * 17, { seed: i * 31, smoke: 0.5, sparks: i % 2 === 0, glow: 0.8, k });
    }
    for (let b = 0; b < 3; b++) { const u = ((f * 0.3 + b * 140) % 420) / 420; pixelBlob(ctx, ROOM_L + u * (ROOM_R - ROOM_L), ROOM_TOP + 30 + b * 18, 140, 22, 'rgba(28, 22, 20, 0.35)'); }
  }
  // The sludge bubbling in its pools
  if (has(rt, 'SLUDGE')) for (const [i, x] of [ROOM_L + 40, ROOM_R - 40, ROOM_MID - 200].entries()) { const u = ((f + i * 23) % 50) / 50; if (u < 0.6) { ctx.strokeStyle = '#bef264'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x + Math.sin(i * 3 + f * 0.01) * 20, FLOOR - 6 - u * 6, 2 + u * 4, Math.PI, 0); ctx.stroke(); } }
  // The ice glinting
  if (has(rt, 'SHOTGUN') && f % 6 === 0) { const i = Math.floor(f / 6) % 40; R(ctx, VIEW_X + hash(i * 9.1) * VIEW_W, ROOM_TOP + 4 + hash(i * 3.3) * 30, 2, 6, '#ffffff'); R(ctx, VIEW_X + hash(i * 9.1) * VIEW_W - 2, ROOM_TOP + 6 + hash(i * 3.3) * 30, 6, 2, '#ffffff'); }
};

/** What's in the middle (over the room, under everyone): the bits of the President he's shed, lying on the carpet. */
export const drawRoomMid = (ctx: Ctx, state: GameState) => {
  const rt = getFinale(state);
  if (!rt) return;
  for (const s of rt.shed) drawShed(ctx, s.x, s.y, s.kind, s.flip);
};

/** A bit of the President's skin or suit: an empty orange flap, a rag of the navy jacket, a cuff, the hair. */
const drawShed = (ctx: Ctx, x: number, y: number, kind: number, flip: number) => {
  ctx.save(); ctx.translate(x, y); ctx.scale(flip, 1);
  const T = RAMP.tSkin, N = RAMP.navy, Hh = RAMP.tHair;
  if (kind === 0) { ink(ctx, () => { ctx.moveTo(-14, 0); ctx.quadraticCurveTo(-8, -9, 4, -6); ctx.quadraticCurveTo(14, -4, 16, 0); ctx.closePath(); }, T[3], 0.8); R(ctx, -6, -5, 10, 1, T[5]); R(ctx, -2, -3, 2, 2, T[1]); }
  else if (kind === 1) { ink(ctx, () => { ctx.moveTo(-12, 0); ctx.lineTo(-10, -8); ctx.lineTo(8, -10); ctx.lineTo(14, 0); ctx.closePath(); }, N[3], 0.8); R(ctx, -8, -7, 12, 1, N[5]); R(ctx, 2, -4, 6, 2, '#e5e7eb'); }
  else if (kind === 2) { ink(ctx, () => ctx.roundRect(-10, -5, 20, 5, 2), T[2], 0.8); for (let f = 0; f < 4; f++) R(ctx, 6 + f * 2, -3, 1, 4, T[4]); R(ctx, -12, -6, 6, 6, '#f4f4f8'); }
  else { ink(ctx, () => ctx.ellipse(0, -4, 14, 5, 0, 0, Math.PI * 2), Hh[3], 0.8); R(ctx, -10, -7, 14, 2, Hh[5]); R(ctx, 6, -5, 6, 3, Hh[2]); }
  ctx.restore();
};

/** In front of everyone: the side walls (doors, windows), the flood's water, the dark, the beam. */
export const drawRoomFront = (ctx: Ctx, state: GameState) => {
  const rt = getFinale(state);
  const f = state.frame;
  // The flood: standing water over the floor, its surface rippling, the light off it
  if (has(rt, 'TSUNAMI')) {
    const top = FLOOR - 22;
    ctx.fillStyle = 'rgba(30, 90, 160, 0.42)'; ctx.fillRect(VIEW_X, top, VIEW_W, VIEW_Y + VIEW_H - top);
    for (let x = VIEW_X; x < VIEW_X + VIEW_W; x += 8) {
      const y = top + Math.round(Math.sin(x * 0.04 + f * 0.08) * 2);
      R(ctx, x, y - 1, 8, 2, 'rgba(186, 230, 253, 0.65)');
      if ((x / 8 + Math.floor(f / 10)) % 9 === 0) R(ctx, x + 2, y + 6, 4, 1, 'rgba(255, 255, 255, 0.5)');
    }
  }
  if (rt) drawWalls(ctx, rt, f);
  // The dark (the lights blown): the room barely lit, the power flickering back now and then
  if (has(rt, 'TASER')) {
    const flick = (f % 97 < 4) || (f % 211 < 3);
    ctx.fillStyle = flick ? 'rgba(4, 4, 14, 0.14)' : 'rgba(4, 4, 14, 0.42)';
    ctx.fillRect(VIEW_X, VIEW_Y, VIEW_W, VIEW_H);
  }
  // The alien's beam, over everything (it lights the dark)
  if (rt?.beam) drawBeam(ctx, rt.beam.x, rt.beam.y, rt.beam.dx, rt.beam.dy, rt.beam.len, f, rt.beam.blocked, !!rt.beam.weak);
};

/** The side walls, seen end on: the doors at the foot of them (open while someone's coming through), the windows. */
const drawWalls = (ctx: Ctx, rt: FinaleRuntime, f: number) => {
  for (const [i, side] of ([-1, 1] as const).entries()) {
    const x = side < 0 ? ROOM_L - WALL_T : ROOM_R;
    bandedGradient(ctx, x, VIEW_Y, WALL_T, FLOOR - VIEW_Y, ['#2a1408', '#3a1c0c', '#4c2610', '#3a1c0c'], 6);
    R(ctx, side < 0 ? x + WALL_T - 4 : x, VIEW_Y, 4, FLOOR - VIEW_Y, '#1a0c04');
    R(ctx, side < 0 ? x + WALL_T - 6 : x + 4, ROOM_TOP, 2, FLOOR - ROOM_TOP, '#6e3a1a');
    // The window: night through it, the frame; the glass gone if a jetpack man's come through
    const wy = WINDOW_TOP, wh = WINDOW_BOTTOM - WINDOW_TOP;
    bandedGradient(ctx, x + 6, wy, WALL_T - 12, wh, ['#02021a', '#08083c', '#12125c', '#1c1c6c'], 5);
    R(ctx, x + 4, wy - 4, WALL_T - 8, 4, '#e8e4dc'); R(ctx, x + 4, wy + wh, WALL_T - 8, 4, '#e8e4dc');
    if (rt.windowBroken[i]) { ctx.fillStyle = 'rgba(200, 230, 255, 0.5)'; for (let s = 0; s < 4; s++) { ctx.beginPath(); ctx.moveTo(x + 6, wy + s * 40); ctx.lineTo(x + 6 + 8 + s * 3, wy + s * 40 + 10); ctx.lineTo(x + 6, wy + s * 40 + 22); ctx.fill(); } }
    else { R(ctx, x + 8, wy + 6, 3, wh - 12, 'rgba(255, 255, 255, 0.25)'); R(ctx, x + 6, wy + wh / 2, WALL_T - 12, 3, '#e8e4dc'); }
    // The door: the corridor light behind it, the door swung open or shut
    const dy = FLOOR - DOOR_H, open = rt.doorsShut ? 0 : rt.doorOpen[i];
    R(ctx, x + 4, dy - 6, WALL_T - 8, 6, '#e8e4dc');
    bandedGradient(ctx, x + 6, dy, WALL_T - 12, DOOR_H, ['#fef3c7', '#fde68a', '#d6b860'], 4);
    const leaf = Math.round((WALL_T - 12) * (1 - open));
    if (leaf > 0) {
      shaded(ctx, () => ctx.rect(side < 0 ? x + 6 : x + WALL_T - 6 - leaf, dy, leaf, DOOR_H), '#5a2a0c', side < 0 ? x + 6 : x + WALL_T - 6 - leaf, dy, leaf, DOOR_H);
      if (leaf > 10) R(ctx, side < 0 ? x + 6 + leaf - 6 : x + WALL_T - 6 - leaf + 3, dy + DOOR_H / 2, 3, 6, '#e8b400');
    }
    // (slammed for good: a bar across it)
    if (rt.doorsShut) { R(ctx, x + 2, dy + DOOR_H * 0.45, WALL_T - 4, 6, '#3a3f48'); R(ctx, x + 2, dy + DOOR_H * 0.45, WALL_T - 4, 2, '#868e9a'); }
    // The EXIT sign over it
    R(ctx, x + 6, dy - 22, WALL_T - 12, 12, '#1a0606');
    ctx.font = 'bold 7px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillStyle = f % 90 < 80 || !has(rt, 'TASER') ? '#ef4444' : '#4a0a0a';
    ctx.fillText('EXIT', x + WALL_T / 2, dy - 13);
  }
};

// ---------------------------------------------------------------------------
// The screen: his health, the big callouts, the radio
// ---------------------------------------------------------------------------

export const drawFinaleHud = (ctx: Ctx, state: GameState) => {
  const rt = getFinale(state);
  // (him dead: the kill cam's, and nothing else)
  if (rt?.cam) { drawKillCamHud(ctx, state); return; }
  if (!rt || state.player.inCutscene) return;
  const boss = state.enemies.find(e => e.type === 'boss');
  const f = state.frame;
  // His bar: across the top, clear of the HUD; it chunks down as he's hurt (a pale trail behind it)
  if (boss && boss.health > 0 && state.bossExplosionTimer <= 0 && !state.victoryString) {
    const b = topBand(), w = b.x2 - b.x1, y = 18, h = 14;
    const k = Math.max(0, boss.health / boss.maxHealth);
    rt.hpShown = rt.hpShown === undefined ? k : Math.max(k, rt.hpShown - 0.004);
    ctx.fillStyle = '#000'; ctx.fillRect(b.x1 - 3, y - 3, w + 6, h + 6);
    ctx.fillStyle = '#3f3f46'; ctx.fillRect(b.x1 - 1, y - 1, w + 2, h + 2);
    ctx.fillStyle = '#0a0a0c'; ctx.fillRect(b.x1, y, w, h);
    ctx.fillStyle = '#fbcfe8'; ctx.fillRect(b.x1, y, w * rt.hpShown, h);
    const plead = rt.pleadAt !== undefined;
    bandedGradient(ctx, b.x1, y, w * k, h, plead ? ['#fca5a5', '#ef4444', '#991b1b'] : ['#d9f99d', '#84cc16', '#3f6212'], 3, 1);
    for (let x = b.x1 + 24; x < b.x1 + w; x += 24) { ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; ctx.fillRect(x, y, 1, h); }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; ctx.fillRect(b.x1, y, w, 2);
    ctx.font = 'bold 8px "Press Start 2P"'; ctx.textAlign = 'left'; ctx.fillStyle = plead && f % 30 < 15 ? '#fca5a5' : '#e5e7eb';
    ctx.fillText(plead ? 'THE IMPOSTER  (BEGGING)' : 'THE IMPOSTER', b.x1, y + h + 13);
  }
  // A weapon run dry, the room wrecked its way: big across the middle, slammed in, then fading
  if (rt.banner && rt.t - rt.banner.at < 150) {
    const u = rt.t - rt.banner.at, s = u < 8 ? 1.8 - u * 0.1 : 1, a = u > 110 ? 1 - (u - 110) / 40 : 1;
    ctx.save(); ctx.globalAlpha = Math.max(0, a); ctx.translate(CANVAS_WIDTH / 2, 150); ctx.scale(s, s);
    ctx.font = 'bold 22px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillStyle = '#000'; ctx.fillText(rt.banner.text, 3, 3);
    ctx.fillStyle = rt.banner.color; ctx.fillText(rt.banner.text, 0, 0);
    ctx.restore();
  }
  // The radio: the line on the screen while it's said, low in the middle (a little radio by it)
  if (rt.radioText && rt.t < rt.radioUntil) {
    ctx.save(); ctx.font = 'bold 9px "Press Start 2P"'; ctx.textAlign = 'center';
    // (wrapped to two or three lines)
    const rows: string[] = [];
    for (const word of rt.radioText.split(' ')) { const last = rows[rows.length - 1]; if (last !== undefined && (last + ' ' + word).length <= 40) rows[rows.length - 1] = last + ' ' + word; else rows.push(word); }
    // (up under his bar, clear of the HUD and out of the way of the fight)
    const tw = Math.max(...rows.map(r => ctx.measureText(r).width), ctx.measureText('SECRET SERVICE:').width) + 64, x = topBand().mid;
    const h = 22 + rows.length * 12, y = 56;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.78)'; ctx.fillRect(x - tw / 2, y, tw, h);
    ctx.strokeStyle = '#3f3f46'; ctx.lineWidth = 2; ctx.strokeRect(x - tw / 2, y, tw, h);
    // (the radio: a handset, its light blinking)
    ctx.fillStyle = '#27272a'; ctx.fillRect(x - tw / 2 + 10, y + 8, 12, 20); ctx.fillStyle = f % 16 < 8 ? '#22c55e' : '#14532d'; ctx.fillRect(x - tw / 2 + 13, y + 11, 3, 3);
    ctx.fillStyle = '#52525b'; ctx.fillRect(x - tw / 2 + 18, y + 1, 2, 8);
    ctx.fillStyle = '#a1a1aa'; ctx.fillText('SECRET SERVICE:', x + 12, y + 14);
    ctx.fillStyle = '#e5e7eb'; rows.forEach((r, i) => ctx.fillText(r, x + 12, y + 27 + i * 12));
    ctx.restore();
  }
};

