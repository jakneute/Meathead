// The firing range: one screen, a floor, walls either side, Meathead with a weapon and infinite ammo, and two
// practice dummies that don't fight back and always come back. After a boss (to try out what he dropped), and from
// the garage (the practice range, everything he's got). The same place both times, dressed differently.
//
// The dummies are people. A wannabe boxer, who answered an ad, bouncing about in his headgear and his too-big
// gloves; and some idiot drifting about hanging off a bunch of party balloons. Nobody knows why. Nobody asked.

import { Enemy, GameStatus, WeaponType } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, WEAPON_RANGE_STAGE, createFullAmmo } from '../constants';
import { createGameState, GameState } from './core/state';
import { createFrameContext, GameEvents } from './core/context';
import { stepGame } from './core/update';
import type { Controls } from './platform/input';
import { stopDeathAnnouncer } from './platform/speech';
import { KILL_CALLOUTS, KillCallout } from '../content/dialogue';

const NO_EVENTS: GameEvents = {
  onBossDefeated: () => {}, onBossTransition: () => {}, onBossEncounter: () => {}, onBossDeath: () => {}, onIntroComplete: () => {},
};
const RANGE_CHEATS = { invincible: true, infiniteAmmo: true, infinitePower: false, skipToBoss: false };

let dummyCount = 0;
export type DummyKind = 'ground' | 'air';
export const DUMMY_KINDS: DummyKind[] = ['ground', 'air'];
/** The boxer walks back and forth; the balloon man drifts laps overhead. Neither fights back. */
export const makeDummy = (kind: DummyKind, x: number): Enemy => kind === 'ground'
  ? {
    id: `dummy-ground-${++dummyCount}`, pos: { x, y: GROUND_Y - 70 }, vel: { x: x > CANVAS_WIDTH / 2 ? -1.2 : 1.2, y: 0 },
    width: 50, height: 70, health: 200, maxHealth: 200, type: 'enemy', enemyType: 'tank', behavior: 'patrol',
    patrolRange: 260, initialX: Math.min(x, CANVAS_WIDTH - 330), shootTimer: 0, harmless: true,
  }
  : {
    id: `dummy-air-${++dummyCount}`, pos: { x, y: 330 }, vel: { x: x > CANVAS_WIDTH / 2 ? -2 : 2, y: 0 },
    width: 40, height: 30, health: 60, maxHealth: 60, type: 'enemy', enemyType: 'flyer', behavior: 'fly',
    patrolRange: 480, initialX: 160, shootTimer: 0, harmless: true,
  };

/** A range: the one screen, him with the weapon, the two dummies. */
export const createRange = (weapon: WeaponType, stageId = WEAPON_RANGE_STAGE, weapons?: WeaponType[]): GameState => {
  const s = createGameState(stageId, createFullAmmo());
  s.blocks = [
    { x: -100, y: -1000, w: 100, h: 2000, type: 'wall' },
    { x: CANVAS_WIDTH, y: -1000, w: 100, h: 2000, type: 'wall' },
    { x: 0, y: -200, w: CANVAS_WIDTH, h: 200, type: 'wall' },
    { x: -100, y: GROUND_Y, w: CANVAS_WIDTH + 200, h: 50, type: 'ground' },
  ];
  s.cameraMinX = 0;
  s.cameraMaxX = 0;
  s.doorState = 'done';
  s.player.pos = { x: 140, y: GROUND_Y - s.player.height };
  s.player.facing = 1;
  s.player.currentWeapon = weapon;
  if (weapons) s.availableWeapons = weapons;
  // (the oil rocket launcher's got the flamethrower on its own button: he has that by now, so it's here to try)
  else if (weapon === 'OIL_ROCKET') s.availableWeapons = ['GUN', 'FLAMETHROWER', 'OIL_ROCKET'];
  s.enemies = [makeDummy('ground', 560), makeDummy('air', 420)];
  s.frame = 1;
  return s;
};

/** Frames till a dummy that's gone comes back (per kind: 0, none gone). */
export type Respawns = Record<DummyKind, number>;
export const newRespawns = (): Respawns => ({ ground: 0, air: 0 });

/** One frame of the range: him (he can't die, or fall out of it), and the dummies coming back. */
export const stepRange = (range: GameState, controls: Controls, weapon: WeaponType, respawns: Respawns) => {
  const stageId = range.stageId ?? WEAPON_RANGE_STAGE;
  const ctx = createFrameContext(range, stageId, weapon, RANGE_CHEATS, NO_EVENTS);
  range.player.health = range.player.maxHealth;
  range.player.currentWeapon = weapon;
  const alive = new Set(range.enemies.filter(e => e.id.startsWith('dummy-') && e.health > 0 && !e.isBlownAway).map(e => e.id));
  // (what he was doing going in: a slide, a dive kick, an uppercut, a charge)
  const p = range.player;
  const move = p.isSliding ? 'slide' : p.isDivekicking ? 'divekick' : p.isUppercutting ? 'uppercut' : p.isCharging ? 'charge' : null;
  const before = { ...(range.killVoice?.callout ?? {}) };
  stepGame(ctx, GameStatus.PLAYING, controls);
  // A dummy down: what Meathead's got to say is about him (the boxer, or the balloon man), not the usual
  const downed = range.enemies.find(e => alive.has(e.id) && (e.health <= 0 || e.isBlownAway)) ?? (alive.size > range.enemies.filter(e => alive.has(e.id)).length
    ? { id: [...alive].find(id => !range.enemies.some(e => e.id === id)) ?? '' } : null);
  const kv = range.killVoice;
  // (who it was goes with the kill; what it was done with stays what it was)
  if (downed && kv?.quip) kv.quip.kind = downed.id.startsWith('dummy-air') ? 'dummy-balloon' : 'dummy-boxer';
  // Dropped with the handgun or with his own body: the big callout's one of theirs
  // (a move that started this very frame and landed: going by what he's doing now)
  const moveNow = move ?? (p.isSliding ? 'slide' : p.isDivekicking ? 'divekick' : p.isUppercutting ? 'uppercut' : p.isCharging ? 'charge' : null);
  const how = kv?.quip?.at === range.frame ? (kv.quip.category === 'gun_kill' ? 'gun' : kv.quip.category === 'charge_kill' || kv.quip.category === 'uppercut_kill' ? moveNow : null) : null;
  if (downed && how) ringCallout(range, downed.id.startsWith('dummy-air') ? `sky_${how}` as KillCallout : `ring_${how}` as KillCallout, downed.id, before.at);
  // Fell out somehow: put him back
  if (range.player.pos.y > CANVAS_HEIGHT + 200 || range.deathTimer > 0) {
    if (range.deathTimer > 0) stopDeathAnnouncer();
    range.deathTimer = 0;
    range.player.pos = { x: 140, y: GROUND_Y - range.player.height };
    range.player.vel = { x: 0, y: 0 };
  }
  // Both dummies always come back (the other side of the ring from him)
  for (const kind of DUMMY_KINDS) {
    if (range.enemies.some(e => e.id.startsWith(`dummy-${kind}`) && !e.isBlownAway && e.health > 0)) continue;
    if (respawns[kind] <= 0) respawns[kind] = 55;
    else if (--respawns[kind] === 0) {
      const x = range.player.pos.x < CANVAS_WIDTH / 2 ? CANVAS_WIDTH - 130 : 80;
      const d = makeDummy(kind, x);
      range.enemies.push(d);
      for (let i = 0; i < 14; i++) range.particles.push({ pos: { x: x + d.width / 2, y: d.pos.y + d.height / 2 }, vel: { x: (Math.random() - 0.5) * 6, y: -Math.random() * 5 }, life: 25, color: i % 2 ? '#EF4444' : '#FFFFFF', size: 3 + Math.random() * 4 });
    }
  }
};

/** A dummy's own callout: over the one the kill already put up this frame (if it did), else a new one over him. */
const ringCallout = (range: GameState, kind: KillCallout, id: string, beforeAt?: number) => {
  const { lines, color } = KILL_CALLOUTS[kind];
  const text = lines[Math.floor(Math.random() * lines.length)];
  const kv = (range.killVoice ??= {});
  const fresh = kv.callout && kv.callout.at === range.frame && beforeAt !== range.frame;
  if (fresh) {
    const shown = range.damageNumbers.find(n => n.isCallout && n.text === kv.callout!.text);
    if (shown) { shown.text = text; shown.color = color; }
    kv.callout = { text, at: range.frame };
    return;
  }
  kv.callout = { text, at: range.frame };
  const e = range.enemies.find(x => x.id === id);
  const at = e ? { x: e.pos.x + e.width / 2, y: e.pos.y - 10 } : { x: range.player.pos.x + 60, y: range.player.pos.y - 20 };
  range.damageNumbers.push({ id: `callout-${Date.now()}-${Math.random()}`, text, pos: at, vel: { x: (Math.random() - 0.5) * 1.5, y: -3 }, life: 75, maxLife: 75, isCritical: true, isCallout: true, color });
};
