// Drawing Victor's stage: the sky on the trail (the volcano looming bigger and
// nearer as the path curves round toward it), the club at its foot, the cave
// inside, the shaft, the lava, the hazards, and the HUD (the doorman, the
// clashes, the fade through the club doors, the lounge's wide shot).

import { drawFireball, drawFireballs, drawFireColumn, drawFireJet } from '../../render/fx/fireball';
import { drawClubVolcano, ClubVolcano } from '../../scenes/art/clubVolcano';
import { PIX, bandedGradient, checker, hazeBands, pixelRidge, screenRidge, steppedGlow, pixelBlob, tilePattern } from '../../render/pixelArt';
import { INK, dark, ink } from '../../render/npc/kit';
import { slab, column, pipe, letter } from '../barry/rooms';
import type { GameState } from '../../core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../constants';
import { COURSE, isLava } from './course';
import { getVictor, regionOf, enterFade } from './runtime';
import { ventPhase, VENT_HEIGHT, VENT_HALF_WIDTH, BOMB_WARN, BOMB_RADIUS, jetPhase, JET_WARN, barBalls } from './hazards';
import { drawDoormanCorpse, drawDoormanHud, drawClashingMeathead } from './doormanDraw';
import { drawLoungeBack, drawLoungeFront, drawWideShot, drawLoungeHud, drawAftermathFade } from './loungeDraw';
import { drawClubBackdrop, drawClubBack, drawClubLedge, drawClubFront, drawInnocentsTally, neonText, neonStrip, crackLine, drawPartyWindow } from './clubDraw';

type Ctx = CanvasRenderingContext2D;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const visible = (state: GameState, x1: number, x2: number) => x2 > state.camera.x - 250 && x1 < state.camera.x + CANVAS_WIDTH + 250;

// ---------------------------------------------------------------------------
// Sky
// ---------------------------------------------------------------------------

export const drawVictorBackdrop = (ctx: Ctx, state: GameState): boolean => {
  const region = regionOf(state.camera.x + 400);
  if (region === 'inside') { drawCave(ctx, state); return true; }
  if (region === 'club') { drawClubBackdrop(ctx, state); return true; }
  if (region === 'lounge') { ctx.fillStyle = '#0B0612'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); return true; }
  drawTrailSky(ctx, state);
  return true;
};

/** How far along the trail the camera is (0 at the start, 1 at the foot of the volcano). */
const approach = (state: GameState) => clamp01((state.camera.x + 400 - COURSE.approach.x1) / (COURSE.approach.x2 - COURSE.approach.x1));

/** The trail's sky, top to bottom: night over the sea behind, the glow of the volcano and the sunset low down. */
const TRAIL_SKY = ['#1F0A1A', '#3A1020', '#6B1A1A', '#A0321C', '#D9541F', '#F59E0B'];
/** The colour of the air at the horizon: what the far ridges and the foot of the volcano fade into. */
const TRAIL_HAZE = '#C84A1E';

const drawTrailSky = (ctx: Ctx, state: GameState) => {
  const k = approach(state), f = state.frame;
  const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
  bandedGradient(ctx, 0, 0, W, H, TRAIL_SKY, 18);
  // A smudge of ash across the sky, thicker the closer you get: long low drifts of it, ragged at the edges
  const ash = `rgba(30, 20, 20, ${(0.2 + k * 0.3).toFixed(2)})`;
  for (let i = 0; i < 6; i++) { const x = ((i * 190 - f * 0.2 - state.camera.x * 0.02) % (W + 300) + W + 300) % (W + 300) - 150; pixelBlob(ctx, x, 60 + (i % 3) * 40, 200, 26, ash); }
  // Far ridges
  const horizon = 430 - Math.max(-60, Math.min(60, state.camera.y * 0.04));
  pixelRidge(ctx, 0, W, H, screenRidge(11, horizon + 10, 40), state.camera.x * 0.03, { fill: '#3B1414', rim: '#6A2A22', lit: '#4E1C18', shade: '#2E0F0F' });
  // The volcano: off to the right and small at first; as the trail curves round it swings in and looms
  const s = 0.35 + k * 1.45;
  const cx = W * (1.02 - k * 0.52);
  // (the closer you get, the more of it's a nightclub: the searchlights first, then the neon, the windows, the sign)
  drawVolcano(ctx, cx, horizon + 30, s, f, k, { show: 0.2 + k * 0.8 });
  // The air between here and there: the far ridge and the foot of the volcano fading into the glow at the horizon
  hazeBands(ctx, 0, horizon + 14, W, 56, TRAIL_HAZE, 0.04, 0.5, 6);
  // Nearer ridges in front of its foot, each with its own thinner haze
  pixelRidge(ctx, 0, W, H, screenRidge(23, horizon + 60, 60), state.camera.x * 0.08, { fill: '#240C0C', rim: '#4A1E18', lit: '#30120F', shade: '#1A0808' });
  hazeBands(ctx, 0, horizon + 80, W, 40, '#8A2A18', 0.02, 0.3, 4);
  pixelRidge(ctx, 0, W, H, screenRidge(37, horizon + 110, 50), state.camera.x * 0.14, { fill: '#160707', rim: '#2E1210', shade: '#100404' });
  // Ash coming down
  ctx.fillStyle = 'rgba(210, 200, 190, 0.5)';
  for (let i = 0; i < 40; i++) {
    const x = ((hash(i) * W + f * (0.3 + hash(i + 3)) - state.camera.x * 0.3) % W + W) % W, y = (hash(i + 7) * H + f * (0.6 + hash(i + 9) * 0.6)) % H;
    ctx.fillRect(x, y, 2, 2);
  }
};

/** The cone's rock, dark to lit (it's lit a little left of the middle, where the crater's glow comes down it). */
const CONE_TONES = ['#140706', '#22100B', '#2E130E', '#3A1812'];

/**
 * The volcano: a dark cone, glowing streams down its flanks, the crater lit from inside, and a plume of smoke; and
 * the nightclub it is (see clubVolcano.ts), showing as much as `club` says.
 */
export const drawVolcano = (ctx: Ctx, cx: number, base: number, s: number, f: number, k: number, club?: Omit<ClubVolcano, 'cx' | 'top' | 'base' | 'half' | 'crater' | 's' | 'f'>) => {
  const h = 280 * s, half = 360 * s, crater = 54 * s;
  const top = base - h;
  // Smoke plume, rolling up and drifting: chunky puffs, ragged round the edges
  for (let i = 0; i < 9; i++) {
    const t = ((f * 0.4 + i * 30) % 270) / 270;
    const r = (20 + t * 70) * s;
    pixelBlob(ctx, cx + Math.sin(t * 3 + i) * 20 * s + t * 80 * s, top - t * 220 * s, r, r * 0.85, `rgba(${40 + i * 4}, ${30 + i * 3}, ${30 + i * 3}, ${(0.55 * (1 - t)).toFixed(2)})`);
  }
  // Cone: column by column, in four flat tones round it, dithered one into the next
  const x0 = Math.floor((cx - half) / PIX) * PIX;
  for (let x = x0; x < cx + half; x += PIX) {
    const d = Math.abs(x + PIX / 2 - cx);
    const y = d < crater ? top : top + ((d - crater) / (half - crater)) * h;
    const yy = Math.floor(y / PIX) * PIX;
    if (yy >= base) continue;
    const u = (x + PIX / 2 - cx) / half;
    const v = Math.max(0, Math.min(3.999, (1 - Math.abs(u + 0.15) / 1.15) * 4));
    const i = Math.floor(v);
    ctx.fillStyle = CONE_TONES[i];
    ctx.fillRect(x, yy, PIX, base - yy);
    if (v - i > 0.5 && i < 3) checker(ctx, x, yy, PIX, base - yy, CONE_TONES[i + 1]);
    // (a lit edge down the left flank, where the crater's light catches it)
    if (u < -0.2 && u > -0.98) { ctx.fillStyle = '#4A2016'; ctx.fillRect(x, yy, PIX, PIX); }
  }
  // Gullies cut down its flanks by old flows: each a dark groove, lit along its left lip; rock outcrops between them,
  // lit on top; the crater's rim jagged
  ctx.lineCap = 'butt';
  for (let g = 0; g < 9; g++) {
    const u = -0.85 + g * 0.21 + (hash(g) - 0.5) * 0.08;
    const x0 = cx + u * crater, x1 = cx + u * half * (0.95 + hash(g + 3) * 0.1), mx = (x0 + x1) / 2 + (hash(g + 7) - 0.5) * 30 * s;
    const path = () => { ctx.beginPath(); ctx.moveTo(x0, top + 3 * s); ctx.quadraticCurveTo(mx, top + h * 0.5, x1, base - 2); };
    path(); ctx.strokeStyle = 'rgba(8, 3, 3, 0.55)'; ctx.lineWidth = Math.max(2, 4 * s); ctx.stroke();
    ctx.save(); ctx.translate(-Math.max(1, 2 * s), 0); path(); ctx.strokeStyle = 'rgba(90, 40, 28, 0.45)'; ctx.lineWidth = Math.max(1, 1.5 * s); ctx.stroke(); ctx.restore();
  }
  for (let o = 0; o < 14; o++) {
    const fy = 0.18 + hash(o * 3.3) * 0.75, y = top + h * fy, w = crater + (half - crater) * fy;
    const ox = cx + (hash(o * 5.1) - 0.5) * 1.6 * w, ow = (6 + hash(o) * 10) * s, oh = (3 + hash(o + 1) * 4) * s;
    ctx.fillStyle = '#120605'; ctx.fillRect(Math.round(ox - ow / 2), Math.round(y), Math.round(ow), Math.max(2, Math.round(oh)));
    ctx.fillStyle = '#4A2016'; ctx.fillRect(Math.round(ox - ow / 2), Math.round(y), Math.round(ow), Math.max(1, Math.round(s * 1.5)));
  }
  ctx.fillStyle = '#4A2016';
  for (let k2 = -6; k2 <= 6; k2++) { const rx = cx + (k2 / 6) * crater * 1.05, rh = (2 + hash(k2 + 20) * 4) * s; ctx.fillRect(Math.round(rx - 2 * s), Math.round(top - rh + 2), Math.max(2, Math.round(4 * s)), Math.max(2, Math.round(rh))); }
  // The crater, glowing: rings of light, the heart of it near white
  steppedGlow(ctx, cx, top, crater * 1.7, '#F97316', 0.7, 0, 4);
  ctx.fillStyle = '#FEF08A'; ctx.beginPath(); ctx.arc(cx, top, crater * 0.45, 0, Math.PI * 2); ctx.fill();
  // Lava running down the flanks: a dark crusted edge, the molten middle, a white-hot thread down the heart of it,
  // pulsing
  const pulse = 0.8 + 0.2 * Math.sin(f * 0.05);
  for (const [dx, bend] of [[-0.5, -0.3], [0.3, 0.25], [0.7, 0.1]] as [number, number][]) {
    const path = () => { ctx.beginPath(); ctx.moveTo(cx + dx * crater, top + 4); ctx.quadraticCurveTo(cx + dx * half * 0.4 + bend * half * 0.4, top + h * 0.5, cx + dx * half * 0.75, base - 6); };
    path(); ctx.strokeStyle = 'rgba(127, 29, 29, 0.85)'; ctx.lineWidth = Math.max(3, 8 * s); ctx.stroke();
    path(); ctx.strokeStyle = `rgba(249, 115, 22, ${pulse.toFixed(3)})`; ctx.lineWidth = Math.max(2, 5 * s); ctx.stroke();
    path(); ctx.strokeStyle = `rgba(254, 240, 138, ${(pulse * 0.9).toFixed(3)})`; ctx.lineWidth = Math.max(1, 1.6 * s); ctx.stroke();
  }
  if (club) drawClubVolcano(ctx, { cx, top, base, half, crater, s, f, ...club });
  // Now and then it spits (bombs arcing up out of the crater)
  for (let i = 0; i < 3; i++) {
    const t = ((f + i * 70) % 210) / 60;
    if (t > 1) continue;
    const bx = cx + (i - 1) * 40 * s * t * 3, by = top - Math.sin(t * Math.PI) * 120 * s;
    ctx.fillStyle = '#FB923C'; ctx.beginPath(); ctx.arc(bx, by, 3 * s + 2, 0, Math.PI * 2); ctx.fill();
  }
  void k;
};

/**
 * Something painted the once into a canvas of its own (key: what it is), to be put down every frame after: the cave's
 * sky, its rock columns and stalactites, each a strip that wraps round as it scrolls by.
 */
const strips = new Map<string, HTMLCanvasElement>();
const strip = (key: string, w: number, h: number, paint: (g: Ctx) => void): HTMLCanvasElement | null => {
  if (typeof document === 'undefined') return null;
  let c = strips.get(key);
  if (!c) { c = document.createElement('canvas'); c.width = w; c.height = h; paint(c.getContext('2d')!); strips.set(key, c); }
  return c;
};
/** Puts a wrapping strip down across the screen, scrolled `off` (its own repeat is its width). */
const wrapStrip = (ctx: Ctx, c: HTMLCanvasElement, off: number) => {
  const w = c.width;
  for (let x = Math.round(((off % w) + w) % w) - w; x < CANVAS_WIDTH; x += w) ctx.drawImage(c, x, 0);
};

/** Inside the volcano: black rock lit red from below, stalactites, embers going up. */
const drawCave = (ctx: Ctx, state: GameState) => {
  const f = state.frame;
  // (black rock up top, the lava's glow coming up it from below, in bands)
  const sky = strip('victor-cave-sky', CANVAS_WIDTH, CANVAS_HEIGHT, g => bandedGradient(g, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, ['#080304', '#100505', '#1F0806', '#3A0F08', '#5A160A'], 12));
  if (sky) ctx.drawImage(sky, 0, 0); else bandedGradient(ctx, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, ['#080304', '#100505', '#1F0806', '#3A0F08', '#5A160A'], 12);
  // Rock columns far back: each with a lit edge on the side the lava's light comes up, a dithered shadow down the other
  const cols = strip('victor-cave-cols', 1100, CANVAS_HEIGHT, g => {
    for (let i = 0; i < 12; i++) for (const wrap of [0, -1100]) {
      const x = (i * 137) % 1100 + wrap, w = Math.round(40 + hash(i) * 60);
      g.fillStyle = '#140605'; g.fillRect(x, 0, w, CANVAS_HEIGHT);
      g.fillStyle = '#2A0E0A'; g.fillRect(x, CANVAS_HEIGHT * 0.45, 3, CANVAS_HEIGHT * 0.55);
      checker(g, x + 3, CANVAS_HEIGHT * 0.5, 4, CANVAS_HEIGHT * 0.5, '#2A0E0A');
      checker(g, x + w - 6, 0, 6, CANVAS_HEIGHT, '#0A0202');
      // (a seam or two of something glowing in the rock)
      if (hash(i * 3.3) > 0.5) { g.fillStyle = '#7C2D12'; for (let k = 0; k < 6; k++) g.fillRect(x + 8 + Math.round(hash(i + k) * (w - 16)), 200 + k * 50 + Math.round(hash(i * 7 + k) * 30), 2, 2); }
    }
  });
  if (cols) wrapStrip(ctx, cols, -state.camera.x * 0.1 - 150);
  // Stalactites: dark, a lit edge down the lava side, dripping now and then
  const lens = (i: number) => Math.round(30 + hash(i + 5) * 90);
  const stal = strip('victor-cave-stal', 1000, 140, g => {
    for (let i = 0; i < 16; i++) for (const wrap of [0, -1000, 1000]) {
      const x = (i * 83) % 1000 + wrap, len = lens(i);
      for (let y = 0; y < len; y += 2) { const hw = Math.max(1, Math.round(14 * (1 - y / len))); g.fillStyle = '#0C0404'; g.fillRect(x - hw, y, hw * 2, 2); g.fillStyle = '#1E0A08'; g.fillRect(x + hw - 2, y, 2, 2); }
    }
  });
  if (stal) wrapStrip(ctx, stal, -state.camera.x * 0.2 - 100);
  for (let i = 0; i < 16; i++) {
    if ((f + i * 29) % 90 >= 50) continue;
    const x = Math.round(((i * 83 - state.camera.x * 0.2) % 1000 + 1000) % 1000 - 100);
    ctx.fillStyle = '#F97316'; ctx.fillRect(x - 1, lens(i) + ((f + i * 29) % 90) * 4, 2, 4);
  }
  // Embers
  for (let i = 0; i < 30; i++) {
    const x = (hash(i) * CANVAS_WIDTH + Math.sin(f * 0.02 + i) * 20 - state.camera.x * 0.25 + 4000) % CANVAS_WIDTH;
    const y = CANVAS_HEIGHT - ((f * (0.5 + hash(i + 2)) + hash(i + 4) * CANVAS_HEIGHT) % CANVAS_HEIGHT);
    ctx.fillStyle = i % 3 ? '#F97316' : '#FDE047'; ctx.fillRect(x, y, 2, 2);
  }
};

// ---------------------------------------------------------------------------
// World: behind everything that moves
// ---------------------------------------------------------------------------

export const drawVictorBack = (ctx: Ctx, state: GameState) => {
  const rt = getVictor(state)!;
  const region = regionOf(state.camera.x + 400);
  if (region === 'main') drawClub(ctx, state, rt.doorman.phase === 'dead');
  if (region === 'inside') drawShaftWalls(ctx, state);
  if (region === 'club') drawClubBack(ctx, state);
  if (region === 'lounge' || rt.lounge.phase === 'crash') drawLoungeBack(ctx, state, rt.lounge);
};

/** Club Caldera: a slab of black basalt set into the foot of the volcano, a neon sign, a red carpet and a velvet rope. */
const drawClub = (ctx: Ctx, state: GameState, open: boolean) => {
  const C = COURSE.club, f = state.frame;
  if (!visible(state, C.x1 - 400, C.door + 300)) return;
  const y = C.y;
  // The rock it's cut into: rough basalt in blocks, lit down its left edge where the crater's glow catches it
  const rx = C.door - 260;
  ctx.fillStyle = '#140908'; ctx.fillRect(rx, y - 560, 560, 560);
  ctx.fillStyle = basalt(ctx); ctx.fillRect(rx, y - 560, 560, 560);
  ctx.fillStyle = '#3A1812'; ctx.fillRect(rx, y - 560, 4, 560); checker(ctx, rx + 4, y - 560, 6, 560, '#2A110D');
  ctx.fillStyle = INK; ctx.fillRect(rx - 1, y - 560, 1, 560);
  // The front: columns of basalt, each lit down its left, shaded down its right, cracked across where it's jointed
  const fx = C.door - 200;
  for (let i = 0; i < 8; i++) {
    const cx = fx + i * 55, cw = i === 7 ? 440 - 7 * 55 : 55;
    ctx.fillStyle = '#1F0E0B'; ctx.fillRect(cx, y - 420, cw, 420);
    ctx.fillStyle = '#2E1610'; ctx.fillRect(cx + 3, y - 420, 8, 420); checker(ctx, cx + 11, y - 420, 4, 420, '#2E1610');
    ctx.fillStyle = '#160906'; ctx.fillRect(cx + cw - 8, y - 420, 8, 420); checker(ctx, cx + cw - 12, y - 420, 4, 420, '#160906');
    ctx.fillStyle = INK; ctx.fillRect(cx, y - 420, 2, 420);
    ctx.fillStyle = '#3A1C14'; ctx.fillRect(cx + 2, y - 420, 1, 420);
    for (let j = 0; j < 4; j++) { const jy = Math.round(y - 400 + hash(i * 5 + j) * 380); ctx.fillStyle = INK; ctx.fillRect(cx + 2, jy, cw - 2, 1); ctx.fillStyle = '#3A1C14'; ctx.fillRect(cx + 2, jy + 1, cw - 2, 1); }
  }
  slab(ctx, fx - 6, y - 428, 452, 10, '#2A1410');
  // The marquee: a black board edged in gold, bulbs chasing round it
  const mx = C.door + 45 - 200, my = y - 340, mw = 400, mh = 118;
  slab(ctx, mx - 6, my - 6, mw + 12, mh + 12, '#A16207');
  slab(ctx, mx, my, mw, mh, '#120708');
  for (let i = 0; i < 40; i++) {
    const t = i / 40, per = 2 * (mw + mh);
    let d = t * per, bx: number, by: number;
    if (d < mw) { bx = mx + d; by = my - 3; } else if ((d -= mw) < mh) { bx = mx + mw + 3; by = my + d; } else if ((d -= mh) < mw) { bx = mx + mw - d; by = my + mh + 3; } else { d -= mw; bx = mx - 3; by = my + mh - d; }
    const lit = (i + Math.floor(f / 6)) % 3 === 0;
    ctx.fillStyle = INK; ctx.fillRect(Math.round(bx) - 2, Math.round(by) - 2, 4, 4);
    ctx.fillStyle = lit ? '#FEF9C3' : '#854D0E'; ctx.fillRect(Math.round(bx) - 1, Math.round(by) - 1, 2, 2);
  }
  // The sign: big pink neon over the door, flickering a little
  const on = Math.floor(f / 7) % 23 !== 0;
  neonText(ctx, 'CLUB CALDERA', C.door + 45, y - 300, 'bold 24px "Press Start 2P"', '#EC4899', '#FBCFE8', on);
  neonText(ctx, 'MEMBERS ONLY', C.door + 45, y - 260, 'bold 12px "Press Start 2P"', '#22D3EE', '#CFFAFE', on);
  letter(ctx, 'STRICTLY NO SHIRTLESS GUESTS', C.door + 45, y - 236, '8px "Press Start 2P"', '#FDE68A', '#713F12');
  // The doors: black lacquer with brass handles, in a gold frame under a little canopy; open, there's light and bass inside
  const dx = C.door - 20, dw = 130, dh = 190;
  slab(ctx, dx - 8, y - dh - 8, dw + 16, dh + 8, '#A16207');
  if (open) {
    bandedGradient(ctx, dx, y - dh, dw, dh, ['#6D28D9', '#7C3AED', '#A21CAF', '#DB2777', '#EC4899'], 8);
    for (let i = 0; i < 4; i++) { const bx = Math.round((dx + ((f * 3 + i * 40) % dw)) / 2) * 2; ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(bx - 2, y - dh, 10, dh); ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fillRect(bx, y - dh, 6, dh); }
    // (the doors thrown back against the jambs)
    slab(ctx, dx - 30, y - dh, 30, dh, '#0A0505'); slab(ctx, dx + dw, y - dh, 30, dh, '#0A0505');
  } else {
    for (const lx of [dx, dx + dw / 2]) {
      slab(ctx, lx, y - dh, dw / 2, dh, '#0E0808');
      // (the leaf's panels, bevelled)
      for (const py of [y - dh + 14, y - dh / 2 + 10]) { ctx.fillStyle = '#060303'; ctx.fillRect(lx + 10, py, dw / 2 - 20, dh / 2 - 34); ctx.fillStyle = '#2A1A1A'; ctx.fillRect(lx + 10, py + dh / 2 - 36, dw / 2 - 20, 2); ctx.fillRect(lx + dw / 2 - 12, py, 2, dh / 2 - 34); }
      ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(lx + 6, y - dh + 4, 3, dh - 8);
    }
    for (const hx of [dx + dw / 2 - 12, dx + dw / 2 + 6]) column(ctx, hx, y - dh / 2, 6, 18, '#CA8A04');
  }
  slab(ctx, dx - 40, y - dh - 22, dw + 80, 14, '#1C1917');
  neonStrip(ctx, dx - 38, y - dh - 9, dw + 76, 2, '#EC4899', on ? 1 : 0.3);
  // Red carpet to the door (gold edged), velvet rope on brass posts
  ctx.fillStyle = INK; ctx.fillRect(C.door - 320, y - 4, 340, 7);
  ctx.fillStyle = '#991B1B'; ctx.fillRect(C.door - 320, y - 3, 340, 5);
  ctx.fillStyle = '#DC2626'; ctx.fillRect(C.door - 320, y - 3, 340, 1);
  ctx.fillStyle = '#CA8A04'; ctx.fillRect(C.door - 320, y - 2, 340, 1);
  const ropeX = C.door - 300;
  for (const px of [ropeX, ropeX + 120]) { column(ctx, px - 3, y - 50, 6, 50, '#CA8A04'); slab(ctx, px - 9, y - 5, 18, 5, '#A16207', 1); }
  // (the rope sags between them, inked, a sheen along it)
  const ropePts: [number, number][] = [];
  for (let k = 0; k <= 12; k++) { const t = k / 12; ropePts.push([ropeX + 120 * t, y - 44 + 44 * t * (1 - t)]); }
  const stroke = (w: number, c: string, dy = 0) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ropePts.forEach(([px, py], k) => k ? ctx.lineTo(px, py + dy) : ctx.moveTo(px, py + dy)); ctx.stroke(); };
  stroke(7, INK); stroke(5, '#991B1B'); stroke(2, '#DC2626', -1);
  for (const px of [ropeX, ropeX + 120]) { ink(ctx, () => ctx.arc(px, y - 52, 6, 0, Math.PI * 2), '#CA8A04'); ctx.fillStyle = '#FEF08A'; ctx.fillRect(px - 3, y - 56, 2, 2); }
};

/** Rough-cut basalt (a tile): blocks of it in uneven courses, the joints dark, a lit lip under each. */
const basalt = (ctx: Ctx) => tilePattern(ctx, 'victor-basalt', 96, 64, g => {
  for (let row = 0; row < 3; row++) {
    const y0 = [0, 22, 42][row], h = [22, 20, 22][row];
    for (let x = -32 + row * 20; x < 96; x += 40 + row * 6) {
      g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(((x % 96) + 96) % 96, y0, 2, h);
      g.fillStyle = 'rgba(255,200,170,0.05)'; g.fillRect(((x + 2) % 96 + 96) % 96, y0 + 2, 1, h - 4);
    }
    g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(0, y0 + h - 2, 96, 2);
    g.fillStyle = 'rgba(255,200,170,0.06)'; g.fillRect(0, y0, 96, 1);
  }
  g.fillStyle = 'rgba(0,0,0,0.25)'; for (let i = 0; i < 18; i++) g.fillRect((i * 37) % 94, (i * 23) % 62, 2, 2);
});

/** The shaft: rock walls with glowing seams, pipes and furnace grilles, and the lit window near the top. */
const drawShaftWalls = (ctx: Ctx, state: GameState) => {
  const S = COURSE.shaft, f = state.frame;
  if (!visible(state, S.x1 - 200, S.x2 + 200)) return;
  const top = Math.max(S.top - 520, state.camera.y - 20), bottom = Math.min(S.floor + 200, state.camera.y + CANVAS_HEIGHT + 20);
  // Back wall of the chimney: darker, rough blocks, with pipes running up it
  ctx.fillStyle = 'rgba(20, 8, 6, 0.85)'; ctx.fillRect(S.x1, top, S.x2 - S.x1, bottom - top);
  ctx.fillStyle = basalt(ctx); ctx.fillRect(S.x1, top, S.x2 - S.x1, bottom - top);
  for (const px of [S.x1 + 120, S.x1 + 420, S.x2 - 90]) {
    column(ctx, px, top, 14, bottom - top, '#4A3128');
    // (flanged and bolted every so often)
    for (let y = Math.ceil(top / 160) * 160; y < bottom; y += 160) { slab(ctx, px - 3, y, 20, 8, '#2A1B16', 1); ctx.fillStyle = '#78574A'; ctx.fillRect(px - 1, y + 3, 2, 2); ctx.fillRect(px + 13, y + 3, 2, 2); }
  }
  // Furnace grilles glowing in the back wall: an iron frame, the fire behind the bars in bands, its glow round it
  for (let y = Math.ceil((top - S.floor) / 400) * 400 + S.floor; y < bottom; y += 400) {
    const gx = Math.round(S.x1 + 250 + (hash(y) - 0.5) * 200);
    const glow = 0.5 + 0.5 * Math.sin(f * 0.08 + y);
    steppedGlow(ctx, gx, y - 35, 80, '#F97316', 0.08 + glow * 0.08, 0.02, 4);
    slab(ctx, gx - 40, y - 60, 80, 50, '#1C1917');
    ctx.save(); ctx.globalAlpha = 0.6 + glow * 0.4;
    for (let i = 0; i < 5; i++) bandedGradient(ctx, gx - 34 + i * 15, y - 54, 9, 38, ['#7C2D12', '#C2410C', '#F97316', '#FDBA74'], 4);
    ctx.restore();
    ctx.fillStyle = INK; for (let i = 0; i < 5; i++) { ctx.fillRect(gx - 35 + i * 15, y - 55, 11, 1); ctx.fillRect(gx - 35 + i * 15, y - 55, 1, 40); }
    ctx.fillStyle = '#44403C'; ctx.fillRect(gx - 38, y - 58, 76, 1);
  }
  // The side walls themselves: rock, lit along the face toward the shaft, lava in its cracks
  for (const [x, w, face] of [[S.x1 - 60, 60, S.x1 - 4], [S.x2, 60, S.x2]] as [number, number, number][]) {
    ctx.fillStyle = '#1A0A07'; ctx.fillRect(x, top, w, bottom - top);
    ctx.fillStyle = basalt(ctx); ctx.fillRect(x, top, w, bottom - top);
    ctx.fillStyle = '#3A1812'; ctx.fillRect(face, top, 4, bottom - top);
    checker(ctx, face === S.x2 ? face + 4 : face - 6, top, 6, bottom - top, '#2A110D');
    ctx.fillStyle = INK; ctx.fillRect(face === S.x2 ? face - 1 : face + 4, top, 1, bottom - top);
    for (let y = Math.ceil(top / 70) * 70; y < bottom; y += 70) crackLine(ctx, [[x + 10, y], [x + 30, y + 20 + hash(y + x) * 20], [x + 50, y + 34]], 'rgba(249, 115, 22, 0.8)', 'rgba(249, 115, 22, 0.2)');
  }
  // The opening at the foot of the left wall (where the river comes in) stays dark
  ctx.fillStyle = '#0A0404'; ctx.fillRect(S.x1 - 60, S.floor - 170, 60, 170);
  ctx.fillStyle = '#3A1812'; ctx.fillRect(S.x1 - 60, S.floor - 172, 60, 2); ctx.fillStyle = INK; ctx.fillRect(S.x1 - 60, S.floor - 170, 60, 1);
  // The window at the top of the right wall: into the club itself (its main floor: the VIP lounge is further on), warm
  // light and silhouettes moving behind the glass
  const w = S.window;
  if (w.y > state.camera.y - 200 && w.y < state.camera.y + CANVAS_HEIGHT + 200) {
    drawPartyWindow(ctx, w.x, w.y, f, 'CLUB CALDERA');
    // Bass thumping out of it (rings of it, stepped)
    if (Math.floor(f / 15) % 2) for (let k = 0; k < 9; k++) { const a = Math.PI * (0.62 + k * 0.095); ctx.fillStyle = 'rgba(236, 72, 153, 0.6)'; ctx.fillRect(Math.round(w.x - 10 + Math.cos(a) * 30), Math.round(w.y + Math.sin(a) * 30), 2, 4); }
  }
};

// ---------------------------------------------------------------------------
// World: over the terrain, behind the enemies
// ---------------------------------------------------------------------------

export const drawVictorMid = (ctx: Ctx, state: GameState) => {
  const rt = getVictor(state)!;
  drawLava(ctx, state);
  drawLedges(ctx, state);
  drawRafts(ctx, state);
  drawVents(ctx, state);
  drawJets(ctx, state);
  drawBars(ctx, state);
  drawBombs(ctx, state);
  if (rt.doorman.corpse) drawDoormanCorpse(ctx, rt.doorman.corpse, state.frame);
};

const drawLava = (ctx: Ctx, state: GameState) => {
  const f = state.frame, bottom = state.camera.y + CANVAS_HEIGHT + 60;
  for (const r of state.groundRuns) {
    if (!isLava(r) || !visible(state, r.x1, r.x2)) continue;
    const x1 = Math.max(r.x1, state.camera.x - 260), x2 = Math.min(r.x2, state.camera.x + CANVAS_WIDTH + 260);
    const y = r.y1;
    // The glow above it, in steps
    hazeBands(ctx, x1, y - 40, x2 - x1, 40, '#F97316', 0, 0.22, 5);
    // The lava: bright at the top, in bands going down, the surface rolling in 4px steps; darker crust riding in it
    // (the body of it, below where the surface rolls, is the one banded strip, painted the once and put down; the
    // rolling top's filled in a column at a time; no clipping to a few hundred little rects every frame)
    const xs = Math.floor(x1 / 4) * 4;
    const surf = (x: number) => Math.round((y + Math.sin(x * 0.05 + f * 0.08) * 3) / 2) * 2;
    const body = strip('victor-lava-body', 64, 124, g => bandedGradient(g, 0, 0, 64, 124, ['#FDE047', '#FB923C', '#F97316', '#DC2626', '#B91C1C', '#7F1D1D', '#450A0A'], 12));
    if (body) { ctx.fillStyle = ctx.createPattern(body, 'repeat-x')!; ctx.save(); ctx.translate(0, y - 4); ctx.fillRect(xs, 8, x2 - xs, 116); ctx.restore(); }
    else bandedGradient(ctx, xs, y - 4, x2 - xs, 124, ['#FDE047', '#FB923C', '#F97316', '#DC2626', '#B91C1C', '#7F1D1D', '#450A0A'], 12);
    ctx.fillStyle = '#450A0A'; ctx.fillRect(xs, y + 120, x2 - xs, Math.max(0, bottom - y - 120));
    ctx.fillStyle = '#FDE047'; for (let x = xs; x < x2; x += 4) { const sy = surf(x); if (sy < y + 4) ctx.fillRect(x, sy, 4, y + 4 - sy); }
    for (let x = Math.ceil(x1 / 60) * 60; x < x2; x += 60) {
      const cx = Math.round((x + ((f * 0.5 + hash(x) * 60) % 60)) / 2) * 2, cy = Math.round((y + 14 + hash(x) * 20) / 2) * 2;
      // (a crust: a chunky lozenge of dark, a lit lip on it)
      ctx.fillStyle = 'rgba(69, 10, 10, 0.6)'; ctx.fillRect(cx - 14, cy - 2, 28, 4); ctx.fillRect(cx - 18, cy, 36, 2); ctx.fillRect(cx - 10, cy - 4, 20, 2);
      ctx.fillStyle = 'rgba(253, 224, 71, 0.5)'; ctx.fillRect(cx - 10, cy - 4, 12, 2);
    }
    // (the skin of it, lit along the top)
    for (let x = xs; x < x2; x += 4) { const sy = surf(x); ctx.fillStyle = '#FEF9C3'; ctx.fillRect(x, sy, 4, 2); ctx.fillStyle = '#FDE047'; ctx.fillRect(x, sy + 2, 4, 2); }
    // Bubbles popping: a ring swelling up, then gone
    for (let x = Math.ceil(x1 / 90) * 90; x < x2; x += 90) {
      const t = (f + hash(x) * 60) % 60;
      if (t >= 12) continue;
      const bx = x + hash(x + 1) * 60, by = y - t * 0.6, br = 3 + t * 0.3;
      pixelBlob(ctx, bx, by, br + 1, br + 1, '#EA580C');
      pixelBlob(ctx, bx, by, br, br, '#FEF08A');
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(Math.round(bx - br * 0.5), Math.round(by - br * 0.6), 2, 2);
    }
  }
};

const drawLedges = (ctx: Ctx, state: GameState) => {
  for (const l of COURSE.ledges) {
    if (!visible(state, l.x, l.x + l.w) || l.y < state.camera.y - 40 || l.y > state.camera.y + CANVAS_HEIGHT + 40) continue;
    if (drawClubLedge(ctx, l, state.frame)) continue;
    if (l.look === 'catwalk') {
      // Steel grating on brackets out of the wall: the deck lit along its top edge, the holes through it, inked
      column(ctx, l.x + 10, l.y + 8, 5, 18, '#3F3F46'); column(ctx, l.x + l.w - 15, l.y + 8, 5, 18, '#3F3F46');
      pipe(ctx, l.x, l.y, l.w, 8, '#52525B');
      for (let x = l.x + 4; x < l.x + l.w - 4; x += 8) { ctx.fillStyle = '#18181B'; ctx.fillRect(x, l.y + 2, 4, 4); ctx.fillStyle = '#71717A'; ctx.fillRect(x, l.y + 6, 4, 1); }
      ctx.fillStyle = '#A1A1AA'; ctx.fillRect(l.x, l.y, l.w, 2); ctx.fillStyle = '#D4D4D8'; ctx.fillRect(l.x, l.y, l.w, 1);
      ctx.fillStyle = INK; ctx.fillRect(l.x - 1, l.y, 1, 8); ctx.fillRect(l.x + l.w, l.y, 1, 8); ctx.fillRect(l.x, l.y - 3, l.w, 1);
      for (let x = l.x; x < l.x + l.w; x += 20) { ctx.fillStyle = '#FACC15'; ctx.fillRect(x, l.y - 2, 10, 2); ctx.fillStyle = '#1C1917'; ctx.fillRect(x + 10, l.y - 2, 10, 2); }
    } else {
      // A slab of basalt with a lip of glowing cracks: lit along the top, its underside in shadow, inked round
      const shape = () => { ctx.moveTo(l.x, l.y); ctx.lineTo(l.x + l.w, l.y); ctx.lineTo(l.x + l.w - 10, l.y + 22); ctx.lineTo(l.x + 12, l.y + 26); ctx.closePath(); };
      ctx.save(); ctx.beginPath(); shape(); ctx.clip();
      ctx.fillStyle = '#2A1410'; ctx.fillRect(l.x, l.y, l.w, 26);
      ctx.fillStyle = '#1A0B08'; ctx.fillRect(l.x, l.y + 16, l.w, 10); checker(ctx, l.x, l.y + 12, l.w, 4, '#1A0B08');
      ctx.fillStyle = '#3A1C14'; ctx.fillRect(l.x, l.y + 5, 6, 12);
      ctx.restore();
      ctx.beginPath(); shape(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = '#4A2016'; ctx.fillRect(l.x, l.y, l.w, 2);
      ctx.fillStyle = '#1A0B08'; ctx.fillRect(l.x, l.y + 2, l.w, 3);
      for (let x = l.x + 6; x < l.x + l.w - 6; x += 16) { const cx = Math.round(x + hash(x) * 6); ctx.fillStyle = 'rgba(249, 115, 22, 0.3)'; ctx.fillRect(cx - 2, l.y + 1, 8, 4); ctx.fillStyle = '#F97316'; ctx.fillRect(cx, l.y + 2, 4, 2); ctx.fillStyle = '#FDE047'; ctx.fillRect(cx + 1, l.y + 2, 2, 1); }
    }
  }
};

const drawRafts = (ctx: Ctx, state: GameState) => {
  const rt = getVictor(state)!;
  for (const r of rt.hazards.rafts) {
    const b = r.block;
    if (r.t > 0 || !visible(state, b.x, b.x + b.w)) continue;
    const shape = () => { ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + b.w, b.y); ctx.lineTo(b.x + b.w - 8, b.y + 18); ctx.lineTo(b.x + 10, b.y + 20); ctx.closePath(); };
    // A crust of rock riding the lava: lit on top, shaded under, the molten edge where it's sitting in it
    ctx.save(); ctx.beginPath(); shape(); ctx.clip();
    ctx.fillStyle = '#1C1917'; ctx.fillRect(b.x, b.y, b.w, 20);
    ctx.fillStyle = '#292524'; ctx.fillRect(b.x, b.y + 3, b.w, 4); checker(ctx, b.x, b.y + 7, b.w, 2, '#292524');
    ctx.fillStyle = 'rgba(249, 115, 22, 0.9)'; ctx.fillRect(b.x, b.y + 14, b.w, 3);
    ctx.fillStyle = 'rgba(253, 224, 71, 0.9)'; ctx.fillRect(b.x, b.y + 14, b.w, 1);
    checker(ctx, b.x, b.y + 12, b.w, 2, 'rgba(249, 115, 22, 0.6)');
    ctx.restore();
    ctx.beginPath(); shape(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#44403C'; ctx.fillRect(b.x + 4, b.y, b.w - 8, 3);
    ctx.fillStyle = '#78716C'; ctx.fillRect(b.x + 4, b.y, b.w - 8, 1);
    ctx.fillStyle = '#0C0A09'; for (let k = 1; k < 4; k++) ctx.fillRect(Math.round(b.x + (b.w * k) / 4 + hash(b.w + k) * 8), b.y + 4, 2, 6);
  }
};

const drawVents = (ctx: Ctx, state: GameState) => {
  const f = state.frame;
  for (const v of COURSE.vents) {
    if (!visible(state, v.x - 60, v.x + 60)) continue;
    const ph = ventPhase(v, f);
    // The crack (a lava spout's just a patch of bubbling): a split in the rock, its lip lit, the glow down in it
    if (!v.lava) {
      pixEllipse(ctx, v.x, v.y + 1, 23, 6, INK);
      pixEllipse(ctx, v.x, v.y + 1, 22, 5, '#0A0404');
      ctx.fillStyle = '#4A2016'; ctx.fillRect(Math.round(v.x) - 20, Math.round(v.y) - 4, 14, 2); ctx.fillRect(Math.round(v.x) + 6, Math.round(v.y) - 4, 12, 2);
    }
    const gw = 14 + (ph.warning ? Math.sin(f * 0.8) * 3 : 0);
    pixEllipse(ctx, v.x, v.y, gw, 3, `rgba(249, 115, 22, ${ph.warning ? 0.9 : 0.35})`);
    if (ph.warning) pixEllipse(ctx, v.x, v.y, gw * 0.5, 1, '#FDE047');
    if (ph.warning && v.lava) drawSpoutWarning(ctx, v.x, v.y, ph.t / ph.warn, f);
    else if (ph.warning) {
      // Smoke and sparks: it's about to go
      for (let i = 0; i < 4; i++) {
        const t = ((f * 2 + i * 13) % 40) / 40, r = 5 + t * 10;
        pixelBlob(ctx, v.x + Math.sin(i * 2 + f * 0.1) * 8, v.y - t * 60, r, r, `rgba(120, 113, 108, ${(0.6 * (1 - t)).toFixed(2)})`);
      }
      ctx.fillStyle = '#FDE047'; ctx.fillRect(v.x - 8 + (f * 7) % 16, v.y - 10 - (f * 3) % 20, 2, 2);
    }
    if (ph.burning) {
      const k = Math.min(1, ph.t < ph.warn + 6 ? (ph.t - ph.warn + 1) / 6 : 1);
      drawFireColumn(ctx, v.x, v.y, VENT_HALF_WIDTH, VENT_HEIGHT * k, f, v.x, !!v.lava);
    }
  }
};

/**
 * A lava spout about to go (k: 0 to 1 through the warning): the lava swells up in a glowing dome and boils, spatter
 * jumps off it, and the column it's about to throw up shows as a shimmer of heat, brighter the closer it gets.
 */
const drawSpoutWarning = (ctx: Ctx, x: number, y: number, k: number, f: number) => {
  const late = k > 0.7;
  const pulse = 0.5 + 0.5 * Math.sin(f * (late ? 1.1 : 0.5));
  // The column to come: a heat shimmer where it'll be, the full height of it (in bands, fading up, the edges stepped)
  ctx.save();
  const a = (0.1 + 0.3 * k) * (0.6 + 0.4 * pulse);
  ctx.beginPath();
  for (let yy = 0; yy < VENT_HEIGHT; yy += 14) {
    const l = x - VENT_HALF_WIDTH * (1 - yy / VENT_HEIGHT * 0.5) + Math.sin(f * 0.3 + yy * 0.1) * 3;
    const r = x + VENT_HALF_WIDTH * (1 - yy / VENT_HEIGHT * 0.5) + Math.sin(f * 0.3 + yy * 0.1 + 2) * 3;
    ctx.rect(Math.round(l / 2) * 2, y - yy - 14, Math.round((r - l) / 2) * 2, 14);
  }
  ctx.clip();
  hazeBands(ctx, x - VENT_HALF_WIDTH - 6, y - VENT_HEIGHT, VENT_HALF_WIDTH * 2 + 12, VENT_HEIGHT, '#F97316', 0, a, 6);
  ctx.restore(); ctx.save();
  // Its edges, dashed, flickering in the last moments
  if (late && f % 6 < 4) {
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.55)'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.lineDashOffset = -f * 2;
    ctx.beginPath(); ctx.moveTo(x - VENT_HALF_WIDTH, y); ctx.lineTo(x - VENT_HALF_WIDTH * 0.5, y - VENT_HEIGHT); ctx.moveTo(x + VENT_HALF_WIDTH, y); ctx.lineTo(x + VENT_HALF_WIDTH * 0.5, y - VENT_HEIGHT); ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();
  // The lava swelling up: a dome, bigger and brighter as it comes
  const r = 16 + 22 * k, h = 4 + 16 * k + (late ? pulse * 4 : 0);
  const hot = late ? (f % 8 < 4 ? '#FDE047' : '#FB923C') : '#EA580C';
  pixEllipse(ctx, x, y + 2, r + 5, h * 0.5 + 4, INK, true);
  pixEllipse(ctx, x, y + 2, r + 4, h * 0.5 + 3, '#7C2D12', true);
  pixEllipse(ctx, x, y + 2, r + 1, h + 1, INK, true);
  pixEllipse(ctx, x, y + 2, r, h, dark(hot, 0.2), true);
  pixEllipse(ctx, x - r * 0.08, y + 2, r * 0.8, h * 0.85, hot, true);
  pixEllipse(ctx, x - r * 0.3, y + 2 - h * 0.55, r * 0.35, h * 0.25, 'rgba(254, 240, 138, 0.85)');
  // Boiling: bubbles swelling and popping round it
  for (let i = 0; i < 5; i++) {
    const bt = ((f + i * 11) % 24) / 24;
    const bx = x + Math.sin(i * 2.3) * (r + 6);
    ctx.strokeStyle = `rgba(253, 224, 71, ${0.9 * (1 - bt)})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(bx, y - 1, 2 + bt * 6 * (0.5 + k), Math.PI, 0); ctx.stroke();
  }
  // Spatter, higher as it comes
  for (let i = 0; i < 3 + Math.floor(k * 5); i++) {
    const st = ((f * 1.5 + i * 17) % 30) / 30;
    const sx = x + Math.sin(i * 1.7 + Math.floor((f + i * 17) / 30)) * r * 0.8;
    const sy = y - Math.sin(st * Math.PI) * (20 + 60 * k);
    ctx.fillStyle = i % 2 ? '#FDE047' : '#F97316'; ctx.fillRect(sx - 2, sy - 2, 4, 4);
  }
  // Smoke off the top
  for (let i = 0; i < 3; i++) {
    const t = ((f * 2 + i * 13) % 40) / 40, sr = 6 + t * 12;
    pixelBlob(ctx, x + Math.sin(i * 2 + f * 0.1) * 10, y - 20 - t * 80, sr, sr, `rgba(68, 64, 60, ${(0.5 * (1 - t)).toFixed(2)})`);
  }
};

/** A flat ellipse in 2px rows (a crack, a dome, a pool): `half` for just the top half of it. */
const pixEllipse = (ctx: Ctx, cx: number, cy: number, rw: number, rh: number, c: string, half = false) => {
  ctx.fillStyle = c;
  const n = Math.max(1, Math.ceil(rh / 2));
  for (let i = -n; i < (half ? 0 : n); i++) {
    const v = (i + 0.5) / n, w = Math.round(rw * Math.sqrt(Math.max(0, 1 - v * v)) / 2) * 2;
    if (w > 0) ctx.fillRect(Math.round(cx / 2) * 2 - w, Math.round(cy / 2) * 2 + i * 2, w * 2, 2);
  }
};

const drawJets = (ctx: Ctx, state: GameState) => {
  const f = state.frame;
  for (const j of COURSE.jets) {
    if (j.y < state.camera.y - 60 || j.y > state.camera.y + CANVAS_HEIGHT + 60) continue;
    const ph = jetPhase(j, f);
    // The nozzle (in the club, a chrome pyro cannon with a neon ring)
    const club = regionOf(j.x) === 'club';
    const nx = j.dir > 0 ? j.x : j.x - 22, mx = j.dir > 0 ? j.x + 18 : j.x - 22;
    // (a barrel lit along the top, a collar where it's set in the wall, the muzzle)
    slab(ctx, j.dir > 0 ? nx - 4 : nx + 18, j.y - 16, 8, 32, club ? '#3F3F46' : '#292524', 1);
    pipe(ctx, nx, j.y - 12, 22, 24, club ? '#D4D4D8' : '#52525B');
    if (club) { neonStrip(ctx, mx, j.y - 8, 4, 16, '#F472B6', 0.7); ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(j.dir > 0 ? j.x + 2 : j.x - 20, j.y - 9, 16, 2); }
    else { ctx.fillStyle = '#18181B'; ctx.fillRect(mx, j.y - 8, 4, 16); ctx.fillStyle = INK; ctx.fillRect(mx, j.y - 8, 4, 1); }
    ctx.fillStyle = INK; ctx.fillRect(nx, j.y - 12, 1, 24); ctx.fillRect(nx + 21, j.y - 12, 1, 24);
    if (ph.warning) {
      const gr = 8 + (ph.t / JET_WARN) * 6;
      steppedGlow(ctx, j.x + j.dir * 24, j.y, gr, '#F97316', 0.5 + 0.5 * Math.sin(f * 0.9), 0.25, 3);
      steppedGlow(ctx, j.x + j.dir * 24, j.y, gr * 0.45, '#FDE047', 0.8, 0.5, 2);
      ctx.fillStyle = '#FDE047'; for (let i = 0; i < 3; i++) ctx.fillRect(j.x + j.dir * (26 + ((f * 5 + i * 9) % 30)), j.y - 6 + i * 5, 2, 2);
    }
    if (ph.burning) {
      const len = j.len * Math.min(1, (ph.t - JET_WARN + 1) / 8);
      ctx.save(); ctx.translate(j.x + j.dir * 20, j.y); ctx.scale(j.dir, 1);
      drawFireJet(ctx, 0, 0, len, 30, f, j.x + j.y);
      ctx.restore();
    }
  }
};

const drawBars = (ctx: Ctx, state: GameState) => {
  for (const b of COURSE.bars) {
    if (b.y < state.camera.y - 200 || b.y > state.camera.y + CANVAS_HEIGHT + 200) continue;
    if (regionOf(b.x) === 'club') {
      // A disco ball at the hub: mirror tiles in rows, lit upper left, glints going round
      ctx.fillStyle = INK; ctx.fillRect(b.x - 1, b.y - 400, 3, 386); ctx.fillStyle = '#A1A1AA'; ctx.fillRect(b.x, b.y - 400, 1, 386);
      ink(ctx, () => ctx.arc(b.x, b.y, 14, 0, Math.PI * 2), '#71717A');
      ctx.save(); ctx.beginPath(); ctx.arc(b.x, b.y, 13, 0, Math.PI * 2); ctx.clip();
      const spin = Math.floor(state.frame / 6) % 2;
      for (let ty = -14; ty < 14; ty += 4) for (let tx = -14 + ((ty / 4 + spin) & 1) * 2; tx < 14; tx += 4) {
        const d = (tx + ty + 4) / 28;
        ctx.fillStyle = d < -0.35 ? '#F4F4F5' : d < 0 ? '#D4D4D8' : d < 0.35 ? '#A1A1AA' : '#52525B';
        ctx.fillRect(b.x + tx, b.y + ty, 3, 3);
      }
      ctx.restore();
      for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2 + state.frame * 0.05; ctx.fillStyle = k % 3 ? '#E4E4E7' : '#FFFFFF'; ctx.fillRect(Math.round(b.x + Math.cos(a) * 8 - 2), Math.round(b.y + Math.sin(a) * 8 - 2), 4, 4); }
    } else {
      ink(ctx, () => ctx.arc(b.x, b.y, 10, 0, Math.PI * 2), '#44403C');
      ctx.fillStyle = '#292524'; ctx.beginPath(); ctx.arc(b.x, b.y, 9, Math.PI * 0.1, Math.PI * 0.9); ctx.fill();
      ctx.fillStyle = '#78716C'; ctx.fillRect(b.x - 5, b.y - 6, 4, 2); ctx.fillRect(b.x - 6, b.y - 4, 2, 2);
    }
    // (each ball streaming a tail back along the way it's swinging)
    drawFireballs(ctx, barBalls(b, state.frame).map(ball => ({ x: ball.x, y: ball.y, r: 9, vx: -(ball.y - b.y) * b.speed, vy: (ball.x - b.x) * b.speed })), state.frame, { seed: b.x, tail: 1 });
  }
};

const drawBombs = (ctx: Ctx, state: GameState) => {
  const rt = getVictor(state)!;
  for (const b of rt.hazards.bombs) {
    if (b.t < BOMB_WARN) {
      // Where it's going to land: a ring closing in, and the bomb coming down on it out of the sky
      const k = b.t / BOMB_WARN;
      ctx.strokeStyle = `rgba(239, 68, 68, ${0.5 + 0.5 * (Math.floor(b.t / 4) % 2)})`; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(b.x, b.ground - 2, BOMB_RADIUS * (1.2 - k * 0.4), 10, 0, 0, Math.PI * 2); ctx.stroke();
      const bx = b.x + (1 - k) * 380, by = b.ground - 20 - (1 - k) * 700 + Math.sin(k * Math.PI) * -60;
      for (let i = 1; i < 5; i++) pixelBlob(ctx, bx + i * 14, by - i * 22, 8 + i * 2, 8 + i * 2, 'rgba(120, 113, 108, 0.5)');
      // (a lump of rock, glowing through its cracks, lit on the side toward the crater)
      ink(ctx, () => ctx.arc(bx, by, 16, 0, Math.PI * 2), '#1C1917', 2);
      ctx.fillStyle = '#292524'; ctx.beginPath(); ctx.arc(bx - 1, by - 1, 13, Math.PI * 0.95, Math.PI * 1.7); ctx.lineTo(bx - 1, by - 1); ctx.fill();
      ctx.fillStyle = '#44403C'; ctx.fillRect(Math.round(bx) - 9, Math.round(by) - 10, 4, 2); ctx.fillRect(Math.round(bx) - 11, Math.round(by) - 8, 2, 4);
      crackLine(ctx, [[bx - 10, by - 4], [bx - 2, by + 2], [bx + 8, by - 6]], '#F97316', 'rgba(249, 115, 22, 0.3)');
      crackLine(ctx, [[bx - 2, by + 2], [bx, by + 10]], '#EA580C');
    } else {
      // The blast
      const k = (b.t - BOMB_WARN) / 18;
      // (a ball of fire in hard bands, cooling as it goes)
      ctx.save(); ctx.globalAlpha = Math.max(0, 1 - k);
      steppedGlow(ctx, b.x, b.ground - 20, BOMB_RADIUS * (0.6 + k), '#F97316', 0.35, 0.1, 4);
      drawFireball(ctx, b.x, b.ground - 20, BOMB_RADIUS * (0.6 + k) * 0.7, b.t, { seed: b.x, heat: k > 0.55 ? -1 : 1 });
      ctx.restore();
    }
  }
};

// ---------------------------------------------------------------------------
// World: in front of everything
// ---------------------------------------------------------------------------

export const drawVictorFront = (ctx: Ctx, state: GameState) => {
  const rt = getVictor(state)!;
  drawClashingMeathead(ctx, state, rt.doorman);
  if (rt.lounge.phase === 'crash' || regionOf(state.camera.x + 400) === 'lounge') drawLoungeFront(ctx, state, rt.lounge);
  if (regionOf(state.camera.x + 400) === 'club') drawClubFront(ctx, state);
};

// ---------------------------------------------------------------------------
// Screen space
// ---------------------------------------------------------------------------

export const drawVictorHud = (ctx: Ctx, state: GameState) => {
  const rt = getVictor(state)!;
  drawDoormanHud(ctx, state, rt.doorman);
  drawLoungeHud(ctx, state, rt.lounge);
  drawInnocentsTally(ctx, state);
  // Through the club doors
  const fade = enterFade(rt);
  if (fade > 0) { ctx.fillStyle = `rgba(0, 0, 0, ${fade})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  drawWideShot(ctx, state, rt.lounge);
  drawAftermathFade(ctx, rt.lounge);
};
