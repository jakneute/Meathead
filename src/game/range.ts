// The firing range: one screen, a floor, walls either side, Meathead with a weapon and infinite ammo, and two
// practice dummies that don't fight back and always come back. After a boss (to try out what he dropped), and from
// the garage (the practice range, everything he's got). The same place both times, dressed differently.
//
// The dummies are people. A wannabe boxer, who answered an ad, bouncing about in his headgear and his too-big
// gloves; and some idiot drifting about hanging off a bunch of party balloons. Nobody knows why. Nobody asked.

import { Enemy, GameStatus, WeaponType } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, WEAPON_RANGE_STAGE, createFullAmmo, RING_CEILING_Y, RING_FLOOR_Y, PRACTICE_RANGE_STAGE } from '../constants';
import { createGameState, GameState } from './core/state';
import { createFrameContext, GameEvents } from './core/context';
import { stepGame } from './core/update';
import type { Controls } from './platform/input';
import { NO_CONTROLS } from './platform/input';
import { stopDeathAnnouncer } from './platform/speech';
import { KILL_CALLOUTS, KillCallout } from '../content/dialogue';
import { isShat } from './player/gut';
import { say, isTalking, Voice } from './platform/speech';

const NO_EVENTS: GameEvents = {
  onBossDefeated: () => {}, onBossTransition: () => {}, onBossEncounter: () => {}, onBossDeath: () => {}, onIntroComplete: () => {},
};
const RANGE_CHEATS = { invincible: true, infiniteAmmo: true, infinitePower: false, skipToBoss: false };

let dummyCount = 0;
export type DummyKind = 'ground' | 'air';
export const DUMMY_KINDS: DummyKind[] = ['ground', 'air'];
/** The boxer walks back and forth; the balloon man drifts laps overhead. Neither fights back. */
/** Where a range's floor is: the ring's mat, up off the bottom of the screen, or the plain range's. */
const floorOf = (stageId: string | null) => (stageId === PRACTICE_RANGE_STAGE ? RING_FLOOR_Y : GROUND_Y);

export const makeDummy = (kind: DummyKind, x: number, floor = GROUND_Y): Enemy => kind === 'ground'
  ? {
    id: `dummy-ground-${++dummyCount}`, pos: { x, y: floor - 70 }, vel: { x: x > CANVAS_WIDTH / 2 ? -1.2 : 1.2, y: 0 },
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
    // (the ceiling: the gym's, down under the writing across the top, in the ring; the top of the screen elsewhere)
    { x: 0, y: (stageId === PRACTICE_RANGE_STAGE ? RING_CEILING_Y : 0) - 200, w: CANVAS_WIDTH, h: 200, type: 'wall' },
    { x: -100, y: floorOf(stageId), w: CANVAS_WIDTH + 200, h: CANVAS_HEIGHT, type: 'ground' },
  ];
  s.cameraMinX = 0;
  s.cameraMaxX = 0;
  s.doorState = 'done';
  s.player.pos = { x: 140, y: floorOf(stageId) - s.player.height };
  // (the floor's line, for blood landing on it)
  if (stageId === PRACTICE_RANGE_STAGE) s.groundRuns = [{ x1: -100, y1: RING_FLOOR_Y, x2: CANVAS_WIDTH + 100, y2: RING_FLOOR_Y }];
  s.player.facing = 1;
  s.player.currentWeapon = weapon;
  if (weapons) s.availableWeapons = weapons;
  // (the oil rocket launcher's got the flamethrower on its own button: he has that by now, so it's here to try)
  else if (weapon === 'OIL_ROCKET') s.availableWeapons = ['GUN', 'FLAMETHROWER', 'OIL_ROCKET'];
  s.enemies = [makeDummy('ground', 560, floorOf(stageId)), makeDummy('air', 420)];
  s.frame = 1;
  return s;
};

/** Frames till a dummy that's gone comes back (per kind: 0, none gone); and, once he's shit himself in here, how long since. */
export type Respawns = Record<DummyKind, number> & {
  cancelled?: number;
  /** When each of them said his piece and set off (frames into it), and when the announcer called it off. */
  boxerGo?: number; balloonGo?: number; calledAt?: number;
};

const BOXER_VOICE: Voice = { id: 'boxer', pitch: 0.9, rate: 1.05 };
const BALLOON_VOICE: Voice = { id: 'balloon', pitch: 1.3, rate: 1.1 };
export const newRespawns = (): Respawns => ({ ground: 0, air: 0 });

/** Shit himself in here: the hired help walk out (the boxer runs for it, the balloon man lets himself float off), and
 * once the announcer's done with CODE BROWN and Meathead's had his say, training's called off; a bit after that, it's over. */
const CANCEL_CALL = 170, CANCEL_END = 160;
/** If their lines never get said (the speech is off), they go anyway after this long. */
const LEAVE_ANYWAY = 300;

/** What one of them says on his way out: up over him, and in his voice (queued behind whoever's talking). */
const leaveLine = (range: GameState, respawns: Respawns, kind: DummyKind, text: string) => {
  say(text, kind === 'ground' ? BOXER_VOICE : BALLOON_VOICE, 'queue', {
    always: true,
    onShow: () => {
      const t = respawns.cancelled ?? 0;
      if (kind === 'ground') respawns.boxerGo ??= t; else respawns.balloonGo ??= t;
      const e = range.enemies.find(q => q.id.startsWith(`dummy-${kind}`));
      const at = e ? { x: e.pos.x + e.width / 2, y: e.pos.y - 14 } : { x: kind === 'ground' ? CANVAS_WIDTH - 140 : CANVAS_WIDTH / 2, y: 120 };
      range.damageNumbers.push({ id: `callout-${range.frame}-${kind}-leave`, text, pos: at, vel: { x: 0, y: -0.5 }, life: 150, maxLife: 150, isCritical: false, isCallout: true, color: '#F8FAFC' });
    },
    onHide: () => {},
  });
};

/** One frame of the range: him (he can't die, or fall out of it), and the dummies coming back. True: it's over (training's been cancelled). */
export const stepRange = (range: GameState, controls: Controls, weapon: WeaponType, respawns: Respawns): boolean => {
  const stageId = range.stageId ?? WEAPON_RANGE_STAGE;
  const ctx = createFrameContext(range, stageId, weapon, RANGE_CHEATS, NO_EVENTS);
  range.player.health = range.player.maxHealth;
  range.player.currentWeapon = weapon;
  const alive = new Set(range.enemies.filter(e => e.id.startsWith('dummy-') && e.health > 0 && !e.isBlownAway).map(e => e.id));
  // (what he was doing going in: a slide, a dive kick, an uppercut, a charge)
  const p = range.player;
  const move = p.isSliding ? 'slide' : p.isDivekicking ? 'divekick' : p.isUppercutting ? 'uppercut' : p.isCharging ? 'charge' : null;
  const before = { ...(range.killVoice?.callout ?? {}) };
  // (shit himself: training's over, and he's stood there in it: no moving, no shooting, nothing)
  stepGame(ctx, GameStatus.PLAYING, isShat(range) ? { ...NO_CONTROLS } : controls);
  // A dummy down: what Meathead's got to say is about him (the boxer, or the balloon man), not the usual
  // (gone because they walked out, not because he got them: no callout for that)
  const downed = respawns.cancelled !== undefined ? null : range.enemies.find(e => alive.has(e.id) && (e.health <= 0 || e.isBlownAway)) ?? (alive.size > range.enemies.filter(e => alive.has(e.id)).length
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
    range.player.pos = { x: 140, y: floorOf(range.stageId) - range.player.height };
    range.player.vel = { x: 0, y: 0 };
  }
  // He's shit himself: they're off, and nobody's coming back
  if (isShat(range)) {
    const t = respawns.cancelled = (respawns.cancelled ?? -1) + 1;
    // (their parting words, after CODE BROWN and whatever Meathead's got to say about it)
    if (t === 0) {
      leaveLine(range, respawns, 'ground', "NOPE! NOPE! I DIDN'T SIGN UP TO SPAR WITH THAT! I'M OUT!");
      leaveLine(range, respawns, 'air', 'LET GO, LET GO, LET GO! UP! UP AND AWAY FROM THAT SMELL!');
    }
    if (t >= LEAVE_ANYWAY) { respawns.boxerGo ??= t; respawns.balloonGo ??= t; }
    // (the walls come down for them to go out through: him, he's kept in)
    if (t === 0) range.blocks = range.blocks.filter(b => b.type !== 'wall' || b.h < 2000);
    range.player.pos.x = Math.max(0, Math.min(CANVAS_WIDTH - range.player.width, range.player.pos.x));
    const px = range.player.pos.x + range.player.width / 2;
    for (const e of range.enemies) {
      if (!e.id.startsWith('dummy-') || e.health <= 0 || e.isBlownAway) continue;
      e.pauseTimer = Math.max(e.pauseTimer || 0, 3);
      e.harmless = true;
      const away = e.pos.x + e.width / 2 < px ? -1 : 1;
      // (moved by hand here, not by their AI; which way they're going is which way they face)
      e.vel = { x: away * 0.01, y: 0 };
      if (e.id.startsWith('dummy-ground')) {
        // (the boxer: stood there taking in the smell till he's said his piece, then off out of it, flat out, the far side from him)
        if (respawns.boxerGo !== undefined) e.pos.x += away * Math.min(7, (t - respawns.boxerGo) * 0.4);
      } else {
        // (the balloon man: holds on to the floor till he's said his, then lets go, up and away, kicking his legs)
        if (respawns.balloonGo !== undefined) { const u = t - respawns.balloonGo; e.pos.y -= Math.min(3.5, 0.6 + u * 0.05); e.pos.x += away * 0.8; }
      }
    }
    range.enemies = range.enemies.filter(e => !e.id.startsWith('dummy-') || (e.pos.x > -120 && e.pos.x < CANVAS_WIDTH + 120 && e.pos.y + e.height > 4));
    // Called off once they're both gone and everybody's done talking
    const gone = !range.enemies.some(e => e.id.startsWith('dummy-') && e.health > 0 && !e.isBlownAway);
    if (respawns.calledAt === undefined && t >= CANCEL_CALL && gone && (!isTalking() || t >= LEAVE_ANYWAY + 240)) {
      respawns.calledAt = t;
      ctx.fx.announceKill('TRAINING IS CANCELED');
      range.damageNumbers.push({ id: `callout-${range.frame}-cancel`, text: 'TRAINING IS CANCELED', pos: { x: CANVAS_WIDTH / 2, y: 260 }, vel: { x: 0, y: -0.6 }, life: 150, maxLife: 150, isCritical: true, isCallout: true, color: '#8B5A2B' });
    }
    return respawns.calledAt !== undefined && t >= respawns.calledAt + CANCEL_END;
  }
  // Both dummies always come back (the other side of the ring from him)
  for (const kind of DUMMY_KINDS) {
    if (range.enemies.some(e => e.id.startsWith(`dummy-${kind}`) && !e.isBlownAway && e.health > 0)) continue;
    if (respawns[kind] <= 0) respawns[kind] = 55;
    else if (--respawns[kind] === 0) {
      const x = range.player.pos.x < CANVAS_WIDTH / 2 ? CANVAS_WIDTH - 130 : 80;
      const d = makeDummy(kind, x, floorOf(range.stageId));
      range.enemies.push(d);
      for (let i = 0; i < 14; i++) range.particles.push({ pos: { x: x + d.width / 2, y: d.pos.y + d.height / 2 }, vel: { x: (Math.random() - 0.5) * 6, y: -Math.random() * 5 }, life: 25, color: i % 2 ? '#EF4444' : '#FFFFFF', size: 3 + Math.random() * 4 });
    }
  }
  return false;
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
