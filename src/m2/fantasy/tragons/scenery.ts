// Truelling Tragons' park, round the ride (world space, one eye: scene.ts): the ground going back from under the play
// plane to where the far off takes over (the lawns in banded depths, mowed in stripes that run back to the eye, the
// promenade's flagstones and a near path with snow banked along them, flower beds in bloom: it's enchanted), the lagoon
// at the splashdown's foot (banded water going back, its stone kerb lit, ripples, lily pads, a rowboat), and standing
// on the ground at three depths, slid along under the ride as the world goes by:
//
//   0.6   the park's back row: storybook gift shops (half-timber, snowy slate, glowing bays, a turret), the PRANCING
//         PONY's little brother of a carousel, a teacup ride, a gatehouse with its banners, clumps of snowy pines
//   0.73  queue mazes (brass posts, velvet ropes, the guests winding through), dragon topiary capped with snow, bare
//         trees strung with fairy lights, the ON-RIDE PHOTO kiosk, lamp posts
//   0.87  the crowds behind the rails looking up at him (pointing, cheering, kids on shoulders, phones up), butter brew
//         and turkey leg carts, a balloon seller, benches, lamp posts with banners, snowy urns
//
// Every prop is still art, painted once per hour into a stamp (the crowds in two frames: arms up, arms down) and put
// down at its depth; sorted in among the tracks by depth (art.ts). The fake mountain (plaster, snow-capped, NO crater):
// behind the tracks.

import type { GameState } from '../../../m1/game/core/state';
import { timeOfDay } from '../../timeOfDay';
import { lookOf } from '../../adventure/temple/people';
import {
  INK, box, hash, checker, ramp6, rampH, dimmed, warmGlass, lit, polyF, ballR, postR, slab,
  PLASTER, TIMBER, SLATE, SNOW, GOLD, IRON, PINE, FLAG, type Ctx,
} from '../kit';
import { farPine } from '../square/far';
import { S0X, RX, TL, END_S, STATION_X, GATE_X, EXIT_X, DECK_X0, LAGOON, TUNNEL } from './layout';
import type { Tragons } from './state';
import { viewBox, parkX, scrollOf, fog, groundAt } from './scene';
import { banded } from './cache';
import type { Eye } from './track';

const D = (col: string) => rampH(ramp6(col), true);

// ---------------------------------------------------------------------------------------------------------------
// Guests (stepped little figures, seeded: men and women, every skin, build and hair; kids)

export type GPose = 'stand' | 'point' | 'cheer' | 'phone' | 'sit';
export const guest =(g: Ctx, x: number, foot: number, seed: number, pose: GPose, up = false) => {
  const L = lookOf(seed * 7 + 3), kid = seed % 9 === 4, s = kid ? 0.7 : 1, wide = L.heavy ? 2 : 0;
  const Sk = D(L.skin), Sh = D(L.shirt), Pn = D(L.pants), Hr = D(L.hair);
  const h = (kid ? 38 : 52 + (seed % 5) * 2) * (pose === 'sit' ? 0.72 : 1), hw = 5 * s + wide;
  const top = foot - h;
  // (legs, body, arms, head, hair)
  if (pose !== 'sit') { box(g, x - hw, foot - 20 * s, hw * 2, 20 * s, INK); box(g, x - hw + 1, foot - 20 * s, hw - 1, 19 * s, Pn[3]); box(g, x + 1, foot - 20 * s, hw - 1, 19 * s, Pn[2]); }
  else { box(g, x - hw, foot - 14, hw * 2 + 8, 6, INK); box(g, x - hw + 1, foot - 13, hw * 2 + 6, 4, Pn[3]); box(g, x + hw + 4, foot - 13, 4, 13, Pn[2]); }
  box(g, x - hw - 1, top + 12 * s, hw * 2 + 2, h - 31 * s, INK); box(g, x - hw, top + 13 * s, hw * 2, h - 33 * s, Sh[3]); box(g, x - hw, top + 13 * s, 2, h - 33 * s, Sh[4]); box(g, x + hw - 2, top + 13 * s, 2, h - 33 * s, Sh[1]);
  const arm = (dx: number, ex: number, ey: number) => { g.strokeStyle = INK; g.lineWidth = 4 * s; g.lineCap = 'round'; g.beginPath(); g.moveTo(x + dx, top + 15 * s); g.lineTo(ex, ey); g.stroke(); g.strokeStyle = Sh[2]; g.lineWidth = 2.4 * s; g.stroke(); g.lineCap = 'butt'; box(g, ex - 1.5, ey - 1.5, 3, 3, Sk[3]); };
  if (pose === 'cheer') { arm(-hw, x - hw - 4, top - (up ? 8 : 0) * s); arm(hw, x + hw + 4, top - (up ? 8 : 0) * s); }
  else if (pose === 'point') { arm(-hw, x - hw - 1, top + 30 * s); arm(hw, x + hw + 9 * s, top - 4 * s - (up ? 3 : 0)); }
  else if (pose === 'phone') { arm(-hw, x - hw - 1, top + 30 * s); arm(hw, x + hw + 4, top + 2 * s); box(g, x + hw + 2, top - 6 * s, 5, 8, INK); box(g, x + hw + 3, top - 5 * s, 3, 6, up ? '#BFE6FF' : '#5A7AA0'); }
  else { arm(-hw, x - hw - 1, top + 30 * s); arm(hw, x + hw + 1, top + 30 * s); }
  const hy = top + 6 * s, r = 6 * s;
  g.fillStyle = INK; g.beginPath(); g.arc(x, hy, r + 1, 0, Math.PI * 2); g.fill();
  g.fillStyle = Sk[3]; g.beginPath(); g.arc(x, hy, r, 0, Math.PI * 2); g.fill();
  box(g, x - r * 0.6, hy - r * 0.5, 2, 2, Sk[4]);
  if (!L.bald) { box(g, x - r - 1, hy - r - 1, r * 2 + 2, 4, Hr[3]); box(g, x - r - 1, hy - r - 1, r * 2 + 2, 1, Hr[4]); if (L.long) { box(g, x - r - 2, hy - r, 3, 12 * s, Hr[2]); box(g, x + r - 1, hy - r, 3, 12 * s, Hr[2]); } }
  // (a winter hat on some, a mouse-ear-ish tiara on others)
  if (seed % 4 === 1) { box(g, x - r - 1, hy - r - 4, r * 2 + 2, 5, D(['#C8283E', '#2E5AAE', '#2E8A5A'][seed % 3])[3]); box(g, x - 2, hy - r - 8, 4, 4, '#F4F0FA'); }
  else if (seed % 7 === 2) { polyF(g, [[x - 4, hy - r], [x, hy - r - 6], [x + 4, hy - r]], D('#F2C84A')[4]); }
  box(g, x + (pose === 'point' ? 2 : -1), hy - 1, 2, 2, INK);
};

// ---------------------------------------------------------------------------------------------------------------
// The props (local: the foot's middle at 0, 0)

type Kind = 'shop' | 'carousel' | 'teacups' | 'gate' | 'pines' | 'queue' | 'topiary' | 'tree' | 'kiosk' | 'lamp' | 'crowd' | 'cart' | 'bench' | 'urn' | 'balloons';
interface Prop { kind: Kind; w: number; h: number }
const SIZE: Record<Kind, Prop> = {
  shop: { kind: 'shop', w: 260, h: 230 }, carousel: { kind: 'carousel', w: 240, h: 200 }, teacups: { kind: 'teacups', w: 230, h: 170 },
  gate: { kind: 'gate', w: 280, h: 250 }, pines: { kind: 'pines', w: 220, h: 220 },
  queue: { kind: 'queue', w: 230, h: 110 }, topiary: { kind: 'topiary', w: 120, h: 120 }, tree: { kind: 'tree', w: 140, h: 190 }, kiosk: { kind: 'kiosk', w: 130, h: 140 }, lamp: { kind: 'lamp', w: 60, h: 130 },
  crowd: { kind: 'crowd', w: 160, h: 90 }, cart: { kind: 'cart', w: 120, h: 110 }, bench: { kind: 'bench', w: 90, h: 70 }, urn: { kind: 'urn', w: 50, h: 60 }, balloons: { kind: 'balloons', w: 80, h: 150 },
};

const snowRoof = (g: Ctx, x0: number, x1: number, eave: number, peak: number, px: number, R: string[], Sn: string[]) => {
  polyF(g, [[x0 - 3, eave + 1], [px, peak - 2], [x1 + 3, eave + 1]], INK);
  polyF(g, [[x0, eave], [px, peak], [x1, eave]], R[2]); polyF(g, [[x0, eave], [px, peak], [px - 4, eave]], R[3]);
  for (let y = peak + 8; y < eave; y += 6) { const u = (y - peak) / (eave - peak); box(g, px - (px - x0) * u, y, (x1 - x0) * u, 1, R[1]); }
  // (the snow on it: heaped along the ridge and down the slopes, its lip ragged, icicles off the eaves)
  polyF(g, [[px - (px - x0) * 0.5, (peak + eave) / 2], [px, peak - 3], [px + (x1 - px) * 0.5, (peak + eave) / 2], [px, peak + 8]], Sn[4]);
  polyF(g, [[x0 - 2, eave], [x0 + 6, eave - 6], [x1 - 6, eave - 6], [x1 + 2, eave]], Sn[3]);
  box(g, x0 - 2, eave - 1, x1 - x0 + 4, 2, Sn[5]);
  for (let x = x0 + 3; x < x1 - 2; x += 7) box(g, x, eave + 1, 2, 2 + ((x * 3) % 5), Sn[2]);
};
const pennant = (g: Ctx, x: number, top: number, col: string) => { box(g, x, top - 14, 1, 14, D('#4A4060')[2]); polyF(g, [[x + 1, top - 14], [x + 12, top - 11], [x + 1, top - 8]], D(col)[3]); };
const turret = (g: Ctx, x: number, foot: number, w: number, h: number, roof: string) => {
  const S = D('#C8BCD8'), Rf = D(roof), G = warmGlass();
  box(g, x - w / 2 - 1, foot - h, w + 2, h, INK); box(g, x - w / 2, foot - h, w, h, S[3]); box(g, x - w / 2, foot - h, w * 0.28, h, S[4]); box(g, x + w * 0.22, foot - h, w * 0.28, h, S[2]);
  for (let y = foot - h + 8; y < foot; y += 9) box(g, x - w / 2, y, w, 1, S[2]);
  for (let k = 0; k < Math.floor(h / 30); k++) { box(g, x - 3, foot - h + 10 + k * 30, 6, 10, INK); box(g, x - 2, foot - h + 11 + k * 30, 4, 8, G[3 + (k % 2)]); }
  polyF(g, [[x - w / 2 - 4, foot - h], [x, foot - h - w * 1.5], [x + w / 2 + 4, foot - h]], INK);
  polyF(g, [[x - w / 2 - 3, foot - h], [x, foot - h - w * 1.5 + 1], [x + w / 2 + 3, foot - h]], Rf[2]); polyF(g, [[x - w / 2 - 3, foot - h], [x, foot - h - w * 1.5 + 1], [x - w * 0.1, foot - h]], Rf[4]);
  box(g, x - w / 2 - 4, foot - h - 3, w + 8, 3, GOLD.map(dimmed)[3]);
  pennant(g, x, foot - h - w * 1.5, '#F49AC8');
};
const bulbRow = (g: Ctx, x0: number, x1: number, y: number, sag: number, n: number) => {
  const on = lit(), cols = ['#FFE9A8', '#FFB0D8', '#A8E8FF', '#C8FFB8'];
  g.strokeStyle = D('#2A2430')[2]; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, y); g.quadraticCurveTo((x0 + x1) / 2, y + sag * 2, x1, y); g.stroke();
  for (let k = 1; k < n; k++) { const u = k / n, bx = x0 + (x1 - x0) * u, by = y + 2 * u * (1 - u) * sag * 2; box(g, bx - 1, by, 3, 3, on ? cols[k % 4] : D(cols[k % 4])[2]); }
};
export const lampPost = (g: Ctx, x: number, h: number, banner?: string) => {
  const I = IRON.map(dimmed), on = lit();
  postR(g, x, -h, 0, 4, I); box(g, x - 5, -6, 10, 6, INK); box(g, x - 4, -5, 8, 5, I[3]);
  box(g, x - 7, -h - 12, 14, 12, INK); box(g, x - 6, -h - 11, 12, 10, on ? '#FFE6A0' : D('#E8D8A8')[3]); box(g, x - 6, -h - 11, 3, 10, on ? '#FFF8D8' : D('#E8D8A8')[4]);
  polyF(g, [[x - 9, -h - 12], [x, -h - 20], [x + 9, -h - 12]], I[2]); ballR(g, x, -h - 22, 2, GOLD.map(dimmed));
  if (on) { g.globalAlpha = 0.18; g.fillStyle = '#FFE6A0'; g.beginPath(); g.arc(x, -h - 6, 16, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
  if (banner) { const B = D(banner); box(g, x + 2, -h + 14, 16, 3, I[2]); box(g, x + 4, -h + 17, 12, 30, INK); box(g, x + 5, -h + 17, 10, 28, B[3]); box(g, x + 5, -h + 17, 2, 28, B[4]); polyF(g, [[x + 5, -h + 45], [x + 10, -h + 40], [x + 15, -h + 45]], INK); box(g, x + 8, -h + 24, 4, 4, GOLD.map(dimmed)[4]); }
};
export const rails = (g: Ctx, x0: number, x1: number, y: number) => {
  const Br = GOLD.map(dimmed), Vel = D('#8A1A4A');
  for (let x = x0; x <= x1; x += 30) { box(g, x - 2, y - 26, 4, 26, INK); box(g, x - 1, y - 25, 2, 25, Br[3]); ballR(g, x, y - 27, 2, Br); box(g, x - 4, y - 2, 8, 2, Br[2]); }
  for (let x = x0; x < x1; x += 30) { g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y - 22); g.quadraticCurveTo(x + 15, y - 14, x + 30, y - 22); g.stroke(); g.strokeStyle = Vel[3]; g.lineWidth = 1.6; g.stroke(); }
};

const paintProp = (g: Ctx, kind: Kind, seed: number, up: boolean) => {
  const Sn = SNOW.map(dimmed), G = warmGlass();
  switch (kind) {
    case 'shop': {
      // (a storybook gift shop: plaster and oak, a jettied upper floor, a glowing bay, a shingle, a turret)
      const Pl = PLASTER.map(dimmed), Tb = TIMBER.map(dimmed), Sl = SLATE.map(dimmed), w = 190, h = 120, x0 = -110;
      box(g, x0 - 1, -h, w + 2, h, INK); slab(g, x0, -h, w, h, Pl);
      box(g, x0 - 6, -h + 56, w + 12, 6, INK); box(g, x0 - 5, -h + 57, w + 10, 4, Tb[3]);
      for (let x = x0; x <= x0 + w; x += 38) { box(g, x, -h, 5, h, Tb[2]); box(g, x, -h, 1, h, Tb[4]); }
      for (let x = x0 + 4; x < x0 + w - 30; x += 38) { g.strokeStyle = Tb[2]; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 4, -h + 4); g.lineTo(x + 34, -h + 54); g.stroke(); }
      // (the bay: leaded glass glowing, goods in it: plush dragons, wands)
      box(g, x0 + 30, -50, 80, 46, INK); box(g, x0 + 32, -48, 76, 42, G[3]); box(g, x0 + 32, -48, 76, 10, G[4]);
      for (let x = x0 + 44; x < x0 + 108; x += 13) box(g, x, -48, 1, 42, G[1]);
      for (let k = 0; k < 4; k++) { const cx = x0 + 40 + k * 18, col = ['#C42828', '#3A8ED8', '#E2B21E', '#C42828'][k]; box(g, cx, -20, 10, 8, D(col)[3]); box(g, cx + 7, -26, 5, 6, D(col)[3]); box(g, cx + 9, -25, 1, 1, INK); }
      box(g, x0 + 28, -6, 84, 4, Tb[1]);
      box(g, x0 + 132, -64, 34, 64, INK); box(g, x0 + 134, -62, 30, 62, Tb[3]); box(g, x0 + 134, -62, 30, 4, Tb[4]); box(g, x0 + 158, -32, 3, 3, GOLD.map(dimmed)[4]);
      for (const wx of [x0 + 20, x0 + 80, x0 + 140]) { box(g, wx, -h + 16, 24, 26, INK); box(g, wx + 2, -h + 18, 20, 22, G[2 + (seed % 2)]); box(g, wx + 11, -h + 18, 1, 22, Tb[1]); box(g, wx + 2, -h + 28, 20, 1, Tb[1]); }
      snowRoof(g, x0 - 10, x0 + w + 10, -h, -h - 80, x0 + w / 2, Sl, Sn);
      box(g, x0 + 140, -h - 64, 12, 30, INK); box(g, x0 + 141, -h - 63, 10, 29, D('#8A4A3A')[3]); box(g, x0 + 139, -h - 66, 14, 4, Sn[4]);
      // (the shingle off its bracket: a dragon plush painted on it)
      box(g, x0 + 4, -h + 70, 30, 2, IRON.map(dimmed)[2]); box(g, x0 + 10, -h + 74, 22, 18, INK); box(g, x0 + 11, -h + 75, 20, 16, D('#1E3A6E')[3]); box(g, x0 + 15, -h + 80, 10, 6, D('#C42828')[4]); box(g, x0 + 22, -h + 77, 5, 4, D('#C42828')[4]);
      turret(g, x0 + w + 26, 0, 36, 170, seed % 2 ? '#4A78D4' : '#8A4AA8');
      break;
    }
    case 'carousel': {
      // (a little carousel: its striped canopy, scalloped valance, horses up and down on their poles, the drum)
      const Gd = GOLD.map(dimmed), Pk = D('#E86AA8'), Wh = D('#FFF4F8');
      box(g, -110, -20, 220, 20, INK); box(g, -108, -18, 216, 16, D('#6A3A8A')[3]); box(g, -108, -18, 216, 3, D('#6A3A8A')[4]);
      for (let k = 0; k < 9; k++) box(g, -100 + k * 25, -14, 6, 6, lit() ? '#FFE9A8' : Gd[3]);
      box(g, -4, -160, 8, 142, INK); box(g, -3, -160, 6, 142, Gd[3]); box(g, -3, -160, 2, 142, Gd[5]);
      for (let k = 0; k < 4; k++) {
        const hx = -78 + k * 52, hy = -60 - ((k + seed) % 2) * 14, col = ['#F4F0FA', '#E8C8A0', '#B8A0F0', '#F4F0FA'][k], H = D(col);
        box(g, hx - 1, -150, 2, 132, Gd[3]);
        box(g, hx - 14, hy, 28, 12, INK); box(g, hx - 13, hy + 1, 26, 10, H[3]); box(g, hx - 13, hy + 1, 26, 3, H[4]);
        box(g, hx + 10, hy - 12, 8, 14, INK); box(g, hx + 11, hy - 11, 6, 12, H[3]); box(g, hx + 13, hy - 13, 7, 6, H[3]);
        for (const lx of [-11, -4, 4, 10]) box(g, hx + lx, hy + 11, 2, 9, H[2]);
        box(g, hx - 8, hy - 2, 12, 3, D(['#C8283E', '#2E5AAE', '#E0AE3A', '#2E8A5A'][k])[3]);
      }
      polyF(g, [[-122, -150], [0, -196], [122, -150]], INK);
      for (let k = 0; k < 10; k++) polyF(g, [[-120 + k * 24, -150], [0, -194], [-96 + k * 24, -150]], k % 2 ? Pk[3] : Wh[3]);
      for (let k = 0; k < 10; k++) { g.fillStyle = k % 2 ? Gd[3] : Pk[2]; g.beginPath(); g.arc(-108 + k * 24, -150, 12, 0, Math.PI); g.fill(); }
      box(g, -122, -153, 244, 4, Gd[4]);
      if (lit()) for (let k = 0; k < 14; k++) box(g, -116 + k * 17, -146, 2, 2, ['#FFE9A8', '#FFB0D8'][k % 2]);
      ballR(g, 0, -200, 6, Gd); pennant(g, 0, -206, '#F6D365');
      break;
    }
    case 'teacups': {
      // (the teacups: a lantern roof on its posts, the cups tipping round under it, a giant teapot in the middle)
      const Gd = GOLD.map(dimmed), Rf = D('#3A9A8A');
      box(g, -110, -12, 220, 12, INK); box(g, -108, -10, 216, 9, D('#E8D8F0')[3]);
      for (const px of [-100, -34, 34, 100]) postR(g, px, -120, -10, 6, D('#C8BCD8'));
      box(g, -18, -70, 36, 58, INK); box(g, -16, -68, 32, 56, D('#F4F0FA')[3]); box(g, -16, -68, 8, 56, D('#F4F0FA')[4]); box(g, 16, -54, 16, 6, D('#F4F0FA')[2]); box(g, -26, -60, 10, 22, D('#F4F0FA')[2]);
      ballR(g, 0, -74, 6, D('#E86AA8'));
      for (let k = 0; k < 5; k++) { const cx = -88 + k * 44, tilt = ((k + seed) % 3) - 1, col = ['#F49AC8', '#9CD0F4', '#F6D365', '#B8A0F0', '#A8E8C8'][k], C = D(col); box(g, cx - 15, -36 + tilt * 2, 30, 24, INK); box(g, cx - 14, -35 + tilt * 2, 28, 22, C[3]); box(g, cx - 14, -35 + tilt * 2, 28, 5, C[4]); box(g, cx + 14, -30, 6, 10, C[2]); for (let p = 0; p < 2; p++) { box(g, cx - 8 + p * 9, -46 + tilt * 2, 6, 10, D(['#F2C8A0', '#8A5A36'][p])[3]); } }
      polyF(g, [[-124, -118], [0, -166], [124, -118]], INK); polyF(g, [[-120, -120], [0, -164], [120, -120]], Rf[3]); polyF(g, [[-120, -120], [0, -164], [-20, -120]], Rf[4]);
      for (let k = 0; k < 12; k++) { g.fillStyle = k % 2 ? Gd[3] : Rf[2]; g.beginPath(); g.arc(-110 + k * 20, -120, 10, 0, Math.PI); g.fill(); }
      for (const lx of [-80, 0, 80]) { box(g, lx - 5, -112, 10, 14, INK); box(g, lx - 4, -111, 8, 12, lit() ? '#FFD88A' : D('#E8C888')[3]); }
      pennant(g, 0, -166, '#E86AA8');
      break;
    }
    case 'gate': {
      // (a gatehouse: two round towers, the arch between with its portcullis up, banners, crenellations dim)
      const St = D('#9A90B4'), Bn = D(['#B01C24', '#1E5AA8', '#C89A10'][seed % 3]);
      box(g, -80, -170, 160, 170, INK); slab(g, -79, -169, 158, 169, St);
      for (let y = -152; y < 0; y += 16) box(g, -79, y, 158, 1, St[1]);
      for (let x = -80; x < 80; x += 24) { box(g, x, -186, 16, 17, INK); box(g, x + 1, -185, 14, 16, St[3]); box(g, x + 1, -185, 3, 16, St[4]); }
      g.fillStyle = INK; g.beginPath(); g.moveTo(-36, 0); g.lineTo(-36, -80); g.arc(0, -80, 36, Math.PI, 0); g.lineTo(36, 0); g.closePath(); g.fill();
      g.fillStyle = D('#1A1028')[2]; g.beginPath(); g.moveTo(-32, 0); g.lineTo(-32, -80); g.arc(0, -80, 32, Math.PI, 0); g.lineTo(32, 0); g.closePath(); g.fill();
      for (let x = -28; x < 30; x += 9) box(g, x, -112, 2, 18, IRON.map(dimmed)[3]);
      box(g, -26, -60, 52, 60, G[2]); box(g, -26, -60, 52, 6, G[4]);
      for (const bx of [-64, 46]) { box(g, bx, -150, 18, 70, INK); box(g, bx + 1, -149, 16, 66, Bn[3]); box(g, bx + 1, -149, 3, 66, Bn[4]); polyF(g, [[bx + 1, -83], [bx + 9, -90], [bx + 17, -83]], INK); }
      turret(g, -104, 0, 48, 210, '#4A78D4'); turret(g, 104, 0, 48, 210, '#4A78D4');
      break;
    }
    case 'pines': {
      const P = PINE.map(dimmed);
      for (let k = 0; k < 5; k++) { const x = -90 + k * 44 + hash(seed + k) * 14, h = 120 + hash(seed * 3 + k) * 90; farPine(g, x, 0, h, [P[2], P[3]], Sn[4]); box(g, x - 3, -10, 6, 10, TIMBER.map(dimmed)[2]); }
      lampPost(g, 6, 100);
      break;
    }
    case 'queue': {
      // (a queue maze: three switchbacks of brass posts and velvet rope, the guests winding through, a canopy's posts)
      const Cv = D(seed % 2 ? '#2E5AAE' : '#8A2A5A');
      for (const px of [-108, 0, 108]) postR(g, px, -104, 0, 5, IRON.map(dimmed));
      for (let k = 0; k < 12; k++) polyF(g, [[-114 + k * 19, -104], [-104.5 + k * 19, -114], [-95 + k * 19, -104]], k % 2 ? Cv[3] : D('#FFF4F8')[3]);
      box(g, -114, -104, 228, 3, Cv[1]);
      for (let row = 0; row < 3; row++) {
        const y = -row * 10;
        for (let k = 0; k < 7; k++) guest(g, -96 + k * 30 + (row % 2) * 14, y, seed * 31 + row * 7 + k, 'stand');
        rails(g, -110, 110, y + 2);
      }
      break;
    }
    case 'topiary': {
      // (a dragon clipped out of a hedge, snow on its back)
      const Hg = D('#2E6A3A');
      const blob = (x: number, y: number, rx: number, ry: number) => { g.fillStyle = INK; g.beginPath(); g.ellipse(x, y, rx + 1, ry + 1, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = Hg[3]; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = Hg[4]; g.beginPath(); g.ellipse(x - rx * 0.3, y - ry * 0.3, rx * 0.5, ry * 0.4, 0, 0, Math.PI * 2); g.fill(); checker(g, x - rx, y + ry * 0.4, rx * 2, 2, Hg[2], 0, 2); };
      box(g, -34, -16, 68, 16, INK); box(g, -33, -15, 66, 15, D('#8A5A3A')[3]); box(g, -33, -15, 66, 3, D('#8A5A3A')[4]);
      blob(-6, -40, 30, 20); blob(26, -66, 10, 22); blob(36, -88, 14, 9); blob(-40, -46, 12, 8); blob(-52, -54, 8, 6);
      polyF(g, [[-14, -58], [-4, -78], [6, -58]], Hg[3]); polyF(g, [[4, -56], [14, -72], [20, -56]], Hg[3]);
      box(g, 40, -92, 3, 3, INK);
      box(g, -30, -60, 40, 4, Sn[4]); box(g, 28, -98, 14, 3, Sn[4]); box(g, 18, -86, 10, 3, Sn[4]);
      break;
    }
    case 'tree': {
      // (a bare tree strung with fairy lights, snow along its boughs)
      const Bk = D('#4A3A40');
      postR(g, 0, -120, 0, 10, Bk);
      g.lineCap = 'round';
      for (let b = 0; b < 7; b++) {
        const by = -60 - b * 16, s = b % 2 ? 1 : -1, len = 54 - b * 5, ex = s * len, ey = by - 26;
        g.strokeStyle = INK; g.lineWidth = 6 - b * 0.5; g.beginPath(); g.moveTo(0, by); g.quadraticCurveTo(s * len * 0.5, by - 4, ex, ey); g.stroke();
        g.strokeStyle = Bk[3]; g.lineWidth = 4 - b * 0.4; g.stroke();
        box(g, s > 0 ? 4 : ex, ey + 2, Math.abs(ex) - 4, 2, Sn[4]);
        bulbRow(g, 0, ex, by - 2, 4, 6);
      }
      g.lineCap = 'butt';
      box(g, -18, -4, 36, 4, Sn[3]);
      break;
    }
    case 'kiosk': {
      // (the ON-RIDE PHOTO kiosk: its screens of dragons and screaming riders, a little roof)
      const Wd = D('#5A3A6A'), Gd = GOLD.map(dimmed);
      box(g, -56, -100, 112, 100, INK); slab(g, -55, -99, 110, 99, Wd);
      for (let k = 0; k < 3; k++) { const sx = -46 + k * 32; box(g, sx, -88, 28, 22, INK); box(g, sx + 1, -87, 26, 20, D(['#E86A2A', '#3A8ED8', '#E2B21E'][k])[2]); box(g, sx + 4, -80, 12, 6, D(['#C42828', '#3A8ED8', '#E2B21E'][k])[4]); box(g, sx + 16, -84, 3, 3, D('#F2C8A0')[4]); box(g, sx + 20, -84, 3, 3, D('#8A5A36')[4]); }
      box(g, -40, -56, 80, 14, INK); box(g, -39, -55, 78, 12, Gd[3]); box(g, -39, -55, 78, 2, Gd[5]);
      for (let k = 0; k < 6; k++) box(g, -32 + k * 12, -51, 6, 4, Wd[1]);
      box(g, -20, -34, 40, 34, G[3]);
      snowRoof(g, -66, 66, -100, -132, 0, SLATE.map(dimmed), Sn);
      break;
    }
    case 'lamp': lampPost(g, 0, 110, ['#C8283E', '#2E5AAE', '#E0AE3A', '#7A3AAA'][seed % 4]); break;
    case 'crowd': {
      // (the crowd behind the rail, looking up at the ride: pointing, cheering, phones up; a kid on shoulders)
      for (let k = 0; k < 5; k++) {
        const pose: GPose = (['point', 'cheer', 'phone', 'stand', 'cheer'] as const)[(k + seed) % 5];
        guest(g, -60 + k * 30 + (hash(seed + k) - 0.5) * 6, -2, seed * 13 + k, pose, up);
      }
      if (seed % 3 === 0) guest(g, 14, -54, seed * 5 + 1, 'cheer', up);
      rails(g, -78, 78, 0);
      break;
    }
    case 'cart': {
      // (a cart: BUTTER BREW (its steaming urn) or TURKEY LEGS (a rack of them), a striped canopy, spoked wheels)
      const brew = seed % 2 === 0, Cb = D(brew ? '#C89A3A' : '#8A3A2A'), Cv = D(brew ? '#E0AE3A' : '#C8283E'), Gd = GOLD.map(dimmed);
      box(g, -40, -46, 80, 34, INK); slab(g, -39, -45, 78, 32, Cb);
      for (const wx of [-26, 26]) { g.fillStyle = INK; g.beginPath(); g.arc(wx, -10, 10, 0, Math.PI * 2); g.fill(); g.strokeStyle = Gd[3]; g.lineWidth = 2; g.beginPath(); g.arc(wx, -10, 8, 0, Math.PI * 2); g.stroke(); for (let s = 0; s < 4; s++) { const a = (s * Math.PI) / 4; g.beginPath(); g.moveTo(wx - Math.cos(a) * 8, -10 - Math.sin(a) * 8); g.lineTo(wx + Math.cos(a) * 8, -10 + Math.sin(a) * 8); g.stroke(); } }
      for (const px of [-36, 36]) postR(g, px, -96, -46, 3, IRON.map(dimmed));
      for (let k = 0; k < 8; k++) polyF(g, [[-46 + k * 11.5, -96], [-40 + k * 11.5, -106], [-34.5 + k * 11.5, -96]], k % 2 ? Cv[3] : D('#FFF4F8')[3]);
      for (let k = 0; k < 8; k++) { g.fillStyle = k % 2 ? Cv[2] : D('#FFF4F8')[2]; g.beginPath(); g.arc(-40 + k * 11.5, -96, 5.5, 0, Math.PI); g.fill(); }
      if (brew) { box(g, -14, -70, 26, 24, INK); box(g, -13, -69, 24, 22, D('#B87A2A')[4]); box(g, -13, -69, 6, 22, D('#E8B060')[4]); box(g, -4, -76, 6, 6, Gd[3]); box(g, 12, -56, 6, 3, Gd[2]); }
      else for (let k = 0; k < 5; k++) { box(g, -24 + k * 11, -66, 8, 16, INK); box(g, -23 + k * 11, -65, 6, 12, D('#A8642E')[4]); box(g, -21 + k * 11, -54, 2, 6, D('#F4ECD8')[3]); }
      box(g, -30, -40, 60, 10, D('#FFF4E0')[3]);
      guest(g, 52, 0, seed * 3 + 2, 'stand');
      break;
    }
    case 'bench': {
      const Wd = D('#7A4A2A'), I = IRON.map(dimmed);
      box(g, -40, -24, 80, 5, INK); box(g, -39, -23, 78, 3, Wd[4]); box(g, -40, -44, 80, 18, INK); for (let k = 0; k < 3; k++) box(g, -39, -43 + k * 6, 78, 4, Wd[3 - (k % 2)]);
      for (const lx of [-34, 30]) { box(g, lx, -24, 4, 24, I[2]); }
      guest(g, -14, -18, seed * 7, 'sit'); if (seed % 2) guest(g, 14, -18, seed * 7 + 3, 'sit');
      box(g, -42, -46, 84, 3, Sn[4]);
      break;
    }
    case 'urn': {
      const St = D('#B8B0C8'), Fl = ['#F472B6', '#FDE047', '#A78BFA', '#FB7185'];
      polyF(g, [[-16, 0], [-12, -10], [-20, -20], [-22, -34], [22, -34], [20, -20], [12, -10], [16, 0]], INK);
      polyF(g, [[-14, -1], [-10, -10], [-18, -20], [-20, -32], [20, -32], [18, -20], [10, -10], [14, -1]], St[3]); box(g, -18, -32, 6, 14, St[4]);
      for (let k = 0; k < 9; k++) ballR(g, -16 + k * 4, -38 - (k % 3) * 4, 3, D(Fl[k % 4]));
      box(g, -20, -46, 40, 4, Sn[4]);
      break;
    }
    case 'balloons': {
      const cols = ['#F472B6', '#FDE047', '#60A5FA', '#4ADE80', '#C084FC', '#FB7185'];
      guest(g, 0, 0, seed * 11 + 5, 'stand');
      for (let k = 0; k < 9; k++) {
        const bx = (hash(seed + k * 3) - 0.5) * 60, by = -100 - hash(seed * 2 + k) * 40, C = D(cols[k % 6]);
        g.strokeStyle = D('#E8E0F0')[3]; g.lineWidth = 1; g.beginPath(); g.moveTo(6, -40); g.lineTo(bx, by + 9); g.stroke();
        g.fillStyle = INK; g.beginPath(); g.ellipse(bx, by, 8, 10, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = C[3]; g.beginPath(); g.ellipse(bx, by, 7, 9, 0, 0, Math.PI * 2); g.fill(); box(g, bx - 4, by - 5, 2, 3, C[5]);
      }
      break;
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The rows

interface Row { d: number; step: number; kinds: Kind[] }
const ROWS: Row[] = [
  { d: 0.6, step: 640, kinds: ['shop', 'carousel', 'pines', 'teacups', 'shop', 'gate', 'pines'] },
  { d: 0.73, step: 300, kinds: ['queue', 'topiary', 'tree', 'kiosk', 'tree', 'queue', 'lamp', 'topiary'] },
  { d: 0.87, step: 210, kinds: ['crowd', 'lamp', 'cart', 'crowd', 'bench', 'urn', 'crowd', 'balloons', 'lamp', 'crowd'] },
];
/** Where nothing's put: the lagoon's (water), the mountain's footprint (behind it), the station's and the unload's
 *  halls (inside them). */
const skip = (t: Tragons, P: number, w: number) => {
  const lagA = S0X + LAGOON.a - 200, lagB = S0X + LAGOON.b + 200;
  if (t.phase !== 'done' && P + w > lagA && P - w < lagB) return true;
  const mA = S0X + TUNNEL.a - 450, mB = S0X + TUNNEL.b + 450;
  if (t.phase !== 'done' && P > mA && P < mB) return true;
  // (the station's hall, from its end wall to past the gate)
  if (P + w / 2 > STATION_X - 560 && P - w / 2 < GATE_X + 260) return true;
  // (the unload's hall and yard, out to the gate arch)
  const uP = t.phase === 'done' ? RX + TL : S0X + END_S + TL;
  if (P + w / 2 > uP - 160 && P - w / 2 < uP + (EXIT_X - DECK_X0) + 320) return true;
  return false;
};

/** The props on screen, each with its depth and how to draw it (art.ts sorts them in with the tracks). */
export const sceneryItems = (c: Ctx, state: GameState, t: Tragons, e: Eye): { d: number; draw: () => void }[] => {
  const v = viewBox(state), out: { d: number; draw: () => void }[] = [], f = state.frame, sc = scrollOf(t), tod = timeOfDay().key;
  for (const row of ROWS) {
    const d = row.d, gy = groundAt(e, d);
    if (gy - 260 * d > v.y + v.h + 40 || gy < v.y - 40) continue;
    // (the park x range on screen at this depth)
    const pa = e.x + (v.x - 200 - e.x) / d + sc, pb = e.x + (v.x + v.w + 200 - e.x) / d + sc;
    for (let n = Math.floor(pa / row.step); n * row.step < pb; n++) {
      const P = n * row.step + Math.floor(hash(n * 3.7 + d * 10) * row.step * 0.3);
      const kind = row.kinds[((n % row.kinds.length) + row.kinds.length) % row.kinds.length];
      const sz = SIZE[kind];
      if (skip(t, P, sz.w)) continue;
      const seed = Math.abs(n * 7 + Math.round(d * 100));
      const x = e.x + (parkX(t, P) - e.x) * d;
      if (x + sz.w * d < v.x - 20 || x - sz.w * d > v.x + v.w + 20) continue;
      const up = kind === 'crowd' ? (((f >> 4) + seed) & 1) === 1 : false;
      out.push({ d, draw: () => {
        c.save(); c.translate(x, gy); c.scale(d, d);
        banded(c, `tg-${kind}-${seed % 12}-${up ? 1 : 0}-${tod}`, -sz.w / 2 - 70, -sz.h - 60, sz.w + 140, sz.h + 64, g => paintProp(g, kind, seed % 12, up));
        c.restore();
      } });
    }
  }
  return out;
};

// ---------------------------------------------------------------------------------------------------------------
// The ground: lawns going back, mowed stripes, the paths, the beds, the lagoon

const FLOOR_D = [0.5, 0.55, 0.61, 0.68, 0.76, 0.85, 0.95, 1.06, 1.2, 1.38, 1.7];
export const drawFloor = (c: Ctx, state: GameState, t: Tragons, e: Eye) => {
  const v = viewBox(state), sc = scrollOf(t), f = state.frame;
  const yF = groundAt(e, FLOOR_D[0]), yN = groundAt(e, FLOOR_D[FLOOR_D.length - 1]);
  if (yN < v.y || yF > v.y + v.h) return;
  const L = ['#2E4E2A', '#3A6032', '#46723A', '#548442', '#64964E'];
  const lawn = (d: number, k: number) => fog(dimmed(L[Math.max(0, Math.min(4, k))]), d);
  const x0 = v.x - 20, w = v.w + 40;
  // (the lawns, banded: lighter going back into the haze; dithered where the bands meet)
  for (let i = 0; i < FLOOR_D.length - 1; i++) {
    const da = FLOOR_D[i], db = FLOOR_D[i + 1], ya = groundAt(e, da), yb = groundAt(e, db);
    if (yb < v.y || ya > v.y + v.h) continue;
    const col = lawn((da + db) / 2, 4 - Math.min(4, Math.floor(i / 2)));
    box(c, x0, ya, w, yb - ya + 1, col);
    if (i) checker(c, x0, ya - 1, w, 2, lawn(da, 4 - Math.min(4, Math.floor((i - 1) / 2))), 0, 2);
  }
  if (yN < v.y + v.h) box(c, x0, yN, w, v.y + v.h - yN + 20, lawn(1.7, 0));
  // (the mowed stripes, running back to the eye)
  const pOf = (x: number, d: number) => e.x + (x - e.x) / d + sc;
  const xOf = (P: number, d: number) => e.x + (P - sc - e.x) * d;
  const pa = Math.min(pOf(v.x - 40, FLOOR_D[0]), pOf(v.x - 40, 1.7)), pb = Math.max(pOf(v.x + v.w + 40, FLOOR_D[0]), pOf(v.x + v.w + 40, 1.7));
  const SW = 160;
  c.globalAlpha = 0.16; c.fillStyle = '#C8F0A0';
  for (let P = Math.floor(pa / SW) * SW; P < pb; P += SW * 2) {
    c.beginPath(); c.moveTo(xOf(P, FLOOR_D[0]), yF); c.lineTo(xOf(P + SW, FLOOR_D[0]), yF); c.lineTo(xOf(P + SW, 1.7), yN); c.lineTo(xOf(P, 1.7), yN); c.closePath(); c.fill();
  }
  c.globalAlpha = 1;
  // (the paths: the promenade going along at the back, a near one under the ride; flagstones, snow banked along)
  const path = (da: number, db: number, seed: number) => {
    const ya = groundAt(e, da), yb = groundAt(e, db);
    if (yb < v.y || ya > v.y + v.h) return;
    const dm = (da + db) / 2, Fl = FLAG.map(col => fog(dimmed(col), dm)), Sn = SNOW.map(col => fog(dimmed(col), dm));
    box(c, x0, ya, w, yb - ya, Fl[3]); box(c, x0, ya, w, Math.max(1, (yb - ya) * 0.2), Fl[4]);
    const rows = 3;
    for (let r = 1; r < rows; r++) box(c, x0, ya + ((yb - ya) * r) / rows, w, 1, Fl[2]);
    c.strokeStyle = Fl[2]; c.lineWidth = 1; c.beginPath();
    for (let P = Math.floor(pa / 44) * 44; P < pb; P += 44) { const off = (Math.floor(P / 44) % 2) * 22; c.moveTo(xOf(P + off + seed, da), ya); c.lineTo(xOf(P + off + seed, db), yb); }
    c.stroke();
    box(c, x0, ya - 3, w, 3, Sn[4]); checker(c, x0, ya - 5, w, 2, Sn[4], 0, 2); box(c, x0, yb, w, 3, Sn[3]); checker(c, x0, yb + 3, w, 2, Sn[3], 1, 2);
  };
  path(0.65, 0.7, 0);
  path(1.04, 1.12, 11);
  // (the flower beds: soil, the blooms in rows, a stone edge)
  const da = 0.77, db = 0.82, ya = groundAt(e, da), yb = groundAt(e, db);
  if (yb > v.y && ya < v.y + v.h) {
    const dm = (da + db) / 2, Fl = ['#F472B6', '#FDE047', '#A78BFA', '#FB7185', '#F8FAFC'];
    for (let P = Math.floor(pa / 760) * 760; P < pb; P += 760) {
      if (hash(P * 0.013) < 0.25) continue;
      const a = P + 120, b = a + 280;
      polyF(c, [[xOf(a, da), ya], [xOf(b, da), ya], [xOf(b, db), yb], [xOf(a, db), yb]], fog(dimmed('#4A3428'), dm));
      polyF(c, [[xOf(a, da), ya], [xOf(b, da), ya], [xOf(b, da), ya + 2], [xOf(a, da), ya + 2]], fog(dimmed('#B8B0C8'), dm));
      for (let r = 0; r < 3; r++) {
        const dr = da + (db - da) * (0.2 + r * 0.3), yr = groundAt(e, dr);
        for (let q = a + 10; q < b - 6; q += 14) box(c, xOf(q + r * 5, dr) - 1.5 * dr, yr - 2 * dr, 3 * dr, 3 * dr, fog(Fl[(Math.floor(q / 14) + r) % 5], dm));
      }
    }
  }
  // The lagoon at the splashdown's foot
  if (t.phase !== 'done') {
    const A = S0X + LAGOON.a, B = S0X + LAGOON.b;
    if (xOf(B, 1.7) > v.x - 40 && xOf(A, 1.7) < v.x + v.w + 40) {
      const ds = [0.6, 0.66, 0.74, 0.84, 0.96, 1.1, 1.28, 1.7];
      const Wt = ['#1E3A8A', '#24479E', '#2E58B4', '#3A6CC8', '#5486DA', '#7AA6E8'];
      // (the stone kerb round it, lit along its top)
      const kerb = fog(dimmed('#9A94AE'), 0.9), kerbHi = fog(dimmed('#D8D2E8'), 0.9);
      polyF(c, [[xOf(A - 30, ds[0]), groundAt(e, ds[0]) - 3], [xOf(B + 30, ds[0]), groundAt(e, ds[0]) - 3], [xOf(B + 30, 1.7), yN], [xOf(A - 30, 1.7), yN]], kerb);
      polyF(c, [[xOf(A - 30, ds[0]), groundAt(e, ds[0]) - 3], [xOf(B + 30, ds[0]), groundAt(e, ds[0]) - 3], [xOf(B + 30, ds[0]), groundAt(e, ds[0]) - 1], [xOf(A - 30, ds[0]), groundAt(e, ds[0]) - 1]], kerbHi);
      for (let i = 0; i < ds.length - 1; i++) {
        const a = ds[i], b = ds[i + 1];
        polyF(c, [[xOf(A, a), groundAt(e, a)], [xOf(B, a), groundAt(e, a)], [xOf(B, b), groundAt(e, b)], [xOf(A, b), groundAt(e, b)]], fog(Wt[5 - Math.min(5, i)], (a + b) / 2));
      }
      // (ripples drifting, lily pads, a rowboat tied up)
      for (let k = 0; k < 40; k++) {
        const dk = 0.62 + hash(k * 1.7) * 1.0, P = A + 40 + hash(k * 3.1) * (B - A - 80) + ((f * 0.3 + k * 17) % 60), y = groundAt(e, dk);
        if (P > B - 30) continue;
        box(c, xOf(P, dk), y, (10 + hash(k) * 16) * dk, Math.max(1, dk), fog('#A8CCF4', dk));
      }
      for (let k = 0; k < 7; k++) {
        const dk = 0.7 + hash(k * 5.3) * 0.6, P = A + 100 + hash(k * 2.9) * (B - A - 200), x = xOf(P, dk), y = groundAt(e, dk);
        c.fillStyle = fog('#2E8A3A', dk); c.beginPath(); c.ellipse(x, y, 12 * dk, 4 * dk, 0, 0, Math.PI * 2); c.fill();
        if (k % 2) box(c, x - 2 * dk, y - 4 * dk, 4 * dk, 3 * dk, fog('#F9A8D4', dk));
      }
      const bd = 0.78, bx = xOf(A + 120, bd), by = groundAt(e, bd);
      polyF(c, [[bx - 40 * bd, by - 10 * bd], [bx + 40 * bd, by - 10 * bd], [bx + 30 * bd, by + 2 * bd], [bx - 32 * bd, by + 2 * bd]], INK);
      polyF(c, [[bx - 38 * bd, by - 9 * bd], [bx + 38 * bd, by - 9 * bd], [bx + 29 * bd, by + 1 * bd], [bx - 31 * bd, by + 1 * bd]], fog(dimmed('#8A4A2E'), bd));
      box(c, bx - 38 * bd, by - 9 * bd, 76 * bd, 2 * bd, fog(dimmed('#C8784A'), bd));
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// THE FAKE MOUNTAIN (a painted plaster peak, snow on top: no crater, no lava, a coaster's mountain): behind the tracks,
// the tracks diving into its tunnel mouths.

export const drawMountain = (c: Ctx, state: GameState, t: Tragons, e: Eye) => {
  if (t.phase === 'done') return;
  const d = 0.92, mid = (TUNNEL.a + TUNNEL.b) / 2, v = viewBox(state);
  const bx = e.x + (parkX(t, S0X + mid) - e.x) * d, by = groundAt(e, d), w = (TUNNEL.b - TUNNEL.a + 900) * d, h = 1250 * d;
  if (bx + w / 2 < v.x - 40 || bx - w / 2 > v.x + v.w + 40 || by - h > v.y + v.h || by < v.y - 40) return;
  const tod = timeOfDay();
  const Rk = ['#3A2E3E', '#4E3E50', '#665464', '#7E6C7A', '#9A8894'].map(col => fog(dimmed(col), d)), Sn = SNOW.map(col => fog(dimmed(col), d));
  const P = (u: number, vv: number): [number, number] => [bx + u * w, by - vv * h];
  // (its outline: a main peak, a shoulder, ragged ridges down both sides)
  const outline: [number, number][] = [P(-0.5, 0), P(-0.44, 0.22), P(-0.36, 0.3), P(-0.3, 0.46), P(-0.2, 0.62), P(-0.12, 1), P(-0.04, 0.86), P(0.04, 0.9), P(0.12, 0.7), P(0.22, 0.62), P(0.3, 0.42), P(0.4, 0.3), P(0.5, 0)];
  polyF(c, outline.map(([x, y]) => [x + (x < bx ? -2 : 2), y - 2] as [number, number]), INK);
  polyF(c, outline, Rk[2]);
  // (the faces: lit to the upper left, shaded right, in steps; strata bands across)
  polyF(c, [P(-0.12, 1), P(-0.2, 0.62), P(-0.3, 0.46), P(-0.36, 0.3), P(-0.44, 0.22), P(-0.5, 0), P(-0.26, 0)], Rk[3]);
  polyF(c, [P(-0.12, 1), P(-0.16, 0.7), P(-0.24, 0.5), P(-0.2, 0)], Rk[4]);
  polyF(c, [P(-0.04, 0.86), P(0.04, 0.9), P(0.12, 0.7), P(0.22, 0.62), P(0.3, 0.42), P(0.4, 0.3), P(0.5, 0), P(0.06, 0)], Rk[1]);
  polyF(c, [P(0.12, 0.7), P(0.22, 0.62), P(0.3, 0.42), P(0.4, 0.3), P(0.5, 0), P(0.3, 0)], Rk[0]);
  for (let k = 1; k < 9; k++) { const vv = k * 0.09; c.globalAlpha = 0.5; box(c, bx - w * (0.5 - vv * 0.4), by - vv * h, w * (1 - vv * 0.8), 2 * d, Rk[k % 2 ? 1 : 3]); c.globalAlpha = 1; }
  // (the snow cap in three steps, its ragged lower edge, snow in the gullies)
  const cap: [number, number][] = [P(-0.12, 1), P(-0.2, 0.62), P(-0.17, 0.66), P(-0.13, 0.6), P(-0.09, 0.68), P(-0.05, 0.62), P(-0.01, 0.7), P(0.03, 0.66), P(0.08, 0.74), P(0.12, 0.7), P(0.04, 0.9), P(-0.04, 0.86)];
  polyF(c, cap, Sn[3]);
  polyF(c, [P(-0.12, 1), P(-0.2, 0.62), P(-0.17, 0.66), P(-0.13, 0.6), P(-0.09, 0.68), P(-0.08, 0.9)], Sn[5]);
  polyF(c, [P(0.12, 0.7), P(0.04, 0.9), P(0.0, 0.78), P(0.08, 0.74)], Sn[2]);
  for (const [u, vv] of [[-0.28, 0.44], [0.24, 0.56], [-0.36, 0.28], [0.34, 0.36]] as const) polyF(c, [P(u, vv), P(u + 0.03, vv - 0.12), P(u + 0.01, vv - 0.14), P(u - 0.02, vv - 0.04)], Sn[3]);
  // (plaster seams and bolts: it's fake)
  c.strokeStyle = Rk[0]; c.lineWidth = 2 * d;
  for (let k = 1; k < 7; k++) { c.beginPath(); c.moveTo(bx - w * 0.5 + k * w * 0.14, by); c.lineTo(bx - w * 0.5 + k * w * 0.14 + 40 * d, by - h * 0.28); c.stroke(); }
  // (a painted waterfall down its face into a pool, a maintenance door, pines round its foot)
  const fx = bx - w * 0.28;
  box(c, fx - 12 * d, by - h * 0.5, 24 * d, h * 0.5, fog('#3A6CC8', d)); box(c, fx - 12 * d, by - h * 0.5, 8 * d, h * 0.5, fog('#7AA6E8', d)); box(c, fx + 2 * d, by - h * 0.5, 2 * d, h * 0.5, fog('#C8E0FA', d));
  for (let k = 0; k < 6; k++) box(c, fx - 18 * d + k * 7 * d, by - 10 * d - ((state.frame + k * 5) % 8) * d, 6 * d, 4 * d, fog('#F0F8FF', d));
  const dx = bx + w * 0.3;
  box(c, dx - 1, by - 76 * d, 40 * d, 76 * d, INK); box(c, dx, by - 74 * d, 36 * d, 74 * d, fog(dimmed('#5A5A64'), d)); box(c, dx + 3 * d, by - 70 * d, 30 * d, 4 * d, fog(dimmed('#C8B84A'), d)); box(c, dx + 28 * d, by - 40 * d, 3 * d, 3 * d, fog('#B8B8C0', d));
  const Pn = PINE.map(col => fog(dimmed(col), d));
  for (let k = 0; k < 14; k++) { const u = -0.48 + k * 0.074, ph = (60 + hash(k * 3.3) * 70) * d; farPine(c, bx + u * w, by, ph, [Pn[2], Pn[3]], Sn[4]); }
  if (tod.lamps > 0.35) for (let k = 0; k < 6; k++) box(c, bx - w * 0.3 + k * w * 0.12, by - 30 * d, 3, 3, '#FFE6A0');
};
