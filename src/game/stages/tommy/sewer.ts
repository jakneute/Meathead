// Down in the sewer. The channels are full of the town's water after it's been
// through the town: fall in and he swims (slowly, it's thick), and it eats at
// him the whole time he's in it (it eats anything else that falls in too, the
// things that live in it aside). Pipes overhead drip it: a drop swells, falls,
// and hurts where it lands.
//
// Past the last channel, a locker with an emergency hazmat suit in it. The
// tunnel after that's flooded near to its roof: in the suit the muck doesn't
// touch him, but it's eating the suit instead, and it won't last forever. Then
// another locker, and a deep flooded pit (a longer swim, a newer suit).

import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import { playSound } from '../../platform/audio';
import { hurtPlayer } from '../../bosses/shared';
import { killPlayer } from '../../player/player';
import { rectsOverlap, boundsOf } from '../../core/utils';
import { COURSE, CP, Channel, WALK_Y } from './course';
import { Talk, queueLines, quiet } from './script';

export interface Sewer {
  /** The suit: whether he's in one, and how much of it's left (1 new .. 0 eaten through). */
  suitOn: boolean;
  suit: number;
  /** Frames since he put it on (for the suiting up), which lockers have been opened, and how long this suit lasts. */
  suitT: number;
  opened: boolean[];
  suitFrames: number;
  /** Drops of the muck falling from the pipes. */
  drops: { x: number; y: number; vy: number }[];
  /** Frames he's spent in it (for the sizzle), and the frame he last splashed in. */
  inMuck: number;
  splashAt: number;
  /** A line to warn him about the suit, once. */
  warned: boolean;
  /** When he last yelled about being in it, and how many times. */
  yelledAt: number;
  yells: number;
  /** Where it ate him, and when (drawn going). */
  dissolve: { x: number; y: number; surface: number; at: number } | null;
}

/** How long each locker's suit holds out in the muck (frames in it): the tunnel's, the pit's (a longer swim). */
export const SUIT_FRAMES = [21 * 60, 38 * 60];
/** What the muck does to him without it: this much, this often. */
const MUCK_DAMAGE = 2, MUCK_EVERY = 15;
/** A drip: how long it swells before it lets go, and what it does when it lands on you. */
const DRIP_SWELL = 40, DRIP_DAMAGE = 8;
/** How hard he kicks up out of the muck onto a walkway (it's thick). */
const MUCK_LEAP = -11.5;

export const createSewer = (startedAt: number): Sewer => ({
  suitOn: startedAt === CP.SUIT || startedAt === CP.SUIT2, suit: startedAt === CP.SUIT || startedAt === CP.SUIT2 ? 1 : 0, suitT: 999,
  opened: [startedAt >= CP.SUIT, startedAt >= CP.SUIT2], suitFrames: SUIT_FRAMES[startedAt >= CP.SUIT2 ? 1 : 0],
  drops: [], inMuck: 0, splashAt: 0, warned: false, yelledAt: -999, yells: 0, dissolve: null,
});

/** The channel he's in (his middle under its surface), if any. */
export const muckAt = (x: number, y: number): Channel | undefined => COURSE.channels.find(c => x > c.x1 && x < c.x2 && y > c.surface);

/** How far a drip's gone: 0 just starting to swell, 1 about to fall (and when it falls). */
export const dripPhase = (d: { period: number; phase: number }, frame: number) => ((frame + d.phase) % d.period) / d.period;

/** How far away he has to be from a locker he's used (off the screen) for a new suit to turn up in it. */
const RESTOCK_AWAY = 900;

/** What he yells while it's eating him. */
const MUCK_YELLS = ['GET THE FUCK OUT OF THE SLUDGE!', 'IT BURNS! GET THE FUCK OUT!', 'OUT! OUT! OUT! OUT!', 'MY SKIN! MY BEAUTIFUL SKIN!', 'GET OUT GET OUT GET OUT!'];

export const updateSewer = (ctx: FrameContext, sw: Sewer, talk: Talk) => {
  const { state, fx } = ctx;
  const p = state.player;
  const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2;
  // In the muck: swimming in it
  const ch = muckAt(cx, cy);
  const was = p.swimming;
  p.swimming = !!ch && !p.inCutscene;
  p.swimSurfaceY = ch?.surface;
  p.swimLeap = ch ? MUCK_LEAP : undefined;
  if (p.swimming && !was && p.vel.y > 2 && state.frame - sw.splashAt > 30) {
    sw.splashAt = state.frame;
    for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: cx, y: ch!.surface }, vel: { x: (Math.random() - 0.5) * 6, y: -2 - Math.random() * 5 }, life: 26, color: i % 2 ? '#65A30D' : '#3F6212', size: 3 + Math.random() * 4 });
    playSound('barf');
  }
  sw.inMuck = p.swimming ? sw.inMuck + 1 : 0;
  // It eats at him (or his suit)
  if (p.swimming && state.deathTimer <= 0) {
    if (sw.suitOn && sw.suit > 0) {
      sw.suit = Math.max(0, sw.suit - 1 / sw.suitFrames);
      if (state.frame % 6 === 0) state.particles.push({ pos: { x: p.pos.x + Math.random() * p.width, y: p.pos.y + Math.random() * p.height }, vel: { x: 0, y: -1 }, life: 20, color: 'rgba(250, 204, 21, 0.7)', size: 3 });
      if (sw.suit <= 0.25 && !sw.warned) { sw.warned = true; fx.spawnDamageNumber({ x: p.pos.x - 40, y: p.pos.y - 50 }, 'SUIT FAILING!', true, '#FACC15'); playSound('siren'); }
      if (sw.suit <= 0) { sw.suitOn = false; fx.spawnDamageNumber({ x: p.pos.x - 40, y: p.pos.y - 50 }, 'SUIT GONE!', true, '#EF4444'); }
    } else if (sw.inMuck % MUCK_EVERY === 1) {
      if (!ctx.cheats.invincible) p.health -= MUCK_DAMAGE;
      // (yelling at himself to get out: straight away, and again every so often while he's still in it)
      if ((sw.inMuck === 1 || state.frame - sw.yelledAt > 150) && quiet(talk)) { sw.yelledAt = state.frame; queueLines(state, talk, [{ who: 'meathead', text: MUCK_YELLS[sw.yells++ % MUCK_YELLS.length] }]); }
      for (let i = 0; i < 4; i++) state.particles.push({ pos: { x: p.pos.x + Math.random() * p.width, y: p.pos.y + Math.random() * p.height * 0.6 }, vel: { x: (Math.random() - 0.5) * 2, y: -1.5 - Math.random() * 2 }, life: 20, color: Math.random() < 0.5 ? '#A3E635' : '#D9F99D', size: 3 + Math.random() * 3 });
      if (p.health <= 0 && state.deathTimer <= 0) {
        // Dissolved where he was (the stage draws him going)
        sw.dissolve = { x: p.pos.x, y: p.pos.y, surface: ch!.surface, at: state.frame };
        killPlayer(ctx, pickLine(['DISSOLVED', 'PART OF THE WATER SUPPLY NOW', 'FLINT TAP WATER: 1, MEATHEAD: 0', 'SHOULD HAVE BOILED IT FIRST']), false);
      }
    }
  }
  // Anybody else who ends up in it (knocked in, say) dissolves, the way the barfer's sludge does them (the
  // sludgelings live in it)
  for (const e of state.enemies) {
    if (e.health <= 0 || e.isBlownAway || e.kind === 'sludgeling' || e.kind === 'mutantfish' || e.kind === 'amalgam') continue;
    if (!muckAt(e.pos.x + e.width / 2, e.pos.y + e.height * 0.7)) continue;
    e.health = 0;
    fx.killWithAnimation(e, 'melted', 'sludge_kill', 'melted');
    for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: e.pos.x + Math.random() * e.width, y: e.pos.y + e.height * 0.6 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 3 }, life: 24, color: i % 2 ? '#A3E635' : '#65A30D', size: 3 + Math.random() * 4 });
    playSound('barf');
  }
  // The sludgelings lying in wait float with just their eyes up out of it
  for (const e of state.enemies) {
    if (e.kind !== 'sludgeling' || (e.aiState && e.aiState !== 'idle') || e.health <= 0) continue;
    const c = COURSE.channels.find(ch => e.pos.x + e.width / 2 > ch.x1 && e.pos.x + e.width / 2 < ch.x2);
    if (c) { e.pos.y = c.surface + 14 - e.height; e.vel.y = 0; }
  }
  updateDrips(ctx, sw);
  // A locker: he gets in the suit (a fresh one)
  COURSE.sewer.lockers.forEach((lx, i) => {
    // (one he's used gets a new suit in it while he's well away from it, if he's lost his: back for another go)
    if (sw.opened[i] && !sw.suitOn && Math.abs(cx - lx) > RESTOCK_AWAY) sw.opened[i] = false;
    if (sw.opened[i] ||Math.abs(cx - lx) >= 40 || !p.isGrounded) return;
    sw.opened[i] = true; sw.suitOn = true; sw.suit = 1; sw.suitT = 0; sw.warned = false; sw.suitFrames = SUIT_FRAMES[i];
    state.checkpoint = Math.max(state.checkpoint, i === 0 ? CP.SUIT : CP.SUIT2);
    playSound('tinkle');
    fx.spawnDamageNumber({ x: p.pos.x - 60, y: p.pos.y - 70 }, 'HAZMAT SUIT!', true, '#FACC15');
  });

  if (sw.suitT < 999) sw.suitT++;
  // Into the cistern: the suit's done its job (what's left of it comes off)
  if (sw.suitOn && cx > COURSE.sewer.cistern.x1 - 300 && p.isGrounded) sw.suitOn = false;
};

const pickLine = (l: string[]) => l[Math.floor(Math.random() * l.length)];

const updateDrips = (ctx: FrameContext, sw: Sewer) => {
  const { state, fx } = ctx;
  const p = state.player;
  for (const d of COURSE.drips) {
    if (Math.abs(d.x - state.camera.x - 400) > 700) continue;
    // (it lets go the frame it's done swelling)
    if (Math.floor((state.frame + d.phase) % d.period) === 0) sw.drops.push({ x: d.x, y: d.y + 8, vy: 1 });
  }
  const pb = boundsOf(p);
  sw.drops = sw.drops.filter(dr => {
    dr.vy = Math.min(12, dr.vy + 0.5);
    dr.y += dr.vy;
    const box = { x: dr.x - 4, y: dr.y - 6, w: 8, h: 12 };
    if (rectsOverlap(pb, box) && p.invincibilityTimer <= 0 && state.deathTimer <= 0) {
      hurtPlayer(ctx, DRIP_DAMAGE, 'sewer_drip', { x: 0, y: -3 });
      fx.spawnDamageNumber({ x: p.pos.x - 20, y: p.pos.y - 40 }, 'DRIP!', true, '#A3E635');
      splat(state, dr.x, dr.y);
      return false;
    }
    for (const e of state.enemies) {
      if (e.health <= 0 || e.isBlownAway || e.kind === 'sludgeling' || e.kind === 'mutantfish' || e.kind === 'amalgam' || !rectsOverlap(boundsOf(e), box)) continue;
      e.health -= DRIP_DAMAGE; e.hitFlash = 6;
      splat(state, dr.x, dr.y);
      return false;
    }
    // Onto the walkway, a grate, or into a channel
    const floor = muckAt(dr.x, dr.y) ? dr.y : dr.y >= WALK_Y - 4 && !COURSE.channels.some(c => dr.x > c.x1 && dr.x < c.x2) ? WALK_Y : null;
    if (floor !== null) { splat(state, dr.x, floor); return false; }
    return dr.y < WALK_Y + 400;
  });
};

const splat = (state: GameState, x: number, y: number) => {
  for (let i = 0; i < 8; i++) state.particles.push({ pos: { x, y: y - 3 }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 3 }, life: 18, color: i % 2 ? '#A3E635' : '#4D7C0F', size: 2 + Math.random() * 3 });
};

export { DRIP_SWELL };
