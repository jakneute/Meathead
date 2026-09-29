// Tommy's stage, drawn: which part's in view decides what's behind (the street
// and its sky, the sewer, the ruins), what's in the middle of it all (the junk,
// the bike, the scenes' people, the drips) and what's in front (the muck he's
// in, speech); then the screen's own things (the suit's gauge, what to do next,
// the thing's health, the cut scenes, the fades).

import type { GameState } from '../../core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, ARENA_LEFT } from '../../../constants';
import { drawPlayer } from '../../render/player/player';
import { COURSE, placeOf, RUINS_Y } from './course';
import { getTommy, fadeAmount, TommyRuntime } from './runtime';
import { drawStreetSky, drawStreetGround, drawStreetFronts, drawJunk, drawCorner, drawRoadEnd, drawRiddenBike, drawTumble, drawCarRampSigns } from './streetDraw';
import { drawSewerBack, drawSewerGround, drawDrips, drawMuckFront, drawChunks } from './sewerDraw';
import { drawCutScene, drawRuinsGround, drawRuinsHouse, drawSuitMelt, drawBlast } from './escapeDraw';
import { drawThingBar, drawThing, drawThingDrops } from './thingDraw';
import { thingSpot, THING_SURFACE } from './thing';
import { inCutScene, dropFade } from './escape';
import { saying, drawBubble, Speaker } from './script';
import { nextRamp, RAMP_CALL } from './bike';

type Ctx = CanvasRenderingContext2D;

const view = (state: GameState) => placeOf(state.camera.x + CANVAS_WIDTH / 2);

export const drawTommyBackdrop = (ctx: Ctx, state: GameState) => {
  // Way down underground (outside Tommy's door, going in, his room): packed earth and rock, never a sky (his room draws
  // its own shaft over this)
  const downAtTheDoor = state.camera.x + CANVAS_WIDTH > COURSE.ruins.x1 && state.camera.y > RUINS_Y + 1400;
  if (state.camera.x + CANVAS_WIDTH / 2 > ARENA_LEFT - 100 || downAtTheDoor) { drawUnderground(ctx, state); return true; }
  const place = view(state);
  if (place === 'hood' || place === 'road') drawStreetSky(ctx, state);
  else if (place === 'ruins') drawStreetSky(ctx, state, 1, false);
  else { ctx.fillStyle = '#0C0A09'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  return true;
};

/** Solid ground all round: dark earth, rock in it (drifting slowly with the camera). */
const drawUnderground = (ctx: Ctx, state: GameState) => {
  const g = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  g.addColorStop(0, '#0C0A09'); g.addColorStop(1, '#1C1917');
  ctx.fillStyle = g; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const ox = state.camera.x * 0.3, oy = state.camera.y * 0.3;
  for (let i = 0; i < 40; i++) {
    const h1 = Math.sin(i * 127.1) * 43758.5453, h2 = Math.sin(i * 311.7) * 12345.678;
    const x = ((((h1 - Math.floor(h1)) * 1200 - ox) % 1200) + 1200) % 1200 - 200;
    const y = ((((h2 - Math.floor(h2)) * 900 - oy) % 900) + 900) % 900 - 150;
    ctx.fillStyle = i % 3 ? 'rgba(68, 64, 60, 0.35)' : 'rgba(87, 83, 78, 0.3)';
    ctx.beginPath(); ctx.ellipse(x, y, 10 + (i % 5) * 7, 6 + (i % 4) * 4, (i % 7) * 0.4, 0, Math.PI * 2); ctx.fill();
  }
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
    drawCarRampSigns(ctx, state, rt.bike);
  } else if (place !== 'ruins') {
    drawDrips(ctx, state, rt);
    drawChunks(ctx, rt);
    drawBlast(ctx, state, rt);
    if (rt.thing.e && rt.thing.phase !== 'dormant') drawThing(ctx, rt.thing.e, rt.thing, state);
    if (rt.thing.drops.length) drawThingDrops(ctx, rt.thing, state.frame);
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
  // Eaten by the muck: going down into it, see-through and green, bubbles, then just his skull bobbing up
  const dv = rt.sewer.dissolve;
  if (dv && state.deathTimer > 0) {
    const k = Math.min(1, (state.frame - dv.at) / 90);
    const body = { ...p, hidden: false, pos: { x: dv.x, y: dv.y + k * 50 }, vel: { x: 0, y: 1 }, isGrounded: false };
    ctx.save();
    ctx.globalAlpha = 1 - k;
    ctx.filter = `sepia(1) hue-rotate(40deg) saturate(${2 + k * 3}) brightness(${1 - k * 0.5})`;
    drawPlayer(ctx, body, { ...state, deathTimer: 0 }, { currentWeapon: p.currentWeapon, showFilthShield: false, invincibilityEnabled: false });
    ctx.restore();
    const cx = dv.x + p.width / 2;
    for (let i = 0; i < 6; i++) { const q = ((state.frame * 1.5 + i * 17) % 60) / 60; ctx.fillStyle = `rgba(217, 249, 157, ${0.8 * (1 - q)})`; ctx.beginPath(); ctx.arc(cx - 20 + i * 8, dv.surface - q * 30, 2 + q * 3, 0, Math.PI * 2); ctx.fill(); }
    if (k >= 1) {
      // The skull, up at the surface
      const bob = Math.sin(state.frame * 0.1) * 2;
      ctx.fillStyle = '#E7E5D6'; ctx.beginPath(); ctx.arc(cx, dv.surface - 4 + bob, 9, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(cx - 5, dv.surface + 2 + bob, 10, 5);
      ctx.fillStyle = '#1C1917'; ctx.fillRect(cx - 5, dv.surface - 7 + bob, 4, 4); ctx.fillRect(cx + 1, dv.surface - 7 + bob, 4, 4);
    }
  }
  if (place !== 'hood' && place !== 'road' && place !== 'ruins') drawMuckFront(ctx, state);
  drawSuitMelt(ctx, state, rt);
  drawSpeech(ctx, state, rt);
};

/** Everybody else's lines, over them (his go up in his own bubble). */
const drawSpeech = (ctx: Ctx, state: GameState, rt: TommyRuntime) => {
  const H = COURSE.hood;
  // (once they're after him, the crew's lines come out of their car)
  const car = rt.bike.crew ? null : state.enemies.filter(e => e.kind === 'lowrider' && e.health > 0).sort((a, b) => Math.abs(a.pos.x - state.player.pos.x) - Math.abs(b.pos.x - state.player.pos.x))[0];
  const at: Partial<Record<Speaker, { x: number; y: number }>> = {
    crew: car ? { x: car.pos.x + car.width / 2, y: car.pos.y - 34 } : { x: H.corner, y: GROUND_Y - 84 },
    rider: { x: rt.bike.rider.x, y: rt.bike.rider.y - 84 },
    hazmat: { x: COURSE.road.hazmat, y: GROUND_Y - 92 },
    thing: { x: thingSpot().x - 90, y: THING_SURFACE - 250 },
  };
  for (const who of Object.keys(at) as Speaker[]) {
    const text = saying(rt.talk, who);
    if (text) drawBubble(ctx, at[who]!.x, at[who]!.y, text, who === 'thing' ? '#D9F99D' : '#FEF9C3');
  }
};

/**
 * A ramp coming up that's not on the screen yet: a big green sign at the right edge, chevrons racing toward it, how
 * close it is filling up under it, so he's ready to wheelie into it rather than jump it.
 */
const drawRampComing = (ctx: Ctx, state: GameState, rt: TommyRuntime) => {
  const r = nextRamp(state, rt.bike);
  if (!r || !r.offscreen) return;
  const k = 1 - r.dist / RAMP_CALL;
  const x = CANVAS_WIDTH - 150, y = 250, w = 138, h = 64;
  const flash = state.frame % 24 < 12;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
  ctx.fillStyle = flash ? '#16A34A' : '#15803D'; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#F8FAFC'; ctx.lineWidth = 2; ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);
  ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 10px "Press Start 2P"'; ctx.textAlign = 'center';
  ctx.fillText('RAMP AHEAD', x + w / 2, y + 22);
  ctx.font = 'bold 7px "Press Start 2P"'; ctx.fillStyle = '#BBF7D0'; ctx.fillText('WHEELIE INTO IT!', x + w / 2, y + 38);
  // How close: filling up
  ctx.fillStyle = '#052E16'; ctx.fillRect(x + 12, y + 46, w - 24, 8);
  ctx.fillStyle = '#FDE047'; ctx.fillRect(x + 12, y + 46, (w - 24) * k, 8);
  // Chevrons racing off the edge toward it
  ctx.fillStyle = '#4ADE80'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
  for (let c = 0; c < 3; c++) {
    const cx = x - 40 + ((state.frame * 2 + c * 14) % 42), a = 1 - ((state.frame * 2 + c * 14) % 42) / 42;
    ctx.globalAlpha = 0.3 + a * 0.7;
    ctx.beginPath(); ctx.moveTo(cx, y + 18); ctx.lineTo(cx + 12, y + 32); ctx.lineTo(cx, y + 46); ctx.lineTo(cx - 6, y + 46); ctx.lineTo(cx + 6, y + 32); ctx.lineTo(cx - 6, y + 18); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
  ctx.textAlign = 'left';
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
  if (b.phase === 'riding' && state.player.bike) drawRampComing(ctx, state, rt);
  drawThingBar(ctx, rt.thing, state.frame);
  if (inCutScene(rt.escape)) drawCutScene(ctx, state, rt);
};

/** Over the lot: the fades. */
export const drawTommyOverlays = (ctx: Ctx, state: GameState) => {
  const rt = getTommy(state)!;
  const d = Math.max(fadeAmount(rt), dropFade(rt.escape));
  if (d > 0) { ctx.fillStyle = `rgba(0,0,0,${d})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  return true;
};
