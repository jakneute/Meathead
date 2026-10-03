// Flint, above ground: the sky going from late afternoon to sunset down the
// road, the town low and flat out to the horizon (houses, trees, a church
// steeple, the old plant's smokestacks), and the water tower standing over it
// all with FLINT on the tank. Up close: the East Side (tired little houses,
// half of them boarded up, chain-link, a liquor store, BOIL WATER signs), the
// road, the junk in it, the bike, the crew on the corner, the
// man in the hazmat suit with his bottle.

import { drawPerson } from '../../render/npc/person';
import { drawHydrant } from '../../render/props/hydrant';
import type { GameState } from '../../core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y } from '../../../constants';
import { groundLineAt } from '../../core/terrain';
import { COURSE, RoadJunk } from './course';
import { TommyRuntime } from './runtime';
import { junkBox, geyserOn, BikeRun } from './bike';
import { CRANK } from '../../render/player/moves';
import { bandedGradient, hazeBands, steppedGlow, checker, pixelBlob, tilePattern } from '../../render/pixelArt';
import { INK, ink, shaded, shadedTop, dark, lite } from '../../render/npc/kit';

type Ctx = CanvasRenderingContext2D;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const mix = (a: string, b: string, k: number) => {
  const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * k)).join(',')})`;
};
/** The same, as a hex colour (for the sky's bands). */
const mixHex = (a: string, b: string, k: number) => {
  const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * k).toString(16).padStart(2, '0')).join('');
};

/** How far down the road the evening's got (0 late afternoon at the corner .. 1 sunset at the end of the road). */
export const eveningAt = (camX: number) => Math.max(0, Math.min(1, (camX - COURSE.hood.x1) / (COURSE.road.x2 - COURSE.hood.x1)));

// ---------------------------------------------------------------------------
// Screen space: the sky, the town far off, the water tower
// ---------------------------------------------------------------------------

export const drawStreetSky = (ctx: Ctx, state: GameState, dusk = -1, tower = true) => {
  const k = dusk >= 0 ? dusk : eveningAt(state.camera.x);
  // (the sky in flat bands, late afternoon blue down to the warm glow at the horizon, dithered one into the next)
  const top = mixHex('#5B8FC7', '#3B2A5C', k), upper = mixHex('#7FAAD6', '#7A3F66', k), mid = mixHex('#9CC3E0', '#C2546A', k);
  const lower = mixHex('#CFD4C8', '#E07A5E', k), low = mixHex('#F6D29A', '#F59E4B', k);
  bandedGradient(ctx, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, [top, upper, mid, lower, low, low], 16);
  // The sun, low and getting lower: a disc, and rings of its light round it
  const sy = 250 + k * 170;
  steppedGlow(ctx, 640, sy, 120, mixHex('#FFE0A8', '#FFB070', k), 0.5, 0, 5);
  ctx.fillStyle = '#FFF4D6'; ctx.beginPath(); ctx.arc(640, sy, 16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(632, sy - 8, 8, 4);
  // Streaks of cloud: lit along their tops, shadowed under, their ends breaking up
  const cLit = mixHex('#FFF4E0', '#FFC8A0', k), cMid = mixHex('#E8E4E0', '#E0907A', k), cDark = mixHex('#B8BCCC', '#9A4E6A', k);
  for (let i = 0; i < 5; i++) {
    const x = Math.round(((i * 211 - state.camera.x * 0.01) % 1000 + 1000) % 1000 - 100), y = 90 + i * 34, w = 160 + (i % 2) * 80;
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = cMid; ctx.fillRect(x + 8, y, w - 16, 4);
    ctx.fillStyle = cLit; ctx.fillRect(x + 20, y - 2, w - 60, 2);
    ctx.fillStyle = cDark; ctx.fillRect(x + 14, y + 4, w - 30, 2);
    checker(ctx, x, y, 8, 4, cMid); checker(ctx, x + w - 8, y, 8, 4, cMid, 1);
    ctx.globalAlpha = 1;
  }
  // The town, far off and low (a slow parallax): roofs, trees, a steeple, the old plant's stacks; lit along the sun's side
  const horizon = 420 - Math.max(-40, Math.min(40, (state.camera.y - (GROUND_Y - 550)) * 0.08));
  const far = mix('#6B6F8A', '#3A2C4A', k), rim = mixHex(mixHex('#6B6F8A', '#3A2C4A', k), low, 0.35);
  const win = k > 0.3 ? mixHex('#FCD34D', '#FDBA74', k) : null;
  const off = state.camera.x * 0.06;
  for (let i = -1; i < 26; i++) {
    const id = i + Math.floor(off / 40);
    const x = Math.round(i * 40 - (off % 40));
    const h = Math.round(14 + hash(id) * 22);
    ctx.fillStyle = far;
    if (hash(id * 3) < 0.5) {
      ctx.beginPath(); ctx.moveTo(x, horizon); ctx.lineTo(x, horizon - h); ctx.lineTo(x + 20, horizon - h - 10); ctx.lineTo(x + 40, horizon - h); ctx.lineTo(x + 40, horizon); ctx.fill();
      ctx.strokeStyle = rim; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 20, horizon - h - 9); ctx.lineTo(x + 39, horizon - h); ctx.stroke();
      if (win && hash(id * 13) < 0.5) { ctx.fillStyle = win; ctx.fillRect(x + 10 + Math.round(hash(id * 17) * 16), horizon - h + 6, 2, 2); }
    } else {
      const r = 16 + hash(id * 5) * 8;
      ctx.beginPath(); ctx.arc(x + 20, horizon - h * 0.7, r, Math.PI, 0); ctx.fill(); ctx.fillRect(x + 4, horizon - h * 0.7, 32, h * 0.7);
      ctx.strokeStyle = rim; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x + 20, horizon - h * 0.7, r - 1, -Math.PI * 0.45, -0.1); ctx.stroke();
      checker(ctx, x + 6, horizon - h * 0.7 - r * 0.6, 28, 4, rim);
    }
    ctx.fillStyle = far;
    if (hash(id * 7) < 0.06) { ctx.fillRect(x + 10, horizon - h - 50, 6, 50); ctx.beginPath(); ctx.moveTo(x + 7, horizon - h - 50); ctx.lineTo(x + 13, horizon - h - 70); ctx.lineTo(x + 19, horizon - h - 50); ctx.fill(); ctx.fillStyle = rim; ctx.fillRect(x + 14, horizon - h - 50, 2, 50); }
    if (hash(id * 11) < 0.05) {
      for (const sx of [0, 14]) {
        ctx.fillStyle = far; ctx.fillRect(x + sx, horizon - h - 90, 9, 90);
        ctx.fillStyle = rim; ctx.fillRect(x + sx + 7, horizon - h - 90, 2, 90); ctx.fillRect(x + sx, horizon - h - 84, 9, 2); // (a band round the top)
        pixelBlob(ctx, x + sx + 4, horizon - h - 104, 10, 9, 'rgba(120, 113, 108, 0.35)');
      }
    }
  }
  ctx.fillStyle = far; ctx.fillRect(0, horizon, CANVAS_WIDTH, CANVAS_HEIGHT - horizon);
  // (the air over the town: it fades into the glow at the horizon, the rooftops last)
  hazeBands(ctx, 0, horizon - 80, CANVAS_WIDTH, 100, low, 0, 0.5, 6);
  // The water tower over it all
  const tx = 620 - (state.camera.x - COURSE.hood.x1) * 0.018;
  if (tower && tx > -120 && tx < CANVAS_WIDTH + 120) drawWaterTower(ctx, tx, horizon, 1, k);
};

/**
 * The water tower: four legs and bracing, a round tank (lit down its left in steps, riveted, a catwalk round its belly)
 * with a pointed roof, FLINT on it. (x the middle, y its feet.)
 */
export const drawWaterTower = (ctx: Ctx, x: number, y: number, s: number, dusk: number, tilt = 0, hole = false) => {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(tilt); ctx.scale(s, s);
  const metal = mixHex('#8E9AAB', '#5A5068', dusk), dk = mixHex('#5E6878', '#3A3046', dusk), ink_ = mixHex('#2E3440', '#1E1828', dusk);
  const lit = mixHex(metal, '#FFF4D6', 0.3), shade = mixHex(metal, dk, 0.55);
  // (the legs and bracing: an ink edge, the steel, its lit side)
  for (const [lw, c] of [[6, ink_], [4, dk]] as const) {
    ctx.strokeStyle = c; ctx.lineWidth = lw;
    for (const lx of [-34, -12, 12, 34]) { ctx.beginPath(); ctx.moveTo(lx * 1.3, 0); ctx.lineTo(lx, -150); ctx.stroke(); }
    ctx.lineWidth = lw - 2;
    for (const yy of [-40, -90, -135]) { ctx.beginPath(); ctx.moveTo(-40, yy); ctx.lineTo(40, yy); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-44, -2); ctx.lineTo(34, -90); ctx.moveTo(44, -2); ctx.lineTo(-34, -90); ctx.stroke();
  }
  ctx.strokeStyle = metal; ctx.lineWidth = 1;
  for (const lx of [-34, -12, 12, 34]) { ctx.beginPath(); ctx.moveTo(lx * 1.3 - 1, 0); ctx.lineTo(lx - 1, -150); ctx.stroke(); }
  // (the riser pipe up the middle)
  ctx.fillStyle = ink_; ctx.fillRect(-4, -150, 8, 150); ctx.fillStyle = shade; ctx.fillRect(-3, -150, 6, 150); ctx.fillStyle = metal; ctx.fillRect(-3, -150, 2, 150);
  // The tank: in vertical steps, lit on the left, shadowed on the right, dithered between
  const tank = () => ctx.roundRect(-58, -230, 116, 84, 10);
  ctx.save(); ctx.beginPath(); tank(); ctx.clip();
  ctx.fillStyle = metal; ctx.fillRect(-58, -230, 116, 84);
  ctx.fillStyle = lit; ctx.fillRect(-58, -230, 30, 84);
  checker(ctx, -28, -230, 4, 84, lit);
  ctx.fillStyle = shade; ctx.fillRect(18, -230, 40, 84);
  checker(ctx, 14, -230, 4, 84, shade);
  ctx.fillStyle = dk; ctx.fillRect(40, -230, 18, 84);
  checker(ctx, 36, -230, 4, 84, dk);
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(-50, -224, 6, 72); // (the shine)
  // (seams and rivets)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'; ctx.fillRect(-58, -204, 116, 1); ctx.fillRect(-58, -174, 116, 1);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'; for (let rx = -54; rx < 56; rx += 8) { ctx.fillRect(rx, -207, 1, 1); ctx.fillRect(rx, -177, 1, 1); }
  // (rust weeping down from the seams)
  ctx.fillStyle = 'rgba(146, 64, 14, 0.3)'; for (let i = 0; i < 6; i++) ctx.fillRect(-46 + i * 19, -203, 2, 6 + (i * 7) % 14);
  ctx.restore();
  ctx.beginPath(); tank(); ctx.strokeStyle = ink_; ctx.lineWidth = 2; ctx.stroke();
  // (the catwalk round its belly, its rail)
  ctx.fillStyle = ink_; ctx.fillRect(-62, -157, 124, 12);
  ctx.fillStyle = dk; ctx.fillRect(-61, -156, 122, 10);
  ctx.fillStyle = metal; ctx.fillRect(-61, -156, 122, 2);
  ctx.fillStyle = ink_; for (let rx = -60; rx <= 60; rx += 12) ctx.fillRect(rx, -168, 1.5, 12);
  ctx.fillRect(-62, -168, 124, 1.5);
  // The roof: a cone, lit down the sun's side, a finial on top
  ctx.beginPath(); ctx.moveTo(-62, -228); ctx.lineTo(0, -270); ctx.lineTo(62, -228); ctx.closePath();
  ctx.fillStyle = metal; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.fillStyle = lit; ctx.beginPath(); ctx.moveTo(-62, -228); ctx.lineTo(0, -270); ctx.lineTo(-18, -228); ctx.closePath(); ctx.fill();
  ctx.fillStyle = shade; ctx.beginPath(); ctx.moveTo(62, -228); ctx.lineTo(0, -270); ctx.lineTo(26, -228); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(-62, -234, 124, 2);
  ctx.restore();
  ctx.beginPath(); ctx.moveTo(-62, -228); ctx.lineTo(0, -270); ctx.lineTo(62, -228); ctx.closePath(); ctx.strokeStyle = ink_; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = ink_; ctx.fillRect(-3, -284, 6, 16); ctx.fillStyle = dk; ctx.fillRect(-2, -282, 4, 14); ctx.fillStyle = metal; ctx.fillRect(-2, -282, 1, 14);
  ctx.fillStyle = mix('#1E3A8A', '#1E1B4B', dusk); ctx.font = 'bold 18px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('FLINT', 0, -180, 100); ctx.textAlign = 'left'; // (fitted inside the tank's sides, with room either side)
  if (hole) {
    ctx.fillStyle = ink_; ctx.beginPath(); ctx.ellipse(-20, -196, 14, 11, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1C1917'; ctx.beginPath(); ctx.ellipse(-20, -196, 12, 9, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = lit; for (let i = 0; i < 6; i++) { const a = i * 1.05; ctx.fillRect(-20 + Math.cos(a) * 13 - 1, -196 + Math.sin(a) * 10 - 1, 3, 2); } // (the metal peeled back round it)
  }
  ctx.restore();
};

// ---------------------------------------------------------------------------
// The street: the ground, and the East Side along it
// ---------------------------------------------------------------------------

/** The street under him: asphalt (grit in it), a curb and a strip of sidewalk in slabs, the center line worn away in patches. */
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
    // (the asphalt: grit dithered through it, darker in the gutter and lighter out in the lane, tar patches)
    const s0 = Math.max(0, Math.floor((x0 - r.x1) / 4) * 4), s1 = Math.min(len, x1 - r.x1);
    if (s1 > s0) {
      checker(ctx, s0, 13, s1 - s0, CANVAS_HEIGHT, 'rgba(0, 0, 0, 0.1)');
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)'; ctx.fillRect(s0, 13, s1 - s0, 6);
      checker(ctx, s0, 19, s1 - s0, 4, 'rgba(0, 0, 0, 0.18)', 1);
      ctx.fillStyle = 'rgba(161, 161, 170, 0.35)';
      for (let s = Math.floor(s0 / 7) * 7; s < s1; s += 7) { const h = hash(r.x1 + s); ctx.fillRect(s + h * 5, 22 + hash(s * 3 + r.x1) * 120, 1, 1); if (h > 0.7) ctx.fillRect(s + 3, 40 + h * 80, 2, 1); }
      for (let s = Math.floor(s0 / 230) * 230; s < s1; s += 230) if (hash(r.x1 + s * 5) > 0.5) { ctx.fillStyle = '#34343A'; ctx.fillRect(s + 40, 44 + hash(s) * 30, 60 + hash(s * 2) * 40, 12); ctx.fillStyle = '#4A4A52'; ctx.fillRect(s + 40, 44 + hash(s) * 30, 60 + hash(s * 2) * 40, 1); }
    }
    // (the sidewalk: slabs, lit along the top, the joints; the curb's face under it; the gutter)
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(0, -2, len + 1, 8);
    ctx.fillStyle = '#C8C3BE'; ctx.fillRect(0, -2, len + 1, 2);
    ctx.fillStyle = '#8C8681'; ctx.fillRect(0, 4, len + 1, 2);
    ctx.fillStyle = '#6E6863'; for (let s = Math.max(0, Math.floor(s0 / 48) * 48); s < s1; s += 48) { ctx.fillRect(s, -2, 1, 8); if (hash(r.x1 + s) > 0.8) { ctx.fillRect(s + 12, 0, 6, 1); ctx.fillRect(s + 18, 1, 4, 1); } }
    ctx.fillStyle = '#78716C'; ctx.fillRect(0, 6, len + 1, 3);
    ctx.fillStyle = '#57534E'; ctx.fillRect(0, 8, len + 1, 1);
    ctx.fillStyle = '#52525B'; ctx.fillRect(0, 9, len + 1, 4);
    ctx.fillStyle = '#1C1917'; ctx.fillRect(0, 9, len + 1, 1);
    // (the line and the cracks only where they're on screen: the rest of the run's left alone)
    const v0 = Math.max(0, s0 - 120), v1 = Math.min(len, s1 + 120);
    for (let s = Math.floor(v0 / 50) * 50; s < v1; s += 50) if (hash(r.x1 + s) > 0.3) { ctx.fillStyle = '#FDE68A'; ctx.fillRect(s, 34, 26, 3); ctx.fillStyle = '#B5A060'; ctx.fillRect(s + 18 + hash(s) * 6, 34, 3, 3); }
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; for (let s = 10 + Math.max(0, Math.floor((v0 - 10) / 37)) * 37; s < v1; s += 37) { const cy = 14 + hash(r.x1 + s) * 40, cw = 12 + hash(s) * 10; ctx.fillRect(s, cy, cw, 1); ctx.fillRect(s + cw, cy + 1, 4, 1); } // cracks
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
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; for (let yy = base + 9; yy < Math.max(gL, gR); yy += 10) ctx.fillRect(x - 20, yy, 320, 1);
    ctx.fillStyle = '#57534E'; ctx.fillRect(x - 20, base - 2, 320, 4);
    ctx.fillStyle = '#78716C'; ctx.fillRect(x - 20, base - 2, 320, 1);
    const h = hash(k * 7.3);
    if (h < 0.1) drawLiquor(ctx, x, base, dusk);
    else if (h < 0.16) drawChurch(ctx, x, base, dusk);
    else if (h < 0.24) drawEmptyLot(ctx, x, base, k);
    else if (h < 0.28) drawBillboard(ctx, x, base, k);
    else drawHouse(ctx, x, base, k, dusk);
    // Power poles (creosoted, a crossarm, glass insulators, a transformer on some), wires sagging between them
    if (k % 2 === 0) {
      shaded(ctx, () => ctx.rect(x + 250, base - 190, 5, 190), '#4A3F36', x + 250, base - 190, 5, 190, 1);
      shadedTop(ctx, () => ctx.rect(x + 236, base - 184, 33, 4), '#57493D', x + 236, base - 184, 33, 4, 1);
      ctx.fillStyle = '#6EA6A0'; for (const ix of [x + 238, x + 251, x + 264]) { ctx.fillRect(ix, base - 188, 3, 4); ctx.fillStyle = '#B9E0DA'; ctx.fillRect(ix, base - 188, 1, 2); ctx.fillStyle = '#6EA6A0'; }
      ctx.fillStyle = '#2A221C'; for (let yy = base - 170; yy < base - 10; yy += 26) ctx.fillRect(x + 252, yy, 1, 1); // (the staples, the old flyers' nails)
      if (hash(k * 23) < 0.4) { shaded(ctx, () => ctx.roundRect(x + 255, base - 170, 10, 18, 2), '#71717A', x + 255, base - 170, 10, 18, 1); ctx.fillStyle = '#A1A1AA'; ctx.fillRect(x + 256, base - 166, 8, 1); }
      ctx.strokeStyle = 'rgba(28, 25, 23, 0.85)'; ctx.lineWidth = 1;
      const nx = x + 250 + LOT * 2, ng = groundLineAt(state.groundRuns, nx) - 6;
      ctx.beginPath(); ctx.moveTo(x + 250, base - 182); ctx.quadraticCurveTo(x + 250 + LOT, (base + ng) / 2 - 150, nx, ng - 182); ctx.stroke();
    }
  }
};

const HOUSE_PAINT = ['#8FA3A8', '#B9A38B', '#9E6B5C', '#6E8B74', '#C8B88A', '#7E7F9A'];

/** A window: trim round it, a sill, the sash across; lit (warm, a shade half down), dark (a glint), or boarded (plywood, nails). */
const houseWindow = (ctx: Ctx, wx: number, wy: number, w: number, h: number, state: 'lit' | 'dark' | 'burned', boards: boolean) => {
  ink(ctx, () => ctx.rect(wx - 3, wy - 3, w + 6, h + 6), state === 'burned' ? '#292524' : '#E7E5E4', 1);
  ctx.fillStyle = state === 'burned' ? '#1C1917' : '#A8A29E'; ctx.fillRect(wx - 3, wy + h, w + 6, 3);
  if (state === 'lit') {
    ctx.fillStyle = '#FCD34D'; ctx.fillRect(wx, wy, w, h);
    ctx.fillStyle = '#FEF3C7'; ctx.fillRect(wx + 2, wy + h * 0.45, 6, 4);
    ctx.fillStyle = '#E8A93A'; ctx.fillRect(wx, wy, w, Math.round(h * 0.35)); // (the blind, half down)
    checker(ctx, wx, wy + Math.round(h * 0.35), w, 2, '#E8A93A');
  } else {
    ctx.fillStyle = state === 'burned' ? '#0C0A09' : '#1F2937'; ctx.fillRect(wx, wy, w, h);
    if (state === 'dark') { ctx.fillStyle = '#334155'; ctx.fillRect(wx, wy, w, 4); ctx.fillStyle = 'rgba(255, 255, 255, 0.22)'; ctx.fillRect(wx + 4, wy + 6, 2, h - 12); ctx.fillRect(wx + 8, wy + 6, 1, 8); }
  }
  if (state !== 'burned') { ctx.fillStyle = '#D6D3D1'; ctx.fillRect(wx, wy + Math.round(h / 2) - 1, w, 2); }
  if (boards) {
    for (const by of [8, 20]) {
      ink(ctx, () => ctx.rect(wx - 3, wy + by, w + 6, 6), '#A16207', 1);
      ctx.fillStyle = '#CA8A04'; ctx.fillRect(wx - 2, wy + by, w + 4, 1);
      ctx.fillStyle = '#78350F'; ctx.fillRect(wx + 4, wy + by + 3, 8, 1); ctx.fillRect(wx - 1, wy + by + 2, 1, 1); ctx.fillRect(wx + w + 1, wy + by + 2, 1, 1);
    }
  }
};

/** A little two-story frame house: peeling paint, a porch, a sagging roof; boarded up or burned out, some of them. */
const drawHouse = (ctx: Ctx, x: number, base: number, k: number, dusk: number) => {
  const paint = HOUSE_PAINT[Math.floor(hash(k) * HOUSE_PAINT.length)];
  const burned = hash(k * 3) < 0.15, boarded = hash(k * 5) < 0.4;
  const w = 200, h = 150;
  const wall = burned ? '#3F3A36' : paint;
  ctx.fillStyle = wall; ctx.fillRect(x + 30, base - h, w, h);
  // (the sun's off to the right and low: the right third of it in shade, dithered in, and the eaves' shadow under the roof)
  checker(ctx, x + 30 + Math.round(w * 0.62), base - h, Math.round(w * 0.38), h, 'rgba(0, 0, 0, 0.16)');
  ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(x + 30, base - h, w, 6);
  checker(ctx, x + 30, base - h + 6, w, 4, 'rgba(0, 0, 0, 0.22)', 1);
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let y = base - h + 8; y < base; y += 9) ctx.fillRect(x + 30, y, w, 1); // siding
  ctx.fillStyle = 'rgba(255,255,255,0.07)'; for (let y = base - h + 9; y < base; y += 9) ctx.fillRect(x + 30, y, w, 1);
  // (the paint peeling: patches of the bare grey boards under it)
  if (!burned) for (let i = 0; i < 4; i++) { const px = x + 40 + Math.round(hash(k * 29 + i) * 170), py = base - h + 14 + Math.round(hash(k * 31 + i) * 110); ctx.fillStyle = '#A8A29E'; ctx.fillRect(px, py, 6 + i * 2, 3); ctx.fillStyle = dark(wall, 0.3); ctx.fillRect(px, py + 3, 6 + i * 2, 1); }
  // (corner boards, the foundation's band)
  ctx.fillStyle = burned ? '#292524' : lite(wall, 0.35); ctx.fillRect(x + 30, base - h, 4, h); ctx.fillStyle = dark(wall, 0.3); ctx.fillRect(x + 26 + w, base - h, 4, h);
  ctx.fillStyle = '#57534E'; ctx.fillRect(x + 30, base - 6, w, 6); ctx.fillStyle = '#78716C'; ctx.fillRect(x + 30, base - 6, w, 1);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x + 30.5, base - h + 0.5, w - 1, h - 1);
  // The roof: shingles in rows (each row lit along its bottom edge, the sun side lighter), the fascia, an ink line round
  const peak = base - h - 60 - (hash(k * 9) < 0.3 ? -10 : 0);
  const roof = () => { ctx.moveTo(x + 18, base - h); ctx.lineTo(x + 30 + w / 2, peak); ctx.lineTo(x + 42 + w, base - h); ctx.closePath(); };
  const sh = burned ? '#1C1917' : '#4B3B35';
  ctx.beginPath(); roof(); ctx.fillStyle = sh; ctx.fill();
  ctx.save(); ctx.beginPath(); roof(); ctx.clip();
  for (let ry = base - h - 6, row = 0; ry > peak - 4; ry -= 7, row++) {
    ctx.fillStyle = dark(sh, 0.35); ctx.fillRect(x + 18, ry, w + 24, 1);
    ctx.fillStyle = lite(sh, 0.1); ctx.fillRect(x + 18, ry + 1, w + 24, 1);
    for (let sx = x + 18 + (row % 2) * 6; sx < x + 42 + w; sx += 12) ctx.fillRect(sx, ry + 1, 1, 6);
  }
  ctx.fillStyle = 'rgba(255, 230, 190, 0.12)'; ctx.beginPath(); ctx.moveTo(x + 30 + w / 2, peak); ctx.lineTo(x + 42 + w, base - h); ctx.lineTo(x + 30 + w / 2, base - h); ctx.closePath(); ctx.fill();
  if (!burned && hash(k * 37 + 5) < 0.15) { ctx.fillStyle = '#1E40AF'; ctx.beginPath(); ctx.moveTo(x + 70, base - h); ctx.lineTo(x + 100, base - h - 26); ctx.lineTo(x + 140, base - h - 10); ctx.lineTo(x + 120, base - h); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#3B5FC0'; ctx.fillRect(x + 96, base - h - 22, 10, 1); } // (a blue tarp over the hole in it)
  if (burned) { ctx.fillStyle = '#0C0A09'; ctx.fillRect(x + 90, peak + 20, 40, 30); ctx.fillStyle = '#3F2A1D'; for (let i = 0; i < 5; i++) ctx.fillRect(x + 92 + i * 8, peak + 18, 2, 34); } // (the rafters showing)
  ctx.restore();
  ctx.beginPath(); roof(); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = burned ? '#292524' : '#E7E5E4'; ctx.fillRect(x + 18, base - h - 1, w + 24, 3);
  // Windows: lit (it's getting on), dark, boarded
  for (const [wx, wy] of [[60, -120], [150, -120], [60, -64], [180, -64]]) {
    const lit = !burned && !boarded && hash(k * 13 + wx + wy) < 0.25 + dusk * 0.4;
    houseWindow(ctx, x + wx, base + wy, 30, 34, burned ? 'burned' : lit ? 'lit' : 'dark', boarded && hash(k + wx) < 0.7);
  }
  if (burned) { checker(ctx, x + 40, base - h, 100, 60, 'rgba(0,0,0,0.5)'); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.ellipse(x + 90, base - h + 20, 40, 22, 0, 0, Math.PI * 2); ctx.fill(); }
  // The porch: its deck, steps, two posts, the roof over it, the door (a knob, a mail slot)
  shaded(ctx, () => ctx.rect(x + 110, base - 30, 70, 30), '#57534E', x + 110, base - 30, 70, 30, 1);
  ctx.fillStyle = '#78716C'; ctx.fillRect(x + 111, base - 30, 68, 2);
  ctx.fillStyle = '#44403C'; for (let sy = base - 20; sy < base; sy += 7) ctx.fillRect(x + 134, sy, 22, 1);
  ink(ctx, () => ctx.rect(x + 130, base - 60, 24, 30), '#1F2937', 1);
  ctx.fillStyle = burned ? '#1C1917' : '#5B3A29'; ctx.fillRect(x + 131, base - 59, 22, 28);
  ctx.fillStyle = burned ? '#0C0A09' : '#4A2E20'; ctx.fillRect(x + 134, base - 56, 7, 10); ctx.fillRect(x + 143, base - 56, 7, 10); ctx.fillRect(x + 134, base - 44, 7, 10); ctx.fillRect(x + 143, base - 44, 7, 10);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(x + 149, base - 46, 2, 2);
  shaded(ctx, () => ctx.rect(x + 110, base - 64, 4, 34), '#5A544E', x + 110, base - 64, 4, 34, 1);
  shaded(ctx, () => ctx.rect(x + 176, base - 64, 4, 34), '#5A544E', x + 176, base - 64, 4, 34, 1);
  // (its roof dim and unlit, part of the house: nothing to get up on, unlike the lit lip of the porch roofs out front)
  shaded(ctx, () => ctx.rect(x + 106, base - 68, 78, 5), '#4A4540', x + 106, base - 68, 78, 5, 1);
  if (!burned && dusk > 0.35 && hash(k * 41) < 0.6) { ctx.fillStyle = '#FEF3C7'; ctx.fillRect(x + 158, base - 60, 3, 4); steppedGlow(ctx, x + 159.5, base - 58, 10, '#FDE68A', 0.35, 0.05, 3); } // (the porch light)
  // A sign in the yard now and then
  const sign = hash(k * 17);
  if (sign < 0.22) shaded(ctx, () => ctx.rect(x + 12, base - 30, 3, 30), '#44403C', x + 12, base - 30, 3, 30, 0.8);
  if (sign < 0.12) { ink(ctx, () => ctx.rect(x - 6, base - 50, 40, 22), '#F8FAFC', 1); ctx.fillStyle = '#CBD5E1'; ctx.fillRect(x - 5, base - 31, 38, 2); ctx.fillStyle = '#B91C1C'; ctx.font = 'bold 5px "Press Start 2P"'; ctx.fillText('CONDEMNED', x - 4, base - 36); }
  else if (sign < 0.22) { ink(ctx, () => ctx.rect(x - 10, base - 54, 48, 26), '#1D4ED8', 1); ctx.fillStyle = '#3B82F6'; ctx.fillRect(x - 9, base - 53, 46, 1); ctx.fillStyle = '#1E3A8A'; ctx.fillRect(x - 9, base - 31, 46, 2); ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 5px "Press Start 2P"'; ctx.fillText('BOIL WATER', x - 8, base - 43); ctx.fillText('ADVISORY', x - 5, base - 34); }
  // Chain-link along the front: the mesh, posts, the top rail lit, a sag in it
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)'; ctx.lineWidth = 1;
  for (let fx = x; fx < x + 270; fx += 8) { ctx.beginPath(); ctx.moveTo(fx, base - 36); ctx.lineTo(fx + 8, base); ctx.moveTo(fx + 8, base - 36); ctx.lineTo(fx, base); ctx.stroke(); }
  for (let px = x; px <= x + 270; px += 90) { ctx.fillStyle = '#475569'; ctx.fillRect(px - 1, base - 40, 3, 40); ctx.fillStyle = '#CBD5E1'; ctx.fillRect(px - 1, base - 40, 1, 40); }
  ctx.fillStyle = '#64748B'; ctx.fillRect(x, base - 38, 270, 3);
  ctx.fillStyle = '#CBD5E1'; ctx.fillRect(x, base - 38, 270, 1);
};

const drawLiquor = (ctx: Ctx, x: number, base: number, dusk: number) => {
  // (cinderblock painted grey, gone grubby; a parapet along the top)
  ctx.fillStyle = tilePattern(ctx, 'tommyBlock', 40, 20, g => {
    g.fillStyle = '#5A606B'; g.fillRect(0, 0, 40, 20);
    for (const [bx, by] of [[0, 0], [20, 0], [-10, 10], [10, 10], [30, 10]]) { g.fillStyle = (bx + by) % 20 ? '#6B7280' : '#676D79'; g.fillRect(bx + 1, by + 1, 18, 8); g.fillStyle = '#7A808C'; g.fillRect(bx + 1, by + 1, 18, 1); }
  });
  ctx.fillRect(x + 10, base - 150, 250, 150);
  checker(ctx, x + 10, base - 30, 250, 30, 'rgba(40, 30, 20, 0.25)');
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x + 10.5, base - 149.5, 249, 149);
  shadedTop(ctx, () => ctx.rect(x + 6, base - 154, 258, 6), '#57534E', x + 6, base - 154, 258, 6, 1);
  // The sign band: red, lit along its top, the letters with their shadow
  shadedTop(ctx, () => ctx.rect(x + 10, base - 148, 250, 30), '#B91C1C', x + 10, base - 148, 250, 30, 1);
  ctx.fillStyle = '#7F1D1D'; ctx.font = 'bold 16px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('LIQUOR', x + 137, base - 125);
  ctx.fillStyle = dusk > 0.4 ? '#FDE047' : '#FEF3C7'; ctx.fillText('LIQUOR', x + 135, base - 127); ctx.textAlign = 'left';
  // The window, barred, a hand-lettered sign taped up in it
  ink(ctx, () => ctx.rect(x + 30, base - 104, 150, 70), '#111827', 1.2);
  ctx.fillStyle = '#1E293B'; ctx.fillRect(x + 31, base - 103, 148, 10);
  ctx.fillStyle = '#FACC15'; ctx.font = 'bold 6px "Press Start 2P"'; ctx.fillText('WE HAVE WATER', x + 40, base - 84); ctx.fillText('$9.99 GAL', x + 60, base - 72);
  for (let bx = x + 30; bx < x + 180; bx += 10) { ctx.fillStyle = '#292524'; ctx.fillRect(bx, base - 104, 3, 70); ctx.fillStyle = '#78716C'; ctx.fillRect(bx, base - 104, 1, 70); } // bars on the windows
  ctx.fillStyle = '#A8A29E'; ctx.fillRect(x + 28, base - 34, 154, 3);
  // The door: steel, a wired-glass slot, a push bar
  ink(ctx, () => ctx.rect(x + 200, base - 90, 40, 90), '#1F2937', 1.2);
  ctx.fillStyle = '#334155'; ctx.fillRect(x + 201, base - 89, 3, 88);
  ink(ctx, () => ctx.rect(x + 210, base - 80, 20, 26), '#0F172A', 0.8);
  checker(ctx, x + 211, base - 79, 18, 24, 'rgba(148, 163, 184, 0.25)', 0, 3);
  ink(ctx, () => ctx.rect(x + 204, base - 46, 32, 3), '#A8A29E', 0.8);
};

const drawChurch = (ctx: Ctx, x: number, base: number, dusk: number) => {
  // (white clapboard, the sun side warmer, the shade side dithered)
  ctx.fillStyle = '#D6D3D1'; ctx.fillRect(x + 40, base - 140, 190, 140);
  checker(ctx, x + 170, base - 140, 60, 140, 'rgba(0, 0, 0, 0.12)');
  ctx.fillStyle = 'rgba(0,0,0,0.1)'; for (let y = base - 136; y < base; y += 8) ctx.fillRect(x + 40, y, 190, 1);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x + 40.5, base - 139.5, 189, 139);
  const roof = (l: number, t: number, r: number, b: number, px: number) => {
    ink(ctx, () => { ctx.moveTo(l, b); ctx.lineTo(px, t); ctx.lineTo(r, b); ctx.closePath(); }, '#57534E', 1.2);
    ctx.save(); ctx.beginPath(); ctx.moveTo(l, b); ctx.lineTo(px, t); ctx.lineTo(r, b); ctx.closePath(); ctx.clip();
    ctx.fillStyle = '#44403C'; for (let y = b - 6; y > t; y -= 6) ctx.fillRect(l, y, r - l, 1);
    ctx.fillStyle = '#6B635C'; ctx.beginPath(); ctx.moveTo(l, b); ctx.lineTo(px, t); ctx.lineTo(px, b); ctx.closePath(); ctx.globalAlpha = 0.4; ctx.fill(); ctx.globalAlpha = 1;
    ctx.restore();
  };
  roof(x + 30, base - 200, x + 240, base - 140, x + 135);
  // The steeple: its tower, louvers, a spire, the cross
  ctx.fillStyle = '#D6D3D1'; ctx.fillRect(x + 118, base - 260, 34, 70);
  ctx.fillStyle = '#B5B0AB'; ctx.fillRect(x + 140, base - 260, 12, 70);
  ink(ctx, () => ctx.rect(x + 126, base - 248, 18, 26), '#292524', 1);
  ctx.fillStyle = '#57534E'; for (let y = base - 245; y < base - 224; y += 4) ctx.fillRect(x + 127, y, 16, 1);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x + 118.5, base - 259.5, 33, 69);
  roof(x + 114, base - 310, x + 156, base - 260, x + 135);
  ink(ctx, () => { ctx.rect(x + 133, base - 330, 4, 22); ctx.rect(x + 127, base - 324, 16, 4); }, '#44403C', 1);
  ctx.fillStyle = '#78716C'; ctx.fillRect(x + 133, base - 329, 1, 20);
  // (the windows: pointed, stained glass in pieces, leaded, lit from inside once it's getting dark)
  for (const wx of [70, 170]) {
    const win = () => { ctx.arc(x + wx + 10, base - 90, 10, Math.PI, 0); ctx.lineTo(x + wx + 20, base - 60); ctx.lineTo(x + wx, base - 60); ctx.closePath(); };
    ink(ctx, () => { ctx.arc(x + wx + 10, base - 90, 13, Math.PI, 0); ctx.lineTo(x + wx + 23, base - 57); ctx.lineTo(x + wx - 3, base - 57); ctx.closePath(); }, '#A8A29E', 1);
    ctx.save(); ctx.beginPath(); win(); ctx.clip();
    const pane = dusk > 0.3 ? ['#FBBF24', '#F97316', '#FDE68A', '#DC2626'] : ['#1E3A8A', '#7C2D12', '#1E40AF', '#14532D'];
    for (let py = 0; py < 4; py++) for (let px = 0; px < 2; px++) { ctx.fillStyle = pane[(py + px * 3) % 4]; ctx.fillRect(x + wx + px * 10, base - 100 + py * 10, 10, 10); }
    ctx.fillStyle = '#1C1917'; ctx.fillRect(x + wx + 9, base - 100, 2, 40); ctx.fillRect(x + wx, base - 81, 20, 1); ctx.fillRect(x + wx, base - 71, 20, 1);
    ctx.restore();
  }
  // The sign board out front on its legs: the week's message in black letters
  shaded(ctx, () => ctx.rect(x + 70, base - 16, 4, 16), '#57534E', x + 70, base - 16, 4, 16, 0.8);
  shaded(ctx, () => ctx.rect(x + 196, base - 16, 4, 16), '#57534E', x + 196, base - 16, 4, 16, 0.8);
  ink(ctx, () => ctx.rect(x + 58, base - 42, 154, 28), '#44403C', 1);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x + 60, base - 40, 150, 24);
  ctx.fillStyle = '#CBD5E1'; ctx.fillRect(x + 60, base - 19, 150, 3);
  ctx.fillStyle = '#111827'; ctx.font = 'bold 5px "Press Start 2P"'; ctx.fillText('LIVING WATER BAPTIST', x + 64, base - 30); ctx.fillText('PRAY FOR CLEAN PIPES', x + 64, base - 21);
};

const drawEmptyLot = (ctx: Ctx, x: number, base: number, k: number) => {
  ctx.fillStyle = '#65743F'; ctx.fillRect(x, base - 6, 280, 8);
  checker(ctx, x, base - 6, 280, 3, '#7A8A4C');
  for (let gx = x; gx < x + 280; gx += 6) { const gh = 6 + hash(gx) * 10; ctx.fillStyle = '#3D4722'; ctx.fillRect(gx + 1, base - 6 - gh + 2, 2, gh); ctx.fillStyle = '#4D5A2E'; ctx.fillRect(gx, base - 6 - gh, 2, 6 + gh * 0.4); ctx.fillStyle = '#7A8A4C'; ctx.fillRect(gx, base - 6 - gh, 1, 2); }
  // Tires, a mattress, a shopping cart
  for (const tx of [x + 60, x + 78]) {
    ink(ctx, () => ctx.arc(tx, base - 10, 10, 0, Math.PI * 2), '#1C1917', 1);
    ctx.strokeStyle = '#3F3F46'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(tx, base - 10, 7.5, Math.PI * 1.1, Math.PI * 1.6); ctx.stroke();
    ink(ctx, () => ctx.arc(tx, base - 10, 4, 0, Math.PI * 2), '#0C0A09', 0.8);
  }
  // (the mattress lying flat and saggy, springs poking out: nothing like a ramp)
  const mat = () => { ctx.moveTo(x + 130, base - 4); ctx.quadraticCurveTo(x + 130, base - 16, x + 140, base - 15); ctx.quadraticCurveTo(x + 170, base - 10, x + 200, base - 15); ctx.quadraticCurveTo(x + 210, base - 16, x + 210, base - 4); ctx.closePath(); };
  ink(ctx, mat, '#D6D3D1', 1);
  ctx.save(); ctx.beginPath(); mat(); ctx.clip();
  ctx.fillStyle = '#A8A29E'; for (let sx = x + 134; sx < x + 210; sx += 6) ctx.fillRect(sx, base - 16, 1, 12); // (ticking stripes)
  ctx.fillStyle = '#A8A29E'; ctx.fillRect(x + 130, base - 6, 80, 2);
  ctx.restore();
  ctx.fillStyle = 'rgba(120, 53, 15, 0.45)'; ctx.beginPath(); ctx.ellipse(x + 160, base - 9, 12, 4, 0, 0, Math.PI * 2); ctx.fill();
  checker(ctx, x + 150, base - 13, 20, 8, 'rgba(120, 53, 15, 0.3)');
  for (const sx of [146, 182]) { ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(x + sx, base - 18, 3, 0, Math.PI * 2); ctx.stroke(); ctx.strokeStyle = '#A8A29E'; ctx.lineWidth = 1.2; ctx.stroke(); }
  if (hash(k * 19) < 0.5) {
    for (const [lw, c] of [[2.5, INK], [1.5, '#9CA3AF']] as const) {
      ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.strokeRect(x + 220, base - 30, 30, 20); ctx.beginPath(); ctx.arc(x + 224, base - 6, 3, 0, Math.PI * 2); ctx.moveTo(x + 249, base - 6); ctx.arc(x + 246, base - 6, 3, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.fillStyle = '#9CA3AF'; for (let cx = x + 226; cx < x + 250; cx += 6) ctx.fillRect(cx, base - 29, 1, 18); ctx.fillRect(x + 221, base - 21, 28, 1);
    ctx.fillStyle = '#E5E7EB'; ctx.fillRect(x + 221, base - 30, 28, 1);
  }
};

const BILLBOARDS = [['FLINT', 'VEHICLE CITY'], ['BOTTLED WATER', 'DISTRIBUTION'], ["DON'T DRINK", 'THE WATER'], ['TOMMY WASTE', 'MANAGEMENT LLC']];
const drawBillboard = (ctx: Ctx, x: number, base: number, k: number) => {
  const [a, b] = BILLBOARDS[Math.abs(k) % BILLBOARDS.length];
  // (the uprights, a cross brace, the catwalk under the board and its rail, a lamp on an arm)
  shaded(ctx, () => ctx.rect(x + 80, base - 160, 6, 160), '#44403C', x + 80, base - 160, 6, 160, 1);
  shaded(ctx, () => ctx.rect(x + 190, base - 160, 6, 160), '#44403C', x + 190, base - 160, 6, 160, 1);
  ctx.strokeStyle = '#2E2A27'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 86, base - 150); ctx.lineTo(x + 190, base - 70); ctx.moveTo(x + 190, base - 150); ctx.lineTo(x + 86, base - 70); ctx.stroke();
  shadedTop(ctx, () => ctx.rect(x + 36, base - 156, 208, 5), '#57534E', x + 36, base - 156, 208, 5, 1);
  ctx.fillStyle = '#2E2A27'; for (let rx = x + 40; rx <= x + 240; rx += 25) ctx.fillRect(rx, base - 152, 1, 10);
  // The board: its frame, the paint (lit along the top in steps), a corner peeling off
  ink(ctx, () => ctx.rect(x + 40, base - 250, 200, 96), '#F8FAFC', 1.2);
  // (never the ramps' green)
  const c = a === 'TOMMY WASTE' ? '#6B21A8' : '#1E3A8A';
  ctx.fillStyle = c; ctx.fillRect(x + 44, base - 246, 192, 88);
  ctx.fillStyle = lite(c, 0.12); ctx.fillRect(x + 44, base - 246, 192, 20);
  checker(ctx, x + 44, base - 226, 192, 2, lite(c, 0.12));
  ctx.fillStyle = dark(c, 0.2); ctx.fillRect(x + 44, base - 172, 192, 14);
  checker(ctx, x + 44, base - 174, 192, 2, dark(c, 0.2), 1);
  ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.moveTo(x + 236, base - 246); ctx.lineTo(x + 236, base - 226); ctx.lineTo(x + 218, base - 246); ctx.closePath(); ctx.fill();
  ctx.fillStyle = dark(c, 0.4); ctx.beginPath(); ctx.moveTo(x + 236, base - 226); ctx.lineTo(x + 218, base - 246); ctx.lineTo(x + 224, base - 230); ctx.closePath(); ctx.fill();
  ctx.fillStyle = dark(c, 0.45); ctx.font = 'bold 12px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText(a, x + 141, base - 208);
  ctx.fillStyle = '#F8FAFC'; ctx.fillText(a, x + 140, base - 210); ctx.font = 'bold 8px "Press Start 2P"'; ctx.fillText(b, x + 140, base - 186); ctx.textAlign = 'left';
  for (const lx of [x + 90, x + 190]) { ctx.fillStyle = '#2E2A27'; ctx.fillRect(lx, base - 158, 2, 8); ink(ctx, () => ctx.rect(lx - 4, base - 162, 10, 4), '#57534E', 0.8); }
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
    if (smashed || b.done.has(i)) {
      if (smashed) {
        ctx.fillStyle = 'rgba(68, 64, 60, 0.6)'; ctx.fillRect(box.x + 10, box.y + box.h - 3, box.w - 20, 3);
        const bits = j.look === 'cones' ? '#F97316' : j.look === 'trash' ? '#16A34A' : j.look === 'barrier' ? '#F8FAFC' : '#BAE6FD';
        for (let s = 0; s < 6; s++) { const bx = box.x + 8 + hash(j.x + s) * (box.w - 16); ink(ctx, () => ctx.rect(bx, box.y + box.h - 4, 4 + (s % 3) * 2, 2), bits, 0.6); }
        return;
      }
    }
    const live = !b.done.has(i);
    const ahead = j.x - (state.player.pos.x + state.player.width / 2);
    // A warning glow on the road under it, in steps
    if (live && j.look !== 'cones' && j.look !== 'ramp') {
      const rw = box.w * 0.9 + 20;
      for (let r = 0; r < 4; r++) { const q = 1 - r / 4; ctx.fillStyle = `rgba(250, 204, 21, ${(0.14 + r * 0.04).toFixed(3)})`; ctx.beginPath(); ctx.ellipse(j.x, box.y + box.h, rw * q, 14 * q, 0, 0, Math.PI * 2); ctx.fill(); }
    }
    drawOneJunk(ctx, state, j, box);
    // The hazard sign over it, bobbing, while it's coming up ahead of him
    if (live && ahead > 0 && ahead < 700 && j.look !== 'cones') {
      const sy = box.y - 40 + Math.sin(state.frame * 0.2) * 5;
      const good = j.look === 'ramp';
      ctx.fillStyle = good ? '#22C55E' : '#FACC15'; ctx.strokeStyle = '#111827'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(j.x, sy - 32); ctx.lineTo(j.x + 20, sy); ctx.lineTo(j.x - 20, sy); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = good ? '#86EFAC' : '#FEF08A'; ctx.beginPath(); ctx.moveTo(j.x - 1, sy - 27); ctx.lineTo(j.x - 15, sy - 3); ctx.lineTo(j.x - 11, sy - 3); ctx.lineTo(j.x + 1, sy - 23); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#111827'; ctx.font = 'bold 16px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText(good ? '^' : '!', j.x + 1, sy - 4); ctx.textAlign = 'left';
    }
  });
};

/** A traffic cone, its foot at (cx, g): lit down the left, the reflective band, the square base. */
const cone = (ctx: Ctx, cx: number, g: number) => {
  ink(ctx, () => ctx.rect(cx - 11, g - 3, 22, 3), '#C2410C', 1);
  const body = () => { ctx.moveTo(cx - 9, g - 3); ctx.lineTo(cx - 2, g - 26); ctx.lineTo(cx + 2, g - 26); ctx.lineTo(cx + 9, g - 3); ctx.closePath(); };
  ctx.save(); ctx.beginPath(); body(); ctx.clip();
  ctx.fillStyle = '#F97316'; ctx.fillRect(cx - 10, g - 27, 20, 25);
  ctx.fillStyle = '#FDBA74'; ctx.fillRect(cx - 10, g - 27, 7, 25);
  ctx.fillStyle = '#C2410C'; ctx.fillRect(cx + 3, g - 27, 7, 25);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(cx - 10, g - 16, 20, 4);
  ctx.fillStyle = '#CBD5E1'; ctx.fillRect(cx + 3, g - 16, 7, 4);
  ctx.restore();
  ctx.beginPath(); body(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
};

const drawOneJunk = (ctx: Ctx, state: GameState, j: RoadJunk, box: { x: number; y: number; w: number; h: number }) => {
  const g = box.y + box.h;
  const f = state.frame;
  switch (j.look) {
    case 'cones':
      for (let c = 0; c < 3; c++) cone(ctx, box.x + 12 + c * 28, g);
      break;
    case 'trash':
      // Two cans: ribbed, lit down the left, the lids on (one askew), a bag hanging out of one
      for (const c of [0, 1]) {
        const cx = box.x + 4 + c * 26;
        ink(ctx, () => ctx.rect(cx - 2, g - 42, 26, 42), '#111827', 1);
        shaded(ctx, () => ctx.rect(cx, g - 38, 22, 38), '#16A34A', cx, g - 38, 22, 38, 1);
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; for (let r = 0; r < 3; r++) ctx.fillRect(cx + 4 + r * 6, g - 34, 2, 30);
        ctx.fillStyle = 'rgba(187, 247, 208, 0.35)'; for (let r = 0; r < 3; r++) ctx.fillRect(cx + 3 + r * 6, g - 34, 1, 30);
        ctx.fillStyle = '#F8FAFC'; ctx.fillRect(cx + 6, g - 26, 10, 6); ctx.fillStyle = '#16A34A'; ctx.fillRect(cx + 8, g - 25, 6, 1); ctx.fillRect(cx + 8, g - 23, 4, 1); // (the city's sticker)
        ctx.save(); if (c) { ctx.translate(cx + 11, g - 41); ctx.rotate(-0.12); ctx.translate(-cx - 11, -g + 41); }
        shadedTop(ctx, () => ctx.rect(cx - 2, g - 43, 26, 5), '#22C55E', cx - 2, g - 43, 26, 5, 1);
        ink(ctx, () => ctx.rect(cx + 7, g - 46, 8, 3), '#15803D', 0.8);
        ctx.restore();
      }
      ink(ctx, () => ctx.rect(box.x + 8, g - 44, 10, 4), '#65A30D', 0.8);
      ink(ctx, () => ctx.ellipse(box.x + 13, g - 38, 6, 4, 0, 0, Math.PI * 2), '#27272A', 0.8);
      ctx.fillStyle = '#52525B'; ctx.fillRect(box.x + 10, g - 40, 3, 1);
      break;
    case 'pothole':
      // (ringed in orange spray paint: somebody tried) The broken edge of it, chunks of asphalt, the water in the bottom
      ctx.strokeStyle = '#9A3412'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(j.x, g - 3, 42, 10, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#F97316'; ctx.lineWidth = 2; ctx.stroke();
      ink(ctx, () => { for (let a = 0; a < 16; a++) { const t = (a / 16) * Math.PI * 2, rr = 1 + (hash(a + j.x) - 0.5) * 0.18; ctx.lineTo(j.x + Math.cos(t) * 34 * rr, g - 3 + Math.sin(t) * 7 * rr); } ctx.closePath(); }, '#0A0A0A', 1);
      ctx.fillStyle = '#27272A'; ctx.beginPath(); ctx.ellipse(j.x, g - 6, 32, 3, 0, Math.PI, 0); ctx.fill(); // (the far wall of it, lit)
      ctx.fillStyle = 'rgba(101, 163, 13, 0.6)'; ctx.beginPath(); ctx.ellipse(j.x, g - 2, 20, 3, 0, 0, Math.PI * 2); ctx.fill(); // (full of the water)
      ctx.fillStyle = 'rgba(217, 249, 157, 0.6)'; ctx.fillRect(j.x - 10, g - 3, 6, 1);
      for (const [cx, cy, cw] of [[j.x - 30, g - 8, 6], [j.x + 20, g - 9, 8], [j.x + 38, g - 4, 5]]) { ink(ctx, () => ctx.rect(cx, cy, cw, 3), '#52525B', 0.8); ctx.fillStyle = '#A1A1AA'; ctx.fillRect(cx, cy, cw, 1); }
      break;
    case 'glass':
      for (let s = 0; s < 20; s++) {
        const gx = box.x + hash(j.x + s) * box.w, gy = g - 2 - hash(s * 7) * 5;
        ctx.fillStyle = s % 3 ? '#0E7490' : '#166534'; ctx.beginPath(); ctx.moveTo(gx - 0.5, gy + 0.5); ctx.lineTo(gx + 4, gy - 6); ctx.lineTo(gx + 8, gy + 0.5); ctx.fill();
        ctx.fillStyle = s % 3 ? '#BAE6FD' : '#4ADE80'; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + 4, gy - 5); ctx.lineTo(gx + 7, gy); ctx.fill();
        ctx.fillStyle = '#F0F9FF'; ctx.fillRect(gx + 3, gy - 3, 1, 2);
      }
      ink(ctx, () => ctx.rect(box.x + box.w * 0.6, g - 9, 8, 7), '#166534', 0.8); ctx.fillStyle = '#4ADE80'; ctx.fillRect(box.x + box.w * 0.6 + 1, g - 8, 2, 5); // (what's left of the bottle's neck)
      for (let s = 0; s < 3; s++) if ((f + s * 13) % 30 < 12) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(box.x + 12 + s * 26, g - 9, 2, 6); ctx.fillRect(box.x + 10 + s * 26, g - 7, 6, 2); }
      break;
    case 'car': {
      // A burned-out car, left on its rims (drawn to its box: squat and wide): scorched paint, rust, no glass, inked
      ctx.save(); ctx.translate(box.x, g); ctx.scale(box.w / 140, box.h / 50); ctx.translate(-box.x, -g);
      const body = () => { ctx.moveTo(box.x, g - 10); ctx.lineTo(box.x + 4, g - 30); ctx.lineTo(box.x + 34, g - 32); ctx.lineTo(box.x + 48, g - 50); ctx.lineTo(box.x + 104, g - 50); ctx.lineTo(box.x + 118, g - 32); ctx.lineTo(box.x + 138, g - 30); ctx.lineTo(box.x + 140, g - 10); ctx.closePath(); };
      ctx.save(); ctx.beginPath(); body(); ctx.clip();
      ctx.fillStyle = '#9A3412'; ctx.fillRect(box.x, g - 52, 142, 44);
      ctx.fillStyle = '#C2410C'; ctx.fillRect(box.x, g - 32, 142, 3); ctx.fillRect(box.x + 48, g - 50, 56, 2);
      ctx.fillStyle = '#7C2D12'; ctx.fillRect(box.x, g - 18, 142, 8);
      checker(ctx, box.x + 50, g - 50, 50, 18, 'rgba(28, 25, 23, 0.55)'); // (scorched black up the roof)
      checker(ctx, box.x + 10, g - 26, 20, 8, '#5C1D0A'); checker(ctx, box.x + 110, g - 24, 18, 6, '#5C1D0A', 1); // rust
      ctx.fillStyle = '#5C1D0A'; ctx.fillRect(box.x + 70, g - 30, 1, 20); ctx.fillRect(box.x + 34, g - 30, 1, 20); // (the door seams)
      ctx.restore();
      ctx.beginPath(); body(); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.stroke();
      for (const wx of [52, 78]) { ink(ctx, () => ctx.rect(box.x + wx, g - 46, 22, 14), '#292524', 1); ctx.fillStyle = '#0C0A09'; ctx.fillRect(box.x + wx + 1, g - 45, 20, 4); ctx.fillStyle = '#57534E'; ctx.fillRect(box.x + wx + 3, g - 40, 6, 1); }
      for (const wx of [26, 114]) {
        ink(ctx, () => ctx.arc(box.x + wx, g - 8, 8, 0, Math.PI * 2), '#1C1917', 1);
        ink(ctx, () => ctx.arc(box.x + wx, g - 8, 4.5, 0, Math.PI * 2), '#57534E', 0.8);
        ctx.fillStyle = '#A8A29E'; ctx.fillRect(box.x + wx - 3, g - 11, 2, 1);
      }
      ink(ctx, () => ctx.rect(box.x + 132, g - 26, 6, 4), '#FDE68A', 0.6); ink(ctx, () => ctx.rect(box.x + 1, g - 26, 4, 4), '#7F1D1D', 0.6); // (a headlight, a tail light, cracked)
      ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 5px "Press Start 2P"'; ctx.fillText('NO PARTS', box.x + 40, g - 18);
      ctx.restore();
      break;
    }
    case 'hydrant': {
      ctx.save(); ctx.translate(j.x, g); ctx.scale(0.8, 0.8); drawHydrant(ctx, 0, 0); ctx.restore();
      if (geyserOn(j, f)) {
        // The geyser: brown-green water, straight up, in bands (thin at the top), lit down its left
        const hgt = 200 + Math.sin(f * 0.5) * 12;
        ctx.save(); ctx.beginPath(); ctx.rect(j.x - 10, g - 30 - hgt, 20, hgt); ctx.clip();
        ctx.globalAlpha = 0.85; bandedGradient(ctx, j.x - 10, g - 30 - hgt, 20, hgt, ['#C8D4A8', '#A3B478', '#788C46'], 8); ctx.globalAlpha = 1;
        ctx.fillStyle = 'rgba(236, 252, 203, 0.35)'; ctx.fillRect(j.x - 10, g - 30 - hgt, 5, hgt);
        ctx.fillStyle = 'rgba(54, 64, 20, 0.35)'; ctx.fillRect(j.x + 5, g - 30 - hgt, 5, hgt);
        ctx.restore();
        ctx.fillStyle = 'rgba(217, 249, 157, 0.75)'; for (let s = 0; s < 6; s++) ctx.fillRect(j.x - 14 + ((f * 5 + s * 9) % 28), g - 30 - hgt + ((f * 7 + s * 31) % hgt), 3, 8);
      } else if ((f + Math.abs(j.x)) % 150 > 120) {
        ctx.fillStyle = 'rgba(120, 140, 70, 0.75)'; ctx.fillRect(j.x - 3, g - 40, 6, 8); ctx.fillStyle = 'rgba(217, 249, 157, 0.7)'; ctx.fillRect(j.x - 2, g - 40, 2, 3); // (about to go)
      }
      break;
    }
    case 'ramp': {
      // A plywood kicker on cinder blocks, painted in yellow and black, a big arrow on a board saying what it's for
      const bx = box.x + box.w - 36;
      shaded(ctx, () => ctx.rect(bx, g - 36, 32, 36), '#78716C', bx, g - 36, 32, 36, 1);
      ctx.fillStyle = '#57534E'; ctx.fillRect(bx, g - 20, 32, 2);
      ctx.fillStyle = '#2E2A27'; for (const [hx, hy] of [[4, -32], [18, -32], [4, -15], [18, -15]]) ctx.fillRect(bx + hx, g + hy, 9, 10); // (the blocks' holes)
      ctx.fillStyle = '#A8A29E'; ctx.fillRect(bx + 1, g - 36, 30, 1); ctx.fillRect(bx + 1, g - 18, 30, 1);
      ctx.save(); ctx.beginPath(); ctx.moveTo(box.x, g); ctx.lineTo(box.x + box.w, g - 40); ctx.lineTo(box.x + box.w, g - 32); ctx.lineTo(box.x + 8, g); ctx.closePath(); ctx.clip();
      ctx.fillStyle = '#FACC15'; ctx.fillRect(box.x, g - 42, box.w, 42);
      ctx.fillStyle = '#111827'; for (let s = -40; s < box.w; s += 20) { ctx.beginPath(); ctx.moveTo(box.x + s, g); ctx.lineTo(box.x + s + 10, g); ctx.lineTo(box.x + s + 50, g - 42); ctx.lineTo(box.x + s + 40, g - 42); ctx.fill(); }
      ctx.restore();
      // (the edge of the board: plywood plies showing)
      ctx.strokeStyle = '#A16207'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(box.x + 2, g + 1); ctx.lineTo(box.x + box.w, g - 38); ctx.stroke();
      ctx.strokeStyle = '#FDE68A'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(box.x + 2, g); ctx.lineTo(box.x + box.w, g - 39); ctx.stroke();
      ctx.strokeStyle = '#111827'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(box.x, g); ctx.lineTo(box.x + box.w, g - 40); ctx.stroke();
      // (the sign, on a post just before it)
      const sx = box.x - 40;
      shaded(ctx, () => ctx.rect(sx - 2, g - 70, 4, 70), '#44403C', sx - 2, g - 70, 4, 70, 1);
      const on = f % 20 < 10;
      ctx.fillStyle = on ? '#22C55E' : '#4ADE80'; ctx.fillRect(sx - 30, g - 96, 60, 28);
      ctx.fillStyle = on ? '#4ADE80' : '#86EFAC'; ctx.fillRect(sx - 30, g - 96, 60, 4);
      ctx.fillStyle = on ? '#15803D' : '#22C55E'; ctx.fillRect(sx - 30, g - 72, 60, 4);
      ctx.strokeStyle = '#111827'; ctx.lineWidth = 2; ctx.strokeRect(sx - 30, g - 96, 60, 28);
      ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.moveTo(sx - 20, g - 76); ctx.lineTo(sx + 12, g - 90); ctx.lineTo(sx + 8, g - 94); ctx.lineTo(sx + 22, g - 92); ctx.lineTo(sx + 16, g - 80); ctx.lineTo(sx + 14, g - 86); ctx.lineTo(sx - 18, g - 72); ctx.fill();
      break;
    }
    case 'barrier':
      // A barricade: two A-frame legs, the striped board (lit along the top), a lamp on it blinking
      for (const lx of [box.x + 6, box.x + box.w - 10]) { shaded(ctx, () => ctx.rect(lx, g - 30, 4, 30), '#78350F', lx, g - 30, 4, 30, 1); ink(ctx, () => ctx.rect(lx - 3, g - 3, 10, 3), '#57534E', 0.8); }
      ink(ctx, () => ctx.rect(box.x, g - 44, box.w, 14), '#F8FAFC', 1.2);
      ctx.save(); ctx.beginPath(); ctx.rect(box.x, g - 44, box.w, 14); ctx.clip();
      ctx.fillStyle = '#F97316'; for (let s = -14; s < box.w; s += 14) { ctx.beginPath(); ctx.moveTo(box.x + s, g - 30); ctx.lineTo(box.x + s + 7, g - 30); ctx.lineTo(box.x + s + 21, g - 44); ctx.lineTo(box.x + s + 14, g - 44); ctx.closePath(); ctx.fill(); }
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'; ctx.fillRect(box.x, g - 44, box.w, 2);
      ctx.fillStyle = 'rgba(26, 11, 6, 0.3)'; ctx.fillRect(box.x, g - 33, box.w, 3);
      ctx.restore();
      ink(ctx, () => ctx.rect(box.x + box.w - 14, g - 52, 8, 8), f % 30 < 15 ? '#FBBF24' : '#92400E', 0.8);
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
    // (the tire, an ink ring round it, its tread catching the light up top; the rim; the spokes; the hub)
    ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(wx, -R, R, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#111827'; ctx.lineWidth = 3; ctx.stroke();
    ctx.strokeStyle = '#4B5563'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(wx, -R, R, Math.PI * 1.1, Math.PI * 1.5); ctx.stroke();
    ctx.strokeStyle = '#D1D5DB'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(wx, -R, R - 2.5, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#9CA3AF'; ctx.lineWidth = 1;
    for (let k = 0; k < 4; k++) { const a = spin + k * Math.PI / 4; ctx.beginPath(); ctx.moveTo(wx - Math.cos(a) * (R - 2), -R - Math.sin(a) * (R - 2)); ctx.lineTo(wx + Math.cos(a) * (R - 2), -R + Math.sin(a) * (R - 2)); ctx.stroke(); }
    ink(ctx, () => ctx.arc(wx, -R, 2, 0, Math.PI * 2), '#E5E7EB', 0.8);
  };
  wheel(rear); wheel(front);
  // The frame: rear hub to cranks to seat to head tube to front hub (inked, candy red, a glint along the tubes)
  const frame = () => { ctx.beginPath(); ctx.moveTo(rear, -R); ctx.lineTo(CRANK.x, CRANK.y); ctx.lineTo(-4, -24); ctx.lineTo(rear, -R); ctx.moveTo(CRANK.x, CRANK.y); ctx.lineTo(16, -30); ctx.lineTo(-4, -24); ctx.moveTo(16, -30); ctx.lineTo(front, -R); };
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  frame(); ctx.strokeStyle = INK; ctx.lineWidth = 5.5; ctx.stroke();
  frame(); ctx.strokeStyle = '#DC2626'; ctx.lineWidth = 3.5; ctx.stroke();
  ctx.save(); ctx.translate(-0.6, -0.8); frame(); ctx.strokeStyle = '#FCA5A5'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
  // Seat, bars (grips), pegs, a sticker
  ink(ctx, () => ctx.roundRect(-11, -28, 16, 5, 2), '#111827', 1); ctx.fillStyle = '#4B5563'; ctx.fillRect(-9, -27.5, 10, 1);
  for (const [lw, c] of [[4.5, INK], [2.5, '#6B7280']] as const) { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(16, -30); ctx.lineTo(14, -40); ctx.lineTo(22, -41); ctx.stroke(); }
  ctx.strokeStyle = '#D1D5DB'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(15, -31); ctx.lineTo(13.5, -39.5); ctx.stroke();
  ink(ctx, () => ctx.rect(19, -43, 5, 4), '#111827', 0.8);
  ink(ctx, () => ctx.rect(rear - 4, -R - 2, 8, 3), '#9CA3AF', 0.8); ctx.fillStyle = '#E5E7EB'; ctx.fillRect(rear - 3, -R - 2, 6, 1);
  ctx.fillStyle = '#FDE047'; ctx.fillRect(4, -22, 5, 3); ctx.fillStyle = '#111827'; ctx.fillRect(5, -21, 1, 1);
  // The cranks, the chainring
  ink(ctx, () => ctx.arc(CRANK.x, CRANK.y, 3.5, 0, Math.PI * 2), '#9CA3AF', 0.8);
  for (const [lw, c] of [[4, INK], [2, '#374151']] as const) {
    ctx.strokeStyle = c; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(CRANK.x + Math.cos(turn) * CRANK.r, CRANK.y + Math.sin(turn) * CRANK.r); ctx.lineTo(CRANK.x - Math.cos(turn) * CRANK.r, CRANK.y - Math.sin(turn) * CRANK.r); ctx.stroke();
  }
  ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
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
  // (a tee or a hoodie in their colour, jeans, white kicks, a cap or a do-rag; one hand going as they talk)
  const k = Math.abs(Math.round(x * 0.37)) % 3;
  drawPerson(ctx, x, y, {
    skin, hair: { style: 'short', color: '#111827' }, top: { style: k === 1 ? 'hoodie' : 'tee', color: shirt, accent: k ? '#111827' : '#FACC15' },
    legs: { color: '#1E3A8A' }, shoes: '#F8FAFC', hat: k === 2 ? { style: 'beanie', color: '#111827' } : { style: 'cap', color: k ? '#DC2626' : '#111827' },
    extra: c => { c.strokeStyle = '#FACC15'; c.lineWidth = 1; c.beginPath(); c.arc(0, -50, 5, 0.2, Math.PI - 0.2); c.stroke(); },
  }, { arms: Math.sin(f * 0.05) > 0 ? 'point' : 'hips', mouth: 'talk', f }, 1, facing < 0 ? -1 : 1);
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
  // (the ring it sits in, the shaft going down in the dark, the top rung of the ladder)
  ink(ctx, () => ctx.ellipse(R.manhole, GROUND_Y + 2, 38, 9, 0, 0, Math.PI * 2), '#57534E', 1);
  ctx.fillStyle = '#78716C'; ctx.fillRect(R.manhole - 30, GROUND_Y - 6, 24, 1);
  ctx.fillStyle = '#0C0A09'; ctx.beginPath(); ctx.ellipse(R.manhole, GROUND_Y + 2, 34, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#292524'; ctx.beginPath(); ctx.ellipse(R.manhole, GROUND_Y, 32, 4, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#57534E'; ctx.fillRect(R.manhole - 10, GROUND_Y + 3, 20, 2);
  // (the cover: cast iron, its rings and grid, the light down its left edge)
  ctx.save(); ctx.translate(R.manhole + 60, GROUND_Y - 22);
  ink(ctx, () => ctx.ellipse(0, 0, 8, 22, 0, 0, Math.PI * 2), '#44403C', 1.2);
  ctx.fillStyle = '#292524'; ctx.beginPath(); ctx.ellipse(1.5, 0, 6, 19, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#57534E'; for (let gy = -15; gy <= 15; gy += 5) ctx.fillRect(-3, gy, 7, 2);
  ctx.strokeStyle = '#78716C'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(0, 0, 7, 21, 0, Math.PI * 0.6, Math.PI * 1.4); ctx.stroke();
  ctx.restore();
  // Him: the bottle held up (the label: FLINT WATER SUPPLY), in the city's own kit (see drawCityWorker)
  const hx = R.hazmat;
  ctx.save(); ctx.translate(hx, GROUND_Y); ctx.scale(-1, 1);
  const holding = b.bottle.state === 'held';
  drawCityWorker(ctx, holding);
  ctx.restore();
  if (holding) drawBottle(ctx, hx - 16, GROUND_Y - 84, 0, 1.6);
  else if (b.bottle.state === 'thrown') drawBottle(ctx, b.bottle.x, b.bottle.y, f * 0.3);
  if (b.bottle.state === 'trap') {
    // The trap: a spreading, smoking, bubbling pool of it eating into the asphalt
    const x = b.bottle.x;
    ctx.fillStyle = 'rgba(28, 25, 23, 0.6)'; ctx.beginPath(); ctx.ellipse(x, GROUND_Y, 50, 8, 0, 0, Math.PI * 2); ctx.fill(); // (the asphalt eaten black round it)
    ctx.fillStyle = 'rgba(77, 124, 15, 0.9)'; ctx.beginPath(); ctx.ellipse(x, GROUND_Y - 1, 46, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(132, 204, 22, 0.9)'; ctx.beginPath(); ctx.ellipse(x - 4, GROUND_Y - 2, 36, 4.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(217, 249, 157, 0.7)'; ctx.fillRect(x - 26, GROUND_Y - 5, 18, 1); ctx.fillRect(x + 6, GROUND_Y - 4, 8, 1);
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

/**
 * The city's man in his hazmat gear, stood, facing right, feet at 0 (his arm up holding something, or down). Nothing like
 * Meathead's yellow suit and black visor: a white paper coverall, the city's orange vest over it, a white hard hat with
 * the city's blue on it, blue gloves and boots, and a clear face mask (his face in it) with the two pink filters.
 */
export const CITY_SUIT = '#F1F5F9', CITY_CREASE = '#CBD5E1', CITY_VEST = '#F97316', CITY_BAND = '#E5E7EB', CITY_BLUE = '#2563EB', CITY_FILTER = '#DB2777';
export const drawCityWorker = (ctx: Ctx, armUp: boolean) => {
  ctx.fillStyle = CITY_SUIT; ctx.fillRect(-9, -28, 8, 23); ctx.fillRect(2, -28, 8, 23);
  ctx.fillStyle = CITY_CREASE; ctx.fillRect(-6, -26, 1, 17); ctx.fillRect(6, -26, 1, 17);
  ctx.fillStyle = '#1E3A8A'; ctx.fillRect(-10, -10, 11, 10); ctx.fillRect(1, -10, 11, 10); // rubber boots
  ctx.fillStyle = CITY_SUIT; ctx.beginPath(); ctx.roundRect(-13, -58, 26, 32, 4); ctx.fill();
  ctx.fillStyle = CITY_VEST; ctx.fillRect(-13, -56, 26, 22);
  ctx.fillStyle = CITY_BAND; ctx.fillRect(-13, -50, 26, 3); ctx.fillRect(-13, -42, 26, 3);
  ctx.fillStyle = CITY_SUIT; ctx.beginPath(); ctx.arc(1, -66, 10, 0, Math.PI * 2); ctx.fill(); // the hood
  // The mask: a black frame, his face through the clear front, the glare on it; the filters under it
  ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.roundRect(0, -72, 13, 12, 3); ctx.fill();
  ctx.fillStyle = '#E0AC69'; ctx.fillRect(2, -70, 9, 8);
  ctx.fillStyle = '#111827'; ctx.fillRect(8, -68, 2, 2); ctx.fillStyle = '#9A6B3F'; ctx.fillRect(6, -64, 4, 1);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'; ctx.fillRect(3, -70, 1, 7);
  ctx.fillStyle = CITY_FILTER; ctx.beginPath(); ctx.arc(5, -58, 3, 0, Math.PI * 2); ctx.arc(12, -59, 3, 0, Math.PI * 2); ctx.fill();
  // The hard hat (the city's blue on the front of it)
  ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(1, -73, 10, Math.PI, 0); ctx.fill(); ctx.fillRect(-10, -74, 24, 3);
  ctx.fillStyle = CITY_BLUE; ctx.fillRect(3, -80, 5, 4);
  // The arm, the glove
  ctx.fillStyle = CITY_SUIT; ctx.fillRect(8, armUp ? -72 : -50, 7, armUp ? 22 : 10);
  ctx.fillStyle = CITY_BLUE; ctx.fillRect(8, armUp ? -78 : -41, 7, 6);
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
