// The ending cutscene's still images, drawn as NES-style pixel art on a
// 256x144 canvas (scaled up with no smoothing). Each panel is a function of
// its frame counter so it can blink, flash and animate a little, the way NES
// cutscenes do.

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
const curtain = (ctx: Ctx, h: number) => {
  R(ctx, 0, 0, ART_W, h, C.curtain);
  for (let x = 0; x < ART_W; x += 12) {
    R(ctx, x, 0, 3, h, C.curtainDark);
    R(ctx, x + 6, 0, 2, h, C.curtainLight);
  }
};

/** A US flag hanging from a pole. */
const hangingFlag = (ctx: Ctx, x: number, top: number) => {
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
const whSign = (ctx: Ctx, cx: number, cy: number) => {
  ell(ctx, cx, cy, 30, 12, C.gold);
  ell(ctx, cx, cy, 28, 10, C.navyDark);
  // Tiny White House
  R(ctx, cx - 12, cy - 1, 24, 6, C.white);
  R(ctx, cx - 5, cy - 4, 10, 3, C.white);
  R(ctx, cx - 1, cy - 6, 2, 2, C.white);
  for (let i = 0; i < 4; i++) R(ctx, cx - 4 + i * 3, cy - 1, 1, 6, C.lightGray);
};

const podium = (ctx: Ctx, cx: number, top: number, tilt = 0) => {
  R(ctx, cx - 22, top, 44, 5, C.woodLight);
  R(ctx, cx - 20, top + 5, 40, 42, C.wood);
  R(ctx, cx - 20, top + 5, 4, 42, C.woodDark);
  R(ctx, cx + 16, top + 5, 4, 42, C.woodDark);
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
const reporters = (ctx: Ctx, t: number, frenzy: number) => {
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
const trumpSmall = (ctx: Ctx, cx: number, top: number, t: number, talking: boolean) => {
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
};

/** Meathead full-body, standing (feet at baseY). */
const meatheadStanding = (ctx: Ctx, cx: number, baseY: number, withMedal: boolean) => {
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
  R(ctx, cx - 19, baseY - 50, 6, 22, C.mSkinShade);
  R(ctx, cx + 13, baseY - 50, 6, 22, C.mSkin);
  R(ctx, cx - 19, baseY - 32, 6, 3, C.ink);
  R(ctx, cx + 13, baseY - 32, 6, 3, C.ink);
  // Head
  R(ctx, cx - 6, baseY - 62, 12, 12, C.mSkin);
  R(ctx, cx - 7, baseY - 66, 14, 5, C.mHair);
  R(ctx, cx - 4, baseY - 58, 3, 1, C.ink);
  R(ctx, cx + 1, baseY - 58, 3, 1, C.ink);
  R(ctx, cx - 3, baseY - 53, 6, 1, C.darkRed);
  if (withMedal) {
    R(ctx, cx - 5, baseY - 50, 2, 6, C.blue);
    R(ctx, cx + 3, baseY - 50, 2, 6, C.blue);
    R(ctx, cx - 3, baseY - 45, 6, 2, C.blue);
    ell(ctx, cx, baseY - 41, 3, 3, C.gold);
  }
};

/** Meathead mid-follow-through after the punch, facing right. */
const meatheadPunched = (ctx: Ctx, cx: number, baseY: number) => {
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
const trumpFlying = (ctx: Ctx, cx: number, cy: number, t: number) => {
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
  for (let y = 0; y < 110; y += 2) R(ctx, 0, y, ART_W, 2, y < 50 ? C.night : (y / 2) % 2 === 0 ? C.night : C.night2);
  for (let i = 0; i < 40; i++) {
    if (Math.floor(t / 20 + i) % 7 === 0) continue;
    R(ctx, hash(i) * ART_W, hash(i + 40) * 50, 1, 1, C.white);
  }
  ell(ctx, 222, 20, 9, 9, C.moon);
  ell(ctx, 226, 18, 8, 8, C.night);
  // Lawn and fence
  R(ctx, 0, 108, ART_W, 36, C.darkGrass);
  for (let y = 112; y < ART_H; y += 6) R(ctx, 0, y, ART_W, 2, C.grass);
  // Wings
  R(ctx, 36, 62, 184, 46, C.white);
  R(ctx, 36, 100, 184, 8, C.lightGray);
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
  R(ctx, 0, 112, ART_W, 32, C.darkRed);
  trumpSmall(ctx, 128, 46, t, talking);
  podium(ctx, 128, 72);
  meatheadStanding(ctx, 172, 118, false);
  reporters(ctx, t, 0);
};

/** Trump's face, filling the frame. */
export const drawTrumpCloseUp = (ctx: Ctx, t: number, talking: boolean, mood: 'proud' | 'huh') => {
  curtain(ctx, ART_H);
  // Suit, shirt and the long red tie
  R(ctx, 30, 118, 196, 26, C.navy);
  R(ctx, 30, 118, 12, 26, C.navyDark);
  R(ctx, 214, 118, 12, 26, C.navyDark);
  for (let i = 0; i < 16; i++) R(ctx, 106 + i, 112 + i, 44 - i * 2, 1, C.white);
  R(ctx, 120, 114, 16, 8, C.red);
  R(ctx, 122, 122, 12, 22, C.red);
  R(ctx, 127, 122, 2, 22, C.darkRed);
  // Neck and jowls
  R(ctx, 102, 96, 52, 22, C.tSkinShade);
  // Face
  ell(ctx, 128, 76, 38, 42, C.tSkin);
  ell(ctx, 128, 102, 32, 14, C.tSkin);
  R(ctx, 92, 90, 4, 18, C.tSkinShade);
  R(ctx, 160, 90, 4, 18, C.tSkinShade);
  // Ears
  ell(ctx, 89, 74, 4, 9, C.tSkinShade);
  ell(ctx, 167, 74, 4, 9, C.tSkinShade);
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
  // The hair: a huge swept swoop
  ell(ctx, 128, 42, 44, 16, C.tHair);
  ell(ctx, 136, 38, 40, 12, C.tHair);
  R(ctx, 88, 40, 8, 26, C.tHair);
  R(ctx, 160, 40, 10, 22, C.tHair);
  ell(ctx, 164, 50, 10, 8, C.tHair);
  for (let i = 0; i < 6; i++) R(ctx, 100 + i * 12, 34 + (i % 2) * 2, 10, 1, C.tHairLight);
  R(ctx, 96, 52, 70, 2, C.tHairShade);
  R(ctx, 150, 54, 16, 2, C.tHairShade);
};

/** Medium two-shot: Trump hanging the medal round Meathead's neck. */
export const drawMedal = (ctx: Ctx, t: number, talking: boolean) => {
  curtain(ctx, ART_H);
  hangingFlag(ctx, 122, 20);
  // Trump (left), side-on, big belly, arms out with the ribbon
  R(ctx, 34, 70, 58, 74, C.navy);
  ell(ctx, 76, 116, 26, 26, C.navy);
  R(ctx, 34, 70, 10, 74, C.navyDark);
  R(ctx, 74, 70, 12, 14, C.white);
  R(ctx, 78, 76, 5, 56, C.red);
  R(ctx, 76, 80, 32, 9, C.navyDark);
  R(ctx, 108, 78, 8, 9, C.tSkin);
  ell(ctx, 66, 50, 18, 20, C.tSkin);
  ell(ctx, 58, 64, 14, 8, C.tSkin);
  ell(ctx, 76, 46, 7, 3, C.tSkinPale);
  R(ctx, 74, 45, 5, 2, C.ink);
  R(ctx, 80, 52, 4, 7, C.tSkinShade);
  const open = talking && t % 10 < 5;
  R(ctx, 74, 61, 8, open ? 4 : 2, '#801010');
  ell(ctx, 64, 32, 20, 8, C.tHair);
  R(ctx, 64, 27, 26, 7, C.tHair);
  ell(ctx, 88, 34, 5, 5, C.tHair);
  R(ctx, 46, 32, 6, 20, C.tHair);
  R(ctx, 68, 28, 18, 1, C.tHairLight);
  // Meathead (right), a wall of muscle, leaning in for the medal
  R(ctx, 150, 88, 90, 56, C.mSkin);
  ell(ctx, 152, 100, 16, 18, C.mSkin);
  ell(ctx, 238, 100, 16, 18, C.mSkinShade);
  R(ctx, 166, 110, 58, 1, C.mSkinShade);
  R(ctx, 194, 110, 1, 34, C.mSkinShade);
  R(ctx, 178, 94, 12, 3, C.mSkinLight);
  R(ctx, 200, 94, 12, 3, C.mSkinLight);
  R(ctx, 178, 70, 32, 20, C.mSkin);
  R(ctx, 172, 30, 44, 42, C.mSkin);
  R(ctx, 208, 30, 8, 42, C.mSkinShade);
  R(ctx, 170, 20, 48, 14, C.mHair);
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
  ell(ctx, 192, 104, 7, 7, C.gold);
  R(ctx, 190, 101, 4, 6, C.goldLight);
  if (t % 30 < 6) R(ctx, 196, 99, 2, 2, C.white);
};

/** Ninja Gaiden-style eyes shot: Meathead looks Trump up and down. */
export const drawMeatheadEyes = (ctx: Ctx, t: number) => {
  R(ctx, 0, 0, ART_W, ART_H, C.black);
  R(ctx, 0, 36, ART_W, 72, C.mSkin);
  R(ctx, 0, 36, ART_W, 6, C.mHair);
  // Heavy brows lowering as he takes it in
  const lower = Math.min(4, Math.floor(t / 20));
  R(ctx, 30, 50 + lower, 76, 10, C.mHair);
  R(ctx, 150, 50 + lower, 76, 10, C.mHair);
  R(ctx, 120, 44, 16, 3, C.vein);
  R(ctx, 126, 47, 3, 8, C.vein);
  // Eyes: pupils drift down (to the belly) and back up
  const look = t < 30 ? 0 : t < 90 ? Math.min(10, (t - 30) / 3) : Math.max(0, 10 - (t - 90) / 3);
  for (const ex of [40, 160]) {
    R(ctx, ex, 66, 56, 22, C.white);
    R(ctx, ex, 64, 56, 3, C.mSkinShade);
    R(ctx, ex + 20, 68 + Math.round(look), 16, 14 - Math.round(look * 0.6), '#1e40af');
    R(ctx, ex + 24, 71 + Math.round(look), 8, 8 - Math.round(look * 0.5), C.ink);
    R(ctx, ex + 22, 69 + Math.round(look), 3, 3, C.white);
    R(ctx, ex, 88, 56, 3, C.mSkinShade);
  }
  R(ctx, 122, 88, 12, 20, C.mSkinShade);
};

/** What Meathead sees: a suit straining over a presidential gut. */
export const drawBelly = (ctx: Ctx, t: number) => {
  curtain(ctx, ART_H);
  // Trousers and belt, mostly hidden under the overhang
  R(ctx, 74, 128, 108, 16, '#2c2c3c');
  R(ctx, 74, 126, 108, 4, C.ink);
  // Jacket over the chest, then the gut bulging out below it
  R(ctx, 66, 0, 124, 80, C.navy);
  ell(ctx, 128, 90, 96, 40, C.navy);
  ell(ctx, 128, 96, 90, 32, C.navy);
  ell(ctx, 150, 84, 42, 20, '#2c2c7c');
  R(ctx, 66, 0, 10, 80, C.navyDark);
  R(ctx, 180, 0, 10, 80, C.navyDark);
  for (let i = 0; i < 12; i++) R(ctx, 40 + i * 2, 100 + i * 2, 4, 2, C.navyDark);
  for (let i = 0; i < 12; i++) R(ctx, 212 - i * 2, 100 + i * 2, 4, 2, C.navyDark);
  // Shirt gap and the too-long tie, down past his belt
  for (let i = 0; i < 40; i++) R(ctx, 128 - (40 - i) / 2 - 8, i, 40 - i + 16, 1, C.white);
  R(ctx, 120, 0, 16, 6, C.red);
  R(ctx, 122, 6, 12, 128, C.red);
  R(ctx, 127, 6, 2, 128, C.darkRed);
  ell(ctx, 128, 134, 6, 4, C.red);
  // Buttons hanging on for dear life
  const strain = t % 16 < 8 ? 0 : 1;
  for (const by of [70, 100]) {
    R(ctx, 104 - strain, by - 1, 48 + strain * 2, 1, C.navyDark);
    ell(ctx, 114, by, 3, 3, C.gold);
  }
  // Strain lines
  for (let i = 0; i < 4; i++) R(ctx, 76 + i * 4, 90 + i * 6, 14, 1, C.navyDark);
  for (let i = 0; i < 4; i++) R(ctx, 160 - i * 4, 90 + i * 6, 14, 1, C.navyDark);
};

/** Meathead's face, filling the frame (medal round his neck). */
/**
 * Meathead up close. Moods: dumb, disgust; think (eyes rolled up and off to the side, mouth screwed up), stoked (eyes
 * wide, sparkling, a huge grin). Where he is (the press room's curtain by default) and whether he's got the medal on.
 */
export const drawMeatheadCloseUp = (ctx: Ctx, t: number, talking: boolean, mood: 'dumb' | 'disgust' | 'think' | 'stoked', where: { bg?: (ctx: Ctx) => void; medal?: boolean } = {}) => {
  if (where.bg) where.bg(ctx); else curtain(ctx, ART_H);
  // Traps and shoulders
  ell(ctx, 128, 150, 130, 34, C.mSkin);
  ell(ctx, 60, 140, 40, 22, C.mSkinShade);
  R(ctx, 96, 96, 64, 30, C.mSkin);
  // Medal ribbon and medal
  if (where.medal !== false) {
    R(ctx, 96, 112, 8, 24, C.blue);
    R(ctx, 152, 112, 8, 24, C.blue);
    R(ctx, 100, 132, 56, 5, C.blue);
    ell(ctx, 128, 141, 8, 8, C.gold);
    R(ctx, 126, 136, 4, 8, C.goldLight);
  }
  // Square head
  R(ctx, 90, 22, 76, 84, C.mSkin);
  R(ctx, 152, 22, 14, 84, C.mSkinShade);
  R(ctx, 94, 100, 68, 6, C.mSkinShade);
  R(ctx, 126, 98, 4, 6, C.mSkinShade);
  // Flat-top
  R(ctx, 86, 6, 84, 22, C.mHair);
  R(ctx, 86, 28, 6, 18, C.mHair);
  R(ctx, 164, 28, 6, 18, C.mHair);
  // Ears
  R(ctx, 82, 48, 8, 18, C.mSkinShade);
  R(ctx, 166, 48, 8, 18, C.mSkinShade);
  // Vein
  R(ctx, 104, 32, 3, 8, C.vein);
  R(ctx, 106, 38, 5, 3, C.vein);
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
  } else {
    R(ctx, 102, 54, 18, mood === 'disgust' ? 4 : 7, C.white);
    R(ctx, 136, 54, 18, mood === 'disgust' ? 4 : 7, C.white);
    R(ctx, 110, 54, 6, mood === 'disgust' ? 4 : 7, C.ink);
    R(ctx, 144, 54, 6, mood === 'disgust' ? 4 : 7, C.ink);
  }
  // Nose
  R(ctx, 126, 58, 4, 16, C.mSkinShade);
  R(ctx, 120, 72, 16, 3, C.mSkinShade);
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
  } else if (open) {
    R(ctx, 114, 82, 28, 10, '#500000');
    R(ctx, 116, 82, 24, 3, C.white);
  } else {
    R(ctx, 114, 86, 28, 3, C.darkRed);
  }
  // Square jaw line
  R(ctx, 90, 96, 76, 2, C.mSkinShade);
};

/** The punch lands: fist into face against a burst of speed rays. */
export const drawPunch = (ctx: Ctx, t: number) => {
  const shake = t < 20 ? (t % 4 < 2 ? 3 : -3) : 0;
  ctx.save();
  ctx.translate(shake, 0);
  // Radial burst
  const ix = 164, iy = 70;
  R(ctx, -4, 0, ART_W + 8, ART_H, t % 4 < 2 ? C.white : '#fce0a8');
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    ctx.fillStyle = i % 2 === 0 ? C.red : C.gold;
    ctx.beginPath();
    ctx.moveTo(ix, iy);
    ctx.lineTo(ix + Math.cos(a) * 300, iy + Math.sin(a) * 300);
    ctx.lineTo(ix + Math.cos(a + 0.13) * 300, iy + Math.sin(a + 0.13) * 300);
    ctx.fill();
  }
  // Trump's face, squashed by the fist, hair flying off to the right
  ell(ctx, 196, 72, 30, 38, C.tSkin);
  ell(ctx, 212, 90, 16, 14, C.tSkinShade);
  R(ctx, 178, 34, 60, 12, C.tHair);
  R(ctx, 210, 26, 40, 10, C.tHair);
  R(ctx, 232, 18, 24, 8, C.tHair);
  R(ctx, 214, 28, 30, 1, C.tHairLight);
  for (const [ex, ey] of [[188, 60], [208, 58]]) {
    for (let i = 0; i < 7; i++) { R(ctx, ex + i, ey + i, 2, 2, C.ink); R(ctx, ex + 6 - i, ey + i, 2, 2, C.ink); }
  }
  ell(ctx, 204, 92, 8, 7, '#500000');
  R(ctx, 212, 88, 3, 4, C.white);
  // A tooth and sweat flying
  R(ctx, 236, 100 - (t % 20), 4, 5, C.white);
  R(ctx, 228, 50 - (t % 12), 3, 3, C.white);
  // The fist, huge, from the left
  R(ctx, -4, 50, 96, 36, C.mSkin);
  R(ctx, -4, 80, 96, 6, C.mSkinShade);
  R(ctx, 76, 46, 18, 44, C.ink);
  R(ctx, 94, 40, 70, 56, C.mSkin);
  R(ctx, 94, 88, 70, 8, C.mSkinShade);
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
  R(ctx, 0, 112, ART_W, 32, C.darkRed);
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
