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
// gone (never a kill, never a callout). Crude (the prototype pass): simple shapes, flat colors and a shade, an ink line.
//
//   rabbit    gray-brown, bounding, ears back, the white tail bobbing
//   squirrel  red, scrabbling, its big tail flicking
//   raccoon   the mask, the ringed tail, waddling fast
//   skunk     black, the white stripe, its tail up
//   turkey    running on its long legs, its fan bouncing, the wattle flapping
//   duck      a mallard, flapping low over the ground
//   bat       out in daylight, flapping every which way, high

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import { registerM2Kind, registerHurtLines, registerKindCallouts } from '../../kinds';
import { INK } from '../kit';
import { GY, LOG_X, LOG_LEN, AXE_TR, ROCK_X, ROCK_HW, ROCK_H } from './layout';
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
  if (x > LOG_X - 4 && x < LOG_X + LOG_LEN) h = Math.max(h, 2 * AXE_TR);
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
// Drawing (each standing at the origin, its feet; facing right; alive running, hurt (eyes screwed shut), dead (belly up,
// eyes crossed out, tongue out))

type Mood = 'ok' | 'hurt' | 'dead';
const mood = (e: Enemy): Mood => (e.health <= 0 ? 'dead' : (e.hitFlash ?? 0) > 0 ? 'hurt' : 'ok');
const blob = (c: Ctx, path: () => void, col: string, lw = 1) => { c.beginPath(); path(); c.fillStyle = col; c.fill(); c.strokeStyle = INK; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke(); };
const ell = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string, rot = 0, lw = 1) => blob(c, () => c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2), col, lw);
const dot = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
const limb = (c: Ctx, x1: number, y1: number, x2: number, y2: number, w: number, col: string) => {
  c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = w + 1.6; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
  c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
};
const eye = (c: Ctx, x: number, y: number, md: Mood, r = 1.3) => {
  if (md === 'dead') { c.strokeStyle = INK; c.lineWidth = 0.9; c.beginPath(); c.moveTo(x - r, y - r); c.lineTo(x + r, y + r); c.moveTo(x - r, y + r); c.lineTo(x + r, y - r); c.stroke(); return; }
  if (md === 'hurt') { c.strokeStyle = INK; c.lineWidth = 0.9; c.beginPath(); c.moveTo(x - r, y - r * 0.6); c.lineTo(x + r * 0.6, y); c.lineTo(x - r, y + r * 0.6); c.stroke(); return; }
  // (wide, terrified: the white round the pupil)
  dot(c, x - r, y - r, r * 2, r * 2, '#FFFFFF'); dot(c, x - r * 0.2, y - r * 0.6, r, r * 1.2, INK);
};
const tongue = (c: Ctx, x: number, y: number) => { c.strokeStyle = '#E86A7A'; c.lineCap = 'round'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 1, y + 3); c.stroke(); };
/** Dead: belly up (turned over about its middle). */
const over = (c: Ctx, md: Mood, h: number) => { if (md === 'dead') { c.translate(0, -h / 2); c.rotate(Math.PI); c.translate(0, h / 2 - h); } };
const legs4 = (c: Ctx, e: Enemy, f: number, xs: number[], top: number, len: number, w: number, col: string, k = 0.6) => {
  const md = mood(e);
  xs.forEach((lx, i) => { const sw = md === 'dead' ? 2 : Math.sin(f * k + i * 1.7) * 4; limb(c, lx, top, lx + sw, top + len, w, col); });
};

const DRAW: Record<Critter, (c: Ctx, e: Enemy, f: number) => void> = {
  rabbit: (c, e, f) => {
    const md = mood(e); c.save(); over(c, md, 18);
    legs4(c, e, f, [-6, -3, 4, 7], -6, 6, 2.4, '#8A7A66', 0.64);
    ell(c, -9, -10, 3, 3, '#FFFFFF');
    ell(c, -1, -9, 9, 6, '#9A8A74'); ell(c, 0, -7, 6, 2.4, '#C8B8A0', 0, 0.6);
    ell(c, 8, -12, 4.6, 4, '#9A8A74');
    // (the ears laid back, flapping)
    const fl = md === 'ok' ? Math.sin(f * 0.5) * 0.15 : 0.3;
    ell(c, 4, -17, 1.8, 6, '#9A8A74', -1.0 + fl); ell(c, 6, -17, 1.6, 5.4, '#B8A890', -0.8 + fl);
    dot(c, 12, -12, 1.4, 1.2, '#E8A0A0');
    eye(c, 9, -13.5, md, 1.1);
    if (md === 'dead') tongue(c, 11, -10);
    c.restore();
  },
  squirrel: (c, e, f) => {
    const md = mood(e); c.save(); over(c, md, 14);
    // (the tail: big, bushy, curled up over its back, flicking)
    const fl = md === 'ok' ? Math.sin(f * 0.6) * 0.3 : 0;
    ell(c, -9, -12, 5, 8, '#B4532A', 0.5 + fl); ell(c, -8, -14, 3, 5, '#D4733A', 0.5 + fl, 0.5);
    legs4(c, e, f, [-4, -1, 3, 5], -4, 4, 1.8, '#8A3A1A', 0.8);
    ell(c, 0, -7, 6, 4, '#B4532A'); ell(c, 1, -5.4, 4, 1.6, '#F2D2B0', 0, 0.5);
    ell(c, 6, -9, 3.4, 3, '#B4532A'); ell(c, 4.6, -12, 1, 1.6, '#B4532A');
    eye(c, 7, -10, md, 0.9);
    if (md === 'dead') tongue(c, 8.6, -7.6);
    c.restore();
  },
  raccoon: (c, e, f) => {
    const md = mood(e); c.save(); over(c, md, 22);
    // (the ringed tail)
    for (let i = 0; i < 4; i++) ell(c, -13 - i * 2.6, -12 + i * 1.2, 3, 3.4, i % 2 ? '#2A2A2E' : '#8A8A90', 0, 0.6);
    legs4(c, e, f, [-8, -4, 5, 9], -7, 7, 2.6, '#2A2A2E', 0.7);
    ell(c, 0, -12, 12, 7, '#7A7A82'); ell(c, 0, -9, 9, 2.6, '#A8A8B0', 0, 0.6);
    ell(c, 11, -14, 5.4, 4.6, '#8A8A90');
    // (the mask, the white round it)
    dot(c, 8, -15.6, 8, 2.6, '#1A1A1E'); dot(c, 8, -17, 7, 1.2, '#E8E8EC');
    ell(c, 9, -19, 1.6, 2, '#7A7A82');
    dot(c, 15.4, -14, 1.4, 1.2, INK);
    eye(c, 12, -14.4, md, 0.9);
    if (md === 'dead') tongue(c, 14, -11);
    c.restore();
  },
  skunk: (c, e, f) => {
    const md = mood(e); c.save(); over(c, md, 20);
    // (the tail up, fluffed, a white stripe up it)
    const fl = md === 'ok' ? Math.sin(f * 0.3) * 0.15 : 0.6;
    ell(c, -11, -18, 5, 9, '#141418', -0.3 + fl); ell(c, -11, -18, 1.6, 7, '#F4F4F5', -0.3 + fl, 0.4);
    legs4(c, e, f, [-7, -3, 4, 8], -6, 6, 2.4, '#141418', 0.7);
    ell(c, 0, -10, 11, 6, '#1C1C22');
    dot(c, -9, -16, 20, 2, '#F4F4F5');
    ell(c, 10, -11, 4.6, 4, '#1C1C22'); dot(c, 9, -15, 2, 4, '#F4F4F5');
    dot(c, 14, -10.6, 1.2, 1, INK);
    eye(c, 11, -12, md, 0.9);
    if (md === 'dead') tongue(c, 13, -8);
    c.restore();
  },
  turkey: (c, e, f) => {
    const md = mood(e); c.save(); over(c, md, 34);
    // (the fan, bouncing, banded)
    const b = md === 'ok' ? Math.sin(f * 0.4) * 1.5 : 0;
    for (let i = 0; i < 5; i++) { const a = -2.4 + i * 0.32; ell(c, -6 + Math.cos(a) * 9, -22 + Math.sin(a) * 9 + b, 2.6, 7, i % 2 ? '#5A3A1E' : '#7A5230', a + Math.PI / 2, 0.6); }
    // (the long legs, running)
    const k = Math.sin(f * 0.45);
    limb(c, -1, -14, -1 + k * 6, 0, 1.6, '#C8A040'); limb(c, 2, -14, 2 - k * 6, 0, 1.6, '#D8B050');
    ell(c, 0, -20, 9, 8, '#4A3018'); ell(c, -2, -22, 6, 3, '#6A4A28', 0, 0.5);
    // (the neck up, the head bobbing, the wattle flapping)
    limb(c, 5, -24, 9 + b, -31, 2.4, '#A8B8D0');
    ell(c, 10 + b, -32, 3, 2.6, '#B8C8E0');
    blob(c, () => { c.moveTo(12.4 + b, -32); c.lineTo(15.4 + b, -31.4); c.lineTo(12.4 + b, -30.8); c.closePath(); }, '#D8B050', 0.5);
    ell(c, 11 + b, -29 + Math.sin(f * 0.7) * 0.8, 1.2, 2.4, '#DC2626', 0, 0.5);
    eye(c, 10.4 + b, -32.6, md, 0.8);
    c.restore();
  },
  duck: (c, e, f) => {
    const md = mood(e); c.save(); over(c, md, 16);
    const flap = md === 'ok' ? Math.sin(f * 0.7) : md === 'dead' ? 0.8 : 0;
    ell(c, 0, -8, 9, 5, '#8A6A4A'); ell(c, 0, -6.4, 7, 2, '#C8B8A0', 0, 0.5);
    blob(c, () => { c.moveTo(-8, -9); c.lineTo(-13, -11); c.lineTo(-12, -7); c.closePath(); }, '#3A3A3E', 0.6);
    dot(c, 4, -11.6, 3, 1.4, '#F4F4F5');
    ell(c, 8, -12, 3.6, 3.2, '#166534'); ell(c, 7.4, -12.6, 1.6, 1.2, '#22C55E', 0, 0.3);
    blob(c, () => { c.moveTo(11, -12.6); c.lineTo(15, -12); c.lineTo(11, -10.6); c.closePath(); }, '#EAB308', 0.6);
    // (the wing: up, down; the blue patch)
    blob(c, () => { c.moveTo(-4, -10); c.lineTo(-2 - 3 * Math.abs(flap), -10 - 11 * flap); c.lineTo(5, -9); c.closePath(); }, '#6A5038', 0.8);
    dot(c, -1, -10.6 - 4 * flap, 3, 1.2, '#2563EB');
    eye(c, 8.6, -12.6, md, 0.8);
    c.restore();
  },
  bat: (c, e, f) => {
    const md = mood(e); c.save(); over(c, md, 14);
    const flap = md === 'ok' ? Math.sin(f * 0.9) : 0.4;
    // (the wings: membrane between the finger bones, flapping)
    for (const s of [-1, 1]) blob(c, () => { c.moveTo(0, -8); c.lineTo(s * 11, -8 - 7 * flap); c.lineTo(s * 9, -4 - 4 * flap); c.lineTo(s * 6, -6 - 2 * flap); c.lineTo(s * 3, -4); c.closePath(); }, s < 0 ? '#2A1E2A' : '#3A2A3A', 0.6);
    ell(c, 0, -7, 3.6, 4, '#3A2A34');
    blob(c, () => { c.moveTo(-2, -10); c.lineTo(-2.6, -14); c.lineTo(-0.6, -11); c.closePath(); }, '#3A2A34', 0.5);
    blob(c, () => { c.moveTo(2, -10); c.lineTo(2.6, -14); c.lineTo(0.6, -11); c.closePath(); }, '#3A2A34', 0.5);
    eye(c, 1.4, -8, md, 0.7);
    dot(c, 0.4, -5.6, 0.6, 1, '#FFFFFF'); dot(c, 1.6, -5.6, 0.6, 1, '#FFFFFF');
    c.restore();
  },
};
