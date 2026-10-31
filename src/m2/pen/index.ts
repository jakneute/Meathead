// The staff room behind the STAFF ONLY door: a practice room, like Meathead's gym. The park's filthy break room, full
// of bored employees on a break that never ends (staff.ts: a mascot with the head off, a princess vaping, the churro
// guy, a ride op, a janitor, security, the ticket kid, maintenance, the face painter, a parade dancer), walking in a
// few at a time, forever; and the rats and pigeons that live in there with them (the rats out of the holes in the
// baseboard, the pigeons down through the hole in the ceiling). Nobody in here fights back: they don't shoot, swing
// or bump him, they just mope about (and get out of his way when he comes at them); and he can't be hurt in here
// anyway (App.tsx). The door back to the hub is at the near end. And ladders to try (moves/ladders.ts): one up to a
// high shelf, one up to nothing (to shoot from). And a few mid-sized animals to try the grabs on (animals.ts: the
// owner's "spawn in mid sized animals in the break room too for practice" / "like golden retrievers, lol"): a couple of
// golden retrievers that bound over and jump up at him, and a wolf and a jaguar got out of their lands that run off
// like the staff; topped up on their own clock, a while after one's gone. The room's shut at both ends, so they never
// leave it or follow him out.

import type { StageLayout } from '../../m1/game/stages/index';
import type { GameState } from '../../m1/game/core/state';
import type { EnemyKind, Enemy } from '../../m1/types';
import { groundBlocks } from '../../m1/game/core/terrain';
import { makeKindEnemy } from '../../m1/game/enemies/kinds';
import { GROUND_Y, CANVAS_WIDTH } from '../../m1/constants';
import { createGrab, updateGrab, drawGrab, grabbing, type Grab } from '../moves/grab';
import { setUi, goTo, isLeaving, arrived, carryGut, takeGut } from '../store';
import { stopWeapons } from '../weapons';
import { NO_CONTROLS } from '../../m1/game/platform/input';
import { PEN_STAFF_KINDS, penMoving } from './staff';
import { beingSucked } from '../weapons/soulSucker';
import { drawPenBackdrop, drawPenBack, drawPenShelf } from './art';
import { updateLadders, drawLadders, type LadderDef } from '../moves/ladders';
import { PEN_ANIMALS, PEN_RETRIEVER, PEN_WOLF, PEN_JAGUAR, penJumping } from './animals';
import { say, MEATHEAD_VOICE, pickLine } from '../../m1/game/platform/speech';
import { isShat, isNude } from '../../m1/game/player/gut';
import { playSound } from '../../m1/game/platform/audio';
import { PEN_DOG_JUMP } from '../lines/hubLines';

export const PEN_STAGE = 'M2 Staff Pen';
export const X0 = -40000, LEN = 2700;
/** The end walls: solid, drawn, and the camera stops at their outer faces. */
export const WALL = 60;
/** The ceiling: a concrete slab across the whole room, its underside this far down (clear of the HUD's bars). */
export const CEIL_Y = 70;
export const EXIT_X = X0 + 130;
/** The high shelf (a one-way ledge: up through it from under), and the ladders: one up to it, one up to nothing. */
export const SHELF = { x: X0 + 880, y: GROUND_Y - 210, w: 300 };
const LADDERS: LadderDef[] = [
  { x: SHELF.x + 18, top: SHELF.y, bottom: GROUND_Y, ledge: { x: SHELF.x + 60, y: SHELF.y } },
  { x: X0 + 1560, top: GROUND_Y - 300, bottom: GROUND_Y },
];
/** Who walks in, in turn: the staff, every job round before any comes again. */
const ROSTER = PEN_STAFF_KINDS as EnemyKind[];
const AT_ONCE = 5, RESPAWN = 70;
/** The vermin: always this many of each about, topped up on their own clock. */
const RAT = 'm2:pen_rat' as EnemyKind, PIGEON = 'm2:pen_pigeon' as EnemyKind;
const RATS = 3, PIGEONS = 3, VERMIN_RESPAWN = 150;
/** The animals: always this many of each about (the retrievers, the wolf, the jaguar), topped up one at a time, a
 *  while after one's gone. */
const ANIMAL_COUNT: Record<string, number> = { [PEN_RETRIEVER]: 2, [PEN_WOLF]: 1, [PEN_JAGUAR]: 1 };
const ANIMAL_RESPAWN = 300;
const isAnimal = (k: string) => PEN_ANIMALS.includes(k);
/** Where the rats come out (the holes in the baseboard: art.ts draws them there), and where the pigeons come down. */
export const RAT_HOLES = [X0 + 500, X0 + 1822];
export const PIGEON_HOLE = { x: X0 + 1910, y: CEIL_Y + 14 };
/** The seeds the staff are drawn from (who's in the uniform): a pool, so their stamps get used again. */
const SEEDS = 23;

interface Pen { grab: Grab; next: number; cooldown: number; vermin: number; animals: number; upWas: boolean }
const getPen = (state: GameState) => state.stage as Pen | null;

const practiceReady = (state: GameState, e: Enemy) => {
  e.seen = true;
  // (practice from the first frame it's in: see practice)
  e.harmless = true; e.puppet = true; e.pauseTimer = 2;
  state.enemies.push(e);
};
const send = (state: GameState, pen: Pen, x = X0 + LEN - 120 - Math.random() * 200) => {
  const n = pen.next++;
  const e = makeKindEnemy(ROSTER[n % ROSTER.length], x, GROUND_Y);
  // (who's in it: a step through the pool each time)
  e.variant = (n * 7 + Math.floor(n / ROSTER.length) * 5) % SEEDS;
  practiceReady(state, e);
};
const sendAnimal = (state: GameState, kind: string, x: number) => {
  const e = makeKindEnemy(kind as EnemyKind, x, GROUND_Y);
  e.variant = Math.floor(Math.random() * 6);
  practiceReady(state, e);
};
const sendRat = (state: GameState, x?: number) => practiceReady(state, makeKindEnemy(RAT, x ?? RAT_HOLES[Math.floor(Math.random() * RAT_HOLES.length)], GROUND_Y));
const sendPigeon = (state: GameState, x?: number, y?: number) => {
  const e = makeKindEnemy(PIGEON, x ?? PIGEON_HOLE.x, y ?? PIGEON_HOLE.y + 20);
  e.variant = Math.floor(Math.random() * 8);
  practiceReady(state, e);
};

/**
 * Where the next one comes in: on the screen he's looking at, at the far side of it from him (so they come to him, and
 * don't all pile up down the far end of the room); against a wall, the other side of the screen.
 */
const arrivalX = (state: GameState) => {
  const p = state.player, px = p.pos.x + p.width / 2;
  // (the screen round him, where the camera's settling: not where it's caught up to yet)
  const cam = Math.max(X0 - WALL, Math.min(X0 + LEN + WALL - CANVAS_WIDTH, px - CANVAS_WIDTH / 2));
  const left = cam + 70, right = cam + CANVAS_WIDTH - 110;
  const lo = X0 + 40, hi = X0 + LEN - 100;
  const far = px < cam + CANVAS_WIDTH / 2 ? right : left;
  const x = Math.max(lo, Math.min(hi, far + (Math.random() - 0.5) * 60));
  return Math.abs(x - px) > 220 ? x : Math.max(lo, Math.min(hi, far === right ? left : right));
};

export const penLayout: StageLayout = {
  left: X0 - 600,
  startX: X0 + 140,
  verticalCamera: false,
  startsStanding: true,
  build: (state) => {
    arrived(); stopWeapons();
    // (his pants as they were in the last room)
    { const g = takeGut(); if (g) state.player.gut = g; }
    const runs = [{ x1: X0 - 400, y1: GROUND_Y, x2: X0 + LEN + 400, y2: GROUND_Y, surface: 'concrete' }];
    state.groundRuns = runs;
    state.blocks.push(...groundBlocks(runs));
    state.blocks.push({ x: X0 - WALL, y: -3000, w: WALL, h: 3600, type: 'wall', hidden: true, tag: 'pen-l' }, { x: X0 + LEN, y: -3000, w: WALL, h: 3600, type: 'wall', hidden: true, tag: 'pen-r' });
    state.blocks.push({ x: X0 - WALL, y: -3000, w: LEN + WALL * 2, h: 3000 + CEIL_Y, type: 'wall', hidden: true, tag: 'pen-ceiling' });
    state.blocks.push({ x: SHELF.x, y: SHELF.y, w: SHELF.w, h: 16, type: 'platform', oneWay: true, hidden: true, tag: 'pen-shelf' } as never);
    const pen: Pen = { grab: createGrab(state), next: Math.floor(Math.random() * ROSTER.length), cooldown: 0, vermin: VERMIN_RESPAWN, animals: ANIMAL_RESPAWN, upWas: false };
    state.stage = pen;
    state.cameraMinX = X0 - WALL;
    state.cameraMaxX = X0 + LEN + WALL - CANVAS_WIDTH;
    // (already in here when he comes in: spread out down the room, the first few in view, the nearest a little way off from the door)
    for (let i = 0; i < AT_ONCE; i++) send(state, pen, X0 + 380 + i * 230);
    for (let i = 0; i < RATS; i++) sendRat(state, X0 + 300 + Math.random() * (LEN - 400));
    for (let i = 0; i < PIGEONS; i++) sendPigeon(state, X0 + 300 + i * 260 + Math.random() * 120, GROUND_Y - 90 - Math.random() * 120);
    // (the animals spread down the room too, a retriever nearest the door: it's coming to say hello)
    let ax = X0 + 520;
    for (const [kind, n] of Object.entries(ANIMAL_COUNT)) for (let i = 0; i < n; i++) { sendAnimal(state, kind, ax); ax += 420 + Math.random() * 120; }
    lastDogLine = -9999;
  },
  update: (ctx, controls) => {
    const { state } = ctx;
    const pen = getPen(state);
    // (dev builds: the state on the window, for poking at it)
    if (import.meta.env.DEV) (window as unknown as { __m2: GameState }).__m2 = state;
    // (on the way out: out of his hands, and whatever he had going stopped)
    if (isLeaving()) { stopWeapons(); carryGut(state.player); state.player.vel.x = 0; return { ...NO_CONTROLS }; }
    if (!pen) return controls;
    const out = updateGrab(ctx, pen.grab, updateLadders(ctx, LADDERS, controls));
    practice(state);
    dogs(state);
    // Nothing in here hurts him: not a bump, not anything (the invincibility cheat keeps his health; this keeps the
    // knock and the flinch off him too)
    state.player.noContactHurt = true;
    // Health doesn't drop off the dead here: the beatdown's how you get it back
    state.pickups = state.pickups.filter(p => !(p.id.startsWith('pickup-') && (p.type === 'small_health' || p.type === 'large_health')));
    // A few at a time, always
    const live = state.enemies.filter(e => e.health > 0 && !e.isBlownAway), held = pen.grab.held;
    const count = (pred: (k: string) => boolean) => live.filter(e => pred(e.kind ?? '')).length + (held && pred(held.kind ?? '') && !live.includes(held) ? 1 : 0);
    if (count(k => k !== RAT && k !== PIGEON && !isAnimal(k)) < AT_ONCE && --pen.cooldown <= 0) { send(state, pen, arrivalX(state)); pen.cooldown = RESPAWN; }
    if (--pen.vermin <= 0) {
      pen.vermin = VERMIN_RESPAWN;
      if (count(k => k === RAT) < RATS) sendRat(state);
      else if (count(k => k === PIGEON) < PIGEONS) sendPigeon(state);
    }
    if (--pen.animals <= 0) {
      pen.animals = ANIMAL_RESPAWN;
      const short = Object.entries(ANIMAL_COUNT).find(([kind, n]) => count(k => k === kind) < n);
      if (short) sendAnimal(state, short[0], arrivalX(state));
    }
    // The way back: its door at the room's left end, up at it to go (the user's: "exiting the break room should require
    // pressing up on the door"); the end wall stops him walking on past it. Not while he's got someone in his hands.
    const p = state.player, cx = p.pos.x + p.width / 2;
    const near = p.isGrounded && Math.abs(cx - EXIT_X) < 60 && p.health > 0 && !grabbing(pen.grab);
    setUi({ nearExit: near, near: null, map: null });
    if (near && controls.up && !pen.upWas) goTo('hub');
    pen.upWas = !!controls.up;
    return out;
  },
  drawBackdrop: (ctx, state) => { drawPenBackdrop(ctx, state); return true; },
  drawBack: (ctx, state) => { drawPenBack(ctx, state); drawPenShelf(ctx, state); drawLadders(ctx, state, LADDERS); },
  drawFront: (ctx, state) => { const pen = getPen(state); if (pen) drawGrab(ctx, state, pen.grab); },
};

/**
 * Everybody in here's for practice: harmless to bump, never shooting or swinging, and moved by hand (their own AI held
 * off): wandering from spot to spot round about him (so there's always somebody near), stopping for a bit, and running off when he gets close (not so fast he can't catch
 * them). Anybody knocked about (thrown, punched, stunned) is left to that till they've come round.
 */
const WANDER = 1.3, FLEE = 2.4, SCARE = 150, EDGE = 60;
/** The rats (and a pigeon knocked out of the air): quicker, never still long, scared from further off. */
const RAT_WANDER = 2.6, RAT_FLEE = 4.4, RAT_SCARE = 190;
const wander = new WeakMap<Enemy, { to: number; rest: number }>();
const flight = new WeakMap<Enemy, { tx: number; ty: number; rest: number }>();
/** A pigeon flapping about the room: from spot to spot up in the air round about him (low enough to jump at, mostly),
 *  hanging there a bit, and off up and away when he comes at it. */
const flyPigeon = (state: GameState, e: Enemy, px: number, py: number) => {
  const ex = e.pos.x + e.width / 2, ey = e.pos.y + e.height / 2;
  const pick = () => ({ tx: Math.max(X0 + EDGE, Math.min(X0 + LEN - EDGE, px + (Math.random() - 0.5) * 900)), ty: GROUND_Y - 60 - Math.random() * 200, rest: 20 + Math.floor(Math.random() * 80) });
  let w = flight.get(e);
  if (!w) { w = pick(); flight.set(e, w); }
  e.vel.x = 0; e.vel.y = 0;
  let speed = 2.2;
  if (Math.hypot(ex - px, ey - py) < 130) {
    const dir = ex >= px ? 1 : -1;
    w.tx = Math.max(X0 + EDGE, Math.min(X0 + LEN - EDGE, ex + dir * 260)); w.ty = CEIL_Y + 60 + Math.random() * 80; w.rest = 0; speed = 4.2;
  } else if (Math.hypot(w.tx - ex, w.ty - ey) < 6) {
    if (w.rest-- <= 0) Object.assign(w, pick());
    // (hanging there, bobbing)
    e.pos.y += Math.sin((state.frame + (e.variant ?? 0) * 20) * 0.15) * 0.4;
    return;
  } else if (Math.abs(w.tx - ex) > 400) speed = 3.4;
  const dx = w.tx - ex, dy = w.ty - ey, m = Math.hypot(dx, dy) || 1, s = Math.min(speed, m);
  e.pos.x += (dx / m) * s;
  e.pos.y = Math.max(CEIL_Y + 4, e.pos.y + (dy / m) * s + Math.sin(state.frame * 0.2 + (e.variant ?? 0)) * 0.5);
  if (Math.abs(dx) > 1) e.facing = (dx < 0 ? -1 : 1) as 1 | -1;
  penMoving.add(e);
};
const practice = (state: GameState) => {
  const p = state.player, px = p.pos.x + p.width / 2;
  penDogs.clear();
  // (anything one of them let fly before they came in here, gone)
  state.projectiles = state.projectiles.filter(pr => pr.owner !== 'enemy');
  for (const e of state.enemies) {
    if (e.health <= 0 || e.isBlownAway) continue;
    e.harmless = true; e.puppet = true; e.shootTimer = 0;
    // (nobody ends up out past the walls, however they got sent)
    e.pos.x = Math.max(X0, Math.min(X0 + LEN - e.width, e.pos.x));
    // (knocked about by him: left to it)
    // (the soul sucker's got hold of him: he's running from it his own way, see weapons/soulSucker)
    penMoving.delete(e);
    if (beingSucked(e, state.frame)) continue;
    // (frozen solid, or being electrocuted: going nowhere)
    if ((e.frozenTimer || 0) > 0 || (e.shockedUntil ?? -1) >= state.frame) continue;
    // (their own way of moving, a charger's charge, doesn't count: only what's been done to them)
    if ((e.pauseTimer || 0) > 2 || Math.abs(e.vel.y) > 0.5) continue;
    e.pauseTimer = 2;
    if (e.kind === PIGEON && !e.dropping) { flyPigeon(state, e, px, p.pos.y + p.height / 2); continue; }
    // (the retrievers have their own ideas: dogs(), below)
    if (e.kind === PEN_RETRIEVER) { penDogs.add(e); continue; }
    const quick = e.kind === RAT || e.kind === PIGEON;
    let w = wander.get(e);
    if (!w) { w = { to: e.pos.x + e.width / 2, rest: quick ? 10 : 90 + Math.floor(Math.random() * 120) }; wander.set(e, w); }
    const ex = e.pos.x + e.width / 2, d = ex - px;
    let dir = 0, speed = quick ? RAT_WANDER : WANDER;
    if (Math.abs(d) < (quick ? RAT_SCARE : SCARE)) {
      // Running off from him (backed into a wall: past him the other way)
      dir = d >= 0 ? 1 : -1;
      if ((dir > 0 && ex > X0 + LEN - EDGE) || (dir < 0 && ex < X0 + EDGE)) dir = -dir;
      speed = quick ? RAT_FLEE : FLEE; w.rest = 0; w.to = ex + dir * 120;
    } else if (w.rest > 0) w.rest--;
    else if (Math.abs(w.to - ex) < 8) { w.rest = quick ? 8 + Math.floor(Math.random() * 40) : 30 + Math.floor(Math.random() * 90); w.to = Math.max(X0 + EDGE, Math.min(X0 + LEN - EDGE, px + (Math.random() - 0.5) * (quick ? 500 : 800))); }
    else dir = w.to > ex ? 1 : -1;
    if (!dir) { e.vel.x = 0; continue; }
    e.facing = dir as 1 | -1;
    penMoving.add(e);
    e.pos.x = Math.max(X0 + 10, Math.min(X0 + LEN - e.width - 10, e.pos.x + dir * speed));
    // (a hair of speed, for which way they're going: not enough to slide them)
    e.vel.x = dir * 0.01;
  }
};

/**
 * The golden retrievers: no running off from him. They bound over to him from wherever they are, jump up at him (no
 * harm in it: nothing in here hurts him), drop back down, mill round his feet a bit wagging, and go again; now and then
 * a fit of the zoomies off down the room and back. Anybody knocked about is left to it, like the rest (practice()).
 */
const DOG_TROT = 2.2, DOG_BOUND = 3.4, DOG_ZOOM = 5, DOG_JUMP_AT = 46;
interface Dog { cd: number; zoom: number; to: number; jumpT: number; jdir: 1 | -1 }
const dogMemo = new WeakMap<Enemy, Dog>();
/** The retrievers practice() left to dogs() this frame (up and about, nobody's knocked them about). */
const penDogs = new Set<Enemy>();
/** When he last said something about one jumping on him (not every time: the owner's "talk less"). */
let lastDogLine = -9999;
const DOG_LINE_GAP = 600;
const dogs = (state: GameState) => {
  const p = state.player, px = p.pos.x + p.width / 2;
  for (const e of state.enemies) {
    if (e.kind !== PEN_RETRIEVER) continue;
    let d = dogMemo.get(e);
    if (!d) { d = { cd: 60 + Math.floor(Math.random() * 60), zoom: 0, to: 0, jumpT: 0, jdir: 1 }; dogMemo.set(e, d); }
    // (up in the air from a jump of its own: down when it's down)
    if (penJumping.has(e)) {
      d.jumpT++;
      if (e.health <= 0 || e.isBlownAway || (e.pauseTimer || 0) > 2 || (d.jumpT > 4 && e.vel.y === 0)) penJumping.delete(e);
      // (carried along by hand, not by its speed: a body going sideways while it's knocked about hurts whoever it runs
      // into, the engine's mass x speed)
      else { e.pauseTimer = 2; e.pos.x = Math.max(X0 + 10, Math.min(X0 + LEN - e.width - 10, e.pos.x + d.jdir * 1.2)); continue; }
    }
    if (!penDogs.has(e)) continue;
    const ex = e.pos.x + e.width / 2, dx = px - ex, dir = (Math.sign(dx) || 1) as 1 | -1;
    let speed = 0, way = dir;
    if (d.cd > 0) d.cd--;
    if (d.zoom > 0) {
      // (the zoomies: flat out to the spot and back to him)
      d.zoom--;
      const zx = d.to - ex;
      if (Math.abs(zx) < 10) d.to = px; else { way = (Math.sign(zx) || 1) as 1 | -1; speed = DOG_ZOOM; }
    } else if (Math.abs(dx) > 300) speed = DOG_TROT;
    // (come down right on top of him: a step back off him, so it's not stood hidden behind him)
    else if (d.cd > 0 && Math.abs(dx) < 40) { way = (-dir) as 1 | -1; speed = DOG_TROT; }
    else if (Math.abs(dx) > DOG_JUMP_AT) speed = d.cd > 0 && Math.abs(dx) < 110 ? 0 : DOG_BOUND;
    else if (d.cd <= 0 && p.health > 0) {
      // Up at him, front paws out
      e.facing = dir; e.vel = { x: dir * 0.01, y: -6 }; e.pauseTimer = 2;
      penJumping.add(e); d.jumpT = 0; d.jdir = dir; d.cd = 90 + Math.floor(Math.random() * 110);
      playSound('snort', 0.55, 11); playSound('snort', 0.45, 13);
      if (Math.random() < 0.06) { d.zoom = 150; d.to = Math.max(X0 + EDGE, Math.min(X0 + LEN - EDGE, ex - dir * (400 + Math.random() * 300))); }
      if (state.frame - lastDogLine > DOG_LINE_GAP && Math.random() < 0.4) { lastDogLine = state.frame; dogLine(state); }
      continue;
    }
    e.facing = way;
    if (!speed) { e.vel.x = 0; continue; }
    penMoving.add(e);
    e.pos.x = Math.max(X0 + 10, Math.min(X0 + LEN - e.width - 10, e.pos.x + way * speed));
    e.vel.x = way * 0.01;
  }
};
/** Him, about one jumping up on him (in clean pants, shitty ones, or none). */
const dogLine = (state: GameState) => {
  const text = pickLine(PEN_DOG_JUMP[isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean']);
  say(text, MEATHEAD_VOICE, 'casual', {
    onShow: () => { state.playerLastVulgarity = text; state.playerVulgarityTimer = 180; },
    onHide: () => { if (state.playerLastVulgarity === text) state.playerVulgarityTimer = 0; },
  });
};
