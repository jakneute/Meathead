// Deadwood Gulch, drawn: the dirt street with its wagon ruts, the boardwalks,
// the false fronts (saloon, general store, barber, bank, the grand hotel, the
// livery, the assay office, the chapel and its bell tower), the porch roofs, the
// welcome arch, the curio shop with the fourth truck's cab in it, the photo
// cutouts and barrels and hay bales, the fake jail with the guy in it and the
// "sheriff" outside, Dale's pharmacy at the end. The ninja up the tower, his
// crosshair. Riggs on the warpath. The INCOMING meter.

import { drawSkipPrompt } from '../../platform/skip';
import type { GameState } from '../../core/state';
import { drawFire } from '../../render/fx/fire';
import type { GroundRun } from '../../core/terrain';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, BOSS_DOOR_X } from '../../../constants';
import { COURSE, Building, Awning } from './course';
import type { DaleRuntime } from './runtime';
import { Town, TownProp, CAB, ninjaSpot, incoming, jailWrecked, townStains, muzzle, laserEnd, NINJA_CUT, NINJA_DONE, JAIL_SKIP_AFTER, DUCK_FOR, cabReach } from './town';
import { drawDaleKind } from '../../render/enemies/dale';
import { drawPlayer } from '../../render/player/player';
import { saying, drawBubble } from './script';
import { visible, hash } from './draw';
import { wheelTurn, drawTruckWheel, slab, column, pipe, letter, redPaint, headBeam, exhaust } from '../../render/bosses/daleTruck';
import { drawPerson } from '../../render/npc/person';
import type { PersonSpec } from '../../render/npc/person';
import { INK, dark, lite, ink, shaded, shadedTop } from '../../render/npc/kit';
import { bandedGradient, checker, steppedGlow, tilePattern } from '../../render/pixelArt';
import { RIGGS } from './convoyDraw';

type Ctx = CanvasRenderingContext2D;
const Y = GROUND_Y;

// ---------------------------------------------------------------------------
// Behind everything that moves
// ---------------------------------------------------------------------------

export const drawTownBack = (ctx: Ctx, state: GameState, rt: DaleRuntime) => {
  const t = COURSE.town;
  for (const r of state.groundRuns) if (r.surface === 'street' && visible(state, r.x1, r.x2)) drawStreet(ctx, state, r);
  // Where Riggs ran the tourists down: blood across the street, drag marks after it, the way he was going
  for (const sx of townStains(state)) {
    if (!visible(state, sx - 80, sx + 120)) continue;
    ctx.fillStyle = 'rgba(127, 29, 29, 0.9)'; ctx.beginPath(); ctx.ellipse(sx, Y + 3, 30 + hash(sx) * 16, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(153, 27, 27, 0.8)'; for (let k = 0; k < 6; k++) ctx.fillRect(sx + 10 + k * 14, Y + 1 + (k % 2), 10 - k, 2);
    for (let k = 0; k < 5; k++) { const bx = sx - 20 + hash(sx + k) * 70; ctx.beginPath(); ctx.arc(bx, Y + 2 - hash(sx * k) * 3, 2 + hash(sx + k * 3) * 3, 0, Math.PI * 2); ctx.fill(); }
  }
  // Where the cab's been: its tracks up the street, gouged into the dirt
  const reach = cabReach(state);
  if (reach > 0) drawTracks(ctx, state, t.crash, reach);
  if (visible(state, t.x1 - 100, t.x1 + 400)) drawCurioShop(ctx, t.x1, rt.town.shopHit);
  if (visible(state, t.arch - 200, t.arch + 200)) drawArch(ctx, t.arch);
  for (const b of COURSE.buildings) if (visible(state, b.x1 - 60, b.x2 + 60)) { drawBuilding(ctx, state, b, b.x1 < reach); if (b.x1 < reach) drawBattered(ctx, b); }
  for (const a of COURSE.awnings) if (visible(state, a.x, a.x + a.w)) drawAwning(ctx, state, a, a.x < reach);
  // The hotel's balcony
  const bal = COURSE.ledges.find(l => l.look === 'balcony');
  if (bal && visible(state, bal.x, bal.x + bal.w)) {
    // (the deck on its brackets, turned balusters, the rail lit along its top)
    for (let x = bal.x + 20; x < bal.x + bal.w; x += 80) ink(ctx, () => { ctx.moveTo(x, bal.y + 8); ctx.lineTo(x + 10, bal.y + 8); ctx.lineTo(x + 3, bal.y + 22); ctx.closePath(); }, '#5A2A0A', 1);
    for (let x = bal.x; x <= bal.x + bal.w; x += 16) column(ctx, x, bal.y - 30, 3, 30, '#92400E');
    pipe(ctx, bal.x, bal.y - 32, bal.w, 4, '#92400E');
    slab(ctx, bal.x, bal.y, bal.w, 8, '#78350F', 2);
  }
  if (visible(state, t.jail.x1 - 200, t.jail.x2 + 100)) drawJail(ctx, state, rt.town);
  if (visible(state, t.pharmacy - 100, BOSS_DOOR_X + 40)) drawPharmacy(ctx, state, t.pharmacy);
};

/** The street: packed dirt, wagon ruts, hoofprints; the ground under it. */
const drawStreet = (ctx: Ctx, state: GameState, r: GroundRun) => {
  const bottom = state.camera.y + CANVAS_HEIGHT + 60;
  const x0 = Math.max(r.x1, state.camera.x - 40), x1 = Math.min(r.x2, state.camera.x + CANVAS_WIDTH + 40);
  if (x1 <= x0) return;
  // Packed dirt in bands (sunlit on top, darker going down), pebbles and grit through it
  bandedGradient(ctx, x0, r.y1, x1 - x0, Math.min(140, bottom - r.y1), ['#B07B45', '#A0703F', '#93653A', '#865B34'], 5);
  if (bottom - r.y1 > 140) { ctx.fillStyle = '#865B34'; ctx.fillRect(x0, r.y1 + 140, x1 - x0, bottom - r.y1 - 140); }
  ctx.fillStyle = tilePattern(ctx, 'daleDirt', 64, 32, g => {
    g.fillStyle = '#C49260'; for (const [a, b] of [[4, 3], [22, 11], [41, 6], [57, 19], [13, 25], [33, 28], [50, 2]]) g.fillRect(a, b, 2, 1);
    g.fillStyle = '#6E4626'; for (const [a, b] of [[9, 14], [28, 4], [46, 23], [60, 9], [18, 30], [38, 17]]) g.fillRect(a, b, 2, 1);
    g.fillStyle = '#8A8178'; g.fillRect(25, 21, 2, 2); g.fillRect(52, 13, 1, 1);
  });
  ctx.fillRect(x0, r.y1 + 4, x1 - x0, bottom - r.y1 - 4);
  ctx.fillStyle = '#C08A55'; ctx.fillRect(x0, r.y1, x1 - x0, 4);
  ctx.fillStyle = '#D6A672'; ctx.fillRect(x0, r.y1, x1 - x0, 1);
  // (the wagon ruts: worn in, their far lips lit, their bottoms in shadow)
  for (const ry of [r.y1 + 14, r.y1 + 30]) { ctx.fillStyle = '#7A4A24'; ctx.fillRect(x0, ry, x1 - x0, 3); ctx.fillStyle = '#C49260'; ctx.fillRect(x0, ry + 3, x1 - x0, 1); ctx.fillStyle = '#5E3818'; ctx.fillRect(x0, ry, x1 - x0, 1); }
  for (let x = Math.floor(x0 / 26) * 26; x < x1; x += 26) { ctx.fillStyle = hash(x) > 0.5 ? '#7A4A24' : '#B07B45'; ctx.fillRect(x + hash(x + 1) * 10, r.y1 + 8 + hash(x + 2) * 40, 4, 2); }
  // (hoofprints, here and there)
  for (let x = Math.floor(x0 / 70) * 70; x < x1; x += 70) { if (hash(x + 9) < 0.5) continue; const hy = r.y1 + 20 + hash(x + 3) * 6; ctx.fillStyle = '#6E4626'; ctx.fillRect(x + 10, hy, 4, 2); ctx.fillRect(x + 24, hy + 1, 4, 2); ctx.fillStyle = '#C49260'; ctx.fillRect(x + 10, hy + 2, 4, 1); ctx.fillRect(x + 24, hy + 3, 4, 1); }
};

/** A false front: the facade (its top edge is the roof you can walk on), its sign, windows, a door. */
const PAINT: Record<Building['look'], { wall: string; trim: string; sign: string; ink: string }> = {
  saloon: { wall: '#8B4513', trim: '#5A2A0A', sign: '#F5DEB3', ink: '#7F1D1D' },
  store: { wall: '#6B8E23', trim: '#3F5A12', sign: '#FFF8DC', ink: '#1E3A8A' },
  barber: { wall: '#B22222', trim: '#7A1010', sign: '#F8FAFC', ink: '#1E3A8A' },
  bank: { wall: '#A9A9A9', trim: '#4B5563', sign: '#1F2937', ink: '#FACC15' },
  hotel: { wall: '#4682B4', trim: '#274C6B', sign: '#FFF8DC', ink: '#7F1D1D' },
  livery: { wall: '#A0522D', trim: '#5A2A10', sign: '#F5DEB3', ink: '#1C1917' },
  assay: { wall: '#DAA520', trim: '#8A6408', sign: '#1C1917', ink: '#FDE68A' },
  church: { wall: '#F5F5F4', trim: '#A8A29E', sign: '#F5F5F4', ink: '#1C1917' },
};

const drawBuilding = (ctx: Ctx, state: GameState, b: Building, wrecked = false) => {
  const c = PAINT[b.look];
  const w = b.x2 - b.x1;
  // The wall, clapboard: each board lit along its lip, its shadow under the next, the paint flaking here and there,
  // the dust of the street up the bottom of it
  ctx.fillStyle = c.wall; ctx.fillRect(b.x1, b.top, w, Y - b.top);
  for (let y = b.top + 8; y < Y; y += 10) { ctx.fillStyle = lite(c.wall, 0.18); ctx.fillRect(b.x1, y + 2, w, 1); ctx.fillStyle = dark(c.wall, 0.25); ctx.fillRect(b.x1, y, w, 2); }
  for (let k = 0; k < w / 40; k++) { const fx = b.x1 + 10 + hash(b.x1 + k * 7) * (w - 30), fy = b.top + 20 + Math.floor(hash(b.x1 + k * 11) * (Y - b.top - 40) / 10) * 10 + 4; ctx.fillStyle = dark(c.wall, 0.4); ctx.fillRect(fx, fy, 6 + hash(k) * 8, 2); }
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)'; ctx.fillRect(b.x2 - 22, b.top, 14, Y - b.top);
  checker(ctx, b.x1, Y - 22, w, 22, 'rgba(176, 123, 69, 0.4)');
  // Cornice along the top (the roof line), corner boards
  for (const cx of [b.x1, b.x2 - 8]) column(ctx, cx, b.top, 8, Y - b.top, c.trim);
  for (let x = b.x1; x < b.x2; x += 20) slab(ctx, x, b.top + 8, 6, 5, c.trim, 1);
  pipe(ctx, b.x1 - 6, b.top - 4, w + 12, 12, c.trim);
  ctx.fillStyle = INK; ctx.fillRect(b.x1 - 6, b.top - 4, 1, 12); ctx.fillRect(b.x2 + 5, b.top - 4, 1, 12);
  if (b.look === 'church') { drawChapel(ctx, state, b); return; }
  // The sign (knocked askew once Riggs has been through: hanging off the one nail that held)
  const sy = b.top + 20;
  ctx.save();
  if (wrecked) {
    const left = hash(b.x1 + 3) < 0.5, tip = (0.04 + hash(b.x1 + 5) * 0.07) * (left ? 1 : -1);
    const px = left ? b.x1 + 24 : b.x2 - 24;
    ctx.translate(px, sy + 4); ctx.rotate(tip); ctx.translate(-px, -(sy + 4));
  }
  slab(ctx, b.x1 + 17, sy - 3, w - 34, 40, c.trim, 2);
  slab(ctx, b.x1 + 21, sy + 1, w - 42, 32, c.sign, 2);
  ctx.fillStyle = dark(c.sign, 0.12); ctx.fillRect(b.x1 + 23, sy + 12, w - 46, 1); ctx.fillRect(b.x1 + 23, sy + 23, w - 46, 1);
  ctx.fillStyle = INK; for (const nx of [b.x1 + 25, b.x2 - 27]) { ctx.fillRect(nx, sy + 4, 2, 2); ctx.fillRect(nx, sy + 28, 2, 2); }
  letter(ctx, b.name, (b.x1 + b.x2) / 2, sy + 23, `bold ${w > 330 ? 13 : 10}px "Press Start 2P"`, c.ink, dark(c.sign, 0.3), w - 50);
  ctx.restore();
  // Upstairs windows (dark rooms behind, a lamp lit in some, the curtains, the sash, a sill and a lintel)
  const wy = sy + 50;
  if (Y - 130 - wy > 40) for (let x = b.x1 + 40; x < b.x2 - 60; x += 90) {
    ctx.fillStyle = '#1E293B'; ctx.fillRect(x, wy, 34, 44);
    if (wrecked && hash(x * 3) < 0.6) brokenPane(ctx, x + 2, wy + 2, 30, 40, x);
    else {
      bandedGradient(ctx, x + 2, wy + 2, 30, 40, ['#4B3B2A', '#6B5536', '#8A6E44'], 3);
      ctx.fillStyle = 'rgba(253, 230, 138, 0.3)'; ctx.fillRect(x + 2, wy + 2, 30, 40);
      for (const cx of [x + 2, x + 26]) { ctx.fillStyle = '#9F1239'; ctx.fillRect(cx, wy + 2, 6, 40); ctx.fillStyle = '#BE123C'; ctx.fillRect(cx + 1, wy + 2, 1, 40); }
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'; ctx.fillRect(x + 9, wy + 4, 2, 12);
    }
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, wy + 0.5, 33, 43);
    slab(ctx, x - 3, wy - 3, 40, 4, c.trim, 1); column(ctx, x + 15, wy, 3, 44, c.trim); pipe(ctx, x, wy + 20, 34, 3, c.trim);
    slab(ctx, x - 4, wy + 44, 42, 4, c.trim, 1);
  }
  // Downstairs: the door (saloon doors, for the saloon), a window, a bench
  const dx = b.x1 + w * 0.5 - 20;
  slab(ctx, dx - 4, Y - 100, 48, 100, c.trim, 2);
  ctx.fillStyle = '#1C1917'; ctx.fillRect(dx, Y - 96, 40, 96);
  ctx.fillStyle = '#0C0A09'; ctx.fillRect(dx, Y - 96, 40, 14);
  if (b.look === 'saloon') {
    // (the batwing doors, swinging: slatted, a scalloped top)
    const sw = Math.sin(state.frame * 0.05) * 3;
    for (const [lx, oy] of [[dx + 2, sw], [dx + 21, -sw]]) {
      ink(ctx, () => { ctx.moveTo(lx, Y - 80 + oy + 44); ctx.lineTo(lx, Y - 80 + oy + 4); ctx.quadraticCurveTo(lx + 8.5, Y - 80 + oy - 4, lx + 17, Y - 80 + oy + 4); ctx.lineTo(lx + 17, Y - 80 + oy + 44); ctx.closePath(); }, '#A0522D', 1);
      ctx.fillStyle = '#7A3A1C'; for (let k = 0; k < 4; k++) ctx.fillRect(lx + 2 + k * 4, Y - 80 + oy + 12, 1, 26);
      ctx.fillStyle = '#C8743F'; ctx.fillRect(lx + 1, Y - 80 + oy + 6, 15, 1);
    }
  }
  if (b.look === 'barber') {
    // (the pole: red stripe winding up a white column, chrome caps)
    ctx.save(); ctx.beginPath(); ctx.rect(dx - 30, Y - 90, 12, 60); ctx.clip();
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(dx - 30, Y - 90, 12, 60);
    ctx.fillStyle = '#DC2626'; for (let k = 0; k < 5; k++) { const sy0 = Y - 90 + ((k * 14 + state.frame) % 60); ctx.beginPath(); ctx.moveTo(dx - 30, sy0); ctx.lineTo(dx - 18, sy0 - 6); ctx.lineTo(dx - 18, sy0 - 1); ctx.lineTo(dx - 30, sy0 + 5); ctx.fill(); ctx.beginPath(); ctx.moveTo(dx - 30, sy0 + 60); ctx.lineTo(dx - 18, sy0 + 54); ctx.lineTo(dx - 18, sy0 + 59); ctx.lineTo(dx - 30, sy0 + 65); ctx.fill(); }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; ctx.fillRect(dx - 28, Y - 90, 2, 60);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; ctx.fillRect(dx - 21, Y - 90, 3, 60);
    ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(dx - 29.5, Y - 89.5, 11, 59);
    slab(ctx, dx - 32, Y - 96, 16, 6, '#D1D5DB', 1); slab(ctx, dx - 32, Y - 30, 16, 6, '#D1D5DB', 1);
  }
  if (b.look === 'bank') letter(ctx, '$', dx + 20, Y - 110, 'bold 18px "Press Start 2P"', '#FACC15', '#854D0E');
  if (w > 220) {
    // (the shop window: a frame, the goods behind the glass, a glint)
    slab(ctx, b.x1 + 22, Y - 94, 68, 58, c.trim, 2);
    ctx.fillStyle = '#334155'; ctx.fillRect(b.x1 + 26, Y - 90, 60, 50);
    if (wrecked) brokenPane(ctx, b.x1 + 28, Y - 88, 56, 46, b.x1);
    else {
      bandedGradient(ctx, b.x1 + 28, Y - 88, 56, 46, ['#5B4A34', '#6E5A3E', '#83704C'], 3);
      ctx.fillStyle = 'rgba(253,230,138,0.3)'; ctx.fillRect(b.x1 + 28, Y - 88, 56, 46);
      ctx.fillStyle = '#3F2A16'; ctx.fillRect(b.x1 + 28, Y - 62, 56, 2);
      for (let k = 0; k < 5; k++) { ink(ctx, () => ctx.rect(b.x1 + 32 + k * 10, Y - 72, 6, 10), ['#B91C1C', '#1D4ED8', '#CA8A04', '#15803D', '#7C3AED'][(k + b.x1) % 5], 0.6); }
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; ctx.beginPath(); ctx.moveTo(b.x1 + 34, Y - 42); ctx.lineTo(b.x1 + 50, Y - 88); ctx.lineTo(b.x1 + 56, Y - 88); ctx.lineTo(b.x1 + 40, Y - 42); ctx.fill();
    }
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(b.x1 + 27.5, Y - 88.5, 57, 47);
  }
};

/** A window with the glass gone: dark behind, the jagged bits still in the frame. */
const brokenPane = (ctx: Ctx, x: number, y: number, w: number, h: number, seed: number) => {
  ctx.fillStyle = '#0F172A'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#020617'; ctx.fillRect(x, y, w, h * 0.3);
  // (shards along the edges of the frame, pointing in: pale glass, inked, a glint on each)
  const shards = () => {
    ctx.moveTo(x, y); ctx.lineTo(x + w * (0.3 + hash(seed) * 0.3), y); ctx.lineTo(x + w * 0.12, y + h * (0.25 + hash(seed + 1) * 0.3)); ctx.closePath();
    ctx.moveTo(x + w, y + h); ctx.lineTo(x + w - w * (0.25 + hash(seed + 2) * 0.35), y + h); ctx.lineTo(x + w, y + h - h * (0.3 + hash(seed + 3) * 0.3)); ctx.closePath();
    ctx.moveTo(x + w, y); ctx.lineTo(x + w - w * 0.2, y); ctx.lineTo(x + w, y + h * 0.18); ctx.closePath();
  };
  ink(ctx, shards, 'rgba(203, 213, 225, 0.6)', 0.8);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x + 2, y + 1, 3, 1); ctx.fillRect(x + w - 3, y + h - 4, 1, 2);
};

/**
 * After Riggs has been through: the front of the place has taken the cab (a gouge along it at bumper height, the
 * boards stove in and splintered), and what it sent flying (blood sprayed up it, run down it, a smear dragged along
 * it), and what's come off it lies in a heap at the foot of it.
 */
const drawBattered = (ctx: Ctx, b: Building) => {
  const w = b.x2 - b.x1, s = b.x1;
  // The gouge: stove-in boards at bumper height, along a stretch of the frontage
  const g1 = b.x1 + 12 + hash(s + 7) * w * 0.3, g2 = Math.min(b.x2 - 12, g1 + w * (0.35 + hash(s + 8) * 0.3));
  const gouge = () => {
    ctx.moveTo(g1, Y - 58);
    for (let x = g1; x <= g2; x += 10) ctx.lineTo(x, Y - 62 - hash(x) * 14);
    for (let x = g2; x >= g1; x -= 10) ctx.lineTo(x, Y - 28 + hash(x + 1) * 10);
    ctx.closePath();
  };
  ink(ctx, gouge, '#1C1917', 1.5);
  ctx.save(); ctx.beginPath(); gouge(); ctx.clip(); ctx.fillStyle = '#0C0A09'; ctx.fillRect(g1, Y - 80, g2 - g1, 26); ctx.fillStyle = '#3A2A1C'; for (let x = g1; x < g2; x += 14) ctx.fillRect(x, Y - 76, 3, 50); ctx.restore();
  // (splinters sticking out of it, bare wood)
  ctx.strokeStyle = '#D6B98C'; ctx.lineWidth = 2; ctx.beginPath();
  for (let x = g1 + 6; x < g2; x += 16 + hash(x) * 10) { const up = hash(x + 2) < 0.5, y0 = up ? Y - 60 : Y - 30; ctx.moveTo(x, y0); ctx.lineTo(x + 6 + hash(x + 3) * 8, y0 + (up ? -8 : 8) * hash(x + 4)); }
  ctx.stroke();
  // (a board hanging off by one end)
  ctx.save(); ctx.translate(g2 - 4, Y - 66); ctx.rotate(0.9 + hash(s + 9) * 0.4);
  slab(ctx, 0, -3, 44, 7, '#8B5A2B', 1); ctx.fillStyle = '#D6B98C'; ctx.fillRect(40, -3, 4, 7); ctx.restore();
  // Blood: sprayed up the front where they hit it, run down it, a long smear dragged along it
  ctx.fillStyle = 'rgba(127, 29, 29, 0.85)';
  const sprays = 2 + Math.floor(hash(s + 11) * 3);
  for (let k = 0; k < sprays; k++) {
    const cx = b.x1 + 20 + hash(s + 20 + k) * (w - 40), cy = Y - 70 - hash(s + 30 + k) * 70;
    ctx.beginPath(); ctx.ellipse(cx, cy, 9 + hash(s + k) * 8, 6 + hash(s + k + 1) * 5, hash(k + s) * 3, 0, Math.PI * 2); ctx.fill();
    for (let d = 0; d < 9; d++) { const a = hash(s + k * 9 + d) * Math.PI * 2, r = 12 + hash(s + d * 3 + k) * 26; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.7, 1.5 + hash(d + k) * 2.5, 0, Math.PI * 2); ctx.fill(); }
    for (let d = 0; d < 3; d++) ctx.fillRect(cx - 6 + d * 6, cy + 4, 2, 12 + hash(s + k + d * 5) * 34);
  }
  ctx.fillStyle = 'rgba(153, 27, 27, 0.6)'; ctx.fillRect(b.x1 + hash(s + 40) * w * 0.4, Y - 44 - hash(s + 41) * 20, w * 0.35, 5);
  // What came off it, in a heap at the foot of it: planks, glass
  for (let k = 0; k < 5; k++) {
    ctx.save(); ctx.translate(b.x1 + 10 + hash(s + 50 + k) * (w - 20), Y - 4); ctx.rotate((hash(s + 60 + k) - 0.5) * 0.8);
    slab(ctx, -16, -3, 32, 5, k % 2 ? '#8B5A2B' : '#6B4423', 1); ctx.restore();
  }
  ctx.fillStyle = 'rgba(203, 213, 225, 0.6)'; for (let k = 0; k < 6; k++) ctx.fillRect(b.x1 + hash(s + 70 + k) * w, Y - 2, 3, 2);
};

/** Riggs's tracks up the street: two dark bands of tread, gouged in, from the curio shop as far as he's got. */
const drawTracks = (ctx: Ctx, state: GameState, from: number, to: number) => {
  const x0 = Math.max(from, state.camera.x - 40), x1 = Math.min(to, state.camera.x + CANVAS_WIDTH + 40);
  if (x1 <= x0) return;
  ctx.fillStyle = 'rgba(68, 40, 20, 0.55)'; ctx.fillRect(x0, Y + 12, x1 - x0, 7); ctx.fillRect(x0, Y + 30, x1 - x0, 7);
  ctx.fillStyle = 'rgba(40, 24, 12, 0.5)';
  for (let x = Math.floor(x0 / 12) * 12; x < x1; x += 12) { ctx.fillRect(x, Y + 13, 5, 5); ctx.fillRect(x + 6, Y + 31, 5, 5); }
};

/** The chapel: white clapboard, a steeple with a bell in it (and the ninja up there, drawn with the rest that moves). */
const drawChapel = (ctx: Ctx, state: GameState, b: Building) => {
  const t = COURSE.town.tower;
  const tx = t.x - 110, tw = 220;
  // The belfry up off the roof (white clapboard, lit along each board, the bell in the dark of the arch)
  const bh = b.top - (t.top - 80);
  ctx.fillStyle = '#F5F5F4'; ctx.fillRect(tx, t.top - 80, tw, bh);
  for (let y = t.top - 72; y < b.top; y += 10) { ctx.fillStyle = '#D6D3D1'; ctx.fillRect(tx, y, tw, 2); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(tx, y + 2, tw, 1); }
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; ctx.fillRect(tx + tw - 18, t.top - 80, 18, bh);
  for (const cx of [tx, tx + tw - 8]) column(ctx, cx, t.top - 80, 8, bh, '#E7E5E4');
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(tx + 0.5, t.top - 79.5, tw - 1, bh);
  ctx.fillStyle = '#1C1917'; ctx.fillRect(tx + 16, t.top - 70, tw - 32, 64);
  ctx.fillStyle = '#0C0A09'; ctx.fillRect(tx + 16, t.top - 70, tw - 32, 20);
  ctx.strokeStyle = INK; ctx.strokeRect(tx + 15.5, t.top - 70.5, tw - 31, 65);
  ctx.fillStyle = '#A8A29E'; ctx.fillRect(tx + 14, t.top - 72, tw - 28, 2);
  // (the bell: bronze, lit down its left, its lip, the clapper)
  ink(ctx, () => { ctx.arc(t.x, t.top - 48, 14, Math.PI, 0); ctx.lineTo(t.x + 16, t.top - 40); ctx.lineTo(t.x - 16, t.top - 40); ctx.closePath(); }, '#A16207', 1);
  ctx.fillStyle = '#CA8A04'; ctx.fillRect(t.x - 11, t.top - 54, 5, 12); ctx.fillStyle = '#FDE68A'; ctx.fillRect(t.x - 9, t.top - 56, 2, 8);
  ctx.fillStyle = '#713F12'; ctx.fillRect(t.x + 6, t.top - 54, 6, 13);
  slab(ctx, t.x - 17, t.top - 42, 34, 3, '#854D0E', 1);
  ink(ctx, () => ctx.arc(t.x, t.top - 37, 3, 0, Math.PI * 2), '#713F12', 0.8);
  ink(ctx, () => ctx.rect(t.x - 3, t.top - 66, 6, 6), '#57534E', 0.8);
  pipe(ctx, tx - 6, t.top - 4, tw + 12, 8, '#A8A29E');
  // His nest: sandbags along the rail, a spotting scope, a ghillie net hung up out of the sun
  ctx.fillStyle = '#3F6212'; ctx.beginPath(); ctx.moveTo(tx + 16, t.top - 70); ctx.lineTo(tx + tw - 16, t.top - 70); ctx.lineTo(tx + tw - 30, t.top - 52); ctx.lineTo(tx + 30, t.top - 56); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  checker(ctx, tx + 24, t.top - 68, tw - 48, 10, 'rgba(101, 163, 13, 0.6)');
  ctx.fillStyle = '#1A2E05'; for (let k = 0; k < 9; k++) ctx.fillRect(tx + 34 + k * 18, t.top - 58 + (k % 3), 2, 6 + (k % 2) * 4); // (the scraps hanging off it)
  for (let k = 0; k < 11; k++) {
    const sx = tx + 14 + k * 16, c = k % 2 ? '#A8916B' : '#BFA77F';
    shadedTop(ctx, () => ctx.ellipse(sx, t.top - 10, 10, 6, 0, 0, Math.PI * 2), c, sx - 10, t.top - 16, 20, 12);
    ctx.fillStyle = dark(c, 0.3); ctx.fillRect(sx - 1, t.top - 14, 2, 1);
  }
  slab(ctx, tx + tw - 40, t.top - 22, 18, 6, '#27272A', 1); column(ctx, tx + tw - 34, t.top - 16, 3, 12, '#3F3F46');
  ctx.fillStyle = '#93C5FD'; ctx.fillRect(tx + tw - 24, t.top - 21, 1, 3);
  // The steeple: shingled, lit up its left pitch; a gold cross
  const steeple = () => { ctx.moveTo(tx - 8, t.top - 80); ctx.lineTo(t.x, t.top - 170); ctx.lineTo(tx + tw + 8, t.top - 80); ctx.closePath(); };
  ctx.save(); ctx.beginPath(); steeple(); ctx.clip();
  ctx.fillStyle = '#7F1D1D'; ctx.fillRect(tx - 8, t.top - 170, tw + 16, 90);
  ctx.fillStyle = '#991B1B'; ctx.beginPath(); ctx.moveTo(tx - 8, t.top - 80); ctx.lineTo(t.x, t.top - 170); ctx.lineTo(t.x, t.top - 80); ctx.closePath(); ctx.fill();
  for (let y = t.top - 166, row = 0; y < t.top - 80; y += 8, row++) {
    ctx.fillStyle = '#5A1414'; ctx.fillRect(tx - 8, y + 6, tw + 16, 2);
    for (let x = tx - 8 + (row % 2) * 7; x < tx + tw + 8; x += 14) ctx.fillRect(x, y, 1, 7);
  }
  ctx.restore();
  ctx.beginPath(); steeple(); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.lineJoin = 'round'; ctx.stroke();
  pipe(ctx, tx - 10, t.top - 84, tw + 20, 5, '#E7E5E4');
  ink(ctx, () => { ctx.rect(t.x - 2, t.top - 200, 4, 32); ctx.rect(t.x - 10, t.top - 190, 20, 4); }, '#FACC15', 1);
  ctx.fillStyle = '#FDE047'; ctx.fillRect(t.x - 2, t.top - 200, 4, 32); ctx.fillRect(t.x - 10, t.top - 190, 20, 4);
  ctx.fillStyle = '#FEF9C3'; ctx.fillRect(t.x - 2, t.top - 199, 1, 30); ctx.fillStyle = '#CA8A04'; ctx.fillRect(t.x + 1, t.top - 186, 1, 17);
  // Arched windows (stained glass in leaded panes), the doors
  for (const x of [b.x1 + 30, b.x2 - 60]) {
    const arch = () => ctx.roundRect(x, b.top + 60, 30, 60, [15, 15, 0, 0]);
    ctx.save(); ctx.beginPath(); arch(); ctx.clip();
    const panes = ['#3B82F6', '#DC2626', '#FACC15', '#16A34A', '#7C3AED', '#93C5FD'];
    for (let r = 0; r < 6; r++) for (let q = 0; q < 3; q++) { ctx.fillStyle = panes[(r * 2 + q + Math.floor(x)) % panes.length]; ctx.fillRect(x + q * 10, b.top + 60 + r * 10, 10, 10); }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'; ctx.fillRect(x, b.top + 60, 30, 14);
    ctx.fillStyle = INK; for (let q = 1; q < 3; q++) ctx.fillRect(x + q * 10, b.top + 60, 1, 60); for (let r = 1; r < 6; r++) ctx.fillRect(x, b.top + 60 + r * 10, 30, 1);
    ctx.restore();
    ctx.beginPath(); arch(); ctx.strokeStyle = '#A8A29E'; ctx.lineWidth = 4; ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
    slab(ctx, x - 4, b.top + 120, 38, 4, '#D6D3D1', 1);
  }
  const door = () => ctx.roundRect((b.x1 + b.x2) / 2 - 26, Y - 110, 52, 110, [26, 26, 0, 0]);
  shaded(ctx, door, '#78350F', (b.x1 + b.x2) / 2 - 26, Y - 110, 52, 110, 1.5);
  ctx.fillStyle = '#3F1D08'; ctx.fillRect((b.x1 + b.x2) / 2 - 0.5, Y - 108, 1, 108);
  for (const hy of [Y - 80, Y - 30]) { ctx.fillStyle = '#292524'; ctx.fillRect((b.x1 + b.x2) / 2 - 24, hy, 48, 3); ctx.fillStyle = '#57534E'; ctx.fillRect((b.x1 + b.x2) / 2 - 24, hy, 48, 1); }
  ink(ctx, () => ctx.arc((b.x1 + b.x2) / 2 - 6, Y - 56, 2.5, 0, Math.PI * 2), '#A16207', 0.8); ink(ctx, () => ctx.arc((b.x1 + b.x2) / 2 + 6, Y - 56, 2.5, 0, Math.PI * 2), '#A16207', 0.8);
  letter(ctx, 'WEDDINGS $49.99', (b.x1 + b.x2) / 2, b.top + 40, 'bold 8px "Press Start 2P"', '#1C1917', '#D6D3D1');
  void state;
};

/** A porch roof on posts, out over the boardwalk: striped canvas, springy. */
const drawAwning = (ctx: Ctx, state: GameState, a: Awning, wrecked = false) => {
  if (wrecked) { drawWreckedAwning(ctx, a); return; }
  boardwalk(ctx, a);
  // Posts
  column(ctx, a.x + 4, a.y, 8, Y - a.y, '#5A3A1A'); column(ctx, a.x + a.w - 12, a.y, 8, Y - a.y, '#5A3A1A');
  // The roof: flexes when someone's just bounced off it
  const p = state.player;
  const bounced = p.vel.y < -10 && Math.abs(p.pos.y + p.height - a.y) < 60 && p.pos.x + p.width / 2 > a.x && p.pos.x + p.width / 2 < a.x + a.w;
  const sag = bounced ? 6 : 0;
  // Its shade
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(a.x, a.y + 26, a.w, Y - a.y - 34);
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(a.x, a.y + 26, a.w, 14);
  // (striped canvas: each stripe lit along the top, shadowed at the hem, the scallops under it, inked)
  for (let x = a.x; x < a.x + a.w; x += 24) {
    const red = !(((x - a.x) / 24) % 2), c = red ? '#DC2626' : '#F8FAFC';
    ctx.fillStyle = c; ctx.fillRect(x, a.y + 4 + sag, 24, 16);
    ctx.fillStyle = lite(c, 0.3); ctx.fillRect(x, a.y + 4 + sag, 24, 3);
    ctx.fillStyle = dark(c, red ? 0.25 : 0.15); ctx.fillRect(x, a.y + 16 + sag, 24, 4);
  }
  for (let x = a.x; x < a.x + a.w; x += 12) ink(ctx, () => { ctx.arc(x + 6, a.y + 20 + sag, 6, 0, Math.PI); ctx.closePath(); }, '#7C2D12', 1);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(a.x + 0.5, a.y + 3.5 + sag, a.w - 1, 17);
  pipe(ctx, a.x - 4, a.y - 2 + sag, a.w + 8, 6, '#7C2D12');
};

/** The boardwalk under a porch: planks end on, lit along their tops, the gaps between, a nail head in each. */
const boardwalk = (ctx: Ctx, a: Awning) => {
  ctx.fillStyle = '#8B5A2B'; ctx.fillRect(a.x, Y - 8, a.w, 8);
  ctx.fillStyle = '#A8743E'; ctx.fillRect(a.x, Y - 8, a.w, 2);
  for (let x = a.x; x < a.x + a.w; x += 14) { ctx.fillStyle = '#4A2E14'; ctx.fillRect(x, Y - 8, 2, 8); ctx.fillStyle = '#2E1B0C'; ctx.fillRect(x + 7, Y - 5, 1, 1); }
  ctx.fillStyle = INK; ctx.fillRect(a.x, Y - 9, a.w, 1);
};

/**
 * A porch roof after Riggs: the post nearest the street clipped and leaning, the canvas torn (whole stripes gone,
 * flaps hanging down), blood up it, the boardwalk under it stove in. (It still throws you up: it's only the look of it.)
 */
const drawWreckedAwning = (ctx: Ctx, a: Awning) => {
  const s = a.x;
  // The boardwalk, planks up
  boardwalk(ctx, a);
  for (let k = 0; k < 3; k++) { ctx.save(); ctx.translate(a.x + 20 + hash(s + k) * (a.w - 40), Y - 6); ctx.rotate(-0.3 - hash(s + k + 4) * 0.4); slab(ctx, 0, -3, 26, 5, '#A0703F', 1); ctx.restore(); }
  // Posts: the far one stands; the near one's been clipped and leans in under the roof
  column(ctx, a.x + a.w - 12, a.y, 8, Y - a.y, '#5A3A1A');
  ctx.save(); ctx.translate(a.x + 8, Y - 2); ctx.rotate(hash(s + 9) < 0.5 ? 0.35 : -0.25); column(ctx, -4, -(Y - a.y) * 0.8, 8, (Y - a.y) * 0.8, '#5A3A1A'); ctx.restore();
  slab(ctx, a.x + 4, Y - 14, 8, 6, '#D6B98C', 1);
  // The roof, sagging down at the end that lost its post
  const sagL = 14;
  ink(ctx, () => { ctx.moveTo(a.x - 4, a.y - 2 + sagL); ctx.lineTo(a.x + a.w + 4, a.y - 2); ctx.lineTo(a.x + a.w + 4, a.y + 4); ctx.lineTo(a.x - 4, a.y + 4 + sagL); ctx.closePath(); }, '#7C2D12', 1);
  for (let x = a.x; x < a.x + a.w; x += 24) {
    const k = (x - a.x) / 24, sag = sagL * (1 - (x - a.x) / a.w);
    if (hash(s + k * 7) < 0.3) continue; // (torn clean away)
    const c = k % 2 ? '#F8FAFC' : '#DC2626';
    const torn = hash(s + k * 5) < 0.35;
    const cloth = () => { ctx.rect(x, a.y + 4 + sag, 24, torn ? 8 : 16); if (torn) { ctx.moveTo(x + 4, a.y + 12 + sag); ctx.lineTo(x + 12, a.y + 34 + sag + hash(s + k) * 12); ctx.lineTo(x + 20, a.y + 12 + sag); ctx.closePath(); } };
    ink(ctx, cloth, c, 1);
    ctx.fillStyle = lite(c, 0.3); ctx.fillRect(x + 1, a.y + 5 + sag, 22, 2);
  }
  // (blood up it)
  ctx.fillStyle = 'rgba(127, 29, 29, 0.8)';
  for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.arc(a.x + hash(s + 80 + k) * a.w, a.y + 8 + hash(s + 90 + k) * 12, 2 + hash(s + k) * 3, 0, Math.PI * 2); ctx.fill(); }
  // Its shade, what's left of it
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(a.x, a.y + 26, a.w, Y - a.y - 34);
};

/** The welcome arch over the street. */
const drawArch = (ctx: Ctx, x: number) => {
  // (two log posts: bark stepped round them, the rings at the top)
  for (const px of [x - 150, x + 134]) {
    column(ctx, px, Y - 290, 16, 290, '#6B4423');
    ctx.fillStyle = '#4A2E14'; for (let y = Y - 280; y < Y; y += 23) ctx.fillRect(px + 4 + (y % 3), y, 5, 2);
  }
  // (the sign board: planks, lit along each, an inked rim, nails)
  slab(ctx, x - 170, Y - 300, 340, 70, '#5A3A1A', 4);
  ctx.fillStyle = '#8B5A2B'; ctx.fillRect(x - 166, Y - 296, 332, 62);
  for (let y = Y - 296; y < Y - 234; y += 15.5) { ctx.fillStyle = '#A0703F'; ctx.fillRect(x - 166, y, 332, 2); ctx.fillStyle = '#6B4423'; ctx.fillRect(x - 166, y + 13.5, 332, 2); }
  ctx.fillStyle = '#6B4423'; for (const [gx, gy] of [[x - 120, Y - 288], [x + 60, Y - 272], [x - 40, Y - 257], [x + 130, Y - 242]]) ctx.fillRect(gx, gy, 14, 1);
  ctx.fillStyle = INK; for (const nx of [x - 162, x + 160]) for (const ny of [Y - 292, Y - 240]) ctx.fillRect(nx, ny, 2, 2);
  letter(ctx, 'DEADWOOD GULCH', x, Y - 272, 'bold 12px "Press Start 2P"', '#FEF3C7', '#3F2410');
  letter(ctx, 'AN AUTHENTIC 1880S FRONTIER TOWN', x, Y - 256, '6px "Press Start 2P"', '#FEF3C7', '#3F2410');
  letter(ctx, 'EST. 1994 - GIFT SHOP OPEN DAILY', x, Y - 244, '6px "Press Start 2P"', '#FEF3C7', '#3F2410');
  // A cow skull nailed up top
  ctx.lineCap = 'round';
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x - 8, Y - 316); ctx.quadraticCurveTo(x - 22, Y - 318, x - 26, Y - 330); ctx.moveTo(x + 8, Y - 316); ctx.quadraticCurveTo(x + 22, Y - 318, x + 26, Y - 330); ctx.stroke();
  ctx.strokeStyle = '#E7DFC8'; ctx.lineWidth = 3; ctx.stroke();
  ctx.lineCap = 'butt';
  shaded(ctx, () => ctx.ellipse(x, Y - 312, 10, 8, 0, 0, Math.PI * 2), '#F5F0E1', x - 10, Y - 320, 20, 16);
  ctx.fillStyle = '#1C1917'; ctx.fillRect(x - 6, Y - 314, 3, 3); ctx.fillRect(x + 3, Y - 314, 3, 3); ctx.fillRect(x - 2, Y - 307, 1, 2); ctx.fillRect(x + 1, Y - 307, 1, 2);
};

/** The curio shop the truck ended up in (the hole's in the side of it). */
const drawCurioShop = (ctx: Ctx, x: number, hit: boolean) => {
  // (stucco: banded down the wall, its texture, the dust up the bottom, a shadow down the far end)
  bandedGradient(ctx, x, Y - 260, 280, 260, ['#E0C49C', '#D8BA90', '#D2B48C', '#C8A87E'], 5);
  ctx.save(); ctx.translate(x, Y - 260);
  ctx.fillStyle = tilePattern(ctx, 'daleStucco', 30, 22, g => {
    g.fillStyle = '#E8D2AE'; for (const [a, b] of [[3, 2], [17, 8], [26, 15], [9, 18]]) g.fillRect(a, b, 2, 1);
    g.fillStyle = '#B8966A'; for (const [a, b] of [[12, 4], [22, 19], [5, 12], [28, 7]]) g.fillRect(a, b, 1, 1);
  });
  ctx.fillRect(0, 0, 280, 260);
  ctx.restore();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)'; ctx.fillRect(x + 262, Y - 252, 18, 252);
  checker(ctx, x, Y - 20, 280, 20, 'rgba(160, 112, 63, 0.4)');
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, Y - 259.5, 279, 260);
  pipe(ctx, x - 6, Y - 264, 292, 12, '#8B6B3D');
  slab(ctx, x + 17, Y - 243, 246, 46, '#7F1D1D', 3);
  slab(ctx, x + 21, Y - 239, 238, 38, '#FEF3C7', 2);
  letter(ctx, 'TUMBLEWEED CURIOS', x + 140, Y - 222, 'bold 9px "Press Start 2P"', '#7F1D1D', '#E7C9A0');
  letter(ctx, '& GIFTS - T-SHIRTS - FUDGE', x + 140, Y - 208, '6px "Press Start 2P"', '#7F1D1D', '#E7C9A0');
  if (!hit) {
    // (before the cab comes through it: the shop window, the door, a rack of postcards out front)
    slab(ctx, x + 26, Y - 174, 138, 98, '#6B4423', 4);
    bandedGradient(ctx, x + 30, Y - 170, 130, 90, ['#BFDBFE', '#93C5FD', '#7DB2EC'], 4);
    ctx.fillStyle = '#5B4A34'; ctx.fillRect(x + 30, Y - 92, 130, 12);
    ink(ctx, () => ctx.rect(x + 50, Y - 110, 16, 20), '#F472B6', 1); ink(ctx, () => ctx.rect(x + 90, Y - 116, 20, 26), '#22D3EE', 1);
    ctx.fillStyle = '#FBCFE8'; ctx.fillRect(x + 52, Y - 108, 4, 2); ctx.fillStyle = '#CFFAFE'; ctx.fillRect(x + 92, Y - 114, 5, 2);
    ink(ctx, () => ctx.arc(x + 130, Y - 100, 9, 0, Math.PI * 2), '#FDE047', 1); // (a souvenir plate)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'; ctx.beginPath(); ctx.moveTo(x + 36, Y - 82); ctx.lineTo(x + 66, Y - 170); ctx.lineTo(x + 76, Y - 170); ctx.lineTo(x + 46, Y - 82); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x + 29.5, Y - 170.5, 131, 91);
    shaded(ctx, () => ctx.rect(x + 190, Y - 130, 56, 130), '#78350F', x + 190, Y - 130, 56, 130);
    ink(ctx, () => ctx.rect(x + 198, Y - 120, 40, 40), '#93C5FD', 1);
    ink(ctx, () => ctx.arc(x + 236, Y - 62, 3, 0, Math.PI * 2), '#CA8A04', 0.8);
    slab(ctx, x + 200, Y - 112, 36, 10, '#F8FAFC', 1); ctx.fillStyle = '#B91C1C'; ctx.font = '5px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('OPEN', x + 218, Y - 105); ctx.textAlign = 'left';
    return;
  }
  // The hole in it (ragged, the stucco broken back to the lath round it), and the wreckage in the hole
  const hole = () => { ctx.moveTo(x + 60, Y); ctx.lineTo(x + 50, Y - 160); ctx.lineTo(x + 72, Y - 168); ctx.lineTo(x + 120, Y - 190); ctx.lineTo(x + 160, Y - 176); ctx.lineTo(x + 250, Y - 170); ctx.lineTo(x + 262, Y - 90); ctx.lineTo(x + 280, Y); ctx.closePath(); };
  ctx.save(); ctx.translate(-4, -4); ctx.beginPath(); hole(); ctx.fillStyle = '#A8885A'; ctx.fill(); ctx.restore();
  ctx.fillStyle = '#8B6B3D'; for (let k = 0; k < 6; k++) ctx.fillRect(x + 52 + k * 36, Y - 176 + (k % 2) * 6, 22, 2);
  ink(ctx, hole, '#1C1917', 1.5);
  ctx.save(); ctx.beginPath(); hole(); ctx.clip(); ctx.fillStyle = '#0C0A09'; ctx.fillRect(x + 40, Y - 200, 250, 60); ctx.restore();
  for (let i = 0; i < 8; i++) slab(ctx, x + 50 + i * 30, Y - 12 - (i % 3) * 8, 22, 10, '#A0703F', 1);
  ink(ctx, () => ctx.rect(x + 90, Y - 30, 14, 12), '#F472B6', 1); ink(ctx, () => ctx.rect(x + 200, Y - 26, 18, 10), '#22D3EE', 1); // souvenirs everywhere
  ctx.fillStyle = 'rgba(191, 219, 254, 0.8)'; for (let k = 0; k < 9; k++) ctx.fillRect(x + 64 + k * 23, Y - 3 - (k % 2) * 2, 3, 2);
};

/** The guy in the cell: in for a photo, in the souvenir hat and a DEADWOOD GULCH tee. */
const PRISONER: PersonSpec = {
  skin: '#F2C9A0', hair: { style: 'short', color: '#78350F' }, face: 'stubble', hat: { style: 'stetson', color: '#1C1917' },
  top: { style: 'tee', color: '#38BDF8', accent: '#FDE047' }, legs: { color: '#1E3A8A' },
};

/** The fake jail: stone, bars, JAIL; the guy locked in it, the "sheriff" out front. Or what's left. */
const drawJail = (ctx: Ctx, state: GameState, town: Town) => {
  const j = COURSE.town.jail;
  const w = j.x2 - j.x1;
  const f = state.frame;
  if (jailWrecked(state, town)) {
    // Blown open: rubble, the cab buried in it, burning
    // (two stubs of wall, blocks showing, and the rest in a heap)
    for (const [sx, sw, sh] of [[j.x1, 40, 90], [j.x2 - 50, 50, 130]]) {
      ctx.fillStyle = '#57534E'; ctx.fillRect(sx, Y - sh, sw, sh);
      for (let y = Y - sh, r = 0; y < Y; y += 20, r++) for (let bx = sx + (r % 2) * 10 - 10; bx < sx + sw; bx += 20) slab(ctx, Math.max(sx, bx), y, Math.min(18, sx + sw - Math.max(sx, bx)), 18, '#6B6560', 1);
      ink(ctx, () => { ctx.moveTo(sx, Y - sh); for (let k = 0; k <= 4; k++) ctx.lineTo(sx + sw * k / 4, Y - sh - (k % 2) * 10); ctx.lineTo(sx + sw, Y - sh + 6); ctx.closePath(); }, '#57534E', 1);
    }
    for (let i = 0; i < 14; i++) { ctx.save(); ctx.translate(j.x1 + 33 + i * 22, Y - 9 - (i % 4) * 12); ctx.rotate((hash(i + 300) - 0.5) * 0.6); slab(ctx, -13, -7, 26, 14, i % 3 ? '#78716C' : '#8A847F', 1); ctx.restore(); }
    drawCab(ctx, j.x1 + 30 - CAB.w + 120, 1, f, true, 0.18);
    // What's left of the two of them, up the rubble and across the street
    ctx.fillStyle = 'rgba(127, 29, 29, 0.9)';
    ctx.beginPath(); ctx.ellipse(j.x1 + 170, Y - 2, 150, 7, 0, 0, Math.PI * 2); ctx.fill();
    for (let k = 0; k < 22; k++) { const sx = j.x1 + 20 + hash(k + 400) * 300, sy = Y - 20 - hash(k + 401) * 120, r = 3 + hash(k + 402) * 9; ctx.fillStyle = k % 3 ? 'rgba(153, 27, 27, 0.85)' : 'rgba(220, 38, 38, 0.8)'; ctx.beginPath(); ctx.ellipse(sx, sy, r, r * 0.7, hash(k) * 3, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(sx - 1, sy, 2, r * 2.5); }
    ink(ctx, () => { ctx.ellipse(j.x1 + 250, Y - 6, 12, 3, 0, 0, Math.PI * 2); }, '#1C1917', 1); ink(ctx, () => ctx.roundRect(j.x1 + 244, Y - 13, 12, 7, [3, 3, 0, 0]), '#1C1917', 1); ctx.fillStyle = '#44403C'; ctx.fillRect(j.x1 + 246, Y - 12, 3, 4); // the souvenir hat
    drawFire(ctx, j.x1 + 90, Y - 18, 160, 62, f, { seed: 31 }); drawFire(ctx, j.x1 + 232, Y - 18, 136, 50, f, { seed: 47 });
    if (f % 4 === 0) state.particles.push({ pos: { x: j.x1 + 60 + Math.random() * 200, y: Y - 80 }, vel: { x: (Math.random() - 0.5), y: -1.5 }, life: 40, color: '#44403C', size: 8 + Math.random() * 8 });
    return;
  }
  // (dressed stone: each block lit top left, shadowed bottom right, the mortar between, the odd chip; inked round)
  ctx.fillStyle = '#5E5852'; ctx.fillRect(j.x1, Y - 230, w, 230);
  ctx.save(); ctx.beginPath(); ctx.rect(j.x1, Y - 230, w, 230); ctx.clip();
  for (let y = Y - 230, r = 0; y < Y; y += 20, r++) for (let x = j.x1 + (r % 2) * 20 - 20; x < j.x2; x += 40) {
    const c = hash(x * 0.3 + y) > 0.6 ? '#9C968F' : '#A8A29E';
    ctx.fillStyle = c; ctx.fillRect(x + 1, y + 1, 37, 18);
    ctx.fillStyle = lite(c, 0.25); ctx.fillRect(x + 1, y + 1, 37, 2); ctx.fillRect(x + 1, y + 1, 2, 18);
    ctx.fillStyle = dark(c, 0.25); ctx.fillRect(x + 36, y + 1, 2, 18); ctx.fillRect(x + 1, y + 17, 37, 2);
    if (hash(x + y * 3) < 0.25) { ctx.fillStyle = dark(c, 0.35); ctx.fillRect(x + 8 + hash(x) * 20, y + 6, 4, 2); }
  }
  ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(j.x1 + 0.5, Y - 229.5, w - 1, 230);
  pipe(ctx, j.x1 - 6, Y - 236, w + 12, 12, '#44403C');
  slab(ctx, j.x1 + 57, Y - 215, 226, 42, '#57534E', 2);
  slab(ctx, j.x1 + 60, Y - 212, 220, 36, '#1C1917', 1);
  letter(ctx, 'JAIL', j.x1 + 170, Y - 186, 'bold 18px "Press Start 2P"', '#FACC15', '#854D0E');
  slab(ctx, j.x1 + 78, Y - 166, 184, 14, '#1C1917', 1);
  letter(ctx, 'PHOTOS WITH THE SHERIFF $10', j.x1 + 170, Y - 156, '6px "Press Start 2P"', '#F8FAFC', '#57534E');
  // The cell window, and the guy in it
  const cx = j.x1 + 110, cy = Y - 130;
  slab(ctx, cx - 4, cy - 4, 128, 78, '#78716C', 2);
  ctx.fillStyle = '#0C0A09'; ctx.fillRect(cx, cy, 120, 70);
  ctx.fillStyle = '#1C1917'; ctx.fillRect(cx, cy + 40, 120, 30);
  const shake = Math.sin(f * (town.phase === 'jail' ? 1.3 : 0.6)) * (town.phase === 'jail' ? 5 : 2);
  if (town.prisoner.alive) {
    // Head and shoulders in the window (the souvenir hat, a souvenir tee; his face between two bars), hands up on the
    // bars, yelling
    ctx.save(); ctx.beginPath(); ctx.rect(cx, cy, 120, 70); ctx.clip();
    drawPerson(ctx, cx + 51 + shake, cy + 116.5, PRISONER, { arms: 'up', mouth: town.phase === 'jail' ? 'open' : 'o', f }, 1.33);
    ctx.restore();
  }
  for (let x = cx + 6; x < cx + 120; x += 14) column(ctx, x - 0.5, cy, 5, 70, '#374151');
  pipe(ctx, cx, cy, 120, 4, '#374151'); pipe(ctx, cx, cy + 66, 120, 4, '#374151');
  ctx.fillStyle = '#9CA3AF'; for (let x = cx + 6; x < cx + 120; x += 14) ctx.fillRect(x + 0.5, cy + 4, 1, 62);
  // (his fists round the bars, shaking them)
  if (town.prisoner.alive) for (const [bx, by] of [[cx + 64.3 + shake, cy + 23.4], [cx + 37.7 + shake, cy + 26]]) {
    ink(ctx, () => ctx.roundRect(bx - 4, by - 3.5, 8, 7, 2.5), '#F2C9A0', 0.9);
    ctx.fillStyle = '#D4A27C'; ctx.fillRect(bx - 3, by - 0.5, 6, 0.8);
  }
  // The door, padlocked
  // (iron-strapped planks, rivets, the hinges, the padlock with a glint on it)
  shaded(ctx, () => ctx.rect(j.x2 - 70, Y - 110, 50, 110), '#44403C', j.x2 - 70, Y - 110, 50, 110);
  ctx.fillStyle = '#2E2A27'; for (let x = j.x2 - 60; x < j.x2 - 20; x += 10) ctx.fillRect(x, Y - 108, 1, 108);
  for (const sy of [Y - 96, Y - 56, Y - 20]) { pipe(ctx, j.x2 - 70, sy, 50, 6, '#292524'); ctx.fillStyle = '#A8A29E'; for (let x = j.x2 - 66; x < j.x2 - 22; x += 10) ctx.fillRect(x, sy + 2, 2, 2); }
  ink(ctx, () => { ctx.rect(j.x2 - 36, Y - 60, 8, 10); }, '#FACC15', 1);
  ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(j.x2 - 32, Y - 61, 3, Math.PI, 0); ctx.stroke(); ctx.strokeStyle = '#D1D5DB'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = '#FEF9C3'; ctx.fillRect(j.x2 - 35, Y - 59, 2, 3); ctx.fillStyle = '#A16207'; ctx.fillRect(j.x2 - 33, Y - 55, 2, 3);
};

/** Dale's pharmacy: adobe, a green neon cross, the sign. Its door's his. */
const drawPharmacy = (ctx: Ctx, state: GameState, x: number) => {
  const f = state.frame;
  const w = BOSS_DOOR_X - x + 40;
  // (adobe: banded down the wall, its trowel texture, the dust up the bottom, inked round)
  bandedGradient(ctx, x, Y - 280, w, 280, ['#E2B88E', '#DCAF84', '#D6A77A', '#CC9C6E'], 5);
  ctx.save(); ctx.translate(x, Y - 280);
  ctx.fillStyle = tilePattern(ctx, 'daleAdobe', 34, 26, g => {
    g.fillStyle = '#E8C49C'; for (const [a, b] of [[2, 3], [19, 9], [28, 18], [8, 21], [14, 13]]) g.fillRect(a, b, 3, 1);
    g.fillStyle = '#B8875A'; for (const [a, b] of [[11, 5], [25, 23], [4, 15], [31, 10]]) g.fillRect(a, b, 2, 1);
  });
  ctx.fillRect(0, 0, w, 280);
  ctx.restore();
  checker(ctx, x, Y - 20, w, 20, 'rgba(160, 112, 63, 0.4)');
  ctx.fillStyle = INK; ctx.fillRect(x, Y - 280, 1, 280);
  // (the parapet, rounded off, and the vigas poking out under it, end grain and all)
  pipe(ctx, x - 6, Y - 286, w + 12, 16, '#B5703D');
  for (let k = 0; k < 8; k++) { const vx = x + 20 + k * 52; slab(ctx, vx, Y - 270, 10, 8, '#8B5A2B', 1); ctx.fillStyle = '#C08A55'; ctx.fillRect(vx + 3, Y - 268, 4, 3); ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; ctx.fillRect(vx, Y - 262, 10, 6); }
  slab(ctx, x + 26, Y - 254, w - 52, 54, '#57534E', 2);
  ctx.fillStyle = '#1F2937'; ctx.fillRect(x + 30, Y - 250, w - 60, 46);
  ctx.fillStyle = '#111827'; ctx.fillRect(x + 30, Y - 250, w - 60, 8);
  const on = Math.floor(f / 40) % 6 !== 0;
  if (on) { ctx.fillStyle = 'rgba(74, 222, 128, 0.12)'; ctx.fillRect(x + 34, Y - 240, w - 68, 24); }
  letter(ctx, "DALE'S PHARMACY", x + w / 2 - 10, Y - 222, 'bold 13px "Press Start 2P"', on ? '#4ADE80' : '#14532D', on ? '#14532D' : '#0C1F12');
  letter(ctx, 'WE FILL ANY PRESCRIPTION. NO QUESTIONS.', x + w / 2 - 10, Y - 210, '6px "Press Start 2P"', '#F472B6', '#701A43');
  // The neon cross (in a steel housing; the tubes lit, a stepped glow round it when it's on)
  const cx = x + 60, cy = Y - 160;
  if (on) steppedGlow(ctx, cx, cy, 44, '#4ADE80', 0.28, 0.06, 4);
  const cross = (g: number) => { ctx.rect(cx - 8 - g, cy - 24 - g, 16 + g * 2, 48 + g * 2); ctx.rect(cx - 24 - g, cy - 8 - g, 48 + g * 2, 16 + g * 2); };
  ink(ctx, () => cross(2), '#27272A', 1);
  ctx.fillStyle = '#27272A'; ctx.beginPath(); cross(1); ctx.fill();
  ctx.fillStyle = on ? '#22C55E' : '#14532D'; ctx.beginPath(); cross(0); ctx.fill();
  ctx.fillStyle = on ? '#BBF7D0' : '#166534'; ctx.fillRect(cx - 5, cy - 21, 3, 42); ctx.fillRect(cx - 21, cy - 5, 42, 3);
  if (on) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(cx - 4, cy - 19, 1, 8); }
  drawOpenSign(ctx, x + 132, Y - 160, f);
};

/** The OPEN 24/7 marquee: a Vegas-style board, chasing bulbs round the edge, a neon pill, a starburst, the fine print. */
const drawOpenSign = (ctx: Ctx, x: number, y: number, f: number) => {
  const w = 190, h = 96;
  // The board, gold-framed
  slab(ctx, x - 6, y - 6, w + 12, h + 12, '#B45309', 2);
  slab(ctx, x - 3, y - 3, w + 6, h + 6, '#FACC15', 2);
  bandedGradient(ctx, x, y, w, h, ['#4C1D95', '#3B1A7A', '#2C1A60', '#1E1B4B'], 5);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x - 0.5, y - 0.5, w + 1, h + 1);
  // Bulbs chasing round it
  const bulbs: [number, number][] = [];
  for (let bx = x + 6; bx < x + w; bx += 12) { bulbs.push([bx, y - 1]); }
  for (let by = y + 11; by < y + h; by += 12) bulbs.push([x + w + 1, by]);
  for (let bx = x + w - 6; bx > x; bx -= 12) bulbs.push([bx, y + h + 1]);
  for (let by = y + h - 11; by > y; by -= 12) bulbs.push([x - 1, by]);
  bulbs.forEach(([bx, by], i) => {
    const lit = (i + Math.floor(f / 5)) % 3 === 0;
    if (lit) { ctx.fillStyle = 'rgba(254, 240, 138, 0.35)'; ctx.beginPath(); ctx.arc(bx, by, 5, 0, Math.PI * 2); ctx.fill(); }
    ink(ctx, () => ctx.arc(bx, by, 2.6, 0, Math.PI * 2), lit ? '#FEF9C3' : '#92400E', 0.6);
    if (lit) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(bx - 1.5, by - 1.5, 1, 1); }
  });
  // The neon: OPEN (flickering, the N going now and then), 24/7 big underneath
  const buzz = Math.floor(f / 7) % 23 === 0;
  ctx.textAlign = 'center';
  ctx.font = 'bold 15px "Press Start 2P"';
  ctx.fillStyle = 'rgba(244, 114, 182, 0.35)'; ctx.fillText('OPEN', x + 70, y + 30);
  ctx.fillStyle = '#F9A8D4'; ctx.fillText(buzz ? 'OPE ' : 'OPEN', x + 69, y + 29);
  ctx.font = 'bold 22px "Press Start 2P"';
  ctx.fillStyle = 'rgba(34, 211, 238, 0.35)'; ctx.fillText('24/7', x + 72, y + 61);
  ctx.fillStyle = '#A5F3FC'; ctx.fillText('24/7', x + 70, y + 59);
  // A neon pill, tipped up, and a sparkle off it
  ctx.save(); ctx.translate(x + 158, y + 34); ctx.rotate(-0.5);
  ctx.fillStyle = '#F472B6'; ctx.beginPath(); ctx.roundRect(-16, -8, 16, 16, [8, 0, 0, 8]); ctx.fill();
  ctx.fillStyle = '#FDE047'; ctx.beginPath(); ctx.roundRect(0, -8, 16, 16, [0, 8, 8, 0]); ctx.fill();
  ctx.fillStyle = '#BE185D'; ctx.fillRect(-14, 3, 14, 3); ctx.fillStyle = '#CA8A04'; ctx.fillRect(0, 3, 14, 3);
  ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(-16, -8, 32, 16, 8); ctx.stroke();
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-11, -5, 5, 2);
  ctx.restore();
  const tw = (Math.sin(f * 0.15) + 1) / 2;
  ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + tw * 0.6})`;
  ctx.beginPath(); ctx.moveTo(x + 172, y + 8 - tw * 4); ctx.lineTo(x + 174, y + 14); ctx.lineTo(x + 180 + tw * 4, y + 16); ctx.lineTo(x + 174, y + 18); ctx.lineTo(x + 172, y + 24 + tw * 4); ctx.lineTo(x + 170, y + 18); ctx.lineTo(x + 164 - tw * 4, y + 16); ctx.lineTo(x + 170, y + 14); ctx.fill();
  // The starburst, and the fine print
  ctx.save(); ctx.translate(x + 158, y + 70); ctx.rotate(Math.sin(f * 0.05) * 0.1);
  ink(ctx, () => { for (let k = 0; k < 20; k++) { const r = k % 2 ? 13 : 21, a = (k * Math.PI) / 10; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); }, '#EF4444', 1);
  ctx.fillStyle = '#B91C1C'; ctx.beginPath(); ctx.arc(1, 2, 11, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#FEF08A'; ctx.font = 'bold 6px "Press Start 2P"'; ctx.fillText('NO', 0, -1); ctx.fillText('ID!', 0, 7);
  ctx.restore();
  ctx.fillStyle = '#C4B5FD'; ctx.font = '5px "Press Start 2P"'; ctx.fillText('*EXCEPT DURING RAIDS', x + 70, y + 82);
  ctx.textAlign = 'left';
};

// ---------------------------------------------------------------------------
// Over the terrain: the props, the ninja, the cab, the sheriff
// ---------------------------------------------------------------------------

export const drawTownMid = (ctx: Ctx, state: GameState, rt: DaleRuntime) => {
  const town = rt.town;
  const f = state.frame;
  for (const pr of town.props) if (visible(state, pr.x - 60, pr.x + 60)) drawProp(ctx, pr, f);
  drawNinja(ctx, state, town);
  const cab = town.cab;
  if (cab.state !== 'wrecked' && visible(state, cab.x - 40, cab.x + CAB.w + 40)) {
    const parked = cab.state === 'parked';
    ctx.save();
    if (cab.state === 'spin') { ctx.translate(cab.x + CAB.w / 2, 0); ctx.scale(Math.cos(cab.spin * Math.PI), 1); ctx.translate(-(cab.x + CAB.w / 2), 0); }
    // (Riggs slumped over the wheel from the highway till his second wind)
    const slumped = cab.state === 'arrive' || (parked && town.phase === 'street');
    drawCab(ctx, cab.x, cab.facing, f, false, parked ? 0.1 : 0, wheelTurn(cab.x * cab.facing, cabSpeed(cab) * cab.facing, 26, f), slumped, town.gore);
    ctx.restore();
    ctx.save();
    ctx.restore();
    if (parked && f % 5 === 0) state.particles.push({ pos: { x: cab.x + 20, y: Y - CAB.h + 40 }, vel: { x: 0.3, y: -1 }, life: 40, color: '#57534E', size: 8 });
  }
  // The tourists
  for (const e of town.tourists) {
    if (!visible(state, e.pos.x - 30, e.pos.x + 60)) continue;
    ctx.save(); ctx.translate(e.pos.x + e.width / 2, Y); ctx.scale(e.facing ?? 1, 1); drawDaleKind(ctx, e, f + (e.homeX ?? 0), state); ctx.restore();
  }
  if (town.arrive) drawArrival(ctx, state, town);
  // The "sheriff", till he's off
  const s = town.sheriff;
  if (visible(state, s.x - 40, s.x + 40) && s.x < COURSE.town.x2 - 200) drawSheriff(ctx, s.x, f, s.running);
};

/** Meathead coming in on top of the cab (hanging on for dear life), flung off it, face down on the street. */
const drawArrival = (ctx: Ctx, state: GameState, town: Town) => {
  const a = town.arrive!;
  const p = state.player;
  const riding = town.cab.state === 'arrive';
  const down = a.landedAt >= 0 && a.h <= 0 && a.vh === 0;
  const body = { ...p, pos: { x: -1e6, y: -1e6 }, hidden: false, isGrounded: riding, vel: { x: riding ? -2 : 3, y: riding ? 0 : 4 }, facing: -1 as const, isCharging: false, isSliding: false, isUppercutting: false, isDivekicking: false, isDucking: riding, invincibilityTimer: 0, hurtTimer: riding ? 0 : 30, pushbackTimer: riding ? 0 : 30 };
  ctx.save();
  const rot = down ? Math.PI / 2 : a.rot;
  ctx.translate(a.x + (riding ? Math.sin(state.frame * 0.9) * 2 : 0), Y - a.h - (down ? 14 : p.height / 2));
  ctx.rotate(rot);
  ctx.translate(-(body.pos.x + body.width / 2), -(body.pos.y + body.height / 2));
  drawPlayer(ctx, body, { ...state, deathTimer: 0 }, { currentWeapon: p.currentWeapon, showFilthShield: false, invincibilityEnabled: false });
  ctx.restore();
  // (seeing stars, lying there)
  if (down) for (let k = 0; k < 3; k++) { const ang = state.frame * 0.12 + (k * Math.PI * 2) / 3; ctx.fillStyle = '#FDE047'; ctx.font = 'bold 10px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('*', a.x + 20 + Math.cos(ang) * 18, Y - 30 + Math.sin(ang) * 6); ctx.textAlign = 'left'; }
};

/** A bobtail tractor (Riggs's), facing `facing`, its back end at x; wrecked, or tilted a touch. */
/** How fast the cab's going, px a frame (+ right): backing out of the wall, creeping round, then flat out. */
const cabSpeed = (cab: Town['cab']) =>
  cab.state === 'reverse' ? 3.5 : cab.state === 'spin' || (cab.state === 'go' && cab.speed === 0) ? 1 : cab.state === 'parked' || cab.state === 'wrecked' ? 0 : cab.speed;

export const drawCab = (ctx: Ctx, x: number, facing: 1 | -1, f: number, wrecked: boolean, tilt: number, roll = 0, slumped = false, gore = 0) => {
  ctx.save();
  ctx.translate(x + CAB.w / 2, Y);
  ctx.scale(facing, 1);
  ctx.rotate(tilt * (wrecked ? -1 : 1));
  ctx.translate(-CAB.w / 2, 0);
  const h = CAB.h;
  if (wrecked) ctx.filter = 'brightness(0.35) sepia(0.6)';
  // Sleeper and cab
  redPaint(ctx, () => ctx.rect(0, -h, 130, h - 36), 0, -h, 130, -36, 3);
  ctx.fillStyle = '#FDE047'; ctx.fillRect(4, -h + 90, 122, 4); ctx.fillStyle = '#A16207'; ctx.fillRect(4, -h + 93, 122, 1);
  ctx.fillStyle = '#7F1D1D'; ctx.fillRect(78, -h + 8, 1, h - 48); ctx.fillRect(6, -h + 10, 1, h - 52); // (door seams)
  slab(ctx, 66, -h + 100, 8, 3, '#D1D5DB', 1);
  slab(ctx, 82, -40, 34, 6, '#9CA3AF', 1); // (the step)
  pipe(ctx, -1, -h - 2, 132, 4, '#991B1B');
  // Windshield (the driver: Riggs, bandaged and bloody and grinning)
  ctx.fillStyle = '#1E3A5F'; ctx.fillRect(84, -h + 16, 40, 44);
  ctx.fillStyle = '#2D5285'; ctx.fillRect(84, -h + 16, 40, 8);
  if (!wrecked) {
    ctx.save(); ctx.beginPath(); ctx.rect(84, -h + 16, 40, 44); ctx.clip();
    if (slumped) {
      // Face down on the wheel, the hole in his head
      ctx.save(); ctx.translate(96, -h + 85.4); ctx.rotate(0.45); ctx.translate(-104, h - 77.4);
      drawPerson(ctx, 104, -h + 40 + 68.2, RIGGS, { mouth: 'open', f }, 1.1);
      ctx.restore();
      ink(ctx, () => ctx.arc(109, -h + 49, 2.6, 0, Math.PI * 2), '#7F1D1D', 0.8);
      ctx.fillStyle = '#B91C1C'; ctx.fillRect(108, -h + 50, 2, 8);
      slab(ctx, 98, -h + 56, 24, 4, '#44403C', 1); // the wheel
      ctx.fillStyle = 'rgba(185, 28, 28, 0.75)'; ctx.fillRect(86, -h + 20, 5, 18); ctx.fillRect(96, -h + 26, 3, 12); ctx.fillRect(87, -h + 38, 2, 6); // on the glass
    } else {
      drawPerson(ctx, 104, -h + 40 + 68.2, RIGGS, { mouth: 'grin', f }, 1.1);
      // (the bandage round his head under the cap, bled through)
      ink(ctx, () => ctx.rect(94, -h + 31, 21, 4), '#F8FAFC', 0.8);
      ctx.fillStyle = '#B91C1C'; ctx.fillRect(98, -h + 31, 5, 4); ctx.fillStyle = '#7F1D1D'; ctx.fillRect(99, -h + 35, 2, 3);
      slab(ctx, 108, -h + 56, 16, 4, '#44403C', 1); // the wheel
    }
    ctx.restore();
  }
  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)'; ctx.beginPath(); ctx.moveTo(110, -h + 16); ctx.lineTo(116, -h + 16); ctx.lineTo(96, -h + 60); ctx.lineTo(90, -h + 60); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.strokeRect(83.5, -h + 15.5, 41, 45);
  // Stacks, smoke
  column(ctx, 70, -h - 50, 9, 50, '#D1D5DB'); slab(ctx, 69, -h - 52, 11, 4, '#9CA3AF', 1);
  if (!wrecked) for (let i = 0; i < 3; i++) { const t = ((f * 3 + i * 13) % 40) / 40; exhaust(ctx, 74 - t * 40, -h - 56 - t * 30, 6 + t * 12, t, 0.55); }
  // Hood, grille, bumper, a blazing headlight
  redPaint(ctx, () => ctx.rect(130, -h + 70, CAB.w - 130, h - 106), 130, -h + 70, CAB.w - 130, -36, 3);
  for (let k = 0; k < 4; k++) { ctx.fillStyle = '#7F1D1D'; ctx.fillRect(146 + k * 9, -h + 84, 5, 22); ctx.fillStyle = '#F87171'; ctx.fillRect(146 + k * 9, -h + 84, 5, 1); }
  slab(ctx, CAB.w - 12, -h + 78, 12, 60, '#E5E7EB', 1);
  ctx.fillStyle = '#6B7280'; for (let gy = -h + 82; gy < -h + 136; gy += 4) ctx.fillRect(CAB.w - 11, gy, 10, 1);
  slab(ctx, CAB.w - 20, -46, 26, 12, '#D1D5DB', 1);
  if (!wrecked) { headBeam(ctx, CAB.w, -h + 74, -h + 84, 160, 36, 1, 0.5); ink(ctx, () => ctx.rect(CAB.w - 6, -h + 74, 8, 10), '#FEF08A', 1); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(CAB.w - 5, -h + 75, 3, 3); }
  // No trailer on it: the frame rails out the back, the fifth wheel (the coupling plate) bare on top of them, mud flaps
  pipe(ctx, -78, -58, 80, 12, '#3F3F46');
  slab(ctx, -66, -68, 58, 10, '#52525B', 1);
  ink(ctx, () => { ctx.moveTo(-66, -68); ctx.lineTo(-8, -68); ctx.lineTo(-14, -74); ctx.lineTo(-60, -74); ctx.closePath(); }, '#71717A', 1);
  ctx.fillStyle = '#A1A1AA'; ctx.fillRect(-58, -73, 40, 1);
  ctx.fillStyle = '#18181B'; ctx.fillRect(-72, -71, 18, 5); // the slot the kingpin goes in
  ink(ctx, () => ctx.rect(-20, -66, 6, 4), '#FACC15', 0.6);
  slab(ctx, -82, -50, 8, 36, '#18181B', 1);
  // What's left of the tourists, on the front of it
  if (gore > 0) {
    ctx.fillStyle = `rgba(153, 27, 27, ${0.5 + gore * 0.4})`;
    for (let k = 0; k < Math.ceil(gore * 12); k++) ctx.fillRect(CAB.w - 30 + ((k * 7) % 24), -h + 60 + ((k * 23) % 110), 5 + (k % 3) * 3, 6 + (k % 4) * 6);
    ctx.fillRect(CAB.w - 24, -40, 24, 8 * gore);
    ctx.fillStyle = `rgba(69, 10, 10, ${0.4 + gore * 0.4})`; for (let k = 0; k < Math.ceil(gore * 6); k++) ctx.fillRect(CAB.w - 26 + ((k * 11) % 20), -h + 66 + ((k * 31) % 100), 3, 3);
    if (gore > 0.3) slab(ctx, CAB.w - 18, -h + 120, 10, 4, '#F8FAFC', 1); // a sandal, stuck in the grille
    if (gore > 0.6) ink(ctx, () => ctx.ellipse(CAB.w - 10, -h + 76, 12, 3, 0.3, 0, Math.PI * 2), '#D6B98C', 1); // a hat
  }
  // Wheels (the two drive axles under the fifth wheel, the steer axle up front)
  for (const wx of [-50, 6, CAB.w - 40]) drawTruckWheel(ctx, wx, -26, 26, roll);
  ctx.restore();
};

const drawProp = (ctx: Ctx, pr: TownProp, f: number) => {
  ctx.save();
  ctx.translate(pr.x, pr.y);
  if (pr.flying) ctx.rotate(pr.rot);
  switch (pr.look) {
    case 'barrel':
      // Staves (lit down the left, shadowed down the right), iron hoops, the lid's rim
      ctx.save(); ctx.beginPath(); ctx.ellipse(0, -24, 16, 24, 0, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = '#8B5A2B'; ctx.fillRect(-16, -48, 32, 48);
      ctx.fillStyle = '#A8743E'; ctx.fillRect(-12, -48, 6, 48); ctx.fillStyle = '#C08A55'; ctx.fillRect(-10, -48, 2, 48);
      ctx.fillStyle = '#6B4423'; ctx.fillRect(6, -48, 10, 48);
      ctx.fillStyle = '#4A2E14'; for (const sx of [-6, 0, 6]) ctx.fillRect(sx, -48, 1, 48);
      for (const hy of [-38, -12]) { ctx.fillStyle = '#374151'; ctx.fillRect(-16, hy, 32, 3); ctx.fillStyle = '#6B7280'; ctx.fillRect(-16, hy, 32, 1); }
      ctx.restore();
      ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(0, -24, 16, 24, 0, 0, Math.PI * 2); ctx.stroke();
      break;
    case 'cutout': {
      // A cardboard cowboy with a hole for your face (painted: the hat, the shirt, the vest and star, the boots)
      column(ctx, -4, -20, 8, 20, '#6B4423');
      ink(ctx, () => ctx.rect(-26, -110, 52, 92), '#D6B98C', 1);
      ctx.fillStyle = '#B91C1C'; ctx.fillRect(-22, -84, 44, 60); ctx.fillStyle = '#DC2626'; ctx.fillRect(-22, -84, 12, 60);
      ctx.fillStyle = '#6B4423'; ctx.fillRect(-22, -84, 10, 48); ctx.fillRect(12, -84, 10, 48);
      ctx.fillStyle = '#1C1917'; ctx.fillRect(-22, -28, 44, 8);
      ctx.fillStyle = '#E0AC69'; ctx.fillRect(-14, -106, 28, 22);
      ctx.fillStyle = '#B8996A'; ctx.fillRect(22, -108, 2, 88); // (the cardboard's edge)
      ink(ctx, () => { ctx.ellipse(0, -118, 32, 6, 0, 0, Math.PI * 2); }, '#1C1917', 1);
      ink(ctx, () => ctx.roundRect(-16, -134, 32, 16, [6, 6, 0, 0]), '#1C1917', 1);
      ctx.fillStyle = '#44403C'; ctx.fillRect(-12, -132, 6, 12); ctx.fillStyle = '#A16207'; ctx.fillRect(-16, -122, 32, 3);
      ink(ctx, () => ctx.arc(0, -96, 10, 0, Math.PI * 2), '#0C0A09', 1);
      ink(ctx, () => { for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? 2.2 : 5; ctx.lineTo(-10 + Math.cos(a) * r, -70 + Math.sin(a) * r); } ctx.closePath(); }, '#FACC15', 0.8);
      ctx.fillStyle = '#7F1D1D'; ctx.font = '4px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('SHERIFF DAN', 0, -50); ctx.textAlign = 'left';
      break;
    }
    case 'wagon':
      // A covered wagon: the bed in planks, the canvas in steps over its hoops, spoked wheels with iron tires
      slab(ctx, -60, -44, 120, 24, '#8B5A2B', 2);
      ctx.fillStyle = '#6B4423'; ctx.fillRect(-58, -33, 116, 1);
      ctx.save(); ctx.beginPath(); ctx.moveTo(-56, -44); ctx.quadraticCurveTo(0, -110, 56, -44); ctx.closePath(); ctx.clip();
      ctx.fillStyle = '#F5F0E1'; ctx.fillRect(-56, -80, 112, 36);
      ctx.fillStyle = '#FFFDF5'; ctx.fillRect(-56, -80, 112, 12);
      ctx.fillStyle = '#D6CCAE'; ctx.fillRect(-56, -54, 112, 10);
      ctx.restore();
      ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-56, -44); ctx.quadraticCurveTo(0, -110, 56, -44); ctx.stroke();
      ctx.strokeStyle = '#A8A29E'; ctx.lineWidth = 2; for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(k * 22, -44); ctx.quadraticCurveTo(k * 18, -86, k * 14, -94); ctx.stroke(); }
      for (const wx of [-40, 40]) {
        ctx.strokeStyle = '#3F2410'; ctx.lineWidth = 2; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(wx, -18); ctx.lineTo(wx + Math.cos(k) * 18, -18 + Math.sin(k) * 18); ctx.stroke(); }
        ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(wx, -18, 18, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = '#5A3A1A'; ctx.lineWidth = 4; ctx.stroke();
        ctx.strokeStyle = '#8A8178'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(wx, -18, 19, Math.PI * 1.1, Math.PI * 1.6); ctx.stroke();
        ink(ctx, () => ctx.arc(wx, -18, 4, 0, Math.PI * 2), '#6B4423', 1);
      }
      break;
    case 'hay':
      // A bale: straw in streaks, lit on top, the twine round it
      slab(ctx, -26, -34, 52, 34, '#EAB308', 2);
      ctx.fillStyle = '#CA8A04'; for (let k = 0; k < 5; k++) ctx.fillRect(-24 + k * 11, -34, 2, 34);
      ctx.fillStyle = '#FDE68A'; for (let k = 0; k < 6; k++) ctx.fillRect(-22 + k * 8, -32 + (k % 3) * 9, 4, 1);
      ctx.fillStyle = '#A16207'; ctx.fillRect(-26, -22, 52, 3); ctx.fillRect(-26, -10, 52, 2);
      ctx.fillStyle = '#FACC15'; for (let k = 0; k < 4; k++) ctx.fillRect(-28 + k * 18, -36, 2, 3); // (stray straws)
      break;
    case 'wanted':
      // The poster on its post: curling paper, the mugshot, the reward, nailed up
      column(ctx, -4, -90, 8, 90, '#6B4423');
      ink(ctx, () => ctx.rect(-30, -150, 60, 70), '#FEF3C7', 1);
      ctx.fillStyle = '#F5E2B0'; ctx.fillRect(-29, -88, 58, 7); ctx.fillStyle = '#E7CF96'; ctx.fillRect(22, -149, 7, 10);
      ctx.fillStyle = '#1C1917'; ctx.font = 'bold 6px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('WANTED', 0, -138);
      ink(ctx, () => ctx.rect(-14, -132, 28, 26), '#D6D3D1', 0.8);
      ink(ctx, () => ctx.arc(0, -118, 10, 0, Math.PI * 2), '#E0AC69', 1); ctx.fillStyle = '#1C1917'; ctx.fillRect(-10, -124, 20, 4);
      ctx.fillStyle = '#1C1917'; ctx.fillRect(-4, -118, 2, 2); ctx.fillRect(2, -118, 2, 2); ctx.fillRect(-3, -113, 6, 1);
      ctx.font = '4px "Press Start 2P"'; ctx.fillText('MEATHEAD', 0, -98); ctx.fillText('$5 OBO', 0, -90); ctx.textAlign = 'left';
      ctx.fillStyle = '#57534E'; ctx.fillRect(-1, -148, 2, 2);
      break;
    case 'trough':
      // A water trough: planks banded with iron, the water stepped light to dark, a glint on it
      slab(ctx, -40, -26, 80, 26, '#6B4423', 2);
      ctx.fillStyle = '#4A2E14'; ctx.fillRect(-38, -14, 76, 1);
      for (const bx of [-32, 28]) { ctx.fillStyle = '#374151'; ctx.fillRect(bx, -26, 4, 26); ctx.fillStyle = '#6B7280'; ctx.fillRect(bx, -26, 1, 26); }
      ctx.fillStyle = '#60A5FA'; ctx.fillRect(-36, -24, 72, 6); ctx.fillStyle = '#93C5FD'; ctx.fillRect(-36, -24, 72, 2); ctx.fillStyle = '#2563EB'; ctx.fillRect(-36, -20, 72, 2);
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-10 + (f >> 3) % 20, -23, 4, 1);
      break;
  }
  ctx.restore();
  void f;
};

/** A part of the ninja: black cloth, its folds lit along the top left in slate, inked round. */
const ninjaPart = (ctx: Ctx, path: () => void, c: string, x: number, y: number, w: number, h: number) => {
  ctx.save(); ctx.beginPath(); path(); ctx.clip();
  ctx.fillStyle = c; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#334155'; ctx.fillRect(x, y, w, 2); ctx.fillRect(x, y, 2, h);
  ctx.fillStyle = '#020617'; ctx.fillRect(x + w - 2, y, 2, h);
  ctx.restore();
  ctx.beginPath(); path(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
};

/** The slit in his hood: skin, his eyes in it. */
const ninjaEyes = (ctx: Ctx, x: number, y: number, w: number) => {
  ctx.fillStyle = '#E0AC69'; ctx.fillRect(x, y, w, 3); ctx.fillStyle = '#C08A50'; ctx.fillRect(x, y + 2, w, 1);
  ctx.fillStyle = INK; ctx.fillRect(x + 1, y + 1, 1, 1); ctx.fillRect(x + w - 2, y + 1, 1, 1);
};

/** His red headband, the tails off the back of it streaming (tx: where they start). */
const headband = (ctx: Ctx, x: number, y: number, w: number, f: number, tx: number) => {
  ink(ctx, () => ctx.rect(x, y, w, 3), '#DC2626', 0.6); ctx.fillStyle = '#F87171'; ctx.fillRect(x + 1, y, w - 2, 1);
  const wave = Math.sin(f * 0.2) * 2;
  ink(ctx, () => { ctx.moveTo(x, y); ctx.lineTo(tx, y + wave); ctx.lineTo(tx - 1, y + 2 + wave); ctx.lineTo(x, y + 3); ctx.closePath(); }, '#B91C1C', 0.6);
};

/** The ninja: in black up the tower with his rifle; standing to say his piece; kneeling; face down. */
const drawNinja = (ctx: Ctx, state: GameState, town: Town) => {
  const n = town.ninja;
  const s = ninjaSpot();
  if (!visible(state, s.x - 60, s.x + 60)) return;
  const f = state.frame;
  // (turned to Meathead when he got up there, and that's the way he stays, speech to seppuku to face down)
  ctx.save(); ctx.translate(s.x, s.y); ctx.scale(n.state === 'perch' ? (n.aim ?? -1) : n.face, 1);
  const black = '#111827', dark = '#1F2937';
  if (n.state === 'perch') {
    // (shot at: head down behind the sandbags, just the top of his head and the headband showing)
    if (n.duck) {
      const k = Math.min(1, Math.min(n.duck, DUCK_FOR - n.duck) / 8);
      ctx.beginPath(); ctx.rect(-80, -120, 160, 106); ctx.clip();
      ctx.translate(0, k * 20);
    }
    // Prone-ish, kneeling behind the rifle, sighting down the street
    ninjaPart(ctx, () => { ctx.rect(-12, -26, 24, 14); ctx.rect(-18, -12, 30, 12); }, black, -18, -26, 30, 26);
    ninjaPart(ctx, () => ctx.arc(8, -32, 8, 0, Math.PI * 2), black, 0, -40, 16, 16);
    ninjaEyes(ctx, 10, -34, 6);
    headband(ctx, -2, -38, 12, f, -8);
    pipe(ctx, 4, -24, 50, 4, '#3F3F46'); slab(ctx, 20, -28, 12, 4, '#18181B', 1); slab(ctx, 50, -26, 8, 8, '#18181B', 1);
    ctx.fillStyle = '#93C5FD'; ctx.fillRect(30, -27, 1, 2); // (the scope's glass)
    ctx.fillStyle = 'rgba(239, 68, 68, 0.8)'; ctx.fillRect(58, -23, 2, 2);
  } else {
    const kneel = n.state !== 'speech';
    const slump = n.state === 'dead' ? 1 : n.state === 'kneel' ? Math.min(1, Math.max(0, (n.t - NINJA_CUT - 10) / (NINJA_DONE - NINJA_CUT - 10))) : 0;
    ctx.rotate(slump * 1.2);
    if (!kneel) { ninjaPart(ctx, () => ctx.rect(-8, -30, 7, 30), dark, -8, -30, 7, 30); ninjaPart(ctx, () => ctx.rect(2, -30, 7, 30), dark, 2, -30, 7, 30); }
    else ninjaPart(ctx, () => ctx.rect(-12, -14, 26, 14), dark, -12, -14, 26, 14);
    const top = kneel ? -44 : -60;
    ninjaPart(ctx, () => ctx.rect(-10, top, 20, 30), black, -10, top, 20, 30);
    ctx.fillStyle = '#0B0F19'; ctx.fillRect(-10, top + 12, 20, 3); // (the sash)
    ninjaPart(ctx, () => ctx.arc(0, top - 8, 9, 0, Math.PI * 2), black, -9, top - 17, 18, 18);
    ninjaEyes(ctx, 1, top - 11, 7);
    headband(ctx, -9, top - 15, 18, f, -14);
    if (n.state === 'kneel' || n.state === 'dead') {
      // The short blade, and what it's done
      ink(ctx, () => ctx.rect(4, top + 18, 14, 2), '#E5E7EB', 0.6); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(8, top + 18, 6, 1);
      ink(ctx, () => ctx.rect(2, top + 16, 5, 6), '#7F1D1D', 0.6);
      if (n.t > NINJA_CUT || n.state === 'dead') { ctx.fillStyle = '#991B1B'; ctx.beginPath(); ctx.ellipse(6, 0, 18 + Math.min(20, n.t * 0.2), 3, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#B91C1C'; ctx.beginPath(); ctx.ellipse(4, -1, 10 + Math.min(12, n.t * 0.1), 1.5, 0, 0, Math.PI * 2); ctx.fill(); }
    } else {
      // Bowing, hands together
      ink(ctx, () => ctx.rect(8, top + 10, 6, 6), '#E0AC69', 0.8);
    }
    // His rifle, laid down
    pipe(ctx, -40, -4, 44, 4, '#3F3F46');
  }
  ctx.restore();
};

/** The "sheriff": a white shirt, a costume vest and star, a big hat, a mustache; running for it (arms up) once Riggs shows up. */
const SHERIFF: PersonSpec = {
  skin: '#F2C9A0', hair: { style: 'short', color: '#3F2410' }, face: 'mustache', faceHair: '#3F2410', hat: { style: 'stetson', color: '#D6B98C' },
  top: { style: 'shirt', color: '#F5F5F4' }, legs: { color: '#44403C' }, shoes: '#5B3417',
  extra: c => {
    // (the vest either side, the star on it, the holster)
    for (const vx of [-9, 3]) shaded(c, () => c.roundRect(vx, -52, 6, 25, [3, 3, 1, 1]), '#6B4423', vx, -52, 6, 25, 0.8);
    ink(c, () => { for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? 1.6 : 3.6; c.lineTo(-6 + Math.cos(a) * r, -45 + Math.sin(a) * r); } c.closePath(); }, '#FACC15', 0.6);
    c.fillStyle = '#FEF9C3'; c.fillRect(-7, -47, 1, 1);
    ink(c, () => c.roundRect(-11, -28, 5, 9, 1.5), '#5B3417', 0.7);
  },
};

/** The keys to the cell, on their ring. */
const keys = (ctx: Ctx, hx: number, hy: number, f: number) => {
  const sw = Math.sin(f * 0.3) * 1.5;
  ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(hx + 1, hy + 3, 2.6, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#D1D5DB'; ctx.lineWidth = 1; ctx.stroke();
  for (const k of [-1, 1]) { ink(ctx, () => ctx.roundRect(hx + k * 2 + sw - 0.8, hy + 4, 1.8, 6, 0.5), '#CA8A04', 0.5); ink(ctx, () => ctx.rect(hx + k * 2 + sw + 0.8, hy + 8, 1.6, 1), '#CA8A04', 0.4); }
};

const drawSheriff = (ctx: Ctx, x: number, f: number, running: boolean) => {
  drawPerson(ctx, x, Y - (running ? Math.abs(Math.sin(f * 0.5)) * 2 : 0), SHERIFF,
    running
      ? { arms: 'up', walk: f * 0.5, stride: 1, mouth: 'open', f, prop: (c, hx, hy) => keys(c, hx, hy - 4, f) }
      : { arms: 'hold', mouth: 'smile', f, prop: (c, hx, hy) => keys(c, hx, hy, f) });
};

// ---------------------------------------------------------------------------
// In front of everything: the crosshair, what people are saying
// ---------------------------------------------------------------------------

/** How far down the screen a bubble has to be to clear the HUD. */
const NINJA_BUBBLE_TOP = 130;

export const drawTownFront = (ctx: Ctx, state: GameState, rt: DaleRuntime) => {
  const town = rt.town;
  const f = state.frame;
  const sn = town.sniper;
  const spot = ninjaSpot();
  if (sn.on && !town.ninja.duck && state.deathTimer <= 0) {
    const lock = sn.state === 'lock';
    const k = lock ? sn.t / 46 : 0;
    // The laser from up the tower to the crosshair (all of it's the line of fire; the crosshair's where it stops),
    // blinking: slowly while it's looking for him, fast once it's locked
    const m = muzzle(town.ninja.aim), end = laserEnd(sn);
    const on = lock ? Math.floor(f / 3) % 2 === 0 : Math.floor(f / 12) % 3 !== 0;
    ctx.lineCap = 'round';
    ctx.strokeStyle = `rgba(239, 68, 68, ${on ? (lock ? 0.35 + k * 0.3 : 0.28) : 0.08})`; ctx.lineWidth = lock ? 10 : 7;
    ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(end.x, end.y); ctx.stroke();
    ctx.strokeStyle = on ? (lock ? '#FECACA' : '#F87171') : 'rgba(248, 113, 113, 0.35)'; ctx.lineWidth = lock ? 3 : 2;
    ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(end.x, end.y); ctx.stroke();
    ctx.lineCap = 'butt';
    // The crosshair
    const r = lock ? 34 + (1 - k) * 20 : 34;
    ctx.save(); ctx.translate(sn.x, sn.y);
    if (lock) ctx.rotate(k * Math.PI);
    ctx.strokeStyle = lock ? (f % 6 < 3 ? '#EF4444' : '#FCA5A5') : 'rgba(248, 250, 252, 0.85)'; ctx.lineWidth = lock ? 3 : 2;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-r - 10, 0); ctx.lineTo(-8, 0); ctx.moveTo(8, 0); ctx.lineTo(r + 10, 0); ctx.moveTo(0, -r - 10); ctx.lineTo(0, -8); ctx.moveTo(0, 8); ctx.lineTo(0, r + 10); ctx.stroke();
    ctx.fillStyle = lock ? '#EF4444' : 'rgba(248,250,252,0.85)'; ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    if (lock && Math.floor(f / 5) % 2 === 0) { ctx.fillStyle = '#EF4444'; ctx.font = 'bold 8px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('LOCKED', sn.x, sn.y - r - 16); ctx.textAlign = 'left'; }
  }
  // The shot: a white flash across the screen, a fat tracer down from the tower with the air ripping open around it
  // in rings, a muzzle blast up there, a shock ring where it went in
  const ls = sn.lastShot;
  const since = ls ? f - ls.t : 999;
  if (ls && since < 22) {
    const m = muzzle(town.ninja.aim), dir = town.ninja.aim ?? -1;
    const fade = 1 - since / 22;
    if (since < 3) { ctx.fillStyle = `rgba(255, 255, 255, ${0.55 - since * 0.15})`; ctx.fillRect(state.camera.x, state.camera.y, CANVAS_WIDTH, CANVAS_HEIGHT); }
    ctx.lineCap = 'round';
    ctx.strokeStyle = `rgba(253, 186, 116, ${0.45 * fade})`; ctx.lineWidth = 18 * fade + 2;
    ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(ls.x, ls.y); ctx.stroke();
    ctx.strokeStyle = `rgba(254, 240, 138, ${fade})`; ctx.lineWidth = 6 * fade + 1;
    ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(ls.x, ls.y); ctx.stroke();
    ctx.strokeStyle = `rgba(255, 255, 255, ${fade})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(ls.x, ls.y); ctx.stroke();
    ctx.lineCap = 'butt';
    // The shock rings along its path
    const ang = Math.atan2(ls.y - m.y, ls.x - m.x);
    for (let i = 1; i <= 6; i++) {
      const u = i / 7, rx = m.x + (ls.x - m.x) * u, ry = m.y + (ls.y - m.y) * u;
      ctx.save(); ctx.translate(rx, ry); ctx.rotate(ang);
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 * fade})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(0, 0, 4 + since * 0.6, 8 + since * 2.4, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    // The muzzle blast
    if (since < 8) { ctx.fillStyle = `rgba(255, 247, 200, ${1 - since / 8})`; ctx.beginPath(); ctx.arc(m.x + dir * 10, m.y, 26 - since * 2, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(m.x, m.y - 6); ctx.lineTo(m.x + dir * (70 - since * 6), m.y); ctx.lineTo(m.x, m.y + 6); ctx.fill(); }
    // Where it went in
    if (!ls.covered) {
      ctx.strokeStyle = `rgba(254, 215, 170, ${fade})`; ctx.lineWidth = 4 * fade + 1;
      ctx.beginPath(); ctx.arc(ls.x, ls.y, 10 + since * 5, 0, Math.PI * 2); ctx.stroke();
      if (since < 5) { ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(ls.x, ls.y, 16 - since * 2, 0, Math.PI * 2); ctx.fill(); }
    }
  }
  // Bubbles
  // (kept down below the HUD: up the tower, his head's near the top of the screen)
  const nt = saying(rt.talk, 'ninja'); if (nt) drawBubble(ctx, spot.x, Math.max(spot.y - 80, state.camera.y + NINJA_BUBBLE_TOP), nt, '#F1F5F9');
  const rt2 = saying(rt.talk, 'riggs'); if (rt2) drawBubble(ctx, town.cab.x + CAB.w / 2, Y - CAB.h - 70, rt2, '#FEF3C7');
  const pt = saying(rt.talk, 'prisoner'); if (pt) drawBubble(ctx, COURSE.town.jail.x1 + 170, Y - 250, pt, '#F8FAFC');
  const st = saying(rt.talk, 'sheriff'); if (st) drawBubble(ctx, town.sheriff.x, Y - 100, st, '#FEF9C3');
};

// ---------------------------------------------------------------------------
// Screen space: INCOMING
// ---------------------------------------------------------------------------

export const drawTownHud = (ctx: Ctx, state: GameState, rt: DaleRuntime) => {
  // The jail scene can be skipped
  const tw = rt.town;
  if (tw.phase === 'jail' && tw.crashedAt < 0 && tw.t > JAIL_SKIP_AFTER) drawSkipPrompt(ctx, CANVAS_WIDTH);
  const inc = incoming(state, rt.town);
  if (!inc) return;
  const f = state.frame;
  const W = CANVAS_WIDTH;
  ctx.save();
  // Flashing warnings down both sides
  if (Math.floor(f / 8) % 2 === 0) {
    ctx.fillStyle = 'rgba(239, 68, 68, 0.25)'; ctx.fillRect(0, 0, 40, CANVAS_HEIGHT); ctx.fillRect(W - 40, 0, 40, CANVAS_HEIGHT);
    ctx.textAlign = 'center'; ctx.font = 'bold 26px "Press Start 2P"';
    // (right of the main HUD, clear of it)
    ctx.fillStyle = '#000'; ctx.fillText('!! INCOMING !!', 553, 113); ctx.fillStyle = '#EF4444'; ctx.fillText('!! INCOMING !!', 550, 110);
  }
  // The meter: the cab closing on him, the zone where it's time to go up
  const L = 200, R = 600, y = 140;
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(L - 10, y - 10, R - L + 20, 36);
  ctx.fillStyle = '#374151'; ctx.fillRect(L, y, R - L, 16);
  ctx.fillStyle = 'rgba(34, 197, 94, 0.7)'; ctx.fillRect(L + (R - L) * inc.zone[0], y, (R - L) * (inc.zone[1] - inc.zone[0]), 16);
  ctx.fillStyle = '#EF4444'; ctx.fillRect(L, y, (R - L) * inc.k, 16);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(L + (R - L) * inc.k - 3, y - 6, 6, 28);
  if (inc.jump) {
    ctx.textAlign = 'center'; ctx.font = 'bold 22px "Press Start 2P"';
    ctx.fillStyle = '#000'; ctx.fillText('BOOST JUMP!', W / 2 + 3, y + 63); ctx.fillStyle = f % 6 < 3 ? '#22C55E' : '#BBF7D0'; ctx.fillText('BOOST JUMP!', W / 2, y + 60);
  }
  ctx.restore();
};
