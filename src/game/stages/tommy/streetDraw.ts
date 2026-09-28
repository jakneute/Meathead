// Flint, above ground: the sky going from late afternoon to sunset down the
// road, the town low and flat out to the horizon (houses, trees, a church
// steeple, the old plant's smokestacks), and the water tower standing over it
// all with FLINT on the tank. Up close: the East Side (tired little houses,
// half of them boarded up, chain-link, a liquor store, BOIL WATER signs), the
// road, the junk in it, the bike, the crew on the corner, the
// man in the hazmat suit with his bottle.

import type { GameState } from '../../core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y } from '../../../constants';
import { groundLineAt } from '../../core/terrain';
import { COURSE, RoadJunk } from './course';
import { TommyRuntime } from './runtime';
import { junkBox, geyserOn, BikeRun } from './bike';
import { CRANK } from '../../render/player/moves';

type Ctx = CanvasRenderingContext2D;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const mix = (a: string, b: string, k: number) => {
  const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * k)).join(',')})`;
};

/** How far down the road the evening's got (0 late afternoon at the corner .. 1 sunset at the end of the road). */
export const eveningAt = (camX: number) => Math.max(0, Math.min(1, (camX - COURSE.hood.x1) / (COURSE.road.x2 - COURSE.hood.x1)));

// ---------------------------------------------------------------------------
// Screen space: the sky, the town far off, the water tower
// ---------------------------------------------------------------------------

export const drawStreetSky = (ctx: Ctx, state: GameState, dusk = -1, tower = true) => {
  const k = dusk >= 0 ? dusk : eveningAt(state.camera.x);
  const top = mix('#5B8FC7', '#3B2A5C', k), mid = mix('#9CC3E0', '#C2546A', k), low = mix('#F6D29A', '#F59E4B', k);
  const g = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  g.addColorStop(0, top); g.addColorStop(0.55, mid); g.addColorStop(0.85, low);
  ctx.fillStyle = g; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  // The sun, low and getting lower
  const sy = 250 + k * 170;
  const sg = ctx.createRadialGradient(640, sy, 6, 640, sy, 120);
  sg.addColorStop(0, 'rgba(255, 244, 214, 0.95)'); sg.addColorStop(0.2, 'rgba(255, 214, 150, 0.6)'); sg.addColorStop(1, 'rgba(255, 180, 120, 0)');
  ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(640, sy, 120, 0, Math.PI * 2); ctx.fill();
  // Streaks of cloud
  ctx.fillStyle = `rgba(255, ${Math.round(230 - k * 80)}, ${Math.round(210 - k * 90)}, 0.35)`;
  for (let i = 0; i < 5; i++) { const x = ((i * 211 - state.camera.x * 0.01) % 1000 + 1000) % 1000 - 100; ctx.fillRect(x, 90 + i * 34, 160 + (i % 2) * 80, 5); }
  // The town, far off and low (a slow parallax): roofs, trees, a steeple, the old plant's stacks
  const horizon = 420 - Math.max(-40, Math.min(40, (state.camera.y - (GROUND_Y - 550)) * 0.08));
  const far = mix('#6B6F8A', '#3A2C4A', k);
  ctx.fillStyle = far;
  const off = state.camera.x * 0.06;
  for (let i = -1; i < 26; i++) {
    const id = i + Math.floor(off / 40);
    const x = i * 40 - (off % 40);
    const h = 14 + hash(id) * 22;
    if (hash(id * 3) < 0.5) { ctx.beginPath(); ctx.moveTo(x, horizon); ctx.lineTo(x, horizon - h); ctx.lineTo(x + 20, horizon - h - 10); ctx.lineTo(x + 40, horizon - h); ctx.lineTo(x + 40, horizon); ctx.fill(); }
    else { ctx.beginPath(); ctx.arc(x + 20, horizon - h * 0.7, 16 + hash(id * 5) * 8, Math.PI, 0); ctx.fill(); ctx.fillRect(x + 4, horizon - h * 0.7, 32, h * 0.7); }
    if (hash(id * 7) < 0.06) { ctx.fillRect(x + 10, horizon - h - 50, 6, 50); ctx.beginPath(); ctx.moveTo(x + 7, horizon - h - 50); ctx.lineTo(x + 13, horizon - h - 70); ctx.lineTo(x + 19, horizon - h - 50); ctx.fill(); }
    if (hash(id * 11) < 0.05) { for (const sx of [0, 14]) { ctx.fillRect(x + sx, horizon - h - 90, 9, 90); ctx.fillStyle = 'rgba(120, 113, 108, 0.35)'; ctx.beginPath(); ctx.arc(x + sx + 4, horizon - h - 104, 10, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = far; } }
  }
  ctx.fillRect(0, horizon, CANVAS_WIDTH, CANVAS_HEIGHT - horizon);
  // The water tower over it all
  const tx = 620 - (state.camera.x - COURSE.hood.x1) * 0.018;
  if (tower && tx > -120 && tx < CANVAS_WIDTH + 120) drawWaterTower(ctx, tx, horizon, 1, k);
};

/** The water tower: four legs and bracing, a round tank with a pointed roof, FLINT on it. (x the middle, y its feet.) */
export const drawWaterTower = (ctx: Ctx, x: number, y: number, s: number, dusk: number, tilt = 0, hole = false) => {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(tilt); ctx.scale(s, s);
  const metal = mix('#8E9AAB', '#5A5068', dusk), dark = mix('#5E6878', '#3A3046', dusk);
  ctx.strokeStyle = dark; ctx.lineWidth = 4;
  for (const lx of [-34, -12, 12, 34]) { ctx.beginPath(); ctx.moveTo(lx * 1.3, 0); ctx.lineTo(lx, -150); ctx.stroke(); }
  ctx.lineWidth = 2;
  for (const yy of [-40, -90, -135]) { ctx.beginPath(); ctx.moveTo(-40, yy); ctx.lineTo(40, yy); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-44, -2); ctx.lineTo(34, -90); ctx.moveTo(44, -2); ctx.lineTo(-34, -90); ctx.stroke();
  // The tank
  ctx.fillStyle = metal; ctx.beginPath(); ctx.roundRect(-58, -230, 116, 84, 10); ctx.fill();
  ctx.fillStyle = dark; ctx.fillRect(-58, -156, 116, 10);
  ctx.fillStyle = metal; ctx.beginPath(); ctx.moveTo(-62, -228); ctx.lineTo(0, -270); ctx.lineTo(62, -228); ctx.closePath(); ctx.fill();
  ctx.fillStyle = dark; ctx.fillRect(-2, -282, 4, 14);
  ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(-50, -224, 14, 72);
  ctx.fillStyle = mix('#1E3A8A', '#1E1B4B', dusk); ctx.font = 'bold 26px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('FLINT', 0, -176); ctx.textAlign = 'left';
  if (hole) { ctx.fillStyle = '#1C1917'; ctx.beginPath(); ctx.ellipse(-20, -196, 12, 9, 0.3, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
};

// ---------------------------------------------------------------------------
// The street: the ground, and the East Side along it
// ---------------------------------------------------------------------------

/** The street under him: asphalt, a curb and a strip of sidewalk, the center line worn away in patches. */
export const drawStreetGround = (ctx: Ctx, state: GameState) => {
  const x0 = state.camera.x - 60, x1 = state.camera.x + CANVAS_WIDTH + 60;
  const bottom = state.camera.y + CANVAS_HEIGHT + 60;
  const runs = state.groundRuns.filter(r => r.surface === 'street' && r.x2 > x0 && r.x1 < x1);
  if (!runs.length) return;
  ctx.beginPath();
  ctx.moveTo(runs[0].x1, bottom);
  for (const r of runs) { ctx.lineTo(r.x1, r.y1); ctx.lineTo(r.x2, r.y2); }
  ctx.lineTo(runs[runs.length - 1].x2, bottom); ctx.closePath();
  ctx.fillStyle = '#3F3F46'; ctx.fill();
  // Sidewalk and curb along the top, asphalt texture, the line
  for (const r of runs) {
    const len = Math.hypot(r.x2 - r.x1, r.y2 - r.y1), a = Math.atan2(r.y2 - r.y1, r.x2 - r.x1);
    ctx.save(); ctx.translate(r.x1, r.y1); ctx.rotate(a);
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(0, -2, len + 1, 8);
    ctx.fillStyle = '#78716C'; ctx.fillRect(0, 6, len + 1, 3);
    ctx.fillStyle = '#52525B'; ctx.fillRect(0, 9, len + 1, 4);
    for (let s = 0; s < len; s += 50) if (hash(r.x1 + s) > 0.3) { ctx.fillStyle = '#FDE68A'; ctx.fillRect(s, 34, 26, 3); }
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; for (let s = 10; s < len; s += 37) ctx.fillRect(s, 14 + hash(r.x1 + s) * 40, 12 + hash(s) * 10, 1); // cracks
    ctx.restore();
  }
};

/** Along the street: a lot at a time, whatever's on it (a house, most of them; the odd store, church, empty lot, the plant). */
export const drawStreetFronts = (ctx: Ctx, state: GameState) => {
  const LOT = 300;
  const k0 = Math.floor((state.camera.x - 300) / LOT), k1 = Math.ceil((state.camera.x + CANVAS_WIDTH + 300) / LOT);
  const dusk = eveningAt(state.camera.x);
  for (let k = k0; k <= k1; k++) {
    const x = k * LOT + 20;
    if (x < COURSE.hood.x1 - 100 || x > COURSE.road.x2) continue;
    // (sat level on the higher side of the lot, a foundation down to the road under the rest of it)
    const gL = groundLineAt(state.groundRuns, x - 20), gR = groundLineAt(state.groundRuns, x + 300);
    if (gL === Infinity || gR === Infinity) continue;
    const base = Math.min(gL, gR) - 6;
    ctx.fillStyle = '#6B635C'; ctx.beginPath(); ctx.moveTo(x - 20, base); ctx.lineTo(x + 300, base); ctx.lineTo(x + 300, gR + 2); ctx.lineTo(x - 20, gL + 2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; for (let yy = base + 8; yy < Math.max(gL, gR); yy += 10) ctx.fillRect(x - 20, yy, 320, 1);
    ctx.fillStyle = '#57534E'; ctx.fillRect(x - 20, base - 2, 320, 4);
    const h = hash(k * 7.3);
    if (h < 0.1) drawLiquor(ctx, x, base, dusk);
    else if (h < 0.16) drawChurch(ctx, x, base, dusk);
    else if (h < 0.24) drawEmptyLot(ctx, x, base, k);
    else if (h < 0.28) drawBillboard(ctx, x, base, k);
    else drawHouse(ctx, x, base, k, dusk);
    // Power poles, wires sagging between them
    if (k % 2 === 0) {
      ctx.fillStyle = '#44403C'; ctx.fillRect(x + 250, base - 190, 5, 190); ctx.fillRect(x + 236, base - 184, 33, 4);
      ctx.strokeStyle = 'rgba(28, 25, 23, 0.8)'; ctx.lineWidth = 1;
      const nx = x + 250 + LOT * 2, ng = groundLineAt(state.groundRuns, nx) - 6;
      ctx.beginPath(); ctx.moveTo(x + 250, base - 182); ctx.quadraticCurveTo(x + 250 + LOT, (base + ng) / 2 - 150, nx, ng - 182); ctx.stroke();
    }
  }
};

const HOUSE_PAINT = ['#8FA3A8', '#B9A38B', '#9E6B5C', '#6E8B74', '#C8B88A', '#7E7F9A'];

/** A little two-story frame house: peeling paint, a porch, a sagging roof; boarded up or burned out, some of them. */
const drawHouse = (ctx: Ctx, x: number, base: number, k: number, dusk: number) => {
  const paint = HOUSE_PAINT[Math.floor(hash(k) * HOUSE_PAINT.length)];
  const burned = hash(k * 3) < 0.15, boarded = hash(k * 5) < 0.4;
  const w = 200, h = 150;
  ctx.fillStyle = burned ? '#3F3A36' : paint; ctx.fillRect(x + 30, base - h, w, h);
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let y = base - h + 8; y < base; y += 9) ctx.fillRect(x + 30, y, w, 1); // siding
  ctx.fillStyle = burned ? '#1C1917' : '#4B3B35';
  ctx.beginPath(); ctx.moveTo(x + 18, base - h); ctx.lineTo(x + 30 + w / 2, base - h - 60 - (hash(k * 9) < 0.3 ? -10 : 0)); ctx.lineTo(x + 42 + w, base - h); ctx.fill();
  // Windows: lit (it's getting on), dark, boarded
  for (const [wx, wy] of [[60, -120], [150, -120], [60, -64], [180, -64]]) {
    const lit = !burned && !boarded && hash(k * 13 + wx + wy) < 0.25 + dusk * 0.4;
    ctx.fillStyle = burned ? '#0C0A09' : lit ? '#FCD34D' : '#1F2937'; ctx.fillRect(x + wx, base + wy, 30, 34);
    if (boarded && hash(k + wx) < 0.7) { ctx.fillStyle = '#A16207'; ctx.fillRect(x + wx - 3, base + wy + 8, 36, 6); ctx.fillRect(x + wx - 3, base + wy + 20, 36, 6); }
  }
  if (burned) { ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.ellipse(x + 90, base - h + 20, 50, 30, 0, 0, Math.PI * 2); ctx.fill(); }
  // The porch
  ctx.fillStyle = '#57534E'; ctx.fillRect(x + 110, base - 30, 70, 30); ctx.fillStyle = '#78716C'; ctx.fillRect(x + 106, base - 68, 78, 5);
  ctx.fillRect(x + 110, base - 64, 4, 34); ctx.fillRect(x + 176, base - 64, 4, 34);
  ctx.fillStyle = '#1F2937'; ctx.fillRect(x + 130, base - 60, 24, 30);
  // A sign in the yard now and then
  const sign = hash(k * 17);
  if (sign < 0.12) { ctx.fillStyle = '#44403C'; ctx.fillRect(x + 12, base - 30, 3, 30); ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x - 6, base - 50, 40, 22); ctx.fillStyle = '#B91C1C'; ctx.font = 'bold 5px "Press Start 2P"'; ctx.fillText('CONDEMNED', x - 4, base - 36); }
  else if (sign < 0.22) { ctx.fillStyle = '#44403C'; ctx.fillRect(x + 12, base - 30, 3, 30); ctx.fillStyle = '#1D4ED8'; ctx.fillRect(x - 10, base - 54, 48, 26); ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 5px "Press Start 2P"'; ctx.fillText('BOIL WATER', x - 8, base - 43); ctx.fillText('ADVISORY', x - 5, base - 34); }
  // Chain-link along the front
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)'; ctx.lineWidth = 1;
  for (let fx = x; fx < x + 270; fx += 8) { ctx.beginPath(); ctx.moveTo(fx, base - 36); ctx.lineTo(fx + 8, base); ctx.moveTo(fx + 8, base - 36); ctx.lineTo(fx, base); ctx.stroke(); }
  ctx.fillStyle = '#94A3B8'; ctx.fillRect(x, base - 38, 270, 2);
};

const drawLiquor = (ctx: Ctx, x: number, base: number, dusk: number) => {
  ctx.fillStyle = '#6B7280'; ctx.fillRect(x + 10, base - 150, 250, 150);
  ctx.fillStyle = '#B91C1C'; ctx.fillRect(x + 10, base - 150, 250, 32);
  ctx.fillStyle = dusk > 0.4 ? '#FDE047' : '#FEF3C7'; ctx.font = 'bold 16px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('LIQUOR', x + 135, base - 127); ctx.textAlign = 'left';
  ctx.fillStyle = '#111827'; ctx.fillRect(x + 30, base - 104, 150, 70); ctx.fillStyle = '#44403C'; for (let bx = x + 30; bx < x + 180; bx += 10) ctx.fillRect(bx, base - 104, 3, 70); // bars on the windows
  ctx.fillStyle = '#FACC15'; ctx.font = 'bold 6px "Press Start 2P"'; ctx.fillText('WE HAVE WATER', x + 40, base - 84); ctx.fillText('$9.99 GAL', x + 60, base - 72);
  ctx.fillStyle = '#1F2937'; ctx.fillRect(x + 200, base - 90, 40, 90);
};

const drawChurch = (ctx: Ctx, x: number, base: number, dusk: number) => {
  ctx.fillStyle = '#D6D3D1'; ctx.fillRect(x + 40, base - 140, 190, 140);
  ctx.beginPath(); ctx.moveTo(x + 30, base - 140); ctx.lineTo(x + 135, base - 200); ctx.lineTo(x + 240, base - 140); ctx.fillStyle = '#57534E'; ctx.fill();
  ctx.fillStyle = '#D6D3D1'; ctx.fillRect(x + 118, base - 260, 34, 70); ctx.beginPath(); ctx.moveTo(x + 114, base - 260); ctx.lineTo(x + 135, base - 310); ctx.lineTo(x + 156, base - 260); ctx.fillStyle = '#57534E'; ctx.fill();
  ctx.fillStyle = '#44403C'; ctx.fillRect(x + 133, base - 330, 4, 22); ctx.fillRect(x + 127, base - 324, 16, 4);
  ctx.fillStyle = dusk > 0.3 ? '#FBBF24' : '#1E3A8A'; for (const wx of [70, 170]) { ctx.beginPath(); ctx.arc(x + wx + 10, base - 90, 10, Math.PI, 0); ctx.fill(); ctx.fillRect(x + wx, base - 90, 20, 30); }
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x + 60, base - 40, 150, 24); ctx.fillStyle = '#111827'; ctx.font = 'bold 5px "Press Start 2P"'; ctx.fillText('LIVING WATER BAPTIST', x + 64, base - 30); ctx.fillText('PRAY FOR CLEAN PIPES', x + 64, base - 21);
};

const drawEmptyLot = (ctx: Ctx, x: number, base: number, k: number) => {
  ctx.fillStyle = '#65743F'; ctx.fillRect(x, base - 6, 280, 8);
  ctx.fillStyle = '#4D5A2E'; for (let gx = x; gx < x + 280; gx += 6) ctx.fillRect(gx, base - 6 - hash(gx) * 10, 2, 6 + hash(gx) * 10);
  // Tires, a mattress, a shopping cart
  ctx.fillStyle = '#1C1917'; ctx.beginPath(); ctx.arc(x + 60, base - 10, 10, 0, Math.PI * 2); ctx.arc(x + 78, base - 10, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#D6D3D1'; ctx.save(); ctx.translate(x + 170, base - 12); ctx.rotate(-0.15); ctx.fillRect(-40, -8, 80, 14); ctx.fillStyle = 'rgba(120, 53, 15, 0.4)'; ctx.fillRect(-10, -6, 20, 10); ctx.restore();
  if (hash(k * 19) < 0.5) { ctx.strokeStyle = '#9CA3AF'; ctx.lineWidth = 1.5; ctx.strokeRect(x + 220, base - 30, 30, 20); ctx.beginPath(); ctx.arc(x + 224, base - 6, 3, 0, Math.PI * 2); ctx.arc(x + 246, base - 6, 3, 0, Math.PI * 2); ctx.stroke(); }
};

const BILLBOARDS = [['FLINT', 'VEHICLE CITY'], ['BOTTLED WATER', 'DISTRIBUTION ->'], ["DON'T DRINK", 'THE WATER'], ['TOMMY WASTE', 'MANAGEMENT LLC']];
const drawBillboard = (ctx: Ctx, x: number, base: number, k: number) => {
  const [a, b] = BILLBOARDS[Math.abs(k) % BILLBOARDS.length];
  ctx.fillStyle = '#44403C'; ctx.fillRect(x + 80, base - 160, 6, 160); ctx.fillRect(x + 190, base - 160, 6, 160);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x + 40, base - 250, 200, 96);
  ctx.fillStyle = a === 'TOMMY WASTE' ? '#15803D' : '#1E3A8A'; ctx.fillRect(x + 44, base - 246, 192, 88);
  ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 12px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText(a, x + 140, base - 210); ctx.font = 'bold 8px "Press Start 2P"'; ctx.fillText(b, x + 140, base - 186); ctx.textAlign = 'left';
};

// ---------------------------------------------------------------------------
// The road's junk
// ---------------------------------------------------------------------------

export const drawJunk = (ctx: Ctx, state: GameState, b: BikeRun) => {
  COURSE.junk.forEach((j, i) => {
    if (j.x < state.camera.x - 200 || j.x > state.camera.x + CANVAS_WIDTH + 200) return;
    // (the ones that broke are gone: bits of them scattered)
    const smashed = b.done.has(i) && j.look !== 'ramp' && j.look !== 'hydrant' && j.look !== 'pothole' && j.look !== 'car';
    const box = junkBox(state, j);
    if (smashed || b.done.has(i)) { if (smashed) { ctx.fillStyle = 'rgba(68, 64, 60, 0.6)'; ctx.fillRect(box.x + 10, box.y + box.h - 3, box.w - 20, 3); return; } }
    const live = !b.done.has(i);
    const ahead = j.x - (state.player.pos.x + state.player.width / 2);
    // A warning glow on the road under it
    if (live && j.look !== 'cones' && j.look !== 'ramp') {
      const gg = ctx.createRadialGradient(j.x, box.y + box.h, 4, j.x, box.y + box.h, box.w * 0.9 + 20);
      gg.addColorStop(0, 'rgba(250, 204, 21, 0.45)'); gg.addColorStop(1, 'rgba(250, 204, 21, 0)');
      ctx.fillStyle = gg; ctx.beginPath(); ctx.ellipse(j.x, box.y + box.h, box.w * 0.9 + 20, 14, 0, 0, Math.PI * 2); ctx.fill();
    }
    drawOneJunk(ctx, state, j, box);
    // The hazard sign over it, bobbing, while it's coming up ahead of him
    if (live && ahead > 0 && ahead < 700 && j.look !== 'cones') {
      const sy = box.y - 40 + Math.sin(state.frame * 0.2) * 5;
      const good = j.look === 'ramp';
      ctx.fillStyle = good ? '#22C55E' : '#FACC15'; ctx.strokeStyle = '#111827'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(j.x, sy - 32); ctx.lineTo(j.x + 20, sy); ctx.lineTo(j.x - 20, sy); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#111827'; ctx.font = 'bold 16px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText(good ? '^' : '!', j.x + 1, sy - 4); ctx.textAlign = 'left';
    }
  });
};

const drawOneJunk = (ctx: Ctx, state: GameState, j: RoadJunk, box: { x: number; y: number; w: number; h: number }) => {
  const g = box.y + box.h;
  const f = state.frame;
  switch (j.look) {
    case 'cones':
      for (let c = 0; c < 3; c++) { const cx = box.x + 12 + c * 28; ctx.fillStyle = '#F97316'; ctx.beginPath(); ctx.moveTo(cx - 9, g); ctx.lineTo(cx, g - 26); ctx.lineTo(cx + 9, g); ctx.fill(); ctx.fillStyle = '#F8FAFC'; ctx.fillRect(cx - 5, g - 14, 10, 3); }
      break;
    case 'trash':
      for (const c of [0, 1]) { const cx = box.x + 4 + c * 26; ctx.fillStyle = '#111827'; ctx.fillRect(cx - 2, g - 42, 26, 42); ctx.fillStyle = '#16A34A'; ctx.fillRect(cx, g - 38, 22, 38); ctx.fillStyle = '#22C55E'; ctx.fillRect(cx - 2, g - 43, 26, 5); ctx.fillStyle = 'rgba(0,0,0,0.3)'; for (let r = 0; r < 3; r++) ctx.fillRect(cx + 4 + r * 6, g - 34, 2, 30); }
      ctx.fillStyle = '#65A30D'; ctx.fillRect(box.x + 8, g - 44, 10, 4);
      break;
    case 'pothole':
      // (ringed in orange spray paint: somebody tried)
      ctx.strokeStyle = '#F97316'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(j.x, g - 3, 42, 10, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#0A0A0A'; ctx.beginPath(); ctx.ellipse(j.x, g - 3, 34, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(120, 113, 108, 0.7)'; ctx.fillRect(j.x - 30, g - 8, 6, 3); ctx.fillRect(j.x + 20, g - 9, 8, 3);
      ctx.fillStyle = 'rgba(101, 163, 13, 0.6)'; ctx.beginPath(); ctx.ellipse(j.x, g - 2, 20, 3, 0, 0, Math.PI * 2); ctx.fill(); // (full of the water)
      break;
    case 'glass':
      for (let s = 0; s < 20; s++) { ctx.fillStyle = s % 3 ? '#BAE6FD' : '#4ADE80'; ctx.beginPath(); const gx = box.x + hash(j.x + s) * box.w, gy = g - 2 - hash(s * 7) * 5; ctx.moveTo(gx, gy); ctx.lineTo(gx + 4, gy - 5); ctx.lineTo(gx + 7, gy); ctx.fill(); }
      for (let s = 0; s < 3; s++) if ((f + s * 13) % 30 < 12) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(box.x + 12 + s * 26, g - 9, 2, 6); ctx.fillRect(box.x + 10 + s * 26, g - 7, 6, 2); }
      break;
    case 'car': {
      // A burned-out car, left on its rims (drawn to its box: squat and wide)
      ctx.save(); ctx.translate(box.x, g); ctx.scale(box.w / 140, box.h / 50); ctx.translate(-box.x, -g);
      ctx.fillStyle = '#9A3412'; ctx.beginPath(); ctx.moveTo(box.x, g - 10); ctx.lineTo(box.x + 4, g - 30); ctx.lineTo(box.x + 34, g - 32); ctx.lineTo(box.x + 48, g - 50); ctx.lineTo(box.x + 104, g - 50); ctx.lineTo(box.x + 118, g - 32); ctx.lineTo(box.x + 138, g - 30); ctx.lineTo(box.x + 140, g - 10); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#292524'; ctx.fillRect(box.x + 52, g - 46, 22, 14); ctx.fillRect(box.x + 78, g - 46, 22, 14);
      ctx.fillStyle = '#7C2D12'; ctx.fillRect(box.x + 10, g - 26, 20, 8); ctx.fillRect(box.x + 110, g - 24, 18, 6); // rust
      ctx.fillStyle = '#1C1917'; for (const wx of [26, 114]) { ctx.beginPath(); ctx.arc(box.x + wx, g - 8, 8, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 5px "Press Start 2P"'; ctx.fillText('NO PARTS', box.x + 40, g - 18);
      ctx.restore();
      break;
    }
    case 'hydrant': {
      ctx.fillStyle = '#DC2626'; ctx.fillRect(j.x - 8, g - 30, 16, 30); ctx.fillRect(j.x - 11, g - 20, 22, 6); ctx.beginPath(); ctx.arc(j.x, g - 30, 8, Math.PI, 0); ctx.fill();
      if (geyserOn(j, f)) {
        // The geyser: brown-green water, straight up
        const hgt = 200 + Math.sin(f * 0.5) * 12;
        const gg = ctx.createLinearGradient(0, g - 30 - hgt, 0, g - 30);
        gg.addColorStop(0, 'rgba(163, 190, 120, 0.15)'); gg.addColorStop(1, 'rgba(120, 140, 70, 0.85)');
        ctx.fillStyle = gg; ctx.fillRect(j.x - 10, g - 30 - hgt, 20, hgt);
        ctx.fillStyle = 'rgba(217, 249, 157, 0.7)'; for (let s = 0; s < 6; s++) ctx.fillRect(j.x - 14 + ((f * 5 + s * 9) % 28), g - 30 - hgt + ((f * 7 + s * 31) % hgt), 3, 8);
      } else if ((f + Math.abs(j.x)) % 150 > 120) {
        ctx.fillStyle = 'rgba(120, 140, 70, 0.7)'; ctx.fillRect(j.x - 3, g - 40, 6, 8); // (about to go)
      }
      break;
    }
    case 'ramp': {
      // A plywood kicker on cinder blocks, painted in yellow and black, a big arrow on a board saying what it's for
      ctx.fillStyle = '#78716C'; ctx.fillRect(box.x + box.w - 36, g - 36, 32, 36); ctx.fillStyle = '#57534E'; ctx.fillRect(box.x + box.w - 36, g - 20, 32, 2);
      ctx.save(); ctx.beginPath(); ctx.moveTo(box.x, g); ctx.lineTo(box.x + box.w, g - 40); ctx.lineTo(box.x + box.w, g - 32); ctx.lineTo(box.x + 8, g); ctx.closePath(); ctx.clip();
      ctx.fillStyle = '#FACC15'; ctx.fillRect(box.x, g - 42, box.w, 42);
      ctx.fillStyle = '#111827'; for (let s = -40; s < box.w; s += 20) { ctx.beginPath(); ctx.moveTo(box.x + s, g); ctx.lineTo(box.x + s + 10, g); ctx.lineTo(box.x + s + 50, g - 42); ctx.lineTo(box.x + s + 40, g - 42); ctx.fill(); }
      ctx.restore();
      ctx.strokeStyle = '#111827'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(box.x, g); ctx.lineTo(box.x + box.w, g - 40); ctx.stroke();
      // (the sign, on a post just before it)
      const sx = box.x - 40;
      ctx.fillStyle = '#44403C'; ctx.fillRect(sx - 2, g - 70, 4, 70);
      ctx.fillStyle = f % 20 < 10 ? '#22C55E' : '#4ADE80'; ctx.fillRect(sx - 30, g - 96, 60, 28); ctx.strokeStyle = '#111827'; ctx.strokeRect(sx - 30, g - 96, 60, 28);
      ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.moveTo(sx - 20, g - 76); ctx.lineTo(sx + 12, g - 90); ctx.lineTo(sx + 8, g - 94); ctx.lineTo(sx + 22, g - 92); ctx.lineTo(sx + 16, g - 80); ctx.lineTo(sx + 14, g - 86); ctx.lineTo(sx - 18, g - 72); ctx.fill();
      break;
    }
    case 'barrier':
      ctx.fillStyle = '#78350F'; ctx.fillRect(box.x + 6, g - 30, 4, 30); ctx.fillRect(box.x + box.w - 10, g - 30, 4, 30);
      ctx.fillStyle = '#F8FAFC'; ctx.fillRect(box.x, g - 44, box.w, 14);
      ctx.fillStyle = '#F97316'; for (let s = 0; s < box.w; s += 14) ctx.fillRect(box.x + s, g - 44, 7, 14);
      ctx.fillStyle = '#111827'; ctx.font = 'bold 5px "Press Start 2P"'; ctx.fillText('ROAD CLOSED', box.x + 2, g - 48);
      break;
  }
};

// ---------------------------------------------------------------------------
// The bike, and the people in the scenes
// ---------------------------------------------------------------------------

/** A BMX (Tayvon's: candy red, pegs, a sticker on it), wheels at the feet, turned `tilt`, the cranks at `turn`. */
export const drawBike = (ctx: Ctx, x: number, y: number, tilt: number, turn: number, spin: number) => {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(tilt);
  const R = 11, rear = -20, front = 24;
  const wheel = (wx: number) => {
    ctx.strokeStyle = '#111827'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(wx, -R, R, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#9CA3AF'; ctx.lineWidth = 1;
    for (let k = 0; k < 4; k++) { const a = spin + k * Math.PI / 4; ctx.beginPath(); ctx.moveTo(wx - Math.cos(a) * (R - 2), -R - Math.sin(a) * (R - 2)); ctx.lineTo(wx + Math.cos(a) * (R - 2), -R + Math.sin(a) * (R - 2)); ctx.stroke(); }
  };
  wheel(rear); wheel(front);
  // The frame: rear hub to cranks to seat to head tube to front hub
  ctx.strokeStyle = '#DC2626'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(rear, -R); ctx.lineTo(CRANK.x, CRANK.y); ctx.lineTo(-4, -24); ctx.lineTo(rear, -R);
  ctx.moveTo(CRANK.x, CRANK.y); ctx.lineTo(16, -30); ctx.lineTo(-4, -24); ctx.moveTo(16, -30); ctx.lineTo(front, -R); ctx.stroke();
  // Seat, bars, pegs, a sticker
  ctx.fillStyle = '#111827'; ctx.fillRect(-10, -27, 14, 4);
  ctx.strokeStyle = '#6B7280'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(16, -30); ctx.lineTo(14, -40); ctx.lineTo(22, -41); ctx.stroke();
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(rear - 4, -R - 2, 8, 3);
  ctx.fillStyle = '#FDE047'; ctx.fillRect(4, -22, 5, 3);
  // The cranks
  ctx.strokeStyle = '#374151'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(CRANK.x + Math.cos(turn) * CRANK.r, CRANK.y + Math.sin(turn) * CRANK.r); ctx.lineTo(CRANK.x - Math.cos(turn) * CRANK.r, CRANK.y - Math.sin(turn) * CRANK.r); ctx.stroke();
  ctx.restore();
};

/** The bike under him while he's riding it (tipped with the road, or with his wheelie, hop or slam). */
export const drawRiddenBike = (ctx: Ctx, state: GameState) => {
  const p = state.player;
  if (!p.bike || p.hidden || state.deathTimer > 0) return;
  const x = p.pos.x + p.width / 2, y = p.pos.y + p.height;
  const tilt = p.isCharging ? -0.42 : p.isDivekicking ? 0.5 : p.isUppercutting ? -0.3 : 0;
  drawBike(ctx, x, y, tilt, p.pos.x / 14, p.pos.x / 11);
};

/** A kid on the corner (the crew), leaning, talking with his hands. */
const drawCrewMember = (ctx: Ctx, x: number, y: number, f: number, shirt: string, skin: string, facing: number) => {
  ctx.save(); ctx.translate(x, y); ctx.scale(facing, 1);
  const talk = Math.sin(f * 0.2) * 3;
  ctx.fillStyle = '#1E3A8A'; ctx.fillRect(-8, -28, 7, 23); ctx.fillRect(2, -28, 7, 23);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-9, -5, 10, 5); ctx.fillRect(1, -5, 10, 5);
  ctx.fillStyle = shirt; ctx.fillRect(-12, -54, 24, 28);
  ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(1, -61, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111827'; ctx.fillRect(-7, -70, 16, 5); ctx.fillRect(4, -63, 2, 2);
  ctx.fillStyle = skin; ctx.fillRect(9, -48 + talk, 12, 5);
  ctx.restore();
};

/** The corner: the crew hanging out, the kid on his bike (then off it, flying, sprawled on the sidewalk). */
export const drawCorner = (ctx: Ctx, state: GameState, rt: TommyRuntime) => {
  const b = rt.bike;
  const H = COURSE.hood;
  if (state.camera.x > H.x2 + 200) return;
  const f = state.frame;
  if (b.crew) {
    drawCrewMember(ctx, H.corner - 30, GROUND_Y, f, '#DC2626', '#8D5524', 1);
    drawCrewMember(ctx, H.corner + 20, GROUND_Y, f + 20, '#F8FAFC', '#5C3A21', -1);
    drawCrewMember(ctx, H.corner + 60, GROUND_Y, f + 40, '#1D4ED8', '#C68642', -1);
  }
  const r = b.rider;
  // The bike, before he's taken it
  if (b.phase === 'waiting' || (b.phase === 'theft' && !state.player.bike)) drawBike(ctx, H.bike, GROUND_Y, 0, 0, 0);
  // The kid
  ctx.save(); ctx.translate(r.x, r.y); ctx.rotate(r.rot);
  if (r.state === 'sitting') { ctx.translate(0, -12); }
  drawCrewMember(ctx, 0, 0, f, '#FACC15', '#8D5524', r.state === 'sitting' ? -1 : 1);
  ctx.restore();
};

/** The man in the hazmat suit at the end of the road, the bottle, the trap it makes; the wipeout. */
export const drawRoadEnd = (ctx: Ctx, state: GameState, rt: TommyRuntime) => {
  const b = rt.bike;
  const R = COURSE.road;
  if (state.camera.x + CANVAS_WIDTH < R.hazmat - 900 || state.camera.x > R.x2) return;
  const f = state.frame;
  // The open manhole, its cover leaned against the curb
  ctx.fillStyle = '#0C0A09'; ctx.beginPath(); ctx.ellipse(R.manhole, GROUND_Y + 2, 34, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#44403C'; ctx.beginPath(); ctx.ellipse(R.manhole + 60, GROUND_Y - 22, 8, 22, 0, 0, Math.PI * 2); ctx.fill();
  // Him: yellow suit, gas mask, the bottle held up (the label: FLINT WATER SUPPLY)
  const hx = R.hazmat;
  ctx.save(); ctx.translate(hx, GROUND_Y); ctx.scale(-1, 1);
  ctx.fillStyle = '#EAB308'; ctx.fillRect(-9, -28, 8, 23); ctx.fillRect(2, -28, 8, 23);
  ctx.fillStyle = '#1C1917'; ctx.fillRect(-10, -5, 11, 5); ctx.fillRect(1, -5, 11, 5);
  ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.roundRect(-13, -58, 26, 32, 4); ctx.fill();
  ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.arc(1, -66, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1F2937'; ctx.fillRect(1, -70, 11, 6); ctx.fillStyle = '#374151'; ctx.beginPath(); ctx.arc(10, -60, 4.5, 0, Math.PI * 2); ctx.fill();
  const holding = b.bottle.state === 'held';
  ctx.fillStyle = '#FACC15'; ctx.fillRect(8, holding ? -76 : -50, 7, holding ? 26 : 12);
  ctx.restore();
  if (holding) drawBottle(ctx, hx - 16, GROUND_Y - 84, 0, 1.6);
  else if (b.bottle.state === 'thrown') drawBottle(ctx, b.bottle.x, b.bottle.y, f * 0.3);
  if (b.bottle.state === 'trap') {
    // The trap: a spreading, smoking, bubbling pool of it eating into the asphalt
    const x = b.bottle.x;
    ctx.fillStyle = 'rgba(132, 204, 22, 0.85)'; ctx.beginPath(); ctx.ellipse(x, GROUND_Y - 1, 46, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(217, 249, 157, 0.8)';
    for (let k = 0; k < 5; k++) { const bx = x - 36 + ((f * 3 + k * 17) % 72); ctx.beginPath(); ctx.arc(bx, GROUND_Y - 3 - (f + k * 9) % 6, 2 + (k % 2), 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = 'rgba(163, 190, 120, 0.3)'; for (let k = 0; k < 3; k++) { const t = ((f * 0.8 + k * 30) % 90) / 90; ctx.beginPath(); ctx.arc(x - 10 + k * 10, GROUND_Y - 10 - t * 60, 6 + t * 10, 0, Math.PI * 2); ctx.fill(); }
  }
  // The wipeout: the bike cartwheeling (tires melted to nothing), him end over end (drawn by the stage, see drawTommyMid)
  if (b.phase === 'wipeout') {
    const w = b.bikeWreck;
    drawBike(ctx, w.x, w.y + 14, w.rot, 0, 0);
  }
};

/** A bottle of the town's water: cloudy, a bit brown, the label. */
export const drawBottle = (ctx: Ctx, x: number, y: number, rot: number, s = 1) => {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(190, 200, 140, 0.85)'; ctx.beginPath(); ctx.roundRect(-5, -12, 10, 22, 2); ctx.fill();
  ctx.fillStyle = 'rgba(120, 130, 60, 0.9)'; ctx.fillRect(-5, 0, 10, 10); // (settled at the bottom)
  ctx.fillStyle = '#1D4ED8'; ctx.fillRect(-3, -17, 6, 5);
  // The label: three lines, each held inside it
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-5, -8, 10, 10);
  ctx.fillStyle = '#1D4ED8'; ctx.fillRect(-5, -8, 10, 1); ctx.fillRect(-5, 1, 10, 1);
  ctx.font = 'bold 1.5px "Press Start 2P"'; ctx.textAlign = 'center';
  ctx.fillText('FLINT', 0, -4.8, 9); ctx.fillText('WATER', 0, -2.4, 9); ctx.fillText('SUPPLY', 0, 0, 9);
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(-4, -11, 2, 18);
  ctx.restore();
};

/** Him in the air, end over end, down into the manhole. */
export const drawTumble = (ctx: Ctx, state: GameState, rt: TommyRuntime, drawBody: (x: number, y: number, rot: number) => void) => {
  const b = rt.bike;
  if (b.phase !== 'wipeout') return;
  const f = b.fly;
  // (into the hole: under the lip of it he's gone)
  if (f.y > GROUND_Y + 10) return;
  ctx.save();
  ctx.beginPath(); ctx.rect(state.camera.x - 100, state.camera.y - 400, CANVAS_WIDTH + 200, GROUND_Y + 4 - state.camera.y + 400); ctx.clip();
  drawBody(f.x, f.y, f.rot);
  ctx.restore();
};

/**
 * Over every parked car up ahead (the wrecks in the road; the lowriders can't be ramped): a big green RAMP sign with an arrow
 * bouncing on it, like the ramps' own sign: boost into one, or come down on one off a ramp, and it sends him up again.
 * It jumps about harder while he's up in the air off a ramp (somewhere to land).
 */
export const drawCarRampSigns = (ctx: Ctx, state: GameState, b: BikeRun) => {
  const p = state.player;
  if (!p.bike) return;
  const px = p.pos.x + p.width;
  const spots: { x: number; y: number }[] = [];
  COURSE.junk.forEach((j, i) => {
    if (j.look !== 'car' || b.done.has(i) || j.x < px - 20 || j.x > state.camera.x + CANVAS_WIDTH + 60) return;
    spots.push({ x: j.x, y: junkBox(state, j).y });
  });
  const eager = b.rampAir && !p.isGrounded;
  for (const s of spots) {
    const bob = Math.abs(Math.sin(state.frame * (eager ? 0.3 : 0.15) + s.x * 0.01)) * (eager ? 14 : 7);
    const y = s.y - 46 - bob, scale = eager ? 1.15 : 1;
    ctx.save();
    ctx.translate(s.x, y); ctx.scale(scale, scale);
    // The sign
    ctx.fillStyle = '#000'; ctx.fillRect(-35, -17, 70, 26);
    ctx.fillStyle = '#16A34A'; ctx.fillRect(-33, -15, 66, 22);
    ctx.strokeStyle = '#F8FAFC'; ctx.lineWidth = 2; ctx.strokeRect(-30, -12, 60, 16);
    ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 11px "Press Start 2P", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('RAMP', 0, -3);
    // The arrow, up off it
    ctx.fillStyle = '#4ADE80'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -38); ctx.lineTo(13, -22); ctx.lineTo(5, -22); ctx.lineTo(5, -18); ctx.lineTo(-5, -18); ctx.lineTo(-5, -22); ctx.lineTo(-13, -22); ctx.closePath();
    ctx.fill(); ctx.stroke();
    // A little arrow down at the car under it
    ctx.fillStyle = '#FDE047';
    ctx.beginPath(); ctx.moveTo(-6, 11); ctx.lineTo(6, 11); ctx.lineTo(0, 19); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.textBaseline = 'alphabetic';
};
