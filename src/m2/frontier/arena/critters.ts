// TUCKER'S FIGHT: THE STAMPEDES (the user's: "every time he fires his gun, various wildlife scurry across the screen,
// grounded and flying. you need to avoid those. the wildlife - except for the bees - won't try to hurt you. they are
// smaller wildlife too but will hurt you if they run into you"; and they're "particularly susceptible" to the soul
// sucker: what fills its bag here).
//
// Real small wildlife out of the real woods (new kinds, this fight's own), scared witless by the bang: they don't go for
// him, they just run (or fly) flat out across the glade the one way, over the felled trunk and the boulder, and off the
// far side; running into him hurts (a bump: each its own hurt lines and death screen, lines.ts FIGHT_HURT). Small and
// soft: anything kills them (the slide, a shot, a hazard, his bullets: the engine's deaths, undignified as ever), and
// the soul sucker pulls them in easily (little poise: a few of them make a spray's worth). Off the far side they're just
// gone (never a kill, never a callout). Drawn the wilds' animals' way (peak SNES): an ink line round every part, each
// material in steps (shade, itself, lit, a highlight), fur ticked in, glints in their wide, terrified eyes; a run cycle
// each (four frames), hurt (eyes screwed shut, flinching) and dead (belly up, legs stiff, eyes crossed out, tongue out),
// every frame painted once into a stamp:
//
//   rabbit    a cottontail, gray-brown, bounding (gathered, push, stretched, landing), ears laid back, the white scut
//   squirrel  a fox squirrel, rust and cream, scrabbling, its big bushy tail flicking in an S
//   raccoon   grizzled gray, hunched, the black mask and white brows, the ringed tail, waddling fast on its black hands
//   skunk     glossy black, the white blaze and the twin stripes, its plume up, scuttling
//   turkey    a wild tom: bronze and green sheen, barred wings, the fan half up and bouncing, the blue head, the red
//             wattle and snood flapping, the beard, running flat out on its long pink legs
//   duck      a mallard drake, flapping low: the green head, the white collar, the chestnut breast, the blue speculum
//   bat       a little brown bat out in daylight, flapping every which way, high: the finger bones through the membrane

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import { registerM2Kind, registerHurtLines, registerKindCallouts } from '../../kinds';
import { stamp } from '../../../m1/game/render/stamp';
import { mix, rampOf, part, INK } from '../wilds/paint';
import { GY, ROCK_X, ROCK_HW, ROCK_H } from './layout';
import { FIGHT_HURT, LION_CALLS } from './lines';
import { drawLion } from './beasts';

type Ctx = CanvasRenderingContext2D;

for (const [source, l] of Object.entries(FIGHT_HURT)) registerHurtLines(source, l.hurt, l.death);

export type Critter = 'rabbit' | 'squirrel' | 'raccoon' | 'skunk' | 'turkey' | 'duck' | 'bat';
export const GROUND_CRITTERS: Critter[] = ['rabbit', 'squirrel', 'raccoon', 'skunk', 'turkey'];
export const FLYING_CRITTERS: Critter[] = ['duck', 'bat'];
export const kindOf = (c: Critter) => `m2:fr_${c}` as const;
export const isCritter = (e: Enemy) => !!e.kind && CRITTER_KINDS.has(e.kind);

/** Each: its box, health (a little: anything kills it), its bump (before Meathead 2's softening), its mass (small: any
 *  hazard kills it; light: the sucker hauls it in), how fast it goes (px a frame, at the fight's start; quicker later). */
const DEF: Record<Critter, { w: number; h: number; hp: number; dmg: number; mass: number; speed: number }> = {
  rabbit: { w: 22, h: 18, hp: 9, dmg: 6, mass: 8, speed: 5.2 },
  squirrel: { w: 18, h: 14, hp: 7, dmg: 5, mass: 4, speed: 5.8 },
  raccoon: { w: 30, h: 22, hp: 13, dmg: 7, mass: 20, speed: 4.2 },
  skunk: { w: 30, h: 20, hp: 11, dmg: 6, mass: 14, speed: 3.8 },
  turkey: { w: 28, h: 34, hp: 13, dmg: 7, mass: 18, speed: 4.6 },
  duck: { w: 24, h: 16, hp: 8, dmg: 5, mass: 6, speed: 5 },
  bat: { w: 22, h: 14, hp: 6, dmg: 5, mass: 3, speed: 5.6 },
};
const CRITTER_KINDS = new Set<string>(Object.keys(DEF).map(k => kindOf(k as Critter)));
export const critterSpeed = (c: Critter) => DEF[c].speed;

/** How high the ground is at x (the felled trunk and the boulder: the ground ones run up over them). */
const humpAt = (x: number) => {
  let h = 0;
  const d = Math.abs(x - ROCK_X);
  if (d < ROCK_HW + 20) h = Math.max(h, d < ROCK_HW ? ROCK_H : ROCK_H * (1 - (d - ROCK_HW) / 20));
  return h;
};

// ---------------------------------------------------------------------------------------------------------------
// The AI: flat out across, the one way (e.facing), at e.aiX px a frame; the flyers along e.aiY, bobbing

const run = (ground: boolean) => (_ctx: FrameContext, e: Enemy) => {
  e.aiTimer = (e.aiTimer ?? 0) + 1;
  const t = e.aiTimer, sp = e.aiX ?? 4;
  // (knocked about and still alive: carried with it, settling)
  if ((e.pauseTimer ?? 0) > 0 && Math.abs(e.vel.x) > 0.5) { e.pos.x += e.vel.x; e.vel.x *= 0.88; }
  else e.pos.x += (e.facing ?? 1) * sp;
  const mx = e.pos.x + e.width / 2;
  if (ground) {
    // (a bound, up over whatever's lying in the way)
    const bound = e.kind === 'm2:fr_rabbit' ? Math.abs(Math.sin(t * 0.32)) * 9 : e.kind === 'm2:fr_turkey' ? Math.abs(Math.sin(t * 0.4)) * 3 : Math.abs(Math.sin(t * 0.5)) * 2;
    e.pos.y = GY - humpAt(mx) - e.height - bound;
  } else {
    const base = e.aiY ?? GY - 120;
    e.pos.y = base + Math.sin(t * (e.kind === 'm2:fr_bat' ? 0.31 : 0.12) + (e.variant ?? 0)) * (e.kind === 'm2:fr_bat' ? 22 : 8);
    if (e.kind === 'm2:fr_bat') e.pos.x += Math.sin(t * 0.23 + (e.variant ?? 0) * 2) * 1.6;
  }
  e.vel.y = 0;
  return true;
};

const flyer = (b: Enemy): Enemy => ({ ...b, enemyType: 'flyer', initialY: b.pos.y });
for (const c of Object.keys(DEF) as Critter[]) {
  const d = DEF[c], air = FLYING_CRITTERS.includes(c);
  registerM2Kind({
    kind: kindOf(c), stats: { w: d.w, h: d.h, hp: d.hp, contact: d.dmg, mass: d.mass, air },
    ai: run(!air), make: air ? flyer : undefined, draw: (cx, e, f) => DRAW[c](cx, e, f),
    head: { x: d.w * 0.4, y: -d.h * 0.7, r: Math.max(4, d.h * 0.25) }, gender: 'n', grab: 'critter', solid: false, pathing: false,
  });
}

// ---------------------------------------------------------------------------------------------------------------
// THE LIONS, LEAVING (the user's: "mountain lions after they're done with tucker can be sucked up/killed as well. they
// have quite a lot of poise so you need to focus as they walk away offscreen"). On him, they're the fight's own
// (fight.ts f.lions: not enemies, nothing gets at them, the mauling's never cut short); done with him, each one's made
// one of these where it stands, slinking off back the way it came: a real enemy, red to the eyes and full, that never
// goes for Meathead (harmless: it's eaten; bumping it does nothing). Big and heavy: a lot of health, so a lot of
// poise (the soul sucker's 0.6 of health + 10: it wants a second or two of it held right up on it; ground up, it's two
// and a half sprays in the bag), heavy enough to drag in slowly; the big hits (dive kick, uppercut) to kill it.
// Slower off than it used to slink (3.4), for the window. Like the critters: no heal or ammo off it, no drops, and
// off the view's edge (or at the arena's wall it's heading for) it's just gone, never a kill, never a callout.

export const LION_KIND = 'm2:fr_lion' as const;
export const isLion = (e: Enemy) => e.kind === LION_KIND;
/** Its health (poise 250), its mass (a man's 200), how fast it slinks off (px a frame). */
export const LION = { hp: 400, mass: 260, walk: 1.9 };

const slink = (_ctx: FrameContext, e: Enemy) => {
  e.aiTimer = (e.aiTimer ?? 0) + 1;
  e.pos.x += (e.facing ?? 1) * LION.walk;
  e.pos.y = GY - humpAt(e.pos.x + e.width / 2) - e.height;
  e.vel.y = 0;
  return true;
};
registerM2Kind({
  kind: LION_KIND, stats: { w: 88, h: 46, hp: LION.hp, contact: 0, mass: LION.mass },
  ai: slink, make: b => ({ ...b, harmless: true }),
  draw: (c, e, f) => drawLion(c, 0, 0, 1, f + (e.variant ?? 0) * 13, e.health <= 0 ? 'dead' : 'drag', { bloody: 0.8, hurt: (e.hitFlash ?? 0) > 0 }),
  head: { x: 36, y: -32, r: 9 }, gender: 'n', grab: 'body', solid: false, pathing: false,
});
registerKindCallouts(LION_KIND, LION_CALLS);

// ---------------------------------------------------------------------------------------------------------------
// Drawing (each from a point at its feet, facing right; the engine turns it round)

type Mood = 'ok' | 'hurt' | 'dead';
const mood = (e: Enemy): Mood => (e.health <= 0 ? 'dead' : (e.hitFlash ?? 0) > 0 ? 'hurt' : 'ok');
const put = (c: Ctx, key: string, x: number, y: number, w: number, h: number, paint: (g: Ctx) => void) => stamp(c, `frc-${key}`, x, y, w, h, paint);
/** A cycle's frame from the game's frame (n frames, `per` game frames each), offset by the animal's variant. */
const cyc = (f: number, e: Enemy, n: number, per: number) => Math.floor((f + (e.variant ?? 0) * 5) / per) % n;
const lite = (c: string, k = 0.25) => mix(c, '#FFFFFF', k);
const dark = (c: string, k = 0.3) => mix(c, INK, k);
type Path = () => void;
/** A fill with its ink line. */
const ink = (g: Ctx, path: Path, fill: string, line = 0.9) => { g.beginPath(); path(); g.fillStyle = fill; g.fill(); g.strokeStyle = INK; g.lineWidth = line; g.lineJoin = 'round'; g.stroke(); };
/** A shaded part (stepped: its shade, itself, lit, a highlight; dithered where they meet; inked). */
const sh = (g: Ctx, path: Path, col: string, x: number, y: number, w: number, h: number, line = 0.9) => part(g, path, rampOf(col), x, y, w, h, line);
const E = (g: Ctx, x: number, y: number, rx: number, ry: number, rot = 0): Path => () => g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2);
const P = (g: Ctx, pts: number[]): Path => () => { g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); };
const px = (g: Ctx, x: number, y: number, w: number, h: number, col: string) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
/** A limb: inked, its color, a lit line down its leading edge. */
const bone = (g: Ctx, x1: number, y1: number, x2: number, y2: number, w: number, col: string) => {
  g.lineCap = 'round';
  g.strokeStyle = INK; g.lineWidth = w + 1.6; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
  g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
  if (w > 1.5) { g.strokeStyle = lite(col, 0.3); g.lineWidth = Math.max(0.6, w * 0.3); g.beginPath(); g.moveTo(x1 - w * 0.22, y1 - w * 0.12); g.lineTo(x2 - w * 0.22, y2 - w * 0.12); g.stroke(); }
  g.lineCap = 'butt';
};
/** Fur ticked in over a box: short strokes, dark and light. */
const tick = (g: Ctx, x: number, y: number, w: number, h: number, col: string, n: number, seed: number) => {
  const r = rampOf(col);
  for (let i = 0; i < n; i++) {
    const a = Math.sin(seed * 12.9 + i * 78.2) * 43758.5, k = a - Math.floor(a), b = Math.sin(seed * 3.1 + i * 19.7) * 1e4, k2 = b - Math.floor(b);
    g.fillStyle = k2 < 0.5 ? r[2] : r[4]; g.fillRect(x + k * w, y + k2 * h, 1, 1.6);
  }
};
/** An eye: wide open and terrified (the white all round, the pupil, a glint), screwed shut (hurt), crossed out (dead). */
const eye = (g: Ctx, x: number, y: number, md: Mood, r = 1.3, iris = INK) => {
  if (md === 'dead') { g.strokeStyle = INK; g.lineWidth = 0.9; g.beginPath(); g.moveTo(x - r, y - r); g.lineTo(x + r, y + r); g.moveTo(x - r, y + r); g.lineTo(x + r, y - r); g.stroke(); return; }
  if (md === 'hurt') { g.strokeStyle = INK; g.lineWidth = 0.9; g.beginPath(); g.moveTo(x - r, y - r * 0.7); g.lineTo(x + r * 0.7, y); g.lineTo(x - r, y + r * 0.7); g.stroke(); return; }
  ink(g, E(g, x, y, r + 0.4, r + 0.3), '#FFFFFF', 0.6);
  g.fillStyle = iris; g.beginPath(); g.ellipse(x + r * 0.25, y, r * 0.62, r * 0.75, 0, 0, Math.PI * 2); g.fill();
  if (iris !== INK) { g.fillStyle = INK; g.fillRect(x + r * 0.1, y - r * 0.4, r * 0.4, r * 0.8); }
  px(g, x, y - r * 0.6, Math.max(0.8, r * 0.4), Math.max(0.8, r * 0.4), '#FFFFFF');
};
/** The tongue hanging out (dead). */
const tongue = (g: Ctx, x: number, y: number, len: number) => { ink(g, E(g, x, y + len / 2, 1.1, len / 2 + 0.5, 0.2), '#E87A90', 0.6); px(g, x - 0.3, y + 0.6, 0.6, len - 0.8, '#B04A62'); };
/** Belly up: the lot flipped over onto its back, its back on the ground (`h` its height standing). */
const bellyUp = (g: Ctx, h: number) => { g.translate(0, -h); g.scale(1, -1); };
const start = (g: Ctx, md: Mood, h: number) => { g.save(); if (md === 'dead') bellyUp(g, h); else if (md === 'hurt') g.translate(-1, 1); };

// ---- the cottontail
const RABBIT_LEGS = [
  { hh: [-8, -2, -1, -1], ff: [6, -1], tilt: 0.05 },
  { hh: [-11, -3, -16, -1], ff: [12, -4], tilt: -0.15 },
  { hh: [-12, -6, -17, -5], ff: [14, -8], tilt: -0.02 },
  { hh: [-4, -4, 2, -3], ff: [8, 0], tilt: 0.16 },
];
const paintRabbit = (g: Ctx, fr: number, md: Mood, v: number) => {
  const fur = ['#8A7A62', '#7C6C58', '#968470'][v % 3], furD = dark(fur, 0.25), pale = '#EADFCB';
  start(g, md, 18);
  const L = md === 'dead' ? { hh: [-8, -1, -11, 0], ff: [6, 0], tilt: 0 } : RABBIT_LEGS[md === 'ok' ? fr : 0];
  g.save(); g.translate(0, -8); g.rotate(L.tilt); g.translate(0, 8);
  // (the far legs, darker)
  bone(g, -5, -7, L.hh[0] + 1, L.hh[1], 2.6, furD); bone(g, L.hh[0] + 1, L.hh[1], L.hh[2] + 1, L.hh[3], 1.6, furD);
  bone(g, 6, -7, L.ff[0] - 1, L.ff[1], 1.6, furD);
  // (the scut: a white puff, shaded under)
  ink(g, E(g, -9.5, -11, 3.2, 3), '#F6F2EA', 0.8); px(g, -11, -9.6, 3, 1.4, '#C8C0B4'); px(g, -10.6, -12.4, 1.4, 1, '#FFFFFF');
  // (the body: stepped, ticked; the pale belly)
  sh(g, E(g, 0, -9, 9.4, 6.2), fur, -9.4, -15.2, 18.8, 12.4);
  g.save(); g.beginPath(); g.ellipse(0, -9, 9.4, 6.2, 0, 0, Math.PI * 2); g.clip(); g.fillStyle = pale; g.beginPath(); g.ellipse(2, -3.6, 7, 2.4, 0, 0, Math.PI * 2); g.fill(); g.restore();
  tick(g, -7, -14, 13, 6, fur, 14, v + 1);
  // (the near legs: the big hind foot, the little foreleg)
  bone(g, -4, -6, L.hh[0], L.hh[1], 3, fur); bone(g, L.hh[0], L.hh[1], L.hh[2], L.hh[3], 1.8, fur); px(g, L.hh[2] - 1, L.hh[3] - 0.6, 2.4, 1, pale);
  bone(g, 6, -6, L.ff[0], L.ff[1], 1.8, fur);
  // (the head: round, a pale cheek; the long ears laid flat back (they flap when it bounds))
  const fl = md === 'ok' ? [0, 0.12, 0.2, 0.06][fr] : 0.3;
  ink(g, E(g, 2.6, -17.6, 1.9, 6, -1.1 + fl), furD, 0.8);
  ink(g, E(g, 4.4, -17.4, 1.9, 6.4, -0.95 + fl), fur, 0.8); g.fillStyle = '#E8A8A0'; g.beginPath(); g.ellipse(4.6, -17.4, 0.9, 4.6, -0.95 + fl, 0, Math.PI * 2); g.fill();
  sh(g, E(g, 8.4, -12.2, 4.8, 4.2), fur, 3.6, -16.4, 9.6, 8.4);
  ink(g, E(g, 10.4, -10.8, 2.4, 1.8), pale, 0.6);
  px(g, 12.6, -12.4, 1.2, 1, '#D88890');
  g.strokeStyle = '#F4F0E8'; g.lineWidth = 0.4; g.beginPath(); g.moveTo(12, -11); g.lineTo(15.4, -12); g.moveTo(12, -10.6); g.lineTo(15.2, -10.2); g.stroke();
  eye(g, 8.8, -13.6, md, 1.2, '#3A1E10');
  if (md === 'dead') tongue(g, 11.4, -9.8, 3);
  g.restore(); g.restore();
};

// ---- the fox squirrel
const paintSquirrel = (g: Ctx, fr: number, md: Mood, v: number) => {
  const fur = ['#B05A2A', '#A4522A', '#B86634'][v % 3], furD = dark(fur, 0.25), belly = '#F0CFA0';
  start(g, md, 14);
  const k = md === 'ok' ? fr : 0, sc = md === 'dead' ? [[-3, -1], [5, 0]] : [[[-6, -1], [8, -2]], [[-3, 0], [4, -1]], [[-1, -2], [2, 0]], [[-5, 0], [6, -1]]][k];
  // (the tail: big and bushy, curled up over its back in an S, flicking; banded, its fringe pale)
  const fl = md === 'ok' ? [0, 0.18, 0.3, 0.12][k] : md === 'dead' ? -0.3 : 0.4;
  g.save(); g.translate(-6, -6); g.rotate(-fl);
  const tail = P(g, [0, 0, -6, -3, -9, -9, -7, -15, -2, -18, 2, -17, -2, -14, -4, -9, -1, -4]);
  ink(g, tail, fur, 0.9); g.save(); g.beginPath(); tail(); g.clip();
  px(g, -10, -18, 6, 18, lite(fur, 0.15)); px(g, -3, -18, 6, 18, furD); g.restore();
  g.strokeStyle = belly; g.lineWidth = 0.7; g.beginPath(); g.moveTo(-1.6, -17.4); g.lineTo(-7, -14.6); g.lineTo(-8.4, -9); g.lineTo(-5.4, -3); g.stroke();
  tick(g, -8, -16, 6, 12, fur, 10, v + 3);
  g.restore();
  // (the far legs)
  const [hf, ff] = sc as number[][];
  bone(g, -3, -4, hf[0] + 1, hf[1], 1.6, furD); bone(g, 4, -4, ff[0] - 1, ff[1], 1.2, furD);
  // (the body: crouched, stepped; the cream belly)
  sh(g, E(g, 0, -6.4, 6.8, 4.6), fur, -6.8, -11, 13.6, 9.2);
  g.save(); g.beginPath(); g.ellipse(0, -6.4, 6.8, 4.6, 0, 0, Math.PI * 2); g.clip(); g.fillStyle = belly; g.beginPath(); g.ellipse(1.4, -2.4, 5, 1.8, 0, 0, Math.PI * 2); g.fill(); g.restore();
  tick(g, -4, -10, 8, 4, fur, 8, v + 7);
  // (the near legs: the haunch, the scrabbling feet)
  ink(g, E(g, -3, -5, 3, 2.6), fur, 0.7);
  bone(g, -3, -4, hf[0], hf[1], 1.8, fur); bone(g, 4, -5, ff[0], ff[1], 1.3, fur);
  // (the head: the ear with its tuft, the white eye ring, the nose)
  sh(g, E(g, 6.6, -9.4, 3.8, 3.2), fur, 2.8, -12.6, 7.6, 6.4);
  ink(g, P(g, [4.2, -11.4, 4.6, -14.4, 6, -11.8]), fur, 0.6);
  ink(g, E(g, 8.4, -8.4, 1.8, 1.4), belly, 0.5);
  px(g, 10, -9.4, 0.9, 0.9, INK);
  eye(g, 7, -10.2, md, 1, '#2A1408');
  if (md === 'dead') tongue(g, 9, -7.6, 2.6);
  g.restore();
};

// ---- the raccoon
const paintRaccoon = (g: Ctx, fr: number, md: Mood, v: number) => {
  const fur = ['#7A7A80', '#86827C', '#6E7078'][v % 3], black = '#1E1E22', white = '#ECECEE';
  start(g, md, 22);
  const k = md === 'ok' ? fr : 0, sw = md === 'dead' ? 0 : [3, 1, -3, -1][k];
  // (the ringed tail: tapering back, banded black and gray, inked)
  for (let i = 4; i >= 0; i--) { const tx = -12 - i * 2.6, ty = -12 + i * 1.4 - (md === 'ok' ? [0, 1, 0, -1][k] * i * 0.3 : 0); ink(g, E(g, tx, ty, 3.2 - i * 0.2, 3.6 - i * 0.2), i % 2 ? black : lite(fur, 0.12), 0.6); }
  // (the far legs: black, the hands spread)
  bone(g, -8, -8, -8 - sw, -1, 2.6, black); bone(g, 7, -8, 7 + sw, -1, 2.4, black);
  // (the body: hunched up high in the middle, grizzled: stepped, heavily ticked, the guard hairs tipped pale)
  sh(g, () => { g.moveTo(-12, -9); g.quadraticCurveTo(-10, -21, 0, -20); g.quadraticCurveTo(10, -19, 12, -11); g.quadraticCurveTo(12, -5, 6, -5); g.lineTo(-8, -5); g.quadraticCurveTo(-13, -5, -12, -9); g.closePath(); }, fur, -12, -21, 24, 16);
  tick(g, -10, -19, 20, 12, fur, 26, v + 11);
  for (let i = 0; i < 8; i++) px(g, -8 + i * 2.4, -19.6 + Math.abs(i - 4) * 0.4, 1, 1, '#D8D8DC');
  // (the near legs, waddling; the little hands)
  bone(g, -6, -7, -6 + sw, -0.6, 3, black); bone(g, 8, -8, 8 - sw, -0.6, 2.8, black);
  for (const fx of [-6 + sw, 8 - sw]) { px(g, fx - 1.4, -1, 3.4, 1, '#3A3A40'); px(g, fx + 1.6, -1.4, 0.8, 0.8, '#5A5A60'); }
  // (the head: the round ears rimmed white, the black mask, the white brows and muzzle, the black nose)
  for (const ex of [7.6, 10.4]) { ink(g, E(g, ex, -19, 1.8, 2), fur, 0.6); px(g, ex - 1, -20.6, 2, 0.8, white); }
  sh(g, E(g, 11, -14.6, 5.6, 4.8), fur, 5.4, -19.4, 11.2, 9.6);
  g.fillStyle = white; g.beginPath(); g.ellipse(11.6, -16.6, 4.4, 1.4, -0.1, 0, Math.PI * 2); g.fill();
  g.fillStyle = black; g.beginPath(); g.moveTo(6.6, -15.6); g.quadraticCurveTo(10, -16.4, 14.4, -15.6); g.lineTo(14, -13); g.quadraticCurveTo(10, -12.4, 7, -13.4); g.closePath(); g.fill();
  ink(g, P(g, [12.4, -13.2, 17, -12.4, 16.4, -10.6, 12, -10.8]), white, 0.6);
  ink(g, E(g, 17, -12.2, 1.2, 1), black, 0.5); px(g, 16.6, -12.8, 0.6, 0.5, '#7A7A80');
  eye(g, 11.6, -14.4, md, 1, '#1A1008');
  if (md === 'dead') tongue(g, 15, -10.6, 3);
  g.restore();
};

// ---- the skunk
const paintSkunk = (g: Ctx, fr: number, md: Mood, v: number) => {
  const black = ['#1A1A20', '#1E1A1E', '#16181E'][v % 3], white = '#F2F2F4';
  start(g, md, 20);
  const k = md === 'ok' ? fr : 0, sw = md === 'dead' ? 0 : [2.4, 0.8, -2.4, -0.8][k];
  // (the plume: up and fluffed, a white stripe up its middle, its tip flicking)
  const fl = md === 'ok' ? [0, 0.08, 0.14, 0.06][k] : md === 'dead' ? 0.5 : 0.3;
  g.save(); g.translate(-9, -11); g.rotate(-0.25 + fl);
  const plume = P(g, [0, 0, -5, -2, -8, -9, -7, -16, -3, -21, 2, -20, 4, -15, 2, -8, 3, -2]);
  ink(g, plume, black, 0.9);
  g.save(); g.beginPath(); plume(); g.clip(); px(g, -9, -22, 5, 22, lite(black, 0.12)); g.restore();
  g.fillStyle = white; g.beginPath(); g.moveTo(-1, -1); g.quadraticCurveTo(-5, -9, -3, -19); g.lineTo(-1.4, -19); g.quadraticCurveTo(-3, -9, 0.6, -1.4); g.closePath(); g.fill();
  for (let i = 0; i < 6; i++) px(g, -7 + (i % 3) * 3, -18 + i * 2.6, 1, 1.4, '#3A3A44');
  g.restore();
  // (the far legs)
  bone(g, -6, -6, -6 - sw, -0.8, 2.2, black); bone(g, 6, -6, 6 + sw, -0.8, 2, black);
  // (the body: low, round-backed, glossy (a sheen along it); the twin white stripes from the crown down its back)
  sh(g, E(g, 0, -9.4, 11.4, 6.4), black, -11.4, -15.8, 22.8, 12.8);
  g.fillStyle = white; g.beginPath(); g.moveTo(9, -14); g.quadraticCurveTo(0, -17.6, -10, -12.6); g.lineTo(-10, -11); g.quadraticCurveTo(0, -15.6, 9, -12.4); g.closePath(); g.fill();
  px(g, -4, -15.2, 3, 1, '#C8C8D0'); px(g, -2, -9, 8, 1, '#4A4A56');
  // (the near legs, the long front claws)
  bone(g, -5, -5, -5 + sw, -0.6, 2.6, black); bone(g, 7, -5, 7 - sw, -0.6, 2.4, black);
  px(g, 7 - sw + 1, -1, 2, 0.6, '#D8D0C0');
  // (the head: pointed, the white blaze up its face, the black nose)
  sh(g, () => { g.moveTo(6, -14); g.quadraticCurveTo(12, -15, 15, -10); g.lineTo(13, -7.6); g.quadraticCurveTo(8, -6, 5, -9); g.closePath(); }, black, 5, -15, 10, 8);
  px(g, 9.4, -14.2, 1.4, 4.6, white); px(g, 10, -14, 0.6, 3, '#FFFFFF');
  ink(g, E(g, 14.6, -9.6, 1, 0.8), '#0A0A0C', 0.4);
  eye(g, 11.4, -11.6, md, 0.9, '#2A1408');
  if (md === 'dead') tongue(g, 13, -7.6, 2.6);
  g.restore();
};

// ---- the wild tom
const paintTurkey = (g: Ctx, fr: number, md: Mood, v: number) => {
  const bronze = ['#4A3018', '#523418', '#44301C'][v % 3], leg = '#C89090', headB = '#9AB8E0', red = '#D02424';
  start(g, md, 34);
  const k = md === 'ok' ? fr : 0, b = md === 'ok' ? [0, -1.2, -1.8, -0.6][k] : 0;
  const S = md === 'dead' ? [[-2, -4, -4, 0], [2, -4, 4, 0]] : [[[-6, -6, -9, 0], [4, -7, 8, -2]], [[-3, -7, -2, 0], [1, -7, 1, -3]], [[3, -7, 6, -1], [-4, -6, -8, -1]], [[0, -7, 1, -3], [-2, -7, -3, 0]]][k];
  g.save(); g.translate(0, b);
  // (the fan: half up behind, bouncing; each feather barred, its tip buff)
  for (let i = 0; i < 7; i++) {
    const a = -2.5 + i * 0.26 + (md === 'ok' ? [0, 0.04, 0.08, 0.04][k] : 0);
    g.save(); g.translate(-7, -20); g.rotate(a + Math.PI / 2);
    ink(g, E(g, 0, -6.4, 2.6, 7), i % 2 ? '#5A3A1E' : '#6E4828', 0.6);
    px(g, -2, -12, 4, 1.4, '#E8D4A0'); px(g, -1.6, -9, 3.2, 0.8, '#2A1A0C'); px(g, -1.6, -6, 3.2, 0.8, '#2A1A0C');
    g.restore();
  }
  // (the far leg, the spur)
  const [fl, nl] = S as number[][];
  bone(g, -1, -13, fl[0], fl[1] - 6, 1.6, dark(leg, 0.2)); bone(g, fl[0], fl[1] - 6, fl[2], fl[3], 1.2, dark(leg, 0.2));
  // (the body: bronze, iridescent: green and copper bands catch the light; the barred wing over it; the beard)
  sh(g, E(g, 0, -20, 9.6, 8.6), bronze, -9.6, -28.6, 19.2, 17.2);
  g.save(); g.beginPath(); g.ellipse(0, -20, 9.6, 8.6, 0, 0, Math.PI * 2); g.clip();
  for (let r = 0; r < 5; r++) for (let x = -9 + (r % 2) * 2; x < 9; x += 4) { px(g, x, -27 + r * 3.4, 2, 1, r % 2 ? '#B8743A' : '#4A8A5A'); px(g, x, -26 + r * 3.4, 2, 1, '#1A100A'); }
  g.restore();
  ink(g, P(g, [-6, -24, 4, -25, 7, -19, -2, -16, -8, -18]), '#3A2614', 0.7);
  for (let i = 0; i < 4; i++) { px(g, -6 + i * 3, -21.6, 1.6, 4, '#E8E0D0'); px(g, -6 + i * 3, -20, 1.6, 0.8, '#2A1A0C'); }
  g.strokeStyle = '#141008'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(7, -20); g.lineTo(8.4, -15); g.stroke();
  // (the near leg)
  bone(g, 1, -13, nl[0], nl[1] - 6, 1.8, leg); bone(g, nl[0], nl[1] - 6, nl[2], nl[3], 1.4, leg);
  px(g, nl[2] - 1, nl[3] - 0.4, 3.4, 0.8, dark(leg, 0.3));
  // (the neck up, the bare blue head bobbing forward, the red wattle and the snood flapping, the beak)
  const hb = md === 'ok' ? [0, 1.2, 2, 0.8][k] : 0;
  bone(g, 5, -24, 9 + hb, -31, 2.2, '#C8A8B8');
  ink(g, E(g, 10 + hb, -32, 3, 2.6), headB, 0.7); px(g, 9 + hb, -33.6, 2, 0.8, '#E8F0FF');
  ink(g, P(g, [12.6 + hb, -32.4, 15.6 + hb, -31.6, 12.6 + hb, -30.6]), '#D8B888', 0.5);
  const wf = md === 'ok' ? [0, 0.6, 1, 0.4][k] : 0;
  ink(g, E(g, 11.6 + hb, -28.8 + wf, 1.3, 2.6), red, 0.5);
  g.strokeStyle = red; g.lineWidth = 1; g.beginPath(); g.moveTo(12.6 + hb, -33); g.quadraticCurveTo(14.4 + hb + wf, -31, 13.6 + hb + wf, -28.6); g.stroke();
  eye(g, 10.2 + hb, -32.6, md, 0.9, '#3A1E0E');
  if (md === 'dead') tongue(g, 14 + hb, -31, 2.6);
  g.restore(); g.restore();
};

// ---- the mallard drake
const paintDuck = (g: Ctx, fr: number, md: Mood, v: number) => {
  const gray = ['#9C9A90', '#A4A096', '#949288'][v % 3], green = '#1E6A3A', chest = '#6A2C16';
  start(g, md, 16);
  const flap = md === 'ok' ? [1, 0.35, -0.7, 0.35][fr] : md === 'dead' ? 0.9 : 0.1;
  // (the far wing: behind, darker)
  const wing = (dx: number, col: string) => {
    const tipY = -9 - 12 * flap, tipX = -6 - 3 * Math.abs(flap) + dx;
    ink(g, P(g, [-3 + dx, -10, tipX, tipY, tipX + 5, tipY + 2 * Math.sign(flap || 1), 6 + dx, -9]), col, 0.8);
    px(g, -1 + dx, -10.6 - 4 * flap, 3.4, 1.4, '#2C5CC8'); px(g, -1 + dx, -11.4 - 4 * flap, 3.4, 0.6, '#F4F4F4'); px(g, -1 + dx, -9.2 - 4 * flap, 3.4, 0.6, '#F4F4F4');
  };
  wing(2, dark(gray, 0.3));
  // (the orange feet trailing)
  bone(g, -4, -5, -9, -3.4, 1, '#E8862A');
  // (the body: gray vermiculated, the chestnut breast, the black curled tail)
  sh(g, E(g, 0, -8, 9.4, 5), gray, -9.4, -13, 18.8, 10);
  ink(g, E(g, 6, -7.4, 4, 3.8), chest, 0.6); px(g, 4.4, -9.6, 2, 1, lite(chest, 0.3));
  ink(g, P(g, [-8, -9, -13, -10.6, -12, -7, -8, -6.6]), '#26262A', 0.6); g.strokeStyle = '#26262A'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(-10, -10); g.quadraticCurveTo(-12, -13, -10, -13.4); g.stroke();
  for (let i = 0; i < 6; i++) px(g, -6 + i * 2, -7 + (i % 2), 1.2, 0.6, dark(gray, 0.15));
  // (the green head, iridescent, the white collar, the yellow bill)
  px(g, 5, -11, 3.4, 1, '#F4F4F4');
  sh(g, E(g, 8.4, -13, 3.8, 3.2), green, 4.6, -16.2, 7.6, 6.4);
  px(g, 7, -15, 2, 0.8, '#6ADA9A');
  ink(g, P(g, [11.4, -13.4, 15.6, -12.6, 15.2, -11.4, 11.2, -11.6]), '#E8C020', 0.6); px(g, 14.6, -12.8, 0.8, 0.6, '#3A3A20');
  // (the near wing over it all)
  wing(0, gray);
  eye(g, 9, -13.6, md, 0.9, '#2A1A0A');
  if (md === 'dead') tongue(g, 13, -11.2, 2.4);
  g.restore();
};

// ---- the little brown bat
const paintBat = (g: Ctx, fr: number, md: Mood, v: number) => {
  const fur = ['#5A4030', '#4E3A2E', '#644838'][v % 3], mem = '#2E2028';
  start(g, md, 14);
  const flap = md === 'ok' ? [1, 0.3, -0.8, 0.3][fr] : 0.4;
  // (the wings: the membrane stretched between the finger bones, flapping; the far one darker)
  for (const s of [-1, 1]) {
    const col = s < 0 ? dark(mem, 0.15) : mem, tipY = -8 - 7 * flap;
    const pts = [0, -8, s * 6, -9 - 4 * flap, s * 12, tipY, s * 10, -4 - 3 * flap, s * 7, -5 - 2 * flap, s * 4, -3.4, s * 1.4, -4];
    ink(g, P(g, pts), col, 0.7);
    g.strokeStyle = lite(mem, 0.3); g.lineWidth = 0.5; g.beginPath();
    g.moveTo(s * 1.4, -7.6); g.lineTo(s * 6, -9 - 4 * flap); g.lineTo(s * 12, tipY); g.moveTo(s * 6, -9 - 4 * flap); g.lineTo(s * 10, -4 - 3 * flap); g.moveTo(s * 6, -9 - 4 * flap); g.lineTo(s * 7, -5 - 2 * flap); g.stroke();
    px(g, s * 6 - 0.5, -9.6 - 4 * flap, 1, 1, '#C8B0A0');
  }
  // (the body, furred; the big ears; the snout, the little fangs)
  sh(g, E(g, 0, -7, 3.8, 4.2), fur, -3.8, -11.2, 7.6, 8.4);
  tick(g, -2.6, -10, 5, 6, fur, 6, v + 5);
  ink(g, P(g, [-2.4, -10, -3.4, -15, -0.6, -11]), fur, 0.5); ink(g, P(g, [2.4, -10, 3.4, -15, 0.6, -11]), fur, 0.5);
  px(g, -2.6, -13.4, 0.8, 2, '#C88A90'); px(g, 2, -13.4, 0.8, 2, '#C88A90');
  eye(g, 1.4, -8.4, md, 0.7, '#1A0A08');
  px(g, 0.2, -5.8, 0.6, 1.2, '#FFFFFF'); px(g, 1.6, -5.8, 0.6, 1.2, '#FFFFFF');
  if (md === 'dead') tongue(g, 1, -5.6, 2);
  g.restore();
};

/** Each kind: its painter, its stamp box about the feet (x, y, w, h), its cycle (frames, game frames each). */
const ART: Record<Critter, { paint: (g: Ctx, fr: number, md: Mood, v: number) => void; box: [number, number, number, number]; per: number }> = {
  rabbit: { paint: paintRabbit, box: [-22, -28, 42, 32], per: 4 },
  squirrel: { paint: paintSquirrel, box: [-22, -30, 38, 34], per: 3 },
  raccoon: { paint: paintRaccoon, box: [-28, -28, 50, 32], per: 4 },
  skunk: { paint: paintSkunk, box: [-28, -40, 48, 44], per: 5 },
  turkey: { paint: paintTurkey, box: [-24, -42, 46, 46], per: 4 },
  duck: { paint: paintDuck, box: [-20, -30, 40, 34], per: 5 },
  bat: { paint: paintBat, box: [-18, -24, 36, 28], per: 3 },
};

const DRAW = Object.fromEntries((Object.keys(ART) as Critter[]).map(k => [k, (c: Ctx, e: Enemy, f: number) => {
  const a = ART[k], md = mood(e), fr = md === 'ok' ? cyc(f, e, 4, a.per) : 0, v = (e.variant ?? 0) % 3;
  // (dead, belly up: what stood tallest (the tail, the fan) is down past its feet now)
  put(c, `${k}-${v}-${fr}-${md}`, a.box[0], a.box[1], a.box[2], a.box[3] + (md === 'dead' ? 18 : 0), g => a.paint(g, fr, md, v));
}])) as Record<Critter, (c: Ctx, e: Enemy, f: number) => void>;
