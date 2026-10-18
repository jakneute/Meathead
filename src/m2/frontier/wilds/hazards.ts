// The wilds' hazards (each taught alone first, then built on; every one hurts the animals too):
//
//   BEAR TRAPS   jaws open flat on the ground (the park says AUTHENTIC). Step in one and it SNAPS: damage, and it holds
//                him by the ankle (no walking, no jumping: he can still shoot and swing) till he pries it open (mash
//                left/right/jump to be out sooner). An animal that steps in one is caught too (the little ones killed
//                outright, the big ones held a good while, hurt). It springs open again a moment after it lets go.
//   PINE CONES   a big pine shakes (the tell: needles coming down) as he passes under it, then drops a cone (a bonk).
//   LOOSE EDGES  fake rock shelves that shake a moment after he lands on them (pebbles, a creak) and drop away; they
//                come back a few seconds later (never locking the way back).
//                Any animal that walks cracks one the same (its weight on it).
//   BEEHIVES     a hive hanging off a branch (its own kind: shoot it down, smash it). Out comes the swarm, going for
//                whoever's nearest (the wolves under it, likely), stinging (him mildly); nothing kills it; it can't
//                follow him under the water; after a while it loses interest and drifts off up out of it.
//   THE LOG PILE atop the meadow's hill: while he's on the hill, a log comes rolling down it every couple of seconds
//                (jump them), lying along the slope, turning; they flatten whatever's in their way and smash at the
//                hill's foot.
//   QUILLS       a porcupine he's close to sprays a fan of quills up off its back (the porcupine's AI, kinds.ts): they
//                go up and out over anything low; slide in under them.
//   SNAGS        dead branches sharpened by the current, just under the surface of the rapids and the river: a swimmer
//                carried into one is cut (the log rides over them). The water's a bad idea; the log's the way.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import type { Enemy } from '../../../m1/types';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { hazardHit, hazardVictims, boxHits, isSmall, setHazardZones } from '../../hazardHit';
import { ledge } from '../section';
import { box, onScreen, INK, type Ctx } from '../kit';
import { GY } from '../geometry';
import { TRAPS, PINES, LOOSE, LOG_PILE, SNAGS, WATERS, X, Y, groundH } from './layout';
import { wildsOf, type Trap, type Roller } from './state';
import { drawLog } from './logs';

const AWAY = -99999;

export const buildHazards = (state: GameState) => {
  const w = wildsOf(state);
  w.traps = TRAPS.map(([rx, h]) => ({ x: X(rx), y: Y(h), state: 'open', t: 0, hold: 0, victim: null, latch: false }));
  w.pines = PINES.map(([rx, h, g]) => ({ x: X(rx), coneY: Y(g + h), groundY: Y(g), state: 'ready', t: 0, cy: 0, vy: 0, bounced: false }));
  w.loose = LOOSE.map(([a, b, h]) => ({ a: X(a), b: X(b), y: Y(h), state: 'solid', t: 0, drop: 0, block: ledge(state, X(a), Y(h), X(b) - X(a), { hidden: true, tag: 'fr-loose' }) }));
};

// ---------------------------------------------------------------------------------------------------------------
// Bear traps

const TRAP_DMG = 13, TRAP_HOLD = 80, MASH = 9, ANIMAL_DMG = 30, ANIMAL_HOLD = 160, REARM = 110;
/** The traps are drawn this much bigger than their base art (the playtest's "a bit larger"), and catch as wide. */
const TRAP_S = 1.45;

/** Who's caught in one right now (him): his controls taken (left/right/jump), his feet pinned at the trap. */
export const caughtIn = (state: GameState): Trap | null => wildsOf(state).traps.find(t => t.state === 'him') ?? null;

export const updateTraps = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, p = state.player, w = wildsOf(state);
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  let out = controls;
  const press = { left: !!controls.left, right: !!controls.right, jump: !!controls.jump };
  for (const t of w.traps) {
    t.t++;
    if (t.state === 'open') {
      // (him: stood on it, his feet on the ground at it)
      const onIt = Math.abs(cx - t.x) < 12 * TRAP_S && Math.abs(feet - t.y) < 6 && p.isGrounded;
      if (t.latch && !onIt) t.latch = false;
      if (onIt && !t.latch && p.health > 0 && !p.inCutscene && !p.untouchable) {
        t.state = 'him'; t.t = 0; t.hold = TRAP_HOLD;
        p.invincibilityTimer = 0;
        hurtPlayer(ctx, TRAP_DMG, 'm2:fr_beartrap');
        playSound('clang', 1, -2); playSound('crunch', 0.9, -4); shakeScreen(state, 6, 3);
        for (let i = 0; i < 8; i++) state.particles.push({ pos: { x: t.x, y: t.y - 6 }, vel: { x: (Math.random() - 0.5) * 4, y: -Math.random() * 4 }, life: 24, color: i % 2 ? '#B91C1C' : '#7F1D1D', size: 2 + Math.random() * 2 });
        continue;
      }
      // (an animal walking into it)
      for (const e of hazardVictims(state, { flyers: false })) {
        if (e.kind === 'm2:fr_beaver' || e.kind === 'm2:fr_rattler' || e.kind === 'm2:fr_hive' || e.kind === 'm2:fr_trout') continue;
        const ex = e.pos.x + e.width / 2;
        if (Math.abs(ex - t.x) < 14 * TRAP_S && Math.abs(e.pos.y + e.height - t.y) < 8 && e.vel.y >= 0) {
          playSound('clang', 0.9, 0);
          const dead = hazardHit(ctx, e, ANIMAL_DMG, t.x + 1, 'SNAP!', { knock: 0 });
          if (dead) { t.state = 'sprung'; t.t = 0; }
          else { t.state = 'animal'; t.t = 0; t.hold = ANIMAL_HOLD; t.victim = e; }
          break;
        }
      }
    } else if (t.state === 'him') {
      // (held by the ankle: pinned there; every fresh press of left, right or jump pries it a bit further)
      p.pos.x = t.x - p.width / 2; p.vel.x = 0;
      t.hold--;
      for (const k of ['left', 'right', 'jump'] as const) if (press[k] && !w.lastPress[k]) t.hold -= MASH;
      out = { ...out, left: false, right: false, jump: false, special: false, charge: false };
      if (t.hold <= 0 || p.health <= 0) { t.state = 'sprung'; t.t = 0; t.latch = true; playSound('clink', 0.8, 2); }
    } else if (t.state === 'animal') {
      const e = t.victim;
      if (!e || e.health <= 0 || e.isBlownAway || !state.enemies.includes(e) || --t.hold <= 0) {
        if (e && e.health > 0) e.puppet = false;
        t.state = 'sprung'; t.t = 0; t.victim = null;
      } else {
        e.puppet = true; e.pauseTimer = 2; e.vel.x = 0; e.pos.x = t.x - e.width / 2;
        if (t.t % 50 === 0) e.hitFlash = 6;
      }
    } else if (t.state === 'sprung' && t.t > REARM) {
      t.state = 'open'; t.t = 0;
      if (Math.abs(cx - t.x) < 14 * TRAP_S && Math.abs(feet - t.y) < 8) t.latch = true;
    }
  }
  w.lastPress = press;
  return out;
};

/** A trap, crude: the stake and chain, the two jaws (open flat on the ground, teeth up; or shut, standing up). */
const drawTrap = (c: Ctx, t: Trap, f: number) => {
  c.save(); c.translate(Math.round(t.x), Math.round(t.y)); c.scale(TRAP_S, TRAP_S);
  trapArt(c, t, f);
  c.restore();
};
/** The trap's art at the origin (its middle, on the ground), base size. */
const trapArt = (c: Ctx, t: Trap, f: number) => {
  const x = 0, y = 0;
  // (the stake, the chain to it)
  box(c, x - 26, y - 6, 3, 7, '#52525B');
  for (let k = 0; k < 5; k++) box(c, x - 23 + k * 3, y - 2 - (k % 2), 3, 2, '#71717A');
  if (t.state === 'open') {
    // (flat open: the two jaws each a half ring, the teeth along their inner edges, the pan in the middle)
    box(c, x - 15, y - 3, 30, 4, INK);
    box(c, x - 14, y - 2, 28, 2, '#8A8A92'); box(c, x - 14, y - 2, 28, 1, '#C8C8D0');
    for (let k = 0; k < 6; k++) { box(c, x - 13 + k * 5, y - 5, 2, 3, '#D4D4D8'); }
    box(c, x - 4, y - 3, 8, 2, '#A16207');
    // (a glint now and then: it's there, it's real)
    if (f % 90 < 6) box(c, x + 6, y - 6, 2, 2, '#FFFFFF');
  } else {
    // (shut: the jaws standing up, clamped together, the teeth meshed)
    box(c, x - 9, y - 16, 18, 17, INK);
    box(c, x - 8, y - 15, 7, 15, '#8A8A92'); box(c, x + 1, y - 15, 7, 15, '#71717A');
    for (let k = 0; k < 4; k++) { box(c, x - 2, y - 14 + k * 4, 2, 2, '#D4D4D8'); box(c, x, y - 12 + k * 4, 2, 2, '#D4D4D8'); }
    box(c, x - 10, y - 2, 20, 3, '#52525B');
    if (t.state === 'him' || t.state === 'animal') for (let k = 0; k < 2; k++) box(c, x - 6 + k * 9, y - 5 - (f % 20 < 10 ? 1 : 0), 3, 4, '#B91C1C');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Pine cones

const CONE_SHAKE = 26, CONE_G = 0.42, CONE_DMG = 6, CONE_REGROW = 200;

export const updatePines = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, w = wildsOf(state);
  const cx = p.pos.x + p.width / 2;
  for (const pn of w.pines) {
    pn.t++;
    if (pn.state === 'ready') {
      if (Math.abs(cx - pn.x) < 70 && p.pos.y > pn.coneY && p.health > 0) { pn.state = 'shake'; pn.t = 0; playSound('crack', 0.4, 6); }
    } else if (pn.state === 'shake') {
      if (pn.t % 5 === 0) state.particles.push({ pos: { x: pn.x + (Math.random() - 0.5) * 40, y: pn.coneY - 10 }, vel: { x: (Math.random() - 0.5), y: 1 + Math.random() }, life: 40, color: '#3F6A2A', size: 2 });
      if (pn.t >= CONE_SHAKE) { pn.state = 'fall'; pn.t = 0; pn.cy = pn.coneY; pn.vy = 0; pn.bounced = false; }
    } else if (pn.state === 'fall') {
      pn.vy += CONE_G; pn.cy += pn.vy;
      const cxx = pn.x;
      // (him)
      if (p.health > 0 && cxx > p.pos.x && cxx < p.pos.x + p.width && pn.cy > p.pos.y && pn.cy < p.pos.y + p.height) {
        if (p.invincibilityTimer <= 0) hurtPlayer(ctx, CONE_DMG, 'm2:fr_cone', { x: 0, y: -2 }, 8);
        playSound('bonk', 0.8, 0); pn.state = 'gone'; pn.t = 0;
        for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: cxx, y: pn.cy }, vel: { x: (Math.random() - 0.5) * 4, y: -Math.random() * 3 }, life: 20, color: '#7A4A22', size: 2 });
        continue;
      }
      // (anything else under it)
      for (const e of hazardVictims(state)) if (boxHits(e, cxx - 5, pn.cy - 6, 10, 12)) { hazardHit(ctx, e, 10, cxx, 'BONK!'); playSound('bonk', 0.7, 2); pn.state = 'gone'; pn.t = 0; break; }
      if (pn.state !== 'fall') continue;
      if (pn.cy > pn.groundY - 5) {
        if (!pn.bounced) { pn.bounced = true; pn.vy = -3.5; pn.cy = pn.groundY - 5; playSound('thud', 0.3, 8); }
        else { pn.state = 'gone'; pn.t = 0; }
      }
    } else if (pn.state === 'gone' && pn.t > CONE_REGROW) { pn.state = 'ready'; pn.t = 0; }
  }
};

const cone = (c: Ctx, x: number, y: number) => {
  box(c, x - 4, y - 6, 8, 12, INK);
  box(c, x - 3, y - 5, 6, 10, '#8A5A2E');
  for (let k = 0; k < 3; k++) box(c, x - 3, y - 4 + k * 3, 6, 1, '#5A3416');
  box(c, x - 1, y - 8, 2, 3, '#4A2A10');
};

/** A big pine (crude: a trunk, stacked triangles of boughs, a lit edge), shaking while it's about to drop. */
const drawPine = (c: Ctx, x: number, groundY: number, coneY: number, shake: number, f: number) => {
  const sx = shake ? Math.sin(f * 1.4) * 2 : 0;
  const top = coneY - 120;
  box(c, x - 6, coneY - 20, 12, groundY - coneY + 20, INK); box(c, x - 5, coneY - 20, 10, groundY - coneY + 20, '#6B4423'); box(c, x - 5, coneY - 20, 3, groundY - coneY + 20, '#8A5A30');
  for (let k = 0; k < 5; k++) {
    const yy = top + k * 34, half = 20 + k * 14;
    c.fillStyle = INK; c.beginPath(); c.moveTo(x + sx, yy - 4); c.lineTo(x + half + 2 + sx, yy + 44); c.lineTo(x - half - 2 + sx, yy + 44); c.closePath(); c.fill();
    c.fillStyle = '#24502E'; c.beginPath(); c.moveTo(x + sx, yy); c.lineTo(x + half + sx, yy + 42); c.lineTo(x - half + sx, yy + 42); c.closePath(); c.fill();
    c.fillStyle = '#3A7040'; c.beginPath(); c.moveTo(x + sx, yy); c.lineTo(x - half + sx, yy + 42); c.lineTo(x - half + 8 + sx, yy + 42); c.closePath(); c.fill();
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Loose edges

const LOOSE_SHAKE = 30, LOOSE_BACK = 260;

export const updateLoose = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, w = wildsOf(state);
  const walkers = hazardVictims(state, { flyers: false });
  for (const L of w.loose) {
    L.t++;
    // (him stood on it, or any animal that walks: its weight cracks it the same)
    const on = (p.isGrounded && Math.abs(p.pos.y + p.height - L.y) < 4 && p.pos.x + p.width > L.a + 2 && p.pos.x < L.b - 2)
      || (L.state === 'solid' && walkers.some(e => Math.abs(e.vel.y) < 0.5 && Math.abs(e.pos.y + e.height - L.y) < 5 && e.pos.x + e.width > L.a + 2 && e.pos.x < L.b - 2));
    if (L.state === 'solid' && on) { L.state = 'shake'; L.t = 0; playSound('crack', 0.6, -2); }
    else if (L.state === 'shake') {
      if (L.t % 6 === 0) state.particles.push({ pos: { x: L.a + Math.random() * (L.b - L.a), y: L.y + 14 }, vel: { x: 0, y: 1 }, life: 30, color: '#8A8478', size: 2 });
      if (L.t >= LOOSE_SHAKE) { L.state = 'fallen'; L.t = 0; L.drop = 0; L.block.y = AWAY; playSound('crumble', 0.8, -4); shakeScreen(state, 3, 2); }
    } else if (L.state === 'fallen') {
      L.drop += 6 + L.t * 0.3;
      // (back, but not on top of him)
      const clear = !(p.pos.x + p.width > L.a && p.pos.x < L.b && p.pos.y < L.y + 16 && p.pos.y + p.height > L.y - 4);
      if (L.t > LOOSE_BACK && clear) { L.state = 'solid'; L.t = 0; L.block.y = L.y; }
    }
  }
};

/** A fake-rock shelf (crude): its fiberglass face, a lit top lip (standable), a bolt; loose ones cracked, shaking. */
export const drawShelf = (c: Ctx, a: number, b: number, y: number, loose: boolean, shake = 0, f = 0) => {
  const sx = shake ? Math.sin(f * 2.1) * 1.5 : 0;
  box(c, a - 1 + sx, y - 1, b - a + 2, 18, INK);
  box(c, a + sx, y, b - a, 16, loose ? '#9A8E78' : '#8E8676');
  box(c, a + sx, y + 10, b - a, 6, loose ? '#7A6E58' : '#6E6858');
  box(c, a + sx, y, b - a, 3, '#D8CCAA');
  box(c, a + 6 + sx, y + 6, 2, 2, '#52525B');
  // (its underside tapering off: fake rock on a steel bracket)
  c.fillStyle = loose ? '#7A6E58' : '#6E6858'; c.beginPath(); c.moveTo(a + 8 + sx, y + 16); c.lineTo(b - 8 + sx, y + 16); c.lineTo((a + b) / 2 + sx, y + 30); c.closePath(); c.fill();
  if (loose) {
    // (the cracks across it)
    c.strokeStyle = '#3A3428'; c.lineWidth = 1; c.beginPath();
    c.moveTo(a + (b - a) * 0.3 + sx, y + 2); c.lineTo(a + (b - a) * 0.36 + sx, y + 9); c.lineTo(a + (b - a) * 0.3 + sx, y + 15);
    c.moveTo(a + (b - a) * 0.7 + sx, y + 3); c.lineTo(a + (b - a) * 0.64 + sx, y + 12); c.stroke();
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Beehives and their swarms

/** How long the swarm's after somebody (frames), then how long it takes drifting off; how fast; how often it stings
 *  an animal, and him (mildly: the playtest's). */
const SWARM_LIFE = 600, SWARM_LEAVE = 120, SWARM_SPEED = 2.4, STING_ENEMY = 30, STING_HIM = 50, STING_DMG = 3;

/** Each frame: a hive that's been knocked down (shot, smashed, grabbed and thrown, whatever: it's dead) lets its swarm
 *  out where it was; the swarms hunt and sting. Nothing kills a swarm: it loses interest in time and drifts off. */
export const updateBees = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, w = wildsOf(state);
  // (every hive there is, as it wakes: one that's asleep somewhere far off isn't dead)
  for (const e of state.enemies) if (e.kind === 'm2:fr_hive' && !w.hives.some(h => h.e === e)) w.hives.push({ e, x: e.pos.x + e.width / 2, y: e.pos.y + e.height / 2, out: false });
  for (const h of w.hives) {
    if (h.out) continue;
    const dead = h.e.health <= 0 || !!h.e.isBlownAway;
    if (!dead) { if (state.enemies.includes(h.e)) { h.x = h.e.pos.x + h.e.width / 2; h.y = h.e.pos.y + h.e.height / 2; } continue; }
    h.out = true;
    w.swarms.push({ x: h.x, y: h.y, t: 0, tx: h.x, ty: h.y, stingCd: new Map(), gone: 0 });
    playSound('chitter', 1, 4);
  }
  w.swarms = w.swarms.filter(s => {
    s.t++;
    // (bored of it: off up and away, no more stinging)
    if (s.t > SWARM_LIFE) {
      s.gone++;
      s.x += Math.sin(s.t * 0.21) * 1.5 + 0.8; s.y -= 1.8;
      if (s.t % 30 === 0) playSound('chitter', 0.2 * (1 - s.gone / SWARM_LEAVE), 8);
      return s.gone < SWARM_LEAVE;
    }
    // (whoever's nearest: him (unless he's under water), or any animal that's been seen)
    const under = p.swimming && p.pos.y > (p.swimSurfaceY ?? 0);
    let best: { x: number; y: number; d: number; e: Enemy | null } | null = null;
    if (p.health > 0 && !under && !p.inCutscene) { const d = Math.hypot(p.pos.x + p.width / 2 - s.x, p.pos.y + 20 - s.y); if (d < 520) best = { x: p.pos.x + p.width / 2, y: p.pos.y + 20, d, e: null }; }
    for (const e of hazardVictims(state)) {
      if (e.kind === 'm2:fr_hive') continue;
      const ex = e.pos.x + e.width / 2, ey = e.pos.y + e.height * 0.4, d = Math.hypot(ex - s.x, ey - s.y);
      if (d < 520 && (!best || d < best.d)) best = { x: ex, y: ey, d, e };
    }
    if (best) { s.tx = best.x; s.ty = best.y; }
    const dx = s.tx - s.x, dy = s.ty - s.y, d = Math.hypot(dx, dy) || 1;
    s.x += (dx / d) * Math.min(SWARM_SPEED, d) + Math.sin(s.t * 0.3) * 1.2;
    s.y += (dy / d) * Math.min(SWARM_SPEED, d) + Math.cos(s.t * 0.27) * 1.2;
    for (const [k, v] of s.stingCd) s.stingCd.set(k, v - 1);
    // (stinging: him, and whatever animal's in it)
    if (p.health > 0 && !under && Math.hypot(p.pos.x + p.width / 2 - s.x, p.pos.y + 24 - s.y) < 34 && (s.stingCd.get(p) ?? 0) <= 0) {
      s.stingCd.set(p, STING_HIM); p.invincibilityTimer = 0;
      hurtPlayer(ctx, STING_DMG, 'm2:fr_bees', undefined, 4);
    }
    for (const e of hazardVictims(state)) {
      if (e.kind === 'm2:fr_hive') continue;
      if (Math.hypot(e.pos.x + e.width / 2 - s.x, e.pos.y + e.height * 0.4 - s.y) < 40 && (s.stingCd.get(e) ?? 0) <= 0) {
        s.stingCd.set(e, STING_ENEMY);
        hazardHit(ctx, e, isSmall(e) ? 999 : 14, s.x, 'STUNG!', { knock: 3 });
      }
    }
    if (s.t % 24 === 0) playSound('chitter', 0.35, 6);
    return true;
  });
};

const drawSwarm = (c: Ctx, x: number, y: number, t: number) => {
  for (let i = 0; i < 22; i++) {
    const a = t * (0.2 + (i % 5) * 0.03) + i * 2.3, r = 8 + (i % 4) * 6 + Math.sin(t * 0.1 + i) * 4;
    const bx = x + Math.cos(a) * r, by = y + Math.sin(a * 1.3) * r * 0.7;
    box(c, bx - 1, by - 1, 3, 2, '#1C1917'); box(c, bx, by - 1, 1, 2, '#FACC15');
    if ((t + i) % 4 < 2) box(c, bx - 1, by - 3, 2, 1, 'rgba(255,255,255,0.7)');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The log pile and its rolling logs

const ROLL_R = 14, ROLL_LEN = 110, ROLL_DMG = 14, ROLL_MAX = 6;

/** A rolling log lying along the hill where it is: its two ends on the ground (yl, yr: the ground's y under each), its
 *  slant (ang), its middle (cx, cy: its axis, a radius up off the slope), and how high and low it reaches. */
const rollerPose = (r: Roller) => {
  const yl = Y(groundH(r.x) ?? 0), yr = Y(groundH(r.x + ROLL_LEN) ?? 0);
  const ang = Math.atan2(yr - yl, ROLL_LEN);
  return { yl, yr, ang, cx: r.x + ROLL_LEN / 2, cy: (yl + yr) / 2 - ROLL_R / Math.cos(ang), top: Math.min(yl, yr) - 2 * ROLL_R, bottom: Math.max(yl, yr) };
};

export const updateRollers = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, w = wildsOf(state);
  const cx = p.pos.x + p.width / 2;
  const onHill = cx > X(LOG_PILE.foot) - 260 && cx < X(LOG_PILE.top) && p.health > 0 && !p.inCutscene;
  // (the tell: the pile rumbles, its top log rocking, a moment before one comes loose)
  if (onHill && w.pileT === LOG_PILE.every - 36) playSound('rumble', 0.7, 4);
  if (onHill && ++w.pileT >= LOG_PILE.every) { w.pileT = 0; w.rollers.push({ x: X(LOG_PILE.x) - ROLL_LEN / 2, y: 0, vx: -1, spin: 0, dead: 0 }); playSound('thud', 0.8, -6); }
  if (!onHill) w.pileT = Math.min(w.pileT, LOG_PILE.every - 30);
  const zones: { x0: number; x1: number; y0: number; y1: number }[] = [];
  w.rollers = w.rollers.filter(r => {
    if (r.dead) { r.dead++; return r.dead < 30; }
    r.vx = Math.max(-ROLL_MAX, r.vx - 0.12);
    r.x += r.vx; r.spin += r.vx / ROLL_R;
    // (its top: the higher of its two ends, it lying along the hill (see rollerPose))
    const pose = rollerPose(r);
    r.y = pose.top;
    zones.push({ x0: r.x - 80, x1: r.x + ROLL_LEN + 20, y0: pose.top - 10, y1: pose.bottom });
    // (him: rolled over (the log along the slope where he is: from the ground up its thickness))
    const pcx = Math.max(r.x, Math.min(r.x + ROLL_LEN, p.pos.x + p.width / 2));
    const under = pose.yl + (pose.yr - pose.yl) * ((pcx - r.x) / ROLL_LEN);
    if (p.health > 0 && p.pos.x + p.width - 6 > r.x && p.pos.x + 6 < r.x + ROLL_LEN && p.pos.y + p.height > under - 2 * ROLL_R + 4 && p.pos.y < under && p.invincibilityTimer <= 0 && !p.inCutscene) {
      hurtPlayer(ctx, ROLL_DMG, 'm2:fr_rolllog', { x: -6, y: -6 });
      playSound('thud', 1, -6); shakeScreen(state, 6, 3);
    }
    // (whatever else is in its way: flattened)
    for (const e of hazardVictims(state)) if (boxHits(e, r.x, pose.top, ROLL_LEN, pose.bottom - pose.top)) hazardHit(ctx, e, 60, r.x + ROLL_LEN, 'FLATTENED!');
    // (the hill's foot: it smashes on the fake rock there)
    if (r.x + ROLL_LEN / 2 < X(LOG_PILE.foot)) {
      r.dead = 1; playSound('crash', 0.8, -4); shakeScreen(state, 4, 2);
      for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: r.x + Math.random() * ROLL_LEN, y: r.y + ROLL_R }, vel: { x: (Math.random() - 0.7) * 6, y: -2 - Math.random() * 5 }, life: 40, color: i % 2 ? '#8A5A32' : '#E8C890', size: 3 + Math.random() * 3 });
    }
    return true;
  });
  setHazardZones(state, 'fr-rollers', zones);
};

// ---------------------------------------------------------------------------------------------------------------
// The porcupine's quills (sprayed up off its back when he's close: a fan of them up and out, over anything low; a
// slide's under it), and the snags in the rapids and the river (a swimmer carried into one is cut)

const QUILL_N = 9, QUILL_SPEED = 7.5, QUILL_G = 0.2, QUILL_LIFE = 28, QUILL_DMG = 8;

/** How high he reaches: his whole height stood up, a good deal less ducked or sliding (the engine's box doesn't
 *  shrink; the hazards that a low move gets under go by this). */
export const reachTop = (state: GameState) => {
  const p = state.player;
  return p.isSliding || p.isDucking ? p.pos.y + p.height - 36 : p.pos.y;
};

/** A porcupine lets fly: a fan of quills up off its back, from straight up to low out either side. */
export const sprayQuills = (state: GameState, e: Enemy) => {
  // (off the tips of its quills, over its back: above anything ducked or sliding)
  const w = wildsOf(state), cx = e.pos.x + e.width / 2, top = e.pos.y - 10;
  for (let i = 0; i < QUILL_N; i++) {
    const a = -Math.PI + 0.38 + (i / (QUILL_N - 1)) * (Math.PI - 0.76) + (Math.random() - 0.5) * 0.08;
    w.quills.push({ x: cx + Math.cos(a) * 8, y: top + Math.sin(a) * 4, vx: Math.cos(a) * QUILL_SPEED, vy: Math.sin(a) * QUILL_SPEED, t: 0, from: e });
  }
  playSound('whoosh', 0.7, 14); playSound('crack', 0.4, 12);
};

export const updateQuills = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, w = wildsOf(state);
  if (!w.quills.length) return;
  const top = reachTop(state);
  w.quills = w.quills.filter(q => {
    q.t++; q.vy += QUILL_G; q.x += q.vx; q.y += q.vy;
    if (q.t > QUILL_LIFE) return false;
    // (him: in his reach (low, he's under them))
    if (p.health > 0 && !p.inCutscene && p.invincibilityTimer <= 0 && q.x > p.pos.x && q.x < p.pos.x + p.width && q.y > top && q.y < p.pos.y + p.height) {
      hurtPlayer(ctx, QUILL_DMG, 'm2:fr_needles', { x: Math.sign(q.vx) * 4, y: -3 });
      playSound('dart', 0.7, 6);
      return false;
    }
    // (any other animal it comes down in)
    for (const e of hazardVictims(state)) {
      if (e === q.from || e.kind === 'm2:fr_porcupine' || e.kind === 'm2:fr_hive') continue;
      if (boxHits(e, q.x - 2, q.y - 2, 4, 4)) { hazardHit(ctx, e, 8, q.x - q.vx * 4, 'QUILLED!', { knock: 2 }); return false; }
    }
    return true;
  });
};

const drawQuill = (c: Ctx, x: number, y: number, vx: number, vy: number) => {
  const d = Math.hypot(vx, vy) || 1, ux = vx / d, uy = vy / d;
  c.lineCap = 'round';
  c.strokeStyle = INK; c.lineWidth = 2.6; c.beginPath(); c.moveTo(x - ux * 9, y - uy * 9); c.lineTo(x + ux * 3, y + uy * 3); c.stroke();
  c.strokeStyle = '#3A2814'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x - ux * 8, y - uy * 8); c.lineTo(x - ux * 2, y - uy * 2); c.stroke();
  c.strokeStyle = '#F5F5F4'; c.beginPath(); c.moveTo(x - ux * 2, y - uy * 2); c.lineTo(x + ux * 2.5, y + uy * 2.5); c.stroke();
};

const SNAG_DMG = 9;

/** A swimmer carried into a snag: cut, shoved up off it; and an animal knocked in, the same. */
export const updateSnags = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, w = wildsOf(state);
  w.snagCd = Math.max(0, w.snagCd - 1);
  for (const rx of SNAGS) {
    const x = X(rx), W = WATERS.find(q => x > q.a && x < q.b);
    if (!W) continue;
    const s = GY + W.surface;
    if (w.snagCd === 0 && p.swimming && p.health > 0 && !p.inCutscene && p.pos.x + p.width - 6 > x - 22 && p.pos.x + 6 < x + 22 && p.pos.y + p.height > s - 8 && p.pos.y < s + 70) {
      w.snagCd = 50; p.invincibilityTimer = 0;
      hurtPlayer(ctx, SNAG_DMG, 'm2:fr_snag', { x: p.pos.x + p.width / 2 < x ? -3 : 3, y: -3 });
      playSound('crunch', 0.6, 4); playSound('splash', 0.5, 4);
      for (let i = 0; i < 6; i++) state.particles.push({ pos: { x, y: s + 4 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 26, color: i % 2 ? '#B91C1C' : '#E0F2FE', size: 2 + Math.random() * 2 });
    }
    for (const e of hazardVictims(state)) {
      if (e.kind === 'm2:fr_beaver' || e.kind === 'm2:fr_trout' || e.kind === 'm2:fr_hive') continue;
      if (boxHits(e, x - 20, s - 6, 40, 70) && (e.hitFlash ?? 0) <= 0) hazardHit(ctx, e, 12, x, 'SNAGGED!', { knock: 3 });
    }
  }
};

/** A snag (crude): a dead gray branch, its sharpened forks just poking up out of the water, the rest of it a dark
 *  shape down under the surface. */
const drawSnag = (c: Ctx, x: number, s: number, f: number) => {
  c.globalAlpha = 0.85;
  c.strokeStyle = '#2A2A2E'; c.lineCap = 'round';
  c.lineWidth = 7; c.beginPath(); c.moveTo(x - 14, s + 70); c.lineTo(x - 2, s + 20); c.lineTo(x + 2, s - 6); c.stroke();
  c.lineWidth = 5; c.beginPath(); c.moveTo(x - 2, s + 26); c.lineTo(x + 16, s - 4); c.moveTo(x - 6, s + 40); c.lineTo(x - 18, s - 2); c.stroke();
  c.globalAlpha = 1;
  // (the points out of the water: pale, sharpened, a little foam round each)
  for (const [px, py] of [[x + 2, s - 8], [x + 16, s - 6], [x - 18, s - 4]] as const) {
    c.fillStyle = INK; c.beginPath(); c.moveTo(px - 3, py + 7); c.lineTo(px, py - 3); c.lineTo(px + 3, py + 7); c.closePath(); c.fill();
    c.fillStyle = '#B8B2A6'; c.beginPath(); c.moveTo(px - 2, py + 6); c.lineTo(px, py - 1); c.lineTo(px + 2, py + 6); c.closePath(); c.fill();
    box(c, px - 5 + ((f >> 3) % 3), py + 6, 4, 2, '#FFFFFF');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** Behind him: the pines, the shelves, the traps, the log pile and its rolling logs. */
export const drawHazardsBack = (c: Ctx, state: GameState) => {
  const w = wildsOf(state), f = state.frame;
  for (const pn of w.pines) {
    if (!onScreen(state, pn.x - 110, pn.x + 110)) continue;
    drawPine(c, pn.x, pn.groundY, pn.coneY, pn.state === 'shake' ? 1 : 0, f);
    if (pn.state === 'ready' || pn.state === 'shake') cone(c, pn.x + (pn.state === 'shake' ? Math.sin(f * 1.4) * 2 : 0), pn.coneY);
    for (const dx of [-26, 30]) cone(c, pn.x + dx, pn.coneY - 30 + (dx > 0 ? 10 : 0));
  }
  for (const L of w.loose) if (L.state !== 'fallen' && onScreen(state, L.a, L.b)) drawShelf(c, L.a, L.b, L.y, true, L.state === 'shake' ? 1 : 0, f);
  for (const L of w.loose) if (L.state === 'fallen' && L.drop < 600) { c.globalAlpha = Math.max(0, 1 - L.drop / 600); drawShelf(c, L.a, L.b, L.y + L.drop, true); c.globalAlpha = 1; }
  for (const t of w.traps) if (onScreen(state, t.x - 30, t.x + 30)) drawTrap(c, t, f);
  for (const rx of SNAGS) { const x = X(rx), W = WATERS.find(q => x > q.a && x < q.b); if (W && onScreen(state, x - 30, x + 30)) drawSnag(c, x, GY + W.surface, f); }
  // (the log pile: logs stacked in a pyramid behind a broken rail, at the hill's top)
  const px = X(LOG_PILE.x), py = Y(groundH(px) ?? 0);
  if (onScreen(state, px - 140, px + 140)) {
    const rock = w.pileT > LOG_PILE.every - 36 ? Math.sin(f * 1.1) * 3 : 0;
    for (let row = 0; row < 3; row++) for (let k = 0; k < 3 - row; k++) drawLog(c, px - 60 + k * 30 + row * 15 + (row === 2 ? rock : 0), py - 2 * ROLL_R * (row + 1), ROLL_LEN, row + k + (row === 2 ? rock * 0.2 : 0));
    box(c, px - 90, py - 40, 6, 40, '#6B4423'); box(c, px - 90, py - 40, 60, 5, '#8A5A30');
  }
  for (const r of w.rollers) {
    if (!onScreen(state, r.x, r.x + ROLL_LEN)) continue;
    if (r.dead) { c.globalAlpha = 1 - r.dead / 30; }
    // (lying along the hill, its belly on the slope, turning as it goes)
    const pose = rollerPose(r);
    c.save(); c.translate(pose.cx, pose.cy); c.rotate(pose.ang);
    drawLog(c, -ROLL_LEN / 2, -ROLL_R, ROLL_LEN, r.spin);
    c.restore();
    c.globalAlpha = 1;
  }
};

/** Over him: the trap on his ankle (its jaws over his boot), the cones falling, the swarms. */
export const drawHazardsFront = (c: Ctx, state: GameState) => {
  const w = wildsOf(state), f = state.frame;
  for (const t of w.traps) if (t.state === 'him') drawTrap(c, t, f);
  for (const pn of w.pines) if (pn.state === 'fall') cone(c, pn.x, pn.cy);
  for (const q of w.quills) drawQuill(c, q.x, q.y, q.vx, q.vy);
  for (const s of w.swarms) { c.globalAlpha = Math.max(0, 1 - s.gone / SWARM_LEAVE); drawSwarm(c, s.x, s.y, s.t); c.globalAlpha = 1; }
};
