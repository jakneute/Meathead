// Hell's wildlife, drawn the way the jungle's animals are (adventure/jungle/animalArt.ts): an ink line round every
// part, each material in steps (its shadow, its shade, itself, lit, its highlight), dithered where the light meets
// it; glinting eyes; frames for what each is doing (idling, moving, winding up, attacking, hurt, dead: limp, eyes
// crossed out, tongue out). Down here the light comes up off the lava, so the fur and hide catch a hot rim along the
// edges as well. Each frame's painted once into a stamp (by kind, look and frame) and put down with one drawImage;
// only what grows by the frame (the fireball in an imp's fist) is drawn live over it.
//
// All drawn facing right from a point at the feet (the engine turns them), inside the same boxes as before.

import type { Enemy } from '../../../m1/types';
import { stamp } from '../../../m1/game/render/stamp';
import { INK, ink, limb, lite, dark } from '../../../m1/game/render/npc/kit';
import { mix } from '../../../m1/game/render/backdrops/core';
import { LAVA } from './paint';

type Ctx = CanvasRenderingContext2D;

/** The five steps of a material: its shadow, its shade, itself, lit, its highlight. */
const ramp = (c: string) => [dark(c, 0.5), dark(c, 0.26), c, lite(c, 0.22), lite(c, 0.45)];
/** The lava's light on an edge: a color pushed hot. */
const hot = (c: string, k = 0.35) => mix(c, '#F07A30', k);

/** A part in steps (see the jungle's): clipped to its shape; lit upper left, shaded lower right, a dither row; inked.
 *  `rim`: the lava's light catching its underside too. */
const part = (g: Ctx, path: () => void, col: string, x: number, y: number, w: number, h: number, line = 1, rim = false) => {
  const r = ramp(col);
  g.save(); g.beginPath(); path(); g.clip();
  g.fillStyle = r[2]; g.fillRect(x, y, w, h);
  g.fillStyle = r[1]; g.beginPath(); g.ellipse(x + w * 0.78, y + h * 0.8, w * 0.55, h * 0.5, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = r[0]; g.beginPath(); g.ellipse(x + w * 0.95, y + h * 1.0, w * 0.4, h * 0.3, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = r[3]; g.beginPath(); g.ellipse(x + w * 0.3, y + h * 0.28, w * 0.42, h * 0.36, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = r[4]; g.beginPath(); g.ellipse(x + w * 0.24, y + h * 0.2, w * 0.18, h * 0.14, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = r[3];
  for (let px = x; px < x + w; px += 2) g.fillRect(px, y + h * 0.56 + ((px >> 1) % 2), 1, 1);
  if (rim) { g.fillStyle = hot(r[2], 0.45); g.beginPath(); g.ellipse(x + w * 0.5, y + h * 1.05, w * 0.45, h * 0.14, 0, 0, Math.PI * 2); g.fill(); }
  g.restore();
  g.beginPath(); path(); g.strokeStyle = INK; g.lineWidth = line; g.lineJoin = 'round'; g.stroke();
};
const tick = (g: Ctx, x: number, y: number, w: number, h: number, col: string, n: number, seed: number) => {
  const r = ramp(col);
  for (let i = 0; i < n; i++) {
    const s = Math.sin(seed * 12.9 + i * 78.2) * 43758.5, k = s - Math.floor(s), s2 = Math.sin(seed * 3.1 + i * 19.7) * 1e4, k2 = s2 - Math.floor(s2);
    g.fillStyle = k2 < 0.5 ? r[1] : r[3];
    g.fillRect(x + k * w, y + k2 * h, 1, 2);
  }
};
const shut = (g: Ctx, x: number, y: number, s = 2) => { g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(x - s, y - s); g.lineTo(x + s, y); g.lineTo(x - s, y + s); g.stroke(); };
const crossed = (g: Ctx, x: number, y: number, s = 2) => { g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - s, y - s); g.lineTo(x + s, y + s); g.moveTo(x + s, y - s); g.lineTo(x - s, y + s); g.stroke(); };
const tongue = (g: Ctx, x: number, y: number, len = 5) => { ink(g, () => g.ellipse(x, y + len / 2, 2, len / 2 + 1, 0.2, 0, Math.PI * 2), '#E87A90', 0.8); g.fillStyle = '#C0506A'; g.fillRect(x - 0.5, y + 1, 1, len - 1); };
/** A hell-eye: slanted, glowing yellow, a slit pupil (no glow round it: just the hot color). */
const hellEye = (g: Ctx, x: number, y: number, r: number, slant = 0.35, col = '#FDE047') => {
  ink(g, () => g.ellipse(x, y, r * 1.3, r, -slant, 0, Math.PI * 2), col, 0.8);
  g.fillStyle = '#FFF7C2'; g.fillRect(x - r * 0.9, y - r * 0.6, 1, 1);
  g.fillStyle = INK; g.fillRect(x + r * 0.15 - 0.5, y - r * 0.8, 1.2, r * 1.6);
};
/** Fire, in steps: tongues off a line from (x0, y) to (x1, y), `h` high, licking `fr` (0..2); the colors stepped in. */
const fire = (g: Ctx, x0: number, x1: number, y: number, h: number, fr: number, seed: number) => {
  const cols = [LAVA[3], LAVA[5], LAVA[6], LAVA[7]];
  for (let i = 0; i < cols.length; i++) {
    const k = 1 - i * 0.24;
    g.fillStyle = cols[i]; g.beginPath(); g.moveTo(x0 + (x1 - x0) * (1 - k) * 0.3, y);
    const n = Math.max(2, Math.round((x1 - x0) / 6));
    for (let j = 0; j <= n; j++) {
      const t = j / n, x = x0 + (x1 - x0) * (0.15 * (1 - k) + t * (1 - 0.3 * (1 - k)));
      const s = Math.sin(seed * 7.1 + j * 2.3 + fr * 2.1), th = h * k * (0.55 + 0.45 * Math.abs(s));
      g.lineTo(x - 1.5, y - th * (j % 2 ? 0.55 : 1)); g.lineTo(x + 1.5, y - th * (j % 2 ? 0.55 : 1) + 1);
    }
    g.lineTo(x1 - (x1 - x0) * (1 - k) * 0.3, y); g.closePath(); g.fill();
  }
};

type Mood = 'ok' | 'hurt' | 'dead';
const mood = (e: Enemy): Mood => (e.health <= 0 ? 'dead' : (e.hitFlash ?? 0) > 0 ? 'hurt' : 'ok');
/** Its look (0..2), seeded per enemy. */
const lookOf = (e: Enemy) => {
  if (e.variant !== undefined) return e.variant % 3;
  const s = String(e.id ?? ''); let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 3;
};
const put = (c: Ctx, key: string, x: number, y: number, w: number, h: number, paint: (g: Ctx) => void) => stamp(c, `hell-${key}`, x, y, w, h, paint);

// ---------------------------------------------------------------------------------------------------------------
// Imp: a little red devil. A big head on a pot belly, horns, pointed ears, a wide fanged grin, little bat wings, goat
// legs, an arrow-headed tail. Hopping about; sneering and flapping when it's seen him; the arm up over its head with a
// fireball growing in its fist (the tell); hurt (squashed, eyes shut, squealing); dead (limp, tongue out).

const IMP_SKIN = ['#C42A1E', '#B23A18', '#A8203A'];
const HORN = '#E2D4B4';

const paintImp = (g: Ctx, v: number, pose: string, fr: number, md: Mood) => {
  const skin = IMP_SKIN[v % 3], belly = mix(skin, '#F2A070', 0.5), wingC = dark(skin, 0.45);
  const hop = pose === 'hop' ? -2 : 0, sq = md === 'hurt' ? 2 : md === 'dead' ? 3 : 0;
  const flap = md === 'dead' ? 6 : pose === 'aim' || pose === 'hop' ? [-6, 2][fr % 2] : [-2, 1][fr % 2];
  g.save(); g.translate(0, hop);
  // The wings, behind: membranes on finger bones, scalloped
  const wing = (s: number, sh: number) => {
    const bx = -3 * s, by = -29 + sq;
    const tip = { x: bx - 17 * (s > 0 ? 1 : 0.7), y: by - 10 + flap };
    const pts: [number, number][] = [[bx, by], [tip.x, tip.y], [tip.x + 3, tip.y + 6], [bx - 12, by + 4 + flap * 0.3], [bx - 9, by + 7 + flap * 0.2], [bx - 4, by + 7]];
    ink(g, () => { pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); }, dark(wingC, sh), 0.9);
    g.strokeStyle = lite(wingC, 0.25 - sh); g.lineWidth = 1;
    g.beginPath(); g.moveTo(bx, by); g.lineTo(tip.x + 3, tip.y + 6); g.moveTo(bx, by); g.lineTo(bx - 12, by + 4 + flap * 0.3); g.stroke();
    g.fillStyle = hot(wingC, 0.3); g.fillRect(tip.x, tip.y, 2, 1);
  };
  wing(1, 0.25);
  // The tail: out behind and up, the arrowhead
  const tw = md === 'dead' ? 4 : [0, 2, 0, -2][fr % 4];
  g.lineCap = 'round';
  for (const [col, w] of [[INK, 4], [dark(skin, 0.15), 2]] as [string, number][]) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(-5, -12 + sq); g.quadraticCurveTo(-18, -8, -19, -18 + tw); g.stroke(); }
  g.lineCap = 'butt';
  ink(g, () => { g.moveTo(-19, -24 + tw); g.lineTo(-23, -17 + tw); g.lineTo(-19, -19 + tw); g.lineTo(-15, -17 + tw); g.closePath(); }, dark(skin, 0.1), 0.8);
  // The goat legs: the haunch, the shin back, the hoof
  for (const [lx, d, s] of [[-4, 0.25, -1], [4, 0.05, 1]] as [number, number, number][]) {
    const kneeX = lx + 4, shin = md === 'dead' ? 0 : pose === 'hop' ? 2 * s : 0;
    limb(g, lx, -13 + sq, kneeX, -7 + sq * 0.5, 5, dark(skin, d)); limb(g, kneeX, -7 + sq * 0.5, lx - 1 + shin, -2, 3.5, dark(skin, d + 0.1));
    ink(g, () => g.ellipse(lx + shin, -1.5, 3, 1.8, 0, 0, Math.PI * 2), '#1C1210', 0.7);
  }
  // The back arm
  limb(g, -5, -24 + sq, -9, -16 + sq, 3.4, dark(skin, 0.25));
  // The body: a pot belly, the paler front
  const by = -19 + sq * 0.5;
  part(g, () => g.ellipse(0, by, 9, 9.5 - sq * 0.3, 0, 0, Math.PI * 2), skin, -9, by - 10, 18, 19, 1, true);
  ink(g, () => g.ellipse(3, by + 2, 5.5, 6, 0, 0, Math.PI * 2), belly, 0.7);
  g.fillStyle = dark(belly, 0.2); g.fillRect(3, by + 3, 1, 1);
  // The near wing, peeking over the shoulder
  wing(-0.4, 0);
  // The head: big for it; ears, horns, the brow, the eyes, the grin
  const hx = 3, hy = -33 + sq * 1.4;
  for (const s of [-1, 1]) ink(g, () => { g.moveTo(hx + s * 7, hy - 2); g.lineTo(hx + s * 15, hy - 6); g.lineTo(hx + s * 8, hy + 3); g.closePath(); }, s < 0 ? dark(skin, 0.15) : skin, 0.8);
  part(g, () => g.ellipse(hx, hy, 10, 9.5, 0, 0, Math.PI * 2), skin, hx - 10, hy - 10, 20, 19, 1);
  // (horns: curving up and back, ringed)
  for (const [s, d] of [[-1, 0.2], [1, 0]] as [number, number][]) {
    const bx = hx + s * 5;
    ink(g, () => { g.moveTo(bx - 3, hy - 6); g.quadraticCurveTo(bx - 3 + s, hy - 13, bx + s * 3 - 2, hy - 18); g.quadraticCurveTo(bx + s * 2 + 1, hy - 11, bx + 3, hy - 7); g.closePath(); }, dark(HORN, d), 0.8);
    g.fillStyle = dark(HORN, 0.3 + d); g.fillRect(bx - 2, hy - 10, 4, 1); g.fillRect(bx - 1 + s, hy - 14, 3, 1);
    g.fillStyle = '#FFFFFF'; g.fillRect(bx - 2, hy - 9, 1, 2);
  }
  // (the brow, cross)
  g.fillStyle = dark(skin, 0.4); g.beginPath(); g.moveTo(hx - 7, hy - 6); g.lineTo(hx + 1, hy - 2); g.lineTo(hx + 9, hy - 6); g.lineTo(hx + 9, hy - 4); g.lineTo(hx + 1, hy); g.lineTo(hx - 7, hy - 4); g.closePath(); g.fill();
  if (md === 'dead') { crossed(g, hx - 2, hy, 1.8); crossed(g, hx + 6, hy, 1.8); }
  else if (md === 'hurt') { shut(g, hx - 2, hy, 1.8); shut(g, hx + 6, hy, 1.8); }
  else { hellEye(g, hx - 2, hy + 0.5, 1.8, -0.35); hellEye(g, hx + 6, hy + 0.5, 1.8, 0.35); }
  // (the mouth: a wide grin, fangs; open squealing hurt, or yelling winding up)
  if (md === 'hurt' || pose === 'wind') {
    ink(g, () => g.ellipse(hx + 2, hy + 6, 4, 3, 0, 0, Math.PI * 2), '#3A0808', 0.8);
    g.fillStyle = '#F8FAFC'; g.fillRect(hx - 1, hy + 3.5, 1.5, 2); g.fillRect(hx + 4, hy + 3.5, 1.5, 2);
  } else {
    ink(g, () => { g.moveTo(hx - 6, hy + 4); g.quadraticCurveTo(hx + 2, hy + 10, hx + 10, hy + 3); g.quadraticCurveTo(hx + 2, hy + 7, hx - 6, hy + 4); g.closePath(); }, '#3A0808', 0.8);
    g.fillStyle = '#F8FAFC';
    for (const tx of [hx - 3, hx + 1, hx + 5]) { g.beginPath(); g.moveTo(tx, hy + 5); g.lineTo(tx + 1, hy + 7.5); g.lineTo(tx + 2, hy + 5); g.fill(); }
  }
  if (md === 'dead') tongue(g, hx + 3, hy + 6, 5);
  // The front arm: down, claws out; pointing at him; up over its head with the fireball
  let hand = { x: 9, y: -12 + sq };
  if (md === 'dead') hand = { x: 10, y: -6 };
  else if (md === 'hurt') hand = { x: 2, y: hy - 8 };
  else if (pose === 'aim') hand = [{ x: 13, y: -24 }, { x: 13, y: -22 }][fr % 2];
  else if (pose === 'wind') hand = [{ x: 9, y: -44 }, { x: 10, y: -47 }, { x: 10, y: -48 }][fr];
  const sh = { x: 4, y: -24 + sq };
  const el = { x: (sh.x + hand.x) / 2 + (pose === 'wind' ? 4 : 2), y: (sh.y + hand.y) / 2 + 2 };
  limb(g, sh.x, sh.y, el.x, el.y, 3.6, skin); limb(g, el.x, el.y, hand.x, hand.y, 3, lite(skin, 0.08));
  ink(g, () => g.arc(hand.x, hand.y, 2.2, 0, Math.PI * 2), lite(skin, 0.1), 0.8);
  g.fillStyle = HORN; g.fillRect(hand.x + 1.5, hand.y - 1, 1.5, 1); g.fillRect(hand.x + 1.5, hand.y + 1, 1.5, 1);
  g.restore();
};

export const drawImpArt = (c: Ctx, e: Enemy, f: number) => {
  const md = mood(e), v = lookOf(e), t = e.aiTimer ?? 0, air = Math.abs(e.vel.y) > 0.01;
  let pose = air ? 'hop' : 'idle', fr = Math.floor((f + v * 11) / 10) % 4;
  if (e.aiState === 'aim') { pose = air ? 'hop' : 'aim'; fr = Math.floor(f / 6) % 2; }
  if (e.aiState === 'wind') { pose = 'wind'; fr = Math.min(2, Math.floor(t / 6)); }
  if (md !== 'ok') { pose = md; fr = 0; }
  put(c, `imp-${v}-${pose}-${fr}-${md}`, -30, -62, 54, 66, g => paintImp(g, v, pose, fr, md));
  // (the fireball in its fist, growing: the tell; stepped, no glow round it)
  if (e.aiState === 'wind' && md === 'ok') {
    const k = Math.min(1, t / 26), r = Math.round(3 + k * 6), x = 10, y = -48 - r - 1 + (air ? -2 : 0), fl = Math.floor(f / 3) % 2;
    c.fillStyle = INK; c.beginPath(); c.arc(x, y, r + 1, 0, Math.PI * 2); c.fill();
    c.fillStyle = LAVA[3]; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    c.fillStyle = LAVA[5]; c.beginPath(); c.arc(x - 1, y - 1 - fl, r * 0.72, 0, Math.PI * 2); c.fill();
    c.fillStyle = LAVA[7]; c.beginPath(); c.arc(x - 1.5, y - 1.5 - fl, r * 0.38, 0, Math.PI * 2); c.fill();
    for (let i = 0; i < 3; i++) { c.fillStyle = i % 2 ? LAVA[6] : LAVA[4]; c.fillRect(Math.round(x - r + i * r), Math.round(y - r - 3 - ((f + i * 5) % 6)), 2, 2); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Hellhound: a lean black dog, ribs showing, its mane and the tip of its tail on fire; long jaws, glowing eyes. A
// prowl, a full run (stretched out), the crouch (down, hackles up, teeth), the pounce (flat out, jaws wide), the
// landing; hurt, dead.

const HOUND = ['#2A1614', '#301A16', '#24161A'];

const paintHound = (g: Ctx, v: number, pose: string, fr: number, md: Mood) => {
  const hide = HOUND[v % 3], rimC = hot(hide, 0.5);
  const low = pose === 'crouch' ? 7 : pose === 'land' || md === 'hurt' ? 4 : md === 'dead' ? 12 : 0;
  const run = pose === 'run', stretch = pose === 'pounce' ? 1.12 : run ? 1.05 : 1;
  const ph = (pose === 'walk' || run) ? fr * (Math.PI / 2) : 0, stride = run ? 9 : 5;
  const flameFr = fr % 3;
  // A leg: shoulder or hip, the bend, the paw (claws out on the pounce)
  const leg = (bx: number, i: number, back: boolean) => {
    const col = back ? dark(hide, 0.3) : hide, isFront = i < 2;
    if (md === 'dead') { limb(g, bx, -14, bx + (isFront ? 12 : -12), -4, 5, col); return; }
    if (pose === 'pounce') {
      const ex = bx + (isFront ? 18 : -20), ey = -20 + (i % 2) * 3;
      limb(g, bx, -20, ex, ey, 5, col); ink(g, () => g.ellipse(ex + (isFront ? 3 : -3), ey, 3.5, 2.2, 0, 0, Math.PI * 2), lite(col, 0.1), 0.8);
      if (isFront) { g.fillStyle = '#E8E2D6'; for (let k = 0; k < 3; k++) g.fillRect(ex + 5, ey - 2 + k * 1.6, 2, 0.8); }
      return;
    }
    const a = ph + i * Math.PI * 0.5 + (back ? Math.PI : 0), sw = Math.sin(a) * stride, lift = Math.max(0, Math.cos(a)) * (run ? 5 : 3);
    const kx = bx + sw * 0.4 + (isFront ? 0 : -3), ky = -10 + low * 0.5;
    limb(g, bx, -20 + low, kx, ky, 6, col); limb(g, kx, ky, bx + sw, -2 - lift, 4, col);
    ink(g, () => g.ellipse(bx + sw + 2, -1.5 - lift, 3.5, 1.8, 0, 0, Math.PI * 2), lite(col, 0.06), 0.8);
  };
  leg(-20, 2, true); leg(16, 0, true);
  // The tail: a whip, its tip burning
  const lash = pose === 'crouch' ? [-5, 3][fr % 2] : run || pose === 'walk' ? [-2, 0, 2, 0][fr] : 0;
  const tx0 = -27 * stretch, ty0 = -26 + low;
  g.lineCap = 'round';
  for (const [col, w] of [[INK, 5], [hide, 3]] as [string, number][]) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(tx0 + 4, ty0); g.quadraticCurveTo(tx0 - 8, ty0 - 4 + lash, tx0 - 12, ty0 - 12 + lash * 1.5); g.stroke(); }
  g.lineCap = 'butt';
  if (md !== 'dead') fire(g, tx0 - 17, tx0 - 7, ty0 - 10 + lash * 1.5, 10, flameFr, 3);
  // The body: lean, deep in the chest, tucked at the belly; ribs; the back lit hot
  const by = -25 + low, rx = 25 * stretch;
  const body = () => { g.moveTo(-rx, by - 3); g.quadraticCurveTo(-rx + 6, by - 11, 0, by - 10); g.quadraticCurveTo(rx - 4, by - 12, rx + 2, by - 6); g.quadraticCurveTo(rx + 5, by + 6, rx - 6, by + 10); g.quadraticCurveTo(2, by + 10, -6, by + 3); g.quadraticCurveTo(-rx + 2, by + 8, -rx - 1, by + 3); g.closePath(); };
  part(g, body, hide, -rx, by - 12, rx * 2 + 4, 22, 1.2, true);
  g.save(); g.beginPath(); body(); g.clip();
  // (ribs)
  g.fillStyle = lite(hide, 0.18); for (let i = 0; i < 5; i++) g.fillRect(4 + i * 3.4, by - 3 + (i % 2), 1.4, 9 - i);
  g.fillStyle = dark(hide, 0.5); for (let i = 0; i < 5; i++) g.fillRect(5.6 + i * 3.4, by - 2 + (i % 2), 1, 8 - i);
  // (the hot rim along the belly, from the lava under it)
  g.fillStyle = rimC; g.fillRect(-rx, by + 6, rx * 2, 1);
  g.restore();
  tick(g, -rx + 4, by - 8, rx * 2 - 10, 10, hide, 18, v + 3);
  leg(-14, 3, false); leg(22, 1, false);
  // The head: the long skull, ears back, the snout; the jaw (wide on the pounce, open in the crouch)
  const hx = 28 * stretch - 2, hy = -33 + low * 1.2 + (pose === 'pounce' ? 4 : 0);
  const open = pose === 'pounce' ? 6 : pose === 'crouch' ? 3 : md === 'hurt' ? 4 : md === 'dead' ? 3 : 0;
  const earBack = pose === 'crouch' || pose === 'pounce' || run ? 4 : 0;
  ink(g, () => { g.moveTo(hx - 6, hy - 5); g.lineTo(hx - 9 - earBack, hy - 16 + earBack); g.lineTo(hx - 1, hy - 6); g.closePath(); }, dark(hide, 0.2), 0.8);
  // (the lower jaw)
  ink(g, () => { g.moveTo(hx - 2, hy + 3); g.lineTo(hx + 17, hy + 3 + open * 0.8); g.lineTo(hx + 16, hy + 6 + open); g.lineTo(hx - 1, hy + 7); g.closePath(); }, dark(hide, 0.1), 0.9);
  if (open) {
    g.fillStyle = '#7F1010'; g.beginPath(); g.moveTo(hx + 1, hy + 3); g.lineTo(hx + 16, hy + 3 + open * 0.8); g.lineTo(hx + 16, hy + 2); g.closePath(); g.fill();
    g.fillStyle = '#F8F4EA'; for (const tx of [hx + 6, hx + 11, hx + 15]) { g.beginPath(); g.moveTo(tx - 1, hy + 2); g.lineTo(tx, hy + 5); g.lineTo(tx + 1, hy + 2); g.fill(); }
    for (const tx of [hx + 8, hx + 13]) { g.beginPath(); g.moveTo(tx - 1, hy + 3 + open); g.lineTo(tx, hy + open); g.lineTo(tx + 1, hy + 3 + open); g.fill(); }
  }
  // (the skull and snout)
  part(g, () => { g.moveTo(hx - 8, hy - 2); g.quadraticCurveTo(hx - 6, hy - 9, hx + 2, hy - 7); g.lineTo(hx + 18, hy - 2); g.quadraticCurveTo(hx + 20, hy + 1, hx + 17, hy + 3); g.lineTo(hx - 2, hy + 4); g.quadraticCurveTo(hx - 9, hy + 4, hx - 8, hy - 2); g.closePath(); }, hide, hx - 9, hy - 9, 30, 14, 1);
  g.fillStyle = INK; g.fillRect(hx + 17, hy - 2, 2, 2);
  if (!open) { g.fillStyle = '#F8F4EA'; g.fillRect(hx + 12, hy + 3, 1, 2); g.fillRect(hx + 6, hy + 3, 1, 2); }
  if (md === 'dead') { crossed(g, hx + 2, hy - 3, 1.8); tongue(g, hx + 12, hy + 6, 7); }
  else if (md === 'hurt') shut(g, hx + 2, hy - 3, 2);
  else hellEye(g, hx + 2, hy - 3, 1.7, -0.3, '#FB923C');
  // The mane: burning, along the neck and shoulders
  if (md !== 'dead') {
    const mh = pose === 'crouch' || pose === 'pounce' ? 18 : 14;
    fire(g, hx - 14, hx - 2, hy - 2, mh, flameFr, 1);
    fire(g, -8, hx - 8, by - 8, mh - 2, (flameFr + 1) % 3, 2);
  } else {
    g.fillStyle = '#3A3430'; for (let i = 0; i < 4; i++) g.fillRect(hx - 12 + i * 4, hy - 4 - (i % 2), 2, 2);
  }
};

export const drawHoundArt = (c: Ctx, e: Enemy, f: number) => {
  const md = mood(e), st = e.aiState, v = lookOf(e), fast = Math.abs(e.vel.x) > 2.5;
  let pose = fast ? 'run' : 'walk', fr = Math.floor((f + v * 5) / (fast ? 4 : 7)) % 4;
  if (st === 'crouch') { pose = 'crouch'; fr = Math.floor(f / 5) % 2; }
  else if (st === 'pounce') { pose = 'pounce'; fr = Math.floor(f / 4) % 3; }
  else if (st === 'recover') { pose = (e.aiTimer ?? 0) < 12 ? 'land' : 'stand'; fr = Math.floor(f / 6) % 3; }
  if (Math.abs(e.vel.x) < 0.2 && (pose === 'walk' || pose === 'run')) { pose = 'stand'; fr = Math.floor(f / 6) % 3; }
  if (md !== 'ok') { pose = md; fr = Math.floor(f / 6) % 3; }
  if (md === 'dead') fr = 0;
  put(c, `hound-${v}-${pose}-${fr}-${md}`, -54, -60, 104, 64, g => paintHound(g, v, pose, fr, md));
};

// ---------------------------------------------------------------------------------------------------------------
// Fire bat: a sooty bat, big ears and fangs; the wings' trailing edges on fire. Flapping (up, level, down, level),
// the tell (hung there, wings right up, shrieking), the dive (wings swept back), hurt, dead.

const paintBat = (g: Ctx, pose: string, fr: number, md: Mood) => {
  const fur = '#2A1E20', mem = '#4A1418';
  const up = md === 'dead' ? 6 : pose === 'tell' ? -14 : pose === 'dive' ? 0 : [-12, -3, 7, -3][fr];
  const swept = pose === 'dive';
  const wing = (s: number, sh: number) => {
    const sx = s * 5, sy = -15;
    const tipX = s * (swept ? 22 : 30), tipY = -16 + up + (swept ? 10 : 0);
    const midX = s * (swept ? 16 : 20), midY = -6 + up * 0.5 + (swept ? 6 : 0);
    const pts: [number, number][] = [[sx, sy - 2], [tipX, tipY], [tipX - s * 2, tipY + 6], [midX + s * 2, midY + 2], [midX - s * 3, midY - 1], [s * 11, -8], [s * 7, -9]];
    ink(g, () => { pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); }, dark(mem, sh), 0.9);
    // (the finger bones)
    g.strokeStyle = lite(mem, 0.25 - sh); g.lineWidth = 1;
    g.beginPath(); g.moveTo(sx, sy - 1); g.lineTo(tipX, tipY + 1); g.moveTo(sx, sy - 1); g.lineTo(midX, midY); g.stroke();
    // (burning along the trailing edge: stepped tongues)
    if (md !== 'dead') {
      const fl = (fr + (s > 0 ? 1 : 0)) % 3;
      for (let k = 0; k < 4; k++) {
        const t = (k + 0.5) / 4, x = tipX + (s * 7 - tipX) * t, y = tipY + 6 + ((-9) - (tipY + 6)) * t + 1;
        const hgt = 5 + ((k + fl) % 3) * 2;
        g.fillStyle = LAVA[3]; g.beginPath(); g.moveTo(x - 3, y + 1); g.lineTo(x + s * 1.5, y - hgt); g.lineTo(x + 3, y + 1); g.closePath(); g.fill();
        g.fillStyle = LAVA[6]; g.beginPath(); g.moveTo(x - 1.2, y + 1); g.lineTo(x + s * 0.8, y - hgt * 0.55); g.lineTo(x + 1.2, y + 1); g.closePath(); g.fill();
      }
    }
  };
  wing(-1, 0.25);
  // The body: furry, round; the ears, the face
  part(g, () => g.ellipse(0, -14, 7, 8, swept ? 0.5 : 0, 0, Math.PI * 2), fur, -7, -22, 14, 16, 1, true);
  tick(g, -5, -20, 10, 12, fur, 10, 4);
  for (const s of [-1, 1]) ink(g, () => { g.moveTo(s * 2, -20); g.lineTo(s * 5, -28 - (pose === 'tell' ? 2 : 0)); g.lineTo(s * 6, -19); g.closePath(); }, s < 0 ? dark(fur, 0.15) : fur, 0.8);
  g.fillStyle = '#7A3A3A'; g.fillRect(-5, -25, 1, 3); g.fillRect(4, -25, 1, 3);
  if (md === 'dead') { crossed(g, -2, -16, 1.4); crossed(g, 3, -16, 1.4); tongue(g, 1, -11, 3); }
  else if (md === 'hurt') { shut(g, -2, -16, 1.4); shut(g, 3, -16, 1.4); }
  else { hellEye(g, -2, -16, 1.3, -0.3); hellEye(g, 3, -16, 1.3, 0.3); }
  // (the snout, fangs; mouth wide shrieking)
  g.fillStyle = '#4A2A2A'; g.fillRect(-1, -14, 3, 2);
  if (pose === 'tell' || pose === 'dive' || md === 'hurt') { ink(g, () => g.ellipse(0.5, -10, 2.6, 2.4, 0, 0, Math.PI * 2), '#5A0A0A', 0.7); g.fillStyle = '#FFFFFF'; g.fillRect(-1.5, -12, 1, 2); g.fillRect(2, -12, 1, 2); }
  else { g.fillStyle = '#FFFFFF'; g.fillRect(-1.5, -11.5, 1, 2); g.fillRect(2, -11.5, 1, 2); }
  // (the feet, tucked)
  g.fillStyle = INK; g.fillRect(-3, -7, 2, 3); g.fillRect(2, -7, 2, 3);
  wing(1, 0);
};

export const drawBatArt = (c: Ctx, e: Enemy, f: number) => {
  const md = mood(e);
  let pose = 'fly', fr = Math.floor(f / (e.aiState === 'climb' ? 3 : 4)) % 4;
  if (e.aiState === 'tell') { pose = 'tell'; fr = Math.floor(f / 3) % 3; }
  else if (e.aiState === 'dive') { pose = 'dive'; fr = Math.floor(f / 3) % 3; }
  if (md !== 'ok') { pose = md; fr = Math.floor(f / 4) % 3; }
  if (md === 'dead') fr = 0;
  put(c, `bat-${pose}-${fr}-${md}`, -36, -40, 72, 44, g => paintBat(g, pose, fr, md));
};

// ---------------------------------------------------------------------------------------------------------------
// Hell goat: a big shaggy black-red billy, its beard, a goat's eyes (glowing, the pupil a bar), and its horns: long,
// ridged, swept forward and out in front of it (the pointy end: don't charge into that). Plodding, pawing (head down,
// horn tips glinting, snorting), the charge (a gallop, head right down), the skid; hurt, dead.

const GOAT = ['#4A1A14', '#3E1612', '#521E18'];
const GOAT_HORN = '#D8CCB0';

const paintGoat = (g: Ctx, v: number, pose: string, fr: number, md: Mood) => {
  const fur = GOAT[v % 3], shag = dark(fur, 0.35);
  const low = pose === 'paw' || pose === 'charge' ? 10 : md === 'dead' ? 8 : md === 'hurt' ? 3 : 0;
  const gallop = pose === 'charge', ph = (pose === 'walk' || gallop) ? fr * (Math.PI / 2) : 0, stride = gallop ? 8 : 4;
  const leg = (bx: number, i: number, back: boolean) => {
    const col = back ? dark(fur, 0.3) : fur, isFront = i < 2;
    if (md === 'dead') { limb(g, bx, -20, bx + (isFront ? 10 : -10), -6, 6, col); ink(g, () => g.rect(bx + (isFront ? 8 : -14), -9, 6, 5), '#141010', 0.8); return; }
    let sw = Math.sin(ph + i * Math.PI * 0.5 + (back ? Math.PI : 0)) * stride, lift = Math.max(0, Math.cos(ph + i * Math.PI * 0.5 + (back ? Math.PI : 0))) * (gallop ? 5 : 2);
    // (pawing: the front one lifted and scraped back)
    if (pose === 'paw' && i === 0 && !back) { sw = fr % 2 ? -6 : 4; lift = fr % 2 ? 1 : 6; }
    if (pose === 'skid' && isFront) { sw = 8; lift = 0; }
    const kx = bx + sw * 0.3 + (isFront ? 2 : -2), ky = -12;
    limb(g, bx, -24, kx, ky, 7, col); limb(g, kx, ky, bx + sw, -4 - lift, 5, col);
    ink(g, () => g.rect(bx + sw - 3, -5 - lift, 7, 5), '#141010', 0.8);
    g.fillStyle = '#3A3230'; g.fillRect(bx + sw - 2, -5 - lift, 5, 1);
  };
  leg(-22, 2, true); leg(18, 0, true);
  // The tail: a short flag, up
  ink(g, () => { g.moveTo(-31, -44); g.quadraticCurveTo(-40, -52, -36, -58 + (fr % 2) * 2); g.quadraticCurveTo(-34, -50, -28, -46); g.closePath(); }, shag, 0.8);
  // The body: barrel-chested, shaggy (a fringe hanging under it), lit along the back, the lava under it
  const by = -40;
  part(g, () => g.ellipse(-2, by, 32, 15, 0, 0, Math.PI * 2), fur, -34, by - 15, 64, 30, 1.2, true);
  tick(g, -28, by - 10, 54, 20, fur, 44, v + 9);
  // (the shag hanging off its belly and chest)
  g.fillStyle = shag;
  for (let i = 0; i < 9; i++) { const x = -26 + i * 6, h = 4 + ((i * 7) % 4); g.beginPath(); g.moveTo(x, by + 10); g.lineTo(x + 3, by + 13 + h); g.lineTo(x + 6, by + 10); g.fill(); }
  g.strokeStyle = INK; g.lineWidth = 0.8; for (let i = 0; i < 9; i++) { const x = -26 + i * 6, h = 4 + ((i * 7) % 4); g.beginPath(); g.moveTo(x, by + 11); g.lineTo(x + 3, by + 13 + h); g.lineTo(x + 6, by + 11); g.stroke(); }
  leg(-16, 3, false); leg(24, 1, false);
  // The neck and head: down for the charge; the beard; the ears; the eyes; the horns, out front
  const hx = 32, hy = -54 + low;
  part(g, () => { g.moveTo(16, by - 12); g.lineTo(hx - 2, hy - 6); g.lineTo(hx + 6, hy + 8); g.lineTo(22, by + 8); g.closePath(); }, fur, 14, hy - 8, hx - 6, by - hy + 18, 1);
  // (the ear, flopped back)
  ink(g, () => { g.moveTo(hx - 4, hy - 2); g.lineTo(hx - 15, hy - 1 + (fr % 2)); g.lineTo(hx - 5, hy + 3); g.closePath(); }, dark(fur, 0.15), 0.8);
  // (the head: long, the muzzle down)
  part(g, () => { g.moveTo(hx - 6, hy - 6); g.quadraticCurveTo(hx + 4, hy - 9, hx + 10, hy - 3); g.lineTo(hx + 17, hy + 10); g.quadraticCurveTo(hx + 16, hy + 15, hx + 10, hy + 14); g.lineTo(hx - 4, hy + 6); g.closePath(); }, fur, hx - 6, hy - 9, 24, 24, 1);
  g.fillStyle = INK; g.fillRect(hx + 13, hy + 10, 2, 1);
  // (the beard)
  ink(g, () => { g.moveTo(hx + 4, hy + 11); g.lineTo(hx + 7, hy + 22); g.lineTo(hx + 11, hy + 13); g.closePath(); }, shag, 0.8);
  // (the eye: a goat's, glowing, the pupil a bar)
  if (md === 'dead') { crossed(g, hx + 4, hy - 1, 1.8); tongue(g, hx + 14, hy + 13, 6); }
  else if (md === 'hurt') shut(g, hx + 4, hy - 1, 2);
  else { ink(g, () => g.ellipse(hx + 4, hy - 1, 2.6, 2, 0.2, 0, Math.PI * 2), '#FBBF24', 0.7); g.fillStyle = INK; g.fillRect(hx + 2.4, hy - 1.5, 3.4, 1); }
  // (the horns: from the top of the head, back, then swept round and out in front; ridged, the tips sharp)
  const tip = pose === 'paw' || gallop ? 6 : 0;
  const horn = (dy: number, sh: number, len: number) => {
    ink(g, () => { g.moveTo(hx - 4, hy - 4 + dy); g.quadraticCurveTo(hx - 14, hy - 18 + dy, hx + 2, hy - 15 + dy); g.quadraticCurveTo(hx + 18, hy - 12 + dy + tip * 0.4, hx + len, hy - 6 + dy + tip); g.quadraticCurveTo(hx + 14, hy - 7 + dy + tip * 0.3, hx + 2, hy - 9 + dy); g.quadraticCurveTo(hx - 6, hy - 10 + dy, hx + 2, hy - 2 + dy); g.closePath(); }, dark(GOAT_HORN, sh), 1);
    g.fillStyle = dark(GOAT_HORN, sh + 0.3);
    for (let k = 0; k < 5; k++) g.fillRect(hx - 6 + k * 5, hy - 15 + dy + k * 1.2 + (k > 2 ? tip * 0.3 : 0), 1.2, 4);
    g.fillStyle = lite(GOAT_HORN, 0.5); g.fillRect(hx + 4, hy - 14 + dy, 8, 1);
  };
  horn(2, 0.3, 30); horn(0, 0, 34);
  if (pose === 'paw' && fr % 2 === 0) { g.fillStyle = '#FFFFFF'; g.fillRect(hx + 32, hy - 9 + tip, 3, 3); g.fillRect(hx + 33, hy - 11 + tip, 1, 7); g.fillRect(hx + 30, hy - 8 + tip, 7, 1); }
  // (snorting: steam off the muzzle)
  if (pose === 'paw') { g.fillStyle = 'rgba(214, 211, 209, 0.7)'; g.fillRect(hx + 18 + fr * 2, hy + 9 - fr, 4, 3); g.fillRect(hx + 22 + fr * 3, hy + 6 - fr, 3, 2); }
};

export const drawGoatArt = (c: Ctx, e: Enemy, f: number) => {
  const md = mood(e), st = e.aiState, v = lookOf(e);
  let pose = 'walk', fr = Math.floor((f + v * 9) / 9) % 4;
  if (st === 'paw') { pose = 'paw'; fr = Math.floor(f / 5) % 2; }
  else if (st === 'charge') { pose = 'charge'; fr = Math.floor(f / 4) % 4; }
  else if (st === 'skid') { pose = 'skid'; fr = 0; }
  if (Math.abs(e.vel.x) < 0.2 && pose === 'walk') { pose = 'stand'; fr = 0; }
  if (md !== 'ok') { pose = md; fr = 0; }
  put(c, `goat-${v}-${pose}-${fr}-${md}`, -46, -80, 120, 84, g => paintGoat(g, v, pose, fr, md));
};
