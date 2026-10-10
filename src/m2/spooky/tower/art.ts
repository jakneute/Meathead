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
  TX0, TX1, W, U, WALL, SH0, SH1, SHM, DOOR_H, F, STORIES, SLAB, TOP, ROOF, B1, CH0, CH1, HELL_AT, LEDGES, CHUTE_LEDGES, BEAMS, beamTop, PENDULUMS,
  CUCKOOS, GALLERY, WHOLE, WRECK, JAMS, upRight, LIFT, liftY, ROTTEN, TORN_NET, type Piece,
} from './layout';
import { GY } from '../geometry';
import { gearAt, gearsNow, drawGear, drawPendulum } from './hazards';
import { drawCar, type Ride } from './ride';

type Ctx = CanvasRenderingContext2D;

export interface TowerLook {
  ride: Ride; broken: number; beamHp: number[]; crashed: boolean;
  /** The nets still across the shaft (by floor), the grate over it at the foot, the ride's hell's floor. */
  nets: boolean[]; grate: boolean; b1: boolean;
  /** The operator: talking. */
  opTalking: boolean;
  /** The shaft's red DROP lamps going (a car coming down, after). */
  lamp: boolean;
  /** Floor 5's rotten boards (0 whole, >0 cracking, <0 gone). */
  rot: number[];
}

const STONE = '#26222C', STONE_D = '#1A171F', MORTAR = '#332E3B';

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
  for (const car of look.ride.cars) if ((car.phase === 'board' || car.phase === 'roll') && car.x < TX0 + 100) drawCar(c, car, f);
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

const INK = '#0C0A09';
const PLANK = '#5B3A1A', PLANK_D = '#3F2812', LIP = '#E59A3A';
const PLAQUES = ['FLOOR 1', 'FLOOR 2', 'FLOOR 3', 'FLOOR 4', 'FLOOR 5', 'FLOOR 6', 'CLOCK ROOM'];

/** An arrow-slit window in the back wall: the night out it, a star. */
const drawSlit = (c: Ctx, x: number, y: number) => {
  box(c, x - 14, y - 44, 28, 88, '#3B3542'); box(c, x - 8, y - 38, 16, 76, '#0B1026');
  c.fillStyle = '#0B1026'; c.beginPath(); c.arc(x, y - 38, 8, Math.PI, 0); c.fill();
  box(c, x - 2, y - 12, 2, 2, '#E0E7FF');
};
/** A bare bulb in a cage on the wall, and its glow. */
const drawLamp = (c: Ctx, x: number, y: number, f: number) => {
  const fl = (f >> 2) % 9 === 0 ? 0.04 : 0.07;
  c.fillStyle = `rgba(251,191,36,${fl})`; c.beginPath(); c.arc(x, y, 34, 0, Math.PI * 2); c.fill();
  box(c, x - 2, y - 14, 4, 8, INK); box(c, x - 6, y - 6, 12, 14, INK); box(c, x - 4, y - 4, 8, 10, '#FDE68A');
  box(c, x - 6, y - 2, 12, 1, INK); box(c, x - 1, y - 6, 2, 14, INK);
};

/** A stretch of floor: planks, a lit lip along the top, the joists under; a sagging one slopes and breaks off ragged. */
const drawPiece = (c: Ctx, k: number, p: Piece, sags: boolean) => {
  const xa = U(p[0]), xb = U(p[1]), ya = F(k) + p[2], yb = F(k) + p[3];
  c.beginPath(); c.moveTo(xa, ya); c.lineTo(xb, yb); c.lineTo(xb, yb + SLAB); c.lineTo(xa, ya + SLAB); c.closePath();
  c.fillStyle = INK; c.fill();
  c.beginPath(); c.moveTo(xa + 1, ya + 1); c.lineTo(xb - 1, yb + 1); c.lineTo(xb - 1, yb + SLAB - 3); c.lineTo(xa + 1, ya + SLAB - 3); c.closePath();
  c.fillStyle = PLANK; c.fill();
  // (the plank ends, the joists)
  for (let x = xa + 36; x < xb - 4; x += 48) { const y = ya + (yb - ya) * ((x - xa) / (xb - xa)); box(c, x, y + 5, 2, SLAB - 9, PLANK_D); box(c, x - 14, y + SLAB - 3, 8, 8, PLANK_D); }
  c.strokeStyle = LIP; c.lineWidth = 4; c.beginPath(); c.moveTo(xa, ya + 2); c.lineTo(xb, yb + 2); c.stroke();
  if (sags) {
    // (where it's torn away from the wall at its low end: splintered)
    for (let i = 0; i < 4; i++) box(c, xb - 2, yb + 2 + i * 5, 8 + (i % 2) * 6, 3, PLANK);
  }
};
/** The shaft jammed with wreckage at floor k: the car's torn-off roof (brass), girders wedged across under it. */
const drawJam = (c: Ctx, k: number) => {
  const y = F(k);
  c.strokeStyle = INK; c.lineWidth = 9; c.beginPath(); c.moveTo(SH0 - 6, y + 4); c.lineTo(SH1 + 6, y + 44); c.moveTo(SH1 + 6, y + 6); c.lineTo(SH0 - 6, y + 40); c.stroke();
  c.strokeStyle = '#71717A'; c.lineWidth = 6; c.beginPath(); c.moveTo(SH0 - 6, y + 4); c.lineTo(SH1 + 6, y + 44); c.moveTo(SH1 + 6, y + 6); c.lineTo(SH0 - 6, y + 40); c.stroke();
  box(c, SH0 - 4, y - 2, SH1 - SH0 + 8, 20, INK);
  box(c, SH0 - 2, y, SH1 - SH0 + 4, 16, '#B45309');
  for (let x = SH0 + 8; x < SH1; x += 24) box(c, x, y + 4, 10, 8, '#92400E');
  box(c, SH0 - 2, y, SH1 - SH0 + 4, 4, '#FBBF24');
  // (a rider's shoe left up here; a bit of torn net hanging)
  box(c, SH0 + 30, y - 6, 12, 6, '#7F1D1D');
  c.strokeStyle = 'rgba(214,211,209,0.6)'; c.lineWidth = 1; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(SH1 - 10 - i * 8, y + 16); c.lineTo(SH1 - 14 - i * 8, y + 44 + i * 6); c.stroke(); }
};
const drawNet = (c: Ctx, y: number) => {
  // a safety net across the shaft: sagging mesh, a lit rope along its top (stand on it: it holds. For now)
  box(c, SH0, y, SH1 - SH0, 4, '#D6D3D1');
  c.strokeStyle = 'rgba(214,211,209,0.55)'; c.lineWidth = 1;
  for (let x = SH0; x <= SH1; x += 16) { c.beginPath(); c.moveTo(x, y + 4); c.lineTo(x + 8, y + 18); c.lineTo(x + 16, y + 4); c.stroke(); }
  box(c, SH0 - 6, y - 4, 8, 10, '#57534E'); box(c, SH1 - 2, y - 4, 8, 10, '#57534E');
};
/** The ride's red DROP lamps on the shaft's rails, at every floor: lit (and flashing) while a car's coming down. */
const drawShaftLamps = (c: Ctx, k: number, on: boolean, f: number) => {
  const y = F(k) - 70, lit = on && (f >> 3) % 2 === 0;
  for (const x of [SH0 - 12, SH1 + 2]) {
    if (lit) { c.fillStyle = 'rgba(239,68,68,0.25)'; c.beginPath(); c.arc(x + 5, y + 6, 40, 0, Math.PI * 2); c.fill(); }
    box(c, x - 1, y - 1, 12, 16, INK); box(c, x, y, 10, 14, lit ? '#F87171' : '#450A0A'); box(c, x + 2, y + 2, 3, 3, lit ? '#FEE2E2' : '#7F1D1D');
  }
};

const drawClockFace = (c: Ctx, f: number, crashed: boolean) => {
  // the clock face from behind: a big frosted disc, the numerals backward, the hands' shafts, light through it
  const cx = U(760), cy = ROOF + 230, r = 170;
  c.fillStyle = INK; c.beginPath(); c.arc(cx, cy, r + 14, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#FDE68A'; c.globalAlpha = 0.35; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
  const nums = ['IIX', 'I', 'II', 'III', 'VI', 'V', 'IV', 'IIV', 'IIIV', 'XI', 'X', 'IX'];
  nums.forEach((n, i) => { const a = (i / 12) * Math.PI * 2 - Math.PI / 2; c.save(); c.translate(cx - Math.cos(a) * (r - 24), cy + Math.sin(a) * (r - 24)); c.scale(-1, 1); label(c, n, 0, 4, '#78350F', 10); c.restore(); });
  // (after: stopped, and cracked across)
  const hh = crashed ? 2.2 : -(f / 3000) * Math.PI * 2, mm = crashed ? -0.4 : -(f / 250) * Math.PI * 2;
  c.strokeStyle = '#1C1917'; c.lineWidth = 10; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.sin(hh) * 90, cy - Math.cos(hh) * 90); c.stroke();
  c.lineWidth = 6; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.sin(mm) * 140, cy - Math.cos(mm) * 140); c.stroke();
  box(c, cx - 12, cy - 12, 24, 24, '#57534E');
  if (crashed) { c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(cx - 150, cy - 60); c.lineTo(cx - 40, cy - 10); c.lineTo(cx + 10, cy + 40); c.lineTo(cx + 120, cy + 100); c.moveTo(cx - 40, cy - 10); c.lineTo(cx - 20, cy - 120); c.stroke(); }
};

const drawBeam = (c: Ctx, i: number, hp: number) => {
  const b = BEAMS[i], top = beamTop(b), bot = F(b.k), h = bot - top;
  const wood = b.look === 'wood';
  const col = wood ? '#92400E' : b.look === 'steel' ? '#64748B' : '#7C2D12';
  const edge = wood ? '#C2410C' : b.look === 'steel' ? '#CBD5E1' : '#EA580C';
  if (hp <= 0) {
    // (the stumps: splintered off the floor and the ceiling)
    box(c, b.x - 1, bot - 25, b.w + 2, 25, INK); box(c, b.x, bot - 24, b.w, 24, col);
    c.fillStyle = col; c.beginPath(); c.moveTo(b.x, bot - 24); c.lineTo(b.x + 8, bot - 40); c.lineTo(b.x + 16, bot - 26); c.lineTo(b.x + 26, bot - 36); c.lineTo(b.x + b.w, bot - 24); c.fill();
    box(c, b.x - 1, top, b.w + 2, 31, INK); box(c, b.x, top, b.w, 30, col);
    c.beginPath(); c.moveTo(b.x, top + 30); c.lineTo(b.x + 10, top + 44); c.lineTo(b.x + 20, top + 30); c.lineTo(b.x + b.w, top + 40); c.lineTo(b.x + b.w, top + 30); c.fill();
    return;
  }
  // the knee braces up into the ceiling either side (they're for the look: the post's what holds it)
  c.strokeStyle = INK; c.lineWidth = 8; c.beginPath(); c.moveTo(b.x - 46, top); c.lineTo(b.x, top + 56); c.moveTo(b.x + b.w + 46, top); c.lineTo(b.x + b.w, top + 56); c.stroke();
  c.strokeStyle = col; c.lineWidth = 5; c.beginPath(); c.moveTo(b.x - 46, top); c.lineTo(b.x, top + 56); c.moveTo(b.x + b.w + 46, top); c.lineTo(b.x + b.w, top + 56); c.stroke();
  box(c, b.x - 2, top, b.w + 4, h, INK);
  box(c, b.x, top, b.w, h, col);
  if (wood) { box(c, b.x, top, 4, h, edge); for (let y = top + 30; y < bot; y += 60) box(c, b.x + 8, y, b.w - 16, 2, '#78350F'); }
  else if (b.look === 'steel') { box(c, b.x, top, 6, h, edge); box(c, b.x + b.w - 6, top, 6, h, '#94A3B8'); box(c, b.x + b.w / 2 - 3, top, 6, h, '#475569'); for (let y = top + 20; y < bot; y += 40) { box(c, b.x + 1, y, 3, 3, INK); box(c, b.x + b.w - 4, y, 3, 3, INK); } }
  else { box(c, b.x, top, 6, h, edge); for (let y = top + 30; y < bot; y += 70) { box(c, b.x - 5, y, b.w + 10, 10, '#44403C'); box(c, b.x - 5, y, b.w + 10, 2, '#A8A29E'); } }
  // the cracks (the more it's taken, the more of them, the wider)
  const dmg = b.hp - hp;
  for (let j = 0; j < dmg; j++) {
    const cy = bot - 80 - j * 70;
    c.strokeStyle = INK; c.lineWidth = 3 + j; c.beginPath(); c.moveTo(b.x, cy); c.lineTo(b.x + b.w * 0.5, cy + 10); c.lineTo(b.x + b.w * 0.3, cy + 22); c.lineTo(b.x + b.w, cy + 30); c.stroke();
  }
  // the plaque on it (at head height): which one it is, and the warning
  const py = bot - 120;
  box(c, b.x - 30, py - 16, b.w + 60, 30, INK); box(c, b.x - 28, py - 14, b.w + 56, 26, '#FEF3C7');
  label(c, b.look === 'main' ? 'MAIN SUPPORT' : `BEAM ${i + 1} OF ${BEAMS.length}`, b.x + b.w / 2, py - 3, '#7F1D1D', 6);
  label(c, i === 0 ? 'DO NOT RAM' : b.look === 'main' ? 'SERIOUSLY' : 'LOAD-BEARING', b.x + b.w / 2, py + 8, '#1C1917', 5);
};

const drawCuckooClock = (c: Ctx, x: number, y: number) => {
  box(c, x - 27, y - 31, 54, 62, INK); box(c, x - 26, y - 30, 52, 60, '#78350F');
  c.fillStyle = INK; c.beginPath(); c.moveTo(x - 37, y - 27); c.lineTo(x, y - 55); c.lineTo(x + 37, y - 27); c.closePath(); c.fill();
  c.fillStyle = '#92400E'; c.beginPath(); c.moveTo(x - 34, y - 28); c.lineTo(x, y - 52); c.lineTo(x + 34, y - 28); c.closePath(); c.fill();
  box(c, x - 18, y - 4, 36, 26, '#FEF3C7');
  box(c, x - 1, y + 3, 2, 10, '#1C1917'); box(c, x - 1, y + 7, 9, 2, '#1C1917');
  box(c, x - 9, y - 26, 18, 18, '#1C1917');
  box(c, x - 14, y + 30, 3, 40, '#57534E'); box(c, x - 18, y + 70, 10, 16, '#A16207');
  box(c, x + 11, y + 30, 3, 26, '#57534E'); box(c, x + 7, y + 56, 10, 16, '#A16207');
};

const drawRock = (c: Ctx, x: number, y: number, w: number, h: number, seed: number) => {
  box(c, x, y, w, h, '#1C0F0B');
  for (let yy = y; yy < y + h; yy += 46) for (let xx = x + ((yy / 46) % 2) * 30; xx < x + w; xx += 64) {
    const s = (xx * 13 + yy * 7 + seed) % 5;
    box(c, xx, yy, 40 + s * 4, 30, '#2A1610'); box(c, xx, yy, 40 + s * 4, 3, '#3B2116');
  }
};

/** The ride's "hell" under the ground floor (cardboard flames, a plywood devil), the hole the car made under it, the
 *  chute down to the real one (rock, its glow coming up). */
const drawUnder = (c: Ctx, f: number, look: TowerLook, v: { y0: number; y1: number }) => {
  // the rock all round
  drawRock(c, TX0 - WALL - 300, GY + 30, W + WALL * 2 + 600, HELL_AT - GY + 200, 3);
  // B1: the room
  box(c, CH0, GY + 30, CH1 - CH0, B1 - GY - 30, '#2A0A0A');
  box(c, CH0, GY + 30, CH1 - CH0, 40, '#3F0D0D');
  for (let x = CH0 + 10; x < CH1 - 20; x += 46) {
    const hgt = 46 + ((x * 3) % 20) + Math.sin(f * 0.1 + x) * 3;
    c.fillStyle = INK; c.beginPath(); c.moveTo(x - 1, B1); c.lineTo(x + 11, B1 - hgt - 2); c.lineTo(x + 23, B1); c.fill();
    c.fillStyle = '#DC2626'; c.beginPath(); c.moveTo(x, B1); c.lineTo(x + 11, B1 - hgt); c.lineTo(x + 22, B1); c.fill();
    c.fillStyle = '#F97316'; c.beginPath(); c.moveTo(x + 5, B1); c.lineTo(x + 11, B1 - hgt * 0.55); c.lineTo(x + 17, B1); c.fill();
  }
  // (the plywood devil, waving on a stick: a cutout)
  const dx = CH0 + 60, dy = B1 - 150, wv = Math.sin(f * 0.08) * 0.15;
  c.save(); c.translate(dx, dy + 80); c.rotate(wv);
  box(c, -2, 0, 4, 70, '#78350F');
  box(c, -21, -81, 42, 82, INK); box(c, -20, -80, 40, 80, '#B91C1C'); box(c, -14, -70, 6, 6, '#FDE047'); box(c, 8, -70, 6, 6, '#FDE047'); box(c, -10, -52, 20, 4, INK);
  c.fillStyle = '#B91C1C'; c.beginPath(); c.moveTo(-20, -80); c.lineTo(-26, -100); c.lineTo(-10, -80); c.moveTo(20, -80); c.lineTo(26, -100); c.lineTo(10, -80); c.fill();
  c.restore();
  wallSign(c, CH1 - 90, GY + 110, 'HELL (FACSIMILE)', '#7F1D1D', '#FDE68A');
  wallSign(c, CH0 + 160, GY + 70, '< GIFT SHOP', '#14532D', '#BBF7D0');
  // its floor (a lit lip): whole, or broken through in the middle
  const floor = (a: number, b: number) => { box(c, a, B1, b - a, 30, '#3F0D0D'); box(c, a, B1, b - a, 4, '#F87171'); };
  if (look.b1) floor(CH0, CH1);
  else {
    floor(CH0, SH0); floor(SH1, CH1);
    for (let x = SH0; x < SH1; x += 14) box(c, x, B1 - 2, 10, 6 + ((x * 7) % 11), INK);
    // (a torn brass panel off the car, on what's left of the floor)
    box(c, SH1 + 20, B1 - 14, 44, 14, INK); box(c, SH1 + 21, B1 - 13, 42, 12, '#B45309');
  }
  // the chute (the hole the car made): rock, the glow coming up out of it, its shelves
  if (!look.b1 && v.y1 > B1) {
    const g = c.createLinearGradient(0, B1, 0, HELL_AT);
    g.addColorStop(0, '#1C0606'); g.addColorStop(1, '#C2410C');
    c.fillStyle = g; c.fillRect(CH0, B1 + 30, CH1 - CH0, HELL_AT - B1 + 200);
    for (let y = B1 + 60; y < HELL_AT + 200; y += 70) { box(c, CH0, y, 10 + ((y * 3) % 18), 50, '#1C0F0B'); box(c, CH1 - 12 - ((y * 5) % 16), y + 30, 14, 50, '#1C0F0B'); }
    for (const [x, y, w] of CHUTE_LEDGES) { box(c, x - 1, y - 1, w + 2, 20, INK); box(c, x, y, w, 18, '#3B2116'); box(c, x, y, w, 3, '#FB923C'); }
  }
};

export const drawTowerBack = (c: Ctx, state: GameState, look: TowerLook) => {
  const v = viewOf(state), f = state.frame;
  if (v.x0 < TX0 + 40 && v.y1 > BAY_TOP - 400 && v.y0 < GY + 100) drawBay(c, state, look);
  if (v.x1 < TX0 - WALL) return;
  // The outside of the tower, round it (what shows past the walls, swaying)
  box(c, TX0 - WALL, Math.max(ROOF - 400, v.y0), W + 400 + WALL, Math.min(GY + 30, v.y1) - Math.max(ROOF - 400, v.y0), STONE_D);
  // under the ground floor
  if (v.y1 > GY) drawUnder(c, f, look, v);
  // The back wall: stone, its courses; arrow slits; the lamps
  const y0 = Math.max(ROOF, v.y0), y1 = Math.min(GY, v.y1);
  if (y1 > y0) {
    box(c, TX0, y0, W, y1 - y0, STONE);
    for (let y = Math.ceil(y0 / 40) * 40; y < y1; y += 40) box(c, TX0, y, W, 3, MORTAR);
    for (let y = Math.ceil(y0 / 80) * 80; y < y1; y += 80) for (let x = TX0 + 60; x < TX1; x += 120) { box(c, x, y, 3, 40, MORTAR); box(c, x + 60, y + 40, 3, 40, MORTAR); }
    for (let k = 0; k < STORIES; k++) {
      const fy = F(k);
      if (fy < v.y0 || fy - 380 > v.y1) continue;
      drawSlit(c, U(upRight(k) ? 160 : 840), fy - 230);
      drawLamp(c, U(upRight(k) ? 480 - 160 : 680), fy - 300, f + k * 37);
    }
  }
  // the clock room: the clock face from behind, the bell up over its gallery, the winch the car's cable came off
  if (v.y0 < TOP) {
    drawClockFace(c, f, look.crashed);
    const bx = GALLERY[0] + 120, by = GALLERY[1] - 140;
    box(c, bx - 4, ROOF, 8, by - ROOF, '#44403C');
    c.fillStyle = INK; c.beginPath(); c.moveTo(bx - 22, by - 2); c.lineTo(bx + 22, by - 2); c.lineTo(bx + 49, by + 92); c.lineTo(bx - 49, by + 92); c.closePath(); c.fill();
    c.fillStyle = '#A16207'; c.beginPath(); c.moveTo(bx - 20, by); c.lineTo(bx + 20, by); c.lineTo(bx + 46, by + 90); c.lineTo(bx - 46, by + 90); c.closePath(); c.fill();
    box(c, bx - 30, by + 10, 8, 70, '#CA8A04');
    box(c, bx - 50, by + 86, 100, 8, '#CA8A04'); box(c, bx - 6, by + 90, 12, 14, '#57534E');
    // (the winch)
    box(c, SH0 - 21, ROOF + 39, SH1 - SH0 + 42, 52, INK); box(c, SH0 - 20, ROOF + 40, SH1 - SH0 + 40, 50, '#44403C');
    for (let x = SH0 - 10; x < SH1 + 20; x += 12) box(c, x, ROOF + 44, 4, 42, '#57534E');
    box(c, SHM - 3, ROOF + 90, 6, look.crashed ? 60 : 30, '#27272A');
    if (look.crashed) { box(c, SHM - 8, ROOF + 148, 16, 6, '#27272A'); box(c, SHM + 4, ROOF + 150, 4, 12, '#27272A'); }
  }
  // The shaft, up the middle: darker, its rails, its lattice
  {
    const sy0 = Math.max(ROOF, v.y0), sy1 = Math.min(GY + 30, v.y1);
    if (sy1 > sy0) {
      box(c, SH0, sy0, SH1 - SH0, sy1 - sy0, '#0C0A0F');
      box(c, SH0 + 10, sy0, 5, sy1 - sy0, '#52525B'); box(c, SH1 - 15, sy0, 5, sy1 - sy0, '#52525B');
      for (let y = Math.ceil(sy0 / 90) * 90; y < sy1; y += 90) {
        c.strokeStyle = '#27272A'; c.lineWidth = 3; c.beginPath(); c.moveTo(SH0, y); c.lineTo(SH1, y + 90); c.moveTo(SH1, y); c.lineTo(SH0, y + 90); c.stroke();
      }
    }
  }
  // the car in the shaft (behind everything of the tower's own)
  for (const car of look.ride.cars) if (!((car.phase === 'board' || car.phase === 'roll') && car.x < TX0 + 100)) {
    c.save(); c.beginPath(); c.rect(TX0, ROOF - 50, W + 200, HELL_AT - ROOF + 1000); c.clip();
    drawCar(c, car, f);
    c.restore();
  }
  // the cuckoo clocks (their birds are the enemies), the gears
  for (const [x, y] of CUCKOOS) if (y > v.y0 && y < v.y1) drawCuckooClock(c, x, y);
  for (const g of gearsNow(look.crashed)) {
    if (g.y < v.y0 || g.y > v.y1) continue;
    const at = gearAt(g, f);
    // (its axle in the wall)
    if (!g.roll) box(c, g.x - 3, g.y - 3, 6, 6, '#27272A');
    drawGear(c, at.x, at.y, g.r, at.a);
  }
  // The floors: slabs (a lit lip), the nets across the shaft (before) or the wreckage jammed in it (after); the ledges
  for (let k = 1; k <= STORIES; k++) {
    const y = F(k);
    if (y < v.y0 - 80 || y > v.y1 + 80) continue;
    for (const p of (look.crashed ? WRECK : WHOLE)[k]) drawPiece(c, k, p, p[3] !== p[2]);
    if (look.nets[k]) drawNet(c, y);
    if (!look.crashed && k === TORN_NET) { c.strokeStyle = 'rgba(214,211,209,0.6)'; c.lineWidth = 1; for (const x0 of [SH0 + 2, SH1 - 26]) for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(x0 + i * 5, y + 2); c.lineTo(x0 + i * 4 + 2, y + 30 + (i % 3) * 12); c.stroke(); } box(c, SH0 - 6, y - 4, 8, 10, '#57534E'); box(c, SH1 - 2, y - 4, 8, 10, '#57534E'); }
    if (look.crashed && JAMS.includes(k)) drawJam(c, k);
    // (floor 4, caved in: the broken planks hanging off the edge)
    if (look.crashed && k === 4) for (let i = 0; i < 5; i++) { c.save(); c.translate(U(330), y + 6); c.rotate(1.1 + i * 0.12); box(c, 0, -3, 46 + i * 9, 6, INK); box(c, 1, -2, 44 + i * 9, 4, PLANK); c.restore(); }
    if (look.crashed && k <= 5) drawShaftLamps(c, k, look.lamp, f);
    // (the floor's number, on the wall at the way in)
    wallSign(c, U(upRight(k) ? 140 : 860), y - 300, PLAQUES[k], '#1C1917', '#E7E5E4');
  }
  if (v.y1 > GY - 40 && v.y0 < GY + 60) {
    drawPiece(c, 0, [-WALL, 420, 0, 0], false); drawPiece(c, 0, [580, W + WALL, 0, 0], false);
    if (look.grate) {
      box(c, SH0, GY, SH1 - SH0, 20, '#3F3F46'); box(c, SH0, GY, SH1 - SH0, 4, '#A1A1AA');
      for (let x = SH0 + 8; x < SH1; x += 14) box(c, x, GY + 4, 6, 16, 'rgba(220,38,38,0.6)');
    } else {
      // (torn out: the edges bent down into the hole)
      for (const x of [SH0 - 2, SH1 - 8]) { box(c, x, GY, 10, 46, INK); box(c, x + 1, GY, 8, 44, '#3F3F46'); }
    }
    if (look.crashed) drawShaftLamps(c, 0, look.lamp, f);
    wallSign(c, U(140), GY - 300, PLAQUES[0], '#1C1917', '#E7E5E4');
  }
  for (const [x, y, w] of LEDGES) if (y > v.y0 && y < v.y1) ledgeBox(c, x, y, w, '#57381A', LIP);
  // floor 3's counterweight: a ton of iron on its chain, a lit lip on its top (ride it)
  if (F(LIFT.k) + 40 > v.y0 && LIFT.top - 400 < v.y1) {
    const ly = liftY(f), cx = LIFT.x + LIFT.w / 2;
    for (let y = F(LIFT.k + 1) + SLAB; y < ly; y += 10) box(c, cx - 3 + ((y / 10) % 2) * 2, y, 4, 8, '#52525B');
    box(c, LIFT.x - 1, ly - 1, LIFT.w + 2, 46, INK); box(c, LIFT.x, ly, LIFT.w, 44, '#3F3F46'); box(c, LIFT.x, ly, LIFT.w, 4, LIP);
    box(c, LIFT.x + 6, ly + 10, LIFT.w - 12, 28, '#27272A'); label(c, '1 TON', cx, ly + 29, '#A1A1AA', 8);
  }
  // floor 5's rotten boards (cracking: shaking; gone: a hole, broken ends)
  if (!look.crashed && F(ROTTEN.k) > v.y0 && F(ROTTEN.k) < v.y1) ROTTEN.boards.forEach(([a, b], i) => {
    const st = look.rot[i], y = F(ROTTEN.k);
    if (st < 0) { box(c, U(a), y, 6, 18, '#3F2812'); box(c, U(b) - 6, y, 6, 14, '#3F2812'); return; }
    const sh = st > 0 ? Math.sin(st * 1.7) * 2 : 0;
    box(c, U(a) + 1 + sh, y, b - a - 2, SLAB - 2, INK); box(c, U(a) + 2 + sh, y + 1, b - a - 4, SLAB - 5, '#6B4F2A');
    box(c, U(a) + 2 + sh, y + 1, b - a - 4, 3, '#A16207');
    c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(U(a) + 12 + sh, y + 6); c.lineTo(U(a) + 30 + sh, y + 12); c.lineTo(U(a) + 22 + sh, y + 18); c.stroke();
    if (st > 0) for (let j = 0; j < 3; j++) box(c, U(a) + 8 + j * 18 + sh, y + 8, 6, 3, INK);
  });
  // the beams
  BEAMS.forEach((b, i) => { if (F(b.k) > v.y0 && beamTop(b) < v.y1) drawBeam(c, i, look.beamHp[i]); });
  // the pendulums
  for (const p of PENDULUMS) if (p.y < v.y1 + 300 && p.y + p.len + 40 > v.y0) drawPendulum(c, p, f, look.crashed);
  // The walls (the left one with the maintenance door at its foot, in from the bay), the roof
  box(c, TX0 - WALL, ROOF - 200, WALL, GY - DOOR_H - ROOF + 200, '#3B3542'); box(c, TX0 - 6, ROOF - 200, 6, GY - DOOR_H - ROOF + 200, '#4B4453');
  box(c, TX0 - WALL - 10, GY - DOOR_H - 14, WALL + 20, 14, '#57534E');
  box(c, TX1, ROOF - 200, WALL, GY - ROOF + 200, '#3B3542'); box(c, TX1, ROOF - 200, 6, GY - ROOF + 200, '#4B4453');
  box(c, TX0 - WALL, ROOF - 40, W + WALL * 2, 40, '#3B3542');
  if (v.x0 < TX0 + 200 && v.y1 > GY - 300) wallSign(c, TX0 - 40, GY - DOOR_H - 40, 'CLOCK TOWER: STAFF ONLY', '#1C1917', '#FDE68A');
};
