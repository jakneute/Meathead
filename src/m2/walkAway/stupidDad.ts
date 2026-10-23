// The walk-away from DAD MAN (Cartoon Land's boss), SNES'd with the amphitheater's look: down the concrete walk out
// of THE UBX AMPHITHEATER toward the camera at whatever hour it is now (timeOfDay.ts): the lawn either side in stepped
// tufts and clover, the walk's slabs with their joints, gum and cracks, a curb along it; oaks, steel light posts with
// their globes (lit after dark), green trash cans with UBX stenciled on them overflowing, park benches. Far behind him:
// the hills, THE CARTOON LAND WATER TOWER (cartoon/monument.ts), the bowl's rim and its hedge, the light masts, and
// THE BAND SHELL (sun-faded cream and blue rings, its ribs, the red DAD MAN LIVE! banner hung in it, the bulbs round
// its lip, some dead). Down the walk: his crushed cans of SWILL LITE (the show's real beer), plastic beer cups, a
// popcorn box, a show program, the foam finger somebody dropped (#1). His new toy: the MALLET (walkAway/acts.ts).
//
// How he went shows down the path: the weakness (the last stunt car came down on him) leaves that car dumped on its roof
// by the walk and half his couch; any other way (buried in SWILL LITE), more of the cans.

import { type Ctx, type Prop, type SceneDef, HOR, box, hash, mix } from './kit';
import { timeOfDay, hourMix } from '../timeOfDay';
import { drawTeaseStrip } from './teases';
import { mallet } from './toys';
import { drawTowerAt } from '../cartoon/monument';

const INK = '#1A1028';
const lit = () => timeOfDay().lamps > 0.3;
const GRASS = ['#16582A', '#22803A', '#348E42', '#5AAE5A', '#9CD48C'];
const CONC = ['#57524F', '#7A7369', '#9E968A', '#C0B8AA', '#E0D9CA'];

const ground = (g: Ctx, w: number, h: number) => {
  // (the lawn: banded in tufts, clover, a dandelion here and there)
  box(g, 0, 0, w, h, GRASS[2]);
  // (mowing stripes: bands a step apart, dithered at their edges)
  for (let x = 0; x < w; x += 32) { box(g, x, 0, 16, h, GRASS[1]); for (let y = 0; y < h; y += 2) { box(g, x + 16 + ((y >> 1) & 1), y, 1, 1, GRASS[1]); box(g, x - 1 + ((y >> 1) & 1), y, 1, 1, GRASS[2]); } }
  // (tufts: blades in steps, dark at the root, lit at the tip, a shadow under)
  for (let i = 0; i < 160; i++) {
    const x = Math.round(hash(i * 3.3) * w), y = Math.round(hash(i * 5.9) * h), k = i % 3;
    box(g, x - 1, y + 2, 5, 1, GRASS[0]);
    box(g, x, y, 1, 2, GRASS[1]); box(g, x + 1, y - 1, 1, 3, GRASS[k === 0 ? 2 : 3]); box(g, x + 2, y, 1, 2, GRASS[1]); box(g, x + 1, y - 2, 1, 1, GRASS[4]);
  }
  // (clover patches: trefoils, lit; a white flower in some; dandelions)
  for (let i = 0; i < 18; i++) {
    const x = Math.round(hash(i * 7.1) * w), y = Math.round(hash(i * 2.3) * h);
    for (const [dx, dy] of [[0, 0], [3, 1], [1, 3]] as const) { box(g, x + dx, y + dy, 3, 2, GRASS[1]); box(g, x + dx, y + dy, 2, 1, GRASS[3]); }
    box(g, x + 2, y + 1, 1, 1, '#FFFFFF');
  }
  for (let i = 0; i < 6; i++) { const x = hash(i * 9.7) * w, y = hash(i * 4.4) * h; box(g, x, y, 2, 2, '#FDE047'); box(g, x, y, 1, 1, '#FFF8C0'); box(g, x + 1, y + 2, 1, 2, GRASS[0]); }
  // (the walk: concrete slabs, each its own tone, lit along the joint over it, shaded under; worn in the middle where
  //  feet go, dithered; gum, cracks, a beer stain; the grass creeping in at the joints; a curb along each side)
  const a = w / 2 - 46, b = w / 2 + 46;
  box(g, a, 0, b - a, h, CONC[2]);
  for (let y = 0, r = 0; y < h; y += 32, r++) for (const [x0, x1] of [[a, w / 2], [w / 2 + 1, b]] as const) {
    const t = hash(r * 3.1 + x0 * 0.01);
    box(g, x0, y, x1 - x0, 32, t > 0.66 ? mix(CONC[2], CONC[3], 0.4) : t < 0.3 ? mix(CONC[2], CONC[1], 0.35) : CONC[2]);
    for (let yy = y + 8; yy < y + 26; yy += 2) for (let xx = x0 + 8 + ((yy >> 1) & 1) * 2; xx < x1 - 8; xx += 4) box(g, xx, yy, 1, 1, CONC[3]);
    box(g, x0, y + 2, x1 - x0, 1, CONC[3]); box(g, x0, y + 30, x1 - x0, 1, CONC[1]);
    for (let xx = x0; xx < x1; xx += 3) if (hash(xx * 0.7 + r) > 0.7) box(g, xx, y, 2, 1, GRASS[1]);
  }
  for (let y = 0; y < h; y += 32) { box(g, a, y, b - a, 1, CONC[0]); box(g, a, y + 1, b - a, 1, CONC[4]); box(g, w / 2, y, 1, 32, CONC[1]); box(g, w / 2 + 1, y, 1, 32, CONC[3]); }
  for (let i = 0; i < 14; i++) { const x = a + 4 + hash(i * 1.7) * (b - a - 8), y = hash(i * 8.3) * h; box(g, x, y, 3, 2, i % 2 ? '#3A3640' : '#5A4A5A'); box(g, x, y, 1, 1, '#7A6A7A'); }
  for (const [cx0, cy0, cy1] of [[a + 30, 40, 74], [b - 22, 140, 170]] as const) for (let y = cy0, x = cx0; y < cy1; y += 2) { box(g, x, y, 1, 2, CONC[0]); box(g, x + 1, y, 1, 2, CONC[4]); x += hash(y) > 0.5 ? 1 : -1; }
  for (let i = 0; i < 4; i++) { const y = hash(i * 3.9) * h, sx = a + 10 + hash(i) * 50; box(g, sx, y, 14, 3, 'rgba(150,100,30,0.3)'); box(g, sx + 2, y + 3, 9, 1, 'rgba(150,100,30,0.2)'); }
  for (const x of [a - 4, b]) { box(g, x, 0, 4, h, CONC[3]); box(g, x + (x < w / 2 ? 0 : 3), 0, 1, h, CONC[4]); box(g, x + (x < w / 2 ? 3 : 0), 0, 1, h, CONC[0]); for (let y = 0; y < h; y += 48) box(g, x, y, 4, 1, CONC[1]); }
};

const back = (c: Ctx, t: number, sway: number) => {
  const tod = timeOfDay(), H = (day: string, dusk: string, night: string) => hourMix(day, dusk, night, tod);
  // (the hills, two bands, a lit ridge)
  const h1 = H('#86A890', '#8A8A9A', '#1E2E34'), h2 = H('#6A9A6A', '#7A7A6A', '#16261E');
  // (out past the hills, the neighbors: the ELEVATOR TO HELL's clock tower, THRONES OF THE STARS)
  drawTeaseStrip(c, 'cartoon', 'far', sway);
  for (let x = 0; x < 400; x += 2) { const xx = x - sway * 0.1, y = Math.round(HOR - 14 - Math.sin(xx * 0.02 + 1) * 6 - Math.sin(xx * 0.07) * 2); box(c, x, y, 2, HOR - y, h1); box(c, x, y, 2, 1, mix(h1, '#FFFFFF', 0.2)); }
  drawTowerAt(c, Math.round(296 + sway * 0.45), HOR - 2, 0.17, t);
  for (let x = 0; x < 400; x += 2) { const xx = x - sway * 0.2, y = Math.round(HOR - 6 - Math.sin(xx * 0.035 + 2) * 3); box(c, x, y, 2, HOR - y + 2, h2); }
  // (the light masts over the bowl: lattice, the floods)
  const mast = H('#4A4A5A', '#4A3E52', '#1A1A28'), flood = lit() ? '#FFF6D0' : H('#D8DCE4', '#E8D0C0', '#4A4A5A');
  for (const mx of [86, 214]) { const x = Math.round(mx + sway * 0.35); for (let y = HOR - 44; y < HOR - 4; y += 2) { box(c, x - 1, y, 1, 2, mast); box(c, x + 1, y, 1, 2, mast); if (y % 6 === 0) box(c, x - 1, y, 3, 1, mast); } box(c, x - 4, HOR - 48, 9, 5, mast); box(c, x - 3, HOR - 47, 3, 2, flood); box(c, x + 1, HOR - 47, 3, 2, (x % 3) ? flood : mast); }
  // (the band shell: the rings stepping back, the ribs, the banner in it, the bulbs round its lip)
  const x = Math.round(150 + sway * 0.4), r = 30;
  const cream = [H('#ECE2C6', '#E8C8B0', '#3A3A48'), H('#D6C9A8', '#C8A898', '#2E2E3C')], blue = [H('#8EAEC8', '#8A90C8', '#22304A'), H('#6488AA', '#6A6AA0', '#1A2438')];
  box(c, x - r - 3, HOR - 2, r * 2 + 6, 3, H('#9E968A', '#8A7A7A', '#2A2A34'));
  c.fillStyle = INK; c.beginPath(); c.arc(x, HOR - 1, r + 2, Math.PI, 0); c.fill();
  c.fillStyle = H('#C0B8AA', '#B0A0A0', '#3A3A44'); c.beginPath(); c.arc(x, HOR - 1, r + 1, Math.PI, 0); c.fill();
  for (let k = 0; k < 6; k++) { const R = k % 2 ? blue : cream, rr = r * (1 - k * 0.15); c.fillStyle = R[0]; c.beginPath(); c.arc(x, HOR - 1, rr, Math.PI, 0); c.fill(); c.fillStyle = R[1]; c.beginPath(); c.arc(x, HOR - 1, rr - 2, Math.PI, 0); c.fill(); }
  c.fillStyle = H('#1E2A5E', '#2A2050', '#0A0E24'); c.beginPath(); c.arc(x, HOR - 1, r * 0.12, Math.PI, 0); c.fill();
  for (let k = 1; k < 6; k++) { const a = Math.PI + (k / 6) * Math.PI; box(c, x + Math.cos(a) * r * 0.5, HOR - 1 + Math.sin(a) * r * 0.5, 1, 1, INK); box(c, x + Math.cos(a) * r * 0.8, HOR - 1 + Math.sin(a) * r * 0.8, 1, 1, INK); }
  for (let k = 0; k <= 14; k++) { const a = Math.PI + (k / 14) * Math.PI, on = (k + Math.floor(t / 8)) % 3 === 0, dead = hash(k * 1.37 + 3) < 0.2; box(c, x + Math.cos(a) * (r + 2), HOR - 1 + Math.sin(a) * (r + 2), 1, 1, dead ? '#3A3430' : on || lit() ? '#FEF3C7' : '#B45309'); }
  box(c, x - 12, HOR - 22, 24, 7, INK); box(c, x - 11, HOR - 21, 22, 5, '#B91C1C'); box(c, x - 11, HOR - 21, 22, 1, '#DC4A40'); box(c, x - 9, HOR - 19, 18, 1, '#FDE047');
  box(c, x - 13, HOR - 26, 1, 5, INK); box(c, x + 12, HOR - 26, 1, 5, INK);
  // (the bowl's rim: a hedge in humps, oaks behind it)
  const hd = H('#286A34', '#3A5A3A', '#0E2014'), hl = H('#3E8846', '#4A6A44', '#16301E');
  for (let k = 0; k < 40; k++) { const hx = Math.round(k * 11 - 6 + sway * 0.3); if (Math.abs(hx - x) < r + 4) continue; c.fillStyle = hd; c.beginPath(); c.arc(hx, HOR, 6, Math.PI, 0); c.fill(); box(c, hx - 3, HOR - 5, 3, 2, hl); }
  for (let k = 0; k < 9; k++) { const ox = Math.round(10 + k * 46 + sway * 0.3 + (hash(k) - 0.5) * 10); if (Math.abs(ox - x) < r + 10) continue; const oy = HOR - 10 - Math.round(hash(k * 3) * 6); box(c, ox, oy, 2, 8, H('#4E321E', '#4A3A3A', '#141010')); c.fillStyle = hd; c.beginPath(); c.arc(ox + 1, oy - 4, 8, 0, Math.PI * 2); c.fill(); c.fillStyle = hl; c.beginPath(); c.arc(ox - 1, oy - 6, 5, 0, Math.PI * 2); c.fill(); }
};

// ---------------------------------------------------------------------------------------------------------------
// What's along the walk

/** An oak: a stout trunk, the crown in stepped lumps, lit up and left. */
const oak = (g: Ctx, w: number, h: number) => {
  const B = ['#2A1A0E', '#4E321E', '#6A462C', '#8A6040'], L = ['#123A1C', '#1C5228', '#2A7036', '#44904A', '#6EB466'];
  box(g, w / 2 - 4, h * 0.45, 8, h * 0.55, B[0]); box(g, w / 2 - 3, h * 0.45, 6, h * 0.55, B[2]); box(g, w / 2 - 3, h * 0.45, 2, h * 0.55, B[3]); box(g, w / 2 + 1, h * 0.45, 2, h * 0.55, B[1]);
  const lump = (x: number, y: number, r: number, col: string) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
  const lumps: [number, number, number][] = [[w * 0.5, h * 0.3, w * 0.3], [w * 0.28, h * 0.38, w * 0.22], [w * 0.72, h * 0.38, w * 0.22], [w * 0.4, h * 0.18, w * 0.2], [w * 0.62, h * 0.2, w * 0.2]];
  for (const [x, y, r] of lumps) lump(x, y, r + 1.5, INK);
  for (const [x, y, r] of lumps) lump(x + 1, y + 1, r, L[1]);
  for (const [x, y, r] of lumps) lump(x - r * 0.12, y - r * 0.15, r * 0.8, L[2]);
  for (const [x, y, r] of lumps) lump(x - r * 0.3, y - r * 0.35, r * 0.4, L[3]);
  for (const [x, y, r] of lumps.slice(0, 3)) box(g, x - r * 0.5, y - r * 0.6, 2, 2, L[4]);
};
/** A steel light post: the pole, its globe (lit after dark), a banner arm with UBX on it. */
const post = (g: Ctx, w: number, h: number) => {
  const S = ['#1A1E26', '#444C58', '#8A94A0', '#BCC4CC'];
  box(g, w / 2 - 2, 8, 4, h - 8, INK); box(g, w / 2 - 1, 8, 2, h - 8, S[1]); box(g, w / 2 - 1, 8, 1, h - 8, S[2]);
  box(g, w / 2 - 4, h - 4, 8, 4, INK); box(g, w / 2 - 3, h - 4, 6, 3, S[1]);
  box(g, w / 2 - 5, 0, 10, 10, INK); box(g, w / 2 - 4, 1, 8, 8, lit() ? '#FFF6D0' : '#E8ECF2'); box(g, w / 2 - 3, 2, 3, 3, '#FFFFFF');
  box(g, w / 2 + 1, 14, 8, 12, INK); box(g, w / 2 + 2, 15, 6, 10, '#1E3A8A'); box(g, w / 2 + 2, 15, 6, 2, '#3B5BB8'); box(g, w / 2 + 3, 19, 4, 1, '#FDE047');
};
/** A green trash can, UBX stenciled, cans and cups heaped over its lip. */
const can = (g: Ctx, w: number, h: number) => {
  const G = ['#0A3A1E', '#14582E', '#1E7A44', '#46A86E'];
  box(g, 0, 4, w, h - 4, INK); box(g, 1, 5, w - 2, h - 5, G[2]); box(g, 1, 5, 2, h - 5, G[3]); box(g, w - 3, 5, 2, h - 5, G[1]); box(g, 1, h * 0.45, w - 2, 1, G[0]);
  box(g, 0, 3, w, 2, '#2A2A30');
  for (let k = 0; k < 4; k++) { const x = 1 + k * (w / 4); box(g, x, 0, w / 5, 4, k % 2 ? '#C8102E' : '#F4F4F5'); }
  box(g, w / 2 - 2, h * 0.6, 4, 2, G[3]);
};
/** A park bench: slatted, steel ends. */
const bench = (g: Ctx, w: number, h: number) => {
  const P = ['#4A2A12', '#6E421E', '#8E5A2C', '#AE7840'];
  for (let k = 0; k < 2; k++) { box(g, 0, k * 4, w, 3, INK); box(g, 1, k * 4, w - 2, 2, P[2]); box(g, 1, k * 4, w - 2, 1, P[3]); }
  box(g, 0, h * 0.5, w, 3, INK); box(g, 1, h * 0.5, w - 2, 2, P[3]);
  for (const x of [2, w - 4]) { box(g, x, h * 0.5, 2, h * 0.5, '#2A2E38'); }
};
/** A crushed can of SWILL LITE, lying on its side. */
const crushed = (g: Ctx, w: number, h: number) => { box(g, 0, h - 3, w, 3, '#5A0612'); box(g, 1, h - 3, w - 2, 2, '#C8102E'); box(g, 1, h - 3, w - 2, 1, '#F25A6E'); box(g, Math.floor(w / 2) - 1, h - 3, 2, 2, '#F4F1E8'); box(g, w - 1, h - 3, 1, 2, '#C9CDD4'); };
/** A plastic beer cup, tipped over, the last of it spilled. */
const cup = (g: Ctx, w: number, h: number) => { box(g, 0, h - 3, w, 3, '#C8CCD0'); box(g, 0, h - 3, w, 1, '#FFFFFF'); box(g, 0, h - 2, 2, 1, '#F2B33D'); box(g, w - 1, h - 3, 1, 3, '#FFFFFF'); box(g, -3, h - 1, 4, 1, 'rgba(230,166,50,0.6)'); };
/** A dropped foam finger (#1). */
const finger = (g: Ctx, w: number, h: number) => { box(g, 0, h - 4, w, 4, INK); box(g, 1, h - 3, w - 2, 2, '#FDE047'); box(g, 1, h - 3, w - 2, 1, '#FEF08A'); box(g, w - 3, h - 6, 2, 3, '#FDE047'); box(g, 2, h - 3, 2, 1, '#1E3A8A'); box(g, 5, h - 3, 1, 1, '#1E3A8A'); };
/** A popcorn box, tipped, popcorn spilled out of it. */
const popcorn = (g: Ctx, w: number, h: number) => { box(g, 0, h - 4, w * 0.6, 4, INK); for (let k = 0; k < 3; k++) box(g, 1 + k * 2, h - 3, 1, 2, k % 2 ? '#FFFFFF' : '#DC2626'); for (let k = 0; k < 5; k++) box(g, w * 0.6 + k * 1.4, h - 1 - (k % 2), 1, 1, '#FEF3C7'); };
/** The show's program, dropped: DAD MAN's face on the cover (HONK AZORIA, the cartoon's original voice, live). */
const program = (g: Ctx, w: number, h: number) => { box(g, 0, h - 3, w, 3, INK); box(g, 1, h - 3, w - 2, 2, '#7C3AED'); box(g, 2, h - 3, 3, 2, '#F4B8A0'); box(g, w - 4, h - 3, 2, 1, '#FDE047'); };

/** A stunt car on its roof (the weakness: the last one, towed out and dumped by the walk), scorched, a wheel off. */
const wreck = (g: Ctx, w: number, h: number) => {
  const y = h - 4;
  box(g, 6, y - 2, w - 12, 3, 'rgba(0,0,0,0.3)');
  box(g, 4, y - 12, w - 8, 9, INK); box(g, 5, y - 11, w - 10, 7, '#B91C1C'); box(g, 5, y - 11, w - 10, 2, '#7F1D1D'); box(g, 5, y - 6, w - 10, 1, '#F8FAFC');
  box(g, w * 0.3, y - 3, w * 0.4, 4, INK); box(g, w * 0.31, y - 2, w * 0.38, 2, '#7DD3FC');
  for (const x of [w * 0.22, w * 0.78]) { box(g, x - 4, y - 18, 8, 7, INK); box(g, x - 3, y - 17, 6, 5, '#27272A'); box(g, x - 1, y - 15, 2, 2, '#A1A1AA'); }
  for (let k = 0; k < 4; k++) box(g, w * 0.4 + k * 4, y - 13 - (k % 2) * 2, 3, 2, k % 2 ? '#3A3430' : '#57534E');
  box(g, w - 10, y - 1, 6, 6, INK); box(g, w - 9, y, 4, 4, '#27272A');
};
/** Half the show's couch (the weakness: the car came down on it), stuffing out. */
const halfCouch = (g: Ctx, w: number, h: number) => {
  box(g, 0, h - 10, w, 10, INK); box(g, 1, h - 9, w - 2, 8, '#B9561A'); box(g, 1, h - 9, w - 2, 2, '#E0752E');
  for (let k = 0; k < 4; k++) box(g, 2 + k * (w / 4), h - 8, 2, 6, '#8E3F12');
  box(g, w - 4, h - 12, 4, 4, '#F4EFE2'); box(g, w - 2, h - 14, 2, 2, '#FFFFFF');
};

const props = (weakness = false): Prop[] => {
  const out: Prop[] = [];
  // (how he went, down the path: the last stunt car dumped on its roof, half his couch; any other way, the beer he went
  // under (more of the cans))
  if (weakness) { out.push({ id: 'wa-sd-wreck', x: 2.4, z: 11, w: 2.6, h: 1.1, ppm: 24, paint: wreck }); out.push({ id: 'wa-sd-couch', x: -2.6, z: 17, w: 1.6, h: 0.5, ppm: 24, paint: halfCouch }); }
  else for (let k = 0; k < 10; k++) out.push({ id: 'wa-sd-can', x: (hash(k * 5.3 + 1) - 0.5) * 3.2, z: 3.4 + k * 3.1, w: 0.22, h: 0.1, ppm: 40, paint: crushed, wrap: true });
  for (let k = 0; k < 12; k++) out.push({ id: `wa-sd-oak${k % 3}`, x: (k % 2 ? 1 : -1) * (5.6 + (k % 3) * 0.9), z: 3 + k * 3.4, w: 3.4 + (k % 3) * 0.3, h: 4.4, ppm: 16, paint: oak });
  for (let k = 0; k < 10; k++) out.push({ id: 'wa-sd-post', x: (k % 2 ? -1 : 1) * 2.6, z: 3 + k * 4, w: 0.7, h: 3, ppm: 24, paint: post });
  for (let k = 0; k < 5; k++) out.push({ id: 'wa-sd-bin', x: (k % 2 ? 1 : -1) * 3.1, z: 5 + k * 7.6, w: 0.6, h: 0.9, ppm: 28, paint: can });
  for (let k = 0; k < 4; k++) out.push({ id: 'wa-sd-bench', x: (k % 2 ? -1 : 1) * 3.6, z: 8 + k * 8.8, w: 1.6, h: 0.8, ppm: 24, paint: bench });
  for (let k = 0; k < 14; k++) out.push({ id: 'wa-sd-can', x: (hash(k * 2.7) - 0.5) * 3, z: 2 + k * 2.8, w: 0.22, h: 0.1, ppm: 40, paint: crushed, wrap: true });
  for (let k = 0; k < 6; k++) out.push({ id: 'wa-sd-cup', x: (hash(k * 4.1) - 0.5) * 3.4, z: 5 + k * 6.3, w: 0.18, h: 0.08, ppm: 40, paint: cup, wrap: true });
  for (let k = 0; k < 2; k++) out.push({ id: 'wa-sd-pop', x: (hash(k * 6.1) - 0.5) * 2.6, z: 7 + k * 15, w: 0.3, h: 0.1, ppm: 40, paint: popcorn, wrap: true });
  out.push({ id: 'wa-sd-prog', x: 1.2, z: 13, w: 0.24, h: 0.08, ppm: 40, paint: program });
  out.push({ id: 'wa-sd-finger', x: -1.7, z: 9, w: 0.34, h: 0.14, ppm: 40, paint: finger });
  return out;
};

export const STUPID_DAD: SceneDef = {
  land: 'CARTOON LAND',
  weapon: 'MALLET',
  sky: ['#2C5C9E', '#3E74B4', '#6A90C4', '#A0A8CC', '#DCB0A8', '#F8C49A', '#FFE0C0'],
  haze: '#F4D8C8',
  ground, back, props,
  drawWeapon: (c: Ctx) => { c.scale(0.7, 0.7); mallet(c); },
  grip: [[0, 0], [24, 0]],
  rim: '#F9C88A',
};
