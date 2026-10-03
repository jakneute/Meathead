// The VIP lounge, drawn: in full swing (purple velvet, a neon VIP sign, a bar, a
// DJ, men in suits and sunglasses), Meathead coming in through the window, the
// wide shot of the volcano going off near the top, and the lounge afterwards.

import type { GameState } from '../../core/state';
import { bandedGradient, checker, hazeBands, pixelBlob, pixelRidge, steppedGlow } from '../../render/pixelArt';
import { INK, dark, lite, ink, shaded, shadedTop } from '../../render/npc/kit';
import { drawPerson, type PersonSpec, type Pose } from '../../render/npc/person';
import { slab, pipe } from '../barry/rooms';
import { neonText, neonStrip } from './clubDraw';
import { drawFire } from '../../render/fx/fire';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../constants';
import { drawPlayer } from '../../render/player/player';
import { COURSE } from './course';
import { Lounge, crashPose, PARTY_FRAMES, FLIGHT_FRAMES, WIDE_FRAMES, BLAST_AT, SCREAM_AT, ZOOM_OUT, ZOOM_IN_AT, FADE_IN, blastAmount } from './lounge';
import { drawVolcano } from './draw';
import { sentenceShown } from '../../platform/speech';

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
  const top = y - 620, x0 = L.x1 - 60, w = L.x2 - L.x1 + 60;
  // The room: purple velvet walls (tufted, in stripes, each lit down its left), gold trim, a ceiling of mirror tiles
  const wall = wrecked ? '#1A0B1F' : '#2E1065', stripe = wrecked ? '#241028' : '#3B0764';
  ctx.fillStyle = wall; ctx.fillRect(x0, top, w, 620);
  for (let x = L.x1; x < L.x2; x += 60) {
    ctx.fillStyle = stripe; ctx.fillRect(x, top + 60, 30, 560);
    ctx.fillStyle = lite(stripe, 0.1); ctx.fillRect(x, top + 60, 4, 560); checker(ctx, x + 4, top + 60, 4, 560, lite(stripe, 0.1));
    ctx.fillStyle = dark(stripe, 0.3); ctx.fillRect(x + 26, top + 60, 4, 560);
    // (the tufting: a button sunk in each diamond)
    for (let ty = top + 90; ty < y - 210; ty += 40) for (const tx of [x + 15, x + 45]) {
      const yy = ty + (tx > x + 30 ? 20 : 0);
      ctx.fillStyle = dark(wall, 0.4); ctx.fillRect(tx - 2, yy - 2, 4, 4);
      ctx.fillStyle = lite(wall, 0.2); ctx.fillRect(tx - 2, yy - 2, 2, 2);
    }
  }
  // (below the rail: dark wainscot panels)
  ctx.fillStyle = dark(wall, 0.35); ctx.fillRect(x0, y - 194, w, 194);
  for (let x = Math.floor(x0 / 80) * 80; x < L.x2; x += 80) {
    ctx.fillStyle = dark(wall, 0.55); ctx.fillRect(x + 8, y - 180, 64, 2); ctx.fillRect(x + 8, y - 180, 2, 160);
    ctx.fillStyle = lite(dark(wall, 0.35), 0.12); ctx.fillRect(x + 8, y - 22, 64, 2); ctx.fillRect(x + 70, y - 178, 2, 158);
  }
  pipe(ctx, x0, y - 200, w, 6, '#A16207'); pipe(ctx, x0, top + 56, w, 4, '#A16207');
  ctx.fillStyle = wrecked ? '#1C1917' : '#4B5563'; ctx.fillRect(x0, top, w, 56);
  if (!wrecked) for (let x = x0; x < L.x2; x += 40) {
    slab(ctx, x + 2, top + 4, 36, 48, hash(x) > 0.5 ? '#6B7280' : '#9CA3AF', 2);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(x + 6, top + 8, 6, 2); ctx.fillRect(x + 6, top + 10, 2, 4);
  }
  // The window he's coming through (on the left wall)
  const wy = y - 330;
  ctx.fillStyle = '#0B0612'; ctx.fillRect(x0, wy, 60, 150);
  if (lg.phase === 'party' || (lg.phase === 'crash' && lg.t < PARTY_FRAMES)) {
    ctx.save(); ctx.globalAlpha = 0.4; bandedGradient(ctx, L.x1 - 56, wy + 4, 52, 142, ['#BFDBFE', '#93C5FD', '#60A5FA'], 4); ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; for (let k = 0; k < 8; k++) ctx.fillRect(L.x1 - 50 + k * 2, wy + 30 - k * 2, 2, 2);
  }
  ctx.fillStyle = '#A16207'; ctx.fillRect(x0 - 2, wy - 2, 64, 4); ctx.fillRect(x0 - 2, wy + 148, 64, 4); ctx.fillRect(x0 - 2, wy - 2, 4, 154); ctx.fillRect(x0 + 58, wy - 2, 4, 154);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(x0 - 2, wy - 2, 64, 1); ctx.fillRect(x0 - 2, wy - 2, 1, 154);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x0 - 2.5, wy - 2.5, 65, 155); ctx.strokeRect(x0 + 1.5, wy + 1.5, 57, 147);
  // Neon VIP sign, the bar, the DJ booth, velvet couches
  const neon = !wrecked || Math.floor(f / 5) % 9 === 0;
  neonText(ctx, 'V.I.P.', L.x1 + 470, y - 400, 'bold 34px "Press Start 2P"', '#EC4899', '#FBCFE8', neon);
  // Bar: the back shelf of bottles, the counter (panelled, a gold top)
  slab(ctx, L.x1 + 860, y - 250, 200, 110, '#1C1917');
  bandedGradient(ctx, L.x1 + 864, y - 246, 192, 102, wrecked ? ['#1C1414', '#140E0E'] : ['#3B1E3A', '#24122A', '#1C0F20'], 3);
  for (const sy of [y - 206, y - 156]) pipe(ctx, L.x1 + 862, sy, 196, 4, '#57534E');
  for (let i = 0; i < 12; i++) {
    if (wrecked && i % 3 !== 0) continue;
    const c = ['#65A30D', '#B45309', '#0EA5E9', '#E11D48'][i % 4], bx = L.x1 + 868 + i * 16, by = y - 238 + (i % 2) * 50;
    ctx.fillStyle = INK; ctx.fillRect(bx - 1, by - 1, 10, 32); ctx.fillRect(bx + 1, by - 7, 6, 7);
    ctx.fillStyle = c; ctx.fillRect(bx, by, 8, 30); ctx.fillRect(bx + 2, by - 6, 4, 6);
    ctx.fillStyle = lite(c, 0.4); ctx.fillRect(bx + 1, by + 2, 2, 24);
    ctx.fillStyle = dark(c, 0.35); ctx.fillRect(bx + 6, by, 2, 30);
    ctx.fillStyle = '#F5F5F4'; ctx.fillRect(bx + 1, by + 12, 6, 7);
  }
  slab(ctx, L.x1 + 860, y - 110, 200, 110, '#44403C');
  for (let k = 0; k < 4; k++) {
    const px = L.x1 + 872 + k * 47;
    ctx.fillStyle = dark('#44403C', 0.3); ctx.fillRect(px, y - 96, 38, 2); ctx.fillRect(px, y - 96, 2, 84);
    ctx.fillStyle = lite('#44403C', 0.15); ctx.fillRect(px, y - 14, 38, 2); ctx.fillRect(px + 36, y - 94, 2, 82);
  }
  slab(ctx, L.x1 + 855, y - 116, 210, 8, '#A16207', 1);
  // DJ booth
  slab(ctx, L.x1 + 700, y - 90, 130, 90, '#18181B');
  for (let gy = y - 70; gy < y - 6; gy += 6) { ctx.fillStyle = '#0C0C0E'; ctx.fillRect(L.x1 + 712, gy, 106, 2); ctx.fillStyle = '#27272A'; ctx.fillRect(L.x1 + 712, gy + 2, 106, 1); }
  if (wrecked) { ctx.fillStyle = '#3F3F46'; ctx.fillRect(L.x1 + 708, y - 84, 114, 6); }
  else neonStrip(ctx, L.x1 + 708, y - 84, 114, 6, '#22D3EE', 0.8);
  // Couches: a tufted back, the seat cushions, rolled arms; inked, lit from above
  for (const cx of [L.x1 + 250, L.x1 + 1080]) {
    const seat = wrecked ? '#4A1D2E' : '#831843', back = wrecked ? '#3B1424' : '#9D174D';
    shadedTop(ctx, () => ctx.roundRect(cx - 20, y - 90, 140, 36, [8, 8, 0, 0]), back, cx - 20, y - 90, 140, 36);
    for (let k = 0; k < 4; k++) { ctx.fillStyle = dark(back, 0.4); ctx.fillRect(cx + k * 32, y - 76, 3, 3); }
    shadedTop(ctx, () => ctx.rect(cx - 20, y - 60, 140, 60), seat, cx - 20, y - 60, 140, 60);
    for (const sx of [cx + 26, cx + 72]) { ctx.fillStyle = dark(seat, 0.35); ctx.fillRect(sx, y - 58, 2, 22); }
    ctx.fillStyle = dark(seat, 0.35); ctx.fillRect(cx - 18, y - 36, 136, 2);
    for (const ax of [cx - 28, cx + 112]) shaded(ctx, () => ctx.roundRect(ax, y - 70, 16, 70, [8, 8, 2, 2]), back, ax, y - 70, 16, 70);
    if (wrecked) for (let i = 0; i < 5; i++) { const sx = cx + i * 26, sy = y - 70 + (i % 2) * 10; ctx.fillStyle = INK; ctx.fillRect(sx - 1, sy - 1, 10, 6); ctx.fillStyle = '#FDE68A'; ctx.fillRect(sx, sy, 8, 4); ctx.fillStyle = '#FFFBEB'; ctx.fillRect(sx, sy, 4, 2); } // stuffing out of it
  }
  // The disco ball (up, or smashed on the floor)
  if (!wrecked) {
    const bx = L.x1 + 560, by = top + 110;
    ctx.fillStyle = INK; ctx.fillRect(bx - 1, top + 56, 3, by - 22 - top - 56); ctx.fillStyle = '#9CA3AF'; ctx.fillRect(bx, top + 56, 1, by - 22 - top - 56);
    discoBall(ctx, bx, by, 22, f);
    // Light spots swirling round the room
    for (let i = 0; i < 10; i++) { const a = f * 0.02 + i; steppedGlow(ctx, bx + Math.cos(a) * 380, by + 200 + Math.sin(a * 1.3) * 160, 14, ['#EC4899', '#22D3EE', '#FACC15'][i % 3], 0.4, 0.15, 3); }
  } else {
    const bx = L.x1 + 590;
    ink(ctx, () => { ctx.arc(bx, y - 10, 18, Math.PI, 0); ctx.closePath(); }, '#9CA3AF');
    ctx.save(); ctx.beginPath(); ctx.arc(bx, y - 10, 17, Math.PI, 0); ctx.clip();
    for (let ty = -28; ty < -10; ty += 4) for (let tx = -18; tx < 18; tx += 4) { ctx.fillStyle = tx + ty < -24 ? '#E5E7EB' : tx + ty < -8 ? '#9CA3AF' : '#6B7280'; ctx.fillRect(bx + tx, y + ty, 3, 3); }
    ctx.restore();
    for (let i = 0; i < 10; i++) { const sx = Math.round(L.x1 + 540 + hash(i) * 110); ctx.fillStyle = INK; ctx.fillRect(sx - 1, y - 4, 5, 4); ctx.fillStyle = i % 2 ? '#F3F4F6' : '#9CA3AF'; ctx.fillRect(sx, y - 3, 3, 3); }
  }
  // The guests: partying, or strewn about in pieces
  GUESTS.forEach((g, i) => {
    const gx = L.x1 + g.dx;
    if (wrecked) corpse(ctx, gx, y, g.suit, g.skin, i, f);
    else if (lg.phase === 'crash' && lg.t > PARTY_FRAMES + FLIGHT_FRAMES - 6) panicking(ctx, gx, y, g.suit, g.skin, i, lg.t - (PARTY_FRAMES + FLIGHT_FRAMES), f, L.x2);
    else guest(ctx, gx, y, g.suit, g.skin, g.pose, f + i * 17, lg.phase === 'crash' && lg.t > PARTY_FRAMES);
  });
  if (wrecked) wreckage(ctx, state);
  // The floor: black and gold carpet (sodden, afterwards)
  ctx.fillStyle = wrecked ? '#140A0A' : '#1C1030'; ctx.fillRect(x0, y, w, 120);
  ctx.fillStyle = INK; ctx.fillRect(x0, y, w, 1); ctx.fillStyle = wrecked ? '#2A1414' : '#2E1F48'; ctx.fillRect(x0, y + 1, w, 2);
  for (let x = Math.floor(x0 / 40) * 40; x < L.x2; x += 40) {
    ctx.fillStyle = wrecked ? '#3B1212' : '#A16207'; ctx.fillRect(x, y + 10, 20, 3); ctx.fillRect(x + 20, y + 24, 20, 3);
    ctx.fillStyle = wrecked ? '#4A1818' : '#CA8A04'; ctx.fillRect(x, y + 10, 20, 1); ctx.fillRect(x + 20, y + 24, 20, 1);
    ctx.fillStyle = wrecked ? '#3B1212' : '#713F12'; ctx.fillRect(x + 9, y + 15, 2, 2); ctx.fillRect(x + 29, y + 5, 2, 2);
  }
  if (wrecked) for (let i = 0; i < 12; i++) {
    const px = L.x1 + hash(i + 40) * (L.x2 - L.x1), pw = 30 + hash(i) * 50;
    pixelBlob(ctx, px, y + 4, pw, 4, '#5B0000');
    ctx.fillStyle = '#8B1A1A'; ctx.fillRect(Math.round(px - pw * 0.5), y + 2, Math.round(pw * 0.4), 2);
  }
};

/** A disco ball: mirror tiles in rows, lit upper left, the shine going round. */
const discoBall = (ctx: Ctx, bx: number, by: number, r: number, f: number) => {
  ink(ctx, () => ctx.arc(bx, by, r, 0, Math.PI * 2), '#6B7280');
  ctx.save(); ctx.beginPath(); ctx.arc(bx, by, r - 1, 0, Math.PI * 2); ctx.clip();
  const spin = Math.floor(f / 6) % 2;
  for (let ty = -r; ty < r; ty += 5) for (let tx = -r + ((ty / 5 + spin) & 1) * 2; tx < r; tx += 5) {
    const d = (tx + ty + 6) / (r * 2);
    ctx.fillStyle = d < -0.4 ? '#F9FAFB' : d < -0.05 ? '#D1D5DB' : d < 0.35 ? '#9CA3AF' : '#4B5563';
    ctx.fillRect(Math.round(bx + tx), Math.round(by + ty), 4, 4);
  }
  ctx.restore();
  ctx.fillStyle = '#FFFFFF'; for (let i = 0; i < 8; i++) ctx.fillRect(Math.round(bx - 20 + ((i * 7 + f) % 40)), Math.round(by - 16 + (i % 4) * 8), 2, 2);
};

/** A guest: a sharp suit, sunglasses at night, a red tie. */
const suitSpec = (suit: string, skin: string): PersonSpec => ({
  skin, hair: { style: 'short', color: '#1C1917' }, top: { style: 'jacket', color: suit, accent: '#F8FAFC' }, legs: { color: '#111827' }, shoes: '#0A0A0A', eyes: 'shades',
  extra: c => ink(c, () => { c.moveTo(-1.2, -47); c.lineTo(1.2, -47); c.lineTo(1.8, -37); c.lineTo(0, -35); c.lineTo(-1.8, -37); c.closePath(); }, '#B91C1C', 0.6),
});
const GUEST_SCALE = 1.25;
const glass = (c: Ctx, hx: number, hy: number) => { ink(c, () => c.rect(hx - 1, hy - 8, 5, 8), '#FDE68A', 0.8); c.fillStyle = '#FEF9C3'; c.fillRect(hx, hy - 7, 1, 5); };

/** A guest, alive; `startled` once the window goes. */
const guest = (ctx: Ctx, x: number, y: number, suit: string, skin: string, pose: string, f: number, startled: boolean) => {
  const bob = pose === 'dance' ? Math.abs(Math.sin(f * 0.15)) * 6 : 0;
  const sit = pose === 'sit' ? 22 : 0;
  const p: Pose = pose === 'dance' ? { arms: Math.floor(f / 15) % 2 ? 'up' : 'wave', mouth: 'grin', f }
    : pose === 'dj' ? { arms: 'hold', mouth: 'flat', f }
    : { arms: 'hold', seated: pose === 'sit', mouth: startled ? 'o' : 'smile', f, prop: glass };
  drawPerson(ctx, x, y - bob, suitSpec(suit, skin), p, GUEST_SCALE);
  if (pose === 'dj') {
    // (headphones)
    ctx.save(); ctx.translate(x, y); ctx.scale(GUEST_SCALE, GUEST_SCALE);
    ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(1, -63, 10, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
    ctx.strokeStyle = '#3F3F46'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(1, -63, 10, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
    ink(ctx, () => ctx.roundRect(-11, -65, 5, 8, 2), '#18181B', 0.8);
    ctx.restore();
  }
  if (startled) letterInk(ctx, '!', x, y - 100 + sit, 'bold 14px "Press Start 2P"', '#FACC15');
};

/** Lettering with an ink line round it. */
const letterInk = (ctx: Ctx, text: string, x: number, y: number, font: string, c: string) => {
  ctx.save(); ctx.font = font; ctx.textAlign = 'center';
  ctx.fillStyle = INK; for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1], [2, 2]]) ctx.fillText(text, x + dx, y + dy);
  ctx.fillStyle = c; ctx.fillText(text, x, y);
  ctx.restore();
};

/** A guest once he's landed: screaming, arms up, running for it (bumping into the far wall and doubling back, falling over each other). */
const SCREAMS = ['AAAAH!', 'WHO IS THAT?!', 'SECURITY!', 'HE HAS NO SHIRT!', 'RUN!', 'MY DRINK!', 'NOT THE FACE!', 'CALL VICTOR!', 'OH GOD!'];
const panicking = (ctx: Ctx, x0: number, y: number, suit: string, skin: string, i: number, t: number, f: number, right: number) => {
  // Away from him (he's in by the window on the left), bouncing off the far end
  const speed = 2.5 + hash(i) * 3;
  const run = Math.max(0, t) * speed;
  const span = right - 80 - x0;
  const leg = Math.floor(run / Math.max(40, span));
  const along = run % Math.max(40, span);
  const x = leg % 2 === 0 ? x0 + along : right - 80 - along;
  const dir = leg % 2 === 0 ? 1 : -1;
  const down = i % 4 === 3 && t > 40; // (tripped over, crawling)
  if (down) {
    ctx.save(); ctx.translate(x, y);
    ink(ctx, () => ctx.roundRect(-36, -10, 18, 7, 2), '#111827');
    shadedTop(ctx, () => ctx.roundRect(-20, -14, 30, 12, 3), suit, -20, -14, 30, 12);
    shaded(ctx, () => ctx.roundRect(10, -4 + Math.sin(f * 0.5) * 3, 10, 4, 2), suit, 10, -6, 10, 8);
    head(ctx, 16, -10, 8, skin);
    ink(ctx, () => ctx.ellipse(20, -6, 2, 2.6, 0, 0, Math.PI * 2), '#450A0A', 0.6);
    ctx.fillStyle = '#111827'; ctx.fillRect(16, -14, 8, 3);
    ctx.restore();
  } else {
    const bob = Math.abs(Math.sin(f * 0.6 + i)) * 3;
    drawPerson(ctx, x, y - bob, suitSpec(suit, skin), { arms: 'panic', walk: f * 0.6 + i, stride: 1, mouth: 'open', f }, GUEST_SCALE, dir);
  }
  // What they're screaming (a few at a time)
  if (Math.floor((t + i * 23) / 45) % 3 === 0 && t > 4) {
    const text = SCREAMS[(i + Math.floor((t + i * 23) / 45)) % SCREAMS.length];
    letterInk(ctx, text, x, y - 110, 'bold 8px "Press Start 2P"', '#FDE047');
  }
};

/** A body part: inked, lit along the top, shaded underneath. */
const part = (ctx: Ctx, x: number, y: number, w: number, h: number, c: string) => shadedTop(ctx, () => ctx.roundRect(x, y, w, h, Math.min(3, h / 2)), c, x, y, w, h);
/** A head: inked, the underside in shade, a lit spot. */
const head = (ctx: Ctx, x: number, y: number, r: number, skin: string) => {
  ink(ctx, () => ctx.arc(x, y, r, 0, Math.PI * 2), skin);
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r - 0.5, 0, Math.PI * 2); ctx.clip(); ctx.fillStyle = dark(skin, 0.2); ctx.fillRect(x - r, y + r * 0.3, r * 2, r); ctx.restore();
  ctx.fillStyle = lite(skin, 0.25); ctx.fillRect(Math.round(x - r * 0.4), Math.round(y - r * 0.6), 3, 2);
};
/** Where something's been torn off: the meat of it, ragged. */
const stump = (ctx: Ctx, x: number, y: number, w: number, h: number) => {
  ctx.fillStyle = INK; ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
  ctx.fillStyle = '#7F1D1D'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#DC2626'; ctx.fillRect(x, y, Math.max(1, w / 2), h);
  ctx.fillStyle = '#FCA5A5'; ctx.fillRect(x + 1, y + 1, 1, 1);
};

/** A guest, afterwards. Every one of them different, none of them good. */
const corpse = (ctx: Ctx, x: number, y: number, suit: string, skin: string, i: number, f: number) => {
  ctx.save(); ctx.translate(x, y);
  // A pool of it under each
  pixelBlob(ctx, 0, -1, 40 + (i % 3) * 12, 5, '#5B0000');
  ctx.fillStyle = '#8B1A1A'; ctx.fillRect(-24, -4, 16, 2);
  switch (i % 5) {
    case 0: // face down, splayed
      part(ctx, 8, -10, 26, 8, '#111827'); part(ctx, -26, -12, 34, 12, suit);
      head(ctx, -32, -8, 8, skin); ctx.fillStyle = '#1C1917'; ctx.fillRect(-38, -15, 10, 4);
      break;
    case 1: // torn in half: legs here, the rest over there
      part(ctx, 10, -8, 28, 8, '#111827'); stump(ctx, 6, -10, 6, 10);
      ctx.save(); ctx.translate(-40, -6); ctx.rotate(0.4); part(ctx, -14, -8, 26, 14, suit); stump(ctx, 10, -8, 4, 14); head(ctx, -18, 0, 8, skin); ctx.restore();
      for (let k = 0; k < 5; k++) { ctx.fillStyle = INK; ctx.fillRect(-27 + k * 8, -4, 6, 5); ctx.fillStyle = '#991B1B'; ctx.fillRect(-26 + k * 8, -3, 4, 3); }
      break;
    case 2: // slumped against the wall behind, head lolling, twitching
      part(ctx, -4, -12, 30, 10, '#111827'); part(ctx, -10, -40, 22, 30, suit);
      ctx.fillStyle = INK; ctx.fillRect(-7, -31, 14, 12); ctx.fillStyle = '#7F1D1D'; ctx.fillRect(-6, -30, 12, 10); ctx.fillStyle = '#B91C1C'; ctx.fillRect(-6, -30, 6, 4);
      head(ctx, 8 + Math.sin(f * 0.6) * (Math.floor(f / 40) % 4 === 0 ? 1.5 : 0), -44, 8, skin);
      break;
    case 3: // a head, a separate distance from the rest of him
      part(ctx, -30, -10, 36, 10, suit); stump(ctx, -34, -10, 6, 8);
      head(ctx, 34, -7, 8, skin);
      ctx.fillStyle = INK; ctx.fillRect(27, -11, 14, 5); ctx.fillStyle = '#0A0A0A'; ctx.fillRect(28, -10, 12, 3); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(29, -10, 2, 1);
      break;
    default: // charred, still smoking
      part(ctx, -26, -12, 50, 12, '#1C1917'); ink(ctx, () => ctx.arc(-30, -8, 8, 0, Math.PI * 2), '#1C1917');
      ctx.fillStyle = '#EA580C'; ctx.fillRect(-14, -9, 2, 2); ctx.fillRect(4, -7, 2, 2); ctx.fillStyle = '#44403C'; ctx.fillRect(-34, -13, 4, 2);
      for (let k = 0; k < 2; k++) { const t = ((f * 0.5 + k * 40) % 80) / 80, r = 6 + t * 10; pixelBlob(ctx, -10 + k * 16, -18 - t * 50, r, r, `rgba(90,90,90,${(0.5 * (1 - t)).toFixed(2)})`); }
  }
  ctx.restore();
};

/** Everything else: blood up the walls, glass everywhere, small fires, a hole blown in the ceiling letting the sky in. */
const wreckage = (ctx: Ctx, state: GameState) => {
  const L = COURSE.lounge, y = L.y, f = state.frame;
  const top = y - 620;
  for (let i = 0; i < 14; i++) {
    const x = L.x1 + hash(i) * (L.x2 - L.x1 - 100), sy = y - 150 - hash(i + 5) * 300, rw = 10 + hash(i + 2) * 30, rh = 6 + hash(i + 3) * 20;
    pixelBlob(ctx, x, sy, rw, rh, '#7F0000');
    pixelBlob(ctx, x - 4, sy - 2, rw * 0.5, rh * 0.4, '#991B1B');
    // (running down the wall)
    const run = Math.round(20 + hash(i + 8) * 40);
    ctx.fillStyle = '#7F0000'; ctx.fillRect(Math.round(x) - 2, Math.round(sy), 3, run); ctx.fillRect(Math.round(x) - 3, Math.round(sy) + run, 5, 3);
  }
  // The hole in the ceiling (dusk through it): the torn edge, the sky in bands, lath and plaster hanging off it
  pixelBlob(ctx, L.x1 + 620, top + 20, 152, 62, INK);
  pixelBlob(ctx, L.x1 + 620, top + 20, 150, 60, '#7C2D12');
  pixelBlob(ctx, L.x1 + 620, top + 14, 128, 46, '#B45309');
  pixelBlob(ctx, L.x1 + 620, top + 10, 120, 40, '#F59E0B');
  pixelBlob(ctx, L.x1 + 620, top + 2, 96, 28, '#FBBF24');
  for (let k = 0; k < 9; k++) { const rx = L.x1 + 500 + k * 30, ry = top + 60 + (k % 2) * 6, rh = 8 + (k % 3) * 4; ctx.fillStyle = INK; ctx.fillRect(rx - 1, ry - 1, 6, rh + 2); ctx.fillStyle = '#57534E'; ctx.fillRect(rx, ry, 4, rh); ctx.fillStyle = '#78716C'; ctx.fillRect(rx, ry, 1, rh); }
  // Glass and rubble on the floor
  for (let i = 0; i < 40; i++) {
    const gx = Math.round(L.x1 + hash(i * 3) * (L.x2 - L.x1 - 60)), gy = Math.round(y - 3 - hash(i) * 4), gw = Math.round(3 + hash(i + 1) * 5), gh = Math.round(2 + hash(i + 2) * 3);
    ctx.fillStyle = INK; ctx.fillRect(gx - 1, gy - 1, gw + 2, gh + 2);
    ctx.fillStyle = i % 3 ? '#D1D5DB' : '#57534E'; ctx.fillRect(gx, gy, gw, gh);
    if (i % 3) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(gx, gy, 1, 1); }
  }
  // Arms and legs all over the place, a head up on the bar
  for (let i = 0; i < 14; i++) {
    const lx = L.x1 + 120 + hash(i * 7) * (L.x2 - L.x1 - 260), ly = y - 3 - hash(i + 11) * 6;
    ctx.save(); ctx.translate(lx, ly); ctx.rotate(hash(i + 2) * Math.PI * 2);
    const leg = i % 2 === 0, h = leg ? 8 : 6;
    part(ctx, -12, -3, 24, h, leg ? '#111827' : GUESTS[i % GUESTS.length].suit);
    ink(ctx, () => ctx.roundRect(10, -3, 6, h, 2), leg ? '#0A0A0A' : GUESTS[i % GUESTS.length].skin, 0.8);
    stump(ctx, -15, -3, 4, h);
    ctx.restore();
  }
  head(ctx, L.x1 + 960, y - 124, 9, '#C68642');
  ctx.fillStyle = INK; ctx.fillRect(L.x1 + 951, y - 129, 18, 6); ctx.fillStyle = '#0A0A0A'; ctx.fillRect(L.x1 + 952, y - 128, 16, 4);
  ctx.fillStyle = '#7F0000'; ctx.fillRect(L.x1 + 950, y - 116, 20, 4); ctx.fillRect(L.x1 + 958, y - 116, 3, 30);
  // Fires still going
  for (const fx of [L.x1 + 330, L.x1 + 770, L.x1 + 1150]) drawFire(ctx, fx, y, 52, 80, f, { seed: Math.floor(fx), smoke: 0.6 });
  // Smoke hanging under the ceiling, thinning lower down
  hazeBands(ctx, L.x1 - 60, top + 56, L.x2 - L.x1 + 60, 90, '#281E23', 0.5, 0.15, 5);
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
    ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + 6, yy + 3); ctx.lineTo(x + 2, yy + 8); ctx.closePath();
    ctx.fillStyle = 'rgba(191, 219, 254, 0.85)'; ctx.fill();
    ctx.strokeStyle = 'rgba(30, 58, 138, 0.8)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(Math.round(x + 1), Math.round(yy + 1), 2, 2);
  }
  // Him: a flying kick, feet first; then landed, square to the room, taking it in
  const p = state.player;
  const landed = pose.k >= 1;
  const body = { ...p, pos: { x: -1e6, y: -1e6 }, hidden: false, isGrounded: landed, vel: { x: landed ? 0 : 12, y: landed ? 0 : 6 }, facing: 1 as const, isDivekicking: !landed, invincibilityTimer: 0, hurtTimer: 0, pushbackTimer: 0, isCharging: false, isSliding: false, isUppercutting: false, squash: landed && t < FLIGHT_FRAMES + 8 ? 1 - (t - FLIGHT_FRAMES) / 8 : 0 };
  ctx.save();
  ctx.translate(pose.x + p.width / 2, pose.y + p.height / 2);
  ctx.translate(-(body.pos.x + body.width / 2), -(body.pos.y + body.height / 2));
  drawPlayer(ctx, body, { ...state, deathTimer: 0 }, { currentWeapon: p.currentWeapon, showFilthShield: false, invincibilityEnabled: false });
  ctx.restore();
};

/** What he says coming through the window, over him. */
export const drawLoungeHud = (ctx: Ctx, state: GameState, lg: Lounge) => {
  if (lg.phase !== 'crash' || lg.lineT <= 0 || !lg.line) return;
  const line = sentenceShown(lg.line);
  const pose = crashPose(Math.max(0, lg.t - PARTY_FRAMES));
  const x = Math.max(140, pose.x + 22 - state.camera.x), y = pose.y - 30 - state.camera.y;
  ctx.save();
  ctx.font = 'bold 16px "Press Start 2P"'; ctx.textAlign = 'center';
  ctx.fillStyle = '#000'; ctx.fillText(line, x + 2, y + 2);
  ctx.fillStyle = '#FDE047'; ctx.fillText(line, x, y);
  ctx.restore();
};

/** The wide shot: the volcano, a long way off, quiet; then a blast near the top, right where the lounge is. */
export const drawWideShot = (ctx: Ctx, state: GameState, lg: Lounge) => {
  if (lg.phase !== 'wide') return;
  const W = CANVAS_WIDTH, H = CANVAS_HEIGHT, t = lg.t, f = state.frame;
  const shake = t > BLAST_AT && t < BLAST_AT + 40 ? (hash(t) - 0.5) * 14 : 0;
  // Pulling out from the lounge's window to the whole volcano; later, pushing back in on it
  const cx0 = W / 2, base0 = H - 70;
  const wx0 = cx0 + 40, wy0 = base0 - 280 * 1.05 + 60;
  const ease = (k: number) => k * k * (3 - 2 * k);
  const zoomOut = t < ZOOM_OUT ? 1 - ease(t / ZOOM_OUT) : 0;
  const zoomIn = t > ZOOM_IN_AT ? ease(Math.min(1, (t - ZOOM_IN_AT) / (WIDE_FRAMES - ZOOM_IN_AT - 20))) : 0;
  const zoom = 1 + Math.max(zoomOut, zoomIn) * 11;
  ctx.save();
  // (it fades up over the lounge as the pull-out starts)
  ctx.globalAlpha = Math.min(1, t / 14);
  ctx.translate(shake, shake * 0.5);
  ctx.translate(W / 2, H / 2); ctx.scale(zoom, zoom); ctx.translate(-(W / 2 + (wx0 - W / 2) * Math.min(1, (zoom - 1) / 11)), -(H / 2 + (wy0 - H / 2) * Math.min(1, (zoom - 1) / 11)));
  ctx.fillStyle = '#1E1B4B'; ctx.fillRect(-20, -20, W + 40, H + 40);
  bandedGradient(ctx, -20, 0, W + 40, H + 20, ['#1E1B4B', '#4A2440', '#7C2D12', '#B5431A', '#EA580C'], 14);
  // Stars coming out
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; for (let i = 0; i < 40; i++) ctx.fillRect(hash(i) * W, hash(i + 9) * 200, 2, 2);
  const cx = W / 2, base = H - 70, s = 1.05;
  // The lounge's lit window, near the top (the club all lit up round it)
  const wx = cx + 40, wy = base - 280 * s + 60;
  drawVolcano(ctx, cx, base, s, f, 0, { show: 1, keepClear: { x: wx, y: wy, r: 16 } });
  const blast = blastAmount(lg);
  if (blast < 0.3) {
    // The lounge's window: gold frame, pink light, the party going on behind the glass (this is what the shot pulls out from)
    ctx.fillStyle = INK; ctx.fillRect(wx - 6.5, wy - 5.5, 13, 11);
    ctx.fillStyle = '#CA8A04'; ctx.fillRect(wx - 6, wy - 5, 12, 10);
    ctx.fillStyle = '#FACC15'; ctx.fillRect(wx - 6, wy - 5, 12, 0.5);
    bandedGradient(ctx, wx - 5, wy - 4, 10, 8, ['#A855F7', '#C026D3', Math.floor(f / 10) % 2 ? '#F0ABFC' : '#EC4899'], 4, 0.5);
    ctx.fillStyle = 'rgba(10, 5, 15, 0.75)';
    for (let k = 0; k < 3; k++) { const sx = wx - 4 + ((f * 0.05 + k * 3.3) % 8); ctx.fillRect(sx, wy - 1, 1.2, 5); ctx.beginPath(); ctx.arc(sx + 0.6, wy - 1.8, 0.8, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#FDE047'; ctx.fillRect(wx - 0.3, wy - 4, 0.6, 8);
  }
  // Foreground: the plain the volcano stands on
  // (the curve of it, column by column, a rim of the glow along its top)
  const plain = (x: number) => { const t = (x + 20) / (W + 40); return (1 - t) * (1 - t) * (H - 50) + 2 * t * (1 - t) * (H - 80) + t * t * (H - 40); };
  pixelRidge(ctx, -20, W + 20, H + 20, plain, 0, { fill: '#0C0505', rim: '#3A1410', lit: '#1A0909', shade: '#060202' }, -1);
  if (t >= BLAST_AT) {
    const k = (t - BLAST_AT) / (WIDE_FRAMES - BLAST_AT);
    // The flash
    if (t < BLAST_AT + 10) { ctx.fillStyle = `rgba(255, 255, 240, ${1 - (t - BLAST_AT) / 10})`; ctx.fillRect(-20, -20, W + 40, H + 40); }
    // The fireball, right where the window was: a little one, all on its own
    // (in hard rings: red at the rim, orange, a white-hot heart)
    const r = 18 + Math.min(1, k * 5) * 60;
    steppedGlow(ctx, wx, wy, r, '#B91C1C', Math.max(0, 0.6 - k * 0.6), 0.05, 4);
    steppedGlow(ctx, wx, wy, r * 0.7, '#FB923C', Math.max(0, 0.95 - k), Math.max(0, 0.5 - k), 4);
    steppedGlow(ctx, wx, wy, r * 0.35, '#FFFBEB', Math.max(0, 1 - k * 2), Math.max(0, 0.6 - k * 2), 3);
    // Smoke rolling up out of it
    for (let i = 0; i < 8; i++) {
      const sk = Math.min(1, k * 1.4 + i * 0.05), sr = 10 + sk * 26;
      pixelBlob(ctx, wx + Math.sin(i * 2) * 20 * sk, wy - sk * 120 - i * 10, sr, sr, `rgba(60, 50, 50, ${(0.6 * (1 - sk * 0.5)).toFixed(2)})`, 1);
    }
    // Where the window was: a blackened, smoking hole with a glowing edge (the push back in ends on it)
    if (t > BLAST_AT + 8) {
      ctx.fillStyle = '#0C0A09'; ctx.beginPath(); ctx.ellipse(wx, wy, 8, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(249, 115, 22, ${0.6 + 0.3 * Math.sin(f * 0.3)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(wx, wy, 8, 6, 0, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 5; i++) {
        const sk = ((f * 0.4 + i * 14) % 70) / 70, sr = 3 + sk * 8;
        pixelBlob(ctx, wx + Math.sin(i * 1.7 + f * 0.02) * 4 * sk, wy - 4 - sk * 30, sr, sr, `rgba(70, 60, 60, ${(0.55 * (1 - sk)).toFixed(2)})`, 1);
      }
    }
    // Bits of the lounge flying out
    for (let i = 0; i < 16; i++) {
      const vx = (hash(i) - 0.5) * 6, vy = -2 - hash(i + 4) * 4, tt = (t - BLAST_AT) * 0.8;
      const x = wx + vx * tt, y = wy + vy * tt + 0.05 * tt * tt;
      if (y > base) continue;
      ctx.fillStyle = i % 3 ? '#1C1917' : '#FB923C'; ctx.fillRect(x, y, 3, 3);
    }
  }
  ctx.restore();
  // Letterbox bars: it's a cutscene
  ctx.save();
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 40); ctx.fillRect(0, H - 40, W, 40);
  // A long way off, through a mountain: the screaming
  if (t >= SCREAM_AT && t < ZOOM_IN_AT) {
    ctx.globalAlpha = Math.min(1, (t - SCREAM_AT) / 20, (ZOOM_IN_AT - t) / 20);
    ctx.fillStyle = '#D6D3D1'; ctx.font = 'italic 10px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText('( DISTANT, MUFFLED SCREAMING )', W / 2, H - 16);
  }
  // Down to black at the end, before it comes up on what's left
  if (t > WIDE_FRAMES - 30) { ctx.globalAlpha = 1; ctx.fillStyle = `rgba(0,0,0,${Math.min(1, (t - (WIDE_FRAMES - 30)) / 25)})`; ctx.fillRect(0, 0, W, H); }
  ctx.restore();
};

/** Afterwards: up out of the black onto the lounge. */
export const drawAftermathFade = (ctx: Ctx, lg: Lounge) => {
  if (lg.phase !== 'wrecked' || lg.t >= FADE_IN) return;
  ctx.fillStyle = `rgba(0,0,0,${1 - lg.t / FADE_IN})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
};
