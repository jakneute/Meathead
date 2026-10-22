// The globe on the park's OUR OVERSEAS PARTNERS! banner (rooms.ts paintBanner), in SNES detail: the Americas turned to
// us (Europe and Africa coming round the far limb), the oceans and the land each in a six-step ramp, lit from the upper
// left and stepped down toward the terminator through an ordered dither, a hurricane spinning off the Caribbean and
// cloud streaks, the atmosphere glowing round its lit rim, inked. A smug face on it (half-lidded, one brow up, a
// smirk), and its arm up out of the banner's top giving the night shift below the finger: a bare cartoon hand, the
// back of it to us, the other fingers curled into knuckles, the middle one up (its joint creases, its nail).
//
// Painted once into the banner's stamp (art.ts: 'ct-st2-banner'): the per-pixel sphere is fine there.

import { part, limb, INK, mix } from '../../spooky/costume';
import { elbowFront, reachTo } from '../../art/limb';

type Ctx = CanvasRenderingContext2D;

const OCEAN = ['#081A4E', '#0F3283', '#1A55BA', '#2A7BDC', '#4FA6F0', '#9DD8FB'];
const LAND = ['#17311A', '#25521F', '#367A28', '#52A336', '#86CB52', '#CDEB86'];
const DESERT = ['#4F3016', '#7D5022', '#AD7C36', '#D3A65A', '#EBCB88', '#FFF0C4'];
const ICE = ['#4E5E80', '#7C8DB2', '#AEBCD8', '#D8E3F2', '#F2F7FF', '#FFFFFF'];
const CLOUD = ['#46557A', '#7F8FB2', '#BFCBE0', '#E9EFF8', '#FFFFFF', '#FFFFFF'];
const RIM = '#A8ECFF';
const SKIN = '#E8A472';
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

type LL = [number, number][];
/** The coastlines, rough (lon, lat in degrees). */
const LANDS: { pts: LL; kind: 'land' | 'ice' | 'water' }[] = [
  { kind: 'land', pts: [[-168, 66], [-156, 71], [-128, 70], [-110, 73], [-95, 72], [-82, 68], [-75, 63], [-64, 60], [-56, 52], [-66, 45], [-70, 42], [-76, 38], [-76, 35], [-81, 31], [-80, 26], [-82, 26], [-84, 30], [-90, 30], [-97, 27], [-97, 21], [-91, 19], [-87, 21], [-88, 16], [-83, 15], [-83, 10], [-77, 8], [-80, 7], [-85, 10], [-92, 14], [-105, 20], [-110, 24], [-112, 29], [-115, 31], [-117, 33], [-121, 35], [-124, 40], [-124, 47], [-132, 55], [-140, 60], [-152, 59], [-158, 57], [-165, 60]] },
  { kind: 'water', pts: [[-95, 58], [-88, 56], [-80, 52], [-77, 56], [-78, 62], [-88, 64], [-94, 61]] },
  { kind: 'land', pts: [[-77, 8], [-72, 12], [-62, 10], [-52, 4], [-50, 0], [-44, -2], [-35, -6], [-39, -14], [-41, -22], [-48, -27], [-53, -34], [-58, -38], [-63, -41], [-66, -47], [-68, -53], [-71, -54], [-74, -47], [-73, -38], [-71, -29], [-70, -18], [-76, -14], [-81, -6], [-80, -2], [-79, 2]] },
  { kind: 'ice', pts: [[-55, 60], [-43, 60], [-35, 66], [-22, 70], [-18, 77], [-25, 82], [-45, 83], [-62, 81], [-72, 78], [-66, 76], [-56, 72], [-53, 66]] },
  { kind: 'land', pts: [[-17, 15], [-17, 21], [-13, 27], [-9, 32], [-6, 35.8], [10, 37], [11, 33], [20, 31], [32, 31], [35, 28], [43, 12], [51, 12], [42, -2], [40, -15], [35, -24], [27, -34], [18, -34], [12, -17], [13, -6], [9, 4], [-5, 5], [-8, 4], [-13, 8]] },
  { kind: 'land', pts: [[-9, 37], [-9, 43], [-2, 43.5], [-4, 48], [2, 51], [8, 54], [8, 57], [5, 60], [10, 63], [15, 68], [22, 71], [30, 71], [40, 66], [40, 46], [28, 41], [22, 37], [15, 40], [12, 44], [7, 44], [3, 43], [-1, 37]] },
  { kind: 'land', pts: [[-5, 50], [1.5, 51], [-1.5, 55], [-3, 58.5], [-6, 57]] },
  { kind: 'land', pts: [[-24, 64], [-14, 64], [-14, 66.5], [-22, 66.5]] },
  { kind: 'land', pts: [[-85, 22], [-80, 23], [-74, 20], [-77, 19.8], [-84, 21.5]] },
  { kind: 'land', pts: [[-74, 19.6], [-68.5, 19.8], [-68.5, 18.2], [-74, 18.2]] },
];
/** The deserts: [lon, lat, half-width, half-height] (the American Southwest, the Sahara, the Atacama). */
const DESERTS: [number, number, number, number][] = [[-111, 32, 9, 6], [-108, 26, 5, 4], [5, 23, 26, 8], [-69, -24, 3, 9], [20, -25, 8, 6]];

const inPoly = (x: number, y: number, pts: LL) => {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
const surface = (lon: number, lat: number): string[] => {
  if (lat < -68) return ICE;
  let kind: 'sea' | 'land' | 'ice' = 'sea';
  for (const l of LANDS) if (inPoly(lon, lat, l.pts)) kind = l.kind === 'water' ? 'sea' : l.kind;
  if (kind === 'sea') return lat > 76 ? ICE : OCEAN;
  if (kind === 'ice' || lat > 70) return ICE;
  for (const [dx, dy, w, h] of DESERTS) if (((lon - dx) / w) ** 2 + ((lat - dy) / h) ** 2 < 1) return DESERT;
  return LAND;
};
/** Cloud cover at (lon, lat) in radians: streaks, the equator's band, a hurricane off the Caribbean. */
const cloudy = (lon: number, lat: number) => {
  const n = Math.sin(lon * 2.3 + Math.sin(lat * 3.1) * 2) * Math.sin(lat * 5.2 + lon * 0.7) + 0.5 * Math.sin(lon * 6.1 - lat * 4.3 + 1.7);
  if (n > 0.78) return true;
  const deg = lat * 180 / Math.PI;
  if (Math.abs(deg - 5) < 3.2 && Math.sin(lon * 11) > 0.15) return true;
  const hx = (lon * 180 / Math.PI + 58) * Math.cos(lat), hy = deg - 23, d = Math.hypot(hx, hy) / 57.3;
  if (d < 0.2 && d > 0.025) return Math.sin(Math.atan2(hy, hx) * 2 - d * 30) > 0.05 - d * 2;
  return false;
};

/** The sphere, pixel by pixel, with its halo and its ink. */
const sphere = (g: Ctx, cx: number, cy: number, r: number) => {
  const lon0 = -62 * Math.PI / 180, lat0 = 18 * Math.PI / 180, cl = Math.cos(lat0), sl = Math.sin(lat0);
  const L = [-0.52, 0.56, 0.65], Ln = Math.hypot(L[0], L[1], L[2]);
  // (the atmosphere's halo outside the ink, brightest on the lit side, dithered off)
  for (let dy = -r - 4; dy <= r + 4; dy++) for (let dx = -r - 4; dx <= r + 4; dx++) {
    const d = Math.hypot(dx + 0.5, dy + 0.5);
    if (d <= r + 0.5 || d > r + 4) continue;
    const lit = (-(dx) * 0.6 - dy * 0.55) / d;
    const ring = d - r;
    const on = ring < 1.8 ? lit > -0.5 : ring < 3 ? lit > 0 && ((dx + dy) & 1) === 0 : lit > 0.45 && ((dx ^ dy) & 3) === 0;
    if (!on) continue;
    g.fillStyle = ring < 1.8 && lit > 0.2 ? '#E6FBFF' : RIM;
    g.fillRect(cx + dx, cy + dy, 1, 1);
  }
  for (let dy = -r; dy < r; dy++) for (let dx = -r; dx < r; dx++) {
    const nx = (dx + 0.5) / r, uy = -(dy + 0.5) / r, rr = nx * nx + uy * uy;
    if (rr > 1) continue;
    const nz = Math.sqrt(1 - rr);
    // (into the globe's own frame: tipped to show the north a touch)
    const yw = uy * cl + nz * sl, zw = -uy * sl + nz * cl;
    const lat = Math.asin(Math.max(-1, Math.min(1, yw))), lon = lon0 + Math.atan2(nx, zw);
    let deg = lon * 180 / Math.PI; while (deg > 180) deg -= 360; while (deg < -180) deg += 360;
    const lam = (nx * L[0] + uy * L[1] + nz * L[2]) / Ln;
    const b = BAYER[((dy + 64) & 3) * 4 + ((dx + 64) & 3)] / 16 - 0.5;
    const cloud = cloudy(lon, lat);
    const ramp = cloud ? CLOUD : surface(deg, lat * 180 / Math.PI);
    // (stepped toward the terminator: the night side holds its two darkest steps, the lit side climbs)
    let t = lam > 0 ? 1.6 + lam * 3.6 : 1.5 + lam * 2.2;
    if (ramp === OCEAN) { const sx = nx + 0.42, sy = uy - 0.46; if (sx * sx + sy * sy < 0.03) t += 1; }
    const idx = Math.max(0, Math.min(5, Math.floor(t + b)));
    let col = ramp[idx];
    // (the atmosphere on the lit limb, in two dithered steps)
    if (nz < 0.32 && lam > -0.05) {
      const k = nz < 0.16 ? 0.5 : 0.25;
      if (nz < 0.16 || b > -0.1) col = mix(col, RIM, k);
    }
    g.fillStyle = col; g.fillRect(cx + dx, cy + dy, 1, 1);
  }
  // (the glint on the sea)
  g.fillStyle = '#FFFFFF'; g.fillRect(Math.round(cx - r * 0.44), Math.round(cy - r * 0.5), 2, 2); g.fillRect(Math.round(cx - r * 0.44) + 2, Math.round(cy - r * 0.5) + 2, 1, 1);
  g.strokeStyle = INK; g.lineWidth = 1.8; g.beginPath(); g.arc(cx, cy, r + 0.3, 0, Math.PI * 2); g.stroke();
};

/** The smug face: half-lidded eyes looking down at the night shift, one brow up, a smirk up one side. */
const face = (g: Ctx, cx: number, cy: number) => {
  const eye = (ex: number, ey: number) => {
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(ex, ey, 6, 7.5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#C9D8EE'; g.fillRect(ex + 2, ey + 1, 4, 6);
    g.fillStyle = INK; g.beginPath(); g.ellipse(ex + 1.5, ey + 3, 2.6, 3.2, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#FFFFFF'; g.fillRect(ex + 1, ey + 1.5, 1, 1);
    // (the heavy lid, down past halfway)
    g.save(); g.beginPath(); g.ellipse(ex, ey, 6, 7.5, 0, 0, Math.PI * 2); g.clip();
    g.fillStyle = OCEAN[2]; g.fillRect(ex - 7, ey - 8, 14, 8.5);
    g.fillStyle = OCEAN[3]; g.fillRect(ex - 7, ey - 8, 6, 3);
    g.fillStyle = OCEAN[1]; g.fillRect(ex - 7, ey - 1.5, 14, 2);
    g.restore();
    g.strokeStyle = INK; g.lineWidth = 1.4; g.beginPath(); g.ellipse(ex, ey, 6, 7.5, 0, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 1.8; g.beginPath(); g.moveTo(ex - 6.5, ey + 0.5); g.quadraticCurveTo(ex, ey - 0.8, ex + 6.5, ey + 0.2); g.stroke();
  };
  eye(cx - 12, cy - 7); eye(cx + 9, cy - 8);
  g.strokeStyle = INK; g.lineCap = 'round'; g.lineWidth = 2.6;
  // (the left brow down flat, the right one cocked)
  g.beginPath(); g.moveTo(cx - 19, cy - 16); g.lineTo(cx - 6, cy - 15); g.stroke();
  g.beginPath(); g.moveTo(cx + 2, cy - 19); g.quadraticCurveTo(cx + 9, cy - 27, cx + 17, cy - 21); g.stroke();
  // (the smirk: the left corner flat, the right hooked up, a crease past it, a sliver of teeth)
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.moveTo(cx + 1, cy + 12); g.quadraticCurveTo(cx + 8, cy + 11, cx + 12, cy + 6.5); g.quadraticCurveTo(cx + 7, cy + 8.5, cx + 1, cy + 9.5); g.closePath(); g.fill();
  g.lineWidth = 2; g.beginPath(); g.moveTo(cx - 10, cy + 11); g.quadraticCurveTo(cx + 2, cy + 14, cx + 13, cy + 6); g.stroke();
  g.lineWidth = 1.3; g.beginPath(); g.moveTo(cx + 12.5, cy + 3.5); g.quadraticCurveTo(cx + 16, cy + 6, cx + 14.5, cy + 10); g.stroke();
  g.strokeStyle = OCEAN[1]; g.lineWidth = 1; g.beginPath(); g.moveTo(cx - 4, cy + 16); g.quadraticCurveTo(cx + 1, cy + 17.5, cx + 5, cy + 15.5); g.stroke();
  g.lineCap = 'butt';
};

/** The hand, the back of it to us (the globe's left: the thumb on our right), the middle finger up from the wrist at
 *  (hx, hy). */
const bird = (g: Ctx, hx: number, hy: number) => {
  const dkS = mix(SKIN, INK, 0.38), crease = mix(SKIN, INK, 0.5);
  // (the thumb, tucked along the fist's side)
  part(g, () => g.ellipse(hx + 10, hy - 9, 4.5, 7, -0.3, 0, Math.PI * 2), SKIN, hx + 5, hy - 16, 10, 14, 1.3);
  // (the back of the hand: the fist)
  part(g, () => g.roundRect(hx - 10, hy - 21, 20, 20, 5), SKIN, hx - 10, hy - 21, 20, 20, 1.4);
  // (the curled fingers' knuckles along the top: the pinky lowest, the ring, the index by the thumb)
  for (const [kx, ky, kr] of [[-7, -19, 3.2], [-2.5, -21, 3.4], [7, -21, 3.4]] as [number, number, number][]) {
    part(g, () => g.ellipse(hx + kx, hy + ky, kr, kr * 1.05, 0, 0, Math.PI * 2), SKIN, hx + kx - kr, hy + ky - kr, kr * 2, kr * 2.1, 1.2);
    g.strokeStyle = crease; g.lineWidth = 1; g.beginPath(); g.arc(hx + kx, hy + ky + 1.2, kr * 0.55, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
  }
  // (the curled fingers' first joints folding down the back, and the tendons fanning to the wrist)
  g.strokeStyle = dkS; g.lineWidth = 1;
  for (const kx of [-7, -2.5, 7]) { g.beginPath(); g.moveTo(hx + kx - 2, hy - 15.5); g.lineTo(hx + kx + 2, hy - 15.5); g.stroke(); }
  g.strokeStyle = mix(SKIN, INK, 0.2);
  for (const [a, b] of [[-6, -3], [2, 0.5], [6, 2]]) { g.beginPath(); g.moveTo(hx + a, hy - 13); g.lineTo(hx + b, hy - 4); g.stroke(); }
  // (the middle finger, up: three segments' worth, rounded at the tip)
  part(g, () => g.roundRect(hx - 0.5, hy - 43, 6.5, 26, 3.2), SKIN, hx - 0.5, hy - 43, 6.5, 26, 1.4);
  // (its knuckle, and the creases at its two joints)
  g.strokeStyle = crease; g.lineWidth = 1;
  g.beginPath(); g.arc(hx + 2.75, hy - 20.5, 2.2, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
  for (const jy of [-27, -34.5]) {
    g.beginPath(); g.moveTo(hx + 0.8, jy + hy); g.quadraticCurveTo(hx + 2.75, jy + hy - 1.3, hx + 4.7, jy + hy); g.stroke();
    g.beginPath(); g.moveTo(hx + 1.6, jy + hy + 1.4); g.lineTo(hx + 3.9, jy + hy + 1.4); g.stroke();
  }
  // (the nail)
  g.fillStyle = '#F9D2C4'; g.beginPath(); g.roundRect(hx + 1, hy - 41.5, 4.5, 5.5, 1.8); g.fill();
  g.strokeStyle = dkS; g.lineWidth = 0.9; g.stroke();
  g.fillStyle = '#FFF4EE'; g.fillRect(hx + 1.6, hy - 40.6, 1, 2);
  g.fillStyle = '#FFFFFF'; g.fillRect(hx + 1.5, hy - 41.2, 3.5, 0.8);
  // (the wrist's crease)
  g.strokeStyle = dkS; g.beginPath(); g.moveTo(hx - 6, hy - 1.5); g.quadraticCurveTo(hx, hy + 0.5, hx + 6, hy - 1.5); g.stroke();
};

/** The whole globe at (cx, cy), radius r, flipping the bird up and to its left (our right). */
export const flipGlobe = (g: Ctx, cx: number, cy: number, r: number) => {
  cx = Math.round(cx); cy = Math.round(cy);
  // (the arm first, from behind the globe's edge; elbow out to the side, as a front-on arm bends)
  const sx = cx + r * 0.82, sy = cy + r * 0.12, U = 24, F = 24;
  const [wx, wy] = reachTo(sx, sy, cx + r + 18, cy - r - 4, U, F);
  const [ex, ey] = elbowFront(sx, sy, wx, wy, U, F, 1);
  limb(g, sx, sy, ex, ey, 8, SKIN); limb(g, ex, ey, wx, wy, 7, SKIN);
  g.strokeStyle = mix(SKIN, '#FFFFFF', 0.35); g.lineWidth = 2; g.lineCap = 'round';
  g.beginPath(); g.moveTo(sx - 1, sy - 2); g.lineTo(ex - 2, ey); g.lineTo(wx - 2, wy + 2); g.stroke();
  g.strokeStyle = mix(SKIN, INK, 0.3); g.lineWidth = 1;
  g.beginPath(); g.arc(ex, ey, 2.5, -0.3, 1.3); g.stroke();
  g.lineCap = 'butt';
  sphere(g, cx, cy, r);
  face(g, cx, cy);
  bird(g, wx - 1, wy + 3);
};
