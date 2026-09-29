// The break room: a little prefab bunker out in the field, the union inside on
// their break (a nap on the couch, a hand of cards, the foreman with his coffee,
// somebody at the microwave). None of them can be touched in here, and the far
// door stays locked till break's over. There's a gas line along the wall with a
// rusted joint in it: shoot it and gas seeps out, quietly, filling the room (not
// one of them notices). Then put a flame to it. The room goes up, the roof and
// the far door with it, and everybody's break is over. They're furious. He runs
// out the far side, where the bikers are sat on their choppers: kicks one off
// his, and he's gone. (Dirty Dan's, as it happens: the rest of them stood
// round it admiring the machine gun he's got across his handlebars. He takes
// that too.)
//
// Or he can just wait. It's a few minutes (the foreman keeps count), but break
// does end: they clock back in, the far door's unlocked, and he walks out, the
// room and everybody in it none the worse, to the same bikers out back.

import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import type { Controls } from '../../platform/input';
import { NO_CONTROLS } from '../../platform/input';
import { shakeScreen } from '../../core/state';
import { playSound } from '../../platform/audio';
import { rectsOverlap, boundsOf } from '../../core/utils';
import { GROUND_Y, CANVAS_WIDTH, KICK_POSE_FRAMES } from '../../../constants';
import { COURSE, CP } from './course';
import { Talk, queueLines, quiet, hush } from './script';
import { mountMoto } from './moto';

export type BunkerPhase = 'waiting' | 'break' | 'clockout' | 'open' | 'boom' | 'aftermath' | 'runout' | 'ride' | 'done';
export type WorkerLook = 'couch' | 'cards' | 'cards2' | 'foreman' | 'microwave';
export interface Worker { x: number; look: WorkerLook; state: 'break' | 'knocked' | 'furious' | 'gone' | 'clocked'; t: number }
export interface Debris { x: number; y: number; vx: number; vy: number; rot: number; vr: number; w: number; h: number; color: string; life: number }
/** One of the bikers out back: sat on his chopper (Dirty Dan, the first, with the machine gun), stood round it admiring it, or kicked flying. */
export interface Biker { x: number; y: number; vx: number; vy: number; rot: number; state: 'sitting' | 'standing' | 'flying' | 'down' }

export interface Bunker {
  phase: BunkerPhase;
  t: number;
  /** The gas line's joint's been shot out (and when); how much gas is in the room (0..1). */
  popped: boolean;
  poppedAt: number;
  gas: number;
  workers: Worker[];
  /** What's been said to nudge him (once each), and when the room last said something to itself. */
  hinted: Set<string>;
  ambientAt: number;
  ambient: number;
  debris: Debris[];
  bikers: Biker[];
  /** The cutscene's beats. */
  step: number;
  stepAt: number;
  /** When he last said something about trying the flamethrower too early. */
  earlyAt: number;
  /** He waited the break out: the room's still standing, and everybody in it went back to work. */
  peaceful: boolean;
}

/** Enough gas in the room to go up, and how long it takes to fill (frames). */
const GAS_ENOUGH = 0.35, GAS_FILL = 420;
/** How long what's left of their break lasts once he's in there (five minutes), and a minute of it. */
const BREAK_FRAMES = 5 * 60 * 60, MINUTE = 60 * 60;
const NUMBERS = ['NO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'];

export const createBunker = (state: GameState, startedAt: number): Bunker => {
  const B = COURSE.bunker;
  const done = startedAt >= CP.CHASE;
  const b: Bunker = {
    phase: done ? 'done' : 'waiting', t: 0, popped: false, poppedAt: 0, gas: 0,
    workers: [
      { x: B.x1 + 110, look: 'couch', state: 'break', t: 0 },
      { x: B.x1 + 290, look: 'cards', state: 'break', t: 0 },
      { x: B.x1 + 400, look: 'cards2', state: 'break', t: 0 },
      { x: B.x1 + 500, look: 'foreman', state: 'break', t: 0 },
      { x: B.x1 + 620, look: 'microwave', state: 'break', t: 0 },
    ],
    hinted: new Set(), ambientAt: 0, ambient: 0, debris: [],
    bikers: B.bikers.map((x, i) => ({ x, y: GROUND_Y, vx: 0, vy: 0, rot: 0, state: i === 0 || i === 3 ? 'sitting' as const : 'standing' as const })),
    step: 0, stepAt: 0, earlyAt: -999, peaceful: false,
  };
  if (!done) {
    // The roof, and the far door (locked till break's over: and no going over the top of it)
    state.blocks.push({ x: B.x1, y: B.roof - 40, w: B.x2 - B.x1, h: 40, type: 'wall', hidden: true, tag: 'bunker-roof' });
    state.blocks.push({ x: B.x2 - 20, y: GROUND_Y - 3000, w: 20, h: 3000, type: 'wall', hidden: true, tag: 'bunker-door' });
  }
  return b;
};

/** Where the gas line can be shot out. */
export const veinBox = () => ({ x: COURSE.bunker.vein.x - 16, y: COURSE.bunker.vein.y - 11, w: 32, h: 22 });

const AMBIENT: { who: 'worker' | 'foreman'; text: string }[] = [
  { who: 'worker', text: 'GIN.' },
  { who: 'foreman', text: 'MINUTES LEFT' },
  { who: 'worker', text: 'WHO TOOK MY YOGURT? IT HAD MY NAME ON IT.' },
  { who: 'foreman', text: 'THIS COFFEE TASTES LIKE THE WELL WATER.' },
  { who: 'worker', text: 'GO FISH.' },
  { who: 'foreman', text: "DON'T LOOK AT THE CLOCK. THE CLOCK CAN'T HURT YOU." },
];

export const updateBunker = (ctx: FrameContext, b: Bunker, talk: Talk, controls: Controls, onGone: () => void): Controls => {
  const { state } = ctx;
  const p = state.player;
  const B = COURSE.bunker;
  b.t++;
  updateDebris(b);
  updateBikers(b);
  for (const w of b.workers) w.t++;
  const px = p.pos.x + p.width / 2;
  const inside = px > B.x1 && px < B.x2;
  switch (b.phase) {
    case 'waiting':
      if (px > B.x1 + 40 && p.isGrounded) {
        b.phase = 'break'; b.t = 0;
        state.checkpoint = Math.max(state.checkpoint, CP.BUNKER);
        queueLines(state, talk, [
          { who: 'foreman', text: 'WHOA, WHOA. THIS IS A UNION BREAK, PAL.' },
          { who: 'worker', text: 'FIFTEEN MINUTES. IT\'S IN THE CONTRACT.' },
          { who: 'meathead', text: 'I JUST NEED TO GET THROUGH.' },
          { who: 'foreman', text: "DOOR'S LOCKED TILL BREAK'S OVER. UNION RULES." },
        ]);
      }
      return controls;
    case 'break':
      // Waited it out: break's over
      if (b.t >= BREAK_FRAMES) { clockOut(ctx, b, talk); return controls; }
      return onBreak(ctx, b, talk, controls, inside);
    case 'clockout':
      // They get up and go back to work; then the far door's open
      if (b.t > 20 && quiet(talk)) {
        for (const w of b.workers) { w.state = 'clocked'; w.t = 0; }
        state.blocks = state.blocks.filter(k => k.tag !== 'bunker-door');
        b.phase = 'open'; b.t = 0;
      }
      return controls;
    case 'open':
      // Out the far side: the bikers
      if (px > B.x2 + 10) { b.phase = 'runout'; b.t = 0; b.step = 0; b.stepAt = 0; }
      return controls;
    case 'boom': case 'aftermath': return aftermath(ctx, b, talk);
    case 'runout': return runOut(ctx, b, talk);
    case 'ride': {
      // Off across the field on the stolen hog: a moment of it, then the chase
      p.inCutscene = true;
      p.skiSpeed = Math.min(11, (p.skiSpeed ?? 0) + 0.4);
      if (b.t === 36) onGone();
      if (b.t > 36) b.phase = 'done';
      return { ...NO_CONTROLS };
    }
    default: return controls;
  }
};

/** In the room with them: the gas line, the gas, and a flame to it. */
const onBreak = (ctx: FrameContext, b: Bunker, talk: Talk, controls: Controls, inside: boolean): Controls => {
  const { state, fx } = ctx;
  const B = COURSE.bunker;
  // Shooting the gas line out (only from in here, with it on the screen)
  const px = state.player.pos.x + state.player.width / 2;
  const canSee = px > B.x1 && px < B.x2 && B.vein.x > state.camera.x && B.vein.x < state.camera.x + CANVAS_WIDTH;
  if (!b.popped && canSee) {
    const vb = veinBox();
    const hit = state.projectiles.find(q => q.owner === 'player' && rectsOverlap(boundsOf(q), vb));
    if (hit) {
      b.popped = true; b.poppedAt = state.frame;
      state.projectiles = state.projectiles.filter(q => q !== hit);
      playSound('clang');
      fx.spawnDamageNumber({ x: B.vein.x - 20, y: B.vein.y - 30 }, 'PSSSST', false, '#D9F99D');
      for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: B.vein.x, y: B.vein.y }, vel: { x: (Math.random() - 0.5) * 3, y: -Math.random() * 3 }, life: 20, color: '#78716C', size: 2 + Math.random() * 2 });
    }
  } else {
    b.gas = Math.min(1, b.gas + 1 / GAS_FILL);
    // (the hiss, and the haze coming out of it, quietly)
    if (state.frame % 3 === 0) state.particles.push({ pos: { x: B.vein.x + (Math.random() - 0.5) * 6, y: B.vein.y }, vel: { x: (Math.random() - 0.5) * 1.2, y: -0.4 - Math.random() * 0.6 }, life: 60, color: 'rgba(217, 249, 157, 0.35)', size: 6 + Math.random() * 6 });
  }
  // Enough gas, and a flame in the room: it goes up
  const flameInRoom = state.flameSegments.some(s => s.x > B.x1 && s.x < B.x2 && s.y > B.roof && s.y < GROUND_Y);
  if (b.popped && b.gas >= GAS_ENOUGH && flameInRoom) { blowUp(ctx, b, talk); return { ...NO_CONTROLS }; }
  // Too soon: he says what's still needed
  if (flameInRoom && state.frame - b.earlyAt > 300) {
    b.earlyAt = state.frame;
    hush(state, talk);
    queueLines(state, talk, [{ who: 'meathead', text: b.popped ? 'GIVE IT A SECOND. LET THE GAS BUILD UP.' : 'NOTHING TO LIGHT YET. THAT GAS LINE ON THE WALL THOUGH...' }]);
  }
  // What they say to themselves, the smell nobody notices, and a nudge now and then (never naming a button)
  if (inside && quiet(talk)) {
    const since = state.frame - b.ambientAt;
    if (b.popped && b.gas > 0.25 && !b.hinted.has('smell')) { b.hinted.add('smell'); b.ambientAt = state.frame; queueLines(state, talk, [{ who: 'worker', text: 'SOMEBODY MICROWAVED EGGS AGAIN.' }, { who: 'foreman', text: 'SMELLS LIKE OVERTIME TO ME.' }]); }
    else if (!b.popped && b.t > 600 && !b.hinted.has(`vein-${Math.floor(b.t / 900)}`)) { b.hinted.add(`vein-${Math.floor(b.t / 900)}`); b.ambientAt = state.frame; queueLines(state, talk, [{ who: 'meathead', text: 'THAT OLD GAS LINE ON THE WALL LOOKS REAL THIN...' }]); }
    else if (b.popped && b.gas >= 0.6 && state.frame - b.poppedAt > 700 && !b.hinted.has(`fire-${Math.floor((state.frame - b.poppedAt) / 700)}`)) { b.hinted.add(`fire-${Math.floor((state.frame - b.poppedAt) / 700)}`); b.ambientAt = state.frame; queueLines(state, talk, [{ who: 'meathead', text: 'ALL THIS ROOM NEEDS NOW IS A LITTLE FIRE.' }]); }
    // (the foreman keeps count, and calls the last minute)
    else if (b.t > BREAK_FRAMES - MINUTE && !b.hinted.has('last')) { b.hinted.add('last'); b.ambientAt = state.frame; queueLines(state, talk, [{ who: 'foreman', text: 'ONE MINUTE, FELLAS. FINISH YOUR SANDWICHES.' }]); }
    else if (since > 520) {
      b.ambientAt = state.frame;
      const line = AMBIENT[b.ambient++ % AMBIENT.length];
      const left = Math.ceil((BREAK_FRAMES - b.t) / MINUTE);
      queueLines(state, talk, [line.text === 'MINUTES LEFT' ? { who: 'foreman', text: `${NUMBERS[left] ?? left} MINUTE${left === 1 ? '' : 'S'} LEFT, FELLAS. SAVOR IT.` } : line]);
    }
  }
  return controls;
};

/** Break's over, the proper way: the whistle, a stretch, and everybody back to work. He waited. They respect that. */
const clockOut = (ctx: FrameContext, b: Bunker, talk: Talk) => {
  const { state } = ctx;
  b.phase = 'clockout'; b.t = 0; b.peaceful = true;
  hush(state, talk);
  playSound('truckhorn');
  queueLines(state, talk, [
    { who: 'foreman', text: "AND THAT'S BREAK. BACK TO IT, FELLAS." },
    { who: 'worker', text: 'FIVE MORE MINUTES...' },
    { who: 'foreman', text: 'UP.' },
    { who: 'foreman', text: 'DOOR\'S OPEN, PAL. YOU WAITED OUT THE WHOLE BREAK? RESPECT.' },
    { who: 'meathead', text: 'UNION RULES.' },
  ]);
};

/** The room goes up: the flash, the fireball, the roof and the far door gone, everybody on the floor. */
const blowUp = (ctx: FrameContext, b: Bunker, talk: Talk) => {
  const { state } = ctx;
  const p = state.player;
  const B = COURSE.bunker;
  b.phase = 'boom'; b.t = 0; b.gas = 0;
  hush(state, talk);
  state.blocks = state.blocks.filter(k => k.tag !== 'bunker-roof' && k.tag !== 'bunker-door');
  shakeScreen(state, 70, 22);
  playSound('boom'); playSound('ignite');
  state.projectiles = state.projectiles.filter(q => q.owner !== 'player');
  p.isFlaming = false;
  for (const w of b.workers) { w.state = 'knocked'; w.t = 0; }
  // The fireball
  for (let i = 0; i < 90; i++) {
    const x = B.x1 + Math.random() * (B.x2 - B.x1), y = B.roof + Math.random() * (GROUND_Y - B.roof);
    state.particles.push({ pos: { x, y }, vel: { x: (Math.random() - 0.5) * 10, y: -2 - Math.random() * 8 }, life: 30 + Math.random() * 40, color: ['#FFFFFF', '#FDE047', '#F97316', '#DC2626', '#1C1917'][i % 5], size: 10 + Math.random() * 24 });
  }
  // The roof in pieces, the door off its hinges, whatever was on the walls
  for (let i = 0; i < 14; i++) b.debris.push({ x: B.x1 + 40 + i * 48, y: B.roof - 20, vx: (Math.random() - 0.5) * 9, vy: -10 - Math.random() * 9, rot: 0, vr: (Math.random() - 0.5) * 0.4, w: 40 + Math.random() * 20, h: 8, color: i % 3 ? '#9CA3AF' : '#6B7280', life: 160 });
  b.debris.push({ x: B.x2 - 10, y: GROUND_Y - 60, vx: 11, vy: -9, rot: 0, vr: 0.3, w: 14, h: 90, color: '#A16207', life: 160 });
  for (let i = 0; i < 10; i++) b.debris.push({ x: B.x1 + Math.random() * (B.x2 - B.x1), y: GROUND_Y - 90, vx: (Math.random() - 0.5) * 12, vy: -6 - Math.random() * 8, rot: 0, vr: (Math.random() - 0.5) * 0.6, w: 8 + Math.random() * 8, h: 6 + Math.random() * 6, color: ['#F8FAFC', '#B91C1C', '#FACC15', '#1D4ED8'][i % 4], life: 120 });
  p.invincibilityTimer = Math.max(p.invincibilityTimer, 2);
  p.inCutscene = true;
};

/** Everybody back up, black with soot and furious: their break's over. Then they're off back to work, and so's he. */
const aftermath = (ctx: FrameContext, b: Bunker, talk: Talk): Controls => {
  const { state } = ctx;
  const p = state.player;
  p.inCutscene = true;
  p.invincibilityTimer = Math.max(p.invincibilityTimer, 2);
  const B = COURSE.bunker;
  state.cameraOverride = { x: (B.x1 + B.x2) / 2 - CANVAS_WIDTH / 2, y: GROUND_Y - 550 };
  if (b.phase === 'boom' && b.t === 45) {
    b.phase = 'aftermath'; b.t = 0;
    for (const w of b.workers) { w.state = 'furious'; w.t = 0; }
    queueLines(state, talk, [
      { who: 'worker', text: 'MY BREAK!' },
      { who: 'foreman', text: '...EVERYBODY. BACK. TO WORK.' },
      { who: 'meathead', text: "BREAK'S OVER, BOYS." },
    ], 8);
  }
  if (b.phase === 'aftermath') {
    // (stomping off to work once they've said their piece)
    if (b.t > 20 && quiet(talk)) {
      for (const w of b.workers) if (w.state === 'furious') { w.state = 'gone'; w.t = 0; }
      b.phase = 'runout'; b.t = 0; b.step = 0; b.stepAt = 0;
    }
  }
  return { ...NO_CONTROLS };
};

/** Out the far side: the bikers on their choppers. One of them's about to be walking. */
const runOut = (ctx: FrameContext, b: Bunker, talk: Talk): Controls => {
  const { state } = ctx;
  const p = state.player;
  p.inCutscene = true;
  p.invincibilityTimer = Math.max(p.invincibilityTimer, 2);
  const target = b.bikers[0];
  const px = p.pos.x + p.width / 2;
  // (the camera follows him out, and holds on the bikers)
  state.cameraOverride = { x: Math.min(target.x - 520, Math.max(COURSE.bunker.x1 - 50, px - 380)), y: GROUND_Y - 550 };
  const since = b.t - b.stepAt;
  const next = () => { b.step++; b.stepAt = b.t; };
  switch (b.step) {
    case 0:
      if (px < target.x - 70) return { ...NO_CONTROLS, right: true };
      p.vel.x = 0; p.facing = 1;
      queueLines(state, talk, [
        { who: 'dan', text: 'NOBODY TOUCHES HER BUT DIRTY DAN.' },
        { who: 'meathead', text: "I'LL TAKE THE BIKE. AND THE GUN." },
      ]);
      next();
      break;
    case 1:
      if (quiet(talk) && since > 6) {
        // The boot, and he's off his hog
        p.kickPose = KICK_POSE_FRAMES;
        target.state = 'flying'; target.vx = 9; target.vy = -12;
        shakeScreen(state, 10, 5); ctx.fx.playGunSound('punch');
        next();
      }
      break;
    case 2:
      if (since === 12) { p.pos.x = target.x - p.width / 2; p.pos.y = GROUND_Y - p.height; mountMoto(state, 0); }
      if (since === 14) queueLines(state, talk, [{ who: 'biker', text: "HE'S GOT DAN'S HOG! AND THE GUN!" }]);
      if (since > 26) { b.phase = 'ride'; b.t = 0; playSound('engine'); }
      break;
  }
  return { ...NO_CONTROLS };
};

const updateDebris = (b: Bunker) => {
  for (const d of b.debris) { d.vy += 0.5; d.x += d.vx; d.y += d.vy; d.rot += d.vr; d.life--; if (d.y > GROUND_Y - 4) { d.y = GROUND_Y - 4; d.vy *= -0.3; d.vx *= 0.7; d.vr *= 0.5; } }
  b.debris = b.debris.filter(d => d.life > 0);
};

const updateBikers = (b: Bunker) => {
  for (const k of b.bikers) {
    if (k.state !== 'flying') continue;
    k.vy += 0.5; k.x += k.vx; k.y += k.vy; k.rot += 0.25;
    if (k.vy > 0 && k.y >= GROUND_Y) { k.y = GROUND_Y; k.state = 'down'; k.rot = Math.PI / 2; }
  }
};

/** Is the room still standing (for drawing it whole or blown out)? */
export const roomIntact = (b: Bunker) => b.peaceful || b.phase === 'waiting' || b.phase === 'break';
/** The far door's still shut (it's open once they've clocked out). */
export const doorShut = (b: Bunker) => b.phase === 'waiting' || b.phase === 'break' || b.phase === 'clockout';
