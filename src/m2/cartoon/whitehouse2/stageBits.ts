// What part two's set pieces really were, on the real stage (the SNES pass; real materials in steps, no cartoon ink):
// the jelly mold a stunt trampoline (a steel frame, the springs round it, the black bed, a green gel cover half torn off
// it), the range's burners dead gas rings on a plywood box (a hose off to a tank, an empty one), the lasers the security
// rig's stands (tripods, a dead red emitter, the cable to a dimmer pack), the globe a fiberglass ball split in two (its
// painted continents, the raw glass-fiber inside, its armature, the castor it rolled on).

import { box, mix, checker, ramp6, type Ctx } from '../kit';
import { signText } from '../../signLetters';

const STL = ramp6('#7A8090'), BLK = ['#09080C', '#121116', '#1B1A1F', '#24222A', '#323038', '#46434E'];
const slab = (g: Ctx, x: number, y: number, w: number, h: number, R: string[]) => {
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  box(g, x, y, w, h, R[3]);
  if (w < 4 || h < 4) return;
  box(g, x, y, w, 2, R[4]); box(g, x, y, 2, h, R[4]); box(g, x + 1, y, Math.max(1, Math.round(w * 0.3)), 1, R[5]);
  box(g, x + w - 2, y + 1, 2, h - 1, R[1]); checker(g, x + w - 4, y + 1, 2, h - 1, R[2], 0, 1);
  box(g, x + 1, y + h - 2, w - 1, 2, R[1]);
};
const LIP = '#E7E2D6';

/** The jelly mold was a stunt trampoline (a, b its ends, top y; the floor fy): a steel frame on legs, springs, the bed,
 *  the green gel cover half off it, its lit top (standable reads standable). */
export const trampoline = (c: Ctx, a: number, b: number, top: number, fy: number) => {
  const w = b - a;
  for (const x of [a + 6, b - 12, a + w / 2 - 3]) { slab(c, x, top + 6, 6, fy - top - 6, STL); slab(c, x - 4, fy - 3, 14, 3, STL); }
  slab(c, a - 4, top + 2, w + 8, 6, STL);
  for (let x = a; x < b; x += 6) { box(c, x, top - 1, 2, 4, STL[4]); box(c, x + 1, top + 1, 1, 2, STL[1]); }
  box(c, a + 6, top - 2, w - 12, 3, '#0E0D12'); box(c, a + 8, top - 2, w - 16, 1, '#2A2830');
  // (the green gel cover, torn, hanging off the near side)
  c.fillStyle = '#2E8A3E'; c.beginPath(); c.moveTo(a + w * 0.55, top - 1); c.lineTo(b + 2, top); c.lineTo(b - 4, top + 22); c.lineTo(b - 14, top + 14); c.lineTo(b - 22, top + 26); c.lineTo(a + w * 0.6, top + 6); c.closePath(); c.fill();
  c.fillStyle = '#5ABA5A'; c.fillRect(a + w * 0.58, top - 1, w * 0.3, 1);
  box(c, a + 2, top, w - 4, 2, LIP); box(c, a + 6, top, w * 0.3, 1, '#FFFFFF');
  signText(c, 'STUNT 2', a + w / 2, fy - 8, { sx: 1, sy: 1, stencil: true, fill: ['#D1D5DB', '#9CA3AF'] });
};
/** A dead gas ring on the stove's box (its middle x, the box's top y), a hose off to the side. */
export const deadBurner = (c: Ctx, x: number, top: number, k: number) => {
  c.fillStyle = '#0A090C'; c.beginPath(); c.ellipse(x, top - 1, 18, 4, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#3A3844'; c.beginPath(); c.ellipse(x, top - 2, 15, 3, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#121116'; c.beginPath(); c.ellipse(x, top - 2, 9, 2, 0, 0, Math.PI * 2); c.fill();
  for (let j = 0; j < 8; j++) { const a = (j / 8) * Math.PI * 2; box(c, x + Math.cos(a) * 12 - 1, top - 2 + Math.sin(a) * 2.5, 2, 1, '#5A5866'); }
  // (scorch on the plywood round it)
  c.fillStyle = 'rgba(10,8,12,0.5)'; c.beginPath(); c.ellipse(x, top + 6, 20, 5, 0, 0, Math.PI * 2); c.fill();
  if (k === 0) { c.strokeStyle = '#141318'; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 20, top + 4); c.quadraticCurveTo(x - 40, top + 50, x - 82, top + 60); c.stroke(); c.strokeStyle = '#3A3844'; c.lineWidth = 1; c.stroke(); }
};
/** A propane tank by the stove (x, the floor fy): steel, stepped, a valve, a hazard tag. */
export const tank = (c: Ctx, x: number, fy: number) => {
  const T = ramp6('#C8CCD4');
  c.fillStyle = T[1]; c.beginPath(); c.roundRect(x - 13, fy - 48, 26, 48, 9); c.fill();
  c.fillStyle = T[3]; c.beginPath(); c.roundRect(x - 11, fy - 46, 18, 44, 8); c.fill();
  box(c, x - 9, fy - 44, 4, 40, T[5]); box(c, x - 13, fy - 30, 26, 2, T[1]);
  box(c, x - 4, fy - 56, 8, 8, '#3A3844'); box(c, x - 6, fy - 58, 12, 3, '#9A2A2A');
  box(c, x - 8, fy - 24, 16, 10, '#E8B820'); box(c, x - 6, fy - 22, 12, 2, '#1A1A1A'); box(c, x - 6, fy - 18, 8, 1, '#1A1A1A');
};
/** A laser rig's stand (its x, the floor fy): a black tripod, the dead emitter, its cable. */
export const laserStand = (c: Ctx, x: number, fy: number) => {
  for (const s of [-12, 0, 12]) { c.strokeStyle = '#08070A'; c.lineWidth = 4; c.beginPath(); c.moveTo(x, fy - 28); c.lineTo(x + s, fy); c.stroke(); c.strokeStyle = '#3A3844'; c.lineWidth = 2; c.stroke(); }
  slab(c, x - 10, fy - 40, 20, 14, BLK);
  box(c, x - 3, fy - 44, 6, 4, '#08070A'); box(c, x - 2, fy - 43, 4, 2, '#5A1414');
  box(c, x + 6, fy - 34, 2, 2, '#14532D');
  c.strokeStyle = '#141318'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 10, fy - 30); c.quadraticCurveTo(x + 30, fy - 4, x + 60, fy - 1); c.stroke();
};
/** A half of the fiberglass globe (its middle x on the floor fy, rocked by rock; i which half): the painted ocean and a
 *  continent outside, the raw glass fiber and resin inside, the steel armature's stub. */
export const globeHalf = (c: Ctx, x: number, fy: number, rock: number, i: number) => {
  const r = 56, O = ['#1E3A5A', '#2A5A86', '#3A74A8', '#5A94C4'];
  c.save(); c.translate(x, fy); c.rotate(rock);
  for (let k = 0; k < 4; k++) { c.fillStyle = O[k]; c.beginPath(); c.arc(-k * 4, -k * 3, r - k * 6, Math.PI, 0); c.closePath(); c.fill(); }
  c.fillStyle = '#4A7A3A'; c.beginPath(); c.ellipse(i ? -16 : 14, -30, 18, 11, 0.3, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#6A9A4A'; c.fillRect(i ? -24 : 6, -36, 8, 2);
  c.fillStyle = '#C8C0A8'; c.beginPath(); c.ellipse(0, -2, r, 8, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#A89C7A'; c.beginPath(); c.ellipse(0, -2, r - 5, 5, 0, 0, Math.PI * 2); c.fill();
  for (let k = -4; k <= 4; k++) box(c, k * 11, -4 + (k % 2), 6, 1, '#E2DCC8');
  box(c, -3, -10, 6, 8, '#5A5866'); box(c, -2, -10, 2, 8, '#8A8896');
  c.restore();
  c.fillStyle = mix('#0A090C', '#1B1A1F', 0.5); c.beginPath(); c.ellipse(x, fy + 1, r * 0.9, 3, 0, 0, Math.PI * 2); c.fill();
};
