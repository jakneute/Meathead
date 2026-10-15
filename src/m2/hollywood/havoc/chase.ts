// THE TORNADO: it comes down over the flood behind him once he's up on the ridge (it drinks the flood), and comes
// after him, down the hill road and along the foot of the hill to the end. Touch it and he's dead (noteTornadoDeath:
// the fling's fourth-wall line). It's slower than him to start with and gets faster the longer it goes; never far off
// (it closes in to just off the left of the screen). It pulls him (and anybody) in toward it; anybody it gets is
// sucked up; now and then it throws what it's picked up (the HAPPYWOOD letters, a cow, a porta-potty, a tram seat, a
// Steve standee) ahead of him in an arc, its mark on the ground where it'll land.
//
// THE SHELTERS: at each AVALANCHE ZONE (signs before it), a shelter. In under it a moment and the hill lets go: the
// rumble (the tell), then the avalanche comes down the hill behind him, buries the tornado (it chokes, falls back, a
// lull) and thunders on over the shelter and down the road. Out in the open as it comes: buried (hurt, stuck a
// moment). Run past a shelter and the avalanche comes anyway, on top of him.
//
// THE END: past the first aid station it surges (no outrunning it now) and when it gets him it's the fling (fling.ts).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { setHazardZones, hazardVictims, hazardKill, type Zone } from '../../hazardHit';
import { X, Y, R, groundH, COVERS, ROOF, SURGE_AT, TORNADO_FORM, BUILDINGS } from './layout';
import { hvOf, noteTornadoDeath, type Hv } from './state';
import { spent } from './hazards';

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

const pcx = (state: GameState) => state.player.pos.x + state.player.width / 2;

/** He's in under shelter k (on its floor, his middle under its roof). */
export const inCover = (state: GameState, k: number) => {
  const p = state.player, c = COVERS[k], cx = pcx(state), feet = p.pos.y + p.height;
  const floor = groundH((c.a + c.b) / 2) ?? 0;
  return cx > X(c.a) + 6 && cx < X(c.b) - 6 && Math.abs(feet - Y(floor)) < 8 && p.health > 0;
};
export const inAnyCover = (state: GameState) => COVERS.some((_, k) => inCover(state, k));

/** Bring the tornado down (or put it back where it'd be, starting again at a checkpoint). */
export const startTornado = (state: GameState, x: number, hold: number) => {
  const t = hvOf(state).tornado;
  Object.assign(t, { on: true, x, v: 0, ramp: 0, hold, choked: 999, threwAt: state.frame, surge: false });
};

/** The shelters' avalanches: set up (the ones behind where he's starting, done). */
export const buildCovers = (state: GameState, fromRx: number) => {
  hvOf(state).avalanches = COVERS.map((c, k) => ({ k, phase: c.b < fromRx ? 'done' : 'idle', t: 0, front: 0, from: 0, to: 0, hitHim: false }));
};

export interface ChaseEvents { coverSign?: boolean; inCover?: boolean; avalancheTell?: boolean; smothered?: boolean; caught?: boolean; surge?: boolean }

export const updateChase = (ctx: FrameContext): ChaseEvents => {
  const { state } = ctx, p = state.player, hv = hvOf(state), t = hv.tornado, ev: ChaseEvents = {}, f = state.frame;
  const zones: Zone[] = [];
  const cx = pcx(state), feet = p.pos.y + p.height;
  if (spent(state) || hv.fling.step !== 'off') { t.on = t.on && hv.fling.step !== 'off' && hv.fling.step !== 'done'; setHazardZones(state, 'havoc-chase', []); return ev; }
  const alive = p.health > 0 && state.deathTimer <= 0 && !p.inCutscene;

  // ---- The shelters and their avalanches
  for (const av of hv.avalanches) {
    const c = COVERS[av.k], a = X(c.a), b = X(c.b), floor = groundH((c.a + c.b) / 2) ?? 0;
    if (av.phase === 'idle') {
      if (inCover(state, av.k)) { av.phase = 'wait'; av.t = 0; ev.inCover = true; }
      else if (t.on && (cx > b + 60 || t.x > a - 320) && cx > a - 1400) { av.phase = 'tell'; av.t = 0; ev.avalancheTell = true; playSound('rumble', 1, -14); }
    }
    if (av.phase === 'wait') { if (++av.t > 10) { av.phase = 'tell'; av.t = 0; ev.avalancheTell = true; playSound('rumble', 1, -14); } }
    else if (av.phase === 'tell') {
      av.t++;
      if (av.t % 8 === 0) shakeScreen(state, 8, 2 + av.t / 25);
      if (f % 2 === 0) state.particles.push({ pos: { x: state.camera.x + Math.random() * 500, y: state.camera.y - 6 }, vel: { x: 2 + Math.random() * 2, y: 3 + Math.random() * 2 }, life: 80, color: '#F8FAFC', size: 3 + Math.random() * 3 });
      if (av.t >= 50) {
        av.phase = 'run'; av.t = 0;
        av.from = Math.min(t.on ? t.x - 160 : a - 900, a - 900); av.front = av.from; av.to = Math.max(b + 320, cx + 260);
        playSound('roar', 0.9, -16); playSound('rumble', 1, -18);
      }
    } else if (av.phase === 'run') {
      av.t++; av.front += 15;
      const body0 = av.front - 460, body1 = av.front;
      if (av.t % 4 === 0) shakeScreen(state, 6, 5);
      // (it gets the tornado: buried, it chokes and falls back)
      if (t.on && t.choked > 60 && t.x < body1 && t.x > body0 - 200) {
        t.x = Math.min(t.x, a - 1150); t.hold = 110; t.ramp = 0; t.v = 0; t.choked = 0;
        playSound('whoosh', 1, -18); ev.smothered = true;
      }
      // (him, out in the open as it goes over)
      if (alive && !p.carried && !inCover(state, av.k) && cx > body0 && cx < body1 && feet > Y(groundH(R(cx)) ?? floor) - 160 && p.invincibilityTimer <= 0) {
        av.hitHim = true;
        hurtPlayer(ctx, 24, 'm2:hwh_avalanche', { x: 9, y: -8 }, 26);
        state.playerStunTimer = Math.max(state.playerStunTimer, 46);
      }
      for (const e of hazardVictims(state)) if (e.pos.x + e.width > body0 && e.pos.x < body1) hazardKill(ctx, e, body0, 'BURIED!', { color: '#F8FAFC', fling: { x: 9, y: -8 }, sound: 'thud' });
      zones.push({ x0: body0 - 100, x1: Math.min(av.to, body1 + 200), y0: Y(floor) - 400, y1: Y(floor) + 200, ground: true });
      if (body0 > av.to) { av.phase = 'done'; hv.banks.push([R(av.from), R(av.to)]); }
    }
  }
  const sheltered = inAnyCover(state);

  // ---- The tornado
  if (t.on) {
    const gap = cx - t.x;
    t.choked++;
    if (t.hold > 0) { t.hold--; t.v = 0; }
    else {
      t.ramp++;
      const base = 3.0 + Math.min(2.7, t.ramp * 0.0025);
      let v = gap > 560 ? Math.max(base, 6.6) : base;
      // (him in under a shelter, the hill about to go: it labors a little)
      if (sheltered && hv.avalanches.some(av => av.phase === 'wait' || av.phase === 'tell')) v = Math.min(v, 1.8);
      if (t.surge) v = 9.6;
      t.v = v; t.x += v;
    }
    // (past the first aid station: it surges)
    if (!t.surge && R(cx) > SURGE_AT && alive) { t.surge = true; t.hold = 0; ev.surge = true; playSound('roar', 1, -20); }
    const bh = tornadoBase(t.x), up = (GY_OF(bh) - feet);
    // (its roar, louder the nearer)
    if (f % 36 === 0) playSound('whirl', Math.max(0.15, 1 - Math.abs(gap) / 1200), -12);
    // (it pulls him in)
    if (alive && !p.carried && !sheltered && gap > 0 && gap < 430) p.vel.x -= (p.isGrounded ? 0.18 : 0.08) * (1 - gap / 430);
    // (it gets him)
    if (alive && Math.abs(gap) < funnelHalf(up) && feet > GY_OF(bh) - FUNNEL_H && t.hold <= 0) {
      if (t.surge) ev.caught = true;
      else {
        hurtPlayer(ctx, 9999, 'm2:hwh_tornado', { x: -4, y: -16 }, 0);
        if (p.health <= 0) { noteTornadoDeath(); playSound('whirl', 1, -6); }
      }
    }
    // (anybody else: pulled in, sucked up)
    for (const e of hazardVictims(state)) {
      const d = e.pos.x + e.width / 2 - t.x;
      if (Math.abs(d) < 360) e.vel.x -= Math.sign(d) * 0.25;
      if (Math.abs(d) < funnelHalf(GY_OF(bh) - (e.pos.y + e.height)) + 12) hazardKill(ctx, e, t.x, 'SUCKED UP!', { fling: { x: (Math.random() - 0.5) * 8, y: -20 }, sound: 'whirl' });
    }
    zones.push({ x0: t.x - 120, x1: t.x + 260, y0: GY_OF(bh) - FUNNEL_H, y1: GY_OF(bh) + 40 });
    // (its dust and snow, whirling about its foot)
    if (f % 2 === 0) { const a = f * 0.3; state.particles.push({ pos: { x: t.x + Math.cos(a) * 60, y: GY_OF(bh) - 10 }, vel: { x: -Math.sin(a) * 4, y: -2 - Math.random() * 3 }, life: 40, color: Math.random() < 0.5 ? 'rgba(168, 162, 158, 0.7)' : 'rgba(248, 250, 252, 0.7)', size: 4 + Math.random() * 4 }); }
    // (it throws what it's picked up, ahead of him)
    if (!t.surge && t.hold <= 0 && !sheltered && gap > 120 && gap < 900 && f - t.threwAt > 150 && alive) throwJunk(state, hv);
  }
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

const GY_OF = (h: number) => Y(h);

const JUNK: ['cow' | 'letter' | 'potty' | 'standee' | 'cart', string][] = [['letter', 'H'], ['cow', ''], ['letter', 'A'], ['potty', ''], ['letter', 'P'], ['standee', ''], ['letter', 'Y'], ['cart', ''], ['letter', 'W'], ['letter', 'D']];
const throwJunk = (state: GameState, hv: Hv) => {
  const t = hv.tornado, p = state.player, cx = pcx(state);
  t.threwAt = state.frame;
  const [kind, ch] = JUNK[Math.floor(state.frame / 151) % JUNK.length];
  // (ahead of him, where he's going: never into a shelter (it'd land on its roof: that's fine, it's a roof))
  const tx = cx + 70 + Math.random() * 190 + p.vel.x * 10;
  const tg = groundH(R(tx));
  if (tg === null || COVERS.some(c => R(tx) > c.a - 40 && R(tx) < c.b + 40)) return;
  const ty = Y(tg), T = 62, sx = t.x + 30, sy = Y(tornadoBase(t.x)) - 430;
  hv.thrown.push({ x: sx, y: sy, vx: (tx - sx) / T, vy: (ty - sy - 0.5 * 0.4 * T * T) / T, kind, ch, tx, ty, t: 0, landed: 0, rot: 0 });
  playSound('whoosh', 0.8, -8);
};

/** Bring it down over the flood behind him, now he's up on the ridge. */
export const formTornado = (state: GameState) => startTornado(state, X(TORNADO_FORM), 120);
/** A shelter's roof (world): the solid lid over it (standable on top). */
export const coverRoof = (k: number) => {
  const c = COVERS[k], floor = groundH((c.a + c.b) / 2) ?? 0;
  return { x: X(c.a) - 10, y: Y(floor + ROOF) - 20, w: c.b - c.a + 20, h: 20 };
};
