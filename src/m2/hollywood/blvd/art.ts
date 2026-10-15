// The boulevard, drawn (the crude first pass: readable boxes and the park's letters). The sky by the hour, the
// HAPPYWOOD hill with its fallen O, a far skyline of soundstages, and THRONES OF THE STARS' impossible track rising
// over the rooftops toward the end. Down here: the sidewalk going back to a row of plywood fronts (their bracing showing
// past their ends), the Walk of Fame's stars for nobodies, lampposts with Steve's fliers, the AS SEEN IN plaques, guests
// photographing them, the set pieces.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { box, steveFlier, happywoodHill } from '../section';
import { realDisastersOn } from '../section';
import { GY, HWX, SECTIONS } from '../geometry';
import { drawTodSky, hourMix } from '../../timeOfDay';
import { X, Y, SINK, TRENCH, DECK, TRAM, MARQUEE_X, SOLIDS, LEDGES, LAMPS, STEVES, STAR_NAMES, STAR_STEP } from './layout';
import {
  BACK, BACK_Y, inView, words, print, enamel, gate, brass, marquee, ledgeLip, sidewalk, hole, sawhorse, velvetRope, asSeenIn,
  guest, lamppost, palm, tipJar, facade,
} from './paint';

type Ctx = CanvasRenderingContext2D;
const { x0, x1 } = SECTIONS.blvd;

// ---------------------------------------------------------------------------------------------------------------
// Screen space: the sky, the hill, the far skyline, the coaster

/** The coaster far off: loops and corkscrews of track on spindly legs, a mess, bigger the nearer the end. */
export const farCoaster = (c: Ctx, sx: number, base: number, k: number, col: string) => {
  c.strokeStyle = col; c.lineWidth = Math.max(1, 3 * k);
  // (the legs)
  for (let i = 0; i < 9; i++) { const lx = sx + (i - 4) * 70 * k; c.beginPath(); c.moveTo(lx, base); c.lineTo(lx + 10 * k, base - (120 + (i % 3) * 90) * k); c.stroke(); }
  // (the lift hill, the loops, getting smaller (the suicide run), a corkscrew)
  c.beginPath(); c.moveTo(sx - 330 * k, base - 40 * k); c.lineTo(sx - 200 * k, base - 380 * k); c.quadraticCurveTo(sx - 150 * k, base - 420 * k, sx - 110 * k, base - 300 * k); c.stroke();
  for (let i = 0; i < 4; i++) { const r = (90 - i * 18) * k; c.beginPath(); c.arc(sx - 40 * k + i * 95 * k, base - 120 * k - r, r, 0, Math.PI * 2); c.stroke(); }
  c.beginPath(); for (let t = 0; t < 1; t += 0.02) { const xx = sx + 280 * k + t * 160 * k, yy = base - 200 * k + Math.sin(t * Math.PI * 6) * 40 * k; if (t === 0) c.moveTo(xx, yy); else c.lineTo(xx, yy); } c.stroke();
};

export const drawBlvdBackdrop = (c: Ctx, state: GameState) => {
  const W = 800, H = 600, cam = state.camera.x;
  drawTodSky(c, 0, 0, W, H, ['#1E3A8A', '#3B82F6', '#93C5FD', '#FDE68A'], { horizon: 430, sun: [620, 120], moon: [160, 90] });
  if (realDisastersOn(state)) { c.fillStyle = 'rgba(127, 29, 29, 0.25)'; c.fillRect(0, 0, W, H); }
  happywoodHill(c, 560 - (cam - HWX) * 0.004, 430, hourMix('#A16207', '#92400E', '#3F2A14'));
  // (the coaster: rising out of the far end of the boulevard as he gets near it)
  const along = Math.max(0, Math.min(1, (cam - x0) / (x1 - x0)));
  farCoaster(c, 980 - (cam - x0) * 0.08 + 300, 430, 0.4 + along * 0.6, hourMix('#475569', '#334155', '#1E293B'));
  // (soundstages and old buildings, flat, scrolling slow)
  const far = hourMix('#78716C', '#57534E', '#292524');
  const off = -((cam * 0.2) % 160);
  for (let x = off - 160, k = 0; x < W + 160; x += 160, k++) {
    const h = 60 + ((k * 37 + Math.floor(cam / 800)) % 5) * 22;
    box(c, x, 430 - h, 120, h + 170, far);
    if ((k + Math.floor(cam / 800)) % 3 === 0) box(c, x + 10, 430 - h + 10, 100, 4, hourMix('#A8A29E', '#78716C', '#44403C'));
  }
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// World space, behind

/** The blocks: which plywood front stands where along the back, its color, its name. [x, w, h, wall, name]. */
const FRONTS: [number, number, number, string, string][] = [
  [600, 360, 210, '#B45309', 'SOUVENIRS SOUVENIRS'], [1000, 300, 250, '#0E7490', 'WAX MUSEUM-ISH'],
  [1600, 420, 190, '#7C2D12', 'OSCAR-ISH GIFTS'], [2100, 300, 230, '#4D7C0F', 'MAPS TO STARS HOMES'],
  // (the movie palace's own, drawn separately: 2700..3450)
  [3550, 380, 220, '#6D28D9', 'BELIEVE IT OR DON\'T'], [4450, 320, 240, '#BE185D', 'CELEBRITY BURGERS'],
  [4850, 420, 200, '#0F766E', 'COSTUMES 4 LESS'], [5350, 300, 260, '#B91C1C', 'TATTOOS & HEADSHOTS'],
  [5750, 380, 210, '#1D4ED8', 'REVENGERS: RESEMBLE'], [6200, 320, 230, '#A16207', 'AUDITIONS TODAY'],
  [7250, 300, 250, '#57534E', 'LIQUOR'],
  // (the hotel's own (the scaffold): 7700..8700)
  [9200, 360, 230, '#9F1239', 'STAR TOURS-ISH'], [9650, 320, 250, '#155E75', 'HEADSHOTS $5'], [10050, 340, 220, '#854D0E', 'AGENTS WANTED'],
];

const star = (c: Ctx, x: number, name: string) => {
  // (a terrazzo square going back, the brass star, the name beside it)
  const y = BACK_Y + 6, w = 210;
  box(c, x, y, w, BACK - 10, '#9F1239'); box(c, x, y, w, 2, '#BE123C');
  c.fillStyle = '#FBBF24'; c.beginPath();
  for (let k = 0; k < 10; k++) { const r = k % 2 ? 5 : 12, a = -Math.PI / 2 + (k * Math.PI) / 5; c.lineTo(x + 18 + Math.cos(a) * r, y + 13 + Math.sin(a) * r * 0.7); }
  c.closePath(); c.fill();
  words(c, name, x + 34, y + 17, print(1, '#FDE68A'), 'left');
};

const moviePalace = (c: Ctx, state: GameState) => {
  // GROWMAN'S CHINA-ISH THEATRE: a pagoda roof of plywood, red columns, the forecourt's handprints of nobodies
  const a = X(2700), b = X(3450), top = BACK_Y - 300;
  // (the sandbags and bracing showing behind it)
  for (let k = 0; k < 4; k++) { c.strokeStyle = '#A16207'; c.lineWidth = 5; c.beginPath(); c.moveTo(a + 60 + k * 200, top + 80); c.lineTo(a + 140 + k * 200, BACK_Y - 30); c.stroke(); }
  box(c, a, top + 60, b - a, BACK_Y - top - 60, '#000'); box(c, a + 2, top + 62, b - a - 4, BACK_Y - top - 64, '#991B1B');
  c.fillStyle = '#14532D'; c.beginPath(); c.moveTo(a - 40, top + 70); c.lineTo((a + b) / 2, top); c.lineTo(b + 40, top + 70); c.closePath(); c.fill();
  c.fillStyle = '#166534'; c.beginPath(); c.moveTo(a + 60, top + 70); c.lineTo((a + b) / 2, top + 26); c.lineTo(b - 60, top + 70); c.closePath(); c.fill();
  for (let k = 0; k < 6; k++) box(c, a + 40 + k * 130, top + 90, 18, BACK_Y - top - 90, '#DC2626');
  // (the sign, held up on its own frame over the doors)
  const L = gate(16, '#FDE68A', '#7F1D1D');
  box(c, (a + b) / 2 - 220, top + 100, 440, 34, '#1C1917');
  words(c, "GROWMAN'S CHINA-ISH THEATRE", (a + b) / 2, top + 124, L);
  box(c, (a + b) / 2 - 60, BACK_Y - 100, 120, 100, '#1C1917');
  // (the forecourt: cement squares in the pavement, handprints, the names)
  const names = ['A GUY', 'BOB?', 'SOME LADY', 'THE TALL ONE'];
  for (let k = 0; k < 4; k++) {
    const sx = a + 60 + k * 170, y = BACK_Y + 6;
    box(c, sx, y, 110, BACK - 10, '#D6D3D1'); box(c, sx, y, 110, 2, '#E7E5E4');
    for (const hx of [sx + 14, sx + 34]) { box(c, hx, y + 4, 10, 12, '#A8A29E'); for (let fi = 0; fi < 4; fi++) box(c, hx + fi * 2.5, y + 1, 2, 4, '#A8A29E'); }
    words(c, names[k], sx + 76, y + 15, print(1, '#57534E'));
  }
  void state;
};

const hotel = (c: Ctx) => {
  // THE HAPPYWOOD ROOSEVELT-ISH: a tall plywood hotel front, its scaffold up the face of it
  const a = X(7700), b = X(8720), top = BACK_Y - 420;
  facade(c, a, b - a, BACK_Y - top, '#A8A29E', 'THE ROOSEVELT-ISH HOTEL', gate(14, '#FEF3C7', '#1C1917'), { door: false });
  // (the scaffold: pipes and cross braces up to the deck, the deck's rail)
  for (let px = X(7760); px <= X(DECK.b); px += 130) { box(c, px, Y(DECK.h), 6, DECK.h, '#71717A'); }
  c.strokeStyle = '#52525B'; c.lineWidth = 2; c.beginPath();
  for (let px = X(7760); px < X(DECK.b) - 130; px += 130) for (let h = 0; h < DECK.h; h += 110) { c.moveTo(px + 3, GY - h); c.lineTo(px + 133, GY - h - 110); }
  c.stroke();
};

export const drawBlvdBack = (c: Ctx, state: GameState) => {
  const f = state.frame;
  // The fronts along the back, the movie palace, the hotel
  for (const [rx, w, h, wall, name] of FRONTS) if (inView(state, X(rx) - 30, X(rx) + w + 30)) facade(c, X(rx), w, h, wall, name, name.startsWith('REVENGERS') ? gate(12, '#FDE047', '#1E3A8A') : undefined);
  if (inView(state, X(2650), X(3500))) moviePalace(c, state);
  if (inView(state, X(7650), X(8800))) hotel(c);
  // The arch at the start: HAPPYWOOD BLVD on two posts over the sidewalk
  if (inView(state, X(-100), X(400))) {
    box(c, X(20), GY - 260, 14, 260, '#57534E'); box(c, X(330), GY - 260, 14, 260, '#57534E');
    box(c, X(0), GY - 300, 364, 50, '#000'); box(c, X(2), GY - 298, 360, 46, '#1E1B4B');
    words(c, 'HAPPYWOOD BLVD', X(182), GY - 262, marquee(3, 3, '#FDE047', true));
  }
  // The pavement, the stars
  sidewalk(c, state, x0 - 200, x1 + 200);
  for (let k = 0, rx = 300; rx < 11000; rx += STAR_STEP, k++) if (inView(state, X(rx), X(rx) + 220) && !(rx > SINK.a - 220 && rx < SINK.b) && !(rx > TRENCH.a - 220 && rx < TRENCH.b)) star(c, X(rx), STAR_NAMES[k % STAR_NAMES.length]);
  // The holes
  if (inView(state, X(SINK.a), X(SINK.b))) { hole(c, X(SINK.a), X(SINK.b), 'SINKHOLE'); sawhorse(c, X(SINK.a) - 50, f, 'SINKHOLE'); words(c, 'STAR COMING SOON', X((SINK.a + SINK.b) / 2), BACK_Y - 8, print(1, '#FDE68A', '#000')); }
  if (inView(state, X(TRENCH.a), X(TRENCH.b))) { hole(c, X(TRENCH.a), X(TRENCH.b), 'ROAD WORK SINCE 1994'); sawhorse(c, X(TRENCH.a) - 50, f, 'ROAD WORK'); }
  // The things along the way
  for (const [rx, horn] of LAMPS) if (inView(state, X(rx) - 40, X(rx) + 40)) lamppost(c, X(rx), BACK_Y + 10, horn, rx);
  if (inView(state, X(400), X(1000))) {
    // (the AS SEEN IN bench, roped off, guests photographing it)
    box(c, X(760), BACK_Y - 20, 110, 8, '#78350F'); box(c, X(760), BACK_Y - 44, 110, 6, '#78350F'); box(c, X(768), BACK_Y - 12, 6, 12, '#27272A'); box(c, X(856), BACK_Y - 12, 6, 12, '#27272A');
    velvetRope(c, X(740), X(890), BACK_Y + 8);
    asSeenIn(c, X(815), BACK_Y - 40, 'A BENCH (1979)');
    guest(c, X(700), GY, 11, f, 'photo', 1); guest(c, X(940), GY, 24, f, 'photo', -1);
  }
  if (inView(state, X(5000), X(5300))) { box(c, X(5110), BACK_Y - 30, 26, 30, '#DC2626'); box(c, X(5106), BACK_Y - 34, 34, 6, '#B91C1C'); velvetRope(c, X(5070), X(5180), BACK_Y + 8); asSeenIn(c, X(5123), BACK_Y - 34, 'A HYDRANT'); guest(c, X(5240), GY, 37, f, 'photo', -1); }
  if (inView(state, X(2850), X(3050))) asSeenIn(c, X(2955), GY - 70, 'A TRASH CAN');
  for (const rx of [1250, 2650, 4700, 6050, 10250]) if (inView(state, X(rx) - 20, X(rx) + 20)) tipJar(c, X(rx), BACK_Y + 10);
  for (const rx of [1150, 2450, 4300, 7100, 9050]) if (inView(state, X(rx) - 60, X(rx) + 60)) palm(c, X(rx), BACK_Y + 4, 240 + (rx % 3) * 30, f);
  for (const [rx, kind] of STEVES) if (inView(state, X(rx) - 60, X(rx) + 60)) steveFlier(c, X(rx), kind === 'standee' ? BACK_Y + 8 : BACK_Y - 150, kind, rx);
  // (onlookers about, here and there: bored, filming)
  for (const [rx, seed] of [[1800, 5], [3250, 8], [4800, 14], [6100, 19], [10650, 27], [10880, 30]] as const) if (inView(state, X(rx) - 30, X(rx) + 30)) guest(c, X(rx), BACK_Y + 8, seed, f, seed % 2 ? 'photo' : 'stand', seed % 3 ? 1 : -1);
  // The solid things and the ledges (standable: lit lips)
  for (const [rx, h, w, what] of SOLIDS) {
    if (!inView(state, X(rx), X(rx) + w)) continue;
    if (what === 'planter') { palm(c, X(rx + w / 2), Y(h), 170, f); ledgeLip(c, X(rx), Y(h), w, '#78716C', '#E7E5E4', h); box(c, X(rx) + 8, Y(h) + 6, w - 16, 6, '#3F6212'); }
    else if (what === 'trashcan') { ledgeLip(c, X(rx), Y(h), w, '#3F3F46', '#D4D4D8', h); box(c, X(rx) + 6, Y(h) + 20, w - 12, 3, '#18181B'); }
    else {
      // (the hotel's bracing and sandbags, ground to deck: no way through; CLOSED SET)
      box(c, X(rx), Y(h), w, h, '#000');
      for (let yy = Y(h) + 2; yy < GY; yy += 14) box(c, X(rx) + 2, yy, w - 4, 12, (yy / 14) % 2 ? '#A8A29E' : '#D6D3D1');
      c.strokeStyle = '#A16207'; c.lineWidth = 6; c.beginPath(); c.moveTo(X(rx) - 4, GY); c.lineTo(X(rx) + w + 4, Y(h)); c.moveTo(X(rx) - 4, Y(h)); c.lineTo(X(rx) + w + 4, GY); c.stroke();
      box(c, X(rx) - 30, GY - 150, w + 60, 26, '#000'); words(c, 'CLOSED SET', X(rx) + w / 2, GY - 131, enamel(10, '#EF4444'));
    }
  }
  for (const [rx, h, w, what] of LEDGES) {
    if (!inView(state, X(rx), X(rx) + w)) continue;
    const body = what === 'marquee' ? '#1C1917' : what === 'awning' ? '#BE123C' : what === 'shelter' ? '#334155' : what === 'catwalk' ? '#3F3F46' : '#57534E';
    if (what === 'shelter') { box(c, X(rx) + 6, Y(h), 6, h, '#64748B'); box(c, X(rx) + w - 12, Y(h), 6, h, '#64748B'); box(c, X(rx) + 14, Y(h) + 30, w - 28, 50, 'rgba(147, 197, 253, 0.35)'); }
    if (what === 'catwalk') {
      // (a billboard on legs: its face up behind the catwalk, REVENGERS: RESEMBLE on it)
      box(c, X(rx) + 20, Y(h), 8, h, '#52525B'); box(c, X(rx) + w - 28, Y(h), 8, h, '#52525B');
      box(c, X(rx) - 30, Y(h) - 130, w + 60, 126, '#000'); box(c, X(rx) - 28, Y(h) - 128, w + 56, 122, '#1E3A8A');
      words(c, 'REVENGERS', X(rx) + w / 2, Y(h) - 90, gate(16, '#FDE047', '#1E3A8A'));
      words(c, 'RESEMBLE', X(rx) + w / 2, Y(h) - 52, gate(12, '#F8FAFC', '#1E3A8A'));
      words(c, 'PART 14: THE RE-SEMBLING', X(rx) + w / 2, Y(h) - 20, print(1, '#FDE68A'));
    }
    if (what === 'marquee') {
      box(c, X(rx), Y(h) - 50, w, 50, '#000'); box(c, X(rx) + 2, Y(h) - 48, w - 4, 46, '#FEF3C7');
      words(c, 'NOW SHOWING', X(rx) + w / 2, Y(h) - 34, print(1, '#7F1D1D'));
      words(c, 'REVENGERS 14', X(rx) + w / 2, Y(h) - 14, enamel(10, '#18181B'));
    }
    ledgeLip(c, X(rx), Y(h), w, body);
  }
  // The tram's stretch: its route painted on the street, a sign held up by the curb
  if (inView(state, X(TRAM.a), X(TRAM.b))) {
    for (let x = X(TRAM.a); x < X(TRAM.b); x += 60) box(c, x, GY + 14, 30, 4, '#FACC15');
    box(c, X(TRAM.b) - 220, GY - 120, 6, 120, '#71717A'); box(c, X(TRAM.b) - 300, GY - 150, 160, 34, '#000'); box(c, X(TRAM.b) - 298, GY - 148, 156, 30, '#FACC15');
    words(c, 'TRAM ROUTE', X(TRAM.b) - 220, GY - 137, print(1, '#18181B')); words(c, 'IT DOES NOT STOP', X(TRAM.b) - 220, GY - 125, print(1, '#7F1D1D'));
  }
  // The end: THRONES OF THE STARS' marquee over the queue plaza, the coaster's legs and its lift hill behind it
  if (inView(state, X(MARQUEE_X) - 400, X(MARQUEE_X) + 500)) {
    const mx = X(MARQUEE_X);
    c.strokeStyle = '#475569'; c.lineWidth = 8;
    for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(mx - 300 + k * 140, BACK_Y); c.lineTo(mx - 260 + k * 140, BACK_Y - 520); c.stroke(); }
    c.beginPath(); c.moveTo(mx - 400, BACK_Y - 200); c.lineTo(mx + 200, BACK_Y - 560); c.stroke();
    c.lineWidth = 6; c.beginPath(); c.arc(mx + 300, BACK_Y - 300, 120, 0, Math.PI * 2); c.stroke();
    // (the switchbacks of the queue)
    for (let k = 0; k < 3; k++) velvetRope(c, mx - 380, mx - 60, BACK_Y - k * 8);
    box(c, mx - 230, BACK_Y - 380, 460, 120, '#000'); box(c, mx - 226, BACK_Y - 376, 452, 112, '#4C0519');
    words(c, 'THRONES', mx, BACK_Y - 330, marquee(4, 4, '#FBBF24', f % 30 < 24));
    words(c, 'OF THE STARS', mx, BACK_Y - 290, marquee(3, 3, '#FDE68A', f % 30 >= 6));
    box(c, mx - 210, BACK_Y - 260, 8, 260, '#57534E'); box(c, mx + 202, BACK_Y - 260, 8, 260, '#57534E');
    words(c, 'SIT WHERE THE STARS SAT', mx, BACK_Y - 270, print(1, '#FEF3C7'));
    box(c, mx + 230, BACK_Y - 110, 150, 40, '#000'); box(c, mx + 232, BACK_Y - 108, 146, 36, '#F8FAFC');
    words(c, 'WAIT FROM HERE', mx + 305, BACK_Y - 94, print(1, '#18181B')); words(c, '4 HOURS', mx + 305, BACK_Y - 80, brass(8));
  }
};

/** The lampposts' lamps (after dark), the marquee's bulbs. */
export const blvdLamps = (): Light[] => [
  ...LAMPS.map(([rx]) => ({ x: X(rx), y: BACK_Y - 205, r: 150, a: 0.85, color: '#FFE9A8' })),
  { x: X(MARQUEE_X), y: BACK_Y - 320, r: 300, a: 0.9, color: '#FBBF24' },
  { x: X(182), y: GY - 280, r: 200, a: 0.8, color: '#FDE047' },
];
