// The armor's look (SPEC.md "Look"; PROVISIONAL land themes, one per piece). Fully decked out he's a mismatched fool:
// "an MMO character who doesn't transmog". Every piece clashes with the next on purpose (rust, coconut, gold and duct
// tape, chrome and red LEDs, cartoon white, souvenir plastic, pink princess plastic, a cheap creased cape), sizes a
// little off, nothing coordinated. Each of the 8 is its own part, worn when has(piece): the cheats' toggles show at once.
//
//   SABATONS   Wilderness  cowboy boots of rusty railroad iron: a pointed iron toe, a stacked heel, rivets, a spur, a
//                          cowbell on the near ankle that clanks on landings and dive kicks (armorMotion.jolt)
//   PAULDRONS  Jungle      two coconut halves strapped on (hairy shell, the white meat round the rim), leopard-print
//                          trim, a plastic tusk glued on (the glue blob shows)
//   LEG ARMOR  Hollywood   gold award statuettes duct-taped down his shins (silver tape), film reels for knee pads
//                          (knee and shin only: nothing over his crotch or seat)
//   ARMGUARDS  Future      chrome bracers with an LED strip scrolling BEEF (a baked strip slid along: no pixel work)
//   HAND ARMOR Cartoon     giant white four-finger cartoon gloves: outlined, three stitches, a rolled cuff
//   HELMET     Foreign     a souvenir-shop Viking helmet: plastic horns, a flag patch, a beer can in a holder each side,
//                          a bendy straw from the near can round the outside of his glasses to his mouth
//   AMULET     Fairy       a pink plastic princess-kit heart jewel in a gold plastic setting, on a sequin chain
//   CAPE       Spooky      a cheap Halloween-store vampire cape: shiny black polyester still creased in squares from the
//                          package, red lining, a tall collar, the price tag flapping off it; never down past his belt
//
// HOW IT'S DRAWN: Meathead 1's body parts (m1 render/player/body.ts) call an ArmorArt hook as each part's drawn (the
// boot, the shin, the forearm, the fist, the shoulder, the head through the glasses, the chest, the cape behind the
// torso), so every pose built from them wears it: the sprite's every pose, the moves, the grabs, the follow-ups, the
// boss deaths that draw him; player.ts calls the same hook on its own hand-drawn limbs. Meathead 1 never sets the hook.
// Each piece goes through armorSeam (spriteOutline.ts), so a tint laid on as he's drawn (the space suit's white) skips it.
// SNES look: each rigid piece is painted ONCE into a little canvas (unit pixels, color ramps, banded shading with a
// checker dither on each band's edge: shade() below), then drawn stretched and turned with the limb (drawImage, no
// per-frame pixel work). The cape bends, so it's a few flat-banded paths a frame; the chain a few dots; the straw a
// stroke; the bell, the price tag and the LED text are baked and only turned or slid.
// VISIBILITY (SPEC.md): the cape stops above his belt; the leg armor is knee and shin; the helmet's brim stops above his
// glasses and the straw goes round them; under the space suit's glass the helmet's shrunk inside it.
// Elsewhere: the HUD face's helmet (amuletFace.ts helmetFace), the cheap shot's close-up boot (closeUp.ts:
// drawSabatonCloseUp), the walk screens (walkArmor.ts).

import { setArmorArt, armorMotion, type ArmorArt } from '../../m1/game/render/player/body';
import { glowLayer, armorSeam } from '../../m1/game/render/player/spriteOutline';
import { has } from './state';
import { FLAT } from './walkArmor';

type C = CanvasRenderingContext2D;
type Ramp = readonly string[];

// ---- the ramps (dark to light)
const RUST: Ramp = ['#2A120A', '#4E2410', '#7A3A18', '#A4532A', '#C9773F'];
const IRON: Ramp = ['#141417', '#26262C', '#3E3E47', '#62626E', '#9A9AA8'];
const BRASS: Ramp = ['#4A2E06', '#7A520E', '#B07F1E', '#DDB24A', '#F8E08A'];
const GOLD: Ramp = ['#5C3D05', '#8A6008', '#C8961A', '#F0C850', '#FFF2B0'];
const CHROME: Ramp = ['#0F172A', '#334155', '#64748B', '#CBD5E1', '#FFFFFF'];
const LEO: Ramp = ['#6E4010', '#A3661C', '#D29A3C', '#EEC676', '#FFEDB8'];
const IVORY: Ramp = ['#6E6248', '#A89A76', '#D8CCA8', '#F2EAD0', '#FFFCF0'];
const STEEL: Ramp = ['#1A1F2A', '#363D4D', '#5E6779', '#97A1B4', '#DCE2EC'];
const PINK: Ramp = ['#6B1640', '#B0185A', '#E64395', '#F7A6D2', '#FFF0F8'];
const WING: Ramp = ['#140C20', '#21163A', '#33255A', '#4C3A80', '#6E5AA8'];
const WOOD: Ramp = ['#2E1A0C', '#4E2E16', '#6E4424', '#8E5E36'];
const BONE: Ramp = ['#8A836E', '#C8C0A6', '#ECE6D2', '#FFFFF6'];

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const rect = (c: C, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
const px = (c: C, x: number, y: number, col: string) => rect(c, x, y, 1, 1, col);

/** The bake's detail: shade() paints this many pixels to a unit (2 or 4 for the bigger pictures of him: the close-ups get
 *  finer bands and dither, not the sprite's stretched). Set by bake() while it paints. */
let SUB = 1;
/**
 * Paints a shape a unit pixel at a time (bake time only; SUB pixels to a unit at the finer details): `inside(x, y)` the
 * pixel's in it, `lit(x, y)` 0..1 how lit it is; the ramp's bands from dark to light, a checker dither along each band's
 * edge (the SNES's stepped shading).
 */
const shade = (c: C, x0: number, y0: number, w: number, h: number, inside: (x: number, y: number) => boolean, lit: (x: number, y: number) => number, ramp: Ramp) => {
  const n = ramp.length - 1, d = 1 / SUB, ox = Math.floor(x0 * SUB), oy = Math.floor(y0 * SUB);
  for (let j = 0; j < h * SUB; j++) for (let i = 0; i < w * SUB; i++) {
    const x = x0 + (i + 0.5) * d, y = y0 + (j + 0.5) * d;
    if (!inside(x, y)) continue;
    const v = clamp01(lit(x, y)) * n, lo = Math.floor(v), fr = v - lo;
    const k = Math.min(n, fr > 0.72 ? lo + 1 : fr > 0.42 && ((ox + i + oy + j) & 1) ? lo + 1 : lo);
    c.fillStyle = ramp[k]; c.fillRect(x0 + i * d, y0 + j * d, d, d);
  }
};
/** How lit a point on a dome is (the light from the upper left, toward us). */
const domeLit = (cx: number, cy: number, rx: number, ry: number, amb = 0.12) => (x: number, y: number) => {
  const nx = (x - cx) / rx, ny = (y - cy) / ry, nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
  return amb + (1 - amb) * Math.max(0, -0.5 * nx - 0.55 * ny + 0.67 * nz);
};
const inEllipse = (cx: number, cy: number, rx: number, ry: number) => (x: number, y: number) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
/** A tapered horn or tusk along a curve (a, control b, tip d), `r0` thick at its root to `r1` at the tip. */
const curveShape = (a: [number, number], b: [number, number], d: [number, number], r0: number, r1: number) => {
  const pts: [number, number, number][] = [];
  for (let k = 0; k <= 24; k++) {
    const t = k / 24, u = 1 - t;
    pts.push([u * u * a[0] + 2 * u * t * b[0] + t * t * d[0], u * u * a[1] + 2 * u * t * b[1] + t * t * d[1], r0 + (r1 - r0) * t]);
  }
  const near = (x: number, y: number) => {
    let best = Infinity, side = 0;
    for (const [qx, qy, r] of pts) { const dd = Math.hypot(x - qx, y - qy) - r; if (dd < best) { best = dd; side = (x - qx) / Math.max(0.3, r); } }
    return { best, side };
  };
  return { inside: (x: number, y: number) => near(x, y).best <= 0, lit: (x: number, y: number) => 0.55 - 0.45 * near(x, y).side };
};

// ---- the baked pieces: each painted once (unit pixels, BAKE canvas pixels to a unit), a far-side copy in shadow; for the
// bigger pictures of him a finer copy (`lvl` 2 or 4: twice or four times the pixels, the bands and dither painted that
// much finer), and for the inked pictures (the Fairy Wheel's close-ups) a copy with an ink line round it (`ink` units
// thick). Each made the first time it's wanted (lazily: nothing painted at load), then kept.
const BAKE = 4;
const INK_COL = '#0A0A0A';
const baked = new Map<string, HTMLCanvasElement | null>();
const bake = (key: string, w: number, h: number, paint: (c: C, back: boolean) => void, back = false, lvl = 1, ink = 0): HTMLCanvasElement | null => {
  const id = `${key}${back ? ':b' : ''}${lvl > 1 ? '@' + lvl : ''}${ink ? '~' + ink : ''}`;
  const have = baked.get(id);
  if (have !== undefined) return have;
  let cv: HTMLCanvasElement | null = null;
  if (typeof document !== 'undefined') {
    const B = BAKE * lvl;
    if (ink) {
      // (the plain one, its silhouette in ink stamped round it `ink` units out, the plain one over that)
      const base = bake(key, w, h, paint, back, lvl, 0);
      if (base) {
        const P = Math.round(ink * B), sil = document.createElement('canvas');
        sil.width = base.width + 2 * P; sil.height = base.height + 2 * P;
        const s = sil.getContext('2d');
        cv = document.createElement('canvas'); cv.width = sil.width; cv.height = sil.height;
        const c = cv.getContext('2d');
        if (s && c) {
          for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2; s.drawImage(base, P + Math.round(Math.cos(a) * P), P + Math.round(Math.sin(a) * P)); }
          s.globalCompositeOperation = 'source-in'; s.fillStyle = INK_COL; s.fillRect(0, 0, sil.width, sil.height);
          c.drawImage(sil, 0, 0); c.drawImage(base, P, P);
        } else cv = null;
      }
    } else {
      cv = document.createElement('canvas');
      cv.width = Math.ceil(w * B); cv.height = Math.ceil(h * B);
      const c = cv.getContext('2d');
      if (c) {
        c.scale(B, B);
        SUB = lvl;
        try { paint(c, back); } finally { SUB = 1; }
        // (the far one: in his shadow)
        if (back) { c.globalCompositeOperation = 'source-atop'; c.fillStyle = 'rgba(24, 12, 30, 0.36)'; c.fillRect(0, 0, w, h); }
      } else cv = null;
    }
  }
  baked.set(id, cv);
  return cv;
};

/** How the pieces are drawn just now (withArmor sets it for a drawing of its own): an ink line round each (units; 0 none),
 *  the detail (0: worked out from how big it's drawn), the straw's path on from the helmet's near can (null: the
 *  sprite's own, round the front of his glasses). */
type StrawPath = (hx: number, ey: number) => [number, number][];
const style: { ink: number; level: number; straw: StrawPath | null } = { ink: 0, level: 0, straw: null };
/** The detail for a piece drawn `upx` canvas units to a unit at the canvas's transform now: 1 (the sprite's) up to about
 *  4.5 screen pixels to a unit, then 2, then 4 past 9. */
const levelFor = (ctx: C, upx: number) => {
  if (style.level) return style.level;
  const m = ctx.getTransform(), s = Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) * upx;
  return s > 9 ? 4 : s > 4.5 ? 2 : 1;
};
/** A baked piece (`w` x `h` units, painted by `paint`) drawn into the rect (x, y, dw, dh): at the detail its size wants,
 *  inked if the drawing's inked (the ink round it, outside the rect). */
const piece = (ctx: C, key: string, w: number, h: number, paint: (c: C, back: boolean) => void, back: boolean, x: number, y: number, dw: number, dh: number) => {
  const ink = style.ink, img = bake(key, w, h, paint, back, levelFor(ctx, Math.max(Math.abs(dw / w), Math.abs(dh / h))), ink);
  if (!img) return;
  if (!ink) { ctx.drawImage(img, x, y, dw, dh); return; }
  const ux = (dw / w) * ink, uy = (dh / h) * ink;
  ctx.drawImage(img, x - ux, y - uy, dw + 2 * ux, dh + 2 * uy);
};

// ---------------------------------------------------------------------------------------------------------------------
// SABATONS (Wilderness): cowboy boots of rusty railroad iron, 22 x 17. The boot's own rect (the hook's x, y, w, h: 16 x 8
// units) is x 4..20, y 8..16, the toe at the right; the shaft rises above it to y 2 round his ankle; the spur sticks out
// off the heel at the left.
const SAB_W = 22, SAB_H = 17, SAB_OX = 4, SAB_OY = 8;
const paintSabaton = (c: C, back: boolean) => {
  const X = SAB_OX, Y = SAB_OY;
  // (the boot keeps inside its own rect (nothing up his shin, so it never sits over the leg armor): the shaft round his
  // ankle across the back of its top, the foot from its front down a slope to a pointed toe, a flat sole under it)
  const top = (x: number) => (x < X + 7 ? Y + 0.2 : Y + 2 + (x - X - 7) * 0.3);
  const foot = (x: number, y: number) => x > X && x < X + 16.8 && y > top(x) && y < Y + 6.2 && !(x > X + 14 && y < top(x) + (x - X - 14) * 0.6);
  shade(c, X, Y, 17, 7, foot, (x, y) => 0.95 - ((y - top(x)) / Math.max(1, Y + 6.2 - top(x))) * 0.7, RUST);
  // (the iron toe cap: a darker plate over the point, a lit rim)
  shade(c, X + 11, Y + 1, 7, 6, (x, y) => foot(x, y) && x > X + 11.5, (x, y) => 0.85 - (y - Y - 2) * 0.12 - (x - X - 12) * 0.03, IRON);
  for (let x = X + 12; x < X + 16; x++) px(c, x, Math.ceil(top(x)), IRON[4]);
  // (the shaft's top: a lit rim, a V notch cut in its front, the pull strap's tab; its seam down the back)
  rect(c, X + 0.2, Y + 0.2, 6.8, 0.7, RUST[4]);
  c.fillStyle = RUST[0]; c.beginPath(); c.moveTo(X + 4.2, Y + 0.2); c.lineTo(X + 5.4, Y + 1.8); c.lineTo(X + 6.6, Y + 0.2); c.closePath(); c.fill();
  rect(c, X + 1, Y + 0.2, 1.2, 1.4, RUST[0]); rect(c, X + 1.2, Y + 0.4, 0.7, 0.9, RUST[3]);
  for (let y = Y + 1; y < Y + 5; y++) px(c, X + 7, y, RUST[1]);
  // (rivets down the shaft's seam and along the welt, lit on top; the pitting)
  for (const [rx, ry] of [[X + 2.6, Y + 2], [X + 6, Y + 2.6], [X + 9, Y + 4.4], [X + 12, Y + 4.6], [X + 3, Y + 4.4]] as const) { px(c, rx, ry, '#F2B27A'); px(c, rx, ry + 1, RUST[0]); }
  for (const [rx, ry] of [[X + 4, Y + 2], [X + 8, Y + 3], [X + 10, Y + 3], [X + 5, Y + 4]] as const) px(c, rx, ry, (rx + ry) % 2 ? '#D9772E' : RUST[1]);
  // (the stacked heel under the back, taller than the sole; the sole's lit edge)
  shade(c, X, Y + 6, 4, 3, (x, y) => x > X + 0.2 && x < X + 3.8 - (y - Y - 6) * 0.4 && y > Y + 6 && y < Y + 8.6, (_x, y) => (y < Y + 7 ? 0.7 : 0.3), IRON);
  rect(c, X + 4, Y + 6, 13, 1.2, IRON[1]); rect(c, X + 4, Y + 6, 13, 0.5, IRON[3]);
  if (back) return;
  // (the spur: a strap round the heel, a shank out the back, a star rowel)
  rect(c, X - 0.2, Y + 4.4, 2, 0.8, IRON[2]);
  rect(c, X - 2, Y + 4.6, 2, 0.6, '#CBD5E1');
  for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; c.fillStyle = k % 2 ? '#E2E8F0' : '#94A3B8'; c.fillRect(X - 2.6 + Math.cos(a) * 1.3 - 0.35, Y + 4.9 + Math.sin(a) * 1.3 - 0.35, 0.7, 0.7); }
  px(c, X - 3, Y + 4.5, '#F8FAFC');
};
/** The cowbell (6 x 7: hung from the middle of its top). */
const paintBell = (c: C) => {
  rect(c, 2.3, 0, 1.4, 1.4, '#5C3A1E');
  shade(c, 0, 1, 6, 6, (x, y) => y > 1.2 && y < 6 && Math.abs(x - 3) < 1.3 + (y - 1.2) * 0.38, (x, y) => 0.95 - (x - 1) * 0.17 - (y - 1) * 0.04, BRASS);
  rect(c, 0.6, 5.6, 4.8, 0.8, BRASS[0]); px(c, 2.5, 6, '#1A1206'); px(c, 1.4, 2, BRASS[4]);
};

// ---------------------------------------------------------------------------------------------------------------------
// LEG ARMOR (Hollywood): a gold award statuette duct-taped down the shin, 10 x 16 (+y from the knee down: its head at
// the top, its base at the bottom); a film reel for a knee pad, 10 x 10.
const paintStatue = (c: C) => {
  // (the little gold man: head, shoulders, arms folded down the front of him, tapering to his feet; on a black base)
  const hw = (y: number) => (y < 2.6 ? 1.6 - Math.abs(y - 1.6) * 0.5 : y < 4 ? 1.8 + (y - 2.6) * 1.2 : 3.4 - (y - 4) * 0.2);
  const man = (x: number, y: number) => y > 0.4 && y < 12.4 && Math.abs(x - 5) < hw(y) && !(y > 2.4 && y < 3.0 && Math.abs(x - 5) > 1);
  shade(c, 0, 0, 10, 13, man, (x, y) => 0.95 - Math.abs(x - 4.2) * 0.22 - (y > 4 ? 0.05 : 0), GOLD);
  for (let y = 5; y < 8; y++) px(c, 5, y, GOLD[1]);
  rect(c, 3.6, 5, 2.8, 0.6, GOLD[1]);
  rect(c, 2, 12.4, 6, 2.4, '#18181B'); rect(c, 2, 12.4, 6, 0.6, '#52525B'); rect(c, 2.4, 13.4, 5.2, 0.5, GOLD[3]);
  // (the duct tape: two silver strips round the shin over it, wrinkled, one end torn ragged)
  for (const ty of [3.4, 9.4]) {
    rect(c, 0, ty, 10, 1.8, '#9CA3AF'); rect(c, 0, ty, 10, 0.5, '#E5E7EB'); rect(c, 0, ty + 1.4, 10, 0.4, '#6B7280');
    for (let x = 1; x < 10; x += 2.5) rect(c, x, ty + 0.5, 0.5, 0.9, '#D1D5DB');
    px(c, 9, ty + 1.8, '#9CA3AF');
  }
};
const paintReel = (c: C) => {
  // (silver metal, the black film wound on it, the holes round the hub)
  shade(c, 0, 0, 10, 10, inEllipse(5, 5, 4.8, 4.8), domeLit(5, 5, 4.8, 4.8, 0.25), STEEL);
  c.fillStyle = '#0A0A0A'; c.beginPath(); c.arc(5, 5, 2.7, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#52525B'; c.beginPath(); c.arc(5, 5, 2.7, Math.PI * 1.1, Math.PI * 1.5); c.arc(5, 5, 2.1, Math.PI * 1.5, Math.PI * 1.1, true); c.fill();
  shade(c, 2, 2, 6, 6, inEllipse(5, 5, 1.5, 1.5), domeLit(5, 5, 1.5, 1.5, 0.3), STEEL);
  for (let k = 0; k < 3; k++) { const a = -Math.PI / 2 + k * (Math.PI * 2 / 3); px(c, Math.round(5 + Math.cos(a) * 2.4 - 0.5), Math.round(5 + Math.sin(a) * 2.4 - 0.5), '#71717A'); }
  px(c, 4.5, 4.5, '#18181B');
};

// ---------------------------------------------------------------------------------------------------------------------
// ARMGUARDS (Future): 14 x 10 along the forearm (+x elbow to wrist, centred on y = 5); chrome in stark bands, a dark LED
// window down it (x 2..12, y 2.5..7.5) the scrolling text's slid through each frame.
const LED_X0 = 2, LED_W = 10, LED_Y0 = 2.5, LED_H = 5;
const paintBracer = (c: C) => paintBracerOf(c, true);
/** ...without the LED slot (the walk screens: the whole word goes on it as a panel of its own). */
const paintBracerPlain = (c: C) => paintBracerOf(c, false);
const paintBracerOf = (c: C, slot: boolean) => {
  const hw = (x: number) => 4.8 - 0.8 * (x / 14);
  const inside = (x: number, y: number) => x > 0.4 && x < 13.6 && Math.abs(y - 5) < hw(x) && !((x < 1.2 || x > 12.8) && Math.abs(y - 5) > hw(x) - 1.2);
  shade(c, 0, 0, 14, 10, inside, (x, y) => {
    const v = (y - 5) / hw(x);
    return v < -0.6 ? 0.98 : v < -0.2 ? 0.62 : v < 0.18 ? 0.2 : v < 0.6 ? 0.5 : 0.28;
  }, CHROME);
  if (!slot) return;
  // (the LED window, recessed: a black slot, a lit lip under it)
  rect(c, LED_X0 - 0.4, LED_Y0 - 0.4, LED_W + 0.8, LED_H + 0.8, '#020617');
  rect(c, LED_X0 - 0.4, LED_Y0 + LED_H + 0.4, LED_W + 0.8, 0.4, CHROME[4]);
  // (bolts at the ends)
  for (const bx of [0.8, 12.6]) { px(c, bx, 2, CHROME[4]); px(c, bx, 7, CHROME[1]); }
};
/** The LED text, "BEEF", red dot-matrix, twice over (48 x 5: one pass is 24, so a window slid along it wraps). */
const LED_FONT: Record<string, string[]> = {
  B: ['110', '101', '110', '101', '110'], E: ['111', '100', '110', '100', '111'], F: ['111', '100', '110', '100', '100'], ' ': ['000', '000', '000', '000', '000'],
};
const LED_TEXT = 'BEEF  ', LED_RUN = LED_TEXT.length * 4;
const paintLed = (c: C) => {
  for (let i = 0; i < LED_TEXT.length * 2; i++) {
    const g = LED_FONT[LED_TEXT[i % LED_TEXT.length]];
    for (let y = 0; y < 5; y++) for (let x = 0; x < 4; x++) {
      const on = x < 3 && g[y][x] === '1';
      px(c, i * 4 + x, y, on ? '#FF3B3B' : '#3A0A0A');
      if (on && (x + y) % 3 === 0) px(c, i * 4 + x, y, '#FFB4B4');
    }
  }
};
/** The LEDs' glow (behind the outline: the sprite's glow layer). */
const paintBracerGlow = (c: C) => {
  const g = c.createRadialGradient(7, 4, 0.5, 7, 4, 7);
  g.addColorStop(0, 'rgba(255, 59, 59, 0.45)'); g.addColorStop(1, 'rgba(255, 59, 59, 0)');
  c.fillStyle = g; c.fillRect(0, 0, 14, 8);
};
/** The whole word BEEF on a dark LED panel, 17 x 7 (two frames of a chase: a sparkle moving along the lit LEDs), for
 *  the walk screens, where a hanging forearm's wide enough to show it whole and upright. */
const paintLedWord = (c: C, phase: number) => {
  rect(c, 0, 0, 17, 7, '#020617');
  ['B', 'E', 'E', 'F'].forEach((ch, i) => {
    const g = LED_FONT[ch];
    for (let y = 0; y < 5; y++) for (let x = 0; x < 3; x++) {
      const on = g[y][x] === '1';
      px(c, 1 + i * 4 + x, 1 + y, on ? ((x + y + i + phase) % 4 === 0 ? '#FFD0D0' : '#FF3B3B') : '#3A0A0A');
    }
  });
};
/** Draws the whole word upright on screen, its middle at (x, y), `k` px to an LED. */
export const drawLedWord = (ctx: C, x: number, y: number, k: number, frame: number) => {
  const ph = Math.floor(frame / 8) % 2;
  const img = bake('ledw' + ph, 17, 7, c => paintLedWord(c, ph * 2));
  if (img) ctx.drawImage(img, x - 8.5 * k, y - 3.5 * k, 17 * k, 7 * k);
};
/** Slides the LED text through the window: (x, y, w, h) where the window is drawn, in the current frame; turned so it
 *  reads upright and left to right on screen whichever way the arm points or he faces. */
export const drawLed = (ctx: C, x: number, y: number, w: number, h: number, frame: number) => {
  const img = bake('led', LED_RUN * 2, 5, paintLed);
  if (!img) return;
  const m = ctx.getTransform();
  let sx = 1, sy = 1;
  if (m.a * m.d - m.b * m.c < 0) sy = -1;
  if (m.a * sx < 0) { sx = -sx; sy = -sy; }
  // (as many columns as fit with square LEDs: the letters keep their shape, only so many show at once)
  const off = Math.floor(frame / 6) % LED_RUN, shown = Math.max(4, Math.min(LED_RUN, Math.round(w / (h / 5))));
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(sx, sy);
  ctx.drawImage(img, off * BAKE, 0, shown * BAKE, 5 * BAKE, -w / 2, -h / 2, w, h);
  ctx.restore();
};

// ---------------------------------------------------------------------------------------------------------------------
// HAND ARMOR (Cartoon): 18 x 18 round the fist (its middle at (10, 9); +x the way the forearm points): a giant white
// four-finger cartoon glove balled up, flat white, one flat shade, a heavy black outline, three stitches across the back,
// a rolled cuff at the wrist.
const GLOVE = 18;
/** Where the glove's picture starts, from the fist's middle (fist units): its cuff's back edge (x 2.2) just past the wrist
 *  (the fist's middle is 4.5 past it), so it never sits over the armguard. */
const GLOVE_AT = -6.3;
/** The cuff's back edge in the glove's picture (the walk screens line it up past the wrist too). */
export const GLOVE_BACK = 2.2;
const paintGlove = (c: C) => {
  const fingers: [number, number][] = [[15.2, 4.4], [16, 7.6], [16, 10.8], [15.2, 13.8]];
  // (the outline first, a size up all round: the cartoon's black line)
  c.fillStyle = '#0A0A0A';
  c.beginPath(); c.arc(10, 9, 7, 0, Math.PI * 2); c.fill();
  for (const [fx, fy] of fingers) { c.beginPath(); c.arc(fx, fy, 2.6, 0, Math.PI * 2); c.fill(); }
  c.beginPath(); c.arc(9, 2.6, 2.6, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.roundRect(2.2, 2.6, 4.6, 12.8, 1.8); c.fill();
  // (the hand, the curled fingers along its front, the thumb over the top)
  c.fillStyle = '#FAFAFA'; c.beginPath(); c.arc(10, 9, 6, 0, Math.PI * 2); c.fill();
  for (const [fx, fy] of fingers) { c.beginPath(); c.arc(fx, fy, 1.7, 0, Math.PI * 2); c.fill(); }
  c.beginPath(); c.arc(9, 2.6, 1.7, 0, Math.PI * 2); c.fill();
  // (the one flat shade, under; the creases between the fingers)
  c.fillStyle = '#D4D4D8'; c.beginPath(); c.arc(10, 9, 6, Math.PI * 0.12, Math.PI * 0.88); c.arc(10, 7.2, 5.4, Math.PI * 0.85, Math.PI * 0.15, true); c.fill();
  c.fillStyle = '#0A0A0A'; for (const fy of [6, 9.2, 12.4]) c.fillRect(13.6, fy - 0.3, 2.4, 0.6);
  // (the cuff, rolled, flaring out over the wrist)
  c.fillStyle = '#FAFAFA'; c.beginPath(); c.roundRect(3, 3.4, 3, 11.2, 1.2); c.fill();
  c.fillStyle = '#D4D4D8'; c.fillRect(3, 11, 3, 3.4); c.fillStyle = '#0A0A0A'; c.fillRect(5, 3.8, 0.6, 10.2);
  // (the three stitches across the back of it)
  c.fillStyle = '#18181B'; for (const sy of [6.4, 9, 11.6]) c.fillRect(7.4, sy - 0.35, 3.8, 0.7);
  // (the cartoon shine)
  c.fillStyle = '#FFFFFF'; c.fillRect(7, 4.4, 2, 1);
};

// ---------------------------------------------------------------------------------------------------------------------
// PAULDRONS (Jungle): 20 x 18, the deltoid's middle at (9, 10); a coconut half strapped on: the hairy shell, its three
// eyes, the white meat showing round the rim, leopard-print trim under that, a plastic tusk glued on.
const COCO: Ramp = ['#24120A', '#3E2212', '#5E361C', '#80502C', '#A26C40'];
const paintPauldronLit = (c: C, far: boolean) => {
  const dome = inEllipse(9, 11, 8.4, 8.2), lit = domeLit(8, 10, 8.4, 8.2, 0.16);
  // (the -x one's drawn mirrored (its tusk out that way): its dome's light painted mirrored too, so once it's turned
  // round it's lit from the same side as the other)
  shade(c, 0, 2, 18, 10, (x, y) => dome(x, y) && y < 11.4, far ? (x, y) => lit(18 - x, y) : lit, COCO);
  // (the husk's hair: short lit strands, the shell's three eyes near its top)
  for (const [hx, hy] of [[4, 6], [7, 4.4], [11, 5], [14, 7], [5, 9], [9, 7.6], [12, 9.4], [15, 9.6], [3, 9.6], [8, 10]] as const) { px(c, hx, hy, COCO[4]); px(c, hx + 1, hy + 1, COCO[3]); }
  for (const [ex, ey] of [[7, 4], [9, 3.6], [8, 5.4]] as const) px(c, ex, ey, '#0E0704');
  // (the white meat round the rim, a brown skin line on it)
  rect(c, 1, 11.4, 16, 1.2, '#F7F3E8'); rect(c, 1, 11.4, 16, 0.4, '#FFFFFF'); rect(c, 1, 12.4, 16, 0.3, COCO[2]);
  // (the leopard-print trim strapped round under it)
  shade(c, 0, 12, 18, 3, (x, y) => x > 0.6 && x < 17.4 && y > 12.7 && y < 14.8, (_x, y) => (y < 13.4 ? 0.95 : 0.55), LEO);
  for (let x = 1.5; x < 17; x += 2.6) { px(c, x, 13.2 + ((x * 3) % 2), '#1C0F04'); px(c, x + 1, 13.8, '#1C0F04'); }
  // (the plastic tusk: glossy white, glued on with a blob of clear glue)
  const t = curveShape([12.5, 6.2], [17.5, 5.2], [19, 0.4], 1.6, 0.35);
  shade(c, 10, 0, 10, 8, t.inside, (x, y) => 0.5 + 0.5 * t.lit(x, y), ['#B8B8C0', '#E4E4EA', '#F8F8FC', '#FFFFFF']);
  px(c, 16, 3, '#FFFFFF'); px(c, 17, 2, '#FFFFFF');
  c.fillStyle = 'rgba(220, 240, 255, 0.75)'; c.fillRect(11.2, 5.4, 3, 1.6); px(c, 11.6, 5.6, '#FFFFFF');
};
const paintPauldron = (c: C) => paintPauldronLit(c, false);
const paintPauldronFar = (c: C) => paintPauldronLit(c, true);

// ---------------------------------------------------------------------------------------------------------------------
// HELMET (Foreign): 36 x 26, his head's middle at x 18, his eyes' line at y 24; a souvenir-shop Viking helmet: a silver
// plastic dome, plastic horns, a flag patch, a beer can in a holder on each side. Its brim stops at y 19.4 (his eyes'
// line less 4.6): the glasses' rims start lower, so they always show. The straw's drawn on its own (helmetStraw).
const HELM_W = 36, HELM_H = 26, HELM_MX = 18;
const PLASTIC: Ramp = ['#4B5563', '#9CA3AF', '#C9CED6', '#E5E7EB', '#FFFFFF'];
const HORN: Ramp = ['#B08A2E', '#E3C25A', '#F7E08E', '#FFF6CC'];
const CAN_RED: Ramp = ['#5A0A0A', '#991B1B', '#DC2626', '#F87171'];
const CAN_BLUE: Ramp = ['#0B1E5B', '#1E40AF', '#3B82F6', '#93C5FD'];
const paintCan = (c: C, x0: number, y0: number, ramp: Ramp) => {
  // (the holder: a black foam ring on a strap; the can in it, a silver top, a stripe)
  shade(c, x0, y0, 5, 7, (x, y) => x > x0 + 0.3 && x < x0 + 4.7 && y > y0 + 0.8 && y < y0 + 6.8, (x) => 0.9 - (x - x0) * 0.18, ramp);
  rect(c, x0 + 0.3, y0 + 0.2, 4.4, 0.8, '#D4D4D8'); rect(c, x0 + 0.3, y0 + 0.2, 4.4, 0.3, '#FFFFFF');
  rect(c, x0 + 0.3, y0 + 3, 4.4, 0.8, '#F8FAFC');
  rect(c, x0, y0 + 4.6, 5, 2.4, '#18181B'); rect(c, x0, y0 + 4.6, 5, 0.4, '#3F3F46');
};
const paintHelmet = (c: C) => {
  const M = HELM_MX;
  // (the far can, behind: in its holder off the far side, its strap round the dome)
  paintCan(c, M - 17.6, 11, CAN_BLUE);
  // (the far horn, behind it: plastic, a mould seam down it)
  const far = curveShape([M - 7, 15], [M - 12.5, 13], [M - 13.4, 3], 2.1, 0.5);
  shade(c, M - 16, 1, 12, 16, far.inside, (x, y) => far.lit(x, y) * 0.6, HORN);
  // (the dome: silver plastic, flat lit, one hard white shine)
  const dome = (x: number, y: number) => ((x - M + 0.5) / 12.2) ** 2 + ((y - 19.5) / 10.4) ** 2 <= 1 && y < 19.5;
  shade(c, M - 13, 9, 26, 11, dome, domeLit(M - 1.5, 18, 12.2, 10.4, 0.3), PLASTIC);
  rect(c, M - 7, 11, 4, 0.8, '#FFFFFF'); rect(c, M - 8, 12, 1.4, 0.8, '#FFFFFF');
  // (the moulded "band" over the top, fake rivets)
  rect(c, M - 1.8, 9.4, 2.6, 10, PLASTIC[1]); rect(c, M - 1.8, 9.4, 0.8, 10, PLASTIC[3]);
  for (let y = 11; y < 18; y += 2.5) px(c, M - 1, Math.floor(y), '#FFFFFF');
  // (the brim)
  shade(c, M - 13, 17, 26, 3, (x, y) => x > M - 12.7 && x < M + 11.7 && y > 17.2 && y < 19.4, (_x, y) => (y < 18 ? 0.8 : 0.4), PLASTIC);
  for (let x = M - 11; x < M + 11; x += 3) px(c, x, 18, '#FFFFFF');
  // (the flag patch: a Nordic cross, stitched on crooked)
  rect(c, M - 10, 12, 6, 4, '#F8FAFC'); rect(c, M - 9.6, 12.4, 5.2, 3.2, '#C8102E'); rect(c, M - 8, 12.4, 1, 3.2, '#F8FAFC'); rect(c, M - 9.6, 13.6, 5.2, 0.8, '#F8FAFC');
  rect(c, M - 7.8, 12.4, 0.6, 3.2, '#1D4ED8'); rect(c, M - 9.6, 13.8, 5.2, 0.4, '#1D4ED8');
  // (the near horn: out of a plastic ring, curving up and out, a hard shine and the mould seam)
  const near = curveShape([M + 6.5, 15], [M + 12, 13], [M + 13.4, 2.5], 2.2, 0.5);
  shade(c, M + 3, 1, 13, 16, near.inside, near.lit, HORN);
  for (let k = 0; k < 5; k++) px(c, M + 11 + k * 0.3, 11 - k * 1.8, '#FFFFFF');
  shade(c, M + 4, 12, 5, 5, (x, y) => Math.hypot(x - M - 6.5, y - 14.8) < 2.4, (x) => 0.95 - (x - M - 4) * 0.15, HORN);
  // (the near can, in front: red, in its holder off the near side)
  paintCan(c, M + 12.4, 11, CAN_RED);
};
/** The bendy straw from the near can round the outside of his glasses to the corner of his mouth (the head's frame: hx
 *  its middle, ey the eyes' line; the near can's top at (sx, sy)). Never over the glasses: down past their front edge
 *  (hx + 8) at hx + 11, in under them (ey + 3.1) only below ey + 3.5. */
const helmetStraw = (ctx: C, hx: number, ey: number, sx: number, sy: number) => {
  // (a drawing with a face of its own says where it goes on from the can (withArmor's straw), its bend at the second
  // to last point; else round the front of the sprite's glasses)
  const own = style.straw?.(hx, ey);
  const pts: [number, number][] = own ? [[sx, sy], ...own] : [[sx, sy], [hx + 11, ey - 4.5], [hx + 11, ey + 3.5], [hx + 6, ey + 7.6]];
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const path = () => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); };
  ctx.strokeStyle = '#0A0A0A'; ctx.lineWidth = 1.7 + style.ink; path(); ctx.stroke();
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1.05; path(); ctx.stroke();
  ctx.strokeStyle = '#EF4444'; ctx.setLineDash([1, 1.1]); path(); ctx.stroke(); ctx.setLineDash([]);
  // (the bendy bit's ridges, at the bend)
  const [bx, by] = pts[pts.length - 2];
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(bx - 0.6, by - 0.9, 1.3, 0.4); ctx.fillRect(bx - 1, by + 0.1, 1.3, 0.4);
  ctx.restore();
};

// ---------------------------------------------------------------------------------------------------------------------
// AMULET (Fairy): 10 x 12: a pink plastic princess-kit heart jewel in a gold plastic setting, three little tiara points
// on top of it.
const paintAmulet = (c: C) => {
  // (the tiara points: gold plastic, a pink dot on each)
  for (const [sx, h] of [[2, 2], [4.6, 3], [7.2, 2]] as const) { rect(c, sx, 3.4 - h, 0.9, h, '#FACC15'); px(c, sx, 3.4 - h, '#F472B6'); }
  // (the setting: a heart of yellow plastic)
  const heart = (x: number, y: number, k: number) => {
    const u = (x - 5) / (4.6 * k), v = (y - 7) / (4.4 * k);
    return (u * u + v * v - 0.3) ** 3 - u * u * (-v) ** 3 * 1.2 < 0 || (Math.abs(u) < 0.95 - (v - 0.1) * 0.9 && v > 0 && v < 1);
  };
  shade(c, 0, 2, 10, 10, (x, y) => heart(x, y, 1), (x, y) => 0.9 - (x - 2) * 0.08 - (y - 3) * 0.04, ['#8A5A00', '#CA8A04', '#FACC15', '#FEF08A']);
  // (the jewel: hot pink plastic, faceted, a big shine)
  shade(c, 0, 2, 10, 10, (x, y) => heart(x, y, 0.72), (x, y) => (x < 5 ? 0.85 : 0.4) + (y < 6.5 ? 0.15 : -0.12), PINK);
  rect(c, 2.8, 4.6, 1.2, 1.6, '#FFFFFF'); px(c, 4, 4.6, '#FFFFFF'); px(c, 6, 8, '#FCE7F3');
};

// ---------------------------------------------------------------------------------------------------------------------
// CAPE (Spooky): the plastic skull clasp 6 x 6; the price tag 6 x 9 (its string's end at (3, 0)).
const paintSkull = (c: C) => {
  shade(c, 0, 0, 6, 5, inEllipse(3, 2.4, 2.8, 2.4), domeLit(3, 2.4, 2.8, 2.4, 0.3), BONE);
  rect(c, 1.6, 4, 2.8, 1.6, BONE[2]); px(c, 2, 5, BONE[0]); px(c, 3.4, 5, BONE[0]);
  px(c, 1, 2, '#18181B'); px(c, 2, 2, '#18181B'); px(c, 4, 2, '#18181B'); px(c, 3, 3.4, '#3F3F46');
};
const paintTag = (c: C) => {
  rect(c, 2.8, 0, 0.5, 3, '#E5E7EB');
  c.fillStyle = '#0A0A0A'; c.beginPath(); c.moveTo(1.2, 2.4); c.lineTo(4.8, 2.4); c.lineTo(5.8, 3.6); c.lineTo(5.8, 9); c.lineTo(0.2, 9); c.lineTo(0.2, 3.6); c.closePath(); c.fill();
  c.fillStyle = '#FFFBEB'; c.beginPath(); c.moveTo(1.5, 2.9); c.lineTo(4.5, 2.9); c.lineTo(5.3, 3.8); c.lineTo(5.3, 8.5); c.lineTo(0.7, 8.5); c.lineTo(0.7, 3.8); c.closePath(); c.fill();
  px(c, 2.6, 3.4, '#0A0A0A');
  // ("$4.99" in a red scrawl: a few strokes)
  rect(c, 1.2, 5, 0.6, 2.4, '#DC2626'); rect(c, 2.3, 5, 0.6, 1.4, '#DC2626'); rect(c, 2.3, 6, 1.2, 0.5, '#DC2626'); rect(c, 3.1, 5, 0.6, 2.4, '#DC2626');
  rect(c, 4.2, 5, 0.6, 2.4, '#DC2626'); rect(c, 1, 7.8, 3.8, 0.4, '#FCA5A5');
};
const CAPE: Ramp = ['#05050A', '#11111E', '#1F1F36', '#34345A', '#7A7AB0'];

/** A checker of one color (band edges): a 2x2 pattern made once, a unit to a cell. */
let checkCanvas: HTMLCanvasElement | null = null;
const checks = new Map<string, CanvasPattern | string>();
const checker = (ctx: C, col: string): CanvasPattern | string => {
  const have = checks.get(col);
  if (have) return have;
  if (typeof document === 'undefined') return col;
  checkCanvas = document.createElement('canvas'); checkCanvas.width = 2; checkCanvas.height = 2;
  const g = checkCanvas.getContext('2d')!;
  g.fillStyle = col; g.fillRect(0, 0, 1, 1); g.fillRect(1, 1, 1, 1);
  const p = ctx.createPattern(checkCanvas, 'repeat') ?? col;
  checks.set(col, p);
  return p;
};

// ---------------------------------------------------------------------------------------------------------------------
// Drawing them on (the hook)

/** Where a scaled baked piece goes: drawn if it's baked (no DOM: nothing). */
const put = (ctx: C, img: HTMLCanvasElement | null, x: number, y: number, w: number, h: number) => { if (img) ctx.drawImage(img, x, y, w, h); };

const capeFan = (ctx: C, rx: number, ry: number, tips: [number, number][], scallop: [number, number][], k: number) => {
  ctx.beginPath(); ctx.moveTo(rx, ry);
  const s = (p: [number, number]) => [rx + (p[0] - rx) * k, ry + (p[1] - ry) * k] as const;
  const t0 = s(tips[0]); ctx.lineTo(t0[0], t0[1]);
  for (let i = 1; i < tips.length; i++) { const q = s(scallop[i - 1]), t = s(tips[i]); ctx.quadraticCurveTo(q[0], q[1], t[0], t[1]); }
  ctx.closePath();
};

/** How hard the cowbell's swinging (a landing's squash, a dive kick: armorMotion.jolt), as an angle, this frame. */
const bellSwing = () => {
  const m = armorMotion, f = m.frame;
  return Math.sin(f * 1.1) * 0.75 * m.jolt + Math.sin(f * 0.15) * 0.08 - m.fwd * 0.03;
};
/** The cowbell hung at (x, y) (its strap's top), `s` units to a bell pixel; the clank lines when it's swinging hard. */
export const drawBell = (ctx: C, x: number, y: number, s: number, a: number, jolt: number, frame: number) => {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  piece(ctx, 'bell', 6, 7, paintBell, false, -3 * s, 0, 6 * s, 7 * s);
  ctx.restore();
  if (jolt > 0.25 && frame % 4 < 2) {
    ctx.fillStyle = '#FFFFFF';
    const side = frame % 8 < 4 ? 1 : -1;
    ctx.fillRect(x + side * 4.2 * s, y + 3 * s, 1.6 * s, 0.5 * s); ctx.fillRect(x + side * 3.8 * s, y + 5 * s, 1.4 * s, 0.5 * s);
  }
};

const drawSabaton = (ctx: C, x: number, y: number, w: number, h: number, back: boolean) => {
  const sx = w / 16, sy = h / 8;
  piece(ctx, 'sab', SAB_W, SAB_H, paintSabaton, back, x - SAB_OX * sx, y - SAB_OY * sy, SAB_W * sx, SAB_H * sy);
  if (!back) drawBell(ctx, x + 6.4 * sx, y + 0.6 * sy, Math.min(sx, sy) * 0.85, bellSwing(), armorMotion.jolt, armorMotion.frame);
};
const drawShin = (ctx: C, hip: [number, number], knee: [number, number], foot: [number, number], back: boolean) => {
  const dx = foot[0] - knee[0], dy = foot[1] - knee[1], len = Math.hypot(dx, dy);
  ctx.save(); ctx.translate(knee[0], knee[1]); ctx.rotate(Math.atan2(dy, dx) - Math.PI / 2);
  // (knee and shin: from just above the knee down to well clear of the boot's top (the boot keeps inside its own rect,
  // a little above the ankle at most), the full width of the leg; nothing up the thigh past the knee pad, so the
  // jeans' seat and crotch show)
  const y0 = -1.2, y1 = len - 5.2, w = back ? 9.2 : 10.4;
  if (y1 - y0 > 2.5) piece(ctx, 'statue', 10, 16, paintStatue, back, -w / 2, y0, w, (y1 - y0) * 16 / 15);
  ctx.restore();
  // (the reel knee pad: on the front of the knee, the way it bends)
  const mx = (hip[0] + foot[0]) / 2, my = (hip[1] + foot[1]) / 2, ox = knee[0] - mx, oy = knee[1] - my, ol = Math.hypot(ox, oy);
  const off = ol > 0.6 ? 1.3 / ol : 0, r = back ? 3.3 : 3.9;
  piece(ctx, 'reel', 10, 10, paintReel, back, knee[0] + ox * off - r, knee[1] + oy * off - r, r * 2, r * 2);
};
const drawBracer = (ctx: C, ex: number, ey: number, wx: number, wy: number, back: boolean, len: number) => {
  ctx.save(); ctx.translate(ex, ey); ctx.rotate(Math.atan2(wy - ey, wx - ex));
  if (!back) {
    // (the LEDs' glow, behind the outline)
    const g = glowLayer(ctx);
    if (g !== ctx) { g.save(); g.setTransform(ctx.getTransform()); put(g, bake('bracerGlow', 14, 8, paintBracerGlow), -2, -6, len + 6, 12); g.restore(); }
  }
  // (from a touch above the elbow (well under the pauldron) to just short of the wrist: the glove starts past the wrist)
  const bx = -2.5, bw = len + 1.3, bh = 11.6, ux = bw / 14, uy = bh / 10;
  piece(ctx, 'bracer', 14, 10, paintBracer, back, bx, -bh / 2, bw, bh);
  if (!back) drawLed(ctx, bx + LED_X0 * ux, -bh / 2 + LED_Y0 * uy, LED_W * ux, LED_H * uy, armorMotion.frame);
  ctx.restore();
};
const drawAmulet = (ctx: C, top: number, pecY: number) => {
  const f = armorMotion.frame;
  // (the chain: sequins, pink and silver, from round his neck down to the jewel, between the pecs)
  for (const s of [-1, 1]) {
    for (let i = 0; i <= 6; i++) {
      const t = i / 6, cx = s * (5.2 - 4.4 * t), cy = top - 4 + (pecY + 1.6 - (top - 4)) * t + Math.sin(t * Math.PI) * 1.2;
      ctx.fillStyle = (i + (s > 0 ? 1 : 0)) % 2 ? '#F9A8D4' : '#E5E7EB';
      ctx.fillRect(cx - 0.6, cy - 0.6, 1.2, 1.2);
    }
  }
  piece(ctx, 'amulet', 10, 12, paintAmulet, false, -4.6, pecY - 0.4, 9.2, 11);
  // (the glitter: a twinkle now and then, moving round the jewel)
  const tw = f % 46;
  if (tw < 8) {
    const a = Math.floor(f / 46) % 3, gx = [-1.6, 1.2, -0.2][a], gy = pecY + [4.2, 6, 8][a], s = tw < 4 ? tw / 4 : (8 - tw) / 4;
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(gx - 0.4, gy - 1.6 * s, 0.8, 3.2 * s); ctx.fillRect(gx - 1.6 * s, gy - 0.4, 3.2 * s, 0.8);
  }
};
const drawCape = (ctx: C, top: number, h: number) => {
  const m = armorMotion, f = m.frame;
  const run = clamp01(Math.abs(m.fwd) / 7), fall = Math.max(-1, Math.min(1, m.vy / 9));
  const rx = -11.5, ry = top + 1, hem = top + h - 2;
  // (how it hangs: off his back, a little behind him; streaming back with his speed, up as he falls; while he floats,
  // spread wide behind him like a bat's wings)
  let a0: number, spread: number, len: number, ribs = 3, flap: number;
  if (m.floating) {
    a0 = Math.PI * 0.6; spread = 1.55; len = h + 7; ribs = 4; flap = Math.sin(f * 0.22) * 0.06;
  } else {
    a0 = Math.PI / 2 + 0.32 + run * 0.85 + Math.max(0, fall) * 0.7 + (m.grounded ? 0 : 0.12);
    spread = 0.5 + run * 0.2 + Math.max(0, fall) * 0.25;
    len = h - 3 + run * 2;
    flap = Math.sin(f * (0.18 + run * 0.25)) * (0.03 + 0.09 * run + 0.06 * Math.abs(fall));
  }
  const tips: [number, number][] = [], scallop: [number, number][] = [];
  for (let i = 0; i <= ribs; i++) {
    const a = a0 + (spread * i) / ribs + flap * (1 + i * 0.5);
    let l = len * (1 - 0.04 * (i % 2)) * (1 + Math.sin(f * 0.3 + i * 1.7) * 0.02 * (1 + run));
    // (never down past his belt, in any mode: the seat of his jeans (his ass, his shitty seat) always shows)
    const sa = Math.sin(a);
    if (sa > 0.05 && ry + sa * l > hem) l = Math.max(4, (hem - ry) / sa);
    tips.push([rx + Math.cos(a) * l, ry + Math.sin(a) * l]);
    if (i > 0) { const am = a - spread / ribs / 2, lm = l * 0.86; scallop.push([rx + Math.cos(am) * lm, ry + Math.sin(am) * lm]); }
  }
  ctx.save();
  // (and cut off above the belt, should anything still reach it)
  ctx.beginPath(); ctx.rect(rx - 60, ry - 80, 120, hem - (ry - 80)); ctx.clip();
  // (cheap shiny polyester: banded black, a sheen band across it; a checker on each band's edge; inked round, in an
  // inked picture)
  if (style.ink) { ctx.strokeStyle = INK_COL; ctx.lineWidth = style.ink * 2; ctx.lineJoin = 'round'; capeFan(ctx, rx, ry, tips, scallop, 1); ctx.stroke(); }
  ctx.fillStyle = CAPE[0]; capeFan(ctx, rx, ry, tips, scallop, 1); ctx.fill();
  ctx.fillStyle = checker(ctx, CAPE[1]); capeFan(ctx, rx, ry, tips, scallop, 0.9); ctx.fill();
  ctx.fillStyle = CAPE[1]; capeFan(ctx, rx, ry, tips, scallop, 0.82); ctx.fill();
  ctx.fillStyle = CAPE[2]; capeFan(ctx, rx, ry, tips, scallop, 0.6); ctx.fill();
  ctx.fillStyle = checker(ctx, CAPE[3]); capeFan(ctx, rx, ry, tips, scallop, 0.42); ctx.fill();
  // (the creases from the package: a square grid pressed into it, a lit ridge and a dark fold each)
  ctx.save(); capeFan(ctx, rx, ry, tips, scallop, 1); ctx.clip();
  for (let g = -24; g <= 4; g += 5) { ctx.fillStyle = CAPE[4]; ctx.fillRect(rx + g, ry - 30, 0.5, 60); ctx.fillStyle = '#000000'; ctx.fillRect(rx + g + 0.5, ry - 30, 0.5, 60); }
  for (let g = 3; g <= 40; g += 5) { ctx.fillStyle = CAPE[4]; ctx.fillRect(rx - 40, ry - 20 + g, 60, 0.5); ctx.fillStyle = '#000000'; ctx.fillRect(rx - 40, ry - 19.5 + g, 60, 0.5); }
  ctx.restore();
  // (the red lining, showing along the edge by his back)
  const t0 = tips[0];
  ctx.fillStyle = '#B91C1C';
  ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(t0[0], t0[1]); ctx.lineTo(rx + (t0[0] - rx) * 0.8 + 1.6, ry + (t0[1] - ry) * 0.8 - 0.4); ctx.closePath(); ctx.fill();
  ctx.restore();
  // (the price tag, flapping off the outermost point on its string)
  const tn = tips[ribs], ta = Math.sin(f * (0.25 + run * 0.3)) * (0.35 + run * 0.5) + 0.3 + run * 0.6 + Math.max(0, fall) * 1.2;
  ctx.save(); ctx.translate(tn[0], Math.min(tn[1], hem - 5)); ctx.rotate(ta);
  piece(ctx, 'tag', 6, 9, paintTag, false, -1.5, 0, 3, 4.5);
  ctx.restore();
  // (the tall collar, red inside, standing up behind his head; the plastic skull clasping it)
  ctx.fillStyle = '#0A0A0A'; ctx.beginPath(); ctx.moveTo(rx - 3.5, ry); ctx.lineTo(rx - 5.5, ry - 10); ctx.lineTo(rx + 3, ry - 5); ctx.lineTo(rx + 4, ry); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#B91C1C'; ctx.beginPath(); ctx.moveTo(rx - 2.5, ry - 0.5); ctx.lineTo(rx - 4.4, ry - 8.4); ctx.lineTo(rx + 2.4, ry - 4.6); ctx.lineTo(rx + 3, ry - 0.5); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#F87171'; ctx.fillRect(rx - 4, ry - 7.6, 0.6, 3);
  piece(ctx, 'skull', 6, 6, paintSkull, false, rx - 2.4, ry - 3.4, 4.6, 4.6);
};

/** The helmet under the space suit's glass: this big, and cut off this far round the glass's middle (inside its rim). */
const DOME_FIT = 0.72, DOME_IN = 15.5;
/** A touch crooked: the front tipped up (so the brim stays clear of the glasses there and behind). */
const HELM_TILT = -0.06;
/** The near can's top in the helmet's picture (where the straw comes out). */
const CAN_TOP: [number, number] = [HELM_MX + 15, 11.4];
const drawHelmet = (ctx: C, hx: number, ey: number) => {
  const px0 = hx - 0.5, py0 = ey - 4.6;
  const k = armorMotion.dome ? DOME_FIT : 1;
  // (the near can's top, where it lands with the shrink and the tilt)
  const cx = CAN_TOP[0] - HELM_MX + hx - px0, cy = CAN_TOP[1] - 24 + ey - py0;
  const ca = Math.cos(HELM_TILT), sa = Math.sin(HELM_TILT);
  const sx = px0 + k * (cx * ca - cy * sa), sy = py0 + k * (cx * sa + cy * ca);
  ctx.save();
  // (under the space suit's glass fishbowl (player.ts drawSpaceHelmet: its middle 2 behind and 3 above his eyes'
  // middle, 17 round): shrunk to fit inside it, about its brim, so the brim stays above his glasses; whatever'd touch the
  // glass is cut off at it, the horns jammed up against the inside)
  if (armorMotion.dome) { ctx.beginPath(); ctx.arc(hx - 2.5, ey - 3, DOME_IN, 0, Math.PI * 2); ctx.clip(); }
  ctx.translate(px0, py0); ctx.rotate(HELM_TILT); ctx.scale(k, k); ctx.translate(-px0, -py0);
  piece(ctx, 'helmet', HELM_W, HELM_H, paintHelmet, false, hx - HELM_MX, ey - 24, HELM_W, HELM_H);
  ctx.restore();
  helmetStraw(ctx, hx, ey, sx, sy);
};

const ART: ArmorArt = {
  flat: undefined,
  boot(ctx, x, y, w, h, back) { if (has('sabatons')) armorSeam(ctx, () => drawSabaton(ctx, x, y, w, h, back)); },
  shin(ctx, hip, knee, foot, back) { if (has('legs')) armorSeam(ctx, () => drawShin(ctx, hip, knee, foot, back)); },
  forearm(ctx, ex, ey, wx, wy, back) {
    if (!has('armguards')) return;
    const len = Math.hypot(wx - ex, wy - ey);
    if (len >= 3) armorSeam(ctx, () => drawBracer(ctx, ex, ey, wx, wy, back, len));
  },
  fist(ctx, x, y, r, angle, back) {
    if (!has('hands')) return;
    const k = r / 5;
    armorSeam(ctx, () => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.scale(k, k);
      piece(ctx, 'glove', GLOVE, GLOVE, paintGlove, back, GLOVE_AT, -9, GLOVE, GLOVE);
      ctx.restore();
    });
  },
  shoulder(ctx, x, y, r, back) {
    if (!has('pauldrons')) return;
    const k = r / 6;
    // (the one on the -x side of him (his frame's middle at x 0) mirrored, its tusk out that way: each juts outward off
    // its own shoulder, never in at his head (the owner's: "mirrored on both shoulders... they should jut outwards, not
    // into his head"); lit from the same side as the other. Whether it's the shadowed arm's (`back`) doesn't decide it:
    // his standing arms are both lit, one each side of him)
    armorSeam(ctx, () => {
      if (x >= 0) { piece(ctx, 'pauldron', 20, 18, paintPauldron, back, x - 9 * k, y - 10 * k - 1, 20 * k, 18 * k); return; }
      ctx.save();
      ctx.translate(x, 0); ctx.scale(-1, 1); ctx.translate(-x, 0);
      piece(ctx, 'pauldronFar', 20, 18, paintPauldronFar, back, x - 9 * k, y - 10 * k - 1, 20 * k, 18 * k);
      ctx.restore();
    });
  },
  helmet(ctx, hx, ey) { if (has('helmet')) armorSeam(ctx, () => drawHelmet(ctx, hx, ey)); },
  chest(ctx, top, pecY) { if (has('amulet')) armorSeam(ctx, () => drawAmulet(ctx, top, pecY)); },
  cape(ctx, top, h) { if (has('cape')) armorSeam(ctx, () => drawCape(ctx, top, h)); },
};

/** The pieces, each drawn only while has(piece), from where his limbs are (the hook's frames: a boot's rect, hip / knee /
 *  ankle, elbow / wrist, a fist's middle / size / the way it points, a deltoid's middle / size, the head's middle / the
 *  eyes' line, the torso's top / the pecs' line, the torso's top / height), in sprite units facing +x: transform the
 *  canvas for any bigger, turned or mirrored drawing of him (the finer bake for its size comes by itself). The front and
 *  back views: `flat` (walkArmor.ts). For Meathead 2's own drawings; Meathead 1's reach them through body.ts armorOn(). */
export const armorParts = ART;
/** Draws `fn` with the pieces drawn its way: `ink` an ink line round each (units: the close-ups' inked look), `level` a
 *  fixed detail, `straw` the helmet straw's path on from its can (a face of the drawing's own: round the outside of ITS
 *  glasses to ITS mouth), `motion` how he's moving for what hangs off him (the cape, the bell, the LEDs' and glitter's
 *  frame), for a drawing whose own clock and motion aren't the sprite's. All put back after. */
export const withArmor = (o: { ink?: number; level?: number; straw?: StrawPath; motion?: Partial<typeof armorMotion> }, fn: () => void) => {
  const was = { ...style }, mWas = { ...armorMotion };
  if (o.ink !== undefined) style.ink = o.ink;
  if (o.level !== undefined) style.level = o.level;
  if (o.straw) style.straw = o.straw;
  if (o.motion) Object.assign(armorMotion, o.motion);
  try { fn(); } finally { Object.assign(style, was); Object.assign(armorMotion, mWas); }
};

/** The baked pieces, for the bigger pictures of him (walkArmor.ts: the walk screens): each painted once. */
export type Stamp = 'sab' | 'statue' | 'reel' | 'bracer' | 'bracerPlain' | 'glove' | 'pauldron' | 'helmet' | 'amulet' | 'skull' | 'bell' | 'tag';
const STAMPS: Record<Stamp, [number, number, (c: C, back: boolean) => void]> = {
  sab: [SAB_W, SAB_H, paintSabaton], statue: [10, 16, paintStatue], reel: [10, 10, paintReel], bracer: [14, 10, paintBracer], bracerPlain: [14, 10, paintBracerPlain], glove: [GLOVE, GLOVE, paintGlove],
  pauldron: [20, 18, paintPauldron], helmet: [HELM_W, HELM_H, paintHelmet], amulet: [10, 12, paintAmulet], skull: [6, 6, paintSkull], bell: [6, 7, paintBell], tag: [6, 9, paintTag],
};
export const armorStamp = (s: Stamp, back = false) => { const [w, h, paint] = STAMPS[s]; return bake(s, w, h, paint, back); };
export { RUST, IRON, BRASS, GOLD, WING, WOOD, STEEL, IVORY, PINK, COCO, CAPE, PLASTIC, HORN, CAN_RED, CAN_BLUE, LED_X0, LED_W, LED_Y0, LED_H, shade, curveShape, domeLit, bake };

let installed = false;
/** Puts the armor's art on him (once, from apply.ts installUpgrades): from then each piece shows while has(piece). */
export const installArmorArt = () => {
  if (installed) return;
  installed = true;
  ART.flat = FLAT;
  setArmorArt(ART);
};

// ---------------------------------------------------------------------------------------------------------------------
// The cheap shot's close-up boot (closeUp.ts), with the sabatons on: his cowboy boot of rusty railroad iron toe-up into
// the crotch, the pointed iron toe cap, riveted seams, the spur's rowel spinning off the heel, the cowbell swinging and
// clanking off the ankle; drawn where closeUp.ts drew the plain one (its coordinates: (x, y) the toe's middle, the cuff
// below at y + 40). Panel-sized, a few dozen rects a frame.
export const drawSabatonCloseUp = (c: C, x: number, y: number, t: number) => {
  // (the jeans' cuff)
  c.fillStyle = '#1E3A8A'; c.fillRect(x - 30, y + 40, 60, 80);
  c.fillStyle = '#2563EB'; c.fillRect(x - 30, y + 40, 8, 80);
  // (the boot: narrowing to a pointed toe at the top, banded rust, a checker on each band's edge)
  const outline = (inset: number) => {
    c.beginPath(); c.moveTo(x - 36 + inset, y + 46); c.lineTo(x - 34 + inset, y + 6); c.lineTo(x - 4, y - 40 + inset * 1.2); c.lineTo(x + 4, y - 40 + inset * 1.2);
    c.lineTo(x + 34 - inset, y + 6); c.lineTo(x + 36 - inset, y + 46); c.closePath();
  };
  c.fillStyle = RUST[0]; outline(0); c.fill();
  const bands: [number, string][] = [[3, RUST[1]], [9, RUST[2]], [16, RUST[3]], [24, RUST[4]]];
  for (const [inset, col] of bands) { c.fillStyle = col; outline(inset); c.fill(); }
  // (the iron toe cap over the point, its lit rim)
  c.fillStyle = IRON[2]; c.beginPath(); c.moveTo(x - 22, y - 12); c.lineTo(x - 4, y - 38); c.lineTo(x + 4, y - 38); c.lineTo(x + 22, y - 12); c.closePath(); c.fill();
  c.fillStyle = IRON[3]; c.beginPath(); c.moveTo(x - 14, y - 16); c.lineTo(x - 3, y - 34); c.lineTo(x + 2, y - 34); c.lineTo(x - 2, y - 16); c.closePath(); c.fill();
  c.fillStyle = IRON[4]; c.fillRect(x - 22, y - 13, 44, 2);
  // (the seams up it, riveted, each rivet lit on top; pitting)
  for (const sx of [-24, 24]) for (let i = 0; i < 4; i++) { const ry = y - 4 + i * 12; c.fillStyle = '#F2B27A'; c.fillRect(x + sx - 2, ry, 4, 3); c.fillStyle = RUST[0]; c.fillRect(x + sx - 2, ry + 3, 4, 2); }
  c.fillStyle = '#D9772E'; for (let i = 0; i < 9; i++) c.fillRect(x - 20 + ((i * 23) % 40), y - 2 + ((i * 17) % 40), 3, 3);
  // (the stacked heel's edge down by the cuff, and the spur off it: a rowel, spinning)
  c.fillStyle = IRON[1]; c.fillRect(x - 38, y + 30, 10, 16); c.fillStyle = IRON[3]; c.fillRect(x - 38, y + 30, 10, 3);
  c.fillStyle = '#CBD5E1'; c.fillRect(x - 54, y + 36, 16, 3);
  c.save(); c.translate(x - 58, y + 37); c.rotate(t * 0.3);
  for (let k = 0; k < 6; k++) { c.rotate(Math.PI / 3); c.fillStyle = k % 2 ? '#E2E8F0' : '#94A3B8'; c.fillRect(-1.5, -9, 3, 9); }
  c.fillStyle = '#475569'; c.fillRect(-2, -2, 4, 4);
  c.restore();
  // (the cowbell off the ankle, swinging, clanking)
  const sw = Math.sin(t * 0.5) * 0.35;
  c.save(); c.translate(x + 30, y + 30); c.rotate(sw);
  c.fillStyle = '#5C3A1E'; c.fillRect(-3, -6, 6, 8);
  for (let i = 0; i < 4; i++) { c.fillStyle = BRASS[i + 1]; c.fillRect(-9 + i * 3.5, 2, 4, 24); }
  c.fillStyle = BRASS[0]; c.fillRect(-11, 24, 22, 4); c.fillStyle = '#1A1206'; c.fillRect(-2, 28, 4, 4);
  c.restore();
  if (Math.floor(t / 3) % 2) { c.fillStyle = '#FFFFFF'; c.fillRect(x + 46, y + 40, 10, 3); c.fillRect(x + 44, y + 50, 8, 3); }
};
