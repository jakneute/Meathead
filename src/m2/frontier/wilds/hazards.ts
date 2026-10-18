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
// (The water's own deterrent, the leeches, is leeches.ts.)

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import type { Enemy } from '../../../m1/types';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { hazardHit, hazardVictims, boxHits, isSmall, setHazardZones } from '../../hazardHit';
import { ledge } from '../section';
import { onScreen } from '../kit';
import { type Ctx, box, checker, mix, at, poly, still, near, pine, fiberglass, viewOf, INK, FIBER, FIBER_LIP, STEEL, BARK, NEEDLE, PLANK } from './paint';
import { TRAPS, PINES, LOOSE, LOG_PILE, X, Y, groundH } from './layout';
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

/** A trap (peak SNES): the stake and its chain, the two flat springs out either side, the jaws (open: two half rings
 *  lying on the ground seen a little from above, their teeth standing up round the pan; shut: standing up clamped, the
 *  teeth meshed), the steel in steps, rust in its pits, a glint now and then; blood on it while it's got somebody. */
const drawTrap = (c: Ctx, t: Trap, f: number) => {
  const shut = t.state !== 'open';
  c.save(); c.translate(Math.round(t.x), Math.round(t.y)); c.scale(TRAP_S, TRAP_S);
  still(c, `trap-${shut ? 1 : 0}`, 0, 0, -32, -24, 64, 28, g => trapArt(g, shut));
  if (!shut && f % 90 < 6) { box(c, 7, -7, 2, 2, '#FFFFFF'); box(c, 6, -6, 4, 0.6, '#FFFFFF'); }
  if (t.state === 'him' || t.state === 'animal') {
    // (blood on the jaws, running, dripping)
    const d = (f % 20) < 10 ? 1 : 0;
    box(c, -6, -12, 3, 6 + d, '#8E1414'); box(c, 3, -10, 3, 5 + d, '#B91C1C'); box(c, -1, -6, 2, 3, '#B91C1C');
    if (f % 30 < 15) box(c, 4, -4 + (f % 15) * 0.3, 1, 2, '#B91C1C');
  }
  c.restore();
};
/** The trap's art at the origin (its middle, on the ground), base size. */
const trapArt = (g: Ctx, shut: boolean) => {
  const S = near(STEEL), RU = near(['#3A1A0A', '#5A2A10', '#7A3E18', '#9A5A2A']);
  // (the stake, driven in, its ring; the chain to it in links)
  box(g, -28, -8, 4, 9, INK); box(g, -27, -7, 2, 8, S[3]); box(g, -27, -7, 1, 8, S[5]); box(g, -29, -9, 6, 2, S[2]);
  for (let k = 0; k < 6; k++) { const lx = -24 + k * 3, ly = -2 - (k % 2); box(g, lx - 0.5, ly - 0.5, 3, 2.5, INK); box(g, lx, ly, 2, 1.5, k % 2 ? S[4] : S[3]); }
  // (the flat springs out either side: long U-bends of steel, lit along their tops, rusted at the bends)
  for (const sd of [-1, 1]) {
    const x0 = sd * 10, x1 = sd * 26;
    box(g, Math.min(x0, x1) - 1, -4, Math.abs(x1 - x0) + 2, 5, INK);
    box(g, Math.min(x0, x1), -3, Math.abs(x1 - x0), 1.5, S[5]); box(g, Math.min(x0, x1), -1.5, Math.abs(x1 - x0), 1.5, S[2]);
    box(g, x1 - (sd > 0 ? 3 : 0), -4, 3, 4, RU[2]); box(g, x1 - (sd > 0 ? 2 : 1), -3, 1, 1, RU[3]);
  }
  if (!shut) {
    // (open flat: the frame ring, the two jaws lying open as half rings (seen from a little above), the teeth standing
    // up along their inner edges, the pan (the trigger plate) in the middle with its dog)
    g.fillStyle = INK; g.beginPath(); g.ellipse(0, -2, 17, 6, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = S[3]; g.beginPath(); g.ellipse(0, -2, 16, 5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = S[1]; g.beginPath(); g.ellipse(0, -2, 13, 3.4, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = S[5]; g.beginPath(); g.ellipse(-1, -3.6, 14, 2, 0, Math.PI, Math.PI * 2); g.fill();
    // (the teeth: back row darker, front row lit)
    for (let k = 0; k < 7; k++) { const tx = -11 + k * 3.6; g.fillStyle = INK; g.beginPath(); g.moveTo(tx - 1.6, -4); g.lineTo(tx, -8.5); g.lineTo(tx + 1.6, -4); g.closePath(); g.fill(); g.fillStyle = S[4]; g.beginPath(); g.moveTo(tx - 0.9, -4.4); g.lineTo(tx, -7.4); g.lineTo(tx + 0.9, -4.4); g.closePath(); g.fill(); }
    for (let k = 0; k < 7; k++) { const tx = -10 + k * 3.4; g.fillStyle = INK; g.beginPath(); g.moveTo(tx - 1.8, 1); g.lineTo(tx, -4); g.lineTo(tx + 1.8, 1); g.closePath(); g.fill(); g.fillStyle = S[6]; g.beginPath(); g.moveTo(tx - 1, 0.4); g.lineTo(tx, -3); g.lineTo(tx + 0.4, 0.4); g.closePath(); g.fill(); }
    // (the pan: a round plate, rusty, its dog arm across)
    g.fillStyle = INK; g.beginPath(); g.ellipse(0, -2, 5.5, 2.4, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = RU[2]; g.beginPath(); g.ellipse(0, -2, 4.6, 1.8, 0, 0, Math.PI * 2); g.fill();
    box(g, -3, -3, 3, 1, RU[3]); box(g, 2, -3, 6, 1, S[2]);
    // (rust in the pits of the ring)
    for (const rx of [-14, -6, 9, 13]) box(g, rx, 0, 2, 1, RU[1]);
  } else {
    // (shut: the jaws standing up, clamped, the teeth meshed in a zigzag; the frame flat under them)
    box(g, -14, -3, 28, 4, INK); box(g, -13, -2, 26, 2, S[3]); box(g, -13, -2, 26, 1, S[5]);
    g.fillStyle = INK; g.beginPath(); g.moveTo(-11, 0); g.quadraticCurveTo(-12, -20, 0, -21); g.quadraticCurveTo(12, -20, 11, 0); g.closePath(); g.fill();
    g.fillStyle = S[3]; g.beginPath(); g.moveTo(-9.5, -1); g.quadraticCurveTo(-10.5, -18.5, -1, -19.5); g.lineTo(-1, -1); g.closePath(); g.fill();
    g.fillStyle = S[2]; g.beginPath(); g.moveTo(9.5, -1); g.quadraticCurveTo(10.5, -18.5, 1, -19.5); g.lineTo(1, -1); g.closePath(); g.fill();
    box(g, -9, -16, 2, 14, S[5]); box(g, -8, -18, 4, 1, S[6]);
    box(g, 6, -14, 3, 12, S[1]);
    // (the meshed teeth down the middle)
    for (let k = 0; k < 5; k++) { const ty = -17 + k * 3.4; box(g, -2, ty, 2, 2, S[6]); box(g, 0, ty + 1.7, 2, 2, S[4]); box(g, -2, ty + 2, 4, 0.6, INK); }
    box(g, -8, -6, 3, 2, RU[2]); box(g, 5, -9, 2, 3, RU[1]);
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

/** A pine cone: scales in rows (each lit along its lip, dark under), its stem. Stamped. */
const cone = (c: Ctx, x: number, y: number) => still(c, 'cone', x, y, -7, -11, 14, 20, g => {
  const R = near(['#1E0E06', '#3A1E0C', '#5A3216', '#7A4A22', '#9A6432', '#BC8448', '#DCA868']);
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, 0, 5, 7, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = R[2]; g.beginPath(); g.ellipse(0, 0, 4, 6, 0, 0, Math.PI * 2); g.fill();
  for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) { const sx = -3.5 + k * 2.6 + (r % 2) * 1.2, sy = -5 + r * 3; box(g, sx, sy, 2, 2, k === 0 ? R[5] : R[4]); box(g, sx, sy + 2, 2, 1, R[1]); }
  box(g, -1, -9, 2, 3, R[1]); box(g, -1, -9, 1, 3, R[3]);
});

/** A big pine (stepped tiers of boughs over a bare red trunk, cones hanging in it), shaking while it's about to drop.
 *  Painted once for the hour; the shake just jiggles the lot. */
const drawPine = (c: Ctx, x: number, groundY: number, coneY: number, shake: number, f: number) => {
  const sx = shake ? Math.round(Math.sin(f * 1.4) * 2) : 0, up = groundY - coneY;
  still(c, `hpine-${Math.round(up)}`, x + sx, groundY, -96, -up - 140, 192, up + 144, g => {
    const B = near(BARK), foot = -up + 50;
    // (the bare trunk under the crown, down to its roots)
    box(g, -7, foot - 20, 14, up - 30, INK); box(g, -6, foot - 20, 12, up - 30, B[3]); box(g, -6, foot - 20, 4, up - 30, B[4]); box(g, -5, foot - 20, 1, up - 30, B[5]); box(g, 3, foot - 20, 3, up - 30, B[2]);
    for (let y = foot - 16; y < -4; y += 6) box(g, -4 + ((y * 5) & 3) * 2, y, 3, 2, (y >> 1) % 2 ? B[1] : B[5]);
    g.fillStyle = INK; g.beginPath(); g.moveTo(-12, 1); g.quadraticCurveTo(-7, -6, -6, -14); g.lineTo(6, -14); g.quadraticCurveTo(7, -6, 12, 1); g.closePath(); g.fill();
    g.fillStyle = B[3]; g.beginPath(); g.moveTo(-10, 0); g.quadraticCurveTo(-6, -6, -5, -13); g.lineTo(5, -13); g.quadraticCurveTo(6, -6, 10, 0); g.closePath(); g.fill();
    box(g, -8, -4, 3, 4, B[4]);
    // (the crown)
    pine(g, 0, foot, 178, 150, Math.round(up), near(NEEDLE), B);
  });
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
/**
 * A fake-rock shelf (peak SNES): a slab of molded fiberglass, its top going back (banded, when he's looking down on
 * it), its face in molded lumps, the lip lit pale where the paint's worn (standable), an outcrop bulging under it to a
 * point, a steel bracket's plate and bolts showing; the loose ones paler, cracked through to the white gelcoat, a bolt
 * hanging out, shaking before they go. `eye`: the scene's (its top going back).
 */
export const drawShelf = (c: Ctx, a: number, b: number, y: number, loose: boolean, shake = 0, f = 0, eye?: { x: number; y: number }) => {
  const sx = shake ? Math.round(Math.sin(f * 2.1) * 1.5) : 0, w = Math.round(b - a);
  const F = near(loose ? FIBER.map(col => mix(col, '#B8A888', 0.14)) : FIBER);
  if (eye && eye.y < y - 1 && c.globalAlpha === 1) {
    const D = 0.93;
    for (let i = 0; i < 2; i++) { const d0 = 1 - ((1 - D) * i) / 2, d1 = 1 - ((1 - D) * (i + 1)) / 2; poly(c, [at(eye, a + sx + 3, y, d0), at(eye, b + sx - 3, y, d0), at(eye, b + sx - 3, y, d1), at(eye, a + sx + 3, y, d1)], i ? F[4] : F[5]); }
    const [p0x, p0y] = at(eye, a + sx + 3, y, D), [p1x, p1y] = at(eye, b + sx - 3, y, D);
    c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(p0x, p0y); c.lineTo(p1x, p1y); c.stroke();
  }
  still(c, `shelf-${w}-${loose ? 1 : 0}`, a + sx, y, -3, -3, w + 6, 40, g => {
    const L = near(FIBER_LIP), S = near(STEEL);
    // (the outcrop under it: molded rock bulging down to a point, shaded underneath)
    g.fillStyle = INK; g.beginPath(); g.moveTo(4, 15); g.lineTo(w - 4, 15); g.lineTo(w * 0.62, 34); g.lineTo(w * 0.42, 37); g.closePath(); g.fill();
    g.fillStyle = F[2]; g.beginPath(); g.moveTo(7, 15); g.lineTo(w - 7, 15); g.lineTo(w * 0.61, 32); g.lineTo(w * 0.43, 35); g.closePath(); g.fill();
    g.fillStyle = F[3]; g.beginPath(); g.moveTo(7, 15); g.lineTo(w * 0.5, 15); g.lineTo(w * 0.43, 33); g.closePath(); g.fill();
    g.fillStyle = F[1]; g.beginPath(); g.moveTo(w * 0.55, 24); g.lineTo(w - 7, 15); g.lineTo(w * 0.61, 32); g.closePath(); g.fill();
    // (the slab: inked, its face in molded lumps, darker under the lip)
    g.fillStyle = INK; g.beginPath(); g.roundRect(-1, -1, w + 2, 19, 4); g.fill();
    g.save(); g.beginPath(); g.roundRect(0, 0, w, 17, 3); g.clip();
    fiberglass(g, 0, 0, w, 17, F, w + (loose ? 7 : 0), false);
    box(g, 0, 12, w, 5, F[2]); checker(g, 0, 10, w, 2, F[2], 0); box(g, 0, 15, w, 2, F[1]);
    g.restore();
    // (the lip: worn pale where boots go)
    box(g, 2, 0, w - 4, 3, L[2]); box(g, 2, 0, w - 4, 1, L[3]); box(g, 1, 3, w - 2, 1, L[1]);
    for (let x = 8; x < w - 8; x += 13) box(g, x, 1, 4, 1, L[3]);
    // (the bracket's plate and bolts, on its face)
    const px = Math.round(w * 0.5 - 7);
    box(g, px, 6, 14, 7, INK); box(g, px + 1, 7, 12, 5, S[3]); box(g, px + 1, 7, 12, 1, S[5]);
    for (const bx of [px + 2, px + 10]) { box(g, bx, 8, 2, 2, S[1]); box(g, bx, 8, 1, 1, S[6]); }
    if (loose) {
      // (cracked through: the white gelcoat in the cracks, a bolt hanging out on its last thread, chips off the edge)
      for (const [cx, k] of [[0.28, 0], [0.7, 1]] as const) {
        const x = Math.round(w * cx);
        g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 4, 6); g.lineTo(x - 2, 11); g.lineTo(x + 3, 17); if (k) { g.moveTo(x + 4, 6); g.lineTo(x + 10, 9); } g.stroke();
        g.strokeStyle = '#E8E2D2'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 1, 1); g.lineTo(x + 4.6, 6); g.lineTo(x - 1, 11); g.stroke();
      }
      box(g, px + 10, 12, 2, 6, S[4]); box(g, px + 9, 18, 4, 2, S[2]);
      box(g, w - 10, 15, 6, 3, F[1]); box(g, 6, 16, 4, 2, F[1]);
    }
  });
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

/** The swarm: a cloud of fat bees (inked, striped, their wings a blur), a haze in among them, churning. */
const drawSwarm = (c: Ctx, x: number, y: number, t: number) => {
  c.fillStyle = 'rgba(40, 32, 12, 0.12)'; c.beginPath(); c.ellipse(x, y, 30, 20, 0, 0, Math.PI * 2); c.fill();
  for (let i = 0; i < 26; i++) {
    const a = t * (0.2 + (i % 5) * 0.03) + i * 2.3, r = 8 + (i % 4) * 7 + Math.sin(t * 0.1 + i) * 4;
    const bx = Math.round(x + Math.cos(a) * r), by = Math.round(y + Math.sin(a * 1.3) * r * 0.7), dir = Math.sin(a) > 0 ? 1 : -1;
    // (wings: up or down, a pale blur)
    if ((t + i) % 4 < 2) { box(c, bx - 1, by - 4, 3, 2, 'rgba(240, 248, 255, 0.75)'); } else box(c, bx - 2, by - 3, 4, 1, 'rgba(240, 248, 255, 0.55)');
    box(c, bx - 2, by - 2, 6, 4, INK);
    box(c, bx - 1, by - 1, 4, 2, '#F2C21A'); box(c, bx - 1, by - 1, 4, 1, '#FCE47A');
    box(c, bx + (dir > 0 ? 0 : 1), by - 1, 1, 2, INK); box(c, bx + (dir > 0 ? 2 : -1), by - 1, 1, 2, '#1C1917');
    box(c, bx + (dir > 0 ? 3 : -2), by - 1, 1, 1, INK);
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
// slide's under it)

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
  c.strokeStyle = INK; c.lineWidth = 2.8; c.beginPath(); c.moveTo(x - ux * 10, y - uy * 10); c.lineTo(x + ux * 3, y + uy * 3); c.stroke();
  c.strokeStyle = '#2A1C0E'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x - ux * 9, y - uy * 9); c.lineTo(x - ux * 4, y - uy * 4); c.stroke();
  c.strokeStyle = '#D8CCB0'; c.beginPath(); c.moveTo(x - ux * 4, y - uy * 4); c.lineTo(x, y); c.stroke();
  c.strokeStyle = '#FFFFFF'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); c.lineTo(x + ux * 2.5, y + uy * 2.5); c.stroke();
  c.lineCap = 'butt';
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
  const eye = viewOf(state).eye;
  for (const L of w.loose) if (L.state !== 'fallen' && onScreen(state, L.a, L.b)) drawShelf(c, L.a, L.b, L.y, true, L.state === 'shake' ? 1 : 0, f, eye);
  for (const L of w.loose) if (L.state === 'fallen' && L.drop < 600) { c.globalAlpha = Math.max(0, 1 - L.drop / 600); drawShelf(c, L.a, L.b, L.y + L.drop, true); c.globalAlpha = 1; }
  for (const t of w.traps) if (onScreen(state, t.x - 30, t.x + 30)) drawTrap(c, t, f);
  // (the log pile: logs stacked in a pyramid behind a broken rail, at the hill's top)
  const px = X(LOG_PILE.x), py = Y(groundH(px) ?? 0);
  if (onScreen(state, px - 140, px + 140)) {
    const rock = w.pileT > LOG_PILE.every - 36 ? Math.sin(f * 1.1) * 3 : 0;
    for (let row = 0; row < 3; row++) for (let k = 0; k < 3 - row; k++) drawLog(c, px - 60 + k * 30 + row * 15 + (row === 2 ? rock : 0), py - 2 * ROLL_R * (row + 1), ROLL_LEN, row + k + (row === 2 ? rock * 0.2 : 0));
    // (the broken rail that was holding them: a post, a split rail snapped off, its splinters; a chock knocked loose)
    const P = near(PLANK);
    box(c, px - 91, py - 44, 8, 44, INK); box(c, px - 90, py - 43, 6, 43, P[3]); box(c, px - 90, py - 43, 2, 43, P[5]); box(c, px - 85, py - 43, 1, 43, P[2]);
    box(c, px - 91, py - 41, 54, 7, INK); box(c, px - 90, py - 40, 52, 5, P[3]); box(c, px - 90, py - 40, 52, 1, P[5]); box(c, px - 90, py - 36, 52, 1, P[1]);
    for (let k = 0; k < 4; k++) { box(c, px - 38 + k * 2, py - 41 + (k % 2) * 3, 3, 2, P[5 - (k % 2)]); }
    c.fillStyle = INK; c.beginPath(); c.moveTo(px - 70, py); c.lineTo(px - 60, py - 9); c.lineTo(px - 52, py); c.closePath(); c.fill();
    c.fillStyle = P[4]; c.beginPath(); c.moveTo(px - 68, py - 1); c.lineTo(px - 60, py - 7); c.lineTo(px - 54, py - 1); c.closePath(); c.fill();
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
