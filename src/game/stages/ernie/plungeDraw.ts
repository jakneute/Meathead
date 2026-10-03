// Off the Golden Gate: the kill cam. On the way down he's all arms and legs, end over end, mouth wide, screaming the
// whole way. Then the bay: the splash, and him face down in the water, bobbing in the swell, a cloud of red spreading
// out under him, every so often a twitch (an arm, a leg, the whole of him), the camera pushing in on him; and a gull
// coming down to stand on his back.

import type { GameState } from '../../core/state';
import { CANVAS_WIDTH } from '../../../constants';
import { drawFlung } from '../../render/player/moves';
import type { Plunge } from './bridge';
import { bandedGradient, checker } from '../../render/pixelArt';
import { INK, ink, shadedTop } from '../../render/npc/kit';

type Ctx = CanvasRenderingContext2D;

/** How long the bay holds on him before the death screen (frames), and when the gull lands. */
export const BAY_SCENE = 260;
const GULL_IN = 120, GULL_DOWN = 175;

/** On the way down: him, end over end (he's hidden: this is him). */
export const drawPlungeFall = (ctx: Ctx, state: GameState, pl: Plunge) => {
  const p = state.player;
  ctx.save();
  ctx.translate(p.pos.x + p.width / 2, p.pos.y + p.height / 2);
  ctx.rotate(pl.t * 0.18);
  drawFlung(ctx, state.frame);
  ctx.restore();
};

/** Twitching: the frame his limbs are drawn at only moves in sudden jerks, now and then. */
const twitchFrame = (t: number) => {
  const beat = Math.floor(t / 23);
  const inJerk = t % 23 < 4 && (beat * 7) % 5 !== 0;
  return beat * 13 + (inJerk ? (t % 23) * 3 : 0);
};

/** In the bay: the water, the blood in it, him face down and bobbing, twitching, and the gull. `t`: frames since the splash. */
export const drawBayCorpse = (ctx: Ctx, state: GameState, pl: Plunge, water: number, t: number) => {
  const x = pl.corpseX, f = state.frame;
  const bob = Math.sin(t * 0.06) * 3;
  const fade = Math.min(1, t / 20);
  // The bay round him: grey-green chop, the light catching the tops of it
  const x1 = state.camera.x - 200, w = CANVAS_WIDTH + 400;
  ctx.fillStyle = '#0F1A1C'; ctx.fillRect(x1, water - 4, w, 400);
  bandedGradient(ctx, x1, water - 4, w, 224, ['#3F5D63', '#324B50', '#25393D', '#1A2A2D', '#0F1A1C'], 8);
  for (let k = 0; k < 18; k++) {
    const wx = Math.round(x1 + ((k * 97 + f * 0.6) % w)), wy = water + 4 + (k % 6) * 22;
    ctx.fillStyle = 'rgba(203, 213, 225, 0.4)'; ctx.fillRect(wx + 6, wy - 2, 12, 2); ctx.fillRect(wx, wy, 6, 2); ctx.fillRect(wx + 18, wy, 6, 2);
    ctx.fillStyle = 'rgba(203, 213, 225, 0.2)'; ctx.fillRect(wx + 8, wy, 8, 1);
  }
  // The blood, spreading out under him through the water
  const r = Math.min(150, 20 + t * 0.9);
  // (in the water, not over it: kept below the surface, and the water itself going red with it, waves and all; in
  // rings, thickest in the middle, a dithered fringe round the outside)
  const blood = (a: number) => `rgba(127, 29, 29, ${(a * fade).toFixed(3)})`;
  const rings: [number, number][] = [[1, 0.1], [0.8, 0.22], [0.55, 0.42], [0.3, 0.7]];
  ctx.save();
  ctx.beginPath(); ctx.rect(x - r - 10, water - 3, (r + 10) * 2, r + 40); ctx.clip();
  for (const [comp, ga] of [['multiply', 1], ['source-over', 0.5]] as const) {
    ctx.globalCompositeOperation = comp; ctx.globalAlpha = ga;
    for (const [k, a] of rings) { ctx.fillStyle = blood(a); ctx.beginPath(); ctx.ellipse(x, water + 4, r * k, r * k * 0.3, 0, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  ctx.beginPath(); ctx.ellipse(x, water + 4, r * 1.1, r * 0.33, 0, 0, Math.PI * 2); ctx.ellipse(x, water + 4, r, r * 0.3, 0, 0, Math.PI * 2, true); ctx.clip('evenodd');
  checker(ctx, x - r * 1.1, water - 3, r * 2.2, r * 0.4 + 10, blood(0.15));
  ctx.restore();
  // The rings off him as he bobs (bigger on a twitch)
  for (let k = 0; k < 3; k++) {
    const q = ((t + k * 25) % 75) / 75;
    ctx.strokeStyle = `rgba(226, 232, 240, ${0.4 * (1 - q)})`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(x, water, 40 + q * 90, 6 + q * 12, 0, 0, Math.PI * 2); ctx.stroke();
  }
  // Him: face down, flat out, half under; the back of him and his arms and boots above the water
  const tf = twitchFrame(t);
  const jerk = t % 23 < 4 && (Math.floor(t / 23) * 7) % 5 !== 0 ? Math.sin(t * 3) * 2 : 0;
  ctx.save();
  ctx.beginPath(); ctx.rect(x - 120, water - 140, 240, 140 + 5 + bob * 0.3); ctx.clip();
  ctx.translate(x, water + 6 + bob + jerk);
  ctx.rotate(Math.PI / 2 + Math.sin(t * 0.03) * 0.05);
  drawFlung(ctx, tf);
  ctx.restore();
  // (the water over the rest of him, a sheen across where he breaks the surface)
  ctx.fillStyle = 'rgba(37, 57, 61, 0.55)'; ctx.fillRect(x - 70, water + 5 + bob * 0.3, 140, 6);
  ctx.fillStyle = 'rgba(226, 232, 240, 0.45)'; ctx.fillRect(x - 55, water + 4 + bob * 0.3, 110, 1.5);
  // The gull: in off the left, gliding, then down onto the small of his back, and stood there
  if (t > GULL_IN) {
    const k = Math.min(1, (t - GULL_IN) / (GULL_DOWN - GULL_IN));
    const gx = x - 300 + k * 290, gy = water - 160 + k * 150 - Math.sin(k * Math.PI) * 30 + (k >= 1 ? bob : 0);
    drawGull(ctx, gx, gy, k >= 1 ? 0 : f, k >= 1);
  }
};

/** A herring gull, side on: white, grey back, yellow beak with its red spot; wings going (or folded, stood). */
const drawGull = (ctx: Ctx, x: number, y: number, f: number, stood: boolean) => {
  ctx.save(); ctx.translate(x, y);
  // (the legs, under him when he's stood)
  if (stood) { ctx.fillStyle = INK; ctx.fillRect(-1.6, -3, 2.6, 4); ctx.fillRect(1.4, -3, 2.6, 4); ctx.fillStyle = '#F59E0B'; ctx.fillRect(-1, -2, 1.5, 3); ctx.fillRect(2, -2, 1.5, 3); }
  // The body and head: white, the belly shadowed, inked
  shadedTop(ctx, () => { ctx.ellipse(0, -8, 10, 6, 0, 0, Math.PI * 2); ctx.moveTo(13.5, -13); ctx.arc(9, -13, 4.5, 0, Math.PI * 2); }, '#F8FAFC', -10, -17.5, 23.5, 15.5, 0.9);
  // The beak (yellow, its red spot), the eye
  ink(ctx, () => { ctx.moveTo(13, -13.4); ctx.lineTo(19, -12); ctx.lineTo(13, -10.8); ctx.closePath(); }, '#FACC15', 0.7);
  ctx.fillStyle = '#DC2626'; ctx.fillRect(16, -12.5, 1.5, 1.2);
  ctx.fillStyle = '#111827'; ctx.fillRect(10, -14.5, 1.5, 1.5);
  // The grey back and wing (folded, or going), its black tip
  if (stood) {
    shadedTop(ctx, () => ctx.ellipse(-2, -9, 9, 4, -0.1, 0, Math.PI * 2), '#94A3B8', -11, -13, 18, 8, 0.8);
  } else {
    const up = Math.sin(f * 0.3) * 10;
    ink(ctx, () => { ctx.moveTo(-4, -10); ctx.lineTo(-16, -12 - up); ctx.lineTo(4, -9); ctx.closePath(); }, '#94A3B8', 0.8);
    ctx.fillStyle = '#CBD5E1'; ctx.beginPath(); ctx.moveTo(-4, -10); ctx.lineTo(-10, -11 - up * 0.5); ctx.lineTo(0, -9.6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#111827'; ctx.fillRect(-16, -13 - up, 3, 2);
  }
  ctx.fillStyle = '#111827'; ctx.fillRect(-11, -9, 3, 2);
  ctx.restore();
};
