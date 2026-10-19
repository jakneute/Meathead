// The giant atom (backstage), painted (the SNES pass: every surface in stepped ramps, dithered, inked; what glows in
// stepped halos):
//   the backdrop   the dark ride itself, through the gaps in the flats: the black-painted dome in banded violet, its
//                  fluorescent nebulae, a starfield in three depths, blacklit planets, the narrated tableaus of 2010
//                  (cut-away sets, stamped), the VOYAGE TO 2010 marquee in neon, the ride's track with the star sleds
//                  gliding along it (full of people: every look, by seed), a haze along their foot
//   the back       the backs of the sets (plywood sheets on 2x4 frames, braced, sandbagged, stenciled, the show side's
//                  black overspray; their raw ends seen in perspective at the gaps), the floor (black concrete, glow
//                  tape, cable runs, bent toward the eye), the catwalks, the road cases, the rigs and their consoles,
//                  the signs; then the queue (carpet, cove neon, the sponsor's TVs), the load platform, the tunnel
//   the front      what glows (the flames, the lasers, the fog), the air cannon's blast, the tunnel's strip curtain,
//                  what's said
// Indoors, dark: its own lighting (atomLighting): work lamps, the neon, every rig's tells.

import type { GameState } from '../../../m1/game/core/state';
import type { SceneLight, Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import {
  INK, box, text, rampOf, dark, lite, mix, stamp, hash, sign, slab, star, checker, bandedGradient, hazeBands, steppedGlow, pixelBlob,
  tilePattern, bendFloor,
} from '../../intro/art/kit';
import { lookOf } from '../../adventure/temple/people';
import { saidOver } from '../section';
import { GY } from '../geometry';
import {
  A, x1, THRUSTERS, thrustAt, flameBox, ROCKET_BODY, SWINGS, swingBall, SHOWER, showerAt, AIRLOCKS, AIRLOCK_TOP, airlockAt,
  AIRLOCK_POST, CANNON, cannonAt, FLOOR_LASER, floorLaserAt, SWEEP_LASER, sweepSpot, sweepState, LASER_POST, FOG_XS, BLACKLIGHT,
  QUEUE_DOOR, LINE_X0, LINE_X1, PLATFORM_X, CONSOLE_X, SLED_X, TUNNEL_X, QUEUE, LEDGES, SOLIDS, POSTS, type Thruster,
} from './layout';
import { crewed } from './rigs';
import { drawAtomPerson } from './people';
import { drawSled, seatedIn, HIS_SLED, FRONT_SLED, SEATS } from '../ride/sled';
import { cyl, sphere, neonBar, lamp, truss, rivets, hazard, screenGlass, stencil } from './snes';
import { lettering, letterSize } from '../square/lettering';
import { plate, plateSize, plateBoxAt, wallPlate, legs, cables, brackets, type Letter } from './signs';
import type { Hijack } from './hijack';

type Ctx = CanvasRenderingContext2D;

/** Plywood (darkest first), the 2x4s, steel. */
const PLY = ['#2B1F14', '#3E2E1E', '#56412D', '#6E563C', '#8C724F'];
const LUMBER = rampOf('#8F7150');
const STEEL = rampOf('#52525B');

// ---------------------------------------------------------------------------------------------------------------
// The dark ride, through the gaps (screen space, parallax)

/** A rider's head and shoulders (tiny: in a sled way back in the ride), by seed. */
export const tinyRider = (c: Ctx, x: number, y: number, seed: number, k = 1) => {
  const L = lookOf(seed);
  box(c, x - 5 * k, y - 4 * k, 10 * k, 8 * k, L.shirt); box(c, x - 5 * k, y - 4 * k, 10 * k, 2 * k, lite(L.shirt, 0.25));
  box(c, x - 3.5 * k, y - 12 * k, 7 * k, 8 * k, L.skin); box(c, x + 1.5 * k, y - 12 * k, 2 * k, 8 * k, dark(L.skin, 0.2));
  if (!L.bald) box(c, x - 4 * k, y - 13 * k, 8 * k, 3 * k, L.hair);
  if (L.long && !L.bald) box(c, x - 4 * k, y - 11 * k, 2 * k, 7 * k, L.hair);
};
/** A far star sled (the ride's own, going round), its two riders, at screen (x, y). */
export const tinySled = (c: Ctx, x: number, y: number, seed: number, f: number, k = 0.5) => {
  tinyRider(c, x + 8 * k, y - 22 * k, seed, k * 1.6); tinyRider(c, x - 22 * k, y - 22 * k, seed * 7 + 3, k * 1.6);
  const L = x - 70 * k, T = y - 24 * k, w = 150 * k, h = 18 * k;
  box(c, L - 1, T - 1, w + 2, h + 2, INK);
  box(c, L, T, w, h, '#CBD5E1'); box(c, L, T, w, h * 0.28, '#F1F5F9'); box(c, L, T + h * 0.72, w, h * 0.28, '#94A3B8');
  box(c, L, T + h * 0.42, w, Math.max(1, 3 * k), '#DC2626');
  c.fillStyle = INK; c.beginPath(); c.moveTo(L + w, T - 1); c.lineTo(L + w + 24 * k, T + h * 0.6); c.lineTo(L + w, T + h + 1); c.closePath(); c.fill();
  c.fillStyle = '#E2E8F0'; c.beginPath(); c.moveTo(L + w, T + 1); c.lineTo(L + w + 19 * k, T + h * 0.6); c.lineTo(L + w, T + h - 1); c.closePath(); c.fill();
  c.fillStyle = '#B91C1C'; c.beginPath(); c.moveTo(L + 4 * k, T); c.lineTo(L - 10 * k, T - 14 * k); c.lineTo(L + 20 * k, T); c.closePath(); c.fill();
  for (let i = 0; i < 4; i++) box(c, L + 10 * k + i * 36 * k, T + h - 6 * k, Math.max(1, 4 * k), Math.max(1, 3 * k), (Math.floor(f / 4) + i) % 4 === 0 ? '#A5F3FC' : '#334155');
};

/** The ride's scenes, way back (the parallax layer's), one after another and round again: what's painted on each. */
export const TABLEAUS = ['home', 'office', 'cars', 'moon'] as const;
type Tab = typeof TABLEAUS[number];

/** A half dome (the top half of a sphere), sat on y. */
const dome = (g: Ctx, x: number, y: number, r: number, col: string) => {
  g.save(); g.beginPath(); g.rect(x - r - 3, y - r - 3, r * 2 + 6, r + 3); g.clip(); sphere(g, x, y, r, col); g.restore();
  box(g, x - r - 2, y - 2, r * 2 + 4, 3, INK);
};

/** A tableau's still part, in its own space (its floor's left end at 0, 0). */
const tabStill = (g: Ctx, kind: Tab) => {
  switch (kind) {
    case 'home': {
      // the home of 2010: a ranch house cut away, its pink boomerang roof, starburst wallpaper, the family on the couch
      slab(g, -8, -6, 236, 12, '#4C1D95');
      const wp = rampOf('#4338CA');
      box(g, -2, -122, 224, 118, INK); box(g, 0, -120, 220, 116, wp[2]);
      for (let i = 0; i < 220; i += 18) box(g, i + 6, -120, 6, 116, wp[3]);
      for (let i = 0; i < 9; i++) star(g, 14 + hash(i * 3.3) * 190, -100 + hash(i * 7.7) * 60, 4, wp[4]);
      box(g, 0, -120, 220, 8, wp[0]); checker(g, 0, -112, 220, 2, wp[0]);
      box(g, 0, -16, 220, 10, '#1E1B4B'); box(g, 0, -16, 220, 2, '#312E81');
      // (the window: the city of 2010 out of it, a flying car going by)
      box(g, 12, -100, 54, 44, INK); bandedGradient(g, 14, -98, 50, 40, ['#0B1E4D', '#1E3A8A', '#7C3AED'], 5);
      for (let i = 0; i < 6; i++) box(g, 16 + hash(i + 40) * 44, -96 + hash(i * 5) * 20, 1, 1, '#F8FAFC');
      for (let i = 0; i < 4; i++) box(g, 18 + i * 11, -70 + (i % 2) * 6, 8, 12 - (i % 2) * 6, '#312E81');
      box(g, 38, -88, 12, 4, '#F43F5E'); box(g, 41, -91, 6, 3, '#BAE6FD');
      box(g, 38, -98, 2, 40, INK); box(g, 14, -79, 50, 2, INK);
      // (the roof: a pink boomerang, banded)
      g.save(); g.beginPath(); g.moveTo(-14, -118); g.lineTo(110, -170); g.lineTo(234, -118); g.lineTo(226, -112); g.lineTo(110, -158); g.lineTo(-6, -112); g.closePath();
      g.fillStyle = INK; g.fill(); g.clip();
      bandedGradient(g, -14, -172, 250, 62, ['#FBCFE8', '#F472B6', '#BE185D', '#831843'], 6);
      g.restore();
      // (the couch: three cushions, gold legs)
      const cr = rampOf('#BE185D');
      box(g, 16, -54, 100, 40, INK);
      box(g, 18, -52, 96, 18, cr[2]); box(g, 18, -52, 96, 3, cr[4]); box(g, 18, -36, 96, 2, cr[1]);
      for (let i = 0; i < 3; i++) { box(g, 22 + i * 30, -34, 28, 12, cr[3]); box(g, 22 + i * 30, -34, 28, 2, cr[4]); box(g, 22 + i * 30 + 26, -34, 2, 12, cr[1]); }
      box(g, 18, -22, 96, 6, cr[0]);
      box(g, 12, -44, 10, 28, INK); box(g, 13, -43, 8, 26, cr[1]); box(g, 110, -44, 10, 28, INK); box(g, 111, -43, 8, 26, cr[1]);
      box(g, 24, -16, 4, 10, '#FDE047'); box(g, 104, -16, 4, 10, '#FDE047');
      for (const [i, s] of [[0, 711], [1, 822], [2, 933]] as const) tinyRider(g, 36 + i * 30, -38, s, 1.2);
      // (the set's walls are flats: their raw edge at the end, braced from behind)
      flatEdge(g, 220, -120, -4);
      // (the lava lamp on its side table)
      box(g, 124, -30, 22, 4, INK); box(g, 125, -29, 20, 2, '#A16207'); box(g, 133, -26, 4, 20, '#78350F');
      g.fillStyle = INK; g.beginPath(); g.moveTo(129, -32); g.lineTo(141, -32); g.lineTo(138, -58); g.lineTo(132, -58); g.closePath(); g.fill();
      g.fillStyle = '#C026D3'; g.beginPath(); g.moveTo(130, -33); g.lineTo(140, -33); g.lineTo(137, -57); g.lineTo(133, -57); g.closePath(); g.fill();
      box(g, 133, -50, 4, 5, '#FDE047'); box(g, 134, -42, 3, 3, '#FDE047');
      break;
    }
    case 'office': {
      // the paperless office: a ceiling of light panels, beige computers, a man with a fax machine on his belt, and
      // round the side of the second desk, every bit of the paper
      box(g, -2, -134, 244, 136, INK);
      bandedGradient(g, 0, -132, 240, 124, ['#155E75', '#0E7490', '#155E75', '#083344'], 6);
      box(g, 0, -132, 240, 12, '#CBD5E1'); for (let i = 0; i < 3; i++) { box(g, 18 + i * 78, -130, 52, 6, '#F0FDFA'); box(g, 18 + i * 78, -126, 52, 2, '#99F6E4'); }
      box(g, 0, -120, 240, 2, '#475569');
      box(g, 0, -10, 240, 10, '#334155'); for (let i = 0; i < 240; i += 16) box(g, i, -10, 1, 10, '#475569');
      for (const dx of [16, 146]) {
        slab(g, dx, -38, 74, 8, '#E2E8F0');
        box(g, dx + 6, -30, 4, 22, '#64748B'); box(g, dx + 64, -30, 4, 22, '#64748B');
        // (a beige computer: the monitor, its green text, the keyboard)
        slab(g, dx + 26, -64, 30, 26, '#D6D3D1'); box(g, dx + 30, -60, 22, 16, '#052E16');
        for (let k = 0; k < 4; k++) box(g, dx + 32, -58 + k * 4, 6 + hash(dx + k) * 12, 1, '#4ADE80');
        box(g, dx + 22, -42, 34, 4, INK); box(g, dx + 23, -41, 32, 2, '#A8A29E');
      }
      tinyRider(g, 50, -38, 1404, 1.2); tinyRider(g, 186, -38, 1707, 1.2);
      flatEdge(g, 240, -132, -8);
      // (his fax machine, on his belt)
      box(g, 40, -38, 12, 8, INK); box(g, 41, -37, 10, 6, '#A8A29E'); box(g, 43, -42, 6, 4, '#F8FAFC');
      // (the paper: all of it, stacked round the side)
      for (let i = 0; i < 11; i++) { const px = 222 + (i % 3) - 1; box(g, px - 1, -10 - (i + 1) * 7, 22, 8, INK); box(g, px, -9 - (i + 1) * 7, 20, 6, '#F8FAFC'); box(g, px, -4 - (i + 1) * 7, 20, 1, '#CBD5E1'); }
      break;
    }
    case 'cars': {
      // traffic, 2010: a city of domed towers, a monorail through it, in front of a painted drop (the sky of 2010,
      // banded, hung off the pipe, its hem weighted); the billboard's legs down to the deck
      drop(g, 4, BATTEN_Y + 6, 232, -BATTEN_Y - 10, ['#1E1B4B', '#2E1065', '#4C1D95', '#6D28D9', '#7C3AED']);
      for (let i = 0; i < 14; i++) box(g, 10 + hash(i * 5.3) * 220, -196 + hash(i * 2.9) * 70, 1, 1, '#E9D5FF');
      legs(g, [52, 188], -176, 0, '#57534E', 6);
      for (let k = 0; k < 4; k++) {
        const dx = 20 + k * 52, h = 40 + k * 10;
        cyl(g, dx, -h, 40, h, ['#6D28D9', '#7C3AED', '#5B21B6', '#6D28D9'][k], 'y');
        for (let r = 0; r < h - 10; r += 10) for (let q = 0; q < 3; q++) box(g, dx + 7 + q * 10, -h + 6 + r, 4, 5, hash(k * 31 + r + q) > 0.45 ? '#FDE68A' : '#2E1065');
        dome(g, dx + 20, -h, 20, '#C4B5FD');
      }
      box(g, -4, -32, 248, 8, INK); box(g, -4, -31, 248, 3, '#E2E8F0'); box(g, -4, -28, 248, 3, '#94A3B8');
      break;
    }
    case 'moon': {
      // the moon base (theirs, and ours, bigger): domes on a gray moon, its craters, the Earth up over it (on its line
      // off the pipe), two flags; a black starfield drop behind
      drop(g, 4, BATTEN_Y + 6, 232, -BATTEN_Y - 10, ['#020617', '#0B1022', '#111833', '#0B1022']);
      for (let i = 0; i < 18; i++) box(g, 10 + hash(i * 3.1) * 220, -200 + hash(i * 7.3) * 150, i % 4 ? 1 : 2, i % 4 ? 1 : 2, i % 3 ? '#94A3B8' : '#F8FAFC');
      cables(g, [210], BATTEN_Y + 3, -175, '#71717A');
      g.save(); g.beginPath(); g.ellipse(120, 0, 150, 40, 0, Math.PI, 0); g.closePath(); g.fillStyle = INK; g.fill(); g.clip();
      bandedGradient(g, -32, -42, 304, 44, ['#E2E8F0', '#94A3B8', '#64748B', '#334155'], 6);
      for (const [cx, cy, r] of [[40, -12, 10], [118, -24, 7], [206, -10, 12], [170, -30, 5]] as const) {
        g.fillStyle = '#CBD5E1'; g.beginPath(); g.ellipse(cx + 1, cy + 1, r, r * 0.4, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#475569'; g.beginPath(); g.ellipse(cx, cy, r, r * 0.4, 0, 0, Math.PI * 2); g.fill();
      }
      g.restore();
      for (const [dx, r] of [[60, 34], [150, 46]] as const) {
        dome(g, dx, -26, r, '#CBD5E1');
        box(g, dx - r * 0.5, -26 - r * 0.6, r * 0.3, r * 0.2, '#0C4A6E'); box(g, dx - r * 0.5, -26 - r * 0.6, r * 0.3, 2, '#7DD3FC');
      }
      sphere(g, 210, -160, 14, '#2563EB');
      pixelBlob(g, 206, -164, 6, 4, '#16A34A'); pixelBlob(g, 214, -154, 4, 3, '#16A34A');
      // (theirs: CCCP, still)
      box(g, 19, -112, 4, 72, INK); box(g, 20, -110, 2, 70, '#E2E8F0');
      box(g, 22, -112, 30, 20, INK); box(g, 23, -111, 28, 18, '#DC2626'); box(g, 23, -111, 28, 3, '#F87171'); box(g, 23, -96, 28, 3, '#991B1B');
      text(g, 'CCCP', 37, -98, '#FDE047', 5, 'center', null);
      // (ours)
      box(g, 209, -132, 4, 92, INK); box(g, 210, -130, 2, 90, '#E2E8F0');
      box(g, 212, -132, 40, 26, INK); box(g, 213, -131, 38, 24, '#F8FAFC');
      for (let k = 0; k < 4; k++) box(g, 213, -129 + k * 6, 38, 3, '#DC2626');
      box(g, 213, -131, 16, 12, '#1D4ED8'); for (let k = 0; k < 4; k++) box(g, 215 + (k % 2) * 7, -129 + (k >> 1) * 5, 1, 1, '#FFFFFF');
      break;
    }
  }
};

/** A tableau's moving part (Robo-Butler, the wall screen, the flying cars, the dome's beacon). */
const tabLive = (c: Ctx, kind: Tab, f: number) => {
  switch (kind) {
    case 'home': {
      // (the robot butler: a can on wheels, its tray out, pills)
      cyl(c, 150, -70, 30, 52, '#94A3B8', 'y');
      slab(c, 155, -90, 20, 20, '#CBD5E1');
      const lit = f % 50 < 40;
      lamp(c, 160, -81, 2.5, '#F87171', lit, 0); lamp(c, 170, -81, 2.5, '#F87171', lit, 0);
      box(c, 164, -98, 2, 8, INK); lamp(c, 165, -100, 2.5, '#FDE047', (f >> 4) % 2 === 0, 2);
      const bob = Math.round(Math.sin(f * 0.05) * 3);
      box(c, 178, -60 + bob, 32, 6, INK); box(c, 179, -59 + bob, 30, 4, '#E5E7EB'); box(c, 179, -59 + bob, 30, 1, '#FFFFFF');
      for (let k = 0; k < 3; k++) { box(c, 183 + k * 8, -64 + bob, 5, 5, INK); box(c, 184 + k * 8, -63 + bob, 3, 3, ['#F472B6', '#FDE047', '#4ADE80'][k]); }
      box(c, 174, -58, 6, 4, '#64748B');
      break;
    }
    case 'office': {
      const up = f % 240 < 120;
      screenGlass(c, 70, -114, 110, 52, up ? '#22D3EE' : '#0891B2', f, '#1E293B');
      text(c, 'PROFITS', 100, -100, '#0F172A', 6, 'center', null);
      const n = Math.floor(f / 20) % 6;
      for (let k = 0; k < 4; k++) { const h = 6 + k * 6 + (k === 3 ? n * 2 : 0); box(c, 132 + k * 10, -70 - h, 7, h, INK); box(c, 133 + k * 10, -69 - h, 5, h - 1, k === 3 ? '#FDE047' : '#F8FAFC'); }
      break;
    }
    case 'cars': {
      for (let k = 0; k < 3; k++) {
        const cx = Math.round(((f * (1 + k * 0.4) + k * 90) % 240)), cy = -150 + k * 28, col = ['#F43F5E', '#FACC15', '#22D3EE'][k], r = rampOf(col);
        box(c, cx, BATTEN_Y + 3, 1, cy - 12 - BATTEN_Y - 3, '#64748B'); box(c, cx - 1, cy - 12, 3, 2, '#94A3B8');
        box(c, cx - 19, cy - 1, 38, 12, INK); box(c, cx - 18, cy, 36, 10, r[2]); box(c, cx - 18, cy, 36, 3, r[4]); box(c, cx - 18, cy + 7, 36, 3, r[0]);
        box(c, cx - 11, cy - 8, 22, 8, INK); box(c, cx - 10, cy - 7, 20, 7, '#BAE6FD'); box(c, cx - 8, cy - 6, 6, 2, '#F0F9FF');
        box(c, cx + 18, cy + 3, 2, 3, '#FEF3C7'); box(c, cx - 20, cy + 3, 2, 3, '#EF4444');
      }
      break;
    }
    case 'moon': {
      lamp(c, 150, -76, 2.5, '#EF4444', (f >> 4) % 2 === 0, 3);
      break;
    }
  }
};

/** The pipe across the light trees' tops (what the words and the flying things hang off), the trees, the deck: in the
 *  tableau's own space (the deck's top at 0). */
const BATTEN_Y = -214, TREE_XS = [-20, 260] as const, DECK_X0 = -34, DECK_X1 = 274;
/** Each set's gel (its lanterns' color). */
const GEL: Record<Tab, string> = { home: '#F9A8D4', office: '#67E8F9', cars: '#C4B5FD', moon: '#E2E8F0' };
/** A painted drop (a cloth backdrop): hung off the pipe by its ties, its bands, a pipe in its hem to weight it. */
const drop = (g: Ctx, x: number, y: number, w: number, h: number, bands: string[]) => {
  box(g, x - 1, y - 1, w + 2, h + 2, INK);
  bandedGradient(g, x, y, w, h, bands, 6);
  for (let i = 12; i < w; i += 24) checker(g, x + i, y, 2, h, mix(bands[0], INK, 0.3));
  cyl(g, x - 2, y + h - 4, w + 4, 5, '#3F3F46');
  for (let i = 8; i < w; i += 30) { box(g, x + i, y - 4, 2, 6, INK); box(g, x + i, y - 3, 1, 4, '#71717A'); }
};
/** A flat's raw edge (the set's wall seen end on): the plywood's edge, the 2x4 frame, the jack bracing it from behind. */
const flatEdge = (g: Ctx, x: number, top: number, bot: number) => {
  for (const [lw, cl] of [[5, INK], [3, LUMBER[1]], [1, LUMBER[3]]] as const) { g.lineWidth = lw; g.strokeStyle = cl; g.beginPath(); g.moveTo(x + 3, top + 10); g.lineTo(x + 18, -2); g.stroke(); }
  pixelBlob(g, x + 18, -4, 6, 3, '#44403C');
  box(g, x, top, 5, bot - top, INK); box(g, x, top + 1, 2, bot - top - 2, PLY[4]); box(g, x + 2, top + 1, 2, bot - top - 2, LUMBER[1]);
};
/** A lantern (a fresnel on its yoke, clamped to the tree): its body, its barn doors, its lens gelled, aimed `dir`. */
const lantern = (g: Ctx, x: number, y: number, dir: 1 | -1, gel: string) => {
  box(g, x - 2, y - 2, 4, 10, INK);
  const bx = dir > 0 ? x + 2 : x - 16;
  box(g, bx - 1, y - 6, 16, 14, INK); box(g, bx, y - 5, 14, 12, '#3F3F46'); box(g, bx, y - 5, 14, 2, '#71717A'); box(g, bx + 2, y - 8, 3, 3, '#27272A');
  const lx = dir > 0 ? bx + 14 : bx - 3;
  box(g, lx - 1, y - 7, 5, 16, INK); box(g, lx, y - 5, 3, 12, gel); box(g, lx, y - 5, 1, 4, '#FFFFFF');
  box(g, lx + dir * 2, y - 10, 4, 3, '#27272A'); box(g, lx + dir * 2, y + 9, 4, 3, '#27272A');
};
/** The stage behind the set: the light trees on their sandbagged bases, the pipe across their tops. */
const stageBack = (g: Ctx) => {
  for (const tx of TREE_XS) {
    cyl(g, tx - 3, BATTEN_Y, 6, -BATTEN_Y - 4, '#3F3F46', 'y');
    box(g, tx - 14, -6, 28, 6, INK); box(g, tx - 13, -5, 26, 4, '#52525B'); box(g, tx - 13, -5, 26, 1, '#A1A1AA');
    pixelBlob(g, tx + 7, -8, 6, 4, '#44403C'); box(g, tx + 3, -11, 6, 2, '#78716C');
  }
  cyl(g, TREE_XS[0] - 5, BATTEN_Y - 3, TREE_XS[1] - TREE_XS[0] + 10, 6, '#3F3F46');
  for (const tx of TREE_XS) { box(g, tx - 5, BATTEN_Y - 5, 10, 10, INK); box(g, tx - 4, BATTEN_Y - 4, 8, 8, '#52525B'); }
  // (the lanterns' cable, taped down the left tree)
  box(g, TREE_XS[0] + 3, BATTEN_Y + 10, 2, -BATTEN_Y - 14, '#18181B');
};
/** In front of the set: the lanterns and their beams (gelled, two stepped bands, see-through), the deck's front (its
 *  top dull, not lit: nothing to stand on; its black skirt in pleats; the spike tape along its edge). */
const stageFront = (g: Ctx, kind: Tab) => {
  const gel = GEL[kind];
  for (const [tx, dir] of [[TREE_XS[0], 1], [TREE_XS[1], -1]] as const) for (const ly of [-160, -96]) {
    const lx = tx + dir * 18, aim = 120, ay = -44;
    for (const [spread, a] of [[44, 0.05], [22, 0.06]] as const) {
      g.globalAlpha = a; g.fillStyle = gel; g.beginPath(); g.moveTo(lx, ly - 4); g.lineTo(aim, ay - spread); g.lineTo(aim, ay + spread); g.lineTo(lx, ly + 4); g.closePath(); g.fill();
    }
    g.globalAlpha = 1;
    lantern(g, tx, ly, dir, gel);
  }
  box(g, DECK_X0, -1, DECK_X1 - DECK_X0, 4, INK); box(g, DECK_X0 + 1, 0, DECK_X1 - DECK_X0 - 2, 2, '#3F3F46');
  box(g, DECK_X0, 3, DECK_X1 - DECK_X0, 14, '#0B0B12');
  for (let x = DECK_X0 + 2; x < DECK_X1 - 2; x += 6) box(g, x, 3, 2, 14, '#18181F');
  box(g, DECK_X0, 3, DECK_X1 - DECK_X0, 1, '#27272A');
  for (let x = DECK_X0 + 20; x < DECK_X1 - 20; x += 60) box(g, x, 0, 6, 2, '#65A30D');
};
const plateBox = plateBoxAt;
/** A board, painted straight in (inside a stamp already). */
const signBoard = (g: Ctx, t: string, font: Letter, x: number, y: number, face: string, ink: string, pad: number) => {
  const [w, h] = plateSize(t, font, pad), hw = Math.round(w / 2), hh = Math.round(h / 2);
  sign(g, Math.round(x) - hw, Math.round(y) - hh, w, h, face, '', ink);
  lettering(g, t, Math.round(x), Math.round(y), font, ink, face, true);
};
/** The set's words, physically there (lettered, held up by what's on the stage), over all of it (nothing covers them):
 *    home    a cloth banner hung off the pipe on two straps
 *    office  a projection: a pull-down screen hung off the pipe, the slide projector clamped to the right tree
 *    cars    a billboard on legs standing on the deck, two gooseneck lamps over it
 *    moon    a board hung off the pipe on two cables, in chrome */
const tabCaption = (g: Ctx, kind: Tab) => {
  switch (kind) {
    case 'home': {
      const cx = 110, cy = -190, [w] = letterSize('HOME, 2010', 'enamel'), bw = w + 18, bh = 24, x0 = Math.round(cx - bw / 2), top = cy - bh / 2;
      cables(g, [x0 + 8, x0 + bw - 12], BATTEN_Y + 3, top + 2, '#A1A1AA', true);
      // (the cloth: a hem along its top, its bottom cut in swallowtails)
      const P = rampOf('#BE185D');
      box(g, x0 - 1, top - 1, bw + 2, bh + 2, INK);
      bandedGradient(g, x0, top, bw, bh, [P[3], P[2], P[2], P[1]], 4);
      box(g, x0, top, bw, 3, P[4]); box(g, x0, top + 3, bw, 1, P[0]);
      checker(g, x0, top + bh - 7, bw, 2, P[1]);
      g.fillStyle = INK;
      for (let i = 0; i < bw; i += 12) { g.beginPath(); g.moveTo(x0 + i, top + bh + 1); g.lineTo(x0 + i + 6, top + bh - 4); g.lineTo(x0 + i + 12, top + bh + 1); g.closePath(); g.fill(); }
      lettering(g, 'HOME, 2010', cx, cy - 1, 'enamel', '#FDF2F8', P[2], true);
      break;
    }
    case 'office': {
      const x0 = 14, x1 = 226, top = -204, bot = -172;
      // (the projector, clamped to the right tree; its beam out to the screen)
      g.globalAlpha = 0.07; g.fillStyle = '#E0F2FE';
      g.beginPath(); g.moveTo(236, -144); g.lineTo(x0, top); g.lineTo(x0, bot); g.lineTo(236, -138); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(236, -144); g.lineTo(x0 + 70, top + 4); g.lineTo(x0 + 70, bot - 4); g.lineTo(236, -138); g.closePath(); g.fill();
      g.globalAlpha = 1;
      box(g, 244, -134, 18, 4, INK); box(g, 245, -133, 16, 2, '#71717A');
      box(g, 238, -148, 20, 14, INK); box(g, 239, -147, 18, 12, '#57534E'); box(g, 239, -147, 18, 2, '#A8A29E');
      box(g, 235, -144, 4, 6, INK); box(g, 236, -143, 2, 4, '#E0F2FE');
      g.strokeStyle = INK; g.lineWidth = 2; for (const rx of [244, 252]) { g.beginPath(); g.arc(rx, -153, 4, 0, Math.PI * 2); g.stroke(); }
      // (the screen: its roller case hung off the pipe, the cloth, the bar in its hem)
      cables(g, [x0 + 20, x1 - 20], BATTEN_Y + 3, top - 5, '#71717A');
      cyl(g, x0 - 4, top - 7, x1 - x0 + 8, 6, '#D4D4D8');
      box(g, x0 - 1, top, x1 - x0 + 2, bot - top + 1, INK);
      bandedGradient(g, x0, top, x1 - x0, bot - top, ['#F1F5F9', '#E2E8F0', '#CBD5E1'], 4);
      box(g, x0 - 2, bot - 1, x1 - x0 + 4, 4, INK); box(g, x0 - 1, bot, x1 - x0 + 2, 2, '#71717A');
      lettering(g, 'OFFICE, 2010: NO PAPER!', (x0 + x1) / 2, (top + bot) / 2 - 1, 'neon', '#0E7490', '#E2E8F0', true);
      break;
    }
    case 'cars': {
      const [x0, y0, x1] = plateBox('TRAFFIC? NOT IN 2010!', 'enamel', 120, -188, 6);
      for (const lx of [x0 + 30, x1 - 40]) {
        box(g, lx - 1, y0 - 10, 3, 12, INK); box(g, lx, y0 - 9, 1, 10, '#A1A1AA');
        box(g, lx - 1, y0 - 12, 10, 3, INK); box(g, lx, y0 - 11, 8, 1, '#A1A1AA');
        box(g, lx + 6, y0 - 14, 9, 7, INK); box(g, lx + 7, y0 - 13, 7, 4, '#52525B'); box(g, lx + 7, y0 - 9, 7, 1, '#FEF9C3');
      }
      signBoard(g, 'TRAFFIC? NOT IN 2010!', 'enamel', 120, -188, '#FEF3C7', '#B91C1C', 6);
      break;
    }
    case 'moon': {
      const [x0, y0, x1] = plateBox('THE MOON, 2010', 'chrome', 112, -192, 6);
      cables(g, [x0 + 12, x1 - 12], BATTEN_Y + 3, y0 + 2, '#A1A1AA');
      signBoard(g, 'THE MOON, 2010', 'chrome', 112, -192, '#0F172A', '#E2E8F0', 6);
      break;
    }
  }
};

/** A tableau: the set on its stage (stamped), what moves in it, the lanterns and the deck's front, then (`dim`: a wash
 *  over the set, not its words) its words. Its deck's top at (x, y). */
export const drawTableau = (c: Ctx, kind: Tab, x: number, y: number, f: number, dim?: string) => {
  c.save(); c.translate(Math.round(x), Math.round(y));
  stamp(c, `atom-tab2-${kind}`, -52, -236, 344, 256, g => { stageBack(g); tabStill(g, kind); });
  tabLive(c, kind, f);
  stamp(c, `atom-tabfront-${kind}`, -52, -200, 344, 220, g => stageFront(g, kind));
  if (dim) { c.fillStyle = dim; c.fillRect(-52, -236, 344, 256); }
  stamp(c, `atom-tabcap-${kind}`, -10, -226, 290, 100, g => tabCaption(g, kind));
  c.restore();
};

/** A blacklit planet (its halo, its ring round behind it and round in front), stamped, its middle at (x, y). */
export const planet = (c: Ctx, x: number, y: number, r: number, col: string, ring: boolean) => {
  r = Math.round(r);
  c.save(); c.translate(Math.round(x), Math.round(y));
  stamp(c, `atom-planet-${col}-${r}-${ring ? 1 : 0}`, -r * 2 - 8, -r * 2 - 8, r * 4 + 16, r * 4 + 16, g => {
    steppedGlow(g, 0, 0, r * 1.7, col, 0.2, 0.02, 5);
    const rp = rampOf(col), arc = (back: boolean) => {
      for (const [w, cl] of [[7, INK], [5, rp[1]], [3, rp[3]], [1, rp[4]]] as const) { g.lineWidth = w; g.strokeStyle = cl; g.beginPath(); g.ellipse(0, 0, r * 1.75, r * 0.36, -0.2, back ? Math.PI : 0, back ? Math.PI * 2 : Math.PI); g.stroke(); }
    };
    if (ring) arc(true);
    sphere(g, 0, 0, r, col);
    // (its bands: a darker stripe or two across it)
    g.save(); g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.clip();
    checker(g, -r, Math.round(r * 0.15), r * 2, 4, rp[1]); checker(g, -r, Math.round(-r * 0.4), r * 2, 2, rp[1], 1);
    g.restore();
    if (ring) arc(false);
  });
  c.restore();
};

/** Which scene's through which gap (the sixth's the traffic: the air cannon stands in front of it, and the office's
 *  PROFITS screen was behind the cannon). */
const GAP_SCENES: Tab[] = ['home', 'office', 'cars', 'moon', 'home', 'cars', 'moon'];
/** Where the VOYAGE TO 2010 marquee hangs in each gap (screen y of its words). */
const MARQUEE_Y = 121;
/** Screen space: the dark ride, way back (through the gaps in the flats). */
export const drawRideBackdrop = (c: Ctx, state: GameState) => {
  const W = CANVAS_WIDTH, H = CANVAS_HEIGHT, f = state.frame, cam = state.camera.x;
  const tk = 0.4, ty = 420;
  // (the dome: painted black, in the dark it's a deep violet in bands down to the track)
  bandedGradient(c, 0, 0, W, ty + 70, ['#04030C', '#0A0620', '#140A30', '#1C0D3D', '#0C0620'], 18);
  box(c, 0, ty + 70, W, H - ty - 70, '#020108');
  // (its fluorescent nebulae, painted on: way back, slow)
  const nk = 0.05;
  for (let k = -1; k < 3; k++) {
    const base = Math.floor(cam * nk / 700) + k, nx = base * 700 - cam * nk + 200 + hash(base * 2.1) * 300, ny = 140 + hash(base * 4.3) * 140;
    c.globalAlpha = 0.16; pixelBlob(c, nx, ny, 190, 70, ['#7E22CE', '#0E7490', '#BE185D'][((base % 3) + 3) % 3], 4);
    c.globalAlpha = 0.14; pixelBlob(c, nx + 50, ny - 10, 110, 40, ['#C026D3', '#06B6D4', '#F472B6'][((base % 3) + 3) % 3], 4);
    c.globalAlpha = 1;
  }
  // (the starfield, painted on the black, in three depths: the far ones dim and slow, the near ones bright, twinkling)
  for (let i = 0; i < 170; i++) {
    const depth = i % 3, sp = [0.06, 0.12, 0.18][depth];
    const sx = ((i * 211.7 - cam * sp) % W + W) % W, sy = (i * 97.3) % (ty - 20);
    if (depth === 0) box(c, sx, sy, 1, 1, '#64748B');
    else if (depth === 1) box(c, sx, sy, 2, 2, i % 7 ? '#94A3B8' : '#C4B5FD');
    else {
      const tw = (f + i * 13) % 90 < 8;
      box(c, sx, sy, 2, 2, '#F8FAFC');
      if (tw || i % 11 === 0) { box(c, sx - 2, sy, 6, 2, tw ? '#E0E7FF' : '#64748B'); box(c, sx, sy - 2, 2, 6, tw ? '#E0E7FF' : '#64748B'); box(c, sx, sy, 2, 2, '#FFFFFF'); }
    }
  }
  // (the planets, blacklit, hung way up)
  const pk = 0.22;
  for (let k = -1; k < 3; k++) {
    const base = Math.floor(cam * pk / 900) + k, px = base * 900 - cam * pk + 300 + hash(base) * 300, py = 110 + hash(base * 3) * 80;
    const col = ['#DB2777', '#2563EB', '#16A34A', '#F59E0B'][((base % 4) + 4) % 4], r = 40 + hash(base * 7) * 30;
    planet(c, px, py, r, col, hash(base * 5) > 0.4);
  }
  // (the tableaus, along the ride's track, and the track with the sleds going round)
  // (one in each gap in the flats, held near its middle (drifting a little the far way: it's way back), so its words
  // are never cut off by the flats either side of the gap)
  const inGaps: { i: number; mid: number }[] = [];
  GAPS.forEach(([gx, gw], i) => { const mid = gx + gw / 2 - cam; if (mid > -gw && mid < W + gw) inGaps.push({ i, mid }); });
  // (where the airlocks' ceiling crosses a gap, its scene's sat lower: its words came out under the ceiling)
  // (sat lower, it's nearer: the far track runs behind it, not across its middle, so it's drawn after the track)
  const isLow = (i: number) => { const [gx, gw] = GAPS[i]; return gx + gw > A + 3900 && gx < A + 4860; };
  const tableauIn = (g: { i: number; mid: number }) => drawTableau(c, GAP_SCENES[g.i % GAP_SCENES.length], g.mid - 120 - (g.mid - W / 2) * 0.1, ty - 24 + (isLow(g.i) ? 84 : 0), f);
  for (const g of inGaps) if (!isLow(g.i)) tableauIn(g);
  // (a haze along their foot: it's a long way back)
  hazeBands(c, 0, ty - 46, W, 44, '#2E1065', 0, 0.42, 5);
  // the track: the rail, its supports, the guide lights along it, chasing
  box(c, 0, ty - 7, W, 7, INK); box(c, 0, ty - 6, W, 2, '#64748B'); box(c, 0, ty - 4, W, 2, '#334155');
  for (let k = 0; k < 12; k++) { const sx = ((k * 90 - cam * tk) % W + W) % W; box(c, sx - 1, ty, 6, 72, INK); box(c, sx, ty, 4, 72, '#1E293B'); box(c, sx, ty, 1, 72, '#334155'); }
  for (let k = 0; k < 40; k++) { const sx = ((k * 20 - cam * tk) % W + W) % W; box(c, sx, ty + 2, 2, 2, (k + (f >> 3)) % 5 === 0 ? '#67E8F9' : '#164E63'); }
  for (let k = 0; k < 4; k++) {
    const wx = ((f * 1.3 + k * 380) % 1600) - cam * tk;
    const sx = ((wx % 1600) + 1600) % 1600 - 200;
    tinySled(c, sx, ty - 6, 3001 + k * 97, f, 0.5);
  }
  for (const g of inGaps) if (isLow(g.i)) tableauIn(g);
  // (the VOYAGE TO 2010 marquee, in neon on a chrome-framed board, bulbs chasing round it)
  // (in each gap, over its scene, like the scenes: never cut off by the flats; up clear of the scenes' own words, the
  // airlock sign and the meteor rig's beam)
  // (hung off the dome's rigging on two cables, up out of sight)
  const flick = (f % 200) < 3;
  for (const g of inGaps) {
    const nx = Math.round(g.mid - 110 - (g.mid - W / 2) * 0.06);
    cables(c, [nx + 24, nx + 196], 0, 95, '#475569');
    box(c, nx - 6, 94, 232, 42, INK);
    box(c, nx - 5, 95, 230, 40, '#9CA3AF'); box(c, nx - 5, 95, 230, 1, '#F3F4F6'); box(c, nx - 5, 134, 230, 1, '#4B5563');
    bandedGradient(c, nx - 2, 98, 224, 34, ['#1E1B4B', '#0F0A2A', '#05030F'], 4);
    for (let b = 0; b < 22; b++) { const on = (b + (f >> 3)) % 3 === 0; box(c, nx + b * 10, 96, 2, 2, on ? '#FEF3C7' : '#78350F'); box(c, nx + 218 - b * 10, 132, 2, 2, on ? '#FEF3C7' : '#78350F'); }
    c.save(); c.translate(nx + 110, MARQUEE_Y - 6);
    stamp(c, `atom-marquee-${flick ? 0 : 1}`, -110, -16, 220, 32, gg => lettering(gg, 'VOYAGE TO 2010', 0, 0, 'neon2', '#F0ABFC', '#0F0A2A', !flick));
    c.restore();
  }
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// The backstage (world space)

/** The flats' gaps (the dark ride shows through): [x, w]. */
export const GAPS: [number, number][] = [];
for (let x = A + 280; x < QUEUE_DOOR - 300; x += 880) GAPS.push([x, 300]);
const FLAT_TOP = GY - 460;
/** The work lamps on the grid, every so often over the flats (one that'd hang over a gap moved to the flat beside it). */
const WORK_LAMPS: number[] = [];
for (let x = A + 200; x < QUEUE_DOOR; x += 420) {
  const g = GAPS.find(([gx, gw]) => x > gx - 30 && x < gx + gw + 30);
  WORK_LAMPS.push(g ? (x - g[0] < g[0] + g[1] - x ? g[0] - 40 : g[0] + g[1] + 40) : x);
}
const STENCILS = ['SET 4B', 'THIS SIDE UP', 'MOON 2', 'HOME OF 2010 (L)', 'DO NOT PAINT', 'PROGRESSCO', 'KEEP DRY'];

/** One stretch of flats (the backs of the sets: plywood sheets on a 2x4 frame, braced, sandbagged, stenciled, the
 *  show side's black paint come over the top), from x for w. Stamped. */
const drawFlats = (c: Ctx, x: number, w: number) => {
  stamp(c, `atom-flats-${Math.round(x)}-${Math.round(w)}`, x - 2, FLAT_TOP - 4, w + 4, GY - FLAT_TOP + 4, g => {
    const H = GY - FLAT_TOP;
    for (let k = 0; k < w; k += 120) {
      const sw = Math.min(120, w - k), sx = x + k, base = mix(PLY[2], PLY[3], hash(sx * 0.37) * 0.45);
      box(g, sx, FLAT_TOP, sw, H, base);
      // (the grain: long streaks; a knot or two)
      for (let j = 0; j < 30; j++) {
        const gy = FLAT_TOP + 4 + hash(sx + j * 7.1) * (H - 8), gx = sx + hash(sx * 3 + j) * sw * 0.8;
        box(g, gx, gy, 10 + hash(j + sx) * 34, 1, j % 3 ? mix(base, PLY[1], 0.45) : mix(base, PLY[4], 0.35));
      }
      for (let j = 0; j < 2; j++) {
        const kx = sx + 14 + hash(sx + j * 13) * (sw - 28), ky = FLAT_TOP + 40 + hash(sx * 7 + j) * (H - 90);
        g.fillStyle = PLY[1]; g.beginPath(); g.ellipse(kx, ky, 4, 2.5, 0, 0, Math.PI * 2); g.fill(); box(g, kx - 2, ky - 4, 4, 1, PLY[4]);
      }
      // (the sheet's edges: its lit left, a dark seam at its right)
      box(g, sx, FLAT_TOP, 2, H, PLY[4]); box(g, sx + sw - 2, FLAT_TOP, 2, H, PLY[0]);
      // (the brace: a 2x4 on the diagonal, its lit top edge; a sandbag on its foot every other sheet)
      if (sw > 60) {
        const bx0 = sx + 12, by0 = GY - 6, bx1 = sx + sw - 10, by1 = FLAT_TOP + 104;
        for (const [lw, col, dy] of [[9, PLY[0], 1], [7, LUMBER[1], 0], [3, LUMBER[2], -1], [1, LUMBER[4], -3]] as const) { g.lineWidth = lw; g.strokeStyle = col; g.beginPath(); g.moveTo(bx0, by0 + dy); g.lineTo(bx1, by1 + dy); g.stroke(); }
        if (Math.round(sx / 120) % 2 === 0) { pixelBlob(g, sx + 18, GY - 9, 16, 9, '#44403C'); pixelBlob(g, sx + 15, GY - 12, 11, 5, '#78716C'); box(g, sx + 10, GY - 14, 6, 2, '#A8A29E'); }
      }
      // (a stile up the seam)
      box(g, sx, FLAT_TOP, 8, H, LUMBER[2]); box(g, sx, FLAT_TOP, 2, H, LUMBER[4]); box(g, sx + 6, FLAT_TOP, 2, H, LUMBER[1]); checker(g, sx + 8, FLAT_TOP, 2, H, PLY[0]);
      // (the words on it, stenciled; gaffer tape, a note)
      if (hash(x + k) > 0.45) lettering(g, STENCILS[Math.floor(hash(x * 3 + k) * STENCILS.length)], sx + 64, FLAT_TOP + 124, 'stencil', '#1F160C', base);
      if (hash(sx * 1.7) > 0.6) { const ty = FLAT_TOP + 190 + hash(sx) * 80; box(g, sx + 30, ty, 22, 28, '#F5F5F4'); box(g, sx + 30, ty, 22, 2, '#FFFFFF'); for (let l = 0; l < 4; l++) box(g, sx + 33, ty + 6 + l * 5, 10 + hash(sx + l) * 6, 1, '#78716C'); box(g, sx + 36, ty - 3, 10, 5, '#3F3F46'); }
      if (hash(sx * 2.3) > 0.5) { box(g, sx + 80, FLAT_TOP + 300, 26, 5, '#3F3F46'); box(g, sx + 80, FLAT_TOP + 300, 26, 1, '#71717A'); }
    }
    // (the rails across: 2x4s, lit along their tops, a shadow under each)
    for (const ry of [FLAT_TOP + 90, GY - 130]) { box(g, x, ry, w, 8, LUMBER[2]); box(g, x, ry, w, 2, LUMBER[4]); box(g, x, ry + 6, w, 2, LUMBER[1]); checker(g, x, ry + 8, w, 2, PLY[0]); }
    // (the show side's black paint, come over the top and run)
    box(g, x, FLAT_TOP, w, 4, '#0B0B12'); checker(g, x, FLAT_TOP + 4, w, 2, '#0B0B12');
    for (let d = 0; d < w; d += 13) if (hash(x + d * 1.3) > 0.62) box(g, x + d, FLAT_TOP + 4, 2, 4 + hash(d + x) * 22, '#0B0B12');
    // (the dark down at the foot of it)
    hazeBands(g, x, GY - 40, w, 40, '#0B0805', 0, 0.6, 4);
  });
};
/** A flat's raw end, seen from the side (at a gap): the 2x4 frame nearest, the plywood, the show side's black paint at the
 *  far edge. `x` its near edge, `t` how far it reaches into the gap toward the eye (`dir` that way). */
const flatEnd = (c: Ctx, x: number, t: number, dir: 1 | -1) => {
  const H = GY - FLAT_TOP, x0 = dir > 0 ? x : x - t;
  box(c, x0, FLAT_TOP, t, H, LUMBER[1]);
  const lum = Math.max(1, Math.round(t * 0.7)), ply = t - lum;
  box(c, dir > 0 ? x : x - lum, FLAT_TOP, lum, H, LUMBER[0]);
  if (ply > 0) { box(c, dir > 0 ? x + lum : x - t, FLAT_TOP, ply, H, PLY[3]); box(c, dir > 0 ? x + t - 1 : x - t, FLAT_TOP, 1, H, '#0B0B12'); }
  box(c, x0, FLAT_TOP, t, 2, PLY[4]);
};

/** The floor: black-painted concrete, gaffer-taped, glow-taped (the spike marks), cables along it; out in the queue, its
 *  carpet. Painted flat from `fx0` for `fw`, then bent toward the eye. */
export const CARPET = (c: Ctx) => tilePattern(c, 'atom-carpet', 64, 64, g => {
  g.fillStyle = '#1E1B4B'; g.fillRect(0, 0, 64, 64);
  g.fillStyle = '#312E81'; for (let i = 0; i < 64; i += 8) g.fillRect(i, (i * 3) % 64, 6, 2);
  g.fillStyle = '#0D9488'; g.fillRect(6, 10, 10, 2); g.fillRect(14, 12, 2, 6); g.fillRect(40, 44, 12, 2); g.fillRect(38, 40, 2, 6);
  g.fillStyle = '#DB2777'; g.fillRect(44, 8, 4, 4); g.fillRect(12, 46, 4, 4); g.fillRect(28, 28, 2, 2);
  g.fillStyle = '#FACC15'; g.fillRect(30, 18, 2, 2); g.fillRect(54, 30, 2, 2); g.fillRect(4, 34, 2, 2);
  g.fillStyle = '#7C3AED'; g.fillRect(20, 54, 8, 2); g.fillRect(50, 56, 2, 4);
});
const drawFloor = (c: Ctx, cam: number, camY: number) => {
  const fx0 = Math.max(A - 200, Math.floor(cam / 2) * 2 - 60), fx1 = cam + CANVAS_WIDTH + 60, fw = fx1 - fx0;
  const bottom = camY + CANVAS_HEIGHT + 20;
  if (fw <= 0) return;
  bandedGradient(c, fx0, GY, fw, 90, ['#2C2A36', '#1E1C26', '#15141B'], 5);
  box(c, fx0, GY + 90, fw, Math.max(0, bottom - GY - 90), '#111016');
  // (the queue's carpet, from the backstage door on)
  if (fx1 > QUEUE_DOOR) {
    const q0 = Math.max(fx0, QUEUE_DOOR);
    c.fillStyle = CARPET(c); c.fillRect(q0, GY, fx1 - q0, bottom - GY);
    hazeBands(c, q0, GY, fx1 - q0, 40, '#0B0820', 0.5, 0, 4);
  }
  // (the details, by where they are: the glow tape's spike marks, the gaffer tape, the cable runs)
  for (let x = Math.floor(fx0 / 160) * 160; x < fx1; x += 160) {
    if (x >= QUEUE_DOOR) break;
    const h = hash(x * 0.013);
    box(c, x, GY + 8, 40, 3, '#3F3F46');
    if (h > 0.45) { box(c, x + 70, GY + 18, 12, 3, '#BEF264'); box(c, x + 70, GY + 18, 3, 9, '#BEF264'); }
    if (h < 0.3) { box(c, x + 100, GY + 30, 22, 4, '#52525B'); box(c, x + 100, GY + 30, 22, 1, '#71717A'); }
    // (a cable, snaking along)
    for (let s = 0; s < 160; s += 8) { const yy = GY + 40 + Math.round(Math.sin((x + s) * 0.03) * 4); box(c, x + s, yy, 8, 3, INK); box(c, x + s, yy, 8, 1, '#3F3F46'); }
    if (h > 0.7) checker(c, x + 20, GY + 52, 60, 10, '#26242E');
  }
  box(c, fx0, GY, fw, 2, '#7A7A88'); box(c, fx0, GY + 2, fw, 2, '#3F3F4A');
  bendFloor(c, { x: cam + CANVAS_WIDTH / 2 }, GY, GY + 4, bottom, fx0, fx1);
};

/** A rig's console: a desk with a raked panel of buttons and lamps on legs (its lamps on while it's crewed). */
const console_ = (c: Ctx, x: number, feet: number, on: boolean, f: number) => {
  box(c, x - 18, feet - 18, 4, 18, '#27272A'); box(c, x + 14, feet - 18, 4, 18, '#27272A'); box(c, x - 18, feet - 18, 1, 18, '#52525B');
  slab(c, x - 26, feet - 46, 52, 30, '#3F3F46');
  box(c, x - 24, feet - 44, 48, 8, '#52525B'); box(c, x - 24, feet - 44, 48, 1, '#A1A1AA');
  for (let k = 0; k < 5; k++) {
    const lit = on && ((f >> 3) + k) % 3 !== 0;
    box(c, x - 20 + k * 9, feet - 34, 6, 5, INK); box(c, x - 19 + k * 9, feet - 33, 4, 3, lit ? (k % 2 ? '#4ADE80' : '#F87171') : '#3F3F46');
    if (lit) box(c, x - 19 + k * 9, feet - 33, 2, 1, '#FFFFFF');
  }
  for (let k = 0; k < 3; k++) { box(c, x - 18 + k * 14, feet - 25, 8, 3, '#18181B'); box(c, x - 16 + k * 14 + (((f >> 5) + k) % 3) * 2, feet - 26, 2, 5, on ? '#E4E4E7' : '#71717A'); }
  // (the cable to the rig)
  box(c, x + 22, feet - 4, 30, 3, INK);
};

/** A rocket, a prop (plywood fins, a garbage-can nose), drawn about its nozzle's mouth, `dir` the way it fires. */
const rocketProp = (c: Ctx, x: number, y: number, dir: 'left' | 'down', len: number, col: string) => {
  c.save(); c.translate(x, y); c.rotate(dir === 'left' ? 0 : -Math.PI / 2);
  // (drawn firing left: the nozzle at the origin, the body off to the right)
  const bodyW = len - 50;
  // the fins, behind (one up, one down): plywood, painted, its raw edge showing
  for (const s of [-1, 1]) {
    c.fillStyle = INK; c.beginPath(); c.moveTo(14, s * 26); c.lineTo(2, s * 56); c.lineTo(54, s * 26); c.closePath(); c.fill();
    c.fillStyle = s < 0 ? '#EF4444' : '#B91C1C'; c.beginPath(); c.moveTo(17, s * 27); c.lineTo(7, s * 52); c.lineTo(50, s * 27); c.closePath(); c.fill();
    c.strokeStyle = PLY[4]; c.lineWidth = 2; c.beginPath(); c.moveTo(7, s * 52); c.lineTo(17, s * 28); c.stroke();
  }
  // the nozzle bell
  cyl(c, 0, -15, 18, 30, '#71717A');
  box(c, -2, -13, 3, 26, '#18181B'); box(c, -2, -13, 3, 2, '#3F3F46');
  // the body: a stepped cylinder, its panel seams, rivets, the USA band, a duct-tape patch
  cyl(c, 14, -30, bodyW, 60, col);
  for (let p = 40; p < bodyW - 10; p += 46) { box(c, 14 + p, -30, 1, 60, dark(col, 0.35)); box(c, 15 + p, -30, 1, 60, lite(col, 0.3)); }
  rivets(c, 20, 10 + bodyW, -24, col, 10); rivets(c, 20, 10 + bodyW, 22, col, 10);
  box(c, 40, -8, 64, 16, INK); box(c, 41, -7, 62, 14, '#1E3A8A'); box(c, 41, -7, 62, 3, '#3B5BB5'); box(c, 41, 4, 62, 3, '#14205C');
  text(c, 'USA', 72, 4, '#F8FAFC', 6);
  if (bodyW > 140) { box(c, bodyW - 30, -26, 20, 10, '#A8A29E'); box(c, bodyW - 30, -26, 20, 2, '#D6D3D1'); box(c, bodyW - 20, -26, 1, 10, '#78716C'); }
  // the nose cone (a garbage can's lid, painted)
  const nx = len - 37;
  c.fillStyle = INK; c.beginPath(); c.moveTo(nx - 1, -31); c.lineTo(len + 1, 0); c.lineTo(nx - 1, 31); c.closePath(); c.fill();
  c.save(); c.beginPath(); c.moveTo(nx, -29); c.lineTo(len - 2, 0); c.lineTo(nx, 29); c.closePath(); c.clip();
  cyl(c, nx, -30, 40, 60, '#DC2626', 'x', false);
  c.restore();
  c.restore();
};

/** A prop meteor (a lump of concrete painted to look like foam: it isn't), at (x, y): lit from the upper left whatever
 *  way it's turned (`rot` turns its shape, not its light), stepped and dithered; in the show, its glowing cracks. */
export const meteor = (c: Ctx, x: number, y: number, r: number, rot: number, warehouse = false) => {
  const col = warehouse ? '#A8A29E' : '#7C2D12', rp = rampOf(col);
  const P = (s: number, ox: number, oy: number, extra = 0) => {
    c.beginPath();
    for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2 + rot, rr = r * (0.82 + hash(i * 7.3) * 0.25) * s + extra; c.lineTo(ox + Math.cos(a) * rr, oy + Math.sin(a) * rr); }
    c.closePath();
  };
  c.save(); c.translate(Math.round(x), Math.round(y));
  c.fillStyle = INK; P(1, 0, 0, 2); c.fill();
  c.fillStyle = rp[0]; P(1, 0, 0); c.fill();
  c.save(); P(1, 0, 0); c.clip();
  for (const [k, s, ci] of [[0.08, 0.95, 1], [0.2, 0.74, 2], [0.32, 0.5, 3]] as const) {
    const o = -r * k;
    c.save(); P(s + 0.1, o, o); c.clip(); checker(c, -r - 6, -r - 6, r * 2 + 12, r * 2 + 12, rp[ci], ci % 2); c.restore();
    c.fillStyle = rp[ci]; P(s, o, o); c.fill();
  }
  // (the craters, turned with it: each a dark pit with a lit lower lip)
  const cs = Math.cos(rot), sn = Math.sin(rot);
  for (const [cx, cy, cr] of [[0.3, 0.2, 0.22], [-0.25, 0.35, 0.15], [0.4, -0.35, 0.12]] as const) {
    const px = (cx * cs - cy * sn) * r, py = (cx * sn + cy * cs) * r, rr = cr * r;
    c.fillStyle = rp[3]; c.beginPath(); c.arc(px + 1.5, py + 1.5, rr, 0, Math.PI * 2); c.fill();
    c.fillStyle = rp[0]; c.beginPath(); c.arc(px, py, rr, 0, Math.PI * 2); c.fill();
  }
  if (!warehouse) {
    // (the cracks: the blacklight paint, glowing)
    const pts = [[-0.6, -0.1], [-0.2, 0.05], [0.05, -0.2], [0.35, 0.05], [0.6, -0.05]].map(([a, b]) => [(a * cs - b * sn) * r, (a * sn + b * cs) * r]);
    for (const [lw, cl] of [[4, '#9A3412'], [2, '#F97316'], [1, '#FDE047']] as const) { c.lineWidth = lw; c.strokeStyle = cl; c.beginPath(); pts.forEach(([a, b], i) => (i ? c.lineTo(a, b) : c.moveTo(a, b))); c.stroke(); }
  } else {
    // (the prop's seam, and its sticker)
    box(c, -r * 0.2, r * 0.3, r * 0.5, r * 0.25, '#F8FAFC'); box(c, -r * 0.2, r * 0.3, r * 0.5, 1, '#FFFFFF');
  }
  c.restore();
  box(c, -r * 0.45, -r * 0.55, 3, 2, rp[4]);
  c.restore();
};

/** A chain, from (ax, ay) to (bx, by): its links in steel, alternating. */
const chain = (c: Ctx, ax: number, ay: number, bx: number, by: number) => {
  c.lineCap = 'butt';
  c.lineWidth = 5; c.strokeStyle = INK; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
  c.setLineDash([5, 3]); c.lineWidth = 3; c.strokeStyle = '#A1A1AA'; c.stroke();
  c.lineDashOffset = 4; c.lineWidth = 1; c.strokeStyle = '#E4E4E7'; c.stroke();
  c.setLineDash([]); c.lineDashOffset = 0;
};

/** A catwalk (a one-way ledge: its lit lip, a grating face with a hazard-striped toe-kick, square legs braced down to
 *  the floor). Stamped. */
const catwalk = (c: Ctx, x: number, y: number, w: number) => stamp(c, `atom-catwalk-${x}-${y}-${w}`, x - 4, y - 2, w + 8, GY - y + 4, g => {
  const legs = [x + 4]; for (let lx = x + 96; lx < x + w - 50; lx += 96) legs.push(lx); legs.push(x + w - 10);
  if (GY - y > 60) for (let i = 0; i < legs.length - 1; i++) {
    const a = legs[i] + 6, b = legs[i + 1];
    for (const [lw, cl] of [[4, INK], [2, STEEL[1]]] as const) { g.lineWidth = lw; g.strokeStyle = cl; g.beginPath(); g.moveTo(a, y + 14); g.lineTo(b, GY - 4); g.moveTo(b, y + 14); g.lineTo(a, GY - 4); g.stroke(); }
  }
  for (const lx of legs) { box(g, lx - 1, y + 12, 8, GY - y - 12, INK); box(g, lx, y + 12, 6, GY - y - 12, STEEL[2]); box(g, lx, y + 12, 2, GY - y - 12, STEEL[3]); box(g, lx + 5, y + 12, 1, GY - y - 12, STEEL[0]); box(g, lx - 3, GY - 3, 12, 3, STEEL[1]); }
  box(g, x - 1, y - 1, w + 2, 15, INK);
  box(g, x, y, w, 13, STEEL[1]);
  hazard(g, x, y + 6, w, 6, '#CA8A04', '#1C1917', 6);
  box(g, x, y, w, 5, '#D4D4D8'); box(g, x, y, w, 1, '#FAFAFA'); checker(g, x, y + 3, w, 2, '#A1A1AA'); box(g, x, y + 5, w, 1, STEEL[0]);
});

/** A road case (the crates: black, aluminum-edged, corner caps, a handle, stenciled), standable: its lit lip. */
const roadCase = (c: Ctx, x: number, top: number, w: number) => stamp(c, `atom-case-${x}`, x - 2, top - 2, w + 4, GY - top + 2, g => {
  const h = GY - top;
  slab(g, x, top, w, h, '#3F3F46');
  box(g, x + 2, top + 2, w - 4, 4, '#E4E4E7'); box(g, x + 2, top + 2, w - 4, 1, '#FFFFFF');
  box(g, x + 2, top + 6, 3, h - 8, '#A1A1AA'); box(g, x + w - 5, top + 6, 3, h - 8, '#71717A'); box(g, x + 2, GY - 5, w - 4, 3, '#71717A');
  for (const [cx, cy] of [[x + 2, top + 2], [x + w - 8, top + 2], [x + 2, GY - 8], [x + w - 8, GY - 8]]) { box(g, cx, cy, 6, 6, INK); box(g, cx + 1, cy + 1, 4, 4, '#D4D4D8'); box(g, cx + 1, cy + 1, 2, 2, '#FFFFFF'); }
  box(g, x + w / 2 - 8, top + 14, 16, 4, INK); box(g, x + w / 2 - 7, top + 15, 14, 2, '#A1A1AA');
  stencil(g, 'FRAGILE', x + w / 2, top + 36, '#F8FAFC', '#3F3F46', 5);
  stencil(g, 'FX 3', x + w / 2, top + 50, '#FDE047', '#3F3F46', 5);
});

/** The thruster rig's still parts: the test stand's saddles, the gantry (trusses), the hangers. Stamped. */
const gantry = (c: Ctx) => stamp(c, 'atom-gantry', A + 1520, GY - 560, 500, 560, g => {
  truss(g, A + 1536, GY - 520, 22, 520, '#57534E', true); truss(g, A + 1976, GY - 520, 22, 520, '#57534E', true);
  truss(g, A + 1530, GY - 540, 474, 22, '#78716C');
  for (const bx of [A + 1530, A + 1970]) { box(g, bx - 1, GY - 7, 36, 7, INK); box(g, bx, GY - 6, 34, 5, '#71717A'); box(g, bx, GY - 6, 34, 1, '#D4D4D8'); }
  for (const t of THRUSTERS.slice(1)) { box(g, t.x - 10, GY - 520, 20, 8, INK); box(g, t.x - 9, GY - 519, 18, 6, '#A1A1AA'); }
});

export const drawAtomBack = (c: Ctx, state: GameState, hj: Hijack) => {
  const f = state.frame, cam = state.camera.x;
  const on = (x0: number, x1_: number) => x1_ > cam - 100 && x0 < cam + CANVAS_WIDTH + 100;
  // The flats, with the gaps in them (their raw ends seen from the side, toward the eye)
  let fx = A - 200;
  for (const [gx, gw] of GAPS) { if (on(fx, gx)) drawFlats(c, fx, gx - fx); fx = gx + gw; }
  if (on(fx, QUEUE_DOOR)) drawFlats(c, fx, QUEUE_DOOR - fx);
  // (the grid batten up over it all, its work lamps)
  if (cam < QUEUE_DOOR) {
    const bx0 = Math.max(A - 200, cam - 40), bx1 = Math.min(QUEUE_DOOR, cam + CANVAS_WIDTH + 40);
    // (not across the gaps: nothing over the marquee in them)
    let sx0 = bx0;
    for (const [gx, gw] of [...GAPS, [QUEUE_DOOR, 0] as [number, number]]) {
      const a = sx0, b = Math.min(bx1, gx);
      if (b > a) { box(c, a, GY - 452, b - a, 8, INK); box(c, a, GY - 451, b - a, 2, '#71717A'); box(c, a, GY - 449, b - a, 3, '#3F3F46'); }
      sx0 = Math.max(sx0, gx + gw);
    }
    for (const x of WORK_LAMPS) if (on(x - 20, x + 20)) {
      box(c, x - 1, GY - 446, 3, 6, INK);
      box(c, x - 9, GY - 442, 18, 14, INK); box(c, x - 8, GY - 441, 16, 12, '#27272A'); box(c, x - 8, GY - 441, 4, 12, '#52525B');
      box(c, x - 7, GY - 430, 14, 3, '#FEF9C3');
    }
  }
  const eye = cam + CANVAS_WIDTH / 2;
  for (const [gx, gw] of GAPS) if (on(gx - 20, gx + gw + 20)) {
    if (eye > gx) { const t = Math.min(18, Math.round((eye - gx) * 0.03)); if (t >= 2) flatEnd(c, gx, t, 1); }
    if (eye < gx + gw) { const t = Math.min(18, Math.round((gx + gw - eye) * 0.03)); if (t >= 2) flatEnd(c, gx + gw, t, -1); }
    // (a rope across: KEEP OUT OF SHOW, on two stanchions, its tag)
    const mid = gx + gw / 2;
    for (const sx of [gx + 8, gx + gw - 14]) { cyl(c, sx, GY - 78, 6, 78, '#A1A1AA', 'y'); sphere(c, sx + 3, GY - 80, 5, '#D4D4D8'); box(c, sx - 6, GY - 4, 18, 4, '#52525B'); }
    for (const [lw, cl, dy] of [[5, INK, 0], [3, '#B91C1C', 0], [1, '#F87171', -1]] as const) { c.lineWidth = lw; c.strokeStyle = cl; c.beginPath(); c.moveTo(gx + 11, GY - 74 + dy); c.quadraticCurveTo(mid, GY - 46 + dy, gx + gw - 11, GY - 74 + dy); c.stroke(); }
    // (its tag: in the middle, unless the air cannon stands there: then by the far stanchion, clear of it)
    const tag = mid > CANNON.x - 100 && mid < CANNON.x + 60 ? gx + gw - 50 : mid;
    // (the tag hung on the rope by a ring each side)
    const [t0, , t1] = plateBoxAt('SHOW SIDE', 'stencil', tag, GY - 44, 4);
    for (const rx of [t0 + 8, t1 - 8]) { c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.arc(rx, GY - 57, 3, 0, Math.PI * 2); c.stroke(); }
    plate(c, 'showside', tag, GY - 44, 'SHOW SIDE', 'stencil', '#FDE047', '#1C1917', 4);
  }
  // (the floor: black-painted concrete, gaffer-taped; the queue's carpet)
  drawFloor(c, cam, state.camera.y);
  // The stage door (the way back out to the square)
  if (on(A - 100, A + 200)) {
    slab(c, A + 6, GY - 156, 88, 156, '#334155');
    slab(c, A + 14, GY - 146, 72, 146, '#475569');
    box(c, A + 32, GY - 130, 36, 26, INK); box(c, A + 34, GY - 128, 32, 22, '#0F172A'); box(c, A + 35, GY - 127, 8, 2, '#64748B');
    box(c, A + 18, GY - 72, 64, 8, INK); box(c, A + 19, GY - 71, 62, 6, '#D4D4D8'); box(c, A + 19, GY - 71, 62, 2, '#FFFFFF');
    box(c, A + 14, GY - 26, 72, 26, '#64748B'); box(c, A + 14, GY - 26, 72, 2, '#94A3B8');
    // (on the flats over the door, on brackets; the EXIT sign over that, lit, on its conduit up to the grid)
    brackets(c, A + 6, A + 94, GY - 172);
    plate(c, 'castonly', A + 50, GY - 176, 'CAST ONLY', 'enamel', '#FDE047', '#1C1917', 6);
    box(c, A + 49, GY - 446, 3, 230, INK); box(c, A + 50, GY - 446, 1, 230, '#52525B');
    box(c, A + 22, GY - 222, 56, 26, INK); box(c, A + 24, GY - 220, 52, 22, '#450A0A');
    c.save(); c.translate(A + 50, GY - 209);
    stamp(c, 'atom-exit', -28, -12, 56, 24, g => lettering(g, 'EXIT', 0, 0, 'neon', '#F87171', '#450A0A', true));
    c.restore();
  }
  // The rigs' stands, back against the far wall (behind the catwalks: nothing hides a catwalk's lip): the thrusters'
  // gantry, the air cannon
  if (on(A + 1500, A + 2050)) gantry(c);
  if (on(CANNON.x - 120, CANNON.x + 60)) {
    // (the air cannon: a big riveted barrel on a truss stand, its mouth toward the door, its pressure gauge)
    const cn = cannonAt(f, crewed(state, AIRLOCK_POST)), mx = CANNON.x - 60, my = GY - 140;
    truss(c, CANNON.x - 40, GY - 82, 26, 82, '#3F3F46', true);
    box(c, CANNON.x - 52, GY - 6, 50, 6, INK); box(c, CANNON.x - 51, GY - 5, 48, 4, '#52525B');
    cyl(c, mx, GY - 200, 90, 120, '#475569');
    for (let h_ = 14; h_ < 90; h_ += 24) { box(c, mx + h_, GY - 200, 4, 120, '#1E293B'); box(c, mx + h_, GY - 200, 1, 120, '#94A3B8'); }
    for (let k = 0; k < 4; k++) { c.fillStyle = ['#0B1120', '#0F172A', '#1E293B', '#334155'][3 - k]; c.beginPath(); c.ellipse(mx, my, 16 - k * 3, 58 - k * 10, 0, 0, Math.PI * 2); c.fill(); }
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.ellipse(mx, my, 16, 58, 0, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = '#94A3B8'; c.lineWidth = 1; c.beginPath(); c.ellipse(mx, my, 14, 56, 0, Math.PI * 0.6, Math.PI * 1.4); c.stroke();
    if (cn.tell > 0 || cn.blow > 0) { c.strokeStyle = '#CBD5E1'; c.lineWidth = 3; const a = f * (0.3 + cn.blow * 0.5); for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(mx, my); c.lineTo(mx + Math.cos(a + k * 2.1) * 8, my + Math.sin(a + k * 2.1) * 46); c.stroke(); } }
    // (the gauge: its needle climbing with the tell, pinned while it blows)
    const gx_ = CANNON.x - 4, gy_ = GY - 168, ga = Math.PI * (0.8 + 1.4 * Math.max(cn.tell, cn.blow));
    c.fillStyle = INK; c.beginPath(); c.arc(gx_, gy_, 11, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#F8FAFC'; c.beginPath(); c.arc(gx_, gy_, 9, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#FCA5A5'; c.beginPath(); c.moveTo(gx_, gy_); c.arc(gx_, gy_, 9, Math.PI * 1.7, Math.PI * 2.2); c.closePath(); c.fill();
    c.strokeStyle = '#DC2626'; c.lineWidth = 2; c.beginPath(); c.moveTo(gx_, gy_); c.lineTo(gx_ + Math.cos(ga) * 8, gy_ + Math.sin(ga) * 8); c.stroke();
    // (its name on a plate on two struts up off the barrel)
    legs(c, [CANNON.x - 60, CANNON.x + 30], GY - 220, GY - 200, '#3F3F46', 4);
    plate(c, 'decomp', CANNON.x - 15, GY - 226, 'DECOMPRESSION FX', 'stencil', '#334155', '#CBD5E1', 5);
  }
  // Catwalks (lit top lips: you can stand on them; the queue's rail is its own)
  for (const [x, y, w] of LEDGES) if (on(x, x + w) && !(x >= LINE_X0 && x < LINE_X1)) catwalk(c, x, y, w);
  for (const [x, top, w] of SOLIDS) if (on(x, x + w) && x !== ROCKET_BODY.x && x < TUNNEL_X) roadCase(c, x, top, w);
  // THE THRUSTERS
  if (on(A + 600, A + 2150)) {
    wallPlate(c, 'thruster', A + 730, GY - 318, 'THRUSTER TEST: EARS!', 'enamel', '#FDE047', '#1C1917');
    const t0 = THRUSTERS[0];
    // (the test stand: two saddles, the rocket lying on them, its nozzle toward the door)
    for (const sx of [ROCKET_BODY.x + 18, ROCKET_BODY.x + ROCKET_BODY.w - 44]) { box(c, sx - 1, GY - 14, 28, 14, INK); box(c, sx, GY - 13, 26, 13, '#52525B'); box(c, sx, GY - 13, 26, 2, '#A1A1AA'); box(c, sx + 10, GY - 13, 6, 13, '#3F3F46'); }
    rocketProp(c, t0.x, t0.y - 2, 'left', ROCKET_BODY.w + 20, '#E5E7EB');
    box(c, ROCKET_BODY.x, ROCKET_BODY.y, ROCKET_BODY.w, 3, '#F8FAFC');
    // (the gantry: two trusses up, one across, the two hung off it nose-up)
    for (const t of THRUSTERS.slice(1)) { chain(c, t.x, GY - 512, t.x, GY - 440); rocketProp(c, t.x, t.y, 'down', 170, '#CBD5E1'); }
  }
  // THE METEORS
  if (on(A + 2300, A + 3700)) {
    // (the swings' truss, hung off the roof steel on rods, up out of sight; the sign on the flats over it)
    wallPlate(c, 'meteor', A + 2505, GY - 434, 'METEOR RIG: HARD HATS!', 'enamel', '#F97316', '#1C1917');
    for (const hx of [A + 2640, A + 3000, A + 3340]) { box(c, hx - 1, GY - 760, 4, 350, INK); box(c, hx, GY - 760, 2, 350, '#71717A'); }
    truss(c, A + 2420, GY - 414, 940, 18, '#57534E');
    for (const s of SWINGS) {
      const b = swingBall(s, f);
      chain(c, s.x, s.y, b.x, b.y);
      box(c, s.x - 8, s.y - 8, 16, 16, INK); box(c, s.x - 7, s.y - 7, 14, 14, '#3F3F46'); box(c, s.x - 7, s.y - 7, 14, 2, '#71717A'); sphere(c, s.x, s.y, 3, '#A1A1AA', false);
      meteor(c, b.x, b.y, s.r, b.a * 0.6);
    }
    // the shower: its trolley, the cables, the meteors (sat on the floor, or on their way)
    const tx0 = SHOWER.xs[0] - 40, tw = SHOWER.xs[2] - SHOWER.xs[0] + 80;
    truss(c, tx0, SHOWER.top - 72, tw, 18, '#57534E');
    box(c, tx0 + 10, SHOWER.top - 78, 30, 8, INK); box(c, tx0 + 11, SHOWER.top - 77, 28, 6, '#CA8A04');
    // (hung off the roof steel like the other; its name on a plate stood up on the truss)
    for (const hx of [tx0 + 20, tx0 + tw - 20]) { box(c, hx - 1, GY - 760, 4, SHOWER.top - 72 - GY + 760, INK); box(c, hx, GY - 760, 2, SHOWER.top - 72 - GY + 760, '#71717A'); }
    legs(c, [SHOWER.x - 40, SHOWER.x + 40], SHOWER.top - 96, SHOWER.top - 72, '#57534E', 4);
    plate(c, 'shower', SHOWER.x, SHOWER.top - 100, 'METEOR SHOWER', 'enamel', '#7C2D12', '#FDBA74', 5);
    const winched = crewed(state, SHOWER.post);
    SHOWER.xs.forEach((x, k) => {
      const s = winched ? showerAt(k, f) : { y: SHOWER.top, tell: 0, falling: false, down: false };
      const cy = s.y - SHOWER.r + (s.tell ? Math.sin(f * 1.7) * 2 : 0);
      box(c, x - 1, SHOWER.top - 54, 3, cy - SHOWER.r + 2 - (SHOWER.top - 54), INK); box(c, x, SHOWER.top - 54, 1, cy - SHOWER.r + 2 - (SHOWER.top - 54), '#D4D4D8');
      box(c, x - 4, SHOWER.top - 56, 8, 6, '#71717A');
      // (its mark on the floor, where it comes down: a painted target, bright when it's coming)
      const hot = s.tell || s.falling;
      box(c, x - SHOWER.r - 2, GY - 3, SHOWER.r * 2 + 4, 3, INK);
      for (let m = 0; m < SHOWER.r * 2; m += 8) box(c, x - SHOWER.r + m, GY - 2, 5, 2, hot ? ((f >> 2) % 2 ? '#FCA5A5' : '#EF4444') : '#7F1D1D');
      meteor(c, x + (s.tell ? Math.sin(f * 2.3) * 2 : 0), cy, SHOWER.r, k);
    });
  }
  // THE AIRLOCKS
  if (on(A + 3750, A + 4900)) {
    // (on the flats past the gap: over the gap it'd be hung on nothing)
    wallPlate(c, 'airlock', A + 4300, GY - 400, 'AIRLOCK FX: KEEP CLEAR', 'enamel', '#E5E7EB', '#B91C1C');
    const locked = crewed(state, AIRLOCK_POST);
    // (the space station set's ceiling, the doors' housings: steel, riveted, its top in the dark)
    stamp(c, 'atom-airlock-ceiling', A + 3896, AIRLOCK_TOP - 74, 968, 78, g => {
      slab(g, A + 3900, AIRLOCK_TOP - 70, 960, 70, '#334155');
      box(g, A + 3900, AIRLOCK_TOP - 70, 960, 4, '#1E293B');
      for (let p = A + 3900; p < A + 4860; p += 120) { box(g, p, AIRLOCK_TOP - 66, 1, 62, '#1E293B'); box(g, p + 1, AIRLOCK_TOP - 66, 1, 62, '#475569'); }
      rivets(g, A + 3906, A + 4854, AIRLOCK_TOP - 60, '#475569', 12); rivets(g, A + 3906, A + 4854, AIRLOCK_TOP - 12, '#475569', 12);
      hazard(g, A + 3900, AIRLOCK_TOP - 8, 960, 4, '#FACC15', '#1C1917', 6);
      box(g, A + 3900, AIRLOCK_TOP - 4, 960, 4, '#64748B');
      lettering(g, 'SPACE STATION LIBERTY - DECK 2', A + 4185, AIRLOCK_TOP - 34, 'stencil', '#94A3B8', '#334155');
    });
    for (const d of AIRLOCKS) {
      const s = airlockAt(d, f, locked), bottom = AIRLOCK_TOP + (GY - AIRLOCK_TOP) * s.down;
      // (the frame, the warning light over it, the slab: steel, its porthole, its hazard stripes along the bottom)
      for (const fx_ of [d.x - 12, d.x + d.w + 4]) { box(c, fx_ - 1, AIRLOCK_TOP - 10, 10, GY - AIRLOCK_TOP + 10, INK); box(c, fx_, AIRLOCK_TOP - 10, 8, GY - AIRLOCK_TOP + 10, '#475569'); box(c, fx_, AIRLOCK_TOP - 10, 2, GY - AIRLOCK_TOP + 10, '#64748B'); }
      lamp(c, d.x + d.w / 2, AIRLOCK_TOP - 36, 6, '#EF4444', s.warn > 0 && (f >> 2) % 2 === 1, 3);
      const top = bottom - (GY - AIRLOCK_TOP), H = GY - AIRLOCK_TOP;
      c.save(); c.beginPath(); c.rect(d.x - 2, AIRLOCK_TOP - 2, d.w + 4, H + 2); c.clip();
      slab(c, d.x, top, d.w, H, '#94A3B8');
      for (let p = 60; p < H - 30; p += 70) { box(c, d.x + 4, top + p, d.w - 8, 1, '#64748B'); box(c, d.x + 4, top + p + 1, d.w - 8, 1, '#CBD5E1'); }
      const pr = 12, pcx = d.x + d.w / 2, pcy = top + H - 120;
      c.fillStyle = INK; c.beginPath(); c.arc(pcx, pcy, pr + 3, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#CBD5E1'; c.beginPath(); c.arc(pcx, pcy, pr + 2, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#0C4A6E'; c.beginPath(); c.arc(pcx, pcy, pr - 1, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#075985'; c.beginPath(); c.arc(pcx - 2, pcy - 2, pr - 5, 0, Math.PI * 2); c.fill();
      box(c, pcx - 6, pcy - 7, 4, 2, '#E0F2FE');
      hazard(c, d.x + 1, bottom - 17, d.w - 2, 16, '#FACC15', '#1C1917', 10);
      box(c, d.x + 1, bottom - 2, d.w - 2, 2, '#FEF08A');
      c.restore();
    }
  }
  // THE LASER SHOW: the emitters (the fog machines are drawn with the fog)
  if (on(BLACKLIGHT.x0 - 100, BLACKLIGHT.x1 + 100)) {
    wallPlate(c, 'lasers', A + 5205, GY - 400, 'CLASS IV LASERS:\nDON\'T LOOK WITH REMAINING EYE', 'small', '#A855F7', '#F5F3FF');
    // (the floor one: a stand, its head)
    cyl(c, FLOOR_LASER.x, GY - 90, 14, 90, '#3F3F46', 'y');
    box(c, FLOOR_LASER.x - 12, GY - 4, 38, 4, '#27272A');
    slab(c, FLOOR_LASER.x - 10, FLOOR_LASER.high - 12, 32, 66, '#3F3F46');
    for (let k = 0; k < 4; k++) box(c, FLOOR_LASER.x + 8, FLOOR_LASER.high - 4 + k * 12, 10, 2, '#18181B');
    // (the ceiling one: hung off a pipe, its housing)
    cyl(c, SWEEP_LASER.x - 3, SWEEP_LASER.y - 200, 6, 170, '#27272A', 'y');
    slab(c, SWEEP_LASER.x - 20, SWEEP_LASER.y - 32, 40, 30, '#3F3F46');
    box(c, SWEEP_LASER.x - 16, SWEEP_LASER.y - 26, 6, 2, '#71717A'); box(c, SWEEP_LASER.x - 16, SWEEP_LASER.y - 20, 6, 2, '#71717A');
    stencil(c, 'CLASS IV', SWEEP_LASER.x + 5, SWEEP_LASER.y - 12, '#FDE047', '#3F3F46', 5);
    // (the fog machines: their boxes, the nozzle, the jug of juice beside)
    for (const x of FOG_XS) {
      slab(c, x - 22, GY - 26, 44, 26, '#1E293B');
      box(c, x + 20, GY - 18, 8, 6, INK); box(c, x + 21, GY - 17, 6, 4, '#64748B');
      stencil(c, 'FOG', x - 4, GY - 9, '#94A3B8', '#1E293B', 5);
      box(c, x - 36, GY - 18, 12, 18, INK); box(c, x - 35, GY - 17, 10, 17, '#F0ABFC'); box(c, x - 35, GY - 17, 10, 4, '#FDF4FF'); box(c, x - 33, GY - 21, 6, 4, '#E5E7EB');
    }
  }
  // The posts' consoles
  for (const [post, x, feet] of POSTS) if (on(x - 50, x + 50)) console_(c, x + 30, feet, crewed(state, post), f);
  // THE LINE (and the platform)
  drawQueueBack(c, state, hj);
};

/** The queue's last stretch (out the backstage door into it), the load platform, the operator's console, the sled. */
const drawQueueBack = (c: Ctx, state: GameState, hj: Hijack) => {
  const f = state.frame, cam = state.camera.x;
  if (cam + CANVAS_WIDTH < QUEUE_DOOR - 100) return;
  // (the queue's back wall, stamped: navy in bands, chrome fins, starbursts, the cove neon along the top)
  stamp(c, 'atom-queue-wall', QUEUE_DOOR - 24, GY - 466, TUNNEL_X - QUEUE_DOOR + 270, 466, g => {
    const x0 = QUEUE_DOOR - 20, w = TUNNEL_X - QUEUE_DOOR + 260;
    bandedGradient(g, x0, GY - 460, w, 460, ['#0B1236', '#172554', '#1E3A8A', '#1E40AF', '#1E3A8A'], 10);
    for (let x = x0 + 60; x < x0 + w; x += 150) { box(g, x - 1, GY - 440, 10, 380, INK); box(g, x, GY - 440, 8, 380, '#94A3B8'); box(g, x, GY - 440, 2, 380, '#E2E8F0'); box(g, x + 6, GY - 440, 2, 380, '#475569'); }
    for (let i = 0; i < 14; i++) star(g, x0 + 90 + i * 77 + hash(i) * 30, GY - 380 + hash(i * 3.7) * 140, 5, '#3B82F6');
    box(g, x0, GY - 60, w, 60, '#172554'); box(g, x0, GY - 60, w, 3, '#60A5FA');
    // (the switchback's rail posts, chrome, along the line)
    for (let x = LINE_X0; x <= LINE_X1; x += 80) { cyl(g, x, GY - 68, 5, 68, '#94A3B8', 'y'); box(g, x - 3, GY - 3, 11, 3, '#475569'); }
  });
  neonBar(c, QUEUE_DOOR - 20, GY - 456, TUNNEL_X - QUEUE_DOOR + 260, 3, '#67E8F9', true);
  for (let k = 0; k < 5; k++) {
    const tx = LINE_X0 + 40 + k * 150, ad = (f + k * 40) % 240 < 120;
    box(c, tx + 46, GY - 372, 8, 30, '#334155');
    screenGlass(c, tx, GY - 340, 100, 70, ad ? '#0EA5E9' : '#F472B6', f + k * 9);
    c.save(); c.translate(tx + 50, GY - 304);
    stamp(c, `atom-tvwords-${ad ? 1 : 0}`, -46, -8, 92, 16, g => lettering(g, ad ? 'PROGRESSCO' : "WE'RE ON IT", 0, 0, 'small', '#0F172A', ad ? '#0EA5E9' : '#F472B6'));
    c.restore();
    if (ad) { const a = f * 0.08 + k; c.strokeStyle = '#0F172A'; c.lineWidth = 1; for (let o = 0; o < 3; o++) { c.beginPath(); c.ellipse(tx + 50, GY - 318, 12, 4, a + o * 1.05, 0, Math.PI * 2); c.stroke(); } }
  }
  // (the big sign, in neon on its board)
  stamp(c, 'atom-queue-sign', LINE_X0 + 120, GY - 432, 440, 52, g => {
    box(g, LINE_X0 + 124, GY - 428, 432, 42, INK); box(g, LINE_X0 + 126, GY - 426, 428, 38, '#9CA3AF'); box(g, LINE_X0 + 126, GY - 426, 428, 1, '#F3F4F6');
    bandedGradient(g, LINE_X0 + 129, GY - 423, 422, 32, ['#0F172A', '#020617'], 3);
    lettering(g, 'VOYAGE TO 2010 - PRESENTED BY PROGRESSCO', LINE_X0 + 340, GY - 407, 'neon', '#67E8F9', '#0F172A', true);
  });
  wallPlate(c, 'wait', LINE_X0 + 105, GY - 210, 'WAIT FROM HERE: 2 HRS', 'enamel', '#FDE047', '#1C1917');
  // (the backstage door he came out of, CAST ONLY on a little plate over it)
  slab(c, QUEUE_DOOR - 12, GY - 154, 74, 154, '#27272A'); slab(c, QUEUE_DOOR - 6, GY - 146, 62, 146, '#3F3F46');
  box(c, QUEUE_DOOR - 2, GY - 76, 50, 6, '#A1A1AA'); box(c, QUEUE_DOOR - 2, GY - 76, 50, 2, '#E4E4E7');
  plate(c, 'castonly-q', QUEUE_DOOR + 25, GY - 166, 'CAST ONLY', 'small', '#27272A', '#FDE047', 4);
  // the people in line: the back row, the front row, behind the rail (the one he's thrown into them knocks a few down)
  for (const row of [0, 1] as const) {
    for (const q of QUEUE) {
      if (q.row !== row || q.x < cam - 60 || q.x > cam + CANVAS_WIDTH + 60) continue;
      const down = hj.knocked.has(q.seed);
      c.save(); c.translate(q.x, GY - 6 - (row ? 0 : 14));
      if (down) { c.rotate(-1.4 * (q.seed % 2 ? 1 : -1)); c.translate(0, 10); }
      const near = Math.abs(q.x - (state.player.pos.x + state.player.width / 2)) < 120;
      c.scale(q.seed % 3 ? 1 : -1, 1);
      drawAtomPerson(c, 'guest', { seed: q.seed, f, pose: down ? 'limp' : 'stand', md: down ? 'hurt' : 'ok', talk: hj.barking === q.seed && near });
      c.restore();
    }
    // (the switchback's rails: chrome tubes, between the rows)
    rail(c, LINE_X0 - 10, GY - 50 - (row ? 0 : 14), LINE_X1 - LINE_X0 + 20);
  }
  // (the front rail, in front of the line and behind him (he walks in front of it, this is the back layer), on its
  // stanchions; a newel post at each end, every rail run into it)
  rail(c, LINE_X0 - 10, GY - 34, LINE_X1 - LINE_X0 + 20);
  for (let x = LINE_X0 + 150; x < LINE_X1 - 60; x += 160) { cyl(c, x - 2, GY - 30, 5, 30, '#94A3B8', 'y'); box(c, x - 5, GY - 3, 11, 3, '#475569'); }
  for (const nx of [LINE_X0 - 18, LINE_X1 + 10]) {
    cyl(c, nx, GY - 70, 9, 70, '#94A3B8', 'y');
    sphere(c, nx + 4.5, GY - 73, 5, '#E2E8F0');
    box(c, nx - 4, GY - 4, 17, 4, INK); box(c, nx - 3, GY - 3, 15, 2, '#64748B');
  }
  // (the merge gate: the rail's flat top cap there, polished brass, its lit lip: hop it)
  for (const [x, y, w] of LEDGES) if (x >= LINE_X0 && x < LINE_X1) {
    cyl(c, x + 2, y + 10, 6, GY - y - 10, '#CA8A04', 'y'); cyl(c, x + w - 8, y + 10, 6, GY - y - 10, '#CA8A04', 'y');
    slab(c, x, y, w, 10, '#CA8A04'); box(c, x + 2, y + 1, w - 4, 2, '#FEF3C7');
  }
  // The platform: its edge, the yellow line and its bumps, the console and its big green button
  box(c, PLATFORM_X, GY - 4, TUNNEL_X - PLATFORM_X + 40, 4, '#FACC15'); box(c, PLATFORM_X, GY - 4, TUNNEL_X - PLATFORM_X + 40, 1, '#FEF9C3');
  for (let x = PLATFORM_X + 4; x < TUNNEL_X + 40; x += 8) box(c, x, GY - 3, 2, 2, '#CA8A04');
  slab(c, CONSOLE_X - 30, GY - 70, 60, 70, '#0F766E');
  box(c, CONSOLE_X - 26, GY - 66, 52, 4, '#5EEAD4');
  const pressed = hj.pressT > 0 && hj.pressT < 20;
  box(c, CONSOLE_X + 1, GY - 72, 18, 4, INK);
  c.save(); c.beginPath(); c.rect(CONSOLE_X - 2, GY - 90, 24, 18 + (pressed ? 3 : 0)); c.clip();
  sphere(c, CONSOLE_X + 10, GY - 72 + (pressed ? 3 : 0), 8, pressed ? '#15803D' : '#22C55E');
  c.restore();
  lamp(c, CONSOLE_X - 15, GY - 57, 3, '#F87171', (f >> 4) % 2 === 0, 2);
  lamp(c, CONSOLE_X - 3, GY - 57, 3, '#FDE047', true, 0);
  c.save(); c.translate(CONSOLE_X, GY - 43);
  stamp(c, 'atom-dispatch', -30, -6, 60, 12, g => lettering(g, 'DISPATCH', 0, 0, 'small', '#CCFBF1', '#0F766E'));
  c.restore();
  box(c, CONSOLE_X - 22, GY - 30, 44, 2, '#115E59');
  // (the tunnel's mouth past the sled: its dark going in, the guide lights along the floor, the neon round it)
  stamp(c, 'atom-tunnel', TUNNEL_X - 16, GY - 330, 320, 330, g => {
    const sh = ['#0B0A26', '#08071C', '#060514', '#04030E', '#020208'];
    for (let i = 0; i < 5; i++) box(g, TUNNEL_X + i * 24, GY - 300, i === 4 ? 300 - 96 : 24, 300, sh[i]);
    box(g, TUNNEL_X, GY - 300, 300, 6, '#1E1B4B');
    slab(g, TUNNEL_X - 12, GY - 322, 28, 322, '#64748B');
  });
  for (let i = 0; i < 8; i++) { const lx = TUNNEL_X + 20 + i * (26 - i * 2); box(c, lx, GY - 6, Math.max(1, 3 - (i >> 2)), 2, (i + (f >> 3)) % 4 === 0 ? '#67E8F9' : '#155E75'); }
  neonBar(c, TUNNEL_X - 3, GY - 316, 6, 316, '#F0ABFC', true);
  stamp(c, 'atom-tunnel-sign', TUNNEL_X - 130, GY - 368, 260, 40, g => {
    box(g, TUNNEL_X - 124, GY - 364, 248, 32, INK); box(g, TUNNEL_X - 122, GY - 362, 244, 28, '#9CA3AF'); box(g, TUNNEL_X - 122, GY - 362, 244, 1, '#F3F4F6');
    bandedGradient(g, TUNNEL_X - 119, GY - 359, 238, 22, ['#1E1B4B', '#05030F'], 3);
    lettering(g, 'TO THE FUTURE >>', TUNNEL_X, GY - 348, 'neon', '#F0ABFC', '#1E1B4B', true);
  });
  // (the operator, at her console, unless the scene's moving her)
  if (!hj.opHidden) {
    c.save(); c.translate(CONSOLE_X - 50, GY);
    drawAtomPerson(c, 'op', { seed: OP_SEED, f, pose: hj.opPose, md: 'ok', talk: hj.said?.who === 'op' });
    c.restore();
  }
};
/** A chrome rail (a tube: dark under, lit along its top). */
const rail = (c: Ctx, x: number, y: number, w: number) => { box(c, x, y - 1, w, 6, INK); box(c, x, y, w, 4, '#94A3B8'); box(c, x, y, w, 1, '#F8FAFC'); box(c, x, y + 3, w, 1, '#475569'); };
/** The operator: who she is. */
export const OP_SEED = 5126;

/** The sled at the platform (and the one in front pulling out, and the guests in it, and him), behind and in front. */
export const drawPlatformSleds = (c: Ctx, state: GameState, hj: Hijack, back: boolean) => {
  const f = state.frame;
  if (state.camera.x + CANVAS_WIDTH < PLATFORM_X - 200) return;
  c.save(); c.beginPath(); c.rect(PLATFORM_X - 400, GY - 600, TUNNEL_X + 20 - PLATFORM_X + 400, 700); c.clip();
  // (the one in front, pulling out into the tunnel as he comes up: full of people)
  if (hj.frontX < TUNNEL_X + 200) {
    drawSled(c, hj.frontX, GY, f, FRONT_SLED, true);
    if (!back) {
      for (const [i, s] of [[0, 8811], [1, 9922]] as const) seatedIn(c, hj.frontX + SEATS[i], GY, g => drawAtomPerson(g, 'guest', { seed: s, f, pose: 'stand', md: 'ok' }));
      drawSled(c, hj.frontX, GY, f, FRONT_SLED, false);
    }
  }
  const sx = SLED_X + hj.rolling;
  // (in front of him (the front pass), only the seat backs of the seats guests are still sat in: his seat's back stays
  // behind him, drawn in the back pass)
  drawSled(c, sx, GY, f, HIS_SLED, true, 0, false, back ? [0, 1] : [hj.frontOut ? -1 : 0, hj.backOut ? -1 : 1].filter(i => i >= 0));
  if (!back) {
    // (the guests in it, till they're out)
    if (!hj.frontOut) seatedIn(c, sx + SEATS[0], GY, g => drawAtomPerson(g, 'guest', { seed: GUEST_SEEDS[0], f, pose: 'stand', md: 'ok', talk: hj.said?.who === 'g0' }));
    if (!hj.backOut) seatedIn(c, sx + SEATS[1], GY, g => drawAtomPerson(g, 'guest', { seed: GUEST_SEEDS[1], f, pose: 'stand', md: 'ok', talk: hj.said?.who === 'g1' }));
    drawSled(c, sx, GY, f, HIS_SLED, false);
  }
  c.restore();
  if (!back) {
    // (the thrown one, over the rail; the one walking off)
    for (const g of hj.flying) { c.save(); c.translate(g.x, g.y); c.rotate(g.rot); drawAtomPerson(c, 'guest', { seed: g.seed, f, pose: g.landed ? 'limp' : 'thrown', md: 'hurt', talk: hj.said?.who === 'g0' }); c.restore(); }
    if (hj.walker) { c.save(); c.translate(hj.walker.x, GY); c.scale(-1, 1); drawAtomPerson(c, 'guest', { seed: GUEST_SEEDS[1], f, pose: 'walk', md: 'ok', talk: hj.said?.who === 'g1' }); c.restore(); }
  }
};
export const GUEST_SEEDS = [6402, 7313] as const;

// ---------------------------------------------------------------------------------------------------------------
// The front: what glows

/** A flame, in stepped layers (dark red round the outside to near white in its core), its edge licking: from the
 *  nozzle (x, y) `len` long, `half` wide either side at the nozzle, along `ux, uy` (its way). */
const FLAME = [['#7F1D1D', 1, 1], ['#DC2626', 0.92, 0.84], ['#F97316', 0.78, 0.66], ['#FDE047', 0.52, 0.42], ['#FFFBEB', 0.24, 0.2]] as const;
const flame = (c: Ctx, x: number, y: number, len: number, half: number, ux: number, uy: number, f: number) => {
  const vx = -uy, vy = ux, n = 9;
  for (let li = 0; li < FLAME.length; li++) {
    const [col, lk, hk] = FLAME[li], L = len * lk, Hh = half * hk;
    c.fillStyle = col; c.beginPath(); c.moveTo(x + vx * Hh, y + vy * Hh);
    const edge = (s: number) => {
      for (let i = 1; i <= n; i++) {
        const u = s > 0 ? i / n : 1 - (i - 1) / n, lick = ((i + (f >> 1) + li) % 2 ? 1 : 0.72) * (1 + 0.08 * Math.sin(f * 0.9 + i * 2 + li));
        const w = Hh * Math.pow(1 - u, 0.55) * (u > 0.05 ? lick : 1), along = L * u;
        c.lineTo(x + ux * along + vx * w * s, y + uy * along + vy * w * s);
      }
    };
    edge(1); c.lineTo(x + ux * L, y + uy * L); edge(-1);
    c.lineTo(x - vx * Hh, y - vy * Hh); c.closePath(); c.fill();
  }
};

/** The fog (the laser show's machines): puffs drifting, kept here (just the look). */
const fog: { x: number; y: number; r: number; t: number; vx: number }[] = [];
export const drawAtomFront = (c: Ctx, state: GameState, hj: Hijack) => {
  const f = state.frame, cam = state.camera.x;
  const on = (x0: number, x1_: number) => x1_ > cam - 100 && x0 < cam + CANVAS_WIDTH + 100;
  // The flames (and the sputter before them: the tell)
  for (const t of THRUSTERS) {
    if (!crewed(state, t.post) || !on(t.x - t.len, t.x + t.len)) continue;
    const s = thrustAt(t, f);
    const [ux, uy] = t.dir === 'left' ? [-1, 0] : [0, 1];
    if (!s.fire) { if (s.tell > 0) sputter(c, t, s.tell, ux, uy, f); continue; }
    const fb = flameBox(t);
    if (t.dir === 'left') flame(c, t.x, t.y, fb.w + Math.sin(f * 1.3) * 4, fb.h / 2, ux, uy, f);
    else {
      flame(c, t.x, t.y, fb.h - 10, fb.w / 2, ux, uy, f);
      // (where it hits the floor: it spreads both ways along it)
      for (const d of [-1, 1]) flame(c, t.x, GY - 2, fb.w / 2 + 34, 22, d, 0, f + d * 3);
    }
  }
  // The lasers
  const lit = crewed(state, LASER_POST);
  if (lit && on(FLOOR_LASER.from, FLOOR_LASER.x)) {
    const s = floorLaserAt(f, lit), y = s.high ? FLOOR_LASER.high : FLOOR_LASER.low, L = FLOOR_LASER.x - FLOOR_LASER.from;
    if (s.on) {
      box(c, FLOOR_LASER.from, y - 6, L, 12, 'rgba(34, 197, 94, 0.14)'); box(c, FLOOR_LASER.from, y - 3, L, 6, 'rgba(74, 222, 128, 0.35)');
      box(c, FLOOR_LASER.from, y - 1, L, 2, '#BBF7D0'); box(c, FLOOR_LASER.from, y, L, 1, '#F0FDF4');
      // (where it ends, on the far wall: a splash)
      steppedGlow(c, FLOOR_LASER.from, y, 14, '#4ADE80', 0.5, 0.1, 3);
    } else if (s.tell > 0) for (let x = FLOOR_LASER.x - 8; x > FLOOR_LASER.from; x -= 14) if ((x + f * 3) % 28 < 14) box(c, x, y - 1, 6, 2, '#4ADE80');
    lamp(c, FLOOR_LASER.x - 4, y, 4, '#86EFAC', s.on || s.tell > 0, 3);
  }
  if (lit && on(SWEEP_LASER.x0 - 100, SWEEP_LASER.x + 50)) {
    const sx = sweepSpot(f), sw = sweepState(f);
    // (on the blink: dead, just the emitter's dull red eye; sputtering, a thin flicker of it, a tell; live, the beam)
    if (!sw.live) {
      if (sw.sputter) { c.strokeStyle = 'rgba(254, 202, 202, 0.55)'; c.lineWidth = 1; c.setLineDash([6, 10]); c.lineDashOffset = -f * 3; c.beginPath(); c.moveTo(SWEEP_LASER.x, SWEEP_LASER.y); c.lineTo(sx, GY); c.stroke(); c.setLineDash([]); c.lineDashOffset = 0; }
      lamp(c, SWEEP_LASER.x, SWEEP_LASER.y, 4, '#FCA5A5', sw.sputter, 2);
    } else {
      for (const [lw, cl] of [[12, 'rgba(239, 68, 68, 0.14)'], [6, 'rgba(248, 113, 113, 0.35)'], [2, '#FECACA'], [1, '#FFF1F2']] as const) { c.strokeStyle = cl; c.lineWidth = lw; c.beginPath(); c.moveTo(SWEEP_LASER.x, SWEEP_LASER.y); c.lineTo(sx, GY); c.stroke(); }
      pixelBlob(c, sx, GY - 1, 14, 3, '#FCA5A5');
      box(c, sx - 4, GY - 2, 8, 2, '#FFF1F2');
      lamp(c, SWEEP_LASER.x, SWEEP_LASER.y, 4, '#F87171', true, 3);
    }
  }
  // The fog (it's what the lasers show up in)
  if (on(BLACKLIGHT.x0 - 200, BLACKLIGHT.x1 + 200)) {
    if (f % 14 === 0) for (const x of FOG_XS) fog.push({ x: x + 22, y: GY - 16, r: 12, t: 0, vx: 0.4 + hash(f + x) * 0.8 });
  }
  for (let i = fog.length - 1; i >= 0; i--) {
    const p = fog[i]; p.t++; p.x += p.vx; p.y -= 0.05; p.r += 0.24;
    if (p.t > 300) { fog.splice(i, 1); continue; }
    if (!on(p.x - p.r, p.x + p.r)) continue;
    c.globalAlpha = 0.16 * (1 - p.t / 300); pixelBlob(c, p.x, p.y, p.r, p.r * 0.6, '#C4B5FD', 4);
    c.globalAlpha = 0.1 * (1 - p.t / 300); pixelBlob(c, p.x - p.r * 0.2, p.y - p.r * 0.2, p.r * 0.6, p.r * 0.35, '#EDE9FE', 4);
    c.globalAlpha = 1;
  }
  // The air cannon's blast
  const cn = cannonAt(f, crewed(state, AIRLOCK_POST));
  if (cn.blow > 0 && on(CANNON.from, CANNON.x)) for (let k = 0; k < 14; k++) {
    const y = GY - 20 - hash(k * 3.1) * 220, x = CANNON.x - 60 - ((f * 22 + k * 97) % (CANNON.x - CANNON.from)), w = 40 + hash(k) * 40;
    box(c, x, y, w, 2, `rgba(203, 213, 225, ${0.3 * cn.blow})`); box(c, x, y, 8, 2, `rgba(248, 250, 252, ${0.6 * cn.blow})`);
    if (k % 3 === 0) box(c, x + w + 6, y + 3, 2, 2, `rgba(161, 161, 170, ${0.7 * cn.blow})`);
  }
  // (the tunnel's strip curtain: black strips swaying in the mouth, the sled goes through them)
  if (on(TUNNEL_X, TUNNEL_X + 60)) for (let k = 0; k < 6; k++) {
    const sx = TUNNEL_X + 6 + k * 7 + Math.round(Math.sin(f * 0.04 + k) * 1);
    box(c, sx, GY - 294, 6, 290, '#09090B'); box(c, sx, GY - 294, 1, 290, '#3F3F46');
  }
  // What's being said in the scene
  if (hj.said) saidOver(c, hj.said.s.text, hj.said.x, hj.said.y, hj.said.who === 'op' ? '#99F6E4' : '#FDE68A');
};
/** A thruster's tell: puffs of flame and smoke coughing out of its nozzle, more as it comes up to firing. */
const sputter = (c: Ctx, t: Thruster, tell: number, ux: number, uy: number, f: number) => {
  for (let k = 0; k < 3; k++) {
    if (((f >> 2) + k) % 3 !== 0) continue;
    const d = 10 + k * 14 * tell + (f % 4), x = t.x + ux * d, y = t.y + uy * d, r = 4 + tell * 6 - k;
    pixelBlob(c, x, y, r + 3, r + 2, '#52525B');
    pixelBlob(c, x, y, r, r * 0.8, k ? '#F97316' : '#FDE047');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The lighting: dark backstage, work lamps over each rig, what glows (the neon, the tells); the queue lit up

export const atomLighting = (state: GameState): SceneLight => {
  const f = state.frame, cam = state.camera.x, camY = state.camera.y, lights: Light[] = [];
  const near = (x: number) => x > cam - 300 && x < cam + CANVAS_WIDTH + 300;
  // (work lamps: a cone down off the grid every so often, and over each rig)
  for (const x of WORK_LAMPS) if (near(x)) lights.push({ x, y: GY - 430, r: 430, a: 0.6, cone: 120, color: 'rgba(254, 249, 195, 0.07)' });
  // (the dark ride through the gaps: its marquee and its scenes glowing)
  for (const [gx, gw] of GAPS) {
    const mid = gx + gw / 2;
    if (!near(mid)) continue;
    const sx = cam + (mid - cam) - (mid - cam - CANVAS_WIDTH / 2) * 0.06;
    lights.push({ x: sx, y: camY + MARQUEE_Y - 4, r: 150, a: 0.8, color: 'rgba(240, 171, 252, 0.14)' });
    lights.push({ x: mid, y: camY + 330, r: 170, a: 0.45, color: 'rgba(129, 140, 248, 0.06)' });
  }
  for (const t of THRUSTERS) if (near(t.x) && crewed(state, t.post)) {
    const s = thrustAt(t, f), fb = flameBox(t);
    if (s.fire) {
      lights.push({ x: fb.x + fb.w / 2, y: fb.y + fb.h / 2, r: 340, a: 1, color: 'rgba(251, 146, 60, 0.28)' });
      if (t.dir === 'down') lights.push({ x: t.x, y: GY - 20, r: 200, a: 1, color: 'rgba(253, 224, 71, 0.2)' });
    } else if (s.tell > 0) lights.push({ x: t.x, y: t.y, r: 110, a: 0.7 * s.tell, color: 'rgba(253, 186, 116, 0.22)' });
  }
  if (near(A + 50)) lights.push({ x: A + 50, y: GY - 205, r: 90, a: 0.8, color: 'rgba(248, 113, 113, 0.18)' });
  for (const d of AIRLOCKS) if (near(d.x)) { const s = airlockAt(d, f, crewed(state, AIRLOCK_POST)); if (s.warn > 0) lights.push({ x: d.x + d.w / 2, y: AIRLOCK_TOP - 34, r: 170, a: (f >> 2) % 2 ? 0.95 : 0.3, color: 'rgba(239, 68, 68, 0.24)' }); }
  if (near(BLACKLIGHT.x0) || near(BLACKLIGHT.x1)) {
    for (let x = BLACKLIGHT.x0 + 100; x < BLACKLIGHT.x1; x += 260) lights.push({ x, y: GY - 300, r: 360, a: 0.72, color: 'rgba(147, 51, 234, 0.2)' });
    for (const x of FOG_XS) lights.push({ x: x + 60, y: GY - 30, r: 120, a: 0.5, color: 'rgba(196, 181, 253, 0.1)' });
    if (crewed(state, LASER_POST)) {
      const s = floorLaserAt(f, true);
      if (s.on) for (let x = FLOOR_LASER.from; x < FLOOR_LASER.x; x += 100) lights.push({ x, y: s.high ? FLOOR_LASER.high : FLOOR_LASER.low, r: 80, a: 0.85, color: 'rgba(74, 222, 128, 0.24)' });
      else if (s.tell > 0) lights.push({ x: FLOOR_LASER.x, y: s.high ? FLOOR_LASER.high : FLOOR_LASER.low, r: 70, a: 0.7, color: 'rgba(74, 222, 128, 0.2)' });
      if (sweepState(f).live) { lights.push({ x: sweepSpot(f), y: GY - 10, r: 90, a: 0.95, color: 'rgba(248, 113, 113, 0.3)' }); lights.push({ x: (sweepSpot(f) + SWEEP_LASER.x) / 2, y: (GY + SWEEP_LASER.y) / 2, r: 110, a: 0.5, color: 'rgba(248, 113, 113, 0.12)' }); }
    }
  }
  for (const [post, x, feet] of POSTS) if (near(x)) lights.push({ x: x + 30, y: feet - 40, r: 110, a: crewed(state, post) ? 0.7 : 0.3, color: 'rgba(74, 222, 128, 0.1)' });
  // (the queue: lit for the guests; its cove neon, its TVs, its signs)
  if (near(QUEUE_DOOR) || near(TUNNEL_X)) {
    for (let x = LINE_X0; x < TUNNEL_X + 100; x += 200) lights.push({ x, y: GY - 400, r: 520, a: 0.9, cone: 220, color: 'rgba(224, 242, 254, 0.08)' });
    for (let x = QUEUE_DOOR; x < TUNNEL_X + 200; x += 240) lights.push({ x, y: GY - 452, r: 140, a: 0.7, color: 'rgba(103, 232, 249, 0.1)' });
    for (let k = 0; k < 5; k++) { const tx = LINE_X0 + 90 + k * 150, ad = (f + k * 40) % 240 < 120; lights.push({ x: tx, y: GY - 305, r: 120, a: 0.85, color: ad ? 'rgba(14, 165, 233, 0.14)' : 'rgba(244, 114, 182, 0.14)' }); }
  }
  if (near(LINE_X0 + 340)) lights.push({ x: LINE_X0 + 340, y: GY - 405, r: 300, a: 0.85, color: 'rgba(103, 232, 249, 0.12)' });
  if (near(TUNNEL_X)) { lights.push({ x: TUNNEL_X, y: GY - 348, r: 200, a: 0.85, color: 'rgba(240, 171, 252, 0.12)' }); lights.push({ x: TUNNEL_X, y: GY - 160, r: 160, a: 0.6, color: 'rgba(240, 171, 252, 0.1)' }); }
  if (near(CONSOLE_X)) lights.push({ x: CONSOLE_X + 10, y: GY - 76, r: 70, a: 0.8, color: 'rgba(34, 197, 94, 0.16)' });
  // (enough round him that he's never lost in it)
  const p = state.player;
  lights.push({ x: p.pos.x + p.width / 2, y: p.pos.y + 20, r: 200, a: 0.6 });
  return { dark: 0.6, shade: [6, 4, 18], lights, rim: 0.5 };
};

export { x1 as ATOM_X1 };
