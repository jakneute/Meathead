// The walk-away from TUCKER THE TRAIN CONDUCTOR (Wilderness Land's boss): back out of the glade down the trail
// toward the camera, in the REAL woods past the park, at whatever hour it is now (timeOfDay.ts). Painted with the
// woods' own SNES kit (frontier/woods/paint.ts: the log ride's real ramps for the hour, its firs, spruce, gold aspens
// and snags) and their far off (frontier/woods/far.ts: the real sky's cumulus, the real Rockies with their snow, the
// ridge with the crew's clear-cut bitten out of it and the power line over it, the ragged pines).
//
// Underfoot: the forest floor (duff, needles, leaf litter turned gold, russet and brown, dry meadow grass in tufts),
// the trail's packed dirt down the middle with roots across it, pebbles, cones. Behind him, down the trail in the glade,
// THE OAK (arena/art.ts's own: russet and gold, its plates of bark) with the stolen dirt bike nosed into it, still
// smoking. Along the way the woods (every tree its own), bushes, the clear-cut's stumps, a felled log, granite, the
// Forest Service's YOU ARE IN GRIZZLY COUNTRY (the county's lion notice under it), the axe tree's stump with the axe
// still in it, and the small game his flintlock ball went through in the stampedes: flat on their backs, flies.
//
// And Tucker's leftovers, by how it went: the weakness (the lions): his cap left in the leaves, the pool where they tore
// him in two, the two drag marks off it through the leaves (furrows, blood, his bits dropped along them: a button, a
// glove, the watch), and the cats themselves at the tree line backing off into the woods with half of him each. Any
// other way (the grizzly): chunks of him everywhere (meat, the navy coat in rags with its brass, the vest and the
// watch, a boot still in its pinstriped leg, a glove, the spectacles, the ticket punch, a muttonchop), blood thrown about,
// the cap, the bear's bloody prints off toward it lumbering away with his leg. His toy: the FLINTLOCK (its act:
// walkAway/acts.ts, held up by his face in front of his head). The title's HEADING BACK TO PARK; after it he starts from
// the intro's parking lot and walks back in (arena/index.ts `leave`; intro/index.ts's walk back): unchanged.

import { type Ctx, type Prop, type SceneDef, HOR, LW, VP_X, box, hash, mix, smoke, flies } from './kit';
import { canvas } from './screen';
import { farStrip } from './farStrip';
import { timeOfDay, sunAt, drawStars, drawMoon, skyAt } from '../timeOfDay';
import { hazeBands, checker, bandedGradient } from '../../m1/game/render/pixelArt';
import { flintlock } from './toys';
import { INK } from '../frontier/kit';
import { paintClouds, paintPeaks, paintForestRidge, paintNearPines, CW, CH, RW, RH, FW, FH, NW, NH } from '../frontier/woods/far';
import { paintTree, treeBox, leafAt, bush, hr, type TreeKind, DUFF, GOLD, BROWN, DIRT, BARK, RINGS, STEEL, GRANITE, MOSS } from '../frontier/woods/paint';
import { paintOak, paintBearSign } from '../frontier/arena/art';
import { drawLion, drawGrizzly } from '../frontier/arena/beasts';
import { drawTuckerCap } from '../frontier/tucker';
import { drawDirtBike } from '../frontier/woods/teens';
import { TRUNK_W, TUCK_BIKE } from '../frontier/arena/layout';

/** The woods' figures' px a meter (the cats, the bear, the sign), and the trees'. */
const FIG = 60, TPPM = 55;
const RUSSET = ['#1E0804', '#3A1206', '#5C1E0A', '#80300E', '#A44616', '#C46224', '#DE843A', '#F2A85A'];
const STRAW = ['#1E1A0A', '#342C12', '#4E421C', '#6A5A28', '#887436', '#A69048', '#C4AE62', '#E0CC84'];
const BLOOD = ['#2A0404', '#4A0808', '#6E0E0E', '#921616', '#B82020', '#DC3A3A'];
/** Tucker's own: the navy coat, the burgundy vest, his pink, brass, the pinstripes, patent leather, ginger. */
const COAT = ['#0A0F22', '#1A2446', '#283662', '#36467E', '#5A6CA2'];
const VEST = ['#28080C', '#54161C', '#76222A', '#982F35', '#C25A58'];
const FLESH = ['#4A1010', '#7A2420', '#A8443A', '#D07462', '#F0A890', '#FFD0BC'];
const BRASS = ['#5A3A08', '#946414', '#C8921E', '#E8BC3A', '#FFE48A'];
const PIN = ['#2A2A30', '#46464E', '#64646C', '#82828A', '#A4A4AC'];
const BONE = ['#6E624A', '#9C9074', '#C4BA9C', '#E4DCC4', '#F8F2E2'];

/** Something painted at its own px (`paint`, its foot at (ox, oy) in a tw by th box), brought down to the sprite's
 *  size in one go (an even average, painted once: no crawl as it's scaled after). */
const shrunk = (tw: number, th: number, ox: number, oy: number, paint: (g: Ctx) => void) => (g: Ctx, w: number, h: number) => {
  const big = canvas(Math.ceil(tw), Math.ceil(th)), bg = big.getContext('2d')!;
  bg.translate(ox, oy); paint(bg);
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  g.drawImage(big, 0, 0, w, h);
};
const fontIn = () => (typeof document !== 'undefined' && document.fonts?.check('8px "Press Start 2P"') ? 'f' : 'n');
/** A prop `tw` by `th` of its own px (`ppm` a meter), its foot at (ox, oy) in that box. */
const sq = (id: string, x: number, z: number, tw: number, th: number, ox: number, oy: number, ppm: number, paint: (g: Ctx) => void, o: { res?: number; words?: boolean; wrap?: boolean } = {}): Prop => {
  const p: Omit<Prop, 'id'> = { x, z, w: tw / ppm, h: th / ppm, ppm: o.res ?? 24, paint: shrunk(tw, th, ox, oy, paint), wrap: o.wrap };
  return o.words ? Object.defineProperty({ ...p }, 'id', { get: () => `wa-tk-${id}-${fontIn()}`, enumerable: true }) as Prop : { id: `wa-tk-${id}`, ...p };
};
/** Something flat on the ground, painted straight at the sprite's size (w by h m, `ppm`). */
const flat = (id: string, x: number, z: number, w: number, h: number, ppm: number, paint: (g: Ctx, w: number, h: number) => void, o: Partial<Prop> = {}): Prop => ({ id: `wa-tk-${id}`, x, z, w, h, ppm, paint, ...o });

// ---------------------------------------------------------------------------------------------------------------
// The forest floor: duff, needles, the leaf litter, dry grass in tufts; the trail down the middle, roots across it

const ground = (g: Ctx, w: number, h: number) => {
  const D = DUFF, cx = w / 2;
  box(g, 0, 0, w, h, D[3]);
  for (let y = 0; y < h; y += 3) for (let x = (y / 3) % 2 ? 1 : 0; x < w; x += 3) {
    const t = hash(x * 0.53 + y * 1.91);
    if (t < 0.3) box(g, x, y, 2, 1, D[2]); else if (t < 0.42) box(g, x, y, 2, 1, D[4]); else if (t > 0.94) box(g, x, y, 1, 1, D[5]);
  }
  // (dry grass in tufts, the meadow coming in off the glade)
  for (let i = 0; i < 90; i++) {
    const x = hash(i * 3.7) * w, y = hash(i * 5.9) * h;
    if (Math.abs(x - cx) < 34) continue;
    box(g, x - 4, y, 9, 2, STRAW[2]);
    for (let k = 0; k < 5; k++) { box(g, x - 4 + k * 2, y - 2 - (k % 2), 1, 3, STRAW[4 + (k % 3)]); }
  }
  // (the leaf litter: turned leaves, stepped, every way up)
  const L = [GOLD, RUSSET, BROWN];
  for (let i = 0; i < 520; i++) {
    const x = hash(i * 1.37 + 2) * w, y = hash(i * 2.71 + 7) * h, R = L[i % 3], t = hash(i * 9.3);
    box(g, x, y, 2, 1, R[t > 0.6 ? 5 : t > 0.25 ? 4 : 3]); box(g, x + (t > 0.5 ? 1 : 0), y + 1, 1, 1, R[2]);
  }
  // (the trail: packed dirt, ragged at its edges, lighter up the crown, the leaves kicked to its sides)
  for (let y = 0; y < h; y++) {
    const l = Math.round(cx - 26 + (hash(Math.floor(y / 3) * 1.3) - 0.5) * 6), r = Math.round(cx + 26 + (hash(Math.floor(y / 3) * 2.9 + 3) - 0.5) * 6);
    box(g, l, y, r - l, 1, DIRT[3]); box(g, cx - 10, y, 20, 1, DIRT[4]);
    if (y % 2) box(g, cx - 12, y, 2, 1, DIRT[4]);
    box(g, l, y, 2, 1, DIRT[2]); box(g, r - 2, y, 2, 1, DIRT[2]);
    box(g, l - 1, y, 1, 1, GOLD[4]); box(g, r, y, 1, 1, RUSSET[4]);
  }
  checker(g, cx - 18, 0, 6, h, DIRT[2], 0, 1); checker(g, cx + 12, 0, 6, h, DIRT[2], 1, 1);
  // (roots across it: stepped, lit along their tops)
  for (let y = 20; y < h; y += 68) {
    const y0 = y + hash(y) * 10;
    for (let x = cx - 40; x < cx + 40; x += 2) { const yy = Math.round(y0 + Math.sin(x * 0.12 + y) * 2); box(g, x, yy, 2, 2, BARK[3]); box(g, x, yy, 2, 1, BARK[5]); box(g, x, yy + 2, 2, 1, BARK[1]); }
  }
  // (pebbles, cones, needles)
  for (let i = 0; i < 90; i++) { const x = cx - 24 + hash(i * 4.1) * 48, y = hash(i * 6.3) * h; box(g, x, y, 2, 1, GRANITE[6]); box(g, x, y + 1, 2, 1, GRANITE[3]); }
  for (let i = 0; i < 14; i++) { const x = hash(i * 8.8) * w, y = hash(i * 3.3) * h; box(g, x - 1, y - 1, 4, 6, INK); box(g, x, y, 2, 4, BARK[3]); box(g, x, y, 1, 4, BARK[5]); }
  for (let i = 0; i < 160; i++) box(g, hash(i * 2.2 + 9) * w, hash(i * 4.4 + 1) * h, 2, 1, BARK[hash(i) > 0.5 ? 5 : 2]);
};

// ---------------------------------------------------------------------------------------------------------------
// Far off: the woods' far layers (at a quarter of their screen size, painted at twice the picture's: farStrip.ts),
// the clouds drifting over; behind him in the glade the oak, the bike nosed into it

const SW = LW + 60, FAR_H = 84;
const paintFar = (g: Ctx) => {
  const tod = timeOfDay(), base = FAR_H * 4, span = SW * 4;
  const layer = (start: number, tw: number, y: number, paint: (g: Ctx) => void) => { for (let ox = start; ox < span; ox += tw) { g.save(); g.translate(ox, y); paint(g); g.restore(); } };
  g.save(); g.scale(0.5, 0.5);
  layer(-500, RW, base - RH - 56, g2 => paintPeaks(g2, tod));
  layer(-300, FW, base - FH - 14, g2 => paintForestRidge(g2, tod));
  layer(-60, NW, base - NH + 10, g2 => paintNearPines(g2, tod));
  g.restore();
};
const CLW = CW / 4, CLH = Math.round(CH / 4);
const paintCloudStrip = (g: Ctx) => { g.save(); g.scale(0.5, 0.5); paintClouds(g, timeOfDay()); g.restore(); };

/** The glade (twice the picture's size): the meadow gone to straw, the oak, the bike nosed into it. */
const GW = 170, GH = 84, OAK_K = 0.25, OAK_X = 170, BIKE_X = OAK_X + (-TRUNK_W - 28) * OAK_K;
const paintGlade = (g: Ctx) => {
  const tod = timeOfDay(), base = GH * 2 - 6, S = STRAW.map(col => mix(col, skyAt(0.9, tod), 0.12));
  // (the glade's grass, banded back into the haze, leaves blown across it)
  bandedGradient(g, 0, base - 10, GW * 2, 16, [S[4], S[3], S[3], S[2]], 4, 2);
  for (let i = 0; i < 80; i++) { const x = hash(i * 2.9) * GW * 2, y = base - 8 + hash(i * 4.3) * 12; box(g, x, y, 2, 2, [S[6], S[5], RUSSET[5], GOLD[5]][i % 4]); }
  // (the oak)
  g.save(); g.translate(OAK_X, base); g.scale(OAK_K, OAK_K); paintOak(g); g.restore();
  // (the bike, nosed into it on its tail: front wheel folded, gas in the leaves)
  g.fillStyle = '#1A1410'; g.beginPath(); g.ellipse(BIKE_X + 2, base + 1, 9, 1.6, 0, 0, Math.PI * 2); g.fill();
  g.save(); g.translate(BIKE_X, base - 1); g.rotate(-0.55); g.scale(OAK_K * 1.1, OAK_K * 1.1); drawDirtBike(g, 0, 0, 1, 1, 0, 0.6, TUCK_BIKE, 66); g.restore();
};

const back = (c: Ctx, t: number, sway: number) => {
  const tod = timeOfDay();
  drawStars(c, 0, 0, LW, HOR - 10, t, 0, tod, 1);
  drawMoon(c, 88, 16, 7, tod);
  // (the sun, by day: a small stepped disc, sinking with the hour)
  const s = sunAt(64, 22, HOR, tod);
  if (s.up > 0.05) {
    c.save(); c.globalAlpha = s.up;
    for (const [r, col] of [[12, mix(s.glow, skyAt(0.3, tod), 0.6)], [8, s.glow], [7, s.core], [3, mix(s.core, '#FFFFFF', 0.6)]] as const) { c.fillStyle = col; c.beginPath(); c.arc(Math.round(s.x - (r === 3 ? 1 : 0)), Math.round(s.y - (r === 3 ? 1 : 0)), r, 0, Math.PI * 2); c.fill(); }
    c.restore();
  }
  const cl = farStrip('wa-tk-clouds', CLW, CLH, paintCloudStrip), off = ((t * 0.025 + sway * 0.1) % CLW + CLW) % CLW;
  for (let x = -off; x < LW; x += CLW) c.drawImage(cl, Math.round(x), 0);
  c.drawImage(farStrip('wa-tk-far', SW, FAR_H, paintFar), -30 + Math.round(sway * 0.12), HOR + 2 - FAR_H);
  hazeBands(c, 0, HOR - 14, LW, 16, skyAt(0.92, tod), 0, 0.35, 4, 1);
  // (the glade, down the trail behind him: the oak, the bike's smoke going up off it)
  const gx = Math.round(VP_X + 18 - OAK_X / 2 + sway * 0.4), gy = HOR + 3 - GH;
  c.drawImage(farStrip(`wa-tk-glade-${fontIn()}`, GW, GH, paintGlade), gx, gy);
  smoke(c, gx + BIKE_X / 2 + 2, gy + GH - 9, 1.6, t, 3, { n: 6, rise: 0.04, drift: 0.02, size: 0.7, col: ['#3A3634', '#54504C', '#706A66', '#8E8884'] });
};

// ---------------------------------------------------------------------------------------------------------------
// The woods along the way

/** A tree of the woods' (paint.ts paintTree), `h` its height in its own px. */
const tree = (id: string, x: number, z: number, k: TreeKind, h: number, seed: number): Prop => {
  const [bx, by, bw, bh] = treeBox(k, h);
  return sq(`tree-${id}`, x, z, bw, bh, -bx, -by, TPPM, g => paintTree(g, k, seed, h), { res: 20 });
};
/** A bush (the woods' thicket clump). */
const paintBush = (seed: number) => (g: Ctx) => bush(g, 0, 0, 60, 40, seed);

/** A stump of the clear-cut's: sawn flat (its rings, the chainsaw's arcs), bark in steps, roots out into the duff. */
const paintStump = (axe: boolean) => (g: Ctx) => {
  const B = hr('bark', BARK, 0.2), Rg = hr('rings', RINGS, 0.2), S = hr('steel', STEEL, 0.2), w = 26, h = 26;
  for (const [dx, dir] of [[-w, -1], [w, 1], [-6, -1], [8, 1]] as const) { g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(dx * 0.7, -8); g.quadraticCurveTo(dx, -2, dx + dir * 12, 1); g.stroke(); g.strokeStyle = B[3]; g.lineWidth = 4; g.stroke(); g.strokeStyle = B[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(dx * 0.7 - 1, -9); g.quadraticCurveTo(dx - 1, -3, dx + dir * 12, -1); g.stroke(); }
  box(g, -w - 1, -h - 1, w * 2 + 2, h + 1, INK);
  box(g, -w, -h, w * 2, h, B[3]); box(g, -w, -h, 6, h, B[5]); box(g, w - 8, -h, 8, h, B[1]); checker(g, w - 12, -h, 4, h, B[2], 0, 1);
  for (let y = -h + 4; y < -2; y += 5) for (let x = -w + 4; x < w - 4; x += 7) box(g, x + ((y * 3) & 3), y, 3, 2, x < 0 ? B[6] : B[1]);
  // (the sawn top: an ellipse of rings, the chainsaw's arcs over it, sawdust)
  const top = (rx: number, ry: number, col: string) => { g.fillStyle = col; g.beginPath(); g.ellipse(0, -h, rx, ry, 0, 0, Math.PI * 2); g.fill(); };
  top(w + 1, 9, INK); top(w, 8, Rg[4]);
  for (let r = 4; r < w; r += 4) { g.strokeStyle = r % 8 ? Rg[2] : Rg[3]; g.lineWidth = 1; g.beginPath(); g.ellipse(1, -h + 0.5, r, r * 0.3, 0, 0, Math.PI * 2); g.stroke(); }
  top(2.4, 1.2, Rg[1]);
  for (let k = 0; k < 4; k++) { g.strokeStyle = Rg[5]; g.beginPath(); g.ellipse(-w * 0.9, -h + 2, w * 1.1 - k * 3, 6, 0, -0.6, 0.4); g.stroke(); }
  for (let i = 0; i < 16; i++) box(g, -w - 6 + hash(i * 3.1) * (w * 2 + 12), -2 + hash(i) * 3, 2, 1, Rg[5]);
  // (the axe still in it: the head bitten in, the handle up at a lean)
  if (axe) {
    g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(4, -h - 2); g.lineTo(26, -h - 44); g.stroke();
    g.strokeStyle = '#A07444'; g.lineWidth = 4; g.stroke(); g.strokeStyle = '#D8B080'; g.lineWidth = 1; g.beginPath(); g.moveTo(3, -h - 3); g.lineTo(25, -h - 45); g.stroke();
    g.fillStyle = INK; g.beginPath(); g.moveTo(-8, -h - 6); g.lineTo(8, -h - 8); g.lineTo(9, -h + 1); g.lineTo(-10, -h + 2); g.closePath(); g.fill();
    g.fillStyle = S[3]; g.beginPath(); g.moveTo(-7, -h - 5); g.lineTo(7, -h - 7); g.lineTo(8, -h); g.lineTo(-9, -h + 1); g.closePath(); g.fill();
    box(g, -7, -h - 5, 13, 1, S[6]); box(g, -8, -h - 1, 16, 1, '#ECE4D4');
  }
};

/** A felled log along the ground: bark in steps, the sawn end's rings, moss on its back, a fungus shelf. */
const paintLog = (g: Ctx) => {
  const B = hr('bark', BARK, 0.2), Rg = hr('rings', RINGS, 0.2), M = hr('moss', MOSS, 0.2), L = 180, r = 16;
  box(g, -L / 2, -r * 2 - 1, L, r * 2 + 2, INK);
  const rows: [number, string][] = [[0, B[5]], [3, B[4]], [9, B[3]], [20, B[2]], [27, B[1]]];
  rows.forEach(([y, col], i) => box(g, -L / 2, -r * 2 + y, L, (rows[i + 1]?.[0] ?? r * 2) - y, col));
  checker(g, -L / 2, -r * 2 + 8, L, 2, B[3], 0, 1);
  for (let x = -L / 2 + 4; x < L / 2 - 4; x += 6) box(g, x, -r * 2 + 6 + hash(x) * 18, 3, 2, hash(x * 3) > 0.5 ? B[1] : B[6]);
  for (let x = -L / 2 + 20; x < L / 2 - 30; x += 3) if (hash(x * 0.7) > 0.3) box(g, x, -r * 2 - 1 + hash(x) * 2, 3, 3, M[hash(x * 2) > 0.5 ? 5 : 4]);
  // (the sawn end, its rings)
  const end = (rx: number, ry: number, col: string) => { g.fillStyle = col; g.beginPath(); g.ellipse(L / 2, -r, rx, ry, 0, 0, Math.PI * 2); g.fill(); };
  end(7, r + 1, INK); end(6, r, Rg[4]); end(4.4, r - 4, Rg[3]); end(3, r - 8, Rg[4]); end(1.6, 3, Rg[1]);
  // (a shelf fungus)
  box(g, -20, -r - 4, 16, 5, INK); box(g, -19, -r - 3, 14, 3, '#D8B880'); box(g, -19, -r - 3, 14, 1, '#F4E2B8');
};

/** A granite boulder, real (lichen, moss in its foot). */
const paintRock = (g: Ctx) => {
  const Gr = hr('granite', GRANITE, 0.2), M = hr('moss', MOSS, 0.2), w = 44, h = 34;
  const path = (e: number) => { g.beginPath(); g.moveTo(-w - e, 1); g.quadraticCurveTo(-w - 4 - e, -h * 0.7, -w * 0.3, -h - e); g.quadraticCurveTo(w * 0.5, -h - 4 - e, w + e, 1); g.closePath(); };
  path(1.5); g.fillStyle = INK; g.fill();
  g.save(); path(0); g.clip();
  const bands = [Gr[6], Gr[5], Gr[4], Gr[4], Gr[3], Gr[2]];
  bands.forEach((col, i) => box(g, -w - 6, -h - 4 + (i * (h + 6)) / bands.length, w * 2 + 12, (h + 6) / bands.length + 1, col));
  box(g, w * 0.3, -h - 4, w, h + 6, Gr[2]); checker(g, w * 0.2, -h - 4, 6, h + 6, Gr[2], 0, 1);
  for (let i = 0; i < 18; i++) box(g, -w + hash(i * 2.3) * w * 2, -h + hash(i * 4.1) * h, 1, 1, i % 2 ? Gr[7] : Gr[1]);
  for (let i = 0; i < 6; i++) { const x = -w * 0.6 + hash(i * 6.1) * w, y = -h * 0.8 + hash(i * 1.9) * h * 0.5; box(g, x, y, 4, 3, '#8A9A6A'); box(g, x + 1, y, 2, 1, '#B8C498'); }
  for (let x = -w; x < w; x += 2) box(g, x, -4 - hash(x) * 4, 2, 6, M[hash(x * 3) > 0.5 ? 4 : 3]);
  g.restore();
};

/** The Forest Service's sign (arena/art.ts's own). */
const paintSign = (g: Ctx) => paintBearSign(g);

/** The small game his ball went through in the stampedes: flat on its back, legs up stiff, x'd eyes, its blood. */
const paintCritter = (k: 'rabbit' | 'turkey' | 'raccoon') => (g: Ctx, w: number, h: number) => {
  const cx = w / 2, by = h - 3;
  g.fillStyle = BLOOD[1]; g.beginPath(); g.ellipse(cx + 2, by + 1, w * 0.42, 2.2, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = BLOOD[3]; g.beginPath(); g.ellipse(cx, by + 0.5, w * 0.22, 1.2, 0, 0, Math.PI * 2); g.fill();
  const body = (k === 'rabbit' ? ['#3A3028', '#6A5C4C', '#9A8A74', '#C4B49C'] : k === 'turkey' ? ['#1E140C', '#3E2A18', '#6A4A2A', '#9A7444'] : ['#26262A', '#4A4A50', '#76767E', '#A6A6AE']);
  const bw = w * 0.34, bh = h * 0.3;
  // (the turkey's fan spread under it)
  if (k === 'turkey') for (let i = 0; i < 9; i++) { const a = Math.PI * (0.55 + i * 0.1); box(g, cx - w * 0.2 + Math.cos(a) * w * 0.26, by - 4 + Math.sin(a) * h * 0.4 - 2, 3, 6, i % 2 ? '#5A3A1A' : '#E8D8B0'); }
  // (the raccoon's ringed tail out the side)
  if (k === 'raccoon') for (let i = 0; i < 6; i++) box(g, cx + bw * 0.8 + i * 3, by - 4, 3, 4, i % 2 ? body[0] : body[3]);
  g.fillStyle = INK; g.beginPath(); g.ellipse(cx, by - bh, bw + 1, bh + 1, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = body[1]; g.beginPath(); g.ellipse(cx, by - bh, bw, bh, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = body[2]; g.beginPath(); g.ellipse(cx - bw * 0.15, by - bh * 1.2, bw * 0.7, bh * 0.6, 0, 0, Math.PI * 2); g.fill();
  box(g, cx - bw * 0.4, by - bh * 1.6, bw * 0.3, 1, body[3]);
  // (legs up stiff)
  for (const lx of [-0.5, -0.15, 0.2, 0.5]) { box(g, cx + lx * bw * 1.4 - 1, by - bh * 2 - h * 0.16, 3, h * 0.2, INK); box(g, cx + lx * bw * 1.4, by - bh * 2 - h * 0.15, 1, h * 0.18, k === 'turkey' ? '#C87A3A' : body[2]); }
  // (the head at the left: ears, a wattle, the mask; x'd eye, tongue)
  const hx = cx - bw - 3, hy = by - bh;
  g.fillStyle = INK; g.beginPath(); g.ellipse(hx, hy, 5, 4, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = k === 'turkey' ? '#6A8AB8' : body[2]; g.beginPath(); g.ellipse(hx, hy, 4, 3, 0, 0, Math.PI * 2); g.fill();
  if (k === 'rabbit') { box(g, hx - 8, hy - 2, 7, 2, INK); box(g, hx - 7, hy - 2, 5, 1, '#E8B8B0'); box(g, hx - 8, hy + 1, 6, 2, INK); }
  if (k === 'turkey') { box(g, hx - 1, hy + 2, 2, 4, '#C82020'); box(g, hx - 4, hy - 1, 2, 1, '#E8C060'); }
  if (k === 'raccoon') box(g, hx - 3, hy - 1, 6, 2, '#141414');
  box(g, hx - 1, hy - 1, 1, 1, '#F8F8F8'); box(g, hx + 1, hy - 1, 1, 1, '#F8F8F8'); box(g, hx, hy, 1, 1, '#F8F8F8');
  box(g, hx - 3, hy + 2, 2, 1, '#E86A8A');
};
const buzzing = (c: Ctx, sx: number, sy: number, s: number, t: number) => flies(c, sx, sy, s, t, 4, Math.round(sx));

// ---------------------------------------------------------------------------------------------------------------
// What's left of him

/** His cap in the leaves (tucker.ts's own), knocked over on its side, blood on its visor. */
const paintCap = (rot: number) => (g: Ctx, w: number, h: number) => {
  for (let i = 0; i < 6; i++) leafAt(g, hash(i * 3.3) * w, h - 2 + hash(i) * 2, 2, hash(i * 2) * 3, [GOLD, RUSSET, BROWN][i % 3]);
  drawTuckerCap(g, w / 2, h * 0.7, rot, w / 34);
  box(g, w * 0.66, h * 0.62, 3, 1, BLOOD[3]); box(g, w * 0.7, h * 0.66, 1, 2, BLOOD[2]);
};

/** A pool of his blood, stepped, thrown about, soaked into the leaves. */
const paintPool = (big: boolean) => (g: Ctx, w: number, h: number) => {
  const cx = w / 2, cy = h * 0.55;
  const el = (dx: number, dy: number, rx: number, ry: number, col: string) => { g.fillStyle = col; g.beginPath(); g.ellipse(cx + dx, cy + dy, rx, ry, 0, 0, Math.PI * 2); g.fill(); };
  el(0, 0, w * 0.46, h * 0.4, BLOOD[0]); el(-w * 0.04, -h * 0.04, w * 0.38, h * 0.32, BLOOD[1]); el(-w * 0.08, -h * 0.08, w * 0.24, h * 0.2, BLOOD[2]); el(-w * 0.12, -h * 0.12, w * 0.08, h * 0.08, BLOOD[4]);
  checker(g, cx - w * 0.38, cy, w * 0.76, 1, BLOOD[1], 0, 1);
  for (let i = 0; i < (big ? 18 : 8); i++) { const a = hash(i * 2.7) * Math.PI * 2, r = 0.5 + hash(i * 1.3) * 0.5; box(g, cx + Math.cos(a) * w * 0.5 * r, cy + Math.sin(a) * h * 0.45 * r, 2, 1, BLOOD[i % 2 ? 2 : 3]); }
  for (let i = 0; i < 5; i++) leafAt(g, cx - w * 0.3 + hash(i * 5.5) * w * 0.6, cy - h * 0.2 + hash(i * 1.1) * h * 0.4, 1.6, hash(i) * 3, [GOLD, RUSSET][i % 2].map(col => mix(col, BLOOD[2], 0.4)));
  box(g, cx - w * 0.1, cy - h * 0.18, Math.max(1, w * 0.06), 1, '#F06A6A');
};

/** A drag mark: the leaves shoved aside in two furrows, the dark earth showing, blood smeared down them. `dir`: the
 *  way it was dragged (to the right of the picture: +1). */
const paintDrag = (dir: number, seed: number) => (g: Ctx, w: number, h: number) => {
  g.save(); if (dir < 0) { g.translate(w, 0); g.scale(-1, 1); }
  for (let x = 0; x < w; x += 2) {
    const u = x / w, y = h * 0.5 + Math.sin(u * 3 + seed) * h * 0.12;
    // (the leaves heaped along the furrows' edges)
    box(g, x, y - h * 0.34, 2, 1, [GOLD[5], RUSSET[5], BROWN[4]][((Math.floor(x >> 1) % 3) + 3) % 3]);
    box(g, x, y + h * 0.3, 2, 1, [GOLD[4], RUSSET[4], BROWN[3]][((Math.floor(x >> 1) % 3) + 3) % 3]);
    // (the earth, dark, gouged)
    box(g, x, y - h * 0.24, 2, h * 0.18, DUFF[1]); box(g, x, y + h * 0.06, 2, h * 0.18, DUFF[1]);
    box(g, x, y - h * 0.24, 2, 1, DUFF[0]); box(g, x, y + h * 0.06, 2, 1, DUFF[0]);
    // (blood, thick at the start, thinning out, wet glints)
    if (hash(x * 0.37 + seed) < 1 - u * 0.6) box(g, x, y - h * 0.08, 2, Math.max(1, h * 0.18 * (1 - u * 0.5)), BLOOD[(x >> 2) % 3 + 1]);
    if (hash(x * 1.7 + seed) > 0.9) box(g, x, y - h * 0.06, 1, 1, BLOOD[5]);
  }
  g.restore();
};

/** A bear's print in blood (the pad, five toes, the claws out past them). */
const paintPaw = (g: Ctx, w: number, h: number) => {
  const cx = w / 2;
  g.fillStyle = BLOOD[2]; g.beginPath(); g.ellipse(cx, h * 0.68, w * 0.32, h * 0.26, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = BLOOD[1]; g.beginPath(); g.ellipse(cx + 1, h * 0.72, w * 0.22, h * 0.16, 0, 0, Math.PI * 2); g.fill();
  for (let k = 0; k < 5; k++) { const x = cx - w * 0.34 + k * w * 0.17; box(g, x - 1, h * 0.26 + Math.abs(k - 2) * 1.5, 3, 3, BLOOD[3]); box(g, x, h * 0.08 + Math.abs(k - 2) * 1.5, 1, 3, BLOOD[1]); }
};

/** The bits of him (painted at the sprite's own px). */
type Bit = 'meat' | 'coat' | 'vest' | 'boot' | 'glove' | 'specs' | 'punch' | 'chop' | 'button' | 'watch' | 'leg';
const paintBit = (k: Bit, seed: number) => (g: Ctx, w: number, h: number) => {
  const cx = w / 2, by = h - 2;
  // (the blood under every one)
  g.fillStyle = BLOOD[1]; g.beginPath(); g.ellipse(cx + 1, by, w * 0.44, Math.max(1.5, h * 0.12), 0, 0, Math.PI * 2); g.fill();
  const blob = (x: number, y: number, rx: number, ry: number, R: string[]) => {
    g.fillStyle = INK; g.beginPath(); g.ellipse(x, y, rx + 1, ry + 1, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = R[1]; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = R[2]; g.beginPath(); g.ellipse(x - rx * 0.15, y - ry * 0.15, rx * 0.75, ry * 0.7, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = R[3]; g.beginPath(); g.ellipse(x - rx * 0.3, y - ry * 0.35, rx * 0.4, ry * 0.35, 0, 0, Math.PI * 2); g.fill();
    box(g, x - rx * 0.45, y - ry * 0.55, Math.max(1, rx * 0.2), 1, R[R.length - 1]);
  };
  const rag = (pts: number[][], R: string[]) => {
    g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
    g.fillStyle = R[2]; g.fill(); g.strokeStyle = INK; g.lineWidth = 1; g.stroke();
    g.save(); g.clip(); box(g, 0, 0, w, h * 0.4, R[3]); box(g, 0, h * 0.7, w, h, R[1]); checker(g, 0, h * 0.4, w, 2, R[3], seed % 2, 1); g.restore();
  };
  switch (k) {
    case 'meat': {
      blob(cx, by - h * 0.32, w * 0.36, h * 0.3, FLESH);
      // (a bone out the end of it, its knuckle)
      box(g, cx + w * 0.22, by - h * 0.44, w * 0.26, 3, INK); box(g, cx + w * 0.22, by - h * 0.43, w * 0.25, 2, BONE[3]);
      g.fillStyle = INK; g.beginPath(); g.arc(cx + w * 0.46, by - h * 0.42, 3, 0, Math.PI * 2); g.fill(); g.fillStyle = BONE[4]; g.beginPath(); g.arc(cx + w * 0.46, by - h * 0.43, 2, 0, Math.PI * 2); g.fill();
      for (let i = 0; i < 4; i++) box(g, cx - w * 0.2 + i * 3, by - h * 0.5 + hash(seed + i) * 4, 2, 1, BLOOD[4]);
      return;
    }
    case 'coat': {
      rag([[w * 0.1, by - h * 0.3], [w * 0.3, by - h * 0.7], [w * 0.55, by - h * 0.6], [w * 0.75, by - h * 0.8], [w * 0.92, by - h * 0.4], [w * 0.8, by - 1], [w * 0.5, by - h * 0.15], [w * 0.2, by - 1]], COAT);
      box(g, w * 0.2, by - h * 0.32, w * 0.5, 1, BRASS[3]);
      for (const bx of [0.36, 0.58]) { box(g, w * bx - 1, by - h * 0.52, 4, 4, INK); box(g, w * bx, by - h * 0.51, 2, 2, BRASS[3]); box(g, w * bx, by - h * 0.51, 1, 1, BRASS[4]); }
      box(g, w * 0.7, by - h * 0.3, 3, 2, BLOOD[3]);
      return;
    }
    case 'vest': {
      rag([[w * 0.15, by - 1], [w * 0.1, by - h * 0.55], [w * 0.4, by - h * 0.8], [w * 0.7, by - h * 0.62], [w * 0.88, by - h * 0.2], [w * 0.6, by - 1]], VEST);
      // (the watch chain swagged across it, the watch)
      for (let i = 0; i < 10; i++) { const u = i / 9; box(g, w * (0.2 + u * 0.5), by - h * 0.45 + Math.sin(u * Math.PI) * h * 0.18, 1, 1, BRASS[i % 2 ? 3 : 4]); }
      g.fillStyle = INK; g.beginPath(); g.arc(w * 0.74, by - h * 0.3, 4.5, 0, Math.PI * 2); g.fill();
      g.fillStyle = BRASS[2]; g.beginPath(); g.arc(w * 0.74, by - h * 0.3, 3.6, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#F4EEE0'; g.beginPath(); g.arc(w * 0.74, by - h * 0.3, 2.4, 0, Math.PI * 2); g.fill();
      box(g, w * 0.74, by - h * 0.3 - 2, 1, 2, INK); box(g, w * 0.74, by - h * 0.3, 2, 1, INK);
      return;
    }
    case 'boot': case 'leg': {
      // (a boot, polished black, still in its pinstriped leg; the leg torn off ragged, its meat)
      const leg = k === 'leg';
      const lx0 = leg ? w * 0.08 : w * 0.3;
      box(g, lx0 - 1, by - h * 0.5, w * 0.5 - lx0 + w * 0.14 + 2, h * 0.32, INK); box(g, lx0, by - h * 0.48, w * 0.64 - lx0, h * 0.28, PIN[2]); box(g, lx0, by - h * 0.48, w * 0.64 - lx0, 2, PIN[3]);
      for (let x = lx0 + 3; x < w * 0.62; x += 4) box(g, x, by - h * 0.46, 1, h * 0.24, PIN[4]);
      blob(lx0, by - h * 0.34, 3, h * 0.16, FLESH); box(g, lx0 - 2, by - h * 0.36, 2, 2, BONE[3]);
      // (the boot)
      g.fillStyle = INK; g.beginPath(); g.moveTo(w * 0.6, by - h * 0.56); g.lineTo(w * 0.8, by - h * 0.56); g.lineTo(w * 0.82, by - h * 0.26); g.lineTo(w * 0.97, by - h * 0.18); g.lineTo(w * 0.97, by - 1); g.lineTo(w * 0.6, by - 1); g.closePath(); g.fill();
      box(g, w * 0.62, by - h * 0.53, w * 0.17, h * 0.5, '#1E1E24'); box(g, w * 0.79, by - h * 0.22, w * 0.16, h * 0.2, '#1E1E24');
      box(g, w * 0.63, by - h * 0.52, 2, h * 0.46, '#5A5A66'); box(g, w * 0.8, by - h * 0.2, w * 0.12, 1, '#C8C8D2');
      box(g, w * 0.6, by - 3, w * 0.37, 2, '#0A0A0E');
      return;
    }
    case 'glove': {
      blob(cx, by - h * 0.3, w * 0.24, h * 0.24, ['#8E8A84', '#C8C4BC', '#ECE8E0', '#FFFFFF']);
      for (let i = 0; i < 4; i++) { box(g, cx - w * 0.18 + i * w * 0.12, by - h * 0.78, w * 0.1, h * 0.36, INK); box(g, cx - w * 0.17 + i * w * 0.12, by - h * 0.76, w * 0.08, h * 0.34, '#ECE8E0'); }
      box(g, cx + w * 0.2, by - h * 0.44, w * 0.18, h * 0.12, INK); box(g, cx + w * 0.2, by - h * 0.42, w * 0.16, h * 0.08, '#ECE8E0');
      box(g, cx - 2, by - h * 0.34, 4, 3, BLOOD[3]); box(g, cx - w * 0.1, by - h * 0.7, 2, 3, BLOOD[2]);
      return;
    }
    case 'specs': {
      // (round wire spectacles, one lens cracked, an arm bent)
      for (const [lx, cracked] of [[cx - w * 0.2, false], [cx + w * 0.2, true]] as const) {
        g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(lx, by - h * 0.45, w * 0.16, 0, Math.PI * 2); g.stroke();
        g.strokeStyle = BRASS[3]; g.lineWidth = 1.2; g.stroke();
        g.fillStyle = 'rgba(200, 230, 245, 0.55)'; g.beginPath(); g.arc(lx, by - h * 0.45, w * 0.13, 0, Math.PI * 2); g.fill();
        box(g, lx - w * 0.08, by - h * 0.55, 2, 1, '#FFFFFF');
        if (cracked) { g.strokeStyle = '#F8FAFC'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(lx - w * 0.1, by - h * 0.6); g.lineTo(lx, by - h * 0.45); g.lineTo(lx + w * 0.08, by - h * 0.5); g.moveTo(lx, by - h * 0.45); g.lineTo(lx - w * 0.02, by - h * 0.3); g.stroke(); }
      }
      box(g, cx - w * 0.05, by - h * 0.5, w * 0.1, 1, BRASS[3]);
      g.strokeStyle = BRASS[2]; g.lineWidth = 1; g.beginPath(); g.moveTo(cx + w * 0.36, by - h * 0.45); g.lineTo(cx + w * 0.46, by - h * 0.2); g.lineTo(cx + w * 0.38, by - h * 0.1); g.stroke();
      return;
    }
    case 'punch': {
      // (the ticket punch: steel jaws, the grips, a punched ticket stuck in it)
      const S = STEEL;
      g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(w * 0.1, by - h * 0.3); g.lineTo(w * 0.7, by - h * 0.5); g.moveTo(w * 0.1, by - h * 0.15); g.lineTo(w * 0.7, by - h * 0.42); g.stroke();
      g.strokeStyle = S[4]; g.lineWidth = 2; g.stroke();
      box(g, w * 0.66, by - h * 0.62, w * 0.2, h * 0.3, INK); box(g, w * 0.67, by - h * 0.6, w * 0.18, h * 0.26, S[3]); box(g, w * 0.67, by - h * 0.6, w * 0.18, 1, S[6]);
      box(g, w * 0.78, by - h * 0.86, w * 0.18, h * 0.3, INK); box(g, w * 0.79, by - h * 0.84, w * 0.16, h * 0.26, '#F2E6C4'); box(g, w * 0.84, by - h * 0.76, 2, 2, INK);
      return;
    }
    case 'chop': {
      // (a ginger muttonchop, the skin still on it)
      blob(cx, by - h * 0.3, w * 0.3, h * 0.26, FLESH);
      for (let i = 0; i < 14; i++) { const x = cx - w * 0.3 + hash(seed + i) * w * 0.6, y = by - h * 0.62 + hash(seed + i * 3) * h * 0.4; box(g, x, y, 2, 3, ['#86441C', '#B4642E', '#DC8A4E', '#F6B884'][i % 4]); }
      return;
    }
    case 'button': {
      g.fillStyle = INK; g.beginPath(); g.arc(cx, by - h * 0.4, w * 0.3, 0, Math.PI * 2); g.fill();
      g.fillStyle = BRASS[2]; g.beginPath(); g.arc(cx, by - h * 0.4, w * 0.24, 0, Math.PI * 2); g.fill();
      g.fillStyle = BRASS[4]; g.beginPath(); g.arc(cx - 1, by - h * 0.45, w * 0.1, 0, Math.PI * 2); g.fill();
      return;
    }
    case 'watch': {
      for (let i = 0; i < 8; i++) box(g, w * 0.1 + i * w * 0.06, by - h * 0.3 + Math.sin(i) * 2, 1, 1, BRASS[i % 2 ? 2 : 4]);
      g.fillStyle = INK; g.beginPath(); g.arc(w * 0.68, by - h * 0.4, w * 0.22, 0, Math.PI * 2); g.fill();
      g.fillStyle = BRASS[2]; g.beginPath(); g.arc(w * 0.68, by - h * 0.4, w * 0.18, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#F4EEE0'; g.beginPath(); g.arc(w * 0.68, by - h * 0.4, w * 0.12, 0, Math.PI * 2); g.fill();
      box(g, w * 0.68, by - h * 0.55, 1, 3, INK); box(g, w * 0.68, by - h * 0.4, 2, 1, INK);
      box(g, w * 0.6, by - h * 0.5, 2, 1, '#FFFFFF');
      return;
    }
  }
};

/** One of the cats at the tree line, backing off into the woods with half of him. */
const lionLive = (dir: 1 | -1, carry: 'arm' | 'leg') => (c: Ctx, sx: number, sy: number, s: number, t: number) => {
  const k = s / FIG, slide = Math.min(2.6, t * 0.004) * s * dir;
  if (k < 0.04) return;
  c.save(); c.translate(Math.round(sx + slide), Math.round(sy)); c.scale(k, k);
  drawLion(c, 0, 0, -dir, t, 'drag', { carry, bloody: 1 });
  c.restore();
};
/** The grizzly lumbering off with his leg. */
const bearLive = (c: Ctx, sx: number, sy: number, s: number, t: number) => {
  const k = s / FIG, slide = -Math.min(3.2, t * 0.004) * s;
  if (k < 0.04) return;
  c.save(); c.translate(Math.round(sx + slide), Math.round(sy)); c.scale(k, k);
  drawGrizzly(c, 0, 0, -1, t, 'walk', { carry: 'leg', bloody: 1 });
  c.restore();
};

const props = (weakness: boolean): Prop[] => {
  const out: Prop[] = [];
  // ---- Tucker, by how it went
  if (weakness) {
    // (the cap, the pool where they tore him in two, the drag marks off it either way, his bits dropped along them,
    // the cats backing off into the trees with half of him each)
    out.push(flat('cap', 0.9, 3.0, 0.5, 0.32, 72, paintCap(-0.5)));
    out.push(flat('pool', 0.1, 4.3, 2.4, 0.5, 40, paintPool(true)));
    for (const [x, z, sd] of [[-2.2, 5.0, 1], [-4.6, 6.0, 2], [-7.0, 7.1, 3], [-9.4, 8.3, 4]] as const) out.push(flat(`drag-l${sd}`, x, z, 2.6, 0.5, 32, paintDrag(-1, sd)));
    for (const [x, z, sd] of [[1.6, 5.4, 5], [3.0, 7.2, 6], [4.4, 9.0, 7], [5.6, 10.8, 8]] as const) out.push(flat(`drag-r${sd}`, x, z, 2.2, 0.5, 32, paintDrag(1, sd)));
    out.push(flat('button', -3.2, 5.4, 0.16, 0.12, 80, paintBit('button', 1)));
    out.push(flat('glove', 2.4, 6.4, 0.34, 0.26, 72, paintBit('glove', 2)));
    out.push(flat('watch', -6.0, 6.6, 0.4, 0.2, 72, paintBit('watch', 3)));
    out.push(flat('specs', 0.6, 4.9, 0.34, 0.18, 80, paintBit('specs', 4)));
    out.push({ id: 'wa-tk-lion-l', x: -12, z: 10, w: 1, h: 1, live: lionLive(-1, 'arm') });
    out.push({ id: 'wa-tk-lion-r', x: 6.6, z: 13, w: 1, h: 1, live: lionLive(1, 'leg') });
  } else {
    // (chunks of him everywhere, blood thrown about, the cap; the bear's prints off toward it, lumbering off with his
    // leg)
    out.push(flat('cap', 1.1, 3.2, 0.5, 0.32, 72, paintCap(2.6)));
    out.push(flat('pool', 0.2, 4.6, 2.0, 0.45, 40, paintPool(true)));
    for (const [x, z, w, sd] of [[-2.6, 5.4, 1.2, 1], [2.6, 6.2, 1.0, 2], [-4.4, 7.4, 1.4, 3], [1.4, 8.4, 0.9, 4]] as const) out.push(flat(`splat${sd}`, x, z, w, 0.3, 40, paintPool(false)));
    const bits: [Bit, number, number, number, number][] = [
      ['meat', 1.8, 3.8, 0.42, 0.26], ['coat', -2.8, 4.6, 0.6, 0.34], ['vest', 2.9, 5.2, 0.5, 0.32], ['boot', -3.9, 6.2, 0.7, 0.3],
      ['glove', 0.9, 5.8, 0.34, 0.26], ['specs', 0.4, 3.9, 0.34, 0.18], ['punch', 3.6, 7.0, 0.4, 0.24], ['chop', -1.9, 6.9, 0.3, 0.2],
      ['meat', -5.2, 8.2, 0.4, 0.24], ['coat', 4.2, 8.6, 0.56, 0.3], ['meat', 2.2, 9.6, 0.38, 0.24], ['button', -0.8, 4.4, 0.16, 0.12],
    ];
    bits.forEach(([k, x, z, w, h], i) => out.push(flat(`bit-${k}-${i}`, x, z, w, h, 72, paintBit(k, i), k === 'meat' || k === 'boot' ? { live: buzzing } : {})));
    for (const [x, z, i] of [[-1.6, 5.0, 0], [-3.4, 6.6, 1], [-5.4, 8.2, 2], [-7.6, 9.8, 3], [-9.8, 11.4, 4]] as const) out.push(flat(`paw${i}`, x, z, 0.34, 0.22, 72, paintPaw));
    out.push({ id: 'wa-tk-bear', x: -13.5, z: 13, w: 1, h: 1, live: bearLive });
  }
  // ---- The woods: every tree its own, deepest first; the right side kept off the trail's end (the oak's there)
  const L: [number, number, TreeKind, number][] = [
    [-4.4, 2.2, 'fir', 360], [-6.2, 4.8, 'gold', 300], [-4.8, 8.6, 'spruce', 400], [-7.4, 11.0, 'snag', 340], [-5.0, 14.2, 'fir', 420],
    [-8.2, 16.4, 'gold', 320], [-5.6, 20.0, 'spruce', 380], [-7.8, 24.0, 'fir', 400], [-5.2, 28.0, 'aspen', 300], [-8.4, 32.0, 'fir', 440],
    [-6.0, 37.0, 'spruce', 400], [-9.6, 42.0, 'fir', 420], [-11.0, 6.4, 'fir', 420], [-12.0, 18.0, 'spruce', 440],
  ];
  const R: [number, number, TreeKind, number][] = [
    [5.0, 2.8, 'gold', 300], [7.0, 6.0, 'fir', 380], [5.6, 10.0, 'lean', 360], [8.2, 13.4, 'spruce', 420], [6.6, 17.0, 'gold', 320],
    [9.0, 21.0, 'fir', 400], [7.4, 26.0, 'snag', 320], [10.0, 31.0, 'spruce', 420], [11.0, 9.0, 'fir', 400],
  ];
  [...L, ...R].forEach(([x, z, k, h], i) => out.push(tree(`${i}`, x, z, k, h, 31 + i * 17)));
  // ---- Along the way: bushes, stumps (the axe still in one), the log, rocks, the Forest Service's sign
  for (const [x, z, sd] of [[-3.4, 3.6, 3], [3.6, 4.4, 5], [-3.6, 10.0, 7], [4.0, 12.0, 11], [-3.8, 17.0, 13], [3.8, 19.0, 17]] as const) out.push(sq(`bush${sd}`, x, z, 140, 90, 70, 84, TPPM, paintBush(sd), { res: 22 }));
  out.push(sq('stump-axe', 3.4, 7.4, 110, 100, 56, 92, FIG, paintStump(true), { res: 28 }));
  for (const [x, z] of [[-3.0, 12.6], [4.6, 15.6], [-4.2, 22.0]] as const) out.push(sq(`stump${x}`, x, z, 90, 50, 46, 44, FIG, paintStump(false), { res: 26 }));
  out.push(sq('log', -4.6, 13.4, 220, 50, 110, 44, FIG, paintLog, { res: 24 }));
  out.push(sq('rock1', 4.8, 5.6, 110, 50, 56, 46, FIG, paintRock, { res: 26 }));
  out.push(sq('rock2', -5.6, 18.6, 110, 50, 56, 46, FIG, paintRock, { res: 24 }));
  out.push(sq('sign', -3.4, 9.0, 140, 150, 70, 146, FIG, paintSign, { res: 30, words: true }));
  // ---- The small game his ball went through in the stampedes (strewn the whole way), leaves blown about
  const crit: ('rabbit' | 'turkey' | 'raccoon')[] = ['rabbit', 'turkey', 'raccoon'];
  for (let i = 0; i < 6; i++) {
    const side = i % 2 ? 1 : -1, k = crit[i % 3];
    out.push(flat(`crit-${k}`, side * (1.2 + hash(i * 3.7) * 1.8), 4 + hash(i * 5.3) * 26, k === 'turkey' ? 0.8 : 0.6, 0.4, 56, paintCritter(k), { live: buzzing, wrap: true }));
  }
  return out;
};

export const TUCKER: SceneDef = {
  land: 'WILDERNESS LAND',
  weapon: 'FLINTLOCK',
  title: 'HEADING BACK TO PARK',
  sky: ['#163E9C', '#2458B8', '#3E78CC', '#6C9CDC', '#A8C8E8', '#DCE6E8'],
  haze: '#DCE6E8',
  ground, back, props,
  drawWeapon: (c: Ctx, t: number) => flintlock(c, t),
  grip: [[-2, 2], [28, -10]],
  rim: '#F8D9A0',
  ripple: false,
};
