// The block before the corner, drawn: the holes caved in where the mains burst
// (broken asphalt round the lip, the dirt going down, the broken pipe in the
// side), the porch roofs the crew stand up on, the car sunk to its roof, the
// pallets floating, a dumpster, a burned-out car on its roof; the sheared-off
// hydrants (a puddle round each, swelling and bubbling before it goes) and the
// water they blow up, in front of everything.

import type { GameState } from '../../core/state';
import { CANVAS_WIDTH, GROUND_Y } from '../../../constants';
import { COURSE, Ledge, Solid, Main } from './course';
import { mainNow, mainBox, MAIN_W } from './block';

type Ctx = CanvasRenderingContext2D;
const Y = GROUND_Y;

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const visible = (state: GameState, x1: number, x2: number) => x2 > state.camera.x - 80 && x1 < state.camera.x + CANVAS_WIDTH + 80;
/** Only what's up on the block (the sewer has its own channels and ledges). */
const onBlock = (x: number) => x >= COURSE.hood.x1 && x < COURSE.road.x1;

export const drawBlockBack = (ctx: Ctx, state: GameState) => {
  for (const c of COURSE.channels) if (onBlock(c.x1) && visible(state, c.x1, c.x2)) drawHole(ctx, c.x1, c.x2, c.floor);
  for (const s of COURSE.solids) if (visible(state, s.x, s.x + s.w)) drawSolid(ctx, s);
  for (const l of COURSE.ledges) if (onBlock(l.x) && visible(state, l.x, l.x + l.w)) drawLedge(ctx, l, state.frame);
  for (const m of COURSE.mains) if (visible(state, m.x - 40, m.x + 40)) drawMainBase(ctx, m, state.frame);
};

export const drawBlockFront = (ctx: Ctx, state: GameState) => {
  for (const m of COURSE.mains) {
    if (!visible(state, m.x - 40, m.x + 40)) continue;
    const now = mainNow(m, state.frame);
    if (now.state === 'blast' && now.height > 2) drawColumn(ctx, m, now.height, state.frame);
  }
};

// ---------------------------------------------------------------------------

/** A hole where the street caved in: the dirt going down, a broken pipe sticking out of the side, broken slabs of
 * the road hanging in over the lip, a sawhorse knocked over by the near edge. (The water's drawn in front, with the sewer's.) */
const drawHole = (ctx: Ctx, x1: number, x2: number, floor: number) => {
  const w = x2 - x1;
  // The dirt, darker going down, in bands
  const g = ctx.createLinearGradient(0, Y, 0, floor);
  g.addColorStop(0, '#4A3728'); g.addColorStop(1, '#1C140E');
  ctx.fillStyle = g; ctx.fillRect(x1, Y, w, floor - Y);
  ctx.fillStyle = '#1C140E'; ctx.fillRect(x1 - 1, floor, w + 2, 600); // (and on down, under the silt)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
  for (let y = Y + 14; y < floor; y += 17) ctx.fillRect(x1, y + hash(y) * 4, w, 3);
  // Stones in it
  for (let i = 0; i < w / 22; i++) {
    const sx = x1 + hash(x1 + i * 3.7) * w, sy = Y + 10 + hash(i * 9.1 + x1) * (floor - Y - 10);
    ctx.fillStyle = i % 3 ? '#5B4B3E' : '#6B5B4E';
    ctx.beginPath(); ctx.ellipse(sx, sy, 4 + hash(i) * 6, 3 + hash(i * 2) * 3, 0, 0, Math.PI * 2); ctx.fill();
  }
  // The burst main, broken off in the far wall, rusted through
  const py = Y + 26;
  ctx.fillStyle = '#5C3A21'; ctx.fillRect(x2 - 46, py, 46, 18);
  ctx.fillStyle = '#7C4A24'; ctx.fillRect(x2 - 46, py, 46, 5);
  ctx.fillStyle = '#3B2414'; ctx.beginPath(); ctx.moveTo(x2 - 46, py - 2); ctx.lineTo(x2 - 52, py + 6); ctx.lineTo(x2 - 44, py + 10); ctx.lineTo(x2 - 50, py + 20); ctx.lineTo(x2 - 44, py + 20); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(120, 53, 15, 0.55)'; ctx.fillRect(x2 - 52, py + 18, 5, 26); // (a trickle out of it)
  // Rebar and a hunk of curb in the near wall
  ctx.strokeStyle = '#57534E'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x1, Y + 6); ctx.lineTo(x1 + 22, Y + 16); ctx.moveTo(x1, Y + 12); ctx.lineTo(x1 + 16, Y + 26); ctx.stroke();
  // Slabs of the road broken off round the lip, tipped in
  for (const [sx, dir] of [[x1, 1], [x2, -1]] as const) {
    ctx.fillStyle = '#3F3F46';
    ctx.beginPath(); ctx.moveTo(sx, Y - 1); ctx.lineTo(sx + dir * 30, Y + 4); ctx.lineTo(sx + dir * 24, Y + 18); ctx.lineTo(sx, Y + 12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#A8A29E'; ctx.beginPath(); ctx.moveTo(sx, Y - 2); ctx.lineTo(sx + dir * 30, Y + 3); ctx.lineTo(sx + dir * 30, Y + 7); ctx.lineTo(sx, Y + 3); ctx.closePath(); ctx.fill();
    // (cracks running back from the edge)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(sx, Y + 2); ctx.lineTo(sx - dir * 26, Y + 8); ctx.lineTo(sx - dir * 44, Y + 5); ctx.moveTo(sx - dir * 26, Y + 8); ctx.lineTo(sx - dir * 34, Y + 22); ctx.stroke();
  }
  // A sawhorse knocked over by the near edge, its sign half off
  const bx = x1 - 70;
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(bx, Y - 12, 44, 8);
  ctx.fillStyle = '#EA580C'; for (let s = 0; s < 44; s += 11) ctx.fillRect(bx + s, Y - 12, 5, 8);
  ctx.fillStyle = '#78716C'; ctx.fillRect(bx + 4, Y - 5, 3, 5); ctx.fillRect(bx + 36, Y - 5, 3, 5);
  ctx.save(); ctx.translate(bx + 30, Y - 4); ctx.rotate(0.35);
  ctx.fillStyle = '#F97316'; ctx.fillRect(0, -14, 34, 12); ctx.fillStyle = '#111827'; ctx.font = 'bold 4px "Press Start 2P"'; ctx.fillText('ROAD', 7, -9); ctx.fillText('CLOSED', 3, -4);
  ctx.restore();
};

const drawSolid = (ctx: Ctx, s: Solid) => {
  const { x, y, w, h } = s;
  if (s.look === 'dumpster') {
    // Body (tapering in to the bottom), ribs, rust, a lid propped open with trash spilling out
    ctx.fillStyle = '#14532D';
    ctx.beginPath(); ctx.moveTo(x, y + 6); ctx.lineTo(x + w, y + 6); ctx.lineTo(x + w - 6, y + h - 8); ctx.lineTo(x + 6, y + h - 8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#166534'; ctx.fillRect(x, y + 6, w, 7);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'; for (let rx = x + 14; rx < x + w - 8; rx += 18) ctx.fillRect(rx, y + 14, 4, h - 24);
    ctx.fillStyle = 'rgba(146, 64, 14, 0.55)'; ctx.fillRect(x + 8, y + h - 20, 22, 10); ctx.fillRect(x + w - 30, y + 20, 12, 18);
    // (a tag sprayed on it)
    ctx.strokeStyle = '#E879F9'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 20, y + 34); ctx.quadraticCurveTo(x + 34, y + 20, x + 44, y + 36); ctx.quadraticCurveTo(x + 54, y + 22, x + 70, y + 32); ctx.stroke();
    // Wheels
    ctx.fillStyle = '#18181B'; ctx.beginPath(); ctx.arc(x + 14, y + h - 5, 5, 0, Math.PI * 2); ctx.arc(x + w - 14, y + h - 5, 5, 0, Math.PI * 2); ctx.fill();
    // The lid down on it (what he stands on), not quite shut: a trash bag and a pizza box squashed in under the far end
    ctx.fillStyle = '#27272A'; ctx.beginPath(); ctx.ellipse(x + w - 26, y + 5, 12, 5, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#E7E5E4'; ctx.fillRect(x + w - 16, y + 1, 12, 4);
    ctx.fillStyle = '#15803D'; ctx.beginPath(); ctx.moveTo(x - 2, y + 7); ctx.lineTo(x - 2, y + 2); ctx.lineTo(x + w + 2, y - 1); ctx.lineTo(x + w + 2, y + 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#22A04D'; ctx.beginPath(); ctx.moveTo(x - 2, y + 2); ctx.lineTo(x + w + 2, y - 1); ctx.lineTo(x + w + 2, y + 1); ctx.lineTo(x - 2, y + 4); ctx.closePath(); ctx.fill();
    return;
  }
  // A car burned out and left on its roof: the chassis up top (what you stand on), wheels up, one still on
  ctx.fillStyle = '#292524'; ctx.fillRect(x + 4, y + 16, w - 8, h - 18);            // (the body, upside down)
  ctx.fillStyle = '#1C1917'; ctx.fillRect(x + 22, y + h - 12, w - 44, 12);            // (the crushed roof under it)
  ctx.fillStyle = '#0C0A09'; for (let wx = x + 30; wx < x + w - 34; wx += 30) ctx.fillRect(wx, y + h - 10, 22, 7); // (no glass)
  ctx.fillStyle = '#3F2A1D'; ctx.fillRect(x, y + 6, w, 12);                          // chassis
  ctx.fillStyle = '#57534E'; ctx.fillRect(x + 10, y + 2, w - 20, 5);                 // exhaust, driveshaft
  ctx.fillStyle = 'rgba(180, 83, 9, 0.5)'; for (let rx = x + 6; rx < x + w - 10; rx += 26) ctx.fillRect(rx + hash(rx) * 8, y + 18 + hash(rx * 3) * 16, 14, 8); // rust
  // Wheels up: a rim either end, one tire still on
  ctx.fillStyle = '#18181B'; ctx.beginPath(); ctx.arc(x + 26, y + 4, 13, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#71717A'; ctx.beginPath(); ctx.arc(x + 26, y + 4, 6, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#52525B'; ctx.beginPath(); ctx.arc(x + w - 26, y + 4, 8, Math.PI, 0); ctx.fill();
  // Soot up the side
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'; ctx.beginPath(); ctx.ellipse(x + w * 0.6, y + h - 16, 34, 14, 0, 0, Math.PI * 2); ctx.fill();
};

const drawLedge = (ctx: Ctx, l: Ledge, frame: number) => {
  const { x, y, w } = l;
  if (l.look === 'porchroof') {
    // The porch under it: its floor, an old couch out on it, the posts holding it up (one's been patched)
    ctx.fillStyle = '#57534E'; ctx.fillRect(x + 2, Y - 22, w - 4, 22);
    ctx.fillStyle = '#44403C'; for (let sx = x + 8; sx < x + w - 8; sx += 22) ctx.fillRect(sx, Y - 22, 2, 22);
    ctx.fillStyle = '#6B5B3E'; ctx.fillRect(x + w / 2 - 34, Y - 44, 68, 14); ctx.fillRect(x + w / 2 - 38, Y - 54, 10, 24); ctx.fillRect(x + w / 2 + 28, Y - 54, 10, 24);
    ctx.fillStyle = '#7C6A4A'; ctx.fillRect(x + w / 2 - 28, Y - 60, 56, 16);
    ctx.fillStyle = '#6B4F3A'; ctx.fillRect(x + 6, y + 12, 7, Y - 22 - y - 12); ctx.fillRect(x + w - 13, y + 12, 7, Y - 22 - y - 12);
    ctx.fillStyle = '#A16207'; ctx.fillRect(x + w - 15, y + 40, 11, 5);
    // The roof: shingles, a fascia board, the gutter hanging off one end
    ctx.fillStyle = '#3F3A36'; ctx.fillRect(x - 6, y, w + 12, 12);
    ctx.fillStyle = '#524A44'; for (let sx = x - 6; sx < x + w + 6; sx += 14) ctx.fillRect(sx, y + 1, 12, 4);
    ctx.fillStyle = '#E7E5E4'; ctx.fillRect(x - 6, y + 10, w + 12, 4);
    ctx.strokeStyle = '#A8A29E'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 6, y + 14); ctx.lineTo(x + w * 0.6, y + 16); ctx.lineTo(x + w + 4, y + 34); ctx.stroke();
    return;
  }
  if (l.look === 'carroof') {
    // A car sunk to its roof: the roof, the tops of the windows, the doors going down into the water
    ctx.fillStyle = '#3B5B7A'; ctx.beginPath(); ctx.roundRect(x - 10, y + 10, w + 20, 60, 6); ctx.fill();
    ctx.fillStyle = '#4A6E92'; ctx.beginPath(); ctx.roundRect(x, y, w, 14, [8, 8, 2, 2]); ctx.fill();
    ctx.fillStyle = '#0F172A'; ctx.fillRect(x + 6, y + 14, w / 2 - 10, 18); ctx.fillRect(x + w / 2 + 4, y + 14, w / 2 - 10, 18);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'; ctx.fillRect(x + 12, y + 16, 5, 12); ctx.fillRect(x + w / 2 + 10, y + 16, 5, 12);
    ctx.fillStyle = 'rgba(146, 64, 14, 0.45)'; ctx.fillRect(x + 4, y + 2, 20, 3); // (rust spots)
    return;
  }
  // A pallet floating on it (bobbing, a little)
  const bob = Math.sin(frame * 0.08 + x) * 1.2;
  ctx.fillStyle = '#A16207'; ctx.fillRect(x, y + bob, w, 5);
  ctx.fillStyle = '#854D0E'; for (let sx = x + 2; sx < x + w; sx += 12) ctx.fillRect(sx, y + 5 + bob, 7, 6);
  ctx.fillStyle = '#CA8A04'; ctx.fillRect(x, y + bob, w, 1);
};

/** Where a main comes up: a hydrant sheared off at the curb (its cap in the gutter, the puddle round it), or the end of
 * the broken main up out of the water. It rattles and the puddle swells before it goes. */
const drawMainBase = (ctx: Ctx, m: Main, frame: number) => {
  const now = mainNow(m, frame);
  const warn = now.state === 'warn' ? now.k : now.state === 'blast' ? 1 : 0;
  const shake = now.state === 'warn' ? Math.sin(frame * 2.3) * 1.3 * now.k : 0;
  if (m.look === 'hydrant') {
    // The puddle (swelling as it's about to go)
    ctx.fillStyle = 'rgba(120, 53, 15, 0.5)'; ctx.beginPath(); ctx.ellipse(m.x, m.base + 1, 26 + warn * 14, 3 + warn * 2, 0, 0, Math.PI * 2); ctx.fill();
    // The stub: flange, the broken-off barrel, a chain hanging with nothing on it
    ctx.fillStyle = '#7F1D1D'; ctx.fillRect(m.x - 14 + shake, m.base - 5, 28, 5);
    ctx.fillStyle = '#B91C1C'; ctx.fillRect(m.x - 10 + shake, m.base - 17, 20, 12);
    ctx.fillStyle = '#450A0A'; ctx.beginPath(); ctx.moveTo(m.x - 10 + shake, m.base - 17); ctx.lineTo(m.x - 4 + shake, m.base - 21); ctx.lineTo(m.x + 3 + shake, m.base - 17); ctx.lineTo(m.x + 10 + shake, m.base - 20); ctx.lineTo(m.x + 10 + shake, m.base - 16); ctx.lineTo(m.x - 10 + shake, m.base - 16); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FACC15'; ctx.fillRect(m.x - 14 + shake, m.base - 13, 4, 4);
    ctx.strokeStyle = '#A8A29E'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(m.x - 12 + shake, m.base - 11); ctx.quadraticCurveTo(m.x - 18, m.base - 4, m.x - 16, m.base); ctx.stroke();
    // (its top lying in the gutter nearby)
    ctx.fillStyle = '#B91C1C'; ctx.beginPath(); ctx.ellipse(m.x + 34, m.base - 5, 9, 5, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.arc(m.x + 34, m.base - 9, 3, 0, Math.PI * 2); ctx.fill();
  } else {
    // The main's broken end, up out of the water, rust dripping off it
    ctx.fillStyle = '#5C3A21'; ctx.fillRect(m.x - MAIN_W / 2 - 4 + shake, m.base - 14, MAIN_W + 8, 22);
    ctx.fillStyle = '#7C4A24'; ctx.fillRect(m.x - MAIN_W / 2 - 4 + shake, m.base - 14, MAIN_W + 8, 5);
    ctx.fillStyle = '#1C140E'; ctx.beginPath(); ctx.ellipse(m.x + shake, m.base - 14, MAIN_W / 2, 4, 0, 0, Math.PI * 2); ctx.fill();
  }
  // Bubbling up round it as it's about to go
  if (warn > 0 && now.state === 'warn') {
    for (let i = 0; i < 5; i++) {
      const q = ((frame * (0.8 + warn) + i * 13) % 20) / 20;
      ctx.fillStyle = `rgba(214, 163, 92, ${0.7 * (1 - q)})`;
      ctx.beginPath(); ctx.arc(m.x - 16 + i * 8, m.base - 4 - q * (6 + warn * 10), 1.5 + q * 2.5, 0, Math.PI * 2); ctx.fill();
    }
  }
};

/** The water, straight up: rust-brown at the bottom going to dirty foam at the top, streaks running up it, a crown of
 * spray on top and a splash round the foot of it. */
const drawColumn = (ctx: Ctx, m: Main, height: number, frame: number) => {
  const b = mainBox(m, height);
  ctx.save();
  const g = ctx.createLinearGradient(0, b.y + b.h, 0, b.y);
  g.addColorStop(0, 'rgba(120, 53, 15, 0.92)'); g.addColorStop(0.6, 'rgba(180, 83, 9, 0.85)'); g.addColorStop(1, 'rgba(214, 163, 92, 0.8)');
  ctx.fillStyle = g;
  // (wobbling at the edges)
  ctx.beginPath(); ctx.moveTo(b.x, b.y + b.h);
  for (let y = b.y + b.h; y > b.y; y -= 12) ctx.lineTo(b.x + Math.sin(y * 0.1 + frame * 0.6) * 3 - 2, y);
  for (let y = b.y; y < b.y + b.h; y += 12) ctx.lineTo(b.x + b.w + Math.sin(y * 0.1 + frame * 0.6 + 2) * 3 + 2, y);
  ctx.lineTo(b.x + b.w, b.y + b.h); ctx.closePath(); ctx.fill();
  // Streaks running up it
  ctx.fillStyle = 'rgba(253, 230, 138, 0.35)';
  for (let i = 0; i < 4; i++) {
    const sx = b.x + 6 + i * 8, off = (frame * 9 + i * 37) % 60;
    for (let y = b.y + b.h - off; y > b.y; y -= 60) ctx.fillRect(sx, y - 22, 2, 22);
  }
  // Spray on top
  for (let i = 0; i < 7; i++) {
    const a = (i / 6) * Math.PI;
    ctx.fillStyle = i % 2 ? 'rgba(214, 163, 92, 0.85)' : 'rgba(245, 222, 179, 0.8)';
    ctx.beginPath(); ctx.arc(m.x - Math.cos(a) * 20, b.y + 2 - Math.sin(a) * 10 + Math.sin(frame * 0.5 + i) * 3, 7 + (i % 3) * 2, 0, Math.PI * 2); ctx.fill();
  }
  // The splash round the foot of it
  ctx.fillStyle = 'rgba(146, 64, 14, 0.7)'; ctx.beginPath(); ctx.ellipse(m.x, m.base - 2, MAIN_W, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};
