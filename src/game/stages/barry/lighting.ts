// The lighting on Barry's stage. It's night and the grid's failing: every place
// has a level of dark over it (dim on the street, near enough normal in the
// offices, rolling in waves across the rooftops), and the lights cut holes in it:
// the street lamps' cones (the bad ones flickering, cutting out for a while and
// stuttering back), neon signs, bulbs and fluorescent tubes indoors, the beacons
// on the roofs, the fires at the end. Meathead lights up when he's under one (a
// warm glow over him); out of the light he's in the dark with everything else,
// though never pitch black: he always carries a little light of his own.

import type { GameState } from '../../core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../constants';
import { COURSE, Lamp, placeOf, Place, roomOf } from './course';
import type { BarryRuntime } from './runtime';

type Ctx = CanvasRenderingContext2D;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** How dark each place is (0 lit, 1 black). */
const DARK: Record<Place, number> = { streets: 0.62, lobby: 0.1, office: 0.16, maintenance: 0.42, lab: 0.3, roofs: 0.3, power: 0.22, landing: 0.38 };

/** Indoors it's cramped: the view pushes in on the room (by this much, about the middle of it). */
export const ROOM_ZOOM = 1.4;
export const roomZoom = (state: GameState) => {
  const room = roomOf(placeOf(state.camera.x + CANVAS_WIDTH / 2));
  return room ? { scale: ROOM_ZOOM, x: state.camera.x + CANVAS_WIDTH / 2, y: (room.ceiling + room.floor) / 2 + 5 } : null;
};

/** The rolling blackout over the rooftops: 0 the lights are on, 1 they're out (a wave that moves across the city). */
export const blackout = (frame: number, x: number) => {
  const cycle = 620;
  const t = ((frame - (x - COURSE.roofs.x1) * 0.25) % cycle + cycle) % cycle;
  if (t < 220) return 0;
  if (t < 280) return (t - 220) / 60;
  if (t < 480) return 1;
  if (t < 540) return 1 - (t - 480) / 60;
  return 0;
};

/** How dark it is where the camera is, right now. */
export const darkness = (state: GameState, rt: BarryRuntime) => {
  const place = placeOf(state.camera.x + CANVAS_WIDTH / 2);
  let d = DARK[place];
  if (place === 'roofs') d = 0.3 + 0.5 * blackout(state.frame, state.camera.x + CANVAS_WIDTH / 2);
  if (place === 'power') d = rt.power.gone >= 3 ? 0.55 : DARK.power + rt.power.gone * 0.08;
  return d;
};

/** How far up a lamp is right now (0 out, 1 full): the bad ones cut out for a stretch, stutter back on, buzz. */
export const lampLevel = (lamp: Lamp, frame: number, x = lamp.x) => {
  if (lamp.look === 'beacon') return blackout(frame, x) > 0.5 ? 0 : (Math.floor(frame / 40) % 2 ? 1 : 0.35);
  if (lamp.flicker <= 0) return 1;
  const t = frame + hash(lamp.x) * 1000;
  const period = 150;
  const slot = Math.floor(t / period), inSlot = t % period;
  if (hash(slot * 7.3 + lamp.x * 0.01) < lamp.flicker * 0.6) {
    // Out for this stretch: a stutter as it goes, then nothing
    return inSlot < 18 && Math.floor(t / 3) % 2 ? 0.7 : 0;
  }
  // On, with the odd buzzing dip (worse the worse it is)
  if (inSlot < 12 && lamp.flicker > 0.4) return Math.floor(t / 2) % 2 ? 1 : 0.2;
  return 1;
};

interface Light { x: number; y: number; r: number; a: number; cone?: number; color?: string }

/** Everything giving off light in view. */
const lightsInView = (state: GameState, rt: BarryRuntime): Light[] => {
  const f = state.frame;
  const out: Light[] = [];
  const view = (x: number) => x > state.camera.x - 300 && x < state.camera.x + CANVAS_WIDTH + 300;
  for (const l of COURSE.lamps) {
    if (!view(l.x)) continue;
    const a = lampLevel(l, f);
    if (a <= 0) continue;
    if (l.look === 'street') { out.push({ x: l.x, y: l.y, r: 280, a, cone: 150, color: 'rgba(255, 214, 140, 0.16)' }); out.push({ x: l.x, y: l.y, r: 46, a }); }
    else if (l.look === 'sign') out.push({ x: l.x, y: l.y, r: 110, a, color: 'rgba(244, 114, 182, 0.14)' });
    else if (l.look === 'bulb') out.push({ x: l.x, y: l.y + 10, r: 190, a, color: 'rgba(253, 224, 71, 0.08)' });
    else if (l.look === 'tube') out.push({ x: l.x, y: l.y + 10, r: 230, a, color: 'rgba(224, 242, 254, 0.06)' });
    else out.push({ x: l.x, y: l.y, r: 70, a, color: 'rgba(239, 68, 68, 0.18)' });
  }
  // Fires at the end, flickering
  if (placeOf(state.camera.x + 400) === 'landing') for (const p of COURSE.props) if (p.look === 'burningcar' && view(p.x)) out.push({ x: p.x + 70, y: p.y - 60, r: 260 + Math.sin(f * 0.3) * 20, a: 0.9, color: 'rgba(249, 115, 22, 0.16)' });
  // Muzzle flashes and shots in flight light up what's round them
  for (const pr of state.projectiles) if (view(pr.pos.x) && !pr.thrown) out.push({ x: pr.pos.x, y: pr.pos.y, r: pr.owner === 'player' ? 50 : 40, a: 0.8 });
  // The power room's generators glow while they run
  for (const e of state.enemies) if (e.kind === 'generator' && view(e.pos.x)) out.push({ x: e.pos.x + e.width / 2, y: e.pos.y + 40, r: 170, a: 0.9, color: 'rgba(56, 189, 248, 0.12)' });
  // What little light he has of his own
  const p = state.player;
  if (!p.hidden) out.push({ x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2, r: 95, a: 0.55 });
  void rt;
  return out;
};

/** How lit he is (0..1): under a lamp's cone, near a sign or a bulb. */
export const playerLit = (state: GameState) => {
  const p = state.player;
  const px = p.pos.x + p.width / 2, py = p.pos.y + p.height / 2;
  let lit = 0;
  for (const l of COURSE.lamps) {
    if (Math.abs(l.x - px) > 320) continue;
    const a = lampLevel(l, state.frame);
    if (!a) continue;
    const dx = px - l.x, dy = py - l.y;
    if (l.look === 'street') {
      // Inside the cone: under the lamp, widening down to the ground
      if (dy < 0 || dy > 300) continue;
      const half = 20 + dy * 0.5;
      if (Math.abs(dx) > half) continue;
      lit = Math.max(lit, a * (1 - Math.abs(dx) / half * 0.5) * (1 - dy / 600));
    } else {
      const r = l.look === 'beacon' ? 70 : l.look === 'sign' ? 110 : 200;
      const d = Math.hypot(dx, dy);
      if (d < r) lit = Math.max(lit, a * (1 - d / r) * (l.look === 'bulb' || l.look === 'tube' ? 0.5 : 0.8));
    }
  }
  return Math.min(1, lit);
};

let shade: HTMLCanvasElement | null = null;
const SHADE_SCALE = 0.5;

/** The dark over everything, with the lights cut out of it; then their color, and his glow. Screen space. */
export const drawLighting = (ctx: Ctx, state: GameState, rt: BarryRuntime) => {
  const d = darkness(state, rt);
  if (d <= 0.02) return;
  if (!shade) { if (typeof document === 'undefined') return; shade = document.createElement('canvas'); shade.width = CANVAS_WIDTH * SHADE_SCALE; shade.height = CANVAS_HEIGHT * SHADE_SCALE; }
  const g = shade.getContext('2d')!;
  const cx = state.camera.x, cy = state.camera.y;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-over';
  g.clearRect(0, 0, shade.width, shade.height);
  g.fillStyle = `rgba(4, 6, 18, ${d})`;
  g.fillRect(0, 0, shade.width, shade.height);
  g.setTransform(SHADE_SCALE, 0, 0, SHADE_SCALE, 0, 0);
  g.globalCompositeOperation = 'destination-out';
  // (world to screen, the room's zoom and all)
  const z = roomZoom(state);
  const zs = z ? z.scale : 1;
  const sx = (x: number) => (z ? (x - z.x) * z.scale + z.x : x) - cx;
  const sy = (y: number) => (z ? (y - z.y) * z.scale + z.y : y) - cy;
  const lights = lightsInView(state, rt).map(l => ({ ...l, x: sx(l.x) + cx, y: sy(l.y) + cy, r: l.r * zs, cone: l.cone ? l.cone * zs : undefined }));
  for (const l of lights) {
    const x = l.x - cx, y = l.y - cy;
    if (l.cone) {
      // A cone down to the ground from the lamp's head
      const grad = g.createLinearGradient(0, y, 0, y + l.r);
      grad.addColorStop(0, `rgba(0,0,0,${0.95 * l.a})`); grad.addColorStop(0.75, `rgba(0,0,0,${0.75 * l.a})`); grad.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grad;
      g.beginPath(); g.moveTo(x - 14, y); g.lineTo(x + 14, y); g.lineTo(x + l.cone, y + l.r); g.lineTo(x - l.cone, y + l.r); g.closePath(); g.fill();
    } else {
      const grad = g.createRadialGradient(x, y, 0, x, y, l.r);
      grad.addColorStop(0, `rgba(0,0,0,${l.a})`); grad.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grad;
      g.beginPath(); g.arc(x, y, l.r, 0, Math.PI * 2); g.fill();
    }
  }
  ctx.drawImage(shade, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  // The lights' own color, warm over what they light
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const l of lights) {
    if (!l.color) continue;
    const x = l.x - cx, y = l.y - cy;
    if (l.cone) {
      const grad = ctx.createLinearGradient(0, y, 0, y + l.r);
      grad.addColorStop(0, l.color); grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad; ctx.globalAlpha = l.a;
      ctx.beginPath(); ctx.moveTo(x - 14, y); ctx.lineTo(x + 14, y); ctx.lineTo(x + l.cone, y + l.r); ctx.lineTo(x - l.cone, y + l.r); ctx.closePath(); ctx.fill();
    } else {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, l.r);
      grad.addColorStop(0, l.color); grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad; ctx.globalAlpha = l.a;
      ctx.beginPath(); ctx.arc(x, y, l.r, 0, Math.PI * 2); ctx.fill();
    }
  }
  // Him, lit up under it
  const p = state.player;
  const lit = p.hidden ? 0 : playerLit(state);
  if (lit > 0.05) {
    const x = sx(p.pos.x + p.width / 2), y = sy(p.pos.y + p.height / 2);
    const grad = ctx.createRadialGradient(x, y - 10, 4, x, y, 60);
    grad.addColorStop(0, `rgba(255, 220, 160, ${0.32 * lit})`); grad.addColorStop(1, 'rgba(255, 200, 120, 0)');
    ctx.globalAlpha = 1; ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(x, y, 60, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
};
