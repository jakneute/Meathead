// The walk into Adventure Land (portalWalk.ts): out of the portal and up the jungle path toward the bamboo gate (the
// carved board: ADVENTURE LAND, A REAL JUNGLE!), the jungle closing in either side, the canopy over the top, light
// coming down through the gaps in shafts, by whatever hour it is (timeOfDay.ts): the morning's gold-green, the sun low
// and red through the gap at the end of the path by sundown, moonbeams and fireflies after dark; a morpho by day.

import { type Ctx, type Prop, type PortalDef, INK, LW, HOR, box, hash, stipple, mix } from './kit';
import { checker } from '../intro/art/kit';
import { timeOfDay, hourMix, sunAt, drawStars, drawMoon } from '../timeOfDay';
import { noteSun } from '../sunFlare';
import { gateSign } from '../adventure/jungle/art/props';
import { SIGNS } from '../adventure/jungle/layout';
import { LEAF, BARK, MOSS, EARTH, clump, fern, bigLeaf, bark, roots } from '../adventure/jungle/art/paint';
import { snap2, wave, jag, range, mist, canopy, palm } from '../adventure/farArt';
import { farStrip } from './farStrip';
import { drawTeaseStrip } from './teases';

/** The jungle's own world pixels a meter, here (him: 70 px in the game; 2.4 m in this picture). */
const PPM = 29;
const GATE = SIGNS.find(s => s[4] === 'gate')!;
/** Where the gate is when he sets off (m). */
const GATE_Z = 17.5;

// ---------------------------------------------------------------------------------------------------------------
// The ground: loam, leaf litter, the path packed hard down the middle, roots across it

const ground = (g: Ctx, w: number, h: number) => {
  box(g, 0, 0, w, h, EARTH[3]);
  // (leaf litter: flecks of green, brown, rust)
  for (let i = 0; i < 1400; i++) box(g, hash(i * 1.37) * w, hash(i * 2.91) * h, 1 + (i % 4 === 0 ? 1 : 0), 1, [EARTH[2], EARTH[4], '#5A4A1C', '#3A4A18', '#6A3A18', EARTH[5]][i % 6]);
  // (the loam in soft patches: darker hollows, lighter humps, dithered at their edges)
  for (let i = 0; i < 40; i++) {
    const x = Math.round(hash(i * 6.1) * w), y = Math.round(hash(i * 8.3) * h), rw = 10 + Math.round(hash(i * 2.2) * 18), rh = 4 + Math.round(hash(i * 4.9) * 6);
    const col = i % 2 ? EARTH[2] : EARTH[4];
    box(g, x - rw, y - rh, rw * 2, rh * 2, col);
    for (let k = -rw; k < rw; k += 2) { box(g, x + k, y - rh - 2 + ((k >> 1) & 1), 1, 1, col); box(g, x + k + 1, y + rh + ((k >> 1) & 1), 1, 1, col); }
  }
  // (leaf litter: flecks of green, brown, rust)
  for (let i = 0; i < 1400; i++) box(g, hash(i * 1.37) * w, hash(i * 2.91) * h, 1 + (i % 4 === 0 ? 1 : 0), 1, [EARTH[2], EARTH[4], '#5A4A1C', '#3A4A18', '#6A3A18', EARTH[5]][i % 6]);
  // (fallen leaves, whole: a midrib, lit down one side)
  for (let i = 0; i < 70; i++) {
    const x = Math.round(hash(i * 9.7) * w), y = Math.round(hash(i * 3.9) * h), col = ['#6A4A1C', '#8A5A20', '#5A6A1C', '#7A3A18'][i % 4];
    if (Math.abs(x - w / 2) < 18) continue;
    box(g, x - 3, y, 7, 3, mix(col, '#000000', 0.35)); box(g, x - 2, y - 1, 5, 3, col); box(g, x - 2, y - 1, 2, 1, mix(col, '#FFFFFF', 0.3)); box(g, x - 3, y, 6, 1, mix(col, '#000000', 0.2));
  }
  // (low plants either side of the path: leafy clumps, each leaf dark at its foot, lit up and left, a shadow under;
  //  moss cushions)
  for (let i = 0; i < 90; i++) {
    const x = Math.round(hash(i * 3.1) * w), y = Math.round(hash(i * 7.7) * h);
    if (Math.abs(x - w / 2) < 30) continue;
    if (i % 3 === 2) {
      const mw = 6 + Math.round(hash(i) * 8);
      box(g, x - mw, y + 2, mw * 2, 2, EARTH[1]);
      box(g, x - mw, y - 2, mw * 2, 4, MOSS[1]); box(g, x - mw + 2, y - 4, mw * 2 - 4, 2, MOSS[2]);
      for (let k = -mw + 2; k < mw - 2; k += 2) if (hash(i + k) > 0.5) box(g, x + k, y - 4, 1, 1, MOSS[4]);
      continue;
    }
    const n = 4 + (i % 3);
    g.fillStyle = 'rgba(10, 8, 4, 0.45)'; g.beginPath(); g.ellipse(x + 2, y + 3, 9, 3, 0, 0, Math.PI * 2); g.fill();
    for (let k = 0; k < n; k++) {
      const a = -Math.PI * 0.95 + (k / (n - 1)) * Math.PI * 0.9, lx = Math.round(x + Math.cos(a) * 7), ly = Math.round(y + Math.sin(a) * 4);
      g.fillStyle = INK; g.beginPath(); g.ellipse(lx, ly, 4, 2.5, a, 0, Math.PI * 2); g.fill();
    }
    for (let k = 0; k < n; k++) {
      const a = -Math.PI * 0.95 + (k / (n - 1)) * Math.PI * 0.9, lx = Math.round(x + Math.cos(a) * 7), ly = Math.round(y + Math.sin(a) * 4);
      g.fillStyle = LEAF[2]; g.beginPath(); g.ellipse(lx, ly, 3, 1.6, a, 0, Math.PI * 2); g.fill();
      box(g, lx - 1, ly - 1, 2, 1, LEAF[4]); box(g, lx, ly + 1, 2, 1, LEAF[1]);
    }
    box(g, x - 1, y - 1, 2, 2, LEAF[5]);
  }
  // The path: packed dirt in steps (the edges darker, the worn middle lighter), dithered where they meet; its edges
  // ragged, the loam crumbled over them
  const P = ['#5E4630', '#6E553A', '#7A5E3E', '#856745', '#8F714C', '#9C7C54'];
  const cx = w / 2;
  box(g, cx - 24, 0, 48, h, P[1]); box(g, cx - 20, 0, 40, h, P[2]); box(g, cx - 14, 0, 28, h, P[3]); box(g, cx - 8, 0, 16, h, P[4]);
  for (let y = 0; y < h; y += 2) {
    const o = (y >> 1) & 1;
    for (const [ex, col] of [[cx - 21, P[1]], [cx + 19, P[1]], [cx - 15, P[2]], [cx + 13, P[2]], [cx - 9, P[3]], [cx + 7, P[3]]] as const) box(g, ex + o, y, 1, 1, col);
    box(g, cx - 26 + hash(y) * 4, y, 4, 2, EARTH[4]); box(g, cx + 22 + hash(y + 5) * 4, y, 4, 2, EARTH[4]);
    if (hash(y * 0.7) > 0.8) box(g, cx - 24 + hash(y * 1.3) * 3, y, 3, 1, EARTH[2]);
    if (hash(y * 0.9) > 0.8) box(g, cx + 21 + hash(y * 1.7) * 3, y, 3, 1, EARTH[2]);
  }
  // (the two ruts the carts wore: a shaded near wall, a lit far lip)
  for (const rx of [cx - 13, cx + 9]) { box(g, rx, 0, 4, h, P[1]); box(g, rx, 0, 1, h, P[0]); box(g, rx + 4, 0, 1, h, P[5]); }
  for (let i = 0; i < 200; i++) box(g, cx - 20 + hash(i * 5.3) * 40, hash(i * 9.1) * h, 1, 1, i % 3 ? P[5] : P[0]);
  // (pebbles: inked, lit on top)
  for (let i = 0; i < 26; i++) {
    const x = Math.round(cx - 22 + hash(i * 7.3) * 44), y = Math.round(hash(i * 5.1) * h), s = 2 + (i % 2);
    box(g, x - 1, y - 1, s + 2, s + 1, EARTH[0]); box(g, x, y - 1, s, s, '#8A8478'); box(g, x, y - 1, s, 1, '#C0B8A8');
  }
  // (footprints, boots and bare: the cast going to work; pressed in: the heel side shaded, the toe's rim lit)
  for (let i = 0; i < 26; i++) {
    const x = Math.round(cx - 12 + (i % 2) * 14 + hash(i) * 4), y = Math.round(hash(i * 4.4) * h);
    box(g, x, y, 4, 6, P[1]); box(g, x, y, 4, 1, P[0]); box(g, x, y + 6, 4, 1, P[5]);
    box(g, x + 1, y + 7, 2, 2, P[1]); box(g, x + 1, y + 7, 2, 1, P[0]); box(g, x + 1, y + 9, 2, 1, P[5]);
  }
  // Roots across it: inked under, the bark in steps, lit along the top, moss on the humps
  for (let i = 0; i < 4; i++) {
    const y = Math.round(hash(i * 13) * h), x0 = Math.round(w / 2 - 50 - hash(i) * 30), x1 = Math.round(w / 2 + 50 + hash(i + 2) * 30);
    for (let x = x0; x < x1; x += 2) {
      const yy = y + Math.round(Math.sin(x * 0.08 + i) * 2), th = 3 + (Math.abs(x - (x0 + x1) / 2) < 30 ? 1 : 0);
      box(g, x, yy + th, 2, 1, EARTH[0]); box(g, x, yy, 2, th, BARK[2]); box(g, x, yy + th - 1, 2, 1, BARK[1]); box(g, x, yy, 2, 1, BARK[4]);
      if (Math.sin(x * 0.08 + i) < -0.85) box(g, x, yy - 1, 2, 1, MOSS[3]);
    }
  }
  // (puddles in the ruts: an inked rim, the sky in them in bands, a glint)
  for (let i = 0; i < 3; i++) {
    const x = Math.round(cx - 14 + hash(i * 7) * 20), y = Math.round(hash(i * 17) * h);
    g.fillStyle = P[0]; g.beginPath(); g.ellipse(x, y, 8, 4, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#2E3A2A'; g.beginPath(); g.ellipse(x, y, 7, 3, 0, 0, Math.PI * 2); g.fill();
    box(g, x - 5, y - 1, 10, 1, '#4A5E4A'); box(g, x - 3, y - 2, 4, 1, '#6E8A74'); box(g, x + 2, y + 1, 2, 1, '#9AB49E'); box(g, x - 6, y + 3, 12, 1, P[5]);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The far jungle (a wall of it, the hour's colors), the sky through the gap at the end of the path, the canopy over

const back = (c: Ctx, t: number, sway: number) => {
  const tod = timeOfDay();
  const H = (day: string, sundown: string, night: string) => hourMix(day, sundown, night, tod);
  drawStars(c, 120, 0, 160, HOR - 10, t, 0, tod, 1);
  drawMoon(c, 236, 34, 6, tod);
  // The sun, through the gap at the end of the path: up over the canopy by day (glimpsed), low and red in the gap by
  // sundown (the lens catches it then: sunFlare.ts)
  const sp = sunAt(214 + sway * 0.1, -30, HOR - 4, tod);
  if (sp.up > 0.02) {
    const [gr, gg, gb] = [1, 3, 5].map(i => parseInt(tod.sunGlow.slice(i, i + 2), 16));
    c.save(); c.globalAlpha = sp.up;
    for (let i = 5; i >= 1; i--) { c.fillStyle = `rgba(${gr}, ${gg}, ${gb}, ${0.05 + (5 - i) * 0.03})`; c.beginPath(); c.arc(sp.x, sp.y, 12 + i * 7, 0, Math.PI * 2); c.fill(); }
    const disc = [mix(tod.sun, '#FFFFFF', 0.7), mix(tod.sun, '#FFFFFF', 0.3), tod.sun, mix(tod.sun, tod.sunGlow, 0.5)];
    for (let i = 0; i < disc.length; i++) { c.save(); c.beginPath(); c.rect(sp.x - 14, sp.y - 14 + i * 7, 28, 7); c.clip(); c.fillStyle = disc[i]; c.beginPath(); c.arc(sp.x, sp.y, 12, 0, Math.PI * 2); c.fill(); c.restore(); }
    c.restore();
  }
  // (low: in the open gap, its glare and the lens's ghosts; high, it's behind the leaves: a glimmer)
  const low = sp.y > 20;
  noteSun(c, sp.x, sp.y, low ? 1 : 0.35, low ? 0.8 : 0, 0.5);
  // Far off down the gap: the peaks past the jungle, in their mist (Adventure Land's far kit: farStrip.ts)
  c.drawImage(farStrip('pw-adv-peaks', SW, PEAKS_H, g => paintPeaks(g, H)), -MARGIN + Math.round(sway * 0.1), HOR + 1 - PEAKS_H);
  // (the neighbors past the park's edge, the land's own up ahead through the gap: the temple, the water tower, the cruise)
  drawTeaseStrip(c, 'adventure', 'far', sway);
  drawTeaseStrip(c, 'adventure', 'near', sway);
  // The far jungle: three walls of it, each nearer one darker and taller, a gap in the middle where the path goes;
  // each painted once for the hour (stepped crowns, palms up out of it, mist at its foot), slid by his sway
  WALLS.forEach((w, wi) => {
    const h = w.hgt + 28;
    c.drawImage(farStrip(`pw-adv-wall${wi}`, SW, h, g => paintWall(g, H, wi, h)), -MARGIN + Math.round(sway * w.par * 3), HOR + 2 - h);
  });
  // (mist lying in the gap, banded)
  const mist = mix(tod.haze, '#FFFFFF', 0.25);
  for (let i = 0; i < 3; i++) { c.fillStyle = stipple(c, mist, i % 2); c.fillRect(110 - i * 20, HOR - 8 + i * 3, 180 + i * 40, 2); }
  // The canopy: a ceiling of leaves across the top, hanging lower toward the sides, the gap over the path
  const leaf = [H(LEAF[0], '#140A16', '#03060C'), H(LEAF[1], '#22122A', '#060C18'), H(LEAF[2], '#3A1E34', '#0C1424'), H(LEAF[3], '#5A2E3E', '#16203A')];
  for (let layer = 0; layer < 3; layer++) {
    const jx = sway * (0.6 + layer * 0.4);
    c.fillStyle = leaf[layer];
    c.beginPath(); c.moveTo(0, 0);
    for (let x = 0; x <= LW; x += 2) {
      const dx = (x - 200 - jx) / 200;
      const drop = 6 + dx * dx * (60 - layer * 14) + 5 * Math.abs(Math.sin((x + jx) * 0.11 + layer * 2)) + 3 * Math.sin((x + jx) * 0.31 + layer + t * 0.01);
      c.lineTo(x, Math.round(drop - layer * 4));
    }
    c.lineTo(LW, 0); c.fill();
  }
  // (leaf edges along its underside catching the light from the gap)
  for (let x = 0; x < LW; x += 3) {
    const dx = (x - 200 - sway) / 200, y = Math.round(6 + dx * dx * 32 + 5 * Math.abs(Math.sin((x + sway) * 0.11 + 4)) - 8);
    if (hash(x * 0.71) > 0.45) box(c, x, y, 2, 1, leaf[3]);
  }
  // Vines hanging down out of it, swaying
  for (let i = 0; i < 9; i++) {
    const vx = ((i * 53 + 17) % LW), dx = (vx - 200) / 200;
    if (Math.abs(dx) < 0.18) continue;
    const top = Math.round(4 + dx * dx * 40), len = 20 + hash(i * 3.3) * 34;
    const swy = Math.sin(t * 0.02 + i) * 2;
    for (let y = 0; y < len; y += 2) { const xx = Math.round(vx + sway * 0.8 + swy * (y / len)); box(c, xx, top + y, 1, 2, leaf[1]); if (y % 8 === 4) box(c, xx - 1, top + y, 3, 1, leaf[2]); }
  }
};

/** The far strips: the picture's width and a margin either side (for the sway). */
const MARGIN = 30, SW = LW + MARGIN * 2, PEAKS_H = 40;
type Hour = (day: string, sundown: string, night: string) => string;
/** The jungle's three far walls: their color at each hour, how tall (picture px over the horizon), how fast they slide. */
const WALLS: { col: [string, string, string]; hgt: number; par: number }[] = [
  { col: ['#6C8E7A', '#7A4A5E', '#1A2238'], hgt: 18, par: 0.09 },
  { col: ['#4A6E4A', '#4E2E44', '#121A2C'], hgt: 30, par: 0.16 },
  { col: ['#2E4E2C', '#2E1C2E', '#0A1020'], hgt: 44, par: 0.28 },
];
const mistOf = (H: Hour) => mix(timeOfDay().haze, H('#DCECE4', '#E8A0A0', '#2A3058'), 0.5);

/** The peaks past the jungle, far off down the gap (twice the picture's size: farStrip.ts): a jagged range, its flanks
 *  lit and shaded, gullies down it, the jungle up its foot; deep in the mist. */
const paintPeaks = (g: Ctx, H: Hour) => {
  const tw = SW * 2, bottom = PEAKS_H * 2;
  const b = H('#8EAAB0', '#8A5272', '#222A4A'), lt = H('#E4F0EC', '#F4A880', '#4A5486');
  const yAt = (x: number) => snap2(30 + wave(x, tw, 2.4) * 16 + jag(x, tw, 8, 7) * 6);
  range(g, tw, yAt, bottom, { body: b, lit: mix(b, lt, 0.24), hi: mix(b, lt, 0.4), shade: mix(b, '#0A1418', 0.16), deep: mix(b, '#0A1418', 0.3) }, 17,
    { gullies: 20, d: 10, forest: [mix(H('#3E6E52', '#4A2A4A', '#141C34'), b, 0.4), mix(H('#5A8A60', '#6A3A5A', '#1C2440'), b, 0.4)], forestY: x => yAt(x) + 22 + wave(x, tw, 3.3, 3) * 6 });
  mist(g, tw, 10, bottom - 10, mistOf(H), 0.15, 0.7, 6);
};

/** One of the far jungle walls (twice the picture's size): palms standing up out of it (banded trunks, drooping
 *  fronds), the canopy in stepped crowns along its top (a second row in their shade), low brush in the gap where the
 *  path goes, mist along its foot. Its top as the old wall's was, so the gap's where it was. */
const paintWall = (g: Ctx, H: Hour, wi: number, h: number) => {
  const { col: [d, s, n], hgt } = WALLS[wi], tw = SW * 2;
  const col = H(d, s, n), litC = H('#B8D890', '#F2995A', '#3A4A74');
  const R = [mix(col, '#05080A', 0.3), col, mix(col, litC, 0.3), mix(col, litC, 0.55)];
  const r = 10 + wi * 2;
  const topOf = (X: number) => {
    const x = X / 2 - MARGIN, gap = Math.max(0, 1 - Math.abs(x - 200) / (40 + wi * 26));
    return hgt * (1 - gap * 0.85) + 6 * Math.abs(Math.sin(x * (0.05 + wi * 0.02) + wi)) + 4 * Math.abs(Math.sin(x * 0.017 + wi * 2));
  };
  // (the palms first, their feet down in it)
  for (let i = 0; i < 4; i++) {
    const px = (i * 97 + wi * 41) % LW;
    if (Math.abs(px - 200) < 60 + wi * 30) continue;
    palm(g, (px + MARGIN) * 2, 2 * (h - 2 - hgt) + 16, 2 * (14 + (i % 2) * 6) + 16, (i % 2 ? 1 : -1) * 4, [R[0], R[1]], [R[0], R[1], R[3]], wi * 10 + i);
  }
  canopy(g, tw, X => snap2(2 * (h - 2 - topOf(X)) + r * 0.4), h * 2, R, r, 5 + wi * 11);
  mist(g, tw, h * 2 - 24, 24, mistOf(H), 0, 0.45 - wi * 0.1, 3);
};

// ---------------------------------------------------------------------------------------------------------------
// Along the way: the trees either side (trunks, buttress roots, crowns up into the canopy), ferns and elephant ears at
// the path's edges, the gate ahead

const paintTree = (seed: number) => (g: Ctx, w: number, h: number) => {
  const tw = Math.round(w * (0.24 + hash(seed) * 0.08)), tx = Math.round(w / 2 - tw / 2), foot = h - 2;
  // (vines up it)
  bark(g, tx, h * 0.12, foot - 20, tw, seed);
  roots(g, tx, tw, foot, seed);
  for (let i = 0; i < 3; i++) { const vx = tx + 3 + hash(seed + i) * (tw - 6); for (let y = h * 0.2; y < foot - 30; y += 3) box(g, vx + Math.sin(y * 0.1 + i) * 2, y, 2, 3, MOSS[2 + (i % 2)]); }
  // (the crown, up into the canopy: lumps of it, the lower ones lit from under by the path's light)
  clump(g, w / 2, h * 0.1, w * 0.48, h * 0.1, seed + 3);
  clump(g, w * 0.3, h * 0.2, w * 0.3, h * 0.07, seed + 5, LEAF, 1);
  clump(g, w * 0.7, h * 0.17, w * 0.3, h * 0.07, seed + 7, LEAF, 1);
  // (a limb out over the path, a fern on it)
  if (hash(seed * 2.2) > 0.4) {
    // (inked, the bark in steps, lit along the top, moss along it, a knot)
    const ly = Math.round(h * 0.36), lx = Math.round(tx - w * 0.3), lw = Math.round(w * 0.3 + 4);
    box(g, lx - 1, ly - 1, lw + 1, 9, INK); box(g, lx, ly, lw, 7, BARK[3]); box(g, lx, ly + 4, lw, 3, BARK[1]); checker(g, lx, ly + 3, lw, 1, BARK[2]);
    box(g, lx, ly, lw, 1, BARK[5]); box(g, lx, ly + 1, lw, 1, BARK[4]);
    for (let x = lx; x < lx + lw; x += 3) if (hash(seed + x) > 0.45) box(g, x, ly - 1, 2 + (x % 2), 2, MOSS[3 + (x % 2)]);
    box(g, lx + Math.round(lw * 0.4), ly + 2, 3, 3, BARK[0]); box(g, lx + Math.round(lw * 0.4), ly + 2, 3, 1, BARK[4]);
    fern(g, tx - w * 0.18, ly, 18, seed + 9);
  }
};
const paintFern = (seed: number) => (g: Ctx, w: number, h: number) => fern(g, w / 2, h - 1, h * 0.95, seed, (hash(seed) - 0.5) * 0.3);
const paintEars = (seed: number) => (g: Ctx, w: number, h: number) => {
  for (let i = 0; i < 4; i++) bigLeaf(g, w / 2 + (i - 1.5) * w * 0.12, h - 2, h * (0.3 + hash(seed + i) * 0.12), -Math.PI / 2 + (i - 1.5) * 0.55, LEAF, 3);
};
const paintBush = (seed: number) => (g: Ctx, w: number, h: number) => clump(g, w / 2, h * 0.55, w * 0.48, h * 0.44, seed);
const paintGate = (g: Ctx, w: number, h: number) => gateSign(g, w / 2, h - 3, GATE[2], GATE[3]);

const props = (): Prop[] => {
  const out: Prop[] = [
    // (the gate: its posts either side of the path, the board hung over it)
    { id: 'pw-adv-gate', x: 0, z: GATE_Z, w: 300 / PPM, h: 200 / PPM, ppm: PPM, paint: paintGate },
  ];
  // The trees, either side, all the way up (the near ones framing it, going by out of the edges as he walks)
  const trees: [number, number][] = [[-4.2, 2.6], [4.6, 3.4], [-5.6, 7], [5.2, 8.6], [-4.6, 12.5], [6, 14], [-7.5, 18.5], [7, 20], [-5.4, 24], [5.6, 27], [-8, 31], [8, 34]];
  trees.forEach(([x, z], i) => out.push({ id: `pw-adv-tree${i % 5}`, x, z, w: 3.6, h: 13, ppm: 18, paint: paintTree(i % 5 + 1) }));
  // Ferns, elephant ears and bushes along the path's edges
  for (let i = 0; i < 18; i++) {
    const side = i % 2 ? 1 : -1, z = 1.8 + i * 1.6 + hash(i) * 0.8, x = side * (1.7 + hash(i * 3.1) * 1.2);
    const kind = i % 3;
    if (Math.abs(z - GATE_Z) < 0.8 && Math.abs(x) < 4) continue;
    out.push(kind === 0
      ? { id: `pw-adv-fern${i % 4}`, x, z, w: 1.6, h: 1.2, ppm: PPM, paint: paintFern(i % 4) }
      : kind === 1
        ? { id: `pw-adv-ears${i % 3}`, x: x + side * 0.4, z, w: 2, h: 1.7, ppm: PPM, paint: paintEars(i % 3) }
        : { id: `pw-adv-bush${i % 3}`, x: x + side * 0.8, z, w: 2.4, h: 1.6, ppm: 24, paint: paintBush(i % 3 + 11) });
  }
  return out;
};

// ---------------------------------------------------------------------------------------------------------------
// Over it all: the light coming down in shafts through the gaps (added, the SNES's color math), motes in them;
// fireflies after dark; a morpho going over by day

const front = (c: Ctx, t: number, sway: number) => {
  const tod = timeOfDay();
  const night = Math.min(1, tod.lamps * 1.4), day = 1 - night;
  const col = night > 0.5 ? '#6E8CC8' : tod.sunGlow;
  const [r, g, b] = [1, 3, 5].map(i => parseInt(col.slice(i, i + 2), 16));
  c.save();
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 5; i++) {
    const x0 = 70 + i * 66 + hash(i * 3.3) * 20 + sway * 0.7, wd = 8 + hash(i * 7.7) * 12, slant = -0.32;
    const k = (0.05 + 0.03 * Math.sin(t * 0.013 + i * 2)) * (0.45 + 0.55 * day);
    c.fillStyle = `rgba(${r}, ${g}, ${b}, ${k.toFixed(3)})`;
    const len = 150 + hash(i) * 50;
    c.beginPath(); c.moveTo(x0, 6); c.lineTo(x0 + wd, 6); c.lineTo(x0 + wd + slant * len * -1, 6 + len); c.lineTo(x0 + slant * len * -1, 6 + len); c.closePath(); c.fill();
    // (its core, stippled)
    c.globalAlpha = k * 0.9; c.fillStyle = stipple(c, col, i % 2);
    c.beginPath(); c.moveTo(x0 + wd * 0.3, 6); c.lineTo(x0 + wd * 0.7, 6); c.lineTo(x0 + wd * 0.7 - slant * len, 6 + len); c.lineTo(x0 + wd * 0.3 - slant * len, 6 + len); c.closePath(); c.fill();
    c.globalAlpha = 1;
    // (motes drifting in it)
    for (let m = 0; m < 3; m++) {
      const u = ((t * (0.003 + hash(i + m) * 0.002) + hash(i * 9 + m)) % 1), my = 10 + u * (len - 10);
      if ((t + m * 31 + i * 13) % 100 < 80) box(c, x0 + wd * hash(m + i * 2) - slant * my + Math.sin(t * 0.04 + m) * 2, 6 + my, 1, 1, `rgba(${r}, ${g}, ${b}, 0.6)`);
    }
  }
  c.restore();
  // Fireflies, after dark
  if (night > 0.05) for (let i = 0; i < 14; i++) {
    const fx = (hash(i * 4.1) * LW + Math.sin(t * 0.013 + i) * 14 + sway) % LW, fy = HOR - 10 + hash(i * 2.3) * 90 + Math.sin(t * 0.021 + i * 2) * 6;
    const on = (t + i * 37) % 120 < 50;
    if (!on) continue;
    c.fillStyle = `rgba(214, 255, 120, ${(0.5 * night).toFixed(2)})`; c.fillRect(Math.round(fx) - 1, Math.round(fy) - 1, 3, 3);
    box(c, fx, fy, 1, 1, '#F4FFB0');
  }
  // A morpho, by day: blue, flapping across over the path
  if (day > 0.5) {
    const u = (t % 420) / 420, mx = -10 + u * (LW + 20), my = 70 + Math.sin(u * 9) * 14 + Math.sin(t * 0.1) * 3;
    const flap = (t >> 2) % 2;
    box(c, mx - (flap ? 3 : 2), my - (flap ? 2 : 0), flap ? 3 : 2, flap ? 3 : 2, '#3B82F6');
    box(c, mx + 1, my - (flap ? 2 : 0), flap ? 3 : 2, flap ? 3 : 2, '#60A5FA');
    box(c, mx, my, 1, 2, INK);
  }
};

export const INTO_ADVENTURE: PortalDef = {
  land: 'JUNGLE LAND',
  lines: ['ANCIENT RUINS. HOSTILE WILDLIFE. SIGN THE WAIVER.', 'FIRST STOP: THE JUNGLE.'],
  haze: '#5E7A5A',
  ground, back, props, front,
  rim: () => hourMix('#E8F0A0', '#F59E0B', '#8AA4E0'),
};
