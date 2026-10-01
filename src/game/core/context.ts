import { Enemy, VulgarityType, WeaponType } from '../../types';
import { GameState } from './state';
import { createFx, Fx } from './effects';
import { BossHelpers, createBossHelpers } from '../bosses/registry';

export interface Cheats {
  invincible: boolean;
  infiniteAmmo: boolean;
  infinitePower: boolean;
  skipToBoss: boolean;
}

/** Callbacks from the simulation back up to React. */
export interface GameEvents {
  /** `corpseWeapon` is set when he died to his weakness (and left a wrecked corpse behind). */
  onBossDefeated: (stageId: string, corpseWeapon?: WeaponType) => void;
  onBossTransition: () => void;
  onBossEncounter: () => void;
  onBossDeath: () => void;
  onIntroComplete: () => void;
  /** A stage that isn't a boss's (the gym) has played out to its end. */
  onStageDone?: () => void;
  /** The gym's lesson for the room he's in (a button prompt over the game), or null for none. */
  onTutorialHint?: (lesson: string | null) => void;
}

/** Everything a simulation step needs, bundled so subsystems don't need long parameter lists. */
export interface FrameContext {
  state: GameState;
  stageId: string | null;
  currentWeapon: WeaponType;
  cheats: Cheats;
  events: GameEvents;
  fx: Fx;
  bossHelpers: BossHelpers;
}

export const createFrameContext = (
  state: GameState,
  stageId: string | null,
  currentWeapon: WeaponType,
  cheats: Cheats,
  events: GameEvents,
): FrameContext => {
  const fx = createFx(state);
  return {
    state, stageId, currentWeapon, cheats, events, fx,
    bossHelpers: createBossHelpers(state, fx, events.onBossDeath, stageId, currentWeapon),
  };
};

export const killBoss = (ctx: FrameContext, boss: Enemy, facing: number, wasWeakness: boolean, weapon: WeaponType = ctx.currentWeapon, killLine?: VulgarityType) =>
  ctx.bossHelpers.killBoss(boss, facing, wasWeakness, weapon, killLine);
