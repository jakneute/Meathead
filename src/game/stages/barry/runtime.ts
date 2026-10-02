// Barry's stage while it's being played: which place you're in, the steam grates,
// the New Yorkers' opinions of you, the ways from one place to the next (the
// revolving doors, the elevator that never stops where it should, the stairs up
// to the roof, the door at the top of the fire escape), the power room, and the
// ride down afterwards. Rebuilt with the level on every (re)spawn; the checkpoint
// says what's behind you.

import { deathByCause } from '../../core/deathCause';
import type { GameState } from '../../core/state';
import type { FrameContext } from '../../core/context';
import type { Controls } from '../../platform/input';
import { NO_CONTROLS } from '../../platform/input';
import type { Enemy } from '../../../types';
import { makeKindEnemy } from '../../enemies/kinds';
import { CANVAS_WIDTH, GROUND_Y } from '../../../constants';
import { playSound } from '../../platform/audio';
import { say, MEATHEAD_VOICE } from '../../platform/speech';
import { shakeScreen } from '../../core/state';
import { COURSE, CP, Place, placeOf, placeIndex, roomOf, Room } from './course';
import { Talk, createTalk, updateTalk, hush, queueLines, replaceLines } from './script';
import { Dumpster, inTheAlley, startDumpster } from './dumpster';
import type { Rip } from './hyper';
import { makeTenants } from './climb';
import { PowerRoom, createPower, enterPower, updatePower } from './power';
import { ROOM_ZOOM } from './lighting';

const Y = GROUND_Y;

/** Going from one place to the next: a fade (through doors, up the stairs), or the elevator. */
export interface Transit {
  kind: 'fade' | 'elevator';
  t: number;
  /** The checkpoint it takes you to (where you come out). */
  to: number;
  /** For the elevator: the floor you're leaving, the one it (rudely) stops at, and what he's got to say about it. */
  from?: string; floor?: string; quip?: string;
}

/** The ride down on Barry's man: frames in, and (once you've hit the street) the slide along it. */
export interface Surf { t: number; phase: 'air' | 'slide' | 'up'; x: number; v: number }

export interface Bark { id: string; text: string; t: number }

export interface BarryRuntime {
  startedAt: number;
  talk: Talk;
  transit: Transit | null;
  power: PowerRoom;
  surf: Surf | null;
  barks: Bark[];
  barked: Set<string>;
  lastBark: number;
  said: Set<string>;
  /** Down the alley into the dumpster: the death scene playing (see dumpster.ts). */
  dumpster: Dumpster | null;
  /** A test subject on hypermode got him: torn in half (see hyper.ts). */
  rip: Rip | null;
}

export const getBarry = (state: GameState) => state.stage as BarryRuntime | null;

/** Nothing's placed closer than this ahead of where you start. */
const SPAWN_CLEARANCE = 480;

/** Where each checkpoint is (for the transits: where you come out). */
const at = (cp: number) => COURSE.checkpoints[cp];

export const createBarryRuntime = (state: GameState, skipToBoss: boolean): BarryRuntime => {
  const startedAt = skipToBoss ? CP.LANDING : state.checkpoint;
  const start = at(startedAt);
  const startIndex = placeIndex(start.x);
  const ahead = (x: number, clearance: number) => placeIndex(x) > startIndex || (placeIndex(x) === startIndex && x - start.x >= clearance);
  COURSE.pickups.forEach((p, i) => {
    if (!ahead(p.x, 0)) return;
    state.pickups.push({ id: `barry-pickup-${i}`, pos: { x: p.x - 10, y: p.y - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: p.type, life: 1e9 });
  });
  for (const s of COURSE.spawns) {
    if (!ahead(s.x, SPAWN_CLEARANCE)) continue;
    const e = makeKindEnemy(s.kind, s.x, s.y);
    if (s.variant !== undefined) e.variant = s.variant;
    state.enemies.push(e);
  }
  // The tenants in their windows (up to the climb)
  if (startedAt <= CP.CLIMB2) state.enemies.push(...makeTenants());
  const rt: BarryRuntime = {
    startedAt, talk: createTalk(), transit: null, power: createPower(), surf: null,
    barks: [], barked: new Set(), lastBark: -999, said: new Set(), dumpster: null, rip: null,
  };
  applyPlaceCamera(state, placeOf(start.x));
  return rt;
};

/** Where the camera's allowed in each place. */
export const applyPlaceCamera = (state: GameState, place: Place) => {
  const room = roomOf(place);
  if (room) {
    // (the view's pushed in indoors, so the camera has to go further to keep the end walls on screen)
    const half = CANVAS_WIDTH / 2, seen = half / ROOM_ZOOM;
    state.cameraMinX = room.x1 - 30 - half + seen; state.cameraMaxX = room.x2 + 30 - half - seen;
    return;
  }
  if (place === 'streets') { state.cameraMinX = COURSE.streets.x1; state.cameraMaxX = COURSE.streets.x2 - CANVAS_WIDTH; }
  else if (place === 'roofs') { state.cameraMinX = COURSE.roofs.x1; state.cameraMaxX = COURSE.climb.x2 + 80 - CANVAS_WIDTH; }
  else { state.cameraMinX = COURSE.landing.x1; state.cameraMaxX = undefined; }
};

export const updateBarry = (ctx: FrameContext, controls: Controls): Controls => {
  const rt = getBarry(ctx.state);
  if (!rt) return controls;
  const { state } = ctx;
  const p = state.player;
  updateTalk(state, rt.talk);
  updateBarks(state, rt);
  if (rt.transit) return updateTransit(ctx, rt);
  if (rt.surf) return updateSurf(ctx, rt);
  const place = placeOf(p.pos.x);
  checkpoints(state, rt);
  updateVents(ctx);
  switch (place) {
    case 'streets':
      if (p.pos.x + p.width / 2 >= COURSE.streets.doors && p.isGrounded) startFade(state, rt, CP.LOBBY);
      break;
    case 'lobby': case 'office': case 'maintenance': {
      const el = COURSE.elevators.find(v => roomOf(place) && v.x > roomOf(place)!.x1 && v.x < roomOf(place)!.x2)!;
      if (p.pos.x + p.width / 2 >= el.x && p.isGrounded) startElevator(state, rt, place, el.room);
      break;
    }
    case 'lab':
      if (p.pos.x + p.width / 2 >= COURSE.roofAccess && p.isGrounded) startFade(state, rt, CP.ROOFS);
      break;
    case 'roofs':
      // Off into the alley between the walk-ups: the dumpster
      if (!rt.dumpster && state.deathTimer <= 0 && inTheAlley(state)) { rt.dumpster = startDumpster(ctx); break; }
      // The door up at the top of the fire escape
      if (p.pos.y + p.height <= COURSE.climb.top + 4 && p.isGrounded && Math.abs(p.pos.x + p.width / 2 - COURSE.climb.door) < 40) startFade(state, rt, CP.POWER);
      break;
    case 'power': {
      if (rt.power.phase === 'waiting') enterPower(ctx, rt.power, rt.talk);
      controls = updatePower(ctx, rt.power, rt.talk, controls);
      // (in the water with it going through him, the stage draws him)
      p.hidden = rt.power.phase === 'surge';
      if (rt.power.phase === 'done') startSurf(state, rt);
      break;
    }
    case 'landing': break;
  }
  return controls;
};

const checkpoints = (state: GameState, rt: BarryRuntime) => {
  const p = state.player;
  if (!p.isGrounded) return;
  if (state.checkpoint < CP.AVENUE && p.pos.x >= at(CP.AVENUE).x && placeOf(p.pos.x) === 'streets') state.checkpoint = CP.AVENUE;
  if (state.checkpoint < CP.CLIMB && p.pos.x >= at(CP.CLIMB).x && placeOf(p.pos.x) === 'roofs') state.checkpoint = CP.CLIMB;
  // (how high these apartment buildings go: he notices)
  const lookUp = (key: string, text: string) => { if (!rt.said.has(key)) { rt.said.add(key); queueLines(state, rt.talk, [{ who: 'meathead', text }]); } };
  if (placeOf(p.pos.x) === 'roofs' && p.isGrounded) {
    const up = GROUND_Y - (p.pos.y + p.height);
    if (up > 1050 && p.pos.x < COURSE.climb.buildings[0].x2) lookUp('b1roof', "THE ROOF. FINALLY. ...OH COME ON, THAT ONE'S TALLER.");
    if (p.pos.x >= COURSE.climb.buildings[1].x1 && up > 1500) lookUp('b2mid', 'HOW HIGH DO THESE APARTMENTS EVEN GO?!');
    if (p.pos.x >= COURSE.climb.buildings[1].x1 && up > 1950) lookUp('b2high', 'WHO LIVES UP HERE? BIRDS? RICH BIRDS?');
  }
  // (across onto the second walk-up)
  if (state.checkpoint < CP.CLIMB2 && p.isGrounded && p.pos.x >= COURSE.climb.ledge.x1 && p.pos.y + p.height <= at(CP.CLIMB2).y + 4 && placeOf(p.pos.x) === 'roofs') state.checkpoint = CP.CLIMB2;
};

// ---------------------------------------------------------------------------
// The steam grates
// ---------------------------------------------------------------------------

/** How long a grate blasts for, and how long it hisses beforehand (the warning). */
export const VENT_BLAST = 34, VENT_WARN = 40;
/** How hard it throws you up (a bit more than a porch roof in Dale's town). */
const VENT_LAUNCH = 18.5;

/** Where a grate is in its cycle: 'blast', 'warn' or 'idle'. */
export const ventState = (v: { every: number; offset: number }, frame: number) => {
  const t = ((frame + v.offset) % v.every + v.every) % v.every;
  return t < VENT_BLAST ? 'blast' : t >= v.every - VENT_WARN ? 'warn' : 'idle';
};

const updateVents = (ctx: FrameContext) => {
  const { state } = ctx;
  const p = state.player;
  for (const v of COURSE.vents) {
    if (Math.abs(v.x - p.pos.x) > 600) continue;
    if (ventState(v, state.frame) !== 'blast') continue;
    const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
    if (cx > v.x - 12 && cx < v.x + v.w + 12 && feet > Y - 30 && feet <= Y + 2 && p.vel.y >= 0) {
      p.vel.y = -VENT_LAUNCH; p.isGrounded = false;
      p.coyoteAirTimer = 0; p.coyoteJumpTimer = 0; p.jumpHoldTimer = 0;
      p.pos.y -= 3;
      p.squash = -1;
      playSound('jump');
    }
    // (and anything else standing on it goes up too)
    for (const e of state.enemies) {
      if (e.health <= 0 || e.isBlownAway || e.enemyType === 'flyer' || e.kind === 'tenant') continue;
      const ex = e.pos.x + e.width / 2, ef = e.pos.y + e.height;
      if (ex > v.x && ex < v.x + v.w && Math.abs(ef - Y) < 3) { e.vel.y = -VENT_LAUNCH * 0.8; e.pos.y -= 3; }
    }
  }
};

// ---------------------------------------------------------------------------
// New Yorkers, sharing their opinions of you
// ---------------------------------------------------------------------------

const BARKS: Partial<Record<string, string[]>> = {
  pimp: ['YOU LOOKIN\' AT MY GIRLS?', 'PAY UP OR GET LOST, MUSCLES!'],
  hooker: ['YOU CAN\'T AFFORD THIS, SWEETIE!', 'MOVE IT, MEATBALL!'],
  mugger: ['GIMME YOUR WALLET!', 'NICE SHOES. GIMME \'EM.'],
  bum: ['SPARE SOME CHANGE?! NO?! THEN DIE!', 'THIS IS MY CORNER!'],
  guard: ['SIR! SIR! YOU NEED A VISITOR BADGE!', 'SIGN IN OR GET SHOT!'],
  commuter: ['EYES UP, PAL!', 'OUTTA MY WAY, I GOT A TRAIN!'],
  reader: ['DO YOU MIND? I\'M READING!', 'FUHGEDDABOUDIT!'],
  exec: ['YOU\'RE NOT ON MY CALENDAR!', 'I\'LL HAVE YOUR JOB! WHAT\'S YOUR JOB?'],
  intern: ['I\'M UNPAID AND I\'M ANGRY!', 'IS THIS A TEAM BUILDING THING?!'],
  hr: ['LET\'S CIRCLE BACK TO YOU DYING!', 'THIS IS A HOSTILE WORKPLACE! I\'M THE HOSTILE!'],
  exterminator: ['FOUND THE BIG ROACH!', 'HOLD STILL, BUG!'],
  janitor: ['I JUST MOPPED THAT!', 'YOU TRACKED MUD IN HERE!'],
  custodian: ['CAN\'T YOU READ THE SIGN?!', 'WET FLOOR! WET FLOOR!'],
  labtech: ['THE SPECIMEN\'S LOOSE!', 'HE\'S NOT IN THE CONTROL GROUP!'],
  scientist: ['YOU\'LL CONTAMINATE THE SAMPLES!', 'FOR SCIENCE!'],
  subject: ['HNNNNNGH!', 'PROTEIN... MORE... PROTEIN...'],
};
/** How long a bark's up, the least between two, and how close before they bother. */
const BARK_FOR = 100, BARK_GAP = 80, BARK_RANGE = 420;

const updateBarks = (state: GameState, rt: BarryRuntime) => {
  rt.barks = rt.barks.filter(b => ++b.t < BARK_FOR && state.enemies.some(e => e.id === b.id && e.health > 0 && !e.isBlownAway));
  if (state.frame - rt.lastBark < BARK_GAP || rt.transit || rt.surf) return;
  const p = state.player;
  for (const e of state.enemies) {
    const pool = e.kind && BARKS[e.kind];
    if (!pool || rt.barked.has(e.id) || e.health <= 0 || e.isBlownAway) continue;
    if (Math.abs(e.pos.x - p.pos.x) > BARK_RANGE || Math.abs(e.pos.y - p.pos.y) > 200) continue;
    rt.barked.add(e.id);
    if (Math.random() < 0.35) continue;
    rt.barks.push({ id: e.id, text: pool[Math.floor(Math.random() * pool.length)], t: 0 });
    rt.lastBark = state.frame;
    return;
  }
};

// ---------------------------------------------------------------------------
// From one place to the next
// ---------------------------------------------------------------------------

/** The fade: frames to black, and back. */
export const FADE = 30;
/** The elevator: doors shutting, the ride, the ding, the doors opening. */
export const DOORS = 48, RIDE = 200, OPEN = 48;

const startFade = (state: GameState, rt: BarryRuntime, to: number) => { leaveBehind(state); rt.transit = { kind: 'fade', t: 0, to }; };

/**
 * Whoever's still in the place he's leaving (anyone he's shoved into the elevator with him, too) stays there:
 * gone, with everything in the air, so nothing can hurt him while he rides or fades out.
 */
const leaveBehind = (state: GameState) => {
  const here = placeOf(state.player.pos.x);
  state.enemies = state.enemies.filter(e => e.type === 'boss' || placeOf(e.pos.x) !== here);
  state.projectiles = [];
};

const QUIPS: Record<string, string> = {
  '23': 'TWENTY THREE?! I PRESSED THE TOP ONE!',
  '41': 'FORTY ONE. THE ELEVATOR HATES ME. EVERYTHING IN THIS CITY HATES ME.',
  '58': 'FIFTY EIGHT. FINE. THERE BETTER BE STAIRS.',
};

const startElevator = (state: GameState, rt: BarryRuntime, place: Place, to: Room) => {
  const from = roomOf(place)!.label;
  const cp = to === COURSE.office ? CP.OFFICE : to === COURSE.maintenance ? CP.MAINTENANCE : CP.LAB;
  leaveBehind(state);
  rt.transit = { kind: 'elevator', t: 0, to: cp, from, floor: to.label, quip: QUIPS[to.label] };
  hush(state, rt.talk);
};

/** Where the elevator's floor counter's up to (for the ride). */
export const elevatorFloor = (tr: Transit) => {
  const a = tr.from === 'LOBBY' ? 1 : Number(tr.from), b = Number(tr.floor);
  const k = Math.max(0, Math.min(1, (tr.t - DOORS) / (RIDE - 30)));
  return Math.round(a + (b - a) * k);
};

/** Coming out onto a new floor (or the roof, or into the power room): how long nobody starts on you. */
const ARRIVE_GRACE = 90;

/** Put him at a checkpoint (the next place), the camera with him. */
const arrive = (state: GameState, rt: BarryRuntime, cp: number) => {
  const p = state.player;
  const a = at(cp);
  p.pos = { x: a.x, y: a.y - p.height };
  p.vel = { x: 0, y: 0 };
  p.facing = 1;
  state.projectiles = [];
  // (a moment to get your bearings: nobody starts anything)
  state.gapGrace = Math.max(state.gapGrace || 0, ARRIVE_GRACE);
  state.checkpoint = Math.max(state.checkpoint, cp);
  applyPlaceCamera(state, placeOf(a.x));
  state.camera.x = Math.max(state.cameraMinX, Math.min(state.cameraMaxX ?? 1e9, a.x - 250));
  state.cameraRestY = a.y - 550; state.camera.y = state.cameraRestY;
  void rt;
};

const updateTransit = (ctx: FrameContext, rt: BarryRuntime): Controls => {
  const { state } = ctx;
  const tr = rt.transit!;
  const p = state.player;
  tr.t++;
  p.vel.x = 0;
  if (tr.kind === 'fade') {
    if (tr.t === FADE) {
      arrive(state, rt, tr.to);
      if (tr.to === CP.LOBBY && !rt.said.has('lobby')) { rt.said.add('lobby'); queueLines(state, rt.talk, [{ who: 'meathead', text: 'A LOBBY. EVERYBODY IN IT LOOKS LIKE THEY HATE ME ALREADY.' }], 40); }
      if (tr.to === CP.ROOFS && !rt.said.has('roofs')) { rt.said.add('roofs'); queueLines(state, rt.talk, [{ who: 'meathead', text: 'ROOF ACCESS. AND THERE GO THE LIGHTS. THE WHOLE CITY. IN WAVES.' }], 40); }
    }
    if (tr.t >= FADE * 2) rt.transit = null;
    return { ...NO_CONTROLS };
  }
  // The elevator
  if (tr.t === DOORS + 10) playSound('ding');
  if (tr.t === DOORS + RIDE) {
    playSound('ding');
    arrive(state, rt, tr.to);
    if (tr.quip) replaceLines(state, rt.talk, [{ who: 'meathead', text: tr.quip }], 10);
  }
  if (tr.t >= DOORS + RIDE + OPEN) rt.transit = null;
  return { ...NO_CONTROLS };
};

/** How black the screen is for a fade (0..1). */
export const fadeAmount = (rt: BarryRuntime) => {
  const tr = rt.transit;
  if (!tr || tr.kind !== 'fade') return 0;
  return tr.t < FADE ? tr.t / FADE : Math.max(0, 1 - (tr.t - FADE) / FADE);
};

// ---------------------------------------------------------------------------
// The ride down: on Barry's man, out of the explosion, over the burning city, onto the street
// ---------------------------------------------------------------------------

/** Frames in the air (over the burning city, a screen of its own), and how fast he's going when he hits the street. */
export const SURF_AIR = 300;
const SLIDE_SPEED = 17, SLIDE_DRAG = 0.2, GET_UP = 50;

const startSurf = (state: GameState, rt: BarryRuntime) => {
  rt.surf = { t: 0, phase: 'air', x: 0, v: 0 };
  // (the power room's white-out's done with: the ride fades up out of it)
  rt.power.white = 0;
  hush(state, rt.talk);
  state.enemies = state.enemies.filter(e => e.type === 'boss');
  state.projectiles = [];
  state.stageMemo.minionBoard = 'yes';
};

const updateSurf = (ctx: FrameContext, rt: BarryRuntime): Controls => {
  const { state, fx } = ctx;
  const s = rt.surf!;
  const p = state.player;
  s.t++;
  // (hidden till he's up off the board: the stage draws him on it)
  p.inCutscene = true; p.hidden = s.phase !== 'up'; p.vel = { x: 0, y: 0 };
  if (s.phase === 'air') {
    if (s.t === 50) { state.playerLastVulgarity = "SURF'S UP, DUDES!"; state.playerVulgarityTimer = 110; say("SURF'S UP, DUDES!", MEATHEAD_VOICE, 'urgent', { onShow: () => {}, onHide: () => {} }); }
    if (s.t >= SURF_AIR) {
      // Down onto the street, skidding along it on him
      s.phase = 'slide'; s.t = 0; s.x = COURSE.landing.x1 + 40; s.v = SLIDE_SPEED;
      state.checkpoint = Math.max(state.checkpoint, CP.LANDING);
      applyPlaceCamera(state, 'landing');
      shakeScreen(state, 30, 12); playSound('slam');
    }
    // (the camera parks at the start of the street for the cut)
    state.camera.x = COURSE.landing.x1; state.camera.y = Y - 550;
    p.pos = { x: COURSE.landing.x1 + 60, y: Y - p.height - 400 };
    return { ...NO_CONTROLS };
  }
  if (s.phase === 'slide') {
    s.x += s.v; s.v = Math.max(0, s.v - SLIDE_DRAG);
    if (state.frame % 2 === 0) for (let i = 0; i < 3; i++) state.particles.push({ pos: { x: s.x - 10, y: Y - 4 }, vel: { x: -2 - Math.random() * 4, y: -Math.random() * 4 }, life: 18, color: Math.random() < 0.5 ? '#FDE047' : '#F97316', size: 2 + Math.random() * 2 });
    if (s.t % 8 === 0 && s.v > 2) fx.spawnDeathShower({ x: s.x - 20, y: Y - 6 }, -1, 0.15);
    p.pos = { x: s.x - p.width / 2, y: Y - 16 - p.height };
    state.cameraOverride = { x: Math.max(COURSE.landing.x1, s.x - 300), y: Y - 550 };
    if (s.v <= 0) { s.phase = 'up'; s.t = 0; }
    return { ...NO_CONTROLS };
  }
  // Off it, onto his feet
  p.pos = { x: s.x - p.width / 2 + 30, y: Y - p.height };
  if (s.t === 10) { state.playerLastVulgarity = 'THANKS FOR THE RIDE, BUDDY.'; state.playerVulgarityTimer = 120; say('THANKS FOR THE RIDE, BUDDY.', MEATHEAD_VOICE, 'urgent', { onShow: () => {}, onHide: () => {} }); }
  if (s.t >= GET_UP) {
    state.stageMemo.boardX = String(Math.round(s.x));
    rt.surf = null;
    p.hidden = false; p.inCutscene = false;
    state.cameraOverride = null;
  }
  return { ...NO_CONTROLS };
};

/** What got him, in so many words. */
export const barryDeathMessage = (ctx: FrameContext): string | undefined => {
  const { state } = ctx;
  const p = state.player;
  const pick = (a: string[]) => a[Math.floor(Math.random() * a.length)];
  const place = placeOf(p.pos.x);
  const fell = p.pos.y > Y + 60;
  // (something in particular got him: that, over the place's catch-all)
  const cause = fell ? undefined : deathByCause(state);
  if (cause) return cause;
  if (place === 'streets') return fell ? pick(['SWALLOWED BY A POTHOLE', 'THE CREW WENT ON BREAK IN 1997', 'NO CONES. NO SIGN. NO CREW.', 'DOWN THE HOLE']) : pick(['JUST ANOTHER NEW YORK STATISTIC', 'MUGGED', 'THE CITY THAT NEVER SLEEPS. YOU DO NOW.']);
  if (place === 'lobby') return pick(['NO VISITOR BADGE', 'SIGNED OUT PERMANENTLY']);
  if (place === 'office') return pick(['DOWNSIZED', "YOU'RE FIRED", 'HR WILL HEAR ABOUT THIS']);
  if (place === 'maintenance') return pick(['MOPPED UP', 'CLEANED OUT']);
  if (place === 'lab') return pick(['FAILED THE TRIAL', 'SAMPLE CONTAMINATED', 'FOR SCIENCE']);
  if (place === 'roofs') return fell ? pick(['TOOK THE EXPRESS WAY DOWN', 'SPLAT ON FIFTH AVENUE', 'MIND THE GAP']) : pick(['HIT BY A FLYING TOASTER', 'NEW YORK WELCOMES YOU', 'WINDOW SHOPPING']);
  if (place === 'power') return pick(['GROUNDED']);
  return undefined;
};

/** A New Yorker's bark, if he's got one up (for the draw). */
export const barkOf = (rt: BarryRuntime, e: Enemy) => rt.barks.find(b => b.id === e.id);
