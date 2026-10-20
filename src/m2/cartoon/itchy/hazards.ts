// PUNCHY & KICKY's hazards: the Looney Tunes violence, built into the area as park machinery (the KILL-O-RAMA's show
// runs on a loop) and as the cast's props. Every one has its tell; every one hurts the cast as well as him (they keep
// out of the active ones' way, hazard zones; the rakes and the bear traps they walk right into, as cartoon characters
// do); every one really kills him (its own hurt lines and death screen: lines.ts).
//
//   ANVILS        out of the GENERIC-CO gantry's trapdoors on a cycle: the hatch rattles and a shadow grows on the
//                 path (the tell), then the whistle as it drops; it sits there a while (a step: lit along its top), and
//                 the winch hauls it back up. The host's: the shadow follows him, stops, and one comes down out of the
//                 sky; those stay where they land.
//   GIANT HAMMERS the KILL-O-RAMA's animatronic Punchy and Kicky: the mallet hauled back up over the shoulder with a
//                 ratchet's creak, the eyes lit red (the tell), then down across the path; the head lies there a moment
//                 (a step), then goes back up.
//   RAKES         lying tines up in the grass (the tell is the rake): tread on the tines and the handle comes up into
//                 the face. Jump them. The cast tread on them.
//   BEAR TRAPS    open on the floor: tread in one and it snaps shut on the leg and holds a moment. Sprung, it stays shut
//                 (the run's: kept). The cast tread in them.
//   GENERIC-CO    a crate that rattles (the tell) and punches a boxing glove out on a spring at whoever's in front of
//                 it, at chest height: duck it, or jump it.
//   SAFE, PIANO   hung on ropes over the path: under one, the rope frays (strands snapping, it jiggles, its shadow
//                 grows: the tell) and down it comes; it stays down for good (the run's), a step (the piano's wreck is
//                 cover from the low cannonballs).
//   CANNONS       the circus cannon at the end of the row: the barrel dips (a low ball: jump it) or rises (a high one:
//                 duck it) and the touch hole fizzes (the tell), then BOOM. The canyon's on a lift behind the far rim:
//                 it rises to his height, fizzes, fires across.
//   FUSES         a giant animatronic Kicky strikes a giant match and lights a long fuse: the spark crawls along it to
//                 the TNT (the tell's the whole way), and it goes up; a new pile rises out of the trapdoor. The set's
//                 runs along the fly rail and down a line to the far tower's foot: it goes up and kicks the tower.
//   PORTABLE HOLES laid by the stagehands (flung down: it spreads out flat), and the set's floor of them: in, and he
//                 drops out of one up in the air over where he last stood safe, on his head.
//   THE CANYON    bottomless: in, and he's back where he last stood safe, hurt (the cast go down for good: a puff).
//   What the cast throw (kinds.ts): cleavers (spinning, then stuck in the floor), dynamite (lit before it's thrown: the
//   fuse burning down, then it goes up), folded portable holes.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Block, Enemy } from '../../../m1/types';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { floorTopAt } from '../../../m1/game/core/terrain';
import { hazardVictims, hazardHit, hazardKill, boxHits, setHazardZones, type Zone } from '../../hazardHit';
import { envSound } from '../../bossQuiet';
import { teleport } from '../section';
import { onScreen } from '../kit';
import { onTower } from '../sway';
import { GY } from '../geometry';
import { itchyOf, makeCannon, fire, isFired, keepHostAnvil, firedList, type Anvil, type Ball, type Cannon, type Fuse, type Hole, type Throw } from './state';
import {
  DOORS_AT, GANTRY, HAMMERS, RAKES, TRAPS, CRATES, GLOVE_CRATES, SAFE, PIANO, CANNON, LIFT_CANNON, FUSES, PITS, CANYON, HOLES,
  SET_TOWER0, KILLORAMA, X, Y,
} from './layout';

// ---------------------------------------------------------------------------------------------------------------
// Shared bits

const alive = (state: GameState) => state.player.health > 0 && !state.player.inCutscene;
const pmid = (state: GameState) => state.player.pos.x + state.player.width / 2;
const pfeet = (state: GameState) => state.player.pos.y + state.player.height;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
/** His box (ducked: down low, the way the high things go over him). */
const pbox = (state: GameState) => {
  const p = state.player;
  return p.isDucking && p.isGrounded ? { x: p.pos.x + 2, y: p.pos.y + p.height - 26, w: p.width - 4, h: 26 } : { x: p.pos.x, y: p.pos.y, w: p.width, h: p.height };
};
const hitsHim = (state: GameState, x: number, y: number, w: number, h: number) => { const b = pbox(state); return b.x < x + w && b.x + b.w > x && b.y < y + h && b.y + b.h > y; };
/** A hazard gets him (box in world space). */
const hurts = (ctx: FrameContext, x: number, y: number, w: number, h: number, dmg: number, source: string, knock: { x: number; y: number }) => {
  const { state } = ctx;
  if (alive(state) && state.player.invincibilityTimer <= 0 && hitsHim(state, x, y, w, h)) { hurtPlayer(ctx, dmg, source, knock); return true; }
  return false;
};
/** A hazard gets the cast in its box (each no more than once a second): `kill` a crusher. */
const hitsCast = (ctx: FrameContext, x: number, y: number, w: number, h: number, dmg: number, fromX: number, call: string, opts: { kill?: boolean; knock?: number; flyers?: boolean } = {}) => {
  const { state } = ctx, k = itchyOf(state);
  for (const e of hazardVictims(state, { flyers: opts.flyers })) {
    if (!boxHits(e, x, y, w, h) || state.frame - (k.hazHit.get(e) ?? -999) < 60) continue;
    k.hazHit.set(e, state.frame);
    hazardHit(ctx, e, dmg, fromX, call, { knock: opts.knock ?? 11, kill: opts.kill });
  }
};
const dust = (state: GameState, x: number, y: number, n = 8, col = '#E7D3A8', spread = 40) => { for (let i = 0; i < n; i++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * spread, y: y - 3 }, vel: { x: (Math.random() - 0.5) * 5, y: -0.5 - Math.random() * 2.4 }, life: 28, color: col, size: 4 + Math.random() * 3 }); };
const sparks = (state: GameState, x: number, y: number, n = 6) => { for (let i = 0; i < n; i++) state.particles.push({ pos: { x, y }, vel: { x: (Math.random() - 0.5) * 4, y: -Math.random() * 3 }, life: 14, color: i % 2 ? '#FDE047' : '#FFFFFF', size: 2, grav: 0.2 } as typeof state.particles[number]); };
/** Stars round a head (a cartoon bonk). */
export const bonkStars = (state: GameState, x: number, y: number) => { for (let i = 0; i < 6; i++) state.particles.push({ pos: { x, y }, vel: { x: Math.cos(i) * 2.2, y: Math.sin(i) * 1.2 - 1 }, life: 26, color: i % 2 ? '#FDE047' : '#FFFFFF', size: 3 }); };

/** Blocks the hazards put down and take away (an anvil sat on the path, a hammer's head, a wreck). */
const addBlock = (state: GameState, x: number, y: number, w: number, h: number, tag: string): Block => {
  const b = { x, y, w, h, type: 'wall', hidden: true, tag } as Block;
  state.blocks.push(b);
  return b;
};
const dropBlock = (state: GameState, b?: Block) => { if (!b) return; const i = state.blocks.indexOf(b); if (i >= 0) state.blocks.splice(i, 1); };
/** Is he in the way of a block about to go down (it waits till he's clear: never shut in a wall)? */
const inWay = (state: GameState, x: number, y: number, w: number, h: number) => { const p = state.player; return p.pos.x < x + w && p.pos.x + p.width > x && p.pos.y < y + h && p.pos.y + p.height > y; };
/** The ground under x (not a tower's lid: the falling things go through those), or null over a pit. */
const groundUnder = (state: GameState, x: number, fromY: number) => floorTopAt(state.blocks.filter(b => !(b.tag ?? '').startsWith('ct-tower-')), x, fromY, 0);
const inPit = (x: number) => PITS.some(([a, b]) => x > X(a) && x < X(b));

// ---------------------------------------------------------------------------------------------------------------
// Building them

export const AW = 56, AH = 34;
/** The gantry's cycle: the hatch rattles (TELL), it drops (FALL), sits on the path (DOWN), is winched up (LIFT). */
export const A_TELL = 30, A_FALL = 26, A_DOWN = 60, A_LIFT = 30, A_CYCLE = 170;
/** The hammers' cycle. */
export const H_IDLE = 20, H_WIND = 40, H_SLAM = 10, H_DOWN = 40, H_LIFT = 40, H_CYCLE = H_IDLE + H_WIND + H_SLAM + H_DOWN + H_LIFT;
/** The shoulder's height; the mallet's head (a barrel: how wide across, how long, end to striking face). */
export const H_PIVOT = 170, H_HEAD_W = 74, H_HEAD_H = 64;
export const RAKE_LEN = 74;
export const GLOVE_REACH = 150;
export const BALL_R = 13;

export const makeHazards = (state: GameState) => {
  const k = itchyOf(state);
  k.anvils = DOORS_AT.map(([x, off]) => ({ x: X(x), y: Y(GANTRY.h), vy: 0, phase: 'wait', t: 0, land: GY, door: off }) as Anvil);
  // (the host's anvils that came down and stayed: where the run left them)
  for (const s of firedList(state)) if (s.startsWith('a')) {
    const x = +s.slice(1), land = groundUnder(state, x, Y(400));
    if (land === null) continue;
    const a: Anvil = { x, y: land, vy: 0, phase: 'down', t: 0, land, host: true };
    a.b = addBlock(state, x - AW / 2, land - AH, AW, AH, 'ct-anvil');
    k.anvils.push(a);
  }
  k.hammers = HAMMERS.map(d => ({ d, ang: Math.PI + 0.35, phase: 'idle', t: 0, on: false }));
  k.rakes = RAKES.map(([x, dir]) => ({ x: X(x), dir, up: 0, who: null }));
  k.traps = TRAPS.map((x, i) => ({ x: X(x), sprung: isFired(state, `trap${i}`), t: 99 }));
  k.gloves = GLOVE_CRATES.map(i => ({ i, dir: -1, ext: 0, phase: 'shut', t: 0, cool: 0 }));
  k.drops = [
    { id: 'safe', x: X(SAFE.x), w: SAFE.w, h: SAFE.h, y: Y(SAFE.hang), vy: 0, phase: 'hang', t: 0 },
    { id: 'piano', x: X(PIANO.x), w: PIANO.w, h: PIANO.h, y: Y(PIANO.hang), vy: 0, phase: 'hang', t: 0 },
  ];
  for (const d of k.drops) if (isFired(state, d.id)) { d.phase = 'down'; d.y = GY; addBlock(state, d.x - d.w / 2, GY - d.h, d.w, d.h, `ct-${d.id}`); }
  k.cannon = makeCannon(X(CANNON.x), X(CANNON.muzzle), CANNON.range);
  k.lift = makeCannon(X(LIFT_CANNON.x), X(LIFT_CANNON.muzzle), LIFT_CANNON.range);
  k.lift.lift = 120;
  k.fuses = FUSES.map(d => {
    let len = 0;
    for (let i = 1; i < d.pts.length; i++) len += Math.hypot(d.pts[i][0] - d.pts[i - 1][0], d.pts[i][1] - d.pts[i - 1][1]);
    return { d, phase: 'wait', t: 0, s: 0, len } as Fuse;
  });
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame

/** Where a fuse's spark is, `s` px along it (world). */
export const fusePoint = (f: Fuse, s: number) => {
  const p = f.d.pts;
  let left = s;
  for (let i = 1; i < p.length; i++) {
    const seg = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
    if (left <= seg || i === p.length - 1) { const u = seg ? clamp(left / seg, 0, 1) : 1; return { x: X(p[i - 1][0] + (p[i][0] - p[i - 1][0]) * u), y: Y(p[i - 1][1] + (p[i][1] - p[i - 1][1]) * u) }; }
    left -= seg;
  }
  return { x: X(p[p.length - 1][0]), y: Y(p[p.length - 1][1]) };
};

/** A blast: him, the cast, the bits. */
export const blast = (ctx: FrameContext, x: number, y: number, r: number, source: string, dmg: number) => {
  const { state } = ctx, k = itchyOf(state), p = state.player;
  k.blasts.push({ x, y, r, t: 0 });
  envSound(state, x, 'boom', 1, -4); envSound(state, x, 'crash', 0.5, -8);
  if (onScreen(state, x - r, x + r)) shakeScreen(state, 12, 6);
  for (let i = 0; i < 26; i++) { const a = Math.random() * Math.PI * 2, s = 2 + Math.random() * 6; state.particles.push({ pos: { x, y }, vel: { x: Math.cos(a) * s, y: Math.sin(a) * s - 2 }, life: 24 + Math.random() * 20, color: ['#FDE047', '#F97316', '#DC2626', '#FFFFFF'][i % 4], size: 4 + Math.random() * 4 }); }
  for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * r, y: y - Math.random() * r * 0.6 }, vel: { x: (Math.random() - 0.5) * 1.5, y: -0.6 - Math.random() }, life: 50, color: 'rgba(55,48,40,0.55)', size: 14 + Math.random() * 12 });
  // (him: anywhere in it)
  const b = pbox(state), cx = clamp(x, b.x, b.x + b.w), cy = clamp(y, b.y, b.y + b.h);
  if (alive(state) && p.invincibilityTimer <= 0 && Math.hypot(cx - x, cy - y) < r) hurtPlayer(ctx, dmg, source, { x: (pmid(state) < x ? -1 : 1) * 9, y: -9 });
  // (the cast in it: blown to bits)
  for (const e of hazardVictims(state)) {
    const ex = clamp(x, e.pos.x, e.pos.x + e.width), ey = clamp(y, e.pos.y, e.pos.y + e.height);
    if (Math.hypot(ex - x, ey - y) < r) hazardKill(ctx, e, x, 'KA-BOOM!', { fling: { x: (e.pos.x + e.width / 2 < x ? -1 : 1) * 9, y: -14 }, sound: 'boom', color: '#FDBA74' });
  }
};

const updateAnvils = (ctx: FrameContext, zones: Zone[]) => {
  const { state } = ctx, k = itchyOf(state), px = pmid(state);
  // (the gantry's clock: runs while he's about it)
  const gantryOn = alive(state) && px > X(GANTRY.a) - 560 && px < X(GANTRY.b) + 420;
  for (const a of k.anvils) {
    if (a.host) { updateHostAnvil(ctx, a, zones); continue; }
    if (a.door === undefined) continue;
    // (a trapdoor's: through its cycle while he's about; away, it finishes what it's doing and waits. Coming into
    // range, each waits out its offset first: the wave rolls left to right)
    if (gantryOn || a.phase !== 'wait') a.t++;
    else a.t = 0;
    const off = (a.door ?? 0) + 24, c = a.t < off ? -1 : (a.t - off) % A_CYCLE;
    a.cyc = c;
    a.phase = c < 0 ? 'wait' : c < A_TELL ? 'tell' : c < A_TELL + A_FALL ? 'fall' : c < A_TELL + A_FALL + A_DOWN ? 'down' : c < A_TELL + A_FALL + A_DOWN + A_LIFT ? 'lift' : 'wait';
    const top = Y(GANTRY.h);
    if (a.phase === 'tell') {
      a.y = top; a.vy = 0;
      if (c % 6 === 0) envSound(state, a.x, 'click', 0.3, 6);
      zones.push({ x0: a.x - AW, x1: a.x + AW, y0: top, y1: GY });
    } else if (a.phase === 'fall') {
      const u = c - A_TELL + 1;
      a.y = top + (GY - top) * (u / A_FALL) ** 2;
      if (u === 1) envSound(state, a.x, 'whoosh', 0.35, 8);
      if (u % 3 === 0) envSound(state, a.x, 'ding', 0.16, 26 - u * 0.8);
      hurts(ctx, a.x - AW / 2, a.y - AH, AW, AH, 16, 'm2:ct_anvil', { x: (px < a.x ? -1 : 1) * 4, y: -3 });
      hitsCast(ctx, a.x - AW / 2, a.y - AH, AW, AH, 999, a.x, 'ANVILED!', { kill: true });
      zones.push({ x0: a.x - AW, x1: a.x + AW, y0: top, y1: GY });
      if (u === A_FALL) landAnvil(ctx, a);
    } else if (a.phase === 'down') {
      a.y = GY;
      if (!a.b && !inWay(state, a.x - AW / 2, GY - AH, AW, AH)) a.b = addBlock(state, a.x - AW / 2, GY - AH, AW, AH, 'ct-anvil');
    } else if (a.phase === 'lift') {
      // (the winch's hook down, and it's hauled back up into the gantry)
      if (a.b) { dropBlock(state, a.b); a.b = undefined; }
      const u = (c - A_TELL - A_FALL - A_DOWN) / A_LIFT;
      a.y = GY - (GY - top) * u * u;
      if (c % 5 === 0) envSound(state, a.x, 'click', 0.2, -2);
    } else { a.y = top; if (a.b) { dropBlock(state, a.b); a.b = undefined; } }
  }
  k.anvils = k.anvils.filter(a => a.phase !== 'gone');
};
const landAnvil = (ctx: FrameContext, a: Anvil) => {
  const { state } = ctx;
  envSound(state, a.x, 'slam', 0.9, -10); envSound(state, a.x, 'clang', 0.6, -12);
  if (onScreen(state, a.x - 60, a.x + 60)) shakeScreen(state, 7, 4);
  dust(state, a.x, a.land ?? GY, 12);
  hurts(ctx, a.x - AW / 2 - 4, (a.land ?? GY) - AH - 6, AW + 8, AH + 6, 16, 'm2:ct_anvil', { x: (pmid(state) < a.x ? -1 : 1) * 6, y: -4 });
};
/** The host's: following him (the shadow under him) till it locks on, then out of the sky; where it lands, it stays. */
export const callAnvil = (state: GameState) => {
  const k = itchyOf(state);
  if (k.anvils.some(a => a.host && a.phase !== 'down')) return false;
  k.anvils.push({ x: pmid(state), y: GY - 760, vy: 0, phase: 'tell', t: 0, land: null, host: true, lock: 40 });
  return true;
};
const updateHostAnvil = (ctx: FrameContext, a: Anvil, zones: Zone[]) => {
  const { state } = ctx;
  a.t++;
  if (a.phase === 'tell') {
    // (the shadow follows him a beat, then stops where he was: then it comes)
    if (a.t < (a.lock ?? 40)) a.x += clamp(pmid(state) - a.x, -6, 6);
    a.land = inPit(a.x) ? null : groundUnder(state, a.x, Y(420));
    if (a.t === 1) envSound(state, a.x, 'whoosh', 0.3, 14);
    if (a.t >= (a.lock ?? 40) + 14) { a.phase = 'fall'; a.t = 0; a.vy = 6; }
    zones.push({ x0: a.x - AW, x1: a.x + AW, y0: GY - 800, y1: GY });
  } else if (a.phase === 'fall') {
    a.vy += 1.25; a.y += a.vy;
    if (a.t % 3 === 0) envSound(state, a.x, 'ding', 0.16, 26 - a.t * 0.8);
    hurts(ctx, a.x - AW / 2, a.y - AH, AW, AH, 16, 'm2:ct_anvil', { x: (pmid(state) < a.x ? -1 : 1) * 4, y: -3 });
    hitsCast(ctx, a.x - AW / 2, a.y - AH, AW, AH, 999, a.x, 'ANVILED!', { kill: true });
    zones.push({ x0: a.x - AW, x1: a.x + AW, y0: GY - 800, y1: GY });
    if (a.land !== null && a.y >= a.land) {
      a.y = a.land; a.phase = 'down'; a.t = 0;
      landAnvil(ctx, a);
      // (it stays (the run's): the oldest of the lot goes, if there are too many)
      const old = keepHostAnvil(state, a.x);
      if (old !== null) { const o = itchyOf(state).anvils.find(q => q.host && q.phase === 'down' && Math.round(q.x) === old && q !== a); if (o) { dropBlock(state, o.b); o.phase = 'gone'; dust(state, o.x, o.y, 8, '#FFFFFF'); playSound('poof', 0.4, 4); } }
    } else if (a.land === null && a.y > GY + 500) a.phase = 'gone';
  } else if (a.phase === 'down') {
    if (!a.b && a.land !== null && !inWay(state, a.x - AW / 2, a.land - AH, AW, AH)) a.b = addBlock(state, a.x - AW / 2, a.land - AH, AW, AH, 'ct-anvil');
  }
};

/** A hammer's head (its middle) at an angle (0 straight down from the shoulder, + out over the path). */
export const hammerHead = (h: { d: { x: number; side: 1 | -1; hit: number } }, ang: number) => {
  const px = X(h.d.x), py = Y(H_PIVOT), dx = Math.abs(X(h.d.hit) - px), dy = (GY - H_HEAD_H / 2) - py, L = Math.hypot(dx, dy);
  return { x: px + Math.sin(ang) * L * h.d.side, y: py + Math.cos(ang) * L, L, down: Math.atan2(dx, dy) };
};
const H_UP = Math.PI + 0.35, H_BACK = Math.PI + 0.75;
const ease = (u: number) => u * u * (3 - 2 * u);
const updateHammers = (ctx: FrameContext, zones: Zone[]) => {
  const { state } = ctx, k = itchyOf(state), px = pmid(state);
  // (the KILL-O-RAMA's show: one clock for all of them while he's about it, so the pair keep their turns)
  const near = alive(state) && px > X(KILLORAMA.a) - 560 && px < X(KILLORAMA.b) + 420;
  for (const h of k.hammers) {
    if (near || h.phase !== 'idle') h.t++;
    if (!near && h.phase === 'idle') { h.t = 0; h.ang = H_UP + Math.sin(state.frame * 0.03 + h.d.x) * 0.04; continue; }
    // (each waits out its offset at first: the pair take turns)
    const c = h.t < h.d.phase ? 0 : (h.t - h.d.phase) % H_CYCLE, down = hammerHead(h, 0).down;
    const was = h.phase;
    h.phase = c < H_IDLE ? 'idle' : c < H_IDLE + H_WIND ? 'wind' : c < H_IDLE + H_WIND + H_SLAM ? 'slam' : c < H_IDLE + H_WIND + H_SLAM + H_DOWN ? 'down' : 'lift';
    const head = () => hammerHead(h, h.ang);
    const hx = X(h.d.hit);
    if (h.phase === 'idle') h.ang = H_UP + Math.sin(state.frame * 0.03 + h.d.x) * 0.04;
    else if (h.phase === 'wind') {
      // (hauled back over the shoulder, a ratchet's creak at each notch: the tell)
      const u = (c - H_IDLE) / H_WIND;
      h.ang = H_UP + (H_BACK - H_UP) * ease(u);
      if ((c - H_IDLE) % 8 === 0) envSound(state, hx, 'click', 0.45, -6 + u * 8);
      if (c - H_IDLE === 2) envSound(state, hx, 'rumble', 0.3, 6);
      zones.push({ x0: hx - H_HEAD_W, x1: hx + H_HEAD_W, y0: Y(200), y1: GY });
    } else if (h.phase === 'slam') {
      // (over the top and down, faster and faster)
      const u = (c - H_IDLE - H_WIND + 1) / H_SLAM;
      h.ang = H_BACK + (down - H_BACK) * u * u;
      if (c - H_IDLE - H_WIND === 0) envSound(state, hx, 'whoosh', 0.8, -8);
      const hd = head();
      if (hd.y > Y(220)) {
        hurts(ctx, hd.x - H_HEAD_W / 2, hd.y - H_HEAD_H / 2, H_HEAD_W, H_HEAD_H, 18, 'm2:ct_hammer', { x: h.d.side * 8, y: -5 });
        hitsCast(ctx, hd.x - H_HEAD_W / 2, hd.y - H_HEAD_H / 2, H_HEAD_W, H_HEAD_H, 999, X(h.d.x), 'HAMMERED!', { kill: true });
      }
      zones.push({ x0: hx - H_HEAD_W, x1: hx + H_HEAD_W, y0: Y(200), y1: GY });
    } else if (h.phase === 'down') {
      h.ang = down;
      if (was === 'slam') {
        envSound(state, hx, 'slam', 1, -14); envSound(state, hx, 'bonk', 0.7, -10);
        if (onScreen(state, hx - 100, hx + 100)) shakeScreen(state, 10, 5);
        dust(state, hx, GY, 16, '#E7D3A8', 90);
      }
      if (!h.b && !inWay(state, hx - H_HEAD_W / 2, GY - H_HEAD_H, H_HEAD_W, H_HEAD_H)) h.b = addBlock(state, hx - H_HEAD_W / 2, GY - H_HEAD_H, H_HEAD_W, H_HEAD_H, 'ct-hammer');
    } else {
      if (h.b) { dropBlock(state, h.b); h.b = undefined; }
      const u = (c - H_IDLE - H_WIND - H_SLAM - H_DOWN) / H_LIFT;
      h.ang = down + (H_UP - down) * ease(u);
      if ((c - H_IDLE - H_WIND - H_SLAM - H_DOWN) % 10 === 0) envSound(state, hx, 'click', 0.25, 4);
    }
    if (h.phase !== 'down' && h.b) { dropBlock(state, h.b); h.b = undefined; }
    h.on = near;
  }
};

const onGround = (feet: number, y = GY) => Math.abs(feet - y) < 5;
const updateRakes = (ctx: FrameContext) => {
  const { state } = ctx, k = itchyOf(state), p = state.player, px = pmid(state);
  for (const r of k.rakes) {
    if (r.up > 0) { r.up--; if (r.up === 0 && r.who !== 'him') r.who = null; }
    // (him: off the tines lets it be trodden on again)
    const onTines = Math.abs(px - r.x) < 13 && p.isGrounded && onGround(pfeet(state));
    if (r.who === 'him' && !onTines && r.up === 0) r.who = null;
    if (r.up === 0 && r.who === null && onTines && alive(state)) {
      r.up = 44; r.who = 'him';
      envSound(state, r.x, 'whoosh', 0.5, 10); playSound('bonk', 0.9, -2);
      bonkStars(state, px, p.pos.y + 6);
      if (p.invincibilityTimer <= 0) hurtPlayer(ctx, 8, 'm2:ct_rake', { x: (p.vel.x > 0 ? -1 : p.vel.x < 0 ? 1 : -r.dir) * 5, y: -4 });
      continue;
    }
    if (r.up > 0) continue;
    for (const e of hazardVictims(state)) {
      const ex = e.pos.x + e.width / 2;
      if (Math.abs(ex - r.x) > 12 || !onGround(e.pos.y + e.height) || e.isBlownAway) continue;
      r.up = 44; r.who = e;
      envSound(state, r.x, 'whoosh', 0.45, 10); envSound(state, r.x, 'bonk', 0.8, 0);
      bonkStars(state, ex, e.pos.y + 6);
      if (!hazardHit(ctx, e, 30, r.x + r.dir * 30, 'RAKED!', { knock: 4 })) { e.pauseTimer = Math.max(e.pauseTimer ?? 0, 46); e.vel.x = 0; }
      break;
    }
  }
};

const updateTraps = (ctx: FrameContext) => {
  const { state } = ctx, k = itchyOf(state), p = state.player, px = pmid(state);
  k.traps.forEach((tr, i) => {
    tr.t++;
    if (tr.sprung) return;
    if (alive(state) && p.isGrounded && p.vel.y >= 0 && onGround(pfeet(state)) && Math.abs(px - tr.x) < 16) {
      tr.sprung = true; tr.t = 0; fire(state, `trap${i}`);
      envSound(state, tr.x, 'clang', 1, 4); playSound('crunch', 0.7, 6);
      sparks(state, tr.x, GY - 6);
      p.pos.x = tr.x - p.width / 2; p.vel.x = 0;
      k.trapped = 54;
      if (p.invincibilityTimer <= 0) hurtPlayer(ctx, 10, 'm2:ct_beartrap', { x: 0, y: 0 }, 2);
      return;
    }
    for (const e of hazardVictims(state)) {
      const ex = e.pos.x + e.width / 2;
      if (Math.abs(ex - tr.x) > 14 || !onGround(e.pos.y + e.height) || e.isBlownAway) continue;
      tr.sprung = true; tr.t = 0; fire(state, `trap${i}`);
      envSound(state, tr.x, 'clang', 0.9, 4); envSound(state, tr.x, 'crunch', 0.6, 6);
      if (!hazardHit(ctx, e, 45, tr.x, 'SNAPPED!', { knock: 0 })) { e.pauseTimer = Math.max(e.pauseTimer ?? 0, 80); e.vel.x = 0; e.pos.x = tr.x - e.width / 2; }
      break;
    }
  });
};

/** A crate's glove: where its fist is (world), and the spring's root. At chest height: a man ducked goes under it. */
export const glovePos = (g: { i: number; dir: number; ext: number }) => {
  const [a, b, h] = CRATES[g.i], root = g.dir < 0 ? X(a) : X(b);
  return { root, x: root + g.dir * (14 + g.ext * GLOVE_REACH), y: Y(h) + 18 };
};
const updateGloves = (ctx: FrameContext, zones: Zone[]) => {
  const { state } = ctx, k = itchyOf(state), px = pmid(state), feet = pfeet(state);
  for (const g of k.gloves) {
    g.t++; if (g.cool > 0) g.cool--;
    const [a, b, h] = CRATES[g.i], cy = Y(h) + 18;
    const side = px < X(a) ? -1 : px > X(b) ? 1 : 0;
    const dist = side < 0 ? X(a) - px : px - X(b);
    // (in front of it at the glove's height, near enough)
    const inFront = alive(state) && side !== 0 && dist < GLOVE_REACH + 30 && feet > cy - 8 && feet < Y(h) + h + 70;
    switch (g.phase) {
      case 'shut':
        g.ext = 0;
        if (inFront && g.cool <= 0) { g.phase = 'rattle'; g.t = 0; g.dir = side as -1 | 1; }
        break;
      case 'rattle':
        // (the crate shakes on its boards, the spring winding up inside: the tell)
        if (g.t % 5 === 0) envSound(state, (X(a) + X(b)) / 2, 'click', 0.4, 10 + g.t / 3);
        if (g.t >= 26) { g.phase = 'out'; g.t = 0; envSound(state, (X(a) + X(b)) / 2, 'boing', 0.8, 2); }
        break;
      case 'out':
        g.ext = Math.min(1, g.t / 5);
        if (g.ext >= 1) { g.phase = 'hold'; g.t = 0; }
        break;
      case 'hold':
        if (g.t >= 18) { g.phase = 'back'; g.t = 0; }
        break;
      case 'back':
        g.ext = Math.max(0, 1 - g.t / 18);
        if (g.ext <= 0) { g.phase = 'shut'; g.t = 0; g.cool = 50; }
        break;
    }
    if (g.phase === 'out' || g.phase === 'hold') {
      const gp = glovePos(g), gx = Math.min(gp.root, gp.x), gw = Math.abs(gp.x - gp.root) + 14;
      hurts(ctx, gp.x - 14, cy - 14, 28, 28, 11, 'm2:ct_glove', { x: g.dir * 12, y: -6 });
      hitsCast(ctx, gx, cy - 14, gw, 28, 40, gp.root, 'PUNCHED OUT!', { knock: 14 });
    }
    if (g.phase !== 'shut') { const r = g.dir < 0 ? X(a) : X(b); zones.push({ x0: Math.min(r, r + g.dir * (GLOVE_REACH + 30)), x1: Math.max(r, r + g.dir * (GLOVE_REACH + 30)), y0: cy - 30, y1: cy + 30 }); }
  }
};

const updateDrops = (ctx: FrameContext, zones: Zone[]) => {
  const { state } = ctx, k = itchyOf(state), px = pmid(state), feet = pfeet(state);
  for (const d of k.drops) {
    d.t++;
    if (d.phase === 'hang') {
      // (he's coming at it along the path: it goes as he gets there (keep going and it misses; stop to look and it doesn't))
      if (alive(state) && Math.abs(px - d.x) < d.w / 2 + 110 && feet > Y(110)) { d.phase = 'fray'; d.t = 0; onDrop?.(state, d.id); }
    } else if (d.phase === 'fray') {
      // (the rope's strands snapping, it jiggling on what's left, its shadow on the path: the tell)
      if (d.t === 1 || d.t === 12 || d.t === 22) envSound(state, d.x, 'crack', 0.6, 8 + d.t / 4);
      if (d.t % 4 === 0) envSound(state, d.x, 'click', 0.15, 12);
      zones.push({ x0: d.x - d.w, x1: d.x + d.w, y0: d.y, y1: GY });
      if (d.t >= 30) { d.phase = 'fall'; d.t = 0; d.vy = 4; envSound(state, d.x, 'whoosh', 0.6, -2); }
    } else if (d.phase === 'fall') {
      d.vy += 1.2; d.y = Math.min(GY, d.y + d.vy);
      const src = d.id === 'safe' ? 'm2:ct_safe' : 'm2:ct_piano';
      hurts(ctx, d.x - d.w / 2, d.y - d.h - 20, d.w, d.h + 20, 18, src, { x: (px < d.x ? -1 : 1) * 7, y: -4 });
      hitsCast(ctx, d.x - d.w / 2, d.y - d.h - 20, d.w, d.h + 20, 999, d.x, d.id === 'safe' ? 'SAFE!' : "PIANO'D!", { kill: true });
      zones.push({ x0: d.x - d.w, x1: d.x + d.w, y0: Y(PIANO.hang + 40), y1: GY });
      if (d.y >= GY) {
        d.phase = 'down'; d.t = 0; fire(state, d.id);
        if (onScreen(state, d.x - 100, d.x + 100)) shakeScreen(state, 10, 5);
        dust(state, d.x, GY, 16, '#E7D3A8', d.w);
        if (d.id === 'piano') {
          // (the chord it makes going to pieces, the keys everywhere)
          envSound(state, d.x, 'crash', 1, -6); for (const n of [0, 3, 7, 11, -5]) envSound(state, d.x, 'ding', 0.35, n);
          for (let i = 0; i < 18; i++) state.particles.push({ pos: { x: d.x + (Math.random() - 0.5) * d.w, y: GY - 30 }, vel: { x: (Math.random() - 0.5) * 9, y: -3 - Math.random() * 6 }, life: 50, color: i % 3 ? '#FFFFFF' : '#18181B', size: 4, grav: 0.35 } as typeof state.particles[number]);
        } else { envSound(state, d.x, 'slam', 1, -16); envSound(state, d.x, 'clang', 0.8, -10); }
      }
    } else if (d.phase === 'down') {
      const tag = `ct-${d.id}`;
      if (!state.blocks.some(b => b.tag === tag) && !inWay(state, d.x - d.w / 2, GY - d.h, d.w, d.h)) addBlock(state, d.x - d.w / 2, GY - d.h, d.w, d.h, tag);
    }
  }
};
/** The first time each one comes down (for his line). */
let onDrop: ((state: GameState, id: 'safe' | 'piano') => void) | null = null;
export const onDropped = (f: (state: GameState, id: 'safe' | 'piano') => void) => { onDrop = f; };

/** Cannons: the row's (fixed, low and high in turn) and the canyon's (on a lift: up to his height). */
const updateCannon = (ctx: FrameContext, c: Cannon, lifted: boolean) => {
  const { state } = ctx, px = pmid(state), feet = pfeet(state);
  c.t++; if (c.recoil > 0) c.recoil = Math.max(0, c.recoil - 0.6);
  const inRange = alive(state) && px < c.muzzle - 10 && c.muzzle - px < c.range && (lifted || feet > Y(160));
  const want = (c.n % 2 ? 50 : 20) + (lifted ? clamp(GY - feet, 0, 320) : 0);
  switch (c.phase) {
    case 'wait':
      if (inRange && c.t > (lifted ? 70 : 54)) { c.phase = lifted ? 'aim' : 'tell'; c.t = 0; c.aim = want; }
      break;
    case 'aim':
      // (the lift running up or down to his height)
      c.aim = want;
      c.lift += clamp(c.aim - c.lift, -4, 4);
      if (c.t % 10 === 0) envSound(state, c.x, 'engine', 0.25, 12);
      if ((Math.abs(c.aim - c.lift) < 2 && c.t > 16) || c.t > 70) { c.phase = 'tell'; c.t = 0; }
      break;
    case 'tell':
      // (the barrel dips or rises; the touch hole fizzing, smoke curling off it)
      if (!lifted) c.aim = want;
      if (c.t % 5 === 0) envSound(state, c.x, 'click', 0.35, 18);
      if (c.t % 4 === 0 && onScreen(state, c.x - 60, c.x + 60)) sparks(state, c.x + 22, (lifted ? Y(c.lift) : Y(CANNON.h)) - 16, 2);
      if (c.t >= 40) {
        const y = lifted ? Y(c.lift) : Y(c.aim);
        itchyOf(state).balls.push({ x: c.muzzle - 8, y, vx: -7.5, t: 0 });
        envSound(state, c.x, 'boom', 0.9, 2); envSound(state, c.x, 'crash', 0.3, 10);
        for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: c.muzzle - 6, y }, vel: { x: -1 - Math.random() * 3, y: (Math.random() - 0.5) * 2 }, life: 34, color: 'rgba(230,226,220,0.7)', size: 8 + Math.random() * 8 });
        c.recoil = 14; c.n++; c.phase = 'wait'; c.t = 0;
      }
      break;
  }
  if (!lifted) c.lift = c.aim;
};
const ballHitsWall = (state: GameState, x: number, y: number) => state.blocks.some(b => b.type === 'wall' && !b.oneWay && x + BALL_R > b.x && x - BALL_R < b.x + b.w && y + BALL_R * 0.6 > b.y && y - BALL_R * 0.6 < b.y + b.h && b.y > GY - 400);
const updateBalls = (ctx: FrameContext, zones: Zone[]) => {
  const { state } = ctx, k = itchyOf(state);
  for (const b of k.balls) {
    b.t++; b.x += b.vx;
    if (b.t % 3 === 0) state.particles.push({ pos: { x: b.x + 10, y: b.y }, vel: { x: 0.5, y: -0.3 }, life: 18, color: 'rgba(200,196,190,0.45)', size: 6 });
    hurts(ctx, b.x - BALL_R, b.y - BALL_R, BALL_R * 2, BALL_R * 2, 13, 'm2:ct_cannon', { x: Math.sign(b.vx) * 10, y: -6 });
    hitsCast(ctx, b.x - BALL_R, b.y - BALL_R, BALL_R * 2, BALL_R * 2, 70, b.x - b.vx * 4, 'CANNONBALLED!', { knock: 14 });
    zones.push({ x0: Math.min(b.x, b.x + b.vx * 50) - BALL_R, x1: Math.max(b.x, b.x + b.vx * 50) + BALL_R, y0: b.y - BALL_R - 4, y1: b.y + BALL_R + 4 });
    if (b.t > 4 && ballHitsWall(state, b.x, b.y)) {
      b.dead = true; envSound(state, b.x, 'clang', 0.7, -6); envSound(state, b.x, 'thud', 0.5, -4);
      for (let i = 0; i < 8; i++) state.particles.push({ pos: { x: b.x, y: b.y }, vel: { x: (Math.random() - 0.5) * 4, y: -Math.random() * 3 }, life: 26, color: 'rgba(210,205,198,0.7)', size: 6 });
    }
    if (b.t > 260) b.dead = true;
  }
  k.balls = k.balls.filter(b => !b.dead);
};

const updateFuses = (ctx: FrameContext, zones: Zone[]) => {
  const { state } = ctx, k = itchyOf(state), px = pmid(state);
  for (const f of k.fuses) {
    f.t++;
    const d = f.d, xs = d.pts.map(q => X(q[0]));
    const near = alive(state) && px > Math.min(...xs, X(d.tnt[0])) - 520 && px < Math.max(...xs, X(d.tnt[0])) + 200;
    const tx = X(d.tnt[0]), ty = Y(d.tnt[1] + 26);
    switch (f.phase) {
      case 'wait':
        if (near && f.t > d.wait) { f.phase = 'strike'; f.t = 0; }
        break;
      case 'strike':
        // (the giant match scraped down the animatronic's leg; it flares; the fuse's end touched)
        if (f.t === 4) envSound(state, X(d.pts[0][0]), 'whoosh', 0.5, 16);
        if (f.t === 18) { envSound(state, X(d.pts[0][0]), 'ignite', 0.6, 4); const p0 = fusePoint(f, 0); sparks(state, p0.x, p0.y, 8); }
        if (f.t >= 34) { f.phase = 'burn'; f.t = 0; f.s = 0; }
        break;
      case 'burn': {
        f.s = Math.min(f.len, f.s + 2.4);
        const sp = fusePoint(f, f.s);
        if (f.t % 6 === 0) envSound(state, sp.x, 'click', 0.22, 22);
        if (f.t % 2 === 0 && onScreen(state, sp.x - 20, sp.x + 20)) sparks(state, sp.x, sp.y, 2);
        zones.push({ x0: tx - d.radius - 30, x1: tx + d.radius + 30, y0: ty - d.radius, y1: GY + 4 });
        if (f.s >= f.len) {
          blast(ctx, tx, ty, d.radius, 'm2:ct_dynamite', 18);
          // (the set's: it kicks the tower it's tied to)
          if (d.tower !== undefined) { const t = k.towers[SET_TOWER0 + d.tower]; if (t) { t.vel -= 0.05; envSound(state, tx, 'thud', 0.8, -10); } }
          f.phase = 'boom'; f.t = 0;
        }
        break;
      }
      case 'boom':
        if (f.t >= 30) { f.phase = 'reset'; f.t = 0; }
        break;
      case 'reset':
        // (a new pile up out of the trapdoor, a new fuse laid)
        if (f.t === 60) envSound(state, tx, 'click', 0.4, -4);
        if (f.t >= 110) { f.phase = 'wait'; f.t = 0; f.s = 0; }
        break;
    }
  }
};

/** Throws: cleavers, dynamite, folded holes. */
const updateThrows = (ctx: FrameContext, zones: Zone[]) => {
  const { state } = ctx, k = itchyOf(state);
  for (const s of k.throws) {
    s.t++;
    if (s.kind === 'dynamite') {
      s.fuse = (s.fuse ?? 90) - 1;
      if (s.t % 7 === 0) envSound(state, s.x, 'click', 0.18, 22);
      zones.push({ x0: s.x - 80, x1: s.x + 80, y0: s.y - 80, y1: s.y + 20 });
      if (s.fuse <= 0) { s.dead = true; blast(ctx, s.x, s.y - 8, 72, 'm2:ct_boom_shot', 14); continue; }
    }
    if (s.down) { if (s.kind === 'cleaver' && s.t > 160) s.dead = true; continue; }
    const g = s.kind === 'cleaver' ? 0.12 : 0.35;
    s.vy += g; s.x += s.vx; s.y += s.vy;
    if (s.kind === 'cleaver' && hurts(ctx, s.x - 10, s.y - 10, 20, 20, 9, 'm2:ct_cleaver_shot', { x: Math.sign(s.vx || 1) * 6, y: -4 })) { s.dead = true; playSound('crunch', 0.5, 8); continue; }
    const top = s.vy > 0 ? floorTopAt(state.blocks, s.x, s.y - s.vy - 2, 0) : null;
    const wall = state.blocks.some(b => !b.oneWay && b.type === 'wall' && s.x > b.x && s.x < b.x + b.w && s.y > b.y + 4 && s.y < b.y + b.h && b.y > GY - 600);
    if ((top !== null && s.y >= top) || wall) {
      if (s.kind === 'cleaver') { s.down = true; s.t = 0; s.y = top ?? s.y; envSound(state, s.x, 'clink', 0.5, -2); continue; }
      if (s.kind === 'dynamite') {
        if (wall) { s.vx = -s.vx * 0.4; s.x += s.vx * 2; continue; }
        s.y = top!;
        if (Math.abs(s.vy) > 3) { s.vy = -s.vy * 0.3; s.vx *= 0.5; envSound(state, s.x, 'thud', 0.3, 12); }
        else { s.vy = 0; s.vx = 0; s.down = true; }
        continue;
      }
      // (a folded hole: on the floor, it spreads out flat; anywhere else it flops off and is gone)
      s.dead = true;
      if (top !== null && !wall && !k.towers.some(t => Math.abs(t.b.y - top) < 2 && s.x > t.b.x && s.x < t.b.x + t.b.w) && k.holes.filter(h => !h.sky).length < 4) {
        k.holes.push({ x: s.x, y: top, w: 84, t: 0, life: 420 });
        envSound(state, s.x, 'whoosh', 0.4, -10); playSound('poof', 0.3, -8);
      }
      continue;
    }
    if (s.t > 240 || s.y > GY + 400) s.dead = true;
  }
  k.throws = k.throws.filter(s => !s.dead);
};

/** He's out of the floor: a hole up in the air over where he last stood safe, and down he comes out of it, on his
 *  head (hurt on landing). */
const holeOut = (state: GameState) => {
  const k = itchyOf(state), p = state.player;
  const sx = k.safe.x, sy = k.safe.y - 250;
  k.holes.push({ x: sx, y: sy, w: 80, t: 0, life: 60, sky: true });
  teleport(state, sx, sy + 8);
  p.vel.y = 1.5; p.invincibilityTimer = Math.max(p.invincibilityTimer, 30);
  k.holeDrop = true;
  playSound('whoosh', 0.6, -12); playSound('poof', 0.4, -4);
};
const updateHoles = (ctx: FrameContext) => {
  const { state } = ctx, k = itchyOf(state), p = state.player, px = pmid(state);
  for (const h of k.holes) {
    h.t++;
    if (h.sky) continue;
    // (spread out flat, it's a hole: in, and he's somewhere else)
    if (h.t > 18 && h.t < h.life - 16 && alive(state) && !k.holeDrop && p.isGrounded && Math.abs(pfeet(state) - h.y) < 4 && Math.abs(px - h.x) < h.w * 0.32 && !k.towers.some(t => onTower(state, t))) holeOut(state);
    if (h.t > 18 && h.t < h.life - 16) for (const e of hazardVictims(state)) {
      if (Math.abs(e.pos.x + e.width / 2 - h.x) > h.w * 0.3 || Math.abs(e.pos.y + e.height - h.y) > 4 || e.isBlownAway) continue;
      enemyHoleOut(ctx, e, h.x);
    }
  }
  k.holes = k.holes.filter(h => h.t < h.life);
  // (out of a hole, he lands on his head)
  if (k.holeDrop && p.isGrounded && p.vel.y >= 0) {
    k.holeDrop = false;
    if (p.health > 0) { p.invincibilityTimer = 0; hurtPlayer(ctx, 10, 'm2:ct_hole', { x: 0, y: -3 }); bonkStars(state, px, p.pos.y + 4); dust(state, px, pfeet(state), 8); playSound('thud', 0.8, -6); }
  }
};
/** One of the cast down a hole: out of one up over where it was put, onto its head. */
const enemyHoleOut = (ctx: FrameContext, e: Enemy, fromX: number) => {
  const { state } = ctx, k = itchyOf(state);
  const hx = e.homeX ?? e.pos.x, hy = (e.homeY ?? Y(0) - e.height) - 240;
  k.holes.push({ x: hx + e.width / 2, y: hy + e.height, w: 70, t: 0, life: 50, sky: true });
  e.pos.x = hx; e.pos.y = hy; e.vel.x = 0; e.vel.y = 1;
  envSound(state, fromX, 'whoosh', 0.4, -12);
  hazardHit(ctx, e, 30, hx, 'HOLED!', { knock: 0 });
};

/** The canyon and the floor of holes: in, and he's back where he last stood safe (hurt). The cast go down for good
 *  (the canyon) or come out of a hole (the set). */
const updatePits = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, k = itchyOf(state);
  const cx = pmid(state), feet = pfeet(state);
  if (p.health > 0 && !p.inCutscene && feet > GY + 30) {
    if (cx > X(CANYON[0]) && cx < X(CANYON[1])) {
      // (a long way down: a little puff of dust at the bottom, and he's back up at the edge)
      envSound(state, cx, 'whoosh', 0.7, -16); playSound('thud', 0.4, -14);
      hurtPlayer(ctx, 12, 'm2:ct_canyon', { x: 0, y: -4 });
      if (p.health > 0) { teleport(state, k.safe.x, k.safe.y); p.invincibilityTimer = Math.max(p.invincibilityTimer, 60); dust(state, k.safe.x, k.safe.y, 10, '#F5E1B8'); }
    } else if (cx > X(HOLES[0]) && cx < X(HOLES[1]) && !k.holeDrop) holeOut(state);
  }
  for (const e of state.enemies) {
    if (e.health <= 0 || e.type === 'boss' || e.enemyType === 'flyer' || e.isBlownAway) continue;
    const ex = e.pos.x + e.width / 2;
    if (e.pos.y + e.height < GY + 30 || !inPit(ex)) continue;
    if (!e.seen) { e.pos.x = e.homeX ?? e.pos.x; e.pos.y = e.homeY ?? Y(0) - e.height; e.vel.x = 0; e.vel.y = 0; continue; }
    if (ex > X(CANYON[0]) && ex < X(CANYON[1])) hazardKill(ctx, e, ex, 'PUFF!', { fling: { x: 0, y: 2 }, sound: 'whoosh', color: '#FDE68A' });
    else enemyHoleOut(ctx, e, ex);
  }
};

/** Where he last stood safe: on the ground or a ledge, not a tower, not a pit's lip, not under a hazard. */
export const noteSafe = (state: GameState) => {
  const p = state.player, k = itchyOf(state);
  if (!p.isGrounded || p.health <= 0 || p.inCutscene || k.holeDrop) return;
  if (k.towers.some(t => onTower(state, t))) return;
  const cx = pmid(state), feet = pfeet(state), atGround = Math.abs(feet - GY) < 4;
  if (atGround && PITS.some(([a, b]) => cx > X(a) - 50 && cx < X(b) + 50)) return;
  if (k.holes.some(h => !h.sky && Math.abs(cx - h.x) < h.w)) return;
  if (k.anvils.some(a => !a.host && Math.abs(cx - a.x) < AW + 20)) return;
  if (k.hammers.some(h => Math.abs(cx - X(h.d.hit)) < H_HEAD_W)) return;
  if (k.traps.some(t => !t.sprung && Math.abs(cx - t.x) < 40)) return;
  if (k.fuses.some(f => Math.abs(cx - X(f.d.tnt[0])) < f.d.radius + 30)) return;
  if (k.drops.some(d => d.phase !== 'down' && Math.abs(cx - d.x) < d.w)) return;
  k.safe.x = cx; k.safe.y = feet;
};

export const updateHazards = (ctx: FrameContext) => {
  const { state } = ctx, k = itchyOf(state);
  const zones: Zone[] = [];
  updateAnvils(ctx, zones);
  updateHammers(ctx, zones);
  updateRakes(ctx);
  updateTraps(ctx);
  updateGloves(ctx, zones);
  updateDrops(ctx, zones);
  updateCannon(ctx, k.cannon, false);
  updateCannon(ctx, k.lift, true);
  updateBalls(ctx, zones);
  updateFuses(ctx, zones);
  updateThrows(ctx, zones);
  updateHoles(ctx);
  // (the canyon and the floor of holes: nobody stands about at their edges)
  for (const [a, b] of PITS) zones.push({ x0: X(a), x1: X(b), y0: GY - 2, y1: GY + 400, ground: true });
  for (const h of k.holes) if (!h.sky) zones.push({ x0: h.x - h.w / 2, x1: h.x + h.w / 2, y0: h.y - 6, y1: h.y + 4, ground: true });
  setHazardZones(state, 'ct-itchy', zones);
  updatePits(ctx);
  for (const b of k.blasts) b.t++;
  k.blasts = k.blasts.filter(b => b.t < 30);
};

/** A thrown thing from the cast (kinds.ts). */
export const throwIt = (state: GameState, from: Enemy, t: Omit<Throw, 'from' | 't'>) => itchyOf(state).throws.push({ ...t, from, t: 0 });
/** Are there too many of the stagehands' holes about to lay another? */
export const holesFull = (state: GameState) => {
  const k = itchyOf(state);
  return k.holes.filter(h => !h.sky).length + k.throws.filter(s => s.kind === 'hole').length >= 3;
};
export type { Hole, Ball };
