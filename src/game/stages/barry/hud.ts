// Barry's stage in screen space: the power room's
// readout, and the cuts between places: the fades, the elevator ride (the doors
// shut on the floor you're on, the ride with its floor counter and its muzak, the
// ding, the doors open on whatever floor it felt like stopping at), the white-out
// when the power room goes, and the ride down over the burning city on Barry's man.

import type { GameState } from '../../core/state';
import type { Enemy } from '../../../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../constants';
import { drawPlayer } from '../../render/player/player';
import { drawBarryKind } from '../../render/enemies/barry';
import { BarryRuntime, fadeAmount, elevatorFloor, DOORS, RIDE, OPEN, SURF_AIR } from './runtime';
import { placeOf } from './course';
import { drawBubble } from './script';
import { drawCityBurning, drawFlames } from './draw';

type Ctx = CanvasRenderingContext2D;
const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** Over the world: the dark and the lights, then the power room's readout. */
export const drawBarryScreenHud = (ctx: Ctx, state: GameState, rt: BarryRuntime) => {
  const pw = rt.power;
  if (placeOf(state.player.pos.x) === 'power' && pw.phase === 'fight') {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(W / 2 - 140, 12, 280, 34);
    ctx.strokeStyle = '#38BDF8'; ctx.lineWidth = 2; ctx.strokeRect(W / 2 - 140, 12, 280, 34);
    ctx.fillStyle = '#E0F2FE'; ctx.font = 'bold 10px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText(`GENERATORS: ${3 - pw.gone} OF 3`, W / 2, 34, 260);
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
  // The shaft: dark concrete, the guide rails, the cables, the floors going by (painted numbers on the wall)
  ctx.fillStyle = '#0B0C10'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#1C1D22'; ctx.fillRect(250, 0, 300, H);
  ctx.fillStyle = '#2A2B31'; ctx.fillRect(250, 0, 8, H); ctx.fillRect(542, 0, 8, H);
  ctx.fillStyle = '#3F3F46'; ctx.fillRect(266, 0, 5, H); ctx.fillRect(529, 0, 5, H); // the guide rails
  const scroll = (k * 9) % 160;
  for (let y = scroll - 160; y < H; y += 160) {
    ctx.fillStyle = '#26272D'; ctx.fillRect(250, y, 300, 12); // each floor's slab going by
    ctx.fillStyle = '#6B7280'; ctx.font = 'bold 10px "Press Start 2P"'; ctx.textAlign = 'left';
    ctx.fillText(String(elevatorFloor(tr) + Math.round((scroll - y) / 160)), 276, y + 40);
  }
  // The car: a small box on its cables, rattling a little on the way up
  const jig = Math.sin(f * 0.9) * 0.8;
  const cw = 170, ch = 210, cx = W / 2 - cw / 2, cy = 190 + jig;
  ctx.strokeStyle = '#71717A'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(W / 2 - 12, 0); ctx.lineTo(W / 2 - 12, cy); ctx.moveTo(W / 2 + 12, 0); ctx.lineTo(W / 2 + 12, cy); ctx.stroke();
  // (the counterweight going the other way, once)
  const cwY = -200 + k * 6;
  if (cwY < H) { ctx.fillStyle = '#44403C'; ctx.fillRect(470, cwY, 50, 120); ctx.strokeStyle = '#71717A'; ctx.beginPath(); ctx.moveTo(495, 0); ctx.lineTo(495, cwY); ctx.stroke(); }
  ctx.fillStyle = '#52525B'; ctx.fillRect(cx - 6, cy - 12, cw + 12, 12); ctx.fillRect(cx - 6, cy + ch, cw + 12, 10);
  ctx.fillStyle = '#5B3A1E'; ctx.fillRect(cx, cy, cw, ch);
  ctx.fillStyle = '#6B4423'; for (let x = cx + 4; x < cx + cw - 10; x += 42) ctx.fillRect(x, cy + 30, 38, ch - 60);
  ctx.fillStyle = '#CA8A04'; ctx.fillRect(cx, cy + 118, cw, 4); // the handrail
  ctx.fillStyle = '#292524'; ctx.fillRect(cx, cy + ch - 16, cw, 16);
  // The indicator over the door, the buttons (the top one lit: it didn't help)
  ctx.fillStyle = '#111827'; ctx.fillRect(W / 2 - 26, cy + 6, 52, 18);
  const fl = elevatorFloor(tr);
  ctx.fillStyle = '#F97316'; ctx.font = 'bold 10px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText(fl === 1 ? 'L' : String(fl), W / 2, cy + 20);
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(cx + cw - 26, cy + 60, 16, 44);
  for (let b = 0; b < 5; b++) { ctx.fillStyle = b === 0 ? '#FDE047' : '#E5E7EB'; ctx.beginPath(); ctx.arc(cx + cw - 18, cy + 66 + b * 8, 2.5, 0, Math.PI * 2); ctx.fill(); }
  // Him: stood there, bored stiff, tapping his foot
  const p = state.player;
  const body = { ...p, pos: { x: -1e6, y: -1e6 }, hidden: false, isGrounded: true, vel: { x: 0, y: 0 }, facing: 1 as const, isCharging: false, isSliding: false, isUppercutting: false, isDivekicking: false, isDucking: false, invincibilityTimer: 0, hurtTimer: 0, pushbackTimer: 0 };
  const floorY = cy + ch - 16;
  const tap = f % 18 < 5 ? 1 : 0;
  ctx.save(); ctx.translate(W / 2 - 14, floorY - p.height / 2); ctx.translate(-(body.pos.x + body.width / 2), -(body.pos.y + body.height / 2));
  drawPlayer(ctx, body, { ...state, deathTimer: 0 }, { currentWeapon: p.currentWeapon, showFilthShield: false, invincibilityEnabled: false, footTap: tap });
  ctx.restore();
  if (tap) { ctx.fillStyle = 'rgba(248, 250, 252, 0.7)'; ctx.font = '5px "Press Start 2P"'; ctx.textAlign = 'left'; ctx.fillText('TAP', W / 2 + 6, floorY - 6); }
  // The muzak
  ctx.fillStyle = '#FDE68A'; ctx.font = 'bold 12px "Press Start 2P"'; ctx.textAlign = 'left';
  for (let n = 0; n < 3; n++) { const ft = ((f + n * 30) % 90) / 90; ctx.globalAlpha = 1 - ft; ctx.fillText(n % 2 ? '♫' : '♪', cx + 20 + n * 26, cy + 90 - ft * 60); }
  ctx.globalAlpha = 1;
  // What he thinks of it
  const say = k < 40 ? '' : k < 95 ? '...' : k < 150 ? '*SIGH*' : 'COME ON. COME ON.';
  if (say && k < RIDE - 10) drawBubble(ctx, W / 2 - 10, floorY - p.height - 18, say, '#F8FAFC');
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
