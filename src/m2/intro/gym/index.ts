// The Iron Pit: Meathead 2's opening (a new game starts here: App.tsx). His gym, Meathead 1's, on leg day.
//
//   1. The opening cutscene (scene.ts, shots.ts): leg day; the news on the gym's TV (the public's told he's rotting in
//      Guantanamo Bay for killing the President); two G-men in through the door with a hand truck of his protein
//      (the department's his courier service: he's its secret asset); he's been interrupted on leg day; he must
//      destroy them.
//   2. The tutorial (course.ts): room by room, the G-men running from him (they never fight back), each room one
//      thing to do to them (shoot, charge, slide, uppercut, dive kick), its card up with the real buttons while
//      there's anybody there to do it to (GymTips.tsx), and something in each to pulverize them with (obstacles.ts).
//   3. The ring (Meathead 1's): two trainers padded head to toe, one on the mat, one on a jetpack; they can't be killed.
//      The grabs, one at a time, each done when he's done it: BEATDOWN (they shove him off after a few), SHAKEDOWN,
//      AIR GRAB. Then the exit door unchains, EXIT lit over it, the arrow pointing on.
//   4. Walking up to it: the closing cutscene: another of them through the door, the chokehold, the cork line, no
//      active contract, the squeeze, the all-day pass to Happy Land, the toddler, the government-issued truck, "LET'S
//      GO TO HAPPY LAND!", and on into the way in (intro/index.ts: the truck into the pillar).
//
// Nothing in here can hurt him. The cheats build's pause menu has SKIP STAGE (to the closing cutscene).

import type { StageLayout } from '../../../m1/game/stages/index';
import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Enemy } from '../../../m1/types';
import { NO_CONTROLS, type Controls } from '../../../m1/game/platform/input';
import { groundBlocks, type GroundRun } from '../../../m1/game/core/terrain';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { playSound, audioRunning, getAudioContext } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { setGlasses } from '../../../m1/game/render/player/body';
import { setUi, goTo, isLeaving, arrived, carryGut, takeGut } from '../../store';
import { stopWeapons } from '../../weapons';
import { createGrab, updateGrab, drawGrab, type Grab } from '../../moves/grab';
import { speak, saidOver } from '../../adventure/section';
import type { Dressed } from '../lines';
import {
  GYM_STAGE, X0, Y, LEFT, RIGHT, CEIL_Y, START_X, ROOMS, ROOM_ORDER, LEDGES, OBSTACLES, SPAWNS, DUCT, MEZZ, MEZZ_Y, RING, PAD_X, JET_X, JET_Y, EXIT_X, EXIT_AT, type Role,
} from './course';
import { registerGmen, gstate, gOf, isWomanG, GMAN, GCRAWL, GPAD, GJET, type Pose } from './gman';
import { updateThings, drawThing, drawDebris, type Thing, type Debris } from './obstacles';
import { drawGymBackdrop, drawGymBack, drawGymMid, drawRingFront, setExitOpen } from './art';
import { createScene, tickScene, drawScene, sfx, type Scene, type Beat } from './scene';
import { shotSquat, shotTv, shotDoorway, shotAgent, shotAgentF, shotMeathead, shotArrival, shotTicket, shotToddler, shotGlasses, shotGlassesOn, setShotDress } from './shots';
import { grossChoke, grossTruck, prewarmGross } from './gross';
import {
  AGENT_VOICE, AGENTF_VOICE, GMAN_VOICE, ANCHOR_VOICE, OPEN_TV, OPEN_REPS, OPEN_AGENT_1, OPEN_AGENTF_1, OPEN_AGENT_2, OPEN_MH_1, OPEN_AGENTF_2, OPEN_MH_2, OPEN_MH_3,
  OPEN_AGENT_3, ROOM_LINES, RING_HELLO, RING_SHOVE, RING_THROWN, RING_JET, RING_DONE, CLOSE_MH_CORK, CLOSE_NO_CONTRACT, CLOSE_TICKET, CLOSE_MH_HAPPY, CLOSE_TRUCK,
  CLOSE_MH_TRUCK, CLOSE_GUANTANAMO, CLOSE_DISGUISE, CLOSE_MH_GLASSES, CLOSE_NOT_HOW, CLOSE_MH_GO, type Room,
} from './lines';

export { GYM_STAGE };

/** What the card up top is teaching right now (GymTips.tsx), or nothing. */
export type GymTip = 'move' | Room | 'beatdown' | 'shakedown' | 'airgrab' | 'exit';
type Grabs = 'beatdown' | 'shakedown' | 'airgrab';
const GRAB_ORDER: Grabs[] = ['beatdown', 'shakedown', 'airgrab'];
/** Punches a trainer takes in a beatdown before he's had enough and shoves him off. */
const SHOVE_AFTER = 6;

interface Gym {
  phase: 'opening' | 'play' | 'closing';
  scene: Scene | null;
  /** (the opening waits for the sound: the browser holds it back till a key or a click) */
  waiting: boolean;
  grab: Grab;
  things: Thing[];
  debris: Debris[];
  /** Who's in which room, their job. */
  rooms: Map<Enemy, { room: Room; role: Role; homeX: number }>;
  barked: Set<Room>;
  moved: boolean; spawnX: number;
  /** The ring: the two trainers, the grabs done, the shove-off under way (its frames), what's been seen of each grab. */
  pad: Enemy; jet: Enemy;
  done: Set<Grabs>;
  shove: number; punchesSeen: number; mountBase: number | null; shover: Enemy | null; sawShake: boolean; sawArc: boolean; ringHello: boolean;
  exitOpen: number;
  /** (the duct) The way he was sliding as he went under it (0: not under it). */
  ductDir: number;
  /** The rooms whose G-men haven't come yet; who's coming down through the ceiling, where and when (frames); the
   *  tiles knocked out up there (till when). */
  pending: Set<number>;
  drops: { s: typeof SPAWNS[number]; i: number; x: number; at: number }[];
  holes: { x: number; until: number }[];
  /** What a trainer's saying, over his head. */
  ringSaid: { e: Enemy; text: string } | null;
}
const getGym = (state: GameState) => state.stage as Gym | null;

/** The opening's been seen this session (a death in here: back in at the start, no opening again). */
let openingSeen = false;
/** The cheats build's SKIP STAGE: straight to the closing cutscene. */
let skipAsked = false;
export const requestGymSkip = () => { skipAsked = true; };
if (import.meta.env.DEV) (window as unknown as { __gymSkip: () => void }).__gymSkip = requestGymSkip;

const dressed = (state: GameState): Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');

// ---------------------------------------------------------------------------------------------------------------
// The cutscenes

const OPENING = (): Beat[] => [
  { shot: shotSquat, caption: 'THE IRON PIT. LEG DAY.', hold: 150 },
  { shot: shotTv, who: 'NEWS', voice: ANCHOR_VOICE, text: OPEN_TV[0], hold: 8 },
  { shot: shotTv, who: 'NEWS', voice: ANCHOR_VOICE, text: OPEN_TV[1], hold: 30 },
  { shot: shotSquat, who: 'MEATHEAD', voice: 'meathead', text: OPEN_REPS, hold: 6 },
  { shot: shotDoorway('none'), hold: 70, enter: () => { playSound('slam', 1, -4); playSound('crash', 0.6, 6); } },
  { shot: shotAgent(), who: 'G-MAN', voice: AGENT_VOICE, text: OPEN_AGENT_1 },
  { shot: shotAgentF, who: 'G-WOMAN', voice: AGENTF_VOICE, text: OPEN_AGENTF_1 },
  { shot: shotAgent(), who: 'G-MAN', voice: AGENT_VOICE, text: OPEN_AGENT_2 },
  { shot: shotMeathead('dumb'), who: 'MEATHEAD', voice: 'meathead', text: OPEN_MH_1, wait: 20 },
  { shot: shotAgentF, who: 'G-WOMAN', voice: AGENTF_VOICE, text: OPEN_AGENTF_2 },
  { shot: shotMeathead('fury'), who: 'MEATHEAD', voice: 'meathead', text: OPEN_MH_2, enter: sfx('roar', 0.5, 6) },
  { shot: shotMeathead('fury', 1), who: 'MEATHEAD', voice: 'meathead', text: OPEN_MH_3, hold: 34, enter: sfx('thunder', 0.6) },
  { shot: shotDoorway('him', true), who: 'G-MAN', voice: AGENT_VOICE, text: OPEN_AGENT_3, hold: 24 },
];

const CLOSING = (d: Dressed): Beat[] => [
  { shot: shotArrival, hold: 70, enter: () => { playSound('slam', 1, -2); } },
  // (the chokehold and the truck: gross-ups, three times finer: gross.ts)
  { shot: grossChoke(0), res: 3, who: 'MEATHEAD', voice: 'meathead', text: CLOSE_MH_CORK, enter: () => { playSound('punch', 0.9, -6); playSound('whoosh', 0.7); } },
  { shot: grossChoke(1), res: 3, who: 'G-MAN', voice: GMAN_VOICE, text: CLOSE_NO_CONTRACT[d] },
  { shot: grossChoke(2), res: 3, hold: 90, enter: () => { playSound('crunch', 0.8, -10); setTimeout(() => playSound('crunch', 0.6, -14), 400); } },
  { shot: shotTicket, who: 'G-MAN', voice: GMAN_VOICE, text: CLOSE_TICKET, enter: sfx('ding', 0.9, 6) },
  { shot: shotToddler(0), who: 'MEATHEAD', voice: 'meathead', text: CLOSE_MH_HAPPY, hold: 20, enter: sfx('powerup', 0.7, 8) },
  { shot: shotAgent(true), who: 'G-MAN', voice: AGENT_VOICE, text: CLOSE_TRUCK[d], enter: sfx('clink', 0.8, 4) },
  // (and there it is: the truck, up close, nobody talking over it; the engine turning over, the horn)
  { shot: grossTruck, res: 3, hold: 170, enter: () => { playSound('carroar', 0.7, -2); setTimeout(() => playSound('truckhorn', 0.6), 1500); } },
  { shot: shotToddler(1), who: 'MEATHEAD', voice: 'meathead', text: CLOSE_MH_TRUCK, hold: 12 },
  // (the disguise: he's meant to be rotting in Guantanamo, and he's off to a theme park in public; the nerd glasses he
  // wears from here on)
  { shot: shotAgentF, who: 'G-WOMAN', voice: AGENTF_VOICE, text: CLOSE_GUANTANAMO },
  { shot: shotAgent(), who: 'G-MAN', voice: AGENT_VOICE, text: CLOSE_DISGUISE[d], hold: 10 },
  { shot: shotGlasses, hold: 80, enter: sfx('ding', 0.8, 2) },
  { shot: shotGlassesOn, hold: 64, enter: () => setTimeout(() => playSound('clink', 0.8, 6), 560) },
  { shot: shotGlassesOn, who: 'MEATHEAD', voice: 'meathead', text: CLOSE_MH_GLASSES, hold: 16 },
  { shot: shotAgentF, who: 'G-WOMAN', voice: AGENTF_VOICE, text: CLOSE_NOT_HOW, hold: 14 },
  { shot: shotToddler(2, true), who: 'MEATHEAD', voice: 'meathead', text: CLOSE_MH_GO, hold: 40 },
];

const startClosing = (state: GameState, gym: Gym) => {
  const d = dressed(state);
  setShotDress(d);
  // (he's handed the glasses in it: on him from here, every drawing of him, for good)
  setGlasses(true);
  gym.phase = 'closing';
  gym.scene = createScene(CLOSING(d));
  state.projectiles = [];
  setUi({ introCutscene: true, gymTip: null });
};

// ---------------------------------------------------------------------------------------------------------------
// Built

const addG = (state: GameState, gym: Gym, kind: string, x: number, y: number, seed: number, pose: Pose) => {
  const e = makeKindEnemy(kind as Enemy['kind'] & string, x, y);
  // (puppets: moved by the stage, their own AI held off, no dazed stars over them for it)
  e.seen = true; e.harmless = true; e.puppet = true; e.shootTimer = 0; e.facing = -1; e.noCrowd = true;
  gstate.set(e, { pose, seed, t: 0 });
  state.enemies.push(e);
  void gym;
  return e;
};

export const gymLayout: StageLayout = {
  left: LEFT - 400,
  startX: START_X,
  verticalCamera: false,
  startsStanding: true,
  collateralOnScreenOnly: true,
  build: (state) => {
    registerGmen();
    // (no glasses on him in here: he's handed them in the closing)
    setGlasses(false);
    arrived(); stopWeapons();
    { const g = takeGut(); if (g) state.player.gut = g; }
    const runs: GroundRun[] = [
      { x1: LEFT - 400, y1: Y, x2: MEZZ.x1, y2: Y, surface: 'rubber' },
      { x1: MEZZ.x1, y1: MEZZ_Y, x2: MEZZ.x2, y2: MEZZ_Y, surface: 'metal' },
      { x1: MEZZ.x2, y1: Y, x2: RING.x1 - 40, y2: Y, surface: 'rubber' },
      { x1: RING.x1 - 40, y1: Y, x2: RING.x1, y2: RING.mat, surface: 'rubber' },
      { x1: RING.x1, y1: RING.mat, x2: RING.x2, y2: RING.mat, surface: 'rubber' },
      { x1: RING.x2, y1: RING.mat, x2: RING.x2 + 40, y2: Y, surface: 'rubber' },
      { x1: RING.x2 + 40, y1: Y, x2: RIGHT + 400, y2: Y, surface: 'rubber' },
    ] as GroundRun[];
    state.groundRuns = runs;
    state.blocks.push(...groundBlocks(runs));
    state.blocks.push(
      { x: LEFT - 60, y: -3000, w: 60, h: 3600, type: 'wall', hidden: true, tag: 'gym2-l' },
      { x: RIGHT, y: -3000, w: 60, h: 3600, type: 'wall', hidden: true, tag: 'gym2-r' },
      { x: LEFT - 60, y: -3000, w: RIGHT - LEFT + 120, h: 3000 + CEIL_Y, type: 'wall', hidden: true, tag: 'gym2-ceiling' },
      { x: EXIT_X - 30, y: -3000, w: 40, h: 3600, type: 'wall', hidden: true, tag: 'gym2-exit' },
    );
    LEDGES.forEach((l, i) => state.blocks.push({ x: l.x, y: l.y, w: l.w, h: 14, type: 'platform', hidden: true, oneWay: true, tag: `gym2-ledge-${i}` } as never));
    state.cameraMinX = LEFT - 60;
    state.cameraMaxX = RIGHT + 60 - CANVAS_WIDTH;
    const p = state.player;
    const gym: Gym = {
      phase: openingSeen ? 'play' : 'opening', scene: null, waiting: !openingSeen, grab: createGrab(state),
      things: OBSTACLES.map(o => ({ kind: o.kind, x: o.x, broken: 0, shots: 0 })), debris: [], rooms: new Map(), barked: new Set(),
      moved: false, spawnX: START_X, pad: null as unknown as Enemy, jet: null as unknown as Enemy,
      done: new Set(), shove: -1, punchesSeen: 0, mountBase: null, shover: null, sawShake: false, sawArc: false, ringHello: false, exitOpen: 0, ringSaid: null, ductDir: 0,
      pending: new Set(SPAWNS.map((_, i) => i)), drops: [], holes: [],
    };
    state.stage = gym;
    setExitOpen(0);
    // (the closing's gross-ups, painted now, under the load's black: they're slow to paint, and a cut mustn't hitch)
    prewarmGross();
    // The G-men, room by room (a mixed bunch: every one his own seed)
    // (the G-men come room by room, in view: arrivals; the two trainers drop into the ring as it comes into view: ring)
    p.pos = { x: START_X - p.width / 2, y: Y - p.height }; p.vel = { x: 0, y: 0 }; p.facing = 1;
    if (gym.phase === 'opening') {
      p.hidden = true; p.inCutscene = true;
      setUi({ introCutscene: true, gymTip: null, zone: 'staff' });
    } else { p.hidden = false; p.inCutscene = false; setUi({ introCutscene: false, zone: 'staff' }); }
    skipAsked = false;
  },
  update: (ctx, controls) => {
    const { state } = ctx;
    const gym = getGym(state);
    if (import.meta.env.DEV) (window as unknown as { __m2: GameState }).__m2 = state;
    if (isLeaving()) { stopWeapons(); carryGut(state.player.gut); state.player.vel.x = 0; return { ...NO_CONTROLS }; }
    if (!gym) return controls;
    const p = state.player;
    p.noContactHurt = true;
    // (the cheats build's SKIP STAGE)
    if (skipAsked) { skipAsked = false; if (gym.phase !== 'closing') { openingSeen = true; startClosing(state, gym); } }
    if (gym.phase === 'opening') return opening(state, gym, controls);
    if (gym.phase === 'closing') {
      p.hidden = true; p.inCutscene = true; p.vel.x = 0;
      setUi({ introCutscene: true });
      if (gym.scene && tickScene(gym.scene)) { gym.scene = null; carryGut(p.gut); goTo('intro'); }
      return { ...NO_CONTROLS };
    }
    return play(ctx, gym, controls);
  },
  drawBackdrop: (c) => { drawGymBackdrop(c); return true; },
  drawBack: (c, state) => drawGymBack(c, state),
  drawMid: (c, state) => { drawGymMid(c, state); const gym = getGym(state); if (gym) { for (const t of gym.things) drawThing(c, t, state.frame); drawDebris(c, gym.debris); } },
  drawFront: (c, state) => {
    const gym = getGym(state);
    if (!gym) return;
    drawRingFront(c, state);
    drawHoles(c, gym, state.frame);
    drawGrab(c, state, gym.grab);
    // (who's saying what, over their heads, only while it's said)
    for (const e of state.enemies) { const g = gOf(e); if (g?.said && e.health > 0 && !e.isBlownAway) saidOver(c, g.said, e.pos.x + e.width / 2, e.pos.y - 16); }
    if (gym.ringSaid) saidOver(c, gym.ringSaid.text, gym.ringSaid.e.pos.x + gym.ringSaid.e.width / 2, gym.ringSaid.e.pos.y - 22);
  },
  drawHud: (c, state) => { const gym = getGym(state); if (gym?.scene) drawScene(c, gym.scene); },
};

const opening = (state: GameState, gym: Gym, controls: Controls): Controls => {
  const p = state.player;
  p.hidden = true; p.inCutscene = true;
  setUi({ introCutscene: true, gymTip: null });
  if (gym.waiting) {
    getAudioContext();
    if (!audioRunning() && !Object.values(controls).some(v => v === true)) return { ...NO_CONTROLS };
    gym.waiting = false;
    gym.scene = createScene(OPENING());
  }
  if (gym.scene && tickScene(gym.scene)) {
    gym.scene = null; openingSeen = true;
    gym.phase = 'play';
    p.hidden = false; p.inCutscene = false;
    setUi({ introCutscene: false });
  }
  return { ...NO_CONTROLS };
};

// ---------------------------------------------------------------------------------------------------------------
// The tutorial

const alive = (e: Enemy) => e.health > 0 && !e.isBlownAway;
const roomAlive = (state: GameState, gym: Gym, r: Room) => state.enemies.some(e => gym.rooms.get(e)?.room === r && alive(e));
const isPadded = (gym: Gym, e: Enemy | null) => !!e && (e === gym.pad || e === gym.jet);

const play = (ctx: FrameContext, gym: Gym, controlsIn: Controls): Controls => {
  const { state } = ctx;
  const p = state.player, px = p.pos.x + p.width / 2;
  // (nothing lying about: the drops off the G-men go; the shakedown's ammo stays)
  state.pickups = state.pickups.filter(k => !(k.id.startsWith('pickup-') && (k.type === 'small_health' || k.type === 'large_health')));
  if (Math.abs(px - gym.spawnX) > 120) gym.moved = true;
  arrivals(ctx, gym);
  let controls = duct(state, gym, controlsIn);
  controls = ring(ctx, gym, controls);
  controls = updateGrab(ctx, gym.grab, controls);
  gmen(state, gym);
  // (nothing off the screen gets knocked down by a body, or a tub, or a kettlebell, he never saw coming: the user's)
  const cam = state.camera.x, seen = (x: number, w: number) => x + w > cam && x < cam + CANVAS_WIDTH;
  updateThings(ctx, gym.things, gym.debris, e => !isPadded(gym, e) && alive(e) && seen(e.pos.x, e.width), seen);
  bark(state, gym, px);
  // (the exit, once the ring's done: up to it, and that's the stage)
  if (gym.done.size === 3) {
    gym.exitOpen = Math.min(1, gym.exitOpen + 0.03); setExitOpen(gym.exitOpen);
    if (px >= EXIT_AT && p.isGrounded) { startClosing(state, gym); return { ...NO_CONTROLS }; }
  }
  setUi({ gymTip: tipFor(state, gym, px), introCutscene: false });
  return controls;
};

/** The duct down to knee height: the only way under it is a slide tackle (he can't crawl or crouch-walk). Slid into, it
 *  carries him out the far side (a slide that runs out under it keeps him going, low, the way he was sliding);
 *  walked into standing, or ducked, he's stopped against it. */
const duct = (state: GameState, gym: Gym, controls: Controls): Controls => {
  const p = state.player, cx = p.pos.x + p.width / 2;
  const inside = cx > DUCT.x1 - 4 && cx < DUCT.x2 + 4 && p.pos.y + p.height > DUCT.bottom - 4;
  if (!inside) {
    gym.ductDir = 0;
    const next = cx + p.vel.x;
    if (!p.isSliding && next > DUCT.x1 - 4 && next < DUCT.x2 + 4 && p.pos.y + p.height > DUCT.bottom) {
      p.pos.x = (cx < DUCT.x1 ? DUCT.x1 - 4 : DUCT.x2 + 4) - p.width / 2 - Math.sign(p.vel.x || 1) * 0.5; p.vel.x = 0;
    }
    return controls;
  }
  if (!gym.ductDir) gym.ductDir = p.facing;
  if (p.isSliding) return { ...controls, jump: false, up: false };
  // (the slide's run out under it: on through, low, the way he was going)
  p.facing = gym.ductDir as 1 | -1;
  p.pos.x += gym.ductDir * 5;
  return { ...controls, down: true, jump: false, up: false, left: false, right: false, special: false, charge: false, shoot: false };
};

/**
 * The G-men come room by room, where he can see them come (the user's: none pops in, or waits off the screen to be
 * knocked down by a body he never saw), and early enough to be there as he walks in (the user's: not too late): as
 * each one's spot comes onto the screen, a ceiling tile over it rattles and sheds dust a moment, and down he drops
 * through it, onto the floor, his shelf, or (the slide room's) out past the duct, to crawl in under it. A room's lot
 * come down one after another as it scrolls in, the near ones first.
 */
const TELEGRAPH = 16, DROP_GAP = 8;
const arrivals = (ctx: FrameContext, gym: Gym) => {
  const { state } = ctx;
  const cam = state.camera.x;
  let k = 0;
  for (const i of [...gym.pending]) {
    const s = SPAWNS[i];
    // (its spot just in on the right of the screen, or anywhere on it: never one behind him, off the left)
    if (!(s.x < cam + CANVAS_WIDTH - 30 && s.x > cam + 20)) continue;
    gym.pending.delete(i);
    gym.drops.push({ s, i, x: s.x, at: state.frame + TELEGRAPH + k++ * DROP_GAP });
  }
  for (const d of gym.drops) if (d.at - state.frame < TELEGRAPH && state.frame % 4 === 0) state.particles.push({ pos: { x: d.x + (Math.random() - 0.5) * 40, y: CEIL_Y + 2 }, vel: { x: 0, y: 0.6 + Math.random() }, life: 50, color: '#B8B2A0', size: 1.5 + Math.random() * 2 });
  gym.drops = gym.drops.filter(d => {
    if (state.frame < d.at) return true;
    const { s, i } = d, crawl = s.role === 'crawl';
    const kind = crawl ? GCRAWL : GMAN, h = crawl ? 26 : 66;
    const e = addG(state, gym, kind, d.x, CEIL_Y + 8 + h, 17 + i * 31, crawl ? 'crawl' : s.role === 'carry' ? 'carry' : s.role === 'link' ? 'link' : s.role === 'perch' ? 'perch' : s.role === 'huddle' ? 'huddle' : 'cower');
    // (coming down: a bystander till he's landed, so the drop doesn't hurt him (nor does anything else meanwhile))
    e.vel = { x: 0, y: 1.5 }; e.innocent = true; gOf(e)!.dropping = true;
    gym.rooms.set(e, { room: s.room, role: s.role, homeX: s.x });
    gym.holes.push({ x: d.x, until: state.frame + 240 });
    for (let k = 0; k < 14; k++) state.particles.push({ pos: { x: d.x + (Math.random() - 0.5) * 50, y: CEIL_Y }, vel: { x: (Math.random() - 0.5) * 3, y: 1 + Math.random() * 3 }, life: 50 + Math.random() * 30, color: k % 3 ? '#8A8473' : '#B8B2A0', size: 2 + Math.random() * 5 });
    playSound('crack', 0.5, 2);
    return false;
  });
  gym.holes = gym.holes.filter(h => h.until > state.frame);
};

/** The ceiling tiles they came down through: knocked out, the dark up in there, one hanging by a corner. */
const drawHoles = (c: CanvasRenderingContext2D, gym: Gym, frame: number) => {
  for (const h of gym.holes) {
    const tx = h.x - 30;
    c.fillStyle = '#0E0A08'; c.fillRect(tx, CEIL_Y - 36, 60, 30);
    c.save(); c.translate(tx + 60, CEIL_Y - 8); c.rotate(1.1 + Math.sin(frame * 0.2) * 0.05 * Math.max(0, (h.until - frame) / 240));
    c.fillStyle = '#8A8473'; c.fillRect(0, 0, 28, 6); c.fillStyle = '#5A5444'; c.fillRect(0, 5, 28, 1); c.restore();
  }
};

/** The G-men: by their job, never fighting back. */
const FLEE = 2.6, WALK = 0.7;
const gmen = (state: GameState, gym: Gym) => {
  const p = state.player, px = p.pos.x + p.width / 2;
  state.projectiles = state.projectiles.filter(q => q.owner !== 'enemy');
  for (const e of state.enemies) {
    const job = gym.rooms.get(e), g = gOf(e);
    if (!job || !g || !alive(e)) continue;
    e.harmless = true; e.shootTimer = 0;
    g.t++;
    if ((e.pauseTimer || 0) > 2 || Math.abs(e.vel.y) > 0.5) continue;
    if (g.dropping) { g.dropping = false; e.innocent = false; }
    e.pauseTimer = 2;
    const ex = e.pos.x + e.width / 2, d = px - ex, [r0, r1] = ROOMS[job.room];
    const face = (d < 0 ? -1 : 1) as 1 | -1;
    switch (job.role) {
      case 'carry': {
        // (lugging his protein about; he gets close: the box dropped, off they run, then cower at the room's end)
        if (Math.abs(d) < 240 && Math.abs(p.pos.y - e.pos.y) < 120) { job.role = 'cower'; g.pose = 'flee'; (job as { runTo?: number }).runTo = d > 0 ? r0 + 30 : r1 - 60; break; }
        const dir = g.t % 360 < 180 ? 1 : -1;
        e.pos.x += dir * WALK; e.facing = dir as 1 | -1; e.vel.x = dir * 0.01;
        break;
      }
      case 'cower': {
        // (running for the room's end, but never off the screen: they cower at its edge if that comes first)
        const want = (job as { runTo?: number }).runTo, cam = state.camera.x;
        const to = want === undefined ? undefined : Math.max(cam + 60, Math.min(cam + CANVAS_WIDTH - 70, want));
        if (g.pose === 'flee' && to !== undefined && Math.abs(to - ex) > 4) { const dir = Math.sign(to - ex) as 1 | -1; e.pos.x += dir * FLEE; e.facing = dir; e.vel.x = dir * 0.01; break; }
        g.pose = 'cower'; e.facing = face; e.vel.x = 0;
        break;
      }
      case 'crawl': {
        const dir = (e.facing ?? 1) as 1 | -1;
        if ((dir > 0 && ex > DUCT.x2 - 30) || (dir < 0 && ex < DUCT.x1 + 30)) e.facing = -dir as 1 | -1;
        e.pos.x += (e.facing ?? 1) * 0.6; e.vel.x = (e.facing ?? 1) * 0.01;
        break;
      }
      default:
        e.facing = face; e.vel.x = 0;
    }
  }
};

/** As he comes into each room, one of them says something (the once), by the state of him. */
const bark = (state: GameState, gym: Gym, px: number) => {
  for (const r of ROOM_ORDER) {
    if (gym.barked.has(r) || px < ROOMS[r][0] - 160 || px > ROOMS[r][1]) continue;
    const who = state.enemies.filter(e => gym.rooms.get(e)?.room === r && alive(e)).sort((a, b) => Math.abs(a.pos.x - px) - Math.abs(b.pos.x - px))[0];
    if (!who) continue;
    gym.barked.add(r);
    const g = gOf(who)!;
    speak(isWomanG(who) ? AGENTF_VOICE : GMAN_VOICE, pickLine(ROOM_LINES[r][dressed(state)]), s => { g.said = s?.text ?? null; }, false);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The ring

const trainerSays = (gym: Gym, e: Enemy, text: string) => {
  speak(GMAN_VOICE, text, s => { gym.ringSaid = s ? { e, text: s.text } : gym.ringSaid?.text === text ? null : gym.ringSaid; }, true);
};

const ring = (ctx: FrameContext, gym: Gym, controls: Controls): Controls => {
  const { state } = ctx;
  const p = state.player, px = p.pos.x + p.width / 2, g = gym.grab;
  // The two trainers: down through the ceiling into the ring once it's in view (the one on the ground, then the
  // jetpack one, who flies up to his height)
  if (!gym.pad) {
    const cam = state.camera.x;
    if (!(PAD_X > cam + 20 && JET_X < cam + CANVAS_WIDTH - 30)) return controls;
    gym.pad = addG(state, gym, GPAD, PAD_X, CEIL_Y + 8 + 70, 404, 'pad');
    gym.jet = addG(state, gym, GJET, JET_X, CEIL_Y + 8 + 70, 919, 'jet');
    for (const e of [gym.pad, gym.jet]) { e.maxHealth = 60; e.health = 9999; e.vel = { x: 0, y: 1.5 }; e.pauseTimer = 40; gym.holes.push({ x: e.pos.x + e.width / 2, until: state.frame + 240 }); }
    playSound('crack', 0.5, 2);
  }
  // They can't be killed: whatever's done to them, back up (the padding's taken it)
  for (const e of [gym.pad, gym.jet]) {
    if (e.isBlownAway || e.health <= 0) { e.isBlownAway = false; e.rotation = 0; e.vel = { x: 0, y: 0 }; e.pos.x = (e === gym.pad ? PAD_X : JET_X) - e.width / 2; e.pos.y = RING.mat - e.height - 40; if (!state.enemies.includes(e) && g.held !== e) state.enemies.push(e); }
    e.health = 9999; e.maxHealth = 60; e.harmless = true; e.shootTimer = 0;
    const held = g.held === e || !state.enemies.includes(e);
    if (held) continue;
    // (the hovering one's own fall is held off by hand every frame: only a real knock counts for him)
    const knocked = (e.pauseTimer || 0) > 2 || Math.abs(e.vel.x) > 1 || (e !== gym.jet && Math.abs(e.vel.y) > 0.6) || (e === gym.jet && Math.abs(e.vel.y) > 3);
    e.facing = (px < e.pos.x + e.width / 2 ? -1 : 1);
    if (knocked) continue;
    const home = e === gym.pad ? PAD_X : JET_X, ex = e.pos.x + e.width / 2;
    if (Math.abs(home - ex) > 6) e.pos.x += Math.sign(home - ex) * 1.4;
    if (e === gym.jet) {
      // (hovering on the jetpack: back up to his height, bobbing)
      const want = JET_Y - e.height + Math.sin(state.frame * 0.05) * 6;
      // (a hair of upward speed: never "stood on the floor", or the engine snaps him down onto it)
      e.pos.y = e.pos.y > want ? Math.max(want, e.pos.y - 2.5) : want; e.vel.y = -0.001;
    }
    e.pauseTimer = 2;
  }
  if (!gym.ringHello && px > RING.x1 - 200) { gym.ringHello = true; trainerSays(gym, gym.pad, RING_HELLO); }
  // BEATDOWN: on top of one of them, punching; after a few he's had enough and shoves him off
  // (the grab's punch count runs on across beatdowns: each one's punches counted from where it was as he got on top,
  // so every beatdown gets its few punches before the shove, however many there've been)
  if (g.phase === 'mount' && isPadded(gym, g.held)) {
    if (gym.mountBase === null) gym.mountBase = g.punchN;
    const n = g.punchN - gym.mountBase;
    gym.punchesSeen = Math.max(gym.punchesSeen, n);
    if (n >= SHOVE_AFTER && gym.shove < 0) { gym.shove = 0; gym.shover = g.held; }
  } else if (g.phase !== 'mount') gym.mountBase = null;
  if (gym.shove >= 0) {
    const dir = g.dir;
    gym.shove++;
    if (gym.shove === 1) controls = { ...controls, jump: false };
    else if (gym.shove === 2) { controls = { ...controls, jump: true }; trainerSays(gym, gym.shover ?? gym.pad, pickLine(RING_SHOVE)); playSound('slam', 0.7, 4); }
    else if (gym.shove === 3) { p.vel.x = -dir * 9; p.vel.y = -7; p.isGrounded = false; }
    if (gym.shove > 3) gym.shove = -1;
  }
  if (g.phase === 'idle' && gym.punchesSeen >= 3) gym.done.add('beatdown');
  // SHAKEDOWN: up by the neck, shaken, thrown
  if ((g.phase === 'shake' || g.phase === 'toss') && isPadded(gym, g.held)) gym.sawShake = true;
  if (gym.sawShake && g.phase === 'idle' && !gym.done.has('shakedown')) { gym.done.add('shakedown'); trainerSays(gym, gym.pad, pickLine(RING_THROWN)); }
  // AIR GRAB: caught in the air, driven down
  if ((g.phase === 'aarc' || g.phase === 'aland') && isPadded(gym, g.held)) gym.sawArc = true;
  if (gym.sawArc && (g.phase === 'idle' || g.phase === 'aland') && !gym.done.has('airgrab')) { gym.done.add('airgrab'); trainerSays(gym, gym.jet, pickLine(RING_THROWN)); }
  // (the jetpack man taunts him now and then, till he's had him)
  if (!gym.done.has('airgrab') && gym.done.has('shakedown') && state.frame % 600 === 300 && px > RING.x1) trainerSays(gym, gym.jet, pickLine(RING_JET));
  // All three: the exit unchained
  if (gym.done.size === 3 && !state.blocks.every(b => b.tag !== 'gym2-exit')) {
    state.blocks = state.blocks.filter(b => b.tag !== 'gym2-exit');
    trainerSays(gym, gym.pad, RING_DONE);
    playSound('clink', 1); playSound('ding', 0.8);
  }
  return controls;
};

/** What the card's teaching: by the room he's in, while there's anybody in it to do it to; the grabs at the ring. */
const tipFor = (state: GameState, gym: Gym, px: number): GymTip | null => {
  if (!gym.moved) return 'move';
  for (const r of ROOM_ORDER) if (px >= ROOMS[r][0] - 120 && px < ROOMS[r][1] && roomAlive(state, gym, r)) return r;
  if (px >= ROOMS.mix[1] - 40) {
    const next = GRAB_ORDER.find(k => !gym.done.has(k));
    return next ?? 'exit';
  }
  return null;
};

void X0;
