// Barry's stage in screen space: the lighting over the world, the power room's
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
import { drawLighting } from './lighting';
import { placeOf } from './course';
import { drawBubble } from './script';
import { drawCityBurning, drawFlames } from './draw';

type Ctx = CanvasRenderingContext2D;
const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** Over the world: the dark and the lights, then the power room's readout. */
export const drawBarryScreenHud = (ctx: Ctx, state: GameState, rt: BarryRuntime) => {
  if (!rt.surf || rt.surf.phase !== 'air') drawLighting(ctx, state, rt);
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
  ctx.fillStyle = '#374151'; ctx.fillRect(W / 2 - 1, 0, 2, H * shut);
};

const drawElevatorRide = (ctx: Ctx, state: GameState, rt: BarryRuntime) => {
  const tr = rt.transit!;
  const t = tr.t;
  if (t < DOORS) { doors(ctx, t / DOORS); return; }
  if (t >= DOORS + RIDE) { doors(ctx, 1 - (t - DOORS - RIDE) / OPEN); return; }
  // Inside: wood panelling, a brass handrail, the floor counter, the buttons, him, the muzak
  const f = state.frame;
  ctx.fillStyle = '#5B3A1E'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#6B4423'; for (let x = 0; x < W; x += 100) ctx.fillRect(x + 4, 60, 92, 420);
  ctx.fillStyle = '#CA8A04'; ctx.fillRect(0, 330, W, 8);
  ctx.fillStyle = '#292524'; ctx.fillRect(0, 480, W, 120);
  ctx.fillStyle = '#44403C'; for (let x = 0; x < W; x += 40) ctx.fillRect(x, 480, 20, 120);
  // The counter
  ctx.fillStyle = '#111827'; ctx.fillRect(W / 2 - 70, 14, 140, 40);
  ctx.strokeStyle = '#CA8A04'; ctx.lineWidth = 3; ctx.strokeRect(W / 2 - 70, 14, 140, 40);
  const fl = elevatorFloor(tr);
  ctx.fillStyle = '#F97316'; ctx.font = 'bold 20px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText(fl === 1 ? 'L' : String(fl), W / 2, 45);
  ctx.fillStyle = '#FDE047'; ctx.beginPath(); ctx.moveTo(W / 2 + 48, 40); ctx.lineTo(W / 2 + 58, 26); ctx.lineTo(W / 2 + 68, 40); ctx.fill();
  // The buttons (the top one lit: it didn't help)
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(W - 120, 160, 70, 180);
  for (let k = 0; k < 10; k++) { ctx.fillStyle = k === 0 ? '#FDE047' : '#E5E7EB'; ctx.beginPath(); ctx.arc(W - 100 + (k % 2) * 30, 180 + Math.floor(k / 2) * 30, 8, 0, Math.PI * 2); ctx.fill(); }
  // Him, standing there, the muzak going
  const p = state.player;
  const body = { ...p, pos: { x: -1e6, y: -1e6 }, hidden: false, isGrounded: true, vel: { x: 0, y: 0 }, facing: 1 as const, isCharging: false, isSliding: false, isUppercutting: false, isDivekicking: false, invincibilityTimer: 0, hurtTimer: 0 };
  ctx.save(); ctx.translate(W / 2, 480 - p.height / 2); ctx.translate(-(body.pos.x + body.width / 2), -(body.pos.y + body.height / 2));
  drawPlayer(ctx, body, { ...state, deathTimer: 0 }, { currentWeapon: p.currentWeapon, showFilthShield: false, invincibilityEnabled: false });
  ctx.restore();
  ctx.fillStyle = '#FDE68A'; ctx.font = 'bold 16px "Press Start 2P"';
  for (let k = 0; k < 3; k++) { const ft = ((f + k * 30) % 90) / 90; ctx.globalAlpha = 1 - ft; ctx.fillText(k % 2 ? '♫' : '♪', 120 + k * 60, 300 - ft * 120); }
  ctx.globalAlpha = 1;
  // (a little after it gets going: the look on his face says it all)
  if (t - DOORS > 40 && t - DOORS < RIDE - 20) drawBubble(ctx, W / 2, 480 - p.height - 20, t - DOORS < 90 ? '...' : 'COME ON. COME ON.', '#F8FAFC');
  ctx.textAlign = 'left';
  // The doors, shut, framing it
  ctx.fillStyle = '#1C1917'; ctx.fillRect(0, 0, 18, H); ctx.fillRect(W - 18, 0, 18, H);
};

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
  drawPlayer(ctx, body, { ...state, deathTimer: 0 }, { currentWeapon: p.currentWeapon, showFilthShield: false, invincibilityEnabled: false });
  ctx.restore();
  if (s.t > 50 && s.t < 170) drawBubble(ctx, x, y - p.height - 40, "SURF'S UP, DUDES!", '#F8FAFC');
  // Out of the white
  if (s.t < 40) { ctx.fillStyle = `rgba(255,255,255,${1 - s.t / 40})`; ctx.fillRect(0, 0, W, H); }
  // (and the cut to the street at the end)
  if (s.t > SURF_AIR - 12) { ctx.fillStyle = `rgba(0,0,0,${(s.t - (SURF_AIR - 12)) / 12})`; ctx.fillRect(0, 0, W, H); }
};
