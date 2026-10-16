// Disaster: The Ride, the flood out of the screen (looks only: the water's reach and timing are real.ts's, nothing
// here touches traversal). Shallow, dirty floodwater across the theater's deck going back on the one eye: its surface
// in depth bands (murky green-brown-blue, the near band thin enough to show the deck and its glow tape through it,
// dithered where the bands meet), ripples running, the room's light (the burning screen, the heater's fire, the pars)
// broken up on it, a foam line at its leading edge and along the back wall, the back wall wet-dark above its waterline,
// a bright rim along the front at the play plane. The falls off the screen's foot and their splashes. Junk afloat
// (popcorn buckets, cups, a shoe, a seat cushion, a nacho tray, a program), bobbing and drifting. Foam rings round
// whatever stands in it: the effects' feet (back halves before them, front halves after), the lean rails' posts, his
// feet, and his wake when he wades.

import type { GameState } from '../../../m1/game/core/state';
import { box, checker, hash, at, poly } from '../blvd/kit';
import { X, Y, GY, SCREEN, FX, LEAN_RAILS } from './layout';
import type { Dz } from './state';
import { type Ctx, type View, INK, WALL_D, SCREEN_D, EFX_D, levelQ, deep, still } from './paint';

/** The surface (just over the deck). */
const SY = GY - 2;
/** The water, near to far (green-brown-blue; the near band thin), and its lights. */
const MURK: [string, number][] = [['#2E4A3E', 0.42], ['#2C463E', 0.58], ['#2C4246', 0.7], ['#30484E', 0.8], ['#3A5056', 0.86], ['#465C5E', 0.9]];
const FOAM = ['#7A948A', '#A8BEB2', '#DCE8E0'];
const rgb = (hex: string, a: number) => `rgba(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}, ${a})`;

/** How far it's got (world x). */
export const floodSpan = (o: Dz): [number, number] => { const a = X(SCREEN.a - 200); return [a, a + (SCREEN.b - SCREEN.a + 400) * o.real.flood]; };
const sxAt = (v: View, x: number, d: number) => at(v.eye, x, SY, d)[0];
const syAt = (v: View, d: number) => at(v.eye, 0, SY, d)[1];

/** A foam ring's half (back: the far half, before what stands in it; front: after), round x at depth d. */
const ring = (c: Ctx, v: View, x: number, d: number, hw: number, back: boolean, f: number) => {
  const [px, py] = at(v.eye, x, SY, d), rx = (hw + 5) * d, ry = Math.max(2, rx * 0.22 * (GY - v.eye.y) / 298);
  if (ry <= 0 || rx <= 0) return;
  const a0 = back ? Math.PI : 0, a1 = back ? Math.PI * 2 : Math.PI;
  for (const [lw, col, k] of [[3, rgb(FOAM[0], 0.55), 1.15], [1, rgb(FOAM[2], 0.8), 1]] as const) {
    c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.ellipse(px, py, rx * k, ry * k, 0, a0, a1); c.stroke();
  }
  // (bubbles winking on it)
  for (let i = 0; i < 4; i++) {
    const t = a0 + ((i + 0.5) / 4) * Math.PI + Math.sin(f * 0.05 + i + x) * 0.2;
    if ((f + i * 11) % 30 < 20) box(c, Math.round(px + Math.cos(t) * rx * 1.25), Math.round(py + Math.sin(t) * ry * 1.25), 1, 1, FOAM[2]);
  }
};

/** What stands in the water: [x, depth, half width]. */
const standing = (): [number, number, number][] => {
  const hx = X(FX.heater), fx = X(FX.fan), ax = X(FX.ac), sx = X(FX.squirt), gx = X(FX.fog);
  const out: [number, number, number][] = [
    [hx, EFX_D, 24], [hx + 20, EFX_D, 2], [hx + 52, EFX_D, 2], [fx - 12, EFX_D, 3], [fx + 12, EFX_D, 3],
    [ax - 38, EFX_D, 3], [ax + 38, EFX_D, 3], [sx, EFX_D, 4], [gx, EFX_D, 30],
  ];
  for (const rx of LEAN_RAILS) for (const px of [-52, 0, 52]) out.push([X(rx) + px, 0.997, 4]);
  return out;
};

// ---------------------------------------------------------------------------------------------------------------
// Junk afloat

type Junk = 'popcorn' | 'cup' | 'shoe' | 'cushion' | 'nachos' | 'program';
const JUNK: [number, number, Junk, number][] = [
  [3420, 0.975, 'popcorn', 1.1], [3560, 0.92, 'cup', 2.3], [3700, 0.985, 'cushion', 0.4], [3880, 0.9, 'shoe', 3.7],
  [3990, 0.96, 'popcorn', 4.4], [4150, 0.88, 'nachos', 5.2], [4260, 0.982, 'cup', 0.9], [4420, 0.94, 'program', 2.8],
  [4580, 0.97, 'cushion', 3.1], [4700, 0.9, 'cup', 1.7], [4760, 0.985, 'shoe', 4.9],
];
/** A piece of junk, its waterline at y = 0 (only what's over the water drawn; a dark reflection under). */
const paintJunk = (g: Ctx, k: Junk) => {
  const outline = (x: number, y: number, w: number, h: number) => box(g, x - 1, y - 1, w + 2, h + 1, INK);
  if (k === 'popcorn') {
    // (a bucket bobbing on its side: red and white stripes, kernels spilling)
    outline(-9, -9, 18, 9);
    for (let i = 0; i < 6; i++) box(g, -9 + i * 3, -9, 3, 9, i % 2 ? '#F5F5F4' : '#DC2626');
    box(g, -9, -9, 18, 1, 'rgba(255,255,255,0.5)'); box(g, 9, -10, 4, 10, INK); box(g, 9, -9, 3, 9, '#B91C1C');
    for (let i = 0; i < 5; i++) { box(g, 13 + i * 3, -3 - (i % 2) * 2, 3, 3, INK); box(g, 13 + i * 3, -2 - (i % 2) * 2, 2, 2, i % 2 ? '#FEF3C7' : '#FDE68A'); }
  } else if (k === 'cup') {
    // (a soda cup on its side, its lid and straw)
    outline(-8, -6, 16, 6); box(g, -8, -6, 16, 6, '#F5F5F4'); box(g, -8, -4, 16, 2, '#DC2626'); box(g, -8, -6, 16, 1, '#FFFFFF');
    box(g, 8, -7, 3, 7, INK); box(g, 8, -6, 2, 6, '#D6D3D1'); box(g, 10, -5, 8, 2, INK); box(g, 10, -5, 7, 1, '#F87171');
  } else if (k === 'shoe') {
    // (a sneaker, toe up: its white sole, the blue upper, a lace)
    outline(-9, -7, 18, 7); box(g, -9, -2, 18, 2, '#F5F5F4'); box(g, -8, -7, 14, 5, '#1D4ED8'); box(g, -8, -7, 14, 1, '#60A5FA'); box(g, -2, -6, 6, 1, '#F5F5F4'); box(g, 6, -5, 3, 3, '#E7E5E4');
  } else if (k === 'cushion') {
    // (a seat cushion: maroon vinyl, its button, flat)
    outline(-13, -4, 26, 4); box(g, -13, -4, 26, 4, '#7F1D1D'); box(g, -13, -4, 26, 1, '#B91C1C'); box(g, -1, -3, 2, 2, '#450A0A'); checker(g, -13, -2, 26, 2, '#5A0E0E', 0, 1);
  } else if (k === 'nachos') {
    // (a nacho tray: the cardboard boat, chips, the cheese gone cold)
    outline(-10, -4, 20, 4); box(g, -10, -4, 20, 4, '#E8E0CC'); box(g, -10, -4, 20, 1, '#FFFFFF');
    for (let i = 0; i < 4; i++) poly(g, [[-8 + i * 5, -4], [-5 + i * 5, -9], [-2 + i * 5, -4]], i % 2 ? '#E8B830' : '#F2CC50');
    box(g, -6, -5, 10, 2, '#F97316');
  } else {
    // (a souvenir program, open, soaked)
    outline(-10, -2, 20, 2); box(g, -10, -2, 10, 2, '#FDE047'); box(g, 0, -2, 10, 2, '#F97316'); box(g, -1, -3, 2, 3, INK);
  }
  // (its waterline: a lit line where it sits in it, a dark reflection under)
  box(g, -12, 0, 24, 1, 'rgba(220, 232, 224, 0.6)'); box(g, -9, 1, 18, 2, 'rgba(10, 16, 14, 0.35)');
};

// ---------------------------------------------------------------------------------------------------------------

/** The water itself, back to front (before anything that stands in it), and the far halves of the foam rings. */
export const floodSurface = (c: Ctx, v: View, state: GameState, o: Dz, f: number, real: boolean) => {
  const r = o.real;
  if (r.flood <= 0) return;
  const [a, b] = floodSpan(o);
  if (b - a < 4) return;
  const n = MURK.length, dAt = (i: number) => 1 - ((1 - WALL_D) * i) / n;
  // (the back wall wet-dark above its waterline, the line itself)
  deep(c, v, WALL_D, () => {
    box(c, a, SY - 16, b - a, 14, 'rgba(8, 12, 10, 0.35)'); checker(c, a, SY - 20, b - a, 4, 'rgba(8, 12, 10, 0.35)', 0, 1);
    box(c, a, SY - 1, b - a, 1, rgb(FOAM[1], 0.5));
  });
  // (the surface in bands going back, nearest thinnest: the deck shows through; dithered where they meet)
  for (let i = 0; i < n; i++) levelQ(c, v.eye, a, b, SY, dAt(i), dAt(i + 1), rgb(MURK[i][0], MURK[i][1]));
  for (let i = 1; i < n; i++) { const y = Math.round(syAt(v, dAt(i))), p = sxAt(v, a, dAt(i)), q = sxAt(v, b, dAt(i)); checker(c, p, y, q - p, 2, rgb(MURK[i][0], 0.6), 0, 1); }
  // (silt clouding the near band, brown)
  { const y0 = Math.round(syAt(v, dAt(1))), y1 = Math.round(syAt(v, 1)); for (let k = Math.ceil(a / 70) * 70; k < b; k += 70) { const px = sxAt(v, k + Math.sin(f * 0.01 + k) * 10, 0.99); checker(c, px, y0, 30, y1 - y0, 'rgba(90, 72, 48, 0.35)', 0, 2); } }
  // (the room's light broken up on it: the screen's, flickering; the heater's fire; the pars' red dots)
  const lights: [number, string, number][] = [[(X(SCREEN.a) + X(SCREEN.b)) / 2, real ? '#FDBA74' : '#CBD5E1', 60], [X(FX.heater), '#F97316', 24]];
  for (const [lx, col, w0] of lights) {
    if (lx < a - 40 || lx > b + 40) continue;
    for (let rI = 0; rI < 14; rI++) {
      const d = 1 - ((1 - WALL_D) * (rI + 0.5)) / 14, wob = Math.sin(f * 0.13 + rI * 1.7) * 10 + Math.sin(f * 0.05 + rI) * 6;
      const w = Math.max(3, (w0 * (1 - rI / 18) + Math.sin(f * 0.2 + rI * 2.3) * 8) * d);
      const px = sxAt(v, lx + wob, d), py = Math.round(syAt(v, d));
      if ((f + rI * 7) % 9 === 0) continue;
      box(c, px - w / 2, py, w, 1, rgb(col, 0.55 - rI * 0.025)); box(c, px - w / 4 + wob * 0.3, py, w / 2, 1, rgb('#FFF4E0', 0.35));
    }
  }
  for (let k = Math.ceil(a / 130) * 130 + 40; k < b; k += 130) { const d = WALL_D + 0.02, py = Math.round(syAt(v, d)) + 1; if ((f >> 3) % 4 !== k % 4) box(c, sxAt(v, k, d), py, 3, 1, rgb('#EF4444', 0.6)); }
  // (ripples running across it: lit crests, a dark trough under each)
  for (let rI = 0; rI < 10; rI++) {
    const d = 1 - ((1 - WALL_D) * (rI + 0.5)) / 10, py = Math.round(syAt(v, d)), span = b - a, step = 70 + rI * 6;
    for (let i = 0; i < Math.ceil(span / step); i++) {
      const x = a + ((i * step + hash(i * 3.3 + rI) * step + f * (0.25 + (rI % 3) * 0.12)) % span), w = (6 + hash(i + rI * 7) * 12) * d;
      const px = sxAt(v, x, d);
      box(c, px, py, w, 1, rgb(FOAM[1], 0.45 - rI * 0.025)); box(c, px + 1, py + 1, w - 2, 1, 'rgba(10, 18, 16, 0.3)');
    }
  }
  // (foam along the back wall's foot, and the leading edge going back)
  { const y = Math.round(syAt(v, WALL_D)), p = sxAt(v, a, WALL_D), q = sxAt(v, b, WALL_D); checker(c, p, y - 1, q - p, 2, rgb(FOAM[1], 0.6), (f >> 2) & 1, 1); }
  if (r.flood < 1) {
    for (let rI = 0; rI < 12; rI++) {
      const d = 1 - ((1 - WALL_D) * rI) / 12, px = sxAt(v, b + Math.sin(f * 0.2 + rI) * 4, d), py = Math.round(syAt(v, d));
      box(c, px - 6 * d, py, 8 * d, 1, FOAM[2]); box(c, px - 10 * d, py, 4 * d, 1, rgb(FOAM[1], 0.6));
    }
  }
  // (the falls off the screen's foot and their splashes)
  if (r.flood > 0.2) {
    deep(c, v, SCREEN_D, () => {
      const top = Y(SCREEN.lo), h = SY - top;
      for (let i = 0; i < 6; i++) {
        const wx = X(SCREEN.a) + 160 + i * 150;
        box(c, wx - 1, top, 10, h, 'rgba(46, 74, 64, 0.35)'); box(c, wx, top, 8, h, 'rgba(90, 130, 120, 0.3)'); box(c, wx + 1, top, 2, h, 'rgba(200, 222, 210, 0.4)');
        for (let k = 0; k < 6; k++) { const yy = top + ((f * 5 + k * 23 + i * 11) % h); box(c, wx + 2 + (k % 3) * 2, yy, 2, 6, rgb(FOAM[2], 0.6)); }
        // (the crown where it hits: droplets in arcs, the churn)
        for (let j = 0; j < 7; j++) {
          const t = ((f + j * 5 + i * 13) % 18) / 18, dx = (j - 3) * 5 * t + 4, dy = -Math.sin(t * Math.PI) * (8 + (j % 3) * 4);
          box(c, wx + dx, SY + dy, 2, 2, j % 2 ? FOAM[2] : FOAM[1]);
        }
        box(c, wx - 8, SY - 2, 24, 3, rgb(FOAM[1], 0.6)); checker(c, wx - 12, SY - 3, 32, 4, rgb(FOAM[2], 0.5), f & 1, 1);
      }
    });
  }
  // (the junk afloat: bobbing, turning a little, drifting)
  for (const [rx, d, k, ph] of JUNK) {
    const x = X(rx) + Math.sin(f * 0.006 + ph) * 34 + Math.sin(f * 0.017 + ph * 2) * 6;
    if (x < a + 10 || x > b - 10) continue;
    deep(c, v, d, () => {
      c.save(); c.translate(Math.round(x), SY + Math.round(Math.sin(f * 0.07 + ph) * 1.5)); c.rotate(Math.sin(f * 0.04 + ph) * 0.12);
      still(c, `flood-${k}`, 0, 0, -16, -14, 40, 18, g => paintJunk(g, k));
      c.restore();
    });
  }
  // (the far halves of the rings round what stands in it; his feet, his wake)
  for (const [x, d, hw] of standing()) if (x > a && x < b) ring(c, v, x, d, hw, true, f);
  const p = state.player, px = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  if (px > a && px < b && Math.abs(feet - GY) < 6 && p.health > 0) {
    ring(c, v, px, 0.996, p.width / 2, true, f);
    const vx = p.vel?.x ?? 0;
    if (Math.abs(vx) > 0.8) {
      // (the wake: a V of foam fanning back behind him, broken)
      const dir = vx > 0 ? -1 : 1;
      for (let i = 1; i < 9; i++) {
        const d = 0.996 - i * 0.005, x = px + dir * i * 9, [qx, qy] = at(v.eye, x, SY, d);
        if ((i + (f >> 2)) % 3 !== 0) box(c, Math.round(qx), Math.round(qy), Math.max(2, 6 - i * 0.5), 1, rgb(FOAM[2], 0.8 - i * 0.08));
      }
      for (let i = 0; i < 3; i++) box(c, px - dir * (8 + i * 3), GY - 4 - ((f + i * 4) % 8), 2, 2, FOAM[2]);
    }
  }
  // (the bright rim along the front at the play plane)
  { const p0 = Math.round(sxAt(v, a, 1)), q0 = Math.round(sxAt(v, b, 1)), y = Math.round(syAt(v, 1)); box(c, p0, y, q0 - p0, 1, rgb(FOAM[2], 0.8)); box(c, p0, y + 1, q0 - p0, 1, rgb(FOAM[0], 0.6)); checker(c, p0, y - 1, q0 - p0, 1, rgb(FOAM[1], 0.7), (f >> 3) & 1, 1); }
};

/** The near halves of the effects' rings (after they're drawn). */
export const floodFoamFront = (c: Ctx, v: View, o: Dz, f: number) => {
  if (o.real.flood <= 0) return;
  const [a, b] = floodSpan(o);
  for (const [x, d, hw] of standing()) if (d < 0.99 && x > a && x < b) ring(c, v, x, d, hw, false, f);
};
