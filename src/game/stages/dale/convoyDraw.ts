// The convoy, drawn: the desert going by at eighty (the sky and the mesas crawl,
// the scrub and the telephone poles whip past, the road's lines are a blur), the
// four semis in DALE'S DRUGS livery, the SUVs pulling up with goons on the roof,
// the junk flying down the road, the burning wrecks falling away behind, the last
// truck's driver in his cab. And the HUD: which truck, the countdown, GO, Dale on
// the radio, the warnings for what's coming, and the KILL arrow on Riggs.

import type { GameState } from '../../core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y } from '../../../constants';
import { drawPlayer } from '../../render/player/player';
import { COURSE, TRAILER_W, TRUCK_W, TRAILER_TOP, CAB_TOP, HOOD_TOP, SLEEPER_W, truckDims } from './course';
import type { DaleRuntime } from './runtime';
import { Convoy, TruckState, truckX, ROAD_SPEED, debrisComing, windshield, hood, HIGHWAY_CAM_Y, Debris } from './convoy';
import { saying, drawBubble } from './script';
import { layer, hash } from './draw';
import { wheelTurn } from '../../render/bosses/daleTruck';

type Ctx = CanvasRenderingContext2D;
const Y = GROUND_Y;
/** The road's top edge on screen. */
const ROAD = Y - HIGHWAY_CAM_Y - 26;

// ---------------------------------------------------------------------------
// Screen space: the desert going by
// ---------------------------------------------------------------------------

export const drawHighwayBackdrop = (ctx: Ctx, state: GameState, rt: DaleRuntime) => {
  const cv = rt.convoy;
  const s = cv.scroll;
  const f = state.frame;
  // The sky and the far scenery (the far stuff barely moves: pass the road's travel through as the camera)
  layer(ctx, s, 0, f, 0);
  layer(ctx, s * 0.2, 0, f, 1);
  layer(ctx, s, 0, f, 2);
  layer(ctx, s, 0, f, 3);
  layer(ctx, s, 0, f, 4);
  // Near desert, whipping by
  ctx.fillStyle = '#9A5A34'; ctx.fillRect(0, 300, CANVAS_WIDTH, ROAD - 300);
  const g = ctx.createLinearGradient(0, 300, 0, ROAD);
  g.addColorStop(0, 'rgba(60, 25, 30, 0.6)'); g.addColorStop(1, 'rgba(60, 25, 30, 0)');
  ctx.fillStyle = g; ctx.fillRect(0, 300, CANVAS_WIDTH, ROAD - 300);
  for (let k = 0; k < 24; k++) {
    const x = ((hash(k) * 1600 - s * 0.7) % 1600 + 1600) % 1600 - 200;
    const y = 318 + hash(k + 3) * (ROAD - 330);
    ctx.fillStyle = hash(k + 5) > 0.5 ? '#556B2F' : '#6B4A2A';
    ctx.beginPath(); ctx.ellipse(x, y, 6 + hash(k + 9) * 10, 3 + hash(k + 9) * 4, 0, Math.PI, 0); ctx.fill();
  }
  // Telephone poles and their wires, flicking past
  const pole = 420;
  const off = ((-s * 0.8) % pole + pole) % pole;
  ctx.strokeStyle = '#2A1A10'; ctx.lineWidth = 1;
  for (let x = off - pole; x < CANVAS_WIDTH + pole; x += pole) {
    ctx.fillStyle = '#3F2A18'; ctx.fillRect(x, 210, 7, ROAD - 210 - 4); ctx.fillRect(x - 16, 222, 40, 5);
    ctx.beginPath(); ctx.moveTo(x - 14, 226); ctx.quadraticCurveTo(x + pole / 2 - 14, 250, x + pole - 14, 226); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 20, 226); ctx.quadraticCurveTo(x + pole / 2 + 20, 250, x + pole + 20, 226); ctx.stroke();
  }
  // A road sign now and then (and, near the end, the town)
  const signEvery = 3600;
  const sx = ((-s * 0.95) % signEvery + signEvery) % signEvery - 200;
  const late = cv.current === 3;
  if (sx < CANVAS_WIDTH + 100) {
    ctx.fillStyle = '#374151'; ctx.fillRect(sx + 50, ROAD - 150, 6, 150); ctx.fillRect(sx + 130, ROAD - 150, 6, 150);
    ctx.fillStyle = '#15803D'; ctx.fillRect(sx, ROAD - 200, 190, 64); ctx.strokeStyle = '#F8FAFC'; ctx.lineWidth = 2; ctx.strokeRect(sx + 4, ROAD - 196, 182, 56);
    ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 9px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText(late ? 'DEADWOOD GULCH' : 'ALBUQUERQUE', sx + 95, ROAD - 174); ctx.fillText(late ? '1 MI' : '42 MI', sx + 95, ROAD - 154); ctx.textAlign = 'left';
  }
  // The road: the far lane's shoulder, the lines going by
  ctx.fillStyle = '#3F3F46'; ctx.fillRect(0, ROAD, CANVAS_WIDTH, CANVAS_HEIGHT - ROAD);
  ctx.fillStyle = '#52525B'; ctx.fillRect(0, ROAD, CANVAS_WIDTH, 6);
  ctx.fillStyle = '#FDE047'; ctx.fillRect(0, ROAD + 8, CANVAS_WIDTH, 2);
  const dash = 140, doff = ((-s) % dash + dash) % dash;
  ctx.fillStyle = '#F8FAFC';
  for (let x = doff - dash; x < CANVAS_WIDTH; x += dash) ctx.fillRect(x, ROAD + 58, 70, 4);
  // Motion streaks on the asphalt
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  for (let k = 0; k < 12; k++) { const x = ((hash(k + 20) * 1000 - s * 1.1) % 1000 + 1000) % 1000 - 100; ctx.fillRect(x, ROAD + 16 + hash(k + 21) * 70, 80, 2); }
  // (swerving off the road at the end: the whole view lurches)
};

// ---------------------------------------------------------------------------
// World: the trucks (behind everything that moves)
// ---------------------------------------------------------------------------

export const drawConvoyBack = (ctx: Ctx, state: GameState, rt: DaleRuntime) => {
  const cv = rt.convoy;
  const f = state.frame;
  const swerve = cv.cab.swerve;
  cv.trucks.forEach((tr, i) => {
    const x = truckX(cv, i);
    if (tr.phase === 'gone') { ctx.save(); sized(ctx, x - tr.back, i); drawWreck(ctx, x - tr.back, f, tr.boomT); ctx.restore(); return; }
    const w = truckDims(i).w;
    if (x > state.camera.x + CANVAS_WIDTH + 200 || x + w < state.camera.x - 200) return;
    ctx.save();
    if (i === 3 && swerve) { ctx.translate(x + w / 2, Y); ctx.rotate(swerve * 0.04); ctx.translate(-(x + w / 2), -Y); }
    sized(ctx, x, i);
    drawSemi(ctx, x, f, tr, i, cv);
    ctx.restore();
  });
};

const WHEEL_R = 20;

/** Scales what's drawn next to truck i's size, from the road under its back end at x (the trucks are drawn at the base size). */
const sized = (ctx: Ctx, x: number, i: number) => {
  const s = truckDims(i).s;
  if (s !== 1) { ctx.translate(x, Y); ctx.scale(s, s); ctx.translate(-x, -Y); }
};

/** A semi: a DALE'S DRUGS trailer, the tractor (sleeper, cab, hood), all eighteen wheels going round. */
const drawSemi = (ctx: Ctx, x: number, f: number, tr: TruckState, i: number, cv: Convoy) => {
  const bounce = Math.sin(f * 0.9 + i) * 1.2;
  ctx.save(); ctx.translate(0, bounce);
  // The trailer
  const top = TRAILER_TOP, bottom = Y - 40;
  const sheen = ctx.createLinearGradient(0, top, 0, bottom);
  sheen.addColorStop(0, '#F8FAFC'); sheen.addColorStop(0.55, '#E5E7EB'); sheen.addColorStop(1, '#9CA3AF');
  ctx.fillStyle = sheen; ctx.fillRect(x, top, TRAILER_W, bottom - top);
  ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 2;
  for (let rx = x + 16; rx < x + TRAILER_W; rx += 20) { ctx.beginPath(); ctx.moveTo(rx, top + 4); ctx.lineTo(rx, bottom - 4); ctx.stroke(); }
  ctx.strokeStyle = '#374151'; ctx.lineWidth = 3; ctx.strokeRect(x, top, TRAILER_W, bottom - top);
  // The roof rail, its marker lights
  ctx.fillStyle = '#4B5563'; ctx.fillRect(x - 2, top - 4, TRAILER_W + 4, 6);
  ctx.fillStyle = '#FBBF24'; for (let mx = x + 24; mx < x + TRAILER_W; mx += 80) ctx.fillRect(mx, top - 5, 8, 4);
  // Barf burns on the roof
  if (tr.barfs > 0) {
    ctx.fillStyle = tr.barfs > 1 ? 'rgba(101, 163, 13, 0.9)' : 'rgba(101, 163, 13, 0.6)';
    ctx.beginPath(); ctx.ellipse(x + TRAILER_W * 0.5, top + 2, 26 + tr.barfs * 14, 5, 0, 0, Math.PI * 2); ctx.fill();
    if (f % 6 < 3) { ctx.fillStyle = '#ADFF2F'; ctx.fillRect(x + TRAILER_W * 0.5 - 10 + (f % 20), top - 6, 3, 3); }
  }
  // Livery
  const bandY = top + 26, bandH = 70;
  const band = ctx.createLinearGradient(x, 0, x + TRAILER_W, 0);
  band.addColorStop(0, '#4C1D95'); band.addColorStop(0.5, '#7C3AED'); band.addColorStop(1, '#4C1D95');
  ctx.fillStyle = band; ctx.fillRect(x + 40, bandY, TRAILER_W - 60, bandH);
  ctx.fillStyle = '#FDE047'; ctx.fillRect(x + 40, bandY, TRAILER_W - 60, 3); ctx.fillRect(x + 40, bandY + bandH - 3, TRAILER_W - 60, 3);
  ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  ctx.font = 'bold 22px "Press Start 2P"'; ctx.lineWidth = 5; ctx.strokeStyle = '#1E1B4B';
  ctx.strokeText("DALE'S DRUGS", x + TRAILER_W / 2 + 10, bandY + 40); ctx.fillStyle = '#F472B6'; ctx.fillText("DALE'S DRUGS", x + TRAILER_W / 2 + 10, bandY + 40);
  ctx.font = '7px "Press Start 2P"'; ctx.fillStyle = '#E9D5FF'; ctx.fillText(`FLEET UNIT ${i + 1} - HOW'S MY DRIVING? DON'T CALL`, x + TRAILER_W / 2 + 10, bandY + 60);
  ctx.textAlign = 'left';
  // The back doors
  ctx.strokeStyle = '#6B7280'; ctx.lineWidth = 2; ctx.strokeRect(x + 4, top + 8, 24, bottom - top - 16);
  ctx.fillStyle = '#EF4444'; ctx.fillRect(x + 2, bottom - 14, 6, 8);
  // Chassis, mudflaps, the fifth wheel
  ctx.fillStyle = '#1F2937'; ctx.fillRect(x, bottom, TRAILER_W + 10, 10); ctx.fillRect(x + TRAILER_W - 20, Y - 70, 40, 30);
  ctx.fillStyle = '#111111'; ctx.fillRect(x + 30, bottom + 4, 8, 22); ctx.fillRect(x + 150, bottom + 4, 8, 22);
  // The tractor
  const cx = x + TRAILER_W + 10;
  drawTractor(ctx, cx, f, i === 3 ? cv : null);
  ctx.restore();
  // Wheels: two axles at the back, the tractor's drive axles and steer axle
  const spin = wheelTurn(0, ROAD_SPEED, WHEEL_R, f); // (driving right, flat out)
  for (const wx of [x + 60, x + 110, cx + 20, cx + 64, cx + TRUCK_W - TRAILER_W - 34]) drawWheel(ctx, wx, Y - WHEEL_R, spin);
};

/** The tractor: a sleeper box (you can stand on it), the cab behind the windshield, the long hood, chrome stacks. */
const drawTractor = (ctx: Ctx, cx: number, f: number, last: Convoy | null) => {
  const sleeperW = SLEEPER_W, hoodX = cx + sleeperW, hoodW = TRUCK_W - TRAILER_W - 10 - sleeperW;
  const body = ctx.createLinearGradient(0, CAB_TOP, 0, Y - 40);
  body.addColorStop(0, '#DC2626'); body.addColorStop(0.6, '#991B1B'); body.addColorStop(1, '#7F1D1D');
  // Chrome stacks, smoke
  ctx.fillStyle = '#D1D5DB'; ctx.fillRect(cx + sleeperW - 24, CAB_TOP - 46, 8, 46); ctx.fillRect(cx + 6, CAB_TOP - 40, 7, 40);
  for (let i = 0; i < 3; i++) { const t = ((f * 3 + i * 13) % 40) / 40; ctx.fillStyle = `rgba(30,30,30,${0.5 * (1 - t)})`; ctx.beginPath(); ctx.arc(cx + sleeperW - 20 - t * 70, CAB_TOP - 50 - t * 20, 5 + t * 10, 0, Math.PI * 2); ctx.fill(); }
  // The sleeper and the cab (one block: its roof's where you stand), the windshield on its front
  ctx.fillStyle = body; ctx.fillRect(cx, CAB_TOP, sleeperW, Y - 40 - CAB_TOP);
  ctx.strokeStyle = '#450A0A'; ctx.lineWidth = 3; ctx.strokeRect(cx, CAB_TOP, sleeperW, Y - 40 - CAB_TOP);
  ctx.fillStyle = '#FDE047'; ctx.fillRect(cx + 4, CAB_TOP + 60, sleeperW - 8, 3);
  // The side window, and whoever's driving
  ctx.fillStyle = '#1E3A5F'; ctx.fillRect(cx + sleeperW - 44, CAB_TOP + 10, 38, 28);
  const ws = last ? windshield(last) : null;
  if (last) drawRiggs(ctx, cx + sleeperW - 24, CAB_TOP + 26, f, last);
  else { ctx.fillStyle = '#0F172A'; ctx.beginPath(); ctx.arc(cx + sleeperW - 22, CAB_TOP + 24, 8, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(cx + sleeperW - 30, CAB_TOP + 30, 16, 8); }
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.moveTo(cx + sleeperW - 14, CAB_TOP + 12); ctx.lineTo(cx + sleeperW - 9, CAB_TOP + 12); ctx.lineTo(cx + sleeperW - 22, CAB_TOP + 36); ctx.lineTo(cx + sleeperW - 27, CAB_TOP + 36); ctx.fill();
  // The windshield on the front face (cracked and bloody once Riggs has had it)
  ctx.fillStyle = '#60A5FA'; ctx.fillRect(cx + sleeperW - 5, CAB_TOP + 6, 5, HOOD_TOP - CAB_TOP - 10);
  if (last && (last.cab.phase === 'shot' || last.cab.phase === 'crash')) {
    ctx.strokeStyle = '#F8FAFC'; ctx.lineWidth = 1; const wy = CAB_TOP + 26;
    for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(cx + sleeperW - 2, wy); ctx.lineTo(cx + sleeperW - 2 + Math.cos(k) * 4, wy + Math.sin(k * 1.7) * 18); ctx.stroke(); }
    ctx.fillStyle = 'rgba(127, 29, 29, 0.85)'; ctx.fillRect(cx + sleeperW - 44, CAB_TOP + 14, 38, 20);
  }
  void ws;
  // The hood, the grille, the bumper, a headlight
  ctx.fillStyle = body; ctx.fillRect(hoodX, HOOD_TOP, hoodW, Y - 40 - HOOD_TOP);
  ctx.strokeStyle = '#450A0A'; ctx.strokeRect(hoodX, HOOD_TOP, hoodW, Y - 40 - HOOD_TOP);
  ctx.fillStyle = '#E5E7EB'; ctx.fillRect(hoodX + hoodW - 8, HOOD_TOP + 8, 10, 34);
  ctx.strokeStyle = '#6B7280'; ctx.lineWidth = 1; for (let gy = HOOD_TOP + 11; gy < HOOD_TOP + 42; gy += 5) { ctx.beginPath(); ctx.moveTo(hoodX + hoodW - 8, gy); ctx.lineTo(hoodX + hoodW + 2, gy); ctx.stroke(); }
  ctx.fillStyle = '#D1D5DB'; ctx.fillRect(hoodX + hoodW - 12, Y - 46, 18, 8);
  ctx.fillStyle = '#FEF08A'; ctx.fillRect(hoodX + hoodW - 2, HOOD_TOP + 4, 5, 6);
  ctx.fillStyle = '#D1D5DB'; ctx.fillRect(hoodX + 10, HOOD_TOP - 6, 10, 6); // hood ornament
};

/** Riggs: a trucker cap, aviators, a big mustache, flannel; on the radio, thumb over the red button (then slumped on the horn). */
const drawRiggs = (ctx: Ctx, x: number, y: number, f: number, cv: Convoy) => {
  const dead = cv.cab.phase === 'shot' || cv.cab.phase === 'crash';
  // Shot: his head snaps back, then he goes forward, face down on the wheel (and the horn), and stays there
  const k = cv.cab.phase === 'crash' ? 1 : dead ? Math.min(1, cv.cab.t / 24) : 0;
  const snap = dead && cv.cab.t < 5 && cv.cab.phase === 'shot' ? -0.35 : 0;
  const ease = 1 - Math.pow(1 - Math.max(0, (k - 0.2) / 0.8), 3);
  // The wheel, in front of him
  ctx.fillStyle = '#27272A'; ctx.beginPath(); ctx.ellipse(x + 13, y + 8, 3, 10, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.translate(x + ease * 7, y + ease * 9);
  ctx.rotate(snap + ease * 1.25);
  ctx.fillStyle = '#B91C1C'; ctx.fillRect(-9, 4, 18, 12); // flannel
  ctx.fillStyle = '#E0AC69'; ctx.beginPath(); ctx.arc(0, -4, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1E3A8A'; ctx.fillRect(-8, -13, 16, 5); ctx.fillRect(-2, -10, 12, 2); // cap
  ctx.fillStyle = '#111827'; ctx.fillRect(-4, -6, 11, 3); // aviators
  ctx.fillStyle = '#5B3413'; ctx.fillRect(-2, -1, 10, 3); // mustache
  if (!dead) {
    // The radio at his mouth, the button in his other hand
    ctx.fillStyle = '#1F2937'; ctx.fillRect(6, -2, 5, 8);
    if (cv.cab.phase === 'standoff' || cv.cab.phase === 'bicker') { ctx.fillStyle = '#DC2626'; ctx.beginPath(); ctx.arc(-10, 12, 3.5, 0, Math.PI * 2); ctx.fill(); if (f % 20 < 10) { ctx.fillStyle = '#FCA5A5'; ctx.beginPath(); ctx.arc(-10, 12, 2, 0, Math.PI * 2); ctx.fill(); } }
  } else { ctx.fillStyle = '#7F1D1D'; ctx.fillRect(-3, -8, 5, 5); }
  ctx.restore();
};

const drawWheel = (ctx: Ctx, x: number, y: number, spin: number) => {
  ctx.fillStyle = '#111111'; ctx.beginPath(); ctx.arc(x, y, WHEEL_R, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#9CA3AF'; ctx.beginPath(); ctx.arc(x, y, WHEEL_R * 0.55, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#4B5563'; ctx.lineWidth = 3;
  for (let k = 0; k < 5; k++) { const a = spin + (k * Math.PI * 2) / 5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * WHEEL_R * 0.5, y + Math.sin(a) * WHEEL_R * 0.5); ctx.stroke(); }
  ctx.fillStyle = '#E5E7EB'; ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill();
};

/** What's left of a truck: a burning shell on its rims, dropping away behind. */
const drawWreck = (ctx: Ctx, x: number, f: number, t: number) => {
  if (t > 400) return;
  ctx.fillStyle = '#1C1917'; ctx.fillRect(x + 20, TRAILER_TOP + 50, TRAILER_W - 60, Y - 40 - TRAILER_TOP - 50);
  ctx.fillStyle = '#292524'; ctx.fillRect(x + TRAILER_W - 10, CAB_TOP + 40, TRUCK_W - TRAILER_W - 10, Y - 40 - CAB_TOP - 40);
  for (let k = 0; k < 8; k++) {
    const fx = x + 30 + k * 80, h = 50 + Math.sin(f * 0.4 + k) * 20;
    ctx.fillStyle = k % 2 ? 'rgba(249,115,22,0.85)' : 'rgba(253,224,71,0.8)';
    ctx.beginPath(); ctx.moveTo(fx - 20, TRAILER_TOP + 60); ctx.quadraticCurveTo(fx, TRAILER_TOP + 60 - h, fx + 20, TRAILER_TOP + 60); ctx.fill();
  }
  ctx.fillStyle = 'rgba(28,25,23,0.5)'; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(x + 80 + k * 110 + (f % 40), TRAILER_TOP - 20 - (f * 2 + k * 30) % 120, 20 + k * 4, 0, Math.PI * 2); ctx.fill(); }
};

// ---------------------------------------------------------------------------
// World: in front of everything (the SUVs, the junk, the kill arrow, the falls)
// ---------------------------------------------------------------------------

export const drawConvoyFront = (ctx: Ctx, state: GameState, rt: DaleRuntime) => {
  const cv = rt.convoy;
  const f = state.frame;
  cv.trucks.forEach((tr, i) => { if (tr.phase === 'gone' && tr.boomT < 130) { ctx.save(); sized(ctx, truckX(cv, i) - tr.back, i); drawTruckBlast(ctx, truckX(cv, i) - tr.back, tr.boomT); ctx.restore(); } });
  for (const s of cv.suvs) drawSuv(ctx, s.x, f, !s.dropped);
  for (const d of cv.debris) drawDebris(ctx, d);
  // Riggs, on the radio (his bubble up at the cab)
  const big = truckDims(3);
  const rx = windshield(cv).x + 10;
  const rtext = saying(rt.talk, 'riggs');
  if (rtext) drawBubble(ctx, rx, big.cabTop - 60, rtext, '#FEF3C7');
  // (him on the horn)
  if (cv.cab.phase === 'shot' || cv.cab.phase === 'crash') {
    const ws = windshield(cv);
    const wob = Math.sin(f * 0.5) * 3;
    ctx.save(); ctx.translate(ws.x + ws.w / 2 + 40, big.cabTop - 30 + wob); ctx.rotate(-0.12 + Math.sin(f * 0.3) * 0.05);
    ctx.font = 'bold 16px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillStyle = '#000'; ctx.fillText('HOOOOONK', 2, 2); ctx.fillStyle = f % 8 < 4 ? '#FDE047' : '#FEF9C3'; ctx.fillText('HOOOOONK', 0, 0);
    ctx.textAlign = 'left'; ctx.restore();
  }
  // The KILL arrow on him (once he's arguing)
  if ((cv.cab.phase === 'bicker' || cv.cab.phase === 'standoff') && Math.floor(f / 10) % 2 === 0) {
    const ws = windshield(cv);
    const ax = ws.x + ws.w / 2 - 10, ay = big.cabTop - 24 + Math.sin(f * 0.2) * 4;
    ctx.fillStyle = '#DC2626'; ctx.beginPath(); ctx.moveTo(ax, ay + 16); ctx.lineTo(ax - 12, ay); ctx.lineTo(ax + 12, ay); ctx.fill();
    ctx.font = 'bold 14px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillStyle = '#000'; ctx.fillText('KILL', ax + 2, ay - 6); ctx.fillStyle = '#F87171'; ctx.fillText('KILL', ax, ay - 8); ctx.textAlign = 'left';
    // (and the hood he wants to be on)
    const h = hood(cv);
    ctx.strokeStyle = `rgba(250, 204, 21, ${0.4 + 0.3 * Math.sin(f * 0.2)})`; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
    ctx.strokeRect(h.x + 2, h.top - 70, h.x2 - h.x - 4, 70); ctx.setLineDash([]);
  }
  drawFall(ctx, state, cv);
};

/**
 * A truck going up, t frames in: a white flash, a chain of fireballs down its length (the tank under the cab, then
 * the trailer's load), a shockwave ring, the roof panels, the wheels and the cargo flying, a column of black smoke
 * rolling up. Worked out from t, so it looks the same however it's drawn.
 */
const drawTruckBlast = (ctx: Ctx, x: number, t: number) => {
  const cy = TRAILER_TOP + 60;
  ctx.save();
  // The flash
  if (t < 8) { ctx.fillStyle = `rgba(255, 250, 220, ${0.85 - t * 0.1})`; ctx.beginPath(); ctx.arc(x + TRUCK_W * 0.6, cy, 420, 0, Math.PI * 2); ctx.fill(); }
  // The shockwave
  if (t < 34) { ctx.strokeStyle = `rgba(255, 237, 213, ${0.8 - t / 42})`; ctx.lineWidth = 8 - t * 0.2; ctx.beginPath(); ctx.ellipse(x + TRUCK_W * 0.6, cy + 40, 30 + t * 22, 12 + t * 8, 0, 0, Math.PI * 2); ctx.stroke(); }
  // The fireballs, one after another down its length (cab first)
  for (let k = 0; k < 6; k++) {
    const t0 = k * 4, tt = t - t0;
    if (tt < 0 || tt > 70) continue;
    const bx = x + TRUCK_W - 60 - k * 115 + Math.sin(k * 2.3) * 20, by = cy - tt * 1.4 - k * 6;
    const r = Math.min(110, 30 + tt * 5) * (1 - Math.max(0, tt - 40) / 60);
    const fade = Math.max(0, 1 - Math.max(0, tt - 30) / 40);
    const g = ctx.createRadialGradient(bx, by, 4, bx, by, r);
    g.addColorStop(0, `rgba(255, 255, 230, ${fade})`); g.addColorStop(0.3, `rgba(253, 224, 71, ${fade})`); g.addColorStop(0.6, `rgba(249, 115, 22, ${fade * 0.95})`); g.addColorStop(1, 'rgba(127, 29, 29, 0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.fill();
  }
  // The smoke, rolling up out of it
  for (let k = 0; k < 10; k++) {
    const tt = t - 10 - k * 3;
    if (tt < 0) continue;
    const sx = x + 80 + (k * 71) % (TRUCK_W - 120) + Math.sin(tt * 0.05 + k) * 12, sy = cy - 40 - tt * (1.6 + (k % 3) * 0.4);
    const r = 24 + tt * 0.7;
    ctx.fillStyle = `rgba(28, 25, 23, ${Math.max(0, 0.75 - tt / 160)})`; ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill();
  }
  // What's flying: roof panels (the livery on them), wheels, crates of product
  for (let k = 0; k < 16; k++) {
    const vx = (hash(k + 3) - 0.35) * 16, vy = -(8 + hash(k + 9) * 16);
    const px = x + 60 + hash(k) * (TRUCK_W - 80) + vx * t, py = cy - 30 + vy * t + 0.45 * t * t;
    if (py > Y + 200) continue;
    ctx.save(); ctx.translate(px, py); ctx.rotate(t * (0.15 + hash(k + 5) * 0.3) * (k % 2 ? 1 : -1));
    if (k % 4 === 0) { ctx.fillStyle = '#111111'; ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#9CA3AF'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill(); }
    else if (k % 4 === 1) { ctx.fillStyle = '#E5E7EB'; ctx.fillRect(-22, -6, 44, 12); ctx.fillStyle = '#7C3AED'; ctx.fillRect(-22, -2, 44, 5); }
    else if (k % 4 === 2) { ctx.fillStyle = '#A16207'; ctx.fillRect(-9, -9, 18, 18); ctx.strokeStyle = '#713F12'; ctx.lineWidth = 2; ctx.strokeRect(-9, -9, 18, 18); }
    else { ctx.fillStyle = '#DC2626'; ctx.beginPath(); ctx.moveTo(-12, -6); ctx.lineTo(14, -2); ctx.lineTo(-4, 8); ctx.fill(); }
    // (burning as it goes)
    if (t < 60) { ctx.fillStyle = 'rgba(249, 115, 22, 0.7)'; ctx.beginPath(); ctx.arc(-4, -4, 6, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }
  ctx.restore();
};

/** A black SUV, a goon up through the sunroof (till he goes). */
const drawSuv = (ctx: Ctx, x: number, f: number, loaded: boolean) => {
  const y = Y + 12, w = 150, h = 70;
  ctx.fillStyle = '#0B0B0B'; ctx.beginPath(); ctx.roundRect(x - w / 2, y - h, w, h - 16, 10); ctx.fill();
  ctx.fillStyle = '#1F2937'; ctx.fillRect(x - w / 2 + 16, y - h + 8, w - 50, 22);
  ctx.fillStyle = '#374151'; ctx.fillRect(x - w / 2 + 64, y - h + 8, 3, 22);
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x - 44, y - 14, 15, 0, Math.PI * 2); ctx.arc(x + 44, y - 14, 15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#6B7280'; ctx.beginPath(); ctx.arc(x - 44, y - 14, 6, 0, Math.PI * 2); ctx.arc(x + 44, y - 14, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FEF08A'; ctx.fillRect(x + w / 2 - 6, y - 40, 6, 6);
  if (loaded) {
    ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(x + 4, y - h - 14, 8, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(x - 6, y - h - 8, 20, 12);
    ctx.fillStyle = '#B91C1C'; ctx.fillRect(x - 2, y - h - 14, 14, 5);
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(x - w / 2 - 10 - i * 12, y - 50 + i * 12); ctx.lineTo(x - w / 2 - 40 - i * 12, y - 50 + i * 12); ctx.stroke(); }
  void f;
};

const drawDebris = (ctx: Ctx, d: Debris) => {
  ctx.save(); ctx.translate(d.x + d.w / 2, d.y + d.h / 2); ctx.rotate(d.rot);
  switch (d.look) {
    case 'tire':
      ctx.fillStyle = '#111111'; ctx.beginPath(); ctx.arc(0, 0, d.w / 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#374151'; ctx.beginPath(); ctx.arc(0, 0, d.w / 4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#27272A'; ctx.lineWidth = 3; for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * d.w * 0.35, Math.sin(a) * d.w * 0.35); ctx.lineTo(Math.cos(a) * d.w * 0.5, Math.sin(a) * d.w * 0.5); ctx.stroke(); }
      break;
    case 'tumbleweed':
      ctx.strokeStyle = '#A16207'; ctx.lineWidth = 2;
      for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2; ctx.beginPath(); ctx.arc(Math.cos(a) * 6, Math.sin(a) * 6, d.w / 2 - 6, a, a + 2.4); ctx.stroke(); }
      break;
    case 'sign':
      ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.moveTo(0, -d.h); ctx.lineTo(d.h, 0); ctx.lineTo(0, d.h); ctx.lineTo(-d.h, 0); ctx.fill();
      ctx.strokeStyle = '#111827'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#111827'; ctx.font = 'bold 5px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('CATTLE', 0, -1); ctx.fillText('XING', 0, 6); ctx.textAlign = 'left';
      break;
    case 'box':
      ctx.fillStyle = '#C2A26B'; ctx.fillRect(-d.w / 2, -d.h / 2, d.w, d.h);
      ctx.fillStyle = '#92400E'; ctx.fillRect(-d.w / 2, -2, d.w, 4);
      ctx.fillStyle = '#1E3A8A'; ctx.font = 'bold 4px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('THIS SIDE', 0, -6); ctx.fillText('UP', 0, 10); ctx.textAlign = 'left';
      break;
  }
  ctx.restore();
};

/** Off the side of a truck, blown up, melted through, or blown up by Riggs. */
const drawFall = (ctx: Ctx, state: GameState, cv: Convoy) => {
  let fall = cv.fall;
  if (!fall) return;
  const p = state.player;
  const f = state.frame;
  if ((fall.kind === 'flop' || fall.kind === 'runover') && fall.road) {
    const r = fall.road;
    // What he's left on the road so far (the road's still going by under it)
    for (const s of r.smears) {
      const sx = s.g - r.passed;
      ctx.fillStyle = 'rgba(127, 29, 29, 0.85)'; ctx.fillRect(sx - s.w, Y - 5, s.w, 5);
      ctx.fillStyle = 'rgba(185, 28, 28, 0.9)'; ctx.fillRect(sx - s.w * 0.7, Y - 3, s.w * 0.6, 2);
    }
    const stopped = r.stoppedAt >= 0;
    const still = stopped ? fall.t - r.stoppedAt : 0;
    // Once he's stopped: a pool of it spreading out under him, and a twitch now and then
    if (stopped) { ctx.fillStyle = 'rgba(127, 29, 29, 0.9)'; ctx.beginPath(); ctx.ellipse(fall.x, Y - 2, Math.min(70, 20 + still * 0.6), 5, 0, 0, Math.PI * 2); ctx.fill(); }
    const twitch = stopped && (still % 47 < 5 || still % 83 < 3) ? (Math.random() - 0.5) * 0.25 : 0;
    const body = { ...p, pos: { x: -1e6, y: -1e6 }, hidden: false, isGrounded: false, vel: { x: -3, y: 4 }, isCharging: false, isSliding: false, isUppercutting: false, isDivekicking: false, invincibilityTimer: 0, hurtTimer: 30, pushbackTimer: 30 };
    ctx.save();
    if (r.flat > 0) {
      // Flattened: spread out along the road, tire tracks across him
      const squash = Math.max(0.22, 1 - r.crunched.length * 0.2) + twitch * 0.2;
      ctx.translate(fall.x, Y - 6);
      ctx.rotate(-Math.PI / 2 + twitch);
      ctx.scale(squash, 1.25);
      ctx.translate(-(body.pos.x + body.width / 2), -(body.pos.y + body.height / 2));
      drawPlayer(ctx, body, { ...state, deathTimer: 0 }, { currentWeapon: p.currentWeapon, showFilthShield: false, invincibilityEnabled: false });
      ctx.restore();
      ctx.fillStyle = 'rgba(17, 17, 17, 0.75)';
      for (let k = 0; k < r.crunched.length; k++) for (let s = 0; s < 6; s++) ctx.fillRect(fall.x - 40 + s * 14 + k * 3, Y - 14 + (k % 2) * 3, 7, 5);
      if (stopped && still % 47 < 5) { ctx.fillStyle = '#E0AC69'; ctx.fillRect(fall.x + 38, Y - 10 - (still % 5), 10, 3); } // a hand, flapping
    } else {
      // Cartwheeling down the road, and then face down on it
      const lying = stopped ? Math.PI / 2 * (r.rot >= 0 ? 1 : -1) : r.rot;
      ctx.translate(fall.x + (stopped ? Math.sin(still * 3) * (twitch ? 1.5 : 0) : 0), Y - r.h - (stopped ? 12 : 30));
      ctx.rotate(lying + twitch);
      ctx.translate(-(body.pos.x + body.width / 2), -(body.pos.y + body.height / 2));
      drawPlayer(ctx, body, { ...state, deathTimer: 0 }, { currentWeapon: p.currentWeapon, showFilthShield: false, invincibilityEnabled: false });
      ctx.restore();
    }
  } else if (fall.kind === 'melt') {
    // A hole in the roof, and a cutaway of the trailer: the goons riding in the back, all firing
    const tx = truckX(cv, fall.truck);
    ctx.save(); sized(ctx, tx, fall.truck);
    const s = truckDims(fall.truck).s;
    fall = { ...fall, x: tx + (fall.x - tx) / s };
    ctx.fillStyle = '#0A0A0A'; ctx.beginPath(); ctx.ellipse(fall.x, TRAILER_TOP + 2, 34, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#65A30D'; for (let i = 0; i < 5; i++) ctx.fillRect(fall.x - 30 + i * 14, TRAILER_TOP - 2 + (i % 2) * 3, 5, 4);
    if (fall.t > 20) {
      ctx.save();
      ctx.beginPath(); ctx.rect(tx + 30, TRAILER_TOP + 6, TRAILER_W - 40, Y - 50 - TRAILER_TOP); ctx.clip();
      ctx.fillStyle = 'rgba(12, 10, 9, 0.94)'; ctx.fillRect(tx + 30, TRAILER_TOP + 6, TRAILER_W - 40, Y - 50 - TRAILER_TOP);
      for (let k = 0; k < 5; k++) {
        const gx = tx + 60 + k * 90, gy = Y - 48;
        ctx.fillStyle = '#1F2937'; ctx.fillRect(gx - 8, gy - 50, 16, 50); ctx.fillStyle = '#B07A4F'; ctx.beginPath(); ctx.arc(gx, gy - 58, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#111827'; ctx.fillRect(gx - 2, gy - 44, 22, 5);
        if ((f + k * 3) % 6 < 3 && fall.t > 40) { ctx.fillStyle = '#FDE047'; ctx.beginPath(); ctx.arc(gx + 24, gy - 42, 6, 0, Math.PI * 2); ctx.fill(); }
      }
      // Meathead in the middle of it
      const body = { ...p, pos: { x: -1e6, y: -1e6 }, hidden: false, isGrounded: false, vel: { x: 0, y: 3 }, invincibilityTimer: 0, hurtTimer: 10, pushbackTimer: 10 };
      ctx.translate(fall.x, Y - 90 + Math.min(0, (fall.t - 40) * -0)); ctx.translate(-(body.pos.x + body.width / 2), -(body.pos.y + body.height / 2));
      if (Math.floor(f / 3) % 2) drawPlayer(ctx, body, { ...state, deathTimer: 0 }, { currentWeapon: p.currentWeapon, showFilthShield: false, invincibilityEnabled: false });
      ctx.restore();
    }
    ctx.restore();
  }
};

// ---------------------------------------------------------------------------
// Screen space
// ---------------------------------------------------------------------------

export const drawConvoyHud = (ctx: Ctx, state: GameState, rt: DaleRuntime) => {
  const cv = rt.convoy;
  if (!cv.active) return;
  const f = state.frame;
  const W = CANVAS_WIDTH;
  const tr = cv.trucks[cv.current];
  ctx.save();
  // Truck n of 4, and its countdown (hidden while he's going under the wheels or down the road)
  if (tr && (tr.phase === 'active' || tr.phase === 'cleared') && !cv.fall) {
    const secs = Math.max(0, Math.ceil(tr.timeLeft / 60));
    const low = tr.phase === 'cleared' ? 5 : 10;
    const urgent = secs <= low;
    // (the beat of each second: it swells and flashes on it)
    const beat = 1 - (tr.timeLeft % 60) / 60;
    const pulse = urgent ? Math.pow(Math.max(0, beat - 0.55) / 0.45, 2) : 0;
    const flash = urgent && beat > 0.7;
    const bw = 236, bh = 64, bx = W - bw - 14, by = 14;
    ctx.save();
    ctx.translate(bx + bw / 2, by + bh / 2);
    ctx.scale(1 + pulse * 0.14, 1 + pulse * 0.14);
    ctx.translate(-(bx + bw / 2), -(by + bh / 2));
    ctx.fillStyle = flash ? 'rgba(185, 28, 28, 0.9)' : 'rgba(0,0,0,0.7)'; ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = urgent ? (flash ? '#FFFFFF' : '#EF4444') : '#F97316'; ctx.lineWidth = urgent ? 4 : 2; ctx.strokeRect(bx, by, bw, bh);
    ctx.textAlign = 'center';
    const label = tr.phase === 'cleared' ? 'GET OFF THE TRUCK!' : `TRUCK ${cv.current + 1} OF 4: RIGGED`;
    ctx.font = 'bold 8px "Press Start 2P"'; ctx.fillStyle = flash ? '#FFFFFF' : '#FDBA74';
    ctx.fillText(label, bx + bw / 2, by + 18, bw - 16);
    ctx.font = 'bold 24px "Press Start 2P"'; ctx.fillStyle = urgent ? (flash ? '#FFFFFF' : '#F87171') : '#F8FAFC';
    ctx.fillText(`0:${String(secs).padStart(2, '0')}`, bx + bw / 2, by + 52, bw - 16);
    ctx.restore();
    if (urgent) {
      // Red at the edges of the screen, throbbing with the seconds, and a warning under the clock
      const v = ctx.createRadialGradient(W / 2, CANVAS_HEIGHT / 2, 240, W / 2, CANVAS_HEIGHT / 2, 560);
      v.addColorStop(0, 'rgba(220, 38, 38, 0)'); v.addColorStop(1, `rgba(220, 38, 38, ${0.15 + pulse * 0.35})`);
      ctx.fillStyle = v; ctx.fillRect(0, 0, W, CANVAS_HEIGHT);
      if (Math.floor(f / 8) % 2 === 0) {
        ctx.textAlign = 'center'; ctx.font = 'bold 10px "Press Start 2P"';
        ctx.fillStyle = '#000'; ctx.fillText(tr.phase === 'cleared' ? '!! JUMP !!' : '!! ABOUT TO BLOW !!', bx + bw / 2 + 2, by + bh + 22);
        ctx.fillStyle = '#FDE047'; ctx.fillText(tr.phase === 'cleared' ? '!! JUMP !!' : '!! ABOUT TO BLOW !!', bx + bw / 2, by + bh + 20);
      }
    }
  }  // The big word across the middle
  const b = cv.banner;
  if (b && b.t < 110) {
    const k = Math.min(1, b.t / 8), out = b.t > 80 ? (b.t - 80) / 30 : 0;
    ctx.globalAlpha = 1 - out;
    ctx.translate(W / 2, 200); ctx.scale(2 - k, 2 - k);
    ctx.textAlign = 'center'; ctx.font = 'bold 30px "Press Start 2P"';
    ctx.fillStyle = '#000'; ctx.fillText(b.text, 3, 3); ctx.fillStyle = b.color; ctx.fillText(b.text, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  }
  // GO, and which way
  if (tr && tr.phase === 'cleared' && cv.trucks[cv.current + 1] && Math.floor(f / 12) % 2 === 0) {
    ctx.fillStyle = '#22C55E'; ctx.font = 'bold 26px "Press Start 2P"'; ctx.textAlign = 'right';
    ctx.fillStyle = '#000'; ctx.fillText('GO', W - 64, 322); ctx.fillStyle = '#22C55E'; ctx.fillText('GO', W - 66, 320);
    ctx.beginPath(); ctx.moveTo(W - 20, 310); ctx.lineTo(W - 52, 290); ctx.lineTo(W - 52, 330); ctx.fill();
  }
  // Junk coming down the road: a warning at the edge where it'll come in
  for (const d of debrisComing(state, cv)) {
    if (Math.floor(f / 6) % 2) continue;
    const sy = d.y + d.h / 2 - state.camera.y;
    ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.moveTo(W - 8, sy - 20); ctx.lineTo(W - 8, sy + 20); ctx.lineTo(W - 40, sy); ctx.fill();
    ctx.fillStyle = '#000'; ctx.font = 'bold 14px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('!', W - 20, sy + 7);
    ctx.fillStyle = '#FDE047'; ctx.font = 'bold 7px "Press Start 2P"'; ctx.fillText(d.low ? 'JUMP' : 'DUCK', W - 30, sy + 34);
  }
  // Dale on the radio
  const dt = saying(rt.talk, 'dale');
  if (dt || cv.radioT > 0 && dt) {
    ctx.fillStyle = 'rgba(30, 10, 40, 0.85)'; ctx.fillRect(14, CANVAS_HEIGHT - 86, W - 28, 50);
    ctx.strokeStyle = '#C084FC'; ctx.lineWidth = 2; ctx.strokeRect(14, CANVAS_HEIGHT - 86, W - 28, 50);
    ctx.fillStyle = '#E9D5FF'; ctx.font = 'bold 8px "Press Start 2P"'; ctx.textAlign = 'left'; ctx.fillText('DALE (RADIO):', 28, CANVAS_HEIGHT - 66);
    ctx.fillStyle = '#F8FAFC'; ctx.fillText(dt, 28, CANVAS_HEIGHT - 48, W - 60);
    // A crackle
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; for (let i = 0; i < 6; i++) ctx.fillRect(W - 120 + i * 14, CANVAS_HEIGHT - 70 + Math.sin(f * 0.8 + i) * 6, 8, 3);
  }
  ctx.restore();
  void COURSE;
};
