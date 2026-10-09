// The way in, drawn (intro/index.ts): the parking garage, the hallway and its moving walkways, the security checkpoint,
// America USA (every American city you've heard of, as a street of tacky shops and restaurants under more flags than
// anywhere has ever needed), and the ticket plaza and the gate. Flat bands of color, stepped, SNES-ish. Nothing back
// here looks like something to stand on: awnings and ledges are dimmed (there's nothing to stand on but the floor).

import type { GameState } from '../../m1/game/core/state';
import { GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT, HUD_CLEAR_X, HUD_CLEAR_Y } from '../../m1/constants';
import { X0, R, CEIL_Y, UPPER, STAIRS_END, USA_START, WALKWAYS, WALKWAY_SPEED, OFFICE_X, DETECTOR_X, GARAGE_END, HALL_END, CHECK_END, USA_END, DISTRICTS, DISTRICT_W, FRONT_X, WINDOW_X, TURN_X, GATE_X, END_X, QUEUE_START, SPACING } from './geometry';
import { getIntro, guests } from './index';

type Ctx = CanvasRenderingContext2D;
const INK = '#1A0B06';
const RED = '#B91C1C', WHITE = '#F8FAFC', BLUE = '#1E3A8A';
const box = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const text = (c: Ctx, s: string, x: number, y: number, col: string, size = 8, align: CanvasTextAlign = 'center', shadow: string | null = INK) => {
  c.font = `${size}px "Press Start 2P"`; c.textAlign = align;
  if (shadow) { c.fillStyle = shadow; c.fillText(s, x + 1, y + 1); }
  c.fillStyle = col; c.fillText(s, x, y);
  c.textAlign = 'left';
};
const star = (c: Ctx, x: number, y: number, r: number, col: string) => {
  c.fillStyle = col; c.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  c.closePath(); c.fill();
};
/** A flag on a pole (waving). */
const flag = (c: Ctx, x: number, top: number, f: number, w = 34, h = 22) => {
  box(c, x - 1, top, 3, GROUND_Y - top, '#A1A1AA');
  c.fillStyle = '#FDE047'; c.beginPath(); c.arc(x + 0.5, top, 3, 0, Math.PI * 2); c.fill();
  for (let i = 0; i < 7; i++) {
    for (let k = 0; k < w; k += 3) {
      const wv = Math.sin(f * 0.12 + k * 0.25) * 2;
      box(c, x + 2 + k, top + 3 + i * (h / 7) + wv, 3, h / 7 + 0.5, i % 2 ? WHITE : RED);
    }
  }
  for (let k = 0; k < w * 0.45; k += 3) { const wv = Math.sin(f * 0.12 + k * 0.25) * 2; box(c, x + 2 + k, top + 3 + wv, 3, h * 0.55, BLUE); }
  c.fillStyle = WHITE; for (let i = 0; i < 4; i++) c.fillRect(x + 5 + i * 3.5, top + 6 + (i % 2) * 3 + Math.sin(f * 0.12 + i) * 2, 1.4, 1.4);
};
/** Bunting swagged between two points: red, white and blue scallops. */
const bunting = (c: Ctx, x0: number, x1: number, y: number, sag = 26) => {
  const n = Math.max(4, Math.round((x1 - x0) / 22));
  for (let i = 0; i < n; i++) {
    const k0 = i / n, k1 = (i + 1) / n, xa = x0 + (x1 - x0) * k0, xb = x0 + (x1 - x0) * k1;
    const ya = y + Math.sin(k0 * Math.PI) * sag, yb = y + Math.sin(k1 * Math.PI) * sag;
    c.fillStyle = [RED, WHITE, BLUE][i % 3];
    c.beginPath(); c.moveTo(xa, ya); c.lineTo(xb, yb); c.quadraticCurveTo((xa + xb) / 2, (ya + yb) / 2 + 14, xa, ya); c.fill();
  }
  c.strokeStyle = '#E5E7EB'; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, y); c.quadraticCurveTo((x0 + x1) / 2, y + sag * 2, x1, y); c.stroke();
};
/** A sign board: a frame, a colored face, its words. */
const sign = (c: Ctx, x: number, y: number, w: number, h: number, face: string, words: string, ink: string, size = 8, frame = INK) => {
  box(c, x - 2, y - 2, w + 4, h + 4, frame); box(c, x, y, w, h, face);
  text(c, words, x + w / 2, y + h / 2 + size / 2 - 1, ink, size, 'center', null);
};

// ---------------------------------------------------------------------------------------------------------------

/**
 * Behind everything: a patriotic sky (bands of blue, fireworks going off in broad daylight). Out from the garage, the
 * biggest parking lot anybody's ever seen, rows on rows of cars out to the horizon; down in America USA, a skyline of
 * every American city's landmarks, far off.
 */
export const drawIntroBackdrop = (c: Ctx, state: GameState) => {
  const cam = state.camera.x, f = state.frame;
  const bands = ['#1E3A8A', '#1D4ED8', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];
  // (all of it: the last band runs to the bottom, or whatever was there last frame shows through)
  bands.forEach((col, i) => box(c, 0, i * 70, CANVAS_WIDTH, i === bands.length - 1 ? CANVAS_HEIGHT : 72, col));
  for (let i = 0; i < 3; i++) {
    const t = (f + i * 97) % 240;
    if (t > 60) continue;
    const bx = ((i * 271 + Math.floor((f + i * 97) / 240) * 173) % 700) + 50, by = 70 + i * 40, r = t * 0.9;
    const col = [RED, WHITE, '#FDE047'][i];
    for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; box(c, bx + Math.cos(a) * r, by + Math.sin(a) * r, 2, 2, col); }
  }
  // (the parking lot out from the garage, the skyline over America USA: the one fading into the other as he goes down
  // to it, not cut over from one to the other)
  const mid = cam + CANVAS_WIDTH / 2;
  const k = Math.max(0, Math.min(1, (mid - R(CHECK_END - 500)) / 900));
  if (k > 0) { c.globalAlpha = k; skyline(c, cam); c.globalAlpha = 1; }
  if (k < 1) { c.globalAlpha = 1 - k; parkingLot(c, cam, f); c.globalAlpha = 1; }
};

/** The parking lot: asphalt to the horizon, row on row of cars getting smaller, light poles, section signs (LOT EAGLE 47Z). */
const parkingLot = (c: Ctx, cam: number, f: number) => {
  const horizon = 250;
  box(c, 0, horizon, CANVAS_WIDTH, CANVAS_HEIGHT - horizon, '#57534E');
  const CARS = ['#B91C1C', '#1E3A8A', '#F8FAFC', '#52525B', '#CA8A04', '#166534', '#7C3AED', '#0F172A'];
  // (rows, far to near: further off, smaller, slower going by)
  for (let r = 0; r < 9; r++) {
    const k = r / 8, y = horizon + 6 + k * k * 190, s = 0.25 + k * 1.1, par = 0.08 + k * 0.5;
    box(c, 0, y + 12 * s, CANVAS_WIDTH, Math.max(1, 2 * s), '#E7E5E4');
    const step = 46 * s, off = -((cam * par) % step);
    for (let x = off - step, i = 0; x < CANVAS_WIDTH + step; x += step, i++) {
      const seed = Math.floor((cam * par) / step) + i + r * 7;
      if (seed % 9 === 4) continue; // (a gap: an empty space, the one free spot in the whole lot)
      const col = CARS[(seed * 5 + r) % CARS.length];
      box(c, x, y, 34 * s, 10 * s, col); box(c, x + 7 * s, y - 5 * s, 18 * s, 6 * s, col); box(c, x + 9 * s, y - 4 * s, 6 * s, 4 * s, '#93C5FD');
    }
    // (a light pole now and then, a section sign on it: going by with its row, the same sign on the same pole)
    if (r % 3 === 2) {
      const gap = 400 * s, base = cam * par, first = Math.floor(base / gap) - 1;
      for (let n = first; n * gap - base < CANVAS_WIDTH + gap; n++) {
        const x = n * gap - base;
        box(c, x, y - 60 * s, 2 * s + 1, 60 * s, '#A1A1AA'); box(c, x - 8 * s, y - 62 * s, 18 * s, 3 * s, '#A1A1AA');
        if (s > 0.7) sign(c, x - 26, y - 50 * s, 52, 12, BLUE, `LOT ${['EAGLE', 'LIBERTY', 'APPLE PIE', 'BALD', 'GLORY'][((n % 5) + 5) % 5]} ${((n * 7 + r) % 90 + 90) % 90}Z`, WHITE, 5);
      }
    }
  }
  void f;
};

/** Far off over America USA: a needle, an arch, a torch held up, a dome, plain towers. */
const skyline = (c: Ctx, cam: number) => {
  const sx = -(cam * 0.15) % 900;
  for (let k = -1; k < 3; k++) {
    const o = sx + k * 900;
    c.fillStyle = '#7DA3D9';
    c.fillRect(o + 40, 330, 50, 150); c.fillRect(o + 100, 300, 40, 180); c.fillRect(o + 300, 320, 60, 160); c.fillRect(o + 520, 290, 45, 190); c.fillRect(o + 700, 340, 70, 140);
    c.fillRect(o + 200, 200, 6, 280); c.beginPath(); c.ellipse(o + 203, 210, 22, 7, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#7DA3D9'; c.lineWidth = 7; c.beginPath(); c.arc(o + 430, 480, 70, Math.PI, 0); c.stroke();
    c.fillRect(o + 620, 270, 10, 210); c.fillRect(o + 628, 250, 4, 22); c.beginPath(); c.arc(o + 630, 248, 5, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(o + 820, 360, 30, Math.PI, 0); c.fill(); c.fillRect(o + 790, 360, 60, 120);
  }
};

export const drawIntroBack = (c: Ctx, state: GameState) => {
  const f = state.frame;
  const intro = getIntro(state);
  const cam = state.camera.x;
  const vis = (a: number, b: number) => b > cam - 100 && a < cam + CANVAS_WIDTH + 100;
  if (vis(R(GARAGE_END), R(STAIRS_END))) deck(c, f, intro?.office.open ?? 0, intro?.alarm ?? 0, vis);
  if (vis(X0 - 400, R(GARAGE_END))) garage(c, vis);
  if (vis(R(USA_START), R(USA_END))) america(c, f, vis);
  if (vis(R(USA_END) - 200, R(END_X) + 400)) plaza(c, state, f);
  // The floors: the garage level's slab (its edge showing, the drop under it), the stairs down, brick in America USA,
  // tiles at the plaza
  box(c, X0 - 400, UPPER, R(CHECK_END) - X0 + 400, CANVAS_HEIGHT, '#52525B'); box(c, X0 - 400, UPPER, R(CHECK_END) - X0 + 400, 3, '#71717A');
  box(c, X0 - 400, UPPER + 18, R(CHECK_END) - X0 + 400, 6, '#3F3F46');
  for (let x = X0; x < R(GARAGE_END); x += 120) box(c, x, UPPER + 30, 60, 4, '#EAB308');
  for (let x = R(GARAGE_END); x < R(CHECK_END); x += 90) { box(c, x, UPPER + 40, 6, 80, '#44403C'); }
  stairs(c, R(CHECK_END), R(STAIRS_END));
  box(c, R(STAIRS_END), GROUND_Y, R(USA_END) - R(STAIRS_END), 140, '#9A3412');
  for (let y = GROUND_Y + 4; y < GROUND_Y + 60; y += 8) for (let x = R(STAIRS_END) + ((y / 8) % 2) * 12; x < R(USA_END); x += 24) box(c, x, y, 22, 6, '#B45309');
  box(c, R(STAIRS_END), GROUND_Y, R(USA_END) - R(STAIRS_END), 3, '#D97706');
  box(c, R(USA_END), GROUND_Y, R(END_X) - R(USA_END) + 400, 140, '#D6D3D1');
  for (let x = R(USA_END); x < R(END_X) + 400; x += 40) box(c, x, GROUND_Y, 1, 140, '#A8A29E');
  box(c, R(USA_END), GROUND_Y, R(END_X) - R(USA_END) + 400, 3, '#F5F5F4');
  for (const [a, b] of WALKWAYS) walkway(c, R(a), R(b), f);
};

/** The stairs down to America USA: wide concrete steps, a brass handrail each side, flags at the bottom. */
const stairs = (c: Ctx, a: number, b: number) => {
  const n = 10, h = (GROUND_Y - UPPER) / n, w = (b - a) / n;
  for (let i = 0; i < n; i++) {
    const x = a + i * w, y = UPPER + i * h;
    box(c, x, y, w + 1, GROUND_Y - y + 140, i % 2 ? '#A8A29E' : '#9CA3AF');
    box(c, x, y, w + 1, 3, '#E7E5E4');
    box(c, x, y + 3, w + 1, 2, '#78716C');
  }
  c.strokeStyle = '#CA8A04'; c.lineWidth = 3; c.beginPath(); c.moveTo(a, UPPER - 40); c.lineTo(b, GROUND_Y - 40); c.stroke();
  for (let i = 0; i <= 4; i++) { const x = a + (b - a) * (i / 4); box(c, x - 1, UPPER + (GROUND_Y - UPPER) * (i / 4) - 40, 3, 40, '#A16207'); }
};

// ---------------------------------------------------------------------------------------------------------------
// The garage (the only thing indoors), then out on the deck: the walkway, the checkpoint

const garage = (c: Ctx, vis: (a: number, b: number) => boolean) => {
  const x0 = X0 - 400, x1 = R(GARAGE_END);
  ['#3F3F46', '#46464E', '#4D4D56'].forEach((col, i) => box(c, x0, CEIL_Y + i * 80, x1 - x0, 82, col));
  box(c, x0, CEIL_Y - 500, x1 - x0, 500, '#27272A'); box(c, x0, CEIL_Y - 10, x1 - x0, 10, '#18181B');
  // (the way out: daylight at the far end)
  box(c, x1 - 40, CEIL_Y, 40, UPPER - CEIL_Y, '#18181B');
  for (let x = X0 - 300; x < x1 - 60; x += 320) {
    box(c, x, CEIL_Y, 46, UPPER - CEIL_Y, '#6B7280'); box(c, x, CEIL_Y, 8, UPPER - CEIL_Y, '#4B5563');
    for (let k = 0; k < 4; k++) box(c, x, UPPER - 40 + k * 10, 46, 5, k % 2 ? '#18181B' : '#EAB308');
  }
  const car = (x: number, col: string, w = 120) => {
    box(c, x, UPPER - 34, w, 22, col); box(c, x + w * 0.2, UPPER - 52, w * 0.55, 20, col);
    box(c, x + w * 0.25, UPPER - 48, w * 0.2, 12, '#94A3B8'); box(c, x + w * 0.5, UPPER - 48, w * 0.2, 12, '#94A3B8');
    for (const wx of [x + 18, x + w - 30]) { c.fillStyle = '#111827'; c.beginPath(); c.arc(wx + 6, UPPER - 12, 11, 0, Math.PI * 2); c.fill(); }
  };
  if (vis(R(500), R(1400))) { car(R(560), '#64748B'); car(R(820), '#7F1D1D', 110); car(R(1240), '#334155'); }
  // (his: a big red pickup, across four spaces, crooked)
  c.save(); c.translate(R(110), UPPER - 6); c.rotate(-0.03);
  box(c, -10, -46, 230, 34, '#B91C1C'); box(c, 40, -78, 90, 34, '#B91C1C'); box(c, 52, -72, 34, 22, '#93C5FD'); box(c, 92, -72, 32, 22, '#93C5FD');
  box(c, 140, -58, 80, 12, '#7F1D1D'); box(c, -10, -20, 230, 6, '#71717A');
  for (const wx of [30, 180]) { c.fillStyle = '#0B0B0F'; c.beginPath(); c.arc(wx, -10, 16, 0, Math.PI * 2); c.fill(); c.fillStyle = '#9CA3AF'; c.beginPath(); c.arc(wx, -10, 6, 0, Math.PI * 2); c.fill(); }
  c.restore();
  for (let k = 0; k < 5; k++) box(c, R(60 + k * 70), UPPER - 2, 4, 2, WHITE);
  sign(c, R(300), CEIL_Y + 20, 210, 30, BLUE, 'LEVEL 3: LIBERTY', WHITE);
  sign(c, R(1000), CEIL_Y + 20, 330, 30, RED, 'AMERICA USA ->  THIS WAY, PATRIOT', WHITE);
  sign(c, R(620), CEIL_Y + 110, 300, 26, '#FEF3C7', "PARKING: $45. FREEDOM ISN'T FREE.", '#7F1D1D', 7);
};

/** Out on the deck: the walkway's canopy and its ads on posts, the checkpoint's tents, its office, the metal detector. */
const deck = (c: Ctx, f: number, officeOpen: number, alarm: number, vis: (a: number, b: number) => boolean) => {
  // The walkways' canopy: a long striped awning on posts (it's a shade, not a ceiling: dimmed, way up)
  if (vis(R(GARAGE_END), R(HALL_END))) {
    const a = R(GARAGE_END), b = R(HALL_END);
    for (let x = a; x < b; x += 30) box(c, x, CEIL_Y - 20, 30, 16, Math.floor((x - a) / 30) % 2 ? '#8B2E2E' : '#B9B9B9');
    box(c, a, CEIL_Y - 4, b - a, 4, '#3F3F46');
    for (let x = a + 100; x < b; x += 300) box(c, x, CEIL_Y, 6, UPPER - CEIL_Y, '#52525B');
    const ADS: [string, string, string][] = [
      ['AMERICA USA', 'NOW 20% MORE AMERICA', BLUE],
      ['FREEDOM FRIES', 'TWO FOR $19.99', RED],
      ['HAPPY LAND', 'THE HAPPIEST LAND IN THE LAND', '#7C3AED'],
      ['EAGLE DOGS', '100% AMERICAN MEAT. PROBABLY.', '#B45309'],
      ['THE STAR-SPANGLED', 'SPLASH ZONE: OPENS 2031', '#0E7490'],
      ['BE A PATRIOT', 'BUY A SOUVENIR', RED],
    ];
    ADS.forEach(([t1, t2, col], i) => {
      const x = a + 130 + i * 360, y = CEIL_Y + 30;
      box(c, x + 104, y + 96, 8, UPPER - y - 96, '#3F3F46');
      box(c, x - 4, y - 4, 228, 104, '#27272A'); box(c, x, y, 220, 96, col);
      box(c, x, y, 220, 8, RED); box(c, x, y + 88, 220, 8, BLUE);
      star(c, x + 20, y + 26, 9, WHITE); star(c, x + 200, y + 26, 9, WHITE);
      text(c, t1, x + 110, y + 42, WHITE, 10); text(c, t2, x + 110, y + 68, '#FEF9C3', 6);
    });
    sign(c, R(1560), UPPER - 110, 150, 22, '#FDE047', 'MIND YOUR STEP', INK, 7);
  }
  // The checkpoint: a white tent over the bag tables, the security office (a portable building), the metal detector
  if (vis(R(HALL_END), R(STAIRS_END))) {
    const a = R(HALL_END);
    c.fillStyle = '#F8FAFC'; c.beginPath(); c.moveTo(a + 60, UPPER - 190); c.lineTo(a + 360, UPPER - 230); c.lineTo(a + 660, UPPER - 190); c.closePath(); c.fill();
    box(c, a + 60, UPPER - 190, 600, 14, '#E2E8F0'); for (let i = 0; i < 20; i++) box(c, a + 60 + i * 30, UPPER - 176, 15, 10, i % 2 ? RED : WHITE);
    box(c, a + 70, UPPER - 176, 5, 176, '#A1A1AA'); box(c, a + 646, UPPER - 176, 5, 176, '#A1A1AA');
    sign(c, a + 200, UPPER - 260, 320, 26, BLUE, 'SECURITY CHECKPOINT', WHITE, 9);
    sign(c, a + 190, UPPER - 150, 340, 20, '#FEF3C7', 'ALL BAGS SUBJECT TO PATRIOTISM', '#7F1D1D', 7);
    box(c, a + 380, UPPER - 44, 150, 8, '#71717A'); box(c, a + 390, UPPER - 36, 6, 36, '#52525B'); box(c, a + 514, UPPER - 36, 6, 36, '#52525B'); box(c, a + 420, UPPER - 58, 50, 14, '#A1A1AA');
    // (the security office: a portable building, a window, its door, its sign)
    const ox = R(OFFICE_X);
    box(c, ox - 120, UPPER - 150, 240, 150, '#1F2937'); box(c, ox - 124, UPPER - 156, 248, 8, '#111827');
    box(c, ox - 104, UPPER - 120, 70, 50, '#60A5FA'); box(c, ox - 104, UPPER - 120, 70, 4, '#BFDBFE'); box(c, ox - 70, UPPER - 120, 2, 50, '#1F2937');
    sign(c, ox - 30, UPPER - 140, 132, 18, RED, 'SECURITY OFFICE', WHITE, 6);
    const open = Math.min(1, officeOpen / 12);
    box(c, ox - 22, UPPER - 100, 56, 100, '#0B0B0F');
    box(c, ox - 22, UPPER - 100, 56 * (1 - open * 0.85), 100, '#4B5563'); box(c, ox - 22 + 56 * (1 - open * 0.85) - 8, UPPER - 54, 4, 8, '#FACC15');
    // (the metal detector, the way out: a grey arch, a light on top; going off, flashing red, a red glow round it)
    const dx = R(DETECTOR_X) - 40, on = alarm > 0 && (alarm >> 3) % 2 === 0;
    if (alarm > 0) { c.fillStyle = `rgba(239, 68, 68, ${on ? 0.25 : 0.1})`; c.fillRect(dx - 60, UPPER - 260, 200, 260); }
    box(c, dx, UPPER - 110, 10, 110, '#9CA3AF'); box(c, dx + 70, UPPER - 110, 10, 110, '#9CA3AF'); box(c, dx - 2, UPPER - 116, 84, 10, '#6B7280');
    box(c, dx + 30, UPPER - 124, 20, 8, alarm > 0 ? (on ? '#EF4444' : '#7F1D1D') : ((f >> 5) % 2 ? '#22C55E' : '#15803D'));
    sign(c, dx - 20, UPPER - 150, 120, 16, '#FEF3C7', 'WALK THROUGH', '#7F1D1D', 6);
    if (alarm > 0 && on) text(c, 'BEEP BEEP BEEP', dx + 40, UPPER - 170, '#EF4444', 8);
    sign(c, R(CHECK_END) - 240, UPPER - 210, 200, 22, '#FDE047', 'SMILE! YOU ARE ON CAMERA', INK, 6);
    flag(c, R(CHECK_END) - 10, UPPER - 200, f, 34, 22);
  }
};

/** A moving walkway: a steel tread (its grooves going by), the comb plates at each end, a glass side, the handrail. */
const walkway = (c: Ctx, a: number, b: number, f: number) => {
  box(c, a, UPPER - 6, b - a, 6, '#9CA3AF'); box(c, a, UPPER - 6, b - a, 1, '#E5E7EB');
  const off = (f * WALKWAY_SPEED) % 12;
  for (let x = a + off; x < b; x += 12) box(c, x, UPPER - 5, 2, 4, '#6B7280');
  box(c, a - 16, UPPER - 4, 16, 4, '#FACC15'); box(c, b, UPPER - 4, 16, 4, '#FACC15');
  c.fillStyle = 'rgba(186, 230, 253, 0.25)'; c.fillRect(a, UPPER - 76, b - a, 70);
  box(c, a, UPPER - 80, b - a, 5, '#18181B');
  for (let x = a + ((f * WALKWAY_SPEED) % 40); x < b; x += 40) box(c, x, UPPER - 79, 10, 2, '#3F3F46');
  box(c, a - 4, UPPER - 84, 8, 84, '#71717A'); box(c, b - 4, UPPER - 84, 8, 84, '#71717A');
};

// ---------------------------------------------------------------------------------------------------------------
// America USA

const america = (c: Ctx, f: number, vis: (a: number, b: number) => boolean) => {
  const a = R(USA_START), b = R(USA_END);
  // The arch in: AMERICA USA, an eagle on top, stars round it
  const ax = a + 60;
  box(c, ax - 20, GROUND_Y - 330, 30, 330, '#F5F5F4'); box(c, ax + 240, GROUND_Y - 330, 30, 330, '#F5F5F4');
  box(c, ax - 30, GROUND_Y - 360, 310, 50, BLUE); box(c, ax - 30, GROUND_Y - 316, 310, 8, RED);
  text(c, 'AMERICA USA', ax + 125, GROUND_Y - 328, WHITE, 14);
  for (let i = 0; i < 9; i++) star(c, ax - 18 + i * 36, GROUND_Y - 352, 4, '#FDE047');
  eagle(c, ax + 125, GROUND_Y - 362, 1.2);
  // The districts: every one a pastiche of an American city, done as shops and restaurants, tacky as hell
  for (const d of DISTRICTS) if (vis(R(d.x), R(d.x + DISTRICT_W))) district(c, R(d.x), d.id, f);
  // Over the street: bunting from lamp to lamp; flags on every lamp
  // (lamps in the gaps between the buildings, so none's in front of a shop sign)
  const lamps = DISTRICTS.flatMap(d => [R(d.x) + 10, R(d.x) + 370]).concat([R(DISTRICTS[DISTRICTS.length - 1].x) + DISTRICT_W]);
  lamps.forEach((x, i) => {
    lamp(c, x);
    if (lamps[i + 1]) bunting(c, x, lamps[i + 1], GROUND_Y - 330, 22);
    if (i % 2 === 0) flag(c, x + 4, GROUND_Y - 380, f, 30, 18);
  });
  void b;
  // The Fountain of Freedom: a bald eagle on a column, spitting water
  const fx = R(6900);
  box(c, fx - 60, GROUND_Y - 30, 120, 30, '#D6D3D1'); box(c, fx - 56, GROUND_Y - 26, 112, 12, '#60A5FA');
  box(c, fx - 12, GROUND_Y - 160, 24, 130, '#E7E5E4'); eagle(c, fx, GROUND_Y - 170, 1);
  for (let i = 0; i < 6; i++) { const t = ((f * 2 + i * 10) % 60) / 60; box(c, fx + 14 + t * 40, GROUND_Y - 160 + t * t * 120, 3, 3, '#BFDBFE'); }
  sign(c, fx - 90, GROUND_Y - 220, 180, 18, '#FEF3C7', 'THE FOUNTAIN OF FREEDOM', '#7F1D1D', 6);
  // Carts out front: FREEDOM FRIES, EAGLE DOGS, apple pie on a stick
  cart(c, R(6220), 'FREEDOM FRIES', RED); cart(c, R(7540), 'EAGLE DOGS', BLUE); cart(c, R(8500), 'PIE ON A STICK', '#B45309');
};

const lamp = (c: Ctx, x: number) => {
  box(c, x - 3, GROUND_Y - 340, 6, 340, '#1E3A8A'); box(c, x - 10, GROUND_Y - 352, 20, 14, '#FEF3C7'); box(c, x - 12, GROUND_Y - 356, 24, 5, '#1E3A8A');
  box(c, x - 8, GROUND_Y - 10, 16, 10, '#1E3A8A');
};
const eagle = (c: Ctx, x: number, y: number, s: number) => {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = '#5C3A16'; c.beginPath(); c.moveTo(-34, 0); c.quadraticCurveTo(-18, -24, 0, -6); c.quadraticCurveTo(18, -24, 34, 0); c.quadraticCurveTo(14, -8, 0, 4); c.quadraticCurveTo(-14, -8, -34, 0); c.fill();
  c.fillStyle = '#F8FAFC'; c.beginPath(); c.arc(0, -10, 7, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#FACC15'; c.beginPath(); c.moveTo(5, -11); c.lineTo(12, -8); c.lineTo(5, -6); c.fill();
  c.fillStyle = INK; c.fillRect(1, -12, 2, 2);
  c.restore();
};
const cart = (c: Ctx, x: number, words: string, col: string) => {
  box(c, x - 50, GROUND_Y - 60, 100, 44, col); box(c, x - 50, GROUND_Y - 60, 100, 6, WHITE);
  box(c, x - 56, GROUND_Y - 112, 112, 10, WHITE); for (let i = 0; i < 7; i++) box(c, x - 56 + i * 16, GROUND_Y - 102, 16, 12, i % 2 ? RED : WHITE);
  box(c, x - 48, GROUND_Y - 102, 3, 42, '#71717A'); box(c, x + 45, GROUND_Y - 102, 3, 42, '#71717A');
  text(c, words, x, GROUND_Y - 34, WHITE, 6);
  for (const wx of [x - 34, x + 34]) { c.fillStyle = INK; c.beginPath(); c.arc(wx, GROUND_Y - 12, 10, 0, Math.PI * 2); c.fill(); }
};

/** One district: two buildings, a shop or restaurant on the ground floor of each, done as the city it's pretending to be. */
const district = (c: Ctx, x: number, id: 'nola' | 'nash' | 'chi' | 'sea' | 'bos', f: number) => {
  // (the buildings: their fronts, then the shop fronts; everything back here dimmed so nothing reads as a ledge)
  const D: Record<string, { walls: string[]; shops: [string, string, string][]; tag: string }> = {
    nola: { walls: ['#F9A8D4', '#86EFAC'], shops: [['BIG EASY BEIGNETS', '#FEF3C7', '#7C2D12'], ['VOODOO-RAMA GIFTS', '#4C1D95', '#FDE047']], tag: 'NEW ORLEANS-ISH' },
    nash: { walls: ['#FCA5A5', '#FDE68A'], shops: [['HONKY TONK HEAVEN', '#7F1D1D', '#FDE047'], ['BOOT BARN-O-RAMA', '#78350F', '#FEF3C7']], tag: 'NASHVILLE-ISH' },
    chi: { walls: ['#B45309', '#9A3412'], shops: [['DEEP DISH DEPOT', '#B91C1C', '#FEF3C7'], ['WINDY CITY TEES', '#1E3A8A', WHITE]], tag: 'CHICAGO-ISH' },
    sea: { walls: ['#64748B', '#4D7C0F'], shops: [["CUP O' JOE-MERICA", '#14532D', '#FEF3C7'], ['FLYING FISH MARKET', '#0E7490', WHITE]], tag: 'SEATTLE-ISH' },
    bos: { walls: ['#9F1239', '#A16207'], shops: [['CHOWDAH HOUSE', '#1E3A8A', '#FEF3C7'], ['REVOLUTION GIFT SHOPPE', '#7F1D1D', '#FDE047']], tag: 'BOSTON-ISH' },
  };
  const d = D[id];
  for (let k = 0; k < 2; k++) {
    const bx = x + 20 + k * 360, bw = 340, top = GROUND_Y - 300 - (k ? 30 : 0);
    box(c, bx, top, bw, GROUND_Y - top, dim(d.walls[k]));
    // (upstairs windows; the city's own touch)
    for (let r = 0; r < 2; r++) for (let w = 0; w < 4; w++) {
      const wx = bx + 24 + w * 80, wy = top + 26 + r * 70;
      box(c, wx, wy, 44, 46, '#1F2937'); box(c, wx + 2, wy + 2, 40, 42, '#93C5FD'); box(c, wx + 21, wy + 2, 2, 42, '#1F2937');
      if (id === 'nola') { box(c, wx - 6, wy + 44, 56, 4, '#18181B'); for (let i = 0; i < 7; i++) box(c, wx - 4 + i * 8, wy + 30, 2, 14, '#18181B'); } // wrought iron balconies
      if (id === 'bos') { box(c, wx - 4, wy - 6, 52, 6, '#F5F5F4'); } // stone lintels
      if (id === 'sea' && r === 0) box(c, wx, wy - 4, 44, 4, '#A3E635');
      if (id === 'chi') box(c, wx - 2, wy + 46, 48, 3, '#F5F5F4');
    }
    // (the shop front: its sign, the window, a dimmed awning)
    const [name, face, ink] = d.shops[k];
    const sy = GROUND_Y - 150;
    sign(c, bx + 20, sy, bw - 40, 30, face, name, ink, 9);
    box(c, bx + 20, sy + 40, bw - 40, 12, dim(k ? BLUE : RED)); for (let i = 0; i < (bw - 40) / 20; i++) box(c, bx + 20 + i * 20, sy + 52, 20, 6, dim(i % 2 ? RED : WHITE));
    box(c, bx + 30, sy + 66, 160, 84, '#0F172A'); box(c, bx + 34, sy + 70, 152, 76, '#1E40AF');
    // (in the window: whatever they're selling)
    shopWindow(c, bx + 34, sy + 70, id, k, f);
    box(c, bx + 220, sy + 66, 70, 84, '#3F2A14'); box(c, bx + 270, sy + 104, 6, 6, '#FACC15'); // the door
    // (a flag hung off every building, because)
    flag(c, bx + bw - 30, top + 6, f + k * 20, 24, 16);
  }
  // (the district's own touch over it all: neon, the L, a sign saying what it's meant to be)
  if (id === 'nash') { const on = (f >> 3) % 2; c.strokeStyle = on ? '#F472B6' : '#9D174D'; c.lineWidth = 4; c.beginPath(); c.ellipse(x + 190, GROUND_Y - 220, 26, 34, 0.4, 0, Math.PI * 2); c.stroke(); box(c, x + 196, GROUND_Y - 300, 6, 70, on ? '#F472B6' : '#9D174D'); }
  if (id === 'chi') { box(c, x, GROUND_Y - 270, DISTRICT_W, 12, '#1F2937'); for (const k of [6, 366, 726]) box(c, x + k, GROUND_Y - 260, 8, 260, '#374151'); }
  if (id === 'sea') { c.fillStyle = 'rgba(203, 213, 225, 0.35)'; for (let i = 0; i < 20; i++) c.fillRect(x + ((i * 53 + f * 2) % DISTRICT_W), (i * 37 + f * 5) % (GROUND_Y - 100), 1, 6); } // drizzle, on schedule
  if (id === 'nola') for (let i = 0; i < 9; i++) { c.fillStyle = ['#A855F7', '#22C55E', '#FACC15'][i % 3]; c.beginPath(); c.arc(x + 60 + i * 70, GROUND_Y - 186 + Math.sin(i) * 4, 3, 0, Math.PI * 2); c.fill(); } // beads
  sign(c, x + DISTRICT_W / 2 - 70, GROUND_Y - 390, 140, 16, WHITE, d.tag, BLUE, 6, RED);
};
const dim = (hex: string) => {
  const n = parseInt(hex.slice(1), 16), k = 0.62;
  return `rgb(${Math.round(((n >> 16) & 255) * k)}, ${Math.round(((n >> 8) & 255) * k)}, ${Math.round((n & 255) * k)})`;
};
const shopWindow = (c: Ctx, x: number, y: number, id: string, k: number, f: number) => {
  // (stock in the window, tacky as it gets)
  if (id === 'nola' && k === 0) for (let i = 0; i < 6; i++) { c.fillStyle = '#FEF3C7'; c.fillRect(x + 10 + i * 22, y + 50, 16, 10); c.fillStyle = WHITE; c.fillRect(x + 10 + i * 22, y + 48, 16, 3); }
  else if (id === 'nola') for (let i = 0; i < 4; i++) { c.fillStyle = '#E7E5E4'; c.beginPath(); c.arc(x + 24 + i * 34, y + 40, 9, 0, Math.PI * 2); c.fill(); c.fillStyle = INK; c.fillRect(x + 19 + i * 34, y + 37, 3, 3); c.fillRect(x + 26 + i * 34, y + 37, 3, 3); }
  else if (id === 'nash' && k === 1) for (let i = 0; i < 5; i++) { box(c, x + 10 + i * 28, y + 30, 12, 30, '#92400E'); box(c, x + 10 + i * 28, y + 56, 20, 8, '#92400E'); }
  else if (id === 'nash') { c.fillStyle = '#FDE047'; for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(x + 30 + i * 46, y + 44, 12, 16, 0.3, 0, Math.PI * 2); c.fill(); } }
  else if (id === 'chi' && k === 0) { c.fillStyle = '#D97706'; c.beginPath(); c.arc(x + 76, y + 46, 26, 0, Math.PI * 2); c.fill(); c.fillStyle = RED; c.beginPath(); c.arc(x + 76, y + 46, 20, 0, Math.PI * 2); c.fill(); }
  else if (id === 'sea' && k === 1) { const t = (f % 80) / 80; c.fillStyle = '#94A3B8'; c.beginPath(); c.ellipse(x + 20 + t * 110, y + 30 - Math.sin(t * Math.PI) * 20, 14, 5, 0, 0, Math.PI * 2); c.fill(); }
  else for (let i = 0; i < 4; i++) { box(c, x + 12 + i * 34, y + 24, 26, 30, [RED, WHITE, BLUE, '#FDE047'][i]); star(c, x + 25 + i * 34, y + 38, 6, i === 1 ? BLUE : WHITE); }
};

// ---------------------------------------------------------------------------------------------------------------
// The ticket plaza and the gate

const plaza = (c: Ctx, state: GameState, f: number) => {
  const intro = getIntro(state);
  // The gate: a great arch, HAPPY LAND across it, the park's smiling star on top
  const gx = R(GATE_X) + 40;
  box(c, gx - 160, GROUND_Y - 380, 40, 380, '#FDE68A'); box(c, gx + 120, GROUND_Y - 380, 40, 380, '#FDE68A');
  c.fillStyle = '#EC4899'; c.beginPath(); c.moveTo(gx - 170, GROUND_Y - 380); c.quadraticCurveTo(gx, GROUND_Y - 480, gx + 170, GROUND_Y - 380); c.lineTo(gx + 170, GROUND_Y - 340); c.quadraticCurveTo(gx, GROUND_Y - 440, gx - 170, GROUND_Y - 340); c.fill();
  text(c, 'HAPPY LAND', gx, GROUND_Y - 390, '#FEF9C3', 14);
  star(c, gx, GROUND_Y - 470, 24, '#FACC15'); c.fillStyle = INK; c.fillRect(gx - 7, GROUND_Y - 474, 3, 4); c.fillRect(gx + 4, GROUND_Y - 474, 3, 4); c.beginPath(); c.arc(gx, GROUND_Y - 466, 6, 0, Math.PI); c.fill();
  flag(c, gx - 220, GROUND_Y - 420, f, 40, 26); flag(c, gx + 210, GROUND_Y - 420, f + 30, 40, 26);
  // The ticket booths: three windows, two closed, hers open
  const bx = R(WINDOW_X) - 170;
  box(c, bx, GROUND_Y - 200, 260, 200, '#1E3A8A'); box(c, bx, GROUND_Y - 200, 260, 14, RED); box(c, bx, GROUND_Y - 186, 260, 6, WHITE);
  text(c, 'TICKETS', bx + 130, GROUND_Y - 162, '#FDE047', 12);
  for (let i = 0; i < 3; i++) {
    const wx = bx + 20 + i * 80;
    box(c, wx, GROUND_Y - 140, 60, 70, '#0F172A');
    if (i < 2) { box(c, wx + 4, GROUND_Y - 136, 52, 62, '#334155'); sign(c, wx + 4, GROUND_Y - 112, 52, 14, '#FEF3C7', 'CLOSED', RED, 6, INK); }
    else ticketLady(c, wx + 30, GROUND_Y - 70, f, intro?.lady.ko ?? 0);
    box(c, wx - 4, GROUND_Y - 72, 68, 6, '#9CA3AF');
  }
  // The line: posts and ropes (red, white and blue), back from the window
  for (let x = R(QUEUE_START) - 40; x < R(FRONT_X) + 20; x += 120) { box(c, x, GROUND_Y - 44, 6, 44, '#CA8A04'); c.fillStyle = '#FDE047'; c.beginPath(); c.arc(x + 3, GROUND_Y - 46, 5, 0, Math.PI * 2); c.fill(); }
  for (let x = R(QUEUE_START) - 40; x < R(FRONT_X) - 100; x += 120) bunting(c, x + 3, x + 123, GROUND_Y - 44, 10);
  sign(c, R(QUEUE_START) - 60, GROUND_Y - 120, 150, 20, '#FEF3C7', 'LINE STARTS HERE', BLUE, 6);
  sign(c, R(QUEUE_START) + 120, GROUND_Y - 120, 210, 20, '#FEF3C7', 'WAIT TIME FROM HERE: YES', RED, 6);
  // The turnstile: arms out (or swung round, once he's let in)
  const tx = R(TURN_X);
  box(c, tx, GROUND_Y - 60, 20, 60, '#9CA3AF'); box(c, tx + 2, GROUND_Y - 58, 16, 4, intro?.admitted ? '#22C55E' : RED);
  if (!intro?.admitted) { box(c, tx - 26, GROUND_Y - 40, 26, 4, '#D4D4D8'); } else { box(c, tx + 8, GROUND_Y - 30, 4, 26, '#D4D4D8'); }
  void SPACING;
};

/** The ticket lady in her window: a red-white-and-blue visor, a headset, a smile that's been on all day. Knocked out, slumped. */
const ticketLady = (c: Ctx, x: number, y: number, f: number, ko: number) => {
  c.save(); c.translate(x, y);
  if (ko > 0) { c.translate(0, Math.min(22, ko * 2)); c.rotate(Math.min(0.8, ko * 0.06)); }
  box(c, -14, -34, 28, 34, '#DC2626'); box(c, -14, -34, 28, 4, WHITE);
  c.fillStyle = '#E0AC69'; c.beginPath(); c.ellipse(0, -46, 10, 11, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#7C2D12'; c.beginPath(); c.ellipse(0, -52, 11, 7, 0, Math.PI, 0); c.fill(); box(c, -11, -52, 4, 14, '#7C2D12'); box(c, 7, -52, 4, 14, '#7C2D12');
  box(c, -12, -56, 24, 4, BLUE); box(c, -4, -54, 20, 3, RED); // the visor
  box(c, 9, -48, 3, 8, '#18181B'); box(c, 5, -40, 7, 2, '#18181B'); // the headset's mic
  if (ko > 0) { c.strokeStyle = INK; c.lineWidth = 1.2; for (const ex of [-4, 4]) { c.beginPath(); c.moveTo(ex - 2, -48); c.lineTo(ex + 2, -44); c.moveTo(ex + 2, -48); c.lineTo(ex - 2, -44); c.stroke(); } }
  else { box(c, -5, -48, 2, 2, INK); box(c, 3, -48, 2, 2, INK); c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.arc(0, -42, 4, 0.2, Math.PI - 0.2); c.stroke(); }
  c.restore();
  if (ko > 0) for (let i = 0; i < 3; i++) { const a = f * 0.2 + i * 2.1; star(c, x + Math.cos(a) * 14, y - 60 + Math.min(22, ko * 2) + Math.sin(a) * 4, 3, '#FDE047'); }
};

// ---------------------------------------------------------------------------------------------------------------
// In front: who's saying what (over their heads, only while it's said), the PA

const said = (c: Ctx, s: string, x: number, y: number, col = WHITE, wide = 220) => {
  c.font = '7px "Press Start 2P"';
  const words = s.split(' '), lines: string[] = [];
  let cur = '';
  for (const w of words) { const t = cur ? `${cur} ${w}` : w; if (c.measureText(t).width > wide && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur);
  lines.forEach((l, i) => text(c, l, x, y - (lines.length - 1 - i) * 11, col, 7));
};

export const drawIntroFront = (c: Ctx, state: GameState) => {
  const intro = getIntro(state);
  if (!intro) return;
  if (intro.lady.said?.text) said(c, intro.lady.said.text, R(WINDOW_X) - 10, GROUND_Y - 220, '#FDE047');
  if (intro.bark?.said.text) { const e = intro.bark.e; said(c, intro.bark.said.text, e.pos.x + e.width / 2, e.pos.y - 26, '#93C5FD'); }
  // (the people in line: whatever they're saying, over their heads)
  for (const e of state.enemies) { const g = guests.get(e); if (g?.line && !e.isBlownAway && e.health > 0) said(c, g.line, e.pos.x + e.width / 2, e.pos.y - 26, '#FEF3C7'); }
  if (intro.pa.said?.text) {
    // (the PA: a banner across the top, clear of the HUD's corner)
    const left = state.camera.x + HUD_CLEAR_X, w = CANVAS_WIDTH - HUD_CLEAR_X - 12, y = state.camera.y + HUD_CLEAR_Y + 8;
    c.fillStyle = 'rgba(30, 58, 138, 0.88)'; c.fillRect(left, y, w, 52);
    box(c, left, y, w, 3, RED); box(c, left, y + 49, w, 3, RED);
    said(c, `PA: ${intro.pa.said.text}`, left + w / 2, y + 40, WHITE, w - 20);
  }
  void CANVAS_HEIGHT;
};
