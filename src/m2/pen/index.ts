// The staff room behind the STAFF ONLY door: a practice room, like Meathead's gym. A strip of back-of-house concrete
// with people (and a few animals) walking in from the far end to practice on, a few at a time, forever. Nobody in here
// fights back: they don't shoot, swing or bump him, they just run about (and away from him, when he comes at them);
// and he can't be hurt in here anyway (App.tsx). For now they're Meathead 1's; it'll fill up with the regular enemies met in the game. The door
// back to the hub is at the near end.

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
import { M2_ENEMY_KINDS } from '../roster';
import { beingSucked } from '../weapons/soulSucker';
import { drawPenBackdrop, drawPenBack } from './art';

export const PEN_STAGE = 'M2 Staff Pen';
export const X0 = -40000, LEN = 2400;
/** The end walls: solid, drawn, and the camera stops at their outer faces. */
export const WALL = 60;
/** The ceiling: a concrete slab across the whole room, its underside this far down (clear of the HUD's bars). */
export const CEIL_Y = 70;
export const EXIT_X = X0 + 130;
/** Who walks in, in turn (the rat's there to show who can't be grabbed). */
/** (and men with shields, every so often, to try things on) */
const ROSTER: EnemyKind[] = M2_ENEMY_KINDS.flatMap((k, i) => (i % 4 === 3 ? [k, (['shielder', 'riotcop', 'protester'] as EnemyKind[])[Math.floor(i / 4) % 3]] : [k]));
const AT_ONCE = 5, RESPAWN = 70;
const FLYERS = new Set<EnemyKind>(['pigeon', 'seagull', 'hawk', 'eagle', 'vulture', 'pelican', 'grackle']);

interface Pen { grab: Grab; next: number; cooldown: number; upWas: boolean }
const getPen = (state: GameState) => state.stage as Pen | null;

const send = (state: GameState, pen: Pen, x = X0 + LEN - 120 - Math.random() * 200) => {
  const kind = ROSTER[pen.next++ % ROSTER.length];
  // (a bird comes in flying, a way up: low enough to jump and grab)
  const flyer = FLYERS.has(kind);
  const e = makeKindEnemy(kind, x, flyer ? GROUND_Y - 70 - Math.random() * 60 : GROUND_Y);
  e.seen = true;
  // (practice from the first frame it's in: see practice)
  e.harmless = true; e.puppet = true; e.pauseTimer = 2;
  state.enemies.push(e);
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
    const pen: Pen = { grab: createGrab(state), next: 0, cooldown: 0, upWas: false };
    state.stage = pen;
    state.cameraMinX = X0 - WALL;
    state.cameraMaxX = X0 + LEN + WALL - CANVAS_WIDTH;
    // (already in here when he comes in: spread out down the room, the first few in view, the nearest a little way off from the door)
    for (let i = 0; i < AT_ONCE; i++) send(state, pen, X0 + 380 + i * 230);
  },
  update: (ctx, controls) => {
    const { state } = ctx;
    const pen = getPen(state);
    // (dev builds: the state on the window, for poking at it)
    if (import.meta.env.DEV) (window as unknown as { __m2: GameState }).__m2 = state;
    // (on the way out: out of his hands, and whatever he had going stopped)
    if (isLeaving()) { stopWeapons(); carryGut(state.player.gut); state.player.vel.x = 0; return { ...NO_CONTROLS }; }
    if (!pen) return controls;
    const out = updateGrab(ctx, pen.grab, controls);
    practice(state);
    // Nothing in here hurts him: not a bump, not anything (the invincibility cheat keeps his health; this keeps the
    // knock and the flinch off him too)
    state.player.noContactHurt = true;
    // Health doesn't drop off the dead here: the beatdown's how you get it back
    state.pickups = state.pickups.filter(p => !(p.id.startsWith('pickup-') && (p.type === 'small_health' || p.type === 'large_health')));
    // A few at a time, always
    const alive = state.enemies.filter(e => e.health > 0 && !e.isBlownAway).length + (pen.grab.held ? 1 : 0);
    if (alive < AT_ONCE && --pen.cooldown <= 0) { send(state, pen, arrivalX(state)); pen.cooldown = RESPAWN; }
    // The way back
    const p = state.player, cx = p.pos.x + p.width / 2;
    const near = p.isGrounded && Math.abs(cx - EXIT_X) < 60 && !grabbing(pen.grab);
    setUi({ nearExit: near, near: null, map: null });
    if (near && controls.up && !pen.upWas) goTo('hub');
    pen.upWas = !!controls.up;
    return out;
  },
  drawBackdrop: (ctx, state) => { drawPenBackdrop(ctx, state); return true; },
  drawBack: (ctx, state) => drawPenBack(ctx, state),
  drawFront: (ctx, state) => { const pen = getPen(state); if (pen) drawGrab(ctx, state, pen.grab); },
};

/**
 * Everybody in here's for practice: harmless to bump, never shooting or swinging, and moved by hand (their own AI held
 * off): wandering from spot to spot round about him (so there's always somebody near), stopping for a bit, and running off when he gets close (not so fast he can't catch
 * them). Anybody knocked about (thrown, punched, stunned) is left to that till they've come round.
 */
const WANDER = 1.3, FLEE = 2.4, SCARE = 150, EDGE = 60;
const wander = new WeakMap<Enemy, { to: number; rest: number }>();
const practice = (state: GameState) => {
  const p = state.player, px = p.pos.x + p.width / 2;
  // (anything one of them let fly before they came in here, gone)
  state.projectiles = state.projectiles.filter(pr => pr.owner !== 'enemy');
  for (const e of state.enemies) {
    if (e.health <= 0 || e.isBlownAway) continue;
    e.harmless = true; e.puppet = true; e.shootTimer = 0;
    // (nobody ends up out past the walls, however they got sent)
    e.pos.x = Math.max(X0, Math.min(X0 + LEN - e.width, e.pos.x));
    // (knocked about by him: left to it)
    // (the soul sucker's got hold of him: he's running from it his own way, see weapons/soulSucker)
    if (beingSucked(e, state.frame)) continue;
    // (frozen solid, or being electrocuted: going nowhere)
    if ((e.frozenTimer || 0) > 0 || (e.shockedUntil ?? -1) >= state.frame) continue;
    // (their own way of moving, a charger's charge, doesn't count: only what's been done to them)
    if ((e.pauseTimer || 0) > 2 || Math.abs(e.vel.y) > 0.5) continue;
    e.pauseTimer = 2;
    let w = wander.get(e);
    if (!w) { w = { to: e.pos.x + e.width / 2, rest: 90 + Math.floor(Math.random() * 120) }; wander.set(e, w); }
    const ex = e.pos.x + e.width / 2, d = ex - px;
    let dir = 0, speed = WANDER;
    if (Math.abs(d) < SCARE) {
      // Running off from him (backed into a wall: past him the other way)
      dir = d >= 0 ? 1 : -1;
      if ((dir > 0 && ex > X0 + LEN - EDGE) || (dir < 0 && ex < X0 + EDGE)) dir = -dir;
      speed = FLEE; w.rest = 0; w.to = ex + dir * 120;
    } else if (w.rest > 0) w.rest--;
    else if (Math.abs(w.to - ex) < 8) { w.rest = 30 + Math.floor(Math.random() * 90); w.to = Math.max(X0 + EDGE, Math.min(X0 + LEN - EDGE, px + (Math.random() - 0.5) * 800)); }
    else dir = w.to > ex ? 1 : -1;
    if (!dir) { e.vel.x = 0; continue; }
    // (walking whichever way, a man with a shield keeps it to Meathead)
    e.facing = (e.enemyType === 'shield' ? (px < ex ? -1 : 1) : dir) as 1 | -1;
    e.pos.x = Math.max(X0 + 10, Math.min(X0 + LEN - e.width - 10, e.pos.x + dir * speed));
    // (a hair of speed, for which way they're going: not enough to slide them)
    e.vel.x = dir * 0.01;
  }
};
