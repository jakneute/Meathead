// The VIP lounge, drawn: in full swing (purple velvet, a neon VIP sign, a bar, a
// DJ, men in suits and sunglasses), Meathead coming in through the window, the
// wide shot of the volcano going off near the top, and the lounge afterwards.

import type { GameState } from '../../core/state';
import { bandedGradient, checker, hazeBands, pixelBlob, steppedGlow } from '../../render/pixelArt';
import { INK, dark, lite, ink, shaded, shadedTop } from '../../render/npc/kit';
import { drawPerson, type PersonSpec, type Pose } from '../../render/npc/person';
import { slab, pipe, column } from '../barry/rooms';
import { neonText, neonStrip } from './clubDraw';
import { drawFire } from '../../render/fx/fire';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../constants';
import { drawPlayer } from '../../render/player/player';
import { COURSE } from './course';
import { Lounge, crashPose, PARTY_FRAMES, FLIGHT_FRAMES, WIDE_FRAMES, BLAST_AT, SCREAM_AT, ZOOM_OUT, ZOOM_IN_AT, FADE_IN, blastAmount } from './lounge';
import { drawWideScene, widePx, wideProfile } from './loungeWide';
import { sentenceShown } from '../../platform/speech';
import { drawSpatter } from '../../render/spatter';
import { furnitureIn, placed } from './furniture';

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
  // The loose furniture (the tsunami knocks it about: see furniture.ts): velvet couches, stools at the bar
  for (const p of furnitureIn(state, 'lounge')) placed(ctx, p, () => (p.kind === 'couch' ? couch(ctx, wrecked) : loungeStool(ctx, wrecked)));
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

/** A velvet couch, standing on (0, 0): a tufted back, the seat cushions, rolled arms; inked, lit from above. */
const couch = (ctx: Ctx, wrecked: boolean) => {
  const cx = -50, y = 0;
  const seat = wrecked ? '#4A1D2E' : '#831843', back = wrecked ? '#3B1424' : '#9D174D';
  shadedTop(ctx, () => ctx.roundRect(cx - 20, y - 90, 140, 36, [8, 8, 0, 0]), back, cx - 20, y - 90, 140, 36);
  for (let k = 0; k < 4; k++) { ctx.fillStyle = dark(back, 0.4); ctx.fillRect(cx + k * 32, y - 76, 3, 3); }
  shadedTop(ctx, () => ctx.rect(cx - 20, y - 60, 140, 60), seat, cx - 20, y - 60, 140, 60);
  for (const sx of [cx + 26, cx + 72]) { ctx.fillStyle = dark(seat, 0.35); ctx.fillRect(sx, y - 58, 2, 22); }
  ctx.fillStyle = dark(seat, 0.35); ctx.fillRect(cx - 18, y - 36, 136, 2);
  for (const ax of [cx - 28, cx + 112]) shaded(ctx, () => ctx.roundRect(ax, y - 70, 16, 70, [8, 8, 2, 2]), back, ax, y - 70, 16, 70);
  if (wrecked) for (let i = 0; i < 5; i++) { const sx = cx + i * 26, sy = y - 70 + (i % 2) * 10; ctx.fillStyle = INK; ctx.fillRect(sx - 1, sy - 1, 10, 6); ctx.fillStyle = '#FDE68A'; ctx.fillRect(sx, sy, 8, 4); ctx.fillStyle = '#FFFBEB'; ctx.fillRect(sx, sy, 4, 2); } // stuffing out of it
};

/** A bar stool in the lounge, standing on (0, 0): a gold post and foot, a round velvet seat. */
const loungeStool = (ctx: Ctx, wrecked: boolean) => {
  const seat = wrecked ? '#3B1A40' : '#6B21A8';
  ctx.fillStyle = INK; ctx.fillRect(-9, -3, 18, 3); ctx.fillStyle = '#A16207'; ctx.fillRect(-8, -2, 16, 1);
  column(ctx, -2, -30, 5, 28, wrecked ? '#713F12' : '#CA8A04');
  ctx.fillStyle = INK; ctx.fillRect(-8, -16, 16, 2); ctx.fillStyle = '#A16207'; ctx.fillRect(-7, -16, 14, 1); // (the foot ring)
  shadedTop(ctx, () => ctx.roundRect(-12, -36, 24, 7, [4, 4, 2, 2]), seat, -12, -36, 24, 7);
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
    // (thrown out from the middle of the room, on the wall: running down it)
    drawSpatter(ctx, { x, y: sy, size: 4 + (rw + rh) * 0.28, seed: 285 + i, dx: Math.sign(x - (L.x1 + L.x2) / 2) * 0.6, dy: -0.2, clip: [L.x1, top + 90, L.x2 - L.x1, y - top - 90], color: '#8B0000' });
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

// ---------------------------------------------------------------------------
// The blast, painted like the rest of the shot
// ---------------------------------------------------------------------------

/** Fire cooling to smoke, hottest first: white-hot, yellow, orange, deep orange, red, maroon, then the smoke. */
const BLAST_RAMP = ['#FFFBEB', '#FEF08A', '#FDE047', '#FB923C', '#EA580C', '#B91C1C', '#6B1D2A', '#3A2233', '#2A2030'];
const heatColor = (h: number, step = 0) => BLAST_RAMP[Math.max(0, Math.min(BLAST_RAMP.length - 1, Math.round((1 - h) * (BLAST_RAMP.length - 1)) + step))];
const BLAST_PUFFS = 22, BLAST_R = 44;

/**
 * The VIP lounge going up, `d` frames in, in the wide shot's own chunky pixels (`px`): a ring of shock racing out over
 * the mountain; a fireball of billows, each lit hot up its top-left and cooler round its edge, the hottest in the
 * middle, swelling out fast and cooling down the ramp through orange and red to smoke; the whole of it rising into a
 * mushroom and leaning off on the wind, its underside still lit by the fire; burning wreckage thrown out in arcs,
 * trailing smoke, coming down on the slope and smoldering where it lands; fire licking out of the hole it's left.
 */
const drawLoungeBlast = (ctx: Ctx, wx: number, wy: number, d: number, f: number, px: number) => {
  px = Math.max(0.5, px);
  const snap = (v: number) => Math.round(v / px) * px;
  // The shock ring, racing out over the rock (squashed: it's along the slope)
  if (d < 26) {
    const rr = 10 + d * 7, a = 1 - d / 26;
    ctx.strokeStyle = `rgba(255, 236, 190, ${(0.85 * a).toFixed(2)})`; ctx.lineWidth = px * 2;
    ctx.beginPath(); ctx.ellipse(snap(wx), snap(wy), rr, rr * 0.45, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = `rgba(251, 146, 60, ${(0.5 * a).toFixed(2)})`; ctx.lineWidth = px;
    ctx.beginPath(); ctx.ellipse(snap(wx), snap(wy), rr * 0.82, rr * 0.37, 0, 0, Math.PI * 2); ctx.stroke();
  }
  // The glow off it on everything round it, in rings (dying down as it cools to smoke)
  const glowK = Math.max(0, 1 - d / 140);
  if (glowK > 0) steppedGlow(ctx, wx, wy - d * 0.25, 70 + d * 0.4, '#FB923C', 0.05 * glowK, 0.32 * glowK, 5);

  // The billows: where each one is, how big, how hot
  const grow = 1 - Math.pow(1 - Math.min(1, d / 16), 3);
  const lift = d * 0.42 + d * d * 0.0022, drift = d * d * 0.0026;
  const puffs: { x: number; y: number; r: number; h: number; o: number }[] = [];
  for (let i = 0; i < BLAST_PUFFS; i++) {
    const a = hash(i * 3 + 1) * Math.PI * 2, o = Math.sqrt(hash(i * 3 + 2));
    const up = 0.5 - Math.sin(a) * 0.5;
    // (the top of it rising faster than the bottom: it draws up into a column with a cap on it)
    const rise = lift * (0.55 + up * 0.75) + Math.max(0, d - 20) * up * 0.35;
    const spread = BLAST_R * o * grow * (1 + Math.max(0, d - 30) * 0.004) * (1 + up * Math.min(1, d / 90) * 0.5);
    const x = wx + Math.cos(a) * spread + drift * (0.5 + up * 0.8) + Math.sin(f * 0.05 + i) * 1.5;
    const y = wy + Math.sin(a) * spread * 0.85 - rise;
    const r = (8 + hash(i * 3 + 3) * 10) * (0.45 + grow * 0.55) * (1 + d * 0.006);
    const h = Math.max(0, 1.15 - d / (34 + hash(i + 50) * 34) - o * 0.35);
    puffs.push({ x, y, r, h, o });
  }
  // (the cool, outer ones first; the white-hot heart last, on top)
  puffs.sort((p, q) => p.h - q.h || q.o - p.o);
  for (const b of puffs) {
    if (b.h > 0.08) {
      // Fire: its cooler edge, the body, the hot top-left, a white-hot fleck while it's at its hottest
      pixelBlob(ctx, b.x, b.y, b.r, b.r * 0.9, heatColor(b.h, 2), px);
      pixelBlob(ctx, b.x - b.r * 0.12, b.y - b.r * 0.12, b.r * 0.78, b.r * 0.7, heatColor(b.h), px);
      pixelBlob(ctx, b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.38, b.r * 0.3, heatColor(b.h, -2), px);
      if (b.h > 0.85) pixelBlob(ctx, b.x - b.r * 0.4, b.y - b.r * 0.42, b.r * 0.18, b.r * 0.14, '#FFFFFF', px);
    } else {
      // Smoke, the same as the volcano's own plume: lit warm from under by what's still burning below it, a cold
      // touch of moonlight on its top, thinning out as it climbs (and swelling: the billows run into one cloud)
      const warm = Math.max(0, 1 - d / 150), t = Math.min(1, d / 220), a = 0.82 * (1 - t * 0.55), r = b.r * (1.15 + d * 0.004);
      pixelBlob(ctx, b.x, b.y + r * 0.15, r, r * 0.8, `rgba(${Math.round(120 + warm * 110)}, ${Math.round(50 + warm * 40)}, ${Math.round(40 + warm * 10)}, ${(a * 0.6).toFixed(2)})`, px);
      pixelBlob(ctx, b.x - r * 0.08, b.y - r * 0.05, r * 0.88, r * 0.7, `rgba(${Math.round(46 + t * 30)}, ${Math.round(36 + t * 30)}, ${Math.round(48 + t * 34)}, ${a.toFixed(2)})`, px);
      pixelBlob(ctx, b.x - r * 0.3, b.y - r * 0.35, r * 0.4, r * 0.25, `rgba(130, 136, 176, ${(a * 0.3).toFixed(2)})`, px);
    }
  }

  // Wreckage: thrown out in arcs (some of it on fire, trailing smoke), down onto the slope, smoldering where it lands
  for (let i = 0; i < 18; i++) {
    const vx = (hash(i + 70) - 0.5) * 5.5, vy = -1.5 - hash(i + 90) * 4.5, g = 0.06;
    let tt = d * 0.85, x = wx + vx * tt, y = wy + vy * tt + g * tt * tt;
    let landed = false;
    const ground = wideProfile(x);
    if (y > ground) {
      // (where it came down: solve for the landing, crudely, and sit it there)
      for (let k = tt; k > 0; k -= 1) { const xx = wx + vx * k, yy = wy + vy * k + g * k * k; if (yy <= wideProfile(xx)) { tt = k; break; } }
      x = wx + vx * tt; y = wideProfile(x); landed = true;
    }
    const burning = i % 3 !== 0, sz = (i % 4 === 0 ? 3 : 2) * px;
    if (landed) {
      if (burning && (f + i * 7) % 20 < 14) { ctx.fillStyle = (f + i) % 8 < 4 ? '#FB923C' : '#EA580C'; ctx.fillRect(snap(x), snap(y - px), px, px); }
      continue;
    }
    // (its smoke trail: dithered dots back along the arc)
    for (let s2 = 1; s2 <= 4; s2++) {
      const k = Math.max(0, tt - s2 * 2.5), sx = wx + vx * k, sy = wy + vy * k + g * k * k;
      ctx.fillStyle = s2 < 2 && burning ? '#B91C1C' : `rgba(58, 34, 51, ${(0.8 - s2 * 0.17).toFixed(2)})`;
      ctx.fillRect(snap(sx), snap(sy), px, px);
    }
    ctx.fillStyle = INK; ctx.fillRect(snap(x) - px * 0.5, snap(y) - px * 0.5, sz + px, sz + px);
    ctx.fillStyle = burning ? ((f + i) % 6 < 3 ? '#FDE047' : '#FB923C') : '#57534E'; ctx.fillRect(snap(x), snap(y), sz, sz);
  }

  // Where the window was (once the fireball's lifted off it): a black hole in the rock, its edge glowing, fire licking
  // out of it and smoke trickling up
  if (d > 36) {
    ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(wx, wy, 9, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0C0A09'; ctx.beginPath(); ctx.ellipse(wx, wy + 0.5, 8, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = (f >> 3) % 2 ? '#EA580C' : '#F97316'; ctx.lineWidth = px;
    ctx.beginPath(); ctx.ellipse(wx, wy, 8.5, 6.5, 0, Math.PI * 0.95, Math.PI * 2.05); ctx.stroke();
    for (let k = 0; k < 4; k++) {
      const lick = 3 + ((f * 0.4 + k * 5) % 6), fx = wx - 5 + k * 3.3;
      pixelBlob(ctx, fx, wy - 4 - lick * 0.5, 1.6, lick * 0.6, k % 2 ? '#EA580C' : '#FB923C', px);
      pixelBlob(ctx, fx, wy - 3 - lick * 0.25, 0.9, lick * 0.3, '#FDE047', px);
    }
    for (let i = 0; i < 5; i++) {
      const sk = ((f * 0.4 + i * 14) % 70) / 70, sr = 3 + sk * 8;
      pixelBlob(ctx, wx + Math.sin(i * 1.7 + f * 0.02) * 4 * sk + sk * sk * 10, wy - 8 - sk * 34, sr, sr * 0.85, `rgba(${Math.round(140 - sk * 80)}, ${Math.round(60 - sk * 20)}, ${Math.round(50 - sk * 4)}, ${(0.6 * (1 - sk)).toFixed(2)})`, px);
    }
  }
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
  // (what's in view, in the scene's own units, and how fine to draw it at this zoom)
  const kz = Math.min(1, (zoom - 1) / 11), vcx = W / 2 + (wx0 - W / 2) * kz, vcy = H / 2 + (wy0 - H / 2) * kz;
  const view = { x0: vcx - W / 2 / zoom - 20, x1: vcx + W / 2 / zoom + 20, y0: vcy - H / 2 / zoom - 20, y1: vcy + H / 2 / zoom + 20, zoom, px: widePx(zoom) };
  // (the lounge's window, near the top: what the shot pulls out from)
  const wx = wx0, wy = wy0;
  const blast = blastAmount(lg);
  const flash = t >= BLAST_AT ? Math.max(0, 1 - (t - BLAST_AT) / 70) : 0;
  drawWideScene(ctx, view, f, wx, wy, flash, t > BLAST_AT + 8);
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
  if (t >= BLAST_AT) {
    drawLoungeBlast(ctx, wx, wy, t - BLAST_AT, f, view.px);
    // The flash, over all of it
    if (t < BLAST_AT + 10) { ctx.fillStyle = `rgba(255, 255, 240, ${1 - (t - BLAST_AT) / 10})`; ctx.fillRect(-20, -20, W + 40, H + 40); }
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
