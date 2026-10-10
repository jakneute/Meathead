// The river, drawn (crude, the first pass: boxes, shapes and words). Behind: the sky, the far bank and its fake
// animals, the water's depths, the cave, the rides on the bed, the animatronic dinosaurs, the tank's gallery behind
// its glass, the boat and Artie, the rock. In front: the water over everything in it, the bubbles, what's said, his air.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { box, label, saidOver } from '../section';
import { SECTIONS } from '../geometry';
import { drawSafariArtie, ARTIE_H } from './artie';
import { drawSurfaceBackdrop, drawSurfaceBack, drawSurfaceBoat, drawSurfaceFront } from './surface';
import type { River } from './index';
import { WS, DOCK, BOAT, PIPE, roofAt, GALLERY } from './course';
import { drawFallsRock, drawUnderWater, drawUnderWave, drawRays, drawWeeds, drawRockAndBed, drawVents, drawEelHoles, drawUnderFront } from './under';
import { drawProps, drawYard, drawDinos } from './under-scenery';
import { drawTank, drawTankBack } from './under-tank';

type Ctx = CanvasRenderingContext2D;
const { x0, x1 } = SECTIONS.river;
const R = (x: number) => x0 + x;
const seen = (state: GameState, a: number, b: number) => b > state.camera.x - 100 && a < state.camera.x + CANVAS_WIDTH + 100;

export const drawRiverBackdrop = (c: Ctx, state: GameState) => {
  // (the sky and the jungle, as the hour has it: surface.ts)
  drawSurfaceBackdrop(c, state);
  return true;
};

// ---------------------------------------------------------------------------------------------------------------

/** The boat, and Artie in it. */
const drawBoat = (c: Ctx, state: GameState, rv: River) => {
  const b = rv.boat, x = b.x, d = BOAT.deck, f = state.frame;
  // (the launch itself, its wake: surface.ts)
  drawSurfaceBoat(c, state, { x, v: b.v, on: true });
  // (the engine at the back, coughing when it's dry)
  if (b.smoke > 0 && f % 6 === 0) state.particles.push({ pos: { x: x - 20, y: d - 22 }, vel: { x: -0.5, y: -1 }, life: 40, color: '#52525B', size: 6 });
  // Artie
  const ax = x + 200, p = state.player;
  const facing = p.pos.x + p.width / 2 < ax ? -1 : 1;
  const pose = rv.artieRadio ? 'radio' : b.phase === 'jumped' && rv.artieSaid ? 'angry' : rv.artieSaid ? (b.phase === 'ride' && b.tour > 0 ? 'point' : 'talk') : 'stand';
  drawSafariArtie(c, ax, d, pose === 'point' ? 1 : facing, f, pose);
};

export const drawRiverBack = (c: Ctx, state: GameState, rv: River) => {
  if (!seen(state, x0 - 200, x1)) return;
  // Above the waterline: the far bank and its show, the water across, the dock (surface.ts)
  drawSurfaceBack(c, state);
  // The deep water, behind everything in it: its colors, the planes back to the far side, the wobble (under.ts)
  // (kept under the waterline: from above it, nothing down there shows over the surface)
  c.save(); c.beginPath(); c.rect(R(DOCK), WS, PIPE.x2 - DOCK, 3000); c.clip();
  drawUnderWater(c, state);
  c.restore();
  drawTankBack(c, state);
  drawUnderWave(c, state);
  // (the whole of it gone red with what's died in it, brown with what he's put in it: behind everything in it)
  const st = rv.stain;
  if (st.red > 0.005) box(c, R(DOCK), WS, PIPE.x2 - DOCK, 1040 - WS, `rgba(168, 10, 18, ${(st.red * 0.72).toFixed(3)})`);
  if (st.brown > 0.005) box(c, R(DOCK), WS, PIPE.x2 - DOCK, 1040 - WS, `rgba(104, 68, 22, ${(st.brown * 0.62).toFixed(3)})`);
  // (the clouds of it, thick, behind what's in the water: they're only a veil over it, in front)
  drawClouds(c, state, st.clouds, 1);
  // What's down there (under.ts, under-scenery.ts, under-tank.ts): the weed, the graveyard's junk, the dinosaurs, the
  // tank, the roof and the bed, the light coming down, the sunk rides, the eels' holes, the vents
  drawWeeds(c, state);
  drawYard(c, state);
  drawDinos(c, state);
  drawTank(c, state, rv);
  drawRockAndBed(c, state);
  drawFallsRock(c, state);
  drawRays(c, state);
  drawProps(c, state);
  drawEelHoles(c, state);
  drawVents(c, state);
  if (rv.boat.block && seen(state, rv.boat.x - 40, rv.boat.x + BOAT.w + 40)) drawBoat(c, state, rv);
};

/** The clouds in the water (blood, and his): soft blobs, see-through, kept under the surface. */
const drawClouds = (c: Ctx, state: GameState, clouds: River['stain']['clouds'], k: number) => {
  if (!clouds.length) return;
  c.save();
  c.beginPath(); c.rect(state.camera.x - 20, WS, CANVAS_WIDTH + 40, 1040 - WS); c.clip();
  for (const o of clouds) {
    if (!seen(state, o.x - o.r, o.x + o.r) || o.y + o.r < state.camera.y || o.y - o.r > state.camera.y + CANVAS_HEIGHT) continue;
    const a = Math.min(1, o.a) * 0.8 * k, rgb = o.blood ? '178, 12, 22' : '112, 72, 22';
    const g = c.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
    g.addColorStop(0, `rgba(${rgb}, ${a.toFixed(3)})`); g.addColorStop(0.55, `rgba(${rgb}, ${(a * 0.6).toFixed(3)})`); g.addColorStop(1, `rgba(${rgb}, 0)`);
    c.fillStyle = g; c.beginPath(); c.arc(o.x, o.y, o.r, 0, Math.PI * 2); c.fill();
  }
  c.restore();
};

export const drawRiverFront = (c: Ctx, state: GameState, rv: River) => {
  if (!seen(state, x0 - 200, x1)) return;
  const f = state.frame, p = state.player;
  // The water over everything in it: a tint, the surface's lit line (wavy), the falls coming down in front of the rock
  // (only in the water: not over the rock and the earth over the tunnel and the pipe)
  const a0 = Math.max(R(DOCK), state.camera.x - 20), b0 = Math.min(R(PIPE.x2), state.camera.x + CANVAS_WIDTH + 20);
  const water = () => {
    c.beginPath(); c.moveTo(a0, 1040);
    // (stepped, two pixels at a time: square to the rock's corners, never cutting across them)
    for (let x = a0; x < b0; x += 2) { const y = Math.max(WS, roofAt(x - x0)); c.lineTo(x, y); c.lineTo(Math.min(x + 2, b0), y); }
    c.lineTo(b0, 1040); c.closePath();
  };
  if (b0 > a0) { c.save(); water(); c.clip(); c.fillStyle = 'rgba(14, 116, 144, 0.16)'; c.fillRect(a0, WS, b0 - a0, 1040 - WS); c.restore(); }
  // (red with the body count, brown with him: a veil over what's in it, only in the water, not over the rock)
  const st = rv.stain;
  if (b0 > a0 && (st.red + st.brown > 0.01 || st.clouds.length)) {
    c.save();
    water(); c.clip();
    if (st.red > 0.005) { c.fillStyle = `rgba(168, 10, 18, ${(st.red * 0.1).toFixed(3)})`; c.fillRect(a0, WS, b0 - a0, 1040 - WS); }
    if (st.brown > 0.005) { c.fillStyle = `rgba(104, 68, 22, ${(st.brown * 0.1).toFixed(3)})`; c.fillRect(a0, WS, b0 - a0, 1040 - WS); }
    drawClouds(c, state, st.clouds, 0.3);
    c.restore();
  }
  // The waterline, the backside of water (surface.ts)
  drawSurfaceFront(c, state);
  // The surface from under it, the silt, the bubbles (under.ts)
  drawUnderFront(c, state, rv);
  // What's said: Artie (and the radio's static after a call), the guests behind the glass
  if (rv.boat.block) {
    const ax = rv.boat.x + 200, ay = BOAT.deck - ARTIE_H - 8;
    if (rv.artieSaid) saidOver(c, rv.artieSaid, ax, ay, '#FDE68A');
    else if (rv.static > 0) label(c, '*KSSSHHHHH*', ax + 10, ay + 20, '#A8A29E', 6);
  }
  for (const g of rv.guests) if (g.said) saidOver(c, g.said, g.x, GALLERY.glassTop + 30, '#BFDBFE');
  // His air, over his head (while it's not full)
  if (rv.o2 < 0.999 && p.health > 0 && !p.hidden) {
    const n = 6, lit = Math.ceil(rv.o2 * n), cx = p.pos.x + p.width / 2, y = p.pos.y - 18;
    for (let i = 0; i < n; i++) {
      const bx = cx - (n - 1) * 6 + i * 12;
      c.beginPath(); c.arc(bx, y, 4.5, 0, Math.PI * 2);
      if (i < lit) { c.fillStyle = rv.o2 < 0.3 && f % 20 < 10 ? '#F87171' : '#E0F2FE'; c.fill(); }
      c.strokeStyle = '#0C4A6E'; c.lineWidth = 1.5; c.stroke();
    }
  }
};
