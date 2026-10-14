// Spooky Land's town for the walk screens (the walk in, intoSpooky.ts; the walk-away from Donnie, donnie.ts): the same
// town he plays through (spooky/town/*), brought into the low-res picture. What can be is the town's own painting,
// imported so the two can't drift apart: its shopfronts (paintFront: the purple stucco, the gables and mansards, the
// bays, the boards), its gas lamps (paintLamp), its gate (paintGag), its palettes and its board. What has to be redrawn
// at the picture's scale is drawn to the same designs, in the same colors: the banded sky (the town's palette), the
// cloud bank, the far hills, the skyline of roofs, and the ELEVATOR TO HELL clock tower (intact, or wrecked).
//
// The street's walls are drawn the SNES's raycast way: a column of the picture at a time, each column one slice of a
// strip of the town's shopfronts painted once (each halving of it, each in its four fogs), at the distance that
// column's bit of wall is at. One eye (the ground's), straight walls, which shop it is keyed to where along the street
// it is, never to the screen.

import { type Ctx, type Prop, LW, HOR, F, CAM_H, box, hash } from './kit';
import { canvas, gradeOf, hazeOf, fogAt, type Look } from './screen';
import { timeOfDay, hourMix, skyRamp, skyAt, farTint, cloudTint, sunAt, drawStars, drawMoon, type TimeOfDay } from '../timeOfDay';
import { SHOPS, paintFront } from '../spooky/town/buildings';
import { paintLamp, paintGag } from '../spooky/town/props';
import { X } from '../spooky/town/layout';
import { GY } from '../spooky/geometry';
import { INK, COBBLE, STONE, SLATE, IRON, LIP, board, mix, checker, bandedGradient, pixelBlob, textW } from '../spooky/town/paint';

export { INK, COBBLE, STONE, SLATE, IRON, LIP, mix };

export const fontIn = () => (typeof document !== 'undefined' && document.fonts?.check('8px "Press Start 2P"') ? 'f' : 'n');

/** The town's sky, top to the horizon (spooky/town/sky.ts's). */
const SKY = ['#34304E', '#423C5E', '#544A6C', '#685A78', '#7E6C82', '#94808A'];

/** Something of the town's painted at its own pixels (`paint`, in town px), then brought down to the sprite's size in
 *  one go (an even average, painted once: no crawl as it's scaled after). */
const shrunk = (tw: number, th: number, paint: (g: Ctx) => void) => (g: Ctx, w: number, h: number) => {
  const big = canvas(Math.ceil(tw), Math.ceil(th)), bg = big.getContext('2d')!;
  paint(bg);
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  g.drawImage(big, 0, 0, w, h);
};
/** A prop whose look has words on it: its id carries whether the pixel font's in (or a sprite painted in the fallback
 *  font would be kept for good). */
const worded = (p: Omit<Prop, 'id'>, id: string): Prop => Object.defineProperty({ ...p }, 'id', { get: () => id + fontIn(), enumerable: true }) as Prop;

// ---------------------------------------------------------------------------------------------------------------
// The sky: the town's palette, banded; its stars and moon after dark, a small sun by day; the cloud bank drifting; the
// far hills and their dead trees; the skyline of roofs (gables and their finials, mansards and dormers, a spire,
// chimneys; windows lit after dark). Each far layer a tile painted once for the hour.

const SKY_BANDS = new Map<string, HTMLCanvasElement>();
const skyOfTown = (tod: TimeOfDay) => {
  let s = SKY_BANDS.get(tod.key);
  if (!s) {
    s = canvas(LW, HOR + 2);
    const g = s.getContext('2d')!;
    bandedGradient(g, 0, 0, LW, HOR + 2, skyRamp(SKY, tod), 14, 1);
    SKY_BANDS.set(tod.key, s);
  }
  return s;
};

const TILE_W = 480;
const tiles = new Map<string, HTMLCanvasElement>();
const tileOf = (key: string, h: number, paint: (g: Ctx, tod: TimeOfDay) => void) => {
  const tod = timeOfDay(), k = `${key}|${tod.key}`;
  let cv = tiles.get(k);
  if (!cv) { cv = canvas(TILE_W, h); paint(cv.getContext('2d')!, tod); tiles.set(k, cv); }
  return cv;
};
/** A tile across the picture, slid `off` px (its bottom at y). */
const across = (c: Ctx, cv: HTMLCanvasElement, off: number, y: number) => {
  let x = -((((Math.round(off)) % TILE_W) + TILE_W) % TILE_W);
  for (; x < LW; x += TILE_W) c.drawImage(cv, x, Math.round(y - cv.height));
};
/** Something painted at tile x, again a tile over if it's cut off one edge. */
const wrap = (x: number, draw: (x: number) => void) => { draw(x); if (x < 80) draw(x + TILE_W); if (x > TILE_W - 80) draw(x - TILE_W); };
const far = (col: string, k: number, tod: TimeOfDay) => mix(farTint(col, 1, tod), skyAt(0.85, tod), k);

const paintClouds = (g: Ctx, tod: TimeOfDay) => {
  const body = cloudTint('#6A5A7E', tod), lit = cloudTint('#8A7896', tod), dk = cloudTint('#4E4262', tod);
  for (let i = 0; i < 6; i++) wrap(i * (TILE_W / 6) + hash(i * 3.1) * 30, x => {
    const y = 8 + hash(i * 1.7) * 22, w = 50 + hash(i * 2.3) * 50;
    pixelBlob(g, x, y + 4, w * 0.5, 4, dk, 1);
    pixelBlob(g, x - w * 0.1, y + 1, w * 0.4, 4, body, 1);
    pixelBlob(g, x - w * 0.18, y, w * 0.24, 3, lit, 1);
    box(g, x - w * 0.5, y + 6, w, 2, dk);
  });
};

const paintHills = (g: Ctx, tod: TimeOfDay) => {
  const H = 40;
  const body = far(hourMix('#2E2442', '#2E1F38', '#140E22', tod), 0.25, tod), rim = far(hourMix('#433660', '#45304E', '#221838', tod), 0.25, tod);
  const back = far(hourMix('#3A3052', '#3A2A44', '#1A1428', tod), 0.45, tod);
  for (let i = 0; i < 8; i++) wrap(i * (TILE_W / 8) + hash(i * 7.7) * 20, x => pixelBlob(g, x, 16 + hash(i) * 5, 40 + hash(i * 2) * 20, 10, back, 1));
  box(g, 0, 20, TILE_W, H - 20, back);
  for (let i = 0; i < 7; i++) wrap(i * (TILE_W / 7) + hash(i * 4.9) * 20, x => {
    const y = 22 + hash(i * 3.3) * 6, rw = 44 + hash(i * 5.1) * 22;
    pixelBlob(g, x, y + 6, rw, 9, body, 1);
    pixelBlob(g, x - rw * 0.25, y + 2, rw * 0.5, 3, rim, 1);
  });
  box(g, 0, 30, TILE_W, H - 30, body);
  // (dead trees standing up off their tops: a trunk, crooked limbs)
  for (let i = 0; i < 9; i++) wrap(i * (TILE_W / 9) + hash(i * 9.3) * 24, x => {
    const y = 24 + hash(i * 3.3) * 6, h = 7 + hash(i * 1.1) * 6;
    box(g, x, y - h, 1, h + 2, body);
    for (let k = 0; k < 2; k++) { const ly = y - h + 2 + k * 3, s = k % 2 ? 1 : -1; for (let j = 0; j < 3; j++) box(g, x + s * (j + 1), ly - (j >> 1), 1, 1, body); }
  });
  // (the ruined abbey on one, its windows pointed)
  wrap(300, x => { box(g, x, 12, 20, 14, body); box(g, x + 13, 6, 5, 20, body); for (let k = 0; k < 3; k++) box(g, x + 2 + k * 4, 15, 2, 5, back); });
};

const paintSkyline = (g: Ctx, tod: TimeOfDay) => {
  const H = 64, G = 54;
  const R = SLATE.map(c => far(hourMix(mix(c, '#4A3E66', 0.35), mix(c, '#4E3450', 0.3), c, tod), 0.18, tod));
  const win = hourMix('#4A4060', '#8A5A2A', '#C8923C', tod), dark = hourMix('#2A2238', '#2A1E2C', '#0E0A16', tod);
  const lit = tod.lamps;
  let x = 0, i = 0;
  while (x < TILE_W - 30) {
    const w = 22 + hash(i * 2.7) * 22, h = 16 + hash(i * 4.1) * 18, top = G - h, kind = hash(i * 6.3);
    const col = R[2 + (i % 2)], lt = R[4], dk = R[1];
    box(g, x, top, w, H - top, col); box(g, x, top, 1, H - top, lt); box(g, x + w - 2, top, 2, H - top, dk);
    if (kind < 0.6) {
      // (a steep gable, its bargeboard lit up its left slope, a finial)
      const gh = Math.min(w * 0.9, 20);
      g.fillStyle = col; g.beginPath(); g.moveTo(x - 1, top + 1); g.lineTo(x + w / 2, top - gh); g.lineTo(x + w + 1, top + 1); g.fill();
      for (let k = 0; k < gh; k++) box(g, x - 1 + (k / gh) * (w / 2 + 1), top - k, 1, 1, lt);
      box(g, Math.round(x + w / 2), top - gh - 3, 1, 3, dk);
    } else if (kind < 0.82) {
      // (a mansard, a dormer or two)
      g.fillStyle = dk; g.beginPath(); g.moveTo(x - 1, top + 1); g.lineTo(x + 3, top - 9); g.lineTo(x + w - 3, top - 9); g.lineTo(x + w + 1, top + 1); g.fill();
      for (let d = x + 4; d < x + w - 6; d += 9) { box(g, d, top - 7, 4, 5, col); box(g, d + 1, top - 5, 2, 3, lit > 0.3 && hash(d) > 0.5 ? win : dark); }
    } else {
      // (a church's spire, its belfry)
      const cx = Math.round(x + w / 2);
      box(g, cx - 4, top - 14, 8, 14, col); box(g, cx - 4, top - 14, 1, 14, lt); box(g, cx - 1, top - 11, 2, 5, dark);
      g.fillStyle = col; g.beginPath(); g.moveTo(cx - 5, top - 14); g.lineTo(cx, top - 44); g.lineTo(cx + 5, top - 14); g.fill();
      g.fillStyle = lt; g.beginPath(); g.moveTo(cx - 5, top - 14); g.lineTo(cx, top - 44); g.lineTo(cx - 2, top - 14); g.fill();
      box(g, cx, top - 49, 1, 5, dk); box(g, cx - 2, top - 47, 4, 1, dk);
    }
    if (hash(i * 3.9) > 0.4) { const cx = Math.round(x + w * (0.65 + hash(i) * 0.2)); box(g, cx, top - 10, 3, 10, dk); box(g, cx - 1, top - 11, 5, 2, col); }
    // (windows: rows of them; lit after dark, some)
    for (let wy = top + 4; wy < G + 4; wy += 8) for (let wx = x + 3; wx < x + w - 4; wx += 6) {
      const on = lit > 0.1 && hash(wx * 0.37 + wy * 0.91) > 0.6;
      box(g, wx, wy, 2, 4, on ? win : dark);
    }
    x += w + (hash(i * 5.5) > 0.7 ? 4 + hash(i) * 6 : -1);
    i++;
  }
  box(g, 0, G + 4, TILE_W, H - G - 4, R[1]);
  checker(g, 0, G + 2, TILE_W, 2, R[1], 0, 1);
};

/**
 * The town's sky and its far layers over the walk screen's own, under everything else: `pan` (picture px) slides the
 * far layers (parallax: hills least, the skyline most); `skyline` false leaves the roofs out (a street's walls cover
 * them anyway); `moonX` where the moon (and the sun) hang.
 */
export const drawTownSky = (c: Ctx, t: number, pan: number, o: { skyline?: boolean; skylineY?: number; moonX?: number; sunX?: number; under?: () => void } = {}) => {
  const tod = timeOfDay();
  c.drawImage(skyOfTown(tod), 0, 0);
  drawStars(c, 0, 0, LW, HOR - 10, t, 0, tod, 1);
  const mx = o.moonX ?? 330;
  drawMoon(c, mx, 18, 7, tod);
  // (the sun, by day: a small stepped disc, sinking with the hour; no glare)
  const s = sunAt(o.sunX ?? mx - 40, 16, HOR, tod);
  if (s.up > 0.05) {
    c.save(); c.globalAlpha = s.up;
    c.fillStyle = mix(s.glow, skyAt(0.3, tod), 0.6); c.beginPath(); c.arc(Math.round(s.x), Math.round(s.y), 10, 0, Math.PI * 2); c.fill();
    c.fillStyle = s.glow; c.beginPath(); c.arc(Math.round(s.x), Math.round(s.y), 7, 0, Math.PI * 2); c.fill();
    c.fillStyle = s.core; c.beginPath(); c.arc(Math.round(s.x), Math.round(s.y), 6, 0, Math.PI * 2); c.fill();
    c.fillStyle = mix(s.core, '#FFFFFF', 0.6); c.beginPath(); c.arc(Math.round(s.x - 1), Math.round(s.y - 1), 3, 0, Math.PI * 2); c.fill();
    c.restore();
  }
  across(c, tileOf('clouds', 40, paintClouds), pan * 0.05 + t * 0.04, 46);
  across(c, tileOf('hills', 40, paintHills), pan * 0.1, HOR + 2);
  o.under?.();
  if (o.skyline !== false) across(c, tileOf('skyline', 64, paintSkyline), pan * 0.3, o.skylineY ?? HOR + 4);
};

// ---------------------------------------------------------------------------------------------------------------
// The ELEVATOR TO HELL: the town's tower (sky.ts) to its own design, in its own units (the shaft 100 across, its foot
// at 0, the top of its shaft at T), each edge snapped to the picture's pixels at whatever scale it's drawn. Intact (the
// walk in), or wrecked (the walk-away: its spire snapped off, its face cracked and stopped, a corner gone, soot up it,
// its sign half dead, its track torn off at the top).

const T = -430;
/** The tower's canvas, in its units: x from -TX0, y from TY0 (up) to its foot. */
const TX0 = 74, TX1 = 92, TY0 = T - 44;

const towerCols = (tod: TimeOfDay) => {
  const H = (d: string, s: string, n: string) => hourMix(d, s, n, tod);
  return {
    body: H('#3A3058', '#3A2A48', '#1E1630'), lit: H('#544872', '#54405E', '#2E2448'), lit2: H('#6A5E8A', '#6A5272', '#3B2F58'),
    dk: H('#2A2242', '#2A1E36', '#140E22'), dk2: H('#1E1830', '#1E1428', '#0C0816'),
  };
};

/** Boxes and polygons in the tower's units, snapped, at (ox, oy) (its foot's middle) and `ts` picture px a unit. */
const towerPen = (c: Ctx, ox: number, oy: number, ts: number) => {
  const sx = (x: number) => Math.round(ox + x * ts), sy = (y: number) => Math.round(oy + y * ts);
  const R = (x: number, y: number, w: number, h: number, col: string) => {
    const a = sx(x), b = sy(y), e = sx(x + w), d = sy(y + h);
    if (e > a && d > b) { c.fillStyle = col; c.fillRect(a, b, e - a, d - b); }
  };
  /** At least a pixel, however small it comes out. */
  const D = (x: number, y: number, w: number, h: number, col: string) => {
    const a = sx(x), b = sy(y);
    c.fillStyle = col; c.fillRect(a, b, Math.max(1, sx(x + w) - a), Math.max(1, sy(y + h) - b));
  };
  const P = (pts: [number, number][], col: string) => {
    c.fillStyle = col; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(sx(x), sy(y)) : c.moveTo(sx(x), sy(y)))); c.closePath(); c.fill();
  };
  return { R, D, P };
};

/** The still parts of it, painted into its own canvas (its foot's middle at (TX0 * ts, -TY0 * ts)). */
const paintTower = (g: Ctx, ts: number, wrecked: boolean, tod: TimeOfDay) => {
  const { R, D, P } = towerPen(g, TX0 * ts, -TY0 * ts, ts);
  const { body, lit, lit2, dk, dk2 } = towerCols(tod);
  // The track up its right side (its rungs); wrecked, torn off the top and bent out
  const trackTop = wrecked ? T + 150 : T + 78;
  R(50, trackTop, 10, -trackTop, INK); R(51, trackTop + 2, 8, -trackTop - 2, '#18121F'); R(51, trackTop + 2, 2, -trackTop - 2, '#2E2440');
  for (let y = trackTop + 8; y < 0; y += 14) R(50, y, 10, 2, '#3F3550');
  if (wrecked) { P([[50, trackTop + 2], [60, trackTop + 2], [78, trackTop - 40], [70, trackTop - 44]], INK); P([[52, trackTop], [58, trackTop], [74, trackTop - 38], [70, trackTop - 40]], '#2E2440'); }
  // The shaft: inked, stepped across (lit at its left), coursed, quoins at its corners
  R(-52, T + 68, 104, -T - 68, INK);
  R(-50, T + 70, 100, -T - 70, body);
  R(-50, T + 70, 10, -T - 70, lit); R(-50, T + 70, 4, -T - 70, lit2);
  R(28, T + 70, 22, -T - 70, dk); R(42, T + 70, 8, -T - 70, dk2);
  for (let y = T + 84; y < 0; y += 16) R(-40, y, 68, 1, dk);
  for (let y = T + 76, k = 0; y < -6; y += 16, k++) { R(-50, y, k % 2 ? 10 : 16, 8, lit2); R(k % 2 ? 40 : 34, y, k % 2 ? 10 : 16, 8, dk); }
  // (slit windows up it: a lit one or two after dark; wrecked, blown out, a red glow in them)
  for (let k = 0; k < 4; k++) {
    const y = T + 230 + k * 50;
    R(-6, y, 12, 26, dk2); P([[-6, y], [0, y - 8], [6, y]], dk2);
    if (wrecked ? k % 2 === 0 : tod.lamps > 0.3 && k % 2) R(-4, y + 4, 8, 18, wrecked ? '#5A1414' : '#8A5A2A');
  }
  // The belfry ledge, the roof: stepped slate, lit up its left; the spire, its finial (wrecked: snapped off at the
  // third step, the stub jagged, the spire's top lying off the side)
  R(-62, T + 58, 124, 14, INK); R(-60, T + 60, 120, 10, lit); R(-60, T + 60, 120, 3, lit2); R(-60, T + 67, 120, 3, dk);
  const steps = wrecked ? 3 : 6;
  for (let i = 0; i < steps; i++) {
    const w = 88 - i * 14, y = T + 60 - (i + 1) * 10;
    R(-w / 2 - 1, y - 1, w + 2, 11, INK); R(-w / 2, y, w, 10, i % 2 ? body : dk); R(-w / 2, y, Math.max(2, w * 0.25), 10, lit); R(-w / 2, y, w, 2, lit2);
  }
  if (!wrecked) {
    R(-3, T - 30, 6, 32, INK); R(-2, T - 28, 3, 30, lit); R(1, T - 28, 1, 30, dk);
    R(-8, T - 22, 16, 2, dk); R(-5, T - 36, 10, 6, INK); R(-4, T - 35, 8, 4, '#8A6A2A');
  } else {
    // (the break: jagged, the beams inside it showing)
    const y = T + 30;
    P([[-30, y], [-20, y - 8], [-8, y - 2], [4, y - 12], [14, y - 4], [30, y], [30, y + 4], [-30, y + 4]], INK);
    R(-14, y - 4, 4, 6, '#3A2416'); R(8, y - 6, 4, 8, '#3A2416');
    // (the spire's top, snapped off, hanging down its right side on a twist of iron)
    P([[46, T + 26], [56, T + 30], [76, T + 70], [70, T + 74]], INK); P([[48, T + 28], [54, T + 31], [73, T + 69], [70, T + 71]], lit);
    R(44, T + 22, 6, 6, INK); R(45, T + 23, 4, 4, '#8A6A2A');
    // (a corner of the shaft gone, low on the left: the stone ragged, black inside)
    P([[-52, T + 300], [-36, T + 292], [-30, T + 316], [-40, T + 340], [-52, T + 346]], INK);
    P([[-50, T + 304], [-38, T + 298], [-34, T + 316], [-42, T + 336], [-50, T + 340]], '#0C0608');
    // (cracks up it, and soot stippled up from the foot and from the break)
    for (const [x0, y0, n] of [[-20, T + 170, 9], [24, T + 250, 7], [-30, T + 380, 5]] as const) { let x = x0, y = y0; for (let s = 0; s < n; s++) { D(x, y, 2, 8, INK); x += hash(x0 + s) > 0.5 ? 4 : -4; y += 8; } }
    for (let y = -60; y < 0; y += 6) for (let x = -50; x < 50; x += 8) if (hash(x * 0.3 + y) > 0.35) D(x + (y % 12 ? 4 : 0), y, 2, 2, dk2);
    for (let y = T + 34; y < T + 70; y += 6) for (let x = -44; x < 44; x += 8) if (hash(x * 0.7 + y) > 0.5) D(x, y, 2, 2, dk2);
  }
  // The clock: a dark frame, the face banded (lit at the top), the hours ticked
  R(-30, T + 84, 60, 60, INK); R(-28, T + 86, 56, 56, '#1A1424'); R(-28, T + 86, 56, 2, lit);
  R(-24, T + 90, 48, 48, '#CDB878'); R(-24, T + 90, 48, 14, '#D9C98A'); R(-24, T + 90, 48, 5, '#E6D8A0'); R(-24, T + 130, 48, 8, '#B8A266');
  // (the hours: at this size, just the quarters)
  for (let k = 0; k < 12; k += ts < 0.3 ? 3 : 1) { const a = (k / 12) * Math.PI * 2; D(Math.sin(a) * 19 - 1.5, T + 114 - Math.cos(a) * 19 - 1.5, 3, 3, '#3B2F58'); }
  if (wrecked) {
    // (stopped at ten to midnight: the hands; a shard gone from its top right corner, a crack running off it down
    // across the face)
    const hand = (a: number, len: number, w: number) => { for (let s = 0; s <= len; s += 2) D(Math.sin(a) * s - w / 2, T + 114 - Math.cos(a) * s - w / 2, w, w, '#1E1036'); };
    hand(-Math.PI / 3, 12, 5); hand(-Math.PI / 30, 19, 4);
    P([[12, T + 90], [24, T + 90], [24, T + 102]], '#0F0B18');
    let x = 16, y = T + 96;
    for (let s = 0; s < 7; s++) { D(x, y, 2, 2, INK); x -= 3; y += s % 2 ? 5 : 3; }
  }
  D(-2, T + 112, 4, 4, '#7F1D1D');
  // The ride's sign: the marquee bolted to its front (its devil horns, its border of bulbs, TO HELL big under
  // ELEVATOR); lit, dim (no glare). Wrecked: hanging off one bolt, a horn snapped, most of its bulbs dead.
  const glow = wrecked ? 0.25 : 0.6 + 0.4 * tod.lamps;
  const SL = -45, SR = 45, ST = T + 152, SB = T + 206;
  if (!wrecked) {
    P([[SL + 2, ST + 1], [SL - 3, ST - 12], [SL + 11, ST + 1]], INK); P([[SL + 4, ST], [SL - 1, ST - 9], [SL + 9, ST]], '#B91C1C');
    P([[SR - 2, ST + 1], [SR + 3, ST - 12], [SR - 11, ST + 1]], INK); P([[SR - 4, ST], [SR + 1, ST - 9], [SR - 9, ST]], '#B91C1C');
    R(SL - 2, ST - 2, SR - SL + 4, SB - ST + 4, INK);
    R(SL, ST, SR - SL, SB - ST, '#1A0606');
    R(SL + 4, ST + 4, SR - SL - 8, SB - ST - 8, mix('#3A0A0A', '#7F1D1D', glow));
    R(SL + 4, ST + 4, SR - SL - 8, 4, mix('#5A1010', '#B91C1C', glow));
    R(SL + 4, SB - 9, SR - SL - 8, 5, mix('#2A0606', '#5A1010', glow));
    // (the words, as their lit letters come out at this size: ELEVATOR small and gold, TO HELL big and pale)
    for (let k = 0; k < 8; k++) D(SL + 12 + k * 8.4, ST + 12, 5, 4, mix('#C8A050', '#FDE68A', glow));
    for (let k = 0; k < 7; k++) if (k !== 2) D(SL + 10 + k * 10.5, ST + 26, 7, 12, mix('#D8B0B0', '#FFF1F1', glow));
    for (let x = SL + 2; x <= SR - 2; x += 12) D(x - 1, ST + 1, 2, 2, mix('#C8A050', '#FDE68A', glow));
    for (let x = SL + 2; x <= SR - 2; x += 12) D(x - 1, SB - 3, 2, 2, mix('#C8A050', '#FDE68A', glow));
  } else {
    // (hanging off its left bolt: the board tipped, drawn as rows stepped down to the right)
    const tilt = 0.32;
    for (let y = ST - 2; y < SB + 2; y += 2) {
      const yy = y + 0;
      for (let x = SL - 2; x < SR + 2; x += 4) {
        const dy = (x - SL) * tilt, inner = x >= SL + 4 && x < SR - 4 && yy >= ST + 4 && yy < SB - 4, edge = x < SL || x >= SR || yy < ST || yy >= SB;
        R(x, yy + dy, 4, 2, edge ? INK : inner ? (yy < ST + 8 ? '#4A0E0E' : '#2E0808') : '#1A0606');
      }
    }
    P([[SL + 2, ST + 1], [SL - 3, ST - 12], [SL + 11, ST + 1]], INK); P([[SL + 4, ST], [SL - 1, ST - 9], [SL + 9, ST]], '#7F1D1D');
    // (a few letters still lit, dim)
    for (const k of [0, 1, 4, 6]) D(SL + 10 + k * 10.5, ST + 26 + (SL + 10 + k * 10.5 - SL) * tilt, 7, 10, '#A86060');
    D(SL + 20, ST + 12 + 10 * tilt, 5, 4, '#8A6A2A');
  }
};

const towerCache = new Map<string, HTMLCanvasElement>();
const towerOf = (ts: number, wrecked: boolean) => {
  const tod = timeOfDay(), key = `${ts}|${wrecked ? 1 : 0}|${tod.key}`;
  let cv = towerCache.get(key);
  if (!cv) {
    cv = canvas(Math.ceil((TX0 + TX1) * ts) + 2, Math.ceil(-TY0 * ts) + 2);
    paintTower(cv.getContext('2d')!, ts, wrecked, tod);
    towerCache.set(key, cv);
  }
  return cv;
};

/** The ride's timing (sky.ts's): up slow, a hold at the top, the drop, a rest (frames). */
const RIDE_UP = 420, RIDE_HOLD = 90, RIDE_DROP = 22, RIDE_REST = 120;

/** The tower intact, its foot's middle at (x, base), `ts` px a unit: the hands going round, the car going up the track
 *  and dropping. */
export const drawTowerIntact = (c: Ctx, x: number, base: number, ts: number, t: number) => {
  const cv = towerOf(ts, false);
  c.drawImage(cv, Math.round(x - TX0 * ts), Math.round(base + TY0 * ts));
  const { D } = towerPen(c, x, base, ts);
  const hand = (a: number, len: number, w: number) => { for (let s = 0; s <= len; s += 3) D(Math.sin(a) * s - w / 2, T + 114 - Math.cos(a) * s - w / 2, w, w, '#1E1036'); };
  const a = t * 0.002;
  hand(a, 18, 3); hand(a / 12, 12, 4);
  const cyc = RIDE_UP + RIDE_HOLD + RIDE_DROP + RIDE_REST, kk = t % cyc, lo = -30, hi = T + 90;
  const carY = kk < RIDE_UP ? lo - (lo - hi) * (kk / RIDE_UP) : kk < RIDE_UP + RIDE_HOLD ? hi : kk < RIDE_UP + RIDE_HOLD + RIDE_DROP ? hi + (lo - hi) * ((kk - RIDE_UP - RIDE_HOLD) / RIDE_DROP) ** 2 : lo;
  D(55, carY - 1, 24, 22, INK); D(56, carY, 22, 20, '#7F1D1D'); D(58, carY + 4, 18, 7, '#FDE68A');
};

/** The tower wrecked, its foot's middle at (x, base), leaning over to the right (each row of it shifted along: the
 *  SNES's raster shear, its pixels kept): `lean` px across per px up. Returns where a point of it (units) is now. */
export const drawTowerWrecked = (c: Ctx, x: number, base: number, ts: number, lean: number) => {
  const cv = towerOf(ts, true);
  const x0 = Math.round(x - TX0 * ts), y0 = Math.round(base + TY0 * ts), h = cv.height;
  for (let r = 0; r < h; r += 2) {
    const off = Math.round(lean * (h - r));
    c.drawImage(cv, 0, r, cv.width, 2, x0 + off, y0 + r, cv.width, 2);
  }
  return (ux: number, uy: number): [number, number] => [x + ux * ts + Math.round(lean * -uy * ts), base + uy * ts];
};
export const TOWER_TOP = T;

// ---------------------------------------------------------------------------------------------------------------
// The street's walls: the town's shopfronts in a strip, one for each side of the street

/** The strip's height (town px), and how far apart the shops stand (an alley between each). */
const STRIP_H = 500, GAP = 26;
type Slot = number | 'atm';
/** Each side's shops, in the order they come going away from the eye (SHOPS' indexes; the CRYPT-O ATM). */
export const LEFT_SIDE: Slot[] = [1, 3, 4, 5];
export const RIGHT_SIDE: Slot[] = [7, 'atm', 2, 0, 6];
const widthOf = (s: Slot) => (s === 'atm' ? 152 : SHOPS[s].w);
/** Where each shop starts along its side's strip (town px), and the strip's length. */
export const layoutOf = (slots: Slot[]) => {
  const at: number[] = [];
  let x = GAP / 2;
  for (const s of slots) { at.push(x); x += widthOf(s) + GAP; }
  return { at, len: x };
};

/** The alley between two shops: set back in the dark, a brick wall at the end of it, an iron gate across it. */
const paintAlley = (g: Ctx, x: number, w: number, tod: TimeOfDay) => {
  const top = STRIP_H - 170, d = (c: string) => mix(farTint(c, 0.5, tod), '#0A0812', 0.45);
  box(g, x, top, w, STRIP_H - top, d(STONE[1]));
  for (let y = top + 6, r = 0; y < STRIP_H; y += 8, r++) { box(g, x, y, w, 1, d(STONE[0])); for (let bx = x + (r % 2) * 6; bx < x + w; bx += 12) box(g, bx, y, 1, 8, d(STONE[0])); }
  box(g, x, top, w, 3, d(STONE[2]));
  // (the gate: bars, a rail, spikes)
  for (let bx = x + 3; bx < x + w - 1; bx += 5) { box(g, bx, STRIP_H - 70, 2, 70, INK); box(g, bx, STRIP_H - 70, 1, 70, IRON[3]); box(g, bx - 1, STRIP_H - 74, 4, 4, INK); }
  box(g, x, STRIP_H - 50, w, 3, INK); box(g, x, STRIP_H - 49, w, 1, IRON[4]);
};

const paintStrip = (g: Ctx, slots: Slot[]) => {
  const tod = timeOfDay(), { at, len } = layoutOf(slots);
  // (the alleys first, under the eaves either side)
  for (let k = 0; k <= slots.length; k++) { const x = k ? at[k - 1] + widthOf(slots[k - 1]) : 0, e = k < slots.length ? at[k] : len; paintAlley(g, x, e - x, tod); }
  slots.forEach((s, k) => {
    g.save();
    if (s === 'atm') { g.translate(at[k] + 76 - X(2240), STRIP_H - GY); paintGag(g, 1); }
    else { g.translate(at[k], STRIP_H); paintFront(g, SHOPS[s], s); }
    g.restore();
  });
};

interface Walls { key: string; lv: HTMLCanvasElement[][]; len: number }
const walls = new Map<string, Walls>();
const wallsOf = (side: number, look: Look, lookId: string) => {
  const key = `${timeOfDay().key}|${fontIn()}`, id = `${lookId}${side}`;
  let wv = walls.get(id);
  if (!wv || wv.key !== key) {
    const slots = side < 0 ? LEFT_SIDE : RIGHT_SIDE, { len } = layoutOf(slots);
    const w = Math.round(len), base = canvas(w, STRIP_H), g = base.getContext('2d')!;
    paintStrip(g, slots);
    const lit = canvas(w, STRIP_H), lg = lit.getContext('2d')!;
    lg.drawImage(base, 0, 0);
    lg.globalCompositeOperation = 'multiply'; lg.fillStyle = gradeOf(); lg.fillRect(0, 0, w, STRIP_H);
    lg.globalCompositeOperation = 'destination-in'; lg.drawImage(base, 0, 0);
    const lv: HTMLCanvasElement[][] = [];
    let cur = lit;
    for (;;) {
      const fogs = [cur];
      for (let f = 1; f <= 3; f++) {
        const cv = canvas(cur.width, cur.height), cg = cv.getContext('2d')!;
        cg.drawImage(cur, 0, 0);
        cg.globalCompositeOperation = 'source-atop'; cg.globalAlpha = 0.16 * f; cg.fillStyle = hazeOf(look); cg.fillRect(0, 0, cv.width, cv.height);
        fogs.push(cv);
      }
      lv.push(fogs);
      if (cur.width <= 1 && cur.height <= 1) break;
      const nx = canvas(Math.max(1, cur.width >> 1), Math.max(1, cur.height >> 1)), ng = nx.getContext('2d')!;
      ng.imageSmoothingEnabled = true; ng.imageSmoothingQuality = 'high';
      ng.drawImage(cur, 0, 0, nx.width, nx.height);
      cur = nx;
    }
    wv = { key, lv, len };
    walls.set(id, wv);
  }
  return wv;
};

export interface StreetView {
  /** Where the ground runs off to (picture x), his walk's sway. */
  vp: number; sway: number;
  /** The walls' lines across (meters from the eye: left, right), town px a meter. */
  xl: number; xr: number; ppm: number;
  /** Which distances (m) the walls are drawn between. */
  dMin: number; dMax: number;
  /** Where along the street (m: the strips' own) a point `d` m off is. */
  along: (d: number) => number;
}
/** The walls' height (m). */
export const wallH = (ppm: number) => STRIP_H / ppm;

/** The street's walls, a column at a time: each column's bit of wall at the distance it's at (standing on the ground,
 *  going by with it). */
export const drawStreetWalls = (c: Ctx, look: Look, lookId: string, v: StreetView) => {
  const vp = v.vp + v.sway, WH = wallH(v.ppm);
  for (const side of [-1, 1]) {
    const Xw = side < 0 ? v.xl : v.xr, ax = Math.abs(Xw), wv = wallsOf(side, look, lookId), top = wv.lv.length - 1, lenM = wv.len / v.ppm;
    const xa = side < 0 ? 0 : Math.max(0, Math.floor(vp)), xb = side < 0 ? Math.min(LW, Math.ceil(vp)) : LW;
    for (let x = xa; x < xb; x++) {
      const dx = x + 0.5 - vp;
      if (dx * Math.sign(Xw) < 0.2) continue;
      const d = (F * Xw) / dx;
      if (d > v.dMax || d < v.dMin) continue;
      const s = F / d, yF = Math.round(HOR + s * CAM_H), yT = Math.round(HOR - s * (WH - CAM_H));
      if (yF <= yT) continue;
      const z = v.along(d), um = (((side < 0 ? z : -z) % lenM) + lenM) % lenM;
      const tpc = ((d * d) / (F * ax)) * v.ppm;
      const l = Math.max(0, Math.min(top, Math.round(Math.log2(Math.max(1, tpc)))));
      const cv = wv.lv[l][fogAt(d * (x & 1 ? 1.05 : 0.95))];
      const ux = Math.min(cv.width - 1, Math.floor((um * v.ppm) / 2 ** l));
      c.drawImage(cv, ux, 0, 1, cv.height, x, yT, 1, yF - yT);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The town's furniture, as sprites: its gas lamps, its gate, each shop's hanging sign (the town's boards)

/** A gas lamp (the town's: FREE WI-FI or USB PORT on some), `ppm` town px a meter. */
export const lampProp = (sign: string, ppm: number, x = 0, z = 0, glow = false): Prop => {
  const lit = () => timeOfDay().lamps > 0.05;
  const p: Omit<Prop, 'id'> = { x, z, w: 140 / ppm, h: 204 / ppm, ppm: Math.min(ppm, 24), paint: shrunk(140, 204, g => { g.translate(70, 200); paintLamp(g, lit(), sign); }) };
  // (its glow after dark, drawn over it: dim, stepped, two rings)
  if (glow) p.live = (c, sx, sy, s) => {
    const k = timeOfDay().lamps;
    if (k <= 0.05) return;
    for (let r = 2; r >= 1; r--) { c.fillStyle = `rgba(255, 210, 122, ${(0.05 * k * (3 - r)).toFixed(3)})`; c.beginPath(); c.arc(Math.round(sx), Math.round(sy - s * (162 / ppm)), s * 0.5 * r, 0, Math.PI * 2); c.fill(); }
  };
  return worded(p, `sp-lamp-${sign}-${ppm}-`);
};
/** Its lantern's height (m), for its glow. */
export const lanternUp = (ppm: number) => 162 / ppm;

/** The gate in (the town's: stone pillars and their urns, the iron arch, WELCOME TO SPOOKY LAND). */
export const gateProp = (ppm: number, z: number, x = 0): Prop => {
  const W = 300, H = 262;
  return worded({ x, z, w: W / ppm, h: H / ppm, ppm: Math.min(ppm, 22), paint: shrunk(W, H, g => { g.translate(W / 2 - X(250), H - 2 - GY); paintGag(g, 0); }) }, `sp-gate-${ppm}-`);
};

/** A shop's front, standing on its own (the town's, facing the camera): `ppm` town px a meter, painted at `res`. */
export const shopProp = (i: number, ppm: number, res: number, x: number, z: number): Prop => {
  const s = SHOPS[i], gh = s.mansard ? 46 : Math.min(140, s.w * 0.42), W = s.w + 48, H = s.h + gh + 44;
  return worded({ x, z, w: W / ppm, h: H / ppm, ppm: res, paint: shrunk(W, H, g => { g.translate(24, H - 4); paintFront(g, s, i); }) }, `sp-shop-${i}-${ppm}-`);
};

/** A shop's sign hung out over the sidewalk on an iron bracket (the town's board), the wall at its `side`. */
export const bladeProp = (s: Slot, side: number, ppm: number): Prop => {
  const label = s === 'atm' ? 'CRYPT-O ATM' : SHOPS[s].sign.split(/ - | \(| &/)[0];
  const col = s === 'atm' ? '#0C4A6E' : '#1E1036', ink = s === 'atm' ? '#BAE6FD' : '#E9D5FF';
  const bw = Math.round(textW(null, label, 8) + 16);
  const W = bw + 24, H = 48;
  return worded({ x: 0, z: 0, w: W / ppm, h: H / ppm, ppm: Math.min(ppm, 24), paint: shrunk(W, H, g => {
    // (the bracket out of the wall, its scroll, the chains, the board)
    const wallX = side < 0 ? 0 : W - 2;
    box(g, 0, 2, W, 4, INK); box(g, 0, 3, W, 2, IRON[3]); box(g, 0, 3, W, 1, IRON[5]);
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(wallX, 22); g.quadraticCurveTo(wallX + (side < 0 ? 22 : -22), 20, wallX + (side < 0 ? 34 : -34), 5); g.stroke();
    g.strokeStyle = IRON[4]; g.lineWidth = 1; g.stroke();
    for (const cx of [W / 2 - bw / 2 + 8, W / 2 + bw / 2 - 8]) for (let y = 6; y < 16; y += 3) box(g, cx, y, 2, 2, IRON[4]);
    board(g, W / 2, 30, label, col, ink, 8);
  }) }, `sp-blade-${s}-${side}-${ppm}-`);
};

// ---------------------------------------------------------------------------------------------------------------
// The ground: the town's cobbles (street.ts's floor: rows of rounded blocks, each lit along its top, staggered),
// puddles with the sky in them, dead leaves

/** Cobbles over (x0..x1) of a ground tile `h` high (16 px a meter). */
export const cobbles = (g: Ctx, x0: number, x1: number, h: number, seed = 0) => {
  const C = COBBLE;
  box(g, x0, 0, x1 - x0, h, C[1]);
  for (let y = 0, row = 0; y < h; y += 4, row++) {
    for (let x = x0 - (row % 2) * 3; x < x1; x += 6) {
      const t = hash(seed + x * 0.37 + row * 11.3), col = C[t > 0.7 ? 2 : t > 0.25 ? 3 : 4];
      const a = Math.max(x0, x + 1), b = Math.min(x1, x + 6);
      if (b <= a) continue;
      box(g, a, y, b - a, 3, col);
      box(g, a, y, b - a, 1, C[t > 0.5 ? 5 : 4]);
      if (t < 0.15) box(g, a + 1, y + 1, 2, 1, C[2]);
    }
  }
};
/** Puddles (the sky in them) and dead leaves, strewn over (x0..x1). */
export const litter = (g: Ctx, x0: number, x1: number, h: number, n = 8) => {
  for (let i = 0; i < n; i++) {
    const x = x0 + hash(i * 5.3) * (x1 - x0), y = hash(i * 8.7) * h;
    g.fillStyle = '#1E1B33'; g.beginPath(); g.ellipse(Math.round(x), Math.round(y), 6 + hash(i) * 8, 2 + hash(i + 3) * 2, 0, 0, Math.PI * 2); g.fill();
    box(g, x - 3, y - 1, 6, 1, '#6E66A0');
  }
  const lc = ['#7C2D12', '#9A3412', '#713F12', '#4A3A1A'];
  for (let i = 0; i < (x1 - x0) * 0.5; i++) { const x = x0 + hash(i * 0.71 + 4) * (x1 - x0), y = hash(i * 1.93 + 2) * h; box(g, x, y, 2, 1, lc[i % 4]); if (i % 5 === 0) box(g, x + 1, y + 1, 1, 1, '#451A03'); }
};
