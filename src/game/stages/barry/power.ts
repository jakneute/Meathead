// The power room at the top of the walk-up: Barry's man on the grid, and the
// three generators the city's blackouts run through. He's harmless (a clipboard
// and a headset); he struts about taunting you. Every generator takes the same
// roughly ten seconds of punishment whatever you're hitting it with (it soaks up
// whatever you throw at it, a little at a time). Each one that goes, he panics,
// runs round with his hands on his head and tells you exactly what you've just
// done to the city. When the third goes, so does the room: alarms, blasts, white.

import type { Enemy } from '../../../types';
import type { FrameContext } from '../../core/context';
import type { Controls } from '../../platform/input';
import { NO_CONTROLS } from '../../platform/input';
import { makeKindEnemy } from '../../enemies/kinds';
import { shakeScreen } from '../../core/state';
import { playSound } from '../../platform/audio';
import { COURSE } from './course';
import { Talk, queueLines, replaceLines, quiet, hush } from './script';

export interface PowerRoom {
  phase: 'waiting' | 'fight' | 'meltdown' | 'done';
  t: number;
  /** How many generators he's put out. */
  gone: number;
  /** Each generator's charge (100 full), and the last frame it was hit. */
  gens: { id: string; charge: number; hitAt: number; boomAt: number }[];
  minion: Enemy | null;
  /** The meltdown's frames, and the white-out over it (0..1). */
  meltT: number;
  white: number;
  /** When the white-out started (-1 not yet). */
  whiteAt: number;
  /** When he last had a dig at you; how many of them he's told you about. */
  tauntAt: number;
  told: number;
}

/** The generators soak up about 10 a second of whatever you throw at them (100 each): ~10 seconds apiece. */
const DRAIN_PER_FRAME = 10 / 60;
/** How long after a hit a generator counts as still under attack (so slow weapons aren't any slower). */
const UNDER_FIRE = 50;
/** A generator's health sits here: anything taking a chunk out of it is a hit (it never really goes down). */
export const GEN_HP = 1e6;
/** The meltdown: how long the room goes up for at least before the white-out, and how long it holds white. */
export const MELT_FRAMES = 170, WHITE_HOLD = 40;

const INTRO = [
  { who: 'minion', text: "OH, LOOK WHO FINALLY MADE IT UP ALL THOSE STAIRS. YOU'RE SWEATY. IT'S GROSS." },
  { who: 'minion', text: "THIS IS THE HEART OF THE NEW YORK POWER GRID. TOUCH NOTHING. I MEAN IT. NOTHING." },
  { who: 'minion', text: "EVERY ROLLING BLACKOUT IN THE CITY RUNS THROUGH THESE THREE BEAUTIES. NOT THAT YOU'D UNDERSTAND LOAD BALANCING." },
  { who: 'meathead', text: 'THREE BIG HUMMING BOXES. GOT IT.' },
] as const;

const TAUNTS = [
  "IS THAT ALL YOU'VE GOT? THEY'RE RATED FOR HURRICANES.",
  "BARRY IS GOING TO HEAR ABOUT THIS. HE HEARS ABOUT EVERYTHING.",
  "YOU KNOW YOU'RE ON CAMERA, RIGHT? I'M PUTTING THIS ON THE COMPANY NEWSLETTER.",
  "CAREFUL! THOSE ARE LEASED!",
];

/** What each one did, and his reaction. */
const FALLOUT = [
  [
    { who: 'minion', text: 'NO NO NO NO! THAT ONE RAN THE SUBWAY SIGNALS! EVERY TRAIN ON THE A LINE IS JUST... GOING. FOREVER. TO FAR ROCKAWAY.' },
    { who: 'meathead', text: 'YOU SAID TOUCH NOTHING. I HEARD SMASH EVERYTHING.' },
  ],
  [
    { who: 'minion', text: "THAT WAS TRAFFIC CONTROL! EVERY LIGHT IN MANHATTAN JUST WENT GREEN! ALL OF THEM! AT ONCE! THE CABS! OH GOD, THE CABS!" },
  ],
  [
    { who: 'minion', text: 'THE HOSPITALS! THE STOCK EXCHANGE! THE HOT DOG CARTS! AND THE FAILSAFE THAT KEEPS THIS ROOM FROM EXPLO' },
  ],
] as const;

export const createPower = (): PowerRoom => ({ phase: 'waiting', t: 0, gone: 0, gens: [], minion: null, meltT: 0, white: 0, whiteAt: -1, tauntAt: 0, told: 0 });

/** Into the room: the generators and him. */
export const enterPower = (ctx: FrameContext, pw: PowerRoom, talk: Talk) => {
  const { state } = ctx;
  const r = COURSE.power;
  pw.gens = COURSE.generators.map(x => {
    const g = makeKindEnemy('generator', x, r.floor);
    g.health = GEN_HP; g.maxHealth = GEN_HP;
    state.enemies.push(g);
    return { id: g.id, charge: 100, hitAt: -999, boomAt: -1 };
  });
  const m = makeKindEnemy('minion', r.x2 - 160, r.floor);
  m.health = GEN_HP; m.maxHealth = GEN_HP; m.aiState = 'taunt'; m.facing = -1;
  state.enemies.push(m);
  pw.minion = m;
  pw.phase = 'fight'; pw.t = 0; pw.tauntAt = 0;
  replaceLines(state, talk, INTRO.map(l => ({ ...l })), 30);
};

/** A generator's turn: stays put, anything that damages it drains its charge (at the one rate, whatever it was). */
export const updateGenerator = (ctx: FrameContext, e: Enemy, pw: PowerRoom): boolean => {
  const { state, fx } = ctx;
  const g = pw.gens.find(q => q.id === e.id);
  if (!g) return false;
  // (nothing moves it or sets it alight or freezes it: it's a generator)
  e.vel = { x: 0, y: 0 }; e.frozenTimer = 0; e.pauseTimer = 0; e.isOnFire = false; e.isOiled = false; e.isBlownAway = false;
  e.pos.x = COURSE.generators[pw.gens.indexOf(g)] - e.width / 2; e.pos.y = COURSE.power.floor - e.height;
  if (g.charge <= 0) {
    // Blown: sparks and smoke for a while, then just a smoking wreck (it stays: the stage draws it)
    if (state.frame % 4 === 0) state.particles.push({ pos: { x: e.pos.x + Math.random() * e.width, y: e.pos.y + 20 }, vel: { x: (Math.random() - 0.5), y: -1.5 }, life: 40, color: '#44403C', size: 8 + Math.random() * 8 });
    e.health = GEN_HP;
    return true;
  }
  if (e.health < GEN_HP) { g.hitAt = state.frame; e.health = GEN_HP; }
  // Only one at a time takes it (something that hits them all at once, a wave, a blast, only drains the one
  // nearest him)
  const px = state.player.pos.x + state.player.width / 2;
  const underFire = pw.gens.map((q, i) => ({ q, x: COURSE.generators[i] })).filter(({ q }) => q.charge > 0 && state.frame - q.hitAt < UNDER_FIRE);
  const nearest = underFire.sort((a, b) => Math.abs(a.x - px) - Math.abs(b.x - px))[0];
  if (nearest && nearest.q === g) {
    g.charge -= DRAIN_PER_FRAME;
    if (state.frame % 5 === 0) state.particles.push({ pos: { x: e.pos.x + Math.random() * e.width, y: e.pos.y + Math.random() * e.height * 0.6 }, vel: { x: (Math.random() - 0.5) * 4, y: -Math.random() * 4 }, life: 14, color: Math.random() < 0.5 ? '#7DD3FC' : '#FDE047', size: 2 + Math.random() * 2 });
    if (g.charge <= 0) {
      // It goes
      g.charge = 0; g.boomAt = state.frame; pw.gone++;
      for (let k = 0; k < 5; k++) fx.spawnExplosion({ x: e.pos.x + 20 + k * 20, y: e.pos.y + 30 + (k % 2) * 40 }, k % 2 ? '#38BDF8' : '#FDE047', 18, 0, 22);
      fx.spawnExplosion({ x: e.pos.x + e.width / 2, y: e.pos.y + 20 }, '#1C1917', 20, 0, 18);
      fx.spawnDamageNumber({ x: e.pos.x, y: e.pos.y - 30 }, pw.gone === 3 ? 'GRID DOWN!' : 'SHORTED OUT!', true, '#FDE047');
      shakeScreen(state, 30, 12);
      playSound('nuke');
    }
  }
  return true;
};

/** Barry's man: struts and taunts, panics when one goes. He can't be hurt (he's for later). */
export const updateMinion = (ctx: FrameContext, m: Enemy, pw: PowerRoom): boolean => {
  const { state } = ctx;
  const r = COURSE.power;
  const p = state.player;
  m.health = GEN_HP; m.isBlownAway = false; m.frozenTimer = 0; m.pauseTimer = 0; m.isOnFire = false; m.isOiled = false;
  m.aiTimer = (m.aiTimer || 0) + 1;
  if (pw.phase === 'meltdown' || m.aiState === 'panic') {
    // Running up and down, hands on his head
    m.aiState = 'panic';
    if (m.facing === undefined || m.pos.x < r.x1 + 60 || m.pos.x > r.x2 - 100) m.facing = m.pos.x < r.x1 + 60 ? 1 : -1;
    m.vel.x = m.facing * 4.2;
    if (pw.phase !== 'meltdown' && m.aiTimer > 260) { m.aiState = 'taunt'; m.aiTimer = 0; }
  } else {
    // Keeping his distance, strutting, facing you
    const px = p.pos.x + p.width / 2, mx = m.pos.x + m.width / 2;
    const want = px < (r.x1 + r.x2) / 2 ? r.x2 - 140 : r.x1 + 140;
    m.vel.x = Math.abs(want - mx) > 30 ? Math.sign(want - mx) * 2.2 : 0;
    m.facing = px < mx ? -1 : 1;
  }
  m.pos.x = Math.max(r.x1 + 20, Math.min(r.x2 - m.width - 20, m.pos.x + m.vel.x));
  m.pos.y = r.floor - m.height;
  return true;
};

/** The room's turn: the fight, his lines as each one goes, then the meltdown and the white-out. Returns the controls. */
export const updatePower = (ctx: FrameContext, pw: PowerRoom, talk: Talk, controls: Controls): Controls => {
  const { state, fx } = ctx;
  const r = COURSE.power;
  pw.t++;
  if (pw.phase === 'fight') {
    // Each one down: his panic, what it did
    if (pw.told < pw.gone) {
      pw.told = pw.gone;
      if (pw.minion) { pw.minion.aiState = 'panic'; pw.minion.aiTimer = 0; }
      // (the last one: he's straight into it, whatever he was saying)
      if (pw.gone === 3) hush(state, talk);
      replaceLines(state, talk, FALLOUT[pw.gone - 1].map(l => ({ ...l })), pw.gone === 3 ? 0 : 20);
      if (pw.gone === 3) { pw.phase = 'meltdown'; pw.meltT = 0; }
    }
    // A dig at you now and then if you're taking your time
    if (pw.phase === 'fight' && quiet(talk) && pw.t - pw.tauntAt > 540 && pw.t > 300) {
      pw.tauntAt = pw.t;
      queueLines(state, talk, [{ who: 'minion', text: TAUNTS[Math.floor(pw.t / 540) % TAUNTS.length] }]);
    }
    return controls;
  }
  if (pw.phase === 'meltdown') {
    pw.meltT++;
    // The alarms, blasts all round the room, the floor shaking; hands off once it's really going
    if (pw.meltT % 50 === 1) playSound('siren');
    if (pw.meltT % 9 === 0) fx.spawnExplosion({ x: r.x1 + 60 + Math.random() * (r.x2 - r.x1 - 120), y: r.floor - 40 - Math.random() * 220 }, Math.random() < 0.5 ? '#F97316' : '#FDE047', 16, 0, 20);
    if (pw.meltT % 20 === 0) shakeScreen(state, 20, 6 + pw.meltT / 20);
    if (pw.meltT === 60) playSound('nuke');
    // The white-out: once he's got to the end of what he's saying (he doesn't get to finish the word), or it's gone on long enough
    if (pw.whiteAt < 0 && ((pw.meltT > MELT_FRAMES && !talk.current && !talk.queue.length) || pw.meltT > MELT_FRAMES * 2.2)) pw.whiteAt = pw.meltT;
    if (pw.whiteAt >= 0) {
      if (pw.meltT === pw.whiteAt + 10) { hush(state, talk); playSound('nuke'); }
      pw.white = Math.min(1, (pw.meltT - pw.whiteAt) / 40);
      if (pw.meltT >= pw.whiteAt + 40 + WHITE_HOLD) { pw.phase = 'done'; pw.white = 1; }
    }
    return pw.meltT > 90 ? { ...NO_CONTROLS } : controls;
  }
  return controls;
};
