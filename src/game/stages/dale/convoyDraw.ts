// The convoy, drawn: the desert going by at eighty (the sky and the mesas crawl,
// the scrub and the telephone poles whip past, the road's lines are a blur), the
// four semis in DALE'S DRUGS livery, the SUVs pulling up with goons on the roof,
// the junk flying down the road, the burning wrecks falling away behind, the last
// truck's driver in his cab. And the HUD: which truck, the countdown, GO, Dale on
// the radio, the warnings for what's coming, and the KILL arrow on Riggs.

import type { GameState } from '../../core/state';
import { bandedGradient, checker, hazeBands, pixelBlob, tilePattern } from '../../render/pixelArt';
import { drawFire } from '../../render/fx/fire';
import { drawFireball } from '../../render/fx/fireball';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y } from '../../../constants';
import { drawPlayer } from '../../render/player/player';
import { COURSE, TRAILER_W, TRUCK_W, TRAILER_TOP, CAB_TOP, HOOD_TOP, SLEEPER_W, truckDims } from './course';
import type { DaleRuntime } from './runtime';
import { Convoy, TruckState, truckX, ROAD_SPEED, debrisComing, windshield, hood, truckTilt, HIGHWAY_CAM_Y, Debris, MELT, MELT_SAYS, FAMILY } from './convoy';
import type { Talk } from './script';
import { makeKindEnemy } from '../../enemies/kinds';
import { drawDaleKind } from '../../render/enemies/dale';
import { saying, drawBubble } from './script';
import { layer, hash } from './draw';
import { wheelTurn, drawTruckWheel, slab, column, pipe, letter, trailerBox, rearDoors, liveryBand, redPaint, headBeam, exhaust } from '../../render/bosses/daleTruck';
import { drawPerson } from '../../render/npc/person';
import type { PersonSpec } from '../../render/npc/person';
import { INK, ink, limb, shadedTop } from '../../render/npc/kit';
import { drawCrate } from './draw';

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
  // Near desert, whipping by: the flats in bands (hazed toward the mesas), streaks of grit going past
  bandedGradient(ctx, 0, 300, CANVAS_WIDTH, ROAD - 300, ['#7E4A30', '#8E5434', '#9A5A34', '#A8653A'], 5);
  hazeBands(ctx, 0, 300, CANVAS_WIDTH, ROAD - 300, '#3C191E', 0.6, 0, 6);
  for (let k = 0; k < 18; k++) {
    const x = ((hash(k + 40) * 1200 - s * 0.85) % 1200 + 1200) % 1200 - 100, y = 320 + hash(k + 41) * (ROAD - 326);
    ctx.fillStyle = k % 2 ? 'rgba(201, 132, 82, 0.5)' : 'rgba(110, 58, 34, 0.45)'; ctx.fillRect(Math.floor(x), Math.floor(y), 18 + hash(k + 42) * 30, 2);
  }
  // (the scrub: chunky clumps, lit on top, a dark foot, inked once they're near)
  for (let k = 0; k < 24; k++) {
    const x = ((hash(k) * 1600 - s * 0.7) % 1600 + 1600) % 1600 - 200;
    const y = 318 + hash(k + 3) * (ROAD - 330);
    const near = (y - 318) / (ROAD - 330), rw = 6 + hash(k + 9) * 10, rh = 3 + hash(k + 9) * 4;
    const sage = hash(k + 5) > 0.5, c = sage ? '#556B2F' : '#6B4A2A';
    ctx.beginPath(); ctx.ellipse(x, y, rw, rh, 0, Math.PI, 0); ctx.fillStyle = c; ctx.fill();
    if (near > 0.5) { ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke(); }
    ctx.fillStyle = sage ? '#7A8F42' : '#8A6440'; ctx.fillRect(Math.floor(x - rw * 0.5), Math.floor(y - rh + 1), Math.ceil(rw * 0.6), 2);
    ctx.fillStyle = 'rgba(40, 20, 12, 0.4)'; ctx.fillRect(Math.floor(x - rw), Math.floor(y), Math.ceil(rw * 2), 2);
  }
  // Telephone poles and their wires, flicking past (a creosoted pole, its crossarm, the glass insulators)
  const pole = 420;
  const off = ((-s * 0.8) % pole + pole) % pole;
  for (let x = off - pole; x < CANVAS_WIDTH + pole; x += pole) {
    ctx.strokeStyle = '#2A1A10'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x - 14, 226); ctx.quadraticCurveTo(x + pole / 2 - 14, 250, x + pole - 14, 226); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 20, 226); ctx.quadraticCurveTo(x + pole / 2 + 20, 250, x + pole + 20, 226); ctx.stroke();
    column(ctx, x, 210, 7, ROAD - 210 - 4, '#4A321C');
    pipe(ctx, x - 16, 222, 40, 5, '#5A3D22');
    for (const ix of [x - 14, x + 20]) { ink(ctx, () => ctx.rect(ix - 1, 217, 3, 5), '#5EAFA0', 0.6); ctx.fillStyle = '#A7F3D0'; ctx.fillRect(ix - 1, 218, 1, 1); }
  }
  // A road sign now and then (and, near the end, the town): green enamel, a white border, on two posts
  const signEvery = 3600;
  const sx = ((-s * 0.95) % signEvery + signEvery) % signEvery - 200;
  const late = cv.current === 3;
  if (sx < CANVAS_WIDTH + 100) {
    column(ctx, sx + 50, ROAD - 150, 6, 150, '#6B7280'); column(ctx, sx + 130, ROAD - 150, 6, 150, '#6B7280');
    slab(ctx, sx, ROAD - 200, 190, 64, '#15803D', 2);
    ctx.strokeStyle = '#F8FAFC'; ctx.lineWidth = 2; ctx.strokeRect(sx + 5, ROAD - 195, 180, 54);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'; ctx.fillRect(sx + 7, ROAD - 193, 176, 8);
    for (const [bx, by] of [[sx + 9, ROAD - 191], [sx + 179, ROAD - 191], [sx + 9, ROAD - 147], [sx + 179, ROAD - 147]]) { ctx.fillStyle = '#D1D5DB'; ctx.fillRect(bx, by, 2, 2); }
    letter(ctx, late ? 'DEADWOOD GULCH' : 'ALBUQUERQUE', sx + 95, ROAD - 174, 'bold 9px "Press Start 2P"', '#F8FAFC', '#14532D');
    letter(ctx, late ? '1 MI' : '42 MI', sx + 95, ROAD - 154, 'bold 9px "Press Start 2P"', '#F8FAFC', '#14532D');
  }
  // The road: the far lane's shoulder, the asphalt's grit going by, the lines going by
  ctx.fillStyle = '#3F3F46'; ctx.fillRect(0, ROAD, CANVAS_WIDTH, CANVAS_HEIGHT - ROAD);
  ctx.save(); ctx.translate(-((s % 48) + 48) % 48, ROAD);
  ctx.fillStyle = tilePattern(ctx, 'daleAsphalt', 48, 24, g => {
    g.fillStyle = '#4A4A52'; for (const [a, b] of [[3, 2], [17, 9], [29, 4], [41, 15], [9, 19], [35, 21], [22, 15]]) g.fillRect(a, b, 2, 1);
    g.fillStyle = '#34343A'; for (const [a, b] of [[12, 5], [26, 18], [44, 8], [6, 12], [38, 1]]) g.fillRect(a, b, 2, 1);
  });
  ctx.fillRect(0, 0, CANVAS_WIDTH + 96, CANVAS_HEIGHT - ROAD);
  ctx.restore();
  ctx.fillStyle = '#5B5B63'; ctx.fillRect(0, ROAD, CANVAS_WIDTH, 6);
  ctx.fillStyle = '#71717A'; ctx.fillRect(0, ROAD, CANVAS_WIDTH, 1);
  ctx.fillStyle = INK; ctx.fillRect(0, ROAD + 6, CANVAS_WIDTH, 1);
  ctx.fillStyle = '#FDE047'; ctx.fillRect(0, ROAD + 8, CANVAS_WIDTH, 2);
  ctx.fillStyle = '#A16207'; ctx.fillRect(0, ROAD + 10, CANVAS_WIDTH, 1);
  const dash = 140, doff = ((-s) % dash + dash) % dash;
  for (let x = doff - dash; x < CANVAS_WIDTH; x += dash) { ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x, ROAD + 58, 70, 4); ctx.fillStyle = '#A1A1AA'; ctx.fillRect(x, ROAD + 61, 70, 1); }
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
    const tilt = i === 3 && swerve ? truckTilt(cv) : null;
    if (tilt) { ctx.translate(tilt.x, tilt.y); ctx.rotate(tilt.angle); ctx.translate(-tilt.x, -tilt.y); }
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
  trailerBox(ctx, x, top, TRAILER_W, bottom - top, 20);
  // Barf burns on the roof (eaten in: a dark scorch, the green bubbling on it)
  if (tr.barfs > 0) {
    const bw = 26 + tr.barfs * 14;
    ctx.fillStyle = 'rgba(54, 83, 20, 0.85)'; ctx.beginPath(); ctx.ellipse(x + TRAILER_W * 0.5, top + 2, bw + 3, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = tr.barfs > 1 ? 'rgba(101, 163, 13, 0.95)' : 'rgba(101, 163, 13, 0.7)';
    ctx.beginPath(); ctx.ellipse(x + TRAILER_W * 0.5, top + 1, bw, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#BEF264'; for (let k = 0; k < 4; k++) ctx.fillRect(x + TRAILER_W * 0.5 - bw * 0.7 + k * bw * 0.45, top - 1 + (k % 2), 3, 2);
    if (f % 6 < 3) { ctx.fillStyle = '#ADFF2F'; ctx.fillRect(x + TRAILER_W * 0.5 - 10 + (f % 20), top - 6, 3, 3); }
  }
  // Livery
  const bandY = top + 26, bandH = 70;
  liveryBand(ctx, x + 40, bandY, TRAILER_W - 60, bandH);
  ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  ctx.font = 'bold 22px "Press Start 2P"'; ctx.lineWidth = 5; ctx.strokeStyle = '#1E1B4B';
  ctx.strokeText("DALE'S DRUGS", x + TRAILER_W / 2 + 10, bandY + 40);
  ctx.fillStyle = '#BE185D'; ctx.fillText("DALE'S DRUGS", x + TRAILER_W / 2 + 10, bandY + 41);
  ctx.fillStyle = '#F472B6'; ctx.fillText("DALE'S DRUGS", x + TRAILER_W / 2 + 10, bandY + 40);
  ctx.font = '7px "Press Start 2P"'; ctx.fillStyle = '#E9D5FF'; ctx.fillText(`FLEET UNIT ${i + 1} - HOW'S MY DRIVING? DON'T CALL`, x + TRAILER_W / 2 + 10, bandY + 60);
  ctx.textAlign = 'left';
  // The back doors, a tail lamp
  rearDoors(ctx, x + 4, top + 8, bottom - top - 16, 24);
  ink(ctx, () => ctx.rect(x + 2, bottom - 14, 6, 8), '#DC2626', 1); ctx.fillStyle = '#FCA5A5'; ctx.fillRect(x + 3, bottom - 13, 2, 2);
  // Chassis, mudflaps, the fifth wheel
  pipe(ctx, x, bottom, TRAILER_W + 10, 10, '#374151'); slab(ctx, x + TRAILER_W - 20, Y - 70, 40, 30, '#1F2937', 2);
  for (const mx of [x + 30, x + 150]) { slab(ctx, mx, bottom + 4, 8, 22, '#18181B', 1); ctx.fillStyle = '#A1A1AA'; ctx.fillRect(mx + 2, bottom + 19, 4, 2); }
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
  // Chrome stacks (a cap on each), smoke
  column(ctx, cx + sleeperW - 24, CAB_TOP - 46, 8, 46, '#D1D5DB'); slab(ctx, cx + sleeperW - 25, CAB_TOP - 48, 10, 4, '#9CA3AF', 1);
  column(ctx, cx + 6, CAB_TOP - 40, 7, 40, '#D1D5DB'); slab(ctx, cx + 5, CAB_TOP - 42, 9, 4, '#9CA3AF', 1);
  for (let i = 0; i < 3; i++) { const t = ((f * 3 + i * 13) % 40) / 40; exhaust(ctx, cx + sleeperW - 20 - t * 70, CAB_TOP - 50 - t * 20, 5 + t * 10, t); }
  // The sleeper and the cab (one block: its roof's where you stand), the windshield on its front
  const cabBox = () => ctx.rect(cx, CAB_TOP, sleeperW, Y - 40 - CAB_TOP);
  redPaint(ctx, cabBox, cx, CAB_TOP, sleeperW, Y - 40, 3);
  ctx.fillStyle = '#FDE047'; ctx.fillRect(cx + 4, CAB_TOP + 60, sleeperW - 8, 3); ctx.fillStyle = '#A16207'; ctx.fillRect(cx + 4, CAB_TOP + 62, sleeperW - 8, 1);
  // (the sleeper's door seam and handle, its step, the roof's lip)
  ctx.fillStyle = '#7F1D1D'; ctx.fillRect(cx + sleeperW - 50, CAB_TOP + 6, 1, Y - 46 - CAB_TOP); ctx.fillRect(cx + 6, CAB_TOP + 8, 1, Y - 50 - CAB_TOP);
  slab(ctx, cx + sleeperW - 46, CAB_TOP + 70, 8, 3, '#D1D5DB', 1);
  slab(ctx, cx + sleeperW - 44, Y - 52, 30, 6, '#9CA3AF', 1);
  pipe(ctx, cx - 1, CAB_TOP - 2, sleeperW + 2, 4, '#991B1B');
  // The side window, and whoever's driving
  ctx.fillStyle = '#1E3A5F'; ctx.fillRect(cx + sleeperW - 44, CAB_TOP + 10, 38, 28);
  ctx.fillStyle = '#2D5285'; ctx.fillRect(cx + sleeperW - 44, CAB_TOP + 10, 38, 5);
  const ws = last ? windshield(last) : null;
  if (last) drawRiggs(ctx, cx + sleeperW - 24, CAB_TOP + 26, f, last);
  else {
    // (a driver: a cap, his shoulders, dark against the glass)
    ink(ctx, () => ctx.roundRect(cx + sleeperW - 31, CAB_TOP + 29, 18, 10, 3), '#111827', 1);
    ink(ctx, () => ctx.arc(cx + sleeperW - 22, CAB_TOP + 24, 7, 0, Math.PI * 2), '#1F2937', 1);
    ctx.fillStyle = '#0F172A'; ctx.fillRect(cx + sleeperW - 29, CAB_TOP + 17, 14, 4); ctx.fillRect(cx + sleeperW - 17, CAB_TOP + 20, 5, 2);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.moveTo(cx + sleeperW - 14, CAB_TOP + 12); ctx.lineTo(cx + sleeperW - 9, CAB_TOP + 12); ctx.lineTo(cx + sleeperW - 22, CAB_TOP + 36); ctx.lineTo(cx + sleeperW - 27, CAB_TOP + 36); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.strokeRect(cx + sleeperW - 44.5, CAB_TOP + 9.5, 39, 29);
  ctx.fillStyle = '#7F1D1D'; ctx.fillRect(cx + sleeperW - 44, CAB_TOP + 39, 38, 2);
  // The windshield on the front face (cracked and bloody once Riggs has had it)
  ctx.fillStyle = '#60A5FA'; ctx.fillRect(cx + sleeperW - 5, CAB_TOP + 6, 5, HOOD_TOP - CAB_TOP - 10);
  ctx.fillStyle = '#BFDBFE'; ctx.fillRect(cx + sleeperW - 5, CAB_TOP + 6, 2, HOOD_TOP - CAB_TOP - 10);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(cx + sleeperW - 5.5, CAB_TOP + 5.5, 6, HOOD_TOP - CAB_TOP - 9);
  if (last && (last.cab.phase === 'shot' || last.cab.phase === 'crash')) {
    ctx.strokeStyle = '#F8FAFC'; ctx.lineWidth = 1; const wy = CAB_TOP + 26;
    for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(cx + sleeperW - 2, wy); ctx.lineTo(cx + sleeperW - 2 + Math.cos(k) * 4, wy + Math.sin(k * 1.7) * 18); ctx.stroke(); }
    ctx.fillStyle = 'rgba(127, 29, 29, 0.85)'; ctx.fillRect(cx + sleeperW - 44, CAB_TOP + 14, 38, 20);
    ctx.fillStyle = 'rgba(69, 10, 10, 0.9)'; for (let k = 0; k < 5; k++) ctx.fillRect(cx + sleeperW - 40 + k * 7, CAB_TOP + 33, 2, 4 + (k % 3) * 3);
  }
  void ws;
  // The hood (a lit crown along it, the louvers down its side), the grille, the bumper, a headlight
  const hoodBox = () => ctx.rect(hoodX, HOOD_TOP, hoodW, Y - 40 - HOOD_TOP);
  redPaint(ctx, hoodBox, hoodX, HOOD_TOP, hoodW, Y - 40, 3);
  for (let k = 0; k < 4; k++) { ctx.fillStyle = '#7F1D1D'; ctx.fillRect(hoodX + 14 + k * 9, HOOD_TOP + 14, 5, 18); ctx.fillStyle = '#F87171'; ctx.fillRect(hoodX + 14 + k * 9, HOOD_TOP + 14, 5, 1); }
  slab(ctx, hoodX + hoodW - 8, HOOD_TOP + 8, 10, 34, '#E5E7EB', 1);
  for (let gy = HOOD_TOP + 12; gy < HOOD_TOP + 40; gy += 4) { ctx.fillStyle = '#6B7280'; ctx.fillRect(hoodX + hoodW - 7, gy, 8, 1); }
  slab(ctx, hoodX + hoodW - 12, Y - 46, 18, 8, '#D1D5DB', 1);
  headBeam(ctx, hoodX + hoodW + 3, HOOD_TOP + 4, HOOD_TOP + 10, 60, 16, 1, 0.35);
  ink(ctx, () => ctx.rect(hoodX + hoodW - 2, HOOD_TOP + 4, 5, 6), '#FEF08A', 1); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(hoodX + hoodW - 1, HOOD_TOP + 5, 2, 2);
  slab(ctx, hoodX + 10, HOOD_TOP - 6, 10, 6, '#D1D5DB', 1); // hood ornament
};

/** Riggs: a trucker cap, aviators, a big mustache, flannel; on the radio, thumb over the red button (then slumped on the horn). */
export const RIGGS: PersonSpec = {
  skin: '#E0AC69', hair: { style: 'short', color: '#5B3413' }, hat: { style: 'cap', color: '#1E3A8A' }, eyes: 'shades', face: 'mustache', faceHair: '#5B3413', build: 'fat',
  top: { style: 'flannel', color: '#B91C1C' }, legs: { color: '#1E3A8A' },
};

const drawRiggs = (ctx: Ctx, x: number, y: number, f: number, cv: Convoy) => {
  const dead = cv.cab.phase === 'shot' || cv.cab.phase === 'crash';
  // Shot: his head snaps back, then he goes forward, face down on the wheel (and the horn), and stays there
  const k = cv.cab.phase === 'crash' ? 1 : dead ? Math.min(1, cv.cab.t / 24) : 0;
  const snap = dead && cv.cab.t < 5 && cv.cab.phase === 'shot' ? -0.35 : 0;
  const ease = 1 - Math.pow(1 - Math.max(0, (k - 0.2) / 0.8), 3);
  // (all of it inside the side window)
  ctx.save(); ctx.beginPath(); ctx.rect(x - 20, y - 16, 38, 28); ctx.clip();
  // The wheel, in front of him
  ink(ctx, () => ctx.ellipse(x + 13, y + 8, 3, 10, 0.3, 0, Math.PI * 2), '#27272A', 1);
  // (bent over at the hips, down below the sill; his head at (0, -4))
  ctx.save(); ctx.translate(x + ease * 2, y + 22.4);
  ctx.rotate(snap * 0.5 + ease * 0.5); ctx.translate(0, -22.4);
  drawPerson(ctx, -0.8, 44.2, RIGGS, { mouth: dead ? 'open' : cv.cab.phase === 'bicker' ? 'talk' : cv.cab.phase === 'standoff' ? 'grin' : 'flat', f }, 0.78);
  // (aviators: gold rims round the shades)
  ctx.strokeStyle = '#CA8A04'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.roundRect(-1.2, -6.7, 7.8, 2.8, 1); ctx.stroke();
  if (!dead) {
    // The radio up at his mouth, the button in his other hand
    ctx.save(); ctx.translate(-0.8, 44.2); ctx.scale(0.78, 0.78);
    limb(ctx, 7, -48, 12, -56, 5.5, '#B91C1C');
    ink(ctx, () => ctx.roundRect(10, -66, 6, 11, 1.5), '#1F2937', 0.8);
    ctx.fillStyle = '#4B5563'; ctx.fillRect(11, -64, 4, 1); ctx.fillRect(11, -62, 4, 1);
    ink(ctx, () => ctx.arc(12.5, -55, 3.2, 0, Math.PI * 2), '#E0AC69', 0.8);
    if (cv.cab.phase === 'standoff' || cv.cab.phase === 'bicker') {
      ink(ctx, () => ctx.roundRect(-14, -44, 9, 8, 1.5), '#374151', 0.8);
      ink(ctx, () => ctx.arc(-9.5, -42, 3, 0, Math.PI * 2), f % 20 < 10 ? '#FCA5A5' : '#DC2626', 0.7);
      ink(ctx, () => ctx.arc(-11, -38, 3, 0, Math.PI * 2), '#E0AC69', 0.8);
    }
    ctx.restore();
  } else {
    // Where it went in, and running
    ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.arc(-3, -6, 2.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#B91C1C'; ctx.fillRect(-3.6, -6, 1.4, 6 + k * 4);
  }
  ctx.restore();
  ctx.restore();
};

const drawWheel = (ctx: Ctx, x: number, y: number, spin: number) => drawTruckWheel(ctx, x, y, WHEEL_R, spin);

/** What's left of a truck: a burning shell on its rims, dropping away behind. */
const drawWreck = (ctx: Ctx, x: number, f: number, t: number) => {
  if (t > 400) return;
  // (the shell: blackened sheet, its ribs bare, scorched through in a dither, the frame sagging under it)
  const sx = x + 20, sy = TRAILER_TOP + 50, sw = TRAILER_W - 60, sh = Y - 40 - TRAILER_TOP - 50;
  slab(ctx, sx, sy, sw, sh, '#292524', 2);
  ctx.fillStyle = '#1C1917'; for (let rx = sx + 12; rx < sx + sw - 6; rx += 20) ctx.fillRect(rx, sy + 3, 3, sh - 6);
  ctx.fillStyle = '#57534E'; for (let rx = sx + 12; rx < sx + sw - 6; rx += 20) ctx.fillRect(rx, sy + 3, 1, sh - 6);
  checker(ctx, sx + 2, sy + 2, sw - 4, 12, 'rgba(124, 45, 18, 0.55)');
  ctx.fillStyle = 'rgba(124, 45, 18, 0.5)'; for (let k = 0; k < 6; k++) ctx.fillRect(sx + 30 + k * 90, sy + 14, 26, 10 + (k % 3) * 8);
  slab(ctx, x + TRAILER_W - 10, CAB_TOP + 40, TRUCK_W - TRAILER_W - 10, Y - 40 - CAB_TOP - 40, '#1C1917', 2);
  ctx.fillStyle = '#0C0A09'; ctx.fillRect(x + TRAILER_W + 60, CAB_TOP + 50, 30, 22);
  pipe(ctx, x, Y - 44, TRUCK_W - 10, 8, '#292524');
  // (going all down it, in stretches: the load, the middle, the cab end)
  for (const [dx, w, h] of [[130, 250, 80], [360, 230, 62], [570, 210, 76]]) drawFire(ctx, x + dx, TRAILER_TOP + 62, w, h, f, { seed: dx });
  for (let k = 0; k < 5; k++) pixelBlob(ctx, x + 80 + k * 110 + (f % 40), TRAILER_TOP - 20 - (f * 2 + k * 30) % 120, 20 + k * 4, 17 + k * 3, 'rgba(28,25,23,0.5)');
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
  drawFall(ctx, state, cv, rt.talk);
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
    // (in hard bands, white-hot going off, cooling to red as it lifts)
    ctx.globalAlpha = fade;
    drawFireball(ctx, bx, by, r * 0.85, t, { seed: k * 13, heat: tt < 12 ? 1 : tt > 40 ? -1 : 0 });
    ctx.globalAlpha = 1;
  }
  // The smoke, rolling up out of it
  for (let k = 0; k < 10; k++) {
    const tt = t - 10 - k * 3;
    if (tt < 0) continue;
    const sx = x + 80 + (k * 71) % (TRUCK_W - 120) + Math.sin(tt * 0.05 + k) * 12, sy = cy - 40 - tt * (1.6 + (k % 3) * 0.4);
    const r = 24 + tt * 0.7, a = Math.max(0, 0.75 - tt / 160);
    pixelBlob(ctx, sx, sy, r, r * 0.9, `rgba(28, 25, 23, ${a.toFixed(3)})`);
    pixelBlob(ctx, sx - r * 0.3, sy - r * 0.3, r * 0.5, r * 0.45, `rgba(68, 64, 60, ${(a * 0.6).toFixed(3)})`);
  }
  // What's flying: roof panels (the livery on them), wheels, crates of product
  for (let k = 0; k < 16; k++) {
    const vx = (hash(k + 3) - 0.35) * 16, vy = -(8 + hash(k + 9) * 16);
    const px = x + 60 + hash(k) * (TRUCK_W - 80) + vx * t, py = cy - 30 + vy * t + 0.45 * t * t;
    if (py > Y + 200) continue;
    ctx.save(); ctx.translate(px, py); ctx.rotate(t * (0.15 + hash(k + 5) * 0.3) * (k % 2 ? 1 : -1));
    if (k % 4 === 0) drawTruckWheel(ctx, 0, 0, 14, 0);
    else if (k % 4 === 1) { slab(ctx, -22, -6, 44, 12, '#E5E7EB', 1); ctx.fillStyle = '#6D28D9'; ctx.fillRect(-21, -2, 42, 5); ctx.fillStyle = '#FDE047'; ctx.fillRect(-21, -2, 42, 1); }
    else if (k % 4 === 2) drawCrate(ctx, -9, -9, 18);
    else ink(ctx, () => { ctx.moveTo(-12, -6); ctx.lineTo(14, -2); ctx.lineTo(-4, 8); ctx.closePath(); }, '#DC2626', 1);
    // (burning as it goes)
    if (t < 60) drawFireball(ctx, -4, -4, 5, t, { seed: k, heat: -1 });
    ctx.restore();
  }
  ctx.restore();
};

/** A black SUV, a goon up through the sunroof (till he goes). */
const drawSuv = (ctx: Ctx, x: number, f: number, loaded: boolean) => {
  const y = Y + 12, w = 150, h = 70;
  const l = x - w / 2;
  // The body: black paint, lit along the roof and the shoulder line, the rocker in shadow, inked round
  const shell = () => ctx.roundRect(l, y - h, w, h - 16, 10);
  ctx.save(); ctx.beginPath(); shell(); ctx.clip();
  ctx.fillStyle = '#18181B'; ctx.fillRect(l, y - h, w, h - 16);
  ctx.fillStyle = '#3F3F46'; ctx.fillRect(l, y - h, w, 4); ctx.fillStyle = '#52525B'; ctx.fillRect(l + 10, y - h + 1, w - 20, 1);
  ctx.fillStyle = '#3F3F46'; ctx.fillRect(l, y - h + 34, w, 2);
  ctx.fillStyle = '#0A0A0A'; ctx.fillRect(l, y - 30, w, 14);
  ctx.restore();
  ctx.beginPath(); shell(); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke();
  // (the glass: tinted, a glint across it; the pillar)
  ctx.fillStyle = '#1F2937'; ctx.fillRect(l + 16, y - h + 8, w - 50, 22);
  ctx.fillStyle = '#334155'; ctx.fillRect(l + 16, y - h + 8, w - 50, 5);
  ctx.fillStyle = 'rgba(191, 219, 254, 0.3)'; ctx.beginPath(); ctx.moveTo(l + 80, y - h + 30); ctx.lineTo(l + 90, y - h + 8); ctx.lineTo(l + 96, y - h + 8); ctx.lineTo(l + 86, y - h + 30); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(l + 15.5, y - h + 7.5, w - 49, 23);
  column(ctx, l + 63, y - h + 8, 4, 22, '#27272A');
  // (door seams, chrome handles, the running board, the grille and the lamps)
  ctx.fillStyle = '#000000'; ctx.fillRect(l + 64, y - h + 32, 1, 22); ctx.fillRect(l + 108, y - h + 32, 1, 22);
  ctx.fillStyle = '#A1A1AA'; ctx.fillRect(l + 52, y - h + 38, 6, 2); ctx.fillRect(l + 96, y - h + 38, 6, 2);
  pipe(ctx, l + 18, y - 22, w - 36, 4, '#3F3F46');
  slab(ctx, l + w - 6, y - 46, 6, 20, '#71717A', 1);
  ink(ctx, () => ctx.rect(l + w - 6, y - 40, 6, 6), '#FEF08A', 1); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(l + w - 5, y - 39, 2, 2);
  ink(ctx, () => ctx.rect(l, y - 44, 4, 8), '#B91C1C', 1);
  for (const wx of [x - 44, x + 44]) drawTruckWheel(ctx, wx, y - 14, 15, wheelTurn(0, ROAD_SPEED, 15, f));
  if (loaded) {
    // The goon up through the sunroof: a black balaclava, the red bandana, his shoulders in a black jacket
    ink(ctx, () => ctx.roundRect(x - 8, y - h - 9, 24, 12, [4, 4, 0, 0]), '#1F2937', 1);
    ctx.fillStyle = '#374151'; ctx.fillRect(x - 6, y - h - 7, 6, 2);
    ink(ctx, () => ctx.arc(x + 4, y - h - 14, 7.5, 0, Math.PI * 2), '#18181B', 1);
    ctx.fillStyle = '#3F3F46'; ctx.fillRect(x, y - h - 20, 4, 2);
    ctx.fillStyle = '#E0AC69'; ctx.fillRect(x + 4, y - h - 17, 6, 3); ctx.fillStyle = INK; ctx.fillRect(x + 6, y - h - 16, 1, 1); ctx.fillRect(x + 9, y - h - 16, 1, 1);
    ink(ctx, () => ctx.rect(x - 3, y - h - 13, 14, 5), '#B91C1C', 0.8); ctx.fillStyle = '#F87171'; ctx.fillRect(x - 2, y - h - 12, 10, 1);
    slab(ctx, x - 9, y - h - 4, 30, 6, '#27272A', 1);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 3; i++) ctx.fillRect(x - w / 2 - 40 - i * 12, y - 51 + i * 12, 30, 2);
};

const drawDebris = (ctx: Ctx, d: Debris) => {
  ctx.save(); ctx.translate(d.x + d.w / 2, d.y + d.h / 2); ctx.rotate(d.rot);
  switch (d.look) {
    case 'tire': {
      // A blown-off truck tire: the rubber inked, chunky tread round it, the sidewall lit, the empty middle
      const r = d.w / 2;
      ink(ctx, () => ctx.arc(0, 0, r, 0, Math.PI * 2), '#18181B', 1.5);
      ctx.fillStyle = '#3F3F46'; for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2; ctx.fillRect(Math.cos(a) * (r - 3) - 2, Math.sin(a) * (r - 3) - 2, 4, 4); }
      ctx.strokeStyle = '#52525B'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, r * 0.72, Math.PI * 1.05, Math.PI * 1.6); ctx.stroke();
      ink(ctx, () => ctx.arc(0, 0, r / 2, 0, Math.PI * 2), '#292524', 1);
      ctx.fillStyle = '#0C0A09'; ctx.beginPath(); ctx.arc(1, 1, r / 2 - 2, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'tumbleweed':
      // A ball of dead brush: a dark tangle under, a sunlit tangle over, a few twigs sticking out
      for (const [c, w, o] of [['#5A3A12', 3, 1], ['#A16207', 2, 0], ['#D6A75A', 1, -1]] as const) {
        ctx.strokeStyle = c; ctx.lineWidth = w;
        for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2; ctx.beginPath(); ctx.arc(Math.cos(a) * 6 + o, Math.sin(a) * 6 + o, d.w / 2 - 6, a, a + (c === '#D6A75A' ? 1.2 : 2.4)); ctx.stroke(); }
      }
      ctx.strokeStyle = '#5A3A12'; ctx.lineWidth = 1.5; ctx.beginPath();
      for (let k = 0; k < 6; k++) { const a = k * 1.1; ctx.moveTo(Math.cos(a) * d.w * 0.4, Math.sin(a) * d.w * 0.4); ctx.lineTo(Math.cos(a) * d.w * 0.58, Math.sin(a) * d.w * 0.58); }
      ctx.stroke();
      break;
    case 'sign': {
      // A cattle crossing sign, torn off its post: yellow enamel, a black border, lit up its top edges, the stub of the post
      const diamond = (r: number) => () => { ctx.moveTo(0, -r); ctx.lineTo(r, 0); ctx.lineTo(0, r); ctx.lineTo(-r, 0); ctx.closePath(); };
      slab(ctx, -3, d.h - 4, 6, 14, '#6B7280', 1);
      ink(ctx, diamond(d.h), '#111827', 1);
      ctx.save(); ctx.beginPath(); diamond(d.h - 3)(); ctx.clip();
      ctx.fillStyle = '#FACC15'; ctx.fillRect(-d.h, -d.h, d.h * 2, d.h * 2);
      ctx.fillStyle = '#FDE68A'; ctx.fillRect(-d.h, -d.h, d.h * 2, d.h * 0.45);
      ctx.fillStyle = '#CA8A04'; ctx.fillRect(-d.h, d.h * 0.55, d.h * 2, d.h);
      ctx.restore();
      ctx.fillStyle = '#111827'; ctx.font = 'bold 5px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('CATTLE', 0, -1); ctx.fillText('XING', 0, 6); ctx.textAlign = 'left';
      ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-1, -d.h + 4, 2, 2); ctx.fillRect(-1, d.h - 6, 2, 2);
      break;
    }
    case 'box':
      // A cardboard box: flaps lit along the top, the tape, the stamped warning
      slab(ctx, -d.w / 2, -d.h / 2, d.w, d.h, '#C2A26B', 2);
      ctx.fillStyle = '#A8885A'; ctx.fillRect(-d.w / 2 + 2, -d.h / 2 + d.h * 0.3, d.w - 4, 1);
      ctx.fillStyle = '#92400E'; ctx.fillRect(-d.w / 2, -2, d.w, 4); ctx.fillStyle = '#B45309'; ctx.fillRect(-d.w / 2, -2, d.w, 1);
      ctx.fillStyle = '#1E3A8A'; ctx.font = 'bold 4px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('THIS SIDE', 0, -6); ctx.fillText('UP', 0, 10); ctx.textAlign = 'left';
      break;
  }
  ctx.restore();
};

/** The family: dad (polo, mustache, glasses), mom (her hair long), the kid (blond, a tee). */
const FAMILY_DAD: PersonSpec = { skin: '#F2C9A0', hair: { style: 'short', color: '#44403C' }, eyes: 'glasses', face: 'mustache', top: { style: 'tee', color: '#1D4ED8', accent: '#1D4ED8' }, legs: { color: '#D6C7A1' } };
const FAMILY_MOM: PersonSpec = { skin: '#F2C9A0', hair: { style: 'long', color: '#7C2D12' }, top: { style: 'tee', color: '#0D9488', accent: '#5EEAD4' }, legs: { color: '#1E3A8A' } };
const FAMILY_KID: PersonSpec = { kid: true, skin: '#F2C9A0', hair: { style: 'short', color: '#FACC15' }, top: { style: 'tee', color: '#22C55E', accent: '#F8FAFC' }, legs: { color: '#1E3A8A' } };

/** Off the side of a truck, blown up, melted through, or blown up by Riggs. */
/**
 * The family's SUV, going right: huge, boxy, fake wood down the side, a roof rack piled with luggage and a bike, a
 * BABY ON BOARD sign and the stick family on the back window. Dad at the wheel, mom beside him, the kid in the back.
 * After: a dent in the grille, a smear up the hood and a shoe stuck in it.
 */
const drawFamilySuv = (ctx: Ctx, x: number, f: number, hit: boolean) => {
  const y = Y + 14, w = 200, h = 104;
  const l = x - w / 2;
  const bob = Math.sin(f * 0.6) * 1;
  ctx.save(); ctx.translate(0, bob);
  // Roof rack, luggage, a kid's bike on top
  // (the bike: a tire each end and the frame, inked)
  for (const bx of [l + 138, l + 158]) { ctx.strokeStyle = INK; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(bx, y - h - 14, 7, 0, Math.PI * 2); ctx.stroke(); ctx.strokeStyle = '#27272A'; ctx.lineWidth = 2; ctx.stroke(); }
  ctx.strokeStyle = INK; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(l + 138, y - h - 14); ctx.lineTo(l + 148, y - h - 24); ctx.lineTo(l + 158, y - h - 14); ctx.stroke();
  ctx.strokeStyle = '#DC2626'; ctx.lineWidth = 2; ctx.stroke();
  pipe(ctx, l + 30, y - h - 6, 130, 4, '#4B5563');
  slab(ctx, l + 36, y - h - 26, 50, 20, '#1E40AF', 2); slab(ctx, l + 90, y - h - 22, 40, 16, '#92400E', 2); slab(ctx, l + 50, y - h - 34, 26, 8, '#F59E0B', 1);
  ctx.fillStyle = '#1C1917'; ctx.fillRect(l + 58, y - h - 18, 1, 12); ctx.fillRect(l + 72, y - h - 18, 1, 12); ctx.fillRect(l + 108, y - h - 16, 1, 10); // (the straps)
  // The body: a big faded maroon brick (lit along its roof, chalky with sun, the rocker in shadow)
  const shell = () => ctx.roundRect(l, y - h, w, h - 18, 8);
  shadedTop(ctx, shell, '#7F1D1D', l, y - h, w, h - 18, 1.5);
  ctx.fillStyle = '#A33A3A'; ctx.fillRect(l + 4, y - h + 3, w - 8, 3);
  checker(ctx, l + 6, y - h + 6, w - 12, 4, 'rgba(255, 228, 230, 0.12)');
  // Fake wood panel down the side (grain in two browns, a chrome strip either edge)
  ctx.fillStyle = '#92400E'; ctx.fillRect(l + 8, y - 56, w - 30, 22);
  for (let k = 0; k < 6; k++) { ctx.fillStyle = k % 2 ? '#78350F' : '#A0522D'; ctx.fillRect(l + 8, y - 53 + k * 3.5, w - 30, 1); }
  ctx.fillStyle = '#5A2A0A'; for (let k = 0; k < 5; k++) ctx.fillRect(l + 20 + k * 34, y - 50 + (k % 3) * 4, 6, 2);
  ctx.fillStyle = '#D1D5DB'; ctx.fillRect(l + 8, y - 57, w - 30, 1); ctx.fillRect(l + 8, y - 34, w - 30, 1);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(l + 7.5, y - 57.5, w - 29, 24);
  // Windows: the back one (the stick family on it), the middle (the kid), the front (mom and dad)
  for (const [wx, ww] of [[l + 8, 44], [l + 58, 56], [l + 120, 52]]) { ctx.fillStyle = '#93C5FD'; ctx.fillRect(wx, y - h + 12, ww, 30); ctx.fillStyle = '#BFDBFE'; ctx.fillRect(wx, y - h + 12, ww, 6); }
  ctx.fillStyle = '#F8FAFC'; ctx.strokeStyle = '#F8FAFC'; ctx.lineWidth = 1.5;
  for (let k = 0; k < 5; k++) { const sx = l + 13 + k * 8, sh = k < 2 ? 14 : 9; ctx.beginPath(); ctx.arc(sx, y - h + 40 - sh - 3, 2, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(sx, y - h + 40 - sh - 1); ctx.lineTo(sx, y - h + 36); ctx.stroke(); }
  // Heads: the kid, mom, dad, each through their window (dad's got his eyes on the road. Very much on the road). The
  // kid waving out the back; after, the lot of them screaming
  const win = (wx: number, ww: number, draw: () => void) => {
    ctx.save(); ctx.beginPath(); ctx.rect(wx, y - h + 12, ww, 30); ctx.clip();
    draw();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)'; ctx.beginPath(); ctx.moveTo(wx + ww * 0.55, y - h + 12); ctx.lineTo(wx + ww * 0.7, y - h + 12); ctx.lineTo(wx + ww * 0.45, y - h + 42); ctx.lineTo(wx + ww * 0.3, y - h + 42); ctx.fill();
    ctx.restore();
  };
  const seat = (hx: number, hy: number) => ink(ctx, () => ctx.roundRect(hx - 15, hy - 7, 8, 30, 3), '#57534E', 0.8);
  win(l + 58, 56, () => { seat(l + 86, y - h + 34); drawPerson(ctx, l + 85, y - h + 66.5, FAMILY_KID, { arms: hit ? 'panic' : 'wave', mouth: hit ? 'open' : 'grin', f }, 0.82); });
  win(l + 120, 52, () => {
    seat(l + 134, y - h + 30); drawPerson(ctx, l + 133, y - h + 85, FAMILY_MOM, { mouth: hit ? 'open' : 'smile', f: f + 30 }, 0.89);
    seat(l + 158, y - h + 28); drawPerson(ctx, l + 157, y - h + 83, FAMILY_DAD, { mouth: hit ? 'o' : 'flat', f: f + 60 }, 0.89);
  });
  for (const [wx, ww] of [[l + 8, 44], [l + 58, 56], [l + 120, 52]]) { ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(wx - 0.5, y - h + 11.5, ww + 1, 31); }
  // BABY ON BOARD
  ctx.save(); ctx.translate(l + 30, y - h + 27); ctx.rotate(Math.PI / 4); slab(ctx, -7, -7, 14, 14, '#FACC15', 1); ctx.restore();
  // The grille and the headlight, the bumper; the dent, the smear, the shoe
  slab(ctx, l + w - 10, y - 60, 12, 30, '#D1D5DB', 1);
  ctx.fillStyle = '#6B7280'; for (let gy = y - 56; gy < y - 32; gy += 4) ctx.fillRect(l + w - 9, gy, 10, 1);
  ink(ctx, () => ctx.rect(l + w - 6, y - 74, 6, 10), '#FEF08A', 1); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(l + w - 5, y - 73, 2, 3);
  pipe(ctx, l - 4, y - 30, w + 10, 8, '#9CA3AF');
  if (hit) {
    ink(ctx, () => { ctx.moveTo(l + w + 2, y - 62); ctx.lineTo(l + w - 8, y - 48); ctx.lineTo(l + w + 2, y - 36); ctx.closePath(); }, '#6B7280', 1);
    ctx.fillStyle = 'rgba(153, 27, 27, 0.9)'; ctx.fillRect(l + w - 40, y - h + 44, 36, 5); ctx.fillRect(l + w - 30, y - h + 49, 3, 10);
    ctx.fillStyle = 'rgba(220, 38, 38, 0.9)'; ctx.fillRect(l + w - 38, y - h + 44, 20, 1);
    slab(ctx, l + w - 2, y - 52, 12, 6, '#1C1917', 1); slab(ctx, l + w + 6, y - 58, 4, 8, '#1C1917', 1);
  }
  // Wheels
  for (const wx of [l + 44, l + w - 44]) drawTruckWheel(ctx, wx, y - 16, 18, wheelTurn(0, ROAD_SPEED, 18, f));
  ctx.restore();
};

const drawFall = (ctx: Ctx, state: GameState, cv: Convoy, talk: Talk) => {
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
    } else if (fall.kind === 'flop' && stopped && (r.fly || still >= FAMILY.RISE)) {
      // Off the back: up on his feet in the road, swaying and twitching; then sent flying by the family
      const lyingAngle = Math.PI / 2 * (r.rot >= 0 ? 1 : -1);
      const fly = r.fly;
      if (fly) {
        const down = fly.h <= 0 && fly.vh === 0;
        ctx.translate(fall.x + fly.off, Y - fly.h - (down ? 12 : 30));
        ctx.rotate(down ? Math.PI / 2 : fly.rot);
      } else {
        const up = Math.min(1, (still - FAMILY.RISE) / 26);
        const jerk = (still % 23 < 3 || still % 37 < 2) ? (Math.random() - 0.5) * 6 : 0;
        ctx.translate(fall.x + jerk, Y - 12 - up * 20);
        ctx.rotate(lyingAngle * (1 - up) + up * (Math.sin(still * 0.09) * 0.14 + jerk * 0.03));
      }
      ctx.translate(-(body.pos.x + body.width / 2), -(body.pos.y + body.height / 2));
      drawPlayer(ctx, { ...body, isGrounded: !fly }, { ...state, deathTimer: 0 }, { currentWeapon: p.currentWeapon, showFilthShield: false, invincibilityEnabled: false });
      ctx.restore();
    } else {
      // Cartwheeling down the road, and then face down on it
      const lying = stopped ? Math.PI / 2 * (r.rot >= 0 ? 1 : -1) : r.rot;
      ctx.translate(fall.x + (stopped ? Math.sin(still * 3) * (twitch ? 1.5 : 0) : 0), Y - r.h - (stopped ? 12 : 30));
      ctx.rotate(lying + twitch);
      ctx.translate(-(body.pos.x + body.width / 2), -(body.pos.y + body.height / 2));
      drawPlayer(ctx, body, { ...state, deathTimer: 0 }, { currentWeapon: p.currentWeapon, showFilthShield: false, invincibilityEnabled: false });
      ctx.restore();
    }
    if (r.suv) {
      const sx = fall.x + r.suv.off;
      drawFamilySuv(ctx, sx, f, r.suv.hitAt >= 0);
      drawBubble(ctx, sx - 14, Y - 112, saying(talk, 'kid'), '#FEF9C3');
      drawBubble(ctx, sx + 58, Y - 116, saying(talk, 'dad'), '#E0F2FE');
      drawBubble(ctx, sx + 34, Y - 116, saying(talk, 'mom'), '#FCE7F3');
    }
  } else if (fall.kind === 'melt') {
    // A hole in the roof, and a cutaway of the trailer: the goons riding in the back, all firing
    const tx = truckX(cv, fall.truck);
    ctx.save(); sized(ctx, tx, fall.truck);
    const s = truckDims(fall.truck).s;
    fall = { ...fall, x: tx + (fall.x - tx) / s };
    // The hole it's eaten in the roof, still sizzling (he's gone down it)
    const grow = Math.min(1, fall.t / 16);
    ctx.fillStyle = '#3F6212'; ctx.beginPath(); ctx.ellipse(fall.x, TRAILER_TOP + 2, 19 + 20 * grow, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0A0A0A'; ctx.beginPath(); ctx.ellipse(fall.x, TRAILER_TOP + 2, 16 + 20 * grow, 6, 0, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 6; i++) { ink(ctx, () => ctx.rect(fall.x - 34 + i * 13, TRAILER_TOP - 2 + (i % 2) * 3, 5, 4), '#65A30D', 0.8); ctx.fillStyle = '#BEF264'; ctx.fillRect(fall.x - 33 + i * 13, TRAILER_TOP - 1 + (i % 2) * 3, 2, 1); }
    for (let i = 0; i < 4; i++) { const k = ((f + i * 9) % 30) / 30; pixelBlob(ctx, fall.x - 24 + i * 16, TRAILER_TOP - 4 - k * 26, 3 + k * 5, 3 + k * 5, `rgba(190, 242, 100, ${(0.7 * (1 - k)).toFixed(3)})`); }
    void p;
    ctx.restore();
  }
};

// ---------------------------------------------------------------------------
// Screen space
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Through the roof: the inside of the trailer (a place of its own, closer up than the outside)
// ---------------------------------------------------------------------------

/** How much closer up it is than the outside, and its size in its own units. */
const IN_SCALE = 1.45, IN_W = CANVAS_WIDTH / IN_SCALE;
/** The floor, the underside of the roof, where the hole is (and where he lands), the crates at the front end. */
const IN_FLOOR = 372, IN_ROOF = 34, IN_HOLE = 150, IN_CRATES = { x1: 372, x2: 552, h: 30 };
const IN_GOONS = [398, 442, 486, 528];
let insideGoons: ReturnType<typeof makeKindEnemy>[] | null = null;

const drawMeltScene = (ctx: Ctx, state: GameState, cv: Convoy) => {
  const fall = cv.fall;
  if (!fall || fall.kind !== 'melt') return;
  const u = fall.t;
  // Going black on the outside first
  if (u < MELT.FADE) { ctx.fillStyle = `rgba(0, 0, 0, ${u / MELT.FADE})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); return; }
  // (frozen on the moment he died: everything holds still under the death screen)
  const f = fall.still ?? state.frame;
  const p = state.player;
  const firing = u >= MELT.FIRE && u < MELT.STOP;
  ctx.save();
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  if (firing) ctx.translate((hash(u) - 0.5) * 8, (hash(u + 1) - 0.5) * 8);
  ctx.scale(IN_SCALE, IN_SCALE);
  // The walls: ribbed aluminum, in the dark
  bandedGradient(ctx, 0, IN_ROOF, IN_W, IN_FLOOR - IN_ROOF, ['#27272A', '#222225', '#1D1D20', '#18181B'], 6);
  // (the ribs: a lit edge, the rib, its shadow; rivets down them)
  for (let x = 8; x < IN_W; x += 22) {
    ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(x, IN_ROOF, 1, IN_FLOOR - IN_ROOF);
    ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.fillRect(x + 1, IN_ROOF, 3, IN_FLOOR - IN_ROOF);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x + 4, IN_ROOF, 1, IN_FLOOR - IN_ROOF);
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; for (let y = IN_ROOF + 12; y < IN_FLOOR; y += 28) ctx.fillRect(x + 2, y, 1, 1);
  }
  pipe(ctx, 0, 150, IN_W, 5, '#3F3F46'); pipe(ctx, 0, 260, IN_W, 5, '#3F3F46'); // tie-down rails
  ctx.fillStyle = '#18181B'; for (let x = 12; x < IN_W; x += 18) { ctx.fillRect(x, 151, 3, 2); ctx.fillRect(x, 261, 3, 2); }
  // The back doors (left) and the front wall (right)
  slab(ctx, 0, IN_ROOF, 24, IN_FLOOR - IN_ROOF, '#3F3F46', 2); column(ctx, 14, 180, 4, 60, '#71717A');
  slab(ctx, IN_W - 14, IN_ROOF, 14, IN_FLOOR - IN_ROOF, '#27272A', 2);
  // Bullet holes in the wall behind him, more all the time once they start, the daylight through them
  if (u >= MELT.FIRE) {
    const n = Math.min(60, Math.floor((u - MELT.FIRE) * 0.8));
    for (let k = 0; k < n; k++) { const bx = IN_HOLE - 70 + hash(k * 3) * 150, by = 200 + hash(k * 3 + 1) * 150; ctx.fillStyle = '#FEF3C7'; ctx.fillRect(bx, by, 2.5, 2.5); ctx.fillStyle = 'rgba(254, 243, 199, 0.12)'; ctx.fillRect(bx - 2, by - 2, 6.5, 6.5); }
  }
  // The load: pallets of bricks, shrink-wrapped
  for (let k = 0; k < 3; k++) {
    const bx = 40 + k * 64; if (Math.abs(bx + 24 - IN_HOLE) < 50) continue;
    slab(ctx, bx, IN_FLOOR - 8, 52, 8, '#78350F', 1);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { slab(ctx, bx + 2 + c * 16, IN_FLOOR - 22 - r * 14, 15, 13, (r + c) % 2 ? '#F5F5F4' : '#E7E5E4', 1); ctx.fillStyle = '#A8A29E'; ctx.fillRect(bx + 5 + c * 16, IN_FLOOR - 17 - r * 14, 9, 1); }
    // (the shrink-wrap's sheen over the lot)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)'; ctx.fillRect(bx + 4, IN_FLOOR - 50, 3, 42);
  }
  // The roof, and the hole he came through: melted, dripping, the sky through it
  pipe(ctx, 0, 0, IN_W, IN_ROOF, '#52525B');
  for (let x = 0; x < IN_W; x += 22) slab(ctx, x, IN_ROOF - 6, 12, 6, '#3F3F46', 1);
  const hole = (r: number) => { ctx.beginPath(); for (let k = 0; k <= 16; k++) { const a = (k / 16) * Math.PI * 2; const j = 1 + (hash(k + 50) - 0.5) * 0.35; ctx.lineTo(IN_HOLE + Math.cos(a) * r * 1.6 * j, IN_ROOF / 2 + Math.sin(a) * r * 0.55 * j); } ctx.closePath(); };
  ctx.fillStyle = '#3F6212'; hole(32); ctx.fill();
  ctx.fillStyle = '#65A30D'; hole(30); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#A3E635'; hole(27); ctx.fill();
  // (the evening sky, in bands, through it)
  ctx.save(); hole(24); ctx.clip(); bandedGradient(ctx, IN_HOLE - 40, 0, 80, IN_ROOF, ['#C06C84', '#F08A5D', '#FDBA74'], 4); ctx.restore();
  hole(24); ctx.strokeStyle = '#3F6212'; ctx.stroke();
  // Sludge running off the edges of it
  for (let k = 0; k < 7; k++) {
    const dx = IN_HOLE - 42 + k * 14, len = 6 + hash(k + 70) * 18 + Math.sin(f * 0.1 + k) * 3;
    ink(ctx, () => { ctx.rect(dx, IN_ROOF - 2, 4, len); ctx.moveTo(dx + 5, IN_ROOF - 2 + len); ctx.arc(dx + 2, IN_ROOF - 2 + len, 3, 0, Math.PI * 2); }, '#84CC16', 0.8);
    ctx.fillStyle = '#D9F99D'; ctx.fillRect(dx + 1, IN_ROOF, 1, len - 2);
    const drop = ((f * 3 + k * 37) % 300); if (drop < IN_FLOOR - IN_ROOF - len) { ctx.fillStyle = 'rgba(163, 230, 53, 0.9)'; ctx.fillRect(dx + 1, IN_ROOF + len + drop, 2, 5); }
  }
  // A puddle of it under the hole, smoking
  ctx.fillStyle = 'rgba(63, 98, 18, 0.85)'; ctx.beginPath(); ctx.ellipse(IN_HOLE, IN_FLOOR - 1, 48, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(101, 163, 13, 0.85)'; ctx.beginPath(); ctx.ellipse(IN_HOLE, IN_FLOOR - 1, 42, 4, 0, 0, Math.PI * 2); ctx.fill();
  // The light down through it, in steps
  for (let k = 0; k < 5; k++) {
    const a = 0.4 - k * 0.075, span = IN_FLOOR - IN_ROOF, y0 = IN_ROOF + k * span / 5, y1 = y0 + span / 5, s0 = k / 5, s1 = (k + 1) / 5;
    ctx.fillStyle = `rgba(253, 186, 116, ${a.toFixed(3)})`;
    ctx.beginPath(); ctx.moveTo(IN_HOLE - 36 - 34 * s0, y0); ctx.lineTo(IN_HOLE + 36 + 34 * s0, y0); ctx.lineTo(IN_HOLE + 36 + 34 * s1, y1); ctx.lineTo(IN_HOLE - 36 - 34 * s1, y1); ctx.fill();
  }
  // The goons, down behind the crates till they come up
  if (!insideGoons) insideGoons = IN_GOONS.map(x => makeKindEnemy('sicario', x, IN_FLOOR));
  const up = u < MELT.POP ? 0 : Math.min(1, (u - MELT.POP) / 8);
  insideGoons.forEach((g, i) => {
    const rise = (1 - up) * 70 + (up < 1 ? 0 : Math.sin(f * 0.3 + i) * 0.5);
    g.shootTimer = firing ? 60 : u >= MELT.POP ? 45 : 0;
    ctx.save(); ctx.translate(IN_GOONS[i], IN_FLOOR + rise); ctx.scale(-1, 1);
    drawDaleKind(ctx, g, f, state);
    if (firing && (u + i * 2) % 4 < 2) {
      ctx.fillStyle = '#FEF08A'; ctx.beginPath(); ctx.moveTo(32, -48); ctx.lineTo(52, -44); ctx.lineTo(32, -40); ctx.fill();
      ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(34, -44, 5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  });
  // The floor (they're down behind the crates, below it from here, till they come up)
  ctx.fillStyle = '#1C1917'; ctx.fillRect(0, IN_FLOOR, IN_W, 200);
  ctx.fillStyle = '#292524'; for (let x = 0; x < IN_W; x += 26) ctx.fillRect(x, IN_FLOOR + 4, 24, 10); // (the floor's planks, end on)
  ctx.fillStyle = '#57534E'; ctx.fillRect(0, IN_FLOOR, IN_W, 3); ctx.fillStyle = '#78716C'; ctx.fillRect(0, IN_FLOOR, IN_W, 1);
  ctx.fillStyle = 'rgba(101, 163, 13, 0.8)'; ctx.beginPath(); ctx.ellipse(IN_HOLE, IN_FLOOR + 1, 46, 4, 0, 0, Math.PI * 2); ctx.fill();
  // The crates they were behind
  for (let x = IN_CRATES.x1; x < IN_CRATES.x2; x += 36) drawCrate(ctx, x, IN_FLOOR - IN_CRATES.h, 34, IN_CRATES.h);
  // The tracers
  if (firing) {
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.85)'; ctx.lineWidth = 1.5;
    IN_GOONS.forEach((gx, i) => { if ((u + i * 2) % 4 < 2) { ctx.beginPath(); ctx.moveTo(gx - 34, IN_FLOOR - 44); ctx.lineTo(IN_HOLE + 10 + hash(u + i) * 10, IN_FLOOR - 20 - hash(u * 7 + i) * 50); ctx.stroke(); } });
  }
  // Him: dropping in, looking round, full of holes, down
  const dropK = Math.max(0, Math.min(1, (u - MELT.DROP) / (MELT.LAND - MELT.DROP)));
  const landed = u >= MELT.LAND;
  const down = u >= MELT.STOP ? Math.min(1, (u - MELT.STOP) / 16) : 0;
  if (u >= MELT.DROP) {
    // (look this way, that way, back again; towards them once they're up)
    const lookT = u - MELT.LAND;
    const facing = u >= MELT.POP ? 1 : !landed || lookT < 40 ? 1 : lookT < 80 ? -1 : lookT < 120 ? 1 : -1;
    const body = { ...p, pos: { x: -1e6, y: -1e6 }, hidden: false, isGrounded: landed, vel: { x: 0, y: landed ? 0 : 8 }, facing: facing as 1 | -1, isCharging: false, isSliding: false, isUppercutting: false, isDivekicking: false, isDucking: landed && u < MELT.LAND + 6, invincibilityTimer: 0, hurtTimer: firing ? 30 : 0, pushbackTimer: firing ? 30 : 0,
      // (cut up worse and worse as they empty their rifles into him)
      health: u >= MELT.FIRE ? (p.maxHealth ?? 100) * Math.max(0.04, 1 - (u - MELT.FIRE) / (MELT.KILL - MELT.FIRE)) : p.health };
    const feet = landed ? IN_FLOOR : IN_ROOF - 40 + (IN_FLOOR - IN_ROOF + 40) * dropK * dropK;
    // (he goes down backwards once it stops)
    if (down > 0) { ctx.fillStyle = 'rgba(127, 29, 29, 0.9)'; ctx.beginPath(); ctx.ellipse(IN_HOLE - 20, IN_FLOOR - 1, 20 + (u - MELT.STOP) * 0.6, 4, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.save();
    const jerk = firing ? (hash(u * 3) - 0.5) * 6 : 0;
    ctx.translate(IN_HOLE + jerk - down * 18, feet - p.height / 2 + down * (p.height / 2 - 12));
    ctx.rotate(-down * Math.PI / 2 + (firing ? (hash(u * 5) - 0.5) * 0.25 : 0));
    ctx.translate(-(body.pos.x + body.width / 2), -(body.pos.y + body.height / 2));
    drawPlayer(ctx, body, { ...state, deathTimer: 0 }, { currentWeapon: p.currentWeapon, showFilthShield: false, invincibilityEnabled: false });
    // The holes in him, more with every burst, each bleeding down him
    if (u >= MELT.FIRE) {
      const shot = u - MELT.FIRE, n = Math.min(26, Math.floor(shot * 0.6));
      for (let k = 0; k < n; k++) {
        const hx = body.pos.x + body.width * (0.22 + hash(k * 7 + 3) * 0.56), hy = body.pos.y + body.height * (0.18 + hash(k * 7 + 4) * 0.62);
        const age = shot - k / 0.6, drip = Math.min(4 + hash(k * 7 + 5) * 12, age * 0.4);
        ctx.fillStyle = '#B91C1C'; ctx.fillRect(hx - 0.8, hy, 1.6, drip);
        ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.arc(hx, hy, 2.4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1C0A0A'; ctx.beginPath(); ctx.arc(hx, hy, 1.1, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
    // Blood out the back of him while they're at it
    if (firing) for (let k = 0; k < 6; k++) { const a = hash(u * 11 + k), b = hash(u * 13 + k); ctx.fillStyle = k % 2 ? '#DC2626' : '#7F1D1D'; ctx.fillRect(IN_HOLE - 10 - a * 50, IN_FLOOR - 70 + b * 50, 3 + a * 3, 3); }
    // Confused (a "?" over him), then not
    if (landed && u < MELT.POP) { ctx.fillStyle = '#FDE047'; ctx.font = 'bold 14px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('?', IN_HOLE + 6, IN_FLOOR - p.height - 14 + Math.sin(f * 0.15) * 3); ctx.textAlign = 'left'; }
    if (u >= MELT.POP && u < MELT.FIRE) { ctx.fillStyle = '#EF4444'; ctx.font = 'bold 14px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('!', IN_HOLE + 6, IN_FLOOR - p.height - 14); ctx.textAlign = 'left'; }
  }
  // What's said
  for (const l of MELT_SAYS) if (u >= l.at && u < l.until) {
    if (l.who === 'meathead') drawBubble(ctx, IN_HOLE, IN_FLOOR - p.height - 34, l.text, '#F8FAFC');
    else drawBubble(ctx, IN_GOONS[1], IN_FLOOR - 110, l.text, '#FECACA');
  }
  ctx.restore();
  // In from black
  const v = u - MELT.FADE;
  if (v < 18) { ctx.fillStyle = `rgba(0, 0, 0, ${1 - v / 18})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
};

export const drawConvoyHud = (ctx: Ctx, state: GameState, rt: DaleRuntime) => {
  const cv = rt.convoy;
  if (!cv.active) return;
  drawMeltScene(ctx, state, cv);
  // (nothing from outside over the inside of the trailer)
  if (cv.fall?.kind === 'melt' && cv.fall.t >= MELT.FADE) return;
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
  }
  // (off a truck and on the road: none of the rest of it, just him, and whoever comes along)
  if (cv.fall?.road) { ctx.restore(); return; }
  // The big word across the middle
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
