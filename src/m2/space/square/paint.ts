// Futureland, painted (the first pass: flat colors and simple shapes, but every silhouette reads): the bits the square
// and the main drag share. The future as 1962 saw it: pastel stucco, chrome, boomerang roofs, starbursts, fins,
// pink and teal everywhere. The sky by the hour (timeOfDay.ts); the giant atom and Space Needle 2 off in the back.
//
// Still art (a shopfront, a sign, a lamp) is painted once into a stamp and put down after that (still()).

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { stamp } from '../../../m1/game/render/stamp';
import { drawTodSky, farTint, hourMix, timeOfDay } from '../../timeOfDay';
import { box, label } from '../section';

type Ctx = CanvasRenderingContext2D;
export const INK = '#1A0B06';
const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;

/** Still art at world (x, y): painted once (local coordinates, the box `bx, by, bw, bh` about (x, y)), then stamped. */
export const still = (c: Ctx, key: string, x: number, y: number, bx: number, by: number, bw: number, bh: number, paint: (g: Ctx) => void) => {
  c.save(); c.translate(Math.round(x), Math.round(y));
  stamp(c, key, bx, by, bw, bh, paint);
  c.restore();
};
export const inView = (state: GameState, a: number, b: number, pad = 120) => b > state.camera.x - pad && a < state.camera.x + W + pad;

// ---------------------------------------------------------------------------------------------------------------
// The sky and the far off (screen space)

/** Where the horizon sits on screen (it drifts down a little as the camera climbs). */
export const horizonY = (state: GameState) => 430 - Math.min(0, state.camera.y) * 0.12;

export const drawSky = (c: Ctx, state: GameState) => {
  const hz = horizonY(state);
  drawTodSky(c, 0, 0, W, H, ['#1D4ED8', '#38BDF8', '#99F6E4', '#FEF3C7'], { horizon: hz, sun: [640, 110], moon: [150, 80], scroll: state.camera.x * 0.02 });
};

/** A far skyline of the future: domes, saucers on stalks, a fin, a tower with a ball on top. Parallax `k`. */
export const drawSkyline = (c: Ctx, state: GameState, k: number, col: string, seed = 0) => {
  const hz = horizonY(state), off = -((state.camera.x * k) % 260);
  const tint = farTint(col, 1);
  c.fillStyle = tint;
  for (let x = off - 260, i = Math.floor(state.camera.x * k / 260) + seed; x < W + 260; x += 260, i++) {
    const kind = ((i * 7919) % 5 + 5) % 5;
    if (kind === 0) { c.beginPath(); c.arc(x + 70, hz, 60, Math.PI, 0); c.fill(); box(c, x + 10, hz - 4, 120, 8, tint); }
    else if (kind === 1) { box(c, x + 60, hz - 110, 8, 110, tint); c.beginPath(); c.ellipse(x + 64, hz - 112, 40, 10, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.arc(x + 64, hz - 118, 14, Math.PI, 0); c.fill(); }
    else if (kind === 2) { c.beginPath(); c.moveTo(x + 30, hz); c.lineTo(x + 60, hz - 150); c.lineTo(x + 90, hz); c.fill(); box(c, x + 100, hz - 50, 90, 50, tint); }
    else if (kind === 3) { box(c, x + 40, hz - 70, 130, 70, tint); c.beginPath(); c.moveTo(x + 20, hz - 70); c.lineTo(x + 105, hz - 92); c.lineTo(x + 190, hz - 70); c.fill(); }
    else { box(c, x + 80, hz - 130, 10, 130, tint); c.beginPath(); c.arc(x + 85, hz - 136, 12, 0, Math.PI * 2); c.fill(); box(c, x + 150, hz - 40, 70, 40, tint); }
  }
  box(c, 0, hz, W, H - hz, tint);
};

/**
 * The giant atom (screen space), its nucleus at (x, y), `s` its scale: a ball of pale stucco on a stalk, three orbit
 * rings round it (chrome tubes, lights running along them), turning slow; lit by the hour.
 */
export const drawGiantAtom = (c: Ctx, x: number, y: number, s: number, t: number, hole = false) => {
  const tod = timeOfDay();
  const night = tod.lamps;
  const stalk = farTint('#94A3B8', 0.5), ball = farTint('#E9D5FF', 0.4), shade = farTint('#A78BFA', 0.4), deep = farTint('#7C3AED', 0.4);
  // (the stalk, down to the ground, and its fins)
  box(c, x - 18 * s, y, 36 * s, 900, stalk);
  c.fillStyle = farTint('#64748B', 0.5);
  c.beginPath(); c.moveTo(x - 18 * s, y + 150 * s); c.lineTo(x - 70 * s, y + 320 * s); c.lineTo(x - 18 * s, y + 300 * s); c.fill();
  c.beginPath(); c.moveTo(x + 18 * s, y + 150 * s); c.lineTo(x + 70 * s, y + 320 * s); c.lineTo(x + 18 * s, y + 300 * s); c.fill();
  const R = 74 * s;
  // (the rings behind the ball: their far halves)
  const ring = (k: number, front: boolean) => {
    const a = (k * Math.PI) / 3 + t * 0.0025;
    c.save(); c.translate(x, y); c.rotate(a);
    c.lineWidth = 9 * s; c.strokeStyle = front ? farTint('#E2E8F0', 0.3) : farTint('#94A3B8', 0.4);
    c.beginPath(); c.ellipse(0, 0, 210 * s, 58 * s, 0, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2); c.stroke();
    // (the lights along it: chasing; brighter after dark)
    for (let i = 0; i < 12; i++) {
      const u = (i / 12) * Math.PI + (front ? 0 : Math.PI) + ((t * 0.02) % (Math.PI / 6));
      const on = (i + Math.floor(t / 6)) % 4 === 0;
      c.fillStyle = on ? (night > 0.3 ? '#F0ABFC' : '#FDF4FF') : (night > 0.3 ? '#A78BFA' : '#CBD5E1');
      c.fillRect(Math.cos(u) * 210 * s - 2 * s, Math.sin(u) * 58 * s - 2 * s, 4 * s, 4 * s);
    }
    c.restore();
  };
  for (let k = 0; k < 3; k++) ring(k, false);
  // (the ball: stepped bands of shade, lit from the upper left)
  c.fillStyle = INK; c.beginPath(); c.arc(x, y, R + 2, 0, Math.PI * 2); c.fill();
  c.fillStyle = deep; c.beginPath(); c.arc(x, y, R, 0, Math.PI * 2); c.fill();
  c.fillStyle = shade; c.beginPath(); c.arc(x - R * 0.12, y - R * 0.12, R * 0.86, 0, Math.PI * 2); c.fill();
  c.fillStyle = ball; c.beginPath(); c.arc(x - R * 0.24, y - R * 0.24, R * 0.66, 0, Math.PI * 2); c.fill();
  c.fillStyle = farTint('#FAF5FF', 0.3); c.beginPath(); c.arc(x - R * 0.4, y - R * 0.4, R * 0.22, 0, Math.PI * 2); c.fill();
  // (its seams: the panels)
  c.strokeStyle = farTint('#6D28D9', 0.4); c.lineWidth = Math.max(1, 1.5 * s);
  for (let k = -2; k <= 2; k++) { c.beginPath(); c.ellipse(x, y, R * Math.abs(Math.cos(k * 0.6)), R, 0, 0, Math.PI * 2); c.stroke(); }
  if (hole) {
    // (the hole he came out through: torn, dark, a little smoke)
    const hx = x + R * 0.45, hy = y + R * 0.15;
    c.fillStyle = INK; c.beginPath();
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2, r = R * (0.16 + (i % 2) * 0.07); c.lineTo(hx + Math.cos(a) * r, hy + Math.sin(a) * r); }
    c.closePath(); c.fill();
    for (let i = 0; i < 5; i++) { const u = ((t * 0.6 + i * 40) % 200) / 200; c.fillStyle = `rgba(82, 82, 91, ${0.5 * (1 - u)})`; c.beginPath(); c.arc(hx + u * 30 * s + Math.sin(t * 0.05 + i) * 6, hy - u * 140 * s, (10 + u * 26) * s, 0, Math.PI * 2); c.fill(); }
  }
  for (let k = 0; k < 3; k++) ring(k, true);
  // (its name on a band round the middle)
  if (s > 0.6) label(c, 'THE GIANT ATOM', x, y + R * 0.08 + 4, night > 0.3 ? '#F0ABFC' : '#FFFFFF', s > 1.2 ? 10 : 8);
};

/**
 * Space Needle 2 (screen space), its base at (x, groundY), `s` its scale: three legs bundled with a waist, the first
 * halo of a saucer deck, then up and up, thinner, past another deck, and on up out of sight (it goes to space).
 */
export const drawNeedle = (c: Ctx, x: number, gy: number, s: number, t: number) => {
  const tod = timeOfDay(), night = tod.lamps;
  const leg = farTint('#F8FAFC', 0.6), legS = farTint('#CBD5E1', 0.6), deck = farTint('#FB7185', 0.6), deckS = farTint('#BE123C', 0.6);
  // (the legs: from wide at the ground in to the waist, out again to the first deck)
  const waist = gy - 220 * s, deck1 = gy - 380 * s;
  for (const [a, b, col] of [[-1, -0.35, legS], [1, 0.35, leg], [-0.3, 0.05, leg]] as const) {
    c.fillStyle = INK; c.beginPath(); c.moveTo(x + a * 90 * s - 6 * s, gy); c.lineTo(x + b * 22 * s - 5 * s, waist); c.lineTo(x + a * 46 * s - 5 * s, deck1); c.lineTo(x + a * 46 * s + 5 * s, deck1); c.lineTo(x + b * 22 * s + 5 * s, waist); c.lineTo(x + a * 90 * s + 6 * s, gy); c.fill();
    c.fillStyle = col; c.beginPath(); c.moveTo(x + a * 90 * s - 4 * s, gy); c.lineTo(x + b * 22 * s - 3 * s, waist); c.lineTo(x + a * 46 * s - 3 * s, deck1); c.lineTo(x + a * 46 * s + 3 * s, deck1); c.lineTo(x + b * 22 * s + 3 * s, waist); c.lineTo(x + a * 90 * s + 4 * s, gy); c.fill();
  }
  // (the core: the lift shaft, straight up from the ground, forever)
  box(c, x - 9 * s, -10, 18 * s, gy + 10, INK);
  box(c, x - 7 * s, -10, 14 * s, gy + 10, leg);
  box(c, x - 7 * s, -10, 4 * s, gy + 10, '#FFFFFF');
  // (the lift going up and down it)
  const lift = gy - (((t * 1.4) % 1400) / 1400) * (gy + 200);
  box(c, x - 6 * s, lift, 12 * s, 16 * s, night > 0.3 ? '#FDE68A' : '#F59E0B');
  // (the decks: saucers round the shaft, the windows lit at night)
  const saucer = (y: number, r: number) => {
    c.fillStyle = INK; c.beginPath(); c.ellipse(x, y, r + 2, r * 0.22 + 2, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = deckS; c.beginPath(); c.ellipse(x, y, r, r * 0.22, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = deck; c.beginPath(); c.ellipse(x, y - r * 0.05, r * 0.96, r * 0.15, 0, Math.PI, Math.PI * 2); c.fill();
    for (let i = -5; i <= 5; i++) box(c, x + i * r * 0.16 - 2 * s, y - 1 * s, 4 * s, 3 * s, night > 0.3 ? '#FEF08A' : '#1E293B');
  };
  saucer(deck1, 110 * s);
  saucer(deck1 - 520 * s, 70 * s);
  saucer(deck1 - 980 * s, 44 * s);
  // (the sign on the first deck)
  if (s > 0.5) label(c, 'SPACE NEEDLE 2', x, deck1 + 28 * s, '#FFFFFF', s > 1 ? 10 : 8);
};

// ---------------------------------------------------------------------------------------------------------------
// The street (world space)

/** The street: pale concrete slabs, a pink-and-teal stripe along the front, the lit curb (standable reads standable). */
export const drawStreet = (c: Ctx, state: GameState, x0: number, x1: number, y: number) => {
  const a = Math.max(x0, state.camera.x - 40), b = Math.min(x1, state.camera.x + W + 40);
  if (b <= a) return;
  box(c, a, y, b - a, 600, '#94A3B8');
  box(c, a, y, b - a, 4, '#F1F5F9');
  box(c, a, y + 4, b - a, 3, '#CBD5E1');
  for (let x = Math.floor(a / 64) * 64; x < b; x += 64) box(c, x, y + 4, 2, 26, '#7C8BA0');
  box(c, a, y + 30, b - a, 8, '#F472B6');
  box(c, a, y + 38, b - a, 6, '#2DD4BF');
  box(c, a, y + 44, b - a, 600, '#64748B');
};
/** The edge of a hole in the street: the cut, the fence, the drop. `side` -1 the hole's to the left of x. */
export const drawPitEdge = (c: Ctx, x: number, y: number, side: -1 | 1) => {
  box(c, side > 0 ? x - 6 : x, y, 6, 600, '#475569');
  box(c, side > 0 ? x - 6 : x, y, 6, 4, '#F1F5F9');
};

/** A googie lamp (a pole, a boomerang arm, a starburst lamp at the end): its feet at (x, y). Lit after dark. */
export const drawLamp = (c: Ctx, x: number, y: number) => {
  const lit = timeOfDay().lamps > 0.3;
  still(c, `spc-lamp-${lit ? 1 : 0}`, x, y, -40, -190, 80, 192, g => {
    box(g, -3, -170, 6, 170, INK); box(g, -2, -170, 4, 170, '#CBD5E1'); box(g, -2, -170, 1, 170, '#FFFFFF');
    box(g, -10, -4, 20, 4, '#64748B');
    g.fillStyle = INK; g.beginPath(); g.moveTo(-2, -168); g.lineTo(26, -180); g.lineTo(28, -174); g.lineTo(0, -162); g.fill();
    g.strokeStyle = lit ? '#FEF08A' : '#FDE047'; g.lineWidth = 2;
    for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4; g.beginPath(); g.moveTo(27, -178); g.lineTo(27 + Math.cos(a) * 11, -178 + Math.sin(a) * 11); g.stroke(); }
    g.fillStyle = lit ? '#FFFBEB' : '#FEF3C7'; g.beginPath(); g.arc(27, -178, 5, 0, Math.PI * 2); g.fill();
  });
};
/** A horn speaker on a pole (the PA): its feet at (x, y), the horn at the top (`h` up). */
export const drawSpeaker = (c: Ctx, x: number, y: number, h: number, talking: boolean, f: number) => {
  still(c, `spc-spk-${h}`, x, y, -20, -h - 20, 50, h + 22, g => {
    box(g, -2, -h, 4, h, '#64748B');
    box(g, -8, -4, 16, 4, '#475569');
    g.fillStyle = INK; g.beginPath(); g.moveTo(-2, -h - 2); g.lineTo(22, -h - 14); g.lineTo(22, -h + 10); g.closePath(); g.fill();
    g.fillStyle = '#E2E8F0'; g.beginPath(); g.moveTo(0, -h - 2); g.lineTo(20, -h - 12); g.lineTo(20, -h + 8); g.closePath(); g.fill();
  });
  if (talking) for (let k = 0; k < 3; k++) { const r = 6 + k * 6 + ((f >> 2) % 3) * 2; c.strokeStyle = `rgba(253, 224, 71, ${0.55 - k * 0.15})`; c.lineWidth = 2; c.beginPath(); c.arc(x + 23, y - h - 2, r, -0.7, 0.7); c.stroke(); }
};

/** A sign board on a wall or over a door (diegetic text: words on things). World space, its middle at (x, y). */
export const board = (g: Ctx, x: number, y: number, text: string, bg: string, ink: string, size = 8, pad = 8) => {
  g.font = `${size}px "Press Start 2P"`;
  const w = g.measureText(text).width + pad * 2, h = size + pad * 1.5;
  box(g, x - w / 2 - 2, y - h / 2 - 2, w + 4, h + 4, INK);
  box(g, x - w / 2, y - h / 2, w, h, bg);
  label(g, text, x, y + size / 2, ink, size);
  return w;
};

export interface Shop { x: number; w: number; h: number; wall: string; trim: string; roof: 'boomerang' | 'dome' | 'fin' | 'flat' | 'saucer'; name: string; sub?: string; nameBg?: string; nameInk?: string }
/**
 * A shopfront along the back of the street: stucco, a band of trim, a big window (dark glass, a lit display), a door,
 * the roof (a boomerang, a dome, a fin, a saucer), its name up on a board, the gag under it. Painted once.
 */
export const drawShop = (c: Ctx, state: GameState, sh: Shop, y: number) => {
  if (!inView(state, sh.x - 60, sh.x + sh.w + 60)) return;
  const lit = timeOfDay().lamps > 0.3;
  still(c, `spc-shop-${sh.name}-${sh.x}-${lit ? 1 : 0}`, sh.x, y, -60, -sh.h - 110, sh.w + 120, sh.h + 112, g => {
    const w = sh.w, h = sh.h;
    box(g, -2, -h - 2, w + 4, h + 2, INK);
    box(g, 0, -h, w, h, sh.wall);
    box(g, 0, -h, 6, h, '#FFFFFF33');
    box(g, 0, -h + 22, w, 8, sh.trim);
    // (the window, its display lit at night; the door)
    box(g, 16, -h + 44, w - 90, h - 60, INK);
    box(g, 18, -h + 46, w - 94, h - 64, lit ? '#FDE68A' : '#1E3A5F');
    box(g, 22, -h + 50, 10, h - 72, lit ? '#FEF9C3' : '#3B5B7F');
    box(g, w - 60, -64, 40, 64, INK); box(g, w - 58, -62, 36, 62, sh.trim); box(g, w - 30, -34, 4, 4, '#FDE047');
    // (the roof)
    g.fillStyle = INK;
    if (sh.roof === 'boomerang') {
      g.beginPath(); g.moveTo(-30, -h + 4); g.lineTo(w * 0.35, -h - 40); g.lineTo(w + 30, -h + 4); g.lineTo(w * 0.35, -h - 24); g.closePath(); g.fill();
      g.fillStyle = sh.trim; g.beginPath(); g.moveTo(-26, -h + 1); g.lineTo(w * 0.35, -h - 36); g.lineTo(w + 26, -h + 1); g.lineTo(w * 0.35, -h - 26); g.closePath(); g.fill();
    } else if (sh.roof === 'dome') {
      g.beginPath(); g.arc(w / 2, -h, w / 2 - 8, Math.PI, 0); g.fill();
      g.fillStyle = sh.trim; g.beginPath(); g.arc(w / 2, -h, w / 2 - 11, Math.PI, 0); g.fill();
      g.fillStyle = '#FFFFFF55'; g.beginPath(); g.arc(w / 2 - 20, -h - 20, 12, 0, Math.PI * 2); g.fill();
    } else if (sh.roof === 'fin') {
      g.beginPath(); g.moveTo(w - 50, -h); g.lineTo(w - 20, -h - 100); g.lineTo(w - 6, -h); g.fill();
      g.fillStyle = sh.trim; g.beginPath(); g.moveTo(w - 46, -h); g.lineTo(w - 21, -h - 94); g.lineTo(w - 10, -h); g.fill();
      for (let k = 0; k < 8; k++) { g.strokeStyle = '#FDE047'; g.lineWidth = 2; const a = (k * Math.PI) / 4; g.beginPath(); g.moveTo(w - 20, -h - 104); g.lineTo(w - 20 + Math.cos(a) * 12, -h - 104 + Math.sin(a) * 12); g.stroke(); }
    } else if (sh.roof === 'saucer') {
      box(g, w / 2 - 4, -h - 40, 8, 40, '#94A3B8');
      g.beginPath(); g.ellipse(w / 2, -h - 44, w / 2 - 10, 14, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = sh.trim; g.beginPath(); g.ellipse(w / 2, -h - 45, w / 2 - 13, 11, 0, 0, Math.PI * 2); g.fill();
    } else box(g, -8, -h - 8, w + 16, 10, sh.trim);
    board(g, w / 2, -h + 12, sh.name, sh.nameBg ?? '#0F172A', sh.nameInk ?? '#FDE047', 8);
    if (sh.sub) board(g, (w - 70) / 2 + 12, -h + 40 + 10, sh.sub, '#FFFFFF', '#BE185D', 6, 5);
  });
};

/** Day, sundown or night: the color for the hour. */
export { hourMix };
