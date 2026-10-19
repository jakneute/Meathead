// The walk into Wilderness Land (portalWalk.ts): out of the portal and up the park's dirt trail to the land's gate,
// painted with the wilds' own SNES kit (frontier/wilds/paint.ts: its ramps, its fiberglass, its pines, its planks) and
// its own far off (frontier/wilds/far.ts: the big western sky's cumulus, the REAL Rockies a long way off, the park's
// painted mountain flats nearer, too blue, on their 2x4s, the two rows of pines with the lookout and the cell tower in
// its costume), all by the hour (timeOfDay.ts): the sun, the moon, the stars.
//
// Underfoot: the trail's packed dirt in steps, its wagon ruts lit along their lips, hoofprints, pebbles, needles, a road
// apple; the meadow either side in stepped tufts, wildflowers, the trail's edge ragged with a lit lip. A split-rail
// fence down both sides running off to the eye, its peeled posts going by. Dead ahead, THE GATE: two peeled-log pylons
// sunk in heaps of the park's fiberglass "rock" (seams, bolts, the white gelcoat where it's chipped, a hatch), the log
// crossbeam over the trail on knee braces with its end grain showing, rope lashings, wagon wheels bolted to the
// pylons, an elk rack up top; the land's sign HUNG off the beam on chains (two pine planks, the letters burned in: the
// park's alphabet), a lucky horseshoe either side; iron lanterns hung either end (lit after dark); the stockade run off
// both ways from it (painted on plywood: the sheets' seams, bolts, the raw ply where it stops and the 2x4 kicker
// holding it up). Along the way: the park's own signs (BEAR TRAPS, painted; SCENIC ROCKS, burned), an open bear trap,
// fiberglass boulders, a wagon wheel leant on the fence, a bear-proof trash can, a fake rock piping in birdsong, a hay
// bale with its pitchfork, lantern posts, pines. Through the gate: the trail on, more pines, a painted mountain flat
// with its bracing. No volcanoes. Timing, lines and skip unchanged (portalWalk.ts).

import { type Ctx, type Prop, type PortalDef, HOR, LW, F, CAM_H, ME_D, box, hash, mix } from './kit';
import { canvas } from './screen';
import { farStrip } from './farStrip';
import { timeOfDay, hourMix, sunAt, drawStars, drawMoon, skyAt } from '../timeOfDay';
import { hazeBands, checker } from '../../m1/game/render/pixelArt';
import { signText, signW } from '../signLetters';
import { burned, parkSign, INK } from '../frontier/kit';
import { post, part, pine, fiberglass, FIBER, STEEL, PLANK, PLY, NEEDLE, BARK, DIRT, GRASS, STONE, LIP } from '../frontier/wilds/paint';
import { paintClouds, paintRockies, paintFlats, paintPines1, paintPines2, CW, CH, TW, MH, PW, PH, RW1, RH1, RW2, RH2 } from '../frontier/wilds/far';

/** The land's px a meter (him: ~70 of them). */
const PPM = 38;
/** Where the gate is when he sets off (m), its pylons (world px off its middle). */
const GATE_Z = 17, GATE_HALF = 170;
/** The portal walk's: where the ground runs off to, where his path is (m across), how fast the camera comes on. */
const VP = LW / 2, PATH_X = (-52 * ME_D) / F, CAM_V = 0.02;
/** The split-rail fence down both sides (m across from his path), its posts' spacing (m). */
const FENCE_X = 7, FENCE_EVERY = 2.6;

const fontIn = () => (typeof document !== 'undefined' && document.fonts?.check('8px "Press Start 2P"') ? 'f' : 'n');
/** Something painted at the land's own px (`paint`, its foot at (ox, oy) in a tw by th box), brought down to the
 *  sprite's size in one go (an even average, painted once: no crawl as it's scaled after). */
const shrunk = (tw: number, th: number, ox: number, oy: number, paint: (g: Ctx) => void) => (g: Ctx, w: number, h: number) => {
  const big = canvas(Math.ceil(tw), Math.ceil(th)), bg = big.getContext('2d')!;
  bg.imageSmoothingEnabled = false;
  bg.translate(ox, oy); paint(bg);
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  g.drawImage(big, 0, 0, w, h);
};
/** A prop with words on it: its id carries whether the pixel font's in (or one painted in the fallback would stick). */
const worded = (p: Omit<Prop, 'id'>, id: string): Prop => Object.defineProperty({ ...p }, 'id', { get: () => id + fontIn(), enumerable: true }) as Prop;
/** A prop of the land's: `tw` by `th` of its px (at PPM a meter), its foot at (ox, oy) in that box. */
const sq = (id: string, x: number, z: number, tw: number, th: number, ox: number, oy: number, paint: (g: Ctx) => void, o: { res?: number; words?: boolean } = {}): Prop => {
  const p = { x, z, w: tw / PPM, h: th / PPM, ppm: o.res ?? 24, paint: shrunk(tw, th, ox, oy, paint) };
  return o.words ? worded(p, `pw-fr-${id}-`) : { id: `pw-fr-${id}`, ...p };
};

// ---------------------------------------------------------------------------------------------------------------
// The ground: the meadow in stepped tufts, the trail's packed dirt up the middle (its ruts, hoofprints, pebbles,
// needles), its edge ragged with the grass's lit lip

const ground = (g: Ctx, w: number, h: number) => {
  const G = GRASS, D = DIRT, cx = w / 2;
  box(g, 0, 0, w, h, G[3]);
  // (the meadow: tufts in steps, darker clumps, lit blades, clover, wildflowers)
  for (let y = 0; y < h; y += 4) for (let x = (y / 4) % 2 ? 2 : 0; x < w; x += 4) {
    const t = hash(x * 0.71 + y * 1.37);
    if (t < 0.22) box(g, x, y, 3, 2, G[2]);
    else if (t < 0.4) { box(g, x + 1, y, 1, 3, G[4]); box(g, x + 1, y, 1, 1, G[5]); }
    else if (t < 0.48) box(g, x, y + 1, 2, 2, G[1]);
    else if (t > 0.96) box(g, x + 1, y + 1, 1, 2, G[6]);
  }
  for (let i = 0; i < 40; i++) { const x = hash(i * 3.9) * w, y = hash(i * 7.3) * h; box(g, x - 3, y - 2, 7, 4, G[2]); box(g, x - 2, y - 2, 4, 1, G[4]); }
  const FL = ['#F8E048', '#E8E4F4', '#B07ADC', '#F07A3A'];
  for (let i = 0; i < 70; i++) { const x = hash(i * 1.9 + 4) * w, y = hash(i * 2.7 + 9) * h; if (Math.abs(x - cx) < 52) continue; box(g, x, y, 2, 1, FL[i % 4]); box(g, x, y + 1, 1, 1, G[1]); }
  // (the trail: ragged edges, row by row; its dirt banded lighter up the crown; the grass's lit lip along it)
  for (let y = 0; y < h; y++) {
    const l = Math.round(cx - 42 + (hash(Math.floor(y / 3) * 1.7) - 0.5) * 5), r = Math.round(cx + 42 + (hash(Math.floor(y / 3) * 2.3 + 5) - 0.5) * 5);
    box(g, l - 1, y, 1, 1, LIP[2]); box(g, r, y, 1, 1, LIP[1]);
    box(g, l, y, r - l, 1, D[4]);
    box(g, cx - 12, y, 24, 1, D[5]);
    if (y % 2) { box(g, cx - 14, y, 2, 1, D[5]); box(g, cx + 12, y + 0, 2, 1, D[4]); }
    box(g, l, y, 3, 1, D[3]); box(g, r - 3, y, 3, 1, D[3]);
  }
  // (the wagon ruts: dark troughs, lit along their far lips, dithered into the dirt)
  for (const rx of [cx - 25, cx + 19]) {
    box(g, rx, 0, 6, h, D[2]); box(g, rx + 1, 0, 4, h, D[3]); box(g, rx + 6, 0, 1, h, D[6]); box(g, rx - 1, 0, 1, h, D[1]);
    checker(g, rx + 1, 0, 4, h, D[2], 0, 1);
  }
  // (hoofprints up the crown: little stepped horseshoes)
  for (let y = 6; y < h; y += 22) for (const dx of [-6, 3]) {
    const x = cx + dx + (hash(y * 0.3 + dx) - 0.5) * 4, yy = y + (dx > 0 ? 11 : 0);
    box(g, x, yy, 4, 1, D[2]); box(g, x, yy, 1, 3, D[2]); box(g, x + 3, yy, 1, 3, D[2]); box(g, x + 1, yy + 1, 2, 1, D[6]);
  }
  // (pebbles, needles blown onto it, a pine cone, a road apple or two)
  for (let i = 0; i < 120; i++) {
    const x = cx - 40 + hash(i * 2.1 + 1) * 80, y = hash(i * 5.3 + 2) * h, t = hash(i * 9.1);
    if (t < 0.5) { box(g, x, y, 2, 1, STONE[5]); box(g, x, y + 1, 2, 1, STONE[2]); }
    else box(g, x, y, t > 0.8 ? 3 : 2, 1, BARK[t > 0.9 ? 5 : 3]);
  }
  for (let y = 70; y < h; y += 128) { const x = cx + 30; box(g, x - 1, y - 1, 5, 7, INK); box(g, x, y, 3, 5, BARK[3]); box(g, x, y, 1, 5, BARK[5]); box(g, x + 2, y + 1, 1, 1, BARK[1]); }
  for (let y = 30; y < h; y += 160) { const x = cx - 4; for (const [dx, dy] of [[0, 0], [3, 1], [1, 3], [4, 3]] as const) { box(g, x + dx - 1, y + dy - 1, 4, 3, D[1]); box(g, x + dx, y + dy, 2, 2, '#5A4020'); box(g, x + dx, y + dy, 1, 1, '#7A5A30'); } }
};

// ---------------------------------------------------------------------------------------------------------------
// The far off: the wilds' own layers (far.ts), at a quarter of their screen size (painted at twice the picture's,
// brought down to it: farStrip.ts), once for the hour; the clouds drifting over in their own strip

const SW = LW + 60, FAR_H = 82;
const paintFar = (g: Ctx) => {
  const tod = timeOfDay(), base = FAR_H * 4;
  const span = SW * 4, layer = (start: number, tw: number, y: number, paint: (g: Ctx) => void) => {
    for (let ox = start; ox < span; ox += tw) { g.save(); g.translate(ox, y); paint(g); g.restore(); }
  };
  g.save(); g.scale(0.5, 0.5);
  layer(-180, TW, base - MH - 74, g2 => paintRockies(g2, tod));
  layer(-420, PW, base - PH - 34, g2 => paintFlats(g2, tod));
  layer(-100, RW1, base - RH1 - 10, g2 => paintPines1(g2, tod));
  layer(-260, RW2, base - RH2 + 6, g2 => paintPines2(g2, tod));
  g.restore();
};
const CLW = CW / 4, CLH = Math.round(CH / 4);
const paintCloudStrip = (g: Ctx) => { g.save(); g.scale(0.5, 0.5); paintClouds(g, timeOfDay()); g.restore(); };

const back = (c: Ctx, t: number, sway: number) => {
  const tod = timeOfDay(), travel = CAM_V * t;
  drawStars(c, 0, 0, LW, HOR - 10, t, 0, tod, 1);
  drawMoon(c, 312, 18, 7, tod);
  // (the sun, by day: a small stepped disc, sinking with the hour)
  const s = sunAt(96, 18, HOR, tod);
  if (s.up > 0.05) {
    c.save(); c.globalAlpha = s.up;
    for (const [r, col] of [[12, mix(s.glow, skyAt(0.3, tod), 0.6)], [8, s.glow], [7, s.core], [3, mix(s.core, '#FFFFFF', 0.6)]] as const) { c.fillStyle = col; c.beginPath(); c.arc(Math.round(s.x - (r === 3 ? 1 : 0)), Math.round(s.y - (r === 3 ? 1 : 0)), r, 0, Math.PI * 2); c.fill(); }
    c.restore();
  }
  // (the big cumulus drifting over)
  const cl = farStrip('pw-fr-clouds', CLW, CLH, paintCloudStrip), off = ((t * 0.03 + sway * 0.1) % CLW + CLW) % CLW;
  for (let x = -off; x < LW; x += CLW) c.drawImage(cl, Math.round(x), 2);
  // (the Rockies, the park's flats, the pines)
  c.drawImage(farStrip(`pw-fr-far-${fontIn()}`, SW, FAR_H, paintFar), -30 + Math.round(sway * 0.15), HOR + 2 - FAR_H);
  hazeBands(c, 0, HOR - 12, LW, 14, skyAt(0.92, tod), 0, 0.4, 4, 1);

  // The split-rail fence down both sides: the rails running off to the eye (lit along their tops), the posts going by
  const P = PLANK, nearD = 0.9, ns = F / nearD, endD = GATE_Z - travel;
  const atD = (x: number, d: number, up: number) => ({ x: VP + sway + ((PATH_X + x) * F) / d, y: HOR + ((CAM_H - up) * F) / d, s: F / d });
  for (const side of [-1, 1]) {
    const fx = side * FENCE_X;
    for (const up of [0.42, 0.9]) {
      const a = atD(fx, nearD, up), b = atD(fx, Math.max(nearD + 0.1, endD), up), th = Math.max(1, 0.07 * ns), tb = Math.max(0.5, 0.07 * b.s);
      c.fillStyle = INK; c.beginPath(); c.moveTo(a.x, a.y - th - 1); c.lineTo(b.x, b.y - tb - 1); c.lineTo(b.x, b.y + tb + 1); c.lineTo(a.x, a.y + th + 1); c.closePath(); c.fill();
      c.fillStyle = P[3]; c.beginPath(); c.moveTo(a.x, a.y - th); c.lineTo(b.x, b.y - tb); c.lineTo(b.x, b.y + tb); c.lineTo(a.x, a.y + th); c.closePath(); c.fill();
      c.fillStyle = P[5]; c.beginPath(); c.moveTo(a.x, a.y - th); c.lineTo(b.x, b.y - tb); c.lineTo(b.x, b.y - tb * 0.2); c.lineTo(a.x, a.y - th * 0.2); c.closePath(); c.fill();
      c.fillStyle = P[1]; c.beginPath(); c.moveTo(a.x, a.y + th * 0.5); c.lineTo(b.x, b.y + tb * 0.5); c.lineTo(b.x, b.y + tb); c.lineTo(a.x, a.y + th); c.closePath(); c.fill();
    }
    // (the posts: peeled, lit down one side, a cap of shade, sunk in a tuft)
    const first = Math.floor(travel / FENCE_EVERY);
    for (let i = Math.floor((GATE_Z - 0.4) / FENCE_EVERY); i >= first; i--) {
      const d = i * FENCE_EVERY - travel;
      if (d < nearD) continue;
      const foot = atD(fx, d, 0), top = atD(fx, d, 1.12), pw = Math.max(1, Math.round(0.13 * foot.s));
      if (foot.y - top.y < 2) continue;
      box(c, foot.x - pw / 2 - 1, top.y - 1, pw + 2, foot.y - top.y + 1, INK);
      box(c, foot.x - pw / 2, top.y, pw, foot.y - top.y, P[3]);
      if (pw > 2) { box(c, foot.x - pw / 2, top.y, Math.max(1, pw * 0.3), foot.y - top.y, P[5]); box(c, foot.x + pw / 2 - Math.max(1, pw * 0.25), top.y, Math.max(1, pw * 0.25), foot.y - top.y, P[2]); }
      if (pw > 4) { box(c, foot.x - pw / 2, top.y, pw, Math.max(1, pw * 0.25), P[6]); for (let y = top.y + pw; y < foot.y - 2; y += pw * 1.5) box(c, foot.x - pw * 0.1, y, 1, Math.max(1, pw * 0.4), P[1]); }
      if (foot.s > 8) for (let k = 0; k < 3; k++) box(c, foot.x - pw + k * pw * 0.8, foot.y - foot.s * 0.12, 1, Math.max(1, foot.s * 0.12), GRASS[k ? 4 : 5]);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The gate

/** Peeled pine (the pylons, the beam), a stockade's bark, rope, bone, iron. */
const LOG = PLANK;
const PAL = ['#1E1008', '#3A2010', '#56321A', '#724626', '#8E5C34', '#AA7646', '#C69460'];
const ROPE = ['#2E2210', '#56441E', '#806A34', '#AA9050', '#CCB474', '#E8D69A'];
const BONE = ['#3E3424', '#6E624A', '#9C9074', '#C4BA9C', '#E4DCC4', '#F8F2E2'];

/** The stockade, painted on plywood, run off from the pylon (`s`: which way): pointed logs in their ramps, bark flecks,
 *  an iron band bolted across; the sheets' seams with their bolts; where it stops, the raw ply and the 2x4 kicker. */
const palisade = (g: Ctx, s: number) => {
  const a = GATE_HALF + 22, b = FENCE_X * PPM + 2, top = -184;
  const X = (x: number) => s * x;
  // (the kicker behind its far end: a 2x4 down to a sandbag)
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(X(b - 4), top + 50); g.lineTo(X(b + 30), 0); g.stroke();
  g.strokeStyle = PLY[2]; g.lineWidth = 4; g.stroke();
  g.strokeStyle = PLY[4]; g.lineWidth = 1; g.beginPath(); g.moveTo(X(b - 5), top + 50); g.lineTo(X(b + 29), 0); g.stroke();
  box(g, Math.min(X(b + 20), X(b + 44)), -9, 24, 9, INK); box(g, Math.min(X(b + 21), X(b + 43)), -8, 22, 8, '#7A6A50'); box(g, Math.min(X(b + 21), X(b + 43)), -8, 22, 3, '#9C8C6E');
  // (the logs)
  for (let x = a, i = 0; x < b; x += 18, i++) {
    const lw = Math.min(18, b - x), pt = top + (hash(i * 3.1 + s) - 0.5) * 10, l = s > 0 ? x : -x - lw;
    box(g, l - 1, pt - 1, lw + 2, -pt + 1, INK);
    box(g, l, pt, lw, -pt, PAL[3]);
    box(g, l, pt, 3, -pt, PAL[5]); box(g, l + 1, pt, 1, -pt, PAL[6]); box(g, l + lw - 4, pt, 4, -pt, PAL[2]); box(g, l + lw - 1, pt, 1, -pt, PAL[1]);
    checker(g, l + lw - 7, pt, 3, -pt, PAL[2], i % 2, 1);
    for (let y = pt + 8; y < -6; y += 9) box(g, l + 4 + hash(i * 7 + y) * (lw - 8), y, 2, 3, hash(y + i) > 0.5 ? PAL[1] : PAL[5]);
    // (its point)
    g.fillStyle = INK; g.beginPath(); g.moveTo(l - 1, pt); g.lineTo(l + lw / 2, pt - 13); g.lineTo(l + lw + 1, pt); g.closePath(); g.fill();
    g.fillStyle = PAL[4]; g.beginPath(); g.moveTo(l, pt); g.lineTo(l + lw / 2, pt - 11); g.lineTo(l + lw, pt); g.closePath(); g.fill();
    g.fillStyle = PAL[6]; g.beginPath(); g.moveTo(l + 1, pt); g.lineTo(l + lw / 2, pt - 10); g.lineTo(l + lw / 2, pt); g.closePath(); g.fill();
  }
  // (the iron band across, bolted)
  const ba = s > 0 ? a : -b, bw = b - a;
  for (const by of [-128, -46]) {
    box(g, ba, by - 1, bw, 8, INK); box(g, ba, by, bw, 6, STEEL[2]); box(g, ba, by, bw, 1, STEEL[4]);
    for (let x = ba + 9; x < ba + bw - 4; x += 18) { box(g, x, by + 2, 2, 2, STEEL[5]); box(g, x + 1, by + 3, 1, 1, STEEL[0]); }
  }
  // (the plywood's seams: straight through the logs, every sheet)
  for (let x = a + 64; x < b - 6; x += 96) { const sx = s > 0 ? x : -x; box(g, sx, top - 4, 1, -top + 4, PAL[0]); box(g, sx + 1, top - 4, 1, -top + 4, PAL[5]); for (let y = top + 18; y < -8; y += 40) { box(g, sx - 1, y, 3, 3, STEEL[1]); box(g, sx, y, 1, 1, STEEL[6]); } }
  // (the raw ply where the sheet stops: its edge, the layers)
  const ex = s > 0 ? b - 3 : -b;
  box(g, ex, top - 14, 3, -top + 14, PLY[4]); box(g, ex + (s > 0 ? 2 : 0), top - 14, 1, -top + 14, PLY[1]);
  for (let y = top - 10; y < 0; y += 6) box(g, ex, y, 3, 1, PLY[2]);
  // (grass along its foot)
  for (let x = a; x < b; x += 3) box(g, s > 0 ? x : -x, -3 - hash(x * 0.37) * 4, 1, 4, GRASS[hash(x) > 0.5 ? 5 : 3]);
};

/** A heap of the park's fiberglass "rock" round a pylon's foot: lumps in steps, seams, bolts, a chip, a hatch on one. */
const rockPile = (g: Ctx, x: number, s: number) => {
  const lumps: [number, number, number, number][] = [[-44, -26, 40, 30], [42, -24, 38, 28], [0, -48, 46, 50], [-22, -10, 34, 14], [28, -10, 32, 14]];
  lumps.forEach(([dx, dy, rx, ry], i) => {
    const cx = x + dx * s, path = () => g.ellipse(cx, dy, rx, ry, 0, Math.PI, 0);
    part(g, () => { path(); g.lineTo(cx - rx, 2); g.lineTo(cx + rx, 2); g.closePath(); }, FIBER, cx - rx, dy - ry, rx * 2, ry + 2, 1.5);
    g.save(); g.beginPath(); path(); g.lineTo(cx - rx, 2); g.lineTo(cx + rx, 2); g.closePath(); g.clip();
    fiberglass(g, cx - rx, dy - ry, rx * 2, ry + 2, FIBER, i * 7 + (s > 0 ? 3 : 0), false);
    g.restore();
    g.beginPath(); path(); g.strokeStyle = INK; g.lineWidth = 1.5; g.stroke();
  });
  // (the seam down the big one, its bolts; a chip showing the white gelcoat)
  box(g, x - 2, -94, 1, 90, FIBER[1]); box(g, x - 1, -94, 1, 90, FIBER[5]);
  for (const by of [-80, -50, -22]) { box(g, x - 4, by, 5, 5, STEEL[1]); box(g, x - 3, by, 3, 3, STEEL[4]); box(g, x - 3, by, 1, 1, STEEL[6]); }
  box(g, x + 22 * s, -30, 8, 4, '#E8E2D2'); box(g, x + 23 * s, -26, 6, 1, FIBER[1]);
  // (the hatch on the left one: a square door in the rock, hinges, a padlock)
  if (s < 0) {
    const hx = x - 70, hy = -40;
    box(g, hx - 1, hy - 1, 20, 22, INK); box(g, hx, hy, 18, 20, FIBER[2]); box(g, hx, hy, 18, 2, FIBER[4]); box(g, hx + 16, hy, 2, 20, FIBER[1]);
    for (const yy of [hy + 3, hy + 15]) box(g, hx - 1, yy, 3, 3, STEEL[3]);
    box(g, hx + 13, hy + 9, 4, 5, STEEL[4]); box(g, hx + 14, hy + 7, 2, 2, STEEL[2]);
  }
};

/** A wagon wheel bolted to a pylon: the iron tire, the felloes, twelve spokes, the hub and its cap. */
const wagonWheel = (g: Ctx, x: number, y: number, r: number, rot = 0) => {
  const ring = (rr: number, col: string, lw: number) => { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.arc(x, y, rr, 0, Math.PI * 2); g.stroke(); };
  ring(r, INK, 6); ring(r - 0.5, STEEL[2], 3);
  g.strokeStyle = STEEL[5]; g.lineWidth = 1; g.beginPath(); g.arc(x, y, r - 1, Math.PI * 1.05, Math.PI * 1.6); g.stroke();
  ring(r - 4, INK, 6); ring(r - 4, LOG[3], 4);
  g.strokeStyle = LOG[5]; g.lineWidth = 1; g.beginPath(); g.arc(x, y, r - 5, Math.PI * 1.0, Math.PI * 1.5); g.stroke();
  for (let k = 0; k < 12; k++) {
    const a = rot + (k / 12) * Math.PI * 2, x1 = x + Math.cos(a) * (r - 6), y1 = y + Math.sin(a) * (r - 6);
    g.strokeStyle = INK; g.lineWidth = 3.4; g.beginPath(); g.moveTo(x, y); g.lineTo(x1, y1); g.stroke();
    g.strokeStyle = Math.cos(a - Math.PI * 1.25) > 0 ? LOG[5] : LOG[3]; g.lineWidth = 1.6; g.stroke();
  }
  g.fillStyle = INK; g.beginPath(); g.arc(x, y, 7, 0, Math.PI * 2); g.fill();
  g.fillStyle = LOG[2]; g.beginPath(); g.arc(x, y, 6, 0, Math.PI * 2); g.fill();
  g.fillStyle = LOG[4]; g.beginPath(); g.arc(x - 1, y - 1, 4, 0, Math.PI * 2); g.fill();
  g.fillStyle = STEEL[3]; g.beginPath(); g.arc(x, y, 2.5, 0, Math.PI * 2); g.fill();
  box(g, x - 1, y - 2, 1, 1, STEEL[6]);
};

/** An iron lantern hung on its chain (lit after dark), its foot at (x, y). */
const lantern = (g: Ctx, x: number, top: number, on: boolean) => {
  for (let y = top; y < top + 12; y += 4) { box(g, x - 1, y, 3, 3, INK); box(g, x, y, 1, 2, STEEL[4]); }
  const y = top + 12;
  g.fillStyle = INK; g.beginPath(); g.moveTo(x - 4, y); g.lineTo(x + 5, y); g.lineTo(x + 9, y + 6); g.lineTo(x - 8, y + 6); g.closePath(); g.fill();
  box(g, x - 6, y + 2, 13, 3, STEEL[3]); box(g, x - 6, y + 2, 13, 1, STEEL[5]);
  box(g, x - 7, y + 6, 15, 18, INK); box(g, x - 6, y + 7, 13, 16, on ? '#FFE08A' : '#A8C0CC'); box(g, x - 6, y + 7, 4, 16, on ? '#FFF6D0' : '#D8E6EC');
  if (on) { box(g, x - 1, y + 13, 3, 6, '#FFFFFF'); box(g, x, y + 11, 1, 2, '#FDE047'); }
  box(g, x, y + 7, 1, 16, STEEL[1]);
  box(g, x - 8, y + 23, 17, 4, INK); box(g, x - 7, y + 24, 15, 2, STEEL[3]);
};

/** The land's sign, hung off the beam on chains: two pine planks, grained in steps, lit top edges, shaded feet, nail
 *  heads, ragged ends, the letters burned in (the park's alphabet); the second hung off the first on chains of its
 *  own, a lucky horseshoe nailed up either side of it. */
const hungSign = (g: Ctx, beamFoot: number) => {
  const looks = [burned(3, 11), burned(3, 12)], lines = ['WILDERNESS', 'LAND'];
  const ws = lines.map((l, i) => signW(l, looks[i]) + (i ? 70 : 30)), ph = 7 * 3 + 12;
  const tops = [beamFoot + 22, beamFoot + 22 + ph + 14];
  lines.forEach((l, i) => {
    const w = ws[i], x0 = -w / 2, y = tops[i];
    // (the chains: from eye bolts above down to the plank's ends)
    const chainTop = i ? tops[0] + ph : beamFoot, cx = w / 2 - 14;
    for (const sx of [-cx, cx]) {
      for (let cy = chainTop; cy < y; cy += 4) { box(g, sx - 1, cy, 3, 3, INK); box(g, sx, cy, 1, 2, (cy / 4) % 2 ? STEEL[5] : STEEL[3]); }
      box(g, sx - 2, y - 2, 5, 3, INK); box(g, sx - 1, y - 2, 3, 1, STEEL[4]);
    }
    // (the plank)
    box(g, x0 - 1, y - 1, w + 2, ph + 2, INK);
    box(g, x0, y, w, ph, LOG[3]);
    box(g, x0, y, w, 1, LOG[6]); box(g, x0, y + 1, w, 1, LOG[5]); box(g, x0, y + ph - 3, w, 3, LOG[1]); checker(g, x0, y + ph - 5, w, 2, LOG[2], i, 1);
    for (let gy = y + 3; gy < y + ph - 4; gy += 3) box(g, x0 + 3 + ((gy * 7 + i * 5) % 17), gy, w * (0.3 + hash(gy + i) * 0.4), 1, LOG[2]);
    box(g, x0 + w * 0.72, y + ph * 0.55, 5, 3, LOG[1]); box(g, x0 + w * 0.72, y + ph * 0.55, 2, 1, LOG[5]);
    // (ragged sawn ends)
    for (const ex of [x0, x0 + w - 2]) for (let yy = y; yy < y + ph; yy += 3) box(g, ex, yy, 2, 2, hash(yy + ex) > 0.5 ? LOG[2] : LOG[4]);
    for (const nx of [x0 + 6, x0 + w - 9]) { box(g, nx, y + ph / 2 - 1, 3, 3, '#26262C'); box(g, nx, y + ph / 2 - 1, 1, 1, '#A1A1AA'); }
    signText(g, l, 0, Math.round(y + ph / 2 + (7 * 3) / 2), looks[i]);
    // (the lucky horseshoes on the second, points up)
    if (i) for (const hx of [x0 + 18, x0 + w - 18]) {
      g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.arc(hx, y + ph / 2 + 2, 7, Math.PI * 0.05, Math.PI * 0.95); g.stroke();
      g.strokeStyle = STEEL[3]; g.lineWidth = 3.4; g.stroke();
      g.strokeStyle = STEEL[5]; g.lineWidth = 1; g.beginPath(); g.arc(hx, y + ph / 2 + 2, 7, Math.PI * 0.55, Math.PI * 0.9); g.stroke();
      for (let k = 0; k < 4; k++) { const a = Math.PI * (0.18 + k * 0.21); box(g, hx + Math.cos(a) * 7, y + ph / 2 + 2 + Math.sin(a) * 7, 1, 1, INK); }
    }
  });
};

/** An elk's rack up on the beam: the skull plate, two beams sweeping back, the tines up off them, bone in steps. */
const antlers = (g: Ctx, y: number) => {
  const beam = (s: number) => [[0, y - 4], [s * 14, y - 16], [s * 30, y - 34], [s * 40, y - 58], [s * 44, y - 80]];
  const tines = (s: number): number[][][] => [[[s * 14, y - 16], [s * 6, y - 34]], [[s * 26, y - 30], [s * 18, y - 52]], [[s * 36, y - 50], [s * 28, y - 70]], [[s * 41, y - 66], [s * 52, y - 86]]];
  const stroke = (pts: number[][], lw: number) => {
    for (const [col, k] of [[INK, lw + 3], [BONE[3], lw], [BONE[5], Math.max(1, lw * 0.3)]] as [string, number][]) {
      g.strokeStyle = col; g.lineWidth = k; g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath(); pts.forEach(([px, py], i) => (i ? g.lineTo(px - (col === BONE[5] ? 1 : 0), py) : g.moveTo(px - (col === BONE[5] ? 1 : 0), py))); g.stroke();
    }
    g.lineCap = 'butt';
  };
  for (const s of [-1, 1]) { stroke(beam(s), 4); for (const tn of tines(s)) stroke(tn, 2.4); }
  // (the skull plate, on a little plank shield)
  box(g, -13, y - 8, 26, 16, INK); box(g, -12, y - 7, 24, 14, LOG[2]); box(g, -12, y - 7, 24, 1, LOG[5]);
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, y - 4, 8, 6, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = BONE[3]; g.beginPath(); g.ellipse(0, y - 4, 7, 5, 0, 0, Math.PI * 2); g.fill();
  box(g, -4, y - 7, 4, 2, BONE[5]);
};

const paintGate = (g: Ctx) => {
  const on = timeOfDay().lamps > 0.3, top = -300, beamTop = -312, beamFoot = -288;
  for (const s of [-1, 1]) palisade(g, s);
  // (the knee braces: pylon to beam, either side)
  for (const s of [-1, 1]) {
    for (const [col, lw, d] of [[INK, 11, 0], [LOG[3], 8, 0], [LOG[5], 2, -2]] as [string, number, number][]) {
      g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(s * (GATE_HALF - 10), -214 + d); g.lineTo(s * (GATE_HALF - 66), beamFoot + 2 + d); g.stroke();
    }
  }
  // (the pylons: big peeled logs, rope lashed at the beam)
  for (const s of [-1, 1]) {
    const x = s * GATE_HALF;
    post(g, x, top, -40, 34, LOG);
    for (let y = top + 30; y < -50; y += 26) box(g, x - 14 + hash(y + s) * 22, y, 6, 2, LOG[1]);
    // (a knot, a crack)
    box(g, x + 4 * s, -170, 6, 5, INK); box(g, x + 5 * s, -169, 4, 3, LOG[2]); box(g, x + 5 * s, -169, 2, 1, LOG[5]);
    box(g, x - 8, -250, 1, 30, LOG[1]);
    // (rope lashing round the join)
    for (let k = 0; k < 6; k++) { const y = beamFoot + 6 + k * 4; box(g, x - 18, y, 36, 3, INK); box(g, x - 17, y, 34, 2, ROPE[3 + (k % 2)]); box(g, x - 17, y, 6, 1, ROPE[5]); }
    // (the wagon wheel bolted on)
    wagonWheel(g, x, -196, 27, s * 0.13);
  }
  // (the crossbeam: a big log over the trail, banded down, flecked, its end grain at either end)
  const bx0 = -GATE_HALF - 64, bx1 = GATE_HALF + 64, bh = beamFoot - beamTop;
  box(g, bx0, beamTop - 1, bx1 - bx0, bh + 2, INK);
  const rows: [number, string][] = [[0, LOG[6]], [1, LOG[5]], [4, LOG[4]], [10, LOG[3]], [17, LOG[2]], [21, LOG[1]]];
  rows.forEach(([r, col], i) => box(g, bx0 + 1, beamTop + r, bx1 - bx0 - 2, (rows[i + 1]?.[0] ?? bh) - r, col));
  checker(g, bx0 + 1, beamTop + 9, bx1 - bx0 - 2, 2, LOG[3], 0, 1); checker(g, bx0 + 1, beamTop + 16, bx1 - bx0 - 2, 2, LOG[2], 1, 1);
  for (let x = bx0 + 6; x < bx1 - 6; x += 7) box(g, x + hash(x) * 4, beamTop + 5 + hash(x * 1.3) * 12, 3, 1, hash(x * 2.1) > 0.5 ? LOG[1] : LOG[5]);
  for (const ex of [bx0, bx1]) {
    const ring = (rx: number, ry: number, col: string) => { g.fillStyle = col; g.beginPath(); g.ellipse(ex, beamTop + bh / 2, rx, ry, 0, 0, Math.PI * 2); g.fill(); };
    ring(7, bh / 2 + 1, INK); ring(6, bh / 2, LOG[5]); ring(4.4, bh / 2 - 3, LOG[4]); ring(3, bh / 2 - 6, LOG[5]); ring(1.6, 2.4, LOG[2]);
    box(g, ex - 1, beamTop + 4, 1, 6, LOG[2]);
  }
  antlers(g, beamTop);
  // (the lanterns either end, the sign between)
  for (const s of [-1, 1]) lantern(g, s * (GATE_HALF + 40), beamFoot, on);
  hungSign(g, beamFoot);
  for (const s of [-1, 1]) rockPile(g, s * GATE_HALF, s);
};
/** The gate's lanterns after dark: a stepped glow round each. */
const gateGlow = (c: Ctx, sx: number, sy: number, s: number) => {
  if (timeOfDay().lamps <= 0.3) return;
  for (const side of [-1, 1]) {
    const x = sx + (side * (GATE_HALF + 40) / PPM) * s, y = sy - (261 / PPM) * s;
    for (const [r, a] of [[0.9, 0.07], [0.55, 0.11], [0.3, 0.16]] as const) { c.fillStyle = `rgba(255, 214, 130, ${a})`; c.beginPath(); c.arc(Math.round(x), Math.round(y), r * s, 0, Math.PI * 2); c.fill(); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Along the way

/** A pine of the wilds' (stepped tiers, the light down their left flanks). */
const paintPine = (h: number, seed: number) => (g: Ctx) => pine(g, 0, 0, h, h * 0.36, seed, NEEDLE, BARK);

/** A fiberglass boulder: the molded lumps, a seam with its bolts, the chip, a lit lip of worn paint along its top. */
const paintBoulder = (w: number, h: number, seed: number) => (g: Ctx) => {
  const path = () => { g.moveTo(-w / 2, 0); g.quadraticCurveTo(-w / 2 - 4, -h * 0.7, -w * 0.2, -h); g.quadraticCurveTo(w * 0.3, -h - 6, w / 2, -h * 0.4); g.lineTo(w / 2 + 2, 0); g.closePath(); };
  g.beginPath(); path(); g.fillStyle = INK; g.lineWidth = 3; g.strokeStyle = INK; g.stroke();
  part(g, path, FIBER, -w / 2, -h, w, h, 0);
  g.save(); g.beginPath(); path(); g.clip(); fiberglass(g, -w / 2, -h - 6, w, h + 6, FIBER, seed, true);
  // (shade down its right, banded)
  box(g, w * 0.22, -h, w * 0.3, h, FIBER[2]); checker(g, w * 0.16, -h, 6, h, FIBER[2], 0, 1);
  g.restore();
  g.beginPath(); path(); g.strokeStyle = INK; g.lineWidth = 1.5; g.stroke();
  for (let x = -w * 0.3; x < w * 0.2; x += 3) box(g, x, -h + 2 + Math.abs(x) * 0.12, 2, 1, '#DCD2B0');
  // (grass up round its foot)
  for (let x = -w / 2 - 4; x < w / 2 + 4; x += 3) box(g, x, -3 - hash(x + seed) * 5, 1, 5, GRASS[hash(x * 3) > 0.5 ? 5 : 4]);
};

/** A park sign of the land's (frontier/kit.ts parkSign: planks on peeled posts, burned in; warnings painted). */
const paintSign = (lines: string[], warn: boolean, seed: number) => (g: Ctx) => parkSign(g, 0, 0, lines, { warn, seed });

/** An open bear trap on the grass: the spring jaws flat open, their teeth, the pan, the chain off to its stake. */
const paintTrap = (g: Ctx) => {
  const S = STEEL;
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, -6, 34, 9, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = S[3]; g.lineWidth = 3; g.beginPath(); g.ellipse(0, -6, 31, 7, 0, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = S[5]; g.lineWidth = 1; g.beginPath(); g.ellipse(0, -7, 31, 7, 0, Math.PI, Math.PI * 1.9); g.stroke();
  for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2, x = Math.cos(a) * 28, y = -6 + Math.sin(a) * 6; box(g, x - 1, y - 4, 2, 4, INK); box(g, x - 0.5, y - 3, 1, 3, S[5]); }
  box(g, -8, -10, 16, 8, INK); box(g, -7, -9, 14, 6, S[2]); box(g, -7, -9, 14, 1, S[4]);
  for (const s of [-1, 1]) { box(g, s * 34 - 6, -10, 12, 6, INK); box(g, s * 34 - 5, -9, 10, 4, S[3]); box(g, s * 34 - 5, -9, 10, 1, S[5]); }
  for (let k = 0; k < 6; k++) { box(g, 36 + k * 5, -5 + (k % 2), 4, 3, INK); box(g, 37 + k * 5, -4 + (k % 2), 2, 1, S[4]); }
  box(g, 66, -12, 4, 12, INK); box(g, 67, -11, 2, 11, S[3]);
};

/** A bear-proof trash can (the park's): steel in green steps, the latched lid, its plate. */
const paintTrash = (g: Ctx) => {
  const S = ['#142014', '#1E3020', '#2C422C', '#3A563A', '#4E6E4C', '#6A8A66', '#94B08E'];
  box(g, -14, -42, 28, 42, INK); box(g, -13, -41, 26, 41, S[3]); box(g, -13, -41, 5, 41, S[4]); box(g, -12, -41, 1, 41, S[5]); box(g, 8, -41, 5, 41, S[2]);
  for (const y of [-34, -12]) { box(g, -13, y, 26, 2, S[1]); box(g, -13, y - 1, 26, 1, S[5]); }
  box(g, -16, -48, 32, 8, INK); box(g, -15, -47, 30, 6, S[2]); box(g, -15, -47, 30, 2, S[4]);
  box(g, -5, -45, 10, 3, STEEL[4]); box(g, -4, -44, 8, 1, STEEL[6]);
  box(g, -10, -29, 20, 12, INK); box(g, -9, -28, 18, 10, PLANK[4]); box(g, -9, -28, 18, 1, PLANK[6]);
  box(g, -7, -26, 14, 2, PLANK[1]); box(g, -6, -22, 12, 2, PLANK[1]);
  box(g, -15, -2, 30, 2, S[0]);
};

/** A fake rock with a speaker grille in it (birdsong, piped in). */
const paintSpeaker = (g: Ctx) => {
  part(g, () => { g.ellipse(0, 0, 26, 22, 0, Math.PI, 0); g.closePath(); }, FIBER, -26, -22, 52, 22, 1.5);
  box(g, -10, -14, 20, 10, INK); box(g, -9, -13, 18, 8, STEEL[2]);
  for (let i = 0; i < 5; i++) { box(g, -8 + i * 4, -12, 2, 6, STEEL[0]); box(g, -7 + i * 4, -12, 1, 6, STEEL[4]); }
  box(g, 12, -4, 10, 2, '#18181B'); box(g, 20, -2, 6, 2, '#18181B');
};
/** The birdsong coming out of it: notes going up. */
const notes = (c: Ctx, sx: number, sy: number, s: number, t: number) => {
  if (t % 120 >= 60 || s < 6) return;
  const u = t % 60, k = s / PPM, nx = sx + (12 + u * 0.3) * k, ny = sy - (26 + u * 0.35) * k;
  box(c, nx - 1, ny - 1, 4, 3, INK); box(c, nx, ny, 2, 1, '#F8FAFC'); box(c, nx + 2, ny - 5, 1, 6, '#F8FAFC');
  if (u > 20) { box(c, nx + 6, ny - 7, 2, 1, '#F8FAFC'); box(c, nx + 8, ny - 12, 1, 6, '#F8FAFC'); box(c, nx + 8, ny - 12, 3, 1, '#F8FAFC'); }
};

/** A wagon wheel leant on the fence, half sunk in the grass. */
const paintLeanWheel = (g: Ctx) => {
  g.save(); g.transform(0.86, 0, -0.18, 1, 0, 0); wagonWheel(g, 6, -30, 30, 0.3); g.restore();
  for (let x = -30; x < 34; x += 3) box(g, x, -4 - hash(x) * 6, 1, 6, GRASS[hash(x * 2) > 0.5 ? 5 : 3]);
};

/** A lantern on a peeled post (lit after dark). */
const paintLampPost = (g: Ctx) => {
  post(g, 0, -118, 0, 8, LOG);
  box(g, -1, -118, 18, 4, INK); box(g, 0, -117, 16, 2, LOG[4]);
  lantern(g, 14, -114, timeOfDay().lamps > 0.3);
  for (let k = -6; k < 7; k += 3) box(g, k, -4 - hash(k + 3) * 4, 1, 4, GRASS[5]);
};
const lampPostGlow = (c: Ctx, sx: number, sy: number, s: number) => {
  if (timeOfDay().lamps <= 0.3) return;
  const x = sx + (14 / PPM) * s, y = sy - (87 / PPM) * s;
  for (const [r, a] of [[0.7, 0.08], [0.42, 0.12], [0.22, 0.18]] as const) { c.fillStyle = `rgba(255, 214, 130, ${a})`; c.beginPath(); c.arc(Math.round(x), Math.round(y), r * s, 0, Math.PI * 2); c.fill(); }
};

/** A hay bale, its twine, a pitchfork stuck in it. */
const paintBale = (g: Ctx) => {
  const H = ['#3A2E10', '#6A5420', '#987C34', '#C4A44C', '#E2C66C', '#F4E09A'];
  box(g, -30, -30, 60, 30, INK); box(g, -29, -29, 58, 29, H[3]); box(g, -29, -29, 58, 3, H[5]); box(g, -29, -26, 58, 2, H[4]); box(g, 20, -26, 9, 26, H[2]); box(g, -29, -4, 58, 4, H[1]);
  for (let i = 0; i < 70; i++) { const x = -27 + hash(i * 1.3) * 54, y = -26 + hash(i * 2.1) * 22; box(g, x, y, 3, 1, hash(i) > 0.5 ? H[5] : H[2]); }
  for (const tx of [-14, 12]) { box(g, tx, -30, 2, 30, INK); box(g, tx, -29, 1, 28, '#C8B48A'); }
  // (the pitchfork: its handle up at a lean, the tines in)
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(-4, -24); g.lineTo(18, -86); g.stroke();
  g.strokeStyle = LOG[4]; g.lineWidth = 2; g.stroke();
  box(g, -9, -27, 12, 3, INK); box(g, -8, -26, 10, 1, STEEL[4]);
};

/** A mountain flat through the gate: a peak painted on plywood (too blue, the snow brushed on with its drips, painted
 *  pines along its foot), its raw ply edge, the 2x4 braces behind it on sandbags. */
const paintMtnFlat = (g: Ctx) => {
  const P = ['#2A2C64', '#3C448A', '#5260AE', '#7280C8', '#A0AADE', '#D8A8C0'], SN = ['#9AA8D0', '#D4DCF0', '#F4F8FF'];
  const W = 190, Hh = 200, pts: [number, number][] = [[0, 0], [30, -110], [58, -92], [96, -Hh], [134, -120], [160, -136], [W, 0]];
  for (const bx of [40, 110, 160]) {
    g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(bx, -90); g.lineTo(bx + 40, 0); g.stroke();
    g.strokeStyle = PLY[2]; g.lineWidth = 4; g.stroke();
    box(g, bx + 30, -9, 22, 9, INK); box(g, bx + 31, -8, 20, 8, '#7A6A50'); box(g, bx + 31, -8, 20, 3, '#9C8C6E');
  }
  g.fillStyle = PLY[4]; g.beginPath(); pts.forEach(([x, y], k) => (k ? g.lineTo(x + 4, y + 2) : g.moveTo(x + 4, y + 2))); g.closePath(); g.fill();
  g.beginPath(); pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke();
  g.save(); g.clip();
  for (let i = 0; i < 6; i++) box(g, 0, -Hh + (i * Hh) / 6, W, Hh / 6 + 1, [P[3], P[3], P[2], P[2], P[1], P[0]][i]);
  checker(g, 0, -Hh / 2, W, 2, P[2], 0, 1);
  for (let s = 0; s < 10; s++) { g.strokeStyle = s % 2 ? P[4] : P[5]; g.lineWidth = 3; g.beginPath(); g.moveTo(94 - s * 3, -Hh + 8 + s * 6); g.lineTo(70 - s * 8, -Hh + 50 + s * 10); g.stroke(); }
  g.fillStyle = SN[1]; g.beginPath(); g.moveTo(62, -132); g.lineTo(96, -Hh); g.lineTo(128, -128); g.lineTo(112, -138); g.lineTo(100, -124); g.lineTo(84, -140); g.closePath(); g.fill();
  g.fillStyle = SN[2]; g.beginPath(); g.moveTo(68, -136); g.lineTo(95, -Hh + 2); g.lineTo(88, -150); g.closePath(); g.fill();
  for (let d = 0; d < 5; d++) box(g, 70 + d * 11, -134 + (d % 2) * 4, 2, 8 + hash(d * 3) * 12, SN[0]);
  for (let tx = 8; tx < W; tx += 14) { g.fillStyle = '#1A3428'; g.beginPath(); g.moveTo(tx, -44 - ((tx * 5) % 9)); g.lineTo(tx + 8, -18); g.lineTo(tx - 8, -18); g.closePath(); g.fill(); }
  box(g, 0, -20, W, 20, '#1A3428');
  g.restore();
};

const props = (): Prop[] => {
  const out: Prop[] = [];
  // The gate, dead ahead, its middle on his path; its lanterns' glow after dark
  const gw = 2 * (FENCE_X * PPM + 50);
  out.push({ ...sq('gate', 0, GATE_Z, gw, 420, gw / 2, 410, paintGate, { res: 26, words: true }), live: gateGlow });
  // Through it: the trail on between pines, a fiberglass bluff, a painted mountain flat on its bracing
  out.push(sq('flat', 3.4, GATE_Z + 9, 230, 210, 20, 204, paintMtnFlat, { res: 16 }));
  out.push(sq('bluff', -4.6, GATE_Z + 6, 200, 120, 100, 116, paintBoulder(180, 100, 9), { res: 18 }));
  for (const [x, z, h, sd] of [[-3.2, GATE_Z + 3, 210, 41], [4.2, GATE_Z + 4, 240, 43], [-5.4, GATE_Z + 11, 260, 47], [5.8, GATE_Z + 14, 230, 53], [1.8, GATE_Z + 18, 250, 59]] as const) {
    out.push(sq(`pine-${sd}`, x, z, h * 0.5, h + 16, h * 0.25, h + 4, paintPine(h, sd), { res: 18 }));
  }
  // Along the way: the park's signs, the trap, the rocks, the wheel, the trash can, the speaker rock, the bale
  out.push(sq('sign-traps', -4.9, 5.2, 220, 130, 110, 124, paintSign(['BEAR TRAPS', 'AUTHENTIC. STEP AROUND.'], true, 500), { res: 30, words: true }));
  out.push(sq('trap', -3.3, 6.8, 150, 30, 64, 20, paintTrap, { res: 30 }));
  out.push(sq('sign-rocks', 4.9, 9.4, 220, 140, 110, 132, paintSign(['SCENIC ROCKS', '100% FIBERGLASS'], false, 1340), { res: 30, words: true }));
  out.push(sq('rock1', 4.6, 11.2, 120, 80, 60, 76, paintBoulder(100, 66, 3), { res: 26 }));
  out.push(sq('rock2', -4.2, 2.6, 80, 50, 40, 47, paintBoulder(64, 40, 5), { res: 26 }));
  out.push(sq('rock3', 5.4, 15.4, 90, 60, 45, 56, paintBoulder(76, 48, 7), { res: 24 }));
  out.push(sq('wheel', 6.4, 4.1, 80, 72, 40, 68, paintLeanWheel, { res: 28 }));
  out.push(sq('trash', -3.4, 11.4, 40, 54, 20, 52, paintTrash, { res: 28 }));
  out.push({ ...sq('speaker', 3.3, 13.4, 60, 32, 30, 30, paintSpeaker, { res: 28 }), live: notes });
  out.push(sq('bale', -3.6, 15.2, 70, 92, 32, 90, paintBale, { res: 26 }));
  // Lantern posts either side, staggered
  for (const [x, z] of [[3.1, 3.2], [-3.1, 8.6], [3.1, 14.6]] as const) out.push({ ...sq(`lamp${x > 0 ? 'r' : 'l'}`, x, z, 40, 126, 12, 122, paintLampPost, { res: 26 }), live: lampPostGlow });
  // Pines inside the fence (their crowns kept short of it)
  for (const [x, z, h, sd] of [[-5.6, 1.8, 230, 3], [5.5, 2.2, 220, 5], [-5.7, 8.2, 250, 7], [5.6, 6.8, 230, 11], [-5.6, 13.6, 240, 13], [5.7, 12.8, 220, 17]] as const) {
    out.push(sq(`pine-${sd}`, x, z, h * 0.5, h + 16, h * 0.25, h + 4, paintPine(h, sd), { res: 22 }));
  }
  return out;
};

export const INTO_FRONTIER: PortalDef = {
  land: 'WILDERNESS LAND',
  lines: ['OLD AMERICA. LOG FLUMES. DYSENTERY (SIMULATED).', 'THE FRONTIER, AS GOD AND THE PARK INTENDED.'],
  haze: '#F2E6C4',
  ground, back, props,
  rim: () => hourMix('#FEF3C7', '#F59E0B', '#FDE68A'),
};
