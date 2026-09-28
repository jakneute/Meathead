// Oscar's stage, drawn: which part's in view decides what's behind (the oil
// field under the usual refinery sky; on the chase and behind the field office,
// that sky thick with the smoke of everything he's set alight), what's in the
// middle (the ground, the oil, the break room, the road and its derricks, the
// field office), and what's in front (fire, the gas, speech); then the screen's
// own things (the count on the chase, the fades).

import type { GameState } from '../../core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, ARENA_LEFT } from '../../../constants';
import { drawBackdrop } from '../../render/backdrops';
import { COURSE, placeOf } from './course';
import { getOscar, fadeAmount, OscarRuntime } from './runtime';
import { drawDirt, drawOil, drawOilFire, drawPits, drawLedges, drawProps, drawJetPipes, drawJetFire } from './fieldDraw';
import { drawBunkerBack, drawBunkerMid, drawBunkerFront } from './bunkerDraw';
import { drawChaseBack, drawChaseThrown, drawRiddenMoto, drawChaseHud, drawFarField, drawChaseWarnings } from './chaseDraw';
import { drawEndBack, drawEndMid, drawEndFront } from './endDraw';
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
  drawBackdrop(ctx, 'Oily Oscar', state.camera.x, state.camera.y, state.frame || 0);
  // (on the chase: what's out across the field in the distance, and the wrecks careering into it)
  if (chasing) drawFarField(ctx, state, rt.chase);
  // The smoke: a pall coming down over the sky, fires along the horizon under it
  const g = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  g.addColorStop(0, `rgba(20, 14, 12, ${0.75 * k})`); g.addColorStop(0.6, `rgba(60, 30, 18, ${0.5 * k})`); g.addColorStop(1, `rgba(120, 50, 20, ${0.3 * k})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const fires = Math.round(3 + k * 9);
  for (let i = 0; i < fires; i++) {
    const x = ((i * 173 - state.camera.x * 0.3) % (CANVAS_WIDTH + 200) + CANVAS_WIDTH + 200) % (CANVAS_WIDTH + 200) - 100;
    const h = 40 + Math.sin(state.frame * 0.1 + i) * 10 + (i % 3) * 20;
    const base = 420 - (i % 4) * 12;
    const fg = ctx.createRadialGradient(x, base, 4, x, base, h * 1.6);
    fg.addColorStop(0, `rgba(253, 186, 116, ${0.7 * k})`); fg.addColorStop(1, 'rgba(249, 115, 22, 0)');
    ctx.fillStyle = fg; ctx.fillRect(x - h * 1.6, base - h * 1.6, h * 3.2, h * 3.2);
    ctx.fillStyle = `rgba(28, 25, 23, ${0.6 * k})`;
    for (let s = 0; s < 3; s++) { const q = ((state.frame * 0.5 + s * 40 + i * 17) % 120) / 120; ctx.beginPath(); ctx.arc(x + q * 30, base - h - q * 240, 16 + q * 40, 0, Math.PI * 2); ctx.fill(); }
  }
  return true;
};

export const drawOscarBack = (ctx: Ctx, state: GameState) => {
  const rt = getOscar(state)!;
  const place = view(state);
  if (place === 'chase') { drawChaseBack(ctx, state, rt.chase); return; }
  if (place === 'end') { drawPits(ctx, state); drawProps(ctx, state); drawDirt(ctx, state); drawOil(ctx, state, rt.field); drawJetPipes(ctx, state); drawEndBack(ctx, state, rt.ending); return; }
  drawPits(ctx, state);
  drawProps(ctx, state);
  drawDirt(ctx, state);
  drawOil(ctx, state, rt.field);
  drawBunkerBack(ctx, state, rt.bunker);
};

export const drawOscarMid = (ctx: Ctx, state: GameState) => {
  const rt = getOscar(state)!;
  const place = view(state);
  if (place === 'chase') drawChaseThrown(ctx, state, rt.chase);
  else if (place === 'end') { drawLedges(ctx, state); drawEndMid(ctx, state, rt.ending); }
  else { drawLedges(ctx, state); drawBunkerMid(ctx, state, rt.bunker); }
  drawRiddenMoto(ctx, state, place === 'chase' ? rt.chase : null);
};

export const drawOscarFront = (ctx: Ctx, state: GameState) => {
  const rt = getOscar(state)!;
  const place = view(state);
  if (place !== 'chase' && place !== 'end') { drawOilFire(ctx, state, rt.field); drawBunkerFront(ctx, state, rt.bunker); }
  if (place === 'end') { drawOilFire(ctx, state, rt.field); drawEndFront(ctx, state, rt.ending); }
  if (place !== 'chase') drawJetFire(ctx, state);
  drawSpeech(ctx, state, rt);
};

/** Everybody else's lines, over them (his go up in his own bubble). */
const drawSpeech = (ctx: Ctx, state: GameState, rt: OscarRuntime) => {
  const b = rt.bunker, w = b.workers;
  const workerAt = (i: number) => ({ x: w[i].state === 'gone' ? w[i].x - w[i].t * 1.8 : w[i].x, y: GROUND_Y - 96 });
  const at: Partial<Record<Speaker, { x: number; y: number }>> = {
    worker: workerAt(1),
    foreman: workerAt(3),
    biker: { x: b.bikers[1].x, y: GROUND_Y - 96 },
    dan: { x: b.bikers[0].x, y: GROUND_Y - 100 },
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
};

/** The fades between the parts. */
export const drawOscarOverlays = (ctx: Ctx, state: GameState) => {
  const rt = getOscar(state)!;
  const k = fadeAmount(rt);
  if (k > 0) { ctx.fillStyle = `rgba(0,0,0,${k})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  return false;
};
