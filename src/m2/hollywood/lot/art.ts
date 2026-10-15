// The backlot, drawn (the crude first pass: readable boxes and the park's letters). The sky by the hour (gone red with
// ash once the real disasters are on), the HAPPYWOOD hill, soundstages and a water tower far off. Down here: the
// warehouse's smashed-open far wall and the dumpster full of dead Revengers at the start, the script's pages blowing
// down the lot, the merch carts, the studio gate, New York Street, the western town, the fake suburb, the gift shop,
// DISASTER: THE RIDE's doors. Steve's standees every screen.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { box, steveFlier, happywoodHill, realDisastersOn } from '../section';
import { GY, HWX, SECTIONS } from '../geometry';
import { drawTodSky, hourMix } from '../../timeOfDay';
import { X, Y, DUMP, BREAK, TOWER, PIT1, PIT2, GIFT, RIDE_DOORS, SOLIDS, LEDGES, SPEAKERS, STEVES, READERS } from './layout';
import {
  BACK, BACK_Y, inView, words, print, enamel, gate, brass, marquee, ledgeLip, sidewalk, hole, sawhorse, facade, palm,
} from '../blvd/paint';
import { drawPerson } from '../../adventure/temple/people';

type Ctx = CanvasRenderingContext2D;
const { x0, x1 } = SECTIONS.lot;

export const drawLotBackdrop = (c: Ctx, state: GameState) => {
  const W = 800, H = 600, cam = state.camera.x, real = realDisastersOn(state);
  drawTodSky(c, 0, 0, W, H, real ? ['#450A0A', '#7F1D1D', '#C2410C', '#FDBA74'] : ['#1E3A8A', '#3B82F6', '#93C5FD', '#FDE68A'], { horizon: 430, sun: [620, 120], moon: [160, 90] });
  happywoodHill(c, 560 - (cam - HWX) * 0.004, 430, hourMix('#A16207', '#92400E', '#3F2A14'));
  // (soundstages: big flat-roofed sheds with numbers, scrolling slow)
  const far = hourMix('#A8A29E', '#78716C', '#292524'), dark = hourMix('#78716C', '#57534E', '#1C1917');
  const off = -((cam * 0.22) % 220);
  for (let x = off - 220, k = 0; x < W + 220; x += 220, k++) {
    const n = k + Math.floor(cam * 0.22 / 220);
    const h = 90 + (n * 37 % 4) * 20;
    box(c, x, 430 - h, 190, h + 170, far); box(c, x, 430 - h, 190, 8, dark);
    words(c, `STAGE ${((n % 27) + 27) % 27 + 1}`, x + 95, 430 - h + 30, print(2, dark));
  }
  if (real) {
    // (ash coming down)
    c.fillStyle = 'rgba(214, 211, 209, 0.7)';
    for (let k = 0; k < 40; k++) { const ax = ((k * 97 + state.frame * (1 + k % 3)) % 820) - 10, ay = ((k * 151 + state.frame * 1.2) % 620) - 10; c.fillRect(ax, ay, 2, 2); }
  }
  return true;
};

// ---------------------------------------------------------------------------------------------------------------

/** The warehouse's far wall, smashed open by the bulldozer: the building's corrugated side, the jagged hole (dark
 *  inside, a sliver of green screen), siding and rebar torn outward, rubble strewn toward the dumpster. */
const wallBreak = (c: Ctx) => {
  const wx = X(BREAK.x), top = GY - 360;
  box(c, X(-400), top, wx - X(-400), GY - top, '#57534E');
  for (let x = X(-400); x < wx; x += 12) box(c, x, top, 2, GY - top, '#44403C');
  box(c, X(-400), top, wx - X(-400) + 6, 10, '#3F3F46');
  // (the hole: jagged, ground up)
  const ha = X(BREAK.a), hb = X(BREAK.b), ht = GY - BREAK.top;
  c.fillStyle = '#0C0A09'; c.beginPath(); c.moveTo(ha, GY);
  const pts = 9;
  for (let k = 0; k <= pts; k++) { const x = ha + ((hb - ha) * k) / pts; c.lineTo(x, ht + ((k * 37) % 5) * 9 - (k === 0 || k === pts ? -40 : 0)); }
  c.lineTo(hb + 6, GY); c.closePath(); c.fill();
  box(c, ha + 20, ht + 60, 40, 80, '#15803D');
  // (siding torn outward: bent sheets sticking out to the right, rebar bent with them)
  c.fillStyle = '#78716C';
  for (const [y, l] of [[ht + 10, 46], [ht + 70, 34], [ht + 140, 52]] as const) { c.beginPath(); c.moveTo(hb, y); c.lineTo(hb + l, y + 16); c.lineTo(hb + l - 6, y + 28); c.lineTo(hb, y + 18); c.closePath(); c.fill(); }
  c.strokeStyle = '#7C2D12'; c.lineWidth = 2; c.beginPath();
  for (const y of [ht + 30, ht + 100, ht + 170]) { c.moveTo(hb - 4, y); c.quadraticCurveTo(hb + 20, y - 10, hb + 34, y + 12); }
  c.stroke();
  // (rubble strewn on toward the dumpster, and the bulldozer's tracks)
  for (let k = 0; k < 14; k++) { const rx = hb + 10 + k * 22 + (k * 13 % 9), s = 6 + (k * 7) % 10; box(c, rx, GY - s * 0.6 + 2, s, s * 0.6, k % 2 ? '#A8A29E' : '#78716C'); }
  for (let x = hb; x < X(DUMP.a) - 160; x += 10) box(c, x, BACK_Y + 18, 6, 4, '#44403C');
  words(c, 'NO ENTRY: CLOSED SET', wx - 120, top + 40, enamel(8, '#EF4444'));
};

/** The bulldozer, crashed into the dumpster's left end, nose up on it. */
const bulldozer = (c: Ctx) => {
  const bx = X(DUMP.a) - 200, fy = BACK_Y + 12;
  c.save(); c.translate(bx, fy); c.rotate(-0.08);
  box(c, 0, -30, 180, 30, '#1C1917'); for (let k = 0; k < 8; k++) box(c, 6 + k * 22, -26, 14, 22, '#44403C');
  box(c, 20, -90, 120, 60, '#000'); box(c, 22, -88, 116, 56, '#EAB308');
  box(c, 60, -140, 64, 52, '#000'); box(c, 62, -138, 60, 48, '#CA8A04'); box(c, 68, -132, 48, 26, '#7DD3FC');
  box(c, 180, -100, 18, 96, '#000'); box(c, 182, -98, 14, 92, '#A16207');
  box(c, 150, -70, 34, 8, '#78350F');
  c.restore();
  // (steam off it, still)
};

/** THE DUMPSTER: a big green steel bin, set back against the warehouse, heaped with dead Revengers. */
const dumpster = (c: Ctx, f: number) => {
  const a = X(DUMP.a), b = X(DUMP.b), fy = BACK_Y + 12, rim = fy - DUMP.h + 12;
  // (the heap over the rim: bodies in suits, capes, masks, a leg up, an arm hanging out, blood)
  const SUITS = ['#1D4ED8', '#DC2626', '#15803D', '#7E22CE', '#F59E0B', '#18181B', '#0E7490', '#BE185D'];
  const SKIN = ['#F6DCC8', '#D9A877', '#A86B43', '#6E4426', '#F0C8A2', '#8D5A3B'];
  for (let k = 0; k < 16; k++) {
    const x = a + 14 + ((k * 61) % (b - a - 40)), y = rim - 8 - ((k * 23) % 60);
    c.save(); c.translate(x, y); c.rotate(((k * 0.9) % 3) - 1.5);
    box(c, -20, -7, 40, 14, SUITS[k % SUITS.length]); box(c, 18, -6, 12, 12, SKIN[k % SKIN.length]);
    if (k % 3 === 0) box(c, 18, -7, 12, 5, '#18181B');
    if (k % 4 === 1) { c.fillStyle = SUITS[(k + 3) % SUITS.length]; c.beginPath(); c.moveTo(-20, -6); c.lineTo(-44, 6); c.lineTo(-18, 8); c.closePath(); c.fill(); }
    c.restore();
  }
  // (a leg sticking up, a boot on it; an arm hanging over the front; a dropped mask, a shield)
  box(c, a + 120, rim - 110, 12, 70, '#DC2626'); box(c, a + 116, rim - 118, 20, 10, '#7F1D1D');
  box(c, a + 210, rim - 4, 10, 50, '#A86B43'); box(c, a + 206, rim + 44, 18, 8, '#A86B43');
  // (the bin)
  box(c, a - 2, rim - 2, b - a + 4, fy - rim + 2, '#000');
  box(c, a, rim, b - a, fy - rim, '#166534'); box(c, a, rim, b - a, 6, '#15803D');
  for (let x = a + 30; x < b - 20; x += 60) box(c, x, rim + 10, 4, fy - rim - 16, '#14532D');
  box(c, a + 10, fy - 6, 16, 6, '#18181B'); box(c, b - 26, fy - 6, 16, 6, '#18181B');
  words(c, 'HAPPYWOOD WASTE', (a + b) / 2, rim + 40, print(1, '#BBF7D0'));
  // (blood down the front)
  for (const [dx, l] of [[60, 40], [150, 70], [214, 30], [240, 55]] as const) { box(c, a + dx, rim, 5, l, '#7F1D1D'); box(c, a + dx + 1, rim + l, 4, 4, '#991B1B'); }
  // (flies)
  for (let k = 0; k < 6; k++) box(c, a + 60 + ((k * 43 + f * (k + 1)) % 180), rim - 40 + Math.sin(f * 0.2 + k) * 14, 2, 2, '#18181B');
};

/** The script's pages: blowing along down the lot (more near the dumpster), and lying about. */
const pages = (c: Ctx, state: GameState) => {
  const f = state.frame, cam = state.camera.x;
  for (let k = 0; k < 18; k++) {
    const span = 1800, px0 = X(DUMP.a) + ((k * 211 + f * (0.8 + (k % 4) * 0.3)) % span);
    if (px0 < cam - 20 || px0 > cam + 820) continue;
    const py = GY - 60 - ((k * 71) % 260) + Math.sin(f * 0.05 + k) * 20;
    c.save(); c.translate(px0, py); c.rotate(Math.sin(f * 0.08 + k) * 0.8);
    box(c, -6, -8, 12, 16, '#F8FAFC'); box(c, -4, -5, 8, 1, '#A8A29E'); box(c, -4, -2, 8, 1, '#A8A29E'); box(c, -4, 1, 6, 1, '#A8A29E');
    c.restore();
  }
  for (let rx = DUMP.a - 100; rx < 2600; rx += 70 + ((rx * 7) % 50)) if (inView(state, X(rx), X(rx) + 12)) { box(c, X(rx), BACK_Y + 14 + (rx % 3) * 6, 12, 5, '#F5F5F4'); }
};

/** A Revengers merch cart: a striped umbrella, shirts hung up, the tagline. */
const merchCart = (c: Ctx, x: number, f: number) => {
  const fy = BACK_Y + 10;
  for (const wx of [x - 34, x + 34]) { box(c, wx - 9, fy - 18, 18, 18, '#18181B'); box(c, wx - 4, fy - 13, 8, 8, '#71717A'); }
  box(c, x - 50, fy - 70, 100, 54, '#000'); box(c, x - 48, fy - 68, 96, 50, '#1E3A8A');
  box(c, x - 3, fy - 150, 6, 82, '#71717A');
  for (let k = 0; k < 6; k++) { c.fillStyle = k % 2 ? '#DC2626' : '#F8FAFC'; c.beginPath(); c.moveTo(x, fy - 160); c.lineTo(x - 70 + k * 23.3, fy - 128); c.lineTo(x - 70 + (k + 1) * 23.3, fy - 128); c.closePath(); c.fill(); }
  // (the shirts on a line: I READ THE SCRIPT / tagline)
  for (let k = 0; k < 3; k++) { box(c, x - 46 + k * 32, fy - 118, 26, 26, ['#F8FAFC', '#FDE047', '#18181B'][k]); box(c, x - 52 + k * 32, fy - 118, 38, 7, ['#F8FAFC', '#FDE047', '#18181B'][k]); }
  words(c, 'REVENGERS', x, fy - 52, gate(10, '#FDE047', '#1E3A8A'));
  words(c, 'RESEMBLE', x, fy - 34, print(1, '#F8FAFC'));
  words(c, 'I READ IT FIRST $35', x, fy - 22, print(1, '#FDE68A'));
  void f;
};

/** A guest reading a leaked page (held up to the face). */
const reader = (c: Ctx, x: number, seed: number, f: number) => {
  c.save(); c.translate(x, BACK_Y + 10); c.scale(seed % 2 ? 0.92 : -0.92, 0.92);
  drawPerson(c, { seed, outfit: 'guest', f, pose: 'hold', mood: seed % 3 ? 'shocked' : 'happy' });
  box(c, 6, -86, 14, 18, '#F8FAFC'); box(c, 8, -82, 10, 1, '#A8A29E'); box(c, 8, -78, 10, 1, '#A8A29E');
  c.restore();
};

const FRONTS: [number, number, number, string, string?][] = [
  // New York
  [1550, 260, 300, '#9A3412', 'DELI'], [1850, 280, 320, '#7C2D12'], [2120, 260, 300, '#9A3412', 'PAWN'], [2400, 300, 340, '#78350F', 'HOTEL'],
  // the western town
  [4800, 220, 220, '#92400E', 'SALOON'], [5050, 200, 200, '#A16207', 'SHERIFF'], [5640, 240, 230, '#78350F', 'BANK'],
  // the fake suburb (the same house)
  [6650, 200, 180, '#FDE68A'], [6870, 200, 180, '#BFDBFE'], [7780, 200, 180, '#FBCFE8'], [7990, 200, 180, '#BBF7D0'],
];

export const drawLotBack = (c: Ctx, state: GameState) => {
  const f = state.frame, real = realDisastersOn(state);
  // The fronts at the back, the sidewalk
  for (const [rx, w, h, wall, name] of FRONTS) if (inView(state, X(rx) - 30, X(rx) + w + 30)) {
    facade(c, X(rx), w, h, wall, name, name ? enamel(10, '#FEF3C7', '#000') : undefined);
    // (painted-on fire escapes on New York's: dim, flat, scenery)
    if (rx < 3000 && !name) for (let y = BACK_Y - 110; y > BACK_Y - h + 40; y -= 100) box(c, X(rx) + 30, y, w - 60, 3, 'rgba(0,0,0,0.3)');
    // (the suburb's: a roof, a lawn)
    if (rx > 6500) { c.fillStyle = '#7F1D1D'; c.beginPath(); c.moveTo(X(rx) - 10, BACK_Y - h); c.lineTo(X(rx) + w / 2, BACK_Y - h - 60); c.lineTo(X(rx) + w + 10, BACK_Y - h); c.closePath(); c.fill(); box(c, X(rx), BACK_Y - 6, w, 6, '#4D7C0F'); }
  }
  sidewalk(c, state, x0 - 200, x1 + 200, '#A8A29E', '#78716C');
  if (inView(state, X(-500), X(DUMP.b) + 100)) { wallBreak(c); }
  if (inView(state, X(DUMP.a) - 260, X(DUMP.b) + 60)) { bulldozer(c); dumpster(c, f); }
  pages(c, state);
  for (const rx of [880, 1180]) if (inView(state, X(rx) - 90, X(rx) + 90)) merchCart(c, X(rx), f);
  for (const [rx, seed] of READERS) if (inView(state, X(rx) - 30, X(rx) + 30)) reader(c, X(rx), seed, f);
  // The studio gate
  if (inView(state, X(1300), X(1700))) {
    box(c, X(1340), GY - 280, 16, 280, '#E7E5E4'); box(c, X(1560), GY - 280, 16, 280, '#E7E5E4');
    box(c, X(1320), GY - 330, 276, 60, '#000'); box(c, X(1322), GY - 328, 272, 56, '#1C1917');
    words(c, 'HAPPYWOOD STUDIOS', X(1458), GY - 305, gate(12, '#FDE68A', '#1C1917'));
    words(c, 'NOTHING FILMED HERE SINCE 1987', X(1458), GY - 284, print(1, '#E7E5E4'));
  }
  // The rain rig's sign
  if (inView(state, X(1600), X(2800))) { box(c, X(2180), GY - 470, 160, 30, '#000'); words(c, 'RAINSTORM EFFECT', X(2260), GY - 451, print(1, '#FACC15')); }
  // The flood tank's signs
  if (inView(state, X(3100), X(4300))) { box(c, X(3120), GY - 150, 6, 150, '#71717A'); box(c, X(3040), GY - 200, 170, 54, '#000'); box(c, X(3042), GY - 198, 166, 50, '#0369A1'); words(c, 'FLASH FLOOD!', X(3125), GY - 178, enamel(10, '#F0F9FF')); words(c, 'GUESTS MAY GET WET', X(3125), GY - 158, print(1, '#BAE6FD')); }
  // The water tower
  if (inView(state, X(TOWER.x) - 60, X(TOWER.x + TOWER.w) + 60)) {
    for (const lx of [X(TOWER.x) + 14, X(TOWER.x + TOWER.w) - 22]) box(c, lx, Y(TOWER.h), 8, TOWER.h, '#57534E');
    c.strokeStyle = '#57534E'; c.lineWidth = 2; c.beginPath(); c.moveTo(X(TOWER.x) + 18, Y(TOWER.h) + 20); c.lineTo(X(TOWER.x + TOWER.w) - 18, GY - 10); c.moveTo(X(TOWER.x + TOWER.w) - 18, Y(TOWER.h) + 20); c.lineTo(X(TOWER.x) + 18, GY - 10); c.stroke();
    box(c, X(TOWER.x) + 10, Y(TOWER.h) - 150, TOWER.w - 20, 150, '#000'); box(c, X(TOWER.x) + 12, Y(TOWER.h) - 148, TOWER.w - 24, 146, '#A8A29E');
    c.fillStyle = '#78716C'; c.beginPath(); c.moveTo(X(TOWER.x) + 4, Y(TOWER.h) - 150); c.lineTo(X(TOWER.x + TOWER.w / 2), Y(TOWER.h) - 210); c.lineTo(X(TOWER.x + TOWER.w) - 4, Y(TOWER.h) - 150); c.closePath(); c.fill();
    words(c, 'HAPPYWOOD', X(TOWER.x + TOWER.w / 2), Y(TOWER.h) - 80, enamel(10, '#1E3A8A'));
  }
  // The pits
  if (inView(state, X(PIT1.a), X(PIT1.b))) { hole(c, X(PIT1.a), X(PIT1.b)); sawhorse(c, X(PIT1.a) - 40, f, 'CLOSED 1991'); box(c, X(PIT1.a) + 80, BACK_Y - 64, 240, 44, '#000'); words(c, 'MAIN STREET COLLAPSE', X(PIT1.a) + 200, BACK_Y - 46, print(1, '#FDE68A')); words(c, 'STUNT SHOW CLOSED 1991', X(PIT1.a) + 200, BACK_Y - 32, print(1, '#E7E5E4')); }
  if (inView(state, X(PIT2.a), X(PIT2.b))) { hole(c, X(PIT2.a), X(PIT2.b)); box(c, X(PIT2.a) + 200, BACK_Y - 64, 300, 44, '#000'); words(c, 'FUTURE HOMES OF THE STARS', X(PIT2.a) + 350, BACK_Y - 46, print(1, '#FDE68A')); words(c, 'BEHIND EVERY HOUSE: NOTHING', X(PIT2.a) + 350, BACK_Y - 32, print(1, '#E7E5E4')); }
  // The gift shop: its front's open (the shelves, the plushies, the shirts), walked through
  if (inView(state, X(GIFT.a), X(GIFT.b))) {
    box(c, X(GIFT.a), BACK_Y - 280, GIFT.b - GIFT.a, 280, '#000'); box(c, X(GIFT.a) + 2, BACK_Y - 278, GIFT.b - GIFT.a - 4, 276, '#FEF3C7');
    for (let y = BACK_Y - 220; y < BACK_Y - 40; y += 60) { box(c, X(GIFT.a) + 20, y, GIFT.b - GIFT.a - 40, 4, '#92400E'); for (let x = X(GIFT.a) + 30; x < X(GIFT.b) - 30; x += 34) { box(c, x, y - 22, 20, 22, ['#1D4ED8', '#DC2626', '#15803D', '#F59E0B'][((x + y) / 2 | 0) % 4]); box(c, x + 5, y - 30, 10, 10, '#F6DCC8'); } }
    box(c, X(GIFT.a) - 10, BACK_Y - 320, GIFT.b - GIFT.a + 20, 44, '#7F1D1D');
    words(c, 'EXIT THROUGH THE GIFT SHOP', (X(GIFT.a) + X(GIFT.b)) / 2, BACK_Y - 290, gate(12, '#FDE68A', '#7F1D1D'));
    words(c, 'REVENGERS: RESEMBLE PLUSH $40', (X(GIFT.a) + X(GIFT.b)) / 2, BACK_Y - 250, print(1, '#7F1D1D'));
  }
  // DISASTER: THE RIDE: its building, its doors (in, at the end)
  if (inView(state, X(RIDE_DOORS) - 300, X(RIDE_DOORS) + 400)) {
    const dx = X(RIDE_DOORS);
    box(c, dx - 160, BACK_Y - 380, 520, 380, '#000'); box(c, dx - 158, BACK_Y - 378, 516, 378, '#44403C');
    for (let k = 0; k < 5; k++) { c.strokeStyle = '#1C1917'; c.lineWidth = 2; c.beginPath(); c.moveTo(dx - 120 + k * 100, BACK_Y - 378); c.lineTo(dx - 100 + k * 100 + (k % 2) * 20, BACK_Y - 300); c.lineTo(dx - 110 + k * 100, BACK_Y - 250); c.stroke(); }
    box(c, dx - 140, BACK_Y - 360, 480, 70, '#1C1917');
    words(c, 'DISASTER:', dx + 100, BACK_Y - 328, marquee(3, 3, '#F97316', f % 40 < 30));
    words(c, 'THE RIDE', dx + 100, BACK_Y - 298, gate(14, '#FDE047', '#7C2D12'));
    words(c, 'FEEL THE FURY OF NATURE (MILDLY)', dx + 100, BACK_Y - 270, print(1, '#E7E5E4'));
    box(c, dx - 50, BACK_Y - 130, 100, 130, '#0C0A09'); box(c, dx - 2, BACK_Y - 130, 4, 130, '#57534E');
    box(c, dx - 60, BACK_Y - 140, 120, 10, '#F97316');
  }
  // Steve: a standee every screen, posters
  for (const [rx, kind] of STEVES) if (inView(state, X(rx) - 60, X(rx) + 60)) steveFlier(c, X(rx), kind === 'standee' ? BACK_Y + 8 : BACK_Y - 150, kind, rx);
  // The PA horns on their poles
  for (const rx of SPEAKERS) if (inView(state, X(rx) - 20, X(rx) + 40)) { box(c, X(rx) - 3, BACK_Y - 220, 6, 228, '#3F3F46'); c.fillStyle = '#71717A'; c.beginPath(); c.moveTo(X(rx) + 3, BACK_Y - 214); c.lineTo(X(rx) + 22, BACK_Y - 224); c.lineTo(X(rx) + 22, BACK_Y - 196); c.lineTo(X(rx) + 3, BACK_Y - 204); c.closePath(); c.fill(); }
  for (const rx of [3000, 4600, 6550]) if (inView(state, X(rx) - 60, X(rx) + 60)) palm(c, X(rx), BACK_Y + 4, 220, f);
  // The solid things and the ledges (standable: lit lips)
  for (const [rx, h, w, what] of SOLIDS) {
    if (!inView(state, X(rx), X(rx) + w)) continue;
    const body = what === 'crate' ? '#92400E' : what === 'trough' ? '#78350F' : '#7F1D1D';
    ledgeLip(c, X(rx), Y(h), w, body, '#FDE68A', h);
    if (what === 'crate') { c.strokeStyle = '#451A03'; c.lineWidth = 2; c.beginPath(); c.moveTo(X(rx) + 3, Y(h) + 3); c.lineTo(X(rx) + w - 3, GY - 3); c.moveTo(X(rx) + w - 3, Y(h) + 3); c.lineTo(X(rx) + 3, GY - 3); c.stroke(); }
    if (what === 'trough') box(c, X(rx) + 6, Y(h) + 6, w - 12, 8, '#38BDF8');
    if (what === 'counter') words(c, 'REGISTER', X(rx) + w / 2, Y(h) + 30, print(1, '#FDE68A'));
  }
  for (const [rx, h, w, what] of LEDGES) {
    if (!inView(state, X(rx), X(rx) + w)) continue;
    if (what === 'tower') { ledgeLip(c, X(rx), Y(h), w, '#57534E'); continue; }
    const body = what === 'escape' ? '#27272A' : what === 'porch' ? '#78350F' : '#92400E';
    if (what === 'escape') { box(c, X(rx) + 4, Y(h), 3, h, '#3F3F46'); box(c, X(rx) + w - 7, Y(h), 3, h, '#3F3F46'); for (let k = 0; k < w; k += 10) box(c, X(rx) + k, Y(h) - 18, 2, 18, '#3F3F46'); }
    if (what === 'porch') { box(c, X(rx) + 6, Y(h), 6, h, '#451A03'); box(c, X(rx) + w - 12, Y(h), 6, h, '#451A03'); }
    ledgeLip(c, X(rx), Y(h), w, body);
  }
  if (real) {
    // (the weather's got in: puddles of it, ash settling, the wind tearing at the fliers)
    for (let rx = 200; rx < 9000; rx += 260) if (inView(state, X(rx), X(rx) + 80)) { c.fillStyle = 'rgba(120, 113, 108, 0.5)'; c.beginPath(); c.ellipse(X(rx), GY + 3, 40, 4, 0, 0, Math.PI * 2); c.fill(); }
  }
  void BACK; void brass;
};

/** Lit after dark: the ride's sign, the gift shop, the gate. */
export const lotLamps = (): Light[] => [
  { x: X(RIDE_DOORS) + 100, y: BACK_Y - 320, r: 280, a: 0.9, color: '#F97316' },
  { x: X((GIFT.a + GIFT.b) / 2), y: BACK_Y - 290, r: 240, a: 0.8, color: '#FDE68A' },
  { x: X(1458), y: GY - 300, r: 200, a: 0.8, color: '#FDE68A' },
  ...SPEAKERS.map(rx => ({ x: X(rx), y: BACK_Y - 230, r: 120, a: 0.6, color: '#FFE9A8' })),
];
