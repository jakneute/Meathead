// The bike. Up the street from where he starts, a few of the local crew are on
// the corner, one of them sat on his bike; they don't like the look of him, and
// he likes the look of the bike. Then it's the long road across town: carried
// along like the jet ski (gun only; ease off and he turns round to shoot back;
// the wheelie's his charge, up + special a bunny hop, down + special in the air
// slams the bike down on something), but the road rolls up and down, and the
// pace is his (pedaling hard, cruising, easing off). The crew come
// after him in their lowriders, the dogs come off their chains, and the road's
// full of junk: jump it, or wheelie through what'll break.
//
// At the end of the road: a man in a hazmat suit, a bottle of the town's water,
// and an open manhole.

import type { Enemy } from '../../../types';
import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import type { Controls } from '../../platform/input';
import { NO_CONTROLS } from '../../platform/input';
import { shakeScreen } from '../../core/state';
import { playSound, playGlassShatterSound } from '../../platform/audio';
import { makeKindEnemy } from '../../enemies/kinds';
import { hurtPlayer } from '../../bosses/shared';
import { rectsOverlap, boundsOf } from '../../core/utils';
import { groundLineAt } from '../../core/terrain';
import { CANVAS_WIDTH, KICK_POSE_FRAMES, GROUND_Y } from '../../../constants';
import { COURSE, CP, RoadJunk } from './course';
import { Talk, queueLines, quiet } from './script';
import { isShat } from '../../player/gut';

export type BikePhase = 'waiting' | 'theft' | 'riding' | 'bottle' | 'wipeout' | 'gone';
/** Things said on the ride, how far down the road (0..1) each comes (queued after whatever's being said). */
const BANTER: { at: number; lines: { who: 'crew' | 'meathead'; text: string }[] }[] = [
  { at: 0.06, lines: [{ who: 'crew', text: 'PULL UP ON HIM! PULL UP!' }] },
  { at: 0.16, lines: [{ who: 'meathead', text: 'MY KNEES ARE HITTING MY CHIN.' }] },
  { at: 0.3, lines: [{ who: 'crew', text: "YOU'RE DEAD, MUSCLES! YOU HEAR ME? DEAD!" }, { who: 'meathead', text: "CAN'T HEAR YOU OVER MY CALVES." }] },
  { at: 0.5, lines: [{ who: 'crew', text: 'HOW IS HE STILL GOING?!' }, { who: 'meathead', text: 'LEG DAY, BABY!' }] },
  { at: 0.72, lines: [{ who: 'meathead', text: "THIS WHOLE TOWN SMELLS LIKE PENNIES." }] },
  { at: 0.88, lines: [{ who: 'crew', text: 'TAYVON GONNA BE SO MAD.' }] },
];
/** The same, when he's shit himself (and he's sat on Tayvon's seat like that). */
const BANTER_SHAT: typeof BANTER = [
  { at: 0.06, lines: [{ who: 'crew', text: 'PULL UP ON HIM! HOLD YOUR BREATH AND PULL UP!' }] },
  { at: 0.16, lines: [{ who: 'meathead', text: 'THIS SEAT IS GETTING WARM.' }] },
  { at: 0.3, lines: [{ who: 'crew', text: "YOU'RE DEAD, SHITPANTS! YOU HEAR ME? DEAD!" }, { who: 'meathead', text: "CAN'T HEAR YOU OVER MY CALVES." }] },
  { at: 0.5, lines: [{ who: 'crew', text: 'HOW IS HE STILL GOING?! HE SHIT HIMSELF!' }, { who: 'meathead', text: 'LEG DAY, BABY!' }] },
  { at: 0.72, lines: [{ who: 'meathead', text: 'THIS WHOLE TOWN SMELLS LIKE ME NOW.' }] },
  { at: 0.88, lines: [{ who: 'crew', text: "TAYVON GONNA HAVE TO BURN THAT SEAT." }] },
];

export interface BikeRun {
  phase: BikePhase;
  t: number;
  /** The cutscenes' beats. */
  step: number;
  stepAt: number;
  /** The kid he took it off: sat on it, flying, then sprawled on the sidewalk. */
  rider: { x: number; y: number; vx: number; vy: number; rot: number; state: 'sitting' | 'flying' | 'down' };
  /** The crew on the corner (gone once they've piled into the car after him). */
  crew: boolean;
  /** His speed along the road (easing up to what he's pedaling for). */
  v: number;
  /** Junk that's been dealt with (smashed, or it smashed him). */
  done: Set<number>;
  /** Which of the waves have come after him. */
  spawned: number;
  hint: string;
  hintT: number;
  hinted: Set<string>;
  /** The bottle: in his hand, thrown (where it is), burst into the trap (where it lies). */
  bottle: { x: number; y: number; vx: number; vy: number; state: 'held' | 'thrown' | 'trap' };
  /** The wipeout: him tumbling through the air, the bike cartwheeling off. */
  fly: { x: number; y: number; vx: number; vy: number; rot: number };
  bikeWreck: { x: number; y: number; vx: number; vy: number; rot: number };
  /** The zoom in on the bottle (0 none .. 1 all the way). */
  zoom: number;
  /** How much of the ride's banter's been said. */
  said: number;
  /** Where the camera was last frame (the crew's rounds go along with the screen: see riding). */
  camX: number;
  /** The last frame he was boosting (a wheelie): hitting a ramp or a car soon after still counts. */
  boostAt: number;
  /** In the air off a ramp: coming down on a car, he just goes up again. */
  rampAir: boolean;
  /** When he first ran into each bit of junk (frame): a wheelie a moment late, still touching it, still counts. */
  touched: Map<number, number>;
  /** The ramps that have been called out coming up (a ding, once each). */
  rampCalled: Set<number>;
}

/** Speeds: easing off, cruising, pedaling hard. */
const BIKE_SLOW = 4.5, BIKE_BASE = 7, BIKE_FAST = 10, BIKE_MIN = 3;
/** How far ahead of him the camera looks. */
const BIKE_LEAD = 90;
/** What each bit of junk does to him if he rides into it. */
const JUNK_DAMAGE: Record<RoadJunk['look'], number> = { cones: 0, trash: 8, pothole: 7, glass: 6, car: 14, hydrant: 7, ramp: 0, barrier: 8 };

export const createBikeRun = (state: GameState, startedAt: number): BikeRun => {
  const onBike = startedAt === CP.ROAD || startedAt === CP.ROAD_MID;
  const past = startedAt > CP.ROAD_MID;
  const b: BikeRun = {
    phase: past ? 'gone' : onBike ? 'riding' : 'waiting', t: 0, step: 0, stepAt: 0,
    rider: { x: COURSE.hood.bike, y: GROUND_Y, vx: 0, vy: 0, rot: 0, state: onBike || past ? 'down' : 'sitting' },
    crew: !onBike && !past, v: onBike ? BIKE_BASE : 0, done: new Set(), spawned: 0, hint: '', hintT: 0, hinted: new Set(), rampCalled: new Set(), touched: new Map(),
    bottle: { x: COURSE.road.hazmat, y: GROUND_Y - 60, vx: 0, vy: 0, state: 'held' },
    fly: { x: 0, y: 0, vx: 0, vy: 0, rot: 0 }, bikeWreck: { x: 0, y: 0, vx: 0, vy: 0, rot: 0 }, zoom: 0, said: 0, camX: NaN, boostAt: -999, rampAir: false,
  };
  if (onBike) {
    mount(state);
    // (only what comes after him from here on)
    const from = COURSE.checkpoints[startedAt].x;
    b.spawned = COURSE.waves.findIndex(w => w.at > from + 200);
    if (b.spawned < 0) b.spawned = COURSE.waves.length;
    COURSE.junk.forEach((j, i) => { if (j.x < from + 300) b.done.add(i); });
    const k = (from - COURSE.road.x1) / (COURSE.road.hazmat - COURSE.road.x1);
    b.said = BANTER.filter(x => x.at <= k).length;
  }
  if (!onBike && !past) {
    // (no going up the road on foot)
    state.blocks.push({ x: COURSE.hood.bike + 90, y: GROUND_Y - 3000, w: 40, h: 3000, type: 'wall', hidden: true, tag: 'corner-end' });
  }
  return b;
};

/** On the bike: carried along like the jet ski (gun only), pedaling. */
const mount = (state: GameState) => {
  const p = state.player;
  p.skiing = true; p.jetski = true; p.bike = true; p.skiSpeed = BIKE_BASE;
  p.currentWeapon = 'GUN';
  state.lockWeapon = 'GUN';
  state.cameraLeadX = BIKE_LEAD;
};

const dismount = (state: GameState) => {
  const p = state.player;
  p.skiing = false; p.jetski = false; p.bike = false; p.skiSpeed = 0;
  state.lockWeapon = undefined;
  state.cameraLeadX = 0;
};

export const updateBikeRun = (ctx: FrameContext, b: BikeRun, talk: Talk, controls: Controls, onSewer: () => void): Controls => {
  const { state } = ctx;
  const p = state.player;
  b.t++;
  if (b.hintT > 0 && ++b.hintT > 200) b.hintT = 0;
  updateRider(state, b);
  switch (b.phase) {
    case 'waiting':
      if (p.isGrounded && p.pos.x + p.width / 2 > COURSE.hood.stop - 60) { b.phase = 'theft'; b.t = 0; b.step = 0; b.stepAt = 0; }
      return controls;
    case 'theft': return theft(ctx, b, talk);
    case 'riding': return riding(ctx, b, talk, controls);
    case 'bottle': return bottle(ctx, b, talk);
    case 'wipeout': return wipeout(ctx, b, onSewer);
    default: return controls;
  }
};

// ---------------------------------------------------------------------------
// The corner
// ---------------------------------------------------------------------------

const theft = (ctx: FrameContext, b: BikeRun, talk: Talk): Controls => {
  const { state, fx } = ctx;
  const p = state.player;
  const H = COURSE.hood;
  state.cameraOverride = { x: H.corner - 470, y: GROUND_Y - 550 };
  p.invincibilityTimer = Math.max(p.invincibilityTimer, 2);
  p.inCutscene = true;
  p.facing = 1;
  let c: Controls = { ...NO_CONTROLS };
  const since = b.t - b.stepAt;
  const next = () => { b.step++; b.stepAt = b.t; };
  switch (b.step) {
    case 0:
      // Walking up on them, talking as he goes
      // (they're mid-conversation; it carries on over the jacking and the ride, whatever he's doing)
      queueLines(state, talk, [
        { who: 'crew', text: 'NAH, THE WATER ALWAYS BEEN THAT COLOR.' },
        { who: 'rider', text: 'MY GRANDMA SAYS IT GOT FLAVOR NOW.' },
        { who: 'crew', text: isShat(state) ? "YO. WHAT'S THAT SMELL? IT'S THIS BIG DUDE." : "YO. WHO'S THIS BIG DUDE?" },
        { who: 'meathead', text: isShat(state) ? "NICE BIKE. I'M TAKING IT. DON'T SNIFF THE SEAT AFTER." : "NICE BIKE. I'M TAKING IT." },
      ], 0);
      next();
      break;
    case 1:
      // Up to the bike, and the boot (he doesn't wait on the conversation)
      if (p.pos.x + p.width / 2 < H.bike - 46) { c = { ...c, right: true }; break; }
      if (!p.kickPose) {
        p.kickPose = KICK_POSE_FRAMES;
        const r = b.rider;
        r.state = 'flying'; r.vx = 9; r.vy = -12;
        shakeScreen(state, 10, 5);
        fx.playGunSound('punch');
        next();
      }
      break;
    case 2:
      // On it, and gone (the crew yelling after him as he goes)
      if (since === 14) { mount(state); b.v = 0; p.pos.x = H.bike - p.width / 2; }
      if (since === 22) {
        queueLines(state, talk, [{ who: 'rider', text: 'NIGGA STOLE MY BIKE!' }, { who: 'rider', text: isShat(state) ? "AYYY! HE'S GOT SHIT ALL OVER MY BIRTHDAY BIKE!" : 'AYYY! THAT WAS MY BIRTHDAY BIKE!' }, { who: 'crew', text: isShat(state) ? "HE SHAT ON TAYVON'S BIKE! GET THE CAR!" : "HE TOOK TAYVON'S BIKE! GET THE CAR!" }, { who: 'meathead', text: 'RING RING, BITCHES.' }]);
        b.crew = false;
        b.phase = 'riding'; b.t = 0;
        state.cameraOverride = null;
        p.inCutscene = false;
        state.blocks = state.blocks.filter(bl => bl.tag !== 'corner-end');
        state.checkpoint = Math.max(state.checkpoint, CP.ROAD);
        b.v = BIKE_BASE;
        fx.spawnDamageNumber({ x: p.pos.x - 40, y: p.pos.y - 60 }, 'PEDAL!', true, '#FDE68A');
      }
      break;
  }
  return c;
};

const updateRider = (state: GameState, b: BikeRun) => {
  const r = b.rider;
  if (r.state !== 'flying') return;
  r.vy += 0.5; r.x += r.vx; r.y += r.vy; r.rot += 0.3;
  const ground = groundLineAt(state.groundRuns, r.x);
  if (r.vy > 0 && r.y >= ground) { r.state = 'down'; r.y = ground; r.rot = Math.PI / 2; playSound('thud'); }
};

// ---------------------------------------------------------------------------
// The road
// ---------------------------------------------------------------------------

const riding = (ctx: FrameContext, b: BikeRun, talk: Talk, controls: Controls): Controls => {
  const { state } = ctx;
  const p = state.player;
  if (!p.bike) mount(state);
  p.currentWeapon = 'GUN';
  const px = p.pos.x + p.width / 2;
  // Near the end: out of his hands, braking to a stop to see who's that in the road
  const R = COURSE.road;
  if (px > R.hazmat - 700) {
    b.phase = 'bottle'; b.t = 0; b.step = 0; b.stepAt = 0;
    return { ...NO_CONTROLS };
  }
  // The pace: pedaling hard, easing off (and turned to shoot back), or cruising
  const want = controls.right ? BIKE_FAST : controls.left ? BIKE_SLOW : BIKE_BASE;
  if (p.isGrounded) b.v = Math.max(BIKE_MIN, b.v + (want - b.v) * 0.035);
  p.skiSpeed = b.v;
  // Everything behind that's been left far behind gave up (and a car that's driven off is gone)
  state.enemies = state.enemies.filter(e => e.type === 'boss' || e.kind === 'amalgam' || e.pos.x > R.x2
    || (e.pos.x > state.camera.x - 700 && e.pos.x < state.camera.x + (e.kind === 'lowrider' && e.aiState === 'leave' ? CANVAS_WIDTH + 160 : 1800)));
  if (p.isCharging) b.boostAt = state.frame;
  spawnWaves(state, b);
  if (p.isGrounded) b.rampAir = false;
  // The crew's rounds fly the way they were fired at the same speed across the screen, whatever anyone's doing (they're
  // carried along with the road going by: none of them hang in the air, or crawl, or drift backward)
  const camDx = Number.isNaN(b.camX) ? 0 : state.camera.x - b.camX;
  b.camX = state.camera.x;
  if (camDx) for (const q of state.projectiles) if (q.owner === 'enemy' && q.shot === 'tracer') q.pos.x += camDx;
  // A ramp coming up, still off the screen: a ding as the call-out goes up (the stage draws it)
  const next = nextRamp(state, b);
  if (next && next.offscreen && !b.rampCalled.has(next.i)) { b.rampCalled.add(next.i); playSound('alert'); }
  // (a wheelie popped this very frame counts already: the moves go in after this)
  // (a wheelie on the ground or in the air, that is: up + special is the bunny hop, down + special in the air the slam)
  const wheelieNow = controls.charge || (controls.special && !controls.up && !(controls.down && !p.isGrounded));
  if (wheelieNow && (p.isCharging || p.power >= 1 || ctx.cheats.infinitePower)) b.boostAt = state.frame;
  junk(ctx, b);
  teach(state, b);
  banter(state, b, talk);
  // Dust off the back tire
  if (p.isGrounded && state.frame % 3 === 0) state.particles.push({ pos: { x: p.pos.x + 2, y: p.pos.y + p.height - 3 }, vel: { x: -1 - Math.random() * 2, y: -Math.random() * 1.5 }, life: 16, color: 'rgba(168, 162, 158, 0.7)', size: 3 + Math.random() * 3 });
  return controls;
};

const spawnWaves = (state: GameState, b: BikeRun) => {
  const p = state.player;
  while (b.spawned < COURSE.waves.length && COURSE.waves[b.spawned].at <= p.pos.x) {
    const w = COURSE.waves[b.spawned++];
    // (two dogs on him at once is plenty)
    if (w.kind === 'pitbull' && state.enemies.filter(e => e.kind === 'pitbull' && e.health > 0).length >= 2) continue;
    // (a car always comes up from behind; the one that was out in front drives off to make way for it)
    const behind = w.from === 'behind' || w.kind === 'lowrider';
    if (w.kind === 'lowrider') for (const o of state.enemies) if (o.kind === 'lowrider' && o.health > 0 && o.aiState !== 'overtake' && o.aiState !== 'lost') o.aiState = 'leave';
    const x = behind ? state.camera.x - (w.kind === 'lowrider' ? 110 : 50) : state.camera.x + CANVAS_WIDTH + 110;
    const e: Enemy = makeKindEnemy(w.kind, x, groundLineAt(state.groundRuns, x));
    e.variant = w.variant ?? 0;
    e.aiState = w.kind === 'lowrider' ? 'overtake' : 'chase';
    e.vel.x = p.vel.x + (w.from === 'behind' ? 2 : -1);
    e.shootTimer = 40;
    state.enemies.push(e);
  }
};

/** Where a bit of junk sits (its box, on the road). */
export const junkBox = (state: GameState, j: RoadJunk) => {
  const g = groundLineAt(state.groundRuns, j.x);
  switch (j.look) {
    case 'cones': return { x: j.x - 40, y: g - 26, w: 80, h: 26 };
    case 'trash': return { x: j.x - 26, y: g - 40, w: 52, h: 40 };
    case 'pothole': return { x: j.x - 34, y: g - 6, w: 68, h: 8 };
    case 'glass': return { x: j.x - 40, y: g - 6, w: 80, h: 8 };
    case 'car': return { x: j.x - 62, y: g - 40, w: 124, h: 40 };
    case 'hydrant': return { x: j.x - 12, y: g - 34, w: 24, h: 34 };
    case 'ramp': return { x: j.x - 70, y: g - 40, w: 140, h: 40 };
    case 'barrier': return { x: j.x - 30, y: g - 44, w: 60, h: 44 };
  }
};

/** When the hydrant's geyser is going (it has a rhythm: you can time it). */
export const geyserOn = (j: RoadJunk, frame: number) => ((frame + Math.abs(j.x)) % 150) < 60;

const junk = (ctx: FrameContext, b: BikeRun) => {
  const { state, fx } = ctx;
  const p = state.player;
  const pb = boundsOf(p);
  COURSE.junk.forEach((j, i) => {
    if (b.done.has(i) || Math.abs(j.x - p.pos.x) > 200) return;
    const box = junkBox(state, j);
    // The hydrant's geyser: a column of water straight up (it'll knock him flying if he's in it when it goes)
    if (j.look === 'hydrant' && geyserOn(j, state.frame) && rectsOverlap(pb, { x: j.x - 16, y: box.y - 220, w: 32, h: 220 }) && p.invincibilityTimer <= 0) {
      hurtPlayer(ctx, JUNK_DAMAGE.hydrant, 'hydrant', { x: -2, y: -12 });
      fx.spawnDamageNumber({ x: p.pos.x - 30, y: p.pos.y - 40 }, 'HOSED!', true, '#7DD3FC');
      b.done.add(i);
      return;
    }
    if (!rectsOverlap(pb, box)) return;
    if (!b.touched.has(i)) b.touched.set(i, state.frame);
    // (hit it a moment ago and still on it: a late wheelie still gets him out of it)
    const late = state.frame - b.touched.get(i)! < LATE_GRACE;
    if (j.look === 'ramp') {
      // Boosting into it (a wheelie, or one just now, or popped while he's already on it) and it's a big one: off the top
      // and high into the air, faster. Otherwise he just rolls over it
      if (boosting(state, b)) {
        launch(ctx, b, -17.5, 'SICK JUMP!');
        b.v = Math.min(BIKE_FAST + 3, b.v + 3); b.done.add(i);
        rampAway(ctx, b);
        for (let k = 0; k < 14; k++) state.particles.push({ pos: { x: p.pos.x + p.width / 2, y: box.y }, vel: { x: -2 - Math.random() * 4, y: -Math.random() * 4 }, life: 26, color: k % 2 ? '#FDE047' : '#F8FAFC', size: 3 + Math.random() * 4 });
      }
      return;
    }
    // The bunny hop or the slam into a parked car: wrecked (the bike's fine, somehow)
    if (j.look === 'car' && (p.isUppercutting || p.isDivekicking)) {
      b.done.add(i);
      smash(state, j, box);
      shakeScreen(state, 10, 6);
      fx.spawnDamageNumber({ x: j.x - 30, y: box.y - 30 }, 'WRECKED!', true, '#FDE047');
      return;
    }
    // Coming down on a wrecked car off a ramp: off the roof and up again
    if (j.look === 'car' && b.rampAir && !p.isGrounded && p.vel.y > 0) { launch(ctx, b, -17.5, 'AGAIN!'); b.v = Math.min(BIKE_FAST + 3, b.v + 3); b.done.add(i); rampAway(ctx, b); return; }
    // Boosting into a wrecked car: up and over it, no harm done
    if (j.look === 'car' && boosting(state, b)) { launch(ctx, b, -15, 'OVER IT!'); b.v = Math.min(BIKE_FAST + 3, b.v + 3); b.done.add(i); rampAway(ctx, b); return; }
    // Cones go flying whatever; the rest break if he wheelies through them (not a parked car: that he has to clear)
    const breaks = j.look === 'cones' || ((boosting(state, b) || p.isDivekicking || p.isUppercutting) && j.look !== 'car' && j.look !== 'pothole');
    if (breaks) {
      b.done.add(i);
      smash(state, j, box);
      if (j.look !== 'cones') fx.spawnDamageNumber({ x: j.x - 30, y: box.y - 30 }, 'SMASHED!', true, '#FDE047');
      return;
    }
    // (in the air over the flat stuff he's fine; the tall stuff he has to be over, not into)
    if (!p.isGrounded && (j.look === 'pothole' || j.look === 'glass')) return;
    if (p.invincibilityTimer > 0) return;
    // (a moment's grace before it counts as riding into it: time for a late wheelie. Not a pothole: nothing to wheelie)
    if (late && j.look !== 'pothole') return;
    b.done.add(i);
    hurtPlayer(ctx, JUNK_DAMAGE[j.look], `road_${j.look}`, { x: -3, y: -8 });
    if (j.look === 'car') b.v = 2;
    if (j.look === 'glass') b.v = Math.max(BIKE_MIN, b.v * 0.5);
    smash(state, j, box);
    fx.spawnDamageNumber({ x: p.pos.x - 30, y: p.pos.y - 40 }, { trash: 'GARBAGE DAY!', pothole: 'POTHOLE!', glass: 'FLAT TIRE!', car: 'FENDER BENDER!', barrier: 'ROAD CLOSED!', hydrant: 'HOSED!', cones: '', ramp: '' }[j.look], true, '#F97316');
  });
};

/** How far ahead a ramp's called out (well before it's on the screen: about three seconds at a cruise). */
export const RAMP_CALL = 1700;
/** What has to be jumped (or launched off) to get past it: no wheelieing through these. */
const MUST_CLEAR: RoadJunk['look'][] = ['pothole', 'car'];

/**
 * The next ramp he hasn't gone over, if it's close enough to call out: which, how far, whether it's still off the
 * screen. Not while there's something to jump between him and it (he'd be told to wheelie with a pothole or a car to
 * get over first): it's called once that's behind him, if it's still off the screen by then.
 */
export const nextRamp = (state: GameState, b: BikeRun) => {
  const p = state.player;
  const px = p.pos.x + p.width;
  const i = COURSE.junk.findIndex((j, k) => j.look === 'ramp' && !b.done.has(k) && j.x - 70 > px);
  if (i < 0) return null;
  const j = COURSE.junk[i];
  const dist = j.x - 70 - px;
  if (dist > RAMP_CALL) return null;
  if (COURSE.junk.some((o, k) => MUST_CLEAR.includes(o.look) && !b.done.has(k) && o.x + 70 > p.pos.x && o.x < j.x)) return null;
  return { i, dist, offscreen: j.x - 70 > state.camera.x + CANVAS_WIDTH };
};

/** Boosting: a wheelie going now, or one in the last half second (a tap's enough). */
const BOOST_GRACE = 30;
/** Frames into something before it counts as a crash (a late wheelie in them still clears it). */
const LATE_GRACE = 7;
const boosting = (state: GameState, b: BikeRun) => state.player.isCharging || state.frame - b.boostAt < BOOST_GRACE;

/** Up into the air off something he boosted into (the wheelie's over: he's flying). */
const launch = (ctx: FrameContext, b: BikeRun, vy: number, callout: string) => {
  const { state, fx } = ctx;
  const p = state.player;
  p.isCharging = false; p.isSliding = false;
  p.vel.y = vy; p.isGrounded = false;
  p.invincibilityTimer = Math.max(p.invincibilityTimer, 30);
  b.boostAt = -999;
  fx.spawnDamageNumber({ x: p.pos.x - 30, y: p.pos.y - 60 }, callout, true, '#4ADE80');
  shakeScreen(state, 10, 4); playSound('horn');
};

/** Off a ramp: up and away, faster than the cars out in front shooting at him (they're left behind, out of it). */
const rampAway = (ctx: FrameContext, b: BikeRun) => {
  const { state, fx } = ctx;
  b.rampAir = true;
  for (const e of state.enemies) {
    if (e.kind !== 'lowrider' || e.health <= 0 || e.aiState !== 'hold') continue;
    e.aiState = 'lost'; e.aiTimer = 0;
    // (it stands on the brakes: behind him before he's come down)
    e.vel.x = Math.min(e.vel.x, state.player.vel.x - 11);
    for (let k = 0; k < 12; k++) state.particles.push({ pos: { x: e.pos.x + (k % 2 ? 20 : e.width - 20), y: e.pos.y + e.height - 4 }, vel: { x: 2 + Math.random() * 4, y: -Math.random() * 2 }, life: 30, color: 'rgba(214, 211, 209, 0.8)', size: 5 + Math.random() * 5 });
    fx.spawnDamageNumber({ x: e.pos.x + 20, y: e.pos.y - 30 }, 'LEFT BEHIND!', true, '#FDE047');
  }
};

const smash = (state: GameState, j: RoadJunk, box: { x: number; y: number; w: number; h: number }) => {
  const colors = j.look === 'cones' ? ['#F97316', '#F8FAFC'] : j.look === 'trash' ? ['#374151', '#65A30D', '#A16207', '#F8FAFC'] : j.look === 'barrier' ? ['#F97316', '#F8FAFC', '#78350F'] : j.look === 'car' ? ['#44403C', '#DC2626', '#93C5FD'] : ['#E0F2FE', '#94A3B8'];
  for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: box.x + box.w / 2, y: box.y + box.h / 2 }, vel: { x: 2 + Math.random() * 8, y: -2 - Math.random() * 7 }, life: 30 + Math.random() * 20, color: colors[i % colors.length], size: 3 + Math.random() * 5 });
  if (j.look === 'glass' || j.look === 'car') playGlassShatterSound(); else playSound('crunch');
};

/** The ride's banter, as he gets down the road (the crew's lines only while they're after him in a car). */
const banter = (state: GameState, b: BikeRun, talk: Talk) => {
  const R = COURSE.road;
  const k = (state.player.pos.x - R.x1) / (R.hazmat - R.x1);
  const said = isShat(state) ? BANTER_SHAT : BANTER;
  while (b.said < said.length && k >= said[b.said].at) {
    const beat = said[b.said++];
    const car = state.enemies.some(e => e.kind === 'lowrider' && e.health > 0);
    const lines = beat.lines.filter(l => l.who !== 'crew' || car);
    if (lines.length && talk.queue.length < 3) queueLines(state, talk, lines.map(l => ({ ...l })));
  }
};

const hint = (b: BikeRun, text: string) => { if (b.hinted.has(text)) return; b.hinted.add(text); b.hint = text; b.hintT = 1; };

/** What to do, the first time it's the thing to do (never naming a button). */
const teach = (state: GameState, b: BikeRun) => {
  if (b.hintT > 0) return;
  const p = state.player;
  const px = p.pos.x + p.width / 2;
  const cam = state.camera;
  const live = state.enemies.filter(e => e.health > 0 && !e.isBlownAway && e.pos.x + e.width > cam.x + 20 && e.pos.x < cam.x + CANVAS_WIDTH - 20);
  const ahead = COURSE.junk.find((j, i) => !b.done.has(i) && j.x > px && j.x < px + 420);
  if (state.enemies.some(e => e.kind === 'lowrider' && e.aiState === 'overtake' && e.pos.x + e.width > px - 500 && e.pos.x < px)) hint(b, 'CAR COMING UP BEHIND YOU: JUMP IT!');
  else if (live.some(e => e.kind === 'pitbull' && e.pos.x + e.width < px - 60)) hint(b, 'DOGS! EASE OFF TO TURN AROUND AND SHOOT BEHIND YOU');
  else if (b.rampAir && !p.isGrounded && ahead?.look === 'car') hint(b, 'COME DOWN ON A PARKED CAR TO RAMP OFF IT AGAIN');
  else if (ahead?.look === 'ramp') hint(b, 'WHEELIE INTO THE RAMP FOR A SICK JUMP');
  else if (ahead?.look === 'trash' || ahead?.look === 'barrier') hint(b, 'WHEELIE THROUGH IT, OR JUMP IT');
  else if (ahead?.look === 'car') hint(b, 'A PARKED CAR: WHEELIE INTO IT TO RAMP OFF IT, OR JUMP IT');
};

// ---------------------------------------------------------------------------
// The end of the road
// ---------------------------------------------------------------------------

/** The bottle: it's thrown this many frames into the scene... */
const bottleSteps = { STOP: 0, ZOOM: 1, TALK: 2, THROW: 3, TRAP: 4, GO: 5 };

const bottle = (ctx: FrameContext, b: BikeRun, talk: Talk): Controls => {
  const { state, fx } = ctx;
  const p = state.player;
  const R = COURSE.road;
  p.inCutscene = true;
  p.invincibilityTimer = Math.max(p.invincibilityTimer, 2);
  p.facing = 1;
  // Everybody else is gone: this is between the two of them
  state.enemies = state.enemies.filter(e => e.type === 'boss' || e.pos.x > R.x2);
  state.projectiles = state.projectiles.filter(pr => pr.owner === 'player');
  const since = b.t - b.stepAt;
  const next = () => { b.step++; b.stepAt = b.t; };
  const px = p.pos.x + p.width / 2;
  const stopAt = R.hazmat - 330;
  // (the whole of the open manhole on the screen, its cover and all: that's where he's going)
  state.cameraOverride = { x: bottleCamX(), y: GROUND_Y - 550 };
  const bt = b.bottle;
  switch (b.step) {
    case bottleSteps.STOP:
      // Coasting in, braking to a stop to look at him
      b.v = Math.max(0, Math.min(b.v, (stopAt - px) * 0.08));
      if (b.v < 0.3 && p.isGrounded) { b.v = 0; queueLines(state, talk, [{ who: 'meathead', text: "WHO'S THE ASTRONAUT?" }], 10); next(); }
      break;
    case bottleSteps.ZOOM:
      // In on what he's holding up: a bottle of the town's finest
      b.zoom = Math.min(1, since / 50);
      if (since === 40) queueLines(state, talk, [{ who: 'hazmat', text: isShat(state) ? 'COMPLIMENTS OF THE CITY OF FLINT. AND, SIR? YOUR PANTS.' : 'COMPLIMENTS OF THE CITY OF FLINT.' }]);
      if (since > 70 && quiet(talk)) next();
      break;
    case bottleSteps.TALK:
      b.zoom = Math.max(0, 1 - since / 30);
      if (since === 30) queueLines(state, talk, [{ who: 'hazmat', text: isShat(state) ? "DRINK UP. IT'S CLEANER THAN YOU." : 'DRINK UP.' }]);
      if (since > 40 && quiet(talk)) next();
      break;
    case bottleSteps.THROW:
      if (since === 1) { bt.state = 'thrown'; bt.x = R.hazmat - 14; bt.y = GROUND_Y - 58; bt.vx = -5.5; bt.vy = -7; playSound('whoosh'); }
      bt.vy += 0.5; bt.x += bt.vx; bt.y += bt.vy;
      if (bt.state === 'thrown' && bt.y >= GROUND_Y - 4) {
        // It bursts: glass, and a spreading, smoking, bubbling pool of it
        bt.state = 'trap'; bt.y = GROUND_Y;
        playGlassShatterSound(); playSound('splash');
        shakeScreen(state, 12, 5);
        for (let i = 0; i < 24; i++) state.particles.push({ pos: { x: bt.x, y: GROUND_Y - 6 }, vel: { x: (Math.random() - 0.5) * 9, y: -2 - Math.random() * 8 }, life: 30 + Math.random() * 20, color: i % 3 ? '#A3E635' : '#E0F2FE', size: 3 + Math.random() * 5 });
        next();
      }
      break;
    case bottleSteps.TRAP:
      if (since === 30) queueLines(state, talk, [{ who: 'meathead', text: "PFFT. IT'S A PUDDLE." }]);
      if (since > 40 && quiet(talk)) { b.v = 0; next(); }
      break;
    case bottleSteps.GO:
      // Pedaling straight at it, and into it: the tires go, and so does he
      b.v = Math.min(9, b.v + 0.35);
      if (px > bt.x - 10) {
        b.phase = 'wipeout'; b.t = 0;
        dismount(state);
        p.hidden = true;
        b.fly = { x: px, y: p.pos.y + p.height / 2, vx: 7.5, vy: -14, rot: 0 };
        b.bikeWreck = { x: px, y: GROUND_Y - 14, vx: 4, vy: -8, rot: 0 };
        shakeScreen(state, 18, 8);
        playSound('splash'); playSound('crash');
        fx.spawnDamageNumber({ x: px - 40, y: p.pos.y - 50 }, 'MELTED TIRES!', true, '#A3E635');
        queueLines(state, talk, [{ who: 'meathead', text: 'MY TIIIIIIRES!' }]);
        for (let i = 0; i < 20; i++) state.particles.push({ pos: { x: px, y: GROUND_Y - 6 }, vel: { x: (Math.random() - 0.3) * 8, y: -3 - Math.random() * 6 }, life: 40, color: i % 2 ? '#1C1917' : '#A3E635', size: 4 + Math.random() * 5 });
      }
      break;
  }
  p.skiSpeed = b.v;
  return { ...NO_CONTROLS };
};

/** Up in the air, end over end, the bike cartwheeling off, and down the open manhole. */
const wipeout = (ctx: FrameContext, b: BikeRun, onSewer: () => void): Controls => {
  const { state } = ctx;
  const p = state.player;
  const R = COURSE.road;
  const f = b.fly, w = b.bikeWreck;
  p.inCutscene = true; p.hidden = true;
  p.invincibilityTimer = Math.max(p.invincibilityTimer, 2);
  p.vel = { x: 0, y: 0 };
  // His arc comes down right on the manhole
  if (b.t === 1) { const air = 42; f.vx = (R.manhole - f.x) / air; f.vy = -(0.5 * 0.7 * air) + (GROUND_Y - 10 - f.y) / air; }
  f.vy += 0.7; f.x += f.vx; f.y += f.vy; f.rot += 0.35;
  if (f.y > GROUND_Y + 30) { f.vx *= 0.8; }
  w.vy += 0.6; w.x += w.vx; w.y += w.vy; w.rot += 0.25;
  if (w.y > GROUND_Y - 14 && w.vy > 0) { w.y = GROUND_Y - 14; w.vy *= -0.4; w.vx *= 0.7; }
  p.pos.x = f.x - p.width / 2; p.pos.y = Math.min(f.y, GROUND_Y - p.height) - p.height / 2;
  if (b.t === 60) playSound('splash');
  if (b.t === 90) { b.phase = 'gone'; onSewer(); }
  return { ...NO_CONTROLS };
};

/** The zoom on the bottle (for the stage's zoom hook). */
/** Where the camera sits for the man with the bottle and what follows (the manhole's right there on the screen). */
const bottleCamX = () => COURSE.road.manhole + 110 - CANVAS_WIDTH;
export const bottleZoom = (b: BikeRun) => (b.phase === 'bottle' && b.zoom > 0 ? { scale: 1 + b.zoom * 2.2, x: COURSE.road.hazmat - 16, y: GROUND_Y - 84, shiftX: 400 - (COURSE.road.hazmat - 16 - bottleCamX()), shiftY: 0 } : null);

export const isRidingBike = (b: BikeRun) => b.phase === 'riding';

/** How he died on the road. */
export const bikeDeathMessage = (b: BikeRun): string | undefined => {
  if (b.phase !== 'riding') return undefined;
  const l = ['ROADKILL', "DRIVE-BY'D", 'SHOULD HAVE WORN A HELMET', 'FLINT: 1, MEATHEAD: 0', 'TAYVON WANTS HIS BIKE BACK'];
  return l[Math.floor(Math.random() * l.length)];
};
