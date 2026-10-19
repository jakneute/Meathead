// The havoc's civilians (the user's: "make sure civilians you otherwise cannot kill during the disaster sequence can die
// to hazards, like billboards falling down, etc"). The guests running for it at the back of the sidewalk, one more by
// the flood's way in, and a few caught out on the hill road by each bunker. He can't hurt them (scenery, to him: still);
// the disasters can, each its own undignified way, the guest's own seeded look all through it:
//
//   CRUSHED   a front (or the REVENGERS billboard) comes down on them: legs out from under its edge, a shoe twitching,
//             the stain seeping out, what they were carrying knocked loose.
//   CONKED    the quake drops a chunk of cornice on one (its shadow first, where they'll be): flat on their back, the
//             chunk on their head, stars.
//   BURNED    a gust shoves one off the sidewalk backward into a lava river: flailing as they go in, on fire, charring,
//             sinking, a hand up last, smoke.
//   FLUNG     a gust throws a sheet of plywood along the back of the street into one: tumbling off down the sidewalk,
//             face down, butt up, a shoe gone (landed over the lava: burned).
//   SWEPT     the flood's surge takes the one by its way in: face down, bobbing, carried along; drained, lying soggy.
//   BURIED    the avalanche goes over the ones on the hill road (they didn't get in), a snow slide over a guest in the
//             chase: a mound with their legs sticking up out of it, kicking, then not.
//   TAKEN     the tornado: round it and up (alive or already dead), thrown out (its debris).
//
// Only what actually gets to them (each hazard's own reach, on them where they are): never off-screen culls, never
// despawns. No kill credit, no kill callouts from him, no drops: a hazard's callout over them (as the enemies' hazard
// kills get), a scream, the hit's own sound (envSound: near the screen, never in a big fight). Per stage build (a death
// puts them back, like everything else the run's hazards do).

import type { FrameContext } from '../../../m1/game/core/context';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { envSound } from '../../bossQuiet';
import { viewOf, seen } from '../blvd/kit';
import { fromDepth } from '../disaster/paint';
import { X, Y, R, GY, groundH, LAVA, LAVA_DOWN, FALLS, WIND, COVERS, CLIMB, SLIDE_LEN, AV_LEN } from './layout';
import { hvOf, type Hv } from './state';
import { GUEST_D } from './paint';
import { spent, type HazEvents } from './hazards';
import { guestAt, GUEST_BASES, FORM_T } from './chase';
import { surgeOf } from './effects';

/** Who: the street's guests (by their slot in GUEST_BASES) at the back of the sidewalk, the hill road's (by bunker). */
export interface Civ { id: string; k: number; hill: boolean; seed: number; woman: boolean; shorts: boolean; d: number }
/** The hill road's: on its far half, between each bunker's sign and its mouth (never over the sign). */
export const HILL_D = 0.966;
const HILL_SPAN = 140;
export const CIVS: Civ[] = [
  ...GUEST_BASES.map((_, k): Civ => ({ id: `s${k}`, k, hill: false, seed: 900 + k * 37, woman: k % 2 === 1, shorts: k % 3 === 0, d: GUEST_D })),
  ...COVERS.map((_, k): Civ => ({ id: `h${k}`, k, hill: true, seed: 1310 + k * 53, woman: k % 2 === 0, shorts: false, d: HILL_D })),
];

export type How = 'crushed' | 'conked' | 'burned' | 'flung' | 'swept' | 'buried' | 'taken';
export interface Fate {
  how: How; t: number; x: number; y: number; dir: 1 | -1;
  /** Flung: its flight (landed: 0 vy, sliding); burned: shoved (phase 0) then in (phase 1), how far under. */
  vx: number; vy: number; rot: number; landed: boolean; phase: number; sink: number;
  /** Crushed: the front's edge they're out from under, which way; swept/burned: the surface. */
  ex: number; side: 1 | -1; surf: number;
}
/** A chunk of cornice coming down on one of them (the quake): its shadow first (warn), then it, `off` px over the ground. */
export interface GDrop { id: string; x: number; warn: number; off: number; vy: number; landed: number }
/** A sheet of plywood the wind's throwing along the back of the street at one of them. */
export interface GSheet { id: string; x: number; y: number; rot: number }
interface CivState { fate: Map<string, Fate>; drops: GDrop[]; sheets: GSheet[] }

const ALL = new WeakMap<Hv, CivState>();
export const civOf = (hv: Hv): CivState => {
  let s = ALL.get(hv);
  if (!s) { s = { fate: new Map(), drops: [], sheets: [] }; ALL.set(hv, s); }
  return s;
};

const pingPong = (ph: number, span: number) => { const p = ((ph % (span * 2)) + span * 2) % (span * 2); return p < span ? p : span * 2 - p; };
/** A hill road guest: dithering back and forth by its bunker's mouth (never in it). */
const hillAt = (k: number, f: number) => {
  const base = COVERS[k].a - 240, ph = f * (1.5 + (k % 2) * 0.5) + k * 97, p = pingPong(ph, HILL_SPAN);
  const prev = pingPong(ph - 1, HILL_SPAN);
  const rx = base + p;
  return { x: X(rx), y: Y(groundH(rx) ?? 0), dir: (p >= prev ? 1 : -1) as 1 | -1 };
};
/** Where one is (alive: running about; its fate's place once it has one). */
export const civAt = (cv: Civ, f: number) => {
  if (cv.hill) return hillAt(cv.k, f);
  const g = guestAt(cv.k, f);
  return { x: g.x, y: GY, dir: g.dir };
};
/** Is it about at all: the street's always (till it's spent); the hill road's till its bunker's avalanche has been. */
export const civHere = (hv: Hv, cs: CivState, cv: Civ) => {
  if (cs.fate.has(cv.id)) return cs.fate.get(cv.id)!.how !== 'taken';
  if (!cv.hill) return true;
  const av = hv.avalanches[cv.k];
  return !!av && av.phase !== 'done';
};

const fresh = (how: How, x: number, y: number, dir: 1 | -1): Fate => ({ how, t: 0, x, y, dir, vx: 0, vy: 0, rot: 0, landed: false, phase: 0, sink: 0, ex: x, side: 1, surf: y });

/** The hazard's callout over them (on the screen only), a scream, the hit's sound. */
const callout = (ctx: FrameContext, cv: Civ, x: number, y: number, call: string, color: string, sound: Parameters<typeof envSound>[2]) => {
  const { state } = ctx;
  if (seen(viewOf(state), x - 30, x + 30, cv.d, 0)) {
    const [px, py] = fromDepth(state, x, y - 86, cv.d);
    ctx.fx.spawnDamageNumber({ x: px - 24, y: py }, call, true, color);
  }
  envSound(state, x, 'screams', 0.45, 2 + (cv.seed % 5));
  envSound(state, x, sound, 0.75, -3);
};
const doom = (ctx: FrameContext, cs: CivState, cv: Civ, fate: Fate, call: string | null, color: string, sound: Parameters<typeof envSound>[2]) => {
  cs.fate.set(cv.id, fate);
  if (call) callout(ctx, cv, fate.x, fate.y, call, color, sound);
};

/** The lava river at world x (null: none). */
const lavaAt = (x: number) => LAVA.find(l => R(x) > l.a && R(x) < l.b) ?? null;

export const updateCivilians = (ctx: FrameContext, ev: HazEvents) => {
  const { state } = ctx, hv = hvOf(state), cs = civOf(hv), f = state.frame;
  if (spent(state)) return;
  const v = viewOf(state);
  const onScreen = (cv: Civ, x: number) => seen(v, x - 30, x + 30, cv.d, 0);
  const alive = (cv: Civ) => !cs.fate.has(cv.id) && civHere(hv, cs, cv);
  const street = CIVS.filter(cv => !cv.hill);
  const fd = hv.flood;
  const surge = fd.on ? surgeOf(state, hv) : null;
  /** The flood's height over GY at x (null: no water there). */
  const waterH = (x: number) => {
    if (!fd.on || x < X(CLIMB.a) - 900 || x > X(CLIMB.b)) return null;
    if (surge?.on) return x <= surge.front ? surge.hAt(x, f) : null;
    return fd.h;
  };

  // ---- What's already happened to them, going on
  for (const [id, fa] of cs.fate) {
    fa.t++;
    if (fa.how === 'flung' && !fa.landed) {
      fa.x += fa.vx; fa.y += fa.vy; fa.vy += 0.45; fa.rot += 0.28 * Math.sign(fa.vx || -1);
      if (fa.vy > 0 && fa.y >= GY) {
        const l = lavaAt(fa.x);
        if (l) { Object.assign(fa, { how: 'burned', phase: 1, sink: 10, surf: Y(Math.min(l.hl, l.hr)) + LAVA_DOWN, y: Y(Math.min(l.hl, l.hr)) + LAVA_DOWN, t: 0 }); envSound(state, fa.x, 'ignite', 0.8, -2); continue; }
        fa.y = GY; fa.landed = true; fa.vy = 0; fa.vx *= 0.45;
        envSound(state, fa.x, 'thud', 0.7, -4);
      }
    } else if (fa.how === 'flung') { fa.x += fa.vx; fa.vx *= 0.88; }
    else if (fa.how === 'burned') {
      if (fa.phase === 0) {
        // (shoved back along the sidewalk, flailing, and in)
        fa.x += fa.vx;
        const l = lavaAt(fa.x - 10);
        if (l) {
          fa.phase = 1; fa.t = 0; fa.surf = Y(Math.min(l.hl, l.hr)) + LAVA_DOWN; fa.y = fa.surf;
          const cv = CIVS.find(c => c.id === id)!;
          callout(ctx, cv, fa.x, GY, 'MELTED!', '#FDBA74', 'ignite');
        }
      } else fa.sink = Math.min(96, fa.sink + 0.55);
    } else if (fa.how === 'swept') {
      const h = waterH(fa.x);
      if (h !== null) { fa.surf = Y(h); fa.y = fa.surf; if (fa.x < X(CLIMB.b) - 80) fa.x += surge?.on ? 2.2 : 0.3; }
      else if (fa.y < GY) fa.y = Math.min(GY, fa.y + 3);
    }
  }

  // ---- A front (or the billboard) down on the street: whoever's under it
  if (ev.fell && ev.fell.how !== 'bridge') {
    const [frx, w] = FALLS[ev.fell.i], a = X(frx) - 10, b = X(frx + w) + 10;
    for (const cv of street) {
      if (!alive(cv)) continue;
      const p = civAt(cv, f);
      if (p.x < a || p.x > b) continue;
      const fa = fresh('crushed', p.x, GY, p.dir);
      const left = p.x - a < b - p.x;
      fa.ex = left ? X(frx) : X(frx + w); fa.side = left ? -1 : 1;
      doom(ctx, cs, cv, fa, 'FLATTENED!', '#FCA5A5', 'splat');
    }
  }

  // ---- The quake: a chunk of cornice for one or two of them, where they'll be when it lands
  if (ev.quake) {
    let n = 0;
    for (const cv of street) {
      if (n >= 2 || !alive(cv) || cs.drops.some(d => d.id === cv.id)) continue;
      const p = civAt(cv, f);
      if (!onScreen(cv, p.x) || Math.random() > 0.55) continue;
      const T = 90, to = civAt(cv, f + T);
      cs.drops.push({ id: cv.id, x: to.x, warn: 70, off: 360, vy: 0, landed: 0 });
      n++;
    }
  }
  cs.drops = cs.drops.filter(d => {
    if (d.landed > 0) return ++d.landed < 26;
    if (d.warn > 0) { d.warn--; return true; }
    d.vy = Math.min(18, d.vy + 0.9); d.off -= d.vy;
    if (d.off > 0) return true;
    d.off = 0; d.landed = 1;
    envSound(state, d.x, 'crash', 0.55, 3);
    for (let k = 0; k < 8; k++) { const [px, py] = fromDepth(state, d.x, GY - 4, GUEST_D); state.particles.push({ pos: { x: px, y: py }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 3 }, life: 26, color: '#A8A29E', size: 2 + Math.random() * 3, grav: 0.3 }); }
    const cv = CIVS.find(c => c.id === d.id)!;
    if (alive(cv)) {
      const p = civAt(cv, f);
      if (Math.abs(p.x - d.x) < 22) doom(ctx, cs, cv, fresh('conked', d.x, GY, p.dir), 'CONKED!', '#FCA5A5', 'crunch');
    }
    return true;
  });

  // ---- The wind: a gust shoves one near a lava river's bank in, and throws plywood at another
  const rx = R(state.player.pos.x + state.player.width / 2);
  const windy = WIND.some(([a, b]) => rx >= a && rx <= b);
  if (windy && f % 320 === 210) {
    let sheet = false;
    for (const cv of street) {
      if (!alive(cv)) continue;
      const p = civAt(cv, f);
      if (!onScreen(cv, p.x)) continue;
      const l = LAVA.find(q => q.hl === 0 && p.x - X(q.b) >= 0 && p.x - X(q.b) < 190);
      if (l) { const fa = fresh('burned', p.x, GY, 1); fa.vx = -2.8; cs.fate.set(cv.id, fa); envSound(state, p.x, 'screams', 0.45, 4); continue; }
      if (!sheet && Math.random() < 0.6) {
        sheet = true;
        // (from just off the right of the screen, at their depth)
        const sx = v.cam.x + CANVAS_WIDTH + 50, wx = v.eye.x + (sx - v.eye.x) / cv.d;
        cs.sheets.push({ id: cv.id, x: wx, y: GY - 40 - Math.random() * 14, rot: 0 });
      }
    }
  }
  cs.sheets = cs.sheets.filter(s => {
    s.x -= 13; s.rot += 0.16;
    const cv = CIVS.find(c => c.id === s.id)!;
    if (alive(cv)) {
      const p = civAt(cv, f);
      if (s.x <= p.x + 12 && s.x >= p.x - 30) {
        const fa = fresh('flung', p.x, GY - 6, -1); fa.vx = -7; fa.vy = -7;
        doom(ctx, cs, cv, fa, 'BLOWN AWAY!', '#FCA5A5', 'clang');
      }
    }
    return seen(v, s.x - 40, s.x + 40, GUEST_D, 80);
  });

  // ---- The flood: its surge (and then its water) over the one by its way in
  if (fd.on && !fd.drain) for (const cv of street) {
    if (!alive(cv)) continue;
    const p = civAt(cv, f), h = waterH(p.x);
    if (h !== null && h > 34) { const fa = fresh('swept', p.x, Y(h), p.dir); fa.surf = Y(h); doom(ctx, cs, cv, fa, 'FLOODED!', '#7DD3FC', 'splash'); }
  }

  // ---- The snow slides (the chase's): over whoever's on the street where one rolls
  for (const s of hv.slides) {
    if (s.warn > 0) continue;
    for (const cv of street) {
      if (!alive(cv)) continue;
      const p = civAt(cv, f);
      if (p.x > s.x - SLIDE_LEN && p.x < s.x) doom(ctx, cs, cv, fresh('buried', p.x, GY, p.dir), 'SNOWED!', '#F8FAFC', 'thud');
    }
  }

  // ---- The avalanches (the hill's): over whoever's out on the road as it goes by
  for (const av of hv.avalanches) {
    if (av.phase !== 'run') continue;
    for (const cv of CIVS) {
      if (!cv.hill || !alive(cv)) continue;
      const p = civAt(cv, f);
      if (p.x > av.front - AV_LEN && p.x < av.front) doom(ctx, cs, cv, fresh('buried', p.x, p.y, p.dir), 'BURIED!', '#F8FAFC', 'thud');
    }
  }

  // ---- The tornado: whoever it comes to (alive, or what's left of them), round it and up
  const t = hv.tornado;
  if (t.on && t.formT >= FORM_T) for (const cv of street) {
    const fa = cs.fate.get(cv.id);
    if (fa?.how === 'taken' || (fa?.how === 'burned' && fa.phase === 1)) continue;
    const p = fa ? { x: fa.x, y: fa.y } : civAt(cv, f);
    if (Math.abs(p.x - t.x) > 120) continue;
    const [px, py] = fromDepth(state, p.x, GY - 40, cv.d);
    hv.debris.push({ x: px, y: py, vx: 0, vy: 0, rot: 0, w: 18, h: 40, col: '#F6DCC8', orbit: 70, ang: 0, r: 60, t: 0, guest: true, gk: cv.k });
    doom(ctx, cs, cv, fresh('taken', p.x, GY, 1), fa ? null : 'SUCKED UP!', '#FCA5A5', 'whirl');
    if (!fa) envSound(state, p.x, 'screams', 0.5, 2);
  }
};
