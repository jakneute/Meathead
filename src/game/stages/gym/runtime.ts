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
import { CANVAS_WIDTH } from '../../../constants';
import { COURSE, CP, Room } from './course';
import { Talk, createTalk, updateTalk, queueLines, quiet, hush } from './script';

/** What to do to the ones in front of him (the button prompt that's up), or nothing. */
export type Lesson = 'move' | 'fire' | 'charge' | 'slide' | 'uppercut' | 'divekick' | 'shield';

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
}

export const getGym = (state: GameState) => state.stage as GymRuntime | null;

/** Nothing's placed closer than this ahead of where he starts after a checkpoint. */
const SPAWN_CLEARANCE = 380;
/** The fade out at the end (frames), before the cutscene takes over. */
export const FADE_FRAMES = 50;

export const createGymRuntime = (state: GameState): GymRuntime => {
  const startedAt = state.checkpoint;
  const start = COURSE.checkpoints[startedAt];
  const rooms: Record<Room, string[]> = { free: [], cardio: [], benches: [], racks: [], mezzanine: [], lockers: [] };
  for (const s of COURSE.spawns) {
    if (startedAt > CP.START && s.x - start.x < SPAWN_CLEARANCE) continue;
    const e = makeKindEnemy(s.kind, s.x, s.y);
    state.enemies.push(e);
    rooms[s.room].push(e.id);
  }
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
  };
  return rt;
};

/** Is anybody in this room still up? */
const alive = (state: GameState, rt: GymRuntime, room: Room) => rt.rooms[room].some(id => state.enemies.some(e => e.id === id && e.health > 0 && !e.isBlownAway));

/** The pencil necks' nervous lines, as he comes into each room: said by one of them that's still up. */
const ROOM_LINES: Partial<Record<Room, string>> = {
  free: "HE'S GETTING UP! HE'S GETTING UP!",
  cardio: 'EVERYBODY RUSH HIM AT ONCE! HE CAN\'T GET ALL OF US!',
  racks: "HE CAN'T REACH US UP HERE! ...CAN HE?",
  mezzanine: 'STAY TOGETHER! STRENGTH IN NUMBERS!',
  lockers: 'THE BRIEFCASES WILL PROTECT US! THEY\'RE GOVERNMENT ISSUE!',
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
      if (who && quiet(rt.talk)) { queueLines(state, rt.talk, [{ who: 'intern', text: ROOM_LINES[room]! }], room === 'free' ? 20 : 0); rt.speaker = who.id; }
    }
    rt.lesson = lessonFor(state, rt, px);
    // The end: the last of them down, and him at the doors
    const left = (['mezzanine', 'lockers'] as Room[]).some(r => alive(state, rt, r));
    if (!left && px >= COURSE.rooms.lockers - 40 && p.isGrounded) startArrival(ctx, rt);
  }
  if (rt.lesson !== rt.told) { rt.told = rt.lesson; ctx.events.onTutorialHint?.(rt.lesson); }
  if (rt.phase === 'play') return controls;
  return updateEnding(ctx, rt);
};

/** What to do to the ones in front of him, by the room he's in (for as long as there's anybody in it to do it to). */
const lessonFor = (state: GameState, rt: GymRuntime, px: number): Lesson | null => {
  const R = COURSE.rooms;
  if (!rt.moved) return 'move';
  if (px < R.cardio && alive(state, rt, 'free')) return 'fire';
  if (px >= R.cardio - 100 && px < R.benches && alive(state, rt, 'cardio')) return 'charge';
  if (px >= R.benches - 100 && px < R.racks && alive(state, rt, 'benches')) return 'slide';
  if (px >= R.racks - 100 && px < R.mezzanine && alive(state, rt, 'racks')) return 'uppercut';
  if (px >= R.mezzanine - 40 && px < R.lockers && alive(state, rt, 'mezzanine')) return 'divekick';
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
