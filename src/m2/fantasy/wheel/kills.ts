// The kills (the user's: "when you win, show a funny animation of meathead killing one of the suitors in his fairy
// wheel cart. smashing him into the wall, throwing him off. etc."). A QTE won, it's one of these, in his cart, round in
// turn (shuffled, no two the same running):
//
//   SMASH  by the head into the gondola's post, three times; he's left draped over the side, his face on the post.
//   THROW  hoisted overhead and thrown off the wheel, screaming the whole way down; splat on the flower beds.
//   FLOOR  turned upside down by the ankles and driven headfirst through the floor: his head out the bottom of the
//          gondola, his legs kicking up out of it, then not; he rides round like that.
//   FLING  by the ankles, swung round and round overhead and let go at another suitor's gondola: the body hits him
//          (he's dazed: easier to take) and goes on down to the flower beds.
//   CHOKE  his own bouquet off him and stuffed down his throat, a fistful at a time; purple, petals everywhere; he
//          sits back down and dies with the roses out of his mouth.
//
// Every one of them shits himself going (undignified, both ways). Meathead's drawn posed (the grabs' way, moves/grab.ts)
// while it's on; nothing hurts him; it's his to play again the moment it's over.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { drawLeg, drawArmTo, drawTorsoFromHips, type Mood } from '../../../m1/game/render/player/body';
import { drawPoseSprite, drawPoseHead } from '../../moves/grab';
import { speak } from '../section';
import { drawSuitor, type SuitorPose, type SuitorLook, type Slump } from '../suitors';
import { box, mix, INK, type Ctx } from '../kit';
import { GY } from '../geometry';
import { ROSTER, HUB, X } from './layout';
import { DEATH, type KillKind } from './lines';
import { drawCartFloor, drawItem } from './art';
import type { Wheel, Body } from './state';

type P = [number, number];

export interface Kill {
  /** Whose (roster index), how, frames in, how long; who a fling's at; let go (a throw, a fling). */
  i: number; how: KillKind; t: number; dur: number; target: number | null; released: boolean;
  /** Its yell's had (in the close-up first): not again. */
  quiet?: boolean;
}
const DUR: Record<KillKind, number> = { smash: 150, throw: 66, floor: 132, fling: 98, choke: 140 };
/** Where the side view takes a kill on from after its close-up (closeup.ts showed the start up close): the last of the
 *  smashes done (the slide down the post), just before the throw's let go, the floor going through, the fling let go,
 *  the last fistfuls of roses. */
export const RESUME: Record<KillKind, number> = { smash: 107, throw: 42, floor: 38, fling: 74, choke: 88 };

/** The next kill (round in turn, shuffled; a fling only with somebody else to fling him at). */
export const nextKill = (w: Wheel, i: number, anyoneElse: boolean): Kill => {
  if (!w.killBag.length) {
    const all: KillKind[] = ['smash', 'throw', 'floor', 'fling', 'choke'];
    for (let k = all.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [all[k], all[j]] = [all[j], all[k]]; }
    w.killBag = all;
  }
  let how = w.killBag.shift()!;
  if (how === 'fling' && !anyoneElse) { w.killBag.push('fling'); how = w.killBag.shift()!; if (how === 'fling') how = 'throw'; }
  return { i, how, t: 0, dur: DUR[how], target: null, released: false };
};

// ---------------------------------------------------------------------------------------------------------------
// Where everybody is, each frame of it (the same for the update's effects and the drawing)

/** The cart's floor, his side, where Meathead stands, where the suitor's feet are when he's stood. */
export const spots = (w: Wheel, i: number) => {
  const s = ROSTER[i], c = w.carts[s.cart];
  return { fx: c.fx, fy: c.fy, side: s.side, mx: c.fx - s.side * 16, sx: c.fx + s.side * 22, k: s.cart };
};
const rotP = (x: number, y: number, a: number): P => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.max(0, Math.min(1, t));

/** The suitor's body (feet at (x, y), turned `rot` about them), the pose, Meathead's hands (world) and lean, his hop. */
interface Frame { x: number; y: number; rot: number; pose: SuitorPose; face: 1 | -1; hands: [P, P]; lean: number; hop: number; mood: Mood; purple: number; roses: boolean; bouquet: 'him' | 'meathead' | null; floor: boolean; slump?: Slump; dead?: boolean }

export const frameOf = (w: Wheel, k: Kill): Frame => {
  const { fy, side, mx, sx } = spots(w, k.i), t = k.t;
  const face = (-side) as 1 | -1;
  const base: Frame = { x: sx, y: fy, rot: 0, pose: 'hurt', face, hands: [[sx - side * 14, fy - 60], [sx - side * 18, fy - 56]], lean: 0.1, hop: 0, mood: 'grit', purple: 0, roses: false, bouquet: null, floor: false };
  const head = (f: Frame, up = 82): P => { const [dx, dy] = rotP(0, -up, f.rot); return [f.x + dx, f.y + dy]; };
  switch (k.how) {
    case 'smash': {
      let a: number;
      if (t < 16) a = (t / 16) * 0.2;
      else if (t < 110) { const c = (t - 16) % 30; a = c < 14 ? 0.42 - (0.37 * c) / 14 : c < 20 ? 0.05 + ((c - 14) / 6) * 0.37 : 0.42; if (t < 30) a = Math.min(a, 0.2); }
      else a = 0.42 + Math.min(1, (t - 110) / 30) * 0.66;
      base.rot = side * a;
      const h = head(base, 80);
      base.hands = t < 110 ? [[h[0] - side * 6, h[1] + 2], [h[0] - side * 10, h[1] - 4]] : [[mx + side * 20, fy - 40], [mx + side * 16, fy - 38]];
      base.lean = t < 110 ? 0.15 + a * 0.4 : 0;
      base.mood = t < 110 ? 'roar' : 'scowl';
      if (t >= 110) {
        // (let go: he slides down the post into his seat and slumps there, his head lolled on it)
        const u = Math.min(1, (t - 110) / 24);
        base.rot = 0; base.pose = 'sit'; base.y = fy + 18 * u;
        base.slump = { lean: lerp(-0.42, -0.55, u), loll: lerp(0, -0.45, u), grav: 0, arm: 30 }; base.dead = u > 0.4;
      }
      return base;
    }
    case 'throw': {
      const u = Math.min(1, t / 26), back = t >= 26 && t < 44 ? (t - 26) / 18 : 0;
      const over: P = [mx + side * (2 - back * 14), fy - 98];
      // (lying across his hands, feet to one side: his middle on them)
      base.rot = side * (Math.PI / 2) * u;
      const midAt: P = [lerp(sx, over[0], u), lerp(fy - 46, over[1], u)];
      const [dx, dy] = rotP(0, 46, base.rot);
      base.x = midAt[0] + dx; base.y = midAt[1] + dy;
      base.pose = 'hurt';
      base.hands = t < 44 ? [[midAt[0] + side * 6, midAt[1] + 8], [midAt[0] - side * 10, midAt[1] + 8]] : [[mx + side * 26, fy - 64], [mx + side * 22, fy - 60]];
      base.lean = t < 26 ? -0.05 : t < 44 ? -0.28 * back : 0.3;
      base.mood = 'roar';
      return base;
    }
    case 'floor': {
      // (his feet in Meathead's hands; turned over; up, then down through the floor)
      const u = Math.min(1, t / 22);
      const H: P = t < 22 ? [lerp(sx, mx + side * 18, u), lerp(fy, fy - 84, u)] : t < 40 ? [mx + side * 18, fy - 84 - Math.sin(((t - 22) / 18) * Math.PI) * 14] : [sx - side * 2, fy - 36];
      base.rot = Math.PI * u + (t >= 40 ? Math.sin(t * 0.6) * 0.1 * Math.max(0, 1 - (t - 40) / 70) : 0);
      base.x = H[0]; base.y = H[1];
      base.floor = t >= 40;
      base.pose = 'hurt';
      base.hands = t < 60 ? [[H[0] + side * 2, H[1] + 4], [H[0] - side * 4, H[1] + 2]] : [[mx + side * 10, fy - 32], [mx - side * 2, fy - 30]];
      base.hop = t >= 22 && t < 40 ? Math.sin(((t - 22) / 18) * Math.PI) * 16 : 0;
      base.lean = t >= 34 && t < 60 ? 0.35 : 0;
      base.mood = t < 60 ? 'roar' : 'scowl';
      if (t >= 100) {
        // (the kicking's stopped: the legs flop over out of the hole)
        const u = Math.min(1, (t - 100) / 14);
        base.pose = 'sit'; base.x = sx - side * 2; base.y = fy - 36; base.rot = Math.PI + side * 0.22 * u;
        base.slump = { lean: 0.15, loll: 0.5, grav: base.rot, arm: 30 }; base.dead = true;
      }
      return base;
    }
    case 'fling': {
      const u = Math.min(1, t / 16);
      const H: P = t < 16 ? [lerp(sx, mx + side * 6, u), lerp(fy, fy - 90, u)] : [mx + side * 4 + Math.cos(t * 0.25) * 4, fy - 92];
      base.rot = t < 16 ? Math.PI * u : Math.PI + (t - 16) * 0.25;
      base.x = H[0]; base.y = H[1];
      base.hands = [[H[0] + 2, H[1] + 2], [H[0] - 4, H[1] + 4]];
      base.lean = t >= 16 && t < 80 ? Math.sin(t * 0.25) * 0.12 : 0;
      base.mood = 'roar';
      if (k.released) base.hands = [[mx + side * 26, fy - 66], [mx + side * 20, fy - 62]];
      return base;
    }
    case 'choke': {
      base.pose = t < 14 ? 'talk' : 'hurt';
      base.bouquet = t < 10 ? 'him' : t < 92 ? 'meathead' : null;
      base.purple = Math.min(1, Math.max(0, (t - 14) / 78));
      base.roses = t >= 24;
      if (t >= 92) {
        // (sinks back into his seat and goes, chin on his chest, the arms dropping off the bench)
        const u = Math.min(1, (t - 92) / 30);
        base.pose = 'sit'; base.x = sx + side * 4 * u; base.rot = 0; base.y = fy + 20 * u;
        base.slump = { lean: 0.22 * u, loll: 0.75 * u, grav: 0, arm: 32 }; base.dead = u > 0.6;
      }
      const mouth: P = [sx - side * 8, fy - 83];
      const jab = t >= 14 && t < 92 ? (((t - 14) % 12) < 6 ? ((t - 14) % 12) / 6 : 1 - (((t - 14) % 12) - 6) / 6) : 0;
      base.hands = t < 96 ? [[lerp(mx + side * 22, mouth[0] - side * 2, jab), lerp(fy - 56, mouth[1], jab)], [sx - side * 14, fy - 72]] : [[mx + side * 14, fy - 30], [mx + side * 6, fy - 30]];
      base.lean = 0.12 + jab * 0.15;
      base.mood = t < 96 ? 'yell' : 'scowl';
      return base;
    }
  }
  return base;
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame: what happens when (the hits, the blood, the yells, letting go)

const yell = (w: Wheel, i: number, how: KillKind) => {
  if (w.kill?.quiet) return;
  const L = ROSTER[i].look;
  speak(L.voice, pickLine(DEATH[how]), s => { if (s) w.barks.set(i, s); else w.barks.delete(i); }, false);
};
/** His yell, up close (closeup.ts): the side view's kill then goes quiet. */
export const closeupYell = (w: Wheel, i: number, how: KillKind) => {
  speak(ROSTER[i].look.voice, pickLine(DEATH[how]), s => { if (s) w.barks.set(i, s); else w.barks.delete(i); }, false);
};
const blood = (ctx: FrameContext, x: number, y: number, dir: number, mult = 0.4) => ctx.fx.spawnDeathShower({ x, y }, dir, mult);
const poop = (state: GameState, x: number, y: number, up = false) => {
  playSound('fart', 0.8, -2);
  for (let i = 0; i < 10; i++) state.particles.push({ pos: { x, y }, vel: { x: (Math.random() - 0.5) * 3, y: up ? -2 - Math.random() * 3 : -0.5 - Math.random() }, life: 40, color: i % 3 ? '#6B4423' : '#8B5A2B', size: 3 + Math.random() * 3, grav: 0.2 });
};

/** A frame of the kill. Returns true when it's done (he's his own again). */
export const updateKill = (ctx: FrameContext, w: Wheel, k: Kill, pickTarget: () => number | null): boolean => {
  const { state } = ctx, t = ++k.t;
  const { fx, fy, side, sx, mx } = spots(w, k.i);
  const fr = frameOf(w, k);
  const out = Math.sign(fx - X(HUB.x)) || side;
  switch (k.how) {
    case 'smash':
      if (t === 46 || t === 76 || t === 106) {
        const [hx, hy] = rotP(0, -80, fr.rot);
        playSound('crunch', 1, -4 + t / 20); playSound('clang', 0.5, -8); shakeScreen(state, 8, 4);
        blood(ctx, fr.x + hx + side * 6, fr.y + hy, side, 0.35);
        // (a tooth or two)
        for (let i = 0; i < 2; i++) state.particles.push({ pos: { x: fr.x + hx + side * 6, y: fr.y + hy + 6 }, vel: { x: -side * (1 + Math.random() * 2), y: -3 - Math.random() * 2 }, life: 50, color: '#FFFBEA', size: 2, grav: 0.3 });
      }
      if (t === 48) yell(w, k.i, 'smash');
      if (t === 128) poop(state, sx, fy - 30);
      break;
    case 'throw':
      if (t === 44 && !k.released) {
        k.released = true;
        const midX = fr.x + Math.sin(fr.rot) * 46, midY = fr.y - Math.cos(fr.rot) * 46;
        w.bodies.push({ i: k.i, x: midX, y: midY, vx: out * 7.5, vy: -5.5, rot: fr.rot, spin: out * 0.2, target: null, how: 'throw' });
        playSound('whoosh', 0.9, -6); yell(w, k.i, 'throw');
      }
      break;
    case 'floor':
      if (t === 24) yell(w, k.i, 'floor');
      if (t === 40) {
        playSound('crack', 1, -6); playSound('crunch', 1, -10); shakeScreen(state, 12, 6);
        for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: sx + (Math.random() - 0.5) * 30, y: fy + 4 }, vel: { x: (Math.random() - 0.5) * 6, y: -2 - Math.random() * 4 }, life: 30, color: i % 2 ? '#A85A98' : '#6E2A6E', size: 3, grav: 0.3 });
        blood(ctx, sx, fy + 56, 0, 0.5);
      }
      if (t > 40 && t < 120 && t % 9 === 0) state.particles.push({ pos: { x: sx + (Math.random() - 0.5) * 8, y: fy + 60 }, vel: { x: 0, y: 1 }, life: 60, color: '#B91C1C', size: 3, grav: 0.3 });
      if (t === 100) poop(state, fr.x, fy - 70, true);
      break;
    case 'fling':
      if (t === 20) yell(w, k.i, 'fling');
      if (t >= 16 && t < 80 && t % 16 === 0) playSound('whoosh', 0.6, 4);
      if (t === 80 && !k.released) {
        k.released = true;
        const [dx, dy] = rotP(0, -46, fr.rot);
        const bx = fr.x + dx, by = fr.y + dy;
        k.target = pickTarget();
        let vx = out * 8, vy = -7;
        if (k.target !== null) {
          const tg = spots(w, k.target), tx = tg.fx + ROSTER[k.target].side * 26, ty = tg.fy - 60;
          const T = Math.max(22, Math.min(48, Math.hypot(tx - bx, ty - by) / 12)), g = 0.35;
          // (aimed where his cart's going to be)
          const c = w.carts[ROSTER[k.target].cart];
          vx = (tx + c.dx * T - bx) / T; vy = (ty + c.dy * T - by) / T - 0.5 * g * T;
        }
        w.bodies.push({ i: k.i, x: bx, y: by, vx, vy, rot: fr.rot, spin: 0.3 * out, target: k.target, how: 'fling' });
        playSound('whoosh', 1, -10); poop(state, bx, by);
      }
      break;
    case 'choke':
      if (t === 12) playSound('whoosh', 0.5, 6);
      if (t >= 14 && t < 92 && (t - 14) % 12 === 6) {
        playSound('punch', 0.6, 4);
        for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: sx - side * 8, y: fy - 83 }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 2 }, life: 40, color: ['#E11D48', '#F472B6', '#FB7185'][i % 3], size: 3, grav: 0.08 });
      }
      if (t === 30) yell(w, k.i, 'choke');
      if (t === 118) poop(state, sx, fy - 20);
      break;
  }
  void mx;
  return t >= k.dur;
};

/** The bodies in the air: falling, spinning; a flung one hits the suitor it's at; down on the flower beds: splat. */
export const updateBodies = (ctx: FrameContext, w: Wheel, onHit: (target: number, b: Body) => void, onDown: (b: Body) => void) => {
  for (const b of w.bodies) {
    b.vy += 0.35; b.x += b.vx; b.y += b.vy; b.rot += b.spin;
    if (b.target !== null && w.live.has(b.target)) {
      const tg = spots(w, b.target), tx = tg.fx + ROSTER[b.target].side * 26, ty = tg.fy - 60;
      if (Math.hypot(b.x - tx, b.y - ty) < 44) { onHit(b.target, b); b.target = null; b.vx = -b.vx * 0.3; b.vy = -3; }
    }
    if (b.y >= GY - 14) {
      b.done = true;
      playSound('splat', 1, -6); playSound('crunch', 0.9, -12); shakeScreen(ctx.state, 6, 3);
      blood(ctx, b.x, GY - 10, Math.sign(b.vx), 0.6);
      onDown(b);
    }
  }
  w.bodies = w.bodies.filter(b => !b.done);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** Meathead in a pose: feet at (x, y), facing `dir`, both hands to world points, leaning, hopped up off his feet. */
const drawMeathead = (c: Ctx, x: number, y: number, dir: 1 | -1, f: number, hands: [P, P], lean: number, mood: Mood, hop = 0) => {
  const feetY = y - hop, hipY = -24;
  const local = (p: P): P => { const fx = (p[0] - x) * dir, fy = p[1] - feetY - hipY; return rotP(fx, fy, -lean); };
  const elbow = (s: P, h: P): P => [(s[0] + h[0]) / 2 + 3, (s[1] + h[1]) / 2 + 7];
  const h1 = local(hands[0]), h2 = local(hands[1]);
  drawPoseSprite(c, x, feetY, dir, g => {
    drawLeg(g, [-5, hipY], [-11, hipY + 12], [-15, 0], 0, true);
    drawLeg(g, [5, hipY], [13, hipY + 12], [15, 0], 0, false);
    g.save(); g.translate(0, hipY); g.rotate(lean);
    drawArmTo(g, [-8, -22], elbow([-8, -22], h2), h2, true);
    drawTorsoFromHips(g);
    drawPoseHead(g, 2, -37, lean * 0.3, mood, f);
    drawArmTo(g, [11, -22], elbow([11, -22], h1), h1, false, 6);
    g.restore();
  });
};

/** A suitor turned `rot` about his feet at (x, y); purple in the face (choking), roses out of his mouth. */
export const drawSuitorAt = (c: Ctx, x: number, y: number, rot: number, face: 1 | -1, f: number, L: SuitorLook, pose: SuitorPose, extra: { purple?: number; roses?: boolean; daze?: boolean; slump?: Slump; dead?: boolean } = {}) => {
  c.save(); c.translate(x, y); c.rotate(rot);
  drawSuitor(c, 0, 0, face, f, L, pose, { slump: extra.slump, dead: extra.dead });
  // (his head's at (2, -89) facing right, his mouth at (6, -84); slumped, wherever the lean and the loll took it)
  let hx = 2, hy = -89, turn = 0;
  const sp = extra.slump;
  if (sp) {
    // (lolled about the neck (0, -74), dropped 3; then tipped about the hips (0, -40))
    const a = sp.loll, lx = 2 * Math.cos(a) + 12 * Math.sin(a), ly = 2 * Math.sin(a) - 12 * Math.cos(a) - 74;
    const b = sp.lean, rx = lx * Math.cos(b) - (ly + 40) * Math.sin(b), ry = lx * Math.sin(b) + (ly + 40) * Math.cos(b) - 40;
    hx = rx; hy = ry; turn = a + b;
  }
  c.translate(hx * face, hy); c.rotate(turn * face);
  if (extra.purple) { c.fillStyle = `rgba(110, 40, 160, ${0.55 * extra.purple})`; c.beginPath(); c.ellipse(0, 0, 11, 12, 0, 0, Math.PI * 2); c.fill(); }
  if (extra.roses) {
    const mx = 5 * face;
    box(c, mx - 1, 2, 12 * face, 3, '#2A6A2A');
    for (const [rx, ry, col] of [[10, -2, '#E11D48'], [14, 4, '#F472B6'], [6, 6, '#FB7185']] as [number, number, string][]) { c.fillStyle = INK; c.beginPath(); c.arc(mx + rx * face, ry, 4.5, 0, Math.PI * 2); c.fill(); c.fillStyle = col; c.beginPath(); c.arc(mx + rx * face, ry, 3.5, 0, Math.PI * 2); c.fill(); }
  }
  if (extra.daze) for (let k = 0; k < 3; k++) { const a = f * 0.15 + (k * Math.PI * 2) / 3; box(c, Math.cos(a) * 14 - 2, -18 + Math.sin(a) * 4 - 2, 4, 4, '#FEF08A'); }
  c.restore();
};

/** Dead in his own gondola (the cart stays level, so down's always down): smashed, slumped back against the post at
 *  his end, head lolled on it, arms hanging; choked, sunk in his seat, chin on his chest, roses out of his mouth;
 *  floored, upside down through the floor, his legs flopped over out of the hole. `sway`: the cart's swing (his arms
 *  and legs swing with it). (x, fy): his seat's spot, the floor. */
export const drawCorpseInCart = (c: Ctx, how: KillKind, x: number, fy: number, side: 1 | -1, L: SuitorLook, sway: number) => {
  const face = (-side) as 1 | -1;
  if (how === 'smash') drawSuitorAt(c, x, fy + 18, 0, face, 0, L, 'sit', { slump: { lean: -0.55, loll: -0.45 + sway * 0.5, grav: sway, arm: 30 }, dead: true });
  if (how === 'choke') drawSuitorAt(c, x + side * 4, fy + 20, 0, face, 0, L, 'sit', { slump: { lean: 0.22, loll: 0.75 + sway * 0.5, grav: sway, arm: 32 }, dead: true, purple: 1, roses: true });
  if (how === 'floor') { const r = Math.PI + side * 0.22 + sway * 0.4; drawSuitorAt(c, x - side * 2, fy - 36, r, face, 0, L, 'sit', { slump: { lean: 0.15, loll: 0.5, grav: r, arm: 30 }, dead: true }); }
};

/** What comes off him in the fall, lying by him: the crown, the cap, the helmet, the hat, the sash. */
const costumeBit = (c: Ctx, x: number, y: number, L: SuitorLook, dir: number) => {
  c.save(); c.translate(Math.round(x), Math.round(y));
  const fillPoly = (pts: number[], col: string) => { c.fillStyle = col; c.beginPath(); for (let k = 0; k < pts.length; k += 2) c.lineTo(pts[k], pts[k + 1]); c.closePath(); c.fill(); };
  if (L.kit === 'cape') { fillPoly([-10, 0, -10, -11, -5, -5, 0, -13, 5, -5, 10, -11, 10, 0], INK); fillPoly([-9, -1, -9, -9, -5, -4, 0, -11, 5, -4, 9, -9, 9, -1], L.trim); box(c, -9, -3, 18, 2, mix(L.trim, INK, 0.3)); }
  if (L.kit === 'tee') { c.fillStyle = INK; c.beginPath(); c.ellipse(0, -1, 11, 7, 0, Math.PI, 0); c.fill(); c.fillStyle = L.main; c.beginPath(); c.ellipse(0, -1, 10, 6, 0, Math.PI, 0); c.fill(); box(c, dir * 8, -3, dir * 10, 3, INK); box(c, dir * 9, -2, dir * 8, 1, L.main); box(c, -10, -2, 20, 1, L.trim); }
  if (L.kit === 'knight' || L.kit === 'viking') {
    c.fillStyle = INK; c.beginPath(); c.ellipse(0, -1, 12, 9, 0, Math.PI, 0); c.fill(); c.fillStyle = '#A8A8B4'; c.beginPath(); c.ellipse(0, -1, 11, 8, 0, Math.PI, 0); c.fill(); box(c, -6, -7, 4, 2, '#D8D8E4');
    if (L.kit === 'viking') for (const s of [-1, 1]) { fillPoly([s * 9, -3, s * 18, -6, s * 17, -15, s * 13, -5], INK); fillPoly([s * 9, -4, s * 16, -6, s * 16, -13, s * 12, -5], '#F2EAD0'); }
    else { c.fillStyle = INK; c.beginPath(); c.ellipse(-dir * 6, -9, 8, 4, -0.4 * dir, 0, Math.PI * 2); c.fill(); c.fillStyle = L.trim; c.beginPath(); c.ellipse(-dir * 6, -9, 7, 3, -0.4 * dir, 0, Math.PI * 2); c.fill(); }
  }
  if (L.kit === 'wizard') { c.rotate(dir * 1.3); fillPoly([-9, 0, -4, -30, 10, 0], INK); fillPoly([-8, -1, -4, -27, 9, -1], L.main); box(c, -3, -12, 2, 2, L.trim); box(c, 1, -6, 2, 2, L.trim); }
  if (L.kit === 'prince') { c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.moveTo(-16, -1); c.quadraticCurveTo(0, -6, 16, -2); c.stroke(); c.strokeStyle = '#E8B4C8'; c.lineWidth = 4; c.stroke(); c.strokeStyle = '#FFF6E8'; c.lineWidth = 1; c.stroke(); }
  c.restore();
};

/** Dead on the plaza where he came down: flat on his back in his blood, his legs bent up in the air (a dead bug), his
 *  head lolled back, his arms flopped, what he had on his head knocked off beside him. (x, y): his middle, the ground. */
export const drawCorpseGround = (c: Ctx, x: number, y: number, i: number, L: SuitorLook) => {
  const dir = i % 2 ? 1 : -1;
  costumeBit(c, x - dir * 74, y - 1, L, dir);
  c.save(); c.translate(Math.round(x + dir * 50), Math.round(y - 24)); c.scale(dir, 1); c.rotate(-Math.PI / 2);
  drawSuitor(c, 0, 0, 1, 0, L, 'sit', { slump: { lean: -0.12, loll: -0.6, grav: -Math.PI / 2, arm: 14 }, dead: true });
  c.restore();
};

/** An impact: a stepped starburst (white, yellow, pink at the tips), `u` 0..1 through its few frames. */
const burst = (c: Ctx, x: number, y: number, r: number, u: number) => {
  const k = 1 - u, rr = r * (0.6 + u * 0.6);
  for (const [s, col] of [[1.12, INK], [1, '#F472B6'], [0.75, '#FEF08A'], [0.42, '#FFFFFF']] as const) {
    c.fillStyle = col; c.beginPath();
    for (let i = 0; i < 16; i++) { const a = (i * Math.PI) / 8 + 0.2, q = (i % 2 ? 0.45 : 1) * rr * s * (0.7 + k * 0.3); c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); }
    c.closePath(); c.fill();
  }
};
/** Effort: sweat flying off a head (`n` drops, stepped blue-white), now and then. */
const sweat = (c: Ctx, x: number, y: number, f: number, seed: number) => {
  for (let i = 0; i < 3; i++) {
    const t = ((f + seed * 7 + i * 9) % 26) / 26, dir = i % 2 ? 1 : -1, px = x + dir * (6 + t * 16), py = y - 6 - Math.sin(t * Math.PI) * 12 + t * 8;
    if (t > 0.85) continue;
    box(c, px - 1, py - 2, 4, 5, INK); box(c, px, py - 1, 2, 3, '#A5F3FC'); box(c, px, py - 1, 1, 1, '#FFFFFF');
  }
};
/** Speed lines behind something moving at (vx, vy). */
const speedLines = (c: Ctx, x: number, y: number, vx: number, vy: number, seed: number) => {
  const sp = Math.hypot(vx, vy); if (sp < 3) return;
  const ux = -vx / sp, uy = -vy / sp, nx = -uy, ny = ux;
  for (let i = 0; i < 5; i++) {
    const o = (hashN(seed + i) - 0.5) * 50, l = 18 + hashN(seed * 3 + i) * 26, sx = x + nx * o + ux * 26, sy = y + ny * o + uy * 26;
    c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 2; c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + ux * l, sy + uy * l); c.stroke();
  }
};
const hashN = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** The kill on now (world space, in front of everything in the gondola): the suitor, the floor over him if he's through
 *  it, Meathead; the hits' bursts, the sweat, the splinters. */
export const drawKill = (c: Ctx, state: GameState, w: Wheel, k: Kill) => {
  const f = state.frame, s = ROSTER[k.i], fr = frameOf(w, k), { fx, fy, side, mx, sx } = spots(w, k.i), t = k.t;
  if (!(k.released && (k.how === 'throw' || k.how === 'fling'))) {
    if (k.how === 'fling' && t >= 16 && t < 80) {
      // (the swing's blur: where he was a frame or two back, faint)
      c.globalAlpha = 0.3; drawSuitorAt(c, fr.x, fr.y, fr.rot - 0.5, fr.face, f, s.look, fr.pose); c.globalAlpha = 1;
    }
    drawSuitorAt(c, fr.x, fr.y, fr.rot, fr.face, f, s.look, fr.pose, { purple: fr.purple, roses: fr.roses, slump: fr.slump, dead: fr.dead });
    if (fr.floor) drawCartFloor(c, s.cart, fx, fy);
  }
  if (fr.bouquet === 'him') drawItem(c, 'bouquet', fr.x - side * 30, fy - 96, 0);
  if (fr.bouquet === 'meathead') drawItem(c, 'bouquet', fr.hands[0][0], fr.hands[0][1] - 4, side * 1.2);
  drawMeathead(c, mx, fy, side, f, fr.hands, fr.lean, fr.mood, fr.hop);
  // (the hits)
  if (k.how === 'smash') for (const hit of [46, 76, 106]) if (t >= hit && t < hit + 6) { const [hx, hy] = rotP(0, -80, fr.rot); burst(c, fr.x + hx + side * 8, fr.y + hy, 18, (t - hit) / 6); }
  if (k.how === 'floor' && t >= 40 && t < 47) { burst(c, sx, fy + 4, 24, (t - 40) / 7); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI + 0.2, d = (t - 40) * 5; box(c, sx + Math.cos(a) * d - 3, fy + 4 - Math.sin(a) * d * 0.6, 6, 2, i % 2 ? '#A85A98' : '#6E2A6E'); } }
  if (k.how === 'choke' && t >= 14 && t < 92 && (t - 14) % 12 < 3) burst(c, sx - side * 10, fy - 84, 9, ((t - 14) % 12) / 3);
  if (k.how === 'throw' && t >= 26 && t < 44) sweat(c, mx, fy - 64, f, 1);
  if (k.how === 'smash' && t < 110) sweat(c, fr.x + rotP(0, -80, fr.rot)[0], fr.y + rotP(0, -80, fr.rot)[1], f, 2);
};

/** A body come down on the flower beds: a pool in steps, the flowers flattened round him, petals. */
export const drawSplat = (c: Ctx, x: number, y: number, seed: number) => {
  c.fillStyle = INK; c.beginPath(); c.ellipse(x, y - 1, 48, 6, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#5A0E0E'; c.beginPath(); c.ellipse(x, y - 1, 46, 5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#7F1D1D'; c.beginPath(); c.ellipse(x - 4, y - 1.5, 36, 3.5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#B91C1C'; c.beginPath(); c.ellipse(x - 10, y - 2, 16, 1.5, 0, 0, Math.PI * 2); c.fill();
  for (let i = 0; i < 9; i++) { const px = x - 60 + hashN(seed * 11 + i) * 120, py = y - 3 - hashN(seed * 7 + i) * 8; box(c, px, py, 3, 2, ['#F472B6', '#FEF08A', '#E11D48', '#A5F3FC'][i % 4]); }
  for (let i = 0; i < 5; i++) { const px = x - 50 + hashN(seed * 5 + i) * 100; box(c, px, y - 2, 6, 2, '#2A6A2A'); box(c, px + 2, y - 3, 3, 1, '#3A8A3A'); }
  for (let i = 0; i < 6; i++) { const px = x - 30 + hashN(seed * 13 + i) * 60; box(c, px, y - 5 - hashN(seed + i) * 6, 2, 2, '#991B1B'); }
};

/** Meathead in a suitor's cart for the QTE: grappling him, leaning in as he wins it, shoved back as he loses it. */
export const drawStruggle = (c: Ctx, state: GameState, w: Wheel, i: number, edge: number, lock: number) => {
  const f = state.frame, s = ROSTER[i], { fy, side, mx, sx } = spots(w, i);
  const jig = Math.sin(f * 0.9) * 2, push = (edge - 0.5) * 8;
  const rot = side * (edge * 0.18 - 0.06) + Math.sin(f * 0.7) * 0.02;
  drawSuitorAt(c, sx + side * Math.max(0, push), fy, rot, (-side) as 1 | -1, f, s.look, edge > 0.55 ? 'hurt' : lock < 1 ? 'talk' : 'flex');
  const [hx, hy] = rotP(0, -64, rot);
  drawMeathead(c, mx + side * push * 0.5, fy, side, f, [[sx + hx - side * 8, fy + hy + jig], [sx + hx - side * 12, fy + hy - 6 - jig]], 0.18 + edge * 0.1, edge > 0.5 ? 'roar' : 'grit');
  // (straining: sweat off them both, a little burst where they're locked together every so often)
  const [qx, qy] = rotP(0, -86, rot);
  sweat(c, sx + side * Math.max(0, push) + qx, fy + qy, f, i);
  sweat(c, mx + side * push * 0.5, fy - 70, f + 13, i + 4);
  if (f % 20 < 3) burst(c, (mx + sx) / 2, fy - 62, 8, (f % 20) / 3);
};

/** A body in the air (thrown, flung): speed lines behind him. */
export const drawBody = (c: Ctx, state: GameState, b: Body) => {
  speedLines(c, b.x, b.y, b.vx, b.vy, b.i * 5 + Math.floor(state.frame / 3));
  c.save(); c.translate(b.x, b.y); c.rotate(b.rot);
  drawSuitor(c, 0, 46, 1, state.frame, ROSTER[b.i].look, 'hurt');
  c.restore();
};
