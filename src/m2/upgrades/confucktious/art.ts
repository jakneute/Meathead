// CON-FUCK-TIOUS in the world (every land's meetup uses this). The owner: "just a buff generic japanese american man who
// speaks in riddles and shares much of meathead's sensibilities. like an older mentor." So: Ben Smith, a Japanese
// American lifelong gym rat in his fifties or sixties, built like a fridge: big traps, big arms, a barrel chest and a
// bit of a gut; a gray buzz cut, a short gray goatee, a nose broken a few times, a cauliflower ear, a toothpick, a gold
// tooth. A faded cut-off tank top (IRON in cracked letters, the arm holes cut to his belt), a beat-up leather lifting
// belt, baggy gray sweatpants, white high-top sneakers.
//
// Drawn at the land bosses' grade (the owner: "make sure ben's level of detail is at the same level as level bosses"):
// every material in its own five-step ramp (lit, base, shade, deep, line), stepped bands with dithered seams, outlined
// in its own darkest tone, lit from the upper left (harryArt.ts's painter: shapeR / tubeR, the same as Harry's). Muscle
// (the delt caps, the bicep's bulge, the forearm's swell and its veins, the traps, the lats under the arm holes), the gut
// pushing the tank top out over the belt, gray chest hair out of its scoop, the cloth's folds, the leather's stitching
// and cracks, the sneakers' laces and scuffs; the face: the buzz cut's stubble, a heavy brow with a scar through it, the
// narrow eye and the bag under it, the bent nose's bump, the lumpy ear, the goatee's texture, the smirk, the gold tooth's
// glint, the toothpick.
//
// Each pose is painted once into the stamp cache (m1 render/stamp.ts) and put down with one drawImage; only the
// flurry's frames and the odd live bit (stars round his head) change, and each of those is a pose of its own.
// What he's holding: the armor piece he's about to give (`piece`), drawn in his hands (or on them: the gloves), till
// he's given it (`piece` null: bare hands). Limbs from art/limb.ts (elbows and knees bend the right way).

import { stamp } from '../../../m1/game/render/stamp';
import { elbow, elbowFront, knee, reachTo } from '../../art/limb';
import { shapeR, tubeR, pxR, lineR, ellR, dith, mixHex, type Ramp } from '../../foreign/heli/harryArt';
import type { ArmorPiece } from '../state';
import { armorStamp } from '../armorArt';

type Ctx = CanvasRenderingContext2D;

/** What he's doing. 'flurry' is three frames (pass `frame`); the rest hold still. 'offer': holding something out (the
 *  trial's thing); 'yank': whipping it up out of reach; 'brace': dug in behind something, both hands on it, leaning in
 *  (Jungle Land's tackling sled). */
export type BenPose = 'stand' | 'flurry' | 'offer' | 'yank' | 'nuts' | 'give' | 'fold' | 'brace';

// ---------------------------------------------------------------------------------------------------------------
// Materials (lit, base, shade, deep, line)

/** His skin: a Japanese American man's, weathered and gym-tanned. */
const SKIN: Ramp = ['#F2C9A0', '#D59C6C', '#B2774C', '#875432', '#3C1E0E'];
/** ...winded (the nut shot): flushed. */
const SKIN_RED: Ramp = ['#F6BDA2', '#DE8A6C', '#BC6250', '#8C3C34', '#3E1210'];
/** The tank top: heather gray, washed a thousand times. */
const TANK: Ramp = ['#DADAE0', '#B0B0BA', '#8C8C98', '#686874', '#2C2C36'];
/** The sweatpants: darker gray fleece. */
const SWEAT: Ramp = ['#9E9EAC', '#787886', '#5C5C6A', '#42424F', '#1C1C26'];
/** The lifting belt: old brown leather. */
const BELT: Ramp = ['#BE8A50', '#8E5C2E', '#6C421F', '#4A2B12', '#1E1006'];
/** The high-tops: white leather, gone gray in the creases. */
const SHOE: Ramp = ['#FFFFFF', '#E8E8EF', '#C6C6D2', '#9898A8', '#3A3A48'];
/** Gray hair (the buzz cut, the goatee, the brows, the chest hair). */
const HAIR: Ramp = ['#EEEEF2', '#C2C2CA', '#9898A2', '#6C6C76', '#2E2E36'];
/** The giant white cartoon gloves. */
const GLOVE: Ramp = ['#FFFFFF', '#F2F2F8', '#D4D4E2', '#A6A4BC', '#4A4660'];
/** Steel (the belt's buckle). */
const STEEL: Ramp = ['#E6EAF0', '#AEB4BE', '#848A96', '#5A606C', '#22262E'];
/** The protein shaker: blue plastic, see-through. */
const SHAKER: Ramp = ['#BFDBFE', '#60A5FA', '#2563EB', '#1E3A8A', '#0E1A40'];
const GOLD = '#F5C842', TOOTHPICK = '#EAD7A0', WHITE = '#FFFFFF';

/** A ramp a step darker (the far side of him: the back arm, the back leg). */
const back = (R: Ramp): Ramp => [R[1], R[2], R[3], mixHex(R[3], R[4], 0.4), R[4]];

// ---------------------------------------------------------------------------------------------------------------
// Hands

/** A big bare fist: knuckles in a row (scarred), the fingers' creases, the thumb wrapped over, white athletic tape round
 *  the wrist. (x, y) its middle, `ang` the way the forearm comes into it. */
const fist = (g: Ctx, x: number, y: number, R: Ramp, ang: number) => {
  // (the tape round the wrist, on the forearm side)
  const tx = x - Math.cos(ang) * 5.6, ty = y - Math.sin(ang) * 5.6;
  lineR(g, [tx - Math.cos(ang) * 1.6, ty - Math.sin(ang) * 1.6, tx + Math.cos(ang) * 1.6, ty + Math.sin(ang) * 1.6], 9, SHOE[4], 'butt');
  lineR(g, [tx - Math.cos(ang) * 1.2, ty - Math.sin(ang) * 1.2, tx + Math.cos(ang) * 1.2, ty + Math.sin(ang) * 1.2], 7, SHOE[1], 'butt');
  pxR(g, tx - 3, ty - 3, 2, 1, WHITE);
  shapeR(g, () => g.roundRect(x - 5.6, y - 5, 11.2, 10, 3), R, x - 5.6, x + 5.6, 1);
  // (the knuckles, lit along their tops, a scar across two)
  for (let k = 0; k < 4; k++) { pxR(g, x - 4.4 + k * 2.6, y - 4.2, 1.8, 1.2, R[0]); pxR(g, x - 4.4 + k * 2.6, y - 3, 1.8, 0.8, dith(g, R[0])); }
  pxR(g, x - 1.4, y - 4.4, 3, 0.8, '#F8DCC4');
  // (the curled fingers' creases; the thumb across them)
  for (let k = 0; k < 3; k++) lineR(g, [x - 2.2 + k * 2.6, y - 2, x - 2.2 + k * 2.6, y + 0.4], 0.7, R[3]);
  lineR(g, [x - 4.6, y + 1.4, x + 1.6, y + 2.6], 2.2, R[3]); lineR(g, [x - 4.4, y + 1, x + 1.4, y + 2], 1.4, R[1]);
  pxR(g, x - 3.6, y + 0.6, 2, 0.8, R[0]);
};

/** A giant white four-finger cartoon glove (three fingers and a thumb), balled up or open, at (x, y), `big` its size:
 *  the rolled cuff and the three stitched lines on its back, the fingers curled over, the thumb across, scuffs. */
const glove = (g: Ctx, x: number, y: number, big = 1, open = false) => {
  const r = 7.4 * big;
  // (the cuff behind, rolled, its rim lit)
  shapeR(g, () => g.ellipse(x - r * 0.9, y + r * 0.35, r * 0.62, r * 0.95, -0.25, 0, Math.PI * 2), back(GLOVE), x - r * 1.5, x - r * 0.3, 1.1);
  lineR(g, [x - r * 1.25, y - r * 0.3, x - r * 1.1, y + r * 1.0], 0.8, GLOVE[0]);
  // (the fist itself)
  shapeR(g, () => g.ellipse(x, y, r, r * 0.92, 0, 0, Math.PI * 2), GLOVE, x - r, x + r, 1.2);
  // (the three stitched lines down its back)
  for (let i = 0; i < 3; i++) lineR(g, [x - r * 0.55 + i * r * 0.32, y - r * 0.6, x - r * 0.62 + i * r * 0.34, y + r * 0.1], 0.7, GLOVE[3]);
  if (open) {
    // (three fat fingers out straight, then the thumb up)
    for (let i = 0; i < 3; i++) {
      const fy = y - r * 0.5 + i * r * 0.5;
      shapeR(g, () => g.roundRect(x + r * 0.3, fy - r * 0.26, r * 1.15, r * 0.52, r * 0.26), GLOVE, x + r * 0.3, x + r * 1.45, 1);
    }
    shapeR(g, () => g.ellipse(x + r * 0.2, y - r * 0.95, r * 0.3, r * 0.5, 0.3, 0, Math.PI * 2), GLOVE, x - r * 0.1, x + r * 0.5, 1);
  } else {
    // (three fat fingers curled over the front, each lit on its top, the creases between)
    for (let i = 0; i < 3; i++) {
      const fx = x + r * 0.42, fy = y - r * 0.52 + i * r * 0.5;
      shapeR(g, () => g.ellipse(fx, fy, r * 0.5, r * 0.3, 0, 0, Math.PI * 2), GLOVE, fx - r * 0.5, fx + r * 0.5, 0.9);
      pxR(g, fx - r * 0.2, fy - r * 0.22, r * 0.36, 0.9, WHITE);
    }
    // (the thumb across under them)
    shapeR(g, () => g.ellipse(x - r * 0.05, y + r * 0.55, r * 0.6, r * 0.28, -0.15, 0, Math.PI * 2), GLOVE, x - r * 0.65, x + r * 0.55, 0.9);
  }
  // (scuffs: it's been used; the shine)
  pxR(g, x + r * 0.3, y + r * 0.1, 2, 1, dith(g, '#B8A890')); pxR(g, x - r * 0.4, y + r * 0.3, 1, 1, '#C8BAA4');
  pxR(g, x - r * 0.55, y - r * 0.6, 2, 1, WHITE); pxR(g, x - r * 0.6, y - r * 0.45, 1, 1, WHITE);
};

/** His protein shaker (the trial's), in his hand at (x, y): see-through blue, the scoop line and the marks up its side,
 *  the label, a black screw cap and the flip spout. */
const shaker = (g: Ctx, x: number, y: number) => {
  shapeR(g, () => { g.moveTo(x - 4.6, y - 15); g.lineTo(x + 4.6, y - 15); g.lineTo(x + 4, y); g.lineTo(x - 4, y); g.closePath(); }, SHAKER, x - 4.6, x + 4.6, 1);
  // (the shake in it, the line it's at; the marks; the label)
  pxR(g, x - 3.6, y - 8, 7.2, 7.4, dith(g, '#E8DCC8')); pxR(g, x - 3.6, y - 8.6, 7.2, 0.8, '#F4ECDC');
  for (let k = 0; k < 4; k++) pxR(g, x + 1.6, y - 13 + k * 3, 2, 0.6, SHAKER[0]);
  pxR(g, x - 3.6, y - 12, 7.2, 3, '#F8FAFC'); pxR(g, x - 2.6, y - 11, 2, 1, '#DC2626'); pxR(g, x, y - 11, 2.4, 1, SHAKER[3]);
  // (the cap, the spout up)
  shapeR(g, () => g.roundRect(x - 4.8, y - 19, 9.6, 4.4, 1), ['#4A4A56', '#26262E', '#18181E', '#0E0E12', '#050508'], x - 4.8, x + 4.8, 0.9);
  for (let k = 0; k < 4; k++) pxR(g, x - 3.6 + k * 2.2, y - 18, 1, 2.6, '#3A3A44');
  shapeR(g, () => g.rect(x + 0.6, y - 22.4, 2.4, 3.6), ['#4A4A56', '#26262E', '#18181E', '#0E0E12', '#050508'], x + 0.6, x + 3, 0.8);
  pxR(g, x - 3.8, y - 14.4, 1, 13, WHITE);
};

// ---------------------------------------------------------------------------------------------------------------
// Poses

/** Where his hands go in each pose (local, facing +x: [front hand, back hand]), how far he's hunched, how far he leans. */
const HANDS: Record<Exclude<BenPose, 'flurry'>, { f: [number, number]; b: [number, number]; drop?: number; lean?: number }> = {
  stand: { f: [25, -38], b: [-15, -37] },
  offer: { f: [38, -50], b: [-15, -37] },
  yank: { f: [22, -94], b: [-15, -37] },
  nuts: { f: [12, -28], b: [4, -27], drop: 7, lean: 7 },
  give: { f: [38, -48], b: [32, -46] },
  // (hands on his hips, elbows out: the coach watching)
  fold: { f: [16, -40], b: [-9, -40] },
  // (dug in behind the sled: both hands on its pad, shoulders down into it)
  brace: { f: [36, -50], b: [31, -47], drop: 5, lean: 7 },
};
const FLURRY: [number, number][][] = [[[42, -62], [16, -52]], [[24, -52], [38, -60]], [[41, -66], [16, -52]]];

// ---------------------------------------------------------------------------------------------------------------
// The parts

/** A leg: the baggy sweatpants from the hip down past the knee to the cuff gathered at the ankle, its folds; the white
 *  high-top. */
const leg = (g: Ctx, hip: [number, number], fx: number, far: boolean) => {
  const R = far ? back(SWEAT) : SWEAT, S = far ? back(SHOE) : SHOE;
  const ank: [number, number] = [fx, -9];
  const k = knee(hip[0], hip[1], ank[0], ank[1], 15, 14, 1);
  tubeR(g, [hip[0], hip[1], k[0], k[1], ank[0], ank[1]], [15, 13], [R, R]);
  // (the fleece's folds: a crease off the knee, a couple bunched over the cuff, the seam down its side)
  lineR(g, [k[0] - 3, k[1] - 2, k[0] + 2, k[1] + 1], 0.9, R[3]); lineR(g, [k[0] - 2, k[1] + 3, k[0] + 3, k[1] + 4], 0.8, R[3]);
  pxR(g, k[0] - 3, k[1] - 3.4, 4, 1, R[0]);
  lineR(g, [ank[0] - 5, ank[1] - 5, ank[0] + 4, ank[1] - 3], 0.8, R[3]); lineR(g, [ank[0] - 5, ank[1] - 3.6, ank[0] + 1, ank[1] - 2.6], 0.6, R[0]);
  lineR(g, [hip[0] - 2, hip[1] + 4, hip[0] - 3, hip[1] + 12], 0.6, dith(g, R[3]));
  // (the elastic cuff, ribbed)
  shapeR(g, () => g.roundRect(fx - 5.6, -11, 11.2, 4, 1.4), R, fx - 5.6, fx + 5.6, 0.9);
  for (let i = 0; i < 4; i++) pxR(g, fx - 4 + i * 2.6, -10.4, 0.8, 2.8, R[3]);
  // (the high-top: the ankle collar, padded; the upper; the toe cap; the sole, the laces, a red stripe; scuffs)
  shapeR(g, () => { g.moveTo(fx - 6.4, -8); g.lineTo(fx + 3, -8.4); g.quadraticCurveTo(fx + 6, -6, fx + 10.6, -4.4); g.quadraticCurveTo(fx + 12.4, -3.4, fx + 12, -1.6); g.lineTo(fx - 7, -1.6); g.closePath(); }, S, fx - 7, fx + 12.4, 1);
  shapeR(g, () => g.roundRect(fx - 7.6, -2.6, 20.6, 3.2, 1.2), S, fx - 7.6, fx + 13, 1);
  pxR(g, fx - 7, -0.4, 19.6, 0.9, S[3]);
  lineR(g, [fx - 7, -2, fx + 12.4, -2], 0.6, dith(g, S[3]));
  // (the toe cap's stitching, the laces up the tongue)
  lineR(g, [fx + 6.4, -5.6, fx + 7.4, -2.6], 0.6, S[3]);
  for (let i = 0; i < 3; i++) { lineR(g, [fx + 0.4 + i * 1.6, -7.6 + i * 0.8, fx + 2.6 + i * 1.6, -6 + i * 0.8], 0.8, S[4]); pxR(g, fx + 0.6 + i * 1.6, -7.8 + i * 0.8, 1, 0.6, WHITE); }
  // (the red stripe down its side, faded)
  lineR(g, [fx - 5, -5.6, fx + 1, -3.6, fx + 6, -4.6], 1.3, far ? '#9A2222' : '#D23030');
  pxR(g, fx - 5.6, -7.4, 3.4, 1.2, S[0]);
  pxR(g, fx + 8, -3.6, 1.4, 0.8, dith(g, '#8A7A6A')); pxR(g, fx - 2, -2.4, 1, 0.6, '#9A8A7A');
};

/** An arm: shoulder to elbow (art/limb.ts: bent the right way for how he's standing) to hand. The delt's cap, the bicep's
 *  bulge, the forearm's swell, its veins and its gray hair; the fist (or the glove) on the end. Returns the hand. */
const arm = (g: Ctx, s: [number, number], h0: [number, number], square: boolean, far: boolean, S0: Ramp, gloved: boolean, open: boolean) => {
  const S = far ? back(S0) : S0, up = 15, fore = 14, big = far ? 0.9 : 1;
  /** (the muscles' bulges inside the arm's outline: edged in the deep tone, not the line, so they read as swells) */
  const M: Ramp = [S[0], S[1], S[2], S[3], mixHex(S[3], S[4], 0.45)];
  const h = reachTo(s[0], s[1], h0[0], h0[1], up, fore);
  const e = square ? elbowFront(s[0], s[1], h[0], h[1], up, fore, far ? -1 : 1) : elbow(s[0], s[1], h[0], h[1], up, fore, 1);
  const fa = Math.atan2(h[1] - e[1], h[0] - e[0]), fl = Math.hypot(h[0] - e[0], h[1] - e[1]);
  const ua = Math.atan2(e[1] - s[1], e[0] - s[0]), ul = Math.hypot(e[0] - s[0], e[1] - s[1]);
  // (the forearm, tapering to the wrist; its swell up by the elbow)
  tubeR(g, [e[0], e[1], h[0], h[1]], [10.4 * big], [S]);
  const fsx = e[0] + Math.cos(fa) * fl * 0.3, fsy = e[1] + Math.sin(fa) * fl * 0.3;
  shapeR(g, () => g.ellipse(fsx, fsy, fl * 0.36, 5.6 * big, fa, 0, Math.PI * 2), M, fsx - 7, fsx + 7, 0.9);
  // (the veins, roped down it; gray hairs)
  const nx = -Math.sin(fa), ny = Math.cos(fa), at = (t: number, o: number): [number, number] => [e[0] + Math.cos(fa) * fl * t + nx * o, e[1] + Math.sin(fa) * fl * t + ny * o];
  const v1 = [at(0.2, 1.8), at(0.45, -0.6), at(0.75, 0.8)], v2 = [at(0.45, -0.6), at(0.62, -2.6)];
  lineR(g, v1.flat(), 1.2, S[3]); lineR(g, v1.map(([x, y]) => [x - 0.4, y - 0.5]).flat(), 0.5, S[0]);
  lineR(g, v2.flat(), 0.9, S[3]);
  if (!far) for (let k = 0; k < 4; k++) { const [x, y] = at(0.5 + k * 0.1, (k % 2 ? 1 : -1) * 2); pxR(g, x, y, 1, 1, HAIR[2]); }
  // (the upper arm over it; the bicep's bulge on its front; the tricep's under; the delt's cap)
  tubeR(g, [s[0], s[1], e[0], e[1]], [12 * big], [S]);
  const bx = s[0] + Math.cos(ua) * ul * 0.55 + Math.sin(ua) * 1.4 * big, by = s[1] + Math.sin(ua) * ul * 0.55 - Math.cos(ua) * 1.4 * big;
  shapeR(g, () => g.ellipse(bx, by, ul * 0.44, 5.4 * big, ua, 0, Math.PI * 2), M, bx - 8 * big, bx + 8 * big, 0.9);
  pxR(g, bx - 3 * big, by - 3.6 * big, 3 * big, 1.2, S[0]); pxR(g, bx - 2.4 * big, by - 4.2 * big, 1.2, 1, '#FFF0DC');
  lineR(g, [bx + Math.cos(ua) * 4, by + Math.sin(ua) * 4 + 1.4, bx + Math.cos(ua) * 6.4, by + Math.sin(ua) * 6.4 + 3.4], 0.8, S[3]);
  shapeR(g, () => g.ellipse(s[0], s[1] + 1, 7.4 * big, 6.4 * big, ua, 0, Math.PI * 2), S, s[0] - 7.4 * big, s[0] + 7.4 * big, 1);
  pxR(g, s[0] - 4.4 * big, s[1] - 4.6 * big, 4 * big, 1.4, S[0]); pxR(g, s[0] - 3.4 * big, s[1] - 5.2 * big, 1.6, 1, '#FFF0DC');
  lineR(g, [s[0] + 1, s[1] + 3, s[0] + 4, s[1] + 7.4], 0.7, S[3]);
  // (the elbow's point, wrinkled)
  pxR(g, e[0] - 1, e[1] - 0.6, 2, 0.7, S[3]); pxR(g, e[0] - 0.6, e[1] + 0.8, 1.6, 0.6, S[3]);
  if (gloved) glove(g, h[0], h[1], big, open);
  else fist(g, h[0], h[1], S, fa);
  return h;
};

/** The torso's outline (lean: how far the shoulders are ahead of the hips). */
const torsoPath = (g: Ctx, hipY: number, sy: number, lean: number) => {
  const L = (t: number) => lean * t;
  g.moveTo(-13 + L(1), sy + 1);
  g.quadraticCurveTo(3 + L(1), sy - 2, 18 + L(1), sy + 2);
  g.quadraticCurveTo(24 + L(0.9), sy + 10, 21 + L(0.75), sy + 21);
  g.quadraticCurveTo(26 + L(0.4), hipY - 12, 22 + L(0.15), hipY - 2);
  g.quadraticCurveTo(19, hipY + 3, 14, hipY + 3);
  g.lineTo(-13, hipY + 3);
  g.quadraticCurveTo(-17 + L(0.3), hipY - 10, -16 + L(0.6), sy + 16);
  g.quadraticCurveTo(-18 + L(0.9), sy + 6, -13 + L(1), sy + 1);
  g.closePath();
};
/** The tank top's front panel: a deep scoop at the neck, the arm holes cut down near the belt, covering the gut. */
const tankPath = (g: Ctx, hipY: number, sy: number, lean: number) => {
  const L = (t: number) => lean * t;
  g.moveTo(-5 + L(1), sy - 0.5);
  g.lineTo(-1.6 + L(1), sy - 0.5);
  g.quadraticCurveTo(3 + L(0.95), sy + 13, 9 + L(1), sy - 0.2);
  g.lineTo(12.4 + L(1), sy + 0.4);
  g.quadraticCurveTo(13 + L(0.7), sy + 20, 19 + L(0.45), hipY - 14);
  g.quadraticCurveTo(25.4 + L(0.35), hipY - 10, 21.6 + L(0.15), hipY - 1);
  g.quadraticCurveTo(18.6, hipY + 3, 14, hipY + 3);
  g.lineTo(-10.6, hipY + 3);
  g.quadraticCurveTo(-12 + L(0.3), hipY - 10, -10 + L(0.6), sy + 18);
  g.quadraticCurveTo(-6 + L(0.85), sy + 8, -5 + L(1), sy - 0.5);
  g.closePath();
};

const torso = (g: Ctx, hipY: number, sy: number, lean: number, S: Ramp, mirror: boolean) => {
  const L = (t: number) => lean * t;
  // ---- the skin under it all (the lats and ribs out of the arm holes either side)
  shapeR(g, () => torsoPath(g, hipY, sy, lean), S, -18 + lean, 26 + lean * 0.5, 1.2);
  g.save(); g.beginPath(); torsoPath(g, hipY, sy, lean); g.clip();
  // (the back's lat: a lit ridge, the shadow under it; the ribs/serratus down the near side; side hair)
  lineR(g, [-14 + L(0.8), sy + 8, -12 + L(0.5), hipY - 12], 1.2, S[0]);
  lineR(g, [-11 + L(0.8), sy + 10, -9 + L(0.4), hipY - 8], 1, S[3]);
  for (let k = 0; k < 3; k++) { lineR(g, [14 + L(0.7) + k * 0.6, sy + 16 + k * 4, 18 + L(0.6) + k * 0.4, sy + 14 + k * 4], 0.8, S[3]); pxR(g, 14 + L(0.7) + k * 0.6, sy + 15 + k * 4, 2, 0.6, S[0]); }
  // (the side of his pec, under the front arm hole: lit, the shadow cut under it)
  pxR(g, 15 + L(0.95), sy + 5, 6, 1.4, S[0]); pxR(g, 14 + L(0.85), sy + 13, 8, 1.2, S[3]); pxR(g, 14 + L(0.85), sy + 14.2, 8, 1, dith(g, S[3]));
  g.restore();
  // ---- the tank top
  shapeR(g, () => tankPath(g, hipY, sy, lean), TANK, -12 + lean * 0.6, 25 + lean * 0.4, 1.1);
  g.save(); g.beginPath(); tankPath(g, hipY, sy, lean); g.clip();
  // (the pecs pushing it out: lit on top, the shadow under them; the gut's swell: lit up its front, shaded under,
  // where it hangs over the belt)
  pxR(g, -6 + L(0.95), sy + 13, 9, 1.2, TANK[0]); pxR(g, 8 + L(0.9), sy + 12, 6, 1.2, TANK[0]);
  pxR(g, -7 + L(0.85), sy + 20, 22, 1.2, TANK[3]); pxR(g, -7 + L(0.85), sy + 21.2, 22, 1.4, dith(g, TANK[3]));
  pxR(g, 17 + L(0.3), hipY - 15, 3, 7, TANK[0]);
  pxR(g, -10, hipY - 4, 32, 2, dith(g, TANK[3])); pxR(g, -10, hipY - 2, 32, 5, TANK[3]);
  // (the folds: pulled across the gut, bunched at the hem)
  lineR(g, [-6 + L(0.4), hipY - 12, 5 + L(0.35), hipY - 9, 12 + L(0.3), hipY - 12], 0.8, TANK[3]);
  lineR(g, [-4 + L(0.5), hipY - 15, 4 + L(0.5), hipY - 13], 0.7, TANK[0]);
  // (sweat under the scoop: a darker band, dithered at its edge)
  pxR(g, -3 + L(1), sy + 10, 11, 2, dith(g, TANK[2]));
  // (IRON, cracked and peeling, across his chest: blocky letters, the cracks through them)
  const ix = Math.round(-5 + L(0.85)), iy = Math.round(sy + 15);
  // (painted mirrored when he faces left, so it reads the right way round once he's flipped)
  const LET: Record<string, string[]> = { I: ['111', '010', '010', '010', '111'], R: ['110', '101', '110', '101', '101'], O: ['111', '101', '101', '101', '111'], N: ['1001', '1101', '1011', '1001', '1001'] };
  let lx = 0;
  for (const [n, ch] of [...'IRON'].entries()) {
    LET[ch].forEach((row, r) => [...row].forEach((v, cI) => {
      if (v !== '1') return;
      const cracked = ((n * 7 + r * 3 + cI * 5) % 6) === 0, x = lx + cI;
      pxR(g, ix + (mirror ? 15 - x : x), iy + r, 1, 1, cracked ? TANK[2] : TANK[4]);
    }));
    lx += LET[ch][0].length + 1;
  }
  pxR(g, ix - 1, iy + 2, 17, 1, dith(g, TANK[1]));
  // (a hole worn through over the gut, a mustard stain)
  ellR(g, 10 + L(0.3), hipY - 7, 1.4, 1, S[2]); pxR(g, 9 + L(0.3), hipY - 8.4, 2.4, 0.6, TANK[4]);
  pxR(g, -2 + L(0.4), hipY - 6, 2, 1.4, dith(g, '#B89A3A'));
  g.restore();
  // (the cut edges: frayed threads off the arm holes)
  for (let k = 0; k < 5; k++) { const t = k / 4; pxR(g, 12.6 + L(0.75) + t * 6, sy + 4 + t * 26, 1, 1.6, TANK[1]); pxR(g, -10 + L(0.7) - t * 1.6, sy + 20 + t * 14, 1, 1.4, TANK[1]); }
  // (gray chest hair curling out of the scoop)
  for (let k = 0; k < 14; k++) {
    const x = -0.4 + L(1) + (k % 5) * 1.6 + ((k * 7) % 3) * 0.4, y = sy + 3 + Math.floor(k / 5) * 2.6 + (k % 2);
    pxR(g, x, y, 1, 1.4, k % 3 ? HAIR[2] : HAIR[1]);
  }
  pxR(g, 1 + L(1), sy + 2, 5, 6, dith(g, HAIR[3]));
  // ---- the lifting belt: wide, the leather cracked, two rows of stitching, the big steel double-prong buckle, the
  // keeper loop, its tongue
  const by = hipY - 3;
  shapeR(g, () => { g.moveTo(-14, by - 1); g.lineTo(23, by - 2.4); g.lineTo(22.6, by + 8.2); g.lineTo(-14, by + 7.6); g.closePath(); }, BELT, -14, 23, 1.1);
  g.setLineDash([1.2, 1]); lineR(g, [-13, by + 0.6, 22, by - 0.6], 0.5, BELT[0], 'butt'); lineR(g, [-13, by + 5.8, 22, by + 6.2], 0.5, BELT[0], 'butt'); g.setLineDash([]);
  for (const [x, l] of [[-9, 3], [-2, 4], [5, 2.4], [-6, 2]] as const) lineR(g, [x, by + 1.6, x + 0.8, by + 1.6 + l], 0.6, BELT[3]);
  pxR(g, -12, by + 2.6, 30, 1, dith(g, BELT[3]));
  // (the buckle)
  shapeR(g, () => g.roundRect(13.4, by - 3.4, 8.8, 12.4, 1.6), STEEL, 13.4, 22.2, 1);
  shapeR(g, () => g.rect(15.2, by - 1.4, 5.2, 8.4), back(BELT), 15.2, 20.4, 0.8);
  lineR(g, [15, by + 1.2, 21, by + 1.2], 1, STEEL[4]); lineR(g, [15, by + 1, 21, by + 1], 0.6, STEEL[1]);
  lineR(g, [15, by + 4.6, 21, by + 4.6], 1, STEEL[4]); lineR(g, [15, by + 4.4, 21, by + 4.4], 0.6, STEEL[1]);
  pxR(g, 14, by - 2.6, 2.4, 1, WHITE); pxR(g, 21, by + 6, 1, 2, dith(g, '#8A5A2A'));
  // (the keeper loop behind it, the tongue's tip sticking out)
  shapeR(g, () => g.rect(7.6, by - 2, 3.6, 10), BELT, 7.6, 11.2, 0.8);
};

/** The traps and the neck: a slope from the shoulders straight up into the head; the cords, a vein; the straps. */
const traps = (g: Ctx, sx: number, sy: number, hx: number, hy: number, S: Ramp) => {
  shapeR(g, () => { g.moveTo(sx - 15, sy + 6); g.quadraticCurveTo(sx - 8, sy - 3, hx - 7, hy + 6); g.lineTo(hx + 8, hy + 7); g.quadraticCurveTo(sx + 12, sy - 2, sx + 18, sy + 6); g.closePath(); }, S, sx - 15, sx + 18, 1.1);
  // (the neck's cords, its vein, the trap's lit crest)
  lineR(g, [hx + 5, hy + 8, sx + 8, sy + 5], 1, S[3]); lineR(g, [hx + 6, hy + 8, sx + 9, sy + 4], 0.6, S[0]);
  lineR(g, [hx - 2, hy + 9, hx - 1, sy + 3, hx + 1, sy + 5], 0.9, S[3]);
  lineR(g, [sx - 12, sy + 3, sx - 6, sy - 1, hx - 5, hy + 8], 1, S[0]);
  // (the tank top's straps biting into them)
  shapeR(g, () => { g.moveTo(sx + 7, sy - 0.4); g.lineTo(sx + 10.4, sy); g.lineTo(sx + 10.6, sy + 5); g.lineTo(sx + 7, sy + 5); g.closePath(); }, TANK, sx + 7, sx + 10.6, 0.9);
  pxR(g, sx + 10.8, sy + 1, 1, 3, S[3]);
};

/** The head (in profile-and-a-bit, facing +x): square, the jaw heavy; `winded` the nut shot's face. */
const head = (g: Ctx, hx: number, hy: number, S: Ramp, winded: boolean) => {
  const skull = () => { g.moveTo(hx - 10, hy - 8); g.quadraticCurveTo(hx - 10, hy - 14, hx - 3, hy - 14); g.lineTo(hx + 7, hy - 14); g.quadraticCurveTo(hx + 11, hy - 13, hx + 11, hy - 7); g.lineTo(hx + 11, hy - 4); g.lineTo(hx + 12, hy + 2); g.lineTo(hx + 12.6, hy + 9); g.quadraticCurveTo(hx + 11, hy + 14, hx + 4, hy + 14.4); g.lineTo(hx - 3, hy + 13); g.quadraticCurveTo(hx - 10, hy + 9, hx - 10.4, hy + 2); g.closePath(); };
  shapeR(g, skull, S, hx - 10.4, hx + 12.6, 1.2);
  g.save(); g.beginPath(); skull(); g.clip();
  // (the buzz cut: gray stubble over the top and down the back, a square hairline; lit across the crown)
  const hair = () => { g.moveTo(hx - 11, hy - 15); g.lineTo(hx + 12, hy - 15); g.lineTo(hx + 12, hy - 8.6); g.lineTo(hx + 5, hy - 8); g.lineTo(hx - 1, hy - 8.4); g.lineTo(hx - 2, hy - 2); g.lineTo(hx - 5, hy + 3); g.lineTo(hx - 11, hy + 5); g.closePath(); };
  g.beginPath(); hair(); g.fillStyle = HAIR[2]; g.fill();
  pxR(g, hx - 8, hy - 14, 18, 2, HAIR[1]); pxR(g, hx - 8, hy - 12, 18, 1, dith(g, HAIR[1])); pxR(g, hx - 5, hy - 14, 7, 1, HAIR[0]);
  for (let k = 0; k < 16; k++) pxR(g, hx - 9 + ((k * 7) % 19), hy - 12 + ((k * 5) % 9), 1, 1, k % 2 ? HAIR[3] : HAIR[1]);
  // (the temple's shadow, the cheekbone lit, the jaw's shade, the stubble's gray shadow over the jaw)
  pxR(g, hx + 1, hy - 8, 2, 4, S[2]);
  pxR(g, hx + 2, hy + 1, 6, 1.4, S[0]); pxR(g, hx + 3, hy + 2.4, 4, 1, dith(g, S[0]));
  pxR(g, hx - 6, hy + 6, 10, 8, dith(g, HAIR[3]));
  pxR(g, hx - 4, hy + 10, 10, 4, S[3]);
  // (forehead creases)
  lineR(g, [hx + 2, hy - 7, hx + 9, hy - 7.4], 0.6, S[3]); lineR(g, [hx + 3, hy - 5.6, hx + 9.6, hy - 5.8], 0.5, S[2]);
  g.restore();
  // (the cauliflower ear: lumps on lumps)
  for (const [dx, dy, r] of [[-6.4, -2, 3.4], [-5.8, 1.6, 3], [-6.8, 4.4, 2.6], [-4.8, -0.4, 2.2]] as const) shapeR(g, () => g.ellipse(hx + dx, hy + dy, r, r * 1.05, 0, 0, Math.PI * 2), S, hx + dx - r, hx + dx + r, 0.9);
  pxR(g, hx - 6, hy, 1.6, 2, S[4]); pxR(g, hx - 7.8, hy - 3.6, 1.4, 1, S[0]);
  // (the brow: a heavy ridge, short gray brows, a scar through them; the socket's shadow under)
  pxR(g, hx + 2, hy - 4.6, 10, 2, S[0]);
  pxR(g, hx + 2, hy - 2.6, 9, 1.4, S[3]);
  for (let k = 0; k < 5; k++) pxR(g, hx + 3 + k * 1.6, hy - 4.4 + (k % 2) * 0.4, 1.4, 1.2, k === 2 ? S[0] : HAIR[1 + (k % 2)]);
  pxR(g, hx + 6.2, hy - 5.4, 0.8, 3, '#E8B898');
  if (winded) {
    // (crossed out, the brows up, a sweat bead)
    for (const [x, y] of [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]] as const) pxR(g, hx + 5 + x, hy - 1.4 + y, 1, 1, S[4]);
    pxR(g, hx + 4, hy - 6.4, 6, 1, HAIR[1]);
    ellR(g, hx + 1, hy - 4, 1, 1.4, '#E0F2FE'); pxR(g, hx + 0.6, hy - 4.8, 0.8, 0.8, WHITE);
  } else {
    // (the eye: narrow, the lid heavy over it, bloodshot; the bag under; crow's feet)
    pxR(g, hx + 4, hy - 1.2, 5, 2, '#EAD8C8'); pxR(g, hx + 6.6, hy - 1.2, 1.6, 2, '#2A1608'); pxR(g, hx + 6.6, hy - 1.2, 0.8, 0.8, '#7A4A28');
    pxR(g, hx + 4.4, hy - 0.4, 1, 0.6, '#D86A5A');
    pxR(g, hx + 3.6, hy - 1.8, 6, 0.9, S[4]);
    lineR(g, [hx + 4, hy + 1.8, hx + 6.6, hy + 2.4, hx + 9, hy + 1.6], 0.6, S[3]);
    lineR(g, [hx + 2.8, hy - 1.4, hx + 1.4, hy - 2.2], 0.5, S[3]); lineR(g, [hx + 2.8, hy + 0.4, hx + 1.2, hy + 0.8], 0.5, S[3]);
  }
  // (the nose: broken more than once: the bump on the bridge, a bend, the tip fat, the nostril flared)
  shapeR(g, () => { g.moveTo(hx + 10.4, hy - 3.4); g.lineTo(hx + 12.8, hy - 1.4); g.lineTo(hx + 12, hy + 0.6); g.lineTo(hx + 15, hy + 3.6); g.quadraticCurveTo(hx + 15.4, hy + 5.6, hx + 12.6, hy + 5.4); g.lineTo(hx + 10.4, hy + 4.6); g.closePath(); }, S, hx + 10.4, hx + 15.4, 1);
  pxR(g, hx + 11.6, hy - 2, 1.2, 1, S[0]); pxR(g, hx + 12.6, hy + 2, 1.4, 1, S[0]); pxR(g, hx + 13.6, hy + 3, 1, 0.8, WHITE);
  pxR(g, hx + 11.6, hy + 4.2, 1.6, 1, S[4]); lineR(g, [hx + 10, hy + 3, hx + 11, hy + 5.2], 0.6, S[3]);
  // (the goatee: short and gray, the mustache over the lip, dense round the mouth and down the chin)
  const goat = () => { g.moveTo(hx + 7, hy + 5.6); g.lineTo(hx + 13, hy + 5.2); g.lineTo(hx + 13.4, hy + 9); g.quadraticCurveTo(hx + 12, hy + 15.4, hx + 7, hy + 15); g.quadraticCurveTo(hx + 5, hy + 12, hx + 7, hy + 5.6); g.closePath(); };
  shapeR(g, goat, HAIR, hx + 5, hx + 13.4, 0.8);
  g.save(); g.beginPath(); goat(); g.clip(); for (let k = 0; k < 16; k++) pxR(g, hx + 5 + ((k * 3) % 8), hy + 6 + ((k * 5) % 10), 1, 1, HAIR[k % 3 === 0 ? 0 : 3]); g.restore();
  if (winded) {
    // (an O, winded: the tongue in it)
    ellR(g, hx + 10.4, hy + 9.6, 2.2, 2.6, '#3A0A0A'); ellR(g, hx + 10.4, hy + 10.8, 1.4, 1, '#C0505A');
  } else {
    // (the smirk off to one side, the gold tooth's glint, the toothpick in its corner)
    lineR(g, [hx + 8.4, hy + 9, hx + 11, hy + 8.8, hx + 13, hy + 7.6], 1.2, '#3A1A10'); lineR(g, [hx + 9, hy + 10.2, hx + 12, hy + 9.6], 0.8, '#B87A62');
    pxR(g, hx + 10.6, hy + 8.4, 1.4, 1.2, GOLD); pxR(g, hx + 10.6, hy + 8.4, 0.6, 0.6, WHITE);
    lineR(g, [hx + 12.4, hy + 8, hx + 18.6, hy + 5.6], 1.4, '#8A6A3A'); lineR(g, [hx + 12.4, hy + 7.6, hx + 18.4, hy + 5.2], 0.7, TOOTHPICK);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Him

const paintBen = (g: Ctx, pose: BenPose, frame: number, piece: ArmorPiece | null, mirror: boolean) => {
  const hp = pose === 'flurry' ? { f: FLURRY[frame % 3][0], b: FLURRY[frame % 3][1], drop: 0, lean: 2 } : HANDS[pose];
  const drop = hp.drop ?? 0, lean = hp.lean ?? 0, gloved = piece === 'hands', winded = pose === 'nuts';
  const S = winded ? SKIN_RED : SKIN;
  // (the CLEARANCE CAPE, on him till it's given: Spooky Land; behind all of him)
  if (piece === 'cape') benCape(g, 2 + lean, -68 + drop, 3 + lean * 1.2, -84 + drop);
  // ---- the legs: a wide stance, knees a little bent (the far one first)
  const hipY = -36 + drop;
  leg(g, [-4, hipY], -9, true);
  leg(g, [6, hipY], 11, false);
  // (the sweatpants' seat over the hips, the waistband under the belt)
  shapeR(g, () => { g.moveTo(-13, hipY - 2); g.lineTo(18, hipY - 2); g.lineTo(17, hipY + 8); g.quadraticCurveTo(10, hipY + 12, 3, hipY + 9); g.quadraticCurveTo(-4, hipY + 12, -12, hipY + 8); g.closePath(); }, SWEAT, -13, 18, 1);
  lineR(g, [3, hipY + 4, 3.4, hipY + 9], 0.7, SWEAT[3]); lineR(g, [-8, hipY + 6, -3, hipY + 8], 0.6, SWEAT[0]);
  // ---- the arms (the back one behind his body), the body, the traps, the head, the front arm
  const sx = 2 + lean, sy = -68 + drop;
  const square = pose === 'stand' || pose === 'fold' || pose === 'nuts';
  arm(g, [sx - 11, sy + 8], hp.b, square, true, S, gloved, false);
  // (the COCO-NUTS, on him till they're given: the far one over the back delt, under his body)
  const pads = piece === 'pauldrons';
  if (pads) pauldron(g, sx - 11, sy + 8, true);
  torso(g, hipY, sy, lean, S, mirror);
  const hx = 3 + lean * 1.2, hy = -84 + drop;
  traps(g, sx, sy, hx, hy, S);
  head(g, hx, hy, S, winded);
  // (the KEGGER HELMET, on him till it's given: Foreign Lands)
  if (piece === 'helmet') kegHelmet(g, hx, hy);
  const hf = arm(g, [sx + 13, sy + 9], hp.f, square, false, S, gloved, pose === 'offer');
  if (pads) pauldron(g, sx + 13, sy + 9, false);
  // (the shaker's the hand armor's trial: nobody else's)
  const shakes = !pads && piece !== 'helmet' && piece !== 'cape';
  if (shakes && pose === 'offer') shaker(g, hf[0] + 1, hf[1] - 6);
  if (shakes && pose === 'yank') shaker(g, hf[0], hf[1] - 6);
};

/** The KEGGER HELMET on his head (the armor's own baked piece, armorArt.ts: its brim on his hairline), and its bendy
 *  straw from the near can down past his cheek into the corner of his mouth (no glasses on him to go round). */
const kegHelmet = (g: Ctx, hx: number, hy: number) => {
  const cv = armorStamp('helmet');
  if (!cv) return;
  // (the picture: 36 x 26, its middle at x 18, its brim's foot at y 19.4; his hairline's at hy - 8.4)
  const k = 1.02, left = hx + 1 - 18 * k, top = hy - 8.4 - 19.4 * k;
  g.drawImage(cv, left, top, 36 * k, 26 * k);
  // (the straw: out of the near can's top, down outside his cheek, the bend, in at the smirk's corner)
  const sx = left + 33 * k, sy = top + 11.4 * k;
  const pts = [sx, sy, hx + 16.6, hy - 2, hx + 16, hy + 5.6, hx + 12.8, hy + 8.4];
  lineR(g, pts, 1.9, '#0A0A0A'); lineR(g, pts, 1.1, WHITE);
  g.setLineDash([1, 1.1]); lineR(g, pts, 1.1, '#EF4444', 'butt'); g.setLineDash([]);
  pxR(g, hx + 15.4, hy + 4.6, 1.4, 0.5, '#9CA3AF'); pxR(g, hx + 15.2, hy + 5.6, 1.4, 0.5, '#9CA3AF');
};

/** The CLEARANCE CAPE on his back (drawn first: behind all of him): shiny black polyester down to his calves, flaring
 *  out behind, the red lining showing along its trailing edge, still creased in squares from the bag; the tall stiff
 *  collar's two points standing up behind his head (the lining facing in); the price tag on its barb off the collar.
 *  (sx, sy) his shoulders' middle, (hx, hy) his head's. Facing +x: behind him is -x. */
const CAPE_R: Ramp = ['#56567A', '#30304A', '#1E1E30', '#12121E', '#04040A'];
const LINING_R: Ramp = ['#F87171', '#DC2626', '#A3151E', '#6E0C12', '#2A0206'];
const benCape = (g: Ctx, sx: number, sy: number, hx: number, hy: number) => {
  // (the body of it: off both shoulders, down the back, the hem flaring out behind; the lining along the trailing edge)
  const body = () => { g.moveTo(sx + 12, sy + 2); g.lineTo(sx - 16, sy); g.quadraticCurveTo(sx - 26, sy + 30, -31, -14); g.lineTo(-20, -11); g.lineTo(-8, -15); g.lineTo(4, -12); g.lineTo(sx + 8, sy + 30); g.closePath(); };
  shapeR(g, body, CAPE_R, -31, sx + 12, 1);
  lineR(g, [sx - 16, sy + 1, sx - 25, sy + 30, -30, -15], 2.2, LINING_R[1]);
  lineR(g, [sx - 15, sy + 2, sx - 24, sy + 30, -29, -16], 0.8, LINING_R[0]);
  // (the hem's scallops, the bag's creases across and down, a shine like a trash bag)
  for (const [x0, y0] of [[-26, -13], [-14, -13], [-2, -13]] as const) ellR(g, x0, y0 + 1, 4.6, 1.6, CAPE_R[4]);
  g.save(); g.beginPath(); body(); g.clip();
  for (let y = sy + 12; y < -14; y += 12) { pxR(g, -34, y, 60, 0.8, CAPE_R[0]); pxR(g, -34, y + 0.8, 60, 0.8, CAPE_R[4]); }
  for (let x = -26; x < sx + 10; x += 11) { pxR(g, x, sy - 2, 0.8, 90, dith(g, CAPE_R[0])); pxR(g, x + 0.8, sy - 2, 0.8, 90, CAPE_R[4]); }
  lineR(g, [sx - 12, sy + 8, sx - 18, sy + 34, -22, -24], 1, dith(g, CAPE_R[0]));
  g.restore();
  // (the collar: two stiff points up behind his head, black out, red in, a rib up each)
  for (const s of [-1, 1]) {
    const bx = hx + s * 9, tipX = hx + s * 15, tipY = hy - 9;
    const coll = () => { g.moveTo(bx - s * 3, hy + 16); g.lineTo(tipX, tipY); g.lineTo(tipX + s * 4, tipY + 3); g.lineTo(bx + s * 8, hy + 18); g.closePath(); };
    shapeR(g, coll, s < 0 ? LINING_R : back(LINING_R), Math.min(bx - 4, tipX), Math.max(tipX + 5, bx + 10), 1);
    lineR(g, [bx + s * 1, hy + 14, tipX + s * 1.5, tipY + 3], 0.8, LINING_R[3]);
    lineR(g, [tipX, tipY, tipX + s * 4, tipY + 3, bx + s * 8, hy + 18], 1.6, CAPE_R[3]);
  }
  // (the price tag on its plastic barb off the back point)
  lineR(g, [hx - 18, hy - 5, hx - 21, hy + 3], 0.6, '#E5E7EB');
  pxR(g, hx - 25, hy + 2, 7, 9, '#2A2A36'); pxR(g, hx - 24, hy + 3, 5, 7, '#F4F4F0'); pxR(g, hx - 24, hy + 6, 5, 1.6, '#F07A1A'); pxR(g, hx - 23, hy + 9, 3, 1, '#DC2626');
};

/** A coconut pauldron strapped over a delt (the armor's own baked piece, armorArt.ts, sized up to his shoulders). */
const pauldron = (g: Ctx, x: number, y: number, far: boolean) => {
  const cv = armorStamp('pauldron', far);
  if (!cv) return;
  const k = 0.95;
  g.drawImage(cv, x - 9 * k - 2, y - 10 * k - 9, 20 * k, 18 * k);
};

/** Him, feet at (x, y), facing `facing`. `frame`: the flurry's (0..2). `piece`: what he's still holding (null: given). */
export const drawBen = (c: Ctx, x: number, y: number, facing: 1 | -1, pose: BenPose, frame: number, piece: ArmorPiece | null) => {
  c.save();
  c.translate(Math.round(x), Math.round(y));
  if (facing < 0) c.scale(-1, 1);
  stamp(c, `ben3-${pose}-${pose === 'flurry' ? frame % 3 : 0}-${piece ?? 'none'}-${facing}`, -34, -126, 86, 130, g => paintBen(g, pose, frame, piece, facing < 0));
  c.restore();
  // (winded: the stars going round)
  if (pose === 'nuts') {
    const t = performance.now() / 160;
    for (let i = 0; i < 3; i++) {
      const a = t + (i * Math.PI * 2) / 3, sx = x + facing * 6 + Math.cos(a) * 13, sy = y - 102 + Math.sin(a) * 3.5;
      c.fillStyle = '#1A1028'; c.fillRect(Math.round(sx) - 2, Math.round(sy) - 2, 5, 5);
      c.fillStyle = '#FDE047'; c.fillRect(Math.round(sx) - 1, Math.round(sy) - 1, 3, 3);
    }
  }
};
/** Where his head is (for the words over it), feet at (x, y). */
export const benHeadY = (y: number) => y - 104;
