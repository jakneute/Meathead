// The oil field's hazards. Oil on the ground in two kinds: a slick (you slide
// about on it: the engine's player movement reads state.groundOil) and tar
// (it holds your feet: slow going, no jump to speak of; a shoulder charge gets
// you out). Put a flame to a slick and it goes up: a sheet of fire along it
// for a while (it hurts him, and it burns anything he's put in it), and then
// the oil's burned off. And the pits of crude: fall in one and that's it.

import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import { groundLineAt } from '../../core/terrain';
import { hurtPlayer } from '../../bosses/shared';
import { playSound } from '../../platform/audio';
import { COURSE, OilPatch, Jet, pitAt } from './course';
import { rectsOverlap, boundsOf } from '../../core/utils';

/** A patch of oil: burning (frames left of it), whether it's burned off, and (if it pools back) how long till it has. */
export interface Slick extends OilPatch { burn: number; gone: boolean; back: number }

export interface Field {
  oil: Slick[];
  /** Splashes where something went into the crude. */
  splashAt: number;
}

/** How long a lit slick burns, how often it hurts him (and how much), how hard it burns what's in it. */
const BURN_FRAMES = 330, BURN_EVERY = 28, BURN_DAMAGE = 7, BURN_ENEMY = 5;
/** Tar burns longer. Oil that pools back takes this long to. */
const TAR_BURN_FRAMES = 480, POOL_BACK = 300;
/** A jet of fire: how long it hisses and sparks before it goes, how much it hurts. */
const JET_WARN = 36, JET_DAMAGE = 12;

/** Is a jet going right now (and is it about to)? */
export const jetOn = (j: Jet, frame: number) => (frame + j.phase) % j.period < j.on;
export const jetWarning = (j: Jet, frame: number) => { const t = (frame + j.phase) % j.period; return t >= j.period - JET_WARN; };
/** The box its flame fills. */
export const jetBox = (j: Jet) => (j.dir === 'up' ? { x: j.x - 16, y: j.y - j.len, w: 32, h: j.len } : j.dir === 'right' ? { x: j.x, y: j.y - 34, w: j.len, h: 34 } : { x: j.x - j.len, y: j.y - 34, w: j.len, h: 34 });

export const createField = (state: GameState): Field => {
  const f: Field = { oil: COURSE.oil.map(o => ({ ...o, burn: 0, gone: false, back: 0 })), splashAt: -999 };
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
  for (const j of COURSE.jets) {
    if (Math.abs(j.x - p.pos.x) > 1400) continue;
    if (jetWarning(j, state.frame) && state.frame % 3 === 0) state.particles.push({ pos: { x: j.x, y: j.y - 4 }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 3 }, life: 12, color: Math.random() < 0.5 ? '#FDE047' : '#F8FAFC', size: 2 + Math.random() * 2 });
    if (!jetOn(j, state.frame)) continue;
    jetsOn.push(j);
    const box = jetBox(j);
    if (state.frame % 20 === 0 && rectsOverlap(boundsOf(p), box) && p.invincibilityTimer <= 0 && !p.inCutscene) hurtPlayer(ctx, JET_DAMAGE, 'gas_jet', { x: j.dir === 'left' ? -5 : j.dir === 'right' ? 5 : 0, y: -9 });
    for (const e of state.enemies) {
      if (e.health <= 0 || e.isBlownAway || e.type === 'boss' || state.frame % 8 !== 0 || !rectsOverlap(boundsOf(e), box)) continue;
      e.health -= 12;
      if (e.health <= 0) fx.killWithAnimation(e, 'charred', 'flamethrower_kill', 'charred');
    }
  }
  // A flame on oil lights it: his flamethrower (anywhere near the ground over it), or a jet reaching it
  for (const o of f.oil) {
    if (o.gone || o.burn > 0) continue;
    const byHim = state.flameSegments.some(s => s.x > o.x1 - 10 && s.x < o.x2 + 10 && s.y > groundLineAt(state.groundRuns, s.x) - 90);
    const byJet = jetsOn.some(j => { const b = jetBox(j); return b.x < o.x2 && b.x + b.w > o.x1 && b.y + b.h > groundLineAt(state.groundRuns, Math.max(o.x1, Math.min(o.x2, b.x + b.w / 2))) - 20; });
    if (byHim || byJet) {
      o.burn = o.kind === 'tar' ? TAR_BURN_FRAMES : BURN_FRAMES;
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
    if (cx > o.x1 && cx < o.x2 && p.pos.y + p.height > g - 30 && state.frame % BURN_EVERY === 0 && p.invincibilityTimer <= 0) hurtPlayer(ctx, BURN_DAMAGE, 'oil_fire', { x: 0, y: -7 });
    // ...and anything in it burns (it was him that lit it)
    for (const e of state.enemies) {
      if (e.health <= 0 || e.isBlownAway || e.type === 'boss') continue;
      const ex = e.pos.x + e.width / 2;
      if (ex < o.x1 || ex > o.x2 || e.pos.y + e.height < groundLineAt(state.groundRuns, ex) - 30) continue;
      if (state.frame % 8 === 0) {
        e.health -= BURN_ENEMY;
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
    playSound('tsunami');
    for (let i = 0; i < 20; i++) state.particles.push({ pos: { x: p.pos.x + p.width / 2, y: pit.surface }, vel: { x: (Math.random() - 0.5) * 7, y: -2 - Math.random() * 7 }, life: 36, color: i % 2 ? '#0C0A09' : '#292524', size: 4 + Math.random() * 5 });
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
