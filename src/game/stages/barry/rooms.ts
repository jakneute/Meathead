// Inside the skyscraper, and the power room: the walls, floors and ceilings of
// each (low: it's cramped in here), what's in them, the elevators at either end.
//
//   the lobby:       marble, the security desk, turnstiles, benches, planters, a bank of elevators
//   the office (23): grey carpet, beige walls, cubicles, the copier, the water cooler, the night out the windows
//   maintenance (41): cinderblock, pipes and ducts hanging low, shelves of supplies, the boiler
//   the lab (58):    white tile, hazard stripes, benches of glassware, tanks with things floating in them, cages,
//                    PROJECT BLACKOUT on the whiteboard; the stairs up to the roof
//   the power room:  steel and warning stripes, cables everywhere, the three generators

import type { GameState } from '../../core/state';
import type { Enemy } from '../../../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y } from '../../../constants';
import { COURSE, Place, Prop, Room, roomOf } from './course';
import type { BarryRuntime } from './runtime';
import { blackout } from './lighting';
import { makeKindEnemy } from '../../enemies/kinds';
import { drawKindEnemy } from '../../render/enemies';

type Ctx = CanvasRenderingContext2D;
const Y = GROUND_Y;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const visible = (state: GameState, x1: number, x2: number) => x2 > state.camera.x - 250 && x1 < state.camera.x + CANVAS_WIDTH + 250;

const WALLS: Record<Room['kind'], { wall: string; trim: string; floor: string; slab: string }> = {
  lobby: { wall: '#CFC6B8', trim: '#8B7D6B', floor: '#E7E5E4', slab: '#1C1917' },
  office: { wall: '#D6CFBF', trim: '#9A9281', floor: '#475569', slab: '#18181B' },
  maintenance: { wall: '#6B7280', trim: '#4B5563', floor: '#57534E', slab: '#111827' },
  lab: { wall: '#E2E8F0', trim: '#94A3B8', floor: '#F1F5F9', slab: '#0F172A' },
  power: { wall: '#27303F', trim: '#1E2530', floor: '#1F2937', slab: '#0B0F17' },
};

export const drawRooms = (ctx: Ctx, state: GameState, rt: BarryRuntime, place: Place) => {
  const room = roomOf(place)!;
  const c = WALLS[room.kind];
  const x1 = room.x1 - 60, x2 = room.x2 + 60;
  const top = state.camera.y - 40, bottom = state.camera.y + CANVAS_HEIGHT + 40;
  // The slabs above and below, the wall between
  ctx.fillStyle = c.slab; ctx.fillRect(x1 - 200, top, x2 - x1 + 400, bottom - top);
  ctx.fillStyle = c.wall; ctx.fillRect(room.x1, room.ceiling, room.x2 - room.x1, Y - room.ceiling);
  ctx.fillStyle = c.trim; ctx.fillRect(room.x1, Y - 14, room.x2 - room.x1, 14); ctx.fillRect(room.x1, room.ceiling, room.x2 - room.x1, 8);
  switch (room.kind) {
    case 'lobby': drawLobby(ctx, state, room); break;
    case 'office': drawOfficeWalls(ctx, state, room); break;
    case 'maintenance': drawMaintenanceWalls(ctx, state, room); break;
    case 'lab': drawLabWalls(ctx, state, room); break;
    case 'power': drawPowerWalls(ctx, state, room, rt); break;
  }
  // The floor
  drawFloor(ctx, state, room);
  // The ceiling's underside: tiles, the slab over it
  ctx.fillStyle = room.kind === 'lobby' ? '#A8A29E' : room.kind === 'power' ? '#111827' : '#D4D4D8';
  ctx.fillRect(room.x1, room.ceiling - 30, room.x2 - room.x1, 30);
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; for (let x = room.x1; x < room.x2; x += 60) ctx.fillRect(x, room.ceiling - 30, 2, 30);
  // The end walls
  // (solid: the building's outer walls, their inside faces catching the light)
  ctx.fillStyle = c.trim; ctx.fillRect(room.x1 - 60, room.ceiling - 30, 60, Y - room.ceiling + 46); ctx.fillRect(room.x2, room.ceiling - 30, 60, Y - room.ceiling + 46);
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(room.x1 - 6, room.ceiling - 30, 6, Y - room.ceiling + 46);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(room.x2, room.ceiling - 30, 6, Y - room.ceiling + 46);
  // What's in it
  for (const pr of COURSE.props) if (pr.x >= room.x1 - 10 && pr.x <= room.x2 + 10 && visible(state, pr.x - 60, pr.x + 260)) drawRoomProp(ctx, state, pr, room);
  // The elevators: where you came in (not the lobby's), where you go on
  const el = COURSE.elevators.find(v => v.x > room.x1 && v.x < room.x2);
  if (el) drawElevator(ctx, el.x, room, rt.transit?.kind === 'elevator' ? 0 : 1, 'UP');
  if (room.kind !== 'lobby' && room.kind !== 'power') drawElevator(ctx, room.x1 + 10, room, 0, room.label);
};

const drawFloor = (ctx: Ctx, state: GameState, room: Room) => {
  const x1 = room.x1, x2 = room.x2, w = x2 - x1;
  const bottom = state.camera.y + CANVAS_HEIGHT + 40;
  const c = WALLS[room.kind];
  ctx.fillStyle = c.floor; ctx.fillRect(x1, Y, w, 16);
  ctx.fillStyle = c.slab; ctx.fillRect(x1, Y + 16, w, bottom - Y - 16);
  if (room.kind === 'lobby') { ctx.fillStyle = 'rgba(120, 113, 108, 0.35)'; for (let x = x1; x < x2; x += 80) ctx.fillRect(x, Y, 2, 16); ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(x1, Y, w, 2); }
  if (room.kind === 'office') { ctx.fillStyle = 'rgba(15, 23, 42, 0.3)'; for (let x = x1; x < x2; x += 12) ctx.fillRect(x, Y + 4, 6, 2); }
  if (room.kind === 'maintenance') { ctx.fillStyle = 'rgba(28, 25, 23, 0.5)'; for (let x = x1 + 40; x < x2; x += 170) { ctx.beginPath(); ctx.ellipse(x, Y + 5, 30, 3, 0, 0, Math.PI * 2); ctx.fill(); } }
  if (room.kind === 'lab') { ctx.fillStyle = 'rgba(148, 163, 184, 0.5)'; for (let x = x1; x < x2; x += 32) ctx.fillRect(x, Y, 1, 16); }
  if (room.kind === 'power') { ctx.fillStyle = '#374151'; for (let x = x1; x < x2; x += 10) ctx.fillRect(x, Y + 2, 5, 12); }
};

/** An elevator's doors (shut, or open by `open` 0..1), its floor indicator. */
const drawElevator = (ctx: Ctx, x: number, room: Room, open: number, label: string) => {
  const w = 70, h = 120;
  ctx.fillStyle = '#6B7280'; ctx.fillRect(x - 6, Y - h - 6, w + 12, h + 6);
  ctx.fillStyle = '#111827'; ctx.fillRect(x, Y - h, w, h);
  const half = (w / 2) * (1 - open * 0.8);
  ctx.fillStyle = '#A8A29E'; ctx.fillRect(x, Y - h, half, h); ctx.fillRect(x + w - half, Y - h, half, h);
  ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(x + 4, Y - h, 2, h); ctx.fillRect(x + w - 6, Y - h, 2, h);
  ctx.fillStyle = '#111827'; ctx.fillRect(x + 15, Y - h - 20, 40, 12);
  ctx.fillStyle = '#F97316'; ctx.font = 'bold 7px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText(label, x + 35, Y - h - 11); ctx.textAlign = 'left';
  ctx.fillStyle = '#FDE047'; ctx.beginPath(); ctx.arc(x + w + 14, Y - 70, 4, 0, Math.PI * 2); ctx.fill();
  void room;
};

/** Night out of the windows of the upper floors (the city going dark in waves). */
const drawWindows = (ctx: Ctx, state: GameState, room: Room, every: number) => {
  for (let x = room.x1 + 80; x < room.x2 - 120; x += every) {
    if (!visible(state, x, x + 120)) continue;
    const wy = room.ceiling + 30, wh = Y - room.ceiling - 110;
    ctx.fillStyle = '#0B1220'; ctx.fillRect(x, wy, 120, wh);
    const out = blackout(state.frame, x * 3) > 0.5;
    for (let k = 0; k < 10; k++) { const bx = x + 4 + k * 12, bh = 20 + hash(x + k) * 60; ctx.fillStyle = '#111827'; ctx.fillRect(bx, wy + wh - bh, 10, bh); ctx.fillStyle = out ? '#1F2937' : '#FCD34D'; if (hash(x * k) < 0.5) ctx.fillRect(bx + 3, wy + wh - bh + 6, 2, 2); }
    ctx.strokeStyle = '#94A3B8'; ctx.lineWidth = 3; ctx.strokeRect(x, wy, 120, wh); ctx.beginPath(); ctx.moveTo(x + 60, wy); ctx.lineTo(x + 60, wy + wh); ctx.stroke();
  }
};

const drawLobby = (ctx: Ctx, state: GameState, room: Room) => {
  // Marble panels, a big BARRY PLAZA sign, a portrait of the man himself
  ctx.fillStyle = 'rgba(120, 113, 108, 0.2)'; for (let x = room.x1; x < room.x2; x += 120) ctx.fillRect(x, room.ceiling, 2, Y - room.ceiling);
  const sx = room.x1 + 700;
  if (visible(state, sx, sx + 300)) {
    ctx.fillStyle = '#1C1917'; ctx.fillRect(sx, room.ceiling + 40, 300, 40);
    ctx.fillStyle = '#FACC15'; ctx.font = 'bold 14px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('BARRY PLAZA', sx + 150, room.ceiling + 67); ctx.textAlign = 'left';
    // The portrait: Barry, dark glasses, lightning bolt tie
    ctx.fillStyle = '#A16207'; ctx.fillRect(sx + 110, room.ceiling + 100, 80, 96); ctx.fillStyle = '#1E1B4B'; ctx.fillRect(sx + 116, room.ceiling + 106, 68, 84);
    ctx.fillStyle = '#E0AC69'; ctx.beginPath(); ctx.arc(sx + 150, room.ceiling + 140, 16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111827'; ctx.fillRect(sx + 136, room.ceiling + 136, 28, 6); ctx.fillStyle = '#FDE047'; ctx.beginPath(); ctx.moveTo(sx + 150, room.ceiling + 160); ctx.lineTo(sx + 144, room.ceiling + 176); ctx.lineTo(sx + 151, room.ceiling + 174); ctx.lineTo(sx + 146, room.ceiling + 188); ctx.lineTo(sx + 158, room.ceiling + 168); ctx.lineTo(sx + 151, room.ceiling + 170); ctx.closePath(); ctx.fill();
  }
  // The street through the glass at the near end
  ctx.fillStyle = 'rgba(30, 58, 95, 0.7)'; ctx.fillRect(room.x1, room.ceiling + 30, 120, Y - room.ceiling - 44);
};

const drawOfficeWalls = (ctx: Ctx, state: GameState, room: Room) => {
  drawWindows(ctx, state, room, 420);
  // Motivational posters, a clock
  for (let x = room.x1 + 280; x < room.x2; x += 420) {
    if (!visible(state, x, x + 60)) continue;
    ctx.fillStyle = '#1E3A8A'; ctx.fillRect(x, room.ceiling + 40, 60, 44); ctx.fillStyle = '#F8FAFC'; ctx.font = '5px "Press Start 2P"'; ctx.fillText(['SYNERGY', 'HUSTLE', 'GRIND', 'OWN IT'][Math.floor(x / 420) & 3], x + 6, room.ceiling + 78);
    ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(x + 30, room.ceiling + 60, 10, 0, Math.PI * 2); ctx.fill();
  }
};

const drawMaintenanceWalls = (ctx: Ctx, state: GameState, room: Room) => {
  // Cinderblock, pipes along the top, gauges
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; for (let y = room.ceiling + 10; y < Y; y += 16) for (let x = room.x1 + ((y / 16) % 2) * 20; x < room.x2; x += 40) ctx.fillRect(x, y, 38, 1);
  ctx.fillStyle = '#78716C'; ctx.fillRect(room.x1, room.ceiling + 14, room.x2 - room.x1, 10); ctx.fillStyle = '#B45309'; ctx.fillRect(room.x1, room.ceiling + 30, room.x2 - room.x1, 7);
  for (let x = room.x1 + 100; x < room.x2; x += 260) { if (!visible(state, x, x + 20)) continue; ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(x, room.ceiling + 60, 9, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#DC2626'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, room.ceiling + 60); ctx.lineTo(x + 6, room.ceiling + 56 + Math.sin(state.frame * 0.1 + x) * 3); ctx.stroke(); }
};

const drawLabWalls = (ctx: Ctx, state: GameState, room: Room) => {
  // Sterile white, a hazard stripe along the bottom, warning signs
  for (let x = room.x1; x < room.x2; x += 24) { ctx.fillStyle = (x / 24) % 2 ? '#FACC15' : '#111827'; ctx.fillRect(x, Y - 40, 24, 12); }
  for (let x = room.x1 + 360; x < room.x2 - 200; x += 520) {
    if (!visible(state, x, x + 50)) continue;
    ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.moveTo(x + 25, room.ceiling + 40); ctx.lineTo(x, room.ceiling + 84); ctx.lineTo(x + 50, room.ceiling + 84); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#111827'; ctx.font = 'bold 14px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('!', x + 25, room.ceiling + 80); ctx.textAlign = 'left';
  }
  ctx.fillStyle = '#DC2626'; ctx.font = 'bold 7px "Press Start 2P"'; ctx.fillText('R&D - AUTHORIZED PERSONNEL ONLY - NO PHOTOGRAPHY - NO QUESTIONS', room.x1 + 100, room.ceiling + 24);
};

const drawPowerWalls = (ctx: Ctx, state: GameState, room: Room, rt: BarryRuntime) => {
  const f = state.frame;
  const x1 = room.x1, x2 = room.x2, top = room.ceiling;
  // Cable bundles along the top, riveted wall panels, a hazard stripe along the bottom
  ctx.fillStyle = '#111827'; for (let k = 0; k < 4; k++) ctx.fillRect(x1, top + 12 + k * 6, x2 - x1, 3);
  ctx.fillStyle = 'rgba(255,255,255,0.05)'; for (let x = x1; x < x2; x += 110) ctx.fillRect(x, top + 40, 2, Y - top - 70);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; for (let x = x1 + 6; x < x2; x += 110) for (let y = top + 48; y < Y - 40; y += 40) ctx.fillRect(x, y, 3, 3);
  for (let x = x1; x < x2; x += 30) { ctx.fillStyle = Math.floor((x - x1) / 30) % 2 ? '#FACC15' : '#111827'; ctx.fillRect(x, Y - 30, 30, 14); }
  // The grid board, right across the top of the wall: NYC GRID CONTROL, and what each of the generators runs,
  // going from green to flashing red as they go
  const bx = x1 + 150, bw = x2 - x1 - 300, by = top + 44, bh = 84;
  ctx.fillStyle = '#0B1220'; ctx.fillRect(bx, by, bw, bh);
  ctx.strokeStyle = '#38BDF8'; ctx.lineWidth = 3; ctx.strokeRect(bx, by, bw, bh);
  ctx.fillStyle = '#0E7490'; ctx.fillRect(bx, by, bw, 16);
  ctx.fillStyle = '#E0F2FE'; ctx.font = 'bold 8px "Press Start 2P"'; ctx.textAlign = 'center';
  ctx.fillText('NYC GRID CONTROL', bx + bw / 2, by + 12, bw - 20);
  const systems = ['SUBWAY', 'TRAFFIC', 'EVERYTHING'];
  const cw = (bw - 40) / systems.length;
  systems.forEach((name, i) => {
    const cx = bx + 20 + i * cw, down = i < rt.power.gone;
    const col = down ? (Math.floor(f / 10) % 2 ? '#DC2626' : '#7F1D1D') : '#16A34A';
    ctx.fillStyle = col; ctx.fillRect(cx + 6, by + 26, cw - 12, 28);
    ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 7px "Press Start 2P"';
    ctx.fillText(name, cx + cw / 2, by + 44, cw - 18);
    ctx.fillStyle = down ? '#FCA5A5' : '#86EFAC'; ctx.font = '6px "Press Start 2P"';
    ctx.fillText(down ? 'OFFLINE' : 'ONLINE', cx + cw / 2, by + 70, cw - 18);
  });
  ctx.textAlign = 'left';
  // Not in yet (the fade in, before the room's turn has put them out): the generators and Barry's man drawn where
  // they'll be, so nothing pops in
  if (rt.power.phase === 'waiting') {
    for (const gx of COURSE.generators) drawGenerator(ctx, standIn('generator', gx), state, 100);
    const m = standIn('minion', COURSE.power.x2 - 160); m.aiState = 'taunt'; m.facing = -1;
    drawKindEnemy(ctx, m, state);
  }
  // A breaker panel at either end, its lights blinking
  for (const px of [x1 + 30, x2 - 110]) {
    ctx.fillStyle = '#374151'; ctx.fillRect(px, top + 60, 80, 110);
    ctx.strokeStyle = '#1F2937'; ctx.lineWidth = 2; ctx.strokeRect(px, top + 60, 80, 110);
    for (let k = 0; k < 8; k++) { ctx.fillStyle = '#111827'; ctx.fillRect(px + 10 + (k % 2) * 34, top + 72 + Math.floor(k / 2) * 22, 26, 14); ctx.fillStyle = (f + k * 13) % 40 < 30 ? '#22C55E' : '#14532D'; ctx.fillRect(px + 14 + (k % 2) * 34, top + 76 + Math.floor(k / 2) * 22, 5, 5); }
  }
};

const drawRoomProp = (ctx: Ctx, state: GameState, pr: Prop, room: Room) => {
  const f = state.frame;
  const { x, y } = pr;
  const w = pr.w ?? 100, h = pr.h ?? 60;
  switch (pr.look) {
    case 'desk':
      ctx.fillStyle = '#44403C'; ctx.fillRect(x, y - h, w, h); ctx.fillStyle = '#78716C'; ctx.fillRect(x - 6, y - h, w + 12, 8);
      ctx.fillStyle = '#FACC15'; ctx.font = 'bold 6px "Press Start 2P"'; ctx.fillText('SECURITY', x + 40, y - h + 30);
      ctx.fillStyle = '#111827'; ctx.fillRect(x + 20, y - h - 30, 34, 22); ctx.fillStyle = '#60A5FA'; ctx.fillRect(x + 23, y - h - 27, 28, 16); // a monitor
      break;
    case 'turnstiles':
      for (let k = 0; k < 3; k++) { ctx.fillStyle = '#9CA3AF'; ctx.fillRect(x + k * 50, y - 44, 20, 44); ctx.fillStyle = '#6B7280'; ctx.fillRect(x + k * 50 + 20, y - 34, 26, 4); ctx.fillStyle = Math.floor(f / 30) % 2 ? '#DC2626' : '#22C55E'; ctx.fillRect(x + k * 50 + 6, y - 40, 8, 4); }
      break;
    case 'planter':
      ctx.fillStyle = '#57534E'; ctx.fillRect(x - 24, y - 40, 48, 40);
      ctx.fillStyle = '#166534'; for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.ellipse(x + k * 8, y - 60 - Math.abs(k) * -4, 6, 22, k * 0.3, 0, Math.PI * 2); ctx.fill(); }
      break;
    case 'cubicle':
      ctx.fillStyle = '#6B7280'; ctx.fillRect(x, y - h, w, h); ctx.fillStyle = '#9CA3AF'; ctx.fillRect(x, y - h, w, 6);
      ctx.fillStyle = 'rgba(255,255,255,0.1)'; for (let yy = y - h + 12; yy < y; yy += 8) ctx.fillRect(x, yy, w, 1);
      ctx.fillStyle = '#FDE047'; ctx.fillRect(x + 30, y - h + 16, 10, 10); ctx.fillRect(x + 90, y - h + 22, 10, 10); // sticky notes
      ctx.fillStyle = '#111827'; ctx.fillRect(x + 60, y - h - 26, 34, 22); ctx.fillStyle = hash(x) < 0.5 ? '#60A5FA' : '#22C55E'; ctx.fillRect(x + 63, y - h - 23, 28, 16);
      break;
    case 'bigdesk':
      ctx.fillStyle = '#78350F'; ctx.fillRect(x, y - h, w, h); ctx.fillStyle = '#92400E'; ctx.fillRect(x - 6, y - h, w + 12, 8);
      ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x + 110, y - h - 16, 20, 14); ctx.fillStyle = '#15803D'; ctx.fillRect(x + 20, y - h - 10, 24, 10); // a banker's lamp
      break;
    case 'copier':
      ctx.fillStyle = '#D1D5DB'; ctx.fillRect(x, y - 70, 70, 70); ctx.fillStyle = '#9CA3AF'; ctx.fillRect(x + 6, y - 80, 58, 10);
      ctx.fillStyle = Math.floor(f / 8) % 2 ? '#22C55E' : '#DC2626'; ctx.fillRect(x + 54, y - 64, 6, 6);
      ctx.fillStyle = '#F8FAFC'; ctx.font = '5px "Press Start 2P"'; ctx.fillText('JAMMED', x + 8, y - 40);
      break;
    case 'cooler':
      ctx.fillStyle = '#E5E7EB'; ctx.fillRect(x, y - 60, 36, 60); ctx.fillStyle = 'rgba(147, 197, 253, 0.8)'; ctx.beginPath(); ctx.roundRect(x + 4, y - 100, 28, 42, 8); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(x + 12 + Math.sin(f * 0.05) * 6, y - 70 - ((f * 0.5) % 24), 2, 0, Math.PI * 2); ctx.fill();
      break;
    case 'ducts':
      ctx.fillStyle = '#9CA3AF'; ctx.fillRect(x - 20, y, w + 40, h);
      ctx.fillStyle = '#6B7280'; for (let px = x - 20; px < x + w + 20; px += 40) ctx.fillRect(px, y, 3, h);
      ctx.fillStyle = '#DC2626'; ctx.font = 'bold 5px "Press Start 2P"'; ctx.fillText('LOW CLEARANCE', x + 10, y + h - 8);
      ctx.strokeStyle = '#4B5563'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 20, y); ctx.lineTo(x + 20, room.ceiling); ctx.moveTo(x + w - 20, y); ctx.lineTo(x + w - 20, room.ceiling); ctx.stroke();
      if (f % 6 === 0) state.particles.push({ pos: { x: x + w / 2, y: y + h }, vel: { x: 0, y: 2 }, life: 20, color: 'rgba(147, 197, 253, 0.8)', size: 2 }); // a drip
      break;
    case 'shelves':
      ctx.fillStyle = '#4B5563'; ctx.fillRect(x, y - h, 6, h); ctx.fillRect(x + w - 6, y - h, 6, h);
      for (let yy = y - h; yy < y; yy += 34) { ctx.fillStyle = '#6B7280'; ctx.fillRect(x, yy, w, 5); for (let k = 0; k < 5; k++) { ctx.fillStyle = ['#2563EB', '#FACC15', '#DC2626', '#F8FAFC', '#16A34A'][(k + Math.floor(yy)) % 5]; ctx.fillRect(x + 10 + k * 26, yy + 5, 16, 22); } }
      break;
    case 'boiler':
      ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.roundRect(x, y - 140, 120, 140, 20); ctx.fill();
      ctx.fillStyle = '#991B1B'; ctx.fillRect(x + 10, y - 120, 100, 6);
      ctx.fillStyle = `rgba(249, 115, 22, ${0.6 + Math.sin(f * 0.3) * 0.3})`; ctx.fillRect(x + 40, y - 50, 40, 26); // the fire in it
      ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(x + 60, y - 100, 12, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#111827'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 60, y - 100); ctx.lineTo(x + 68, y - 106); ctx.stroke();
      break;
    case 'bench':
      ctx.fillStyle = '#E5E7EB'; ctx.fillRect(x, y - h, w, h); ctx.fillStyle = '#1F2937'; ctx.fillRect(x - 4, y - h, w + 8, 6);
      // Glassware bubbling on it
      for (let k = 0; k < 4; k++) { const gx = x + 20 + k * 40; ctx.fillStyle = 'rgba(224, 242, 254, 0.7)'; ctx.fillRect(gx, y - h - 26, 10, 20); ctx.fillStyle = ['#84CC16', '#F472B6', '#38BDF8', '#FACC15'][k]; ctx.fillRect(gx, y - h - 14, 10, 8); if ((f + k * 7) % 20 < 10) { ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(gx + 4, y - h - 30 - ((f + k * 5) % 10), 2, 2); } }
      break;
    case 'tank': {
      // A specimen tank: green fluid, bubbles, something floating in it (an arm, a brain, a guy)
      ctx.fillStyle = '#374151'; ctx.fillRect(x - 6, y - 16, 92, 16); ctx.fillRect(x - 6, y - 196, 92, 12);
      ctx.fillStyle = 'rgba(132, 204, 22, 0.45)'; ctx.fillRect(x, y - 184, 80, 168);
      const bob = Math.sin(f * 0.05 + x) * 4;
      ctx.fillStyle = 'rgba(199, 210, 184, 0.9)';
      if (pr.v === 0) { ctx.fillRect(x + 30, y - 130 + bob, 16, 60); ctx.fillRect(x + 24, y - 80 + bob, 28, 10); } // an arm
      else if (pr.v === 1) { ctx.beginPath(); ctx.ellipse(x + 40, y - 110 + bob, 20, 14, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#A3A38A'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 40, y - 124 + bob); ctx.lineTo(x + 40, y - 96 + bob); ctx.stroke(); } // a brain
      else { ctx.fillRect(x + 30, y - 160 + bob, 22, 90); ctx.beginPath(); ctx.arc(x + 41, y - 168 + bob, 11, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#111827'; ctx.fillRect(x + 44, y - 170 + bob, 2, 2); ctx.fillStyle = '#FDE047'; ctx.font = '5px "Press Start 2P"'; ctx.fillText('SUBJECT 6', x + 8, y - 22); } // one of the last lot
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; for (let k = 0; k < 4; k++) ctx.fillRect(x + 10 + k * 18, y - 30 - ((f * 1.5 + k * 30) % 150), 3, 3);
      ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(x + 4, y - 184, 6, 168);
      break;
    }
    case 'whiteboard':
      ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x, room.ceiling + 40, 160, 100); ctx.strokeStyle = '#9CA3AF'; ctx.lineWidth = 3; ctx.strokeRect(x, room.ceiling + 40, 160, 100);
      ctx.fillStyle = '#DC2626'; ctx.font = 'bold 7px "Press Start 2P"'; ctx.fillText('PROJECT BLACKOUT', x + 10, room.ceiling + 58);
      ctx.fillStyle = '#1D4ED8'; ctx.font = '5px "Press Start 2P"';
      ctx.fillText('SUBJECT 7: STRENGTH +400%', x + 10, room.ceiling + 74); ctx.fillText('SIDE EFFECTS: GLOWING,', x + 10, room.ceiling + 86); ctx.fillText('SCREAMING, LOVES BARRY', x + 10, room.ceiling + 96);
      ctx.fillText('NEXT: THE WHOLE CITY?', x + 10, room.ceiling + 112);
      ctx.strokeStyle = '#DC2626'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x + 136, room.ceiling + 90, 14, 0, Math.PI * 2); ctx.stroke(); // Barry's face, circled
      ctx.fillStyle = '#111827'; ctx.fillRect(x + 128, room.ceiling + 86, 16, 4);
      break;
    case 'cages':
      for (let k = 0; k < 3; k++) {
        const cx = x + k * 70;
        ctx.fillStyle = 'rgba(17,24,39,0.6)'; ctx.fillRect(cx, y - 60, 60, 60);
        ctx.fillStyle = k === 1 ? '#F8FAFC' : '#57534E'; ctx.beginPath(); ctx.ellipse(cx + 30, y - 12, 12, 7, 0, 0, Math.PI * 2); ctx.fill(); // lab rats (one of them's glowing)
        if (k === 1) { ctx.fillStyle = 'rgba(132, 204, 22, 0.4)'; ctx.beginPath(); ctx.arc(cx + 30, y - 14, 16, 0, Math.PI * 2); ctx.fill(); }
        ctx.strokeStyle = '#9CA3AF'; ctx.lineWidth = 1; for (let b = cx; b <= cx + 60; b += 6) { ctx.beginPath(); ctx.moveTo(b, y - 60); ctx.lineTo(b, y); ctx.stroke(); }
      }
      break;
    case 'stairs': {
      // The stairwell door, propped open, the stairs going up; ROOF ACCESS
      ctx.fillStyle = '#1F2937'; ctx.fillRect(x, room.ceiling - 30, 260, Y - room.ceiling + 30);
      ctx.fillStyle = '#374151'; for (let k = 0; k < 10; k++) ctx.fillRect(x + 40 + k * 20, Y - 16 - k * 20, 40, 16);
      ctx.fillStyle = '#DC2626'; ctx.fillRect(x + 20, room.ceiling + 10, 140, 22); ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 8px "Press Start 2P"'; ctx.fillText('ROOF ACCESS', x + 30, room.ceiling + 26);
      ctx.fillStyle = '#6B7280'; ctx.fillRect(x - 10, Y - 110, 14, 110);
      break;
    }
  }
};

/** A stand-in for one of the power room's lot, where the room will put him (drawn only). */
const standIns = new Map<string, Enemy>();
const standIn = (kind: 'generator' | 'minion', x: number): Enemy => {
  const k = `${kind}${x}`;
  let e = standIns.get(k);
  if (!e) { e = makeKindEnemy(kind, x, COURSE.power.floor); standIns.set(k, e); }
  if (kind === 'generator') { e.pos.x = x - e.width / 2; e.pos.y = COURSE.power.floor - e.height; }
  return e;
};

/** Anything in front of him indoors (the generators' charge, as a readout). */
export const drawRoomFront = (ctx: Ctx, state: GameState, rt: BarryRuntime, place: Place) => {
  if (place !== 'power') return;
  rt.power.gens.forEach((g, i) => {
    const x = COURSE.generators[i];
    if (g.charge <= 0) return;
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(x - 40, Y - 178, 80, 10);
    ctx.fillStyle = g.charge > 50 ? '#38BDF8' : g.charge > 20 ? '#FACC15' : '#EF4444'; ctx.fillRect(x - 38, Y - 176, 76 * g.charge / 100, 6);
  });
};

/** A generator: a big humming steel cabinet, coils glowing blue through its vents, arcing when it's being hit; a smoking wreck once it's gone. */
export const drawGenerator = (ctx: Ctx, e: Enemy, state: GameState, charge: number) => {
  const f = state.frame;
  const x = e.pos.x, y = e.pos.y, w = e.width, h = e.height;
  if (charge <= 0) {
    ctx.fillStyle = '#1C1917'; ctx.fillRect(x, y + 30, w, h - 30);
    ctx.fillStyle = '#292524'; ctx.beginPath(); ctx.moveTo(x, y + 30); ctx.lineTo(x + 20, y + 10); ctx.lineTo(x + 50, y + 40); ctx.lineTo(x + 80, y + 5); ctx.lineTo(x + w, y + 34); ctx.lineTo(x + w, y + 60); ctx.lineTo(x, y + 60); ctx.fill();
    ctx.fillStyle = `rgba(249, 115, 22, ${0.5 + Math.sin(f * 0.4) * 0.3})`; ctx.fillRect(x + 30, y + 70, 60, 20);
    return;
  }
  ctx.fillStyle = '#475569'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#334155'; ctx.fillRect(x + 6, y + 6, w - 12, 20);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(x, y + h - 16, w, 8); ctx.fillStyle = '#111827'; for (let k = 0; k < w; k += 16) ctx.fillRect(x + k, y + h - 16, 8, 8);
  // The coils, glowing through the vents
  const hum = 0.6 + Math.sin(f * 0.3) * 0.2;
  for (let k = 0; k < 4; k++) { ctx.fillStyle = `rgba(56, 189, 248, ${hum})`; ctx.fillRect(x + 14 + k * 25, y + 40, 16, 70); ctx.fillStyle = '#1E293B'; for (let yy = y + 42; yy < y + 110; yy += 8) ctx.fillRect(x + 14 + k * 25, yy, 16, 3); }
  ctx.fillStyle = '#E0F2FE'; ctx.font = 'bold 6px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('DANGER HV', x + w / 2, y + 20); ctx.textAlign = 'left';
  // Arcing when it's hurting
  if (charge < 100 && f % 4 < 2) {
    ctx.strokeStyle = '#E0F2FE'; ctx.lineWidth = 2; ctx.beginPath();
    let ax = x + hash(f) * w, ay = y + 20;
    ctx.moveTo(ax, ay); for (let k = 0; k < 5; k++) { ax += (hash(f + k) - 0.5) * 30; ay += 18; ctx.lineTo(ax, ay); }
    ctx.stroke();
  }
};
