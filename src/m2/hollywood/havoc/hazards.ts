// The havoc's hazards (all of them hurt the enemies too; none of them has anybody put in it):
//
//   LAVA RIVERS   across the street (and the hill road): fall in, burned, and he's back out at the nearer bank.
//                 Spent (the revisit): crusted over, walkable.
//   FACADES       the street's plywood fronts come down as he gets close (the creak and the lean, the shadow on the
//                 street: out from under). One tips over a lava river and lies across it: the bridge. The Revengers
//                 billboard on its stilts the same. Down for good (stageMemo: checkpoints keep the world as he left it).
//   THE WIND      gusts (the tell: the streaks and the howl): shoved back, and trash cans, plywood and porta-potty doors
//                 thrown along the street at him (jump them); Steve's fliers blow past (harmless).
//   THE QUAKE     the rumble (the tell: the shadows on the street where things will land), then the shake and bricks,
//                 studio lights and chunks come down on the shadows.
//   THE HAIL      the clatter (the tell), then a short burst: under a roof (the first aid tent) or stung.
//   THE FLOOD     rising up the climb (rubber-banded to him: never far behind, never right on him); in it, hurt and
//                 bobbed up; under it too long, drowned. Chunks of the demolished buildings come down the shafts.
//                 It goes back down once he's up top (it drains).
//   PUDDLES       the chase's little floods, ankle-deep on the street: they slow him (jump them).
//   In the chase (past the hill) the wind's gusts are weaker and fewer, the quake drops less, the hail stings less:
//   lesser takes, the tornado's the thing.
//   THE BALL      the wrecking ball swinging across the crane's shaft.
//   CRUMBLERS     some of the climb's ledges crumble once he's on them; what's well below him comes down behind him.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { setHazardZones, hazardVictims, hazardHit, hazardKill, boxHits, type Zone } from '../../hazardHit';
import { isLandCleared } from '../../store';
import { solid, teleport } from '../section';
import {
  X, Y, R, GY, groundH, LAVA, LAVA_DOWN, LAVA_FLOOR, FALLS, FALL_TRIGGER, WIND, QUAKE, HAIL, LEDGES, BALL, CLIMB, SHAFTS,
  FLOOD_MAX, FLOOD_LOW, DOWNHILL, PUDDLES,
} from './layout';
import { hvOf, FLUNG_MEMO, FALL_MEMO, type Hv } from './state';
import { fromDepth } from '../disaster/paint';
import { FRONT_D } from '../blvd/kit';

/** The fling's been (or the land's done, or he's past it): the tornado's spent and the place is calm-ish. */
export const spent = (state: GameState) => state.stageMemo[FLUNG_MEMO] === '1' || state.checkpoint >= 60 || isLandCleared('hollywood');

const pcx = (state: GameState) => state.player.pos.x + state.player.width / 2;
const feetOf = (state: GameState) => state.player.pos.y + state.player.height;
const live = (state: GameState) => { const p = state.player; return p.health > 0 && !p.inCutscene && state.deathTimer <= 0; };
const canHurt = (state: GameState) => live(state) && state.player.invincibilityTimer <= 0;
const onHim = (state: GameState, x: number, y: number, w: number, h: number) => { const p = state.player; return p.pos.x < x + w && p.pos.x + p.width > x && p.pos.y < y + h && p.pos.y + p.height > y; };
const inAny = (rx: number, list: [number, number][]) => list.some(([a, b]) => rx >= a && rx <= b);
/** A hit from a lingering hazard on one of them, not every frame. */
const fresh = (state: GameState, hv: Hv, e: Parameters<typeof hazardHit>[1], gap = 30) => {
  if (state.frame - (hv.hitAt.get(e) ?? -999) < gap) return false;
  hv.hitAt.set(e, state.frame); return true;
};
/** The surface's world y at world x (the ground there, or the lava's bank): for what lands. */
export const surfaceY = (x: number) => { const h = groundH(R(x)); if (h !== null) return Y(h); const l = LAVA.find(q => R(x) >= q.a && R(x) <= q.b); return l ? Y(Math.min(l.hl, l.hr)) + LAVA_DOWN : GY; };
/** The street's level at world x (over a lava river, its banks'): for what's blown along it. */
export const streetY = (x: number) => { const h = groundH(R(x)); if (h !== null) return Y(h); const l = LAVA.find(q => R(x) >= q.a && R(x) <= q.b); return l ? Y(Math.min(l.hl, l.hr)) : GY; };

// ---------------------------------------------------------------------------------------------------------------
// Building it

export const buildHazards = (state: GameState) => {
  const hv = hvOf(state), done = spent(state);
  // (the lava's channels: a floor under each; spent, a crust over it, walkable)
  for (const l of LAVA) {
    const lo = Math.min(l.hl, l.hr);
    solid(state, X(l.a), Y(lo) + LAVA_FLOOR, l.b - l.a, 200, { hidden: true, tag: 'havoc-lava' });
    if (done) hv.crusts.push(solid(state, X(l.a), Y((l.hl + l.hr) / 2), l.b - l.a, LAVA_FLOOR + (l.hl + l.hr) / 2 - lo, { hidden: true, tag: 'havoc-crust' }));
  }
  // (the facades: down already if he's been past (kept across deaths), or it's spent)
  hv.falls = FALLS.map((_, i) => ({ i, phase: done || state.stageMemo[FALL_MEMO(i)] === '1' ? 'down' : 'up', t: 0, block: null }));
  for (const f of hv.falls) if (f.phase === 'down') settleFall(state, f.i, f);
  // (the climb's ledges: the crumbly ones are their own)
  hv.crumbs = [];
  LEDGES.forEach(([rx, h, w, crumbles], i) => {
    const b = solid(state, X(rx), Y(h), w, 16, { type: 'platform', oneWay: true, hidden: true, tag: 'havoc-ledge' });
    if (crumbles && !done) hv.crumbs.push({ i, block: b, shake: 0, gone: false, fallY: 0 });
  });
};

/** A facade down: the bridge's plank laid over its river. */
const settleFall = (state: GameState, i: number, f: Hv['falls'][number]) => {
  const [rx, w, , how] = FALLS[i];
  if (how === 'bridge' && !f.block) f.block = solid(state, X(rx + w) - 10, Y(14), FALLS[i][2] + 10, 14, { hidden: true, tag: 'havoc-bridge' });
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame

export interface HazEvents { lavaFirst?: boolean; fell?: { how: string; i: number }; gust?: boolean; quake?: boolean; hail?: boolean }

export const updateHazards = (ctx: FrameContext): HazEvents => {
  const { state } = ctx, p = state.player, hv = hvOf(state), ev: HazEvents = {}, done = spent(state);
  const cx = pcx(state), feet = feetOf(state), rx = R(cx), f = state.frame;
  const zones: Zone[] = [];

  // ---- LAVA
  for (const l of LAVA) {
    const lo = Math.min(l.hl, l.hr), surf = Y(lo) + LAVA_DOWN;
    if (done) continue;
    zones.push({ x0: X(l.a) - 6, x1: X(l.b) + 6, y0: Y(Math.max(l.hl, l.hr)) - 30, y1: Y(lo) + LAVA_FLOOR, ground: true });
    if (Math.abs(cx - X((l.a + l.b) / 2)) > 1400) continue;
    if (f % 5 === 0) state.particles.push({ pos: { x: X(l.a) + Math.random() * (l.b - l.a), y: surf }, vel: { x: (Math.random() - 0.5) * 0.6, y: -1 - Math.random() * 2 }, life: 34, color: Math.random() < 0.5 ? '#F97316' : '#FDE047', size: 3 });
    if (live(state) && !p.carried && rx > l.a + 4 && rx < l.b - 4 && feet > surf - 6) {
      if (p.invincibilityTimer <= 0) hurtPlayer(ctx, 18, 'm2:hwh_lava', { x: 0, y: -10 }, 18);
      if (p.health > 0) {
        const toL = rx - l.a < l.b - rx;
        teleport(state, X(toL ? l.a - 40 : l.b + 40), Y(toL ? l.hl : l.hr));
        p.vel.y = -7;
      }
      playSound('ignite', 0.9, -2); playSound('hurt', 0.3, 0);
      for (let k = 0; k < 14; k++) state.particles.push({ pos: { x: cx, y: surf }, vel: { x: (Math.random() - 0.5) * 6, y: -3 - Math.random() * 5 }, life: 30, color: k % 2 ? '#F97316' : '#FDE047', size: 3 + Math.random() * 3, grav: 0.3 });
      ev.lavaFirst = true;
    }
    for (const e of hazardVictims(state, { flyers: false })) if (boxHits(e, X(l.a) + 4, surf - 4, l.b - l.a - 8, LAVA_FLOOR)) hazardKill(ctx, e, e.pos.x + e.width / 2, 'MELTED!', { color: '#FDBA74', fling: { x: 0, y: -9 }, sound: 'ignite' });
  }

  // ---- FACADES (and the billboard)
  for (const fl of hv.falls) {
    const [frx, w, h, how] = FALLS[fl.i];
    if (fl.phase === 'up') {
      if (!done && live(state) && rx > frx - FALL_TRIGGER && rx < frx + w + 80) { fl.phase = 'creak'; fl.t = 0; playSound('crack', 0.7, -8); }
      continue;
    }
    if (fl.phase === 'down') continue;
    fl.t++;
    // (where it'll land: the street in front of it (flat), or over the river to its right (the bridge))
    const a = how === 'bridge' ? X(frx + w) : X(frx) - 10, b = how === 'bridge' ? X(frx + w + h) : X(frx + w) + 10;
    zones.push({ x0: a, x1: b, y0: GY - 140, y1: GY + 4, ground: true });
    if (fl.phase === 'creak') {
      if (fl.t % 12 === 0) playSound('crack', 0.35, -2 - (fl.t % 3));
      // (dust shaken off its top: from where it's drawn, back at the fronts' depth)
      if (f % 3 === 0) { const [px, py] = fromDepth(state, X(frx) + Math.random() * w, GY - (how === 'billboard' ? 120 + h * 0.6 : how === 'bridge' ? h : h) + Math.random() * 30, how === 'bridge' ? 1 : FRONT_D); state.particles.push({ pos: { x: px, y: py }, vel: { x: 0, y: 1 + Math.random() }, life: 40, color: 'rgba(168, 162, 158, 0.8)', size: 3 }); }
      if (fl.t >= 54) { fl.phase = 'falling'; fl.t = 0; playSound('whoosh', 0.8, -10); }
    } else if (fl.phase === 'falling' && fl.t >= 22) {
      fl.phase = 'down'; fl.t = 0;
      state.stageMemo[FALL_MEMO(fl.i)] = '1';
      settleFall(state, fl.i, fl);
      playSound('crash', 1, -6); playSound('slam', 0.8, -8); shakeScreen(state, 14, 6);
      for (let k = 0; k < 30; k++) state.particles.push({ pos: { x: a + Math.random() * (b - a), y: GY - 8 }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 3 }, life: 50, color: 'rgba(168, 162, 158, 0.85)', size: 5 + Math.random() * 6 });
      const src = how === 'billboard' ? 'm2:hwh_billboard' : 'm2:hwh_facade';
      if (how !== 'bridge' && canHurt(state) && !p.carried && cx > a && cx < b && feet > GY - 150) hurtPlayer(ctx, 22, src, { x: cx < (a + b) / 2 ? -8 : 8, y: -8 }, 24);
      for (const e of hazardVictims(state)) if (boxHits(e, a, GY - 150, b - a, 160)) hazardKill(ctx, e, (a + b) / 2, 'FLATTENED!', { fling: { x: 0, y: -4 }, sound: 'splat' });
      ev.fell = { how, i: fl.i };
    }
  }

  // ---- THE WIND
  // (in the chase, past the hill, everything's a lesser take: the tornado's the thing)
  const lesser = rx > DOWNHILL.b;
  const windy = !done && inAny(rx, WIND);
  const wt = f % 320, gust = windy && wt >= 210;
  if (windy && wt === 160) { playSound('whoosh', 0.5, -14); }
  if (windy && wt === 210) { playSound('whoosh', 1, -18); ev.gust = true; }
  if (gust && live(state) && !p.carried) p.vel.x -= (p.isGrounded ? 0.21 : 0.08) * (lesser ? 0.5 : 1);
  if (windy && wt >= 160 && f % 3 === 0) state.particles.push({ pos: { x: state.camera.x + 820, y: state.camera.y + 80 + Math.random() * 480 }, vel: { x: gust ? -16 : -8, y: (Math.random() - 0.5) }, life: 60, color: 'rgba(231, 229, 228, 0.5)', size: 2 });
  if (gust && wt % (lesser ? 52 : 26) === 0) {
    const kinds = ['can', 'sheet', 'door', 'flier'] as const, kind = kinds[Math.floor(f / 26) % 4];
    const sx = state.camera.x + 860;
    hv.blown.push({ x: sx, y: streetY(sx) - (kind === 'can' ? 16 : kind === 'flier' ? 60 + Math.random() * 140 : 34), vx: kind === 'flier' ? -11 : kind === 'can' ? -8 : -10, vy: 0, kind, rot: 0, hit: false });
  }
  // (Steve's fliers blowing past, now and then, wherever it's windy at all: the whole place now)
  if (!done && f % 140 === 0 && !windy) { const sx = state.camera.x + 840; hv.blown.push({ x: sx, y: state.camera.y + 120 + Math.random() * 300, vx: -6, vy: 0, kind: 'flier', rot: 0, hit: false }); }
  hv.blown = hv.blown.filter(o => {
    o.x += o.vx; o.rot += o.kind === 'can' ? 0.3 : o.kind === 'flier' ? 0.1 : 0.15;
    if (o.kind === 'flier') o.y += Math.sin(f * 0.1 + o.x * 0.01) * 1.2;
    else o.y = streetY(o.x) - (o.kind === 'can' ? 16 + Math.abs(Math.sin(o.x * 0.03)) * 10 : 34);
    if (o.kind !== 'flier' && !o.hit) {
      const sz = o.kind === 'can' ? 26 : 34;
      if (canHurt(state) && !p.carried && onHim(state, o.x - sz / 2, o.y - sz / 2, sz, sz)) { o.hit = true; hurtPlayer(ctx, 12, 'm2:hwh_debris', { x: -8, y: -6 }, 18); playSound('clang', 0.7, -2); }
      for (const e of hazardVictims(state)) if (boxHits(e, o.x - sz / 2, o.y - sz / 2, sz, sz) && fresh(state, hv, e)) hazardHit(ctx, e, 30, o.x + 30, 'BLOWN AWAY!', { knock: 10 });
    }
    return o.x > state.camera.x - 140;
  });

  // ---- THE QUAKE (and what it brings down)
  const shaky = !done && inAny(rx, QUAKE);
  const qt = (f + 200) % 420;
  if (shaky && qt === 330) {
    playSound('rumble', 0.8, -12);
    // (where things'll land: about him, ahead and behind; the shadows on the street from now)
    for (const dx of lesser ? [200 + Math.random() * 200, 480] : [-170, 30, 220]) {
      const x = cx + dx + (Math.random() - 0.5) * 60;
      hv.drops.push({ x, y: state.camera.y - 80, vy: 0, warn: 90, land: surfaceY(x), kind: (['brick', 'light', 'chunk'] as const)[Math.floor(Math.random() * 3)], rot: 0, done: 0 });
    }
    ev.quake = true;
  }
  if (shaky && qt >= 330 && qt % 10 === 0) shakeScreen(state, 8, 2);
  if (shaky && qt < 70 && qt % 6 === 0) { shakeScreen(state, 8, 6); if (qt === 0) { playSound('rumble', 1, -16); playSound('crack', 0.8, -6); } }

  // ---- THE FLOOD (the climb), and what comes down the shafts
  const fd = hv.flood;
  if (fd.on) {
    if (fd.wave < 120) fd.wave++;
    if (fd.drain) { fd.h -= 3.2; if (fd.h <= FLOOD_LOW) { fd.on = false; fd.drain = false; } }
    else if (fd.wait > 0) fd.wait--;
    else {
      const gap = (GY - feet) - fd.h;
      const rate = gap > 480 ? 1.6 : gap > 300 ? 0.8 : gap > 160 ? 0.52 : 0.3;
      fd.h = Math.min(FLOOD_MAX, fd.h + rate);
      if (f % 50 === 0) playSound('glug', 0.3, -8);
    }
    const surf = Y(fd.h);
    if (live(state) && cx < X(CLIMB.b)) {
      if (feet > surf + 14) {
        if (!hv.wet) { hv.wet = true; playSound('splash', 0.9, -2); }
        if (p.invincibilityTimer <= 0) hurtPlayer(ctx, 12, 'm2:hwh_flood', { x: 0, y: -11 }, 16);
        else if (!p.carried) p.vel.y = Math.min(p.vel.y, -2.5);
      } else hv.wet = false;
      if (p.pos.y > surf + 4) { if (++fd.under > 80) hurtPlayer(ctx, 9999, 'm2:hwh_drown', { x: 0, y: -2 }, 0); }
      else fd.under = 0;
    }
    for (const e of hazardVictims(state)) if (e.pos.x < X(CLIMB.b) && e.pos.y + e.height > surf + 20) hazardKill(ctx, e, e.pos.x + e.width / 2, 'FLOODED!', { color: '#7DD3FC', fling: { x: 0, y: -6 }, sound: 'splash' });
    // (chunks of the buildings they're knocking down, down the shafts at him)
    if (!fd.drain && rx > CLIMB.a && rx < CLIMB.b && f % 150 === 75) {
      const sh = SHAFTS.find(s => rx >= s.a && rx < s.b) ?? SHAFTS[0];
      const x = Math.max(X(sh.a) + 30, Math.min(X(sh.b) - 30, cx + (Math.random() - 0.5) * 260));
      hv.drops.push({ x, y: state.camera.y - 80, vy: 0, warn: 55, land: surf, kind: 'chunk', rot: 0, done: 0 });
    }
  }

  // ---- What comes down (the quake's, the shafts')
  hv.drops = hv.drops.filter(d => {
    if (d.done > 0) return ++d.done < 30;
    if (d.warn > 0) { d.warn--; if (d.warn === 0) playSound('whoosh', 0.4, 4); return true; }
    d.vy = Math.min(16, d.vy + 0.7); d.y += d.vy; d.rot += 0.12;
    // (the flood's rising under a chunk: it lands on the water)
    if (fd.on && d.kind === 'chunk') d.land = Math.min(d.land, Y(fd.h));
    const s = 34;
    if (canHurt(state) && !p.carried && onHim(state, d.x - s / 2, d.y - s, s, s)) { hurtPlayer(ctx, 14, 'm2:hwh_falling', { x: cx < d.x ? -6 : 6, y: -4 }, 18); playSound('crunch', 0.8, 0); }
    for (const e of hazardVictims(state)) if (boxHits(e, d.x - s / 2, d.y - s, s, s) && fresh(state, hv, e)) hazardHit(ctx, e, 45, d.x, 'CONKED!', { knock: 6 });
    if (d.y >= d.land) {
      d.done = 1; d.y = d.land;
      playSound(d.kind === 'light' ? 'glass' : 'crash', 0.6, 2);
      for (let k = 0; k < 10; k++) state.particles.push({ pos: { x: d.x, y: d.land - 4 }, vel: { x: (Math.random() - 0.5) * 6, y: -1 - Math.random() * 4 }, life: 30, color: d.kind === 'light' ? '#E5E7EB' : '#A8A29E', size: 3 + Math.random() * 3, grav: 0.3 });
    }
    return true;
  });
  // (the quake's coming-down: kept out from under, the enemies)
  for (const d of hv.drops) if (d.done === 0) zones.push({ x0: d.x - 30, x1: d.x + 30, y0: d.land - 90, y1: d.land + 4, ground: true });

  // ---- THE HAIL
  const haily = !done && inAny(rx, HAIL);
  const ht = (f + 60) % 400;
  if (haily && ht === 280) { playSound('clink', 0.6, 8); ev.hail = true; }
  if (haily && ht >= 280) {
    const n = ht >= 320 ? 4 : 1;
    for (let k = 0; k < n; k++) state.particles.push({ pos: { x: state.camera.x + Math.random() * 820, y: state.camera.y - 10 }, vel: { x: -1, y: 11 + Math.random() * 3 }, life: 70, color: '#F0F9FF', size: 3, grav: 0.1 });
    if (ht >= 320 && ht % 9 === 0) playSound('clink', 0.25, 10 + (ht % 5));
    if (ht >= 320 && ht % 16 === 0) {
      const covered = state.blocks.some(b => !b.oneWay && b.type !== 'pit' && b.x < p.pos.x + p.width - 8 && b.x + b.w > p.pos.x + 8 && b.y + b.h <= p.pos.y + 2 && b.y + b.h > p.pos.y - 420);
      if (canHurt(state) && !p.carried && !covered) hurtPlayer(ctx, 4, 'm2:hwh_hail', { x: 0, y: -3 }, 10);
      for (const e of hazardVictims(state)) if (Math.abs(e.pos.x - cx) < 700 && fresh(state, hv, e, 60)) hazardHit(ctx, e, 8, e.pos.x + e.width / 2, 'HAILED!', { knock: 2 });
    }
  }

  // ---- THE PUDDLES (the chase's little floods: ankle-deep, they slow him; jump them)
  for (const [a, b] of PUDDLES) {
    if (!live(state) || p.carried || !p.isGrounded || rx < a || rx > b || Math.abs(feet - GY) > 4) continue;
    p.vel.x *= 0.95;
    if (Math.abs(p.vel.x) > 0.6 && f % 5 === 0) {
      for (let k = 0; k < 3; k++) state.particles.push({ pos: { x: cx + (Math.random() - 0.5) * 20, y: GY - 2 }, vel: { x: (Math.random() - 0.5) * 3, y: -2 - Math.random() * 3 }, life: 22, color: 'rgba(148, 163, 184, 0.85)', size: 3, grav: 0.3 });
      if (f % 15 === 0) playSound('splash', 0.25, 8);
    }
  }

  // ---- THE WRECKING BALL
  const ball = ballAt(state);
  if (!done && Math.abs(cx - ball.x) < 900) {
    if (Math.abs(ball.a) < 0.05 && f % 2 === 0) playSound('whoosh', 0.35, -12);
    const dx = cx - ball.x, dy = (p.pos.y + p.height / 2) - ball.y;
    if (canHurt(state) && Math.hypot(dx, dy) < BALL.r + 24) { hurtPlayer(ctx, 15, 'm2:hwh_ball', { x: Math.sign(ball.va || dx) * 10, y: -6 }, 22); playSound('clang', 1, -10); shakeScreen(state, 8, 4); }
    for (const e of hazardVictims(state)) if (Math.hypot(e.pos.x + e.width / 2 - ball.x, e.pos.y + e.height / 2 - ball.y) < BALL.r + 24) hazardKill(ctx, e, ball.x - Math.sign(ball.va) * 40, 'DEMOLISHED!', { fling: { x: Math.sign(ball.va || 1) * 13, y: -8 } });
  }

  // ---- THE CRUMBLY LEDGES
  for (const cr of hv.crumbs) {
    if (cr.gone) { cr.fallY += 6; continue; }
    const b = cr.block!;
    const on = p.isGrounded && Math.abs(feet - b.y) < 3 && cx > b.x - 4 && cx < b.x + b.w + 4;
    const below = fd.on && GY - feet - (GY - b.y) > 230;
    if (cr.shake === 0 && (on || below)) { cr.shake = 1; playSound('crack', 0.5, 4); }
    if (cr.shake > 0 && ++cr.shake > 40) {
      cr.gone = true;
      const i = state.blocks.indexOf(b); if (i >= 0) state.blocks.splice(i, 1);
      playSound('crumble', 0.7, 0);
      for (let k = 0; k < 10; k++) state.particles.push({ pos: { x: b.x + Math.random() * b.w, y: b.y }, vel: { x: (Math.random() - 0.5) * 3, y: Math.random() * 2 }, life: 40, color: '#78716C', size: 4, grav: 0.4 });
    }
  }

  setHazardZones(state, 'havoc', zones);
  return ev;
};

/** The wrecking ball now: where (world), its swing (radians) and which way it's going. Spent: hanging still. */
export const ballAt = (state: GameState) => {
  const done = spent(state);
  const a = done ? 0.05 : BALL.amp * Math.sin(state.frame * BALL.w), va = done ? 0 : Math.cos(state.frame * BALL.w);
  return { x: X(BALL.px) + Math.sin(a) * BALL.len, y: Y(BALL.ph) + Math.cos(a) * BALL.len, a, va };
};

/** Lobbed loot (the looters'): its arc, him, the ground. */
export const updateLobs = (ctx: FrameContext) => {
  const { state } = ctx, hv = hvOf(state), p = state.player;
  hv.lobs = hv.lobs.filter(l => {
    l.vy += 0.35; l.x += l.vx; l.y += l.vy; l.rot += 0.25;
    if (canHurt(state) && !p.carried && onHim(state, l.x - 10, l.y - 10, 20, 20)) { hurtPlayer(ctx, 9, 'm2:hwh_loot', { x: Math.sign(l.vx) * 6, y: -4 }, 16); playSound(l.kind === 'globe' ? 'glass' : 'thud', 0.8, 4); return false; }
    let top: number | null = null;
    for (const b of state.blocks) { if (b.type === 'pit' || l.x < b.x || l.x > b.x + b.w || b.y < l.y - 14) continue; if (top === null || b.y < top) top = b.y; }
    if (top !== null && l.y >= top) {
      playSound(l.kind === 'globe' ? 'glass' : 'thud', 0.5, 6);
      for (let k = 0; k < 6; k++) state.particles.push({ pos: { x: l.x, y: top - 4 }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 3 }, life: 24, color: l.kind === 'globe' ? '#BAE6FD' : l.kind === 'mug' ? '#1D4ED8' : '#DC2626', size: 3, grav: 0.3 });
      return false;
    }
    return l.y < state.camera.y + 900;
  });
};
