// Meathead as a cartoon tuxedo cat (Meathead 2's cartoon White House: erased and drawn back in as SOCKS THE CAT /
// MEATHEAD, Player.catForm). The same brute: the barrel chest, the slab shoulders, the square jaw, the flat-top (a
// flat-topped head of black fur with its bristles), the crushed-down brows and the scowl, the stubble (on a white
// muzzle), his jeans and his belt; but black fur all over, the white bib down his chest, white socks on his paws (fore
// and hind: barefoot, cat feet), cat ears, whiskers, a pink nose, yellow-green slit eyes, a long black tail out the
// back of his jeans, and a spiked collar with a tag in place of his wristband.
//
// Two ways in:
//   - body.ts's primitives (drawArm, drawLeg, drawHead, drawTorsoFromHips) hand over to the cat ones here while the
//     cat's on (setCatBody): every pose built from them (the grabs, the mallet, the spellbook...) is the cat too.
//   - drawCatPlayer: his own frames for everything drawPlayer draws him doing (stood, walking, in the air, ducked, the
//     charge with his claws out, the slide, the uppercut's claw swipe, the dive kick's pounce, hurt with his fur
//     puffed, holding his weapon in a paw; the gun's a hairball he hacks up, mouth open).
// All of it in his local frame (feet at the origin, facing +x), drawn into the outlined sprite like the rest of him.

import type { Player } from '../../../types';
import type { GameState } from '../../core/state';
import { GUN_COOLDOWN, PLAYER_MOVE_SPEED } from '../../../constants';
import { markEyes } from './spriteOutline';
import { pantsColor, pantsShadow, isNude, isTalkingNow, drawBelt, type Mood } from './body';

type Ctx = CanvasRenderingContext2D;
type Pt = [number, number];

export const FUR = '#26232E', FUR_SH = '#15131A', FUR_LT = '#3D3849', FUR_HI = '#5A546A';
export const WHITE = '#F6F2E9', WHITE_SH = '#D3CABB';
const PINK = '#F4A6BA', NOSE = '#E8789A', EYE = '#C9E34B', EYE_SH = '#8DB02A', CLAW = '#FBFAF5';

// ---------------------------------------------------------------------------------------------------------------
// The switch, and what the next things drawn should show

let cat = false;
/** The cat's on (body.ts's primitives draw the cat ones). */
export const setCatBody = (on: boolean) => { cat = on; };
export const catBodyOn = () => cat;
let claws = { hands: false, feet: false };
/** Claws out (on the forepaws, the hind paws) for what's drawn next. */
export const setCatClaws = (hands: boolean, feet = false) => { claws = { hands, feet }; };
let tail = { swish: 0, up: 0, puff: false };
/** The tail's swing (-1..1), how far up it's carried (0 low .. 1 straight up), bottle-brushed. */
export const setCatTail = (swish: number, up: number, puff = false) => { tail = { swish, up, puff }; };
let face: { eyes: 'mean' | 'wide' | 'shut' | 'x'; ears: 'up' | 'back' | 'flat'; mouth: 'auto' | 'hiss' | 'hack' | 'yowl' | 'tongue'; puff: boolean; twitch: boolean } = { eyes: 'mean', ears: 'up', mouth: 'auto', puff: false, twitch: false };
/** The face for what's drawn next (eyes, ears, the mouth over the mood's, fur puffed out). */
export const setCatFace = (f: Partial<typeof face>) => { face = { eyes: 'mean', ears: 'up', mouth: 'auto', puff: false, twitch: false, ...f }; };
let ghost = false;
/** Drawn as his ghost (all pale, see-through: the death's): for what's drawn next. */
export const setCatGhost = (on: boolean) => { ghost = on; };
const col = (c: string) => (ghost ? GHOSTS[c] ?? '#EEF4FF' : c);
const GHOSTS: Record<string, string> = { [FUR]: '#E8EEFF', [FUR_SH]: '#C9D3F0', [FUR_LT]: '#F2F6FF', [FUR_HI]: '#FFFFFF', [WHITE]: '#FFFFFF', [WHITE_SH]: '#DCE4F8' };

// ---------------------------------------------------------------------------------------------------------------
// Bits

const fill = (c: Ctx, color: string) => { c.fillStyle = col(color); c.fill(); };
const ball = (c: Ctx, x: number, y: number, r: number, color: string) => { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); fill(c, color); };
/** A tapering capsule from a (radius ra) to b (rb). */
const seg = (c: Ctx, a: Pt, b: Pt, ra: number, rb: number, color: string) => {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), nx = -Math.sin(ang), ny = Math.cos(ang);
  c.beginPath();
  c.moveTo(a[0] + nx * ra, a[1] + ny * ra); c.lineTo(b[0] + nx * rb, b[1] + ny * rb);
  c.lineTo(b[0] - nx * rb, b[1] - ny * rb); c.lineTo(a[0] - nx * ra, a[1] - ny * ra); c.closePath(); fill(c, color);
  ball(c, a[0], a[1], ra, color); ball(c, b[0], b[1], rb, color);
};
/** A few fur ticks along a line (lighter strokes), for texture. */
const ticks = (c: Ctx, a: Pt, b: Pt, n: number, color = FUR_LT) => {
  c.strokeStyle = col(color); c.lineWidth = 0.9;
  for (let k = 1; k <= n; k++) {
    const t = k / (n + 1), x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
    c.beginPath(); c.moveTo(x - 1, y - 1.2); c.lineTo(x + 0.6, y + 0.8); c.stroke();
  }
};
/** Claws: three hooked white blades out of a paw at (x, y), pointing along `ang`. */
const clawsAt = (c: Ctx, x: number, y: number, ang: number, len = 7) => {
  const ca = Math.cos(ang), sa = Math.sin(ang);
  for (let k = -1; k <= 1; k++) {
    const ox = x + ca * 3 - sa * k * 2.6, oy = y + sa * 3 + ca * k * 2.6;
    const tx = ox + ca * len - sa * k * 1.2, ty = oy + sa * len + ca * k * 1.2;
    c.beginPath(); c.moveTo(ox - sa * 1.1, oy + ca * 1.1);
    c.quadraticCurveTo(ox + ca * len * 0.7 - sa * 1.6, oy + sa * len * 0.7 + ca * 1.6, tx + sa * 1.2, ty - ca * 1.2);
    c.lineTo(ox + sa * 1.1, oy - ca * 1.1); c.closePath(); fill(c, CLAW);
  }
};
/** A white paw (a sock) as a fist at (x, y), r across, its toes along the front (`ang` the way it points). */
const paw = (c: Ctx, x: number, y: number, r: number, ang: number, back: boolean, out = false) => {
  ball(c, x, y, r + 0.6, back ? WHITE_SH : WHITE);
  // (the toes: three bumps across the front, creased)
  const ca = Math.cos(ang), sa = Math.sin(ang);
  c.strokeStyle = col(WHITE_SH); c.lineWidth = 0.9;
  for (let k = -1; k <= 1; k += 2) { c.beginPath(); c.moveTo(x + ca * r * 0.2 - sa * k * r * 0.35, y + sa * r * 0.2 + ca * k * r * 0.35); c.lineTo(x + ca * (r + 0.4) - sa * k * r * 0.35, y + sa * (r + 0.4) + ca * k * r * 0.35); c.stroke(); }
  if (!back) { c.fillStyle = col('#FFFFFF'); c.fillRect(x - r * 0.4, y - r * 0.6, r * 0.5, 1); }
  if (out) clawsAt(c, x, y, ang);
};

// ---------------------------------------------------------------------------------------------------------------
// The primitives (body.ts hands over to these while the cat's on: the same joints, the same sizes)

/** An arm, shoulder to elbow to wrist (body.ts drawArm's), the fist a white paw past the wrist. */
export const catArm = (c: Ctx, sx: number, sy: number, ex: number, ey: number, wx: number, wy: number, back: boolean, fistR = 5) => {
  const fur = back ? FUR_SH : FUR;
  // (the forearm: black fur, then the white sock up it)
  const mx = ex + (wx - ex) * 0.5, my = ey + (wy - ey) * 0.5;
  seg(c, [ex, ey], [mx, my], 4.6, 4, fur);
  seg(c, [mx, my], [wx, wy], 4, 3.6, back ? WHITE_SH : WHITE);
  // (a jagged edge where the sock starts)
  const fa = Math.atan2(wy - ey, wx - ex), nx = -Math.sin(fa), ny = Math.cos(fa);
  c.beginPath(); c.moveTo(mx + nx * 4.2, my + ny * 4.2);
  for (let k = -1; k <= 1; k++) { c.lineTo(mx + nx * k * 2.8 + Math.cos(fa) * 2.4, my + ny * k * 2.8 + Math.sin(fa) * 2.4); c.lineTo(mx + nx * (k * 2.8 - 1.4), my + ny * (k * 2.8 - 1.4)); }
  c.lineTo(mx - nx * 4.2, my - ny * 4.2); c.closePath(); fill(c, fur);
  // (the upper arm: a slab of it, a bulge of a bicep, fur ticks; the shoulder's round cap of fur)
  seg(c, [sx, sy], [ex, ey], 5.4, 4.6, fur);
  const ua = Math.atan2(ey - sy, ex - sx), ul = Math.hypot(ex - sx, ey - sy);
  c.beginPath(); c.ellipse(sx + (ex - sx) * 0.55 - Math.sin(ua) * 1.6, sy + (ey - sy) * 0.55 + Math.cos(ua) * 1.6, 4.8, ul * 0.42, ua - Math.PI / 2, 0, Math.PI * 2); fill(c, fur);
  if (!back) ticks(c, [sx, sy], [ex, ey], 3);
  ball(c, sx, sy, 6.2, fur);
  if (!back) { c.beginPath(); c.ellipse(sx + 1, sy - 2, 3, 1.6, 0, 0, Math.PI * 2); fill(c, FUR_LT); }
  // (an elbow tuft)
  c.beginPath(); c.moveTo(ex - Math.cos(ua) * 2, ey - Math.sin(ua) * 2); c.lineTo(ex + Math.cos(ua) * 4 + nx * 2, ey + Math.sin(ua) * 4 + ny * 2); c.lineTo(ex + nx * 4, ey + ny * 4); c.closePath(); fill(c, fur);
  // (the paw)
  const reach = fistR - 0.5;
  paw(c, wx + Math.cos(fa) * reach, wy + Math.sin(fa) * reach, fistR, fa, back, claws.hands);
};
/** An arm to where the fist lands (body.ts drawArmTo's). */
export const catArmTo = (c: Ctx, shoulder: Pt, elbow: Pt, fist: Pt, back: boolean, fistR = 5) => {
  const dx = fist[0] - elbow[0], dy = fist[1] - elbow[1], len = Math.hypot(dx, dy) || 1, reach = fistR - 0.5;
  catArm(c, shoulder[0], shoulder[1], elbow[0], elbow[1], fist[0] - (dx / len) * reach, fist[1] - (dy / len) * reach, back, fistR);
};

/** A hind paw at the foot, along `toe` (white, toes across the front; claws out if they're out). */
const footPaw = (c: Ctx, toe: number, back: boolean) => {
  c.save(); c.rotate(toe);
  c.beginPath(); c.roundRect(-5, -5, 14, 7, [3, 4, 2, 2]); fill(c, back ? WHITE_SH : WHITE);
  c.strokeStyle = col(WHITE_SH); c.lineWidth = 0.9;
  for (const x of [5, 7.5]) { c.beginPath(); c.moveTo(x, -1.6); c.lineTo(x + 1.2, 1.6); c.stroke(); }
  if (!back) { c.fillStyle = col(PINK); c.fillRect(-2, 1, 5, 1); }
  if (claws.feet) clawsAt(c, 8, -1, 0.15, 6);
  c.restore();
};
/** A leg, hip to knee to foot (body.ts drawLeg's): his jeans (fur when they're gone), a hind paw for a foot. */
export const catLeg = (c: Ctx, hip: Pt, knee: Pt, foot: Pt, toeAngle: number, back: boolean) => {
  const nude = isNude(), cloth = nude ? (back ? FUR_SH : FUR) : back ? pantsShadow : pantsColor, w = back ? 10 : 11;
  // (bare: a fur leg, a white sock up the shin; in his jeans, the jeans down to a white ankle)
  seg(c, knee, foot, (w - 1) / 2, (w - 3) / 2, cloth);
  if (nude) { const m: Pt = [knee[0] + (foot[0] - knee[0]) * 0.55, knee[1] + (foot[1] - knee[1]) * 0.55]; seg(c, m, foot, (w - 2) / 2, (w - 3) / 2, back ? WHITE_SH : WHITE); }
  else { c.save(); c.translate(foot[0], foot[1]); c.rotate(Math.atan2(foot[1] - knee[1], foot[0] - knee[0]) - Math.PI / 2); c.fillStyle = col(nude ? FUR : '#172554'); c.fillRect(-w / 2 + 1, -3, w - 2, 1.4); c.restore(); }
  seg(c, hip, knee, (w + 1.5) / 2, (w - 0.5) / 2, cloth);
  if (nude && !back) ticks(c, hip, knee, 2);
  if (!nude && !back) { c.strokeStyle = 'rgba(255,255,255,0.12)'; c.lineWidth = 1; c.beginPath(); c.moveTo(hip[0] + 2, hip[1] + 1); c.lineTo(knee[0] + 2, knee[1]); c.stroke(); }
  c.save(); c.translate(foot[0], foot[1]); footPaw(c, toeAngle, back); c.restore();
};

/** His tail, out the back of his jeans at (x, y) (his hip frame): a long black S, carried up, swishing. */
const drawTail = (c: Ctx, x: number, y: number, frame: number) => {
  const up = tail.up, sw = tail.swish + Math.sin(frame * 0.07) * 0.25;
  const ex = x - 18 + sw * 6 + up * 8, ey = y - 14 - up * 26;
  const c1x = x - 14, c1y = y + 2, c2x = x - 26 + sw * 4, c2y = y - 8 - up * 12;
  const w = tail.puff ? 10 : 5.5;
  c.lineCap = 'round';
  c.strokeStyle = col(FUR_SH); c.lineWidth = w + 1.5; c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(c1x, c1y, c2x, c2y, ex, ey); c.stroke();
  c.strokeStyle = col(FUR); c.lineWidth = w; c.stroke();
  if (tail.puff) {
    // (bottle-brushed: spikes all along it)
    for (let k = 1; k < 10; k++) {
      const t = k / 10, it = 1 - t;
      const px = it * it * it * x + 3 * it * it * t * c1x + 3 * it * t * t * c2x + t * t * t * ex, py = it * it * it * y + 3 * it * it * t * c1y + 3 * it * t * t * c2y + t * t * t * ey;
      for (const s of [-1, 1]) { c.beginPath(); c.moveTo(px - 2, py); c.lineTo(px + s * 4 - 1, py - 6 + s * 2); c.lineTo(px + 2, py); c.closePath(); fill(c, FUR); }
    }
  }
  c.strokeStyle = col(FUR_HI); c.lineWidth = 1.2; c.beginPath(); c.moveTo(x - 6, y - 1); c.bezierCurveTo(c1x + 1, c1y - 2, c2x + 2, c2y, ex + 1, ey + 2); c.stroke();
  c.lineCap = 'butt';
};

/** The torso from his hips (0, 0) up to the shoulders (y -22) (body.ts drawTorsoFromHips's): the tail out the back,
 *  the barrel of a chest in black fur, the white bib, the belt and jeans' waist (fur hips with them gone), the collar. */
export const catTorso = (c: Ctx, frame = 0) => {
  drawTail(c, -9, -3, frame);
  const nude = isNude();
  // (the body: a barrel, broad at the shoulders, the chest out front)
  c.beginPath();
  c.moveTo(-11, 2); c.quadraticCurveTo(-15, -10, -13, -21); c.quadraticCurveTo(-12, -26, -5, -26);
  c.lineTo(8, -26); c.quadraticCurveTo(15, -25, 16, -18); c.quadraticCurveTo(17, -8, 11, 2); c.closePath();
  fill(c, FUR);
  // (the back in shadow, a rim of light over the shoulders)
  c.beginPath(); c.moveTo(-11, 2); c.quadraticCurveTo(-15, -10, -13, -21); c.lineTo(-9, -21); c.quadraticCurveTo(-11, -10, -7, 2); c.closePath(); fill(c, FUR_SH);
  c.beginPath(); c.moveTo(-6, -25); c.lineTo(8, -25); c.quadraticCurveTo(12, -25, 13, -22); c.lineTo(-6, -23); c.closePath(); fill(c, FUR_LT);
  // (the white bib down the front: fluffed, a jagged edge at the bottom)
  c.save();
  c.beginPath(); c.moveTo(3, -25); c.quadraticCurveTo(15, -24, 15, -14); c.quadraticCurveTo(14, -4, 9, 0);
  for (let k = 0; k < 4; k++) { c.lineTo(8 - k * 2, 3 - (k % 2) * 3); }
  c.quadraticCurveTo(-1, -10, 3, -25); c.closePath(); fill(c, WHITE);
  c.beginPath(); c.moveTo(4, -18); c.quadraticCurveTo(8, -15, 6, -8); c.lineTo(3, -10); c.closePath(); fill(c, WHITE_SH);
  c.strokeStyle = col(WHITE_SH); c.lineWidth = 0.9;
  for (const [x, y] of [[9, -20], [11, -15], [8, -11], [12, -9]] as Pt[]) { c.beginPath(); c.moveTo(x - 1, y - 1); c.lineTo(x + 0.5, y + 1); c.stroke(); }
  c.restore();
  ticks(c, [-10, -18], [-9, -2], 3);
  // (his waist: the belt over his jeans; bare, fur)
  if (!nude) drawBelt(c, -3, 7);
  else { c.beginPath(); c.ellipse(0, 1, 11, 4, 0, 0, Math.PI * 2); fill(c, FUR); ticks(c, [-8, 1], [8, 1], 4); }
  // (the collar: black leather, silver studs, a gold tag on a ring)
  c.beginPath(); c.roundRect(-4, -28, 15, 4, 1.5); fill(c, '#111014');
  c.fillStyle = col('#E5E7EB'); for (const x of [-2, 2, 6, 9.5]) { c.beginPath(); c.moveTo(x, -28.6); c.lineTo(x + 1.2, -26); c.lineTo(x - 1.2, -26); c.closePath(); c.fill(); }
  ball(c, 8, -22.6, 2, '#FACC15'); c.fillStyle = col('#B45309'); c.fillRect(7.4, -23, 1.2, 1);
};

/** His head centered on (hx, hy) (body.ts drawHead's place): a cat's, his face on it. */
export const catHead = (c: Ctx, hx: number, hy: number, mood: Mood, frame: number) => {
  const f = face;
  // (the ears: the far one, then the head, then the near one over its corner; back or flat when he's riled)
  const earLean = f.ears === 'flat' ? 0.9 : f.ears === 'back' ? 0.45 : 0;
  const twitch = f.twitch ? Math.sin(frame * 0.9) * 0.2 : 0;
  const ear = (bx: number, by: number, lean: number, h: number, inner: boolean) => {
    c.save(); c.translate(bx, by); c.rotate(-lean);
    c.beginPath(); c.moveTo(-5, 1); c.lineTo(-1.5, -h); c.lineTo(5, 1); c.closePath(); fill(c, FUR);
    if (inner) { c.beginPath(); c.moveTo(-2.6, 0); c.lineTo(-1.2, -h + 4); c.lineTo(2.6, 0); c.closePath(); fill(c, PINK); }
    c.restore();
  };
  ear(hx - 5, hy - 9, earLean + 0.25, 11, false);
  // (the head: flat on top (his flat-top), the jaw square, cheek fluff out the back)
  c.beginPath(); c.roundRect(hx - 11, hy - 11, 22, 20, [2, 3, 7, 5]); fill(c, FUR);
  for (const [dx, dy] of [[-12, 1], [-12, 5], [-10, 8]] as Pt[]) { c.beginPath(); c.moveTo(hx + dx + 3, hy + dy - 3); c.lineTo(hx + dx - 2, hy + dy); c.lineTo(hx + dx + 3, hy + dy + 2); c.closePath(); fill(c, FUR); }
  c.fillStyle = col(FUR_SH); c.fillRect(hx - 11, hy - 10, 3.5, 17);
  // (the flat-top's bristles, stood up along the top)
  c.fillStyle = col(FUR_HI); for (let k = 0; k < 7; k++) c.fillRect(hx - 9 + k * 3, hy - 12.6, 1, 2);
  c.fillStyle = col(FUR_LT); c.fillRect(hx - 8, hy - 10.6, 15, 1);
  ear(hx + 5, hy - 10, earLean - 0.05 + twitch, 12, true);
  // (fur puffed: spikes all round)
  if (f.puff) for (let k = 0; k < 9; k++) { const a = Math.PI * 0.9 + (k / 8) * Math.PI * 1.1, r = 12; c.beginPath(); c.moveTo(hx + Math.cos(a - 0.15) * r * 0.9, hy + Math.sin(a - 0.15) * r * 0.85); c.lineTo(hx + Math.cos(a) * (r + 5), hy + Math.sin(a) * (r + 4)); c.lineTo(hx + Math.cos(a + 0.15) * r * 0.9, hy + Math.sin(a + 0.15) * r * 0.85); c.closePath(); fill(c, FUR); }
  // (the rage vein, on his brow)
  c.strokeStyle = col('#FF6B8A'); c.lineWidth = 1.1;
  c.beginPath(); c.moveTo(hx - 6, hy - 9); c.lineTo(hx - 3, hy - 7.5); c.lineTo(hx - 4, hy - 5); c.stroke();
  // (the white muzzle and chin, stubble on it; the pink nose)
  c.beginPath(); c.ellipse(hx + 4.5, hy + 4, 7.5, 4.8, 0, 0, Math.PI * 2); fill(c, WHITE);
  c.beginPath(); c.ellipse(hx + 3, hy + 7.4, 5.5, 2.8, 0, 0, Math.PI * 2); fill(c, WHITE);
  c.fillStyle = col('rgba(70, 60, 60, 0.45)'); for (let i = 0; i < 12; i++) c.fillRect(hx - 1 + (i * 3.7) % 11, hy + 3 + (i * 2.3) % 6, 0.8, 0.8);
  c.beginPath(); c.moveTo(hx + 7.5, hy - 0.5); c.lineTo(hx + 12, hy - 0.5); c.lineTo(hx + 10, hy + 2.4); c.closePath(); fill(c, NOSE);
  c.fillStyle = col('#FFFFFF'); c.fillRect(hx + 8.5, hy - 0.4, 1.5, 0.8);
  // (the eyes: yellow-green, slit pupils, the brows crushed down over them into a V; wide, shut, crossed out)
  const ey = hy - 3, lx = hx - 2.5, rx = hx + 5.5;
  markEyes(c, (lx + rx) / 2, ey);
  const deep = mood === 'scowl' || mood === 'yell';
  if (f.eyes === 'x') {
    c.strokeStyle = col('#FFFFFF'); c.lineWidth = 1.4;
    for (const x of [lx, rx]) { c.beginPath(); c.moveTo(x - 2.2, ey - 2.2); c.lineTo(x + 2.2, ey + 2.2); c.moveTo(x + 2.2, ey - 2.2); c.lineTo(x - 2.2, ey + 2.2); c.stroke(); }
  } else if (f.eyes === 'shut') {
    c.strokeStyle = col(EYE_SH); c.lineWidth = 1.2;
    for (const x of [lx, rx]) { c.beginPath(); c.moveTo(x - 2.4, ey); c.quadraticCurveTo(x, ey + 1.6, x + 2.4, ey); c.stroke(); }
  } else {
    const wide = f.eyes === 'wide', h = wide ? 3.6 : 2.6;
    for (const [x, s] of [[lx, 0.85], [rx, 1]] as Pt[]) {
      c.beginPath(); c.ellipse(x, ey, 2.8 * s, h * s, 0, 0, Math.PI * 2); fill(c, wide ? '#FFFFFF' : EYE);
      if (wide) { c.beginPath(); c.ellipse(x + 0.4, ey, 1.7 * s, 2.4 * s, 0, 0, Math.PI * 2); fill(c, EYE); }
      c.fillStyle = col('#0B0A0E'); c.fillRect(x - 0.45 + (wide ? 0.4 : 0.6), ey - h * s * 0.8, 0.9, h * s * 1.6);
      c.fillStyle = col('#FFFFFF'); c.fillRect(x + 0.8, ey - 1.4, 0.8, 0.8);
    }
    if (!wide) {
      // (the brows: heavy, crushed down into a V over the eyes, cutting off their tops)
      const d = deep ? 1.4 : 0;
      c.beginPath(); c.moveTo(lx - 4, ey - 4 - d * 0.5); c.lineTo(hx + 1.5, ey - 0.6 + d); c.lineTo(hx + 1.5, ey - 3); c.lineTo(lx - 4, ey - 6.5); c.closePath(); fill(c, FUR);
      c.beginPath(); c.moveTo(rx + 4, ey - 4 - d * 0.5); c.lineTo(hx + 2, ey - 0.6 + d); c.lineTo(hx + 2, ey - 3); c.lineTo(rx + 4, ey - 6.5); c.closePath(); fill(c, FUR);
      c.strokeStyle = col(FUR_HI); c.lineWidth = 0.9; c.beginPath(); c.moveTo(lx - 4, ey - 4.6 - d * 0.5); c.lineTo(hx + 1.5, ey - 1.3 + d); c.moveTo(rx + 4, ey - 4.6 - d * 0.5); c.lineTo(hx + 2, ey - 1.3 + d); c.stroke();
    }
  }
  // (the mouth: by the mood, or what the moment wants: a hiss, a hack, a yowl, the tongue out; talking, it works)
  const my = hy + 5.5, mx = hx + 6;
  const m = f.mouth !== 'auto' ? f.mouth : isTalkingNow() ? 'talk' : mood === 'roar' ? 'hiss' : mood === 'yell' ? 'yowl' : mood === 'scowl' ? 'grit' : 'w';
  const open = m === 'talk' ? [3.4, 1.4, 4.4, 2.2][Math.floor(frame / 4) % 4] : m === 'hiss' ? 4.5 : m === 'yowl' ? 5.5 : m === 'hack' ? 5 : m === 'tongue' ? 2.5 : 0;
  if (open > 0) {
    c.beginPath(); c.roundRect(mx - 4.5, my - 1, 9, open + 1.2, [1.5, 1.5, 3, 3]); fill(c, '#3A0A14');
    c.beginPath(); c.ellipse(mx, my + open - 0.6, 3, 1.3, 0, 0, Math.PI * 2); fill(c, '#E0607E');
    // (the fangs)
    c.fillStyle = col('#FFFFFF');
    for (const x of [mx - 3.2, mx + 2.2]) { c.beginPath(); c.moveTo(x, my - 1); c.lineTo(x + 1, my + 2); c.lineTo(x + 2, my - 1); c.closePath(); c.fill(); }
    if (m === 'hack') { c.beginPath(); c.arc(mx + 4.5, my + 2, 2.2, 0, Math.PI * 2); fill(c, '#7A6656'); }
  } else if (m === 'grit') {
    c.beginPath(); c.roundRect(mx - 5, my - 1, 10, 4, 1); fill(c, '#3A0A14');
    c.fillStyle = col('#FFFFFF'); c.fillRect(mx - 4.4, my - 0.5, 8.8, 1.4); c.fillRect(mx - 4.4, my + 1.4, 8.8, 1.2);
    c.fillStyle = col('#3A0A14'); for (let k = -3; k <= 3; k += 2) c.fillRect(mx + k, my - 0.5, 0.5, 3.1);
  } else {
    // (the cat's "w", set hard)
    c.strokeStyle = col('#3A0A14'); c.lineWidth = 1.1;
    c.beginPath(); c.moveTo(mx - 3.5, my); c.quadraticCurveTo(mx - 1.6, my + 1.8, mx, my - 0.2); c.quadraticCurveTo(mx + 1.6, my + 1.8, mx + 3.5, my); c.stroke();
  }
  if (m === 'tongue') { c.beginPath(); c.ellipse(mx + 1, my + 4.5, 2, 3, 0.2, 0, Math.PI * 2); fill(c, '#E0607E'); }
  // (the whiskers, out of the muzzle both ways)
  c.strokeStyle = col('#FFFFFF'); c.lineWidth = 0.7;
  for (let k = -1; k <= 1; k++) {
    c.beginPath(); c.moveTo(hx + 9, hy + 3 + k * 1.3); c.quadraticCurveTo(hx + 14, hy + 2 + k * 2, hx + 18, hy + 1 + k * 3.2); c.stroke();
    c.beginPath(); c.moveTo(hx + 1, hy + 3 + k * 1.3); c.quadraticCurveTo(hx - 4, hy + 2 + k * 2, hx - 7, hy + 1.5 + k * 3); c.stroke();
  }
};

// ---------------------------------------------------------------------------------------------------------------
// His own frames (drawPlayer's, for every pose it draws him in)

/** The elbow for an arm from shoulder s to fist f (upper arm 12, forearm 11), bent out or in. */
const elbowOf = (s: Pt, f: Pt, out: boolean): Pt => {
  const a = 12, b = 11, dx = f[0] - s[0], dy = f[1] - s[1], d = Math.max(1, Math.min(a + b - 0.5, Math.hypot(dx, dy)));
  const base = Math.atan2(dy, dx), off = Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))));
  const ang = base + (out ? -off : off);
  return [s[0] + Math.cos(ang) * a, s[1] + Math.sin(ang) * a];
};
const reachTo = (s: Pt, f: Pt, m = 22.5): Pt => { const dx = f[0] - s[0], dy = f[1] - s[1], d = Math.hypot(dx, dy); return d <= m ? f : [s[0] + (dx / d) * m, s[1] + (dy / d) * m]; };
/** The knee for a leg from hip h to foot f (thigh 14, shin 13), bent forward or back. */
const kneeOf = (h: Pt, f: Pt, fwd: boolean): Pt => {
  const a = 14, b = 13, dx = f[0] - h[0], dy = f[1] - h[1], d = Math.max(1, Math.min(a + b - 0.5, Math.hypot(dx, dy)));
  const base = Math.atan2(dy, dx), off = Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))));
  const ang = base + (fwd ? -off : off);
  return [h[0] + Math.cos(ang) * a, h[1] + Math.sin(ang) * a];
};

/** A figure: his hips and how far his upper body leans about them (+ forward), his paws (near, far), his feet (near,
 *  far: knees found), his head's tilt, the mood. */
export interface CatFig {
  hip: Pt; lean: number;
  fN: Pt; fF: Pt; tN: Pt; tF: Pt; kneeFwd?: boolean; toeN?: number; toeF?: number;
  headRot?: number; headDx?: number; headDy?: number; mood: Mood;
  /** The near paw's elbow bent down (holding something out) rather than out. */
  nearDown?: boolean;
  /** Something in the near paw, drawn over it (his weapon). */
  hold?: (c: Ctx, x: number, y: number) => void;
}
/** Draws a figure (sprite space: feet at the origin, facing +x). */
export const drawCatFig = (c: Ctx, q: CatFig, frame: number) => {
  const cs = Math.cos(q.lean), sn = Math.sin(q.lean);
  const T = (x: number, y: number): Pt => [q.hip[0] + x * cs - y * sn, q.hip[1] + x * sn + y * cs];
  const sF = T(-8, -22), sN = T(11, -22);
  const hF = T(-4, 0), hN = T(4, 0);
  catLeg(c, hF, kneeOf(hF, q.tF, q.kneeFwd ?? true), q.tF, q.toeF ?? 0, true);
  const fF = reachTo(sF, q.fF);
  catArmTo(c, sF, elbowOf(sF, fF, false), fF, true);
  catLeg(c, hN, kneeOf(hN, q.tN, q.kneeFwd ?? true), q.tN, q.toeN ?? 0, false);
  c.save(); c.translate(q.hip[0], q.hip[1]); c.rotate(q.lean);
  catTorso(c, frame);
  c.save(); c.translate(3 + (q.headDx ?? 0), -37 + (q.headDy ?? 0)); c.rotate(q.headRot ?? 0); catHead(c, 0, 0, q.mood, frame); c.restore();
  c.restore();
  const fN = reachTo(sN, q.fN);
  catArmTo(c, sN, elbowOf(sN, fN, !q.nearDown), fN, false, 5.5);
  if (q.hold) q.hold(c, fN[0] - 1, fN[1] - 4);
};

export interface CatPlayerOpts {
  frame: number;
  /** Something in his paw (his weapon, held the way the gun is: grip at (x, y)), or null (empty-pawed). */
  hold: ((c: Ctx, x: number, y: number) => void) | null;
  /** The gun's a hairball: nothing in his paw, his mouth's the business end. */
  hairball: boolean;
  hurt: boolean;
  angry: boolean;
}

/** Where his paw holds his weapon (muzzle.ts's HOLD, the weapon's grip, less the paw's offset), standing and ducked. */
const HOLD_PAW: Pt = [19, -36], DUCK_PAW: Pt = [21, -20], SLIDE_PAW: Pt = [2, -34];

/** Meathead the cat, in whatever he's doing (drawPlayer's, inside his sprite: feet at the origin, facing +x). */
export const drawCatPlayer = (c: Ctx, p: Player, state: GameState, o: CatPlayerOpts) => {
  const f = o.frame;
  const charging = p.isCharging && !p.isSliding, air = !p.isGrounded && !p.swimming;
  const walking = !air && Math.abs(p.vel.x) > 0.4 && !charging && !p.isDucking && !p.isDivekicking;
  // (just hacked one up: mouth open, head jutted)
  const hacked = o.hairball && p.shootCooldown > GUN_COOLDOWN - 7;
  const hold = o.hairball ? null : o.hold;
  setCatClaws(false); setCatFace({ ears: o.angry ? 'back' : 'up', twitch: f % 190 < 10 });
  setCatTail(Math.sin(f * 0.05) * 0.6, 0.55);
  let q: CatFig;
  if (o.hurt) {
    // Knocked back: fur puffed out, tail bottle-brushed, eyes like dinner plates, paws flung up
    setCatFace({ eyes: 'wide', ears: 'flat', mouth: 'yowl', puff: true });
    setCatTail(0.6, 0.9, true);
    q = { hip: [-1, -24], lean: -0.3, fF: [-20, -52], fN: [16, -54], tN: [5, 0], tF: [-7, 0], mood: 'yell', headRot: -0.15 };
  } else if (p.isSliding) {
    // The slide: feet first along the floor, leaning back, the lead hind paw's claws out in front, a forepaw planted behind
    setCatClaws(!hold, true); setCatFace({ ears: 'flat', mouth: 'hiss' }); setCatTail(-0.8, 0.1);
    q = { hip: [-4, -12], lean: -0.55, tN: [24, -3], tF: [8, -2], toeN: -0.2, fF: [-22, -2], fN: hold ? SLIDE_PAW : [14, -26], mood: 'roar', hold: hold ?? undefined, nearDown: true };
  } else if (charging) {
    // The charge: claws out, the near paw thrust out in front raking, the far one trailing, flat out, ears back, hissing
    setCatClaws(true); setCatFace({ ears: 'flat', mouth: 'hiss' }); setCatTail(-1, 0.25);
    const run = Math.sin(f * 0.6) * 6;
    q = { hip: [2, -22], lean: 0.55, tN: [12 + run, 0], tF: [-16 - run, -5], fN: [34, -38], fF: [-24, -34], mood: 'roar', headRot: -0.35, headDx: 2 };
  } else if (p.isUppercutting) {
    // The uppercut: up off the floor, the near paw swiped straight up, claws out, the knee driven up
    setCatClaws(true); setCatFace({ ears: 'back', mouth: 'yowl' }); setCatTail(0.3, 0.1);
    q = { hip: [0, -28], lean: -0.15, tN: [12, -14], tF: [-4, -1], fN: [6, -86], fF: [-4, -42], mood: 'roar', headRot: -0.3 };
  } else if (p.isDivekicking) {
    // The dive kick: a pounce down, the hind paws leading, claws out, forepaws back, the tail streaming up behind
    setCatClaws(false, true); setCatFace({ ears: 'flat', mouth: 'yowl' }); setCatTail(-0.4, 1);
    q = { hip: [-2, -30], lean: 0.95, tN: [20, -4], tF: [12, -10], toeN: 0.5, toeF: 0.4, fF: [-22, -50], fN: [-12, -58], mood: 'roar', headRot: -0.6, kneeFwd: true };
  } else if (p.isDucking) {
    // Crouched low like he's about to pounce: haunches down, ears back, the far paw down by his foot, the tail low
    setCatFace({ ears: 'back' }); setCatTail(Math.sin(f * 0.12) * 0.9, 0);
    q = { hip: [0, -14], lean: 0.22, tN: [10, 0], tF: [-9, 0], fF: [-3, -6], fN: hold ? DUCK_PAW : [17, -22], mood: o.angry ? 'scowl' : 'grit', hold: hold ?? undefined, nearDown: !!hold, headRot: -0.12 };
  } else if (air) {
    // In the air: going up, tucked, the far paw up; coming down, legs reaching, the far paw out for balance, tail up
    const fall = Math.max(0, Math.min(1, (p.vel.y + 6) / 12));
    setCatTail(0.2, 0.6 + fall * 0.4);
    q = { hip: [0, -24], lean: -0.08 + fall * 0.15, tN: [7 - fall * 1, -10 + fall * 8], tF: [-5 - fall * 3, -12 + fall * 8], fF: [-14 - fall * 6, -60 + fall * 14], fN: hold ? HOLD_PAW : [14, -40], mood: 'grit', hold: hold ?? undefined, nearDown: !!hold };
  } else if (walking) {
    // The walk: a heavy swagger, the far paw swinging, the tail bobbing opposite
    const back = Math.sign(p.vel.x) === -p.facing;
    const ph = f * (back ? 0.22 : 0.28), s = Math.sin(ph), lift = (k: number) => Math.max(0, Math.cos(ph + k)) * 5;
    const bob = 2 * (1 - Math.abs(Math.cos(ph - 0.3)));
    const lean = 0.06 * Math.min(1, Math.abs(p.vel.x) / PLAYER_MOVE_SPEED) * (back ? -1 : 1);
    setCatTail(-s * 0.8, 0.5);
    q = { hip: [0, -24 + bob], lean, tN: [3 + s * 8, -lift(0)], tF: [-2 - s * 8, -lift(Math.PI)], fF: [-10 - s * 6, -27 + Math.abs(s) * 2], fN: hold ? [HOLD_PAW[0] + s * 2, HOLD_PAW[1] + bob] : [15 + s * 2, -38 + bob], mood: o.angry ? 'scowl' : 'grit', hold: hold ?? undefined, nearDown: !!hold };
  } else {
    // Stood about: breathing, the tail swishing, an ear flicking now and then; a paw up ready, or his weapon out
    const br = Math.sin(f * 0.08) * 0.8;
    q = { hip: [0, -24 + br * 0.5], lean: 0.02, tN: [5, 0], tF: [-4, 0], fF: [-12, -26 + br], fN: hold ? HOLD_PAW : [15, -38 + br], mood: o.angry ? 'scowl' : 'grit', hold: hold ?? undefined, nearDown: !!hold };
  }
  if (hacked) { setCatFace({ ...face, mouth: 'hack' }); q.headDx = (q.headDx ?? 0) + 2; q.headRot = (q.headRot ?? 0) - 0.1; }
  drawCatFig(c, q, f);
  // (the claws' swipe: three white streaks off the raking paw)
  if ((charging || p.isUppercutting) && !o.hurt) {
    c.strokeStyle = col('rgba(255, 255, 255, 0.7)'); c.lineWidth = 1.5;
    for (let k = 0; k < 3; k++) {
      c.beginPath();
      if (charging) { const y = -46 + k * 5; c.moveTo(18, y - 6); c.quadraticCurveTo(34, y - 2, 40, y + 8); }
      else { const x = 0 + k * 5; c.moveTo(x - 10, -60); c.quadraticCurveTo(x - 2, -86, x + 12, -92); }
      c.stroke();
    }
  }
  setCatClaws(false); setCatFace({}); setCatTail(0, 0.5);
};

/** His mouth in each of the poses the hairball comes out of (muzzle.ts mirrors these: CAT_MOUTH*), for checking. */
export const catHeadAt = (q: CatFig): Pt => { const cs = Math.cos(q.lean), sn = Math.sin(q.lean), x = 3 + (q.headDx ?? 0), y = -37 + (q.headDy ?? 0); return [q.hip[0] + x * cs - y * sn, q.hip[1] + x * sn + y * cs]; };
