// Barry's stage in screen space: the power room's
// readout, and the cuts between places: the fades, the elevator ride (the doors
// shut on the floor you're on, the ride with its floor counter and its muzak, the
// ding, the doors open on whatever floor it felt like stopping at), the white-out
// when the power room goes, and the ride down over the burning city on Barry's man.

import type { GameState } from '../../core/state';
import type { Enemy } from '../../../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, HUD_CLEAR_X } from '../../../constants';
import { drawPlayer } from '../../render/player/player';
import { drawBarryKind } from '../../render/enemies/barry';
import { BarryRuntime, fadeAmount, elevatorFloor, DOORS, RIDE, OPEN, SURF_AIR } from './runtime';
import { placeOf } from './course';
import { drawBubble } from './script';
import { drawCityBurning, drawFlames } from './draw';
import { bandedGradient } from '../../render/pixelArt';

type Ctx = CanvasRenderingContext2D;
const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** Over the world: the dark and the lights, then the power room's readout. */
export const drawBarryScreenHud = (ctx: Ctx, state: GameState, rt: BarryRuntime) => {
  const pw = rt.power;
  if (placeOf(state.player.pos.x) === 'power' && pw.phase === 'fight') {
    ctx.save();
    // (right of the main HUD, clear of it)
    const cx = (HUD_CLEAR_X + W) / 2;
    ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(cx - 140, 12, 280, 34);
    ctx.strokeStyle = '#38BDF8'; ctx.lineWidth = 2; ctx.strokeRect(cx - 140, 12, 280, 34);
    ctx.fillStyle = '#E0F2FE'; ctx.font = 'bold 10px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText(`GENERATORS: ${3 - pw.gone} OF 3`, cx, 34, 260);
    ctx.textAlign = 'left';
    ctx.restore();
  }
};

/** The cuts: fades, the elevator, the white-out, the ride down. */
export const drawBarryOverlays = (ctx: Ctx, state: GameState, rt: BarryRuntime) => {
  const d = fadeAmount(rt);
  if (d > 0) { ctx.fillStyle = `rgba(0,0,0,${d})`; ctx.fillRect(0, 0, W, H); }
  if (rt.transit?.kind === 'elevator') drawElevatorRide(ctx, state, rt);
  if (rt.power.white > 0 && !rt.surf) { ctx.fillStyle = `rgba(255,255,255,${rt.power.white})`; ctx.fillRect(0, 0, W, H); }
  if (rt.surf?.phase === 'air') drawSurf(ctx, state, rt);
};

// ---------------------------------------------------------------------------
// The elevator
// ---------------------------------------------------------------------------

/** Steel doors across the screen, `shut` of the way closed (0 open, 1 shut). */
const doors = (ctx: Ctx, shut: number) => {
  if (shut <= 0) return;
  const half = (W / 2) * shut;
  for (const [x, w] of [[0, half], [W - half, half]] as const) {
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, '#9CA3AF'); g.addColorStop(0.5, '#D1D5DB'); g.addColorStop(1, '#6B7280');
    ctx.fillStyle = g; ctx.fillRect(x, 0, w, H);
  }
  if (shut > 0.97) { ctx.fillStyle = '#374151'; ctx.fillRect(W / 2 - 1, 0, 2, H); }
};

const drawElevatorRide = (ctx: Ctx, state: GameState, rt: BarryRuntime) => {
  const tr = rt.transit!;
  const t = tr.t;
  if (t < DOORS) { doors(ctx, easeInOut(t / DOORS)); return; }
  if (t >= DOORS + RIDE) { doors(ctx, 1 - easeInOut((t - DOORS - RIDE) / OPEN)); return; }
  const f = state.frame;
  const k = t - DOORS;
  const fl = elevatorFloor(tr);
  const strain = Math.min(1, k / (RIDE - 20));
  // The inside of the car, close in on him (a Ren and Stimpy close-up: every bead of sweat, every vein), stood there
  // waiting, the floor lights over the door crawling up one at a time
  // (the car: wood panelling in bands, brass trim, a fluorescent tube that won't quite stay steady)
  bandedGradient(ctx, 0, 0, W, H, ['#3B2412', '#4A2E17', '#5B3A1E', '#4A2E17', '#2E1C0E'], 10);
  for (let x = 20; x < W; x += 120) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x, 120, 4, 360); ctx.fillStyle = 'rgba(255, 220, 170, 0.08)'; ctx.fillRect(x + 4, 120, 2, 360); }
  ctx.fillStyle = '#1C1208'; ctx.fillRect(0, 112, W, 6);
  const flick = (f % 97 < 3 || f % 61 === 0) ? 0.55 : 1;
  ctx.fillStyle = `rgba(254, 249, 195, ${(0.9 * flick).toFixed(3)})`; ctx.fillRect(0, 0, W, 10);
  ctx.fillStyle = `rgba(254, 249, 195, ${(0.08 * flick).toFixed(3)})`; ctx.fillRect(0, 10, W, 100);
  // (the floor, and the brass rail along the back wall)
  ctx.fillStyle = '#1F1A14'; ctx.fillRect(0, 470, W, H - 470);
  ctx.fillStyle = '#3A3026'; for (let x = 0; x < W; x += 40) ctx.fillRect(x, 470, 38, 3);
  ctx.fillStyle = '#7C5A12'; ctx.fillRect(0, 352, W, 8); ctx.fillStyle = '#E3B341'; ctx.fillRect(0, 352, W, 2); ctx.fillStyle = '#4A3608'; ctx.fillRect(0, 360, W, 2);
  // The door's window (left): the shaft going by outside it, the floors sliding DOWN past (he's going up)
  const wx = 70, wy = 150, ww = 70, wh = 280;
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(wx - 30, 118, ww + 60, 352); ctx.fillStyle = '#D1D5DB'; ctx.fillRect(wx - 30, 118, 4, 352); ctx.fillStyle = '#6B7280'; ctx.fillRect(wx + ww + 26, 118, 4, 352);
  ctx.save(); ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
  ctx.fillStyle = '#0B0C10'; ctx.fillRect(wx, wy, ww, wh);
  const slide = (k * 3.2) % 140;
  for (let y = wy - 140 + slide; y < wy + wh; y += 140) {
    // (a landing going by: its lit gap, the slab, the number painted on the wall)
    ctx.fillStyle = '#FDE68A'; ctx.fillRect(wx, y, ww, 34); ctx.fillStyle = '#26272D'; ctx.fillRect(wx, y + 34, ww, 10);
    ctx.fillStyle = '#6B7280'; ctx.font = 'bold 9px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText(String(fl + Math.round((wy + wh / 2 - y) / 140)), wx + ww / 2, y + 74);
  }
  ctx.restore();
  ctx.strokeStyle = '#111827'; ctx.lineWidth = 3; ctx.strokeRect(wx - 1.5, wy - 1.5, ww + 3, wh + 3);
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(wx + 6, wy, 6, wh);
  // The floor lights over the door: a brass panel, the numbers in a row, the one he's at lit, the UP arrow pulsing
  const px1 = HUD_CLEAR_X + 20, pw = W - 30 - px1, py = 26;
  ctx.fillStyle = '#4A3608'; ctx.fillRect(px1 - 4, py - 4, pw + 8, 64);
  ctx.fillStyle = '#B8860B'; ctx.fillRect(px1, py, pw, 56); ctx.fillStyle = '#E3B341'; ctx.fillRect(px1, py, pw, 3); ctx.fillStyle = '#7C5A12'; ctx.fillRect(px1, py + 53, pw, 3);
  // (seven to a row, the light stepping along it one floor at a time, then on to the next seven)
  const slots = 7, sw = (pw - 70) / slots, first = Math.floor((fl - 1) / slots) * slots + 1;
  for (let i = 0; i < slots; i++) {
    const n = first + i;
    const lx = px1 + 10 + i * sw + sw / 2, ly = py + 28;
    const lit = n === fl;
    ctx.fillStyle = '#1C1208'; ctx.beginPath(); ctx.arc(lx, ly, 17, 0, Math.PI * 2); ctx.fill();
    if (lit) { ctx.fillStyle = 'rgba(249, 115, 22, 0.35)'; ctx.beginPath(); ctx.arc(lx, ly, 24, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = lit ? '#F97316' : n < fl ? '#3B2412' : '#2A1A0C'; ctx.beginPath(); ctx.arc(lx, ly, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = lit ? '#FEF3C7' : '#6B4A2A'; ctx.font = 'bold 9px "Press Start 2P"'; ctx.textAlign = 'center';
    if (n >= 1) ctx.fillText(n === 1 ? 'L' : String(n), lx, ly + 4);
  }
  // (the arrow: UP, lit, pulsing)
  const ax = px1 + pw - 32, ay = py + 28, on = Math.floor(f / 10) % 2 === 0;
  ctx.fillStyle = on ? '#FDE047' : '#A16207';
  ctx.beginPath(); ctx.moveTo(ax, ay - 16); ctx.lineTo(ax + 14, ay + 2); ctx.lineTo(ax + 5, ay + 2); ctx.lineTo(ax + 5, ay + 16); ctx.lineTo(ax - 5, ay + 16); ctx.lineTo(ax - 5, ay + 2); ctx.lineTo(ax - 14, ay + 2); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#1C1208'; ctx.lineWidth = 2; ctx.stroke();
  // (a speaker in the ceiling, the muzak coming out of it)
  ctx.fillStyle = '#1C1208'; ctx.beginPath(); ctx.arc(230, 70, 22, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3A2A18'; for (let k2 = -2; k2 <= 2; k2++) ctx.fillRect(230 + k2 * 7 - 1, 54, 2, 32);
  ctx.fillStyle = '#FDE68A'; ctx.font = 'bold 16px "Press Start 2P"'; ctx.textAlign = 'left';
  for (let n = 0; n < 3; n++) { const ft = ((f + n * 30) % 90) / 90; ctx.globalAlpha = 1 - ft; ctx.fillText(n % 2 ? '♫' : '♪', 210 + n * 34 + Math.sin(ft * 6 + n) * 8, 110 + ft * 70); }
  ctx.globalAlpha = 1;
  // Him, close up: stood there, staring up at the lights, the strain building (the jaw going, a twitch, the sweat)
  const S = 4, X = 480, FOOT = 470;
  const twitch = (f % 37) < 5 && k > 40 ? (f % 2 ? 2 : -2) : 0;
  const tap = f % 18 < 5 ? 1 : 0;
  const pl = state.player;
  const body = { ...pl, pos: { x: -pl.width / 2, y: -pl.height }, hidden: false, isGrounded: true, vel: { x: 0, y: 0 }, facing: 1 as const, isCharging: false, isSliding: false, isUppercutting: false, isDivekicking: false, isDucking: false, invincibilityTimer: 0, hurtTimer: 0, pushbackTimer: 0, angryTimer: k > 70 ? 10 : 0 };
  ctx.save(); ctx.translate(X + twitch, FOOT); ctx.scale(S, S);
  drawPlayer(ctx, body, { ...state, deathTimer: 0, camera: { x: 0, y: 0 } }, { currentWeapon: pl.currentWeapon, showFilthShield: false, invincibilityEnabled: false, footTap: tap });
  ctx.restore();
  // (the close-up's grotesque bits, on his head: a vein up his temple pulsing, sweat beading and running, stress lines)
  const hx = X + twitch, hy = FOOT - 54 * S, r = 12 * S;
  if (strain > 0.25) {
    const pulse = 1 + Math.sin(f * 0.5) * 0.5 * strain;
    ctx.strokeStyle = '#7E22CE'; ctx.lineWidth = 3 * pulse; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(hx - r * 0.35, hy - r * 1.05); ctx.lineTo(hx - r * 0.2, hy - r * 0.85); ctx.lineTo(hx - r * 0.34, hy - r * 0.65); ctx.lineTo(hx - r * 0.18, hy - r * 0.45); ctx.stroke();
    ctx.strokeStyle = '#C084FC'; ctx.lineWidth = 1; ctx.stroke(); ctx.lineCap = 'butt';
  }
  const beads = Math.floor(strain * 7);
  for (let b2 = 0; b2 < beads; b2++) {
    const run = ((f * (0.6 + hash(b2) * 0.6) + b2 * 37) % 90) / 90;
    const bx = hx + (hash(b2 * 3) - 0.6) * r * 1.4, by = hy - r * 0.9 + run * r * 1.1;
    ctx.fillStyle = '#BAE6FD'; ctx.beginPath(); ctx.moveTo(bx, by - 7); ctx.quadraticCurveTo(bx + 5, by, bx, by + 4); ctx.quadraticCurveTo(bx - 5, by, bx, by - 7); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(bx - 2, by - 2, 2, 2);
  }
  if (strain > 0.5) {
    ctx.strokeStyle = '#1C1208'; ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) { const ang = -Math.PI * 0.95 + i * 0.32, d0 = r * 1.35, d1 = r * (1.6 + (f % 8 < 4 ? 0.08 : 0)); ctx.beginPath(); ctx.moveTo(hx + Math.cos(ang) * d0, hy + Math.sin(ang) * d0); ctx.lineTo(hx + Math.cos(ang) * d1, hy + Math.sin(ang) * d1); ctx.stroke(); }
  }
  // (and the steam out of his ears at the very end)
  if (strain > 0.85) for (let i = 0; i < 3; i++) { const q = ((f * 2 + i * 13) % 40) / 40; ctx.fillStyle = `rgba(241, 245, 249, ${(0.7 * (1 - q)).toFixed(3)})`; ctx.beginPath(); ctx.arc(hx - r * 0.8 - q * 30, hy - r * 0.2 - q * 40, 6 + q * 10, 0, Math.PI * 2); ctx.fill(); }
  if (tap) { ctx.fillStyle = 'rgba(248, 250, 252, 0.85)'; ctx.font = '8px "Press Start 2P"'; ctx.textAlign = 'left'; ctx.fillText('TAP', X + 40, FOOT - 4); }
  // What he thinks of it
  const say = k < 40 ? '' : k < 95 ? '...' : k < 150 ? '*SIGH*' : 'COME ON. COME ON.';
  if (say && k < RIDE - 10) drawBubble(ctx, hx - 40, hy - r * 2.2, say, '#F8FAFC');
  ctx.textAlign = 'left';
};

/** Smooth in and out (for the doors). */
const easeInOut = (x: number) => { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); };

// ---------------------------------------------------------------------------
// The ride down
// ---------------------------------------------------------------------------

/** Out of the explosion, over the burning city, on Barry's man, feet planted, surfing. */
const drawSurf = (ctx: Ctx, state: GameState, rt: BarryRuntime) => {
  const s = rt.surf!;
  const f = state.frame;
  const k = s.t / SURF_AIR;
  // The sky on fire, the skyline in flames, smoke, the odd blast going up somewhere
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#1C0A0A'); sky.addColorStop(0.55, '#7C2D12'); sky.addColorStop(1, '#EA580C');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  const scroll = s.t * 3;
  for (let layer = 0; layer < 2; layer++) {
    const sp = layer ? 1 : 0.5, base = layer ? 470 : 400;
    for (let b = -1; b < 14; b++) {
      const bx = ((b * 90 - scroll * sp) % (W + 180) + W + 180) % (W + 180) - 90;
      const bh = 120 + hash(b * 7 + layer) * 200, top = base - bh + (layer ? 0 : 40);
      ctx.fillStyle = layer ? '#0C0A09' : '#1C1917'; ctx.fillRect(bx, top, 84, H - top);
      if (layer) for (let wy = top + 12; wy < H; wy += 22) for (let wx = bx + 8; wx < bx + 76; wx += 18) { if (hash(wx + wy + b) < 0.35) { ctx.fillStyle = hash(wx * wy) < 0.5 ? '#F97316' : '#FDE047'; ctx.fillRect(wx, wy, 8, 10); } }
      if (layer && hash(b * 3) < 0.45) drawFlames(ctx, bx + 10, top, 64, f + b * 13);
    }
  }
  drawCityBurning(ctx, f, 0.7);
  if (s.t % 70 < 12) { const ex = 100 + hash(Math.floor(s.t / 70)) * 600; ctx.fillStyle = `rgba(254, 240, 138, ${1 - (s.t % 70) / 12})`; ctx.beginPath(); ctx.arc(ex, 420, 40 + (s.t % 70) * 6, 0, Math.PI * 2); ctx.fill(); }
  // Speed lines
  ctx.strokeStyle = 'rgba(255, 237, 213, 0.4)'; ctx.lineWidth = 2;
  for (let i = 0; i < 10; i++) { const y = (i * 61 + s.t * 7) % H, x = (i * 173 - s.t * 20) % W; ctx.beginPath(); ctx.moveTo((x + W) % W, y); ctx.lineTo((x + W) % W + 60, y); ctx.stroke(); }
  // Him on the board: across the screen in a long arc, the board tilting with it
  const x = -60 + k * (W + 120), y = 420 - Math.sin(k * Math.PI) * 240;
  const tilt = Math.cos(k * Math.PI) * -0.35;
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
  const still = { kind: 'minion', pos: { x: 0, y: 0 }, width: 36, height: 62, vel: { x: 0, y: 0 }, facing: 1, homeX: 0, aiState: 'flat', aiTimer: 0, shootTimer: 0 } as unknown as Enemy;
  ctx.save(); ctx.rotate(-Math.PI / 2); ctx.translate(-8, 30); ctx.filter = 'brightness(0.7) sepia(0.3)'; drawBarryKind(ctx, still, f, state); ctx.restore();
  // (smoke and sparks coming off the back of the board)
  for (let i = 0; i < 4; i++) { ctx.fillStyle = `rgba(68, 64, 60, ${0.5 - i * 0.1})`; ctx.beginPath(); ctx.arc(-40 - i * 16, 4 + Math.sin(f * 0.3 + i) * 4, 8 + i * 4, 0, Math.PI * 2); ctx.fill(); }
  const p = state.player;
  const body = { ...p, pos: { x: -1e6, y: -1e6 }, hidden: false, isGrounded: true, vel: { x: 2, y: 0 }, facing: 1 as const, isCharging: false, isSliding: false, isUppercutting: false, isDivekicking: false, invincibilityTimer: 0, hurtTimer: 0 };
  ctx.translate(0, -12 - p.height / 2); ctx.translate(-(body.pos.x + body.width / 2), -(body.pos.y + body.height / 2));
  drawPlayer(ctx, body, { ...state, deathTimer: 0 }, { currentWeapon: p.currentWeapon, showFilthShield: false, invincibilityEnabled: false, surf: true });
  ctx.restore();
  if (s.t > 50 && s.t < 170) drawBubble(ctx, x, y - p.height - 40, "SURF'S UP, DUDES!", '#F8FAFC');
  // Out of the white
  if (s.t < 40) { ctx.fillStyle = `rgba(255,255,255,${1 - s.t / 40})`; ctx.fillRect(0, 0, W, H); }
  // (and the cut to the street at the end)
  if (s.t > SURF_AIR - 12) { ctx.fillStyle = `rgba(0,0,0,${(s.t - (SURF_AIR - 12)) / 12})`; ctx.fillRect(0, 0, W, H); }
};
