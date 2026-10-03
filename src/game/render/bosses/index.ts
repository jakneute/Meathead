// Boss sprites (all procedural canvas art), one file per boss.

import { drawVictorBarf } from './victorBarf';
import { Enemy } from '../../../types';
import { drawArtie } from './artie';
import { drawVictor } from './victor';
import { drawErnie } from './ernie';
import { drawHector, drawHectorVortex, drawHectorStorm } from './hector';
import { drawDale, drawDaleDrugs, daleFx } from './dale';
import { drawBarry, drawBarryTolerance, drawBarryStorm, barryFx } from './barry';
import { drawTommy, tommyFx } from './tommy';
import { drawOscar } from './oscar';
import { drawOscarGear } from './oscarGear';
import { drawDaleTruck } from './daleTruck';
import { drawErnieHeldBoulder } from './boulders';
import { drawIceEncasing } from './artieIce';
import { drawComposited, needsComposite } from '../composite';
import { drawAlien, drawAlienGear } from './alien';

type Draw = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => void;

interface BossSprite {
  /** His body, in local space (0,0 = his top-left corner, already rotated). */
  body: Draw;
  /** Extras in world space, drawn right after the body. */
  gear?: Draw;
  /** How far round him the gear reaches, when it's all close by (so it can be put down in one go under a filter too). */
  gearReach?: number;
  /** Extras in world space, drawn on top of his speech. */
  overlay?: Draw;
  /** A filter, glow or fade over the whole of him this frame (applied once to the finished sprite, not shape by shape). */
  post?: (e: Enemy, frame: number) => PostFx | null;
}
type PostFx = { filter?: string; shadowColor?: string; shadowBlur?: number; alpha?: number };

/** Room round his 80x80 box that his sprite can reach into (arms out, an ice block overhead, a geyser or a kite string under him). */
const PAD = { l: 60, r: 60, t: 90, b: 150 };

const BOSS_SPRITES: Record<string, BossSprite> = {
  'Artie Avalanche': { body: drawArtie },
  'Victor Volcano': { body: drawVictor, gear: drawVictorBarf },
  'Ernie Earthquake': { body: drawErnie, gear: (ctx, e, f) => { drawErnieHeldBoulder(ctx, e, f); drawIceEncasing(ctx, e, f); }, gearReach: 90 },
  'Hector Hurricane': { body: drawHector, gear: (ctx, e, f) => { drawHectorVortex(ctx, e, f); drawHectorStorm(ctx, e, f); } },
  'Drug Trade Dale': { body: drawDale, gear: drawDaleTruck, overlay: drawDaleDrugs, post: daleFx },
  'Blackout Barry': { body: drawBarry, gear: drawBarryStorm, overlay: drawBarryTolerance, post: barryFx },
  'Toxic Tommy': { body: drawTommy, post: tommyFx },
  'Oily Oscar': { body: drawOscar, gear: drawOscarGear, gearReach: 170 },
  'Imposter Invasion': { body: drawAlien, gear: drawAlienGear, gearReach: 120 },
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
  const fx = sprite?.post?.(e, frame) ?? null;
  // (a filter or glow on him, from the fight or from outside (oil, needles, a fade): put down once, not per shape)
  if (sprite && (fx || needsComposite(ctx))) drawComposited(ctx, { x: -PAD.l, y: -PAD.t, w: width + PAD.l + PAD.r, h: height + PAD.t + PAD.b }, c => sprite.body(c, e, frame), fx);
  else if (sprite) sprite.body(ctx, e, frame);
  else { ctx.fillStyle = 'yellow'; ctx.fillRect(0, 0, width, height); }
  ctx.restore();
  const gear = sprite?.gear;
  if (gear && sprite.gearReach && needsComposite(ctx)) {
    const r = sprite.gearReach;
    drawComposited(ctx, { x: e.pos.x - r, y: e.pos.y - r, w: width + r * 2, h: height + r * 2 }, c => gear(c, e, frame));
  } else gear?.(ctx, e, frame);
};

export const drawBossOverlay = (ctx: CanvasRenderingContext2D, e: Enemy, id: string | null, frame: number) => {
  if (id) BOSS_SPRITES[id]?.overlay?.(ctx, e, frame);
};
