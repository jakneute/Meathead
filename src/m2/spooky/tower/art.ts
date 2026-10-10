// The clock tower, painted (crude: the first pass, boxes and words): the loading bay, the tower's insides floor by
// floor, the shaft up the middle with the car in it, the works (gears, pendulums, cuckoo clocks), the beams, the clock
// room at the top (the clock face from behind, the bell), the ride's "hell" under the foot of it (and, once it's broken
// through, the real one glowing up out of the hole).

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { box, label, postSign, wallSign, doorway, groundBox, ledgeBox } from '../section';
import { drawPerson } from '../../adventure/temple/people';
import {
  x0, MIST_DOOR_X, WAIT_SIGN_X, HOW_BOARD_X, QUEUE_X0, QUEUE_X1, BOOTH_X, PLATFORM_X0, PLATFORM_X1, STAFF_DOOR_X, BAY_TOP,
  TX0, TX1, WALL, SH0, SH1, DOOR_H, F, STORIES, SLAB, TOP, ROOF, B1, LEDGES, BEAMS, beamTop, GEARS, PENDULUMS, CUCKOOS, GALLERY, slabRuns,
} from './layout';
import { GY } from '../geometry';
import { gearAt, drawGear, drawPendulum } from './hazards';
import { drawCar, type Ride } from './ride';

type Ctx = CanvasRenderingContext2D;

export interface TowerLook {
  ride: Ride; broken: number; beamHp: number[]; crashed: boolean;
  /** The nets still across the shaft (by floor), the grate over it at the foot, the ride's hell's floor. */
  nets: boolean[]; grate: boolean; b1: boolean;
  /** The operator: talking. */
  opTalking: boolean;
}

const STONE = '#26222C', STONE_D = '#1A171F', MORTAR = '#332E3B';
const SLAB_FILL = '#3F2A14', SLAB_LIP = '#D97706';

/** What of the world's on screen (with room for the sway). */
const viewOf = (state: GameState) => {
  const v = state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: CANVAS_HEIGHT };
  return { x0: v.x - 160, x1: v.x + v.w + 160, y0: v.y - 160, y1: v.y + v.h + 160 };
};

export const drawTowerBackdrop = (c: Ctx) => { box(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#0B0910'); };

// ---------------------------------------------------------------------------------------------------------------
// The loading bay

const QUEUE_PEOPLE = Array.from({ length: 14 }, (_, i) => ({ seed: 4001 + i * 211, x: QUEUE_X0 + 30 + i * 46 + (i % 3) * 6, row: i % 2 }));

const drawBay = (c: Ctx, state: GameState, look: TowerLook) => {
  const f = state.frame;
  // the room: red wallpaper (stripes), a black ceiling with its trusses, the floor
  box(c, x0 - 300, BAY_TOP - 400, TX0 - x0 + 300, GY - BAY_TOP + 400, '#1A0606');
  box(c, x0 - 300, BAY_TOP, TX0 - x0 + 300, GY - BAY_TOP, '#4A0E0E');
  for (let x = x0 - 300; x < TX0; x += 48) box(c, x, BAY_TOP, 16, GY - BAY_TOP, '#3B0A0A');
  box(c, x0 - 300, BAY_TOP - 30, TX0 - x0 + 300, 40, '#0C0A09');
  for (let x = x0 - 260; x < TX0; x += 240) box(c, x, BAY_TOP + 10, 20, 40, '#1C1917');
  // (fake torches: flame-shaped bulbs)
  for (let x = x0 + 180; x < TX0 - 100; x += 360) { box(c, x - 4, GY - 300, 8, 24, '#44403C'); box(c, x - 6, GY - 316 + (f >> 3) % 2, 12, 16, '#F97316'); box(c, x - 3, GY - 312, 6, 8, '#FDE047'); }
  // the way back to the hallway
  doorway(c, MIST_DOOR_X + 10, GY, 'HALLWAY');
  postSign(c, WAIT_SIGN_X, GY, 'WAIT FROM HERE: 45 MIN', '#450A0A', '#FDBA74');
  // HOW THE RIDE WORKS: a board on the wall, four panels
  const hx = HOW_BOARD_X, hy = GY - 360;
  box(c, hx - 214, hy - 6, 428, 196, '#000000'); box(c, hx - 210, hy - 2, 420, 188, '#1C1917');
  label(c, 'HOW THE RIDE WORKS', hx, hy + 18, '#FDE68A', 10);
  const panels: [string, string][] = [['1. BOARD', 'THE CAR'], ['2. UP THE', 'CLOCK TOWER'], ['3. DROP TO', 'HELL!'], ['4. EXIT THRU', 'GIFT SHOP']];
  panels.forEach(([a, b], i) => {
    const px = hx - 200 + i * 100;
    box(c, px, hy + 30, 92, 110, '#292524');
    // (the little picture in each)
    if (i === 0) { box(c, px + 30, hy + 70, 34, 30, '#B45309'); box(c, px + 40, hy + 58, 12, 12, '#F0C8A2'); }
    if (i === 1) { box(c, px + 36, hy + 40, 22, 66, '#57534E'); box(c, px + 38, hy + 48, 18, 18, '#FDE68A'); box(c, px + 40, hy + 86, 14, 12, '#B45309'); box(c, px + 45, hy + 70, 4, 14, '#FBBF24'); }
    if (i === 2) { box(c, px + 18, hy + 100, 58, 14, '#DC2626'); box(c, px + 30, hy + 84, 6, 16, '#F97316'); box(c, px + 52, hy + 88, 6, 12, '#F97316'); box(c, px + 36, hy + 44, 22, 18, '#B45309'); box(c, px + 45, hy + 64, 4, 18, '#FBBF24'); }
    if (i === 3) { box(c, px + 20, hy + 60, 54, 44, '#7F1D1D'); box(c, px + 30, hy + 74, 10, 10, '#FDE68A'); box(c, px + 54, hy + 74, 10, 10, '#FDE68A'); label(c, '$', px + 47, hy + 98, '#4ADE80', 8); }
    label(c, a, px + 46, hy + 156, '#E7E5E4', 6); label(c, b, px + 46, hy + 168, '#FCA5A5', 6);
  });
  label(c, 'RIDERS MUST BE THIS WICKED TO RIDE', hx, hy + 182, '#A8A29E', 6);
  // the queue: rails (switchbacks) and the people in line behind them
  for (const row of [0, 1]) {
    const y = GY - 40 - row * 14;
    QUEUE_PEOPLE.filter(q => q.row === row).forEach(q => {
      c.save(); c.translate(q.x, y); c.scale(row ? 0.72 : 0.8, row ? 0.72 : 0.8);
      drawPerson(c, { seed: q.seed, outfit: 'guest', f: f + q.seed, pose: 'stand', mood: (f + q.seed) % 400 < 40 ? 'bored' : 'happy', woman: q.seed % 5 < 2 });
      c.restore();
    });
    box(c, QUEUE_X0, y - 34, QUEUE_X1 - QUEUE_X0, 4, '#A8A29E');
    for (let x = QUEUE_X0; x <= QUEUE_X1; x += 110) box(c, x, y - 34, 4, 34, '#78716C');
  }
  // the marquee over the platform
  const mx = (PLATFORM_X0 + PLATFORM_X1) / 2;
  box(c, mx - 170, GY - 440, 340, 54, '#000000'); box(c, mx - 166, GY - 436, 332, 46, '#7F1D1D');
  for (let i = 0; i < 16; i++) box(c, mx - 160 + i * 21, GY - 432, 6, 6, (f >> 4) % 2 === i % 2 ? '#FDE047' : '#78350F');
  label(c, 'ELEVATOR TO HELL', mx, GY - 404, '#FDE68A', 12);
  box(c, mx - 150, GY - 386, 4, 30, '#3F3F46'); box(c, mx + 146, GY - 386, 4, 30, '#3F3F46');
  // the platform (raised a step, at the back), the track off it into the tower
  box(c, PLATFORM_X0, GY - 22, TX0 - PLATFORM_X0, 22, '#292524'); box(c, PLATFORM_X0, GY - 22, TX0 - PLATFORM_X0, 3, '#57534E');
  box(c, PLATFORM_X0, GY - 30, TX0 - PLATFORM_X0, 4, '#52525B');
  // the car, at the platform or rolling off it (behind the gate)
  const car = look.ride.car;
  if (car && (car.phase === 'board' || car.phase === 'roll') && car.x < TX0 + 100) drawCar(c, car, f);
  // the gate (a turnstile, a chain), and the rail along the front of the platform
  box(c, PLATFORM_X0 - 10, GY - 60, 8, 60, '#A1A1AA'); box(c, PLATFORM_X0 - 30, GY - 56, 30, 6, '#D4D4D8');
  box(c, PLATFORM_X0, GY - 50, PLATFORM_X1 - PLATFORM_X0, 4, '#D97706');
  for (let x = PLATFORM_X0 + 40; x < PLATFORM_X1; x += 80) box(c, x, GY - 50, 4, 50, '#92400E');
  // the operator's booth: him (little devil horns) behind its window
  const bx = BOOTH_X;
  box(c, bx - 50, GY - 150, 100, 150, '#57534E'); box(c, bx - 54, GY - 160, 108, 14, '#7F1D1D');
  box(c, bx - 40, GY - 130, 80, 60, '#0C4A6E');
  c.save(); c.beginPath(); c.rect(bx - 40, GY - 130, 80, 60); c.clip();
  c.save(); c.translate(bx + 4, GY - 22); c.scale(-1, 1);
  drawPerson(c, { seed: 777, outfit: 'operator', f, pose: 'stand', mood: 'bored', talking: look.opTalking });
  c.restore();
  // (the horns, on a headband)
  box(c, bx - 6, GY - 101, 5, 7, '#DC2626'); box(c, bx + 7, GY - 101, 5, 7, '#DC2626');
  c.restore();
  box(c, bx - 40, GY - 130, 80, 3, 'rgba(255,255,255,0.25)');
  box(c, bx - 50, GY - 70, 100, 8, '#44403C');
  label(c, 'OPERATOR', bx, GY - 30, '#FDE68A', 6);
  // the staff door
  box(c, STAFF_DOOR_X - 34, GY - 130, 68, 130, '#44403C'); box(c, STAFF_DOOR_X - 28, GY - 124, 56, 124, '#1C1917');
  wallSign(c, STAFF_DOOR_X, GY - 150, 'CAST MEMBERS ONLY', '#1C1917', '#FDE68A');
  // the floor (a lit lip: stand on it)
  groundBox(c, x0 - 300, TX0, GY, '#292524', '#A8A29E');
  // after: the line's no shorter (a sign hung on the marquee, hand-lettered)
  if (look.crashed) { box(c, mx - 90, GY - 380, 180, 22, '#FEF3C7'); label(c, 'NOW EVEN LONGER!', mx, GY - 365, '#7F1D1D', 7); }
};

// ---------------------------------------------------------------------------------------------------------------
// The tower

const PLAQUES = ['FLOOR 1', 'FLOOR 2', 'FLOOR 3', 'FLOOR 4', 'FLOOR 5', 'FLOOR 6', 'CLOCK ROOM'];

const drawClockFace = (c: Ctx, f: number) => {
  // the clock face from behind: a big frosted disc, the numerals backward, the hands' shafts, light through it
  const cx = TX1 - 330, cy = ROOF + 230, r = 170;
  c.fillStyle = '#0C0A09'; c.beginPath(); c.arc(cx, cy, r + 14, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#FDE68A'; c.globalAlpha = 0.35; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
  const nums = ['IIX', 'I', 'II', 'III', 'VI', 'V', 'IV', 'IIV', 'IIIV', 'XI', 'X', 'IX'];
  nums.forEach((n, i) => { const a = (i / 12) * Math.PI * 2 - Math.PI / 2; c.save(); c.translate(cx - Math.cos(a) * (r - 24), cy + Math.sin(a) * (r - 24)); c.scale(-1, 1); label(c, n, 0, 4, '#78350F', 10); c.restore(); });
  const hh = -(f / 3000) * Math.PI * 2, mm = -(f / 250) * Math.PI * 2;
  c.strokeStyle = '#1C1917'; c.lineWidth = 10; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.sin(hh) * 90, cy - Math.cos(hh) * 90); c.stroke();
  c.lineWidth = 6; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.sin(mm) * 140, cy - Math.cos(mm) * 140); c.stroke();
  box(c, cx - 12, cy - 12, 24, 24, '#57534E');
};

const drawBeam = (c: Ctx, i: number, hp: number) => {
  const b = BEAMS[i], top = beamTop(b), bot = F(b.k), h = bot - top;
  if (hp <= 0) {
    // (the stumps: a bit off the floor, a bit off the ceiling, splintered)
    box(c, b.x, bot - 22, b.w, 22, b.look === 'wood' ? '#78350F' : '#52525B');
    box(c, b.x + 4, bot - 30, 8, 8, b.look === 'wood' ? '#92400E' : '#71717A');
    box(c, b.x, top, b.w, 26, b.look === 'wood' ? '#78350F' : '#52525B');
    box(c, b.x + b.w - 12, top + 26, 8, 10, b.look === 'wood' ? '#92400E' : '#71717A');
    return;
  }
  const col = b.look === 'wood' ? '#92400E' : b.look === 'steel' ? '#64748B' : '#7C2D12';
  const edge = b.look === 'wood' ? '#B45309' : b.look === 'steel' ? '#94A3B8' : '#C2410C';
  box(c, b.x - 2, top, b.w + 4, h, '#0C0A09');
  box(c, b.x, top, b.w, h, col); box(c, b.x, top, 4, h, edge);
  if (b.look === 'steel') for (let y = top + 20; y < bot; y += 40) { box(c, b.x + 6, y, 4, 4, '#CBD5E1'); box(c, b.x + b.w - 10, y, 4, 4, '#CBD5E1'); }
  if (b.look === 'main') for (let y = top + 30; y < bot; y += 70) box(c, b.x - 4, y, b.w + 8, 8, '#44403C');
  // the cracks (the more it's taken, the more of them)
  const dmg = b.hp - hp;
  for (let j = 0; j < dmg; j++) {
    const cy = bot - 90 - j * 60;
    c.strokeStyle = '#0C0A09'; c.lineWidth = 3; c.beginPath(); c.moveTo(b.x, cy); c.lineTo(b.x + b.w * 0.5, cy + 10); c.lineTo(b.x + b.w * 0.3, cy + 22); c.lineTo(b.x + b.w, cy + 30); c.stroke();
  }
  // the plaque on it (at head height): which one it is, and the warning
  const py = bot - 110;
  box(c, b.x - 30, py - 16, b.w + 60, 30, '#000000'); box(c, b.x - 28, py - 14, b.w + 56, 26, '#FEF3C7');
  label(c, b.look === 'main' ? 'MAIN SUPPORT' : `BEAM ${i + 1} OF ${BEAMS.length}`, b.x + b.w / 2, py - 3, '#7F1D1D', 6);
  label(c, i === 0 ? 'DO NOT RAM' : b.look === 'main' ? 'SERIOUSLY' : 'LOAD-BEARING', b.x + b.w / 2, py + 8, '#1C1917', 5);
};

const drawCuckooClock = (c: Ctx, x: number, y: number) => {
  box(c, x - 26, y - 30, 52, 60, '#78350F');
  c.fillStyle = '#92400E'; c.beginPath(); c.moveTo(x - 34, y - 28); c.lineTo(x, y - 52); c.lineTo(x + 34, y - 28); c.closePath(); c.fill();
  box(c, x - 18, y - 4, 36, 26, '#FEF3C7');
  box(c, x - 1, y + 3, 2, 10, '#1C1917'); box(c, x - 1, y + 7, 9, 2, '#1C1917');
  box(c, x - 9, y - 26, 18, 18, '#1C1917');
  box(c, x - 14, y + 30, 3, 40, '#57534E'); box(c, x - 18, y + 70, 10, 16, '#A16207');
  box(c, x + 11, y + 30, 3, 26, '#57534E'); box(c, x + 7, y + 56, 10, 16, '#A16207');
};

const drawNet = (c: Ctx, y: number) => {
  // a safety net across the shaft: sagging mesh, a lit rope along its top (stand on it: it holds. For now)
  box(c, SH0, y, SH1 - SH0, 4, '#D6D3D1');
  c.strokeStyle = 'rgba(214,211,209,0.55)'; c.lineWidth = 1;
  for (let x = SH0; x <= SH1; x += 16) { c.beginPath(); c.moveTo(x, y + 4); c.lineTo(x + 8, y + 18); c.lineTo(x + 16, y + 4); c.stroke(); }
  box(c, SH0 - 6, y - 4, 8, 10, '#57534E'); box(c, SH1 - 2, y - 4, 8, 10, '#57534E');
};

export const drawTowerBack = (c: Ctx, state: GameState, look: TowerLook) => {
  const v = viewOf(state), f = state.frame;
  if (v.x0 < TX0 + 40 && v.y1 > BAY_TOP - 400) drawBay(c, state, look);
  if (v.x1 < TX0 - WALL) return;
  // The outside of the tower, round it (what shows past the walls, swaying)
  box(c, TX0 - WALL, Math.max(ROOF - 400, v.y0), TX1 - TX0 + 400 + WALL, Math.min(GY + 1600, v.y1) - Math.max(ROOF - 400, v.y0), STONE_D);
  // The back wall: stone, its courses
  const y0 = Math.max(ROOF, v.y0), y1 = Math.min(GY, v.y1);
  if (y1 > y0) {
    box(c, TX0, y0, TX1 - TX0, y1 - y0, STONE);
    for (let y = Math.ceil(y0 / 40) * 40; y < y1; y += 40) box(c, TX0, y, TX1 - TX0, 3, MORTAR);
    for (let y = Math.ceil(y0 / 80) * 80; y < y1; y += 80) for (let x = TX0 + 60; x < TX1; x += 120) { box(c, x, y, 3, 40, MORTAR); box(c, x + 60, y + 40, 3, 40, MORTAR); }
  }
  // the clock room: the clock face from behind, the bell up in its gallery
  if (v.y0 < TOP) {
    drawClockFace(c, f);
    const bx = GALLERY[0] + 100, by = GALLERY[1] - 130;
    box(c, bx - 4, ROOF, 8, by - ROOF, '#44403C');
    c.fillStyle = '#A16207'; c.beginPath(); c.moveTo(bx - 20, by); c.lineTo(bx + 20, by); c.lineTo(bx + 46, by + 90); c.lineTo(bx - 46, by + 90); c.closePath(); c.fill();
    box(c, bx - 50, by + 86, 100, 8, '#CA8A04'); box(c, bx - 6, by + 90, 12, 14, '#57534E');
  }
  // The shaft, up the middle: darker, its rails, its lattice; the ride's "hell" a level under it
  {
    const sy0 = Math.max(ROOF, v.y0), sy1 = Math.min(B1 + 40, v.y1);
    if (sy1 > sy0) {
      box(c, SH0, sy0, SH1 - SH0, sy1 - sy0, '#0C0A0F');
      box(c, SH0 + 10, sy0, 5, sy1 - sy0, '#52525B'); box(c, SH1 - 15, sy0, 5, sy1 - sy0, '#52525B');
      for (let y = Math.ceil(sy0 / 90) * 90; y < sy1; y += 90) {
        c.strokeStyle = '#27272A'; c.lineWidth = 3; c.beginPath(); c.moveTo(SH0, y); c.lineTo(SH1, y + 90); c.moveTo(SH1, y); c.lineTo(SH0, y + 90); c.stroke();
      }
    }
    // the ride's hell (cardboard flames, a red bulb, its sign), and under it the real one once it's broken through
    if (v.y1 > GY) {
      box(c, SH0 - 300, GY, SH1 - SH0 + 600, B1 - GY + 40, '#2A0A0A');
      box(c, SH0, GY + 30, SH1 - SH0, B1 - GY - 30, '#450A0A');
      for (let x = SH0 - 280; x < SH1 + 300; x += 60) { box(c, x, B1 - 50 - ((x + (f >> 3)) % 3) * 6, 26, 50, '#DC2626'); box(c, x + 6, B1 - 34, 14, 34, '#F97316'); }
      wallSign(c, SH1 + 150, GY + 150, 'HELL (FACSIMILE)', '#7F1D1D', '#FDE68A');
      wallSign(c, SH0 - 170, GY + 150, '< GIFT SHOP', '#14532D', '#BBF7D0');
      if (look.b1) groundBox(c, SH0 - 300, SH1 + 300, B1, '#3F0D0D', '#7F1D1D');
      else {
        groundBox(c, SH0 - 300, SH0, B1, '#3F0D0D', '#7F1D1D'); groundBox(c, SH1, SH1 + 300, B1, '#3F0D0D', '#7F1D1D');
        // (the real one, through the hole: a long way down, glowing)
        const glow = 0.5 + Math.sin(f * 0.08) * 0.15;
        c.fillStyle = `rgba(249,115,22,${glow})`; c.fillRect(SH0, B1, SH1 - SH0, 900);
        c.fillStyle = '#7C2D12'; c.fillRect(SH0, B1 + 900, SH1 - SH0, 400);
        // (jagged edges)
        for (let x = SH0; x < SH1; x += 14) box(c, x, B1 - 2, 10, 6 + ((x * 7) % 11), '#1C0606');
      }
    }
  }
  // the car in the shaft (behind everything of the tower's own)
  const car = look.ride.car;
  if (car && !((car.phase === 'board' || car.phase === 'roll') && car.x < TX0 + 100)) {
    c.save(); c.beginPath(); c.rect(TX0, ROOF - 50, TX1 - TX0 + 200, HELL_DEPTH); c.clip();
    drawCar(c, car, f);
    c.restore();
  }
  // the cuckoo clocks (their birds are the enemies), the wall gears
  for (const [x, y] of CUCKOOS) if (y > v.y0 && y < v.y1) drawCuckooClock(c, x, y);
  for (const g of GEARS) {
    if (g.y < v.y0 || g.y > v.y1) continue;
    const at = gearAt(g, f);
    if (g.roll) box(c, g.x - g.r, g.y + g.r - 4, g.roll + g.r * 2, 4, '#44403C');
    drawGear(c, at.x, at.y, g.r, at.a);
  }
  // The floors: slabs (a lit lip), the nets across the shaft, the grate over it at the foot; the stairwell ledges
  for (let k = 1; k <= STORIES; k++) {
    const y = F(k);
    if (y < v.y0 - 40 || y > v.y1 + 40) continue;
    for (const [a, b] of slabRuns(k)) { box(c, a, y, b - a, SLAB, SLAB_FILL); box(c, a, y, b - a, 4, SLAB_LIP); box(c, a, y + SLAB - 3, b - a, 3, '#1C1917'); }
    if (look.nets[k]) drawNet(c, y);
    // (the floor's number, on the wall at the way in)
    const left = k % 2 === 0;
    wallSign(c, left ? TX0 + 260 : TX1 - 260, y - 300, PLAQUES[k], '#1C1917', '#E7E5E4');
  }
  if (v.y1 > GY - 40 && v.y0 < GY + 40) {
    // (the ground floor's a floor like the others, the ride's hell under it seen in cutaway; solid ground past that)
    box(c, TX0 - WALL, GY, SH0 - 300 - TX0 + WALL, 1400, STONE_D); box(c, SH1 + 300, GY, TX1 + WALL - SH1 - 300, 1400, STONE_D);
    box(c, TX0 - WALL, GY, SH0 - TX0 + WALL, SLAB + 6, '#3F2A14'); box(c, TX0 - WALL, GY, SH0 - TX0 + WALL, 4, SLAB_LIP);
    box(c, SH1, GY, TX1 + WALL - SH1, SLAB + 6, '#3F2A14'); box(c, SH1, GY, TX1 + WALL - SH1, 4, SLAB_LIP);
    if (look.grate) {
      box(c, SH0, GY, SH1 - SH0, 20, '#3F3F46'); box(c, SH0, GY, SH1 - SH0, 4, '#A1A1AA');
      for (let x = SH0 + 8; x < SH1; x += 14) box(c, x, GY + 4, 6, 16, 'rgba(220,38,38,0.6)');
    } else {
      // (torn out: the edges bent down into the hole)
      box(c, SH0 - 6, GY, 10, 40, '#3F3F46'); box(c, SH1 - 4, GY, 10, 40, '#3F3F46');
    }
    wallSign(c, TX0 + 160, GY - 300, PLAQUES[0], '#1C1917', '#E7E5E4');
  }
  for (const [x, y, w] of LEDGES) if (y > v.y0 && y < v.y1) ledgeBox(c, x, y, w, '#57381A', SLAB_LIP);
  // the beams
  BEAMS.forEach((b, i) => { if (F(b.k) > v.y0 && beamTop(b) < v.y1) drawBeam(c, i, look.beamHp[i]); });
  // the pendulums
  for (const p of PENDULUMS) if (p.y < v.y1 && p.y + p.len + 40 > v.y0) drawPendulum(c, p, f);
  // The walls (the left one with the maintenance door at its foot, in from the bay), the roof
  box(c, TX0 - WALL, ROOF - 200, WALL, GY - DOOR_H - ROOF + 200, '#3B3542'); box(c, TX0 - 6, ROOF - 200, 6, GY - DOOR_H - ROOF + 200, '#4B4453');
  box(c, TX0 - WALL - 10, GY - DOOR_H - 14, WALL + 20, 14, '#57534E');
  box(c, TX1, ROOF - 200, WALL, GY - ROOF + 200, '#3B3542'); box(c, TX1, ROOF - 200, 6, GY - ROOF + 200, '#4B4453');
  box(c, TX0 - WALL, ROOF - 40, TX1 - TX0 + WALL * 2, 40, '#3B3542');
  if (v.x0 < TX0 + 200 && v.y1 > GY - 300) wallSign(c, TX0 - 40, GY - DOOR_H - 40, 'CLOCK TOWER: STAFF ONLY', '#1C1917', '#FDE68A');
};

const HELL_DEPTH = 6000;
