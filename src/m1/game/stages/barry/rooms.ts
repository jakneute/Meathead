// Inside the skyscraper, and the power room: the walls, floors and ceilings of
// each (low: it's cramped in here), what's in them, the elevators at either end.
//
//   the lobby:       marble, the security desk, turnstiles, benches, planters, a bank of elevators
//   the office (23): grey carpet, beige walls, cubicles, the copier, the water cooler, the night out the windows
//   maintenance (41): cinderblock, pipes and ducts hanging low, shelves of supplies, the boiler
//   the lab (58):    white tile, hazard stripes, benches of glassware, tanks with things floating in them, cages,
//                    PROJECT BLACKOUT on the whiteboard; the stairs up to the roof
//   the power room:  steel and warning stripes, cables everywhere, the three generators
//
// Everything in the 16-bit way: an ink line round each thing, its colour in steps (lit from the upper left,
// shadowed lower right), stepped glints and glows, no smooth gradients.

import type { GameState } from '../../core/state';
import { bandedGradient, checker, steppedGlow, tilePattern } from '../../render/pixelArt';
import { INK, dark, lite, ink, shaded } from '../../render/npc/kit';
import { drawFire } from '../../render/fx/fire';
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

// ---------------------------------------------------------------------------
// The kit (the street outside draws with these too)
// ---------------------------------------------------------------------------

/** A block: its colour, lit along the top and down the left, shadowed down the right and along the bottom, inked round. */
export const slab = (ctx: Ctx, x: number, y: number, w: number, h: number, c: string, e = 2) => {
  ctx.fillStyle = c; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = lite(c, 0.3); ctx.fillRect(x, y, w, e); ctx.fillRect(x, y, e, h);
  ctx.fillStyle = dark(c, 0.25); ctx.fillRect(x + w - e, y, e, h); ctx.fillRect(x, y + h - e, w, e);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
};

/** A block in three steps across (a pipe end-on, a post, a barrel): lit left third, its colour, the shadow right. */
export const column = (ctx: Ctx, x: number, y: number, w: number, h: number, c: string) => {
  ctx.fillStyle = c; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = lite(c, 0.25); ctx.fillRect(x, y, Math.max(1, Math.round(w * 0.3)), h);
  ctx.fillStyle = dark(c, 0.25); ctx.fillRect(x + w - Math.max(1, Math.round(w * 0.28)), y, Math.max(1, Math.round(w * 0.28)), h);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
};

/** A pipe run along (a horizontal cylinder): lit along its top, its shadow along the bottom, inked top and bottom. */
export const pipe = (ctx: Ctx, x: number, y: number, w: number, h: number, c: string) => {
  ctx.fillStyle = c; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = lite(c, 0.3); ctx.fillRect(x, y + 1, w, Math.max(1, Math.round(h * 0.25)));
  ctx.fillStyle = lite(c, 0.55); ctx.fillRect(x, y + 1, w, 1);
  ctx.fillStyle = dark(c, 0.3); ctx.fillRect(x, y + h - Math.max(1, Math.round(h * 0.3)), w, Math.max(1, Math.round(h * 0.3)));
  ctx.fillStyle = INK; ctx.fillRect(x, y, w, 1); ctx.fillRect(x, y + h - 1, w, 1);
};

/** Lettering, centered on x, a drop shadow under it in the sign's own dark. */
export const letter = (ctx: Ctx, text: string, x: number, y: number, font: string, c: string, shadow: string, maxW?: number) => {
  ctx.font = font; ctx.textAlign = 'center';
  ctx.fillStyle = shadow; if (maxW) ctx.fillText(text, x + 1, y + 1, maxW); else ctx.fillText(text, x + 1, y + 1);
  ctx.fillStyle = c; if (maxW) ctx.fillText(text, x, y, maxW); else ctx.fillText(text, x, y);
  ctx.textAlign = 'left';
};

/** Diagonal hazard stripes, yellow and black, across (x, y, w, h), inked top and bottom. */
export const hazard = (ctx: Ctx, x: number, y: number, w: number, h: number, step = 12) => {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = '#FACC15'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#1C1917';
  for (let sx = Math.floor((x - h) / (step * 2)) * step * 2; sx < x + w; sx += step * 2) { ctx.beginPath(); ctx.moveTo(sx, y + h); ctx.lineTo(sx + h, y); ctx.lineTo(sx + h + step, y); ctx.lineTo(sx + step, y + h); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(x, y, w, 2);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x, y + h - 2, w, 2);
  ctx.restore();
  ctx.fillStyle = INK; ctx.fillRect(x, y, w, 1); ctx.fillRect(x, y + h - 1, w, 1);
};

/** A monitor's screen: the bezel, the glass in bands of `glow` (lit top), scanlines, a glint. */
const screen = (ctx: Ctx, x: number, y: number, w: number, h: number, glow: string) => {
  slab(ctx, x, y, w, h, '#1F2937', 1);
  bandedGradient(ctx, x + 3, y + 3, w - 6, h - 6, [lite(glow, 0.3), glow, dark(glow, 0.3)], 3);
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; for (let yy = y + 4; yy < y + h - 3; yy += 2) ctx.fillRect(x + 3, yy, w - 6, 1);
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(x + 4, y + 4, 4, 1); ctx.fillRect(x + 4, y + 5, 1, 2);
};

/** A dial: the brass rim, the face, its ticks, the red needle at angle a, the glass's glint. */
const gauge = (ctx: Ctx, x: number, y: number, r: number, a: number) => {
  ink(ctx, () => ctx.arc(x, y, r, 0, Math.PI * 2), '#A16207');
  ctx.fillStyle = '#CA8A04'; ctx.beginPath(); ctx.arc(x - 0.5, y - 0.5, r - 1, Math.PI * 0.9, Math.PI * 1.6); ctx.lineTo(x, y); ctx.fill();
  ink(ctx, () => ctx.arc(x, y, r - 2.5, 0, Math.PI * 2), '#F5F5F4', 0.6);
  ctx.fillStyle = '#D6D3D1'; ctx.beginPath(); ctx.arc(x, y, r - 3, 0, Math.PI); ctx.fill();
  ctx.fillStyle = INK; for (let k = 0; k < 5; k++) { const t = Math.PI * (0.8 + k * 0.35); ctx.fillRect(Math.round(x + Math.cos(t) * (r - 4.5)), Math.round(y + Math.sin(t) * (r - 4.5)), 1, 1); }
  ctx.strokeStyle = '#DC2626'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * (r - 3), y + Math.sin(a) * (r - 3)); ctx.stroke();
  ctx.fillStyle = INK; ctx.fillRect(x - 1, y - 1, 2, 2);
  ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(x - r * 0.5, y - r * 0.55, 2, 1); ctx.fillRect(x - r * 0.55, y - r * 0.4, 1, 2);
};

/** A blinking lamp: the dark socket, the lens lit (or not), a glint on it, a stepped glow round it when on. */
const led = (ctx: Ctx, x: number, y: number, s: number, on: boolean, c: string) => {
  ctx.fillStyle = INK; ctx.fillRect(x - 1, y - 1, s + 2, s + 2);
  ctx.fillStyle = on ? c : dark(c, 0.65); ctx.fillRect(x, y, s, s);
  if (on) { ctx.fillStyle = lite(c, 0.6); ctx.fillRect(x, y, Math.max(1, s / 2), Math.max(1, s / 2)); steppedGlow(ctx, x + s / 2, y + s / 2, s * 1.6, c, 0.3, 0.05, 3); }
};

// ---------------------------------------------------------------------------
// The rooms
// ---------------------------------------------------------------------------

/** Each wall top to bottom: lit under the ceiling lights, going into the shade down by the floor. */
const WALL_SHADE: Record<Room['kind'], string[]> = {
  lobby: ['#DDD4C6', '#D4CBBD', '#CFC6B8', '#C4BAAA', '#B8AD9C'],
  office: ['#E2DBCB', '#DAD3C3', '#D6CFBF', '#CBC3B2', '#BFB6A4'],
  maintenance: ['#7A808F', '#717786', '#6B7280', '#5F6673', '#545A66'],
  lab: ['#F1F4F8', '#E8ECF2', '#E2E8F0', '#D6DDE7', '#CBD3DE'],
  power: ['#2E3748', '#2A3242', '#27303F', '#222A38', '#1D2430'],
};

const WALLS: Record<Room['kind'], { wall: string; trim: string; floor: string; slab: string }> = {
  lobby: { wall: '#CFC6B8', trim: '#8B7D6B', floor: '#E7E5E4', slab: '#1C1917' },
  office: { wall: '#D6CFBF', trim: '#9A9281', floor: '#475569', slab: '#18181B' },
  maintenance: { wall: '#6B7280', trim: '#4B5563', floor: '#57534E', slab: '#111827' },
  lab: { wall: '#E2E8F0', trim: '#94A3B8', floor: '#F1F5F9', slab: '#0F172A' },
  power: { wall: '#27303F', trim: '#1E2530', floor: '#1F2937', slab: '#0B0F17' },
};

/**
 * The room's back wall, for his shadow to be thrown up by the lights in there: from the cornice down to the
 * baseboard, end to end, but not the glass in it (the office's windows, the lobby's front).
 */
export const roomShadowWalls = (place: Place): { x: number; y: number; w: number; h: number; hole?: boolean }[] => {
  const room = roomOf(place);
  if (!room) return [];
  const out: { x: number; y: number; w: number; h: number; hole?: boolean }[] = [{ x: room.x1, y: room.ceiling + 9, w: room.x2 - room.x1, h: Y - 14 - room.ceiling - 9 }];
  if (room.kind === 'office') for (let x = room.x1 + 80; x < room.x2 - 120; x += 420) out.push({ x, y: room.ceiling + 30, w: 120, h: Y - room.ceiling - 110, hole: true });
  if (room.kind === 'lobby') out.push({ x: room.x1, y: room.ceiling + 30, w: 120, h: Y - room.ceiling - 44, hole: true });
  return out;
};

export const drawRooms = (ctx: Ctx, state: GameState, rt: BarryRuntime, place: Place) => {
  const room = roomOf(place)!;
  const c = WALLS[room.kind];
  const x1 = room.x1 - 60, x2 = room.x2 + 60;
  const top = state.camera.y - 40, bottom = state.camera.y + CANVAS_HEIGHT + 40;
  const W = room.x2 - room.x1;
  // The slabs above and below, the wall between
  ctx.fillStyle = c.slab; ctx.fillRect(x1 - 200, top, x2 - x1 + 400, bottom - top);
  bandedGradient(ctx, room.x1, room.ceiling, W, Y - room.ceiling, WALL_SHADE[room.kind], 10);
  // (the baseboard and the cornice, each with a line of light along its top and shadow under it, inked)
  ctx.fillStyle = c.trim; ctx.fillRect(room.x1, Y - 14, W, 14); ctx.fillRect(room.x1, room.ceiling, W, 8);
  ctx.fillStyle = lite(c.trim, 0.3); ctx.fillRect(room.x1, Y - 13, W, 2); ctx.fillRect(room.x1, room.ceiling + 5, W, 1);
  ctx.fillStyle = dark(c.trim, 0.25); ctx.fillRect(room.x1, Y - 4, W, 4); ctx.fillRect(room.x1, room.ceiling, W, 2);
  ctx.fillStyle = INK; ctx.fillRect(room.x1, Y - 14, W, 1); ctx.fillRect(room.x1, room.ceiling + 8, W, 1);
  checker(ctx, room.x1, Y - 22, W, 8, 'rgba(0, 0, 0, 0.12)');
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(room.x1, room.ceiling + 9, W, 2);
  checker(ctx, room.x1, room.ceiling + 11, W, 6, 'rgba(0, 0, 0, 0.1)', 1);
  if (room.kind === 'lobby' || room.kind === 'office') {
    // A chair rail round the room, panelling under it (each panel's moulding lit on its top and left, shadowed under)
    const rail = Y - 96, ph = Y - 14 - rail - 26;
    ctx.fillStyle = c.trim; ctx.fillRect(room.x1, rail, W, 5);
    ctx.fillStyle = lite(c.trim, 0.35); ctx.fillRect(room.x1, rail, W, 1);
    ctx.fillStyle = INK; ctx.fillRect(room.x1, rail + 5, W, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(room.x1, rail + 6, W, Y - 14 - rail - 6);
    checker(ctx, room.x1, rail + 6, W, 4, 'rgba(0, 0, 0, 0.1)');
    for (let x = room.x1 + 20; x < room.x2; x += 90) {
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(x, rail + 14, 60, 2); ctx.fillRect(x, rail + 14, 2, ph);
      ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(x + 2, rail + 14 + ph - 2, 58, 2); ctx.fillRect(x + 58, rail + 16, 2, ph - 2);
      ctx.fillStyle = 'rgba(0,0,0,0.06)'; ctx.fillRect(x + 4, rail + 18, 52, ph - 8);
    }
  }
  if (room.kind === 'lab') {
    // Tiled: a grid of white tiles, the grout between them, each tile's glaze catching the light at its top left
    for (let x = room.x1; x < room.x2; x += 40) {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.45)'; ctx.fillRect(x, room.ceiling + 8, 1, Y - room.ceiling - 22);
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(x + 1, room.ceiling + 8, 1, Y - room.ceiling - 22);
    }
    for (let y = room.ceiling + 48; y < Y - 40; y += 40) {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.45)'; ctx.fillRect(room.x1, y, W, 1);
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(room.x1, y + 1, W, 1);
      for (let x = room.x1 + 4; x < room.x2; x += 40) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(x, y + 4, 6, 1); ctx.fillRect(x, y + 5, 1, 3); }
    }
  }
  if (room.kind === 'maintenance') {
    // Cinderblock: the blocks' lit tops and shadowed undersides, a few of them stained or chipped
    for (let y = room.ceiling + 10; y < Y - 16; y += 16) {
      ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(room.x1, y + 1, W, 1);
      for (let x = room.x1 + ((y / 16) % 2) * 20; x < room.x2; x += 40) {
        ctx.fillStyle = 'rgba(0,0,0,0.14)'; ctx.fillRect(x + 38, y, 2, 16);
        const h = hash(x * 0.37 + y * 1.3);
        if (h < 0.08) { ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.fillRect(x + 2, y + 2, 36, 12); }
        else if (h > 0.95) { ctx.fillStyle = 'rgba(120, 53, 15, 0.18)'; ctx.fillRect(x + 6 + h * 10, y + 4, 4, 12); }
        else if (h > 0.9) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + 10, y + 6, 2, 2); ctx.fillRect(x + 25, y + 9, 1, 1); }
      }
    }
  }
  switch (room.kind) {
    case 'lobby': drawLobby(ctx, state, room); break;
    case 'office': drawOfficeWalls(ctx, state, room); break;
    case 'maintenance': drawMaintenanceWalls(ctx, state, room); break;
    case 'lab': drawLabWalls(ctx, state, room); break;
    case 'power': drawPowerWalls(ctx, state, room, rt); break;
  }
  // The floor
  drawFloor(ctx, state, room);
  // The ceiling's underside: a drop ceiling's tiles in their grid (the power room's steel deck), the slab over it
  drawCeiling(ctx, room);
  // The end walls
  // (solid: the building's outer walls, their inside faces catching the light)
  const eh = Y - room.ceiling + 46;
  ctx.fillStyle = c.trim; ctx.fillRect(room.x1 - 60, room.ceiling - 30, 60, eh); ctx.fillRect(room.x2, room.ceiling - 30, 60, eh);
  checker(ctx, room.x1 - 60, room.ceiling - 30, 30, eh, 'rgba(0, 0, 0, 0.16)');
  checker(ctx, room.x2 + 30, room.ceiling - 30, 30, eh, 'rgba(0, 0, 0, 0.16)', 1);
  ctx.fillStyle = lite(c.trim, 0.25); ctx.fillRect(room.x1 - 6, room.ceiling - 30, 6, eh);
  ctx.fillStyle = lite(c.trim, 0.45); ctx.fillRect(room.x1 - 6, room.ceiling - 30, 2, eh);
  ctx.fillStyle = dark(c.trim, 0.35); ctx.fillRect(room.x2, room.ceiling - 30, 6, eh);
  ctx.fillStyle = INK; ctx.fillRect(room.x1 - 1, room.ceiling - 30, 1, eh); ctx.fillRect(room.x2, room.ceiling - 30, 1, eh);
  // What's in it
  for (const pr of COURSE.props) if (pr.x >= room.x1 - 10 && pr.x <= room.x2 + 10 && visible(state, pr.x - 60, pr.x + 260)) drawRoomProp(ctx, state, pr, room);
  // The elevators: where you came in (not the lobby's), where you go on
  const el = COURSE.elevators.find(v => v.x > room.x1 && v.x < room.x2);
  if (el) drawElevator(ctx, el.x, room, rt.transit?.kind === 'elevator' ? 0 : 1, 'UP');
  if (room.kind !== 'lobby' && room.kind !== 'power') drawElevator(ctx, room.x1 + 10, room, 0, room.label);
};

/** The ceiling over a room: a 30-high strip under the slab. */
const drawCeiling = (ctx: Ctx, room: Room) => {
  const x1 = room.x1, w = room.x2 - room.x1, cy = room.ceiling - 30;
  const base = room.kind === 'lobby' ? '#A8A29E' : room.kind === 'power' ? '#111827' : '#D4D4D8';
  ctx.fillStyle = base; ctx.fillRect(x1, cy, w, 30);
  if (room.kind === 'power') {
    // (corrugated steel decking, a beam every so often)
    for (let x = x1; x < room.x2; x += 8) { ctx.fillStyle = '#1F2937'; ctx.fillRect(x, cy, 3, 26); ctx.fillStyle = '#273244'; ctx.fillRect(x, cy, 1, 26); }
    for (let x = x1 + 50; x < room.x2; x += 220) { slab(ctx, x, cy, 14, 30, '#334155', 1); ctx.fillStyle = '#64748B'; ctx.fillRect(x + 3, cy + 6, 2, 2); ctx.fillRect(x + 3, cy + 20, 2, 2); }
  } else {
    // (the tiles, each pitted, lit along its near edge; the T-bar grid between them)
    ctx.save(); ctx.translate(0, cy);
    ctx.fillStyle = tilePattern(ctx, 'barryCeil' + base, 12, 10, g => { g.fillStyle = base; g.fillRect(0, 0, 12, 10); g.fillStyle = dark(base, 0.12); g.fillRect(3, 2, 1, 1); g.fillRect(9, 6, 1, 1); g.fillRect(6, 8, 1, 1); g.fillStyle = lite(base, 0.15); g.fillRect(1, 5, 1, 1); });
    ctx.fillRect(x1, 0, w, 30);
    ctx.restore();
    for (let x = x1; x < room.x2; x += 60) {
      ctx.fillStyle = lite(base, 0.4); ctx.fillRect(x + 2, cy, 1, 26); ctx.fillRect(x + 2, cy + 25, 56, 1);
      ctx.fillStyle = dark(base, 0.3); ctx.fillRect(x, cy, 2, 30);
    }
    ctx.fillStyle = dark(base, 0.2); ctx.fillRect(x1, cy + 14, w, 1);
  }
  // (the ceiling's in the shade of its own tiles: darker toward its edge)
  checker(ctx, x1, room.ceiling - 12, w, 12, 'rgba(0, 0, 0, 0.14)');
  ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(x1, room.ceiling - 4, w, 4);
  ctx.fillStyle = INK; ctx.fillRect(x1, room.ceiling - 1, w, 1); ctx.fillRect(x1, cy, w, 1);
};

const drawFloor = (ctx: Ctx, state: GameState, room: Room) => {
  const x1 = room.x1, x2 = room.x2, w = x2 - x1;
  const bottom = state.camera.y + CANVAS_HEIGHT + 40;
  const c = WALLS[room.kind];
  ctx.fillStyle = c.floor; ctx.fillRect(x1, Y, w, 16);
  ctx.fillStyle = c.slab; ctx.fillRect(x1, Y + 16, w, bottom - Y - 16);
  if (room.kind === 'lobby') {
    // Polished marble: slabs with their veins, the lights' reflections in them, a dark border inlay
    for (let x = x1; x < x2; x += 80) {
      const h = hash(x * 0.13);
      ctx.fillStyle = h < 0.5 ? '#E7E5E4' : '#DEDBD8'; ctx.fillRect(x, Y, 80, 16);
      ctx.fillStyle = 'rgba(120, 113, 108, 0.35)'; for (let k = 0; k < 5; k++) ctx.fillRect(x + 6 + Math.floor(h * 30) + k * 6, Y + 3 + k * 2, 7, 1);
      ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(x + 30, Y + 4, 18, 2);
      ctx.fillStyle = 'rgba(120, 113, 108, 0.45)'; ctx.fillRect(x, Y, 2, 16);
    }
    ctx.fillStyle = '#57534E'; ctx.fillRect(x1, Y + 11, w, 2);
  }
  if (room.kind === 'office') {
    // Industrial carpet: a flecked weave
    ctx.save(); ctx.translate(0, Y);
    ctx.fillStyle = tilePattern(ctx, 'barryCarpet', 8, 4, g => { g.fillStyle = '#475569'; g.fillRect(0, 0, 8, 4); g.fillStyle = '#3B475A'; g.fillRect(0, 1, 2, 1); g.fillRect(4, 3, 2, 1); g.fillStyle = '#56657B'; g.fillRect(2, 0, 1, 1); g.fillRect(6, 2, 1, 1); });
    ctx.fillRect(x1, 0, w, 16);
    ctx.restore();
  }
  if (room.kind === 'maintenance') {
    // Sealed concrete: expansion joints, oil stains
    ctx.fillStyle = '#4A4643'; for (let x = x1; x < x2; x += 120) ctx.fillRect(x, Y, 2, 16);
    ctx.fillStyle = '#6B6661'; for (let x = x1; x < x2; x += 120) ctx.fillRect(x + 2, Y, 1, 16);
    for (let x = x1 + 40; x < x2; x += 170) { ctx.fillStyle = 'rgba(28, 25, 23, 0.45)'; ctx.fillRect(x - 28, Y + 4, 56, 3); ctx.fillRect(x - 20, Y + 3, 40, 5); ctx.fillStyle = 'rgba(147, 112, 219, 0.18)'; ctx.fillRect(x - 10, Y + 4, 12, 1); }
  }
  if (room.kind === 'lab') {
    // Sheet vinyl tiles, a glint in each
    for (let x = x1; x < x2; x += 32) { ctx.fillStyle = 'rgba(148, 163, 184, 0.55)'; ctx.fillRect(x, Y, 1, 16); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(x + 4, Y + 3, 8, 1); }
  }
  if (room.kind === 'power') {
    // A steel grate: the bars lit on top, the dark under them
    ctx.fillStyle = '#0B0F17'; ctx.fillRect(x1, Y + 2, w, 12);
    for (let x = x1; x < x2; x += 10) { ctx.fillStyle = '#374151'; ctx.fillRect(x, Y + 2, 5, 12); ctx.fillStyle = '#4B5563'; ctx.fillRect(x, Y + 2, 5, 2); ctx.fillStyle = '#1F2937'; ctx.fillRect(x + 4, Y + 4, 1, 10); }
  }
  // (the floor's edge: lit along the top, going dark down into the slab, dithered)
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(x1, Y, w, 1);
  checker(ctx, x1, Y + 8, w, 8, 'rgba(0, 0, 0, 0.2)');
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x1, Y + 14, w, 2);
  ctx.fillStyle = INK; ctx.fillRect(x1, Y + 16, w, 1);
};

/** An elevator's doors (shut, or open by `open` 0..1), its floor indicator. */
const drawElevator = (ctx: Ctx, x: number, room: Room, open: number, label: string) => {
  const w = 70, h = 120;
  // The surround: brushed steel, bevelled
  slab(ctx, x - 6, Y - h - 6, w + 12, h + 6, '#6B7280', 2);
  ctx.fillStyle = '#7C8491'; for (let yy = Y - h - 3; yy < Y; yy += 3) ctx.fillRect(x - 4, yy, 2, 1);
  // The car behind the doors: dark, its light spilling
  ctx.fillStyle = '#111827'; ctx.fillRect(x, Y - h, w, h);
  if (open > 0) { ctx.fillStyle = '#1E293B'; ctx.fillRect(x + 4, Y - h, w - 8, 6); ctx.fillStyle = 'rgba(254, 243, 199, 0.18)'; ctx.fillRect(x + 8, Y - h + 6, w - 16, h - 6); ctx.fillStyle = '#374151'; ctx.fillRect(x, Y - 40, w, 2); }
  // The doors: each shaded steel, a seam between them, the reflection of the lights down them
  const half = (w / 2) * (1 - open * 0.8);
  for (const [dx, dw] of [[x, half], [x + w - half, half]] as [number, number][]) {
    if (dw < 1) continue;
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(dx, Y - h, dw, h);
    ctx.fillStyle = '#BCB7B3'; ctx.fillRect(dx, Y - h, Math.max(1, dw * 0.3), h);
    ctx.fillStyle = '#8D8782'; ctx.fillRect(dx + dw * 0.72, Y - h, dw * 0.28, h);
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(dx + Math.min(4, dw - 2), Y - h, 2, h);
    checker(ctx, dx, Y - 30, dw, 30, 'rgba(0, 0, 0, 0.1)');
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(dx + 0.5, Y - h + 0.5, dw - 1, h - 1);
  }
  // The indicator over it: a dark panel, the floor lit orange in it, glowing
  slab(ctx, x + 15, Y - h - 20, 40, 12, '#1F2937', 1);
  ctx.fillStyle = '#0B0F17'; ctx.fillRect(x + 17, Y - h - 18, 36, 8);
  steppedGlow(ctx, x + 35, Y - h - 14, 16, '#F97316', 0.25, 0.05, 3);
  letter(ctx, label, x + 35, Y - h - 11, 'bold 7px "Press Start 2P"', '#FDBA74', '#7C2D12');
  // The call button's plate beside it, the button lit
  slab(ctx, x + w + 8, Y - 80, 12, 22, '#9CA3AF', 1);
  ink(ctx, () => ctx.arc(x + w + 14, Y - 70, 4, 0, Math.PI * 2), '#FDE047');
  ctx.fillStyle = '#FEF9C3'; ctx.fillRect(x + w + 12, Y - 72, 2, 2);
  steppedGlow(ctx, x + w + 14, Y - 70, 9, '#FDE047', 0.25, 0.05, 3);
  void room;
};

/** Night out of the windows of the upper floors (the city going dark in waves). */
const drawWindows = (ctx: Ctx, state: GameState, room: Room, every: number) => {
  for (let x = room.x1 + 80; x < room.x2 - 120; x += every) {
    if (!visible(state, x, x + 120)) continue;
    const wy = room.ceiling + 30, wh = Y - room.ceiling - 110;
    bandedGradient(ctx, x, wy, 120, wh, ['#050912', '#0B1220', '#121B30'], 5);
    const out = blackout(state.frame, x * 3) > 0.5;
    for (let k = 0; k < 10; k++) {
      const bx = x + 4 + k * 12, bh = 20 + hash(x + k) * 60;
      ctx.fillStyle = '#111827'; ctx.fillRect(bx, wy + wh - bh, 10, bh);
      ctx.fillStyle = '#1A2233'; ctx.fillRect(bx, wy + wh - bh, 2, bh);
      ctx.fillStyle = out ? '#1F2937' : '#FCD34D';
      if (hash(x * k) < 0.5) ctx.fillRect(bx + 3, wy + wh - bh + 6, 2, 2);
      if (hash(x * k + 3) < 0.4) ctx.fillRect(bx + 6, wy + wh - bh + 14, 2, 2);
    }
    // (the glass: a pale streak of the room reflected across it)
    ctx.fillStyle = 'rgba(203, 213, 225, 0.08)';
    ctx.beginPath(); ctx.moveTo(x + 10, wy + wh); ctx.lineTo(x + 40, wy); ctx.lineTo(x + 52, wy); ctx.lineTo(x + 22, wy + wh); ctx.fill();
    // The frame: aluminium, inked, a mullion down the middle, the sill
    ctx.fillStyle = '#94A3B8'; ctx.fillRect(x - 2, wy - 2, 124, 4); ctx.fillRect(x - 2, wy - 2, 4, wh + 4); ctx.fillRect(x + 118, wy - 2, 4, wh + 4); ctx.fillRect(x + 58, wy, 4, wh);
    ctx.fillStyle = '#CBD5E1'; ctx.fillRect(x - 2, wy - 2, 124, 1); ctx.fillRect(x - 2, wy - 2, 1, wh + 4); ctx.fillRect(x + 58, wy, 1, wh);
    ctx.fillStyle = '#64748B'; ctx.fillRect(x + 121, wy - 2, 1, wh + 4); ctx.fillRect(x + 61, wy, 1, wh);
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x - 2.5, wy - 2.5, 125, wh + 5);
    slab(ctx, x - 6, wy + wh + 2, 132, 5, '#A8A29E', 1);
  }
};

const drawLobby = (ctx: Ctx, state: GameState, room: Room) => {
  // Marble panels (veined, a seam between each, lit along it), a big BARRY PLAZA sign, a portrait of the man himself
  for (let x = room.x1; x < room.x2; x += 120) {
    if (!visible(state, x, x + 120)) continue;
    ctx.fillStyle = 'rgba(120, 113, 108, 0.3)'; ctx.fillRect(x, room.ceiling, 2, Y - room.ceiling);
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(x + 2, room.ceiling, 1, Y - room.ceiling);
    // (veins wandering down it, in steps)
    ctx.fillStyle = 'rgba(120, 113, 108, 0.1)';
    for (let v = 0; v < 2; v++) { let vx = x + 20 + hash(x + v) * 80; for (let vy = room.ceiling + 14; vy < Y - 100; vy += 6) { vx += (hash(vx + vy) - 0.5) * 4; ctx.fillRect(Math.round(vx), vy, 1, 6); } }
  }
  const sx = room.x1 + 700;
  if (visible(state, sx, sx + 300)) {
    // The sign: black granite, a gold rule inside its edge, the name in gold leaf
    slab(ctx, sx, room.ceiling + 40, 300, 40, '#1C1917', 2);
    ctx.strokeStyle = '#A16207'; ctx.lineWidth = 1; ctx.strokeRect(sx + 4.5, room.ceiling + 44.5, 291, 31);
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(sx + 6, room.ceiling + 46, 288, 6);
    letter(ctx, 'BARRY PLAZA', sx + 150, room.ceiling + 67, 'bold 14px "Press Start 2P"', '#FACC15', '#713F12');
    ctx.fillStyle = '#FEF9C3'; ctx.fillRect(sx + 52, room.ceiling + 55, 2, 2); ctx.fillRect(sx + 200, room.ceiling + 55, 2, 2);
    // The portrait: Barry, dark glasses, lightning bolt tie; in a gilt frame, a picture light over it
    const px = sx + 110, py = room.ceiling + 100;
    slab(ctx, px, py, 80, 96, '#A16207', 3);
    ctx.fillStyle = '#CA8A04'; ctx.fillRect(px + 3, py + 3, 74, 1); ctx.fillStyle = '#713F12'; ctx.fillRect(px + 5, py + 5, 70, 1); ctx.fillRect(px + 5, py + 5, 1, 86);
    bandedGradient(ctx, px + 6, py + 6, 68, 84, ['#2E2A6B', '#1E1B4B', '#14113A'], 5);
    ctx.save(); ctx.beginPath(); ctx.rect(px + 6, py + 6, 68, 84); ctx.clip();
    // (his suit's shoulders, the shirt and the tie)
    shaded(ctx, () => ctx.roundRect(px + 14, py + 62, 52, 40, [14, 14, 0, 0]), '#27272A', px + 14, py + 62, 52, 40);
    ink(ctx, () => { ctx.moveTo(px + 32, py + 62); ctx.lineTo(px + 40, py + 80); ctx.lineTo(px + 48, py + 62); ctx.closePath(); }, '#F8FAFC');
    ink(ctx, () => { ctx.moveTo(px + 40, py + 60); ctx.lineTo(px + 34, py + 76); ctx.lineTo(px + 41, py + 74); ctx.lineTo(px + 36, py + 88); ctx.lineTo(px + 48, py + 68); ctx.lineTo(px + 41, py + 70); ctx.closePath(); }, '#FDE047', 0.8);
    // (his head: slicked hair, the shades, a smug little mouth)
    shaded(ctx, () => ctx.ellipse(px + 40, py + 40, 15, 17, 0, 0, Math.PI * 2), '#E0AC69', px + 25, py + 23, 30, 34);
    ink(ctx, () => { ctx.moveTo(px + 25, py + 38); ctx.quadraticCurveTo(px + 26, py + 20, px + 42, py + 22); ctx.quadraticCurveTo(px + 56, py + 24, px + 55, py + 36); ctx.quadraticCurveTo(px + 46, py + 28, px + 30, py + 32); ctx.closePath(); }, '#1C1917');
    ctx.fillStyle = '#57534E'; ctx.fillRect(px + 34, py + 25, 8, 1);
    ink(ctx, () => ctx.roundRect(px + 27, py + 36, 26, 7, 2), '#111827', 0.8);
    ctx.fillStyle = '#6B7280'; ctx.fillRect(px + 30, py + 37, 4, 1); ctx.fillRect(px + 44, py + 37, 4, 1);
    ctx.fillStyle = INK; ctx.fillRect(px + 36, py + 50, 9, 1); ctx.fillRect(px + 45, py + 49, 2, 1);
    ctx.restore();
    // (the picture light: a brass hood, the light down the canvas in bands)
    slab(ctx, px + 24, py - 6, 32, 6, '#CA8A04', 1);
    ctx.fillStyle = 'rgba(254, 243, 199, 0.1)'; ctx.fillRect(px + 10, py + 6, 60, 30); ctx.fillStyle = 'rgba(254, 243, 199, 0.06)'; ctx.fillRect(px + 6, py + 36, 68, 30);
  }
  // The street through the glass at the near end: the night out there, the mullions, the streetlight's glow
  const gx = room.x1, gy = room.ceiling + 30, gh = Y - room.ceiling - 44;
  ctx.globalAlpha = 0.78; bandedGradient(ctx, gx, gy, 120, gh, ['#0F172A', '#1E3A5F', '#334155'], 6); ctx.globalAlpha = 1;
  steppedGlow(ctx, gx + 70, gy + 60, 34, '#FEF3C7', 0.25, 0.03, 4);
  ctx.fillStyle = 'rgba(203, 213, 225, 0.12)'; ctx.beginPath(); ctx.moveTo(gx + 10, gy + gh); ctx.lineTo(gx + 70, gy); ctx.lineTo(gx + 90, gy); ctx.lineTo(gx + 30, gy + gh); ctx.fill();
  ctx.fillStyle = '#44403C'; ctx.fillRect(gx, gy, 120, 3); ctx.fillRect(gx + 58, gy, 4, gh); ctx.fillRect(gx + 116, gy, 4, gh);
  ctx.fillStyle = '#78716C'; ctx.fillRect(gx + 58, gy, 1, gh); ctx.fillRect(gx + 116, gy, 1, gh);
  ctx.fillStyle = INK; ctx.fillRect(gx, gy + 3, 120, 1); ctx.fillRect(gx + 119, gy, 1, gh);
};

const POSTERS = ['SYNERGY', 'HUSTLE', 'GRIND', 'OWN IT'];

const drawOfficeWalls = (ctx: Ctx, state: GameState, room: Room) => {
  drawWindows(ctx, state, room, 420);
  // Motivational posters: a sunrise over a summit, the word under it, in a black frame
  for (let x = room.x1 + 280; x < room.x2; x += 420) {
    if (!visible(state, x, x + 60)) continue;
    const py = room.ceiling + 40;
    slab(ctx, x, py, 60, 44, '#1C1917', 2);
    bandedGradient(ctx, x + 3, py + 3, 54, 28, ['#1E3A8A', '#4338CA', '#C2410C', '#F59E0B'], 4);
    steppedGlow(ctx, x + 30, py + 24, 10, '#FDE68A', 1, 0.6, 3);
    ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(x + 30, py + 24, 7, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#1E293B'; ctx.beginPath(); ctx.moveTo(x + 3, py + 31); ctx.lineTo(x + 18, py + 16); ctx.lineTo(x + 26, py + 23); ctx.lineTo(x + 38, py + 12); ctx.lineTo(x + 57, py + 31); ctx.fill();
    ctx.fillStyle = '#E2E8F0'; ctx.beginPath(); ctx.moveTo(x + 34, py + 16); ctx.lineTo(x + 38, py + 12); ctx.lineTo(x + 42, py + 16); ctx.lineTo(x + 38, py + 15); ctx.fill();
    ctx.fillStyle = '#0B0F17'; ctx.fillRect(x + 3, py + 31, 54, 10);
    letter(ctx, POSTERS[Math.floor(x / 420) & 3], x + 30, py + 39, '5px "Press Start 2P"', '#F8FAFC', '#475569', 50);
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(x + 4, py + 4, 1, 8);
  }
};

const drawMaintenanceWalls = (ctx: Ctx, state: GameState, room: Room) => {
  // Cinderblock, pipes along the top (hung off brackets, flanged), gauges on stub pipes
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; for (let y = room.ceiling + 10; y < Y; y += 16) for (let x = room.x1 + ((y / 16) % 2) * 20; x < room.x2; x += 40) ctx.fillRect(x, y, 38, 1);
  const W = room.x2 - room.x1;
  pipe(ctx, room.x1, room.ceiling + 14, W, 10, '#78716C');
  pipe(ctx, room.x1, room.ceiling + 30, W, 7, '#B45309');
  for (let x = room.x1 + 60; x < room.x2; x += 160) {
    if (!visible(state, x, x + 20)) continue;
    ctx.fillStyle = '#3F3F46'; ctx.fillRect(x + 6, room.ceiling + 9, 2, 5); ctx.fillRect(x + 6, room.ceiling + 24, 2, 6);
    column(ctx, x, room.ceiling + 12, 6, 14, '#57534E');
    column(ctx, x + 40, room.ceiling + 28, 5, 11, '#92400E');
    ctx.fillStyle = '#FDE68A'; ctx.fillRect(x + 41, room.ceiling + 31, 1, 2);
  }
  for (let x = room.x1 + 100; x < room.x2; x += 260) {
    if (!visible(state, x, x + 20)) continue;
    column(ctx, x - 2, room.ceiling + 37, 4, 14, '#92400E');
    gauge(ctx, x, room.ceiling + 60, 9, -Math.PI / 4 + Math.sin(state.frame * 0.1 + x) * 0.5);
  }
};

const drawLabWalls = (ctx: Ctx, state: GameState, room: Room) => {
  // Sterile white, a hazard stripe along the bottom, warning signs
  hazard(ctx, room.x1, Y - 40, room.x2 - room.x1, 12, 12);
  for (let x = room.x1 + 360; x < room.x2 - 200; x += 520) {
    if (!visible(state, x, x + 50)) continue;
    const tri = () => { ctx.moveTo(x + 25, room.ceiling + 40); ctx.lineTo(x, room.ceiling + 84); ctx.lineTo(x + 50, room.ceiling + 84); ctx.closePath(); };
    ctx.save(); ctx.beginPath(); tri(); ctx.clip();
    ctx.fillStyle = '#FACC15'; ctx.fillRect(x, room.ceiling + 40, 50, 44);
    ctx.fillStyle = '#FDE68A'; ctx.fillRect(x, room.ceiling + 40, 22, 44);
    ctx.fillStyle = '#CA8A04'; ctx.fillRect(x + 34, room.ceiling + 40, 16, 44); ctx.fillRect(x, room.ceiling + 80, 50, 4);
    ctx.restore();
    ctx.beginPath(); tri(); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.strokeStyle = '#1C1917'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 25, room.ceiling + 47); ctx.lineTo(x + 6, room.ceiling + 80); ctx.lineTo(x + 44, room.ceiling + 80); ctx.closePath(); ctx.stroke();
    ctx.fillStyle = '#111827'; ctx.fillRect(x + 23, room.ceiling + 58, 4, 13); ctx.fillRect(x + 23, room.ceiling + 74, 4, 4);
  }
  ctx.font = 'bold 7px "Press Start 2P"';
  ctx.fillStyle = '#7F1D1D'; ctx.fillText('R&D - AUTHORIZED PERSONNEL ONLY - NO PHOTOGRAPHY - NO QUESTIONS', room.x1 + 101, room.ceiling + 25);
  ctx.fillStyle = '#DC2626'; ctx.fillText('R&D - AUTHORIZED PERSONNEL ONLY - NO PHOTOGRAPHY - NO QUESTIONS', room.x1 + 100, room.ceiling + 24);
};

const drawPowerWalls = (ctx: Ctx, state: GameState, room: Room, rt: BarryRuntime) => {
  const f = state.frame;
  const x1 = room.x1, x2 = room.x2, top = room.ceiling;
  // Cable bundles along the top (zip-tied), riveted wall panels, a hazard stripe along the bottom
  const cables = ['#111827', '#1E293B', '#7F1D1D', '#111827'];
  for (let k = 0; k < 4; k++) { ctx.fillStyle = INK; ctx.fillRect(x1, top + 11 + k * 6, x2 - x1, 5); ctx.fillStyle = cables[k]; ctx.fillRect(x1, top + 12 + k * 6, x2 - x1, 3); ctx.fillStyle = lite(cables[k], 0.25); ctx.fillRect(x1, top + 12 + k * 6, x2 - x1, 1); }
  ctx.fillStyle = '#A8A29E'; for (let x = x1 + 40; x < x2; x += 120) ctx.fillRect(x, top + 10, 2, 25);
  for (let x = x1; x < x2; x += 110) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x, top + 40, 2, Y - top - 70);
    ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(x + 2, top + 40, 1, Y - top - 70);
  }
  for (let x = x1 + 6; x < x2; x += 110) for (let y = top + 48; y < Y - 40; y += 40) {
    ctx.fillStyle = '#111827'; ctx.fillRect(x, y, 3, 3); ctx.fillStyle = '#4B5563'; ctx.fillRect(x, y, 1, 1);
  }
  hazard(ctx, x1, Y - 30, x2 - x1, 14, 15);
  // The grid board, right across the top of the wall: NYC GRID CONTROL, and what each of the generators runs,
  // going from green to flashing red as they go
  const bx = x1 + 150, bw = x2 - x1 - 300, by = top + 44, bh = 84;
  slab(ctx, bx - 3, by - 3, bw + 6, bh + 6, '#334155', 2);
  ctx.fillStyle = '#0B1220'; ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = '#38BDF8'; ctx.fillRect(bx, by, bw, 1); ctx.fillRect(bx, by + bh - 1, bw, 1); ctx.fillRect(bx, by, 1, bh); ctx.fillRect(bx + bw - 1, by, 1, bh);
  ctx.fillStyle = '#0E7490'; ctx.fillRect(bx + 1, by + 1, bw - 2, 15);
  ctx.fillStyle = '#22D3EE'; ctx.fillRect(bx + 1, by + 1, bw - 2, 1); ctx.fillStyle = '#155E75'; ctx.fillRect(bx + 1, by + 15, bw - 2, 1);
  letter(ctx, 'NYC GRID CONTROL', bx + bw / 2, by + 12, 'bold 8px "Press Start 2P"', '#E0F2FE', '#164E63', bw - 20);
  const systems = ['SUBWAY', 'TRAFFIC', 'EVERYTHING'];
  const cw = (bw - 40) / systems.length;
  systems.forEach((name, i) => {
    const cx = bx + 20 + i * cw, down = i < rt.power.gone;
    const col = down ? (Math.floor(f / 10) % 2 ? '#DC2626' : '#7F1D1D') : '#16A34A';
    slab(ctx, cx + 6, by + 26, cw - 12, 28, col, 2);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let yy = by + 28; yy < by + 52; yy += 2) ctx.fillRect(cx + 8, yy, cw - 16, 1);
    letter(ctx, name, cx + cw / 2, by + 44, 'bold 7px "Press Start 2P"', '#F8FAFC', dark(col, 0.5), cw - 18);
    led(ctx, cx + 12, by + 64, 4, !down || Math.floor(f / 10) % 2 === 0, down ? '#EF4444' : '#22C55E');
    letter(ctx, down ? 'OFFLINE' : 'ONLINE', cx + cw / 2, by + 70, '6px "Press Start 2P"', down ? '#FCA5A5' : '#86EFAC', '#020617', cw - 18);
  });
  // (the board's glass: scanlines)
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; for (let yy = by + 17; yy < by + bh; yy += 3) ctx.fillRect(bx + 1, yy, bw - 2, 1);
  // Not in yet (the fade in, before the room's turn has put them out): the generators and Barry's man drawn where
  // they'll be, so nothing pops in
  if (rt.power.phase === 'waiting') {
    for (const gx of COURSE.generators) drawGenerator(ctx, standIn('generator', gx), state, 100);
    const m = standIn('minion', COURSE.power.x2 - 160); m.aiState = 'taunt'; m.facing = -1;
    drawKindEnemy(ctx, m, state);
  }
  // A breaker panel at either end: a steel box, its breakers in rows, each with its light blinking
  for (const px of [x1 + 30, x2 - 110]) {
    slab(ctx, px, top + 60, 80, 110, '#374151', 2);
    ctx.fillStyle = '#4B5563'; ctx.fillRect(px + 4, top + 64, 72, 2);
    for (let k = 0; k < 8; k++) {
      const bx2 = px + 10 + (k % 2) * 34, by2 = top + 72 + Math.floor(k / 2) * 22;
      slab(ctx, bx2, by2, 26, 14, '#1F2937', 1);
      ctx.fillStyle = '#9CA3AF'; ctx.fillRect(bx2 + 14, by2 + 4, 8, 6); ctx.fillStyle = '#D1D5DB'; ctx.fillRect(bx2 + 14, by2 + 4, 8, 1);
      led(ctx, px + 14 + (k % 2) * 34, top + 76 + Math.floor(k / 2) * 22, 5, (f + k * 13) % 40 < 30, '#22C55E');
    }
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(px + 30, top + 160, 20, 5); ctx.fillStyle = '#DC2626'; ctx.fillRect(px + 30, top + 160, 20, 2);
  }
};

const drawRoomProp = (ctx: Ctx, state: GameState, pr: Prop, room: Room) => {
  const f = state.frame;
  const { x, y } = pr;
  const w = pr.w ?? 100, h = pr.h ?? 60;
  switch (pr.look) {
    case 'desk': {
      // The security desk: a stone-fronted counter in panels, its top lit, SECURITY across it, the monitor on it
      slab(ctx, x, y - h, w, h, '#44403C', 2);
      for (let px = x + 8; px + 50 < x + w; px += 58) { ctx.fillStyle = '#3A3633'; ctx.fillRect(px, y - h + 14, 50, h - 22); ctx.fillStyle = '#57534E'; ctx.fillRect(px, y - 8, 50, 1); ctx.fillRect(px + 49, y - h + 14, 1, h - 22); ctx.fillStyle = INK; ctx.fillRect(px, y - h + 14, 50, 1); }
      slab(ctx, x - 6, y - h, w + 12, 8, '#78716C', 2);
      slab(ctx, x + 34, y - h + 21, 70, 13, '#1C1917', 1);
      letter(ctx, 'SECURITY', x + 69, y - h + 30, 'bold 6px "Press Start 2P"', '#FACC15', '#713F12');
      // (the monitor on its stand, the guard's coffee)
      column(ctx, x + 33, y - h - 8, 8, 8, '#374151');
      screen(ctx, x + 20, y - h - 30, 34, 22, '#60A5FA');
      ink(ctx, () => ctx.rect(x + 120, y - h - 10, 9, 10), '#F8FAFC'); ctx.fillStyle = '#B91C1C'; ctx.fillRect(x + 120, y - h - 7, 9, 3); ctx.fillStyle = '#D6D3D1'; ctx.fillRect(x + 127, y - h - 9, 1, 8);
      break;
    }
    case 'turnstiles':
      for (let k = 0; k < 3; k++) {
        const tx = x + k * 50;
        // (a brushed steel post, its cap, the arm across, the light on top red and green by turns)
        column(ctx, tx, y - 44, 20, 44, '#9CA3AF');
        slab(ctx, tx - 2, y - 46, 24, 4, '#D1D5DB', 1);
        ctx.fillStyle = '#1F2937'; ctx.fillRect(tx + 4, y - 30, 12, 6); ctx.fillStyle = '#38BDF8'; ctx.fillRect(tx + 5, y - 29, 10, 1);
        pipe(ctx, tx + 20, y - 35, 26, 5, '#6B7280');
        ctx.fillStyle = '#1F2937'; ctx.fillRect(tx + 44, y - 36, 3, 7);
        led(ctx, tx + 6, y - 40, 8, true, Math.floor(f / 30) % 2 ? '#DC2626' : '#22C55E');
      }
      break;
    case 'planter': {
      // A stone planter, a fern spilling out of it (each frond inked, lit down one side)
      for (let k = -2; k <= 2; k++) {
        const fx = x + k * 8, fy = y - 60 - Math.abs(k) * -4;
        const leaf = () => ctx.ellipse(fx, fy, 6, 22, k * 0.3, 0, Math.PI * 2);
        ctx.save(); ctx.beginPath(); leaf(); ctx.clip();
        ctx.fillStyle = '#166534'; ctx.fillRect(fx - 24, fy - 24, 48, 48);
        ctx.fillStyle = '#22863F'; ctx.fillRect(fx - 24, fy - 24, 22, 48);
        ctx.fillStyle = '#0F4A26'; ctx.fillRect(fx + 3, fy - 24, 21, 48);
        ctx.fillStyle = '#4ADE80'; ctx.fillRect(fx - 3, fy - 16, 1, 10);
        ctx.restore();
        ctx.beginPath(); leaf(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
      }
      slab(ctx, x - 24, y - 40, 48, 40, '#57534E', 2);
      slab(ctx, x - 27, y - 42, 54, 6, '#78716C', 1);
      ctx.fillStyle = '#292524'; ctx.fillRect(x - 22, y - 36, 44, 2);
      ctx.fillStyle = '#44403C'; ctx.fillRect(x - 20, y - 24, 40, 1); ctx.fillStyle = '#6B6661'; ctx.fillRect(x - 20, y - 23, 40, 1);
      break;
    }
    case 'cubicle': {
      // A cubicle wall: grey fabric, its aluminium top rail, sticky notes curling, a monitor peering over
      slab(ctx, x, y - h, w, h, '#6B7280', 2);
      ctx.fillStyle = tilePattern(ctx, 'barryFabric', 4, 4, g => { g.fillStyle = '#6B7280'; g.fillRect(0, 0, 4, 4); g.fillStyle = '#636975'; g.fillRect(0, 0, 1, 1); g.fillRect(2, 2, 1, 1); g.fillStyle = '#747A87'; g.fillRect(1, 3, 1, 1); g.fillRect(3, 1, 1, 1); });
      ctx.fillRect(x + 2, y - h + 8, w - 4, h - 10);
      ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(x + w / 2, y - h + 6, 2, h - 6);
      checker(ctx, x + 2, y - 12, w - 4, 10, 'rgba(0, 0, 0, 0.12)');
      slab(ctx, x - 1, y - h, w + 2, 6, '#9CA3AF', 1);
      // (sticky notes)
      for (const [nx, ny] of [[x + 30, y - h + 16], [x + 90, y - h + 22]]) { ink(ctx, () => ctx.rect(nx, ny, 10, 10), '#FDE047', 0.8); ctx.fillStyle = '#CA8A04'; ctx.fillRect(nx + 7, ny + 7, 3, 3); ctx.fillStyle = '#A16207'; ctx.fillRect(nx + 2, ny + 3, 5, 1); ctx.fillRect(nx + 2, ny + 5, 4, 1); }
      screen(ctx, x + 60, y - h - 26, 34, 22, hash(x) < 0.5 ? '#60A5FA' : '#22C55E');
      break;
    }
    case 'bigdesk': {
      // The boss's desk: walnut, its top lit and grained, a modesty panel; a stack of paper, a banker's lamp
      slab(ctx, x, y - h, w, h, '#78350F', 2);
      ctx.fillStyle = '#6B2F0D'; for (let gx = x + 6; gx < x + w - 6; gx += 11) ctx.fillRect(gx, y - h + 10, 1, h - 14);
      ctx.fillStyle = '#5A270B'; ctx.fillRect(x + 12, y - h + 14, w - 24, h - 22); ctx.fillStyle = '#8A4214'; ctx.fillRect(x + 12, y - 8, w - 24, 1); ctx.fillRect(x + w - 13, y - h + 14, 1, h - 22);
      ctx.fillStyle = INK; ctx.fillRect(x + 12, y - h + 14, w - 24, 1);
      slab(ctx, x - 6, y - h, w + 12, 8, '#92400E', 2);
      ctx.fillStyle = '#B45309'; ctx.fillRect(x + 10, y - h + 3, 30, 1); ctx.fillRect(x + 70, y - h + 4, 40, 1);
      slab(ctx, x + 110, y - h - 16, 20, 14, '#F8FAFC', 1); ctx.fillStyle = '#CBD5E1'; ctx.fillRect(x + 111, y - h - 11, 18, 1); ctx.fillRect(x + 111, y - h - 7, 18, 1);
      // (the lamp: a brass stem, the green glass shade lit along its top, the light under it)
      ctx.fillStyle = 'rgba(254, 243, 199, 0.18)'; ctx.fillRect(x + 14, y - h - 2, 36, 2);
      column(ctx, x + 30, y - h - 6, 3, 6, '#CA8A04');
      ink(ctx, () => { ctx.moveTo(x + 20, y - h - 4); ctx.lineTo(x + 24, y - h - 10); ctx.lineTo(x + 40, y - h - 10); ctx.lineTo(x + 44, y - h - 4); ctx.closePath(); }, '#15803D');
      ctx.fillStyle = '#4ADE80'; ctx.fillRect(x + 25, y - h - 9, 10, 1); ctx.fillStyle = '#FEF3C7'; ctx.fillRect(x + 22, y - h - 5, 20, 1);
      break;
    }
    case 'copier': {
      // The copier: a big beige box, its lid, the paper trays, the panel with JAMMED on it and a sheet chewed half out
      slab(ctx, x, y - 70, 70, 70, '#D1D5DB', 2);
      for (let k = 0; k < 3; k++) { ctx.fillStyle = '#9CA3AF'; ctx.fillRect(x + 4, y - 40 + k * 12, 62, 1); ctx.fillStyle = '#F3F4F6'; ctx.fillRect(x + 4, y - 39 + k * 12, 62, 1); ctx.fillStyle = '#6B7280'; ctx.fillRect(x + 30, y - 35 + k * 12, 10, 2); }
      slab(ctx, x + 6, y - 80, 58, 10, '#9CA3AF', 1);
      slab(ctx, x + 4, y - 66, 44, 14, '#1F2937', 1);
      ctx.fillStyle = '#0B1220'; ctx.fillRect(x + 6, y - 64, 40, 10);
      ctx.fillStyle = '#F8FAFC'; ctx.font = '5px "Press Start 2P"'; ctx.fillText('JAMMED', x + 8, y - 57);
      led(ctx, x + 54, y - 64, 6, true, Math.floor(f / 8) % 2 ? '#22C55E' : '#DC2626');
      ink(ctx, () => { ctx.moveTo(x + 70, y - 46); ctx.lineTo(x + 80, y - 50); ctx.lineTo(x + 82, y - 40); ctx.lineTo(x + 70, y - 38); ctx.closePath(); }, '#F8FAFC', 0.8);
      ctx.fillStyle = '#9CA3AF'; ctx.fillRect(x + 74, y - 46, 5, 1); ctx.fillRect(x + 74, y - 43, 6, 1);
      break;
    }
    case 'cooler': {
      // The water cooler: the cabinet, two taps, the blue jug upside down on it, a bubble going up
      slab(ctx, x, y - 60, 36, 60, '#E5E7EB', 2);
      ctx.fillStyle = '#9CA3AF'; ctx.fillRect(x + 6, y - 46, 24, 14); ctx.fillStyle = '#6B7280'; ctx.fillRect(x + 6, y - 34, 24, 2);
      ink(ctx, () => ctx.rect(x + 9, y - 52, 5, 6), '#3B82F6', 0.8); ink(ctx, () => ctx.rect(x + 22, y - 52, 5, 6), '#EF4444', 0.8);
      const jug = () => ctx.roundRect(x + 4, y - 100, 28, 42, 8);
      ctx.save(); ctx.beginPath(); jug(); ctx.clip();
      ctx.fillStyle = 'rgba(147, 197, 253, 0.85)'; ctx.fillRect(x + 4, y - 100, 28, 42);
      ctx.fillStyle = 'rgba(191, 219, 254, 0.9)'; ctx.fillRect(x + 4, y - 100, 9, 42);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.6)'; ctx.fillRect(x + 24, y - 100, 8, 42);
      ctx.fillStyle = 'rgba(30, 64, 175, 0.25)'; ctx.fillRect(x + 4, y - 86, 28, 2); ctx.fillRect(x + 4, y - 74, 28, 2);
      ctx.fillStyle = 'rgba(219, 234, 254, 0.7)'; ctx.fillRect(x + 4, y - 100, 28, 6);
      ctx.restore();
      ctx.beginPath(); jug(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x + 8, y - 94, 2, 10);
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(Math.round(x + 11 + Math.sin(f * 0.05) * 6), Math.round(y - 71 - ((f * 0.5) % 24)), 3, 3);
      break;
    }
    case 'ducts': {
      // Galvanized ductwork hung low: its seams and rivets, the light along its top, LOW CLEARANCE on a sticker, the rods it hangs off
      ctx.fillStyle = '#4B5563'; ctx.fillRect(x + 19, room.ceiling, 2, y - room.ceiling); ctx.fillRect(x + w - 21, room.ceiling, 2, y - room.ceiling);
      ctx.fillStyle = '#9CA3AF'; ctx.fillRect(x + 19, room.ceiling, 1, y - room.ceiling); ctx.fillRect(x + w - 21, room.ceiling, 1, y - room.ceiling);
      slab(ctx, x - 20, y, w + 40, h, '#9CA3AF', 2);
      ctx.fillStyle = '#B4BAC4'; ctx.fillRect(x - 18, y + 2, w + 36, 5);
      ctx.fillStyle = '#7D848F'; ctx.fillRect(x - 18, y + h - 9, w + 36, 7);
      for (let px = x - 20; px < x + w + 20; px += 40) { ctx.fillStyle = '#6B7280'; ctx.fillRect(px, y, 3, h); ctx.fillStyle = '#C7CCD3'; ctx.fillRect(px + 3, y, 1, h); ctx.fillStyle = '#4B5563'; ctx.fillRect(px + 6, y + 4, 2, 2); ctx.fillRect(px + 6, y + h - 6, 2, 2); }
      ctx.fillStyle = INK; ctx.fillRect(x + 16, y - 1, 8, 2); ctx.fillRect(x + w - 24, y - 1, 8, 2);
      slab(ctx, x + 6, y + h - 16, 88, 11, '#FACC15', 1);
      ctx.fillStyle = '#DC2626'; ctx.font = 'bold 5px "Press Start 2P"'; ctx.fillText('LOW CLEARANCE', x + 10, y + h - 8);
      if (f % 6 === 0) state.particles.push({ pos: { x: x + w / 2, y: y + h }, vel: { x: 0, y: 2 }, life: 20, color: 'rgba(147, 197, 253, 0.8)', size: 2 }); // a drip
      ctx.fillStyle = 'rgba(147, 197, 253, 0.85)'; ctx.fillRect(x + w / 2 - 1, y + h, 2, 2);
      break;
    }
    case 'shelves': {
      // Steel shelving, loaded with what a janitor goes through: cardboard cases taped shut, paint cans, bleach jugs,
      // packs of toilet paper, spray bottles; all different, in no particular order, each inked and lit
      column(ctx, x, y - h, 6, h, '#4B5563'); column(ctx, x + w - 6, y - h, 6, h, '#4B5563');
      ctx.fillStyle = '#374151'; for (let yy = y - h + 4; yy < y; yy += 6) { ctx.fillRect(x + 2, yy, 2, 2); ctx.fillRect(x + w - 4, yy, 2, 2); }
      for (let yy = y - h, row = 0; yy < y; yy += 34, row++) {
        const sy = Math.min(yy + 34, y); // (stood on the shelf under them, or the floor)
        let bx = x + 9;
        for (let k = 0; bx < x + w - 14; k++) {
          const pick = Math.floor(hash(x * 0.13 + row * 7.1 + k * 3.7) * 5);
          if (pick === 0) {
            // (a cardboard case: brown, the flaps' seam taped, a shipping label off to one side)
            const bw = 26, bh = 20;
            slab(ctx, bx, sy - bh, bw, bh, '#A0764A', 1);
            ctx.fillStyle = '#C49A6C'; ctx.fillRect(bx + 1, sy - bh + 1, bw - 2, 2);
            ctx.fillStyle = '#7A5A36'; ctx.fillRect(bx + bw / 2 - 1, sy - bh, 2, bh);
            ctx.fillStyle = 'rgba(214, 211, 209, 0.75)'; ctx.fillRect(bx + bw / 2 - 3, sy - bh, 6, 7);
            ctx.fillStyle = '#F5F5F4'; ctx.fillRect(bx + 3, sy - 11, 8, 6); ctx.fillStyle = '#57534E'; ctx.fillRect(bx + 4, sy - 9, 6, 1); ctx.fillRect(bx + 4, sy - 7, 4, 1);
            bx += bw + 3;
          } else if (pick === 1) {
            // (two paint cans: squat, a lid rim lit, a wire bail, a run of the paint down the side)
            for (let c = 0; c < 2; c++) {
              const cx = bx + c * 13, paint = ['#94A3B8', '#E7E5E4', '#A3A3A3'][(row + c + k) % 3];
              shaded(ctx, () => ctx.rect(cx, sy - 14, 11, 14), '#9CA3AF', cx, sy - 14, 11, 14, 1);
              ctx.fillStyle = '#D1D5DB'; ctx.fillRect(cx, sy - 15, 11, 2);
              ctx.fillStyle = paint; ctx.fillRect(cx + 2, sy - 13, 2, 6 + c * 3);
              ctx.strokeStyle = '#4B5563'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx + 1, sy - 15); ctx.quadraticCurveTo(cx + 5.5, sy - 22, cx + 10, sy - 15); ctx.stroke();
            }
            bx += 29;
          } else if (pick === 2) {
            // (a bleach jug: white, a blue cap, the handle's hole, the label's band)
            shaded(ctx, () => ctx.roundRect(bx, sy - 20, 15, 20, [5, 3, 1, 1]), '#F1F5F9', bx, sy - 20, 15, 20, 1);
            ink(ctx, () => ctx.rect(bx + 2, sy - 23, 5, 3), '#2563EB', 0.8);
            ctx.fillStyle = '#94A3B8'; ctx.fillRect(bx + 9, sy - 17, 3, 4);
            ctx.fillStyle = '#60A5FA'; ctx.fillRect(bx + 1, sy - 10, 13, 4);
            bx += 19;
          } else if (pick === 3) {
            // (a pack of toilet paper: the rolls' round ends in a block, in its plastic, the brand stripe)
            slab(ctx, bx, sy - 18, 24, 18, '#F8FAFC', 1);
            ctx.fillStyle = '#CBD5E1'; for (let r = 0; r < 2; r++) for (let q = 0; q < 3; q++) { ctx.fillRect(bx + 2 + q * 7, sy - 16 + r * 8, 6, 6); }
            ctx.fillStyle = '#94A3B8'; for (let r = 0; r < 2; r++) for (let q = 0; q < 3; q++) ctx.fillRect(bx + 4 + q * 7, sy - 14 + r * 8, 2, 2);
            ctx.fillStyle = '#16A34A'; ctx.fillRect(bx + 1, sy - 9, 22, 2);
            bx += 27;
          } else {
            // (spray bottles, a couple of them: the trigger head, the dip tube through the see-through bottle)
            for (let c = 0; c < 2; c++) {
              const cx = bx + c * 10, liquid = c ? '#F9A8D4' : '#86EFAC';
              ink(ctx, () => ctx.rect(cx, sy - 14, 8, 14), liquid, 0.8);
              ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(cx + 1, sy - 13, 1, 12);
              ctx.fillStyle = '#334155'; ctx.fillRect(cx + 4, sy - 13, 1, 12);
              ink(ctx, () => ctx.rect(cx + 1, sy - 19, 6, 5), '#1F2937', 0.8);
              ctx.fillStyle = '#1F2937'; ctx.fillRect(cx + 6, sy - 19, 3, 2); ctx.fillRect(cx + 5, sy - 17, 1, 3);
            }
            bx += 23;
          }
        }
        slab(ctx, x, yy, w, 5, '#6B7280', 1);
      }
      break;
    }
    case 'boiler': {
      // The boiler: a riveted iron drum, red-painted and scorched, a band round it, the pressure gauge, a flue up
      const drum = () => ctx.roundRect(x, y - 140, 120, 140, 20);
      ctx.save(); ctx.beginPath(); drum(); ctx.clip();
      ctx.fillStyle = '#7F1D1D'; ctx.fillRect(x, y - 140, 120, 140);
      ctx.fillStyle = '#9B2C2C'; ctx.fillRect(x, y - 140, 34, 140); ctx.fillStyle = '#B33A3A'; ctx.fillRect(x + 8, y - 140, 10, 140);
      ctx.fillStyle = '#5E1414'; ctx.fillRect(x + 88, y - 140, 32, 140); ctx.fillStyle = '#450A0A'; ctx.fillRect(x + 108, y - 140, 12, 140);
      checker(ctx, x, y - 30, 120, 30, 'rgba(28, 10, 5, 0.35)');
      ctx.fillStyle = '#5E1414'; for (let ry = y - 130; ry < y - 10; ry += 12) { ctx.fillRect(x + 4, ry, 2, 2); ctx.fillRect(x + 114, ry, 2, 2); }
      ctx.restore();
      ctx.beginPath(); drum(); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke();
      pipe(ctx, x + 1, y - 121, 118, 7, '#991B1B');
      ctx.fillStyle = '#FCA5A5'; for (let rx = x + 10; rx < x + 112; rx += 14) ctx.fillRect(rx, y - 119, 1, 1);
      // The firebox: an iron frame, the fire going in the back of it, the glow on the sill, a grate across the front
      ctx.fillStyle = '#292524'; ctx.fillRect(x + 36, y - 54, 48, 34);
      ctx.fillStyle = '#1C0A05'; ctx.fillRect(x + 40, y - 50, 40, 26);
      ctx.save(); ctx.beginPath(); ctx.rect(x + 40, y - 50, 40, 26); ctx.clip();
      drawFire(ctx, x + 60, y - 24, 40, 24, f, { seed: Math.floor(x), sparks: false, glow: 1.6 });
      ctx.restore();
      ctx.fillStyle = `rgba(253, 186, 116, ${(0.35 + Math.sin(f * 0.3) * 0.15).toFixed(3)})`; ctx.fillRect(x + 36, y - 20, 48, 2); // (the glow on the sill)
      ctx.fillStyle = '#0C0A09'; for (let gx = x + 44; gx < x + 80; gx += 8) ctx.fillRect(gx, y - 50, 3, 26);
      ctx.fillStyle = '#57534E'; for (let gx = x + 44; gx < x + 80; gx += 8) ctx.fillRect(gx, y - 50, 1, 26);
      ctx.fillStyle = '#0C0A09'; ctx.fillRect(x + 40, y - 38, 40, 2);
      // (the gauge on a stub, the needle twitching high)
      column(ctx, x + 57, y - 88, 6, 8, '#57534E');
      gauge(ctx, x + 60, y - 100, 12, -Math.PI / 4 + Math.sin(f * 0.6) * 0.08);
      break;
    }
    case 'bench': {
      // A lab bench: white cabinets (drawers, chrome pulls), the black epoxy top; glassware bubbling on it
      slab(ctx, x, y - h, w, h, '#E5E7EB', 2);
      for (let dx = x + 6; dx + 40 < x + w; dx += 44) {
        ctx.fillStyle = '#C9CDD3'; ctx.fillRect(dx, y - h + 10, 40, 1); ctx.fillRect(dx, y - h + 10, 1, h - 16);
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(dx + 1, y - 6, 39, 1); ctx.fillRect(dx + 39, y - h + 10, 1, h - 16);
        ctx.fillStyle = '#9CA3AF'; ctx.fillRect(dx + 14, y - h + 18, 12, 2); ctx.fillStyle = '#F3F4F6'; ctx.fillRect(dx + 14, y - h + 18, 12, 1);
      }
      slab(ctx, x - 4, y - h, w + 8, 6, '#1F2937', 1);
      ctx.fillStyle = '#4B5563'; ctx.fillRect(x + 10, y - h + 1, w - 30, 1);
      for (let k = 0; k < 4; k++) {
        const gx = x + 20 + k * 40, liquid = ['#84CC16', '#F472B6', '#38BDF8', '#FACC15'][k];
        // (a beaker: the glass inked, the liquid in two steps, a glint up the side)
        ctx.fillStyle = 'rgba(224, 242, 254, 0.55)'; ctx.fillRect(gx, y - h - 26, 10, 20);
        ctx.fillStyle = liquid; ctx.fillRect(gx, y - h - 14, 10, 8);
        ctx.fillStyle = lite(liquid, 0.4); ctx.fillRect(gx, y - h - 14, 10, 2);
        ctx.fillStyle = dark(liquid, 0.25); ctx.fillRect(gx + 7, y - h - 12, 3, 6);
        ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(gx - 0.5, y - h - 26.5, 11, 21);
        ctx.fillStyle = INK; ctx.fillRect(gx - 2, y - h - 27, 3, 1);
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(gx + 2, y - h - 24, 1, 8);
        if ((f + k * 7) % 20 < 10) { ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(gx + 4, y - h - 30 - ((f + k * 5) % 10), 2, 2); }
      }
      break;
    }
    case 'tank': {
      // A specimen tank: green fluid, bubbles, something floating in it (an arm, a brain, a guy)
      slab(ctx, x - 6, y - 16, 92, 16, '#374151', 2); slab(ctx, x - 6, y - 196, 92, 12, '#374151', 2);
      ctx.fillStyle = '#6B7280'; for (let bx = x; bx < x + 84; bx += 14) { ctx.fillRect(bx, y - 191, 2, 2); ctx.fillRect(bx, y - 9, 2, 2); }
      ctx.globalAlpha = 0.48; bandedGradient(ctx, x, y - 184, 80, 168, ['#A3E635', '#84CC16', '#4D7C0F'], 6); ctx.globalAlpha = 1;
      const bob = Math.sin(f * 0.05 + x) * 4;
      const flesh = '#C7D2B8';
      if (pr.v === 0) { // an arm
        shaded(ctx, () => ctx.roundRect(x + 30, y - 130 + bob, 16, 60, 6), flesh, x + 30, y - 130 + bob, 16, 60);
        shaded(ctx, () => ctx.roundRect(x + 24, y - 80 + bob, 28, 10, 4), flesh, x + 24, y - 80 + bob, 28, 10);
        ctx.fillStyle = '#7F1D1D'; ctx.fillRect(x + 31, y - 131 + bob, 14, 3);
      } else if (pr.v === 1) { // a brain
        shaded(ctx, () => ctx.ellipse(x + 40, y - 110 + bob, 20, 14, 0, 0, Math.PI * 2), '#D6C4B8', x + 20, y - 124 + bob, 40, 28);
        ctx.strokeStyle = '#A38A80'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 40, y - 124 + bob); ctx.lineTo(x + 40, y - 96 + bob);
        ctx.moveTo(x + 26, y - 112 + bob); ctx.quadraticCurveTo(x + 32, y - 118 + bob, x + 36, y - 110 + bob); ctx.moveTo(x + 44, y - 106 + bob); ctx.quadraticCurveTo(x + 50, y - 114 + bob, x + 55, y - 106 + bob); ctx.stroke();
        ctx.fillStyle = '#7F1D1D'; ctx.fillRect(x + 38, y - 97 + bob, 4, 8);
      } else { // one of the last lot
        shaded(ctx, () => ctx.roundRect(x + 30, y - 160 + bob, 22, 90, 5), flesh, x + 30, y - 160 + bob, 22, 90);
        shaded(ctx, () => ctx.arc(x + 41, y - 168 + bob, 11, 0, Math.PI * 2), flesh, x + 30, y - 179 + bob, 22, 22);
        ctx.fillStyle = '#111827'; ctx.fillRect(x + 44, y - 170 + bob, 2, 2); ctx.fillRect(x + 38, y - 170 + bob, 2, 2); ctx.fillRect(x + 40, y - 163 + bob, 4, 1);
        ctx.fillStyle = '#A3A38A'; ctx.fillRect(x + 33, y - 140 + bob, 16, 1); ctx.fillRect(x + 33, y - 120 + bob, 16, 1);
        slab(ctx, x + 6, y - 30, 68, 12, '#1C1917', 1);
        ctx.fillStyle = '#FDE047'; ctx.font = '5px "Press Start 2P"'; ctx.fillText('SUBJECT 6', x + 8, y - 22);
      }
      ctx.fillStyle = 'rgba(255,255,255,0.6)'; for (let k = 0; k < 4; k++) { const by = y - 30 - ((f * 1.5 + k * 30) % 150); ctx.fillRect(x + 10 + k * 18, by, 3, 3); ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(x + 10 + k * 18, by, 1, 1); ctx.fillStyle = 'rgba(255,255,255,0.6)'; }
      // (the glass: a glint down the left, a shadow down the right, inked at its edges)
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(x + 4, y - 184, 6, 168); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(x + 5, y - 184, 2, 168);
      ctx.fillStyle = 'rgba(20, 40, 10, 0.25)'; ctx.fillRect(x + 70, y - 184, 10, 168);
      ctx.fillStyle = INK; ctx.fillRect(x, y - 184, 1, 168); ctx.fillRect(x + 79, y - 184, 1, 168);
      break;
    }
    case 'whiteboard': {
      // The whiteboard: an aluminium frame, smudges of old notes, PROJECT BLACKOUT, Barry's face doodled and circled
      const wy = room.ceiling + 40;
      slab(ctx, x - 2, wy - 2, 164, 104, '#9CA3AF', 2);
      ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x + 2, wy + 2, 156, 96);
      ctx.fillStyle = '#E8EDF3'; ctx.fillRect(x + 100, wy + 6, 50, 6); ctx.fillRect(x + 40, wy + 80, 60, 4);
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x + 4, wy + 4, 40, 2);
      ctx.fillStyle = '#DC2626'; ctx.font = 'bold 7px "Press Start 2P"'; ctx.fillText('PROJECT BLACKOUT', x + 10, room.ceiling + 58);
      ctx.fillStyle = '#DC2626'; ctx.fillRect(x + 10, room.ceiling + 61, 110, 1);
      ctx.fillStyle = '#1D4ED8'; ctx.font = '5px "Press Start 2P"';
      ctx.fillText('SUBJECT 7: STRENGTH +400%', x + 10, room.ceiling + 74); ctx.fillText('SIDE EFFECTS: GLOWING,', x + 10, room.ceiling + 86); ctx.fillText('SCREAMING, LOVES BARRY', x + 10, room.ceiling + 96);
      ctx.fillText('NEXT: THE WHOLE CITY?', x + 10, room.ceiling + 112);
      ctx.strokeStyle = '#DC2626'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x + 136, room.ceiling + 90, 14, 0, Math.PI * 2); ctx.stroke(); // Barry's face, circled
      ctx.strokeStyle = '#111827'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x + 136, room.ceiling + 91, 8, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#111827'; ctx.fillRect(x + 128, room.ceiling + 86, 16, 4); ctx.fillRect(x + 133, room.ceiling + 95, 6, 1);
      // (the marker tray, a marker in it)
      slab(ctx, x + 20, wy + 100, 120, 4, '#9CA3AF', 1);
      ctx.fillStyle = '#DC2626'; ctx.fillRect(x + 50, wy + 98, 14, 3); ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x + 50, wy + 98, 4, 3);
      break;
    }
    case 'cages':
      for (let k = 0; k < 3; k++) {
        const cx = x + k * 70;
        // (a wire cage on a tray: shavings, the rat in it (one of them's glowing), the bars, a water bottle)
        ctx.fillStyle = 'rgba(17,24,39,0.6)'; ctx.fillRect(cx, y - 60, 60, 60);
        ctx.fillStyle = '#A16207'; ctx.fillRect(cx + 2, y - 6, 56, 4); ctx.fillStyle = '#CA8A04'; for (let s = cx + 4; s < cx + 56; s += 5) ctx.fillRect(s, y - 7, 2, 1);
        if (k === 1) steppedGlow(ctx, cx + 30, y - 14, 16, '#84CC16', 0.5, 0.1, 4);
        const rat = k === 1 ? '#F8FAFC' : '#57534E';
        shaded(ctx, () => ctx.ellipse(cx + 30, y - 12, 12, 7, 0, 0, Math.PI * 2), rat, cx + 18, y - 19, 24, 14);
        ink(ctx, () => ctx.arc(cx + 40, y - 17, 3, 0, Math.PI * 2), lite(rat, 0.15), 0.7);
        ctx.fillStyle = k === 1 ? '#DC2626' : INK; ctx.fillRect(cx + 37, y - 13, 2, 2);
        ctx.strokeStyle = '#F9A8D4'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx + 18, y - 10); ctx.quadraticCurveTo(cx + 10, y - 6, cx + 6, y - 12); ctx.stroke();
        ctx.fillStyle = 'rgba(186, 230, 253, 0.6)'; ctx.fillRect(cx + 48, y - 50, 6, 16); ctx.strokeStyle = INK; ctx.strokeRect(cx + 47.5, y - 50.5, 7, 17);
        for (let b = cx; b <= cx + 60; b += 6) { ctx.fillStyle = '#6B7280'; ctx.fillRect(b, y - 60, 1, 60); ctx.fillStyle = '#D1D5DB'; ctx.fillRect(b, y - 58, 1, 20); }
        slab(ctx, cx - 1, y - 62, 62, 4, '#9CA3AF', 1);
        ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(cx + 0.5, y - 59.5, 59, 59);
      }
      break;
    case 'stairs': {
      // The stairwell door, propped open, the stairs going up (treads lit, risers in shadow, a handrail); ROOF ACCESS
      ctx.fillStyle = '#1F2937'; ctx.fillRect(x, room.ceiling - 30, 260, Y - room.ceiling + 30);
      ctx.fillStyle = '#18202C'; ctx.fillRect(x, room.ceiling - 30, 260, 40);
      for (let k = 0; k < 10; k++) {
        const sx = x + 40 + k * 20, sy = Y - 16 - k * 20;
        ctx.fillStyle = '#374151'; ctx.fillRect(sx, sy, 40, 16);
        ctx.fillStyle = '#6B7280'; ctx.fillRect(sx, sy, 40, 2); ctx.fillStyle = '#FACC15'; ctx.fillRect(sx, sy, 6, 1);
        ctx.fillStyle = '#2A3240'; ctx.fillRect(sx, sy + 10, 40, 6);
        ctx.fillStyle = INK; ctx.fillRect(sx, sy - 1, 40, 1); ctx.fillRect(sx, sy, 1, 16);
      }
      ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + 50, Y - 46); ctx.lineTo(x + 250, Y - 246); ctx.stroke();
      ctx.strokeStyle = '#9CA3AF'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 50, Y - 46); ctx.lineTo(x + 250, Y - 246); ctx.stroke();
      slab(ctx, x + 20, room.ceiling + 10, 140, 22, '#DC2626', 2);
      ctx.strokeStyle = '#FCA5A5'; ctx.lineWidth = 1; ctx.strokeRect(x + 23.5, room.ceiling + 13.5, 133, 15);
      ctx.fillStyle = '#7F1D1D'; ctx.font = 'bold 8px "Press Start 2P"'; ctx.fillText('ROOF ACCESS', x + 31, room.ceiling + 27);
      ctx.fillStyle = '#F8FAFC'; ctx.fillText('ROOF ACCESS', x + 30, room.ceiling + 26);
      // (the door, swung back against the frame, a fire extinguisher's block holding it)
      slab(ctx, x - 10, Y - 110, 14, 110, '#6B7280', 2);
      ctx.fillStyle = '#9CA3AF'; ctx.fillRect(x - 7, Y - 64, 4, 3);
      slab(ctx, x - 2, Y - 8, 12, 8, '#57534E', 1);
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
  // (not once the water's live: the fight's over, and the announcer's calls go up there)
  if (rt.power.phase === 'surge') return;
  rt.power.gens.forEach((g, i) => {
    const x = COURSE.generators[i];
    if (g.charge <= 0) return;
    ctx.fillStyle = INK; ctx.fillRect(x - 41, Y - 179, 82, 12);
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(x - 40, Y - 178, 80, 10);
    const col = g.charge > 50 ? '#38BDF8' : g.charge > 20 ? '#FACC15' : '#EF4444';
    const bw = 76 * g.charge / 100;
    ctx.fillStyle = col; ctx.fillRect(x - 38, Y - 176, bw, 6);
    ctx.fillStyle = lite(col, 0.45); ctx.fillRect(x - 38, Y - 176, bw, 2);
    ctx.fillStyle = dark(col, 0.3); ctx.fillRect(x - 38, Y - 172, bw, 2);
  });
};

/** A generator: a big humming steel cabinet, coils glowing blue through its vents, arcing when it's being hit; a smoking wreck once it's gone. */
export const drawGenerator = (ctx: Ctx, e: Enemy, state: GameState, charge: number) => {
  const f = state.frame;
  const x = e.pos.x, y = e.pos.y, w = e.width, h = e.height;
  if (charge <= 0) {
    // The wreck: the cabinet's carcass, its top torn open jagged, the coils inside slumped and charred, embers in it
    slab(ctx, x, y + 30, w, h - 30, '#1C1917', 2);
    ctx.fillStyle = '#0C0A09'; for (let k = 0; k < 4; k++) ctx.fillRect(x + 14 + k * 25, y + 66, 16, 50);
    ctx.fillStyle = '#44403C'; for (let k = 0; k < 4; k++) for (let yy = y + 70; yy < y + 114; yy += 8) ctx.fillRect(x + 14 + k * 25 + (yy % 3), yy, 14, 2);
    checker(ctx, x, y + 30, w, h - 30, 'rgba(0, 0, 0, 0.3)');
    const torn = () => { ctx.moveTo(x, y + 30); ctx.lineTo(x + 20, y + 10); ctx.lineTo(x + 50, y + 40); ctx.lineTo(x + 80, y + 5); ctx.lineTo(x + w, y + 34); ctx.lineTo(x + w, y + 60); ctx.lineTo(x, y + 60); ctx.closePath(); };
    ctx.save(); ctx.beginPath(); torn(); ctx.clip();
    ctx.fillStyle = '#292524'; ctx.fillRect(x, y, w, 60);
    ctx.fillStyle = '#44403C'; ctx.fillRect(x, y, 30, 60); ctx.fillStyle = '#1C1917'; ctx.fillRect(x + w - 28, y, 28, 60);
    ctx.fillStyle = '#57534E'; ctx.fillRect(x + 18, y + 12, 3, 3); ctx.fillRect(x + 78, y + 7, 3, 3);
    ctx.restore();
    ctx.beginPath(); torn(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
    const a = 0.5 + Math.sin(f * 0.4) * 0.3;
    steppedGlow(ctx, x + 60, y + 80, 34, '#F97316', a * 0.6, 0.05, 4);
    ctx.fillStyle = `rgba(249, 115, 22, ${a})`; ctx.fillRect(x + 30, y + 70, 60, 20);
    ctx.fillStyle = `rgba(253, 224, 71, ${a})`; ctx.fillRect(x + 44, y + 76, 8, 4); ctx.fillRect(x + 66, y + 80, 6, 3);
    return;
  }
  // The cabinet: brushed steel, its door panels, the top vent hood
  slab(ctx, x, y, w, h, '#475569', 2);
  ctx.fillStyle = '#566479'; ctx.fillRect(x + 2, y + 2, 26, h - 4);
  ctx.fillStyle = '#3B475A'; ctx.fillRect(x + w - 24, y + 2, 22, h - 4);
  slab(ctx, x + 6, y + 6, w - 12, 20, '#334155', 1);
  ctx.fillStyle = '#94A3B8'; for (const bx of [x + 4, x + w - 7]) for (const by of [y + 30, y + h - 22]) ctx.fillRect(bx, by, 3, 3);
  hazard(ctx, x, y + h - 16, w, 8, 8);
  // The coils, glowing through the vents (the glow stepped, the slats inked over it)
  const hum = 0.6 + Math.sin(f * 0.3) * 0.2;
  for (let k = 0; k < 4; k++) {
    const vx = x + 14 + k * 25;
    ctx.fillStyle = INK; ctx.fillRect(vx - 1, y + 39, 18, 72);
    ctx.fillStyle = `rgba(56, 189, 248, ${hum})`; ctx.fillRect(vx, y + 40, 16, 70);
    ctx.fillStyle = `rgba(186, 230, 253, ${hum})`; ctx.fillRect(vx + 5, y + 40, 6, 70);
    for (let yy = y + 42; yy < y + 110; yy += 8) { ctx.fillStyle = '#1E293B'; ctx.fillRect(vx, yy, 16, 3); ctx.fillStyle = '#475569'; ctx.fillRect(vx, yy, 16, 1); }
  }
  steppedGlow(ctx, x + w / 2, y + 75, 50, '#38BDF8', 0.12 * hum, 0.02, 3);
  letter(ctx, 'DANGER HV', x + w / 2, y + 20, 'bold 6px "Press Start 2P"', '#E0F2FE', '#0F172A');
  // Arcing when it's hurting
  if (charge < 100 && f % 4 < 2) {
    let ax = x + hash(f) * w, ay = y + 20;
    const pts: [number, number][] = [[ax, ay]];
    for (let k = 0; k < 5; k++) { ax += (hash(f + k) - 0.5) * 30; ay += 18; pts.push([ax, ay]); }
    for (const [col, lw] of [['rgba(56, 189, 248, 0.5)', 5], ['#E0F2FE', 2], ['#FFFFFF', 1]] as [string, number][]) {
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const [px, py] of pts) ctx.lineTo(px, py); ctx.stroke();
    }
  }
};
