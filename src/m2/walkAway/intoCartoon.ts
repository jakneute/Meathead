// The walk into Cartoon Land (portalWalk.ts), SNES'd with the kiddie square's look: out of the portal and up a candy
// cobbled path into SILLYVILLE SQUARE. Either side, Seuss Landing houses with no straight lines (bulging, leaning
// plaster in pastel ramps, candy spirals and polka dots, round windows glowing warm after dark, scalloped awnings,
// drooping onion domes, floppy cones with their pom-poms, stacked balls, curly chimneys), Truffula trees (shaggy stepped
// tufts on barber-pole trunks), curly lamp posts (lit after dark), toadstools, the balloon man's post with its bunch.
// Underfoot: the lawn in stepped grass with its flowers, the path's candy cobbles each lit along its top, candy-striped
// curbs. Far off at the end of it: the patchwork hills with their striped fields, the rest of Cartoon Land's tops (the
// studios' arched stages, the band shell, the neon bolt), and THE CARTOON LAND WATER TOWER (cartoon/monument.ts: the
// smallest it ever is), its propeller turning. The sky by the hour. Timing, lines and skip unchanged.

import { type Ctx, type Prop, type PortalDef, HOR, box, hash, rampOf, lump } from './kit';
import { timeOfDay, hourMix } from '../timeOfDay';
import { drawTowerAt } from '../cartoon/monument';

const INK = '#1A1028';
const lit = () => timeOfDay().lamps > 0.3;
const GRASS = ['#16582A', '#22803A', '#3CAA4C', '#6CCC6A', '#AEEA9C'];
const PATH = [['#C83A84', '#EE62A8', '#FA9ACA', '#FFD2E8'], ['#6C4CBC', '#9476DE', '#BAA4F0', '#E0D6FC'], ['#26A07E', '#4CC89C', '#8AE4BE', '#C8F6DE'], ['#D8A818', '#F6D23A', '#FCE880', '#FFF8C8']];

export const ground = (g: Ctx, w: number, h: number) => {
  // (the lawn: grass in steps, tufts, flowers in pinks and yellows)
  box(g, 0, 0, w, h, GRASS[2]);
  for (let y = 0; y < h; y += 4) for (let x = (y / 4) % 2 ? 2 : 0; x < w; x += 4) { const t = hash(x * 0.71 + y * 1.37); if (t < 0.2) box(g, x, y, 3, 2, GRASS[1]); else if (t < 0.32) box(g, x, y, 2, 1, GRASS[3]); else if (t > 0.97) box(g, x, y, 1, 1, GRASS[4]); }
  for (let i = 0; i < 70; i++) { const x = hash(i * 3.7) * w, y = hash(i * 9.1) * h, col = ['#F472B6', '#FDE047', '#FFFFFF', '#C084FC'][i % 4]; box(g, x - 1, y, 3, 1, col); box(g, x, y - 1, 1, 3, col); box(g, x, y + 2, 1, 2, GRASS[0]); }
  // (the path: candy cobbles in rows, each its own color, lit along its top and left, shaded under; striped curbs)
  const cx = w / 2, half = 46;
  box(g, cx - half, 0, half * 2, h, '#7A4A8A');
  for (let y = 0, r = 0; y < h; y += 7, r++) for (let x = cx - half + (r % 2) * 5; x < cx + half - 2; x += 10) {
    const P = PATH[Math.floor(hash(x * 0.37 + r * 3.1) * 4)];
    box(g, x, y, 9, 6, P[1]); box(g, x, y, 9, 1, P[2]); box(g, x, y, 1, 5, P[2]); box(g, x + 1, y + 1, 2, 1, P[3]); box(g, x, y + 5, 9, 1, P[0]);
  }
  for (let y = 0; y < h; y += 6) { const red = (y / 6) % 2 === 1; for (const sx of [cx - half - 4, cx + half]) { box(g, sx, y, 4, 6, red ? '#E2465E' : '#F8F0F4'); box(g, sx, y, 1, 6, red ? '#F06A80' : '#FFFFFF'); box(g, sx + 3, y, 1, 6, red ? '#A82A44' : '#C8B8D0'); } }
};

const back = (c: Ctx, t: number, sway: number) => {
  const tod = timeOfDay();
  // (the patchwork hills: striped fields in curving bands, hedgerows, a knoll with its spiral path)
  const fields = [hourMix('#7CC864', '#8AA060', '#1E3A2A', tod), hourMix('#B4DC6E', '#A8A060', '#26402A', tod), hourMix('#E8E07A', '#C8A868', '#2E4030', tod), hourMix('#D8C0E8', '#B898B0', '#2A2A44', tod)];
  const hedge = hourMix('#3E7A48', '#4A5A3A', '#0E1E16', tod);
  const ridge = (x: number) => HOR - 9 - Math.sin(x * 0.03 + 1) * 5 - Math.sin(x * 0.011) * 4;
  for (let x = 0; x < 400; x += 2) {
    const xx = x - sway * 0.12, y0 = Math.round(ridge(xx));
    for (let y = y0; y < HOR + 2; y += 2) { const band = Math.floor((xx * 0.5 + (y - y0) * 3 + 400) / 10); box(c, x, y, 2, 2, fields[Math.floor(band / 3) % 4]); if (band % 3 === 0 && y > y0) box(c, x, y, 2, 1, hedge); }
    box(c, x, y0, 2, 1, hourMix('#D4F0A8', '#E8C8A0', '#3A5A4A', tod));
  }
  // (the rest of Cartoon Land's tops: the studios' arched stages, the band shell, the neon bolt)
  const far = hourMix('#A89EC2', '#9A7E9E', '#2A2A48', tod), far2 = hourMix('#C8C0DC', '#B49AB0', '#36365A', tod), bx = Math.round(sway * 0.3);
  for (let k = 0; k < 3; k++) { const sx = 40 + k * 22 + bx; c.fillStyle = far; c.beginPath(); c.moveTo(sx, HOR - 6); c.lineTo(sx, HOR - 18); c.quadraticCurveTo(sx + 9, HOR - 26, sx + 18, HOR - 18); c.lineTo(sx + 18, HOR - 6); c.closePath(); c.fill(); box(c, sx + 1, HOR - 18, 2, 12, far2); }
  c.fillStyle = far2; c.beginPath(); c.ellipse(320 + bx, HOR - 6, 18, 16, 0, Math.PI, 0); c.fill();
  c.fillStyle = far; c.beginPath(); c.ellipse(320 + bx, HOR - 6, 12, 10, 0, Math.PI, 0); c.fill();
  c.fillStyle = lit() ? '#C8FF7A' : hourMix('#B6F23A', '#A8B060', '#3A4A2A', tod); c.beginPath(); c.moveTo(360 + bx, HOR - 30); c.lineTo(372 + bx, HOR - 30); c.lineTo(366 + bx, HOR - 22); c.lineTo(372 + bx, HOR - 22); c.lineTo(360 + bx, HOR - 10); c.lineTo(364 + bx, HOR - 19); c.lineTo(358 + bx, HOR - 19); c.closePath(); c.fill();
  box(c, 365 + bx, HOR - 10, 1, 6, far);
  drawTowerAt(c, Math.round(200 + sway * 0.45), HOR - 2, 0.16, t);
  // (the near hedge line along the horizon, clipped lumps, a lollipop tree here and there)
  const near = hourMix('#4C9A52', '#5A7448', '#12241A', tod), nearL = hourMix('#7CC864', '#8A9A60', '#1E3A2A', tod);
  for (let x = 0; x < 400; x += 6) { const xx = x - sway * 0.25, y = HOR - 2 - Math.round(Math.abs(Math.sin(xx * 0.09)) * 3); box(c, x, y, 6, HOR - y + 3, near); box(c, x, y, 3, 1, nearL); }
  for (let k = 0; k < 7; k++) { const x = Math.round(((k * 61 - sway * 0.25) % 420 + 420) % 420 - 10), col = hourMix(['#F472B6', '#FDE047', '#C084FC', '#FB923C'][k % 4], '#C08A80', '#2A2A44', tod); box(c, x, HOR - 10, 1, 8, near); c.fillStyle = col; c.beginPath(); c.arc(x, HOR - 12, 3, 0, Math.PI * 2); c.fill(); }
};

// ---------------------------------------------------------------------------------------------------------------
// What's along the way

/** A Truffula tree: a barber-pole trunk, bent, a shaggy tuft in steps, its fringe hanging. */
export const truffula = (col: string, seed: number) => (g: Ctx, w: number, h: number) => {
  const R = rampOf(col), bend = (hash(seed) - 0.5) * w * 0.5, th = h * 0.68;
  for (let y = 0; y < th; y += 2) { const bx = w / 2 + bend * (y / th) ** 2; box(g, bx - 2, h - y - 2, 4, 2, ((y >> 1) % 4) < 2 ? '#F6EEDC' : '#3A2E4A'); box(g, bx + 1, h - y - 2, 1, 2, ((y >> 1) % 4) < 2 ? '#C8BCA8' : '#22182E'); }
  const tx = w / 2 + bend, ty = h - th - h * 0.12, rx = w * 0.42, ry = h * 0.14;
  lump(g, tx, ty, rx, ry, R);
  for (let k = 0; k < 7; k++) { const fx = tx - rx + k * (rx * 2 / 6); box(g, fx - 1, ty + ry * 0.6, 3, 3 + (k % 2) * 2, R[1]); box(g, fx - 1, ty + ry * 0.6, 1, 2, R[2]); }
  box(g, tx - rx * 0.5, ty - ry * 0.6, 3, 1, R[4]);
};
/** A Seuss house: bulging, leaning plaster (spiral stripes or dots on some), round windows (lit after dark), an awning,
 *  a round door, and a roof that droops, flops or stacks; a curly chimney on some. */
export const house = (wall: string, roof: string, seed: number) => (g: Ctx, w: number, h: number) => {
  const W = rampOf(wall), R = rampOf(roof), rh = Math.round(h * 0.42), lean = Math.round((hash(seed) - 0.5) * w * 0.2), kind = seed % 3;
  // (the body: bulging sides, stepped across, the skin)
  const body = () => { g.moveTo(w * 0.12, h); g.quadraticCurveTo(-2, h * 0.7, w * 0.14 + lean, rh); g.lineTo(w * 0.86 + lean, rh); g.quadraticCurveTo(w + 2, h * 0.7, w * 0.88, h); g.closePath(); };
  g.fillStyle = INK; g.save(); g.translate(-1, 0); g.beginPath(); body(); g.fill(); g.translate(2, 0); g.beginPath(); body(); g.fill(); g.restore();
  g.save(); g.beginPath(); body(); g.clip();
  box(g, 0, rh, w, h - rh, W[2]); box(g, 0, rh, w * 0.3, h - rh, W[3]); box(g, w * 0.08, rh, 2, h - rh, W[4]); box(g, w * 0.7, rh, w * 0.3, h - rh, W[1]);
  if (seed % 2) { g.fillStyle = W[3]; for (let k = -h; k < w; k += 10) { g.beginPath(); g.moveTo(k, h); g.lineTo(k + 4, h); g.lineTo(k + 4 + h * 0.4, rh); g.lineTo(k + h * 0.4, rh); g.closePath(); g.fill(); } box(g, w * 0.7, rh, w * 0.3, h - rh, 'rgba(26,16,40,0.18)'); }
  else for (let y = rh + 6; y < h - 8; y += 9) for (let x = 4 + ((y / 9) % 2 ? 4 : 0); x < w - 2; x += 9) box(g, x, y, 2, 2, W[4]);
  box(g, 0, h - 4, w, 4, W[1]);
  g.restore();
  // (the round door, the windows, an awning)
  g.fillStyle = INK; g.beginPath(); g.ellipse(w / 2, h, w * 0.12, h * 0.18, 0, Math.PI, 0); g.fill();
  g.fillStyle = R[1]; g.beginPath(); g.ellipse(w / 2, h, w * 0.1, h * 0.16, 0, Math.PI, 0); g.fill(); box(g, w / 2 - w * 0.08, h - h * 0.13, 1, h * 0.12, R[3]);
  for (const wx of [w * 0.28, w * 0.72]) { const wy = h * 0.62 + (wx > w / 2 ? -2 : 2); g.fillStyle = INK; g.beginPath(); g.arc(wx + lean * 0.3, wy, w * 0.085, 0, Math.PI * 2); g.fill(); g.fillStyle = lit() ? '#FFD88A' : '#7AAEDC'; g.beginPath(); g.arc(wx + lean * 0.3, wy, w * 0.065, 0, Math.PI * 2); g.fill(); box(g, wx + lean * 0.3 - 1, wy - w * 0.04, 1, 1, lit() ? '#FFF8D8' : '#E2F4FE'); }
  for (let k = 0; k < 4; k++) { box(g, w * 0.18 + k * w * 0.16, h * 0.5, w * 0.08, 3, k % 2 ? '#F8F0F4' : R[2]); }
  // (the roof)
  if (kind === 0) {
    g.fillStyle = INK; g.beginPath(); g.moveTo(w * 0.04, rh + 3); g.bezierCurveTo(w * 0.0, rh * 0.3, w / 2 + lean, rh * 0.5, w / 2 + lean, 0); g.bezierCurveTo(w / 2 + lean, rh * 0.5, w * 1.0, rh * 0.3, w * 0.96, rh + 3); g.closePath(); g.fill();
    g.fillStyle = R[2]; g.beginPath(); g.moveTo(w * 0.08, rh + 1); g.bezierCurveTo(w * 0.05, rh * 0.32, w / 2 + lean, rh * 0.55, w / 2 + lean, 3); g.bezierCurveTo(w / 2 + lean, rh * 0.55, w * 0.95, rh * 0.32, w * 0.92, rh + 1); g.closePath(); g.fill();
    g.fillStyle = R[3]; g.beginPath(); g.moveTo(w * 0.1, rh); g.bezierCurveTo(w * 0.08, rh * 0.4, w / 2 + lean - 2, rh * 0.6, w / 2 + lean - 1, 5); g.lineTo(w * 0.32, rh); g.closePath(); g.fill();
    g.fillStyle = R[0]; g.beginPath(); g.moveTo(w * 0.7, rh); g.bezierCurveTo(w * 0.86, rh * 0.5, w * 0.9, rh * 0.5, w * 0.92, rh + 1); g.closePath(); g.fill();
  } else if (kind === 1) {
    const f = seed % 4 < 2 ? 1 : -1;
    g.fillStyle = INK; g.beginPath(); g.moveTo(w * 0.04, rh + 3); g.quadraticCurveTo(w / 2, -rh * 0.1, w / 2 + f * w * 0.3, 2); g.quadraticCurveTo(w / 2 + f * w * 0.5, rh * 0.15, w / 2 + f * w * 0.42, rh * 0.42); g.quadraticCurveTo(w / 2 + f * w * 0.2, rh * 0.5, w * 0.96, rh + 3); g.closePath(); g.fill();
    g.fillStyle = R[2]; g.beginPath(); g.moveTo(w * 0.08, rh + 1); g.quadraticCurveTo(w / 2, rh * 0.0, w / 2 + f * w * 0.3, 4); g.quadraticCurveTo(w / 2 + f * w * 0.46, rh * 0.17, w / 2 + f * w * 0.4, rh * 0.42); g.quadraticCurveTo(w / 2 + f * w * 0.2, rh * 0.52, w * 0.92, rh + 1); g.closePath(); g.fill();
    g.fillStyle = R[3]; g.beginPath(); g.moveTo(w * 0.1, rh); g.quadraticCurveTo(w * 0.4, rh * 0.2, w / 2, rh * 0.25); g.lineTo(w * 0.3, rh); g.closePath(); g.fill();
    lump(g, w / 2 + f * w * 0.42, rh * 0.42, w * 0.06, w * 0.06, rampOf('#F8F4FA'));
  } else {
    for (let k = 0; k < 3; k++) { const rr = w / 2 - k * w * 0.1, cy = rh - k * rh * 0.3; lump(g, w / 2 + lean * (k / 3), cy, rr, rh * 0.16, rampOf([roof, '#F2C84A', '#5EC4F4'][k])); }
  }
  if (seed % 2 === 0) { const cx = w * 0.78 + lean; g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(cx, rh); g.bezierCurveTo(cx - 6, rh * 0.7, cx + 6, rh * 0.5, cx, rh * 0.25); g.stroke(); g.strokeStyle = '#F06A72'; g.lineWidth = 2; g.stroke(); }
};
const lamp = (g: Ctx, w: number, h: number) => {
  // (a curly lamp post: a twist of purple up to a crook, a round lamp on it (lit after dark), a ball finial)
  g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(w / 2, h); g.bezierCurveTo(w * 0.2, h * 0.6, w * 0.8, h * 0.4, w / 2, h * 0.12); g.stroke();
  g.strokeStyle = '#7C5CC8'; g.lineWidth = 2.4; g.stroke();
  g.strokeStyle = '#BAA4F0'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(w / 2 - 1, h); g.bezierCurveTo(w * 0.2 - 1, h * 0.6, w * 0.8 - 1, h * 0.4, w / 2 - 1, h * 0.12); g.stroke();
  box(g, w / 2 - 4, 0, 8, 8, INK); box(g, w / 2 - 3, 1, 6, 6, lit() ? '#FFF2C4' : '#FCE7A0'); box(g, w / 2 - 3, 1, 2, 2, '#FFFFFF');
  box(g, w / 2 - 3, h - 2, 6, 2, '#4A2E8A');
};
const toad = (g: Ctx, w: number, h: number) => {
  // (a toadstool: a stepped stalk, a red cap lit along its top, white spots)
  box(g, w * 0.34, h * 0.4, w * 0.32, h * 0.6, INK); box(g, w * 0.36, h * 0.42, w * 0.28, h * 0.58, '#F4ECDC'); box(g, w * 0.36, h * 0.42, w * 0.08, h * 0.58, '#FFFFFF'); box(g, w * 0.56, h * 0.42, w * 0.08, h * 0.58, '#C8BCA8');
  lump(g, w / 2, h * 0.4, w / 2 - 1, h * 0.28, rampOf('#DC3442'));
  for (const sx of [0.28, 0.5, 0.7]) box(g, w * sx, h * 0.24 + (sx === 0.5 ? -2 : 0), 2, 2, '#FFFFFF');
};
const balloons = (g: Ctx, w: number, h: number) => {
  // (the balloon man's post: a candy-striped pole, the bunch tied to it, glossy)
  for (let y = h * 0.45; y < h; y += 3) box(g, w / 2 - 1, y, 2, 3, ((y / 3) | 0) % 2 ? '#E2465E' : '#F8F0F4');
  const cols = ['#EF4444', '#FDE047', '#3B82F6', '#22C55E', '#EC4899', '#A855F7'];
  for (let k = 0; k < 6; k++) { const bx = w * 0.2 + (k % 3) * w * 0.3, by = h * 0.12 + (k > 2 ? h * 0.12 : 0); g.strokeStyle = '#E8E4F0'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(w / 2, h * 0.45); g.lineTo(bx, by + 3); g.stroke(); lump(g, bx, by, 3, 4, rampOf(cols[k])); }
};

const props = (): Prop[] => {
  const out: Prop[] = [];
  const walls = ['#F8C8DC', '#FCE69A', '#BEDCF6', '#C2ECCE', '#DCCCF6', '#FCD2B0'], roofs = ['#E2465E', '#7C5CC8', '#24A69C', '#F2822A', '#3E76DE', '#D8408A'];
  for (let i = 0; i < 10; i++) { const side = i % 2 ? 1 : -1, k = i % 6; out.push({ id: `pw-ct2-house${k}`, x: side * (5.4 + (i % 3) * 0.6), z: 4 + i * 3.2, w: 3.2, h: 4.6, ppm: 18, paint: house(walls[k], roofs[(k + 1) % 6], k) }); }
  for (let k = 0; k < 10; k++) out.push({ id: `pw-ct2-truf${k % 5}`, x: (k % 2 ? -1 : 1) * (3.6 + (k % 3) * 0.5), z: 3 + k * 3.6, w: 1.8, h: 3.4, ppm: 20, paint: truffula(['#F472B6', '#FDE047', '#C084FC', '#FB923C', '#5EEAD4'][k % 5], k % 5) });
  for (let k = 0; k < 8; k++) out.push({ id: 'pw-ct2-lamp', x: (k % 2 ? 1 : -1) * 2.4, z: 3 + k * 4, w: 0.6, h: 2.6, ppm: 24, paint: lamp });
  for (let k = 0; k < 4; k++) out.push({ id: 'pw-ct2-toad', x: (k % 2 ? -1 : 1) * 3.0, z: 5 + k * 6, w: 0.9, h: 0.8, ppm: 24, paint: toad });
  out.push({ id: 'pw-ct2-balloons', x: -2.9, z: 11, w: 1.2, h: 2.4, ppm: 24, paint: balloons });
  out.push({ id: 'pw-ct2-balloons', x: 3.1, z: 25, w: 1.2, h: 2.4, ppm: 24, paint: balloons });
  return out;
};

export const INTO_CARTOON: PortalDef = {
  land: 'CARTOON LAND',
  lines: ['EVERYTHING IS SOFT. NOTHING CAN HURT YOU. PROBABLY.', 'KIDDIE RIDES, CARTOONS AND A 1994 MASTERPIECE.'],
  haze: '#FDF2F8',
  ground, back, props,
  rim: () => hourMix('#FDF2F8', '#F9A8D4', '#C4B5FD'),
};
