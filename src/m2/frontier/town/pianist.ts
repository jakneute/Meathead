// The saloon's piano player (the final pass: peak SNES). Seated on a round stool at the upright, his back to us,
// turned three-quarters toward the keys at his left: a derby, slicked hair, a cigar, a striped shirt with its sleeves
// rolled and red sleeve garters, a satin-backed vest cinched with a buckle, pinstriped trousers, his legs bent under
// the keyboard (one foot on the pedal), his hands walking the keys (a four-frame loop). In the brawl he plays on,
// twice as fast, looking back over his shoulder at it, eyes wide, the cigar drooping, the derby jumping.
//
// Scenery (he can't be hurt: he plays on through anything). Feet at the origin (under the stool's middle); each
// frame painted once into a stamp; only the smoke is drawn live. Limbs from art/limb (knees forward, elbows out).

import { stamp } from '../../intro/art/kit';
import { box, mix, poly, INK } from './paint';
import { knee, elbowFront, reachTo, type P2 } from '../../art/limb';

type Ctx = CanvasRenderingContext2D;

const SKIN = ['#6A3A22', '#9A5A36', '#C8845A', '#E2A47A', '#F4C8A0'];
const HAIR = ['#120A06', '#2A1A10', '#4A3020'];
const HAT = ['#0E0C0C', '#1E1A1A', '#36302E', '#58504C'];
const VEST = ['#0E1E16', '#1A3226', '#2A4A38', '#3E6650', '#5E8A70'];
const SHIRT = ['#9A9284', '#C8C0B0', '#ECE4D4', '#FFFAF0'];
const STRIPE = '#A83A2E';
const PANTS = ['#16161C', '#24242C', '#34343E', '#4A4A56'];
const GARTER = ['#5A0E10', '#A8202A', '#E04A4A'];
const WOOD = ['#1E0E06', '#3A1C0C', '#5A3016', '#7A4620', '#9A5E2E', '#BA7A40'];
const VELVET = ['#3A0810', '#6A1020', '#9A1C30', '#C83A4A'];
const BRASSY = ['#6A4410', '#C8962E', '#FFF0A8'];

/** A limb: two bones, inked round, then filled (round caps: no gaps at the joints). */
const bones = (g: Ctx, a: P2, j: P2, e: P2, w: number, col: string, lit?: string) => {
  g.lineCap = 'round'; g.lineJoin = 'round';
  const path = () => { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(j[0], j[1]); g.lineTo(e[0], e[1]); };
  g.strokeStyle = INK; g.lineWidth = w + 2; path(); g.stroke();
  g.strokeStyle = col; g.lineWidth = w; path(); g.stroke();
  if (lit) { g.strokeStyle = lit; g.lineWidth = 1; g.beginPath(); g.moveTo(a[0] - w / 2 + 1, a[1]); g.lineTo(j[0] - w / 2 + 1, j[1]); g.stroke(); }
};
const seg = (g: Ctx, a: P2, b: P2, w: number, col: string, ink = true) => {
  g.lineCap = 'round';
  if (ink) { g.strokeStyle = INK; g.lineWidth = w + 2; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
  g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
};
const oval = (g: Ctx, x: number, y: number, rx: number, ry: number, col: string, a0 = 0, a1 = Math.PI * 2) => {
  g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, 0, a0, a1); g.fill();
};

const paintPianist = (g: Ctx, fr: number, brawl: boolean) => {
  const bob = fr % 2, walk = [0, 3, 5, 2][fr];
  // ---- the stool: three splayed claw feet, a turned brass-ringed pillar, a tufted velvet seat
  for (const [fx, fy] of [[-10, 0], [10, 0], [1, -2]] as const) { seg(g, [0, -9], [fx, fy - 1], 2, WOOD[2]); oval(g, fx, fy - 1, 2, 1.6, BRASSY[1]); box(g, fx - 1, fy - 2, 1, 1, BRASSY[2]); }
  box(g, -3, -21, 6, 13, INK); box(g, -2, -21, 4, 13, WOOD[3]); box(g, -2, -21, 1, 13, WOOD[5]); box(g, 1, -21, 1, 13, WOOD[1]);
  box(g, -3, -15, 6, 2, BRASSY[1]); box(g, -3, -15, 6, 1, BRASSY[2]); box(g, -4, -10, 8, 2, WOOD[2]);
  oval(g, 0, -22, 12, 4, INK); oval(g, 0, -22, 11, 3, WOOD[2]); box(g, -11, -22, 22, 2, WOOD[3]); box(g, -11, -22, 22, 1, WOOD[4]);
  oval(g, 0, -24, 11, 3, VELVET[1]); box(g, -10, -25, 6, 1, VELVET[3]); for (const tx of [-7, 0, 7]) box(g, tx, -23, 1, 1, VELVET[0]); box(g, 8, -24, 2, 1, VELVET[2]);
  // ---- the legs, bent under the keyboard (going off left, toward the keys): the far one first, darker; the near
  // one's foot on the pedal (its heel tapping the beat)
  const legs: [P2, P2, string[]][] = [[[1, -26], [-12, -3], [PANTS[0], PANTS[1]]], [[-4, -24], [-17 + (brawl ? bob : 0), -1 - (bob && !brawl ? 0 : bob)], [PANTS[1], PANTS[2]]]];
  for (const [hip, ft, P] of legs) {
    const end = reachTo(hip[0], hip[1], ft[0], ft[1], 13, 13), kn = knee(hip[0], hip[1], end[0], end[1], 13, 13, -1);
    bones(g, hip, kn, end, 7, P[1], P[0] === PANTS[1] ? PANTS[3] : undefined);
    for (let k = 1; k < 4; k++) { const t = k / 4; box(g, hip[0] + (kn[0] - hip[0]) * t, hip[1] + (kn[1] - hip[1]) * t - 2, 1, 1, PANTS[3]); }
    // (the shoe: a black oxford, toe pointed at the pedals, a spat of light on it)
    box(g, end[0] - 7, end[1] - 2, 9, 4, INK); box(g, end[0] - 6, end[1] - 1, 7, 2, '#1C1612'); box(g, end[0] - 5, end[1] - 1, 3, 1, '#5A4E44');
  }
  // ---- the seat of his pants on the stool
  oval(g, -1, -26, 11, 5, INK); oval(g, -1, -26, 10, 4, PANTS[2]); box(g, -9, -27, 8, 1, PANTS[3]);
  // ---- the arms out to the keys (behind the body at the shoulder, so drawn first): striped sleeves rolled to the
  // elbow, a red garter round each upper arm, forearms bare, the hands on the keys walking
  const shL: P2 = [-12, -48], shR: P2 = [7, -50];
  const hL: P2 = [-24 + walk, -41 + (bob ? -1 : 1)], hR: P2 = [12 + (3 - walk) * 0.7, -41 + (bob ? 1 : -1)];
  const arm = (sh: P2, h: P2, out: number) => {
    const end = reachTo(sh[0], sh[1], h[0], h[1], 11, 11), el = elbowFront(sh[0], sh[1], end[0], end[1], 11, 11, out);
    seg(g, sh, el, 7, SHIRT[2]);
    for (let k = 0; k < 3; k++) { const t = 0.2 + k * 0.28; box(g, sh[0] + (el[0] - sh[0]) * t - 3, sh[1] + (el[1] - sh[1]) * t, 6, 1, STRIPE); }
    const mid: P2 = [(sh[0] + el[0]) / 2, (sh[1] + el[1]) / 2];
    box(g, mid[0] - 4, mid[1] - 1, 8, 3, INK); box(g, mid[0] - 3, mid[1] - 1, 6, 2, GARTER[1]); box(g, mid[0] - 3, mid[1] - 1, 6, 1, GARTER[2]);
    seg(g, el, end, 5, SKIN[2]); box(g, el[0] - 4, el[1] - 2, 8, 4, SHIRT[1]); box(g, el[0] - 4, el[1] - 2, 8, 1, SHIRT[3]);
    // (the hand: knuckles down on the keys, fingers spread)
    box(g, end[0] - 4, end[1] - 2, 8, 5, INK); box(g, end[0] - 3, end[1] - 1, 6, 3, SKIN[3]); box(g, end[0] - 3, end[1] - 1, 6, 1, SKIN[4]);
    for (let k = 0; k < 3; k++) box(g, end[0] - 3 + k * 2, end[1] + 2, 1, 2, SKIN[2]);
  };
  arm(shL, hL, -1); arm(shR, hR, 1);
  // ---- the back: the vest's satin back over the striped shirt, its cinch strap and buckle, hunched to the keys
  const back: P2[] = [[-10, -24], [8, -24], [10, -40], [9, -51], [-2, -54], [-14, -50], [-13, -38]];
  poly(g, back.map(([x, y]) => [x - 1, y]) as [number, number][], INK);
  poly(g, [[-10, -25], [7, -25], [9, -40], [8, -50], [-2, -53], [-13, -49], [-12, -38]], VEST[2]);
  poly(g, [[-12, -38], [-13, -49], [-6, -52], [-7, -40], [-8, -26], [-10, -25]], VEST[3]);
  box(g, -12, -48, 2, 9, VEST[4]); box(g, 5, -48, 3, 22, VEST[1]);
  box(g, -2, -52, 1, 27, VEST[1]);
  for (let y = -50; y < -27; y += 3) for (let x = -10 + ((y / 3) & 1) * 2; x < 7; x += 4) box(g, x, y, 1, 1, VEST[(y + x) & 1 ? 3 : 1]);
  box(g, -9, -34, 16, 3, VEST[0]); box(g, -9, -34, 16, 1, VEST[3]); box(g, -3, -35, 4, 5, INK); box(g, -2, -34, 2, 3, BRASSY[1]); box(g, -2, -34, 1, 1, BRASSY[2]);
  // (the shirt at the armholes and the collar)
  box(g, -14, -50, 3, 4, SHIRT[2]); box(g, 7, -51, 3, 4, SHIRT[2]); box(g, -13, -49, 1, 3, STRIPE); box(g, 8, -50, 1, 3, STRIPE);
  box(g, -7, -56, 10, 4, INK); box(g, -6, -55, 8, 3, SHIRT[3]); box(g, -6, -53, 8, 1, SHIRT[1]);
  // ---- the head: the back of it (slicked), an ear and a sliver of cheek at his left; or turned back over his right
  // shoulder in the brawl (wide-eyed)
  const hx = brawl ? -1 : -3, hy = -61 - (brawl ? 1 : 0);
  box(g, hx - 2, hy + 3, 5, 4, SKIN[2]);
  oval(g, hx, hy, 8, 8, INK);
  if (!brawl) {
    oval(g, hx - 1, hy, 7, 7, SKIN[2]);
    oval(g, hx + 1, hy - 1, 6.5, 6.5, HAIR[1]); box(g, hx - 3, hy + 3, 9, 2, HAIR[0]); box(g, hx + 1, hy - 5, 3, 1, HAIR[2]); box(g, hx + 3, hy - 3, 2, 1, HAIR[2]);
    // (the ear, the cheek's edge, the mustache's waxed tip, the cigar)
    box(g, hx - 8, hy - 1, 3, 5, INK); box(g, hx - 7, hy, 2, 3, SKIN[3]); box(g, hx - 9, hy + 4, 3, 2, SKIN[3]);
    box(g, hx - 11, hy + 5, 4, 1, HAIR[1]); box(g, hx - 12, hy + 4, 1, 1, HAIR[1]);
    box(g, hx - 17, hy + 6, 8, 3, INK); box(g, hx - 16, hy + 7, 6, 1, '#6A3E1E'); box(g, hx - 17, hy + 6, 2, 3, fr % 2 ? '#F06A1E' : '#B4281A');
  } else {
    oval(g, hx, hy, 7, 7, SKIN[2]); oval(g, hx + 1, hy - 1, 6, 6, SKIN[3]);
    oval(g, hx - 2, hy - 2, 6, 5, HAIR[1], Math.PI * 0.9, Math.PI * 2.1); box(g, hx - 7, hy - 3, 4, 7, HAIR[1]);
    // (the face, turned to us over his shoulder: an eye wide, a brow up, his mouth an O, sweat flying)
    box(g, hx + 1, hy - 3, 5, 4, INK); box(g, hx + 2, hy - 2, 3, 2, '#FFFFFF'); box(g, hx + 3 + bob, hy - 2, 1, 2, INK);
    box(g, hx + 1, hy - 6 - bob, 5, 1, HAIR[0]); box(g, hx + 6, hy, 2, 3, SKIN[2]);
    box(g, hx + 2, hy + 3, 5, 1, HAIR[1]); box(g, hx + 3, hy + 4, 3, 3, INK); box(g, hx + 4, hy + 5, 1, 1, '#7F1D1D');
    box(g, hx + 7, hy + 5, 5, 2, INK); box(g, hx + 8, hy + 6, 4, 1, '#6A3E1E');
    box(g, hx + 9 + bob, hy - 7 - bob * 2, 2, 3, '#BFE0F8'); box(g, hx - 9 - bob, hy - 5 - bob, 2, 3, '#BFE0F8');
  }
  // ---- the derby: its dome lit from the upper left, its ribbon, its curled brim (jumping in the brawl)
  const dy = hy - 6 - (brawl && bob ? 3 : 0), dx = hx + 1;
  oval(g, dx, dy, 9, 8, INK, Math.PI, 0); oval(g, dx, dy, 8, 7, HAT[1], Math.PI, 0);
  oval(g, dx - 2, dy - 2, 4, 3, HAT[2], Math.PI, 0); box(g, dx - 4, dy - 6, 2, 1, HAT[3]);
  box(g, dx - 8, dy - 2, 16, 2, '#3A2A2A'); box(g, dx - 8, dy - 2, 16, 1, '#5A3E3E');
  oval(g, dx, dy, 12, 3, INK); oval(g, dx, dy, 11, 2, HAT[1]); box(g, dx - 11, dy, 22, 1, HAT[0]); box(g, dx - 10, dy - 1, 6, 1, HAT[3]);
  void mix;
};

const BOX: [number, number, number, number] = [-40, -84, 72, 88];
/** The piano player, feet (the stool's middle) at (x, y). */
export const drawPianist = (c: Ctx, x: number, y: number, f: number, brawl: boolean) => {
  const fr = Math.floor(f / (brawl ? 3 : 7)) % 4;
  c.save(); c.translate(Math.round(x), Math.round(y));
  stamp(c, `ft-pianist-${fr}-${brawl ? 1 : 0}`, BOX[0], BOX[1], BOX[2], BOX[3], g => paintPianist(g, fr, brawl));
  // (the cigar's smoke, curling up off it; none in the brawl (it's drooping, and he's busy))
  if (!brawl) for (let k = 0; k < 4; k++) {
    const t = ((f * 0.4 + k * 9) % 36) / 36;
    c.globalAlpha = 0.35 * (1 - t);
    box(c, -20 - t * 6 + Math.sin(t * 9 + k) * 3, -54 - t * 34, 3 + t * 4, 2 + t * 3, '#D8D0C8');
  }
  c.globalAlpha = 1;
  c.restore();
};
