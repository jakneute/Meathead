// The gym while it's being played: the pencil necks room by room, what to do to the ones in the room he's in (the
// lesson, shown as a button prompt for as long as there's anybody there to do it to), their nervous last words, and
// at the end, the doors opening and the bigger fellas walking in. Rebuilt with the level on every (re)spawn; the
// checkpoint says which rooms are behind him.

import { deathByCause } from '../../core/deathCause';
import type { GameState } from '../../core/state';
import type { FrameContext } from '../../core/context';
import type { Controls } from '../../platform/input';
import { NO_CONTROLS } from '../../platform/input';
import { makeKindEnemy } from '../../enemies/kinds';
import { CANVAS_WIDTH, GROUND_Y } from '../../../constants';
import { COURSE, CP, Room, WALL_X, WALL_W, RAT_HOLES } from './course';
import { Talk, createTalk, updateTalk, queueLines, quiet, hush } from './script';
import { isShat } from '../../player/gut';

/** What to do to the ones in front of him (the button prompt that's up), or nothing. */
export type Lesson = 'move' | 'fire' | 'charge' | 'push' | 'slide' | 'uppercut' | 'divekick' | 'shield';

export type GymPhase = 'play' | 'arrive' | 'fade' | 'done';

/** One of the bigger fellas: walking in from the doors to where he stops. */
export interface BigFella { x: number; to: number; delay: number }

export interface GymRuntime {
  startedAt: number;
  talk: Talk;
  phase: GymPhase;
  t: number;
  /** The pencil necks (and rats) in each room, by id. */
  rooms: Record<Room, string[]>;
  /** Which rooms' nervous lines have been said. */
  said: Set<Room>;
  /** Who's saying the line that's on (the bubble goes over him): an enemy's id. */
  speaker: string | null;
  /** He's moved off his spot (the first prompt goes once he has). */
  moved: boolean;
  spawnX: number;
  lesson: Lesson | null;
  /** The lesson last told to the game (so it's only told when it changes). */
  told: Lesson | null | undefined;
  /** The doors at the end, opening (0 shut .. 1 open), and the two of them walking in. */
  doors: number;
  bigFellas: BigFella[];
  /** The rooms whose lot have turned up (see COURSE.arrivals). */
  arrived: Set<Room>;
  /** Who's still to turn up, where and when (frames): rats out of the mouse holes, pencil necks down through the ceiling
   * onto the racks. Each gives itself away a moment before (TELEGRAPH): eyes in the hole, a ceiling tile rattling. */
  due: { kind: 'rat' | 'drop'; x: number; y: number; at: number }[];
  /** The one behind the mat: shots that have hit it (counted once each), when Meathead last called it, when the announcer last said NOT YET. */
  matShots: number;
  shotIds: Set<string>;
  saidShots: number;
  notYetAt: number;
}

export const getGym = (state: GameState) => state.stage as GymRuntime | null;

/** Nothing's placed closer than this ahead of where he starts after a checkpoint. */
const SPAWN_CLEARANCE = 220;
/** On (re)spawning, how long nothing starts an attack on him (frames): time to get his bearings. */
const SPAWN_GRACE = 150;
/** The fade out at the end (frames), before the cutscene takes over. */
export const FADE_FRAMES = 50;

export const createGymRuntime = (state: GameState): GymRuntime => {
  const startedAt = state.checkpoint;
  const start = COURSE.checkpoints[startedAt];
  const rooms: Record<Room, string[]> = { free: [], cardio: [], wall: [], benches: [], racks: [], mezzanine: [], lockers: [] };
  for (const s of COURSE.spawns) {
    // (a room that turns up later is put in when he gets there: see arrive)
    if (COURSE.arrivals[s.room] !== undefined) continue;
    if (startedAt > CP.START && s.x - start.x < SPAWN_CLEARANCE) continue;
    const e = makeKindEnemy(s.kind, s.x, s.y);
    state.enemies.push(e);
    rooms[s.room].push(e.id);
  }
  for (const x of COURSE.dummies) if (!(startedAt > CP.START && x < start.x)) state.enemies.push(makeKindEnemy('bob', x, GROUND_Y));
  COURSE.pickups.forEach((p, i) => {
    if (startedAt > CP.START && p.x < start.x) return;
    state.pickups.push({ id: `gym-pickup-${i}`, pos: { x: p.x - 10, y: p.y - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: p.type, life: 1e9 });
  });
  state.cameraMinX = COURSE.x1;
  state.cameraMaxX = COURSE.x2 - CANVAS_WIDTH;
  const rt: GymRuntime = {
    startedAt, talk: createTalk(), phase: 'play', t: 0, rooms, said: new Set(), speaker: null,
    moved: startedAt > CP.START, spawnX: NaN, lesson: null, told: undefined, doors: 0,
    bigFellas: [{ x: COURSE.doors, to: COURSE.doors - 190, delay: 0 }, { x: COURSE.doors, to: COURSE.doors - 120, delay: 26 }],
    matShots: 0, shotIds: new Set(), saidShots: -999, notYetAt: -999, arrived: new Set(), due: [],
  };
  return rt;
};

/**
 * A room's lot turning up: the rats running out of the hole in the wall one after another (see ratsDue), the
 * ones for the racks dropping in through the ceiling tiles onto them (a tile knocked out, the dust and bits of it coming
 * down with them).
 */
const arrive = (ctx: FrameContext, rt: GymRuntime, room: Room) => {
  const { state, fx } = ctx;
  rt.arrived.add(room);
  // (the rats out of the mouse holes, a hole at a time, one after another; the ones for the racks down through the
  // ceiling, one rack then the other: each a moment after it's given itself away)
  const lot = COURSE.spawns.filter(s => s.room === room);
  lot.forEach((s, i) => rt.due.push(room === 'benches'
    ? { kind: 'rat', x: RAT_HOLES[i % RAT_HOLES.length], y: GROUND_Y, at: state.frame + TELEGRAPH + i * 26 }
    : { kind: 'drop', x: s.x, y: s.y, at: state.frame + TELEGRAPH + i * 34 }));
  void fx;
};

/** How long anybody gives himself away before he turns up (frames). */
export const TELEGRAPH = 45;

/** Someone turning up, when his time's come: a rat out of its hole (plaster dust), a pencil neck down through a ceiling tile. */
const turnUp = (ctx: FrameContext, rt: GymRuntime, d: GymRuntime['due'][number]) => {
  const { state, fx } = ctx;
  if (d.kind === 'rat') {
    const e = makeKindEnemy('rat', d.x, GROUND_Y);
    e.seen = true; e.facing = -1; e.vel.x = -3;
    state.enemies.push(e); rt.rooms.benches.push(e.id);
    for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: d.x + (Math.random() - 0.5) * 16, y: GROUND_Y - 6 }, vel: { x: -Math.random() * 2, y: -Math.random() * 1.5 }, life: 20, color: '#D6D3D1', size: 2 + Math.random() * 3 });
    return;
  }
  // (from up in the ceiling: the tile knocked out, and he falls the rest of the way onto the rack)
  const e = makeKindEnemy('suit', d.x, d.y);
  e.seen = true; e.pos.y = 72 - e.height * 0.4; e.vel = { x: 0, y: 1 };
  state.enemies.push(e); rt.rooms.racks.push(e.id);
  for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: d.x + (Math.random() - 0.5) * 50, y: 66 }, vel: { x: (Math.random() - 0.5) * 3, y: 1 + Math.random() * 3 }, life: 50 + Math.random() * 30, color: i % 3 ? '#8A8473' : '#B8B2A0', size: 2 + Math.random() * 5 });
  fx.playGunSound('crack', 0.6);
};

/** Is anybody in this room still up? */
const alive = (state: GameState, rt: GymRuntime, room: Room) => rt.rooms[room].some(id => state.enemies.some(e => e.id === id && e.health > 0 && !e.isBlownAway));

/** The pencil necks' nervous lines, as he comes into each room: said by one of them that's still up. */
const ROOM_LINES: Partial<Record<Room, string>> = {
  free: "HE'S GETTING UP! HE'S GETTING UP!",
  wall: "DON'T HURT ME! I'M JUST AN INTERN! I'M NOT EVEN PAID!",
  cardio: 'EVERYBODY RUSH HIM AT ONCE! HE CAN\'T GET ALL OF US!',
  racks: "HE CAN'T REACH US UP HERE! ...CAN HE?",
  mezzanine: 'STAY TOGETHER! STRENGTH IN NUMBERS!',
  lockers: 'THE BRIEFCASES WILL PROTECT US! THEY\'RE GOVERNMENT ISSUE!',
};
/** The same, when he's shit himself (they're still coming: it's the job). */
const ROOM_LINES_SHAT: typeof ROOM_LINES = {
  free: "HE'S GETTING UP! HE'S... OH GOD, HE SHIT HIMSELF!",
  wall: "DON'T HURT ME! I'M JUST AN INTERN! I'M NOT PAID ENOUGH FOR THIS SMELL!",
  cardio: "EVERYBODY RUSH HIM AT ONCE! HOLD YOUR BREATH! HE CAN'T GET ALL OF US!",
  racks: "HE CAN'T REACH US UP HERE! ...BUT THE SMELL CAN!",
  mezzanine: 'STAY TOGETHER! STAY UPWIND!',
  lockers: "THE BRIEFCASES WILL PROTECT US! HOLD THEM OVER YOUR NOSES!",
};

export const updateGym = (ctx: FrameContext, controls: Controls): Controls => {
  const rt = getGym(ctx.state);
  if (!rt) return controls;
  const { state } = ctx;
  const p = state.player;
  const px = p.pos.x + p.width / 2;
  updateTalk(state, rt.talk);
  if (quiet(rt.talk)) rt.speaker = null;
  rt.t++;
  // (just (re)spawned: nobody comes at him, or shoots, for a moment; he's not in harm's way the moment he's up)
  if (rt.phase === 'play' && rt.t <= SPAWN_GRACE) state.gapGrace = Math.max(state.gapGrace || 0, SPAWN_GRACE - rt.t);

  standDummiesUp(state);
  updateCowerer(ctx, rt);
  if (rt.phase === 'play') {
    if (Number.isNaN(rt.spawnX)) rt.spawnX = px;
    if (Math.abs(px - rt.spawnX) > 140) rt.moved = true;
    // (checkpoints, on the ground past them)
    if (p.isGrounded) for (const cp of [CP.RATS, CP.MEZZANINE] as const) if (state.checkpoint < cp && px >= COURSE.checkpoints[cp].x) state.checkpoint = cp;
    // Their nervous lines, as he comes in
    for (const room of Object.keys(ROOM_LINES) as Room[]) {
      if (rt.said.has(room) || px < COURSE.rooms[room] - 120 || !alive(state, rt, room)) continue;
      rt.said.add(room);
      const who = rt.rooms[room].map(id => state.enemies.find(e => e.id === id && e.health > 0)).find(Boolean);
      if (who && quiet(rt.talk)) { queueLines(state, rt.talk, [{ who: 'intern', text: (isShat(state) ? ROOM_LINES_SHAT : ROOM_LINES)[room]! }], room === 'free' ? 20 : 0); rt.speaker = who.id; }
    }
    // (the rooms that turn up as he gets to them)
    for (const room of Object.keys(COURSE.arrivals) as Room[]) if (!rt.arrived.has(room) && px >= COURSE.arrivals[room]!) arrive(ctx, rt, room);
    // (whoever's due, when his time comes; and the dust coming down off a ceiling tile that's about to go)
    for (const d of rt.due) if (d.kind === 'drop' && d.at - state.frame < TELEGRAPH && state.frame % 5 === 0) state.particles.push({ pos: { x: d.x + (Math.random() - 0.5) * 40, y: 70 }, vel: { x: 0, y: 0.6 + Math.random() }, life: 60, color: '#B8B2A0', size: 1.5 + Math.random() * 2 });
    rt.due = rt.due.filter(d => { if (state.frame < d.at) return true; turnUp(ctx, rt, d); return false; });
    rt.lesson = lessonFor(state, rt, px);
    // The end: him at the doors, with the last lot (down off the mezzanine, and by the doors) all done. Nobody further
    // back has to be dead for that: whoever's left back there is cleared off for the scene
    if (px >= COURSE.doors - 90 && p.isGrounded && !alive(state, rt, 'mezzanine') && !alive(state, rt, 'lockers')) startArrival(ctx, rt);
  }
  if (rt.lesson !== rt.told) { rt.told = rt.lesson; ctx.events.onTutorialHint?.(rt.lesson); }
  if (rt.phase === 'play') return controls;
  return updateEnding(ctx, rt);
};

/**
 * The striking dummies: whatever's done to one, it's back up the next moment (its health topped back up, rocked back on
 * its base and standing up again where it stood), so he can bounce off it, or charge it, as long as he likes.
 */
const standDummiesUp = (state: GameState) => {
  for (const e of state.enemies) {
    if (e.kind !== 'bob') continue;
    if (e.health < e.maxHealth) {
      e.health = e.maxHealth; e.aiTimer = 40;
      // (a dive kick off it bounces him back up behind it, not on past it: a dive kick comes down on a slant, so from up
      // there the next one lands right back on it, and the one after that, as long as he likes)
      const p = state.player;
      if (!p.isGrounded && p.pos.y + p.height < e.pos.y + 20) {
        p.vel.x = 0;
        const want = (e.homeX ?? e.pos.x) + e.width / 2 - p.width / 2 - p.facing * 52;
        p.pos.x += (want - p.pos.x) * 0.7;
      }
    }
    else if ((e.aiTimer || 0) > 0) e.aiTimer = (e.aiTimer || 0) - 1;
    e.isBlownAway = false;
    const home = e.homeX ?? e.pos.x;
    e.pos.x += (home - e.pos.x) * 0.25; e.vel.x = 0;
  }
};

/** Meathead, after enough shots into the mat (he works it out, out loud, every so often while he keeps at it). */
const MAT_SHOTS_LINES = [
  "BULLETS AREN'T DOING ANYTHING. HE'S HIDING BEHIND A MAT.",
  'STOP SHOOTING THE MAT, MEATHEAD. SHOVE HIM.',
  'THAT MAT IS BULLETPROOF? WHAT KIND OF GYM IS THIS?',
  "OKAY. NO MORE GUN. TIME FOR SHOULDER.",
];
/** Shots into the mat before he says something, and the least time between his saying it (frames). */
const MAT_SHOTS_EVERY = 5, MAT_SHOTS_GAP = 300;
/** How long he takes to scramble round behind his mat when you get round him (frames). */
const COWER_TURN = 16;
/** Between the announcer's NOT YETs (frames). */
const NOT_YET_GAP = 70;

/**
 * The one behind the mat: nothing hurts him (his health topped back up whatever's done to him) but the shove into the
 * wall (that kills him outright: see shieldShove), or a dive kick down on him over his mat. An uppercut or a slide on
 * him: NOT YET, says the announcer. And
 * the shots that go into his mat get counted, and Meathead says something about it.
 */
const updateCowerer = (ctx: FrameContext, rt: GymRuntime) => {
  const { state, fx } = ctx;
  const p = state.player;
  for (const e of state.enemies) {
    if (e.kind !== 'cower' || e.health <= 0 || e.isBlownAway) continue;
    // (and wherever anything's left him: on the floor, on this side of the half-wall; only the shove into it moves him there)
    if (e.pos.y + e.height > GROUND_Y) { e.pos.y = GROUND_Y - e.height; e.vel.y = 0; }
    if (e.pos.x + e.width > WALL_X && e.pos.x < WALL_X + WALL_W) e.pos.x = WALL_X - e.width;
    // (he doesn't skid on: still the moment nothing's shoving him)
    if (!(e.shovedAt !== undefined && state.frame - e.shovedAt < 2)) e.vel.x = 0;
    // (jump over him and he scrambles round behind his mat to keep it between you, a moment later; not while he's being shoved)
    const side = p.pos.x + p.width / 2 < e.pos.x + e.width / 2 ? -1 : 1;
    if (side !== (e.facing === 1 ? 1 : -1) && !(e.shovedAt !== undefined && state.frame - e.shovedAt < 10)) {
      e.aiTimer = (e.aiTimer || 0) + 1;
      if (e.aiTimer >= COWER_TURN) { e.facing = side; e.aiTimer = 0; }
    } else e.aiTimer = 0;
    if (e.health < e.maxHealth) {
      e.health = e.maxHealth;
      // A dive kick, down on him from over the top of his mat: that does him (driven into the floor, like anyone)
      if ((p.diveKickHitIds ?? []).includes(e.id)) {
        e.isBlownAway = true; e.meleeFlung = true;
        e.vel = { x: p.facing * 8, y: 18 };
        fx.spawnDeathShower(e.pos, p.facing, 2.5);
        fx.spawnExplosion(e.pos, '#8B0000', 16, 0, 12);
        fx.spawnKillCallout(e, 'divekick');
        fx.speakVulgarity('charge_kill', undefined, false, e.kind);
        continue;
      }
      if ((p.isUppercutting || p.isSliding) && state.frame - rt.notYetAt > NOT_YET_GAP) {
        rt.notYetAt = state.frame;
        fx.spawnDamageNumber({ x: e.pos.x - 10, y: e.pos.y - 20 }, 'NOT YET!', true, '#F8FAFC');
        fx.announceKill('NOT YET!');
      }
    }
    // (shots into the mat, each counted the once)
    const box = { x: e.pos.x - 16, y: e.pos.y - 8, w: e.width + 32, h: e.height + 8 };
    for (const q of state.projectiles) {
      if (q.owner !== 'player' || rt.shotIds.has(q.id)) continue;
      if (q.pos.x + q.width < box.x || q.pos.x > box.x + box.w || q.pos.y + q.height < box.y || q.pos.y > box.y + box.h) continue;
      rt.shotIds.add(q.id); rt.matShots++;
    }
    if (rt.matShots >= MAT_SHOTS_EVERY && state.frame - rt.saidShots > MAT_SHOTS_GAP && quiet(rt.talk)) {
      rt.saidShots = state.frame; rt.matShots = 0;
      queueLines(state, rt.talk, [{ who: 'meathead', text: MAT_SHOTS_LINES[Math.floor(Math.random() * MAT_SHOTS_LINES.length)] }]);
    }
  }
};

/** A shot into the one behind the mat from anywhere but in front (over him, behind him): it just goes into the mat. */
export const hitCowerer = (ctx: FrameContext, e: { kind?: string; pos: { x: number; y: number }; width: number }): boolean | undefined => {
  if (e.kind !== 'cower') return undefined;
  ctx.fx.spawnExplosion({ x: e.pos.x + e.width / 2, y: e.pos.y + 10 }, '#93C5FD', 5, 0, 6);
  return true;
};

/** Is he near a striking dummy (it's there to practise the dive kick on)? */
const byDummy = (px: number) => COURSE.dummies.some(x => Math.abs(px - x) < 320);

/** What to do to the ones in front of him, by the room he's in (for as long as there's anybody in it to do it to). */
const lessonFor = (state: GameState, rt: GymRuntime, px: number): Lesson | null => {
  const R = COURSE.rooms;
  if (!rt.moved) return 'move';
  if (px < R.cardio && alive(state, rt, 'free')) return 'fire';
  if (px >= R.cardio - 100 && px < R.benches && alive(state, rt, 'cardio')) return 'charge';
  if (px >= R.wall - 200 && px < R.benches && alive(state, rt, 'wall')) return 'push';
  if (px >= R.benches - 100 && px < R.racks && alive(state, rt, 'benches')) return 'slide';
  if (px >= R.racks - 100 && px < R.mezzanine && alive(state, rt, 'racks')) return 'uppercut';
  // (and still, at the doors, while any of the mezzanine lot are left: they're what's keeping the doors shut)
  if (px >= R.mezzanine - 40 && (px < R.lockers ? alive(state, rt, 'mezzanine') || byDummy(px) : alive(state, rt, 'mezzanine') && !alive(state, rt, 'lockers'))) return 'divekick';
  if (px >= R.lockers - 100 && alive(state, rt, 'lockers')) return 'shield';
  return null;
};

/** The doors swing open and the bigger fellas walk in. */
const startArrival = (ctx: FrameContext, rt: GymRuntime) => {
  const { state } = ctx;
  rt.phase = 'arrive'; rt.t = 0; rt.lesson = null;
  hush(state, rt.talk);
  // (whatever's left behind him, the rats under the benches: the scene's not about them)
  state.enemies = state.enemies.filter(e => e.type === 'boss');
  state.projectiles = [];
  state.player.inCutscene = true;
};

const updateEnding = (ctx: FrameContext, rt: GymRuntime): Controls => {
  const { state, fx } = ctx;
  const p = state.player;
  p.invincibilityTimer = Math.max(p.invincibilityTimer, 2);
  if (rt.phase === 'arrive') {
    if (rt.t === 12) fx.playGunSound('land', 0.6);
    rt.doors = Math.min(1, Math.max(0, (rt.t - 10) / 24));
    for (const b of rt.bigFellas) if (rt.t > 34 + b.delay) b.x = Math.max(b.to, b.x - 1.6);
    // (he turns round to look at them)
    p.facing = 1;
    // Sizing them up: something he hasn't seen all morning. Necks.
    if (rt.t === 150) queueLines(state, rt.talk, [{ who: 'meathead', text: '...NOW THOSE ARE NECKS.' }]);
    if (rt.t > 170 && quiet(rt.talk)) { rt.phase = 'fade'; rt.t = 0; }
  } else if (rt.phase === 'fade') {
    if (rt.t >= FADE_FRAMES) { rt.phase = 'done'; ctx.events.onStageDone?.(); }
  }
  return { ...NO_CONTROLS };
};

/** How black the screen is at the end (0..1). */
export const fadeAmount = (rt: GymRuntime) => (rt.phase === 'fade' ? Math.min(1, rt.t / FADE_FRAMES) : rt.phase === 'done' ? 1 : 0);

/** What killed him, in so many words (anything the pencil necks manage is a disgrace). */
export const gymDeathMessage = (ctx: FrameContext): string | undefined => {
  const rt = getGym(ctx.state);
  if (!rt) return undefined;
  const pick = (a: string[]) => a[Math.floor(Math.random() * a.length)];
  const cause = deathByCause(ctx.state);
  if (cause) return cause;
  return pick(['KILLED BY INTERNS', 'THE PENCIL NECKS WON', 'DIED ON CHEST DAY', 'SKIPPED THE REST OF CHEST DAY']);
};
