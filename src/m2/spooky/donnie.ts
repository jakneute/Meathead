// DONNIE DRACULA, drawn: Spooky Land's boss. The PA's "Dracula" the whole time: a fat, balding, sweaty guy in the
// cheapest vampire getup the park's party store had. Drawn at Safari Artie's grade (adventure/river/artie.ts): color
// ramps (light, base, shade, deep, line) in stepped bands with a dithered seam between them, every material outlined in
// its own darkest tone. Short legs in shiny polyester tux trousers (a satin stripe), patent dress shoes; a gut straining
// a ruffled tux shirt (the buttons gapping, belly hair through the gaps, a red clip-on bow tie, a cummerbund sagging
// under the overhang, sweat at the pits); a gold plastic medallion on a chain; a pinkie ring. Jowls, a double chin, a
// bulb of a drinker's nose, a mustache, five o'clock shadow, beady little eyes; a comb-over across a shiny dome.
// Dressed up (each piece on or off, by the caller): a lopsided shiny black nylon wig (the $4.99 tag still on a string
// off the back), a black polyester cape with a red lining (still creased from the bag, a red cord at the neck, a HELLO
// MY NAME IS DONNIE sticker on the near lapel), plastic fangs (a pink gum strip, two white points).
// Dracula, legally: Bram Stoker's novel and generic vampire tropes only; none of the film looks.
//
// drawDonnie(c, x, feetY, facing, frame, pose, damage, look): world (or screen) point of his feet, facing 1 right / -1
// left; `damage` 0 (fresh) .. 1 (nearly dead) beats him up as he loses health: sweat through everything, scuffs, a cut
// cheek and a nosebleed, blood spreading on the shirt, buttons popped (more gut), a black eye, the cape's hem torn, then
// shredded, a fang snapped, a scalp gash, the shirt ripped open over the gut, blood dripping off him.
// His sin is gluttony: `look.bloat` swells him a step at a time as he gorges (the gut out over his belt and sagging,
// the buttons going, the shirt splitting; the chins and the cheeks puffing out), the 'stuffed' pose holds the gut with
// both hands, a burp coming; a drumstick in his other hand on the PA, a blood slushie off the buffet in the shop; and in
// his last moments, his trousers down, `look.soiled` spreads the stain across the seat of his bat boxers, and
// `look.kick` kicks his legs (hung up in the ceiling by it).

import { type Ctx } from '../cast/kit';
import { smear, drip, cut, bloodFresh, bloodDark } from '../../m1/game/render/player/gore';
import { knee } from '../art/limb';

export type DonniePose =
  | 'stand'   // standing about, gut out
  | 'talk'    // going on (whining): a hand waving, palm up
  | 'mic'     // on the PA: the handheld mic up at his mouth, the other hand on his hip
  | 'panic'   // caught: both hands up by his face, hopping on the spot
  | 'run'     // running for it (fat, arms flailing, the cape flying out behind)
  | 'reach'   // grabbing for something (out ahead, low: the wig off its stand, the cape off its hook)
  | 'wig'     // the wig: both hands up on his head, shoving it down
  | 'cape'    // the cape: flung round behind him, both arms up and out
  | 'fangs'   // the fangs: a hand at his mouth, pushing them in
  | 'pose'    // the big vampire pose: the near arm up across his face, the cape held over his mouth
  | 'swoop'   // the cape swoop: crouched, arms out wide, the cape spread like wings
  | 'summon'  // calling the bats: both arms up over his head, the cape spread, a remote in his fist
  | 'lunge'   // the fang lunge: leaning in, arms out to grab, mouth wide (fangs)
  | 'bite'    // got hold of somebody: hands out clutching, jaw going
  | 'fumble'  // bent right over, groping about the floor (his fangs fell out)
  | 'hurt'    // hit: flinching back, arms up
  | 'stunned' // on his backside, legs out, head lolling
  | 'fly'     // powered up: flying, the cape out like a bat's wings, his legs dangling, toes pointed
  | 'spew'    // powered up: hunched forward in the air, mouth wide, blood coming out of it (the caller draws the stream)
  | 'cower'   // down in a corner, knees up, hands clasped under his chins: begging
  | 'stuffed' // gorged: both hands on his gut, leaning back off it, cheeks out, legs dangling (the burp; too much of it)
  | 'dead';   // lying flat on his back, arms out, tongue out (the caller lays him down: this is him standing, limp)

/** What he's got on (and in his hand). Off by default: the wig, the cape, the fangs are the dress-up. */
export interface DonnieLook {
  wig?: boolean; cape?: boolean; fangs?: boolean;
  /** Something in his near hand: the mic, the wig (grabbed off its stand), the fangs (on their way in), the bat remote,
   *  a blood slushie off the shop's buffet. */
  held?: 'mic' | 'wig' | 'fangs' | 'remote' | 'slushie' | null;
  /** Something to eat in his far hand (a fried drumstick, a bite out of it): on the PA, it's brought up in front of him. */
  snack?: 'drumstick' | null;
  /** How gorged he is, in whole steps: 0 as he is; 1-3 fuller (the gut out further over his belt, sagging, the buttons
   *  going, the cheeks and chins puffing out); 4 overfull (his death: the shirt split, buttons gone, a balloon). */
  bloat?: number;
  /** His trousers down: how far the shit's spread across the seat of the bat boxers (0 none .. 1 all of it). */
  soiled?: number;
  /** Satan's gift: real power. Glowing red eyes, real fangs (long, ivory, no pink plastic), a gray pallor, veins up his
   *  dome, a red aura flickering round him, the cape bigger and scalloped like a bat's wings. Still the wig, the tag. */
  powered?: boolean;
  /** His trousers down round his ankles (his last moments): hairy white legs, purple boxers with little bats on them. */
  pantsDown?: boolean;
  /** His legs kicking (any pose): how hard (0 still .. 1 flailing for his life), each knee bent the way a knee bends
   *  (art/limb.ts). His last moments: hung up in the ceiling, kicking, then not. */
  kick?: number;
}

// ---------------------------------------------------------------------------------------------------------------
// Ramps: light, base, shade, deep, line

type Ramp = readonly [string, string, string, string, string];
/** Pale, pasty, a bit pink: a man who works in a dark room. */
const SKIN: Ramp = ['#FBE3D6', '#F2C6AE', '#DCA48A', '#B97E66', '#6E4234'];
/** Flushed (cheeks, nose, the top of his head going red when he's in trouble). */
const FLUSH: Ramp = ['#F7BFAE', '#EC9C88', '#D4766A', '#AE5450', '#6A2A28'];
const SHIRT: Ramp = ['#FFFFFF', '#F1EEE6', '#D6D1C2', '#ADA796', '#5E5A4E'];
const POLY: Ramp = ['#4A4A58', '#26262E', '#18181E', '#0E0E12', '#000000'];
const LINING: Ramp = ['#F87171', '#DC2626', '#B91C1C', '#7F1D1D', '#3B0A0A'];
const SATIN: Ramp = ['#6B6B7A', '#3F3F4C', '#2A2A34', '#1C1C24', '#08080C'];
const SHOE: Ramp = ['#9CA3AF', '#27272A', '#18181B', '#0B0B0D', '#000000'];
const WIG: Ramp = ['#7C8AA8', '#2A2E3C', '#1A1C26', '#101218', '#000000'];
const HAIR: Ramp = ['#9A8A78', '#6E5E4E', '#54473A', '#3C3228', '#201A14'];
const GOLD: Ramp = ['#FEF9C3', '#FACC15', '#CA8A04', '#A16207', '#5A3A06'];
const BOW: Ramp = ['#FCA5A5', '#E11D48', '#BE123C', '#881337', '#4C0519'];
const PLASTIC: Ramp = ['#52525B', '#3F3F46', '#2A2A30', '#1C1C21', '#09090B'];
const BROW = '#3A2E24';
const SWEAT_RING = 'rgba(170, 160, 120, 0.22)';

// ---------------------------------------------------------------------------------------------------------------
// Painting helpers (Artie's: adventure/river/artie.ts)

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
/** A shape in its ramp: the base, a lit band down its left, a shade then a deep band down its right, outlined. */
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
const ell = (c: Ctx, x: number, y: number, rx: number, ry: number, color: string | CanvasPattern, rot = 0) => fill(c, color, () => c.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, Math.PI * 2));
const px = (c: Ctx, x: number, y: number, w: number, h: number, color: string | CanvasPattern) => { c.fillStyle = color; c.fillRect(x, y, w, h); };
const line = (c: Ctx, pts: number[], w: number, color: string, cap: CanvasLineCap = 'round') => {
  c.strokeStyle = color; c.lineWidth = w; c.lineCap = cap; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.stroke();
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const joint = (x1: number, y1: number, x2: number, y2: number, l1: number, l2: number, bend: number): [number, number] => {
  const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 0.001;
  const dd = Math.min(d, l1 + l2 - 0.01);
  const a = (l1 * l1 - l2 * l2 + dd * dd) / (2 * dd), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const ux = dx / d, uy = dy / d;
  return [x1 + ux * a + uy * h * bend, y1 + uy * a - ux * h * bend];
};
/** A run of tube (an arm, a leg): outlines first, then the fills, a lit stripe up one side, a shade down the other. */
const tube = (c: Ctx, pts: number[], ws: number[], rs: Ramp[]) => {
  const n = pts.length / 2 - 1;
  for (let i = 0; i < n; i++) line(c, [pts[i * 2], pts[i * 2 + 1], pts[i * 2 + 2], pts[i * 2 + 3]], ws[i] + 2, rs[i][4]);
  for (let i = 0; i < n; i++) {
    const x1 = pts[i * 2], y1 = pts[i * 2 + 1], x2 = pts[i * 2 + 2], y2 = pts[i * 2 + 3], w = ws[i], r = rs[i];
    line(c, [x1, y1, x2, y2], w, r[1]);
    let nx = -(y2 - y1), ny = x2 - x1; const len = Math.hypot(nx, ny) || 1; nx /= len; ny /= len;
    if (nx + ny * 0.6 < 0) { nx = -nx; ny = -ny; }
    const sh = w * 0.3, hl = w * 0.32;
    line(c, [x1 + nx * sh, y1 + ny * sh, x2 + nx * sh, y2 + ny * sh], w * 0.36, r[2]);
    line(c, [x1 - nx * hl, y1 - ny * hl, x2 - nx * hl, y2 - ny * hl], Math.max(0.6, w * 0.16), r[0]);
  }
};
const back = (r: Ramp): Ramp => [r[1], r[2], r[3], r[3], r[4]];

// ---------------------------------------------------------------------------------------------------------------
// Him

/** His head's scale (drawn in a unit space ~24 across, ~30 tall). */
const HS = 1.12;
/** How tall he is (feet to the top of his head; the wig's a few more), for putting words over him. */
export const DONNIE_H = 90;
/** Where his hips are (the upper body leans about them). */
const HIP_Y = -25;

/** The poses where the cape's spread out like wings (held out by his hands). */
const SPREAD = new Set<DonniePose>(['swoop', 'summon', 'fly']);
/** The poses with both hands up at (or over) his head, and with the near one at his mouth: drawn again over the head. */
const UP = new Set<DonniePose>(['panic', 'wig', 'cape', 'summon', 'hurt']);
const AT_MOUTH = new Set<DonniePose>(['mic', 'fangs']);
/** The poses he's yapping in (the mouth runs). */
const TALKERS = new Set<DonniePose>(['talk', 'mic', 'panic', 'bite', 'run', 'fumble', 'cower']);

export const drawDonnie = (c: Ctx, x: number, feetY: number, facing: number, frame: number, pose: DonniePose = 'stand', damage = 0, look: DonnieLook = {}) => {
  const f = frame, d = Math.max(0, Math.min(1, damage));
  const bl = Math.max(0, Math.min(4, Math.round(look.bloat ?? 0)));
  const L = { wig: !!look.wig, cape: !!look.cape, fangs: !!look.fangs, held: look.held ?? null, pantsDown: !!look.pantsDown, powered: !!look.powered, snack: look.snack ?? null, bloat: bl, soiled: Math.max(0, Math.min(1, look.soiled ?? 0)), kick: Math.max(0, Math.min(1, look.kick ?? 0)) };
  c.save();
  c.translate(Math.round(x), Math.round(feetY));
  c.scale(facing < 0 ? -1 : 1, 1);
  if (pose === 'stunned') c.translate(0, 17);
  if (pose === 'swoop') c.translate(0, 7);
  if (pose === 'cower') c.translate(0, 9);
  // (the power on him: a red aura, stepped rings, flickering)
  if (L.powered && pose !== 'dead') {
    const fl = 0.75 + 0.25 * Math.sin(f * 0.6) * Math.sin(f * 0.23);
    for (let i = 3; i >= 1; i--) ell(c, 0, -46, 20 + i * 7, 40 + i * 6, `rgba(220, 38, 38, ${(0.06 * fl * (4 - i)).toFixed(3)})`);
  }
  // (the bob: a fat man's run jiggles; panic, he's hopping)
  const b = pose === 'run' ? Math.abs(Math.sin(f * 0.32)) * -2.4 : pose === 'panic' ? Math.abs(Math.sin(f * 0.7)) * -2.5 : Math.sin(f * 0.05 + 2) * 0.6;
  // (the upper body's lean about the hips)
  const lean = pose === 'cower' ? 0.32 : pose === 'spew' ? 0.25 : pose === 'fly' ? 0.08 : pose === 'stuffed' ? -0.16 - bl * 0.02 : pose === 'fumble' ? 0.95 : pose === 'lunge' ? 0.35 : pose === 'bite' ? 0.18 : pose === 'run' ? 0.16 : pose === 'swoop' ? 0.28 : pose === 'hurt' ? -0.18 : pose === 'stunned' ? -0.12 : pose === 'reach' ? 0.4 : 0;
  const [far, near] = armsFor(pose, f, L);
  // ---- the cape behind all of him (the back of it), or spread out as wings
  if (L.cape) {
    c.save(); c.translate(0, b);
    c.translate(0, HIP_Y); c.rotate(lean); c.translate(0, -HIP_Y);
    if (SPREAD.has(pose)) drawWings(c, far, near, f, d, L.powered);
    else drawCapeBack(c, pose, f, d);
    c.restore();
  }
  // ---- the legs
  drawLegs(c, pose, f, d, L.pantsDown, L.soiled, L.kick);
  c.translate(0, b);
  c.translate(0, HIP_Y); c.rotate(lean); c.translate(0, -HIP_Y);
  // ---- the far arm, the body, the near lapel of the cape, the near arm, the head (and any hand up at it, over it)
  // (a snack on the PA: the far hand brought round in front of him with it)
  const behind = pose !== 'pose' && pose !== 'wig' && pose !== 'cape' && pose !== 'summon' && !(pose === 'mic' && L.snack);
  if (behind) drawArm(c, far, false, d, pose, f, L);
  // (gorged: the gut out over his belt and sagging, a step at a time; the shirt, its buttons, the lapel, the medallion
  // all stretched with it)
  c.save();
  if (bl) { c.translate(-12, -58); c.scale(1 + bl * 0.13, 1 + bl * 0.045); c.translate(12, 58); }
  drawBody(c, pose, f, d, bl);
  if (L.cape && !SPREAD.has(pose)) drawLapel(c, f, d);
  drawMedallion(c, pose, f, d);
  c.restore();
  if (!behind) drawArm(c, far, false, d, pose, f, L);
  drawArm(c, near, true, d, pose, f, L);
  const hx = pose === 'stunned' ? Math.sin(f * 0.12) * 2 : 1.5, hy = pose === 'hurt' ? -71 : pose === 'stunned' ? -69 + Math.sin(f * 0.12) * 1.2 : -72;
  const nod = pose === 'stunned' ? 0.25 + Math.sin(f * 0.12) * 0.12 : pose === 'hurt' ? -0.22 : pose === 'fumble' ? -0.5 : pose === 'lunge' ? -0.2 : pose === 'dead' ? 0.35 : pose === 'panic' ? Math.sin(f * 0.5) * 0.08 : 0;
  c.save(); c.translate(hx, hy); c.rotate(nod); c.scale(HS, HS);
  drawHead(c, pose, f, d, L);
  c.restore();
  // (hands up at his face or over his head: back on over it)
  if (UP.has(pose)) { hand(c, far, false, pose, f, L); hand(c, near, true, pose, f, L); }
  else if (AT_MOUTH.has(pose)) hand(c, near, true, pose, f, L);
  // (in the pose, the cape's edge up over his mouth, held there by the near arm)
  if (pose === 'pose' && L.cape) drawCapeOverFace(c, near, hx, hy);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Legs: shiny polyester tux trousers (a satin stripe down the side), patent dress shoes

const drawLegs = (c: Ctx, pose: DonniePose, f: number, d: number, down = false, soiled = 0, kick = 0) => {
  // [hipX, hipY, kneeX, kneeY, ankleX, ankleY, shoe angle]: the far leg, then the near
  let L: number[][];
  const H = HIP_Y;
  if (pose === 'stunned') L = [[-3, H, 8, H - 2, 19, H + 1, -1.4], [3, H, 12, H - 1, 23, H + 1, -1.5]];
  else if (pose === 'run') {
    const k = Math.sin(f * 0.32);
    L = [-1, 1].map(s => {
      const sw = s * k, hx = s * 3.5;
      const ax = sw * 8, ay = -4 - (sw < 0 ? -sw * 5 : 0);
      const [kx, ky] = joint(hx, H, ax, ay, 11, 11, 1);
      return [hx, H, kx, ky, ax, ay, sw < 0 ? -sw * 0.45 : -sw * 0.12];
    });
  } else if (pose === 'panic') {
    const up = Math.sin(f * 0.7);
    L = [[-4, H, -4.5, -14 - Math.max(0, up) * 3, -5, -4 - Math.max(0, up) * 5, 0], [4, H, 5, -14 - Math.max(0, -up) * 3, 5.5, -4 - Math.max(0, -up) * 5, 0]];
  } else if (pose === 'swoop') L = [[-5, H + 4, 3, -12, -6, -4, 0], [4, H + 4, 13, -13, 9, -4, 0]];
  else if (pose === 'cower') L = [[-5, H + 6, 6, -16, -3, -4, 0], [4, H + 6, 14, -17, 8, -4, 0]];
  else if (pose === 'fly' || pose === 'stuffed') {
    // (dangling, toes pointed, swaying)
    const sw = Math.sin(f * 0.12) * 1.5;
    L = [[-4, H, -4 + sw, -13, -3 + sw * 1.6, -2, 1.1], [4, H, 6 + sw, -14, 8 + sw * 1.6, -3, 1.0]];
  } else if (pose === 'spew') L = [[-4, H, -7, -14, -10, -6, 0.8], [4, H, 6, -14, 3, -5, 0.9]];
  else if (pose === 'lunge' || pose === 'reach') L = [[-4, H, -9, -13, -14, -4, -0.2], [4, H, 9, -14, 8, -4, 0]];
  else if (pose === 'fumble') L = [[-4, H, -1, -13, -7, -4, 0], [4, H, 7, -13, 3, -4, 0]];
  else if (pose === 'summon') L = [[-5, H, -7, -14, -9, -4, 0], [5, H, 7, -14, 9, -4, 0]];
  else if (pose === 'dead') L = [[-4, H, -5, -13, -6, -4, 0.5], [4, H, 5, -13, 6, -4, 0.6]];
  else L = [[-4.5, H, -5, -14, -5.5, -4, 0], [4.5, H, 5, -14, 5.5, -4, 0]];
  // (kicking: each foot flung out and up and back, out of step with the other, the knees bent forward (limb.ts); the
  // shoes flapping with it)
  if (kick > 0) L = [-1, 1].map(s => {
    const ph = f * 0.42 + (s > 0 ? Math.PI : 0) + Math.sin(f * 0.11) * 0.8, hx = s * 4;
    const ax = s * 5 + Math.sin(ph) * 7 * kick, ay = -4 - Math.max(0, Math.cos(ph)) * 10 * kick;
    const [kx, ky] = knee(hx, H, ax, ay, 11.5, 11, 1);
    return [hx, H, kx, ky, ax, ay, 0.5 + Math.sin(ph) * 0.45 * kick];
  });
  // (the seat of the trousers, between the two: a big one)
  const [h0, h1] = L;
  shape(c, () => c.roundRect(Math.min(h0[0], h1[0]) - 7, H - 3, Math.abs(h1[0] - h0[0]) + 14, 8, [2, 2, 4, 4]), down ? BOXERS : POLY, Math.min(h0[0], h1[0]) - 7, Math.max(h0[0], h1[0]) + 7);
  for (let i = 0; i < 2; i++) (down ? bareLeg : leg)(c, L[i], i === 1, d, pose, f);
  if (down) {
    // (the bats on the boxers' seat)
    for (const [bx, by] of [[-6, H - 1], [1, H + 2], [6, H - 0.5]]) batPrint(c, bx, by);
    // (and he's shat them: a brown stain spreading out across the seat from the middle, stepped dark to light at its rim,
    // a wet sheen on it)
    if (soiled > 0) {
      const mx = (h0[0] + h1[0]) / 2, w = 2 + soiled * 7, h = 1.2 + soiled * 3;
      ell(c, mx, H + 1, w + 0.8, h + 0.6, dith(c, '#6B4A1E'));
      ell(c, mx, H + 1, w, h, '#5A3A12');
      ell(c, mx - w * 0.15, H + 1.4, w * 0.62, h * 0.6, '#3E2608');
      if (soiled > 0.4) px(c, mx - w * 0.5, H - 0.2, Math.max(0.6, w * 0.3), 0.5, '#8A6430');
      if (soiled > 0.7) { line(c, [mx + w * 0.3, H + h, mx + w * 0.3, H + h + 1.5 + soiled * 2], 0.9, '#4A2E0C'); ell(c, mx + w * 0.3, H + h + 2 + soiled * 2, 0.7, 0.9, '#4A2E0C'); }
    }
  }
};

const BOXERS: Ramp = ['#C4B5FD', '#8B5CF6', '#6D28D9', '#4C1D95', '#2E1065'];
/** A little bat on the boxers (black, wings out). */
const batPrint = (c: Ctx, x: number, y: number) => {
  fill(c, '#111827', () => { c.moveTo(x - 2.2, y - 0.6); c.lineTo(x - 0.6, y - 0.2); c.lineTo(x, y - 0.8); c.lineTo(x + 0.6, y - 0.2); c.lineTo(x + 2.2, y - 0.6); c.lineTo(x + 1.4, y + 0.6); c.lineTo(x, y + 0.2); c.lineTo(x - 1.4, y + 0.6); c.closePath(); });
};
/** A leg with the trousers down: pasty, hairy; the boxers' leg on the thigh; the trousers in a heap over the shoe. */
const bareLeg = (c: Ctx, P: number[], near: boolean, d: number, pose: DonniePose, f: number) => {
  const [hx, hy, kx, ky, ax, ay, rot] = P;
  const skin = near ? SKIN : back(SKIN), box = near ? BOXERS : back(BOXERS);
  tube(c, [hx, hy, kx, ky, ax, ay], [7.6, 6], [skin, skin]);
  for (let i = 0; i < 5; i++) { const k = 0.2 + i * 0.15; px(c, lerp(kx, ax, k) + (i % 2 ? 1 : -1.4), lerp(ky, ay, k), 0.5, 1.2, HAIR[3]); px(c, lerp(hx, kx, 0.55 + i * 0.08) + (i % 2 ? 1.6 : -1.8), lerp(hy, ky, 0.55 + i * 0.08), 0.5, 1, HAIR[3]); }
  ell(c, kx + 0.6, ky, 2.6, 2, skin[1]); ell(c, kx, ky - 0.6, 1.4, 1, skin[0]);
  tube(c, [hx, hy, lerp(hx, kx, 0.45), lerp(hy, ky, 0.45)], [9.6], [box]);
  if (near) batPrint(c, lerp(hx, kx, 0.25), lerp(hy, ky, 0.25));
  // (the trousers, down round his ankles in a heap, the satin stripe twisted through it)
  shape(c, () => c.ellipse(ax + 0.8, ay - 1.6, 6, 3.4, 0, 0, Math.PI * 2), near ? POLY : back(POLY), ax - 5.2, ax + 6.8, 0.8);
  line(c, [ax - 3.6, ay - 2.6, ax, ay - 0.6, ax + 4, ay - 2.8], 0.8, SATIN[0]);
  if (d >= 0.6 && near) cut(c, kx - 1, ky + 2, kx + 1.4, ky + 3);
  shoe(c, ax, ay, rot, near, pose === 'run' ? f : 0);
};

const leg = (c: Ctx, P: number[], near: boolean, d: number, pose: DonniePose, f: number) => {
  const [hx, hy, kx, ky, ax, ay, rot] = P;
  const poly = near ? POLY : back(POLY);
  tube(c, [hx, hy, kx, ky, ax, ay], [8.4, 7], [poly, poly]);
  // (the satin stripe down the outside, catching the light)
  line(c, [lerp(hx, kx, 0.1), lerp(hy, ky, 0.1) - 0.4, kx, ky - 0.4, lerp(kx, ax, 0.9), lerp(ky, ay, 0.9) - 0.4], 1.1, near ? SATIN[0] : SATIN[1]);
  // (the shine on polyester: a hot streak down the thigh; the crease at the knee)
  if (near) { line(c, [lerp(hx, kx, 0.25) - 1.6, lerp(hy, ky, 0.25), lerp(hx, kx, 0.7) - 1.6, lerp(hy, ky, 0.7)], 0.7, '#6E6E80'); line(c, [kx - 2.6, ky + 0.6, kx + 2, ky - 0.4], 0.6, POLY[4]); }
  // (the hem bunched over the shoe: too long, cheap)
  ell(c, ax + 0.6, ay - 0.5, 4.4, 1.6, poly[2]);
  // (scuffed: dust on the knees; a rip at the knee, skin and blood through it)
  if (d >= 0.2) ell(c, kx + 1, ky + 0.6, 2.6, 1.6, 'rgba(160, 150, 140, 0.35)');
  if (near && d >= 0.6) {
    fill(c, POLY[4], () => { c.moveTo(kx - 2.6, ky - 1); c.lineTo(kx + 1.4, ky - 2); c.lineTo(kx + 2.8, ky + 1); c.lineTo(kx - 0.2, ky + 2.6); c.lineTo(kx - 2.4, ky + 1.4); c.closePath(); });
    fill(c, SKIN[1], () => { c.moveTo(kx - 1.8, ky - 0.6); c.lineTo(kx + 1, ky - 1.3); c.lineTo(kx + 2, ky + 0.9); c.lineTo(kx - 0.1, ky + 1.9); c.lineTo(kx - 1.6, ky + 1); c.closePath(); });
    cut(c, kx - 1, ky, kx + 1.2, ky + 0.6);
  }
  shoe(c, ax, ay, rot, near, pose === 'run' ? f : 0);
};

/** A patent dress shoe, its ankle at (x, y), toe forward: a hard shine on the toe cap. */
const shoe = (c: Ctx, x: number, y: number, rot: number, near: boolean, _f: number) => {
  const r = near ? SHOE : back(SHOE);
  c.save(); c.translate(x, y); c.rotate(rot);
  shape(c, () => { c.moveTo(-3.6, -1.2); c.lineTo(2.4, -1.4); c.quadraticCurveTo(8.8, -0.6, 9.2, 2.2); c.lineTo(9, 4); c.lineTo(-4, 4); c.lineTo(-4.2, 0.6); c.closePath(); }, r, -4.2, 9.2, 0.8);
  px(c, -4.4, 3.4, 13.6, 1.2, '#050505');                                      // the sole
  px(c, 0, 3.6, 2, 0.6, '#3F3F46');                                            // the heel's edge
  // (the shine: a white streak on the toe, a dot)
  line(c, [3.4, 0.1, 6.6, 0.6], 0.8, near ? '#E5E7EB' : '#71717A'); px(c, 7.6, 1.2, 0.8, 0.6, '#FFFFFF');
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The body: the ruffled tux shirt over the gut (straining), the cummerbund under it, the bow tie

/** The front of the gut (how far out the shirt is at height y): for the placket, the buttons, the ruffles. */
const FRONT: [number, number][] = [[-58, 6], [-54, 10], [-50, 13], [-46, 16], [-42, 17.8], [-38, 18.6], [-34, 18.2], [-30, 16.6], [-27, 13.8], [-24, 9]];
const frontAt = (y: number) => {
  for (let i = 1; i < FRONT.length; i++) if (y <= FRONT[i][0]) { const [y0, x0] = FRONT[i - 1], [y1, x1] = FRONT[i]; return lerp(x0, x1, (y - y0) / (y1 - y0)); }
  return FRONT[FRONT.length - 1][1];
};

const torsoPath = (c: Ctx) => {
  c.moveTo(-5, -60); c.quadraticCurveTo(-13.5, -59, -13.5, -50);
  c.lineTo(-14, -31); c.quadraticCurveTo(-13.6, -22.5, -6, -22);
  c.lineTo(5, -22); c.bezierCurveTo(14, -22, 19, -29, 18.7, -37);
  c.bezierCurveTo(18.4, -46, 14.5, -52, 9.5, -55);
  c.quadraticCurveTo(7, -60, 3, -60.5); c.closePath();
};

const drawBody = (c: Ctx, pose: DonniePose, f: number, d: number, bl = 0) => {
  // (the waistband, the cummerbund sagging under the overhang: red satin, pleated, the hook showing at the back)
  shape(c, () => c.roundRect(-13.6, -27, 21, 5, 1.5), SATIN, -13.6, 7.4, 0.8);
  shape(c, () => { c.moveTo(-14, -30); c.lineTo(8, -27.5); c.lineTo(9, -23.5); c.lineTo(-13.6, -24.4); c.closePath(); }, BOW, -14, 9, 0.8);
  for (let i = 0; i < 3; i++) line(c, [-12.5, -28.8 + i * 1.6, 7.6, -26.6 + i * 1.4], 0.4, BOW[3]);
  // The shirt: the whole torso, gut and all
  shape(c, () => torsoPath(c), SHIRT, -14, 18.7);
  // (the gut's shading: its underside in shade, the roll where it meets the chest, a highlight on its peak)
  c.save(); c.beginPath(); torsoPath(c); c.clip();
  ell(c, 6, -21, 15, 5, SHIRT[2]); ell(c, 6, -20, 13, 3.6, SHIRT[3]);
  line(c, [2, -48, 8, -49.5, 13.5, -47.5], 0.7, SHIRT[2]);
  ell(c, 12, -40, 3, 4.6, SHIRT[0]);
  // (straining: tension lines pulling across the gut, from the buttons; more of them, and longer, the fuller he is)
  for (const y of [-44, -38, -32]) { const fx = frontAt(y); line(c, [fx - 3, y, fx - 9, y - 2.4], 0.5, SHIRT[3]); line(c, [fx - 3, y + 0.6, fx - 8, y + 2.6], 0.5, SHIRT[2]); }
  if (bl >= 1) for (const y of [-47, -41, -35, -29]) { const fx = frontAt(y); line(c, [fx - 2.6, y, fx - 6 - bl * 1.6, y - 1.6 - bl * 0.4], 0.45, SHIRT[3]); }
  // (the gut's peak, shining tight)
  if (bl >= 2) { ell(c, 13, -36, 2.2, 3, '#FFFFFF'); px(c, 12, -40, 1, 1, '#FFFFFF'); }
  // (sweated through: the pits, down the back, under the gut; stepped, a dithered rim)
  const sw = 0.7 + d * 0.6;
  for (const [sx, sy, rx, ry] of [[-11.5, -49, 2.8 * sw, 5 * sw], [-6, -36, 3 * sw, 6 * sw], [8, -25, 6 * sw, 2.4 * sw]] as const) {
    ell(c, sx, sy, rx, ry, SWEAT_RING); ell(c, sx, sy, rx * 0.6, ry * 0.6, SWEAT_RING);
  }
  c.restore();
  // The placket down the front of the gut, its buttons gapping (hairy belly through the gaps); the ruffles down it
  // (popped by the beating, or by what he's eaten: one a step past the first, all of them overfull)
  const popped = Math.max(d >= 0.85 ? 3 : d >= 0.4 ? 1 : 0, bl >= 4 ? 3 : Math.max(0, bl - 1));
  const BUTTONS = [-49, -43, -37, -31];
  BUTTONS.forEach((y, i) => {
    const fx = frontAt(y) - 2.2;
    // (the gap between this one and the next: a lens of skin, belly hair in it; wider where it's popped)
    if (i < BUTTONS.length - 1) {
      const y2 = y + 3, gx = frontAt(y2) - 2, open = i >= BUTTONS.length - 1 - popped ? 2.2 : 0.9;
      ell(c, gx, y2, open, 1.6, SKIN[4]); ell(c, gx, y2, open - 0.4, 1.2, SKIN[1]);
      px(c, gx - 0.4, y2 - 0.6, 0.4, 1, HAIR[3]); px(c, gx + 0.4, y2 - 0.2, 0.4, 1, HAIR[3]);
    }
    if (i >= BUTTONS.length - popped) { line(c, [fx - 0.5, y, fx + 0.6, y + 0.6], 0.4, SHIRT[4]); return; } // (popped: a loose thread)
    ell(c, fx, y, 0.9, 0.9, SHIRT[4]); ell(c, fx - 0.2, y - 0.2, 0.6, 0.6, '#FFFFFF');
  });
  drawRuffles(c, f);
  // (the shirt ripped open over the gut, near the end (or split by it, overfull): the belly out, the navel, hair)
  if (d >= 0.85 || bl >= 3) {
    fill(c, SHIRT[4], () => { c.moveTo(9, -40); c.lineTo(17.6, -38); c.lineTo(17, -27); c.lineTo(9, -26.5); c.lineTo(11, -33); c.closePath(); });
    fill(c, SKIN[1], () => { c.moveTo(9.8, -39); c.lineTo(17, -37.6); c.lineTo(16.4, -27.6); c.lineTo(10, -27.2); c.lineTo(11.6, -33); c.closePath(); });
    ell(c, 14.6, -31.5, 1.2, 0.8, SKIN[4]);
    for (let i = 0; i < 7; i++) px(c, 11 + ((i * 2.3) % 5.4), -37 + ((i * 3.1) % 9), 0.4, 1, HAIR[3]);
    if (d >= 0.85) cut(c, 11, -35, 15.5, -33.5);
    // (overfull: the belly button popped out, a stretch mark or two)
    if (bl >= 4) { ell(c, 14.6, -31.5, 1.1, 1, SKIN[2]); line(c, [11, -29, 13.4, -28.4], 0.4, FLUSH[1]); line(c, [11.6, -37, 14, -36.2], 0.4, FLUSH[1]); }
  }
  // (the bow tie: a red clip-on, crooked, under his chins)
  c.save(); c.translate(8.4, -56.6); c.rotate(0.25 + d * 0.5);
  shape(c, () => { c.moveTo(0, 0); c.lineTo(-4, -2.4); c.lineTo(-4, 2.4); c.closePath(); c.moveTo(0, 0); c.lineTo(4, -2.4); c.lineTo(4, 2.4); c.closePath(); }, BOW, -4, 4, 0.6);
  ell(c, 0, 0, 1.2, 1.4, BOW[2]);
  c.restore();
  // Beaten: blood on the shirt (it shows on white)
  bodyBlood(c, d, f);
  void pose;
};

/** The ruffles down the front: a column of scallops following the gut, frilled at the edges. */
const drawRuffles = (c: Ctx, f: number) => {
  const jig = Math.sin(f * 0.1) * 0.2;
  // (two rows of frills either side of the placket, chest to gut, small and soft: their edges catching the light)
  for (let y = -55.5, i = 0; y <= -33; y += 1.9, i++) {
    const fx = frontAt(y) - 3.2 + jig, w = 1.7 + (i % 2) * 0.4;
    for (const side of [-1.6, 1.2]) {
      ell(c, fx + side, y, w, 1.1, i % 2 ? SHIRT[0] : '#FBFAF5', -0.3);
      line(c, [fx + side - w * 0.8, y + 0.7, fx + side + w * 0.6, y + 0.4], 0.35, SHIRT[2]);
    }
  }
};

const SPOTS: [number, number, number][] = [[14, -40, 3], [6, -48, 2.4], [11, -30, 2.8], [-4, -44, 2.2], [16, -34, 2], [2, -36, 2.8], [-9, -40, 2], [9, -52, 1.8]];
const bodyBlood = (c: Ctx, d: number, f: number) => {
  if (d < 0.2) return;
  const n = Math.min(SPOTS.length, Math.ceil(((d - 0.15) / 0.85) * SPOTS.length));
  for (let i = 0; i < n; i++) {
    const [x, y, s] = SPOTS[i];
    smear(c, x, y, s * 1.5, s * 1.05, i % 3 === 2 ? bloodDark : bloodFresh);
    if (i % 2 === 0) drip(c, x + s * 0.2, y + s * 0.3, s * (0.6 + d * 1.6));
  }
  if (d > 0.75) { const t = (f % 30) / 30; ell(c, 14, -26 + t * 26, 0.9, 1.4, bloodFresh); }
};

/** The medallion: a big gold plastic disc on a chain round his neck (a red jewel in a bat-wing setting), swinging. */
const drawMedallion = (c: Ctx, pose: DonniePose, f: number, d: number) => {
  const sw = pose === 'run' ? Math.sin(f * 0.32) * 2.4 : pose === 'panic' ? Math.sin(f * 0.7) * 1.6 : Math.sin(f * 0.05) * 0.4;
  const mx = frontAt(-46) - 3 + sw * 0.4, my = -46 + Math.abs(sw) * 0.3;
  line(c, [-2, -59, mx - 4, my - 3, mx, my - 3.6], 0.9, GOLD[3]); line(c, [9, -58, mx + 3, my - 3, mx, my - 3.6], 0.9, GOLD[3]);
  for (let i = 0; i < 4; i++) px(c, lerp(-2, mx - 4, i / 4) - 0.3, lerp(-59, my - 3, i / 4) - 0.3, 0.7, 0.7, GOLD[1]);
  // (the wings, either side of it; the disc; the jewel; a chip out of the gold paint showing gray plastic)
  fill(c, GOLD[4], () => { c.moveTo(mx - 3, my - 1); c.lineTo(mx - 6.4, my - 2.6); c.lineTo(mx - 5.6, my); c.lineTo(mx - 6.6, my + 1.6); c.lineTo(mx - 3, my + 1); c.closePath(); });
  fill(c, GOLD[4], () => { c.moveTo(mx + 3, my - 1); c.lineTo(mx + 6.4, my - 2.6); c.lineTo(mx + 5.6, my); c.lineTo(mx + 6.6, my + 1.6); c.lineTo(mx + 3, my + 1); c.closePath(); });
  shape(c, () => c.ellipse(mx, my, 3.4, 3.4, 0, 0, Math.PI * 2), GOLD, mx - 3.4, mx + 3.4, 0.7);
  ell(c, mx, my, 1.5, 1.6, '#991B1B'); px(c, mx - 0.6, my - 0.8, 0.6, 0.6, '#FCA5A5');
  if (d >= 0.5) px(c, mx + 1.2, my + 1.4, 1.4, 1, '#9CA3AF');
};

// ---------------------------------------------------------------------------------------------------------------
// The cape: cheap black polyester, a red lining, creased from the bag, a red cord at his neck

/** Hanging down his back (or flying out behind as he runs), its lining showing at the edges. */
const drawCapeBack = (c: Ctx, pose: DonniePose, f: number, d: number) => {
  const run = pose === 'run', fl = run ? Math.sin(f * 0.32) : Math.sin(f * 0.04) * 0.3;
  // (where its hem gets to: behind his calves standing; out level behind him running, rippling)
  const hemY = run ? -26 + fl * 4 : pose === 'stunned' ? -2 : pose === 'fumble' ? -14 : -6;
  const hemB = run ? -44 : pose === 'lunge' ? -30 : -22 + fl;
  const hemF = run ? -30 : 9;
  const tornHem = (x0: number, y0: number, x1: number, y1: number) => {
    // (the hem: wavy; ragged, chunks out of it, as he's beaten)
    const N = 9;
    for (let i = 1; i <= N; i++) {
      const k = i / N, xx = lerp(x0, x1, k), yy = lerp(y0, y1, k) + Math.sin(k * 9 + f * 0.15) * (run ? 2.4 : 1.2);
      const bite = d >= 0.45 && (i % 3 === 1) ? -3 - (d - 0.45) * 8 : 0;
      c.lineTo(xx, yy + bite);
    }
  };
  const path = () => {
    c.moveTo(-4, -61); c.lineTo(-13, -58);
    c.quadraticCurveTo(hemB - 3, -36, hemB, hemY);
    tornHem(hemB, hemY, hemF, hemY + (run ? 6 : 2));
    c.quadraticCurveTo(run ? -8 : 4, -40, 9, -57); c.closePath();
  };
  // (the lining, peeking out past the black at the hem and the inner edge: drawn as the back of it, then the outside over)
  c.save(); c.translate(1.6, 1.6); shape(c, path, LINING, hemB, hemF, 0.8); c.restore();
  shape(c, path, POLY, hemB, hemF, 0.9);
  // (the creases from the bag: a grid of folds, still in it)
  c.save(); c.beginPath(); path(); c.clip();
  for (let k = 1; k < 4; k++) { const yy = -58 + k * 13; line(c, [hemB - 6, yy, hemF + 6, yy - 1], 0.6, POLY[0]); line(c, [hemB - 6, yy + 0.8, hemF + 6, yy - 0.2], 0.5, POLY[4]); }
  line(c, [lerp(-13, hemB, 0.5), -40, lerp(-13, hemB, 0.5) + 2, hemY], 0.6, POLY[0]);
  // (the sheen: polyester, a streak of light down it)
  line(c, [-11, -54, hemB + 3, hemY - 6], 1.2, '#4E4E60');
  c.restore();
  // (shredded near the end: a slit up it, the lining through)
  if (d >= 0.8) { fill(c, LINING[1], () => { c.moveTo(lerp(hemB, hemF, 0.3), hemY); c.lineTo(lerp(hemB, hemF, 0.36), hemY - 18); c.lineTo(lerp(hemB, hemF, 0.42), hemY); c.closePath(); }); }
};

/** Spread out between his hands like wings (the swoop, the summon): the red lining at us, scalloped like a bat's. */
const drawWings = (c: Ctx, far: Arm, near: Arm, f: number, d: number, powered = false) => {
  const flap = Math.sin(f * 0.25) * 2;
  // (powered: the wings wider than his arms, real bat's wings: fingers of bone out to the points, the light through them)
  if (powered) {
    const sp = Math.sin(f * 0.2) * 4;
    for (const s of [-1, 1]) {
      const hx = s < 0 ? far.hx : near.hx, hy = s < 0 ? far.hy : near.hy;
      const tips: [number, number][] = [[hx + s * 16, hy - 14 + sp], [hx + s * 18, hy + 6 + sp * 0.5], [hx + s * 10, hy + 22], [s * 8, -14]];
      const wing = (k: number, dy: number) => { c.moveTo(s * 4, -58 + dy); c.lineTo(hx, hy + dy); tips.forEach(([tx, ty], i) => { const [qx, qy] = i ? tips[i - 1] : [hx, hy]; c.quadraticCurveTo((qx + tx) / 2 - s, (qy + ty) / 2 - 4, tx * k, ty - dy); }); c.closePath(); };
      fill(c, '#1C1017', () => wing(1, 0));
      fill(c, 'rgba(127, 29, 29, 0.55)', () => wing(0.94, 2));
      for (const [tx, ty] of tips.slice(0, 3)) line(c, [hx, hy, tx, ty], 0.9, '#3F2A33');
    }
  }
  const path = (dx: number) => {
    c.moveTo(-6, -60); c.lineTo(far.hx + dx - 2, far.hy - 2 + flap);
    // (scallops down from the far hand to the hem, along the hem, and up to the near hand)
    const pts: [number, number][] = [[far.hx - 4, far.hy + 12], [-16, -20], [-6, -10], [6, -10], [16, -20], [near.hx + 4, near.hy + 12]];
    let px0 = far.hx - 2, py0 = far.hy - 2 + flap;
    for (const [qx, qy] of pts) { c.quadraticCurveTo((px0 + qx) / 2 + 2, (py0 + qy) / 2 - 5, qx + dx, qy + (d >= 0.45 ? Math.sin(qx) * 2 : 0)); px0 = qx; py0 = qy; }
    c.lineTo(near.hx + dx + 2, near.hy - 2 + flap); c.lineTo(8, -60); c.closePath();
  };
  // (the black outside, a rim of it round the red)
  c.save(); c.translate(-1.4, -1.4); shape(c, () => path(0), POLY, far.hx - 6, near.hx + 6, 0.9); c.restore();
  shape(c, () => path(0), LINING, far.hx - 6, near.hx + 6, 0.8);
  // (the ribs of it: the folds, from his shoulders out to each scallop's point)
  for (const [qx, qy] of [[-16, -20], [-6, -10], [6, -10], [16, -20]]) line(c, [1, -56, qx, qy], 0.6, LINING[3]);
  line(c, [-4, -56, far.hx + 2, far.hy + 2], 0.7, LINING[0]);
  if (d >= 0.6) { fill(c, '#000000', () => c.ellipse(-8, -28, 2, 3.4, 0.3, 0, Math.PI * 2)); fill(c, '#000000', () => c.ellipse(10, -32, 1.6, 2.6, -0.2, 0, Math.PI * 2)); }
};

/** The near lapel of the cape, down over his chest (the cord tied at his neck, the name tag on it). */
const drawLapel = (c: Ctx, f: number, d: number) => {
  // (the floppy collar, standing up a little behind his neck: small, the cheap kind)
  shape(c, () => { c.moveTo(-11, -58); c.quadraticCurveTo(-13, -66, -8, -67); c.lineTo(-3, -61); c.closePath(); }, LINING, -13, -3, 0.8);
  shape(c, () => { c.moveTo(-12, -58); c.quadraticCurveTo(-14, -65, -10, -66.6); c.lineTo(-6, -60); c.closePath(); }, POLY, -14, -6, 0.8);
  // (the lapel)
  const lap = () => { c.moveTo(1.5, -60.5); c.lineTo(9, -58.5); c.quadraticCurveTo(10.6, -52, 9.4, -45); c.lineTo(5.6, -43.2); c.quadraticCurveTo(3, -50, 1.5, -60.5); c.closePath(); };
  shape(c, lap, POLY, 1.5, 10.6, 0.8);
  line(c, [9.2, -58, 10, -52, 9.2, -45.4], 0.8, LINING[1]);
  // (the cord, tied in a bow at his neck, its ends hanging)
  line(c, [-3, -59.6, 4, -58.6], 0.9, LINING[1]);
  ell(c, 4.6, -58.6, 1.4, 1, LINING[2]);
  line(c, [4.6, -58.2, 3.6, -54 + Math.sin(f * 0.07) * 0.5], 0.6, LINING[1]); line(c, [4.8, -58.2, 6.4, -54.6 + Math.sin(f * 0.07 + 1) * 0.5], 0.6, LINING[1]);
  // HELLO MY NAME IS DONNIE: a sticker on the lapel, on crooked (curling off at a corner once he's been knocked about)
  c.save(); c.translate(6.4, -51.2); c.rotate(-0.12 + (d >= 0.5 ? 0.35 : 0));
  px(c, -4.4, -2.6, 8.8, 5.6, '#7F1D1D');
  px(c, -4, -2.2, 8, 4.8, '#FFFFFF'); px(c, -4, -2.2, 8, 1.5, '#DC2626');
  for (let i = 0; i < 4; i++) px(c, -3.4 + i * 1.8, -1.9, 1, 0.6, '#FFFFFF');            // HELLO, in white on the red
  nameInk(c, -3.5, -0.2, 0.42);
  if (d >= 0.5) { fill(c, '#E5E7EB', () => { c.moveTo(4, 2.6); c.lineTo(4, 0.4); c.lineTo(1.8, 2.6); c.closePath(); }); }
  c.restore();
};

/** DONNIE in marker: a little pixel lettering (`s` a pixel). */
const GLYPHS: Record<string, number[]> = {
  // (3 wide, 5 tall, row by row)
  D: [1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0],
  O: [0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0],
  N: [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1],
  I: [1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1],
  E: [1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1],
};
const nameInk = (c: Ctx, x: number, y: number, s: number) => {
  c.fillStyle = '#111827';
  [...'DONNIE'].forEach((ch, i) => {
    const g = GLYPHS[ch];
    for (let k = 0; k < 15; k++) if (g[k]) c.fillRect(x + (i * 4 + (k % 3)) * s, y + Math.floor(k / 3) * s, s, s);
  });
};

/** The pose: the cape's edge drawn up across his face, over his mouth and nose (held in the near fist). */
const drawCapeOverFace = (c: Ctx, near: Arm, hx: number, hy: number) => {
  const path = () => { c.moveTo(-2, -58); c.quadraticCurveTo(hx + 4, hy + 18, near.hx + 1, near.hy - 1); c.lineTo(near.hx + 3, near.hy + 4); c.quadraticCurveTo(hx + 10, hy + 16, 12, -48); c.closePath(); };
  shape(c, path, POLY, -2, near.hx + 3, 0.8);
  line(c, [near.hx + 1, near.hy - 1, near.hx + 3, near.hy + 4], 1, LINING[1]);
  hand(c, near, true, 'pose', 0, {});
};

// ---------------------------------------------------------------------------------------------------------------
// Arms: chubby, in ruffled shirt sleeves (a frilly cuff), hairy hands, a pinkie ring

const UPPER = 11, FORE = 10.5, REACH = UPPER + FORE - 0.3;
interface Arm { sx: number; sy: number; ex: number; ey: number; hx: number; hy: number }

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
const cycle = (keys: number[][], t: number) => {
  const n = keys.length, i = Math.floor(t), u = t - i, e = u * u * (3 - 2 * u);
  const A = keys[((i % n) + n) % n], B = keys[(((i + 1) % n) + n) % n];
  return [lerp(A[0], B[0], e), lerp(A[1], B[1], e)];
};

/** Each pose's arms: [far, near] (in the upper body's own space). */
const armsFor = (pose: DonniePose, f: number, L: Required<Pick<DonnieLook, 'wig' | 'cape' | 'fangs'>> & Pick<DonnieLook, 'snack' | 'bloat'>): [Arm, Arm] => {
  const SX = 11.5, SY = -54;
  const far = (x: number, y: number, ux: number, uy: number) => solve(-SX + 3, SY, x, y, ux, uy);
  const near = (x: number, y: number, ux: number, uy: number) => solve(SX - 4, SY, x, y, ux, uy);
  // (the arms hang out round the gut: they can't come in close to his sides)
  const mouthX = 1.5 + 7 * HS, mouthY = -72 + 8 * HS;
  switch (pose) {
    case 'talk': {
      // (whining it at you: palm up, a shrug, a jab, the hand to his chest: "ME?")
      const [x, y] = cycle([[22, -44], [24, -56], [21, -38], [13, -48], [25, -50]], f / 24);
      return [far(-17, -34, -1, 0.1), near(x, y, 0.2, 1)];
    }
    case 'mic': {
      // (a snack in the other hand: up in front of him, at his chins, between bites; to his mouth for one now and then)
      if (L.snack) { const bite = f % 150 < 22; return [far(bite ? mouthX - 1 : 6, bite ? mouthY + 4 : -46, 1, 0.6), near(mouthX + 3, mouthY + 3, 0, 1)]; }
      return [far(-17, -34, -1, 0.1), near(mouthX + 3, mouthY + 3, 0, 1)];
    }
    case 'stuffed': {
      // (both hands on the gut, patting it, the near one round the front of it)
      const bl = L.bloat ?? 0, pat = Math.abs(Math.sin(f * 0.18)) * 1.6;
      return [far(16 + bl * 3, -30, 0, 1), near(20 + bl * 4 - pat, -38 - pat, 0, 1)];
    }
    case 'panic': {
      // (both hands up by his face, flapping)
      const j = Math.sin(f * 0.9) * 2;
      return [far(-8 + j, -76, -1, 0.4), near(18 - j, -76, 1, 0.4)];
    }
    case 'run': {
      // (flailing: the arms going round as much as back and forth)
      const k = Math.sin(f * 0.32), k2 = Math.cos(f * 0.32);
      return [far(-14 - k * 8, -44 - k2 * 9, -1, 0.3), near(10 + k * 10, -46 + k2 * 10, -1, 0.5)];
    }
    case 'reach': return [far(-15, -38, -1, 0.3), near(28, -36, 0, 1)];
    case 'wig': {
      // (shoving it down onto his head with both hands, twisting it this way and that)
      const j = Math.sin(f * 0.4) * 1.5;
      return [far(-6 + j, -86, -1, 0.3), near(10 - j, -88, 1, 0.3)];
    }
    case 'cape': return [far(-22, -76, -1, 0.5), near(22, -78, 1, 0.5)];
    case 'fangs': return [far(-17, -34, -1, 0.1), near(mouthX + 1, mouthY + 1, 0, 1)];
    case 'pose': return [far(-18, -38, -1, 0.2), near(mouthX + 4, mouthY - 1, 1, 0.6)];
    case 'swoop': {
      const fl = Math.sin(f * 0.25) * 2;
      return [far(-27, -50 + fl, -1, -0.3), near(28, -52 - fl, 1, -0.3)];
    }
    case 'fly': {
      const fl = Math.sin(f * 0.2) * 3;
      return [far(-28, -56 + fl, -1, -0.3), near(29, -58 - fl, 1, -0.3)];
    }
    case 'spew': return [far(-24, -44, -1, 0.4), near(-12, -40, -1, 0.6)];
    case 'cower': {
      // (hands clasped together under his chins, shaking: begging)
      const j = Math.sin(f * 1.3) * 0.8;
      return [far(14 + j, -62, 0, 1), near(17 + j, -63, 0, 1)];
    }
    case 'summon': {
      const j = Math.sin(f * 0.3) * 1.5;
      return [far(-15, -84 + j, -1, 0.2), near(15, -86 - j, 1, 0.2)];
    }
    case 'lunge': return [far(14, -58, 0, 1), near(30, -56, 0, 1)];
    case 'bite': {
      const k = Math.sin(f * 0.5) * 2;
      return [far(16 + k, -54, 0, 1), near(26 - k, -50, 0, 1)];
    }
    case 'fumble': {
      // (patting about the floor for them: in his upper body's space, the floor's out ahead of him)
      const k = Math.sin(f * 0.35) * 4;
      return [far(12 + k, -36, 0, 1), near(22 - k, -34, 0, 1)];
    }
    case 'hurt': return [far(-21, -74, -1, 0.6), near(19, -77, 1, 0.6)];
    case 'stunned': return [far(-19, -30, -1, -0.2), near(18, -30, 1, -0.2)];
    case 'dead': return [far(-24, -46, -1, -0.2), near(23, -46, 1, -0.2)];
    default: {
      // (hands on the gut, fingers drumming on it)
      const drum = Math.floor(f / 7) % 2;
      return [far(-17, -34, -1, 0.1), near(17, -34 - drum * 0.6, 1, 0.3)];
    }
  }
};

const drawArm = (c: Ctx, A: Arm, near: boolean, d: number, pose: DonniePose, f: number, L: DonnieLook) => {
  const { sx, sy, ex, ey, hx, hy } = A;
  const shirt = near ? SHIRT : back(SHIRT);
  tube(c, [sx, sy, ex, ey, hx, hy], [7.6, 6.6], [shirt, shirt]);
  // (the folds at the elbow; sweat under the arm)
  line(c, [lerp(ex, sx, 0.15) - 1, lerp(ey, sy, 0.15), ex + 1.2, ey + 1], 0.5, shirt[3]);

  // (blood on the sleeve; torn at the elbow near the end)
  if (near && d >= 0.35) smear(c, lerp(ex, hx, 0.4), lerp(ey, hy, 0.4), 2.6, 1.8);
  if (near && d >= 0.7) { ell(c, ex, ey, 2.2, 1.8, SKIN[1]); cut(c, ex - 1, ey - 0.4, ex + 1, ey + 0.6); }
  // (the frilly cuff at the wrist)
  const ux = hx - ex, uy = hy - ey, ul = Math.hypot(ux, uy) || 1;
  const cx = hx - (ux / ul) * 2.4, cy = hy - (uy / ul) * 2.4;
  for (let i = -1; i <= 1; i++) ell(c, cx + (-uy / ul) * i * 2.2, cy + (ux / ul) * i * 2.2, 1.8, 1.8, shirt[i === 1 ? 2 : 0]);
  hand(c, A, near, pose, f, L);
};

/** A hand: a fat fist, hairy on the back, a gold pinkie ring; open and clawing for the grabs; whatever he's holding. */
const hand = (c: Ctx, A: Arm, near: boolean, pose: DonniePose, f: number, L: DonnieLook) => {
  const r = near ? SKIN : back(SKIN);
  const x = A.hx, y = A.hy, a = Math.atan2(y - A.ey, x - A.ex);
  c.save(); c.translate(x, y); c.rotate(a);
  const claw = pose === 'lunge' || pose === 'bite' || pose === 'swoop' || pose === 'fly' || pose === 'fumble' || (pose === 'reach' && near);
  shape(c, () => c.ellipse(0.6, 0, 3.4, 3, 0, 0, Math.PI * 2), r, -2.8, 4, 0.8);
  if (claw) {
    // (fingers out, curled: grabbing)
    for (let i = 0; i < 4; i++) { const w = Math.sin(f * 0.4 + i) * 0.4; tube(c, [2.8, -1.8 + i * 1.2, 5.4, -2.2 + i * 1.4 + w, 6.6, -1 + i * 1.3 + w], [1.3, 1.1], [r, r]); }
  } else if (near && pose === 'talk') {
    const w = Math.sin(f * 0.3) * 0.6;
    for (let i = 0; i < 3; i++) tube(c, [2.4, -1.2 + i * 1.2, 5.4 + w * (i - 1) * 0.5, -1.8 + i * 1.4], [1.3], [r]);
  } else {
    for (let i = 0; i < 3; i++) px(c, 2.8, -1.6 + i * 1.2, 0.5, 0.5, r[3]);
    line(c, [-0.6, -2.4, 2, -2.6], 0.9, r[2]);
  }
  // (the hair on the back of it; the pinkie ring)
  for (let i = 0; i < 3; i++) px(c, -1 + i * 1.2, -2.6, 0.4, 0.9, HAIR[3]);
  ell(c, 2.4, 2.2, 0.7, 0.5, GOLD[2]); px(c, 2.2, 1.9, 0.4, 0.3, GOLD[0]);
  c.restore();
  // What's in it
  if (!near) { if (L.snack === 'drumstick') drumstick(c, x, y, f); return; }
  if (L.held === 'slushie') slushie(c, x, y, f);
  else if (L.held === 'mic') {
    c.save(); c.translate(x, y); c.rotate(-0.6);
    shape(c, () => c.roundRect(-1.4, -9, 2.8, 9, 0.8), PLASTIC, -1.4, 1.4, 0.7);
    shape(c, () => c.ellipse(0, -10.6, 2.6, 3, 0, 0, Math.PI * 2), ['#E4E4E7', '#A1A1AA', '#71717A', '#52525B', '#27272A'], -2.6, 2.6, 0.7);
    for (let i = -1; i <= 1; i++) line(c, [-2, -10.6 + i * 1.2, 2, -10.6 + i * 1.2], 0.3, '#3F3F46');
    // (its cord, off down to the desk)
    line(c, [0, 0, -2, 6, 2, 12, -1, 20], 0.7, '#18181B');
    c.restore();
  } else if (L.held === 'wig') {
    drawWigShape(c, x + 4, y - 3, 0.75, -0.3, f);
  } else if (L.held === 'fangs') {
    ell(c, x + 3, y - 1, 2.4, 1.2, '#F9A8D4'); px(c, x + 1.6, y - 0.6, 1, 2.2, '#FFFFFF'); px(c, x + 4, y - 0.6, 1, 2.2, '#FFFFFF');
  } else if (L.held === 'remote') {
    c.save(); c.translate(x, y); c.rotate(-1.2);
    shape(c, () => c.roundRect(-1.8, -9, 3.6, 9, 1), PLASTIC, -1.8, 1.8, 0.7);
    px(c, -0.8, -8, 1.6, 1.2, f % 20 < 10 ? '#EF4444' : '#7F1D1D');
    for (let i = 0; i < 3; i++) px(c, -1, -5.6 + i * 1.6, 0.8, 0.8, '#A1A1AA');
    line(c, [0, -9, 0, -13], 0.5, '#71717A');
    c.restore();
  }
};

/** A fried drumstick in his fist (the hand at x, y, the forearm's angle a): the bone's knuckle out the bottom of the
 *  fist, the meat up out of the top of it in its batter (a bite out of it, the meat showing), crumbs of the coating. */
const FRIED: Ramp = ['#F6C877', '#E09A3A', '#B8701E', '#8A4A10', '#4A2406'];
const BONE: Ramp = ['#FFFBEB', '#F1E6C8', '#D8C8A0', '#B8A478', '#6E5E3E'];
const drumstick = (c: Ctx, x: number, y: number, f: number) => {
  // (held up, the meat tipped toward his face)
  c.save(); c.translate(x, y); c.rotate(0.35);
  // (the knuckle of the bone, out the bottom of the fist)
  tube(c, [0, 2, 0, 5.2], [1.6], [BONE]);
  ell(c, -0.7, 5.8, 1.2, 1, BONE[1]); ell(c, 0.8, 5.8, 1.2, 1, BONE[1]); line(c, [-1.6, 6.6, 1.8, 6.6], 0.5, BONE[4]);
  // (the meat, up out of the top: a fat teardrop of batter)
  shape(c, () => { c.moveTo(-1.6, -2); c.quadraticCurveTo(-4.6, -6, -3.4, -10); c.quadraticCurveTo(-1.4, -13, 1.4, -11.6); c.quadraticCurveTo(4.4, -9.6, 3, -5.4); c.quadraticCurveTo(2.2, -2.6, 1.6, -2); c.closePath(); }, FRIED, -4.6, 4.4, 0.7);
  // (the bite: a scallop out of its top, the pale meat in it)
  fill(c, '#F3DDB8', () => { c.ellipse(1.6, -10.4, 1.8, 1.4, 0.4, 0, Math.PI * 2); });
  line(c, [0.2, -11.2, 1, -9.6, 2.2, -9.4, 3, -10.2], 0.4, '#C89A6A');
  // (the crags in the coating; a crumb dropping)
  for (const [cx, cy] of [[-2.4, -7], [0, -5], [-1, -9.4], [1.8, -6.6]]) px(c, cx, cy, 0.8, 0.6, FRIED[3]);
  px(c, -2.6, -8.4, 0.6, 0.5, FRIED[0]);
  c.restore();
  const t = (f % 50) / 50;
  if (t < 0.6) px(c, x + 1, y + 2 + t * 14, 0.8, 0.8, FRIED[2]);
};
/** A blood slushie off the shop's buffet in his fist: a striped paper cup, a domed lid, the red slush heaped up in it, a
 *  straw; it slops over the rim as he runs. */
const slushie = (c: Ctx, x: number, y: number, f: number) => {
  c.save(); c.translate(x + 1, y - 1);
  const CUP: Ramp = ['#FFFFFF', '#F1EFEA', '#D6D1C2', '#ADA796', '#5E5A4E'];
  shape(c, () => { c.moveTo(-3, -6); c.lineTo(3, -6); c.lineTo(2.2, 3); c.lineTo(-2.2, 3); c.closePath(); }, CUP, -3, 3, 0.7);
  px(c, -2.8, -3.6, 5.4, 1.4, '#DC2626'); px(c, -2.5, -0.8, 4.8, 1.2, '#DC2626');
  // (the slush heaped over the rim, the lid on it, the straw)
  shape(c, () => c.ellipse(0, -6.6, 3.4, 2, 0, 0, Math.PI * 2), ['#F87171', '#B91C1C', '#8E1414', '#5C0A0A', '#2A0303'], -3.4, 3.4, 0.6);
  px(c, -1.6, -7.6, 1.2, 0.6, '#FCA5A5');
  line(c, [0.6, -7, 1.8, -13, 3.2, -14], 1, '#5C0A0A'); line(c, [0.6, -7, 1.8, -13, 3.2, -14], 0.6, '#F1EFEA');
  if (f % 40 < 14) ell(c, 3, -5 + ((f % 40) / 14) * 6, 0.6, 0.9, '#B91C1C');
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The head, in its unit space: (0,0) its middle, the face turned toward +x

type Face = 'smug' | 'whine' | 'panic' | 'grit' | 'yelp' | 'dazed' | 'dead' | 'chomp' | 'strain' | 'leer' | 'spew' | 'queasy';
const faceOf = (pose: DonniePose, d: number, L: DonnieLook): Face => {
  switch (pose) {
    case 'stuffed': return 'queasy';
    case 'talk': case 'mic': return 'whine';
    case 'panic': case 'run': case 'reach': case 'fumble': return 'panic';
    case 'wig': case 'cape': case 'fangs': return 'strain';
    case 'pose': case 'summon': return 'leer';
    case 'swoop': case 'lunge': return 'grit';
    case 'fly': return 'leer';
    case 'spew': return 'spew';
    case 'cower': return 'panic';
    case 'bite': return 'chomp';
    case 'hurt': return 'yelp';
    case 'stunned': return 'dazed';
    case 'dead': return 'dead';
    default: return d > 0.6 ? 'grit' : L.fangs ? 'leer' : 'smug';
  }
};

const EYE_Y = -2.2, FAR_EYE = -1.2, NEAR_EYE = 5.6, MX = 6, MY = 8.4;

const viseme = (f: number) => {
  const seq = [[0.2, 0.5], [0.8, 0.4], [0.5, 1], [0, 0.4], [0.75, 0.6], [0.3, 0.2], [1, 0.6], [0.1, 0.9], [0.6, 0.3], [0.9, 0.8]];
  const i = Math.floor(f / 4), s = seq[(i * 7 + (i >> 3)) % seq.length];
  return { o: s[0], w: s[1] };
};

const skullPath = (c: Ctx) => {
  // (a round, fat head: a dome on top, jowls out wide at the bottom, a chin that's mostly another chin)
  c.moveTo(-10.6, -4); c.quadraticCurveTo(-10.8, -14.6, -0.6, -14.8); c.quadraticCurveTo(9.4, -14.6, 10.4, -5);
  c.lineTo(11.4, 2); c.quadraticCurveTo(12.4, 9, 9.6, 12.6); c.quadraticCurveTo(6.4, 16.2, 1, 15.6);
  c.quadraticCurveTo(-6, 15, -9.4, 9); c.quadraticCurveTo(-11.4, 4, -10.6, -4); c.closePath();
};

const drawHead = (c: Ctx, pose: DonniePose, f: number, d: number, L: DonnieLook) => {
  const face = faceOf(pose, d, L);
  const talk = TALKERS.has(pose);
  const v = talk ? viseme(f) : { o: 0, w: 0 };
  const flushed = face === 'panic' || face === 'strain' || face === 'yelp' || face === 'queasy' || d > 0.5 || (L.bloat ?? 0) >= 2;
  const bl = L.bloat ?? 0;
  // ---- gorged: the chins swelling out under the jaw, a step at a time (behind the skull: it's under it)
  if (bl) {
    const cw = 9 + bl * 1.8, ch = 3.4 + bl * 1.2, cy = 13.2 + bl * 0.9;
    shape(c, () => c.ellipse(1.6, cy, cw, ch, 0, 0, Math.PI * 2), SKIN, 1.6 - cw, 1.6 + cw, 0.8);
    line(c, [-4 - bl, cy + ch * 0.2, 1.6, cy + ch * 0.55, 7 + bl, cy + ch * 0.1], 0.6, SKIN[3]);
    for (let i = 0; i < 6 + bl * 2; i++) px(c, -5 - bl + ((i * 3.3) % (12 + bl * 3)), cy - 1 + ((i * 1.9) % (ch + 1)), 0.6, 0.6, 'rgba(60, 50, 50, 0.32)');
    if (L.powered) ell(c, 1.6, cy, cw, ch, 'rgba(120, 140, 170, 0.28)');
  }
  // ---- the hair round the back and sides (a horseshoe of it, going gray), under the wig if it's on
  if (!L.wig) {
    shape(c, () => { c.moveTo(-6, -9); c.quadraticCurveTo(-11.6, -9, -11.8, -2); c.lineTo(-11, 5); c.quadraticCurveTo(-9, 7, -7.6, 3); c.lineTo(-7.2, -3); c.quadraticCurveTo(-6.2, -7, -3.6, -8); c.closePath(); }, HAIR, -11.8, -3.6, 0.7);
    for (let i = 0; i < 4; i++) px(c, -10.6 + i * 0.9, -5 + i * 2, 0.6, 1.2, '#C8BCAE');
  }
  // ---- the skull
  c.beginPath(); skullPath(c); c.fillStyle = SKIN[1]; c.fill();
  c.save(); c.clip();
  px(c, -13, -20, 4.2, 40, SKIN[2]); px(c, -8.8, -20, 1, 40, dith(c, SKIN[2])); px(c, -13, -20, 2, 40, SKIN[3]);
  // (the jowls, the chins, in shade underneath; the fold of the double chin)
  ell(c, 1, 16, 10, 4.4, SKIN[2]); ell(c, 1, 17.4, 9, 3.2, SKIN[3]);
  line(c, [-3, 11.6, 2, 13, 8, 11.4], 0.7, SKIN[3]);
  // (the shine on top of the dome: a bald man under a light)
  if (!L.wig) { ell(c, 1.5, -11.8, 4.4, 1.6, SKIN[0]); px(c, 0.2, -12.6, 2, 0.8, '#FFFFFF'); }
  // (flushed cheeks; red up the dome when he's in trouble)
  ell(c, 6.6, 4, 3.8, 2.6, flushed ? FLUSH[1] : dith(c, FLUSH[1]));
  if (flushed) ell(c, 1, -8, 8, 3, dith(c, FLUSH[0]));
  // (five o'clock shadow, down the jowls and round the chins)
  for (let i = 0; i < 22; i++) px(c, -6 + ((i * 3.7) % 16), 7 + ((i * 2.3) % 7), 0.6, 0.6, 'rgba(60, 50, 50, 0.38)');
  // (powered: the gray of the dead over him, and the veins up his dome, pulsing)
  if (L.powered) {
    c.fillStyle = 'rgba(120, 140, 170, 0.28)'; c.fillRect(-14, -18, 28, 36);
    const pulse = Math.floor(f / 8) % 2 ? '#7C3AED' : '#6D28D9';
    line(c, [-6, -2, -5, -7, -2, -10, -3, -13], 0.5, pulse); line(c, [-5, -7, -8, -10], 0.4, pulse); line(c, [3, -7, 5, -11, 4, -14], 0.5, pulse);
  }
  c.restore();
  c.beginPath(); skullPath(c); c.strokeStyle = SKIN[4]; c.lineWidth = 0.8; c.stroke();
  // ---- gorged (or holding a burp in): the near cheek puffed out past the jaw line, flushed, shining; up under the eye
  const puff = face === 'queasy' ? Math.max(bl, 2) : bl;
  if (puff) {
    const rx = 3 + puff * 1.1, ry = 2.6 + puff * 0.8, cx = 7.4 + puff * 0.5, cy = 4.6;
    shape(c, () => c.ellipse(cx, cy, rx, ry, -0.2, 0, Math.PI * 2), FLUSH, cx - rx, cx + rx, 0.7);
    ell(c, cx - rx * 0.3, cy - ry * 0.35, rx * 0.35, ry * 0.25, FLUSH[0]); px(c, cx - rx * 0.4, cy - ry * 0.5, 0.8, 0.5, '#FFFFFF');
    if (L.powered) ell(c, cx, cy, rx, ry, 'rgba(120, 140, 170, 0.2)');
    // (the far cheek showing past the nose, too)
    ell(c, -2.4, 5.6, 1.6 + puff * 0.5, 1.4 + puff * 0.4, dith(c, FLUSH[2]));
  }
  // ---- the comb-over: a few long strands, from the part over his ear right across the dome, plastered down
  if (!L.wig) {
    const lift = pose === 'run' ? Math.sin(f * 0.32) * 1.5 - 2.5 : pose === 'panic' ? -1.5 : 0;
    for (let i = 0; i < 4; i++) {
      const y0 = -6.6 - i * 1.3;
      line(c, [-8.4, y0, -3, -13 - i * 0.6 + lift * (i / 3), 4, -13.2 + i * 0.4 + lift * (i / 2), 7 + i * 0.4, -10.4 + i * 0.8 + lift * (i / 3)], 0.7, HAIR[3]);
    }
    // (one's come loose: sticking up off the top, waving)
    if (pose === 'run' || pose === 'panic' || pose === 'hurt' || d > 0.3) line(c, [-2, -14, 1, -18 + Math.sin(f * 0.3), 4, -19 + Math.sin(f * 0.3 + 1)], 0.6, HAIR[3]);
  }
  // ---- the ear (back a way: he's fat-necked), red at the rim
  shape(c, () => c.ellipse(-6.6, 1.4, 2.6, 4, -0.1, 0, Math.PI * 2), SKIN, -9.2, -4, 0.7);
  fill(c, SKIN[2], () => c.ellipse(-6.4, 1.6, 1.3, 2.4, -0.1, 0, Math.PI * 2));
  // ---- the black eye coming up
  if (d >= 0.5) ell(c, NEAR_EYE, EYE_Y + 0.8, 3.6, 3.2, `rgba(88, 28, 135, ${Math.min(0.6, (d - 0.45) * 1.6).toFixed(2)})`);
  // ---- bags under the eyes
  line(c, [FAR_EYE - 1.6, EYE_Y + 2.4, FAR_EYE, EYE_Y + 3, FAR_EYE + 1.6, EYE_Y + 2.4], 0.5, SKIN[3]);
  line(c, [NEAR_EYE - 1.8, EYE_Y + 2.6, NEAR_EYE, EYE_Y + 3.2, NEAR_EYE + 1.8, EYE_Y + 2.6], 0.5, SKIN[3]);
  drawEyes(c, face, f, d, !!L.powered);
  drawBrows(c, face, f, talk ? v.o : 0);
  // ---- the nose: a bulb of a thing, red at the end, pores
  shape(c, () => { c.moveTo(6.4, -2); c.quadraticCurveTo(8, 0, 10.6, 1.6); c.quadraticCurveTo(13.6, 3.6, 11.6, 5.6); c.quadraticCurveTo(9.6, 6.6, 7.6, 5.4); c.quadraticCurveTo(6, 3.6, 6.4, -2); c.closePath(); }, FLUSH, 6, 13.4, 0.8);
  ell(c, 11.4, 3.2, 1.6, 1.2, FLUSH[2]); px(c, 10.4, 2, 0.8, 0.6, FLUSH[0]);
  for (const [nx, ny] of [[9.8, 3.6], [11, 4.6], [12.2, 3]]) px(c, nx, ny, 0.4, 0.4, FLUSH[3]);
  ell(c, 9.4, 5.2, 1, 0.5, FLUSH[4]);
  // ---- the mustache: thick, a Jersey push-broom, a gray hair or two
  shape(c, () => { c.moveTo(3, 6.6); c.quadraticCurveTo(7, 5, 11.6, 6.2); c.quadraticCurveTo(12.4, 7.6, 11, 7.8); c.quadraticCurveTo(7, 7.2, 3.4, 8); c.closePath(); }, HAIR, 3, 12.4, 0.6);
  px(c, 7, 6.4, 0.4, 1, '#C8BCAE');
  // ---- the mouth (and the fangs, in or out)
  drawMouth(c, face, f, d, v, !!L.fangs || !!L.powered, !!L.powered);
  // ---- blood
  faceBlood(c, d, f);
  // ---- sweat: always beading on the dome and the lip (it's hot in the costume); pouring when he's scared
  sweat(c, face, f, d, !!L.wig);
  // ---- the wig, on (lopsided; worse as he's knocked about)
  if (L.wig) drawWigShape(c, 0.4, -6.4, 1, -0.14 - d * 0.22 + (pose === 'run' ? Math.sin(f * 0.32) * 0.06 : 0), f);
};

const eye = (c: Ctx, x: number, y: number, rx: number, ry: number, lid: number, look: number, pupil: number, bloodshot: boolean) => {
  ell(c, x, y, rx + 0.5, ry + 0.5, SKIN[4]);
  ell(c, x, y, rx, ry, '#F6F2E6');
  if (bloodshot) { line(c, [x - rx, y, x - rx * 0.4, y + 0.3], 0.35, '#DC2626'); line(c, [x + rx, y - 0.2, x + rx * 0.5, y + 0.2], 0.35, '#DC2626'); }
  ell(c, x + look, y + 0.2, Math.min(1.1, rx * 0.6), Math.min(1.1, ry * 0.65), '#5B4630');
  ell(c, x + look, y + 0.2, pupil, pupil, '#0B0B0F');
  px(c, x + look + 0.2, y - 0.7, 0.6, 0.6, '#FFFFFF');
  if (lid > 0) {
    c.save(); c.beginPath(); c.ellipse(x, y, rx + 0.6, ry + 0.6, 0, 0, Math.PI * 2); c.clip();
    px(c, x - rx - 1, y - ry - 1, rx * 2 + 2, (ry * 2 + 1) * lid + 0.6, SKIN[2]);
    c.restore();
    line(c, [x - rx - 0.2, y - ry + ry * 2 * lid, x + rx + 0.2, y - ry + ry * 2 * lid], 0.8, SKIN[4]);
  }
};

const drawEyes = (c: Ctx, face: Face, f: number, d: number, powered = false) => {
  if (powered && face !== 'dead' && face !== 'dazed' && face !== 'yelp') {
    // (Satan's gift: no whites, no pupils, just red light, a glow round each, a flare that comes and goes)
    const fl = 0.6 + 0.4 * Math.abs(Math.sin(f * 0.2));
    for (const [ex, r] of [[FAR_EYE, 1.6], [NEAR_EYE, 1.9]] as const) {
      ell(c, ex, EYE_Y, r + 2.4, r + 1.8, `rgba(248, 113, 113, ${(0.28 * fl).toFixed(2)})`);
      ell(c, ex, EYE_Y, r + 0.5, r * 0.75 + 0.5, '#450A0A');
      ell(c, ex, EYE_Y, r, r * 0.75, '#DC2626');
      ell(c, ex + 0.2, EYE_Y - 0.1, r * 0.55, r * 0.4, '#FCA5A5');
      px(c, ex + 0.3, EYE_Y - 0.5, 0.6, 0.5, '#FFFFFF');
    }
    return;
  }
  const shut = (x: number, w: number, curve: number) => line(c, [x - w, EYE_Y + 0.2, x, EYE_Y + curve, x + w, EYE_Y + 0.2], 0.9, '#2A1508');
  const blink = f % 170 < 5;
  switch (face) {
    case 'spew':
      eye(c, FAR_EYE, EYE_Y - 0.3, 1.8, 2.2, 0, 0.6, 0.5, true); eye(c, NEAR_EYE, EYE_Y - 0.3, 2.1, 2.5, 0, 0.6, 0.55, true);
      return;
    case 'yelp': case 'strain':
      line(c, [FAR_EYE - 1.6, EYE_Y - 1.2, FAR_EYE + 1, EYE_Y, FAR_EYE - 1.6, EYE_Y + 1.2], 0.9, '#2A1508');
      line(c, [NEAR_EYE + 1.8, EYE_Y - 1.2, NEAR_EYE - 1, EYE_Y, NEAR_EYE + 1.8, EYE_Y + 1.2], 0.9, '#2A1508');
      return;
    case 'chomp': shut(FAR_EYE, 1.6, -1); shut(NEAR_EYE, 1.8, -1); return;
    case 'dead':
      // (X'd out)
      for (const ex of [FAR_EYE, NEAR_EYE]) { line(c, [ex - 1.4, EYE_Y - 1.4, ex + 1.4, EYE_Y + 1.4], 0.8, '#2A1508'); line(c, [ex - 1.4, EYE_Y + 1.4, ex + 1.4, EYE_Y - 1.4], 0.8, '#2A1508'); }
      return;
    case 'dazed': {
      const s = Math.sin(f * 0.15);
      eye(c, FAR_EYE, EYE_Y, 1.5, 1.6, 0.45, -0.8 + s * 0.4, 0.5, true);
      eye(c, NEAR_EYE, EYE_Y, 1.8, 1.8, 0.4, 0.8 - s * 0.4, 0.5, true);
      return;
    }
    case 'queasy':
      // (bulging: something's coming up)
      eye(c, FAR_EYE, EYE_Y - 0.5, 1.9, 2.3, 0, 0.3, 0.4, true);
      eye(c, NEAR_EYE, EYE_Y - 0.5, 2.2, 2.6, 0, 0.3, 0.45, true);
      return;
    case 'panic':
      // (wide, tiny pupils, darting)
      eye(c, FAR_EYE, EYE_Y - 0.3, 1.8, 2.2, 0, Math.sin(f * 0.6) * 0.4, 0.45, true);
      eye(c, NEAR_EYE, EYE_Y - 0.3, 2.1, 2.5, 0, Math.sin(f * 0.6) * 0.4, 0.5, true);
      return;
    case 'leer':
      // (the vampire stare he practiced in the mirror: lids low, eyes rolled up to the far corner)
      eye(c, FAR_EYE, EYE_Y, 1.6, 1.7, 0.42, 0.8, 0.6, false);
      eye(c, NEAR_EYE, EYE_Y, 1.9, 1.9, 0.42, 0.8, 0.65, false);
      return;
    default: {
      if (blink && face !== 'grit') { shut(FAR_EYE, 1.6, 0.7); shut(NEAR_EYE, 1.8, 0.7); return; }
      const lid = face === 'smug' ? 0.38 : face === 'grit' ? 0.3 : 0.15;
      eye(c, FAR_EYE, EYE_Y, 1.5, 1.6, lid, 0.5, 0.6, d > 0.6);
      eye(c, NEAR_EYE, EYE_Y, 1.8, 1.8, lid, 0.5, 0.65, d > 0.6);
    }
  }
};

const drawBrows = (c: Ctx, face: Face, f: number, o: number) => {
  const bar = (x1: number, y1: number, x2: number, y2: number) => {
    c.fillStyle = BROW; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.lineTo(x2, y2 + 1.6); c.lineTo(x1, y1 + 1.8); c.closePath(); c.fill();
    px(c, Math.min(x1, x2) + 0.5, Math.min(y1, y2) + 0.1, 1, 0.5, HAIR[1]);
  };
  const by = EYE_Y - 3.6;
  switch (face) {
    case 'grit': case 'chomp': case 'leer':
      bar(FAR_EYE - 2.6, by - 1, FAR_EYE + 2, by + 1.2); bar(NEAR_EYE + 2.8, by - 1.2, NEAR_EYE - 2, by + 1.4);
      px(c, 2, by - 0.4, 0.5, 2.2, SKIN[3]);
      return;
    case 'whine': {
      // (up in the middle, the woe-is-me tilt, going with what he's saying)
      const up = o * 1.2;
      bar(FAR_EYE - 2.6, by + 0.4, FAR_EYE + 2, by - 1.4 - up); bar(NEAR_EYE + 2.8, by + 0.4, NEAR_EYE - 2, by - 1.6 - up);
      return;
    }
    case 'panic': case 'yelp': case 'strain': case 'dazed': case 'dead': case 'queasy':
      bar(FAR_EYE - 2.6, by - 1.2, FAR_EYE + 2, by - 2.8); bar(NEAR_EYE + 2.8, by - 1.2, NEAR_EYE - 2, by - 3);
      line(c, [0, by - 4, 3, by - 4.4, 6, by - 4], 0.5, SKIN[3]); line(c, [0.6, by - 5.6, 5.4, by - 5.8], 0.5, SKIN[3]); // (forehead wrinkles)
      return;
    default:
      bar(FAR_EYE - 2.6, by - 0.2, FAR_EYE + 2, by - 0.8); bar(NEAR_EYE + 2.8, by, NEAR_EYE - 2, by - 1.8);
  }
  void f;
};

const drawMouth = (c: Ctx, face: Face, f: number, d: number, v: { o: number; w: number }, fangs: boolean, real = false) => {
  const dark = '#3B0A0A', lip = '#C0705A', tongue = '#E25A5A';
  /** The plastic fangs: a pink gum strip along the top, two long white points (one snapped off near the end). */
  const fangsAt = (y: number, len: number) => {
    // (plastic: a pink gum strip, white points, one snapped near the end; real: long ivory ones, a drop of blood on each)
    if (!real) { px(c, MX - 2.4, y - 0.6, 6, 1.3, '#F472B6'); px(c, MX - 2.4, y - 0.6, 6, 0.5, '#FBCFE8'); }
    else len *= 1.45;
    const col = real ? '#FFF7E0' : '#FFFFFF';
    const tooth = (x: number, l: number) => { fill(c, '#5E5A4E', () => { c.moveTo(x - 0.9, y); c.lineTo(x + 0.9, y); c.lineTo(x, y + l + 0.5); c.closePath(); }); fill(c, col, () => { c.moveTo(x - 0.6, y); c.lineTo(x + 0.6, y); c.lineTo(x, y + l); c.closePath(); }); if (real) ell(c, x, y + l, 0.45, 0.6, bloodFresh); };
    tooth(MX - 1.4, len);
    tooth(MX + 2.6, d >= 0.6 && !real ? len * 0.4 : len);
  };
  const teeth = (y: number) => { px(c, MX - 2, y, 5.6, 1.2, '#F3EBD3'); px(c, MX - 0.2, y, 0.4, 1.2, '#B8AE94'); px(c, MX + 1.8, y, 0.4, 1.2, '#B8AE94'); };
  const open = (o: number, w: number) => {
    const half = 2.6 + w * 1.4, h = 1 + o * 4.6;
    fill(c, lip, () => c.ellipse(MX + 0.4, MY + h / 2 - 0.6, half + 0.7, h / 2 + 0.7, 0, 0, Math.PI * 2));
    fill(c, dark, () => c.ellipse(MX + 0.4, MY + h / 2 - 0.6, half, h / 2, 0, 0, Math.PI * 2));
    if (o > 0.35) ell(c, MX + 0.6, MY + h - 1.2, half * 0.6, Math.min(1.3, h * 0.25), tongue);
    if (fangs) fangsAt(MY - 0.6, Math.min(3.2, 1.6 + h * 0.4)); else teeth(MY - 0.5);
  };
  switch (face) {
    case 'whine': case 'panic':
      if (v.o < 0.08 && face === 'whine') { line(c, [MX - 2.6, MY + 1, MX + 3.6, MY + 0.8], 0.9, lip); if (fangs) fangsAt(MY + 0.6, 2.4); }
      else open(face === 'panic' ? Math.max(0.6, v.o) : v.o, v.w + (face === 'panic' ? 0.3 : 0));
      break;
    case 'chomp': {
      // (the jaw going: open, shut on him, open)
      const k = Math.abs(Math.sin(f * 0.5));
      open(k, 0.6);
      break;
    }
    case 'yelp': open(0.85 + Math.sin(f * 0.8) * 0.1, 0.3); break;
    case 'queasy':
      // (lips clamped on it in a pucker, the fang tips over the bottom one, a bead of drool)
      fill(c, lip, () => c.ellipse(MX + 1, MY + 1, 2.2, 1.5, 0, 0, Math.PI * 2));
      fill(c, dark, () => c.ellipse(MX + 1.2, MY + 1.1, 1, 0.5, 0, 0, Math.PI * 2));
      if (fangs) { px(c, MX - 0.4, MY + 1.6, 0.6, 1.4, '#FFF7E0'); px(c, MX + 2.4, MY + 1.6, 0.6, 1.4, '#FFF7E0'); }
      { const t = (f % 70) / 70; px(c, MX + 2.4, MY + 2.4 + t * 4, 0.7, 1.2, 'rgba(191, 219, 254, 0.8)'); }
      break;
    case 'spew': open(1, 1); fill(c, bloodFresh, () => c.ellipse(MX + 1.4, MY + 2.6, 2.6, 2.4, 0, 0, Math.PI * 2)); break;
    case 'strain':
      // (teeth gritted, lips pulled back)
      fill(c, dark, () => c.roundRect(MX - 3, MY + 0.2, 6.6, 2.4, 1));
      if (fangs) fangsAt(MY + 0.4, 2.2); else { px(c, MX - 2.6, MY + 0.5, 5.8, 1.8, '#F3EBD3'); }
      break;
    case 'grit':
      fill(c, dark, () => c.roundRect(MX - 3.2, MY + 0.2, 7, 3, 1));
      if (fangs) fangsAt(MY + 0.2, 3); else { px(c, MX - 2.8, MY + 0.5, 6.4, 2.4, '#F3EBD3'); for (let x = MX - 1.6; x < MX + 3; x += 1.5) px(c, x, MY + 0.5, 0.4, 2.4, 'rgba(0,0,0,0.45)'); }
      break;
    case 'leer':
      // (the evil grin he's been practicing: the corners up, the fangs over the lip)
      fill(c, dark, () => { c.moveTo(MX - 3.4, MY); c.quadraticCurveTo(MX + 0.6, MY + 3.4, MX + 4.6, MY - 0.6); c.quadraticCurveTo(MX + 0.6, MY + 1.2, MX - 3.4, MY); c.closePath(); });
      if (fangs) fangsAt(MY + 0.2, 3); else teeth(MY + 0.6);
      break;
    case 'dazed':
      open(0.45, 0.2);
      fill(c, tongue, () => c.ellipse(MX + 3, MY + 3.6, 1.4, 2.4, -0.5, 0, Math.PI * 2));
      { const t = (f % 60) / 60; px(c, MX + 3.6, MY + 5 + t * 5, 0.8, 1.6, 'rgba(191, 219, 254, 0.85)'); }
      break;
    case 'dead':
      open(0.5, 0.1);
      fill(c, tongue, () => c.ellipse(MX + 3.4, MY + 4, 1.5, 3, -0.6, 0, Math.PI * 2));
      break;
    default:
      // (smug: a little smirk, the lip curled)
      line(c, [MX - 2.8, MY + 1.2, MX, MY + 1.8, MX + 3, MY + 1, MX + 4.4, MY - 0.2], 0.9, lip);
      if (fangs) fangsAt(MY + 0.8, 2.6);
  }
  if (d >= 0.85) ell(c, MX + 0.6, MY + 3.4, 2.6, 1, '#B4403E');
};

const faceBlood = (c: Ctx, d: number, f: number) => {
  if (d < 0.1) return;
  if (d >= 0.2) cut(c, 7, 0, 10, -1);                                   // a cut on the cheek
  if (d >= 0.3) drip(c, 9, 5.6, d >= 0.5 ? 8 : 3);                       // the nosebleed, into the mustache and past it
  if (d >= 0.45) { cut(c, FAR_EYE - 2.4, EYE_Y - 5, FAR_EYE + 1.6, EYE_Y - 5.6); drip(c, FAR_EYE - 1.4, EYE_Y - 4.6, d >= 0.6 ? 9 : 4); }
  if (d >= 0.7) { smear(c, 1, -11, 5, 2); drip(c, 0, -10.6, 7); drip(c, 2.6, -10.6, 4.6); }  // the scalp gash
  if (d >= 0.85) for (let i = 0; i < 9; i++) px(c, -7 + ((i * 5.3) % 17), -6 + ((i * 3.7) % 16), 1, 1, bloodFresh);
  if (d >= 0.5) { const t = (f % 40) / 40; if (t < 0.7) ell(c, 4, 15.6 + t * 10, 0.8, 1.2, bloodFresh); }
};

const sweat = (c: Ctx, face: Face, f: number, d: number, wig: boolean) => {
  const drop = (x: number, y: number) => { ell(c, x, y, 0.8, 1.2, '#7DD3FC'); px(c, x - 0.3, y - 0.6, 0.4, 0.4, '#F0F9FF'); };
  // (beads on the dome, the lip)
  if (!wig) for (const [bx, by] of [[-3, -12], [2, -13.4], [6, -10.6]]) { ell(c, bx, by, 0.6, 0.6, 'rgba(240, 249, 255, 0.85)'); }
  px(c, 4, 6.2, 0.6, 0.6, 'rgba(240, 249, 255, 0.85)'); px(c, 10, 6.4, 0.6, 0.6, 'rgba(240, 249, 255, 0.85)');
  const t = ((f + 10) % 80) / 80;
  drop(10.4, -6 + t * 9);
  if (face === 'panic' || face === 'yelp' || face === 'strain' || face === 'grit' || d > 0.4) {
    const k = (f % 22) / 22; drop(-9, -6 + k * 8); drop(3, -9 + ((f + 11) % 22) / 22 * 9);
    for (const s of [-1, 1]) { const q = ((f + (s > 0 ? 0 : 9)) % 16) / 16; drop(s * (12 + q * 6), -12 - q * 4 + q * q * 8); }
  }
};

/**
 * The wig: shiny black nylon, slicked back, a point down onto the forehead at the front, the back of it down over his
 * nape; too small and on crooked; the price tag still hanging off the back on its string. (x, y): where it sits (its
 * middle, the head's unit space), `s` its size, `tilt` how crooked.
 */
const drawWigShape = (c: Ctx, x: number, y: number, s: number, tilt: number, f: number) => {
  c.save(); c.translate(x, y); c.rotate(tilt); c.scale(s, s);
  const path = () => {
    c.moveTo(-11.6, 9); c.quadraticCurveTo(-13, -1, -8.6, -6.4); c.quadraticCurveTo(-2, -10.2, 5, -8.8);
    c.quadraticCurveTo(9.6, -7.4, 10.2, -3.6); c.lineTo(9.4, -1.4); c.lineTo(8, -3.2);
    // (the point, down onto his forehead)
    c.lineTo(6.2, 1.6); c.lineTo(4.4, -3.4); c.quadraticCurveTo(-1.6, -4.4, -6, 0.2); c.lineTo(-7.6, 6);
    c.lineTo(-9.4, 10.6); c.closePath();
  };
  shape(c, path, WIG, -13.4, 11, 0.8);
  // (the shine: nylon, blue-white streaks swept back; the comb lines)
  c.save(); c.beginPath(); path(); c.clip();
  line(c, [7, -6.6, 0, -8.8, -7, -6], 1.2, WIG[0]); line(c, [6, -5, -1, -6.4, -8.6, -2.6], 0.6, '#4A5068');
  for (let i = 0; i < 4; i++) line(c, [9 - i * 1.4, -4 + i * 1.4, 1 - i * 2, -5 + i * 2.4, -9 - i * 0.6, 1 + i * 2], 0.4, WIG[3]);
  c.restore();
  // (the mesh showing at the edge, cheap; a stray hank out the side)
  line(c, [-7.4, 5.6, -6.2, 0.8, -1.6, -3.2], 0.4, '#3F3F46');
  line(c, [-11, 6, -13.4, 9.6, -12.4, 12], 0.6, WIG[2]);
  // (the price tag, on its string off the back, swinging)
  const sw = Math.sin(f * 0.09) * 0.25;
  c.save(); c.translate(-11, 0); c.rotate(0.6 + sw);
  line(c, [0, 0, 0, 5], 0.4, '#E5E7EB');
  px(c, -2.2, 5, 4.4, 3, '#F5F5F4'); px(c, -2.2, 5, 4.4, 0.6, '#A8A29E');
  px(c, -1.6, 6, 0.6, 1.2, '#DC2626'); px(c, -0.6, 6, 0.6, 1.2, '#DC2626'); px(c, 0.4, 6.6, 0.4, 0.6, '#DC2626'); px(c, 1, 6, 0.6, 1.2, '#DC2626');
  c.restore();
  c.restore();
};

/** The wig on its own (lying on the floor, knocked off; on its foam head in the control room). World/screen space. */
export const drawLooseWig = (c: Ctx, x: number, y: number, frame: number, scale = 1, tilt = 0) => {
  drawWigShape(c, x, y, HS * scale, tilt, frame);
};

/** The plastic fangs on their own (fallen out, bouncing about the floor). */
export const drawLooseFangs = (c: Ctx, x: number, y: number, rot = 0) => {
  c.save(); c.translate(x, y); c.rotate(rot);
  fill(c, '#9D174D', () => c.ellipse(0, 0, 4.2, 1.8, 0, 0, Math.PI * 2));
  fill(c, '#F472B6', () => c.ellipse(0, -0.2, 3.8, 1.4, 0, 0, Math.PI * 2));
  for (const fx of [-2.4, 2]) { fill(c, '#FFFFFF', () => { c.moveTo(fx - 0.8, 0.6); c.lineTo(fx + 0.8, 0.6); c.lineTo(fx, 4); c.closePath(); }); }
  c.restore();
};
