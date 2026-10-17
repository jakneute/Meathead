// ITALY's art (the SNES pass): the Venetian fronts (stucco in ochre, terracotta, rose and cream over the brick where it's
// fallen off, Istrian stone quoins and string courses, arched windows and their green louvered shutters, a cornice and
// its dentils under the tiled eave, the funnel chimneys, the arched shop doors and their painted boards; braced from
// behind), THE PALACE (the pink-and-white diaper above, its pointed windows and the spiky white crenellation, the loggia's
// little arches and quatrefoils, the ground arcade on fat stone columns, the canal's stain along its foot), the
// balconies (stone slabs on corbels, a balustrade along their backs), THE BRIDGE THAT DOESN'T MEET (cut stone, its
// arch's voussoirs, the broken ends showing the plywood and 2x4s inside, the sawhorse barricades), the GONDOLAS (black
// lacquer in steps, the steel ferro and its six teeth, the curled stern, the gold rail and brass seahorses, the red
// velvet seat), the striped mooring poles, THE CAMPANILE (brick in courses between its pilaster strips, the stone base,
// the white belfry and its bronze bell, the attic, the green spire and the gold angel; THE GIANT PIZZA nailed to it,
// a slice gone), the piazza's pizza oven (brick, the fire in its mouth, the firewood), the laundry; and IL FORNO and THE
// ROOFTOPS (the tunnel's firebrick inside, the gas manifold and its burners, the roof's brick front, the chimneys and
// their smoke, the flour sacks, the Vespa, the terracotta houses and their tiled tops, the iron balconies, the hill
// town behind). Still art painted once for the hour; only what moves live. No layout here: index.ts and oven.ts say
// where.

import { GY } from '../geometry';
import {
  type Ctx, type View, INK, box, mix, poly, checker, hash, at, atDepth, ramp6, dimmed, hour, slab, post, ball, timeOfDay, steppedGlow,
  stoneBlocks, stucco, planks, barrelTile, hole, facade, still, board, LOOKS, onScreen, lip, topBack, sideBack, ledge3, FACADE_D, LIP,
} from '../kit';

const lampsOn = () => timeOfDay().lamps > 0.3;
export const ISTRIA = '#ECE6D8', BRICK = '#A0482E', TERRA = '#C2410C', GOLD = '#CA8A04', PINK = '#E89AAE', SHUTTER = '#2F6B3A';

// ---------------------------------------------------------------------------------------------------------------
// Bits

/** Brick in courses (local): each brick its own step (seeded), lit along its top, the mortar shaded between. */
export const bricks = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], seed = 0, bw = 14, bh = 6) => {
  box(g, x, y, w, h, R[1]);
  for (let yy = y, row = 0; yy < y + h; yy += bh, row++) {
    const rh = Math.min(bh, y + h - yy);
    for (let xx = x - (row % 2 ? bw / 2 : 0); xx < x + w; xx += bw) {
      const a = Math.max(x, xx), b = Math.min(x + w, xx + bw - 1);
      if (b - a < 1) continue;
      const t = hash(seed + Math.round(xx) * 0.29 + row * 2.3), col = R[t > 0.85 ? 4 : t > 0.35 ? 3 : 2];
      box(g, a, yy, b - a, rh - 1, col); box(g, a, yy, b - a, 1, mix(col, R[5], 0.35));
      if (t < 0.1) box(g, a + 1, yy + 2, Math.min(3, b - a - 1), 1, R[1]);
    }
  }
};
/** A round-headed opening's stone surround (local: the opening's top-left at x, y): the arch's voussoirs, the jambs. */
const archSurround = (g: Ctx, x: number, y: number, w: number, h: number, S: string[]) => {
  const r = w / 2, cx = x + r, sy = y + r;
  g.fillStyle = INK; g.beginPath(); g.moveTo(x - 6, y + h + 2); g.lineTo(x - 6, sy); g.arc(cx, sy, r + 6, Math.PI, 0); g.lineTo(x + w + 6, y + h + 2); g.closePath(); g.fill();
  g.fillStyle = S[3]; g.beginPath(); g.moveTo(x - 5, y + h + 1); g.lineTo(x - 5, sy); g.arc(cx, sy, r + 5, Math.PI, 0); g.lineTo(x + w + 5, y + h + 1); g.closePath(); g.fill();
  for (let k = 0; k <= 8; k++) { const a = Math.PI + (k / 8) * Math.PI, vx = cx + Math.cos(a) * (r + 3), vy = sy + Math.sin(a) * (r + 3); box(g, vx - 1, vy - 1, 2, 2, k % 2 ? S[2] : S[4]); }
  box(g, x - 5, sy, 2, y + h - sy, S[4]); box(g, x + w + 3, sy, 2, y + h - sy, S[1]);
  box(g, cx - 3, y - 6, 6, 6, S[4]); box(g, cx - 3, y - 6, 6, 1, S[5]);
};
/** An arched window (local): the surround, the glass (its round head too) by the hour, the green louvered shutters
 *  folded back either side. */
const archWindow = (g: Ctx, x: number, y: number, w: number, h: number, S: string[], seed: number, shut = true) => {
  archSurround(g, x, y, w, h, S);
  const r = w / 2;
  hole(g, x, y + r, w, h - r, true);
  const G = lampsOn() ? '#E8A646' : dimmed('#4A6888');
  g.fillStyle = G; g.beginPath(); g.moveTo(x, y + r); g.arc(x + r, y + r, r, Math.PI, 0); g.closePath(); g.fill();
  g.fillStyle = INK; g.fillRect(Math.round(x + r), Math.round(y), 1, Math.round(r));
  if (!shut) return;
  const Sh = ramp6(dimmed(SHUTTER));
  for (const sx of [x - 13, x + w + 4]) {
    box(g, sx - 1, y + r - 1, 11, h - r + 2, INK); box(g, sx, y + r, 9, h - r, Sh[3]); box(g, sx, y + r, 1, h - r, Sh[4]); box(g, sx + 8, y + r, 1, h - r, Sh[1]);
    for (let yy = y + r + 3; yy < y + h - 2; yy += 3) box(g, sx + 1, yy, 7, 1, Sh[1]);
    if (hash(seed + sx) > 0.7) box(g, sx + 3, y + r + 6, 2, 3, Sh[5]);
  }
};
/** A Venetian funnel chimney (local: its foot at x, y): the brick stack, the flared pot on top, its cap. */
const funnelChimney = (g: Ctx, x: number, y: number, h: number, scenery = true) => {
  const Br = ramp6(scenery ? dimmed(BRICK) : hour(BRICK)), S = ramp6(scenery ? dimmed(ISTRIA) : hour(ISTRIA));
  box(g, x - 7, y - h, 14, h, INK); bricks(g, x - 6, y - h, 12, h, Br, x, 6, 4); box(g, x + 3, y - h, 3, h, Br[1]);
  poly(g, [[x - 7, y - h], [x - 14, y - h - 16], [x + 14, y - h - 16], [x + 7, y - h]], INK);
  poly(g, [[x - 6, y - h], [x - 13, y - h - 15], [x + 13, y - h - 15], [x + 6, y - h]], Br[3]);
  poly(g, [[x - 6, y - h], [x - 13, y - h - 15], [x - 6, y - h - 15], [x - 2, y - h]], Br[4]);
  box(g, x - 16, y - h - 19, 32, 4, INK); box(g, x - 15, y - h - 18, 30, 3, S[3]); box(g, x - 15, y - h - 18, 30, 1, S[5]);
};
/** A row of dentils and a cornice band (local): stone, lit along its top, the dentils' shadows. */
const cornice = (g: Ctx, x: number, y: number, w: number, S: string[]) => {
  box(g, x - 1, y - 1, w + 2, 10, INK); box(g, x, y, w, 8, S[3]); box(g, x, y, w, 1, S[5]); box(g, x, y + 6, w, 2, S[1]);
  for (let k = x + 2; k < x + w - 3; k += 6) { box(g, k, y + 8, 4, 4, S[2]); box(g, k, y + 11, 4, 1, INK); }
};

// ---------------------------------------------------------------------------------------------------------------
// The fronts (FACADE_D, braced)

export interface ItFront { rx: number; w: number; h: number; col: string; name: string; goods: 'gelato' | 'masks' | 'pasta' | 'cups' }
const paintFront = (g: Ctx, f: ItFront) => {
  const { w, h } = f, R = ramp6(dimmed(f.col)), S = ramp6(dimmed(ISTRIA)), Br = ramp6(dimmed(BRICK)), T = ramp6(dimmed(TERRA)), seed = f.rx;
  box(g, -1, -h - 1, w + 2, h + 1, INK);
  slab(g, 0, -h, w, h, R, true); stucco(g, 0, -h, w, h, R, seed);
  // (where the stucco's fallen off, the brick under it: a lit lip under each patch, a shaded one over)
  for (let k = 0; k < 3; k++) {
    const pw = 22 + hash(seed + k * 5.3) * 26, ph = 12 + hash(seed + k * 2.1) * 12, px0 = 16 + hash(seed + k * 3.1) * (w - pw - 32), py0 = -h + 26 + hash(seed + k * 1.7) * (h - 120);
    box(g, px0 - 1, py0 - 1, pw + 2, ph + 2, R[1]); bricks(g, px0, py0, pw, ph, Br, seed + k, 10, 4);
    box(g, px0, py0 + ph, pw, 1, R[4]); box(g, px0 - 1, py0 - 1, pw + 2, 1, R[0]);
  }
  // (the quoins up both corners: long and short blocks of Istrian stone, lit along their tops)
  for (const side of [0, 1]) for (let y = -h + 2, k = 0; y < -14; y += 14, k++) {
    const qw = k % 2 ? 12 : 18, qx = side ? w - qw : 0;
    box(g, qx, y, qw, 13, S[3]); box(g, qx, y, qw, 1, S[5]); box(g, qx, y + 12, qw, 1, S[1]); box(g, side ? qx : qx + qw - 1, y, 1, 13, side ? S[4] : S[1]);
  }
  // (the string course between the floors)
  const mid = -Math.round(h * 0.52);
  box(g, 0, mid - 1, w, 7, INK); box(g, 0, mid, w, 5, S[3]); box(g, 0, mid, w, 1, S[5]); box(g, 0, mid + 4, w, 1, S[1]);
  // (the cornice and the tiled eave over it; two funnel chimneys behind)
  funnelChimney(g, Math.round(w * 0.72), -h - 10, 34); if (w > 230) funnelChimney(g, Math.round(w * 0.22), -h - 10, 26);
  box(g, -9, -h - 18, w + 18, 10, INK); barrelTile(g, -8, -h - 17, w + 16, 8, T, 4);
  cornice(g, -4, -h - 9, w + 8, S);
  // (the upper windows, two rows if it's tall)
  const n = Math.max(2, Math.floor((w - 40) / 62));
  for (let row = 0; row < (h > 205 ? 2 : 1); row++) for (let k = 0; k < n; k++) {
    const wx = 26 + k * ((w - 76) / Math.max(1, n - 1)), wy = -h + 22 + row * 62;
    if (wy + 46 > mid - 6) continue;
    archWindow(g, Math.round(wx), wy, 24, 42, S, seed + k * 7 + row);
  }
  // (the ground floor: the arched shop door, a shop window either side with its goods, the board over the door)
  const dx = Math.round(w / 2 - 20);
  archSurround(g, dx, -84, 40, 84, S);
  hole(g, dx, -64, 40, 64, true);
  g.fillStyle = lampsOn() ? '#E8A646' : '#1C1014'; g.beginPath(); g.moveTo(dx, -64); g.arc(dx + 20, -64, 20, Math.PI, 0); g.closePath(); g.fill();
  for (const sx of [20, w - 64]) {
    if (sx < 16 || sx + 44 > dx - 6 && sx < dx + 46) continue;
    box(g, sx - 3, -66, 50, 52, INK); box(g, sx - 2, -65, 48, 50, S[3]); box(g, sx - 2, -65, 48, 1, S[5]);
    hole(g, sx, -62, 44, 40, false);
    // (the goods in the window)
    for (let k = 0; k < 4; k++) {
      const gx = sx + 4 + k * 10, gy = -30;
      if (f.goods === 'gelato') { box(g, gx - 1, gy - 7, 9, 8, INK); box(g, gx, gy - 6, 7, 6, dimmed(['#FBCFE8', '#FEF08A', '#BBF7D0', '#78350F'][k])); box(g, gx, gy - 6, 7, 1, dimmed('#FFFFFF')); }
      else if (f.goods === 'masks') { box(g, gx - 1, gy - 15, 9, 7, INK); box(g, gx, gy - 14, 7, 5, dimmed(['#FDE68A', '#F8FAFC', '#F472B6', '#60A5FA'][k])); box(g, gx + 1, gy - 12, 2, 1, INK); box(g, gx + 4, gy - 12, 2, 1, INK); box(g, gx + 3, gy - 20, 1, 5, dimmed('#DC2626')); }
      else if (f.goods === 'pasta') { box(g, gx - 1, gy - 18, 8, 19, INK); box(g, gx, gy - 17, 6, 17, dimmed(['#1D4ED8', '#F8FAFC', '#1D4ED8', '#DC2626'][k])); box(g, gx + 1, gy - 12, 4, 6, dimmed('#FDE68A')); }
      else { box(g, gx - 1, gy - 9, 8, 10, INK); box(g, gx, gy - 8, 6, 8, dimmed('#F8FAFC')); box(g, gx + 6, gy - 6, 2, 3, dimmed('#F8FAFC')); box(g, gx + 1, gy - 8, 4, 2, dimmed('#7C2D12')); }
    }
    box(g, sx - 4, -16, 52, 4, INK); box(g, sx - 3, -16, 50, 3, S[2]); box(g, sx - 3, -16, 50, 1, S[4]);
  }
  // (an iron lamp bracket by the door, lit after dark; then the board over the door, nothing over it)
  const lx = dx + 42, I = ramp6(dimmed('#27272A'));
  box(g, lx, -78, 8, 2, I[2]); box(g, lx + 6, -78, 2, 5, I[2]);
  box(g, lx + 2, -73, 10, 12, INK); box(g, lx + 3, -72, 8, 10, lampsOn() ? '#FFE7A0' : dimmed('#C8D0D8')); box(g, lx + 3, -72, 8, 1, I[4]);
  board(g, w / 2, -98, [f.name], LOOKS.italy(1), dimmed('#14532D'), ramp6(dimmed(GOLD)), 4);
  // (the canal damp up the foot)
  box(g, 0, -12, w, 12, R[1]); checker(g, 0, -18, w, 6, R[1], 1, 2); checker(g, 0, -8, w, 4, dimmed('#4A5A3A'), 0, 2);
};
export const drawFront = (c: Ctx, v: View, x: number, f: ItFront) => facade(c, v, `it-front-${f.rx}`, x, f.w, f.h, g => paintFront(g, f), undefined, 70, 22);

/** Laundry strung across (local or world): a line, each piece hung by its pins (shirts, shorts, socks, a towel), lit on
 *  its left, shaded on its right and its folds, inked. */
export const laundry = (c: Ctx, x0: number, y0: number, x1: number, y1: number, sag: number, seed: number, scenery = true) => {
  const T = (col: string) => ramp6(scenery ? dimmed(col) : hour(col));
  const pt = (t: number) => [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t + sag * 4 * t * (1 - t)] as const;
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath();
  for (let i = 0; i <= 16; i++) { const [x, y] = pt(i / 16); if (i) c.lineTo(x, y); else c.moveTo(x, y); }
  c.stroke();
  const n = Math.max(2, Math.floor(Math.abs(x1 - x0) / 34));
  const COLS = ['#F8FAFC', '#DC2626', '#60A5FA', '#FDE68A', '#F472B6', '#16A34A', '#F8FAFC'];
  for (let i = 0; i < n; i++) {
    const [fx, fy] = pt((i + 0.5) / n), x = Math.round(fx), y = Math.round(fy), kind = Math.floor(hash(seed + i * 3.7) * 4), R = T(COLS[(seed + i) % COLS.length]);
    const cloth = (pts: [number, number][]) => { poly(c, pts.map(([a, b]) => [x + a + (a < 0 ? -1 : 1), y + b + (b > 2 ? 1 : 0)] as [number, number]), INK); poly(c, pts.map(([a, b]) => [x + a, y + b] as [number, number]), R[3]); };
    if (kind === 0) {
      // (a T-shirt)
      cloth([[-9, 0], [9, 0], [13, 5], [9, 8], [8, 6], [8, 20], [-8, 20], [-8, 6], [-9, 8], [-13, 5]]);
      box(c, x - 8, y + 1, 3, 19, R[4]); box(c, x + 5, y + 6, 3, 14, R[2]); box(c, x - 3, y, 6, 2, R[1]);
    } else if (kind === 1) {
      // (boxer shorts, hearts on them)
      cloth([[-8, 0], [8, 0], [9, 14], [1, 14], [0, 8], [-1, 14], [-9, 14]]);
      box(c, x - 8, y, 16, 2, R[4]); box(c, x + 5, y + 2, 3, 12, R[2]);
      for (const [hx, hy] of [[-5, 5], [3, 4], [-2, 10]] as const) box(c, x + hx, y + hy, 2, 2, T('#DC2626')[3]);
    } else if (kind === 2) {
      // (a pair of socks)
      for (const sx of [-6, 3]) { box(c, x + sx - 1, y - 1, 6, 16, INK); box(c, x + sx, y, 4, 14, R[3]); box(c, x + sx, y + 10, 7, 4, R[3]); box(c, x + sx, y, 1, 14, R[4]); box(c, x + sx, y + 2, 4, 1, R[1]); }
    } else {
      // (a striped towel)
      box(c, x - 11, y - 1, 22, 26, INK); box(c, x - 10, y, 20, 24, R[3]);
      for (let k = 0; k < 3; k++) box(c, x - 10, y + 5 + k * 7, 20, 2, T('#1D4ED8')[3]);
      box(c, x - 10, y, 3, 24, R[4]); box(c, x + 6, y, 4, 24, R[2]); checker(c, x - 10, y + 22, 20, 2, R[1], 0, 1);
    }
    // (the pins)
    for (const px0 of [x - 6, x + 5]) { box(c, px0 - 1, y - 3, 3, 5, INK); box(c, px0, y - 2, 1, 4, scenery ? dimmed('#C8A060') : hour('#C8A060')); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// THE PALACE (set back at 0.95) and its balconies

/** A pointed (Gothic) arch's outline (local), from the springing at y over w across, rising `rise`. */
const pointed = (g: Ctx, x: number, y: number, w: number, rise: number, foot: number) => {
  g.beginPath(); g.moveTo(x, foot); g.lineTo(x, y); g.quadraticCurveTo(x, y - rise * 0.75, x + w / 2, y - rise); g.quadraticCurveTo(x + w, y - rise * 0.75, x + w, y); g.lineTo(x + w, foot); g.closePath();
};
const paintPalace = (g: Ctx) => {
  const W = 440, H = 470, S = ramp6(dimmed(ISTRIA)), P = ramp6(dimmed(PINK)), C = ramp6(dimmed('#F5EEDC'));
  box(g, -1, -H - 1, W + 2, H + 1, INK);
  // (the diaper up top: cream, pink lozenges, each lit up its top-left)
  box(g, 0, -H, W, H - 170, C[3]);
  g.save(); g.beginPath(); g.rect(0, -H, W, H - 190); g.clip();
  for (let r = 0, y = -H; y < -170; y += 20, r++) for (let x = (r % 2) * 14 - 14; x < W + 14; x += 28) {
    poly(g, [[x, y + 10], [x + 14, y], [x + 28, y + 10], [x + 14, y + 20]], P[3]);
    poly(g, [[x, y + 10], [x + 14, y], [x + 14, y + 3], [x + 3, y + 10]], P[4]);
    poly(g, [[x + 14, y + 20], [x + 28, y + 10], [x + 25, y + 10], [x + 14, y + 17]], P[2]);
  }
  g.restore();
  box(g, W - 8, -H, 8, H - 190, 'rgba(28, 16, 20, 0.18)');
  // (the big pointed windows, their stone tracery)
  for (let k = 0; k < 4; k++) {
    const wx = 38 + k * 108, wy = -392;
    g.fillStyle = INK; pointed(g, wx - 7, wy, 50, 30, wy + 74); g.fill();
    g.fillStyle = S[3]; pointed(g, wx - 6, wy, 48, 28, wy + 73); g.fill();
    g.fillStyle = S[4]; g.fillRect(wx - 6, wy, 3, 73);
    g.fillStyle = lampsOn() ? '#C88A36' : dimmed('#3A5070'); pointed(g, wx, wy, 36, 22, wy + 64); g.fill();
    if (!lampsOn()) { g.fillStyle = dimmed('#7E98B0'); g.fillRect(wx + 3, wy - 6, 3, 64); }
    box(g, wx + 17, wy - 20, 2, 84, S[3]); box(g, wx, wy + 22, 36, 2, S[3]);
    g.fillStyle = S[3]; g.beginPath(); g.arc(wx + 18, wy - 4, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = INK; g.beginPath(); g.arc(wx + 18, wy - 4, 2.5, 0, Math.PI * 2); g.fill();
    box(g, wx - 9, wy + 64, 54, 5, INK); box(g, wx - 8, wy + 64, 52, 4, S[3]); box(g, wx - 8, wy + 64, 52, 1, S[5]);
  }
  // (the crenellation: little spiky white merlons along the top)
  for (let x = 2; x < W - 10; x += 22) {
    poly(g, [[x, -H], [x, -H - 10], [x + 7, -H - 22], [x + 14, -H - 10], [x + 14, -H]], INK);
    poly(g, [[x + 1, -H], [x + 1, -H - 10], [x + 7, -H - 20], [x + 13, -H - 10], [x + 13, -H]], S[3]);
    poly(g, [[x + 1, -H], [x + 1, -H - 10], [x + 7, -H - 20], [x + 7, -H]], S[4]);
  }
  box(g, -2, -H - 2, W + 4, 5, INK); box(g, -1, -H - 1, W + 2, 3, S[4]);
  // (the loggia: a band of little pointed arches on slender columns, quatrefoils over them)
  box(g, 0, -192, W, 44, S[2]); box(g, 0, -192, W, 2, S[4]);
  for (let k = 0; k < 14; k++) {
    const ax = 6 + k * 31;
    g.fillStyle = '#1C1014'; pointed(g, ax + 4, -170, 20, 8, -150); g.fill();
    box(g, ax, -176, 4, 28, S[4]); box(g, ax + 3, -176, 1, 28, S[1]);
    g.fillStyle = INK; for (const [qx, qy] of [[0, -3], [0, 3], [-3, 0], [3, 0]] as const) { g.beginPath(); g.arc(ax + 14 + qx, -184 + qy, 2.5, 0, Math.PI * 2); g.fill(); }
  }
  // (the ground arcade: pointed arches on fat columns, dark under, a lamp in each after dark)
  box(g, 0, -150, W, 150, S[3]);
  for (let k = 0; k < 6; k++) {
    const ax = 14 + k * 71;
    g.fillStyle = INK; pointed(g, ax - 2, -96, 56, 30, 0); g.fill();
    g.fillStyle = '#1C1014'; pointed(g, ax, -96, 52, 28, 0); g.fill();
    box(g, ax + 2, -30, 48, 30, '#22161A');
    if (lampsOn()) { steppedGlow(g, ax + 26, -84, 18, '#FFB070', 0, 0.3, 3); box(g, ax + 24, -88, 4, 6, '#FFE7A0'); }
    // (the column between: round, stepped, its capital and base)
    const cx = ax - 9;
    if (k) { box(g, cx - 7, -110, 14, 110, INK); box(g, cx - 6, -110, 12, 110, S[3]); box(g, cx - 6, -110, 4, 110, S[4]); box(g, cx + 3, -110, 3, 110, S[1]); box(g, cx - 9, -116, 18, 7, S[4]); box(g, cx - 9, -110, 18, 1, INK); box(g, cx - 9, -8, 18, 8, S[2]); }
  }
  box(g, 0, -152, W, 4, INK); box(g, 0, -151, W, 2, S[5]);
  // (the canal's stain along the foot: green-gray, the damp line ragged)
  for (let x = 0; x < W; x += 2) { const hh = 10 + Math.round(hash(x * 0.21) * 8); box(g, x, -hh, 2, hh, dimmed('#5A6A4A')); }
  checker(g, 0, -22, W, 4, dimmed('#5A6A4A'), 0, 2);
};
export const drawPalace = (c: Ctx, v: View, x: number) => facade(c, v, 'it-palace', x, 440, 470, paintPalace, 0.95, 30, 12, false);

/** A balustrade along a ledge's back (set back at `d`: behind where he stands): stone balusters (urn-shaped) under a
 *  rail lit along its top, dimmed; clipped above the ledge's front edge (`y`), so it's never over it. */
export const balustrade = (c: Ctx, v: View, a: number, b: number, y: number, d = 0.95) => {
  const S = ramp6(dimmed(ISTRIA)), [pa, py] = at(v.eye, a, y, d), [pb] = at(v.eye, b, y, d), h = Math.round(20 * d);
  c.save(); c.beginPath(); c.rect(pa - 4, py - h - 6, pb - pa + 8, y - (py - h - 6)); c.clip();
  box(c, pa, py - h - 1, pb - pa, 5, INK); box(c, pa, py - h, pb - pa, 3, S[3]); box(c, pa, py - h, pb - pa, 1, S[5]);
  for (let x = a + 5; x < b - 3; x += 10) {
    const [qx] = at(v.eye, x, y, d), X0 = Math.round(qx);
    box(c, X0 - 1, py - h + 4, 6, h - 4, INK); box(c, X0, py - h + 4, 4, 3, S[3]); box(c, X0 - 1 + 1, py - h + 8, 4, h - 10, S[2]); box(c, X0, py - h + 9, 1, h - 12, S[4]);
    box(c, X0 - 1, py - 4, 6, 3, S[3]);
  }
  c.restore();
};
/** A balcony (one-way, at the play plane): its stone slab (lit lip), the corbels under it, the balustrade along its
 *  back. */
export const balcony = (c: Ctx, v: View, a: number, b: number, y: number, iron = false) => {
  if (!onScreen(v, a - 10, b + 10)) return;
  const S = ramp6(hour(ISTRIA));
  for (let x = a + 10; x < b - 10; x += 34) { box(c, x - 1, y + 12, 12, 16, INK); box(c, x, y + 12, 10, 4, S[3]); box(c, x + 2, y + 16, 7, 6, S[2]); box(c, x + 4, y + 22, 4, 4, S[1]); box(c, x, y + 12, 2, 4, S[4]); }
  ledge3(c, v, a, y, b - a, iron ? '#8C847A' : '#E7E5E4', 12, iron ? undefined : 'stone');
  if (iron) ironRail(c, v, a, b, y); else balustrade(c, v, a, b, y);
};
/** A wrought-iron rail along a balcony's back (set back), its scrolls, potted geraniums at its foot; clipped above the
 *  ledge's front edge. */
export const ironRail = (c: Ctx, v: View, a: number, b: number, y: number, d = 0.95) => {
  const I = ramp6(dimmed('#2E3436')), [pa, py] = at(v.eye, a, y, d), [pb] = at(v.eye, b, y, d), h = 18;
  c.save(); c.beginPath(); c.rect(pa - 4, py - h - 6, pb - pa + 8, y - (py - h - 6)); c.clip();
  box(c, pa, py - h - 1, pb - pa, 3, INK); box(c, pa, py - h, pb - pa, 1, I[4]);
  for (let x = a + 4; x < b; x += 8) { const [qx] = at(v.eye, x, y, d); box(c, Math.round(qx), py - h + 2, 1, h - 2, I[2]); }
  c.strokeStyle = I[3]; c.lineWidth = 1;
  for (let x = a + 8; x < b - 8; x += 16) { const [qx] = at(v.eye, x + 4, y, d); c.beginPath(); c.arc(Math.round(qx), py - h / 2, 3.5, 0, Math.PI * 1.6); c.stroke(); }
  for (let x = a + 12; x < b - 12; x += 30) { const [qx] = at(v.eye, x, y, d), X0 = Math.round(qx); box(c, X0 - 4, py - 8, 9, 7, INK); box(c, X0 - 3, py - 7, 7, 5, dimmed(TERRA)); for (let k = 0; k < 4; k++) box(c, X0 - 4 + k * 2, py - 11 - (k % 2), 2, 2, dimmed(k % 2 ? '#DC2626' : '#2F6B2A')); }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// THE BRIDGE THAT DOESN'T MEET (stone stubs out over the canal)

/** A stub's body (still; local origin at its deck's front-left (x a, y top)): cut stone, the arch's underside curving
 *  down to the bank's water line, its voussoirs, the broken end showing the plywood core and its 2x4s. `toRight`: the
 *  broken end is on the right (the left stub). */
const paintStub = (g: Ctx, w: number, depth: number, toRight: boolean) => {
  const S = ramp6(hour('#D6D3D1')), Pl = ramp6(hour('#C99E5C'));
  const end = toRight ? w : 0, water = toRight ? 60 : w - 60;
  const curve = Array.from({ length: 13 }, (_, i) => { const t = i / 12; return [end + (water - end) * t, 40 + (depth + 30 - 40) * t * t] as [number, number]; });
  const sh: [number, number][] = toRight ? [[0, 16], [w, 16], ...curve, [0, depth]] : [[0, 16], [w, 16], [w, depth], ...curve.reverse()];
  g.fillStyle = INK; g.beginPath(); sh.forEach(([x, y], i) => (i ? g.lineTo(x + (x === 0 ? -1 : x === w ? 1 : 0), y + 1) : g.moveTo(x, y))); g.closePath(); g.fill();
  g.save(); g.beginPath(); sh.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
  stoneBlocks(g, 0, 16, w, depth + 40, S, w * 3 + (toRight ? 1 : 7), 28, 14);
  // (the underside's ring of voussoirs, the shade under the arch)
  for (let i = 0; i < 12; i++) {
    const t = i / 12, x = end + (water - end) * t, y = 40 + (depth + 30 - 40) * t * t;
    box(g, x - 4, y - 10, 9, 10, i % 2 ? S[2] : S[4]); box(g, x - 4, y - 10, 9, 1, S[5]); box(g, x - 4, y - 1, 9, 1, INK);
  }
  g.restore();
  // (the broken end: plywood in its plies, splintered, a 2x4 sticking out)
  const ex = toRight ? w - 8 : 0;
  box(g, ex, 16, 8, 24, INK); for (let y = 17; y < 39; y += 3) { box(g, ex + 1, y, 6, 2, Pl[3]); box(g, ex + 1, y, 6, 1, Pl[4]); }
  for (let k = 0; k < 4; k++) { const sy = 18 + k * 6; poly(g, toRight ? [[w, sy], [w + 6 + (k % 2) * 4, sy + 2], [w, sy + 4]] : [[0, sy], [-6 - (k % 2) * 4, sy + 2], [0, sy + 4]], Pl[4]); }
  const bx = toRight ? w - 4 : -14;
  box(g, bx - 1, 25, 20, 8, INK); box(g, bx, 26, 18, 6, Pl[3]); box(g, bx, 26, 18, 1, Pl[5]); box(g, toRight ? bx + 17 : bx, 26, 1, 6, Pl[1]);
};
export const drawStub = (c: Ctx, v: View, a: number, b: number, y: number, toRight: boolean) => {
  if (!onScreen(v, a - 20, b + 20)) return;
  const w = b - a, depth = GY - y;
  still(c, `it-stub-${w}-${toRight ? 'r' : 'l'}`, a, y, -16, 0, w + 32, depth + 34, g => paintStub(g, w, depth, toRight));
  ledge3(c, v, a, y, w, '#D6D3D1', 16, 'stone');
  balustrade(c, v, a + (toRight ? 0 : 30), b - (toRight ? 30 : 0), y);
  // (the barricade at its broken end, set back on the deck: a striped sawhorse, its blinking amber lamp)
  const bx = toRight ? b - 46 : a + 12, [qx, qy] = at(v.eye, bx, y, 0.96), on = (v.f >> 4) % 2 === 0;
  c.save(); c.beginPath(); c.rect(qx - 4, qy - 40, 44, y - (qy - 40)); c.clip();
  for (const lx of [qx + 3, qx + 29]) { box(c, lx - 1, qy - 24, 4, 24, INK); box(c, lx, qy - 24, 2, 24, dimmed('#A1A1AA')); }
  box(c, qx - 1, qy - 27, 36, 10, INK);
  for (let k = 0; k < 5; k++) box(c, qx + k * 7, qy - 26, 7, 8, dimmed(k % 2 ? '#F8FAFC' : '#EA580C'));
  box(c, qx + 14, qy - 33, 6, 6, INK); box(c, qx + 15, qy - 32, 4, 4, on ? '#FDBA3A' : dimmed('#92400E'));
  c.restore();
  if (on && lampsOn()) steppedGlow(c, qx + 17, qy - 30, 12, '#FDBA3A', 0, 0.3, 3);
};

// ---------------------------------------------------------------------------------------------------------------
// The gondolas (live: they move) and the mooring poles

/** A gondola: its deck going back (planks, a lit lip: standable), the hull in black lacquer (banded, a long glint),
 *  curling up at the stern (left), the steel ferro at the prow (right) with its six teeth; the gold rail, the brass
 *  seahorses, the red velvet seat; the forcola. */
export const drawGondola = (c: Ctx, v: View, sx: number, y: number, w: number, f: number) => {
  if (!onScreen(v, sx - 50, sx + w + 50)) return;
  const eye = v.eye, tilt = Math.sin(f * 0.06) * 2;
  const L = ramp6(hour('#2A2630')), Wd = ramp6(hour('#6B4423')), Gd = ramp6(hour(GOLD)), St = ramp6(hour('#B8BCC4')), Vl = ramp6(hour('#9F1239'));
  // (the deck going back: planks, darker going back)
  if (eye.y < y - 1) {
    const D = [Wd[4], Wd[3], Wd[2]];
    for (let i = 0; i < 3; i++) { const d0 = 1 - 0.02 * i, d1 = 1 - 0.02 * (i + 1); poly(c, [at(eye, sx, y, d0), at(eye, sx + w, y, d0), at(eye, sx + w, y, d1), at(eye, sx, y, d1)], D[i]); }
    c.strokeStyle = Wd[1]; c.lineWidth = 1; c.beginPath(); for (let x = sx + 20; x < sx + w; x += 26) { const [p0, q0] = at(eye, x, y, 1), [p1, q1] = at(eye, x, y, 0.94); c.moveTo(p0, q0); c.lineTo(p1, q1); } c.stroke();
  }
  // (the velvet seat set back on the deck: its cushion, gold fringe; the forcola at the stern)
  const [cx0, cy0] = at(eye, sx + w / 2 - 26, y, 0.965);
  box(c, cx0 - 1, cy0 - 13, 54, 14, INK); box(c, cx0, cy0 - 12, 52, 12, Vl[3]); box(c, cx0, cy0 - 12, 52, 3, Vl[4]); box(c, cx0 + 44, cy0 - 12, 8, 12, Vl[2]);
  for (let k = 0; k < 13; k++) box(c, cx0 + k * 4, cy0 - 2, 2, 3, Gd[(k % 2) + 3]);
  const [fx, fy] = at(eye, sx + 26, y, 0.97);
  box(c, fx - 3, fy - 26, 7, 26, INK); box(c, fx - 2, fy - 25, 5, 25, Wd[3]); box(c, fx - 2, fy - 25, 1, 25, Wd[5]); box(c, fx - 6, fy - 22, 4, 6, Wd[2]); box(c, fx + 3, fy - 15, 4, 6, Wd[2]);
  // (the hull: long and black, curling up at both ends, banded lighter up top, a long glint)
  const hull: [number, number][] = [[sx - 26, y - 22 + tilt], [sx - 14, y - 8 + tilt * 0.5], [sx, y], [sx + w, y], [sx + w + 18, y - 14 - tilt * 0.5], [sx + w + 30, y - 30 - tilt], [sx + w - 6, y + 26], [sx + 14, y + 26]];
  poly(c, hull.map(([x, yy]) => [x + (x < sx + w / 2 ? -1 : 1), yy + (yy > y + 10 ? 1 : -1)] as [number, number]), INK);
  poly(c, hull, L[2]);
  c.save(); c.beginPath(); hull.forEach(([x, yy], i) => (i ? c.lineTo(x, yy) : c.moveTo(x, yy))); c.closePath(); c.clip();
  box(c, sx - 30, y, w + 70, 7, L[3]); checker(c, sx - 30, y + 7, w + 70, 2, L[3], 0, 1);
  box(c, sx - 30, y + 18, w + 70, 10, L[1]); checker(c, sx - 30, y + 16, w + 70, 2, L[1], 1, 1);
  box(c, sx + 16, y + 3, w - 40, 1, L[5]); box(c, sx + 40, y + 4, w * 0.4, 1, L[4]);
  c.restore();
  // (the gold rail along the gunwale; the brass seahorses either side of the seat)
  box(c, sx, y, w, 3, Gd[2]); box(c, sx, y, w, 1, Gd[4]);
  for (const hx of [sx + w / 2 - 40, sx + w / 2 + 34]) {
    box(c, hx - 1, y - 13, 7, 13, INK); box(c, hx, y - 12, 5, 12, Gd[3]); box(c, hx, y - 12, 2, 12, Gd[5]); box(c, hx + 3, y - 14, 4, 4, INK); box(c, hx + 4, y - 13, 3, 3, Gd[4]);
  }
  // (the ferro at the prow: the steel blade curving up, its six teeth forward, the S at its top; the stern's curl)
  const px0 = sx + w + 24, py0 = y - 26 - tilt;
  poly(c, [[px0 - 2, py0 + 4], [px0 + 6, py0 - 18], [px0 + 18, py0 - 22], [px0 + 16, py0 - 14], [px0 + 8, py0 - 10], [px0 + 6, py0 + 6]], INK);
  poly(c, [[px0 - 1, py0 + 3], [px0 + 6, py0 - 17], [px0 + 17, py0 - 21], [px0 + 15, py0 - 15], [px0 + 7, py0 - 11], [px0 + 5, py0 + 5]], St[3]);
  box(c, px0 + 1, py0 - 14, 2, 16, St[5]);
  for (let k = 0; k < 6; k++) { box(c, px0 + 6, py0 - 8 + k * 4, 10, 3, INK); box(c, px0 + 7, py0 - 7 + k * 4, 8, 1, St[4]); }
  const sx0 = sx - 26, sy0 = y - 22 + tilt;
  ball(c, sx0 + 2, sy0 - 4, 5, L[3]); box(c, sx0, sy0 - 8, 3, 2, L[5]);
  lip(c, sx, y, w);
};
/** A mooring pole (a paline): striped in a spiral, stepped round, its gilded cap, standing up out of the water. */
export const mooringPole = (c: Ctx, x: number, top: number, foot: number, a: string, b: string) => {
  still(c, `it-pole-${a}-${b}-${foot - top}`, x, top, -6, -8, 13, foot - top + 10, g => {
    const A = ramp6(hour(a)), B = ramp6(hour(b)), h = foot - top;
    box(g, -4, 0, 9, h, INK);
    // (the spiral: each column of the pole a step round (lit left, shaded right), the bands climbing across it)
    for (let y = 0; y < h; y += 2) for (let i = 0; i < 7; i++) box(g, -3 + i, y, 1, 2, (Math.floor((y + i * 1.6) / 9) % 2 ? A : B)[[4, 3, 3, 2, 2, 1, 1][i]]);
    ball(g, 0, -3, 5, hour(GOLD));
  });
};

// ---------------------------------------------------------------------------------------------------------------
// THE CAMPANILE (at the play plane, dimmed: scenery behind its balconies) and THE GIANT PIZZA

/** The giant pizza (local: its middle at 0, 0, radius r): the crust in steps (puffed, charred spots), the sauce's edge,
 *  the cheese bubbling, the pepperoni (each lit, cupped, greasy), basil leaves, a slice gone, two nails. */
export const paintPizza = (g: Ctx, r: number, scenery = true) => {
  const T = (col: string) => ramp6(scenery ? dimmed(col) : hour(col));
  const Cr = T('#C8873A'), Sa = T('#B91C1C'), Ch = T('#F4C542'), Pe = T('#9F1D1D'), Ba = T('#2F7A2A');
  const gone0 = -0.6, gone1 = -0.05;
  const disc = (rr: number, col: string, dx = 0, dy = 0) => { g.fillStyle = col; g.beginPath(); g.moveTo(dx, dy); g.arc(dx, dy, rr, gone1, gone0 + Math.PI * 2); g.closePath(); g.fill(); };
  disc(r + 2, INK); disc(r, Cr[2]); disc(r - 2, Cr[3], -1, -1);
  for (let k = 0; k < 28; k++) { const a = gone1 + (k / 28) * (Math.PI * 2 - (gone1 - gone0)), px0 = Math.cos(a) * (r - 4), py0 = Math.sin(a) * (r - 4); box(g, px0 - 2, py0 - 2, 4, 3, hash(k * 3.1) > 0.6 ? Cr[4] : Cr[1]); if (hash(k * 7.7) > 0.82) box(g, px0, py0, 2, 2, Cr[0]); }
  disc(r - 7, Sa[2]); disc(r - 9, Ch[2]); disc(r - 12, Ch[3], -2, -2);
  for (let k = 0; k < 40; k++) { const a = hash(k * 1.9) * Math.PI * 2, d = hash(k * 4.3) * (r - 14); const px0 = Math.cos(a) * d, py0 = Math.sin(a) * d; if (a > Math.PI * 2 + gone0 || a < gone1) continue; box(g, px0, py0, 3, 2, hash(k) > 0.5 ? Ch[4] : Ch[1]); }
  for (let k = 0; k < 9; k++) {
    const a = gone1 + 0.3 + (k / 9) * (Math.PI * 2 - 0.9), d = (k % 3 + 1) * (r - 16) / 3.3, px0 = Math.cos(a) * d, py0 = Math.sin(a) * d, pr = r * 0.14;
    g.fillStyle = INK; g.beginPath(); g.arc(px0, py0, pr + 1, 0, Math.PI * 2); g.fill();
    g.fillStyle = Pe[2]; g.beginPath(); g.arc(px0, py0, pr, 0, Math.PI * 2); g.fill();
    g.fillStyle = Pe[3]; g.beginPath(); g.arc(px0 - 1, py0 - 1, pr * 0.7, 0, Math.PI * 2); g.fill();
    box(g, px0 - pr * 0.5, py0 - pr * 0.5, 2, 2, Pe[5]); box(g, px0 + 1, py0 + 1, 1, 1, Pe[0]);
  }
  for (let k = 0; k < 4; k++) { const a = 1 + k * 1.3, d = r * 0.45, bx0 = Math.cos(a) * d, by0 = Math.sin(a) * d; poly(g, [[bx0 - 6, by0], [bx0, by0 - 4], [bx0 + 6, by0], [bx0, by0 + 3]], Ba[3]); box(g, bx0 - 4, by0 - 1, 7, 1, Ba[1]); }
  // (the slice's cut edges)
  g.strokeStyle = Ch[1]; g.lineWidth = 1; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(gone0) * r, Math.sin(gone0) * r); g.moveTo(0, 0); g.lineTo(Math.cos(gone1) * r, Math.sin(gone1) * r); g.stroke();
  // (the nails holding it up)
  for (const [nx, ny] of [[-r * 0.55, -r * 0.4], [r * 0.2, r * 0.6]] as const) { box(g, nx - 3, ny - 3, 7, 7, INK); box(g, nx - 2, ny - 2, 5, 5, T('#9CA3AF')[3]); box(g, nx - 2, ny - 2, 2, 2, T('#9CA3AF')[5]); }
};
const paintCampanile = (g: Ctx, w: number, h: number) => {
  const Br = ramp6(dimmed('#B4532A')), S = ramp6(dimmed(ISTRIA));
  box(g, -1, -h - 1, w + 2, h + 1, INK);
  bricks(g, 0, -h, w, h, Br, 31, 12, 5);
  // (the pilaster strips standing proud, their arches at the top; the recesses between in shade)
  for (let k = 0; k < 4; k++) {
    const rx0 = 16 + k * 46;
    box(g, rx0, -h + 40, 30, h - 70, 'rgba(28, 16, 20, 0.22)'); box(g, rx0, -h + 40, 2, h - 70, 'rgba(28, 16, 20, 0.25)');
    g.fillStyle = 'rgba(28, 16, 20, 0.22)'; g.beginPath(); g.arc(rx0 + 15, -h + 40, 15, Math.PI, 0); g.fill();
  }
  for (let k = 0; k < 5; k++) { const px0 = k * 46; box(g, px0, -h, 14, h, 'rgba(255, 240, 220, 0.08)'); box(g, px0 + 12, -h, 2, h, 'rgba(28, 16, 20, 0.2)'); }
  box(g, w - 10, -h, 10, h, 'rgba(28, 16, 20, 0.2)');
  // (the stone base)
  box(g, -7, -28, w + 14, 28, INK); stoneBlocks(g, -6, -27, w + 12, 27, S, 77, 30, 9); box(g, -6, -27, w + 12, 2, S[5]);
};
const paintBelfry = (g: Ctx, w: number) => {
  const S = ramp6(dimmed(ISTRIA)), Gr = ramp6(dimmed('#4D7C5A')), Gd = ramp6(dimmed(GOLD));
  // (the belfry: white stone, four arches open, its cornice)
  box(g, -5, -91, w + 10, 92, INK); slab(g, -4, -90, w + 8, 90, S, false);
  for (let k = 0; k < 5; k++) { const ax = 8 + k * 38; g.fillStyle = INK; g.beginPath(); g.moveTo(ax - 2, 0); g.lineTo(ax - 2, -62); g.arc(ax + 15, -62, 17, Math.PI, 0); g.lineTo(ax + 32, 0); g.closePath(); g.fill(); g.fillStyle = '#1C1014'; g.beginPath(); g.moveTo(ax, 0); g.lineTo(ax, -62); g.arc(ax + 15, -62, 15, Math.PI, 0); g.lineTo(ax + 30, 0); g.closePath(); g.fill(); }
  for (let k = 0; k < 6; k++) { const cx0 = Math.min(w - 8, k * 38); box(g, cx0, -66, 8, 66, S[3]); box(g, cx0, -66, 2, 66, S[5]); box(g, cx0 + 6, -66, 2, 66, S[1]); }
  box(g, -10, -98, w + 20, 10, INK); box(g, -9, -97, w + 18, 8, S[3]); box(g, -9, -97, w + 18, 1, S[5]); box(g, -9, -91, w + 18, 2, S[1]);
  // (the attic over it: brick, a gold lion in a roundel)
  const Br = ramp6(dimmed('#B4532A'));
  box(g, -1, -151, w + 2, 54, INK); bricks(g, 0, -150, w, 52, Br, 9, 12, 5);
  g.fillStyle = INK; g.beginPath(); g.arc(w / 2, -124, 17, 0, Math.PI * 2); g.fill(); g.fillStyle = S[3]; g.beginPath(); g.arc(w / 2, -124, 16, 0, Math.PI * 2); g.fill();
  box(g, w / 2 - 9, -126, 16, 7, Gd[3]); box(g, w / 2 + 4, -132, 6, 7, Gd[3]); box(g, w / 2 - 9, -126, 16, 1, Gd[5]); poly(g, [[w / 2 - 7, -126], [w / 2 - 2, -138], [w / 2 + 2, -126]], Gd[4]); box(g, w / 2 - 9, -119, 2, 5, Gd[2]); box(g, w / 2 + 3, -119, 2, 5, Gd[2]);
  box(g, -8, -156, w + 16, 7, INK); box(g, -7, -155, w + 14, 5, S[3]); box(g, -7, -155, w + 14, 1, S[5]);
  // (the spire: verdigris copper, its lit face and its shaded one, seams up it; the gold angel on top)
  const tip = -156 - 190;
  poly(g, [[0, -155], [w / 2, tip], [w, -155]], INK);
  poly(g, [[2, -156], [w / 2, tip + 2], [w / 2, -156]], Gr[3]); poly(g, [[w / 2, tip + 2], [w - 2, -156], [w / 2, -156]], Gr[1]);
  for (let k = 1; k < 6; k++) { const t = k / 6; g.strokeStyle = Gr[k % 2 ? 2 : 4]; g.lineWidth = 1; g.beginPath(); g.moveTo(w / 2, tip + 2); g.lineTo(2 + (w / 2 - 2) * t, -156); g.stroke(); }
  box(g, w / 2 - 1, tip + 4, 2, 186, Gr[4]);
  box(g, w / 2 - 3, tip - 26, 7, 28, INK); box(g, w / 2 - 2, tip - 25, 5, 26, Gd[3]); box(g, w / 2 - 2, tip - 25, 2, 26, Gd[5]);
  ball(g, w / 2, tip - 28, 4, dimmed('#FCD34D'));
  poly(g, [[w / 2 - 2, tip - 20], [w / 2 - 20, tip - 32], [w / 2 - 14, tip - 18]], Gd[4]); poly(g, [[w / 2 + 2, tip - 20], [w / 2 + 20, tip - 32], [w / 2 + 14, tip - 18]], Gd[3]);
};
/** The campanile at x (its shaft's left), its top at `top`; the bell swinging live; the giant pizza on its front. */
export const drawCampanile = (c: Ctx, v: View, x: number, w: number, top: number, pizzaY: number, f: number) => {
  if (!onScreen(v, x - 30, x + w + 30)) return;
  const h = GY - top;
  still(c, `it-campanile-${w}x${h}`, x, GY, -8, -h - 2, w + 16, h + 4, g => paintCampanile(g, w, h));
  still(c, `it-belfry-${w}`, x, top, -14, -388, w + 28, 390, g => paintBelfry(g, w));
  // (the bell in the middle arch, swinging: bronze in steps, its lip, the clapper)
  const sw = Math.sin(f * 0.04) * 0.3, Bz = ramp6(dimmed('#A16207'));
  c.save(); c.translate(x + w / 2, top - 70); c.rotate(sw);
  box(c, -2, -6, 4, 8, INK);
  poly(c, [[-11, 0], [11, 0], [16, 24], [-16, 24]], INK); poly(c, [[-10, 1], [10, 1], [15, 23], [-15, 23]], Bz[3]); poly(c, [[-10, 1], [-4, 1], [-8, 23], [-15, 23]], Bz[4]); box(c, 8, 4, 4, 18, Bz[1]);
  box(c, -17, 22, 34, 4, INK); box(c, -16, 22, 32, 3, Bz[2]); box(c, -16, 22, 32, 1, Bz[5]);
  ball(c, Math.sin(-sw * 2) * 4, 28, 3, Bz[2]);
  c.restore();
  still(c, 'it-giant-pizza', x + w / 2, pizzaY, -62, -62, 124, 124, g => paintPizza(g, 56));
};

// ---------------------------------------------------------------------------------------------------------------
// The piazza's pizza oven (a standable block: brick, the fire in its mouth, firewood under)

export const paintOvenFront = (g: Ctx, w: number, h: number) => {
  const Br = ramp6(hour(BRICK)), S = ramp6(hour(ISTRIA)), Wd = ramp6(hour('#7C4A1E'));
  box(g, -1, 0, w + 2, h, INK);
  bricks(g, 0, 0, w, h - 18, Br, 5, 12, 5);
  box(g, 0, 0, 3, h, Br[4]); box(g, w - 4, 0, 4, h, Br[1]);
  // (the stone hearth along its foot; the soldier course over the mouth)
  stoneBlocks(g, 0, h - 18, w, 18, S, 3, 24, 9);
  const mx = w / 2, my = h - 18, mr = 24;
  for (let k = 0; k <= 10; k++) { const a = Math.PI + (k / 10) * Math.PI, vx = mx + Math.cos(a) * (mr + 4), vy = my - 10 + Math.sin(a) * (mr + 4); box(g, vx - 3, vy - 3, 6, 6, INK); box(g, vx - 2, vy - 2, 4, 4, k % 2 ? Br[4] : Br[3]); }
  g.fillStyle = '#1C0A06'; g.beginPath(); g.moveTo(mx - mr, my); g.lineTo(mx - mr, my - 10); g.arc(mx, my - 10, mr, Math.PI, 0); g.lineTo(mx + mr, my); g.closePath(); g.fill();
  // (soot up over the mouth)
  checker(g, mx - 16, my - 50, 32, 14, Br[0], 0, 2);
  // (the firewood stacked by it: log ends, lit rings)
  for (let k = 0; k < 6; k++) { const lx = (k % 3) * 9 + 6, ly = h - 30 - Math.floor(k / 3) * 9; g.fillStyle = INK; g.beginPath(); g.arc(lx, ly, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = Wd[3]; g.beginPath(); g.arc(lx, ly, 4, 0, Math.PI * 2); g.fill(); g.fillStyle = Wd[5]; g.fillRect(lx - 2, ly - 2, 2, 2); g.strokeStyle = Wd[1]; g.lineWidth = 1; g.beginPath(); g.arc(lx, ly, 2, 0, Math.PI * 2); g.stroke(); }
};
/** The fire inside a mouth (live): embers, stepped tongues flickering, a glow. */
export const ovenFire = (c: Ctx, mx: number, my: number, mr: number, f: number) => {
  c.save(); c.beginPath(); c.moveTo(mx - mr, my); c.lineTo(mx - mr, my - 10); c.arc(mx, my - 10, mr, Math.PI, 0); c.lineTo(mx + mr, my); c.closePath(); c.clip();
  box(c, mx - mr, my - 6, mr * 2, 6, '#7C2D12');
  for (let k = 0; k < 7; k++) {
    const fx = mx - mr + 6 + k * ((mr * 2 - 12) / 6), fh = 10 + Math.abs(Math.sin(f * 0.25 + k * 1.7)) * 16;
    for (let s = 0; s < 4; s++) { const sw = 6 - s; box(c, fx - sw / 2, my - 4 - fh * ((s + 1) / 4), sw, fh / 4 + 1, ['#C2410C', '#F97316', '#FDBA74', '#FEF3C7'][s]); }
  }
  for (let k = 0; k < 5; k++) box(c, mx - mr + 4 + ((k * 11 + (f >> 2)) % (mr * 2 - 8)), my - 3, 2, 2, (f + k) % 3 ? '#FDE047' : '#FFFFFF');
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// IL FORNO: the tunnel, its burners, its roof and chimneys; the flour sacks; the Vespa; the houses; the hill town

/** The tunnel's inside back wall (still at 0.93: local foot at 0): firebrick in courses, sooty up top, the gas manifold
 *  along the floor (a steel pipe on its brackets), each burner's grate. */
export const paintTunnelBack = (g: Ctx, w: number, h: number, burners: number[]) => {
  const Br = ramp6(dimmed('#7A2E18')), St = ramp6(dimmed('#6B7280'));
  box(g, 0, -h, w, h, '#24100A');
  bricks(g, 0, -h, w, h, Br, 13, 16, 6);
  checker(g, 0, -h, w, 20, '#1A0A06', 0, 2); box(g, 0, -h, w, 10, '#1A0A06');
  box(g, 0, -16, w, 3, INK); box(g, 0, -15, w, 2, St[3]); box(g, 0, -15, w, 1, St[5]);
  for (let x = 30; x < w; x += 90) { box(g, x, -14, 3, 14, St[1]); }
  for (const bx of burners) {
    box(g, bx - 30, -10, 60, 10, INK); box(g, bx - 29, -9, 58, 8, St[2]); box(g, bx - 29, -9, 58, 1, St[4]);
    for (let k = 0; k < 6; k++) box(g, bx - 25 + k * 10, -8, 4, 2, '#0A0A0A');
    box(g, bx - 2, -15, 4, 6, St[3]);
  }
};
/** A burner's pilot (live): little blue tongues flickering over its grate (the tell). */
export const pilot = (c: Ctx, x: number, y: number, f: number) => {
  for (let k = 0; k < 6; k++) {
    const fx = x - 22 + k * 9, fh = 4 + ((f + k * 3) % 4);
    box(c, fx - 1, y - fh - 1, 4, fh + 1, '#1E3A8A'); box(c, fx, y - fh, 2, fh, '#60A5FA'); box(c, fx, y - 2, 2, 2, '#DBEAFE');
  }
  steppedGlow(c, x, y - 4, 26, '#60A5FA', 0, 0.25, 3);
};
/** A flame column (live): stepped tongues licking up from `bot` to `h`, inked, white at the root, the sparks flying. */
export const flameColumn = (c: Ctx, x: number, bot: number, h: number, hw: number, f: number) => {
  if (h < 2) return;
  const COLS = ['#7C2D12', '#C2410C', '#EA580C', '#F97316', '#FB923C', '#FDBA74', '#FEF3C7'];
  for (let k = 0; k < 7; k++) {
    const y = bot - (h * (k + 1)) / 7, w = hw * (1 - k / 9) + Math.sin(f * 0.5 + k) * 6, sh = Math.round(h / 7) + 2;
    box(c, x - w - 2, y - 1, w * 2 + 4, sh, INK);
  }
  for (let k = 0; k < 7; k++) {
    const y = bot - (h * (k + 1)) / 7, w = hw * (1 - k / 9) + Math.sin(f * 0.5 + k) * 6, sh = Math.round(h / 7) + 2;
    box(c, x - w, y, w * 2, sh, COLS[k]);
    box(c, x - w * 0.6, y, w * 1.2, sh, COLS[Math.min(6, k + 1)]);
    box(c, x - w * 0.25, y, w * 0.5, sh, COLS[Math.min(6, k + 2)]);
    checker(c, x - w, y, w * 2, 2, COLS[Math.min(6, k + 1)], k % 2, 2);
  }
  // (the tongues off the top, the sparks)
  for (let k = 0; k < 4; k++) { const tx = x - hw * 0.6 + k * hw * 0.4, th = 8 + Math.abs(Math.sin(f * 0.6 + k * 2)) * 14; box(c, tx - 3, bot - h - th, 6, th, '#FB923C'); box(c, tx - 1, bot - h - th + 2, 2, th - 2, '#FEF3C7'); }
  for (let k = 0; k < 6; k++) { const sy = bot - h * 0.4 - ((f * 3 + k * 23) % Math.max(10, h)), sx = x + Math.sin(f * 0.2 + k * 2.1) * hw; box(c, sx, sy, 2, 2, k % 2 ? '#FDE047' : '#FFFFFF'); }
};
/** The roof's front (still; local top-left at 0, 0): brick courses, the soldier course along its foot (over the tunnel),
 *  the stone band along its top. */
export const paintRoofFront = (g: Ctx, w: number, h: number) => {
  const Br = ramp6(hour(BRICK)), S = ramp6(hour(ISTRIA));
  box(g, -1, 0, w + 2, h + 1, INK);
  bricks(g, 0, 0, w, h, Br, 21, 14, 6);
  box(g, 0, 0, w, 7, S[3]); box(g, 0, 0, w, 1, S[5]); box(g, 0, 6, w, 1, S[1]);
  for (let x = 0; x < w; x += 6) { box(g, x, h - 14, 5, 13, Br[(x / 6) % 3 ? 3 : 4]); box(g, x, h - 14, 5, 1, Br[5]); box(g, x + 5, h - 14, 1, 13, Br[1]); }
  box(g, 0, h - 2, w, 2, Br[0]);
  checker(g, 0, h - 20, w, 6, '#1A0A06', 0, 2);
};
/** A chimney stub (at 0.95 on the roof): brick, its stone cap, soot down from its mouth. */
export const chimney = (c: Ctx, v: View, x: number, roofY: number) => {
  atDepth(c, v.eye, 0.95, () => still(c, 'it-forno-chimney', x, roofY, -24, -50, 48, 52, g => {
    const Br = ramp6(dimmed(BRICK)), S = ramp6(dimmed('#57534E'));
    box(g, -19, -41, 38, 41, INK); bricks(g, -18, -40, 36, 40, Br, 17, 9, 5); box(g, 10, -40, 8, 40, Br[1]);
    box(g, -23, -47, 46, 8, INK); box(g, -22, -46, 44, 6, S[3]); box(g, -22, -46, 44, 1, S[5]);
    box(g, -12, -40, 24, 8, '#1A0A06'); checker(g, -12, -32, 24, 4, '#1A0A06', 0, 2);
  }));
};
/** Smoke puffs out of a chimney mouth (live): stepped gray blobs rising. */
export const smokePuffs = (c: Ctx, x: number, y: number, f: number, k: number) => {
  for (let i = 0; i < 3; i++) {
    const t = ((f + i * 9) % 27) / 27, r = 5 + t * 7 + k * 3, py0 = y - t * 30 - i * 4, px0 = x + Math.sin(f * 0.1 + i) * 4;
    c.globalAlpha = 0.75 - t * 0.5;
    c.fillStyle = '#57534E'; c.beginPath(); c.arc(px0, py0, r + 1, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#A8A29E'; c.beginPath(); c.arc(px0, py0, r, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#D6D3D1'; c.beginPath(); c.arc(px0 - r * 0.3, py0 - r * 0.3, r * 0.5, 0, Math.PI * 2); c.fill();
  }
  c.globalAlpha = 1;
};
/** The flour sacks (a box front, local): burlap sacks stacked in rows, bulging, stitched, FARINA stenciled. */
export const paintSacks = (g: Ctx, w: number, h: number) => {
  const B = ramp6(hour('#E4D8BE'));
  box(g, -1, 0, w + 2, h, '#3A2A1A');
  const rows = Math.max(1, Math.round(h / 26)), rh = h / rows;
  for (let r = 0; r < rows; r++) for (let k = 0; k < 2; k++) {
    const sx = (r % 2) * 10 - 4 + k * (w / 2 + 4), sy = r * rh, sw = w / 2 + 6;
    g.fillStyle = INK; g.beginPath(); g.ellipse(sx + sw / 2, sy + rh / 2, sw / 2 + 1, rh / 2 + 1, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = B[3]; g.beginPath(); g.ellipse(sx + sw / 2, sy + rh / 2, sw / 2, rh / 2, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = B[4]; g.beginPath(); g.ellipse(sx + sw / 2 - 4, sy + rh / 2 - 3, sw / 3, rh / 4, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = B[2]; g.fillRect(Math.round(sx + sw / 2), Math.round(sy + rh * 0.65), Math.round(sw / 2 - 2), Math.round(rh * 0.3));
    for (let x = 4; x < sw - 4; x += 3) box(g, sx + x, sy + rh * 0.4 + (x % 2), 1, 1, B[1]);
    if ((r + k) % 2 === 0) { box(g, sx + sw / 2 - 10, sy + rh / 2 - 3, 20, 6, B[3]); g.fillStyle = hour('#1E3A8A'); for (let i = 0; i < 6; i++) g.fillRect(Math.round(sx + sw / 2 - 9 + i * 3), Math.round(sy + rh / 2 - 2), 2, 4); }
  }
  box(g, 0, 0, w, 2, B[5]);
};
/** The Vespa (local: its box's top-left at 0, 0, w x h; the wheels down to the ground at `gh`): mint paint in steps, the
 *  curved side cowls, the seat along its top, the legshield and its horn cover, the headlamp, the mirror, chrome, the
 *  whitewalls. */
export const paintVespa = (g: Ctx, w: number, h: number, gh: number) => {
  const P = ramp6(hour('#7DD3C0')), Ch = ramp6(hour('#CBD5E1')), Se = ramp6(hour('#5C3A1A')), Ti = ramp6(hour('#27272A'));
  // (the wheels)
  for (const wx of [12, w - 12]) { g.fillStyle = INK; g.beginPath(); g.arc(wx, gh - 10, 11, 0, Math.PI * 2); g.fill(); g.fillStyle = Ti[3]; g.beginPath(); g.arc(wx, gh - 10, 10, 0, Math.PI * 2); g.fill(); g.fillStyle = hour('#F5F5F4'); g.beginPath(); g.arc(wx, gh - 10, 6, 0, Math.PI * 2); g.fill(); g.fillStyle = Ch[3]; g.beginPath(); g.arc(wx, gh - 10, 4, 0, Math.PI * 2); g.fill(); box(g, wx - 2, gh - 13, 2, 2, Ch[5]); }
  // (the body: the side cowl bulging over the back wheel, the floor, the legshield up front)
  const body: [number, number][] = [[0, 10], [10, 4], [w * 0.55, 4], [w * 0.62, h * 0.55], [w - 14, h * 0.6], [w - 8, 2], [w - 2, 0], [w, h - 8], [w - 22, h - 4], [w * 0.4, h - 8], [6, h - 14], [-2, h * 0.5]];
  poly(g, body.map(([x, y]) => [x + (x < w / 2 ? -1 : 1), y + (y < h / 2 ? -1 : 1)] as [number, number]), INK);
  poly(g, body, P[3]);
  poly(g, [[0, 10], [10, 4], [w * 0.4, 4], [w * 0.3, 14], [4, 18]], P[4]);
  box(g, 2, h - 18, w * 0.5, 4, P[2]); box(g, w - 8, 4, 6, h - 14, P[2]); box(g, w - 6, 4, 2, h - 16, P[5]);
  box(g, 4, 14, 2, h - 30, P[5]);
  box(g, w * 0.44, h * 0.55, w * 0.18, 2, P[1]);
  // (the seat along the top: brown, stitched)
  box(g, 2, -1, w * 0.56, 7, INK); box(g, 3, 0, w * 0.54, 5, Se[3]); box(g, 3, 0, w * 0.54, 1, Se[5]); for (let x = 6; x < w * 0.55; x += 4) box(g, x, 3, 2, 1, Se[1]);
  // (the handlebars, the headlamp, the mirror, the horn cover's chrome)
  box(g, w - 12, -6, 14, 4, INK); box(g, w - 11, -5, 12, 2, P[3]); box(g, w - 14, -5, 4, 2, Ti[2]);
  box(g, w - 4, -12, 2, 7, Ch[2]); g.fillStyle = INK; g.beginPath(); g.arc(w - 3, -14, 4, 0, Math.PI * 2); g.fill(); g.fillStyle = Ch[4]; g.beginPath(); g.arc(w - 3, -14, 3, 0, Math.PI * 2); g.fill();
  g.fillStyle = INK; g.beginPath(); g.arc(w - 2, 0, 4, 0, Math.PI * 2); g.fill(); g.fillStyle = lampsOn() ? '#FFF4C8' : Ch[4]; g.beginPath(); g.arc(w - 2, 0, 3, 0, Math.PI * 2); g.fill();
  box(g, w - 6, h * 0.35, 5, 8, Ch[3]); for (let k = 0; k < 3; k++) box(g, w - 6, h * 0.35 + 1 + k * 2, 5, 1, Ch[1]);
};
/** A terracotta house's front (still, local top-left at 0, 0; w x h, at the play plane: what he stands on is its top):
 *  stucco over the brick showing through, the tiled eave under its top, green shutters, flower boxes, the arched door
 *  and its stone surround, a number tile; grime up the foot. */
export const paintHouse = (g: Ctx, w: number, h: number, col: string, seed: number) => {
  const R = ramp6(hour(col)), S = ramp6(hour(ISTRIA)), T = ramp6(hour(TERRA)), Br = ramp6(hour(BRICK)), Sh = ramp6(hour(SHUTTER));
  box(g, -1, 0, w + 2, h + 1, INK);
  slab(g, 0, 0, w, h, R, true); stucco(g, 0, 0, w, h, R, seed);
  for (let k = 0; k < 2; k++) { const pw = 20 + hash(seed + k) * 20, ph = 10 + hash(seed + k * 3) * 8, px0 = 10 + hash(seed + k * 5) * (w - pw - 20), py0 = 30 + hash(seed + k * 7) * (h - 90); bricks(g, px0, py0, pw, ph, Br, seed + k, 10, 4); box(g, px0, py0 + ph, pw, 1, R[4]); box(g, px0, py0 - 1, pw, 1, R[0]); }
  // (the eave: barrel tiles under the top, their shadow on the wall)
  box(g, -4, 3, w + 8, 12, INK); barrelTile(g, -3, 4, w + 6, 10, T, 5); box(g, 0, 15, w, 3, 'rgba(28, 16, 20, 0.35)');
  // (the windows, shutters open, a box of geraniums under each)
  for (let wy = 40; wy < h - 70; wy += 90) for (const wx of w > 150 ? [24, w - 50] : [Math.round(w / 2 - 13)]) {
    box(g, wx - 3, wy - 3, 32, 40, INK); box(g, wx - 2, wy - 2, 30, 38, S[3]); box(g, wx - 2, wy - 2, 30, 1, S[5]);
    hole(g, wx, wy, 26, 34, true);
    for (const sx of [wx - 12, wx + 28]) { box(g, sx - 1, wy - 1, 11, 36, INK); box(g, sx, wy, 9, 34, Sh[3]); box(g, sx, wy, 1, 34, Sh[4]); for (let yy = wy + 3; yy < wy + 32; yy += 3) box(g, sx + 1, yy, 7, 1, Sh[1]); }
    box(g, wx - 4, wy + 36, 34, 7, INK); box(g, wx - 3, wy + 37, 32, 5, T[3]); box(g, wx - 3, wy + 37, 32, 1, T[5]);
    for (let k = 0; k < 8; k++) { box(g, wx - 2 + k * 4, wy + 32, 3, 5, hour('#2F6B2A')); if (hash(seed + wy + k) > 0.35) { box(g, wx - 2 + k * 4, wy + 30, 3, 3, hour(k % 2 ? '#DC2626' : '#F472B6')); box(g, wx - 2 + k * 4, wy + 30, 1, 1, '#FECACA'); } }
  }
  // (the door: an arched plank door in a stone surround, its step; a number tile)
  const dx = w > 150 ? Math.round(w / 2 - 18) : 12, dy = h - 70;
  if (dy > 30) {
    g.fillStyle = INK; g.beginPath(); g.moveTo(dx - 5, h); g.lineTo(dx - 5, dy + 18); g.arc(dx + 18, dy + 18, 23, Math.PI, 0); g.lineTo(dx + 41, h); g.closePath(); g.fill();
    g.fillStyle = S[3]; g.beginPath(); g.moveTo(dx - 4, h); g.lineTo(dx - 4, dy + 18); g.arc(dx + 18, dy + 18, 22, Math.PI, 0); g.lineTo(dx + 40, h); g.closePath(); g.fill();
    g.save(); g.beginPath(); g.moveTo(dx, h); g.lineTo(dx, dy + 18); g.arc(dx + 18, dy + 18, 18, Math.PI, 0); g.lineTo(dx + 36, h); g.closePath(); g.clip();
    if (lampsOn()) { box(g, dx, dy, 36, 70, '#B07024'); box(g, dx, dy, 36, 26, '#E8A646'); } else planks(g, dx, dy, 36, 70, ramp6(hour('#5C3A1A')), true, seed, 9);
    g.restore();
    box(g, dx + 40, dy + 4, 12, 10, INK); box(g, dx + 41, dy + 5, 10, 8, hour('#F8FAFC')); box(g, dx + 44, dy + 7, 4, 4, hour('#1D4ED8'));
  }
  box(g, 0, h - 10, w, 10, R[1]); checker(g, 0, h - 16, w, 6, R[1], 1, 2);
};
/** A play-plane house (its top what he stands on): the top going back in terracotta tiles (rows across), its sides in
 *  stucco going back; then its front (stamped) and the lit lip. */
export const drawHouseBox = (c: Ctx, v: View, a: number, b: number, top: number, col: string, seed: number) => {
  if (!onScreen(v, a, b)) return;
  const T = ramp6(hour(TERRA)), R = ramp6(hour(col));
  if (topBack(c, v.eye, a, b, top, 1, 0.93, T, 3)) {
    c.strokeStyle = T[1]; c.lineWidth = 1; c.beginPath();
    for (let x = a + 6; x < b; x += 6) { const [p0, q0] = at(v.eye, x, top, 1), [p1, q1] = at(v.eye, x, top, 0.93); c.moveTo(p0, q0); c.lineTo(p1, q1); }
    c.stroke();
  }
  sideBack(c, v.eye, a, -1, top, GY, 1, 0.93, R, 3, false);
  sideBack(c, v.eye, b, 1, top, GY, 1, 0.93, R, 3, false);
  const w = Math.round(b - a), h = Math.round(GY - top);
  still(c, `it-house-${w}x${h}-${seed}`, a, top, -5, -1, w + 10, h + 2, g => paintHouse(g, w, h, col, seed));
  lip(c, a, top, w);
};
/** The hill town behind (set back at 0.9): stucco houses stacked up the slope, their tiled roofs, shutters, a little
 *  bell tower; dimmed. Local: foot at 0, w across, h up. */
const paintHillTown = (g: Ctx, w: number, h: number, seed: number) => {
  const Rf = ramp6(dimmed(TERRA)), S = ramp6(dimmed(ISTRIA)), Sh = ramp6(dimmed(SHUTTER));
  const COLS = ['#E8A85C', '#E2725B', '#F2E6CC', '#D98C7A', '#F4A259'];
  const n = Math.max(1, Math.round(w / 110));
  for (let i = 0; i < n; i++) {
    const hw = w / n + 10, hx = i * (w / n) - 5, hh = Math.round(h * (0.45 + 0.55 * ((i + 0.5) / n)) * (0.85 + hash(seed + i) * 0.15)), R = ramp6(dimmed(COLS[(seed + i) % COLS.length]));
    box(g, hx - 1, -hh - 1, hw + 2, hh + 1, INK); slab(g, hx, -hh, hw, hh, R, true); stucco(g, hx, -hh, hw, hh, R, seed + i);
    poly(g, [[hx - 8, -hh + 2], [hx + hw / 2, -hh - 30], [hx + hw + 8, -hh + 2]], INK);
    g.save(); g.beginPath(); g.moveTo(hx - 7, -hh + 1); g.lineTo(hx + hw / 2, -hh - 29); g.lineTo(hx + hw + 7, -hh + 1); g.closePath(); g.clip(); barrelTile(g, hx - 8, -hh - 30, hw + 16, 32, Rf, 5); box(g, hx + hw / 2, -hh - 30, hw / 2 + 8, 32, 'rgba(28, 16, 20, 0.2)'); g.restore();
    for (let wy = -hh + 30; wy < -40; wy += 70) for (let wx = hx + 18; wx < hx + hw - 30; wx += 44) {
      hole(g, wx, wy, 16, 22, true);
      box(g, wx - 7, wy, 6, 22, Sh[3]); box(g, wx + 17, wy, 6, 22, Sh[3]); box(g, wx - 7, wy, 1, 22, Sh[4]); box(g, wx + 17, wy, 1, 22, Sh[4]);
    }
  }
  // (a little bell tower among them)
  const tx = Math.round(w * 0.58), th = Math.round(h * 1.05);
  box(g, tx - 1, -th - 1, 32, th + 1, INK); bricks(g, tx, -th, 30, th, ramp6(dimmed('#B4532A')), seed, 10, 5);
  box(g, tx + 6, -th + 10, 18, 22, '#1C1014'); g.fillStyle = '#1C1014'; g.beginPath(); g.arc(tx + 15, -th + 10, 9, Math.PI, 0); g.fill();
  box(g, tx - 3, -th - 4, 36, 5, S[3]); poly(g, [[tx - 2, -th - 4], [tx + 15, -th - 30], [tx + 32, -th - 4]], Rf[2]); poly(g, [[tx - 2, -th - 4], [tx + 15, -th - 30], [tx + 15, -th - 4]], Rf[3]);
};
export const drawHillTown = (c: Ctx, v: View, x: number, w: number, h: number, seed: number) => facade(c, v, `it-hill-${w}x${h}-${seed}`, x, w, h, g => paintHillTown(g, w, h, seed), 0.9, Math.round(h * 0.15) + 50, 14, false);

void FACADE_D; void LIP; void post; void checker;
