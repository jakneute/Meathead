// The town, drawn crude (the prototype pass: Atari-2600 boxes and flat colors, every sign on something; the real look
// comes in the final pass). The backdrop: a gloomy sky (by the hour), the ELEVATOR TO HELL's clock tower far off (its
// car going up and dropping, all the way along), the town's rooftops nearer. In the world: the shopfronts at the back
// of the street (dimmed: not to stand on, but their balconies are, lit along the top), the haunted kiddie rides, the
// modern conveniences, the gas lamps, the ground, the stairs, and the castle at the top of them.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { stamp } from '../../../m1/game/render/stamp';
import { drawTodSky, timeOfDay, hourMix } from '../../timeOfDay';
import { box, label, groundBox, ledgeBox, postSign, wallSign } from '../section';
import { SECTIONS, GY } from '../geometry';
import { X, Y, STAIRS, RAMP, LEDGES, RIDES, LAMPS, type RideId } from './layout';

type Ctx = CanvasRenderingContext2D;
const { x0, x1 } = SECTIONS.town;

// ---------------------------------------------------------------------------------------------------------------
// The backdrop (screen space)

const SKY = ['#34304E', '#423C5E', '#544A6C', '#685A78', '#7E6C82', '#94808A'];
/** The ELEVATOR TO HELL's ride: up the tower slow, a hold at the top, then the drop (frames). */
const RIDE_UP = 420, RIDE_HOLD = 90, RIDE_DROP = 22, RIDE_REST = 120;

export const drawTownBackdrop = (c: Ctx, state: GameState) => {
  const camX = state.camera.x - x0, up = Math.max(0, -state.camera.y);
  const oy = up * 0.12, horizon = 440 + oy;
  drawTodSky(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, SKY, { bands: 12, sun: [150, 120 + oy], moon: [150, 100 + oy], horizon, t: state.frame });
  // (a low gloomy cloud bank, drifting)
  const cloud = hourMix('#4B3F5E', '#5A3E58', '#262036');
  for (let i = 0; i < 6; i++) { const cx = ((i * 190 - camX * 0.01 - state.frame * 0.08) % 1140 + 1140) % 1140 - 170; box(c, cx, 150 + (i % 3) * 26 + oy * 0.5, 170, 16, cloud); box(c, cx + 30, 140 + (i % 3) * 26 + oy * 0.5, 100, 12, cloud); }
  // The far hills
  const hill = hourMix('#2A1F3E', '#2B1A33', '#120C1E');
  for (let i = 0; i < 9; i++) { const hx = i * 140 - (camX * 0.02) % 140 - 140; box(c, hx, horizon - 30 - (i % 3) * 14, 150, 200, hill); }
  // The ELEVATOR TO HELL: a big clock tower, far off (slides only a little across the whole town: it's always there)
  const tx = 560 - camX * 0.022, top = 70 + oy, base = horizon + 10;
  const tw = hourMix('#2C2244', '#2E1F3A', '#161024'), tl = hourMix('#3B2F58', '#3E2A4A', '#211833');
  box(c, tx - 50, top + 70, 100, base - top - 70, tw);
  box(c, tx - 50, top + 70, 6, base - top - 70, tl);
  box(c, tx - 60, top + 60, 120, 14, tl);
  // (its pointed roof, stepped)
  for (let i = 0; i < 6; i++) box(c, tx - 44 + i * 7, top + 60 - (i + 1) * 10, 88 - i * 14, 10, tw);
  box(c, tx - 2, top - 14, 4, 16, tw);
  // (the clock: the hands go round)
  box(c, tx - 26, top + 88, 52, 52, '#0F0B18');
  box(c, tx - 23, top + 91, 46, 46, '#D9C98A');
  const t = state.frame * 0.002;
  c.save(); c.translate(tx, top + 114);
  c.strokeStyle = '#1E1036'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.sin(t) * 18, -Math.cos(t) * 18); c.stroke();
  c.lineWidth = 4; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.sin(t / 12) * 12, -Math.cos(t / 12) * 12); c.stroke();
  c.restore();
  // (the ride's sign, bolted to the front of it, lit red)
  const glow = 0.6 + 0.4 * Math.max(timeOfDay().lamps, (Math.floor(state.frame / 20) % 6 ? 1 : 0.4));
  box(c, tx - 58, top + 156, 116, 44, '#0F0B18');
  box(c, tx - 55, top + 159, 110, 38, `rgba(127, 29, 29, ${glow.toFixed(2)})`);
  label(c, 'ELEVATOR', tx, top + 175, '#FECACA', 8);
  label(c, 'TO HELL', tx, top + 190, '#FECACA', 8);
  // (the track up its side, and the car: up slow, a moment at the top, then the drop)
  box(c, tx + 50, top + 80, 8, base - top - 80, '#18121F');
  for (let y = top + 86; y < base; y += 14) box(c, tx + 50, y, 8, 2, '#3F3550');
  const cyc = RIDE_UP + RIDE_HOLD + RIDE_DROP + RIDE_REST, k = state.frame % cyc;
  const lo = base - 30, hi = top + 90;
  const carY = k < RIDE_UP ? lo - (lo - hi) * (k / RIDE_UP) : k < RIDE_UP + RIDE_HOLD ? hi : k < RIDE_UP + RIDE_HOLD + RIDE_DROP ? hi + (lo - hi) * ((k - RIDE_UP - RIDE_HOLD) / RIDE_DROP) ** 2 : lo;
  box(c, tx + 56, carY, 22, 20, '#7F1D1D');
  box(c, tx + 58, carY + 3, 18, 7, '#FDE68A');
  // (the dots of the riders' heads in its window)
  for (let i = 0; i < 3; i++) box(c, tx + 60 + i * 5, carY + 5, 3, 3, '#3F2A1A');
  // The town's rooftops, nearer (gables, chimneys, a lit window or two)
  const roof = hourMix('#1B1526', '#1D1422', '#0C0912'), win = hourMix('#5B4A2A', '#8A5A2A', '#E0A94A');
  const off = (camX * 0.3) % 600;
  for (let i = -1; i < 3; i++) {
    const bx = i * 600 - off;
    for (const [dx, w, h] of [[0, 120, 120], [130, 90, 160], [230, 140, 110], [380, 100, 150], [490, 110, 125]] as const) {
      const y = horizon + 30 - h + oy * 0.6;
      box(c, bx + dx, y, w, CANVAS_HEIGHT, roof);
      for (let s = 0; s < 4; s++) box(c, bx + dx + s * 8, y - s * 10, w - s * 16, 10, roof);
      box(c, bx + dx + w - 26, y - 34, 12, 26, roof);
      box(c, bx + dx + 20, y + 30, 10, 14, win);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The world (world space, behind everything that moves)

/** The shopfronts along the back of the street: [x, w, h, color, sign]. Balconies drawn where the ledges are. */
const SHOPS: [number, number, number, string, string][] = [
  [450, 300, 250, '#2E2338', 'APOTHECARY - NOW WITH PHARMACY DRIVE-THRU'],
  [800, 240, 220, '#33263A', ''],
  [1820, 520, 300, '#2B2233', 'POTION SHOPPE - TAP TO PAY'],
  [3000, 300, 240, '#30253A', 'CANDLES (BATTERY OPERATED)'],
  [5500, 340, 260, '#2D2236', 'FORTUNES TOLD - CARDS ACCEPTED'],
  [7520, 760, 300, '#2B2233', 'YE OLDE SMOOTHIE BAR'],
  [8450, 300, 230, '#33263A', 'CURSED GIFTS & SUNSCREEN'],
];

/** (the stamps with words on them: painted again once the pixel font's in, if it wasn't the first time) */
const fontIn = () => (typeof document !== 'undefined' && document.fonts?.check('8px "Press Start 2P"') ? 'f' : 'n');

const inView = (state: GameState, a: number, b: number) => b > state.camera.x - 300 && a < state.camera.x + CANVAS_WIDTH + 300;

const paintShop = (g: Ctx, x: number, w: number, h: number, col: string, sign: string) => {
  const top = GY - h;
  box(g, x, top, w, h, col);
  for (let s = 0; s < 3; s++) box(g, x + 10 + s * 12, top - 12 - s * 12, w - 20 - s * 24, 12, col);
  box(g, x + w - 50, top - 60, 18, 40, col);
  // (windows, in rows; the door)
  for (let row = 0; row < 2; row++) for (let wx = x + 24; wx < x + w - 40; wx += 70) box(g, wx, top + 30 + row * 80, 30, 44, '#1A1424');
  box(g, x + w / 2 - 20, GY - 70, 40, 70, '#120E18');
  if (sign) wallSign(g, x + w / 2, GY - 92, sign, '#1E1036', '#E9D5FF');
};

const drawShops = (c: Ctx, state: GameState) => {
  const lit = timeOfDay().lamps;
  SHOPS.forEach(([rx, w, h, col, sign], i) => {
    const x = X(rx);
    if (!inView(state, x, x + w)) return;
    stamp(c, `town-shop${i}${fontIn()}`, x - 20, GY - h - 80, w + 40, h + 80, g => paintShop(g, x, w, h, col, sign));
    // (lit windows after dark)
    if (lit > 0.1) for (let row = 0; row < 2; row++) for (let wx = x + 24; wx < x + w - 40; wx += 70) if ((wx + row * 3) % 4 < 2) box(c, wx + 2, GY - h + 32 + row * 80, 26, 40, `rgba(224, 169, 74, ${(0.5 * lit).toFixed(2)})`);
  });
};

/** A balcony (or a platform) to stand on: brackets under it, its lit top lip. */
const drawLedges = (c: Ctx, state: GameState) => {
  LEDGES.forEach(([rx, h, w], i) => {
    const x = X(rx);
    if (!inView(state, x, x + w)) return;
    // (the carousel's roof, the restrooms' roof: their own tops, lit along the edge)
    if (i === 3) { ledgeBox(c, x, Y(h), w, '#6B21A8', '#E9D5FF'); return; }
    if (i === 4) { ledgeBox(c, x, Y(h), w, '#5E5868', '#C4BCD4'); return; }
    ledgeBox(c, x, Y(h), w, '#57483A', '#D6B98A');
    box(c, x + 10, Y(h) + 16, 6, 14, '#3F3428'); box(c, x + w - 16, Y(h) + 16, 6, 14, '#3F3428');
    // (the railing, behind)
    box(c, x, Y(h) - 26, w, 3, '#27272A');
    for (let px = x + 4; px < x + w; px += 14) box(c, px, Y(h) - 26, 2, 26, '#27272A');
  });
};

// The ground: the cobbled street, the ramp and the terrace, the stairs
const STONE = '#3F3A4A', LIP = '#9A93AE';
const drawGround = (c: Ctx, state: GameState) => {
  const L = state.camera.x - 100, R = state.camera.x + CANVAS_WIDTH + 100;
  // (the street)
  for (const [a, b] of [[-200, RAMP.r0], [RAMP.t1, STAIRS.a0]] as const) if (X(b) > L && X(a) < R) {
    groundBox(c, Math.max(L, X(a)), Math.min(R, X(b)), GY, STONE, LIP);
    for (let x = Math.floor(Math.max(L, X(a)) / 24) * 24; x < Math.min(R, X(b)); x += 24) box(c, x, GY + 8 + ((x / 24) % 2) * 6, 14, 3, '#352F40');
  }
  // (the ADA ramp: a slope with a handrail, up to the terrace; the terrace's front wall)
  if (X(RAMP.t1) > L && X(RAMP.r0) < R) {
    c.fillStyle = '#4A4458';
    c.beginPath(); c.moveTo(X(RAMP.r0), GY); c.lineTo(X(RAMP.r1), Y(RAMP.h)); c.lineTo(X(RAMP.r1), GY + 400); c.lineTo(X(RAMP.r0), GY + 400); c.fill();
    c.strokeStyle = LIP; c.lineWidth = 4; c.beginPath(); c.moveTo(X(RAMP.r0), GY + 1); c.lineTo(X(RAMP.r1), Y(RAMP.h) + 1); c.stroke();
    c.strokeStyle = '#A1A1AA'; c.lineWidth = 3; c.beginPath(); c.moveTo(X(RAMP.r0) + 10, GY - 40); c.lineTo(X(RAMP.r1), Y(RAMP.h) - 40); c.lineTo(X(RAMP.r1 + 60), Y(RAMP.h) - 40); c.stroke();
    for (let i = 0; i <= 5; i++) { const k = i / 5; box(c, X(RAMP.r0 + 10 + (RAMP.r1 - RAMP.r0 - 10) * k), GY - 40 - RAMP.h * k, 3, 40, '#71717A'); }
    groundBox(c, X(RAMP.r1), X(RAMP.t1), Y(RAMP.h), '#4A4458', LIP);
    box(c, X(RAMP.t1) - 6, Y(RAMP.h), 6, RAMP.h, '#2A2533');
    for (let y = Y(RAMP.h) + 16; y < GY; y += 18) box(c, X(RAMP.r1) + 4, y, X(RAMP.t1) - X(RAMP.r1) - 10, 2, '#3A3446');
  }
  // (the stairs: two flights, the landing; the castle's own stone at the top)
  if (X(12040) > L && X(STAIRS.a0) < R) {
    const flight = (a: number, b: number, h0: number, h1: number, n: number) => {
      const dx = (X(b) - X(a)) / n, dy = (h1 - h0) / n;
      for (let i = 0; i < n; i++) {
        const sx = X(a) + i * dx;
        if (sx + dx < L || sx > R) continue;
        const sy = Y(h0 + (i + 1) * dy);
        box(c, sx, sy, dx + 1, GY + 400 - sy, '#4A4458');
        box(c, sx, sy, dx + 1, 3, LIP);
        box(c, sx + dx - 2, sy, 2, dy, '#2E2938');
      }
    };
    flight(STAIRS.a0, STAIRS.a1, 0, STAIRS.mid, 20);
    groundBox(c, X(STAIRS.a1), X(STAIRS.land1), Y(STAIRS.mid), '#4A4458', LIP);
    box(c, X(STAIRS.a1), Y(STAIRS.mid) + 400, X(STAIRS.land1) - X(STAIRS.a1), STAIRS.mid, '#4A4458');
    flight(STAIRS.land1, STAIRS.b1, STAIRS.mid, STAIRS.top, 20);
    groundBox(c, X(STAIRS.b1), X(12040), Y(STAIRS.top), '#4A4458', LIP);
    box(c, X(STAIRS.b1), Y(STAIRS.top) + 400, X(12040) - X(STAIRS.b1), STAIRS.top, '#4A4458');
    // (the balustrades up the side, behind)
    c.strokeStyle = '#27272A'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(X(STAIRS.a0), GY - 46); c.lineTo(X(STAIRS.a1), Y(STAIRS.mid) - 46); c.lineTo(X(STAIRS.land1), Y(STAIRS.mid) - 46); c.lineTo(X(STAIRS.b1), Y(STAIRS.top) - 46); c.stroke();
  }
};

// The castle at the top of the stairs: DRACULA'S OTHER CASTLE (its front, its door: in, to the castle)
const paintCastle = (g: Ctx) => {
  const L = X(11250), R = x1 + 40, base = Y(STAIRS.top), top = base - 640;
  box(g, L, top, R - L, base - top, '#27202F');
  for (let x = L; x < R; x += 50) box(g, x, top - 30, 30, 30, '#27202F');
  // (towers either side of the door)
  box(g, X(11700), top - 160, 120, 160, '#2C2434');
  for (let x = X(11700); x < X(11820); x += 30) box(g, x, top - 186, 18, 26, '#2C2434');
  for (let row = 0; row < 4; row++) for (let wx = L + 60; wx < R - 60; wx += 120) box(g, wx, top + 60 + row * 130, 26, 50, '#140F1A');
  // (the ride's own sign over the door: it's a theme park's castle)
  wallSign(g, x1 - 160, base - 230, "DRACULA'S OTHER CASTLE", '#450A0A', '#FECACA');
  wallSign(g, x1 - 160, base - 200, 'NO FLASH PHOTOGRAPHY - NO STROLLERS', '#1E1036', '#E9D5FF');
  // (the door: big, studded, open a crack)
  box(g, x1 - 130, base - 170, 100, 170, '#57534E');
  box(g, x1 - 120, base - 160, 80, 160, '#3B2416');
  box(g, x1 - 82, base - 160, 6, 160, '#09090B');
  for (let y = base - 150; y < base; y += 24) { box(g, x1 - 112, y, 4, 4, '#A8A29E'); box(g, x1 - 52, y, 4, 4, '#A8A29E'); }
};
const drawCastle = (c: Ctx, state: GameState) => {
  if (!inView(state, X(11250), x1 + 40)) return;
  const base = Y(STAIRS.top);
  stamp(c, `town-castle${fontIn()}`, X(11250) - 10, base - 840, x1 + 60 - X(11250), 860, paintCastle);
};

// ---------------------------------------------------------------------------------------------------------------
// The haunted kiddie rides (they move: drawn live, crude, only in view)

const drawRide = (c: Ctx, id: RideId, x: number, f: number) => {
  switch (id) {
    case 'cups': {
      // Spinning coffins, each with a kid's head poking up, round a turntable
      box(c, x - 150, GY - 14, 300, 14, '#3B2F4A'); box(c, x - 150, GY - 14, 300, 2, '#6B5A7E');
      box(c, x - 6, GY - 70, 12, 56, '#52525B');
      const cups = [0, 1, 2, 3].map(i => { const a = f * 0.02 + (i * Math.PI) / 2; return { a, dx: Math.cos(a) * 110, z: Math.sin(a) }; }).sort((p, q) => p.z - q.z);
      for (const cup of cups) {
        const s = 0.8 + cup.z * 0.15, cx = x + cup.dx, w = 50 * s, h = 26 * s;
        box(c, cx - w / 2, GY - 14 - h, w, h, '#4A2C1A');
        box(c, cx - w / 2 + 3, GY - 14 - h + 3, w - 6, 4, '#78350F');
        box(c, cx - 6 * s, GY - 14 - h - 10 * s, 12 * s, 10 * s, ['#F0C8A2', '#A86B43', '#6E4426', '#F6DCC8'][Math.floor(cup.a / (Math.PI / 2)) & 3]);
      }
      postSign(c, x + 210, GY, 'SPINNING COFFIN CUPS', '#3B0764', '#F5D0FE');
      postSign(c, x - 220, GY, 'MUST BE THIS SHORT', '#1E1036', '#E9D5FF');
      break;
    }
    case 'carousel': {
      // The BAT-O-ROUND: its roof (the ledge) on a center pole, bats on poles going round
      const rx0 = x - 165, w = 330, roofY = GY - 170;
      box(c, x - 8, roofY, 16, 170, '#A16207');
      box(c, rx0, GY - 20, w, 20, '#3B2F4A'); box(c, rx0, GY - 20, w, 2, '#6B5A7E');
      // (the canopy's scalloped valance under the roof, the sign on it)
      box(c, rx0, roofY + 16, w, 18, '#581C87');
      for (let sx = rx0; sx < rx0 + w; sx += 22) box(c, sx, roofY + 34, 14, 6, '#581C87');
      label(c, 'BAT-O-ROUND', x, roofY + 30, '#F5D0FE', 8);
      const bats = [0, 1, 2, 3, 4, 5].map(i => { const a = f * 0.025 + (i * Math.PI) / 3; return { dx: Math.cos(a) * 130, z: Math.sin(a), bob: Math.sin(f * 0.08 + i) * 10 }; }).sort((p, q) => p.z - q.z);
      for (const b of bats) {
        const bx = x + b.dx, s = 0.85 + b.z * 0.15;
        box(c, bx - 1, roofY + 40, 3, 130 - 20, '#D4D4D8');
        const by = GY - 80 + b.bob;
        box(c, bx - 12 * s, by, 24 * s, 14 * s, '#18181B');
        box(c, bx - 28 * s, by - 6 * s, 16 * s, 10 * s, '#27272A'); box(c, bx + 12 * s, by - 6 * s, 16 * s, 10 * s, '#27272A');
        box(c, bx - 4 * s, by + 3 * s, 2, 2, '#EF4444'); box(c, bx + 3 * s, by + 3 * s, 2, 2, '#EF4444');
      }
      break;
    }
    case 'train': {
      // LI'L GHOST TRAIN: a tiny loop of track, a tiny train with a ghost face (and a pacifier) on the front
      box(c, x - 210, GY - 6, 420, 4, '#52525B');
      for (let tx = x - 206; tx < x + 210; tx += 16) box(c, tx, GY - 4, 8, 4, '#3F2A1A');
      const tx = x + Math.sin(f * 0.006) * 170, dir = Math.cos(f * 0.006) >= 0 ? 1 : -1;
      for (let i = 1; i <= 2; i++) { const cx = tx - dir * i * 40; box(c, cx - 16, GY - 30, 32, 22, '#7E22CE'); box(c, cx - 5, GY - 42, 10, 12, ['#F0C8A2', '#6E4426'][i - 1]); box(c, cx - 12, GY - 10, 6, 6, '#09090B'); box(c, cx + 6, GY - 10, 6, 6, '#09090B'); }
      box(c, tx - 18, GY - 44, 36, 36, '#F5F5F4');
      box(c, tx - 10 + dir * 4, GY - 36, 5, 5, '#09090B'); box(c, tx + 3 + dir * 4, GY - 36, 5, 5, '#09090B');
      box(c, tx - 4 + dir * 4, GY - 26, 9, 6, '#F9A8D4'); box(c, tx - 1 + dir * 4, GY - 24, 3, 2, '#DB2777');
      box(c, tx - 12, GY - 10, 7, 7, '#09090B'); box(c, tx + 5, GY - 10, 7, 7, '#09090B');
      postSign(c, x + 260, GY, "LI'L GHOST TRAIN - AGES 2 TO 4", '#3B0764', '#F5D0FE');
      break;
    }
    case 'drop': {
      // The MINI DROP OF DOOM: a tower not much taller than him, the seat ring creeping up and dropping a foot
      box(c, x - 6, GY - 110, 12, 110, '#71717A');
      box(c, x - 14, GY - 120, 28, 10, '#DC2626');
      const k = f % 300, h = k < 240 ? 20 + (k / 240) * 60 : k < 250 ? 80 - ((k - 240) / 10) * 60 : 20;
      box(c, x - 30, GY - h - 16, 60, 16, '#B91C1C');
      box(c, x - 24, GY - h - 30, 10, 14, '#F0C8A2'); box(c, x + 14, GY - h - 30, 10, 14, '#A86B43');
      // (the sign, a lot taller than the ride)
      box(c, x + 80, GY - 200, 8, 200, '#3F3F46'); box(c, x + 170, GY - 200, 8, 200, '#3F3F46');
      box(c, x + 60, GY - 236, 140, 50, '#09090B'); box(c, x + 62, GY - 234, 136, 46, '#7F1D1D');
      label(c, 'MINI DROP', x + 130, GY - 216, '#FECACA', 8); label(c, 'OF DOOM', x + 130, GY - 200, '#FECACA', 8);
      wallSign(c, x + 130, GY - 160, 'HEIGHT: 6 FT', '#1E1036', '#E9D5FF');
      break;
    }
    case 'pony': {
      // A coin-op skeleton pony, rocking on its base
      box(c, x - 40, GY - 16, 80, 16, '#52525B'); box(c, x - 40, GY - 16, 80, 2, '#A1A1AA');
      const r = Math.sin(f * 0.15) * 4;
      box(c, x - 26, GY - 52 + r, 52, 18, '#E7E5E4');
      for (let i = 0; i < 4; i++) box(c, x - 22 + i * 12, GY - 50 + r, 3, 14, '#57534E');
      box(c, x + 20, GY - 76 - r, 16, 26, '#E7E5E4'); box(c, x + 30, GY - 70 - r, 3, 3, '#09090B');
      for (const lx of [-22, -12, 12, 20]) box(c, x + lx, GY - 34, 4, 18, '#E7E5E4');
      box(c, x - 36, GY - 60 + r, 12, 4, '#E7E5E4');
      postSign(c, x - 100, GY, 'SKELETON PONY - 25 CENTS', '#3B0764', '#F5D0FE');
      break;
    }
  }
};

const drawRides = (c: Ctx, state: GameState) => {
  for (const r of RIDES) { const x = X(r.x); if (inView(state, x - 300, x + 300)) drawRide(c, r.id, x, state.frame); }
};

// ---------------------------------------------------------------------------------------------------------------
// The modern conveniences (and the rest of the town's furniture), each with its sign on it

const paintGag = (g: Ctx, i: number) => {
  switch (i) {
    case 0: { // the gate in
      const x = X(330);
      box(g, x - 130, GY - 200, 24, 200, '#1C1917'); box(g, x + 106, GY - 200, 24, 200, '#1C1917');
      box(g, x - 140, GY - 226, 280, 34, '#09090B'); box(g, x - 136, GY - 222, 272, 26, '#2E1065');
      label(g, 'WELCOME TO SPOOKY LAND', x, GY - 205, '#BBF7D0', 8);
      for (let px = x - 104; px < x + 104; px += 16) box(g, px, GY - 190, 3, 20, '#27272A');
      break;
    }
    case 1: { // the vending machine
      const x = X(1020);
      box(g, x - 30, GY - 120, 60, 120, '#7F1D1D'); box(g, x - 24, GY - 112, 34, 60, '#18181B');
      for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) box(g, x - 21 + k * 11, GY - 108 + r * 14, 8, 10, ['#DC2626', '#F5F5F4', '#16A34A'][(r + k) % 3]);
      box(g, x + 14, GY - 100, 10, 20, '#D4D4D8'); box(g, x - 20, GY - 30, 40, 12, '#09090B');
      wallSign(g, x, GY - 136, 'BLOOD-COLA', '#450A0A', '#FECACA');
      break;
    }
    case 2: { // the gallows: the selfie station (its platform's a ledge: drawn with them)
      const x = X(1280);
      box(g, x + 20, GY - 250, 10, 150, '#3F2A1A'); box(g, x + 20, GY - 250, 110, 10, '#3F2A1A');
      box(g, x + 110, GY - 240, 2, 50, '#A8A29E');
      // (a ring light where the noose would be)
      g.strokeStyle = '#FEF9C3'; g.lineWidth = 4; g.beginPath(); g.arc(x + 111, GY - 176, 16, 0, Math.PI * 2); g.stroke();
      box(g, x + 30, GY - 100, 8, 100, '#3F2A1A'); box(g, x + 140, GY - 100, 8, 100, '#3F2A1A');
      wallSign(g, x + 75, GY - 270, 'SELFIE STATION', '#1E1036', '#E9D5FF');
      break;
    }
    case 3: { // the crypt with the ATM in it
      const x = X(1640);
      box(g, x - 60, GY - 130, 120, 130, '#44403C'); box(g, x - 70, GY - 146, 140, 18, '#57534E');
      box(g, x - 22, GY - 100, 44, 100, '#1C1917');
      box(g, x - 16, GY - 90, 32, 22, '#22D3EE'); box(g, x - 12, GY - 60, 24, 14, '#52525B'); box(g, x - 10, GY - 40, 20, 3, '#09090B');
      wallSign(g, x, GY - 166, 'CRYPT-O ATM', '#0C4A6E', '#BAE6FD');
      wallSign(g, x, GY - 116, 'FEES APPLY', '#1C1917', '#E7E5E4');
      break;
    }
    case 4: { // the ADA sign at the foot of the ramp
      const x = X(RAMP.r0 - 70);
      box(g, x - 3, GY - 120, 6, 120, '#3F3F46');
      box(g, x - 40, GY - 160, 80, 44, '#1D4ED8');
      // (the wheelchair, crude)
      g.strokeStyle = '#F8FAFC'; g.lineWidth = 3; g.beginPath(); g.arc(x - 18, GY - 130, 8, 0, Math.PI * 2); g.stroke();
      box(g, x - 22, GY - 152, 4, 4, '#F8FAFC'); box(g, x - 22, GY - 147, 3, 12, '#F8FAFC'); box(g, x - 22, GY - 138, 10, 3, '#F8FAFC');
      label(g, 'CRYPT', x + 14, GY - 140, '#F8FAFC', 7); label(g, 'ACCESS', x + 14, GY - 128, '#F8FAFC', 7);
      break;
    }
    case 5: { // up on the terrace: the crypt the ramp's for, and the phone-charging coffin in front of it
      const cx = X(4100), base = Y(RAMP.h);
      box(g, cx - 80, base - 170, 160, 170, '#3F3A44'); box(g, cx - 90, base - 186, 180, 18, '#52525B');
      for (let i = 0; i < 4; i++) box(g, cx - 70 + i * 10, base - 186 - (i + 1) * 8, 140 - i * 20, 8, '#52525B');
      box(g, cx - 26, base - 110, 52, 110, '#120E18');
      wallSign(g, cx, base - 128, 'NOW ADA COMPLIANT', '#1E1036', '#E9D5FF');
      const kx = X(3900);
      box(g, kx - 40, base - 26, 80, 26, '#4A2C1A'); box(g, kx - 46, base - 30, 92, 6, '#78350F');
      for (let i = 0; i < 4; i++) { box(g, kx - 32 + i * 18, base - 46, 10, 16, '#18181B'); box(g, kx - 30 + i * 18, base - 44, 6, 10, ['#22D3EE', '#A3E635', '#22D3EE', '#F472B6'][i]); box(g, kx - 28 + i * 18, base - 30, 2, 6, '#D4D4D8'); }
      box(g, kx - 3, base - 90, 6, 64, '#3F3F46');
      wallSign(g, kx, base - 64, 'PHONE CHARGING COFFIN', '#1E1036', '#E9D5FF');
      wallSign(g, kx, base - 90, '20 MIN LIMIT', '#1C1917', '#FDE68A');
      break;
    }
    case 6: { // the gargoyle with the security camera
      const x = X(5380);
      box(g, x - 16, GY - 150, 32, 150, '#52525B'); box(g, x - 22, GY - 156, 44, 8, '#71717A');
      box(g, x - 16, GY - 186, 30, 30, '#44403C'); box(g, x - 22, GY - 182, 8, 14, '#44403C'); box(g, x + 14, GY - 182, 8, 14, '#44403C');
      box(g, x + 10, GY - 200, 22, 10, '#E5E7EB'); box(g, x + 30, GY - 198, 4, 6, '#09090B'); box(g, x + 12, GY - 196, 3, 3, '#EF4444');
      wallSign(g, x, GY - 110, "SMILE! YOU'RE ON CAMERA", '#1C1917', '#FDE68A');
      break;
    }
    case 7: { // the mausoleum restrooms (its roof's a ledge)
      const x = X(6930), w = 170;
      box(g, x + 8, Y(130) + 16, w - 16, 130 - 16, '#4B4553');
      for (let i = 0; i < 3; i++) box(g, x + 22 + i * 52, Y(130) + 30, 10, 100, '#5E5868');
      box(g, x + 64, GY - 70, 42, 70, '#120E18');
      wallSign(g, x + w / 2, Y(130) + 52, 'RESTROOMS', '#1E1036', '#E9D5FF');
      wallSign(g, x + w / 2, Y(130) + 80, 'BABY CHANGING', '#1E1036', '#E9D5FF');
      break;
    }
    case 8: { // the hitching post with the car charger
      const x = X(9000);
      box(g, x - 50, GY - 50, 100, 8, '#3F2A1A'); box(g, x - 46, GY - 50, 8, 50, '#3F2A1A'); box(g, x + 38, GY - 50, 8, 50, '#3F2A1A');
      box(g, x + 60, GY - 110, 30, 110, '#E5E7EB'); box(g, x + 64, GY - 104, 22, 14, '#16A34A'); box(g, x + 86, GY - 70, 14, 4, '#18181B');
      box(g, x + 72, GY - 130, 6, 20, '#3F3F46');
      wallSign(g, x + 75, GY - 130, 'HORSE & BUGGY EV CHARGING', '#14532D', '#BBF7D0');
      break;
    }
    case 9: { // the castle sign at the foot of the stairs, and the stair lift (out of order)
      const x = X(STAIRS.a0 - 120);
      box(g, x - 120, GY - 190, 10, 190, '#3F2A1A'); box(g, x + 110, GY - 190, 10, 190, '#3F2A1A');
      box(g, x - 140, GY - 230, 280, 58, '#09090B'); box(g, x - 136, GY - 226, 272, 50, '#450A0A');
      label(g, "DRACULA'S", x, GY - 206, '#FECACA', 8); label(g, 'OTHER CASTLE', x, GY - 190, '#FECACA', 8);
      label(g, '>', x + 120, GY - 196, '#FECACA', 8);
      const sx = X(STAIRS.a0 + 30);
      box(g, sx - 14, GY - 46, 30, 8, '#1D4ED8'); box(g, sx - 14, GY - 76, 8, 36, '#1D4ED8'); box(g, sx - 6, GY - 38, 6, 30, '#52525B');
      box(g, sx + 30, GY - 100, 6, 100, '#3F3F46');
      wallSign(g, sx + 33, GY - 100, 'STAIR LIFT OUT OF ORDER', '#1C1917', '#FDE68A');
      break;
    }
    case 10: { // the landing: a bench, and the sign
      const x = X(STAIRS.a1 + 130), base = Y(STAIRS.mid);
      box(g, x - 40, base - 22, 80, 6, '#3F2A1A'); box(g, x - 36, base - 16, 6, 16, '#18181B'); box(g, x + 30, base - 16, 6, 16, '#18181B');
      postSign(g, x, base - 30, 'HALFWAY! (NOT REALLY)', '#1E1036', '#E9D5FF');
      break;
    }
  }
};
/** Each gag: where it is (for culling) [from, to]. */
const GAGS: [number, number][] = [[150, 500], [980, 1180], [1280, 1450], [1560, 1720], [RAMP.r0 - 120, RAMP.r0], [3820, 4200], [5340, 5440], [6930, 7100], [8920, 9100], [STAIRS.a0 - 280, STAIRS.a0 + 140], [STAIRS.a1 + 40, STAIRS.a1 + 230]];
const drawGags = (c: Ctx, state: GameState) => {
  GAGS.forEach(([a, b], i) => {
    if (!inView(state, X(a), X(b))) return;
    // (stamped: they don't move; the box round each is generous)
    stamp(c, `town-gag${i}${fontIn()}`, X(a) - 160, GY - 420, X(b) - X(a) + 320, 440, g => paintGag(g, i));
  });
  // (the phones' screens glowing, the ATM's and the camera's lights: live, a blink)
  if (state.frame % 60 < 30) {
    if (inView(state, X(5380), X(5440))) box(c, X(5380) + 12, GY - 196, 3, 3, '#FCA5A5');
  }
};

// The gas lamps (each with something modern on it: the first one, the Wi-Fi)
const drawLamps = (c: Ctx, state: GameState) => {
  const lit = timeOfDay().lamps;
  LAMPS.forEach(([rx, h], i) => {
    const x = X(rx), base = Y(h);
    if (!inView(state, x - 40, x + 40)) return;
    box(c, x - 3, base - 150, 6, 150, '#18181B');
    box(c, x - 8, base - 6, 16, 6, '#27272A');
    box(c, x - 10, base - 172, 20, 22, '#18181B');
    box(c, x - 7, base - 169, 14, 16, lit > 0.05 ? '#FDE68A' : '#8A7A4A');
    if (lit > 0.05) box(c, x - 18, base - 178, 36, 34, `rgba(253, 230, 138, ${(0.18 * lit).toFixed(2)})`);
    if (i === 0) wallSign(c, x, base - 110, 'FREE WI-FI', '#1E1036', '#BBF7D0');
    if (i === 2) wallSign(c, x, base - 110, 'USB PORT >', '#1E1036', '#BBF7D0');
  });
};

/** Its lamps, for the light after dark. */
export const townLamps = (): Light[] => LAMPS.map(([rx, h]) => ({ x: X(rx), y: Y(h) - 162, r: 140, a: 0.8, color: '#FFD27A' }));

export const drawTownBack = (c: Ctx, state: GameState) => {
  drawShops(c, state);
  drawCastle(c, state);
  drawRides(c, state);
  drawGags(c, state);
  drawLedges(c, state);
  drawLamps(c, state);
  drawGround(c, state);
};
