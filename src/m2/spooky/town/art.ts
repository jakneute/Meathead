// The town, drawn crude but readable (the game-feel pass: flat colors, inked outlines, every thing its own shape, every
// sign on something; the real look comes in the final pass). The backdrop: a gloomy sky (by the hour), the ELEVATOR TO HELL's clock tower far off (its
// car going up and dropping, all the way along), the town's rooftops nearer. In the world: the shopfronts at the back
// of the street (dimmed: not to stand on, but their balconies are, lit along the top), the haunted kiddie rides, the
// modern conveniences, the gas lamps, the ground, the stairs, and the castle at the top of them.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { stamp } from '../../../m1/game/render/stamp';
import { drawTodSky, timeOfDay, hourMix } from '../../timeOfDay';
import { box, label } from '../section';
import { SECTIONS, GY } from '../geometry';
import { X, Y, STAIRS, RAMP, PLAZA, MOAT, LEDGES, SOLIDS, LAMPS } from './layout';
import { INK, fb, ob, poly, oval, bar, board } from './crude';
import { drawRides } from './rides';

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
  const tx = 560 - camX * 0.022, top = 24 + oy, base = horizon + 10;
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

/** (the stamps with words on them: painted again once the pixel font's in, if it wasn't the first time) */
const fontIn = () => (typeof document !== 'undefined' && document.fonts?.check('8px "Press Start 2P"') ? 'f' : 'n');
const inView = (state: GameState, a: number, b: number) => b > state.camera.x - 300 && a < state.camera.x + CANVAS_WIDTH + 300;

/** The shopfronts along the back of the street: [x, w, h, wall color, sign]. Dimmed: not to stand on (their balconies
 *  are, drawn with the ledges). */
const SHOPS: [number, number, number, string, string][] = [
  [380, 260, 230, '#2E2338', 'APOTHECARY - NOW WITH DRIVE-THRU'],
  [700, 420, 280, '#33263A', ''],
  [1760, 380, 290, '#2B2233', 'POTION SHOPPE - TAP TO PAY'],
  [3050, 340, 220, '#30253A', 'CANDLES (BATTERY OPERATED)'],
  [5100, 300, 225, '#2D2236', 'FORTUNES TOLD - CARDS ACCEPTED'],
  [7200, 720, 300, '#2B2233', 'YE OLDE SMOOTHIE BAR'],
  [8150, 280, 215, '#33263A', 'CURSED GIFTS & SUNSCREEN'],
];

const paintShop = (g: Ctx, x: number, w: number, h: number, col: string, sign: string) => {
  const top = GY - h, dark = '#1A1424', trim = '#4A3A58', gh = Math.min(60, w * 0.25);
  // (the front, a steep gable with its finial, a chimney, rows of arched windows, the door)
  fb(g, x, top, w, h, col);
  poly(g, [x - 10, top, x + w + 10, top, x + w / 2, top - gh], col, 2);
  fb(g, x + w / 2 - 2, top - gh - 14, 4, 14, trim);
  ob(g, x + w - 60, top - 70, 20, 50, col, 2);
  fb(g, x, top, w, 4, trim);
  for (let row = 0; row < 2; row++) for (let wx = x + 22; wx < x + w - 44; wx += 66) {
    ob(g, wx, top + 26 + row * 76, 30, 46, dark, 2);
    fb(g, wx + 14, top + 26 + row * 76, 2, 46, trim); fb(g, wx, top + 46 + row * 76, 30, 2, trim);
    poly(g, [wx - 4, top + 26 + row * 76, wx + 34, top + 26 + row * 76, wx + 15, top + 16 + row * 76], trim, 1);
  }
  ob(g, x + w / 2 - 20, GY - 72, 40, 72, '#120E18', 2);
  poly(g, [x + w / 2 - 20, GY - 72, x + w / 2 + 20, GY - 72, x + w / 2, GY - 86], '#120E18', 2);
  if (sign) board(g, x + w / 2, GY - 104, sign, '#1E1036', '#E9D5FF', 7);
};

const drawShops = (c: Ctx, state: GameState) => {
  const lit = timeOfDay().lamps;
  SHOPS.forEach(([rx, w, h, col, sign], i) => {
    const x = X(rx);
    if (!inView(state, x, x + w)) return;
    stamp(c, `town2-shop${i}${fontIn()}`, x - 30, GY - h - 140, w + 60, h + 140, g => paintShop(g, x, w, h, col, sign));
    if (lit > 0.1) for (let row = 0; row < 2; row++) for (let wx = x + 22; wx < x + w - 44; wx += 66) if ((wx + row * 3) % 4 < 2) fb(c, wx + 2, GY - h + 28 + row * 76, 26, 42, `rgba(224, 169, 74, ${(0.45 * lit).toFixed(2)})`);
  });
};

/** The balconies and the gallows (what stands out from the wall): brackets, the rail behind, the lit top lip. (The
 *  carousel's roof and the cups' canopy are the rides' own: rides.ts.) */
const drawLedges = (c: Ctx, state: GameState) => {
  LEDGES.forEach(([rx, h, w], i) => {
    const x = X(rx), y = Y(h);
    if (!inView(state, x, x + w)) return;
    if (i === 3 || i === 4) return;
    if (i === 1) {
      // The gallows: the selfie station (posts, the platform, the beam, a ring light where the noose would be)
      ob(c, x + 6, y, 10, GY - y, '#3F2A1A'); ob(c, x + w - 16, y, 10, GY - y, '#3F2A1A');
      ob(c, x + w - 30, y - 150, 10, 150, '#3F2A1A'); ob(c, x + 20, y - 150, w - 40, 10, '#3F2A1A');
      bar(c, x + w - 30, y - 110, x + w - 70, y - 145, 5, '#3F2A1A');
      bar(c, x + 50, y - 140, x + 50, y - 90, 2, '#A8A29E', false);
      c.strokeStyle = '#FEF9C3'; c.lineWidth = 5; c.beginPath(); c.arc(x + 50, y - 72, 17, 0, Math.PI * 2); c.stroke();
      ob(c, x + w - 56, y - 26, 6, 26, '#18181B', 1); ob(c, x + w - 62, y - 34, 18, 10, '#18181B', 1);
      board(c, x + w / 2, y - 168, 'SELFIE STATION', '#1E1036', '#E9D5FF');
      ob(c, x, y, w, 14, '#57483A'); fb(c, x, y - 1, w, 3, '#D6B98A');
      return;
    }
    ob(c, x, y, w, 14, '#57483A');
    fb(c, x, y - 1, w, 3, '#D6B98A');
    poly(c, [x + 10, y + 14, x + 26, y + 14, x + 10, y + 34], '#3F3428', 1.5);
    poly(c, [x + w - 26, y + 14, x + w - 10, y + 14, x + w - 10, y + 34], '#3F3428', 1.5);
    fb(c, x, y - 28, w, 3, '#27272A');
    for (let px = x + 4; px < x + w; px += 14) fb(c, px, y - 28, 2, 28, '#27272A');
  });
};

/** The solid things: a crate, the vending machine, the fountain and its statue, a hearse, the arcade. */
const paintSolid = (g: Ctx, i: number) => {
  const [rx, top, w, base, what] = SOLIDS[i];
  const x = X(rx), y = Y(top), h = top - base, b = Y(base);
  switch (what) {
    case 'crate':
      ob(g, x, y, w, h, '#8B5A2B'); bar(g, x + 4, y + 4, x + w - 4, b - 4, 3, '#5B3A1A', false); bar(g, x + w - 4, y + 4, x + 4, b - 4, 3, '#5B3A1A', false);
      fb(g, x, y - 1, w, 3, '#E7C68A'); break;
    case 'vending':
      // BLOOD-COLA: rows of cans behind the glass, the coin slot, the drop
      ob(g, x, y, w, h, '#991B1B');
      ob(g, x + 6, y + 18, 32, 66, '#18181B', 1);
      for (let r = 0; r < 5; r++) for (let k = 0; k < 3; k++) fb(g, x + 9 + k * 10, y + 22 + r * 12, 7, 9, ['#DC2626', '#F5F5F4', '#16A34A'][(r + k) % 3]);
      ob(g, x + 44, y + 22, 10, 22, '#D4D4D8', 1); fb(g, x + 48, y + 26, 2, 8, INK);
      ob(g, x + 8, b - 26, 44, 12, '#09090B', 1);
      fb(g, x + 4, y + 4, w - 8, 10, '#FECACA'); label(g, 'BLOOD', x + w / 2, y + 12, '#7F1D1D', 6);
      fb(g, x, y - 1, w, 3, '#FCA5A5'); break;
    case 'fountain':
      // A fountain: the basin (its rim to stand on), green water
      ob(g, x, y, w, h, '#57534E'); fb(g, x + 8, y + 6, w - 16, 10, '#4D7C0F'); fb(g, x, y - 1, w, 3, '#A8A29E');
      for (let k = 0; k < 4; k++) fb(g, x + 12 + k * 38, y + 22, 20, 3, '#44403C'); break;
    case 'statue':
      // (the gargoyle on its pedestal, wings out, spitting into the basin)
      ob(g, x, y + 24, w, h - 24, '#6B6560');
      poly(g, [x - 6, y + 24, x + w + 6, y + 24, x + w, y + 6, x + w / 2 + 8, y - 4, x + w / 2 - 8, y - 4, x, y + 6], '#57534E');
      poly(g, [x - 4, y + 4, x - 18, y - 12, x - 2, y + 14], '#57534E', 1.5); poly(g, [x + w + 4, y + 4, x + w + 18, y - 12, x + w + 2, y + 14], '#57534E', 1.5);
      fb(g, x + 10, y + 6, 4, 3, '#FDE047'); fb(g, x + w - 14, y + 6, 4, 3, '#FDE047');
      fb(g, x - 6, y - 5, w + 12, 3, '#A8A29E');
      board(g, x + w / 2, y + 48, 'WISHES $1', '#14532D', '#BBF7D0', 6); break;
    case 'hearse':
      // A hearse, parked: VALET ONLY (its roof to stand on)
      ob(g, x, y + 16, w, h - 26, '#18181B');
      poly(g, [x + 30, y + 16, x + 40, y, x + w - 8, y, x + w, y + 16], '#18181B');
      fb(g, x + 48, y + 4, 40, 10, '#3F3F46'); fb(g, x + 96, y + 4, 60, 10, '#3F3F46');
      for (const k of [0, 1]) { const ex = x + 50 + k * 90; poly(g, [ex, y + 30, ex + 20, y + 26, ex + 20, y + 34], '#A8A29E', 0); }
      oval(g, x + 36, b - 10, 12, 12, '#09090B'); oval(g, x + w - 36, b - 10, 12, 12, '#09090B');
      oval(g, x + 36, b - 10, 5, 5, '#A1A1AA', 0); oval(g, x + w - 36, b - 10, 5, 5, '#A1A1AA', 0);
      fb(g, x + 40, y - 1, w - 48, 3, '#A1A1AA');
      ob(g, x - 30, y - 30, 4, 30 + h, '#3F3F46', 1);
      board(g, x - 28, y - 40, 'HEARSE PARKING - VALET ONLY', '#1C1917', '#FDE68A', 6); break;
    case 'arcade':
      // The arcade: a stone walkway roof on columns (to stand on), the way under it (no jumping over anyone in there)
      ob(g, x, y, w, h, '#4A4458'); fb(g, x, y - 1, w, 3, '#B8B0CC');
      for (let k = 0; k <= 6; k++) { const cx = x + 10 + k * ((w - 30) / 6); ob(g, cx, y + h, 14, b - y - h, '#5E5868', 1.5); fb(g, cx - 4, y + h, 22, 6, '#6B6478'); }
      board(g, x + w / 2, y + h / 2 + 1, 'THE GRAND ARCADE - NO LOITERING', '#1E1036', '#E9D5FF', 6); break;
  }
};
const drawSolids = (c: Ctx, state: GameState) => {
  SOLIDS.forEach(([rx, top, w], i) => {
    if (!inView(state, X(rx) - 60, X(rx) + w + 60)) return;
    stamp(c, `town2-solid${i}${fontIn()}`, X(rx) - 220, Y(top) - 100, w + 440, top + 120, g => paintSolid(g, i));
  });
  // (the fountain's water, spat out by the gargoyle: live)
  const sx = X(1080), sy = Y(150);
  if (inView(state, sx - 100, sx + 100)) for (let k = 0; k < 6; k++) { const t = (state.frame * 0.04 + k / 6) % 1; fb(c, sx - 22 - t * 50, sy + t * t * 50, 3, 3, '#86EFAC'); fb(c, sx + 22 + t * 50, sy + t * t * 50, 3, 3, '#86EFAC'); }
};

// The ground: the cobbled street, the plaza's steps, the ramp and the terrace, the moat's banks, the stairs
const STONE = '#3F3A4A', LIP = '#9A93AE', STEP = '#4A4458';
const flat = (c: Ctx, a: number, b: number, h: number, L: number, R: number, col = STONE) => {
  const s = Math.max(L, X(a)), e = Math.min(R, X(b));
  if (e <= s) return;
  fb(c, s, Y(h), e - s, 600 + h, col);
  fb(c, s, Y(h), e - s, 4, LIP);
  for (let x = Math.floor(s / 24) * 24; x < e; x += 24) fb(c, x, Y(h) + 8 + ((x / 24) % 2) * 6, 14, 3, '#352F40');
};
const flight = (c: Ctx, a: number, b: number, h0: number, h1: number, n: number, L: number, R: number) => {
  const dx = (X(b) - X(a)) / n, dy = (h1 - h0) / n;
  for (let i = 0; i < n; i++) {
    const sx = X(a) + i * dx;
    if (sx + dx < L || sx > R) continue;
    const top = dy >= 0 ? Y(h0 + (i + 1) * dy) : Y(h0 + i * dy);
    fb(c, sx, top, dx + 1, GY + 600 - top, STEP);
    fb(c, sx, top, dx + 1, 3, LIP);
    fb(c, dy >= 0 ? sx + dx - 2 : sx, top, 2, Math.abs(dy), '#2E2938');
  }
};
const drawGround = (c: Ctx, state: GameState) => {
  const L = state.camera.x - 100, R = state.camera.x + CANVAS_WIDTH + 100;
  flat(c, -200, PLAZA.a, 0, L, R);
  flight(c, PLAZA.a, PLAZA.b, 0, PLAZA.h, 4, L, R);
  flat(c, PLAZA.b, PLAZA.c, PLAZA.h, L, R, '#463F52');
  flight(c, PLAZA.c, PLAZA.d, PLAZA.h, 0, 4, L, R);
  flat(c, PLAZA.d, RAMP.r0, 0, L, R);
  // (the ADA ramp: a slope with its handrail; the terrace, its front wall)
  if (X(RAMP.t1) > L && X(RAMP.r0) < R) {
    poly(c, [X(RAMP.r0), GY, X(RAMP.r1), Y(RAMP.h), X(RAMP.r1), GY + 600, X(RAMP.r0), GY + 600], STEP, 0);
    bar(c, X(RAMP.r0), GY + 1, X(RAMP.r1), Y(RAMP.h) + 1, 4, LIP, false);
    bar(c, X(RAMP.r0) + 10, GY - 40, X(RAMP.r1), Y(RAMP.h) - 40, 3, '#A1A1AA');
    for (let i = 0; i <= 5; i++) { const k = i / 5; ob(c, X(RAMP.r0 + 10 + (RAMP.r1 - RAMP.r0 - 10) * k), GY - 40 - RAMP.h * k, 3, 40, '#71717A', 1); }
    flat(c, RAMP.r1, RAMP.t1, RAMP.h, L, R, STEP);
    fb(c, X(RAMP.t1) - 6, Y(RAMP.h), 6, RAMP.h, '#2A2533');
  }
  flat(c, RAMP.t1, MOAT.a, 0, L, R);
  // (the moat's banks: sheer)
  if (X(MOAT.b) + 20 > L && X(MOAT.a) - 20 < R) { fb(c, X(MOAT.a) - 8, GY, 8, 600, '#2A2533'); fb(c, X(MOAT.b), GY, 8, 600, '#2A2533'); }
  flat(c, MOAT.b, STAIRS.a0, 0, L, R);
  // (the stairs: two flights, the landing, the top; the balustrade up the side, behind)
  if (X(12040) > L && X(STAIRS.a0) < R) {
    flight(c, STAIRS.a0, STAIRS.a1, 0, STAIRS.mid, 20, L, R);
    flat(c, STAIRS.a1, STAIRS.land1, STAIRS.mid, L, R, STEP);
    flight(c, STAIRS.land1, STAIRS.b1, STAIRS.mid, STAIRS.top, 20, L, R);
    flat(c, STAIRS.b1, 12040, STAIRS.top, L, R, STEP);
    bar(c, X(STAIRS.a0), GY - 46, X(STAIRS.a1), Y(STAIRS.mid) - 46, 4, '#27272A', false);
    bar(c, X(STAIRS.a1), Y(STAIRS.mid) - 46, X(STAIRS.land1), Y(STAIRS.mid) - 46, 4, '#27272A', false);
    bar(c, X(STAIRS.land1), Y(STAIRS.mid) - 46, X(STAIRS.b1), Y(STAIRS.top) - 46, 4, '#27272A', false);
  }
};

// The castle at the top of the stairs: DRACULA'S OTHER CASTLE (its front, its door: in, to the castle)
const paintCastle = (g: Ctx) => {
  const L = X(11250), R = x1 + 40, base = Y(STAIRS.top), top = base - 640;
  fb(g, L, top, R - L, base - top, '#27202F');
  for (let x = L; x < R; x += 50) ob(g, x, top - 30, 30, 30, '#27202F');
  ob(g, X(11690), top - 160, 140, 160, '#2C2434');
  for (let x = X(11690); x < X(11830); x += 34) ob(g, x, top - 186, 20, 26, '#2C2434');
  poly(g, [X(11690) - 10, top - 186, X(11830) + 10, top - 186, X(11760), top - 280], '#3B0764');
  for (let row = 0; row < 4; row++) for (let wx = L + 60; wx < R - 60; wx += 120) { ob(g, wx, top + 60 + row * 130, 26, 50, '#140F1A'); poly(g, [wx, top + 60 + row * 130, wx + 26, top + 60 + row * 130, wx + 13, top + 44 + row * 130], '#140F1A'); }
  board(g, x1 - 160, base - 236, "DRACULA'S OTHER CASTLE", '#450A0A', '#FECACA');
  board(g, x1 - 160, base - 206, 'NO FLASH PHOTOGRAPHY - NO STROLLERS', '#1E1036', '#E9D5FF', 6);
  // (the door: big, arched, studded, open a crack)
  ob(g, x1 - 132, base - 170, 104, 170, '#57534E');
  poly(g, [x1 - 132, base - 170, x1 - 28, base - 170, x1 - 80, base - 196], '#57534E');
  fb(g, x1 - 122, base - 160, 84, 160, '#3B2416');
  fb(g, x1 - 82, base - 160, 6, 160, '#09090B');
  for (let y = base - 150; y < base; y += 24) { fb(g, x1 - 114, y, 4, 4, '#A8A29E'); fb(g, x1 - 52, y, 4, 4, '#A8A29E'); }
  oval(g, x1 - 92, base - 80, 5, 5, '#A16207');
};
const drawCastle = (c: Ctx, state: GameState) => {
  if (!inView(state, X(11250), x1 + 40)) return;
  const base = Y(STAIRS.top);
  stamp(c, `town2-castle${fontIn()}`, X(11250) - 20, base - 940, x1 + 80 - X(11250), 960, paintCastle);
};

// ---------------------------------------------------------------------------------------------------------------
// The modern conveniences (and the rest of the town's furniture), each with its sign on it

/** The gate's arch: an iron bar curved over, its bars. */
const arch = (g: Ctx, x: number) => {
  g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.moveTo(x - 118, GY - 200); g.quadraticCurveTo(x, GY - 250, x + 118, GY - 200); g.stroke();
  g.strokeStyle = '#3F3F46'; g.lineWidth = 4; g.beginPath(); g.moveTo(x - 118, GY - 200); g.quadraticCurveTo(x, GY - 250, x + 118, GY - 200); g.stroke();
  for (let px = x - 100; px <= x + 100; px += 20) bar(g, px, GY - 196, px, GY - 150, 2, '#27272A', false);
};
const paintGag = (g: Ctx, i: number) => {
  switch (i) {
    case 0: { // the gate in: iron pillars, the arch, its sign
      const x = X(250);
      for (const px of [x - 130, x + 106]) { ob(g, px, GY - 200, 24, 200, '#1C1917'); poly(g, [px - 4, GY - 200, px + 28, GY - 200, px + 12, GY - 220], '#1C1917'); }
      arch(g, x);
      board(g, x, GY - 228, 'WELCOME TO SPOOKY LAND', '#2E1065', '#BBF7D0');
      break;
    }
    case 1: { // the crypt with the ATM in it
      const x = X(2240);
      ob(g, x - 60, GY - 130, 120, 130, '#44403C');
      poly(g, [x - 72, GY - 130, x + 72, GY - 130, x, GY - 176], '#57534E');
      for (const px of [x - 52, x + 38]) ob(g, px, GY - 124, 14, 124, '#6B6560', 1.5);
      ob(g, x - 22, GY - 100, 44, 100, '#1C1917');
      ob(g, x - 16, GY - 90, 32, 22, '#22D3EE', 1); fb(g, x - 12, GY - 86, 24, 3, '#0E7490');
      ob(g, x - 12, GY - 60, 24, 14, '#52525B', 1);
      for (let k = 0; k < 3; k++) fb(g, x - 9 + k * 7, GY - 57, 4, 3, '#D4D4D8');
      fb(g, x - 10, GY - 40, 20, 3, INK);
      board(g, x, GY - 150, 'CRYPT-O ATM', '#0C4A6E', '#BAE6FD', 7);
      board(g, x, GY - 114, 'FEES APPLY', '#1C1917', '#E7E5E4', 6);
      break;
    }
    case 2: { // the ADA sign at the foot of the ramp
      const x = X(RAMP.r0 - 70);
      ob(g, x - 3, GY - 120, 6, 120, '#3F3F46', 1);
      ob(g, x - 40, GY - 164, 80, 46, '#1D4ED8');
      g.strokeStyle = '#F8FAFC'; g.lineWidth = 3; g.beginPath(); g.arc(x - 20, GY - 132, 9, 0, Math.PI * 2); g.stroke();
      oval(g, x - 22, GY - 156, 3, 3, '#F8FAFC', 0); fb(g, x - 23, GY - 152, 3, 13, '#F8FAFC'); fb(g, x - 23, GY - 141, 12, 3, '#F8FAFC');
      label(g, 'CRYPT', x + 14, GY - 144, '#F8FAFC', 7); label(g, 'ACCESS', x + 14, GY - 132, '#F8FAFC', 7);
      break;
    }
    case 3: { // up on the terrace: the crypt the ramp's for, and the phone-charging coffin
      const cx = X(4050), base = Y(RAMP.h);
      ob(g, cx - 80, base - 170, 160, 170, '#3F3A44');
      poly(g, [cx - 96, base - 170, cx + 96, base - 170, cx, base - 236], '#52525B');
      for (const px of [cx - 70, cx + 52]) ob(g, px, base - 160, 18, 160, '#5E5868', 1.5);
      ob(g, cx - 26, base - 110, 52, 110, '#120E18');
      poly(g, [cx - 26, base - 110, cx + 26, base - 110, cx, base - 130], '#120E18');
      board(g, cx, base - 150, 'NOW ADA COMPLIANT', '#1E1036', '#E9D5FF', 7);
      const kx = X(3930);
      poly(g, [kx - 44, base - 26, kx - 30, base - 34, kx + 30, base - 34, kx + 44, base - 26, kx + 30, base, kx - 30, base], '#4A2C1A');
      fb(g, kx - 30, base - 32, 60, 4, '#A16207');
      for (let k = 0; k < 4; k++) { ob(g, kx - 32 + k * 18, base - 50, 10, 16, '#18181B', 1); fb(g, kx - 30 + k * 18, base - 48, 6, 10, ['#22D3EE', '#A3E635', '#22D3EE', '#F472B6'][k]); bar(g, kx - 27 + k * 18, base - 34, kx - 27 + k * 18, base - 28, 1, '#D4D4D8', false); }
      ob(g, kx + 50, base - 96, 6, 96, '#3F3F46', 1);
      board(g, kx + 53, base - 96, 'PHONE CHARGING COFFIN', '#1E1036', '#E9D5FF', 6);
      board(g, kx + 53, base - 76, '20 MIN LIMIT', '#1C1917', '#FDE68A', 6);
      break;
    }
    case 4: { // the gargoyle with the security camera
      const x = X(4980);
      ob(g, x - 16, GY - 150, 32, 150, '#52525B'); ob(g, x - 22, GY - 158, 44, 8, '#71717A');
      poly(g, [x - 16, GY - 158, x + 16, GY - 158, x + 12, GY - 186, x - 12, GY - 186], '#44403C');
      poly(g, [x - 14, GY - 176, x - 32, GY - 196, x - 12, GY - 166], '#44403C', 1.5); poly(g, [x + 14, GY - 176, x + 32, GY - 196, x + 12, GY - 166], '#44403C', 1.5);
      ob(g, x + 6, GY - 204, 26, 12, '#E5E7EB', 1.5); ob(g, x + 30, GY - 202, 6, 8, '#09090B', 1);
      board(g, x, GY - 110, "SMILE! YOU'RE ON CAMERA", '#1C1917', '#FDE68A', 6);
      break;
    }
    case 5: { // the hitching post with the car charger
      const x = X(9000);
      ob(g, x - 50, GY - 50, 100, 8, '#3F2A1A', 1.5); ob(g, x - 46, GY - 42, 8, 42, '#3F2A1A', 1.5); ob(g, x + 38, GY - 42, 8, 42, '#3F2A1A', 1.5);
      ob(g, x + 60, GY - 110, 30, 110, '#E5E7EB'); fb(g, x + 64, GY - 104, 22, 14, '#16A34A');
      bar(g, x + 88, GY - 70, x + 110, GY - 30, 3, '#18181B', false);
      ob(g, x + 72, GY - 150, 6, 40, '#3F3F46', 1);
      board(g, x + 75, GY - 150, 'HORSE & BUGGY EV CHARGING', '#14532D', '#BBF7D0', 6);
      break;
    }
    case 6: { // the castle sign at the foot of the stairs, and the stair lift (out of order)
      const x = X(STAIRS.a0 - 130);
      ob(g, x - 120, GY - 190, 10, 190, '#3F2A1A'); ob(g, x + 110, GY - 190, 10, 190, '#3F2A1A');
      ob(g, x - 140, GY - 236, 280, 60, '#450A0A', 3);
      label(g, "DRACULA'S", x, GY - 212, '#FECACA', 8); label(g, 'OTHER CASTLE', x, GY - 194, '#FECACA', 8);
      poly(g, [x + 118, GY - 214, x + 130, GY - 206, x + 118, GY - 198], '#FECACA', 0);
      const sx = X(STAIRS.a0 + 30);
      ob(g, sx - 14, GY - 46, 30, 8, '#1D4ED8', 1.5); ob(g, sx - 14, GY - 76, 8, 30, '#1D4ED8', 1.5); ob(g, sx - 6, GY - 38, 6, 30, '#52525B', 1);
      ob(g, sx + 36, GY - 100, 6, 100, '#3F3F46', 1);
      board(g, sx + 39, GY - 100, 'STAIR LIFT OUT OF ORDER', '#1C1917', '#FDE68A', 6);
      break;
    }
    case 7: { // the landing: a bench, and the sign
      const x = X(STAIRS.a1 + 150), base = Y(STAIRS.mid);
      ob(g, x - 40, base - 22, 80, 6, '#3F2A1A', 1.5); ob(g, x - 36, base - 16, 6, 16, '#18181B', 1); ob(g, x + 30, base - 16, 6, 16, '#18181B', 1);
      ob(g, x - 3, base - 110, 6, 88, '#3F3F46', 1);
      board(g, x, base - 110, 'HALFWAY! (NOT REALLY)', '#1E1036', '#E9D5FF', 7);
      break;
    }
  }
};
/** Each gag: where it is (for culling) [from, to]. */
const GAGS: [number, number][] = [[100, 400], [2160, 2320], [RAMP.r0 - 120, RAMP.r0], [3860, 4150], [4940, 5020], [8940, 9120], [STAIRS.a0 - 290, STAIRS.a0 + 200], [STAIRS.a1 + 80, STAIRS.a1 + 260]];
const drawGags = (c: Ctx, state: GameState) => {
  GAGS.forEach(([a, b], i) => {
    if (!inView(state, X(a), X(b))) return;
    stamp(c, `town2-gag${i}${fontIn()}`, X(a) - 170, GY - 470, X(b) - X(a) + 340, 490, g => paintGag(g, i));
  });
  // (live: the camera's red light)
  if (state.frame % 60 < 30 && inView(state, X(4980), X(5020))) fb(c, X(4980) + 10, GY - 200, 3, 3, '#EF4444');
};

// The gas lamps (two of them with something modern on them)
const drawLamps = (c: Ctx, state: GameState) => {
  const lit = timeOfDay().lamps;
  LAMPS.forEach(([rx, h], i) => {
    const x = X(rx), base = Y(h);
    if (!inView(state, x - 40, x + 40)) return;
    ob(c, x - 3, base - 150, 6, 150, '#18181B', 1);
    ob(c, x - 9, base - 8, 18, 8, '#27272A', 1);
    poly(c, [x - 10, base - 152, x + 10, base - 152, x + 7, base - 172, x - 7, base - 172], lit > 0.05 ? '#FDE68A' : '#8A7A4A', 2);
    poly(c, [x - 12, base - 172, x + 12, base - 172, x, base - 182], '#18181B', 1);
    if (lit > 0.05) fb(c, x - 20, base - 184, 40, 36, `rgba(253, 230, 138, ${(0.16 * lit).toFixed(2)})`);
    if (i === 0) board(c, x, base - 62, 'FREE WI-FI', '#1E1036', '#BBF7D0', 7);
    if (i === 2) board(c, x, base - 62, 'USB PORT', '#1E1036', '#BBF7D0', 7);
  });
};

/** Its lamps, for the light after dark. */
export const townLamps = (): Light[] => LAMPS.map(([rx, h]) => ({ x: X(rx), y: Y(h) - 162, r: 140, a: 0.8, color: '#FFD27A' }));

export const drawTownBack = (c: Ctx, state: GameState) => {
  drawShops(c, state);
  drawCastle(c, state);
  drawGags(c, state);
  drawLamps(c, state);
  drawLedges(c, state);
  drawSolids(c, state);
  drawGround(c, state);
  drawRides(c, state);
};
