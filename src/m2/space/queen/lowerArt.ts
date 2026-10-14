// Down under XENOSCARE, drawn (crude first pass): the basement (deep under the hold: two levels, the floor and the
// catwalks over it, concrete, pipe runs, cable trays, valve wheels, ride machinery, the stencils, the vents in the
// ceiling and the ducts in the back wall; the animatronic graveyard half way; the stairs up at its west end; the hole in
// its ceiling he came down and the rubble under it), the long flight of stairs up at its east end toward the park, and
// GALACTIC GROOVE, the space disco (extra wide: the light-up floor, the mirror ball, the neon, the DJ booth with the
// two operators up in it and its back door, the fire extinguisher on the wall, the shutter that slams down behind
// him). Still things stamped in tiles; the loops live.

import type { GameState } from '../../../m1/game/core/state';
import type { Light, SceneLight } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { stamp } from '../../../m1/game/render/stamp';
import { ink, limb } from '../../../m1/game/render/npc/kit';
import { ALIEN } from '../../../m1/game/scenes/alienLook';
import { box, label } from '../section';
import { GY } from '../geometry';
import { drawAlien, type AlienPose } from '../crater/aliens';
import { drawCheapGreen } from '../crater/art';
import { BASE_L, STAIRS_X, LAND_X, DOOR_X, DISCO_L, DISCO_R, DJ, BALL, EXTINGUISHER_X, REFILL_X, HOLE, BF, CATWALK_Y, CEIL_B, STAIRS_A, STAIRS_B } from './geo';
import { CATWALKS, PIPES, PIPE_Y, VENTS, DUCTS } from './basement';
import { SLABS, slabPose, drawSlab } from './show';

type Ctx = CanvasRenderingContext2D;
const shown = (state: GameState, a: number, b: number) => { const v = state.view ?? { x: state.camera.x, w: CANVAS_WIDTH }; return b > v.x - 80 && a < v.x + v.w + 80; };
const hash = (n: number) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
const B = BASE_L;
const GRAVE = { a: B + 2700, b: B + 3750 };
/** The tunnel's tiles: from the hold's floor slab's top down past the basement floor. */
const TOP = GY - 8, BOT = BF + 300;

// ---------------------------------------------------------------------------------------------------------------
// The basement

export const drawBasement = (c: Ctx, state: GameState, o: { fell: boolean; landed: boolean }) => {
  const v = state.view ?? { x: state.camera.x, w: CANVAS_WIDTH };
  const a = Math.max(B - 220, v.x - 40), b = Math.min(STAIRS_B + 200, v.x + v.w + 40);
  if (b <= a) return;
  for (let tx = Math.floor((a - B) / 400) * 400 + B; tx < b; tx += 400) {
    const i = Math.round((tx - B) / 400);
    stamp(c, `sp-q-base-${i}`, tx, TOP, 400, BOT - TOP, g => paintTunnel(g, tx));
  }
  // (the stairs up to the hold at the west end)
  if (shown(state, B - 220, B + 140)) stamp(c, 'sp-q-stairs', B - 220, CEIL_B, 360, BF - CEIL_B + 4, g => {
    g.fillStyle = '#0A0A0F'; g.fillRect(B - 200, CEIL_B, 200, BF - CEIL_B);
    for (let k = 0; k < 14; k++) { g.fillStyle = '#27272A'; g.fillRect(B - 200 + k * 14, BF - k * 34 - 10, 40, 10); g.fillStyle = '#52525B'; g.fillRect(B - 200 + k * 14, BF - k * 34 - 10, 40, 2); }
    ink(g, () => g.roundRect(STAIRS_X - 50, BF - 250, 110, 40, 4), '#14532D', 2);
    g.fillStyle = '#4ADE80'; g.font = '7px "Press Start 2P"'; g.fillText('EXIT ^ THE HOLD', STAIRS_X - 44, BF - 226);
  });
  // (the hole in the ceiling he came down through: its broken edges, the hold's light down it; the rubble under it)
  if (o.fell && shown(state, HOLE.a - 120, HOLE.b + 120)) {
    c.fillStyle = 'rgba(167, 139, 250, 0.10)'; c.beginPath(); c.moveTo(HOLE.a, CEIL_B); c.lineTo(HOLE.b, CEIL_B); c.lineTo(HOLE.b + 50, BF); c.lineTo(HOLE.a - 50, BF); c.closePath(); c.fill();
    box(c, HOLE.a, GY - 2, HOLE.b - HOLE.a, CEIL_B - GY + 2, '#120A1E');
    for (let x = HOLE.a; x < HOLE.b; x += 10) { const d = 4 + ((x * 13) % 9); box(c, x, CEIL_B - 2, 10, d, '#3F3F46'); box(c, x, GY - 2, 10, 3 + ((x * 7) % 5), '#3F3F46'); }
    for (const ex of [HOLE.a, HOLE.b]) limb(c, ex, CEIL_B - 8, ex + (ex === HOLE.a ? 10 : -10), CEIL_B + 6, 2, '#7C2D12');
    if (o.landed) {
      // (the rubble: the slabs where they came down, chunks, dust)
      SLABS.forEach((sl, i) => { const ps = slabPose(sl, i, 1); drawSlab(c, ps.x, ps.y, sl.w, ps.r); });
      for (let i = 0; i < 9; i++) box(c, HOLE.a - 50 + i * 26 + ((i * 17) % 9), BF - 6 - (i % 3) * 3, 8 + (i % 3) * 4, 6 + (i % 2) * 3, i % 2 ? '#52525B' : '#3F3F46');
    }
  }
  // (the graveyard: heaps of the broken animatronics, the old show's leftovers)
  if (shown(state, GRAVE.a, GRAVE.b)) stamp(c, 'sp-q-grave', GRAVE.a, BF - 200, GRAVE.b - GRAVE.a, 204, g => {
    g.fillStyle = '#FFFFFF'; g.font = '8px "Press Start 2P"'; g.fillText('PROP STORAGE - DO NOT FEED', GRAVE.a + 620, BF - 190);
    for (let i = 0; i < 9; i++) {
      const x = GRAVE.a + 60 + i * 110 + hash(i) * 40, rot = (hash(i + 4) - 0.5) * 2.4;
      g.save(); g.translate(x, BF - 6); g.rotate(rot); g.globalAlpha = 0.75; drawCheapGreen(g, 0, 0, i * 9, 0.7, i % 3 ? 'limp' : 'boo'); g.restore();
    }
    g.globalAlpha = 1;
    ink(g, () => g.ellipse(GRAVE.a + 520, BF - 20, 40, 20, 0, 0, Math.PI * 2), '#D6D3D1');
    g.fillStyle = '#18181B'; g.fillRect(GRAVE.a + 504, BF - 30, 14, 10);
    ink(g, () => g.ellipse(GRAVE.a + 820, BF - 30, 70, 16, -0.2, 0, Math.PI * 2), '#71717A');
    ink(g, () => g.rect(GRAVE.a + 940, BF - 60, 80, 60), '#78350F');
    for (let k = 0; k < 3; k++) { g.fillStyle = '#16A34A'; g.beginPath(); g.ellipse(GRAVE.a + 956 + k * 24, BF - 64, 10, 12, 0, 0, Math.PI * 2); g.fill(); }
  });
  // (the catwalks: grating on struts, their lit top lip (stand on them); the pipe runs half way up, lit tops)
  for (const [ca, cb] of CATWALKS) {
    if (!shown(state, ca, cb)) continue;
    stamp(c, `sp-q-cw-${ca}`, ca - 4, CATWALK_Y - 34, cb - ca + 8, BF - CATWALK_Y + 36, g => {
      for (let x = ca + 30; x < cb; x += 150) { g.fillStyle = '#18181D'; g.fillRect(x, CATWALK_Y + 10, 8, BF - CATWALK_Y - 10); g.fillStyle = '#2A2A33'; g.fillRect(x, CATWALK_Y + 10, 2, BF - CATWALK_Y - 10); }
      // (the rail, the grating, the lip)
      for (let x = ca; x <= cb; x += 50) { g.fillStyle = '#3F3F4C'; g.fillRect(x, CATWALK_Y - 30, 3, 30); }
      g.fillStyle = '#3F3F4C'; g.fillRect(ca, CATWALK_Y - 30, cb - ca, 3); g.fillRect(ca, CATWALK_Y - 16, cb - ca, 2);
      g.fillStyle = '#26262E'; g.fillRect(ca, CATWALK_Y, cb - ca, 12);
      for (let x = ca; x < cb; x += 6) { g.fillStyle = '#121216'; g.fillRect(x, CATWALK_Y + 3, 3, 8); }
      g.fillStyle = '#9CA3AF'; g.fillRect(ca, CATWALK_Y, cb - ca, 2);
      g.fillStyle = '#5B5B66'; g.fillRect(ca, CATWALK_Y + 2, cb - ca, 1);
    });
  }
  for (const [px, pw] of PIPES) {
    if (!shown(state, px, px + pw)) continue;
    box(c, px, PIPE_Y, pw, 14, '#3B2A1E'); box(c, px, PIPE_Y + 9, pw, 5, '#2A1D14'); box(c, px, PIPE_Y, pw, 2, '#C2885A');
    box(c, px + 8, PIPE_Y + 14, 8, BF - PIPE_Y - 14, '#2A1D14'); box(c, px + pw - 16, PIPE_Y + 14, 8, BF - PIPE_Y - 14, '#2A1D14');
  }
  // (the vents in the ceiling, the ducts in the back wall: where she comes and goes)
  for (const vx of VENTS) if (shown(state, vx - 40, vx + 40)) { box(c, vx - 30, CEIL_B - 2, 60, 9, '#050507'); for (let s = 0; s < 6; s++) box(c, vx - 28 + s * 10, CEIL_B - 2, 3, 9, '#2A2A33'); }
  for (const dx of DUCTS) if (shown(state, dx - 40, dx + 40)) { box(c, dx - 34, BF - 74, 68, 50, '#2A2A33'); box(c, dx - 30, BF - 70, 60, 42, '#030305'); for (let s = 0; s < 5; s++) box(c, dx - 28 + s * 12, BF - 70, 3, 42, '#1C1C24'); }
  drawStairsUp(c, state);
};

const paintTunnel = (g: Ctx, tx: number) => {
  for (let x = tx; x < tx + 400; x += 8) {
    const col = x - B;
    // (the hold's floor slab overhead: its underside the ceiling)
    g.fillStyle = '#0B0B0F'; g.fillRect(x, TOP, 8, CEIL_B - TOP);
    g.fillStyle = '#1A1A20'; g.fillRect(x, CEIL_B - 3, 8, 3);
    if (x >= STAIRS_A - 40) continue;
    // (concrete block, in courses; damp stains; the floor, wet)
    g.fillStyle = Math.floor(col / 64) % 2 ? '#1C1C22' : '#202027'; g.fillRect(x, CEIL_B, 8, BF - CEIL_B);
    for (let y = CEIL_B + 20; y < BF; y += 32) { g.fillStyle = '#141419'; g.fillRect(x, y, 8, 2); }
    if (hash(Math.floor(col / 96)) < 0.4) { g.fillStyle = 'rgba(30, 58, 40, 0.35)'; g.fillRect(x, CEIL_B + 40, 8, 90 + hash(col) * 80); }
    g.fillStyle = '#121216'; g.fillRect(x, BF, 8, BOT - BF); g.fillStyle = '#3A3A44'; g.fillRect(x, BF, 8, 2);
    // (the runs along the wall: a fat pipe up top, two thin ones, a cable tray; the lower run near the floor)
    g.fillStyle = '#2A2A33'; g.fillRect(x, CEIL_B + 24, 8, 22); g.fillStyle = '#3F3F4C'; g.fillRect(x, CEIL_B + 24, 8, 3);
    g.fillStyle = '#3B2A1E'; g.fillRect(x, CEIL_B + 58, 8, 8);
    g.fillStyle = '#18181D'; g.fillRect(x, CEIL_B + 80, 8, 4);
    g.fillStyle = '#1E2830'; g.fillRect(x, BF - 120, 8, 6);
  }
  // (every so often: a valve wheel, a ride motor, a stencil, a puddle)
  for (let k = Math.ceil((tx - B) / 260); k * 260 + B < tx + 400; k++) {
    const x = B + k * 260 + 40;
    if (x < tx - 40 || x > STAIRS_A - 80) continue;
    const kind = k % 4;
    if (kind === 0) { g.strokeStyle = '#7F1D1D'; g.lineWidth = 3; g.beginPath(); g.arc(x, CEIL_B + 35, 10, 0, Math.PI * 2); g.stroke(); }
    if (kind === 1) { ink(g, () => g.rect(x - 30, BF - 80, 60, 80), '#27272A', 2); g.strokeStyle = '#3F3F46'; g.lineWidth = 4; g.beginPath(); g.arc(x, BF - 40, 20, 0, Math.PI * 2); g.stroke(); }
    if (kind === 2) { g.fillStyle = '#A16207'; g.font = '7px "Press Start 2P"'; g.fillText(['CAST MEMBERS ONLY', 'B-LEVEL', 'NO RUNNING', 'XENOSCARE MAINT'][Math.floor(k / 4) % 4], x - 50, CATWALK_Y - 60); }
    if (kind === 3) { g.fillStyle = 'rgba(100, 116, 139, 0.25)'; g.beginPath(); g.ellipse(x, BF + 2, 40, 3, 0, 0, Math.PI * 2); g.fill(); }
  }
};

/** The long flight up at the east end: concrete steps (lit noses), a rail, the stairwell's wall going up into the dark
 *  toward the park, the sign, the disco's light down it from the top. */
const drawStairsUp = (c: Ctx, state: GameState) => {
  if (!shown(state, STAIRS_A - 100, DOOR_X + 100)) return;
  stamp(c, 'sp-q-stairsup', STAIRS_A - 60, GY - 300, DOOR_X - STAIRS_A + 160, BF - GY + 600, g => {
    const n = 28, run = (STAIRS_B - STAIRS_A) / n, rise = (BF - GY) / n;
    // (the stairwell: its wall, block courses, darker going down)
    for (let x = STAIRS_A - 40; x < DOOR_X + 100; x += 8) {
      g.fillStyle = Math.floor((x - STAIRS_A) / 64) % 2 ? '#1F1A26' : '#231D2B'; g.fillRect(x, GY - 300, 8, BF - GY + 300);
      for (let y = GY - 280; y < BF; y += 32) { g.fillStyle = '#15111B'; g.fillRect(x, y, 8, 2); }
    }
    g.fillStyle = 'rgba(0, 0, 0, 0.45)'; g.fillRect(STAIRS_A - 40, GY + 200, STAIRS_B - STAIRS_A + 40, BF - GY - 200);
    // (the steps: under them solid, each tread's nose lit)
    for (let k = 0; k < n; k++) {
      const x = STAIRS_A + k * run, y = BF - (k + 1) * rise;
      g.fillStyle = '#2A2A33'; g.fillRect(x, y, run + 1, BF - y + 300);
      g.fillStyle = '#4B4B57'; g.fillRect(x, y, run + 1, 3);
      g.fillStyle = '#A1A1AA'; g.fillRect(x, y, run + 1, 1);
    }
    // (the landing at the top, the floor on to the door)
    g.fillStyle = '#2A2A33'; g.fillRect(STAIRS_B, GY, DOOR_X - STAIRS_B + 100, 300); g.fillStyle = '#A1A1AA'; g.fillRect(STAIRS_B, GY, DOOR_X - STAIRS_B + 100, 2);
    // (the handrail up it)
    g.strokeStyle = '#71717A'; g.lineWidth = 3; g.beginPath(); g.moveTo(STAIRS_A, BF - 60); g.lineTo(STAIRS_B, GY - 60); g.lineTo(DOOR_X - 90, GY - 60); g.stroke();
    for (let k = 0; k <= n; k += 4) { const x = STAIRS_A + k * run; g.fillStyle = '#52525B'; g.fillRect(x, BF - k * rise - 60, 3, 60); }
    // (the sign, up on the wall at the foot of it, clear of the rail)
    const sx = STAIRS_A + 20, sy = BF - 470;
    ink(g, () => g.roundRect(sx, sy, 200, 40, 4), '#14532D', 2);
    g.fillStyle = '#4ADE80'; g.font = '7px "Press Start 2P"'; g.fillText('PARK LEVEL ^', sx + 50, sy + 18); g.fillText('GALACTIC GROOVE', sx + 46, sy + 32);
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The space disco: GALACTIC GROOVE

/** The booth's operators: at the controls; after her, fists shaking, stomping; running out the back; gone. */
export interface BoothOps { mode: 'on' | 'mad' | 'run' | 'gone'; t: number }

export const drawDisco = (c: Ctx, state: GameState, o: { lights: number; ops: BoothOps | null; extinguisher: boolean }) => {
  if (!shown(state, DISCO_L - 60, DISCO_R + 60)) return;
  const f = state.frame, W = DISCO_R - DISCO_L;
  // (the hall's walls, in screen-wide tiles (it's wide))
  for (let tx = DISCO_L - 40; tx < DISCO_R + 40; tx += 400) {
    if (!shown(state, tx, tx + 400)) continue;
    stamp(c, `sp-q-disco-${tx - DISCO_L}`, tx, GY - 600, 400, 604, g => {
      g.fillStyle = '#12051F'; g.fillRect(tx, GY - 600, 400, 600);
      for (let i = 0; i < 60; i++) { g.fillStyle = i % 4 ? '#7C3AED' : '#F0ABFC'; g.fillRect(tx + hash(i + tx) * 400, GY - 590 + hash(i + 9 + tx) * 440, 2, 2); }
      // (a mural band: purple swooshes, stars)
      g.fillStyle = '#2E1065'; g.fillRect(tx, GY - 200, 400, 30); g.fillStyle = '#4C1D95'; g.fillRect(tx, GY - 200, 400, 4);
    });
  }
  stamp(c, 'sp-q-disco-fix', DISCO_L - 40, GY - 600, W + 80, 604, g => {
    // (chrome pillars, the bar, the stools)
    for (const px of [DISCO_L + 260, DISCO_L + 1060, DISCO_L + 1560, DISCO_R - 40]) { g.fillStyle = '#A1A1AA'; g.fillRect(px, GY - 600, 30, 600); g.fillStyle = '#E4E4E7'; g.fillRect(px + 4, GY - 600, 6, 600); }
    ink(g, () => g.roundRect(DISCO_R - 300, GY - 90, 240, 90, 6), '#4C1D95', 2);
    g.fillStyle = '#F0ABFC'; g.fillRect(DISCO_R - 300, GY - 90, 240, 4);
    // (the DJ booth up on its platform: the decks, the glass, its back door; the sign)
    ink(g, () => g.rect(DJ.x - 10, DJ.y - 10, DJ.w + 20, DJ.h + 60), '#3B0764', 2);
    g.fillStyle = '#0A0510'; g.fillRect(DJ.x, DJ.y, DJ.w, DJ.h);
    g.fillStyle = '#F0ABFC'; g.font = '6px "Press Start 2P"'; g.fillText('DJ ZORP', DJ.x + 70, DJ.y + DJ.h + 20);
    limb(g, DJ.x + DJ.w / 2, DJ.y + DJ.h + 50, DJ.x + DJ.w / 2, GY, 10, '#52525B');
    // (the extinguisher's cabinet on the wall: IN CASE OF FIRE)
    ink(g, () => g.rect(EXTINGUISHER_X - 20, GY - 150, 40, 70), '#7F1D1D', 2);
    g.fillStyle = '#FECACA'; g.font = '5px "Press Start 2P"'; g.fillText('IN CASE', EXTINGUISHER_X - 18, GY - 166); g.fillText('OF FIRE', EXTINGUISHER_X - 18, GY - 158);
    // (the refill's little alcove by the door: a first-aid cabinet)
    ink(g, () => g.rect(REFILL_X - 40, GY - 150, 80, 150), '#1E1B4B', 2);
    g.fillStyle = '#F5F5F4'; g.fillRect(REFILL_X - 14, GY - 130, 28, 28); g.fillStyle = '#DC2626'; g.fillRect(REFILL_X - 3, GY - 126, 6, 20); g.fillRect(REFILL_X - 10, GY - 119, 20, 6);
  });
  // The neon: GALACTIC GROOVE, the letters chasing (over the middle of the hall)
  const word = 'GALACTIC GROOVE', on = o.lights > 0.5;
  c.font = '18px "Press Start 2P"'; c.textAlign = 'left';
  const w = c.measureText(word).width, sx = DJ.x + DJ.w / 2 - w / 2, sy = GY - 440;
  for (let i = 0; i < word.length; i++) {
    const x = sx + c.measureText(word.slice(0, i)).width;
    c.fillStyle = '#000'; c.fillText(word[i], x + 2, sy + 2);
    c.fillStyle = on ? ((i + Math.floor(f / 5)) % 4 === 0 ? '#FDE047' : i < 9 ? '#F472B6' : '#22D3EE') : '#3F3F46'; c.fillText(word[i], x, sy);
  }
  // The floor: light-up tiles, cycling (dark till the lights come up)
  const cols = ['#EC4899', '#8B5CF6', '#22D3EE', '#FDE047', '#22C55E'];
  const n = Math.floor((W - 60) / 36);
  for (let i = 0; i < n; i++) {
    const x = DISCO_L + 40 + i * 36;
    if (!shown(state, x, x + 36)) continue;
    const k = (i + Math.floor(f / 12)) % 5, lit = on && (i * 7 + Math.floor(f / 12)) % 3 !== 0;
    box(c, x, GY - 2, 34, 4, lit ? cols[k] : '#27272A');
  }
  // The mirror ball, turning, the sparkles thrown about
  const bx = BALL.x, by = BALL.y;
  if (shown(state, bx - 400, bx + 400)) {
    limb(c, bx, GY - 600, bx, by - 24, 2, '#A1A1AA');
    ink(c, () => c.arc(bx, by, 24, 0, Math.PI * 2), '#CBD5E1', 1.5);
    for (let r = -2; r <= 2; r++) for (let q = -3; q <= 3; q++) { const px = bx + q * 6 + ((f / 4) % 6), py = by + r * 7; if (Math.hypot(px - bx, py - by) < 21) box(c, px - 2, py - 2, 4, 4, (q + r + Math.floor(f / 4)) % 3 ? '#F1F5F9' : '#94A3B8'); }
    if (on) for (let i = 0; i < 18; i++) { const a = f * 0.02 + i * 0.45, d = 120 + (i % 5) * 90; box(c, bx + Math.cos(a) * d * 1.4, by + Math.sin(a) * d * 0.6 + 120, 3, 3, i % 3 ? '#F8FAFC' : '#F0ABFC'); }
  }
  // The DJ booth: the two of them in there (headsets on, working her), or losing it after, or gone out the back
  if (shown(state, DJ.x - 40, DJ.x + DJ.w + 40)) {
    c.save(); c.beginPath(); c.rect(DJ.x, DJ.y, DJ.w, DJ.h); c.clip();
    c.fillStyle = 'rgba(74, 222, 128, 0.18)'; c.fillRect(DJ.x, DJ.y, DJ.w, DJ.h);
    // (the back door out of it, at the right: open once they've run)
    const ops = o.ops, open = !ops || ops.mode === 'run' || ops.mode === 'gone';
    box(c, DJ.x + DJ.w - 44, DJ.y + 8, 34, DJ.h - 8, open ? '#020103' : '#4C1D95');
    if (!open) box(c, DJ.x + DJ.w - 18, DJ.y + 40, 4, 6, '#FDE047');
    if (ops && ops.mode !== 'gone') for (let i = 0; i < 2; i++) {
      let x = DJ.x + 50 + i * 100, bob = 0;
      let pose: AlienPose = 'operate', face = 1;
      if (ops.mode === 'mad') {
        // (fists shaking at him through the glass, stomping)
        pose = (ops.t + i * 5) % 12 < 6 ? 'point' : 'tell'; bob = (ops.t + i * 3) % 10 < 5 ? -3 : 0;
        x += Math.sin(ops.t * 0.9 + i) * 2;
      } else if (ops.mode === 'run') {
        // (out the back door, scrambling, one after the other)
        pose = 'run'; x += Math.max(0, ops.t - i * 10) * 6;
      }
      if (x > DJ.x + DJ.w - 20) continue;
      c.save(); c.translate(x, DJ.y + DJ.h + 50 + bob); c.scale(face, 1);
      drawAlien(c, { seed: 201 + i * 7, headset: true, woman: i === 1 }, pose, f + i * 9, 0.85);
      c.restore();
    }
    box(c, DJ.x, DJ.y + DJ.h - 12, DJ.w, 12, '#3F3F46');
    for (let i = 0; i < 2; i++) { c.strokeStyle = '#18181B'; c.lineWidth = 2; c.beginPath(); c.arc(DJ.x + 60 + i * 80, DJ.y + DJ.h - 6, 8, f * 0.2, f * 0.2 + 5); c.stroke(); }
    // (the dust cloud they leave out the back)
    if (ops && ops.mode === 'run' && ops.t > 6) for (let k = 0; k < 6; k++) { const u = ((ops.t - 6) * 0.04 + k * 0.17) % 1; c.fillStyle = `rgba(214, 211, 209, ${(0.55 * (1 - u)).toFixed(2)})`; c.beginPath(); c.ellipse(DJ.x + DJ.w - 40 - u * 60 + k * 6, DJ.y + DJ.h - 20 - u * 20 + (k % 3) * 6, 10 + u * 14, 8 + u * 8, 0, 0, Math.PI * 2); c.fill(); }
    c.restore();
  }
};

/** The shutter inside the disco's door: a heavy steel roll-down, hazard stripes along its foot (0 up, 1 down). World. */
export const drawShutter = (c: Ctx, state: GameState, k: number) => {
  if (k <= 0 || !shown(state, DISCO_L - 60, DISCO_L + 20)) return;
  const x = DISCO_L - 32, w = 36, top = GY - 212, h = Math.round(212 * k);
  box(c, x - 4, top - 14, w + 8, 14, '#27272A'); box(c, x - 4, top - 14, w + 8, 2, '#71717A');
  box(c, x, top, w, h, '#52525B');
  for (let y = top + 4; y < top + h - 10; y += 10) { box(c, x, y, w, 2, '#3F3F46'); box(c, x, y + 2, w, 1, '#A1A1AA'); }
  // (its foot: the hazard stripes)
  for (let i = 0; i < 6; i++) box(c, x + i * 6, top + h - 10, 6, 10, i % 2 ? '#18181B' : '#FACC15');
  box(c, x, top + h - 1, w, 1, '#0A0A0A');
};

/** The hall's light: dark till they come up; colored spots sweeping, the ball's glow. */
export const discoLighting = (state: GameState, lights: number): SceneLight => {
  const f = state.frame, ls: Light[] = [], W = DISCO_R - DISCO_L;
  const cols = ['rgba(236, 72, 153, 0.14)', 'rgba(34, 211, 238, 0.14)', 'rgba(253, 224, 71, 0.12)', 'rgba(139, 92, 246, 0.14)'];
  for (let i = 0; i < 8; i++) ls.push({ x: DISCO_L + 120 + ((i * 260 + f * 2) % (W - 200)), y: GY - 60, r: 160, a: 0.8 * lights, color: cols[i % 4] });
  ls.push({ x: BALL.x, y: BALL.y, r: 120, a: 0.7 * lights });
  ls.push({ x: DJ.x + DJ.w / 2, y: DJ.y + DJ.h / 2, r: 150, a: 0.7, color: 'rgba(74, 222, 128, 0.1)' });
  ls.push({ x: DOOR_X, y: GY - 100, r: 160, a: 0.6 });
  ls.push({ x: state.player.pos.x + 20, y: state.player.pos.y + 30, r: 130, a: 0.5 });
  void LAND_X; void label;
  return { dark: 0.75 - 0.4 * lights, shade: [16, 4, 30], lights: ls, rim: 0.5 };
};
void ALIEN;
