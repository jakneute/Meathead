// The ending cutscene's still images, drawn as SNES-style pixel art on a
// 256x144 canvas (scaled up with no smoothing). Each panel is a function of
// its frame counter so it can blink, flash and animate a little, the way NES
// cutscenes do.

import { shaded, ball, box, bands, layer, RAMP } from './art/snes';
import { paintWhiteHouse, paintFence, whFlag, WH_NIGHT } from './art/whiteHouse';
import { painting, bayer, noise, hash2, Painter, FormOpts } from './art/raster';
import { shatPants, shatFront, shatSide, shatCloseUp, shatClock, flies, stink } from './shatLook';

export const ART_W = 256;
export const ART_H = 144;

type Ctx = CanvasRenderingContext2D;

// NES-ish palette
export const C = {
  black: '#000000', white: '#fcfcfc', lightGray: '#bcbcbc', gray: '#7c7c7c', darkGray: '#3c3c3c', ink: '#1c1c1c',
  night: '#0c0c3c', night2: '#1c1c6c', moon: '#fcf8d8', lit: '#fce0a8',
  grass: '#00a800', darkGrass: '#005800',
  curtain: '#0000bc', curtainDark: '#00007c', curtainLight: '#0058f8',
  wood: '#a44c00', woodDark: '#7c3000', woodLight: '#c86c20',
  gold: '#f8b800', goldLight: '#fce0a0', red: '#d82800', darkRed: '#881400', blue: '#0058f8', navy: '#1c1c5c', navyDark: '#10103c',
  // Trump
  tSkin: '#f89848', tSkinShade: '#d86818', tSkinPale: '#fcc890', tHair: '#f8d878', tHairLight: '#fcfcb0', tHairShade: '#d8a800',
  // Meathead
  mSkin: '#e0ac69', mSkinShade: '#c68b45', mSkinLight: '#f5d0a9', mHair: '#101010', vein: '#ef4444', pants: '#1e3a8a', belt: '#78350f', buckle: '#facc15',
};

// ---------------------------------------------------------------------------
// Pixel helpers
// ---------------------------------------------------------------------------

export const R = (ctx: Ctx, x: number, y: number, w: number, h: number, c: string) => {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
};

/** A filled ellipse built from pixel rows (keeps the hard NES edges). */
export const ell = (ctx: Ctx, cx: number, cy: number, rx: number, ry: number, c: string) => {
  ctx.fillStyle = c;
  for (let y = -ry; y <= ry; y++) {
    const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))));
    ctx.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2, 1);
  }
};

export const hash = (n: number) => {
  const x = Math.sin(n * 91.7 + 17.3) * 43758.5453;
  return x - Math.floor(x);
};

/** The Painter (art/raster) moved over by (ox, oy): for painting a small figure in its own coordinates. */
export interface Local {
  form: (path: (g: Ctx) => void, o: FormOpts) => Uint8Array;
  stroke: (path: (g: Ctx) => void, w: number, o: FormOpts) => Uint8Array;
  px: (x: number, y: number, c: string, a?: number) => void;
  rect: (x: number, y: number, w: number, h: number, c: string, a?: number) => void;
  line: (x0: number, y0: number, x1: number, y1: number, c: string, a?: number) => void;
  disc: (cx: number, cy: number, rx: number, ry: number, c: string, a?: number) => void;
  painted: (x: number, y: number) => boolean;
}
export const local = (p: Painter, ox: number, oy: number): Local => ({
  form: (path, o) => p.form(g => { g.translate(ox, oy); path(g); }, o),
  stroke: (path, w, o) => p.form(p.strokeMask(g => { g.translate(ox, oy); path(g); }, w), o),
  px: (x, y, c, a) => p.px(x + ox, y + oy, c, a),
  rect: (x, y, w, h, c, a) => p.rect(x + ox, y + oy, w, h, c, a),
  line: (x0, y0, x1, y1, c, a) => p.line(x0 + ox, y0 + oy, x1 + ox, y1 + oy, c, a),
  disc: (cx, cy, rx, ry, c, a) => p.disc(cx + ox, cy + oy, rx, ry, c, a),
  painted: (x, y) => p.painted(Math.round(x + ox), Math.round(y + oy)),
});
/**
 * A small figure painted once, in its own coordinates (its anchor, usually between the feet, at 0, 0), and kept;
 * returned is how to put it down with its anchor at (x, y).
 */
export const figure = (key: string, w: number, h: number, ox: number, oy: number, paint: (q: Local) => void) => {
  // (painted the first time it's put down, not before: there's no canvas to paint on until then)
  return (ctx: Ctx, x: number, y: number) => ctx.drawImage(painting(key, w, h, p => paint(local(p, ox, oy))), Math.round(x) - ox, Math.round(y) - oy);
};

/**
 * Like `figure`, but painted over another figure (`base`, put down with its anchor on this one's): for a pose made of
 * a figure plus more of him, or a figure with a light caught round its edges.
 */
export const over = (key: string, w: number, h: number, ox: number, oy: number, base: (g: Ctx, x: number, y: number) => void, paint: (q: Local) => void) =>
  (ctx: Ctx, x: number, y: number) => ctx.drawImage(painting(key, w, h, p => paint(local(p, ox, oy)), g => base(g, ox, oy)), Math.round(x) - ox, Math.round(y) - oy);

/**
 * A light from behind: the pixel just inside the ink, down each side of whatever's painted, rows y0..y1 (`hot` down to
 * row `hotTo`, `dim` from row `dimFrom`).
 */
export const rimLight = (q: Local, x0: number, x1: number, y0: number, y1: number, col: string, hot: string, hotTo: number, dimFrom = Infinity, dim = col) => {
  for (let y = y0; y <= y1; y++) {
    const c = y <= hotTo ? hot : y >= dimFrom ? dim : col;
    for (let x = x0; x <= x1; x++) if (q.painted(x, y)) { if (q.painted(x + 1, y) && q.painted(x + 2, y)) q.px(x + 1, y, c); break; }
    for (let x = x1; x >= x0; x--) if (q.painted(x, y)) { if (q.painted(x - 1, y) && q.painted(x - 2, y)) q.px(x - 1, y, c); break; }
  }
};

/** The ink round the figures (a warm black). */
export const FIG_INK = '#120a10';
/** Jeans, belt, boots, the medal's ribbon: darkest to lightest. */
export const DENIM = ['#0a1230', '#121c4c', '#1a2c70', '#22408e', '#3456aa', '#5274c4', '#7a98dc'];
export const BELT = ['#2a1004', '#4a1e08', '#6c300c', '#8c4618', '#aa6028'];
export const BOOT = ['#060608', '#121216', '#202026', '#34343c', '#50505a'];
export const RIBBON = ['#00104c', '#002080', '#0838b8', '#2058e0', '#4880f8', '#88b0fc'];

/**
 * The press room's stage (112 down): red carpet, its nap dithered, lit in the middle under the stage lights and
 * falling off toward us; the curtain's shadow along the back of it.
 */
export const stageFloor = (ctx: Ctx) => {
  shaded(ctx, 'press-carpet', 0, 112, ART_W, 32, ['#280200', '#340400', '#460600', '#580800', '#6a0c00', '#7c1000', '#8e1a06'], (u, v) => {
    const x = Math.floor(u * ART_W), y = Math.floor(v * 32);
    return 0.86 - v * 0.6 - Math.abs(u - 0.5) * 0.35 + (hash2(x, y) - 0.5) * 0.22 - (y < 2 ? 0.35 : 0);
  });
};

/** Vertical folds of the blue press-room curtain. */
export const curtain = (ctx: Ctx, h: number) => {
  // (each fold round, lit from the upper left; the stage lights pooling down the middle, falling off to the sides and
  // down toward the floor)
  shaded(ctx, 'curtain', 0, 0, ART_W, h, RAMP.curtain, (u, v) => {
    const x = u * ART_W, fold = 0.5 + 0.5 * Math.sin((x / 14) * Math.PI * 2 - 0.6);
    const pool = Math.exp(-((u - 0.5) ** 2) / 0.09);
    return (0.18 + fold * 0.55) * (0.55 + 0.45 * pool) * (1.05 - v * 0.35);
  });
  // (the hem of each fold catching a sharper light)
  for (let x = 4; x < ART_W; x += 14) R(ctx, x, 0, 1, h, 'rgba(160, 200, 255, 0.18)');
};

/** A US flag hanging from a pole: the gold pole and its ball, the stripes falling in folds, lit and shaded. */
export const hangingFlag = (ctx: Ctx, x: number, top: number) => flagFig(ctx, x, top);
const flagFig = figure('hanging-flag', 24, 90, 2, 10, q => {
  const I = FIG_INK, W = ['#8c8c9c', '#b4b4c0', '#d8d8e0', '#fcfcfc'], Rd = RAMP.red, Nv = RAMP.navy;
  q.form(g => { g.rect(0, -6, 2, 76); }, { ramp: RAMP.gold, bevel: 1, amb: 0.3, ink: null });
  q.form(g => { g.arc(1, -7, 2.5, 0, Math.PI * 2); }, { ramp: RAMP.gold, bevel: 2, ink: '#5c3c00', spec: '#fffff0', wet: 0.8 });
  // (the cloth: three folds across it, each lit on its left, the light falling off down it)
  const fold = (x: number) => 0.55 + 0.45 * Math.cos(((x - 2) / 16) * Math.PI * 3 - 0.5);
  for (let x = 2; x < 18; x++) for (let y = 0; y < 39; y++) {
    const l = fold(x) - y * 0.004 + (bayer(x, y) * 0.25);
    const canton = x < 10 && y < 21;
    const ramp = canton ? Nv.slice(1, 5) : Math.floor(y / 3) % 2 === 0 ? Rd.slice(1, 5) : W;
    q.px(x, y, ramp[Math.max(0, Math.min(ramp.length - 1, Math.round(l * (ramp.length - 1))))]);
  }
  for (let i = 0; i < 9; i++) q.px(3 + (i % 3) * 2 + (Math.floor(i / 3) % 2), 2 + Math.floor(i / 3) * 6, '#fcfcfc');
  for (let y = 0; y < 39; y++) { q.px(18, y, I); }
  for (let x = 2; x < 19; x++) q.px(x, 39 + (x % 3 === 0 ? 1 : 0), I);
  // (the fringe along its bottom)
  for (let x = 2; x < 18; x += 2) q.px(x, 40 + (x % 3 === 0 ? 1 : 0), RAMP.gold[3]);
});

/** The oval White House sign above the podium: a gold rim, the navy field, the White House on it in white. */
export const whSign = (ctx: Ctx, cx: number, cy: number) => signFig(ctx, cx, cy);
const signFig = figure('wh-sign', 66, 30, 33, 15, q => {
  const I = FIG_INK;
  q.form(g => { g.ellipse(0, 0, 30.5, 12.5, 0, 0, Math.PI * 2); }, { ramp: RAMP.gold, bevel: 3, amb: 0.2, ink: I, spec: '#fffff0', wet: 0.5 });
  q.form(g => { g.ellipse(0, 0, 27.5, 9.5, 0, 0, Math.PI * 2); }, { ramp: RAMP.navy, bevel: 4, amb: 0.4, ink: '#5c3c00' });
  // The White House: the wings, the portico and its columns, the pediment, the flag
  const Wt = ['#7c7c90', '#a8a8bc', '#d4d4e0', '#fcfcfc'];
  q.form(g => { g.rect(-13, -1, 26, 6); }, { ramp: Wt, bevel: 1.5, amb: 0.3, ink: null });
  for (let x = -12; x < 13; x += 3) if (Math.abs(x) > 5) { q.px(x, 1, '#e0c070'); q.px(x, 3, '#e0c070'); }
  q.form(g => { g.moveTo(-6, -1); g.lineTo(0, -5); g.lineTo(6, -1); g.closePath(); }, { ramp: Wt, bevel: 1, amb: 0.3, ink: null });
  for (let k = 0; k < 5; k++) q.line(-4 + k * 2, 0, -4 + k * 2, 4, Wt[1]);
  q.line(0, -8, 0, -5, Wt[2]); q.px(1, -8, '#d82800'); q.px(2, -8, '#d82800');
  q.line(-14, 5, 13, 5, Wt[0]);
});

export const podium = (ctx: Ctx, cx: number, top: number, tilt = 0) => podiumFig(tilt)(ctx, cx, top);

/**
 * The podium, painted once (per how far the punch knocked the mics over): the lid overhanging, the panels down the
 * front in their frames, the wood's grain, the Presidential seal (the eagle on it), the two mics on goosenecks.
 */
const podiumFigs = new Map<number, (ctx: Ctx, x: number, y: number) => void>();
const podiumFig = (tilt: number) => {
  let f = podiumFigs.get(tilt);
  if (!f) {
    f = figure(`podium-${tilt}`, 52, 66, 26, 16, q => {
      const W = RAMP.wood, I = FIG_INK;
      // The body: the front face, its panel, the grain
      q.form(g => { g.rect(-20, 4, 40, 44); }, { ramp: W, bevel: 7, amb: 0.2, ink: I });
      q.rect(-15, 9, 30, 1, W[1]); q.rect(-15, 9, 1, 36, W[1]); q.rect(-15, 45, 30, 1, W[5]); q.rect(14, 9, 1, 37, W[5]);
      for (let k = 0; k < 7; k++) for (let x = -14; x < 14; x++) if ((x * 3 + k * 5) % 11 < 6) q.px(x, 13 + k * 5 + Math.round(Math.sin(x * 0.3 + k) * 1), W[2], 0.6);
      // The lid, overhanging
      q.form(g => { g.rect(-23, 0, 46, 5); }, { ramp: W, bevel: 2, amb: 0.3, ink: I, gain: 1.15 });
      q.line(-22, 1, 21, 1, W[5]);
      // The seal: the gold rim, the navy, the eagle with its wings out, the shield on its chest
      q.form(g => { g.arc(0, 20, 9, 0, Math.PI * 2); }, { ramp: RAMP.gold, bevel: 3, ink: I, spec: '#fffff0', wet: 0.6 });
      q.form(g => { g.arc(0, 20, 6.5, 0, Math.PI * 2); }, { ramp: RAMP.navy, bevel: 3, amb: 0.4, ink: '#5c3c00' });
      const E = RAMP.gold[4];
      q.line(-5, 18, -1, 20, E); q.line(-5, 19, -1, 21, RAMP.gold[3]); q.line(5, 18, 1, 20, E); q.line(5, 19, 1, 21, RAMP.gold[3]);
      q.rect(-1, 17, 2, 6, E); q.px(0, 16, '#fcfcfc'); q.rect(-1, 20, 2, 2, '#d82800'); q.px(-2, 23, E); q.px(1, 23, E);
      // The mics on their goosenecks (knocked askew by the punch)
      for (const side of [-1, 1]) {
        const mx = side * 5;
        for (let i = 0; i < 10; i++) q.px(mx + Math.round(side * i * tilt * 0.4), -i, i % 3 ? '#3c3c44' : '#5a5a66');
        const hx = mx + Math.round(side * 10 * tilt * 0.4);
        q.form(g => { g.roundRect(hx - 1.5, -13.5, 3, 4, 1); }, { ramp: ['#0a0a0c', '#1c1c20', '#3a3a40', '#6a6a74'], bevel: 1.5, ink: I });
      }
    });
    podiumFigs.set(tilt, f);
  }
  return f;
};

/** The press pack in the foreground, their backs to us: heads, shoulders, cameras held up (with flashes going off). */
export const reporters = (ctx: Ctx, t: number, frenzy: number) => {
  ctx.drawImage(pressPack(), 0, 0);
  const flashes: [number, number][] = [];
  for (let i = 1; i < 12; i += 2) {
    const x = 6 + i * 21 + Math.round(hash(i) * 6), y = 124 + Math.round(hash(i + 20) * 6);
    // Flash (more of them in a frenzy)
    const rate = frenzy > 0 ? 3 : 9;
    if (Math.floor(t / 4 + hash(i) * 50) % rate === 0) flashes.push([x + 8, y - 9]);
  }
  for (const [fx, fy] of flashes) {
    R(ctx, fx - 1, fy - 5, 2, 12, C.white);
    R(ctx, fx - 6, fy, 12, 2, C.white);
    R(ctx, fx - 3, fy - 2, 6, 6, C.white);
  }
};

/**
 * The pack, painted once: the backs of their heads (the stage lights catching the tops of them and the rims of their
 * ears), the collars and coats; every other one a camera up at the side of the head, the flashgun on top.
 */
const pressPack = () => painting('press-pack', ART_W, ART_H, p => {
  const I = FIG_INK;
  const coats = [['#141418', '#24242a', '#36363e', '#4a4a54', '#5e5e6a'], RAMP.navy.slice(1), ['#2a1404', '#3e2008', '#54300e', '#6c4218', '#845628'], ['#06060a', '#0e0e14', '#18181f', '#26262f', '#383844']];
  const hairs = [['#1e0e02', '#3a2008', '#503000', '#6c4818'], ['#040404', '#0e0e10', '#1c1c20', '#34343a'], ['#505054', '#7c7c80', '#a0a0a4', '#c8c8cc'], ['#6a4410', '#94661e', '#c89040', '#e4b868'], ['#040404', '#0e0e10', '#1c1c20', '#34343a']];
  const skin = ['#5a2c14', '#8a4a24', '#b46a3a', '#d48c58', '#ecb07c'];
  for (let i = 0; i < 12; i++) {
    const x = 6 + i * 21 + Math.round(hash(i) * 6), y = 124 + Math.round(hash(i + 20) * 6);
    const coat = coats[i % 4], hair = hairs[i % 5], bald = i % 7 === 3, bun = i % 5 === 3;
    // Coat and shoulders, the collar
    p.form(g => { g.moveTo(x - 12, 150); g.lineTo(x - 12, y + 14); g.bezierCurveTo(x - 12, y + 9, x - 7, y + 7, x, y + 7); g.bezierCurveTo(x + 7, y + 7, x + 12, y + 9, x + 12, y + 14); g.lineTo(x + 12, 150); g.closePath(); },
      { ramp: coat, bevel: 6, amb: 0.12, ink: I });
    p.line(x - 10, y + 10, x - 4, y + 8, coat[4]); p.line(x + 4, y + 8, x + 10, y + 10, coat[3]);
    p.line(x, y + 9, x, y + 28, coat[0]);
    // The neck, the shirt collar round it
    p.form(g => { g.rect(x - 3, y + 3, 6, 6); }, { ramp: skin, bevel: 2, amb: 0.1, ink: I });
    p.rect(x - 4, y + 7, 8, 2, '#d8d8e0'); p.rect(x - 4, y + 7, 8, 1, '#fcfcfc');
    // The ears, their rims lit
    for (const s of [-1, 1]) { p.form(g => { g.ellipse(x + s * 7, y, 2, 3, 0, 0, Math.PI * 2); }, { ramp: skin, bevel: 1.5, amb: 0.2, ink: I }); p.px(x + s * 7, y - 2, skin[4]); }
    // The back of the head: hair (or a bald crown with a fringe round it, or a bun)
    if (bald) {
      p.form(g => { g.ellipse(x, y - 1, 7, 8, 0, 0, Math.PI * 2); }, { ramp: skin, bevel: 5, amb: 0.15, ink: I });
      p.form(g => { g.moveTo(x - 7, y + 1); g.quadraticCurveTo(x, y + 9, x + 7, y + 1); g.lineTo(x + 6, y + 5); g.quadraticCurveTo(x, y + 9, x - 6, y + 5); g.closePath(); }, { ramp: hairs[2], bevel: 1.5, amb: 0.3, ink: I });
      p.rect(x - 2, y - 8, 4, 1, '#fde0c0');
    } else {
      p.form(g => { g.moveTo(x - 7, y + 4); g.bezierCurveTo(x - 9, y - 6, x - 5, y - 10, x, y - 10); g.bezierCurveTo(x + 5, y - 10, x + 9, y - 6, x + 7, y + 4); g.quadraticCurveTo(x, y + 6, x - 7, y + 4); g.closePath(); },
        { ramp: hair, bevel: 4, amb: 0.15, ink: I });
      for (let k = -4; k <= 4; k += 2) p.line(x + k, y - 6, x + k + (k < 0 ? -1 : 1), y + 3, hair[0]);
      if (bun) p.form(g => { g.arc(x, y - 8, 3.5, 0, Math.PI * 2); }, { ramp: hair, bevel: 2, amb: 0.2, ink: I });
    }
    // (the stage lights catching the top of the head)
    for (let k = -4; k <= 4; k++) { const yy = y - 9 - (bun ? 3 : 0) + Math.round((k / 5) ** 2 * 3); p.px(x + k, yy, bald ? '#fde0c0' : hair[3]); }
    // Every other one a camera, up at the side of the head, held in a hand, the flashgun on top
    if (i % 2 === 1) {
      p.form(g => { g.moveTo(x + 10, y + 12); g.lineTo(x + 13, y + 12); g.lineTo(x + 12, y + 1); g.lineTo(x + 9, y + 1); g.closePath(); }, { ramp: coat, bevel: 1.5, amb: 0.2, ink: I });
      p.form(g => { g.roundRect(x + 3, y - 5, 12, 8, 1); }, { ramp: ['#0a0a0c', '#1c1c20', '#303036', '#4a4a52'], bevel: 2, ink: I });
      p.line(x + 4, y - 4, x + 13, y - 4, '#5a5a66');
      p.form(g => { g.rect(x + 6, y - 9, 5, 4); }, { ramp: ['#1c1c20', '#303036', '#5a5a66', '#8a8a96'], bevel: 1, ink: I });
      p.rect(x + 7, y - 8, 3, 1, '#e8e8f0');
      p.form(g => { g.ellipse(x + 13, y + 1, 2.5, 2.5, 0, 0, Math.PI * 2); }, { ramp: skin, bevel: 2, amb: 0.2, ink: I });
    }
  }
});

// ---------------------------------------------------------------------------
// Characters (small, for the wide shots)
// ---------------------------------------------------------------------------

/** Trump's upper body behind the podium: head centred on (cx, top). */
export const trumpSmall = (ctx: Ctx, cx: number, top: number, t: number, talking: boolean) => {
  trumpSmallFig(ctx, cx, top);
  // The mouth: the pucker, flapping open while he talks
  if (talking && t % 12 < 6) { R(ctx, cx - 2, top + 10, 4, 3, '#3a0606'); R(ctx, cx - 2, top + 10, 4, 1, '#f4ecdc'); R(ctx, cx - 2, top + 13, 4, 1, '#b02c20'); }
  else { R(ctx, cx - 2, top + 11, 4, 2, '#b02c20'); R(ctx, cx - 1, top + 11, 2, 1, '#500000'); }
};

/**
 * The President, small, behind the podium: the suit over the gut, the shirt, the long red tie, the flag pin; the head,
 * the tan with the pale goggles round the squint, the jowls, the swoop of hair up and over and lacquered.
 */
const trumpSmallFig = figure('trump-small', 40, 44, 20, 8, q => {
  const T = RAMP.tSkin, Hh = RAMP.tHair, N = RAMP.navy, I = FIG_INK;
  q.form(g => { g.moveTo(-17, 34); g.bezierCurveTo(-17, 20, -12, 15, -5, 14); g.lineTo(5, 14); g.bezierCurveTo(12, 15, 17, 20, 17, 34); g.closePath(); }, { ramp: N, bevel: 6, amb: 0.16, ink: I });
  q.form(g => { g.moveTo(-5, 14); g.lineTo(5, 14); g.lineTo(2, 24); g.lineTo(-2, 24); g.closePath(); }, { ramp: RAMP.shirt, bevel: 2, amb: 0.3, ink: I });
  q.form(g => { g.moveTo(-1.5, 15); g.lineTo(1.5, 15); g.lineTo(2.5, 30); g.lineTo(0, 33); g.lineTo(-2.5, 30); g.closePath(); }, { ramp: RAMP.red, bevel: 1.5, amb: 0.2, ink: I });
  for (const s of [-1, 1]) q.line(s * 5, 14, s * 3, 24, N[0]);
  q.rect(-9, 18, 2, 2, '#fcfcfc'); q.px(-9, 18, '#1c1c5c'); q.px(-8, 19, '#d82800');
  // (the arms, down to the podium)
  for (const s of [-1, 1]) q.line(s * 13, 20, s * 14, 34, N[s < 0 ? 1 : 0]);
  // The head: the jowls wider than the brow, the ears
  for (const s of [-1, 1]) q.form(g => { g.ellipse(s * 7.5, 7, 1.8, 3, 0, 0, Math.PI * 2); }, { ramp: T, bevel: 1.5, amb: 0.2, ink: I });
  q.form(g => { g.moveTo(-6, 0); g.bezierCurveTo(-6, -2, 6, -2, 6, 0); g.lineTo(7, 9); g.bezierCurveTo(8, 14, 4, 16, 0, 16); g.bezierCurveTo(-4, 16, -8, 14, -7, 9); g.closePath(); },
    { ramp: T, bevel: 5, amb: 0.2, ink: I, inkIn: T[1] });
  // (the pale goggles, the squint in them, the brows; the nose; the flush; the jowls' crease)
  for (const s of [-1, 1]) { q.rect(s < 0 ? -5 : 1, 4, 4, 3, '#fdd8b0'); q.line(s < 0 ? -5 : 1, 5, s < 0 ? -2 : 4, 5, I); q.px(s < 0 ? -4 : 2, 5, '#f4ecdc'); q.line(s < 0 ? -5 : 1, 3, s < 0 ? -2 : 4, 3, Hh[3]); }
  q.px(0, 6, T[6]); q.px(0, 7, T[5]); q.px(0, 8, T[2]); q.px(1, 8, T[2]);
  q.px(-5, 9, '#f05a2c'); q.px(5, 9, '#f05a2c');
  q.line(-6, 13, -4, 15, T[1]); q.line(6, 13, 4, 15, T[1]);
  // The swoop: up off the back of his head, over the top, the front curling down over his brow, swept off to the right
  q.form(g => { g.moveTo(-8, 4); g.bezierCurveTo(-10, -4, -4, -7, 2, -6); g.bezierCurveTo(8, -6, 11, -3, 10, 2); g.lineTo(8, 5); g.lineTo(7, 1); g.bezierCurveTo(3, 0, -2, -1, -6, 3); g.closePath(); },
    { ramp: Hh, bevel: 3, amb: 0.25, ink: '#5a3a04', spec: '#fffef0', wet: 0.7 });
  q.line(-5, -4, 4, -5, Hh[5]); q.line(-6, 0, 5, -2, Hh[2]);
});

/** Meathead full-body, standing (feet at baseY). `arms`: which of the hanging arms to draw (the picture's left and right). */
export const meatheadStanding = (ctx: Ctx, cx: number, baseY: number, withMedal: boolean, arms: { l?: boolean; r?: boolean } = {}) => {
  const armL = arms.l !== false, armR = arms.r !== false;
  mhStandingFig(withMedal, armL, armR)(ctx, cx, baseY);
  // (shit himself: it shows)
  if (shatPants()) shatFront(ctx, cx, baseY);
};

/** The flat-top on a small head: dead flat on top and lit, square at the sides, the bristles. */
const smallFlatTop = (q: Local, x0: number, x1: number, top: number, bottom: number) => {
  q.form(g => { g.rect(x0, top, x1 - x0, bottom - top); }, { ramp: RAMP.mHair, bevel: 2, amb: 0.3, ink: FIG_INK, gain: 1.2 });
  for (let x = x0 + 1; x < x1 - 1; x++) { q.px(x, top + 1, x < (x0 + x1) / 2 ? '#5a5a68' : '#44444e'); if ((x & 1) === 0) q.line(x, top + 3, x, bottom - 2, '#2a2a32'); }
};

/** Boots (a pair of them) and jeans, front on: legs from `hip` down to the floor (0). */
const smallLegs = (q: Local) => {
  for (const s of [-1, 1]) {
    q.form(g => { g.moveTo(s * 1, -26); g.lineTo(s * 9, -26); g.lineTo(s * 9, -5); g.lineTo(s * 1.5, -5); g.closePath(); }, { ramp: DENIM, bevel: 3, amb: s < 0 ? 0.2 : 0.1, ink: FIG_INK, inkIn: DENIM[0] });
    // (the seam down the outside, the crease at the knee, the hem stacked on the boot)
    q.line(s * 7, -24, s * 7, -6, DENIM[2]); q.line(s * 3, -15, s * 6, -14, DENIM[1]); q.line(s * 2, -6, s * 8, -6, DENIM[1]);
    q.form(g => { g.moveTo(s * 1, -5); g.lineTo(s * 9, -5); g.lineTo(s * 10.5, -2); g.lineTo(s * 10.5, 0); g.lineTo(s * 0.5, 0); g.closePath(); }, { ramp: BOOT, bevel: 2, amb: 0.2, ink: FIG_INK });
    q.line(s * 2, -4, s * 8, -4, BOOT[4]); q.px(s * 9, -2, '#94a3b8');
  }
  // The belt and the buckle
  q.form(g => { g.rect(-10, -29, 20, 4); }, { ramp: BELT, bevel: 1.5, amb: 0.3, ink: FIG_INK });
  q.form(g => { g.rect(-2.5, -29.5, 5, 5); }, { ramp: RAMP.gold, bevel: 2, ink: '#5c3c00' });
};

/**
 * Meathead standing, front on, small (for the wide shots): boots, jeans, the belt; the torso a V, the pecs lit across
 * the top and shadowed under, the abs; the arms hanging off the delts, huge, the wristbands; a neck like a stump; the
 * square head, flat-top, brows, the eyes, the nose, the mouth, stubble; the medal on its ribbon.
 */
export const mhStandingFig = (medal: boolean, armL: boolean, armR: boolean) => figure(`mh-stand-${medal ? 1 : 0}${armL ? 1 : 0}${armR ? 1 : 0}`, 48, 74, 24, 72, q => {
  const S = RAMP.mSkin, I = FIG_INK;
  smallLegs(q);
  // The arms: off the delts, hanging, the forearms out a bit (too big to hang straight), the fists, the wristbands
  for (const [s, on] of [[-1, armL], [1, armR]] as const) {
    if (!on) continue;
    q.form(g => { g.moveTo(s * 13, -50); g.bezierCurveTo(s * 20, -50, s * 21, -44, s * 20, -38); g.lineTo(s * 19.5, -31); g.lineTo(s * 13.5, -31); g.lineTo(s * 13, -42); g.closePath(); },
      { ramp: S, bevel: 4, amb: s < 0 ? 0.2 : 0.08, ink: I, inkIn: S[1] });
    q.line(s * 14, -42, s * 19, -41, S[2]); q.px(s * 18, -46, S[s < 0 ? 6 : 4]); q.px(s * 17, -47, S[s < 0 ? 6 : 4]);
    q.form(g => { g.rect(s < 0 ? -20 : 13, -33, 7, 3); }, { ramp: BOOT, bevel: 1, amb: 0.3, ink: I });
    q.form(g => { g.ellipse(s * 16.5, -28, 3.8, 3.5, 0, 0, Math.PI * 2); }, { ramp: S, bevel: 2.5, amb: s < 0 ? 0.2 : 0.1, ink: I });
    q.line(s * 15, -27, s * 18, -27, S[2]);
  }
  // The torso: the traps up into the neck, the shoulders, the lats, down to the waist
  q.form(g => { g.moveTo(-4, -53); g.lineTo(4, -53); g.lineTo(14, -50); g.bezierCurveTo(16, -47, 14, -42, 13, -40); g.lineTo(9.5, -29); g.lineTo(-9.5, -29); g.lineTo(-13, -40); g.bezierCurveTo(-14, -42, -16, -47, -14, -50); g.closePath(); },
    { ramp: S, bevel: 6, amb: 0.14, ink: I, inkIn: S[1] });
  // (the pecs, lit across the top and shadowed under; the split; the abs)
  for (const s of [-1, 1]) {
    q.line(s * 1, -48, s * 10, -48, S[s < 0 ? 7 : 5]);
    q.line(s * 1, -41, s * 10, -42, S[2]); q.line(s * 2, -40, s * 9, -41, S[3]);
    for (const y of [-38, -35, -32]) { q.px(s * 2, y, S[s < 0 ? 6 : 5]); q.px(s * 3, y, S[s < 0 ? 6 : 5]); q.px(s * 4, y + 1, S[3]); }
  }
  q.line(0, -48, 0, -30, S[2]); q.line(-4, -36, 4, -36, S[3]); q.line(-4, -33, 4, -33, S[3]);
  // (the delts, capped round)
  for (const s of [-1, 1]) q.form(g => { g.ellipse(s * 13, -48, 3.5, 3, 0, 0, Math.PI * 2); }, { ramp: S, bevel: 2, amb: s < 0 ? 0.25 : 0.1, ink: null });
  if (medal) {
    // The ribbon round his neck down to the medal on his chest
    for (let k = 0; k < 7; k++) { q.px(-4 + k * 0.5, -51 + k, RIBBON[3]); q.px(-5 + k * 0.5, -51 + k, RIBBON[2]); q.px(4 - k * 0.5, -51 + k, RIBBON[2]); q.px(5 - k * 0.5, -51 + k, RIBBON[1]); }
    q.form(g => { g.arc(0, -42, 2.6, 0, Math.PI * 2); }, { ramp: RAMP.gold, bevel: 2, ink: '#5c3c00', spec: '#fffff0', wet: 0.8 });
    q.px(0, -42, '#ffffff');
  }
  // The neck, the head, the ears
  q.form(g => { g.rect(-4, -53, 8, 4); }, { ramp: S, bevel: 2, amb: 0.1, ink: null });
  q.line(-4, -52, 3, -52, S[2]);
  for (const s of [-1, 1]) q.form(g => { g.rect(s < 0 ? -8 : 6, -59, 2, 4); }, { ramp: S, bevel: 1, amb: 0.2, ink: I });
  q.form(g => { g.moveTo(-6, -62); g.lineTo(6, -62); g.lineTo(6, -54); g.lineTo(4, -50); g.lineTo(-4, -50); g.lineTo(-6, -54); g.closePath(); }, { ramp: S, bevel: 3, amb: 0.2, ink: I });
  smallFlatTop(q, -7, 7, -67, -61);
  // The face: brows, the eyes, the nose lit down its left, the mouth, stubble on the jaw
  q.line(-5, -60, -2, -60, I); q.line(1, -60, 4, -60, I);
  q.px(-4, -58, '#f4ece0'); q.px(-3, -58, I); q.px(2, -58, I); q.px(3, -58, '#f4ece0');
  q.px(-1, -57, S[6]); q.px(-1, -56, S[6]); q.px(0, -56, S[3]); q.px(-1, -55, S[3]); q.px(0, -55, S[2]);
  q.line(-2, -53, 2, -53, '#7a1e10');
  for (const [x, y] of [[-5, -53], [-4, -51], [-2, -51], [1, -51], [3, -51], [4, -53], [-5, -55], [5, -55]]) q.px(x, y, '#8c5c30');
});

/** Meathead mid-follow-through after the punch, facing right. */
export const meatheadPunched = (ctx: Ctx, cx: number, baseY: number) => {
  mhPunchedFig(ctx, cx, baseY);
  if (shatPants()) shatSide(ctx, cx - 4, baseY, 1);
};

/**
 * Meathead lunged into the follow-through, facing right: the back leg out straight behind, the front one bent, the
 * torso twisted into it, his right fist pulled back to his ribs, his left arm (he's a lefty) out straight with the
 * fist on the end of it, his face yelling, the medal swung out.
 */
const mhPunchedFig = figure('mh-punched', 80, 76, 28, 72, q => {
  const S = RAMP.mSkin, I = FIG_INK;
  // The back arm (his right, the far side): bent, the fist pulled back to his ribs
  q.form(g => { g.moveTo(-12, -48); g.bezierCurveTo(-18, -46, -18, -38, -14, -36); g.lineTo(-4, -38); g.lineTo(-4, -43); g.lineTo(-10, -42); g.closePath(); }, { ramp: S, bevel: 3, amb: 0.06, ink: I, gain: 0.8 });
  q.form(g => { g.ellipse(-3, -40, 3.5, 3.5, 0, 0, Math.PI * 2); }, { ramp: S, bevel: 2, amb: 0.06, ink: I, gain: 0.8 });
  // The legs: the back one out straight behind, the front one bent, the boots
  q.form(g => { g.moveTo(-8, -27); g.lineTo(-1, -26); g.lineTo(-14, -6); g.lineTo(-21, -4); g.lineTo(-20, -8); g.closePath(); }, { ramp: DENIM, bevel: 3, amb: 0.08, ink: I, inkIn: DENIM[0] });
  q.form(g => { g.moveTo(-23, -6); g.lineTo(-15, -6); g.lineTo(-13, 0); g.lineTo(-25, 0); g.closePath(); }, { ramp: BOOT, bevel: 2, amb: 0.2, ink: I });
  q.form(g => { g.moveTo(1, -27); g.lineTo(10, -27); g.lineTo(14, -16); g.lineTo(13, -5); g.lineTo(6, -5); g.lineTo(7, -15); g.lineTo(2, -20); g.closePath(); }, { ramp: DENIM, bevel: 3, amb: 0.2, ink: I, inkIn: DENIM[0] });
  q.line(7, -15, 12, -17, DENIM[1]); q.line(9, -25, 13, -16, DENIM[4]);
  q.form(g => { g.moveTo(5, -5); g.lineTo(13, -5); g.lineTo(18, -2); g.lineTo(18, 0); g.lineTo(5, 0); g.closePath(); }, { ramp: BOOT, bevel: 2, amb: 0.2, ink: I });
  q.line(7, -4, 16, -3, BOOT[4]);
  q.form(g => { g.moveTo(-10, -30); g.lineTo(10, -29); g.lineTo(10, -25); g.lineTo(-10, -26); g.closePath(); }, { ramp: BELT, bevel: 1.5, amb: 0.3, ink: I });
  q.form(g => { g.rect(-2, -30, 5, 5); }, { ramp: RAMP.gold, bevel: 2, ink: '#5c3c00' });
  // The torso, twisted into the punch: the back to the left, the chest to the right
  q.form(g => { g.moveTo(-6, -53); g.lineTo(6, -53); g.lineTo(16, -50); g.bezierCurveTo(18, -46, 15, -41, 13, -39); g.lineTo(10, -30); g.lineTo(-9, -30); g.lineTo(-12, -40); g.bezierCurveTo(-13, -44, -12, -49, -10, -51); g.closePath(); },
    { ramp: S, bevel: 6, amb: 0.14, ink: I, inkIn: S[1] });
  q.line(2, -48, 13, -48, S[6]); q.line(2, -41, 13, -42, S[2]); q.line(3, -40, 12, -41, S[3]);
  q.line(4, -47, 4, -31, S[3]); q.line(5, -36, 11, -36, S[3]); q.line(5, -33, 11, -33, S[3]);
  q.line(-9, -46, -8, -33, S[2]);
  // The punching arm, his left, out straight from the shoulder: the delt, the bicep and tricep, the forearm, the wristband, the fist
  q.form(g => { g.moveTo(10, -52); g.bezierCurveTo(18, -55, 28, -53, 36, -51); g.lineTo(37, -44); g.bezierCurveTo(28, -42, 18, -42, 11, -44); g.closePath(); }, { ramp: S, bevel: 4, amb: 0.2, ink: I, inkIn: S[1] });
  q.form(g => { g.ellipse(13, -49, 5, 4.5, 0, 0, Math.PI * 2); }, { ramp: S, bevel: 3, amb: 0.2, ink: null });
  q.line(18, -54, 26, -54, S[6]); q.line(24, -47, 26, -44, S[2]); q.line(18, -44, 30, -44, S[2]);
  q.form(g => { g.rect(35, -52, 4, 9); }, { ramp: BOOT, bevel: 1.5, amb: 0.3, ink: I });
  q.form(g => { g.roundRect(39, -53, 9, 11, 2); }, { ramp: S, bevel: 3, amb: 0.2, ink: I });
  for (let k = 0; k < 3; k++) q.px(46, -51 + k * 3, S[2]);
  q.line(40, -45, 45, -45, S[3]); q.px(47, -53, S[7]);
  // The medal, swung out on its ribbon
  for (let k = 0; k < 6; k++) q.px(3 + k * 0.7, -51 + k, RIBBON[3]);
  q.form(g => { g.arc(7, -44, 2.6, 0, Math.PI * 2); }, { ramp: RAMP.gold, bevel: 2, ink: '#5c3c00', spec: '#fffff0', wet: 0.8 });
  // The head, turned to the right: the neck, the jaw, the ear, the flat-top; the brow down, the eye, the nose out, yelling
  q.form(g => { g.rect(-1, -54, 8, 4); }, { ramp: S, bevel: 2, amb: 0.1, ink: null });
  q.form(g => { g.moveTo(-3, -62); g.lineTo(9, -62); g.lineTo(10, -57); g.lineTo(11, -55); g.lineTo(9, -54); g.lineTo(9, -50); g.lineTo(-1, -50); g.lineTo(-3, -54); g.closePath(); }, { ramp: S, bevel: 3, amb: 0.2, ink: I });
  q.form(g => { g.rect(-2, -59, 2, 4); }, { ramp: S, bevel: 1, amb: 0.2, ink: I });
  smallFlatTop(q, -4, 10, -67, -61);
  q.line(3, -60, 8, -59, I); q.px(6, -58, '#f4ece0'); q.px(7, -58, I);
  q.px(10, -57, S[6]);
  q.rect(5, -54, 4, 3, '#3a0606'); q.line(5, -54, 8, -54, '#f4ecdc');
  for (const [x, y] of [[1, -52], [3, -51], [-1, -53], [6, -50]]) q.px(x, y, '#8c5c30');
});

/** Trump sailing across the room head-first, limbs trailing, hair and tie flapping. */
export const trumpFlying = (ctx: Ctx, cx: number, cy: number, t: number) => {
  const flap = t % 6 < 3 ? 1 : -1;
  (flap > 0 ? trumpFlyFigA : trumpFlyFigB)(ctx, cx, cy);
  // Speed lines behind him
  for (let i = 0; i < 6; i++) R(ctx, cx - 48 - hash(i) * 8, cy - 14 + i * 6, 8 + hash(i + 5) * 10, 1, C.white);
  // Sweat and a tooth flying off
  R(ctx, cx + 26, cy - 10, 2, 2, C.white); R(ctx, cx + 27, cy - 9, 1, 1, '#8ab0d0');
  R(ctx, cx + 29, cy - 5, 4, 5, FIG_INK); R(ctx, cx + 30, cy - 4, 2, 3, '#fcf8e8');
};

/**
 * The President flying (two frames of it, his limbs flapping): face down, head first, the shoes trailing, the jacket
 * flapping up off his back, the gut, the tie blown back over his shoulder, one arm flung up and one down, the head
 * dazed (X eyes, the mouth open), the swoop blown back off it.
 */
const trumpFly = (flap: number) => figure(`trump-fly-${flap}`, 90, 60, 54, 30, q => {
  const T = RAMP.tSkin, Hh = RAMP.tHair, N = RAMP.navy, I = FIG_INK;
  // The legs trailing behind, the shoes
  q.form(g => { g.moveTo(-22, -5); g.lineTo(-38, -3 + flap); g.lineTo(-38, 3 + flap); g.lineTo(-22, 3); g.closePath(); }, { ramp: N, bevel: 2.5, amb: 0.2, ink: I });
  q.form(g => { g.moveTo(-22, 3); g.lineTo(-36, 5 - flap); g.lineTo(-36, 11 - flap); g.lineTo(-22, 10); g.closePath(); }, { ramp: N, bevel: 2.5, amb: 0.08, ink: I });
  q.form(g => { g.roundRect(-44, -4 + flap, 7, 8, 2); }, { ramp: BOOT, bevel: 2, amb: 0.2, ink: I });
  q.form(g => { g.roundRect(-42, 4 - flap, 7, 8, 2); }, { ramp: BOOT, bevel: 2, amb: 0.2, ink: I });
  // The far arm, down
  q.form(g => { g.moveTo(1, 8); g.lineTo(6, 8); g.lineTo(6 + flap, 20); g.lineTo(2 + flap, 20); g.closePath(); }, { ramp: N, bevel: 2, amb: 0.05, ink: I });
  q.form(g => { g.ellipse(4 + flap, 22, 2.5, 2.5, 0, 0, Math.PI * 2); }, { ramp: T, bevel: 2, amb: 0.1, ink: I });
  // The body: the jacket over his back, the gut under it, the shirt
  q.form(g => { g.moveTo(-23, -6); g.bezierCurveTo(-12, -9, 2, -8, 9, -5); g.lineTo(9, 7); g.bezierCurveTo(2, 15, -12, 16, -23, 11); g.closePath(); }, { ramp: N, bevel: 6, amb: 0.14, ink: I });
  q.form(g => { g.moveTo(-14, 10); g.bezierCurveTo(-6, 16, 4, 14, 8, 7); g.lineTo(8, 4); g.bezierCurveTo(2, 10, -6, 11, -14, 10); g.closePath(); }, { ramp: RAMP.shirt, bevel: 2, amb: 0.3, ink: I });
  q.line(-20, -4, 4, -6, N[5]);
  // (the jacket's tails flapping up off his backside)
  q.form(g => { g.moveTo(-23, -6); g.lineTo(-30, -11 - flap); g.lineTo(-27, -4); g.closePath(); }, { ramp: N, bevel: 1.5, amb: 0.2, ink: I });
  // The tie, blown back over his shoulder
  q.form(g => { g.moveTo(6, -6); g.lineTo(-14, -11 - flap); g.lineTo(-15, -8 - flap); g.lineTo(5, -3); g.closePath(); }, { ramp: RAMP.red, bevel: 1.5, amb: 0.2, ink: I });
  // The near arm, flung up
  q.form(g => { g.moveTo(-6, -4); g.lineTo(-1, -4); g.lineTo(-3, -15 + flap * 2); g.lineTo(-7, -15 + flap * 2); g.closePath(); }, { ramp: N, bevel: 2, amb: 0.2, ink: I });
  q.form(g => { g.ellipse(-5, -18 + flap * 2, 2.5, 2.5, 0, 0, Math.PI * 2); }, { ramp: T, bevel: 2, amb: 0.2, ink: I });
  // The head, leading: the jowls flapping, the X eyes, the mouth open
  q.form(g => { g.ellipse(16, 1, 8, 8, 0, 0, Math.PI * 2); }, { ramp: T, bevel: 5, amb: 0.2, ink: I });
  q.form(g => { g.ellipse(17, 6, 7, 4, 0.2, 0, Math.PI * 2); }, { ramp: T, bevel: 3, amb: 0.12, ink: I, inkIn: T[1] });
  for (const ex of [13, 19]) { q.rect(ex - 1, -4, 5, 4, '#fdd8b0'); q.px(ex, -3, I); q.px(ex + 2, -3, I); q.px(ex + 1, -2, I); q.px(ex, -1, I); q.px(ex + 2, -1, I); }
  q.disc(18, 5, 2, 2, '#3a0606'); q.px(17, 3, '#f4ecdc'); q.px(18, 3, '#f4ecdc');
  q.px(23, 1, T[6]); q.px(23, 2, T[5]);
  // The swoop, blown back off his head
  q.form(g => { g.moveTo(22, -6); g.bezierCurveTo(16, -10, 6, -10, -2, -10 + flap); g.lineTo(0, -7); g.bezierCurveTo(6, -6, 12, -4, 22, -3); g.closePath(); },
    { ramp: Hh, bevel: 2, amb: 0.25, ink: '#5a3a04', spec: '#fffef0', wet: 0.6 });
  q.line(4, -9 + flap, 18, -7, Hh[5]);
});
const trumpFlyFigA = trumpFly(1), trumpFlyFigB = trumpFly(-1);

// ---------------------------------------------------------------------------
// Panels
// ---------------------------------------------------------------------------

/** The stars over the White House (none where the building is). */
const WH_STARS = Array.from({ length: 40 }, (_, i) => [Math.floor(hash(i) * ART_W), Math.floor(hash(i + 40) * 50)] as [number, number])
  .filter(([x, y]) => !(x > 86 && x < 170 && y > 36) && !(x > 122 && x < 146 && y > 18) && !(x > 30 && x < 226 && y > 49) && !(x > 208 && x < 236 && y > 6 && y < 34));
const WH_SKY = ['#02021a', '#04042a', '#08083c', '#0c0c4c', '#12125c', '#1c1c6c', '#2a2a7c', '#3c3c88'];
const MOON = ['#8c8a70', '#b4b090', '#d4d0ac', '#ece8c8', '#fcf8d8', '#fffff0'];

/** The night shot, the static part (painted once): the sky, the moon, the lawn, the fountain's basin, the building, the hedges, the fence. */
const whNightSet = (ctx: Ctx) => layer(ctx, 'wh-night-2', ART_W, ART_H, g => {
  bands(g, 0, 0, ART_W, 110, WH_SKY);
  for (const [x, y] of WH_STARS) R(g, x, y, 1, 1, C.white);
  // The moon: a crescent, shaded, a crater or two; a faint ring of light round it
  for (let y = 6; y < 36; y++) for (let x = 206; x < 240; x++) { const d = Math.hypot(x - 222, y - 20); if (d > 9 && d < 12 && (x + y) % 2 === 0) R(g, x, y, 1, 1, '#0c0c4c'); }
  shaded(g, 'wh-moon', 213, 11, 18, 18, MOON, (u, v) => {
    const x = u * 18 - 9, y = v * 18 - 9;
    if (x * x + y * y > 81 || (x - 4) ** 2 + (y + 2) ** 2 < 64) return -1;
    return 0.95 - Math.hypot(x + 6, y + 4) * 0.06;
  });
  R(g, 215, 21, 2, 1, MOON[2]); R(g, 217, 25, 1, 1, MOON[2]);
  // The lawn: mown in stripes, the building's floodlights pooled on it
  bands(g, 0, 108, ART_W, 36, ['#0c2a0c', '#123a12', '#184a16', '#1e5a1c', '#246a22', '#2c7a28']);
  for (let y = 108; y < ART_H; y++) for (let x = 0; x < ART_W; x++) {
    if (Math.floor((x - 128) / (12 + (y - 108) * 0.5) + 100) % 2 === 0 && bayer(x, y) > 0.1) R(g, x, y, 1, 1, y < 120 ? '#164214' : y < 132 ? '#225c1e' : '#2c7028');
    else if (y > 108 && y < 116 && Math.abs(x - 128) < 100 && bayer(x, y) + 0.5 < 0.3 - Math.abs(x - 128) / 400) R(g, x, y, 1, 1, '#3c7c2c');
  }
  for (let y = 114; y < ART_H; y += 7) for (let x = (y * 3) % 5; x < ART_W; x += 5) R(g, x, y, 1, 2, '#3c8c34');
  paintWhiteHouse(g, WH_NIGHT);
  // The fountain out front: the stone basin (its rim lit), the water in it catching the light
  ell(g, 128, 131, 25, 6, FIG_INK);
  ell(g, 128, 131, 24, 5, WH_NIGHT.stone[3]); ell(g, 128, 130, 24, 4, WH_NIGHT.stone[6]); ell(g, 128, 131, 21, 3, '#0c1c3c');
  for (let x = 110; x < 147; x++) if (bayer(x, 130) > 0.1) R(g, x, 130, 1, 1, '#24406c');
  R(g, 118, 131, 6, 1, '#7c9cc8'); R(g, 133, 132, 4, 1, '#5c7cac');
  R(g, 126, 125, 5, 6, FIG_INK); R(g, 127, 125, 3, 5, WH_NIGHT.stone[5]); R(g, 127, 125, 1, 5, WH_NIGHT.stone[7]); R(g, 124, 124, 9, 1, WH_NIGHT.stone[6]);
  paintFence(g, 115, '#7c7ca4');
});

export const drawWhiteHouse = (ctx: Ctx, t: number) => {
  whNightSet(ctx);
  // (the stars twinkling: one in seven out at a time)
  WH_STARS.forEach(([x, y], i) => { if (Math.floor(t / 20 + i) % 7 === 0) R(ctx, x, y, 1, 1, WH_SKY[Math.min(WH_SKY.length - 1, Math.floor((y / 110) * WH_SKY.length))]); });
  // The flag on the roof, flying
  whFlag(ctx, t % 30 < 15 ? 0 : 1, false);
  // The fountain's jet, going up and falling back
  for (let k = 0; k < 8; k++) {
    const p = ((t * 0.5 + k * 2.5) % 20) / 20;
    for (const s of [-1, 1]) R(ctx, 128 + s * Math.round(p * 9), 124 - Math.round(Math.sin(p * Math.PI) * 9), 1, 1, k % 2 ? '#a8d0f8' : '#e8f8ff');
  }
  R(ctx, 128, 116, 1, 8, '#c8e4fc'); R(ctx, 128, 115 + (t % 4 < 2 ? 0 : 1), 1, 1, '#ffffff');
};

/** Wide shot of the press room: Trump at the podium, Meathead beside it. */
export const drawPressRoom = (ctx: Ctx, t: number, talking: boolean) => {
  curtain(ctx, 116);
  whSign(ctx, 128, 20);
  hangingFlag(ctx, 50, 38);
  hangingFlag(ctx, 190, 38);
  stageFloor(ctx);
  trumpSmall(ctx, 128, 46, t, talking);
  podium(ctx, 128, 72);
  meatheadStanding(ctx, 172, 118, false);
  reporters(ctx, t, 0);
};

/**
 * Trump's face, filling the frame. `opts.bg`: somewhere other than the press room's curtain. `opts.rough`: the real
 * one, out of the closet: the swoop come down in strands, a long one hanging off the side, stubble, the raw pink
 * rectangle the tape left round his mouth, ketchup in the corner of it, the tie yanked loose. `opts.hands`: his little
 * hands up into the frame, pinching the air as he sells it.
 */
export const drawTrumpCloseUp = (ctx: Ctx, t: number, talking: boolean, mood: 'proud' | 'huh', opts: { bg?: (ctx: Ctx) => void; rough?: boolean; hands?: boolean } = {}) => {
  if (opts.bg) opts.bg(ctx); else curtain(ctx, ART_H);
  // Suit, shirt and the long red tie
  shaded(ctx, 'tr-suit', 30, 116, 196, 40, RAMP.navy, ball(-0.4, -0.85, 0.15));
  for (let i = 0; i < 16; i++) R(ctx, 106 + i, 112 + i, 44 - i * 2, 1, C.white);
  R(ctx, 120, 114, 16, 8, C.red);
  R(ctx, 122, 122, 12, 22, C.red);
  R(ctx, 127, 122, 2, 22, C.darkRed);
  // Neck and jowls
  shaded(ctx, 'tr-neck', 102, 94, 52, 26, RAMP.tSkin, box(-0.5, -0.2, 0.1, 1, 0.3));
  // Face: round, lit from the upper left, the jowls hanging off it in their own light
  shaded(ctx, 'tr-face', 90, 34, 76, 84, RAMP.tSkin, ball(-0.4, -0.5, 0.18));
  shaded(ctx, 'tr-jowls', 96, 88, 64, 28, RAMP.tSkin, ball(-0.35, -0.7, 0.14));
  // Ears
  shaded(ctx, 'tr-ear', 85, 65, 8, 18, RAMP.tSkin, ball(-0.5, -0.4, 0.2));
  shaded(ctx, 'tr-ear2', 163, 65, 8, 18, RAMP.tSkin, ball(-0.9, -0.2, 0.08));
  // The pale goggles around the eyes
  ell(ctx, 112, 70, 12, 6, C.tSkinPale);
  ell(ctx, 144, 70, 12, 6, C.tSkinPale);
  // Eyes: squinting (one eyebrow up in disbelief for 'huh')
  const squint = mood === 'proud' ? 1 : 2;
  R(ctx, 104, 69, 14, squint + 1, C.white);
  R(ctx, 138, 69, 14, squint + 1, C.white);
  R(ctx, 110, 69, 3, squint + 1, C.ink);
  R(ctx, 142, 69, 3, squint + 1, C.ink);
  R(ctx, 102, 67, 17, 1, C.tSkinShade);
  R(ctx, 137, 67, 17, 1, C.tSkinShade);
  R(ctx, 102, mood === 'huh' ? 58 : 62, 18, 3, C.tHairShade);
  R(ctx, 136, 62, 18, 3, C.tHairShade);
  // Nose
  R(ctx, 125, 72, 2, 14, C.tSkinShade);
  R(ctx, 121, 86, 14, 3, C.tSkinShade);
  // Mouth: the pursed pucker, flapping open while he talks
  const open = talking && t % 10 < 5;
  if (mood === 'huh') {
    ell(ctx, 128, 101, 4, 4, '#500000');
  } else if (open) {
    ell(ctx, 128, 100, 9, 5, '#500000');
    R(ctx, 121, 96, 14, 2, C.white);
  } else {
    ell(ctx, 128, 100, 7, 3, '#b02c20');
    R(ctx, 122, 100, 12, 1, '#500000');
  }
  // Chin creases
  R(ctx, 112, 110, 32, 1, C.tSkinShade);
  // The hair: a huge swept swoop, lacquered, catching the lights
  R(ctx, 88, 40, 8, 26, RAMP.tHair[2]);
  R(ctx, 160, 40, 10, 22, RAMP.tHair[1]);
  shaded(ctx, 'tr-hair1', 84, 26, 88, 32, RAMP.tHair, ball(-0.3, -0.8, 0.2));
  shaded(ctx, 'tr-hair2', 96, 26, 80, 24, RAMP.tHair, ball(-0.4, -0.75, 0.25));
  shaded(ctx, 'tr-hair3', 154, 42, 20, 16, RAMP.tHair, ball(-0.6, -0.5, 0.15));
  for (let i = 0; i < 6; i++) R(ctx, 100 + i * 12, 34 + (i % 2) * 2, 10, 1, C.tHairLight);
  R(ctx, 96, 52, 70, 2, C.tHairShade);
  R(ctx, 150, 54, 16, 2, C.tHairShade);
  // (the swoop, strand by strand, combed over from the far side)
  for (let i = 0; i < 9; i++) { const sx = 94 + i * 8; R(ctx, sx, 38 + (i % 3), 7, 1, i % 2 ? C.tHairLight : C.tHairShade); R(ctx, sx + 3, 44 + (i % 2), 6, 1, C.tHairShade); }
  R(ctx, 164, 44, 2, 12, C.tHairShade); R(ctx, 168, 48, 1, 8, C.tHairLight);
  // Lines in his face: the forehead, the bags under his eyes, down from his nose, the jowls; the flush in his cheeks
  R(ctx, 112, 56, 32, 1, C.tSkinShade);
  R(ctx, 104, 76, 14, 1, C.tSkinShade); R(ctx, 106, 78, 10, 1, C.tSkinShade);
  R(ctx, 138, 76, 14, 1, C.tSkinShade); R(ctx, 140, 78, 10, 1, C.tSkinShade);
  for (let k = 0; k < 10; k++) { R(ctx, 116 - Math.floor(k / 2), 88 + k, 1, 1, C.tSkinShade); R(ctx, 140 + Math.floor(k / 2), 88 + k, 1, 1, C.tSkinShade); }
  ell(ctx, 102, 88, 7, 4, '#f07a38'); ell(ctx, 154, 88, 7, 4, '#f07a38');
  R(ctx, 100, 106, 10, 1, C.tSkinShade); R(ctx, 146, 106, 10, 1, C.tSkinShade);
  R(ctx, 104, 114, 48, 1, C.tSkinShade);
  // The suit: its lapels, the flag pin, the shirt collar points
  for (let i = 0; i < 16; i++) { R(ctx, 104 - i, 112 + i, 1, 1, C.navyDark); R(ctx, 151 + i, 112 + i, 1, 1, C.navyDark); }
  R(ctx, 74, 126, 6, 4, C.white); R(ctx, 74, 126, 6, 1, C.red); R(ctx, 74, 128, 6, 1, C.red); R(ctx, 74, 126, 2, 2, C.blue);
  if (opts.rough) trumpRough(ctx, t, talking && t % 10 < 5, mood);
  if (opts.hands) trumpHands(ctx, t, talking);
};

/** The real President, after however long tied up in a closet (see drawTrumpCloseUp). */
const trumpRough = (ctx: Ctx, t: number, open: boolean, mood: 'proud' | 'huh') => {
  const sw = Math.round(Math.sin(t * 0.15) * 1.5);
  ctx.drawImage(roughStill(sw), 0, 0);
  // The mouth again over it (the tape took some of it with it) and ketchup in the corner
  if (mood === 'huh') ell(ctx, 128, 101, 4, 4, '#500000');
  else if (open) { ell(ctx, 128, 100, 9, 5, '#500000'); R(ctx, 121, 96, 14, 2, C.white); }
  else { ell(ctx, 128, 100, 7, 3, '#b02c20'); R(ctx, 122, 100, 12, 1, '#500000'); }
  R(ctx, 136, 101, 3, 2, '#c81e0c'); R(ctx, 137, 103, 1, 2, '#c81e0c'); R(ctx, 136, 101, 1, 1, '#f05a3c');
  // (a bead of sweat at his temple, running)
  const d = (t * 0.6) % 30;
  R(ctx, 98, 58 + d, 2, 3, 'rgba(255,255,255,0.6)'); R(ctx, 98, 58 + d, 1, 1, C.white);
};

/**
 * What the closet did to him, painted once (each way the loose hair's swinging), over the close-up: the collar open,
 * the top button gone, the shirt grubby, the tie yanked loose and hanging askew (a stain on it); the tape's ghost round
 * his mouth, a pale patch where the tan came off with it, raw pink round its edges, a strip of the tape still stuck on at
 * one corner, curling up; stubble, grey and orange, over the jowls and up the cheeks (not on the tape's ghost); the bags
 * under his eyes gone dark, red in the whites; the swoop come down, strands of it over his brow, one long one off the
 * side down past his ear to his jaw.
 */
const roughStill = (sw: number) => painting(`tr-rough-${sw}`, ART_W, ART_H, p => {
  const T = RAMP.tSkin, Hh = RAMP.tHair, SH = RAMP.shirt, I = MD_INK;
  // The collar open: the shirt in the V, grubby; the collar points splayed
  p.form(g => { g.moveTo(110, 113); g.lineTo(146, 113); g.lineTo(138, 146); g.lineTo(118, 146); g.closePath(); }, { ramp: SH, bevel: 5, amb: 0.25, ink: I });
  p.form(g => { g.moveTo(118, 113); g.lineTo(138, 113); g.lineTo(128, 124); g.closePath(); }, { ramp: T, bevel: 4, amb: 0.15, ink: null });
  for (const s of [-1, 1]) p.form(g => { g.moveTo(128 + s * 10, 112); g.lineTo(128 + s * 19, 114); g.lineTo(128 + s * 15, 124); g.closePath(); }, { ramp: SH, bevel: 2, amb: 0.3, ink: I });
  p.disc(121, 127, 2, 1.5, '#c8a050', 0.8); p.px(125, 129, '#b08840');
  // The tie, yanked loose: the knot down off to the side, the rest hanging askew
  p.form(g => { g.moveTo(131, 117); g.lineTo(143, 118); g.lineTo(142, 124); g.lineTo(133, 124); g.closePath(); }, { ramp: RAMP.red, bevel: 2.5, amb: 0.2, ink: I });
  p.form(g => { g.moveTo(134, 123); g.lineTo(142, 123); g.bezierCurveTo(146, 130, 148, 138, 150, 146); g.lineTo(140, 146); g.bezierCurveTo(139, 138, 137, 130, 134, 123); g.closePath(); }, { ramp: RAMP.red, bevel: 3, amb: 0.2, ink: I });
  p.line(137, 125, 143, 144, RAMP.red[4]); p.disc(142, 131, 1.5, 1, '#5a1004');
  // The tape's ghost: the tan come off with it (a pale patch, dithered off at its edges), raw pink round it
  const tx = 108, ty = 92, tw = 40, th = 17;
  p.form(g => { g.roundRect(tx, ty, tw, th, 4); }, { ramp: ['#e89a6c', '#f4b488', '#fcc8a0', '#fde0c4'], bevel: 5, amb: 0.3, ink: null, alpha: 0.75 });
  for (let x = tx - 1; x <= tx + tw; x++) for (let y = ty - 1; y <= ty + th; y++) {
    const ex = Math.min(x - tx + 1, tx + tw - x), ey = Math.min(y - ty + 1, ty + th - y), e = Math.min(ex, ey);
    if (e <= 1 && bayer(x, y) > -0.3) p.px(x, y, '#e2686a', 0.75);
    else if (e === 2 && bayer(x, y) > 0.25) p.px(x, y, '#f08c80', 0.5);
  }
  // (a strip of the tape still stuck on at one corner, curling up)
  p.form(g => { g.moveTo(tx + tw - 8, ty - 1); g.lineTo(tx + tw + 1, ty - 1); g.lineTo(tx + tw + 3, ty - 5); g.lineTo(tx + tw + 1, ty + 3); g.lineTo(tx + tw - 8, ty + 3); g.closePath(); },
    { ramp: ['#5a5a62', '#7a7a84', '#a8a8b0', '#c8c8d0', '#e8e8f0'], bevel: 1.5, amb: 0.3, ink: I, spec: '#ffffff', wet: 0.5 });
  // Stubble, grey and orange, over the jowls and chin and up the cheeks (not on the tape's ghost): thicker low down
  for (let y = 82; y < 117; y++) for (let x = 92; x < 165; x++) {
    if (x >= tx - 1 && x <= tx + tw && y >= ty - 1 && y <= ty + th) continue;
    if (Math.abs(x - 128) > 35 - (y - 84) * 0.28) continue;
    const dense = 0.04 + (y - 82) / 35 * 0.14 + noise(x, y, 5, 3) * 0.08;
    if (hash2(x * 1.3, y * 2.1) < dense) p.px(x, y, hash2(x, y * 3) < 0.3 ? '#c8b8a8' : '#a4582c', 0.7);
  }
  // The bags under his eyes gone dark; red in the whites
  for (const cx of [111, 145]) { p.disc(cx, 78, 7, 1.6, T[1], 0.7); p.line(cx - 5, 80, cx + 4, 80, T[2], 0.6); }
  p.line(105, 70, 106, 70, '#e05050'); p.line(149, 70, 150, 70, '#e05050');
  // The swoop come down: strands of it over his brow, lacquered, each catching the light
  for (let i = 0; i < 7; i++) {
    const sx = 100 + i * 9, len = 8 + Math.floor(hash(i * 3.7) * 10), dx = Math.floor(len / 4) + sw;
    p.form(p.strokeMask(g => { g.moveTo(sx, 53); g.quadraticCurveTo(sx + 1, 53 + len * 0.6, sx + dx, 53 + len); }, 2), { ramp: Hh, bevel: 1, amb: 0.35, ink: Hh[1], spec: '#fffef0', wet: 0.4 });
  }
  // (and the long one off the side, down past his ear to his jaw)
  p.form(p.strokeMask(g => { g.moveTo(166, 42); g.bezierCurveTo(172, 56, 166 + sw, 76, 170 + sw, 94); }, 4), { ramp: Hh, bevel: 2, amb: 0.25, ink: Hh[0], spec: '#fffef0', wet: 0.4 });
  p.line(168, 46, 170 + sw, 88, Hh[5]);
});

/**
 * His little hands up from the bottom of the frame, chopping the air in time with it: the pinch, thumb and forefinger
 * touching in a little ring, the other three fingers fanned up behind. Small. Very small. Painted once a side.
 */
const trumpHands = (ctx: Ctx, t: number, talking: boolean) => {
  for (const side of [-1, 1] as const) {
    const bob = talking ? Math.round(Math.sin(t * 0.35 + (side > 0 ? 1.2 : 0)) * 4) : 0;
    trumpHandFig(side)(ctx, 128 + side * 70, 98 + bob);
  }
};
const trumpHandFig = (side: -1 | 1) => figure(`tr-hand-${side}`, 30, 64, 15, 12, q => {
  const T = RAMP.tSkin, I = MD_INK, amb = side < 0 ? 0.2 : 0.1;
  // The sleeve up out of the bottom of the frame, the shirt cuff, the cufflink
  q.form(g => { g.moveTo(-9, 52); g.lineTo(-8, 15); g.lineTo(8, 15); g.lineTo(9, 52); g.closePath(); }, { ramp: RAMP.navy, bevel: 4, amb: 0.15, ink: I });
  q.line(-6, 18, -6, 50, RAMP.navy[5]);
  q.form(g => { g.roundRect(-7.5, 10.5, 15, 5, 1); }, { ramp: RAMP.shirt, bevel: 1.5, amb: 0.3, ink: I });
  q.form(g => { g.rect(side * 4 - 1, 12, 2.5, 2.5); }, { ramp: RAMP.gold, bevel: 1, ink: null, spec: '#fffff0', wet: 0.8 });
  // Three fingers fanned up behind (the far side), each a little sausage with a nail
  for (let f = 0; f < 3; f++) {
    const fx = -side * 5 + side * f * 3, fy = -5 + Math.abs(f - 1);
    q.form(g => { g.roundRect(fx - 1.5, fy, 3.2, 8, 1.5); }, { ramp: T, bevel: 1.5, amb, ink: I, inkIn: T[1] });
    q.px(fx, fy + 1, '#fcd8c0');
  }
  // The palm, the back of it to us, the knuckles
  q.form(g => { g.roundRect(-6, 1, 12, 11, 4); }, { ramp: T, bevel: 3.5, amb, ink: I, inkIn: T[1] });
  for (let k = 0; k < 3; k++) q.line(-4 + k * 3, 3, -3 + k * 3, 3, T[2]);
  // The forefinger and the thumb, curled into each other: the ring of the pinch, the air through the middle of it
  const rx = side * 5, ry = -2;
  q.form(g => { g.arc(rx, ry, 3.6, 0, Math.PI * 2); g.moveTo(rx + 1.2, ry); g.arc(rx, ry, 1.2, 0, Math.PI * 2, true); }, { ramp: T, bevel: 1.5, amb, ink: I });
  q.px(rx + side * 2, ry + 1, T[1]);
});

/**
 * Medium two-shot: the President (the imposter, though nobody knows it yet) hanging the medal round Meathead's neck.
 * Him on the left in three-quarter profile: the swoop, the tan with the pale goggles, the pucker, the jowls tucked into
 * his collar, the jacket pushed out by the gut in one curve, the long tie hanging off the front of it, his little hands
 * out holding the ribbon's loop. Meathead on the right, leaning in for it: flat-top, square stubbled jaw, a neck like a
 * tree trunk, the traps, delts and pecs. The ribbon looped from the hands over his head, down round his neck, the medal
 * on his chest. (One thing that's easy to miss: a seam at the President's neck, and green at his wrist.) Painted once;
 * only his mouth and the glint move.
 */
const MD_INK = '#120a10';
const medalStill = () => painting('ending-medal', ART_W, ART_H, p => {
  const S = RAMP.mSkin, T = RAMP.tSkin, Hr = RAMP.tHair, N = RAMP.navy;
  const blue = ['#00104c', '#002080', '#0838b8', '#2058e0', '#4880f8', '#88b0fc'];
  // --- Meathead (right), leaning in ---
  // The trunk: traps up into the neck, the shoulders, the chest, off the bottom and the right
  p.form(g => { g.moveTo(130, 144); g.lineTo(132, 108); g.bezierCurveTo(134, 92, 150, 84, 168, 76); g.lineTo(206, 74); g.bezierCurveTo(226, 80, 250, 84, 262, 96); g.lineTo(262, 144); g.closePath(); },
    { ramp: S, bevel: 22, amb: 0.16, ink: MD_INK });
  // Traps, either side of the neck, humped up
  p.form(g => { g.ellipse(166, 84, 22, 10, -0.35, 0, Math.PI * 2); }, { ramp: S, bevel: 9, amb: 0.2, ink: null });
  p.form(g => { g.ellipse(214, 84, 24, 10, 0.3, 0, Math.PI * 2); }, { ramp: S, bevel: 9, amb: 0.2, ink: null });
  // Delts, round as cannonballs
  p.form(g => { g.ellipse(146, 108, 17, 20, 0.2, 0, Math.PI * 2); }, { ramp: S, bevel: 14, amb: 0.14, ink: MD_INK, inkIn: S[1] });
  p.form(g => { g.ellipse(252, 112, 18, 22, -0.2, 0, Math.PI * 2); }, { ramp: S, bevel: 14, amb: 0.1, ink: MD_INK, inkIn: S[1] });
  // Pecs: two slabs, split down the middle, a deep shadow under each
  for (const [cx, rot] of [[180, 0.12], [222, -0.12]] as const) {
    p.form(g => { g.ellipse(cx, 118, 24, 16, rot, 0, Math.PI * 2); }, { ramp: S, bevel: 12, amb: 0.16, ink: null, inkIn: null });
    for (let k = -20; k <= 20; k++) { const y = 118 + Math.round(Math.sqrt(Math.max(0, 1 - (k / 24) ** 2)) * 16 + k * rot * 0.9); p.px(cx + k, y, S[1]); p.px(cx + k, y + 1, S[2]); if ((k & 1) === 0) p.px(cx + k, y + 2, S[2]); }
  }
  p.line(201, 104, 201, 140, S[1]); p.line(202, 106, 202, 140, S[2]);
  // (nipples, a bit of hair between the pecs)
  p.disc(184, 126, 2, 1.5, '#8a4a2a'); p.disc(226, 126, 2, 1.5, '#7a4024');
  for (let k = 0; k < 9; k++) p.px(198 + (k % 3) * 2, 112 + k * 3, S[1]);
  // The back of the ribbon's loop, down behind his neck onto his traps
  const ribbon = (path: (g: CanvasRenderingContext2D) => void, w: number) => p.form(p.strokeMask(path, w), { ramp: blue, bevel: 1.6, amb: 0.3, ink: MD_INK });
  ribbon(g => { g.moveTo(121, 82); g.bezierCurveTo(140, 70, 160, 70, 172, 76); }, 4);
  // The neck: a trunk, wider at the bottom than his jaw, the cords standing out
  p.form(g => { g.moveTo(166, 90); g.lineTo(170, 52); g.lineTo(208, 52); g.lineTo(212, 88); g.bezierCurveTo(196, 94, 180, 94, 166, 90); g.closePath(); }, { ramp: S, bevel: 12, amb: 0.14, ink: MD_INK });
  for (let k = 0; k < 14; k++) { p.px(178 + Math.floor(k / 3), 70 + k, S[2]); p.px(198 - Math.floor(k / 4), 70 + k, S[2]); }
  // (the shadow his jaw throws down it)
  for (let x = 170; x < 208; x++) for (let y = 62; y < 70; y++) if (p.painted(x, y) && bayer(x, y) + 0.5 < 0.75 - (y - 62) / 10) p.px(x, y, S[1]);
  // The head: a block, leaned in toward the President, the face turned three-quarters to him
  p.form(g => { g.moveTo(166, 22); g.lineTo(208, 20); g.lineTo(210, 54); g.lineTo(200, 66); g.lineTo(174, 68); g.lineTo(164, 58); g.closePath(); }, { ramp: S, bevel: 9, amb: 0.16, ink: MD_INK });
  // The ear, on the far side of him from the President
  p.form(g => { g.ellipse(209, 42, 4, 8, 0.1, 0, Math.PI * 2); }, { ramp: S, bevel: 3, amb: 0.1, ink: MD_INK });
  p.line(209, 37, 209, 46, S[1]);
  // Flat-top, the top catching the light, the bristles, the sharp line of it across his forehead
  p.form(g => { g.rect(163, 8, 47, 18); }, { ramp: RAMP.mHair, bevel: 3, amb: 0.2, ink: MD_INK });
  for (let x = 165; x < 209; x += 2) { p.line(x, 11, x, 24, '#1e1e24'); p.px(x, 9, '#4a4a56'); }
  p.rect(165, 25, 44, 1, '#050505');
  p.rect(166, 26, 4, 14, RAMP.mHair[1]); p.rect(204, 26, 5, 12, RAMP.mHair[1]);
  // His face, turned to the President: the brows down hard, the eyes on the medal
  p.rect(169, 34, 13, 3, RAMP.mHair[0]); p.rect(186, 34, 13, 3, RAMP.mHair[0]); p.rect(170, 33, 11, 1, RAMP.mHair[2]);
  p.rect(170, 39, 10, 3, '#f4ece0'); p.rect(187, 39, 10, 3, '#f4ece0');
  p.rect(170, 40, 4, 2, '#1c1c1c'); p.rect(187, 40, 4, 2, '#1c1c1c'); p.rect(170, 38, 10, 1, S[1]); p.rect(187, 38, 10, 1, S[1]);
  // (the nose, out into the light on his near side; its shadow across his cheek)
  p.line(181, 40, 177, 50, S[6]); p.line(182, 40, 182, 51, S[2]); p.rect(176, 51, 8, 2, S[1]); p.px(177, 52, '#4a2410'); p.px(182, 52, '#4a2410');
  // (the mouth, a hard line, one corner up; the cleft; the vein at his temple)
  p.rect(174, 58, 16, 2, '#7a1e10'); p.px(190, 57, '#7a1e10'); p.rect(174, 60, 16, 1, S[3]);
  p.line(183, 63, 183, 66, S[2]);
  p.rect(203, 28, 2, 6, '#d03030'); p.rect(201, 33, 3, 2, '#d03030');
  // The jaw: square, the shadow under it, stubble along it
  p.line(166, 58, 175, 67, S[1]); p.line(175, 67, 199, 66, S[1]);
  for (let i = 0; i < 90; i++) { const x = 166 + Math.floor(hash(i * 3.3) * 42), y = 52 + Math.floor(hash(i * 5.7) * 14); if ((y > 56 || x > 196) && !(x > 172 && x < 192 && y < 61)) p.px(x, y, i % 3 ? '#8c5c30' : '#6a4020'); }
  // The front of the loop: from the President's hands across his chest, sagging, to the medal; up the far side of his neck
  ribbon(g => { g.moveTo(121, 86); g.bezierCurveTo(150, 112, 176, 116, 196, 112); }, 4);
  ribbon(g => { g.moveTo(196, 112); g.bezierCurveTo(206, 104, 210, 92, 208, 80); }, 4);
  // The medal: the clasp, a gold disc, a white star on it, red at its heart
  p.form(g => { g.rect(193, 108, 6, 6); }, { ramp: RAMP.gold, bevel: 2, ink: MD_INK });
  const star = (g: CanvasRenderingContext2D, cx: number, cy: number, r0: number, r1: number) => { for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? r1 : r0; g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g.closePath(); };
  p.form(g => { g.arc(196, 122, 8, 0, Math.PI * 2); }, { ramp: RAMP.gold, bevel: 4, ink: MD_INK, spec: '#fffff0', wet: 0.8 });
  p.form(g => star(g, 196, 122, 6, 2.6), { ramp: ['#8090b0', '#b8c4dc', '#e4e8f4', '#ffffff'], bevel: 2, ink: '#5c3c00' });
  p.disc(196, 122, 1.5, 1.5, '#d82800');

  // --- The President (left), three-quarters to us, facing Meathead ---
  // The suit: shoulders, the back, the gut pushing the jacket out in front in one curve, off the bottom
  p.form(g => {
    g.moveTo(22, 144); g.bezierCurveTo(20, 116, 22, 92, 34, 80); g.bezierCurveTo(44, 70, 60, 68, 76, 70);
    g.bezierCurveTo(88, 72, 94, 82, 96, 92); g.bezierCurveTo(112, 104, 118, 124, 112, 144); g.closePath();
  }, { ramp: N, bevel: 18, amb: 0.14, ink: MD_INK });
  // (the jacket hanging open off the gut: the shirt between, straining; the pinstripes)
  p.form(g => { g.moveTo(80, 72); g.bezierCurveTo(92, 82, 104, 98, 110, 116); g.bezierCurveTo(112, 128, 110, 138, 108, 144); g.lineTo(98, 144); g.bezierCurveTo(100, 124, 94, 104, 84, 90); g.closePath(); },
    { ramp: RAMP.shirt, bevel: 6, amb: 0.3, ink: MD_INK });
  for (let x = 26; x < 98; x += 4) for (let y = 76; y < 144; y++) if ((y + x) % 7 === 0) p.px(x, y, N[3], 0.6);
  // The lapel, rolled over the chest; the flag pin on it
  p.form(g => { g.moveTo(72, 72); g.lineTo(84, 74); g.lineTo(90, 98); g.lineTo(80, 92); g.closePath(); }, { ramp: N, bevel: 3, amb: 0.3, ink: MD_INK });
  p.rect(76, 82, 4, 3, '#fcfcfc'); p.rect(76, 82, 4, 1, '#d82800'); p.rect(76, 84, 4, 1, '#d82800'); p.rect(76, 82, 2, 2, '#1c1c5c');
  // The tie: knotted up under the jowls, down the front of him, out over the gut and hanging off it, far too long
  p.form(g => { g.moveTo(86, 76); g.lineTo(92, 76); g.bezierCurveTo(100, 92, 108, 106, 110, 120); g.lineTo(108, 142); g.lineTo(103, 146); g.lineTo(100, 140); g.bezierCurveTo(102, 120, 96, 98, 86, 80); g.closePath(); },
    { ramp: RAMP.red, bevel: 3, amb: 0.2, ink: MD_INK });
  for (let k = 0; k < 8; k++) p.line(92 + k * 2, 86 + k * 7, 96 + k * 2, 84 + k * 7, RAMP.red[2]);
  // His far arm (mostly hidden): the sleeve out under his near one, the hand up at the ribbon
  p.form(g => { g.moveTo(84, 92); g.bezierCurveTo(96, 96, 108, 94, 116, 86); g.lineTo(120, 92); g.bezierCurveTo(110, 102, 96, 104, 86, 100); g.closePath(); }, { ramp: N, bevel: 4, amb: 0.08, ink: MD_INK });
  // The near arm: short, bent, out from the shoulder to the hands
  p.form(g => { g.moveTo(42, 82); g.bezierCurveTo(54, 76, 64, 84, 70, 98); g.bezierCurveTo(84, 100, 100, 94, 112, 86); g.lineTo(116, 94); g.bezierCurveTo(100, 106, 80, 112, 64, 110); g.bezierCurveTo(52, 106, 42, 96, 42, 82); g.closePath(); },
    { ramp: N, bevel: 8, amb: 0.16, ink: MD_INK });
  p.line(60, 92, 70, 100, N[1]); p.line(72, 104, 84, 104, N[1]);
  // The cuff; the little hands, pinching the ribbon's ends; green at the near wrist, under the cuff, where the skin
  // doesn't quite reach
  p.form(g => { g.moveTo(110, 84); g.lineTo(116, 82); g.lineTo(119, 92); g.lineTo(113, 95); g.closePath(); }, { ramp: RAMP.shirt, bevel: 2, ink: MD_INK });
  p.px(118, 88, '#4c8a3a'); p.px(118, 89, '#3c7030');
  for (const [hx, hy] of [[123, 84], [124, 90]] as const) {
    p.form(g => { g.ellipse(hx, hy, 4, 3.5, 0.3, 0, Math.PI * 2); }, { ramp: T, bevel: 3, amb: 0.2, ink: MD_INK });
    p.line(hx - 1, hy - 3, hx + 3, hy - 3, T[5]); p.px(hx + 3, hy, T[1]);
  }
  // The collar; the head and the jowls spilling over it; a seam round the neck, under the jowl, that shouldn't be there
  p.form(g => { g.moveTo(60, 74); g.lineTo(88, 74); g.lineTo(92, 80); g.lineTo(62, 82); g.closePath(); }, { ramp: RAMP.shirt, bevel: 3, amb: 0.3, ink: MD_INK });
  p.form(g => { g.ellipse(68, 50, 18, 20, 0, 0, Math.PI * 2); g.moveTo(91, 66); g.ellipse(74, 66, 17, 10, 0.1, 0, Math.PI * 2); g.moveTo(91, 52); g.ellipse(88, 52, 3, 4, 0.3, 0, Math.PI * 2); },
    { ramp: T, bevel: 10, amb: 0.18, ink: MD_INK });
  for (let x = 63; x < 82; x += 2) p.px(x, 75 - Math.round(Math.sin((x - 63) / 19 * Math.PI)), '#a8b080');
  // The jowls: the roll of them, lit along the top, a crease under each
  p.line(62, 64, 76, 70, T[1]); p.line(76, 70, 88, 68, T[1]); p.line(64, 70, 84, 74, T[1]);
  p.line(62, 63, 74, 68, T[5]);
  // The ear
  p.form(g => { g.ellipse(56, 52, 4, 7, 0, 0, Math.PI * 2); }, { ramp: T, bevel: 3, amb: 0.2, ink: MD_INK });
  p.line(56, 48, 56, 56, T[1]);
  // The pale goggles round the eye (the tanning goggles), the squint, the brow
  p.disc(80, 45, 7, 4, T[6]); p.disc(80, 45, 5, 3, '#fde4c4');
  p.rect(77, 45, 6, 2, '#fcfcfc'); p.rect(80, 45, 2, 2, '#1c1c1c'); p.line(76, 44, 84, 44, T[1]);
  p.rect(74, 38, 12, 2, Hr[2]); p.rect(75, 37, 9, 1, Hr[4]);
  p.line(77, 49, 83, 49, T[2]); p.line(78, 50, 82, 50, T[2]);
  // (the nose out into the light, the nostril; the cheek, flushed; the crease down from the nose)
  p.line(86, 46, 88, 51, T[6]); p.px(87, 55, T[0]); p.px(88, 55, T[1]);
  p.disc(74, 56, 4, 3, '#f07a38', 0.6);
  p.line(86, 57, 84, 62, T[2]);
  // The pucker
  p.disc(88, 61, 3, 2, '#b02c20'); p.px(88, 61, '#500000'); p.px(87, 60, '#e06048');
  // The hair: the swoop, the volume of it, swept forward off the back of his head and over the forehead, curling under
  // at the front, lacquered
  p.form(g => {
    g.moveTo(52, 64); g.bezierCurveTo(44, 54, 44, 36, 52, 28); g.bezierCurveTo(62, 18, 84, 18, 96, 26);
    g.bezierCurveTo(100, 30, 100, 36, 94, 38); g.bezierCurveTo(90, 34, 84, 34, 78, 36); g.bezierCurveTo(70, 36, 64, 40, 62, 46);
    g.bezierCurveTo(58, 46, 56, 50, 58, 58); g.closePath();
  }, { ramp: Hr, bevel: 7, amb: 0.22, ink: '#5a3a04', spec: '#fffef0', wet: 0.7 });
  // (the strands of it, combed forward; a darker underside where it curls)
  for (let k = 0; k < 7; k++) { const y0 = 24 + k * 2.5; for (let x = 52 + k; x < 92 - k * 2; x++) if ((x + k * 3) % 9 < 5) p.px(x, y0 + Math.sin((x - 52) / 12) * 2, k % 2 ? Hr[2] : Hr[3]); }
  p.line(84, 35, 94, 37, Hr[1]); p.line(52, 50, 52, 60, Hr[1]);
  for (let k = 0; k < 5; k++) p.line(58 + k * 7, 23, 62 + k * 7, 22, Hr[5]);
}, g => { curtain(g, ART_H); hangingFlag(g, 122, 20); });

export const drawMedal = (ctx: Ctx, t: number, talking: boolean) => {
  ctx.drawImage(medalStill(), 0, 0);
  // The mouth, going while he talks
  if (talking && t % 10 < 5) { ell(ctx, 88, 62, 3, 3, '#500000'); R(ctx, 86, 59, 4, 1, '#e06048'); R(ctx, 86, 64, 4, 1, '#b02c20'); }
  // The medal glinting
  const gl = t % 40;
  if (gl < 8) { const k = gl < 4 ? gl : 8 - gl; R(ctx, 193, 119 - k, 1, 2 * k + 1, C.white); R(ctx, 193 - k, 119, 2 * k + 1, 1, C.white); }
  // (shat: it's coming up off him from below the frame, between the two of them; a fly on its way over to the President)
  if (shatPants()) { stink(ctx, 236, 150, 3, 30, 10, 2); flies(ctx, 140, 96, 26, 1, 2); }
};

/** Ninja Gaiden-style eyes shot: Meathead looks Trump up and down (or, later, the alien: green in them, and a jaw). */
export const drawMeatheadEyes = (ctx: Ctx, t: number, seen: 'president' | 'alien' = 'president') => {
  R(ctx, 0, 0, ART_W, ART_H, C.black);
  const S = RAMP.mSkin;
  // The strip of his face: the brow ridge standing out over the sockets, the sockets in their own shadow, the cheeks
  // under them rounding out, the bridge of the nose lit down the middle
  shaded(ctx, 'eyes-skin2', 0, 36, ART_W, 72, S, (u, v) => {
    const brow = Math.exp(-((v - 0.22) ** 2) / 0.006);
    const socket = Math.exp(-((v - 0.55) ** 2) / 0.02) * (1 - Math.exp(-((u - 0.5) ** 2) / 0.01));
    const nose = Math.exp(-((u - 0.5) ** 2) / 0.0015) * (v > 0.5 ? 1 : 0.3);
    const cheek = Math.exp(-((v - 0.88) ** 2) / 0.02) * Math.exp(-((Math.abs(u - 0.5) - 0.28) ** 2) / 0.02);
    return 0.6 + brow * 0.25 - socket * 0.22 + nose * 0.2 + cheek * 0.14 - Math.abs(v - 0.45) * 0.3;
  });
  // (the odd pore up on the forehead; stubble coming in low on the cheeks, the shade's tone, never a speckle all over)
  for (let i = 0; i < 16; i++) { const x = Math.floor(hash(i * 4.1) * ART_W), y = 44 + Math.floor(hash(i * 5.3) * 14); if (Math.abs(x - 128) > 12) R(ctx, x, y, 1, 1, S[3]); }
  for (let i = 0; i < 44; i++) { const x = Math.floor(hash(i * 1.3) * ART_W), y = 94 + Math.floor(hash(i * 2.7) * 14); if (Math.abs(x - 128) > 32) R(ctx, x, y, 1, 1, S[2]); }
  // The hairline along the top of the strip, ragged, and the forehead's shine under it
  R(ctx, 0, 36, ART_W, 5, C.mHair);
  for (let x = 0; x < ART_W; x += 2) if (hash(x * 0.7) < 0.6) R(ctx, x, 41, 1 + (x % 3 === 0 ? 1 : 0), 1, C.mHair);
  for (let x = 2; x < ART_W; x += 4) R(ctx, x + ((x / 4) % 2), 44, 2, 1, S[5]);
  const drip = (t * 0.5) % 60;
  R(ctx, 111, 46 + drip, 3, 4, 'rgba(255,255,255,0.45)'); R(ctx, 111, 46 + drip, 1, 1, C.white);
  // The vein in his forehead, throbbing
  const throb = t % 16 < 8 ? 1 : 0;
  R(ctx, 120 - throb, 44, 16 + throb * 2, 3, C.vein); R(ctx, 126, 47, 3 + throb, 8, C.vein);
  R(ctx, 121 - throb, 44, 14 + throb * 2, 1, '#8a6a8a');
  // Heavy brows lowering as he takes it in: thick at the inner end and knitted down toward the nose, tapering out
  // to the temples, every hair of them lying the one way, a lit edge along the underside
  const lower = Math.min(4, Math.floor(t / 20));
  for (const [bx, inner] of [[30, 1], [150, -1]] as [number, number][]) {
    for (let k = 0; k < 76; k++) {
      const q = inner > 0 ? k / 75 : 1 - k / 75;
      const th = 6 + Math.round(q * 5), top = 50 + lower - Math.round((1 - q) * 2) + Math.round(q * 3);
      R(ctx, bx + k, top, 1, th, C.mHair);
      if (hash(k * 7.3 + bx) < 0.45) R(ctx, bx + k, top - 1 - Math.floor(hash(k * 3.1 + bx) * 2), 1, 2, C.mHair);
      if (k % 3 === 1) R(ctx, bx + k, top + th - 1, 1, 1, '#3c3c3c');
    }
    for (let k = 0; k < 14; k++) {
      const hx = bx + 3 + Math.floor(hash(k * 5.9 + bx) * 66), hy = 53 + lower + Math.floor(hash(k * 2.3 + bx) * 4);
      R(ctx, hx, hy, 2, 1, '#2e2e2e'); R(ctx, hx + 2 * inner, hy + 1, 1, 1, '#2e2e2e');
    }
  }
  // Eyes: almonds, the top lid heavy over the iris; the pupils drift down (to the belly) and back up, what they're
  // looking at in them, tiny
  const look = t < 30 ? 0 : t < 90 ? Math.min(10, (t - 30) / 3) : Math.max(0, 10 - (t - 90) / 3);
  const ly = Math.round(look * 0.5);
  for (const ex of [68, 188]) {
    const cy = 77;
    const rowHalf = (y: number) => { const d = y - cy; const ry = d < 0 ? 9 : 7; const k = d / ry; return k * k >= 1 ? 0 : 28 * Math.sqrt(1 - k * k); };
    // The white of it, shaded under the lid and into the corners
    for (let dx = -28; dx <= 28; dx++) {
      const u = dx / 28, s = Math.sqrt(Math.max(0, 1 - u * u));
      const top = cy - Math.round(s * 9), bot = cy + Math.round(s * 7);
      if (bot <= top) continue;
      R(ctx, ex + dx, top, 1, bot - top + 1, Math.abs(u) > 0.78 ? '#e4dcd4' : C.white);
      R(ctx, ex + dx, top, 1, 2, '#d4ccc4');
    }
    // (bloodshot: it's been a long morning; a vein or two in from each corner)
    for (const [sx, dir, vy] of [[-26, 1, -2], [-25, 1, 3], [26, -1, -1], [25, -1, 4]] as [number, number, number][]) {
      let x = ex + sx, y = cy + vy;
      for (let k = 0; k < 9; k++) { R(ctx, x, y, 1, 1, '#f09090'); x += dir; if (k % 3 === 2) y += hash(k + sx) < 0.5 ? 1 : -1; if (k === 4) R(ctx, x, y + 1, 1, 1, '#f0a0a0'); }
    }
    // The iris: a dark rim, the blue of it, lighter toward the middle; the pupil; the light in it
    const ix = ex, iy = cy + ly;
    for (let dy = -9; dy <= 9; dy++) {
      const y = iy + dy, hw = Math.floor(rowHalf(y)); if (hw <= 0) continue;
      for (let dx = -9; dx <= 9; dx++) {
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > 9.2 || Math.abs(dx) > hw) continue;
        const c = d > 7.6 ? '#172f78' : d > 4.6 ? (dy < -2 && d < 7 ? '#2d5cc4' : '#2451b8') : '#1d3f96';
        R(ctx, ix + dx, y, 1, 1, c);
      }
    }
    for (let dy = -4; dy <= 4; dy++) {
      const y = iy + dy, hw = Math.floor(rowHalf(y)); if (hw <= 0) continue;
      const r = Math.floor(Math.sqrt(16.5 - dy * dy));
      R(ctx, Math.max(ix - r, ex - hw), y, Math.min(ix + r, ex + hw) - Math.max(ix - r, ex - hw) + 1, 1, C.ink);
    }
    // (the President in them: orange, a yellow swoop on top; or the alien: a little green lump, wider at the bottom)
    if (seen === 'alien') { R(ctx, ix + 1, iy - 1, 2, 1, '#74994e'); R(ctx, ix, iy, 4, 2, '#587f40'); R(ctx, ix + 1, iy + 1, 2, 1, '#e8d84a'); }
    else { R(ctx, ix + 1, iy, 2, 2, C.tSkin); R(ctx, ix, iy - 1, 3, 1, C.tHair); }
    if (rowHalf(iy - 4) > 4) { R(ctx, ix - 4, iy - 4, 2, 2, C.white); R(ctx, ix - 2, iy - 2, 1, 1, '#c8d8ff'); }
    // The lids: the top one heavy, lashes along it, a crease above; the bottom one a thin lit line, the bag under it
    for (let dx = -28; dx <= 28; dx++) {
      const u = dx / 28, s = Math.sqrt(Math.max(0, 1 - u * u));
      const top = cy - Math.round(s * 9), bot = cy + Math.round(s * 7);
      R(ctx, ex + dx, top - 2, 1, 2, S[1]);
      R(ctx, ex + dx, top - 4, 1, 1, S[2]);
      if (Math.abs(u) < 0.95 && (dx + 28) % 4 === 1) R(ctx, ex + dx, top - 4, 1, 2, C.mHair);
      R(ctx, ex + dx, bot + 1, 1, 1, S[2]);
      if (Math.abs(u) < 0.9) R(ctx, ex + dx, bot + 2, 1, 1, S[5]);
      if (Math.abs(u) < 0.85 && (dx + cy) % 2 === 0) R(ctx, ex + dx, bot + 5, 1, 1, S[2]);
      if (Math.abs(u) < 0.7) R(ctx, ex + dx, bot + 6, 1, 1, S[2]);
    }
  }
  // The bridge of his nose: lit down the middle, in shade either side
  R(ctx, 120, 86, 16, 22, S[2]); R(ctx, 123, 86, 10, 22, S[3]); R(ctx, 126, 88, 3, 18, S[4]); R(ctx, 127, 90, 1, 12, S[5]);
  for (let y = 86; y < 108; y += 2) { R(ctx, 120 + (y % 4 === 0 ? 0 : 1), y, 1, 1, S[1]); R(ctx, 135 - (y % 4 === 0 ? 0 : 1), y, 1, 1, S[1]); }
  // (shat: a fly, working its way round his face; he doesn't blink)
  if (shatPants()) flies(ctx, 128, 70, 46, 1, 2);
};

/** Meathead's face, filling the frame (medal round his neck). */
/**
 * Meathead up close. Moods: dumb, disgust; think (eyes rolled up and off to the side, mouth screwed up), stoked (eyes
 * wide, sparkling, a huge grin); fury (brows slammed down into a V, the eyes shrunk to bloodshot slits, teeth bared,
 * flushed, every vein up, steam out of his nose); confused (one brow up, one down, the eyes off in two directions, his
 * mouth hanging open, question marks going round his head); macros (doing the sums: one eye rolled up, one squinting,
 * muttering out of the side of his mouth, the numbers floating round his head); gag (gone green, eyes screwed shut,
 * cheeks puffed out, holding it down); horrified (shaking, white as a sheet, eyes popped with the pupils shrunk to
 * dots, brows up in his hair, mouth hanging open in a scream, sweat flying off him). Where he is (the press room's curtain by default) and
 * whether he's got the medal on.
 */
export type MeatheadMood = 'dumb' | 'disgust' | 'think' | 'stoked' | 'fury' | 'confused' | 'macros' | 'gag' | 'horrified';
export const drawMeatheadCloseUp = (ctx: Ctx, t: number, talking: boolean, mood: MeatheadMood, where: { bg?: (ctx: Ctx) => void; medal?: boolean; pose?: 'flex' | 'gun' } = {}) => {
  if (where.bg) where.bg(ctx); else curtain(ctx, ART_H);
  // (fury: the camera jolts in on him as it cuts)
  const jolt = mood === 'fury' && t < 12 ? (t % 4 < 2 ? 2 : -2) : mood === 'horrified' ? (t % 4 < 2 ? 1 : -1) : 0;
  if (jolt) { ctx.save(); ctx.translate(jolt, 0); }
  // Everything of him that doesn't move: traps, neck, the medal, the head, ears, flat-top, nose, stubble
  ctx.drawImage(closeUpHead(where.medal !== false), 0, 0);
  const S = RAMP.mSkin;
  const open = talking && t % 10 < 5;
  // Brows and eyes
  if (mood === 'disgust') {
    cuBrow(ctx, 98, 123, 42, 48, 4, 7); cuBrow(ctx, 132, 157, 48, 42, 7, 4);
    cuEye(ctx, 111, 57, 9, 3, { lid: 2, px: 1 }); cuEye(ctx, 145, 57, 9, 3, { lid: 2, px: -1 });
  } else if (mood === 'stoked') {
    cuBrow(ctx, 98, 123, 38, 37, 4, 5, 3); cuBrow(ctx, 132, 157, 37, 38, 5, 4, 3);
    cuEye(ctx, 111, 54, 10, 5, { ir: 4, py: 0, sparkle: true }); cuEye(ctx, 145, 54, 10, 5, { ir: 4, py: 0, sparkle: true });
    if (t % 30 < 15) for (const [x, y] of [[95, 42], [161, 42]]) { R(ctx, x, y - 3, 1, 7, C.goldLight); R(ctx, x - 3, y, 7, 1, C.goldLight); R(ctx, x, y, 1, 1, C.white); }
  } else if (mood === 'think') {
    cuBrow(ctx, 98, 123, 41, 40, 4, 5, 2); cuBrow(ctx, 132, 157, 47, 46, 5, 4);
    cuEye(ctx, 111, 56, 9, 4, { px: 5, py: -2 }); cuEye(ctx, 145, 56, 9, 3, { px: 5, py: -2, lid: 1 });
  } else if (mood === 'fury') {
    // Slammed down into a V, thick, knotted over the nose; the furrow between them; the eyes shrunk to bloodshot slits
    cuBrow(ctx, 96, 124, 38, 50, 5, 8); cuBrow(ctx, 132, 160, 50, 38, 8, 5);
    R(ctx, 126, 44, 1, 10, S[2]); R(ctx, 129, 44, 1, 10, S[2]); R(ctx, 127, 42, 2, 2, S[2]); R(ctx, 127, 44, 1, 8, S[5]);
    cuEye(ctx, 112, 56, 9, 2, { ir: 2, px: 1, red: true, pin: true }); cuEye(ctx, 144, 56, 9, 2, { ir: 2, px: -1, red: true, pin: true });
  } else if (mood === 'macros') {
    cuBrow(ctx, 98, 123, 39, 41, 4, 5, 2); cuBrow(ctx, 132, 157, 50, 46, 6, 4);
    cuEye(ctx, 111, 54, 9, 4, { px: 4, py: -2 }); cuEye(ctx, 145, 57, 9, 2, { px: -1, lid: 1 });
  } else if (mood === 'gag') {
    // Knitted up in the middle, pained; the eyes screwed shut, creased at the corners, watering
    cuBrow(ctx, 98, 123, 47, 41, 4, 6); cuBrow(ctx, 132, 157, 41, 47, 6, 4);
    R(ctx, 126, 40, 1, 8, S[2]); R(ctx, 129, 40, 1, 8, S[2]);
    for (const [ex, d] of [[111, 1], [145, -1]] as const) {
      for (let k = -8; k <= 8; k++) { const y = 56 - Math.round((1 - (k / 8) ** 2) * 2 * d) + (d < 0 ? -2 : 0); R(ctx, ex + k, y + 2, 1, 2, FIG_INK); R(ctx, ex + k, y + 4, 1, 1, S[5]); }
      for (const s of [-1, 1]) { R(ctx, ex + s * 11, 53, 3, 1, S[2]); R(ctx, ex + s * 12, 56, 3, 1, S[2]); R(ctx, ex + s * 11, 59, 3, 1, S[2]); }
    }
    const tear = (t * 0.5) % 24; R(ctx, 120, 60 + tear, 2, 3, '#bfe4fc'); R(ctx, 120, 60 + tear, 1, 1, C.white);
  } else if (mood === 'horrified') {
    // Up in his hair, arched; his forehead creased under them; the eyes popped, the pupils shrunk to dots
    cuBrow(ctx, 98, 123, 34, 34, 4, 4, 3); cuBrow(ctx, 132, 157, 34, 34, 4, 4, 3);
    for (let k = 0; k < 2; k++) for (let x = 106; x < 150; x++) R(ctx, x, 40 + k * 3 + Math.round(Math.sin((x - 106) / 44 * Math.PI) * -1), 1, 1, S[3]);
    cuEye(ctx, 111, 52, 11, 7, { ir: 2, pin: true, red: true }); cuEye(ctx, 145, 52, 11, 7, { ir: 2, pin: true, red: true });
  } else if (mood === 'confused') {
    const wob = t % 24 < 12 ? 0 : 1;
    cuBrow(ctx, 98, 123, 37 + wob, 37 + wob, 4, 5, 4); cuBrow(ctx, 132, 157, 46, 48, 5, 4);
    cuEye(ctx, 111, 53, 9, 5, { px: -5, py: -3 + (t % 40 < 20 ? 0 : 1) }); cuEye(ctx, 145, 57, 8, 2, { px: -4, py: 1, lid: 1 });
  } else {
    cuBrow(ctx, 98, 123, 45, 44, 4, 6); cuBrow(ctx, 132, 157, 44, 45, 6, 4);
    cuEye(ctx, 111, 57, 9, 3, { lid: 1 }); cuEye(ctx, 145, 57, 9, 3, { lid: 1 });
  }
  // Mouth
  if (mood === 'disgust') {
    // Lip curled, tongue out: "bleh"
    cuLine(ctx, 112, 144, 85, k => (k > 0.7 ? -(k - 0.7) * 16 : 0));
    cuOpen(ctx, 116, 85, 16, 3, {});
    cuTongue(ctx, 118, 86, 12, 9);
  } else if (mood === 'stoked') {
    // A huge grin, open when he's talking
    cuOpen(ctx, 106, 80, 44, open ? 14 : 10, { top: true, bottom: !open, tongue: open, grin: true });
    for (const s of [-1, 1]) { R(ctx, 128 + s * 24 - (s < 0 ? 2 : 0), 76, 3, 1, S[2]); R(ctx, 128 + s * 26 - (s < 0 ? 1 : 0), 77, 2, 4, S[2]); }
  } else if (mood === 'think') {
    // Mouth screwed up to one side
    cuLine(ctx, 124, 144, 87, k => -Math.max(0, k - 0.6) * 10);
    R(ctx, 146, 82, 2, 3, S[2]);
  } else if (mood === 'fury') {
    // Lips pulled back off his teeth: gritted, or roaring it, spit flying
    if (open) {
      cuOpen(ctx, 108, 78, 40, 16, { top: true, bottom: true, tongue: true });
      for (let k = 0; k < 4; k++) { const sx = 150 + ((t * 3 + k * 7) % 22), sy = 82 + Math.sin(k * 2.1 + t) * 6; R(ctx, sx, sy, 2, 1, '#eef4ff'); R(ctx, sx, sy, 1, 1, C.white); }
    } else cuOpen(ctx, 106, 79, 44, 10, { top: true, bottom: true, gritted: true });
  } else if (mood === 'macros') {
    // Screwed off to one side, muttering the numbers
    if (open) cuOpen(ctx, 128, 84, 18, 5, {}); else cuLine(ctx, 126, 146, 86, k => -Math.max(0, k - 0.7) * 10);
  } else if (mood === 'gag') {
    // Cheeks puffed out, lips clamped in a wavy line holding it down (and when he talks, it nearly comes up)
    shaded(ctx, 'mh-puffL', 98, 74, 20, 18, RAMP.mSkin, ball(-0.5, -0.5, 0.2));
    shaded(ctx, 'mh-puffR', 138, 74, 20, 18, RAMP.mSkin, ball(-0.7, -0.4, 0.12));
    if (open) { cuOpen(ctx, 116, 82, 24, 9, {}); R(ctx, 118, 86, 20, 4, '#9ab040'); R(ctx, 120, 86, 14, 1, '#c8d878'); R(ctx, 124, 90, 2, 6, '#c8d878'); }
    else for (let k = 0; k < 24; k++) { const y = 85 + Math.round(Math.sin(k * 0.8) * 1.2); R(ctx, 116 + k, y, 1, 1, '#5a1a10'); R(ctx, 116 + k, y + 1, 1, 1, '#a0442c'); R(ctx, 116 + k, y - 1, 1, 1, S[3]); }
  } else if (mood === 'horrified') {
    // Hanging open, long: a scream with no sound in it yet
    cuOpen(ctx, 115, 76, 26, open ? 17 : 14, { top: true, tongue: true, round: true });
  } else if (mood === 'confused') {
    // Hanging open, slack, off to one side; the tip of his tongue
    cuOpen(ctx, 116, 84, 22, open ? 11 : 8, { top: true, tongue: true });
    R(ctx, 112, 84, 4, 1, '#5a1a10');
  } else if (open) {
    cuOpen(ctx, 114, 82, 28, 10, { top: true, tongue: true });
  } else {
    cuLine(ctx, 114, 142, 87, k => Math.round(Math.sin(k * Math.PI) * -0.6));
  }
  if (mood === 'fury') furyOver(ctx, t);
  if (mood === 'confused') confusedOver(ctx, t);
  if (mood === 'macros') macrosOver(ctx, t);
  if (mood === 'gag') gagOver(ctx, t);
  if (mood === 'horrified') horrifiedOver(ctx, t);
  if (jolt) ctx.restore();
  if (where.pose === 'flex') drawDoubleBiceps(ctx, t);
  if (where.pose === 'gun') drawHandgunUp(ctx, t);
  if (shatPants()) shatCloseUp(ctx);
};

/**
 * The still part of the close-up, painted once (with and without the medal): the traps and the tops of his pecs, the
 * neck like a tree trunk with its cords standing out, the medal's ribbon round it, the head (a block, the jaw square,
 * rounded off at the sides), the ears, the flat-top (its top flat and catching the light, the bristles, the line of
 * it dead straight across his forehead), the nose, the vein at his temple, stubble over the jaw and the lip.
 */
const closeUpHead = (medal: boolean) => painting(`mh-closeup-${medal ? 1 : 0}`, ART_W, ART_H, p => {
  const S = RAMP.mSkin, Hm = RAMP.mHair, I = FIG_INK;
  // The traps and shoulders, off the bottom and the sides; the tops of the pecs, the collarbones
  // (the traps run up the sides of his neck and slope off to the shoulders)
  p.form(g => { g.moveTo(-6, 150); g.lineTo(-6, 136); g.bezierCurveTo(30, 128, 66, 118, 98, 100); g.lineTo(158, 100); g.bezierCurveTo(190, 118, 226, 128, 262, 136); g.lineTo(262, 150); g.closePath(); },
    { ramp: S, bevel: 30, amb: 0.12, ink: I });
  for (const s of [-1, 1]) {
    // (the collarbone, a ridge: lit along its top, shadow under)
    for (let k = 0; k < 34; k++) { const x = 128 + s * (12 + k), y = 132 + Math.round(k * 0.12 + (k * k) / 500); p.px(x, y + 1, S[2]); p.px(x, y, S[3]); p.px(x, y - 1, S[6]); }
  }
  p.line(128, 135, 128, 144, S[2]); p.line(127, 137, 127, 144, S[3]);
  // The neck: wider at the bottom than his jaw
  p.form(g => { g.moveTo(102, 86); g.lineTo(154, 86); g.bezierCurveTo(156, 102, 160, 114, 168, 124); g.bezierCurveTo(144, 132, 112, 132, 88, 124); g.bezierCurveTo(96, 114, 100, 102, 102, 86); g.closePath(); },
    { ramp: S, bevel: 14, amb: 0.14, ink: I, inkIn: S[1] });
  // (the cords down from behind the ears to the notch of his collarbones, each a ridge lit on its left)
  for (const [x0, x1] of [[104, 123], [152, 133]] as const) for (let k = 0; k <= 24; k++) { const x = Math.round(x0 + ((x1 - x0) * k) / 24), y = 100 + k; p.px(x, y, S[2]); p.px(x - 1, y, S[5]); }
  p.disc(128, 127, 4, 2, S[2]);
  // (the shadow his jaw throws down it)
  for (let x = 96; x < 162; x++) for (let y = 96; y < 112; y++) if (p.painted(x, y) && bayer(x, y) + 0.5 < 0.9 - (y - 96) / 14) p.px(x, y, y < 101 ? S[1] : S[2]);
  if (medal) {
    // The ribbon: from behind his neck at either side, down across the traps in a V to the medal
    const rib = (path: (g: Ctx) => void) => p.form(p.strokeMask(path, 7), { ramp: RIBBON, bevel: 2, amb: 0.3, ink: I });
    rib(g => { g.moveTo(98, 110); g.quadraticCurveTo(104, 128, 124, 134); });
    rib(g => { g.moveTo(158, 110); g.quadraticCurveTo(152, 128, 132, 134); });
    for (const s of [-1, 1]) for (let k = 0; k < 14; k++) p.px(128 + s * (26 - k * 1.2) - (s > 0 ? 0 : 0), 114 + k, RIBBON[5]);
    // The medal: the clasp, a gold disc, a white star on it, red at its heart
    p.form(g => { g.rect(124, 131, 8, 6); }, { ramp: RAMP.gold, bevel: 2, ink: I });
    p.form(g => { g.arc(128, 142, 9, 0, Math.PI * 2); }, { ramp: RAMP.gold, bevel: 4, ink: I, spec: '#fffff0', wet: 0.8 });
    p.form(g => { for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? 3 : 7; g.lineTo(128 + Math.cos(a) * r, 142 + Math.sin(a) * r); } g.closePath(); },
      { ramp: ['#8090b0', '#b8c4dc', '#e4e8f4', '#ffffff'], bevel: 2, ink: '#5c3c00' });
    p.disc(128, 142, 1.5, 1.5, '#d82800');
  }
  // The ears, out from the sides of his head: the rim, the fold inside
  for (const [ex, s] of [[87, -1], [169, 1]] as const) {
    p.form(g => { g.ellipse(ex, 58, 6, 11, s * 0.08, 0, Math.PI * 2); }, { ramp: S, bevel: 4, amb: s < 0 ? 0.2 : 0.1, ink: I });
    p.line(ex + s, 51, ex + s, 64, S[2]); p.line(ex + s * 2, 52, ex + s * 2, 63, S[1]); p.line(ex, 50, ex, 52, S[5]); p.px(ex + s, 66, S[2]);
  }
  // The head: a block, the jaw square, the sides rounding off
  p.form(g => {
    g.moveTo(94, 24); g.lineTo(162, 24); g.bezierCurveTo(166, 40, 167, 58, 166, 74); g.lineTo(164, 92); g.bezierCurveTo(160, 100, 152, 106, 140, 108);
    g.lineTo(116, 108); g.bezierCurveTo(104, 106, 96, 100, 92, 92); g.lineTo(90, 74); g.bezierCurveTo(89, 58, 90, 40, 94, 24); g.closePath();
  }, { ramp: S, bevel: 18, amb: 0.2, ink: I, inkIn: S[1] });
  // (the brow ridge: the light along it, the sockets under it a step darker)
  for (const ex of [111, 145]) for (let y = 49; y < 64; y++) for (let x = ex - 13; x <= ex + 13; x++) {
    const d = ((x - ex) / 13) ** 2 + ((y - 56) / 7.5) ** 2;
    if (d < 1 && bayer(x, y) + 0.5 < 0.85 - d * 0.6) p.px(x, y, ex < 128 ? S[4] : S[3]);
  }
  // (under the cheekbones, the hollow; the jaw's corners; the temples)
  for (const s of [-1, 1]) for (let y = 70; y < 84; y++) for (let x = 128 + s * 22; s < 0 ? x > 96 : x < 160; x += s) {
    const d = (Math.abs(x - 128) - 30) / 8, e = (y - 76) / 6;
    if (d * d + e * e < 1 && bayer(x, y) + 0.5 < 0.5 - (d * d + e * e) * 0.4) p.px(x, y, S[3]);
  }
  for (let y = 30; y < 46; y++) for (let x = 151; x < 162; x++) if (bayer(x, y) + 0.5 < 0.5) p.px(x, y, S[3]);
  // The flat-top: dead flat on top (catching the lights), the sides square, the sideburns, every bristle stood up
  p.form(g => { g.moveTo(87, 46); g.lineTo(87, 9); g.quadraticCurveTo(87, 4, 92, 4); g.lineTo(164, 4); g.quadraticCurveTo(169, 4, 169, 9); g.lineTo(169, 46); g.lineTo(164, 46); g.lineTo(163, 30); g.lineTo(93, 30); g.lineTo(92, 46); g.closePath(); },
    { ramp: Hm, bevel: 5, amb: 0.3, ink: I, gain: 1.15 });
  for (let x = 89; x < 168; x++) {
    p.px(x, 5, x < 128 ? '#5a5a68' : '#4a4a56'); p.px(x, 6, (x & 1) ? '#3a3a44' : '#4a4a56');
    if ((x & 1) === 0) { p.line(x, 8, x, 28, x < 110 ? '#2c2c34' : '#222228'); p.px(x, 7, '#5a5a68'); }
  }
  p.line(88, 9, 88, 44, '#3a3a44');
  p.rect(93, 29, 70, 1, '#050505');
  for (let x = 93; x < 163; x++) if (bayer(x, 30) + 0.5 < 0.6) p.px(x, 30, S[2]);
  for (let x = 93; x < 163; x++) if (bayer(x, 31) + 0.5 < 0.25) p.px(x, 31, S[3]);
  // The vein at his temple, standing up: the dark under it, the red, the light along its top
  const vein = [[105, 32], [105, 33], [105, 34], [105, 35], [106, 36], [106, 37], [106, 38], [107, 39], [108, 39], [109, 40], [110, 40], [111, 40]];
  for (const [x, y] of vein) { p.px(x + 1, y + 1, S[2]); p.rect(x, y, 2, 1, '#c84838'); }
  for (const [x, y] of vein.slice(0, 7)) p.px(x, y, '#f08070');
  // The nose: the bridge lit down its left, the shadow side, the ball of it, the nostrils, the shadow under
  p.line(126, 56, 125, 70, S[6]); p.line(127, 58, 127, 70, S[5]);
  p.line(130, 58, 131, 71, S[3]); p.line(131, 60, 132, 70, S[2]);
  p.form(g => { g.ellipse(128, 72, 7, 4.5, 0, 0, Math.PI * 2); }, { ramp: S, bevel: 4, amb: 0.2, ink: null });
  p.form(g => { g.ellipse(120.5, 73.5, 3, 2.5, 0, 0, Math.PI * 2); g.moveTo(138.5, 73.5); g.ellipse(135.5, 73.5, 3, 2.5, 0, 0, Math.PI * 2); }, { ramp: S, bevel: 2, amb: 0.2, ink: null });
  p.rect(121, 75, 4, 1, '#4a2410'); p.rect(132, 75, 4, 1, '#4a2410'); p.px(122, 74, '#6a3a18'); p.px(133, 74, '#6a3a18');
  p.line(118, 76, 138, 76, S[2]); p.line(120, 77, 136, 77, S[3]);
  p.px(124, 70, S[7]); p.px(125, 70, S[7]);
  // (the groove down to the lip)
  p.line(126, 78, 126, 81, S[3]); p.line(130, 78, 130, 81, S[3]); p.line(128, 79, 128, 81, S[5]);
  // Stubble: over the jaw and the lip, the shade's tone in a scatter, thick low and thinning up the cheeks
  for (let y = 66; y < 108; y++) for (let x = 92; x < 165; x++) {
    if (!p.painted(x, y)) continue;
    const side = Math.max(0, Math.abs(x - 128) - 26) / 12, low = (y - 78) / 22;
    const dens = Math.min(0.6, Math.max(side * 0.5, low) * 0.6);
    if (y < 84 && Math.abs(x - 128) < 30) continue;
    if (y < 80) continue;
    if (Math.abs(x - 128) < 12 && y < 82) continue;
    if (hash(x * 0.71 + y * 1.37) < dens && (x + y) % 2 === 0) p.px(x, y, (x * 3 + y) % 5 ? '#8c5c30' : '#6a4020');
  }
  // The chin: the cleft, the light on either side of it
  p.line(128, 99, 128, 105, S[2]); p.px(127, 104, S[2]); p.line(126, 99, 126, 103, S[5]);
});

/** A brow: thick hair from (x0, y0) to (x1, y1), `t0` to `t1` deep, `arch` px up in the middle. */
const cuBrow = (ctx: Ctx, x0: number, x1: number, y0: number, y1: number, t0: number, t1: number, arch = 0) => {
  const Hm = RAMP.mHair, S = RAMP.mSkin;
  for (let x = x0; x <= x1; x++) {
    const k = (x - x0) / Math.max(1, x1 - x0);
    const top = Math.round(y0 + (y1 - y0) * k - Math.sin(k * Math.PI) * arch), th = Math.max(2, Math.round(t0 + (t1 - t0) * k));
    R(ctx, x, top, 1, th, Hm[1]);
    // (the hairs: stray ones up off the top, a lighter one through it, the skin lit under it)
    if (hash(x * 1.7 + y0) < 0.45) R(ctx, x, top - 1, 1, 1, Hm[0]);
    if (x % 3 === 1) R(ctx, x, top + 1, 1, Math.max(1, th - 3), '#34343e');
    R(ctx, x, top + th, 1, 1, S[3]);
  }
};

/**
 * An eye, (cx, cy) its middle, `hw` x `hh` its half-width and half-height: the white, shaded under the lid; the
 * iris (blue), the pupil, the light in it; the lid line over it, the lower lid. `px`, `py`: where he's looking. `lid`:
 * how many rows the top lid's down over it. `red`: bloodshot. `pin`: the pupils shrunk to a point. `sparkle`: two lights.
 */
const cuEye = (ctx: Ctx, cx: number, cy: number, hw: number, hh: number, o: { px?: number; py?: number; ir?: number; lid?: number; red?: boolean; pin?: boolean; sparkle?: boolean } = {}) => {
  const S = RAMP.mSkin;
  const half = (dy: number) => Math.round(hw * Math.sqrt(Math.max(0, 1 - (dy / (hh + 0.6)) ** 2)));
  const inEye = (x: number, y: number) => Math.abs(y - cy) <= hh && Math.abs(x - cx + 0.5) < half(y - cy);
  const lid = o.lid ?? 0, top = cy - hh + lid;
  for (let dy = -hh + lid; dy <= hh; dy++) { const w = half(dy); if (w > 0) R(ctx, cx - w, cy + dy, w * 2, 1, cy + dy === top ? '#c8b8a8' : Math.abs(dy) === hh ? '#e4d8cc' : '#f4ece0'); }
  if (o.red) for (const [s, dy] of [[-1, 0], [1, -1], [1, 1]] as const) { const w = half(dy); R(ctx, cx + s * (w - 3) - (s < 0 ? 0 : 0), cy + dy, 3, 1, '#e06060'); }
  // The iris
  const ir = o.ir ?? 3, ix = cx + (o.px ?? 0), iy = cy + (o.py ?? 0);
  for (let y = iy - ir; y <= iy + ir; y++) for (let x = ix - ir; x <= ix + ir; x++) {
    if (y < top || !inEye(x, y)) continue;
    const d = Math.hypot(x - ix, y - iy); if (d > ir + 0.3) continue;
    const pupil = o.pin ? d < 0.8 : d < ir * 0.5;
    R(ctx, x, y, 1, 1, pupil ? FIG_INK : d > ir - 0.8 ? '#122a64' : y > iy ? '#3c78dc' : '#2a5cc0');
  }
  if (!o.pin && inEye(ix - 1, iy - 1) && iy - 1 >= top) R(ctx, ix - 1, iy - 1, 1, 1, C.white);
  if (o.sparkle) { R(ctx, ix - 2, iy - 2, 2, 2, C.white); R(ctx, ix + 1, iy + 1, 1, 1, C.white); }
  // The lid down over it, the line along it (heavy, lashes at the outer corner), the lower lid
  for (let dy = -hh; dy < -hh + lid; dy++) { const w = half(dy); if (w > 0) R(ctx, cx - w, cy + dy, w * 2, 1, S[4]); }
  for (let dx = -hw - 1; dx <= hw; dx++) {
    const w = Math.abs(dx + 0.5) / (hw + 0.5), y = Math.round(top - 1 - (lid ? 0 : Math.sqrt(Math.max(0, 1 - w * w)) * 0.5));
    R(ctx, cx + dx, y, 1, w < 0.75 ? 2 : 1, FIG_INK);
  }
  const outer = cx < 128 ? -1 : 1;
  R(ctx, cx + outer * (hw + 1) - (outer < 0 ? 1 : 0), top - 2, 2, 1, FIG_INK);
  for (let dx = -hw + 2; dx < hw - 1; dx++) R(ctx, cx + dx, cy + hh + 1, 1, 1, S[3]);
  for (let dx = -hw + 3; dx < hw - 2; dx++) R(ctx, cx + dx, cy + hh + 2, 1, 1, S[6]);
};

const LIP = '#a0442c', LIP_D = '#5a1a10', MOUTH = '#3a0606', TOOTH = '#f4ecdc', TOOTH_S = '#c8bca8', TONGUE = '#c84858';
/** A shut mouth: the line between the lips from x0 to x1 at y (bent by `bend(k)`, 0..1 along it), the lower lip lit. */
const cuLine = (ctx: Ctx, x0: number, x1: number, y: number, bend: (k: number) => number = () => 0) => {
  const S = RAMP.mSkin;
  for (let x = x0; x <= x1; x++) {
    const k = (x - x0) / (x1 - x0), yy = Math.round(y + bend(k)), edge = k < 0.08 || k > 0.92;
    R(ctx, x, yy - 1, 1, 1, edge ? S[3] : '#8a3a24'); R(ctx, x, yy, 1, 1, LIP_D);
    if (!edge) { R(ctx, x, yy + 1, 1, 1, LIP); R(ctx, x, yy + 2, 1, 1, S[5]); R(ctx, x, yy + 3, 1, 1, S[3]); }
  }
  R(ctx, x0 - 1, Math.round(y + bend(0)) - 1, 1, 2, S[2]); R(ctx, x1 + 1, Math.round(y + bend(1)) - 1, 1, 2, S[2]);
};
/**
 * An open mouth in the box (x, y, w, h): dark inside, the corners cut round, the lips round it; `top`/`bottom` teeth
 * (`gritted`: shut together), the `tongue` in the bottom of it, `grin` (wide at the top, curving up at the corners),
 * `round` (an O).
 */
const cuOpen = (ctx: Ctx, x: number, y: number, w: number, h: number, o: { top?: boolean; bottom?: boolean; tongue?: boolean; gritted?: boolean; grin?: boolean; round?: boolean }) => {
  const S = RAMP.mSkin;
  const inset = (r: number) => {
    const fromTop = r, fromBot = h - 1 - r;
    if (o.round) { const v = (r - (h - 1) / 2) / ((h - 1) / 2 + 0.5); return Math.round((w / 2) * (1 - Math.sqrt(Math.max(0, 1 - v * v)))); }
    if (o.grin) return Math.round((r / Math.max(1, h - 1)) ** 2 * w * 0.22);
    return Math.max(0, 3 - Math.min(fromTop, fromBot) * 1.5) | 0;
  };
  for (let r = 0; r < h; r++) { const i = inset(r); R(ctx, x + i, y + r, w - i * 2, 1, MOUTH); }
  if (o.tongue && h > 5) { const tw = Math.round(w * 0.6), tx = x + Math.round((w - tw) / 2); cuTongue(ctx, tx, y + h - Math.min(5, Math.round(h / 2)), tw, Math.min(5, Math.round(h / 2)), true); }
  const teeth = (ty: number, th: number, upper: boolean) => {
    for (let k = 0; k < w; k++) {
      const r = upper ? 0 : h - 1, i = inset(upper ? Math.min(h - 1, ty - y) : r);
      const xx = x + k; if (xx < x + i || xx >= x + w - i) continue;
      R(ctx, xx, ty, 1, th, TOOTH); R(ctx, xx, upper ? ty + th - 1 : ty, 1, 1, TOOTH_S);
      if ((k + 2) % 5 === 0) R(ctx, xx, ty, 1, th, TOOTH_S);
    }
  };
  if (o.gritted) {
    for (let r = 0; r < h; r++) { const i = inset(r); R(ctx, x + i, y + r, w - i * 2, 1, r === Math.floor(h / 2) ? '#7a6a58' : TOOTH); }
    for (let k = 3; k < w - 2; k += 4) R(ctx, x + k, y + 1, 1, h - 2, TOOTH_S);
    R(ctx, x + 2, y + h - 2, w - 4, 1, TOOTH_S);
  } else {
    if (o.top) teeth(y, Math.max(2, Math.min(4, Math.round(h * 0.28))), true);
    if (o.bottom) teeth(y + h - Math.max(2, Math.round(h * 0.22)), Math.max(2, Math.round(h * 0.22)), false);
  }
  // The lips round it: the upper dark, the lower lit, the skin's shadow under it
  for (let r = -1; r <= h; r++) {
    const i = inset(Math.max(0, Math.min(h - 1, r)));
    if (r === -1 || r === h) { R(ctx, x + i, y + r, w - i * 2, 1, r < 0 ? LIP_D : LIP); continue; }
    R(ctx, x + i - 1, y + r, 1, 1, LIP_D); R(ctx, x + w - i, y + r, 1, 1, LIP_D);
  }
  R(ctx, x + inset(h - 1) + 1, y + h + 1, w - inset(h - 1) * 2 - 2, 1, S[5]);
  R(ctx, x + inset(h - 1) + 2, y + h + 2, w - inset(h - 1) * 2 - 4, 1, S[3]);
  R(ctx, x + inset(0), y - 2, w - inset(0) * 2, 1, '#8a3a24');
};
/** A tongue: the pink of it, darker down its middle and at the bottom, lit on top. */
const cuTongue = (ctx: Ctx, x: number, y: number, w: number, h: number, inside = false) => {
  for (let r = 0; r < h; r++) {
    const v = inside ? 0 : Math.max(0, (r - h + 3) / 3), i = Math.round(v * w * 0.25);
    R(ctx, x + i, y + r, w - i * 2, 1, r === 0 ? '#e87888' : r === h - 1 && !inside ? '#8a2030' : TONGUE);
  }
  R(ctx, x + Math.floor(w / 2), y + 1, 1, Math.max(1, h - 2), '#a03040');
  if (!inside) { R(ctx, x - 1, y, 1, h - 1, LIP_D); R(ctx, x + w, y, 1, h - 1, LIP_D); }
};

/** Fury, over the top of him: flushed red (dithered), the veins up all over his head and neck, steam out of his nose. */
const furyOver = (ctx: Ctx, t: number) => {
  const throb = t % 12 < 6 ? 1 : 0;
  // (the flush, coming up out of his collar, in a checker so it stays pixels)
  for (let y = 40; y < 104; y++) for (let x = 92 + (y % 2); x < 164; x += 2) {
    if (y < 60 && (x > 118 && x < 138)) continue;
    if (hash(x * 0.37 + y * 1.71) < 0.5 + (y - 40) / 128) R(ctx, x, y, 1, 1, 'rgba(220, 40, 20, 0.22)');
  }
  // Veins: up both temples and branching over the forehead, down the neck into the traps; throbbing
  const V = (pts: number[][]) => { for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let k = 0; k <= n; k++) R(ctx, x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n, 2 + throb, 2 + throb, C.vein); } };
  V([[100, 46], [104, 38], [108, 32], [112, 30]]); V([[104, 38], [100, 32]]);
  V([[156, 46], [152, 38], [146, 32], [142, 30]]); V([[152, 38], [158, 32]]);
  V([[124, 34], [127, 40], [126, 44]]);
  V([[106, 102], [104, 112], [100, 122]]); V([[150, 102], [152, 112], [156, 122]]);
  R(ctx, 104, 36, 4, 1, '#ff8a8a'); R(ctx, 150, 36, 4, 1, '#ff8a8a');
  // Steam out of his nostrils in two jets, puffs rolling off them
  for (const side of [-1, 1]) {
    for (let k = 0; k < 4; k++) {
      const p = ((t * 1.5 + k * 9) % 36) / 36;
      const px = 128 + side * (6 + p * 34), py = 76 + p * 10, r = 2 + p * 6;
      ctx.fillStyle = `rgba(240, 240, 250, ${0.75 - p * 0.6})`;
      for (let yy = -Math.floor(r); yy <= r; yy++) { const w = Math.round(Math.sqrt(Math.max(0, r * r - yy * yy))); ctx.fillRect(Math.round(px - w), Math.round(py + yy), w * 2, 1); }
    }
  }
};

/** A tiny 3 x 5 pixel font for the sums over his head. */
const SUM_FONT: Record<string, string> = {
  '0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '3': '111001111001111', '4': '101101111001001',
  '5': '111100111001111', '6': '111100111101111', '7': '111001010010010', '8': '111101111101111', '9': '111101111001111',
  G: '111100101101111', X: '101101010101101', '=': '000111000111000', '+': '000010111010000', '-': '000000111000000', '?': '111001011000010',
};
const sumText = (ctx: Ctx, s: string, x: number, y: number, c: string) => {
  for (let i = 0; i < s.length; i++) {
    const f = SUM_FONT[s[i]];
    if (!f) continue;
    for (let k = 0; k < 15; k++) if (f[k] === '1') { R(ctx, x + i * 4 + (k % 3) + 1, y + Math.floor(k / 3) + 1, 1, 1, C.ink); R(ctx, x + i * 4 + (k % 3), y + Math.floor(k / 3), 1, 1, c); }
  }
};

/** Macros, over the top of him: the sums floating up off his head, one after another, never adding up. */
const macrosOver = (ctx: Ctx, t: number) => {
  const sums = ['60G', 'X8', '+90G', '=0', '-?', '480G'];
  for (let i = 0; i < 4; i++) {
    const p = ((t * 0.7 + i * 30) % 120) / 120, k = Math.floor((t * 0.7 + i * 30) / 120) + i;
    const x = [44, 172, 58, 186][i] + Math.round(Math.sin(p * 6 + i) * 3), y = 44 - Math.round(p * 34) + (i % 2) * 14;
    if (p < 0.85) sumText(ctx, sums[k % sums.length], x, y, i % 2 ? C.white : C.goldLight);
  }
};

/** Gag, over the top of him: gone green from the collar up (dithered), sweat running at his temples. */
const gagOver = (ctx: Ctx, t: number) => {
  for (let y = 30; y < 104; y++) for (let x = 90 + (y % 2); x < 166; x += 2) if (hash(x * 0.53 + y * 1.37) < 0.25 + (y - 30) / 110) R(ctx, x, y, 1, 1, 'rgba(120, 190, 60, 0.3)');
  for (const [x, y0, s] of [[94, 40, 0], [160, 44, 11]] as const) { const d = ((t + s) * 0.5) % 26; R(ctx, x, y0 + d, 2, 3, 'rgba(220, 240, 255, 0.7)'); R(ctx, x, y0 + d, 1, 1, C.white); }
};

/** Horrified, over the top of him: the blood gone out of his face (pale from the top down), sweat flying off him. */
const horrifiedOver = (ctx: Ctx, t: number) => {
  for (let y = 26; y < 80; y++) for (let x = 90 + (y % 2); x < 166; x += 2) if (hash(x * 0.71 + y * 1.13) < 0.55 - (y - 26) / 110) R(ctx, x, y, 1, 1, 'rgba(200, 230, 255, 0.28)');
  for (let k = 0; k < 6; k++) {
    const p = ((t * 1.2 + k * 11) % 30) / 30, side = k % 2 ? 1 : -1;
    const x = 128 + side * (40 + p * 30 + k * 2), y = 30 + k * 6 - p * 10 + p * p * 20;
    R(ctx, x, y, 2, 2, 'rgba(220, 240, 255, 0.8)'); R(ctx, x, y, 1, 1, C.white);
  }
};

/** Confused, over the top of him: question marks going round his head, bobbing. */
const confusedOver = (ctx: Ctx, t: number) => {
  const rows = ['.####.', '##..##', '....##', '...##.', '..##..', '..##..', '......', '..##..'];
  const q = (x: number, y: number, c: string) => {
    // A pixel question mark with a dark edge
    for (const [dx, dy, col] of [[1, 1, C.ink], [0, 0, c]] as [number, number, string][]) {
      for (let r = 0; r < rows.length; r++) for (let k = 0; k < 6; k++) if (rows[r][k] === '#') R(ctx, x + k + dx, y + r + dy, 1, 1, col);
    }
  };
  for (let i = 0; i < 3; i++) {
    const a = t * 0.05 + (i / 3) * Math.PI * 2;
    q(Math.round(128 + Math.cos(a) * 62 - 3), Math.round(12 + Math.sin(a) * 8), i === 1 ? C.white : C.gold);
  }
};

/**
 * The light off a tapered limb: a capsule from (x0, y0), r0 thick, to (x1, y1), r1 thick (picture coordinates), for a
 * box at (bx, by) w x h; lit from up and to the left like everything else.
 */
const limbLight = (bx: number, by: number, w: number, h: number, x0: number, y0: number, r0: number, x1: number, y1: number, r1: number, amb = 0.13) => {
  const lx = -0.45, ly = -0.6, lz = Math.sqrt(1 - lx * lx - ly * ly);
  const dx = x1 - x0, dy = y1 - y0, l2 = dx * dx + dy * dy || 1;
  return (u: number, v: number) => {
    const px = bx + u * w, py = by + v * h;
    const k = Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / l2));
    const r = r0 + (r1 - r0) * k, nx = (px - (x0 + dx * k)) / r, ny = (py - (y0 + dy * k)) / r, d = nx * nx + ny * ny;
    if (d > 1) return -1;
    return amb + (1 - amb) * Math.max(0, nx * lx + ny * ly + Math.sqrt(1 - d) * lz);
  };
};

/** A tapered limb, shaded (see limbLight). */
const limb = (ctx: Ctx, key: string, x0: number, y0: number, r0: number, x1: number, y1: number, r1: number) => {
  const bx = Math.floor(Math.min(x0 - r0, x1 - r1)), by = Math.floor(Math.min(y0 - r0, y1 - r1));
  const w = Math.ceil(Math.max(x0 + r0, x1 + r1)) - bx, h = Math.ceil(Math.max(y0 + r0, y1 + r1)) - by;
  shaded(ctx, key, bx, by, w, h, RAMP.mSkin, limbLight(bx, by, w, h, x0, y0, r0, x1, y1, r1));
};

/**
 * The double biceps, either side of his head: the upper arms out level from the shoulders, the deltoids capping them,
 * the biceps peaked up off them like a mountain range; the forearms back up from the elbows, thick at the elbow and
 * tapering, leaning in, the fists up by his ears, knuckles in, the wristbands; the triceps hanging under. His guns.
 */
const drawDoubleBiceps = (ctx: Ctx, t: number) => {
  const pump = t % 20 < 10 ? 1 : 0;
  for (const s of [-1, 1]) {
    // (drawn for his right arm, the one on the left of the picture; mirrored for the other)
    const X = (x: number) => (s < 0 ? x : ART_W - x);
    const RX = (x: number, y: number, w: number, h: number, c: string) => R(ctx, s < 0 ? x : ART_W - x - w, y, w, h, c);
    const blob = (key: string, cx: number, cy: number, w: number, h: number, light: (u: number, v: number) => number) => shaded(ctx, `${key}${s}`, X(cx) - w / 2, cy - h / 2, w, h, RAMP.mSkin, light);
    // The triceps, hanging heavy under the upper arm
    blob('mh-tri', 46, 112, 42, 20, ball(-0.3, -0.85, 0.08));
    // Upper arm, out level from the shoulder to the elbow
    limb(ctx, `mh-uarm${s}`, X(70), 110, 15, X(22), 100, 11);
    // Forearm back up from the elbow: thick by the elbow, tapering to the wrist, leaning in toward his head
    limb(ctx, `mh-farm1${s}`, X(20), 96, 11, X(23), 70, 12);
    limb(ctx, `mh-farm2${s}`, X(23), 70, 12, X(33), 46, 7);
    // (the vein down it)
    for (let k = 0; k < 6; k++) RX(19 + k, 62 + k * 4, 1, 3, C.vein);
    // The bicep, peaked up off the upper arm
    blob('mh-bicep', 42, 89 - pump * 2, 42, 30 + pump * 2, ball(-0.4, -0.78, 0.14));
    // (the crease where it meets the forearm, the split down its peak, the vein over it)
    for (let k = 0; k < 6; k++) RX(25 + k, 96 - k * 2, 2, 2, RAMP.mSkin[1]);
    RX(36, 80 - pump * 2, 2, 8, RAMP.mSkin[2]); RX(46, 84, 8, 1, C.vein); RX(52, 85, 1, 5, C.vein); RX(40, 85, 6, 1, C.vein);
    // The deltoid, capping the shoulder
    blob('mh-delt', 72, 106, 30, 28, ball(-0.35, -0.7, 0.14));
    RX(64, 116, 10, 1, RAMP.mSkin[2]);
    // The wristband, the fist on top of it: square, the knuckles turned in toward his head, the thumb across
    blob('mh-fist', 35, 37, 22, 20, box(-0.5, -0.5, 0.15, 1, 0.8));
    for (let k = 0; k < 4; k++) RX(26 + k * 5, 29, 4, 2, RAMP.mSkin[6]);
    for (let k = 1; k < 4; k++) RX(25 + k * 5, 31, 1, 7, RAMP.mSkin[2]);
    RX(27, 39, 16, 3, RAMP.mSkin[3]); RX(27, 42, 16, 1, RAMP.mSkin[2]);
    RX(44, 32, 2, 9, RAMP.mSkin[1]);
    RX(25, 46, 18, 6, C.ink); for (let k = 0; k < 4; k++) RX(26 + k * 4, 44, 2, 2, C.lightGray);
  }
  // Pump lines
  if (t % 20 < 10) for (const [x, y] of [[2, 70], [2, 88], [249, 70], [249, 88]]) R(ctx, x, y, 5, 2, C.gold);
};

/** His hand coming up by his face with the handgun in it, held up and sideways, a gleam running along the slide. */
const drawHandgunUp = (ctx: Ctx, t: number) => {
  const rise = Math.max(0, 14 - t * 2);
  const y = 50 + rise;
  // Forearm up from below the frame
  shaded(ctx, 'mh-gunarm', 196, y + 30, 22, 80, RAMP.mSkin, box(-0.55, -0.3, 0.14, 1, 0.2));
  R(ctx, 194, y + 60, 26, 7, C.ink); for (let k = 0; k < 5; k++) R(ctx, 196 + k * 5, y + 58, 2, 2, C.lightGray);
  // The pistol: barrel pointing up, the grip in his fist
  R(ctx, 200, y - 36, 14, 50, C.darkGray);        // slide
  R(ctx, 200, y - 36, 14, 3, C.gray);
  R(ctx, 202, y - 40, 4, 4, C.darkGray);           // front sight
  for (let k = 0; k < 5; k++) R(ctx, 211, y - 2 + k * 3, 3, 1, C.ink); // serrations
  R(ctx, 196, y + 10, 22, 16, C.ink);              // frame
  R(ctx, 214, y + 12, 8, 6, C.ink);                // trigger guard
  // His fist round the grip
  shaded(ctx, 'mh-gunfist', 191, y + 14, 30, 24, RAMP.mSkin, ball(-0.45, -0.6, 0.15));
  for (let k = 0; k < 3; k++) R(ctx, 194 + k * 7, y + 20, 5, 3, C.mSkinShade);
  R(ctx, 212, y + 14, 8, 6, C.mSkin);              // his trigger finger along the frame
  // The gleam running up the slide, and a sparkle off the top
  const g = (t * 3) % 60;
  if (g < 44) R(ctx, 202, y + 10 - g, 3, 6, C.white);
  if (t % 30 < 12) { R(ctx, 206, y - 50, 2, 8, C.white); R(ctx, 203, y - 47, 8, 2, C.white); }
};

/**
 * The punch lands: fist into face against a burst of speed rays. `real`: the second one, the real President, against
 * the fire's colors: stubble, the tape's raw outline round his mouth, the long strand of hair whipping off him.
 */
export const drawPunch = (ctx: Ctx, t: number, real = false) => {
  const shake = t < 20 ? (t % 4 < 2 ? 3 : -3) : 0;
  ctx.save();
  ctx.translate(shake, 0);
  // Radial burst
  const ix = 164, iy = 70;
  R(ctx, -4, 0, ART_W + 8, ART_H, t % 4 < 2 ? C.white : '#fce0a8');
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    ctx.fillStyle = real ? (i % 2 === 0 ? '#f87c00' : '#2a0c04') : i % 2 === 0 ? C.red : C.gold;
    ctx.beginPath();
    ctx.moveTo(ix, iy);
    ctx.lineTo(ix + Math.cos(a) * 300, iy + Math.sin(a) * 300);
    ctx.lineTo(ix + Math.cos(a + 0.13) * 300, iy + Math.sin(a + 0.13) * 300);
    ctx.fill();
  }
  // His face, the fist sunk in it, the flesh rippling out from it
  ctx.drawImage(punchFace(real, Math.floor(t / 2) % 3), 0, 0);
  // The impact: lines bursting off round the fist, inked
  const flick = t % 4 < 2 ? 0 : 3;
  for (let i = 0; i < 10; i++) {
    // (fanned off above the fist and below it, clear of his face)
    const a = (i < 5 ? -1 : 1) * (1.75 + (i % 5) * 0.24 + (i % 2 ? 0.06 : 0)), r0 = 30 + flick + (i % 3) * 3, r1 = r0 + 10 + (i % 2) * 8;
    const n = r1 - r0;
    for (let k = 0; k <= n; k++) {
      const x = ix - 6 + Math.cos(a) * (r0 + k), y = iy + Math.sin(a) * (r0 + k), w = k < n * 0.3 ? 2 : 1;
      R(ctx, x - 1, y - 1, w + 2, w + 2, FIG_INK);
    }
    for (let k = 0; k <= n; k++) { const x = ix - 6 + Math.cos(a) * (r0 + k), y = iy + Math.sin(a) * (r0 + k); R(ctx, x, y, k < n * 0.3 ? 2 : 1, k < n * 0.3 ? 2 : 1, C.white); }
  }
  // The comb-over, torn up off his scalp and streaming off to the right, whipping
  const Hh = RAMP.tHair;
  for (let s = 0; s < 9; s++) {
    const len = 26 + (s % 3) * 8, y0 = 26 + s * 2.2, x0 = 196 + s * 3;
    for (let k = 0; k < len; k++) {
      const x = x0 + k * 1.1, y = y0 - k * 0.55 + Math.sin(k * 0.25 + t * 0.9 + s) * (1 + k * 0.08);
      R(ctx, x, y + 1, 2, 1, Hh[1]);
      R(ctx, x, y, 2, 1, k === len - 1 ? Hh[1] : s % 3 === 0 ? Hh[5] : s % 3 === 1 ? Hh[4] : Hh[3]);
      if (s === 0) R(ctx, x, y - 1, 2, 1, '#5a3a04');
      if (s === 8) R(ctx, x, y + 2, 2, 1, '#5a3a04');
    }
  }
  if (real) {
    // (his one long strand whipping off behind; ketchup flying)
    for (let k = 0; k < 40; k++) R(ctx, 226 + k, 40 - Math.round(Math.sin(k * 0.2 + t * 0.6) * 4) - k * 0.4, 1, 2, Hh[k % 5 === 0 ? 5 : 3]);
    for (const [x, y, r] of [[226, 112 - (t % 16), 2], [240, 96 - (t % 10), 1.5]] as const) { ell(ctx, x, y, r + 1, r + 1, FIG_INK); ell(ctx, x, y, r, r, '#c81e0c'); }
  }
  // Spit and teeth flying out of the side of his mouth, sweat flicked off his brow
  const fly = (k: number, speed: number) => (t * speed + k * 17) % 34;
  for (let k = 0; k < 6; k++) {
    const d = fly(k, 1.6), x = 222 + d * 1.1, y = 92 - d * 0.5 + (d * d) / 40 + (k % 3) * 4 - 4, r = k % 2 ? 1 : 2;
    R(ctx, x, y, r + 1, r + 1, '#7aa0c0'); R(ctx, x, y, r, r, '#e4f0fc'); R(ctx, x, y, 1, 1, C.white);
    if (k % 2 === 0) R(ctx, x - 3, y + 1, 3, 1, 'rgba(228, 240, 252, 0.7)');
  }
  for (let k = 0; k < 2; k++) {
    const d = (t * 1.3 + k * 15) % 30, x = 226 + d * 1.2 + k * 6, y = 98 - d * 0.6 + (d * d) / 30 + k * 6, rot = Math.floor(t / 3 + k) % 2;
    const w = rot ? 4 : 3, h = rot ? 3 : 5;
    R(ctx, x - 1, y - 1, w + 2, h + 2, FIG_INK); R(ctx, x, y, w, h, '#fcf8e8'); R(ctx, x, y, 1, 1, C.white); R(ctx, x + w - 1, y + h - 1, 1, 1, '#c8bca8');
    R(ctx, x + (rot ? w : 1), y + (rot ? 1 : h), 1, 1, '#c81e0c');
  }
  for (let k = 0; k < 3; k++) {
    const d = (t * 0.9 + k * 9) % 22, x = 214 + k * 8 + d * 0.6, y = 30 - d * 0.7 + (d * d) / 50;
    R(ctx, x, y, 2, 3, '#bfe4fc'); R(ctx, x, y, 1, 1, C.white); R(ctx, x + 1, y + 2, 1, 1, '#5a8ab0');
  }
  // The arm: his left, from off the left of the frame, the fist buried in the face
  ctx.drawImage(punchArm(), 0, 0);
  ctx.restore();
};

/**
 * The President's face, hit: three-quarters to the fist, the near cheek caved in round the knuckles and the flesh of
 * it bulging up over them and under them, rippling away across his face to the jowls swinging out on the far side;
 * the near eye screwed shut, the far one popped wide in its pale tanning-goggle, the nose shoved over, the mouth
 * dragged open sideways, a tooth gone. His collar and tie under it. `real`: the real one (stubble, the tape's raw
 * ghost round the mouth). `phase`: where the ripples have got to.
 */
const punchFace = (real: boolean, phase: number) => painting(`pn-face-${real ? 1 : 0}-${phase}`, ART_W, ART_H, p => {
  const T = RAMP.tSkin, N = RAMP.navy, Hh = RAMP.tHair, I = FIG_INK;
  // The suit's shoulder, the collar, the tie flung up off his chest
  p.form(g => { g.moveTo(176, 150); g.bezierCurveTo(180, 126, 196, 114, 216, 112); g.lineTo(262, 108); g.lineTo(262, 150); g.closePath(); }, { ramp: N, bevel: 10, amb: 0.2, ink: I });
  p.form(g => { g.moveTo(192, 116); g.lineTo(232, 110); g.lineTo(238, 122); g.lineTo(212, 130); g.lineTo(196, 126); g.closePath(); }, { ramp: RAMP.shirt, bevel: 3, amb: 0.3, ink: I });
  p.form(g => { g.moveTo(214, 116); g.lineTo(222, 116); g.bezierCurveTo(236, 112, 248, 104, 258, 100); g.lineTo(262, 108); g.bezierCurveTo(248, 116, 234, 124, 220, 126); g.closePath(); }, { ramp: RAMP.red, bevel: 3, amb: 0.2, ink: I });
  // The head: round, the jowls swung out to the right, the near side caved in where the fist is
  const head = p.form(g => {
    g.moveTo(170, 40); g.bezierCurveTo(180, 24, 204, 18, 222, 26); g.bezierCurveTo(238, 34, 244, 52, 242, 70);
    g.bezierCurveTo(252, 84, 252, 104, 236, 114); g.bezierCurveTo(222, 122, 196, 120, 182, 110);
    g.bezierCurveTo(172, 104, 166, 100, 160, 98); g.lineTo(150, 98); g.lineTo(150, 40); g.closePath();
  }, { ramp: T, bevel: 22, amb: 0.2, ink: I, inkIn: T[1] });
  // (the ear, far side)
  p.form(g => { g.ellipse(241, 62, 5, 9, 0.2, 0, Math.PI * 2); }, { ramp: T, bevel: 3, amb: 0.1, ink: I });
  p.line(241, 57, 242, 67, T[1]);
  // The ripples: rings running out from the fist across the flesh, a lit crest and a shadowed trough each
  for (let y = 20; y < 124; y++) for (let x = 166; x < 252; x++) {
    if (!head[y * ART_W + x]) continue;
    const d = Math.hypot((x - 158) * 0.9, (y - 70) * 1.15), w = (d - phase * 4) % 12;
    if (d < 18) continue;
    const fade = Math.max(0, 1 - (d - 18) / 70);
    if (w < 1.5 && bayer(x, y) + 0.5 < fade * 0.8) p.px(x, y, T[5]);
    else if (w > 3 && w < 5 && bayer(x, y) + 0.5 < fade * 0.7) p.px(x, y, T[2]);
  }
  // The flesh of the cheek bulging up over the top of the fist and rolling under the bottom of it
  p.form(g => { g.ellipse(170, 38, 14, 7, -0.3, 0, Math.PI * 2); }, { ramp: T, bevel: 5, amb: 0.2, ink: I, inkIn: T[1] });
  p.form(g => { g.ellipse(172, 101, 15, 7, 0.35, 0, Math.PI * 2); }, { ramp: T, bevel: 5, amb: 0.15, ink: I, inkIn: T[1] });
  // The jowls swung out on the far side, the crease over them
  p.form(g => { g.ellipse(230, 98, 16, 13, -0.2, 0, Math.PI * 2); }, { ramp: T, bevel: 8, amb: 0.14, ink: I, inkIn: T[1] });
  for (let k = 0; k < 18; k++) p.px(212 + k, 90 - Math.round(Math.sin((k / 17) * Math.PI) * 3), T[1]);
  // The flush, hot in the cheek
  for (let y = 74; y < 92; y++) for (let x = 216; x < 238; x++) if (Math.hypot((x - 226) / 10, (y - 82) / 8) < 1 && bayer(x, y) + 0.5 < 0.5) p.px(x, y, '#f05a2c');
  // The pale goggle round the far eye, the eye popped wide in it, the pupil a dot; the brow flung up
  p.disc(214, 56, 11, 8, '#fde0c0'); p.disc(214, 56, 9, 7, '#fde8cc');
  p.form(g => { g.ellipse(214, 56, 7, 7, 0, 0, Math.PI * 2); }, { ramp: ['#b8b0a8', '#e4dcd4', '#fcf8f0', '#ffffff'], bevel: 4, ink: I });
  p.rect(213, 55, 2, 2, I); p.px(211, 52, '#ffffff');
  for (const [dx, dy] of [[-5, -3], [4, 4], [-4, 4]] as const) p.line(214 + dx, 56 + dy, 214 + dx * 0.6, 56 + dy * 0.6, '#e05050');
  p.form(g => { g.moveTo(202, 44); g.quadraticCurveTo(214, 36, 226, 42); g.lineTo(225, 45); g.quadraticCurveTo(214, 40, 203, 47); g.closePath(); }, { ramp: Hh, bevel: 2, ink: '#5a3a04' });
  // The near eye, screwed shut: the creases fanned out from it, the goggle's pale round it
  p.disc(186, 58, 9, 6, '#fde0c0');
  for (let k = 0; k < 10; k++) { p.px(181 + k, 58 - Math.round(Math.abs(k - 4.5) * 0.5) + (k > 4 ? 0 : 0), I); p.px(181 + k, 57 - Math.round(Math.abs(k - 4.5) * 0.5), I); }
  for (const [x0, y0, x1, y1] of [[178, 52, 182, 55], [176, 58, 180, 58], [178, 64, 182, 61], [192, 51, 190, 54]] as const) p.line(x0, y0, x1, y1, T[1]);
  p.line(178, 49, 192, 47, Hh[2]); p.line(178, 48, 191, 46, Hh[4]);
  // The nose, shoved over: the bulb of it, the nostril flared
  p.form(g => { g.moveTo(194, 58); g.bezierCurveTo(196, 66, 204, 70, 206, 76); g.bezierCurveTo(206, 82, 198, 84, 192, 80); g.bezierCurveTo(188, 76, 192, 66, 194, 58); g.closePath(); },
    { ramp: T, bevel: 4, amb: 0.2, ink: I, inkIn: T[1] });
  p.disc(199, 80, 2.5, 1.5, '#5a1a0a'); p.px(195, 66, T[6]); p.px(195, 67, T[6]);
  // The mouth, dragged open to the far side: dark, the top teeth (one gone), the tongue; the lips round it
  p.form(g => { g.moveTo(190, 94); g.bezierCurveTo(200, 86, 220, 86, 230, 92); g.bezierCurveTo(226, 104, 210, 108, 198, 104); g.closePath(); },
    { ramp: ['#1e0202', '#3a0606', '#5a0c0c'], bevel: 3, ink: '#5a1a10' });
  for (let k = 0; k < 8; k++) { if (k === 3) continue; const x = 198 + k * 3.5, y = 90 + Math.round(Math.abs(k - 3.5) * 0.3); p.rect(x, y, 3, 3, '#f4ecdc'); p.px(x + 2, y + 2, '#c8bca8'); }
  p.form(g => { g.ellipse(214, 102, 8, 3.5, -0.1, 0, Math.PI * 2); }, { ramp: ['#8a2030', '#c84858', '#e87888'], bevel: 2, ink: null });
  p.line(190, 94, 200, 87, T[1]); p.line(201, 87, 229, 91, '#b02c20');
  if (real) {
    // (the real one: stubble, grey and orange; the tape's ghost round his mouth gone red raw)
    for (let i = 0; i < 140; i++) {
      const x = 186 + Math.floor(hash(i * 1.9) * 60), y = 84 + Math.floor(hash(i * 2.3) * 30);
      if (head[y * ART_W + x] && (x + y) % 2 === 0) p.px(x, y, i % 3 ? '#9c5a30' : '#c8b8a8');
    }
    for (let x = 186; x < 236; x += 2) { p.px(x, 84 + Math.round((x - 186) * 0.04), '#e86a6a'); p.px(x + 1, 110 - Math.round((x - 186) * 0.06), '#e86a6a'); }
  }
  // The hair: what's left of the swoop still on his scalp, lifting off it
  p.form(g => { g.moveTo(172, 38); g.bezierCurveTo(180, 22, 206, 16, 228, 24); g.lineTo(236, 30); g.bezierCurveTo(214, 28, 192, 32, 178, 42); g.closePath(); },
    { ramp: Hh, bevel: 4, amb: 0.25, ink: '#5a3a04', spec: '#fffef0', wet: 0.6 });
});

/**
 * Meathead's left arm, side on, from off the left of the frame: the forearm thick as a thigh, the muscle over the top
 * of it, the veins standing out, the wristband; the fist, the back of the hand and the knuckles leading, the fingers
 * curled under, the thumb locked across them.
 */
const punchArm = () => painting('pn-arm', ART_W, ART_H, p => {
  const S = RAMP.mSkin, I = FIG_INK;
  // The forearm, tapering to the wrist, the muscle bulging along its top
  p.form(g => { g.moveTo(-8, 42); g.bezierCurveTo(20, 30, 60, 34, 94, 50); g.lineTo(94, 92); g.bezierCurveTo(64, 102, 24, 106, -8, 100); g.closePath(); },
    { ramp: S, bevel: 22, amb: 0.14, ink: I });
  p.form(g => { g.moveTo(0, 46); g.bezierCurveTo(22, 32, 54, 34, 80, 50); g.bezierCurveTo(56, 52, 26, 54, 0, 62); g.closePath(); }, { ramp: S, bevel: 7, amb: 0.2, ink: null });
  // (the line between the muscles; the underside in shadow)
  for (let k = 0; k < 70; k++) { const x = 4 + k, y = Math.round(62 - k * 0.16 + Math.sin(k / 70 * Math.PI) * 2); p.px(x, y, S[2]); p.px(x, y + 1, S[3]); }
  // The veins, standing up out of it: a dark under each, the vein, the light along its top
  const vein = (pts: number[][]) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
      for (let k = 0; k <= n; k++) { const x = x0 + ((x1 - x0) * k) / n, y = y0 + ((y1 - y0) * k) / n; p.px(x, y + 2, S[2]); p.px(x, y + 1, S[4]); p.px(x, y, S[6]); p.px(x, y - 1, S[5]); }
    }
  };
  vein([[-6, 74], [12, 72], [28, 76], [46, 73], [64, 77], [84, 75]]);
  vein([[28, 76], [42, 84], [60, 86], [82, 84]]);
  // The wristband: black, ribbed, the light along its top
  p.form(g => { g.roundRect(86, 44, 16, 54, 4); }, { ramp: BOOT, bevel: 5, amb: 0.2, ink: I });
  for (let y = 48; y < 95; y += 3) p.line(88, y, 99, y, '#08080a');
  p.line(89, 46, 99, 46, '#5a5a66');
  // The fist: the back of the hand, the knuckles along its top, the fingers curled under in a stack, the thumb across
  p.form(g => { g.moveTo(100, 46); g.bezierCurveTo(116, 36, 140, 32, 156, 36); g.bezierCurveTo(166, 40, 168, 50, 166, 60); g.lineTo(166, 96); g.bezierCurveTo(150, 102, 120, 102, 100, 96); g.closePath(); },
    { ramp: S, bevel: 14, amb: 0.18, ink: I });
  // (the knuckles: four bumps along the top, lit; the bones of the back of the hand running to them)
  for (let k = 0; k < 4; k++) {
    const kx = 128 + k * 9, ky = 36 + Math.abs(k - 1.5) * 1.2;
    p.form(g => { g.ellipse(kx, ky + 2, 5, 4, 0, 0, Math.PI * 2); }, { ramp: S, bevel: 3, amb: 0.25, ink: null });
    p.line(kx - 18, ky + 10, kx - 3, ky + 4, S[3]);
  }
  // (the fingers: four rolls stacked down the front, each lit across its top, a crease under it)
  for (let k = 0; k < 4; k++) {
    const y0 = 42 + k * 13;
    p.form(g => { g.roundRect(140, y0, 26, 13, 5); }, { ramp: S, bevel: 5, amb: 0.2, ink: I, inkIn: S[1] });
    p.line(160, y0 + 3, 164, y0 + 3, S[7]);
    p.px(149, y0 + 6, S[2]); p.px(150, y0 + 6, S[2]);
  }
  // (the thumb locked across the bottom two, the nail at its end)
  p.form(g => { g.moveTo(108, 80); g.bezierCurveTo(124, 72, 144, 72, 156, 76); g.bezierCurveTo(160, 80, 158, 88, 152, 90); g.bezierCurveTo(138, 88, 122, 90, 110, 94); g.closePath(); },
    { ramp: S, bevel: 6, amb: 0.2, ink: I, inkIn: S[1] });
  p.form(g => { g.roundRect(146, 76, 9, 7, 2); }, { ramp: ['#b88a6a', '#dcb498', '#f4d8c4', '#fff0e4'], bevel: 2, ink: S[1] });
  p.line(132, 80, 132, 86, S[2]);
  // (a vein over the back of the hand; the sweat on it)
  for (let k = 0; k < 18; k++) { const x = 104 + k, y = 58 + Math.round(Math.sin(k * 0.3) * 2) - Math.floor(k / 4); p.px(x, y + 2, S[2]); p.px(x, y + 1, S[4]); p.px(x, y, S[6]); }
  p.rect(120, 44, 2, 1, '#ffffff'); p.px(60, 42, '#ffffff'); p.px(61, 42, '#ffffff');
});

/** Trump flying across the press room, until the frame freezes. Returns his x (for tests). */
export const drawFinale = (ctx: Ctx, t: number, freezeAt: number) => {
  const ft = Math.min(t, freezeAt);
  // (the flies freeze with the frame)
  shatClock(ft);
  curtain(ctx, 116);
  whSign(ctx, 128, 20);
  hangingFlag(ctx, 50, 38);
  hangingFlag(ctx, 190, 38);
  stageFloor(ctx);
  R(ctx, 0, 112, ART_W, 1, '#a42410');
  podium(ctx, 118, 72, 1);
  meatheadPunched(ctx, 82, 118);
  const p = Math.min(1, ft / freezeAt);
  const x = 110 + p * 70;
  const y = 64 - Math.sin(p * Math.PI) * 10;
  trumpFlying(ctx, x, y, ft);
  reporters(ctx, ft, 1);
  // Freeze frame: a flash on the frame it stops
  if (t >= freezeAt && t < freezeAt + 3) R(ctx, 0, 0, ART_W, ART_H, 'rgba(255,255,255,0.7)');
  return x;
};
