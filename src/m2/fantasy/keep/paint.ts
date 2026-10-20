// The castle's base's painting kit (the SNES pass): its depths (one eye over the whole scene: kit.ts's view), its
// materials in six-step ramps (darkest first, lit from the upper left), and the castle's parts painted the same way
// everywhere: dressed fiberglass ashlar (courses, staggered joints, blocks picked out lighter and darker, chips, a
// weathered foot), crenellations (merlons with their caps and arrow slits), lancet windows in stained glass (lit after
// dark), cross slits, hanging banners (folds in steps, a gold fringe, the heart), round towers under cone roofs (shingles
// in rows, gold bands, a finial, a pennant), wall sconces, and the lit lip along everything he can stand on.

import { type Ctx, INK, box, mix, hash, checker, polyF, ramp6, rampH, lit, GOLD, IRON, TIMBER, LIP, SNOW, snowCap } from '../kit';

export { snowCap };

/** The depths: the barbican's yard wall, the moat's far end, the gatehouse passage's back wall, the courtyard's far wall
 *  and its arcade, the props in the yard, the wall walk's parapet, the tower's inside, the tower's outside behind the
 *  steps, the postern yard's wall, the broom port's stands and its hoops. */
export const BAILEY_D = 0.84, MOAT_D = 0.78, PASS_D = 0.9, YARD_D = 0.74, ARCADE_D = 0.8, PROP_D = 0.92, PARA_D = 0.965;
export const TOWER_D = 0.9, OUT_D = 0.93, POST_D = 0.84, STAND_D = 0.7, HOOP_D = 0.82, BARB_D = 0.93;

/** The castle's materials: pale fiberglass stone (a cool cream lilac), the blue cone roofs, pink (banners, plaster),
 *  the flagstones, the deck's planks, rose leaves. */
export const PALE = ['#3A3352', '#5E557A', '#857C9F', '#ADA4C4', '#CEC7E0', '#EEEAF8'];
export const ROOF = ['#141E4A', '#1E3278', '#2E4EA8', '#3E68C4', '#6A90DC', '#A4C0F0'];
export const PINK = ['#4A1030', '#7A1E4E', '#AA3470', '#D8609E', '#F096C4', '#FFD0E8'];
export const RED = ['#2E0810', '#561020', '#821C30', '#B02A42', '#D2506A', '#EE8A9E'];
export const FLAGS = ['#2A2638', '#433E56', '#5E5874', '#7A7490', '#9C96B0', '#C4BED6'];
export const DECK = ['#24140A', '#3E2414', '#5C381E', '#7C5030', '#9C6C44', '#C49468'];
export const LEAVES = ['#0E2214', '#18361E', '#244C2A', '#346838', '#4E8A4A', '#78AE66'];
export const PLUM = ['#1E1030', '#341C4E', '#4E2C70', '#6A4090', '#8E62B4', '#B892D8'];
export { GOLD, IRON, TIMBER, LIP };

/** A ramp for the hour: near (`false`) or dimmed scenery (`true`). */
export const R = (ramp: string[], scenery = true) => rampH(ramp, scenery);
/** A ramp round any color, for the hour. */
export const RC = (col: string, scenery = true) => rampH(ramp6(col), scenery);

/** Stained glass by day (dark, a sheen) or lit after dark (glowing). Darkest first. */
export const glass = (col: string) => (lit() ? ramp6(mix(col, '#FFE0A0', 0.35)).slice(2).concat(['#FFFFFF', '#FFFFFF']) : ramp6(mix(col, '#2A2448', 0.5)));

// ---------------------------------------------------------------------------------------------------------------
// The parts

/** The lit lip along a top he can stand on (x..x+w at y): warm, catching the light. */
export const lip = (g: Ctx, x: number, y: number, w: number) => {
  box(g, x, y, w, 3, LIP[2]); box(g, x, y, w, 1, LIP[3]); box(g, x, y + 3, w, 1, LIP[1]); checker(g, x, y + 4, w, 2, LIP[0], 0, 1);
};

/**
 * Dressed ashlar over x..x+w, y..y+h (`S` a ramp6): courses `ch` tall in staggered blocks, each picked out a step
 * lighter or darker here and there, lit along its top and left, shaded along its foot; chips; the foot weathered
 * (dithered dark) and the top of the face lit. `seed` keeps it the same each time.
 */
export const ashlar = (g: Ctx, x: number, y: number, w: number, h: number, S: string[], seed: number, ch = 14, bw = 30) => {
  box(g, x, y, w, h, S[3]);
  let row = 0;
  for (let cy = y; cy < y + h; cy += ch, row++) {
    const hh = Math.min(ch, y + h - cy);
    box(g, x, cy + hh - 1, w, 1, S[1]);
    let bx = x - ((row % 2) * bw) / 2 - Math.floor(hash(seed + row) * 6);
    let k = 0;
    while (bx < x + w) {
      const bwk = bw - 4 + Math.floor(hash(seed * 1.3 + row * 7.1 + k) * 10);
      const a = Math.max(x, bx), b = Math.min(x + w, bx + bwk);
      if (b > a + 1) {
        const t = hash(seed + row * 13.7 + k * 3.1);
        if (t > 0.8) box(g, a, cy, b - a - 1, hh - 1, S[4]); else if (t < 0.16) box(g, a, cy, b - a - 1, hh - 1, S[2]);
        box(g, a, cy, b - a - 1, 1, t > 0.8 ? S[5] : S[4]);
        if (hh > 4) box(g, a, cy + hh - 3, b - a - 1, 1, S[2]);
        if (bx >= x) box(g, bx - 1, cy, 1, hh, S[1]);
        if (t > 0.93 && b - a > 8) { box(g, a + 3, cy + 3, 3, 2, S[1]); box(g, a + 3, cy + 3, 1, 1, S[0]); }
      }
      bx += bwk; k++;
    }
  }
  box(g, x, y, w, 1, S[5]);
  if (h > 30) { box(g, x, y + h - 6, w, 6, S[2]); checker(g, x, y + h - 10, w, 4, S[2], 0, 1); }
};

/** A wall's crenellations along its top (x..x+w at y, the wall's top): a coping, merlons `mw` wide with caps and a
 *  slit in some, the embrasures between. Snow on the caps if `snow`. */
export const merlons = (g: Ctx, x: number, y: number, w: number, S: string[], mw = 18, gap = 12, mh = 16, snow = true) => {
  box(g, x - 2, y - 4, w + 4, 5, INK); box(g, x - 1, y - 3, w + 2, 3, S[4]); box(g, x - 1, y - 3, w + 2, 1, S[5]); box(g, x - 1, y, w + 2, 1, S[1]);
  for (let mx = x; mx < x + w - 4; mx += mw + gap) {
    const ww = Math.min(mw, x + w - mx);
    box(g, mx - 1, y - mh - 5, ww + 2, mh + 2, INK);
    box(g, mx, y - mh - 4, ww, mh, S[3]); box(g, mx, y - mh - 4, 2, mh, S[4]); box(g, mx + ww - 3, y - mh - 4, 3, mh, S[2]);
    box(g, mx - 2, y - mh - 7, ww + 4, 3, INK); box(g, mx - 1, y - mh - 6, ww + 2, 2, S[4]); box(g, mx - 1, y - mh - 6, ww + 2, 1, S[5]);
    if (ww > 12 && Math.floor(mx / (mw + gap)) % 2 === 0) { box(g, mx + ww / 2 - 1, y - mh, 2, mh - 6, INK); box(g, mx + ww / 2 - 3, y - mh + 3, 6, 1, INK); }
    if (snow) { box(g, mx - 1, y - mh - 9, ww + 2, 3, SNOW[4]); box(g, mx, y - mh - 9, ww * 0.6, 1, SNOW[5]); box(g, mx - 1, y - mh - 7, ww + 2, 1, SNOW[2]); }
  }
};

/** A cross slit (an arrow loop) in a wall, its splay lit on the left. */
export const slit = (g: Ctx, x: number, y: number, h: number, S: string[]) => {
  box(g, x - 3, y - 1, 6, h + 2, S[1]); box(g, x - 1, y, 2, h, INK); box(g, x - 5, y + h * 0.4 - 1, 10, 3, S[1]); box(g, x - 4, y + h * 0.4, 8, 1, INK);
  box(g, x - 3, y - 1, 1, h + 2, S[4]);
};

/** A lancet window (x the middle, y its top, w across, h tall): a moulded frame, tracery, stained glass in panes
 *  (`col` its glass), a sill. Lit after dark. */
export const lancet = (g: Ctx, x: number, y: number, w: number, h: number, S: string[], col: string, seed = 0) => {
  const r = w / 2, Gl = glass(col), G2 = glass(['#3A6ACC', '#C8306E', '#2E9A6A', '#E0AE3A'][((Math.floor(seed) % 4) + 4) % 4]);
  const arch = (dx: number, rr: number, col2: string) => { g.fillStyle = col2; g.beginPath(); g.moveTo(x - rr + dx, y + h); g.lineTo(x - rr + dx, y + r); g.quadraticCurveTo(x - rr + dx, y - r * 0.4 + (r - rr), x + dx, y - r * 0.5 + (r - rr)); g.quadraticCurveTo(x + rr + dx, y - r * 0.4 + (r - rr), x + rr + dx, y + r); g.lineTo(x + rr + dx, y + h); g.closePath(); g.fill(); };
  arch(0, r + 4, INK); arch(0, r + 3, S[4]); arch(1, r + 2, S[2]); arch(0, r + 1, INK); arch(0, r, Gl[1]);
  g.save(); arch(0, r, Gl[1]); g.clip();
  for (let py = y - r; py < y + h; py += 6) for (let pxx = x - r; pxx < x + r; pxx += 5) { const t = hash(seed + py * 0.37 + pxx * 1.13); box(g, pxx, py, 4, 5, t > 0.7 ? G2[3] : t > 0.4 ? Gl[3] : Gl[2]); if (t > 0.88) box(g, pxx, py, 2, 2, Gl[5]); }
  for (let py = y - r; py < y + h; py += 6) box(g, x - r, py, w, 1, INK);
  box(g, x - 1, y - r, 1, h + r, INK);
  if (!lit()) { g.globalAlpha = 0.3; polyF(g, [[x - r, y + h * 0.2], [x - r + w * 0.5, y], [x - r + w * 0.7, y], [x - r, y + h * 0.6]], '#FFFFFF'); g.globalAlpha = 1; }
  g.restore();
  box(g, x - r - 5, y + h, w + 10, 4, INK); box(g, x - r - 4, y + h, w + 8, 2, S[5]); box(g, x - r - 4, y + h + 2, w + 8, 1, S[2]);
};

/** A banner hung off a pole (x the middle, top its pole, w across, len down): pink (or `col`) in stepped folds, a gold
 *  trim, a swallowtail with a gold fringe, a gold heart (or a crown) on it. */
export const banner = (g: Ctx, x: number, top: number, w: number, len: number, B: string[], Gd: string[], emblem: 'heart' | 'crown' | 'star' = 'heart') => {
  const l = x - w / 2, r2 = x + w / 2;
  box(g, l - 6, top - 3, w + 12, 4, INK); box(g, l - 5, top - 2, w + 10, 2, Gd[3]); ballR2(g, l - 7, top - 1, 3, Gd); ballR2(g, r2 + 7, top - 1, 3, Gd);
  polyF(g, [[l - 1, top + 1], [r2 + 1, top + 1], [r2 + 1, top + len + 1], [x, top + len - w * 0.4], [l - 1, top + len + 1]], INK);
  polyF(g, [[l, top + 1], [r2, top + 1], [r2, top + len], [x, top + len - w * 0.4 - 1], [l, top + len]], B[3]);
  // (the folds: lit, shade, lit across)
  const n = Math.max(2, Math.floor(w / 9));
  for (let k = 0; k < n; k++) { const fx = l + (k * w) / n; box(g, fx, top + 1, 2, len - w * 0.2, B[4]); box(g, fx + w / n - 3, top + 1, 2, len - w * 0.2, B[2]); }
  box(g, l, top + 1, 2, len, B[5]); box(g, r2 - 2, top + 1, 2, len, B[1]);
  box(g, l + 2, top + 4, w - 4, 2, Gd[3]); box(g, l + 2, top + len - w * 0.4 - 8, w - 4, 2, Gd[3]);
  for (let k = 0; k < w; k += 3) { const yy = top + len - (1 - Math.abs(x - (l + k)) / (w / 2)) * w * 0.4; box(g, l + k, yy - 1, 1, 4, Gd[k % 2 ? 4 : 2]); }
  const cy = top + 6 + (len - w * 0.4) * 0.42;
  if (emblem === 'heart') {
    const s = w / 22;
    g.fillStyle = INK; g.beginPath(); g.arc(x - 3.5 * s, cy, 4.6 * s, 0, Math.PI * 2); g.arc(x + 3.5 * s, cy, 4.6 * s, 0, Math.PI * 2); g.fill(); polyF(g, [[x - 8 * s, cy + 1], [x, cy + 10 * s], [x + 8 * s, cy + 1]], INK);
    g.fillStyle = Gd[3]; g.beginPath(); g.arc(x - 3.5 * s, cy, 3.6 * s, 0, Math.PI * 2); g.arc(x + 3.5 * s, cy, 3.6 * s, 0, Math.PI * 2); g.fill(); polyF(g, [[x - 7 * s, cy + 1], [x, cy + 8.6 * s], [x + 7 * s, cy + 1]], Gd[3]);
    box(g, x - 5 * s, cy - 2 * s, 2 * s, 2 * s, Gd[5]); box(g, x + 1, cy + 3 * s, 3 * s, 2 * s, Gd[2]);
  } else if (emblem === 'crown') {
    const s = w / 22;
    polyF(g, [[x - 8 * s, cy + 5 * s], [x - 8 * s, cy - 4 * s], [x - 4 * s, cy], [x, cy - 6 * s], [x + 4 * s, cy], [x + 8 * s, cy - 4 * s], [x + 8 * s, cy + 5 * s]], INK);
    polyF(g, [[x - 7 * s, cy + 4 * s], [x - 7 * s, cy - 2 * s], [x - 4 * s, cy + 1], [x, cy - 4 * s], [x + 4 * s, cy + 1], [x + 7 * s, cy - 2 * s], [x + 7 * s, cy + 4 * s]], Gd[3]);
    box(g, x - 7 * s, cy + 2 * s, 14 * s, 2 * s, Gd[2]); box(g, x - 1, cy - 1, 2, 2, PINK[5]);
  } else {
    const s = w / 22;
    polyF(g, [[x, cy - 8 * s], [x + 2.4 * s, cy - 2 * s], [x + 8 * s, cy - 2 * s], [x + 3.4 * s, cy + 2 * s], [x + 5 * s, cy + 8 * s], [x, cy + 4 * s], [x - 5 * s, cy + 8 * s], [x - 3.4 * s, cy + 2 * s], [x - 8 * s, cy - 2 * s], [x - 2.4 * s, cy - 2 * s]], Gd[3]);
  }
};
const ballR2 = (g: Ctx, x: number, y: number, r: number, Rr: string[]) => {
  g.fillStyle = INK; g.beginPath(); g.arc(x, y, r + 1, 0, Math.PI * 2); g.fill();
  g.fillStyle = Rr[2]; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  g.fillStyle = Rr[4]; g.beginPath(); g.arc(x - r * 0.3, y - r * 0.3, r * 0.5, 0, Math.PI * 2); g.fill();
};

/** A cone roof (cx its middle, base its foot, rw half across, h tall): slates in rows (stepped across: lit left, shaded
 *  right), gold bands, snow on the brim and down the lit side, the finial and a pennant. */
export const cone = (g: Ctx, cx: number, base: number, rw: number, h: number, Rf: string[], Gd: string[], pennant: string | null, Sn = SNOW) => {
  polyF(g, [[cx - rw - 2, base + 1], [cx, base - h - 2], [cx + rw + 2, base + 1]], INK);
  polyF(g, [[cx - rw, base], [cx, base - h], [cx + rw, base]], Rf[3]);
  polyF(g, [[cx - rw, base], [cx, base - h], [cx - rw * 0.55, base]], Rf[4]);
  polyF(g, [[cx - rw * 0.86, base], [cx, base - h], [cx - rw * 0.72, base]], Rf[5]);
  polyF(g, [[cx + rw * 0.3, base], [cx, base - h], [cx + rw * 0.7, base]], Rf[2]);
  polyF(g, [[cx + rw * 0.7, base], [cx, base - h], [cx + rw, base]], Rf[1]);
  // (the slates: scalloped rows)
  for (let k = 0.08; k < 0.92; k += 0.075) {
    const yb = base - h * k, hw = rw * (1 - k);
    for (let sx = -hw; sx < hw; sx += 5) { const t = (sx + hw) / (2 * hw); box(g, cx + sx, yb, 4, 1, t < 0.4 ? Rf[2] : t < 0.75 ? Rf[1] : Rf[0]); }
  }
  for (const k of [0.32, 0.66]) { const yb = base - h * k, hw = rw * (1 - k); box(g, cx - hw, yb - 1, hw * 2, 3, INK); box(g, cx - hw + 1, yb, hw * 2 - 2, 1, Gd[3]); box(g, cx - hw + 1, yb, hw * 0.7, 1, Gd[5]); }
  box(g, cx - rw - 2, base - 2, rw * 2 + 4, 3, Sn[4]); box(g, cx - rw - 1, base - 3, rw, 1, Sn[5]); box(g, cx - rw - 2, base + 1, rw * 2 + 4, 1, Sn[1]);
  for (let k = 0; k < 4; k++) { const yb = base - h * (0.15 + k * 0.17), hw = rw * (1 - (0.15 + k * 0.17)); box(g, cx - hw, yb, hw * 0.35, 2, Sn[k % 2 ? 3 : 4]); }
  box(g, cx - 1, base - h - 12, 2, 12, Gd[2]); box(g, cx - 1, base - h - 12, 1, 12, Gd[4]);
  ballR2(g, cx, base - h - 13, 2.5, Gd);
  if (pennant) { box(g, cx, base - h - 26, 1, 12, INK); polyF(g, [[cx + 1, base - h - 26], [cx + 18, base - h - 22], [cx + 8, base - h - 20], [cx + 16, base - h - 17], [cx + 1, base - h - 18]], pennant); box(g, cx + 1, base - h - 26, 10, 1, mix(pennant, '#FFFFFF', 0.4)); }
};

/** A round tower's body (cx its middle, foot..top, w across): stepped across as a drum (lit left, shaded right,
 *  dithered between), courses curving a little, slits, windows, a corbelled band under its top. */
export const drum = (g: Ctx, cx: number, top: number, foot: number, w: number, S: string[], seed: number, opts: { windows?: number; glassCol?: string; slits?: boolean; band?: boolean } = {}) => {
  const x = cx - w / 2, h = foot - top;
  box(g, x - 1, top, w + 2, h, INK);
  const cols: [number, number][] = [[0, 4], [0.14, 5], [0.24, 4], [0.42, 3], [0.66, 2], [0.84, 1]];
  cols.forEach(([t, i], k) => { const a = x + w * t, b = x + w * (cols[k + 1]?.[0] ?? 1); box(g, a, top, b - a, h, S[i]); });
  ([[0.24, 4], [0.42, 3], [0.66, 2], [0.84, 1]] as const).forEach(([t, i]) => checker(g, x + w * t - 1, top, 2, h, S[i], 0, 1));
  for (let y = top + 10; y < foot; y += 12) {
    for (let k = 0; k < 8; k++) { const a = x + (w * k) / 8, sag = Math.round(Math.sin((k + 0.5) / 8 * Math.PI) * 2); box(g, a, y + sag, w / 8, 1, k > 5 ? S[0] : S[1]); }
    for (let k = 1; k < 4; k++) { const jx = x + w * (k / 4 + (((y / 12) | 0) % 2) * 0.12); if (jx < x + w - 2) box(g, jx, y - 11, 1, 11, S[1]); }
  }
  if (opts.slits) for (let y = top + 30; y < foot - 30; y += 70) slit(g, cx + Math.round((hash(seed + y) - 0.5) * w * 0.3), y, 18, S);
  const n = opts.windows ?? 0;
  for (let i = 0; i < n; i++) { const wy = top + 26 + (i * (h - 50)) / Math.max(1, n); lancet(g, cx, wy, Math.max(8, Math.round(w * 0.2)), Math.max(16, Math.round(w * 0.36)), S, opts.glassCol ?? '#C8306E', seed + i); }
  if (opts.band !== false) {
    box(g, x - 5, top - 2, w + 10, 7, INK); box(g, x - 4, top - 1, w + 8, 5, S[4]); box(g, x - 4, top - 1, w + 8, 1, S[5]); box(g, x - 4, top + 3, w + 8, 1, S[1]);
    for (let k = x - 2; k < x + w; k += 8) { box(g, k, top + 5, 5, 6, INK); box(g, k + 1, top + 5, 3, 5, S[3]); box(g, k + 1, top + 5, 1, 5, S[4]); }
  }
};

/** A wall sconce (still: its iron bracket and cup; the flame's live). (x, y) the cup's top. */
export const sconce = (g: Ctx, x: number, y: number, Ir: string[]) => {
  box(g, x - 4, y + 10, 8, 10, INK); box(g, x - 3, y + 11, 6, 8, Ir[3]); box(g, x - 3, y + 11, 2, 8, Ir[4]);
  box(g, x - 1, y + 2, 3, 10, INK); box(g, x, y + 3, 1, 8, Ir[4]);
  polyF(g, [[x - 6, y - 1], [x + 6, y - 1], [x + 4, y + 4], [x - 4, y + 4]], INK); polyF(g, [[x - 5, y], [x + 5, y], [x + 3, y + 3], [x - 3, y + 3]], Ir[3]); box(g, x - 5, y, 10, 1, Ir[5]);
};
/** The live flame on a sconce (cup top at x, y): stepped, flickering, a soft glow. */
export const flame = (c: Ctx, x: number, y: number, f: number, glow = 0.16) => {
  const fl = Math.floor((f + x * 0.37) / 5) % 3;
  c.save(); c.globalAlpha = glow; c.fillStyle = '#FDBA74'; c.beginPath(); c.arc(x, y - 6, 18, 0, Math.PI * 2); c.fill(); c.globalAlpha = glow * 0.6; c.beginPath(); c.arc(x, y - 6, 28, 0, Math.PI * 2); c.fill(); c.restore();
  box(c, x - 4, y - 9 - fl, 8, 9 + fl, '#B4400E'); box(c, x - 3, y - 12 - fl, 6, 12 + fl, '#F97316'); box(c, x - 2, y - 9 - fl, 4, 8 + fl, '#FBBF24'); box(c, x - 1, y - 6, 2, 5, '#FFF4C8');
  box(c, x + (fl - 1), y - 15 - fl, 2, 3, '#F97316');
};

/** A stone slab in the play plane he can stand on (x..x+w, top..bot): ashlar, the lit lip. Corbels under if `corbels`. */
export const standSlab = (g: Ctx, x: number, w: number, h: number, S: string[], seed: number, corbels = false) => {
  box(g, x - 1, -1, w + 2, h + 2, INK);
  ashlar(g, x, 0, w, h, S, seed, Math.min(14, Math.max(8, Math.floor(h / 2))), 26);
  box(g, x + w - 3, 0, 3, h, S[1]);
  if (corbels) for (let cx = x + 8; cx < x + w - 10; cx += 26) { polyF(g, [[cx - 1, h], [cx + 15, h], [cx + 11, h + 14], [cx + 3, h + 14]], INK); polyF(g, [[cx, h], [cx + 14, h], [cx + 10, h + 13], [cx + 4, h + 13]], S[2]); box(g, cx, h, 14, 1, S[1]); box(g, cx + 1, h + 1, 2, 10, S[4]); }
  lip(g, x, 0, w);
};

/** A wooden hoarding (a covered gallery out over a walk; scenery, not stood on): its posts and braces, planked front,
 *  its roof in pink shingles with a snowy brim, the machicolation slots in its floor. Local: its floor's at 0, x..x+w. */
export const hoardingArt = (g: Ctx, x: number, w: number, W: string[], Rf: string[], Ir: string[]) => {
  // (the planks)
  box(g, x - 1, -55, w + 2, 56, INK); box(g, x, -54, w, 54, W[3]);
  for (let k = x; k < x + w; k += 9) { box(g, k, -54, 1, 54, W[1]); box(g, k + 1, -54, 2, 54, W[4]); if (hash(k) > 0.7) box(g, k + 3, -40 + hash(k * 2) * 30, 2, 2, W[0]); }
  box(g, x, -54, w, 3, W[5]); box(g, x, -4, w, 4, W[1]);
  // (posts, an X brace in each bay, iron straps)
  for (let k = x; k <= x + w; k += 60) { box(g, k - 3, -56, 7, 58, INK); box(g, k - 2, -55, 5, 56, W[2]); box(g, k - 2, -55, 1, 56, W[4]); for (const y of [-48, -12]) box(g, k - 3, y, 7, 3, Ir[3]); }
  for (let k = x; k < x + w - 10; k += 60) { g.strokeStyle = W[1]; g.lineWidth = 3; g.beginPath(); g.moveTo(k + 4, -50); g.lineTo(k + 56, -8); g.moveTo(k + 56, -50); g.lineTo(k + 4, -8); g.stroke(); g.strokeStyle = W[4]; g.lineWidth = 1; g.beginPath(); g.moveTo(k + 4, -51); g.lineTo(k + 56, -9); g.stroke(); }
  // (shuttered loops)
  for (let k = x + 28; k < x + w - 10; k += 60) { box(g, k - 6, -40, 12, 16, INK); box(g, k - 5, -39, 10, 14, W[1]); box(g, k - 5, -39, 10, 2, W[4]); box(g, k - 1, -39, 1, 14, INK); }
  // (the roof: shingles in rows, a snowy brim)
  polyF(g, [[x - 14, -54], [x + w / 2, -86], [x + w + 14, -54]], INK);
  polyF(g, [[x - 12, -55], [x + w / 2, -84], [x + w + 12, -55]], Rf[3]);
  for (let r = 0; r < 5; r++) { const y = -58 - r * 6, half = (w / 2 + 12) * (1 - (r * 6 + 3) / 30); for (let sx = -half; sx < half; sx += 6) box(g, x + w / 2 + sx, y, 5, 2, sx < 0 ? Rf[4] : Rf[2]); }
  polyF(g, [[x + w / 2, -84], [x + w + 12, -55], [x + w / 2 + 10, -55]], Rf[1]);
  box(g, x - 14, -57, w + 28, 3, SNOW[4]); box(g, x - 12, -58, w * 0.5, 1, SNOW[5]); box(g, x - 14, -54, w + 28, 1, SNOW[1]);
  for (let k = x - 10; k < x + w + 10; k += 7 + (k % 5)) box(g, k, -54, 2, 3 + (k % 4), SNOW[3]);
  // (the floor's beams poking out under it)
  for (let k = x + 10; k < x + w; k += 40) { box(g, k - 1, -1, 9, 8, INK); box(g, k, 0, 7, 6, W[2]); box(g, k, 0, 7, 1, W[4]); }
};

/** A lamp post (the park's: fluted iron, a lantern with its glass, a snow cap); its foot at 0. Lit after dark. */
export const lampPost = (g: Ctx, Ir: string[], Gd: string[], h = 120) => {
  box(g, -8, -10, 16, 10, INK); box(g, -7, -9, 14, 9, Ir[3]); box(g, -7, -9, 14, 2, Ir[5]);
  box(g, -4, -h + 10, 8, h - 18, INK); box(g, -3, -h + 10, 6, h - 18, Ir[3]); box(g, -3, -h + 10, 2, h - 18, Ir[5]); box(g, 1, -h + 10, 2, h - 18, Ir[1]);
  box(g, -6, -h + 8, 12, 4, INK); box(g, -5, -h + 9, 10, 2, Gd[3]);
  const G = lit() ? ['#FFD88A', '#FFF4C8'] : ['#8E8A9E', '#C8C6D6'];
  polyF(g, [[-9, -h + 8], [9, -h + 8], [12, -h - 14], [-12, -h - 14]], INK); polyF(g, [[-8, -h + 7], [8, -h + 7], [10, -h - 13], [-10, -h - 13]], G[0]); box(g, -6, -h - 11, 3, 16, G[1]); box(g, -1, -h - 13, 2, 20, INK);
  polyF(g, [[-14, -h - 13], [0, -h - 26], [14, -h - 13]], INK); polyF(g, [[-12, -h - 14], [0, -h - 24], [12, -h - 14]], Ir[3]); box(g, -13, -h - 16, 26, 3, SNOW[4]);
  box(g, -1, -h - 32, 2, 7, Gd[3]); ballR2(g, 0, -h - 33, 2, Gd);
};

/** A topiary on its tub: a heart, a crown-ish ball on a stem, or a unicorn's head (the park's hedges). Foot at 0. */
export const topiary = (g: Ctx, kind: number, L: string[], Tb: string[]) => {
  box(g, -15, -20, 30, 20, INK); box(g, -14, -19, 28, 19, Tb[3]); box(g, -14, -19, 28, 2, Tb[5]); box(g, 8, -19, 6, 19, Tb[2]); box(g, -14, -12, 28, 2, Tb[1]);
  const blob = (x: number, y: number, r: number) => { g.fillStyle = INK; g.beginPath(); g.arc(x, y, r + 1, 0, Math.PI * 2); g.fill(); g.fillStyle = L[2]; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.fillStyle = L[3]; g.beginPath(); g.arc(x - r * 0.2, y - r * 0.2, r * 0.75, 0, Math.PI * 2); g.fill(); g.fillStyle = L[4]; g.beginPath(); g.arc(x - r * 0.4, y - r * 0.4, r * 0.35, 0, Math.PI * 2); g.fill(); checker(g, x - r, y + r * 0.4, r * 2, r * 0.5, L[1], 0, 1); };
  box(g, -2, -40, 4, 22, INK); box(g, -1, -40, 2, 22, TIMBER[3]);
  if (kind % 3 === 0) { blob(-9, -60, 11); blob(9, -60, 11); polyF(g, [[-19, -57], [0, -32], [19, -57]], INK); polyF(g, [[-18, -57], [0, -34], [18, -57]], L[2]); blob(0, -50, 8); }
  else if (kind % 3 === 1) { blob(0, -52, 15); blob(0, -74, 9); blob(0, -86, 5); }
  else { blob(0, -50, 13); blob(6, -70, 9); blob(14, -76, 6); polyF(g, [[2, -78], [-2, -100], [6, -80]], '#F6D365'); box(g, 8, -76, 2, 2, INK); }
};

/** A crowd figure (a guest, seeded: skin, coat, hat or hair), standing at 0, `s` tall-ish. For the stands and yards. */
export const guest = (g: Ctx, x: number, foot: number, seed: number, s = 1, dim = (c: string) => c, wave = false) => {
  const skins = ['#F2C8A0', '#D8A078', '#A8704A', '#7A4A2A', '#5A341E', '#F8D8B8'];
  const coats = ['#C8283E', '#2E5AAE', '#E0AE3A', '#2E8A5A', '#7A3AAA', '#E86AA8', '#F4F0FA', '#3A3448', '#E07A1E', '#1E8A8A'];
  const hairs = ['#1A1010', '#5A3A1E', '#E8C870', '#9A4A1E', '#C8C8D0', '#2A1A10'];
  const sk = dim(skins[Math.floor(hash(seed) * 6)]), co = dim(coats[Math.floor(hash(seed * 1.7) * 10)]), ha = dim(hairs[Math.floor(hash(seed * 2.3) * 6)]);
  const w = Math.round((6 + hash(seed * 3.1) * 3) * s), h = Math.round((12 + hash(seed * 4.7) * 5) * s), hd = Math.max(3, Math.round(4 * s));
  box(g, x - w / 2 - 1, foot - h - 1, w + 2, h + 1, dim(INK)); box(g, x - w / 2, foot - h, w, h, co); box(g, x - w / 2, foot - h, 1, h, mix(co, '#FFFFFF', 0.3)); box(g, x + w / 2 - 2, foot - h, 2, h, mix(co, '#000000', 0.3));
  box(g, x - hd / 2 - 1, foot - h - hd * 2, hd + 2, hd * 2 + 1, dim(INK)); box(g, x - hd / 2, foot - h - hd * 2 + 1, hd, hd * 2 - 1, sk);
  const hat = hash(seed * 5.9);
  if (hat > 0.75) { box(g, x - hd / 2 - 1, foot - h - hd * 2 - 1, hd + 2, 3, co); box(g, x - 1, foot - h - hd * 2 - 3, 2, 2, '#FFFFFF'); }
  else if (hat > 0.6) { polyF(g, [[x - hd / 2 - 1, foot - h - hd * 2 + 1], [x, foot - h - hd * 2 - 6 * s], [x + hd / 2 + 1, foot - h - hd * 2 + 1]], dim('#F49AC8')); }
  else box(g, x - hd / 2, foot - h - hd * 2, hd, 2, ha);
  if (wave) { box(g, x + w / 2, foot - h - hd * 2, 2, h * 0.6, co); box(g, x + w / 2, foot - h - hd * 2 - 2, 2, 2, sk); }
};
