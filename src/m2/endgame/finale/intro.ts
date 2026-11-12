// THE KAIJU FINALE's opening (a full cutscene, skippable all or nothing; no input, no HUD; the words in the box along
// the bottom, only while they're said; nobody over anybody): the gym's scene player (intro/gym/scene.ts), its 256 x
// 144 pictures (drawn twice as fine: the big painted figures keep their detail small). The owner's: "the alien widow
// and satan are still fighting over their claim to meathead. the saucer and satan himself. they see you approach,
// glance over and see the corpses of their dead children. now they work together on a common enemy: you. the alien
// widow jumps out of her ufo and orders her minions to embiggen her, making her as massive as satan. meathead (and
// ben if all armor is found) get in the embiggen ray. you both stomp through and demolish america usa and the fight
// begins", and: "also all the bosses you kill are the children of satan and the alien widow, not just the first two
// bosses. show all their dead bodies as 'gross ups' when they both turn on meathead. rewrite some dialogue to let the
// player know as well".
//
//   standoff   the lot outside the water park at sunrise (Happy Land on the skyline, the water park's slides behind):
//              Satan up out of the asphalt to his chest (his own painting), her saucer hovering at him; the squabble
//              (her lines from her cockpit: the abduction's picture of her, the sunrise through the dome now)
//   arrive     him walking up, all five of them on a rope behind him: the kid gone flat, the brothers in their knot,
//              the lifeguard burst, Ned's empty skin
//   him        his bust, for what he says
//   the cards  five gross-ups in a fast run, each dead the way he died, named, and whose (deadGross.ts; screen space,
//              over the picture: drawIntroOver)
//   out        her saucer down on the asphalt, her out of it in her housecoat, yelling up at it
//   grow       the pink ray on her: up she goes, till she's looking Satan in the eye
//   ray        him walking into the ray (and Ben, with all eight given)
//   giant      the three (four) of them over Happy Land, AMERICA USA's gate at their shins

import type { GameState } from '../../../m1/game/core/state';
import { pickLine } from '../../../m1/game/platform/speech';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { playSound } from '../../../m1/game/platform/audio';
import { mhStandingFig } from '../../../m1/game/scenes/ending';
import { flies, stink, shatFront } from '../../../m1/game/scenes/shatLook';
import { RAMP } from '../../../m1/game/scenes/art/snes';
import { createScene, type Beat, type Scene, sfx } from '../../intro/gym/scene';
import { drawTitleMeathead, type TitleMood } from '../../title/meathead';
import { drawSaucer } from '../../space/orbit/art';
import { drawSatanFace } from '../../spooky/hell/satanArt';
import { drawBen } from '../../upgrades/confucktious/art';
import { shotWife } from '../shots';
import { warmZarblaxGross } from '../zarblaxGross';
import { satanUpper, warmSatan, drawWidowBody, drawSatanBody } from './bossArt';
import { drawDeadCard, warmDeadGross, DEAD_ORDER, type DeadKid } from './deadGross';
import { SATAN_VOICE, WIDOW_VOICE, CREW_VOICE, BEN_VOICE } from './lines';
import * as L from './introLines';

type Ctx = CanvasRenderingContext2D;
const R = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const INK = '#0B0A10';
type Dress = 'clean' | 'shitty' | 'nude';
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
/** A checker of `col` over a rect (one art pixel a square). */
const dither = (c: Ctx, x: number, y: number, w: number, h: number, col: string, phase = 0) => {
  c.fillStyle = col;
  for (let yy = 0; yy < h; yy++) for (let xx = (yy + phase) & 1; xx < w; xx += 2) c.fillRect(Math.round(x + xx), Math.round(y + yy), 1, 1);
};
/** Flat bands down a rect (`cols` top to bottom), each seam dithered. */
const bands = (c: Ctx, x: number, y: number, w: number, h: number, cols: readonly string[]) => {
  const n = cols.length, bh = h / n;
  for (let i = 0; i < n; i++) R(c, x, y + i * bh, w, Math.ceil(bh) + 1, cols[i]);
  for (let i = 1; i < n; i++) dither(c, x, Math.round(y + i * bh) - 1, w, 2, cols[i], i);
};
const poly = (c: Ctx, pts: number[], col: string, ink: string | null = INK) => {
  c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath();
  c.fillStyle = col; c.fill(); if (ink) { c.strokeStyle = ink; c.lineWidth = 1; c.stroke(); }
};
const ell = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string, ink: string | null = null) => {
  c.beginPath(); c.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, Math.PI * 2); c.fillStyle = col; c.fill(); if (ink) { c.strokeStyle = ink; c.lineWidth = 1; c.stroke(); }
};
/** A stroke along points in stepped tones (ink, base, a lit line on its top side). */
const cord = (c: Ctx, pts: number[], w: number, base: string, lit: string) => {
  c.lineCap = 'round'; c.lineJoin = 'round';
  for (const [col, lw, dy] of [[INK, w + 2, 0], [base, w, 0], [lit, Math.max(1, w * 0.35), -w * 0.25]] as [string, number, number][]) {
    c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(pts[0], pts[1] + dy); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1] + dy); c.stroke();
  }
  c.lineCap = 'butt'; c.lineJoin = 'miter';
};
const baked = new Map<string, HTMLCanvasElement>();
const bake = (key: string, w: number, h: number, paint: (g: Ctx) => void) => {
  let cv = baked.get(key);
  if (!cv) { cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d')!; g.imageSmoothingEnabled = false; paint(g); baked.set(key, cv); }
  return cv;
};

// ---------------------------------------------------------------------------------------------------------------
// The lot at sunrise (painted once)

const SKY = ['#2A3E8C', '#3A5AA8', '#5A74B4', '#8A8CB4', '#B894A4', '#DCA088', '#F2B878', '#FFD890'];
const HORIZON = 92;
/** The sunrise: banded, the sun's top over the horizon in the east (the right), its glow in stepped rings, the clouds
 *  lit pink from under. `h`: the horizon. */
const sunrise = (g: Ctx, h: number, sunX: number) => {
  bands(g, 0, 0, 256, h, SKY);
  for (const [r, col] of [[46, 'rgba(255, 216, 144, 0.16)'], [32, 'rgba(255, 224, 160, 0.2)'], [21, 'rgba(255, 236, 190, 0.3)']] as const) { g.fillStyle = col; g.beginPath(); g.arc(sunX, h, r, Math.PI, 0); g.fill(); }
  g.fillStyle = '#FFF0C0'; g.beginPath(); g.arc(sunX, h, 13, Math.PI, 0); g.fill();
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(sunX, h, 9, Math.PI, 0); g.fill();
  for (const [x, y, w] of [[18, 14, 46], [96, 26, 60], [170, 10, 40], [40, 44, 34], [140, 52, 52], [214, 36, 36]] as const) {
    R(g, x, y, w, 3, '#7A84B8'); R(g, x + 5, y - 2, w - 14, 2, '#7A84B8'); dither(g, x - 3, y, 3, 3, '#7A84B8'); dither(g, x + w, y, 3, 3, '#7A84B8', 1);
    R(g, x + 2, y + 2, w - 4, 1, '#F4A8A0'); R(g, x + 6, y + 3, w - 16, 1, '#FFD0A8');
  }
};
/** Happy Land on the skyline (the east: against the sun), in two hazy tones: the castle's spires, the wheel, the
 *  coaster's hill and loop, the needle up out of the picture, the gate's dome and flags, a water tower. */
const parkSkyline = (g: Ctx, x0: number, y: number, s: number) => {
  const far = '#8E7EA0', near = '#74688C';
  const P = (pts: number[], col: string) => { g.fillStyle = col; g.beginPath(); for (let i = 0; i < pts.length; i += 2) g.lineTo(x0 + pts[i] * s, y - pts[i + 1] * s); g.closePath(); g.fill(); };
  // (the needle, the wheel, the coaster: far)
  g.fillStyle = far; g.fillRect(Math.round(x0 + 96 * s), 0, Math.max(1, Math.round(1.6 * s)), y);
  for (let k = 0; k < 4; k++) g.fillRect(Math.round(x0 + (96 - 5 + k) * s), Math.round(y - (30 + k * 22) * s), Math.round((11.6 - k * 2) * s), Math.max(1, Math.round(1.6 * s)));
  g.strokeStyle = far; g.lineWidth = Math.max(1, 1.2 * s);
  g.beginPath(); g.arc(x0 + 30 * s, y - 20 * s, 15 * s, 0, Math.PI * 2); g.stroke();
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; g.beginPath(); g.moveTo(x0 + 30 * s, y - 20 * s); g.lineTo(x0 + (30 + Math.cos(a) * 15) * s, y - (20 + Math.sin(a) * 15) * s); g.stroke(); }
  P([22, 0, 30, 20, 38, 0, 36, 0, 30, 15, 24, 0], far);
  g.beginPath(); g.moveTo(x0 + 108 * s, y); g.lineTo(x0 + 124 * s, y - 28 * s); g.quadraticCurveTo(x0 + 129 * s, y - 31 * s, x0 + 133 * s, y - 18 * s); g.lineTo(x0 + 140 * s, y - 4 * s); g.stroke();
  g.beginPath(); g.arc(x0 + 148 * s, y - 10 * s, 8 * s, 0, Math.PI * 2); g.stroke();
  // (the castle, the gate's dome and its flags, the water tower, the trees: nearer)
  P([50, 0, 50, 18, 53, 18, 56, 32, 59, 18, 63, 18, 63, 24, 67, 40, 71, 24, 71, 18, 75, 18, 78, 30, 81, 18, 84, 18, 84, 0], near);
  P([0, 0, 0, 8, 8, 8, 8, 12, 20, 12, 20, 8, 28, 8, 28, 0], near);
  g.fillStyle = near; g.beginPath(); g.ellipse(x0 + 14 * s, y - 12 * s, 6 * s, 5 * s, 0, Math.PI, 0); g.fill();
  for (const fx of [2, 26]) { g.fillRect(Math.round(x0 + fx * s), Math.round(y - 20 * s), 1, Math.round(12 * s)); g.fillRect(Math.round(x0 + fx * s) + 1, Math.round(y - 20 * s), 3, 2); }
  P([160, 0, 161, 14, 158, 14, 158, 22, 168, 22, 168, 14, 165, 14, 166, 0], near);
  for (let x = 0; x < 176; x += 3) { const h = 3 + hash(x * 0.37) * 4; g.fillRect(Math.round(x0 + x * s), Math.round(y - h * s), Math.ceil(3 * s), Math.ceil(h * s) + 1); }
};
/** The water park behind the lot (the west: lit): its gate's arch, the slide towers and their tubes, the peak of MOUNT
 *  EVEREST BUT BETTER (snow on it). */
const waterPark = (g: Ctx, y: number) => {
  // (the fake peak, far)
  poly(g, [0, y, 14, y - 40, 22, y - 34, 32, y - 52, 46, y - 30, 58, y], '#8A90B4', null);
  poly(g, [32, y - 52, 26, y - 42, 31, y - 44, 35, y - 40, 39, y - 42], '#F4F0F8', null); poly(g, [14, y - 40, 10, y - 32, 16, y - 34, 19, y - 31], '#E4E0F0', null);
  // (the slide towers, their decks, the tubes down off them in loops)
  for (const [x, h, col, lit] of [[66, 44, '#3F8FB8', '#8AD0E8'], [92, 34, '#C8508A', '#F4A0C4'], [48, 26, '#D8A030', '#F8DC80']] as const) {
    R(g, x - 1, y - h, 4, h, '#5A5E78'); R(g, x, y - h, 1, h, '#9AA0B8'); R(g, x - 5, y - h - 2, 12, 3, '#6A6E88'); R(g, x - 5, y - h - 2, 12, 1, '#B4B8D0');
    poly(g, [x - 5, y - h - 2, x + 1, y - h - 9, x + 7, y - h - 2], col, null);
    g.lineCap = 'round';
    for (const [c2, lw] of [[INK, 5], [col, 3], [lit, 1]] as [string, number][]) {
      g.strokeStyle = c2; g.lineWidth = lw; g.beginPath(); g.moveTo(x + 4, y - h + 2);
      g.bezierCurveTo(x + 22, y - h + 4, x + 20, y - h * 0.5, x + 8, y - h * 0.5); g.bezierCurveTo(x - 6, y - h * 0.5, x - 4, y - 6, x + 14, y - 3); g.stroke();
    }
    g.lineCap = 'butt';
  }
  // (the gate: HAPPY WATERS' arch, teal, a wave on it)
  R(g, 4, y - 16, 4, 16, '#2A7A8A'); R(g, 30, y - 16, 4, 16, '#2A7A8A'); R(g, 2, y - 21, 34, 6, INK); R(g, 3, y - 20, 32, 4, '#3AA8B8'); R(g, 3, y - 20, 32, 1, '#9AE4EC');
  for (let k = 0; k < 7; k++) R(g, 5 + k * 4, y - 18 + (k % 2), 3, 1, '#F8FAFC');
};
const lot = () => bake('fin-intro-lot', 256, 144, g => {
  sunrise(g, HORIZON, 204);
  parkSkyline(g, 122, HORIZON, 0.78);
  waterPark(g, HORIZON);
  // (the haze along the horizon)
  dither(g, 0, HORIZON - 5, 256, 3, '#F4C49A'); R(g, 0, HORIZON - 2, 256, 2, '#F4C49A');
  // (the asphalt: banded, lighter toward the sun; the low sun's sheen along the far edge)
  bands(g, 0, HORIZON, 256, 144 - HORIZON, ['#5A5466', '#48445A', '#3A3850', '#302E44', '#28263A']);
  R(g, 0, HORIZON, 256, 1, '#B49AA0'); dither(g, 120, HORIZON + 1, 136, 2, '#8A7A88');
  // (the stalls: rows going back to the one vanishing point, the cross lines closing up with distance)
  const vx = 128, vy = HORIZON - 30;
  for (const yy of [96, 101, 109, 121, 138]) { const k = (yy - vy) / (144 - vy); g.fillStyle = k > 0.8 ? '#D8D4C4' : k > 0.6 ? '#B4B0A8' : '#8A8894'; g.fillRect(0, yy, 256, yy > 120 ? 2 : 1); }
  for (let i = -9; i <= 9; i++) {
    const bx = vx + i * 34;
    for (const [y0, y1] of [[96, 100], [102, 108], [110, 120], [123, 137]] as const) {
      const x0 = vx + (bx - vx) * ((y0 - vy) / (144 - vy)), x1 = vx + (bx - vx) * ((y1 - vy) / (144 - vy));
      g.strokeStyle = y0 > 108 ? '#C8C4B4' : '#8A8894'; g.lineWidth = y0 > 120 ? 2 : 1; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    }
  }
  // (oil in the stalls, cracks)
  for (let k = 0; k < 9; k++) { const x = 14 + hash(k * 3.1) * 230, y = 104 + hash(k * 7.7) * 34; ell(g, x, y, 4 + hash(k) * 5, 1.5, '#22202E'); }
  for (let k = 0; k < 5; k++) { let x = 20 + k * 52, y = 112 + (k % 3) * 9; g.fillStyle = '#1A1826'; for (let s = 0; s < 14; s++) { g.fillRect(Math.round(x), Math.round(y), 1, 1); x += 1; y += (hash(k * 9 + s) - 0.5) * 1.6; } }
  // (the light poles, still on, their long shadows off to the west; a few cars at the far end)
  for (const [x, y, h] of [[112, 100, 44], [236, 104, 54], [22, 98, 36]] as const) {
    g.fillStyle = 'rgba(8, 6, 16, 0.3)'; g.beginPath(); g.moveTo(x, y); g.lineTo(x - h * 1.5, y + 3); g.lineTo(x - h * 1.5, y + 5); g.lineTo(x, y + 2); g.fill();
    R(g, x - 1, y - h, 3, h, INK); R(g, x, y - h, 1, h, '#6A6878'); R(g, x - 5, y - h - 1, 11, 3, INK); R(g, x - 4, y - h, 9, 1, '#8A889A'); R(g, x - 4, y - h + 2, 3, 1, '#FFF4C0'); R(g, x + 2, y - h + 2, 3, 1, '#FFF4C0');
  }
  for (const [x, col] of [[150, '#B4533A'], [166, '#E8E4DC'], [226, '#3A5A8A'], [52, '#D8B040']] as const) { R(g, x - 1, 93, 12, 6, INK); R(g, x, 94, 10, 3, col); R(g, x + 2, 92, 6, 2, col); R(g, x + 3, 93, 4, 1, '#9ADCF4'); R(g, x, 94, 10, 1, '#FFFFFF66'); }
});

// ---------------------------------------------------------------------------------------------------------------
// The cast

const S = RAMP.mSkin;
/** Him, front on, glasses on (the game's own small standing figure): feet at (x, base), `k` how big. */
const mh = (c: Ctx, x: number, base: number, d: Dress, k = 1) => {
  c.save(); c.translate(Math.round(x), Math.round(base)); if (k !== 1) c.scale(k, k);
  mhStandingFig(false, true, true)(c, 0, 0);
  // (the G-men's glasses: thick black frames, the sunrise in the lenses)
  R(c, -7, -64, 14, 1, INK); R(c, -7, -64, 6, 5, INK); R(c, 1, -64, 6, 5, INK); R(c, -6, -63, 4, 3, '#BFE4F4'); R(c, 2, -63, 4, 3, '#BFE4F4'); R(c, -6, -63, 2, 1, '#FFFFFF'); R(c, 2, -63, 2, 1, '#FFFFFF');
  if (d === 'shitty') { shatFront(c, 0, 0); stink(c, 0, -24, 3, 22, 8); }
  if (d === 'nude') {
    // (the jeans gone: bare legs, the bush, swinging free; the boots still on)
    for (const s of [-1, 1]) { const l = s < 0 ? -9 : 1; R(c, l - 1, -30, 10, 26, INK); R(c, l, -29, 8, 25, S[4]); R(c, l, -29, 2, 25, S[s < 0 ? 6 : 5]); R(c, l + 6, -29, 2, 25, S[3]); R(c, l + 2, -16, 4, 1, S[3]); }
    R(c, -10, -31, 20, 3, S[4]); R(c, -10, -31, 20, 1, S[6]); R(c, -3, -30, 6, 3, '#3a2010'); R(c, -1, -27, 3, 5, S[3]); R(c, -2, -24, 5, 3, S[2]);
  }
  c.restore();
};
/** The fist the rope's in (the one on the picture's left), from his feet. */
const FIST: [number, number] = [-17, -28];

/** What's left of all five, on the one rope (painted once, the ground at y TG; the rope's front end at its right
 *  edge): from the back, ZORZARBLAX gone flat (a punctured bouncy castle with three limp arms), the brothers in their
 *  knot (the lavender one in his black coat through the red one, a bone out, the tongues), GUPPLAX belly up, the top
 *  of his head gone, and NED folded on top of him: his skin, his robe and his hat, nobody in them. */
const TRAIN_W = 168, TRAIN_H = 44, TG = 40;
const train = () => bake('fin-intro-train', TRAIN_W, TRAIN_H, g => {
  // (the rope along them all, knotted round each)
  cord(g, [8, TG - 3, 40, TG - 2, 60, TG - 6, 92, TG - 3, 120, TG - 8, 146, TG - 3, 167, TG - 9], 1.4, '#A8885A', '#E0C890');
  // ---- ZORZARBLAX: flat, a puddle of green hide in folds, the arms limp, mom's eye, a curler, pus
  ell(g, 22, TG - 1, 22, 2.5, 'rgba(8, 6, 16, 0.35)');
  poly(g, [1, TG, 4, TG - 5, 14, TG - 8, 28, TG - 9, 40, TG - 6, 44, TG], '#86A65E');
  R(g, 6, TG - 6, 30, 1, '#C0D494'); for (const x of [10, 17, 25, 33]) { R(g, x, TG - 7, 1, 6, '#4E7034'); R(g, x + 1, TG - 7, 1, 5, '#A2BE78'); }
  cord(g, [6, TG - 3, 0, TG - 1], 2, '#6A8C48', '#A2BE78'); cord(g, [30, TG - 8, 36, TG - 13, 42, TG - 10], 2, '#6A8C48', '#A2BE78'); cord(g, [38, TG - 4, 46, TG - 1], 2, '#6A8C48', '#A2BE78');
  ell(g, 20, TG - 9, 4, 3, '#F8F4F0', INK); R(g, 19, TG - 10, 2, 2, '#5A2AA8'); R(g, 12, TG - 11, 4, 3, '#F472B6'); R(g, 12, TG - 11, 4, 1, '#FFD0E8');
  for (const [x, y] of [[8, 4], [27, 5], [34, 3]]) { R(g, x, TG - y, 2, 2, '#A8403A'); R(g, x, TG - y + 2, 1, 2, '#F4E27A'); }
  // ---- the pretzel: the black coat's loop and the red one through it; a head at each end, the tongues out; a bone
  ell(g, 72, TG - 1, 20, 2.5, 'rgba(8, 6, 16, 0.35)');
  const loop = (cx: number, cy: number, r: number, a0: number, a1: number, base: string, lit: string) => { g.lineCap = 'round'; for (const [col, lw] of [[INK, 7], [base, 5], [lit, 1.4]] as [string, number][]) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.arc(cx, cy - (lw < 2 ? 1.5 : 0), r, a0, a1); g.stroke(); } g.lineCap = 'butt'; };
  loop(66, TG - 10, 7, 0.4, Math.PI * 2.1, '#26222C', '#5A5462'); loop(78, TG - 9, 7, -2.6, Math.PI * 1.2, '#B82A22', '#F47A64'); loop(66, TG - 10, 7, 0.9, 2.2, '#26222C', '#5A5462');
  ell(g, 56, TG - 5, 4.5, 4.5, '#AA9AB8', INK); R(g, 52, TG - 9, 7, 3, '#16101E'); R(g, 55, TG - 6, 2, 2, '#F8F4F0'); R(g, 56, TG - 5, 1, 1, '#B8181C'); R(g, 54, TG - 2, 2, 3, '#E87286');
  ell(g, 90, TG - 6, 5, 5, '#DC4A3A', INK); R(g, 88, TG - 13, 1, 3, '#84CC16'); R(g, 90, TG - 14, 1, 4, '#84CC16'); R(g, 92, TG - 13, 1, 3, '#84CC16'); R(g, 88, TG - 8, 2, 2, '#FFF6A0'); R(g, 92, TG - 8, 2, 2, '#FFF6A0'); R(g, 91, TG - 3, 2, 3, '#E87286');
  cord(g, [73, TG - 16, 76, TG - 21], 1.6, '#DCD2B8', '#FFFFF4'); R(g, 72, TG - 16, 3, 2, '#B01C1C');
  // ---- GUPPLAX: on his back, the gut up like a hill (the six nipples, the red trunks), the head open at the top
  ell(g, 122, TG - 1, 22, 2.5, 'rgba(8, 6, 16, 0.35)');
  poly(g, [102, TG, 104, TG - 8, 112, TG - 17, 124, TG - 20, 134, TG - 15, 138, TG - 6, 138, TG], '#62C05A');
  g.fillStyle = '#B8F0A0'; g.fillRect(110, TG - 17, 14, 1); dither(g, 108, TG - 15, 20, 3, '#8ADC78'); dither(g, 106, TG - 5, 30, 4, '#2E803A', 1);
  for (let k = 0; k < 6; k++) R(g, 112 + (k % 3) * 6, TG - 14 + Math.floor(k / 3) * 5, 2, 1, '#A06A92');
  poly(g, [100, TG, 96, TG - 7, 104, TG - 9, 106, TG], '#D02A24'); R(g, 97, TG - 7, 7, 1, '#FF9A8A');
  ell(g, 144, TG - 6, 7, 6, '#62C05A', INK); poly(g, [146, TG - 12, 152, TG - 12, 154, TG - 5, 150, TG - 1, 148, TG - 6], '#A82828');
  R(g, 150, TG - 9, 3, 2, '#F8B0C4'); R(g, 140, TG - 8, 2, 2, '#FFF6A0'); R(g, 141, TG - 3, 4, 1, INK); R(g, 142, TG - 3, 2, 2, '#F8E070');
  cord(g, [148, TG - 11, 152, TG - 17, 158, TG - 13], 1.6, '#4A9448', '#9ADC88'); ell(g, 159, TG - 12, 2.2, 2.2, '#FFFCE0', INK);
  for (const [x, y] of [[156, 2], [160, 6], [136, 3]]) R(g, x, TG - y, 2, 1, '#D04848');
  // ---- NED (riding on the gut: he weighs nothing now): the skin folded like a towel, the robe, the hat on top
  poly(g, [108, TG - 19, 112, TG - 25, 130, TG - 26, 136, TG - 20, 134, TG - 16, 110, TG - 17], '#7650B4'); R(g, 113, TG - 25, 16, 1, '#B894E8');
  poly(g, [112, TG - 24, 116, TG - 29, 128, TG - 30, 132, TG - 25], '#B2807E'); R(g, 117, TG - 29, 10, 1, '#E2B8B0');
  ell(g, 122, TG - 26.5, 3.4, 1.6, '#12060A'); R(g, 116, TG - 27, 2, 1, '#12060A'); R(g, 127, TG - 28, 2, 1, '#12060A');
  poly(g, [118, TG - 30, 123, TG - 39, 128, TG - 30], '#7650B4'); R(g, 116, TG - 31, 14, 2, '#5A3896'); R(g, 122, TG - 35, 2, 2, '#FCEB88');
});
/** The train behind him: its front end (the rope) to his fist at (fx, fy), dragged along the ground line `gy`. */
const dragged = (c: Ctx, fx: number, fy: number, gy: number, moving: boolean, t: number) => {
  const x1 = fx - 22, jig = moving && (t >> 2) % 2 ? 1 : 0;
  c.drawImage(train(), Math.round(x1 - TRAIN_W + 1), gy - TG + jig);
  cord(c, [x1, gy - 9 + jig, fx - 8, fy + 6, fx, fy], 1.4, '#A8885A', '#E0C890');
};

/** Satan up out of the asphalt (his painting from the chest up): his middle at x, the cut at y; `k` how big. */
const satanBust = (c: Ctx, x: number, y: number, k: number, t: number, talking: boolean, look = 0) => {
  // (the fire he's come up through, under him: stepped rings on the asphalt)
  for (const [r, col] of [[62, 'rgba(180, 40, 20, 0.14)'], [48, 'rgba(230, 90, 30, 0.16)'], [34, 'rgba(250, 160, 60, 0.18)']] as const) ell(c, x, y + 2, r * k, r * 0.16 * k, col);
  const up = satanUpper(), w = up.width * k * 0.5, h = up.height * k * 0.5;
  c.drawImage(up, Math.round(x - w / 2), Math.round(y - h), Math.round(w), Math.round(h));
  // (his eyes and mouth, live over the painting, as in hell)
  const s = w / 880;
  c.save(); c.translate(Math.round(x - w / 2) + w / 2 + look, Math.round(y - h) + 90 * s); c.scale(s, s); drawSatanFace(c, t, talking); c.restore();
  // (the asphalt broken up round him: slabs tipped up, their lit edges, the cracks running off)
  for (let i = -5; i <= 5; i++) {
    const sx = x + i * 13 * k, tip = (i % 2 ? 5 : 8) + Math.abs(i) % 3, lean = i < 0 ? -3 : 3;
    poly(c, [sx - 7, y + 3, sx - 5 + lean, y - tip, sx + 6 + lean, y - tip + 2, sx + 8, y + 3], i % 2 ? '#3E3A50' : '#2C2A3E');
    R(c, sx - 4 + lean, y - tip + 1, 9, 1, '#8A8498');
  }
  for (const d of [-1, 1]) { c.strokeStyle = '#14121E'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + d * 66 * k, y + 2); c.lineTo(x + d * 80 * k, y + 6); c.lineTo(x + d * 88 * k, y + 5); c.lineTo(x + d * 100 * k, y + 10); c.stroke(); }
};
/** Her saucer: its middle at (x, y), `k` how big; its shadow on the lot at `gy` (0: none). */
const saucer = (c: Ctx, x: number, y: number, k: number, t: number, gy = 0) => {
  if (gy) ell(c, x, gy, 110 * k, 14 * k, 'rgba(8, 6, 16, 0.3)');
  c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(k, k); drawSaucer(c, t, false, 0, 0); c.restore();
};
/** The embiggening ray: stepped columns of pink down from (x, y0) to y1, widening; rings sliding down; sparks up. */
const ray = (c: Ctx, x: number, y0: number, y1: number, w0: number, w1: number, t: number) => {
  const cols = ['rgba(255, 110, 215, 0.2)', 'rgba(255, 160, 235, 0.22)', 'rgba(255, 225, 250, 0.26)'];
  for (let i = 0; i < 3; i++) { const f = 1 - i * 0.3; c.fillStyle = cols[i]; c.beginPath(); c.moveTo(x - (w0 / 2) * f, y0); c.lineTo(x + (w0 / 2) * f, y0); c.lineTo(x + (w1 / 2) * f, y1); c.lineTo(x - (w1 / 2) * f, y1); c.closePath(); c.fill(); }
  for (let i = 0; i < 4; i++) { const v = (t * 0.025 + i / 4) % 1, yy = Math.round(y0 + (y1 - y0) * v), ww = w0 + (w1 - w0) * v; c.fillStyle = 'rgba(255, 210, 245, 0.4)'; c.fillRect(Math.round(x - ww / 2), yy, Math.round(ww), 1); }
  for (let i = 0; i < 16; i++) { const u = (hash(i) - 0.5) * 0.8, v = 1 - ((t * 0.014 + hash(i + 9)) % 1), yy = y0 + (y1 - y0) * v, ww = w0 + (w1 - w0) * v; R(c, x + u * ww, yy, 1, 1, i % 3 ? '#FFD6F4' : '#FFFFFF'); }
  ell(c, x, y1, w1 * 0.55, 3, 'rgba(255, 190, 240, 0.35)');
};
const widow = (c: Ctx, x: number, y: number, k: number, face: 1 | -1, pose: Parameters<typeof drawWidowBody>[1], t: number, talking: boolean) => {
  ell(c, x, y, 26 * k, 4 * k, 'rgba(8, 6, 16, 0.3)');
  c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(face * k, k); drawWidowBody(c, pose, t, talking); c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The shots

export const clip = { dress: 'clean' as Dress, ben: false };
const SAT_X = 76, SAT_Y = 114, SAU_X = 158, SAU_Y = 36, MH_X = 194, MH_Y = 140;

const shotStandoff = (c: Ctx, t: number, talking: boolean) => {
  c.drawImage(lot(), 0, 0);
  satanBust(c, SAT_X, SAT_Y, 1, t, talking, 2);
  saucer(c, SAU_X, SAU_Y + Math.sin(t * 0.07) * 2, 0.24, t, 124);
};
const shotArrive = (c: Ctx, t: number) => {
  c.drawImage(lot(), 0, 0);
  satanBust(c, SAT_X, SAT_Y, 1, t, false, 2);
  saucer(c, SAU_X, SAU_Y + Math.sin(t * 0.07) * 2, 0.24, t, 124);
  const x = Math.min(MH_X, -30 + t * 1.05), moving = x < MH_X, bob = moving && (t >> 3) % 2 ? 1 : 0;
  dragged(c, x + FIST[0], MH_Y + FIST[1] + bob, MH_Y - 1, moving, t);
  mh(c, x, MH_Y + bob, clip.dress);
  if (moving && t % 6 < 3) R(c, x - 40 - hash(t) * 60, MH_Y - 3, 2, 1, '#8A8498');
};
const shotGlance = (who: 'satan' | 'none') => (c: Ctx, t: number, talking: boolean) => {
  c.drawImage(lot(), 0, 0);
  satanBust(c, SAT_X, SAT_Y, 1, t, who === 'satan' && talking, 4);
  saucer(c, SAU_X - 6, SAU_Y + 6 + Math.sin(t * 0.07) * 2, 0.24, t, 124);
  dragged(c, MH_X + FIST[0], MH_Y + FIST[1], MH_Y - 1, false, t);
  mh(c, MH_X, MH_Y, clip.dress);
  // (their looks swung to what's on the rope: the "!" over each, popping)
  if (who === 'none' && t > 6) for (const [x, y] of [[SAT_X + 4, 22], [SAU_X - 6, 18]] as const) { const p = t < 14 ? 2 : 0; R(c, x - 3, y - 12 - p, 6, 11, INK); R(c, x - 2, y - 11 - p, 4, 8, '#FDE047'); R(c, x - 3, y + 1 - p, 6, 5, INK); R(c, x - 2, y + 2 - p, 4, 3, '#FDE047'); R(c, x - 2, y - 11 - p, 1, 8, '#FFF8C0'); }
};
/** Him, close (the title's bust, his glasses on), for what he says; the sunrise behind, out of focus in bands. */
const mhBack = () => bake('fin-intro-mhback', 256, 144, g => {
  bands(g, 0, 0, 256, 104, ['#3A5AA8', '#5A74B4', '#8A8CB4', '#B894A4', '#DCA088', '#F2B878']);
  for (const [r, col] of [[70, 'rgba(255, 216, 144, 0.18)'], [48, 'rgba(255, 228, 170, 0.24)'], [28, 'rgba(255, 244, 210, 0.4)']] as const) { g.fillStyle = col; g.beginPath(); g.arc(210, 104, r, Math.PI, 0); g.fill(); }
  for (let k = 0; k < 7; k++) { const x = 6 + k * 38; R(g, x, 78 - (k % 3) * 9, 20, 26 + (k % 3) * 9, '#8E7EA0'); dither(g, x, 78 - (k % 3) * 9, 20, 3, '#B894A4'); }
  bands(g, 0, 104, 256, 40, ['#48445A', '#3A3850', '#302E44', '#28263A']); R(g, 0, 104, 256, 1, '#B49AA0');
});
const shotHim = (mood: TitleMood) => (c: Ctx, t: number, talking: boolean) => {
  c.drawImage(mhBack(), 0, 0);
  drawTitleMeathead(c, t, mood, t, true);
  if (talking && t % 8 < 4 && mood === 'dumb') { R(c, 116, 86, 24, 3, '#3a0606'); R(c, 118, 86, 20, 1, '#f4ecdc'); }
  if (clip.dress === 'shitty') { flies(c, 60, 120, 16, 3); stink(c, 200, 140, 3, 30, 10); }
};
const shotOut = (who: 'widow' | 'crew') => (c: Ctx, t: number, talking: boolean) => {
  c.drawImage(lot(), 0, 0);
  satanBust(c, SAT_X, SAT_Y, 1, t, false, 4);
  // (the saucer down on the asphalt behind, its ramp out; a light going in its dome when the crew answers)
  saucer(c, 150, 102, 0.3, t, 108);
  poly(c, [128, 100, 136, 100, 130, 112, 116, 112], '#7A7A90'); R(c, 119, 111, 12, 1, '#C8C8DC');
  if (who === 'crew' && talking && t % 6 < 3) R(c, 144, 72, 12, 3, '#FFD6F4');
  // (her, out on the lot by it in her housecoat, his size, yelling up at it)
  widow(c, 122, 130, 0.44, 1, who === 'widow' && talking ? 'call' : 'idle', t, who === 'widow' && talking);
  dragged(c, MH_X + FIST[0], MH_Y + FIST[1], MH_Y - 1, false, t);
  mh(c, MH_X, MH_Y, clip.dress);
};
const GROW_T = 150;
const shotGrow = (c: Ctx, t: number, talking: boolean) => {
  c.drawImage(lot(), 0, 0);
  satanBust(c, SAT_X, SAT_Y, 1, t, talking, 4);
  const u = Math.min(1, t / GROW_T), k = 0.44 + (u * u * (3 - 2 * u)) * 0.5;
  // (the saucer back up over her; the ray down on her; up she goes in jolts)
  saucer(c, 140, 12, 0.26, t);
  ray(c, 140, 20, 131, 16, 70, t);
  widow(c, 140, 131, k + (u < 1 && t % 12 < 3 ? 0.03 : 0), -1, 'idle', t, false);
  if (u < 1 && t % 12 === 0) R(c, 100 + hash(t) * 80, 128, 3, 1, '#C8C4D0');
  dragged(c, MH_X + FIST[0], MH_Y + FIST[1], MH_Y - 1, false, t);
  mh(c, MH_X, MH_Y, clip.dress);
};
const RAY_WALK = 40, RAY_T = 130;
/** `go`: him walking into it and up (else: stood at its edge, looking). */
const shotRay = (go: boolean) => (c: Ctx, tIn: number) => {
  const t = go ? tIn : 0;
  c.drawImage(lot(), 0, 0);
  satanBust(c, SAT_X, SAT_Y, 1, tIn, false, 4);
  widow(c, 134, 133, 0.95, 1, 'idle', tIn, false);
  // (the saucer over to him; the rope let go, the five left where they lay; him into the ray and up; Ben in after him)
  saucer(c, 204, 12, 0.26, tIn);
  ray(c, 204, 20, 141, 16, 66, tIn);
  c.drawImage(train(), MH_X + FIST[0] - 22 - TRAIN_W + 1, MH_Y - 1 - TG);
  const x = Math.min(204, MH_X + t * 0.3), u = Math.max(0, Math.min(1, (t - RAY_WALK) / (RAY_T - RAY_WALK))), k = 1 + u * u * 0.85;
  if (clip.ben) { const bx = Math.max(238, 270 - t * 0.6), kb = 0.56 * (1 + Math.max(0, u - 0.25) * 1.1); c.save(); c.translate(Math.round(bx), 141); c.scale(kb, kb); drawBen(c, 0, 0, -1, 'stand', 0, null); c.restore(); }
  mh(c, x, 141, clip.dress, k + (u > 0 && u < 1 && t % 12 < 3 ? 0.04 : 0));
};
/** Happy Land from over it, small under them (painted once): the sunrise, the green of it. */
const parkSmall = () => bake('fin-intro-park', 256, 144, g => {
  sunrise(g, 118, 226);
  dither(g, 0, 113, 256, 3, '#F4C49A'); R(g, 0, 116, 256, 2, '#F4C49A');
  bands(g, 0, 118, 256, 26, ['#7A9A64', '#6A8A58', '#5A7A4C', '#4A6A40']);
});
/** Its front rows (over their feet): each land's roofs and a ride or two, tiny; main street; AMERICA USA's gate. */
const parkFront = () => bake('fin-intro-parkfront', 256, 40, g => {
  const bld = (x: number, y: number, w: number, h: number, col: string, roof: string) => { R(g, x - 1, y - h - 1, w + 2, h + 1, INK); R(g, x, y - h, w, h, col); R(g, x, y - h, w, 1, '#FFFFFF88'); R(g, x + w - 2, y - h + 1, 2, h - 1, 'rgba(0,0,0,0.2)'); poly(g, [x - 2, y - h, x + w / 2, y - h - 4, x + w + 2, y - h], roof); for (let k = 0; k < Math.floor(w / 4); k++) R(g, x + 1 + k * 4, y - h + 3, 2, 2, '#2A3448'); };
  for (let k = 0; k < 18; k++) { const x = 2 + k * 14.4, hh = 6 + hash(k * 2.3) * 6; bld(x, 22, 9 + hash(k) * 3, hh, ['#E8DCC4', '#C8B8E0', '#9A9A8E', '#E8E0D0', '#F1F5F9', '#9A6A3A', '#5A5468', '#F9A8D4'][k % 8], ['#8A3A22', '#3B5BBF', '#4A7A3A', '#C81E1E', '#14B8A6', '#5A3A24', '#3A2A4A', '#7C3AED'][k % 8]); }
  // (a castle's spires, a wheel, a coaster's loop poking up out of the back row)
  poly(g, [60, 14, 62, 2, 64, 14], '#3B5BBF'); poly(g, [66, 14, 69, 0, 72, 14], '#3B5BBF'); R(g, 61, 14, 12, 6, '#C8B8E0');
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(34, 9, 7, 0, Math.PI * 2); g.stroke(); g.strokeStyle = '#F472B6'; g.lineWidth = 1; g.stroke();
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(196, 11, 6, 0, Math.PI * 2); g.stroke(); g.strokeStyle = '#C81E1E'; g.lineWidth = 1; g.stroke();
  R(g, 0, 22, 256, 18, '#5A7A4C'); R(g, 0, 28, 256, 3, '#C8B89A'); R(g, 0, 28, 256, 1, '#E8DCC0');
  for (let k = 0; k < 13; k++) { if (k === 6) continue; const x = 4 + k * 19.6; bld(x, 38, 13, 7 + (k % 3) * 2, ['#B4533A', '#F1EDE4', '#7A9AB4', '#C8A878'][k % 4], ['#5A2A1C', '#1D4ED8', '#DC2626'][k % 3]); }
  // (AMERICA USA's gate: the dome on its drum, the columns, the flags)
  R(g, 113, 25, 30, 14, INK); R(g, 114, 26, 28, 13, '#F1EDE4'); for (let k = 0; k < 5; k++) R(g, 116 + k * 6, 28, 2, 11, '#C8C2B4');
  ell(g, 128, 25, 9, 7, '#F8F6F0', INK); R(g, 119, 25, 18, 2, '#F8F6F0'); R(g, 127, 14, 2, 5, '#E5E7EB'); R(g, 127, 13, 2, 2, '#FDE047');
  for (const x of [108, 146]) { R(g, x, 16, 1, 22, '#D4D4D8'); R(g, x + 1, 16, 5, 1, '#DC2626'); R(g, x + 1, 17, 5, 1, '#F8FAFC'); R(g, x + 1, 18, 5, 1, '#DC2626'); R(g, x + 1, 16, 2, 2, '#1D4ED8'); }
});
const shotGiant = (who: 'mh' | 'satan' | 'widow') => (c: Ctx, t: number, talking: boolean) => {
  c.drawImage(parkSmall(), 0, 0);
  // (them, giant: stood in the park to their shins, the front rows of it over their feet)
  c.save(); c.translate(52, 142); c.scale(0.72, 0.72); drawSatanBody(c, who === 'satan' && talking ? 'talk' : 'idle', t, who === 'satan' && talking); c.restore();
  c.save(); c.translate(208, 142); c.scale(-0.76, 0.76); drawWidowBody(c, who === 'widow' && talking ? 'talk' : 'idle', t, who === 'widow' && talking); c.restore();
  if (clip.ben) { c.save(); c.translate(96, 142); c.scale(0.86, 0.86); drawBen(c, 0, 0, 1, 'stand', 0, null); c.restore(); }
  mh(c, 132, 142, clip.dress, 1.5);
  c.drawImage(parkFront(), 0, 104);
  // (tiny people running out from between their feet)
  for (let k = 0; k < 12; k++) { const x = (k * 23 + t * (0.3 + (k % 3) * 0.15) * (k % 2 ? 1 : -1) + 400) % 256; R(c, x, 136 + (k % 3) * 2, 1, 2, ['#DC2626', '#2563EB', '#F8FAFC', '#F59E0B'][k % 4]); R(c, x, 135 + (k % 3) * 2, 1, 1, '#E8B48A'); }
};
/** (the cards' beats: the picture's left black; drawIntroOver puts them over the scene, screen space) */
const shotBlack = (c: Ctx) => { R(c, 0, 0, 256, 144, '#000'); };

/** (the contact sheet) every picture, with the frames worth looking at; `res`: how fine it's drawn in the scene. */
export const SHEET_SHOTS: [string, (c: Ctx, t: number, talking: boolean) => void, number[], number][] = [
  ['standoff', shotStandoff, [10, 41], 2], ['wife', shotWife, [11], 1], ['arrive', shotArrive, [60, 160], 2], ['glance', shotGlance('none'), [20], 2],
  ['him dumb', shotHim('dumb'), [11], 1], ['him stoked', shotHim('stoked'), [10], 1], ['out', shotOut('widow'), [21], 2], ['grow', shotGrow, [20, 90, 160], 2],
  ['ray', shotRay(true), [20, 80, 130], 2], ['giant', shotGiant('mh'), [10], 2], ['giant satan', shotGiant('satan'), [21], 2],
];
/** (the contact sheet) the dress and Ben set by hand. */
export const sheetClip = (d: Dress, ben: boolean) => { clip.dress = d; clip.ben = ben; };

// ---------------------------------------------------------------------------------------------------------------
// The cards (screen space, over the scene's picture)

type CardBeat = Beat & { card?: DeadKid };
/** Where the scene player puts its picture on screen (intro/gym/scene.ts: 256 x 144 at 3x, 16 in and 30 down). */
const PIC = { x: 16, y: 30, w: 768, h: 432 };
/** Over the scene's picture, screen space (the stage's HUD pass calls it while the opening plays): the dead kids'
 *  cards, each for its own beat. */
export const drawIntroOver = (c: Ctx, s: Scene, frame: number) => {
  const b = s.beats[s.i] as CardBeat | undefined;
  if (!b?.card || s.out >= 0) return;
  drawDeadCard(c, b.card, s.t, frame, PIC.x, PIC.y, PIC.w, PIC.h);
};
/** The opening's heavy paint (the five cards, her cockpit gross-up, his own painting), ahead in idle slices. */
export const warmIntro = () => { warmDeadGross(); warmZarblaxGross(); warmSatan(); };

/** Him, small, in the finishers' pictures (finishers.ts): feet at (x, y), `s` how big (1: 20 art px), walking. */
export const miniMeathead = (c: Ctx, x: number, y: number, s: number, t: number, d: Dress, face = 1) => {
  c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(s * face, s);
  const step = Math.sin(t * 0.25) * 2;
  const skin = '#E8A888', pants = d === 'nude' ? skin : d === 'shitty' ? '#3A5A9A' : '#2A4A8A';
  R(c, -4 + step, -8, 3, 8, pants); R(c, 1 - step, -8, 3, 8, pants);
  if (d === 'shitty') R(c, -3, -7, 6, 3, '#6A4A1A');
  if (d === 'nude') { R(c, -1, -9, 2, 2, '#C87A6A'); }
  R(c, -5, -17, 10, 9, d === 'nude' ? skin : '#F1F5F9'); R(c, -6, -16, 2, 6, skin); R(c, 4, -16, 2, 6, skin);
  R(c, -4, -23, 8, 7, skin); R(c, -4, -21, 8, 2, INK); R(c, -3, -21, 2, 1, '#9ADCF4'); R(c, 1, -21, 2, 1, '#9ADCF4');
  c.restore();
};

/** A card's hold (frames): five in about six seconds. */
const CARD_HOLD = 68;
export const startIntro = (state: GameState, ben: boolean): Scene => {
  const d: Dress = isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean';
  clip.dress = d; clip.ben = ben;
  warmIntro();
  // (the painted figures drawn twice as fine as the picture's pixels; her cockpit and his bust are pixel pictures as is)
  const RES = 2;
  const sat = (text: string, shot: Beat['shot'] = shotStandoff, hold = 18): Beat => ({ shot, who: 'SATAN', voice: SATAN_VOICE, text, hold, res: RES });
  const wid = (text: string, shot: Beat['shot'], hold = 18): Beat => ({ shot, who: 'ZARBLAX', voice: WIDOW_VOICE, text, hold, res: shot === shotWife ? 1 : RES });
  const mhSays = (text: string, mood: TitleMood = 'dumb', hold = 18): Beat => ({ shot: mood === 'dumb' ? himDumb : himStoked, who: 'MEATHEAD', voice: 'meathead', text, hold });
  const still = (shot: Beat['shot'], hold: number, enter?: () => void): Beat => ({ shot, hold, enter, res: RES });
  const himDumb = shotHim('dumb'), himStoked = shotHim('stoked');
  const quiet: Beat['shot'] = (c, t) => shotStandoff(c, t, false);
  const glance = shotGlance('none'), glanceSat = shotGlance('satan'), outW = shotOut('widow'), outC = shotOut('crew');
  const rayWait = shotRay(false), rayGo = shotRay(true);
  const gMh = shotGiant('mh'), gSat = shotGiant('satan'), gWid = shotGiant('widow');
  // (the run of cards: quick, a sting each, a step up in pitch)
  const cards: CardBeat[] = DEAD_ORDER.map((id, i) => ({ shot: shotBlack, hold: CARD_HOLD, card: id, enter: () => { playSound('slam', 0.7, -8 + i * 2); playSound('ding', 0.5, -14 + i * 3); } }));
  const beats: CardBeat[] = [
    still(quiet, 30, sfx('rumble', 0.6, -8)),
    sat(pickLine(L.SATAN_CLAIM)), wid(pickLine(L.WIDOW_CLAIM), shotWife), sat(pickLine(L.SATAN_BACK)),
    still(shotArrive, 170, sfx('thud', 0.4, -6)),
    mhSays(pickLine(L.MH_ARRIVE[d]), 'stoked'),
    still(glance, 34, sfx('ding', 0.5, -6)),
    wid(pickLine(L.WIDOW_SEE), shotWife, 8), sat(pickLine(L.SATAN_SEE), glanceSat, 8),
    ...cards,
    wid(pickLine(L.WIDOW_GRIEF), shotWife), sat(pickLine(L.SATAN_GRIEF), glanceSat),
    mhSays(pickLine(L.MH_KIDS[d])),
    wid(pickLine(L.WIDOW_TRUCE), shotWife), sat(pickLine(L.SATAN_TRUCE), glanceSat),
    still(outW, 40, () => { playSound('alienBeam', 0.5, -4); playSound('thud', 0.5, -6); }),
    wid(pickLine(L.WIDOW_EMBIGGEN), outW),
    { shot: outC, who: 'SAUCER', voice: CREW_VOICE, text: pickLine(L.CREW_EMBIGGEN), hold: 10, res: RES },
    still(shotGrow, GROW_T, () => { playSound('alienCharge', 0.8, -10); playSound('rumble', 0.7, -10); }),
    sat(pickLine(L.SATAN_IMPRESSED), shotGrow),
    mhSays(pickLine(L.MH_RAY[d]), 'stoked'),
    ...(ben ? [{ shot: rayWait, who: 'CON-FUCK-TIOUS', voice: BEN_VOICE, text: pickLine(L.BEN_RAY), hold: 14, res: RES } as Beat, mhSays(pickLine(L.MH_BEN_RAY[d]), 'stoked')] : []),
    still(rayGo, RAY_T, () => { playSound('alienCharge', 0.8, -14); playSound('rumble', 0.8, -14); }),
    { shot: gMh, who: 'MEATHEAD', voice: 'meathead', text: pickLine(L.MH_GIANT[d]), hold: 18, res: RES, enter: () => { playSound('slam', 0.9, -12); playSound('rumble', 0.8, -12); } },
    { shot: gSat, who: 'SATAN', voice: SATAN_VOICE, text: pickLine(L.SATAN_GO), hold: 18, res: RES },
    { shot: gWid, who: 'ZARBLAX', voice: WIDOW_VOICE, text: pickLine(L.WIDOW_GO), hold: 40, res: RES },
  ];
  return createScene(beats);
};
