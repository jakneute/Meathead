// The ending's twist: THE END? ...and then, as the President lands, the thing inside him wants out. The skin splits
// down his forehead, two fat green hands pry it open like a coat, and the alien heaves himself up out of it, the
// deflated President flopping to the floor with the hair still on. He zaps Meathead's leg hair. It's on.
//
// The wide shots are pixel art like the rest of the ending (ending.ts: 256 x 144, stepped ramps); the close-ups (the
// split, the alien, the leg) are Ren & Stimpy gross-ups, painted at the size they're shown (the cutscene's `hires`)
// like the gross-up of the President's gut (grossUp.ts). What doesn't move is painted once.

import { shatPants, shatLegRun } from './shatLook';
import { ART_W, ART_H, C, R, ell, hash, drawMeatheadCloseUp, curtain, whSign, hangingFlag, podium, reporters, meatheadStanding, meatheadPunched, trumpFlying } from './ending';
import { shaded, ball, bands, layer, RAMP } from './art/snes';
import { INK, shape, speckle, hatch } from './art/ink';
import { bead } from './grossUp';
import { ALIEN, drawAlienFigure, alienMuzzle, laserBeam, AlienPose } from './alienLook';

type Ctx = CanvasRenderingContext2D;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const easeOut = (k: number) => 1 - (1 - clamp01(k)) ** 3;
const easeInOut = (k: number) => { k = clamp01(k); return k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2; };

// ---------------------------------------------------------------------------
// The press room, wide (pixel art)
// ---------------------------------------------------------------------------

/** The room with nobody in it: curtain, the sign, the flags, the stage floor. Painted once. */
const pressSet = (ctx: Ctx) => layer(ctx, 'ae-press', ART_W, ART_H, g => {
  curtain(g, 116);
  whSign(g, 128, 20);
  hangingFlag(g, 50, 38);
  hangingFlag(g, 190, 38);
  bands(g, 0, 112, ART_W, 32, ['#7c1000', '#6a0c00', '#580800', '#460600', '#340400']);
  // (the stage's lip, catching the lights)
  R(g, 0, 112, ART_W, 1, '#a42410');
});

/** A blob shaded in steps (for things that change shape as they move, which can't be cached): lit from up and to the left. */
const blob3 = (ctx: Ctx, cx: number, cy: number, rx: number, ry: number, ramp: readonly string[], base = 2) => {
  ell(ctx, cx, cy, rx, ry, ramp[base - 1] ?? ramp[0]);
  ell(ctx, cx - 0.5, cy - 0.5, Math.max(1, rx - 1), Math.max(1, ry - 1), ramp[base]);
  ell(ctx, cx - rx * 0.2, cy - ry * 0.25, Math.max(1, rx * 0.68), Math.max(1, ry * 0.6), ramp[base + 1]);
  ell(ctx, cx - rx * 0.38, cy - ry * 0.45, Math.max(1, rx * 0.32), Math.max(1, ry * 0.28), ramp[base + 2] ?? ramp[base + 1]);
};

/** Where the President comes down: on his face on the stage, to the right of the podium. */
const HEAP_X = 206, HEAP_Y = 111;

/**
 * The President face down where he landed, his backside up, one leg cocked in the air, arms splayed. `bulge` (0..1):
 * something under the back of his jacket pushing up, the cloth stretched shiny over it; `split` (0..1): a seam of
 * green light tearing open along the top of it, light raying out of it, slime dribbling down.
 */
const trumpHeap = (ctx: Ctx, x: number, y: number, t: number, bulge = 0, split = 0) => {
  const N = RAMP.navy, T = RAMP.tSkin, Hh = RAMP.tHair;
  const jit = bulge > 0 && t % 4 < 2 ? Math.round(bulge) : 0;
  // The leg in the air, the shoe at the top of it; the other one flat out behind
  R(ctx, x - 42, y - 6, 26, 6, N[2]); R(ctx, x - 42, y - 6, 26, 1, N[4]);
  R(ctx, x - 48, y - 7, 7, 7, C.ink); R(ctx, x - 48, y - 7, 7, 1, '#3c3c3c');
  for (let k = 0; k < 12; k++) R(ctx, x - 30 - Math.floor(k / 2), y - 8 - k, 6, 1, k % 4 === 0 ? N[4] : N[3]);
  R(ctx, x - 40, y - 24, 8, 5, C.ink); R(ctx, x - 40, y - 24, 8, 1, '#3c3c3c'); R(ctx, x - 37, y - 19, 4, 1, C.white);
  // The body: the jacket over his back, the belly squashed out under it, the shirt tail out
  blob3(ctx, x - 4 + jit, y - 6, 18, 8, N);
  R(ctx, x - 16, y - 1, 24, 2, C.white); R(ctx, x - 16, y, 24, 1, '#c8c8d0');
  // Arms: one flung out ahead, the hand palm up; one up behind his back
  R(ctx, x + 8, y - 4, 15, 4, N[2]); R(ctx, x + 8, y - 4, 15, 1, N[4]);
  blob3(ctx, x + 25, y - 2, 3, 2, T); R(ctx, x + 27, y - 4, 1, 2, T[3]);
  for (let k = 0; k < 10; k++) R(ctx, x - 20 + k, y - 10 - Math.floor(k / 3), 4, 3, k % 3 === 0 ? N[4] : N[2]);
  blob3(ctx, x - 10, y - 15, 2, 2, T);
  // The tie spilled out from under him
  R(ctx, x + 4, y - 1, 12, 2, C.red); R(ctx, x + 15, y, 3, 2, C.darkRed);
  // His head on its side on the carpet: cheek squashed, X for an eye, the hair spread out round it
  blob3(ctx, x + 15, y - 6, 8, 6, T);
  R(ctx, x + 17, y - 8, 1, 1, C.ink); R(ctx, x + 19, y - 8, 1, 1, C.ink); R(ctx, x + 18, y - 7, 1, 1, C.ink); R(ctx, x + 17, y - 6, 1, 1, C.ink); R(ctx, x + 19, y - 6, 1, 1, C.ink);
  R(ctx, x + 18, y - 2, 4, 2, '#500000'); R(ctx, x + 22, y - 1, 2, 1, '#c02010');
  blob3(ctx, x + 11, y - 12, 9, 4, Hh, 3);
  R(ctx, x + 4, y - 11, 6, 2, Hh[3]); R(ctx, x + 18, y - 13, 5, 1, Hh[5]);
  // The bulge: something under his jacket, pushing up
  if (bulge > 0) {
    const bx = x - 6 + jit, by = y - 12 - bulge * 6, rx = 8 + bulge * 6, ry = 4 + bulge * 6;
    blob3(ctx, bx, by, rx, ry, N, 2);
    // (the cloth stretched shiny over it, the seams pulling)
    R(ctx, bx - rx * 0.5, by - ry * 0.6, rx * 0.5, 1, N[5]);
    for (let k = -1; k <= 1; k++) R(ctx, bx + k * rx * 0.55, by - ry * 0.3, 1, ry, N[1]);
    if (split > 0) {
      const half = Math.round(rx * 0.9 * split), top = Math.round(by - ry * 0.85);
      // (light raying up out of the seam)
      for (let r = 0; r < 9; r++) {
        const a = -Math.PI / 2 + (r - 4) * 0.22, len = 14 + split * 26 + ((t + r * 5) % 7);
        const sx = bx + (r - 4) * half / 4;
        for (let s = 0; s < len; s += 1) R(ctx, sx + Math.cos(a) * s, top + Math.sin(a) * s, 1, 1, s % 3 === 0 ? 'rgba(234, 255, 176, 0.5)' : 'rgba(168, 224, 58, 0.35)');
      }
      R(ctx, bx - half, top - 1, half * 2, 3, ALIEN.slimeDark);
      R(ctx, bx - half, top, half * 2, 1, ALIEN.slimeLight);
      for (let d = 0; d < 4; d++) { const dx = bx - half + ((d * 7 + 3) % Math.max(1, half * 2)); R(ctx, dx, top + 2, 1, 2 + ((t * 0.3 + d * 3) % 6), ALIEN.slime); }
    }
  }
};

/**
 * The skin he came out of, flat on the floor: the orange of it empty and folded, the face slid half off the skull
 * that isn't there any more (holes for eyes, the mouth a long sag), the hair still on, still perfect; the trousers
 * and shoes on the end of it; a slick of slime round it.
 */
const deflatedSkin = (ctx: Ctx, x: number, y: number, t: number, fresh = 0) => {
  const T = RAMP.tSkin, N = RAMP.navy, Hh = RAMP.tHair;
  // (the slime puddle)
  ell(ctx, x + 2, y + 1, 34, 3, ALIEN.slimeDark); ell(ctx, x, y, 30, 2, ALIEN.slime);
  for (let k = 0; k < 5; k++) R(ctx, x - 24 + k * 11, y - 1, 3, 1, ALIEN.slimeLight);
  // The trousers, empty, flat; the shoes stood up on the end of them
  R(ctx, x + 6, y - 4, 22, 4, N[2]); R(ctx, x + 6, y - 4, 22, 1, N[4]); R(ctx, x + 16, y - 3, 1, 3, N[0]);
  R(ctx, x + 28, y - 7, 5, 7, C.ink); R(ctx, x + 28, y - 7, 5, 1, '#3c3c3c');
  R(ctx, x + 24, y - 6, 5, 6, C.ink); R(ctx, x + 24, y - 6, 5, 1, '#3c3c3c');
  // The body of the skin, empty, folded in on itself: a sag, folds, the shirt's rags on it
  R(ctx, x - 14, y - 4, 22, 4, T[3]); R(ctx, x - 14, y - 4, 22, 1, T[5]);
  for (let k = 0; k < 4; k++) R(ctx, x - 12 + k * 5, y - 3 + (k % 2), 3, 1, T[1]);
  R(ctx, x - 6, y - 5, 8, 2, C.white); R(ctx, x - 2, y - 4, 2, 4, C.red);
  // An arm of it out to the side, the hand on the end flopped open like a glove
  R(ctx, x - 6, y - 1, 3, 1, T[2]);
  for (let k = 0; k < 9; k++) R(ctx, x - 4 + k, y + 1, 1, 2, T[k % 3 ? 3 : 2]);
  R(ctx, x + 5, y + 1, 4, 2, T[4]); for (let f = 0; f < 3; f++) R(ctx, x + 9, y + 1 + f, 2, 1, T[3]);
  // The face: stretched long and flat, the eyes two empty holes, the mouth a sag; the hair on top, perfect
  const sag = fresh > 0 ? Math.round((1 - fresh) * 3) : 0;
  ell(ctx, x - 22, y - 3 - sag, 9, 4 + sag, T[2]); ell(ctx, x - 23, y - 4 - sag, 7, 3 + sag, T[4]);
  R(ctx, x - 27, y - 5 - sag, 3, 2, C.ink); R(ctx, x - 21, y - 5 - sag, 3, 2, C.ink);
  R(ctx, x - 27, y - 6 - sag, 3, 1, C.tSkinPale); R(ctx, x - 21, y - 6 - sag, 3, 1, C.tSkinPale);
  R(ctx, x - 25, y - 1, 5, 1, '#500000'); R(ctx, x - 24, y, 3, 1, '#500000');
  ell(ctx, x - 30, y - 7 - sag, 6, 3, Hh[2]); ell(ctx, x - 31, y - 8 - sag, 5, 2, Hh[4]);
  R(ctx, x - 36, y - 7 - sag, 5, 3, Hh[3]); R(ctx, x - 34, y - 9 - sag, 6, 1, Hh[5]);
  // (a last bubble of air going out of it)
  if (fresh > 0 && t % 20 < 10) R(ctx, x - 16, y - 7, 2, 2, 'rgba(234, 255, 176, 0.7)');
};

/** The President, still sailing on from where the punch froze him, and down on his face. */
export const LAND_AT = 10;
export const drawLanding = (ctx: Ctx, t: number) => {
  pressSet(ctx);
  podium(ctx, 118, 72, 1);
  if (t < 40) meatheadPunched(ctx, 82, 118); else meatheadStanding(ctx, 82, 118, true);
  if (t < LAND_AT) {
    const k = t / LAND_AT;
    trumpFlying(ctx, 180 + k * 26, 64 + k * k * 34, t);
  } else {
    // (a bounce as he hits)
    const b = t < LAND_AT + 6 ? -Math.round(Math.sin(((t - LAND_AT) / 6) * Math.PI) * 3) : 0;
    // (twitching; then something under his jacket starting to push up)
    const tw = t > 50 && t < 84 && (t % 9 < 2) ? 1 : 0;
    const bulge = easeInOut((t - 78) / 40);
    const split = clamp01((t - 112) / 24);
    trumpHeap(ctx, HEAP_X + tw, HEAP_Y + b, t, bulge, split);
    // (the dust he kicked up off the carpet)
    if (t < LAND_AT + 14) for (let i = 0; i < 6; i++) { const d = (t - LAND_AT) * 1.2; R(ctx, HEAP_X - 30 + i * 12 + (i < 3 ? -d : d), HEAP_Y - 2 - d * 0.4, 2, 2, 'rgba(200, 160, 140, 0.6)'); }
  }
  reporters(ctx, t, t > LAND_AT ? 1 : 0);
  // (a green light coming up over everything once the seam goes)
  if (t > 112) { ctx.fillStyle = `rgba(168, 224, 58, ${Math.min(0.18, (t - 112) * 0.008)})`; ctx.fillRect(0, 0, ART_W, ART_H); }
};

/**
 * The alien heaving himself up out of the President, the skin peeled down round his middle; shrugging it off; it
 * drops in a heap at his feet and lies there, the hair still on. He stands there, breathing through his mouth.
 */
export const RISE_END = 46, DROP_AT = 74;
export const drawAlienEmerges = (ctx: Ctx, t: number) => {
  pressSet(ctx);
  podium(ctx, 118, 72, 1);
  meatheadStanding(ctx, 82, 118, true);
  // (Meathead's eyebrows up)
  if (t > 20) { R(ctx, 78, 118 - 60, 3, 1, C.mHair); R(ctx, 84, 118 - 60, 3, 1, C.mHair); }
  const ax = HEAP_X - 2, base = 116;
  if (t < RISE_END) {
    // Rising up out of the split: the heap torn wide around him, him coming up through it
    const k = easeOut(t / RISE_END);
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, ART_W, HEAP_Y - 6); ctx.clip();
    drawAlienFigure(ctx, ax, base + Math.round((1 - k) * 70), { facing: -1, t, peel: 1 });
    ctx.restore();
    // (the torn-open skin round where he's coming up, flaps of it, slime)
    for (const s of [-1, 1]) for (let k2 = 0; k2 < 8; k2++) R(ctx, ax + s * (10 + k2 * 2), HEAP_Y - 8 - Math.round(Math.sin((k2 / 7) * Math.PI) * 5), 3, 4, k2 % 2 ? RAMP.navy[3] : RAMP.tSkin[3]);
    R(ctx, ax - 26, HEAP_Y - 5, 52, 5, RAMP.navy[2]); R(ctx, ax - 26, HEAP_Y - 5, 52, 1, RAMP.navy[4]);
    R(ctx, ax - 20, HEAP_Y - 7, 40, 2, ALIEN.slime);
    for (let i = 0; i < 6; i++) R(ctx, ax - 18 + i * 7, HEAP_Y - 12 - ((t * 0.7 + i * 5) % 12), 2, 2, ALIEN.slimeLight);
  } else if (t < DROP_AT) {
    // Standing, shimmying the rest of it down
    const sh = t % 6 < 3 ? -1 : 1;
    drawAlienFigure(ctx, ax + sh, base, { facing: -1, t, peel: 1 - ((t - RISE_END) / (DROP_AT - RISE_END)) * 0.6 });
  } else {
    // It drops: a heap at his feet. He breathes through his mouth.
    deflatedSkin(ctx, ax - 40, HEAP_Y, t, clamp01((t - DROP_AT) / 12));
    drawAlienFigure(ctx, ax, base, { facing: -1, t, open: true });
    // (the splat as it lands)
    if (t < DROP_AT + 8) for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI, d = (t - DROP_AT) * 2; R(ctx, ax - 40 + Math.cos(a) * d * 1.6, HEAP_Y - Math.sin(a) * d, 2, 2, ALIEN.slime); }
  }
  reporters(ctx, t, 1);
  // (the green light off him, washing the room)
  ctx.fillStyle = 'rgba(168, 224, 58, 0.1)'; ctx.fillRect(0, 0, ART_W, ART_H);
};

// ---------------------------------------------------------------------------
// The press gasping (pixel art): the reverse angle, the press pack in their faces lit green off the alien
// ---------------------------------------------------------------------------

/** The back of the press room: wood paneling, rows of chairs, the TV cameras on their tripods. Painted once. */
const pressBack = (ctx: Ctx) => layer(ctx, 'ae-pressback', ART_W, ART_H, g => {
  bands(g, 0, 0, ART_W, 70, ['#2a2018', '#342818', '#3e3020', '#4a3a26', '#56442c', '#604c32']);
  // (the paneling, its seams lit on one side)
  for (let x = 0; x < ART_W; x += 32) { R(g, x, 10, 1, 60, '#1c140c'); R(g, x + 1, 10, 1, 60, '#6c5638'); }
  R(g, 0, 8, ART_W, 3, '#6c5638'); R(g, 0, 70, ART_W, 4, '#2a1a0c');
  bands(g, 0, 74, ART_W, 70, ['#3c0800', '#360600', '#2e0500', '#260400']);
  // Rows of chairs, empty (everybody's up)
  for (let row = 0; row < 2; row++) for (let i = 0; i < 12; i++) {
    const cx = 8 + i * 22 + row * 11, cy = 78 + row * 12;
    R(g, cx, cy, 14, 9, '#1a1a2c'); R(g, cx, cy, 14, 1, '#3c3c5c'); R(g, cx + 1, cy + 9, 2, 6, '#0c0c14'); R(g, cx + 11, cy + 9, 2, 6, '#0c0c14');
  }
  // A TV camera on a tripod, the red light on
  for (const [x, y] of [[20, 34], [222, 30]] as const) {
    R(g, x - 10, y, 22, 12, '#2a2a30'); R(g, x - 10, y, 22, 1, '#5a5a66'); R(g, x + 12, y + 2, 6, 8, '#141418');
    R(g, x - 12, y + 3, 3, 3, '#1c1c22'); R(g, x - 5, y + 12, 2, 24, '#1c1c22');
    for (let k = 0; k < 14; k++) { R(g, x - 5 - k, y + 24 + k, 1, 1, '#1c1c22'); R(g, x - 4 + k, y + 24 + k, 1, 1, '#1c1c22'); }
  }
});

/** One of the press, big, aghast: a head lit green from the front, a mouth wide open. */
const aghast = (ctx: Ctx, key: string, x: number, y: number, t: number, o: { skin: readonly string[]; hair: string; hairHi: string; coat: string; bald?: boolean; glasses?: boolean; talking?: boolean; woman?: boolean }) => {
  // Shoulders and coat
  shaded(ctx, `${key}-coat`, x - 30, y + 26, 60, 40, [o.coat === 'red' ? '#3c0400' : '#060610', o.coat === 'red' ? '#6c0c04' : '#141428', o.coat === 'red' ? '#9c1a0a' : '#24243c', o.coat === 'red' ? '#c82814' : '#363654', o.coat === 'red' ? '#e84a2c' : '#4c4c70'], ball(-0.3, -0.85, 0.15));
  R(ctx, x - 6, y + 24, 12, 8, '#e8e8f0'); R(ctx, x - 1, y + 26, 2, 10, o.coat === 'red' ? '#f8f8f8' : C.red);
  // The head
  shaded(ctx, `${key}-head`, x - 15, y - 16, 30, 40, [...o.skin], ball(-0.35, -0.5, 0.16));
  // Hair
  if (o.woman) {
    // (a blonde helmet, sprayed solid)
    shaded(ctx, `${key}-hair`, x - 19, y - 22, 38, 34, ['#5a3c08', '#8a6414', '#b88c20', '#d8b040', '#f0d070', '#fcf0b0'], ball(-0.35, -0.7, 0.2));
    R(ctx, x - 13, y - 12, 26, 8, o.skin[3]); ell(ctx, x, y - 6, 12, 5, o.skin[3]);
    // (pearl earrings)
    R(ctx, x - 16, y + 12, 2, 2, C.white); R(ctx, x + 15, y + 12, 2, 2, C.white);
  } else if (!o.bald) {
    ell(ctx, x, y - 13, 15, 6, o.hair); R(ctx, x - 15, y - 13, 4, 12, o.hair); R(ctx, x + 11, y - 13, 4, 10, o.hair);
    R(ctx, x - 8, y - 18, 12, 1, o.hairHi);
  } else {
    R(ctx, x - 8, y - 14, 6, 2, '#fff0e0'); R(ctx, x - 15, y - 2, 3, 8, o.hair); R(ctx, x + 12, y - 2, 3, 8, o.hair);
  }
  // Eyes popped wide, pupils pinpricks; brows up
  for (const ex of [x - 7, x + 4]) {
    R(ctx, ex - 1, y - 6 - (t % 30 < 15 ? 1 : 0), 6, 2, o.woman ? '#5a3c08' : C.ink);
    R(ctx, ex, y - 2, 5, 5, C.white); R(ctx, ex + 2, y, 1, 1, C.ink);
  }
  if (o.glasses) {
    // (and the alien in his glasses, green)
    for (const ex of [x - 8, x + 3]) { R(ctx, ex, y - 3, 7, 1, C.ink); R(ctx, ex, y + 3, 7, 1, C.ink); R(ctx, ex, y - 3, 1, 7, C.ink); R(ctx, ex + 6, y - 3, 1, 7, C.ink); R(ctx, ex + 2, y - 1, 3, 3, '#74994e'); }
    R(ctx, x - 1, y - 1, 4, 1, C.ink);
  }
  // Mouth: hanging wide (talking: flapping)
  const open = o.talking ? (t % 10 < 5 ? 9 : 5) : 8;
  R(ctx, x - 4, y + 9, 8, open, '#3a0606'); R(ctx, x - 3, y + 9, 6, 1, C.white);
  if (o.woman) { R(ctx, x - 5, y + 8, 10, 1, '#c02040'); R(ctx, x - 5, y + 9 + open, 10, 1, '#c02040'); }
  // The green off the alien on the side of the face toward him, and a rim of it
  for (let k = 0; k < 30; k += 2) R(ctx, x + 8 + (k % 4 === 0 ? 1 : 0), y - 12 + k, 6, 1, 'rgba(168, 224, 58, 0.28)');
  R(ctx, x + 14, y - 10, 1, 26, 'rgba(234, 255, 176, 0.5)');
};

/** The press pack, aghast. The woman down front with the mic is the one who says it. */
export const drawPressGasp = (ctx: Ctx, t: number, talking: boolean) => {
  pressBack(ctx);
  // (the alien's green glow over all of it from the stage, off the left)
  ctx.fillStyle = 'rgba(168, 224, 58, 0.12)'; ctx.fillRect(0, 0, ART_W, ART_H);
  // The back row: small heads, cameras up and flashing
  for (let i = 0; i < 9; i++) {
    const x = 14 + i * 28 + Math.round(hash(i + 3) * 6), y = 70 + Math.round(hash(i + 9) * 4);
    R(ctx, x - 9, y + 7, 18, 20, [C.navy, C.darkGray, '#503000'][i % 3]);
    ell(ctx, x, y, 6, 7, '#e4a070'); ell(ctx, x, y - 3, 6, 4, ['#503000', C.ink, '#a0a0a0'][i % 3]);
    R(ctx, x - 2, y - 1, 1, 1, C.ink); R(ctx, x + 2, y - 1, 1, 1, C.ink); R(ctx, x - 1, y + 3, 2, 2, '#3a0606');
    if (i % 2) { R(ctx, x - 4, y - 6, 9, 6, C.ink); if (Math.floor(t / 3 + hash(i) * 20) % 4 === 0) { R(ctx, x - 6, y - 10, 12, 2, C.white); R(ctx, x - 1, y - 14, 2, 10, C.white); } }
  }
  // Down front: the bald one with the glasses (his camera hanging), the one dropping his coffee, and her
  aghast(ctx, 'pg-bald', 210, 92, t, { skin: ['#5a2c14', '#8a4a24', '#b46a3a', '#d48c58', '#ecb07c', '#fcd0a4'], hair: '#5a4030', hairHi: '#8a6a50', coat: 'navy', bald: true, glasses: true });
  aghast(ctx, 'pg-cof', 44, 96, t, { skin: ['#3c2414', '#5e3a20', '#80522e', '#a06c40', '#bc8a5a', '#d8aa7c'], hair: '#1c1410', hairHi: '#4a3a30', coat: 'navy' });
  // (his coffee going, the lid off, the coffee in the air)
  const ct = t % 60;
  R(ctx, 62, 106 + ct * 0.4, 6, 8, C.white); R(ctx, 62, 106 + ct * 0.4, 6, 1, '#a0a0a0');
  for (let i = 0; i < 5; i++) R(ctx, 64 + i * 2 - ct * 0.1, 104 + ct * 0.3 - i * 2, 2, 2, '#6a3a14');
  aghast(ctx, 'pg-her', 128, 88, t, { skin: ['#6a3a20', '#9a5a34', '#c47a4c', '#e09a68', '#f4bc8c', '#fcdcb4'], hair: '', hairHi: '', coat: 'red', woman: true, talking });
  // Her mic, held up, the station's cube on it
  R(ctx, 146, 106, 4, 18, C.ink); ell(ctx, 148, 104, 4, 4, '#3a3a40'); R(ctx, 146, 101, 3, 2, '#7a7a84');
  R(ctx, 143, 110, 10, 7, C.blue); R(ctx, 143, 110, 10, 1, '#4a8af8'); R(ctx, 145, 112, 6, 3, C.white);
  shaded(ctx, 'pg-herhand', 142, 116, 12, 10, RAMP.tSkin, ball(-0.4, -0.6, 0.2));
  // Flashes going off
  if (Math.floor(t / 4) % 5 === 0) { R(ctx, 0, 0, ART_W, ART_H, 'rgba(255,255,255,0.18)'); }
};

// ---------------------------------------------------------------------------
// The square-off, and the zap (pixel art)
// ---------------------------------------------------------------------------

/** The press, ducking: the same pack, down below the frame with their cameras up over their heads. */
const ducking = (ctx: Ctx, t: number) => { ctx.save(); ctx.translate(0, 12); reporters(ctx, t, 1); ctx.restore(); };

/** Where Meathead stands for the zap, and his shin. */
const MH_X = 64, MH_BASE = 118, SHIN = { x: MH_X + 4, y: MH_BASE - 11 };
const AL_X = 196, AL_BASE = 118;
export const ZAP_RAISE = 14, ZAP_FIRE = 34;
/** How far the gun dips to point at his shin. */
const AIM_LOW = 0.62;

/** The alien raising his arm, the coil charging, and the beam into Meathead's shin: he jumps. */
export const drawZap = (ctx: Ctx, t: number) => {
  pressSet(ctx);
  podium(ctx, 118, 72, 1);
  deflatedSkin(ctx, 150, HEAP_Y, t);
  const aiming = t >= ZAP_RAISE;
  const pose: AlienPose = { facing: -1, t, arm: aiming ? 'aim' : 'down', aim: aiming ? (t < ZAP_RAISE + 4 ? AIM_LOW * 0.5 : AIM_LOW) : 0 };
  drawAlienFigure(ctx, AL_X, AL_BASE, pose);
  // Meathead: standing; the jump when it hits, a "!" over him
  const hit = t >= ZAP_FIRE + 4;
  const hop = hit && t < ZAP_FIRE + 16 ? -Math.round(Math.sin(((t - ZAP_FIRE - 4) / 12) * Math.PI) * 6) : 0;
  meatheadStanding(ctx, MH_X, MH_BASE + hop, true);
  // (the hole in his jeans, smoking, once it's hit)
  if (hit) { R(ctx, SHIN.x - 2, SHIN.y + hop - 2, 4, 4, '#2a1a10'); R(ctx, SHIN.x - 1, SHIN.y + hop - 1, 2, 2, C.mSkin); if (t % 4 < 2) R(ctx, SHIN.x - 2, SHIN.y + hop - 3, 1, 1, '#f87c00'); }
  if (hit && t < ZAP_FIRE + 40) {
    const bx = MH_X - 4, by = MH_BASE - 74 + hop;
    R(ctx, bx - 3, by - 4, 10, 14, C.white); R(ctx, bx - 3, by - 4, 10, 1, C.lightGray);
    R(ctx, bx + 1, by - 2, 2, 6, C.red); R(ctx, bx + 1, by + 6, 2, 2, C.red);
  }
  // The charge: sparkles drawn into the muzzle; then the beam
  const m = alienMuzzle(AL_X, AL_BASE, -1, AIM_LOW);
  if (aiming && t < ZAP_FIRE) for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + t * 0.4, d = 12 - ((t * 0.8 + i * 2) % 12);
    R(ctx, m.x + Math.cos(a) * d, m.y + Math.sin(a) * d, 1, 1, ALIEN.laser[5]);
  }
  if (t >= ZAP_FIRE && t < ZAP_FIRE + 16) laserBeam(ctx, m.x, m.y, SHIN.x, SHIN.y + hop, Math.min(1, (t - ZAP_FIRE + 1) / 4), t);
  // (smoke off his shin, curling up)
  if (hit) for (let i = 0; i < 5; i++) {
    const p = ((t - ZAP_FIRE) * 0.8 + i * 6) % 30;
    R(ctx, SHIN.x + Math.sin(p * 0.3 + i) * 3, SHIN.y + hop - p, 2 + Math.floor(p / 12), 2, `rgba(200, 200, 200, ${0.6 - p / 60})`);
  }
  ducking(ctx, t);
  if (t >= ZAP_FIRE && t < ZAP_FIRE + 3) { ctx.fillStyle = 'rgba(255, 140, 228, 0.35)'; ctx.fillRect(0, 0, ART_W, ART_H); }
};

/** Meathead with his fists up, facing right: square to the alien. */
const meatheadFistsUp = (ctx: Ctx, cx: number, baseY: number, t: number) => {
  meatheadStanding(ctx, cx, baseY, true, { l: false, r: false });
  const bob = t % 20 < 10 ? 0 : 1;
  // (the arms bent up: fists by his chin, the lead one out a bit)
  for (const [sx, fx] of [[-1, cx - 4], [1, cx + 16]] as const) {
    const sx0 = cx + sx * 15;
    R(ctx, sx0 - 3, baseY - 50, 7, 12, sx < 0 ? C.mSkinShade : C.mSkin);
    R(ctx, Math.min(sx0, fx), baseY - 40 + bob, Math.abs(fx - sx0) + 4, 6, sx < 0 ? C.mSkinShade : C.mSkin);
    R(ctx, fx - 1, baseY - 50 + bob, 7, 10, C.mSkin); R(ctx, fx - 1, baseY - 50 + bob, 7, 2, C.mSkinLight);
    for (let k = 0; k < 3; k++) R(ctx, fx + (sx > 0 ? 5 : -1), baseY - 49 + bob + k * 3, 1, 2, C.mSkinShade);
    R(ctx, fx - 1, baseY - 41 + bob, 7, 2, C.ink);
  }
  // (scowl)
  R(ctx, cx - 5, baseY - 60, 4, 1, C.ink); R(ctx, cx + 1, baseY - 60, 4, 1, C.ink);
};

/** Squared up across the wrecked press room: Meathead, the alien, the skin on the floor between them. */
export const drawSquareOff = (ctx: Ctx, t: number) => {
  pressSet(ctx);
  podium(ctx, 118, 72, 1);
  deflatedSkin(ctx, 130, HEAP_Y, t);
  // (he's cleared the curtain behind them to stand in front of: the room's dimming down to them)
  ctx.fillStyle = 'rgba(0, 0, 20, 0.35)'; ctx.fillRect(0, 0, ART_W, ART_H);
  meatheadFistsUp(ctx, MH_X, MH_BASE, t);
  drawAlienFigure(ctx, AL_X, AL_BASE, { facing: -1, t, open: true });
  // A beat of light between them
  if (t < 4) { R(ctx, 0, 0, ART_W, ART_H, 'rgba(255,255,255,0.6)'); }
  const k = clamp01(t / 20);
  // (a bar of the stage lights down on each of them, swinging in)
  ctx.fillStyle = `rgba(252, 240, 200, ${0.1 * k})`;
  ctx.beginPath(); ctx.moveTo(MH_X - 6, 0); ctx.lineTo(MH_X + 6, 0); ctx.lineTo(MH_X + 30, MH_BASE); ctx.lineTo(MH_X - 30, MH_BASE); ctx.fill();
  ctx.beginPath(); ctx.moveTo(AL_X - 6, 0); ctx.lineTo(AL_X + 6, 0); ctx.lineTo(AL_X + 40, AL_BASE); ctx.lineTo(AL_X - 40, AL_BASE); ctx.fill();
  ducking(ctx, t);
};

// ---------------------------------------------------------------------------
// Close-ups (painted at the size they're shown: the cutscene's `hires`)
// ---------------------------------------------------------------------------

/** Dark round the edges, and a painted grain over the lot (it crawls a little). */
const finish = (ctx: Ctx, t: number) => {
  const v = ctx.createRadialGradient(ART_W / 2, ART_H / 2, 60, ART_W / 2, ART_H / 2, 170);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.7)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, ART_W, ART_H);
  const seed = Math.floor(t / 4);
  for (let i = 0; i < 260; i++) {
    ctx.fillStyle = i % 2 ? 'rgba(255,255,240,0.05)' : 'rgba(0,0,0,0.07)';
    ctx.fillRect(hash(i * 3.1 + seed) * ART_W, hash(i * 7.7 + seed * 1.3) * ART_H, 0.7, 0.7);
  }
};

/** A radial glow and slow rays off it, behind a close-up. */
const rays = (ctx: Ctx, t: number, cx: number, cy: number, inner: string, outer: string, ray: string) => {
  const g = ctx.createRadialGradient(cx, cy, 5, cx, cy, 190);
  g.addColorStop(0, inner); g.addColorStop(1, outer);
  ctx.fillStyle = g; ctx.fillRect(-20, -20, ART_W + 40, ART_H + 40);
  ctx.fillStyle = ray;
  const spin = t * 0.003;
  for (let k = 0; k < 18; k++) {
    const a = (k / 18) * Math.PI * 2 + spin;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * 400, cy + Math.sin(a) * 400); ctx.lineTo(cx + Math.cos(a + 0.12) * 400, cy + Math.sin(a + 0.12) * 400); ctx.closePath(); ctx.fill();
  }
};

/** A raised vein in his colors: purple, a shadow under it, a lit line along its top. It throbs. */
const alienVein = (ctx: Ctx, pts: number[][], w: number, throb: number) => {
  const path = () => {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2; ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my); }
    const l = pts[pts.length - 1]; ctx.lineTo(l[0], l[1]);
  };
  const ww = w * throb;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.save(); ctx.translate(0.4, 1); path(); ctx.strokeStyle = 'rgba(10, 20, 8, 0.55)'; ctx.lineWidth = ww + 1.4; ctx.stroke(); ctx.restore();
  path(); ctx.strokeStyle = ALIEN.vein; ctx.lineWidth = ww; ctx.stroke();
  ctx.save(); ctx.translate(-0.3, -ww * 0.3); path(); ctx.strokeStyle = 'rgba(200, 170, 230, 0.6)'; ctx.lineWidth = Math.max(0.3, ww * 0.25); ctx.stroke(); ctx.restore();
};

/** A wet glint: a short hard white stroke and a dot. */
const glint = (ctx: Ctx, x: number, y: number, len: number, a = -0.5) => {
  ctx.strokeStyle = 'rgba(255, 255, 240, 0.85)'; ctx.lineWidth = 0.6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); ctx.stroke();
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x + Math.cos(a) * len + 0.6, y + Math.sin(a) * len - 0.4, 0.6, 0.6);
};

// --- The split -------------------------------------------------------------

export const SPLIT_TEAR = 62, SPLIT_OPEN = 92, SPLIT_LEN = 200;

/** Where the tear runs down his face: jagged, a kink every few pixels. */
const tearX = (y: number) => 128 + (hash(Math.floor(y / 5) * 1.7 + 3) - 0.5) * 7 + Math.sin(y * 0.05) * 2;
const tearPath = (ctx: Ctx, y0: number, y1: number) => { ctx.moveTo(tearX(y0), y0); for (let y = y0 + 5; y <= y1; y += 5) ctx.lineTo(tearX(y), y); };

/** The President's face, filling the frame: dazed off the punch, then something pushing up under his forehead. */
const presFace = (ctx: Ctx, t: number, bulge: number) => {
  // The suit and the collar, the neck
  shape(ctx, () => { ctx.moveTo(-10, 150); ctx.lineTo(-10, 132); ctx.bezierCurveTo(30, 122, 70, 120, 100, 124); ctx.lineTo(156, 124); ctx.bezierCurveTo(186, 120, 226, 122, 266, 132); ctx.lineTo(266, 150); ctx.closePath(); }, '#1A1E48', 1.6);
  shape(ctx, () => { ctx.moveTo(96, 124); ctx.lineTo(116, 146); ctx.lineTo(128, 132); ctx.lineTo(140, 146); ctx.lineTo(160, 124); ctx.closePath(); }, '#F4F1E6', 1.2);
  shape(ctx, () => { ctx.moveTo(121, 132); ctx.lineTo(135, 132); ctx.lineTo(132, 146); ctx.lineTo(124, 146); ctx.closePath(); }, '#C8201C', 1);
  // The head: a pear, the jowls the widest part
  const head = () => { ctx.moveTo(128, 20); ctx.bezierCurveTo(166, 20, 184, 42, 186, 70); ctx.bezierCurveTo(190, 102, 184, 124, 158, 134); ctx.bezierCurveTo(144, 140, 112, 140, 98, 134); ctx.bezierCurveTo(72, 124, 66, 102, 70, 70); ctx.bezierCurveTo(72, 42, 90, 20, 128, 20); };
  // Ears
  for (const s of [-1, 1]) shape(ctx, () => { ctx.ellipse(128 + s * 58, 82, 7, 13, s * 0.15, 0, Math.PI * 2); }, '#E07A36', 1.2);
  const hg = ctx.createRadialGradient(108, 62, 6, 128, 80, 82);
  hg.addColorStop(0, '#FFC088'); hg.addColorStop(0.45, '#F49048'); hg.addColorStop(1, '#BC5418');
  shape(ctx, head, hg, 1.6);
  ctx.save(); ctx.beginPath(); head(); ctx.clip();
  // (where the tan stops at the collar; the flush in his cheeks; pores and sweat)
  ctx.fillStyle = 'rgba(240, 90, 60, 0.25)'; ctx.beginPath(); ctx.ellipse(90, 98, 14, 9, 0, 0, Math.PI * 2); ctx.ellipse(166, 98, 14, 9, 0, 0, Math.PI * 2); ctx.fill();
  speckle(ctx, 70, 20, 116, 120, 700, 'rgba(120, 50, 10, 0.32)', 11, 0.45);
  speckle(ctx, 80, 30, 96, 60, 140, 'rgba(255, 230, 200, 0.25)', 13, 0.45);
  // The bruise coming up round his left eye, purple going green
  const bg = ctx.createRadialGradient(150, 70, 2, 150, 70, 20);
  bg.addColorStop(0, 'rgba(110, 40, 120, 0.75)'); bg.addColorStop(0.6, 'rgba(90, 110, 60, 0.4)'); bg.addColorStop(1, 'rgba(90, 110, 60, 0)');
  ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(150, 70, 20, 0, Math.PI * 2); ctx.fill();
  // Forehead wrinkles, the jowls' creases, the chins
  ctx.strokeStyle = 'rgba(120, 40, 10, 0.55)'; ctx.lineWidth = 0.7;
  for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(100, 42 + k * 5); ctx.quadraticCurveTo(128, 38 + k * 5 - bulge * 6, 156, 42 + k * 5); ctx.stroke(); }
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(128 + s * 14, 92); ctx.quadraticCurveTo(128 + s * 30, 108, 128 + s * 26, 124); ctx.stroke(); }
  ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(104, 128); ctx.quadraticCurveTo(128, 136, 152, 128); ctx.stroke();
  ctx.restore();
  // The pale goggles round his eyes (the tanning bed), and the eyes in them: spinning, dazed; popping wide as the
  // thing under his forehead pushes
  for (const [ex, s] of [[106, -1], [150, 1]] as const) {
    ctx.fillStyle = '#FCD8B0'; ctx.beginPath(); ctx.ellipse(ex, 68, 16, 9, 0, 0, Math.PI * 2); ctx.fill();
    const wide = bulge > 0.55;
    const er = wide ? 8 : 7, ery = wide ? 7 : 5;
    shape(ctx, () => ctx.ellipse(ex, 68, er, ery, 0, 0, Math.PI * 2), '#FFFDF4', 0.9);
    if (wide) { ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(ex - s * 1, 68, 1, 0, Math.PI * 2); ctx.fill(); }
    else {
      // (spirals)
      ctx.strokeStyle = INK; ctx.lineWidth = 0.7; ctx.beginPath();
      for (let a = 0; a < Math.PI * 5; a += 0.2) { const r = a * 0.4, aa = a + t * 0.35 * s; ctx.lineTo(ex + Math.cos(aa) * r, 68 + Math.sin(aa) * r * 0.75); }
      ctx.stroke();
    }
    // (lids heavy; the bags)
    ctx.strokeStyle = 'rgba(120, 40, 10, 0.6)'; ctx.lineWidth = 0.6;
    for (let k = 1; k <= 2; k++) { ctx.beginPath(); ctx.arc(ex, 70, er + k * 2, 0.4, Math.PI - 0.4); ctx.stroke(); }
    // Brows: pale tufts
    ctx.fillStyle = '#F8E0A0'; ctx.beginPath(); ctx.ellipse(ex, 56 - (wide ? 4 : 0), 14, 3, s * 0.12, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(160, 120, 40, 0.8)'; ctx.lineWidth = 0.4; for (let k = -10; k < 12; k += 3) { ctx.beginPath(); ctx.moveTo(ex + k, 57 - (wide ? 4 : 0)); ctx.lineTo(ex + k + 2, 54 - (wide ? 4 : 0)); ctx.stroke(); }
  }
  // The nose: bulbous, red at the tip, the nostrils; a hair out of one
  const ng = ctx.createRadialGradient(124, 86, 1, 128, 88, 14);
  ng.addColorStop(0, '#FFB070'); ng.addColorStop(1, '#D8602A');
  shape(ctx, () => { ctx.moveTo(122, 66); ctx.bezierCurveTo(118, 82, 112, 88, 116, 94); ctx.bezierCurveTo(122, 99, 134, 99, 140, 94); ctx.bezierCurveTo(144, 88, 138, 82, 134, 66); }, ng, 1);
  ctx.fillStyle = '#5A1A0A'; ctx.beginPath(); ctx.ellipse(122, 94, 3, 1.6, 0.3, 0, Math.PI * 2); ctx.ellipse(134, 94, 3, 1.6, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 0.3; ctx.beginPath(); ctx.moveTo(122, 95); ctx.lineTo(121, 98); ctx.stroke();
  // The mouth hanging open: a tooth gone from the punch, the tongue lolling out the side, blood off the lip
  shape(ctx, () => { ctx.moveTo(110, 108); ctx.quadraticCurveTo(128, 102, 146, 108); ctx.quadraticCurveTo(142, 122, 128, 122); ctx.quadraticCurveTo(114, 122, 110, 108); }, '#3F0D0D', 1.1);
  for (let k = 0; k < 7; k++) { if (k === 3) continue; ctx.fillStyle = k % 2 ? '#F2E8C0' : '#FFF8DC'; ctx.fillRect(114 + k * 4, 107.5, 3.4, 3.4); ctx.strokeStyle = 'rgba(26,11,6,0.6)'; ctx.lineWidth = 0.3; ctx.strokeRect(114 + k * 4, 107.5, 3.4, 3.4); }
  shape(ctx, () => { ctx.moveTo(132, 116); ctx.quadraticCurveTo(144, 118, 148, 128); ctx.quadraticCurveTo(146, 134, 140, 130); ctx.quadraticCurveTo(136, 124, 128, 120); }, '#E06A84', 0.8);
  ctx.fillStyle = '#B4140C'; ctx.fillRect(110, 112, 1.4, 6 + Math.min(6, t * 0.05)); ctx.beginPath(); ctx.arc(110.7, 118 + Math.min(6, t * 0.05), 1.2, 0, Math.PI * 2); ctx.fill();
  // The lips: a pout, ink round it
  ctx.strokeStyle = '#A83A26'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(110, 108); ctx.quadraticCurveTo(128, 101, 146, 108); ctx.stroke();
  // Sweat
  for (let i = 0; i < 10; i++) bead(ctx, 84 + hash(i * 6.6) * 88, 40 + hash(i * 2.9) * 70, 0.8 + hash(i * 4.4) * 1.1);
  // The bulge: a lump under the skin of his forehead, nosing about, then pushing out, the skin stretched shiny and
  // pale over it, veins up round it
  if (bulge > 0) {
    const bx = 128 + Math.sin(t * 0.21) * 10 * (1 - bulge), by = 40 - bulge * 4, br = 8 + bulge * 16;
    const lg = ctx.createRadialGradient(bx - br * 0.3, by - br * 0.3, 1, bx, by, br);
    lg.addColorStop(0, 'rgba(255, 236, 210, 0.95)'); lg.addColorStop(0.6, 'rgba(255, 196, 140, 0.6)'); lg.addColorStop(1, 'rgba(255, 196, 140, 0)');
    ctx.fillStyle = lg; ctx.beginPath(); ctx.ellipse(bx, by, br, br * 0.8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = `rgba(26, 11, 6, ${0.3 + bulge * 0.4})`; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.ellipse(bx, by, br * 0.9, br * 0.72, 0, 0.3, Math.PI - 0.3); ctx.stroke();
    // (stretch marks; the veins)
    ctx.strokeStyle = `rgba(255, 250, 240, ${bulge * 0.6})`; ctx.lineWidth = 0.4;
    for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(bx + Math.cos(a) * br * 0.5, by + Math.sin(a) * br * 0.4); ctx.lineTo(bx + Math.cos(a) * br * 0.85, by + Math.sin(a) * br * 0.68); ctx.stroke(); }
    if (bulge > 0.3) for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2 + 0.4;
      alienVein(ctx, [[bx + Math.cos(a) * br * 0.9, by + Math.sin(a) * br * 0.7], [bx + Math.cos(a + 0.2) * br * 1.2, by + Math.sin(a + 0.2) * br], [bx + Math.cos(a) * br * 1.5, by + Math.sin(a) * br * 1.25]], 0.9, bulge);
    }
    glint(ctx, bx - br * 0.4, by - br * 0.45, 3);
  }
  // The hair: the swoop, lacquered (it splits with the rest of him)
  const hairPath = () => { ctx.moveTo(70, 46); ctx.bezierCurveTo(64, 16, 96, 2, 138, 4); ctx.bezierCurveTo(176, 6, 200, 22, 194, 44); ctx.bezierCurveTo(190, 54, 184, 50, 182, 40); ctx.bezierCurveTo(170, 28, 120, 22, 86, 36); ctx.bezierCurveTo(80, 40, 76, 50, 70, 46); };
  const hg2 = ctx.createLinearGradient(0, 2, 0, 50);
  hg2.addColorStop(0, '#FCF0B0'); hg2.addColorStop(0.4, '#F8D878'); hg2.addColorStop(1, '#C89A10');
  shape(ctx, hairPath, hg2, 1.4);
  ctx.save(); ctx.beginPath(); hairPath(); ctx.clip();
  ctx.strokeStyle = 'rgba(160, 110, 10, 0.55)'; ctx.lineWidth = 0.5;
  for (let k = 0; k < 22; k++) { ctx.beginPath(); ctx.moveTo(72 + k * 6, 46 - k * 0.5); ctx.bezierCurveTo(90 + k * 5, 10, 150 + k * 2, 4, 196, 30 + k * 0.4); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(255, 255, 230, 0.7)'; ctx.lineWidth = 0.6;
  for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(100 + k * 14, 14 + k); ctx.quadraticCurveTo(120 + k * 12, 8, 140 + k * 10, 12 + k); ctx.stroke(); }
  ctx.restore();
};

/** Inside him: the alien's face behind the gap, wet, green, lit by its own glow; the beady eyes, the under-bite. */
const insideFace = (ctx: Ctx, t: number) => {
  const g = ctx.createRadialGradient(124, 60, 4, 128, 76, 70);
  g.addColorStop(0, '#9BC06C'); g.addColorStop(0.5, '#5A8040'); g.addColorStop(1, '#1C3420');
  ctx.fillStyle = g; ctx.fillRect(60, -10, 136, 160);
  speckle(ctx, 80, 0, 96, 150, 400, 'rgba(10, 30, 10, 0.4)', 21, 0.6);
  // The brow ridge, the eyes under it: tiny, yellow, close together, the pupils pinpricks; bloodshot rims
  ctx.fillStyle = 'rgba(20, 40, 20, 0.6)'; ctx.beginPath(); ctx.ellipse(128, 52, 24, 5, 0, 0, Math.PI * 2); ctx.fill();
  shape(ctx, () => { ctx.moveTo(104, 50); ctx.quadraticCurveTo(128, 40, 152, 50); ctx.quadraticCurveTo(128, 46, 104, 50); }, '#7AA052', 0.8);
  for (const ex of [120, 137]) {
    ctx.fillStyle = ALIEN.eyeRim; ctx.beginPath(); ctx.arc(ex, 58, 4.2, 0, Math.PI * 2); ctx.fill();
    shape(ctx, () => ctx.arc(ex, 58, 3.2, 0, Math.PI * 2), ALIEN.sclera, 0.6);
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(ex + (ex < 128 ? 0.8 : -0.8), 58.3, 0.9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(ex - 1.6, 56, 1, 1);
  }
  // (the nostril slits)
  ctx.fillStyle = '#0E1A0C'; ctx.fillRect(125, 72, 1, 4); ctx.fillRect(131, 72, 1, 4);
  // The under-bite: the lower teeth up over his top lip, yellow pegs
  shape(ctx, () => { ctx.moveTo(100, 100); ctx.quadraticCurveTo(128, 94, 156, 100); ctx.lineTo(156, 104); ctx.quadraticCurveTo(128, 98, 100, 104); ctx.closePath(); }, '#1C0610', 0.8);
  for (let k = 0; k < 6; k++) {
    const x = 106 + k * 8, h = 6 + (k % 3) * 2;
    shape(ctx, () => { ctx.moveTo(x, 104); ctx.lineTo(x + 1, 104 - h); ctx.lineTo(x + 5, 104 - h + 1); ctx.lineTo(x + 6, 104); ctx.closePath(); }, k % 2 ? '#D8CC8C' : '#F4ECC0', 0.6);
  }
  // Wet: it all glistens, slime running down
  for (let i = 0; i < 14; i++) glint(ctx, 96 + hash(i * 3.3) * 64, 10 + hash(i * 5.7) * 120, 2 + hash(i) * 3);
  ctx.fillStyle = 'rgba(168, 224, 58, 0.55)';
  for (let i = 0; i < 6; i++) { const x = 104 + i * 9, len = 10 + ((t * 0.4 + i * 9) % 30); ctx.fillRect(x, 20 + i * 12, 1.2, len); }
};

/** A fat green finger hooked over the torn edge of him, the claw dug in, blood round it. */
const finger = (ctx: Ctx, x0: number, y0: number, x1: number, y1: number, w: number) => {
  const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a), ny = Math.cos(a);
  shape(ctx, () => {
    ctx.moveTo(x0 + nx * w, y0 + ny * w);
    ctx.lineTo(x1 + nx * w * 0.8, y1 + ny * w * 0.8);
    ctx.arc(x1, y1, w * 0.8, a + Math.PI / 2, a - Math.PI / 2, true);
    ctx.lineTo(x0 - nx * w, y0 - ny * w);
    ctx.closePath();
  }, (() => { const g = ctx.createLinearGradient(x0 - nx * w, y0 - ny * w, x0 + nx * w, y0 + ny * w); g.addColorStop(0, '#9BC06C'); g.addColorStop(1, '#2F4D30'); return g; })(), 1.1);
  // (knuckle creases)
  ctx.strokeStyle = 'rgba(16, 30, 12, 0.7)'; ctx.lineWidth = 0.5;
  for (const k of [0.35, 0.6]) { const kx = x0 + (x1 - x0) * k, ky = y0 + (y1 - y0) * k; ctx.beginPath(); ctx.moveTo(kx + nx * w * 0.7, ky + ny * w * 0.7); ctx.quadraticCurveTo(kx + Math.cos(a) * 1.5, ky + Math.sin(a) * 1.5, kx - nx * w * 0.7, ky - ny * w * 0.7); ctx.stroke(); }
  // The claw, dug in; blood welling round it
  const cx = x1 + Math.cos(a) * w * 0.4, cy = y1 + Math.sin(a) * w * 0.4;
  ctx.fillStyle = '#B4140C'; ctx.beginPath(); ctx.ellipse(cx + Math.cos(a) * 2, cy + Math.sin(a) * 2 + 1, 2.4, 1.6, 0, 0, Math.PI * 2); ctx.fill();
  shape(ctx, () => { ctx.moveTo(cx + nx * w * 0.5, cy + ny * w * 0.5); ctx.quadraticCurveTo(cx + Math.cos(a) * 5, cy + Math.sin(a) * 5 + 1, cx + Math.cos(a) * 4, cy + Math.sin(a) * 4 + 2.5); ctx.lineTo(cx - nx * w * 0.5, cy - ny * w * 0.5); ctx.closePath(); }, '#1A140C', 0.5);
  glint(ctx, x0 + (x1 - x0) * 0.4 - nx * w * 0.4, y0 + (y1 - y0) * 0.4 - ny * w * 0.4, 2, a);
};

/**
 * The split, Ren & Stimpy close: the President's face, dazed off the punch; a lump nosing about under his forehead;
 * it rips down the middle from the hairline to the chin, green light in the crack, and two fat green hands come out
 * of it and pry him open like a coat, the halves peeling back, the raw edges of him (the fat, the meat), strings of
 * slime across the gap snapping one by one, and in the gap, the alien's face, beady-eyed, grinning its under-bite.
 */
export const drawSkinSplit = (ctx: Ctx, t: number) => {
  ctx.save();
  const shake = (t >= SPLIT_TEAR && t < SPLIT_TEAR + 10) || (t >= SPLIT_OPEN && t < SPLIT_OPEN + 8) ? (t % 4 < 2 ? 1.5 : -1.5) : 0;
  ctx.translate(shake, 0);
  // (a slow push in)
  const z = 1 + Math.min(t, SPLIT_LEN) / SPLIT_LEN * 0.06;
  ctx.translate(128, 72); ctx.scale(z, z); ctx.translate(-128, -72);
  const green = clamp01((t - SPLIT_TEAR) / 40);
  rays(ctx, t, 128, 60, green > 0 ? `rgb(${Math.round(40 + 60 * green)}, ${Math.round(60 + 120 * green)}, ${Math.round(140 - 90 * green)})` : '#283C8C', '#060A1C', `rgba(${green > 0 ? '200, 255, 140' : '255, 255, 255'}, ${0.04 + green * 0.05})`);
  const bulge = easeInOut((t - 26) / (SPLIT_TEAR - 26));
  const tearK = clamp01((t - SPLIT_TEAR) / 22);
  const gap = t < SPLIT_OPEN ? 0 : 80 * easeOut((t - SPLIT_OPEN) / 56);
  // How far each half's edge has been pulled back at height y (wider at the top: they hinge a little, like a coat
  // being opened)
  const HINGE = 230;
  const peel = (y: number) => gap * 0.3 + gap * 0.2 * (HINGE - y) / HINGE;
  if (gap > 0) insideFace(ctx, t);
  if (gap <= 0) {
    presFace(ctx, t, bulge);
    // The crack, running down from the hairline: green light in it, a dark lip either side
    if (tearK > 0) {
      const y1 = 8 + tearK * 132;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (const [w, c] of [[5, 'rgba(26, 11, 6, 0.8)'], [3, '#5E8A18'], [1.4, '#EAFFB0']] as const) { ctx.beginPath(); tearPath(ctx, 8, y1); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.stroke(); }
      // (the claw tips poking out of it, up near the top)
      if (t > SPLIT_TEAR + 12) {
        const k = clamp01((t - SPLIT_TEAR - 12) / 14);
        for (const [y, s] of [[40, -1], [52, -1], [36, 1], [48, 1]] as const) {
          ctx.fillStyle = '#1A140C'; ctx.beginPath(); ctx.moveTo(tearX(y), y - 2); ctx.lineTo(tearX(y) + s * 5 * k, y + 1); ctx.lineTo(tearX(y), y + 3); ctx.fill();
        }
      }
    }
  } else {
    // The two halves, hinged back
    for (const s of [-1, 1]) {
      ctx.save();
      ctx.translate(s * gap * 0.3, 0);
      ctx.translate(128, HINGE); ctx.rotate(s * Math.atan2(gap * 0.2, HINGE)); ctx.translate(-128, -HINGE);
      ctx.beginPath();
      if (s < 0) { ctx.moveTo(-60, -20); ctx.lineTo(tearX(-20), -20); tearPath(ctx, -15, 170); ctx.lineTo(-60, 170); }
      else { ctx.moveTo(320, -20); ctx.lineTo(tearX(-20), -20); tearPath(ctx, -15, 170); ctx.lineTo(320, 170); }
      ctx.closePath(); ctx.clip();
      presFace(ctx, t, 1);
      // (the raw edge: the meat, the fat, the skin's edge; only the half inside the clip shows)
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (const [w, c] of [[11, '#6A140C'], [7, '#D84A40'], [3.5, '#F8E08A'], [1, INK]] as const) { ctx.beginPath(); tearPath(ctx, 6, 150); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.stroke(); }
      // (blood running down off it)
      for (let i = 0; i < 6; i++) {
        const y = 30 + i * 18, len = Math.min(20, (t - SPLIT_OPEN) * 0.3 + hash(i * 3 + s) * 8);
        ctx.fillStyle = '#9C1010'; ctx.fillRect(tearX(y) + s * 4, y, 1.3, len); ctx.beginPath(); ctx.arc(tearX(y) + s * 4 + 0.65, y + len, 1.1, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
    // Strings of slime across the gap, snapping as it widens
    for (let i = 0; i < 8; i++) {
      const y = 26 + i * 14, snap = 14 + i * 5.5;
      const xl = tearX(y) - peel(y), xr = tearX(y) + peel(y);
      if (gap < snap) {
        const thin = 1 - gap / snap;
        ctx.strokeStyle = `rgba(190, 240, 110, ${0.45 + thin * 0.3})`; ctx.lineWidth = 0.6 + thin * 2;
        ctx.beginPath(); ctx.moveTo(xl, y); ctx.quadraticCurveTo(128, y + gap * 0.35 + 3, xr, y); ctx.stroke();
        ctx.strokeStyle = 'rgba(240, 255, 210, 0.7)'; ctx.lineWidth = 0.4; ctx.beginPath(); ctx.moveTo(xl + 2, y - 0.4); ctx.quadraticCurveTo(128, y + gap * 0.35 + 2.4, xr - 2, y - 0.4); ctx.stroke();
      } else {
        // (snapped: a drip hanging off each side, stretching)
        const len = 4 + Math.min(14, (gap - snap) * 0.8);
        for (const x of [xl + 1.5, xr - 1.5]) { ctx.fillStyle = 'rgba(190, 240, 110, 0.75)'; ctx.fillRect(x - 0.6, y, 1.2, len); ctx.beginPath(); ctx.arc(x, y + len, 1.3, 0, Math.PI * 2); ctx.fill(); }
      }
    }
    // The hands, prying: the back of each fat hand in the gap, its two fingers hooked out over the edge and dug in
    for (const s of [-1, 1]) {
      const hy = s < 0 ? 46 : 40, hx = tearX(hy) + s * (peel(hy) - 9);
      const hg = ctx.createRadialGradient(hx - 4, hy - 6, 1, hx, hy, 14);
      hg.addColorStop(0, '#9BC06C'); hg.addColorStop(1, '#2F4D30');
      shape(ctx, () => ctx.ellipse(hx, hy + 2, 11, 15, s * 0.2, 0, Math.PI * 2), hg, 1.3);
      alienVein(ctx, [[hx - s * 2, hy + 14], [hx + s * 1, hy + 4], [hx - s * 1, hy - 6]], 1.1, 1);
      for (const [dy, w, len] of [[-7, 5.6, 22], [6, 6, 24]] as const) {
        const ey = hy + dy, ex = tearX(ey) + s * peel(ey);
        finger(ctx, hx, ey, ex + s * len, ey + 5, w);
      }
      // (the thumb, braced inside against the other side of the gap)
      finger(ctx, hx, hy + 12, hx - s * 7, hy + 22, 4.2);
    }
  }
  ctx.restore();
  finish(ctx, t);
};

// --- The alien, up close ---------------------------------------------------

/**
 * The alien, Ren & Stimpy close: a cranium the size of a grapefruit perched on top of a jaw like a cinder block, the
 * under-bite (yellow pegs, a sesame seed and a shred of lettuce in them), beady little eyes under a brow like a
 * shelf; purple veins like garden hoses over a hide like a wet handbag; a neck wider than his head with the shirt
 * collar still round it, cutting in, the tie hanging off it too short; rags of the jacket on his shoulders; the ray
 * gun up by his face on his forearm, the coil glowing pink. `talking`: the jaw working.
 */
export const drawAlienCloseUp = (ctx: Ctx, t: number, talking: boolean) => {
  ctx.save();
  const z = 1.03 - 0.03 * Math.exp(-t / 6) + Math.min(t, 160) / 160 * 0.04;
  ctx.translate(128, 70); ctx.scale(z, z); ctx.translate(-128, -70);
  rays(ctx, t, 124, 40, '#4C7838', '#040A10', 'rgba(200, 255, 140, 0.05)');
  // (the press room's curtain, way out of focus, behind him)
  ctx.fillStyle = 'rgba(20, 40, 160, 0.16)'; for (let x = -10; x < 270; x += 28) ctx.fillRect(x, -10, 12, 170);
  const ink = INK;
  const breathe = Math.sin(t * 0.08) * 1.2;
  const th = 1 + Math.sin(t * 0.3) * 0.15;

  // --- The shoulders: traps humped up nearly to where his ears would be ---
  const shoulders = () => { ctx.moveTo(-20, 150); ctx.lineTo(-20, 116); ctx.bezierCurveTo(10, 96, 40, 66, 76, 60 + breathe); ctx.lineTo(180, 60 + breathe); ctx.bezierCurveTo(216, 66, 246, 96, 276, 116); ctx.lineTo(276, 150); ctx.closePath(); };
  const sg = ctx.createLinearGradient(0, 60, 0, 150);
  sg.addColorStop(0, '#87AA5C'); sg.addColorStop(0.45, '#416536'); sg.addColorStop(1, '#15241A');
  shape(ctx, shoulders, sg, 1.8);
  ctx.save(); ctx.beginPath(); shoulders(); ctx.clip();
  speckle(ctx, -20, 60, 296, 90, 900, 'rgba(10, 20, 8, 0.4)', 31, 0.6);
  speckle(ctx, -20, 60, 296, 40, 200, 'rgba(220, 240, 180, 0.3)', 37, 0.4);
  hatch(ctx, 180, 90, 100, 60, 2.4, 0.3);
  // (the line where each trap meets the shoulder)
  ctx.strokeStyle = 'rgba(16, 30, 12, 0.6)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(14, 112); ctx.quadraticCurveTo(40, 96, 46, 120); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(242, 112); ctx.quadraticCurveTo(216, 96, 210, 120); ctx.stroke();
  ctx.restore();
  alienVein(ctx, [[30, 100], [44, 86], [60, 76], [70, 70]], 2.2, th);
  alienVein(ctx, [[226, 100], [212, 88], [196, 78]], 2, th);
  // What's left of the jacket: a torn piece of it still on each shoulder, pinstriped, threads hanging off the rip
  for (const s of [-1, 1]) {
    const X = (x: number) => (s < 0 ? x : 256 - x);
    const rag = () => { ctx.moveTo(X(-20), 112); ctx.lineTo(X(8), 96); ctx.lineTo(X(30), 90); ctx.lineTo(X(42), 98); ctx.lineTo(X(36), 104); ctx.lineTo(X(40), 112); ctx.lineTo(X(28), 110); ctx.lineTo(X(24), 120); ctx.lineTo(X(14), 114); ctx.lineTo(X(8), 128); ctx.lineTo(X(-2), 120); ctx.lineTo(X(-20), 134); ctx.closePath(); };
    const rg = ctx.createLinearGradient(X(-20), 90, X(40), 130);
    rg.addColorStop(0, '#0E1230'); rg.addColorStop(1, '#303A7A');
    shape(ctx, rag, rg, 1.2);
    ctx.save(); ctx.beginPath(); rag(); ctx.clip();
    ctx.strokeStyle = 'rgba(160, 170, 220, 0.2)'; ctx.lineWidth = 0.35;
    for (let k = -30; k < 60; k += 3.5) { ctx.beginPath(); ctx.moveTo(X(k), 86); ctx.lineTo(X(k - 12), 136); ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = 'rgba(200, 200, 230, 0.7)'; ctx.lineWidth = 0.3;
    for (const [x, y] of [[36, 104], [28, 110], [14, 114], [8, 128]] as const) { ctx.beginPath(); ctx.moveTo(X(x), y); ctx.quadraticCurveTo(X(x + 2), y + 3, X(x), y + 6 + Math.sin(t * 0.1 + x) * 0.6); ctx.stroke(); }
  }

  // --- The neck under the jaw, the collar round it cutting in, the tie hanging off it, far too short ---
  shape(ctx, () => { ctx.moveTo(80, 150); ctx.lineTo(84, 100); ctx.lineTo(172, 100); ctx.lineTo(176, 150); ctx.closePath(); }, '#2F4D30', 1.4);
  shape(ctx, () => { ctx.moveTo(78, 118); ctx.quadraticCurveTo(128, 130, 178, 118); ctx.lineTo(180, 128); ctx.quadraticCurveTo(128, 140, 76, 128); ctx.closePath(); }, '#F4F1E6', 1.2);
  ctx.strokeStyle = 'rgba(120, 120, 140, 0.6)'; ctx.lineWidth = 0.5; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(90 + k * 24, 123); ctx.lineTo(94 + k * 24, 132); ctx.stroke(); }
  ctx.strokeStyle = '#D0D0D0'; ctx.lineWidth = 0.3; ctx.beginPath(); ctx.moveTo(152, 130); ctx.quadraticCurveTo(154, 136, 153, 139 + Math.sin(t * 0.2)); ctx.stroke();
  shape(ctx, () => ctx.arc(153, 140 + Math.sin(t * 0.2), 1.6, 0, Math.PI * 2), '#F8F8F0', 0.4);
  shape(ctx, () => { ctx.moveTo(120, 128); ctx.lineTo(136, 128); ctx.lineTo(134, 137); ctx.lineTo(122, 137); ctx.closePath(); }, '#C8201C', 1);
  shape(ctx, () => { ctx.moveTo(122, 137); ctx.lineTo(134, 137); ctx.lineTo(135, 145); ctx.lineTo(128, 149); ctx.lineTo(121, 145); ctx.closePath(); }, '#E0302A', 1);

  // --- The head: one lump. A cranium the size of a grapefruit on top, flaring out into a jaw like a cinder block ---
  const MOUTH = 84;
  const jawDrop = talking ? (t % 10 < 5 ? 6 : 2) : 1 + Math.max(0, Math.sin(t * 0.08)) * 1.2;
  const head = () => {
    ctx.moveTo(124, 4);
    ctx.bezierCurveTo(140, 4, 150, 12, 151, 25);
    ctx.bezierCurveTo(152, 33, 160, 39, 172, 47);
    ctx.bezierCurveTo(187, 57, 191, 80, 187, 97);
    ctx.bezierCurveTo(183, 112, 166, 121, 128, 121);
    ctx.bezierCurveTo(90, 121, 73, 112, 69, 97);
    ctx.bezierCurveTo(65, 80, 69, 57, 84, 47);
    ctx.bezierCurveTo(96, 39, 101, 33, 99, 25);
    ctx.bezierCurveTo(98, 12, 108, 4, 124, 4);
    ctx.closePath();
  };
  const paintHead = (lowerHalf: boolean) => {
    ctx.save();
    ctx.beginPath(); if (lowerHalf) ctx.rect(0, MOUTH, 256, 80); else ctx.rect(0, -20, 256, MOUTH + 20); ctx.clip();
    if (lowerHalf) ctx.translate(0, jawDrop);
    const hg = ctx.createRadialGradient(108, 30, 3, 124, 64, 76);
    hg.addColorStop(0, '#C0D494'); hg.addColorStop(0.3, '#74994E'); hg.addColorStop(0.7, '#416536'); hg.addColorStop(1, '#15241A');
    shape(ctx, head, hg, 1.9);
    ctx.save(); ctx.beginPath(); head(); ctx.clip();
    // (the far side in shadow; the chin's underside pale, frog-belly)
    const sh = ctx.createLinearGradient(100, 0, 192, 0);
    sh.addColorStop(0, 'rgba(10, 20, 8, 0)'); sh.addColorStop(1, 'rgba(10, 20, 8, 0.55)');
    ctx.fillStyle = sh; ctx.fillRect(100, 0, 100, 130);
    if (lowerHalf) {
      const cg = ctx.createRadialGradient(124, 122, 4, 126, 116, 46);
      cg.addColorStop(0, 'rgba(230, 224, 174, 0.75)'); cg.addColorStop(1, 'rgba(230, 224, 174, 0)');
      ctx.fillStyle = cg; ctx.fillRect(60, 86, 140, 40);
      ctx.strokeStyle = 'rgba(16, 30, 12, 0.6)'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(126, 106); ctx.quadraticCurveTo(125, 114, 126, 120); ctx.stroke();
      ctx.fillStyle = 'rgba(10, 16, 6, 0.4)'; ctx.fillRect(60, MOUTH, 140, 4);
    }
    speckle(ctx, 64, 0, 130, 124, 1100, 'rgba(10, 20, 8, 0.38)', lowerHalf ? 51 : 61, 0.55);
    speckle(ctx, 70, 4, 70, 50, 220, 'rgba(230, 250, 190, 0.32)', lowerHalf ? 53 : 67, 0.45);
    hatch(ctx, 160, 40, 34, 84, 2.2, 0.3);
    if (!lowerHalf) {
      // (warts, each lit)
      for (const [wx, wy, wr] of [[82, 64, 2.4], [174, 70, 2], [146, 18, 1.6], [92, 76, 1.4], [108, 14, 1.2]] as const) { shape(ctx, () => ctx.arc(wx, wy, wr, 0, Math.PI * 2), '#6A8A48', 0.5); ctx.fillStyle = 'rgba(255,255,230,0.6)'; ctx.fillRect(wx - wr * 0.5, wy - wr * 0.6, 0.7, 0.7); }
      // (the folds down from his nose to the corners of his mouth)
      ctx.strokeStyle = 'rgba(16, 30, 12, 0.7)'; ctx.lineWidth = 0.9;
      ctx.beginPath(); ctx.moveTo(116, 62); ctx.quadraticCurveTo(100, 70, 96, MOUTH - 1); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(136, 62); ctx.quadraticCurveTo(152, 70, 158, MOUTH - 1); ctx.stroke();
    }
    ctx.restore();
    ctx.restore();
  };
  // (the inside of the mouth first: dark, the purple gums, the tongue when it drops)
  shape(ctx, () => ctx.rect(76, MOUTH - 2, 106, 4 + jawDrop), ALIEN.mouth, 0);
  ctx.fillStyle = ALIEN.gumDark; ctx.fillRect(76, MOUTH - 2, 106, 2.4);
  if (jawDrop > 3) { ctx.fillStyle = '#B8507A'; ctx.beginPath(); ctx.ellipse(126, MOUTH + jawDrop, 22, 3.4, 0, 0, Math.PI * 2); ctx.fill(); }
  paintHead(true);
  paintHead(false);
  // The mouth's line: wide, the corners pulled down
  ctx.strokeStyle = ink; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(74, MOUTH + 3); ctx.quadraticCurveTo(80, MOUTH - 1, 126, MOUTH); ctx.quadraticCurveTo(172, MOUTH - 1, 182, MOUTH + 3); ctx.stroke();
  // The under-bite: pegs of teeth up out of his lower jaw, over his top lip: uneven, yellow, brown at the roots, one
  // chipped; a sesame seed and a shred of lettuce stuck in them (he's had a burger)
  const teeth = [[86, 11, 7], [97, 16, 8], [109, 13, 8], [121, 19, 9], [134, 14, 8], [146, 18, 8], [158, 12, 7], [168, 9, 6]];
  teeth.forEach(([x, h, w], i) => {
    const by = MOUTH + 3 + jawDrop;
    const tg = ctx.createLinearGradient(0, by - h, 0, by);
    tg.addColorStop(0, '#F8F0C8'); tg.addColorStop(0.65, '#D8CC8C'); tg.addColorStop(1, '#6A5A28');
    const chip = i === 4 ? 3 : 0;
    shape(ctx, () => { ctx.moveTo(x, by); ctx.lineTo(x + 0.6, by - h + 3); ctx.quadraticCurveTo(x + w * 0.3, by - h, x + w * 0.55, by - h + chip); ctx.lineTo(x + w - 0.6, by - h + 2 + chip); ctx.lineTo(x + w, by); ctx.closePath(); }, tg, 0.8);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'; ctx.fillRect(x + 1.4, by - h + 3, 0.8, h * 0.4);
  });
  ctx.fillStyle = '#F4E8C0'; ctx.beginPath(); ctx.ellipse(119.5, MOUTH - 4 + jawDrop, 1.2, 0.7, 0.4, 0, Math.PI * 2); ctx.fill();
  shape(ctx, () => { ctx.moveTo(141, MOUTH - 2 + jawDrop); ctx.quadraticCurveTo(144, MOUTH - 7 + jawDrop, 146, MOUTH - 1 + jawDrop); ctx.quadraticCurveTo(144, MOUTH + 1 + jawDrop, 141, MOUTH - 2 + jawDrop); }, '#5CB43C', 0.3);
  // (ear holes, either side)
  for (const ex of [74, 182]) { ctx.fillStyle = '#0B140C'; ctx.beginPath(); ctx.ellipse(ex, 66, 1.4, 3, 0, 0, Math.PI * 2); ctx.fill(); }
  // The nostril slits, flaring as he breathes, and the bridge between them
  const flare = Math.max(0, Math.sin(t * 0.08)) * 0.6;
  for (const nx of [120, 132]) { ctx.fillStyle = '#0B140C'; ctx.beginPath(); ctx.ellipse(nx, 60, 1.2 + flare, 3, nx < 126 ? 0.3 : -0.3, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = 'rgba(230, 250, 190, 0.4)'; ctx.fillRect(125.5, 50, 1, 10);
  // Veins over the cranium like a road map, and down the temples
  alienVein(ctx, [[104, 30], [107, 22], [113, 14], [120, 10]], 1.1, th);
  alienVein(ctx, [[107, 22], [102, 18]], 0.8, th);
  alienVein(ctx, [[146, 28], [144, 19], [138, 12], [140, 7]], 1, th);
  alienVein(ctx, [[144, 19], [149, 15]], 0.7, th);
  alienVein(ctx, [[84, 76], [80, 64], [86, 50]], 1.6, th);
  alienVein(ctx, [[176, 76], [181, 62], [172, 50]], 1.6, th);
  glint(ctx, 112, 12, 4); glint(ctx, 118, 8, 2); glint(ctx, 88, 54, 3);
  // --- The brow: a shelf jutting over his eyes; the eyes under it, tiny, yellow, close-set, bloodshot; a slow blink ---
  shape(ctx, () => { ctx.moveTo(98, 40); ctx.bezierCurveTo(108, 32, 144, 32, 154, 40); ctx.bezierCurveTo(146, 43, 106, 43, 98, 40); }, '#6A8A48', 1.2);
  ctx.strokeStyle = 'rgba(230, 250, 190, 0.5)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(104, 37); ctx.quadraticCurveTo(126, 32, 148, 37); ctx.stroke();
  ctx.fillStyle = 'rgba(10, 20, 8, 0.6)'; ctx.beginPath(); ctx.ellipse(126, 44, 24, 3.4, 0, 0, Math.PI * 2); ctx.fill();
  const blink = t % 140 < 6;
  for (const [ex, look] of [[118, 0.7], [134, -0.5]] as const) {
    ctx.fillStyle = '#3A0A08'; ctx.beginPath(); ctx.ellipse(ex, 47, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
    if (blink) { ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ex - 4, 47); ctx.lineTo(ex + 4, 47); ctx.stroke(); continue; }
    const eg = ctx.createRadialGradient(ex - 1, 46, 0.5, ex, 47, 4);
    eg.addColorStop(0, '#FFF8A0'); eg.addColorStop(1, '#A8962A');
    shape(ctx, () => ctx.ellipse(ex, 47, 3.6, 3, 0, 0, Math.PI * 2), eg, 0.8);
    ctx.strokeStyle = 'rgba(200, 30, 20, 0.8)'; ctx.lineWidth = 0.25;
    for (let v = 0; v < 5; v++) { const a = v * 1.3 + ex; ctx.beginPath(); ctx.moveTo(ex + Math.cos(a) * 3.4, 47 + Math.sin(a) * 2.8); ctx.lineTo(ex + Math.cos(a + 0.3) * 1.8, 47 + Math.sin(a + 0.3) * 1.5); ctx.stroke(); }
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(ex + look, 47.4, 0.8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(ex - 2, 45, 1, 1);
  }

  // --- Drool off his lip, swinging; slime glinting all over ---
  const sw = Math.sin(t * 0.07) * 3, dl = 14 + (t * 0.25) % 22;
  ctx.strokeStyle = 'rgba(200, 240, 140, 0.75)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(176, MOUTH + 2 + jawDrop); ctx.quadraticCurveTo(178 + sw * 0.5, MOUTH + dl * 0.5, 177 + sw, MOUTH + dl); ctx.stroke();
  shape(ctx, () => ctx.ellipse(177 + sw, MOUTH + 1 + dl, 1.8, 2.4, 0, 0, Math.PI * 2), 'rgba(200, 240, 140, 0.85)', 0);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(176.4 + sw, MOUTH + dl, 0.7, 0.7);
  for (let i = 0; i < 12; i++) glint(ctx, 76 + hash(i * 9.1) * 100, 10 + hash(i * 4.3) * 100, 1.5 + hash(i * 2.2) * 2.5);

  // --- His gun arm up beside his head: a forearm like a ham, the chrome barrel grafted on, tubes into his veins ---
  const fa = () => { ctx.moveTo(198, 150); ctx.bezierCurveTo(194, 120, 198, 96, 204, 72); ctx.lineTo(240, 72); ctx.bezierCurveTo(246, 96, 252, 120, 254, 150); ctx.closePath(); };
  const fg = ctx.createLinearGradient(198, 0, 254, 0);
  fg.addColorStop(0, '#97B46A'); fg.addColorStop(0.4, '#587F40'); fg.addColorStop(1, '#15241A');
  shape(ctx, fa, fg, 1.8);
  ctx.save(); ctx.beginPath(); fa(); ctx.clip(); speckle(ctx, 194, 72, 62, 80, 300, 'rgba(10, 20, 8, 0.45)', 81, 0.6); ctx.restore();
  alienVein(ctx, [[206, 140], [210, 116], [205, 96], [210, 78]], 2.2, th);
  // (the fist on top of it, from the knuckle side: the two fat fingers curled over, black claws hooked down, the thumb)
  const fist = () => ctx.roundRect(200, 50, 42, 28, 9);
  const fsg = ctx.createRadialGradient(208, 54, 2, 220, 64, 30);
  fsg.addColorStop(0, '#B0CC80'); fsg.addColorStop(1, '#2F4D30');
  shape(ctx, fist, fsg, 1.6);
  for (const fy of [56, 66]) {
    shape(ctx, () => ctx.roundRect(203, fy, 30, 9, 4.5), '#74994E', 1);
    ctx.fillStyle = 'rgba(230, 250, 190, 0.45)'; ctx.fillRect(206, fy + 1.5, 20, 0.8);
    shape(ctx, () => { ctx.moveTo(204, fy + 2); ctx.quadraticCurveTo(199, fy + 5, 202, fy + 10); ctx.lineTo(205, fy + 7); ctx.closePath(); }, '#1A140C', 0.5);
  }
  shape(ctx, () => ctx.ellipse(236, 54, 6, 8, 0.3, 0, Math.PI * 2), '#587F40', 1.1);
  // The barrel along it: chrome, ribbed, the coil glowing pink through slots; a pink light off it on his face
  const bx0 = 238, bw = 14, by0 = 30;
  const bgr = ctx.createLinearGradient(bx0, 0, bx0 + bw, 0);
  bgr.addColorStop(0, '#5C636E'); bgr.addColorStop(0.25, '#F0F6FA'); bgr.addColorStop(0.45, '#868E9A'); bgr.addColorStop(1, '#1C1F24');
  shape(ctx, () => ctx.roundRect(bx0, by0, bw, 120, 3), bgr, 1.4);
  for (let r = 0; r < 10; r++) { ctx.fillStyle = 'rgba(10, 12, 16, 0.6)'; ctx.fillRect(bx0, by0 + 6 + r * 11, bw, 1.2); }
  const pulse = 0.6 + Math.sin(t * 0.4) * 0.4;
  for (let r = 0; r < 4; r++) { ctx.fillStyle = `rgba(255, ${Math.round(120 + pulse * 100)}, 228, ${0.7 + pulse * 0.3})`; ctx.fillRect(bx0 + 4, by0 + 18 + r * 11, bw - 8, 6); }
  shape(ctx, () => ctx.ellipse(bx0 + bw / 2, by0, bw / 2 + 2, 3, 0, 0, Math.PI * 2), '#B6BEC8', 1.2);
  ctx.fillStyle = `rgba(255, 140, 228, ${0.6 + pulse * 0.4})`; ctx.beginPath(); ctx.ellipse(bx0 + bw / 2, by0, bw / 2 - 1, 1.6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.lineCap = 'round';
  for (const [y0, y1] of [[90, 104], [112, 130]] as const) {
    ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx0, y0); ctx.quadraticCurveTo(bx0 - 14, (y0 + y1) / 2, bx0 - 22, y1); ctx.stroke();
    ctx.strokeStyle = '#7A0C5E'; ctx.lineWidth = 2; ctx.stroke();
    ctx.strokeStyle = INK; ctx.lineWidth = 0.4; for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(bx0 - 24 + k * 1.5, y1 - 2); ctx.lineTo(bx0 - 23 + k * 1.5, y1 + 2); ctx.stroke(); }
  }
  ctx.fillStyle = `rgba(255, 140, 228, ${0.07 + pulse * 0.06})`; ctx.beginPath(); ctx.ellipse(196, 60, 26, 44, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  finish(ctx, t);
};

// --- The leg -------------------------------------------------------------

/**
 * His leg hair, Ren & Stimpy close: his shin through the hole the beam burned in his jeans: the denim charred black
 * round it, the edge still glowing, threads frayed and curling; the shin, his tan, a ridge of bone down it; a thicket
 * of leg hair, and in the middle where the beam went the hairs are crisped into tight spirals, blackened, their tips
 * still glowing, each with a wisp of smoke coming off it; the burn under them red and shiny, a blister. Smoke rolls
 * up out of the hole. The hairs curl up as you watch.
 */
export const drawLegSinge = (ctx: Ctx, t: number) => {
  ctx.save();
  const z = 1.04 - 0.04 * Math.exp(-t / 5) + Math.min(t, 130) / 130 * 0.04;
  ctx.translate(128, 72); ctx.scale(z, z); ctx.translate(-128, -72);
  // The jeans: denim, a twill running across it, the outer seam with its orange stitching, creases
  const dg = ctx.createLinearGradient(0, 0, 256, 0);
  dg.addColorStop(0, '#0E1A40'); dg.addColorStop(0.3, '#2A4A8A'); dg.addColorStop(0.55, '#3A5CA0'); dg.addColorStop(1, '#0C1430');
  ctx.fillStyle = dg; ctx.fillRect(-20, -20, 296, 190);
  ctx.strokeStyle = 'rgba(160, 190, 240, 0.12)'; ctx.lineWidth = 0.5;
  for (let k = -150; k < 300; k += 2.2) { ctx.beginPath(); ctx.moveTo(k, -20); ctx.lineTo(k + 100, 170); ctx.stroke(); }
  speckle(ctx, -20, -20, 296, 190, 900, 'rgba(220, 230, 255, 0.12)', 91, 0.5);
  speckle(ctx, -20, -20, 296, 190, 600, 'rgba(0, 0, 20, 0.25)', 93, 0.6);
  // (the seam down the side, the stitching)
  ctx.fillStyle = 'rgba(0, 0, 20, 0.4)'; ctx.fillRect(214, -20, 6, 190);
  ctx.strokeStyle = '#D88A2A'; ctx.lineWidth = 0.7; ctx.setLineDash([2, 1.6]);
  for (const x of [211, 222]) { ctx.beginPath(); ctx.moveTo(x, -20); ctx.lineTo(x, 170); ctx.stroke(); }
  ctx.setLineDash([]);
  // (creases at the ankle; the boot coming in at the bottom)
  ctx.strokeStyle = 'rgba(0, 0, 20, 0.45)'; ctx.lineWidth = 1.2;
  for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(20 + k * 30, 118 + k * 2); ctx.quadraticCurveTo(60 + k * 30, 112, 100 + k * 34, 120 + k); ctx.stroke(); }
  const bootTop = 128;
  const bg = ctx.createLinearGradient(0, bootTop, 0, 150);
  bg.addColorStop(0, '#3A2A20'); bg.addColorStop(1, '#0C0806');
  shape(ctx, () => { ctx.moveTo(-20, 150); ctx.lineTo(-20, bootTop + 4); ctx.quadraticCurveTo(128, bootTop - 4, 276, bootTop + 4); ctx.lineTo(276, 150); ctx.closePath(); }, bg, 1.6);
  // (the boot's collar: a stitched welt round the top of it, the pull loop, a scuff)
  ctx.strokeStyle = '#8A6A40'; ctx.lineWidth = 0.6; ctx.setLineDash([1.6, 1.2]);
  ctx.beginPath(); ctx.moveTo(-20, bootTop + 8); ctx.quadraticCurveTo(128, bootTop, 276, bootTop + 8); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(255, 230, 200, 0.25)'; ctx.fillRect(60, bootTop + 4, 60, 1);
  shape(ctx, () => { ctx.moveTo(178, bootTop + 2); ctx.quadraticCurveTo(184, bootTop - 12, 190, bootTop + 2); ctx.lineTo(187, bootTop + 2); ctx.quadraticCurveTo(184, bootTop - 7, 181, bootTop + 2); ctx.closePath(); }, '#2A1C14', 0.8);

  // (shat: it's run all the way down here)
  if (shatPants()) shatLegRun(ctx);

  // The hole: ragged, burned through
  const cx = 122, cy = 60;
  const holeR = (a: number) => 50 + Math.sin(a * 3) * 4 + Math.sin(a * 7 + 1) * 3 + (hash(Math.floor((a + 7) * 4)) - 0.5) * 5;
  const hole = (grow = 0) => { ctx.beginPath(); for (let i = 0; i <= 48; i++) { const a = (i / 48) * Math.PI * 2, r = holeR(a) + grow; const x = cx + Math.cos(a) * r * 1.4, y = cy + Math.sin(a) * r * 0.86; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); } ctx.closePath(); };
  // (the scorch round it on the denim: black, then brown, fading out)
  for (const [g, c] of [[14, 'rgba(60, 40, 20, 0.35)'], [9, 'rgba(30, 18, 10, 0.6)'], [5, 'rgba(10, 6, 4, 0.9)']] as const) { hole(g); ctx.fillStyle = c; ctx.fill(); }
  // The shin through it
  ctx.save(); hole(); ctx.clip();
  const sk = ctx.createLinearGradient(cx - 60, 0, cx + 60, 0);
  sk.addColorStop(0, '#8A5426'); sk.addColorStop(0.35, '#E0AC69'); sk.addColorStop(0.5, '#F5D0A9'); sk.addColorStop(0.62, '#D69C5C'); sk.addColorStop(1, '#6A3E1C');
  ctx.fillStyle = sk; ctx.fillRect(cx - 80, cy - 50, 160, 100);
  // (the shinbone's ridge down it, lit)
  ctx.strokeStyle = 'rgba(255, 240, 220, 0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - 6, cy - 50); ctx.quadraticCurveTo(cx - 2, cy, cx - 6, cy + 50); ctx.stroke();
  speckle(ctx, cx - 70, cy - 50, 140, 100, 700, 'rgba(110, 60, 20, 0.35)', 101, 0.5);
  // The burn in the middle: red, shiny, a blister
  const bur = ctx.createRadialGradient(cx + 4, cy + 2, 2, cx + 4, cy + 2, 26);
  bur.addColorStop(0, 'rgba(230, 60, 50, 0.85)'); bur.addColorStop(0.6, 'rgba(200, 70, 50, 0.5)'); bur.addColorStop(1, 'rgba(200, 70, 50, 0)');
  ctx.fillStyle = bur; ctx.beginPath(); ctx.ellipse(cx + 4, cy + 2, 30, 20, 0, 0, Math.PI * 2); ctx.fill();
  shape(ctx, () => ctx.ellipse(cx + 14, cy + 8, 5, 3.6, 0.2, 0, Math.PI * 2), 'rgba(255, 220, 190, 0.75)', 0.6);
  glint(ctx, cx + 12, cy + 6, 2); glint(ctx, cx - 4, cy - 2, 3);
  // The hair: dark and thick, lying down the leg, the odd one curling; the ones the beam went through crisped
  const curl = easeOut(t / 50);
  for (let i = 0; i < 190; i++) {
    const hx = cx - 74 + hash(i * 1.37) * 148, hy = cy - 50 + hash(i * 2.71) * 96;
    const dx = (hx - cx - 4) / 32, dy = (hy - cy - 2) / 22, d = Math.sqrt(dx * dx + dy * dy);
    const len = 12 + hash(i * 4.1) * 8, lean = 0.25 + hash(i * 5.3) * 0.35;
    if (d > 1) {
      // (lying down the leg, a slight curve to each, the root a dot)
      ctx.strokeStyle = 'rgba(16, 10, 6, 0.95)'; ctx.lineWidth = 0.75;
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.bezierCurveTo(hx + lean * len * 0.5, hy + len * 0.35, hx + lean * len * 0.2 + Math.sin(i) * 3, hy + len * 0.7, hx + lean * len * 0.6 + Math.sin(i * 2) * 3, hy + len); ctx.stroke();
      ctx.fillStyle = 'rgba(40, 20, 10, 0.7)'; ctx.fillRect(hx - 0.4, hy - 0.4, 0.9, 0.9);
    } else if (i % 2 === 0) {
      // Crisped: a tight spiral, black, a glowing orange tip, a wisp of smoke off it
      const turns = 1 + curl * 2.2, rr = 3.6 * (0.5 + curl * 0.5), sp = len * (1 - curl * 0.7);
      ctx.strokeStyle = '#120A06'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(hx, hy);
      let tipX = hx, tipY = hy;
      for (let a = 0; a <= turns * Math.PI * 2; a += 0.3) {
        const k = a / (turns * Math.PI * 2), r = rr * (1 - k * 0.5);
        tipX = hx + Math.sin(a + i) * r + k * sp * 0.2; tipY = hy - k * sp * 0.5 + Math.cos(a + i) * r * 0.7;
        ctx.lineTo(tipX, tipY);
      }
      ctx.stroke();
      const glow = 0.5 + 0.5 * Math.sin(t * 0.5 + i);
      ctx.fillStyle = `rgba(255, ${Math.round(140 + glow * 80)}, 40, ${0.7 + glow * 0.3})`; ctx.beginPath(); ctx.arc(tipX, tipY, 0.9, 0, Math.PI * 2); ctx.fill();
      // (a wisp)
      const wp = ((t * 0.6 + i * 7) % 26) / 26;
      ctx.strokeStyle = `rgba(210, 210, 210, ${0.4 * (1 - wp)})`; ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.moveTo(tipX, tipY); ctx.bezierCurveTo(tipX + 3, tipY - 4 - wp * 8, tipX - 3, tipY - 8 - wp * 12, tipX + Math.sin(i + t * 0.05) * 3, tipY - 12 - wp * 18); ctx.stroke();
    }
  }
  ctx.restore();
  // The edge of the hole: the denim's threads frayed and curled; the burning rim glowing, flickering
  ctx.lineJoin = 'round';
  hole(1); ctx.strokeStyle = '#140A04'; ctx.lineWidth = 4; ctx.stroke();
  const flick = 0.55 + Math.sin(t * 0.7) * 0.25 + Math.sin(t * 1.9) * 0.15;
  hole(-0.5); ctx.strokeStyle = `rgba(255, 110, 20, ${flick})`; ctx.lineWidth = 1.6; ctx.stroke();
  hole(-1); ctx.strokeStyle = `rgba(255, 230, 120, ${flick * 0.6})`; ctx.lineWidth = 0.6; ctx.stroke();
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2 + hash(i) * 0.1, r = holeR(a);
    const x = cx + Math.cos(a) * r * 1.4, y = cy + Math.sin(a) * r * 0.86;
    ctx.strokeStyle = i % 3 ? 'rgba(180, 190, 220, 0.8)' : '#1A0E06'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x - Math.cos(a) * 4, y - Math.sin(a) * 3, x - Math.cos(a + 0.6) * 6, y - Math.sin(a + 0.6) * 5); ctx.stroke();
    if (i % 4 === 0) { ctx.fillStyle = `rgba(255, 150, 40, ${flick})`; ctx.fillRect(x - Math.cos(a + 0.6) * 6 - 0.5, y - Math.sin(a + 0.6) * 5 - 0.5, 1, 1); }
  }
  // Smoke rolling up out of it
  for (let i = 0; i < 9; i++) {
    const p = ((t * 0.5 + i * 11) % 90) / 90;
    const px = cx - 30 + i * 8 + Math.sin(p * 6 + i) * 8, py = cy - p * 110, pr = 6 + p * 18;
    const g = ctx.createRadialGradient(px - pr * 0.3, py - pr * 0.3, 1, px, py, pr);
    g.addColorStop(0, `rgba(230, 228, 224, ${0.5 * (1 - p)})`); g.addColorStop(1, `rgba(120, 116, 110, 0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill();
  }
  // Embers drifting up
  for (let i = 0; i < 14; i++) {
    const p = ((t * 0.9 + i * 13) % 70) / 70;
    ctx.fillStyle = `rgba(255, ${Math.round(160 + hash(i) * 80)}, 60, ${1 - p})`;
    ctx.fillRect(cx - 50 + hash(i * 3.1) * 100 + Math.sin(p * 9 + i) * 4, cy + 20 - p * 100, 1, 1);
  }
  ctx.restore();
  finish(ctx, t);
};

/**
 * Meathead sniffing: the smoke off his own leg coming up past his face and into his nose; he takes it in, and it
 * dawns on him, and the fury comes up (the close-up's `fury`, from `turn` frames in).
 */
export const SNIFF_TURN = 110;
const sniffSmoke = (ctx: Ctx, t: number) => {
  if (t >= SNIFF_TURN) return;
  for (let i = 0; i < 10; i++) {
    const p = ((t * 0.9 + i * 9) % 60) / 60;
    // (curling up from the bottom of the frame into his nostrils)
    const x = 128 + Math.sin(p * 7 + i * 0.7) * 14 * (1 - p), y = 144 - p * 72, r = 3 + (1 - p) * 4;
    ctx.fillStyle = `rgba(200, 200, 204, ${0.55 * Math.min(1, p * 3)})`;
    for (let yy = -Math.floor(r); yy <= r; yy++) { const w = Math.round(Math.sqrt(Math.max(0, r * r - yy * yy))); ctx.fillRect(Math.round(x - w), Math.round(y + yy), w * 2, 1); }
  }
  // (his nostrils flaring as he sniffs)
  if (t % 16 < 8) { R(ctx, 119, 73, 6, 3, '#4a2410'); R(ctx, 131, 73, 6, 3, '#4a2410'); }
};

/** The sniff panel: him dumb, the smoke coming up into his nose; then (at SNIFF_TURN) the fury. */
export const drawSniff = (ctx: Ctx, t: number) => {
  if (t < SNIFF_TURN) drawMeatheadCloseUp(ctx, t, false, 'dumb');
  else drawMeatheadCloseUp(ctx, t - SNIFF_TURN, false, 'fury');
  sniffSmoke(ctx, t);
};
