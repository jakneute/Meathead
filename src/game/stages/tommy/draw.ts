// Tommy's stage, drawn: which part's in view decides what's behind (the street
// and its sky, the sewer, the ruins), what's in the middle of it all (the junk,
// the bike, the scenes' people, the drips) and what's in front (the muck he's
// in, speech); then the screen's own things (the suit's gauge, what to do next,
// the thing's health, the cut scenes, the fades).

import type { GameState } from '../../core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y } from '../../../constants';
import { drawPlayer } from '../../render/player/player';
import { COURSE, placeOf } from './course';
import { getTommy, fadeAmount, TommyRuntime } from './runtime';
import { drawStreetSky, drawStreetGround, drawStreetFronts, drawJunk, drawCorner, drawRoadEnd, drawRiddenBike, drawTumble } from './streetDraw';
import { drawSewerBack, drawSewerGround, drawDrips, drawMuckFront, drawChunks } from './sewerDraw';
import { drawCutScene, drawRuinsGround, drawRuinsHouse, drawSuitMelt } from './escapeDraw';
import { drawThingBar, drawThing } from './thingDraw';
import { thingSpot, THING_SURFACE } from './thing';
import { inCutScene, dropFade } from './escape';
import { saying, drawBubble, Speaker } from './script';

type Ctx = CanvasRenderingContext2D;

const view = (state: GameState) => placeOf(state.camera.x + CANVAS_WIDTH / 2);

export const drawTommyBackdrop = (ctx: Ctx, state: GameState) => {
  const place = view(state);
  if (place === 'hood' || place === 'road') drawStreetSky(ctx, state);
  else if (place === 'ruins') drawStreetSky(ctx, state, 1, false);
  else { ctx.fillStyle = '#0C0A09'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  return true;
};

export const drawTommyBack = (ctx: Ctx, state: GameState) => {
  const rt = getTommy(state)!;
  const place = view(state);
  if (place === 'hood' || place === 'road') { drawStreetFronts(ctx, state); drawStreetGround(ctx, state); }
  else if (place === 'ruins') { drawRuinsGround(ctx, state); drawRuinsHouse(ctx, state); }
  else { drawSewerBack(ctx, state, rt); drawSewerGround(ctx, state); }
};

export const drawTommyMid = (ctx: Ctx, state: GameState) => {
  const rt = getTommy(state)!;
  const place = view(state);
  if (place === 'hood' || place === 'road') {
    drawJunk(ctx, state, rt.bike);
    drawCorner(ctx, state, rt);
    drawRoadEnd(ctx, state, rt);
    drawRiddenBike(ctx, state);
  } else if (place !== 'ruins') {
    drawDrips(ctx, state, rt);
    drawChunks(ctx, rt);
    if (rt.thing.e && rt.thing.phase !== 'dormant') drawThing(ctx, rt.thing.e, rt.thing, state);
  }
};

export const drawTommyFront = (ctx: Ctx, state: GameState) => {
  const rt = getTommy(state)!;
  const place = view(state);
  const p = state.player;
  // Him, end over end, off the bike and down the manhole
  drawTumble(ctx, state, rt, (x, y, rot) => {
    const body = { ...p, hidden: false, bike: false, jetski: false, skiing: false, isGrounded: false, vel: { x: 0, y: 6 }, pos: { x: x - p.width / 2, y: y - p.height / 2 } };
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.translate(-x, -y);
    drawPlayer(ctx, body, { ...state, deathTimer: 0 }, { currentWeapon: p.currentWeapon, showFilthShield: false, invincibilityEnabled: false });
    ctx.restore();
  });
  if (place !== 'hood' && place !== 'road' && place !== 'ruins') drawMuckFront(ctx, state);
  drawSuitMelt(ctx, state, rt);
  drawSpeech(ctx, state, rt);
};

/** Everybody else's lines, over them (his go up in his own bubble). */
const drawSpeech = (ctx: Ctx, state: GameState, rt: TommyRuntime) => {
  const H = COURSE.hood;
  const at: Partial<Record<Speaker, { x: number; y: number }>> = {
    crew: { x: H.corner, y: GROUND_Y - 84 },
    rider: { x: rt.bike.rider.x, y: rt.bike.rider.y - 84 },
    hazmat: { x: COURSE.road.hazmat, y: GROUND_Y - 92 },
    thing: { x: thingSpot().x - 60, y: THING_SURFACE - 400 },
  };
  for (const who of Object.keys(at) as Speaker[]) {
    const text = saying(rt.talk, who);
    if (text) drawBubble(ctx, at[who]!.x, at[who]!.y, text, who === 'thing' ? '#D9F99D' : '#FEF9C3');
  }
};

export const drawTommyHud = (ctx: Ctx, state: GameState) => {
  const rt = getTommy(state)!;
  // The suit's gauge
  if (rt.sewer.suitOn) {
    const k = rt.sewer.suit;
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(300, 70, 200, 20);
    ctx.fillStyle = '#44403C'; ctx.fillRect(304, 80, 192, 6);
    ctx.fillStyle = k > 0.25 || state.frame % 20 < 10 ? '#FACC15' : '#EF4444'; ctx.fillRect(304, 80, 192 * k, 6);
    ctx.fillStyle = '#FEF08A'; ctx.font = 'bold 6px "Press Start 2P"'; ctx.fillText('HAZMAT SUIT', 306, 77);
  }
  // What to do next, on the bike (never a button: what to do)
  const b = rt.bike;
  if (b.hintT > 0 && b.hint) {
    const a = Math.min(1, b.hintT / 15, (200 - b.hintT) / 20);
    ctx.save(); ctx.globalAlpha = Math.max(0, a);
    ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(160, 110, 480, 26);
    ctx.fillStyle = '#FDE68A'; ctx.font = 'bold 8px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText(b.hint, 400, 127); ctx.textAlign = 'left';
    ctx.restore();
  }
  drawThingBar(ctx, rt.thing);
  if (inCutScene(rt.escape)) drawCutScene(ctx, state, rt);
};

/** Over the lot: the fades. */
export const drawTommyOverlays = (ctx: Ctx, state: GameState) => {
  const rt = getTommy(state)!;
  const d = Math.max(fadeAmount(rt), dropFade(rt.escape));
  if (d > 0) { ctx.fillStyle = `rgba(0,0,0,${d})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  return true;
};
