// THE RED MIST HALLWAY: section 4 of Spooky Land, the end of the castle. (Silent Hill 3's hallway: the user's own
// exception to the no-reference rule.) Out of the dungeon's EMERGENCY EXIT into a long hallway, and the PA starts the
// final ordeal... and then he's off his script: something red is coming out from under the door behind him, and it's
// not one of theirs. It chases him the whole way, and if it reaches him it kills him outright (his organs turned
// inside out, and him into a puddle of liquid shit: mist/death.ts). Gotta go fast. Long and windy, and vertical:
//   the long hall at the bottom (doors slamming open and shut on their own across it; furniture piled to hop), then
//   switchbacks up: a shaft of ledges up to the next hall, back the other way along it, up again, back again, and up
//   into the top hall to the fire door at the end of it, which slams on the mist behind him (and stays shut on it).
//   Then the last stretch to the ELEVATOR TO HELL's loading bay (the tower section).
// The mist keeps right on his heels (it's quicker, the further back it is: it's always there), so a decent run gets
// out with little to spare; a slow door, a missed jump, and it has him. Meathead has things to say as he runs
// (never stopping, never over himself): the walls breathing, the blood running up them, the doors slamming, and why
// is there actual supernatural shit in a theme park. Nobody explains it. A guy in a ghost sheet (Gary) doesn't make it.
// Checkpoint at its start only, and at the top (past the fire door).
//
// Back through it later: no mist, the doors hanging open, the stains on everything, Gary's puddle and his sheet.
// Indoors (no time of day): dark, lit red by it.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Block } from '../../../m1/types';
import type { SpookySection } from '../section';
import { layOwn, solid, ledge, runExits, wallSign, doorway, ledgeBox, box, meatheadSays, speak, saidOver, getSpooky, spookyState, type Exit, type Said } from '../section';
import { SECTIONS, DOORS, GY } from '../geometry';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { registerHurtLines } from '../../kinds';
import { lookOf } from '../../adventure/temple/people';
import { paStory, paBusy, byPants, pick, drawHorn, drawPaWords, paSaying, once } from '../castle/pa';
import { LIQUEFIED } from './death';
import * as L from './lines';

registerHurtLines('spooky_mist', L.HURT_MIST, L.DEATH_MIST);

const { x0, x1 } = SECTIONS.mist;
const X = (dx: number) => x0 + dx;
/** The halls' floors, bottom to top (each the one under it plus a climb), and how tall a hall is inside. */
const LV = [GY, GY - 600, GY - 1200, GY - 1800, GY - 2400];
const HALL = 380;
/** The shafts' columns: on the right (up from the bottom hall and the middle one) and on the left. */
const RCOL = [X(3800), X(4300)] as const, LCOL = [X(2100), X(2600)] as const;
/** The way out at the top: the fire door the mist stops at; the last stretch to the loading bay's door. */
const FIRE_DOOR = X(4400), BAY_DOOR = X(5100), TOP_END = X(5300);
/** Where the inside of the hallway is (everything else is solid wall): [x0, top, x1, bottom]. */
const OPEN: [number, number, number, number][] = [
  [X(0), LV[0] - HALL, RCOL[1], LV[0]],
  [RCOL[0], LV[1] - HALL, RCOL[1], LV[0]],
  [LCOL[0], LV[1] - HALL, RCOL[1], LV[1]],
  [LCOL[0], LV[2] - HALL, LCOL[1], LV[1]],
  [LCOL[0], LV[2] - HALL, RCOL[1], LV[2]],
  [RCOL[0], LV[3] - HALL, RCOL[1], LV[2]],
  [LCOL[0], LV[3] - HALL, RCOL[1], LV[3]],
  [LCOL[0], LV[4] - HALL, LCOL[1], LV[3]],
  [LCOL[0], LV[4] - HALL, TOP_END, LV[4]],
];
const BOUNDS = { l: X(-200), r: X(5500), t: LV[4] - HALL - 300, b: GY + 400 };

/** The shafts' ledges (switchbacks: alternating sides, overlapping in the middle), up from each hall. */
const shaftLedges = (col: readonly [number, number], floor: number, topOnLeft: boolean): [number, number, number][] => {
  const out: [number, number, number][] = [], w = 300;
  for (let i = 1; i <= 5; i++) {
    const left = (i % 2 === 1) === topOnLeft;
    out.push([left ? col[0] : col[1] - w, floor - i * 100, w]);
  }
  return out;
};
const LEDGES: [number, number, number][] = [
  ...shaftLedges(RCOL, LV[0], true), ...shaftLedges(LCOL, LV[1], false), ...shaftLedges(RCOL, LV[2], true), ...shaftLedges(LCOL, LV[3], false),
];
/** Furniture piled across the halls (hop it): x, floor, w, h. */
const PILES: [number, number, number, number][] = [
  [X(1900), LV[0], 70, 56], [X(2950), LV[0], 90, 44], [X(3300), LV[2], 70, 56], [X(3050), LV[3], 80, 50], [X(3500), LV[4], 70, 50],
];
/** The doors across the halls that slam on their own (open a while, then shut a while): x, floor, phase. */
const SLAMS: [number, number, number][] = [
  [X(1300), LV[0], 0], [X(2500), LV[0], 50], [X(3400), LV[0], 100], [X(3000), LV[1], 30], [X(3700), LV[2], 80], [X(2700), LV[3], 10], [X(3000), LV[4], 60],
];
const SLAM_CYCLE = 150, SLAM_SHUT = 42, SLAM_TELL = 18;
const slamShutAt = (t: number, ph: number) => (t + ph) % SLAM_CYCLE >= SLAM_CYCLE - SLAM_SHUT;
const slamTell = (t: number, ph: number) => { const k = (t + ph) % SLAM_CYCLE; return k >= SLAM_CYCLE - SLAM_SHUT - SLAM_TELL && k < SLAM_CYCLE - SLAM_SHUT; };

// ---------------------------------------------------------------------------------------------------------------
// The way it goes (the mist follows it, and so does he): a line through the middle of it all, at his feet

const ROUTE: [number, number][] = [
  [X(60), LV[0]], [X(4050), LV[0]], [X(4050), LV[1]], [X(2350), LV[1]], [X(2350), LV[2]], [X(4050), LV[2]], [X(4050), LV[3]], [X(2350), LV[3]], [X(2350), LV[4]], [FIRE_DOOR, LV[4]],
];
const SEG = ROUTE.slice(1).map((b, i) => {
  const a = ROUTE[i], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return { a, b, len, flat: a[1] === b[1] };
});
const CUM: number[] = [0]; for (const s of SEG) CUM.push(CUM[CUM.length - 1] + s.len);
const ROUTE_LEN = CUM[CUM.length - 1];
/** How far along the way he is (null: nowhere on it). */
const progressOf = (x: number, feet: number): number | null => {
  let best: number | null = null, bd = Infinity;
  SEG.forEach((s, i) => {
    const [ax, ay] = s.a, [bx, by] = s.b;
    let k: number, d: number;
    if (s.flat) {
      if (feet > ay + 6 || feet < ay - HALL - 20 || x < Math.min(ax, bx) - 260 || x > Math.max(ax, bx) + 260) return;
      k = Math.max(0, Math.min(1, (x - ax) / (bx - ax))); d = Math.abs(x - (ax + (bx - ax) * k)) + Math.abs(feet - ay) * 0.3;
    } else {
      if (Math.abs(x - ax) > 260 || feet > ay + 6 || feet < by - 10) return;
      k = Math.max(0, Math.min(1, (feet - ay) / (by - ay))); d = Math.abs(feet - (ay + (by - ay) * k));
    }
    if (d < bd) { bd = d; best = CUM[i] + k * s.len; }
  });
  return best;
};
/** Where along the way `s` is, and which bit of it. */
const pointAt = (s: number) => {
  let i = 0;
  while (i < SEG.length - 1 && s >= CUM[i + 1]) i++;
  const g = SEG[i], k = Math.max(0, Math.min(1, (s - CUM[i]) / g.len));
  return { i, x: g.a[0] + (g.b[0] - g.a[0]) * k, y: g.a[1] + (g.b[1] - g.a[1]) * k };
};

/** The mist: how fast it comes along a hall and up a shaft (px a frame), quicker the further behind him it is. */
const MIST_FLAT = 3.7, MIST_UP = 2.3;
/** It's on him this far behind his back. */
const REACH = 18;

// ---------------------------------------------------------------------------------------------------------------
// Its state

interface Mist {
  init: boolean;
  /** 'wait' (not yet), 'on' (coming), 'done' (shut out behind the fire door, or long gone). */
  mist: 'wait' | 'on' | 'done';
  s: number; t: number; startedAt: number;
  /** Where he's got to along the way (the furthest). */
  ps: number;
  slams: Block[]; fire: Block | null; fireShut: number;
  told: boolean; quietAt: number; talking: boolean;
  gary: { x: number; state: 'idle' | 'run' | 'gone'; said: Said | null; t: number };
}
const mistOf = (state: GameState) => spookyState<Mist>(state, 'mist', () => ({
  init: false, mist: 'wait', s: 0, t: 0, startedAt: 0, ps: 0, slams: [], fire: null, fireShut: 0, told: false, quietAt: 0, talking: false,
  gary: { x: X(1650), state: 'idle', said: null, t: 0 },
}));
/** Heard the PA's start of it already, and how far through his remarks he's got (kept across his deaths: no hearing
 *  the same ones every try). */
let toldMist = false, mhNext = 0;
const done = (state: GameState) => state.checkpoint >= 31;

// ---------------------------------------------------------------------------------------------------------------

const say = (m: Mist, state: GameState, line: string) => {
  m.talking = true;
  meatheadSays(state, line, true, once(() => { m.talking = false; m.quietAt = state.frame; }));
};

const run = (ctx: FrameContext, m: Mist) => {
  const { state } = ctx, p = state.player, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  const ps = progressOf(cx, feet);
  if (ps !== null) m.ps = ps;
  // The PA starts the final ordeal (and goes off script)
  if (!m.told && cx > X(240) && m.mist === 'wait') {
    m.told = true;
    if (!toldMist) { toldMist = true; paStory(state, byPants(state, L.PA_MIST), pick(L.MH_MIST_START)); }
    m.startedAt = state.frame;
  }
  // It comes out from under the door behind him
  if (m.mist === 'wait' && m.told && (cx > X(720) || state.frame - m.startedAt > 420)) {
    m.mist = 'on'; m.s = 0; m.t = 0;
    playSound('rumble', 1, -10); playSound('gush', 0.6, -12); shakeScreen(state, 6, 3);
    if (!paBusy(state)) say(m, state, pick(L.MH_MIST_START));
  }
  // The doors slam on their own (never on him: one he's in the way of waits)
  const t = state.frame;
  SLAMS.forEach(([x, fl, ph], i) => {
    const b = m.slams[i];
    if (!b) return;
    const inWay = Math.abs(cx - x) < 26 + p.width / 2 && feet <= fl + 2 && feet > fl - HALL;
    const shut = m.mist !== 'done' && !done(state) && slamShutAt(t, ph);
    if (shut && b.y < -9000 && !inWay) { b.y = fl - HALL; if (Math.abs(cx - x) < 900 && Math.abs(feet - fl) < 500) { playSound('slam', 0.9, -2); shakeScreen(state, 4, 2); } }
    else if (!shut && b.y > -9000) b.y = -99999;
  });
  if (m.mist !== 'on') return;
  m.t++;
  // On it comes, quicker the further back it is (it's always right there)
  const gap = m.ps - m.s, seg = SEG[pointAt(m.s).i];
  const base = seg.flat ? MIST_FLAT : MIST_UP;
  const mult = gap > 300 ? Math.min(2.6, 1 + (gap - 300) / 300) : gap < 140 ? 0.92 : 1;
  m.s += base * mult;
  if (m.t % 30 === 0) playSound('rumble', 0.25, -14);
  // It has him
  if (p.health > 0 && m.s >= m.ps - REACH && !p.inCutscene) hurtPlayer(ctx, 9999, 'spooky_mist');
  // Gary, in his ghost sheet: frozen at the sight of it, screaming; it has him (behind Meathead)
  const g = m.gary;
  if (g.state === 'idle' && m.s > 200) { g.state = 'run'; if (!paBusy(state) && !m.talking) { m.talking = true; speak('m2.spooky.gary', pick(L.GARY_SCREAM), s => { g.said = s; }, true, once(() => { m.talking = false; m.quietAt = state.frame; })); } }
  if (g.state !== 'gone' && m.s >= (progressOf(g.x, LV[0]) ?? 0) - 10) {
    g.state = 'gone'; g.said = null; playSound('gush', 0.9, -2); playSound('squish', 0.8, -4);
    for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: g.x, y: LV[0] - 30 }, vel: { x: (Math.random() - 0.5) * 6, y: -2 - Math.random() * 4 }, life: 40, color: ['#6B4219', '#B91C1C', '#F9A8D4'][i % 3], size: 3 + Math.random() * 3, grav: 0.35 });
    if (Math.abs(cx - g.x) < 700 && !m.talking && !paBusy(state)) say(m, state, pick(L.MH_GARY));
  }
  // His say, as he runs: one at a time, never over himself or the PA
  if (!m.talking && !paBusy(state) && state.frame - m.quietAt > 260 && mhNext < L.MH_MIST.length && p.health > 0) say(m, state, L.MH_MIST[mhNext++]);
  // Through the fire door at the top: it slams on the mist behind him, and stays shut on it
  if (m.ps >= ROUTE_LEN - 20 && cx > FIRE_DOOR + 30 && feet <= LV[4] + 2) {
    m.mist = 'done'; m.fireShut = 1;
    if (m.fire) m.fire.y = LV[4] - HALL;
    playSound('slam', 1, -10); playSound('boom', 0.5, -10); shakeScreen(state, 12, 6);
    paStory(state, [pick(byPants(state, L.PA_MIST_SAFE))], pick(L.MH_MIST_SAFE));
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (crude)

const seenX = (state: GameState, a: number, b: number) => b > state.camera.x - 100 && a < state.camera.x + CANVAS_WIDTH + 100;
const seenR = (state: GameState, a: number, t: number, b: number, bot: number) => seenX(state, a, b) && bot > state.camera.y - 100 && t < state.camera.y + CANVAS_HEIGHT + 100;
const HORNS: [number, number][] = [[X(420), LV[0] - 300]];
const INK_M = '#0A0202';

const drawHall = (c: CanvasRenderingContext2D, state: GameState, m: Mist) => {
  const f = state.frame, after = done(state);
  // The rock it's all cut out of
  box(c, BOUNDS.l, BOUNDS.t, BOUNDS.r - BOUNDS.l, BOUNDS.b - BOUNDS.t, '#1A0808');
  for (const [a, t, b, bot] of OPEN) {
    if (!seenR(state, a, t, b, bot)) continue;
    box(c, a, t, b - a, bot - t, '#3A1414');
    // (the wallpaper's stripes: breathing, in and out)
    const br = Math.sin(f * 0.04 + a * 0.001) * 3;
    for (let x = a + 30; x < b - 10; x += 60) if (seenX(state, x, x + 20)) box(c, x - br, t + 20, 12 + br * 2, bot - t - 110, '#4A1C1C');
    box(c, a, bot - 90, b - a, 90, '#2A0C0C'); box(c, a, bot - 96, b - a, 6, '#5A2222');
    // (down the long halls: doors to nowhere, crooked pictures, lamps; every so often)
    if (b - a > 600) for (let x = a + 140, k = 0; x < b - 100; x += 230, k++) {
      if (!seenX(state, x - 40, x + 80)) continue;
      const kind = (k + Math.round(a / 7)) % 3;
      if (kind === 0) { box(c, x - 4, bot - 170, 58, 170, '#1A0606'); box(c, x, bot - 166, 50, 166, '#3A1A10'); box(c, x + 6, bot - 158, 38, 64, '#2A120A'); box(c, x + 40, bot - 90, 5, 6, '#A16207'); }
      else if (kind === 1) { c.save(); c.translate(x + 30, bot - 230); c.rotate(((k * 7) % 5 - 2) * 0.05); box(c, -32, -40, 64, 80, '#5A4210'); box(c, -26, -34, 52, 68, '#1E1416'); box(c, -8, -20, 16, 18, '#7A5A50'); box(c, -4, -14, 3, 3, '#B91C1C'); box(c, 2, -14, 3, 3, '#B91C1C'); c.restore(); }
      else { box(c, x + 24, bot - 250, 10, 30, '#57534E'); box(c, x + 18, bot - 266, 22, 18, (f + k * 11) % 47 < 3 ? '#3A2A20' : '#FCA5A5'); }
    }
  }
  // Blood running up the walls (up, not down), near him
  const p = state.player, px = p.pos.x;
  for (let k = 0; k < 14; k++) {
    const x = Math.floor((px - 500) / 90) * 90 + k * 90 + 30, rise = (f * 0.7 + k * 37) % 300;
    const fl = LV.find(l => p.pos.y + p.height <= l + 4 && p.pos.y + p.height > l - HALL - 50) ?? LV[0];
    if (!OPEN.some(([a, t, b, bot]) => x > a && x < b && fl - 100 < bot && fl - 100 > t)) continue;
    box(c, x, fl - 90 - rise, 4, Math.min(rise, 120), after ? '#4A1010' : '#8B0000');
    if (!after) box(c, x - 1, fl - 90 - rise, 6, 6, '#B91C1C');
  }
  // The slamming doors (or, after, hanging off their hinges, open)
  SLAMS.forEach(([x, fl, ph], i) => {
    if (!seenR(state, x - 60, fl - HALL, x + 60, fl)) return;
    const shut = (m.slams[i]?.y ?? -99999) > -9000;
    box(c, x - 16, fl - HALL, 32, 12, '#2A1A10'); box(c, x - 16, fl - HALL, 6, HALL, '#2A1A10'); box(c, x + 10, fl - HALL, 6, HALL, '#2A1A10');
    if (shut) { box(c, x - 12, fl - HALL + 12, 24, HALL - 12, '#5A3420'); box(c, x - 12, fl - HALL + 12, 24, 4, '#7A4A30'); box(c, x + 4, fl - 190, 5, 8, '#C9A227'); }
    else {
      // (swung open against the wall, the near side; rattling, about to go)
      const r = !after && slamTell(f, ph) ? Math.sin(f * 2.5) * 3 : 0;
      box(c, x + 16 + r, fl - HALL + 14, after ? 22 : 10, HALL - 14, after ? '#3A2214' : '#4A2A18');
    }
  });
  // The piles to hop (lit along the top: you can stand on them)
  for (const [x, fl, w, h] of PILES) if (seenX(state, x, x + w)) {
    // (a toppled dresser, a chair on it legs-up: hop it)
    box(c, x - 2, fl - h - 2, w + 4, h + 2, INK_M); box(c, x, fl - h, w, h, '#4A2C1C');
    for (let k = 0; k < 2; k++) { box(c, x + 6, fl - h + 8 + k * (h / 2 - 2), w - 12, h / 2 - 8, '#3A2216'); box(c, x + w / 2 - 4, fl - h + 14 + k * (h / 2 - 2), 8, 3, '#A16207'); }
    box(c, x, fl - h, w, 4, '#C08A5A');
    box(c, x + 10, fl - h - 22, 5, 22, '#5A3420'); box(c, x + w - 18, fl - h - 22, 5, 22, '#5A3420');
  }
  // The floors' lit lips
  for (const [a, , b, bot] of OPEN) if (seenX(state, a, b)) {
    // (no lip over a shaft's hole down)
    const holes = [RCOL, LCOL].filter(col => OPEN.some(o => o[0] === col[0] && o[2] === col[1] && o[1] < bot && o[3] > bot));
    let xa = a;
    for (const col of [...holes].sort((u, v) => u[0] - v[0])) { if (col[0] > xa) box(c, xa, bot, col[0] - xa, 4, '#B45353'); xa = Math.max(xa, col[1]); }
    if (b > xa) box(c, xa, bot, b - xa, 4, '#B45353');
  }
  for (const [x, y, w] of LEDGES) if (seenR(state, x, y - 10, x + w, y + 20)) ledgeBox(c, x, y, w, '#4A1A1A', '#D97777');
  // The way in, the fire door at the top, the loading bay's door
  if (seenX(state, x0, x0 + 200)) doorway(c, x0 + 60, LV[0], 'DUNGEON', '#7F1D1D', '#0A0404');
  if (seenR(state, FIRE_DOOR - 60, LV[4] - HALL, FIRE_DOOR + 60, LV[4])) {
    box(c, FIRE_DOOR - 18, LV[4] - HALL, 36, 14, '#3F3F46');
    if (m.fire && m.fire.y > -9000) { box(c, FIRE_DOOR - 14, LV[4] - HALL + 14, 28, HALL - 14, '#71717A'); box(c, FIRE_DOOR - 14, LV[4] - 200, 28, 8, '#A1A1AA'); }
    else box(c, FIRE_DOOR + 16, LV[4] - HALL + 14, 12, HALL - 14, '#52525B');
    wallSign(c, FIRE_DOOR + 110, LV[4] - 260, 'FIRE DOOR', '#7F1D1D', '#FECACA');
  }
  if (seenR(state, BAY_DOOR - 120, LV[4] - 300, BAY_DOOR + 120, LV[4])) doorway(c, BAY_DOOR, LV[4], 'LOADING BAY', '#57534E', '#0A0A0A');
  if (seenX(state, x0 + 400, x0 + 800)) wallSign(c, X(600), LV[0] - 250, 'EMPLOYEES ONLY', '#7F1D1D', '#FECACA');
  if (seenR(state, X(4700), LV[4] - 300, X(5000), LV[4])) wallSign(c, X(4880), LV[4] - 200, 'ELEVATOR TO HELL  >', '#2E1065', '#FDE68A');
  const talking = !!paSaying(state);
  for (const [hx, hy] of HORNS) if (seenX(state, hx - 30, hx + 30)) drawHorn(c, hx, hy, talking, f);
  // Gary (in his ghost sheet), or what's left of him
  const g = m.gary;
  if (seenX(state, g.x - 60, g.x + 60)) {
    if (g.state === 'gone' || after) {
      c.fillStyle = '#6B4219'; c.beginPath(); c.ellipse(g.x, LV[0] - 2, 34, 5, 0, 0, Math.PI * 2); c.fill();
      box(c, g.x - 24, LV[0] - 6, 40, 5, '#E5E7EB'); box(c, g.x - 10, LV[0] - 8, 6, 3, '#111111'); box(c, g.x + 2, LV[0] - 8, 6, 3, '#111111');
    } else {
      const L0 = lookOf(Math.round(g.x) + 7), sh = g.state === 'run' ? Math.sin(f * 1.3) * 2 : 0;
      box(c, g.x - 4 + sh, LV[0] - 8, 4, 8, '#1C1917'); box(c, g.x + 4 + sh, LV[0] - 8, 4, 8, '#1C1917');
      c.fillStyle = '#E5E7EB'; c.beginPath(); c.moveTo(g.x - 20 + sh, LV[0] - 6); c.quadraticCurveTo(g.x - 22 + sh, LV[0] - 72, g.x + sh, LV[0] - 74); c.quadraticCurveTo(g.x + 22 + sh, LV[0] - 72, g.x + 20 + sh, LV[0] - 6); c.closePath(); c.fill();
      box(c, g.x - 8 + sh, LV[0] - 58, 5, 7, '#111111'); box(c, g.x + 3 + sh, LV[0] - 58, 5, 7, '#111111');
      box(c, g.x - 2 + sh, LV[0] - 44, 5, 7, '#111111');
      box(c, g.x + 14 + sh, LV[0] - 40, 6, 6, L0.skin); // (a hand out of it)
      if (g.said) saidOver(c, g.said.text, g.x, LV[0] - 90);
    }
  }
};

/** The mist (over everything: it's coming through): every bit of the hallway behind its front, filled; the front itself
 *  a billowing wall of it; tendrils reaching. */
const drawMist = (c: CanvasRenderingContext2D, state: GameState, m: Mist) => {
  if (m.mist !== 'on') return;
  const f = state.frame;
  // (it's got him: drawn held back off him a way, so what it's doing to him shows)
  const ms = state.meatheadDeath?.kind === LIQUEFIED ? m.s - 110 : m.s;
  const fill = (a: number, t: number, w: number, h: number) => {
    if (w <= 0 || h <= 0 || !seenR(state, a, t, a + w, t + h)) return;
    c.fillStyle = 'rgba(120, 6, 18, 0.82)'; c.fillRect(a, t, w, h);
    c.fillStyle = 'rgba(190, 20, 30, 0.28)';
    for (let k = 0; k < 6; k++) { const yy = t + ((k * 67 + f * 0.6) % h); c.fillRect(a, yy, w, 10 + (k % 3) * 6); }
  };
  SEG.forEach((s, i) => {
    const s0 = CUM[i], s1 = CUM[i + 1];
    if (ms <= s0) return;
    const k = Math.min(1, (ms - s0) / s.len);
    if (s.flat) {
      const hall = OPEN.find(o => o[3] === s.a[1] && o[2] - o[0] > 600)!;
      const dir = Math.sign(s.b[0] - s.a[0]);
      const from = dir > 0 ? hall[0] : hall[2], to = s.a[0] + (s.b[0] - s.a[0]) * k;
      if (ms >= s1) fill(hall[0], hall[1], hall[2] - hall[0], hall[3] - hall[1]);
      else fill(Math.min(from, to), hall[1], Math.abs(to - from), hall[3] - hall[1]);
    } else {
      const col = s.a[0] > X(3000) ? RCOL : LCOL;
      const top = s.a[1] + (s.b[1] - s.a[1]) * k;
      fill(col[0], top, col[1] - col[0], s.a[1] - top);
    }
  });
  // The front: billows rolling, tendrils out ahead of it
  const pt = pointAt(ms), seg = SEG[pt.i];
  for (let k = 0; k < 9; k++) {
    const ph = f * 0.08 + k * 1.7, r = 26 + Math.sin(ph) * 10 + (k % 3) * 8;
    let bx: number, by: number;
    if (seg.flat) { const dir = Math.sign(seg.b[0] - seg.a[0]); bx = pt.x + dir * (Math.sin(ph * 1.3) * 12); by = pt.y - 20 - k * 40; }
    else { const col = pt.x > X(3000) ? RCOL : LCOL; bx = col[0] + 30 + k * 55; by = pt.y + Math.sin(ph * 1.3) * 12; }
    c.fillStyle = k % 2 ? 'rgba(170, 14, 26, 0.75)' : 'rgba(110, 4, 14, 0.85)';
    c.beginPath(); c.arc(bx, by, r, 0, Math.PI * 2); c.fill();
  }
  // (and tendrils reaching on ahead along the floor)
  c.fillStyle = 'rgba(160, 10, 24, 0.6)';
  for (let k = 0; k < 4; k++) {
    const reach = 30 + ((f * 2 + k * 23) % 60);
    if (seg.flat) { const dir = Math.sign(seg.b[0] - seg.a[0]); c.fillRect(dir > 0 ? pt.x : pt.x - reach, pt.y - 8 - k * 9, reach, 5); }
    else { const col = pt.x > X(3000) ? RCOL : LCOL; c.fillRect(col[0] + 40 + k * 110, pt.y - reach, 5, reach); }
  }
};

// ---------------------------------------------------------------------------------------------------------------

/** The ways out: back down into the dungeon (from the bottom hall's start), on into the loading bay (at the top). */
const EXITS = (): Exit[] => [
  { x0: x0, x1: x0 + 40, yTop: LV[0] - 40, yBot: LV[0] + 2, to: DOORS.dungeon.end },
  { x0: BAY_DOOR - 20, x1: BAY_DOOR + 30, yTop: LV[4] - 40, yBot: LV[4] + 2, to: DOORS.tower.start },
];

export const mist: SpookySection = {
  id: 'mist', x0, x1,
  checkpoints: [
    { name: 'THE RED MIST HALLWAY', cp: 30, x: x0 + 200, y: GY },
    // (only reachable at the top: the top hall's the only one out this far)
    { name: 'THE TOP OF THE HALLWAY', cp: 31, x: X(4560), y: LV[4] },
  ],
  build: (state) => {
    if (state.checkpoint < 10) { toldMist = false; mhNext = 0; }
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: RCOL[1], y2: GY, surface: 'hard' }]);
    // The walls: everything that isn't the hallway, solid (swept in bands)
    const ys = [...new Set([BOUNDS.t, BOUNDS.b, ...OPEN.flatMap(o => [o[1], o[3]])])].sort((a, b) => a - b);
    for (let i = 0; i + 1 < ys.length; i++) {
      const ya = ys[i], yb = ys[i + 1];
      const spans = OPEN.filter(o => o[1] <= ya && o[3] >= yb).map(o => [o[0], o[2]] as [number, number]).sort((a, b) => a[0] - b[0]);
      let xa = BOUNDS.l;
      for (const [a, b] of spans) { if (a > xa) solid(state, xa, ya, a - xa, yb - ya, { hidden: true, tag: 'mist-wall' }); xa = Math.max(xa, b); }
      if (BOUNDS.r > xa) solid(state, xa, ya, BOUNDS.r - xa, yb - ya, { hidden: true, tag: 'mist-wall' });
    }
    for (const [x, y, w] of LEDGES) ledge(state, x, y, w, { hidden: true, tag: 'mist-ledge' });
    for (const [x, fl, w, h] of PILES) solid(state, x, fl - h, w, h, { hidden: true, tag: 'mist-pile' });
    const m = mistOf(state);
    m.slams = SLAMS.map(([x]) => solid(state, x - 12, -99999, 24, HALL, { hidden: true, tag: 'mist-slam' }));
    m.fire = solid(state, FIRE_DOOR - 14, -99999, 28, HALL, { hidden: true, tag: 'mist-fire' });
  },
  update: (ctx, controls) => {
    const { state } = ctx, m = mistOf(state);
    // (the checkpoint's only known once the stage is built: back past the top, it's over)
    if (!m.init) { m.init = true; if (done(state)) { m.mist = 'done'; m.told = true; m.gary.state = 'gone'; } }
    if (runExits(state, EXITS())) return controls;
    // (the fire door: shut on the mist, it opens again for him coming back the other way)
    if (m.fire && m.mist === 'done') { const p = state.player, cx = p.pos.x + p.width / 2; if (m.fire.y > -9000 && cx > FIRE_DOOR + 60 && cx < FIRE_DOOR + 140 && p.facing < 0 && done(state)) { m.fire.y = -99999; playSound('clang', 0.7, -6); } }
    run(ctx, m);
    return controls;
  },
  drawBackdrop: (c) => { box(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#0E0404'); return true; },
  drawBack: (c, state) => drawHall(c, state, mistOf(state)),
  drawFront: (c, state) => {
    const m = mistOf(state);
    drawMist(c, state, m);
    if (getSpooky(state)?.section === 'mist') drawPaWords(c, state, HORNS);
  },
  lighting: (state) => {
    const m = mistOf(state), lights = [];
    if (m.mist === 'on') { const pt = pointAt(m.s); lights.push({ x: pt.x, y: pt.y - 150, r: 520, a: 0.9, color: 'rgba(220, 20, 40, 0.22)' }); }
    const p = state.player;
    lights.push({ x: p.pos.x + p.width / 2, y: p.pos.y + 20, r: 300, a: 0.55 });
    const fl = 0.55 + (Math.sin(state.frame * 0.9) > 0.97 ? 0.15 : 0);
    return { dark: fl, shade: [30, 4, 6] as [number, number, number], lights };
  },
};
