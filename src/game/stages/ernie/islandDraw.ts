// Alcatraz, drawn, past the tour: the cell house (three tiers of cells, the
// galleries in front of them coming down in the quakes, the floor gone into the
// old fort underneath in places, the far end of the block come down in a heap),
// the recreation yard up top (the bleachers, the wall and the guard tower, the
// lighthouse and the water tower, the city across the bay at sunset), the old
// switchback road down the cliffs (a stretch of it washed out into the bay), and
// the citadel: the old fort's brick vaults under the prison, down in the bedrock,
// the flooded cistern. The faults opening in all of it are faultDraw.ts's, with
// the ground they've opened in drawn here.

import type { GameState } from '../../core/state';
import { bandedGradient, hazeBands, steppedGlow, checker, pixelBlob, tilePattern } from '../../render/pixelArt';
import { INK, dark, lite } from '../../render/npc/kit';
import { drawFire } from '../../render/fx/fire';
import type { GroundRun } from '../../core/terrain';
import { runYAt } from '../../core/terrain';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y } from '../../../constants';
import { COURSE, FaultLook } from './course';
import type { ErnieRuntime } from './runtime';
import { tourWrecked } from './alcatraz';
import { faultAmount, collapseState, quakeAmount } from './quake';
import { drawFault } from './faultDraw';
import { DoorCrash, CRASH_X, CAVE_X, CAVE_W, NIGHT_TOUR, dropAmount, crashed, cavedIn, lookingUp, ceilingTear, hipsterY } from './doorCrash';
import { drawTourist, TOURIST_LOOKS, drawHipsterDrilling, drawHipsterDead } from './drawSea';

type Ctx = CanvasRenderingContext2D;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const visible = (state: GameState, x1: number, x2: number) => x2 > state.camera.x - 250 && x1 < state.camera.x + CANVAS_WIDTH + 250;
const Y = GROUND_Y;
const C = COURSE.cellblock, IS = COURSE.island;
/** Where each part is. */
const HOUSE = [C.x1, IS.house], YARD = [IS.house, IS.yard], CITADEL = [IS.yard, C.x2];
const inPart = (x: number, [a, b]: number[]) => x >= a && x < b;
/** The top of the yard wall; the tops of the citadel's vaults. */
const WALL_TOP = Y - 390, VAULT = Y - 230, ROOF = Y - 470;

/** A block lit from the upper left: a light top and left edge, a dark right and bottom, inked round. */
const slab = (ctx: Ctx, x: number, y: number, w: number, h: number, c: string, e = 2) => {
  ctx.fillStyle = c; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = lite(c, 0.3); ctx.fillRect(x, y, w, e); ctx.fillRect(x, y, e, h);
  ctx.fillStyle = dark(c, 0.25); ctx.fillRect(x + w - e, y, e, h); ctx.fillRect(x, y + h - e, w, e);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
};

/** A broken lump (brick, concrete, rock) at (tx, ty) turned `rot`, its box (x, y, w, h) about there: lit along the top, its underside in shadow, inked. */
const chunk = (ctx: Ctx, tx: number, ty: number, rot: number, x: number, y: number, w: number, h: number, c: string) => {
  ctx.save(); ctx.translate(tx, ty); ctx.rotate(rot);
  ctx.fillStyle = INK; ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
  ctx.fillStyle = c; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = lite(c, 0.28); ctx.fillRect(x, y, w, 2); ctx.fillRect(x, y, 2, h * 0.6);
  ctx.fillStyle = dark(c, 0.3); ctx.fillRect(x, y + h - 2, w, 2); ctx.fillRect(x + w - 2, y + 2, 2, h - 2);
  if (w > 12 && h > 6) checker(ctx, x + 2, y + h - 4, w - 4, 2, dark(c, 0.3), 0, 1);
  ctx.restore();
};

/** A pebble or a chip, s square: inked, a lit corner. */
const pebble = (ctx: Ctx, x: number, y: number, s: number, c: string) => {
  ctx.fillStyle = INK; ctx.fillRect(x - 1, y - 1, s + 2, s + 2);
  ctx.fillStyle = c; ctx.fillRect(x, y, s, s);
  ctx.fillStyle = lite(c, 0.35); ctx.fillRect(x, y, Math.ceil(s / 2), 2);
  ctx.fillStyle = dark(c, 0.3); ctx.fillRect(x, y + s - 1, s, 1);
};

/** The guide's lantern: a tin cap and base, the glass, the flame's white heart, the bail over the top. */
const lantern = (ctx: Ctx, x: number, y: number) => {
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y - 6, 4, Math.PI, 0); ctx.stroke();
  ctx.fillStyle = INK; ctx.fillRect(x - 5, y - 7, 10, 14);
  ctx.fillStyle = '#FDE047'; ctx.fillRect(x - 4, y - 4, 8, 8);
  ctx.fillStyle = '#FEF9C3'; ctx.fillRect(x - 2, y - 2, 3, 4);
  ctx.fillStyle = '#57534E'; ctx.fillRect(x - 4, y - 6, 8, 2); ctx.fillRect(x - 4, y + 4, 8, 2);
  ctx.fillStyle = '#A8A29E'; ctx.fillRect(x - 4, y - 6, 3, 1);
  ctx.fillStyle = INK; ctx.fillRect(x - 1, y - 4, 1, 8);
};

// ---------------------------------------------------------------------------
// Behind everything (screen space): out in the yard, the sunset over the bay and the city
// ---------------------------------------------------------------------------

/** True if the yard's in view (the sky's drawn behind it); otherwise it's dark indoors. */
export const drawIslandBackdrop = (ctx: Ctx, state: GameState) => {
  const cx = state.camera.x;
  if (!(cx + CANVAS_WIDTH > YARD[0] - 60 && cx < YARD[1] + 60)) { ctx.fillStyle = '#0E1114'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); return; }
  bandedGradient(ctx, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, ['#3B1F4A', '#78305A', '#B4436C', '#D87058', '#F59E62', '#FCD9A0', '#FCD9A0', '#FCD9A0'], 18);
  // The sun going down over the Golden Gate (what's left of it, smoking): a disc in rings of its own light, a bar of
  // cloud across its face
  const hz = 330 - Math.max(-60, Math.min(60, (state.camera.y - (Y - 790)) * 0.12));
  const sx = Math.round(640 - cx * 0.02 % 200), sy = hz - 20;
  steppedGlow(ctx, sx, sy, 110, '#FDE68A', 0.4, 0, 5);
  ctx.fillStyle = '#FEF08A'; ctx.beginPath(); ctx.arc(sx, sy, 30, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFFBEB'; ctx.beginPath(); ctx.arc(sx - 4, sy - 4, 20, 0, Math.PI * 2); ctx.fill();
  checker(ctx, sx - 30, sy + 8, 60, 4, '#FDE68A');
  ctx.fillStyle = '#E88A6A'; ctx.fillRect(sx - 52, sy + 2, 90, 4); ctx.fillRect(sx - 20, sy - 12, 70, 3);
  ctx.fillStyle = '#FDBA8C'; ctx.fillRect(sx - 44, sy + 1, 60, 1); ctx.fillRect(sx - 14, sy - 13, 40, 1);
  checker(ctx, sx - 60, sy + 2, 8, 4, '#E88A6A'); checker(ctx, sx + 38, sy + 2, 8, 4, '#E88A6A', 1);
  const par = (k: number, w: number) => ((-cx * k) % w + w) % w;
  // The city across the water: the skyline, the pyramid, the tower on the hill, some of it burning. Each tower lit
  // down the side toward the sun, a window or two catching it, the odd water tank and mast on the roofs
  const city = '#4A2A4F', rim = '#9A4A62', shade = '#3A2040';
  const o = par(0.08, 900);
  for (let rep = -1; rep < 2; rep++) {
    const bx = Math.round(o + rep * 900);
    for (let i = 0; i < 30; i++) {
      const h = Math.round(18 + hash(i) * 60), w = Math.round(16 + hash(i + 9) * 20), x = bx + i * 30;
      ctx.fillStyle = city; ctx.fillRect(x, hz - h, w, h);
      ctx.fillStyle = shade; ctx.fillRect(x, hz - h, 2, h);
      ctx.fillStyle = rim; ctx.fillRect(x + w - 2, hz - h, 2, h); ctx.fillRect(x, hz - h, w, 1);
      checker(ctx, x + w - 4, hz - h, 2, h, rim);
      if (hash(i + 30) < 0.35) { ctx.fillStyle = city; ctx.fillRect(x + 3, hz - h - 6, 6, 6); ctx.fillStyle = rim; ctx.fillRect(x + 7, hz - h - 6, 2, 6); }
      if (hash(i + 40) < 0.25) { ctx.fillStyle = city; ctx.fillRect(x + w - 6, hz - h - 14, 1, 14); }
      ctx.fillStyle = '#FCD9A0';
      for (let k = 0; k < 3; k++) if (hash(i * 7 + k) < 0.3) ctx.fillRect(x + 4 + Math.round(hash(i * 3 + k) * (w - 8)), hz - h + 6 + k * 12, 2, 2);
    }
    // (the pyramid, its lit face; the tower on the hill)
    ctx.fillStyle = city; ctx.beginPath(); ctx.moveTo(bx + 380, hz); ctx.lineTo(bx + 400, hz - 120); ctx.lineTo(bx + 420, hz); ctx.fill();
    ctx.fillStyle = rim; ctx.beginPath(); ctx.moveTo(bx + 400, hz - 120); ctx.lineTo(bx + 420, hz); ctx.lineTo(bx + 410, hz); ctx.fill();
    ctx.fillStyle = shade; ctx.fillRect(bx + 396, hz - 60, 2, 60);
    ctx.fillStyle = city; ctx.fillRect(bx + 640, hz - 90, 10, 90); ctx.fillRect(bx + 638, hz - 92, 14, 6);
    ctx.fillStyle = rim; ctx.fillRect(bx + 648, hz - 90, 2, 90); ctx.fillRect(bx + 638, hz - 92, 14, 1);
    ctx.fillStyle = '#FCD9A0'; ctx.fillRect(bx + 642, hz - 88, 2, 2); ctx.fillRect(bx + 646, hz - 88, 2, 2);
    drawFire(ctx, bx + 227, hz - 32, 16, 16, state.frame, { seed: 3, sparks: false, glow: 1.5 }); drawFire(ctx, bx + 525, hz - 24, 12, 12, state.frame, { seed: 8, sparks: false, glow: 1.5 });
    // (its smoke, a column leaning off with the wind)
    const t = (state.frame * 0.2 % 40) / 40;
    pixelBlob(ctx, bx + 227, hz - 70 - t * 40, 16, 14, 'rgba(80, 60, 70, 0.5)');
    pixelBlob(ctx, bx + 233, hz - 100 - t * 40, 20, 14, 'rgba(80, 60, 70, 0.35)');
    pixelBlob(ctx, bx + 242, hz - 130 - t * 40, 24, 14, 'rgba(80, 60, 70, 0.2)');
  }
  // (the city fading into the haze over the water)
  hazeBands(ctx, 0, hz - 60, CANVAS_WIDTH, 60, '#F59E62', 0, 0.45, 6);
  // The bay; the sun's road across it, glints breaking up the further they come; the swell's lines
  bandedGradient(ctx, 0, hz, CANVAS_WIDTH, CANVAS_HEIGHT - hz, ['#E2917A', '#A86A7C', '#6E4A7A', '#4A3A62', '#2E3254', '#1E2A4A'], 14);
  for (let i = 0; i < 14; i++) {
    const y = hz + 4 + i * 10, w = 50 - i * 2;
    ctx.fillStyle = i < 5 ? '#FEF3C7' : '#FCD9A0';
    for (let k = 0; k < 3; k++) { const gx = sx - w / 2 + Math.round(hash(i * 3 + k + Math.floor(state.frame / 12)) * w); ctx.fillRect(gx, y, 4 + (k % 2) * 4, 2); }
  }
  for (let i = 0; i < 16; i++) {
    const y = hz + 8 + i * 16, x = (par(0.2, 800) + i * 97) % 800, w = 30 + (i % 3) * 12;
    ctx.fillStyle = 'rgba(254, 215, 170, 0.35)'; ctx.fillRect(x, y, w, 2);
    ctx.fillStyle = 'rgba(30, 42, 74, 0.35)'; ctx.fillRect(x + 4, y + 2, w - 8, 2);
  }
};

// ---------------------------------------------------------------------------
// Behind the terrain: the cell house, the yard, the cliffs, the citadel
// ---------------------------------------------------------------------------

export const drawIslandBack = (ctx: Ctx, state: GameState, rt: ErnieRuntime) => {
  const cx = state.camera.x;
  if (cx < HOUSE[1] + 60) drawHouse(ctx, state, rt);
  if (cx + CANVAS_WIDTH > YARD[0] - 100 && cx < YARD[1] + 100) drawYard(ctx, state);
  if (cx + CANVAS_WIDTH > CITADEL[0] - 60) drawCitadel(ctx, state);
  // The ground, and the faults opening in it
  for (const r of state.groundRuns) if (r.x2 > C.x1 && visible(state, r.x1, r.x2)) drawGround(ctx, state, r);
  drawPits(ctx, state);
  COURSE.faults.forEach((f, i) => {
    if (!f.look || f.look === 'street' || !visible(state, f.x - 80, f.x + f.w + 80)) return;
    const since = state.frame - (rt.quakes.faults[i].openedAt ?? -999);
    drawFault(ctx, state, f, i, faultAmount(rt.quakes, i), since, r => drawSurface(ctx, state, r, f.look!));
  });
  // The galleries (and the tower's walk, the gun ports), some of them giving way
  COURSE.ledges.forEach((l, i) => {
    if (l.x < C.x1 || !visible(state, l.x, l.x + l.w)) return;
    const k = collapseState(rt.quakes, i);
    if (k.gone && k.fallY > 1200) return;
    ctx.save();
    if (k.gone) { ctx.translate(l.x + l.w / 2, l.y + k.fallY); ctx.rotate(Math.min(0.6, k.fallY * 0.004)); ctx.translate(-l.x - l.w / 2, -l.y); }
    else if (k.k > 0) ctx.translate(Math.sin(state.frame * 1.9 + i) * 2 * k.k, Math.sin(state.frame * 1.3) * k.k * 1.5);
    if (inPart(l.x, HOUSE)) drawGallery(ctx, l.x, l.y, l.w, k.k > 0 && !k.gone);
    else if (inPart(l.x, YARD)) drawTowerWalk(ctx, l.x, l.y, l.w);
    else drawGunPort(ctx, l.x, l.y, l.w, k.k > 0 && !k.gone);
    ctx.restore();
  });
  if (visible(state, CAVE_X - 100, C.x2)) drawDoorCrash(ctx, state, rt.doorCrash);
  void quakeAmount;
};

// ---------------------------------------------------------------------------
// Outside Ernie's door: the night tour, the goon coming down on it, the vault caving in behind
// ---------------------------------------------------------------------------

const drawDoorCrash = (ctx: Ctx, state: GameState, dc: DoorCrash) => {
  const f = state.frame, x = CRASH_X;
  // The vault over them, torn open: cracks spreading, then a ragged hole up through the brick and the bedrock
  const tear = ceilingTear(dc);
  if (tear > 0) {
    // (each crack a dark line with the brick's broken lip lit under it)
    for (const [c, dy] of [['#B07A62', 1], ['#140C08', 0]] as const) {
      ctx.strokeStyle = c; ctx.lineWidth = 2;
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI - Math.PI, len = 30 + tear * 140 + hash(i + 200) * 40;
        ctx.beginPath(); ctx.moveTo(x, VAULT + 4 + dy);
        ctx.lineTo(x + Math.cos(a) * len * 0.5 + (hash(i + 201) - 0.5) * 20, VAULT + 4 + Math.abs(Math.sin(a)) * len * 0.25 + 10 + dy);
        ctx.lineTo(x + Math.cos(a) * len, VAULT + 4 + Math.abs(Math.sin(a)) * len * 0.3 + 20 * hash(i + 202) + dy);
        ctx.stroke();
      }
    }
    if (tear > 0.12) {
      // The tunnel he's burrowed down through the bedrock from off the top of the view, as far as he's got (then on
      // through the vault)
      const w = 70 + (tear - 0.12) / 0.88 * 60, top = state.camera.y - 20;
      const bottom = crashed(dc) ? VAULT + 30 : Math.min(VAULT + 30, hipsterY(dc) + 6);
      if (bottom > top) {
        ctx.fillStyle = '#050303';
        ctx.beginPath(); ctx.moveTo(x - w * 0.6, top);
        for (let k = 0; k <= 10; k++) { const yy = top + (bottom - top) * (k / 10); ctx.lineTo(x - w * (0.5 + 0.2 * hash(k + 210)), yy); }
        for (let k = 10; k >= 0; k--) { const yy = top + (bottom - top) * (k / 10); ctx.lineTo(x + w * (0.5 + 0.2 * hash(k + 220)), yy); }
        ctx.closePath(); ctx.fill();
        // Its walls: the bedrock's layers cut through (each step a stratum, lit on its broken face), broken lips
        const seg = (bottom - top) / 10;
        for (let k = 0; k < 10; k++) {
          const yy = top + seg * k, tone = ['#4A3428', '#5A4032', '#3E2C22'][k % 3];
          const lx = x - w * (0.5 + 0.2 * hash(k + 210)), rx = x + w * (0.5 + 0.2 * hash(k + 220));
          ctx.fillStyle = INK; ctx.fillRect(lx - 5, yy, 8, seg); ctx.fillRect(rx - 3, yy, 8, seg);
          ctx.fillStyle = tone; ctx.fillRect(lx - 4, yy, 6, seg); ctx.fillRect(rx - 2, yy, 6, seg);
          ctx.fillStyle = lite(tone, 0.25); ctx.fillRect(lx - 4, yy, 6, 2); ctx.fillRect(rx - 2, yy, 2, seg);
          ctx.fillStyle = dark(tone, 0.4); ctx.fillRect(lx, yy + 2, 2, seg - 2);
          checker(ctx, lx - 4, yy + seg - 2, 6, 2, '#050303'); checker(ctx, rx - 2, yy + seg - 2, 6, 2, '#050303', 1);
        }
      }
      // Broken brick hanging off its edges
      for (let k = 0; k < 8; k++) {
        const side = k % 2 ? 1 : -1, bx = x + side * w * (0.5 + 0.15 * hash(k + 230)), by = VAULT + 10 + hash(k + 231) * 30;
        chunk(ctx, bx, by, (hash(k + 232) - 0.5) * 1.2, -9, -4, 18, 8, k % 3 ? '#7C4A3A' : '#5A3526');
      }
      // Dust pouring down out of it, a dithered curtain thinning out toward the floor, grit falling through it
      const dust = crashed(dc) ? 0.12 : 0.28;
      ctx.save();
      ctx.beginPath(); ctx.moveTo(x - w * 0.4, VAULT + 30); ctx.lineTo(x + w * 0.4, VAULT + 30); ctx.lineTo(x + w * 0.8, Y); ctx.lineTo(x - w * 0.8, Y); ctx.clip();
      hazeBands(ctx, x - w * 0.8, VAULT + 30, w * 1.6, Y - VAULT - 30, '#A8A29E', dust * 1.3, dust * 0.6, 6);
      ctx.fillStyle = 'rgba(214, 211, 209, 0.6)';
      for (let i = 0; i < 14; i++) ctx.fillRect(x + (hash(i + 240) - 0.5) * w, VAULT + 30 + ((f * (2 + hash(i) * 2) + hash(i + 241) * 400) % (Y - VAULT - 30)), 2, 2);
      ctx.restore();
    }
  }
  if (!crashed(dc)) {
    // The night tour, stood listening (looking up, once they hear him coming); the guide's lantern
    NIGHT_TOUR.forEach((tr, i) => {
      ctx.save(); ctx.translate(x + tr.dx, Y);
      if (tr.look === 'guide') ctx.scale(-1, 1);
      drawTourist(ctx, tr.look, i, f, lookingUp(dc));
      ctx.restore();
    });
    steppedGlow(ctx, x + 118, Y - 44, 70, '#FDE047', 0.22, 0.03, 4);
    lantern(ctx, x + 118, Y - 45);
    // The hipster, on his way down through the vault, nose first
    const k = dropAmount(dc);
    if (k >= 0) {
      const hy = hipsterY(dc);
      drawHipsterDrilling(ctx, x, hy - 50, f);
      // Chunks of rock round him as he drills down
      for (let i = 0; i < 10; i++) pebble(ctx, Math.round(x + (hash(i + f % 7) - 0.5) * 90), Math.round(hy - 20 - hash(i + 3) * 60), 7, i % 2 ? '#57534E' : '#4A3428');
      if (hy > VAULT) for (let i = 0; i < 10; i++) pebble(ctx, Math.round(x + (hash(i) - 0.5) * 120), Math.round(VAULT + 4 + (hy - VAULT) * (0.5 + hash(i + 3) * 0.5)), 6, i % 2 ? '#7C4A3A' : '#A8A29E');
    }
  } else {
    // What's left: a crater, the hipster drilled into the floor in the middle of it, legs up, his ski snapped off burning, the tour all over the place
    // (scorched floor out round it in rings, then the hole: its lip chipped, its throat black)
    ctx.fillStyle = 'rgba(20, 16, 14, 0.45)'; ctx.beginPath(); ctx.ellipse(x, Y + 2, 180, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(20, 16, 14, 0.6)'; ctx.beginPath(); ctx.ellipse(x, Y + 2, 130, 9, 0, 0, Math.PI * 2); ctx.fill();
    checker(ctx, x - 180, Y - 2, 50, 4, 'rgba(20, 16, 14, 0.5)'); checker(ctx, x + 130, Y - 2, 50, 4, 'rgba(20, 16, 14, 0.5)', 1);
    ctx.fillStyle = '#1C1917'; ctx.beginPath(); ctx.ellipse(x, Y + 4, 70, 10, 0, 0, Math.PI); ctx.fill();
    ctx.fillStyle = '#0A0807'; ctx.beginPath(); ctx.ellipse(x, Y + 4, 54, 7, 0, 0, Math.PI); ctx.fill();
    for (let i = 0; i < 9; i++) pebble(ctx, Math.round(x - 74 + i * 18 + hash(i + 70) * 6), Y - 2 + Math.round(hash(i + 71) * 3), 4 + Math.round(hash(i + 72) * 3), i % 2 ? '#57534E' : '#7C4A3A');
    // (blood: pools across the floor, a wet glint on each; splashed up the vault, running down)
    for (let i = 0; i < 12; i++) {
      const bx = x + (hash(i + 50) - 0.5) * 420, rw = 14 + hash(i + 51) * 20;
      ctx.fillStyle = 'rgba(127, 29, 29, 0.85)'; ctx.beginPath(); ctx.ellipse(bx, Y + 1, rw, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(69, 10, 10, 0.8)'; ctx.fillRect(bx - rw * 0.6, Y + 2, rw * 1.2, 1);
      ctx.fillStyle = 'rgba(254, 202, 202, 0.5)'; ctx.fillRect(bx - rw * 0.4, Y, 3, 1);
    }
    for (let i = 0; i < 8; i++) {
      const bx = Math.round(x + (hash(i + 60) - 0.5) * 460), by = Math.round(Y - 40 - hash(i + 61) * 150), sw = Math.round(5 + hash(i) * 8), run = Math.round(10 + hash(i + 3) * 14);
      ctx.fillStyle = '#7F1D1D'; ctx.fillRect(bx, by, sw, 3); ctx.fillRect(bx + 2, by, 2, run);
      ctx.fillStyle = '#991B1B'; ctx.fillRect(bx, by, sw - 2, 1);
      ctx.fillStyle = '#450A0A'; ctx.fillRect(bx + 1, by + run, 3, 2);
    }
    drawFire(ctx, x - 6, Y - 6, 76, 38, f, { seed: Math.floor(x) });
    for (let i = 0; i < 4; i++) {
      const t = ((f * 0.7 + i * 50) % 200) / 200;
      pixelBlob(ctx, x + t * 20, Y - 40 - t * 180, 14 + t * 30, (14 + t * 30) * 0.8, `rgba(40, 36, 34, ${(0.5 * (1 - t)).toFixed(3)})`);
    }
    // The tour, in a heap in the crater (charred, tangled, a limb or two sticking out), and the hipster sprawled across
    // the top of the lot of them, front and center
    const heap = [[-46, 0, 0.1], [0, 0, -0.08], [44, 0, 0.12], [-24, -10, -0.25], [22, -11, 0.3], [-2, -20, 0.05], [30, -21, -0.2]];
    NIGHT_TOUR.forEach((tr, i) => {
      const [dx, dy, rot] = heap[i % heap.length], L = TOURIST_LOOKS[tr.look];
      ctx.save(); ctx.translate(x + dx, Y + dy); ctx.rotate(rot + (i % 2 ? Math.PI : 0));
      // (charred: the body inked, a burnt sheen along its top, cracks glowing, a scrap of shirt left)
      const len = L.h * 0.8;
      ctx.fillStyle = INK; ctx.fillRect(-L.h * 0.4 - 1, -11, len + 2, 12);
      ctx.beginPath(); ctx.arc(L.h * 0.4, -6, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1C1917'; ctx.fillRect(-L.h * 0.4, -10, len, 10);
      ctx.beginPath(); ctx.arc(L.h * 0.4, -6, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#44403C'; ctx.fillRect(-L.h * 0.4, -10, len, 2); ctx.fillRect(L.h * 0.4 - 3, -11, 4, 2);
      ctx.fillStyle = (f + i * 9) % 40 < 20 ? '#F97316' : '#B45309';
      ctx.fillRect(-L.h * 0.1, -6, 3, 1); ctx.fillRect(L.h * 0.15, -4, 1, 3); ctx.fillRect(-L.h * 0.3, -3, 2, 1);
      ctx.fillStyle = L.shirt; ctx.globalAlpha = 0.5; ctx.fillRect(-L.h * 0.2, -9, L.h * 0.3, 5); ctx.globalAlpha = 1;
      checker(ctx, -L.h * 0.2, -9, L.h * 0.3, 5, '#1C1917', 0, 1);
      if (i % 3 === 0) {
        ctx.save(); ctx.translate(-L.h * 0.3, -8); ctx.rotate(-1.1);
        ctx.fillStyle = INK; ctx.fillRect(-1, -3, 20, 6); ctx.fillStyle = '#1C1917'; ctx.fillRect(0, -2, 18, 4); ctx.fillStyle = '#44403C'; ctx.fillRect(0, -2, 18, 1);
        ctx.restore();
      }
      ctx.restore();
    });
    drawHipsterDead(ctx, x + 6, Y - 30, f);
    // The guide's lantern, on its side, still lit
    steppedGlow(ctx, x + 230, Y - 5, 26, '#FDE047', 0.25, 0.05, 3);
    ctx.save(); ctx.translate(x + 230, Y - 5); ctx.rotate(1.3); lantern(ctx, 0, 0); ctx.restore();
  }
  if (cavedIn(dc)) {
    // The vault behind him, come down: a heap of brick and bedrock floor to roof, lit down its left, slabs and brick
    // jammed in it every which way
    const cx = CAVE_X + CAVE_W / 2;
    const heap = () => { ctx.beginPath(); ctx.moveTo(cx - 90, Y); ctx.lineTo(cx - 50, Y - 150); ctx.lineTo(cx - 30, VAULT - 20); ctx.lineTo(cx + 30, VAULT - 20); ctx.lineTo(cx + 50, Y - 140); ctx.lineTo(cx + 66, Y); ctx.closePath(); };
    ctx.save(); heap(); ctx.clip();
    ctx.fillStyle = '#2A1C16'; ctx.fillRect(cx - 90, VAULT - 20, 156, Y - VAULT + 20);
    ctx.fillStyle = '#3A2820'; ctx.fillRect(cx - 90, VAULT - 20, 50, Y - VAULT + 20);
    checker(ctx, cx - 40, VAULT - 20, 6, Y - VAULT + 20, '#3A2820');
    ctx.fillStyle = '#1C120D'; ctx.fillRect(cx + 30, VAULT - 20, 40, Y - VAULT + 20);
    checker(ctx, cx + 24, VAULT - 20, 6, Y - VAULT + 20, '#1C120D', 1);
    ctx.restore();
    heap(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
    for (let i = 0; i < 34; i++) {
      const s2 = hash(i + 90), yy = Y - hash(i + 91) * 240, spread = 30 + (Y - yy) * -0.25 + 60;
      chunk(ctx, cx + (hash(i + 92) - 0.5) * spread * 1.4, yy, s2 * 3, -10, -6, 20 + s2 * 10, 12, s2 < 0.4 ? '#7C4A3A' : s2 < 0.7 ? '#5A3526' : '#57534E');
    }
    // Dust still settling
    const since = dc.phase === 'done' ? 999 : state.frame;
    if (since < 999) { pixelBlob(ctx, cx, Y - 120, 110, 100, 'rgba(168, 162, 158, 0.18)'); pixelBlob(ctx, cx - 10, Y - 100, 80, 70, 'rgba(168, 162, 158, 0.12)'); }
  }
};

/** A painted sign board on its frame: a lit top edge, a shadowed bottom, bolts in the corners, the lettering with its shadow. */
const signBoard = (ctx: Ctx, x: number, y: number, w: number, h: number, text: string, size: number, board = '#1C1917', ink_ = '#F5F5F4') => {
  ctx.fillStyle = INK; ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
  ctx.fillStyle = board; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = lite(board, 0.18); ctx.fillRect(x, y, w, 2);
  ctx.fillStyle = dark(board, 0.4); ctx.fillRect(x, y + h - 2, w, 2);
  ctx.fillStyle = '#78716C'; for (const [bx, by] of [[x + 3, y + 3], [x + w - 5, y + 3], [x + 3, y + h - 5], [x + w - 5, y + h - 5]]) ctx.fillRect(bx, by, 2, 2);
  ctx.font = `bold ${size}px "Press Start 2P"`; ctx.textAlign = 'center';
  const ty = y + h / 2 + size / 2;
  ctx.fillStyle = '#000000'; ctx.fillText(text, x + w / 2 + 1, ty + 1);
  ctx.fillStyle = ink_; ctx.fillText(text, x + w / 2, ty);
  ctx.textAlign = 'left';
};

/** The cell house: the back wall, the skylights (one smashed in once the tour's over), three tiers of cells, the end wall. */
const drawHouse = (ctx: Ctx, state: GameState, rt: ErnieRuntime) => {
  const x1 = Math.max(HOUSE[0] - 60, state.camera.x - 20), x2 = Math.min(HOUSE[1], state.camera.x + CANVAS_WIDTH + 20);
  if (x2 <= x1) return;
  const top = state.camera.y - 20;
  const wrecked = tourWrecked(rt.tour);
  // (concrete, poured in lifts: lighter up where the skylights' light falls, grey-green down by the tiers, the lift
  // joints across it, a stain run down from the roof here and there)
  bandedGradient(ctx, x1, top, x2 - x1, Y - top, ['#6A776F', '#647169', '#5E6B63', '#58655D', '#525F57'], 8);
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let y = Math.floor(top / 48) * 48; y < Y; y += 48) ctx.fillRect(x1, y, x2 - x1, 2);
  ctx.fillStyle = 'rgba(255,255,255,0.05)'; for (let y = Math.floor(top / 48) * 48 + 2; y < Y; y += 48) ctx.fillRect(x1, y, x2 - x1, 1);
  for (let x = Math.floor(x1 / 160) * 160; x < x2; x += 160) {
    ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.fillRect(x, top, 2, Y - top);
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(x + 2, top, 1, Y - top);
    // (a stain: a darker core, its edges dithered, breaking up at the bottom)
    const sx = x + 20 + Math.round(hash(x) * 100), len = 40 + Math.round(hash(x * 3) * 160);
    ctx.fillStyle = 'rgba(30, 36, 33, 0.2)'; ctx.fillRect(sx, top, 6, len);
    ctx.fillStyle = 'rgba(30, 36, 33, 0.14)'; ctx.fillRect(sx + 1, top, 3, len + 8);
    checker(ctx, sx - 2, top, 2, len, 'rgba(30, 36, 33, 0.2)'); checker(ctx, sx + 6, top, 2, len - 10, 'rgba(30, 36, 33, 0.2)', 1);
    checker(ctx, sx, top + len, 6, 12, 'rgba(30, 36, 33, 0.2)');
  }
  // Roof trusses and the skylights (one of them smashed in, afterwards): the roof's boards dark overhead
  const rtop = Math.max(top, ROOF - 400);
  ctx.fillStyle = '#2B3330'; ctx.fillRect(x1, rtop, x2 - x1, ROOF - rtop);
  ctx.fillStyle = '#242B28'; for (let y = Math.floor(rtop / 12) * 12; y < ROOF - 40; y += 12) ctx.fillRect(x1, y, x2 - x1, 2);
  checker(ctx, x1, ROOF - 44, x2 - x1, 4, '#3A4440');
  for (let x = Math.floor(x1 / 200) * 200; x < x2; x += 200) {
    const broken = wrecked && Math.abs(x + 100 - C.crashX) < 110;
    const gx = x + 40, gy = ROOF - 36;
    ctx.fillStyle = INK; ctx.fillRect(gx - 2, gy - 2, 124, 34);
    if (!broken) {
      // (wired glass: the evening sky in bands through it, a glint across, the glazing bars)
      bandedGradient(ctx, gx, gy, 120, 30, ['#C9B8C4', '#A8A6B8', '#8FA3B0', '#7A8E9B'], 4);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      for (let k = 0; k < 4; k++) { ctx.fillRect(gx + 6 + k * 30, gy + 20, 2, 2); ctx.fillRect(gx + 8 + k * 30, gy + 18, 2, 2); ctx.fillRect(gx + 10 + k * 30, gy + 16, 2, 2); }
      for (let k = 1; k < 4; k++) { ctx.fillStyle = '#2B3330'; ctx.fillRect(gx + k * 30, gy, 3, 30); ctx.fillStyle = '#4A5550'; ctx.fillRect(gx + k * 30, gy, 1, 30); }
      ctx.fillStyle = '#4A5550'; ctx.fillRect(gx, gy, 120, 1);
    } else {
      ctx.fillStyle = '#0B1220'; ctx.fillRect(gx, gy, 120, 30);
      ctx.fillStyle = '#1B2540'; ctx.fillRect(gx, gy, 120, 8); checker(ctx, gx, gy + 8, 120, 2, '#1B2540');
      // (what's left of the glass, jagged in the frame)
      const shard = (pts: number[][]) => {
        ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) ctx.lineTo(p[0], p[1]); ctx.closePath();
        ctx.fillStyle = '#8FA3B0'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
      };
      shard([[gx, gy], [gx + 22, gy + 16], [gx, gy + 30]]);
      shard([[gx + 120, gy], [gx + 98, gy + 10], [gx + 120, gy + 26]]);
      ctx.fillStyle = '#C9D6DE'; ctx.fillRect(gx + 2, gy + 4, 2, 6); ctx.fillRect(gx + 116, gy + 4, 2, 4);
      // The light coming in through the hole, in steps, dust hanging in it
      ctx.save();
      ctx.beginPath(); ctx.moveTo(gx, ROOF - 6); ctx.lineTo(gx + 120, ROOF - 6); ctx.lineTo(x + 200, Y); ctx.lineTo(x + 10, Y); ctx.clip();
      hazeBands(ctx, x + 10, ROOF - 6, 190, Y - ROOF + 6, '#FDE68A', 0.16, 0.05, 7);
      ctx.fillStyle = 'rgba(254, 243, 199, 0.5)';
      for (let i = 0; i < 10; i++) ctx.fillRect(x + 30 + Math.round(hash(i + x) * 140), ROOF + ((state.frame * 0.3 + hash(i + x + 1) * 470) % (Y - ROOF)), 2, 2);
      ctx.restore();
    }
    // (the truss over it: a post, the bottom chord, gusset plates riveted on)
    ctx.fillStyle = INK; ctx.fillRect(x + 16, ROOF - 64, 8, 64);
    ctx.fillStyle = '#3F4A45'; ctx.fillRect(x + 17, ROOF - 64, 6, 64);
    ctx.fillStyle = '#56625C'; ctx.fillRect(x + 17, ROOF - 64, 2, 64);
    ctx.fillStyle = '#4A5550'; ctx.fillRect(x + 10, ROOF - 12, 20, 10);
    ctx.fillStyle = '#1E2422'; ctx.fillRect(x + 13, ROOF - 9, 2, 2); ctx.fillRect(x + 25, ROOF - 9, 2, 2);
    // Cracks in the wall from the quakes (each lit along its lower lip)
    for (const [c, ox] of [['rgba(140, 152, 145, 0.45)', 2], ['rgba(30, 36, 33, 0.7)', 0]] as const) {
      ctx.strokeStyle = c; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x + 20 + ox, ROOF + 10); ctx.lineTo(x + 34 + hash(x) * 20 + ox, ROOF + 50); ctx.lineTo(x + 24 + ox, ROOF + 90); ctx.stroke();
    }
  }
  ctx.fillStyle = INK; ctx.fillRect(x1, ROOF - 5, x2 - x1, 6);
  ctx.fillStyle = '#3F4A45'; ctx.fillRect(x1, ROOF - 4, x2 - x1, 4);
  ctx.fillStyle = '#56625C'; ctx.fillRect(x1, ROOF - 4, x2 - x1, 1);
  // Three tiers of cells, kept dim and quiet (they're only the back wall: what you stand on is the galleries in front):
  // bars, a bunk, a sink, the numbers
  ctx.fillStyle = '#323B37'; ctx.fillRect(x1, IS.tier3 - 120, x2 - x1, Y - (IS.tier3 - 120));
  checker(ctx, x1, IS.tier3 - 122, x2 - x1, 2, '#323B37');
  for (const tierY of [Y, IS.tier2, IS.tier3]) {
    // (the tier's floor edge under the cells)
    ctx.fillStyle = '#262D2A'; ctx.fillRect(x1, tierY - 4, x2 - x1, 4);
    for (let x = Math.floor(x1 / 70) * 70; x < x2; x += 70) {
      // (the cell: dark inside, its back wall darker up top where the light doesn't reach)
      ctx.fillStyle = '#141917'; ctx.fillRect(x + 6, tierY - 100, 58, 96);
      ctx.fillStyle = '#1A201D'; ctx.fillRect(x + 6, tierY - 60, 58, 56);
      checker(ctx, x + 6, tierY - 62, 58, 2, '#1A201D');
      // (the bunk on its brackets, the blanket folded at the end; the sink; a shelf)
      ctx.fillStyle = '#2A2620'; ctx.fillRect(x + 11, tierY - 35, 2, 8); ctx.fillRect(x + 41, tierY - 35, 2, 8);
      ctx.fillStyle = '#3B342B'; ctx.fillRect(x + 11, tierY - 40, 32, 5);
      ctx.fillStyle = '#4A4236'; ctx.fillRect(x + 11, tierY - 40, 32, 1);
      ctx.fillStyle = '#2E3A4A'; ctx.fillRect(x + 33, tierY - 41, 9, 6); ctx.fillStyle = '#3E4C5E'; ctx.fillRect(x + 33, tierY - 41, 9, 1);
      ctx.fillStyle = '#4A4F4C'; ctx.fillRect(x + 48, tierY - 32, 9, 7);
      ctx.fillStyle = '#5E6460'; ctx.fillRect(x + 48, tierY - 32, 9, 1); ctx.fillStyle = '#2E3230'; ctx.fillRect(x + 50, tierY - 30, 5, 2);
      ctx.fillStyle = '#2A2620'; ctx.fillRect(x + 12, tierY - 70, 20, 2);
      if (hash(x + tierY) < 0.4) { ctx.fillStyle = '#3B342B'; ctx.fillRect(x + 14, tierY - 75, 6, 5); }
      // (the bars, round and catching the light down one side; the flat straps across)
      for (let b = x + 9; b < x + 62; b += 9) { ctx.fillStyle = '#28302C'; ctx.fillRect(b, tierY - 100, 2, 96); ctx.fillStyle = '#5A645F'; ctx.fillRect(b, tierY - 100, 1, 96); }
      ctx.fillStyle = '#28302C'; ctx.fillRect(x + 6, tierY - 72, 58, 3); ctx.fillRect(x + 6, tierY - 28, 58, 3);
      ctx.fillStyle = '#5A645F'; ctx.fillRect(x + 6, tierY - 72, 58, 1); ctx.fillRect(x + 6, tierY - 28, 58, 1);
      ctx.fillStyle = '#48524D'; ctx.fillRect(x + 6, tierY - 100, 58, 2);
      // (the pilaster between this cell and the next, lit down its edge)
      ctx.fillStyle = '#3C4641'; ctx.fillRect(x + 64, tierY - 104, 2, 100);
      ctx.fillStyle = '#28302C'; ctx.fillRect(x + 4, tierY - 104, 2, 100);
      ctx.fillStyle = 'rgba(231, 229, 228, 0.3)'; ctx.font = 'bold 6px "Press Start 2P"'; ctx.fillText(`${Math.abs(Math.floor(x / 70)) % 40 + (tierY === Y ? 100 : tierY === IS.tier2 ? 200 : 300)}`, x + 24, tierY - 106);
    }
  }
  // Signs
  const sx = C.x1 + 240;
  if (visible(state, sx - 100, sx + 200)) {
    ctx.fillStyle = '#3F3F46'; for (const cx2 of [sx + 20, sx + 140]) for (let cy = Y - 470; cy < Y - 420; cy += 6) ctx.fillRect(cx2 - 1, cy, 3, 4);
    signBoard(ctx, sx, Y - 420, 160, 30, 'BROADWAY', 10);
  }
  const dx = HOUSE[1];
  if (visible(state, dx - 300, dx + 60)) {
    // The end wall, the door out to the yard at the top of the stairs (the sunset outside it), its sign
    const ew = IS.tier3 - 90 - top;
    if (ew > 0) {
      ctx.fillStyle = '#4B5550'; ctx.fillRect(dx - 40, top, 40, ew);
      ctx.fillStyle = '#5C6661'; ctx.fillRect(dx - 40, top, 4, ew);
      ctx.fillStyle = '#3A4440'; ctx.fillRect(dx - 6, top, 6, ew);
      ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let y = Math.floor(top / 48) * 48; y < IS.tier3 - 90; y += 48) ctx.fillRect(dx - 40, y, 40, 2);
    }
    bandedGradient(ctx, dx - 40, IS.tier3 - 90, 40, 90, ['#F59E62', '#FCD9A0', '#FCD9A0', '#FDE6BE'], 5);
    ctx.fillStyle = INK; ctx.fillRect(dx - 42, IS.tier3 - 92, 44, 3); ctx.fillRect(dx - 42, IS.tier3 - 92, 3, 92);
    ctx.fillStyle = '#6B706A'; ctx.fillRect(dx - 39, IS.tier3 - 89, 2, 89);
    signBoard(ctx, dx - 190, IS.tier3 - 130, 170, 24, 'RECREATION YARD', 8);
  }
};

/** The yard: its walls, the guard tower, the lighthouse and the water tower; then the cliff face over the road down. */
const drawYard = (ctx: Ctx, state: GameState) => {
  const f = state.frame;
  const wx1 = YARD[0], wallX = YARD[0] + 930;
  // The lighthouse, behind the yard wall: the tapered tower lit down its left, the lantern room on its gallery, the
  // roof and its vent ball
  const lx = YARD[0] + 700;
  if (visible(state, lx - 60, lx + 60)) {
    const tower = () => { ctx.moveTo(lx - 22, WALL_TOP + 40); ctx.lineTo(lx - 14, WALL_TOP - 260); ctx.lineTo(lx + 14, WALL_TOP - 260); ctx.lineTo(lx + 22, WALL_TOP + 40); ctx.closePath(); };
    ctx.save(); ctx.beginPath(); tower(); ctx.clip();
    ctx.fillStyle = '#E7E5E4'; ctx.fillRect(lx - 22, WALL_TOP - 260, 44, 300);
    ctx.fillStyle = '#F5F5F4'; ctx.fillRect(lx - 22, WALL_TOP - 260, 14, 300);
    ctx.fillStyle = '#C9C4BE'; ctx.fillRect(lx + 6, WALL_TOP - 260, 16, 300);
    checker(ctx, lx + 2, WALL_TOP - 260, 4, 300, '#C9C4BE');
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(lx + 14, WALL_TOP - 260, 8, 300);
    ctx.fillStyle = '#FCD9A0'; ctx.fillRect(lx + 20, WALL_TOP - 260, 2, 300);
    // (its windows, one above the other)
    for (const wy of [WALL_TOP - 200, WALL_TOP - 120, WALL_TOP - 40]) { ctx.fillStyle = INK; ctx.fillRect(lx - 4, wy, 8, 14); ctx.fillStyle = '#44403C'; ctx.fillRect(lx - 3, wy + 1, 6, 12); ctx.fillStyle = '#FCD9A0'; ctx.fillRect(lx - 3, wy + 1, 2, 4); }
    ctx.restore();
    ctx.beginPath(); tower(); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke();
    // (the gallery round the lantern room, its rail)
    ctx.fillStyle = INK; ctx.fillRect(lx - 25, WALL_TOP - 264, 50, 6);
    ctx.fillStyle = '#44403C'; ctx.fillRect(lx - 24, WALL_TOP - 263, 48, 4); ctx.fillStyle = '#78716C'; ctx.fillRect(lx - 24, WALL_TOP - 263, 48, 1);
    steppedGlow(ctx, lx, WALL_TOP - 280, 34, '#FEF08A', 0.3, 0.04, 4);
    ctx.fillStyle = '#1C1917'; ctx.fillRect(lx - 20, WALL_TOP - 300, 40, 40);
    ctx.fillStyle = '#FEF08A'; ctx.fillRect(lx - 14, WALL_TOP - 294, 28, 28);
    ctx.fillStyle = '#FFFBEB'; ctx.fillRect(lx - 6, WALL_TOP - 288, 12, 14);
    ctx.fillStyle = '#FDE047'; ctx.fillRect(lx - 14, WALL_TOP - 270, 28, 4);
    ctx.fillStyle = '#1C1917'; ctx.fillRect(lx - 1, WALL_TOP - 294, 2, 28); ctx.fillRect(lx - 14, WALL_TOP - 281, 28, 1);
    ctx.fillStyle = '#44403C'; for (let k = -22; k <= 22; k += 6) ctx.fillRect(lx + k, WALL_TOP - 272, 1, 10);
    ctx.fillStyle = '#44403C'; ctx.beginPath(); ctx.moveTo(lx - 24, WALL_TOP - 300); ctx.lineTo(lx, WALL_TOP - 320); ctx.lineTo(lx + 24, WALL_TOP - 300); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#78716C'; ctx.beginPath(); ctx.moveTo(lx - 24, WALL_TOP - 300); ctx.lineTo(lx, WALL_TOP - 320); ctx.lineTo(lx - 4, WALL_TOP - 300); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(lx - 24, WALL_TOP - 300); ctx.lineTo(lx, WALL_TOP - 320); ctx.lineTo(lx + 24, WALL_TOP - 300); ctx.closePath(); ctx.stroke();
    ctx.fillStyle = INK; ctx.fillRect(lx - 3, WALL_TOP - 327, 6, 6); ctx.fillStyle = '#57534E'; ctx.fillRect(lx - 2, WALL_TOP - 326, 4, 4); ctx.fillStyle = '#A8A29E'; ctx.fillRect(lx - 2, WALL_TOP - 326, 2, 2);
    // Its beam going round: brightest at the lamp, fading in steps the further it reaches
    const a = Math.sin(f * 0.03), reach = a * 500;
    ctx.save();
    ctx.beginPath(); ctx.moveTo(lx, WALL_TOP - 280); ctx.lineTo(lx + reach, WALL_TOP - 330); ctx.lineTo(lx + reach, WALL_TOP - 230); ctx.closePath(); ctx.clip();
    for (let k = 0; k < 4; k++) {
      const u0 = lx + reach * (k / 4), u1 = lx + reach * ((k + 1) / 4);
      ctx.fillStyle = `rgba(254, 240, 138, ${(0.26 - k * 0.06).toFixed(3)})`;
      ctx.fillRect(Math.min(u0, u1), WALL_TOP - 330, Math.abs(u1 - u0), 100);
      if (k < 3) checker(ctx, Math.min(u1, u1 - Math.sign(reach) * 4), WALL_TOP - 330, 4, 100, 'rgba(254, 240, 138, 0.08)');
    }
    ctx.restore();
  }
  // The yard walls: tall concrete in panels, lit warm along the top by the sunset, a coping along it, the wire along
  // the top, grime coming up from the foot of it
  if (visible(state, wx1, wallX)) {
    const wt = WALL_TOP - 130, wh = IS.tier3 - wt;
    bandedGradient(ctx, wx1, wt, wallX - wx1, wh, ['#A29C8E', '#8A8F87', '#82877F', '#787D76'], 5);
    for (let x = wx1; x < wallX; x += 80) {
      ctx.fillStyle = '#6B706A'; ctx.fillRect(x, wt, 3, wh);
      ctx.fillStyle = '#A3A8A0'; ctx.fillRect(x + 3, wt, 1, wh);
      // (form-tie holes, a rust run from one now and then)
      ctx.fillStyle = '#5C615B'; for (let ty = wt + 30; ty < IS.tier3 - 10; ty += 50) { ctx.fillRect(x + 20, ty, 2, 2); ctx.fillRect(x + 60, ty, 2, 2); }
      if (hash(x) < 0.4) { ctx.fillStyle = 'rgba(146, 64, 14, 0.25)'; ctx.fillRect(x + 20, wt + 32, 2, 20 + hash(x + 1) * 30); checker(ctx, x + 18, wt + 34, 6, 16, 'rgba(146, 64, 14, 0.18)'); }
    }
    checker(ctx, wx1, IS.tier3 - 24, wallX - wx1, 4, '#6B706A');
    ctx.fillStyle = 'rgba(60, 56, 50, 0.25)'; ctx.fillRect(wx1, IS.tier3 - 20, wallX - wx1, 20);
    // (the coping)
    ctx.fillStyle = INK; ctx.fillRect(wx1, wt - 2, wallX - wx1, 7);
    ctx.fillStyle = '#B5B0A2'; ctx.fillRect(wx1, wt - 1, wallX - wx1, 5);
    ctx.fillStyle = '#F2D2A8'; ctx.fillRect(wx1, wt - 1, wallX - wx1, 1);
    ctx.fillStyle = '#6B706A'; ctx.fillRect(wx1, wt + 4, wallX - wx1, 2);
    // (the wire: coil after coil, dark, catching the light on top; the posts it's strung on)
    ctx.fillStyle = INK; for (let x = wx1 + 20; x < wallX; x += 140) { ctx.fillRect(x, WALL_TOP - 146, 3, 16); }
    ctx.strokeStyle = '#3F3F46'; ctx.lineWidth = 1;
    for (let x = wx1; x < wallX; x += 14) { ctx.beginPath(); ctx.arc(x + 7, WALL_TOP - 136, 6, 0, Math.PI * 2); ctx.stroke(); }
    ctx.strokeStyle = '#D6D3D1';
    for (let x = wx1; x < wallX; x += 14) { ctx.beginPath(); ctx.arc(x + 7, WALL_TOP - 136, 6, Math.PI * 1.15, Math.PI * 1.55); ctx.stroke(); }
    ctx.fillStyle = '#A1A1AA'; for (let x = wx1 + 3; x < wallX; x += 14) ctx.fillRect(x, WALL_TOP - 141, 2, 1);
    // A handball court painted on it (the paint flaked off here and there), and somebody's name scratched in
    ctx.strokeStyle = '#E7E5E4'; ctx.lineWidth = 2; ctx.strokeRect(wx1 + 120, IS.tier3 - 140, 160, 140);
    for (let k = 0; k < 8; k++) checker(ctx, wx1 + 118 + Math.round(hash(k + 300) * 150), IS.tier3 - 142 + (k % 2 ? 0 : 138), 8, 4, '#8A8F87');
    checker(ctx, wx1 + 118, IS.tier3 - 100 + Math.round(hash(310) * 60), 4, 10, '#8A8F87');
    ctx.font = 'bold 7px "Press Start 2P"';
    ctx.fillStyle = 'rgba(60, 64, 60, 0.6)'; ctx.fillText('AL WAS HERE', wx1 + 331, IS.tier3 - 89);
    ctx.fillStyle = 'rgba(245,245,244,0.7)'; ctx.fillText('AL WAS HERE', wx1 + 330, IS.tier3 - 90);
  }
  // The guard tower on the wall: steel legs, braced; the cab (its windows giving back the sunset), the roof, the lamp
  const gx = YARD[0] + 820;
  if (visible(state, gx - 80, gx + 80)) {
    ctx.strokeStyle = INK; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(gx - 5, WALL_TOP - 104); ctx.lineTo(gx + 65, WALL_TOP - 40); ctx.moveTo(gx + 65, WALL_TOP - 104); ctx.lineTo(gx - 5, WALL_TOP - 40); ctx.stroke();
    ctx.strokeStyle = '#57534E'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(gx - 5, WALL_TOP - 104); ctx.lineTo(gx + 65, WALL_TOP - 40); ctx.moveTo(gx + 65, WALL_TOP - 104); ctx.lineTo(gx - 5, WALL_TOP - 40); ctx.stroke();
    for (const lgx of [gx - 8, gx + 62]) {
      ctx.fillStyle = INK; ctx.fillRect(lgx - 1, WALL_TOP - 110, 8, 110);
      ctx.fillStyle = '#57534E'; ctx.fillRect(lgx, WALL_TOP - 110, 6, 110);
      ctx.fillStyle = '#78716C'; ctx.fillRect(lgx, WALL_TOP - 110, 2, 110);
      ctx.fillStyle = '#3F3B37'; ctx.fillRect(lgx + 4, WALL_TOP - 110, 2, 110);
    }
    slab(ctx, gx - 20, WALL_TOP - 170, 100, 60, '#A8A29E');
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let y = WALL_TOP - 128; y < WALL_TOP - 112; y += 6) ctx.fillRect(gx - 18, y, 96, 1);
    ctx.fillStyle = INK; ctx.fillRect(gx - 13, WALL_TOP - 161, 86, 28);
    bandedGradient(ctx, gx - 12, WALL_TOP - 160, 84, 26, ['#2A2430', '#5A3048', '#B4436C', '#E88A6A'], 4);
    ctx.fillStyle = '#44403C'; for (const mx of [gx + 16, gx + 44]) ctx.fillRect(mx, WALL_TOP - 160, 2, 26);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'; ctx.fillRect(gx - 8, WALL_TOP - 156, 2, 6); ctx.fillRect(gx - 6, WALL_TOP - 158, 2, 2);
    const roof = () => { ctx.moveTo(gx - 28, WALL_TOP - 170); ctx.lineTo(gx + 30, WALL_TOP - 196); ctx.lineTo(gx + 88, WALL_TOP - 170); ctx.closePath(); };
    ctx.fillStyle = '#44403C'; ctx.beginPath(); roof(); ctx.fill();
    ctx.fillStyle = '#5E5852'; ctx.beginPath(); ctx.moveTo(gx - 28, WALL_TOP - 170); ctx.lineTo(gx + 30, WALL_TOP - 196); ctx.lineTo(gx + 30, WALL_TOP - 170); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2E2A26'; ctx.fillRect(gx - 28, WALL_TOP - 172, 116, 2);
    ctx.beginPath(); roof(); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke();
    steppedGlow(ctx, gx + 30, WALL_TOP - 181, 22, '#FEF9C3', 0.3, 0.05, 3);
    ctx.fillStyle = INK; ctx.fillRect(gx + 21, WALL_TOP - 187, 18, 12);
    ctx.fillStyle = '#FEF9C3'; ctx.fillRect(gx + 22, WALL_TOP - 186, 16, 10);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(gx + 24, WALL_TOP - 184, 6, 4);
  }
  // Past the wall, over the road down: the island's cliff face rising behind it, the water tower up on top
  const c1 = wallX, c2 = YARD[1];
  if (visible(state, c1, c2)) {
    const top = WALL_TOP - 60;
    const faceY = (x: number) => top + Math.sin(x * 0.013) * 12 + (x - c1) * 0.18;
    const tx = YARD[0] + 1850;
    if (visible(state, tx - 90, tx + 90)) {
      // (stood on the cliff top: each leg down to the ground under it, a little way into it)
      const legs = [tx - 60, tx - 20, tx + 20, tx + 60], t0 = Math.min(...legs.map(faceY)) - 150;
      ctx.strokeStyle = INK; ctx.lineWidth = 4;
      ctx.beginPath(); for (let k = 0; k < 3; k++) { ctx.moveTo(legs[k], t0 + 40 + k * 10); ctx.lineTo(legs[k + 1], t0 + 90 + k * 10); ctx.moveTo(legs[k + 1], t0 + 40 + k * 10); ctx.lineTo(legs[k], t0 + 90 + k * 10); } ctx.stroke();
      ctx.strokeStyle = '#6B3F2A'; ctx.lineWidth = 2;
      ctx.beginPath(); for (let k = 0; k < 3; k++) { ctx.moveTo(legs[k], t0 + 40 + k * 10); ctx.lineTo(legs[k + 1], t0 + 90 + k * 10); ctx.moveTo(legs[k + 1], t0 + 40 + k * 10); ctx.lineTo(legs[k], t0 + 90 + k * 10); } ctx.stroke();
      for (const lx2 of legs) {
        const h = faceY(lx2) + 8 - t0;
        ctx.fillStyle = INK; ctx.fillRect(lx2 - 4, t0, 8, h);
        ctx.fillStyle = '#6B3F2A'; ctx.fillRect(lx2 - 3, t0, 6, h);
        ctx.fillStyle = '#8E5A3C'; ctx.fillRect(lx2 - 3, t0, 2, h);
        ctx.fillStyle = '#4A2A1C'; ctx.fillRect(lx2 + 1, t0, 2, h);
      }
      // (the tank: rust-red steel in vertical steps, lit on the left, the seams and their rivets, rust weeping down;
      // the roof; the slogan painted across it)
      const tank = '#9A6B4F';
      ctx.fillStyle = INK; ctx.fillRect(tx - 71, t0 - 101, 142, 102);
      ctx.fillStyle = tank; ctx.fillRect(tx - 70, t0 - 100, 140, 100);
      ctx.fillStyle = lite(tank, 0.18); ctx.fillRect(tx - 70, t0 - 100, 34, 100);
      checker(ctx, tx - 36, t0 - 100, 4, 100, lite(tank, 0.18));
      ctx.fillStyle = dark(tank, 0.2); ctx.fillRect(tx + 24, t0 - 100, 46, 100);
      checker(ctx, tx + 20, t0 - 100, 4, 100, dark(tank, 0.2));
      ctx.fillStyle = dark(tank, 0.38); ctx.fillRect(tx + 52, t0 - 100, 18, 100);
      checker(ctx, tx + 48, t0 - 100, 4, 100, dark(tank, 0.38));
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; for (const sy of [t0 - 72, t0 - 36]) { ctx.fillRect(tx - 70, sy, 140, 1); for (let rx = tx - 66; rx < tx + 68; rx += 8) ctx.fillRect(rx, sy - 3, 1, 1); }
      ctx.fillStyle = 'rgba(80, 30, 10, 0.35)'; for (let i = 0; i < 7; i++) ctx.fillRect(tx - 60 + i * 19, t0 - 70, 2, 8 + (i * 7) % 18);
      ctx.fillStyle = INK; ctx.fillRect(tx - 72, t0 - 4, 144, 6); ctx.fillStyle = '#4A2A1C'; ctx.fillRect(tx - 71, t0 - 3, 142, 4); ctx.fillStyle = '#8E5A3C'; ctx.fillRect(tx - 71, t0 - 3, 142, 1);
      const rf = () => { ctx.moveTo(tx - 74, t0 - 100); ctx.lineTo(tx, t0 - 140); ctx.lineTo(tx + 74, t0 - 100); ctx.closePath(); };
      ctx.fillStyle = '#6B3F2A'; ctx.beginPath(); rf(); ctx.fill();
      ctx.fillStyle = '#8E5A3C'; ctx.beginPath(); ctx.moveTo(tx - 74, t0 - 100); ctx.lineTo(tx, t0 - 140); ctx.lineTo(tx - 10, t0 - 100); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#4A2A1C'; ctx.beginPath(); ctx.moveTo(tx + 30, t0 - 116); ctx.lineTo(tx + 74, t0 - 100); ctx.lineTo(tx + 30, t0 - 100); ctx.closePath(); ctx.fill();
      ctx.beginPath(); rf(); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.font = 'bold 8px "Press Start 2P"'; ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(40, 20, 10, 0.6)'; ctx.fillText('PEACE AND', tx + 1, t0 - 63); ctx.fillText('FREEDOM', tx + 1, t0 - 49);
      ctx.fillStyle = '#F5F5F4'; ctx.fillText('PEACE AND', tx, t0 - 64); ctx.fillText('FREEDOM', tx, t0 - 50); ctx.textAlign = 'left';
    }
    // (the cliff face itself: the rock in strata running down with the slope, lit along its crest, cracks lit along
    // one lip, the scrub and ice plant clinging on)
    const face = () => { ctx.moveTo(c1, top); for (let x = c1; x <= c2; x += 40) ctx.lineTo(x, faceY(x)); ctx.lineTo(c2, Y); ctx.lineTo(c1, Y); ctx.closePath(); };
    ctx.save(); ctx.beginPath(); face(); ctx.clip();
    ctx.fillStyle = '#6E5D4E'; ctx.fillRect(c1, top - 30, c2 - c1, Y - top + 30);
    const strata = ['#86735A', '#58493F', '#7A6752', '#4E4138'];
    for (let x = Math.floor(Math.max(c1, state.camera.x - 40) / 8) * 8; x < Math.min(c2, state.camera.x + CANVAS_WIDTH + 40); x += 8) {
      const base = top + (x - c1) * 0.18;
      for (let k = 0; k < 6; k++) {
        const y0 = Math.round((base + 24 + k * 34 + Math.sin(x * 0.02 + k) * 4) / 2) * 2;
        ctx.fillStyle = strata[k % 4]; ctx.fillRect(x, y0, 8, 16);
        checker(ctx, x, y0 - 2, 8, 2, strata[k % 4]);
      }
      const y = Math.round(faceY(x) / 2) * 2;
      ctx.fillStyle = '#9C8468'; ctx.fillRect(x, y, 8, 4);
      ctx.fillStyle = '#B8A07F'; ctx.fillRect(x, y, 8, 2);
      checker(ctx, x, y + 4, 8, 4, '#9C8468');
    }
    ctx.restore();
    for (const [c, ox] of [['rgba(184, 160, 127, 0.4)', 2], ['rgba(40, 30, 24, 0.55)', 0]] as const) {
      ctx.strokeStyle = c; ctx.lineWidth = 2;
      for (let x = Math.floor(c1 / 90) * 90; x < c2; x += 90) { ctx.beginPath(); ctx.moveTo(x + ox, top + 30 + (x - c1) * 0.18); ctx.lineTo(x + 30 + ox, top + 90 + (x - c1) * 0.18); ctx.lineTo(x + 10 + ox, top + 160 + (x - c1) * 0.18); ctx.stroke(); }
    }
    for (let x = Math.floor(c1 / 60) * 60; x < c2; x += 60) {
      const px = Math.round(x + hash(x + 1) * 30), py = Math.round(top + 40 + (x - c1) * 0.18 + hash(x + 2) * 120);
      const ice = hash(x) >= 0.5, c = ice ? '#9D174D' : '#4D7C0F';
      ctx.fillStyle = INK; ctx.fillRect(px - 1, py - 1, 16, 8);
      ctx.fillStyle = dark(c, 0.2); ctx.fillRect(px, py, 14, 6);
      ctx.fillStyle = c; ctx.fillRect(px + 1, py, 10, 4);
      ctx.fillStyle = lite(c, 0.35); ctx.fillRect(px + 2, py, 2, 2); ctx.fillRect(px + 7, py + 1, 2, 2);
      if (ice) { ctx.fillStyle = '#F472B6'; ctx.fillRect(px + 10, py - 2, 2, 2); }
    }
  }
};

/** The fort's brickwork: 24 x 10 bricks in courses, a lit top edge on each, a few tints, the mortar dark between. */
const fortBrick = (ctx: Ctx) => tilePattern(ctx, 'ernie-fort-brick', 52, 24, g => {
  g.fillStyle = '#5A3526'; g.fillRect(0, 0, 52, 24);
  const tints = ['#7C4A3A', '#74443A', '#82503E', '#6E4234'];
  for (let row = 0; row < 2; row++) for (let i = -1; i < 3; i++) {
    const x = i * 26 + row * 13, y = row * 12, c = tints[(i + 1 + row * 2) % 4];
    g.fillStyle = c; g.fillRect(x, y, 24, 10);
    g.fillStyle = lite(c, 0.18); g.fillRect(x, y, 24, 1);
    g.fillStyle = dark(c, 0.2); g.fillRect(x, y + 9, 24, 1);
  }
});

/** The citadel: the old fort's brick vaults, down in the bedrock, and its lamps. */
const drawCitadel = (ctx: Ctx, state: GameState) => {
  const x1 = Math.max(CITADEL[0], state.camera.x - 20), x2 = Math.min(CITADEL[1], state.camera.x + CANVAS_WIDTH + 20);
  if (x2 <= x1) return;
  const top = state.camera.y - 20;
  // The bedrock over it all: strata with ragged edges, dithered one into the next, a stone bedded in here and there
  ctx.fillStyle = '#231813'; ctx.fillRect(x1, top, x2 - x1, VAULT - top);
  for (let y = Math.floor(top / 50) * 50; y < VAULT; y += 50) {
    for (let x = Math.floor(x1 / 8) * 8; x < x2; x += 8) {
      const j = Math.round(hash(x * 0.37 + y) * 2) * 2;
      ctx.fillStyle = '#34251E'; ctx.fillRect(x, y + j, 8, 16 - j);
      ctx.fillStyle = '#3E2C24'; ctx.fillRect(x, y + j, 8, 2);
    }
    checker(ctx, x1, y + 16, x2 - x1, 2, '#34251E');
    checker(ctx, x1, y - 2, x2 - x1, 2, '#2C1F19', 1);
    for (let x = Math.floor(x1 / 120) * 120; x < x2; x += 120) if (hash(x + y) < 0.5) {
      const sx = Math.round(x + hash(x + y + 1) * 80), sy = Math.round(y + 24 + hash(x + y + 2) * 14);
      ctx.fillStyle = '#1A120E'; ctx.fillRect(sx - 1, sy - 1, 14, 9); ctx.fillStyle = '#4A3A30'; ctx.fillRect(sx, sy, 12, 7); ctx.fillStyle = '#5E4C40'; ctx.fillRect(sx, sy, 8, 2);
    }
  }
  // The vaults: brick, arched, one after another; the brick darker up under the rock, a lamp in each pool of light
  ctx.save(); ctx.translate(0, VAULT); ctx.fillStyle = fortBrick(ctx); ctx.fillRect(x1, 0, x2 - x1, Y - VAULT); ctx.restore();
  ctx.fillStyle = 'rgba(20, 10, 6, 0.35)'; ctx.fillRect(x1, VAULT, x2 - x1, 20);
  checker(ctx, x1, VAULT + 20, x2 - x1, 4, 'rgba(20, 10, 6, 0.35)');
  ctx.fillStyle = INK; ctx.fillRect(x1, VAULT - 2, x2 - x1, 3);
  for (let x = Math.floor(x1 / 200) * 200; x < x2; x += 200) {
    const ax = x + 100, ay = VAULT + 90;
    // (the opening, its depth stepping back into the dark)
    ctx.fillStyle = '#1C120D';
    ctx.beginPath(); ctx.moveTo(x + 30, Y); ctx.lineTo(x + 30, ay); ctx.arc(ax, ay, 70, Math.PI, 0); ctx.lineTo(x + 170, Y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#140C09';
    ctx.beginPath(); ctx.moveTo(x + 44, Y); ctx.lineTo(x + 44, ay + 6); ctx.arc(ax, ay + 6, 56, Math.PI, 0); ctx.lineTo(x + 156, Y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#0C0705';
    ctx.beginPath(); ctx.moveTo(x + 60, Y); ctx.lineTo(x + 60, ay + 14); ctx.arc(ax, ay + 14, 40, Math.PI, 0); ctx.lineTo(x + 140, Y); ctx.closePath(); ctx.fill();
    // (the soffit's inner brick lit on the left, shadowed right)
    ctx.fillStyle = '#2A1A12'; ctx.fillRect(x + 30, ay, 6, Y - ay); ctx.fillStyle = '#100906'; ctx.fillRect(x + 164, ay, 6, Y - ay);
    // (the voussoirs round the arch, the keystone at the crown)
    for (let k = 0; k < 13; k++) {
      const a0 = Math.PI + (k / 13) * Math.PI, a1 = Math.PI + ((k + 1) / 13) * Math.PI;
      const c = k === 6 ? '#A0705A' : k % 2 ? '#8B5A45' : '#7C4A3A';
      ctx.beginPath(); ctx.arc(ax, ay, k === 6 ? 80 : 77, a0 + 0.01, a1 - 0.01); ctx.arc(ax, ay, 70, a1 - 0.01, a0 + 0.01, true); ctx.closePath();
      ctx.fillStyle = c; ctx.fill(); ctx.strokeStyle = '#3B2218'; ctx.lineWidth = 1; ctx.stroke();
    }
    ctx.strokeStyle = '#B07A62'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(ax, ay, 76, Math.PI * 1.08, Math.PI * 1.45); ctx.stroke();
    // A lamp in each (a caged bulb on a bracket, its light in rings on the brick), and water weeping down the brick
    steppedGlow(ctx, x + 189, VAULT + 36, 46, '#FDE68A', 0.18, 0.03, 4);
    ctx.fillStyle = INK; ctx.fillRect(x + 192, VAULT + 26, 6, 3); ctx.fillRect(x + 185, VAULT + 28, 8, 14);
    ctx.fillStyle = '#FDE68A'; ctx.fillRect(x + 186, VAULT + 30, 6, 10);
    ctx.fillStyle = '#FFFBEB'; ctx.fillRect(x + 187, VAULT + 31, 2, 4);
    ctx.fillStyle = INK; ctx.fillRect(x + 186, VAULT + 34, 6, 1);
    const wx = Math.round(x + 10 + hash(x) * 10);
    ctx.fillStyle = 'rgba(30, 41, 59, 0.35)'; ctx.fillRect(wx, VAULT, 4, Y - VAULT);
    checker(ctx, wx - 2, VAULT, 2, Y - VAULT, 'rgba(30, 41, 59, 0.3)'); checker(ctx, wx + 4, VAULT + 30, 2, Y - VAULT - 30, 'rgba(30, 41, 59, 0.3)', 1);
    ctx.fillStyle = 'rgba(148, 163, 184, 0.45)'; ctx.fillRect(wx + 1, VAULT + ((state.frame * 0.6 + hash(x + 5) * 200) % (Y - VAULT)), 1, 4);
    ctx.fillStyle = 'rgba(74, 222, 128, 0.12)'; ctx.fillRect(wx - 3, Y - 30, 10, 30); checker(ctx, wx - 5, Y - 40, 14, 10, 'rgba(74, 222, 128, 0.12)');
  }
  const sx = CITADEL[0] + 60;
  if (visible(state, sx, sx + 200)) signBoard(ctx, sx, VAULT + 10, 170, 22, 'CITADEL 1859: NO ENTRY', 7, '#1C1917', '#E7E5E4');
};

// ---------------------------------------------------------------------------
// The ground
// ---------------------------------------------------------------------------

/** Which look a stretch of island ground has. */
const lookOf = (surface?: string): FaultLook => (surface === 'yard' || surface === 'bleacher' ? 'yard' : surface === 'cliff' ? 'rock' : surface === 'citadel' ? 'brick' : 'floor');

const drawGround = (ctx: Ctx, state: GameState, r: GroundRun) => {
  if (r.surface === 'stairs') { drawStairs(ctx, state, r); return; }
  if (r.surface === 'rubble') { drawSurface(ctx, state, r, 'floor'); drawRubble(ctx, r); return; }
  drawSurface(ctx, state, r, lookOf(r.surface));
  if (r.surface === 'yard') {
    // (the painted lines, worn through in places)
    for (let x = Math.ceil(r.x1 / 160) * 160; x < r.x2; x += 160) {
      const y = runYAt(r, x) + 3;
      ctx.fillStyle = 'rgba(245, 245, 244, 0.6)'; ctx.fillRect(x, y, 40, 2);
      checker(ctx, x + 10 + Math.round(hash(x) * 20), y, 8, 2, '#A8A29E');
    }
  }
  if (r.surface === 'bleacher') {
    // (a plank seat on its riser: lit along the top, the grain, bolts; the post under it)
    ctx.fillStyle = INK; ctx.fillRect(r.x1, r.y1 - 1, r.x2 - r.x1, 6);
    ctx.fillStyle = '#D6D3D1'; ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, 4);
    ctx.fillStyle = '#F5F5F4'; ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, 1);
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(r.x1, r.y1 + 3, r.x2 - r.x1, 1);
    ctx.fillStyle = '#78716C'; ctx.fillRect(r.x1 + 6, r.y1 + 1, 2, 2); ctx.fillRect(r.x2 - 8, r.y1 + 1, 2, 2);
    ctx.fillStyle = INK; ctx.fillRect(r.x1 - 1, r.y1 + 4, 5, 50);
    ctx.fillStyle = '#57534E'; ctx.fillRect(r.x1, r.y1 + 4, 3, 50); ctx.fillStyle = '#78716C'; ctx.fillRect(r.x1, r.y1 + 4, 1, 50);
  }
};

/** A stretch of the island's ground (or a fault's) in the look for where it is. */
const drawSurface = (ctx: Ctx, state: GameState, r: GroundRun, look: FaultLook) => {
  const bottom = state.camera.y + CANVAS_HEIGHT + 60;
  const quad = (d1: number, d2: number) => {
    ctx.beginPath(); ctx.moveTo(r.x1, r.y1 + d1); ctx.lineTo(r.x2, r.y2 + d1); ctx.lineTo(r.x2, Math.min(bottom + 400, r.y2 + d2)); ctx.lineTo(r.x1, Math.min(bottom + 400, r.y1 + d2)); ctx.closePath();
  };
  const band = (d1: number, d2: number, color: string) => { ctx.fillStyle = color; quad(d1, d2); ctx.fill(); };
  /** A row of dither along the run, d1 to d2 under its top (where one band steps into the next). */
  const dither = (d1: number, d2: number, color: string, phase = 0) => {
    ctx.save(); quad(d1, d2); ctx.clip();
    checker(ctx, r.x1, Math.min(r.y1, r.y2) + d1 - 2, r.x2 - r.x1, Math.abs(r.y2 - r.y1) + d2 - d1 + 4, color, phase);
    ctx.restore();
  };
  /** Marks at intervals along the run (joints, cracks, stones), each at (x, the run's top there). */
  const along = (step: number, fn: (x: number, y: number) => void) => { for (let x = Math.ceil(r.x1 / step) * step; x < r.x2; x += step) fn(x, runYAt(r, x)); };
  switch (look) {
    case 'floor':
      // (the cell house floor: a poured slab, scuffed, its expansion joints; the old foundation under it)
      band(0, 1400, '#3A3E3A'); dither(28, 32, '#2B3330');
      band(0, 22, '#8A8F87'); dither(14, 22, '#7A7F77'); band(22, 28, '#2B3330'); band(0, 2, '#A3A8A0'); dither(2, 4, '#A3A8A0', 1);
      along(96, (x, y) => { ctx.fillStyle = '#5C615B'; ctx.fillRect(x, y + 2, 1, 20); ctx.fillStyle = '#A3A8A0'; ctx.fillRect(x + 1, y + 2, 1, 20); });
      along(64, (x, y) => { if (hash(x) < 0.4) checker(ctx, x + Math.round(hash(x + 1) * 30), y + 6 + Math.round(hash(x + 2) * 8), 10 + Math.round(hash(x + 3) * 12), 4, '#7A7F77'); });
      along(48, (x, y) => { ctx.fillStyle = '#323633'; ctx.fillRect(x + 10, y + 40 + Math.round(hash(x) * 40), 16, 2); });
      break;
    case 'yard':
      band(0, 1400, '#57534E'); dither(34, 38, '#6B706A');
      band(0, 30, '#A8A29E'); dither(20, 30, '#97918C'); band(30, 34, '#6B706A'); band(0, 2, '#D6D3D1'); dither(2, 4, '#D6D3D1', 1);
      // (cracks in the old asphalt, lit along one lip; gravel in the fill under it)
      along(110, (x, y) => { if (hash(x) < 0.6) { const cx = x + Math.round(hash(x + 1) * 40); ctx.fillStyle = '#6B6560'; ctx.fillRect(cx, y + 4, 8, 1); ctx.fillRect(cx + 7, y + 5, 1, 6); ctx.fillRect(cx + 7, y + 11, 10, 1); ctx.fillStyle = '#C4BEB8'; ctx.fillRect(cx, y + 5, 7, 1); } });
      along(40, (x, y) => { ctx.fillStyle = '#6B6560'; ctx.fillRect(x + Math.round(hash(x) * 30), y + 44 + Math.round(hash(x + 1) * 60), 4, 3); ctx.fillStyle = '#78716C'; ctx.fillRect(x + Math.round(hash(x) * 30), y + 44 + Math.round(hash(x + 1) * 60), 2, 1); });
      break;
    case 'rock': {
      band(0, 1400, '#57493E'); dither(16, 20, '#6E5D4E');
      band(0, 10, '#9C8468'); dither(6, 10, '#86715A'); band(10, 16, '#6E5D4E'); band(0, 2, '#B8A07F'); dither(2, 4, '#B8A07F', 1);
      along(50, (x, y) => {
        const sx = x, sy = Math.round(y + 30 + hash(x) * 60);
        ctx.fillStyle = 'rgba(30, 22, 16, 0.35)'; ctx.fillRect(sx, sy, 22, 6);
        ctx.fillStyle = 'rgba(184, 160, 127, 0.3)'; ctx.fillRect(sx + 2, sy - 2, 18, 2);
      });
      along(36, (x, y) => { if (hash(x + 9) < 0.5) pebble(ctx, x + Math.round(hash(x + 4) * 20), y - 2, 3, '#8A7660'); });
      break;
    }
    case 'brick':
      // (the fort's floor: brick laid flat, worn smooth along the top; the footings under it)
      band(0, 1400, '#2A1C16'); dither(22, 26, '#3B2A22');
      ctx.save(); quad(0, 18); ctx.clip(); ctx.fillStyle = fortBrick(ctx); ctx.fillRect(r.x1, Math.min(r.y1, r.y2), r.x2 - r.x1, Math.abs(r.y2 - r.y1) + 20); ctx.restore();
      dither(10, 18, '#5A3526'); band(18, 22, '#3B2A22'); band(0, 2, '#9A6B55'); dither(2, 4, '#9A6B55', 1);
      along(80, (x, y) => { ctx.fillStyle = 'rgba(30, 41, 59, 0.3)'; ctx.fillRect(x + Math.round(hash(x) * 40), y + 1, 14 + Math.round(hash(x + 1) * 16), 1); });
      break;
    default: break;
  }
};

/** The far end of the block, come down in a heap: broken cell fronts, bars, a bunk, slabs of gallery. */
const drawRubble = (ctx: Ctx, r: GroundRun) => {
  for (let x = r.x1 + 8; x < r.x2 - 8; x += 22) {
    const y = runYAt(r, x), s = hash(x);
    chunk(ctx, x, y + 4, (s - 0.5) * 0.8, -12, -10, 24, 14, s < 0.33 ? '#6B706A' : s < 0.66 ? '#8A8F87' : '#4B5550');
    if (s > 0.7) {
      // (rebar out of it, rusted, bent)
      ctx.save(); ctx.translate(x, y); ctx.rotate(s * 2);
      ctx.fillStyle = INK; ctx.fillRect(-2, -21, 4, 26); ctx.fillStyle = '#7C4A2A'; ctx.fillRect(-1, -20, 2, 24); ctx.fillStyle = '#A8622E'; ctx.fillRect(-1, -20, 1, 24);
      ctx.restore();
    } else if (s > 0.5 && s < 0.56) {
      // (a length of cell front, its bars buckled)
      ctx.save(); ctx.translate(x, y - 6); ctx.rotate(s - 0.9);
      ctx.fillStyle = INK; ctx.fillRect(-16, -4, 32, 3); ctx.fillRect(-16, 10, 32, 3);
      for (let b = -14; b < 16; b += 6) { ctx.fillStyle = INK; ctx.fillRect(b - 1, -4, 3, 17); ctx.fillStyle = '#5A645F'; ctx.fillRect(b, -3, 1, 15); }
      ctx.restore();
    }
  }
};

/** The stairs up to the yard door. */
const drawStairs = (ctx: Ctx, state: GameState, r: GroundRun) => {
  const bottom = state.camera.y + CANVAS_HEIGHT + 60;
  ctx.fillStyle = '#3A3E3A'; ctx.beginPath(); ctx.moveTo(r.x1, r.y1); ctx.lineTo(r.x2, r.y2); ctx.lineTo(r.x2, bottom); ctx.lineTo(r.x1, bottom); ctx.fill();
  const n = 8;
  for (let k = 0; k < n; k++) {
    const x = r.x1 + (k / n) * (r.x2 - r.x1), y = r.y1 + ((k + 1) / n) * (r.y2 - r.y1);
    const w = (r.x2 - r.x1) / n + 1, h = (r.y1 - r.y2) / n + 1;
    // (each step: the riser in shadow, the tread lit, a worn nosing, inked)
    ctx.fillStyle = '#8A8F87'; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#6B706A'; ctx.fillRect(x, y + 4, w, h - 4);
    checker(ctx, x, y + 2, w, 2, '#6B706A');
    ctx.fillStyle = '#A3A8A0'; ctx.fillRect(x, y, w, 2);
    ctx.fillStyle = '#C4C9C1'; ctx.fillRect(x + 2, y, w * 0.4, 1);
    ctx.fillStyle = INK; ctx.fillRect(x, y - 1, w, 1); ctx.fillRect(x, y, 1, h);
  }
};

/** The holes: down into the old fort under the cell house; the road washed out into the bay; the flooded cistern. */
const drawPits = (ctx: Ctx, state: GameState) => {
  const runs = state.groundRuns;
  const bottom = state.camera.y + CANVAS_HEIGHT + 40;
  for (let i = 0; i + 1 < runs.length; i++) {
    const a = runs[i], n = runs[i + 1];
    if (a.x2 < C.x1 || n.x1 <= a.x2 + 1 || !visible(state, a.x2, n.x1)) continue;
    // (the faults draw their own)
    if (COURSE.faults.some(f => Math.abs(f.x - a.x2) < 2)) continue;
    const top = Math.min(a.y2, n.y1), x = a.x2, w = n.x1 - a.x2;
    if (inPart(x, HOUSE)) {
      ctx.fillStyle = '#050404'; ctx.fillRect(x, top, w, bottom - top);
      bandedGradient(ctx, x, top, w, 300, ['#2B2420', '#1E1916', '#120E0C', '#050404'], 6);
      // Old brick down there, the fort under the prison, and the broken edges of the floor with the rebar sticking out
      ctx.save(); ctx.beginPath(); ctx.rect(x, top + 60, w, 200); ctx.clip();
      ctx.globalAlpha = 0.35; ctx.save(); ctx.translate(0, top + 60); ctx.fillStyle = fortBrick(ctx); ctx.fillRect(x, 0, w, 200); ctx.restore();
      ctx.globalAlpha = 1;
      hazeBands(ctx, x, top + 60, w, 200, '#050404', 0.1, 0.8, 5);
      ctx.restore();
      for (const ex of [x, x + w]) {
        const d = ex === x ? 1 : -1;
        // (the slab's broken lip: chunks hanging off it)
        for (let k = 0; k < 3; k++) chunk(ctx, ex + d * (4 + k * 6), top + 6 + k * 7, d * 0.3 * k, -4, -3, 8, 6, k % 2 ? '#6B706A' : '#8A8F87');
        for (let k = 0; k < 3; k++) {
          ctx.beginPath(); ctx.moveTo(ex, top + 6 + k * 6); ctx.lineTo(ex + d * (10 + k * 5), top + 12 + k * 9);
          ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); ctx.strokeStyle = '#78716C'; ctx.lineWidth = 2; ctx.stroke();
          ctx.strokeStyle = '#A8622E'; ctx.lineWidth = 1; ctx.stroke();
        }
      }
    } else if (inPart(x, YARD)) {
      // Washed out: the cliff falls away to the rocks and the bay far below
      ctx.save();
      ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x + 30, top + 120); ctx.lineTo(x + w - 30, top + 120); ctx.lineTo(x + w, top); ctx.lineTo(x + w, bottom); ctx.lineTo(x, bottom); ctx.closePath(); ctx.clip();
      ctx.fillStyle = '#4A3D33'; ctx.fillRect(x, top, w, bottom - top);
      for (let y = top; y < bottom; y += 22) { ctx.fillStyle = '#54463A'; ctx.fillRect(x, y, w, 8); checker(ctx, x, y + 8, w, 2, '#54463A'); }
      ctx.restore();
      ctx.strokeStyle = '#8A7660'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, top + 1); ctx.lineTo(x + 30, top + 121); ctx.moveTo(x + w, top + 1); ctx.lineTo(x + w - 30, top + 121); ctx.stroke();
      ctx.fillStyle = '#2A2019'; ctx.fillRect(x + 20, top + 10, w - 40, bottom - top);
      hazeBands(ctx, x + 20, top + 60, w - 40, 340, '#1E2A4A', 0, 1, 7);
      ctx.fillStyle = '#1E2A4A'; ctx.fillRect(x + 20, top + 400, w - 40, Math.max(0, bottom - top - 400));
      // (the rocks at the bottom, the surf breaking white on them)
      for (let k = 0; k < 4; k++) pebble(ctx, x + 26 + k * ((w - 60) / 4), top + 326 + (k % 2) * 4, 8, '#3A342E');
      ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x + 30 + (state.frame % 40), top + 330, 30, 2);
      checker(ctx, x + 26 + (state.frame % 40), top + 328, 38, 2, 'rgba(248, 250, 252, 0.7)');
      checker(ctx, x + 26 + (state.frame % 40), top + 332, 38, 2, 'rgba(248, 250, 252, 0.5)', 1);
    } else {
      // The cistern: black water, a long way down
      ctx.fillStyle = '#0B0806'; ctx.fillRect(x, top, w, bottom - top);
      for (const wx of [x, x + w - 6]) {
        ctx.fillStyle = '#7C4A3A'; ctx.fillRect(wx, top, 6, 90);
        ctx.fillStyle = '#5A3526'; for (let y = top + 10; y < top + 90; y += 10) ctx.fillRect(wx, y, 6, 1);
        ctx.fillStyle = wx === x ? '#9A6B55' : '#3B2218'; ctx.fillRect(wx === x ? wx + 4 : wx, top, 2, 90);
      }
      checker(ctx, x + 6, top + 50, w - 12, 20, '#140C08');
      bandedGradient(ctx, x + 6, top + 70, w - 12, bottom - top - 70, ['#10223A', '#0C1A2E', '#081222'], 3);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.35)'; ctx.fillRect(x + 12 + Math.sin(state.frame * 0.05) * 6, top + 72, w - 40, 2);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.2)'; ctx.fillRect(x + 22 - Math.sin(state.frame * 0.05) * 6, top + 80, w - 60, 1);
    }
  }
};

// ---------------------------------------------------------------------------
// Ledges
// ---------------------------------------------------------------------------

/** A gallery in front of a tier of cells: a steel walkway, the railing, the brackets under it. Shaking loose, sparks off the bolts. */
const drawGallery = (ctx: Ctx, x: number, y: number, w: number, going: boolean) => {
  // (bright and solid against the dim cells behind: the thing you can stand on should read as that)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'; ctx.fillRect(x, y + 14, w, 8);
  checker(ctx, x, y + 22, w, 2, 'rgba(0, 0, 0, 0.35)');
  // The brackets under it, inked, lit along the top
  for (let bx = x + 20; bx < x + w - 10; bx += 90) {
    ctx.beginPath(); ctx.moveTo(bx, y + 14); ctx.lineTo(bx + 16, y + 34);
    ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke(); ctx.strokeStyle = '#4B5563'; ctx.lineWidth = 3; ctx.stroke();
    ctx.strokeStyle = '#6B7280'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx - 1, y + 14); ctx.lineTo(bx + 15, y + 34); ctx.stroke();
  }
  // The walkway: diamond plate, lit along the top, its riveted edge
  ctx.fillStyle = INK; ctx.fillRect(x - 1, y - 1, w + 2, 16);
  ctx.fillStyle = '#6B7280'; ctx.fillRect(x, y, w, 14);
  ctx.fillStyle = '#D1D5DB'; ctx.fillRect(x, y, w, 3);
  ctx.fillStyle = '#F3F4F6'; ctx.fillRect(x, y, w, 1);
  ctx.fillStyle = '#4B5563'; for (let gx = x + 4; gx < x + w - 2; gx += 8) ctx.fillRect(gx, y + 5, 4, 4);
  ctx.fillStyle = '#9CA3AF'; for (let gx = x + 4; gx < x + w - 2; gx += 8) ctx.fillRect(gx, y + 5, 2, 1);
  // A yellow safety stripe along its edge
  ctx.fillStyle = '#EAB308'; ctx.fillRect(x, y + 10, w, 3);
  ctx.fillStyle = '#1F2937'; for (let sx = x; sx < x + w; sx += 12) ctx.fillRect(sx, y + 10, 5, 3);
  ctx.fillStyle = '#FDE047'; for (let sx = x + 5; sx < x + w; sx += 12) ctx.fillRect(sx, y + 10, 7, 1);
  // The railing (thin, so it doesn't clutter): the rail lit on top, posts with a lit edge
  ctx.fillStyle = INK; ctx.fillRect(x, y - 29, w, 4);
  for (let rx = x; rx <= x + w; rx += 24) ctx.fillRect(rx - 1, y - 28, 4, 28);
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(x, y - 28, w, 2);
  ctx.fillStyle = '#E5E7EB'; ctx.fillRect(x, y - 28, w, 1);
  for (let rx = x; rx <= x + w; rx += 24) { ctx.fillStyle = '#9CA3AF'; ctx.fillRect(rx, y - 26, 2, 26); ctx.fillStyle = '#D1D5DB'; ctx.fillRect(rx, y - 26, 1, 26); }
  if (going) {
    ctx.fillStyle = '#FDE047'; ctx.fillRect(x + 2, y + 6, 3, 3); ctx.fillRect(x + w - 5, y + 6, 3, 3);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x + 3, y + 7, 1, 1); ctx.fillRect(x + w - 4, y + 7, 1, 1);
    ctx.fillStyle = '#F97316'; ctx.fillRect(x + 5, y + 4, 1, 1); ctx.fillRect(x + w - 7, y + 4, 1, 1);
  }
};

/** The guard tower's walk. */
const drawTowerWalk = (ctx: Ctx, x: number, y: number, w: number) => {
  ctx.fillStyle = INK; ctx.fillRect(x - 1, y - 1, w + 2, 12);
  ctx.fillStyle = '#78716C'; ctx.fillRect(x, y, w, 10);
  ctx.fillStyle = '#A8A29E'; ctx.fillRect(x, y, w, 3);
  ctx.fillStyle = '#D6D3D1'; ctx.fillRect(x, y, w, 1);
  ctx.fillStyle = '#57534E'; ctx.fillRect(x, y + 8, w, 2); for (let px = x + 10; px < x + w; px += 16) ctx.fillRect(px, y + 3, 1, 5);
  ctx.fillStyle = INK; ctx.fillRect(x, y - 27, w, 5); for (let rx = x; rx <= x + w; rx += 18) ctx.fillRect(rx - 1, y - 26, 5, 26);
  ctx.fillStyle = '#57534E'; ctx.fillRect(x, y - 26, w, 3); for (let rx = x; rx <= x + w; rx += 18) ctx.fillRect(rx, y - 26, 3, 26);
  ctx.fillStyle = '#8A847E'; ctx.fillRect(x, y - 26, w, 1); for (let rx = x; rx <= x + w; rx += 18) ctx.fillRect(rx, y - 26, 1, 26);
};

/** An old gun port's stone sill, out over the cistern (it won't hold). */
const drawGunPort = (ctx: Ctx, x: number, y: number, w: number, going: boolean) => {
  ctx.fillStyle = INK; ctx.fillRect(x - 1, y - 1, w + 2, 16);
  ctx.fillStyle = '#8B5A45'; ctx.fillRect(x, y, w, 14);
  ctx.fillStyle = '#A8735C'; ctx.fillRect(x, y, w, 3);
  ctx.fillStyle = '#C08A70'; ctx.fillRect(x, y, w, 1);
  ctx.fillStyle = '#6E4434'; ctx.fillRect(x, y + 11, w, 3);
  checker(ctx, x, y + 9, w, 2, '#6E4434');
  // (the dressed stones it's laid in, each lit on its left)
  for (let bx = x + 4; bx < x + w; bx += 22) { ctx.fillStyle = '#5A3526'; ctx.fillRect(bx, y + 5, 1, 9); ctx.fillStyle = '#A8735C'; ctx.fillRect(bx + 1, y + 5, 1, 9); }
  if (going) {
    for (const [c, ox] of [['#C08A70', 1], ['#1C120D', 0]] as const) {
      ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + w * 0.4 + ox, y); ctx.lineTo(x + w * 0.5 + ox, y + 7); ctx.lineTo(x + w * 0.45 + ox, y + 14); ctx.stroke();
    }
  }
};
