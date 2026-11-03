// INTO THE PLUNGE POOL (the owner's: "if meathead lands in the water in the waterfall area, show a funny specially
// animated sequence where he gets chewed apart by millions of tiny piranhas, still functioning as a 'bottomless pit'
// instant kill zone but not 'bottomless'"). The gorge's pool at the foot of the falls (hidden.ts POOL_Y, the gorge
// between the cliff and the far bank) is full of piranhas: the moment his feet touch it, he's dead (m2:piranhas), and
// this plays where he went in, the camera held on the spot, the HUD down, no input:
//
//   in        the splash
//   boiling   the water boils with them round him (dozens leaping, fins, the red spreading), him thrashing waist deep,
//             his glasses knocked off and floating; shitty pants, they back off a beat first and one gags; naked, the
//             first one goes straight for the obvious bit (CHOMP!)
//   under     he goes down, one hand left up out of it: a last thumbs-up (or the finger), pulled under
//   bones     up bobs his skeleton, picked clean; dragged back down
//   burp      the bubbles stop; one fat piranha comes up and burps
//
// Then the death screen (lines.ts HURT['m2:piranhas']) and the respawn (the gorge's checkpoint: hidden.ts). Anything
// else that goes in (a monkey knocked off a vine, a body) is eaten the same way, quickly (feeds, drawn by art/hidden.ts).
// The fish are the river's piranha, stamped (river/critters.ts), the skeleton and the hand stamped once each.

import type { MeatheadDeath } from '../../../m1/game/player/deathAnim';
import type { GameState } from '../../../m1/game/core/state';
import { registerDeathAnim, registerDeathKind } from '../../../m1/game/player/deathAnim';
import { registerDeathDraw, body } from '../../../m1/game/render/player/deathAnim';
import { skinTone, skinShadow, skinHighlight } from '../../../m1/game/render/player/body';
import { stamp } from '../../../m1/game/render/stamp';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { isNude, isShat } from '../../../m1/game/player/gut';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { meatheadSays, label } from '../section';
import { stampPiranha } from '../river/critters';
import { PIRANHA_SCREAM } from './lines';

type Ctx = CanvasRenderingContext2D;
export const PIRANHA_SRC = 'm2:piranhas';
export const PIRANHA_KILL = 'own:jg_piranhas' as const;
const INK = '#1A0B06';
const BLOOD = ['#3A0606', '#7F1D1D', '#B91C1C', '#DC2626'];
const BONE = ['#8A8270', '#B8B0A0', '#E2DACA', '#F6F0E2'];

/** The beats (frames into his death): in; the hand up; it gesturing; pulled under; the bones up; dragged down; the
 *  bubbles stop; the fat one up; its burp; the lot. */
const SPLASH = 8, HAND = 72, SIGN = 84, PULLED = 100, BONES = 108, DRAG = 136, STILL = 142, FAT = 146, BURP = 156, LEN = 172;

registerDeathKind(PIRANHA_SRC, PIRANHA_KILL);

/** This death's own: the pool's surface, his pants as it started, the hand's gesture. */
const run = { pants: 'clean' as 'clean' | 'shitty' | 'nude', thumb: true };

/** The camera held on the spot: him a little left of middle, the pool's surface low on the screen. */
const holdCamera = (state: GameState, d: MeatheadDeath) => {
  state.camera.x = Math.round(d.x - CANVAS_WIDTH / 2);
  state.camera.y = Math.round((d.floor ?? d.y) - 450);
};

registerDeathAnim(PIRANHA_KILL, {
  frames: LEN, airOk: true, cam: true,
  tick: (ctx, d, t) => {
    const { state } = ctx, P = state.particles, s = d.floor ?? d.y;
    if (t === 1) {
      d.floor = d.y;
      run.pants = isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean';
      run.thumb = run.pants === 'clean' ? Math.random() < 0.6 : Math.random() < 0.3;
      playSound('splash', 1, -6); playSound('splash', 0.7, -12);
      for (let k = 0; k < 30; k++) P.push({ pos: { x: d.x + (Math.random() - 0.5) * 40, y: d.y - 2 }, vel: { x: (Math.random() - 0.5) * 7, y: -3 - Math.random() * 7 }, life: 34, color: k % 3 ? 'rgba(220, 240, 248, 0.9)' : '#FFFFFF', size: 3 + Math.random() * 4, grav: 0.35 });
    }
    holdCamera(state, d);
    if (t === 3) meatheadSays(state, pickLine(PIRANHA_SCREAM[run.pants]), false);
    // (the boil: spray and blood thrown up off it, the gnawing)
    if (t > SPLASH && t < DRAG && t % 3 === 0) for (let k = 0; k < 2; k++) P.push({ pos: { x: d.x + (Math.random() - 0.5) * 70, y: s - 2 }, vel: { x: (Math.random() - 0.5) * 5, y: -1.5 - Math.random() * 4 }, life: 22, color: k ? 'rgba(220, 240, 248, 0.8)' : BLOOD[2 + (t % 2)], size: 2 + Math.random() * 3, grav: 0.3 });
    if (t > SPLASH && t < DRAG && t % 9 === 0) playSound('gnaw', 0.5, -4 + Math.random() * 8);
    if (t > SPLASH && t < BONES && t % 14 === 0) playSound('chitter', 0.35, Math.random() * 6);
    if (t === 12 && run.pants === 'nude') { playSound('crunch', 0.9, 6); playSound('squish', 0.8, 4); }
    if (t === 22 && run.pants === 'shitty') playSound('retch', 0.6, 8);
    if (t === 30) playSound('splash', 0.4, 6);
    if (t === PULLED) playSound('glug', 0.8, -4);
    if (t === BONES) playSound('splash', 0.5, 4);
    if (t === DRAG) playSound('glug', 0.6, -8);
    if (t === BURP) playSound('burp', 1, -6);
  },
});

// ---------------------------------------------------------------------------------------------------------------
// The pieces, painted once

/** His skeleton, picked clean, floating on its back (its middle the origin, its head to the right). */
const paintSkeleton = (g: Ctx) => {
  const bone = (x0: number, y0: number, x1: number, y1: number, w: number) => {
    g.lineCap = 'round';
    g.strokeStyle = INK; g.lineWidth = w + 2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    g.strokeStyle = BONE[2]; g.lineWidth = w; g.stroke();
    g.strokeStyle = BONE[3]; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, y0 - w * 0.25); g.lineTo(x1, y1 - w * 0.25); g.stroke();
    for (const [x, y] of [[x0, y0], [x1, y1]]) { g.fillStyle = INK; g.beginPath(); g.arc(x, y, w * 0.75 + 1, 0, Math.PI * 2); g.fill(); g.fillStyle = BONE[2]; g.beginPath(); g.arc(x, y, w * 0.75, 0, Math.PI * 2); g.fill(); }
    g.lineCap = 'butt';
  };
  // (the legs out straight, the arms down its sides: every bone straight, nothing to bend)
  bone(-16, -1, -40, 1, 4); bone(-40, 1, -62, 0, 3.4); bone(-62, 0, -68, -4, 3);
  bone(-15, -5, -39, -6, 4); bone(-39, -6, -61, -7, 3.4); bone(-61, -7, -66, -12, 3);
  bone(20, -6, 4, -9, 3); bone(4, -9, -10, -9, 2.6);
  // (the spine, the ribs up over it, the pelvis)
  bone(-14, -4, 24, -4, 2.6);
  for (let k = 0; k < 5; k++) { const x = 2 + k * 4.4; g.strokeStyle = INK; g.lineWidth = 3.4; g.beginPath(); g.arc(x, -4, 7 - k * 0.6, Math.PI * 1.08, Math.PI * 1.92); g.stroke(); g.strokeStyle = BONE[2]; g.lineWidth = 1.8; g.stroke(); }
  g.fillStyle = INK; g.beginPath(); g.ellipse(-14, -3, 7, 6, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = BONE[1]; g.beginPath(); g.ellipse(-14, -3, 5.6, 4.6, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = BONE[0]; g.beginPath(); g.arc(-14, -3, 2, 0, Math.PI * 2); g.fill();
  // (the skull, face up, grinning; the jaw hanging)
  g.fillStyle = INK; g.beginPath(); g.ellipse(33, -7, 10, 9, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = BONE[2]; g.beginPath(); g.ellipse(33, -7, 8.5, 7.5, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = BONE[3]; g.beginPath(); g.ellipse(30, -10, 4, 3, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = INK; g.fillRect(31, -12, 4, 4); g.fillRect(37, -12, 3, 4); g.fillRect(35, -6, 2, 2);
  g.fillStyle = BONE[1]; g.fillRect(36, -3, 8, 4);
  g.fillStyle = INK; for (let x = 37; x < 44; x += 2) g.fillRect(x, -3, 1, 2);
};

/** His hand up out of the water (the forearm out of it, the waterline its origin): a fist, a thumbs-up or the finger.
 *  Bitten: the chunks out of it. */
type Sign = 'fist' | 'thumb' | 'finger';
const paintHand = (g: Ctx, sign: Sign) => {
  g.fillStyle = INK; g.fillRect(-6, -30, 12, 32);
  g.fillStyle = skinTone; g.fillRect(-5, -29, 10, 31);
  g.fillStyle = skinShadow; g.fillRect(2, -29, 3, 31);
  g.fillStyle = skinHighlight; g.fillRect(-4, -28, 2, 26);
  // (the fist)
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, -34, 8, 7, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = skinTone; g.beginPath(); g.ellipse(0, -34, 6.8, 5.8, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = skinShadow; for (let k = 0; k < 3; k++) g.fillRect(-4 + k * 3, -37, 1, 5);
  if (sign === 'thumb') { g.fillStyle = INK; g.fillRect(-8, -48, 6, 14); g.fillStyle = skinTone; g.fillRect(-7, -47, 4, 13); g.fillStyle = skinHighlight; g.fillRect(-7, -47, 1, 10); }
  else if (sign === 'finger') { g.fillStyle = INK; g.fillRect(-2, -52, 6, 16); g.fillStyle = skinTone; g.fillRect(-1, -51, 4, 15); g.fillStyle = skinHighlight; g.fillRect(-1, -51, 1, 12); g.fillStyle = '#F4E4D0'; g.fillRect(0, -51, 2, 2); }
  // (bitten: chunks out of it, the blood down it)
  g.fillStyle = BLOOD[1]; g.fillRect(4, -22, 3, 4); g.fillRect(-6, -12, 3, 5); g.fillRect(3, -8, 3, 3);
  g.fillStyle = BLOOD[2]; g.fillRect(-6, -11, 2, 12); g.fillRect(5, -20, 1, 18);
};

/** His glasses, floating: thick black frames, a glint. */
const paintGlasses = (g: Ctx) => {
  g.fillStyle = INK; g.fillRect(-9, -3, 8, 6); g.fillRect(1, -3, 8, 6); g.fillRect(-1, -2, 2, 2);
  g.fillStyle = '#9CC8E0'; g.fillRect(-8, -2, 6, 4); g.fillRect(2, -2, 6, 4);
  g.fillStyle = '#FFFFFF'; g.fillRect(-7, -2, 2, 1); g.fillRect(3, -2, 2, 1);
};

// ---------------------------------------------------------------------------------------------------------------
// The swarm (shared with the feeds: anything else that goes in)

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** Fish leaping in arcs about (x, s), `n` of them at once, flung out `spread` either side (`back`: shied off, wider). */
export const drawLeapers = (c: Ctx, x: number, s: number, f: number, n: number, spread: number, seed = 0) => {
  for (let i = 0; i < n; i++) {
    const per = 22 + hash(i * 3.1 + seed) * 18, p = ((f + hash(i * 7.7 + seed) * per) % per) / per;
    const dir = hash(i * 1.3 + seed) < 0.5 ? -1 : 1, x0 = x + (hash(i * 5.9 + seed) - 0.5) * spread * 2;
    const fx = x0 + dir * p * 26, fy = s - Math.sin(p * Math.PI) * (16 + hash(i * 2.2 + seed) * 30);
    c.save(); c.translate(Math.round(fx), Math.round(fy)); c.scale(dir * 0.4, 0.4);
    stampPiranha(c, p < 0.5 ? 'burst' : 'leap', i);
    c.restore();
  }
  // (fins cutting the surface between, and the boil)
  for (let i = 0; i < n; i++) {
    const fx = x + (hash(i * 9.1 + seed) - 0.5) * spread * 2 + Math.sin(f * 0.3 + i) * 6;
    c.fillStyle = INK; c.beginPath(); c.moveTo(fx - 3, s + 1); c.lineTo(fx, s - 5); c.lineTo(fx + 3, s + 1); c.fill();
    if ((f + i * 3) % 6 < 3) { c.fillStyle = 'rgba(230, 246, 252, 0.8)'; c.fillRect(Math.round(fx - 6 + hash(i) * 12), s - 2, 3, 2); }
  }
};

/** The blood spreading out on the water from x, banded. */
export const drawRedWater = (c: Ctx, x: number, s: number, r: number, a: number) => {
  for (let k = 0; k < 3; k++) {
    c.fillStyle = `rgba(150, 18, 18, ${(a * (0.25 + k * 0.12)).toFixed(3)})`;
    c.beginPath(); c.ellipse(x, s + 6, r * (1 - k * 0.28), 5 + r * 0.12 * (1 - k * 0.3), 0, 0, Math.PI * 2); c.fill();
  }
};

/** Bubbles up off the spot. */
const drawBubbles = (c: Ctx, x: number, s: number, f: number, n: number) => {
  c.strokeStyle = 'rgba(230, 246, 252, 0.9)'; c.lineWidth = 1;
  for (let i = 0; i < n; i++) {
    const p = ((f * 0.05 + hash(i * 4.3)) % 1), bx = x + (hash(i * 8.1) - 0.5) * 30, by = s - p * 6;
    c.beginPath(); c.arc(Math.round(bx), Math.round(by), 2 + hash(i) * 2, Math.PI, 0); c.stroke();
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Him

registerDeathDraw(PIRANHA_KILL, (c, state, d, weapon, t, f) => {
  const s = d.floor ?? d.y, x = d.x, shied = run.pants === 'shitty' && t > SPLASH && t < 34;
  const red = Math.min(1, Math.max(0, (t - SPLASH) / 70));
  if (t > SPLASH) drawRedWater(c, x, s, 30 + red * 110, 0.4 + red * 0.6);
  // (the swarm, the boil round him (behind him: he's in the middle of it); shied back a beat first if he'd shat himself)
  if (t > SPLASH && t < STILL) drawLeapers(c, x, s, f, t < BONES ? 30 : 14, shied ? 130 : t < BONES ? 80 : 60);
  // Him, in and thrashing, waist deep, then down (nothing of him under the water shows)
  if (t < PULLED) {
    const depth = t < SPLASH ? t * 5 : t < HAND - 12 ? 36 + Math.sin(t * 0.7) * 6 : 36 + (t - HAND + 12) * 4;
    const shake = t > SPLASH && t < HAND - 12 ? Math.sin(f * 1.9) * 3 : 0, feet = s + depth;
    c.save(); c.beginPath(); c.rect(x - 200, s - 400, 400, 401); c.clip();
    // (thrashing: shaken, rocking about his feet; drawn where he is (the body's culled by where it's put))
    c.translate(x + shake, feet);
    if (t > SPLASH + 6 && t < HAND - 12) c.rotate(Math.sin(t * 0.35) * 0.18);
    c.translate(-x, -feet);
    body(c, state, { ...d, x, y: feet }, weapon, { isGrounded: false, hurtTimer: 30, vel: { x: 0, y: 4 }, deathFace: t < 40 ? 'scream' : 'agony' });
    // (bitten: the chunks out of him, more the longer)
    const bites = Math.min(9, Math.max(0, Math.floor((t - 20) / 6)));
    for (let k = 0; k < bites; k++) { c.fillStyle = BLOOD[1 + (k % 3)]; c.beginPath(); c.ellipse(x + (hash(k * 3.3) - 0.5) * 26, feet - 40 - hash(k * 1.7) * 30, 3 + hash(k) * 2, 2.5, 0, 0, Math.PI * 2); c.fill(); }
    c.restore();
  }
  // (his glasses, knocked off, up and floating, bobbing off to the side)
  if (t >= 20) {
    const u = t - 20, gx = x + 18 + Math.min(40, u * 0.6), gy = u < 14 ? s - 40 + u * u * 0.21 - u * 1.2 : s - 3 + Math.sin(f * 0.12) * 1.5;
    c.save(); c.translate(Math.round(gx), Math.round(Math.min(gy, s - 2))); c.scale(1.5, 1.5); stamp(c, 'jg-pir-glasses', -10, -4, 20, 8, paintGlasses); c.restore();
  }
  // (the last hand up, its gesture, pulled under)
  if (t >= HAND && t < PULLED + 8) {
    const up = t < SIGN ? Math.min(1, (t - HAND) / 6) : t < PULLED ? 1 : Math.max(0, 1 - (t - PULLED) / 8);
    const sign = t >= SIGN;
    c.save(); c.beginPath(); c.rect(x - 60, s - 120, 120, 120); c.clip();
    c.translate(Math.round(x - 6 + (t >= PULLED ? Math.sin(f * 2) * 2 : 0)), Math.round(s + (1 - up) * 56));
    const how: Sign = sign ? (run.thumb ? 'thumb' : 'finger') : 'fist';
    stamp(c, `jg-pir-hand-${how}`, -10, -56, 20, 60, g => paintHand(g, how));
    c.restore();
  }
  // (and a few in front of him, at him)
  if (t > SPLASH && t < BONES && !shied) drawLeapers(c, x, s, f, 6, 30, 91);
  if (t < STILL) drawBubbles(c, x, s, f, t < PULLED ? 14 : 8);
  // (his bones, up, bobbing; dragged back down)
  if (t >= BONES && t < DRAG + 14) {
    const up = t < BONES + 8 ? (t - BONES) / 8 : t < DRAG ? 1 : 1 - (t - DRAG) / 14;
    c.save(); c.beginPath(); c.rect(x - 120, s - 60, 240, 61); c.clip();
    c.translate(Math.round(x), Math.round(s + 14 - up * 12 + Math.sin(f * 0.15) * 1.5)); c.scale(d.facing, 1);
    stamp(c, 'jg-pir-skel', -72, -20, 124, 30, paintSkeleton);
    c.restore();
  }
  // (the fat one: up, belly to the sky nearly, burping)
  if (t >= FAT) {
    const up = Math.min(1, (t - FAT) / 8), sw = t >= BURP && t < BURP + 6 ? 1.15 : 1;
    c.save(); c.translate(Math.round(x + 6), Math.round(s + 10 - up * 12)); c.scale(1.6 * sw, 1.6 * sw);
    stampPiranha(c, 'swim', 0);
    c.restore();
    if (t >= BURP) { const u = t - BURP; c.strokeStyle = 'rgba(230, 246, 252, 0.9)'; c.lineWidth = 2; c.beginPath(); c.arc(x + 32, s - 18 - u * 0.6, 3 + Math.min(8, u), 0, Math.PI * 2); c.stroke(); if (u < 30) label(c, 'BURP!', x + 40, s - 34 - Math.min(10, u * 0.5), '#FDE047', 8); }
  }
  // (the pops)
  if (run.pants === 'nude' && t >= 12 && t < 40) label(c, 'CHOMP!', x + 20, s - 60 - Math.min(10, (t - 12) * 0.5), '#F87171', 8);
  if (run.pants === 'shitty' && t >= 20 && t < 46) {
    // (the one that got a taste: gagging off to the side, green round it)
    const gx = x - 70, gy = s - 30 - Math.sin(Math.min(1, (t - 20) / 20) * Math.PI) * 20;
    c.fillStyle = 'rgba(132, 160, 60, 0.45)'; c.beginPath(); c.ellipse(gx + 8, gy - 8, 16, 10, 0, 0, Math.PI * 2); c.fill();
    c.save(); c.translate(Math.round(gx), Math.round(gy)); c.scale(-0.6, 0.6); stampPiranha(c, 'leap', 2); c.restore();
    label(c, 'GAG!', gx, gy - 26, '#A3E635', 8);
  }
  if (t >= HAND - 12 && t < HAND + 6) label(c, 'CHOMP CHOMP CHOMP', x, s - 90, '#F87171', 8);
});
