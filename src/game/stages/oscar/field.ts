// The oil field's hazards. Oil on the ground in two kinds: a slick (you slide
// about on it: the engine's player movement reads state.groundOil) and tar
// (it holds your feet: slow going, no jump to speak of; a shoulder charge gets
// you out). Put a flame to a slick and it goes up: a sheet of fire along it
// for a while (it hurts him, and it burns anything he's put in it), and then
// the oil's burned off. And the pits of crude: fall in one and that's it.

import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import { groundLineAt } from '../../core/terrain';
import { CANVAS_WIDTH } from '../../../constants';
import { hurtPlayer } from '../../bosses/shared';
import { playSound } from '../../platform/audio';
import { COURSE, OilPatch, Jet, Geyser, Mover, pitAt } from './course';
import { rectsOverlap, boundsOf } from '../../core/utils';
import { oiledIntoFire } from '../../combat/weapons';

/** A patch of oil: burning (frames left of it), whether it's burned off, and (if it pools back) how long till it has;
 * whether it was him that lit it this time (his flamethrower), or a gas jet. */
export interface Slick extends OilPatch { burn: number; gone: boolean; back: number; hisFire?: boolean }

/** A jet, and when it came on the screen (it only starts going then, and stops once it's well off it again). */
export interface LiveJet extends Jet { seen: number }

/** A vent, live: when it came on the screen (it runs from then), whether there's fire on it (the next one's fire), and
 * which eruption last got him (so each gets him once). */
export interface LiveGeyser extends Geyser { seen: number; lit: boolean; hitOn: number }
/** A moving derrick, live: its platform's block, and where it was last frame. */
export interface LiveMover extends Mover { bx: number; by: number }

export interface Field {
  oil: Slick[];
  jets: LiveJet[];
  geysers: LiveGeyser[];
  movers: LiveMover[];
  /** Splashes where something went into the crude. */
  splashAt: number;
}

/** How long a lit slick burns, how often it hurts him (and how much), how hard it burns what's in it (every 6 frames: 240 a second). */
const BURN_FRAMES = 330, BURN_EVERY = 28, BURN_DAMAGE = 7, BURN_ENEMY = 24;
/** Tar burns longer. Oil that pools back takes this long to. */
const TAR_BURN_FRAMES = 480, POOL_BACK = 300;
/** A jet of fire: how long it hisses and sparks before it goes, how much it hurts. */
const JET_WARN = 36, JET_DAMAGE = 16;
/** A vent: how long it bubbles before it goes, how long it goes for, how high; what the oil and the fire do to him. */
export const GEYSER_WARN = 64, GEYSER_ERUPT = 44, GEYSER_H = 230, FIRE_GEYSER_H = 270;
const GEYSER_DAMAGE = 8, FIRE_GEYSER_DAMAGE = 22;

/** Where a vent is in its cycle (from when it came on the screen): erupting at the start of it, bubbling at the end. */
const geyserCycle = (g: LiveGeyser, frame: number) => (frame - g.seen + g.phase) % g.period;
export const geyserErupting = (g: LiveGeyser, frame: number) => g.seen >= 0 && geyserCycle(g, frame) < GEYSER_ERUPT;
export const geyserWarning = (g: LiveGeyser, frame: number) => g.seen >= 0 && geyserCycle(g, frame) >= g.period - GEYSER_WARN;
/** How far through its eruption it is (0..1), and the box of the column right now. */
export const geyserK = (g: LiveGeyser, frame: number) => geyserCycle(g, frame) / GEYSER_ERUPT;
export const geyserBox = (g: LiveGeyser, frame: number) => {
  const k = geyserK(g, frame), up = Math.min(1, k * 6) * (k > 0.8 ? (1 - k) * 5 : 1);
  const h = (g.lit ? FIRE_GEYSER_H : GEYSER_H) * up;
  return { x: g.x - 22, y: g.y - h, w: 44, h };
};
/** Where a moving derrick's platform is (left edge, top) at a frame. */
export const moverAt = (m: Mover, frame: number) => {
  const s = Math.sin((frame / m.period) * Math.PI * 2 + m.phase) / 2;
  return { x: m.x + m.dx * s, y: m.y + m.dy * s };
};

/** Is a jet going right now (and is it about to)? */
/** Where a jet is in its cycle: it starts (on coming on the screen) partway through the quiet part, so there's a moment to see it first. */
const jetCycle = (j: LiveJet, frame: number) => (frame - j.seen + j.on + (j.phase % Math.max(1, j.period - j.on - JET_WARN))) % j.period;
export const jetOn = (j: LiveJet, frame: number) => j.seen >= 0 && jetCycle(j, frame) < j.on;
export const jetWarning = (j: LiveJet, frame: number) => j.seen >= 0 && jetCycle(j, frame) >= j.period - JET_WARN;
/** The box its flame fills. */
export const jetBox = (j: Jet) => (j.dir === 'up' ? { x: j.x - 16, y: j.y - j.len, w: 32, h: j.len } : j.dir === 'right' ? { x: j.x, y: j.y - 34, w: j.len, h: 34 } : { x: j.x - j.len, y: j.y - 34, w: j.len, h: 34 });

export const createField = (state: GameState): Field => {
  const f: Field = {
    oil: COURSE.oil.map(o => ({ ...o, burn: 0, gone: false, back: 0 })), jets: COURSE.jets.map(j => ({ ...j, seen: -1 })),
    geysers: COURSE.geysers.map(g => ({ ...g, seen: -1, lit: false, hitOn: -1 })),
    movers: COURSE.movers.map(m => { const at = moverAt(m, state.frame); return { ...m, bx: at.x, by: at.y }; }),
    splashAt: -999,
  };
  // (the moving derricks' platforms: stood on like any other, and moved along every frame)
  f.movers.forEach((m, i) => state.blocks.push({ x: m.bx, y: m.by, w: m.w, h: 14, type: 'platform', hidden: true, oneWay: true, tag: `omover-${i}` }));
  syncOil(state, f);
  return f;
};

/** What the player's movement sees: the oil that's still there. */
const syncOil = (state: GameState, f: Field) => {
  state.groundOil = f.oil.filter(o => !o.gone).map(o => ({ x1: o.x1, x2: o.x2, kind: o.kind }));
};

export const updateField = (ctx: FrameContext, f: Field) => {
  const { state, fx } = ctx;
  const p = state.player;
  // The jets: hissing and sparking, then fire; it hurts him, it burns anything in it, and it lights the oil it touches
  const jetsOn: Jet[] = [];
  for (const j of f.jets) {
    // (nothing till it's on the screen; it rests again once it's well off it)
    const box0 = jetBox(j);
    const onScreen = box0.x + box0.w > state.camera.x && box0.x < state.camera.x + CANVAS_WIDTH;
    if (onScreen && j.seen < 0) j.seen = state.frame;
    if (!onScreen && (box0.x + box0.w < state.camera.x - 600 || box0.x > state.camera.x + CANVAS_WIDTH + 600)) j.seen = -1;
    if (j.seen < 0) continue;
    if (jetWarning(j, state.frame) && state.frame % 3 === 0) state.particles.push({ pos: { x: j.x, y: j.y - 4 }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 3 }, life: 12, color: Math.random() < 0.5 ? '#FDE047' : '#F8FAFC', size: 2 + Math.random() * 2 });
    if (!jetOn(j, state.frame)) continue;
    jetsOn.push(j);
    const box = jetBox(j);
    if (state.frame % 20 === 0 && rectsOverlap(boundsOf(p), box) && p.invincibilityTimer <= 0 && !p.inCutscene) hurtPlayer(ctx, JET_DAMAGE, 'gas_jet', { x: j.dir === 'left' ? -5 : j.dir === 'right' ? 5 : 0, y: -9 });
    for (const e of state.enemies) {
      if (e.health <= 0 || e.isBlownAway || e.type === 'boss' || !rectsOverlap(boundsOf(e), box)) continue;
      if (oiledIntoFire(ctx, e) || state.frame % 8 !== 0) continue;
      e.health -= 12;
      if (e.health <= 0) fx.killWithAnimation(e, 'charred', 'flamethrower_kill', 'charred');
    }
  }
  updateMovers(ctx, f);
  updateGeysers(ctx, f, jetsOn);
  // A flame on oil lights it: his flamethrower (anywhere near the ground over it), or a jet reaching it
  for (const o of f.oil) {
    if (o.gone || o.burn > 0) continue;
    // (only once it's on the screen: nothing goes up where he can't see it go up)
    if (o.x2 < state.camera.x || o.x1 > state.camera.x + CANVAS_WIDTH) continue;
    const byHim = state.flameSegments.some(s => s.x > o.x1 - 10 && s.x < o.x2 + 10 && s.y > groundLineAt(state.groundRuns, s.x) - 90);
    const byJet = jetsOn.some(j => { const b = jetBox(j); return b.x < o.x2 && b.x + b.w > o.x1 && b.y + b.h > groundLineAt(state.groundRuns, Math.max(o.x1, Math.min(o.x2, b.x + b.w / 2))) - 20; });
    if (byHim || byJet) {
      o.burn = o.kind === 'tar' ? TAR_BURN_FRAMES : BURN_FRAMES;
      o.hisFire = byHim;
      playSound('ignite');
      if (byHim) fx.spawnDamageNumber({ x: (o.x1 + o.x2) / 2 - 30, y: groundLineAt(state.groundRuns, o.x1) - 60 }, 'IT WENT UP!', true, '#F97316');
    }
  }
  // Oil that pools back once it's burned off
  for (const o of f.oil) if (o.gone && o.refills && --o.back <= 0) { o.gone = false; syncOil(state, f); }
  for (const o of f.oil) {
    if (o.burn <= 0) continue;
    o.burn--;
    const cx = p.pos.x + p.width / 2;
    const g = groundLineAt(state.groundRuns, cx);
    // In the fire: it hurts
    if (cx > o.x1 && cx < o.x2 && p.pos.y + p.height > g - 30 && state.frame % BURN_EVERY === 0 && p.invincibilityTimer <= 0) hurtPlayer(ctx, BURN_DAMAGE, o.hisFire ? 'oil_fire' : 'oil_fire_jet', { x: 0, y: -7 });
    // ...and anything stood in it burns, fast: it goes up with it (a flyer over it's fine)
    for (const e of state.enemies) {
      if (e.health <= 0 || e.isBlownAway || e.type === 'boss' || e.enemyType === 'flyer') continue;
      const ex = e.pos.x + e.width / 2;
      if (ex < o.x1 || ex > o.x2 || e.pos.y + e.height < groundLineAt(state.groundRuns, ex) - 30) continue;
      if (oiledIntoFire(ctx, e)) continue;
      if (state.frame % 3 === 0) state.particles.push({ pos: { x: e.pos.x + Math.random() * e.width, y: e.pos.y + e.height - Math.random() * e.height }, vel: { x: (Math.random() - 0.5) * 2, y: -2 - Math.random() * 2 }, life: 18, color: Math.random() < 0.5 ? '#F97316' : '#FDE047', size: 4 + Math.random() * 5 });
      if (state.frame % 6 === 0) {
        e.health -= BURN_ENEMY;
        if (state.frame % 18 === 0) fx.spawnDamageNumber({ x: e.pos.x + 10, y: e.pos.y - 10 }, BURN_ENEMY * 3, false, '#F97316');
        if (e.health <= 0) fx.killWithAnimation(e, 'charred', 'flamethrower_kill', 'charred');
      }
    }
    // Smoke off it
    if (state.frame % 5 === 0) state.particles.push({ pos: { x: o.x1 + Math.random() * (o.x2 - o.x1), y: groundLineAt(state.groundRuns, o.x1) - 30 }, vel: { x: -0.3, y: -1.2 - Math.random() }, life: 50, color: 'rgba(28, 25, 23, 0.5)', size: 8 + Math.random() * 8 });
    if (o.burn === 0) { o.gone = true; o.back = POOL_BACK; syncOil(state, f); }
  }
  // Into the crude: a splash (he's done for; the fall off the bottom of the screen does it)
  const pit = pitAt(p.pos.x + p.width / 2);
  if (pit && p.pos.y + p.height > pit.surface && state.frame - f.splashAt > 60) {
    f.splashAt = state.frame;
    playSound('splash');
    for (let i = 0; i < 20; i++) state.particles.push({ pos: { x: p.pos.x + p.width / 2, y: pit.surface }, vel: { x: (Math.random() - 0.5) * 7, y: -2 - Math.random() * 7 }, life: 36, color: i % 2 ? '#0C0A09' : '#292524', size: 4 + Math.random() * 5 });
  }
};

/** The moving derricks: the platforms along to where they are now, and whoever's stood on one along with it. */
const updateMovers = (ctx: FrameContext, f: Field) => {
  const { state } = ctx;
  const p = state.player;
  f.movers.forEach((m, i) => {
    const blk = state.blocks.find(b => b.tag === `omover-${i}`);
    if (!blk) return;
    const at = moverAt(m, state.frame), dx = at.x - blk.x, dy = at.y - blk.y;
    const on = (o: { pos: { x: number; y: number }; width: number; height: number }) => Math.abs(o.pos.y + o.height - blk.y) < 6 && o.pos.x + o.width > blk.x && o.pos.x < blk.x + blk.w;
    if (p.isGrounded && on(p)) { p.pos.x += dx; p.pos.y += dy; }
    // (anything stood on it goes with it too: a goon riding it along, up or down; not one that's jumped or been knocked off it)
    for (const e of state.enemies) if (e.health > 0 && !e.isBlownAway && e.enemyType !== 'flyer' && e.vel.y > -1 && on(e)) { e.pos.x += dx; e.pos.y += dy; }
    blk.x = at.x; blk.y = at.y; m.bx = at.x; m.by = at.y;
  });
};

/**
 * The vents: bubbling, then a column of oil going up out of the ground (anything in it knocked flying, and hurt). Fire
 * on a vent (his flamethrower, a slick burning over it, a gas line's fire reaching it) lights it: the next column's
 * fire, and worse; after that, it's oil again till it's lit again.
 */
const updateGeysers = (ctx: FrameContext, f: Field, jetsOn: Jet[]) => {
  const { state, fx } = ctx;
  const p = state.player;
  for (const g of f.geysers) {
    const onScreen = g.x + 40 > state.camera.x && g.x - 40 < state.camera.x + CANVAS_WIDTH;
    if (onScreen && g.seen < 0) g.seen = state.frame;
    if (!onScreen && (g.x < state.camera.x - 700 || g.x > state.camera.x + CANVAS_WIDTH + 700)) { g.seen = -1; g.lit = false; }
    if (g.seen < 0) continue;
    const erupting = geyserErupting(g, state.frame);
    // Lit: a flame at the vent (not while it's going: it's lit for the next one)
    if (!g.lit && !erupting) {
      const vent = { x: g.x - 26, y: g.y - 40, w: 52, h: 40 };
      const byHim = state.flameSegments.some(s => Math.abs(s.x - g.x) < 34 && s.y > g.y - 80);
      const byJet = jetsOn.some(j => rectsOverlap(jetBox(j), vent));
      const byOil = f.oil.some(o => o.burn > 0 && g.x > o.x1 - 10 && g.x < o.x2 + 10);
      if (byHim || byJet || byOil) {
        g.lit = true;
        playSound('ignite');
        fx.spawnExplosion({ x: g.x, y: g.y - 10 }, '#F97316', 10, 0, 6);
        if (byHim) fx.spawnDamageNumber({ x: g.x - 30, y: g.y - 70 }, 'LIT IT!', true, '#F97316');
      }
    }
    // Bubbling, the ground shaking under it, before it goes
    if (geyserWarning(g, state.frame)) {
      if (state.frame % 4 === 0) state.particles.push({ pos: { x: g.x + (Math.random() - 0.5) * 30, y: g.y - 2 }, vel: { x: (Math.random() - 0.5) * 1.5, y: -1 - Math.random() * 2.5 }, life: 16, color: g.lit ? (Math.random() < 0.5 ? '#F97316' : '#FDE047') : (Math.random() < 0.5 ? '#0C0A09' : '#44403C'), size: 3 + Math.random() * 4 });
      if (state.frame % 16 === 0 && onScreen) playSound('splat', 0.35, -8);
    }
    if (!erupting) continue;
    const k = geyserCycle(g, state.frame);
    if (k === 0) {
      playSound(g.lit ? 'ignite' : 'splash'); if (g.lit) playSound('boom', 0.6, 4);
      if (onScreen) { state.screenShakeTimer = Math.max(state.screenShakeTimer, 8); }
    }
    const box = geyserBox(g, state.frame);
    // (spray off the top of it: oil, or fire and smoke)
    if (state.frame % 2 === 0) state.particles.push({ pos: { x: g.x + (Math.random() - 0.5) * 30, y: box.y + 10 }, vel: { x: (Math.random() - 0.5) * 6, y: -2 - Math.random() * 4 }, life: 26, color: g.lit ? ['#FDE047', '#F97316', '#DC2626', '#1C1917'][Math.floor(Math.random() * 4)] : (Math.random() < 0.6 ? '#0C0A09' : '#57534E'), size: 4 + Math.random() * 6 });
    // Him, in it: knocked flying, and hurt (once a go)
    if (g.hitOn !== state.frame - k && rectsOverlap(boundsOf(p), box) && p.invincibilityTimer <= 0 && !p.inCutscene && state.deathTimer <= 0) {
      g.hitOn = state.frame - k;
      const away = p.pos.x + p.width / 2 < g.x ? -1 : 1;
      hurtPlayer(ctx, g.lit ? FIRE_GEYSER_DAMAGE : GEYSER_DAMAGE, g.lit ? 'fire_geyser' : 'oil_geyser', { x: away * 4, y: g.lit ? -19 : -18 });
      fx.spawnDamageNumber({ x: p.pos.x - 10, y: p.pos.y - 30 }, g.lit ? 'FLAME-BROILED!' : 'GUSHER!', true, g.lit ? '#F97316' : '#A8A29E');
    }
    // Them, in it: thrown up and knocked about by the oil; the fire finishes them
    for (const e of state.enemies) {
      if (e.health <= 0 || e.isBlownAway || e.type === 'boss' || !rectsOverlap(boundsOf(e), box) || (e.hazardHitAt ?? -1e9) >= state.frame - k) continue;
      e.hazardHitAt = state.frame;
      if (g.lit) { if (!oiledIntoFire(ctx, e)) { e.health = 0; fx.killWithAnimation(e, 'charred', 'flamethrower_kill', 'charred'); } continue; }
      e.health -= 30;
      fx.spawnDamageNumber(e.pos, 30);
      if (e.health <= 0) { fx.blowAwayEnemy(e, { x: (Math.random() - 0.5) * 6, y: -20 }, 'oil_kill', 0); continue; }
      e.vel.y = -16; e.vel.x = (e.pos.x + e.width / 2 < g.x ? -1 : 1) * 3; e.pauseTimer = 40;
    }
    // (out of fire when it's done: it's oil again till it's lit again)
    if (k === GEYSER_ERUPT - 1) g.lit = false;
  }
};

/** He's gone into a pit of crude. */
export const inCrude = (state: GameState) => {
  const p = state.player;
  const pit = pitAt(p.pos.x + p.width / 2);
  return !!pit && p.pos.y + p.height > pit.surface - 4;
};

/** How far a slick's burned (for drawing the fire on it): 0 not lit, rising to 1 as it takes, falling off as it burns out. */
export const burnLevel = (o: Slick) => (o.burn <= 0 ? 0 : Math.min(1, ((o.kind === 'tar' ? TAR_BURN_FRAMES : BURN_FRAMES) - o.burn) / 20, o.burn / 40));
