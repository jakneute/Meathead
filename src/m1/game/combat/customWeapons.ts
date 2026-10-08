// Weapons a game brings of its own (Meathead 2's, from its lands), plugged into the engine without the engine knowing
// them: how one fires, how its shots move and hit, how they're drawn, and how it looks in his hand. Meathead 1 has
// none (its weapons are written into weapons.ts, projectiles.ts and the renderers). A shot of one carries `custom`: the
// weapon it came from.

import type { Projectile, WeaponType } from '../../types';
import type { FrameContext } from '../core/context';
import type { GameState } from '../core/state';
import type { WeaponInput } from './weapons';

export interface CustomWeapon {
  /** Fire it (fire's held, it's off cooldown, there's ammo): add its shot(s), set his cooldown, use the ammo. */
  fire: (ctx: FrameContext, input: WeaponInput, muzzle: { x: number; y: number }) => void;
  /** Move one of its shots and resolve what it hits. False to remove it. */
  update: (ctx: FrameContext, p: Projectile) => boolean;
  /** Draw one of its shots (in world space). */
  draw: (ctx: CanvasRenderingContext2D, p: Projectile, frame: number) => void;
  /** Draw it in his fist (local space: the grip at the origin, the business end out along +x). */
  drawHeld: (ctx: CanvasRenderingContext2D, frame: number) => void;
  /**
   * Every frame he's in play, whether it's the one he's holding or not (`equipped`): for what keeps going after a
   * press (a spray), what's pressed besides fire (secondary), and what wears off.
   */
  tick?: (ctx: FrameContext, input: WeaponInput & { secondary?: boolean }, equipped: boolean) => void;
  /** Drawn over the enemies, in world space, every frame (meters on them, things in the air). */
  drawOverlay?: (ctx: CanvasRenderingContext2D, state: GameState) => void;
}

const weapons = new Map<string, CustomWeapon>();
export const registerWeapon = (type: WeaponType, w: CustomWeapon) => { weapons.set(type, w); };
export const customWeapon = (type: string | undefined) => (type ? weapons.get(type) : undefined);
export const customWeapons = () => weapons.entries();
