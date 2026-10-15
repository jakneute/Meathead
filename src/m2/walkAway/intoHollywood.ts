// The walk into Hollywood Land (portalWalk.ts): a PLACEHOLDER (crude; the blvd's owner can bring the boulevard's own
// painting into it later, the way intoSpooky.ts does the town's). Out of the portal and up a cheap imitation of
// Hollywood Blvd: gray pavement with the Walk of Fame's pink stars set in it either side of the path, palm trees and
// plywood facades (their bracing showing) along both sides, Stuntman Steve's standees by the way, and far off at the
// end of it the HAPPYWOOD hill, its big letters on the crest (one fallen over), searchlights sweeping. The sky by
// whatever hour it is (timeOfDay.ts).

import { type Ctx, type Prop, type PortalDef, HOR, box, hash } from './kit';
import { timeOfDay, hourMix } from '../timeOfDay';

// ---------------------------------------------------------------------------------------------------------------
// The ground: gray pavement slabs, the stars down both sides of the path

const ground = (g: Ctx, w: number, h: number) => {
  box(g, 0, 0, w, h, '#71717A');
  for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) box(g, x, y, 31, 31, hash(x * 0.3 + y * 1.7) > 0.5 ? '#7C7C85' : '#76767F');
  // (the stars: a pink square, a brass star in it, either side of the path)
  for (let y = 4; y < h; y += 64) for (const x of [w / 2 - 72, w / 2 + 40]) {
    box(g, x, y, 32, 32, '#DB7093'); box(g, x + 1, y + 1, 30, 1, '#F0A3BC');
    g.fillStyle = '#EAB308'; g.beginPath();
    for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? 5 : 12; g.lineTo(x + 16 + Math.cos(a) * r, y + 16 + Math.sin(a) * r); }
    g.fill();
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The far off: the HAPPYWOOD hill, searchlights, a low skyline of soundstages

const back = (c: Ctx, t: number, sway: number) => {
  const tod = timeOfDay();
  const sx = Math.round(sway * 0.3);
  // (searchlights, sweeping up off the lot)
  if (tod.lamps > 0.2) for (const k of [-1, 1]) {
    const a = Math.sin(t * 0.01 + k) * 0.5 + k * 0.2;
    c.fillStyle = 'rgba(254,249,195,0.25)'; c.beginPath();
    c.moveTo(200 + sx + k * 60, HOR); c.lineTo(200 + sx + k * 60 + Math.sin(a) * 120 - 8, HOR - Math.cos(a) * 120); c.lineTo(200 + sx + k * 60 + Math.sin(a) * 120 + 8, HOR - Math.cos(a) * 120); c.fill();
  }
  // (the hill, its letters on the crest; the second O lying down the slope)
  const hx = 220 + Math.round(sway * 0.4);
  c.fillStyle = hourMix('#A16207', '#92400E', '#3F2A14'); c.beginPath(); c.moveTo(hx - 90, HOR); c.quadraticCurveTo(hx, HOR - 70, hx + 90, HOR); c.fill();
  const ink = tod.lamps > 0.5 ? '#D6D3D1' : '#FAFAFA';
  for (let i = 0; i < 9; i++) { if (i === 7) continue; const lx = hx - 40 + i * 9, tt = (lx - hx + 90) / 180, top = HOR - 140 * tt * (1 - tt) - 10; box(c, lx, top, 6, 8, ink); }
  box(c, hx + 28, HOR - 20, 8, 6, ink);
  // (soundstages: big pale boxes, numbered)
  const far = hourMix('#A8A29E', '#78716C', '#292524');
  for (let i = 0; i < 6; i++) { const x = sx + i * 70 - 20, h = 14 + Math.round(hash(i * 3.1) * 10); if (Math.abs(x + 30 - hx) < 70) continue; box(c, x, HOR - h, 60, h, far); box(c, x, HOR - h, 60, 2, hourMix('#D6D3D1', '#A8A29E', '#44403C')); }
};

// ---------------------------------------------------------------------------------------------------------------
// Along the way: palms, plywood facades, Steve's standees

const palm = (g: Ctx, w: number, h: number) => {
  box(g, w / 2 - 2, 14, 4, h - 14, '#78350F'); box(g, w / 2 - 2, 14, 1, h - 14, '#B45309');
  g.fillStyle = '#15803D';
  for (let k = 0; k < 6; k++) { const a = (k * Math.PI) / 3; g.beginPath(); g.ellipse(w / 2 + Math.cos(a) * 8, 14 + Math.sin(a) * 4, 9, 3, a, 0, Math.PI * 2); g.fill(); }
};
const facade = (seed: number) => (g: Ctx, w: number, h: number) => {
  const col = ['#B91C1C', '#1D4ED8', '#CA8A04'][seed % 3];
  box(g, 0, 0, w, h, col); box(g, 0, 0, w, 3, '#FAFAFA');
  box(g, 4, h - 18, 10, 18, '#18181B');
  box(g, w - 14, 8, 10, 8, '#FDE68A');
};
const standee = (g: Ctx, w: number, h: number) => {
  // (Stuntman Steve, cut out of card: the mullet, the thumb up)
  box(g, 2, h - 6, w - 4, 6, '#57534E');
  box(g, w / 2 - 4, 10, 8, h - 16, '#B91C1C');
  box(g, w / 2 - 4, 0, 8, 10, '#E7B48F'); box(g, w / 2 - 5, 0, 10, 3, '#92400E'); box(g, w / 2 + 3, 2, 3, 9, '#92400E');
  box(g, w / 2 - 9, 10, 4, 4, '#E7B48F');
};

const props = (): Prop[] => {
  const out: Prop[] = [];
  for (let i = 0; i < 10; i++) { const side = i % 2 ? 1 : -1; out.push({ id: 'pw-hw-palm', x: side * 3.4, z: 2 + i * 2.6, w: 1.6, h: 5, ppm: 16, paint: palm }); }
  for (let k = 0; k < 6; k++) out.push({ id: `pw-hw-facade${k % 3}`, x: (k % 2 ? 1 : -1) * 7.5, z: 3 + k * 4, w: 5, h: 4, ppm: 16, paint: facade(k) });
  for (let k = 0; k < 3; k++) out.push({ id: 'pw-hw-steve', x: (k % 2 ? -1 : 1) * 2.4, z: 5 + k * 7, w: 0.8, h: 1.9, ppm: 20, paint: standee });
  return out;
};

export const INTO_HOLLYWOOD: PortalDef = {
  land: 'HOLLYWOOD LAND',
  lines: ['THE MAGIC OF THE MOVIES. MOSTLY PLYWOOD.', 'SEE STUNTMAN STEVE! (HE WAS IN A MOVIE.)'],
  haze: '#FDE68A',
  ground, back, props,
  rim: () => hourMix('#FEF3C7', '#F59E0B', '#FDE68A'),
};
