// TUCKER'S FIGHT: THE BEASTS THAT KILL HIM (they're the kill: drawn near Tucker's grade in the final pass, below:
// seven-step ramps per material, fur-stepped bands, lit muscle masses, shag and ticked fur, each material's darkest tone
// its outline; every frame stamped). The close-ups' heads and paws (lionHead, bearHead, paw) are the first pass's,
// kept as they were: those are Tucker's close-ups.
//
//   the MOUNTAIN LION  (the weakness: drawn out of the woods by the soul sucker's blood all over him) tawny, a pale
//                      muzzle and belly, the black-tipped tail, amber eyes; running (a stretched gallop), the pounce
//                      (flat out in the air, claws out), mauling (crouched over him, shoulders working, head down,
//                      tearing), dragging (backing off with a piece of him in its jaws)
//   the GRIZZLY        (the standard death: out of nowhere) the shoulder hump silvered, the dished face, the claws;
//                      the lumbering charge, reared up roaring, mauling (on him, tearing), walking off (a leg of his in
//                      its jaws)
//
// And their close-ups (the mutilation rule: the grizzly's mauling, animated, gory; the lions' for the weakness kill,
// slowed): registered on tucker.ts's close-up as the 'maul' and 'lions' wounds (head units: his face ~24 across, its
// middle at the origin, facing right).

import { registerWoundPainter } from '../tucker';
import { stamp } from '../../../m1/game/render/stamp';

type Ctx = CanvasRenderingContext2D;
type Ramp = readonly [string, string, string, string, string];

const PUMA: Ramp = ['#ECC898', '#C99B64', '#A77A48', '#7C5530', '#3A2410'];
const PUMA_PALE: Ramp = ['#FFF8EC', '#F2E4CC', '#D8C4A4', '#B4A080', '#5A4A34'];
const GRIZ: Ramp = ['#B48A5C', '#8A5E36', '#6A4424', '#4A2E16', '#1E1208'];
const CLAW = '#F2EAD8', TOOTH = '#FBF6E8', GUM = '#B0404A', TONGUE = '#D8606A', MOUTH = '#3A0A10';
const BLOOD = ['#5F0F0F', '#7F1D1D', '#B91C1C', '#DC2626'];

const dithers = new Map<string, CanvasPattern | string>();
const dith = (c: Ctx, color: string): CanvasPattern | string => {
  let p = dithers.get(color);
  if (p) return p;
  if (typeof document === 'undefined') return color;
  const cv = document.createElement('canvas'); cv.width = 2; cv.height = 2;
  const g = cv.getContext('2d')!;
  g.fillStyle = color; g.fillRect(0, 0, 1, 1); g.fillRect(1, 1, 1, 1);
  p = c.createPattern(cv, 'repeat') ?? color;
  dithers.set(color, p);
  return p;
};
/** A shape in its ramp, lit from above: the lit band along its top, then the base, the shade and the deep down it
 *  (stepped, dithered seams), outlined in the line tone. y0..y1 its extent. */
const shapeY = (c: Ctx, path: () => void, r: Ramp, y0: number, y1: number, lw = 1) => {
  c.beginPath(); path(); c.fillStyle = r[1]; c.fill();
  c.save(); c.clip();
  const h = y1 - y0;
  c.fillStyle = r[0]; c.fillRect(-999, y0 - 4, 1998, h * 0.2 + 4);
  c.fillStyle = dith(c, r[0]); c.fillRect(-999, y0 + h * 0.2, 1998, Math.max(1, h * 0.07));
  c.fillStyle = dith(c, r[2]); c.fillRect(-999, y0 + h * 0.56, 1998, Math.max(1, h * 0.07));
  c.fillStyle = r[2]; c.fillRect(-999, y0 + h * 0.63, 1998, h + 4);
  c.fillStyle = dith(c, r[3]); c.fillRect(-999, y0 + h * 0.82, 1998, Math.max(1, h * 0.06));
  c.fillStyle = r[3]; c.fillRect(-999, y0 + h * 0.88, 1998, h + 4);
  c.restore();
  c.beginPath(); path(); c.strokeStyle = r[4]; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke();
};
const ell = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string | CanvasPattern, rot = 0) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(0.05, rx), Math.max(0.05, ry), rot, 0, Math.PI * 2); c.fill(); };
const line = (c: Ctx, pts: number[], w: number, col: string) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.stroke(); };
const px = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(x, y, w, h); };

// ---------------------------------------------------------------------------------------------------------------
// The mountain lion: about 92 long nose to rump (a tail as long again), 40 at the shoulder; drawn at (x, feetY) facing
// right, `t` its own frame count

export type LionPose = 'run' | 'pounce' | 'maul' | 'drag' | 'crouch' | 'dead';

/** (`hurt`: its eye screwed shut (a hit on one leaving: critters.ts); the 'dead' pose: flat on its back, legs stuck up
 *  stiff, eye crossed out, tongue out: what the engine's special deaths play out on) */
export const drawLion = (c: Ctx, x: number, feetY: number, facing: number, t: number, pose: LionPose, o: { bloody?: number; carry?: 'arm' | 'leg' | 'cap' | null; hurt?: boolean } = {}) => {
  // (each pose's cycle in stepped frames, every frame painted once into a stamp and put down after that)
  const per = pose === 'run' ? 0.42 : pose === 'drag' ? 0.18 : pose === 'maul' ? 0.7 : pose === 'crouch' ? 0.13 : pose === 'pounce' ? 0.13 : 0;
  const n = pose === 'run' || pose === 'maul' || pose === 'drag' ? 8 : pose === 'dead' ? 1 : 4;
  const fr = per ? Math.floor(((((t * per) / (Math.PI * 2)) % 1 + 1) % 1) * n) : 0;
  const bloody = Math.round((o.bloody ?? (pose === 'maul' ? 1 : pose === 'drag' ? 0.8 : 0)) * 2) / 2, drip = Math.floor(t / 6) % 4;
  c.save(); c.translate(Math.round(x), Math.round(feetY)); c.scale(facing < 0 ? -1 : 1, 1);
  stamp(c, `fr-lion-${pose}-${fr}-${bloody}-${bloody ? drip : 0}-${o.carry ?? ''}-${o.hurt ? 1 : 0}`, -100, -74, 176, 92, g => paintLion(g, pose, fr, n, bloody, drip, o.carry ?? null, !!o.hurt));
  c.restore();
};

/** The legs by pose: [hip/shoulder x, y, joint x, y, paw x, y] each. */
const lionLegs = (pose: LionPose, g: number, t: number) => {
  if (pose === 'pounce') return {
    farBack: [-32, -26, -48, -20, -62, -16], nearBack: [-28, -24, -44, -14, -58, -8],
    farFront: [18, -30, 34, -34, 50, -36], nearFront: [20, -28, 38, -28, 54, -30],
  };
  if (pose === 'dead') return {
    // (stiff, splayed: stuck up in the air once it's turned over)
    farBack: [-32, -26, -40, -12, -44, 0], nearBack: [-28, -24, -32, -10, -34, 2],
    farFront: [18, -28, 24, -14, 28, -2], nearFront: [20, -26, 30, -12, 36, 0],
  };
  if (pose === 'maul' || pose === 'crouch') {
    const k = pose === 'maul' ? Math.sin(t * 0.8) * 4 : 0;
    return {
      farBack: [-32, -24, -40, -12, -32, 0], nearBack: [-28, -22, -36, -10, -26, 0],
      farFront: [18, -26, 30 + k, -16, 40 + k, -6], nearFront: [20, -24, 34 - k, -12, 46 - k, -4],
    };
  }
  if (pose === 'drag') {
    const k = Math.sin(g);
    return {
      farBack: [-32, -26, -38, -14, -36 - k * 6, 0], nearBack: [-28, -24, -34, -12, -30 + k * 6, 0],
      farFront: [18, -26, 20, -12, 18 + k * 6, 0], nearFront: [20, -24, 22, -12, 20 - k * 6, 0],
    };
  }
  // (the gallop: the back legs drive together, the front reach together, half a beat apart)
  const a = Math.sin(g), b = Math.sin(g + 1.6);
  return {
    farBack: [-32, -28, -40 - a * 6, -14, -38 - a * 16, -2 + Math.max(0, a) * -6], nearBack: [-28, -26, -36 - a * 8, -12, -32 - a * 18, -1 + Math.max(0, a) * -5],
    farFront: [18, -28, 22 + b * 8, -14, 22 + b * 18, -1 + Math.max(0, -b) * -6], nearFront: [20, -26, 26 + b * 9, -12, 26 + b * 20, 0 + Math.max(0, -b) * -5],
  };
};

/** The lion's head in its own frame (the skull's middle at the origin, facing right): the round skull, the ears laid
 *  back, the pale muzzle and its black edging, the pink nose, the amber eyes narrowed; the jaws open `open` (fangs,
 *  the tongue); blood over the muzzle `bloody`. */
const lionHead = (c: Ctx, open: number, t: number, bloody: number, md: 'ok' | 'hurt' | 'dead' = 'ok') => {
  // (the ears, laid back, dark backed)
  for (const ex of [-5, -1]) { c.fillStyle = PUMA[4]; c.beginPath(); c.moveTo(ex - 3, -6); c.lineTo(ex - 6, -12); c.lineTo(ex + 1, -8); c.closePath(); c.fill(); c.fillStyle = '#3A2414'; c.beginPath(); c.moveTo(ex - 2.6, -6.6); c.lineTo(ex - 5, -10.6); c.lineTo(ex + 0.2, -8); c.closePath(); c.fill(); }
  shapeY(c, () => c.ellipse(0, -1, 9.4, 7.6, 0, 0, Math.PI * 2), PUMA, -9, 7, 0.9);
  // (the jaw: dropped open)
  const jo = open * 5;
  c.save(); c.translate(5, 3); c.rotate(open * 0.45);
  shapeY(c, () => { c.moveTo(-4, 0); c.lineTo(8, 0); c.quadraticCurveTo(9, 3, 6, 4); c.lineTo(-3, 3.6); c.closePath(); }, PUMA_PALE, 0, 4, 0.7);
  if (open > 0.15) { for (const fx of [5.6, 1.6]) { c.fillStyle = TOOTH; c.beginPath(); c.moveTo(fx, 0.2); c.lineTo(fx + 0.8, -2.6); c.lineTo(fx + 1.6, 0.2); c.closePath(); c.fill(); } }
  c.restore();
  if (open > 0.15) { ell(c, 9, 2 + jo * 0.3, 3.4, jo * 0.5 + 0.4, MOUTH); ell(c, 8.6, 2.6 + jo * 0.4, 2.2, jo * 0.25 + 0.2, TONGUE); }
  // (the muzzle: pale, puffed, its whisker pads, the black at its edge; the upper fangs)
  shapeY(c, () => c.ellipse(8, 0.4, 5.6, 3.8, 0, 0, Math.PI * 2), PUMA_PALE, -3.4, 4.2, 0.7);
  line(c, [5, 3.4, 8, 4, 12, 3], 0.8, '#1A120C');
  for (let i = 0; i < 3; i++) px(c, 7 + i * 1.6, 0.6, 0.6, 0.6, '#5A4A34');
  if (open > 0.15) for (const fx of [9.6, 6.4]) { c.fillStyle = TOOTH; c.beginPath(); c.moveTo(fx, 3.2); c.lineTo(fx + 0.8, 6 + open * 1.4); c.lineTo(fx + 1.6, 3.2); c.closePath(); c.fill(); }
  // (the nose: pink, dark rimmed; the bridge down to it, lit)
  c.fillStyle = '#C86A6A'; c.beginPath(); c.moveTo(11.4, -2.4); c.lineTo(14.2, -2); c.lineTo(12.8, 0.2); c.closePath(); c.fill();
  line(c, [3, -6, 10, -3.4], 1.1, PUMA[0]);
  // (the eye: amber, narrowed, a dark tear line down from it)
  if (md === 'dead') { line(c, [3, -5, 6, -1.8], 0.9, '#1A120C'); line(c, [3, -1.8, 6, -5], 0.9, '#1A120C'); }
  else if (md === 'hurt') line(c, [3, -4.6, 5.8, -3.4, 3, -2.2], 0.9, '#1A120C');
  else { ell(c, 4.4, -3.4, 2.2, 1.3, '#1A120C'); ell(c, 4.6, -3.4, 1.7, 0.9, '#E8A830'); ell(c, 5, -3.4, 0.5, 0.8, '#0A0604'); px(c, 4, -3.9, 0.5, 0.4, '#FFFFFF'); }
  line(c, [3.6, -2.6, 4.4, 0.6], 0.6, '#3A2414');
  // (dead: the tongue lolled out the side of its jaws)
  if (md === 'dead') { line(c, [10, 3, 13.4, 4.6, 14.6, 7.4], 2.2, '#5A1A20'); line(c, [10, 3, 13.4, 4.6, 14.6, 7.4], 1.5, TONGUE); }
  line(c, [2, -5.4, 6.2, -4.8], 0.7, PUMA[4]);
  // (blood all over its muzzle and down its chin, dripping)
  if (bloody > 0) {
    c.globalAlpha = Math.min(1, bloody);
    ell(c, 9, 2.6, 5, 2.6, BLOOD[1]); ell(c, 10.6, 1.6, 2.6, 1.4, BLOOD[2]); line(c, [6, 4, 5.6, 7, 6.2, 9], 1, BLOOD[1]);
    const d = ((t + 9) % 24) / 24; ell(c, 6.2, 9 + d * 6, 0.6, 0.9, BLOOD[2]);
    c.globalAlpha = 1;
  }
};

/** A piece of Tucker, in its jaws (the drag): his arm (the navy sleeve, the gold cuff, the white glove), a leg (the gray
 *  pinstripe, the boot), his cap. In the head's frame. */
const carried = (c: Ctx, what: 'arm' | 'leg' | 'cap', t: number) => {
  const sw = Math.sin(t * 0.2) * 0.15;
  c.save(); c.translate(11, 3); c.rotate(0.9 + sw);
  if (what === 'arm') { line(c, [0, 0, 0, 16], 6, '#0A0F22'); line(c, [0, 0, 0, 16], 4.6, '#36467E'); px(c, -2.4, 14, 4.8, 1.4, '#CC9E2C'); ell(c, 0, 19, 3, 3.4, '#F6F4EE'); ell(c, 0, -0.6, 3, 2, BLOOD[2]); px(c, -1, -2, 2, 2, '#F5F0E6'); }
  else if (what === 'leg') { line(c, [0, 0, 0, 20], 7, '#202024'); line(c, [0, 0, 0, 20], 5.6, '#7A7A84'); for (const k of [-1.4, 1.4]) line(c, [k, 1, k, 19], 0.4, '#46464E'); c.fillStyle = '#3C3C44'; c.fillRect(-3, 20, 9, 4); ell(c, 0, -0.6, 3.4, 2, BLOOD[2]); px(c, -1, -2.4, 2, 2.4, '#F5F0E6'); }
  else { ell(c, 0, 6, 8, 3.6, '#283662'); px(c, -7, 4, 14, 2, '#CC9E2C'); ell(c, 5, 8, 5, 1.4, '#1A1A20'); }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The grizzly: about 150 long on all fours, 80 at the hump; reared up, 170 tall. (x, feetY) facing right

export type BearPose = 'run' | 'rear' | 'maul' | 'walk' | 'stand';

export const drawGrizzly = (c: Ctx, x: number, feetY: number, facing: number, t: number, pose: BearPose, o: { carry?: 'leg' | 'arm' | null; bloody?: number } = {}) => {
  const per = pose === 'run' ? 0.3 : pose === 'walk' ? 0.14 : pose === 'maul' ? 0.7 : pose === 'rear' ? 0.2 : 0;
  const n = pose === 'stand' ? 1 : pose === 'rear' ? 6 : 8;
  const fr = per ? Math.floor(((((t * per) / (Math.PI * 2)) % 1 + 1) % 1) * n) : 0;
  const bloody = Math.round((o.bloody ?? (pose === 'maul' ? 1 : 0)) * 2) / 2, drip = Math.floor(t / 5) % 4;
  c.save(); c.translate(Math.round(x), Math.round(feetY)); c.scale(facing < 0 ? -1 : 1, 1);
  stamp(c, `fr-griz-${pose}-${fr}-${bloody}-${bloody ? drip : 0}-${o.carry ?? ''}`, -96, -204, 212, 222, g => paintGrizzly(g, pose, fr, n, bloody, drip, o.carry ?? null));
  c.restore();
};

/** The bear's head in its own frame: the broad dished face, the small round ears, the long muzzle (paler), the black
 *  nose, the little dark eyes; the jaws open `open` (the long canines, the tongue, the slobber); blood `bloody`. */
const bearHead = (c: Ctx, open: number, t: number, bloody: number) => {
  for (const ex of [-8, 0]) { ell(c, ex, -13, 5, 5, GRIZ[4]); ell(c, ex, -13, 4, 4, GRIZ[2]); ell(c, ex + 0.4, -12.6, 2, 2, GRIZ[3]); }
  shapeY(c, () => c.ellipse(0, -2, 15, 12, 0, 0, Math.PI * 2), GRIZ, -14, 10, 1.1);
  const jo = open * 8;
  c.save(); c.translate(8, 5); c.rotate(open * 0.4);
  shapeY(c, () => { c.moveTo(-6, 0); c.lineTo(14, 0); c.quadraticCurveTo(15, 4, 11, 6); c.lineTo(-4, 5.4); c.closePath(); }, GRIZ, 0, 6, 0.9);
  if (open > 0.15) for (const fx of [11, 4]) { c.fillStyle = TOOTH; c.beginPath(); c.moveTo(fx, 0.2); c.lineTo(fx + 1.2, -4.6); c.lineTo(fx + 2.4, 0.2); c.closePath(); c.fill(); }
  c.restore();
  if (open > 0.15) { ell(c, 15, 4 + jo * 0.3, 6, jo * 0.5 + 0.6, MOUTH); ell(c, 14, 5 + jo * 0.4, 4, jo * 0.25 + 0.4, TONGUE); ell(c, 15, 1.6 + jo * 0.3, 5, 0.8, GUM); }
  // (the muzzle, long and paler, the black nose at its end; the canines down over the lip)
  shapeY(c, () => c.ellipse(13, 0, 9, 6, 0, 0, Math.PI * 2), ['#C8A27A', '#A07A52', '#84603C', '#5E4228', '#2A1A0C'], -6, 6, 0.9);
  ell(c, 21, -2, 3.6, 2.8, '#141010'); px(c, 20, -3.4, 1.4, 0.8, '#5A5050');
  if (open > 0.15) for (const fx of [17, 11]) { c.fillStyle = TOOTH; c.beginPath(); c.moveTo(fx, 4.6); c.lineTo(fx + 1.2, 10 + open * 2); c.lineTo(fx + 2.4, 4.6); c.closePath(); c.fill(); }
  // (slobber strung off its jaw)
  if (open > 0.4) { line(c, [16, 6, 16.4, 9 + jo * 0.6], 0.7, 'rgba(240, 240, 255, 0.7)'); }
  ell(c, 4, -5, 1.6, 1.4, '#0A0604'); px(c, 3.6, -5.6, 0.6, 0.5, '#FFFFFF');
  line(c, [1, -8, 6.4, -7], 1, GRIZ[4]);
  if (bloody > 0) {
    c.globalAlpha = Math.min(1, bloody);
    ell(c, 15, 4, 8, 4, BLOOD[1]); ell(c, 18, 2, 4, 2, BLOOD[2]); line(c, [10, 6, 9.4, 11, 10, 14], 1.4, BLOOD[1]);
    const d = ((t + 5) % 20) / 20; ell(c, 10, 14 + d * 8, 0.9, 1.3, BLOOD[2]);
    c.globalAlpha = 1;
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The final pass (peak SNES, near Tucker's grade): each material its own seven-step ramp (light down to its line tone);
// stepped bands down each mass with a fur-stepped seam between (ragged tufts of each tone down into the next, a dither
// row with them), its line tone round it; the muscle masses lit over the bands (shoulder, haunch, the bear's hump),
// ribs and the flank's hollow shaded, fur ticked along the back, a ragged fringe under the belly; legs tapered and lit
// down their leading edge, paws with their toes and claws. Every frame painted once into a stamp.

type R7 = readonly [string, string, string, string, string, string, string];
const CAT: R7 = ['#FCE4BA', '#EAC48C', '#D4A266', '#B88048', '#946032', '#6A4220', '#2E1A0A'];
const CAT_PALE: R7 = ['#FFFBF2', '#F6EAD6', '#E8D6B8', '#D2BC98', '#B09A78', '#7E6A50', '#3E3020'];
const CAT_DARK: R7 = ['#6A5444', '#4E3C30', '#3A2C22', '#2A1E16', '#1E140E', '#140C08', '#0A0604'];
const BEAR: R7 = ['#C49866', '#A47A4C', '#86603A', '#6A4A2C', '#523820', '#3A2614', '#1A1008'];
const BEAR_TIP: R7 = ['#F6ECD6', '#E4D4B4', '#CCB890', '#B09870', '#8C7656', '#64523C', '#2C2218'];
const BEAR_MUZ: R7 = ['#E4C69C', '#CEA87C', '#B68C60', '#9A724A', '#7C5836', '#5A3E24', '#2A1A0C'];
const HORN: R7 = ['#FFFCF0', '#F2EAD6', '#DCCFB2', '#BCAE8E', '#968868', '#6A5E46', '#2E281C'];
const NOSE_CAT = ['#F0A8A0', '#D07870', '#A84E4A', '#5A2422'];

const h01 = (n: number) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
/** A mass in its ramp, lit from above: banded light to dark down y0..y1, each seam fur-stepped, its line tone round it. */
const coat = (c: Ctx, path: () => void, r: R7, x0: number, x1: number, y0: number, y1: number, lw = 1.1, seed = 0) => {
  c.beginPath(); path(); c.fillStyle = r[3]; c.fill();
  c.save(); c.clip();
  const h = y1 - y0, stops = [-0.2, 0.12, 0.28, 0.5, 0.7, 0.86, 1.3];
  for (let i = 0; i < 6; i++) { const ya = y0 + h * stops[i], yb = y0 + h * stops[i + 1]; c.fillStyle = r[i]; c.fillRect(x0 - 3, ya, x1 - x0 + 6, yb - ya + 1); }
  for (let i = 1; i < 6; i++) {
    const ys = y0 + h * stops[i];
    c.fillStyle = dith(c, r[i - 1]); c.fillRect(x0 - 3, ys, x1 - x0 + 6, 1.2);
    c.fillStyle = r[i - 1];
    for (let x = Math.floor(x0); x < x1; x += 2) { const k = h01(x * 0.37 + i * 11 + seed); if (k > 0.5) c.fillRect(x, ys, 1, 1 + k * 2.6); }
  }
  c.restore();
  c.beginPath(); path(); c.strokeStyle = r[6]; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke();
};
/** A muscle mass lit over the bands (inside the body's clip): stepped, a dither ring round its lit core. */
const mass = (c: Ctx, x: number, y: number, rx: number, ry: number, r: R7, k = 1) => {
  ell(c, x, y, rx, ry, dith(c, r[k + 1])); ell(c, x - rx * 0.1, y - ry * 0.12, rx * 0.8, ry * 0.76, r[k + 1]);
  ell(c, x - rx * 0.24, y - ry * 0.28, rx * 0.46, ry * 0.4, r[k]);
};
/** Fur ticked in along a line (x from xa to xb at y(x)): short strokes, dark and light, a few px down into the coat. */
const ticks = (c: Ctx, xa: number, xb: number, y: (x: number) => number, depth: number, r: R7, seed: number, step = 2.2) => {
  for (let x = xa; x < xb; x += step) {
    const k = h01(x * 1.7 + seed), yy = y(x) + k * depth;
    c.fillStyle = k > 0.55 ? r[1] : r[5]; c.fillRect(x, yy, 1, 1.4 + h01(x + seed) * 1.6);
  }
};
/** Shaggy tufts sticking out along a run of points (outward by `dir`: -1 up, 1 down), in the coat's tones. */
const shag = (c: Ctx, pts: [number, number][], dir: number, len: number, r: R7, lit: number, seed: number) => {
  for (let i = 0; i < pts.length; i++) {
    const [x, y] = pts[i], k = h01(i * 3.3 + seed), l = len * (0.5 + k * 0.8);
    c.fillStyle = r[6]; c.beginPath(); c.moveTo(x - 2.4, y); c.lineTo(x + (k - 0.5) * 3, y + dir * (l + 1)); c.lineTo(x + 2.4, y); c.closePath(); c.fill();
    c.fillStyle = r[lit + (i % 2)]; c.beginPath(); c.moveTo(x - 1.6, y - dir * 0.5); c.lineTo(x + (k - 0.5) * 3, y + dir * l); c.lineTo(x + 1.6, y - dir * 0.5); c.closePath(); c.fill();
  }
};
/** Points along a quadratic curve. */
const qpts = (ax: number, ay: number, bx: number, by: number, cx: number, cy: number, n: number): [number, number][] =>
  Array.from({ length: n }, (_, i) => { const u = (i + 0.5) / n, v = 1 - u; return [v * v * ax + 2 * v * u * bx + u * u * cx, v * v * ay + 2 * v * u * by + u * u * cy] as [number, number]; });
/** A leg, tapered (thigh/forearm to the joint, the joint to the paw): its line tone, itself, lit down its leading edge,
 *  shaded down its trailing one; a paw with its toes, the claws out if `claws` (`clawLen` long). */
const limb7 = (c: Ctx, pts: number[], ws: number[], r: R7, claws: boolean, pawR: number, clawLen = 2.8, toes = 3) => {
  for (let i = 0; i < 2; i++) line(c, [pts[i * 2], pts[i * 2 + 1], pts[i * 2 + 2], pts[i * 2 + 3]], ws[i] + 2, r[6]);
  for (let i = 0; i < 2; i++) {
    const ax = pts[i * 2], ay = pts[i * 2 + 1], bx = pts[i * 2 + 2], by = pts[i * 2 + 3], L = Math.hypot(bx - ax, by - ay) || 1;
    let nx = -(by - ay) / L, ny = (bx - ax) / L;
    if (nx + ny > 0) { nx = -nx; ny = -ny; }
    const w = ws[i];
    line(c, [ax, ay, bx, by], w, r[3]);
    line(c, [ax - nx * w * 0.3, ay - ny * w * 0.3, bx - nx * w * 0.3, by - ny * w * 0.3], w * 0.36, r[4]);
    line(c, [ax - nx * w * 0.38, ay - ny * w * 0.38, bx - nx * w * 0.38, by - ny * w * 0.38], Math.max(0.6, w * 0.14), r[5]);
    line(c, [ax + nx * w * 0.24, ay + ny * w * 0.24, bx + nx * w * 0.24, by + ny * w * 0.24], w * 0.3, r[2]);
    line(c, [ax + nx * w * 0.34, ay + ny * w * 0.34, bx + nx * w * 0.34, by + ny * w * 0.34], Math.max(0.6, w * 0.12), r[1]);
  }
  // (the joint's knob, lit)
  ell(c, pts[2] - ws[1] * 0.1, pts[3] - ws[1] * 0.2, ws[1] * 0.3, ws[1] * 0.24, r[2]);
  const fx = pts[4], fy = pts[5];
  ell(c, fx + 1, fy, pawR + 1, pawR * 0.66 + 1, r[6]); ell(c, fx + 1, fy, pawR, pawR * 0.66, r[3]); ell(c, fx + 0.4, fy - pawR * 0.28, pawR * 0.66, pawR * 0.3, r[1]);
  for (let k = 1; k < toes; k++) px(c, fx + 1 - pawR + (2 * pawR * k) / toes, fy - pawR * 0.1, 0.7, pawR * 0.6, r[5]);
  if (claws) for (let k = 0; k < toes; k++) {
    const cy = fy - pawR * 0.4 + k * pawR * 0.5;
    c.fillStyle = HORN[6]; c.beginPath(); c.moveTo(fx + pawR * 0.6, cy - 0.9); c.quadraticCurveTo(fx + pawR + clawLen * 0.8, cy - 0.6, fx + pawR + clawLen, cy + 1.6); c.lineTo(fx + pawR * 0.6, cy + 0.9); c.closePath(); c.fill();
    c.fillStyle = HORN[1]; c.beginPath(); c.moveTo(fx + pawR * 0.7, cy - 0.4); c.quadraticCurveTo(fx + pawR + clawLen * 0.7, cy - 0.2, fx + pawR + clawLen - 0.4, cy + 1.2); c.lineTo(fx + pawR * 0.7, cy + 0.4); c.closePath(); c.fill();
  }
};
/** A tail: tapered along its points (thick at the root), its line tone, itself, lit along its top, shaded under; the tip
 *  `tip` (the cougar's black) with a tuft. */
const tail7 = (c: Ctx, pts: number[], r0: number, r1: number, r: R7, tip?: R7) => {
  const P: [number, number][] = [];
  for (let i = 0; i + 3 < pts.length; i += 2) for (let s = 0; s < 8; s++) { const u = s / 8; P.push([pts[i] + (pts[i + 2] - pts[i]) * u, pts[i + 1] + (pts[i + 3] - pts[i + 1]) * u]); }
  P.push([pts[pts.length - 2], pts[pts.length - 1]]);
  const rad = (i: number) => r0 + (r1 - r0) * (i / (P.length - 1));
  const tipAt = Math.floor(P.length * 0.8);
  for (const [k, col, dy, s] of [[0, 'line', 0, 1.3], [1, 'base', 0, 1], [2, 'shade', 0.5, 0.6], [3, 'lit', -0.45, 0.45], [4, 'hi', -0.6, 0.18]] as const) {
    P.forEach(([x, y], i) => {
      const R = tip && i >= tipAt ? tip : r, rr = rad(i);
      const cl = col === 'line' ? R[6] : col === 'base' ? R[3] : col === 'shade' ? R[5] : col === 'lit' ? R[2] : R[1];
      ell(c, x, y + dy * rr, k === 0 ? rr + 1 : rr * s, k === 0 ? rr + 1 : rr * s, cl);
    });
  }
  if (tip) { const [x, y] = P[P.length - 1]; c.fillStyle = tip[6]; c.beginPath(); c.moveTo(x - 2, y - 2); c.lineTo(x - 5, y + 1); c.lineTo(x - 1, y + 3); c.closePath(); c.fill(); }
};

/** The cougar's head (the skull's middle at the origin, facing right): ears laid back (their black backs, pale tufts
 *  in them), the broad skull stepped, the pale cheek ruff and muzzle, the black lip line and whisker pads, the dark
 *  malar marks, the tear line, the pink nose rimmed dark, round amber eyes with a glint; the jaws open `open` (fangs,
 *  gums, the tongue); blood all over its muzzle `bloody` (dripping, `drip` its frame). */
const catHead = (c: Ctx, open: number, bloody: number, md: 'ok' | 'hurt' | 'dead', drip: number) => {
  // (the ears, laid back)
  for (const [ex, sc] of [[-6, 0.9], [-1, 1]] as const) {
    c.fillStyle = CAT[6]; c.beginPath(); c.moveTo(ex - 3.4 * sc, -5.6); c.lineTo(ex - 7.6 * sc, -12.6 * sc); c.lineTo(ex + 1.4, -8); c.closePath(); c.fill();
    c.fillStyle = CAT_DARK[2]; c.beginPath(); c.moveTo(ex - 2.8 * sc, -6.2); c.lineTo(ex - 6.6 * sc, -11.4 * sc); c.lineTo(ex + 0.4, -8.2); c.closePath(); c.fill();
    c.fillStyle = CAT_PALE[2]; c.beginPath(); c.moveTo(ex - 1.6, -7); c.lineTo(ex - 4.4 * sc, -10 * sc); c.lineTo(ex, -8); c.closePath(); c.fill();
  }
  // (the skull: broad, stepped; the brow ridge lit; dark ticks over the crown)
  coat(c, () => c.ellipse(0, -1, 9.8, 7.8, 0, 0, Math.PI * 2), CAT, -10, 10, -9, 7, 0.9, 3);
  line(c, [-1, -6.6, 6, -5.4, 10, -3.2], 1.1, CAT[0]);
  for (let i = 0; i < 6; i++) px(c, -6 + i * 1.8, -7.4 + (i % 2), 0.8, 1.2, CAT[5]);
  // (the cheek ruff, pale, back under the eye)
  ell(c, 1, 3, 6.4, 3.6, CAT_PALE[6]); ell(c, 1, 2.8, 5.8, 3.1, CAT_PALE[3]); ell(c, 0.4, 2.2, 4.4, 2, CAT_PALE[2]);
  for (let i = 0; i < 4; i++) px(c, -4 + i * 2.2, 5 + (i % 2), 0.8, 1.6, CAT_PALE[4]);
  // (the jaw, dropped open)
  const jo = open * 5;
  c.save(); c.translate(5, 3); c.rotate(open * 0.45);
  coat(c, () => { c.moveTo(-4, 0); c.lineTo(8, 0); c.quadraticCurveTo(9.4, 3, 6, 4.4); c.lineTo(-3, 3.8); c.closePath(); }, CAT_PALE, -4, 9.4, 0, 4.4, 0.7, 5);
  if (open > 0.15) { px(c, -2, 0, 9, 0.8, '#B0404A'); for (const fx of [5.4, 1.6]) { c.fillStyle = '#5A4A34'; c.beginPath(); c.moveTo(fx - 0.2, 0.4); c.lineTo(fx + 0.8, -2.9); c.lineTo(fx + 1.8, 0.4); c.closePath(); c.fill(); c.fillStyle = TOOTH; c.beginPath(); c.moveTo(fx, 0.2); c.lineTo(fx + 0.8, -2.6); c.lineTo(fx + 1.6, 0.2); c.closePath(); c.fill(); } }
  c.restore();
  if (open > 0.15) { ell(c, 9, 2 + jo * 0.3, 3.6, jo * 0.5 + 0.5, MOUTH); ell(c, 8.6, 2.8 + jo * 0.4, 2.4, jo * 0.26 + 0.3, TONGUE); px(c, 7.4, 2.2 + jo * 0.3, 2, 0.6, '#F09098'); }
  // (the muzzle: pale and puffed, its whisker pads in rows of dark spots, the black malar mark beside it, the black lip
  // line; whiskers; the upper fangs)
  coat(c, () => c.ellipse(8, 0.4, 5.8, 4, 0, 0, Math.PI * 2), CAT_PALE, 2.2, 13.8, -3.6, 4.4, 0.7, 7);
  c.fillStyle = CAT_DARK[3]; c.beginPath(); c.moveTo(3.4, -2.6); c.quadraticCurveTo(2.4, 0.4, 3.6, 3.4); c.lineTo(4.8, 3); c.quadraticCurveTo(3.8, 0.4, 4.6, -2.2); c.closePath(); c.fill();
  line(c, [4.6, 3.6, 8, 4.2, 12.4, 3], 0.9, CAT_DARK[5]);
  for (let r2 = 0; r2 < 2; r2++) for (let i = 0; i < 4; i++) px(c, 6.4 + i * 1.5, 0.4 + r2 * 1.3, 0.7, 0.7, CAT_DARK[2]);
  c.strokeStyle = 'rgba(255, 252, 240, 0.85)'; c.lineWidth = 0.4; c.beginPath(); for (const [ey, dy] of [[0.8, -2], [1.8, 0], [2.6, 2]] as const) { c.moveTo(10, ey); c.lineTo(17, ey + dy); } c.stroke();
  if (open > 0.15) for (const fx of [9.6, 6.4]) { c.fillStyle = '#5A4A34'; c.beginPath(); c.moveTo(fx - 0.2, 3); c.lineTo(fx + 0.8, 6.3 + open * 1.4); c.lineTo(fx + 1.8, 3); c.closePath(); c.fill(); c.fillStyle = TOOTH; c.beginPath(); c.moveTo(fx, 3.2); c.lineTo(fx + 0.8, 6 + open * 1.4); c.lineTo(fx + 1.6, 3.2); c.closePath(); c.fill(); }
  // (the nose: pink, rimmed dark, its nostril; the bridge down to it lit)
  c.fillStyle = NOSE_CAT[3]; c.beginPath(); c.moveTo(11, -2.9); c.lineTo(14.8, -2.3); c.lineTo(13, 0.6); c.closePath(); c.fill();
  c.fillStyle = NOSE_CAT[1]; c.beginPath(); c.moveTo(11.6, -2.4); c.lineTo(14, -2); c.lineTo(12.9, -0.2); c.closePath(); c.fill();
  px(c, 12, -2.2, 1.2, 0.6, NOSE_CAT[0]); px(c, 13.4, -1.2, 0.8, 0.6, NOSE_CAT[3]);
  line(c, [3, -5.8, 10, -3.6], 1, CAT[1]);
  // (the eye: round amber, a dark rim, the round pupil, a glint; the tear line down from it to the lip)
  if (md === 'dead') { line(c, [3, -5, 6, -1.8], 1, CAT_DARK[6]); line(c, [3, -1.8, 6, -5], 1, CAT_DARK[6]); }
  else if (md === 'hurt') line(c, [3, -4.6, 5.8, -3.4, 3, -2.2], 1, CAT_DARK[6]);
  else {
    ell(c, 4.5, -3.4, 2.4, 1.6, CAT_DARK[6]); ell(c, 4.6, -3.4, 1.9, 1.15, '#D89A28'); ell(c, 4.4, -3.8, 1.5, 0.6, '#F4C450');
    ell(c, 5, -3.3, 0.7, 0.75, '#0A0604'); px(c, 3.9, -4.2, 0.6, 0.5, '#FFFFFF');
    line(c, [2.2, -5.4, 6.6, -5], 0.8, CAT_DARK[5]);
  }
  line(c, [3.6, -2.4, 4.2, 0.2, 3.8, 2.4], 0.7, CAT_DARK[4]);
  if (md === 'dead') { line(c, [10, 3, 13.4, 4.6, 14.6, 7.4], 2.4, '#5A1A20'); line(c, [10, 3, 13.4, 4.6, 14.6, 7.4], 1.6, TONGUE); px(c, 12.4, 4, 1, 0.6, '#F4A8B0'); }
  // (blood all over its muzzle and down its chin, stepped, dripping)
  if (bloody > 0) {
    c.globalAlpha = Math.min(1, bloody);
    ell(c, 9, 2.8, 5.2, 2.8, BLOOD[0]); ell(c, 9.4, 2.4, 4.4, 2.2, BLOOD[1]); ell(c, 10.6, 1.6, 2.6, 1.3, BLOOD[2]); px(c, 10, 1, 1.4, 0.6, BLOOD[3]);
    line(c, [6, 4.2, 5.6, 7, 6.2, 9], 1.2, BLOOD[1]); line(c, [11, 4, 11.4, 6.4], 0.9, BLOOD[1]);
    ell(c, 6.2, 9.6 + drip * 1.6, 0.7, 1, BLOOD[2]);
    c.globalAlpha = 1;
  }
};

/** The cougar, painted (feet at the origin, facing right; `fr` of `n` the cycle's frame). */
const paintLion = (c: Ctx, pose: LionPose, fr: number, n: number, bloody: number, drip: number, carry: 'arm' | 'leg' | 'cap' | null, hurt: boolean) => {
  const ph = (fr / n) * Math.PI * 2, dead = pose === 'dead';
  c.save();
  // (dead: turned over onto its back, its back on the ground, its paws in the air)
  if (dead) { c.translate(0, -50); c.scale(1, -1); }
  const air = pose === 'pounce', low = pose === 'maul' ? 9 : pose === 'crouch' ? 7 : pose === 'drag' ? 3 : 0;
  const bob = pose === 'run' ? Math.abs(Math.sin(ph)) * -4 : pose === 'maul' ? Math.sin(ph) * 1.6 : 0;
  const tilt = air ? -0.12 : pose === 'maul' ? 0.08 + Math.sin(ph + 1) * 0.04 : pose === 'drag' ? 0.06 : pose === 'run' ? Math.sin(ph) * 0.04 : 0;
  c.translate(0, bob + low); c.rotate(tilt);
  // ---- the tail: long, low, curling up at its black tip (swishing)
  const sw = (dead ? 0 : Math.sin(ph) * (pose === 'maul' ? 7 : pose === 'run' ? 4 : 6)) + (air ? -10 : 0);
  tail7(c, [-40, -32, -58, -26 + sw * 0.4, -72, -20 + sw, -80, -26 + sw * 1.3], 3.6, 2.6, CAT, CAT_DARK);
  // ---- the far legs (a step darker)
  const D: R7 = [CAT[1], CAT[2], CAT[3], CAT[4], CAT[5], CAT[5], CAT[6]];
  const L = lionLegs(pose, ph, ph / 0.8);
  const clawsOut = air || pose === 'maul' || pose === 'crouch';
  limb7(c, L.farBack, [8, 5], D, false, 4); limb7(c, L.farFront, [7, 4.6], D, clawsOut, 4);
  // ---- the body: deep chest, the waist tucked up, the haunch round
  const body = () => {
    c.moveTo(22, -46); c.quadraticCurveTo(4, -50, -18, -45); c.quadraticCurveTo(-40, -44, -44, -32);
    c.quadraticCurveTo(-44, -18, -32, -17); c.quadraticCurveTo(-14, -20, 4, -16); c.quadraticCurveTo(22, -12, 28, -24);
    c.quadraticCurveTo(32, -38, 22, -46); c.closePath();
  };
  coat(c, body, CAT, -46, 32, -50, -12, 1.2, 11);
  c.save(); c.beginPath(); body(); c.clip();
  // (the haunch and the shoulder lit over the bands; the flank's hollow and the ribs shaded; the darker saddle down the
  // spine; the pale belly and chest with its ragged fringe)
  mass(c, -30, -36, 13, 11, CAT); mass(c, 14, -38, 10, 9, CAT);
  ell(c, -8, -24, 12, 5, dith(c, CAT[5])); for (let i = 0; i < 3; i++) line(c, [-2 + i * 5, -36, -4 + i * 5, -26], 0.8, CAT[5]);
  line(c, [-36, -40, -30, -30, -34, -20], 1, CAT[5]); line(c, [18, -44, 12, -30], 1, CAT[5]);
  c.fillStyle = CAT[4]; c.beginPath(); c.moveTo(20, -47); c.quadraticCurveTo(0, -51, -20, -46); c.quadraticCurveTo(-36, -45, -42, -38); c.lineTo(-40, -36); c.quadraticCurveTo(-30, -42, -18, -43.4); c.quadraticCurveTo(2, -48, 20, -44); c.closePath(); c.fill();
  ell(c, 8, -17, 17, 4.6, CAT_PALE[3]); ell(c, 8, -18.4, 15, 2.6, CAT_PALE[2]); ell(c, 10, -19.4, 10, 1.2, CAT_PALE[1]);
  for (let x = -8; x < 24; x += 2) { const k = h01(x * 2.1); px(c, x, -21.6 - k * 2.4, 1, 2 + k * 2, k > 0.5 ? CAT_PALE[3] : CAT[3]); }
  c.restore();
  ticks(c, -40, 20, x => -46 + Math.abs(x + 10) * 0.06, 6, CAT, 5);
  // ---- the near legs
  limb7(c, L.nearBack, [9, 5.4], CAT, false, 4.4); limb7(c, L.nearFront, [8, 5], CAT, clawsOut, 4.6);
  // ---- the neck and the head: low and forward; down tearing when mauling, the jaws on something when dragging
  const hp = pose === 'maul' ? { x: 36, y: -14 + Math.sin(ph) * 3, a: 0.5 + Math.sin(ph + 0.8) * 0.15 } : pose === 'drag' ? { x: 34, y: -30, a: 0.15 } : pose === 'crouch' ? { x: 34, y: -30, a: 0.05 } : dead ? { x: 36, y: -38, a: -0.35 } : air ? { x: 36, y: -44, a: -0.15 } : { x: 34, y: -42 + Math.sin(ph) * 1.5, a: 0 };
  const neck = () => { c.moveTo(18, -44); c.quadraticCurveTo(hp.x - 6, hp.y - 10, hp.x, hp.y - 6); c.lineTo(hp.x + 2, hp.y + 6); c.quadraticCurveTo(hp.x - 8, hp.y + 8, 20, -24); c.closePath(); };
  coat(c, neck, CAT, 16, hp.x + 4, Math.min(-44, hp.y - 10), -24, 1.1, 13);
  c.save(); c.beginPath(); neck(); c.clip(); ell(c, hp.x - 6, hp.y + 6, 7, 5, CAT_PALE[2]); ell(c, hp.x - 7, hp.y + 5, 5, 3, CAT_PALE[1]); c.restore();
  const open = pose === 'pounce' ? 1 : pose === 'maul' ? 0.6 + Math.sin(ph) * 0.4 : pose === 'crouch' ? 0.5 : dead ? 0.55 : pose === 'drag' ? 0.35 : 0.2;
  c.save(); c.translate(hp.x, hp.y); c.rotate(hp.a);
  catHead(c, open, bloody, dead ? 'dead' : hurt ? 'hurt' : 'ok', drip);
  // (what it's carrying off: a piece of him)
  if (carry) carried(c, carry, ph * 5);
  c.restore();
  c.restore();
};

/** The grizzly's head (its own frame): the broad dished face stepped, the small round ears (dark inside, the rims
 *  silvered), the long tan muzzle, the black nose with its nostrils and glint, the little dark eyes under a heavy brow;
 *  the jaws open `open` (the long canines, the gums, the tongue, slobber strung off it); blood `bloody`. */
const bearFace = (c: Ctx, open: number, bloody: number, drip: number) => {
  for (const ex of [-9, 0]) { ell(c, ex, -13, 5.6, 5.4, BEAR[6]); ell(c, ex, -13.2, 4.6, 4.4, BEAR[2]); ell(c, ex - 0.6, -14, 3.4, 2.6, BEAR_TIP[3]); ell(c, ex + 0.4, -12.4, 2.2, 2, BEAR[5]); }
  coat(c, () => c.ellipse(0, -2, 15, 12, 0, 0, Math.PI * 2), BEAR, -15, 15, -14, 10, 1.1, 21);
  // (the silvered crown, the heavy brow, the fur ticked over the cheeks)
  c.save(); c.beginPath(); c.ellipse(0, -2, 15, 12, 0, 0, Math.PI * 2); c.clip();
  for (let i = 0; i < 14; i++) px(c, -12 + i * 1.8, -13 + (i % 3) * 1.2 + Math.abs(i - 7) * 0.3, 1.2, 1.6, i % 2 ? BEAR_TIP[1] : BEAR_TIP[3]);
  for (let i = 0; i < 12; i++) px(c, -10 + (i % 6) * 3, 1 + Math.floor(i / 6) * 3, 1, 2, BEAR[5]);
  c.restore();
  line(c, [0, -7.6, 7, -6.4], 1.6, BEAR[5]); line(c, [0.4, -8.4, 6.6, -7.4], 0.8, BEAR[1]);
  const jo = open * 8;
  c.save(); c.translate(8, 5); c.rotate(open * 0.4);
  coat(c, () => { c.moveTo(-6, 0); c.lineTo(14, 0); c.quadraticCurveTo(15.6, 4, 11, 6.4); c.lineTo(-4, 5.6); c.closePath(); }, BEAR_MUZ, -6, 15.6, 0, 6.4, 0.9, 23);
  if (open > 0.15) { px(c, -3, 0, 16, 1, GUM); for (const fx of [11, 4]) { c.fillStyle = HORN[5]; c.beginPath(); c.moveTo(fx - 0.2, 0.4); c.lineTo(fx + 1.2, -4.9); c.lineTo(fx + 2.6, 0.4); c.closePath(); c.fill(); c.fillStyle = TOOTH; c.beginPath(); c.moveTo(fx, 0.2); c.lineTo(fx + 1.2, -4.6); c.lineTo(fx + 2.4, 0.2); c.closePath(); c.fill(); } for (let k = 0; k < 3; k++) px(c, 6 + k * 1.4, -1, 1, 1, TOOTH); }
  c.restore();
  if (open > 0.15) { ell(c, 15, 4 + jo * 0.3, 6.2, jo * 0.5 + 0.7, MOUTH); ell(c, 14, 5.2 + jo * 0.4, 4.2, jo * 0.26 + 0.4, TONGUE); px(c, 12, 4.6 + jo * 0.36, 3, 0.8, '#F09098'); ell(c, 15, 1.6 + jo * 0.3, 5.2, 0.9, GUM); }
  // (the long muzzle, paler, the black nose at its end; the canines down over the lip)
  coat(c, () => c.ellipse(13, 0, 9.4, 6.2, 0, 0, Math.PI * 2), BEAR_MUZ, 3.6, 22.4, -6.2, 6.2, 0.9, 27);
  line(c, [5, 5, 12, 5.8, 20, 3.4], 0.9, BEAR_MUZ[6]);
  ell(c, 21.2, -2, 3.8, 3, '#0E0A0A'); ell(c, 21, -2.6, 2.8, 1.8, '#2A2424'); px(c, 20, -3.6, 1.6, 0.8, '#7A7070'); px(c, 22.6, -1.4, 1, 1, '#000000'); px(c, 19.8, -1.2, 0.8, 0.8, '#000000');
  if (open > 0.15) for (const fx of [17, 11]) { c.fillStyle = HORN[5]; c.beginPath(); c.moveTo(fx - 0.2, 4.4); c.lineTo(fx + 1.2, 10.4 + open * 2); c.lineTo(fx + 2.6, 4.4); c.closePath(); c.fill(); c.fillStyle = TOOTH; c.beginPath(); c.moveTo(fx, 4.6); c.lineTo(fx + 1.2, 10 + open * 2); c.lineTo(fx + 2.4, 4.6); c.closePath(); c.fill(); }
  // (slobber strung off its jaw)
  if (open > 0.4) { line(c, [16, 6, 16.4, 9 + jo * 0.6], 0.7, 'rgba(240, 240, 255, 0.75)'); line(c, [12, 6.4, 11.6, 8 + jo * 0.4], 0.5, 'rgba(240, 240, 255, 0.6)'); }
  // (the little eye, deep under the brow, a glint)
  ell(c, 4, -5, 1.9, 1.6, BEAR[6]); ell(c, 4.1, -5, 1.3, 1.1, '#2A1408'); px(c, 3.5, -5.7, 0.7, 0.6, '#FFFFFF');
  if (bloody > 0) {
    c.globalAlpha = Math.min(1, bloody);
    ell(c, 15, 4.4, 8.4, 4.2, BLOOD[0]); ell(c, 15.4, 4, 7.4, 3.4, BLOOD[1]); ell(c, 18, 2, 4, 2, BLOOD[2]); px(c, 17, 1.2, 2, 0.8, BLOOD[3]);
    line(c, [10, 6, 9.4, 11, 10, 14], 1.4, BLOOD[1]); line(c, [19, 6, 19.6, 9], 1, BLOOD[1]);
    ell(c, 10, 14.6 + drip * 2, 0.9, 1.3, BLOOD[2]);
    c.globalAlpha = 1;
  }
};

/** The grizzly, painted (feet at the origin, facing right; `fr` of `n` the cycle's frame). */
const paintGrizzly = (c: Ctx, pose: BearPose, fr: number, n: number, bloody: number, drip: number, carry: 'leg' | 'arm' | null) => {
  const ph = (fr / n) * Math.PI * 2;
  const D: R7 = [BEAR[1], BEAR[2], BEAR[3], BEAR[4], BEAR[5], BEAR[5], BEAR[6]];
  c.save();
  if (pose === 'rear') {
    // ---- reared up on its hind legs, roaring, the forepaws up and out, claws spread
    c.rotate(Math.sin(ph) * 0.05);
    limb7(c, [-14, -60, -20, -32, -18, -4], [20, 14], D, false, 8, 4, 4);
    const torso = () => { c.moveTo(-30, -60); c.quadraticCurveTo(-40, -110, -20, -150); c.quadraticCurveTo(0, -164, 18, -146); c.quadraticCurveTo(30, -110, 20, -64); c.quadraticCurveTo(0, -48, -30, -60); c.closePath(); };
    coat(c, torso, BEAR, -40, 30, -164, -50, 1.4, 31);
    c.save(); c.beginPath(); torso(); c.clip();
    mass(c, -2, -98, 15, 26, BEAR_MUZ, 2); mass(c, -10, -138, 18, 12, BEAR);
    for (let i = 0; i < 6; i++) line(c, [-12 + i * 5, -74 + (i % 2) * 2, -13 + i * 5, -66], 0.9, BEAR[5]);
    c.restore();
    shag(c, qpts(-30, -60, -40, -110, -20, -150, 9), -1, 3.4, BEAR, 3, 3);
    shag(c, qpts(-20, -150, 0, -164, 18, -146, 6), -1, 4, BEAR_TIP, 1, 7);
    ticks(c, -24, 16, x => -152 + Math.abs(x) * 0.18, 10, BEAR_TIP, 9);
    limb7(c, [6, -60, 4, -32, 8, -4], [22, 15], BEAR, false, 8.6, 4, 4);
    const up = Math.sin(ph) * 6;
    limb7(c, [-16, -136, -38, -150 - up, -50, -168 - up], [14, 10], D, true, 7, 7, 4);
    limb7(c, [12, -136, 34, -152 + up, 46, -170 + up], [15, 11], BEAR, true, 7.4, 7, 4);
    c.save(); c.translate(6, -164); c.rotate(-0.5);
    bearFace(c, 1, bloody, drip);
    c.restore();
    c.restore();
    return;
  }
  const st = pose === 'stand', run = pose === 'run';
  const low = pose === 'maul' ? 10 : 0, bob = run ? -Math.abs(Math.sin(ph)) * 5 : pose === 'maul' ? Math.sin(ph) * 2 : 0;
  c.translate(0, bob + low);
  c.rotate(pose === 'maul' ? 0.1 + Math.sin(ph + 0.6) * 0.05 : st ? 0 : Math.sin(ph) * 0.03);
  const k = st ? 0 : Math.sin(ph), k2 = st ? 0 : Math.sin(ph + 1.4), mp = Math.sin(ph + 0.3);
  // ---- the far legs
  limb7(c, [-46, -46, -52 - k * 8, -24, -50 - k * 14, -1], [20, 14], D, false, 8, 4, 4);
  limb7(c, pose === 'maul' ? [30, -50, 50, -40, 66, -18] : [30, -52, 34 + k2 * 8, -26, 34 + k2 * 14, -1], [20, 14], D, true, 8, 6, 4);
  // ---- the body: the great hump over the shoulders, the back sloping to the rump; shaggy
  const body = () => {
    c.moveTo(44, -60); c.quadraticCurveTo(26, -96, 2, -84); c.quadraticCurveTo(-30, -80, -54, -70);
    c.quadraticCurveTo(-70, -60, -66, -40); c.quadraticCurveTo(-60, -24, -40, -26); c.quadraticCurveTo(0, -18, 36, -26);
    c.quadraticCurveTo(52, -36, 44, -60); c.closePath();
  };
  coat(c, body, BEAR, -70, 52, -96, -18, 1.4, 41);
  c.save(); c.beginPath(); body(); c.clip();
  // (the hump's mass and the shoulder, silver-tipped; the haunch; the belly's shadow; the guard hairs combed back)
  mass(c, 18, -76, 22, 14, BEAR_TIP, 1); mass(c, 22, -52, 14, 16, BEAR); mass(c, -48, -56, 18, 16, BEAR);
  ell(c, -6, -26, 34, 7, dith(c, BEAR[6]));
  for (let i = 0; i < 18; i++) { const x = -60 + i * 6, y = -60 + (i % 3) * 6; line(c, [x, y, x - 4, y + 3], 0.8, i % 2 ? BEAR[5] : BEAR[1]); }
  c.restore();
  // (the shag: silver-tipped tufts up over the hump and down the back, a long ragged fringe under the belly)
  shag(c, qpts(44, -60, 26, -96, 2, -84, 8), -1, 4, BEAR_TIP, 1, 11);
  shag(c, qpts(2, -84, -30, -80, -54, -70, 7), -1, 3, BEAR, 2, 13);
  shag(c, qpts(-40, -26, 0, -18, 36, -26, 12), 1, 4.4, BEAR, 3, 17);
  ticks(c, -56, 40, x => (x > 2 ? -86 + (x - 2) * 0.6 : -84 + (2 - x) * 0.25), 8, BEAR_TIP, 19);
  // ---- the near legs
  limb7(c, [-40, -44, -44 + k * 9, -22, -42 + k * 16, 0], [22, 15], BEAR, false, 8.6, 4, 4);
  limb7(c, pose === 'maul' ? [34, -46, 56, -30 + mp * 8, 74, -10 + mp * 10] : [34, -48, 38 - k2 * 9, -24, 38 - k2 * 16, 0], [22, 15], BEAR, true, 8.6, 6, 4);
  // ---- the head: low and forward on the thick neck (down tearing when mauling; a leg of his in its jaws walking off)
  const hp = pose === 'maul' ? { x: 62, y: -20 + Math.sin(ph) * 5, a: 0.6 + Math.sin(ph + 1) * 0.2 } : pose === 'walk' ? { x: 58, y: -50, a: 0.15 } : { x: 60, y: -56 + (run ? Math.sin(ph) * 3 : 0), a: 0.05 };
  const neck = () => { c.moveTo(36, -74); c.quadraticCurveTo(hp.x - 6, hp.y - 18, hp.x, hp.y - 10); c.lineTo(hp.x + 2, hp.y + 10); c.quadraticCurveTo(hp.x - 10, hp.y + 14, 40, -34); c.closePath(); };
  coat(c, neck, BEAR, 34, hp.x + 4, Math.min(-74, hp.y - 18), -34, 1.2, 43);
  shag(c, qpts(40, -34, hp.x - 10, hp.y + 14, hp.x + 2, hp.y + 10, 5), 1, 3.4, BEAR, 3, 23);
  c.save(); c.translate(hp.x, hp.y); c.rotate(hp.a);
  bearFace(c, pose === 'maul' ? 0.6 + Math.sin(ph) * 0.4 : run ? 0.5 : pose === 'walk' ? 0.3 : 0.1, bloody, drip);
  if (carry) { c.save(); c.translate(6, 4); c.scale(1.4, 1.4); carried(c, carry, ph * 5); c.restore(); }
  c.restore();
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The close-ups (the mutilation rule): over his face on tucker.ts's close-up, in its head units

const rnd = (n: number) => { const v = Math.sin(n * 91.7 + 13.3) * 43758.5453; return v - Math.floor(v); };
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Blood and bits bursting out from (x, y) at phase q 0..1: n drops, flung up and out, falling; every few a chunk
 *  (meat, a fleck of bone, a tooth). */
const burst = (c: Ctx, x: number, y: number, q: number, n: number, seed: number, spread = 1.6, power = 30) => {
  if (q <= 0 || q >= 1) return;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (rnd(i + seed) - 0.5) * 2 * spread, sp = power * (0.4 + rnd(i + seed + 1) * 0.8), qq = (q * (0.8 + rnd(i + seed + 2) * 0.5)) % 1;
    const bx = x + Math.cos(a) * sp * qq, by = y + Math.sin(a) * sp * qq + 30 * qq * qq;
    c.globalAlpha = 1 - qq;
    if (i % 9 === 0) { c.save(); c.translate(bx, by); c.rotate(qq * 7 + i); px(c, -1.2, -0.8, 2.4, 1.6, '#C0303A'); px(c, -0.4, -0.8, 1, 0.6, '#F4A0A0'); c.restore(); }
    else if (i % 11 === 0) { c.save(); c.translate(bx, by); c.rotate(qq * 9 + i); px(c, -1, -0.4, 2, 0.8, '#F5F0E6'); c.restore(); }
    else ell(c, bx, by, 0.5 + rnd(i + seed) * 0.9, 0.4 + rnd(i + seed + 3) * 0.6, BLOOD[i % 4]);
  }
  c.globalAlpha = 1;
};
/** Claw gashes torn down across his face, `n` of them, each `k` 0..1 how far it's ripped, from (x, y) along angle a. */
const gashes = (c: Ctx, x: number, y: number, a: number, len: number, k: number, gap = 3.4) => {
  for (let i = -1; i <= 1; i++) {
    const ox = -Math.sin(a) * gap * i, oy = Math.cos(a) * gap * i, L = len * clamp01(k * 1.2 - (i + 1) * 0.1);
    if (L <= 0) continue;
    const ex = x + ox + Math.cos(a) * L, ey = y + oy + Math.sin(a) * L;
    line(c, [x + ox, y + oy, ex, ey], 2.2, '#3A0606');
    line(c, [x + ox, y + oy, ex, ey], 1.3, '#B91C1C');
    line(c, [x + ox + 0.4, y + oy, ex + 0.4, ey], 0.4, '#F4A0A0');
    // (flesh peeled up at the edges, blood running down off each)
    line(c, [ex, ey, ex + 0.4, ey + 5 * k], 0.7, BLOOD[1]);
  }
};
/** A claw: the curved hook, white, its base dark (in its paw). */
const claw = (c: Ctx, x: number, y: number, a: number, s: number) => {
  c.save(); c.translate(x, y); c.rotate(a); c.scale(s, s);
  c.fillStyle = '#2A1A0C'; c.beginPath(); c.moveTo(-1.4, 0); c.quadraticCurveTo(2, 1, 4.6, 5.4); c.quadraticCurveTo(1, 2.8, -1.4, 1.8); c.closePath(); c.fill();
  c.fillStyle = CLAW; c.beginPath(); c.moveTo(-1, 0.2); c.quadraticCurveTo(2, 1.1, 4.2, 5); c.quadraticCurveTo(1, 2.6, -1, 1.4); c.closePath(); c.fill();
  c.restore();
};
/** A great paw in from off the frame, claws out, swiping along (x0,y0)->(x1,y1) at k 0..1. */
const paw = (c: Ctx, x: number, y: number, a: number, s: number, r: Ramp) => {
  c.save(); c.translate(x, y); c.rotate(a);
  line(c, [-40 * s, -6 * s, -4 * s, 0], 12 * s, r[4]); line(c, [-40 * s, -6 * s, -4 * s, 0], 10 * s, r[1]); line(c, [-40 * s, -9 * s, -4 * s, -3 * s], 3 * s, r[0]);
  ell(c, 0, 0, 7 * s, 6 * s, r[4]); ell(c, 0, 0, 6 * s, 5 * s, r[1]); ell(c, -1 * s, -2 * s, 4 * s, 2 * s, r[0]);
  for (let i = 0; i < 4; i++) claw(c, 4 * s, (-4 + i * 2.6) * s, 0.2 + i * 0.12, s * 0.9);
  c.restore();
};

/** THE GRIZZLY'S MAULING (the standard death's close-up), k 0..1: its shadow over him and the great jaws coming in (to
 *  0.14); the jaws clamped over his crown, the teeth sunk in, blood bursting out round them (to 0.32); a paw raking down
 *  across his face, three gashes torn (to 0.5); shaken like a rag, bits of him flying (his cap, his near lens, a half of
 *  his mustache, teeth) (to 0.72); the other paw across the other way and the jaws tearing off up out of the frame with
 *  a mouthful of him, the blood pumping out after (to 1). */
registerWoundPainter('maul', (c, k, frame) => {
  const K1 = 0.14, K2 = 0.32, K3 = 0.5, K4 = 0.72;
  // ---- its shadow first, over his face, darkening
  if (k < K2) { c.globalAlpha = 0.45 * clamp01(k / K1); c.fillStyle = '#000000'; c.fillRect(-60, -60, 120, 120); c.globalAlpha = 1; }
  // ---- the gashes (from K3 on: torn, staying), the second set (from K4)
  if (k >= K2 + 0.04) gashes(c, -8, -12, 1.15, 22, clamp01((k - K2 - 0.04) / (K3 - K2 - 0.04)));
  if (k >= K4) gashes(c, 12, -10, 2.0, 20, clamp01((k - K4) / 0.12), 3);
  // ---- the jaws: in from the top left, clamping down over his crown; shaking; off up and out with a mouthful
  if (k < 0.95) {
    const come = clamp01(k / K1), off = k > 0.86 ? ((k - 0.86) / 0.09) ** 2 : 0;
    const shake = k > K3 && k < K4 ? Math.sin(frame * 1.3) * 5 : 0;
    const jx = -6 + (1 - come) * -50 + shake - off * 30, jy = -18 + (1 - come) * -40 - off * 70;
    c.save(); c.translate(jx, jy); c.rotate(0.35 + (1 - come) * -0.4 + shake * 0.02); c.scale(1.6, 1.6);
    const open = k < K1 ? 0.9 : k < K2 ? 0.9 - (k - K1) / (K2 - K1) * 0.55 : k > 0.86 ? 0.5 : 0.35;
    bearHead(c, open, frame, k > K1 ? 1 : 0);
    // (a mouthful of him, coming off with it: the cap and scalp, the near ear)
    if (k > 0.86) { ell(c, 16, 9, 6, 3, '#283662'); px(c, 11, 7, 10, 1.4, '#CC9E2C'); ell(c, 15, 12, 4, 2, '#E0A280'); ell(c, 14, 13, 3, 1.4, BLOOD[2]); }
    c.restore();
  }
  // ---- the teeth sunk in: blood welling round them, bursting out
  if (k >= K1) burst(c, -2, -14, clamp01((k - K1) / 0.2), 26, 11, 1.4, 34);
  // ---- the paws: one raking down (K2..K3), the other across (K4..0.86)
  if (k >= K2 - 0.02 && k < K3 + 0.04) { const q = clamp01((k - K2 + 0.02) / (K3 - K2 + 0.02)); paw(c, -26 + q * 22, -40 + q * 46, 1.15, 1.2, GRIZ); }
  if (k >= K4 - 0.02 && k < 0.88) { const q = clamp01((k - K4 + 0.02) / 0.16); paw(c, 40 - q * 34, -30 + q * 30, 2.4, 1.2, GRIZ); }
  // ---- shaken: bits of him flying off (the cap spinning away, the near lens, half his mustache, two teeth)
  if (k >= K3 && k < 0.95) {
    const q = clamp01((k - K3) / 0.4);
    c.save(); c.translate(-10 - 50 * q, -20 - 40 * q + 70 * q * q); c.rotate(q * 10); ell(c, 0, 0, 8, 3.6, '#283662'); px(c, -7, -1, 14, 2, '#CC9E2C'); ell(c, 4, 2, 5, 1.4, '#1A1A20'); c.restore();
    c.save(); c.translate(14 + 40 * q, -6 - 30 * q + 60 * q * q); c.rotate(-q * 12); c.strokeStyle = '#5E4A1C'; c.lineWidth = 0.9; c.beginPath(); c.ellipse(0, 0, 2.6, 2.4, 0, 0, Math.PI * 2); c.stroke(); c.restore();
    c.save(); c.translate(6 + 30 * q, 6 - 20 * q + 50 * q * q); c.rotate(q * 8); c.fillStyle = '#B4642E'; c.beginPath(); c.moveTo(-5, 0); c.quadraticCurveTo(0, -2, 5, 0); c.quadraticCurveTo(0, 1.6, -5, 0); c.fill(); c.restore();
    for (let i = 0; i < 2; i++) { c.save(); c.translate(4 - i * 6 + (i ? -24 : 20) * q, 8 - 26 * q + 60 * q * q); c.rotate(q * 9 + i); px(c, -0.8, -1, 1.6, 2, TOOTH); c.restore(); }
    burst(c, 2, -6, (q * 2.2) % 1, 30, 40, 1.6, 40);
  }
  // ---- after: the blood pumping out of it all, a beat at a time
  if (k >= 0.86) { const beat = (frame % 24) / 24; if (beat < 0.6) burst(c, 0, -14, beat / 0.6, 16, 70, 0.7, 26); }
  // ---- the hits: a white flash as the jaws close, a red one at each rake
  if (k >= K1 && k < K1 + 0.012) { c.globalAlpha = 0.7; c.fillStyle = '#FFFFFF'; c.fillRect(-80, -80, 160, 160); c.globalAlpha = 1; }
  if ((k >= K2 && k < K2 + 0.01) || (k >= K4 && k < K4 + 0.01)) { c.globalAlpha = 0.4; c.fillStyle = '#DC2626'; c.fillRect(-80, -80, 160, 160); c.globalAlpha = 1; }
});

/** THE LIONS (the weakness kill's close-up, played slowed), k 0..1: two of them in on him, one either side: the near one
 *  in from the right, its jaws on his throat (to 0.25), the far one's claws hooked into his split crown from the left
 *  (to 0.4); they pull: blood sheets out between them in slow arcs, his throat torn (to 0.7); the near one wrenches
 *  away with a mouthful, the far one rakes down his face (to 0.9); the blood fountaining after. */
registerWoundPainter('lions', (c, k, frame) => {
  // ---- the far one: its paw in over his crown from the left, claws sunk in the split, raking down
  if (k >= 0.12) {
    const q = clamp01((k - 0.12) / 0.2), down = k > 0.7 ? clamp01((k - 0.7) / 0.2) : 0;
    paw(c, -40 + q * 26, -34 + q * 14 + down * 22, 0.7 + down * 0.4, 1, PUMA);
    if (q >= 1) burst(c, -6, -18 + down * 22, (frame * 0.02) % 1, 14, 21, 1.2, 22);
  }
  if (k >= 0.7) gashes(c, -8, -14, 1.3, 26, clamp01((k - 0.7) / 0.2), 3);
  // ---- the near one: its head in from the right, jaws open, clamping on his throat; tugging; off with a mouthful
  {
    const come = clamp01(k / 0.22), pull = k > 0.4 && k < 0.7 ? Math.sin((k - 0.4) * 40) * 2.4 : 0, off = k > 0.7 ? clamp01((k - 0.7) / 0.18) : 0;
    const hx = 22 + (1 - come) * 50 + pull + off * 50, hy = 12 - off * 10;
    c.save(); c.translate(hx, hy); c.scale(-1.7, 1.7); c.rotate(-0.25);
    lionHead(c, k < 0.22 ? 1 : k > 0.7 ? 0.7 : 0.3, frame, k > 0.22 ? 1 : 0);
    if (off > 0) { ell(c, 12, 3, 4, 2.4, '#E0A280'); ell(c, 12, 3, 2.6, 1.6, BLOOD[2]); px(c, 10, 1, 2, 1, '#F5F0E6'); }
    c.restore();
  }
  // ---- the throat: the teeth sunk in (blood welling), then torn open, sheeting out between them in slow arcs
  if (k >= 0.22) burst(c, 8, 12, clamp01((k - 0.22) / 0.3), 24, 31, 1.3, 30);
  if (k >= 0.4) {
    const q = clamp01((k - 0.4) / 0.3);
    ell(c, 6, 13, 6 * q, 2.6 * q, '#3A0606'); ell(c, 6, 13, 5 * q, 1.8 * q, BLOOD[2]);
    for (let i = 0; i < 5; i++) { const a = -0.3 + i * 0.25, L = 14 + i * 4; line(c, [6, 13, 6 + Math.cos(a) * L * q, 13 + Math.sin(a) * L * q + 10 * q * q], 1.4, BLOOD[i % 2 ? 1 : 2]); }
  }
  // ---- after: the blood fountaining out of him, a beat at a time (slowed with the rest)
  if (k >= 0.86) { const beat = (frame % 36) / 36; if (beat < 0.7) burst(c, 4, 6, beat / 0.7, 18, 90, 1, 30); }
  // ---- the hits: the bite (white), the tear (red)
  if (k >= 0.22 && k < 0.235) { c.globalAlpha = 0.6; c.fillStyle = '#FFFFFF'; c.fillRect(-80, -80, 160, 160); c.globalAlpha = 1; }
  if (k >= 0.7 && k < 0.715) { c.globalAlpha = 0.4; c.fillStyle = '#DC2626'; c.fillRect(-80, -80, 160, 160); c.globalAlpha = 1; }
});
