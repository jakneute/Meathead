// Inside the hurricane: a spiral of junk (planks, doors, car roofs, a sofa, a
// fridge, trampolines) whirling up round the eye wall. It's laid out flat, one
// lap of the storm wide, and the renderer wraps it round a cylinder so it turns
// as you go round (the Castlevania Bloodlines tower trick). Walk off one edge of
// the lap and you're back at the other: everything's shifted by a lap so it's
// seamless. Some of the junk orbits round on its own; sharks circle.
//
// At the top, a flash of lightning, and you're up at the Eye.

import type { Block } from '../../../types';
import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import { makeKindEnemy } from '../../enemies/kinds';
import { playSound } from '../../platform/audio';
import { shakeScreen } from '../../core/state';
import { killPlayer } from '../../player/player';
import { COURSE, CP } from './course';

export interface TowerRun {
  /** Each platform's three copies (a lap left, here, a lap right), and where it's got to round the lap. */
  copies: Block[][];
  u: number[];
  /** Transition up to the Eye: frames of the flash (0 = not started). */
  exitT: number;
  /** The churning storm rising up the tower under him (its top, world y), and frames he's been in the tower. */
  riseY: number;
  inT: number;
  /** Frames of him being ripped away by the storm (0 = not). */
  suckT: number;
}

/** The storm rising under you: its speed, how much faster it comes if it's far behind, and how far behind that is. */
const RISE_SPEED = 0.6, RISE_CATCHUP = 0.01, RISE_SLACK = 520;
/** It starts just under the floor you land on, its crest showing at the bottom of the screen, and gives you a second to see it. */
const RISE_START = 60, RISE_GRACE = 60;
/** It's rising: CLIMB! (how long that's up for) */
export const RISE_WARNING = 200;
const SUCK_FRAMES = 36;

const T = COURSE.tower;

export const inTower = (x: number) => x > T.x0 - T.circumference * 1.5 && x < T.x0 + T.circumference * 2.5;

export const createTowerRun = (state: GameState, startedAt: number): TowerRun => {
  // The floor of the storm (a ring of wreckage you start on), three laps wide
  state.blocks.push({ x: T.x0 - T.circumference, y: T.floorY, w: T.circumference * 3, h: 60, type: 'ground', hidden: true, tag: 'tower-floor' });
  const copies = T.plats.map((p, i) => [-1, 0, 1].map((k): Block => ({
    x: T.x0 + p.u + k * T.circumference, y: p.y, w: p.w, h: 14, type: 'platform', hidden: true, oneWay: true, tag: p.bounce ? `awning-t${i}` : `tower-${i}`,
  })));
  copies.forEach(c => state.blocks.push(...c));
  if (startedAt <= CP.TOWER) {
    // Sharks circling, and a few supplies stuck in the junk
    for (const s of T.sharks) state.enemies.push(makeKindEnemy('shark', T.x0 + s.u, s.y));
    T.pickups.forEach((p, i) => state.pickups.push({ id: `tower-pickup-${i}`, pos: { x: T.x0 + p.u - 10, y: p.y - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: p.type, life: 1e9 }));
  }
  return { copies, u: T.plats.map(p => p.u), exitT: 0, riseY: T.floorY + RISE_START, inT: 0, suckT: 0 };
};

/** Shift everything in the tower a lap sideways (walking off one side of the lap onto the other). */
const shiftLap = (state: GameState, dx: number) => {
  const { player } = state;
  player.pos.x += dx;
  state.camera.x += dx;
  const inside = (x: number) => inTower(x);
  for (const e of state.enemies) {
    if (!inside(e.pos.x)) continue;
    e.pos.x += dx; e.initialX += dx;
    if (e.homeX !== undefined) e.homeX += dx;
    if (e.aiX !== undefined) e.aiX += dx;
  }
  for (const p of state.projectiles) if (inside(p.pos.x)) p.pos.x += dx;
  for (const p of state.particles) if (inside(p.pos.x)) p.pos.x += dx;
  for (const p of state.pickups) if (inside(p.pos.x)) p.pos.x += dx;
  for (const d of state.damageNumbers) if (inside(d.pos.x)) d.pos.x += dx;
  for (const d of state.enemyDeaths) if (inside(d.x)) d.x += dx;
};

/** Runs the climb. Calls onTop when he's made it up to the Eye. */
export const updateTower = (ctx: FrameContext, tr: TowerRun, onTop: () => void) => {
  const { state } = ctx;
  const { player } = state;
  // (the flash carries on after he's up there)
  if (tr.exitT > 0) {
    tr.exitT++;
    if (tr.exitT === 26) onTop();
  }
  if (!inTower(player.pos.x)) return;
  // Round the lap
  const cx = player.pos.x + player.width / 2;
  if (cx < T.x0) shiftLap(state, T.circumference);
  else if (cx > T.x0 + T.circumference) shiftLap(state, -T.circumference);
  // The orbiting junk drifts round, carrying you with it
  T.plats.forEach((p, i) => {
    if (!p.orbit) return;
    const dx = p.orbit;
    tr.u[i] = (tr.u[i] + dx + T.circumference) % T.circumference;
    const main = tr.copies[i][1];
    const onIt = player.isGrounded && player.pos.x + player.width > main.x && player.pos.x < main.x + main.w && Math.abs(player.pos.y + player.height - main.y) < 3;
    const onAny = tr.copies[i].some(b => player.isGrounded && player.pos.x + player.width > b.x && player.pos.x < b.x + b.w && Math.abs(player.pos.y + player.height - b.y) < 3);
    tr.copies[i].forEach((b, k) => { b.x = T.x0 + tr.u[i] + (k - 1) * T.circumference; });
    if (onIt || onAny) player.pos.x += dx;
  });
  // The sharks are always on the lap nearest him: where one's seen round the storm is where it really is (so your shots
  // find it, and it doesn't have a whole lap to swim to get at you)
  for (const e of state.enemies) {
    if (e.kind !== 'shark' || e.health <= 0 || e.isBlownAway) continue;
    const laps = Math.round((e.pos.x + e.width / 2 - (player.pos.x + player.width / 2)) / T.circumference);
    if (!laps) continue;
    const dx = -laps * T.circumference;
    e.pos.x += dx; e.initialX += dx;
    if (e.homeX !== undefined) e.homeX += dx;
    if (e.aiX !== undefined) e.aiX += dx;
  }
  // A shark the storm catches up with is swallowed by it and whirled away (that, or you shoot it: nothing else kills them up here)
  for (const e of state.enemies) {
    if (e.kind !== 'shark' || e.isBlownAway || e.health <= 0 || e.pos.y + e.height / 2 < tr.riseY) continue;
    e.health = 0; e.isBlownAway = true; e.vel = { x: -12, y: -9 }; e.rotation = 0;
  }
  // Swirling spray whipping round
  if (state.frame % 3 === 0) state.particles.push({ pos: { x: state.camera.x + Math.random() * 800, y: state.camera.y + Math.random() * 600 }, vel: { x: -6 - Math.random() * 4, y: 1 + Math.random() }, life: 30, color: 'rgba(200, 220, 240, 0.6)', size: 2 });
  // The storm rising up the tower under him once he's started climbing (quicker if it's fallen far behind)
  const feet = player.pos.y + player.height;
  tr.inT++;
  if (tr.inT === RISE_GRACE) { playSound('thunder'); shakeScreen(state, 30, 4); }
  if (tr.inT > RISE_GRACE && tr.exitT === 0 && tr.suckT === 0) tr.riseY -= RISE_SPEED + Math.max(0, tr.riseY - feet - RISE_SLACK) * RISE_CATCHUP;
  // It's caught him: the wind tears him off the junk and up into the storm
  if (tr.suckT === 0 && tr.exitT === 0 && state.deathTimer <= 0 && player.pos.y + player.height / 2 > tr.riseY) {
    tr.suckT = 1;
    playSound('thunder');
    shakeScreen(state, 20, 6);
  }
  if (tr.suckT > 0 && state.deathTimer <= 0) {
    tr.suckT++;
    // Whipped round and up, faster and faster
    player.vel.x = -10 - tr.suckT * 0.3;
    player.vel.y = -4 - tr.suckT * 0.5;
    player.facing = Math.floor(tr.suckT / 4) % 2 ? 1 : -1;
    player.invincibilityTimer = 0;
    for (let k = 0; k < 3; k++) state.particles.push({ pos: { x: player.pos.x + Math.random() * player.width, y: player.pos.y + Math.random() * player.height }, vel: { x: -8 - Math.random() * 6, y: -3 - Math.random() * 4 }, life: 22, color: 'rgba(226, 232, 240, 0.8)', size: 3 });
    if (tr.suckT >= SUCK_FRAMES) {
      const lines = ['SUCKED UP INTO THE STORM', 'GONE WITH THE WIND', 'CATEGORY 5 DEATH', "THERE'S NO PLACE LIKE HOME"];
      killPlayer(ctx, lines[Math.floor(Math.random() * lines.length)]);
    }
  }
  // Made it to the top: lightning, and you're up at the Eye
  if (tr.exitT === 0 && player.isGrounded && player.pos.y + player.height <= T.topY + 110) {
    tr.exitT = 1;
    playSound('thunder');
    shakeScreen(state, 30, 8);
  }
  if (tr.exitT > 0) player.invincibilityTimer = Math.max(player.invincibilityTimer, 2);
};

/** The flash that covers the jump up to the Eye (0..1). */
export const towerFlash = (tr: TowerRun) => (tr.exitT <= 0 ? 0 : tr.exitT < 26 ? tr.exitT / 26 : Math.max(0, 1 - (tr.exitT - 26) / 30));

export const TOWER = T;
