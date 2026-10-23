// THE BIG-KID ZONE's street, back from the play plane (the land's one eye: kit.ts's view). Dimmed a step toward the air,
// none of it to stand on:
//
//   THE FRONTS     the zone's show buildings at FRONT_D, boxy and straight (the 90s "extreme" look, not the square's
//                  wobble), their sides going back to BACK_D where the eye's past an end: Memphis squiggles, zigzag
//                  bands, triangles and confetti up the walls, neon tubes along the parapets (lit hard after dark),
//                  graffiti tags low down, posters pasted up; at street level, a business each: the GAME ZONE arcade
//                  (cabinet screens glowing in the dark), SLIME TIME snacks (the menu board, glop drinks), RAD RAT'S
//                  SKATE SHOP (decks racked in the window), RIDE PHOTOS (screens of riders screaming), DUDES / BETTIES
//                  restrooms, LOCKERS, T-SHIRTS (NO FEAR), OUCH! (first aid, a band-aid), PIZZA PIT, a ride's
//                  show building (its roll-up door, KEEP CLEAR); AC units, vents, satellite dishes, ladders.
//   THE ALLEY      asphalt behind them, a painted line, chain-link.
//   THE CONCRETE   skate-park slabs coming toward him from the fronts, their joints running back to the eye, gum,
//                  oil stains, painted lightning bolts; a gutter along the fronts' feet. Over a glop pit, the halfpipe
//                  or the rink, it stops at their back edge.
//   THE FURNITURE  neon lamp posts (lit after dark), GLOP IT! bins (Gloppy's open mouth), soda machines glowing,
//                  picnic tables under striped umbrellas, palms in neon planters, payphones, souvenir carts (foam
//                  fingers, slap bracelets), queue rails with the crowd behind them (seeded kids and grown-ups in 1994's
//                  clothes: flannel, overalls, windbreakers, backwards caps, scrunchies), concrete benches.

import type { Light } from '../../../m1/game/render/lighting';
import { signText, type Look } from '../../signLetters';
import { lookOf } from '../../adventure/temple/people';
import {
  type Ctx, type View, INK, box, mix, hash, checker, at, stillAt, seen, polyF, sideBack, ramp6, rampH, dimmed, lit,
  FRONT_D, BACK_D, eggR, ballR, postR, candyStroke,
} from '../kit';
import { GY } from '../geometry';
import { X, PITS, PIPE, RINK } from './layout';

/** Where the furniture stands (its feet), how far back the pits' and the pipe's back rims are, the rink's back fence. */
export const FURN_D = 0.95, PIT_D = 0.93, PIPE_D = 0.9, RINK_D = 0.9;

type Shop = 'arcade' | 'snack' | 'skate' | 'photo' | 'rest' | 'lockers' | 'tees' | 'ouch' | 'pizza' | 'show';
interface Front { x: number; w: number; h: number; shop: Shop; seed: number }
const SHOPS: Shop[] = ['show', 'arcade', 'snack', 'tees', 'skate', 'rest', 'photo', 'show', 'pizza', 'lockers', 'ouch', 'arcade', 'snack', 'show', 'skate', 'photo', 'tees', 'pizza'];
/** The fronts, all along (x from the section's start). */
export const FRONTS: Front[] = (() => {
  const out: Front[] = [];
  let x = -620, i = 0;
  while (x < 12500) {
    const seed = i * 17 + 3, w = 170 + Math.floor(hash(seed) * 120);
    out.push({ x, w, h: 170 + Math.floor(hash(seed * 3) * 130), shop: SHOPS[i % SHOPS.length], seed });
    x += w + 16 + Math.floor(hash(seed * 7) * 30); i++;
  }
  return out;
})();
const WALLS = ['#B9A4F0', '#7EE0D2', '#F8A8D0', '#FCE07A', '#9CC4F6', '#FDB98A', '#C4F07A', '#F4F0E4'];
const BANDS = ['#7C3AED', '#0D9488', '#DB2777', '#EA580C', '#2563EB', '#65A30D', '#1F2937'];
const NEON = ['#F472B6', '#22D3EE', '#A3E635', '#FDE047', '#C084FC'];
const wallOf = (f: Front) => WALLS[((Math.floor(f.seed) % WALLS.length) + WALLS.length) % WALLS.length];
const bandOf = (f: Front) => BANDS[((Math.floor(f.seed * 3) % BANDS.length) + BANDS.length) % BANDS.length];
const D = (col: string) => dimmed(col);
const DR = (col: string) => rampH(ramp6(col), true);
const sm = (fill: string | string[], ink?: string, slant = 0): Look => ({ sx: 1, sy: 1, bold: true, fill, ink, slant });

// ---------------------------------------------------------------------------------------------------------------
// The fronts

/** A neon tube (a stroke): a dark tube by day, lit and haloed after dark. */
const tube = (g: Ctx, path: () => void, col: string, w = 2) => {
  g.lineCap = 'round'; g.lineJoin = 'round';
  if (lit()) { g.beginPath(); path(); g.strokeStyle = mix(col, '#000000', 0.2); g.globalAlpha = 0.35; g.lineWidth = w + 5; g.stroke(); g.globalAlpha = 1; g.strokeStyle = mix(col, '#FFFFFF', 0.45); g.lineWidth = w; g.stroke(); g.strokeStyle = '#FFFFFF'; g.lineWidth = 1; g.stroke(); }
  else { g.beginPath(); path(); g.strokeStyle = D(INK); g.lineWidth = w + 2; g.stroke(); g.strokeStyle = D(col); g.lineWidth = w; g.stroke(); }
};
/** A lit window's glass (warm after dark, sky by day), in bands. */
const glass = (g: Ctx, x: number, y: number, w: number, h: number) => {
  const G = lit() ? ['#4A2208', '#8A4A10', '#D08A24', '#F6BE48'] : ['#1E3A5A', '#2E5A86', '#4A84B4', '#74AED8'];
  for (let i = 0; i < 4; i++) box(g, x, y + (h * i) / 4, w, Math.ceil(h / 4) + 1, D(G[3 - i]));
  checker(g, x, y + h / 2, w, 2, D(G[1]), 0, 1);
  g.fillStyle = 'rgba(255,255,255,0.22)'; g.beginPath(); g.moveTo(x + w * 0.15, y); g.lineTo(x + w * 0.35, y); g.lineTo(x + w * 0.1, y + h); g.lineTo(x - w * 0.1, y + h); g.closePath(); g.fill();
};
/** A graffiti tag: a fat looping scrawl, an outline in another color. */
const tag = (g: Ctx, x: number, y: number, seed: number) => {
  const a = NEON[((Math.floor(seed) % NEON.length) + NEON.length) % NEON.length], b = ['#1F2937', '#FFFFFF', '#7C3AED'][((Math.floor(seed) % 3) + 3) % 3];
  const path = () => { g.moveTo(x, y); for (let k = 1; k <= 6; k++) g.quadraticCurveTo(x + k * 9 - 5, y - 14 + (hash(seed + k) * 10), x + k * 9, y - (k % 2) * 6); };
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); path(); g.strokeStyle = D(b); g.lineWidth = 6; g.stroke();
  g.beginPath(); path(); g.strokeStyle = D(a); g.lineWidth = 3; g.stroke();
  box(g, x + 56, y - 10, 3, 3, D(a)); box(g, x + 60, y - 4, 2, 6, D(a));
};
/** A little DAD MAN poster pasted up (the show's: blue, the dad on his couch, a beer up), aged. */
const miniPoster = (g: Ctx, x: number, y: number, look: number) => {
  const P = look === 0 ? '#5EB4F4' : mix('#5EB4F4', '#F0E8D8', 0.5);
  box(g, x - 1, y - 1, 30, 40, D(INK)); box(g, x, y, 28, 38, D(P));
  box(g, x + 3, y + 22, 22, 8, D('#C2410C')); g.fillStyle = D('#F4B8A0'); g.beginPath(); g.arc(x + 12, y + 17, 5, 0, Math.PI * 2); g.fill(); box(g, x + 7, y + 21, 10, 6, D('#F8FAFC')); box(g, x + 17, y + 13, 3, 6, D('#DC2626'));
  box(g, x, y + 31, 28, 7, D('#1E3A8A')); box(g, x + 3, y + 2, 22, 5, D('#FDE047'));
  if (look === 2) { g.save(); g.translate(x + 14, y + 19); g.rotate(-0.5); box(g, -18, -3, 36, 6, D('#DC2626')); g.restore(); }
  if (look === 3) { g.fillStyle = D(mix(P, '#F0E8D8', 0.6)); g.beginPath(); g.moveTo(x + 28, y); g.lineTo(x + 14, y); g.lineTo(x + 28, y + 16); g.closePath(); g.fill(); }
};
const paintFront = (g: Ctx, f: Front) => {
  const w = f.w, h = f.h, R = DR(wallOf(f)), B = DR(bandOf(f)), ink = D(INK);
  // (the wall: inked, stepped across (lit down its left, shaded down its right, dithered), a darker foot)
  box(g, -2, -h - 2, w + 4, h + 2, ink);
  box(g, 0, -h, w, h, R[3]); box(g, 0, -h, 6, h, R[4]); box(g, 0, -h, 2, h, R[5]);
  box(g, w - 18, -h, 18, h, R[2]); checker(g, w - 20, -h, 2, h, R[2], 0, 1); box(g, w - 6, -h, 6, h, R[1]);
  box(g, 0, -14, w, 14, R[1]); checker(g, 0, -16, w, 2, R[1], 1, 1);
  // (the Memphis band up top: a zigzag in the band color, squiggles, triangles, confetti)
  const zy = -h + 34;
  for (let k = 0; k < w; k += 2) { const z = Math.abs(((k / 2 + f.seed) % 14) - 7); box(g, k, zy + z, 2, 10, B[3]); box(g, k, zy + z, 2, 2, B[4]); box(g, k, zy + z + 8, 2, 2, B[1]); }
  g.strokeStyle = D(['#1F2937', '#DB2777', '#0D9488', '#7C3AED'][((Math.floor(f.seed) % 4) + 4) % 4]); g.lineWidth = 3; g.lineCap = 'round'; g.beginPath();
  for (let k = 0; k <= 10; k++) { const sx = 10 + (k * (w - 20)) / 10, sy = -h + 70 + (k % 2 ? -7 : 7); if (k) g.lineTo(sx, sy); else g.moveTo(sx, sy); } g.stroke();
  for (let k = 0; k < 5; k++) { const C = DR(['#F97316', '#7C3AED', '#22D3EE', '#EC4899', '#FDE047'][((Math.floor(k + f.seed) % 5) + 5) % 5]), tx = 12 + hash(f.seed * 3 + k) * (w - 40), ty = -h + 84 + hash(f.seed + k * 5) * Math.max(10, h - 200); polyF(g, [[tx, ty], [tx + 16, ty + 5], [tx + 5, ty + 18]], ink); polyF(g, [[tx + 2, ty + 2], [tx + 13, ty + 6], [tx + 6, ty + 15]], C[3]); polyF(g, [[tx + 2, ty + 2], [tx + 8, ty + 4], [tx + 4, ty + 9]], C[4]); }
  for (let k = 0; k < 22; k++) box(g, 4 + hash(f.seed + k * 7) * (w - 10), -h + 50 + hash(f.seed * 2 + k) * Math.max(10, h - 150), k % 3 ? 4 : 2, k % 3 ? 2 : 4, D(NEON[k % NEON.length]));
  // (the parapet: coping lit along its top (dimmed: not to stand on), a neon tube along under it)
  box(g, -6, -h - 12, w + 12, 12, ink); box(g, -4, -h - 10, w + 8, 8, B[3]); box(g, -4, -h - 10, w + 8, 2, B[4]); box(g, -4, -h - 4, w + 8, 2, B[1]);
  tube(g, () => { g.moveTo(4, -h + 8); g.lineTo(w - 4, -h + 8); }, NEON[((Math.floor(f.seed + 1) % NEON.length) + NEON.length) % NEON.length]);
  // (roof junk: an AC unit, a vent, a satellite dish, a ladder up the side)
  if (f.seed % 3 !== 1) { const ax = w * 0.62; box(g, ax - 1, -h - 30, 38, 20, ink); box(g, ax, -h - 29, 36, 18, D('#A8A8BC')); box(g, ax, -h - 29, 36, 2, D('#D8D8E4')); for (let k = 0; k < 6; k++) box(g, ax + 3 + k * 5, -h - 25, 3, 12, D('#6A6A80')); g.fillStyle = ink; g.beginPath(); g.arc(ax + 28, -h - 20, 6, 0, Math.PI * 2); g.fill(); }
  if (f.seed % 4 === 2) { g.fillStyle = ink; g.beginPath(); g.ellipse(w * 0.25, -h - 26, 14, 16, -0.6, 0, Math.PI * 2); g.fill(); g.fillStyle = D('#E4E4EC'); g.beginPath(); g.ellipse(w * 0.25, -h - 26, 12, 14, -0.6, 0, Math.PI * 2); g.fill(); g.fillStyle = D('#B8B8C8'); g.beginPath(); g.ellipse(w * 0.25 + 3, -h - 23, 7, 9, -0.6, 0, Math.PI * 2); g.fill(); box(g, w * 0.25 - 1, -h - 12, 3, 4, ink); }
  if (f.seed % 2) { box(g, w - 30, -h - 12, 2, h - 60, ink); box(g, w - 16, -h - 12, 2, h - 60, ink); for (let y = -h - 6; y < -72; y += 10) box(g, w - 30, y, 16, 2, ink); }
  // (graffiti tags low down; a few posters pasted up)
  if (f.seed % 3 === 0) tag(g, 10 + hash(f.seed) * (w - 90), -28, f.seed);
  if (f.seed % 2 === 0) { miniPoster(g, w - 58, -128, f.seed % 4); if (w > 220) miniPoster(g, w - 92, -122, (f.seed + 2) % 4); }
  // (the business at street level)
  shopFront(g, f, w, h);
};
const shopFront = (g: Ctx, f: Front, w: number, h: number) => {
  const ink = D(INK), sx = 18, sw = Math.min(w - 50, 190), top = -118;
  const sign = (text: string, col: string, sub?: string) => {
    const bw = Math.min(w - 24, Math.max(90, text.length * 9 + 24)), bx = 12;
    // (a jagged board on two brackets, the letters slanted)
    box(g, bx + 10, top - 6, 3, 8, ink); box(g, bx + bw - 13, top - 6, 3, 8, ink);
    polyF(g, [[bx - 3, top - 36], [bx + bw * 0.3, top - 41], [bx + bw * 0.6, top - 35], [bx + bw + 3, top - 40], [bx + bw + 5, top - 3], [bx + bw * 0.5, top + 1], [bx - 4, top - 4]], ink);
    const C = DR(col);
    polyF(g, [[bx, top - 33], [bx + bw * 0.3, top - 38], [bx + bw * 0.6, top - 32], [bx + bw, top - 37], [bx + bw + 2, top - 5], [bx + bw * 0.5, top - 2], [bx - 1, top - 6]], C[3]);
    polyF(g, [[bx, top - 33], [bx + bw * 0.3, top - 38], [bx + bw * 0.6, top - 32], [bx + bw, top - 37], [bx + bw, top - 33], [bx + bw * 0.6, top - 28], [bx + bw * 0.3, top - 34], [bx, top - 29]], C[4]);
    polyF(g, [[bx - 1, top - 10], [bx + bw * 0.5, top - 6], [bx + bw + 2, top - 9], [bx + bw + 2, top - 5], [bx + bw * 0.5, top - 2], [bx - 1, top - 6]], C[1]);
    signText(g, text, bx + bw / 2, top - (sub ? 18 : 13), { sx: 1, sy: sub ? 1 : 2, bold: true, slant: 1, fill: [D('#FFFFFF'), D('#FEF08A')], ink, shadow: D('#2A0E3A'), drop: 1 });
    if (sub) signText(g, sub, bx + bw / 2, top - 8, sm(D('#FDE047')));
  };
  // (the storefront's frame; an awning on most)
  const frame = () => { box(g, sx - 3, top - 3, sw + 6, -top + 3, ink); };
  const awning = (a: string, b: string) => {
    box(g, sx - 8, top - 2, sw + 16, 4, ink);
    for (let k = 0; k < sw + 12; k += 12) { box(g, sx - 6 + k, top + 2, 6, 14, D(a)); box(g, sx + k, top + 2, 6, 14, D(b)); }
    for (let k = 0; k < sw + 12; k += 12) { g.fillStyle = D(k % 24 ? b : a); g.beginPath(); g.arc(sx + k, top + 16, 6, 0, Math.PI); g.fill(); }
    box(g, sx - 6, top + 2, sw + 12, 2, D('#FFFFFF'));
  };
  switch (f.shop) {
    case 'arcade': {
      sign('GAME ZONE', '#1E1B4B', 'TOKENS 4 FOR $1');
      frame(); box(g, sx, top, sw, -top, D('#0E0A1E'));
      // (cabinets in the dark, their screens glowing, marquees lit)
      for (let k = 0; k < Math.floor(sw / 30); k++) { const cx = sx + 6 + k * 30, scr = ['#22D3EE', '#F472B6', '#A3E635', '#FDE047'][((Math.floor(k + f.seed) % 4) + 4) % 4]; box(g, cx, top + 30, 22, -top - 30, D('#2A2440')); box(g, cx, top + 30, 22, 8, D(scr)); box(g, cx + 3, top + 44, 16, 14, D(mix(scr, '#000000', 0.4))); box(g, cx + 5, top + 46, 12, 10, D(scr)); box(g, cx + 6, top + 47, 4, 2, D('#FFFFFF')); box(g, cx + 2, top + 62, 18, 6, D('#3A3458')); box(g, cx + 6, top + 63, 2, 3, D('#DC2626')); box(g, cx + 12, top + 64, 3, 3, D('#FDE047')); }
      tube(g, () => { g.rect(sx + 2, top + 4, sw - 4, 18); }, '#C084FC');
      signText(g, 'INSERT COIN', sx + sw / 2, top + 17, sm(lit() ? '#FDE047' : D('#FDE047')));
      break;
    }
    case 'snack': case 'pizza': {
      const pizza = f.shop === 'pizza';
      sign(pizza ? 'PIZZA PIT' : 'SLIME TIME SNACKS', pizza ? '#B91C1C' : '#15803D', pizza ? 'BY THE SLICE!' : undefined);
      awning(pizza ? '#B91C1C' : '#65A30D', '#FFFFFF');
      frame(); glass(g, sx, top + 18, sw, 50);
      // (the counter, the menu board in the window)
      box(g, sx, top + 68, sw, -top - 68, D(pizza ? '#7C2D12' : '#166534')); box(g, sx, top + 68, sw, 3, D('#F4F0E4'));
      box(g, sx + 10, top + 24, 70, 36, ink); box(g, sx + 11, top + 25, 68, 34, D('#1F2937'));
      const items = pizza ? ['CHEESE  $3', 'PEPP    $4', 'GARLIC  $2'] : ['GLOP DOG  $4', 'SLURPEE  $2', 'NACHOS   $5'];
      items.forEach((t, i) => signText(g, t, sx + 45, top + 36 + i * 9, { sx: 1, sy: 1, fill: D(i ? '#FFFFFF' : '#FDE047'), gap: 0, space: 2 }));
      if (pizza) { g.fillStyle = D('#E8B060'); g.beginPath(); g.moveTo(sx + sw - 50, top + 26); g.lineTo(sx + sw - 14, top + 26); g.lineTo(sx + sw - 32, top + 60); g.closePath(); g.fill(); g.fillStyle = D('#FCD84A'); g.beginPath(); g.moveTo(sx + sw - 47, top + 30); g.lineTo(sx + sw - 17, top + 30); g.lineTo(sx + sw - 32, top + 56); g.closePath(); g.fill(); for (const [px2, py2] of [[-36, 36], [-26, 40], [-32, 48]]) { g.fillStyle = D('#B91C1C'); g.beginPath(); g.arc(sx + sw + px2, top + py2, 3, 0, Math.PI * 2); g.fill(); } }
      else for (let k = 0; k < 3; k++) { const cx = sx + sw - 70 + k * 22; box(g, cx, top + 34, 14, 26, ink); box(g, cx + 1, top + 35, 12, 24, D('#84CC16')); box(g, cx + 1, top + 35, 12, 6, D('#F4F0E4')); box(g, cx + 8, top + 26, 2, 10, D('#F472B6')); box(g, cx + 2, top + 44, 3, 12, D('#BEF264')); }
      break;
    }
    case 'skate': {
      sign("RAD RAT'S SKATE SHOP", '#7C3AED');
      frame(); glass(g, sx, top, sw, -top - 20);
      // (decks racked in the window, on their tails, each its own graphic)
      for (let k = 0; k < Math.floor((sw - 10) / 18); k++) { const dx = sx + 8 + k * 18, col = ['#EC4899', '#FDE047', '#22D3EE', '#84CC16', '#F97316', '#7C3AED'][((Math.floor(k + f.seed) % 6) + 6) % 6], C = DR(col); box(g, dx - 1, top + 10, 14, 76, ink); box(g, dx, top + 11, 12, 74, C[3]); box(g, dx, top + 11, 3, 74, C[4]); box(g, dx + 9, top + 11, 3, 74, C[1]); g.fillStyle = D(['#FFFFFF', '#1F2937', '#DC2626'][k % 3]); g.beginPath(); g.arc(dx + 6, top + 40 + (k % 3) * 8, 4, 0, Math.PI * 2); g.fill(); box(g, dx + 2, top + 18, 8, 3, D('#1F2937')); }
      box(g, sx, -20, sw, 20, D('#3F3F46')); box(g, sx, -20, sw, 2, D('#71717A'));
      break;
    }
    case 'photo': {
      sign('RIDE PHOTOS', '#0E7490', 'SEE YOURSELF SCREAM!');
      frame(); box(g, sx, top, sw, -top, D('#1E293B'));
      // (the screens: riders screaming, a barf bucket, a couch), the counter
      for (let k = 0; k < Math.floor(sw / 44); k++) {
        const tx = sx + 6 + k * 44; box(g, tx, top + 8, 38, 30, D('#0F172A')); box(g, tx + 2, top + 10, 34, 26, D(['#7DD3FC', '#FDE68A', '#F9A8D4'][k % 3]));
        for (let p = 0; p < 2; p++) { const L = lookOf(f.seed * 7 + k * 3 + p); const hx = tx + 11 + p * 14; g.fillStyle = D(L.skin); g.beginPath(); g.arc(hx, top + 24, 5, 0, Math.PI * 2); g.fill(); box(g, hx - 5, top + 18, 10, 3, D(L.hair)); box(g, hx - 2, top + 25, 4, 4, D('#7F1D1D')); box(g, hx - 6, top + 30, 12, 6, D(['#DC2626', '#2563EB', '#16A34A'][(k + p) % 3])); }
        box(g, tx + 2, top + 10, 6, 2, D('#FFFFFF'));
      }
      box(g, sx, top + 74, sw, -top - 74, D('#334155')); box(g, sx, top + 74, sw, 3, D('#94A3B8'));
      break;
    }
    case 'rest': {
      sign('RESTROOMS', '#1D4ED8');
      // (two doors: DUDES, BETTIES; a drinking fountain between)
      for (const [dx, lab, col] of [[sx, 'DUDES', '#2563EB'], [sx + sw - 60, 'BETTIES', '#DB2777']] as [number, string, string][]) {
        const C = DR(col); box(g, dx - 2, top + 8, 64, -top - 8, ink); box(g, dx, top + 10, 60, -top - 10, C[3]); box(g, dx, top + 10, 4, -top - 10, C[4]); box(g, dx + 54, top + 10, 6, -top - 10, C[1]);
        box(g, dx + 8, top + 22, 44, 14, D('#F8FAFC')); signText(g, lab, dx + 30, top + 33, sm(D(col))); box(g, dx + 48, top + 60, 4, 8, D('#D4D4D8'));
      }
      const fx = sx + sw / 2; box(g, fx - 12, top + 70, 24, 10, ink); box(g, fx - 11, top + 71, 22, 8, D('#CBD5E1')); box(g, fx - 3, top + 79, 6, -top - 79, D('#94A3B8'));
      break;
    }
    case 'lockers': {
      sign('LOCKERS', '#EA580C', '$1 ALL DAY');
      frame(); box(g, sx, top, sw, -top, D('#475569'));
      for (let r = 0; r < 3; r++) for (let k = 0; k < Math.floor(sw / 22); k++) { const lx = sx + 2 + k * 22, ly = top + 4 + r * 38, C = DR(['#F97316', '#22D3EE', '#A3E635', '#F472B6'][((Math.floor(k + r + f.seed) % 4) + 4) % 4]); box(g, lx, ly, 20, 36, ink); box(g, lx + 1, ly + 1, 18, 34, C[3]); box(g, lx + 1, ly + 1, 3, 34, C[4]); for (let s = 0; s < 3; s++) box(g, lx + 6, ly + 6 + s * 3, 10, 1, C[1]); box(g, lx + 14, ly + 18, 3, 5, D('#E5E7EB')); }
      break;
    }
    case 'tees': {
      sign('T-SHIRTS', '#DB2777', '3 FOR $20');
      awning('#7C3AED', '#FDE047');
      frame(); glass(g, sx, top + 18, sw, -top - 18);
      // (tees hung on a line in the window, each a slogan)
      g.strokeStyle = D('#E5E7EB'); g.lineWidth = 1; g.beginPath(); g.moveTo(sx, top + 30); g.lineTo(sx + sw, top + 30); g.stroke();
      const tees = ['NO FEAR', 'GNARLY', 'BOY! BEER!', 'GLOP', 'RAD'];
      for (let k = 0; k < Math.floor(sw / 46); k++) { const tx = sx + 8 + k * 46, C = DR(['#F8FAFC', '#1F2937', '#22D3EE', '#A3E635', '#F472B6'][((Math.floor(k + f.seed) % 5) + 5) % 5]); polyF(g, [[tx - 2, top + 30], [tx + 38, top + 30], [tx + 44, top + 40], [tx + 36, top + 44], [tx + 34, top + 72], [tx + 4, top + 72], [tx + 2, top + 44], [tx - 6, top + 40]], ink); polyF(g, [[tx, top + 32], [tx + 36, top + 32], [tx + 41, top + 40], [tx + 34, top + 42], [tx + 32, top + 70], [tx + 6, top + 70], [tx + 4, top + 42], [tx - 3, top + 40]], C[3]); box(g, tx + 6, top + 32, 4, 38, C[4]); signText(g, tees[((Math.floor(k + f.seed) % tees.length) + tees.length) % tees.length], tx + 19, top + 54, { sx: 1, sy: 1, fill: D(k % 2 ? '#DC2626' : '#7C3AED'), gap: 0, space: 2 }); }
      break;
    }
    case 'ouch': {
      sign('OUCH!', '#DC2626', 'FIRST AID');
      // (a big band-aid over the door, the door, a bench of ice packs)
      box(g, sx - 2, top + 16, 66, -top - 16, ink); box(g, sx, top + 18, 62, -top - 18, D('#F4F0E4')); glass(g, sx + 8, top + 26, 46, 30);
      g.save(); g.translate(sx + sw - 50, top + 46); g.rotate(-0.4); box(g, -40, -12, 80, 24, ink); box(g, -39, -11, 78, 22, D('#F2C29A')); box(g, -14, -11, 28, 22, D('#E8A880')); for (let k = 0; k < 9; k++) box(g, -12 + (k % 3) * 9, -8 + Math.floor(k / 3) * 7, 2, 2, D('#B87A5A')); g.restore();
      break;
    }
    default: {
      // (a ride's show building: its roll-up door, KEEP CLEAR stenciled, a loading light, hazard stripes)
      sign(['SHOW BLDG 4', 'RIDE MAINT.', 'CAST ONLY'][((Math.floor(f.seed) % 3) + 3) % 3], '#334155');
      const dw = Math.min(sw, 120), dx = sx + 6;
      box(g, dx - 3, top + 6, dw + 6, -top - 6, ink); box(g, dx, top + 9, dw, -top - 9, D('#94A3B8'));
      for (let y = top + 11; y < 0; y += 6) { box(g, dx, y, dw, 2, D('#64748B')); box(g, dx, y + 2, dw, 1, D('#CBD5E1')); }
      for (let k = 0; k < dw; k += 12) { box(g, dx + k, -10, 6, 10, D('#FDE047')); box(g, dx + k + 6, -10, 6, 10, D('#1F2937')); }
      signText(g, 'KEEP CLEAR', dx + dw / 2, top + 50, { sx: 1, sy: 1, stencil: true, bold: true, fill: D('#1F2937') });
      box(g, dx + dw + 8, top + 10, 10, 10, ink); box(g, dx + dw + 9, top + 11, 8, 8, lit() ? '#FBBF24' : D('#B45309'));
    }
  }
};

/** The front's sides going back where the eye's past an end; then the fronts themselves. */
export const drawFronts = (c: Ctx, v: View) => {
  const vis = FRONTS.filter(f => seen(v, X(f.x) - 60, X(f.x + f.w) + 60, FRONT_D, 120));
  for (const f of vis) {
    const R = DR(wallOf(f)), top = GY - f.h - 12, a = X(f.x) - 6, b = X(f.x + f.w) + 6;
    sideBack(c, v.eye, a, -1, top, GY, FRONT_D, BACK_D, R, 3);
    sideBack(c, v.eye, b, 1, top, GY, FRONT_D, BACK_D, R, 3);
  }
  for (const f of vis) stillAt(c, v, FRONT_D, `bk-front-${f.seed}-${lit() ? 1 : 0}`, X(f.x), GY, -14, -f.h - 70, f.w + 28, f.h + 74, g => paintFront(g, f));
};

// ---------------------------------------------------------------------------------------------------------------
// The alley, the concrete

/** The alley behind the fronts (between BACK_D and FRONT_D): asphalt in bands, a painted line. */
export const drawAlley = (c: Ctx, v: View) => {
  const a = v.v0 - 200, b = v.v1 + 200, A = DR('#5A5868');
  for (let i = 0; i < 3; i++) { const d0 = BACK_D + ((FRONT_D - BACK_D) * i) / 3, d1 = BACK_D + ((FRONT_D - BACK_D) * (i + 1)) / 3; polyF(c, [at(v.eye, a, GY, d0), at(v.eye, b, GY, d0), at(v.eye, b, GY, d1), at(v.eye, a, GY, d1)], A[1 + i]); }
  const [la, ly] = at(v.eye, a, GY, (BACK_D + FRONT_D) / 2), [lb] = at(v.eye, b, GY, (BACK_D + FRONT_D) / 2);
  for (let x = Math.floor(la / 24) * 24; x < lb; x += 24) box(c, x, ly, 12, 1, D('#E8D070'));
};
/** Where the concrete stops short of the play plane (a pit's, the pipe's or the rink's back edge), by x. */
const cutAt = (x: number) => PITS.some(([p, q]) => x > X(p) && x < X(q)) ? PIT_D : x > X(PIPE.a) && x < X(PIPE.b) ? PIPE_D : x > X(RINK.a) && x < X(RINK.b) ? RINK_D : 1;
const SLAB = ['#C8C2BC', '#BEB8B4', '#D2CCC4', '#C4BEB8'];
/** The skate-park concrete from the fronts' feet to the play plane, in slabs; over a pit, the pipe or the rink, only
 *  back to its edge. */
export const drawPavement = (c: Ctx, v: View) => {
  const a = v.v0 - 60, b = v.v1 + 60;
  const runs: [number, number, number][] = [];
  const edges: number[] = [a, b];
  for (const [p, q] of PITS) edges.push(X(p), X(q));
  edges.push(X(PIPE.a), X(PIPE.b), X(RINK.a), X(RINK.b));
  const xs = edges.filter(x => x >= a && x <= b).sort((m, n) => m - n);
  for (let i = 0; i + 1 < xs.length; i++) if (xs[i + 1] > xs[i]) runs.push([xs[i], xs[i + 1], cutAt((xs[i] + xs[i + 1]) / 2)]);
  const N = 5;
  for (const [s, e, dn] of runs) {
    for (let i = 0; i < N; i++) {
      const d0 = FRONT_D + ((dn - FRONT_D) * i) / N, d1 = FRONT_D + ((dn - FRONT_D) * (i + 1)) / N, col = D(SLAB[i % SLAB.length]);
      polyF(c, [at(v.eye, s, GY, d0), at(v.eye, e, GY, d0), at(v.eye, e, GY, d1), at(v.eye, s, GY, d1)], col);
      const [lx, ly] = at(v.eye, s, GY, d1), [rx] = at(v.eye, e, GY, d1);
      box(c, lx, ly - 1, rx - lx, 1, D('#8A8480'));
      checker(c, lx, ly - 3, rx - lx, 2, D(SLAB[(i + 1) % SLAB.length]), i % 2, 1);
    }
    // (the joints running back to the eye; gum, oil stains, painted bolts on the slabs)
    c.strokeStyle = D('#8A8480'); c.lineWidth = 1; c.beginPath();
    for (let jx = Math.ceil(s / 64) * 64; jx < e; jx += 64) { const [x0, y0] = at(v.eye, jx, GY, FRONT_D), [x1, y1] = at(v.eye, jx, GY, dn); c.moveTo(x0, y0); c.lineTo(x1, y1); }
    c.stroke();
    for (let jx = Math.ceil(s / 37) * 37; jx < e; jx += 37) {
      const hs = hash(jx * 0.17); if (hs < 0.55) continue;
      const d = FRONT_D + (dn - FRONT_D) * hash(jx * 0.31), [px, py] = at(v.eye, jx, GY, d);
      if (hs > 0.93) { const C = D(NEON[Math.floor(hash(jx) * 5)]); polyF(c, [[px - 6, py], [px, py - 3], [px - 2, py - 1], [px + 6, py - 2], [px, py + 1], [px + 2, py - 1]], C); }
      else if (hs > 0.8) { c.fillStyle = 'rgba(40,30,50,0.18)'; c.beginPath(); c.ellipse(px, py, 9, 2, 0, 0, Math.PI * 2); c.fill(); }
      else box(c, px, py, 2, 1, D(['#F472B6', '#E5E7EB', '#A3E635'][Math.floor(hs * 30) % 3]));
    }
  }
  // (the gutter along the fronts' feet)
  const [fa, fy] = at(v.eye, a, GY, FRONT_D + 0.004), [fb] = at(v.eye, b, GY, FRONT_D + 0.004);
  box(c, fa, fy - 1, fb - fa, 3, D('#6A6470')); box(c, fa, fy - 1, fb - fa, 1, D('#A8A2AC'));
};

// ---------------------------------------------------------------------------------------------------------------
// The furniture

type Furn = 'lamp' | 'bin' | 'vend' | 'table' | 'palm' | 'phone' | 'cart' | 'queue' | 'bench';
const FURN_BOX: Record<Furn, [number, number, number, number]> = {
  lamp: [-30, -200, 60, 204], bin: [-22, -64, 44, 68], vend: [-26, -110, 52, 114], table: [-56, -120, 112, 124], palm: [-56, -210, 112, 214],
  phone: [-18, -112, 36, 116], cart: [-50, -120, 100, 124], queue: [-80, -86, 160, 90], bench: [-44, -36, 88, 40],
};
/** Where the set pieces stand (rx): nothing of the street's furniture there (their sides run back through it, or
 *  they stand on the concrete themselves). */
const BUSY: [number, number][] = [[160, 690], [800, 1520], [1850, 2020], [2240, 2470], [2770, 3360], [3520, 4770], [5020, 6280], [6390, 7230], [8540, 10500], [10660, 12200]];
const KINDS: Furn[] = ['lamp', 'bin', 'queue', 'palm', 'vend', 'lamp', 'table', 'phone', 'bin', 'cart', 'lamp', 'bench', 'palm', 'queue'];
export const FURN: { x: number; kind: Furn; seed: number }[] = (() => {
  const out: { x: number; kind: Furn; seed: number }[] = [];
  let x = -560, i = 0;
  while (x < 12400) {
    const kind = KINDS[i % KINDS.length], half = (FURN_BOX[kind][2] / 2) / FURN_D + 10;
    if (!BUSY.some(([a, b]) => x + half > a && x - half < b)) out.push({ x, kind, seed: i * 13 + 5 });
    x += 110 + Math.floor(hash(i * 3.7) * 90); i++;
  }
  return out;
})();

/** One of the crowd: seeded (skin, hair, build, a 1994 outfit), standing facing out; `h` tall. */
const person = (g: Ctx, x: number, seed: number, h: number) => {
  const L = lookOf(seed), kid = h < 60, ink = D(INK);
  const shirt = ['#2563EB', '#DC2626', '#16A34A', '#7C3AED', '#F59E0B', '#0D9488', '#F472B6', '#1F2937'][((Math.floor(seed) % 8) + 8) % 8], pants = ['#1E3A8A', '#3F3F46', '#78716C', '#2563EB', '#111827'][((Math.floor(seed >> 2) % 5) + 5) % 5];
  const wide = L.heavy ? 1.3 : 0.88 + hash(seed * 1.3) * 0.2, sw = Math.round(h * 0.26 * wide), hd = Math.round(h * 0.14);
  const top = -h, headY = top + hd, shY = top + hd * 2 + 2, hipY = -h * 0.42;
  // (legs, shoes)
  for (const s of [-1, 1]) { box(g, x + s * sw * 0.22 - 3, hipY, 6, -hipY - 3, ink); box(g, x + s * sw * 0.22 - 2, hipY, 4, -hipY - 3, D(pants)); box(g, x + s * sw * 0.22 - 4, -4, 8, 4, D(['#F8FAFC', '#111827', '#DC2626'][((Math.floor(seed) % 3) + 3) % 3])); }
  // (the shirt: flannel (a check), a windbreaker (two-tone), a tee; overalls on some)
  box(g, x - sw / 2 - 1, shY - 1, sw + 2, hipY - shY + 4, ink); box(g, x - sw / 2, shY, sw, hipY - shY + 2, D(shirt)); box(g, x - sw / 2, shY, 2, hipY - shY + 2, D(mix(shirt, '#FFFFFF', 0.3))); box(g, x + sw / 2 - 2, shY, 2, hipY - shY + 2, D(mix(shirt, INK, 0.3)));
  const style = seed % 4;
  if (style === 0) for (let y = shY + 2; y < hipY; y += 4) box(g, x - sw / 2, y, sw, 1, D(mix(shirt, INK, 0.35)));
  else if (style === 1) box(g, x - sw / 2, shY + (hipY - shY) * 0.45, sw, 3, D(['#FDE047', '#22D3EE', '#F472B6'][((Math.floor(seed) % 3) + 3) % 3]));
  else if (style === 2) { box(g, x - sw / 2 + 2, shY + 4, sw - 4, hipY - shY, D('#3B82F6')); box(g, x - sw / 2 + 2, shY, 2, 4, D('#3B82F6')); box(g, x + sw / 2 - 4, shY, 2, 4, D('#3B82F6')); }
  // (arms down, a slap bracelet, something held: a foam finger, a soda, a corn dog)
  for (const s of [-1, 1]) { box(g, x + s * (sw / 2 + 1) - 2, shY + 1, 4, (hipY - shY) * 0.9, D(shirt)); box(g, x + s * (sw / 2 + 1) - 2, shY + (hipY - shY) * 0.9, 4, 4, D(L.skin)); }
  if (seed % 5 === 0) { box(g, x + sw / 2 - 1, shY - 10, 6, 14, ink); box(g, x + sw / 2, shY - 9, 4, 12, D('#FDE047')); box(g, x + sw / 2 + 1, shY - 14, 2, 6, D('#FDE047')); }
  else if (seed % 5 === 2) { box(g, x - sw / 2 - 5, shY + 8, 5, 8, D('#DC2626')); box(g, x - sw / 2 - 4, shY + 6, 3, 2, D('#FFFFFF')); }
  // (the head: skin, hair by look, a backwards cap or a scrunchie on some)
  box(g, x - 2, shY - 3, 4, 3, D(L.skin));
  g.fillStyle = ink; g.beginPath(); g.ellipse(x, headY, hd * 0.75 + 1, hd + 1, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = D(L.skin); g.beginPath(); g.ellipse(x, headY, hd * 0.75, hd, 0, 0, Math.PI * 2); g.fill();
  box(g, x - hd * 0.4, headY - 1, 2, 2, ink); box(g, x + hd * 0.25, headY - 1, 2, 2, ink); box(g, x - 2, headY + hd * 0.45, 4, 1, D(mix(L.skin, INK, 0.4)));
  if (!L.bald) { g.fillStyle = D(L.hair); g.beginPath(); g.ellipse(x, headY - hd * 0.45, hd * 0.8, hd * 0.6, 0, Math.PI, 0); g.fill(); }
  if (L.face === 1 && !L.woman) box(g, x - 3, headY + hd * 0.3, 6, 2, D(L.hair));
  if (L.long) { box(g, x - hd * 0.8, headY - hd * 0.4, 3, hd * 1.6, D(L.hair)); box(g, x + hd * 0.8 - 3, headY - hd * 0.4, 3, hd * 1.6, D(L.hair)); }
  if (seed % 6 === 1) { box(g, x - hd * 0.8, headY - hd * 0.95, hd * 1.6, hd * 0.5, D(['#DC2626', '#1F2937', '#0D9488'][((Math.floor(seed) % 3) + 3) % 3])); box(g, x - hd * 1.3, headY - hd * 0.6, hd * 0.7, 2, D(['#DC2626', '#1F2937', '#0D9488'][((Math.floor(seed) % 3) + 3) % 3])); }
  else if (seed % 6 === 4 && L.long) box(g, x - 3, headY - hd * 1.05, 6, 3, D('#F472B6'));
  void kid;
};
const paintFurn = (g: Ctx, kind: Furn, seed: number) => {
  const ink = D(INK);
  switch (kind) {
    case 'lamp': {
      // (a black pole, a ring of hot neon at the top round a frosted globe; banners off a bracket)
      const St = DR('#3F3F46');
      postR(g, 0, -170, 0, 6, St); box(g, -9, -8, 18, 8, ink); box(g, -8, -7, 16, 6, St[2]);
      const C = DR(NEON[((Math.floor(seed) % 3) + 3) % 3]);
      box(g, 3, -150, 24, 3, ink); box(g, 8, -147, 18, 44, ink); box(g, 9, -146, 16, 42, C[3]); box(g, 9, -146, 4, 42, C[4]); signText(g, 'RAD!', 17, -122, { sx: 1, sy: 1, bold: true, slant: 1, fill: D('#FFFFFF') });
      g.fillStyle = ink; g.beginPath(); g.ellipse(0, -182, 18, 9, 0, 0, Math.PI * 2); g.fill();
      eggR(g, 0, -184, 9, 10, DR('#F4F0F8'), true);
      tube(g, () => g.ellipse(0, -180, 15, 7, 0, 0, Math.PI * 2), NEON[((Math.floor(seed) % 3) + 3) % 3], 3);
      break;
    }
    case 'bin': {
      // (GLOP IT!: a green trash can shaped like Gloppy's head, the lid his open mouth, googly eyes on stalks)
      const G = DR('#65D11B');
      g.fillStyle = ink; g.beginPath(); g.moveTo(-18, 0); g.lineTo(-20, -44); g.quadraticCurveTo(0, -56, 20, -44); g.lineTo(18, 0); g.closePath(); g.fill();
      g.fillStyle = G[3]; g.beginPath(); g.moveTo(-16, -1); g.lineTo(-18, -43); g.quadraticCurveTo(0, -54, 18, -43); g.lineTo(16, -1); g.closePath(); g.fill();
      box(g, -16, -42, 5, 40, G[4]); box(g, 9, -42, 7, 40, G[1]);
      g.fillStyle = ink; g.beginPath(); g.ellipse(0, -40, 12, 7, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = D('#3A0A14'); g.beginPath(); g.ellipse(0, -40, 10, 5, 0, 0, Math.PI * 2); g.fill();
      for (const s of [-1, 1]) { g.strokeStyle = G[3]; g.lineWidth = 3; g.beginPath(); g.moveTo(s * 8, -48); g.lineTo(s * 10, -58); g.stroke(); ballR(g, s * 10, -60, 4, DR('#FFFFFF')); box(g, s * 10 - 1, -60, 2, 2, ink); }
      for (let k = 0; k < 3; k++) box(g, -10 + k * 8, -30, 3, 5 + k * 3, G[3]);
      signText(g, 'GLOP IT!', 0, -14, sm(D('#FDE047'), ink));
      break;
    }
    case 'vend': {
      // (a soda machine, glowing: the big can on its front, the buttons, the slot)
      const R = DR('#DC2626');
      box(g, -22, -104, 44, 104, ink); box(g, -20, -102, 40, 102, R[3]); box(g, -20, -102, 5, 102, R[4]); box(g, 14, -102, 6, 102, R[1]);
      box(g, -16, -96, 24, 64, lit() ? '#FFF4F0' : D('#F8E8E8')); box(g, -12, -90, 16, 50, D('#DC2626')); box(g, -12, -72, 16, 6, D('#FFFFFF')); box(g, -10, -88, 4, 44, D('#F06A72'));
      for (let k = 0; k < 6; k++) box(g, 10, -94 + k * 9, 6, 6, D(['#FDE047', '#22D3EE', '#A3E635', '#F472B6', '#FFFFFF', '#F97316'][k]));
      box(g, -14, -26, 28, 12, ink); box(g, -12, -24, 24, 8, D('#1F2937'));
      signText(g, 'ICE COLD', 0, -4, sm(D('#FFFFFF'), ink));
      break;
    }
    case 'table': {
      // (a picnic table under a striped umbrella, a pizza box and cans left on it)
      const W2 = DR('#2563EB'), U = [DR('#F472B6'), DR('#FDE047')];
      postR(g, 0, -114, -30, 3, DR('#E5E7EB'));
      for (let k = 0; k < 8; k++) { const x0 = -54 + k * 13.5, x1 = x0 + 13.5; polyF(g, [[0, -118], [x0, -96], [x1, -96]], U[k % 2][k < 3 ? 4 : k > 5 ? 2 : 3]); }
      g.strokeStyle = ink; g.lineWidth = 2; g.beginPath(); g.moveTo(-54, -96); g.lineTo(0, -118); g.lineTo(54, -96); g.stroke();
      for (let k = -54; k < 54; k += 12) { g.fillStyle = U[Math.round((k + 54) / 12) % 2][2]; g.beginPath(); g.arc(k + 6, -96, 6, 0, Math.PI); g.fill(); }
      box(g, -46, -34, 92, 6, ink); box(g, -45, -33, 90, 4, W2[3]); box(g, -45, -33, 90, 1, W2[4]);
      box(g, -52, -16, 104, 5, ink); box(g, -51, -15, 102, 3, W2[2]);
      for (const s of [-1, 1]) { g.strokeStyle = ink; g.lineWidth = 4; g.beginPath(); g.moveTo(s * 34, -30); g.lineTo(s * 40, 0); g.moveTo(s * 34, -30); g.lineTo(s * 24, 0); g.stroke(); }
      box(g, -24, -40, 30, 6, ink); box(g, -23, -39, 28, 4, D('#F4F0E4')); box(g, -23, -39, 28, 1, D('#DC2626'));
      for (const cx of [14, 22]) { box(g, cx, -42, 5, 8, ink); box(g, cx + 1, -41, 3, 6, D(cx === 14 ? '#DC2626' : '#16A34A')); }
      break;
    }
    case 'palm': {
      // (a palm in a neon-painted planter, fronds in steps)
      const P = DR(['#F472B6', '#22D3EE', '#A3E635'][((Math.floor(seed) % 3) + 3) % 3]), Tr = DR('#8A6A4A'), Fr = DR('#2A9A4A');
      box(g, -28, -34, 56, 34, ink); box(g, -26, -32, 52, 32, P[3]); box(g, -26, -32, 6, 32, P[4]); box(g, 18, -32, 8, 32, P[1]); box(g, -30, -36, 60, 6, ink); box(g, -28, -35, 56, 4, P[4]);
      for (let k = 0; k < 6; k++) box(g, -20 + k * 8, -24, 4, 12, P[2]);
      const bend = (hash(seed) - 0.5) * 30;
      candyStroke(g, () => { g.moveTo(0, -34); g.quadraticCurveTo(bend * 0.3, -110, bend, -176); }, 7, Tr, null);
      for (let y = -50; y > -170; y -= 10) { const t = (y + 34) / -142, xx = bend * t * t; box(g, xx - 4, y, 8, 2, Tr[1]); }
      for (let k = 0; k < 7; k++) { const a = -Math.PI + (k / 6) * Math.PI, ex = bend + Math.cos(a) * 56, ey = -176 + Math.sin(a) * 18 + 30; g.strokeStyle = ink; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(bend, -178); g.quadraticCurveTo(bend + Math.cos(a) * 30, -200, ex, ey); g.stroke(); g.strokeStyle = k % 2 ? Fr[3] : Fr[2]; g.lineWidth = 4; g.stroke(); g.strokeStyle = Fr[4]; g.lineWidth = 1; g.stroke(); }
      ballR(g, bend - 4, -172, 4, DR('#8A6A2A')); ballR(g, bend + 4, -170, 4, DR('#8A6A2A'));
      break;
    }
    case 'phone': {
      // (a payphone on its post, the hood, the receiver off the hook, swinging)
      const St = DR('#A8A8BC');
      postR(g, 0, -60, 0, 6, DR('#52525B'));
      box(g, -16, -108, 32, 52, ink); box(g, -14, -106, 28, 48, St[3]); box(g, -14, -106, 4, 48, St[4]); box(g, 8, -106, 6, 48, St[1]);
      box(g, -18, -112, 36, 8, ink); box(g, -16, -110, 32, 4, D('#1D4ED8')); signText(g, 'PHONE', 0, -105, { sx: 1, sy: 1, fill: D('#FFFFFF') });
      for (let k = 0; k < 12; k++) box(g, -8 + (k % 3) * 5, -96 + Math.floor(k / 3) * 6, 3, 3, D('#1F2937'));
      g.strokeStyle = ink; g.lineWidth = 1; g.beginPath(); g.moveTo(10, -70); g.quadraticCurveTo(14, -50, 6, -40); g.stroke(); box(g, 2, -42, 8, 4, ink);
      break;
    }
    case 'cart': {
      // (a souvenir cart: foam fingers, slap bracelets, light-up yo-yos; its striped canopy)
      const C = DR('#0D9488');
      for (const s of [-1, 1]) { box(g, s * 38 - 2, -100, 4, 60, D('#D4D4D8')); }
      box(g, -46, -104, 92, 8, ink); for (let k = -44; k < 44; k += 11) box(g, k, -103, 6, 6, D(k % 22 ? '#FDE047' : '#7C3AED'));
      for (let k = -44; k < 44; k += 11) { g.fillStyle = D((k + 44) % 22 ? '#FDE047' : '#7C3AED'); g.beginPath(); g.arc(k + 5, -97, 5.5, 0, Math.PI); g.fill(); }
      box(g, -44, -44, 88, 30, ink); box(g, -42, -42, 84, 26, C[3]); box(g, -42, -42, 84, 3, C[4]); box(g, -42, -19, 84, 3, C[1]);
      signText(g, 'SOUVENIRS', 0, -26, sm(D('#FFFFFF'), ink));
      for (const wx of [-30, 30]) { ballR(g, wx, -10, 8, DR('#3F3F46')); ballR(g, wx, -10, 3, DR('#D4D4D8'), false); }
      for (let k = 0; k < 5; k++) { const fx = -34 + k * 16, col = DR(NEON[k % 5]); box(g, fx - 1, -76, 12, 30, ink); box(g, fx, -75, 10, 28, col[3]); box(g, fx + 3, -86, 4, 12, ink); box(g, fx + 4, -85, 2, 11, col[3]); box(g, fx, -75, 3, 28, col[4]); }
      for (let k = 0; k < 4; k++) { g.strokeStyle = D(NEON[(k + 2) % 5]); g.lineWidth = 2; g.beginPath(); g.arc(-30 + k * 20, -90, 5, 0, Math.PI * 2); g.stroke(); }
      break;
    }
    case 'queue': {
      // (a queue maze's rails (chrome posts, a chain), the crowd waiting behind them, seeded)
      for (let k = 0; k < 7; k++) person(g, -66 + k * 22 + (hash(seed + k) - 0.5) * 6, seed * 13 + k * 7, 52 + Math.floor(hash(seed * 3 + k) * 26));
      const St = DR('#C8C8D8');
      for (let k = -76; k <= 76; k += 38) { postR(g, k, -40, 0, 5, St); box(g, k - 6, -3, 12, 3, St[1]); ballR(g, k, -42, 3, St); }
      g.strokeStyle = ink; g.lineWidth = 3; g.beginPath(); g.moveTo(-76, -36); for (let k = -76; k < 76; k += 38) g.quadraticCurveTo(k + 19, -26, k + 38, -36); g.stroke();
      g.strokeStyle = D('#FDE047'); g.lineWidth = 1.5; g.stroke();
      break;
    }
    default: {
      // (a concrete bench, a tag sprayed on its back)
      const Cc = DR('#B4AEA8');
      box(g, -40, -30, 80, 10, ink); box(g, -39, -29, 78, 8, Cc[3]); box(g, -39, -29, 78, 2, Cc[4]); box(g, -39, -23, 78, 2, Cc[1]);
      for (const s of [-1, 1]) { box(g, s * 28 - 7, -21, 14, 21, ink); box(g, s * 28 - 6, -20, 12, 20, Cc[2]); box(g, s * 28 - 6, -20, 3, 20, Cc[4]); }
      tag(g, -26, -22, seed);
    }
  }
};
/** The street's furniture on the concrete. */
export const drawFurniture = (c: Ctx, v: View) => {
  for (const it of FURN) {
    const bx = FURN_BOX[it.kind], x = X(it.x);
    if (!seen(v, x + bx[0], x + bx[0] + bx[2], FURN_D, 40)) continue;
    stillAt(c, v, FURN_D, `bk-furn-${it.kind}-${it.seed}-${lit() ? 1 : 0}`, x, GY, bx[0], bx[1], bx[2], bx[3], g => paintFurn(g, it.kind, it.seed));
  }
};
/** The lamps after dark (the street's lamp posts' neon, the arcade's and the snack bars' windows). */
export const backLamps = (v: View): Light[] => {
  const out: Light[] = [];
  for (const it of FURN) {
    if (it.kind !== 'lamp' && it.kind !== 'vend') continue;
    const [x, y] = at(v.eye, X(it.x), GY - (it.kind === 'lamp' ? 182 : 60), FURN_D);
    if (x > v.cam.x - 200 && x < v.cam.x + 1000) out.push({ x, y, r: it.kind === 'lamp' ? 130 : 70, a: 0.5, color: it.kind === 'lamp' ? NEON[((Math.floor(it.seed) % 3) + 3) % 3] : '#FFE0E0' });
  }
  for (const f of FRONTS) {
    const [x, y] = at(v.eye, X(f.x + 100), GY - 60, FRONT_D);
    if (x > v.cam.x - 200 && x < v.cam.x + 1000) out.push({ x, y, r: 80, a: 0.32, color: f.shop === 'arcade' ? '#C084FC' : '#FFC870' });
  }
  return out;
};
