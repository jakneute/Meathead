// The leeches (the user's: "the water sections for the logs should have leeches that slow you down, slowly drain health
// and disables charging when underwater. it goes away when you surface. that's the incentive to use the logs"). In
// every log crossing but the pond (layout.ts LEECH_WATERS), while his head's under the water (the same line his air
// goes by: frontier/air.ts), leeches latch on, one after another, more the longer he stays down: they show, dark and
// wriggling, on him; each one slows his swimming a bit more; they drain him a little at a time (m2:fr_leech, its own
// hurt lines and death screens: lines.ts), faster the more there are; and while any are on him there's no lunge (the
// special, swimming). The moment his head's out of the water (up for air, onto a log, out on a bank) they all drop off
// him, shaken off in a spray. They're not enemies: nothing to kill, no kill callouts.
//
// (the user's: "meathead can do a partial charge when underwater in the leech pools in wilderness land. make sure
// charging is completely disabled under there. put in lines explaining why. show lots of leeches on him when he's under
// there too. they get off the second he gets out of the water." / "increase the rate of getting sucked dry by a fair
// amount too": the special and the charge button both come to nothing anywhere in leech water (a lunge or a charge he
// brings in with him is over on the spot), a blub of bubbles instead, and a line about it; on him, a crowd of them, more
// the longer he's down, all of them off the moment his head's out; and the drain a fair bit quicker.)

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { hurtTaken } from '../../../m1/game/core/resist';
import { endCharge } from '../../../m1/game/player/player';
import type { Ctx } from '../kit';
import { meatheadSays, byPants, landVisit } from '../section';
import { LEECH_WATERS } from './layout';
import { NO_CHARGE } from './lines';
import { waterOf, surfaceY } from './water';
import { wildsOf } from './state';

export const LEECH_SOURCE = 'm2:fr_leech';
/** Frames under before the first latches on, then between the rest; how many at most (that count: the drain, the drag). */
const FIRST = 45, EVERY = 75, MAX = 8;
/** The drain: damage a tick (before M2's softer hits), and the frames between ticks (fewer, the more are on him). (Was
 *  90 - 8n, floor 30: now ~1.6x as fast with one on him, 1.5x with all eight.) */
const DRAIN = 2, drainEvery = (n: number) => Math.max(20, 55 - 5 * n);
/** Each one on him takes this much off his swimming (a frame's speed, compounding into the engine's ease). */
const DRAG = 0.012, STROKE_DRAG = 0.003;
/** How many show on him (a crowd, more than the eight that count): the first with the first latch, then one more every
 *  SHOW_EVERY frames, up to SHOW_MAX. */
const SHOW_MAX = 30, SHOW_EVERY = 12;
/** After the first try's line, now and then on another: not inside this many frames of the last, and by chance. */
const TRY_GAP = 480, TRY_CHANCE = 0.4;

/** Where each sits on him: [across from his middle (fractions of his width, + his front), down from his top (fractions
 *  of his height), what of him it's on (0 his back and belly, 1 an arm, 2 a leg, 3 his head and neck), the way it hangs
 *  (turned from straight down)]. In the order they find him: legs and back first, his face last. */
const SPOTS: [number, number, 0 | 1 | 2 | 3, number][] = [
  [-0.3, 0.72, 2, 0.4], [0.28, 0.78, 2, -0.3], [-0.36, 0.45, 0, 0.5], [0.32, 0.5, 0, -0.2], [-0.12, 0.88, 2, 0.2],
  [0.6, 0.36, 1, -0.6], [0.18, 0.92, 2, -0.5], [-0.42, 0.3, 0, 0.7], [-0.62, 0.38, 1, 0.6], [0.08, 0.6, 0, 0.1],
  [-0.3, 0.97, 2, 0.6], [0.34, 0.66, 2, -0.1], [-0.25, 0.2, 3, 0.9], [0.66, 0.44, 1, -0.3], [-0.2, 0.56, 0, 0.3],
  [0.12, 0.38, 0, -0.4], [-0.66, 0.46, 1, 0.2], [0.25, 0.86, 2, 0.4], [0.3, 0.14, 3, -0.6], [-0.38, 0.62, 2, -0.2],
  [0.4, 0.28, 0, -0.8], [0.04, 0.24, 3, 0.2], [-0.08, 0.76, 2, -0.4], [0.55, 0.3, 1, 0.3], [0.36, 0.07, 3, -1.1],
  [-0.4, 0.82, 2, 0.1], [-0.18, 0.4, 0, -0.3], [-0.04, 0.1, 3, 0.5], [0.22, 0.46, 0, 0.6], [-0.56, 0.32, 1, -0.4],
];

/** How many show on him right now. */
const shownOf = (L: { n: number; under: number }) => (L.n > 0 ? Math.min(SHOW_MAX, 1 + Math.floor(Math.max(0, L.under - FIRST) / SHOW_EVERY)) : 0);

/** Where the i'th sits on him this frame (with his legs' kick and his arms' strokes, his facing), and the way it hangs. */
const spotAt = (state: GameState, i: number) => {
  const p = state.player, [fx, fy, part, tilt] = SPOTS[i % SPOTS.length], f = state.frame;
  let dx = 0, dy = 0;
  if (part === 2) {
    // (on his legs: with the kick, front leg one way, back the other (render/player: the swim's flutter or scissor)),
    // more the lower down
    const k = Math.sin(f * (Math.abs(p.vel.x) > 0.6 ? 0.45 : 0.18));
    dx = (fx > 0 ? 1 : -1) * k * 10 * (fy - 0.6);
  } else if (part === 1) {
    // (on his arms: swung round with his strokes)
    dx = Math.sin(f * 0.16 + fx * 3) * 3; dy = Math.cos(f * 0.16 + fx * 3) * 2.5;
  }
  return { x: p.pos.x + p.width / 2 + (fx * p.width + dx) * p.facing, y: p.pos.y + fy * p.height + dy, a: Math.PI / 2 + tilt * p.facing };
};

/** Swimming in leech water (not the pond), head under or not: no charge in it. */
const inLeechWater = (state: GameState) => {
  const p = state.player;
  if (!p.swimming) return null;
  const w = waterOf(p.pos.x + p.width / 2);
  return w && LEECH_WATERS.has(w.key) ? w : null;
};
/** His head under leech water. */
const underLeeches = (state: GameState) => {
  const w = inLeechWater(state);
  return !!w && state.player.pos.y + 6 > surfaceY(w);
};

/** Leeches on him (any). */
export const leeched = (state: GameState) => wildsOf(state).leech.n > 0;

/** The way into the land the no-charge line was first said on (first time once a visit, not once a life; then now and
 *  then). */
let toldVisit = -1;
/** The special or charge button, held since he pressed it in leech water. */
let swallowed = false;

/** A frame: no charge in leech water; latching on under, draining, the drag, and dropping off at the surface. His
 *  controls back without the special or the charge while he's in it. */
export const updateLeeches = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, p = state.player, L = wildsOf(state).leech;
  // (the ones he's shaken off: flying, then a plop into the water, or gone in the dirt)
  L.off = L.off.filter(o => {
    o.t++; o.vy += 0.35; o.x += o.vx; o.y += o.vy; o.a += o.vx * 0.15;
    const w = waterOf(o.x);
    if (w && o.vy > 0 && o.y > surfaceY(w)) { state.particles.push({ pos: { x: o.x, y: surfaceY(w) }, vel: { x: (Math.random() - 0.5) * 1.5, y: -1.5 - Math.random() }, life: 12, color: '#E0F2FE', size: 2 }); return false; }
    return o.t < 50;
  });
  L.sayCd = Math.max(0, L.sayCd - 1);
  const held = controls.special || !!controls.charge, pressed = held && !L.held;
  L.held = held;
  // (a scene: none on him, none dropping off after it; dead: they're just not drawn (the stage is built again anyway))
  if (p.inCutscene) { L.n = 0; L.under = 0; L.drainT = 0; return controls; }
  if (p.health <= 0 || state.deathTimer > 0) return controls;
  // No charge in leech water at all: none started, and one he brought in with him (a lunge down from the surface, a
  // charge off the bank into it) over the moment he's in. A press is a blub of bubbles, and a line why.
  // (a press swallowed down there stays swallowed till it's let go: no charge the instant he's out, still holding it)
  let out = controls;
  if (!held) swallowed = false;
  else if (swallowed) out = { ...controls, special: false, charge: false };
  if (inLeechWater(state)) {
    if (p.isCharging) endCharge(ctx);
    if (held) { out = { ...controls, special: false, charge: false }; swallowed = true; }
    if (pressed) {
      const mx = p.pos.x + p.width / 2 + p.facing * p.width * 0.3, my = p.pos.y + p.height * 0.14;
      for (let i = 0; i < 5; i++) state.particles.push({ pos: { x: mx + (Math.random() - 0.5) * 6, y: my }, vel: { x: p.facing * (0.4 + Math.random() * 0.8), y: -0.8 - Math.random() * 1.4 }, life: 20 + Math.floor(Math.random() * 12), color: i % 2 ? 'rgba(224, 242, 254, 0.85)' : '#BAE6FD', size: 2 + Math.random() * 2 });
      playSound('glug', 0.45, 5);
      p.squash = 0.12;
      const first = toldVisit !== landVisit();
      // (nobody talked over: somebody's talking, it's not said, and the first time's tried again on the next press)
      if ((first || (state.frame - L.triedAt > TRY_GAP && Math.random() < TRY_CHANCE)) && !state.isMeatheadSpeaking) {
        toldVisit = landVisit(); L.triedAt = state.frame;
        meatheadSays(state, pickLine(byPants(state, NO_CHARGE)), false);
      }
    }
  }
  if (!underLeeches(state)) {
    if (L.n > 0) {
      // (surfaced: they all drop off, every one he had on him, shaken off in a spray)
      const shown = shownOf(L);
      for (let i = 0; i < shown; i++) {
        const s = spotAt(state, i), dir = Math.sign(s.x - (p.pos.x + p.width / 2)) || (i % 2 ? 1 : -1);
        L.off.push({ x: s.x, y: s.y, vx: dir * (1.2 + Math.random() * 2.8), vy: -2 - Math.random() * 3.5, t: Math.floor(Math.random() * 8), a: s.a });
      }
      for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: p.pos.x + p.width / 2 + (Math.random() - 0.5) * p.width, y: p.pos.y + Math.random() * p.height * 0.6 }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 3 }, life: 18, color: i % 2 ? '#E0F2FE' : '#7DD3FC', size: 2 });
      playSound('squish', 0.6, 4); playSound('whoosh', 0.3, 10); playSound('splash', 0.25, 8);
      p.squash = 0.25;
      L.n = 0; L.drainT = 0;
    }
    L.under = 0;
    return out;
  }
  // (under: they find him, one after another)
  L.under++;
  if (L.n < MAX && L.under >= (L.n === 0 ? FIRST : L.latchT)) {
    L.n++; L.latchT = L.under + EVERY;
    playSound('squish', 0.35, 10);
    // (the first on, or a while since he last said anything about it: he does)
    if (L.sayCd === 0 && ctx.fx.speakVulgarity('hurt', LEECH_SOURCE)) L.sayCd = 300;
  } else if (L.n > 0 && L.under > FIRST && (L.under - FIRST) % SHOW_EVERY === 0 && shownOf(L) < SHOW_MAX) playSound('squish', 0.15, 14);
  if (L.n > 0) {
    // (the drain: a little at a time, faster with more of them)
    if (++L.drainT >= drainEvery(L.n)) {
      L.drainT = 0;
      if (!ctx.cheats.invincible && !p.untouchable) p.health -= hurtTaken(ctx.stageId, DRAIN);
      state.lastHurt = { source: LEECH_SOURCE, at: state.frame };
      const s = spotAt(state, Math.floor(Math.random() * shownOf(L)));
      for (let i = 0; i < 3; i++) state.particles.push({ pos: { x: s.x, y: s.y }, vel: { x: (Math.random() - 0.5) * 1.2, y: -0.4 - Math.random() * 0.6 }, life: 22, color: '#991B1B', size: 2 });
    }
    // (the drag: slower through the water, slower strokes up)
    p.vel.x *= 1 - DRAG * L.n;
    if (p.vel.y < 0) p.vel.y *= 1 - STROKE_DRAG * L.n;
  }
  return out;
};

/** One leech: a dark slug, banded, its sucker end darker, wr its wriggle (stretched or bunched). */
const paintLeech = (c: Ctx, wr: number) => {
  const len = 6 + wr;
  // (inked; its body in steps (the dark belly, the olive back, a wet glint along it); banded in rings; the orange
  // stripe down its back; the sucker end swollen and red with what it's had)
  c.fillStyle = '#0C0A09'; c.beginPath(); c.ellipse(0, 0, len + 1, 3.6, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#1E1C14'; c.beginPath(); c.ellipse(0, 0.4, len, 2.7, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#3A3A22'; c.beginPath(); c.ellipse(-0.5, -0.6, len - 1, 1.7, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#B8642A'; c.fillRect(-len + 2, -1, len * 1.5, 0.8);
  c.fillStyle = '#141208'; for (let k = -len + 3; k < len - 1; k += 2.5) c.fillRect(k, -2.2, 0.8, 4.4);
  c.fillStyle = 'rgba(230, 240, 220, 0.7)'; c.fillRect(-len * 0.5, -2, len * 0.6, 0.7);
  c.fillStyle = '#0C0A09'; c.beginPath(); c.arc(len - 0.5, 0, 2.4, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#8E1414'; c.beginPath(); c.arc(len - 0.5, 0, 1.8, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#D94A3A'; c.fillRect(len - 1.4, -1.2, 1, 1);
};

/** The leech, painted the once in each step of its wriggle at a few times its size, then just put down turned and
 *  scaled: thirty of them on him a frame, one drawImage each. (Its middle at (OX, BH / 2) in the box.) */
const FRAMES = 6, RES = 4, BW = 28, BH = 10, OX = 12.5;
let sprites: HTMLCanvasElement[] | null = null;
const spriteOf = (k: number) => {
  if (!sprites) {
    if (typeof document === 'undefined') return null;
    sprites = [];
    for (let i = 0; i < FRAMES; i++) {
      const cv = document.createElement('canvas'); cv.width = BW * RES; cv.height = BH * RES;
      const g = cv.getContext('2d')!;
      g.setTransform(RES, 0, 0, RES, OX * RES, BH * RES / 2);
      paintLeech(g, Math.sin((i / FRAMES) * Math.PI * 2) * 1.5);
      sprites.push(cv);
    }
  }
  return sprites[((k % FRAMES) + FRAMES) % FRAMES];
};

const drawLeech = (c: Ctx, x: number, y: number, a: number, k: number, sc: number) => {
  const img = spriteOf(k);
  c.save(); c.translate(x, y); c.rotate(a); c.scale(sc, sc);
  if (img) c.drawImage(img, -OX, -BH / 2, BW, BH);
  else paintLeech(c, Math.sin(k) * 1.5);
  c.restore();
};

/** The leeches on him (hanging off him all over, wriggling), and the ones flying off. Never in a scene or his death. */
export const drawLeeches = (c: Ctx, state: GameState) => {
  const L = wildsOf(state).leech, f = state.frame, p = state.player;
  if (!p.inCutscene && p.health > 0 && state.deathTimer <= 0) {
    const shown = shownOf(L);
    for (let i = 0; i < shown; i++) {
      const s = spotAt(state, i);
      // (each its own wriggle, its own size; the tail end swaying)
      drawLeech(c, s.x, s.y, s.a + Math.sin(f * 0.09 + i * 1.3) * 0.25, Math.floor(f / 5 + i * 2.3), 0.75 + ((i * 7) % 5) * 0.08);
    }
  }
  // (flying off: writhing, quicker)
  L.off.forEach((o, i) => { c.globalAlpha = Math.min(1, (50 - o.t) / 10); drawLeech(c, o.x, o.y, o.a, Math.floor(f / 3) + i, 0.85); c.globalAlpha = 1; });
};
