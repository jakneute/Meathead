import { Enemy, WeaponType } from '../types';
import { GameState } from './state';
import { createFx, Fx } from './effects';
import { BossHelpers, createBossHelpers } from './boss';

export interface Cheats {
  invincible: boolean;
  infiniteAmmo: boolean;
  infinitePower: boolean;
  skipToBoss: boolean;
}

/** Callbacks from the simulation back up to React. */
export interface GameEvents {
  onBossDefeated: (stageId: string) => void;
  onBossTransition: () => void;
  onBossEncounter: () => void;
  onBossDeath: () => void;
  onIntroComplete: () => void;
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

export const killBoss = (ctx: FrameContext, boss: Enemy, facing: number, wasWeakness: boolean, weapon: WeaponType = ctx.currentWeapon) =>
  ctx.bossHelpers.killBoss(boss, facing, wasWeakness, weapon);
