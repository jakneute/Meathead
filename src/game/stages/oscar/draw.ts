// Oscar's stage, drawn: which part's in view decides what's behind (the oil
// field under the usual refinery sky; on the chase and behind the field office,
// that sky thick with the smoke of everything he's set alight), what's in the
// middle (the ground, the oil, the break room, the road and its derricks, the
// field office), and what's in front (fire, the gas, speech); then the screen's
// own things (the count on the chase, the fades).

import type { GameState } from '../../core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, ARENA_LEFT } from '../../../constants';
import { drawBackdrop } from '../../render/backdrops';
import { hazeBands } from '../../render/pixelArt';
import { COURSE, placeOf } from './course';
import { getOscar, fadeAmount, OscarRuntime } from './runtime';
import { drawDirt, drawOil, drawOilFire, drawPits, drawLedges, drawProps, drawJetPipes, drawJetFire } from './fieldDraw';
import { drawBunkerBack, drawBunkerMid, drawBunkerFront } from './bunkerDraw';
import { drawYardCamp, drawMovers, drawGeyserVents, drawGeyserColumns } from './yardDraw';
import { drawChaseBack, drawChaseThrown, drawRiddenMoto, drawChaseHud, drawFarField, drawChaseWarnings } from './chaseDraw';
import { drawEndBack, drawEndMid, drawEndFront } from './endDraw';
import { drawBarBack, drawBarMid, drawBarFront } from './barDraw';
import { inPipes } from './swirly';
import { drawSwirlyPipes } from './swirlyDraw';
import { saying, drawBubble, Speaker } from './script';

type Ctx = CanvasRenderingContext2D;

const view = (state: GameState) => placeOf(state.camera.x + CANVAS_WIDTH / 2);

/** How much of the field's burning (0..1): the sky goes over to smoke. */
const devastation = (state: GameState, rt: OscarRuntime) => {
  const place = view(state);
  if (place === 'end') return 1;
  if (place !== 'chase') return 0;
  return rt.chase.far.filter(f => f.state === 'blowing' || f.state === 'burning').length / rt.chase.far.length;
};

export const drawOscarBackdrop = (ctx: Ctx, state: GameState) => {
  if (state.camera.x + CANVAS_WIDTH / 2 > ARENA_LEFT - 100) return false;
  const rt = getOscar(state)!;
  const k = devastation(state, rt);
  const chasing = view(state) === 'chase';
  if (k <= 0 && !chasing) return false;
  drawBackdrop(ctx, 'Oily Oscar', state.camera.x, state.camera.y, state.frame || 0, k);
  // (on the chase: what's out across the field in the distance, and the wrecks careering into it)
  if (chasing) drawFarField(ctx, state, rt.chase);
  // The smoke: a pall coming down over the sky (the fires under it are the backdrop's own, stood on its ground)
  hazeBands(ctx, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#140E0C', 0.75 * k, 0.25 * k, 10);
  return true;
};

export const drawOscarBack = (ctx: Ctx, state: GameState) => {
  const rt = getOscar(state)!;
  const place = view(state);
  if (place === 'chase') { drawChaseBack(ctx, state, rt.chase); return; }
  if (place === 'end') { drawPits(ctx, state); drawProps(ctx, state); drawDirt(ctx, state); drawOil(ctx, state, rt.field); drawGeyserVents(ctx, state, rt.field); drawJetPipes(ctx, state); drawEndBack(ctx, state, rt.ending); drawBarBack(ctx, state, rt.bar); return; }
  drawYardCamp(ctx, state);
  drawPits(ctx, state);
  drawProps(ctx, state);
  drawDirt(ctx, state);
  drawOil(ctx, state, rt.field);
  drawGeyserVents(ctx, state, rt.field);
  drawBunkerBack(ctx, state, rt.bunker);
};

export const drawOscarMid = (ctx: Ctx, state: GameState) => {
  const rt = getOscar(state)!;
  const place = view(state);
  if (place === 'chase') drawChaseThrown(ctx, state, rt.chase);
  else if (place === 'end') { drawLedges(ctx, state); drawMovers(ctx, state, rt.field); drawEndMid(ctx, state, rt.ending); drawBarMid(ctx, state, rt.bar); }
  else { drawLedges(ctx, state); drawMovers(ctx, state, rt.field); drawBunkerMid(ctx, state, rt.bunker); }
  drawRiddenMoto(ctx, state, place === 'chase' ? rt.chase : null);
};

export const drawOscarFront = (ctx: Ctx, state: GameState) => {
  const rt = getOscar(state)!;
  const place = view(state);
  if (place !== 'chase' && place !== 'end') { drawOilFire(ctx, state, rt.field); drawBunkerFront(ctx, state, rt.bunker); }
  if (place === 'end') { drawOilFire(ctx, state, rt.field); drawEndFront(ctx, state, rt.ending); drawBarFront(ctx, state, rt.bar); }
  if (place !== 'chase') { drawJetFire(ctx, state, rt.field); drawGeyserColumns(ctx, state, rt.field); }
  drawSpeech(ctx, state, rt);
};

/** Everybody else's lines, over them (his go up in his own bubble). */
const drawSpeech = (ctx: Ctx, state: GameState, rt: OscarRuntime) => {
  const b = rt.bunker, w = b.workers;
  const workerAt = (i: number) => ({ x: w[i].state === 'gone' ? w[i].x - w[i].t * 1.8 : w[i].x, y: GROUND_Y - 96 });
  const at: Partial<Record<Speaker, { x: number; y: number }>> = {
    worker: workerAt(1),
    foreman: workerAt(3),
    biker: rt.bar.phase === 'drinks' || rt.bar.phase === 'waiting' && view(state) === 'end' ? { x: rt.bar.bikers[2].x, y: GROUND_Y - 100 } : { x: b.bikers[1].x, y: GROUND_Y - 96 },
    dan: rt.bar.phase === 'drinks' || rt.bar.phase === 'waiting' && view(state) === 'end' ? { x: rt.bar.bikers[5].x, y: GROUND_Y - 100 } : { x: b.bikers[0].x, y: GROUND_Y - 100 },
    smokerA: { x: COURSE.end.smokers - 34, y: GROUND_Y - 88 },
    smokerB: { x: COURSE.end.smokers + 12, y: GROUND_Y - 88 },
  };
  for (const who of Object.keys(at) as Speaker[]) {
    const text = saying(rt.talk, who);
    if (text) drawBubble(ctx, at[who]!.x, at[who]!.y, text, '#FEF9C3');
  }
};

export const drawOscarHud = (ctx: Ctx, state: GameState) => {
  const rt = getOscar(state)!;
  drawChaseHud(ctx, rt.chase);
  drawChaseWarnings(ctx, state, rt.chase);
  // Flushed: the pipes under the bar, over everything while it plays
  if (inPipes(state, rt.bar)) drawSwirlyPipes(ctx, state, state.deathScene!.t);
};

/** The fades between the parts. */
export const drawOscarOverlays = (ctx: Ctx, state: GameState) => {
  const rt = getOscar(state)!;
  const k = fadeAmount(rt);
  if (k > 0) { ctx.fillStyle = `rgba(0,0,0,${k})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  return false;
};
