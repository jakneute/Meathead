// PUNCHY & KICKY's street, back from the play plane (the land's one eye: kit.ts's view). Dimmed a step toward the air,
// none of it to stand on:
//
//   THE FRONTS     the show's buildings at FRONT_D, boxy and straight, their sides going back to BACK_D where the eye's
//                  past an end: blood-red, mustard, black, bone and cream stucco, a candy-striped band (red and black)
//                  or a row of painted bones, blood running off every parapet, the cat-and-mouse mural on some, posters
//                  pasted up (PUNCHY & KICKY, AS SEEN ON STUPID DAD!), roof junk (AC units, vents, a water tank, a fire
//                  escape); at street level, a business each: PUNCHY'S GRILL (FISH STICKS, CATNIP SODA, the fish bones on
//                  the menu), KICKY'S CHEESE HUT (the wedge awning, its holes, a mousetrap in the window), FIRST AID (the
//                  cross in bandages, WE'VE SEEN WORSE), RESTROOMS (TOMCATS / LADY MICE), WHACK-A-MOUSE (mice up out of
//                  the holes, mallets, plush prizes), PHOTO WITH PUNCHY (the head-hole board), the STAGE BLOOD DEPOT (55
//                  GAL. drums, the roll door half up), CAST ONLY (costume heads on a rack in the window), ANVIL TOSS
//                  (WIN A PRIZE!), LOCKERS.
//   THE ALLEY      asphalt behind them, cracked, a red line, chain-link.
//   THE PATH       the show's cream pavers coming toward him from the fronts, their joints running back to the eye, red
//                  paw prints and mouse tracks, splats, a drain; a gutter along the fronts' feet. Over the canyon it's
//                  painted dirt back to the gorge's far rim; on the set, the stage's black boards (its spike tape).
//   THE FURNITURE  KICKY bins (FEED KICKY: his mouth the lid), benches of bones, queue rails with the crowd behind them
//                  (seeded park guests, men and women, every look: P&K tees, cat-ear headbands, foam mallets, ponchos
//                  splattered red from the SPLASH ZONE), a CHERRY GORE sno-cone cart, a balloon seller (cat and mouse
//                  heads on strings), the photo board, the hedge topiary of the two of them, a garden gnome with an axe
//                  in his head, a fire hydrant, payphones, poster kiosks, red puff trees in planters.

import type { Light } from '../../../m1/game/render/lighting';
import { signText } from '../../signLetters';
import { lookOf } from '../../adventure/temple/people';
import { type Ctx, type View, INK, box, mix, hash, checker, at, stillAt, seen, polyF, sideBack, lit, dimmed, FRONT_D, BACK_D, ballR, postR, eggR } from '../kit';
import { GY } from '../geometry';
import { X, CANYON, HOLES, MERCH, KILLORAMA, EXIT_GATE } from './layout';
import { catHead, mouseHead, mallet } from './kindArt';
import { DR, DC, BLOOD, BONE, MUSTARD, TAR, CREAM, CONCRETE, GRASSY, CRATE, gore, drips, bone, skull, haze, small } from './paint';

/** Where the furniture stands (its feet); how far back the canyon's far rim is. */
export const FURN_D = 0.95, PIT_D = 0.93, HOLE_D = 0.94;
/** Where the painted canyon's backdrop and the live set's drapes stand (their floors run back to them). */
export const SET_BACK_D = 0.86;
/** Where the street's left out (the painted canyon's backdrop and the live set stand there instead). */
export const NO_STREET: [number, number] = [7150, 9790];

type Shop = 'grill' | 'cheese' | 'aid' | 'rest' | 'game' | 'photo' | 'blood' | 'cast' | 'toss' | 'lockers';
interface Front { x: number; w: number; h: number; shop: Shop; seed: number }
const SHOPS: Shop[] = ['grill', 'game', 'aid', 'cheese', 'blood', 'rest', 'photo', 'toss', 'cast', 'lockers', 'cheese', 'grill', 'game', 'aid', 'photo', 'blood'];
/** The fronts, all along (x from the section's start). */
export const FRONTS: Front[] = (() => {
  const out: Front[] = [];
  let x = -640, i = 0;
  while (x < 10700) {
    const seed = i * 19 + 7, w = 180 + Math.floor(hash(seed) * 110);
    if (!(x + w > NO_STREET[0] && x < NO_STREET[1])) out.push({ x, w, h: 180 + Math.floor(hash(seed * 3) * 130), shop: SHOPS[i % SHOPS.length], seed });
    x += w + 14 + Math.floor(hash(seed * 7) * 28); i++;
  }
  return out;
})();
const WALLS = ['#C8323A', '#E8B424', '#3A3040', '#EADFC0', '#F0D8B8', '#D86A3A', '#8A1A22'];
const wallOf = (f: Front) => WALLS[((Math.floor(f.seed) % WALLS.length) + WALLS.length) % WALLS.length];
const D = (col: string) => dimmed(col);

// ---------------------------------------------------------------------------------------------------------------
// The fronts

/** A lit window's glass (warm after dark, sky by day), in bands. */
const glass = (g: Ctx, x: number, y: number, w: number, h: number) => {
  const G = lit() ? ['#4A2208', '#8A4A10', '#D08A24', '#F6BE48'] : ['#1E3A5A', '#2E5A86', '#4A84B4', '#74AED8'];
  for (let i = 0; i < 4; i++) box(g, x, y + (h * i) / 4, w, Math.ceil(h / 4) + 1, D(G[3 - i]));
  checker(g, x, y + h / 2, w, 2, D(G[1]), 0, 1);
  g.fillStyle = 'rgba(255,255,255,0.2)'; g.beginPath(); g.moveTo(x + w * 0.15, y); g.lineTo(x + w * 0.35, y); g.lineTo(x + w * 0.1, y + h); g.lineTo(x - w * 0.1, y + h); g.closePath(); g.fill();
};
/** A PUNCHY & KICKY poster pasted up (the two of them, mallets up; AS SEEN ON STUPID DAD!), aged by `look`. */
export const pkPosterArt = (g: Ctx, x: number, y: number, look: number, T: (c: string) => string = D) => {
  const P = look === 1 ? mix('#FDE68A', '#F0E8D8', 0.5) : '#FDE68A';
  box(g, x - 1, y - 1, 46, 62, T(INK)); box(g, x, y, 44, 60, T(P));
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; g.fillStyle = T('#FCA5A5'); g.beginPath(); g.moveTo(x + 22, y + 30); g.lineTo(x + 22 + Math.cos(a) * 34, y + 30 + Math.sin(a) * 34); g.lineTo(x + 22 + Math.cos(a + 0.35) * 34, y + 30 + Math.sin(a + 0.35) * 34); g.closePath(); g.fill(); }
  g.save(); g.beginPath(); g.rect(x, y, 44, 60); g.clip();
  g.save(); g.translate(x + 13, y + 32); g.scale(0.5, 0.5); catHead(g, 0, 0, 18, 0.2); g.restore();
  g.save(); g.translate(x + 32, y + 34); g.scale(-0.5, 0.5); mouseHead(g, 0, 0, 16, 0.2); g.restore();
  g.restore();
  haze(g, x, y, 44, 60, 0.26);
  box(g, x, y, 44, 9, T('#B91C1C')); signText(g, 'P&K', x + 22, y + 8, small(T('#FFFFFF'), T(INK)));
  box(g, x, y + 50, 44, 10, T('#1E3A8A')); signText(g, 'STUPID DAD!', x + 22, y + 58, { sx: 1, sy: 1, fill: T('#FDE047') });
  if (look === 2) { g.fillStyle = T(mix(P, '#F0E8D8', 0.6)); g.beginPath(); g.moveTo(x + 44, y); g.lineTo(x + 26, y); g.lineTo(x + 44, y + 20); g.closePath(); g.fill(); g.strokeStyle = T(INK); g.lineWidth = 1; g.beginPath(); g.moveTo(x + 26, y); g.lineTo(x + 44, y + 20); g.stroke(); }
  if (look === 3) { box(g, x + 4, y - 3, 10, 5, T('#D4C8A0')); box(g, x + 30, y - 3, 10, 5, T('#D4C8A0')); }
};
const paintFront = (g: Ctx, f: Front) => {
  const w = f.w, h = f.h, R = DC(wallOf(f)), ink = D(INK), BL = DR(BLOOD), BN = DR(BONE);
  // (the wall: inked, stepped across, stucco speckle, a darker foot)
  box(g, -2, -h - 2, w + 4, h + 2, ink);
  box(g, 0, -h, w, h, R[3]); box(g, 0, -h, 6, h, R[4]); box(g, 0, -h, 2, h, R[5]);
  box(g, w - 18, -h, 18, h, R[2]); checker(g, w - 20, -h, 2, h, R[2], 0, 1); box(g, w - 6, -h, 6, h, R[1]);
  for (let k = 0; k < 40; k++) box(g, 4 + hash(f.seed + k * 3.1) * (w - 10), -h + 4 + hash(f.seed * 5 + k) * (h - 20), 1, 1, k % 2 ? R[2] : R[4]);
  box(g, 0, -14, w, 14, R[1]); checker(g, 0, -16, w, 2, R[1], 1, 1);
  // (the band up top: red-and-black candy stripes, or a row of painted bones)
  const by = -h + 30;
  if (f.seed % 2) { g.save(); g.beginPath(); g.rect(0, by, w, 14); g.clip(); for (let k = -20; k < w + 20; k += 16) { polyF(g, [[k, by + 14], [k + 8, by + 14], [k + 22, by], [k + 14, by]], D('#B01C22')); polyF(g, [[k + 8, by + 14], [k + 16, by + 14], [k + 30, by], [k + 22, by]], D('#1F1A24')); } g.restore(); box(g, 0, by, w, 1, ink); box(g, 0, by + 14, w, 1, ink); }
  else { box(g, 0, by, w, 16, D('#1F1A24')); for (let k = 12; k < w - 12; k += 30) bone(g, k, by + 8, k + 18, by + 8, 3, BN); }
  // (the mural on some: the two of them, mallets up at each other, a splat between; posters on others)
  if (f.seed % 3 === 0 && h > 220) {
    const my = -h * 0.56, mx = w / 2;
    box(g, mx - 70, my - 44, 140, 82, D('#F4ECD8')); box(g, mx - 70, my - 44, 140, 2, D('#FFFFFF')); box(g, mx - 70, my + 36, 140, 2, D('#C8B892'));
    g.save(); g.beginPath(); g.rect(mx - 70, my - 44, 140, 82); g.clip();
    g.save(); g.translate(mx - 30, my); catHead(g, 0, 0, 22, 0.15); g.restore();
    g.save(); g.translate(mx + 32, my + 4); g.scale(-1, 1); mouseHead(g, 0, 0, 20, 0.15); g.restore();
    mallet(g, mx - 6, my + 20, -0.6, 30, 14); g.save(); g.scale(-1, 1); mallet(g, -mx - 8, my + 20, -0.6, 30, 14); g.restore();
    gore(g, mx, my - 18, 7, f.seed, BL);
    g.restore();
    haze(g, mx - 70, my - 44, 140, 82, 0.3);
  } else if (h > 200) { pkPosterArt(g, w - 64, -h + 60, f.seed % 4); if (w > 230) pkPosterArt(g, w - 116, -h + 66, (f.seed + 1) % 4); }
  // (the parapet: coping (dimmed: not to stand on), blood running off it)
  box(g, -6, -h - 12, w + 12, 12, ink); box(g, -4, -h - 10, w + 8, 8, BN[2]); box(g, -4, -h - 10, w + 8, 2, BN[4]); box(g, -4, -h - 4, w + 8, 2, BN[0]);
  drips(g, 0, w, -h - 2, f.seed, BL, 5 + (f.seed % 4), 34);
  // (roof junk: an AC unit, a vent, a water tank on legs, a fire escape down the side)
  if (f.seed % 3 !== 1) { const ax = w * 0.62; box(g, ax - 1, -h - 30, 38, 20, ink); box(g, ax, -h - 29, 36, 18, D('#A8A8BC')); box(g, ax, -h - 29, 36, 2, D('#D8D8E4')); for (let k = 0; k < 6; k++) box(g, ax + 3 + k * 5, -h - 25, 3, 12, D('#6A6A80')); }
  if (f.seed % 4 === 2) { const tx = w * 0.24, Wd = DR(CRATE); for (const s of [-1, 1]) box(g, tx + s * 12 - 1, -h - 26, 3, 16, ink); box(g, tx - 17, -h - 60, 34, 36, ink); box(g, tx - 16, -h - 59, 32, 34, Wd[3]); box(g, tx - 16, -h - 59, 4, 34, Wd[4]); box(g, tx + 10, -h - 59, 6, 34, Wd[1]); for (let y = -h - 52; y < -h - 26; y += 9) box(g, tx - 16, y, 32, 2, Wd[0]); polyF(g, [[tx - 20, -h - 60], [tx, -h - 74], [tx + 20, -h - 60]], ink); polyF(g, [[tx - 17, -h - 61], [tx, -h - 71], [tx + 17, -h - 61]], D('#B01C22')); }
  if (f.seed % 2 === 0) { const ex = w - 34; for (let y = -h + 70; y < -60; y += 64) { box(g, ex - 16, y, 44, 3, ink); for (let k = 0; k < 44; k += 4) box(g, ex - 16 + k, y - 14, 1, 14, ink); box(g, ex - 16, y - 14, 44, 1, ink); } box(g, ex + 22, -h + 56, 2, h - 116, ink); for (let y = -h + 60; y < -60; y += 8) box(g, ex + 16, y, 8, 1, ink); }
  shopFront(g, f, w, h);
};
const shopFront = (g: Ctx, f: Front, w: number, h: number) => {
  const ink = D(INK), sx = 18, sw = Math.min(w - 50, 190), top = -118;
  /** The shop's board: a cream board with a red rim and a dripping foot, the name in the show's red. */
  const sign = (text: string, sub?: string) => {
    const bw = Math.min(w - 24, Math.max(96, text.length * 9 + 26)), bx = 12, R = DR(BLOOD), C = DR(CREAM);
    box(g, bx + 10, top - 6, 3, 8, ink); box(g, bx + bw - 13, top - 6, 3, 8, ink);
    box(g, bx - 2, top - 40, bw + 4, 38, ink); box(g, bx, top - 38, bw, 34, R[3]); box(g, bx, top - 38, bw, 2, R[4]); box(g, bx + 3, top - 35, bw - 6, 28, C[3]); box(g, bx + 3, top - 35, bw - 6, 2, C[5]); box(g, bx + 3, top - 9, bw - 6, 2, C[1]);
    drips(g, bx + 4, bx + bw - 4, top - 4, f.seed + 3, R, 4, 9);
    signText(g, text, bx + bw / 2, top - (sub ? 20 : 15), { sx: 1, sy: sub ? 1 : 2, bold: true, fill: [D('#E8474A'), D('#9A1A20')], ink, shadow: D('#4A0A0A'), drop: 1 });
    if (sub) signText(g, sub, bx + bw / 2, top - 11, small(D('#1F1A24'), D('#F4ECD8')));
  };
  const awning = (a: string, b: string) => {
    box(g, sx - 8, top - 2, sw + 16, 4, ink);
    for (let k = 0; k < sw + 12; k += 12) { box(g, sx - 6 + k, top + 2, 6, 14, D(a)); box(g, sx + k, top + 2, 6, 14, D(b)); }
    for (let k = 0; k < sw + 12; k += 12) { g.fillStyle = D(k % 24 ? b : a); g.beginPath(); g.arc(sx + k, top + 16, 6, 0, Math.PI); g.fill(); }
    box(g, sx - 6, top + 2, sw + 12, 2, D('#FFFFFF'));
  };
  const frame = () => box(g, sx - 3, top - 3, sw + 6, -top + 3, ink);
  switch (f.shop) {
    case 'grill': {
      sign("PUNCHY'S GRILL", 'FISH STICKS * CATNIP SODA'); frame(); glass(g, sx, top + 18, sw, 50); awning('#B01C22', '#F4ECD8');
      // (the counter, a menu board of fish skeletons, a grill's flame)
      box(g, sx, -46, sw, 46, D('#3A3040')); box(g, sx, -46, sw, 4, D('#C8C0C8'));
      box(g, sx + 10, top + 24, 60, 38, ink); box(g, sx + 11, top + 25, 58, 36, D('#1F1A24'));
      for (let k = 0; k < 3; k++) { const fy = top + 32 + k * 10; box(g, sx + 16, fy, 22, 1, D('#F4ECD8')); for (let j = 0; j < 4; j++) box(g, sx + 20 + j * 5, fy - 2, 1, 5, D('#F4ECD8')); polyF(g, [[sx + 38, fy], [sx + 44, fy - 3], [sx + 44, fy + 3]], D('#F4ECD8')); box(g, sx + 50, fy - 2, 14, 4, D('#E8B424')); }
      if (lit()) for (let k = 0; k < 3; k++) { g.fillStyle = k % 2 ? '#FDBA74' : '#F97316'; g.beginPath(); g.ellipse(sx + sw - 40 + k * 10, top + 60, 4, 8, 0, 0, Math.PI * 2); g.fill(); }
      break;
    }
    case 'cheese': {
      sign("KICKY'S CHEESE HUT", 'SAY CHEESE!'); frame(); glass(g, sx, top + 20, sw, 54);
      // (the awning a wedge of cheese, its holes)
      const M = DR(MUSTARD);
      polyF(g, [[sx - 10, top + 2], [sx + sw + 10, top + 2], [sx + sw + 10, top + 22], [sx - 10, top + 22]], ink);
      polyF(g, [[sx - 8, top + 4], [sx + sw + 8, top + 4], [sx + sw + 8, top + 20], [sx - 8, top + 20]], M[3]); box(g, sx - 8, top + 4, sw + 16, 3, M[4]); box(g, sx - 8, top + 17, sw + 16, 3, M[1]);
      for (let k = 0; k < 9; k++) { g.fillStyle = M[1]; g.beginPath(); g.ellipse(sx + 6 + k * (sw / 9) + hash(k) * 8, top + 11 + (k % 2) * 3, 3 + hash(k * 3) * 2, 2.5, 0, 0, Math.PI * 2); g.fill(); }
      // (a big mousetrap in the window, a wedge on it; wheels of cheese stacked)
      box(g, sx + 14, top + 60, 50, 10, ink); box(g, sx + 15, top + 61, 48, 8, D('#C8924A')); g.strokeStyle = D('#D4D4D8'); g.lineWidth = 2; g.beginPath(); g.moveTo(sx + 20, top + 60); g.lineTo(sx + 40, top + 44); g.lineTo(sx + 60, top + 60); g.stroke(); polyF(g, [[sx + 34, top + 60], [sx + 46, top + 60], [sx + 46, top + 52]], M[3]);
      for (let k = 0; k < 3; k++) { eggR(g, sx + sw - 30, -10 - k * 12, 20, 6, M, true); }
      box(g, sx, -46, 10, 46, D('#3A3040'));
      break;
    }
    case 'aid': {
      sign('FIRST AID', "WE'VE SEEN WORSE"); frame(); box(g, sx, top, sw, -top, D('#F4F0EC'));
      // (the cross made of bandages, a splat on it; the door; a stretcher stood up with a cat-shaped dent)
      const cx = sx + 50, cy = top + 46;
      box(g, cx - 9, cy - 30, 18, 60, ink); box(g, cx - 30, cy - 9, 60, 18, ink); box(g, cx - 7, cy - 28, 14, 56, D('#F4ECD8')); box(g, cx - 28, cy - 7, 56, 14, D('#F4ECD8'));
      for (let k = -26; k < 26; k += 6) { box(g, cx + k, cy - 7, 1, 14, D('#C8B892')); box(g, cx - 7, cy + k, 14, 1, D('#C8B892')); }
      gore(g, cx + 10, cy + 6, 5, f.seed, DR(BLOOD));
      box(g, sx + sw - 54, top + 14, 40, -top - 14, ink); box(g, sx + sw - 52, top + 16, 36, -top - 16, D('#B4ACB0')); box(g, sx + sw - 22, -54, 3, 6, D('#E8B424'));
      box(g, sx + 96, top + 20, 22, 96, ink); box(g, sx + 97, top + 21, 20, 94, D('#E8E4E0')); g.strokeStyle = D('#8A8488'); g.lineWidth = 1; g.beginPath(); g.ellipse(sx + 107, top + 60, 6, 22, 0, 0, Math.PI * 2); g.stroke();
      break;
    }
    case 'rest': {
      sign('RESTROOMS'); frame(); box(g, sx, top, sw, -top, D('#D8D4CC'));
      for (const [dx, cat] of [[0.25, true], [0.75, false]] as [number, boolean][]) {
        const ddx = sx + sw * dx;
        box(g, ddx - 22, top + 30, 44, -top - 30, ink); box(g, ddx - 20, top + 32, 40, -top - 32, D(cat ? '#3A5AB0' : '#C8506A'));
        g.save(); g.translate(ddx, top + 16); g.scale(0.36, 0.36); (cat ? catHead : mouseHead)(g, 0, 0, 22, 0); g.restore();
        signText(g, cat ? 'TOMCATS' : 'LADY MICE', ddx, top + 46, small(D('#FFFFFF'), ink));
      }
      break;
    }
    case 'game': {
      sign('WHACK-A-MOUSE', 'EVERYBODY WINS!'); frame(); box(g, sx, top, sw, -top, D('#1F1A24'));
      awning('#E8B424', '#B01C22');
      // (prizes hung (plush heads), the game board with its holes and mice up out of some, the mallets on chains)
      for (let k = 0; k < 6; k++) { g.save(); g.translate(sx + 16 + k * (sw - 30) / 5, top + 30); g.scale(0.32, 0.32); (k % 2 ? mouseHead : catHead)(g, 0, 0, 22, 0); g.restore(); }
      box(g, sx + 6, -58, sw - 12, 22, ink); box(g, sx + 7, -57, sw - 14, 20, D('#2A8A3A')); box(g, sx + 7, -57, sw - 14, 3, D('#5AC45A'));
      for (let k = 0; k < 5; k++) { const hx = sx + 22 + k * (sw - 44) / 4; g.fillStyle = D('#0A0A0A'); g.beginPath(); g.ellipse(hx, -48, 9, 4, 0, 0, Math.PI * 2); g.fill(); if (hash(f.seed + k) > 0.4) { g.save(); g.translate(hx, -54); g.scale(0.28, 0.28); mouseHead(g, 0, 0, 22, 0); g.restore(); } }
      box(g, sx, -36, sw, 36, D('#B01C22')); box(g, sx, -36, sw, 3, D('#E8474A'));
      for (const mx of [sx + 30, sx + sw - 30]) { g.strokeStyle = ink; g.lineWidth = 1; g.beginPath(); g.moveTo(mx, -36); g.lineTo(mx - 6, -20); g.stroke(); mallet(g, mx - 6, -20, 0.8, 16, 9); }
      break;
    }
    case 'photo': {
      sign('PHOTO WITH PUNCHY', '$12. NO REFUNDS.'); frame(); box(g, sx, top, sw, -top, D('#6A2A3A'));
      // (the head-hole board: the cat and the mouse painted, holes where their faces were; a flash on a stand)
      box(g, sx + 14, top + 12, sw - 60, 100, ink); box(g, sx + 15, top + 13, sw - 62, 98, D('#7DD3FC')); box(g, sx + 15, top + 90, sw - 62, 21, D('#86EFAC'));
      for (const [hx, cat] of [[0.3, true], [0.7, false]] as [number, boolean][]) { const ccx = sx + 15 + (sw - 62) * hx; box(g, ccx - 12, top + 52, 24, 40, D(cat ? '#EA8A2E' : '#A8A29E')); for (const s of [-1, 1]) { g.fillStyle = D(cat ? '#EA8A2E' : '#A8A29E'); g.beginPath(); g.arc(ccx + s * 12, top + 28, cat ? 6 : 9, 0, Math.PI * 2); g.fill(); } g.fillStyle = D('#0A0A0A'); g.beginPath(); g.ellipse(ccx, top + 40, 10, 12, 0, 0, Math.PI * 2); g.fill(); }
      postR(g, sx + sw - 24, top + 30, 0, 3, DR(TAR)); box(g, sx + sw - 34, top + 22, 20, 12, ink); box(g, sx + sw - 33, top + 23, 18, 10, D('#E8E4E0'));
      break;
    }
    case 'blood': {
      sign('STAGE BLOOD DEPOT', 'NON-TOXIC. MOSTLY.'); frame();
      // (the roll door half up, the dark inside, the drums: red, 55 GAL., one leaking)
      box(g, sx, top, sw, -top, D('#141018'));
      for (let y = top; y < top + 50; y += 6) { box(g, sx, y, sw, 5, D('#8E8A90')); box(g, sx, y, sw, 1, D('#B0ACAE')); }
      const R = DR(BLOOD);
      for (let k = 0; k < 4; k++) { const dx = sx + 14 + k * 42, dy = -6; if (dx + 36 > sx + sw) break; box(g, dx - 1, dy - 48, 34, 48, ink); box(g, dx, dy - 47, 32, 46, R[3]); box(g, dx, dy - 47, 6, 46, R[4]); box(g, dx + 24, dy - 47, 8, 46, R[1]); for (const ry of [dy - 40, dy - 14]) box(g, dx, ry, 32, 2, R[0]); signText(g, '55 GAL.', dx + 16, dy - 24, small(D('#F4ECD8'), ink)); }
      gore(g, sx + 40, -2, 8, f.seed + 9, R);
      break;
    }
    case 'cast': {
      sign('CAST ONLY', 'HEADS ON AT ALL TIMES'); frame(); glass(g, sx, top + 4, sw * 0.55, 70);
      // (the costume heads on a rack in the window, staring; the door with its keypad)
      box(g, sx + 4, top + 56, sw * 0.55 - 8, 3, ink);
      for (let k = 0; k < 3; k++) { g.save(); g.translate(sx + 22 + k * 30, top + 40); g.scale(0.44, 0.44); (k % 2 ? mouseHead : catHead)(g, 0, 0, 22, 0); g.restore(); }
      haze(g, sx, top + 4, sw * 0.55, 70, 0.18);
      const dx = sx + sw * 0.62; box(g, dx, top + 6, sw * 0.34, -top - 6, ink); box(g, dx + 2, top + 8, sw * 0.34 - 4, -top - 8, D('#5A5268')); box(g, dx + sw * 0.34 - 14, -64, 8, 10, D('#1F1A24')); box(g, dx + sw * 0.34 - 13, -63, 2, 2, lit() ? '#FF4040' : D('#B01C22'));
      break;
    }
    case 'toss': {
      sign('ANVIL TOSS', 'WIN A PRIZE!'); frame(); box(g, sx, top, sw, -top, D('#2A1830')); awning('#1F1A24', '#E8B424');
      // (the targets: a row of painted mice on a shelf, anvils stacked on the counter, prizes)
      for (let k = 0; k < 5; k++) { const tx = sx + 20 + k * (sw - 40) / 4; g.save(); g.translate(tx, top + 52); g.scale(0.3, 0.3); mouseHead(g, 0, 0, 22, 0); g.restore(); }
      box(g, sx + 6, top + 64, sw - 12, 3, D('#C8924A'));
      box(g, sx, -40, sw, 40, D('#E8B424')); box(g, sx, -40, sw, 3, D('#F8D45A'));
      for (let k = 0; k < 3; k++) { const ax = sx + 20 + k * 22; box(g, ax - 8, -48, 18, 8, ink); box(g, ax - 7, -47, 16, 6, D('#5A6474')); box(g, ax - 7, -47, 16, 1, D('#8A94A2')); }
      break;
    }
    default: {
      sign('LOCKERS', 'NOT RESPONSIBLE'); frame(); box(g, sx, top, sw, -top, D('#3A3040'));
      for (let k = 0; k < Math.floor(sw / 22); k++) for (let r = 0; r < 3; r++) { const lx = sx + 4 + k * 22, ly = top + 6 + r * 38; box(g, lx, ly, 20, 36, D(r % 2 ? '#C8323A' : '#E8B424')); box(g, lx, ly, 20, 2, D('#FFFFFF')); box(g, lx + 15, ly + 16, 2, 5, ink); for (let s = 0; s < 3; s++) box(g, lx + 4, ly + 5 + s * 3, 10, 1, ink); }
    }
  }
};

/** The front's sides going back where the eye's past an end; then the fronts themselves. */
export const drawFronts = (c: Ctx, v: View) => {
  const vis = FRONTS.filter(f => seen(v, X(f.x) - 60, X(f.x + f.w) + 60, FRONT_D, 120));
  for (const f of vis) {
    const R = DC(wallOf(f)), top = GY - f.h - 12, a = X(f.x) - 6, b = X(f.x + f.w) + 6;
    sideBack(c, v.eye, a, -1, top, GY, FRONT_D, BACK_D, R, 3);
    sideBack(c, v.eye, b, 1, top, GY, FRONT_D, BACK_D, R, 3);
  }
  for (const f of vis) stillAt(c, v, FRONT_D, `pk-front-${f.seed}-${lit() ? 1 : 0}`, X(f.x), GY, -14, -f.h - 80, f.w + 28, f.h + 84, g => paintFront(g, f));
};

// ---------------------------------------------------------------------------------------------------------------
// The alley, the path

/** The alley behind the fronts (between BACK_D and FRONT_D): cracked asphalt in bands, a red line. */
export const drawAlley = (c: Ctx, v: View) => {
  const a = v.v0 - 200, b = v.v1 + 200, A = DR(TAR);
  for (let i = 0; i < 3; i++) { const d0 = BACK_D + ((FRONT_D - BACK_D) * i) / 3, d1 = BACK_D + ((FRONT_D - BACK_D) * (i + 1)) / 3; polyF(c, [at(v.eye, a, GY, d0), at(v.eye, b, GY, d0), at(v.eye, b, GY, d1), at(v.eye, a, GY, d1)], A[2 + i]); }
  const [la, ly] = at(v.eye, a, GY, (BACK_D + FRONT_D) / 2), [lb] = at(v.eye, b, GY, (BACK_D + FRONT_D) / 2);
  for (let x = Math.floor(la / 24) * 24; x < lb; x += 24) box(c, x, ly, 12, 1, D('#B01C22'));
};
const PAVER = ['#EEE2C4', '#E4D6B6', '#F2E8CE', '#E8DCBE'];
/** The path from the fronts' feet to the play plane, in pavers; over the canyon, painted dirt back to the gorge's far
 *  rim; on the set, the stage's black boards. */
export const drawPath = (c: Ctx, v: View) => {
  const a = v.v0 - 60, b = v.v1 + 60, N = 5;
  const runs: [number, number, 'path' | 'dirt' | 'stage', number][] = [];
  const cuts = [a, b, X(NO_STREET[0]), X(CANYON[0]), X(CANYON[1]), X(8700), X(HOLES[0]), X(HOLES[1]), X(NO_STREET[1])].filter(x => x >= a && x <= b).sort((m, n) => m - n);
  for (let i = 0; i + 1 < cuts.length; i++) {
    const m = (cuts[i] + cuts[i + 1]) / 2;
    const kind = m > X(NO_STREET[0]) && m < X(8700) ? 'dirt' : m > X(8700) && m < X(NO_STREET[1]) ? 'stage' : 'path';
    // (over the gorge, the floor stops at its far rim; over the holes, at the first of them)
    const end = m > X(CANYON[0]) && m < X(CANYON[1]) ? PIT_D : m > X(HOLES[0]) && m < X(HOLES[1]) ? HOLE_D : 1;
    runs.push([cuts[i], cuts[i + 1], kind, end]);
  }
  const ink = D(INK);
  for (const [s, e, kind, dn] of runs) {
    if (e <= s) continue;
    const d0 = kind === 'path' ? FRONT_D : SET_BACK_D;
    for (let i = 0; i < N; i++) {
      const da = d0 + ((dn - d0) * i) / N, db = d0 + ((dn - d0) * (i + 1)) / N;
      const col = kind === 'path' ? D(PAVER[i % 4]) : kind === 'dirt' ? D(['#C86A3A', '#B85E34', '#D0763E', '#BE6436'][i % 4]) : D(['#201A26', '#1A1420', '#241E2A', '#1C1622'][i % 4]);
      polyF(c, [at(v.eye, s, GY, da), at(v.eye, e, GY, da), at(v.eye, e, GY, db), at(v.eye, s, GY, db)], col);
      const [lx, ly] = at(v.eye, s, GY, db), [rx] = at(v.eye, e, GY, db);
      box(c, lx, ly - 1, rx - lx, 1, kind === 'path' ? D('#C8B892') : kind === 'dirt' ? D('#8A3A14') : D('#0A080C'));
      checker(c, lx, ly - 3, rx - lx, 2, kind === 'path' ? D(PAVER[(i + 1) % 4]) : col, i % 2, 1);
    }
    // (the joints running back to the eye; on the path, red paw prints and mouse tracks, splats; on the stage, spike tape)
    c.strokeStyle = kind === 'path' ? D('#C8B892') : kind === 'dirt' ? D('#9A4A20') : D('#3A3040'); c.lineWidth = 1; c.beginPath();
    const step = kind === 'stage' ? 24 : 56;
    for (let jx = Math.ceil(s / step) * step; jx < e; jx += step) { const [x0, y0] = at(v.eye, jx, GY, d0), [x1, y1] = at(v.eye, jx, GY, dn); c.moveTo(x0, y0); c.lineTo(x1, y1); }
    c.stroke();
    for (let jx = Math.ceil(s / 31) * 31; jx < e; jx += 31) {
      const hs = hash(jx * 0.17); if (hs < 0.5) continue;
      const d = d0 + (dn - d0) * hash(jx * 0.31), [px, py] = at(v.eye, jx, GY, d);
      if (kind === 'stage') { if (hs > 0.8) box(c, px - 4, py, 8, 1, D(['#E8B424', '#F4ECD8', '#3ABAE8'][Math.floor(hs * 30) % 3])); continue; }
      if (kind === 'dirt') { if (hs > 0.75) box(c, px, py, 3, 1, D('#E89A5A')); continue; }
      if (hs > 0.9) { const R = DR(BLOOD); c.fillStyle = R[3]; c.beginPath(); c.ellipse(px, py, 5, 1.6, 0, 0, Math.PI * 2); c.fill(); box(c, px - 2, py - 1, 2, 1, R[4]); }
      else if (hs > 0.75) { for (let k = 0; k < 3; k++) box(c, px + k * 6, py + (k % 2), 2, 1, D('#B01C22')); }
      else if (hs > 0.62) { box(c, px, py, 2, 1, D('#9A8A68')); box(c, px + 2, py, 1, 1, D('#B01C22')); }
    }
  }
  // (the gutter along the fronts' feet, where there are fronts)
  for (const [s, e, kind] of runs) {
    if (kind !== 'path') continue;
    if (e <= s) continue;
    const [fa, fy] = at(v.eye, s, GY, FRONT_D + 0.004), [fb] = at(v.eye, e, GY, FRONT_D + 0.004);
    box(c, fa, fy - 1, fb - fa, 3, D('#6A5A50')); box(c, fa, fy - 1, fb - fa, 1, D('#B4A486'));
  }
  void ink;
};

// ---------------------------------------------------------------------------------------------------------------
// The furniture

type Furn = 'bin' | 'bench' | 'queue' | 'snocone' | 'balloons' | 'board' | 'topiary' | 'gnome' | 'hydrant' | 'phone' | 'kiosk' | 'tree';
const FURN_BOX: Record<Furn, [number, number, number, number]> = {
  bin: [-22, -70, 44, 74], bench: [-48, -44, 96, 48], queue: [-84, -96, 168, 100], snocone: [-52, -130, 104, 134], balloons: [-40, -190, 80, 194],
  board: [-60, -130, 120, 134], topiary: [-60, -150, 120, 154], gnome: [-22, -50, 44, 54], hydrant: [-24, -40, 48, 44], phone: [-18, -112, 36, 116],
  kiosk: [-34, -150, 68, 154], tree: [-50, -170, 100, 174],
};
/** Where the set pieces stand (rx): none of the street's furniture there (their sides run back through it). */
const BUSY: [number, number][] = [[150, 720], [MERCH.a - 60, MERCH.b + 70], [KILLORAMA.a - 60, KILLORAMA.b + 60], [4230, 5420], [5420, 6400], [6580, 7240], [NO_STREET[0], NO_STREET[1]], [EXIT_GATE - 230, 10400]];
const KINDS: Furn[] = ['bin', 'queue', 'tree', 'snocone', 'bench', 'gnome', 'kiosk', 'balloons', 'hydrant', 'topiary', 'phone', 'board', 'bin', 'queue', 'tree', 'bench'];
export const FURN: { x: number; kind: Furn; seed: number }[] = (() => {
  const out: { x: number; kind: Furn; seed: number }[] = [];
  let x = -560, i = 0;
  while (x < 10600) {
    const kind = KINDS[i % KINDS.length], half = (FURN_BOX[kind][2] / 2) / FURN_D + 10;
    if (!BUSY.some(([a, b]) => x + half > a && x - half < b)) out.push({ x, kind, seed: i * 13 + 5 });
    x += 100 + Math.floor(hash(i * 3.7) * 80); i++;
  }
  return out;
})();

/** One of the crowd: seeded (skin, hair, build, man or woman), standing facing out, `h` tall: a P&K tee, a poncho
 *  splattered red from the SPLASH ZONE, cat ears on a headband, a foam mallet up. */
const person = (g: Ctx, x: number, seed: number, h: number) => {
  const L = lookOf(seed), ink = D(INK);
  const shirt = ['#B01C22', '#1F1A24', '#E8B424', '#F4ECD8', '#2563EB', '#16A34A', '#7C3AED', '#F472B6'][((Math.floor(seed) % 8) + 8) % 8], pants = ['#1E3A8A', '#3F3F46', '#78716C', '#2563EB', '#111827'][((Math.floor(seed >> 2) % 5) + 5) % 5];
  const wide = L.heavy ? 1.3 : 0.88 + hash(seed * 1.3) * 0.2, sw = Math.round(h * 0.26 * wide), hd = Math.round(h * 0.14);
  const top = -h, headY = top + hd, shY = top + hd * 2 + 2, hipY = -h * 0.42;
  for (const s of [-1, 1]) { box(g, x + s * sw * 0.22 - 3, hipY, 6, -hipY - 3, ink); box(g, x + s * sw * 0.22 - 2, hipY, 4, -hipY - 3, D(pants)); box(g, x + s * sw * 0.22 - 4, -4, 8, 4, D(['#F8FAFC', '#111827', '#DC2626'][((Math.floor(seed) % 3) + 3) % 3])); }
  box(g, x - sw / 2 - 1, shY - 1, sw + 2, hipY - shY + 4, ink); box(g, x - sw / 2, shY, sw, hipY - shY + 2, D(shirt)); box(g, x - sw / 2, shY, 2, hipY - shY + 2, D(mix(shirt, '#FFFFFF', 0.3))); box(g, x + sw / 2 - 2, shY, 2, hipY - shY + 2, D(mix(shirt, INK, 0.3)));
  const style = seed % 4;
  if (style === 0) { g.fillStyle = D('#B01C22'); g.beginPath(); g.arc(x, shY + (hipY - shY) * 0.45, sw * 0.22, 0, Math.PI * 2); g.fill(); }
  else if (style === 1) { g.globalAlpha = 0.55; box(g, x - sw / 2 - 2, shY - 2, sw + 4, hipY - shY + 10, D('#E8F4FC')); g.globalAlpha = 1; for (let k = 0; k < 4; k++) box(g, x - sw / 2 + hash(seed + k) * sw, shY + hash(seed * 2 + k) * (hipY - shY), 3, 2, D('#C21E24')); }
  for (const s of [-1, 1]) { box(g, x + s * (sw / 2 + 1) - 2, shY + 1, 4, (hipY - shY) * 0.9, D(shirt)); box(g, x + s * (sw / 2 + 1) - 2, shY + (hipY - shY) * 0.9, 4, 4, D(L.skin)); }
  if (seed % 5 === 0) { box(g, x + sw / 2, shY - 18, 2, 20, D('#E8B424')); box(g, x + sw / 2 - 5, shY - 26, 12, 9, ink); box(g, x + sw / 2 - 4, shY - 25, 10, 7, D('#F97316')); }
  box(g, x - 2, shY - 3, 4, 3, D(L.skin));
  g.fillStyle = ink; g.beginPath(); g.ellipse(x, headY, hd * 0.75 + 1, hd + 1, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = D(L.skin); g.beginPath(); g.ellipse(x, headY, hd * 0.75, hd, 0, 0, Math.PI * 2); g.fill();
  box(g, x - hd * 0.4, headY - 1, 2, 2, ink); box(g, x + hd * 0.25, headY - 1, 2, 2, ink); box(g, x - 2, headY + hd * 0.45, 4, 1, D(mix(L.skin, INK, 0.4)));
  if (!L.bald) { g.fillStyle = D(L.hair); g.beginPath(); g.ellipse(x, headY - hd * 0.45, hd * 0.8, hd * 0.6, 0, Math.PI, 0); g.fill(); }
  if (L.face === 1 && !L.woman) box(g, x - 3, headY + hd * 0.3, 6, 2, D(L.hair));
  if (L.long) { box(g, x - hd * 0.8, headY - hd * 0.4, 3, hd * 1.6, D(L.hair)); box(g, x + hd * 0.8 - 3, headY - hd * 0.4, 3, hd * 1.6, D(L.hair)); }
  if (seed % 6 === 1) for (const s of [-1, 1]) polyF(g, [[x + s * hd * 0.7, headY - hd * 0.6], [x + s * hd * 0.55, headY - hd * 1.5], [x + s * hd * 0.15, headY - hd * 0.9]], D(seed % 4 ? '#EA8A2E' : '#A8A29E'));
};
const paintFurn = (g: Ctx, kind: Furn, seed: number) => {
  const ink = D(INK);
  switch (kind) {
    case 'bin': {
      // (FEED KICKY: a grey trash can with his face, the lid his open mouth with the buck teeth, the ears up)
      const M = DR(['#3A3430', '#5A524C', '#7E766E', '#A8A29E', '#CCC8C2', '#EEEBE6']);
      for (const s of [-1, 1]) { g.fillStyle = ink; g.beginPath(); g.arc(s * 14, -60, 11, 0, Math.PI * 2); g.fill(); ballR(g, s * 14, -60, 10, M); g.fillStyle = D('#F9A8D4'); g.beginPath(); g.arc(s * 14 + 1, -59, 6, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = ink; g.beginPath(); g.moveTo(-18, 0); g.lineTo(-20, -48); g.quadraticCurveTo(0, -58, 20, -48); g.lineTo(18, 0); g.closePath(); g.fill();
      g.fillStyle = M[3]; g.beginPath(); g.moveTo(-16, -1); g.lineTo(-18, -47); g.quadraticCurveTo(0, -56, 18, -47); g.lineTo(16, -1); g.closePath(); g.fill();
      box(g, -16, -46, 5, 44, M[4]); box(g, 9, -46, 7, 44, M[1]);
      g.fillStyle = ink; g.beginPath(); g.ellipse(0, -36, 12, 8, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = D('#3A0A14'); g.beginPath(); g.ellipse(0, -36, 10, 6, 0, 0, Math.PI * 2); g.fill();
      box(g, -4, -42, 4, 6, D('#FFFFFF')); box(g, 0, -42, 4, 6, D('#FFFFFF')); box(g, 0, -42, 1, 6, ink);
      for (const s of [-1, 1]) { ballR(g, s * 6, -48, 3, DR(['#8A8A8A', '#B0B0B0', '#D8D8D8', '#FFFFFF', '#FFFFFF', '#FFFFFF'])); box(g, s * 6, -48, 1, 2, ink); }
      g.fillStyle = D('#EC4899'); g.beginPath(); g.arc(0, -44, 2, 0, Math.PI * 2); g.fill();
      signText(g, 'FEED KICKY', 0, -12, small(D('#F4ECD8'), ink));
      break;
    }
    case 'bench': {
      // (a bench made of giant bones: two for the seat, the back, the legs crossed)
      const B = DR(BONE);
      for (const s of [-1, 1]) { bone(g, s * 30 - 8, -2, s * 30 + 8, -28, 5, B); bone(g, s * 30 + 8, -2, s * 30 - 8, -28, 5, B); }
      bone(g, -40, -30, 40, -30, 7, B); bone(g, -40, -40, 40, -40, 5, B);
      skull(g, 0, -40, 6, B);
      break;
    }
    case 'queue': {
      // (the queue maze's rails, the crowd behind them, seeded; a SPLASH ZONE sign on a post)
      for (let k = 0; k < 7; k++) person(g, -66 + k * 22 + (hash(seed + k) - 0.5) * 6, seed * 13 + k * 7, 52 + Math.floor(hash(seed * 3 + k) * 26));
      const St = DR(['#2A0406', '#4E080C', '#7A0E14', '#B01C22', '#DC3A3A', '#F88A80']);
      for (let k = -76; k <= 76; k += 38) { postR(g, k, -40, 0, 5, St); box(g, k - 6, -3, 12, 3, St[1]); ballR(g, k, -42, 3, DR(BONE)); }
      g.strokeStyle = ink; g.lineWidth = 3; g.beginPath(); g.moveTo(-76, -36); for (let k = -76; k < 76; k += 38) g.quadraticCurveTo(k + 19, -26, k + 38, -36); g.stroke();
      g.strokeStyle = D('#E8B424'); g.lineWidth = 1.5; g.stroke();
      postR(g, 70, -92, 0, 3, DR(TAR)); box(g, 52, -94, 38, 16, ink); box(g, 53, -93, 36, 14, D('#E8B424')); signText(g, 'SPLASH', 71, -85, small(D('#B01C22'))); box(g, 53, -80, 36, 2, D('#B01C22'));
      break;
    }
    case 'snocone': {
      // (CHERRY GORE sno-cones: a cart, its striped canopy, the shaved ice in its window, syrups, a cone dripping)
      const C = DR(CREAM), R = DR(BLOOD);
      for (const s of [-1, 1]) box(g, s * 40 - 2, -110, 4, 70, D('#D4D4D8'));
      box(g, -50, -116, 100, 10, ink); for (let k = -48; k < 48; k += 12) box(g, k, -115, 6, 8, D(k % 24 ? '#F4ECD8' : '#B01C22'));
      for (let k = -48; k < 48; k += 12) { g.fillStyle = D((k + 48) % 24 ? '#F4ECD8' : '#B01C22'); g.beginPath(); g.arc(k + 6, -106, 6, 0, Math.PI); g.fill(); }
      box(g, -46, -44, 92, 34, ink); box(g, -44, -42, 88, 30, C[3]); box(g, -44, -42, 88, 3, C[5]); box(g, -44, -15, 88, 3, C[1]);
      box(g, -40, -76, 40, 32, ink); box(g, -39, -75, 38, 30, D('#DCECF4')); for (let k = 0; k < 8; k++) box(g, -36 + hash(seed + k) * 30, -70 + hash(k) * 22, 3, 2, D('#FFFFFF'));
      for (let k = 0; k < 3; k++) { box(g, 6 + k * 12, -62, 8, 18, ink); box(g, 7 + k * 12, -61, 6, 16, D(['#C21E24', '#7A0E14', '#E8474A'][k])); box(g, 8 + k * 12, -66, 4, 4, ink); }
      signText(g, 'CHERRY GORE', 0, -26, small(R[3], ink));
      signText(g, 'SNO-CONES', 0, -17, small(D('#1F1A24')));
      for (const wx of [-30, 30]) { ballR(g, wx, -8, 8, DR(TAR)); ballR(g, wx, -8, 3, DR(CONCRETE), false); }
      polyF(g, [[34, -72], [44, -72], [39, -56]], D('#E4BC6E')); ballR(g, 39, -76, 6, R); box(g, 38, -70, 2, 6, R[3]);
      break;
    }
    case 'balloons': {
      // (a balloon seller (seeded), a bunch of cat and mouse heads on strings over her or him)
      person(g, 0, seed * 7 + 3, 72);
      const tops: [number, number, boolean][] = [[-26, -170, true], [-6, -182, false], [14, -168, true], [30, -150, false], [-18, -140, false], [6, -150, true]];
      g.strokeStyle = D('#F4ECD8'); g.lineWidth = 1;
      for (const [bx, by] of tops) { g.beginPath(); g.moveTo(10, -46); g.quadraticCurveTo(bx * 0.4 + 8, (by - 46) / 2, bx, by + 12); g.stroke(); }
      for (const [bx, by, cat] of tops) { g.save(); g.translate(bx, by); g.scale(0.5, 0.5); (cat ? catHead : mouseHead)(g, 0, 0, 22, 0); g.restore(); }
      haze(g, -40, -190, 80, 70, 0.16);
      break;
    }
    case 'board': {
      // (the photo board on its legs: the cat and the mouse painted, holes where the faces were)
      const P = DR(CREAM);
      for (const s of [-1, 1]) { box(g, s * 40 - 3, -20, 6, 20, ink); box(g, s * 40 - 2, -20, 4, 20, D('#8A5A2A')); }
      box(g, -56, -126, 112, 108, ink); box(g, -54, -124, 108, 104, D('#7DD3FC')); box(g, -54, -40, 108, 20, D('#86EFAC')); box(g, -54, -124, 108, 2, P[5]);
      for (const [hx, cat] of [[-26, true], [26, false]] as [number, boolean][]) {
        box(g, hx - 14, -76, 28, 40, D(cat ? '#EA8A2E' : '#A8A29E')); box(g, hx - 14, -76, 4, 40, D(cat ? '#F8B060' : '#CCC8C2'));
        for (const s of [-1, 1]) { if (cat) polyF(g, [[hx + s * 14, -96], [hx + s * 12, -114], [hx + s * 2, -104]], D('#EA8A2E')); else { g.fillStyle = D('#A8A29E'); g.beginPath(); g.arc(hx + s * 14, -110, 10, 0, Math.PI * 2); g.fill(); g.fillStyle = D('#F9A8D4'); g.beginPath(); g.arc(hx + s * 14, -110, 6, 0, Math.PI * 2); g.fill(); } }
        g.fillStyle = D('#0A0A0A'); g.beginPath(); g.ellipse(hx, -94, 12, 14, 0, 0, Math.PI * 2); g.fill();
      }
      mallet(g, -44, -40, -0.5, 22, 10); g.save(); g.scale(-1, 1); mallet(g, -44, -40, -0.5, 22, 10); g.restore();
      signText(g, 'YOUR FACE HERE', 0, -26, small(D('#B01C22'), D('#F4ECD8')));
      break;
    }
    case 'topiary': {
      // (a hedge cut into the two of them, mallets up; a planter; a little sign)
      const Gn = DR(GRASSY);
      box(g, -50, -22, 100, 22, ink); box(g, -48, -20, 96, 20, D('#B4542A')); box(g, -48, -20, 96, 3, D('#D47C3E'));
      const lump = (x: number, y: number, rx: number, ry: number) => eggR(g, x, y, rx, ry, Gn, true);
      lump(-24, -50, 16, 28); lump(-24, -92, 18, 16); for (const s of [-1, 1]) lump(-24 + s * 12, -110, 5, 9);
      lump(24, -46, 14, 24); lump(24, -84, 15, 13); for (const s of [-1, 1]) lump(24 + s * 14, -100, 9, 9);
      g.save(); g.translate(-10, -110); g.rotate(0.6); box(g, -2, -24, 4, 24, Gn[1]); eggR(g, 0, -28, 10, 7, Gn, true); g.restore();
      g.save(); g.translate(10, -100); g.rotate(-0.6); box(g, -2, -24, 4, 24, Gn[1]); eggR(g, 0, -28, 10, 7, Gn, true); g.restore();
      break;
    }
    case 'gnome': {
      // (a garden gnome with an axe in his head, a splat down his beard)
      const R = DR(BLOOD);
      g.fillStyle = ink; g.beginPath(); g.moveTo(-12, 0); g.lineTo(-10, -22); g.lineTo(10, -22); g.lineTo(12, 0); g.closePath(); g.fill(); box(g, -10, -21, 20, 20, D('#2563EB')); box(g, -10, -21, 4, 20, D('#60A5FA'));
      polyF(g, [[-8, -22], [8, -22], [0, -6]], D('#F4F0EC')); eggR(g, 0, -28, 7, 6, DR(['#7A4A3A', '#A0645A', '#C8846E', '#E8A890', '#F4C8B4', '#FFE8DC']), true);
      polyF(g, [[-8, -32], [8, -32], [0, -50]], ink); polyF(g, [[-6, -33], [6, -33], [0, -48]], R[3]);
      g.save(); g.translate(3, -44); g.rotate(0.6); box(g, -1, -18, 3, 18, D('#8A5A2A')); polyF(g, [[-6, 0], [6, 0], [4, 6], [-4, 6]], D('#C8C8D4')); g.restore();
      gore(g, 0, -38, 3, seed, R); box(g, -1, -34, 2, 12, R[3]);
      break;
    }
    case 'hydrant': {
      const R = DR(['#2A0406', '#4E080C', '#7A0E14', '#B01C22', '#DC3A3A', '#F88A80']);
      box(g, -10, -30, 20, 30, ink); box(g, -9, -29, 18, 29, R[3]); box(g, -9, -29, 4, 29, R[4]); box(g, 4, -29, 5, 29, R[1]);
      g.fillStyle = ink; g.beginPath(); g.ellipse(0, -30, 11, 8, 0, Math.PI, 0); g.fill(); g.fillStyle = R[3]; g.beginPath(); g.ellipse(0, -30, 9, 6, 0, Math.PI, 0); g.fill();
      for (const s of [-1, 1]) { box(g, s * 10 - (s > 0 ? 0 : 6), -20, 6, 8, ink); box(g, s * 10 - (s > 0 ? -1 : 5), -19, 4, 6, R[2]); }
      box(g, -12, -2, 24, 2, ink);
      g.fillStyle = 'rgba(176,28,34,0.35)'; g.beginPath(); g.ellipse(10, 0, 14, 3, 0, 0, Math.PI * 2); g.fill();
      break;
    }
    case 'phone': {
      const St = DR(CONCRETE);
      postR(g, 0, -60, 0, 6, DR(TAR));
      box(g, -16, -108, 32, 52, ink); box(g, -14, -106, 28, 48, St[3]); box(g, -14, -106, 4, 48, St[4]); box(g, 8, -106, 6, 48, St[1]);
      box(g, -18, -112, 36, 8, ink); box(g, -16, -110, 32, 4, D('#B01C22')); signText(g, 'PHONE', 0, -105, { sx: 1, sy: 1, fill: D('#FFFFFF') });
      for (let k = 0; k < 12; k++) box(g, -8 + (k % 3) * 5, -96 + Math.floor(k / 3) * 6, 3, 3, D('#1F2937'));
      g.strokeStyle = ink; g.lineWidth = 1; g.beginPath(); g.moveTo(10, -70); g.quadraticCurveTo(14, -50, 6, -40); g.stroke(); box(g, 2, -42, 8, 4, ink);
      break;
    }
    case 'kiosk': {
      // (a poster kiosk on its legs: two P&K posters, a STUPID DAD LIVE! bill, a cap on top)
      const T3 = DR(TAR);
      for (const s of [-1, 1]) postR(g, s * 24, -20, 0, 5, T3);
      box(g, -32, -136, 64, 118, ink); box(g, -30, -134, 60, 114, T3[3]);
      pkPosterArt(g, -24, -128, seed % 4);
      box(g, -26, -62, 52, 38, D('#5EB4F4')); box(g, -26, -62, 52, 8, D('#FDE047')); signText(g, 'STUPID DAD', 0, -56, small(D('#B01C22'))); g.fillStyle = D('#F4B8A0'); g.beginPath(); g.arc(-8, -40, 7, 0, Math.PI * 2); g.fill(); box(g, -18, -34, 20, 8, D('#F8FAFC')); box(g, 6, -48, 5, 10, D('#DC2626'));
      polyF(g, [[-36, -136], [0, -150], [36, -136]], ink); polyF(g, [[-33, -137], [0, -147], [33, -137]], D('#B01C22'));
      break;
    }
    default: {
      // (a red puff tree in a bone planter)
      const R = DR(['#2A0406', '#4E080C', '#7A0E14', '#B01C22', '#DC3A3A', '#F88A80']), B = DR(BONE);
      box(g, -26, -28, 52, 28, ink); box(g, -24, -26, 48, 26, B[3]); box(g, -24, -26, 6, 26, B[4]); box(g, 16, -26, 8, 26, B[1]);
      for (let k = -18; k < 20; k += 12) skull(g, k + 3, -14, 4, B, B[0], false);
      box(g, -3, -100, 6, 72, ink); box(g, -2, -100, 4, 72, D('#6A4A3A')); box(g, -2, -100, 1, 72, D('#8A6A4A'));
      for (const [dx, dy, r] of [[0, -128, 30], [-20, -112, 18], [22, -110, 18], [-8, -150, 16], [14, -146, 14]] as [number, number, number][]) eggR(g, dx, dy, r, r * 0.85, R, true);
      break;
    }
  }
};
/** The street's furniture on the path. */
export const drawFurniture = (c: Ctx, v: View) => {
  for (const it of FURN) {
    const bx = FURN_BOX[it.kind], x = X(it.x);
    if (!seen(v, x + bx[0], x + bx[0] + bx[2], FURN_D, 40)) continue;
    stillAt(c, v, FURN_D, `pk-furn-${it.kind}-${it.seed}-${lit() ? 1 : 0}`, x, GY, bx[0], bx[1], bx[2], bx[3], g => paintFurn(g, it.kind, it.seed));
  }
};
/** The street's lights after dark (the fronts' windows and grills, the sno-cone cart). */
export const backLamps = (v: View): Light[] => {
  const out: Light[] = [];
  for (const f of FRONTS) {
    const [x, y] = at(v.eye, X(f.x + 100), GY - 60, FRONT_D);
    if (x > v.cam.x - 200 && x < v.cam.x + 1000) out.push({ x, y, r: 80, a: 0.3, color: f.shop === 'grill' ? '#FDBA74' : f.shop === 'blood' ? '#FCA5A5' : '#FFC870' });
  }
  for (const it of FURN) {
    if (it.kind !== 'snocone') continue;
    const [x, y] = at(v.eye, X(it.x), GY - 60, FURN_D);
    if (x > v.cam.x - 200 && x < v.cam.x + 1000) out.push({ x, y, r: 70, a: 0.4, color: '#FFE4E4' });
  }
  return out;
};
