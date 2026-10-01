// The last room before Oscar's: the bikers' bar. The bikers are on
// their break in here (a hand of pool, drinks at the counter, the band on the
// stage, one passed out in the booth), and while they are nobody lays a hand
// on anybody: they can't hurt him and he can't hurt them. The far door's
// locked till last call. There are three gas lines in here, harder to find
// than the break room's (one down low behind the jukebox, one up over the
// stage, one back in the bathroom), and it takes a pistol round to puncture
// each (anything bigger just dents it). With all three open the room fills;
// then a flame, and this time nobody walks out. If he's short on fuel for the
// flamethrower, a can of it turns up somewhere off the screen the other side
// of the room.

import { SOOT_FRAMES } from '../../render/player/player';
import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import type { Controls } from '../../platform/input';
import { NO_CONTROLS } from '../../platform/input';
import { shakeScreen } from '../../core/state';
import { playSound } from '../../platform/audio';
import { rectsOverlap, boundsOf } from '../../core/utils';
import { GROUND_Y, CANVAS_WIDTH, MAX_AMMO } from '../../../constants';
import { COURSE, CP } from './course';
import { Talk, queueLines, quiet, hush } from './script';
import { isShat } from '../../player/gut';
import { Swirly, startSwirly, updateSwirly } from './swirly';

export type BarPhase = 'waiting' | 'drinks' | 'boom' | 'after' | 'done';
export type BarLook = 'band' | 'pool' | 'pool2' | 'counter' | 'counter2' | 'bartender' | 'booth' | 'dance';
export interface BarBiker { x: number; look: BarLook }
/** Something left of them afterward: a charred skeleton where one of them was, blood up the walls, bits. */
export interface Gore { x: number; y: number; r: number; rot: number; kind: 'splat' | 'bones' | 'limb' | 'boot' }
export interface Flying { x: number; y: number; vx: number; vy: number; rot: number; vr: number; w: number; h: number; color: string; life: number }

export interface Bar {
  phase: BarPhase;
  t: number;
  /** Which gas lines are punctured, and how much gas is in the room (0..1: all three open fills it). */
  open: boolean[];
  gas: number;
  bikers: BarBiker[];
  hinted: Set<string>;
  /** When they last said something to each other, and which; when something last happened (for the nudges). */
  ambientAt: number;
  ambient: number;
  progressAt: number;
  /** When he was last told a pistol's what it takes. */
  gunHintAt: number;
  gore: Gore[];
  flying: Flying[];
  /** When he last said something about trying the flamethrower too early. */
  earlyAt: number;
  /** He came in having shit himself, or did it in here: they take out the trash (see swirly.ts). */
  swirly?: Swirly;
}

/** Gas in the room enough to go up (all three have to be open to get there), and how quick each open line fills it. */
const GAS_ENOUGH = 0.85, GAS_PER_LINE = 1 / 700;
/** Short of fuel for the flamethrower: a can turns up when it's under this. */
const FUEL_LOW = 150;

export const createBar = (state: GameState, startedAt: number): Bar => {
  const B = COURSE.bar;
  const done = startedAt > CP.BAR;
  const b: Bar = {
    phase: done ? 'done' : 'waiting', t: 0, open: [false, false, false], gas: 0,
    bikers: [
      { x: B.x1 + 150, look: 'band' }, { x: B.x1 + 250, look: 'dance' },
      { x: B.x1 + 520, look: 'counter' }, { x: B.x1 + 590, look: 'counter2' }, { x: B.x1 + 700, look: 'bartender' },
      { x: B.x1 + 830, look: 'pool' }, { x: B.x1 + 960, look: 'pool2' }, { x: B.x1 + 1100, look: 'booth' },
    ],
    hinted: new Set(), ambientAt: 0, ambient: 0, progressAt: 0, gunHintAt: -999, gore: [], flying: [], earlyAt: -999,
  };
  if (done) spill(b);
  else {
    // The ceiling, and the far door (locked till last call: and no going over the top). The ceiling goes all the way
    // up: nothing can get up onto the roof and stand on it (and set the bar going from up there)
    state.blocks.push({ x: B.x1, y: GROUND_Y - 3000, w: B.x2 - B.x1, h: B.ceil - (GROUND_Y - 3000), type: 'wall', hidden: true, tag: 'bar-ceiling' });
    state.blocks.push({ x: B.x2 - 20, y: GROUND_Y - 3000, w: 20, h: 3000, type: 'wall', hidden: true, tag: 'bar-door' });
  }
  return b;
};

/** Where each gas line can be punctured. */
export const barVeinBox = (i: number) => { const v = COURSE.bar.veins[i]; return { x: v.x - 16, y: v.y - 9, w: 32, h: 18 }; };

const AMBIENT = [
  'RACK EM UP, TINY.', 'ANOTHER ROUND, DARLENE.', 'THIS SONG IS ABOUT MY BIKE.', 'WHO TOOK MY STOOL? THAT IS MY STOOL.',
  'EIGHT BALL, CORNER POCKET.', "I'M NOT DRUNK, I'M ON BREAK.",
];

export const updateBar = (ctx: FrameContext, b: Bar, talk: Talk, controls: Controls): Controls => {
  const { state } = ctx;
  const p = state.player;
  const B = COURSE.bar;
  b.t++;
  updateFlying(b);
  const px = p.pos.x + p.width / 2;
  if (b.swirly) return state.deathTimer > 0 ? { ...NO_CONTROLS } : updateSwirly(ctx, b, talk);
  switch (b.phase) {
    case 'waiting':
      if (px > B.x1 + 40 && p.isGrounded) {
        b.phase = 'drinks'; b.t = 0; b.progressAt = state.frame; b.ambientAt = state.frame;
        state.checkpoint = Math.max(state.checkpoint, CP.BAR);
        // (walked in like that: not in their bar he doesn't)
        if (isShat(state)) { startSwirly(ctx, b, talk, false); return { ...NO_CONTROLS }; }
        queueLines(state, talk, [
          { who: 'biker', text: 'WELL, LOOK WHAT THE CAT DRAGGED IN.' },
          { who: 'dan', text: "EASY. WE'RE ON BREAK. NOBODY TOUCHES NOBODY." },
          { who: 'meathead', text: "EVERYBODY'S ON BREAK TODAY." },
          { who: 'biker', text: "BACK DOOR'S LOCKED TILL LAST CALL, HOSS." },
        ]);
      }
      return controls;
    case 'drinks':
      // (or did it right here, in front of them)
      if (isShat(state) && px > B.x1 && px < B.x2) { startSwirly(ctx, b, talk, true); return { ...NO_CONTROLS }; }
      return drinks(ctx, b, talk, controls);
    case 'boom': case 'after': return aftermath(ctx, b, talk);
    default: return controls;
  }
};

const drinks = (ctx: FrameContext, b: Bar, talk: Talk, controls: Controls): Controls => {
  const { state, fx } = ctx;
  const p = state.player;
  const B = COURSE.bar;
  // Shots at the gas lines: a pistol round punctures one; anything bigger just dents it (only one he can see, from in here)
  const inRoom = p.pos.x + p.width / 2 > B.x1 && p.pos.x + p.width / 2 < B.x2;
  for (let i = 0; i < 3; i++) {
    if (b.open[i] || !inRoom || B.veins[i].x < state.camera.x || B.veins[i].x > state.camera.x + CANVAS_WIDTH) continue;
    // (the one in the bathroom: only from in there with it, past its wall)
    if (i === 2 && p.pos.x + p.width / 2 < B.bathroom.x1 - 10) continue;
    const box = barVeinBox(i);
    const hit = state.projectiles.find(q => q.owner === 'player' && rectsOverlap(boundsOf(q), box));
    if (!hit) continue;
    state.projectiles = state.projectiles.filter(q => q !== hit);
    if (hit.id.startsWith('p-')) {
      b.open[i] = true; b.progressAt = state.frame;
      playSound('clang');
      fx.spawnDamageNumber({ x: B.veins[i].x - 20, y: B.veins[i].y - 30 }, 'PSSST', false, '#D9F99D');
      const left = b.open.filter(o => !o).length;
      if (left > 0 && quiet(talk)) queueLines(state, talk, [{ who: 'meathead', text: left === 2 ? 'ONE.' : 'TWO.' }]);
      else if (left === 0) queueLines(state, talk, [{ who: 'meathead', text: 'THREE. NOW ALL IT NEEDS IS A LITTLE FIRE.' }]);
    } else if (state.frame - b.gunHintAt > 300) {
      b.gunHintAt = state.frame;
      playSound('clang');
      fx.spawnDamageNumber({ x: B.veins[i].x - 20, y: B.veins[i].y - 30 }, 'CLANK', false, '#9CA3AF');
      queueLines(state, talk, [{ who: 'meathead', text: "TOO MUCH GUN. A PISTOL ROUND'LL PUNCTURE IT." }]);
    }
  }
  // The gas: each open line filling the room (it takes all three to fill it)
  const open = b.open.filter(o => o).length;
  b.gas = Math.min(open / 3, b.gas + open * GAS_PER_LINE);
  if (open && state.frame % 4 === 0) for (let i = 0; i < 3; i++) if (b.open[i]) state.particles.push({ pos: { x: B.veins[i].x, y: B.veins[i].y }, vel: { x: (Math.random() - 0.5) * 1.2, y: -0.4 - Math.random() * 0.6 }, life: 60, color: 'rgba(217, 249, 157, 0.35)', size: 6 + Math.random() * 6 });
  // Full of it, and a flame: last call
  const flameInRoom = state.flameSegments.some(s => s.x > B.x1 && s.x < B.x2 && s.y > B.ceil && s.y < GROUND_Y);
  if (b.gas >= GAS_ENOUGH && flameInRoom) { lastCall(ctx, b, talk); return { ...NO_CONTROLS }; }
  // Too soon: he says what's still needed
  if (flameInRoom && state.frame - b.earlyAt > 300) {
    b.earlyAt = state.frame;
    const left = 3 - open;
    const text = open === 0 ? "NOTHING TO LIGHT YET. OPEN UP THE GAS LINES FIRST. A PISTOL'LL DO IT."
      : left > 0 ? `NOT ENOUGH GAS YET. ${left === 1 ? 'ONE MORE LINE' : 'TWO MORE LINES'} TO OPEN.`
      : 'GIVE IT A SECOND. LET IT FILL UP.';
    hush(state, talk);
    queueLines(state, talk, [{ who: 'meathead', text }]);
  }
  // Short of fuel: a can of it the other side of the room, off the screen (again, if he needs it again)
  const fuelLow = (p.weaponAmmo.FLAMETHROWER ?? 0) < Math.min(FUEL_LOW, MAX_AMMO.FLAMETHROWER);
  if (fuelLow && !state.pickups.some(q => q.id.startsWith('bar-fuel'))) {
    const px = p.pos.x + p.width / 2;
    const x = px < (B.x1 + B.x2) / 2 ? B.x2 - 90 : B.x1 + 70;
    if (Math.abs(x - px) > CANVAS_WIDTH / 2 + 40) state.pickups.push({ id: `bar-fuel-${state.frame}`, pos: { x: x - 10, y: GROUND_Y - 60 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_ammo', life: 1e9 });
  }
  // They talk among themselves; and a nudge now and then about where the lines are (never a button)
  if (quiet(talk)) {
    const since = state.frame - b.progressAt;
    const next = b.open.findIndex(o => !o);
    if (next >= 0 && since > 600 && !b.hinted.has(`v${next}-${Math.floor(since / 900)}`)) {
      b.hinted.add(`v${next}-${Math.floor(since / 900)}`);
      b.ambientAt = state.frame;
      const where = ['SOMETHING HISSING DOWN LOW, BEHIND THE JUKEBOX.', "THERE'S A GAS LINE UP OVER THE BAND.", "I SMELL GAS IN THE BATHROOM. THERE'S A LINE RIGHT BEHIND THE TOILET."][next];
      queueLines(state, talk, [{ who: 'meathead', text: open === 0 && !b.hinted.has('three') ? 'THREE GAS LINES IN HERE, BY THE SMELL. PISTOL SHOULD DO IT.' : where }]);
      b.hinted.add('three');
    } else if (open === 3 && b.gas >= GAS_ENOUGH && since > 400 && !b.hinted.has(`fire-${Math.floor(since / 700)}`)) {
      b.hinted.add(`fire-${Math.floor(since / 700)}`); b.ambientAt = state.frame;
      queueLines(state, talk, [{ who: 'meathead', text: 'NOW JUST A LITTLE FIRE.' }]);
    } else if (state.frame - b.ambientAt > 480) {
      b.ambientAt = state.frame;
      queueLines(state, talk, [{ who: b.ambient % 2 ? 'dan' : 'biker', text: AMBIENT[b.ambient++ % AMBIENT.length] }]);
    }
  }
  return controls;
};

/** The bar goes up. Nobody walks out of this one. */
const lastCall = (ctx: FrameContext, b: Bar, talk: Talk) => {
  const { state } = ctx;
  const p = state.player;
  const B = COURSE.bar;
  b.phase = 'boom'; b.t = 0; b.gas = 0;
  hush(state, talk);
  state.blocks = state.blocks.filter(k => k.tag !== 'bar-ceiling' && k.tag !== 'bar-door');
  shakeScreen(state, 90, 26);
  playSound('boom'); playSound('ignite'); playSound('screams');
  state.projectiles = state.projectiles.filter(q => q.owner !== 'player');
  p.isFlaming = false;
  p.inCutscene = true;
  p.invincibilityTimer = Math.max(p.invincibilityTimer, 2);
  p.sootTimer = SOOT_FRAMES;
  // The fireball, filling the place
  for (let i = 0; i < 140; i++) {
    const x = B.x1 + Math.random() * (B.x2 - B.x1), y = B.ceil + Math.random() * (GROUND_Y - B.ceil);
    state.particles.push({ pos: { x, y }, vel: { x: (Math.random() - 0.5) * 12, y: -2 - Math.random() * 9 }, life: 30 + Math.random() * 50, color: ['#FFFFFF', '#FDE047', '#F97316', '#DC2626', '#1C1917', '#7F1D1D'][i % 6], size: 10 + Math.random() * 28 });
  }
  // Them: everywhere
  for (const k of b.bikers) {
    for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: k.x, y: GROUND_Y - 40 }, vel: { x: (Math.random() - 0.5) * 14, y: -3 - Math.random() * 10 }, life: 50 + Math.random() * 30, color: ['#7F1D1D', '#B91C1C', '#450A0A', '#1C1917'][i % 4], size: 3 + Math.random() * 6 });
    for (let i = 0; i < 3; i++) b.flying.push({ x: k.x, y: GROUND_Y - 50, vx: (Math.random() - 0.5) * 12, vy: -6 - Math.random() * 9, rot: 0, vr: (Math.random() - 0.5) * 0.6, w: 14, h: 6, color: i === 0 ? '#1C1917' : '#7F1D1D', life: 200 });
  }
  // The ceiling, the back door, the bottles
  for (let i = 0; i < 20; i++) b.flying.push({ x: B.x1 + 30 + i * 58, y: B.ceil - 20, vx: (Math.random() - 0.5) * 9, vy: -10 - Math.random() * 10, rot: 0, vr: (Math.random() - 0.5) * 0.4, w: 40 + Math.random() * 20, h: 8, color: i % 3 ? '#57534E' : '#292524', life: 180 });
  b.flying.push({ x: B.x2 - 10, y: GROUND_Y - 60, vx: 12, vy: -9, rot: 0, vr: 0.3, w: 14, h: 100, color: '#451A03', life: 180 });
  spill(b);
};

/** What's left: a charred skeleton where each of them was, blood up the walls and across the ceiling, bits everywhere. */
const spill = (b: Bar) => {
  const B = COURSE.bar;
  const r = (n: number) => { const s = Math.sin(n * 91.7 + 13.1) * 43758.5453; return s - Math.floor(s); };
  b.gore = [];
  b.bikers.forEach((k, i) => {
    b.gore.push({ x: k.x, y: GROUND_Y, r: 1, rot: r(i) < 0.5 ? 0 : Math.PI, kind: 'bones' });
    b.gore.push({ x: k.x + (r(i + 3) - 0.5) * 120, y: GROUND_Y - 2, r: 1, rot: r(i + 5) * 6, kind: r(i + 7) < 0.5 ? 'limb' : 'boot' });
  });
  for (let i = 0; i < 70; i++) b.gore.push({ x: B.x1 + r(i + 40) * (B.x2 - B.x1), y: B.ceil + r(i + 80) * (GROUND_Y - B.ceil), r: 6 + r(i + 120) * 26, rot: r(i + 160) * 3, kind: 'splat' });
};

const aftermath = (ctx: FrameContext, b: Bar, talk: Talk): Controls => {
  const { state } = ctx;
  const p = state.player;
  p.inCutscene = true;
  p.invincibilityTimer = Math.max(p.invincibilityTimer, 2);
  if (b.phase === 'boom' && b.t === 80) { b.phase = 'after'; b.t = 0; queueLines(state, talk, [{ who: 'meathead', text: 'LAST CALL.' }]); }
  if (b.phase === 'after' && b.t > 40 && quiet(talk)) {
    b.phase = 'done'; p.inCutscene = false;
    // (the bar stays blown up: dying from here on, he's back in what's left of it)
    state.checkpoint = Math.max(state.checkpoint, CP.BOSS);
  }
  return { ...NO_CONTROLS };
};

const updateFlying = (b: Bar) => {
  for (const d of b.flying) { d.vy += 0.5; d.x += d.vx; d.y += d.vy; d.rot += d.vr; d.life--; if (d.y > GROUND_Y - 4) { d.y = GROUND_Y - 4; d.vy *= -0.3; d.vx *= 0.7; d.vr *= 0.5; } }
  b.flying = b.flying.filter(d => d.life > 0);
};

/** The bar's still in one piece (and they're all still in it). */
export const barIntact = (b: Bar) => b.phase === 'waiting' || b.phase === 'drinks';
