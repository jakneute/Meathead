import { type Ctx, INK, R, poly, ell, line, txt, sign } from './kit';
import { ramp, hash, dith, wall, drum, courses, cone, gable, snowCap, pennant } from './kitFJF';
import { farWheel } from '../../../fantasy/glimpse';

// ---------------------------------------------------------------------------------------------------------------
// FAIRY LAND (the second pass): each attraction as it looks in its own land (fantasy/monument.ts's castle, glimpse.ts's
// wheel and coaster, the square's crooked shops, the glen's toadstools and gingerbread, the keep's broom port), small,
// under snow, lit from the sunrise (upper right).

const STONE = ['#6A5A8C', '#9484B4', '#BCAED6', '#DCD2EC', '#F4EEFA'];
const ROOF = ['#1E3678', '#2E52A8', '#4A78D4', '#7AA8F0', '#B8D0FF'];
const SLATE = ['#262A40', '#343A54', '#4C5270', '#6A7290', '#8E96B0'];
const GOLD = ['#8A6218', '#C8962A', '#F2C84A', '#FFF0A0', '#FFFBE0'];
const PINK = ['#8E2A66', '#D8609E', '#F49AC8', '#FFD0E8', '#FFF0F8'];
const ROCK = ['#3A3852', '#56546E', '#76748E', '#9A98B0', '#C0BED0'];
const SNOW = ['#8E98BC', '#C4CCE4', '#E6ECF8', '#FFFFFF', '#FFFFFF'];
const PINE = ['#12301F', '#1F5A3A', '#2E7A4A', '#4A9A5A', '#7ABF7A'];
/** The three dragons' colors: its track, its light, its spine (LIGHTNING, FIRE, ICE). */
const LANE: [string, string, string][] = [['#FACC15', '#FEF9C3', '#6D28D9'], ['#EA580C', '#FDBA74', '#991B1B'], ['#38BDF8', '#F0F9FF', '#1D4ED8']];

/** A snowy pine, its foot at (x, 0)+y. */
const pine = (g: Ctx, x: number, y: number, h: number) => {
  R(g, x, y - 3, 1, 3, '#4A3424');
  for (let k = 0; k < 3; k++) {
    const top = y - h + (k * (h - 3)) / 3, half = 2 + k * (h / 9), bot = top + (h - 3) / 3 + 2;
    poly(g, [x + 0.5, top - 1, x + half + 1.5, bot, x - half - 0.5, bot], INK, false);
    poly(g, [x + 0.5, top, x + half + 0.5, bot - 1, x - half + 0.5, bot - 1], PINE[1], false);
    poly(g, [x + 0.5, top, x + half + 0.5, bot - 1, x + 0.5, bot - 1], PINE[2], false);
    R(g, x - half * 0.3, bot - 2, half * 1.2, 1, SNOW[3]); R(g, x, top + 1, 1, 1, SNOW[3]);
  }
};
/** A round castle tower: the drum in stone, slits, a corbelled band, the cone roof banded in gold, snow on its brim,
 *  a gold finial and (flag) a pink pennant. (cx, foot) its foot's middle; top the drum's top. */
const tower = (g: Ctx, cx: number, foot: number, w: number, top: number, roofH: number, roof: string[], flag = true) => {
  const x = Math.round(cx - w / 2);
  drum(g, x, top, w, foot - top, STONE);
  for (let y = top + 6; y < foot - 2; y += 6) R(g, x, y, w, 1, STONE[1]);
  for (let y = top + 9, k = 0; y < foot - 8; y += 14, k++) { R(g, cx - 1 + (k % 2 ? 2 : -1), y, 1, 4, INK); R(g, cx + (k % 2 ? 2 : -1), y, 1, 1, '#FF9AC8'); }
  R(g, x - 2, top - 3, w + 4, 4, INK); R(g, x - 1, top - 2, w + 2, 2, STONE[3]); R(g, x - 1, top - 2, Math.round(w * 0.3), 2, STONE[1]);
  const hw = w / 2 + 2, rb = top - 3;
  cone(g, cx, rb, hw, roofH, roof);
  if (roof === ROOF) for (const k of [0.3, 0.6]) { const yb = Math.round(rb - roofH * k), half = hw * (1 - k); R(g, cx - half, yb, half * 2, 1, GOLD[2]); R(g, cx + half * 0.2, yb, half * 0.6, 1, GOLD[3]); }
  R(g, cx - hw, rb - 1, hw * 2, 1, SNOW[3]); R(g, cx - hw * 0.2, rb - 2, hw * 0.9, 1, SNOW[3]);
  R(g, cx, rb - roofH - 3, 1, 3, GOLD[1]); R(g, cx, rb - roofH - 4, 1, 1, GOLD[3]);
  if (flag) pennant(g, cx, rb - roofH - 3, 6, PINK[2], GOLD[1]);
};

// ---------------------------------------------------------------------------------------------------------------

/** HOGSMEAT: the square's crooked half-timbered shops under snow (WANDS & SONS the tall thin one), the butter brew
 *  cart, the bandstand, lamps; the storybook shingle on its post. */
export const paintHogsmeat = (g: Ctx) => {
  // (the cobbles, slush in the ruts)
  R(g, -92, -3, 184, 3, '#8E8AA6'); R(g, -92, -3, 184, 1, '#C8C4DC'); for (let x = -90; x < 92; x += 5) R(g, x, -2, 1, 2, '#6A6684');
  sign(g, 'HOGSMEAT', 46, -57, 0, '#3A2A5A', GOLD[3], 5);
  R(g, 23, -58, 46, 1, SNOW[3]);
  const WALLS = ['#E8D8B8', '#D8C0A0', '#CDB8D8', '#E0CDB0'], ROOFS = [SLATE, ['#3A2A4A', '#4A3A5A', '#6A5A7A', '#8A7A9A', '#B0A0C0'], ['#4A2A22', '#6A3A2E', '#8A4E3C', '#A86A54', '#C89078']];
  const house = (x: number, w: number, h: number, k: number, lean: number) => {
    const P = ramp(WALLS[k % WALLS.length]), Rf = ROOFS[k % ROOFS.length], rh = 10 + (k % 3) * 3;
    g.save(); g.transform(1, 0, lean, 1, -lean * 0, 0);
    wall(g, x, -h, w, h, P);
    // (the timbers: posts, a rail, braces)
    const T = '#4A2E1A';
    R(g, x, -h, 1, h, T); R(g, x + w - 1, -h, 1, h, T); R(g, x, -Math.round(h * 0.52), w, 1, T); R(g, x + Math.round(w / 2), -h, 1, Math.round(h * 0.48), T);
    line(g, x + 1, -h + 1, x + w / 2, -h * 0.52, T); line(g, x + w - 1, -h + 1, x + w / 2 + 1, -h * 0.52, T);
    // (windows: leaded, warm; the door)
    for (const wx of [x + 3, x + w - 7]) { R(g, wx - 1, -h + 4, 6, 6, INK); R(g, wx, -h + 5, 4, 4, '#FFD88A'); R(g, wx + 2, -h + 5, 1, 4, '#C88A2A'); R(g, wx, -h + 5, 4, 1, '#FFF2C0'); }
    R(g, x + Math.round(w / 2) - 3, -9, 6, 9, INK); R(g, x + Math.round(w / 2) - 2, -8, 4, 8, ['#7A2A2A', '#2A5A4A', '#3A3A7A'][k % 3]); R(g, x + Math.round(w / 2) + 1, -5, 1, 1, GOLD[2]);
    // (the awning's stripe over the shop window on some)
    if (k % 2) for (let s = 0; s < w - 2; s += 2) R(g, x + 1 + s, -12, 2, 2, s % 4 ? '#F8FAFC' : '#C8304A');
    // (the roof: steep, its slates in rows, snow heavy on it, the chimney)
    R(g, x + w - 7, -h - rh + 1, 4, 7, INK); R(g, x + w - 6, -h - rh + 2, 2, 6, '#8A5A4A'); R(g, x + w - 7, -h - rh, 4, 2, SNOW[3]);
    gable(g, x - 1, x + w + 1, -h, rh, Rf, k % 2 ? 0.4 : 0.58);
    const mx = x - 1 + (w + 2) * (k % 2 ? 0.4 : 0.58);
    poly(g, [mx - 5, -h - rh + 6, mx, -h - rh, mx + 6, -h - rh + 6, mx + 3, -h - rh + 5, mx, -h - rh + 3, mx - 2, -h - rh + 6], SNOW[3], false);
    R(g, x - 2, -h - 1, w + 4, 2, SNOW[3]); R(g, x - 2, -h + 1, w + 4, 1, SNOW[1]);
    for (let s = x; s < x + w; s += 4) if (hash(s + k) > 0.5) R(g, s, -h + 1, 1, 2, '#DCEBFF');
    g.restore();
  };
  house(-88, 24, 24, 0, 0.04); house(-60, 22, 30, 1, -0.05); house(-20, 26, 26, 3, 0.05); house(34, 24, 28, 4, -0.04); house(62, 26, 22, 5, 0.05);
  // (WANDS & SONS: tall and narrow, stacked to the top with wand boxes)
  {
    const P = ramp('#5A4A7A');
    wall(g, -34, -42, 12, 42, P);
    for (let y = -39; y < -12; y += 3) for (let x = -33; x < -24; x += 3) R(g, x, y, 2, 2, ['#C8962A', '#8A4E3C', '#D8C0A0', '#2E52A8'][Math.floor(hash(x * 3 + y) * 4)]);
    R(g, -31, -9, 6, 9, INK); R(g, -30, -8, 4, 8, '#2A1A3A');
    R(g, -36, -14, 16, 4, INK); R(g, -35, -13, 14, 2, GOLD[2]);
    cone(g, -28, -43, 8, 14, SLATE); R(g, -36, -44, 16, 1, SNOW[3]);
  }
  // (the bandstand: white posts, a green roof, its gold finial, bunting)
  {
    R(g, 8, -5, 22, 2, '#E8E4F0'); R(g, 8, -5, 22, 1, '#FFFFFF');
    for (const x of [9, 15, 22, 28]) { R(g, x, -18, 1, 13, '#F8FAFC'); }
    poly(g, [5, -18, 19, -30, 33, -18], INK, false); poly(g, [6, -18, 19, -29, 32, -18], '#2E7A5A', false); poly(g, [19, -18, 19, -29, 32, -18], '#4AA07A', false);
    R(g, 5, -19, 28, 1, SNOW[3]); R(g, 19, -33, 1, 4, GOLD[2]);
    for (let k = 0; k < 5; k++) R(g, 10 + k * 4, -17 + (k % 2), 2, 2, [PINK[2], GOLD[2], '#7AA8F0'][k % 3]);
  }
  // (lamps, lit; the brew cart)
  for (const x of [-64, 2, 58]) { R(g, x, -16, 1, 16, '#2A2438'); R(g, x - 1, -19, 3, 3, INK); R(g, x, -18, 1, 1, '#FFE9A8'); }
  R(g, -8, -8, 10, 5, '#8A4E2A'); R(g, -8, -8, 10, 1, '#C88A4A'); ell(g, -6, -2, 2, 2, '#3A2A1A', false); ell(g, 0, -2, 2, 2, '#3A2A1A', false);
  for (let s = 0; s < 5; s++) R(g, -9 + s * 2.4, -13, 3, 2, s % 2 ? '#F8FAFC' : '#C8304A'); R(g, -8, -11, 1, 3, '#5A3A1A'); R(g, 1, -11, 1, 3, '#5A3A1A');
  pine(g, -92, 0, 20); pine(g, 91, 0, 22);
};

/** THE FAIRY WHEEL: the land's own (glimpse.ts's painter: the lilac A-frame, the double lavender rim laced in a
 *  zigzag, pink and mint spokes, the pink flower hub and its gold heart, the toadstool gondolas), on its boarding deck,
 *  its sign on the deck's front. */
export const paintFairyWheel = (g: Ctx) => {
  // (the queue's rail behind, the deck)
  for (let x = -44; x <= 44; x += 8) R(g, x, -9, 1, 6, '#8A7AA4'); R(g, -44, -9, 89, 1, '#B8A4DC');
  farWheel(g, c => c, 0, -62, 42, -3, false);
  // (ink round the rim's outside so it holds against the sky; a glint up its lit side)
  g.strokeStyle = '#FFFFFF'; g.lineWidth = 1; g.beginPath(); g.arc(0, -62, 43, -1.1, -0.3); g.stroke();
  R(g, -50, -4, 100, 4, INK); R(g, -49, -3, 98, 3, '#968EB4'); R(g, -49, -3, 98, 1, '#E8E0FA'); dith(g, -49, -1, 98, 1, '#6A5A8C');
  snowCap(g, -49, -4, 14, 1); snowCap(g, 34, -4, 15, 1);
  sign(g, 'THE FAIRY WHEEL', 0, -15, -3, PINK[1], '#FFFFFF', 4, true);
};

/** THE ENCHANTED GLEN: the giant toadstools, THE STORYBOOK BRIDGE (out: a hump of old stone with its middle gone over
 *  the misty brook), the witch's gingerbread cottage (candy roof, icing, DO NOT EAT THE HOUSE), briars. */
export const paintGlen = (g: Ctx) => {
  R(g, -68, -2, 136, 2, '#C4CCE4'); R(g, -68, -2, 136, 1, '#FFFFFF');
  sign(g, 'THE ENCHANTED GLEN', 0, -55, 0, '#FDE68A', '#4A2A14', 4);
  R(g, -39, -56, 78, 1, SNOW[3]);
  // (the toadstools: fat white stalks with a skirt, spotted caps lit on the right)
  const stool = (x: number, h: number, r: number, col: string) => {
    const C = ramp(col);
    R(g, x - 3, -h, 6, h, INK); R(g, x - 2, -h, 4, h, '#F5E6C8'); R(g, x - 2, -h, 1, h, '#C8B490'); R(g, x + 1, -h, 1, h, '#FFFFFF'); R(g, x - 3, -h + 3, 6, 1, '#C8B490');
    g.fillStyle = INK; g.beginPath(); g.ellipse(x, -h, r + 1, r * 0.62 + 1, 0, Math.PI, 0); g.fill();
    g.fillStyle = C[2]; g.beginPath(); g.ellipse(x, -h, r, r * 0.62, 0, Math.PI, 0); g.fill();
    g.fillStyle = C[1]; g.beginPath(); g.ellipse(x - r * 0.4, -h, r * 0.6, r * 0.5, 0, Math.PI, 0); g.fill();
    g.fillStyle = C[3]; g.beginPath(); g.ellipse(x + r * 0.35, -h - r * 0.12, r * 0.45, r * 0.36, 0, Math.PI, 0); g.fill();
    R(g, x - r, -h, r * 2, 1, C[0]);
    for (let k = 0; k < Math.round(r / 2.2); k++) { const sx = x - r * 0.7 + k * (r * 1.4 / Math.max(1, Math.round(r / 2.2) - 1)), sy = -h - 2 - Math.sin((k + 0.5) / Math.round(r / 2.2) * Math.PI) * r * 0.36; R(g, sx - 1, sy, 2, 2, '#FFFFFF'); }
    R(g, x + r * 0.4, -h - r * 0.5, 2, 1, '#FFFFFF');
  };
  stool(-58, 24, 10, '#DC2626'); stool(-42, 13, 7, '#F472B6'); stool(-50, 7, 4, '#A855F7');
  // (the bridge: two halves of a stone hump, the keystone gone, the brook under it, mist)
  R(g, -22, -4, 44, 4, '#5A84C8'); R(g, -22, -4, 44, 1, '#BFDBFE'); dith(g, -22, -3, 44, 1, '#8AB0E8');
  {
    const top = (x: number) => -7 - 13 * Math.cos((x / 31) * Math.PI / 2), under = (x: number) => (Math.abs(x) < 11 ? -Math.sqrt(121 - x * x) * 0.75 : 0);
    const gone = (x: number) => Math.abs(x + 1) < 3 + (x & 1);
    for (const pass of [0, 1]) for (let x = -30; x <= 30; x++) {
      if (gone(x)) continue;
      const t = Math.round(top(x)), u = Math.round(under(x));
      if (pass === 0) { R(g, x - 1, t - 1, 3, u - t + 2, INK); continue; }
      R(g, x, t, 1, u - t, x > 4 ? STONE[3] : STONE[x < -14 ? 1 : 2]); R(g, x, t, 1, 1, STONE[4]); if (u < 0) R(g, x, u - 1, 1, 1, STONE[0]);
      if ((x + 30) % 6 === 0) R(g, x, t + 2, 1, Math.max(0, u - t - 3), STONE[1]);
    }
    for (let x = -28; x <= 28; x += 8) { if (gone(x) || gone(x + 1) || gone(x - 1)) continue; const t = Math.round(top(x)); R(g, x, t - 5, 1, 5, '#6A4A2A'); R(g, x, t - 6, 1, 1, '#FFFFFF'); }
  }
  for (const [x, y] of [[-2, -13], [1, -9], [-1, -6]] as const) R(g, x, y, 2, 2, STONE[2]);
  for (let k = 0; k < 5; k++) { g.fillStyle = 'rgba(236,240,255,0.6)'; g.fillRect(-18 + k * 8, -7 - (k % 2) * 2, 7, 2); }
  // (the gingerbread cottage: brown walls iced white, a candy roof, a candy cane post, the smoking chimney)
  {
    const G = ramp('#A8663A');
    wall(g, 34, -20, 28, 20, G);
    for (let x = 35; x < 61; x += 3) R(g, x, -20 + (x % 2), 2, 2, '#FFFFFF');
    R(g, 38, -14, 6, 6, INK); R(g, 39, -13, 4, 4, '#FFD88A'); R(g, 41, -13, 1, 4, '#FFFFFF'); R(g, 39, -11, 4, 1, '#FFFFFF');
    R(g, 50, -11, 7, 11, INK); R(g, 51, -10, 5, 10, '#C8304A'); R(g, 51, -10, 5, 1, '#FFFFFF'); R(g, 54, -6, 1, 1, GOLD[3]);
    R(g, 55, -34, 5, 9, INK); R(g, 56, -33, 3, 8, '#8A4E3C'); R(g, 55, -35, 5, 2, '#FFFFFF');
    gable(g, 32, 64, -20, 13, ['#8E2A66', '#B8407E', '#F472B6', '#F9A8D4', '#FFE0F0']);
    for (let r = 0; r < 4; r++) for (let x = 36 + r * 3; x < 62 - r * 3; x += 4) R(g, x, -22 - r * 3, 2, 2, ['#FDE047', '#34D399', '#60A5FA', '#FFFFFF'][(x + r) % 4]);
    R(g, 31, -21, 34, 2, '#FFFFFF'); for (let x = 32; x < 64; x += 3) R(g, x, -19, 1, 1 + (x % 2), '#FFFFFF');
    for (let k = 0; k < 6; k++) R(g, 66, -12 + k * 2, 2, 2, k % 2 ? '#FFFFFF' : '#DC2626'); R(g, 64, -14, 4, 2, '#DC2626');
  }
  // (briars along the foot, thorned)
  for (let x = -34; x < 34; x += 6) if (Math.abs(x) > 24) { line(g, x, 0, x + 3, -5, '#3A2A3A'); R(g, x + 2, -4, 1, 1, '#DC2626'); }
  R(g, -15, -32, 1, 14, '#5A3A1A'); R(g, -22, -41, 44, 9, INK); R(g, -21, -40, 42, 7, '#FDE047'); R(g, -21, -40, 42, 1, '#FFF8C0'); txt(g, 'BRIDGE OUT', 0.5, -34, '#1A1A1A', 4);
  pine(g, 22, 0, 16); pine(g, -27, 0, 18);
};

/** TRUELLING TRAGONS: the three dragons' tracks (LIGHTNING yellow on purple, FIRE orange on red, ICE blue on blue) on
 *  their steel lattice, each standing up into a loop, diving into the snow-capped plaster mountain's tunnel; the load
 *  station at the start, the three dragon heads up over its roof; a train on the lift; the sign on its frame. */
export const paintTragons = (g: Ctx) => {
  const ST = ramp('#7A84A0');
  R(g, -102, -2, 204, 2, '#C4CCE4'); R(g, -102, -2, 204, 1, '#FFFFFF');
  // (the sign first: its posts go down behind the steel)
  sign(g, 'TRUELLING TRAGONS', -22, -83, 0, '#3B1A7A', GOLD[3], 5, true);
  R(g, -67, -84, 91, 1, SNOW[3]);
  // (the mountain: plaster rock in steps, lit on the right, snow on its head and caught on its ledges, the tunnel)
  const mx = 60, mw = 41, mh = 72;
  poly(g, [mx - mw - 1, 0, mx - mw * 0.55, -mh * 0.5, mx - mw * 0.2, -mh * 0.9, mx, -mh - 1, mx + mw * 0.24, -mh * 0.82, mx + mw * 0.6, -mh * 0.46, mx + mw + 1, 0], INK);
  poly(g, [mx - mw, 0, mx - mw * 0.55, -mh * 0.5 + 1, mx - mw * 0.2, -mh * 0.9 + 1, mx, -mh, mx + mw * 0.24, -mh * 0.82 + 1, mx + mw * 0.6, -mh * 0.46 + 1, mx + mw, 0], ROCK[2], false);
  poly(g, [mx - mw, 0, mx - mw * 0.55, -mh * 0.5 + 1, mx - mw * 0.2, -mh * 0.9 + 1, mx, -mh, mx - mw * 0.16, -mh * 0.4, mx - mw * 0.36, 0], ROCK[1], false);
  poly(g, [mx + mw * 0.1, -mh * 0.5, mx, -mh, mx + mw * 0.24, -mh * 0.82 + 1, mx + mw * 0.6, -mh * 0.46 + 1, mx + mw, 0, mx + mw * 0.5, 0], ROCK[3], false);
  dith(g, mx - mw * 0.36, -mh * 0.4, 3, mh * 0.4, ROCK[1]);
  for (let k = 0; k < 9; k++) { const sx = mx - mw * 0.7 + k * mw * 0.17, sy = -mh * (0.12 + hash(k * 3.7) * 0.36); R(g, sx, sy, 7, 1, ROCK[0]); R(g, sx + 1, sy - 1, 5, 1, SNOW[3]); }
  poly(g, [mx - mw * 0.34, -mh * 0.7, mx - mw * 0.2, -mh * 0.9 + 1, mx, -mh, mx + mw * 0.24, -mh * 0.82 + 1, mx + mw * 0.36, -mh * 0.66, mx + mw * 0.2, -mh * 0.72, mx + mw * 0.08, -mh * 0.62, mx - mw * 0.06, -mh * 0.74, mx - mw * 0.2, -mh * 0.64], SNOW[3], false);
  poly(g, [mx - mw * 0.34, -mh * 0.7, mx - mw * 0.2, -mh * 0.9 + 1, mx, -mh, mx - mw * 0.1, -mh * 0.76, mx - mw * 0.2, -mh * 0.64], SNOW[1], false);
  const tx = mx - mw * 0.42;
  g.fillStyle = INK; g.beginPath(); g.ellipse(tx, -14, 11, 14, 0, Math.PI, 0); g.fill(); R(g, tx - 11, -14, 22, 14, INK);
  g.fillStyle = '#0B0612'; g.beginPath(); g.ellipse(tx, -14, 9, 12, 0, Math.PI, 0); g.fill(); R(g, tx - 9, -14, 18, 14, '#0B0612');
  for (let k = 0; k < 5; k++) R(g, tx - 8 + k * 4, -25 + Math.abs(k - 2) * 2, 2, 3, SNOW[3]);
  for (const [px, ph] of [[mx + 30, 13], [mx + 38, 10], [mx + 22, 9]] as const) pine(g, px, 0, ph);
  // (the tracks' lines; each hides where it's gone into the mountain)
  const x0 = -66, x1 = 100, wv = x1 - x0;
  const trackY = (k: number, x: number) => -20 - Math.sin((x - x0) * (9 / wv) + k * 2.1) * 7 - Math.sin((x - x0) * (21 / wv) + k) * 3 - k * 5;
  const inHill = (x: number) => x > tx - 3;
  // (the legs: steel lattice down to the snow)
  for (let x = x0 + 4; x < tx - 8; x += 7) for (let k = 0; k < 3; k++) {
    const y = Math.round(trackY(k, x));
    R(g, x, y + 2, 1, -y - 2, ST[k === 0 ? 3 : 1]);
    if (k === 2 && ((x - x0 - 4) / 7) % 2 === 0) { line(g, x, y + 4, x + 7, -1, ST[1]); line(g, x + 7, y + 4, x, -1, ST[1]); }
  }
  const loopX = [-50, -26, -3];
  for (let k = 2; k >= 0; k--) {
    const [main, light, dark] = LANE[k];
    // (its loop, standing up off it: spine, track, light)
    const lx = loopX[k], ly = trackY(k, lx) - 12;
    R(g, lx, ly + 12, 1, -ly - 12, ST[1]);
    for (const [col, lw] of [[INK, 5], [dark, 3.4], [main, 2]] as [string, number][]) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.ellipse(lx, ly, 8, 12, 0, 0, Math.PI * 2); g.stroke(); }
    g.strokeStyle = light; g.lineWidth = 1; g.beginPath(); g.ellipse(lx, ly, 8.5, 12.5, 0, -1.3, 0.2); g.stroke();
    for (const [col, lw, dy] of [[INK, 5, 0.5], [dark, 3.4, 0.5], [main, 2, 0], [light, 1, -0.5]] as [string, number, number][]) {
      g.strokeStyle = col; g.lineWidth = lw; g.lineJoin = 'round'; g.beginPath();
      let on = false;
      for (let x = x0; x <= x1; x += 2) { if (inHill(x)) { on = false; continue; } const y = trackY(k, x) + dy; if (on) g.lineTo(x, y); else g.moveTo(x, y); on = true; }
      g.stroke();
    }
  }
  // (a train on the yellow track: three cars and the dragon's head, riders' heads)
  for (let c = 0; c < 4; c++) {
    const x = -14 + c * 6, y = Math.round(trackY(0, x)) - 2;
    R(g, x - 3, y - 4, 6, 5, INK); R(g, x - 2, y - 3, 4, 3, c === 3 ? LANE[0][0] : '#6D28D9'); R(g, x - 2, y - 3, 4, 1, c === 3 ? LANE[0][1] : '#A78BFA');
    if (c < 3) R(g, x - 1, y - 5, 2, 2, ['#F2C9A0', '#8A5A3A', '#E8B48A'][c]); else { R(g, x + 2, y - 5, 2, 2, LANE[0][0]); R(g, x + 3, y - 3, 1, 1, '#FFFFFF'); }
  }
  // (the load station: a castle-stone hall, a snowy slate roof, three arched bays in the dragons' colors, the three
  // heads up over the ridge)
  {
    const sx = -84;
    wall(g, sx - 17, -24, 34, 24, STONE);
    courses(g, sx - 17, -24, 34, 24, STONE[1], 5);
    for (let k = 0; k < 3; k++) { const wx = sx - 13 + k * 10; R(g, wx - 1, -17, 7, 17, INK); g.fillStyle = INK; g.beginPath(); g.arc(wx + 2.5, -17, 3.5, Math.PI, 0); g.fill(); R(g, wx, -16, 5, 16, LANE[k][2]); R(g, wx + 3, -16, 2, 16, LANE[k][0]); R(g, wx, -16, 5, 1, LANE[k][1]); }
    gable(g, sx - 19, sx + 19, -24, 12, SLATE);
    R(g, sx - 20, -25, 40, 2, SNOW[3]); R(g, sx - 20, -23, 40, 1, SNOW[1]); poly(g, [sx - 6, -31, sx, -36, sx + 7, -31], SNOW[3], false);
    for (let k = 0; k < 3; k++) {
      const hx = sx - 12 + k * 11, hy = -38 - (k === 1 ? 6 : 0), C = ramp(LANE[k][0]);
      // (a neck up out of the roof, the head turned right: snout, horn, eye, a white tooth)
      poly(g, [hx - 3, hy + 9, hx - 3, hy + 1, hx - 1, hy - 2, hx + 5, hy - 3, hx + 9, hy, hx + 9, hy + 2, hx + 4, hy + 4, hx + 2, hy + 9], INK, false);
      poly(g, [hx - 2, hy + 9, hx - 2, hy + 1, hx, hy - 1, hx + 5, hy - 2, hx + 8, hy, hx + 8, hy + 1, hx + 3, hy + 3, hx + 1, hy + 9], C[2], false);
      R(g, hx - 2, hy + 1, 1, 8, C[1]); R(g, hx + 1, hy - 1, 4, 1, C[4]); R(g, hx + 4, hy, 1, 1, '#FFFFFF'); R(g, hx + 6, hy + 2, 1, 1, '#FFFFFF');
      poly(g, [hx - 2, hy, hx - 4, hy - 5, hx, hy - 1], C[0], false); R(g, hx - 1, hy + 4, 3, 1, LANE[k][2]);
    }
    pennant(g, sx + 15, -24, 14, PINK[2]);
  }
};

/** THE BROOM PORT: the stands at either end packed with guests under striped canopies, the stand towers hung with
 *  house drapes under their cones, two sets of three gold hoops on striped poles, the scoreboard on the middle tower
 *  (FINAL TRIAL TODAY / PRIZE: THE HIGHEST WINDOW), the plank deck with its center line, a wind sock, the broom rack. */
export const paintBroomPort = (g: Ctx) => {
  // (the deck: planks in bands, the painted line, landing lights)
  R(g, -78, -5, 156, 5, INK); R(g, -77, -4, 154, 4, '#8A6A4A'); R(g, -77, -4, 154, 1, '#D8B88A'); for (let x = -74; x < 76; x += 6) R(g, x, -3, 1, 3, '#5A3E24');
  for (let x = -70; x < 72; x += 10) R(g, x, -2, 4, 1, '#F8FAFC'); for (let x = -76; x < 78; x += 19) R(g, x, -5, 1, 1, '#FFE9A8');
  const HOUSE = ['#B8232A', '#1F7A4A', '#2E52A8', '#E8B020'];
  // (the stands: tiers of benches, the crowd, the hoarding along the front, the striped canopy)
  const stand = (s: number) => {
    const xa = s * 76, xb = s * 40, lo = Math.min(xa, xb), P = ramp('#7A6A8A');
    for (let r = 0; r < 5; r++) {
      const y = -9 - r * 5, inset = r * 2.2, x = lo + (s > 0 ? 0 : inset), w = 36 - inset;
      R(g, x, y - 5, w, 5, P[s > 0 ? 3 : 1]); R(g, x, y - 5, w, 1, P[4]);
    }
    for (let r = 0; r < 5; r++) {
      const y = -9 - r * 5, inset = r * 2.2, x = lo + (s > 0 ? 0 : inset), w = 36 - inset;
      for (let k = 0; k < Math.floor(w / 3); k++) { const hx = x + 1 + k * 3, hh = hash(hx * 1.3 + r * 7); R(g, hx, y - 4 + (hh > 0.8 ? -1 : 0), 2, 3, HOUSE[Math.floor(hash(hx + r * 3) * 4)]); R(g, hx, y - 5 + (hh > 0.8 ? -1 : 0), 2, 1, ['#F2C9A0', '#C68A5E', '#8A5A3A', '#E8B48A'][Math.floor(hh * 4)]); if (hh > 0.9) R(g, hx, y - 8, 1, 2, PINK[2]); }
    }
    R(g, lo - 1, -10, 38, 6, INK); for (let k = 0; k < 4; k++) { R(g, lo + k * 9, -9, 9, 4, HOUSE[k]); R(g, lo + k * 9, -9, 9, 1, '#FFFFFF66'); } R(g, lo + 16, -8, 3, 2, GOLD[3]);
    // (the canopy over the top, striped, on its poles)
    for (const px of [lo + 1, lo + 34]) R(g, px, -42, 1, 34, '#C8B870');
    for (let k = 0; k < 9; k++) R(g, lo + k * 4, -44, 4, 3, k % 2 ? '#F8FAFC' : PINK[1]); R(g, lo - 1, -45, 38, 1, INK); R(g, lo, -41, 36, 1, '#00000055'); snowCap(g, lo, -45, 36, 1);
  };
  stand(-1); stand(1);
  // (the hoops: three gold rings a side, up on striped poles of three heights)
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
    const x = s * (30 - k * 7), h = [38, 52, 44][k];
    for (let y = 0; y < h; y += 4) R(g, x, -5 - y - 4, 1, 4, (y / 4) % 2 ? '#F8FAFC' : '#C8304A');
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.ellipse(x + 0.5, -5 - h - 5, 4, 5, 0, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = GOLD[2]; g.lineWidth = 1.5; g.stroke(); g.strokeStyle = GOLD[4]; g.lineWidth = 1; g.beginPath(); g.ellipse(x + 0.5, -5 - h - 5, 4, 5, 0, -1.4, 0); g.stroke();
  }
  // (the middle tower: stone, house drapes, the scoreboard, a box of guests under its cone, the flag)
  drum(g, -7, -52, 14, 47, STONE); for (let y = -46; y < -6; y += 6) R(g, -7, y, 14, 1, STONE[1]);
  for (let k = 0; k < 2; k++) { R(g, -5 + k * 6, -20, 4, 13, HOUSE[k * 2]); R(g, -5 + k * 6, -20, 1, 13, '#FFFFFF55'); poly(g, [-5 + k * 6, -7, -3 + k * 6, -9, -1 + k * 6, -7], STONE[2], false); }
  R(g, -10, -56, 20, 5, INK); R(g, -9, -55, 18, 3, STONE[3]); for (let k = 0; k < 4; k++) R(g, -7 + k * 4, -58, 2, 3, ['#F2C9A0', '#8A5A3A', '#E8B48A', '#C68A5E'][k]);
  cone(g, 0, -60, 10, 13, ROOF); R(g, -10, -61, 20, 1, SNOW[3]); pennant(g, 0, -73, 6, PINK[2]);
  R(g, -29, -41, 58, 17, INK); R(g, -28, -40, 56, 15, '#1E1B4B'); R(g, -28, -40, 56, 1, '#4A46A0');
  txt(g, 'FINAL TRIAL', 0.5, -33, GOLD[3], 4); txt(g, 'TODAY', 0.5, -27, '#F9A8D4', 4);
  // (bunting slung from the tower to the canopies; the wind sock; the broom rack)
  for (const s of [-1, 1]) for (let k = 1; k < 8; k++) { const u = k / 8, x = s * (8 + u * 30), y = -52 + u * 8 + Math.sin(u * Math.PI) * 5; R(g, x, y, 2, 2, HOUSE[k % 4]); }
  R(g, 36, -24, 1, 19, '#C8B870'); for (let k = 0; k < 4; k++) R(g, 37 + k * 2, -24 + (k > 1 ? 1 : 0), 2, 3 - (k > 2 ? 1 : 0), k % 2 ? '#F8FAFC' : '#F97316');
  R(g, -38, -12, 10, 1, '#5A3E24'); for (let k = 0; k < 4; k++) { line(g, -37 + k * 3, -6, -36 + k * 3, -16, '#8A6A3A'); R(g, -38 + k * 3, -7, 2, 2, '#D8B040'); }
  sign(g, 'THE BROOM PORT', 0, -80, -73, '#3B1A7A', '#F8FAFC', 5, false);
  R(g, -18, -70, 1, 12, '#C8B870'); R(g, 18, -70, 1, 12, '#C8B870');
};

/** THE GREAT PIXIE'S CASTLE (monument.ts's, small): the snowy crag and the switchback road up it, the crenellated
 *  curtain wall and its gate, round towers under blue cones banded in gold with pink pennants, the slate-roofed far
 *  towers, the gothic keep and its rose window, and over it all the highest spire with the highest window (pink
 *  stained glass) and the gold star. */
export const paintPixieCastle = (g: Ctx) => {
  // THE CRAG
  const crag = [-101, 0, -88, -18, -70, -30, -50, -40, 50, -41, 70, -30, 88, -16, 101, 0];
  poly(g, crag, INK);
  poly(g, [-100, 0, -87, -17, -69, -29, -50, -39, 50, -40, 69, -29, 87, -15, 100, 0], ROCK[2], false);
  poly(g, [-100, 0, -87, -17, -69, -29, -50, -39, -36, -39, -58, -18, -72, 0], ROCK[1], false);
  poly(g, [36, -40, 50, -40, 69, -29, 87, -15, 100, 0, 56, 0, 50, -20], ROCK[3], false);
  poly(g, [76, -20, 87, -15, 100, 0, 84, 0], ROCK[4], false);
  dith(g, -58, -18, 2, 18, ROCK[1]); dith(g, 50, -20, 2, 20, ROCK[3]);
  for (const [x0, y0, x1, y1] of [[-88, -12, -58, -22], [-70, -5, -24, -14], [20, -18, 70, -8], [36, -32, 76, -20], [-24, -30, 12, -32]] as const) line(g, x0, y0, x1, y1, ROCK[0]);
  for (const [x, y, w] of [[-84, -18, 16], [-66, -30, 18], [-48, -40, 96], [52, -30, 16], [72, -16, 12], [-40, -12, 12], [26, -10, 12]] as const) snowCap(g, x, y, w, 1);
  // (the road up to the gate: switchbacks in packed snow, lamps along it)
  g.strokeStyle = SNOW[1]; g.lineWidth = 2; g.lineJoin = 'round'; g.beginPath(); g.moveTo(-90, -1); g.lineTo(-22, -11); g.lineTo(-62, -22); g.lineTo(-10, -32); g.lineTo(0, -40); g.stroke();
  g.strokeStyle = SNOW[3]; g.lineWidth = 1; g.beginPath(); g.moveTo(-90, -2); g.lineTo(-22, -12); g.lineTo(-62, -23); g.lineTo(-10, -33); g.stroke();
  for (const [x, y] of [[-56, -6], [-34, -10], [-46, -19], [-30, -29]] as const) { R(g, x, y - 4, 1, 4, INK); R(g, x, y - 5, 1, 1, '#FFE9A8'); }
  for (const [x, h] of [[-96, 12], [-88, 16], [-79, 11], [78, 13], [87, 17], [95, 11], [34, 9]] as const) pine(g, x, 0, h);
  // THE FAR TOWERS (slate: the old bones), behind everything
  tower(g, -45, -56, 10, -100, 15, SLATE, false);
  tower(g, 46, -56, 10, -106, 16, SLATE, false);
  // THE KEEP: tall, gothic, crenellated, the rose window, lancets, the long pink banner
  {
    const x = -20, w = 40, top = -116;
    wall(g, x, top, w, 60, STONE);
    courses(g, x, top, w, 60, STONE[1], 6, STONE[3]);
    for (let k = x; k < x + w; k += 6) { R(g, k - 1, top - 5, 5, 5, INK); R(g, k, top - 4, 3, 4, k > 0 ? STONE[4] : STONE[2]); }
    g.fillStyle = INK; g.beginPath(); g.arc(-8, top + 14, 6.5, 0, Math.PI * 2); g.fill();
    g.fillStyle = PINK[1]; g.beginPath(); g.arc(-8, top + 14, 5.2, 0, Math.PI * 2); g.fill();
    for (let a = 0; a < 6; a++) R(g, -8.5 + Math.cos(a * Math.PI / 3) * 3, top + 13.5 + Math.sin(a * Math.PI / 3) * 3, 1, 1, '#FFE0F0'); R(g, -9, top + 13, 2, 2, GOLD[3]);
    for (const wx of [-14, 9]) for (const wy of [top + 28, top + 44]) { R(g, wx - 1, wy - 1, 5, 11, INK); R(g, wx, wy, 3, 9, '#3A3060'); R(g, wx + 2, wy, 1, 9, '#FFB8DC'); R(g, wx, wy - 2, 3, 1, INK); R(g, wx + 1, wy - 3, 1, 1, INK); }
    // (flying buttresses down to the wall)
    for (const s of [-1, 1]) { g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(s * 20, top + 22); g.quadraticCurveTo(s * 32, top + 30, s * 38, -62); g.stroke(); g.strokeStyle = s > 0 ? STONE[3] : STONE[1]; g.lineWidth = 1; g.stroke(); }
  }
  // THE HIGHEST SPIRE up out of the keep: Piper's window near its top; the tallest cone; the gold star
  {
    const cx = 8, top = -140;
    drum(g, cx - 6, top, 12, 24, STONE); for (let y = top + 5; y < -117; y += 5) R(g, cx - 6, y, 12, 1, STONE[1]);
    R(g, cx - 8, top - 2, 16, 3, INK); R(g, cx - 7, top - 1, 14, 1, STONE[4]);
    R(g, cx - 3, top + 6, 6, 10, INK); g.fillStyle = INK; g.beginPath(); g.arc(cx, top + 6, 3, Math.PI, 0); g.fill();
    R(g, cx - 2, top + 6, 4, 8, PINK[2]); R(g, cx - 2, top + 6, 1, 8, PINK[3]); R(g, cx - 1, top + 4, 2, 2, PINK[2]); R(g, cx - 1, top + 9, 2, 2, '#D8306E'); R(g, cx - 2, top + 12, 4, 1, INK);
    cone(g, cx, top - 2, 9, 17, ROOF);
    for (const k of [0.28, 0.58]) { const yb = Math.round(top - 2 - 17 * k), half = 9 * (1 - k); R(g, cx - half, yb, half * 2, 1, GOLD[2]); R(g, cx + half * 0.2, yb, half * 0.6, 1, GOLD[4]); }
    R(g, cx - 9, top - 3, 18, 1, SNOW[3]);
    const sy = top - 22;
    R(g, cx, sy, 1, 4, GOLD[1]);
    poly(g, [cx + 0.5, sy - 4, cx + 1.5, sy - 1, cx + 4.5, sy - 1, cx + 2, sy + 0.5, cx + 3, sy + 3.5, cx + 0.5, sy + 1.5, cx - 2, sy + 3.5, cx - 1, sy + 0.5, cx - 3.5, sy - 1, cx - 0.5, sy - 1], INK);
    poly(g, [cx + 0.5, sy - 3, cx + 1.2, sy - 0.8, cx + 3.4, sy - 0.8, cx + 1.6, sy + 0.5, cx + 2.3, sy + 2.6, cx + 0.5, sy + 1.2, cx - 1.3, sy + 2.6, cx - 0.6, sy + 0.5, cx - 2.4, sy - 0.8, cx - 0.2, sy - 0.8], GOLD[2], false);
    R(g, cx, sy - 2, 1, 2, GOLD[4]);
  }
  // (two slender spires beside the keep for the skyline)
  for (const [sx, top] of [[-10, -134], [22, -128]] as const) { R(g, sx - 3, top, 6, -116 - top + 4, INK); R(g, sx - 2, top + 1, 4, -116 - top + 2, STONE[2]); R(g, sx + 1, top + 1, 1, -116 - top + 2, STONE[4]); R(g, sx - 1, top + 5, 1, 3, '#FFB8DC'); cone(g, sx, top + 1, 4, 11, ROOF); R(g, sx - 4, top, 8, 1, SNOW[3]); pennant(g, sx, top - 10, 5, PINK[2]); }
  // THE NEAR ROUND TOWERS either side of the keep
  tower(g, -29, -58, 13, -124, 20, ROOF);
  tower(g, 31, -58, 13, -114, 19, ROOF);
  // THE CURTAIN WALL: crenellated, windows in a row, pink banners, the gate (an arch, the gold portcullis, the crest)
  {
    const y = -62, h = 22, x = -58, w = 116;
    wall(g, x, y, w, h, STONE);
    courses(g, x, y, w, h, STONE[1], 5, STONE[3]);
    for (let k = x; k < x + w - 2; k += 6) { R(g, k - 1, y - 5, 5, 5, INK); R(g, k, y - 4, 3, 4, k > 10 ? STONE[4] : STONE[2]); R(g, k, y - 5, 3, 1, SNOW[3]); }
    R(g, x, y - 1, w, 1, SNOW[2]);
    for (let k = -50; k < 52; k += 9) { if (Math.abs(k) < 14) continue; R(g, k - 1, y + 5, 4, 6, INK); R(g, k, y + 6, 2, 4, '#3A3060'); R(g, k + 1, y + 6, 1, 4, '#FFD88A'); }
    for (const bx of [-38, -20, 17, 35]) { R(g, bx, y + 1, 5, 12, PINK[2]); R(g, bx, y + 1, 1, 12, PINK[1]); R(g, bx + 4, y + 1, 1, 12, PINK[3]); poly(g, [bx, y + 13, bx + 2.5, y + 11, bx + 5, y + 13], STONE[2], false); R(g, bx + 2, y + 5, 1, 2, GOLD[3]); }
    g.fillStyle = INK; g.beginPath(); g.moveTo(-9, -40); g.lineTo(-9, -53); g.arc(0, -53, 9, Math.PI, 0); g.lineTo(9, -40); g.closePath(); g.fill();
    g.fillStyle = SLATE[0]; g.beginPath(); g.moveTo(-7, -40); g.lineTo(-7, -53); g.arc(0, -53, 7, Math.PI, 0); g.lineTo(7, -40); g.closePath(); g.fill();
    for (let k = -6; k <= 6; k += 3) R(g, k, -58, 1, 18, GOLD[1]); for (let k = -56; k < -40; k += 4) R(g, -7, k, 14, 1, GOLD[1]);
    poly(g, [0, -67, 4, -63, 0, -59, -4, -63], INK); poly(g, [0, -66, 3, -63, 0, -60, -3, -63], PINK[2], false); R(g, 0, -64, 1, 2, GOLD[4]);
  }
  // THE WALL'S CORNER TOWERS, nearest
  tower(g, -60, -38, 15, -78, 16, ROOF);
  tower(g, 60, -38, 15, -82, 17, ROOF);
  sign(g, "THE GREAT PIXIE'S CASTLE", 0, -13, 0, '#3B1A7A', GOLD[3], 4, true);
};
