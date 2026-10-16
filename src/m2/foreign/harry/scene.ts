// The crash site drawn (prototype-grade, the fight's own pieces in full: rambo.ts, liberty.ts): the sky through the
// smoke at whatever hour it is, the AMERICA pavilion's dig (its dirt berm along the back of the floor, the nine wrecked
// landmark mechs from the gauntlet piled along it, burning), the poured slab he fights on, the two scaffold towers at
// its ends (plywood hoarding to the top of the shot: walls; the left one's chain-link gate), the helicopter's burning
// wreck where he came to, the pavilion's sign. Revisits: her rubble, the gun and the torch on the floor, a chalk
// outline, the gate open.

import type { GameState } from '../../../m1/game/core/state';
import { drawTodSky } from '../../timeOfDay';
import { box, mix, hour, dimmed, ramp6, viewIn, onScreen, postBoard, LOOKS, LIP, INK } from '../kit';
import { drawMech } from '../heli/mechArt';
import { drawCopter } from '../heli/copter';
import type { MechId } from '../heli/lines';
import { TIEDYE } from '../heli/harryArt';
import { x0, X, GY, VIEW_X, ARENA_L, ARENA_R, WALL_W, MID, sy, WRECK_X, BERM_Y } from './arena';
import { drawRubble, drawDropped } from './liberty';

type Ctx = CanvasRenderingContext2D;
/** His tie-dye in shreds on the floor (from MID, its color). */
const TIEDYE_SHREDS: [number, string][] = TIEDYE.map((col, i) => [-150 + i * 23 + (i % 2) * 9, col]);

// ---------------------------------------------------------------------------------------------------------------
// The sky (screen space): smoky, the hour's colors, columns of smoke going up off the wrecks

export const drawSky = (c: Ctx, state: GameState) => {
  drawTodSky(c, 0, 0, 800, 600, ['#7F1D1D', '#C2410C', '#FB923C', '#FDE68A'], { horizon: 430, sun: [620, 110], moon: [170, 90] });
  // (the smoke off the crash and the wrecks: stepped puffs drifting up and off)
  const f = state.frame, px = (state.camera.x - VIEW_X) * 0.3;
  for (let col = 0; col < 5; col++) {
    const bx = 90 + col * 160 - px;
    for (let k = 0; k < 7; k++) {
      const t = ((f * 0.25 + k * 30 + col * 17) % 210) / 210, rr = 14 + t * 46;
      c.fillStyle = `rgba(41, 37, 36, ${(0.35 * (1 - t)).toFixed(2)})`;
      c.fillRect(Math.round(bx + Math.sin(t * 4 + col) * 14 + t * 40 - rr), Math.round(430 - t * 420 - rr * 0.6), Math.round(rr * 2), Math.round(rr * 1.2));
    }
  }
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// Fire (small, stepped, flickering)

export const flame = (c: Ctx, x: number, y: number, s: number, f: number, seed = 0) => {
  const k = Math.sin(f * 0.35 + seed) * 0.15 + 1;
  const cols = ['#B91C1C', '#EA580C', '#F59E0B', '#FDE047'];
  cols.forEach((col, i) => {
    const w = s * (1 - i * 0.22), h = s * 1.6 * k * (1 - i * 0.2);
    c.fillStyle = col; c.beginPath(); c.moveTo(x - w / 2, y); c.quadraticCurveTo(x - w * 0.4, y - h * 0.6, x + Math.sin(f * 0.2 + seed + i) * w * 0.15, y - h); c.quadraticCurveTo(x + w * 0.4, y - h * 0.6, x + w / 2, y); c.closePath(); c.fill();
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The dig's berm and the nine wrecks on it (painted once: the fight's shot, 2x for a sharp scale-up)

/** Where each wreck lies (screen x in the fight's shot, the berm row, its size), the back row first. */
const WRECKS: { id: MechId; x: number; row: 0 | 1; s: number }[] = [
  { id: 'eiffel', x: 120, row: 0, s: 0.19 }, { id: 'taj', x: 300, row: 0, s: 0.18 }, { id: 'pyramid', x: 520, row: 0, s: 0.17 },
  { id: 'bigben', x: 700, row: 0, s: 0.18 }, { id: 'redeemer', x: 790, row: 0, s: 0.18 },
  { id: 'opera', x: 150, row: 1, s: 0.24 }, { id: 'colosseum', x: 360, row: 1, s: 0.22 }, { id: 'moai', x: 560, row: 1, s: 0.22 },
  { id: 'pisa', x: 690, row: 1, s: 0.2 },
];
const ROW_Y = [436, 470];
/** The fires on them (screen x, row y, size). */
const FIRES: [number, number, number][] = [[70, 420, 14], [250, 418, 12], [470, 424, 16], [640, 420, 12], [110, 462, 18], [330, 458, 14], [520, 462, 16], [740, 456, 14]];

let cache: { c: HTMLCanvasElement; key: string } | null = null;
const paintBerm = (g: Ctx, f: number) => {
  // (the dig's far bank: dirt, stepped, rubble and rebar in it)
  const D = ramp6(hour('#7C5A3C'));
  g.fillStyle = D[2]; g.beginPath(); g.moveTo(0, 440); for (let x = 0; x <= 800; x += 40) g.lineTo(x, 430 + Math.sin(x * 0.03) * 8); g.lineTo(800, 540); g.lineTo(0, 540); g.closePath(); g.fill();
  box(g, 0, 470, 800, 70, D[1]); box(g, 0, 500, 800, 40, D[0]);
  for (let i = 0; i < 70; i++) { const x = (i * 97) % 800, y = 444 + ((i * 53) % 70); box(g, x, y, 4 + (i % 3) * 3, 3, i % 4 ? D[3] : '#78716C'); }
  g.strokeStyle = '#7C2D12'; g.lineWidth = 2; for (let i = 0; i < 9; i++) { const x = 40 + i * 90; g.beginPath(); g.moveTo(x, 470); g.lineTo(x + 10, 446); g.stroke(); }
  // (the wrecks: the back row, then the front)
  for (const row of [0, 1] as const) for (const w of WRECKS.filter(q => q.row === row)) {
    if (w.id === 'pisa') drawMech(g, w.id, w.x, ROW_Y[row], w.s, -Math.PI / 2 + 0.12, { awake: true, f, wreck: true });
    else drawMech(g, w.id, w.x, ROW_Y[row], w.s, 0, { awake: true, f, wreck: true });
  }
};
/** The berm and the wrecks, world space (the shot's top-left at VIEW_X, sy(0)). */
const drawBerm = (c: Ctx, state: GameState) => {
  // (painted again only if the hour's changed: a new visit)
  const key = hour('#7C5A3C');
  if (typeof document !== 'undefined' && (!cache || cache.key !== key)) {
    const cv = cache?.c ?? document.createElement('canvas');
    cv.width = 1600; cv.height = 1200;
    const g = cv.getContext('2d')!;
    g.setTransform(2, 0, 0, 2, 0, 0); g.clearRect(0, 0, 800, 600);
    paintBerm(g, 0);
    cache = { c: cv, key };
  }
  if (cache) c.drawImage(cache.c, VIEW_X, sy(0), 800, 600);
  // (the wrecks' fires and their smoke, live)
  for (const [i, [fx, fy, s]] of FIRES.entries()) flame(c, VIEW_X + fx, sy(fy), s, state.frame, i * 1.7);
};

// ---------------------------------------------------------------------------------------------------------------
// The floor, the walls, the crash

/** The poured slab he fights on (and the dirt of the approach), drawn over the berm's foot. */
const floor = (c: Ctx, state: GameState) => {
  const v = viewIn(state), a = Math.max(x0 - 200, v.cam.x - 40), b = v.cam.x + 840;
  const S = ramp6(hour('#A8A29E')), D = ramp6(hour('#7C5A3C'));
  // (the approach: trampled dirt; the slab from the gate on)
  box(c, a, GY - 22, b - a, 22, D[3]); box(c, a, GY, b - a, 120, D[1]); box(c, a, GY, b - a, 4, D[4]);
  const s0 = Math.max(a, ARENA_L - WALL_W), s1 = Math.min(b, ARENA_R + WALL_W);
  if (s1 > s0) {
    box(c, s0, GY - 26, s1 - s0, 26, S[3]); box(c, s0, GY - 26, s1 - s0, 3, S[4]);
    for (let x = Math.ceil(s0 / 120) * 120; x < s1; x += 120) box(c, x, GY - 26, 1, 26, S[1]);
    box(c, s0, GY, s1 - s0, 120, S[1]); box(c, s0, GY + 4, s1 - s0, 2, S[0]);
  }
  box(c, a, GY, b - a, 3, LIP[2]); box(c, a, GY, b - a, 1, LIP[3]);
};

/** A scaffold tower with plywood hoarding to the top of the shot: a wall (its face toward the floor at `face`). */
const tower = (c: Ctx, xa: number, side: 1 | -1, gate: 'none' | 'open' | 'shut', f: number) => {
  const P = ramp6(hour('#B08B5A')), top = sy(-40);
  box(c, xa - 2, top, WALL_W + 4, GY - top, INK);
  box(c, xa, top, WALL_W, GY - top, P[3]);
  // (the sheets: seams, the lit edge on the floor's side, a stencil)
  for (let y = GY - 120; y > top; y -= 120) box(c, xa, y, WALL_W, 2, P[1]);
  box(c, side > 0 ? xa + WALL_W - 3 : xa, top, 3, GY - top, P[4]);
  box(c, side > 0 ? xa : xa + WALL_W - 4, top, 4, GY - top, P[2]);
  // (the scaffold out front of it: pipes, the clamps, the planks Harry grabs)
  const px = side > 0 ? xa + WALL_W - 8 : xa + 4;
  box(c, px, top, 4, GY - top, '#71717A'); box(c, px + 1, top, 1, GY - top, '#D4D4D8');
  for (let y = GY - 60; y > top; y -= 90) { box(c, xa, y, WALL_W, 4, '#71717A'); box(c, xa, y, WALL_W, 1, '#D4D4D8'); box(c, px - 2, y - 2, 8, 8, '#3F3F46'); }
  // (the gate: a chain-link panel at the foot of it, open (folded back against the tower) or shut, padlocked)
  if (gate !== 'none') {
    const gy0 = GY - 150;
    box(c, xa - 2, gy0 - 4, WALL_W + 4, 6, '#3F3F46');
    if (gate === 'open') { box(c, xa + 2, gy0, WALL_W - 4, 150, '#1C1917'); box(c, xa + 2, gy0, 3, 150, '#27272A'); }
    else {
      box(c, xa, gy0, WALL_W, 150, 'rgba(63, 63, 70, 0.9)');
      c.strokeStyle = '#A1A1AA'; c.lineWidth = 1;
      for (let k = -150; k < WALL_W; k += 10) { c.beginPath(); c.moveTo(xa + k, gy0); c.lineTo(xa + k + 150, GY); c.moveTo(xa + k + 150, gy0); c.lineTo(xa + k, GY); c.stroke(); }
      box(c, xa, gy0, 3, 150, '#71717A'); box(c, xa + WALL_W - 3, gy0, 3, 150, '#71717A');
      box(c, xa + WALL_W / 2 - 6, GY - 80, 12, 14, '#CA8A04'); box(c, xa + WALL_W / 2 - 4, GY - 88, 8, 8, '#A1A1AA');
    }
  }
  void f;
};

/** The helicopter where it came down: on its side in a crater, burning. */
const crash = (c: Ctx, f: number) => {
  c.fillStyle = '#1C1917'; c.beginPath(); c.ellipse(WRECK_X, GY - 4, 120, 16, 0, 0, Math.PI * 2); c.fill();
  c.save(); c.filter = 'brightness(0.55) sepia(0.35)';
  const h = { seat: 0, tilt: 0.55, flip: 0, rotor: 0.3 };
  drawCopter(c, 'back', WRECK_X, GY - 34, h, f, { burning: true });
  drawCopter(c, 'front', WRECK_X, GY - 34, h, f, { burning: true });
  c.restore();
  flame(c, WRECK_X - 40, GY - 20, 22, f, 1); flame(c, WRECK_X + 30, GY - 46, 18, f, 2); flame(c, WRECK_X + 90, GY - 8, 12, f, 3);
};

export interface SceneState {
  /** Fight on: the gate's shut. */
  shut: boolean;
  /** She's in the dig behind (drawn by the fight between the sky and the berm). */
  between?: (c: Ctx) => void;
  /** Revisits: the aftermath on the floor. */
  aftermath: boolean;
}

export const drawScene = (c: Ctx, state: GameState, S: SceneState) => {
  const v = viewIn(state), f = state.frame;
  if (S.between) S.between(c);
  if (onScreen(v, VIEW_X - 100, VIEW_X + 900)) drawBerm(c, state);
  floor(c, state);
  if (onScreen(v, WRECK_X - 200, WRECK_X + 200)) crash(c, f);
  // (the pavilion's sign, on the way in, clear of everything)
  if (onScreen(v, X(560) - 120, X(560) + 120)) postBoard(c, X(560), GY, ['AMERICA', 'THE ONLY COUNTRY', 'COMING SOON'], LOOKS.land(2), '#1E3A8A', undefined, 140);
  if (onScreen(v, VIEW_X - 60, VIEW_X + 860)) {
    tower(c, ARENA_L - WALL_W, -1, S.shut ? 'shut' : 'open', f);
    tower(c, ARENA_R, 1, 'none', f);
    if (S.aftermath) aftermath(c, f);
  }
};

/** What's left (revisits): her rubble, the gun and the torch, a chalk outline, his shirt in shreds, the jetpack. */
const aftermath = (c: Ctx, f: number) => {
  drawRubble(c, MID - 40, GY, f);
  drawDropped(c, MID + 144, MID - 240, GY, f);
  // (a chalk outline: arms and legs out, on the slab)
  c.strokeStyle = mix('#F8FAFC', '#A8A29E', 0.2); c.lineWidth = 2;
  const ox = MID + 40, oy = GY - 8;
  c.beginPath(); c.ellipse(ox - 44, oy - 3, 7, 4, 0, 0, Math.PI * 2); c.moveTo(ox - 36, oy - 4); c.lineTo(ox + 20, oy - 5); c.lineTo(ox + 40, oy - 9); c.moveTo(ox + 20, oy - 2); c.lineTo(ox + 42, oy + 2);
  c.moveTo(ox - 24, oy - 4); c.lineTo(ox - 14, oy - 12); c.moveTo(ox - 20, oy - 2); c.lineTo(ox - 8, oy + 4); c.stroke();
  for (const [i, [dx, col]] of TIEDYE_SHREDS.entries()) box(c, MID + dx, GY - 4 - (i % 2) * 2, 8, 3, col);
  // (the emergency jetpack, spent, on its side)
  box(c, MID - 330, GY - 14, 30, 12, '#9CA3AF'); box(c, MID - 330, GY - 14, 30, 2, '#E5E7EB'); box(c, MID - 320, GY - 14, 3, 12, '#DC2626');
  void dimmed;
};

export { BERM_Y };
