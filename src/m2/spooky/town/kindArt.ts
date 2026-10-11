// The town's enemies, drawn: the wildlife (critters.ts) and the park's staff in their costumes (wardrobe.ts, on the
// one person drawer that dresses every costumed enemy in Spooky Land: costume.ts). Feet at the origin, facing right
// (the engine mirrors them). Who's under the costume (skin, hair, build, man or woman) is by seed (lookOf), and it
// shows at the face hole and the hands.

import type { Enemy } from '../../../m1/types';
import { moodOf, type Pose } from '../costume';
import { drawBatArt, drawCrowArt, drawRatArt, drawCatArt } from '../critters';
import {
  drawGhostCostume, drawWolfCostume, drawMonsterCostume, drawBroomWitch, drawSkeletonCostume, drawPumpkinCostume,
  potion, bone,
} from '../wardrobe';

type Ctx = CanvasRenderingContext2D;

// ---------------------------------------------------------------------------------------------------------------
// Wildlife

export const drawBat = (c: Ctx, e: Enemy, f: number) => drawBatArt(c, e, f);
export const drawCrow = (c: Ctx, e: Enemy, f: number) => drawCrowArt(c, e, f);
export const drawRat = (c: Ctx, e: Enemy, f: number) => drawRatArt(c, e, f);
export const drawCat = (c: Ctx, e: Enemy, f: number) => drawCatArt(c, e, f);

// ---------------------------------------------------------------------------------------------------------------
// People in costumes

const moving = (e: Enemy, min = 0.3): Pose => (Math.abs(e.vel.x) > min ? 'walk' : 'stand');

export const drawGhost = (c: Ctx, e: Enemy, f: number, seed: number) =>
  drawGhostCostume(c, { seed, f, md: moodOf(e), pose: e.aiState === 'boo' ? 'tell' : e.aiState === 'lunge' ? 'strike' : moving(e) });

export const drawWolfman = (c: Ctx, e: Enemy, f: number, seed: number) =>
  drawWolfCostume(c, { seed, f, md: moodOf(e), pose: e.aiState === 'howl' ? 'tell' : e.aiState === 'rush' ? 'strike' : moving(e) });

export const drawMonster = (c: Ctx, e: Enemy, f: number, seed: number) =>
  drawMonsterCostume(c, { seed, f, md: moodOf(e), pose: e.aiState === 'raise' ? 'tell' : e.aiState === 'smash' ? 'strike' : moving(e) });

export const drawWitch = (c: Ctx, e: Enemy, f: number, seed: number) =>
  drawBroomWitch(c, { seed, f, md: moodOf(e), pose: e.aiState === 'cackle' ? 'tell' : 'stand' });

export const drawSkeleton = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const up = e.isShieldActive !== false && e.aiState !== 'throw';
  drawSkeletonCostume(c, { seed, f, md: moodOf(e), pose: up ? moving(e, 0.2) : 'tell', t: up ? 0 : (e.aiTimer || 0) / 28 }, 'tomb', up);
};

export const drawPumpkinHead = (c: Ctx, e: Enemy, f: number, seed: number) =>
  drawPumpkinCostume(c, { seed, f, md: moodOf(e), pose: e.aiState === 'heave' ? 'tell' : 'stand' });

// ---------------------------------------------------------------------------------------------------------------
// What they throw (at the origin, turned by the caller)

export const drawPotion = (c: Ctx) => potion(c, 0, 0);
export const drawBone = (c: Ctx) => bone(c);
