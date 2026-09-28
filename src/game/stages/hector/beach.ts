// The sunny beach: the beachgoers, what happens if you start shooting them (a
// panic, a body count, then the cops), and the storm rolling in.
//
// Shoot one and the rest scatter; an INNOCENTS KILLED count shows until they're
// all gone one way or the other. Then sirens: a cruiser pulls up and you're
// boxed in until the cops are dead. Either way, walk on far enough (with no cops
// on you) and the hurricane arrives: the sky goes black, and anyone still on the
// beach runs for cover.

import type { Block } from '../../../types';
import type { FrameContext } from '../../context';
import type { GameState } from '../../state';
import { makeKindEnemy } from '../../systems/kinds';
import { playSound } from '../../audio';
import { shakeScreen } from '../../state';
import { say, MEATHEAD_VOICE } from '../../speech';
import { COURSE, CP } from './course';

export interface Beach {
  /** Beachgoers killed, and how long the count stays up. */
  killed: number;
  counterT: number;
  counted: Set<string>;
  panic: boolean;
  police: 'none' | 'coming' | 'fight' | 'done';
  policeT: number;
  /** The cruiser pulling up: where it is, and where it stops. */
  cruiserX: number;
  cruiserStop: number;
  walls: Block[];
  copIds: string[];
  /** The camera's usual limits, while the cops have you boxed in. */
  savedMinX: number;
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
  return { killed: 0, counterT: 0, counted: new Set(), panic: false, police: 'none', policeT: 0, cruiserX: 0, cruiserStop: 0, walls: [], copIds: [], savedMinX: 0, storm: stormy ? 1 : 0, stormAt: stormy ? -1 : 0 };
};

export const stormLevel = (b: Beach) => b.storm;

export const updateBeach = (ctx: FrameContext, b: Beach) => {
  const { state } = ctx;
  const { player } = state;
  const civilians = state.enemies.filter(e => e.kind === 'civilian');

  // Somebody's dead: count them (the ones who got away don't count)
  for (const e of civilians) {
    if ((e.health > 0 && !e.isBlownAway) || e.aiState === 'gone' || b.counted.has(e.id)) continue;
    b.counted.add(e.id);
    // (the storm's lightning doesn't count against you)
    if (b.storm > 0) continue;
    b.killed++;
    b.counterT = 150;
    if (!b.panic) {
      b.panic = true;
      for (const c of civilians) if (c.health > 0) { c.aiState = 'flee'; c.aiTimer = 0; }
      b.police = 'coming'; b.policeT = 0;
      playSound('siren');
    }
  }
  const stillRunning = civilians.some(c => c.health > 0 && (c.aiState === 'flee' || c.aiState === 'shelter'));
  if (b.counterT > 0 && !stillRunning) b.counterT--;

  updatePolice(ctx, b);

  // The storm rolls in once you've made it a little way up the beach (not while the cops have you boxed in)
  if (!b.stormAt && player.pos.x >= COURSE.stormAt && b.police !== 'coming' && b.police !== 'fight') {
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
      onHide: () => { if (state.playerLastVulgarity === line) state.playerVulgarityTimer = Math.min(state.playerVulgarityTimer, 30); },
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
        // The cruiser comes screaming in from the right and you're boxed in where you stand
        b.cruiserX = state.camera.x + 900;
        b.cruiserStop = state.camera.x + 610;
        b.savedMinX = state.cameraMinX;
        state.cameraMinX = state.camera.x;
        state.cameraMaxX = state.camera.x;
        b.walls = [
          { x: state.camera.x - 40, y: -2000, w: 40, h: 3000, type: 'wall', hidden: true, tag: 'police' },
          { x: state.camera.x + 800, y: -2000, w: 40, h: 3000, type: 'wall', hidden: true, tag: 'police' },
        ];
        state.blocks.push(...b.walls);
        playSound('siren');
      }
      if (b.policeT > POLICE_DELAY) {
        b.cruiserX = Math.max(b.cruiserStop, b.cruiserX - CRUISER_SPEED);
        if (b.cruiserX === b.cruiserStop) {
          // Doors fly open: three cops and two in riot gear, one more running in from the left
          const y = 550;
          const squad: [Parameters<typeof makeKindEnemy>[0], number][] = [
            ['cop', b.cruiserX + 30], ['cop', b.cruiserX + 150], ['riotcop', b.cruiserX - 40], ['riotcop', b.cruiserX + 200], ['cop', state.camera.x + 40],
          ];
          for (const [kind, x] of squad) {
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
    case 'fight': {
      const left = state.enemies.filter(e => b.copIds.includes(e.id) && e.health > 0 && !e.isBlownAway).length;
      if (left === 0) {
        // Let you go on
        state.blocks = state.blocks.filter(bl => !b.walls.includes(bl));
        b.walls = [];
        state.cameraMinX = b.savedMinX;
        state.cameraMaxX = undefined;
        b.police = 'done';
      }
      break;
    }
  }
};

/** Cops still standing (for the HUD). */
export const copsLeft = (state: GameState, b: Beach) => state.enemies.filter(e => b.copIds.includes(e.id) && e.health > 0 && !e.isBlownAway).length;
