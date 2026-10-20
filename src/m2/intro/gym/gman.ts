// The G-men in Meathead's gym (gym/index.ts moves them; this is what they are and how they look): the department's
// courier service, in Meathead 2's cast style (the cast kit: big heads, inked, lit from the left). Black suits, white
// shirts, black ties, the shades, the earpiece. A mixed bunch by their seed: men and women, every skin, thin and heavy,
// bald, gray, buns and ponytails, mustaches, beards. They never fight back: they carry boxes of his protein about,
// run, cower, link arms, crawl, huddle. And the two at the ring, padded head to toe (foam headgear, a chest
// protector, thigh pads, big mitts): one on the mat, one on a jetpack. Feet at the origin, facing right.

import type { Enemy } from '../../../m1/types';
import { registerM2Kind } from '../../kinds';
import { type Ctx, INK, dk, lt, blob, rect, dot, torso, arm, head, eyes, mouth, nose } from '../../cast/kit';

export const GMAN = 'm2:gman', GCRAWL = 'm2:gcrawl', GPAD = 'm2:gpad', GJET = 'm2:gjet';

/** What one's doing (the stage sets it; the drawing follows). */
export type Pose = 'carry' | 'walk' | 'flee' | 'cower' | 'link' | 'crawl' | 'huddle' | 'perch' | 'pad' | 'jet';
export interface GState { pose: Pose; seed: number; box?: boolean; said?: string | null; t: number }
export const gstate = new WeakMap<Enemy, GState>();
export const gOf = (e: Enemy) => gstate.get(e);

const SKINS = ['#F6DCC8', '#E8B890', '#C88A5C', '#9A6440', '#6A3E22', '#F2C4A8', '#4A2A16'];
const HAIR = ['#14100C', '#3A2614', '#8A5A20', '#BDB8B0', '#6A1E10', '#0A0A10'];
const SUIT = '#1C1C24', SHIRT = '#F1F1F4', TIE = '#0E0E12';
const PAD = '#C8281E', PAD2 = '#1E50B4', FOAM = '#F2D24A';

export const lookOf = (seed: number) => ({
  woman: Math.floor(seed / 5) % 5 < 2,
  skin: SKINS[seed % SKINS.length],
  hair: HAIR[Math.floor(seed / 7) % HAIR.length],
  heavy: seed % 4 === 0,
  face: Math.floor(seed / 3) % 4, // 0 plain, 1 mustache, 2 beard, 3 nothing extra
  bald: Math.floor(seed / 11) % 6 === 0,
  bun: Math.floor(seed / 13) % 2 === 0,
});
export const isWomanG = (e: Enemy) => lookOf(gOf(e)?.seed ?? 0).woman;

const shades = (c: Ctx, x: number, y: number, tilt = 0) => {
  c.save(); c.translate(x, y); c.rotate(tilt);
  blob(c, () => c.roundRect(-6, -2, 6, 4, 1), '#0A0A10', -6, 0, 1);
  blob(c, () => c.roundRect(1, -2, 6, 4, 1), '#0A0A10', 1, 7, 1);
  dot(c, -5, -1.5, 2, 1, '#8A8AA8'); dot(c, 2, -1.5, 2, 1, '#6A6A88');
  c.restore();
};

/** The head (the face by the look, scared), at (x, hy); `scared` how much. */
const gHead = (c: Ctx, L: ReturnType<typeof lookOf>, hx: number, hy: number, f: number, scared: number, padded = false) => {
  if (L.woman && !L.bald && !padded) {
    if (L.bun) blob(c, () => c.ellipse(hx - 8, hy - 7, 4.5, 4.5, 0, 0, Math.PI * 2), L.hair, hx - 12, hx - 4);
    else blob(c, () => { c.moveTo(hx - 6, hy - 6); c.quadraticCurveTo(hx - 16, hy - 2, hx - 13, hy + 9); c.quadraticCurveTo(hx - 9, hy + 2, hx - 4, hy - 2); c.closePath(); }, L.hair, hx - 16, hx - 4);
  }
  head(c, hx, hy, 8.5, 9.5, L.skin);
  if (padded) {
    // (foam headgear: the crown, the cheek guards, the chin strap)
    blob(c, () => { c.moveTo(hx - 10, hy + 2); c.quadraticCurveTo(hx - 11, hy - 14, hx, hy - 14); c.quadraticCurveTo(hx + 11, hy - 14, hx + 10, hy + 2); c.lineTo(hx + 7, hy - 4); c.lineTo(hx - 7, hy - 4); c.closePath(); }, PAD, hx - 11, hx + 11);
    for (const s of [-1, 1]) blob(c, () => c.roundRect(hx + s * 8 - 3, hy - 4, 6, 12, 2), PAD, hx + s * 8 - 3, hx + s * 8 + 3);
    dot(c, hx - 4, hy - 12, 8, 1.4, lt(PAD, 0.4));
  } else if (!L.bald) {
    blob(c, () => { c.moveTo(hx - 9, hy - 2); c.quadraticCurveTo(hx - 9, hy - 12, hx + 1, hy - 12); c.quadraticCurveTo(hx + 9, hy - 12, hx + 9.5, hy - 5); c.lineTo(hx + 4, hy - 7); c.lineTo(hx - 7, hy - 6); c.closePath(); }, L.hair, hx - 9, hx + 9.5);
  }
  if (scared > 0.5) { eyes(c, hx + 2, hy - 1, 3.6, 'wide', f, 0.8, 2.4, dk(L.skin, 0.1)); shades(c, hx + 2.5, hy - 8, -0.2); }
  else shades(c, hx + 2.5, hy - 1);
  nose(c, hx + 6, hy + 2.5, 2.2, L.skin);
  if (!L.woman && L.face === 1) blob(c, () => c.roundRect(hx + 1, hy + 4.4, 8, 2.4, 1), L.hair === '#BDB8B0' ? '#9CA3AF' : L.hair, hx + 1, hx + 9, 1);
  if (!L.woman && L.face === 2) blob(c, () => { c.moveTo(hx - 6, hy + 2); c.quadraticCurveTo(hx + 1, hy + 14, hx + 8, hy + 3); c.lineTo(hx + 7, hy + 6); c.quadraticCurveTo(hx + 1, hy + 10, hx - 4, hy + 5); c.closePath(); }, L.hair, hx - 6, hx + 8, 1);
  mouth(c, hx + 3.5, hy + 6.5, 5, scared > 0.5 ? 'o' : scared > 0 ? 'frown' : 'flat', f);
  if (L.woman) dot(c, hx + 2, hy + 6, 3, 1, '#9A2A30');
  // (the earpiece and its coil)
  if (!padded) { dot(c, hx - 8, hy, 2, 2, '#D4D4DC'); c.strokeStyle = '#B8B8C4'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(hx - 7.5, hy + 2); for (let k = 1; k <= 5; k++) c.lineTo(hx - 7.5 + (k % 2 ? -1 : 1), hy + 2 + k * 1.6); c.stroke(); }
  // (sweat, scared)
  if (scared > 0) { const d = (f % 30) / 30; dot(c, hx - 6, hy - 6 + d * 8, 1.5, 2.5, '#A8D8F0'); }
};

/** The protein box he's lugging (cardboard, PROTEIN on it in red, the tape). */
const box = (c: Ctx, x: number, y: number) => {
  rect(c, x, y, 22, 16, '#B88A50', 1.5);
  dot(c, x + 10, y, 2, 16, '#D8B070');
  dot(c, x + 2, y + 6, 18, 4, '#C81C1C'); dot(c, x + 4, y + 7, 14, 1, '#F8E8D0');
};

/** A G-man, by pose. */
export const drawGman = (c: Ctx, e: Enemy, f: number) => {
  const g = gOf(e), L = lookOf(g?.seed ?? 0), pose = g?.pose ?? 'walk';
  const moving = pose === 'walk' || pose === 'carry' || pose === 'flee';
  const sp = pose === 'flee' ? 0.5 : 0.25, stride = moving ? Math.sin(f * sp) * (pose === 'flee' ? 7 : 4) : 0;
  const shake = pose === 'cower' || pose === 'huddle' || pose === 'perch' ? (f % 4 < 2 ? 0.6 : -0.6) : 0;
  const w = L.heavy && !L.woman ? 30 : L.woman ? 21 : 25, hipW = L.heavy && !L.woman ? 28 : 21;
  const crouch = pose === 'cower' || pose === 'huddle' ? 10 : 0;
  c.save(); c.translate(shake, 0);
  // Legs: black trousers, shined shoes (bent, cowering)
  for (const s of [-1, 1]) {
    const x = s * 4.5 + s * stride * 0.5 - 3.5;
    if (crouch) { rect(c, x - s * 2, -20, 7, 17, s < 0 ? dk(SUIT, 0.15) : SUIT, 1.5); rect(c, x + 2, -26, 9, 8, SUIT, 2); }
    else rect(c, x, -30, 7, 27, s < 0 ? dk(SUIT, 0.15) : SUIT, 1.5);
    blob(c, () => c.roundRect(x - 1 + (s > 0 ? 1 : 0), -4.5, 10, 5, [2, 3, 1, 1]), '#08080C', x - 1, x + 9);
    dot(c, x + 3, -4, 4, 1, '#5A5A6A');
  }
  c.translate(0, crouch);
  // The far arm; the jacket (a belly on some); the shirt, the tie
  const armsUp = pose === 'cower' || pose === 'huddle' || pose === 'perch' || pose === 'flee';
  if (!armsUp && pose !== 'carry' && pose !== 'link') arm(c, -w / 2 + 3, -52, -w / 2, -32, SUIT, L.skin, 0.85, 6);
  if (pose === 'link') arm(c, -w / 2 + 3, -52, -w / 2 - 12, -40, SUIT, L.skin, 0.85, 6);
  if (pose === 'flee') arm(c, -w / 2 + 3, -52, -w / 2 - 6 - stride, -42, SUIT, L.skin, 0.85, 6);
  torso(c, -30, -56, w, hipW, SUIT);
  if (L.heavy && !L.woman) blob(c, () => c.ellipse(4, -38, 13, 9, 0, 0, Math.PI * 2), SUIT, -9, 17);
  blob(c, () => { c.moveTo(-5, -56); c.lineTo(5, -56); c.lineTo(0.5, -42); c.lineTo(-0.5, -42); c.closePath(); }, SHIRT, -5, 5, 1);
  dot(c, -1, -55, 2, 12, TIE);
  dot(c, -6, -55, 1.4, 14, lt(SUIT, 0.25));
  // The head (scared, unless he's on the job)
  const scared = pose === 'cower' || pose === 'huddle' || pose === 'flee' || pose === 'perch' ? 1 : pose === 'link' || pose === 'crawl' ? 0.3 : 0;
  gHead(c, L, 1, -66, f, scared);
  // The near arm: round the box, up over the face, out to the next man's, pumping
  if (pose === 'carry') { box(c, 4, -46); arm(c, w / 2 - 3, -52, 22, -40, SUIT, L.skin, 0.85, 6); }
  else if (armsUp) { arm(c, w / 2 - 3, -52, 12, -72 + shake * 2, SUIT, L.skin, 0.85, 6); if (pose !== 'flee') arm(c, -w / 2 + 3, -52, 2, -74, SUIT, L.skin, 0.85, 6); }
  else if (pose === 'link') arm(c, w / 2 - 3, -52, w / 2 + 12, -40, SUIT, L.skin, 0.85, 6);
  else arm(c, w / 2 - 3, -52, w / 2, -32, SUIT, L.skin, 0.85, 6);
  c.restore();
};

/** A G-man on his hands and knees, crawling (low: under a bullet), his box pushed along in front of him. */
export const drawCrawler = (c: Ctx, e: Enemy, f: number) => {
  const g = gOf(e), L = lookOf(g?.seed ?? 0);
  const step = Math.sin(f * 0.22) * 3;
  // (legs out behind: the knees down, the soles of his shoes up)
  rect(c, -26, -12, 16, 8, SUIT, 2); blob(c, () => c.roundRect(-30, -14, 6, 10, 2), '#08080C', -30, -24);
  rect(c, -18 + step, -10, 10, 8, dk(SUIT, 0.15), 2);
  // (the body along the floor, the tails of the jacket)
  blob(c, () => c.roundRect(-14, -20, 26, 12, 4), SUIT, -14, 12);
  dot(c, -2, -10, 12, 2, SHIRT);
  // (the arms down to the floor, walking him along)
  arm(c, 8, -16, 12 + step, -2, SUIT, L.skin, 0.8, 5);
  arm(c, 4, -16, 6 - step, -2, SUIT, L.skin, 0.8, 5);
  // (the head up, looking, scared)
  gHead(c, L, 18, -20, f, 0.7);
};

/** A padded trainer: headgear, a chest protector over the suit, thigh pads, big mitts; bouncing on his toes. The one
 *  on the jetpack has it on his back, the flame under it. */
export const drawPadded = (c: Ctx, e: Enemy, f: number) => {
  const g = gOf(e), L = lookOf(g?.seed ?? 0), jet = e.kind === GJET;
  const bounce = jet ? Math.sin(f * 0.08) * 2 : Math.abs(Math.sin(f * 0.16)) * 3;
  c.save(); c.translate(0, -bounce);
  if (jet) {
    // The jetpack: the tanks behind him, the nozzles, the flame (flickering, banded)
    rect(c, -22, -60, 9, 30, '#A1A1AA', 3); rect(c, -14, -62, 9, 32, '#C8C8D0', 3);
    dot(c, -21, -56, 2, 22, '#E4E4E7');
    for (const nx of [-19, -11]) {
      blob(c, () => { c.moveTo(nx - 3, -30); c.lineTo(nx + 3, -30); c.lineTo(nx + 4, -25); c.lineTo(nx - 4, -25); c.closePath(); }, '#52525B', nx - 4, nx + 4);
      const fl = 10 + (f % 3) * 4;
      c.fillStyle = '#F97316'; c.beginPath(); c.moveTo(nx - 3, -25); c.lineTo(nx + 3, -25); c.lineTo(nx, -25 + fl); c.fill();
      c.fillStyle = '#FDE047'; c.beginPath(); c.moveTo(nx - 1.5, -25); c.lineTo(nx + 1.5, -25); c.lineTo(nx, -25 + fl * 0.6); c.fill();
    }
  }
  // Legs, the thigh pads
  for (const s of [-1, 1]) {
    const x = s * 5 - 3.5 + (jet ? s * 2 : 0);
    rect(c, x, -30, 8, 27, s < 0 ? dk(SUIT, 0.15) : SUIT, 1.5);
    rect(c, x - 1.5, -30, 11, 13, s < 0 ? dk(PAD2, 0.15) : PAD2, 3);
    blob(c, () => c.roundRect(x - 1, -4.5, 11, 5, [2, 3, 1, 1]), '#08080C', x - 1, x + 10);
  }
  // The body: the suit, the chest protector over it (foam, quilted, laced up the side)
  torso(c, -30, -56, 30, 26, SUIT);
  blob(c, () => c.roundRect(-16, -58, 32, 30, 8), PAD, -16, 16);
  for (let k = 0; k < 3; k++) dot(c, -12, -51 + k * 7, 24, 1.2, dk(PAD, 0.3));
  dot(c, -6, -56, 14, 2, lt(PAD, 0.4));
  dot(c, -3, -28, 6, 3, FOAM);
  gHead(c, L, 1, -68, f, 0, true);
  // The mitts, up: big foam focus mitts
  for (const s of [-1, 1]) {
    arm(c, s * 12, -52, s * 15 + 6, -64, SUIT, L.skin, 0.9, 7);
    blob(c, () => c.ellipse(s * 15 + 7, -68, 8, 9, 0, 0, Math.PI * 2), s > 0 ? PAD : PAD2, s * 15 - 1, s * 15 + 15);
    dot(c, s * 15 + 4, -72, 5, 5, FOAM);
  }
  c.restore();
  void INK;
};

let registered = false;
export const registerGmen = () => {
  if (registered) return;
  registered = true;
  const gender = (e: Enemy): 'm' | 'f' => (isWomanG(e) ? 'f' : 'm');
  // (one hit and they're done: they're couriers)
  registerM2Kind({ kind: GMAN, stats: { w: 34, h: 66, hp: 10, contact: 0, mass: 200 }, draw: drawGman, head: { x: 2, y: -66, r: 9 }, gender, humanoid: true, grab: 'body', pathing: false });
  registerM2Kind({ kind: GCRAWL, stats: { w: 54, h: 26, hp: 10, contact: 0, mass: 200 }, draw: drawCrawler, head: { x: 18, y: -18, r: 9 }, gender, humanoid: true, grab: 'body', pathing: false });
  // (the padded ones: they can't be killed (the stage tops them up): the box, the weight of a big man)
  registerM2Kind({ kind: GPAD, stats: { w: 40, h: 70, hp: 60, contact: 0, mass: 260 }, draw: drawPadded, head: { x: 2, y: -68, r: 10 }, gender, humanoid: true, grab: 'body', pathing: false });
  registerM2Kind({ kind: GJET, stats: { w: 40, h: 70, hp: 60, contact: 0, mass: 260 }, draw: drawPadded, head: { x: 2, y: -68, r: 10 }, gender, humanoid: true, grab: 'body', pathing: false });
};
