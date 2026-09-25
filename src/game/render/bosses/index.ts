// Boss sprites (all procedural canvas art), one file per boss.

import { Enemy } from '../../../types';
import { drawArtie } from './artie';
import { drawVictor } from './victor';
import { drawErnie } from './ernie';
import { drawHector } from './hector';
import { drawDale, drawDaleDrugs } from './dale';
import { drawBarry, drawBarryTolerance } from './barry';
import { drawTommy } from './tommy';
import { drawOscar } from './oscar';
import { drawOscarGear } from '../oscarRenderer';
import { drawDaleTruck } from '../daleTruck';
import { drawErnieHeldBoulder } from '../boulders';
import { drawIceEncasing } from '../artieIce';

type Draw = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => void;

interface BossSprite {
  /** His body, in local space (0,0 = his top-left corner, already rotated). */
  body: Draw;
  /** Extras in world space, drawn right after the body. */
  gear?: Draw;
  /** Extras in world space, drawn on top of his speech. */
  overlay?: Draw;
}

const BOSS_SPRITES: Record<string, BossSprite> = {
  'Artie Avalanche': { body: drawArtie },
  'Victor Volcano': { body: drawVictor },
  'Ernie Earthquake': { body: drawErnie, gear: (ctx, e, f) => { drawErnieHeldBoulder(ctx, e, f); drawIceEncasing(ctx, e, f); } },
  'Hector Hurricane': { body: drawHector },
  'Drug Trade Dale': { body: drawDale, gear: drawDaleTruck, overlay: drawDaleDrugs },
  'Blackout Barry': { body: drawBarry, overlay: drawBarryTolerance },
  'Toxic Tommy': { body: drawTommy },
  'Oily Oscar': { body: drawOscar, gear: drawOscarGear },
};

/** How each boss poses when drawn outside a fight (portraits, corpses): a calm, fully-visible state. */
const POSES: Record<string, Partial<Enemy>> = {
  'Toxic Tommy': { bossState: 'emerge_shatter' },
  'Oily Oscar': { hasCigarette: true, oscarFacing: 1 },
};

/** A stand-in boss at (0,0) for drawing the sprite on its own. */
export const makeSitter = (id: string): Enemy => ({
  id: 'boss', pos: { x: 0, y: 0 }, vel: { x: 0, y: 0 }, width: 80, height: 80, health: 666, maxHealth: 666,
  type: 'boss', enemyType: 'tank', behavior: 'shoot', patrolRange: 0, initialX: 0, shootTimer: 0,
  bossState: 'idle', stateTimer: 60, ...POSES[id],
});

export const drawBoss = (ctx: CanvasRenderingContext2D, e: Enemy, id: string | null, frame: number) => {
  const sprite = id ? BOSS_SPRITES[id] : undefined;
  const { pos, width, height } = e;
  ctx.save();
  ctx.translate(pos.x, pos.y);
  if (e.rotation) { ctx.translate(width / 2, height / 2); ctx.rotate(e.rotation); ctx.translate(-width / 2, -height / 2); }
  if (sprite) sprite.body(ctx, e, frame);
  else { ctx.fillStyle = 'yellow'; ctx.fillRect(0, 0, width, height); }
  ctx.restore();
  sprite?.gear?.(ctx, e, frame);
};

export const drawBossOverlay = (ctx: CanvasRenderingContext2D, e: Enemy, id: string | null, frame: number) => {
  if (id) BOSS_SPRITES[id]?.overlay?.(ctx, e, frame);
};
