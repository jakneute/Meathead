// SAFARI ARTIE, drawn: the Jungle Cruise skipper (and, later, the boss). Drawn at Meathead 1's boss grade, not an NPC's:
// color ramps (light, base, shade, deep, line) in stepped bands with a dithered seam between them, every material its
// own darkest tone for an outline (no ink). Lanky, buck teeth, a beak of a sunburned nose peeling at the tip, jug ears,
// a mullet out the back of a cracked (taped) plastic pith helmet, a scrap of mustache; the cheapest safari suit the park
// could buy: a khaki short-sleeve shirt a size too big, sweated through at the pits and down the chest, epaulettes,
// pockets, a HELLO name tag and a whistle on a lanyard, bloused over a belt with his radio, his knife and a canteen on it;
// baggy cargo shorts, knobby sunburned knees, tube socks to the knee, hiking boots; the blowgun slung across his back.
// He never shuts up: a mouth that talks (its shapes picked off the frame count), brows going with it.
//
// Shared: the river (his boat), the mine cart (he's after him), the roof and the clearing (the boss) all draw him.
//
// drawSafariArtie(c, x, feetY, facing, frame, pose, damage): world (or screen) point of his feet, facing 1 right /
// -1 left; `damage` 0 (fresh) .. 1 (nearly dead) beats him up the way Meathead 1's bosses get it as they lose health:
// dirt and scuffs, then cuts and a nosebleed, blood on the shirt, the shirt torn, a split brow and a black eye, a buck
// tooth out, a sleeve gone and a chunk out of the helmet, a scalp gash running down his face, the seat of his shorts
// ripped (heart boxers), a sock down, blood dripping off him.

import { type Ctx } from '../../cast/kit';
import { smear, drip, cut, bloodFresh, bloodDark } from '../../../m1/game/render/player/gore';

export type ArtiePose =
  | 'stand'   // standing about
  | 'talk'    // going on (he always is): mouth going, a hand waving about
  | 'radio'   // on the radio to maintenance, the handset up at his face
  | 'angry'   // displeased: fists down, eyebrows in
  | 'point'   // pointing out at something (the "wildlife")
  | 'sit'     // at the boat's wheel / in a cart: from the waist up, the legs hidden
  | 'duck'    // down in his cart under a beam: hunched right down, knees up, both hands holding his helmet on, panicking;
              // nothing of him lower than his feet point, his helmet top about 72 above it (no offset needed by the caller)
  | 'run'     // running (the clearing, the roof)
  | 'hurt'    // hit (the boss)
  // (his fight, in the clearing)
  | 'dive'    // diving (into a bush, between bushes): arms out ahead, legs straight (the caller tilts him)
  | 'grab'    // got hold of somebody with one hand, stabbing with the knife in the other
  | 'blowgun' // the blowgun up at his lips, cheeks puffed
  | 'whistle' // two fingers in his mouth: the mating whistle
  | 'stunned' // knocked on his backside, legs out, head lolling
  | 'dodge'   // hanging off a vine overhead by both hands, knees tucked up (the caller draws the vine)
  | 'agitated' // things all over him: flailing, slapping at himself
  // (his standard death: gored by his own rhino. Both folded backward at the waist, the wrong way, his back on the
  // inside of the fold: the caller puts his hip (29 up off his feet) on the horn and turns him)
  | 'skewered' // on the horn, carried: screaming, legs kicking, arms flailing
  | 'broken';  // against the wall after: folded right over the horn, a knee bent the wrong way, an arm too, dead

// ---------------------------------------------------------------------------------------------------------------
// Ramps: light, base, shade, deep, line

type Ramp = readonly [string, string, string, string, string];
const SKIN: Ramp = ['#FCE2C8', '#F0C29C', '#D89C76', '#B47454', '#6E3C26'];
/** His forearms, knees and the back of his neck: cooked. */
const BURNT: Ramp = ['#F8C4A4', '#EAA080', '#D47A60', '#B05A46', '#6E3022'];
/** Upper arms, out of the sun under the sleeves all summer: a farmer's tan. */
const PALE: Ramp = ['#FFF4E8', '#FBE4D0', '#E8C4A8', '#CCA084', '#7A5040'];
const KHAKI: Ramp = ['#E4D49E', '#CAB47C', '#A99058', '#80693E', '#4A3C20'];
const SHORTS: Ramp = ['#B4A06A', '#968252', '#78663C', '#5A4A2C', '#33291A'];
const HELMET: Ramp = ['#FCF6E2', '#E8DCB2', '#CDBC8A', '#A8956A', '#5E5236'];
const BAND: Ramp = ['#A06A3C', '#7C4E2A', '#5E381E', '#452814', '#26160A'];
const SOCK: Ramp = ['#FFFFFF', '#F2F0E6', '#D2CFBE', '#ABA896', '#5E5C50'];
const BOOT: Ramp = ['#A07048', '#7C5432', '#5E3E24', '#432C18', '#22150B'];
const HAIR: Ramp = ['#A88458', '#86643E', '#664A2C', '#4A341E', '#2A1C10'];
const LEATHER: Ramp = ['#9A6438', '#784C2A', '#5A381E', '#402614', '#22140A'];
const PLASTIC: Ramp = ['#52525B', '#3F3F46', '#2A2A30', '#1C1C21', '#09090B'];
const CANE: Ramp = ['#D8C080', '#B89A58', '#957840', '#6E5630', '#3E2E16'];
const STEEL: Ramp = ['#FFFFFF', '#E4E4E7', '#A1A1AA', '#71717A', '#3F3F46'];
const BROW = '#5A3E24';
const DIRT = 'rgba(92, 64, 34, 0.38)';

// ---------------------------------------------------------------------------------------------------------------
// Painting helpers

/** A 2x2 checker of a color (the dither between two bands of a ramp), made the once per color. */
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

/**
 * A shape in its ramp: the base, a lit band down its left, a shade band then a deep one down its right (stepped, a
 * dithered seam between each), outlined in its line tone. `x0..x1` is how far across it goes.
 */
const shape = (c: Ctx, path: () => void, r: Ramp, x0: number, x1: number, lw = 1) => {
  c.beginPath(); path(); c.fillStyle = r[1]; c.fill();
  c.save(); c.clip();
  const w = x1 - x0;
  c.fillStyle = r[0]; c.fillRect(x0 - 4, -999, w * 0.16 + 4, 1998);
  c.fillStyle = dith(c, r[0]); c.fillRect(x0 + w * 0.16, -999, Math.max(1, w * 0.06), 1998);
  c.fillStyle = dith(c, r[2]); c.fillRect(x0 + w * 0.57, -999, Math.max(1, w * 0.07), 1998);
  c.fillStyle = r[2]; c.fillRect(x0 + w * 0.64, -999, w + 4, 1998);
  c.fillStyle = dith(c, r[3]); c.fillRect(x0 + w * 0.8, -999, Math.max(1, w * 0.06), 1998);
  c.fillStyle = r[3]; c.fillRect(x0 + w * 0.86, -999, w + 4, 1998);
  c.restore();
  c.beginPath(); path(); c.strokeStyle = r[4]; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke();
};

const fill = (c: Ctx, color: string | CanvasPattern, path: () => void) => { c.fillStyle = color; c.beginPath(); path(); c.fill(); };
const ell = (c: Ctx, x: number, y: number, rx: number, ry: number, color: string | CanvasPattern, rot = 0) => fill(c, color, () => c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2));
const px = (c: Ctx, x: number, y: number, w: number, h: number, color: string | CanvasPattern) => { c.fillStyle = color; c.fillRect(x, y, w, h); };
const line = (c: Ctx, pts: number[], w: number, color: string, cap: CanvasLineCap = 'round') => {
  c.strokeStyle = color; c.lineWidth = w; c.lineCap = cap; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.stroke();
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** The joint of a two-part limb by its ends, bent toward `bend` (+1 to the right of the way it points... see M1's). */
const joint = (x1: number, y1: number, x2: number, y2: number, l1: number, l2: number, bend: number): [number, number] => {
  const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 0.001;
  const dd = Math.min(d, l1 + l2 - 0.01);
  const a = (l1 * l1 - l2 * l2 + dd * dd) / (2 * dd), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const ux = dx / d, uy = dy / d;
  return [x1 + ux * a + uy * h * bend, y1 + uy * a - ux * h * bend];
};

/**
 * A run of tube (an arm, a leg) through `pts`, each segment its own width and ramp: all the outlines first, then the
 * fills over them (so the joins don't show), each with a lit stripe up one side and a shade down the other.
 */
const tube = (c: Ctx, pts: number[], ws: number[], rs: Ramp[]) => {
  const n = pts.length / 2 - 1;
  c.lineCap = 'round'; c.lineJoin = 'round';
  for (let i = 0; i < n; i++) line(c, [pts[i * 2], pts[i * 2 + 1], pts[i * 2 + 2], pts[i * 2 + 3]], ws[i] + 2, rs[i][4]);
  for (let i = 0; i < n; i++) {
    const x1 = pts[i * 2], y1 = pts[i * 2 + 1], x2 = pts[i * 2 + 2], y2 = pts[i * 2 + 3], w = ws[i], r = rs[i];
    line(c, [x1, y1, x2, y2], w, r[1]);
    // (the shade on the side away from the light, up and left)
    let nx = -(y2 - y1), ny = x2 - x1; const len = Math.hypot(nx, ny) || 1; nx /= len; ny /= len;
    if (nx + ny * 0.6 < 0) { nx = -nx; ny = -ny; }
    const sh = w * 0.3, hl = w * 0.32;
    line(c, [x1 + nx * sh, y1 + ny * sh, x2 + nx * sh, y2 + ny * sh], w * 0.36, r[2]);
    line(c, [x1 - nx * hl, y1 - ny * hl, x2 - nx * hl, y2 - ny * hl], Math.max(0.6, w * 0.16), r[0]);
  }
};
/** A ramp a step darker (the far arm, the far leg). */
const back = (r: Ramp): Ramp => [r[1], r[2], r[3], r[3], r[4]];

// ---------------------------------------------------------------------------------------------------------------
// Him

/** His head's size (it's drawn in a unit space about 21 across and 28 tall, like Meathead 1's bosses', then scaled). */
const HS = 1.08;

/** Gored: how far his top half's folded back over at the hip (radians, backward), on the horn and after the wall. */
const FOLD: Partial<Record<ArtiePose, number>> = { skewered: -1.85, broken: -2.5 };
/** Gored: which way's down for his arms, in his folded top half's own space (it's the caller's turn of him, undone). */
const ARM_DOWN: Partial<Record<ArtiePose, [number, number]>> = { skewered: [-0.84, -0.55], broken: [-0.1, -1] };

export const drawSafariArtie = (c: Ctx, x: number, feetY: number, facing: number, frame: number, pose: ArtiePose = 'stand', damage = 0) => {
  const f = frame;
  // (gored: upside down, near enough, so nothing of the beating that runs down him (it would run up): the drops off him)
  const d = Math.max(0, Math.min(FOLD[pose] ? 0.74 : 1, damage));
  c.save();
  c.translate(Math.round(x), Math.round(feetY));
  c.scale(facing < 0 ? -1 : 1, 1);
  // (gored: folded back over at the hip, the wrong way: everything from the belt up turned round it)
  const fold = FOLD[pose] ?? 0;
  const bend = () => { if (fold) { c.translate(0, -29); c.rotate(fold); c.translate(0, 29); } };
  // (sat down hard: all of him lower, his legs out in front)
  if (pose === 'stunned') c.translate(0, 18);
  // (hanging off the vine: all of him up a bit, so his hands get up to it)
  if (pose === 'dodge') c.translate(0, -6);
  // (ducking in his cart: all of him down low, folded up)
  if (pose === 'duck') c.translate(0, 18);
  const b = pose === 'run' ? Math.abs(Math.sin(f * 0.35)) * -2 : pose === 'agitated' ? Math.abs(Math.sin(f * 0.6)) * -3 : Math.sin(f * 0.05 + 4) * 0.7;
  // ---- the blowgun slung across his back (behind all of him), the canteen at his hip
  if (pose !== 'blowgun') {
    c.save(); c.translate(0, b); bend();
    line(c, [-13, -24, 9, -70], 4.4, CANE[4]); line(c, [-13, -24, 9, -70], 2.6, CANE[1]); line(c, [-12.6, -25, 8.6, -69.6], 0.8, CANE[0]);
    for (let k = 0.15; k < 1; k += 0.22) px(c, lerp(-13, 9, k) - 1, lerp(-24, -70, k) - 0.5, 2.4, 1, CANE[3]);
    // (the canteen: a dented tin, a canvas cover, the cap on a chain)
    shape(c, () => c.ellipse(-12.5, -26, 4, 4.6, 0, 0, Math.PI * 2), ['#8A9A5B', '#6B7A44', '#525E32', '#3C4524', '#1F2512'], -16.5, -8.5, 0.9);
    px(c, -13.5, -31.6, 2, 1.6, STEEL[2]); line(c, [-12.5, -31.5, -10.5, -29], 0.5, STEEL[3]);
    c.restore();
  }
  // ---- the legs
  if (pose !== 'sit') drawLegs(c, pose, f, d);
  c.translate(0, b);
  bend();
  // ---- the shirt, the belt and what's on it
  drawShirt(c, pose, f, d);
  // ---- the arms (the far one first), the neck, the head, what's in his hands
  const hy = pose === 'duck' ? -63.5 : pose === 'hurt' ? -66 : pose === 'stunned' ? -66 + Math.sin(f * 0.12) * 1.5 : -68;
  // (arms straight up over him: his head ducked back out of the way of the near one, which goes on over it)
  const reach = pose === 'dodge' || pose === 'dive';
  const hx = pose === 'stunned' ? Math.sin(f * 0.12) * 2.5 : reach ? -5 : 0.5;
  const [far, near] = armsFor(pose, f, hx, hy);
  // (arms up over his head go behind it, their hands back on over the helmet after; the hand at his face after it)
  const up = pose === 'dive' || pose === 'dodge' || pose === 'hurt' || pose === 'agitated' || pose === 'duck' || !!fold;
  const atFace = pose === 'radio' || pose === 'whistle';
  if (!atFace) drawArm(c, far, false, d, pose, f);
  if (!reach) drawArm(c, near, true, d, pose, f);
  drawNeck(c, hx, hy, pose, f, d);
  // (gored: his head flopping about on the horn; after the wall, lolled right over, the helmet knocked askew)
  const tilt = pose === 'hurt' ? -0.35 : pose === 'stunned' ? 0.5 : pose === 'agitated' ? Math.sin(f * 0.7) * 0.2 : pose === 'broken' ? 0.55 : pose === 'skewered' ? Math.sin(f * 0.5) * 0.15 : 0;
  const nod = pose === 'stunned' ? Math.sin(f * 0.12) * 0.12 : pose === 'hurt' ? -0.12 : pose === 'dive' ? 0.1 : pose === 'dodge' ? -0.1
    : pose === 'skewered' ? -0.3 + Math.sin(f * 0.45) * 0.25 : pose === 'broken' ? -0.45 : 0;
  c.save(); c.translate(hx, hy); c.rotate(nod); c.scale(HS, HS);
  drawHead(c, pose, f, d, tilt);
  c.restore();
  if (up) { hand(c, far, false, pose, f); if (reach) drawArm(c, near, true, d, pose, f); else hand(c, near, true, pose, f); }
  // (the radio, the whistle: brought up across his chest to his mouth by the far hand, over his chin)
  if (atFace) drawArm(c, far, false, d, pose, f);
  if (pose === 'radio') { drawRadio(c, far.hx - 1.6, far.hy - 9, f, true); hand(c, far, false, pose, f); }
  if (pose === 'blowgun') drawBlowgun(c, hx, hy, f);
  if (pose === 'grab') drawKnife(c, far, f, d);
  c.restore();
};

/** What falling through the temple roof did to him: dirt on him, a scuffed helmet, nothing bleeding yet (the clearing
 * starts him at this: the blind, and the fight's floor for his damage). */
export const ROOF_SCUFFS = 0.12;

/** How tall he is (feet to helmet top), for putting words over him. */
export const ARTIE_H = 88;

// ---------------------------------------------------------------------------------------------------------------
// Legs: baggy cargo shorts over knobby sunburned knees, tube socks, hiking boots

const drawLegs = (c: Ctx, pose: ArtiePose, f: number, d: number) => {
  // [hipX, hipY, kneeX, kneeY, ankleX, ankleY, boot angle] for the far leg, then the near one
  let L: number[][];
  if (pose === 'duck') L = [[-2, -27, 11, -37, 7, -26, 0.15], [3, -27, 14, -36, 11, -26, 0.2]];
  else if (pose === 'stunned') L = [[-2, -27, 9, -30, 21, -27, -1.35], [3, -27, 13, -29, 25, -27, -1.45]];
  else if (pose === 'dodge') L = [[-2, -27, 8, -34, 7, -21, 0.15], [3, -27, 11, -33, 11, -20, 0.2]];
  else if (pose === 'run') {
    const k = Math.sin(f * 0.35);
    L = [-1, 1].map(s => {
      const sw = s * k, hx = s * 3, hy = -27;
      const ax = sw * 9, ay = -5 - (sw < 0 ? -sw * 6 : 0);
      const [kx, ky] = joint(hx, hy, ax, ay, 11.6, 11.6, 1);
      return [hx, hy, kx, ky, ax, ay, sw < 0 ? -sw * 0.5 : -sw * 0.15];
    });
  } else if (pose === 'agitated') {
    // (hopping from foot to foot)
    const up = Math.sin(f * 0.6);
    L = [[-3, -27, -4, -16 - Math.max(0, up) * 4, -4.5, -5 - Math.max(0, up) * 6, 0], [3, -27, 4.5, -16 - Math.max(0, -up) * 4, 5, -5 - Math.max(0, -up) * 6, 0]];
  } else if (pose === 'skewered') {
    // (dangling off the horn, the shins swinging back under the knees, kicking: each its own time)
    const k1 = Math.sin(f * 0.8), k2 = Math.sin(f * 0.8 + 1.9);
    L = [[-2, -27, -1 + k1 * 2, -16, -5 + k1 * 5, -5.5 + Math.abs(k1) * 3, 0.5 + k1 * 0.4], [3, -27, 4 + k2 * 2, -16.5, 0 + k2 * 5, -6 + Math.abs(k2) * 3, 0.4 + k2 * 0.4]];
  } else if (pose === 'broken') {
    // (the far leg folded up under him; the near one's knee bent the wrong way, the boot turned in)
    L = [[-2, -27, -9.5, -18.5, -2, -11, 1.1], [3, -27, -1.5, -16, 9.5, -8.5, -0.9]];
  } else if (pose === 'dive') L = [[-2, -27, -1.5, -16, -1, -5, 0.6], [2.5, -27, 3, -16, 3.5, -5, 0.6]];
  else L = [[-3.5, -27, -4, -16, -4.5, -5, 0], [3.5, -27, 4, -16, 4.5, -5, 0]];
  // (the seat of the shorts, between the two)
  const [h0, h1] = [L[0], L[1]];
  shape(c, () => c.roundRect(Math.min(h0[0], h1[0]) - 6, -29, Math.abs(h1[0] - h0[0]) + 12, 7, [1, 1, 3, 3]), SHORTS, Math.min(h0[0], h1[0]) - 6, Math.max(h0[0], h1[0]) + 6);
  for (let i = 0; i < 2; i++) leg(c, L[i], i === 1, d, pose, f);
  // (the seat torn out: heart boxers, showing)
  if (d >= 0.8) {
    const sx = Math.min(h0[0], h1[0]) - 5.5;
    fill(c, SHORTS[4], () => { c.moveTo(sx, -27.5); c.lineTo(sx + 4.5, -28.5); c.lineTo(sx + 5.5, -25.5); c.lineTo(sx + 3, -23); c.lineTo(sx + 0.2, -23.8); c.closePath(); });
    fill(c, '#FBCFE8', () => { c.moveTo(sx + 0.8, -27.2); c.lineTo(sx + 4, -27.9); c.lineTo(sx + 4.8, -25.6); c.lineTo(sx + 2.8, -23.8); c.lineTo(sx + 0.9, -24.4); c.closePath(); });
    px(c, sx + 1.6, -26.6, 1, 0.8, '#DC2626'); px(c, sx + 3, -25, 1, 0.8, '#DC2626');
  }
};

const leg = (c: Ctx, P: number[], near: boolean, d: number, pose: ArtiePose, f: number) => {
  const [hx, hy, kx, ky, ax, ay, rot] = P;
  const skin = near ? BURNT : back(BURNT), shorts = near ? SHORTS : back(SHORTS), sock = near ? SOCK : back(SOCK);
  const sockDown = near && d >= 0.7;
  // (where the shorts end: most of the way down the thigh, baggy; where the sock starts: just under the knee)
  const hemX = lerp(hx, kx, 0.78), hemY = lerp(hy, ky, 0.78);
  const sockX = lerp(kx, ax, sockDown ? 0.78 : 0.2), sockY = lerp(ky, ay, sockDown ? 0.78 : 0.2);
  tube(c, [hx, hy, kx, ky, ax, ay], [5.2, 4.6], [skin, sockDown ? (near ? PALE : back(PALE)) : skin]);
  // (the knee: a knob, burnt red on top)
  ell(c, kx + 0.6, ky - 0.2, 2.6, 2.2, skin[1]); ell(c, kx + 0.2, ky - 0.8, 1.4, 1, skin[0]);
  // (the sock, its stripes; down round his ankle in a heap when it's had it)
  tube(c, [sockX, sockY, ax, ay], [5.4], [sock]);
  if (sockDown) { ell(c, ax, ay - 1, 3.8, 2.2, sock[2]); ell(c, ax - 0.4, ay - 1.6, 3, 1.4, sock[1]); px(c, ax - 2.4, ay - 2, 4, 0.7, '#B91C1C'); }
  else {
    const t = 0.12, u = 0.22;
    const s1x = lerp(sockX, ax, t), s1y = lerp(sockY, ay, t), s2x = lerp(sockX, ax, u), s2y = lerp(sockY, ay, u);
    line(c, [s1x - 2.6, s1y, s1x + 2.6, s1y], 1, '#DC2626', 'butt');
    line(c, [s2x - 2.6, s2y, s2x + 2.6, s2y], 1, '#15803D', 'butt');
  }
  // (shins: hair)
  if (!sockDown) for (let i = 0; i < 3; i++) { const k = 0.2 + i * 0.25; const lx = lerp(kx, sockX, k), ly = lerp(ky, sockY, k); px(c, lx + (i % 2 ? 1 : -1.2), ly, 0.5, 1.2, HAIR[3]); }
  // (the shorts leg: baggy, a cargo pocket down the outside, a turned-up cuff)
  tube(c, [hx, hy, hemX, hemY], [8.4], [shorts]);
  line(c, [hemX - 4, hemY + 0.4, hemX + 4, hemY + 0.4], 1.3, shorts[3], 'butt');
  if (near) {
    const mx = lerp(hx, hemX, 0.55), my = lerp(hy, hemY, 0.55);
    shape(c, () => c.roundRect(mx - 0.5, my - 3, 4.6, 5.4, 0.8), shorts, mx - 0.5, mx + 4.1, 0.7);
    px(c, mx - 0.6, my - 3.4, 4.8, 1.4, shorts[2]);
  }
  // (scuffed knees, a gash down the shin bleeding into the sock, a hole in the shorts)
  if (d >= 0.1) ell(c, kx + 1, ky + 1, 2.4, 1.8, DIRT);
  if (d >= 0.25) { px(c, kx - 0.5, ky - 0.6, 0.8, 0.8, bloodFresh); px(c, kx + 1.2, ky + 0.4, 0.8, 0.8, bloodFresh); px(c, kx + 0.3, ky + 1.2, 0.7, 0.7, bloodDark); }
  if (near && d >= 0.55) {
    const gx = lerp(kx, ax, 0.3), gy = lerp(ky, ay, 0.3);
    cut(c, gx - 0.5, gy - 1.5, gx + 1.2, gy + 1.5);
    if (!sockDown) { px(c, lerp(kx, ax, 0.42) - 2, lerp(ky, ay, 0.42), 4, 1.6, 'rgba(185, 28, 28, 0.75)'); }
  }
  if (near && d >= 0.8) {
    const tx = lerp(hx, hemX, 0.4), ty = lerp(hy, hemY, 0.4);
    fill(c, SHORTS[4], () => { c.moveTo(tx - 2.5, ty - 2); c.lineTo(tx + 1, ty - 2.8); c.lineTo(tx + 2.8, ty); c.lineTo(tx + 0.5, ty + 2.6); c.lineTo(tx - 2, ty + 1.2); c.closePath(); });
    fill(c, BURNT[1], () => { c.moveTo(tx - 1.8, ty - 1.5); c.lineTo(tx + 0.8, ty - 2); c.lineTo(tx + 2, ty); c.lineTo(tx + 0.4, ty + 1.8); c.lineTo(tx - 1.4, ty + 0.8); c.closePath(); });
    cut(c, tx - 1, ty - 0.5, tx + 1, ty + 0.8);
  }
  boot(c, ax, ay, rot, near, pose === 'run' ? Math.floor(f / 3) : 0);
};

/** A hiking boot, its ankle at (x, y), toe forward, tipped by `rot`. */
const boot = (c: Ctx, x: number, y: number, rot: number, near: boolean, _f: number) => {
  const r = near ? BOOT : back(BOOT);
  c.save(); c.translate(x, y); c.rotate(rot);
  shape(c, () => { c.moveTo(-3.2, -2); c.lineTo(2.6, -2); c.lineTo(3.2, 1); c.quadraticCurveTo(7.6, 1.2, 7.8, 3.6); c.lineTo(7.8, 4.6); c.lineTo(-3.6, 4.6); c.lineTo(-3.6, -1); c.closePath(); }, r, -3.6, 7.8);
  px(c, -3.8, 3.8, 11.8, 1.4, '#1C1209');                                // the lug sole
  for (let i = 0; i < 4; i++) px(c, -3.2 + i * 3, 4.9, 1.6, 0.6, '#3A2A1C');
  for (let i = 0; i < 3; i++) line(c, [0.2 + i * 1.2, -1 + i * 1.1, 2.4 + i * 1.2, -0.2 + i * 1.1], 0.5, '#E7D9B0'); // laces
  px(c, -3.4, -2.6, 6.4, 1.2, r[3]);                                     // the padded collar
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The shirt (a size too big, bloused over the belt), the belt and his gear

const drawShirt = (c: Ctx, pose: ArtiePose, f: number, d: number) => {
  // (the belt under the blousing)
  shape(c, () => c.rect(-10.5, -31.5, 21, 3.4), LEATHER, -10.5, 10.5, 0.8);
  shape(c, () => c.roundRect(-1.4, -31.8, 4.2, 4, 0.6), ['#FDE68A', '#D4A72C', '#A8801C', '#7C5C10', '#4A3608'], -1.4, 2.8, 0.6);
  px(c, 0.3, -30.6, 0.8, 1.8, '#4A3608');
  // (the knife in its sheath down his far hip, its handle up; empty when it's out)
  shape(c, () => { c.moveTo(-12.6, -31); c.lineTo(-8.8, -31); c.lineTo(-9.2, -20); c.lineTo(-11, -18.2); c.lineTo(-12.4, -20); c.closePath(); }, LEATHER, -12.6, -8.8, 0.8);
  line(c, [-12.2, -28.5, -9, -28.5], 0.6, LEATHER[0]);
  if (pose !== 'grab') { shape(c, () => c.roundRect(-12, -36.5, 2.6, 6, 0.8), BAND, -12, -9.4, 0.7); px(c, -12.6, -31.4, 3.8, 1, STEEL[2]); }
  // The shirt
  const hem = (k: number) => [-10.6, -30.6 + k, -7, -30 - k, -3, -30.8 + k, 1, -30.1, 5, -30.9 + k, 8.8, -30.2, 11, -30.8];
  shape(c, () => {
    c.moveTo(-5.5, -57.5); c.lineTo(-9.8, -56.4); c.quadraticCurveTo(-11.8, -55.6, -11.8, -51.5);
    c.lineTo(-11.2, -34); c.quadraticCurveTo(-12, -31, -10.6, -30.6);
    const h = hem(Math.sin(f * 0.05) * 0.3); for (let i = 2; i < h.length; i += 2) c.lineTo(h[i], h[i + 1]);
    c.quadraticCurveTo(12, -31, 11.4, -34); c.lineTo(11.8, -51.5); c.quadraticCurveTo(11.8, -55.6, 9.8, -56.4); c.lineTo(5.5, -57.5); c.closePath();
  }, KHAKI, -12, 12);
  // (the open collar: a V of sunburned chest, chest hair, the lanyard, the whistle)
  fill(c, BURNT[1], () => { c.moveTo(-3, -57.4); c.lineTo(0.6, -50.5); c.lineTo(4.2, -57.4); c.closePath(); });
  px(c, -1, -55.6, 3, 1.4, BURNT[2]);
  for (const [hx, hy] of [[-0.6, -54.6], [1.2, -53.4], [0.2, -52.4], [1.8, -55.4]]) px(c, hx, hy, 0.6, 1, HAIR[3]);
  line(c, [-2.4, -57, -0.4, -47.4], 0.7, '#EA580C'); line(c, [3.6, -57, 1.6, -47.4], 0.7, '#EA580C');
  shape(c, () => c.roundRect(-0.4, -48, 3.4, 2.4, 1), ['#FDBA74', '#F97316', '#C2410C', '#9A3412', '#431407'], -0.4, 3, 0.5);
  // (the collar points)
  shape(c, () => { c.moveTo(-6.5, -58); c.lineTo(-1.2, -50.8); c.lineTo(-3.4, -57.4); c.closePath(); }, KHAKI, -6.5, -1.2, 0.8);
  shape(c, () => { c.moveTo(7.5, -58); c.lineTo(2.2, -50.8); c.lineTo(4.4, -57.4); c.closePath(); }, KHAKI, 2.2, 7.5, 0.8);
  // (the placket, its buttons)
  line(c, [1, -50.5, 1, -31], 0.6, KHAKI[3]); line(c, [1.7, -50.5, 1.7, -31], 0.5, KHAKI[0]);
  for (const y of [-45, -39.5, -34]) { ell(c, 2.2, y, 0.7, 0.7, '#F5F0DC'); px(c, 2, y - 0.2, 0.5, 0.4, KHAKI[3]); }
  // (sweated through: the pits, down the chest, the belly over the belt; stepped, a dithered rim)
  for (const [sx, sy, rx, ry] of [[-10, -49.5, 2.6, 4.6], [10, -49.5, 2.6, 4.6], [0.6, -46, 3.2, 3.8], [-1, -34.5, 4.4, 2]] as const) {
    ell(c, sx, sy, rx + 0.9, ry + 0.9, dith(c, KHAKI[2])); ell(c, sx, sy, rx, ry, KHAKI[2]); ell(c, sx + rx * 0.2, sy + ry * 0.25, rx * 0.55, ry * 0.5, KHAKI[3]);
  }
  // (the pockets: flaps, buttons, the near one with the name tag on it)
  for (const px0 of [-8.8, 3.2]) {
    shape(c, () => c.rect(px0, -49.6, 5.8, 6.4), KHAKI, px0, px0 + 5.8, 0.7);
    shape(c, () => { c.moveTo(px0 - 0.4, -50.6); c.lineTo(px0 + 6.2, -50.6); c.lineTo(px0 + 6.2, -48.2); c.lineTo(px0 + 2.9, -47.2); c.lineTo(px0 - 0.4, -48.2); c.closePath(); }, KHAKI, px0 - 0.4, px0 + 6.2, 0.7);
    ell(c, px0 + 2.9, -48.2, 0.6, 0.6, '#F5F0DC');
  }
  // (a pen in the far pocket, leaking)
  px(c, -7.6, -52.4, 1, 2.4, '#1D4ED8'); ell(c, -7, -46.6, 1.2, 1.5, 'rgba(29, 78, 216, 0.45)');
  // (HELLO my name is ARTIE: red band, white card, his name in marker, on crooked; hanging by a corner once he's beaten)
  c.save(); c.translate(6.2, -53.6); c.rotate(d >= 0.45 ? 0.75 : -0.08);
  px(c, -3.4, -1.8, 6.8, 4.2, '#7F1D1D'); px(c, -3, -1.4, 6, 3.4, '#FFFFFF'); px(c, -3, -1.4, 6, 1.1, '#DC2626');
  for (let i = 0; i < 4; i++) px(c, -2.4 + i * 1.3, 0.4 + (i % 2) * 0.3, 0.9, 1, '#111827');
  c.restore();
  // (the epaulettes, buttoned)
  for (const s of [-1, 1]) { shape(c, () => c.roundRect(s < 0 ? -11.5 : 6, -57, 5.5, 2.2, 0.6), KHAKI, s < 0 ? -11.5 : 6, s < 0 ? -6 : 11.5, 0.7); ell(c, s * 7, -55.9, 0.6, 0.6, '#F5F0DC'); }
  // (the wrinkles: down from the pits, bunched over the belt)
  for (const s of [-1, 1]) { line(c, [s * 9.5, -45.5, s * 6, -40, s * 7, -36], 0.6, KHAKI[2]); line(c, [s * 9.8, -42, s * 8, -38.5], 0.5, KHAKI[2]); }
  for (const x of [-8, -4.6, 4, 7.8]) { line(c, [x, -33.6, x + 0.6, -30.8], 0.7, KHAKI[3]); line(c, [x - 0.9, -33.4, x - 0.5, -31.2], 0.5, KHAKI[0]); }
  // (the radio clipped on his near hip; its clip, empty, when it's up at his face)
  if (pose === 'radio') px(c, 8.6, -33, 2.4, 3.4, PLASTIC[2]);
  else drawRadio(c, 8.2, -35.5, f, false);
  // Beaten: dirt, blood, the shirt torn
  if (d >= 0.1) { ell(c, -6, -38, 3.4, 2.2, DIRT, 0.3); ell(c, 7, -44, 2.4, 1.6, DIRT, -0.2); }
  if (d >= 0.3) ell(c, -3, -52, 2, 1.2, DIRT);
  bodyBlood(c, d, f);
  if (d >= 0.45) {
    // (a slash across the belly: the shirt opened, the skin, a cut in it)
    fill(c, KHAKI[4], () => { c.moveTo(-8, -41.5); c.lineTo(-3, -43.6); c.lineTo(1.8, -41.2); c.lineTo(-1.5, -39.2); c.lineTo(-6.5, -38.8); c.closePath(); });
    fill(c, SKIN[1], () => { c.moveTo(-7.2, -41.2); c.lineTo(-3, -42.9); c.lineTo(1, -41.2); c.lineTo(-1.8, -39.7); c.lineTo(-6.2, -39.4); c.closePath(); });
    cut(c, -6.4, -40.6, 0.2, -41.4); drip(c, -3.5, -40.6, 2 + d * 6);
  }
  if (d >= 0.8) {
    // (the hem ripped: a flap hanging over the belt on the near side)
    shape(c, () => { c.moveTo(5.5, -31); c.lineTo(10.6, -31); c.lineTo(9.6, -25.5); c.lineTo(8, -27.2); c.lineTo(6.6, -24.8); c.closePath(); }, KHAKI, 5.5, 10.6, 0.7);
    smear(c, 8.3, -27.6, 1.8, 1.4, bloodDark);
  }
};

/** Blood soaking the shirt with the damage: the first spots first, so it spreads rather than moving about. */
const SPOTS: [number, number, number][] = [[6, -37, 3.2], [-4.5, -45, 2.6], [-8, -36, 2.4], [3, -53, 1.8], [8, -47, 2.2], [-1, -35, 2.8], [-9.5, -51, 2], [4.5, -42, 2.4]];
const bodyBlood = (c: Ctx, d: number, f: number) => {
  if (d < 0.2) return;
  const n = Math.min(SPOTS.length, Math.ceil(((d - 0.15) / 0.85) * SPOTS.length));
  for (let i = 0; i < n; i++) {
    const [x, y, s] = SPOTS[i];
    smear(c, x, y, s * 1.5, s * 1.05, i % 3 === 2 ? bloodDark : bloodFresh);
    if (i % 2 === 0) drip(c, x + s * 0.2, y + s * 0.3, s * (0.6 + d * 1.6));
  }
  if (d > 0.75) {
    // (drops falling off him)
    const t = (f % 34) / 34;
    ell(c, 6, -34 + t * 30, 0.9, 1.4, bloodFresh);
  }
};

/** His walkie-talkie: on his belt, or in his hand up at his face (the antenna up, its light going, the grille). */
const drawRadio = (c: Ctx, x: number, y: number, f: number, held: boolean) => {
  const h = held ? 11 : 8, w = held ? 5.2 : 4.4;
  line(c, [x + w - 1.2, y, x + w - 1.2, y - (held ? 6 : 4.5)], 1.6, PLASTIC[4]); line(c, [x + w - 1.2, y, x + w - 1.2, y - (held ? 6 : 4.5)], 0.8, PLASTIC[0]);
  shape(c, () => c.roundRect(x, y, w, h, 1), PLASTIC, x, x + w, 0.8);
  for (let i = 0; i < 3; i++) px(c, x + 1, y + h * 0.45 + i * 1.3, w - 2, 0.5, PLASTIC[4]);
  px(c, x + 1, y + 1, w - 2.2, h * 0.25, '#A3B18A');                     // the little screen
  px(c, x + 0.8, y + 0.4, 1.2, 0.8, f % 30 < 15 ? '#22C55E' : '#14532D'); // the light
  if (held && f % 12 < 6) { line(c, [x + w + 1.2, y + 2, x + w + 2.6, y + 1], 0.5, '#E5E7EB'); line(c, [x + w + 1.2, y + 4, x + w + 3, y + 4], 0.5, '#E5E7EB'); } // squawking
};

// ---------------------------------------------------------------------------------------------------------------
// Arms: a khaki short sleeve with a rolled cuff, a pale upper arm, a cooked hairy forearm, a fist

/** His arm bones: the upper arm, the forearm (fixed: an arm's never longer or shorter than it is). */
const UPPER = 12.2, FORE = 11.8, REACH = UPPER + FORE - 0.3;

/** An arm, solved: shoulder, elbow, hand. */
interface Arm { sx: number; sy: number; ex: number; ey: number; hx: number; hy: number }

/**
 * Two-bone IK: the hand as near the target as the shoulder's reach lets it get, the elbow on whichever side of the
 * shoulder-to-hand line goes more the way of `(ux, uy)` (down for a gesture, out for a flung arm, back for a run).
 */
const solve = (sx: number, sy: number, tx: number, ty: number, ux: number, uy: number): Arm => {
  let dx = tx - sx, dy = ty - sy;
  const dist = Math.hypot(dx, dy) || 0.001;
  const k = dist > REACH ? REACH / dist : dist < 5 ? 5 / dist : 1;
  dx *= k; dy *= k;
  const hx = sx + dx, hy = sy + dy, mx = sx + dx / 2, my = sy + dy / 2;
  const a = joint(sx, sy, hx, hy, UPPER, FORE, 1), b = joint(sx, sy, hx, hy, UPPER, FORE, -1);
  const [ex, ey] = (a[0] - mx) * ux + (a[1] - my) * uy >= (b[0] - mx) * ux + (b[1] - my) * uy ? a : b;
  return { sx, sy, ex, ey, hx, hy };
};

/** Smoothly round a loop of keyframes ([x, y] each), `t` counted in keyframes. */
const cycle = (keys: number[][], t: number) => {
  const n = keys.length, i = Math.floor(t), u = t - i, e = u * u * (3 - 2 * u);
  const A = keys[((i % n) + n) % n], B = keys[(((i + 1) % n) + n) % n];
  return [lerp(A[0], B[0], e), lerp(A[1], B[1], e)];
};

/** Each pose's arms, solved: [far, near]. (hx, hy): where his head is (the radio, the whistle, the blowgun go to his mouth). */
const armsFor = (pose: ArtiePose, f: number, hx: number, hy: number): [Arm, Arm] => {
  const hang = pose === 'dodge' || pose === 'dive' || pose === 'duck';
  const SX = hang ? 9.2 : 10.2, SY = hang ? -55 : -53.5;
  const far = (x: number, y: number, ux: number, uy: number) => solve(-SX, SY, x, y, ux, uy);
  const near = (x: number, y: number, ux: number, uy: number) => solve(SX, SY, x, y, ux, uy);
  // (the far hand on his hip, knuckles in, elbow out behind: how he stands about, yapping)
  const hip = () => far(-13.8, -33, -1, -0.15);
  const nearHip = () => near(13.8, -33, 1, -0.15);
  const mouthX = hx + 5.4 * HS, mouthY = hy + 7.6 * HS;
  const sway = Math.sin(f * 0.05) * 0.8;
  switch (pose) {
    case 'talk': {
      // (explaining it: palm up out at you, up for the big point, a shrug, a chop down on the punchline)
      const [x, y] = cycle([[20, -41], [22, -62], [23, -46], [21, -37], [24, -52]], f / 26);
      return [hip(), near(x, y, 0.2, 1)];
    }
    case 'radio': return [far(mouthX + 3, mouthY + 4, 0, 1), nearHip()];
    case 'whistle': return [far(mouthX - 2.6, mouthY + 1.4, 0, 1), nearHip()];
    case 'angry': {
      // (a fist shaking at you, the other balled at his side)
      const j = Math.sin(f * 1.7);
      return [far(-14, -33.5, -1, 0.2), near(22 + j, -66 + Math.abs(j), 0.3, 1)];
    }
    case 'point': {
      // (out straight at it, jabbing)
      const j = Math.max(0, Math.sin(f * 0.22)) * 2;
      return [hip(), near(36 + j, -61, 0, 1)];
    }
    case 'sit': return [far(13, -40, 0, 1), near(19, -42, 0, 1)];
    case 'run': {
      // (pumping: elbows bent back, the hands coming up in front by turns)
      const k = Math.sin(f * 0.35);
      return [far(-6 - k * 7, -38 - Math.max(0, -k) * 4, -1, 0.5), near(7 + k * 7, -38 - Math.max(0, k) * 4, -1, 0.5)];
    }
    case 'dive': return [far(-3, -82, -1, 0), near(6, -82, 1, 0)];
    case 'duck': {
      // (both hands clamped on the helmet's brim, elbows out, trembling)
      const j = Math.sin(f * 1.9) * 0.5;
      return [far(-9 + j, -73, -1, -0.2), near(10 - j, -74, 1, -0.2)];
    }
    case 'dodge': return [far(-4.5, -82, -1, 0), near(4.5, -82, 1, 0)];
    case 'grab': {
      // (a fistful of him held out ahead; the knife going in low, a shank to the gut)
      const k = Math.abs(Math.sin(f * 0.16));
      return [far(2 + k * 14, -40 - k * 4, -0.3, 1), near(28, -52, 0, 1)];
    }
    case 'blowgun': return [far(mouthX + 7, mouthY + 0.6, 0, 1), near(mouthX + 19, mouthY + 0.6, 0, 1)];
    case 'stunned': return [far(-17, -31, -1, -0.2), near(16, -31, 1, -0.2)];
    case 'hurt': return [far(-20, -69, -1, 0.6), near(19, -71, 1, 0.6)];
    case 'skewered': {
      // (hanging down off his shoulders, flailing: grabbing at the air, at the horn, at nothing)
      const [gx, gy] = ARM_DOWN.skewered!, a = Math.sin(f * 0.7) * 7, b = Math.sin(f * 0.7 + 2.4) * 7;
      return [far(-SX + gx * 19 - gy * a, SY + gy * 19 + gx * a, -gy, gx), near(SX + gx * 19 - gy * b, SY + gy * 19 + gx * b, gy, -gx)];
    }
    case 'broken': {
      // (limp, hanging; the near one bent back the wrong way at the elbow)
      const [gx, gy] = ARM_DOWN.broken!;
      return [far(-SX + gx * 24, SY + gy * 24, -1, 0), near(SX + 6, SY - 12, 1, 0.3)];
    }
    case 'agitated': {
      // (slapping at himself, flinging his arms up, slapping again)
      const a = Math.sin(f * 0.45) * 0.5 + 0.5, b = Math.sin(f * 0.45 + 2.2) * 0.5 + 0.5;
      return [far(lerp(-2, -21, a), lerp(-57, -72, a), -1, 0.4), near(lerp(6, 21, b), lerp(-40, -71, b), 1, 0.4)];
    }
    default: return [hip(), near(11.8 + sway * 0.4, -30.5, 1, 0.1)];
  }
};

const drawArm = (c: Ctx, A: Arm, near: boolean, d: number, pose: ArtiePose, f: number) => {
  const { sx, sy, ex, ey, hx, hy } = A;
  const burnt = near ? BURNT : back(BURNT), pale = near ? PALE : back(PALE), khaki = near ? KHAKI : back(KHAKI);
  const torn = near && d >= 0.65;
  tube(c, [sx, sy, ex, ey, hx, hy], [4.8, 4.3], [pale, burnt]);
  // (forearm hair; scratches, a gash)
  for (let i = 0; i < 4; i++) { const k = 0.25 + i * 0.16; px(c, lerp(ex, hx, k) + (i % 2 ? 0.8 : -1), lerp(ey, hy, k) - 0.4, 0.5, 1.1, HAIR[3]); }
  if (d >= 0.3) cut(c, lerp(ex, hx, 0.3) - 1, lerp(ey, hy, 0.3) - 0.8, lerp(ex, hx, 0.55) + 0.6, lerp(ey, hy, 0.55) + 0.8);
  if (near && d >= 0.6) { const gx = lerp(ex, hx, 0.62), gy = lerp(ey, hy, 0.62); smear(c, gx, gy, 2.4, 1.6); drip(c, gx, gy, 3 + d * 3); }
  // (the sleeve: down over most of the upper arm, a rolled cuff; torn off to a ragged stub once he's had it, a gash on the arm under it)
  const k = torn ? 0.38 : 0.78, cx = lerp(sx, ex, k), cy = lerp(sy, ey, k);
  tube(c, [sx, sy, cx, cy], [6], [khaki]);
  const nx = -(ey - sy), ny = ex - sx, nl = Math.hypot(nx, ny) || 1;
  const ox = (nx / nl) * 3.6, oy = (ny / nl) * 3.6;
  if (torn) {
    fill(c, khaki[4], () => { c.moveTo(cx + ox, cy + oy); c.lineTo(cx + (ex - sx) * 0.08, cy + (ey - sy) * 0.08 + 0.5); c.lineTo(cx - ox * 0.2 + (ex - sx) * 0.03, cy - oy * 0.2 + (ey - sy) * 0.03); c.lineTo(cx - ox + (ex - sx) * 0.1, cy - oy + (ey - sy) * 0.1); c.lineTo(cx - ox, cy - oy); c.closePath(); });
    const gx = lerp(cx, ex, 0.5), gy = lerp(cy, ey, 0.5);
    cut(c, gx - 1.4, gy - 0.6, gx + 1.2, gy + 1); drip(c, gx, gy + 0.5, 2.5 + d * 3);
  } else line(c, [cx + ox, cy + oy, cx - ox, cy - oy], 1.8, khaki[2], 'butt');
  line(c, [sx + ox * 0.4, sy + oy * 0.4, lerp(sx, cx, 0.8) + ox * 0.3, lerp(sy, cy, 0.8) + oy * 0.3], 0.5, khaki[3]);
  // (sweat under the arm)
  if (!torn) ell(c, lerp(sx, cx, 0.35) + ox * 0.3, lerp(sy, cy, 0.35) + oy * 0.3, 1.4, 1.4, khaki[2]);
  hand(c, A, near, pose, f);
};

/** A hand: a fist (its knuckles, its thumb), or for the pointing one, a finger out; the whistling one's two fingers. */
const hand = (c: Ctx, A: Arm, near: boolean, pose: ArtiePose, f: number) => {
  const r = near ? BURNT : back(BURNT);
  const x = A.hx, y = A.hy, a = Math.atan2(y - A.ey, x - A.ex);
  c.save(); c.translate(x, y); c.rotate(a);
  shape(c, () => c.ellipse(0.4, 0, 3, 2.6, 0, 0, Math.PI * 2), r, -2.6, 3.4, 0.8);
  if (near && pose === 'point') {
    tube(c, [2.4, -0.6, 7.4, -0.8], [1.8], [r]);
    px(c, 7, -1.4, 0.8, 0.8, '#F5E6D3');
  } else if (!near && pose === 'whistle') {
    tube(c, [2.2, -1, 5.2, -1.4], [1.5], [r]); tube(c, [2.2, 0.8, 5.2, 0.6], [1.5], [r]);
  } else if (near && pose === 'talk') {
    // (an open hand, palm up, fingers going)
    const w = Math.sin(f * 0.3) * 0.6;
    for (let i = 0; i < 3; i++) tube(c, [2.2, -1.2 + i * 1.2, 5 + w * (i - 1) * 0.5, -1.8 + i * 1.4], [1.2], [r]);
  } else {
    for (let i = 0; i < 3; i++) px(c, 2.4, -1.4 + i * 1.1, 0.5, 0.5, r[3]);
    line(c, [-0.6, -2.2, 1.8, -2.4], 0.9, r[2]);
  }
  c.restore();
};

const drawNeck = (c: Ctx, hx: number, hy: number, pose: ArtiePose, f: number, d: number) => {
  tube(c, [0.8, -55, hx + 1, hy + 9], [5.6], [BURNT]);
  // (an Adam's apple, going up and down while he talks)
  const talking = TALKERS.has(pose);
  const bob = talking ? Math.abs(Math.sin(f * 0.45)) * 1.2 : 0;
  ell(c, hx + 3.6, hy + 11.4 - bob, 1.3, 1.6, BURNT[1]); px(c, hx + 4.2, hy + 10.8 - bob, 0.6, 1.4, BURNT[2]);
  if (d >= 0.5) drip(c, hx + 2, hy + 9, 4);
};

// ---------------------------------------------------------------------------------------------------------------
// Held things

const drawKnife = (c: Ctx, A: Arm, f: number, d: number) => {
  // (held point forward, tipped up a touch as it goes in)
  const k = Math.abs(Math.sin(f * 0.16));
  const ang = -0.35 + k * 0.25, len = 11;
  c.save(); c.translate(A.hx, A.hy); c.rotate(ang);
  shape(c, () => { c.moveTo(1.5, -1.4); c.lineTo(len - 2.5, -1.4); c.lineTo(len, 0.2); c.lineTo(len - 3, 1.2); c.lineTo(1.5, 1.2); c.closePath(); }, STEEL, 1.5, len, 0.7);
  line(c, [2.5, -0.9, len - 3, -0.9], 0.5, '#FFFFFF');
  // (blood up the blade: somebody's)
  fill(c, bloodFresh, () => { c.moveTo(len - 6, -1.4); c.lineTo(len - 2.5, -1.4); c.lineTo(len, 0.2); c.lineTo(len - 3, 1.2); c.lineTo(len - 7, 1.2); c.closePath(); });
  if (d >= 0.5) px(c, len - 9, -1.2, 2, 1, bloodDark);
  shape(c, () => c.rect(0.6, -2.4, 1.4, 4.8), STEEL, 0.6, 2, 0.5);     // the guard
  shape(c, () => c.roundRect(-5, -1.4, 5.8, 2.8, 0.8), BAND, -5, 0.8, 0.6);
  c.restore();
};

const drawBlowgun = (c: Ctx, hx: number, hy: number, _f: number) => {
  // (from his lips out ahead: cane, its joints banded, a mouthpiece)
  const y = hy + 7.6 * HS, x0 = hx + 5.4 * HS;
  shape(c, () => c.rect(x0, y - 1.7, 42, 3.4), CANE, x0, x0 + 42, 0.8);
  line(c, [x0 + 1, y - 0.8, x0 + 41, y - 0.8], 0.6, CANE[0]);
  for (let i = 1; i < 5; i++) px(c, x0 + i * 9, y - 1.8, 1.2, 3.6, CANE[3]);
  shape(c, () => c.rect(x0 - 0.8, y - 2.1, 3, 4.2), BAND, x0 - 0.8, x0 + 2.2, 0.6);
  // (the hands round it, on top)
  for (const hx2 of [x0 + 7, x0 + 19]) shape(c, () => c.ellipse(hx2, y + 0.6, 2.8, 2.4, 0, 0, Math.PI * 2), BURNT, hx2 - 2.8, hx2 + 2.8, 0.8);
};

// ---------------------------------------------------------------------------------------------------------------
// The head, in its unit space: (0,0) its middle, the face turned toward +x

/** The poses he's yapping in (the mouth runs). */
const TALKERS = new Set<ArtiePose>(['talk', 'radio', 'angry', 'point', 'agitated', 'grab']);

type Face = 'smug' | 'chat' | 'angry' | 'grit' | 'manic' | 'yelp' | 'dazed' | 'panic' | 'aim' | 'whistle' | 'dead';
const faceOf = (pose: ArtiePose, d: number): Face => {
  switch (pose) {
    case 'skewered': return 'yelp';
    case 'broken': return 'dead';
    case 'talk': case 'radio': case 'point': return 'chat';
    case 'angry': return 'angry';
    case 'run': case 'dive': return 'grit';
    case 'grab': return 'manic';
    case 'hurt': return 'yelp';
    case 'stunned': return 'dazed';
    case 'agitated': case 'dodge': case 'duck': return 'panic';
    case 'blowgun': return 'aim';
    case 'whistle': return 'whistle';
    default: return d > 0.62 ? 'grit' : 'smug';
  }
};

const EYE_Y = -2.6, FAR_EYE = -4.4, NEAR_EYE = 4.2, MX = 2, MY = 7.2;

/** His mouth's shape this frame while he's yapping: how open, how wide (a run of shapes off the frame count, like speech). */
const viseme = (f: number) => {
  const seq = [[0.15, 0.5], [0.85, 0.3], [0.45, 1], [0, 0.4], [0.7, 0.6], [0.3, 0.1], [1, 0.5], [0.1, 0.9], [0.55, 0.2], [0.9, 0.8], [0.2, 0.3], [0.6, 1]];
  const i = Math.floor(f / 4), s = seq[(i * 7 + (i >> 3)) % seq.length];
  return { o: s[0], w: s[1] };
};

const drawHead = (c: Ctx, pose: ArtiePose, f: number, d: number, tilt: number) => {
  const face = faceOf(pose, d);
  const talk = TALKERS.has(pose);
  const v = talk ? viseme(f) : { o: 0, w: 0 };
  const puffed = face === 'aim' || face === 'whistle';
  // ---- the mullet, out the back under the helmet
  shape(c, () => { c.moveTo(-7.5, -10); c.lineTo(-11, -8); c.lineTo(-12.6, -2); c.lineTo(-13.4, 4); c.lineTo(-12.2, 9.5); c.lineTo(-11, 6.5); c.lineTo(-10, 10.5); c.lineTo(-8.6, 5); c.lineTo(-7.6, 7.5); c.lineTo(-7, 0); c.closePath(); }, HAIR, -13.4, -7, 0.8);
  line(c, [-11.4, -4, -12, 3], 0.5, HAIR[0]);
  // ---- the skull: a long face, a long chin
  const skull = () => {
    c.moveTo(-10, -6); c.quadraticCurveTo(-11, -14.5, -1, -14.5); c.quadraticCurveTo(9.6, -14.5, 10.2, -5);
    c.lineTo(10.4, 2); c.quadraticCurveTo(10.2, 8.5, 8, 12); c.quadraticCurveTo(5.6, 15.2, 1.2, 14.6);
    c.quadraticCurveTo(-5.8, 13.4, -8.8, 7); c.quadraticCurveTo(-10.6, 2, -10, -6); c.closePath();
  };
  c.beginPath(); skull(); c.fillStyle = SKIN[1]; c.fill();
  c.save(); c.clip();
  // (the back of his head in shade, stepped; under the jaw; the shadow of the brim across his forehead)
  px(c, -12, -20, 4.6, 40, SKIN[2]); px(c, -7.4, -20, 1, 40, dith(c, SKIN[2])); px(c, -12, -20, 2.2, 40, SKIN[3]);
  ell(c, 1, 15, 9, 4, SKIN[2]); ell(c, 1, 16.4, 8, 3, SKIN[3]);
  px(c, -12, -9.5, 24, 3, SKIN[2]); px(c, -12, -6.5, 24, 1, dith(c, SKIN[2]));
  // (the sunburn: cheek, the band of forehead the brim misses, the top of the ear side)
  ell(c, 6.2, 2.2, 3.6, 2.2, BURNT[1]); ell(c, 6.2, 2.2, 4.4, 2.9, dith(c, BURNT[1]));
  ell(c, -2.6, 2.6, 2.2, 1.4, dith(c, BURNT[1]));
  // (his cheekbone, temple, the brow of the skull catching the light)
  px(c, 4.6, -0.2, 4.2, 1, SKIN[0]); px(c, 8.4, -5.6, 1, 4, SKIN[0]);
  // (stubble down the jaw)
  for (let i = 0; i < 16; i++) px(c, -6 + ((i * 3.7) % 14.5), 8 + ((i * 2.3) % 5.2), 0.6, 0.6, 'rgba(90, 62, 36, 0.4)');
  c.restore();
  c.beginPath(); skull(); c.strokeStyle = SKIN[4]; c.lineWidth = 0.8; c.stroke();
  // (the chin's cleft, a line under the lip)
  px(c, 2.8, 11.6, 0.6, 1.4, SKIN[3]);
  // ---- the jug ear, sticking right out, burnt round the rim
  shape(c, () => c.ellipse(-9.6, 0.6, 3.4, 5, -0.15, 0, Math.PI * 2), BURNT, -13, -6.2, 0.8);
  fill(c, SKIN[2], () => c.ellipse(-9.4, 0.8, 1.8, 3.2, -0.15, 0, Math.PI * 2)); px(c, -9.6, -0.6, 0.8, 2.4, SKIN[3]);
  // ---- the sideburn
  fill(c, HAIR[2], () => { c.moveTo(-6.8, -8); c.lineTo(-4.6, -8); c.lineTo(-5.2, -1); c.lineTo(-6.4, 0); c.closePath(); });
  // ---- bags under the eyes (no sleep, ever: the radio), crow's feet from squinting at the "wildlife"
  line(c, [FAR_EYE - 2, EYE_Y + 2.8, FAR_EYE, EYE_Y + 3.5, FAR_EYE + 2, EYE_Y + 2.8], 0.6, SKIN[3]);
  line(c, [NEAR_EYE - 2.2, EYE_Y + 3, NEAR_EYE, EYE_Y + 3.7, NEAR_EYE + 2.2, EYE_Y + 3], 0.6, SKIN[3]);
  line(c, [NEAR_EYE + 3.2, EYE_Y - 0.6, NEAR_EYE + 4.6, EYE_Y - 1.2], 0.5, SKIN[3]); line(c, [NEAR_EYE + 3.2, EYE_Y + 0.6, NEAR_EYE + 4.6, EYE_Y + 1.2], 0.5, SKIN[3]);
  // ---- the black eye coming up
  if (d >= 0.55) { ell(c, NEAR_EYE, EYE_Y + 0.6, 3.8, 3.4, `rgba(88, 28, 135, ${Math.min(0.6, (d - 0.5) * 1.6).toFixed(2)})`); }
  // ---- puffed cheeks
  if (puffed) shape(c, () => c.ellipse(6.2, 5.4, 4.6, 3.8, 0, 0, Math.PI * 2), BURNT, 1.6, 10.8, 0.8);
  // ---- eyes, brows
  drawEyes(c, face, f, d);
  drawBrows(c, face, f, talk ? v.o : 0);
  // ---- the nose: a beak of a thing, cooked, peeling at the tip
  shape(c, () => { c.moveTo(1, -3.6); c.quadraticCurveTo(3.2, -1.4, 8, 2); c.quadraticCurveTo(8.8, 4.2, 6.2, 4.2); c.lineTo(2.6, 4); c.quadraticCurveTo(0.6, 3.4, 1.4, 1.6); c.closePath(); }, BURNT, 0.6, 8.8, 0.8);
  px(c, 2.2, -1.6, 0.8, 2.6, BURNT[0]); ell(c, 6.8, 1.6, 0.9, 0.6, '#FDE2D2');
  px(c, 5, 0.2, 0.8, 0.5, '#FFF7F0'); px(c, 6.2, -0.4, 0.6, 0.5, '#FFF7F0'); px(c, 7.6, 2.6, 0.5, 0.5, '#FFF7F0');
  ell(c, 4, 3.4, 0.9, 0.5, BURNT[4]);
  // ---- the mustache: a scrap of one, patchy, sweat in it
  for (const [mx, w] of [[-2.2, 1.6], [-0.2, 1.4], [1.8, 1.8], [4.2, 1.4], [6, 1]] as const) px(c, mx, 5.1 + (mx > 3 ? -0.2 : 0), w, 1, HAIR[2]);
  // ---- the mouth, then the buck teeth over it
  drawMouth(c, face, f, d, v);
  // ---- blood (under the helmet's line)
  faceBlood(c, d, f, false);
  // ---- sweat: always a bead or two (it's the jungle), pouring when he's in trouble
  if (face !== 'dead') sweat(c, face, f, d);
  // ---- the pith helmet
  drawHelmet(c, f, d, tilt);
  faceBlood(c, d, f, true);
};

const eye = (c: Ctx, x: number, y: number, rx: number, ry: number, lid: number, look: number, pupil: number, bloodshot: boolean) => {
  ell(c, x, y, rx + 0.5, ry + 0.5, SKIN[4]);
  ell(c, x, y, rx, ry, '#F8F6EE');
  px(c, x - rx, y + ry * 0.35, rx * 2, ry * 0.65, '#DEDACB');
  if (bloodshot) { line(c, [x - rx, y, x - rx * 0.4, y + 0.4], 0.35, '#DC2626'); line(c, [x + rx, y - 0.3, x + rx * 0.45, y + 0.2], 0.35, '#DC2626'); }
  ell(c, x + look, y + 0.2, Math.min(1.3, rx * 0.6), Math.min(1.3, ry * 0.65), '#5E7E3E');
  ell(c, x + look, y + 0.2, pupil, pupil, '#0B0B0F');
  px(c, x + look + 0.3, y - 0.8, 0.7, 0.7, '#FFFFFF');
  if (lid > 0) {
    c.save(); c.beginPath(); c.ellipse(x, y, rx + 0.6, ry + 0.6, 0, 0, Math.PI * 2); c.clip();
    px(c, x - rx - 1, y - ry - 1, rx * 2 + 2, (ry * 2 + 1) * lid + 0.6, SKIN[2]);
    c.restore();
    line(c, [x - rx - 0.2, y - ry + (ry * 2) * lid, x + rx + 0.2, y - ry + (ry * 2) * lid], 0.9, SKIN[4]);
  } else line(c, [x - rx, y - ry + 0.2, x, y - ry - 0.2, x + rx, y - ry + 0.2], 0.8, SKIN[4]);
};

const drawEyes = (c: Ctx, face: Face, f: number, d: number) => {
  const shut = (x: number, w: number, curve: number) => line(c, [x - w, EYE_Y + 0.2, x, EYE_Y + curve, x + w, EYE_Y + 0.2], 0.9, '#2A1508');
  const blink = f % 190 < 5;
  const look = 0.7;
  switch (face) {
    case 'yelp':
      // (screwed shut: > <)
      line(c, [FAR_EYE - 2, EYE_Y - 1.4, FAR_EYE + 1, EYE_Y, FAR_EYE - 2, EYE_Y + 1.4], 0.9, '#2A1508');
      line(c, [NEAR_EYE + 2, EYE_Y - 1.4, NEAR_EYE - 1, EYE_Y, NEAR_EYE + 2, EYE_Y + 1.4], 0.9, '#2A1508');
      return;
    case 'whistle': shut(FAR_EYE, 2, -1.2); shut(NEAR_EYE, 2.2, -1.2); return;
    case 'dead': {
      // (an X for each eye, over the whites, bloodshot round them)
      for (const [x, w] of [[FAR_EYE, 1.9], [NEAR_EYE, 2.3]] as const) {
        ell(c, x, EYE_Y, w + 0.5, w + 0.3, SKIN[3]); ell(c, x, EYE_Y, w, w - 0.2, '#EDE4D4');
        line(c, [x - w + 0.4, EYE_Y - w + 0.6, x + w - 0.4, EYE_Y + w - 0.6], 0.9, '#2A1508');
        line(c, [x - w + 0.4, EYE_Y + w - 0.6, x + w - 0.4, EYE_Y - w + 0.6], 0.9, '#2A1508');
      }
      return;
    }
    case 'dazed': {
      // (rolled off two ways, the lids half down, swimming)
      const s = Math.sin(f * 0.15);
      eye(c, FAR_EYE, EYE_Y, 1.9, 1.9, 0.45, -1 + s * 0.4, 0.6, true);
      eye(c, NEAR_EYE, EYE_Y, 2.3, 2.1, 0.4, 1 - s * 0.4, 0.6, true);
      return;
    }
    case 'aim':
      // (the far eye shut, sighting down the tube with the near one)
      shut(FAR_EYE, 2, 1);
      eye(c, NEAR_EYE, EYE_Y, 2.3, 1.9, 0.45, 1.1, 0.7, false);
      return;
    case 'panic': case 'manic': {
      const j = face === 'manic' ? Math.sin(f * 0.7) * 0.3 : 0;
      eye(c, FAR_EYE, EYE_Y - 0.3, 2.1, 2.5, 0, look + j, 0.5, true);
      eye(c, NEAR_EYE, EYE_Y - 0.3, 2.6, 2.9, 0, look - j, face === 'manic' ? 0.4 : 0.55, true);
      return;
    }
    default: {
      if (blink && face !== 'grit') { shut(FAR_EYE, 2, 0.8); shut(NEAR_EYE, 2.2, 0.8); return; }
      const lid = face === 'smug' ? 0.4 : face === 'angry' ? 0.3 : face === 'grit' ? 0.35 : 0.12;
      const bs = face === 'angry' || d > 0.6;
      eye(c, FAR_EYE, EYE_Y, 1.9, 2, lid, look, 0.75, bs);
      eye(c, NEAR_EYE, EYE_Y, 2.3, 2.2, lid, look, 0.8, bs);
    }
  }
};

const drawBrows = (c: Ctx, face: Face, f: number, o: number) => {
  // (each brow: a thick bar from (x1,y1) to (x2,y2))
  const bar = (x1: number, y1: number, x2: number, y2: number) => {
    c.fillStyle = BROW; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.lineTo(x2, y2 + 1.5); c.lineTo(x1, y1 + 1.7); c.closePath(); c.fill();
    px(c, Math.min(x1, x2) + 0.6, Math.min(y1, y2) + 0.1, 1.2, 0.5, HAIR[1]);
  };
  const by = EYE_Y - 4;
  switch (face) {
    case 'angry': case 'grit':
      bar(FAR_EYE - 3, by - 1.2, FAR_EYE + 2.4, by + 1.4); bar(NEAR_EYE + 3.2, by - 1.4, NEAR_EYE - 2.4, by + 1.6);
      px(c, 0.2, by - 0.6, 0.5, 2.4, SKIN[3]); px(c, 1.2, by - 0.2, 0.5, 2, SKIN[3]);
      if (face === 'angry') { line(c, [-7.4, -9.2, -6.6, -8, -7.6, -7], 0.6, '#B91C1C'); } // (a vein going at his temple)
      return;
    case 'yelp': case 'whistle':
      bar(FAR_EYE - 3, by + 0.6, FAR_EYE + 2.4, by - 1.2); bar(NEAR_EYE + 3.2, by + 0.6, NEAR_EYE - 2.4, by - 1.4);
      return;
    case 'panic': case 'dazed': case 'dead':
      bar(FAR_EYE - 3, by - 1.4, FAR_EYE + 2.4, by - 3); bar(NEAR_EYE + 3.2, by - 1.4, NEAR_EYE - 2.4, by - 3.2);
      px(c, 0.6, by - 1.2, 0.5, 2, SKIN[3]);
      return;
    case 'manic': {
      const tw = f % 40 < 4 ? -0.8 : 0;
      bar(FAR_EYE - 3, by - 0.6, FAR_EYE + 2.4, by + 1.2); bar(NEAR_EYE + 3.2, by - 3 + tw, NEAR_EYE - 2.4, by - 2.2 + tw);
      return;
    }
    case 'aim':
      bar(FAR_EYE - 3, by + 1, FAR_EYE + 2.4, by + 1.6); bar(NEAR_EYE + 3.2, by - 0.6, NEAR_EYE - 2.4, by + 0.6);
      return;
    case 'chat': {
      // (going up and down with what he's saying, one higher: always explaining)
      const up = o * 1.6 + (Math.floor(f / 22) % 3 === 0 ? 0.8 : 0);
      bar(FAR_EYE - 3, by - 0.4 - up * 0.6, FAR_EYE + 2.4, by - 1.2 - up * 0.6); bar(NEAR_EYE + 3.2, by - 0.6 - up, NEAR_EYE - 2.4, by - 1.8 - up);
      return;
    }
    default:
      // (smug: arched, the near one cocked)
      bar(FAR_EYE - 3, by - 0.2, FAR_EYE + 2.4, by - 0.8); bar(NEAR_EYE + 3.2, by - 0.2, NEAR_EYE - 2.4, by - 2.2);
  }
};

/** The buck teeth, hung off his top lip whatever he's doing: one out once he's took a beating, the other chipped near the end. */
const buckTeeth = (c: Ctx, y: number, d: number, h = 3) => {
  const t = (x: number, hh: number) => {
    px(c, x - 0.3, y - 0.3, 2.2, hh + 0.6, '#5E4A2E');
    px(c, x, y, 1.6, hh, '#FFF8E2'); px(c, x + 1.1, y + 0.4, 0.5, hh - 0.4, '#E3D6A6'); px(c, x + 0.2, y + 0.3, 0.5, 0.8, '#FFFFFF');
  };
  if (d < 0.55) t(MX - 1.2, h); else { px(c, MX - 1.2, y, 1.6, 1, '#3B0A0A'); }
  t(MX + 0.6, d >= 0.85 ? h * 0.55 : h);
};

const drawMouth = (c: Ctx, face: Face, f: number, d: number, v: { o: number; w: number }) => {
  const dark = '#3B0A0A', lip = '#C0705A', tongue = '#E25A5A';
  const swollen = d >= 0.85;
  const open = (o: number, w: number, tip = 0) => {
    // (a mouth open `o` (0..1), `w` wider: the buck teeth hanging at the top, a tongue at the bottom)
    const half = 2.8 + w * 1.4, h = 1 + o * 4.6;
    fill(c, lip, () => c.ellipse(MX + 0.6, MY + h / 2 - 0.6, half + 0.7, h / 2 + 0.7, tip, 0, Math.PI * 2));
    fill(c, dark, () => c.ellipse(MX + 0.6, MY + h / 2 - 0.6, half, h / 2, tip, 0, Math.PI * 2));
    if (o > 0.35) ell(c, MX + 0.8, MY + h - 1.2, half * 0.6, Math.min(1.3, h * 0.25), tongue);
    if (o > 0.2) px(c, MX - half + 1.2, MY + h - 1.6, half * 2 - 2.4, 0.8, '#EDE6CC');  // the bottom teeth, a row
    buckTeeth(c, MY - 0.8, d, Math.min(3, 1.4 + h * 0.5));
  };
  switch (face) {
    case 'chat': case 'angry': {
      if (v.o < 0.08) {
        // (closed between words: the teeth over his lip)
        line(c, [MX - 3, MY + 0.8, MX + 3.8, MY + 0.6], 0.9, lip);
        buckTeeth(c, MY - 0.4, d, 2.8);
      } else open(face === 'angry' ? Math.max(0.4, v.o) : v.o, face === 'angry' ? v.w + 0.5 : v.w);
      break;
    }
    case 'manic': {
      // (a grin, teeth clenched, every one, still taunting through them)
      fill(c, dark, () => { c.moveTo(MX - 4.4, MY - 0.4); c.quadraticCurveTo(MX + 0.6, MY + 4.6 + v.o * 1.4, MX + 5.4, MY - 0.8); c.quadraticCurveTo(MX + 0.6, MY + 1, MX - 4.4, MY - 0.4); c.closePath(); });
      px(c, MX - 3.2, MY + 1.6 + v.o * 0.8, 7, 1, '#EDE6CC');
      line(c, [MX - 4.4, MY - 0.4, MX - 5.2, MY - 1.4], 0.6, SKIN[3]); line(c, [MX + 5.4, MY - 0.8, MX + 6.2, MY - 1.8], 0.6, SKIN[3]);
      buckTeeth(c, MY - 0.6, d, 3);
      break;
    }
    case 'grit': {
      // (teeth gritted: a clenched row, the buck teeth out over it)
      fill(c, dark, () => c.roundRect(MX - 3.6, MY + 0.2, 7.6, 3, 1));
      px(c, MX - 3.2, MY + 0.5, 6.8, 2.4, '#EDE6CC');
      for (let x = MX - 2; x < MX + 3.6; x += 1.6) px(c, x, MY + 0.5, 0.4, 2.4, 'rgba(0,0,0,0.45)');
      buckTeeth(c, MY - 0.6, d, 3);
      break;
    }
    case 'yelp': open(0.85 + Math.sin(f * 0.8) * 0.1, 0.4, -0.1); break;
    case 'panic': open(0.75 + Math.sin(f * 0.5) * 0.25, 0); break;
    case 'dazed': {
      // (hanging open, the tongue lolled out the side, drool)
      open(0.45, 0.2);
      fill(c, tongue, () => c.ellipse(MX + 3.8, MY + 3.6, 1.6, 2.4, -0.5, 0, Math.PI * 2)); px(c, MX + 3.6, MY + 2.4, 0.4, 2.6, '#B4403E');
      const t = (f % 60) / 60;
      px(c, MX + 4.4, MY + 5 + t * 5, 0.8, 1.6, 'rgba(191, 219, 254, 0.85)');
      break;
    }
    case 'dead': {
      // (slack open, the buck teeth hanging, the tongue out the side, long; blood out of the corner of his mouth)
      open(0.55, 0.3, 0.15);
      fill(c, '#9F3A3A', () => c.ellipse(MX + 5, MY + 4.4, 2.2, 3.8, -0.7, 0, Math.PI * 2));
      fill(c, tongue, () => c.ellipse(MX + 5, MY + 4.2, 1.6, 3.2, -0.7, 0, Math.PI * 2)); px(c, MX + 4.6, MY + 2.6, 0.5, 3, '#B4403E');
      smear(c, MX - 3.6, MY + 2.6, 2.6, 1.8, bloodFresh);
      break;
    }
    case 'aim': case 'whistle':
      // (lips puckered round the tube, round his fingers)
      ell(c, MX + 3.4, MY + 0.4, 1.8, 1.8, lip); ell(c, MX + 3.6, MY + 0.4, 1, 1.1, dark);
      break;
    default: {
      // (smug: a smarmy little smile, one corner up, the buck teeth sitting on the lip)
      line(c, [MX - 3.2, MY + 1.2, MX, MY + 1.8, MX + 3.4, MY + 1.2, MX + 5.4, MY - 0.4], 0.9, lip);
      px(c, MX + 5.6, MY - 1.2, 0.5, 1.2, SKIN[3]);
      buckTeeth(c, MY - 0.4, d, 2.8);
    }
  }
  if (swollen) ell(c, MX + 1, MY + 3.6, 2.8, 1, '#B4403E');
};

/** Cuts, a nosebleed, a split brow, a scalp gash coming down from under his helmet, blood off his chin. `over`: the ones on top of the helmet's line. */
const faceBlood = (c: Ctx, d: number, f: number, over: boolean) => {
  if (over) {
    if (d >= 0.7) { smear(c, 3, -8.2, 5, 2); drip(c, 2, -8, 7); drip(c, 4.8, -8, 4.5); drip(c, -1.4, -8.2, 3); }
    return;
  }
  if (d < 0.1) return;
  ell(c, -3.6, 5.6, 2.6, 1.6, DIRT);                                  // dirt on his cheek
  if (d >= 0.2) cut(c, 5.2, 0.2, 8.6, -1.2);                          // a cut on his cheekbone
  if (d >= 0.3) drip(c, 4, 4, d >= 0.5 ? 9 : 3.5);                    // a nosebleed, down past his lip
  if (d >= 0.45) { cut(c, FAR_EYE - 2.6, EYE_Y - 5.4, FAR_EYE + 1.6, EYE_Y - 6); drip(c, FAR_EYE - 1.6, EYE_Y - 5, d >= 0.6 ? 10 : 4); }
  if (d >= 0.55) cut(c, -0.6, 11.6, 2.4, 13);                         // his chin
  if (d >= 0.85) { for (let i = 0; i < 9; i++) px(c, -8 + ((i * 5.3) % 17), -6 + ((i * 3.7) % 16), 1, 1, bloodFresh); smear(c, -7.4, 6, 3, 4, bloodDark); }
  if (d >= 0.5) {
    // (dripping off his chin)
    const t = (f % 40) / 40;
    if (t < 0.7) ell(c, 4, 14.6 + t * 10, 0.8, 1.2, bloodFresh);
  }
};

const sweat = (c: Ctx, face: Face, f: number, d: number) => {
  const drop = (x: number, y: number) => { ell(c, x, y, 0.8, 1.2, '#7DD3FC'); px(c, x - 0.3, y - 0.6, 0.4, 0.4, '#F0F9FF'); };
  const t = ((f + 20) % 90) / 90;
  drop(9.4, -6 + t * 9);
  if (face === 'yelp' || face === 'panic' || face === 'grit' || d > 0.5) {
    const k = (f % 26) / 26; drop(-8.6, -6 + k * 8);
    for (const s of [-1, 1]) { const q = ((f + (s > 0 ? 0 : 9)) % 18) / 18; drop(s * (11 + q * 6), -12 - q * 4 + q * q * 8); }
  }
};

/** The plastic pith helmet: paneled dome (its seams, the vent on top), the puggaree band, the brim; cracked and taped. */
const drawHelmet = (c: Ctx, f: number, d: number, tilt: number) => {
  c.save(); c.translate(0.4, -9.8); c.rotate(tilt);
  // (chunk out of it: his hair sticking up through the hole, behind the dome)
  const chunk = d >= 0.65;
  if (chunk) {
    fill(c, HAIR[1], () => c.ellipse(4.8, -7.8, 4.8, 3.4, 0, 0, Math.PI * 2));
    for (let i = 0; i < 4; i++) line(c, [3 + i * 1.4, -8, 2.6 + i * 1.6, -11 - (i % 2) * 1.2], 0.7, HAIR[2]);
  }
  // The brim: its underside dark, the top lit; chipped at the front near the end
  const brim = () => {
    const N = 28;
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2;
      let r = 1;
      if (d >= 0.85 && a > 0.35 && a < 0.75) r = 0.82 + Math.abs(Math.sin(a * 23)) * 0.08;
      const x = 0.6 + Math.cos(a) * 16.4 * r, y = Math.sin(a) * 3.8 * r;
      if (i) c.lineTo(x, y); else c.moveTo(x, y);
    }
    c.closePath();
  };
  c.beginPath(); brim(); c.fillStyle = HELMET[3]; c.fill();
  c.save(); c.clip();
  px(c, -20, -6, 40, 6, HELMET[1]); px(c, -20, -0.4, 40, 1, dith(c, HELMET[2]));
  px(c, -20, 0.6, 40, 6, HELMET[3]); px(c, -20, 2.2, 40, 6, HELMET[4]);
  px(c, -17, -6, 4, 6, HELMET[0]); px(c, 10, -6, 8, 6, HELMET[2]);
  c.restore();
  c.beginPath(); brim(); c.strokeStyle = HELMET[4]; c.lineWidth = 0.8; c.stroke();
  // The dome: a polygon round a half ellipse (peaked a touch), a bite out of its top right once he's had it
  const dome = () => {
    const N = 26;
    for (let i = 0; i <= N; i++) {
      const a = Math.PI + (i / N) * Math.PI;
      let r = 1 + 0.06 * Math.sin((i / N) * Math.PI);
      const k = i / N;
      if (chunk && k > 0.6 && k < 0.84) r *= [0.6, 0.78, 0.52, 0.7, 0.58, 0.74][i % 6];
      const x = Math.cos(a) * 11.6 * r, y = Math.sin(a) * 12.2 * r;
      if (i) c.lineTo(x, y); else c.moveTo(x, y);
    }
    c.closePath();
  };
  shape(c, dome, HELMET, -11.6, 11.6, 0.9);
  c.save(); c.beginPath(); dome(); c.clip();
  // (stepped light down from the crown: a band of highlight round the top)
  ell(c, -3, -9.6, 6, 2.6, HELMET[0]); ell(c, -3, -9.6, 7.2, 3.4, dith(c, HELMET[0]));
  // (the panel seams, down from the vent)
  line(c, [0, -12.6, -5.4, -6, -6.6, 0], 0.5, HELMET[3]); line(c, [0, -12.6, 5.4, -6, 6.6, 0], 0.5, HELMET[3]);
  // (the puggaree band round the bottom, its folds)
  px(c, -13, -3.8, 26, 3.2, BAND[1]); px(c, -13, -3.8, 26, 0.7, BAND[0]); px(c, -13, -1.2, 26, 0.6, BAND[3]);
  for (let x = -9; x < 10; x += 3.2) px(c, x, -3.2, 0.5, 2.4, BAND[2]);
  px(c, 6, -3.8, 26, 3.2, 'rgba(38, 22, 10, 0.3)');
  // (scuffed, dented)
  if (d >= 0.35) { ell(c, 5.4, -5.4, 2.4, 1.4, DIRT); ell(c, -6.4, -7, 1.8, 1.2, DIRT); fill(c, HELMET[3], () => c.ellipse(-2.4, -4.8, 1.8, 1, 0.3, 0, Math.PI)); }
  c.restore();
  // (the vent button on top)
  shape(c, () => c.ellipse(0, -12.6, 2.2, 1.4, 0, Math.PI, 0), HELMET, -2.2, 2.2, 0.7);
  // (the shine: it's plastic)
  line(c, [-7.6, -5.4, -6.4, -8.6], 1, '#FFFFFF');
  // (the crack, taped over; another, not, once he's taken a few)
  line(c, [-2, -11.8, 0.6, -8.6, -1.2, -6.2, 0.4, -4.2], 0.7, HELMET[4]);
  c.save(); c.translate(-0.6, -8.4); c.rotate(-0.25); px(c, -2.8, -1, 5.6, 2, '#D6DCE4'); px(c, -2.8, -1, 5.6, 0.5, '#F1F5F9'); px(c, -2.8, 0.6, 5.6, 0.4, '#94A3B8'); c.restore();
  if (d >= 0.45) line(c, [7, -9.4, 5.4, -7, 7.2, -5.4, 6, -3.8], 0.7, HELMET[4]);
  // (the broken edge round the bite: the plastic's thickness showing)
  if (chunk) {
    const N = 26;
    c.beginPath();
    for (let i = 16; i <= 21; i++) {
      const a = Math.PI + (i / N) * Math.PI, r = (1 + 0.06 * Math.sin((i / N) * Math.PI)) * [0.6, 0.78, 0.52, 0.7, 0.58, 0.74][i % 6];
      const x = Math.cos(a) * 11.6 * r, y = Math.sin(a) * 12.2 * r;
      if (i === 16) c.moveTo(x, y); else c.lineTo(x, y);
    }
    c.strokeStyle = HELMET[0]; c.lineWidth = 0.7; c.stroke();
  }
  c.restore();
  void f;
};
