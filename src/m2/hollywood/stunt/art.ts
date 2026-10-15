// STUNTMAN STEVE'S STUPENDOUS STUNTERY, drawn (crude first pass). An open-air amphitheater: the seating bowl going up
// round the back under the sky (half empty), stadium light towers; the set along the back of the stage a street (plywood
// shopfronts, a gas station, a diner, a lamp post, a traffic light, a hydrant), the posse's garage doors in it; the
// truss over the stage (the marquee in bulbs, the hoops' trolleys, the rings of fire over Steve's two ends); the giant
// yellow banner of his face, the jumbotron looping his two seconds in a real movie; bleachers up both ends past the
// stacked-tire walls; the asphalt floor, its lanes, the skid marks; the crash mats he never hits; and in front, the
// concrete barrier and the small crowd behind it (they eat it all up).
//
// The static parts are painted once into canvases and blitted (frame rate with a lot of cars about).

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { box } from '../section';
import { drawTodSky, hourMix, timeOfDay } from '../../timeOfDay';
import { happywoodHill } from '../section';
import { words, print, enamel, marquee } from '../blvd/paint';
import { ARENA_L, ARENA_R, ARENA_W, GY, ZK, BACK_Z, LANE_BACK, LANE_FRONT, FLOOR_BACK_Y, BARRIER_Y, DOORS_X, TRUSS_Y, STEVE_AT, x0 } from './arena';
import { RAMP, hoopOf } from './cars';
import type { Ramp, Skid } from './state';
import { drawSteve } from './steve';

type Ctx = CanvasRenderingContext2D;
const INK = '#1A0B06';
const h01 = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** Painted once. */
const cache = new Map<string, HTMLCanvasElement>();
const painted = (key: string, w: number, h: number, paint: (g: Ctx) => void) => {
  let cv = cache.get(key);
  if (!cv) { cv = document.createElement('canvas'); cv.width = w; cv.height = h; paint(cv.getContext('2d')!); cache.set(key, cv); }
  return cv;
};
const inView = (state: GameState, a: number, b: number) => b > state.camera.x - 40 && a < state.camera.x + CANVAS_WIDTH + 40;

// ---------------------------------------------------------------------------------------------------------------
// Screen space: the sky, the hill, the bowl

export const drawStuntBackdrop = (c: Ctx, state: GameState) => {
  drawTodSky(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, ['#1E3A8A', '#3B82F6', '#93C5FD', '#FDE68A'], { horizon: 330, sun: [620, 90], moon: [160, 70] });
  happywoodHill(c, 600 - (state.camera.x - ARENA_L) * 0.02, 300, hourMix('#A16207', '#92400E', '#3F2A14'));
  // (the bowl: tiers of seats round the back, rising to the rim; parallax, slow)
  const px = 400 - (state.camera.x - (ARENA_L + ARENA_W / 2)) * 0.12;
  const seat = hourMix('#78716C', '#57534E', '#292524'), seat2 = hourMix('#57534E', '#44403C', '#1C1917');
  for (let i = 0; i < 9; i++) {
    const rx = 1300 - i * 60, ry = 210 - i * 18;
    c.fillStyle = i % 2 ? seat : seat2; c.beginPath(); c.ellipse(px, 470, rx, ry, 0, Math.PI, 0); c.fill();
  }
  // (the people in it: a few, dotted about the half-empty rows)
  for (let i = 0; i < 70; i++) {
    const a = Math.PI + h01(i) * Math.PI, tier = Math.floor(h01(i * 3.1) * 8), rx = 1270 - tier * 60, ry = 196 - tier * 18;
    const x = px + Math.cos(a) * rx, y = 470 + Math.sin(a) * ry;
    if (y > 440) continue;
    box(c, x, y - 4, 3, 4, ['#DC2626', '#2563EB', '#FACC15', '#F8FAFC', '#16A34A'][i % 5]);
  }
  // (the light towers on the rim)
  const lamps = timeOfDay().lamps;
  for (const sx of [-1, 1]) {
    const tx = px + sx * 900;
    box(c, tx - 3, 120, 6, 300, hourMix('#52525B', '#3F3F46', '#18181B'));
    box(c, tx - 30, 100, 60, 26, INK); box(c, tx - 28, 102, 56, 22, '#3F3F46');
    for (let k = 0; k < 6; k++) box(c, tx - 26 + (k % 3) * 18, 104 + Math.floor(k / 3) * 10, 14, 8, lamps > 0.3 ? '#FEF9C3' : '#A1A1AA');
    if (lamps > 0.3) { c.fillStyle = `rgba(254, 249, 195, ${(0.12 * lamps).toFixed(2)})`; c.beginPath(); c.moveTo(tx - 30, 126); c.lineTo(tx + 30, 126); c.lineTo(tx - sx * 260, 560); c.lineTo(tx - sx * 460, 560); c.closePath(); c.fill(); }
  }
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// The set along the back: a street of plywood shopfronts, the garage doors in it

const SET_H = 300, SET_W = ARENA_W + 80;
const FRONTS: { x: number; w: number; name: string; wall: string; trim: string }[] = [
  { x: 20, w: 120, name: 'PAWN', wall: '#7C2D12', trim: '#FDBA74' },
  { x: 370, w: 270, name: 'DINER', wall: '#0E7490', trim: '#F0ABFC' },
  { x: 900, w: 300, name: 'GAS', wall: '#F8FAFC', trim: '#DC2626' },
  { x: 1430, w: 260, name: 'BANK', wall: '#57534E', trim: '#FDE68A' },
  { x: 1930, w: 130, name: 'LIQUOR', wall: '#4D7C0F', trim: '#FEF08A' },
];
const paintSet = (g: Ctx) => {
  const b = SET_H;
  // (the plywood back wall, braced: the backs of nothing)
  box(g, 0, 40, SET_W, b - 40, '#44403C');
  for (let x = 0; x < SET_W; x += 48) box(g, x, 40, 2, b - 40, '#3A3532');
  for (const f of FRONTS) {
    const top = 70 + (f.w % 3) * 14;
    box(g, f.x - 2, top - 2, f.w + 4, b - top + 2, INK); box(g, f.x, top, f.w, b - top, f.wall);
    box(g, f.x, top, f.w, 6, f.trim);
    // (its windows, its door, its awning)
    for (let wx = f.x + 16; wx < f.x + f.w - 40; wx += 54) { box(g, wx, top + 44, 36, 40, INK); box(g, wx + 2, top + 46, 32, 36, '#1E293B'); box(g, wx + 4, top + 48, 10, 4, '#64748B'); }
    box(g, f.x + f.w / 2 - 16, b - 70, 32, 70, INK); box(g, f.x + f.w / 2 - 14, b - 68, 28, 68, '#292524');
    for (let ax = f.x; ax < f.x + f.w; ax += 20) box(g, ax, top + 30, 20, 10, (ax / 20) % 2 ? f.trim : '#F8FAFC');
    words(g, f.name, f.x + f.w / 2, top + 26, enamel({ sx: 2, sy: 2 }, f.trim, INK));
  }
  // (the gas station's pump, the lamp posts, the traffic light, a hydrant, a mailbox: the street's furniture)
  box(g, 1050, b - 64, 26, 64, INK); box(g, 1052, b - 62, 22, 60, '#DC2626'); box(g, 1056, b - 54, 14, 12, '#FEF3C7');
  for (const lx of [310, 820, 1330, 1870]) { box(g, lx, b - 190, 6, 190, '#27272A'); box(g, lx - 10, b - 196, 26, 8, '#27272A'); box(g, lx - 6, b - 188, 14, 6, '#FEF08A'); }
  box(g, 1290, b - 230, 6, 230, '#27272A'); box(g, 1276, b - 236, 34, 60, INK);
  for (let k = 0; k < 3; k++) box(g, 1286, b - 230 + k * 18, 14, 14, ['#DC2626', '#CA8A04', '#16A34A'][k]);
  box(g, 600, b - 24, 16, 24, '#DC2626'); box(g, 598, b - 28, 20, 6, '#B91C1C');
  box(g, 1720, b - 40, 22, 40, '#1D4ED8'); box(g, 1720, b - 46, 22, 8, '#1E40AF');
};

/** The garage doors (the posse's), where they are: a dark opening, the roll-up half up, STUNT CREW over it. */
const drawDoor = (c: Ctx, dx: number, base: number, lit: boolean) => {
  box(c, dx - 106, base - 136, 212, 136, INK);
  box(c, dx - 100, base - 128, 200, 128, '#0C0A09');
  box(c, dx - 100, base - 128, 200, 34, '#71717A');
  for (let y = base - 124; y < base - 96; y += 7) box(c, dx - 100, y, 200, 2, '#52525B');
  // (the hazard stripes down its sides)
  for (let y = base - 128; y < base; y += 16) { box(c, dx - 106, y, 6, 8, '#FACC15'); box(c, dx + 100, y + 8, 6, 8, '#FACC15'); }
  if (lit) for (const s of [-1, 1]) box(c, dx + s * 40 - 8, base - 40, 16, 8, '#FEF08A');
  words(c, 'STUNT CREW ONLY', dx, base - 144, print(1, '#FACC15', INK));
};

/** Steve's giant face: a yellow banner off the truss (the mullet, the aviators, the mustache, the thumb up). */
const paintBanner = (g: Ctx) => {
  const w = 240, h = 210;
  box(g, 0, 0, w, h, INK); box(g, 3, 3, w - 6, h - 6, '#FACC15');
  box(g, 3, h - 30, w - 6, 27, '#DC2626');
  words(g, 'THE ONE. THE ONLY.', w / 2, 22, print({ sx: 1, sy: 2 }, INK));
  // (him: a big drawing of his head, the thumb)
  g.save(); g.translate(w / 2 - 6, 186); g.scale(1.55, 1.55); drawSteve(g, 0, 0, 1, 'thumb', 0, {}); g.restore();
  words(g, 'STUNTMAN STEVE', w / 2, h - 9, enamel({ sx: 2, sy: 2 }, '#FEF08A', INK));
};

/** The marquee across the truss, in bulbs. */
const MARQ = "STUNTMAN STEVE'S STUPENDOUS STUNTERY";
const paintMarquee = (g: Ctx, lit: boolean) => {
  const w = 900, h = 52;
  box(g, 0, 0, w, h, INK); box(g, 3, 3, w - 6, h - 6, '#18181B'); box(g, 3, 3, w - 6, 4, '#FACC15'); box(g, 3, h - 7, w - 6, 4, '#FACC15');
  words(g, MARQ, w / 2, 38, marquee(3, 4, '#FACC15', lit));
};

/** The stage behind everything that moves (but the cars, ramps, hoops: fight.ts draws those over it). */
export const drawStage = (c: Ctx, state: GameState, opts: { cleared: boolean; hype: number; replay: number; hurtFlash: number; doorsLit: boolean }) => {
  const v = { x: state.camera.x, y: state.camera.y };
  const f = state.frame;
  // The bleachers up both ends, past the walls (the people in them, sparse)
  for (const side of [-1, 1]) {
    const ex = side < 0 ? ARENA_L - 30 : ARENA_R + 30;
    if (!inView(state, ex - 420, ex + 420)) continue;
    for (let k = 0; k < 9; k++) {
      const y = GY - 20 - k * 34, x = side < 0 ? ex - 40 - k * 40 : ex + 40 + k * 40;
      const a = side < 0 ? x - 500 : x, w = 500;
      box(c, a, y, w, 34, k % 2 ? '#57534E' : '#44403C'); box(c, a, y, w, 4, '#A8A29E');
      for (let i = 0; i < 6; i++) {
        if (h01(k * 13 + i + (side > 0 ? 50 : 0)) < 0.55) continue;
        const px = side < 0 ? x - 30 - i * 70 : x + 30 + i * 70, bob = opts.hype > 0.4 ? Math.round(Math.sin(f * 0.3 + i) * 3) : 0;
        box(c, px - 6, y - 18 + bob, 12, 18, ['#DC2626', '#2563EB', '#FACC15', '#F8FAFC'][(i + k) % 4]);
        box(c, px - 4, y - 28 + bob, 8, 9, ['#E0A27A', '#8D5524', '#F1C27D', '#C68642'][(i * 3 + k) % 4]);
        if (opts.hype > 0.6) { box(c, px - 9, y - 34 + bob, 3, 14, '#E0A27A'); box(c, px + 6, y - 34 + bob, 3, 14, '#E0A27A'); }
      }
    }
  }
  // The set along the back (painted once), its garage doors cut into it
  const setX = ARENA_L - 40, base = FLOOR_BACK_Y + 2;
  if (inView(state, setX, setX + SET_W)) {
    const cv = painted('stunt-set', SET_W, SET_H, paintSet);
    const sx = Math.max(0, Math.floor(v.x - setX - 40)), sw = Math.min(SET_W - sx, CANVAS_WIDTH + 80);
    if (sw > 0) c.drawImage(cv, sx, 0, sw, SET_H, setX + sx, base - SET_H, sw, SET_H);
    for (const dx of DOORS_X) if (inView(state, dx - 110, dx + 110)) drawDoor(c, dx, base, opts.doorsLit);
  }
  // The truss over the stage, the marquee on it, the banner off it, the jumbotron on its tower
  if (inView(state, ARENA_L - 60, ARENA_R + 60)) {
    const a = Math.max(ARENA_L - 60, v.x - 40), b = Math.min(ARENA_R + 60, v.x + CANVAS_WIDTH + 40);
    box(c, a, TRUSS_Y - 2, b - a, 22, INK); box(c, a, TRUSS_Y, b - a, 4, '#A1A1AA'); box(c, a, TRUSS_Y + 14, b - a, 4, '#A1A1AA');
    for (let x = Math.floor(a / 40) * 40; x < b; x += 40) { c.strokeStyle = '#A1A1AA'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, TRUSS_Y + 2); c.lineTo(x + 20, TRUSS_Y + 16); c.lineTo(x + 40, TRUSS_Y + 2); c.stroke(); }
    // (its legs, at the ends)
    for (const lx of [ARENA_L - 50, ARENA_R + 40]) if (inView(state, lx, lx + 12)) box(c, lx, TRUSS_Y, 12, GY - TRUSS_Y, '#52525B');
  }
  const mq = ARENA_L + ARENA_W / 2;
  if (inView(state, mq - 460, mq + 460)) {
    const lit = !opts.cleared && Math.floor(f / 20) % 2 === 0;
    const cv = painted(lit ? 'stunt-marq-on' : 'stunt-marq-off', 900, 52, g => paintMarquee(g, lit));
    c.drawImage(cv, mq - 450, TRUSS_Y - 62);
    for (const s of [-420, 420]) box(c, mq + s, TRUSS_Y - 10, 4, 10, '#57534E');
    if (opts.cleared) {
      // (SHOW CANCELED, taped over it crooked)
      c.save(); c.translate(mq, TRUSS_Y - 36); c.rotate(-0.06);
      box(c, -170, -20, 340, 40, INK); box(c, -167, -17, 334, 34, '#F8FAFC');
      words(c, 'SHOW CANCELED', 0, 10, print({ sx: 3, sy: 3 }, '#DC2626'));
      c.restore();
    }
  }
  const bx = ARENA_L + 520;
  if (inView(state, bx - 130, bx + 130)) {
    box(c, bx - 100, TRUSS_Y + 18, 2, 30, '#A1A1AA'); box(c, bx + 98, TRUSS_Y + 18, 2, 30, '#A1A1AA');
    c.drawImage(painted('stunt-banner', 240, 210, paintBanner), bx - 120, TRUSS_Y + 46);
  }
  const jx = ARENA_R - 560;
  if (inView(state, jx - 130, jx + 130)) drawJumbotron(c, jx, TRUSS_Y + 60, f, opts);
  // The stacked-tire walls at both ends, the fence over them
  for (const wx of [ARENA_L - 34, ARENA_R]) {
    if (!inView(state, wx - 10, wx + 44)) continue;
    box(c, wx + 14, GY - 300, 4, 170, '#71717A');
    for (let y = GY - 300; y < GY - 130; y += 12) box(c, wx, y, 34, 1, '#A1A1AA');
    for (let k = 0; k < 7; k++) { const y = GY - 20 - k * 20; box(c, wx - 2, y, 38, 20, INK); box(c, wx, y + 2, 34, 16, '#27272A'); box(c, wx + 4, y + 6, 26, 8, '#18181B'); box(c, wx, y + 2, 34, 2, k % 2 ? '#FACC15' : '#3F3F46'); }
  }
  // The floor: asphalt from the set's foot to the barrier (darker going back), its lanes, the stage's mark (his line)
  const fa = Math.max(ARENA_L - 40, v.x - 40), fb = Math.min(ARENA_R + 40, v.x + CANVAS_WIDTH + 40);
  if (fb > fa) {
    box(c, fa, FLOOR_BACK_Y, fb - fa, GY - FLOOR_BACK_Y, '#3F3F46');
    box(c, fa, FLOOR_BACK_Y, fb - fa, 10, '#353539');
    box(c, fa, GY, fb - fa, 400, '#46464D');
    // (the lanes: dashed, the back one and the front one; the mark tape along his line, lit: he stands on it)
    for (const lz of [LANE_BACK, LANE_FRONT]) { const ly = GY + lz * ZK; for (let x = Math.floor(fa / 60) * 60; x < fb; x += 60) box(c, x, ly - 1, 30, 2, '#D6D3D1'); }
    box(c, fa, GY - 1, fb - fa, 2, '#FACC15');
    // (the big star painted in the middle of it, flattened)
    const stx = ARENA_L + ARENA_W / 2;
    if (inView(state, stx - 160, stx + 160)) {
      c.fillStyle = 'rgba(250, 204, 21, 0.35)'; c.beginPath();
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 60 : 150; const px = stx + Math.cos(a) * r, py = GY - 10 + Math.sin(a) * r * ZK; i ? c.lineTo(px, py) : c.moveTo(px, py); }
      c.closePath(); c.fill();
    }
  }
  // The crash mats by Steve's two ends (he never lands on one), and his name on the floor where he stands
  for (const side of [-1, 1] as const) {
    const sx = STEVE_AT(side), mx = sx - side * 150;
    if (!inView(state, mx - 90, sx + 60)) continue;
    box(c, mx - 70, GY - 28 + LANE_BACK * ZK * 0.2, 140, 30, INK); box(c, mx - 68, GY - 26 + LANE_BACK * ZK * 0.2, 136, 26, '#1D4ED8'); box(c, mx - 68, GY - 26 + LANE_BACK * ZK * 0.2, 136, 4, '#60A5FA');
    words(c, 'CRASH MAT', mx, GY - 8 + LANE_BACK * ZK * 0.2, print(1, '#BFDBFE'));
    words(c, 'STEVE', sx, GY - 4 + BACK_Z * ZK * 0.15, print({ sx: 1, sy: 1 }, '#FACC15'));
  }
  // (an old wreck or two lying about, after)
  if (opts.cleared) for (const wx of [ARENA_L + 640, ARENA_L + 1320]) if (inView(state, wx - 90, wx + 90)) { box(c, wx - 80, GY - 32, 160, 30, INK); box(c, wx - 78, GY - 30, 156, 26, '#292524'); box(c, wx - 30, GY - 48, 60, 18, '#1C1917'); }
};

/** The jumbotron: Steve's two seconds of fame, looping (or an instant replay of the man who fell out of the sky). */
const drawJumbotron = (c: Ctx, x: number, y: number, f: number, o: { replay: number; hurtFlash: number; cleared: boolean }) => {
  box(c, x - 4, y + 130, 8, 140, '#52525B');
  box(c, x - 124, y - 4, 248, 138, INK); box(c, x - 120, y, 240, 130, '#0B1020');
  c.save(); c.beginPath(); c.rect(x - 116, y + 4, 232, 110); c.clip();
  if (o.cleared) { words(c, 'NO SIGNAL', x, y + 64, print({ sx: 2, sy: 2 }, '#64748B')); }
  else if (o.replay > 0) {
    // (INSTANT REPLAY: a little him falling out of the sky, again and again)
    const k = (o.replay % 90) / 90;
    box(c, x - 116, y + 4, 232, 110, '#60A5FA');
    box(c, x - 116, y + 96, 232, 18, '#44403C');
    const my = y + 10 + k * 86;
    c.save(); c.translate(x, my); c.rotate(k * 9); box(c, -6, -10, 12, 20, '#E0A27A'); box(c, -6, 0, 12, 10, '#1D4ED8'); c.restore();
    words(c, 'INSTANT REPLAY', x, y + 22, print({ sx: 1, sy: 2 }, '#FFFFFF', INK));
  } else if (o.hurtFlash > 0) {
    box(c, x - 116, y + 4, 232, 110, '#7F1D1D'); words(c, 'OUCH', x, y + 70, print({ sx: 4, sy: 4 }, '#FEF08A'));
  } else {
    // (his two seconds: a car goes by; for a beat, there he is, behind it; then gone; FILM 1986 in the corner)
    const t = f % 240;
    box(c, x - 116, y + 4, 232, 110, '#78716C'); box(c, x - 116, y + 80, 232, 34, '#3F3F46');
    if (t > 60 && t < 130) { drawSteve(c, x + 20, y + 100, -1, 'sidestep', f, {}); }
    const cx = x - 160 + ((t * 4) % 440);
    box(c, cx - 40, y + 76, 80, 22, '#DC2626'); box(c, cx - 20, y + 64, 44, 14, '#991B1B');
    if (t > 60 && t < 130) words(c, 'THAT\'S HIM!', x + 20, y + 20, print({ sx: 1, sy: 2 }, '#FACC15', INK));
    words(c, 'FILM 1986', x + 80, y + 110, print(1, '#E7E5E4'));
  }
  // (scanlines)
  c.fillStyle = 'rgba(0, 0, 0, 0.18)'; for (let yy = y + 4; yy < y + 114; yy += 3) c.fillRect(x - 116, yy, 232, 1);
  c.restore();
  box(c, x - 120, y + 114, 240, 16, '#18181B');
  words(c, 'STEVE-O-VISION', x, y + 127, print(1, '#FACC15'));
};

// ---------------------------------------------------------------------------------------------------------------
// The floor's marks, the ramps, the hoops, the rings of fire

export const drawSkids = (c: Ctx, skids: Skid[]) => {
  c.fillStyle = 'rgba(12, 10, 9, 0.55)';
  for (const s of skids) c.fillRect(Math.round(s.x - 3), Math.round(GY + s.z * ZK - 1), 6, 3);
};

/** A ramp: a wedge on a wheeled dolly in the back lane (dimmed: it's not his to stand on), STUNT on its side. */
export const drawRamp = (c: Ctx, r: Ramp, f: number) => {
  const y = GY + LANE_BACK * ZK, foot = r.x - r.dir * RAMP.LEN;
  c.save(); c.globalAlpha = 0.92;
  c.fillStyle = INK; c.beginPath(); c.moveTo(foot - r.dir * 4, y + 2); c.lineTo(r.x + r.dir * 4, y + 2); c.lineTo(r.x + r.dir * 4, y - RAMP.H - 4); c.closePath(); c.fill();
  c.fillStyle = '#57534E'; c.beginPath(); c.moveTo(foot, y); c.lineTo(r.x, y); c.lineTo(r.x, y - RAMP.H); c.closePath(); c.fill();
  // (its running surface, its stripes)
  c.strokeStyle = '#78716C'; c.lineWidth = 3; c.beginPath(); c.moveTo(foot, y); c.lineTo(r.x, y - RAMP.H); c.stroke();
  for (let k = 1; k < 5; k++) { const kx = foot + (r.x - foot) * (k / 5); box(c, kx - 2, y - RAMP.H * (k / 5) - 2, 4, 4, '#FACC15'); }
  // (the dolly's wheels, turning as it creeps)
  for (const wx of [foot + r.dir * 20, r.x - r.dir * 14]) { box(c, wx - 6, y - 2, 12, 8, INK); box(c, wx - 4, y, 8, 5, f % 8 < 4 ? '#27272A' : '#3F3F46'); }
  c.restore();
};
/** A ramp's hoop (on its trolley on the truss, over the top of the jump): half of it (`front`: the near half). */
export const drawHoop = (c: Ctx, r: Ramp, front: boolean, hot: boolean, f: number) => {
  const h = hoopOf(r), x = h.x, y = h.y + h.z * ZK, rx = 16, ry = 62;
  if (!front) {
    // (the trolley, the cables down to it)
    box(c, x - 18, TRUSS_Y + 14, 36, 10, '#3F3F46');
    c.strokeStyle = '#A1A1AA'; c.lineWidth = 1; c.beginPath(); c.moveTo(x - 10, TRUSS_Y + 24); c.lineTo(x, y - ry); c.moveTo(x + 10, TRUSS_Y + 24); c.lineTo(x, y - ry); c.stroke();
  }
  const a0 = front ? -Math.PI / 2 : Math.PI / 2, a1 = front ? Math.PI / 2 : Math.PI * 1.5;
  c.lineWidth = 7; c.strokeStyle = INK; c.beginPath(); c.ellipse(x, y, rx, ry, 0, a0, a1); c.stroke();
  c.lineWidth = 5; c.strokeStyle = front ? '#F472B6' : '#BE185D'; c.beginPath(); c.ellipse(x, y, rx, ry, 0, a0, a1); c.stroke();
  // (hot: on fire, the flames licking off it)
  if (hot) for (let i = 0; i < 8; i++) {
    const a = a0 + ((a1 - a0) * (i + 0.5)) / 8, fx = x + Math.cos(a) * rx, fy = y + Math.sin(a) * ry, fh = 8 + 6 * Math.sin(f * 0.5 + i * 2);
    box(c, fx - 3, fy - fh, 6, fh, i % 2 ? '#F97316' : '#FDE047');
  }
};

/** The ring of fire over his end of the stage: hung off the truss, flames round it (`front`: the near half). */
export const RING_UP = 330, RING_R = 48;
export const ringAt = (side: 1 | -1) => ({ x: STEVE_AT(side) + side * 10, y: GY - RING_UP });
export const drawRing = (c: Ctx, side: 1 | -1, front: boolean, lit: boolean, f: number, tilt = 0) => {
  const { x, y } = ringAt(side), rx = RING_R, ry = RING_R * 0.85;
  if (!front) { c.strokeStyle = '#A1A1AA'; c.lineWidth = 1; c.beginPath(); c.moveTo(x - rx, y); c.lineTo(x, TRUSS_Y + 20); c.lineTo(x + rx, y); c.stroke(); }
  c.save(); c.translate(x, y); c.rotate(tilt);
  const a0 = front ? 0 : Math.PI, a1 = front ? Math.PI : Math.PI * 2;
  c.lineWidth = 9; c.strokeStyle = INK; c.beginPath(); c.ellipse(0, 0, rx, ry, 0, a0, a1); c.stroke();
  c.lineWidth = 6; c.strokeStyle = '#71717A'; c.beginPath(); c.ellipse(0, 0, rx, ry, 0, a0, a1); c.stroke();
  if (lit) for (let i = 0; i < 9; i++) {
    const a = a0 + ((a1 - a0) * (i + 0.5)) / 9, fx = Math.cos(a) * rx, fy = Math.sin(a) * ry, fh = 10 + 7 * Math.sin(f * 0.45 + i * 1.7);
    box(c, fx - 4, fy - fh, 8, fh, ['#DC2626', '#F97316', '#FDE047'][i % 3]);
  }
  c.restore();
};

/** The pyro jets along the front of the stage (set into the floor), and their columns of fire when they go off. */
export const PYRO_X = Array.from({ length: Math.floor(ARENA_W / 130) }, (_, i) => ARENA_L + 65 + i * 130);
export const drawPyro = (c: Ctx, state: GameState, fire: Map<number, number>) => {
  for (const px of PYRO_X) {
    if (!inView(state, px - 30, px + 30)) continue;
    const y = GY + 30 * ZK;
    box(c, px - 10, y - 2, 20, 5, INK); box(c, px - 8, y - 1, 16, 3, '#57534E');
    const t = fire.get(px) ?? 0;
    if (t <= 0) continue;
    const k = Math.min(1, t / 10), h = 180 * k + Math.sin(state.frame * 0.7 + px) * 12;
    for (let i = 0; i < 6; i++) {
      const w = 34 - i * 5, hh = h * (1 - i * 0.12);
      box(c, px - w / 2 + Math.sin(state.frame * 0.5 + i) * 3, y - hh, w, hh, ['#7F1D1D', '#DC2626', '#F97316', '#FB923C', '#FDE047', '#FFFBEB'][i]);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// In front of him: the barrier, the crowd behind it

export const drawCrowd = (c: Ctx, state: GameState, hype: number) => {
  const a = Math.max(x0 - 100, state.camera.x - 40), b = state.camera.x + CANVAS_WIDTH + 40;
  // (the concrete barrier, its hazard chevrons, a STUNTMAN STEVE banner on it now and then)
  box(c, a, BARRIER_Y, b - a, 40, INK); box(c, a, BARRIER_Y + 2, b - a, 36, '#A8A29E'); box(c, a, BARRIER_Y + 2, b - a, 4, '#D6D3D1');
  for (let x = Math.floor(a / 40) * 40; x < b; x += 40) box(c, x, BARRIER_Y + 14, 20, 10, '#FACC15');
  for (let x = Math.floor(a / 640) * 640 + 200; x < b; x += 640) { box(c, x - 80, BARRIER_Y + 6, 160, 26, INK); box(c, x - 78, BARRIER_Y + 8, 156, 22, '#FACC15'); words(c, 'STUNTMAN STEVE', x, BARRIER_Y + 25, print({ sx: 1, sy: 2 }, '#18181B')); }
  // (the crowd: heads and shoulders over it, a small one; bouncing, arms up, phones up when it's good)
  const f = state.frame;
  for (let x = Math.floor(a / 46) * 46; x < b; x += 46) {
    const n = Math.round(x / 46);
    if (h01(n) < 0.35) continue;
    const bob = hype > 0.3 ? Math.round(Math.abs(Math.sin(f * 0.25 + n)) * 6 * hype) : 0;
    const px = x + h01(n * 7) * 20, py = BARRIER_Y + 34 - bob;
    const shirt = ['#DC2626', '#2563EB', '#FACC15', '#16A34A', '#F8FAFC', '#9333EA', '#F97316'][n % 7];
    const skin = ['#E0A27A', '#8D5524', '#F1C27D', '#C68642', '#5C3A21'][Math.floor(h01(n * 3) * 5)];
    const hair = ['#1C1917', '#78350F', '#FDE68A', '#A8A29E', '#B91C1C'][Math.floor(h01(n * 5) * 5)];
    box(c, px - 15, py, 30, 40, INK); box(c, px - 14, py + 1, 28, 40, shirt);
    box(c, px - 9, py - 20, 18, 20, INK); box(c, px - 8, py - 19, 16, 19, skin);
    box(c, px - 9, py - 22, 18, 7, hair); if (n % 3 === 0) box(c, px - 10, py - 18, 4, 16, hair);
    if (hype > 0.55) { box(c, px - 18, py - 30, 5, 30, skin); box(c, px + 13, py - 30, 5, 30, skin); }
    else if (n % 4 === 1) { box(c, px + 8, py - 26, 10, 16, INK); box(c, px + 9, py - 25, 8, 13, f % 40 < 3 ? '#FFFFFF' : '#93C5FD'); box(c, px + 10, py - 10, 5, 12, skin); }
  }
};
