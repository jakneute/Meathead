// The rotor's kill (the user: "when you shred the jetpack guys, they don't go flying; they turn into gooey red paste.
// really sell the gore"): no body. At the point the blade met him, a dense spray of blood mist and fat gooey gobs (the
// death text's goo runs, deathText.ts, as teardrops), chunks of meat and bits of the polo, the cap and the jetpack
// flung out along the blade (the jetpack sparking and sputtering as it drops, then going up below); the rotor smeared
// red for a few seconds, flinging drops off as it spins; a splatter on the windshield that drips and fades. The gobs
// rain down toward the park. A wet shred (splat, crunch, a high whir), a hit-stop, a shake, a callout.
// Cheap: one capped pool of bits (here), the mist in the engine's particles (capped).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Enemy } from '../../../m1/types';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { goo } from '../../deathText';
import { heliOf } from './state';
import { CY, H } from './geo';

type Ctx = CanvasRenderingContext2D;

/** The blood in steps, near-black to the wet glint (the death text's). */
const BLOOD = ['#2A0404', '#5A0A0A', '#8B1010', '#B91C1C', '#DC2626', '#F87171'];
const MEAT = ['#9F1239', '#7F1D1D', '#BE123C', '#F0A3A3', '#E8DCC8'];
const CALLS = ['SHREDDED!', 'PUREED!', 'MINCED!', 'LIQUEFIED!', 'BLENDED!', 'TARTARE!', 'SMOOTHIE!'];
/** The pool's cap, the mist's cap (engine particles), how long the rotor stays red, the windshield's splats. */
const MAX_BITS = 110, MAX_PARTICLES = 1400, SMEAR_T = 240, SHIELD_T = 420, SHIELD_FADE = 120, MAX_SPLATS = 5;
/** The hit-stop (frames held). */
const STOP = 4;

type Kind = 'gob' | 'meat' | 'cloth' | 'cap' | 'pack';
interface Bit { kind: Kind; x: number; y: number; vx: number; vy: number; t: number; r: number; col: string; rot: number; vr: number; seed: number; dead?: boolean }
interface Splat { x: number; y: number; r: number; seed: number; at: number; runs: { dx: number; max: number; w: number; sp: number }[] }

const S = { bits: [] as Bit[], splats: [] as Splat[], smearAt: -9999, lastTick: -9999, stop: 0, call: '' };
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

/** Held frames of the hit-stop (the section's holdTick): true while it's holding. */
export const shredHold = () => (S.stop > 0 ? (S.stop--, true) : false);

/** A goon through the blades: gone, paste. (x, y) where the blade met him; (dx, dy) the way the blade throws it. */
export const shredGoon = (ctx: FrameContext, e: Enemy, x: number, y: number, dx: number, dy: number) => {
  const { state, fx } = ctx;
  e.health = 0; e.hitFlash = 0;
  (e as Enemy & { gone?: boolean }).gone = true;
  state.enemies = state.enemies.filter(o => o !== e);
  fx.spawnPickup({ x: e.pos.x, y: e.pos.y });
  fx.speakVulgarity('charge_kill');
  state.player.killSatisfactionTimer = 60;
  S.lastTick = state.frame;
  // (the callout: never the same twice running)
  let call = CALLS[Math.floor(Math.random() * CALLS.length)];
  if (call === S.call) call = CALLS[(CALLS.indexOf(call) + 1) % CALLS.length];
  S.call = call;
  fx.spawnDamageNumber({ x: x - 30, y: y - 40 }, call, true, '#F87171');
  const px = -dy, py = dx;
  // The mist: a dense fine spray, out every way, mostly along the blade
  for (let i = 0; i < 48 && state.particles.length < MAX_PARTICLES; i++) {
    const along = rnd(-2, 11), side = rnd(-6, 6);
    state.particles.push({ pos: { x: x + rnd(-8, 8), y: y + rnd(-10, 10) }, vel: { x: dx * along + px * side, y: dy * along + py * side + rnd(-2, 1) }, life: rnd(10, 28), color: BLOOD[1 + (i % 4)], size: i % 4 ? rnd(1.5, 3.5) : rnd(4, 7), alpha: i % 4 ? undefined : 0.55 });
  }
  // The gobs: fat gooey teardrops, out along the blade, then raining down
  const add = (b: Omit<Bit, 't' | 'rot' | 'vr' | 'seed'>) => { if (S.bits.length >= MAX_BITS) S.bits.shift(); S.bits.push({ ...b, t: 0, rot: rnd(0, 6.28), vr: rnd(-0.35, 0.35), seed: rnd(0, 100) }); };
  const fling = (lo: number, hi: number, spread: number) => { const a = rnd(lo, hi), s = rnd(-spread, spread); return { vx: dx * a + px * s, vy: dy * a + py * s - rnd(1, 5) }; };
  for (let i = 0; i < 18; i++) add({ kind: 'gob', x: x + rnd(-6, 6), y: y + rnd(-6, 6), ...fling(2, 13, 5), r: rnd(2.5, 6), col: '' });
  for (let i = 0; i < 8; i++) add({ kind: 'meat', x, y, ...fling(3, 11, 6), r: rnd(3, 6), col: MEAT[i % MEAT.length] });
  for (let i = 0; i < 5; i++) add({ kind: 'cloth', x, y, ...fling(2, 9, 6), r: rnd(4, 7), col: i % 3 === 2 ? '#D6C29A' : ['#1D4ED8', '#2563EB'][i % 2] });
  add({ kind: 'cap', x, y, ...fling(4, 9, 4), r: 6, col: '#78350F' });
  add({ kind: 'pack', x, y, ...fling(2, 6, 3), r: 8, col: '#D4D4D8' });
  // The rotor red, a splatter on the windshield
  S.smearAt = state.frame;
  if (S.splats.length >= MAX_SPLATS) S.splats.shift();
  const runs = Array.from({ length: 2 + Math.floor(Math.random() * 3) }, () => ({ dx: rnd(-7, 7), max: rnd(14, 46), w: rnd(2.5, 5), sp: rnd(0.08, 0.2) }));
  S.splats.push({ x: rnd(36, 62), y: rnd(-72, -34), r: rnd(6, 11), seed: rnd(0, 100), at: state.frame, runs });
  // The feel: wet, a crunch, the blade's whir; held a beat; a shake
  playSound('splat', 1, -6); playSound('crunch', 0.9, 4); playSound('grind', 0.7, 16); playSound('splat', 0.6, 8);
  S.stop = STOP;
  shakeScreen(state, 8, 5);
  heliOf(state).killAt = state.frame;
};

/** Each frame he's flying: the bits fly and fall, the jetpack sputters and goes up, the red rotor throws drops off its
 *  tips (`a`, `b` the blade's ends, world). */
export const tickShred = (ctx: FrameContext, a: { x: number; y: number }, b: { x: number; y: number }) => {
  const { state } = ctx, f = state.frame;
  S.lastTick = f;
  const bottom = CY + H + 120;
  for (const k of S.bits) {
    k.t++; k.x += k.vx; k.y += k.vy; k.rot += k.vr;
    // (the air takes the fling out of it; it falls: the gobs heavy, the cloth fluttering)
    const drag = k.kind === 'cloth' ? 0.93 : 0.97;
    k.vx *= drag; k.vy = k.vy * (k.kind === 'cloth' ? 0.95 : 0.99) + (k.kind === 'cloth' ? 0.14 : 0.32);
    if (k.kind === 'cloth') k.vx += Math.sin(k.t * 0.2 + k.seed) * 0.25;
    if (k.kind === 'gob' && k.t % 6 === 0 && state.particles.length < MAX_PARTICLES) state.particles.push({ pos: { x: k.x, y: k.y }, vel: { x: k.vx * 0.2, y: k.vy * 0.2 }, life: 12, color: BLOOD[2], size: 1.5 });
    if (k.kind === 'pack') {
      // (sparking, sputtering smoke, then up it goes, down below)
      if (k.t % 3 === 0 && state.particles.length < MAX_PARTICLES) state.particles.push({ pos: { x: k.x + rnd(-4, 4), y: k.y }, vel: { x: rnd(-3, 3), y: rnd(-4, 0) }, life: rnd(6, 14), color: k.t % 2 ? '#FDE047' : '#FFFFFF', size: rnd(1.5, 3) });
      if (k.t % 7 === 0 && state.particles.length < MAX_PARTICLES) state.particles.push({ pos: { x: k.x, y: k.y - 6 }, vel: { x: rnd(-0.6, 0.6), y: rnd(-1.5, -0.5) }, life: 26, color: k.t % 14 ? '#52525B' : '#F97316', size: rnd(4, 7) });
      if (k.t % 11 === 0) { k.vx += rnd(-2.5, 2.5); k.vy -= rnd(0.5, 2.5); playSound('click', 0.25, -6); }
      if (k.t >= 62) {
        k.dead = true;
        heliOf(state).booms.push({ x: k.x, y: k.y, r: 34, t: 0, big: false });
        playSound('boom', 0.5, 6);
        for (let i = 0; i < 10 && state.particles.length < MAX_PARTICLES; i++) state.particles.push({ pos: { x: k.x, y: k.y }, vel: { x: rnd(-5, 5), y: rnd(-5, 3) }, life: rnd(10, 22), color: i % 2 ? '#F97316' : '#D4D4D8', size: rnd(2, 4) });
      }
    }
    if (k.y > bottom || k.t > 260) k.dead = true;
  }
  S.bits = S.bits.filter(k => !k.dead);
  // (the red rotor: drops off the tips while it's still wet)
  const wet = smear(f);
  if (wet > 0.1 && Math.random() < wet * 0.7 && state.particles.length < MAX_PARTICLES) {
    const tip = Math.random() < 0.5 ? a : b, o = tip === a ? b : a, L = Math.hypot(tip.x - o.x, tip.y - o.y) || 1;
    const ux = (tip.x - o.x) / L, uy = (tip.y - o.y) / L, s = rnd(4, 9);
    state.particles.push({ pos: { x: tip.x, y: tip.y }, vel: { x: ux * s, y: uy * s + rnd(0, 2) }, life: rnd(16, 30), color: BLOOD[2 + Math.floor(Math.random() * 3)], size: rnd(1.5, 3.2) });
  }
};

/** How red the rotor still is (0..1). */
const smear = (f: number) => { const d = f - S.smearAt; return d < 0 || d > SMEAR_T ? 0 : 1 - d / SMEAR_T; };

/** Nothing's ticked it for a moment (off the flying, a new life): all of it gone. */
const stale = (f: number) => {
  if (f - S.lastTick > 3 || f < S.lastTick) { S.bits = []; S.splats = []; S.smearAt = -9999; return true; }
  return false;
};

/** World: the bits (over the copter, under the words). */
export const drawShred = (c: Ctx, state: GameState) => {
  const f = state.frame;
  if (stale(f) || !S.bits.length) return;
  for (const k of S.bits) {
    // (falling away toward the park below: smaller as they go)
    const sc = Math.max(0.45, 1 - k.t / 220);
    c.save(); c.translate(Math.round(k.x), Math.round(k.y));
    if (k.kind === 'gob') {
      // (a gooey teardrop, its bead leading, stretched by its speed)
      c.rotate(Math.atan2(k.vy, k.vx) - Math.PI / 2); c.scale(sc, sc);
      const sp = Math.hypot(k.vx, k.vy), L = k.r * 1.6 + Math.min(14, sp * 1.4);
      goo(c, 0, -L, L, k.r, k.r * 0.75, 0.5, k.seed, k.t);
    } else {
      c.rotate(k.rot); c.scale(sc, sc);
      const r = k.r;
      if (k.kind === 'meat') {
        // (a lump: dark edge, the meat, a lit corner, a wet glint)
        c.fillStyle = BLOOD[0]; c.fillRect(-r - 1, -r * 0.7 - 1, r * 2 + 2, r * 1.4 + 2);
        c.fillStyle = k.col; c.fillRect(-r, -r * 0.7, r * 2, r * 1.4);
        c.fillStyle = BLOOD[3]; c.fillRect(-r, r * 0.2, r * 2, r * 0.5);
        c.fillStyle = '#FECACA'; c.fillRect(-r + 1, -r * 0.7 + 1, 2, 1);
      } else if (k.kind === 'cloth') {
        // (a rag of the polo or the shorts, bloodied along its torn edge)
        c.fillStyle = k.col; c.beginPath(); c.moveTo(-r, -r * 0.6); c.lineTo(r, -r * 0.4); c.lineTo(r * 0.6, r * 0.6); c.lineTo(-r * 0.2, r * 0.3); c.lineTo(-r * 0.8, r * 0.7); c.closePath(); c.fill();
        c.fillStyle = BLOOD[3]; c.fillRect(-r * 0.8, r * 0.3, r * 1.4, 2);
      } else if (k.kind === 'cap') {
        // (the aviator cap, an ear flap, the goggles, a bit of him still in it)
        c.fillStyle = '#1A0B06'; c.fillRect(-7, -5, 14, 8);
        c.fillStyle = k.col; c.fillRect(-6, -4, 12, 6); c.fillStyle = '#A16207'; c.fillRect(-6, -4, 12, 2);
        c.fillStyle = '#1A0B06'; c.fillRect(-5, -6, 4, 3); c.fillRect(1, -6, 4, 3); c.fillStyle = '#7DD3FC'; c.fillRect(-4, -5, 2, 1); c.fillRect(2, -5, 2, 1);
        c.fillStyle = BLOOD[3]; c.fillRect(-6, 2, 12, 2); c.fillStyle = BLOOD[1]; c.fillRect(-3, 4, 3, 3);
      } else {
        // (the jetpack: two dented silver tanks, a strap torn off, sparking)
        for (const ox of [-6, 1]) { c.fillStyle = '#1A0B06'; c.fillRect(ox - 1, -9, 7, 18); c.fillStyle = '#D4D4D8'; c.fillRect(ox, -8, 5, 16); c.fillStyle = '#F4F4F5'; c.fillRect(ox, -8, 1, 16); c.fillStyle = '#DC2626'; c.fillRect(ox, -3, 5, 2); }
        c.fillStyle = BLOOD[3]; c.fillRect(-7, 6, 4, 4); c.fillRect(2, -9, 3, 3);
        if ((f >> 1) % 3 === 0) { c.fillStyle = '#F97316'; c.beginPath(); c.moveTo(-5, 9); c.lineTo(-2, 9 + rnd(5, 12)); c.lineTo(1, 9); c.fill(); }
      }
    }
    c.restore();
  }
};

/** The copter's frame (drawCopter's front, after the blades): the red on the rotor disc and blades. `rotor` its turn. */
export const drawRotorSmear = (c: Ctx, f: number, rotor: number) => {
  if (stale(f)) return;
  const k = smear(f);
  if (k <= 0) return;
  c.fillStyle = `rgba(139, 16, 16, ${(0.32 * k).toFixed(3)})`; c.beginPath(); c.ellipse(1, -99, 162, 8, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = `rgba(220, 38, 38, ${(0.22 * k).toFixed(3)})`; c.beginPath(); c.ellipse(1, -99, 110, 5, 0, 0, Math.PI * 2); c.fill();
  c.globalAlpha = Math.min(1, k * 1.3);
  for (const o of [0, Math.PI / 2]) {
    const L = Math.cos(rotor + o) * 160;
    c.strokeStyle = BLOOD[3]; c.lineWidth = 2; c.beginPath(); c.moveTo(1 - L, -99.5); c.lineTo(1 + L, -99.5); c.stroke();
    // (the gobs still stuck on the tips)
    c.fillStyle = BLOOD[1]; c.fillRect(1 + L * 0.9 - 2, -101, 4, 3); c.fillRect(1 - L * 0.6 - 1, -100, 3, 2);
  }
  c.globalAlpha = 1;
};

/** The copter's frame (drawCopter's front, after the glass): the splatter on the windshield, dripping down (the world's
 *  down: `angle` the copter's turn), fading. */
export const drawShieldSplat = (c: Ctx, f: number, angle: number) => {
  if (stale(f) || !S.splats.length) return;
  S.splats = S.splats.filter(s => f - s.at < SHIELD_T && f >= s.at);
  c.save();
  // (on the glass only: the bubble's shape)
  c.beginPath(); c.moveTo(6, -86); c.lineTo(30, -86); c.quadraticCurveTo(58, -84, 72, -52); c.quadraticCurveTo(80, -24, 66, 2); c.lineTo(6, 2); c.closePath(); c.clip();
  for (const s of S.splats) {
    const age = f - s.at;
    c.globalAlpha = Math.min(1, (SHIELD_T - age) / SHIELD_FADE) * 0.92;
    // (the splat: a lumpy blob, a ring of flecks round it)
    c.fillStyle = BLOOD[1];
    c.beginPath();
    for (let i = 0; i <= 12; i++) { const a = (i / 12) * Math.PI * 2, rr = s.r * (0.75 + 0.35 * Math.sin(a * 3 + s.seed)); c[i ? 'lineTo' : 'moveTo'](s.x + Math.cos(a) * rr, s.y + Math.sin(a) * rr); }
    c.closePath(); c.fill();
    c.fillStyle = BLOOD[3]; c.beginPath(); c.arc(s.x - 1, s.y - 1, s.r * 0.55, 0, Math.PI * 2); c.fill();
    c.fillStyle = BLOOD[5]; c.fillRect(Math.round(s.x - s.r * 0.4), Math.round(s.y - s.r * 0.45), 2, 1);
    for (let i = 0; i < 6; i++) { const a = s.seed + i * 1.1, d = s.r * (1.3 + (i % 3) * 0.35); c.fillStyle = BLOOD[2 + (i % 2)]; c.fillRect(Math.round(s.x + Math.cos(a) * d), Math.round(s.y + Math.sin(a) * d), 2, 2); }
    // (the drips: down the glass the world's way down, slowly, slowing)
    c.save(); c.translate(s.x, s.y); c.rotate(-angle);
    for (const r of s.runs) {
      const len = Math.min(r.max, age * r.sp * (1 - age / (SHIELD_T * 2)));
      if (len > 2) goo(c, r.dx, s.r * 0.3, len, r.w, r.w * 0.7, Math.min(1, age / 200), s.seed + r.dx, age);
    }
    c.restore();
  }
  c.restore();
};
