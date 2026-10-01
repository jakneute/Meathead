// The Iron Pit, drawn: the back wall (cinderblock painted two tones, gone yellow under the tube lights; the mirrors,
// the posters, the windows still dark at five in the morning), the gym's things along it (the benches, the racks, the
// treadmills, the bag), the plate racks and the plyo boxes you stand on, the mezzanine's rail, the locker room's double
// doors at the end; then the bigger fellas walking in through them, and over it all the pencil necks' lines, the time
// up in the corner as it starts, and the fade at the end.

import type { GameState } from '../../core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y } from '../../../constants';
import { COURSE, CP, MEZZ_Y, END_WALL, WALL_X, WALL_W, WALL_TOP, Prop, Ledge } from './course';
import { getGym, fadeAmount, GymRuntime, BigFella } from './runtime';
import { saying, drawBubble } from './script';

type Ctx = CanvasRenderingContext2D;
const Y = GROUND_Y;
const hash = (n: number) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };

const inView = (state: GameState, x1: number, x2: number) => x2 > state.camera.x - 40 && x1 < state.camera.x + CANVAS_WIDTH + 40;

/** Behind the lot: the dark of the room (the back wall's drawn in the world, over this). */
export const drawGymBackdrop = (ctx: Ctx) => {
  ctx.fillStyle = '#0E0A08'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  return true;
};

export const drawGymBack = (ctx: Ctx, state: GameState) => {
  const rt = getGym(state);
  if (!rt) return;
  const x1 = Math.max(COURSE.x1, state.camera.x - 20), x2 = Math.min(COURSE.x2 + 200, state.camera.x + CANVAS_WIDTH + 20);
  drawWall(ctx, state, x1, x2);
  for (const p of COURSE.props) { const [a, b] = propSpan(p); if (inView(state, a, b)) drawProp(ctx, state, p); }
  drawDoors(ctx, state, rt);
  drawEndWall(ctx, state);
};

/** The back wall: cinderblock, the lower half painted red and the top a dirty cream, a stripe between; the ceiling's beams and the tube lights hung off them. */
const drawWall = (ctx: Ctx, state: GameState, x1: number, x2: number) => {
  const f = state.frame;
  // (the ceiling: a drop ceiling, its tiles gone yellow and water-stained in the grid, one missing (the dark up
  // through it), a duct running along under it, the trim where it meets the wall)
  ctx.fillStyle = '#6E685A'; ctx.fillRect(x1, 0, x2 - x1, 70);
  for (let x = Math.floor(x1 / 64) * 64; x < x2; x += 64) for (let y = 0; y < 60; y += 30) {
    const h = hash(x * 0.11 + y * 3.7);
    ctx.fillStyle = h > 0.97 ? '#0E0A08' : h > 0.5 ? '#8A8473' : '#7E7868'; ctx.fillRect(x + 2, y + 2, 60, 26);
    if (h > 0.97) continue;
    ctx.fillStyle = 'rgba(60, 50, 30, 0.25)'; for (let k = 0; k < 6; k++) ctx.fillRect(x + 6 + hash(x + k + y) * 50, y + 6 + hash(x - k + y) * 18, 1, 1);
    if (h < 0.12) { ctx.fillStyle = 'rgba(120, 84, 30, 0.35)'; ctx.beginPath(); ctx.ellipse(x + 30, y + 15, 18, 9, 0, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.fillStyle = '#B8B2A0'; for (let x = Math.floor(x1 / 64) * 64; x < x2; x += 64) ctx.fillRect(x, 0, 2, 60);
  ctx.fillRect(x1, 0, x2 - x1, 2); ctx.fillRect(x1, 30, x2 - x1, 2);
  ctx.fillStyle = '#52525B'; ctx.fillRect(x1, 46, x2 - x1, 12); ctx.fillStyle = '#71717A'; ctx.fillRect(x1, 46, x2 - x1, 2);
  ctx.fillStyle = '#3F3F46'; for (let x = Math.floor(x1 / 200) * 200; x < x2; x += 200) ctx.fillRect(x, 44, 4, 16);
  ctx.fillStyle = '#2E241E'; ctx.fillRect(x1, 60, x2 - x1, 10); ctx.fillStyle = '#4A3E34'; ctx.fillRect(x1, 60, x2 - x1, 2);
  // (the wall: cinderblock, every block its own shade)
  ctx.fillStyle = '#B9AE94'; ctx.fillRect(x1, 70, x2 - x1, Y - 70 - 170);
  ctx.fillStyle = '#7F1D1D'; ctx.fillRect(x1, Y - 170, x2 - x1, 170);
  for (let y = 70; y < Y; y += 24) {
    const off = ((y - 70) / 24) % 2 ? 24 : 0;
    for (let x = Math.floor(x1 / 48) * 48 - 48 + off; x < x2; x += 48) {
      const low = y >= Y - 170;
      const h = hash(x * 0.37 + y);
      ctx.fillStyle = low ? (h > 0.5 ? '#86201E' : '#761A18') : (h > 0.5 ? '#C2B79C' : '#B0A588');
      ctx.fillRect(x + 1, y + 1, 46, 22);
      ctx.fillStyle = low ? 'rgba(0,0,0,0.25)' : 'rgba(80, 64, 40, 0.35)'; ctx.fillRect(x + 1, y + 21, 46, 2);
    }
  }
  // (the stripe between the two paints, and the grime down the wall from the ceiling)
  ctx.fillStyle = '#FACC15'; ctx.fillRect(x1, Y - 176, x2 - x1, 6);
  ctx.fillStyle = 'rgba(60, 40, 20, 0.18)';
  for (let x = Math.floor(x1 / 70) * 70; x < x2; x += 70) { const h = 40 + hash(x) * 120; ctx.fillRect(x + hash(x + 1) * 40, 70, 6 + hash(x + 2) * 10, h); }
  // (the rubber floor's skirting)
  ctx.fillStyle = '#111'; ctx.fillRect(x1, Y - 8, x2 - x1, 8);
  // (the tube lights, one flickering)
  for (let x = Math.floor(x1 / 320) * 320 - 220; x < x2 + 90; x += 320) {
    const flicker = (x / 320) % 5 === 2 && hash(Math.floor(f / 5) + x) > 0.85;
    ctx.fillStyle = '#3F3F46'; ctx.fillRect(x - 4, 62, 2, 18); ctx.fillRect(x + 82, 62, 2, 18);
    ctx.fillStyle = flicker ? '#71717A' : '#FEFCE8'; ctx.fillRect(x - 8, 80, 96, 6);
    if (!flicker) {
      const g = ctx.createLinearGradient(0, 86, 0, Y);
      g.addColorStop(0, 'rgba(254, 252, 232, 0.16)'); g.addColorStop(1, 'rgba(254, 252, 232, 0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 8, 86); ctx.lineTo(x + 88, 86); ctx.lineTo(x + 170, Y); ctx.lineTo(x - 90, Y); ctx.closePath(); ctx.fill();
    }
  }
};

/** How far a prop reaches either side of its x (a mirror or a window hangs off to the right of it; the rest are about it). */
const propSpan = (p: Prop): [number, number] =>
  p.look === 'mirror' ? [p.x - 4, p.x + 304] : p.look === 'window' ? [p.x - 4, p.x + 124] : p.look === 'poster' ? [p.x - 160, p.x + 160] : [p.x - 90, p.x + 90];

const drawProp = (ctx: Ctx, state: GameState, p: Prop) => {
  const { x, y } = p;
  switch (p.look) {
    case 'mirror': {
      // A wall of mirror: the room in it, dim, streaks of light down it, his gym bag reflected
      const g = ctx.createLinearGradient(x, 0, x + 300, 0);
      g.addColorStop(0, '#5B7A86'); g.addColorStop(0.5, '#7D9AA4'); g.addColorStop(1, '#4C6A76');
      ctx.fillStyle = '#27272A'; ctx.fillRect(x - 4, y - 4, 308, 168);
      ctx.fillStyle = g; ctx.fillRect(x, y, 300, 160);
      ctx.fillStyle = 'rgba(255,255,255,0.18)'; for (let k = 0; k < 6; k++) ctx.fillRect(x + 20 + k * 50, y, 6, 160);
      ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(x, y + 120, 300, 40);
      ctx.strokeStyle = 'rgba(30, 40, 46, 0.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 270, y); ctx.lineTo(x + 250, y + 30); ctx.lineTo(x + 262, y + 44); ctx.stroke();
      break;
    }
    case 'window': {
      // Still dark out: a blue before the dawn, the frame, wire glass, a streetlight's glow
      ctx.fillStyle = '#27272A'; ctx.fillRect(x - 4, y - 4, 128, 88);
      const g = ctx.createLinearGradient(0, y, 0, y + 80);
      g.addColorStop(0, '#0B1330'); g.addColorStop(1, '#2A2A5A');
      ctx.fillStyle = g; ctx.fillRect(x, y, 120, 80);
      ctx.fillStyle = 'rgba(253, 186, 116, 0.35)'; ctx.beginPath(); ctx.arc(x + 90, y + 60, 16, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(160,160,170,0.35)'; ctx.lineWidth = 0.6;
      for (let k = 0; k < 120; k += 10) { ctx.beginPath(); ctx.moveTo(x + k, y); ctx.lineTo(x + k + 10, y + 80); ctx.moveTo(x + k + 10, y); ctx.lineTo(x + k, y + 80); ctx.stroke(); }
      ctx.fillStyle = '#3F3F46'; ctx.fillRect(x + 58, y, 4, 80); ctx.fillRect(x, y + 38, 120, 4);
      break;
    }
    case 'poster': {
      const text = p.text ?? '';
      ctx.font = 'bold 8px "Press Start 2P"';
      const w = Math.max(110, ctx.measureText(text).width + 24);
      ctx.fillStyle = '#F5F5F4'; ctx.fillRect(x - w / 2, y, w, 60);
      ctx.fillStyle = '#DC2626'; ctx.fillRect(x - w / 2 + 6, y + 6, w - 12, 28);
      // (a man flexing on it, in silhouette)
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x, y + 14, 4, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(x - 5, y + 18, 10, 12);
      ctx.fillRect(x - 13, y + 16, 8, 4); ctx.fillRect(x - 15, y + 10, 4, 8); ctx.fillRect(x + 5, y + 16, 8, 4); ctx.fillRect(x + 11, y + 10, 4, 8);
      ctx.fillStyle = '#111'; ctx.textAlign = 'center'; ctx.fillText(text, x, y + 50); ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(120, 100, 60, 0.3)'; ctx.fillRect(x - w / 2, y + 54, w, 6);
      ctx.fillStyle = '#A8A29E'; ctx.fillRect(x - w / 2 + 2, y + 2, 3, 3); ctx.fillRect(x + w / 2 - 5, y + 2, 3, 3);
      break;
    }
    case 'bench': {
      // A flat bench, the uprights and the bar racked on them, plates on the bar
      ctx.fillStyle = '#52525B'; ctx.fillRect(x - 40, y - 26, 4, 26); ctx.fillRect(x + 36, y - 26, 4, 26);
      ctx.fillStyle = '#991B1B'; ctx.fillRect(x - 46, y - 34, 92, 9); ctx.fillStyle = '#B91C1C'; ctx.fillRect(x - 46, y - 34, 92, 2);
      ctx.fillStyle = '#71717A'; ctx.fillRect(x - 54, y - 90, 5, 58); ctx.fillRect(x - 58, y - 90, 12, 4);
      ctx.fillStyle = '#A1A1AA'; ctx.fillRect(x - 80, y - 94, 60, 3);
      ctx.fillStyle = '#18181B'; ctx.beginPath(); ctx.ellipse(x - 76, y - 92, 4, 16, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(x - 70, y - 92, 4, 14, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3F3F46'; ctx.fillRect(x - 72, y - 108, 1, 32);
      break;
    }
    case 'squat': {
      ctx.fillStyle = '#3F3F46'; ctx.fillRect(x - 50, y - 170, 8, 170); ctx.fillRect(x + 42, y - 170, 8, 170); ctx.fillRect(x - 50, y - 170, 100, 6);
      ctx.fillStyle = '#71717A'; for (let k = 0; k < 10; k++) { ctx.fillRect(x - 49, y - 160 + k * 15, 6, 2); ctx.fillRect(x + 43, y - 160 + k * 15, 6, 2); }
      ctx.fillStyle = '#A1A1AA'; ctx.fillRect(x - 76, y - 112, 152, 4);
      for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { ctx.fillStyle = k % 2 ? '#1E3A8A' : '#18181B'; ctx.beginPath(); ctx.ellipse(x + s * (62 + k * 5), y - 110, 3, 22 - k * 4, 0, 0, Math.PI * 2); ctx.fill(); }
      break;
    }
    case 'dumbbells': {
      ctx.fillStyle = '#27272A'; ctx.fillRect(x - 80, y - 46, 160, 5); ctx.fillRect(x - 80, y - 24, 160, 5); ctx.fillRect(x - 78, y - 46, 5, 46); ctx.fillRect(x + 73, y - 46, 5, 46);
      for (let k = 0; k < 8; k++) for (const row of [-52, -30]) { const bx = x - 70 + k * 19, r = 5 + (k % 4); ctx.fillStyle = '#18181B'; ctx.fillRect(bx - 2, y + row - r, 4, r * 2); ctx.fillRect(bx + 10, y + row - r, 4, r * 2); ctx.fillStyle = '#71717A'; ctx.fillRect(bx, y + row - 1, 12, 2); }
      break;
    }
    case 'treadmill': {
      ctx.fillStyle = '#27272A'; ctx.beginPath(); ctx.moveTo(x - 50, y - 6); ctx.lineTo(x + 40, y - 12); ctx.lineTo(x + 44, y); ctx.lineTo(x - 50, y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#09090B'; ctx.fillRect(x - 46, y - 10, 84, 3);
      ctx.fillStyle = '#3F3F46'; ctx.fillRect(x + 34, y - 74, 5, 64); ctx.fillRect(x + 20, y - 80, 30, 14);
      ctx.fillStyle = '#16A34A'; ctx.fillRect(x + 24, y - 77, 22, 6); ctx.fillStyle = '#052e16'; ctx.fillRect(x + 25, y - 76, 20, 4);
      ctx.fillStyle = '#4ADE80'; ctx.font = 'bold 4px monospace'; ctx.fillText('0.0', x + 28, y - 73);
      ctx.fillStyle = '#3F3F46'; ctx.fillRect(x + 2, y - 50, 34, 3);
      break;
    }
    case 'bike': {
      ctx.fillStyle = '#27272A'; ctx.beginPath(); ctx.arc(x + 26, y - 14, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3F3F46'; ctx.fillRect(x - 30, y - 6, 70, 6); ctx.fillRect(x - 10, y - 50, 6, 46); ctx.fillRect(x + 22, y - 62, 6, 50);
      ctx.fillStyle = '#18181B'; ctx.fillRect(x - 20, y - 54, 22, 6); ctx.fillRect(x + 16, y - 66, 24, 4);
      break;
    }
    case 'fountain': {
      ctx.fillStyle = '#A1A1AA'; ctx.fillRect(x - 16, y - 70, 32, 70); ctx.fillStyle = '#D4D4D8'; ctx.fillRect(x - 16, y - 70, 32, 6);
      ctx.fillStyle = '#71717A'; ctx.fillRect(x - 10, y - 62, 20, 8); ctx.fillStyle = '#52525B'; ctx.fillRect(x - 2, y - 66, 4, 4);
      ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 4px monospace'; ctx.fillText('OUT OF', x - 10, y - 40); ctx.fillText('ORDER', x - 9, y - 34);
      break;
    }
    case 'cable': {
      ctx.fillStyle = '#3F3F46'; ctx.fillRect(x - 40, y - 180, 8, 180); ctx.fillRect(x + 32, y - 180, 8, 180); ctx.fillRect(x - 40, y - 180, 80, 8);
      ctx.fillStyle = '#18181B'; for (let k = 0; k < 8; k++) ctx.fillRect(x - 12, y - 70 + k * 8, 24, 6);
      ctx.strokeStyle = '#A1A1AA'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y - 172); ctx.lineTo(x, y - 70); ctx.stroke();
      break;
    }
    case 'bag': {
      const sw = Math.sin(state.frame * 0.03) * 0.05;
      ctx.save(); ctx.translate(x, 70); ctx.rotate(sw);
      ctx.strokeStyle = '#71717A'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 260); ctx.stroke();
      ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.roundRect(-20, 260, 40, 110, 10); ctx.fill();
      ctx.fillStyle = '#991B1B'; ctx.fillRect(-20, 268, 8, 94);
      ctx.fillStyle = '#18181B'; ctx.fillRect(-20, 290, 40, 4); ctx.fillRect(-20, 340, 40, 4);
      ctx.fillStyle = '#E7E5E4'; ctx.fillRect(-10, 360, 20, 4); // (duct tape)
      ctx.restore();
      break;
    }
  }
};

/**
 * The gym's corner at the left, behind his bench: the end wall coming toward you, seen side on (a column of cinderblock
 * in shadow, the two paints and the stripe carried round onto it), a fire extinguisher on it, the floor's skirting
 * turning the corner. Nothing past it: the room stops there.
 */
const drawEndWall = (ctx: Ctx, state: GameState) => {
  const x = COURSE.x1, w = END_WALL;
  if (!inView(state, x - 200, x + w + 20)) return;
  // (past it: nothing, the dark)
  ctx.fillStyle = '#0B0807'; ctx.fillRect(x - 400, 0, 400, CANVAS_HEIGHT);
  // (the face: the block in shadow, light coming onto its edge from the room)
  const top = 70;
  ctx.fillStyle = '#8C8470'; ctx.fillRect(x, top, w, Y - 170 - top);
  ctx.fillStyle = '#5C1414'; ctx.fillRect(x, Y - 170, w, 170);
  for (let y = top; y < Y; y += 24) {
    const low = y >= Y - 170;
    ctx.fillStyle = low ? 'rgba(0,0,0,0.3)' : 'rgba(60, 50, 30, 0.35)'; ctx.fillRect(x, y + 22, w, 2);
    ctx.fillRect(x + (((y - top) / 24) % 2 ? 22 : 8), y, 2, 24);
  }
  ctx.fillStyle = '#C9A814'; ctx.fillRect(x, Y - 176, w, 6);
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, 'rgba(0,0,0,0.45)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(x, top, w, Y - top);
  ctx.fillStyle = 'rgba(255, 245, 220, 0.25)'; ctx.fillRect(x + w - 3, top, 3, Y - top); // (the corner, catching the light)
  // (the ceiling's trim turning the corner, the skirting at the foot of it)
  ctx.fillStyle = '#2E241E'; ctx.fillRect(x, 60, w, 10);
  ctx.fillStyle = '#111'; ctx.fillRect(x, Y - 8, w, 8);
  // (a fire extinguisher on its bracket, and its sign)
  ctx.fillStyle = '#DC2626'; ctx.fillRect(x + 16, Y - 120, 12, 34); ctx.fillStyle = '#18181B'; ctx.fillRect(x + 18, Y - 126, 8, 6); ctx.fillRect(x + 27, Y - 124, 6, 3);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x + 18, Y - 110, 8, 6);
  ctx.fillStyle = '#B91C1C'; ctx.fillRect(x + 12, Y - 160, 20, 12); ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 4px monospace'; ctx.fillText('FIRE', x + 15, Y - 152);
};

/** The locker room's double doors at the end: swing doors, porthole windows, LOCKER ROOM over them; light beyond when they open. */
const drawDoors = (ctx: Ctx, state: GameState, rt: GymRuntime) => {
  const x = COURSE.doors;
  // (its light spills 300 out across the floor in front of it)
  if (!inView(state, x - 300, x + 150)) return;
  const top = Y - 150, w = 70;
  ctx.fillStyle = '#18181B'; ctx.fillRect(x - 8, top - 30, w * 2 + 16, 182);
  ctx.fillStyle = '#FEF3C7'; ctx.fillRect(x, top, w * 2, 150); // (the light in there)
  ctx.fillStyle = '#B91C1C'; ctx.fillRect(x + 20, top - 26, w * 2 - 40, 16);
  ctx.fillStyle = '#FEF9C3'; ctx.font = 'bold 7px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('LOCKER ROOM', x + w, top - 15); ctx.textAlign = 'left';
  // (the two leaves, swung in by `doors`: seen edge-on as they open)
  const open = rt.doors;
  for (const s of [0, 1]) {
    const lw = w * (1 - open * 0.85);
    const lx = s === 0 ? x : x + w * 2 - lw;
    ctx.fillStyle = '#52525B'; ctx.fillRect(lx, top, lw, 150);
    ctx.fillStyle = '#3F3F46'; ctx.fillRect(lx, top, lw, 4); ctx.fillRect(lx, top + 70, lw, 4);
    if (lw > 30) { ctx.fillStyle = '#1F2937'; ctx.beginPath(); ctx.arc(lx + lw / 2, top + 40, 11, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'rgba(254, 243, 199, 0.6)'; ctx.beginPath(); ctx.arc(lx + lw / 2, top + 40, 8, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#A1A1AA'; ctx.fillRect(s === 0 ? lx + lw - 8 : lx + 2, top + 76, 6, 20);
  }
  if (open > 0) {
    const g = ctx.createLinearGradient(x, 0, x - 260, 0);
    g.addColorStop(0, `rgba(254, 243, 199, ${0.35 * open})`); g.addColorStop(1, 'rgba(254, 243, 199, 0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, Y); ctx.lineTo(x - 300, Y); ctx.closePath(); ctx.fill();
  }
};

/** The plate racks, the plyo boxes, the mezzanine's rail and its sign; the bigger fellas. */
export const drawGymMid = (ctx: Ctx, state: GameState) => {
  const rt = getGym(state);
  if (!rt) return;
  for (const l of COURSE.ledges) if (inView(state, l.x, l.x + l.w)) drawLedge(ctx, l);
  if (inView(state, WALL_X, WALL_X + WALL_W)) drawHalfWall(ctx);
  // (the mezzanine: its rail along the edge, CARDIO KILLS on its front)
  const mz = COURSE.runs.find(r => r.y1 === MEZZ_Y);
  if (mz && inView(state, mz.x1, mz.x2)) {
    ctx.fillStyle = '#A1A1AA';
    ctx.fillRect(mz.x1, MEZZ_Y - 40, mz.x2 - mz.x1, 3);
    for (let x = mz.x1 + 10; x < mz.x2; x += 30) ctx.fillRect(x, MEZZ_Y - 40, 3, 40);
    ctx.fillStyle = '#FACC15'; ctx.fillRect(mz.x1 + 30, MEZZ_Y + 30, 140, 22);
    ctx.fillStyle = '#18181B'; ctx.font = 'bold 8px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('NO SPOTTERS', mz.x1 + 100, MEZZ_Y + 45); ctx.textAlign = 'left';
  }
  for (const b of rt.bigFellas) if (rt.phase !== 'play') drawBigFella(ctx, state, b, rt);
};

/** The half-wall across the floor at the end of the cardio floor: cinderblock, painted, chipped, a sign on it. */
const drawHalfWall = (ctx: Ctx) => {
  const x = WALL_X, w = WALL_W, top = WALL_TOP, h = Y - top;
  ctx.fillStyle = '#A8A08A'; ctx.fillRect(x, top, w, h);
  for (let y = top; y < Y; y += 20) {
    ctx.fillStyle = 'rgba(70, 60, 40, 0.45)'; ctx.fillRect(x, y + 18, w, 2);
    ctx.fillRect(x + (((y - top) / 20) % 2 ? 22 : 10), y, 2, 20);
  }
  ctx.fillStyle = '#C9C1A8'; ctx.fillRect(x, top, w, 4); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + w - 6, top, 6, h);
  // (chips knocked out of it, and the sign)
  ctx.fillStyle = '#7C7462'; ctx.fillRect(x + 4, top + 30, 5, 3); ctx.fillRect(x + 30, top + 62, 4, 4);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x + 6, top + 14, w - 12, 12); ctx.fillStyle = '#DC2626'; ctx.fillRect(x + 6, top + 14, w - 12, 3);
  ctx.fillStyle = '#111'; ctx.font = 'bold 3px monospace'; ctx.fillText('RE-RACK', x + 9, top + 22); ctx.fillText('YOUR WTS', x + 8, top + 25);
};

const drawLedge = (ctx: Ctx, l: Ledge) => {
  if (l.look === 'step') {
    // A stack of plyo boxes up to it
    for (let k = 0; k < 2; k++) {
      const top = l.y + k * 50, h = 50;
      ctx.fillStyle = k ? '#7C2D12' : '#9A3412'; ctx.fillRect(l.x, top, l.w, h);
      ctx.fillStyle = '#C2410C'; ctx.fillRect(l.x, top, l.w, 3);
      ctx.fillStyle = '#18181B'; ctx.font = 'bold 6px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText(k ? '24"' : '30"', l.x + l.w / 2, top + 30); ctx.textAlign = 'left';
    }
    return;
  }
  // A plate rack: two uprights, shelves of plates, its top a steel shelf you can stand on
  ctx.fillStyle = '#3F3F46'; ctx.fillRect(l.x, l.y, 8, Y - l.y); ctx.fillRect(l.x + l.w - 8, l.y, 8, Y - l.y);
  ctx.fillStyle = '#71717A'; ctx.fillRect(l.x, l.y, l.w, 8); ctx.fillStyle = '#A1A1AA'; ctx.fillRect(l.x, l.y, l.w, 2);
  ctx.fillStyle = '#52525B'; ctx.fillRect(l.x, l.y + 50, l.w, 4);
  for (let k = 0; k < 6; k++) {
    const px = l.x + 20 + k * ((l.w - 40) / 5);
    ctx.fillStyle = k % 3 === 0 ? '#1E3A8A' : '#18181B'; ctx.beginPath(); ctx.ellipse(px, l.y + 32, 4, 20, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#18181B'; ctx.beginPath(); ctx.ellipse(px, Y - 26, 4, 22, 0, 0, Math.PI * 2); ctx.fill();
  }
};

/**
 * One of the bigger fellas: what the pencil necks were meant to grow up into. A head taller than them, a neck as
 * wide as his head, shoulders filling out a black suit that actually fits; shades, an earpiece, hair like a helmet.
 * Walking in from the doors (toward him), then planted, hands folded.
 */
const drawBigFella = (ctx: Ctx, state: GameState, b: BigFella, rt: GymRuntime) => {
  // (not in yet: only while the doors are opening; once the fade's started its own clock, they're in, and stay)
  if (rt.phase === 'arrive' && rt.t <= 30 + b.delay) return;
  const walking = b.x > b.to + 0.5;
  const f = state.frame + b.delay * 7;
  ctx.save(); ctx.translate(b.x, Y); ctx.scale(-1, 1);
  const s = walking ? Math.sin(f * 0.16) * 6 : 0, bob = walking ? Math.abs(Math.sin(f * 0.16)) * 2 : 0;
  ctx.translate(0, -bob);
  // Legs, shoes
  ctx.fillStyle = '#0C0C10'; ctx.fillRect(-11 + s, -40, 10, 36); ctx.fillRect(2 - s, -40, 10, 36);
  ctx.fillStyle = '#000'; ctx.fillRect(-13 + s, -5, 14, 5); ctx.fillRect(1 - s, -5, 14, 5);
  // The jacket, cut for the shoulders, the lit edge along it
  ctx.fillStyle = '#0C0C10'; ctx.beginPath(); ctx.moveTo(-24, -82); ctx.lineTo(24, -82); ctx.lineTo(18, -38); ctx.lineTo(-18, -38); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#24242C'; ctx.fillRect(-24, -82, 3, 30); ctx.fillRect(-24, -82, 48, 2);
  ctx.fillStyle = '#E8E8E8'; ctx.beginPath(); ctx.moveTo(-5, -82); ctx.lineTo(5, -82); ctx.lineTo(0, -64); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#000'; ctx.fillRect(-1, -80, 3, 18);
  // Arms: swinging, or hands folded in front
  ctx.fillStyle = '#0C0C10';
  if (walking) { ctx.fillRect(-28, -80 - s * 0.3, 7, 34); ctx.fillRect(21, -80 + s * 0.3, 7, 34); ctx.fillStyle = '#E8C4A0'; ctx.fillRect(-28, -47 - s * 0.3, 7, 6); ctx.fillRect(21, -47 + s * 0.3, 7, 6); }
  else { ctx.fillRect(-28, -80, 7, 26); ctx.fillRect(21, -80, 7, 26); ctx.fillRect(-22, -58, 44, 7); ctx.fillStyle = '#E8C4A0'; ctx.fillRect(-6, -58, 12, 7); }
  // The neck: as wide as his head
  ctx.fillStyle = '#C09470'; ctx.fillRect(-9, -92, 18, 12);
  // The head: square, the side parting, shades, the earpiece and its coil
  ctx.fillStyle = '#E8C4A0'; ctx.fillRect(-10, -112, 20, 22); ctx.fillStyle = '#C09470'; ctx.fillRect(5, -112, 5, 22);
  ctx.fillStyle = '#111'; ctx.fillRect(-11, -116, 22, 7); ctx.fillRect(-11, -112, 4, 6);
  ctx.fillStyle = '#040404'; ctx.fillRect(-9, -105, 18, 5);
  const g = (state.frame * 2 + b.delay * 9) % 140; if (g < 18) { ctx.fillStyle = '#FCFCFC'; ctx.fillRect(-9 + g, -105, 2, 2); }
  ctx.fillStyle = '#A1A1AA'; ctx.fillRect(9, -100, 2, 10);
  ctx.fillStyle = '#8C5040'; ctx.fillRect(-4, -95, 9, 1);
  ctx.restore();
};

/** The pencil necks' lines, over whichever one's saying it. */
export const drawGymFront = (ctx: Ctx, state: GameState) => {
  const rt = getGym(state);
  if (!rt) return;
  const said = saying(rt.talk, 'intern');
  if (said) {
    const e = state.enemies.find(en => en.id === rt.speaker);
    if (e) drawBubble(ctx, e.pos.x + e.width / 2, e.pos.y - 8, said, '#F8FAFC');
  }
};

/** The time up in the corner as it starts, and the fade out at the end. */
export const drawGymHud = (ctx: Ctx, state: GameState) => {
  const rt = getGym(state);
  if (!rt) return;
  if (rt.startedAt === CP.START && state.frame < 260) {
    const a = Math.min(1, Math.min(state.frame / 30, (260 - state.frame) / 40));
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(20, 60, 250, 46);
    ctx.font = 'bold 12px "Press Start 2P"'; ctx.fillStyle = '#FACC15'; ctx.fillText('THE IRON PIT', 32, 80);
    ctx.font = 'bold 8px "Press Start 2P"'; ctx.fillStyle = '#F8FAFC'; ctx.fillText('5:02 A.M. CHEST DAY.', 32, 98);
    ctx.restore();
  }
  const k = fadeAmount(rt);
  if (k > 0) { ctx.fillStyle = `rgba(0,0,0,${k})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
};
