// PIPER THE PIXIE, drawn (Fairy Land's boss: everybody draws her from here). Drawn at Meathead 1's boss grade, on par
// with Tucker, Donnie and Artie: color ramps (light, base, shade, deep, line) in stepped bands with a dithered seam
// between them, every material its own darkest tone for an outline.
//
// The joke (the user's): all land long she's a SULTRY VOICE over the park's PA; at the end the door's kicked in and she's
// MORBIDLY OBESE. A pixie the size of a hot tub: a hot-pink satin gown, sequined, straining at every seam (one's split
// up her thigh, another under the arm), her belly in rolls under it, arms with wings of their own, three chins, ankles
// spilling over little glass heels; a towering platinum beehive with a gold tiara jammed in it, false lashes, blue
// eyeshadow to the brows, a beauty mark, a red pout; a gold star wand; and on her back a pair of gossamer pixie wings
// far too small to lift her (they buzz like mad when she's angry, and nothing happens). Glitter comes off her.
//
// Her sin is LUST (the user's), but not for sex: for being FOUGHT OVER. She lures the suitors with the promise of
// herself and gets her kicks watching men kill each other for her (the trials are her bloodsport). So her poses:
// lounging and watching (a chaise, a bonbon), gloating (hands clasped under her chins, delighted, savoring it), the
// sultry talk, and ENRAGED (insulted: red to the roots, the beehive coming down, fists up, the wings buzzing).
//
// drawPiper(c, x, feetY, facing, frame, pose, opts): her feet's point (world or screen), facing 1 right / -1 left.
// drawPiperCloseup(c, cx, cy, scale, frame, opts): her face at close-up size (a portrait: the reveal, the insult's
// reaction, the fight's taunts).

type Ctx = CanvasRenderingContext2D;

export type PiperPose =
  | 'stand'    // weight on one hip, the wand hand on it, the other hand toying with her hair
  | 'talk'     // purring: the wand hand out, waving it slowly, the other on her hip
  | 'gloat'    // watching men die for her: both hands clasped under her chins, up on her toes, delighted
  | 'lounge'   // sprawled on her side on her heart-shaped chaise, head propped on a hand, a bonbon in the other
  | 'enraged'  // insulted: fists up and shaking, stamping, the beehive coming loose, the wings buzzing
  | 'point'    // jabbing the wand at somebody (a curse, an order)
  | 'hurt'     // hit: reeling, the jiggle going through her
  | 'flat';    // down: on her back, a mountain range of pink, the wings crumpled, the wand rolled away
export type PiperFace = 'sultry' | 'talk' | 'gloat' | 'rage' | 'shock' | 'hurt' | 'out';

export interface PiperOpts {
  /** Talking: her mouth goes (shapes off the frame count). */
  talking?: boolean;
  /** Her face, if not the pose's own. */
  face?: PiperFace;
  /** (lounge) the chaise drawn under her (default yes). */
  chaise?: boolean;
  /** How far her beehive's come down (0 up .. 1 a wreck): the fight's damage, the rage. */
  mess?: number;
}

/** How tall she is (feet to the top of her beehive), for words over her; how wide. */
export const PIPER_H = 176;
export const PIPER_W = 118;

// ---------------------------------------------------------------------------------------------------------------
// Ramps: light, base, shade, deep, line

type Ramp = readonly [string, string, string, string, string];
const SKIN: Ramp = ['#FFEADC', '#F8CDB4', '#E8A68C', '#C47E6A', '#6E3A30'];
const RAGE: Ramp = ['#FFB4A0', '#F47A6A', '#D8524C', '#AE3638', '#5A1418'];
const BLUSH = '#F49AA0';
const GOWN: Ramp = ['#FFB6DE', '#F45AAE', '#D23488', '#A01E64', '#4E0830'];
const SATIN_HI = '#FFE4F4';
const HAIR: Ramp = ['#FFFCEC', '#F6E8B0', '#DCC67E', '#B09A54', '#5A4A1E'];
const GOLD: Ramp = ['#FFF8C4', '#F6D24E', '#D0A02C', '#946E16', '#4A3608'];
const WING: Ramp = ['#F8F4FF', '#DCD0FF', '#B8A4F0', '#8A74D0', '#4A3A8A'];
const SHOE: Ramp = ['#FFFFFF', '#D8F4FF', '#A8DCF4', '#78B4D8', '#2A4A6A'];
const LIPS = '#D21E4A', LIPS_HI = '#FF7090', SHADOW_EYE = '#5A8AE8', LASH = '#120A10';
const CHAISE: Ramp = ['#FFD0E8', '#E880B8', '#C0508E', '#8E2E66', '#3E0C2A'];

// ---------------------------------------------------------------------------------------------------------------
// Painting helpers

const dithers = new Map<string, CanvasPattern | string>();
/** A 2x2 checker of a color (the dither between two bands of a ramp), made the once per color. */
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
/** A shape in its ramp: the base, a lit band down its left, a shade band then a deep one down its right (stepped, a
 *  dithered seam between each), outlined in its line tone. */
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
/** A shape lit from above (a roll of belly, a chin): lit across its top, shaded across its bottom. */
const shapeTop = (c: Ctx, path: () => void, r: Ramp, y0: number, y1: number, lw = 1) => {
  c.beginPath(); path(); c.fillStyle = r[1]; c.fill();
  c.save(); c.clip();
  const h = y1 - y0;
  c.fillStyle = r[0]; c.fillRect(-999, y0 - 4, 1998, h * 0.2 + 4);
  c.fillStyle = dith(c, r[0]); c.fillRect(-999, y0 + h * 0.2, 1998, Math.max(1, h * 0.08));
  c.fillStyle = dith(c, r[2]); c.fillRect(-999, y0 + h * 0.6, 1998, Math.max(1, h * 0.08));
  c.fillStyle = r[2]; c.fillRect(-999, y0 + h * 0.68, 1998, h + 4);
  c.fillStyle = r[3]; c.fillRect(-999, y0 + h * 0.88, 1998, h + 4);
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
/** A fat limb (an upper arm with its own wing of flab, a calf): a tapered tube from (x1, y1) r1 to (x2, y2) r2, in its
 *  ramp, `sag` the flab hanging off its underside. */
const fatLimb = (c: Ctx, x1: number, y1: number, r1: number, x2: number, y2: number, r2: number, r: Ramp, sag = 0) => {
  const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
  const s = ny > 0 ? 1 : -1;
  const path = () => {
    c.moveTo(x1 + nx * r1, y1 + ny * r1);
    c.lineTo(x2 + nx * r2, y2 + ny * r2);
    c.arc(x2, y2, r2, Math.atan2(ny, nx), Math.atan2(-ny, -nx));
    c.quadraticCurveTo((x1 + x2) / 2 - nx * (r1 + sag) * s, (y1 + y2) / 2 - ny * (r1 + sag) * s + sag, x1 - nx * r1, y1 - ny * r1);
    c.arc(x1, y1, r1, Math.atan2(-ny, -nx), Math.atan2(ny, nx));
  };
  shape(c, path, r, Math.min(x1, x2) - Math.max(r1, r2), Math.max(x1, x2) + Math.max(r1, r2));
};
/** A star (the wand's, the glitter's). */
const star = (c: Ctx, x: number, y: number, r: number, col: string, rot = 0) => fill(c, col, () => {
  for (let i = 0; i < 10; i++) { const a = rot - Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; i ? c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : c.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  c.closePath();
});
const sparkle = (c: Ctx, x: number, y: number, s: number, col: string) => { px(c, x - 0.5, y - s, 1, s * 2 + 1, col); px(c, x - s, y - 0.5, s * 2 + 1, 1, col); };

// ---------------------------------------------------------------------------------------------------------------
// Her parts (all facing right, about her feet; a frame's `j` is the jiggle (0..1) going through her)

/** The wings: little gossamer things on her back (`buzz`: blurred, beating; `crumple`: bent, down). */
const wings = (c: Ctx, x: number, y: number, f: number, buzz: boolean, crumple = false) => {
  const beat = buzz ? Math.sin(f * 2.2) * 0.5 : Math.sin(f * 0.08) * 0.08;
  for (const [k, sc] of [[0, 1], [1, 0.8]] as const) {
    c.save(); c.translate(x - k * 4, y + k * 6); c.rotate(-0.5 - beat - k * 0.3 + (crumple ? 1.1 : 0)); c.scale(sc, sc);
    c.globalAlpha = buzz ? 0.55 : 0.85;
    const path = () => { c.moveTo(0, 0); c.bezierCurveTo(-8, -18, -26, -26, -30, -12); c.bezierCurveTo(-30, -2, -14, 4, 0, 0); };
    shape(c, path, WING, -30, 0);
    c.globalAlpha = 1;
    // (the veins, and a glint)
    line(c, [0, 0, -18, -14, -26, -14], 0.7, WING[3]); line(c, [-8, -4, -20, -4], 0.6, WING[3]);
    px(c, -22, -18, 2, 1, '#FFFFFF');
    c.restore();
  }
  if (buzz) for (let i = 0; i < 3; i++) line(c, [x - 34 - i * 4, y - 24 + i * 8, x - 40 - i * 4, y - 22 + i * 8], 1, '#FFFFFF');
};

/** The heels: little glass slippers, the ankles spilling over them. */
const foot = (c: Ctx, x: number, y: number, near: boolean) => {
  const r = near ? SHOE : ([SHOE[1], SHOE[2], SHOE[3], SHOE[3], SHOE[4]] as const);
  shape(c, () => { c.moveTo(x - 6, y); c.lineTo(x - 6, y - 5); c.quadraticCurveTo(x + 2, y - 8, x + 12, y - 3); c.lineTo(x + 12, y); c.closePath(); }, r, x - 6, x + 12, 0.8);
  px(c, x - 6, y - 1, 2, 4, r[3]);
  px(c, x - 2, y - 6, 4, 1, '#FFFFFF');
  // (the ankle spilling over the top)
  shapeTop(c, () => c.ellipse(x + 2, y - 8, 8, 4, 0, 0, Math.PI * 2), near ? SKIN : ([SKIN[1], SKIN[2], SKIN[3], SKIN[3], SKIN[4]] as const), y - 12, y - 4, 0.8);
};

/** The beehive: platinum, towering, the tiara jammed in its front (`mess` brings it down in loose loops). */
const beehive = (c: Ctx, hx: number, hy: number, mess: number, f: number) => {
  const tilt = mess * 0.5;
  c.save(); c.translate(hx, hy - 10); c.rotate(-tilt * 0.6);
  const path = () => { c.moveTo(-17, 6); c.bezierCurveTo(-24, -14, -20, -46 + mess * 20, -2, -52 + mess * 22); c.bezierCurveTo(16, -54 + mess * 22, 24, -30, 18, 4); c.closePath(); };
  shape(c, path, HAIR, -24, 24);
  // (the swirl lines of the backcombing)
  for (let k = 0; k < 4; k++) { c.strokeStyle = HAIR[3]; c.lineWidth = 0.8; c.beginPath(); c.arc(0, -16 - k * 8 + mess * 10, 14 - k * 2, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
  px(c, -10, -40 + mess * 20, 6, 2, HAIR[0]);
  // (loose loops falling out of it, the worse it's got)
  if (mess > 0.2) for (let k = 0; k < Math.round(mess * 5); k++) { c.strokeStyle = HAIR[2]; c.lineWidth = 1.4; c.beginPath(); c.arc(-14 + k * 7, 2 + (k % 2) * 6, 5, 0, Math.PI * 1.6); c.stroke(); }
  // (the tiara, jammed in the front of it: gold, three points, a pink heart stone)
  c.save(); c.translate(6, -2); c.rotate(0.15 + mess * 0.6);
  shape(c, () => { c.moveTo(-10, 0); c.lineTo(-10, -6); c.lineTo(-6, -3); c.lineTo(-2, -11); c.lineTo(2, -3); c.lineTo(6, -7); c.lineTo(8, 0); c.closePath(); }, GOLD, -10, 8, 0.8);
  ell(c, -2, -4, 2, 2, '#F43F8E'); px(c, -3, -5, 1, 1, '#FFFFFF');
  c.restore();
  c.restore();
  // (glitter coming off it)
  if (f % 18 < 9) sparkle(c, hx + 14 - (f % 7), hy - 50 + (f % 11), 1.5, '#FFFFFF');
};

/** Her head: a round face in a ring of chins, the beauty mark, the lashes and the eyeshadow, the pout; `face` the look,
 *  `talking` the mouth going. (hx, hy) the middle of her face. */
const head = (c: Ctx, hx: number, hy: number, face: PiperFace, f: number, talking: boolean, mess: number) => {
  const sk = face === 'rage' ? RAGE : SKIN;
  // (the chins: three rolls, under and round the jaw)
  for (let k = 2; k >= 0; k--) shapeTop(c, () => c.ellipse(hx + 2, hy + 12 + k * 6, 16 + k * 2, 7, 0, 0, Math.PI * 2), sk, hy + 5 + k * 6, hy + 19 + k * 6, 0.9);
  // (the face itself: round, the cheeks puffing out)
  shape(c, () => c.ellipse(hx, hy, 17, 16, 0, 0, Math.PI * 2), sk, hx - 17, hx + 17);
  ell(c, hx + 9, hy + 5, 5, 3, face === 'rage' ? '#E83A3A' : BLUSH);
  ell(c, hx - 7, hy + 5, 4, 2.5, face === 'rage' ? '#E83A3A' : BLUSH);
  // (the eyes: the eyeshadow up to the brows, the lashes, the irises (bulging when she's furious))
  const eye = (ex: number, near: boolean) => {
    const sh = face === 'rage' ? '#3A5AC8' : SHADOW_EYE;
    ell(c, ex, hy - 4, near ? 5 : 4, 4, sh);
    if (face === 'out') { line(c, [ex - 3, hy - 6, ex + 3, hy - 2], 1.2, LASH); line(c, [ex - 3, hy - 2, ex + 3, hy - 6], 1.2, LASH); return; }
    const shut = face === 'hurt' || (face === 'sultry' && f % 200 < 8);
    if (shut) { line(c, [ex - 4, hy - 3, ex + 4, hy - 3], 1.4, LASH); return; }
    const bulge = face === 'rage' || face === 'shock' ? 1.3 : 1;
    const lid = face === 'sultry' || face === 'gloat' ? 1.6 : 0;
    ell(c, ex, hy - 3, 3.4 * bulge, 3 * bulge, '#FFFFFF');
    ell(c, ex + 1, hy - 3 + lid * 0.4, 1.8, 2, face === 'rage' ? '#7A1E1E' : '#2A6A4A');
    px(c, ex + 1, hy - 4, 1, 1, '#FFFFFF');
    if (lid) px(c, ex - 4, hy - 7, 8, lid + 2, sh);
    // (the lashes: three long false ones)
    for (let k = -1; k <= 1; k++) line(c, [ex + k * 2, hy - 6 + lid, ex + k * 3 + 1, hy - 10 + lid], 1, LASH);
  };
  eye(hx + 7, true); eye(hx - 5, false);
  // (the brows: drawn on, arched; down in a V when she's furious)
  if (face === 'rage') { line(c, [hx + 2, hy - 9, hx + 11, hy - 13], 1.6, HAIR[4]); line(c, [hx - 1, hy - 9, hx - 9, hy - 12], 1.6, HAIR[4]); }
  else { line(c, [hx + 3, hy - 11, hx + 8, hy - 13, hx + 12, hy - 11], 1.2, HAIR[4]); line(c, [hx - 2, hy - 11, hx - 6, hy - 12, hx - 9, hy - 10], 1.2, HAIR[4]); }
  // (the button nose, the beauty mark)
  ell(c, hx + 4, hy + 2, 2.4, 2, sk[2]); px(c, hx + 3, hy + 1, 1, 1, sk[0]);
  ell(c, hx + 12, hy + 8, 1, 1, '#3A1A1A');
  // (the mouth)
  const mx = hx + 3, my = hy + 9;
  const open = talking ? [0, 2, 4, 1][Math.floor(f / 5) % 4] : 0;
  if (face === 'rage' || face === 'shock') {
    const h = face === 'rage' ? 7 + open : 5;
    ell(c, mx, my + h / 2, 6, h / 2 + 1, '#3A0A14'); px(c, mx - 5, my, 10, 2, '#FFFFFF'); ell(c, mx, my + h - 1, 3, 1.4, '#E8607A');
    line(c, [mx - 6, my - 1, mx + 6, my - 1], 1.4, LIPS);
  } else if (face === 'gloat') {
    // (a grin, delighted, her tongue at her teeth)
    fill(c, LIPS, () => { c.moveTo(mx - 7, my); c.quadraticCurveTo(mx, my + 7, mx + 7, my - 1); c.quadraticCurveTo(mx, my + 3, mx - 7, my); });
    px(c, mx - 4, my + 1, 8, 2, '#FFFFFF');
  } else if (face === 'out' || face === 'hurt') { ell(c, mx, my + 1, 3, 2.4, '#3A0A14'); line(c, [mx - 4, my - 1, mx + 4, my - 1], 1.2, LIPS); }
  else {
    // (the pout: full red lips, a highlight; parted when she talks)
    ell(c, mx, my, 5.5, 2.2 + open * 0.3, LIPS); ell(c, mx, my + 2.4 + open * 0.6, 5, 2.4, LIPS);
    if (open) ell(c, mx, my + 1.2 + open * 0.3, 3.2, open * 0.6, '#3A0A14');
    px(c, mx - 2, my - 1, 3, 1, LIPS_HI);
  }
  // (her earrings: gold hoops)
  c.strokeStyle = GOLD[2]; c.lineWidth = 1.2; c.beginPath(); c.arc(hx - 15, hy + 8, 3, 0, Math.PI * 2); c.stroke();
  void mess;
};

/** The body: the gown (bodycon pink satin, sequined, straining: the seams, a split up her thigh), the rolls under it,
 *  the chest, the shoulders. `j` the jiggle. Feet at 0, hips about y -44. */
const body = (c: Ctx, j: number, f: number) => {
  const jig = Math.sin(j * Math.PI * 6) * 2 * (1 - j);
  // (the gown's hem, flaring a little at her shins)
  const path = () => {
    c.moveTo(-34, -18); c.quadraticCurveTo(-58 - jig, -50, -50, -82); c.quadraticCurveTo(-46, -106, -30, -114);
    c.lineTo(34, -114); c.quadraticCurveTo(56, -104, 60 + jig, -76); c.quadraticCurveTo(66 + jig, -46, 40, -18); c.closePath();
  };
  shape(c, path, GOWN, -58, 66, 1.4);
  // (the rolls of belly under the satin: three soft ridges, lit along their tops, shaded under)
  for (let k = 0; k < 3; k++) {
    const y = -86 + k * 16 + jig * (k + 1) * 0.5, w = 52 - k * 4;
    c.save(); c.beginPath(); path(); c.clip();
    shapeTop(c, () => c.ellipse(8, y, w, 9, 0, 0, Math.PI * 2), GOWN, y - 9, y + 9, 0.8);
    px(c, -30 + k * 6, y - 7, 18, 1, SATIN_HI);
    c.restore();
  }
  // (the seams, straining: stitches pulled into ladders; one split up her near thigh, skin in it)
  line(c, [44, -114, 58, -78, 46, -26], 0.8, GOWN[4]);
  for (let y = -104; y < -34; y += 6) line(c, [52 - (y + 80) * 0.05, y, 56 - (y + 80) * 0.05, y + 2], 0.6, GOWN[0]);
  fill(c, SKIN[4], () => { c.moveTo(24, -18); c.lineTo(30, -46); c.lineTo(38, -18); c.closePath(); });
  fill(c, SKIN[1], () => { c.moveTo(25, -19); c.lineTo(30, -44); c.lineTo(36, -19); c.closePath(); });
  // (the sequins: a scatter that twinkles in turn)
  for (let i = 0; i < 16; i++) {
    const sx = -40 + ((i * 37) % 96), sy = -104 + ((i * 53) % 82);
    const on = (f + i * 9) % 48 < 6;
    px(c, sx, sy, 1, 1, on ? '#FFFFFF' : GOWN[0]);
    if (on) sparkle(c, sx, sy, 1.5, '#FFFFFF');
  }
  // (the chest: the neckline, cleavage like a canyon, the straps biting into her shoulders)
  shapeTop(c, () => { c.moveTo(-26, -112); c.quadraticCurveTo(-10, -122, 4, -114); c.quadraticCurveTo(18, -124, 36, -112); c.quadraticCurveTo(14, -106, 4, -110); c.quadraticCurveTo(-10, -104, -26, -112); }, SKIN, -124, -104, 1);
  line(c, [4, -114, 4, -108], 1, SKIN[3]);
  for (const sx of [-24, 30]) line(c, [sx, -126, sx + 2, -112], 2, GOWN[2]);
};

/** An arm: the upper arm fat with a wing hanging off it, the forearm, the hand (a fist, open, holding the wand, at the
 *  chin). From the shoulder (sx, sy) to the hand (hx, hy). */
const armTo = (c: Ctx, sx: number, sy: number, hx: number, hy: number, near: boolean, hand: 'open' | 'fist' | 'wand' | 'clasp' | 'bonbon', f: number, enraged: boolean) => {
  const sk = enraged ? RAGE : SKIN, r = near ? sk : ([sk[1], sk[2], sk[3], sk[3], sk[4]] as const);
  const ex = (sx + hx) / 2 + (near ? 6 : -6), ey = (sy + hy) / 2 + 10;
  fatLimb(c, sx, sy, 10, ex, ey, 8, r, 7);
  fatLimb(c, ex, ey, 8, hx, hy, 5.5, r, 2);
  // (the hand)
  if (hand === 'fist') { shape(c, () => c.ellipse(hx, hy, 6.5, 6, 0, 0, Math.PI * 2), r, hx - 7, hx + 7); line(c, [hx - 2, hy - 3, hx - 2, hy + 3], 0.8, r[3]); line(c, [hx + 2, hy - 3, hx + 2, hy + 3], 0.8, r[3]); }
  else { shape(c, () => c.ellipse(hx, hy, 6, 5, 0, 0, Math.PI * 2), r, hx - 6, hx + 6); for (let k = -1; k <= 1; k++) fill(c, r[1], () => c.ellipse(hx + 6, hy + k * 2.4, 3, 1.3, 0, 0, Math.PI * 2)); px(c, hx + 7, hy - 3, 2, 1, LIPS); }
  // (the rings: gold, a pink stone)
  px(c, hx + 2, hy - 1, 2, 3, GOLD[1]); px(c, hx + 2, hy - 1, 1, 1, '#F43F8E');
  if (hand === 'wand') {
    line(c, [hx, hy, hx + 22, hy - 26], 2.6, GOLD[4]); line(c, [hx, hy, hx + 22, hy - 26], 1.6, GOLD[1]);
    star(c, hx + 24, hy - 29, 7.5, GOLD[4], f * 0.03); star(c, hx + 24, hy - 29, 6, GOLD[1], f * 0.03); star(c, hx + 23, hy - 30, 2.6, GOLD[0], f * 0.03);
    if (f % 20 < 10) sparkle(c, hx + 30 + (f % 6), hy - 36 - (f % 5), 2, '#FFFFFF');
  }
  if (hand === 'bonbon') { ell(c, hx + 5, hy - 5, 4, 4, '#5A2A12'); px(c, hx + 3, hy - 8, 3, 1, '#F6D365'); }
};

/** The legs: thick, the knees dimpled, the calves (hidden by the gown down to the shins), the ankles, the heels. */
const legs = (c: Ctx, step: number) => {
  for (const [lx, near] of [[-18, false], [22, true]] as const) {
    const lift = near ? Math.max(0, step) * 4 : Math.max(0, -step) * 4;
    const r = near ? SKIN : ([SKIN[1], SKIN[2], SKIN[3], SKIN[3], SKIN[4]] as const);
    shape(c, () => { c.moveTo(lx - 12, -22); c.quadraticCurveTo(lx - 14, -12 - lift, lx - 4, -8 - lift); c.lineTo(lx + 8, -8 - lift); c.quadraticCurveTo(lx + 16, -14 - lift, lx + 12, -22); c.closePath(); }, r, lx - 14, lx + 16);
    foot(c, lx - 2, -lift, near);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The figure

const FACES: Record<PiperPose, PiperFace> = { stand: 'sultry', talk: 'talk', gloat: 'gloat', lounge: 'sultry', enraged: 'rage', point: 'talk', hurt: 'hurt', flat: 'out' };

/** Her, whole, in a pose. */
export const drawPiper = (c: Ctx, x: number, feetY: number, facing: 1 | -1, f: number, pose: PiperPose, opts: PiperOpts = {}) => {
  const face = opts.face ?? FACES[pose];
  const enraged = pose === 'enraged';
  const mess = Math.max(opts.mess ?? 0, enraged ? 0.35 : 0);
  const talking = !!opts.talking;
  c.save(); c.translate(Math.round(x), Math.round(feetY)); c.scale(facing, 1);
  if (pose === 'lounge') { lounge(c, f, face, talking, mess, opts.chaise !== false); c.restore(); return; }
  if (pose === 'flat') { flat(c, f); c.restore(); return; }
  // (the jiggle: going through her as she stamps, as she's hit; a breath otherwise)
  const j = enraged ? (f % 16) / 16 : pose === 'hurt' ? (f % 24) / 24 : 0;
  const breathe = Math.sin(f * 0.06) * 1;
  const stamp = enraged ? (Math.floor(f / 8) % 2 ? 1 : -1) : pose === 'gloat' ? 0.5 + Math.sin(f * 0.2) * 0.5 : 0;
  const shake = enraged ? (f % 4 < 2 ? 1 : -1) : 0;
  const lean = pose === 'hurt' ? -0.12 : 0;
  c.translate(shake, pose === 'gloat' ? -Math.abs(stamp) * 3 : 0); c.rotate(lean);
  // the wings, behind her
  wings(c, -30, -112, f, enraged || pose === 'gloat');
  // the far arm, behind her
  const sh = -114 + breathe;
  const farHand: [number, number, 'open' | 'fist' | 'wand' | 'clasp' | 'bonbon'] =
    enraged ? [-38, -150 + (f % 8 < 4 ? 0 : 6), 'fist'] : pose === 'gloat' ? [-4, -112, 'clasp'] : pose === 'talk' || pose === 'point' ? [-48, -70, 'open'] : [-26, -150, 'open'];
  armTo(c, -34, sh, farHand[0], farHand[1], false, farHand[2], f, enraged);
  legs(c, stamp);
  body(c, j, f);
  // the head (its beehive behind it)
  const hx = 8, hy = -138 + breathe;
  beehive(c, hx, hy - 4, mess, f);
  head(c, hx, hy, face, f, talking, mess);
  // the near arm, in front
  const nearHand: [number, number, 'open' | 'fist' | 'wand' | 'clasp' | 'bonbon'] =
    enraged ? [52, -146 - (f % 8 < 4 ? 6 : 0), 'fist']
      : pose === 'gloat' ? [12, -112, 'clasp']
        : pose === 'talk' ? [56, -96 + Math.sin(f * 0.08) * 6, 'wand']
          : pose === 'point' ? [70, -108, 'wand']
            : pose === 'hurt' ? [60, -126, 'open']
              : [50, -62, 'wand'];
  armTo(c, 38, sh, nearHand[0], nearHand[1], true, nearHand[2], f, enraged);
  // (steam off her when she's furious)
  if (enraged) for (let k = 0; k < 3; k++) { const t = (f * 2 + k * 20) % 60; c.globalAlpha = 1 - t / 60; ell(c, hx - 10 + k * 12, hy - 60 - t * 0.6, 4 + t * 0.1, 3 + t * 0.08, '#FFFFFF'); c.globalAlpha = 1; }
  c.restore();
};

/** Sprawled on her heart-shaped chaise, head propped on her hand, a bonbon; watching. */
const lounge = (c: Ctx, f: number, face: PiperFace, talking: boolean, mess: number, chaise: boolean) => {
  if (chaise) {
    // (the chaise: a pink velvet heart on gold claw feet, buttoned)
    shape(c, () => { c.moveTo(-92, -14); c.lineTo(92, -14); c.lineTo(92, -40); c.quadraticCurveTo(92, -60, 70, -62); c.lineTo(-60, -62); c.bezierCurveTo(-90, -100, -130, -70, -104, -40); c.lineTo(-92, -14); c.closePath(); }, CHAISE, -112, 92, 1.4);
    for (let i = 0; i < 6; i++) ell(c, -70 + i * 28, -36, 1.6, 1.6, CHAISE[3]);
    for (const fx of [-84, 84]) { shape(c, () => c.rect(fx - 4, -14, 8, 14), GOLD, fx - 4, fx + 4, 0.8); }
  }
  // (her, on her side along it: the hip a hill, the gown, the rolls spilling toward the cushion)
  const breathe = Math.sin(f * 0.06);
  c.save(); c.translate(0, -56);
  wings(c, -10, -46 + breathe, f, false);
  shape(c, () => { c.moveTo(-60, 4); c.quadraticCurveTo(-64, -30, -30, -42 - breathe); c.quadraticCurveTo(10, -60 - breathe, 50, -34); c.quadraticCurveTo(86, -26, 96, -4); c.lineTo(96, 6); c.closePath(); }, GOWN, -64, 96, 1.4);
  for (let k = 0; k < 3; k++) shapeTop(c, () => c.ellipse(-14 + k * 26, -8, 18, 10, 0, 0, Math.PI * 2), GOWN, -18, 2, 0.8);
  for (let i = 0; i < 10; i++) { const on = (f + i * 11) % 44 < 6; const sx = -40 + i * 12, sy = -30 + ((i * 7) % 20); px(c, sx, sy, 1, 1, on ? '#FFFFFF' : GOWN[0]); if (on) sparkle(c, sx, sy, 1.5, '#FFFFFF'); }
  // (the legs out the end, the heels crossed)
  shape(c, () => { c.moveTo(90, -6); c.lineTo(112, -4); c.lineTo(112, 4); c.lineTo(90, 6); c.closePath(); }, SKIN, 90, 112);
  foot(c, 114, 4, true);
  // (the far arm propping her head; the head; the near arm with the bonbon)
  armTo(c, -44, -30, -56, -62, false, 'open', f, false);
  beehive(c, -50, -78, mess, f);
  head(c, -50, -74, face, f, talking, mess);
  armTo(c, -28, -36, 4, -60 + Math.sin(f * 0.05) * 4, true, 'bonbon', f, false);
  c.restore();
};

/** Down: on her back, a mountain range of pink, the wings crumpled, the wand rolled off. */
const flat = (c: Ctx, f: number) => {
  wings(c, -40, -10, f, false, true);
  shape(c, () => { c.moveTo(-70, 0); c.quadraticCurveTo(-60, -40, -20, -52); c.quadraticCurveTo(20, -66, 50, -40); c.quadraticCurveTo(76, -28, 80, 0); c.closePath(); }, GOWN, -70, 80, 1.4);
  for (let k = 0; k < 3; k++) shapeTop(c, () => c.ellipse(-10 + k * 22, -40 + k * 6, 16, 8, 0, 0, Math.PI * 2), GOWN, -48 + k * 6, -32 + k * 6, 0.8);
  for (const [lx, ly] of [[78, -10], [86, -2]] as const) { shape(c, () => c.ellipse(lx, ly, 10, 6, 0.3, 0, Math.PI * 2), SKIN, lx - 10, lx + 10); foot(c, lx + 14, ly - 6, true); }
  beehive(c, -78, -14, 0.9, f);
  head(c, -78, -12, 'out', f, false, 0.9);
  star(c, 30, -2, 6, GOLD[1], 0.4);
};

// ---------------------------------------------------------------------------------------------------------------
// The close-up

/** Her face at close-up size: (cx, cy) the middle of her face, `scale` how many times her figure's size. For the
 *  reveal (the door kicked in), the insult landing, the fight's taunts. */
export const drawPiperCloseup = (c: Ctx, cx: number, cy: number, scale: number, f: number, opts: { face?: PiperFace; talking?: boolean; mess?: number; jolt?: number } = {}) => {
  const face = opts.face ?? 'sultry', mess = opts.mess ?? (face === 'rage' ? 0.35 : 0);
  const jolt = (opts.jolt ?? 0) * (f % 4 < 2 ? 1 : -1);
  c.save(); c.translate(Math.round(cx + jolt * scale), Math.round(cy)); c.scale(scale, scale);
  // (her shoulders and the gown's neckline under the chins, the wings' tips peeking up behind)
  wings(c, -30, 20, f, face === 'rage');
  shape(c, () => { c.moveTo(-56, 60); c.quadraticCurveTo(-52, 26, -24, 22); c.lineTo(28, 22); c.quadraticCurveTo(58, 26, 62, 60); c.closePath(); }, face === 'rage' ? RAGE : SKIN, -56, 62);
  shape(c, () => { c.moveTo(-50, 60); c.quadraticCurveTo(-30, 40, 4, 46); c.quadraticCurveTo(36, 40, 56, 60); c.closePath(); }, GOWN, -50, 56);
  line(c, [4, 34, 4, 46], 1, SKIN[3]);
  beehive(c, 0, -4, mess, f);
  head(c, 0, 0, face, f, !!opts.talking, mess);
  if (face === 'rage') for (let k = 0; k < 4; k++) { const a = -0.9 + k * 0.6; line(c, [Math.cos(a) * 30, -20 + Math.sin(a) * 30, Math.cos(a) * 38, -20 + Math.sin(a) * 38], 1.4, '#FFFFFF'); }
  c.restore();
};
