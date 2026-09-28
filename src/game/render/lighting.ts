// Lighting, for every stage. A stage says how dark it is where the camera is
// (and what color the dark is), and where its lights are: lamps, signs, lava,
// fires, windows. Everything else that gives off light is picked up here, the
// same on every stage: shots and flames in the air, anything on fire, sparks and
// blasts, the flamethrower. Over the finished world: the dark, with every light
// cut out of it, then the lights' own color over what they light.
//
// Meathead, the enemies and the pickups are all lit the one way: each keeps a
// little of itself out of the dark (so nothing's lost in it), and whatever
// lights are on it light it up, in their color. Nobody's brighter than anyone
// else for being who they are.

import type { GameState } from '../core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants';

type Ctx = CanvasRenderingContext2D;

/** A light, in the world. `cone`: a lamp shining down (the cone's half-width at its foot `r` below), else a round glow. */
export interface Light { x: number; y: number; r: number; a: number; cone?: number; color?: string }

/** What a stage's lighting is right now. */
export interface SceneLight {
  /** How dark (0 lit, 1 black). */
  dark: number;
  /** The dark's color (r, g, b): night blue by default. */
  shade?: [number, number, number];
  /** The stage's own lights (the engine adds shots, fires and the like). */
  lights: Light[];
  /** How much of themselves the actors keep out of the dark (0..1; 0.45 by default). */
  rim?: number;
  /** Just the dark, all over (a view that isn't flat, like the inside of the storm, where nothing's where it'd be on screen). */
  flat?: boolean;
}

/** The world as it's drawn: zoom about (x, y), then the camera. */
export interface View { camX: number; camY: number; zoom?: { scale: number; x: number; y: number; shiftX?: number; shiftY?: number } | null }

const hexRgb = (c: string): [number, number, number] | null => {
  if (c[0] !== '#' || (c.length !== 7 && c.length !== 4)) return null;
  if (c.length === 4) return [parseInt(c[1] + c[1], 16), parseInt(c[2] + c[2], 16), parseInt(c[3] + c[3], 16)];
  return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
};

/** Is this a color something glows in (fire, sparks, electricity)? What light it gives if so. */
const glowOf = (c: string): string | null => {
  const rgb = hexRgb(c);
  if (!rgb) return null;
  const [r, g, b] = rgb;
  const hi = Math.max(r, g, b), lo = Math.min(r, g, b);
  // Bright and either warm (fire) or electric (cyan, white): not blood, smoke, dirt or snow-grey
  if (hi < 200) return null;
  const warm = r > 200 && g > 90 && b < 140;
  const electric = b > 200 && g > 180;
  if (!warm && !electric) return null;
  if (hi - lo < 30 && hi < 250) return null;
  return `rgba(${r}, ${g}, ${b}, 0.14)`;
};

/** Everything moving that gives off light (the same on every stage). */
export const dynamicLights = (state: GameState): Light[] => {
  const out: Light[] = [];
  const view = (x: number, y: number) => x > state.camera.x - 200 && x < state.camera.x + CANVAS_WIDTH + 200 && y > state.camera.y - 200 && y < state.camera.y + CANVAS_HEIGHT + 200;
  // Shots and things in the air
  for (const p of state.projectiles) {
    const x = p.pos.x + p.width / 2, y = p.pos.y + p.height / 2;
    if (!view(x, y) || p.thrown || p.isBoulder || p.isSludge || p.isPoop || p.isIce && p.width > 30) continue;
    const fire = p.isOnFire || p.isOilRocket || p.isOscarRocket || p.isCigarette || p.shot === 'flare';
    out.push(fire ? { x, y, r: 110, a: 0.85, color: 'rgba(249, 115, 22, 0.16)' } : { x, y, r: p.owner === 'player' ? 55 : 45, a: 0.7, color: p.isIce || p.shot === 'cryo' ? 'rgba(125, 211, 252, 0.12)' : 'rgba(254, 240, 138, 0.1)' });
  }
  // Anything burning
  for (const e of state.enemies) {
    if (!e.isOnFire) continue;
    const x = e.pos.x + e.width / 2, y = e.pos.y + e.height / 2;
    if (view(x, y)) out.push({ x, y, r: 130, a: 0.85, color: 'rgba(249, 115, 22, 0.16)' });
  }
  // The flamethrower, along its length
  const p = state.player;
  if (p.isFlaming && !p.hidden) {
    const range = p.flameRange ?? 0, ang = p.flameAngle || 0;
    const nx = p.pos.x + p.width / 2 + p.facing * 20, ny = p.pos.y + p.height * 0.45;
    for (const k of [0.35, 0.8]) out.push({ x: nx + Math.cos(ang) * p.facing * range * k, y: ny + Math.sin(ang) * range * k, r: 150, a: 0.9, color: 'rgba(249, 115, 22, 0.18)' });
  }
  // Sparks, fire, blasts: the biggest bright bits (a handful, lumped together where they're thick)
  let n = 0;
  const cells = new Set<string>();
  for (const q of state.particles) {
    if (n >= 28 || q.size < 4 || q.isSplat || q.isStuck || q.isWater || q.isGlass || q.isBossGore) continue;
    const c = glowOf(q.color);
    if (!c || !view(q.pos.x, q.pos.y)) continue;
    const cell = `${Math.floor(q.pos.x / 60)},${Math.floor(q.pos.y / 60)}`;
    if (cells.has(cell)) continue;
    cells.add(cell); n++;
    out.push({ x: q.pos.x, y: q.pos.y, r: Math.min(140, 40 + q.size * 5), a: Math.min(1, 0.4 + q.life / 40), color: c });
  }
  return out;
};

/** How much a light's on (x, y), 0..1. */
const lightOn = (l: Light, x: number, y: number) => {
  const dx = x - l.x, dy = y - l.y;
  if (l.cone) {
    if (dy < 0 || dy > l.r) return 0;
    const half = 14 + (l.cone - 14) * (dy / l.r);
    if (Math.abs(dx) > half) return 0;
    return l.a * (1 - Math.abs(dx) / half * 0.5) * (1 - dy / l.r * 0.6);
  }
  const d = Math.hypot(dx, dy);
  return d >= l.r ? 0 : l.a * (1 - d / l.r);
};

/** Who gets lit: Meathead, everyone alive (or dying where they stand), the pickups. World boxes. */
const actorsOf = (state: GameState) => {
  const out: { x: number; y: number; w: number; h: number }[] = [];
  const p = state.player;
  if (!p.hidden && state.deathTimer <= 0) out.push({ x: p.pos.x, y: p.pos.y, w: p.width, h: p.height });
  for (const e of state.enemies) if (e.health > 0 || e.type === 'boss') out.push({ x: e.pos.x, y: e.pos.y, w: e.width, h: e.height });
  for (const k of state.pickups) out.push({ x: k.pos.x, y: k.pos.y, w: k.width, h: k.height });
  return out;
};

let shade: HTMLCanvasElement | null = null;
const SHADE_SCALE = 0.5;

/** The dark over the finished frame, the lights cut out of it, their color, the actors lit. Screen space. */
export const drawSceneLighting = (ctx: Ctx, state: GameState, scene: SceneLight, view: View) => {
  const d = scene.dark;
  if (d <= 0.02) return;
  if (!shade) { if (typeof document === 'undefined') return; shade = document.createElement('canvas'); shade.width = CANVAS_WIDTH * SHADE_SCALE; shade.height = CANVAS_HEIGHT * SHADE_SCALE; }
  const g = shade.getContext('2d')!;
  const z = view.zoom && view.zoom.scale !== 1 ? view.zoom : null;
  const zs = z ? z.scale : 1;
  const sx = (x: number) => (z ? (x - z.x) * z.scale + z.x + (z.shiftX ?? 0) : x) - view.camX;
  const sy = (y: number) => (z ? (y - z.y) * z.scale + z.y + (z.shiftY ?? 0) : y) - view.camY;
  const lights = scene.flat ? [] : [...scene.lights, ...dynamicLights(state)];
  const onScreen = lights.map(l => ({ ...l, x: sx(l.x), y: sy(l.y), r: l.r * zs, cone: l.cone ? l.cone * zs : undefined }))
    .filter(l => l.x > -l.r - (l.cone ?? 0) && l.x < CANVAS_WIDTH + l.r + (l.cone ?? 0) && l.y > -l.r && l.y < CANVAS_HEIGHT + l.r);
  const actors = scene.flat ? [] : actorsOf(state);
  const rim = scene.rim ?? 0.45;
  const [r, gg, b] = scene.shade ?? [4, 6, 18];

  // The dark
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-over';
  g.clearRect(0, 0, shade.width, shade.height);
  g.fillStyle = `rgba(${r}, ${gg}, ${b}, ${d})`;
  g.fillRect(0, 0, shade.width, shade.height);
  g.setTransform(SHADE_SCALE, 0, 0, SHADE_SCALE, 0, 0);
  // ...the lights cut out of it
  g.globalCompositeOperation = 'destination-out';
  for (const l of onScreen) {
    if (l.cone) {
      const grad = g.createLinearGradient(0, l.y, 0, l.y + l.r);
      grad.addColorStop(0, `rgba(0,0,0,${0.95 * l.a})`); grad.addColorStop(0.75, `rgba(0,0,0,${0.75 * l.a})`); grad.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grad;
      g.beginPath(); g.moveTo(l.x - 14 * zs, l.y); g.lineTo(l.x + 14 * zs, l.y); g.lineTo(l.x + l.cone, l.y + l.r); g.lineTo(l.x - l.cone, l.y + l.r); g.closePath(); g.fill();
    } else {
      const grad = g.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r);
      grad.addColorStop(0, `rgba(0,0,0,${l.a})`); grad.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grad;
      g.beginPath(); g.arc(l.x, l.y, l.r, 0, Math.PI * 2); g.fill();
    }
  }
  // ...and a little of every actor, the same for all of them
  for (const a of actors) {
    const x = sx(a.x + a.w / 2), y = sy(a.y + a.h / 2), rr = Math.max(a.w, a.h) * 0.85 * zs;
    if (x < -rr || x > CANVAS_WIDTH + rr || y < -rr || y > CANVAS_HEIGHT + rr) continue;
    const grad = g.createRadialGradient(x, y, 0, x, y, rr);
    grad.addColorStop(0, `rgba(0,0,0,${rim})`); grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.beginPath(); g.arc(x, y, rr, 0, Math.PI * 2); g.fill();
  }
  ctx.save();
  ctx.drawImage(shade, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // The lights' own color over what they light
  ctx.globalCompositeOperation = 'lighter';
  for (const l of onScreen) {
    if (!l.color) continue;
    ctx.globalAlpha = Math.min(1, l.a) * Math.min(1, d * 1.6);
    if (l.cone) {
      const grad = ctx.createLinearGradient(0, l.y, 0, l.y + l.r);
      grad.addColorStop(0, l.color); grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.moveTo(l.x - 14 * zs, l.y); ctx.lineTo(l.x + 14 * zs, l.y); ctx.lineTo(l.x + l.cone, l.y + l.r); ctx.lineTo(l.x - l.cone, l.y + l.r); ctx.closePath(); ctx.fill();
    } else {
      const grad = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r);
      grad.addColorStop(0, l.color); grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2); ctx.fill();
    }
  }
  // Each actor lit up by whatever's on it, in its color (Meathead, the enemies, the pickups alike)
  ctx.globalAlpha = 1;
  for (const a of actors) {
    const wx = a.x + a.w / 2, wy = a.y + a.h / 2;
    let lit = 0, best: Light | null = null, bestOn = 0;
    for (const l of lights) {
      const on = lightOn(l, wx, wy);
      if (on <= 0) continue;
      lit += on;
      if (on > bestOn) { bestOn = on; best = l; }
    }
    lit = Math.min(1, lit) * Math.min(1, d * 1.6);
    if (lit < 0.05) continue;
    const x = sx(wx), y = sy(wy), rr = Math.max(a.w, a.h) * 0.9 * zs;
    const tint = best?.color ? best.color.replace(/[\d.]+\)$/, `${(0.3 * lit).toFixed(3)})`) : `rgba(255, 220, 160, ${(0.3 * lit).toFixed(3)})`;
    const grad = ctx.createRadialGradient(x, y - 6 * zs, 4, x, y, rr);
    grad.addColorStop(0, tint); grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
};
