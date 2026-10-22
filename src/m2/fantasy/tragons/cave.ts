// Inside the fake mountain (the user's: "dark like the tunnels in the frontier level"): the bore the three tracks run
// through, drawn once behind everything on the ride (never over a dragon or the track: no fights in the sort), and the
// dark, the land's lighting system's (as the Wilderness train's tunnels: eased in at the mouth, murky, never black),
// the dragons' head lamps and the bore's caged work lamps cut out of it.
//
// The bore: the rock over the top track and under the bottom one, the cavity between banded darker in steps in from
// each mouth (opaque steps, one over the next: no alpha seams), plaster ribs and work lamps going by (fixed to the
// track, so they go by at the ride's own speed).

import type { GameState } from '../../../m1/game/core/state';
import type { Light, SceneLight } from '../../../m1/game/render/lighting';
import { INK, box, dimmed, polyF, type Ctx } from '../kit';
import { TUNNEL, TL, LANE_COL, rearX } from './layout';
import { trackPt, proj, type Pt } from './track';
import { tragonsOf, type Tragons } from './state';
import { viewBox } from './scene';

/** In from each mouth: the bore's steps darker over this much track. */
const FADE = 480;
/** The cavity's colors, the mouth's shadow in to the deep. */
const BORE = ['#3A2E3E', '#30263A', '#271F30', '#1F1828', '#181220', '#120E1A'];
const ROCK = ['#2A2030', '#4E3E50', '#665464', '#7E6C7A'];
/** The ribs and the work lamps: every this much track. */
const RIB = 360, LAMP = 720;
const STEP = 32;

const P0: Pt = { x: 0, y: 0, d: 1, roll: 0 }, P2: Pt = { x: 0, y: 0, d: 1, roll: 0 };
/** At s: the top track's roof and the bottom one's on screen (world as drawn), and the depth. */
const edge = (t: Tragons, s: number) => {
  trackPt(t.spins, t.dist, 0, s, P0); trackPt(t.spins, t.dist, 2, s, P2);
  const a = proj(t.eye, P0.x, P0.y, P0.d), b = proj(t.eye, P2.x, P2.y, P2.d);
  return { x: a.x, top: a.y, bot: b.y, d: P0.d };
};
const inward = (s: number) => Math.max(0, Math.min(1, (s - TUNNEL.a) / FADE, (TUNNEL.b - s) / FADE));
/** The track positions of the bore that are on screen (none: null). */
const onScreen = (state: GameState, t: Tragons): [number, number] | null => {
  if (t.phase === 'done') return null;
  const v = viewBox(state), ex = t.eye.x, sOf = (wx: number) => wx - rearX(t.dist) + t.dist;
  const a = Math.max(TUNNEL.a, sOf(ex + (v.x - ex) / 0.75) - 200), b = Math.min(TUNNEL.b, sOf(ex + (v.x + v.w - ex) / 0.75) + 200);
  return b > a ? [a, b] : null;
};
/** The sample positions a..b: its ends and every STEP between. */
const samples = (a: number, b: number) => {
  const out = [a];
  for (let s = Math.ceil(a / STEP) * STEP; s < b; s += STEP) if (s > a) out.push(s);
  out.push(b);
  return out;
};
/** The rock over the bore: low at the mouths, up toward the middle, ragged (fixed to the track). */
const ridge = (s: number) => 150 + 230 * Math.min(1, inward(s) * 1.6) + ((Math.floor(s / STEP) * 37) % 23) - 11;

/** World (behind everything on the ride: art.ts drawTragonsBack, after the far mountain). */
export const drawCaveInside = (c: Ctx, state: GameState) => {
  const t = tragonsOf(state), r = onScreen(state, t);
  if (!r) return;
  const [a, b] = r;
  const Rk = ROCK.map(col => dimmed(col)), Bo = BORE.map(col => dimmed(col));
  // (the rock round it: from the ridge down to under the bottom track)
  const ss = samples(a, b), E = ss.map(s => edge(t, s));
  const top: [number, number][] = E.map((e, i) => [e.x, e.top - ridge(ss[i]) * e.d]);
  const low: [number, number][] = E.map(e => [e.x, e.bot + 120 * e.d]);
  polyF(c, [...top.map(([x, y]) => [x, y - 2] as [number, number]), ...[...low].reverse()], INK);
  polyF(c, [...top, ...[...low].reverse()], Rk[2]);
  for (let i = 0; i < top.length - 1; i++) box(c, top[i][0], Math.min(top[i][1], top[i + 1][1]), top[i + 1][0] - top[i][0] + 1, 3 * E[i].d, Rk[3]);
  // (the bore: the mouth's shadow, and darker in steps going in, each step one shape over the last)
  for (let j = 0; j < Bo.length; j++) {
    const ja = Math.max(a, TUNNEL.a + (j * FADE) / Bo.length), jb = Math.min(b, TUNNEL.b - (j * FADE) / Bo.length);
    if (jb <= ja) continue;
    const js = samples(ja, jb), JE = js.map(s => edge(t, s));
    polyF(c, [...JE.map(e => [e.x, e.top - 120 * e.d] as [number, number]), ...[...JE].reverse().map(e => [e.x, e.bot + 62 * e.d] as [number, number])], Bo[j]);
  }
  // (its roof's edge: a rocky lip, lit; its floor's edge)
  for (let i = 0; i < E.length - 1; i++) {
    const e = E[i], w = E[i + 1].x - e.x + 1;
    box(c, e.x, e.top - 122 * e.d, w, 3 * e.d, Rk[0]);
    box(c, e.x, e.bot + 62 * e.d, w, 3 * e.d, Rk[1]);
  }
  // (the plaster ribs, and the caged work lamps on them: it's fake)
  for (let s = Math.ceil((a + 80) / RIB) * RIB; s < b - 80; s += RIB) {
    const e = edge(t, s), k = Math.min(Bo.length - 1, Math.floor(inward(s) * Bo.length) + 1);
    box(c, e.x - 5 * e.d, e.top - 120 * e.d, 10 * e.d, e.bot - e.top + 182 * e.d, Bo[Math.min(Bo.length - 1, k)]);
    box(c, e.x - 5 * e.d, e.top - 120 * e.d, 2 * e.d, e.bot - e.top + 182 * e.d, Bo[Math.max(0, k - 2)]);
  }
  for (const L of lampSpots(t, a, b)) {
    const d = L.d;
    box(c, L.x - 5 * d, L.y - 6 * d, 10 * d, 12 * d, INK);
    box(c, L.x - 3 * d, L.y - 4 * d, 6 * d, 8 * d, '#FFE6A0');
    box(c, L.x - 3 * d, L.y - 4 * d, 6 * d, 2 * d, '#FFFFFF');
    box(c, L.x - 4 * d, L.y - 1 * d, 8 * d, 1 * d, INK);
  }
};

/** The work lamps a..b: under the bore's roof. */
const lampSpots = (t: Tragons, a: number, b: number) => {
  const out: { x: number; y: number; d: number }[] = [];
  for (let s = Math.ceil((TUNNEL.a + 200) / LAMP) * LAMP; s < TUNNEL.b - 200; s += LAMP) {
    if (s < a || s > b) continue;
    const e = edge(t, s);
    out.push({ x: e.x, y: e.top - 104 * e.d, d: e.d });
  }
  return out;
};

const LAMP_TINT = LANE_COL.map(([, light]) => {
  const n = parseInt(light.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, 0.16)`;
});

/** (index.ts lighting) The mountain's dark over the time of day's: eased in as the trains go in, murky, never black; the
 *  dragons' head lamps, a glow off each, the work lamps cut out of it. */
export const caveLight = (state: GameState, base: SceneLight | null | undefined): SceneLight | null => {
  const t = tragonsOf(state);
  if (t.phase !== 'ride' && t.phase !== 'dispatch') return base ?? null;
  const mid = t.dist + TL / 2;
  const u = Math.max(0, Math.min(1, (mid - TUNNEL.a + 150) / 450, (TUNNEL.b + 150 - mid) / 450));
  const k = u * u * (3 - 2 * u);
  if (k <= 0.01) return base ?? null;
  const lights: Light[] = [...(base?.lights ?? [])];
  for (const tr of t.trains) {
    if ((tr.phase !== 'ok' && tr.phase !== 'arrive') || tr.cars.length < 3) continue;
    const h = tr.cars[2], m = tr.cars[1];
    lights.push({ x: h.x + 70 * h.d, y: h.y - 40 * h.d, r: 170 * h.d, a: 0.8, color: LAMP_TINT[tr.lane] });
    lights.push({ x: m.x, y: m.y - 30 * m.d, r: 120 * m.d, a: 0.5 });
  }
  const r = onScreen(state, t);
  if (r) for (const L of lampSpots(t, r[0], r[1])) lights.push({ x: L.x, y: L.y, r: 110 * L.d, a: 0.6, color: 'rgba(255, 220, 140, 0.14)' });
  return { dark: Math.max(base?.dark ?? 0, 0.8 * k), shade: [10, 6, 16], rim: 0.3, grade: base?.grade, lights };
};
