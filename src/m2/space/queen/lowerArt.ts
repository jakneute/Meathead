// Down under XENOSCARE, drawn (the SNES pass): the basement (deep under the hold: two levels, the floor and the
// catwalks over it; concrete block in courses, damp coming through it in stepped stains; the pipe runs (copper, steel,
// a fat insulated main), cable trays, valve wheels, gauges, ride motors, fuse boxes; the red emergency strips along the
// ceiling (flickering, as the lighting has them); the vents in the ceiling and the ducts in the back wall (where she
// comes and goes: plain to see); the yellow safety line along the wet floor, its drains, puddles catching the red; the
// stencils; the animatronic graveyard half way; the stairs up at its west end; the hole in its ceiling he came down and
// the rubble under it), and the long flight of stairs up at its east end toward the park. The disco: disco.ts.
// Still things stamped in tiles; the loops live. It's lit by the lighting (basement.ts's hunterLighting): near black,
// a tight light round him, the strips' red; so what's painted here is painted to read in that.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { stamp } from '../../../m1/game/render/stamp';
import { brickPattern } from '../../../m1/game/render/pixelArt';
import { GY } from '../geometry';
import { drawCheapGreen } from '../crater/art';
import { BASE_L, STAIRS_X, DOOR_X, HOLE, BF, CATWALK_Y, CEIL_B, STAIRS_A, STAIRS_B } from './geo';
import { CATWALKS, PIPES, PIPE_Y, VENTS, DUCTS, STRIPS } from './basement';
import { SLABS, slabPose, drawSlab } from './show';
import { type Ramp, CHROME, dith, tube, blob, hash } from './paint';
import { stencil, lightbox, print } from './letters';

type Ctx = CanvasRenderingContext2D;
const shown = (state: GameState, a: number, b: number) => { const v = state.view ?? { x: state.camera.x, w: CANVAS_WIDTH }; return b > v.x - 80 && a < v.x + v.w + 80; };
const px = (c: Ctx, x: number, y: number, w: number, h: number, col: string | CanvasPattern) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const B = BASE_L;
const GRAVE = { a: B + 2700, b: B + 3750 };
/** The tunnel's tiles: from the hold's floor slab's top down past the basement floor. */
const TOP = GY - 8, BOT = BF + 300;

/** Copper; steel; the main's insulation; a valve's red. */
const COPPER: Ramp = ['#1A0E08', '#5A3420', '#8A5634', '#C2885A', '#E8B98C'];
const STEEL: Ramp = ['#0A0A0E', '#22222A', '#34343F', '#4E4E5C', '#7A7A8A'];
const INSUL: Ramp = ['#0C0C10', '#3A3A40', '#55555C', '#77777E', '#A0A0A8'];
const REDV: Ramp = ['#1A0404', '#5A0F0F', '#8E1B1B', '#C43A3A', '#F08080'];

// ---------------------------------------------------------------------------------------------------------------
// The basement

export const drawBasement = (c: Ctx, state: GameState, o: { fell: boolean; landed: boolean }) => {
  const v = state.view ?? { x: state.camera.x, w: CANVAS_WIDTH };
  const a = Math.max(B - 220, v.x - 40), b = Math.min(STAIRS_B + 200, v.x + v.w + 40);
  if (b <= a) return;
  for (let tx = Math.floor((a - B) / 400) * 400 + B; tx < b; tx += 400) {
    const i = Math.round((tx - B) / 400);
    stamp(c, `sp-q-base2-${i}`, tx, TOP, 400, BOT - TOP, g => paintTunnel(g, tx));
  }
  // (the stairs up to the hold at the west end)
  if (shown(state, B - 220, B + 140)) stamp(c, 'sp-q-stairs2', B - 220, CEIL_B, 360, BF - CEIL_B + 4, g => {
    px(g, B - 220, CEIL_B, 220, BF - CEIL_B, '#07070B');
    g.fillStyle = brickPattern(g, 'sp-q-blk-d', 32, 16, ['#121218', '#15151C'], '#09090D'); g.fillRect(B - 220, CEIL_B, 220, BF - CEIL_B);
    for (let k = 0; k < 14; k++) {
      const x = B - 200 + k * 14, y = BF - k * 34 - 10;
      px(g, x, y, 40, BF - y, '#16161C'); px(g, x, y, 40, 10, '#2A2A33'); px(g, x, y, 40, 2, '#5A5A66'); px(g, x, y, 40, 1, '#8A8A96');
    }
    px(g, STAIRS_X - 52, BF - 252, 114, 44, '#020203'); px(g, STAIRS_X - 50, BF - 250, 110, 40, '#0B2A18'); px(g, STAIRS_X - 50, BF - 250, 110, 2, '#16A34A');
    for (const bx of [STAIRS_X - 40, STAIRS_X + 46]) { px(g, bx, BF - 262, 4, 12, '#020203'); px(g, bx + 1, BF - 262, 2, 12, '#52525B'); }
    lightbox(g, 'EXIT ^ THE HOLD', STAIRS_X + 5, BF - 234, 1, '#4ADE80', '#DCFCE7', '#14532D');
  });
  // (the hole in the ceiling he came down through: its broken edges, the hold's light down it; the rubble under it)
  if (o.fell && shown(state, HOLE.a - 120, HOLE.b + 120)) {
    c.fillStyle = dith(c, 'rgba(167, 139, 250, 0.16)'); c.beginPath(); c.moveTo(HOLE.a, CEIL_B); c.lineTo(HOLE.b, CEIL_B); c.lineTo(HOLE.b + 50, BF); c.lineTo(HOLE.a - 50, BF); c.closePath(); c.fill();
    c.fillStyle = 'rgba(167, 139, 250, 0.06)'; c.beginPath(); c.moveTo(HOLE.a + 20, CEIL_B); c.lineTo(HOLE.b - 20, CEIL_B); c.lineTo(HOLE.b + 20, BF); c.lineTo(HOLE.a - 20, BF); c.closePath(); c.fill();
    px(c, HOLE.a, GY - 2, HOLE.b - HOLE.a, CEIL_B - GY + 2, '#120A1E');
    for (let x = HOLE.a; x < HOLE.b; x += 10) { const d = 4 + ((x * 13) % 9); px(c, x, CEIL_B - 2, 10, d, '#3F3F46'); px(c, x, CEIL_B - 2, 10, 1, '#71717A'); px(c, x, GY - 2, 10, 3 + ((x * 7) % 5), '#3F3F46'); }
    for (const ex of [HOLE.a, HOLE.b]) { tube(c, ex, CEIL_B - 8, ex + (ex === HOLE.a ? 10 : -10), CEIL_B + 6, 2, COPPER); tube(c, ex + 4, CEIL_B - 6, ex + (ex === HOLE.a ? 18 : -18), CEIL_B + 2, 2, COPPER); }
    if (o.landed) {
      // (the rubble: the slabs where they came down, chunks, dust)
      SLABS.forEach((sl, i) => { const ps = slabPose(sl, i, 1); drawSlab(c, ps.x, ps.y, sl.w, ps.r); });
      for (let i = 0; i < 9; i++) blob(c, HOLE.a - 50 + i * 26 + ((i * 17) % 9), BF - 5 - (i % 3) * 3, 5 + (i % 3) * 2, 4 + (i % 2) * 2, STEEL);
      c.fillStyle = dith(c, '#3F3F46'); c.fillRect(HOLE.a - 70, BF - 3, HOLE.b - HOLE.a + 140, 3);
    }
  }
  // (the graveyard: heaps of the broken animatronics, the old show's leftovers)
  if (shown(state, GRAVE.a, GRAVE.b)) stamp(c, 'sp-q-grave2', GRAVE.a, BF - 200, GRAVE.b - GRAVE.a, 204, g => {
    stencil(g, 'PROP STORAGE - DO NOT FEED', GRAVE.a + 740, BF - 194, 2, '#9A9AA6', { seed: 5, spray: 'rgba(154, 154, 166, 0.35)' });
    for (let i = 0; i < 9; i++) {
      const x = GRAVE.a + 60 + i * 110 + hash(i) * 40, rot = (hash(i + 4) - 0.5) * 2.4;
      g.save(); g.translate(x, BF - 6); g.rotate(rot); g.globalAlpha = 0.8; drawCheapGreen(g, 0, 0, i * 9, 0.7, i % 3 ? 'limp' : 'boo'); g.restore();
    }
    g.globalAlpha = 1;
    // (a spaceman's helmet, a tipped saucer, a crate of their eggs)
    blob(g, GRAVE.a + 520, BF - 20, 40, 20, ['#1C1917', '#78716C', '#D6D3D1', '#F5F5F4', '#FFFFFF']);
    px(g, GRAVE.a + 502, BF - 32, 18, 12, '#0A0A0E'); px(g, GRAVE.a + 504, BF - 30, 6, 2, '#52525B');
    blob(g, GRAVE.a + 820, BF - 30, 70, 16, STEEL, true, -0.2);
    blob(g, GRAVE.a + 820, BF - 40, 30, 10, ['#0C1A26', '#1E3A5F', '#3B82F6', '#93C5FD', '#FFFFFF'], true, -0.2);
    px(g, GRAVE.a + 938, BF - 62, 84, 62, '#120A04'); px(g, GRAVE.a + 940, BF - 60, 80, 60, '#5A3A1A'); px(g, GRAVE.a + 940, BF - 60, 80, 3, '#8A5A2A');
    for (let k = 0; k < 4; k++) px(g, GRAVE.a + 940, BF - 48 + k * 14, 80, 1, '#3A2410');
    for (let k = 0; k < 3; k++) blob(g, GRAVE.a + 956 + k * 24, BF - 66, 10, 12, ['#052E16', '#15803D', '#22C55E', '#86EFAC', '#F0FFF4']);
    stencil(g, 'EGGS - FRAGILE', GRAVE.a + 980, BF - 31, 1, '#1A0E04', { seed: 9, spray: '', runs: false });
  });
  // (the catwalks: grating on struts, a rail, a kick plate; the lit top lip (stand on it))
  for (const [ca, cb] of CATWALKS) {
    if (!shown(state, ca, cb)) continue;
    stamp(c, `sp-q-cw2-${ca}`, ca - 4, CATWALK_Y - 36, cb - ca + 8, BF - CATWALK_Y + 38, g => {
      for (let x = ca + 30; x < cb; x += 150) {
        px(g, x - 1, CATWALK_Y + 12, 10, BF - CATWALK_Y - 12, '#060609'); px(g, x, CATWALK_Y + 12, 8, BF - CATWALK_Y - 12, STEEL[2]); px(g, x, CATWALK_Y + 12, 2, BF - CATWALK_Y - 12, STEEL[3]); px(g, x + 6, CATWALK_Y + 12, 2, BF - CATWALK_Y - 12, STEEL[1]);
        px(g, x - 4, BF - 8, 16, 8, STEEL[1]); px(g, x - 4, BF - 8, 16, 1, STEEL[3]);
      }
      // (the rail: posts, two tubes)
      for (let x = ca; x <= cb; x += 50) { px(g, x, CATWALK_Y - 32, 4, 32, STEEL[0]); px(g, x + 1, CATWALK_Y - 32, 2, 32, STEEL[3]); }
      tube(g, ca, CATWALK_Y - 31, cb, CATWALK_Y - 31, 4, STEEL); tube(g, ca, CATWALK_Y - 16, cb, CATWALK_Y - 16, 3, STEEL);
      // (the grating, the kick plate with its hazard stripes, the lip)
      px(g, ca, CATWALK_Y, cb - ca, 14, '#0A0A0E');
      for (let x = ca; x < cb; x += 6) { px(g, x + 1, CATWALK_Y + 3, 4, 8, '#1A1A22'); px(g, x + 1, CATWALK_Y + 3, 4, 1, '#2E2E3A'); }
      for (let x = ca; x < cb - 16; x += 20) { g.fillStyle = Math.round((x - ca) / 20) % 2 ? '#3A2E08' : '#14140A'; g.beginPath(); g.moveTo(x, CATWALK_Y + 14); g.lineTo(x + 10, CATWALK_Y + 14); g.lineTo(x + 16, CATWALK_Y + 20); g.lineTo(x + 6, CATWALK_Y + 20); g.closePath(); g.fill(); }
      px(g, ca, CATWALK_Y, cb - ca, 2, '#B4B8C4'); px(g, ca, CATWALK_Y + 2, cb - ca, 1, '#6A6A78');
    });
  }
  // (the pipe runs half way up (she crawls these): copper on its stands, its top lit; flanges)
  for (const [pxx, pw] of PIPES) {
    if (!shown(state, pxx, pxx + pw)) continue;
    for (const lx of [pxx + 8, pxx + pw - 16]) { px(c, lx - 1, PIPE_Y + 12, 10, BF - PIPE_Y - 12, '#060609'); px(c, lx, PIPE_Y + 12, 8, BF - PIPE_Y - 12, COPPER[1]); px(c, lx, PIPE_Y + 12, 2, BF - PIPE_Y - 12, COPPER[2]); }
    tube(c, pxx, PIPE_Y + 7, pxx + pw, PIPE_Y + 7, 14, COPPER);
    for (const fx of [pxx + 4, pxx + pw - 8]) { px(c, fx, PIPE_Y - 2, 4, 18, COPPER[0]); px(c, fx + 1, PIPE_Y - 1, 2, 16, COPPER[3]); }
    px(c, pxx, PIPE_Y, pw, 1, '#E8B98C');
  }
  // (the vents in the ceiling, the ducts in the back wall: where she comes and goes; framed, louvered, plain to see)
  for (const vx of VENTS) if (shown(state, vx - 40, vx + 40)) {
    px(c, vx - 34, CEIL_B - 4, 68, 13, STEEL[1]); px(c, vx - 34, CEIL_B + 7, 68, 2, STEEL[3]);
    px(c, vx - 30, CEIL_B - 2, 60, 9, '#020203');
    for (let s = 0; s < 6; s++) { px(c, vx - 28 + s * 10, CEIL_B - 2, 4, 9, STEEL[2]); px(c, vx - 28 + s * 10, CEIL_B + 5, 4, 2, STEEL[3]); }
    for (const sx of [vx - 32, vx + 30]) px(c, sx, CEIL_B + 2, 2, 2, STEEL[4]);
  }
  for (const dx of DUCTS) if (shown(state, dx - 40, dx + 40)) {
    px(c, dx - 38, BF - 78, 76, 58, '#050507'); px(c, dx - 36, BF - 76, 72, 54, STEEL[2]); px(c, dx - 36, BF - 76, 72, 2, STEEL[4]); px(c, dx + 32, BF - 74, 4, 52, STEEL[1]);
    px(c, dx - 30, BF - 70, 60, 42, '#020203');
    for (let s = 0; s < 5; s++) { px(c, dx - 28 + s * 12, BF - 70, 4, 42, STEEL[1]); px(c, dx - 28 + s * 12, BF - 70, 1, 42, STEEL[3]); }
    for (const [sx, sy] of [[dx - 34, BF - 74], [dx + 32, BF - 74], [dx - 34, BF - 26], [dx + 32, BF - 26]]) px(c, sx, sy, 2, 2, STEEL[4]);
  }
  // (the emergency strips along the ceiling: red tubes in cages, lit when the lighting has them lit)
  for (const s of STRIPS) {
    if (!shown(state, s - 50, s + 50)) continue;
    const on = Math.sin(state.frame * 0.13 + s) > -0.6 && (state.frame + s) % 97 > 6;
    px(c, s - 40, CEIL_B + 10, 80, 14, '#050507'); px(c, s - 38, CEIL_B + 12, 76, 10, on ? '#991B1B' : '#2A0808');
    if (on) { px(c, s - 36, CEIL_B + 14, 72, 4, '#F87171'); px(c, s - 30, CEIL_B + 15, 60, 1, '#FEE2E2'); }
    for (let k = 0; k < 7; k++) px(c, s - 36 + k * 12, CEIL_B + 11, 2, 12, '#3A3A44');
    // (its light on the wet floor under it: a red smear)
    if (on) { c.fillStyle = dith(c, 'rgba(239, 68, 68, 0.35)'); c.fillRect(s - 50, BF + 2, 100, 3); }
  }
  drawStairsUp(c, state);
};

const paintTunnel = (g: Ctx, tx: number) => {
  // (the hold's floor slab overhead: its underside the ceiling)
  px(g, tx, TOP, 400, CEIL_B - TOP, '#08080C');
  px(g, tx, CEIL_B - 4, 400, 4, '#16161D'); px(g, tx, CEIL_B - 1, 400, 1, '#2A2A34');
  const wallEnd = Math.min(tx + 400, STAIRS_A - 40);
  if (wallEnd > tx) {
    const ww = wallEnd - tx;
    // (concrete block, in courses: two tints, its mortar; banded darker up toward the ceiling and down to the floor)
    g.fillStyle = brickPattern(g, 'sp-q-blk', 48, 24, ['#1D1D24', '#202028'], '#111116'); g.fillRect(tx, CEIL_B, ww, BF - CEIL_B);
    for (let k = 0; k < 4; k++) { px(g, tx, CEIL_B + k * 14, ww, 14, `rgba(4, 4, 8, ${(0.5 - k * 0.12).toFixed(2)})`); px(g, tx, BF - 14 - k * 14, ww, 14, `rgba(4, 4, 8, ${(0.42 - k * 0.1).toFixed(2)})`); }
    // (the damp: stains coming down from the joints, stepped, dithered at their edges)
    for (let k = Math.floor((tx - B) / 96); k * 96 + B < wallEnd; k++) {
      if (hash(k) > 0.45) continue;
      const sx = B + k * 96 + hash(k + 1) * 50, sh = 90 + hash(k * 3) * 120, sw = 24 + hash(k * 5) * 30;
      g.fillStyle = 'rgba(26, 48, 34, 0.45)'; g.fillRect(sx, CEIL_B + 30, sw, sh);
      g.fillStyle = dith(g, 'rgba(26, 48, 34, 0.5)'); g.fillRect(sx - 4, CEIL_B + 30, sw + 8, sh + 10);
      g.fillStyle = 'rgba(52, 80, 58, 0.3)'; g.fillRect(sx + 4, CEIL_B + 30, 3, sh * 0.8);
    }
    // (the runs along the wall: a fat insulated main up top, banded; copper lines; a cable tray; the lower conduit)
    tube(g, tx, CEIL_B + 35, wallEnd, CEIL_B + 35, 22, INSUL);
    for (let bx = Math.ceil(tx / 80) * 80; bx < wallEnd; bx += 80) { px(g, bx, CEIL_B + 22, 4, 26, '#2A2A30'); px(g, bx, CEIL_B + 22, 1, 26, '#8A8A92'); }
    tube(g, tx, CEIL_B + 62, wallEnd, CEIL_B + 62, 8, COPPER);
    tube(g, tx, CEIL_B + 74, wallEnd, CEIL_B + 74, 5, ['#06120E', '#14403A', '#1E6A5E', '#3EA08C', '#88D8C8']);
    px(g, tx, CEIL_B + 82, ww, 6, '#0C0C10'); px(g, tx, CEIL_B + 82, ww, 1, '#3A3A44');
    for (let cx = tx; cx < wallEnd; cx += 3) px(g, cx, CEIL_B + 88, 2, 2 + ((cx * 7) % 5), ['#7F1D1D', '#1E3A8A', '#14532D', '#3F3F46'][((cx / 3) | 0) % 4]);
    tube(g, tx, BF - 117, wallEnd, BF - 117, 6, STEEL);
    // (the floor: wet concrete, its lip lit; the yellow safety line; a drain now and then)
    px(g, tx, BF, ww, BOT - BF, '#0E0E12');
    for (let y = BF + 4; y < BF + 60; y += 6) px(g, tx, y, ww, 1, '#121218');
    px(g, tx, BF, ww, 2, '#4A4A56'); px(g, tx, BF, ww, 1, '#8A8A98');
    px(g, tx, BF + 10, ww, 3, '#6A5A10');
    for (let x = Math.ceil((tx - B - 120) / 340) * 340 + B + 120; x < wallEnd; x += 340) { px(g, x, BF + 18, 34, 8, '#050507'); for (let s = 0; s < 6; s++) px(g, x + 2 + s * 5, BF + 19, 2, 6, '#2A2A33'); }
  }
  // (every so often: a valve wheel, a ride motor, a stencil, a puddle, a gauge, a fuse box)
  for (let k = Math.ceil((tx - B - 140) / 260); k * 260 + B < tx + 400; k++) {
    const x = B + k * 260 + 40;
    if (x > STAIRS_A - 80) continue;
    const kind = ((k % 6) + 6) % 6;
    if (kind === 0) {
      // (a valve wheel on the main, red, spoked)
      g.strokeStyle = REDV[0]; g.lineWidth = 5; g.beginPath(); g.arc(x, CEIL_B + 35, 12, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = REDV[2]; g.lineWidth = 3; g.beginPath(); g.arc(x, CEIL_B + 35, 12, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = REDV[3]; g.lineWidth = 1; g.beginPath(); g.arc(x, CEIL_B + 35, 12, Math.PI * 1.1, Math.PI * 1.7); g.stroke();
      for (let s = 0; s < 3; s++) { const an = s * Math.PI / 3; g.strokeStyle = REDV[1]; g.lineWidth = 2; g.beginPath(); g.moveTo(x - Math.cos(an) * 11, CEIL_B + 35 - Math.sin(an) * 11); g.lineTo(x + Math.cos(an) * 11, CEIL_B + 35 + Math.sin(an) * 11); g.stroke(); }
      blob(g, x, CEIL_B + 35, 3, 3, CHROME);
    }
    if (kind === 1) {
      // (a ride motor: a steel housing, its flywheel, a warning plate)
      px(g, x - 32, BF - 82, 64, 82, '#050507'); px(g, x - 30, BF - 80, 60, 80, STEEL[2]); px(g, x - 30, BF - 80, 60, 3, STEEL[4]); px(g, x + 22, BF - 77, 8, 77, STEEL[1]);
      for (let s = 0; s < 5; s++) px(g, x - 26, BF - 70 + s * 6, 20, 2, STEEL[0]);
      blob(g, x + 4, BF - 40, 20, 20, STEEL); blob(g, x + 4, BF - 40, 8, 8, CHROME);
      px(g, x - 26, BF - 18, 22, 10, '#A16207'); px(g, x - 25, BF - 17, 20, 1, '#FACC15'); print(g, '!', x - 15, BF - 16, 1, 1, '#1A0E04');
    }
    if (kind === 2) stencil(g, ['CAST MEMBERS ONLY', 'B-LEVEL', 'NO RUNNING', 'XENOSCARE MAINT'][Math.floor(k / 6) % 4], x + 10, CATWALK_Y - 67, 1, '#B4842A', { seed: k, spray: 'rgba(180, 132, 42, 0.3)' });
    if (kind === 3) { g.fillStyle = 'rgba(100, 116, 139, 0.3)'; g.beginPath(); g.ellipse(x, BF + 3, 44, 3, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = dith(g, 'rgba(220, 60, 60, 0.4)'); g.fillRect(x - 20, BF + 2, 30, 2); }
    if (kind === 4) {
      // (a gauge on the copper line, its needle in the red)
      tube(g, x, CEIL_B + 90, x, CEIL_B + 66, 3, COPPER);
      blob(g, x, CEIL_B + 100, 9, 9, STEEL); blob(g, x, CEIL_B + 100, 7, 7, ['#2A2A20', '#A8A28A', '#E8E2CA', '#F8F4E4', '#FFFFFF'], false);
      g.strokeStyle = '#B91C1C'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, CEIL_B + 100); g.lineTo(x + 5, CEIL_B + 96); g.stroke();
    }
    if (kind === 5) {
      // (a fuse box: gray, its door ajar, a sticker)
      px(g, x - 22, BF - 220, 44, 60, '#050507'); px(g, x - 20, BF - 218, 40, 56, STEEL[2]); px(g, x - 20, BF - 218, 40, 2, STEEL[4]);
      px(g, x - 16, BF - 210, 18, 40, STEEL[1]); px(g, x + 6, BF - 200, 8, 12, '#D4D4D8'); px(g, x + 7, BF - 199, 6, 3, '#B91C1C');
      tube(g, x, BF - 160, x, BF - 125, 3, STEEL);
    }
  }
};

/** The long flight up at the east end: concrete steps (lit noses), the stringer, a rail, the stairwell's wall going up
 *  into the dark toward the park, the sign, the disco's light down it from the top. */
const drawStairsUp = (c: Ctx, state: GameState) => {
  if (!shown(state, STAIRS_A - 100, DOOR_X + 100)) return;
  stamp(c, 'sp-q-stairsup4', STAIRS_A - 60, GY - 620, DOOR_X - STAIRS_A + 160, BF - GY + 920, g => {
    const n = 35, run = (STAIRS_B - STAIRS_A) / n, rise = (BF - GY) / n;
    // (the stairwell: its wall in block, darker going down)
    g.fillStyle = brickPattern(g, 'sp-q-blk-s', 48, 24, ['#1F1A26', '#231D2B'], '#141019'); g.fillRect(STAIRS_A - 40, GY - 600, DOOR_X - STAIRS_A + 140, BF - GY + 600);
    // (up high the block darker into the dark, stepped; the ceiling slab over it all, its underside lit along the edge)
    for (let k = 0; k < 4; k++) px(g, STAIRS_A - 40, GY - 600 + k * 60, DOOR_X - STAIRS_A + 140, 60, `rgba(0, 0, 0, ${(0.4 - k * 0.1).toFixed(2)})`);
    px(g, STAIRS_A - 60, GY - 620, DOOR_X - STAIRS_A + 160, 20, '#0C0A10'); px(g, STAIRS_A - 60, GY - 602, DOOR_X - STAIRS_A + 160, 2, '#2A2A33');
    for (let k = 0; k < 6; k++) px(g, STAIRS_A - 40, GY + 200 + k * 60, STAIRS_B - STAIRS_A + 40, 60, `rgba(0, 0, 0, ${(0.1 + k * 0.08).toFixed(2)})`);
    // (the disco's color down the wall from the door: stepped bands, pink at the top fading out)
    for (let k = 0; k < 4; k++) { g.fillStyle = dith(g, `rgba(244, 114, 182, ${(0.12 - k * 0.025).toFixed(3)})`, 2, k % 2); g.fillRect(STAIRS_B - 200 - k * 120, GY - 300, DOOR_X - STAIRS_B + 300 + k * 120, 300 - k * 30); }
    // (the steps: under them solid, each tread's nose lit, a strip of grip tape)
    for (let k = 0; k < n; k++) {
      const x = STAIRS_A + k * run, y = BF - (k + 1) * rise;
      px(g, x, y, run + 1, BF - y + 300, '#24242C');
      px(g, x, y, run + 1, 6, '#34343F'); px(g, x, y, run + 1, 2, '#6A6A78'); px(g, x, y, run + 1, 1, '#B4B4C0');
      px(g, x + 2, y + 2, run - 4, 1, '#C9A227');
    }
    // (the landing at the top, the floor on to the door)
    px(g, STAIRS_B, GY, DOOR_X - STAIRS_B + 100, 300, '#2A2A33'); px(g, STAIRS_B, GY, DOOR_X - STAIRS_B + 100, 2, '#B4B4C0');
    // (the handrail up it: a steel tube on posts)
    for (let k = 0; k <= n; k += 4) { const x = STAIRS_A + k * run; px(g, x, BF - k * rise - 60, 4, 60, '#0A0A0E'); px(g, x + 1, BF - k * rise - 60, 2, 60, '#7A7A8A'); }
    g.lineCap = 'round';
    for (const [w, col, o] of [[6, '#0A0A0E', 0], [4, '#52525B', 0], [2, '#A1A1AA', -1], [1, '#E4E4E7', -1.5]] as const) {
      g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(STAIRS_A, BF - 60 + o); g.lineTo(STAIRS_B, GY - 60 + o); g.lineTo(DOOR_X - 90, GY - 60 + o); g.stroke();
    }
    g.lineCap = 'butt';
    // (the sign, up on the wall at the foot of it, clear of the rail)
    const sx = STAIRS_A + 20, sy = BF - 470;
    px(g, sx - 2, sy - 2, 204, 44, '#020203'); px(g, sx, sy, 200, 40, '#0B2A18'); px(g, sx, sy, 200, 2, '#16A34A');
    for (const bx of [sx + 30, sx + 166]) { px(g, bx, sy - 12, 4, 12, '#020203'); px(g, bx + 1, sy - 12, 2, 12, '#52525B'); }
    lightbox(g, 'PARK LEVEL ^', sx + 100, sy + 8, 1, '#4ADE80', '#DCFCE7', '#14532D');
    lightbox(g, 'GALACTIC GROOVE', sx + 100, sy + 24, 1, '#86EFAC', '#F0FDF4', '#14532D');
  });
};

// The space disco, the shutter, the hall's light: disco.ts
export { drawDisco, drawDiscoShell, drawShutter, discoLighting, discoGlow, type BoothOps } from './disco';
