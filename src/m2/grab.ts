// Meathead 2's grabs, on top of Meathead 1's moves:
//
// Like a fighting game's grabs: once one's started, he's committed to it.
//
//   BEATDOWN (Y + B, or R): a quick windup (coiled down low; a hit in it knocks him out of it), then a short lunge.
//   Catch somebody and he's down, Meathead on top of him, and every press of X or B (shoot or special) is a punch, each
//   one giving him a little health back (and a lot when it's over). Jump to get off. Anything that hurts him knocks him
//   off. Whiff, and he's stood there wide open.
//
//   SHAKEDOWN (Y + X, or T): a quicker windup (hands out for the throat) that nothing stops, and if there's somebody
//   there at the end of it, up by the neck and shaken (nothing stops that either: he takes the hits and carries on);
//   the ammo falls out of him; and at the end he's
//   thrown whichever way's held (left, right, up), into whoever's in the way, or slammed down into the floor (more
//   damage, but nobody else gets hit). Once each: there's nothing left in him after.
//
// Both work on people and the mid-sized animals; not the little ones, the big ones, the machines or the bosses.

import type { FrameContext } from '../game/core/context';
import type { GameState } from '../game/core/state';
import { shakeScreen } from '../game/core/state';
import { NO_CONTROLS, type Controls } from '../game/platform/input';
import type { Enemy, EnemyKind, WeaponType } from '../types';
import { isHumanoidKind, drawKindEnemy, kindHead } from '../game/render/enemies';
import { isMidBoss } from '../game/combat/midBoss';
import { playSound } from '../game/platform/audio';
import { INITIAL_PLAYER_HEALTH } from '../constants';
import { beginSprite, endSprite } from '../game/render/player/spriteOutline';
import { drawLeg, drawArmTo, drawTorsoFromHips, drawHead, type Mood } from '../game/render/player/body';
import { drawPlayer } from '../game/render/player/player';
import { btn, pressed, pollM2 } from './input';
import { grabCallout } from './callouts';

type Ctx = CanvasRenderingContext2D;

// The beatdown
/** Like a fighting game's grab: once it's started, he's committed. Both windups are nearly instant (what limits them is
 * their reach); a hit in the beatdown's knocks him out of it, nothing stops the shakedown's. */
const WINDUP = 8, LUNGE = 9, LUNGE_SPEED = 7.5, WHIFF = 22, REACH = 6;
/** How far ahead of him, as he lunges, he can still get hold of somebody. */
const LUNGE_REACH = 20;
/** A punch takes this much of him (whoever he is, about eight to finish him); each heals a little, the last a lot. */
const PUNCH_SHARE = 0.13, PUNCH_HEAL = 2, KILL_HEAL = 10, PUNCH_FRAMES = 7, PUNCH_GAP = 5;
// The shakedown
/** Thrown, it takes a modest share of him; slammed, a big one. */
const GRAB_REACH = 64, SHAKE_FRAMES = 44, SHAKE_AMMO = 3, THROW_SPEED = 24, THROW_SHARE = 0.15, SLAM_SHARE = 0.4, GRAB_MISS = 12;
/** How long Y can be held on its own and still count as a tap (its own button: secondary fire), let go of. */
const Y_TAP = 15;
/** How near together B (or X) and Y count as pressed together: frames B's held back, waiting for Y. */
const CHORD_WINDOW = 4;

/** The animals that are a handful but not too much. */
const MID_ANIMALS = new Set<EnemyKind>(['wolverine', 'goat', 'gator', 'coyote', 'pitbull']);
/** People who are behind something, up in something, or not there to be grabbed. */
const NOT_PEOPLE = new Set<EnemyKind>(['doorman', 'manhole', 'tenant', 'cardoor', 'jetskier', 'cower']);

export const grabbable = (e: Enemy) => e.type !== 'boss' && !isMidBoss(e) && e.health > 0 && !e.isBlownAway && !!e.kind
  && ((isHumanoidKind(e.kind) && !NOT_PEOPLE.has(e.kind)) || MID_ANIMALS.has(e.kind));

type Phase = 'idle' | 'windup' | 'lunge' | 'whiff' | 'mount' | 'kill' | 'reach' | 'shake' | 'miss';

export interface Grab {
  phase: Phase;
  t: number;
  dir: 1 | -1;
  held: Enemy | null;
  /** Frames into the punch being thrown (counts down), and when the next can start. */
  punchT: number;
  nextPunchAt: number;
  /** His health last frame (anything taking it off him breaks a grab). */
  hp: number;
  /** Y: how long it's been held, and whether it went into a grab while it was. */
  yHeld: number;
  yChord: boolean;
  /** B or X pressed without Y: held back a moment in case Y comes with it (pressed together, near enough). */
  pend: { k: 'b' | 'x'; t: number } | null;
  /** The controls last frame (to catch presses). */
  was: Controls;
  /** Shaken down already: nothing left in them. */
  shaken: WeakSet<Enemy>;
  /** Buttons still held from the grab (the last punch): they don't start a charge or a shot till they're let go. */
  gate: Set<keyof Controls>;
}

export const createGrab = (state: GameState): Grab => ({
  phase: 'idle', t: 0, dir: 1, held: null, punchT: 0, nextPunchAt: 0, hp: state.player.health, yHeld: 0, yChord: false, was: { ...NO_CONTROLS }, shaken: new WeakSet(), gate: new Set(), pend: null,
});

const feetY = (state: GameState) => state.player.pos.y + state.player.height;
const centerX = (state: GameState) => state.player.pos.x + state.player.width / 2;

/** Into the wall? (the lunge stops at one) */
const walled = (state: GameState, x: number) => {
  const p = state.player;
  return state.blocks.some(b => b.type === 'wall' && x < b.x + b.w && x + p.width > b.x && p.pos.y < b.y + b.h && p.pos.y + p.height > b.y);
};

/** Back on its feet in the world (let go of, still alive): a moment to get its wits back. */
const putBack = (state: GameState, e: Enemy, x: number) => {
  e.pos = { x: x - e.width / 2, y: feetY(state) - e.height };
  e.vel = { x: 0, y: 0 };
  e.rotation = 0;
  e.pauseTimer = Math.max(e.pauseTimer || 0, 26);
  state.enemies.push(e);
};

const GATED: (keyof Controls)[] = ['special', 'shoot', 'secondary', 'charge'];
const end = (state: GameState, g: Grab) => {
  g.phase = 'idle'; g.t = 0; g.held = null; g.punchT = 0;
  for (const k of GATED) g.gate.add(k);
  state.player.hidden = false;
};

/** Lets go of whoever he's got (he got hurt, or jumped off), alive. */
const letGo = (state: GameState, g: Grab) => {
  if (g.held) putBack(state, g.held, g.phase === 'mount' ? centerX(state) + g.dir * 18 : centerX(state) + g.dir * 30);
  end(state, g);
};

/** The nearest one he could get his hands on, in front of him, within `reach` of his front. */
const inReach = (state: GameState, dir: number, reach: number) => {
  const p = state.player;
  const front = dir > 0 ? p.pos.x + p.width : p.pos.x;
  let best: Enemy | null = null, bestD = Infinity;
  for (const e of state.enemies) {
    if (!grabbable(e)) continue;
    if (e.pos.y > p.pos.y + p.height || e.pos.y + e.height < p.pos.y) continue;
    const near = dir > 0 ? e.pos.x - front : front - (e.pos.x + e.width);
    if (near > reach || near < -(e.width + p.width)) continue;
    if (Math.abs(near) < bestD) { bestD = Math.abs(near); best = e; }
  }
  return best;
};

const take = (state: GameState, e: Enemy) => { state.enemies = state.enemies.filter(o => o !== e); };

/** Runs the grabs. Returns the controls the rest of him gets (none while he's busy). */
export const updateGrab = (ctx: FrameContext, g: Grab, controls: Controls): Controls => {
  const { state, fx } = ctx;
  const p = state.player;
  pollM2(state.frame);
  const was = g.was;
  g.was = controls;
  const hurt = p.health < g.hp;
  g.hp = p.health;
  const press = (k: keyof Controls) => !!controls[k] && !was[k];
  if (state.deathTimer > 0 || p.health <= 0) { if (g.phase !== 'idle') letGo(state, g); return controls; }
  g.t++;
  const hold = () => { p.vel.x = 0; return { ...NO_CONTROLS }; };

  switch (g.phase) {
    case 'idle': {
      // (whatever was being pressed as the grab ended, still held: nothing till it's let go)
      if (g.gate.size) {
        const c = { ...controls };
        for (const k of [...g.gate]) { if (controls[k]) c[k] = false as never; else g.gate.delete(k); }
        controls = c;
      }
      let out = controls;
      // Y on its own is a button of its own (secondary fire) on a tap; held, it's half of a grab
      const y = btn('y');
      let want: 'beat' | 'shake' | null = pressed('beatKey') ? 'beat' : pressed('shakeKey') ? 'shake' : null;
      // B or X first, on its own: held back a few frames for Y (a grab's two buttons are never quite together);
      // no Y, and it goes through as itself (its charge, its shot), a moment late
      if (!y && !g.pend) { if (pressed('b')) g.pend = { k: 'b', t: 0 }; else if (pressed('x')) g.pend = { k: 'x', t: 0 }; }
      if (g.pend) {
        const ctl = g.pend.k === 'b' ? 'special' : 'shoot';
        if (y) { if (!want) want = g.pend.k === 'b' ? 'beat' : 'shake'; g.pend = null; }
        else if (++g.pend.t > CHORD_WINDOW) { out = { ...out, [ctl]: true }; g.pend = null; }
        else out = { ...out, [ctl]: false };
      }
      // Y first (or both on the one frame), then B or X
      if (!want && y && pressed('b')) want = 'beat';
      if (!want && y && pressed('x')) want = 'shake';
      if (y) {
        g.yHeld++;
        out = { ...out, special: false, shoot: false, secondary: false };
      } else if (g.yHeld > 0) {
        if (!g.yChord && g.yHeld < Y_TAP) out = { ...out, secondary: true };
        g.yHeld = 0; g.yChord = false;
      }
      const free = p.isGrounded && !p.isCharging && !p.isSliding && !p.isUppercutting && !p.isDivekicking && !p.inCutscene && !p.swimming && !(p.pushbackTimer && p.pushbackTimer > 0);
      if (!want || !free) return out;
      if (y) g.yChord = true;
      g.dir = p.facing; g.t = 0;
      if (want === 'beat') {
        g.phase = 'windup';
        playSound('snort', 0.8, -4);
        return hold();
      }
      g.phase = 'reach';
      playSound('whoosh', 0.6, 3);
      return hold();
    }

    case 'reach': {
      // Hands out for his throat: committed (whatever hits him, he takes it, and keeps coming)
      if (g.t < REACH) return hold();
      const e = inReach(state, g.dir, GRAB_REACH);
      if (!e || g.shaken.has(e)) { g.phase = 'miss'; g.t = 0; playSound('whoosh', 0.5, 6); return hold(); }
      // Got him: up by the neck
      g.phase = 'shake'; g.t = 0; g.held = e; take(state, e); g.shaken.add(e);
      e.facing = (-g.dir) as 1 | -1;
      playSound('punch', 0.8, 4);
      return hold();
    }

    case 'windup':
      // Coiled up, committed and wide open: anything that hurts him now knocks him out of it
      if (hurt) { end(state, g); return controls; }
      if (g.t >= WINDUP) { g.phase = 'lunge'; g.t = 0; playSound('whoosh', 1, -2); }
      return hold();

    case 'lunge': {
      if (hurt) { end(state, g); return controls; }
      const nx = p.pos.x + g.dir * LUNGE_SPEED;
      if (!walled(state, nx)) p.pos.x = nx;
      const e = inReach(state, g.dir, LUNGE_REACH);
      if (e) {
        // Down he goes, Meathead on top of him
        g.phase = 'mount'; g.t = 0; g.held = e; take(state, e);
        g.nextPunchAt = 8; g.punchT = 0;
        p.pos.x = e.pos.x + e.width / 2 - p.width / 2;
        e.facing = (-g.dir) as 1 | -1;
        playSound('slam'); playSound('punch', 1.2, -3);
        shakeScreen(state, 8, 5);
        return hold();
      }
      if (g.t >= LUNGE) { g.phase = 'whiff'; g.t = 0; playSound('land', 0.8, -4); }
      return hold();
    }

    case 'whiff':
    case 'miss':
      if (hurt && g.phase === 'whiff') { end(state, g); return controls; }
      if (g.t >= (g.phase === 'whiff' ? WHIFF : GRAB_MISS)) end(state, g);
      return hold();

    case 'mount': {
      const e = g.held!;
      // Knocked off him (he gets up), or jumped off
      if (hurt) { letGo(state, g); return controls; }
      if (press('jump')) { letGo(state, g); return { ...controls, jump: true }; }
      if (g.punchT > 0) g.punchT--;
      if ((press('shoot') || press('special')) && g.t >= g.nextPunchAt) {
        g.punchT = PUNCH_FRAMES; g.nextPunchAt = g.t + PUNCH_GAP;
        const dmg = Math.max(7, Math.round(e.maxHealth * PUNCH_SHARE));
        e.health -= dmg;
        p.health = Math.min(INITIAL_PLAYER_HEALTH, p.health + PUNCH_HEAL); g.hp = p.health;
        const hx = e.pos.x + e.width / 2 + g.dir * 14, hy = feetY(state) - 8;
        fx.spawnDamageNumber({ x: hx, y: hy - 30 }, dmg);
        for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: hx, y: hy }, vel: { x: (Math.random() - 0.5) * 5, y: -2 - Math.random() * 4 }, life: 22, color: i % 2 ? '#8B0000' : '#B91C1C', size: 2 + Math.random() * 2 });
        playSound('punch', 0.9 + Math.random() * 0.3, Math.random() * 4 - 2);
        shakeScreen(state, 4, 3);
        if (e.health <= 0) {
          // Done: the rest of the health back, and him left lying there
          p.health = Math.min(INITIAL_PLAYER_HEALTH, p.health + KILL_HEAL); g.hp = p.health;
          e.pos = { x: e.pos.x, y: feetY(state) - e.height };
          state.enemies.push(e);
          fx.blowAwayEnemy(e, { x: g.dir * 1.5, y: -2 }, 'charge_kill', g.dir);
          fx.spawnKillCallout(e, grabCallout('beatdown'));
          fx.spawnDamageNumber({ x: centerX(state), y: p.pos.y - 20 }, `+${KILL_HEAL} HP`, true, '#4ADE80');
          playSound('crunch'); shakeScreen(state, 10, 6);
          g.held = null; g.phase = 'kill'; g.t = 0;
        }
      }
      return hold();
    }

    case 'kill':
      if (g.t >= 14) end(state, g);
      return hold();

    case 'shake': {
      // (nothing makes him let go: he takes whatever hits him and carries on shaking)
      const e = g.held!;
      if (g.t % 6 === 0) playSound('thud', 0.35, 6);
      if (g.t < SHAKE_FRAMES) return hold();
      // Shaken out: the ammo falls out of him
      for (let k = 0; k < SHAKE_AMMO; k++) {
        state.pickups.push({ id: `shake-${state.frame}-${k}`, pos: { x: centerX(state) + g.dir * 26 - 10, y: p.pos.y + 10 }, vel: { x: g.dir * (0.5 + k * 1.2), y: -3 - k }, width: 20, height: 20, type: 'small_ammo', life: 600 });
      }
      playSound('clink', 1, 2); playSound('clink', 0.8, 7);
      // ...and thrown whichever way's held (or slammed down), or straight on if nothing is
      const throwDir = controls.down ? 'down' : controls.up ? 'up' : controls.left ? 'left' : controls.right ? 'right' : g.dir > 0 ? 'right' : 'left';
      const dir = throwDir === 'left' ? -1 : throwDir === 'right' ? 1 : g.dir;
      p.facing = dir as 1 | -1;
      e.rotation = 0;
      if (throwDir === 'down') {
        // Slammed: into the floor right there, hard; nobody else gets a piece of it
        e.pos = { x: centerX(state) + g.dir * 26 - e.width / 2, y: feetY(state) - e.height };
        e.vel = { x: 0, y: 0 };
        const dmg = Math.max(20, Math.round(e.maxHealth * SLAM_SHARE));
        e.health -= dmg;
        state.enemies.push(e);
        playSound('slam'); playSound('crunch', 0.8); shakeScreen(state, 12, 7);
        for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: e.pos.x + e.width / 2, y: feetY(state) - 4 }, vel: { x: (Math.random() - 0.5) * 7, y: -1 - Math.random() * 3 }, life: 24, color: i % 2 ? '#8B0000' : '#A8A29E', size: 2 + Math.random() * 3 });
        if (e.health <= 0) { fx.blowAwayEnemy(e, { x: 0, y: -1 }, 'charge_kill', g.dir); fx.spawnKillCallout(e, grabCallout('slam')); }
        else { e.pauseTimer = 60; fx.spawnDamageNumber(e.pos, dmg, true); }
      } else {
        const v = throwDir === 'up' ? { x: g.dir * 3, y: -23 } : { x: dir * THROW_SPEED, y: -6 };
        e.pos = { x: centerX(state) + (throwDir === 'up' ? g.dir * 20 : dir * 24) - e.width / 2, y: p.pos.y - 16 };
        e.vel = { ...v };
        const dmg = Math.max(8, Math.round(e.maxHealth * THROW_SHARE));
        e.health -= dmg;
        state.enemies.push(e);
        playSound('whoosh', 1.2, -3);
        if (e.health <= 0) {
          fx.blowAwayEnemy(e, v, 'charge_kill', dir);
          e.meleeFlung = true;
          fx.spawnKillCallout(e, grabCallout(throwDir === 'up' ? 'launched' : 'thrown'));
        } else {
          e.pauseTimer = 45;
          e.chargedAt = state.frame;
          fx.spawnDamageNumber(e.pos, dmg);
        }
      }
      g.held = null; g.phase = 'kill'; g.t = 0;
      return hold();
    }
  }
};

/** Busy with a grab (the player's drawn by drawGrab, not the usual way)? */
export const grabbing = (g: Grab) => g.phase !== 'idle';

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------

/** An enemy drawn somewhere else than where it stands: its feet at (x, y), turned by `angle` about them. */
const drawEnemyAt = (ctx: Ctx, e: Enemy, state: GameState, x: number, y: number, angle: number) => {
  const pos = e.pos;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(angle);
  e.pos = { x: -e.width / 2, y: -e.height };
  try { drawKindEnemy(ctx, e, state); } finally { e.pos = pos; ctx.restore(); }
};

/** Meathead in one of the engine's own poses (crouched, charging, standing), drawn where he is. */
const asPose = (ctx: Ctx, state: GameState, pose: Partial<GameState['player']>, dx = 0) => {
  const p = state.player;
  const clone = { ...p, ...pose, hidden: false, pos: { x: p.pos.x + dx, y: p.pos.y } };
  drawPlayer(ctx, clone, state, { currentWeapon: p.currentWeapon as WeaponType, showFilthShield: false, invincibilityEnabled: false });
};

/** Draws him into a sprite (outlined, like the rest of him), feet at (x, y), facing `dir`. */
const sprite = (world: Ctx, x: number, y: number, dir: number, paint: (c: Ctx) => void) => {
  const s = beginSprite(world);
  const c = s ?? world;
  c.save();
  if (!s) c.translate(x, y);
  c.scale(dir, 1);
  paint(c);
  c.restore();
  if (s) endSprite(world, x, y);
};

const head = (c: Ctx, x: number, y: number, rot: number, mood: Mood, f: number) => { c.save(); c.translate(x, y); c.rotate(rot); drawHead(c, 0, 0, mood, f); c.restore(); };

/**
 * Ground and pound, MMA style: knees down either side of him (full mount), hips low on him, the off hand pinning his
 * chest, the other hand hammering down (`k` 0 cocked up by his ear .. 1 landed), his whole back behind it.
 */
const mountPose = (c: Ctx, f: number, k: number) => {
  drawLeg(c, [-5, -16], [-14, -4], [-26, -5], 1.4, true);
  drawLeg(c, [5, -16], [16, -4], [4, -3], 1.4, false);
  c.save(); c.translate(0, -16); c.rotate(0.42 + k * 0.16);
  drawArmTo(c, [-8, -22], [2, -10], [12, 0], true);
  drawTorsoFromHips(c);
  head(c, 6, -36, 0.3, k > 0.4 ? 'roar' : 'grit', f);
  const lerp = (a: number, b: number) => a + (b - a) * k;
  drawArmTo(c, [11, -22], [lerp(22, 24), lerp(-30, -8)], [lerp(8, 30), lerp(-42, 8)], false, 6);
  c.restore();
};

/** Feet planted wide, leaning back against the weight, both hands round his neck up high, shaking him. */
const shakePose = (c: Ctx, f: number, jig: number) => {
  drawLeg(c, [-5, -24], [-11, -12], [-15, 0], 0, true);
  drawLeg(c, [5, -24], [13, -12], [15, 0], 0, false);
  c.save(); c.translate(0, -24); c.rotate(-0.14);
  drawArmTo(c, [-8, -22], [10, -34 + jig], [27, -45 + jig], true);
  drawTorsoFromHips(c);
  head(c, 2, -37, -0.1, 'yell', f);
  drawArmTo(c, [11, -22], [22, -30 + jig], [31, -43 + jig], false, 6);
  c.restore();
};

/** Where the shake pose's hands are (round his neck), from his feet (facing right). */
const fistAt = (jig: number) => {
  const a = -0.14, x = 30, y = -44 + jig;
  return { x: x * Math.cos(a) - y * Math.sin(a), y: -24 + x * Math.sin(a) + y * Math.cos(a) };
};

/** The beatdown's windup: sunk low in a wrestler's shooting stance, back leg loaded, hands low, head down (`k` how far in). */
const coilPose = (c: Ctx, f: number, k: number) => {
  const drop = 4 + k * 6;
  drawLeg(c, [-5, -22 + drop], [-15, -10 + drop * 0.4], [-28, 0], 0.15, true);
  drawLeg(c, [5, -22 + drop], [16, -14 + drop * 0.5], [15, 0], 0, false);
  c.save(); c.translate(0, -22 + drop); c.rotate(0.55 + k * 0.2);
  drawArmTo(c, [-8, -22], [4, -8], [14, -12], true);
  drawTorsoFromHips(c);
  head(c, 7, -34, 0.4, 'scowl', f);
  drawArmTo(c, [11, -22], [20, -8], [27, -15], false, 6);
  c.restore();
};

/** The shakedown's windup: a step in, both hands open and out for the throat (`k` how far out). */
const reachPose = (c: Ctx, f: number, k: number) => {
  drawLeg(c, [-5, -24], [-10, -12], [-17, 0], 0, true);
  drawLeg(c, [5, -24], [15 + k * 3, -13], [19 + k * 4, 0], 0, false);
  c.save(); c.translate(0, -24); c.rotate(0.1 + k * 0.12);
  drawArmTo(c, [-8, -22], [9, -30], [24 + k * 8, -36], true, 4.5);
  drawTorsoFromHips(c);
  head(c, 4, -37, 0.05, 'yell', f);
  drawArmTo(c, [11, -22], [24, -28], [33 + k * 8, -34], false, 4.5);
  c.restore();
};

/** Draws whatever grab's on, in place of him (world space, over everything). */
export const drawGrab = (ctx: Ctx, state: GameState, g: Grab) => {
  if (g.phase === 'idle') return;
  const p = state.player, f = state.frame;
  p.hidden = true;
  const x = centerX(state), y = feetY(state);
  switch (g.phase) {
    case 'windup': {
      // Coiled down, shaking with it, steam coming off him
      const k = g.t / WINDUP;
      sprite(ctx, x + (f % 2 ? 1 : -1) * k * 1.5, y, g.dir, c => coilPose(c, f, k));
      if (f % 4 === 0) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 30, y: p.pos.y - 10 }, vel: { x: 0, y: -1.5 }, life: 20, color: 'rgba(240, 240, 240, 0.5)', size: 3 });
      if (k > 0.7 && f % 6 < 3) { ctx.fillStyle = '#FDE047'; ctx.font = '12px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('!', x, p.pos.y - 34); ctx.textAlign = 'left'; }
      return;
    }
    case 'lunge':
      asPose(ctx, state, { isCharging: true, facing: g.dir });
      return;
    case 'reach':
    case 'miss':
      // Hands going out for his throat (or closing on air, held there a moment)
      sprite(ctx, x, y, g.dir, c => reachPose(c, f, g.phase === 'miss' ? 1 : Math.min(1, g.t / REACH)));
      return;
    case 'whiff':
      // Face down where they were
      asPose(ctx, state, { isDucking: true, facing: g.dir });
      return;
    case 'mount':
    case 'kill': {
      const k = g.punchT > 0 ? Math.min(1, (PUNCH_FRAMES - g.punchT + 1) / 3) : 0;
      if (g.held) {
        // Flat on his back under him, head toward his punching hand; jolted by each one landing, squirming between
        const e = g.held, hit = g.punchT > 0 && k >= 1 ? 1 : 0;
        const squirm = Math.sin(f * 0.4) * 0.05 * (1 - hit);
        drawEnemyAt(ctx, e, state, x - g.dir * e.height * 0.45, y - 5 + hit * 2, g.dir * (Math.PI / 2 + hit * 0.12) + squirm);
      }
      sprite(ctx, x, y, g.dir, c => mountPose(c, f, g.phase === 'kill' ? 0.2 : k));
      return;
    }
    case 'shake': {
      const jig = Math.sin(g.t * 1.9) * 5;
      const fist = fistAt(jig);
      if (g.held) {
        // Held up by the neck, feet off the floor, swinging and kicking with the shaking
        // (a person by the throat; an animal by the scruff, its body out in front)
        const e = g.held, person = isHumanoidKind(e.kind), hd = person && e.kind ? kindHead(e.kind, e.variant) : null;
        const neck = hd ? -(hd.y + hd.r) : e.height * 0.7;
        // (him first, then the one he's holding: out in front of him, over his hands)
        sprite(ctx, x, y, g.dir, c => shakePose(c, f, jig));
        drawEnemyAt(ctx, e, state, x + g.dir * (fist.x + (person ? 4 : e.width * 0.3)), y + fist.y + neck, Math.sin(g.t * 1.9 + 0.8) * 0.18);
        return;
      }
      sprite(ctx, x, y, g.dir, c => shakePose(c, f, jig));
      return;
    }
  }
};
