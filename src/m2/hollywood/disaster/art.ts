// Disaster: The Ride, drawn (the crude first pass: readable boxes and the park's letters). Indoors: the lobby (maroon,
// the queue's switchbacks and its guests, the monitors' truss, the LAVA NACHOS counter, the franchise's posters), the
// pre-show (CHIP CHADWICK on the big TV), the theater (a black box: the big screen and its cheesy footage, the
// effects under it, the lean rails, the guests standing about, the road cases and the truss up to the catwalks, the
// flying cow, the booth with its sleeper and its lever). Once it's REAL: cracked, burnt, frosted, flooded, the screen
// torn, the booth under the truss, the far wall out flat on the lot and the red sky through the hole.
//
// Standable reads standable (lit lips on the cases, the truss, the catwalks, the rails); the catwalks' handrails are
// dim (not a ledge). The signs in the park's letters, on boards hung or held up.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { box, steveFlier } from '../section';
import { drawPerson } from '../../adventure/temple/people';
import { words, print, enamel, marquee, ledgeLip, velvetRope, signW } from '../blvd/paint';
import {
  X, Y, GY, LOBBY, PRESHOW, THEATER, FAR_WALL, SCREEN, FX, CAT_L, CAT_R, BOOTH, COW_AT, QUEUE_RAILS, RAIL_H, LEAN_RAILS,
  WATCHERS, PRESHOW_WATCHERS, LEDGES, HORNS, REAL_LEVER,
} from './layout';
import { throwAngle } from '../lever';
import type { Dz } from './state';
import { DISASTERS, FX_LEN } from './show';

type Ctx = CanvasRenderingContext2D;

const viewOf = (state: GameState) => state.view ?? { x: state.camera.x, y: state.camera.y, w: 800, h: 600 };
const seen = (state: GameState, a: number, b: number) => { const v = viewOf(state); return b > v.x - 80 && a < v.x + v.w + 80; };

/** A board hung on two chains from the ceiling, its words on it (the park's letters). */
const hung = (c: Ctx, x: number, y: number, text: string, L: ReturnType<typeof print>, board: string, ceilY: number) => {
  const w = signW(text, L) + 24, h = (L.sy ?? 1) * 7 + 14;
  for (const s of [-1, 1]) box(c, x + s * (w / 2 - 10) - 1, ceilY, 2, y - ceilY, '#57534E');
  box(c, x - w / 2 - 2, y - 2, w + 4, h + 4, '#000'); box(c, x - w / 2, y, w, h, board);
  words(c, text, x, y + h - 7, L);
};
/** A sign on a little stand on the floor. */
const stand = (c: Ctx, x: number, lines: string[], L: ReturnType<typeof print>, board = '#18181B') => {
  const w = Math.max(...lines.map(t => signW(t, L))) + 18, lh = (L.sy ?? 1) * 7 + 5, h = lines.length * lh + 10, top = GY - 60 - h;
  box(c, x - 2, top + h, 4, 60, '#57534E'); box(c, x - 14, GY - 4, 28, 4, '#44403C');
  box(c, x - w / 2 - 2, top - 2, w + 4, h + 4, '#000'); box(c, x - w / 2, top, w, h, board);
  lines.forEach((t, i) => words(c, t, x, top + 6 + (i + 1) * lh - 4, L));
};

// ---------------------------------------------------------------------------------------------------------------
// Screen space

export const drawDisasterBackdrop = (c: Ctx) => {
  c.fillStyle = '#0C0A09'; c.fillRect(0, 0, 800, 600);
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// The footage on the big screen (cheesy, stock, 1983): which disaster, how far in

const footage = (c: Ctx, x: number, y: number, w: number, h: number, beat: number, k: number, f: number) => {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  const mx = x + w / 2, gy = y + h * 0.78;
  if (k < 0) {
    // (between them: the title card)
    box(c, x, y, w, h, '#1E1B4B');
    words(c, 'DISASTER:', mx, y + h * 0.45, marquee(3, 4, '#F97316', f % 40 < 30));
    words(c, 'THE RIDE', mx, y + h * 0.45 + 40, enamel({ sx: 3, sy: 3 }, '#FDE68A', '#000'));
    words(c, 'PLEASE STAND BY', mx, y + h - 24, print(2, '#A5B4FC'));
  } else if (beat === 0) {
    box(c, x, y, w, h, '#7DD3FC'); box(c, x, gy, w, h, '#65A30D');
    c.save(); c.translate(mx, gy); c.rotate(Math.sin(f * 0.5) * 0.05);
    box(c, -90, -110, 180, 110, '#FEF3C7'); c.fillStyle = '#B91C1C'; c.beginPath(); c.moveTo(-110, -110); c.lineTo(0, -180); c.lineTo(110, -110); c.closePath(); c.fill();
    box(c, -60, -80, 40, 36, '#38BDF8'); box(c, 20, -80, 40, 36, '#38BDF8'); box(c, -16, -50, 32, 50, '#78350F');
    c.restore();
    c.strokeStyle = '#1C1917'; c.lineWidth = 4; c.beginPath(); c.moveTo(x + 60, gy + 10); for (let i = 1; i < 10; i++) c.lineTo(x + 60 + i * 100, gy + 10 + (i % 2 ? 14 : -4)); c.stroke();
  } else if (beat === 1) {
    box(c, x, y, w, h, '#7C2D12'); box(c, x, gy, w, h, '#292524');
    c.fillStyle = '#44403C'; c.beginPath(); c.moveTo(mx - 260, gy); c.lineTo(mx - 50, y + 70); c.lineTo(mx + 50, y + 70); c.lineTo(mx + 260, gy); c.closePath(); c.fill();
    c.fillStyle = '#F97316'; c.beginPath(); c.moveTo(mx - 50, y + 70); c.lineTo(mx + 50, y + 70); c.lineTo(mx + 20, y + 130); c.lineTo(mx - 20, y + 120); c.closePath(); c.fill();
    for (let i = 0; i < 7; i++) { const t = ((f * 2 + i * 37) % 120) / 120; c.fillStyle = i % 2 ? '#FDE047' : '#EF4444'; c.beginPath(); c.arc(mx + Math.sin(i * 2.3) * 70 * t, y + 70 - t * 60 + t * t * 80, 10, 0, Math.PI * 2); c.fill(); }
  } else if (beat === 2) {
    box(c, x, y, w, h, '#475569'); box(c, x, gy, w, h, '#4D7C0F');
    const tx = mx + Math.sin(f * 0.02) * 260;
    for (let i = 0; i < 9; i++) { c.fillStyle = i % 2 ? '#94A3B8' : '#64748B'; c.beginPath(); c.ellipse(tx + Math.sin(f * 0.2 + i) * 6, y + 30 + i * 24, 110 - i * 11, 14, 0, 0, Math.PI * 2); c.fill(); }
    // (the cow, round and round it)
    const a = f * 0.12, cx = tx + Math.cos(a) * 120, cy = y + 90 + Math.sin(a) * 30;
    box(c, cx - 22, cy - 12, 44, 24, '#F8FAFC'); box(c, cx - 8, cy - 10, 12, 10, '#1C1917'); box(c, cx + 20, cy - 16, 14, 14, '#F8FAFC'); box(c, cx - 18, cy + 12, 6, 10, '#F8FAFC'); box(c, cx + 12, cy + 12, 6, 10, '#F8FAFC');
  } else if (beat === 3) {
    box(c, x, y, w, h, '#CBD5E1'); box(c, x, gy, w, h, '#F8FAFC');
    c.fillStyle = '#94A3B8'; c.beginPath(); c.moveTo(x + 100, gy); c.lineTo(x + 330, y + 60); c.lineTo(x + 560, gy); c.closePath(); c.fill();
    // (a sad snowman)
    c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(x + w - 220, gy - 30, 34, 0, Math.PI * 2); c.arc(x + w - 220, gy - 86, 24, 0, Math.PI * 2); c.fill();
    box(c, x + w - 228, gy - 90, 4, 4, '#000'); box(c, x + w - 214, gy - 90, 4, 4, '#000');
    for (let i = 0; i < 60; i++) box(c, x + ((i * 97 + f * 3) % w), y + ((i * 53 + f * 4) % h), 4, 4, '#FFFFFF');
  } else if (beat === 4) {
    box(c, x, y, w, h, '#93C5FD');
    const lvl = gy - 40 - Math.sin(f * 0.03) * 20;
    c.fillStyle = '#1D4ED8'; c.beginPath(); c.moveTo(x, y + h); for (let i = 0; i <= 22; i++) c.lineTo(x + i * (w / 22), lvl + Math.sin(f * 0.1 + i) * 10); c.lineTo(x + w, y + h); c.closePath(); c.fill();
    // (a car, floating by)
    const cx = x + ((f * 1.5) % (w + 200)) - 100;
    box(c, cx, lvl - 26, 90, 26, '#DC2626'); box(c, cx + 18, lvl - 46, 50, 22, '#DC2626'); box(c, cx + 24, lvl - 42, 38, 14, '#BAE6FD');
  } else {
    box(c, x, y, w, h, '#431407'); box(c, x, gy, w, h, '#1C1917');
    for (let i = 0; i < 9; i++) {
      const tx = x + 60 + i * 120;
      box(c, tx - 6, gy - 80, 12, 80, '#292524');
      c.fillStyle = '#14532D'; c.beginPath(); c.moveTo(tx - 40, gy - 60); c.lineTo(tx, gy - 170); c.lineTo(tx + 40, gy - 60); c.closePath(); c.fill();
      c.fillStyle = (f + i * 7) % 10 < 5 ? '#F97316' : '#FDE047'; c.beginPath(); c.moveTo(tx - 24, gy - 130); c.quadraticCurveTo(tx, gy - 210 - (f + i * 13) % 20, tx + 24, gy - 130); c.closePath(); c.fill();
    }
  }
  // (the tape: the scanlines, the wobble line, the watermark)
  c.fillStyle = 'rgba(0, 0, 0, 0.18)'; for (let sy = y; sy < y + h; sy += 4) c.fillRect(x, sy, w, 2);
  box(c, x, y + ((f * 3) % h), w, 3, 'rgba(255, 255, 255, 0.15)');
  if (k >= 0) { words(c, `${DISASTERS[beat]}!`, x + 20, y + 30, enamel({ sx: 2, sy: 3 }, '#FDE047', '#000'), 'left'); words(c, 'STOCK FOOTAGE 1983', x + w - 16, y + h - 12, print(1, 'rgba(255,255,255,0.6)'), 'right'); }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The rooms

const floor = (c: Ctx, a: number, b: number, col: string, lip: string) => { box(c, a, GY, b - a, 400, col); box(c, a, GY, b - a, 4, lip); };
/** A room's back wall and ceiling (the ceiling's height). */
const room = (c: Ctx, a: number, b: number, ceil: number, wall: string, trim: string) => {
  box(c, a, Y(ceil), b - a, ceil, wall);
  box(c, a, Y(ceil) - 40, b - a, 40, '#1C1917'); box(c, a, Y(ceil), b - a, 6, trim);
  box(c, a, GY - 18, b - a, 18, trim);
  box(c, a, Y(ceil) - 1400, b - a, 1360, '#0C0A09');
};

const drawLobby = (c: Ctx, state: GameState, o: Dz, real: boolean) => {
  const f = state.frame, ceil = Y(LOBBY.ceil);
  room(c, X(-200), X(LOBBY.b), LOBBY.ceil, '#4C0519', '#7F1D1D');
  // (the doors out to the backlot, at the left: daylight through them)
  box(c, X(20), GY - 150, 100, 150, '#000'); box(c, X(26), GY - 144, 88, 144, real ? '#7C2D12' : '#FDE68A'); box(c, X(68), GY - 144, 4, 144, '#000');
  words(c, 'TO THE BACKLOT', X(70), GY - 160, print(1, '#FEF3C7', '#000'));
  // The ride's name over the lobby, in bulbs (askew once it's real)
  c.save(); if (real) { c.translate(X(330), ceil + 70); c.rotate(0.06); c.translate(-X(330), -(ceil + 70)); }
  box(c, X(70), ceil + 30, 520, 84, '#000'); box(c, X(74), ceil + 34, 512, 76, '#1C1917');
  words(c, 'DISASTER:', X(330), ceil + 72, marquee(3, 4, '#F97316', !real || f % 30 < 12));
  words(c, 'THE RIDE', X(330), ceil + 102, enamel({ sx: 3, sy: 3 }, '#FDE68A', '#000'));
  c.restore();
  // The franchise's posters on the wall (absurd sequel numbers)
  const POSTERS: [number, string, string, string][] = [[1460, 'FLOOD 4', 'STILL WET', '#1D4ED8'], [1800, 'RIDE 2', 'COMING SOON SINCE 1991', '#4338CA']];
  for (const [rx, t1, t2, col] of POSTERS) {
    box(c, X(rx) - 52, GY - 230, 104, 140, '#000'); box(c, X(rx) - 48, GY - 226, 96, 132, col);
    words(c, t1, X(rx), GY - 196, print(1, '#FDE047', '#000')); words(c, t2, X(rx), GY - 110, print(1, '#F8FAFC', '#000'));
  }
  // WAIT FROM HERE, hung over the start of the switchbacks
  hung(c, X(1150), ceil + 130, 'WAIT FROM HERE: 90 MINUTES', print(2, '#18181B'), '#FDE047', ceil);
  // The switchbacks: the ropes between the rails (behind), the rails (they're solid: a lit top)
  velvetRope(c, X(QUEUE_RAILS[0]), X(QUEUE_RAILS[QUEUE_RAILS.length - 1]), GY - 18);
  for (const rx of QUEUE_RAILS) { box(c, X(rx) - 6, Y(RAIL_H), 12, RAIL_H, '#000'); box(c, X(rx) - 5, Y(RAIL_H) + 1, 10, RAIL_H, '#A16207'); box(c, X(rx) - 6, Y(RAIL_H), 12, 3, '#FDE68A'); }
  // The queue's guests (shoved aside, mad)
  for (const g of o.guests) {
    const x = X(g.rx) + (g.shove > 0 ? g.dir * (30 - g.shove) * 1.2 : 0);
    c.save(); c.translate(x, GY); c.scale(g.seed % 2 ? 0.92 : -0.92, 0.92);
    drawPerson(c, { seed: g.seed, outfit: 'guest', f, pose: g.mad > 0 ? 'point' : g.seed % 4 === 0 ? 'photo' : 'stand', mood: g.mad > 0 ? 'angry' : 'bored', shorts: g.seed % 3 === 0, talking: g.mad > 0 && f % 10 < 5 });
    c.restore();
  }
  // The monitors' truss (a ledge: lit), the teaser on the monitors under it
  const gt = LEDGES[0];
  for (const cx of [X(gt[0]) + 10, X(gt[0]) + gt[2] - 14]) box(c, cx, ceil, 4, Y(gt[1]) - ceil, '#3F3F46');
  ledgeLip(c, X(gt[0]), Y(gt[1]), gt[2], '#3F3F46', '#FDE68A');
  for (const k of [0, 1]) {
    const mx = X(gt[0]) + 30 + k * 100;
    box(c, mx, Y(gt[1]) + 16, 70, 50, '#000');
    if (real) { for (let i = 0; i < 12; i++) box(c, mx + 4 + ((i * 23 + f * 7) % 60), Y(gt[1]) + 20 + ((i * 11 + f * 3) % 40), 4, 3, i % 2 ? '#F5F5F4' : '#71717A'); }
    else { box(c, mx + 4, Y(gt[1]) + 20, 62, 42, '#1E1B4B'); words(c, 'DISASTER!', mx + 35, Y(gt[1]) + 44, print(1, '#F97316')); words(c, 'MILDLY', mx + 35, Y(gt[1]) + 56, print(1, '#FDE68A')); }
  }
  // The concession counter: LAVA NACHOS
  box(c, X(1560), Y(60), 150, 60, '#000'); box(c, X(1562), Y(58), 146, 58, '#92400E'); box(c, X(1560), Y(60), 150, 4, '#FDE68A');
  words(c, 'LAVA NACHOS $14', X(1635), Y(20), print(1, '#FDE047', '#000'));
  hung(c, X(1635), ceil + 60, 'DISASTER SNACKS', enamel({ sx: 1, sy: 2 }, '#FDE68A', '#000'), '#7F1D1D', ceil);
  // Steve: a standee in the queue, a poster by the pre-show
  steveFlier(c, X(1340), GY, 'standee', 2);
  // The PA's horns
  for (const rx of HORNS) { box(c, X(rx) - 6, ceil + 6, 12, 10, '#52525B'); c.fillStyle = '#71717A'; c.beginPath(); c.moveTo(X(rx) - 10, ceil + 16); c.lineTo(X(rx) + 10, ceil + 16); c.lineTo(X(rx) + 16, ceil + 32); c.lineTo(X(rx) - 16, ceil + 32); c.closePath(); c.fill(); }
  // Real: cracks, a ceiling tile down
  if (real) {
    c.strokeStyle = '#0C0A09'; c.lineWidth = 3; c.beginPath();
    for (const rx of [380, 1100, 1700]) { c.moveTo(X(rx), ceil + 10); c.lineTo(X(rx) + 30, ceil + 80); c.lineTo(X(rx) + 10, ceil + 140); c.lineTo(X(rx) + 50, ceil + 220); }
    c.stroke();
    c.save(); c.translate(X(1180), GY - 6); c.rotate(0.2); box(c, -40, -8, 80, 10, '#D6D3D1'); c.restore();
  }
  floor(c, X(-200), X(LOBBY.b), '#3F0D12', '#9F1239');
};

const drawPreshow = (c: Ctx, state: GameState, o: Dz, real: boolean) => {
  const f = state.frame, ceil = Y(PRESHOW.ceil), tx = X(PRESHOW.tv);
  room(c, X(PRESHOW.a), X(PRESHOW.b), PRESHOW.ceil, '#1E1B4B', '#312E81');
  // (the doorway in from the lobby: a frame)
  box(c, X(PRESHOW.a) - 6, ceil, 12, GY - ceil, '#0C0A09');
  hung(c, X(PRESHOW.a + 120), ceil + 50, 'PRE-SHOW', enamel({ sx: 2, sy: 2 }, '#FDE68A', '#000'), '#312E81', ceil);
  // The big TV, hung off the ceiling: CHIP CHADWICK (very excited), or static once it's real
  c.save(); if (real) { c.translate(tx, ceil); c.rotate(-0.08); c.translate(-tx, -ceil); }
  for (const s of [-1, 1]) box(c, tx + s * 80 - 2, ceil, 4, 50, '#57534E');
  box(c, tx - 130, ceil + 46, 260, 190, '#000'); box(c, tx - 124, ceil + 52, 248, 178, '#27272A');
  const sx = tx - 112, sy = ceil + 62, sw = 224, sh = 150;
  if (real) {
    box(c, sx, sy, sw, sh, '#3F3F46');
    for (let i = 0; i < 70; i++) box(c, sx + ((i * 37 + f * 11) % sw), sy + ((i * 23 + f * 5) % sh), 5, 3, i % 3 ? '#E7E5E4' : '#71717A');
  } else {
    box(c, sx, sy, sw, sh, '#F97316'); box(c, sx, sy + sh - 40, sw, 40, '#7C2D12');
    // (Chip: the hair helmet, the huge grin, the tan, the finger guns)
    const talk = !!o.host && f % 8 < 4, hx = sx + sw / 2, hy = sy + 70;
    box(c, hx - 50, hy + 34, 100, 60, '#1D4ED8'); box(c, hx - 8, hy + 34, 16, 30, '#F8FAFC'); box(c, hx - 3, hy + 38, 6, 22, '#DC2626');
    c.fillStyle = '#D6A27A'; c.beginPath(); c.ellipse(hx, hy, 34, 40, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#3F2A14'; c.beginPath(); c.ellipse(hx - 4, hy - 34, 40, 18, -0.1, 0, Math.PI * 2); c.fill();
    box(c, hx - 18, hy - 8, 10, 6, '#FFFFFF'); box(c, hx + 8, hy - 8, 10, 6, '#FFFFFF'); box(c, hx - 15, hy - 7, 4, 4, '#000'); box(c, hx + 11, hy - 7, 4, 4, '#000');
    box(c, hx - 18, hy + 12, 36, talk ? 14 : 8, '#7F1D1D'); box(c, hx - 16, hy + 12, 32, 4, '#FFFFFF');
    for (const s of [-1, 1]) { box(c, hx + s * 62 - 8, hy + 40, 16, 12, '#D6A27A'); box(c, hx + s * 62 + (s > 0 ? 0 : -10), hy + 42, 10, 4, '#D6A27A'); }
    words(c, 'CHIP CHADWICK', sx + sw / 2, sy + sh - 10, print({ sx: 1, sy: 2 }, '#FDE047', '#000'));
    c.fillStyle = 'rgba(0, 0, 0, 0.16)'; for (let yy = sy; yy < sy + sh; yy += 4) c.fillRect(sx, yy, sw, 2);
  }
  c.restore();
  // The guests watching it (bored)
  for (const [rx, seed] of PRESHOW_WATCHERS) { c.save(); c.translate(X(rx), GY); c.scale(rx < PRESHOW.tv ? 0.9 : -0.9, 0.9); drawPerson(c, { seed, outfit: 'guest', f, pose: real ? 'point' : 'stand', mood: real ? 'scared' : 'bored', shorts: seed % 3 === 0 }); c.restore(); }
  steveFlier(c, X(2530), GY - 170, 'poster', 1);
  // The theater's doors (swinging open as he barges through)
  const dx = X(PRESHOW.b), sw2 = o.doorT;
  box(c, dx - 70, GY - 170, 140, 170, '#000');
  box(c, dx - 64, GY - 164, 128, 164, real ? '#450A0A' : '#0C0A09');
  for (const s of [-1, 1]) { const w = 60 * (1 - sw2 * 0.8); box(c, s < 0 ? dx - 62 : dx + 62 - w, GY - 162, w, 162, '#7F1D1D'); box(c, s < 0 ? dx - 62 + w - 6 : dx + 62 - w + 2, GY - 100, 4, 14, '#FDE68A'); }
  hung(c, dx, GY - 214, 'THEATER', enamel({ sx: 2, sy: 2 }, '#F97316', '#000'), '#1C1917', ceil);
  floor(c, X(PRESHOW.a), X(PRESHOW.b), '#1E1B4B', '#6366F1');
};

/** The effects under the screen: the heater (and the red gel), the fan, the AC, the squirt nozzle, the fogger. */
const drawEffects = (c: Ctx, state: GameState, o: Dz, beat: number, k: number) => {
  const f = state.frame, r = o.real, wreck = r.phase !== 'off';
  const on = (b: number) => !wreck && beat === b && k >= 0 && k < FX_LEN - 40;
  // (the heater: a little grille box, its coils glowing on; burnt black and burning once it's real)
  const hx = X(FX.heater);
  box(c, hx - 24, GY - 52, 48, 52, '#000'); box(c, hx - 22, GY - 50, 44, 48, wreck ? '#1C1917' : '#A8A29E');
  for (let i = 0; i < 4; i++) box(c, hx - 18, GY - 44 + i * 10, 36, 3, wreck ? '#44403C' : on(1) ? (f % 10 < 5 ? '#F97316' : '#EF4444') : '#57534E');
  words(c, 'VOLCANO', hx, GY - 58, print(1, '#FCA5A5', '#000'));
  // (the red gel lamp on its stand over it)
  box(c, hx + 34, GY - 140, 4, 140, '#3F3F46'); box(c, hx + 24, GY - 156, 24, 18, '#27272A');
  box(c, hx + 26, GY - 154, 20, 14, wreck ? '#1C1917' : on(1) ? '#EF4444' : '#7F1D1D');
  // (the desk fan on its stool: gone once it's real (the bracket left))
  const fx = X(FX.fan);
  box(c, fx - 14, GY - 40, 28, 40, '#78350F'); box(c, fx - 18, GY - 44, 36, 6, '#92400E');
  box(c, fx - 3, GY - 70, 6, 26, '#52525B');
  if (!wreck || (r.phase === 'on' && r.step < 4)) {
    c.save(); c.translate(fx, GY - 86);
    c.fillStyle = '#000'; c.beginPath(); c.arc(0, 0, 22, 0, Math.PI * 2); c.fill(); c.fillStyle = '#E2E8F0'; c.beginPath(); c.arc(0, 0, 20, 0, Math.PI * 2); c.fill();
    c.rotate(on(2) ? f * 0.8 : 0); c.fillStyle = '#64748B'; for (let i = 0; i < 3; i++) { c.rotate((Math.PI * 2) / 3); c.beginPath(); c.ellipse(0, -9, 5, 9, 0, 0, Math.PI * 2); c.fill(); }
    c.restore();
  }
  words(c, 'TORNADO', fx, GY - 114, print(1, '#E2E8F0', '#000'));
  // (the AC unit on its stand, its vent; iced up once it's real)
  const ax = X(FX.ac);
  box(c, ax - 40, GY - 30, 4, 30, '#3F3F46'); box(c, ax + 36, GY - 30, 4, 30, '#3F3F46');
  box(c, ax - 44, GY - 86, 88, 58, '#000'); box(c, ax - 42, GY - 84, 84, 54, wreck ? '#BAE6FD' : '#D6D3D1');
  for (let i = 0; i < 5; i++) box(c, ax - 36, GY - 76 + i * 8, 72, 3, wreck ? '#E0F2FE' : on(3) ? '#60A5FA' : '#78716C');
  if (wreck) for (let i = 0; i < 6; i++) box(c, ax - 36 + i * 14, GY - 30, 4, 10 + (i % 3) * 6, '#E0F2FE');
  words(c, 'BLIZZARD', ax, GY - 92, print(1, '#BAE6FD', '#000'));
  // (the squirt nozzle on its pipe)
  const sx = X(FX.squirt);
  box(c, sx - 3, GY - 70, 6, 70, '#57534E'); box(c, sx - 8, GY - 76, 16, 8, '#A1A1AA'); box(c, sx + 6, GY - 74, 8, 4, '#71717A');
  words(c, 'FLOOD', sx, GY - 84, print(1, '#93C5FD', '#000'));
  // (the fog machine: a black box on the floor, its nozzle)
  const gx = X(FX.fog);
  box(c, gx - 30, GY - 30, 60, 30, '#000'); box(c, gx - 28, GY - 28, 56, 26, wreck ? '#1C1917' : '#27272A'); box(c, gx + 28, GY - 20, 10, 8, '#3F3F46');
  box(c, gx - 20, GY - 22, 6, 4, on(5) ? '#EF4444' : '#450A0A');
  words(c, 'WILDFIRE', gx, GY - 38, print(1, '#FDBA74', '#000'));
  // (the squirt's drops)
  for (const d of o.show.squirt) if (d.t > 0) box(c, d.x - 2, d.y - 2, 4, 4, '#60A5FA');
};

const drawTheater = (c: Ctx, state: GameState, o: Dz, beat: number, k: number, real: boolean) => {
  const f = state.frame, r = o.real, ceil = Y(THEATER.ceil);
  room(c, X(THEATER.a), X(FAR_WALL + 40), THEATER.ceil, '#1C1917', '#292524');
  // (the acoustic panels on the walls)
  for (let rx = THEATER.a + 40; rx < THEATER.b - 60; rx += 160) if (rx < SCREEN.a - 120 || rx > SCREEN.b + 40) box(c, X(rx), Y(THEATER.ceil - 80), 110, 300, '#27272A');
  // (the lighting rig along the ceiling)
  box(c, X(THEATER.a), ceil + 20, THEATER.b - THEATER.a, 6, '#3F3F46');
  for (let rx = THEATER.a + 100; rx < THEATER.b; rx += 220) { box(c, X(rx) - 8, ceil + 26, 16, 20, '#18181B'); box(c, X(rx) - 5, ceil + 44, 10, 4, real ? '#7F1D1D' : '#FDE68A'); }
  // Signs: PLEASE STAND. HOLD THE RAIL.; THEATER 1; Steve's effects test
  stand(c, X(3170), ['PLEASE STAND.', 'HOLD THE RAIL.'], print(1, '#FDE68A'));
  steveFlier(c, X(5150), GY - 300, 'poster', 2);
  words(c, 'TESTED BY STEVE', X(5150), GY - 222, print(1, '#FDE047', '#000'));
  words(c, 'HE GOT WARM', X(5150), GY - 210, print(1, '#FCA5A5', '#000'));
  // The big screen: its black frame, the footage (or what's left of it)
  const sx = X(SCREEN.a), sy = Y(SCREEN.hi), sw = SCREEN.b - SCREEN.a, sh = SCREEN.hi - SCREEN.lo;
  box(c, sx - 14, sy - 14, sw + 28, sh + 28, '#000'); box(c, sx - 10, sy - 10, sw + 20, sh + 20, '#3F3F46');
  if (r.phase === 'on' && r.step < 2) {
    box(c, sx, sy, sw, sh, f % 20 < 10 ? '#7F1D1D' : '#000');
    words(c, 'REAL DISASTERS', sx + sw / 2, sy + sh / 2, enamel({ sx: 4, sy: 5 }, '#FDE047', '#000'));
    words(c, '(EXPERIMENTAL)', sx + sw / 2, sy + sh / 2 + 40, print(3, '#F8FAFC'));
  } else if (!real || (r.phase === 'on' && r.fire < 0.25)) footage(c, sx, sy, sw, sh, beat, k, f);
  else {
    // (torn and burnt: the footage flickering through the rip, the rest of it scorched, water stains down it)
    box(c, sx, sy, sw, sh, '#1C1917');
    c.save(); c.beginPath(); c.moveTo(sx + 300, sy); c.lineTo(sx + 520, sy + 120); c.lineTo(sx + 430, sy + sh); c.lineTo(sx + 700, sy + sh); c.lineTo(sx + 640, sy + 90); c.lineTo(sx + 820, sy); c.closePath(); c.clip();
    if (f % 30 < 22) footage(c, sx, sy, sw, sh, beat, k, f); else { for (let i = 0; i < 60; i++) box(c, sx + 300 + ((i * 41 + f * 13) % 520), sy + ((i * 19 + f * 7) % sh), 6, 3, '#E7E5E4'); }
    c.restore();
    c.fillStyle = 'rgba(0, 0, 0, 0.55)'; for (let i = 0; i < 9; i++) { c.beginPath(); c.ellipse(sx + 60 + i * 120, sy + 30 + (i % 3) * 70, 70, 40, 0.3, 0, Math.PI * 2); c.fill(); }
    if (r.flood > 0.2) for (let i = 0; i < 6; i++) box(c, sx + 160 + i * 150, sy + 60, 8, sh - 60, 'rgba(96, 165, 250, 0.45)');
  }
  drawEffects(c, state, o, beat, k);
  // The guests standing about watching (scenery: behind him), down once it's real (gone after)
  if (!real || r.phase === 'on') for (const [rx, seed] of WATCHERS) {
    const down = r.phase === 'on' && r.step >= 2;
    c.save(); c.translate(X(rx), GY - 4);
    if (down) { c.rotate(seed % 2 ? 1.45 : -1.45); c.translate(0, -12); }
    c.scale(seed % 2 ? 0.86 : -0.86, 0.86);
    const wob = !down && beat === 0 && k >= 0 && k < 150 ? Math.sin(f * 0.6) * 0.04 : 0; c.rotate(wob);
    drawPerson(c, { seed, outfit: 'guest', f, pose: down ? 'stand' : seed % 5 === 0 ? 'point' : 'stand', mood: down ? 'scared' : seed % 3 ? 'bored' : 'happy', shorts: seed % 3 === 0 });
    c.restore();
  }
  // (one left once it's over: singed black, clapping, slowly)
  if (real && r.phase === 'done') {
    c.save(); c.translate(X(3010), GY - 4); c.scale(0.86, 0.86);
    drawPerson(c, { seed: 1217, outfit: 'guest', f, pose: f % 60 < 30 ? 'cheer' : 'stand', mood: 'happy' });
    c.restore();
    c.fillStyle = 'rgba(12, 10, 9, 0.6)'; c.fillRect(X(3010) - 18, GY - 70, 36, 66);
  }
  // The lean rails (solid: lit tops)
  for (const rx of LEAN_RAILS) { box(c, X(rx) - 60, Y(32), 120, 32, '#000'); box(c, X(rx) - 58, Y(30), 116, 30, '#44403C'); for (let k = 0; k < 4; k++) box(c, X(rx) - 50 + k * 32, Y(28), 4, 28, '#27272A'); box(c, X(rx) - 60, Y(32), 120, 4, '#FDE68A'); }
  // The climb: the road cases (FX DEPT), the truss, the catwalks (their chains up; their handrails dim: not ledges)
  box(c, X(2780), Y(90), 110, 90, '#000'); box(c, X(2782), Y(88), 106, 44, '#27272A'); box(c, X(2782), Y(43), 106, 42, '#1C1917');
  box(c, X(2780), Y(90), 110, 3, '#FDE68A'); words(c, 'FX DEPT', X(2835), Y(60), print(1, '#FDE047'));
  for (const [rx, h, w, what] of LEDGES) {
    if (what === 'gantry') continue;
    for (const cx of [X(rx) + 10, X(rx) + w - 14]) box(c, cx, ceil, 3, Y(h) - ceil, '#3F3F46');
    if (what === 'catwalk') { box(c, X(rx), Y(h) - 34, w, 2, '#3F3F46'); for (let x = X(rx) + 6; x < X(rx) + w; x += 40) box(c, x, Y(h) - 34, 2, 34, '#3F3F46'); }
    ledgeLip(c, X(rx), Y(h), w, what === 'catwalk' ? '#3F3F46' : '#52525B', '#FDE68A');
  }
  // The cow (the tornado scene's), on its chain (gone flying once it's real)
  const cowHere = !real || (r.phase === 'on' && r.step < 4);
  box(c, X(COW_AT.x) - 1, ceil, 2, Y(COW_AT.h) - ceil + 30, '#57534E');
  if (cowHere) {
    const cx = X(COW_AT.x), cy = Y(COW_AT.h) + 50, sw2 = Math.sin(f * 0.03) * 4;
    box(c, cx - 30 + sw2, cy - 14, 60, 28, '#000'); box(c, cx - 28 + sw2, cy - 12, 56, 24, '#F8FAFC'); box(c, cx - 14 + sw2, cy - 12, 16, 12, '#1C1917');
    box(c, cx + 24 + sw2, cy - 22, 18, 16, '#F8FAFC'); box(c, cx + 36 + sw2, cy - 16, 6, 6, '#FDA4AF');
    for (const lx of [-22, -8, 8, 20]) box(c, cx + lx + sw2, cy + 12, 5, 14, '#F8FAFC');
    words(c, 'TORNADO COW', cx, cy - 30, print(1, '#FDE68A', '#000'));
  }
  words(c, 'COW RIG', X(CAT_L.b - 30), Y(565) - 14, print(1, '#FDE68A', '#000'));
  drawBooth(c, state, o);
  // The way out: EXIT (chained shut during the show)
  const ex = X(THEATER.b - 90);
  if (!real) {
    box(c, ex - 40, GY - 130, 80, 130, '#000'); box(c, ex - 36, GY - 126, 72, 126, '#44403C');
    c.strokeStyle = '#A1A1AA'; c.lineWidth = 3; c.beginPath(); c.moveTo(ex - 36, GY - 90); c.lineTo(ex + 36, GY - 50); c.moveTo(ex + 36, GY - 90); c.lineTo(ex - 36, GY - 50); c.stroke();
    box(c, ex - 30, GY - 160, 60, 20, '#000'); words(c, 'EXIT', ex, GY - 144, print(2, '#22C55E'));
    box(c, ex - 46, GY - 90, 92, 30, '#FEF3C7'); words(c, 'CLOSED DURING', ex, GY - 78, print(1, '#18181B')); words(c, 'THE DISASTERS', ex, GY - 66, print(1, '#B91C1C'));
  }
  // The wreck: cracks, frost, scorch, water on the floor
  if (r.crack > 0) {
    c.strokeStyle = '#000'; c.lineWidth = 3; c.beginPath();
    const n = Math.floor(r.crack * 9);
    for (let i = 0; i < n; i++) { const rx = THEATER.a + 150 + i * 280; c.moveTo(X(rx), ceil + 40); c.lineTo(X(rx) + 40, ceil + 160); c.lineTo(X(rx) + 10, ceil + 260); c.lineTo(X(rx) + 60, ceil + 400); c.lineTo(X(rx) + 30, GY - 20); }
    c.stroke();
  }
  if (r.frost > 0) {
    c.fillStyle = `rgba(224, 242, 254, ${0.35 * r.frost})`;
    for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(X(4400 + i * 150), ceil + 120 + (i % 3) * 140, 120 * r.frost, 90 * r.frost, 0, 0, Math.PI * 2); c.fill(); }
    for (const [rx, h, w, what] of LEDGES) if (what === 'catwalk') for (let x = X(rx) + 10; x < X(rx) + w; x += 26) box(c, x, Y(h) + 14, 3, 8 + ((x * 7) % 12) * r.frost, '#E0F2FE');
  }
  if (r.fire > 0.5) { c.fillStyle = 'rgba(0, 0, 0, 0.5)'; c.beginPath(); c.ellipse(X(FX.heater), GY - 140, 90, 140, 0, 0, Math.PI * 2); c.fill(); }
  if (r.flood > 0) { box(c, X(SCREEN.a - 200), GY - 3, (SCREEN.b - SCREEN.a + 400) * r.flood, 3, 'rgba(96, 165, 250, 0.7)'); }
  floor(c, X(THEATER.a), X(FAR_WALL + 40), '#1C1917', '#57534E');
};

const drawBooth = (c: Ctx, state: GameState, o: Dz) => {
  const f = state.frame, r = o.real, by = Y(CAT_R.h), squashed = r.squashed;
  const cx0 = X(BOOTH.cab), cw = X(BOOTH.b) - cx0;
  box(c, cx0, by - 140, cw, 140, '#000'); box(c, cx0 + 2, by - 138, cw - 4, 138, '#57534E');
  box(c, cx0 - 8, by - 152, cw + 16, 16, '#000'); box(c, cx0 - 6, by - 150, cw + 12, 12, '#7C2D12');
  words(c, 'EFFECTS CONTROL', cx0 + cw / 2, by - 140, print(1, '#FDE68A'));
  box(c, cx0 + 14, by - 120, cw - 28, 64, '#0C4A6E'); box(c, cx0 + 16, by - 118, cw - 32, 60, 'rgba(186, 230, 253, 0.3)');
  box(c, cx0 + 16, by - 56, cw - 32, 14, '#27272A');
  const panic = r.phase === 'on' && r.step >= 2;
  for (let k = 0; k < 8; k++) box(c, cx0 + 24 + k * 34, by - 52, 6, 6, panic ? (f % 8 < 4 ? '#EF4444' : '#000') : (k + Math.floor(f / 24)) % 3 ? '#4ADE80' : '#FDE047');
  if (!squashed) {
    // (the sleeper: slumped over the desk, the eye mask on, earplugs in, a Zzz going up)
    c.save(); c.translate(cx0 + 110, by - 40); c.scale(0.9, 0.9);
    drawPerson(c, { seed: 5113, outfit: 'operator', f: 0, pose: 'sit', mood: 'bored', talking: !!o.sleeper });
    box(c, -8, -82, 20, 6, '#DB2777');
    c.restore();
    for (let k = 0; k < 3; k++) { const t = ((f + k * 30) % 90) / 90; words(c, 'Z', cx0 + 130 + t * 20 + k * 4, by - 96 - t * 40, print(1 + (k % 2), `rgba(255,255,255,${1 - t})`)); }
  }
  // (the truss, coming down on it; down on it: his legs out from under, the blood)
  if (r.truss > 0) {
    const ty = by - 300 + 230 * r.truss;
    c.save(); c.translate(cx0 + cw / 2, ty); c.rotate(-0.12 * r.truss);
    box(c, -170, -14, 340, 28, '#000'); box(c, -168, -12, 336, 24, '#52525B');
    c.strokeStyle = '#27272A'; c.lineWidth = 3; c.beginPath(); for (let x = -160; x < 160; x += 28) { c.moveTo(x, -10); c.lineTo(x + 14, 10); c.lineTo(x + 28, -10); } c.stroke();
    for (let x = -150; x < 160; x += 60) { box(c, x, 12, 16, 18, '#18181B'); box(c, x + 3, 28, 10, 4, '#7F1D1D'); }
    c.restore();
  }
  if (squashed) {
    // (the window gone, the desk flat; his legs out the side, one shoe off)
    box(c, cx0 + 14, by - 120, cw - 28, 64, '#1C1917');
    box(c, cx0 + 30, by - 18, 56, 10, '#D6C7A1'); box(c, cx0 + 20, by - 20, 12, 12, '#1C1917');
    box(c, cx0 + 40, by - 8, 50, 8, '#D6C7A1'); box(c, cx0 + 36, by - 10, 8, 10, '#E7B48F');
    box(c, cx0 + 60, by - 4, 120, 4, '#7F1D1D'); box(c, cx0 + 120, by - 6, 30, 6, '#991B1B');
    box(c, cx0 + 50, by - 160, 120, 22, '#FEF3C7'); words(c, 'BACK IN 5', cx0 + 110, by - 144, print(1, '#18181B'));
  }
  // The lever: on the balcony, its plate (SIMULATED / REAL (EXPERIMENTAL)) up on its post over his head (nothing over
  // it while he hauls), the handle thrown one way or the other (mid-throw, where he's hauled it: ../lever.ts)
  const lv = REAL_LEVER, lx = lv.x, ang = throwAngle(lv, o.pull, o.real.phase !== 'off'), on = ang > 0, pt = by - 160;
  box(c, lx - 2, pt + 50, 4, by - pt - 50, '#57534E');
  box(c, lx - 62, pt - 2, 124, 54, '#000'); box(c, lx - 60, pt, 120, 50, '#E7E5E4');
  words(c, 'REAL DISASTERS', lx, pt + 14, print(1, '#B91C1C'));
  words(c, 'SIMULATED', lx - 30, pt + 30, print(1, !on ? '#15803D' : '#A8A29E'));
  words(c, 'REAL', lx + 34, pt + 30, print(1, on ? '#DC2626' : '#A8A29E'));
  words(c, '(EXPERIMENTAL)', lx, pt + 43, print(1, '#57534E'));
  box(c, lx - 16, by - 14, 32, 14, '#000'); box(c, lx - 14, by - 12, 28, 12, '#52525B');
  c.save(); c.translate(lx, lv.y); c.rotate(ang);
  box(c, -3, -lv.len + 2, 6, lv.len - 2, '#000'); box(c, -2, -lv.len + 3, 4, lv.len - 4, '#A1A1AA');
  c.fillStyle = '#000'; c.beginPath(); c.arc(0, -lv.len, 8, 0, Math.PI * 2); c.fill(); c.fillStyle = '#DC2626'; c.beginPath(); c.arc(0, -lv.len, 6, 0, Math.PI * 2); c.fill();
  c.restore();
};

/** The far wall (falling out flat once it's real) and outside: the backlot under a red sky, every disaster at once. */
const drawFarWall = (c: Ctx, state: GameState, o: Dz, real: boolean) => {
  const f = state.frame, r = o.real, wx = X(FAR_WALL), ceil = Y(THEATER.ceil);
  const open = real && (r.phase === 'done' || r.wall > 0);
  if (open) {
    // The outside: the red sky, the ash, far off a funnel and a burning facade; the street, cracked
    const sky = ['#1C1917', '#450A0A', '#7C2D12', '#C2410C', '#EA580C'];
    sky.forEach((col, i) => box(c, wx, GY - 1400 + i * 280, X(6400) - wx, 280, col));
    for (let i = 0; i < 8; i++) { c.fillStyle = 'rgba(41, 37, 36, 0.85)'; c.beginPath(); c.ellipse(X(5700) + Math.sin(f * 0.02 + i) * 14, GY - 120 - i * 50, 26 + i * 12, 10, 0, 0, Math.PI * 2); c.fill(); }
    box(c, X(5950), GY - 260, 160, 260, '#292524'); for (let i = 0; i < 5; i++) { c.fillStyle = (f + i * 5) % 12 < 6 ? '#F97316' : '#FDE047'; c.beginPath(); c.moveTo(X(5960) + i * 30, GY - 260); c.quadraticCurveTo(X(5975) + i * 30, GY - 320 - ((f + i * 9) % 20), X(5990) + i * 30, GY - 260); c.closePath(); c.fill(); }
    for (let i = 0; i < 40; i++) box(c, wx + ((i * 71 + f) % 1100), GY - 900 + ((i * 131 + f * 2) % 900), 3, 3, i % 2 ? '#A8A29E' : '#F97316');
    box(c, wx, GY, X(6400) - wx, 400, '#292524'); box(c, wx, GY, X(6400) - wx, 4, '#78716C');
    c.strokeStyle = '#0C0A09'; c.lineWidth = 3; c.beginPath(); for (let x = wx + 120; x < X(6400); x += 230) { c.moveTo(x, GY + 2); c.lineTo(x + 40, GY + 30); c.lineTo(x + 20, GY + 60); } c.stroke();
    // (the building's roof line, broken off, over the hole)
    box(c, wx - 40, ceil - 40, 80, 60, '#0C0A09');
    c.fillStyle = '#0C0A09'; c.beginPath(); c.moveTo(wx - 40, ceil + 20); c.lineTo(wx + 40, ceil + 20); c.lineTo(wx + 10, ceil + 90); c.lineTo(wx - 20, ceil + 60); c.closePath(); c.fill();
    // (a sign stuck in the rubble: this way)
    const sx = X(5600);
    c.save(); c.translate(sx, GY); c.rotate(-0.12);
    box(c, -3, -110, 6, 110, '#57534E'); box(c, -74, -150, 148, 44, '#000'); box(c, -72, -148, 144, 40, '#FEF3C7');
    words(c, 'RIDE EXIT', 0, -130, print(1, '#18181B')); words(c, 'EVERYTHING >>', 0, -116, print(1, '#B91C1C'));
    c.restore();
  }
  // The wall: up; going (out over the lot, pivoting at its foot); down flat out there, broken
  const fall = r.phase === 'done' || (real && r.phase !== 'on') ? 1 : r.wall;
  const wh = THEATER.ceil;
  if (fall < 1) {
    c.save(); c.translate(wx + 40, GY); c.rotate((Math.PI / 2) * fall * fall);
    box(c, -40, -wh, 40, wh, '#0C0A09'); box(c, -36, -wh + 4, 32, wh - 4, '#292524');
    if (r.crack > 0.3) { c.strokeStyle = '#000'; c.lineWidth = 3; c.beginPath(); c.moveTo(-20, -wh); c.lineTo(-30, -wh * 0.6); c.lineTo(-10, -wh * 0.3); c.lineTo(-24, 0); c.stroke(); }
    c.restore();
  } else if (open) {
    // (flat on the lot, outward: its inside face up, broken in three)
    for (let i = 0; i < 3; i++) { const a = wx + 40 + i * (wh / 3); c.save(); c.translate(a, GY - 6); c.rotate((i - 1) * 0.04); box(c, 0, -20, wh / 3 - 6, 22, '#000'); box(c, 2, -18, wh / 3 - 10, 18, '#292524'); c.restore(); }
    for (let i = 0; i < 12; i++) box(c, wx + 20 + ((i * 53) % 600), GY - 8 - (i % 3) * 6, 10 + (i % 4) * 4, 8, i % 2 ? '#57534E' : '#44403C');
  }
};

export const drawDisasterBack = (c: Ctx, state: GameState, o: Dz, beat: number, k: number, real: boolean) => {
  if (seen(state, X(-200), X(LOBBY.b))) drawLobby(c, state, o, real);
  if (seen(state, X(PRESHOW.a), X(PRESHOW.b) + 80)) drawPreshow(c, state, o, real);
  if (seen(state, X(THEATER.a), X(FAR_WALL + 40))) drawTheater(c, state, o, beat, k, real);
  if (seen(state, X(FAR_WALL - 600), X(6400))) drawFarWall(c, state, o, real);
};

/** In front of him: the real fire on the floor (the heater's), the fan and the cow flying. */
export const drawDisasterFront = (c: Ctx, state: GameState, o: Dz, real: boolean) => {
  const f = state.frame, r = o.real;
  if (real && seen(state, X(FX.heater) - 100, X(FX.heater) + 100)) {
    const hx = X(FX.heater);
    for (let i = 0; i < 6; i++) {
      const fx = hx - 45 + i * 18, h = 30 + ((f * 3 + i * 17) % 26);
      c.fillStyle = i % 2 ? '#F97316' : '#FDE047'; c.beginPath(); c.moveTo(fx - 10, GY); c.quadraticCurveTo(fx, GY - h - 10, fx + 10, GY); c.closePath(); c.fill();
    }
    box(c, hx - 56, GY - 4, 112, 4, '#1C1917');
  }
  if (r.fan) { c.save(); c.translate(r.fan.x, r.fan.y); c.rotate(r.fan.rot); c.fillStyle = '#000'; c.beginPath(); c.arc(0, 0, 22, 0, Math.PI * 2); c.fill(); c.fillStyle = '#E2E8F0'; c.beginPath(); c.arc(0, 0, 20, 0, Math.PI * 2); c.fill(); box(c, -3, 18, 6, 22, '#52525B'); c.restore(); }
  if (r.cow) { c.save(); c.translate(r.cow.x, r.cow.y); c.rotate(r.cow.rot); box(c, -30, -14, 60, 28, '#000'); box(c, -28, -12, 56, 24, '#F8FAFC'); box(c, -14, -12, 16, 12, '#1C1917'); box(c, 24, -22, 18, 16, '#F8FAFC'); for (const lx of [-22, -8, 8, 20]) box(c, lx, 12, 5, 14, '#F8FAFC'); c.restore(); }
};

/** A light's color, faint (the engine adds it over what it lights, and tints whoever's in it by it at 0.3 of how lit
 *  they are: a plain hex color there went over him at full strength, lighting him up white in the dark theater). */
const tint = (hex: string, a: number) => `rgba(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}, ${a})`;

/** The light: a dark room lit by its screen (the red gel in the volcano, the fire and the red sky once it's real). */
export const disasterLights = (o: Dz, beat: number, k: number, real: boolean): Light[] => {
  const out: Light[] = [
    { x: X(300), y: Y(LOBBY.ceil) + 40, r: 360, a: 0.8, color: tint('#FDE68A', 0.14) },
    { x: X(1000), y: Y(LOBBY.ceil) + 40, r: 360, a: 0.8, color: tint('#FDE68A', 0.14) },
    { x: X(1650), y: Y(LOBBY.ceil) + 40, r: 320, a: 0.8, color: tint('#FDBA74', 0.14) },
    { x: X(PRESHOW.tv), y: Y(PRESHOW.ceil) + 140, r: 360, a: 0.85, color: tint(real ? '#E7E5E4' : '#FDBA74', 0.14) },
    // (the screen: the room's light, but it's a dim theater: soft on whoever's down in it)
    { x: X((SCREEN.a + SCREEN.b) / 2), y: Y((SCREEN.lo + SCREEN.hi) / 2), r: 720, a: 0.7, color: tint(real ? '#FCA5A5' : ['#E0F2FE', '#FCA5A5', '#CBD5E1', '#F8FAFC', '#93C5FD', '#FDBA74'][beat], 0.12) },
    { x: X(BOOTH.cab + 150), y: Y(CAT_R.h) - 80, r: 220, a: 0.7, color: tint('#7DD3FC', 0.12) },
    { x: X(CAT_L.a + 300), y: Y(CAT_L.h) - 60, r: 260, a: 0.5, color: tint('#FDE68A', 0.1) },
  ];
  if (!real && beat === 1 && k >= 0 && k < FX_LEN - 40) out.push({ x: X(FX.heater + 36), y: GY - 150, r: 420, a: 0.85, color: tint('#EF4444', 0.2) });
  if (real || o.real.fire > 0) out.push({ x: X(FX.heater), y: GY - 30, r: 360, a: 0.9, color: tint('#F97316', 0.18) });
  if (real) out.push({ x: X(FAR_WALL + 200), y: GY - 200, r: 700, a: 0.9, color: tint('#EA580C', 0.16) });
  return out;
};
