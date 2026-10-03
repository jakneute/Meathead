// The ending cutscene's still images, drawn as SNES-style pixel art on a
// 256x144 canvas (scaled up with no smoothing). Each panel is a function of
// its frame counter so it can blink, flash and animate a little, the way NES
// cutscenes do.

import { shaded, ball, box, bands, RAMP } from './art/snes';

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

/** A US flag hanging from a pole. */
export const hangingFlag = (ctx: Ctx, x: number, top: number) => {
  R(ctx, x, top - 6, 2, 76, C.gold);
  ell(ctx, x + 1, top - 7, 2, 2, C.gold);
  for (let i = 0; i < 13; i++) R(ctx, x + 2, top + i * 3, 16, 3, i % 2 === 0 ? C.red : C.white);
  R(ctx, x + 2, top, 8, 21, C.navyDark);
  for (let i = 0; i < 9; i++) R(ctx, x + 3 + (i % 3) * 2 + (Math.floor(i / 3) % 2), top + 2 + Math.floor(i / 3) * 6, 1, 1, C.white);
  // Folds
  R(ctx, x + 9, top + 21, 1, 18, C.darkRed);
  R(ctx, x + 14, top, 1, 39, 'rgba(0,0,0,0.25)');
};

/** The oval White House sign above the podium. */
export const whSign = (ctx: Ctx, cx: number, cy: number) => {
  ell(ctx, cx, cy, 30, 12, C.gold);
  ell(ctx, cx, cy, 28, 10, C.navyDark);
  // Tiny White House
  R(ctx, cx - 12, cy - 1, 24, 6, C.white);
  R(ctx, cx - 5, cy - 4, 10, 3, C.white);
  R(ctx, cx - 1, cy - 6, 2, 2, C.white);
  for (let i = 0; i < 4; i++) R(ctx, cx - 4 + i * 3, cy - 1, 1, 6, C.lightGray);
};

export const podium = (ctx: Ctx, cx: number, top: number, tilt = 0) => {
  R(ctx, cx - 22, top, 44, 5, C.woodLight);
  shaded(ctx, 'podium', cx - 20, top + 5, 40, 42, RAMP.wood, box(-0.55, -0.4, 0.15, 1, 0.3));
  for (let k = 0; k < 4; k++) R(ctx, cx - 18, top + 10 + k * 10, 36, 1, 'rgba(40, 16, 4, 0.35)'); // (the grain)
  // Presidential seal
  ell(ctx, cx, top + 20, 9, 9, C.gold);
  ell(ctx, cx, top + 20, 7, 7, C.navy);
  R(ctx, cx - 3, top + 17, 6, 5, C.goldLight);
  R(ctx, cx - 5, top + 18, 2, 2, C.goldLight);
  R(ctx, cx + 3, top + 18, 2, 2, C.goldLight);
  // Microphones (knocked askew by the punch)
  for (const side of [-1, 1]) {
    const mx = cx + side * 5;
    for (let i = 0; i < 10; i++) R(ctx, mx + Math.round(side * i * tilt * 0.4), top - i, 1, 1, C.darkGray);
    R(ctx, mx + Math.round(side * 10 * tilt * 0.4) - 1, top - 12, 3, 3, C.ink);
  }
};

/** The press pack in the foreground: heads, shoulders and cameras (with flashes going off). */
export const reporters = (ctx: Ctx, t: number, frenzy: number) => {
  const flashes: [number, number][] = [];
  for (let i = 0; i < 12; i++) {
    const x = 6 + i * 21 + Math.round(hash(i) * 6);
    const y = 124 + Math.round(hash(i + 20) * 6);
    const coat = [C.darkGray, C.navy, '#503000', C.ink][i % 4];
    const hair = ['#503000', C.ink, '#a0a0a0', '#c89040', C.ink][i % 5];
    R(ctx, x - 11, y + 8, 22, 20, coat);
    ell(ctx, x, y, 7, 8, '#e4a070');
    ell(ctx, x, y - 3, 7, 5, hair);
    R(ctx, x - 7, y - 3, 14, 5, hair);
    // (the stage lights on them from the front and above: a sheen on the hair, the far cheek in shadow, the shoulders' edges)
    R(ctx, x - 4, y - 7, 6, 1, 'rgba(255,255,255,0.22)');
    R(ctx, x + 3, y + 2, 3, 5, 'rgba(120, 50, 20, 0.35)');
    R(ctx, x - 11, y + 8, 22, 1, 'rgba(255,255,255,0.15)'); R(ctx, x + 8, y + 9, 3, 19, 'rgba(0,0,0,0.25)');
    // Every other one has a camera up
    if (i % 2 === 1) {
      const cx = x + 3, cy = y - 3;
      R(ctx, cx - 5, cy - 3, 11, 7, C.ink);
      R(ctx, cx - 3, cy - 5, 4, 2, C.ink);
      ell(ctx, cx, cy, 2, 2, C.gray);
      // Flash (more of them in a frenzy)
      const rate = frenzy > 0 ? 3 : 9;
      if (Math.floor(t / 4 + hash(i) * 50) % rate === 0) flashes.push([cx - 4, cy - 5]);
    }
  }
  for (const [fx, fy] of flashes) {
    R(ctx, fx - 1, fy - 5, 2, 12, C.white);
    R(ctx, fx - 6, fy, 12, 2, C.white);
    R(ctx, fx - 3, fy - 2, 6, 6, C.white);
  }
};

// ---------------------------------------------------------------------------
// Characters (small, for the wide shots)
// ---------------------------------------------------------------------------

/** Trump's upper body behind the podium: head centred on (cx, top). */
export const trumpSmall = (ctx: Ctx, cx: number, top: number, t: number, talking: boolean) => {
  // Suit and belly
  R(ctx, cx - 13, top + 14, 26, 22, C.navy);
  R(ctx, cx - 15, top + 18, 30, 18, C.navy);
  R(ctx, cx - 3, top + 14, 6, 8, C.white);
  R(ctx, cx - 1, top + 15, 2, 16, C.red);
  // Arms on the podium
  R(ctx, cx - 17, top + 22, 5, 12, C.navyDark);
  R(ctx, cx + 12, top + 22, 5, 12, C.navyDark);
  // Head
  ell(ctx, cx, top + 7, 7, 8, C.tSkin);
  R(ctx, cx - 5, top + 5, 4, 2, C.tSkinPale);
  R(ctx, cx + 1, top + 5, 4, 2, C.tSkinPale);
  R(ctx, cx - 4, top + 5, 2, 1, C.ink);
  R(ctx, cx + 2, top + 5, 2, 1, C.ink);
  R(ctx, cx - 2, top + 11, 4, talking && t % 12 < 6 ? 3 : 1, '#801010');
  // The hair
  ell(ctx, cx, top + 1, 8, 4, C.tHair);
  R(ctx, cx - 1, top - 2, 10, 3, C.tHair);
  R(ctx, cx + 6, top + 1, 3, 4, C.tHair);
  R(ctx, cx - 3, top - 2, 6, 1, C.tHairLight);
  // (lit from the upper left)
  R(ctx, cx - 13, top + 14, 2, 20, RAMP.navy[4]); R(ctx, cx + 11, top + 14, 2, 20, RAMP.navy[1]);
  R(ctx, cx - 6, top + 3, 2, 8, RAMP.tSkin[5]); R(ctx, cx + 5, top + 5, 2, 7, RAMP.tSkin[2]);
};

/** Meathead full-body, standing (feet at baseY). `arms`: which of the hanging arms to draw (the picture's left and right). */
export const meatheadStanding = (ctx: Ctx, cx: number, baseY: number, withMedal: boolean, arms: { l?: boolean; r?: boolean } = {}) => {
  const armL = arms.l !== false, armR = arms.r !== false;
  // Legs and boots
  R(ctx, cx - 8, baseY - 24, 7, 20, C.pants);
  R(ctx, cx + 1, baseY - 24, 7, 20, C.pants);
  R(ctx, cx - 10, baseY - 4, 9, 4, C.ink);
  R(ctx, cx + 1, baseY - 4, 9, 4, C.ink);
  // Belt
  R(ctx, cx - 10, baseY - 28, 20, 4, C.belt);
  R(ctx, cx - 2, baseY - 28, 4, 4, C.buckle);
  // Torso (big V)
  R(ctx, cx - 10, baseY - 42, 20, 14, C.mSkin);
  R(ctx, cx - 14, baseY - 50, 28, 9, C.mSkin);
  R(ctx, cx, baseY - 40, 1, 10, C.mSkinShade);
  R(ctx, cx - 8, baseY - 43, 16, 1, C.mSkinShade);
  // Arms hanging, huge
  if (armL) { R(ctx, cx - 19, baseY - 50, 6, 22, C.mSkinShade); R(ctx, cx - 19, baseY - 32, 6, 3, C.ink); }
  if (armR) { R(ctx, cx + 13, baseY - 50, 6, 22, C.mSkin); R(ctx, cx + 13, baseY - 32, 6, 3, C.ink); }
  // Head
  R(ctx, cx - 6, baseY - 62, 12, 12, C.mSkin);
  R(ctx, cx - 7, baseY - 66, 14, 5, C.mHair);
  R(ctx, cx - 4, baseY - 58, 3, 1, C.ink);
  R(ctx, cx + 1, baseY - 58, 3, 1, C.ink);
  R(ctx, cx - 3, baseY - 53, 6, 1, C.darkRed);
  // (lit from the upper left: the light down his left side, his right in shadow, the shading under his pecs)
  R(ctx, cx - 14, baseY - 50, 2, 9, C.mSkinLight); R(ctx, cx - 10, baseY - 42, 2, 14, C.mSkinLight); R(ctx, cx - 6, baseY - 62, 2, 12, C.mSkinLight);
  R(ctx, cx + 12, baseY - 50, 2, 9, RAMP.mSkin[3]); R(ctx, cx + 8, baseY - 42, 2, 14, RAMP.mSkin[3]); R(ctx, cx + 4, baseY - 62, 2, 12, RAMP.mSkin[3]);
  if (armL) R(ctx, cx - 19, baseY - 50, 2, 22, RAMP.mSkin[2]);
  if (armR) R(ctx, cx + 17, baseY - 50, 2, 22, RAMP.mSkin[3]);
  R(ctx, cx - 7, baseY - 16, 2, 10, '#2c4ca0'); R(ctx, cx + 2, baseY - 16, 2, 10, '#2c4ca0');
  if (withMedal) {
    R(ctx, cx - 5, baseY - 50, 2, 6, C.blue);
    R(ctx, cx + 3, baseY - 50, 2, 6, C.blue);
    R(ctx, cx - 3, baseY - 45, 6, 2, C.blue);
    ell(ctx, cx, baseY - 41, 3, 3, C.gold);
  }
};

/** Meathead mid-follow-through after the punch, facing right. */
export const meatheadPunched = (ctx: Ctx, cx: number, baseY: number) => {
  // Lunging legs
  R(ctx, cx - 14, baseY - 22, 7, 18, C.pants);
  R(ctx, cx - 18, baseY - 6, 8, 6, C.pants);
  R(ctx, cx - 22, baseY - 4, 9, 4, C.ink);
  R(ctx, cx + 2, baseY - 24, 8, 10, C.pants);
  R(ctx, cx + 6, baseY - 16, 7, 12, C.pants);
  R(ctx, cx + 6, baseY - 4, 11, 4, C.ink);
  R(ctx, cx - 10, baseY - 28, 20, 4, C.belt);
  R(ctx, cx - 2, baseY - 28, 4, 4, C.buckle);
  // Torso twisted into the punch
  R(ctx, cx - 9, baseY - 42, 20, 14, C.mSkin);
  R(ctx, cx - 11, baseY - 50, 28, 9, C.mSkin);
  // Back arm pulled in, punching arm fully extended
  R(ctx, cx - 16, baseY - 46, 7, 12, C.mSkinShade);
  R(ctx, cx + 14, baseY - 49, 26, 7, C.mSkin);
  R(ctx, cx + 36, baseY - 50, 3, 9, C.ink);
  R(ctx, cx + 39, baseY - 51, 8, 10, C.mSkin);
  R(ctx, cx + 45, baseY - 50, 1, 8, C.mSkinShade);
  // Head (yelling)
  R(ctx, cx - 3, baseY - 62, 12, 12, C.mSkin);
  R(ctx, cx - 4, baseY - 66, 14, 5, C.mHair);
  R(ctx, cx + 3, baseY - 58, 4, 1, C.ink);
  R(ctx, cx + 3, baseY - 54, 5, 3, C.darkRed);
  // Medal swinging out
  R(ctx, cx + 2, baseY - 50, 2, 5, C.blue);
  ell(ctx, cx + 6, baseY - 44, 3, 3, C.gold);
};

/** Trump sailing across the room head-first, limbs trailing, hair and tie flapping. */
export const trumpFlying = (ctx: Ctx, cx: number, cy: number, t: number) => {
  const flap = t % 6 < 3 ? 1 : -1;
  // Legs trailing behind (left)
  R(ctx, cx - 38, cy - 2 + flap, 16, 6, C.navyDark);
  R(ctx, cx - 36, cy + 5 - flap, 14, 6, C.navyDark);
  R(ctx, cx - 43, cy - 3 + flap, 6, 7, C.ink);
  R(ctx, cx - 41, cy + 4 - flap, 6, 7, C.ink);
  // Body (belly down)
  R(ctx, cx - 22, cy - 6, 30, 18, C.navy);
  ell(ctx, cx - 8, cy + 10, 13, 5, C.navy);
  R(ctx, cx + 4, cy - 4, 5, 8, C.white);
  // Tie flapping back over his shoulder
  R(ctx, cx - 14, cy - 10 - flap, 20, 3, C.red);
  // Arms flailing
  R(ctx, cx - 6, cy - 16 + flap * 2, 5, 12, C.navyDark);
  R(ctx, cx - 7, cy - 19 + flap * 2, 5, 4, C.tSkin);
  R(ctx, cx + 2, cy + 10, 5, 12 - flap, C.navyDark);
  R(ctx, cx + 2, cy + 21 - flap, 5, 4, C.tSkin);
  // Head leading
  ell(ctx, cx + 16, cy + 1, 8, 8, C.tSkin);
  ell(ctx, cx + 18, cy + 3, 5, 4, C.tSkinShade);
  // Dazed: X eyes and an open mouth
  for (const ex of [cx + 13, cx + 19]) {
    R(ctx, ex, cy - 3, 1, 1, C.ink); R(ctx, ex + 2, cy - 3, 1, 1, C.ink);
    R(ctx, ex + 1, cy - 2, 1, 1, C.ink);
    R(ctx, ex, cy - 1, 1, 1, C.ink); R(ctx, ex + 2, cy - 1, 1, 1, C.ink);
  }
  ell(ctx, cx + 18, cy + 4, 2, 2, '#500000');
  // The hair blown back
  R(ctx, cx + 9, cy - 8, 14, 4, C.tHair);
  R(ctx, cx + 2, cy - 9 + flap, 10, 3, C.tHair);
  R(ctx, cx - 2, cy - 10 + flap, 6, 2, C.tHairShade);
  R(ctx, cx + 12, cy - 8, 8, 1, C.tHairLight);
  // Speed lines behind him
  for (let i = 0; i < 6; i++) R(ctx, cx - 48 - hash(i) * 8, cy - 14 + i * 6, 8 + hash(i + 5) * 10, 1, C.white);
  // Sweat and a tooth flying off
  R(ctx, cx + 26, cy - 10, 2, 2, C.white);
  R(ctx, cx + 30, cy - 4, 2, 3, C.white);
};

// ---------------------------------------------------------------------------
// Panels
// ---------------------------------------------------------------------------

export const drawWhiteHouse = (ctx: Ctx, t: number) => {
  bands(ctx, 0, 0, ART_W, 110, ['#02021a', '#04042a', '#08083c', '#0c0c4c', '#12125c', '#1c1c6c', '#2a2a7c', '#3c3c88']);
  for (let i = 0; i < 40; i++) {
    if (Math.floor(t / 20 + i) % 7 === 0) continue;
    R(ctx, hash(i) * ART_W, hash(i + 40) * 50, 1, 1, C.white);
  }
  ell(ctx, 222, 20, 9, 9, C.moon);
  ell(ctx, 226, 18, 8, 8, C.night);
  // Lawn and fence
  bands(ctx, 0, 108, ART_W, 36, ['#0c2a0c', '#123a12', '#184a16', '#1e5a1c', '#246a22', '#2c7a28']);
  for (let y = 114; y < ART_H; y += 7) for (let x = (y * 3) % 5; x < ART_W; x += 5) R(ctx, x, y, 1, 2, '#3c8c34');
  // (the building's glow on the lawn)
  ctx.fillStyle = 'rgba(252, 224, 168, 0.08)'; ctx.beginPath(); ctx.ellipse(128, 112, 110, 10, 0, 0, Math.PI * 2); ctx.fill();
  // Wings
  shaded(ctx, 'wh-wings', 36, 62, 184, 46, ['#8c8ca4', '#a8a8bc', '#c4c4d4', '#dcdce8', '#f0f0f8', '#ffffff'], (u, v) => 0.95 - v * 0.55 - Math.abs(u - 0.5) * 0.35);
  R(ctx, 36, 100, 184, 8, '#9c9cb0');
  R(ctx, 34, 58, 188, 4, C.lightGray);
  for (let x = 36; x < 220; x += 4) R(ctx, x, 55, 2, 3, C.lightGray);
  for (const row of [68, 86]) {
    for (let x = 42; x < 216; x += 14) {
      if (x > 96 && x < 158) continue;
      R(ctx, x, row, 7, 10, C.lit);
      R(ctx, x + 3, row, 1, 10, C.lightGray);
      R(ctx, x - 1, row - 2, 9, 2, C.lightGray);
    }
  }
  // Portico: pediment and columns
  ctx.fillStyle = C.white;
  for (let i = 0; i < 18; i++) R(ctx, 128 - i * 1.8 - 2, 40 + i, i * 3.6 + 4, 1, i === 17 ? C.lightGray : C.white);
  R(ctx, 94, 58, 68, 3, C.lightGray);
  R(ctx, 98, 61, 60, 41, C.lightGray);
  for (let i = 0; i < 6; i++) {
    R(ctx, 100 + i * 11, 61, 5, 41, C.white);
    R(ctx, 104 + i * 11, 61, 1, 41, C.lightGray);
  }
  R(ctx, 122, 86, 12, 16, C.lit);
  R(ctx, 92, 102, 72, 4, C.white);
  // Flag on the roof
  R(ctx, 127, 22, 1, 18, C.lightGray);
  const wave = t % 30 < 15 ? 0 : 1;
  for (let i = 0; i < 5; i++) R(ctx, 128, 22 + i * 2 + (i > 2 ? wave : 0), 14, 2, i % 2 === 0 ? C.red : C.white);
  R(ctx, 128, 22, 6, 5, C.navyDark);
  // Fence
  R(ctx, 0, 116, ART_W, 1, C.ink);
  for (let x = 2; x < ART_W; x += 6) R(ctx, x, 112, 1, 10, C.ink);
};

/** Wide shot of the press room: Trump at the podium, Meathead beside it. */
export const drawPressRoom = (ctx: Ctx, t: number, talking: boolean) => {
  curtain(ctx, 116);
  whSign(ctx, 128, 20);
  hangingFlag(ctx, 50, 38);
  hangingFlag(ctx, 190, 38);
  bands(ctx, 0, 112, ART_W, 32, ['#7c1000', '#6a0c00', '#580800', '#460600', '#340400']);
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
  const T = RAMP.tSkin, Hh = RAMP.tHair;
  // The tie yanked loose and hanging askew, the top button gone, the shirt grubby
  for (let i = 0; i < 12; i++) R(ctx, 112 + i, 116 + i, 32 - i * 2, 1, C.white);
  R(ctx, 122, 116, 12, 7, '#e8e0cc');
  R(ctx, 132, 118, 12, 6, C.red); R(ctx, 132, 118, 12, 1, RAMP.red[4]);
  for (let k = 0; k < 20; k++) R(ctx, 136 + Math.floor(k / 3), 124 + k, 9, 1, k % 7 === 0 ? RAMP.red[2] : C.red);
  R(ctx, 140, 130, 3, 2, '#b4200c'); R(ctx, 118, 132, 2, 2, '#c8a050');
  // The tape's ghost round his mouth: a pale rectangle where the tan came off with it, raw pink along its edges
  const tx = 108, ty = 92, tw = 40, th = 17;
  R(ctx, tx, ty, tw, th, 'rgba(253, 208, 160, 0.55)');
  for (let x = tx; x < tx + tw; x++) { if (x % 3) R(ctx, x, ty, 1, 1, '#e86a6a'); if ((x + 1) % 3) R(ctx, x, ty + th - 1, 1, 1, '#e86a6a'); }
  for (let y = ty; y < ty + th; y++) { if (y % 2) R(ctx, tx, y, 1, 1, '#e86a6a'); if ((y + 1) % 2) R(ctx, tx + tw - 1, y, 1, 1, '#e86a6a'); }
  // (a strip of the tape still stuck on at one corner, curling up)
  R(ctx, tx + tw - 7, ty - 1, 8, 4, '#a8a8a0'); R(ctx, tx + tw - 7, ty - 1, 8, 1, '#d4d4cc'); R(ctx, tx + tw, ty - 3, 2, 3, '#8c8c84');
  // The mouth again over it (the tape took some of it with it) and ketchup in the corner
  if (mood === 'huh') ell(ctx, 128, 101, 4, 4, '#500000');
  else if (open) { ell(ctx, 128, 100, 9, 5, '#500000'); R(ctx, 121, 96, 14, 2, C.white); }
  else { ell(ctx, 128, 100, 7, 3, '#b02c20'); R(ctx, 122, 100, 12, 1, '#500000'); }
  R(ctx, 136, 101, 3, 2, '#c81e0c'); R(ctx, 137, 103, 1, 2, '#c81e0c');
  // Stubble, grey and orange, over the jowls and chin and up the cheeks (not on the tape's ghost)
  for (let i = 0; i < 260; i++) {
    const x = 94 + Math.floor(hash(i * 1.31) * 68), y = 84 + Math.floor(hash(i * 2.17) * 32);
    if (x >= tx && x < tx + tw && y >= ty && y < ty + th) continue;
    if (Math.abs(x - 128) > 34 - (y - 84) * 0.25) continue;
    R(ctx, x, y, 1, 1, i % 3 ? '#9c5a30' : '#c8b8a8');
  }
  // The bags under his eyes gone dark; red in the whites
  R(ctx, 104, 77, 14, 2, T[1]); R(ctx, 138, 77, 14, 2, T[1]);
  R(ctx, 105, 70, 2, 1, '#e05050'); R(ctx, 149, 70, 2, 1, '#e05050');
  // The swoop come down: strands of it hanging over his brow, one long one off the side down past his ear to his jaw,
  // swinging a little
  const sw = Math.round(Math.sin(t * 0.15) * 1.5);
  for (let i = 0; i < 7; i++) {
    const sx = 100 + i * 9, len = 8 + Math.floor(hash(i * 3.7) * 10);
    for (let k = 0; k < len; k++) R(ctx, sx + Math.floor(k / 4) + (k > len - 4 ? sw : 0), 54 + k, 2, 1, k % 5 === 0 ? Hh[5] : i % 2 ? Hh[2] : Hh[3]);
  }
  for (let k = 0; k < 52; k++) {
    const x = 168 + Math.round(Math.sin(k * 0.12) * 3) + (k > 30 ? sw : 0);
    R(ctx, x, 42 + k, 4, 1, k % 6 === 0 ? Hh[5] : Hh[3]); R(ctx, x + 3, 42 + k, 1, 1, Hh[1]);
  }
  R(ctx, 168 + sw, 94, 5, 2, Hh[2]);
  // (a bead of sweat at his temple, running)
  const d = (t * 0.6) % 30;
  R(ctx, 98, 58 + d, 2, 3, 'rgba(255,255,255,0.6)'); R(ctx, 98, 58 + d, 1, 1, C.white);
};

/**
 * His little hands up from the bottom of the frame, chopping the air in time with it: the pinch, thumb and forefinger
 * touching in a little ring, the other three fingers fanned up behind. Small. Very small.
 */
const trumpHands = (ctx: Ctx, t: number, talking: boolean) => {
  const T = RAMP.tSkin;
  for (const side of [-1, 1]) {
    const bob = talking ? Math.round(Math.sin(t * 0.35 + (side > 0 ? 1.2 : 0)) * 4) : 0;
    const hx = 128 + side * 70, hy = 98 + bob;
    // The sleeve up out of the bottom of the frame, the shirt cuff, the cufflink
    shaded(ctx, `tr-sleeve${side}`, hx - 9, hy + 14, 18, 40, RAMP.navy, box(-0.5, -0.4, 0.15, 1, 0.3));
    R(ctx, hx - 7, hy + 11, 14, 4, C.white); R(ctx, hx - 7, hy + 14, 14, 1, C.lightGray); R(ctx, hx + side * 4 - 1, hy + 12, 2, 2, C.gold);
    // The palm, the back of it to us
    shaded(ctx, `tr-palm${side}`, hx - 6, hy + 1, 12, 11, T, ball(-0.4, -0.6, 0.18));
    // Three fingers fanned up behind (the far side), each a little sausage with a lit edge and a nail
    for (let f = 0; f < 3; f++) {
      const fx = hx - side * 5 + side * f * 3 - 1, fy = hy - 5 + Math.abs(f - 1);
      R(ctx, fx, fy, 3, 7, T[3]); R(ctx, fx, fy, 1, 7, T[5]); R(ctx, fx, fy + 3, 3, 1, T[2]); R(ctx, fx + 1, fy, 1, 1, '#fcd8c0');
    }
    // The forefinger and the thumb, curled into each other: the ring of the pinch, the air through the middle of it
    const rx = hx + side * 5, ry = hy - 2;
    R(ctx, rx - 2, ry - 3, 5, 2, T[4]); R(ctx, rx - 3, ry - 1, 2, 4, T[3]); R(ctx, rx + 2, ry - 1, 2, 4, T[2]); R(ctx, rx - 2, ry + 3, 5, 2, T[3]);
    R(ctx, rx - 2, ry - 3, 5, 1, T[5]);
    R(ctx, rx + side * 2, ry + 1, 1, 1, T[1]);
    // (the knuckles)
    for (let k = 0; k < 3; k++) R(ctx, hx - 4 + k * 3, hy + 3, 2, 1, T[2]);
  }
};


/** Medium two-shot: Trump hanging the medal round Meathead's neck. */
export const drawMedal = (ctx: Ctx, t: number, talking: boolean) => {
  curtain(ctx, ART_H);
  hangingFlag(ctx, 122, 20);
  // Trump (left), side-on, big belly, arms out with the ribbon
  shaded(ctx, 'md-trbody', 34, 70, 58, 74, RAMP.navy, box(0.5, -0.4, 0.15, 1, 0.3));
  shaded(ctx, 'md-trgut', 50, 90, 52, 52, RAMP.navy, ball(0.35, -0.6, 0.15));
  R(ctx, 74, 70, 12, 14, C.white);
  R(ctx, 78, 76, 5, 56, C.red);
  R(ctx, 76, 80, 32, 9, C.navyDark);
  R(ctx, 108, 78, 8, 9, C.tSkin);
  shaded(ctx, 'md-trhead', 48, 30, 36, 40, RAMP.tSkin, ball(0.45, -0.5, 0.15));
  shaded(ctx, 'md-trjowl', 44, 56, 28, 16, RAMP.tSkin, ball(0.4, -0.6, 0.12));
  ell(ctx, 76, 46, 7, 3, C.tSkinPale);
  R(ctx, 74, 45, 5, 2, C.ink);
  R(ctx, 80, 52, 4, 7, C.tSkinShade);
  const open = talking && t % 10 < 5;
  R(ctx, 74, 61, 8, open ? 4 : 2, '#801010');
  shaded(ctx, 'md-trhair', 44, 24, 40, 16, RAMP.tHair, ball(0.3, -0.8, 0.2));
  R(ctx, 64, 27, 26, 7, C.tHair);
  ell(ctx, 88, 34, 5, 5, C.tHair);
  R(ctx, 46, 32, 6, 20, C.tHair);
  R(ctx, 68, 28, 18, 1, C.tHairLight);
  // Meathead (right), a wall of muscle, leaning in for the medal
  // (one mass: the shoulders rounding off either side of it, the chest under)
  shaded(ctx, 'md-mhtorso', 132, 80, 128, 100, RAMP.mSkin, (u, v) => {
    const nx = u * 2 - 1, ny = v * 1.6 - 0.8;
    const top = Math.max(0, 1 - Math.abs(nx) ** 4) ** 0.5;
    if (ny < -top) return -1;
    const lx = -0.5, ly = -0.55, nz = Math.sqrt(Math.max(0.05, 1 - nx * nx * 0.8 - Math.max(0, -ny) ** 2 * 0.6));
    return 0.14 + 0.86 * Math.max(0, nx * 0.8 * lx + Math.min(0, ny) * ly * -1 * -1 + nz * 0.62);
  });
  R(ctx, 166, 110, 58, 1, C.mSkinShade);
  R(ctx, 194, 110, 1, 34, C.mSkinShade);
  R(ctx, 178, 94, 12, 3, C.mSkinLight);
  R(ctx, 200, 94, 12, 3, C.mSkinLight);
  shaded(ctx, 'md-mhneck', 178, 68, 32, 22, RAMP.mSkin, box(-0.6, -0.1, 0.15, 1, 0.2));
  shaded(ctx, 'md-mhhead', 172, 30, 44, 42, RAMP.mSkin, box(-0.5, -0.45, 0.16, 1, 0.5));
  shaded(ctx, 'md-mhhair', 170, 20, 48, 14, RAMP.mHair, box(-0.4, -0.8, 0.1, 0.8, 1));
  R(ctx, 176, 36, 4, 5, C.vein);
  R(ctx, 176, 44, 12, 3, C.ink);
  R(ctx, 196, 44, 12, 3, C.ink);
  R(ctx, 178, 48, 8, 3, C.white);
  R(ctx, 198, 48, 8, 3, C.white);
  R(ctx, 178, 48, 3, 3, C.ink);
  R(ctx, 198, 48, 3, 3, C.ink);
  R(ctx, 184, 62, 14, 2, C.darkRed);
  // The medal: ribbon from Trump's hands to round Meathead's neck
  R(ctx, 116, 80, 62, 3, C.blue);
  R(ctx, 172, 76, 6, 20, C.blue);
  R(ctx, 208, 76, 6, 20, C.blue);
  R(ctx, 176, 94, 34, 4, C.blue);
  shaded(ctx, 'md-medal', 185, 97, 14, 14, RAMP.gold, ball(-0.5, -0.6, 0.2));
  R(ctx, 191, 101, 2, 6, RAMP.gold[1]);
  if (t % 30 < 6) R(ctx, 196, 99, 2, 2, C.white);
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
};

/** Meathead's face, filling the frame (medal round his neck). */
/**
 * Meathead up close. Moods: dumb, disgust; think (eyes rolled up and off to the side, mouth screwed up), stoked (eyes
 * wide, sparkling, a huge grin); fury (brows slammed down into a V, the eyes shrunk to bloodshot slits, teeth bared,
 * flushed, every vein up, steam out of his nose); confused (one brow up, one down, the eyes off in two directions, his
 * mouth hanging open, question marks going round his head). Where he is (the press room's curtain by default) and
 * whether he's got the medal on.
 */
export type MeatheadMood = 'dumb' | 'disgust' | 'think' | 'stoked' | 'fury' | 'confused';
export const drawMeatheadCloseUp = (ctx: Ctx, t: number, talking: boolean, mood: MeatheadMood, where: { bg?: (ctx: Ctx) => void; medal?: boolean; pose?: 'flex' | 'gun' } = {}) => {
  if (where.bg) where.bg(ctx); else curtain(ctx, ART_H);
  // (fury: the camera jolts in on him as it cuts)
  const jolt = mood === 'fury' && t < 12 ? (t % 4 < 2 ? 2 : -2) : 0;
  if (jolt) { ctx.save(); ctx.translate(jolt, 0); }
  // Traps and shoulders, the neck, rounded and lit from the upper left
  shaded(ctx, 'mh-traps', -2, 116, 260, 70, RAMP.mSkin, ball(-0.35, -0.85, 0.12));
  shaded(ctx, 'mh-neck', 96, 94, 64, 36, RAMP.mSkin, box(-0.6, -0.1, 0.18, 1, 0.15));
  // (the cords of his neck running down into the traps, the split of his pecs)
  for (let k = 0; k < 10; k++) { R(ctx, 102 + k, 104 + k * 2, 3, 2, C.mSkinShade); R(ctx, 151 - k, 104 + k * 2, 3, 2, C.mSkinShade); }
  R(ctx, 127, 128, 2, 16, C.mSkinShade); R(ctx, 112, 136, 12, 1, C.mSkinShade); R(ctx, 132, 136, 12, 1, C.mSkinShade);
  // Medal ribbon and medal
  if (where.medal !== false) {
    R(ctx, 96, 112, 8, 24, C.blue);
    R(ctx, 152, 112, 8, 24, C.blue);
    R(ctx, 100, 132, 56, 5, C.blue);
    ell(ctx, 128, 141, 8, 8, C.gold);
    R(ctx, 126, 136, 4, 8, C.goldLight);
  }
  // Square head: rounded at the sides, lit from the upper left, the jaw in its own shadow
  shaded(ctx, 'mh-head', 90, 22, 76, 84, RAMP.mSkin, box(-0.5, -0.45, 0.16, 1, 0.5));
  R(ctx, 94, 102, 68, 1, RAMP.mSkin[2]); R(ctx, 94, 103, 68, 3, RAMP.mSkin[3]);
  // Flat-top (the top of it catching the light) and the sideburns
  shaded(ctx, 'mh-hair', 86, 6, 84, 22, RAMP.mHair, box(-0.4, -0.8, 0.1, 0.8, 1));
  R(ctx, 86, 28, 6, 18, RAMP.mHair[1]);
  R(ctx, 164, 28, 6, 18, RAMP.mHair[0]);
  // Ears
  shaded(ctx, 'mh-ear', 82, 48, 8, 18, RAMP.mSkin, ball(-0.5, -0.4, 0.2));
  shaded(ctx, 'mh-ear2', 166, 48, 8, 18, RAMP.mSkin, ball(-0.9, -0.2, 0.08));
  // Vein
  R(ctx, 104, 32, 3, 8, C.vein);
  R(ctx, 106, 38, 5, 3, C.vein);
  // The flat-top's bristles (the tips catching the light), the hairline sharp across his forehead
  for (let x = 88; x < 168; x += 3) R(ctx, x, 8, 1, 18, '#262626');
  for (let x = 87; x < 169; x += 3) R(ctx, x, 6, 1, 2, '#3c3c3c');
  R(ctx, 92, 28, 60, 1, '#050505');
  // The ears: the fold inside them
  R(ctx, 84, 52, 3, 10, '#a86a2c'); R(ctx, 169, 52, 3, 10, '#a86a2c'); R(ctx, 85, 50, 2, 2, C.mSkin); R(ctx, 169, 50, 2, 2, C.mSkin);
  // Shading: under the cheekbones, down the shadow side of the nose, the temples; the stubble along the jaw; the chin's cleft
  R(ctx, 96, 64, 8, 2, C.mSkinShade); R(ctx, 148, 64, 4, 2, C.mSkinShade);
  R(ctx, 130, 60, 2, 12, C.mSkinShade);
  for (let i = 0; i < 70; i++) { const sx = 92 + hash(i * 3.7) * 72, sy = 88 + hash(i * 5.1) * 12; if (Math.abs(sx - 128) > 16 || sy > 94) R(ctx, sx, sy, 1, 1, '#9c6c38'); }
  R(ctx, 127, 99, 2, 5, C.mSkinShade);
  // Brows and eyes
  if (mood === 'disgust') {
    for (let i = 0; i < 26; i++) { R(ctx, 98 + i, 42 + Math.floor(i / 4), 1, 6, C.mHair); R(ctx, 132 + i, 48 - Math.floor(i / 4), 1, 6, C.mHair); }
  } else if (mood === 'stoked') {
    // Brows way up
    R(ctx, 98, 36, 26, 6, C.mHair);
    R(ctx, 132, 36, 26, 6, C.mHair);
  } else if (mood === 'think') {
    // One up, one down
    R(ctx, 98, 40, 26, 6, C.mHair);
    R(ctx, 132, 46, 26, 5, C.mHair);
  } else if (mood === 'fury') {
    // Slammed down into a V, thick, knotted over the nose; the furrow between them
    for (let i = 0; i < 28; i++) { R(ctx, 96 + i, 38 + Math.floor(i / 2.2), 1, 8, C.mHair); R(ctx, 132 + i, 50 - Math.floor(i / 2.2), 1, 8, C.mHair); }
    R(ctx, 96, 38, 12, 1, '#3a3a44'); R(ctx, 148, 38, 12, 1, '#3a3a44');
    R(ctx, 126, 44, 1, 10, C.mSkinShade); R(ctx, 129, 44, 1, 10, C.mSkinShade); R(ctx, 127, 42, 2, 2, C.mSkinShade);
  } else if (mood === 'confused') {
    // The left one way up (wobbling), the right one down and squashed
    const wob = t % 24 < 12 ? 0 : 1;
    for (let i = 0; i < 26; i++) R(ctx, 98 + i, 34 + wob - Math.round(Math.sin((i / 25) * Math.PI) * 4), 1, 6, C.mHair);
    for (let i = 0; i < 26; i++) R(ctx, 132 + i, 46 + Math.floor(i / 9), 1, 5, C.mHair);
  } else {
    R(ctx, 98, 44, 26, 6, C.mHair);
    R(ctx, 132, 44, 26, 6, C.mHair);
  }
  if (mood === 'stoked') {
    // Eyes wide, sparkling
    R(ctx, 100, 48, 22, 12, C.white);
    R(ctx, 134, 48, 22, 12, C.white);
    R(ctx, 107, 50, 8, 8, C.ink);
    R(ctx, 141, 50, 8, 8, C.ink);
    R(ctx, 108, 51, 3, 3, C.white);
    R(ctx, 142, 51, 3, 3, C.white);
    if (t % 30 < 15) { R(ctx, 96, 40, 2, 6, C.goldLight); R(ctx, 94, 42, 6, 2, C.goldLight); R(ctx, 160, 40, 2, 6, C.goldLight); R(ctx, 158, 42, 6, 2, C.goldLight); }
  } else if (mood === 'think') {
    // Eyes rolled up and off to the side
    R(ctx, 102, 52, 18, 7, C.white);
    R(ctx, 136, 52, 18, 7, C.white);
    R(ctx, 113, 52, 6, 4, C.ink);
    R(ctx, 147, 52, 6, 4, C.ink);
  } else if (mood === 'fury') {
    // Slits under the brows: bloodshot, red at the rims, the pupils shrunk to points dead ahead
    R(ctx, 103, 54, 18, 4, '#f4dcd4'); R(ctx, 135, 54, 18, 4, '#f4dcd4');
    R(ctx, 103, 54, 18, 1, '#c03020'); R(ctx, 135, 54, 18, 1, '#c03020'); R(ctx, 103, 57, 18, 1, '#e07060'); R(ctx, 135, 57, 18, 1, '#e07060');
    for (const ex of [103, 135]) { R(ctx, ex + 1, 55, 4, 1, '#e04040'); R(ctx, ex + 13, 56, 4, 1, '#e04040'); R(ctx, ex + 3, 56, 2, 1, '#e04040'); }
    R(ctx, 113, 55, 3, 2, C.ink); R(ctx, 140, 55, 3, 2, C.ink);
  } else if (mood === 'confused') {
    // The left one wide, the pupil off up and out; the right one squinting, the pupil off down and in
    R(ctx, 102, 48, 18, 11, C.white); R(ctx, 102, 48, 18, 1, '#d4ccc4');
    R(ctx, 103, 49 + (t % 40 < 20 ? 0 : 1), 4, 4, C.ink);
    R(ctx, 137, 55, 16, 3, C.white); R(ctx, 137, 55, 16, 1, '#d4ccc4');
    R(ctx, 140, 56, 4, 2, C.ink);
  } else {
    R(ctx, 102, 54, 18, mood === 'disgust' ? 4 : 7, C.white);
    R(ctx, 136, 54, 18, mood === 'disgust' ? 4 : 7, C.white);
    R(ctx, 110, 54, 6, mood === 'disgust' ? 4 : 7, C.ink);
    R(ctx, 144, 54, 6, mood === 'disgust' ? 4 : 7, C.ink);
  }
  // Nose (the light on its bridge, the nostrils flared)
  R(ctx, 126, 58, 4, 16, C.mSkinShade);
  R(ctx, 124, 58, 2, 12, C.mSkinLight);
  R(ctx, 120, 72, 16, 3, C.mSkinShade);
  R(ctx, 121, 74, 4, 2, '#6a3a18'); R(ctx, 131, 74, 4, 2, '#6a3a18');
  // Mouth
  const open = talking && t % 10 < 5;
  if (mood === 'disgust') {
    // Lip curled, tongue out: "bleh"
    R(ctx, 110, 84, 36, 3, C.darkRed);
    R(ctx, 138, 80, 8, 5, C.darkRed);
    R(ctx, 118, 87, 12, 8, '#e05060');
    R(ctx, 123, 87, 1, 6, '#a02030');
  } else if (mood === 'stoked') {
    // A huge grin, open when he's talking
    R(ctx, 106, 80, 44, open ? 14 : 9, '#500000');
    R(ctx, 108, 80, 40, 4, C.white);
    R(ctx, 102, 78, 4, 4, C.darkRed); R(ctx, 150, 78, 4, 4, C.darkRed);
  } else if (mood === 'think') {
    // Mouth screwed up to one side
    R(ctx, 124, 86, 20, 3, C.darkRed);
    R(ctx, 142, 83, 4, 3, C.darkRed);
  } else if (mood === 'fury') {
    // Lips pulled back off his teeth: gritted, or roaring it, spit flying
    if (open) {
      R(ctx, 108, 78, 40, 16, '#3a0000'); R(ctx, 110, 78, 36, 4, C.white); R(ctx, 112, 90, 32, 3, C.white);
      for (let k = 0; k < 8; k++) R(ctx, 113 + k * 4, 78, 1, 4, '#c8c0b0');
      R(ctx, 118, 84, 20, 4, '#8a1020');
      for (let k = 0; k < 4; k++) { const sx = 150 + ((t * 3 + k * 7) % 22), sy = 82 + Math.sin(k * 2.1 + t) * 6; R(ctx, sx, sy, 2, 1, '#eef4ff'); }
    } else {
      R(ctx, 106, 79, 44, 10, C.darkRed); R(ctx, 108, 80, 40, 8, '#f0ece0');
      R(ctx, 108, 84, 40, 1, '#8a7a68');
      for (let k = 0; k < 10; k++) R(ctx, 111 + k * 4, 80, 1, 8, '#b8ac98');
    }
  } else if (mood === 'confused') {
    // Hanging open, slack, off to one side; the tip of his tongue
    R(ctx, 116, 84, 22, open ? 11 : 8, '#500000');
    R(ctx, 116, 84, 22, 2, C.darkRed); R(ctx, 112, 83, 4, 2, C.darkRed);
    R(ctx, 120, 89 + (open ? 3 : 0), 10, 3, '#e05060');
  } else if (open) {
    R(ctx, 114, 82, 28, 10, '#500000');
    R(ctx, 116, 82, 24, 3, C.white);
  } else {
    R(ctx, 114, 86, 28, 3, C.darkRed);
  }
  // Square jaw line
  R(ctx, 90, 96, 76, 2, C.mSkinShade);
  if (mood === 'fury') furyOver(ctx, t);
  if (mood === 'confused') confusedOver(ctx, t);
  if (jolt) ctx.restore();
  if (where.pose === 'flex') drawDoubleBiceps(ctx, t);
  if (where.pose === 'gun') drawHandgunUp(ctx, t);
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
  // Trump's face, squashed by the fist, hair flying off to the right
  shaded(ctx, 'pn-face', 166, 34, 60, 76, RAMP.tSkin, ball(-0.6, -0.4, 0.15));
  shaded(ctx, 'pn-jowl', 196, 76, 32, 28, RAMP.tSkin, ball(-0.3, -0.6, 0.1));
  R(ctx, 178, 34, 60, 12, C.tHair);
  R(ctx, 210, 26, 40, 10, C.tHair);
  R(ctx, 232, 18, 24, 8, C.tHair);
  R(ctx, 214, 28, 30, 1, C.tHairLight);
  for (const [ex, ey] of [[188, 60], [208, 58]]) {
    for (let i = 0; i < 7; i++) { R(ctx, ex + i, ey + i, 2, 2, C.ink); R(ctx, ex + 6 - i, ey + i, 2, 2, C.ink); }
  }
  ell(ctx, 204, 92, 8, 7, '#500000');
  R(ctx, 212, 88, 3, 4, C.white);
  if (real) {
    // (stubble, the tape's outline gone red raw, his strand of hair whipping off behind, ketchup flying)
    for (let i = 0; i < 90; i++) { const x = 182 + hash(i * 1.9) * 44, y = 80 + hash(i * 2.3) * 26; R(ctx, x, y, 1, 1, i % 3 ? '#9c5a30' : '#c8b8a8'); }
    for (let x = 190; x < 222; x += 2) { R(ctx, x, 82, 1, 1, '#e86a6a'); R(ctx, x + 1, 102, 1, 1, '#e86a6a'); }
    for (let k = 0; k < 40; k++) R(ctx, 220 + k, 40 - Math.round(Math.sin(k * 0.2 + t * 0.6) * 4) - k * 0.4, 1, 2, RAMP.tHair[k % 5 === 0 ? 5 : 3]);
    R(ctx, 226, 112 - (t % 16), 3, 2, '#c81e0c'); R(ctx, 240, 96 - (t % 10), 2, 2, '#c81e0c');
  }
  // A tooth and sweat flying
  R(ctx, 236, 100 - (t % 20), 4, 5, C.white);
  R(ctx, 228, 50 - (t % 12), 3, 3, C.white);
  // The fist, huge, from the left
  shaded(ctx, 'pn-arm', -4, 50, 96, 36, RAMP.mSkin, box(-0.3, -0.8, 0.14, 0.2, 1));
  R(ctx, 76, 46, 18, 44, C.ink); R(ctx, 76, 46, 18, 2, '#2a2a2a');
  shaded(ctx, 'pn-fist', 94, 40, 70, 56, RAMP.mSkin, box(-0.3, -0.75, 0.15, 0.7, 0.8));
  for (let i = 0; i < 4; i++) {
    R(ctx, 150, 42 + i * 13, 14, 12, C.mSkinLight);
    R(ctx, 150, 53 + i * 13, 14, 2, C.mSkinShade);
  }
  R(ctx, 104, 40, 40, 10, C.mSkinShade);
  ctx.restore();
};

/** Trump flying across the press room, until the frame freezes. Returns his x (for tests). */
export const drawFinale = (ctx: Ctx, t: number, freezeAt: number) => {
  const ft = Math.min(t, freezeAt);
  curtain(ctx, 116);
  whSign(ctx, 128, 20);
  hangingFlag(ctx, 50, 38);
  hangingFlag(ctx, 190, 38);
  bands(ctx, 0, 112, ART_W, 32, ['#7c1000', '#6a0c00', '#580800', '#460600', '#340400']);
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
