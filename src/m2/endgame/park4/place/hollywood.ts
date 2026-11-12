// STUNTMAN STEVE's place in hell (ENVY): THE COLOSSEUM OF THE DAMNED. He does his mediocre stunt show nightly for demons
// who never look up; over the stage his own screen plays A BETTER STUNTMAN's highlights, and that's what they watch.
// Sulfur yellow and envy green over black stone, by torchlight. All of it painted once (kitPA's bake, the stage's own
// painted set); live: the torches' flames, the screen's reel, the motes.
//
//   - the sky (screen space, the land's far off hidden): black down to a sulfur glow at the horizon, smoke banks, a
//     green-eyed moon looking the other way; three far layers slid by the camera (needle crags, the coliseum's far side
//     in three tiers of lit arches, pylons with fire bowls and envy's banners), each hazed at its foot;
//   - the wall along the stage's back in place of the street set (hollywood/stunt/art.ts STUNT_HOOKS.set): a podium of
//     black ashlar (the posse's four gates cut in it, DAMNED CREW ONLY on their lintels), an arcade of arches over it
//     with the sky through them and bored demons in the boxes, every one turned to the screen; broken open in the
//     middle (a gold statue of A BETTER STUNTMAN on the podium there, NIGHTS WITHOUT APPLAUSE counted under it) and
//     falling down at the right end; FREE NACHOS hung on chains, PLEASE WATCH THE SCREEN (NOT HIM) under the screen;
//   - the stands in black stone, bone seats and green, the marquee reworded, OPENING ACT taped over his banner.

import type { GameState } from '../../../../m1/game/core/state';
import type { HellPlace } from '../defs';
import { GY, CAM_ROW, ARENA_L, FLOOR_BACK_Y } from '../../../hollywood/stunt/arena';
import { elbowFront, kneeFront } from '../../../art/limb';
import { pixelBlob } from '../../../../m1/game/render/pixelArt';
import {
  type Ctx, type Look, W, H, INK, h01, box, poly, line, mix, ramp, bake, strip, wrap3, ashlar, crack, streak, chainV, skull, bone, bowl, flame, motes, sign,
  bandedGradient, hazeBands, steppedGlow, checker, signText, IRONK, BONE, seen,
} from './kitPA';

const STONE = ['#080A07', '#11140F', '#1B1F17', '#272C20', '#363C2B', '#4A5139'];
const STONE2 = ['#0E100C', '#191D15', '#252A1F', '#343A2A', '#454C37', '#5C6448'];
const SULF = ['#3A3204', '#6A5C08', '#9C8A10', '#CDB81C', '#E8D84A', '#FAF29A'];
const ENVY = ['#06200E', '#0C3A18', '#146026', '#229040', '#4CC466', '#9AF0A8'];
const GOLD = ['#3A2A06', '#6A4E0C', '#9A7614', '#C8A024', '#E8C84E', '#FFF0A0'];
const FLAME = ['#FAF29A', '#E8D84A', '#9CCB2A', '#3E7A22'];

// ---------------------------------------------------------------------------------------------------------------
// The sky and the far layers (screen space)

const paintSky = (g: Ctx) => {
  bandedGradient(g, 0, 0, W, 300, ['#040503', '#070A05', '#0E1408', '#18220C', '#2C380E', '#4E580E', '#7E7810', '#AC9C1A', '#C8B62C'], 15);
  box(g, 0, 300, W, H - 300, '#0A0C07');
  // (the moon: a sick green eye, turned away to the right, where the screen is)
  const mx = 236, my = 64;
  steppedGlow(g, mx, my, 96, '#9CCB2A', 0.14, 0, 6);
  g.save(); g.beginPath(); g.ellipse(mx, my, 40, 22, 0, 0, Math.PI * 2); g.clip();
  box(g, mx - 40, my - 22, 80, 44, '#9AA24A'); box(g, mx - 40, my - 22, 80, 12, '#B8C060'); checker(g, mx - 40, my - 10, 80, 2, '#B8C060', 0, 2); box(g, mx - 40, my + 10, 80, 12, '#6E7830'); checker(g, mx - 40, my + 8, 80, 2, '#6E7830', 1, 2);
  for (let k = 0; k < 7; k++) line(g, [[mx - 38 + k * 9, my - 4 + (k % 3) * 5], [mx - 20 + k * 6, my + (k % 2) * 3]], '#7A2A1A', 1);
  g.fillStyle = INK; g.beginPath(); g.arc(mx + 17, my + 2, 16, 0, Math.PI * 2); g.fill();
  g.fillStyle = ENVY[2]; g.beginPath(); g.arc(mx + 17, my + 2, 14, 0, Math.PI * 2); g.fill();
  g.fillStyle = ENVY[3]; g.beginPath(); g.arc(mx + 15, my, 10, 0, Math.PI * 2); g.fill();
  g.fillStyle = ENVY[4]; g.beginPath(); g.arc(mx + 13, my - 3, 5, 0, Math.PI * 2); g.fill();
  box(g, mx + 19, my - 12, 4, 28, INK); box(g, mx + 12, my - 7, 3, 3, ENVY[5]);
  g.restore();
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.ellipse(mx, my, 40, 22, 0, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = '#1E260E'; g.lineWidth = 2; g.beginPath(); g.ellipse(mx, my - 3, 46, 26, 0, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
  // (smoke banks: black, sulfur under their bellies; thicker up top)
  for (let k = 0; k < 26; k++) {
    const x = h01(k * 3.7) * (W + 200) - 100, y = 14 + h01(k * 1.9) * 170, rw = 60 + h01(k * 5.3) * 110, rh = 6 + h01(k * 2.3) * 10;
    if (Math.abs(x - mx) < 90 && Math.abs(y - my) < 40) continue;
    pixelBlob(g, x, y + 3, rw, rh, y > 120 ? '#5A620E' : '#1A220C');
    pixelBlob(g, x + 6, y, rw * 0.94, rh * 0.8, y > 120 ? '#1A200C' : '#080B06');
  }
};

/** The far crags: needles of black rock, a natural arch or two, hazed at their feet. */
const CR_W = 1200, CR_H = 210;
const paintCrags = (g: Ctx) => {
  for (let k = 0; k < 17; k++) {
    const x = k * 71 + h01(k * 2.9) * 40, h = 50 + h01(k * 4.1) * 140, w = 16 + h01(k * 1.3) * 34;
    wrap3(CR_W, dx => {
      poly(g, [[x + dx - w / 2, CR_H], [x + dx - w * 0.14, CR_H - h], [x + dx + w * 0.1, CR_H - h + 7], [x + dx + w * 0.22, CR_H - h * 0.55], [x + dx + w / 2, CR_H]], '#0C1009');
      poly(g, [[x + dx - w / 2, CR_H], [x + dx - w * 0.14, CR_H - h], [x + dx - w * 0.05, CR_H - h * 0.5], [x + dx - w * 0.2, CR_H]], '#182010');
      for (let j = 0; j < 4; j++) box(g, x + dx - w * 0.1 + j * 2, CR_H - h * (0.3 + j * 0.14), 2, 6, '#232C14');
    });
  }
  for (const [ax, r] of [[310, 46], [860, 60]] as const) {
    g.strokeStyle = '#0C1009'; g.lineWidth = 12; g.beginPath(); g.arc(ax, CR_H - 30, r, Math.PI, 0); g.stroke();
    g.strokeStyle = '#182010'; g.lineWidth = 2; g.beginPath(); g.arc(ax, CR_H - 30, r + 5, Math.PI * 1.05, Math.PI * 1.5); g.stroke();
  }
  hazeBands(g, 0, CR_H - 90, CR_W, 90, '#8C8212', 0, 0.6, 6);
};

/** The coliseum's far side: three tiers of arches, lit sulfur from inside, its rim bitten out here and there. */
const RG_W = 1400, RG_H = 190;
const paintRing = (g: Ctx) => {
  const C = ['#0E120A', '#161C0E', '#202812', '#2C3618'];
  box(g, 0, 28, RG_W, RG_H - 28, C[1]);
  for (let t = 0; t < 3; t++) {
    const y = 28 + t * 54;
    box(g, 0, y, RG_W, 3, C[3]); box(g, 0, y + 3, RG_W, 2, C[0]); checker(g, 0, y + 5, RG_W, 2, C[0], 0, 1);
    for (let k = 0, x = 6; x < RG_W - 16; x += 28, k++) {
      const r = h01(k * 1.7 + t * 9.1), col = r < 0.24 ? C[0] : r > 0.9 ? '#C8B62C' : r > 0.5 ? '#7E7810' : '#4E580E';
      box(g, x, y + 16, 16, 30, col); box(g, x + 2, y + 13, 12, 3, col); box(g, x + 4, y + 11, 8, 2, col);
      if (r >= 0.24) { box(g, x, y + 40, 16, 6, mix(col, C[0], 0.5)); if (r > 0.6) box(g, x + 4 + (k % 3) * 3, y + 35, 3, 5, '#1A0E08'); }
      box(g, x + 20, y + 8, 4, 46, C[2]); box(g, x + 20, y + 8, 1, 46, C[3]);
    }
  }
  // (towers up through it, a step taller)
  for (const tx of [120, 520, 880, 1250]) { box(g, tx - 20, 8, 40, RG_H - 8, C[0]); box(g, tx - 18, 10, 36, RG_H - 10, C[1]); box(g, tx - 18, 10, 4, RG_H - 10, C[3]); box(g, tx + 10, 10, 8, RG_H - 10, C[0]); for (let y = 24; y < RG_H; y += 30) box(g, tx - 4, y, 8, 12, '#7E7810'); box(g, tx - 22, 6, 44, 4, C[3]); }
  // (the rim bitten out)
  g.save(); g.globalCompositeOperation = 'destination-out';
  for (const [bx, bw, bd] of [[250, 120, 58], [700, 90, 40], [1040, 150, 70]] as const) poly(g, [[bx, 0], [bx + 8, 28 + bd * 0.4], [bx + bw * 0.3, 28 + bd * 0.5], [bx + bw * 0.45, 28 + bd], [bx + bw * 0.7, 28 + bd * 0.7], [bx + bw * 0.8, 28 + bd * 0.25], [bx + bw, 28 + bd * 0.3], [bx + bw + 6, 0]], '#000');
  g.restore();
  hazeBands(g, 0, RG_H - 70, RG_W, 70, '#6A6C10', 0, 0.55, 5);
};

/** The pylons outside: obelisks with a fire bowl on top, envy's banners off their arms, a cage, chains. */
const PY_W = 1600, PY_H = 320;
const paintPylons = (g: Ctx) => {
  const P: [number, number, number][] = [[150, 236, 0], [560, 210, 1], [1010, 250, 2], [1380, 216, 3]];
  for (const [x, h, kind] of P) {
    const top = PY_H - h;
    steppedGlow(g, x, top - 12, 60, '#C8D23A', 0.2, 0, 5);
    poly(g, [[x - 20, PY_H], [x - 12, top], [x + 12, top], [x + 20, PY_H]], INK);
    poly(g, [[x - 18, PY_H], [x - 10, top + 2], [x + 10, top + 2], [x + 18, PY_H]], STONE[1]);
    poly(g, [[x - 18, PY_H], [x - 10, top + 2], [x - 5, top + 2], [x - 11, PY_H]], STONE[3]);
    poly(g, [[x + 9, PY_H], [x + 5, top + 2], [x + 10, top + 2], [x + 18, PY_H]], STONE[0]);
    for (let y = top + 26; y < PY_H; y += 34) { box(g, x - 16, y, 32, 2, STONE[0]); box(g, x - 15, y + 2, 8, 1, STONE[4]); }
    box(g, x - 16, top - 4, 32, 6, INK); box(g, x - 15, top - 3, 30, 4, STONE[2]); box(g, x - 15, top - 3, 30, 1, STONE[4]);
    bowl(g, x, top - 12, 4);
    // (its flame, still: far off)
    box(g, x - 7, top - 22, 14, 10, FLAME[3]); box(g, x - 5, top - 28, 9, 12, FLAME[2]); box(g, x - 3, top - 32, 5, 14, FLAME[1]); box(g, x - 1, top - 22, 3, 8, FLAME[0]); box(g, x + 2, top - 37, 2, 5, FLAME[2]);
    // (the arm, and what's off it)
    const ay = top + 54, s = kind % 2 ? -1 : 1;
    box(g, Math.min(x, x + s * 56), ay, 56, 5, INK); box(g, Math.min(x, x + s * 56), ay + 1, 56, 2, IRONK[4]);
    if (kind === 1) {
      // (a cage, somebody's bones in it)
      const cx = x + s * 44; chainV(g, cx, ay + 5, ay + 30, IRONK);
      box(g, cx - 13, ay + 30, 26, 44, INK); box(g, cx - 11, ay + 32, 22, 40, '#14180E');
      skull(g, cx, ay + 56, 0.8); box(g, cx - 4, ay + 57, 8, 10, BONE[2]); for (let k = 0; k < 3; k++) box(g, cx - 4, ay + 58 + k * 3, 8, 1, INK);
      for (let k = -10; k <= 10; k += 5) box(g, cx + k, ay + 32, 1, 40, IRONK[5]);
      box(g, cx - 13, ay + 30, 26, 2, IRONK[4]); box(g, cx - 13, ay + 72, 26, 2, IRONK[3]);
    } else {
      // (a banner: green, its folds, an eye on it in sulfur, swallow-tailed)
      const bx = x + s * 34 - 20, bh = kind === 2 ? 130 : 100, by = ay + 5;
      poly(g, [[bx - 1, by], [bx + 41, by], [bx + 41, by + bh + 1], [bx + 20, by + bh - 13], [bx - 1, by + bh + 1]], INK);
      poly(g, [[bx, by], [bx + 40, by], [bx + 40, by + bh], [bx + 20, by + bh - 14], [bx, by + bh]], ENVY[2]);
      box(g, bx, by, 6, bh - 6, ENVY[3]); box(g, bx + 14, by, 5, bh - 14, ENVY[1]); checker(g, bx + 19, by, 3, bh - 14, ENVY[1], 0, 1); box(g, bx + 30, by, 6, bh - 8, ENVY[1]); box(g, bx, by, 40, 3, ENVY[4]);
      g.fillStyle = SULF[3]; g.beginPath(); g.ellipse(bx + 20, by + 40, 13, 7, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = INK; g.beginPath(); g.arc(bx + 20, by + 40, 5, 0, Math.PI * 2); g.fill(); box(g, bx + 19, by + 36, 2, 8, SULF[5]);
      for (let k = 0; k < 3; k++) box(g, bx + 8 + k * 10, by + 60 + k * 4, 4, 14, ENVY[0]);
    }
    if (kind === 3) { chainV(g, x - 30, PY_H - 150, PY_H - 60, IRONK); chainV(g, x + 34, PY_H - 120, PY_H - 20, IRONK); }
  }
  hazeBands(g, 0, PY_H - 60, PY_W, 60, '#4E580E', 0, 0.5, 4);
};

const CAM_REST = GY - CAM_ROW;
const skyLive = (c: Ctx, state: GameState) => {
  if (typeof document === 'undefined') return;
  const cam = state.camera.x - ARENA_L, up = CAM_REST - state.camera.y, f = state.frame;
  const g1 = 218 + Math.round(up * 0.012), g2 = 232 + Math.round(up * 0.04), g3 = 262 + Math.round(up * 0.1);
  strip(c, bake('pa-hw-crags', CR_W, CR_H, paintCrags), cam * 0.012 + 200, g1 - CR_H);
  if (g1 < H) { c.fillStyle = '#5E600E'; c.fillRect(0, g1, W, H - g1); }
  strip(c, bake('pa-hw-ring', RG_W, RG_H, paintRing), cam * 0.04 + 480, g2 - RG_H);
  if (g2 < H) { c.fillStyle = '#34380C'; c.fillRect(0, g2, W, H - g2); }
  strip(c, bake('pa-hw-pylons', PY_W, PY_H, paintPylons), cam * 0.1 + 900, g3 - PY_H);
  if (g3 < H) { c.fillStyle = '#12160A'; c.fillRect(0, g3, W, H - g3); }
  motes(c, f, 14, [SULF[4], '#9CCB2A', SULF[5], ENVY[4]]);
};

export const hollywoodPlace: HellPlace = {
  light: { dark: 0.3, shade: [10, 18, 6], grade: '#F0EAB6' },
  sky: { paint: paintSky, alpha: 1 },
  skyLive,
};

// ---------------------------------------------------------------------------------------------------------------
// The wall along the stage's back (the stage's own painted set, hooked: STUNT_HOOKS.set)

export const COL_H = 340;
const POD = 196, PITCH = 104, AR = 38, SPRING = 272, ATTIC = 328;
const archX = (i: number) => 64 + i * PITCH;
/** The arches broken away (the gap in the middle, the right end coming down). */
const GONE = new Set([8, 9, 10, 18]);
/** Where the screen hangs (the set's x): what every demon up there's watching. */
const SCREEN_X = 1480;
/** The torches on the podium (the set's x, how far up off its foot): their flames are live. */
const TORCH: [number, number][] = [[112, 128], [428, 128], [642, 128], [958, 128], [1122, 128], [1438, 128], [1652, 128], [1968, 128], [846, 232], [1150, 232]];

/** A BETTER STUNTMAN, in gold (front on, his feet at 0, 0; about 100 tall): a trophy up in one hand, the other fist on
 *  his hip, a cape, a quiff, a grin. Elbows and knees: art/limb.ts's front-on ones. */
export const paintBetter = (g: Ctx) => {
  const G = GOLD;
  const limb = (pts: [number, number][], w: number, col: string) => { g.lineCap = 'round'; g.lineJoin = 'round'; line(g, pts, INK, w + 2); line(g, pts, col, w); };
  // (the cape behind him)
  poly(g, [[-19, -80], [19, -80], [30, -8], [16, -14], [0, -6], [-16, -14], [-30, -8]], INK);
  poly(g, [[-17, -78], [17, -78], [27, -11], [16, -16], [0, -9], [-16, -16], [-27, -11]], G[1]);
  for (const x of [-18, -6, 8, 18]) box(g, x, -70, 3, 54, G[0]);
  box(g, -24, -40, 3, 26, G[2]);
  // (the legs, apart)
  for (const s of [-1, 1]) {
    const hip: [number, number] = [s * 7, -46], foot: [number, number] = [s * 14, -3];
    const kn = kneeFront(hip[0], hip[1], foot[0], foot[1], 22, 23, s);
    limb([hip, kn, foot], 9, s < 0 ? G[3] : G[2]);
    line(g, [[hip[0] - 2, hip[1] + 2], [kn[0] - 2, kn[1]]], s < 0 ? G[4] : G[3], 2);
    box(g, foot[0] - 7, -5, 14, 6, INK); box(g, foot[0] - 6, -4, 12, 4, G[2]); box(g, foot[0] - 6, -4, 12, 1, G[4]);
  }
  // (the far arm: his fist on his hip, the elbow out)
  const sl: [number, number] = [-16, -77], hl: [number, number] = [-11, -49];
  limb([sl, elbowFront(sl[0], sl[1], hl[0], hl[1], 17, 16, -1), hl], 7, G[3]);
  // (the body: a chest like a barrel, banded, a star on it, his belt)
  poly(g, [[-19, -82], [19, -82], [12, -44], [-12, -44]], INK);
  poly(g, [[-17, -80], [17, -80], [10, -46], [-10, -46]], G[3]);
  poly(g, [[-17, -80], [-6, -80], [-5, -46], [-10, -46]], G[4]);
  poly(g, [[8, -80], [17, -80], [10, -46], [5, -46]], G[2]);
  checker(g, -4, -62, 12, 2, G[2], 0, 1); box(g, -12, -68, 9, 2, G[5]);
  poly(g, [[0, -74], [2, -68], [8, -68], [3, -64], [5, -58], [0, -62], [-5, -58], [-3, -64], [-8, -68], [-2, -68]], G[5]);
  box(g, -11, -49, 22, 5, INK); box(g, -10, -48, 20, 3, G[1]); box(g, -3, -49, 6, 5, G[5]);
  // (the head: the jaw, the quiff, the grin)
  box(g, -5, -86, 10, 6, INK); box(g, -4, -86, 8, 5, G[2]);
  box(g, -10, -104, 20, 20, INK); box(g, -9, -103, 18, 18, G[3]); box(g, -9, -103, 5, 18, G[4]); box(g, 5, -101, 4, 16, G[2]);
  poly(g, [[-11, -101], [-8, -112], [4, -114], [13, -108], [10, -100]], INK); poly(g, [[-9, -102], [-7, -110], [4, -112], [10, -107], [8, -102]], G[4]); box(g, -5, -110, 8, 2, G[5]);
  box(g, -6, -97, 4, 2, INK); box(g, 2, -97, 4, 2, INK); box(g, -5, -91, 10, 3, INK); box(g, -4, -91, 8, 2, G[5]);
  // (the near arm: up, the trophy in his hand)
  const sr: [number, number] = [16, -77], hr: [number, number] = [28, -108];
  limb([sr, elbowFront(sr[0], sr[1], hr[0], hr[1], 18, 18, 1), hr], 7, G[4]);
  box(g, hr[0] - 4, hr[1] - 4, 8, 8, INK); box(g, hr[0] - 3, hr[1] - 3, 6, 6, G[4]);
  box(g, hr[0] - 2, hr[1] - 12, 4, 9, INK); box(g, hr[0] - 1, hr[1] - 12, 2, 9, G[5]);
  box(g, hr[0] - 9, hr[1] - 26, 18, 15, INK); box(g, hr[0] - 8, hr[1] - 25, 16, 12, G[4]); box(g, hr[0] - 8, hr[1] - 25, 4, 12, G[5]); box(g, hr[0] + 4, hr[1] - 25, 4, 12, G[2]); box(g, hr[0] - 5, hr[1] - 13, 10, 2, G[3]);
  for (const s of [-1, 1]) { box(g, hr[0] + s * 11 - 2, hr[1] - 23, 4, 8, INK); box(g, hr[0] + s * 11 - 1, hr[1] - 22, 2, 6, G[3]); }
};

type DemonPaint = (g: Ctx, seed: number) => void;
export const paintColosseum = (g: Ctx, o: { w: number; h: number; bays: number[]; port: number; bay: (g: Ctx, dx: number, B: number, n: number) => void }, demon: DemonPaint) => {
  const B = o.h, w = o.w;
  // The arcade tier over the podium: the wall, the pilasters, the cornice and the merlons along its top
  ashlar(g, 0, B - ATTIC, w, ATTIC - POD, STONE, 18, 38, 3);
  for (let x = 4, k = 0; x < w; x += 28, k++) { box(g, x - 1, B - ATTIC - 12, 18, 13, INK); box(g, x, B - ATTIC - 11, 16, 12, STONE[2]); box(g, x, B - ATTIC - 11, 16, 1, STONE[3]); box(g, x, B - ATTIC - 11, 2, 12, STONE[3]); box(g, x + 12, B - ATTIC - 10, 4, 11, STONE[1]); if (k % 5 === 2) box(g, x + 5, B - ATTIC - 6, 4, 3, STONE[0]); }
  box(g, 0, B - ATTIC - 1, w, 5, INK); box(g, 0, B - ATTIC, w, 3, STONE[3]); box(g, 0, B - ATTIC, w, 1, STONE[4]);
  for (let x = 2; x < w; x += 8) box(g, x, B - ATTIC + 4, 4, 4, STONE[1]);
  box(g, 0, B - ATTIC + 14, w, 2, STONE[0]);
  for (let i = -1; i < 21; i++) {
    const px = archX(i) + PITCH / 2;
    box(g, px - 8, B - SPRING - 40, 16, SPRING - POD + 40, INK); box(g, px - 7, B - SPRING - 40, 14, SPRING - POD + 40, STONE[2]);
    box(g, px - 7, B - SPRING - 40, 3, SPRING - POD + 40, STONE[4]); box(g, px - 4, B - SPRING - 40, 1, SPRING - POD + 40, STONE[3]); box(g, px + 3, B - SPRING - 40, 4, SPRING - POD + 40, STONE[1]);
    box(g, px - 11, B - SPRING - 4, 22, 8, INK); box(g, px - 10, B - SPRING - 3, 20, 6, STONE[3]); box(g, px - 10, B - SPRING - 3, 20, 1, STONE[5]); box(g, px - 10, B - SPRING + 2, 20, 1, STONE[1]);
  }
  // The arches: their rings of voussoirs, a keystone; then cut clean through (the sky's behind them)
  const arches = Array.from({ length: 20 }, (_, i) => i).filter(i => !GONE.has(i));
  for (const i of arches) {
    const ax = archX(i), sy = B - SPRING;
    g.fillStyle = INK; g.beginPath(); g.arc(ax, sy, AR + 9, Math.PI, 0); g.fill(); box(g, ax - AR - 9, sy, AR * 2 + 18, SPRING - POD, INK);
    g.fillStyle = STONE[3]; g.beginPath(); g.arc(ax, sy, AR + 7, Math.PI, 0); g.fill(); box(g, ax - AR - 7, sy, AR * 2 + 14, SPRING - POD, STONE[3]);
    g.strokeStyle = STONE[5]; g.lineWidth = 1; g.beginPath(); g.arc(ax, sy, AR + 6, Math.PI * 1.05, Math.PI * 1.5); g.stroke();
    box(g, ax - AR - 7, sy, 2, SPRING - POD, STONE[4]); box(g, ax + AR + 4, sy, 3, SPRING - POD, STONE[1]);
    for (let k = 1; k < 9; k++) { const a = Math.PI + (k * Math.PI) / 9; line(g, [[ax + Math.cos(a) * AR, sy + Math.sin(a) * AR], [ax + Math.cos(a) * (AR + 7), sy + Math.sin(a) * (AR + 7)]], STONE[0], 1); }
    for (let y = sy + 12; y < B - POD - 4; y += 16) { box(g, ax - AR - 7, y, 7, 1, STONE[0]); box(g, ax + AR, y, 7, 1, STONE[0]); }
    box(g, ax - 7, sy - AR - 13, 14, 16, INK); box(g, ax - 6, sy - AR - 12, 12, 14, STONE[4]); box(g, ax - 6, sy - AR - 12, 12, 1, STONE[5]); box(g, ax + 3, sy - AR - 11, 3, 13, STONE[2]);
  }
  g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000';
  for (const i of arches) { const ax = archX(i), sy = B - SPRING; g.beginPath(); g.arc(ax, sy, AR, Math.PI, 0); g.fill(); g.fillRect(ax - AR, sy, AR * 2, SPRING - POD); }
  // (the gap in the middle, broken away in steps down to the podium; the right end's attic gone)
  const gapL = archX(8) - 46, gapR = archX(10) + 46;
  const cutL: [number, number][] = [[gapL, B - COL_H], [gapL, B - ATTIC + 10], [gapL + 14, B - ATTIC + 10], [gapL + 14, B - ATTIC + 46], [gapL + 4, B - ATTIC + 46], [gapL + 4, B - 262], [gapL + 22, B - 262], [gapL + 22, B - 236], [gapL + 10, B - 236], [gapL + 10, B - 214], [gapL + 30, B - 214], [gapL + 30, B - POD]];
  const cutR: [number, number][] = [[gapR, B - POD], [gapR - 20, B - POD], [gapR - 20, B - 222], [gapR - 6, B - 222], [gapR - 6, B - 250], [gapR - 26, B - 250], [gapR - 26, B - 282], [gapR - 8, B - 282], [gapR - 8, B - ATTIC + 18], [gapR + 8, B - ATTIC + 18], [gapR + 8, B - COL_H]];
  g.beginPath(); [...cutL, ...cutR].forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill();
  const e0 = archX(17) + 30;
  const cutE: [number, number][] = [[e0, B - COL_H], [e0, B - ATTIC + 8], [e0 + 18, B - ATTIC + 8], [e0 + 18, B - ATTIC + 30], [e0 + 40, B - ATTIC + 30], [e0 + 40, B - 276], [e0 + 70, B - 276], [e0 + 70, B - 250], [e0 + 104, B - 250], [e0 + 104, B - 270], [e0 + 150, B - 270], [e0 + 150, B - ATTIC + 24], [e0 + 190, B - ATTIC + 24], [e0 + 190, B - COL_H]];
  g.beginPath(); cutE.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill();
  g.restore();
  // (the breaks' edges inked, a lighter chip along each step's top)
  for (const cut of [cutL, cutR, cutE]) { line(g, cut.slice(1, -1), INK, 3); for (let k = 1; k + 1 < cut.length; k++) if (cut[k][1] === cut[k + 1][1]) box(g, Math.min(cut[k][0], cut[k + 1][0]), cut[k][1] + 1, Math.abs(cut[k + 1][0] - cut[k][0]), 1, STONE[4]); }
  // In the boxes: a demon in most, turned to the screen, behind the balustrade; the screen's own boxes draped in green
  for (const i of arches) {
    const ax = archX(i), dir = ax < SCREEN_X ? 1 : -1, sd = (i * 7 + 3) % 20, vip = i >= 13 && i <= 15;
    if (h01(i * 3.3) > 0.3 || vip) {
      g.save(); g.translate(ax - dir * 8 + (h01(i) - 0.5) * 20, B - POD - 6); g.scale(dir * 1.35, 1.35); demon(g, sd); g.restore();
      if (h01(i * 9.1) > 0.55) { g.save(); g.translate(ax + dir * 22, B - POD - 6); g.scale(dir * 1.25, 1.25); demon(g, sd + 6); g.restore(); }
    }
    const top = B - POD - 20;
    box(g, ax - AR, top - 1, AR * 2, 21, INK);
    for (let x = ax - AR + 3; x < ax + AR - 3; x += 8) { box(g, x, top + 4, 4, 13, STONE2[2]); box(g, x, top + 4, 1, 13, STONE2[4]); box(g, x - 1, top + 8, 6, 4, STONE2[3]); box(g, x - 1, top + 8, 1, 4, STONE2[5]); }
    box(g, ax - AR, top, AR * 2, 4, STONE2[3]); box(g, ax - AR, top, AR * 2, 1, STONE2[4]); box(g, ax - AR, top + 17, AR * 2, 3, STONE2[2]);
  }
  // The podium: black ashlar, a frieze of eyes along its top, sulfur run down it, cracks lit green from inside
  ashlar(g, 0, B - POD, w, POD, STONE, 24, 54, 11);
  box(g, 0, B - POD - 1, w, 17, INK); box(g, 0, B - POD, w, 15, STONE2[2]); box(g, 0, B - POD, w, 1, STONE2[3]); box(g, 0, B - POD + 12, w, 3, STONE2[1]);
  for (let x = 10, k = 0; x < w; x += 30, k++) { box(g, x, B - POD + 4, 14, 6, STONE[0]); box(g, x + 2, B - POD + 3, 10, 8, STONE[0]); box(g, x + 3, B - POD + 5, 8, 4, STONE2[4]); box(g, x + 6 + (k % 3) - 1, B - POD + 4, 2, 6, ENVY[2]); }
  box(g, 0, B - POD + 16, w, 3, STONE[0]); checker(g, 0, B - POD + 19, w, 4, STONE[0], 0, 2);
  for (let k = 0; k < 22; k++) { const x = h01(k * 4.7) * w, len = 40 + h01(k * 2.2) * 80; streak(g, x, B - POD + 16, 3 + (k % 3) * 2, len, mix(STONE[2], SULF[2], 0.42)); box(g, x, B - POD + 16, 1, len * 0.5, mix(STONE[2], SULF[3], 0.5)); }
  for (const [x, y, len] of [[212, 60, 70], [590, 30, 110], [742, 90, 60], [1210, 40, 90], [1570, 110, 50], [1740, 50, 100], [990, 120, 46]]) crack(g, x, B - POD + y, len, x, STONE[0], ENVY[3]);
  for (const i of [13, 14, 15]) {
    // (the screen's own boxes: a cloth over the rail, green, its folds, sulfur fringe, envy's eye on it)
    const ax = archX(i), top = B - POD - 20, cw = 56, cx = ax - cw / 2;
    box(g, cx - 1, top - 2, cw + 2, 46, INK); box(g, cx, top - 1, cw, 42, ENVY[2]); box(g, cx, top - 1, cw, 3, ENVY[4]);
    for (let x = cx + 6; x < cx + cw - 4; x += 12) { box(g, x, top + 2, 3, 39, ENVY[1]); box(g, x - 3, top + 2, 2, 39, ENVY[3]); }
    for (let x = cx; x < cx + cw; x += 4) box(g, x, top + 41, 2, 4, SULF[3]);
    g.fillStyle = SULF[3]; g.beginPath(); g.ellipse(ax, top + 20, 11, 6, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = INK; g.beginPath(); g.arc(ax, top + 20, 4, 0, Math.PI * 2); g.fill(); box(g, ax - 1, top + 17, 2, 6, SULF[5]);
  }
  box(g, 0, B - 18, w, 18, INK); box(g, 0, B - 17, w, 17, STONE2[1]); box(g, 0, B - 17, w, 1, STONE2[3]); box(g, 0, B - 6, w, 6, STONE2[0]); checker(g, 0, B - 8, w, 2, STONE2[0], 0, 1);
  // (bones along its foot, a skull here and there: not in front of a gate)
  for (let k = 0; k < 16; k++) { const x = 20 + h01(k * 6.1) * (w - 60); if (o.bays.some(d => Math.abs(x - d) < o.port + 30)) continue; k % 3 ? bone(g, x, B - 3, 14 + (k % 4) * 3, (k % 2) * -3) : skull(g, x, B - 1, 0.9); }

  // The posse's gates: the stage's own bays, dressed in the wall's stone (a lintel block, its sign, a skull for a keystone)
  o.bays.forEach((dx, n) => {
    o.bay(g, dx, B, n + 1);
    box(g, dx - 131, B - 190, 262, 47, INK); ashlar(g, dx - 130, B - 189, 260, 45, STONE2, 15, 34, n * 5 + 1); box(g, dx - 130, B - 189, 260, 1, STONE2[4]);
    for (const s of [-1, 1]) { const px = s < 0 ? dx - 130 : dx + 112; box(g, px - 1, B - 145, 20, 145, INK); ashlar(g, px, B - 144, 18, 144, STONE2, 16, 30, n * 3 + s); box(g, px, B - 144, 2, 144, STONE2[4]); }
    sign(g, dx, B - 165, [['DAMNED CREW ONLY', { sx: 1, sy: 2, fill: [SULF[5], SULF[4]], gap: 1 }]], '#16140C', IRONK, 5);
    skull(g, dx - 96, B - 158, 1.2); skull(g, dx + 78, B - 158, 1.2);
  });

  // The torches' bowls on their brackets, the light they throw on the wall (the flames are live)
  for (const [tx, up] of TORCH) {
    steppedGlow(g, tx, B - up - 8, 52, '#C8D23A', 0.17, 0, 5);
    if (up > 200) bowl(g, tx, B - up, 16); else bowl(g, tx, B - up);
  }

  // The signs
  const big: Look = { sx: 3, sy: 3, fill: [SULF[5], SULF[4], SULF[3]], dither: true, shadow: INK, gap: 1 };
  const small = (col: string, sy = 1): Look => ({ sx: 1, sy, fill: col, gap: 1 });
  // (FREE NACHOS, hung on two chains off the frieze)
  for (const s of [-1, 1]) chainV(g, 535 + s * 92, B - POD + 15, B - 124, IRONK);
  sign(g, 535, B - 104, [['FREE NACHOS', big], ['WITH EVERY SHOW. EVERY NIGHT. FOREVER.', small(ENVY[4])]], '#1C1408', IRONK);
  // (under the screen: PLEASE WATCH THE SCREEN, an arrow up over it; hung the same way)
  for (const s of [-1, 1]) chainV(g, 1545 + s * 74, B - POD + 15, B - 128, IRONK);
  poly(g, [[1545, B - 172], [1565, B - 150], [1553, B - 150], [1553, B - 136], [1537, B - 136], [1537, B - 150], [1525, B - 150]], INK);
  poly(g, [[1545, B - 168], [1560, B - 152], [1551, B - 152], [1551, B - 138], [1539, B - 138], [1539, B - 152], [1530, B - 152]], SULF[4]);
  sign(g, 1545, B - 100, [['PLEASE WATCH', { sx: 2, sy: 2, fill: [SULF[5], SULF[4]], gap: 1 }], ['THE SCREEN', { sx: 2, sy: 2, fill: [SULF[5], SULF[4]], gap: 1 }], ['(NOT HIM)', small(ENVY[4], 2)]], '#10180E', IRONK);
  // (bolted to the wall under the statue: the count)
  sign(g, 1040, B - 96, [['NIGHTS WITHOUT APPLAUSE', small(BONE[4])], ['9,999,999', { sx: 3, sy: 3, fill: [SULF[5], SULF[3]], dither: true, gap: 1 }], ['AND COUNTING', small(ENVY[4])]], '#14100C', IRONK);
  sign(g, 1996, B - 104, [['THE SHOW', small(BONE[4], 2)], ['NEVER ENDS', small(SULF[4], 2)]], '#14100C', IRONK, 5);
  sign(g, 76, B - 104, [['NACHOS', small(SULF[4], 2)], ['THIS WAY', small(BONE[4])]], '#1C1408', IRONK, 5);

  // In the gap: the statue on its plinth on the podium, a light on it; rubble either side, a fallen drum
  const stx = 1040, py = B - POD;
  steppedGlow(g, stx, py - 80, 84, '#E8D84A', 0.2, 0, 6);
  for (const [rx, rw, rh] of [[gapL + 34, 22, 12], [gapL + 52, 14, 8], [gapR - 50, 26, 14], [gapR - 70, 12, 7], [gapL + 40, 12, 9]] as const) { box(g, rx - 1, py - rh - 1, rw + 2, rh + 1, INK); box(g, rx, py - rh, rw, rh, STONE[2]); box(g, rx, py - rh, rw, 1, STONE[3]); box(g, rx + rw - 3, py - rh + 1, 3, rh - 1, STONE[1]); }
  box(g, stx - 63, py - 31, 126, 31, INK); ashlar(g, stx - 62, py - 30, 124, 30, STONE2, 15, 40, 77); box(g, stx - 62, py - 30, 124, 1, STONE2[4]);
  box(g, stx - 68, py - 35, 136, 6, INK); box(g, stx - 67, py - 34, 134, 4, STONE2[3]); box(g, stx - 67, py - 34, 134, 1, STONE2[4]);
  sign(g, stx, py - 15, [['A BETTER STUNTMAN', small(GOLD[5])]], '#3A2A06', GOLD, 4);
  g.save(); g.translate(stx, py - 35); paintBetter(g); g.restore();
  // (what the demons left at his feet: nacho trays)
  for (const nx of [stx - 52, stx + 40]) { box(g, nx - 1, py - 42, 14, 8, INK); box(g, nx, py - 40, 12, 5, '#7A1A14'); box(g, nx + 1, py - 43, 3, 3, SULF[4]); box(g, nx + 5, py - 44, 4, 4, SULF[3]); box(g, nx + 8, py - 42, 3, 2, SULF[5]); }
};

/** The torches' flames, live (world space: after the set, before the stands). */
export const drawColosseumLive = (c: Ctx, state: GameState) => {
  const base = FLOOR_BACK_Y + 2, sx = ARENA_L - 40, f = state.frame;
  for (let k = 0; k < TORCH.length; k++) {
    const x = sx + TORCH[k][0];
    if (seen(state, x - 20, x + 20)) flame(c, x, base - TORCH[k][1], f, k, FLAME, 1.1);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// What's on STEVE-O-VISION down here: A BETTER STUNTMAN's highlights (live; the screen's well: 232 x 110 at x - 116, y + 4)

const WH: Look = { sx: 1, sy: 2, fill: '#FFFFFF', shadow: INK };
export const drawBetterReel = (c: Ctx, x: number, y: number, f: number) => {
  const L = x - 116, T = y + 4, t = f % 720, clip = Math.floor(t / 240), k = (t % 240) / 240;
  const b = (bx: number, by: number, bw: number, bh: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(bx), Math.round(by), Math.round(bw), Math.round(bh)); };
  if (clip === 0) {
    // (the jump: over fourteen buses, through three rings of fire, a perfect landing)
    ['#12384A', '#1E5468', '#3A7A86', '#6AA6A0'].forEach((col, i) => b(L, T + i * 18, 232, 19, col));
    b(L, T + 72, 232, 38, '#3C3A32'); b(L, T + 72, 232, 1, '#6A665A');
    for (let i = 0; i < 14; i++) { b(L + 36 + i * 11, T + 62, 10, 10, INK); b(L + 37 + i * 11, T + 63, 8, 8, i % 2 ? '#C8A024' : '#B8C0C8'); b(L + 38 + i * 11, T + 64, 6, 2, '#1E2A38'); }
    c.fillStyle = '#5A5A62'; c.beginPath(); c.moveTo(L + 6, T + 72); c.lineTo(L + 34, T + 72); c.lineTo(L + 34, T + 56); c.fill(); c.beginPath(); c.moveTo(L + 226, T + 72); c.lineTo(L + 194, T + 72); c.lineTo(L + 194, T + 58); c.fill();
    for (const rx of [70, 114, 158]) { const ry = T + 26 + Math.abs(rx - 114) * 0.22; b(L + rx - 2, ry - 15, 4, 30, (f >> 2) % 2 ? '#F97316' : '#FDE047'); b(L + rx - 1, ry - 12, 2, 24, '#12384A'); }
    const u = Math.min(1, k * 1.25), bx = L + 20 + u * 196, by = T + 56 - Math.sin(u * Math.PI) * 34 + (u >= 1 ? 8 : 0);
    b(bx - 7, by - 3, 14, 4, INK); b(bx - 8, by, 5, 5, INK); b(bx + 3, by, 5, 5, INK); b(bx - 3, by - 10, 5, 8, GOLD[4]); b(bx - 2, by - 14, 4, 4, '#E8C0A0'); b(bx - 12, by - 9, 9, 3, ENVY[3]);
    if (k > 0.8) signText(c, 'PERFECT!', x, T + 34, { sx: 2, sy: 3, fill: '#FDE047', shadow: INK });
    signText(c, 'JUMP NO. 9,000', L + 6, T + 16, WH, 'left');
  } else if (clip === 1) {
    // (the podium: first, again; tens across the board, confetti)
    b(L, T, 232, 110, '#3A2A06');
    for (let i = 0; i < 12; i++) { const a = (i * Math.PI) / 6 + f * 0.01; c.fillStyle = i % 2 ? '#6A4E0C' : '#9A7614'; c.beginPath(); c.moveTo(x, T + 52); c.lineTo(x + Math.cos(a) * 170, T + 52 + Math.sin(a) * 170); c.lineTo(x + Math.cos(a + 0.52) * 170, T + 52 + Math.sin(a + 0.52) * 170); c.fill(); }
    b(x - 22, T + 62, 44, 30, INK); b(x - 21, T + 63, 42, 29, '#D8DCE2'); b(x - 21, T + 63, 42, 2, '#FFFFFF'); signText(c, '1', x, T + 86, { sx: 2, sy: 2, fill: INK });
    const bob = (f >> 3) % 2;
    b(x - 6, T + 40 - bob, 12, 22, INK); b(x - 5, T + 41 - bob, 10, 20, GOLD[4]); b(x - 4, T + 31 - bob, 8, 9, '#E8C0A0'); b(x - 5, T + 29 - bob, 10, 3, '#5A3A1E');
    b(x - 13, T + 28 - bob, 4, 16, GOLD[4]); b(x + 9, T + 28 - bob, 4, 16, GOLD[4]); b(x + 6, T + 18 - bob, 10, 10, '#FDE047');
    for (const [sx2, n] of [[-84, 0], [-56, 1], [58, 2], [86, 3]]) { b(x + sx2 - 11, T + 44 + (n % 2) * 6, 22, 18, INK); b(x + sx2 - 10, T + 45 + (n % 2) * 6, 20, 16, '#FFFFFF'); signText(c, '10', x + sx2, T + 58 + (n % 2) * 6, { sx: 1, sy: 1, fill: '#B42222', bold: true }); }
    for (let i = 0; i < 26; i++) b(L + h01(i * 3.1) * 232, T + ((h01(i * 1.7) * 110 + f * (0.6 + (i % 3) * 0.3)) % 110), 2, 3, ['#4CC466', '#FDE047', '#F25A52', '#FFFFFF'][i % 4]);
    signText(c, 'FIRST PLACE. AGAIN.', x, T + 16, WH);
  } else {
    // (the walk: away from the blast, and he doesn't look back)
    ['#1A0E08', '#3A1A0A', '#6A2A0C', '#A8480E'].forEach((col, i) => b(L, T + i * 20, 232, 21, col)); b(L, T + 78, 232, 32, '#14100C');
    const r = 14 + k * 50;
    for (const [rr, col] of [[r, '#C2410C'], [r * 0.72, '#F97316'], [r * 0.46, '#FDE047'], [r * 0.2, '#FFFBEA']] as const) { c.fillStyle = col; c.beginPath(); c.arc(x + 34, T + 60, rr, 0, Math.PI * 2); c.fill(); }
    b(L, T + 78, 232, 32, '#14100C'); b(L, T + 78, 232, 1, '#6A2A0C');
    const s = 1 + k * 0.9, hx = x - 30 - k * 16, hy = T + 82 + k * 14, st = (f >> 3) % 2 ? 2 : -2;
    b(hx - 6 * s, hy - 30 * s, 12 * s, 20 * s, INK); b(hx - 5 * s, hy - 29 * s, 10 * s, 18 * s, GOLD[3]); b(hx - 4 * s, hy - 39 * s, 8 * s, 9 * s, '#E8C0A0'); b(hx - 4 * s, hy - 36 * s, 8 * s, 2 * s, INK); b(hx - 5 * s, hy - 41 * s, 10 * s, 3 * s, '#5A3A1E');
    b(hx - 5 * s + st, hy - 11 * s, 4 * s, 11 * s, INK); b(hx + 1 * s - st, hy - 11 * s, 4 * s, 11 * s, INK); b(hx + 5 * s, hy - 28 * s, 5 * s, 16 * s, ENVY[2]);
    signText(c, 'DOES NOT LOOK BACK', x, T + 16, WH);
  }
  // (the lower third)
  b(L, T + 90, 232, 20, INK); b(L, T + 91, 232, 19, ENVY[1]); b(L, T + 91, 232, 2, SULF[4]); b(L, T + 91, 6, 19, SULF[4]);
  signText(c, 'A BETTER STUNTMAN', L + 12, T + 108, { sx: 1, sy: 2, fill: SULF[5], shadow: INK }, 'left');
  signText(c, 'HIGHLIGHTS', L + 226, T + 106, { sx: 1, sy: 1, fill: '#FFFFFF' }, 'right');
  return true;
};

/** Taped over his banner's top line (the banner's top left at x, y; 240 wide): TONIGHT'S OPENING ACT, a touch crooked. */
export const drawOpeningAct = (c: Ctx, x: number, y: number) => {
  if (typeof document === 'undefined') return;
  const cv = bake('pa-hw-opening', 200, 44, g => {
    g.translate(100, 22); g.rotate(-0.05);
    box(g, -83, -12, 166, 24, INK); box(g, -82, -11, 164, 22, '#EDE6D2'); box(g, -82, -11, 164, 2, '#FFFDF2'); box(g, -82, 8, 164, 3, '#C8BFA6'); checker(g, -82, 6, 164, 2, '#C8BFA6', 0, 1);
    for (const tx of [-90, 72]) { box(g, tx, -9, 18, 8, '#D8C88A'); box(g, tx, -9, 18, 1, '#EEE2B0'); }
    signText(g, "TONIGHT'S OPENING ACT", 0, 7, { sx: 1, sy: 2, fill: ['#B42222', '#7A1414'], gap: 1 });
  });
  c.drawImage(cv, Math.round(x + 20), Math.round(y - 4));
};

/** The stands down here: black stone, bone seats and green ones, the ad boards in sulfur and green. */
export const COLOSSEUM_PAL = {
  stand: ['#10120E', '#1B1F17', '#272C20', '#363C2B', '#4A5139', '#646C4E'],
  seatA: BONE.slice(0, 5), seatB: ENVY.slice(0, 5), adA: SULF, adB: ENVY,
};
export const COLOSSEUM_MARQUEE = 'THE COLOSSEUM OF THE DAMNED';

void ramp;
