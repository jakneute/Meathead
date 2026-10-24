// The walk into Foreign Lands (portalWalk.ts): out of the portal and down the lagoon promenade toward MEXICO's gate
// (the land's own: its stone pylons hung with their banners, the starred beam, the bunting, the FOREIGN LANDS / THE
// WHOLE WORLD, FIXED. board hung off it, its flags), painted by the streets' own painting brought into the picture
// (foreign/mexico/art.ts, foreign/backdrop.ts, the cast's costumes), at the streets' px a meter.
//
// Underfoot: granite pavers in steps, the terracotta walk up the middle (talavera borders, a medallion now and then),
// drain grates, gum, popcorn. Down the left, the lagoon on the ground's own plane (banded and dithered back into the
// haze, glints, the sun's or the moon's glitter down it), its granite coping and the iron railing running off to the
// eye; the FIREWORKS barge out on it (its reflection; its show after dark). Across it, the far shore's tree line and the
// pavilions' own far landmarks as he'll find them, shrunk: China's ridge and its wall, Germany's castle, Mexico's mesas
// over the gate, the cathedral, London-ish and its Ferris wheel (turning). No helicopter landmarks (they're the
// helicopter's to show), no volcano. Down the right, Mexico's stucco fronts (TIENDA, PANADERIA; past the gate
// FARMACIA, CANTINA, ZAPATERIA), braced from behind; iron lamps with country pennants (lit after dark), flags of
// countries real and not, potted saguaros, papel picado strung across past the gate; the cast at their posts (a
// mariachi trio by the railing, the sombrero seller, the blindfolded pinata host). The sky by the hour (timeOfDay.ts).

import { type Ctx, type Prop, type PortalDef, HOR, LW, LH, F, CAM_H, ME_D, INK, box, hash, mix, stipple } from './kit';
import { canvas } from './screen';
import { timeOfDay, thisHour, hourMix, skyRamp, sunAt, drawStars, drawMoon, skyAt, cloudTint, farTint, type TimeOfDay } from '../timeOfDay';
import { bandedGradient, hazeBands, pixelBlob } from '../../m1/game/render/pixelArt';
import { ramp6, hour, post, ball, hungBoard, flagPole, two4, sandbags, LOOKS } from '../foreign/kit';
import { paintGate, paintFront, type MxFront } from '../foreign/mexico/art';
import { MARIACHI_COSTUME, SOMBRERO_COSTUME, PINATA_COSTUME } from '../foreign/mexico/kinds';
import { paintCast, type Costume } from '../foreign/cast';
import { frameOf } from '../spooky/costume';
import { lookOf } from '../adventure/temple/people';
import { FAR_STILLS, paintShore, paintBarge, SHORE_W, SHORE_H, BARGE_W, BARGE_H } from '../foreign/backdrop';
import { paintMark } from '../foreign/teases';
import { drawTeaseStrip } from './teases';
import { farCol } from '../hollywood/blvd/far';

/** The streets' px a meter (him: ~70 of them; a touch under 2 m). The gate's a touch smaller, so the lagoon's coping
 *  clears its left pylon. */
const PPM = 38, GATE_PPM = 50;
/** Where the gate is when he sets off (m). */
const GATE_Z = 16;
/** The portal walk's: where the ground runs off to, where his path is (m across), how fast the camera comes on. */
const VP = LW / 2, PATH_X = (-52 * ME_D) / F, CAM_V = 0.02;
/** The lagoon's railing (m across from his path; the coping out past it to the water). */
const RAIL_X = -5.6, COPING = 0.35;

const fontIn = () => (typeof document !== 'undefined' && document.fonts?.check('8px "Press Start 2P"') ? 'f' : 'n');
/** Something of the streets' painted at its own px (`paint`, its foot at (ox, oy) in a tw by th box), then brought down
 *  to the sprite's size in one go (an even average, painted once: no crawl as it's scaled after). */
const shrunk = (tw: number, th: number, ox: number, oy: number, paint: (g: Ctx) => void) => (g: Ctx, w: number, h: number) => {
  const big = canvas(Math.ceil(tw), Math.ceil(th)), bg = big.getContext('2d')!;
  bg.translate(ox, oy); paint(bg);
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  g.drawImage(big, 0, 0, w, h);
};
/** A prop with words on it: its id carries whether the pixel font's in (or one painted in the fallback would stick). */
const worded = (p: Omit<Prop, 'id'>, id: string): Prop => Object.defineProperty({ ...p }, 'id', { get: () => id + fontIn(), enumerable: true }) as Prop;
/** A prop of the streets': `tw` by `th` of their px (at `ppm` a meter), its foot at (ox, oy) in that box. */
const sq = (id: string, x: number, z: number, tw: number, th: number, ox: number, oy: number, paint: (g: Ctx) => void, o: { ppm?: number; res?: number; words?: boolean } = {}): Prop => {
  const ppm = o.ppm ?? PPM, p = { x, z, w: tw / ppm, h: th / ppm, ppm: o.res ?? 24, paint: shrunk(tw, th, ox, oy, paint) };
  return o.words ? worded(p, `pw-fl-${id}-`) : { id: `pw-fl-${id}`, ...p };
};

// ---------------------------------------------------------------------------------------------------------------
// The ground: granite pavers in steps, the terracotta walk up the middle (talavera borders, medallions), drain grates,
// gum and popcorn. (The lagoon's down the left on the ground's own plane, back(): the tile repeats every 16 m.)

const GRANITE = ramp6('#B4AEA2'), TERRA = ramp6('#B4643C'), TALA = ramp6('#1E40AF'), WHITE = ramp6('#EEF2F6'), GOLD = ramp6('#E0A82E');

const ground = (g: Ctx, w: number, h: number) => {
  const G = GRANITE, cx = w / 2;
  box(g, 0, 0, w, h, G[0]);
  // (the pavers: each its own step of the granite, its top and left lit, its foot and right shaded, flecked)
  for (let y = 0; y < h; y += 12) for (let x = (y / 12) % 2 ? -6 : 0; x < w; x += 12) {
    const t = hash(x * 0.37 + y * 1.13), col = G[t > 0.75 ? 4 : t > 0.25 ? 3 : 2];
    box(g, x + 1, y + 1, 11, 11, col);
    box(g, x + 1, y + 1, 11, 1, G[t > 0.75 ? 5 : 4]); box(g, x + 1, y + 1, 1, 11, G[t > 0.75 ? 5 : 4]);
    box(g, x + 1, y + 11, 11, 1, G[1]); box(g, x + 11, y + 2, 1, 10, G[1]);
    for (let k = 0; k < 3; k++) box(g, x + 2 + hash(t * 31 + k) * 8, y + 2 + hash(t * 17 + k * 3) * 8, 1, 1, k ? G[1] : G[5]);
  }
  // (the terracotta walk up the middle: its tiles stepped, the joints dark, the talavera border down both sides)
  const ww = 40, x0 = cx - ww / 2;
  box(g, x0 - 7, 0, ww + 14, h, INK);
  for (let y = 0; y < h; y += 10) for (let x = x0; x < x0 + ww; x += 10) {
    const t = hash(x * 1.7 + y * 0.31);
    box(g, x, y, 10, 10, TERRA[1]); box(g, x, y, 9, 9, TERRA[t > 0.6 ? 4 : t > 0.2 ? 3 : 2]); box(g, x, y, 9, 1, TERRA[5]);
    if (t < 0.12) box(g, x + 3, y + 4, 3, 1, TERRA[1]);
  }
  for (const bx of [x0 - 6, x0 + ww]) for (let y = 0; y < h; y += 6) {
    const k = (y / 6) % 2;
    box(g, bx, y, 6, 6, k ? WHITE[3] : TALA[3]); box(g, bx, y, 6, 1, k ? WHITE[5] : TALA[4]);
    box(g, bx + 2, y + 2, 2, 2, k ? TALA[3] : WHITE[4]);
  }
  // (a talavera medallion set in the walk now and then: a blue ring, white, the gold star in it)
  for (let y = 40; y < h; y += 128) {
    const disc = (r: number, col: string) => { g.fillStyle = col; g.beginPath(); g.arc(cx, y, r, 0, Math.PI * 2); g.fill(); };
    disc(17, INK); disc(16, TALA[2]); disc(15, TALA[3]); disc(11, WHITE[3]); disc(10, WHITE[4]);
    for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; box(g, cx + Math.cos(a) * 13 - 1, y + Math.sin(a) * 13 - 1, 2, 2, k % 2 ? WHITE[4] : GOLD[3]); }
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4, len = k % 2 ? 5 : 9;
      g.fillStyle = k % 2 ? GOLD[2] : GOLD[3]; g.beginPath(); g.moveTo(cx, y);
      g.lineTo(cx + Math.cos(a - 0.35) * 3, y + Math.sin(a - 0.35) * 3); g.lineTo(cx + Math.cos(a) * len, y + Math.sin(a) * len); g.lineTo(cx + Math.cos(a + 0.35) * 3, y + Math.sin(a + 0.35) * 3); g.fill();
    }
    box(g, cx - 1, y - 1, 2, 2, GOLD[5]);
  }
  // (drain grates either side of the walk: an iron frame, its slots)
  for (let y = 88; y < h; y += 128) for (const gx of [cx - 46, cx + 34]) {
    box(g, gx - 1, y - 1, 14, 10, INK); box(g, gx, y, 12, 8, '#3A3C40'); box(g, gx, y, 12, 1, '#6A6E74');
    for (let k = 1; k < 12; k += 2) box(g, gx + k, y + 2, 1, 5, '#121316');
  }
  // (gum, popcorn, a ticket stub)
  for (let i = 0; i < 70; i++) { const x = hash(i * 9.1) * w, y = hash(i * 4.3) * h; box(g, x, y, 2, 2, '#4A4644'); box(g, x, y, 1, 1, '#7A7470'); }
  for (let i = 0; i < 90; i++) box(g, hash(i * 1.7 + 5) * w, hash(i * 2.3 + 5) * h, 2, 1, ['#FFF6D0', '#F4E8B0', '#FFFFFF', '#E86F6F'][i % 4]);
};

// ---------------------------------------------------------------------------------------------------------------
// The far off: the land's sky (banded, the sun, the moon, the stars), clouds; across the lagoon the far shore and the
// pavilions' far landmarks, shrunk (cropped to their middles and run into each other), London-ish's wheel turning

const SKY = ['#1E3A8A', '#2563EB', '#60A5FA', '#93C5FD', '#BFDBFE', '#FDE68A'];
const skies = new Map<string, HTMLCanvasElement>();
const skyOfLand = (tod: TimeOfDay) => {
  let s = thisHour(skies).get(tod.key);
  if (!s) { s = canvas(LW, HOR + 4); bandedGradient(s.getContext('2d')!, 0, 0, LW, HOR + 4, skyRamp(SKY, tod), 18, 1); skies.set(tod.key, s); }
  return s;
};

/** The far landmarks: which, where its middle is (picture x), and the middle of it kept (its own px). */
const FAR_K = 0.15, FAR_W = LW + 60, FAR_H = 72, FAR_OFF = -30;
const FAR: { id: 'china' | 'germany' | 'france' | 'uk' | 'mexico'; cx: number; a: number; b: number }[] = [
  { id: 'china', cx: 40, a: 100, b: 860 },
  { id: 'germany', cx: 120, a: 120, b: 780 },
  { id: 'france', cx: 290, a: 160, b: 800 },
  { id: 'uk', cx: 370, a: 60, b: 700 },
  { id: 'mexico', cx: 205, a: 0, b: 960 },
];
const SHORE_K = 0.3;
const farOf = new Map<string, HTMLCanvasElement>();
const farStripOf = (tod: TimeOfDay) => {
  const key = `${tod.key}-${fontIn()}`;
  let s = farOf.get(key);
  if (s) return s;
  if (farOf.size > 8) farOf.clear();
  s = canvas(FAR_W, FAR_H);
  const g = s.getContext('2d')!;
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  for (const f of FAR) {
    const S = FAR_STILLS[f.id]!;
    const big = canvas(S.w, S.h);
    S.paint(big.getContext('2d')!, farCol(tod, S.k * 0.5), tod);
    const w = (f.b - f.a) * FAR_K, h = S.h * FAR_K;
    g.drawImage(big, f.a, 0, f.b - f.a, S.h, Math.round(f.cx - FAR_OFF - w / 2), Math.round(FAR_H - 2 - h), Math.round(w), Math.round(h));
  }
  // (the other pavilions round the lagoon on the far shore, small (foreign/teases.ts: the streets' own far-shore
  // landmarks), between the big far ones; out past them the neighbors: Jungle Land's temple off left, Future Land's
  // needle off right)
  const mk = (paint: (o: Ctx) => void, w: number, h: number, cx: number, k: number) => {
    const big = canvas(w, h), o = big.getContext('2d')!; paint(o);
    g.drawImage(big, Math.round(cx - FAR_OFF - (w * k) / 2), Math.round(FAR_H - 4 - h * k), Math.round(w * k), Math.round(h * k));
  };
  for (const [id, cx] of [['norway', 82], ['japan', 160], ['morocco', 246], ['italy', 330]] as const) mk(o => paintMark(o, id, 80, 150, 0.42, 1, tod), 160, 152, cx, 0.3);
  // (the shore's line of trees in front of their feet)
  const shore = canvas(SHORE_W, SHORE_H);
  paintShore(shore.getContext('2d')!, tod);
  const sw = SHORE_W * SHORE_K, sh = SHORE_H * SHORE_K;
  for (let x = 0; x < FAR_W; x += sw) g.drawImage(shore, Math.round(x), Math.round(FAR_H - sh), Math.round(sw), Math.round(sh));
  farOf.set(key, s);
  return s;
};

/** The barge, shrunk once for the hour. */
const BARGE_K = 0.3;
const barges = new Map<string, HTMLCanvasElement>();
const bargeOf = (tod: TimeOfDay) => {
  const key = `${tod.key}-${fontIn()}`;
  let s = barges.get(key);
  if (s) return s;
  if (barges.size > 8) barges.clear();
  const big = canvas(BARGE_W, BARGE_H);
  paintBarge(big.getContext('2d')!, tod);
  s = canvas(Math.round(BARGE_W * BARGE_K), Math.round(BARGE_H * BARGE_K));
  const g = s.getContext('2d')!;
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  g.drawImage(big, 0, 0, s.width, s.height);
  barges.set(key, s);
  return s;
};

/** The show, at the picture's size: shells going up on sparking trails, bursting in rings of square sparks (white at
 *  the core, the shell's color, its shade as they fall and go out). */
const SHELLS = [['#FFF1F2', '#F87171', '#991B1B'], ['#FEFCE8', '#FDE047', '#A16207'], ['#EFF6FF', '#60A5FA', '#1E3A8A'], ['#F0FDF4', '#4ADE80', '#166534'], ['#FDF4FF', '#E879F9', '#86198F']];
const show = (c: Ctx, x: number, wl: number, t: number) => {
  for (let s = 0; s < 3; s++) {
    const P = 150 + s * 37, u0 = (t + s * 61) % P, n = Math.floor((t + s * 61) / P);
    const sx = x - 26 + ((n * 23 + s * 17) % 52), top = wl - 40 - ((n * 13 + s * 7) % 22), C = SHELLS[(n + s * 2) % SHELLS.length];
    if (u0 < 26) {
      const u = u0 / 26, y = wl - 4 + (top - (wl - 4)) * (1 - (1 - u) * (1 - u));
      for (let k = 0; k < 3; k++) box(c, sx, y + k * 2, 1, 1, k ? C[2] : '#FFFFFF');
    } else if (u0 < 26 + 50) {
      const u = (u0 - 26) / 50, r = 2 + Math.sqrt(u) * 13, fall = u * u * 8;
      for (let i = 0; i < 14; i++) {
        if (u > 0.85 && (i + u0) % 2) continue;
        const a = (i / 14) * Math.PI * 2 + n;
        box(c, Math.round(sx + Math.cos(a) * r), Math.round(top + Math.sin(a) * r * 0.9 + fall), u < 0.3 ? 2 : 1, u < 0.3 ? 2 : 1, u < 0.2 ? C[0] : u < 0.6 ? C[1] : C[2]);
      }
      if (u < 0.12) { box(c, sx - 2, top - 2, 5, 5, '#FFFFFF'); box(c, sx - 4, top, 9, 1, C[0]); box(c, sx, top - 4, 1, 9, C[0]); }
    }
  }
};

/** Where his path's left edge things are on the picture: x of a line (m across) at `dy` rows under the horizon. */
const lineX = (xm: number, dy: number, sway: number) => VP + sway + ((PATH_X + xm) * dy) / CAM_H;

const back = (c: Ctx, t: number, sway: number) => {
  const tod = timeOfDay(), travel = CAM_V * t;
  c.drawImage(skyOfLand(tod), 0, 0);
  drawStars(c, 0, 0, LW, HOR - 10, t, 0, tod, 1);
  drawMoon(c, 124, 20, 7, tod);
  // (the sun, by day: a small stepped disc over the lagoon, sinking with the hour)
  const s = sunAt(70, 20, HOR, tod);
  if (s.up > 0.05) {
    c.save(); c.globalAlpha = s.up;
    for (const [r, col] of [[12, mix(s.glow, skyAt(0.3, tod), 0.6)], [8, s.glow], [7, s.core], [3, mix(s.core, '#FFFFFF', 0.6)]] as const) { c.fillStyle = col; c.beginPath(); c.arc(Math.round(s.x - (r === 3 ? 1 : 0)), Math.round(s.y - (r === 3 ? 1 : 0)), r, 0, Math.PI * 2); c.fill(); }
    c.restore();
  }
  // (fair-weather clouds drifting, three steps each)
  for (let i = 0; i < 4; i++) {
    const x = ((i * 120 + t * 0.03 + sway * 0.2) % 480) - 40, y = 14 + hash(i * 3.3) * 18, w = 26 + hash(i) * 20;
    pixelBlob(c, x, y + 3, w * 0.55, 4, cloudTint('#C8D4E8', tod), 1); pixelBlob(c, x - w * 0.1, y, w * 0.32, 5, cloudTint('#E6EEF8', tod), 1); pixelBlob(c, x - w * 0.18, y - 2, w * 0.16, 3, cloudTint('#FFFFFF', tod), 1);
  }
  // Across the lagoon: the landmarks and the far shore; London-ish's wheel turning
  const off = Math.round(sway * 0.3), fy = HOR + 1 - FAR_H;
  drawTeaseStrip(c, 'foreign', 'far', sway, false, 6);
  c.drawImage(farStripOf(tod), off + FAR_OFF, fy);
  const uk = FAR.find(f => f.id === 'uk')!, U = FAR_STILLS.uk!;
  c.save();
  c.translate(off + uk.cx - ((uk.b - uk.a) * FAR_K) / 2 - uk.a * FAR_K, Math.round(fy + FAR_H - 2 - U.h * FAR_K));
  c.scale(FAR_K, FAR_K);
  U.live?.(c, 0, 0, t, farCol(tod, U.k * 0.5));
  c.restore();
  hazeBands(c, 0, HOR - 12, LW, 14, skyAt(0.92, tod), 0, 0.45, 4, 1);

  // The lagoon, down the left on the ground's plane: banded back into the sky's color, dithered between, glints
  const Wt = [hourMix('#1D4ED8', '#7C3AED', '#0F172A'), hourMix('#2563EB', '#9D4E8A', '#1E293B'), hourMix('#3B82F6', '#C2678A', '#1E3A5F'), hourMix('#7AA8E8', '#E0909A', '#2A4A70')].map(col => farTint(col, 0.3, tod));
  const BANDS = [mix(Wt[3], skyAt(0.95, tod), 0.5), Wt[3], Wt[2], Wt[1], Wt[0]], EDGES = [5, 12, 26, 56];
  const bandOf = (dy: number) => EDGES.filter(e => dy >= e).length;
  for (let y = HOR + 1; y < LH; y++) {
    const dy = y - HOR + 0.5, xo = Math.round(lineX(RAIL_X - COPING, dy, sway));
    if (xo <= 0) continue;
    const b = bandOf(dy);
    box(c, 0, y, xo, 1, BANDS[b]);
    // (the row a band starts on and the next: dithered into the one before)
    if (b > 0 && dy - EDGES[b - 1] < 2) { c.fillStyle = stipple(c, BANDS[b - 1], y % 2); c.fillRect(0, y, xo, 1); }
    // (glints, drifting toward him, nearer ones longer)
    const n = 1 + Math.floor(dy / 30);
    for (let k = 0; k < n; k++) {
      const seed = y * 3.7 + k * 11.3;
      if ((t + Math.floor(hash(seed) * 140)) % 140 > 90) continue;
      const len = 1 + Math.floor(dy / 14), gx = ((hash(seed * 1.3) * xo + t * (0.05 + dy * 0.004)) % Math.max(1, xo));
      box(c, gx, y, Math.min(len, xo - gx), 1, mix(BANDS[b], '#FFFFFF', 0.35));
    }
  }
  // (the sun's or the moon's glitter down the water toward him, in broken stepped dashes)
  const glit = s.up > 0.2 ? { x: s.x, col: mix(s.core, '#FFFFFF', 0.4), a: s.up } : tod.moon > 0.3 ? { x: 124, col: '#E4E6F2', a: Math.min(1, tod.moon) } : null;
  if (glit) {
    c.save(); c.globalAlpha = glit.a;
    for (let y = HOR + 2; y < LH; y++) {
      const dy = y - HOR, xo = lineX(RAIL_X - COPING, dy, sway), k = hash(y * 3.1 + Math.floor(t / 7));
      if (k < 0.45) continue;
      const gx = glit.x + (hash(y * 7.7 + Math.floor(t / 7)) - 0.5) * (3 + dy * 0.45), gw = 1 + Math.floor(dy * 0.05);
      if (gx + gw < xo) box(c, gx, y, gw, 1, glit.col);
    }
    c.restore();
  }
  // The barge out on it: its reflection wobbling, the barge, its show after dark
  const bg = bargeOf(tod), bx = Math.round(78 - t * 0.012 + sway * 0.25), wl = HOR + 5;
  for (let k = 0; k < 4; k++) box(c, bx - bg.width / 2 + 4 + Math.sin(t * 0.05 + k) * 1, wl + 1 + k, bg.width - 10 - k * 6, 1, mix(Wt[0], '#000000', 0.3));
  c.drawImage(bg, bx - Math.round(bg.width / 2), wl - Math.round((BARGE_H - 10) * BARGE_K));
  if (tod.lamps > 0.3) show(c, bx, wl - 4, t);

  // The coping along the water: granite, its top lit, its joints going by, its face dark down to the water
  const Gc = ramp6(hour('#C8C2B4'));
  for (let y = HOR + 1; y < LH; y++) {
    const dy = y - HOR + 0.5, xo = lineX(RAIL_X - COPING, dy, sway), xi = lineX(RAIL_X, dy, sway);
    if (xi <= 0) continue;
    const d = (F * CAM_H) / dy, joint = Math.floor((d + travel) / 1.2) !== Math.floor(((F * CAM_H) / (dy + 1) + travel) / 1.2);
    box(c, xo, y, Math.max(1, xi - xo), 1, joint ? Gc[1] : dy > 40 ? Gc[3] : Gc[2]);
    box(c, xo - 1, y, 1, 1, INK);
    if (dy > 20) box(c, xi - 1, y, 1, 1, Gc[4]);
  }
  // The iron railing: its posts going by (finials up top), the top rail and the middle one running off to the eye
  const I = ramp6(hour('#30343C'));
  const rx = RAIL_X + 0.08, nearD = 0.9, ns = F / nearD;
  const atD = (d: number, up: number) => ({ x: VP + sway + ((PATH_X + rx) * F) / d, y: HOR + ((CAM_H - up) * F) / d, s: F / d });
  for (const up of [0.5, 1.02]) {
    const a = atD(nearD, up), th = Math.max(1, 0.05 * ns);
    c.fillStyle = INK; c.beginPath(); c.moveTo(a.x - 1, a.y - th - 1); c.lineTo(VP + sway, HOR); c.lineTo(a.x - 1, a.y + th + 1); c.closePath(); c.fill();
    c.fillStyle = I[2]; c.beginPath(); c.moveTo(a.x, a.y - th); c.lineTo(VP + sway, HOR); c.lineTo(a.x, a.y + th); c.closePath(); c.fill();
    c.fillStyle = I[4]; c.beginPath(); c.moveTo(a.x, a.y - th); c.lineTo(VP + sway, HOR); c.lineTo(a.x, a.y - th * 0.3); c.closePath(); c.fill();
  }
  const first = Math.floor(travel / 2.4);
  for (let i = first + 60; i >= first; i--) {
    const d = i * 2.4 - travel;
    if (d < nearD) continue;
    const foot = atD(d, 0), top = atD(d, 1.08), pw = Math.max(1, Math.round(0.07 * foot.s));
    if (foot.y - top.y < 1) continue;
    box(c, foot.x - pw / 2 - 1, top.y, pw + 2, foot.y - top.y, INK);
    box(c, foot.x - pw / 2, top.y, pw, foot.y - top.y, I[2]);
    if (pw > 2) box(c, foot.x - pw / 2, top.y, Math.max(1, pw * 0.3), foot.y - top.y, I[4]);
    if (top.s > 6) ball(c, foot.x, top.y - 0.04 * top.s, Math.max(1, 0.06 * top.s), hour('#30343C'));
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Along the way

/** Mexico's fronts down the right (the streets' own), facing him: two before the gate, three past it. */
const FRONTS: [MxFront, number][] = [
  [{ rx: 620, w: 300, h: 190, col: '#EC4899', name: 'TIENDA', sub: 'EVERYTHING $25' }, 4.5],
  [{ rx: 960, w: 260, h: 160, col: '#F59E0B', name: 'PANADERIA', sub: 'BREAD (MEXICAN)' }, 10.5],
  [{ rx: 3220, w: 260, h: 170, col: '#14B8A6', name: 'FARMACIA', sub: 'NO PRESCRIPTION' }, GATE_Z + 4],
  [{ rx: 3420, w: 360, h: 230, col: '#EC4899', name: 'CANTINA', sub: 'NOW SERVING NACHOS' }, GATE_Z + 10],
  [{ rx: 3820, w: 300, h: 180, col: '#F59E0B', name: 'ZAPATERIA', sub: 'SHOES (WE THINK)' }, GATE_Z + 17],
];
/** A front, its plywood's bracing peeking out past its near end (2x4 kickers, sandbags on their feet). */
const paintBraced = (f: MxFront) => (g: Ctx) => {
  two4(g, 14, -f.h * 0.72, -34, 0, 6); two4(g, 14, -f.h * 0.38, -18, 0, 5);
  sandbags(g, -30, 0, 1.4);
  paintFront(g, f);
};

/** Flags of every country, and a few that aren't (stripes; vertical or not). */
const FLAGS: [string[], boolean][] = [
  [['#16A34A', '#F8FAFC', '#DC2626'], true],
  [['#1C1917', '#DC2626', '#FCD34D'], false],
  [['#1E40AF', '#F8FAFC', '#DC2626'], true],
  [['#7C3AED', '#FDE047', '#7C3AED'], false],
  [['#16A34A', '#F8FAFC', '#F97316'], true],
  [['#EC4899', '#14B8A6', '#EC4899', '#14B8A6'], false],
  [['#DC2626', '#F8FAFC', '#DC2626'], true],
  [['#F97316', '#1E3A8A', '#16A34A'], false],
];

/** An iron lamp on its post: the base, the fluted post, the arm, the lantern (lit after dark), a country's pennant
 *  hung off the arm. */
const paintLamp = (k: number) => (g: Ctx) => {
  const I = ramp6(hour('#30343C')), on = timeOfDay().lamps > 0.3, P = FLAGS[k % FLAGS.length][0];
  box(g, -9, -10, 18, 10, INK); box(g, -8, -10, 16, 9, I[2]); box(g, -8, -10, 16, 2, I[4]);
  post(g, 0, -150, -10, 6, I);
  box(g, -1, -150, 22, 4, INK); box(g, 0, -149, 20, 2, I[3]);
  // (the lantern: its cap, the glass (warm after dark), its frame)
  box(g, -9, -176, 18, 4, INK); box(g, -8, -175, 16, 2, I[3]); box(g, -2, -180, 4, 4, INK);
  box(g, -7, -172, 14, 20, INK); box(g, -6, -171, 12, 18, on ? '#FFE7A0' : hour('#BFD4DC')); box(g, -6, -171, 4, 18, on ? '#FFF6D0' : hour('#E2EEF2'));
  box(g, -1, -171, 2, 18, I[1]);
  // (the pennant hung off the arm: a long point down, in the country's stripes, inked, its fold shaded)
  for (let i = 0; i < 34; i++) {
    const w = Math.max(1, Math.round(16 * (1 - i / 34))), x0 = 12 - w / 2 + Math.round(Math.sin(i * 0.2) * 1), y = -146 + i;
    box(g, x0 - 1, y, w + 2, 1, INK);
    P.forEach((col, j) => { const a = Math.round((w * j) / P.length), b = Math.round((w * (j + 1)) / P.length); if (b > a) box(g, x0 + a, y, b - a, 1, ramp6(hour(col))[i % 8 < 4 ? 3 : 2]); });
  }
};
const lampGlow = (c: Ctx, sx: number, sy: number, s: number) => {
  if (timeOfDay().lamps <= 0.3) return;
  const y = sy - (164 / PPM) * s;
  for (const [r, a] of [[0.9, 0.08], [0.6, 0.12], [0.35, 0.18]] as const) { c.fillStyle = `rgba(255, 220, 140, ${a})`; c.beginPath(); c.arc(Math.round(sx), Math.round(y), r * s, 0, Math.PI * 2); c.fill(); }
};

/** A potted saguaro: a terracotta pot in steps, the cactus (ribbed, its arms up), a blossom on top. */
const paintSaguaro = (seed: number) => (g: Ctx) => {
  const C = ramp6(hour('#3F7A34')), T = TERRA, h = 70 + hash(seed) * 30;
  const limb = (x: number, top: number, foot: number, w: number) => {
    box(g, x - w / 2 - 1, top - 1, w + 2, foot - top + 1, INK); box(g, x - w / 2, top, w, foot - top, C[3]);
    box(g, x - w / 2, top, 2, foot - top, C[4]); box(g, x + w / 2 - 2, top, 2, foot - top, C[1]);
    for (let k = 4; k < w - 3; k += 4) box(g, x - w / 2 + k, top + 2, 1, foot - top - 2, C[2]);
    box(g, x - w / 2 + 1, top, w - 2, 2, C[5]);
  };
  limb(0, -32 - h, -30, 16);
  for (const [d, at, up] of [[-1, 0.55, 0.35], [1, 0.4, 0.3]] as const) {
    const ay = -30 - h * at, ax = d * 16;
    box(g, Math.min(0, ax) - 1, ay - 1, 18, 10, INK); box(g, Math.min(0, ax), ay, 16, 8, C[3]); box(g, Math.min(0, ax), ay, 16, 2, C[4]);
    limb(ax, ay - h * up, ay + 8, 10);
  }
  box(g, -3, -36 - h, 6, 4, hour('#F472B6')); box(g, -1, -37 - h, 2, 2, hour('#FDE68A'));
  // (the pot)
  box(g, -21, -32, 42, 32, INK); box(g, -20, -31, 40, 30, T[3]); box(g, -20, -31, 6, 30, T[4]); box(g, 12, -31, 8, 30, T[1]);
  box(g, -23, -34, 46, 7, INK); box(g, -22, -33, 44, 5, T[4]); box(g, -22, -33, 44, 1, T[5]);
  for (let k = 0; k < 5; k++) box(g, -14 + k * 7, -20, 4, 4, k % 2 ? TALA[3] : WHITE[4]);
};

/** Papel picado strung across from pole to pole: rows of cut tissue in every color, the cut-outs showing through. */
const PICADO = ['#EC4899', '#F59E0B', '#22C55E', '#3B82F6', '#A855F7', '#EF4444'];
const paintPicado = (w: number) => (g: Ctx) => {
  const I = ramp6(hour('#6A6E74'));
  for (const px of [0, w]) post(g, px, -260, 0, 4, I);
  for (const [y0, sag] of [[-250, 34], [-212, 26]] as const) {
    const n = Math.floor(w / 22);
    g.strokeStyle = INK; g.lineWidth = 1; g.beginPath();
    for (let i = 0; i <= 40; i++) { const u = i / 40, x = u * w, y = y0 + sag * 4 * u * (1 - u); i ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke();
    for (let k = 1; k < n; k++) {
      const u = k / n, x = u * w - 8, y = y0 + sag * 4 * u * (1 - u), R = ramp6(hour(PICADO[(k + (y0 > -230 ? 3 : 0)) % PICADO.length]));
      box(g, x - 1, y, 18, 22, INK); box(g, x, y + 1, 16, 20, R[3]); box(g, x, y + 1, 16, 2, R[4]); box(g, x + 13, y + 3, 3, 18, R[2]);
      // (the cut-outs: a flower, little holes; the fringe along the foot)
      g.clearRect(x + 6, y + 7, 4, 4); g.clearRect(x + 3, y + 14, 2, 2); g.clearRect(x + 11, y + 14, 2, 2); g.clearRect(x + 7, y + 4, 2, 2);
      for (let q = 0; q < 16; q += 2) g.clearRect(x + q, y + 19, 1, 2);
    }
  }
};

/** One of the cast at their post (the streets' own, in their costume), standing, facing `dir`. */
const castAt = (id: string, x: number, z: number, seed: number, C: Costume, dir: 1 | -1): Prop => {
  const woman = lookOf(seed).woman, F0 = frameOf(seed, seed * 7, 'stand', 'ok', 0, woman);
  return sq(`cast-${id}`, x, z, 150, 142, 75, 138, g => { g.scale(dir, 1); paintCast(g, F0, C, woman); }, { res: 30 });
};

const props = (): Prop[] => {
  const out: Prop[] = [];
  // The gate (Mexico's, the land's: the board hung off it, its two flags), dead ahead, its middle on his path
  out.push(sq('gate', (350 - (40 + 275)) / GATE_PPM, GATE_Z, 700, 380, 40, 372, g => {
    paintGate(g);
    hungBoard(g, 275, -300, -254, ['FOREIGN LANDS', 'THE WHOLE WORLD, FIXED.'], LOOKS.land(2), '#B91C1C');
    flagPole(g, 70, 0, 210, ['#16A34A', '#F8FAFC', '#DC2626'], 0, true);
    flagPole(g, 600, 0, 210, ['#F8FAFC', '#DC2626', '#F8FAFC', '#DC2626'], 40, false);
  }, { ppm: GATE_PPM, res: 22, words: true }));
  // Mexico's fronts down the right, braced
  for (const [f, z] of FRONTS) { const tw = f.w + 90, th = f.h + 60; out.push(sq(`front-${f.name}`, 6.6 + tw / PPM / 2, z, tw, th, 60, th - 4, paintBraced(f), { res: 20, words: true })); }
  // The lamps either side, staggered, their pennants; on past the gate
  for (let i = 0; i < 6; i++) {
    const side = i % 2 ? 1 : -1, z = 2.5 + i * 3.4 + (i > 3 ? 4 : 0);
    out.push({ ...sq(`lamp${i % 4}`, side > 0 ? 4.6 : RAIL_X + 0.5, z, 60, 186, 22, 184, paintLamp(i)), live: lampGlow });
  }
  // Flags on their poles down the right, in among the fronts
  for (let i = 0; i < 5; i++) { const [st, vert] = FLAGS[(i * 3) % FLAGS.length]; out.push(sq(`flag${(i * 3) % FLAGS.length}`, 5.6, 2 + i * 4.2 + (i > 2 ? 4 : 0), 70, 222, 10, 216, g => flagPole(g, 0, 0, 200, st, i * 37, vert))); }
  // Potted saguaros along the way
  for (const [x, z, k] of [[3.4, 6.2, 0], [-4.4, 11.6, 1], [3.6, 14.8, 2], [-4.2, GATE_Z + 3, 3], [3.8, GATE_Z + 8, 4]] as const) out.push(sq(`saguaro${k}`, x, z, 80, 170, 40, 166, paintSaguaro(k)));
  // Papel picado strung across past the gate
  for (const z of [GATE_Z + 2.5, GATE_Z + 9]) out.push(sq('picado', -0.2, z, 420, 270, 10, 266, paintPicado(400), { res: 20 }));
  // The cast at their posts: the mariachi trio by the railing, the sombrero seller, the pinata host past the gate
  out.push(castAt('mar0', -4.5, 6.4, 1203, MARIACHI_COSTUME, 1));
  out.push(castAt('mar1', -3.9, 7.1, 2711, MARIACHI_COSTUME, 1));
  out.push(castAt('mar2', -4.7, 7.8, 3389, MARIACHI_COSTUME, 1));
  out.push(castAt('somb', 3.4, 12.4, 4417, SOMBRERO_COSTUME, -1));
  out.push(castAt('pin', -2.6, GATE_Z + 5, 5023, PINATA_COSTUME, 1));
  return out;
};

export const INTO_FOREIGN: PortalDef = {
  land: 'FOREIGN LANDS',
  lines: ['THE WHOLE WORLD, FIXED. NO PASSPORT NEEDED.', 'NO PASSPORT ALLOWED.'],
  haze: '#BFDBFE',
  ground, back, props,
  rim: () => hourMix('#E0F2FE', '#F59E0B', '#BFDBFE'),
};
