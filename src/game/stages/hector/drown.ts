// Nobody Meathead meets on the beach can swim (not the surfers, not the lifeguards' drinking buddies, not the cops).
// Knock one into the water where there's no gator to get him first and he flails at the surface for a bit, arms
// going, gulping, then goes under and sinks, a trail of bubbles coming up after him. He doesn't come back up.

import type { Enemy } from '../../../types';
import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import type { Hazards } from './hazards';
import { drawKindEnemy } from '../../render/enemies';

/** Everyone on two legs out here. */
const HUMANS = new Set(['tourist', 'bouncer', 'surfer', 'cop', 'riotcop', 'civilian']);
/** Frames at the surface flailing, then going under; and how fast he sinks. */
const FLAIL = 80, SINK = 120, SINK_SPEED = 0.9;
/** A water gator this close to where he went in gets to him first (it eats him instead). */
const GATOR_CLAIM = 440;

type Ctx = CanvasRenderingContext2D;

const mid = (e: Enemy) => ({ x: e.pos.x + e.width / 2, y: e.pos.y + e.height / 2 });

/** Just gone in (feet under the surface of the water) with nothing in the water to eat him: he starts drowning. */
const startsDrowning = (state: GameState, e: Enemy, hz: Hazards) => {
  if (!HUMANS.has(e.kind || '') || e.health <= 0 || e.isBlownAway) return false;
  const { x } = mid(e);
  const zone = hz.water.find(z => x > z.x1 && x < z.x2);
  if (!zone || e.pos.y + e.height < zone.surface + 8) return false;
  const gator = state.enemies.some(g => g.kind === 'gator' && g.variant === 1 && g.health > 0 && !g.isBlownAway
    && (g.prey === e.id || Math.abs((g.homeX ?? g.pos.x) - x) < GATOR_CLAIM));
  if (gator) return false;
  e.drownT = 0;
  e.drownSurface = zone.surface;
  return true;
};

/** Runs a drowning man (undefined if he isn't one, and isn't about to be). */
export const updateDrowning = (ctx: FrameContext, e: Enemy, hz: Hazards): boolean | undefined => {
  const { state, fx } = ctx;
  if (e.drownT === undefined && !startsDrowning(state, e, hz)) return undefined;
  if (e.health <= 0) return false;
  const t = ++e.drownT!;
  const surface = e.drownSurface!;
  const { x } = mid(e);
  e.vel = { x: 0, y: 0 };
  e.melee = undefined;
  e.shootTimer = 0;
  if (t === 1) {
    // The splash going in
    for (let i = 0; i < 16; i++) state.particles.push({ pos: { x, y: surface }, vel: { x: (Math.random() - 0.5) * 7, y: -2 - Math.random() * 6 }, life: 24 + Math.random() * 16, color: i % 2 ? '#E0F2FE' : '#7DD3FC', size: 2 + Math.random() * 4 });
    fx.spawnDamageNumber({ x: x - 30, y: surface - 90 }, "CAN'T SWIM!", false, '#7DD3FC');
  }
  if (t <= FLAIL) {
    // Head and shoulders out, bobbing, arms going, thrashing about on the spot
    e.pos.y = surface - e.height * 0.4 + Math.sin(t * 0.45) * 5 + (t / FLAIL) * e.height * 0.25;
    e.pos.x += Math.sin(t * 0.3) * 0.8;
    if (t % 3 === 0) for (let i = 0; i < 3; i++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * e.width * 1.4, y: surface }, vel: { x: (Math.random() - 0.5) * 4, y: -1.5 - Math.random() * 3.5 }, life: 16 + Math.random() * 10, color: '#E0F2FE', size: 2 + Math.random() * 3 });
  } else {
    // Under, and down
    e.pos.y = Math.min(e.pos.y + SINK_SPEED, surface + 200);
    if (t % 6 === 0) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 12, y: e.pos.y + 6 }, vel: { x: (Math.random() - 0.5) * 0.4, y: -1.2 - Math.random() }, life: Math.max(10, (e.pos.y - surface) / 1.6), color: 'rgba(224, 242, 254, 0.8)', size: 2 + Math.random() * 3 });
  }
  if (t >= FLAIL + SINK) {
    // Gone. A last burst of bubbles where he went down
    for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 20, y: surface }, vel: { x: (Math.random() - 0.5) * 1.5, y: -0.5 - Math.random() * 1.5 }, life: 20 + Math.random() * 20, color: '#E0F2FE', size: 2 + Math.random() * 3 });
    e.health = 0;
    fx.spawnKillCallout({ pos: { x: e.pos.x, y: surface - 40 }, width: e.width }, 'drowned');
    if (!e.innocent) fx.spawnPickup({ x, y: surface - 40 });
    fx.speakVulgarity('charge_kill');
    state.player.killSatisfactionTimer = 60;
    return false;
  }
  return true;
};

/** A drowning man: tipping and lurching about, his arms up and going, slowly going limp as he sinks. */
export const drawDrowning = (ctx: Ctx, e: Enemy, state: GameState) => {
  const t = e.drownT || 0;
  const { x, y } = mid(e);
  const flailing = t <= FLAIL;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(flailing ? Math.sin(t * 0.4) * 0.3 : Math.min(1.3, 0.3 + (t - FLAIL) * 0.02));
  ctx.translate(-x, -y);
  if (flailing) {
    // Arms up out of the water, waving
    ctx.strokeStyle = '#F5D0A9'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (const s of [-1, 1]) {
      const sx = x + s * e.width * 0.3, sy = e.pos.y + e.height * 0.25;
      const a = -Math.PI / 2 + s * 0.5 + Math.sin(t * 0.6 + (s > 0 ? 1.5 : 0)) * 0.6;
      const ex = sx + Math.cos(a) * 22, ey = sy + Math.sin(a) * 22;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.fillStyle = '#F5D0A9'; ctx.beginPath(); ctx.arc(ex, ey, 4, 0, Math.PI * 2); ctx.fill();
    }
  }
  drawKindEnemy(ctx, e, state);
  ctx.restore();
};
