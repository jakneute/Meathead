// The sunny beach: the beachgoers, what happens if you start shooting them (a
// panic, a body count, then the cops), and the storm rolling in.
//
// Shoot one and the rest scatter. Then sirens: a cruiser pulls up, and you
// can't get past the tiki bar until the cops are dead. Either way, walk on far enough (with no cops
// on you) and the hurricane arrives: the sky goes black, and anyone still on the
// beach runs for cover.

import type { Block, Enemy } from '../../../types';
import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import { makeKindEnemy } from '../../enemies/kinds';
import { playSound } from '../../platform/audio';
import { shakeScreen } from '../../core/state';
import { say, MEATHEAD_VOICE } from '../../platform/speech';
import { COURSE, CP } from './course';
import { CANVAS_WIDTH } from '../../../constants';
import { isShat } from '../../player/gut';

export interface Beach {
  /** Beachgoers killed. */
  killed: number;
  counted: Set<string>;
  known: Map<string, Enemy>;
  panic: boolean;
  /** He shit himself on the beach: everybody's cleared off in disgust (and nobody called the cops about that). */
  disgust: boolean;
  police: 'none' | 'coming' | 'fight' | 'done';
  policeT: number;
  /** The cruiser pulling up: where it is, and where it stops. */
  cruiserX: number;
  cruiserStop: number;
  copIds: string[];
  /** The wall at the tiki bar while the cops are after you (null when you're not held up). */
  lock: Block | null;
  /** 0..1: how far the storm's rolled in; and when it started (0 if not). */
  storm: number;
  stormAt: number;
}

const POLICE_DELAY = 110, CRUISER_SPEED = 9;
/** The storm takes this long to roll in. */
const STORM_FRAMES = 200;

export const createBeach = (state: GameState, startedAt: number): Beach => {
  const stormy = startedAt >= CP.STORM;
  if (!stormy) {
    COURSE.civilians.forEach(c => {
      const e = makeKindEnemy('civilian', c.x, c.y);
      e.variant = c.variant;
      // Sunbathers are lying down
      if (c.variant === 0) { e.width = 64; e.height = 18; e.pos = { x: c.x - 32, y: c.y - 18 }; e.homeX = e.pos.x; e.homeY = e.pos.y; }
      state.enemies.push(e);
    });
  }
  return { killed: 0, counted: new Set(), known: new Map(), panic: false, disgust: false, police: 'none', policeT: 0, cruiserX: 0, cruiserStop: 0, copIds: [], lock: null, storm: stormy ? 1 : 0, stormAt: stormy ? -1 : 0 };
};

export const updateBeach = (ctx: FrameContext, b: Beach) => {
  const { state } = ctx;
  const { player } = state;
  const civilians = state.enemies.filter(e => e.kind === 'civilian');
  // (every beachgoer we've seen, so one knocked clean off the list by a body check still counts)
  for (const e of civilians) b.known.set(e.id, e);

  // Somebody's dead: count them (the ones who got away don't count)
  for (const e of b.known.values()) {
    const gone = !state.enemies.includes(e);
    if ((e.health > 0 && !e.isBlownAway && !gone) || e.aiState === 'gone' || b.counted.has(e.id)) continue;
    b.counted.add(e.id);
    // (the storm's lightning doesn't count against you)
    if (b.storm > 0) continue;
    b.killed++;
    if (!b.panic) {
      b.panic = true;
      for (const c of civilians) if (c.health > 0) { c.aiState = 'flee'; c.aiTimer = 0; }
      b.police = 'coming'; b.policeT = 0;
      playSound('siren');
    }
  }

  // He's shit himself out on the sand: the whole beach clears out, holding their noses. Nobody calls the cops about it.
  if (!b.disgust && !b.panic && b.storm === 0 && isShat(state)) {
    b.disgust = true;
    const shouts = ['EWWW!', 'OH GOD, THE SMELL!', 'HE SHIT HIMSELF!', 'MY EYES!'];
    let n = 0;
    for (const c of civilians) {
      if (c.health <= 0) continue;
      c.aiState = 'flee'; c.aiTimer = 0; c.disgusted = true;
      const onScreen = c.pos.x > state.camera.x - 20 && c.pos.x < state.camera.x + CANVAS_WIDTH + 20;
      if (onScreen && n < shouts.length) state.damageNumbers.push({ id: `ew-${c.id}`, text: shouts[n++], pos: { x: c.pos.x + c.width / 2, y: c.pos.y - 16 }, vel: { x: 0, y: -1.2 }, life: 90, maxLife: 90, isCritical: false, isCallout: true, color: '#84CC16' });
    }
    playSound('barf', 0.35, 4);
  }

  updatePolice(ctx, b);

  // The storm rolls in once you've made it to the tiki bar, and not while there are cops after you
  const copsActive = b.police === 'coming' || b.police === 'fight';
  if (!b.stormAt && !copsActive && player.pos.x >= COURSE.stormAt) {
    b.stormAt = state.frame;
    playSound('thunder');
    shakeScreen(state, 40, 6);
    // Everybody still out on the sand runs for cover
    for (const c of civilians) if (c.health > 0) {
      c.aiState = 'shelter'; c.aiTimer = 0;
      c.aiX = COURSE.shelters.reduce((best, x) => Math.abs(x - c.pos.x) < Math.abs(best - c.pos.x) ? x : best, COURSE.shelters[0]);
    }
    const line = b.killed > 0 ? 'GREAT. NOW IT\'S RAINING.' : 'OH, GREAT. WEATHER.';
    const shown = say(line, MEATHEAD_VOICE, 'urgent', {
      onShow: () => { state.playerLastVulgarity = line; state.playerVulgarityTimer = 150; },
      onHide: () => { if (state.playerLastVulgarity === line) state.playerVulgarityTimer = 0; },
    });
    if (!shown) { state.playerLastVulgarity = line; state.playerVulgarityTimer = 120; }
  }
  if (b.stormAt > 0) b.storm = Math.min(1, b.storm + 1 / STORM_FRAMES);
  // Past the beach with the storm up: checkpoint
  if (b.storm >= 1 && state.checkpoint < CP.STORM && player.isGrounded && player.pos.x >= COURSE.checkpoints[CP.STORM].x) state.checkpoint = CP.STORM;
};

const updatePolice = (ctx: FrameContext, b: Beach) => {
  const { state } = ctx;
  switch (b.police) {
    case 'coming':
      b.policeT++;
      if (b.policeT === POLICE_DELAY) {
        // The cruiser comes screaming in from the right
        b.cruiserX = state.camera.x + 900;
        b.cruiserStop = state.camera.x + 610;
        playSound('siren');
      }
      if (b.policeT > POLICE_DELAY) {
        b.cruiserX = Math.max(b.cruiserStop, b.cruiserX - CRUISER_SPEED);
        if (b.cruiserX === b.cruiserStop) {
          // Doors fly open: three cops and two in riot gear, one more running in from the left
          const y = 550;
          const cam = state.camera.x;
          const squad: [Parameters<typeof makeKindEnemy>[0], number][] = [
            ['riotcop', cam + 520], ['cop', cam + 600], ['cop', cam + 680], ['riotcop', cam + 745], ['cop', cam + 60],
          ];
          for (const [kind, rawX] of squad) {
            // (every one of them fully on screen, and on your side of the tiki bar)
            const x = Math.min(Math.max(cam + 40, Math.min(cam + 760, rawX)), b.lock ? b.lock.x - 60 : Infinity);
            const cop = makeKindEnemy(kind, x, y);
            cop.facing = x < state.player.pos.x ? 1 : -1;
            state.enemies.push(cop);
            b.copIds.push(cop.id);
          }
          b.police = 'fight';
          shakeScreen(state, 10, 4);
        }
      }
      break;
    case 'fight':
      if (copsLeft(state, b) === 0) b.police = 'done';
      break;
  }
  // Held up at the tiki bar till they're all dead (if you hadn't already got past it when they were called)
  const holdUp = b.police === 'coming' || b.police === 'fight';
  if (holdUp && !b.lock && state.player.pos.x + state.player.width < TIKI_WALL_X) {
    b.lock = { x: TIKI_WALL_X, y: -3000, w: 40, h: 4000, type: 'wall', hidden: true, tag: 'tiki-lock' };
    state.blocks.push(b.lock);
    // (and the view stops there too)
    state.cameraMaxX = TIKI_WALL_X + 40 - CANVAS_WIDTH;
  }
  if (!holdUp && b.lock) { const lock = b.lock; state.blocks = state.blocks.filter(x => x !== lock); b.lock = null; state.cameraMaxX = undefined; }
};

/** Where you're held up while the cops are after you: just past the tiki bar. */
const TIKI_WALL_X = (COURSE.props.find(p => p.look === 'tiki')?.x ?? 0) + 90;

/** Cops still standing (for the HUD). */
export const copsLeft = (state: GameState, b: Beach) => state.enemies.filter(e => b.copIds.includes(e.id) && e.health > 0 && !e.isBlownAway).length;
