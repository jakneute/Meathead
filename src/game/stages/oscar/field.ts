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
import { COURSE, OilPatch, pitAt } from './course';

/** A slick of oil: burning (frames left of it), and whether it's burned off. */
export interface Slick extends OilPatch { burn: number; gone: boolean }

export interface Field {
  oil: Slick[];
  /** Splashes where something went into the crude. */
  splashAt: number;
}

/** How long a lit slick burns, how often it hurts him (and how much), how hard it burns what's in it. */
const BURN_FRAMES = 330, BURN_EVERY = 28, BURN_DAMAGE = 7, BURN_ENEMY = 5;

export const createField = (state: GameState): Field => {
  const f: Field = { oil: COURSE.oil.map(o => ({ ...o, burn: 0, gone: false })), splashAt: -999 };
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
  // A flame on a slick lights it
  for (const o of f.oil) {
    if (o.kind !== 'slick' || o.gone || o.burn > 0) continue;
    const lit = state.flameSegments.some(s => s.x > o.x1 && s.x < o.x2 && Math.abs(s.y - groundLineAt(state.groundRuns, s.x)) < 40);
    if (lit) { o.burn = BURN_FRAMES; playSound('ignite'); fx.spawnDamageNumber({ x: (o.x1 + o.x2) / 2 - 30, y: groundLineAt(state.groundRuns, o.x1) - 60 }, 'IT WENT UP!', true, '#F97316'); }
  }
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
    if (o.burn === 0) { o.gone = true; syncOil(state, f); }
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
export const burnLevel = (o: Slick) => (o.burn <= 0 ? 0 : Math.min(1, (BURN_FRAMES - o.burn) / 20, o.burn / 40));
