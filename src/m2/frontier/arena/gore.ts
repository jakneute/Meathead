// TUCKER COMING APART (his fight's two deaths): the pieces of him the beasts pull on, each painted the once into a
// sprite of its own at the screen's scale and put down after that with a drawImage (rotated, mirrored, STRETCHED: the
// stretching is the sprite drawn longer, never repainted; the mountain lions' mauling once slowed the game to a crawl
// painting him afresh every frame, so nothing here paints per frame).
//
//   the weakness (the lions): his whole figure flat on his back, split at the waist into two parts put down apart along
//                his length as the cats haul; between them what's being stretched, in stages by how far: the vest's
//                cloth drawn out, then his belly skin bare and stretched thin (stretch marks, the navel pulled long,
//                ginger hair), then the skin tearing open in lens-shaped splits, then raw meat necking down thin
//                (striated muscle, white tendon, yellow fat, the gut loops, the knobs of his spine); torn cloth fringing
//                the cut edges. Then the halves, each with its torn end (ragged meat, the spine's knob, a gut loop
//                hanging), what each cat carries off.
//   the standard death (the grizzly): his body flat, headless; his neck stretched from his collar to his head in the
//                bear's jaws, in the same stages (skin, splitting, the raw neck: the strap muscles, the windpipe's rings
//                pulled apart, a vein, tendons); his head on its own; the stumps after (on the body, and dangling under
//                the head the bear walks off with).
//
// SNES grade: flesh in stepped ramps (lit, base, shade, deep, its line tone), dithered seams, pixel-stepped detail.
// Units are drawTucker's (his flat figure: feet at the origin, facing right, head toward -x, belly up; arena/fight.ts
// places it).

import { drawTucker, drawTuckerHead, TUCKER_HEAD_SCALE as HS, type TuckerFace, type TuckerWounds } from '../tucker';

type Ctx = CanvasRenderingContext2D;

/** His wounds by the end of his fight (everything the land did to him, the cats' rakes, the blood): one look for all of
 *  the death's pieces, so a piece painted into a beast's stamp matches the one on the ground. */
const WOUNDS: TuckerWounds = { eye: true, saw: true, grime: true, branch: true, split: true, clawed: 4, bloody: 1 };

const h01 = (n: number) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };

// ---------------------------------------------------------------------------------------------------------------
// Sprites: painted once at the scale they're shown at, put down (rotated, mirrored, stretched) with one drawImage

interface Spr { cv: HTMLCanvasElement; s: number; x: number; y: number }
const sprites = new Map<string, Spr>();
const MAX_SPRITES = 48;
/** The sprite `key` (`paint` in its own units inside x, y, w, h), at the whole scale the context's showing things at. */
const spr = (c: Ctx, key: string, x: number, y: number, w: number, h: number, paint: (g: Ctx) => void): Spr | null => {
  if (typeof document === 'undefined') return null;
  const m = c.getTransform(), s = Math.max(1, Math.min(4, Math.ceil(Math.hypot(m.a, m.b) - 0.05)));
  const id = `${key}@${s}`;
  let e = sprites.get(id);
  if (e) { sprites.delete(id); sprites.set(id, e); return e; }
  const cv = document.createElement('canvas'); cv.width = Math.ceil(w * s); cv.height = Math.ceil(h * s);
  const g = cv.getContext('2d')!;
  g.imageSmoothingEnabled = false; g.setTransform(s, 0, 0, s, -x * s, -y * s);
  paint(g);
  e = { cv, s, x, y };
  sprites.set(id, e);
  while (sprites.size > MAX_SPRITES) { const first = sprites.keys().next().value; if (first === undefined) break; sprites.delete(first); }
  return e;
};
/** Part of a sprite (sx, sy, sw, sh in its units) put down at dx, dy, dw, dh (hard pixels: stretched, they stay
 *  stepped). */
const put = (c: Ctx, e: Spr | null, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number) => {
  if (!e || dw <= 0 || dh <= 0) return;
  const was = c.imageSmoothingEnabled;
  c.imageSmoothingEnabled = false;
  c.drawImage(e.cv, (sx - e.x) * e.s, (sy - e.y) * e.s, sw * e.s, sh * e.s, dx, dy, dw, dh);
  c.imageSmoothingEnabled = was;
};
const px = (g: Ctx, x: number, y: number, w: number, h: number, col: string) => { g.fillStyle = col; g.fillRect(x, y, w, h); };

// ---------------------------------------------------------------------------------------------------------------
// The flesh being stretched: an hourglass 40 long, 30 through (necking in at its middle), along x; put down stretched
// to however long and thin it's being pulled

const FW = 40, FH = 15;
type Flesh = 'skin' | 'torn' | 'raw';
/** Skin: highlight, lit, base, shade, deep, line. */
const SKIN = ['#FFF0E2', '#FFDCC4', '#F6C2A2', '#DC9E80', '#B4765C', '#6E3C28'];
/** Raw meat: highlight, lit, base, shade, deep, line. */
const MEAT = ['#F8A8A0', '#E25454', '#B91C1C', '#8A1414', '#5A0A0A', '#2A0404'];
const FAT = ['#FFF0A8', '#F0D070', '#C8A040'];
const BONE = ['#FFFBF0', '#E2DAC4', '#B4A888', '#6E624A'];
const GUT = ['#FFD0D8', '#E8909C', '#B85868', '#6A2030'];

const halfAt = (u: number, neck: boolean) => FH * (1 - (neck ? 0.3 : 0.38) * Math.sin(Math.PI * u));
const hourglass = (g: Ctx, neck: boolean, inset = 0) => {
  g.beginPath();
  for (let i = 0; i <= 20; i++) g.lineTo((i / 20) * FW, -halfAt(i / 20, neck) + inset);
  for (let i = 20; i >= 0; i--) g.lineTo((i / 20) * FW, halfAt(i / 20, neck) - inset);
  g.closePath();
};
/** Each column banded down its height, lit from above: a highlight row, lit, base, shade, deep; a dithered row at each
 *  seam (every other pixel the band above). */
const bands = (g: Ctx, R: string[], neck: boolean) => {
  const stops = [-1, -0.68, -0.18, 0.34, 0.7, 1.01];
  for (let x = 0; x < FW; x++) {
    const h = halfAt((x + 0.5) / FW, neck);
    for (let b = 0; b < 4; b++) {
      const y0 = Math.floor(stops[b] * h), y1 = Math.ceil(stops[b + 1] * h);
      px(g, x, y0, 1, y1 - y0, R[b + 1]);
      if (b > 0 && x % 2 === 0) px(g, x, y0, 1, 1, R[b]);
    }
    px(g, x, Math.floor(-h) + 1, 1, 1, R[0]);
  }
};
const paintFlesh = (g: Ctx, kind: Flesh, neck: boolean) => {
  g.save(); hourglass(g, neck); g.clip();
  bands(g, kind === 'raw' ? MEAT : SKIN, neck);
  if (kind !== 'raw') {
    // (the skin's pulled pink at either end, where it's still got hold of him)
    for (let x = 0; x < FW; x++) { const k = Math.min(x, FW - 1 - x); if (k < 5) for (let y = -FH; y < FH; y++) if ((x + y) % 2 === 0 && h01(x * 3.1 + y) < 0.7 - k * 0.12) px(g, x, y, 1, 1, '#E88A7C'); }
    // (stretch marks: pale streaks down its length, each with its pink shadow under)
    for (let i = 0; i < 16; i++) {
      const x = 2 + Math.floor(h01(i * 2.3 + (neck ? 9 : 1)) * 30), y = Math.round((h01(i * 5.7 + 3) - 0.5) * 1.5 * halfAt(x / FW, neck)), l = 3 + Math.floor(h01(i * 1.9) * 6);
      px(g, x, y, l, 1, '#FFF4EE'); px(g, x + 1, y + 1, l - 1, 1, '#D88878');
    }
    if (!neck) {
      // (the navel pulled long, a few ginger belly hairs)
      px(g, 16, -3, 8, 2, '#8A4A3A'); px(g, 17, -3, 6, 1, '#5A2A20'); px(g, 18, -4, 4, 1, '#FFE8DC');
      for (let i = 0; i < 9; i++) px(g, 4 + Math.floor(h01(i * 4.1) * 32), -10 + Math.floor(h01(i * 7.3) * 6), 1, 2, i % 2 ? '#B4642E' : '#86441C');
    } else {
      // (the Adam's apple stretched into a ridge; the stubble line)
      px(g, 14, -6, 12, 2, SKIN[3]); px(g, 15, -7, 10, 1, SKIN[1]);
      for (let i = 0; i < 10; i++) px(g, 1 + Math.floor(h01(i * 3.3 + 5) * 8), -9 + Math.floor(h01(i * 2.9) * 16), 1, 1, '#B4642E');
    }
  }
  if (kind === 'torn') {
    // (splitting: lens-shaped tears open down it, raw meat in them, the skin's edge curled pale)
    for (const [xc, yc, L, T] of [[9, -2, 6, 4], [21, 3, 7, 3.4], [32, -3, 5, 3.6]] as const) {
      for (let x = xc - L; x <= xc + L; x++) {
        const u = (x - xc) / L, hh = T * (1 - u * u);
        if (hh < 0.5) continue;
        const j = h01(x * 7.7) > 0.5 ? 1 : 0;
        px(g, x, Math.round(yc - hh) - 1, 1, 1, '#FFF4EE');
        px(g, x, Math.round(yc - hh), 1, Math.round(hh * 2), MEAT[4]);
        px(g, x, Math.round(yc - hh) + 1, 1, Math.max(1, Math.round(hh * 2) - 2), MEAT[2]);
        if (x % 2 === j) px(g, x, Math.round(yc), 1, 1, MEAT[1]);
        px(g, x, Math.round(yc + hh), 1, 1, SKIN[4]);
      }
    }
  }
  if (kind === 'raw') {
    // (the meat's grain down its length: broken fibers, light and dark)
    for (let y = -FH; y < FH; y += 2) for (let x = 0; x < FW;) { const l = 3 + Math.floor(h01(x * 0.7 + y * 3.1) * 5); if (h01(x + y * 13.3) > 0.3) px(g, x, y, l, 1, h01(x * 1.3 + y) > 0.5 ? MEAT[1] : MEAT[3]); x += l + 1; }
    // (white tendon, strung out its length)
    for (const [y, a] of [[-6, 0], [5, 7]] as const) { px(g, a, y, FW - 8, 1, '#F2E6D6'); px(g, a + 2, y + 1, FW - 12, 1, '#C8B8A0'); }
    if (neck) {
      // (the windpipe down its middle, its rings pulled apart; a vein, blue under the meat)
      px(g, 0, -3, FW, 6, '#E8C4BC'); px(g, 0, -3, FW, 1, '#FFF0EC'); px(g, 0, 2, FW, 1, '#B08080');
      for (let x = 1; x < FW; x += 3) px(g, x, -3, 1, 6, '#B08080');
      for (let x = 0; x < FW; x++) { const y = 8 + Math.round(Math.sin(x * 0.4)); px(g, x, y, 1, 2, '#5A3A7A'); if (x % 3 === 0) px(g, x, y, 1, 1, '#9A7ACA'); }
    } else {
      // (the gut bulging through: pink loops, lit; the spine's knobs along his back (under); yellow fat at the edges)
      for (const [x, y, rx, ry] of [[12, -2, 5, 3.6], [20, 3, 5.4, 3.4], [28, -2, 4.6, 3.4]] as const) {
        g.fillStyle = GUT[3]; g.beginPath(); g.ellipse(x, y, rx + 0.8, ry + 0.8, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = GUT[2]; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = GUT[1]; g.beginPath(); g.ellipse(x - 0.6, y - 0.8, rx * 0.7, ry * 0.6, 0, 0, Math.PI * 2); g.fill();
        px(g, Math.round(x - rx * 0.4), Math.round(y - ry * 0.6), 2, 1, GUT[0]);
      }
      for (let x = 2; x < FW - 2; x += 5) { const y = Math.round(halfAt(x / FW, false) * 0.62); px(g, x - 0.5, y - 0.5, 4, 4, BONE[3]); px(g, x, y, 3, 3, BONE[1]); px(g, x, y, 1, 1, BONE[0]); }
    }
    for (let i = 0; i < 10; i++) { const x = Math.floor(h01(i * 3.7 + 1) * FW), top = i % 2 === 0, y = Math.round((top ? -1 : 1) * (halfAt(x / FW, neck) - 1.5)); px(g, x, y, 2, 2, FAT[2]); px(g, x, y, 1, 1, FAT[0]); }
  }
  g.restore();
  hourglass(g, neck); g.strokeStyle = kind === 'raw' ? MEAT[5] : SKIN[5]; g.lineWidth = 1; g.stroke();
};
const flesh = (c: Ctx, kind: Flesh, neck: boolean) => spr(c, `tg-flesh-${kind}-${neck ? 'n' : 't'}`, -1, -FH - 1, FW + 2, FH * 2 + 2, g => paintFlesh(g, kind, neck));

/** A strip of him pulled from (ax, ay) to (bx, by), `th` through: `kind` how far gone. */
const strip = (c: Ctx, kind: Flesh, neck: boolean, ax: number, ay: number, bx: number, by: number, th: number) => {
  const len = Math.hypot(bx - ax, by - ay);
  if (len < 1) return;
  c.save(); c.translate(ax, ay); c.rotate(Math.atan2(by - ay, bx - ax));
  put(c, flesh(c, kind, neck), 0, -FH, FW, FH * 2, -1, -th / 2, len + 2, th);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The torn bits: cloth fringe, the torn end of a half, a neck stump

/** The cut edge's cloth, ripped: tatters of the navy coat at either side, the burgundy vest between, a shred of shirt,
 *  threads (pointing +x off the edge). */
const paintFringe = (g: Ctx) => {
  for (let i = 0; i < 8; i++) {
    const y0 = -16 + i * 4, l = 3 + h01(i * 3.3) * 5, navy = i < 2 || i > 5;
    const R = navy ? ['#0A0F22', '#283662', '#5A6CA2'] : ['#28080C', '#76222A', '#C25A58'];
    g.fillStyle = R[0]; g.beginPath(); g.moveTo(-1, y0 - 0.5); g.lineTo(l + 1, y0 + 2); g.lineTo(-1, y0 + 4.5); g.closePath(); g.fill();
    g.fillStyle = R[1]; g.beginPath(); g.moveTo(-1, y0); g.lineTo(l, y0 + 2); g.lineTo(-1, y0 + 4); g.closePath(); g.fill();
    px(g, -1, y0, Math.max(1, l * 0.5), 1, R[2]);
    if (i % 3 === 1) px(g, l, y0 + 2, 3 + h01(i) * 3, 0.6, R[1]);
  }
  g.fillStyle = '#F4F0E6'; g.beginPath(); g.moveTo(-1, -2); g.lineTo(5, 0); g.lineTo(-1, 2); g.closePath(); g.fill();
};
const fringe = (c: Ctx, x: number, y: number, dir: number, len: number) => {
  c.save(); c.translate(x, y); c.scale(dir, 1);
  put(c, spr(c, 'tg-fringe', -2, -18, 14, 36, paintFringe), -2, -18, 14, 36, -2, -18, 14 * len, 36);
  c.restore();
};

/** A half's torn end (pointing +x, the cut at x 0, his middle at y 0): ragged meat in steps, the spine's knob, a loop
 *  of gut hanging out and down. */
const paintTornEnd = (g: Ctx) => {
  const rag = (out: number) => { g.beginPath(); g.moveTo(-1, -14); for (let i = 0; i <= 14; i++) g.lineTo(out * (0.6 + h01(i * 2.7) * 0.7) * Math.sin((i / 14) * Math.PI), -14 + i * 2); g.lineTo(-1, 14); g.closePath(); };
  // (the gut loop first, hanging out under the meat: sausage links of it, lit, down and curling back)
  const links: [number, number][] = [[3, 2], [5, 6], [6, 10], [5, 14], [3, 17], [0, 19]];
  for (const [x, y] of links) { g.fillStyle = GUT[3]; g.beginPath(); g.ellipse(x, y, 3, 2.6, 0, 0, Math.PI * 2); g.fill(); }
  for (const [x, y] of links) { g.fillStyle = GUT[2]; g.beginPath(); g.ellipse(x, y, 2.3, 2, 0, 0, Math.PI * 2); g.fill(); px(g, x - 1, y - 1.4, 2, 1, GUT[0]); }
  rag(7); g.fillStyle = MEAT[5]; g.fill();
  rag(5.6); g.fillStyle = MEAT[3]; g.fill();
  rag(4); g.fillStyle = MEAT[2]; g.fill();
  for (let i = 0; i < 6; i++) px(g, 1 + h01(i * 5.1) * 2, -10 + i * 3.6, 2, 1, MEAT[1]);
  // (the spine, snapped: a knob of bone, its marrow; yellow fat)
  px(g, 1.5, 6.5, 6, 5, BONE[3]); px(g, 2, 7, 5, 4, BONE[1]); px(g, 2, 7, 2, 1, BONE[0]); px(g, 4, 8, 2, 2, '#9A2020');
  px(g, 0, -12, 3, 2, FAT[1]); px(g, 0, -12, 1, 1, FAT[0]);
};
const tornEnd = (c: Ctx, x: number, y: number, dir: number) => {
  c.save(); c.translate(x, y); c.scale(dir, 1);
  put(c, spr(c, 'tg-tornend', -2, -16, 14, 40, paintTornEnd), -2, -16, 14, 40, -2, -16, 14, 40);
  c.restore();
};

/** A neck stump (from x 0 out to the ragged end at x 12, 12 through): the meat in its bands, the ragged skin round
 *  it, the windpipe's hole and the spine's knob in the end. */
const paintStump = (g: Ctx) => {
  for (let x = 0; x < 12; x++) {
    const h = 6 - x * 0.12;
    px(g, x, -h, 1, h * 2, MEAT[5]);
    px(g, x, -h + 1, 1, h * 0.7, MEAT[1]); px(g, x, -h * 0.3, 1, h * 0.9, MEAT[2]); px(g, x, h * 0.6, 1, h * 0.4 - 1, MEAT[3]);
    if (x < 5) { px(g, x, -h, 1, 1.4, SKIN[2]); px(g, x, h - 1.4, 1, 1.4, SKIN[3]); }
  }
  for (let i = 0; i < 6; i++) px(g, 11 + h01(i * 3.1) * 2, -5 + i * 2, 1.4, 1.4, MEAT[i % 2 ? 1 : 4]);
  px(g, 9, -3, 3, 3, '#3A1010'); px(g, 9, -3, 3, 1, '#E8C4BC');
  px(g, 9, 1.5, 3.5, 3, BONE[3]); px(g, 9.5, 2, 2.5, 2, BONE[1]); px(g, 9.5, 2, 1, 1, BONE[0]);
};
/** A stump from (x, y) pointing `ang`, `len` long. */
export const drawNeckStump = (c: Ctx, x: number, y: number, ang: number, len = 9, th = 10) => {
  c.save(); c.translate(x, y); c.rotate(ang);
  put(c, spr(c, 'tg-stump', -1, -7, 14, 14, paintStump), -1, -7, 14, 14, -1, -th / 2 - 1, len + 2, th + 2);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// His figure, flat on his back (drawTucker's 'flat': feet at the origin, head toward -x), and his head

const BX = -100, BY = -76, BW = 152, BH = 96;
const body = (c: Ctx, face: TuckerFace, headless: boolean) => spr(c, `tg-flat-${face}-${headless ? 'h' : 'w'}`, BX, BY, BW, BH, g => drawTucker(g, 0, 0, 1, 0, 'flat', { wounds: WOUNDS, face, headless }));

/** Where the cats bite (flat): the near one at his chest (the top of his belly), the far one at his shins. */
export const BITE_TOP = { x: -34, y: -31 }, BITE_LEGS = { x: 12, y: -22 };
/** His waist (where he comes in two), his middle's line and half its depth there. */
const WAIST = -20, MID_Y = -17.5, MID_HALF = 14.5;
/** Where his neck comes out of his collar (flat). */
export const COLLAR = { x: -42, y: -16 };
/** Stretched past this, the cloth's gone and it's him. */
const CLOTH_GIVES = 9;

/** How far the cats have him stretched past whole (units), their jaws at jl and jr. */
export const tugStretch = (jl: { x: number; y: number }, jr: { x: number; y: number }) => {
  const D = Math.hypot(jr.x - jl.x, jr.y - jl.y), dy = BITE_LEGS.y - BITE_TOP.y;
  return Math.sqrt(Math.max(0, D * D - dy * dy)) - (BITE_LEGS.x - BITE_TOP.x);
};

/** THE TUG OF WAR: him flat out between the two cats' jaws (jl: the near cat's on his chest; jr: the far one's on his
 *  shins), pulled long at the waist by however far apart they've got him. */
export const drawTugged = (c: Ctx, jl: { x: number; y: number }, jr: { x: number; y: number }, face: TuckerFace, frame: number) => {
  const E = Math.max(0, tugStretch(jl, jr));
  const a = Math.atan2(jr.y - jl.y, jr.x - jl.x) - Math.atan2(BITE_LEGS.y - BITE_TOP.y, BITE_LEGS.x - BITE_TOP.x + E);
  const e = body(c, face, false);
  c.save(); c.translate(jl.x, jl.y); c.rotate(a); c.translate(-BITE_TOP.x, -BITE_TOP.y);
  // ---- what's between: the cloth drawn out; then him (thinner the further it goes), quivering raw at the last
  if (E > 0.5) {
    if (E < CLOTH_GIVES) put(c, e, WAIST - 1.5, BY, 3, BH, WAIST, BY, E, BH);
    else {
      const kind: Flesh = E < 22 ? 'skin' : E < 36 ? 'torn' : 'raw';
      const th = 2 * MID_HALF * Math.max(0.38, Math.sqrt(CLOTH_GIVES / (E + 0.01))) * (kind === 'raw' ? 1 + Math.sin(frame * 0.9) * 0.06 : 1);
      put(c, flesh(c, kind, false), 0, -FH, FW, FH * 2, WAIST - 2, MID_Y - th / 2, E + 4, th);
    }
  }
  // ---- the two parts of him, apart by that
  put(c, e, BX, BY, WAIST - BX, BH, BX, BY, WAIST - BX, BH);
  put(c, e, WAIST, BY, BX + BW - WAIST, BH, WAIST + E, BY, BX + BW - WAIST, BH);
  // ---- the cloth ripped at the edges (its threads drawn out longer as it goes)
  if (E >= CLOTH_GIVES) { const k = Math.min(1.5, 0.8 + E / 60); fringe(c, WAIST - 1, MID_Y, 1, k); fringe(c, WAIST + E + 1, MID_Y, -1, k); }
  c.restore();
  return E;
};

/** Half of him (the cats' spoils) with its bite at the origin: 'top' (head and chest, the torn end off toward +x),
 *  'legs' (his hips down, the torn end off toward -x). */
export const drawTuckerHalf = (c: Ctx, which: 'top' | 'legs', face: TuckerFace = 'out') => {
  const b = which === 'top' ? BITE_TOP : BITE_LEGS, e = body(c, face, false);
  c.save(); c.translate(-b.x, -b.y);
  if (which === 'top') { put(c, e, BX, BY, WAIST - BX, BH, BX, BY, WAIST - BX, BH); tornEnd(c, WAIST - 1, MID_Y, 1); }
  else { put(c, e, WAIST, BY, BX + BW - WAIST, BH, WAIST, BY, BX + BW - WAIST, BH); tornEnd(c, WAIST + 1, MID_Y, -1); }
  c.restore();
};
/** Where a half's torn end is, from its bite (unrotated). */
export const halfEnd = (which: 'top' | 'legs') => which === 'top' ? { x: WAIST + 3 - BITE_TOP.x, y: MID_Y - BITE_TOP.y } : { x: WAIST - 3 - BITE_LEGS.x, y: MID_Y - BITE_LEGS.y };
/** A strand of him still strung between the halves as they come apart (raw, `th` through). */
export const drawStrand = (c: Ctx, ax: number, ay: number, bx: number, by: number, th: number) => strip(c, 'raw', false, ax, ay, bx, by, th);

/** His body flat on his back at (x, feetY) facing `facing` (head to the back), headless: the stump out of his collar. */
export const drawHeadlessBody = (c: Ctx, x: number, feetY: number, facing: number, twitch = 0) => {
  c.save(); c.translate(Math.round(x), Math.round(feetY)); c.scale(facing < 0 ? -1 : 1, 1);
  if (twitch) { c.translate(10, -16); c.rotate(twitch); c.translate(-10, 16); }
  put(c, body(c, 'out', true), BX, BY, BW, BH, BX, BY, BW, BH);
  drawNeckStump(c, COLLAR.x + 2, COLLAR.y, Math.PI, 8, 10);
  c.restore();
};
/** His body flat, headless, without the stump (the neck's being drawn out of it). */
export const drawBodyForNeck = (c: Ctx, x: number, feetY: number, facing: number) => {
  c.save(); c.translate(Math.round(x), Math.round(feetY)); c.scale(facing < 0 ? -1 : 1, 1);
  put(c, body(c, 'out', true), BX, BY, BW, BH, BX, BY, BW, BH);
  c.restore();
};

/** THE NECK pulled out of him: from his collar (ax, ay) to under his head (bx, by), in stages by how long it's got. */
export const drawStretchedNeck = (c: Ctx, ax: number, ay: number, bx: number, by: number, frame: number) => {
  const len = Math.hypot(bx - ax, by - ay);
  if (len < 3) return;
  const kind: Flesh = len < 14 ? 'skin' : len < 28 ? 'torn' : 'raw';
  const th = 11 * Math.max(0.5, Math.sqrt(9 / Math.max(9, len))) * (kind === 'raw' ? 1 + Math.sin(frame * 1.1) * 0.07 : 1);
  strip(c, kind, true, ax, ay, bx, by, th);
};

const head = (c: Ctx, face: TuckerFace) => spr(c, `tg-head-${face}`, -34, -38, 68, 76, g => drawTuckerHead(g, 0, 0, 1, 0, 0, face, WOUNDS, false));
/** His head on its own, its middle at (x, y), facing right turned `rot` (mirrored for facing -1). */
export const drawTuckerHeadAt = (c: Ctx, x: number, y: number, facing: number, rot: number, face: TuckerFace) => {
  c.save(); c.translate(x, y); c.scale(facing < 0 ? -1 : 1, 1); c.rotate(rot);
  put(c, head(c, face), -34, -38, 68, 76, -34, -38, 68, 76);
  c.restore();
};
/** His crown (the top of his head) from its middle, and under his jaw where the neck went (his head's units, scaled). */
export const HEAD_CROWN = { x: 0, y: -14 * HS }, HEAD_SOCKET = { x: -2 * HS, y: 12 * HS };
/** His head held up by the crown at (x, y) (a bear's jaws), hanging, the torn neck dangling under it if `stub`. */
export const drawTuckerHeadHeld = (c: Ctx, x: number, y: number, facing: number, rot: number, face: TuckerFace, stub = true) => {
  c.save(); c.translate(x, y); c.scale(facing < 0 ? -1 : 1, 1); c.rotate(rot);
  const cy = -HEAD_CROWN.y;
  if (stub) drawNeckStump(c, HEAD_SOCKET.x, cy + HEAD_SOCKET.y - 2, Math.PI / 2 + 0.25, 9, 9);
  put(c, head(c, face), -34, -38, 68, 76, -34, cy - 38, 68, 76);
  c.restore();
};
