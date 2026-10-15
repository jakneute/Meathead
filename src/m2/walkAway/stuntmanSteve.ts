// The walk-away from STUNTMAN STEVE (Hollywood Land's boss): back out across the stunt stage toward the camera at
// whatever hour it is now (timeOfDay.ts). The asphalt floor, its lane paint and the drift marks all over it; the
// amphitheater's half-empty bowl going up round the back, its light towers, the HAPPYWOOD hill far off past it. Along
// the way, the posse's wrecks (red and blue, still burning), hula hoops lying where they came down, traffic cones,
// Steve's yellow flier trampled. And Steve's fate: killed by his weakness (the lightning), a pile of ash with his gold
// aviators on top and his neck brace beside it; any other way, him face down by the crash mat he missed, rear up in his
// star-spangled briefs, his yellow pants burnt off him lying by. His toy: the STUNT CAR (its walk-away act: the
// clapperboard, walkAway/acts.ts).

import { type Ctx, type Prop, type SceneDef, INK, HOR, box, hash, smoke, fire } from './kit';
import { timeOfDay, hourMix } from '../timeOfDay';
import { slate } from './toys';
import { drawSteve, drawSteveAsh, drawSteveBrace } from '../hollywood/stunt/steve';

// ---------------------------------------------------------------------------------------------------------------
// The floor: asphalt, the lanes, the drift marks

const ground = (g: Ctx, w: number, h: number) => {
  box(g, 0, 0, w, h, '#3F3F46');
  for (let i = 0; i < 260; i++) box(g, hash(i * 1.3) * w, hash(i * 2.9) * h, 1, 1, i % 2 ? '#52525B' : '#27272A');
  // (the lane dashes down it, the yellow mark tape)
  for (let y = 0; y < h; y += 32) { box(g, w / 2 - 34, y, 3, 16, '#D6D3D1'); box(g, w / 2 + 31, y, 3, 16, '#D6D3D1'); }
  box(g, w / 2 - 1, 0, 2, h, '#CA8A04');
  // (drift marks: black arcs, the tires' two lines each)
  g.strokeStyle = 'rgba(12, 10, 9, 0.6)'; g.lineWidth = 2;
  for (let k = 0; k < 5; k++) {
    const cx = hash(k * 7.7) * w, cy = hash(k * 3.1) * h, r = 30 + hash(k) * 60;
    for (const o of [0, 7]) { g.beginPath(); g.arc(cx, cy, r + o, hash(k * 5) * 6, hash(k * 5) * 6 + 2.2); g.stroke(); }
  }
  // (oil)
  for (let k = 0; k < 4; k++) { g.fillStyle = 'rgba(12, 10, 9, 0.45)'; g.beginPath(); g.ellipse(hash(k * 9) * w, hash(k * 4) * h, 8, 4, 0, 0, Math.PI * 2); g.fill(); }
};

// ---------------------------------------------------------------------------------------------------------------
// Far off: the bowl of seats round the back, its light towers, the hill

const back = (c: Ctx, t: number, sway: number) => {
  const tod = timeOfDay();
  // (the hill, far off, its letters (one fallen))
  const hx = Math.round(320 + sway * 0.3);
  c.fillStyle = hourMix('#A16207', '#92400E', '#3F2A14'); c.beginPath(); c.moveTo(hx - 70, HOR); c.quadraticCurveTo(hx, HOR - 50, hx + 70, HOR); c.fill();
  for (let i = 0; i < 9; i++) { if (i === 7) continue; const lx = hx - 32 + i * 7, tt = (lx - hx + 70) / 140; box(c, lx, HOR - 100 * tt * (1 - tt) - 7, 4, 6, '#F5F5F4'); }
  // (the amphitheater's bowl: tiers, the seats half empty, coming round toward us both sides)
  const bx = Math.round(200 + sway * 0.6);
  for (let i = 0; i < 6; i++) {
    c.fillStyle = i % 2 ? hourMix('#78716C', '#57534E', '#292524') : hourMix('#57534E', '#44403C', '#1C1917');
    c.beginPath(); c.ellipse(bx, HOR + 4, 260 - i * 18, 40 - i * 5, 0, Math.PI, 0); c.fill();
  }
  for (let i = 0; i < 40; i++) { const a = Math.PI + hash(i) * Math.PI, r = 250 - Math.floor(hash(i * 3) * 5) * 18; box(c, bx + Math.cos(a) * r, HOR + 2 + Math.sin(a) * (r * 0.15), 1, 2, ['#DC2626', '#2563EB', '#FACC15', '#F8FAFC'][i % 4]); }
  // (the marquee over the stage, dark now: SHOW CANCELED)
  box(c, bx - 40, HOR - 30, 80, 10, INK); box(c, bx - 39, HOR - 29, 78, 8, '#18181B'); box(c, bx - 38, HOR - 28, 76, 2, '#FACC15');
  box(c, bx - 30, HOR - 27, 60, 4, '#F8FAFC'); box(c, bx - 26, HOR - 26, 52, 2, '#DC2626');
  // (the light towers)
  for (const s of [-1, 1]) {
    const tx = bx + s * 240;
    box(c, tx, HOR - 60, 2, 60, hourMix('#52525B', '#3F3F46', '#18181B'));
    box(c, tx - 7, HOR - 66, 16, 7, INK); box(c, tx - 6, HOR - 65, 14, 5, tod.lamps > 0.3 ? '#FEF9C3' : '#A1A1AA');
  }
  // (smoke going up off the stage behind him)
  smoke(c, bx + 30, HOR - 2, 3, t, 5, { n: 7, rise: 0.03, drift: 0.05, size: 0.6, col: ['#3F3A36', '#57534E', '#6B6460', '#78716C'] });
};

// ---------------------------------------------------------------------------------------------------------------
// The wreckage

const wreck = (col: string, dark: string) => (g: Ctx, w: number, h: number) => {
  // (a stunt car on its roof, burnt, its wheels up)
  box(g, 1, h * 0.35, w - 2, h * 0.5, INK); box(g, 2, h * 0.37, w - 4, h * 0.45, dark);
  box(g, 2, h * 0.37, w - 4, h * 0.12, col);
  box(g, w * 0.25, h * 0.78, w * 0.5, h * 0.2, INK); box(g, w * 0.27, h * 0.8, w * 0.46, h * 0.16, '#1C1917');
  for (const wx of [0.18, 0.78]) { g.fillStyle = INK; g.beginPath(); g.arc(w * wx, h * 0.3, h * 0.17, 0, Math.PI * 2); g.fill(); g.fillStyle = '#3F3F46'; g.beginPath(); g.arc(w * wx, h * 0.3, h * 0.09, 0, Math.PI * 2); g.fill(); }
  for (let i = 0; i < 20; i++) box(g, hash(i * 2.3) * w, h * 0.4 + hash(i * 1.7) * h * 0.4, 2, 1, '#0C0A09');
};
const burning = (c: Ctx, sx: number, sy: number, s: number, t: number) => { fire(c, sx, sy - s * 0.5, s * 0.8, t, Math.round(sx)); smoke(c, sx, sy - s * 0.9, s, t, Math.round(sx) % 7, { n: 5, size: 0.4, rise: 0.025 }); };
const hoop = (g: Ctx, w: number, h: number) => {
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.ellipse(w / 2, h / 2, w / 2 - 2, h / 2 - 2, 0, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = '#F472B6'; g.lineWidth = 2; g.stroke();
};
const cone = (g: Ctx, w: number, h: number) => {
  g.fillStyle = INK; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w, h); g.lineTo(0, h); g.closePath(); g.fill();
  g.fillStyle = '#F97316'; g.beginPath(); g.moveTo(w / 2, 1); g.lineTo(w - 1, h - 1); g.lineTo(1, h - 1); g.closePath(); g.fill();
  box(g, w * 0.25, h * 0.5, w * 0.5, h * 0.12, '#F8FAFC');
};
const flier = (g: Ctx, w: number, h: number) => {
  // (one of his yellow fliers, trodden on)
  box(g, 0, 0, w, h, INK); box(g, 1, 1, w - 2, h - 2, '#FACC15');
  box(g, w * 0.35, h * 0.15, w * 0.3, h * 0.35, '#E0A27A'); box(g, w * 0.3, h * 0.12, w * 0.4, h * 0.1, '#8A5A2B');
  box(g, w * 0.36, h * 0.27, w * 0.28, h * 0.06, '#1C1917');
  box(g, w * 0.15, h * 0.7, w * 0.7, h * 0.08, '#18181B');
  for (let i = 0; i < 6; i++) box(g, hash(i) * w, hash(i * 3) * h, 3, 2, 'rgba(41, 37, 36, 0.7)');
};
const mat = (g: Ctx, w: number, h: number) => { box(g, 0, 0, w, h, INK); box(g, 1, 1, w - 2, h - 2, '#1D4ED8'); box(g, 1, 1, w - 2, 3, '#60A5FA'); };
/** Him, face down by the mat he missed, rear up, pants off. */
const steveDown = (g: Ctx, w: number, h: number) => { g.save(); g.translate(w * 0.5, h); g.scale(w / 100, w / 100); drawSteve(g, 0, 0, 1, 'down', 0, { pantsDown: true }); g.restore(); };
const pants = (g: Ctx, w: number, h: number) => { box(g, 0, h * 0.2, w, h * 0.6, INK); box(g, 1, h * 0.25, w - 2, h * 0.5, '#CA8A04'); box(g, w * 0.4, h * 0.25, w * 0.08, h * 0.5, '#DC2626'); for (let i = 0; i < 6; i++) box(g, hash(i) * w, h * 0.3 + hash(i * 2) * h * 0.4, 3, 2, '#1C1917'); };
/** His ash, the gold aviators on top, the neck brace rolled off by it. */
const ash = (g: Ctx, w: number, h: number) => {
  const s = w / 130;
  g.save(); g.translate(0, h); g.scale(s, s);
  drawSteveAsh(g, 54, 0, 1, 0);
  drawSteveBrace(g, 118, 0, 0);
  g.restore();
};

const props = (weakness: boolean): Prop[] => {
  const out: Prop[] = [];
  // Steve, close by: ash (the lightning), or face down by the mat (anything else)
  if (weakness) out.push({ id: 'sw-ash', x: 1.3, z: 4.2, w: 1.2, h: 0.5, ppm: 40, paint: ash, live: (c, sx, sy, s, t) => smoke(c, sx, sy - s * 0.3, s, t, 3, { n: 4, size: 0.3, rise: 0.02, col: ['#57534E', '#78716C', '#A8A29E'] }) });
  else {
    out.push({ id: 'sw-mat', x: -2.2, z: 5, w: 2, h: 0.5, ppm: 32, paint: mat });
    out.push({ id: 'sw-steve', x: 1.2, z: 4.6, w: 1.9, h: 0.55, ppm: 50, paint: steveDown });
    out.push({ id: 'sw-pants', x: 2.4, z: 6, w: 0.8, h: 0.35, ppm: 40, paint: pants, live: (c, sx, sy, s, t) => fire(c, sx, sy, s * 0.25, t, 4) });
  }
  // The wrecks, the hoops, the cones, his fliers (strewn the whole way)
  for (let i = 0; i < 10; i++) {
    const side = i % 2 ? 1 : -1, x = side * (2.6 + hash(i * 3.3) * 2.4), z = 7 + hash(i * 7.1) * 30, k = i % 4;
    if (k === 0) out.push({ id: 'sw-wreck-r', x, z, w: 3.2, h: 1.3, ppm: 24, paint: wreck('#DC2626', '#7F1D1D'), live: burning, wrap: true });
    else if (k === 1) out.push({ id: 'sw-wreck-b', x, z, w: 3.2, h: 1.3, ppm: 24, paint: wreck('#2563EB', '#1E3A8A'), live: burning, wrap: true });
    else if (k === 2) out.push({ id: 'sw-hoop', x, z, w: 1.6, h: 0.5, ppm: 32, paint: hoop, wrap: true });
    else out.push({ id: 'sw-cone', x: side * (0.9 + hash(i) * 0.8), z, w: 0.35, h: 0.5, ppm: 40, paint: cone, wrap: true });
  }
  for (let i = 0; i < 6; i++) out.push({ id: 'sw-flier', x: (i % 2 ? 1 : -1) * (0.6 + hash(i * 5.1) * 1.4), z: 5 + hash(i * 2.7) * 26, w: 0.45, h: 0.6, ppm: 40, paint: flier, wrap: true });
  return out;
};

export const STUNTMAN_STEVE: SceneDef = {
  land: 'HOLLYWOOD LAND',
  weapon: 'STUNT_CAR',
  sky: ['#1E3A8A', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#FDE68A', '#FEF3C7'],
  haze: '#A8A29E',
  ground, back, props,
  drawWeapon: (c: Ctx, t: number) => slate(c, t, 0),
  grip: [[0, 0], [0, -14]],
  rim: '#FDBA74',
  embers: ['#FDE68A', '#FDBA74', '#F97316', '#DC2626'],
};
