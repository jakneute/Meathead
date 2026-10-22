// THE BLIZZARD, then THE TORNADO.
//
// THE BLIZZARD (down the hill, from the ridge to its foot; no tornado yet): at each AVALANCHE ZONE (a sign before it)
// a concrete BUNKER on the hill road's landing. Coming up on one, the hill rumbles (the tell: the shake, the snow
// trickling, the white building up at the left of the screen); he gets in under its roof and the AVALANCHE comes down
// the hill behind him: a wall of snow over the whole screen, far too tall to get over (AV_H: more than three
// uppercuts off a jump), and on over the bunker and down the road. Out in the open as it comes: buried and dragged
// along (a big hit, and another if he's still in it: not dead, about half his health). The bunkers are the hill's only.
//
// THE TORNADO (past the foot of the hill): it comes down out of the clouds behind him and comes after him to the end.
// Touch it and he's dead, skinned by the wind (skinned.ts; it goes on without stopping: tornadoRoams), noted
// (noteTornadoDeath: the fling's fourth-wall line). A little slower than him, never far off (it
// closes in to just off the left of the screen); everything slows him (the puddles, the slides, the gusts, a fight).
// It pulls him (and anybody) in; anybody it gets is sucked up; it blows away everything it comes to (the facades, the
// standees, the PA's poles, the guests at the back: torn loose, round it and up, thrown out) and now and then throws
// what it's picked up ahead of him, its mark on the ground. Low SNOW SLIDES roll along the street after him (jump
// them). THE END: past the first aid station, into the SAFE TORNADO LAUNCHING ZONE, it surges (no outrunning it now; he's
// held in the zone's box) and when it gets him, in there, it's the fling.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { setHazardZones, hazardVictims, hazardKill, hazardHit, boxHits, type Zone } from '../../hazardHit';
import {
  X, Y, R, GY, groundH, COVERS, ROOF, SURGE_AT, ZONE, REFILL, TORNADO_FORM, BUILDINGS, DOWNHILL, DECOR, STEVES, HORNS, FALLS,
  AV_H, AV_LEN, AV_V, AV_REACH, AV_TELL, AV_TELL_IN, SLIDE_H, SLIDE_LEN, SLIDE_V, SLIDE_GAP,
} from './layout';
import { hvOf, noteTornadoDeath, TORN_MEMO, FALL_MEMO, type Hv } from './state';
import { spent } from './hazards';
import { fromDepth } from '../disaster/paint';
import { FRONT_D } from '../blvd/kit';

/** The ground's height under the tornado (over the flooded canyon: the roofs it's over). */
export const tornadoBase = (x: number) => {
  const rx = R(x), g = groundH(rx);
  if (rx >= 8200 && g !== null) return g;
  for (const [bx, w, h] of BUILDINGS) if (rx >= bx && rx < bx + w) return h;
  return g ?? 0;
};
/** Its half-width at a height over its base (narrow at the ground, wide up top). */
export const funnelHalf = (up: number) => Math.min(220, 44 + Math.max(0, up) * 0.24);
export const FUNNEL_H = 760;
/** How long it takes to reach down out of the clouds. */
export const FORM_T = 90;

const pcx = (state: GameState) => state.player.pos.x + state.player.width / 2;
/** The ground's world y at world x (over a lava river: its banks'). */
const groundY = (x: number) => Y(groundH(R(x)) ?? 0);

/** He's in under bunker k (his middle in it, his feet between its floor and its roof). */
export const inCover = (state: GameState, k: number) => {
  const p = state.player, c = COVERS[k], cx = pcx(state), feet = p.pos.y + p.height;
  const floor = groundH((c.a + c.b) / 2) ?? 0;
  return cx > X(c.a) + 6 && cx < X(c.b) - 6 && feet <= Y(floor) + 8 && feet > Y(floor + ROOF) && p.health > 0;
};

/** Bring the tornado down (or put it back where it'd be, starting again at a checkpoint). */
export const startTornado = (state: GameState, x: number, hold: number) => {
  const t = hvOf(state).tornado;
  Object.assign(t, { on: true, x, v: 0, ramp: 0, hold, choked: 999, threwAt: state.frame, surge: false, formT: 0 });
};

/** The bunkers' avalanches: set up (the ones behind where he's starting, done). */
export const buildCovers = (state: GameState, fromRx: number) => {
  hvOf(state).avalanches = COVERS.map((c, k) => ({ k, phase: c.b < fromRx ? 'done' : 'idle', t: 0, front: 0, from: 0, to: 0, hitHim: false }));
};

// ---------------------------------------------------------------------------------------------------------------
// What the tornado blows away (the chase's: past the hill)

interface Tear { key: string; x0: number; x1: number; h: number; kind: 'facade' | 'steve' | 'horn' | 'fall'; col: string; i: number }
export const TEARS: Tear[] = [
  ...DECOR.map(([rx, w, h, wall], i): Tear => ({ key: `decor-${i}`, x0: rx, x1: rx + w, h, kind: 'facade', col: wall, i })),
  ...STEVES.map(([rx], i): Tear => ({ key: `steve-${i}`, x0: rx - 30, x1: rx + 30, h: 150, kind: 'steve', col: '#FACC15', i })),
  ...HORNS.map((rx, i): Tear => ({ key: `horn-${i}`, x0: rx - 10, x1: rx + 10, h: 230, kind: 'horn', col: '#57534E', i })),
  ...FALLS.map(([rx, w, h], i): Tear => ({ key: `fall-${i}`, x0: rx, x1: rx + w, h, kind: 'fall', col: '#A16207', i })),
].filter(t => t.x0 > DOWNHILL.b);
const tearOf = new Map(TEARS.map(t => [`${t.kind}-${t.i}`, t]));
/** Has the tornado blown this away (by its kind and its place in its list)? Spent: everything it got to. */
export const isTorn = (state: GameState, kind: Tear['kind'], i: number) => {
  const t = tearOf.get(`${kind}-${i}`);
  if (!t) return false;
  return state.stageMemo[TORN_MEMO(t.key)] === '1' || (spent(state) && t.x0 < SURGE_AT + 200);
};
const tear = (state: GameState, hv: Hv, t: Tear, quiet: boolean) => {
  state.stageMemo[TORN_MEMO(t.key)] = '1';
  if (t.kind === 'fall') { state.stageMemo[FALL_MEMO(t.i)] = '1'; const fl = hv.falls.find(q => q.i === t.i); if (fl) fl.phase = 'down'; }
  if (quiet) return;
  const n = t.kind === 'facade' || t.kind === 'fall' ? 9 : 4;
  // (off it where it's drawn: the fronts back at their depth, the PA poles and Steve's things nearer)
  const d = t.kind === 'facade' || t.kind === 'fall' ? FRONT_D : t.kind === 'horn' ? 0.965 : 0.955;
  for (let k = 0; k < n && hv.debris.length < 70; k++) {
    const big = t.kind === 'facade' || t.kind === 'fall';
    const [px, py] = fromDepth(state, X(t.x0) + Math.random() * (t.x1 - t.x0), GY - 10 - Math.random() * t.h, d);
    hv.debris.push({
      x: px, y: py, vx: 0, vy: 0, rot: Math.random() * 6,
      w: big ? 20 + Math.random() * 36 : 8 + Math.random() * 14, h: big ? 8 + Math.random() * 18 : 6 + Math.random() * 10,
      col: k % 3 === 0 ? '#A16207' : k % 3 === 1 ? t.col : '#78350F', orbit: 40 + Math.random() * 50, ang: Math.random() * 6.28, r: 60 + Math.random() * 120, t: 0, guest: false,
    });
  }
  playSound('crash', 0.8, -6 + Math.random() * 4); playSound('crack', 0.6, -4);
  shakeScreen(state, 6, 3);
};
/** Everything up to world x blown away already (starting again in the chase: the world as the run left it). */
export const tearUpTo = (state: GameState, x: number) => { const hv = hvOf(state); for (const t of TEARS) if (X(t.x0) < x) tear(state, hv, t, true); };

/** The guests running about at the back of the street: where each is (world x), by its slot. */
// (each one's run of sidewalk clear of the lava rivers' gaps: nobody walks on air; the last, by the flood's way in)
export const GUEST_BASES = [300, 2000, 4200, 5200, 14700, 16800, 18900, 20500, 5620];
export const guestAt = (k: number, f: number) => {
  const span = 650, base = GUEST_BASES[k];
  const ph = (f * (1.6 + (k % 3) * 0.4) + k * 211) % (span * 2);
  return { x: X(base) + (ph < span ? ph : span * 2 - ph), dir: (ph < span ? 1 : -1) as 1 | -1 };
};

export interface ChaseEvents { inCover?: boolean; avalancheTell?: boolean; buried?: boolean; caught?: boolean; surge?: boolean; ripped?: boolean }

export const updateChase = (ctx: FrameContext): ChaseEvents => {
  const { state } = ctx, p = state.player, hv = hvOf(state), t = hv.tornado, ev: ChaseEvents = {}, f = state.frame;
  const zones: Zone[] = [];
  const cx = pcx(state), feet = p.pos.y + p.height, rx = R(cx);
  if (spent(state) || hv.fling.step !== 'off') { t.on = t.on && hv.fling.step !== 'off' && hv.fling.step !== 'done'; setHazardZones(state, 'havoc-chase', []); return ev; }
  const alive = p.health > 0 && state.deathTimer <= 0 && !p.inCutscene;

  // ---- The blizzard: the bunkers and their avalanches (one at a time)
  let busy = hv.avalanches.some(a => a.phase === 'tell' || a.phase === 'run');
  for (const av of hv.avalanches) {
    const c = COVERS[av.k], a = X(c.a), b = X(c.b), floor = groundH((c.a + c.b) / 2) ?? 0;
    const inIt = inCover(state, av.k);
    if (av.phase === 'idle') {
      // (one he's gone past while another was coming: let go)
      if (cx > b + 200) { av.phase = 'done'; continue; }
      if (!busy && alive && !t.on && rx > DOWNHILL.a && cx > a - AV_REACH) {
        av.phase = 'tell'; av.t = inIt ? AV_TELL - AV_TELL_IN : 0; busy = true;
        ev.avalancheTell = true; playSound('rumble', 1, -14); playSound('rumble', 0.6, -20);
      }
    }
    if (av.phase === 'tell') {
      av.t++;
      // (he's in: it comes)
      if (inIt) { ev.inCover = true; if (av.t < AV_TELL - AV_TELL_IN) av.t = AV_TELL - AV_TELL_IN; }
      if (av.t % 8 === 0) shakeScreen(state, 8, 2 + av.t / 30);
      if (av.t % 50 === 0) playSound('rumble', 0.9, -16);
      if (f % 2 === 0) state.particles.push({ pos: { x: state.camera.x + Math.random() * 300, y: state.camera.y - 6 }, vel: { x: 3 + Math.random() * 2, y: 3 + Math.random() * 2 }, life: 80, color: '#F8FAFC', size: 3 + Math.random() * 3 });
      if (av.t >= AV_TELL) {
        av.phase = 'run'; av.t = 0;
        av.front = state.camera.x - 160; av.from = av.front;
        playSound('roar', 1, -18); playSound('rumble', 1, -20); playSound('tsunami', 0.6, -14);
      }
    } else if (av.phase === 'run') {
      av.t++; av.front += AV_V;
      const tail = av.front - AV_LEN;
      if (av.t % 4 === 0) shakeScreen(state, 8, 6);
      if (av.t % 30 === 0) playSound('rumble', 0.8, -18);
      // (him out in the open: buried and dragged along; a big hit, and another if he's still in it)
      const g = groundY(cx);
      if (alive && !p.carried && !inIt && cx > tail && cx < av.front + 10 && feet > g - AV_H) {
        if (p.invincibilityTimer <= 0) {
          hurtPlayer(ctx, av.hitHim ? 22 : 40, 'm2:hwh_avalanche', { x: 10, y: -6 }, 30);
          av.hitHim = true; ev.buried = true; playSound('thud', 1, -8);
        }
        state.playerStunTimer = Math.max(state.playerStunTimer, 10);
        if (p.health > 0) p.vel.x = Math.max(p.vel.x, 7);
      }
      for (const e of hazardVictims(state)) if (e.pos.x + e.width > tail && e.pos.x < av.front) hazardKill(ctx, e, tail, 'BURIED!', { color: '#F8FAFC', fling: { x: 12, y: -8 }, sound: 'thud' });
      zones.push({ x0: tail - 100, x1: av.front + 400, y0: Y(floor) - 1600, y1: Y(floor) + 400, ground: true });
      if (tail > Math.max(b + 300, cx + 500)) { av.phase = 'done'; hv.banks.push([c.a - 900, c.b + 700]); }
    }
  }

  // ---- The tornado
  if (t.on) {
    const gap = cx - t.x;
    t.formT++;
    if (t.hold > 0) { t.hold--; t.v = 0; }
    else {
      t.ramp++;
      // (a little slower than him, flat out: anything that slows him and it gains; far behind, it catches up quick)
      const base = 3.4 + Math.min(0.85, t.ramp * 0.0011);
      let v = gap > 620 ? Math.max(base, 8) : base;
      // (the surge: fast enough to have him well before the end of the street, never him stood waiting at a wall)
      if (t.surge) v = 14;
      t.v = v; t.x += v;
    }
    // (into the SAFE TORNADO LAUNCHING ZONE: it surges)
    if (!t.surge && R(cx) > SURGE_AT && alive) { t.surge = true; t.hold = 0; ev.surge = true; playSound('roar', 1, -20); }
    // (and he's held in the zone's box till it has him: it gets him inside the markings, never past them)
    if (t.surge && alive && !p.carried) {
      const lo = X(ZONE.a) + 12, hi = X(ZONE.b) - 16;
      if (cx > hi) { p.pos.x = hi - p.width / 2; if (p.vel.x > 0) p.vel.x = 0; }
      if (cx < lo) { p.pos.x = lo - p.width / 2; if (p.vel.x < 0) p.vel.x = 0; }
    }
    const bh = tornadoBase(t.x), baseY = Y(bh), up = baseY - feet;
    // (its roar, louder the nearer)
    if (f % 36 === 0) playSound('whirl', Math.max(0.15, 1 - Math.abs(gap) / 1200), -12);
    const down = t.formT >= FORM_T;
    // (it pulls him in)
    if (down && alive && !p.carried && gap > 0 && gap < 430) p.vel.x -= (p.isGrounded ? 0.18 : 0.08) * (1 - gap / 430);
    // (it gets him)
    if (down && alive && Math.abs(gap) < funnelHalf(up) && feet > baseY - FUNNEL_H && t.hold <= 0) {
      if (t.surge) ev.caught = true;
      else {
        hurtPlayer(ctx, 9999, 'm2:hwh_tornado', { x: -4, y: -16 }, 0);
        if (p.health <= 0) { noteTornadoDeath(); playSound('whirl', 1, -6); }
      }
    }
    if (down) {
      // (anybody else: pulled in, sucked up)
      for (const e of hazardVictims(state)) {
        const d = e.pos.x + e.width / 2 - t.x;
        if (Math.abs(d) < 360) e.vel.x -= Math.sign(d) * 0.25;
        if (Math.abs(d) < funnelHalf(baseY - (e.pos.y + e.height)) + 12) hazardKill(ctx, e, t.x, 'SUCKED UP!', { fling: { x: (Math.random() - 0.5) * 8, y: -20 }, sound: 'whirl' });
      }
      // (everything it comes to: torn loose and taken)
      for (const tr of TEARS) if (t.x + 140 > X(tr.x0) && t.x - 400 < X(tr.x1) && state.stageMemo[TORN_MEMO(tr.key)] !== '1') { tear(state, hv, tr, false); ev.ripped = true; }
      // (the guests at the back: civilians.ts, with everything else that gets them)
    }
    zones.push({ x0: t.x - 120, x1: t.x + 260, y0: baseY - FUNNEL_H, y1: baseY + 40 });
    // (its dust and snow, whirling about its foot)
    if (down && f % 2 === 0) { const a = f * 0.3; state.particles.push({ pos: { x: t.x + Math.cos(a) * 60, y: baseY - 10 }, vel: { x: -Math.sin(a) * 4, y: -2 - Math.random() * 3 }, life: 40, color: Math.random() < 0.5 ? 'rgba(168, 162, 158, 0.7)' : 'rgba(248, 250, 252, 0.7)', size: 4 + Math.random() * 4 }); }
    // (it throws what it's picked up, ahead of him)
    if (down && !t.surge && t.hold <= 0 && gap > 120 && gap < 900 && f - t.threwAt > 170 && alive) throwJunk(state, hv);
    // (the snow slides it pushes along the street after him)
    if (down && !t.surge && t.hold <= 0 && alive && R(cx) < REFILL - 300 && f - hv.slideAt > SLIDE_GAP + ((f * 7) % 90)) {
      hv.slideAt = f;
      hv.slides.push({ x: state.camera.x - 30, warn: 50, hit: false });
      playSound('rumble', 0.6, -6);
    }
  }

  // ---- The snow slides (low: jump them)
  hv.slides = hv.slides.filter(s => {
    if (s.warn > 0) { if (--s.warn === 0) playSound('whoosh', 0.8, -10); return true; }
    s.x += SLIDE_V;
    const tail = s.x - SLIDE_LEN;
    if (alive && !p.carried && !s.hit && p.invincibilityTimer <= 0 && p.pos.x + p.width > tail && p.pos.x < s.x && feet > groundY(cx) - SLIDE_H + 8) {
      s.hit = true;
      hurtPlayer(ctx, 16, 'm2:hwh_snowslide', { x: 7, y: -6 }, 20); playSound('thud', 0.9, -4);
      state.playerStunTimer = Math.max(state.playerStunTimer, 18);
    }
    for (const e of hazardVictims(state)) if (boxHits(e, tail, groundY(s.x) - SLIDE_H, SLIDE_LEN, SLIDE_H) && state.frame - (hv.hitAt.get(e) ?? -999) > 40) { hv.hitAt.set(e, state.frame); hazardHit(ctx, e, 40, tail, 'SNOWED!', { color: '#F8FAFC', knock: 8 }); }
    if (f % 3 === 0) state.particles.push({ pos: { x: s.x - Math.random() * 20, y: groundY(s.x) - SLIDE_H + Math.random() * 20 }, vel: { x: SLIDE_V * 0.6, y: -1 - Math.random() * 2 }, life: 24, color: 'rgba(248, 250, 252, 0.85)', size: 4 + Math.random() * 4 });
    return tail < state.camera.x + 900;
  });

  // ---- What it's torn loose: round it and up, then thrown out
  spinDebris(state, hv);

  // ---- What it threw
  hv.thrown = hv.thrown.filter(o => {
    if (o.landed > 0) return ++o.landed < 50;
    o.t++; o.x += o.vx; o.y += o.vy; o.vy += 0.4; o.rot += 0.18;
    const s = o.kind === 'letter' ? 56 : 46;
    if (alive && !p.carried && p.invincibilityTimer <= 0 && p.pos.x < o.x + s / 2 && p.pos.x + p.width > o.x - s / 2 && p.pos.y < o.y + s / 2 && p.pos.y + p.height > o.y - s / 2) {
      hurtPlayer(ctx, 14, 'm2:hwh_thrown', { x: Math.sign(o.vx) * 8, y: -7 }, 22); playSound('crunch', 0.8, -4);
    }
    if (o.y >= o.ty) {
      o.y = o.ty; o.landed = 1;
      playSound(o.kind === 'cow' ? 'bellow' : 'crash', 0.7, o.kind === 'cow' ? -4 : -2); shakeScreen(state, 6, 3);
      for (let k = 0; k < 12; k++) state.particles.push({ pos: { x: o.x, y: o.ty - 6 }, vel: { x: (Math.random() - 0.5) * 7, y: -1 - Math.random() * 4 }, life: 34, color: o.kind === 'potty' ? '#78350F' : '#A8A29E', size: 3 + Math.random() * 4, grav: 0.3 });
      for (const e of hazardVictims(state)) if (Math.abs(e.pos.x + e.width / 2 - o.x) < 50 && Math.abs(e.pos.y + e.height - o.ty) < 60) hazardKill(ctx, e, o.x, 'SQUASHED!', { fling: { x: 0, y: -5 }, sound: 'splat' });
    }
    return true;
  });
  for (const o of hv.thrown) if (o.landed === 0) zones.push({ x0: o.tx - 60, x1: o.tx + 60, y0: o.ty - 100, y1: o.ty + 4, ground: true });
  setHazardZones(state, 'havoc-chase', zones);
  return ev;
};

/** What it's torn loose: round it and up, then thrown out. */
const spinDebris = (state: GameState, hv: Hv) => {
  const t = hv.tornado;
  hv.debris = hv.debris.filter(d => {
    d.t++;
    if (d.t < d.orbit) {
      const base = Y(tornadoBase(t.x)), y = d.y - (d.guest ? 7 : 5);
      d.ang += 0.2; d.r += (funnelHalf(base - y) * 0.85 - d.r) * 0.08;
      d.x = t.x + Math.sin(d.ang) * d.r; d.y = y; d.rot += 0.25;
      if (d.t === Math.floor(d.orbit) - 1) { d.vx = (Math.random() < 0.6 ? 1 : -1) * (5 + Math.random() * 8); d.vy = -3 - Math.random() * 4; }
    } else { d.vy += 0.3; d.x += d.vx; d.y += d.vy; d.rot += 0.2; }
    return d.t < d.orbit + 110 && d.y < state.camera.y + 760;
  });
};

/** While it has him (the fling: a cutscene, so the chase isn't run): nothing's left hanging in the air. Whatever and
 *  whoever it had going round it is thrown out now, hard, up and away off the screen; what it had already thrown comes
 *  on down where it was going. (The playtest: guests in the funnel froze mid-air for the whole cutscene.) */
export const flingDebris = (state: GameState) => {
  const hv = hvOf(state), t = hv.tornado;
  for (const d of hv.debris) if (d.t < d.orbit - 1) {
    const away = d.x < t.x ? -1 : 1;
    d.orbit = d.t + 1; d.vx = away * (11 + Math.random() * 9); d.vy = -8 - Math.random() * 8;
  }
  spinDebris(state, hv);
  hv.thrown = hv.thrown.filter(o => {
    if (o.landed > 0) return ++o.landed < 50;
    o.t++; o.x += o.vx; o.y += o.vy; o.vy += 0.4; o.rot += 0.18;
    if (o.y >= o.ty) { o.y = o.ty; o.landed = 1; }
    return true;
  });
};

/** While he's dying to it (skinned: player/tornadoDeath.ts), it doesn't stop for him: on down its war path, blowing
 *  away what it comes to, its junk going round. */
export const tornadoRoams = (state: GameState) => {
  const hv = hvOf(state), t = hv.tornado;
  if (!t.on || spent(state)) return;
  t.formT++;
  t.x = Math.min(X(22100), t.x + Math.max(3.6, Math.min(t.v, 6)));
  for (const tr of TEARS) if (t.x + 140 > X(tr.x0) && t.x - 400 < X(tr.x1) && state.stageMemo[TORN_MEMO(tr.key)] !== '1') tear(state, hv, tr, false);
  spinDebris(state, hv);
  if (state.frame % 36 === 0) playSound('whirl', 0.7, -12);
};

const JUNK: ['cow' | 'letter' | 'potty' | 'standee' | 'cart', string][] = [['letter', 'H'], ['cow', ''], ['letter', 'A'], ['potty', ''], ['letter', 'P'], ['standee', ''], ['letter', 'Y'], ['cart', ''], ['letter', 'W'], ['letter', 'D']];
const throwJunk = (state: GameState, hv: Hv) => {
  const t = hv.tornado, p = state.player, cx = pcx(state);
  t.threwAt = state.frame;
  const [kind, ch] = JUNK[Math.floor(state.frame / 151) % JUNK.length];
  // (ahead of him, where he's going; never into a lava river)
  const tx = cx + 70 + Math.random() * 190 + p.vel.x * 10;
  const tg = groundH(R(tx));
  if (tg === null) return;
  const ty = Y(tg), T = 62, sx = t.x + 30, sy = Y(tornadoBase(t.x)) - 430;
  hv.thrown.push({ x: sx, y: sy, vx: (tx - sx) / T, vy: (ty - sy - 0.5 * 0.4 * T * T) / T, kind, ch, tx, ty, t: 0, landed: 0, rot: 0 });
  playSound('whoosh', 0.8, -8);
};

/** Bring it down behind him, at the foot of the hill. */
export const formTornado = (state: GameState) => startTornado(state, X(TORNADO_FORM), 120);
/** A bunker's roof (world): the solid slab over it (standable on top). */
export const coverRoof = (k: number) => {
  const c = COVERS[k], floor = groundH((c.a + c.b) / 2) ?? 0;
  return { x: X(c.a) - 10, y: Y(floor + ROOF) - 20, w: c.b - c.a + 20, h: 20 };
};
