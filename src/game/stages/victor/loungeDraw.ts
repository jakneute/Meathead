// The VIP lounge, drawn: in full swing (purple velvet, a neon VIP sign, a bar, a
// DJ, men in suits and sunglasses), Meathead coming in through the window, the
// wide shot of the volcano going off near the top, and the lounge afterwards.

import type { GameState } from '../../state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../constants';
import { drawPlayer } from '../../render/playerRenderer';
import { COURSE } from './course';
import { Lounge, crashPose, PARTY_FRAMES, WIDE_FRAMES, BLAST_AT, blastAmount } from './lounge';
import { drawVolcano } from './draw';

type Ctx = CanvasRenderingContext2D;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** Who was at the party: where, in what, doing what. */
const GUESTS: { dx: number; suit: string; pose: 'sit' | 'stand' | 'dance' | 'dj' | 'bar'; skin: string }[] = [
  { dx: 260, suit: '#1F2937', pose: 'sit', skin: '#E0AC69' }, { dx: 330, suit: '#4C1D95', pose: 'sit', skin: '#8D5524' },
  { dx: 470, suit: '#111827', pose: 'stand', skin: '#F2C9A0' }, { dx: 560, suit: '#7F1D1D', pose: 'dance', skin: '#C68642' },
  { dx: 620, suit: '#0F766E', pose: 'dance', skin: '#E0AC69' }, { dx: 760, suit: '#1E293B', pose: 'dj', skin: '#8D5524' },
  { dx: 930, suit: '#374151', pose: 'bar', skin: '#F2C9A0' }, { dx: 1010, suit: '#581C87', pose: 'stand', skin: '#E0AC69' },
  { dx: 1120, suit: '#111827', pose: 'sit', skin: '#C68642' },
];

export const drawLoungeBack = (ctx: Ctx, state: GameState, lg: Lounge) => {
  const L = COURSE.lounge, y = L.y, f = state.frame;
  const wrecked = lg.phase === 'wrecked';
  const top = y - 620;
  // The room: purple velvet walls, gold trim, a ceiling of mirror tiles
  ctx.fillStyle = wrecked ? '#1A0B1F' : '#2E1065'; ctx.fillRect(L.x1 - 60, top, L.x2 - L.x1 + 60, 620);
  ctx.fillStyle = wrecked ? '#241028' : '#3B0764';
  for (let x = L.x1; x < L.x2; x += 60) ctx.fillRect(x, top + 60, 30, 560);
  ctx.fillStyle = '#A16207'; ctx.fillRect(L.x1 - 60, y - 200, L.x2 - L.x1 + 60, 6); ctx.fillRect(L.x1 - 60, top + 56, L.x2 - L.x1 + 60, 4);
  ctx.fillStyle = wrecked ? '#1C1917' : '#4B5563'; ctx.fillRect(L.x1 - 60, top, L.x2 - L.x1 + 60, 56);
  if (!wrecked) for (let x = L.x1 - 60; x < L.x2; x += 40) { ctx.fillStyle = hash(x) > 0.5 ? '#6B7280' : '#9CA3AF'; ctx.fillRect(x + 2, top + 4, 36, 48); }
  // The window he's coming through (on the left wall)
  const wy = y - 330;
  ctx.fillStyle = '#0B0612'; ctx.fillRect(L.x1 - 60, wy, 60, 150);
  if (lg.phase === 'party' || (lg.phase === 'crash' && lg.t < PARTY_FRAMES)) { ctx.fillStyle = 'rgba(147, 197, 253, 0.35)'; ctx.fillRect(L.x1 - 56, wy + 4, 52, 142); }
  ctx.strokeStyle = '#CA8A04'; ctx.lineWidth = 4; ctx.strokeRect(L.x1 - 60, wy, 60, 150);
  // Neon VIP sign, the bar, the DJ booth, velvet couches
  const neon = !wrecked || Math.floor(f / 5) % 9 === 0;
  ctx.save();
  ctx.shadowColor = '#EC4899'; ctx.shadowBlur = neon ? 18 : 0;
  ctx.fillStyle = neon ? '#FBCFE8' : '#4A044E'; ctx.font = 'bold 34px "Press Start 2P"'; ctx.textAlign = 'center';
  ctx.fillText('V.I.P.', L.x1 + 470, y - 400);
  ctx.restore();
  // Bar
  ctx.fillStyle = '#44403C'; ctx.fillRect(L.x1 + 860, y - 110, 200, 110);
  ctx.fillStyle = '#A16207'; ctx.fillRect(L.x1 + 855, y - 116, 210, 8);
  ctx.fillStyle = '#1C1917'; ctx.fillRect(L.x1 + 860, y - 250, 200, 110);
  for (let i = 0; i < 12; i++) { ctx.fillStyle = ['#65A30D', '#B45309', '#0EA5E9', '#E11D48'][i % 4]; if (!wrecked || i % 3 === 0) ctx.fillRect(L.x1 + 868 + i * 16, y - 238 + (i % 2) * 50, 8, 30); }
  // DJ booth
  ctx.fillStyle = '#18181B'; ctx.fillRect(L.x1 + 700, y - 90, 130, 90);
  ctx.fillStyle = wrecked ? '#3F3F46' : '#22D3EE'; ctx.fillRect(L.x1 + 708, y - 84, 114, 6);
  // Couches
  for (const cx of [L.x1 + 250, L.x1 + 1080]) {
    ctx.fillStyle = wrecked ? '#4A1D2E' : '#831843'; ctx.fillRect(cx - 20, y - 60, 140, 60);
    ctx.fillStyle = wrecked ? '#3B1424' : '#9D174D'; ctx.fillRect(cx - 20, y - 90, 140, 34);
    if (wrecked) { ctx.fillStyle = '#FDE68A'; for (let i = 0; i < 5; i++) ctx.fillRect(cx + i * 26, y - 70 + (i % 2) * 10, 8, 4); } // stuffing out of it
  }
  // The disco ball (up, or smashed on the floor)
  if (!wrecked) {
    const bx = L.x1 + 560, by = top + 110;
    ctx.strokeStyle = '#6B7280'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx, top + 56); ctx.lineTo(bx, by - 22); ctx.stroke();
    ctx.fillStyle = '#E5E7EB'; ctx.beginPath(); ctx.arc(bx, by, 22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#9CA3AF'; for (let i = 0; i < 8; i++) ctx.fillRect(bx - 20 + ((i * 7 + f) % 40), by - 16 + (i % 4) * 8, 4, 4);
    // Light spots swirling round the room
    for (let i = 0; i < 10; i++) { const a = f * 0.02 + i; ctx.fillStyle = ['rgba(236,72,153,0.3)', 'rgba(34,211,238,0.3)', 'rgba(250,204,21,0.3)'][i % 3]; ctx.beginPath(); ctx.arc(bx + Math.cos(a) * 380, by + 200 + Math.sin(a * 1.3) * 160, 12, 0, Math.PI * 2); ctx.fill(); }
  } else {
    ctx.fillStyle = '#9CA3AF'; ctx.beginPath(); ctx.arc(L.x1 + 590, y - 10, 18, Math.PI, 0); ctx.fill();
    for (let i = 0; i < 10; i++) { ctx.fillStyle = '#D1D5DB'; ctx.fillRect(L.x1 + 540 + hash(i) * 110, y - 3, 3, 3); }
  }
  // The guests: partying, or strewn about in pieces
  GUESTS.forEach((g, i) => {
    const gx = L.x1 + g.dx;
    if (wrecked) corpse(ctx, gx, y, g.suit, g.skin, i, f);
    else guest(ctx, gx, y, g.suit, g.skin, g.pose, f + i * 17, lg.phase === 'crash' && lg.t > PARTY_FRAMES);
  });
  if (wrecked) wreckage(ctx, state);
  // The floor: black and gold carpet (sodden, afterwards)
  ctx.fillStyle = wrecked ? '#140A0A' : '#1C1030'; ctx.fillRect(L.x1 - 60, y, L.x2 - L.x1 + 60, 120);
  ctx.fillStyle = wrecked ? '#3B1212' : '#A16207';
  for (let x = Math.floor((L.x1 - 60) / 40) * 40; x < L.x2; x += 40) { ctx.fillRect(x, y + 10, 20, 3); ctx.fillRect(x + 20, y + 24, 20, 3); }
  if (wrecked) { ctx.fillStyle = '#5B0000'; for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.ellipse(L.x1 + hash(i + 40) * (L.x2 - L.x1), y + 4, 30 + hash(i) * 50, 4, 0, 0, Math.PI * 2); ctx.fill(); } }
};

/** A guest, alive: a sharp suit, sunglasses at night; `startled` once the window goes. */
const guest = (ctx: Ctx, x: number, y: number, suit: string, skin: string, pose: string, f: number, startled: boolean) => {
  ctx.save(); ctx.translate(x, y);
  const bob = pose === 'dance' ? Math.abs(Math.sin(f * 0.15)) * 6 : 0;
  const sit = pose === 'sit' ? 22 : 0;
  ctx.translate(0, -bob);
  // Legs
  ctx.fillStyle = '#111827';
  if (sit) { ctx.fillRect(-10, -30, 26, 8); ctx.fillRect(12, -30, 8, 30); ctx.fillRect(-2, -30, 8, 30); }
  else { ctx.fillRect(-8, -30, 7, 30); ctx.fillRect(2, -30, 7, 30); }
  // Suit, shirt collar, tie
  ctx.fillStyle = suit; ctx.fillRect(-12, -62 + sit, 24, 34);
  ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.moveTo(-4, -62 + sit); ctx.lineTo(0, -52 + sit); ctx.lineTo(4, -62 + sit); ctx.fill();
  ctx.fillStyle = '#B91C1C'; ctx.fillRect(-1, -58 + sit, 2, 14);
  // Head, slick hair, shades
  ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(0, -72 + sit, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0A0A0A'; ctx.fillRect(-9, -82 + sit, 18, 5); ctx.fillRect(-2, -75 + sit, 10, 3);
  // Arms: a drink, a cigar, hands up dancing, spinning records
  ctx.fillStyle = suit;
  if (pose === 'dance') { ctx.fillRect(-18, -80 + Math.sin(f * 0.3) * 4, 6, 20); ctx.fillRect(12, -80 - Math.sin(f * 0.3) * 4, 6, 20); }
  else if (pose === 'dj') { ctx.fillRect(10, -56, 16, 5); ctx.fillStyle = '#18181B'; ctx.fillRect(-10, -96, 20, 4); ctx.fillRect(-11, -90, 3, 8); ctx.fillRect(8, -90, 3, 8); } // headphones
  else { ctx.fillRect(10, -58 + sit, 12, 5); ctx.fillStyle = '#FDE68A'; ctx.fillRect(20, -64 + sit, 5, 8); } // a glass
  if (startled) { ctx.fillStyle = '#FACC15'; ctx.font = 'bold 14px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('!', 0, -100 + sit); }
  ctx.restore();
};

/** A guest, afterwards. Every one of them different, none of them good. */
const corpse = (ctx: Ctx, x: number, y: number, suit: string, skin: string, i: number, f: number) => {
  ctx.save(); ctx.translate(x, y);
  // A pool of it under each
  ctx.fillStyle = '#5B0000'; ctx.beginPath(); ctx.ellipse(0, -1, 40 + (i % 3) * 12, 5, 0, 0, Math.PI * 2); ctx.fill();
  switch (i % 5) {
    case 0: // face down, splayed
      ctx.fillStyle = suit; ctx.fillRect(-26, -12, 34, 12); ctx.fillStyle = '#111827'; ctx.fillRect(8, -10, 26, 8);
      ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(-32, -8, 8, 0, Math.PI * 2); ctx.fill();
      break;
    case 1: // torn in half: legs here, the rest over there
      ctx.fillStyle = '#111827'; ctx.fillRect(10, -8, 28, 8); ctx.fillStyle = '#7F1D1D'; ctx.fillRect(6, -10, 6, 10);
      ctx.fillStyle = suit; ctx.save(); ctx.translate(-40, -6); ctx.rotate(0.4); ctx.fillRect(-14, -8, 26, 14); ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(-18, 0, 8, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      ctx.fillStyle = '#991B1B'; for (let k = 0; k < 5; k++) ctx.fillRect(-26 + k * 8, -3, 4, 3);
      break;
    case 2: // slumped against the wall behind, head lolling, twitching
      ctx.fillStyle = suit; ctx.fillRect(-10, -40, 22, 30); ctx.fillStyle = '#111827'; ctx.fillRect(-4, -12, 30, 10);
      ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(8 + Math.sin(f * 0.6) * (Math.floor(f / 40) % 4 === 0 ? 1.5 : 0), -44, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7F1D1D'; ctx.fillRect(-6, -30, 12, 10);
      break;
    case 3: // a head, a separate distance from the rest of him
      ctx.fillStyle = suit; ctx.fillRect(-30, -10, 36, 10); ctx.fillStyle = '#7F1D1D'; ctx.fillRect(-34, -10, 6, 8);
      ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(34, -7, 8, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#0A0A0A'; ctx.fillRect(28, -10, 12, 3);
      break;
    default: // charred, still smoking
      ctx.fillStyle = '#1C1917'; ctx.fillRect(-26, -12, 50, 12); ctx.beginPath(); ctx.arc(-30, -8, 8, 0, Math.PI * 2); ctx.fill();
      for (let k = 0; k < 2; k++) { const t = ((f * 0.5 + k * 40) % 80) / 80; ctx.fillStyle = `rgba(90,90,90,${0.5 * (1 - t)})`; ctx.beginPath(); ctx.arc(-10 + k * 16, -18 - t * 50, 6 + t * 10, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.restore();
};

/** Everything else: blood up the walls, glass everywhere, small fires, a hole blown in the ceiling letting the sky in. */
const wreckage = (ctx: Ctx, state: GameState) => {
  const L = COURSE.lounge, y = L.y, f = state.frame;
  const top = y - 620;
  ctx.fillStyle = '#7F0000';
  for (let i = 0; i < 14; i++) { const x = L.x1 + hash(i) * (L.x2 - L.x1 - 100); ctx.beginPath(); ctx.ellipse(x, y - 150 - hash(i + 5) * 300, 10 + hash(i + 2) * 30, 6 + hash(i + 3) * 20, hash(i) * 3, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(x - 2, y - 150 - hash(i + 5) * 300, 3, 20 + hash(i + 8) * 40); }
  // The hole in the ceiling (dusk through it)
  ctx.fillStyle = '#7C2D12'; ctx.beginPath(); ctx.ellipse(L.x1 + 620, top + 20, 150, 60, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#F59E0B'; ctx.beginPath(); ctx.ellipse(L.x1 + 620, top + 10, 120, 40, 0, 0, Math.PI * 2); ctx.fill();
  // Glass and rubble on the floor
  for (let i = 0; i < 40; i++) { ctx.fillStyle = i % 3 ? '#D1D5DB' : '#57534E'; ctx.fillRect(L.x1 + hash(i * 3) * (L.x2 - L.x1 - 60), y - 3 - hash(i) * 4, 3 + hash(i + 1) * 5, 2 + hash(i + 2) * 3); }
  // Arms and legs all over the place, a head up on the bar
  for (let i = 0; i < 14; i++) {
    const lx = L.x1 + 120 + hash(i * 7) * (L.x2 - L.x1 - 260), ly = y - 3 - hash(i + 11) * 6;
    ctx.save(); ctx.translate(lx, ly); ctx.rotate(hash(i + 2) * Math.PI * 2);
    const leg = i % 2 === 0;
    ctx.fillStyle = leg ? '#111827' : GUESTS[i % GUESTS.length].suit; ctx.fillRect(-12, -3, 24, leg ? 8 : 6);
    ctx.fillStyle = leg ? '#0A0A0A' : GUESTS[i % GUESTS.length].skin; ctx.fillRect(10, -3, 6, leg ? 8 : 6);
    ctx.fillStyle = '#B91C1C'; ctx.fillRect(-15, -3, 4, leg ? 8 : 6);
    ctx.restore();
  }
  ctx.fillStyle = '#C68642'; ctx.beginPath(); ctx.arc(L.x1 + 960, y - 124, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0A0A0A'; ctx.fillRect(L.x1 + 952, y - 128, 16, 4);
  ctx.fillStyle = '#7F0000'; ctx.fillRect(L.x1 + 950, y - 116, 20, 4); ctx.fillRect(L.x1 + 958, y - 116, 3, 30);
  // Fires still going
  for (const fx of [L.x1 + 330, L.x1 + 770, L.x1 + 1150]) {
    for (let k = 0; k < 3; k++) {
      const h = 50 + Math.sin(f * 0.3 + k + fx) * 14;
      ctx.fillStyle = ['rgba(234,88,12,0.85)', 'rgba(251,146,60,0.9)', 'rgba(254,240,138,0.9)'][k];
      ctx.beginPath(); ctx.moveTo(fx - 26 + k * 7, y); ctx.quadraticCurveTo(fx + Math.sin(f * 0.2 + k) * 8, y - h - 10 + k * 10, fx + 26 - k * 7, y); ctx.fill();
    }
  }
  // Smoke hanging under the ceiling
  ctx.fillStyle = 'rgba(40, 30, 35, 0.4)'; ctx.fillRect(L.x1 - 60, top + 56, L.x2 - L.x1 + 60, 90);
};

/** Meathead coming through the window, and the glass going everywhere. */
export const drawLoungeFront = (ctx: Ctx, state: GameState, lg: Lounge) => {
  if (lg.phase !== 'crash' || lg.t < PARTY_FRAMES) return;
  const t = lg.t - PARTY_FRAMES;
  const L = COURSE.lounge;
  const pose = crashPose(t);
  // Glass: a burst of shards out of the window, falling
  for (let i = 0; i < 26; i++) {
    const vx = 2 + hash(i) * 9, vy = -4 + hash(i + 3) * 6;
    const x = L.x1 - 30 + vx * t, yy = L.y - 260 + vy * t + 0.25 * t * t;
    if (yy > L.y) continue;
    ctx.fillStyle = 'rgba(191, 219, 254, 0.85)';
    ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + 6, yy + 3); ctx.lineTo(x + 2, yy + 8); ctx.fill();
  }
  // Him: a flying kick, feet first
  const p = state.player;
  const body = { ...p, pos: { x: -1e6, y: -1e6 }, hidden: false, isGrounded: false, vel: { x: 12, y: 6 }, facing: 1 as const, isDivekicking: pose.k < 1, invincibilityTimer: 0, hurtTimer: 0, pushbackTimer: 0, isCharging: false, isSliding: false, isUppercutting: false };
  ctx.save();
  ctx.translate(pose.x + p.width / 2, pose.y + p.height / 2);
  ctx.translate(-(body.pos.x + body.width / 2), -(body.pos.y + body.height / 2));
  drawPlayer(ctx, body, { ...state, deathTimer: 0 }, { currentWeapon: p.currentWeapon, showFilthShield: false, invincibilityEnabled: false });
  ctx.restore();
};

/** What he says coming through the window, over him. */
export const drawLoungeHud = (ctx: Ctx, state: GameState, lg: Lounge) => {
  if (lg.phase !== 'crash' || lg.lineT <= 0 || !lg.line) return;
  const pose = crashPose(Math.max(0, lg.t - PARTY_FRAMES));
  const x = Math.max(120, pose.x + 22 - state.camera.x), y = pose.y - 30 - state.camera.y;
  ctx.save();
  ctx.font = 'bold 16px "Press Start 2P"'; ctx.textAlign = 'center';
  ctx.fillStyle = '#000'; ctx.fillText(lg.line, x + 2, y + 2);
  ctx.fillStyle = '#FDE047'; ctx.fillText(lg.line, x, y);
  ctx.restore();
};

/** The wide shot: the volcano, a long way off, quiet; then a blast near the top, right where the lounge is. */
export const drawWideShot = (ctx: Ctx, state: GameState, lg: Lounge) => {
  if (lg.phase !== 'wide') return;
  const W = CANVAS_WIDTH, H = CANVAS_HEIGHT, t = lg.t, f = state.frame;
  const shake = t > BLAST_AT && t < BLAST_AT + 40 ? (hash(t) - 0.5) * 14 : 0;
  ctx.save();
  ctx.translate(shake, shake * 0.5);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#1E1B4B'); g.addColorStop(0.55, '#7C2D12'); g.addColorStop(1, '#EA580C');
  ctx.fillStyle = g; ctx.fillRect(-20, -20, W + 40, H + 40);
  // Stars coming out
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; for (let i = 0; i < 40; i++) ctx.fillRect(hash(i) * W, hash(i + 9) * 200, 2, 2);
  const cx = W / 2, base = H - 70, s = 1.05;
  drawVolcano(ctx, cx, base, s, f, 0);
  // The lounge's lit window, near the top
  const wx = cx + 40, wy = base - 280 * s + 60;
  const blast = blastAmount(lg);
  if (blast < 0.3) { ctx.fillStyle = Math.floor(f / 10) % 2 ? '#F0ABFC' : '#EC4899'; ctx.fillRect(wx - 4, wy - 3, 8, 6); }
  // Foreground: the plain the volcano stands on
  ctx.fillStyle = '#0C0505'; ctx.beginPath(); ctx.moveTo(-20, H + 20); ctx.lineTo(-20, H - 50); ctx.quadraticCurveTo(W / 2, H - 80, W + 20, H - 40); ctx.lineTo(W + 20, H + 20); ctx.fill();
  if (t >= BLAST_AT) {
    const k = (t - BLAST_AT) / (WIDE_FRAMES - BLAST_AT);
    // The flash
    if (t < BLAST_AT + 10) { ctx.fillStyle = `rgba(255, 255, 240, ${1 - (t - BLAST_AT) / 10})`; ctx.fillRect(-20, -20, W + 40, H + 40); }
    // The fireball, right where the window was: a little one, all on its own
    const r = 18 + Math.min(1, k * 5) * 60;
    const fg = ctx.createRadialGradient(wx, wy, 2, wx, wy, r);
    fg.addColorStop(0, `rgba(255, 251, 235, ${Math.max(0, 1 - k * 2)})`); fg.addColorStop(0.4, `rgba(251, 146, 60, ${Math.max(0, 0.95 - k)})`); fg.addColorStop(1, 'rgba(120, 30, 10, 0)');
    ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(wx, wy, r, 0, Math.PI * 2); ctx.fill();
    // Smoke rolling up out of it
    for (let i = 0; i < 8; i++) {
      const sk = Math.min(1, k * 1.4 + i * 0.05);
      ctx.fillStyle = `rgba(60, 50, 50, ${0.6 * (1 - sk * 0.5)})`;
      ctx.beginPath(); ctx.arc(wx + Math.sin(i * 2) * 20 * sk, wy - sk * 120 - i * 10, 10 + sk * 26, 0, Math.PI * 2); ctx.fill();
    }
    // Bits of the lounge flying out
    for (let i = 0; i < 16; i++) {
      const vx = (hash(i) - 0.5) * 6, vy = -2 - hash(i + 4) * 4, tt = (t - BLAST_AT) * 0.8;
      const x = wx + vx * tt, y = wy + vy * tt + 0.05 * tt * tt;
      if (y > base) continue;
      ctx.fillStyle = i % 3 ? '#1C1917' : '#FB923C'; ctx.fillRect(x, y, 3, 3);
    }
  }
  // Letterbox bars: it's a cutscene
  ctx.fillStyle = '#000'; ctx.fillRect(-20, -20, W + 40, 60); ctx.fillRect(-20, H - 40, W + 40, 60);
  ctx.restore();
};
