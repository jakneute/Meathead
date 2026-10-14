// The walk into Future Land (portalWalk.ts): out of the portal and up the square's walk toward the FUTURELAND gate
// (the square's own: its fiberglass pylons ringed in chrome, the pink boomerang arch with its bulbs, a rocket on each
// pylon, FUTURELAND, THE WORLD OF TOMORROW!), its googie lamps along the way either side (lit after dark), rocket
// trash cans (FEED ME), the PA's horn on its pole, planters and atomic palms out either side; through the gate, the
// square's shopfronts facing him (ROCKET POPS, ATOMIC ANNIE'S, SATELLITE BURGER, THE KITCHEN OF 2000), and over it all THE GIANT ATOM turning slow with Space Needle 2 off
// to the right going up out of sight, both as he'll find them. The sky Futureland's, by whatever hour it is
// (timeOfDay.ts), the blimp going over. It's the square's own painting brought into the picture (space/square/*): the
// same painters, the square's px to a meter.

import { type Ctx, type Prop, type PortalDef, HOR, LW, box, hash } from './kit';
import { canvas } from './screen';
import { timeOfDay, hourMix, skyRamp, sunAt, drawStars, drawMoon, farTint, skyAt, cloudTint, type TimeOfDay } from '../timeOfDay';
import { mix, checker, bandedGradient, hazeBands, pixelBlob, PAVE, PINK, TEAL, INK, ramp6, poly } from '../space/square/paint';
import { drawGiantAtom, drawNeedle } from '../space/square/sky';
import { paintShopFront, type Shop } from '../space/square/buildings';
import { paintLamp, paintGate, paintTrashCan, paintPlanter, paintSpeaker } from '../space/square/props';

/** The square's px a meter here (him: ~70 of them in the square; a touch under 2 m in this picture). */
const PPM = 38;
/** Where the gate is when he sets off (m). */
const GATE_Z = 16;

const fontIn = () => (typeof document !== 'undefined' && document.fonts?.check('8px "Press Start 2P"') ? 'f' : 'n');
/** Something of the square's painted at its own px (`paint`, its foot at (ox, oy) in a tw by th box), then brought
 *  down to the sprite's size in one go (an even average, painted once: no crawl as it's scaled after). */
const shrunk = (tw: number, th: number, ox: number, oy: number, paint: (g: Ctx) => void) => (g: Ctx, w: number, h: number) => {
  const big = canvas(Math.ceil(tw), Math.ceil(th)), bg = big.getContext('2d')!;
  bg.translate(ox, oy); paint(bg);
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  g.drawImage(big, 0, 0, w, h);
};
/** A prop with words on it: its id carries whether the pixel font's in (or one painted in the fallback would stick). */
const worded = (p: Omit<Prop, 'id'>, id: string): Prop => Object.defineProperty({ ...p }, 'id', { get: () => id + fontIn(), enumerable: true }) as Prop;
/** A prop of the square's: `tw` by `th` square px, its foot at (ox, oy) in that box. */
const sq = (id: string, x: number, z: number, tw: number, th: number, ox: number, oy: number, paint: (g: Ctx) => void, res = 24, words = false): Prop => {
  const p = { x, z, w: tw / PPM, h: th / PPM, ppm: res, paint: shrunk(tw, th, ox, oy, paint) };
  return words ? worded(p, `pw-spc-${id}-`) : { id: `pw-spc-${id}`, ...p };
};

// ---------------------------------------------------------------------------------------------------------------
// The ground: the square's pale pavers right across, the pink and teal stripes inlaid up the middle, starbursts set in
// it, popcorn

const ground = (g: Ctx, w: number, h: number) => {
  const C = PAVE;
  box(g, 0, 0, w, h, C[3]);
  for (let y = 0; y < h; y += 16) for (let x = (y / 16) % 2 ? -8 : 0; x < w; x += 16) {
    const t = hash(x * 0.37 + y * 1.13);
    box(g, x + 1, y + 1, 14, 14, C[t > 0.7 ? 4 : t > 0.2 ? 5 : 3]);
    box(g, x + 1, y + 1, 14, 1, C[6]); box(g, x + 1, y + 14, 14, 1, C[2]);
    if (t < 0.04) box(g, x + 2, y + 2, 12, 12, t < 0.02 ? PINK[4] : TEAL[4]);
  }
  // (the stripes up the middle: pink either side, teal down the center, chrome strips between)
  const cx = w / 2;
  box(g, cx - 22, 0, 14, h, PINK[3]); box(g, cx + 8, 0, 14, h, PINK[3]); box(g, cx - 22, 0, 2, h, PINK[4]);
  box(g, cx - 8, 0, 16, h, TEAL[3]); box(g, cx - 8, 0, 3, h, TEAL[5]); box(g, cx + 6, 0, 2, h, TEAL[2]);
  for (let y = 0; y < h; y += 16) { box(g, cx - 21, y, 12, 1, PINK[1]); box(g, cx + 9, y, 12, 1, PINK[1]); box(g, cx - 8, y, 16, 1, TEAL[1]); }
  // (a starburst set in the walk out to each side, every so often)
  for (let y = 40; y < h; y += 128) for (const sx of [cx - 70, cx + 70]) {
    for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4, len = k % 2 ? 9 : 18; poly(g, [[sx, y], [sx + Math.cos(a - 0.25) * len * 0.3, y + Math.sin(a - 0.25) * len * 0.3], [sx + Math.cos(a) * len, y + Math.sin(a) * len], [sx + Math.cos(a + 0.25) * len * 0.3, y + Math.sin(a + 0.25) * len * 0.3]], k % 2 ? TEAL[3] : '#E8B830'); }
    box(g, sx - 2, y - 2, 4, 4, '#FFF0A0');
  }
  // (popcorn, ticket stubs, gum)
  for (let i = 0; i < (w * h) / 300; i++) box(g, hash(i * 1.7) * w, hash(i * 2.3) * h, 2, 1, ['#FFF6D0', '#F4E8B0', '#3A3A44', '#E86F6F'][i % 4]);
};

// ---------------------------------------------------------------------------------------------------------------
// The far off: Futureland's sky (banded, the sun, the moon and stars), clouds, the blimp, the far skyline of the
// future; the giant atom and Space Needle 2 over it

const SKY = ['#2456C8', '#3A7EE0', '#5AA6EE', '#86CCF0', '#B4E6EA', '#E4F6E4'];
const skies = new Map<string, HTMLCanvasElement>();
const skyOf = (tod: TimeOfDay) => {
  let s = skies.get(tod.key);
  if (!s) { s = canvas(LW, HOR + 4); bandedGradient(s.getContext('2d')!, 0, 0, LW, HOR + 4, skyRamp(SKY, tod), 18, 1); skies.set(tod.key, s); }
  return s;
};

/** The far skyline, at the picture's own scale: domes, saucers up on stalks, a rocket on its gantry, the ORBITRON. */
const skylines = new Map<string, HTMLCanvasElement>();
const skylineOf = (tod: TimeOfDay, near: boolean) => {
  const key = `${tod.key}-${near ? 1 : 0}`;
  let s = skylines.get(key);
  if (s) return s;
  s = canvas(LW + 80, 70);
  const g = s.getContext('2d')!, f = 68, k = near ? 0.2 : 0.42;
  const T = (c: string) => mix(farTint(c, 1, tod), skyAt(0.86, tod), k);
  const body = T(hourMix(near ? '#9AAAD8' : '#8A9AC8', '#9A7AA0', '#2A3058', tod)), sh = T(hourMix('#7484B4', '#80648A', '#20264A', tod)), lt = T(hourMix('#B8C6EA', '#C09AB0', '#3A4270', tod));
  const bulb = tod.lamps > 0.3 ? '#FFE8A0' : lt;
  for (let x = near ? 14 : 0, i = near ? 40 : 0; x < LW + 80; i++) {
    const kind = Math.floor(hash(i * 7.3) * 5), w = (near ? 22 : 16) + hash(i * 2.9) * (near ? 26 : 20), cx = x + w / 2;
    if (kind === 0) { const r = w * 0.45; g.fillStyle = sh; g.beginPath(); g.arc(cx, f, r, Math.PI, 0); g.fill(); g.fillStyle = body; g.beginPath(); g.arc(cx - 1, f, r * 0.8, Math.PI, 0); g.fill(); box(g, cx - r * 0.4, f - r * 0.6, 2, 2, lt); box(g, cx, f - r - 3, 1, 3, sh); }
    else if (kind === 1) { const hh = (near ? 18 : 26) + hash(i) * 14; box(g, cx - 1, f - hh, 2, hh, sh); g.fillStyle = sh; g.beginPath(); g.ellipse(cx, f - hh, w * 0.42, 3, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = lt; g.beginPath(); g.ellipse(cx, f - hh - 1, w * 0.3, 1.5, 0, Math.PI, 0); g.fill(); box(g, cx - 1, f - hh + 1, 2, 1, bulb); }
    else if (kind === 2) { const rh = (near ? 22 : 34) + hash(i) * 10; box(g, cx - 2, f - rh + 6, 4, rh - 6, body); box(g, cx - 2, f - rh + 6, 1, rh - 6, lt); poly(g, [[cx - 2, f - rh + 6], [cx, f - rh], [cx + 2, f - rh + 6]], body); for (let y = f - rh + 8; y < f; y += 4) box(g, cx + 4, y, 4, 1, sh); }
    else if (kind === 3) { const ph = (near ? 12 : 20) + hash(i) * 8; box(g, cx - 1, f - ph, 2, ph, sh); for (let a = 0; a < 5; a++) { const an = (a * Math.PI) / 2.5 + 0.3; box(g, cx + Math.cos(an) * w * 0.4 - 2, f - ph + Math.sin(an) * 3 - 1, 4, 2, body); } }
    else { const ph = 8 + hash(i) * 10; box(g, x + 1, f - ph, w - 2, ph, body); box(g, x + 1, f - ph, 1, ph, lt); for (let wx = x + 3; wx < x + w - 3; wx += 4) box(g, wx, f - ph + 3, 2, 2, tod.lamps > 0.3 ? '#E8C070' : sh); }
    x += w + 4 + hash(i * 5.7) * (near ? 18 : 10);
  }
  box(g, 0, f, LW + 80, 2, sh);
  hazeBands(g, 0, f - 18, LW + 80, 18, skyAt(0.92, tod), 0, 0.5, 4, 1);
  skylines.set(key, s);
  return s;
};

const back = (c: Ctx, t: number, sway: number) => {
  const tod = timeOfDay();
  c.drawImage(skyOf(tod), 0, 0);
  drawStars(c, 0, 0, LW, HOR - 10, t, 0, tod, 1);
  drawMoon(c, 330, 18, 7, tod);
  // (the sun, by day: a small stepped disc, sinking with the hour)
  const s = sunAt(96, 18, HOR, tod);
  if (s.up > 0.05) {
    c.save(); c.globalAlpha = s.up;
    for (const [r, col] of [[12, mix(s.glow, skyAt(0.3, tod), 0.6)], [8, s.glow], [7, s.core], [3, mix(s.core, '#FFFFFF', 0.6)]] as const) { c.fillStyle = col; c.beginPath(); c.arc(Math.round(s.x - (r === 3 ? 1 : 0)), Math.round(s.y - (r === 3 ? 1 : 0)), r, 0, Math.PI * 2); c.fill(); }
    c.restore();
  }
  // (fair-weather clouds drifting, three steps each)
  for (let i = 0; i < 4; i++) {
    const x = ((i * 120 + t * 0.03 + sway * 0.2) % 480) - 40, y = 22 + hash(i * 3.3) * 22, w = 26 + hash(i) * 20;
    pixelBlob(c, x, y + 3, w * 0.55, 4, cloudTint('#C8D4E8', tod), 1); pixelBlob(c, x - w * 0.1, y, w * 0.32, 5, cloudTint('#E6EEF8', tod), 1); pixelBlob(c, x - w * 0.18, y - 2, w * 0.16, 3, cloudTint('#FFFFFF', tod), 1);
  }
  // (the blimp, going over)
  const bx = Math.round(((t * 0.08) % 520) - 60), by = 14;
  const B = ['#7A5A78', '#B48CB0', '#DCC0DA'].map(col => farTint(col, 0.8, tod));
  c.fillStyle = INK; c.beginPath(); c.ellipse(bx, by, 15, 5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = B[0]; c.beginPath(); c.ellipse(bx, by, 14, 4, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = B[1]; c.beginPath(); c.ellipse(bx - 1, by - 1, 12, 2.5, 0, 0, Math.PI * 2); c.fill();
  box(c, bx - 14, by, 28, 1, farTint('#E8659E', 0.8, tod)); box(c, bx - 2, by + 4, 5, 2, B[0]);
  // The far skyline; Space Needle 2 off to the right going up out of sight; the giant atom over the gate
  const off = Math.round(sway * 0.3);
  c.drawImage(skylineOf(tod, false), off - 40, HOR - 66);
  drawNeedle(c, Math.round(318 + sway * 0.35), HOR + 4, 0.14, t, 1);
  drawGiantAtom(c, Math.round(176 + sway * 0.4), HOR - 36, 0.3, t, false, 1);
  c.drawImage(skylineOf(tod, true), Math.round(sway * 0.5) - 40, HOR - 64);
  hazeBands(c, 0, HOR - 12, LW, 14, skyAt(0.92, tod), 0, 0.45, 4, 1);
};

// ---------------------------------------------------------------------------------------------------------------
// Along the way

/** The square's shops through the gate, facing him: which, across from his path (m). */
const SQUARE: [Shop, number][] = [
  [{ x: 0, w: 260, h: 200, wall: '#FCE7F3', trim: '#22C55E', roof: 'boomerang', name: 'ROCKET POPS', sub: '$11. NO REFUNDS IN SPACE.' }, -16.5],
  [{ x: 0, w: 300, h: 170, wall: '#FBCFE8', trim: '#14B8A6', roof: 'boomerang', name: "ATOMIC ANNIE'S GIFT SHOPPE" }, -7.9],
  [{ x: 0, w: 300, h: 200, wall: '#E0E7FF', trim: '#F97316', roof: 'fin', name: 'SATELLITE BURGER', sub: 'NOW WITH REAL MEAT FLAVOR' }, 7.9],
  [{ x: 0, w: 280, h: 180, wall: '#FEF9C3', trim: '#6366F1', roof: 'saucer', name: 'THE KITCHEN OF 2000' }, 16.6],
];
const SQUARE_Z = GATE_Z + 9;

/** An atomic palm in its tub (a ringed trunk, starburst fronds). */
const paintPalm = (seed: number) => (g: Ctx, w: number, h: number) => {
  const tod = timeOfDay(), cx = w / 2, foot = h - 1;
  for (let y = 10; y < h * 0.82; y += 3) box(g, cx + Math.sin(y * 0.05 + seed) * 4 - 2, foot - y, 5, 3, (y / 3) % 2 ? '#8A6A4A' : '#6A4E34');
  const tx = cx + Math.sin(h * 0.82 * 0.05 + seed) * 4, ty = foot - h * 0.82;
  for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2 + seed; g.strokeStyle = k % 2 ? '#2E8A4A' : '#4EB060'; g.lineWidth = 3; g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo(tx + Math.cos(a) * 9, ty + Math.sin(a) * 5 - 5, tx + Math.cos(a) * 17, ty + Math.sin(a) * 9 + 3); g.stroke(); }
  g.fillStyle = '#F0D060'; g.beginPath(); g.arc(tx, ty, 2.5, 0, Math.PI * 2); g.fill();
  box(g, cx - 9, foot - 10, 18, 10, INK); box(g, cx - 8, foot - 9, 16, 9, PINK[3]); box(g, cx - 8, foot - 9, 16, 2, PINK[5]);
  void tod;
};

const props = (): Prop[] => {
  const out: Prop[] = [];
  // The gate
  out.push(sq('gate', 0, GATE_Z, 540, 347, 270, 345, paintGate, 22, true));
  // Through it: the square's shopfronts facing him
  for (const [s, x] of SQUARE) { const gh = 130; out.push(sq(`shop-${s.name.length}`, x, SQUARE_Z, s.w + 120, s.h + gh + 4, 60, s.h + gh, g => paintShopFront(g, s), 14, true)); }
  // The googie lamps up the way, either side, staggered; on up past the gate
  for (let i = 0; i < 5; i++) { const side = i % 2 ? 1 : -1; out.push(sq(`lamp${side}`, side * 3.6 + 0.4, 2.5 + i * 3.2, 84, 202, 40, 200, g => paintLamp(g, timeOfDay().lamps > 0.35), 24)); }
  for (const [x, z] of [[-3.4, GATE_Z + 4], [4, GATE_Z + 5.5]] as const) out.push(sq('lampb', x, z, 84, 202, 40, 200, g => paintLamp(g, timeOfDay().lamps > 0.35), 24));
  // Rocket trash cans; the PA's horn on its pole
  for (const [x, z] of [[-2.6, 5.2], [2.7, 11.2]] as const) out.push(sq('trash', x, z, 68, 108, 14, 106, g => paintTrashCan(g, 40, 70), 26, true));
  out.push(sq('pa', 4.6, 8.2, 52, 214, 20, 212, g => paintSpeaker(g, 190), 24));
  // Out either side: a hedge of planters, atomic palms standing up out of them
  for (const side of [-1, 1]) for (let k = 0; k < 4; k++) out.push(sq('planter', side * 6.4, 1.8 + k * 4.4 + (side > 0 ? 2.2 : 0), 108, 100, 14, 98, g => paintPlanter(g, 80, 54), 24));
  for (let i = 0; i < 6; i++) { const side = i % 2 ? 1 : -1; out.push({ id: `pw-spc-palm${i % 3}`, x: side * (8.6 + hash(i) * 2.5), z: 3 + i * 2.6, w: 2.4, h: 5.2, ppm: 16, paint: paintPalm(i % 3) }); }
  return out;
};

// ---------------------------------------------------------------------------------------------------------------
// Over it all: a few balloons gone up (somebody let go), drifting; after dark, the gate's bulbs twinkling over him

const front = (c: Ctx, t: number, sway: number) => {
  for (let i = 0; i < 3; i++) {
    const u = ((t * 0.5 + i * 160) % 480) / 480, x = Math.round(60 + i * 130 + Math.sin(t * 0.02 + i) * 8 + sway * 0.6), y = Math.round(150 - u * 190);
    if (y < -12) continue;
    const R = ramp6(['#E8659E', '#22BCAC', '#F0C840'][i]);
    c.fillStyle = INK; c.beginPath(); c.ellipse(x, y, 5, 6, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = R[2]; c.beginPath(); c.ellipse(x, y, 4, 5, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = R[4]; c.beginPath(); c.ellipse(x - 1, y - 2, 2, 2, 0, 0, Math.PI * 2); c.fill();
    box(c, x - 1, y + 5, 2, 1, R[1]);
    for (let k = 0; k < 6; k++) box(c, x + Math.round(Math.sin(t * 0.05 + k + i) * 1), y + 6 + k * 2, 1, 2, '#E8E8F0');
  }
  void checker;
};

export const INTO_SPACE: PortalDef = {
  land: 'FUTURE LAND',
  lines: ['THE FUTURE, AS IMAGINED IN 1962. STILL LOADING.', 'FIRST STOP: FUTURELAND SQUARE.'],
  haze: '#A5B4FC',
  ground, back, props, front,
  rim: () => hourMix('#E0E7FF', '#F59E0B', '#A5B4FC'),
};
