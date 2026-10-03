// The White House, before the medal: the press room (the finale's room, stages/finale, as it is before anyone's
// wrecked it), and a short walk in from the side door to his mark, the tape on the floor by the podium. His to walk:
// nobody to fight, no guns (it's a medal ceremony), the door shut behind him, the press in their seats, the President
// not out yet. Whatever he does with his time (crouching, say: game/player/gut.ts), there's no clock on it. On his
// mark it's out of his hands: a beat, the fade, and the ceremony (shat, if he's shat: see EndingCutscene).

import type { StageLayout } from '../index';
import type { Block } from '../../../types';
import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import type { Controls } from '../../platform/input';
import { NO_CONTROLS } from '../../platform/input';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../constants';
import { say, isTalking, MEATHEAD_VOICE } from '../../platform/speech';
import { isShat } from '../../player/gut';
import { drawRoomBack, drawWalls } from '../finale/room';
import { ROOM_L, ROOM_R, ROOM_TOP, ROOM_MID, FLOOR, VIEW_X, VIEW_Y, VIEW_W, VIEW_H, VIEW_SCALE, RISERS, RISER_H } from '../finale/geometry';

/** His mark: the tape on the floor, right of the podium (where the ceremony has him standing). */
export const MARK_X = ROOM_MID + 90;
/** Where he starts: just in through the left-hand door. */
const START_X = ROOM_L + 8;
/** On his mark: how long before the fade starts (once nobody's talking), and the fade. */
const ON_MARK_BEAT = 40, FADE = 36;
/** What he says if he goes for a gun (the once). */
const NO_GUNS = 'HANDLER SAID NO SHOOTING TILL AFTER THE MEDAL.';

interface WalkOn {
  kind: 'walkOn';
  t: number;
  /** Frames since he got to his mark (undefined: still walking). */
  onMark?: number;
  /** Frames into the fade, and whether the stage has been told it's over. */
  fade: number; done: boolean;
  /** He's been told about the guns. */
  gunSaid: boolean;
}

const getWalkOn = (state: GameState) => { const s = state.stage as WalkOn | null; return s && s.kind === 'walkOn' ? s : null; };

const update = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx;
  const rt = getWalkOn(state);
  if (!rt) return controls;
  rt.t++;
  // The whole room, all the time (as in the fight)
  state.cameraOverride = { x: VIEW_X, y: VIEW_Y };
  state.view = { x: VIEW_X, y: VIEW_Y, w: VIEW_W, h: VIEW_H };
  const p = state.player;
  const px = p.pos.x + p.width / 2;
  if (rt.onMark === undefined) {
    // His to walk (and jump, and crouch): nothing to fire, no specials, no charging
    if ((controls.shoot || controls.special || controls.secondary || controls.charge) && !rt.gunSaid && !isTalking()) {
      rt.gunSaid = true;
      say(NO_GUNS, MEATHEAD_VOICE, 'casual', {
        onShow: () => { state.playerLastVulgarity = NO_GUNS; state.playerVulgarityTimer = 9999; },
        onHide: () => { if (state.playerLastVulgarity === NO_GUNS) state.playerVulgarityTimer = 0; },
      });
    }
    // On his mark, on his feet: it's out of his hands from here
    if (p.isGrounded && !p.isDucking && Math.abs(px - MARK_X) < 16) { rt.onMark = 0; p.inCutscene = true; }
    return { ...controls, shoot: false, special: false, secondary: false, charge: false };
  }
  rt.onMark++;
  p.inCutscene = true;
  // Squared up on the tape exactly, facing the podium
  const off = MARK_X - px;
  if (Math.abs(off) > 3) return { ...NO_CONTROLS, left: off < 0, right: off > 0 };
  p.vel.x = 0;
  p.facing = -1;
  // (and whatever he's saying, or the announcer is, said first: nobody's cut off)
  const quiet = !isTalking() && p.gut?.lineAt === undefined && state.playerVulgarityTimer <= 0;
  if (rt.onMark >= ON_MARK_BEAT && (quiet || rt.fade > 0)) rt.fade++;
  if (rt.fade >= FADE && !rt.done) { rt.done = true; ctx.events.onStageDone?.(isShat(state)); }
  return { ...NO_CONTROLS };
};

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------

/** The seats, as the room paints them (see finale/room.ts paintSeats): who's in each, a bit of them each. */
const SEATS: number[] = [];
for (const [x0, x1] of [[ROOM_L + 30, ROOM_MID - 280], [ROOM_MID + 280, ROOM_R - 30]]) for (let x = x0; x < x1 - 34; x += 38) SEATS.push(x + 16);
const HAIR = ['#3a2410', '#141414', '#8c8c94', '#a87c3c', '#5a3418'];
const COAT = ['#26262e', '#1c2448', '#3a2a1a', '#2c2c34'];

const R = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

/**
 * The press in their seats, backs to us (dimmed with the room behind him: nothing to stand on), cameras going off as
 * he comes past; if he's shit himself, the ones he's near leaning away from him in their seats.
 */
const drawPress = (ctx: CanvasRenderingContext2D, state: GameState) => {
  const p = state.player, px = p.pos.x + p.width / 2, f = state.frame;
  const shat = isShat(state);
  SEATS.forEach((cx, i) => {
    const d = cx - px;
    const lean = shat && Math.abs(d) < 170 ? Math.sign(d || 1) * Math.round(8 * (1 - Math.abs(d) / 170)) : 0;
    const y = 498 + (i % 3 === 1 ? 2 : 0);
    R(ctx, cx - 11 + Math.round(lean / 2), y + 8, 22, 12, COAT[i % 4]);
    R(ctx, cx - 11 + Math.round(lean / 2), y + 8, 22, 1, 'rgba(255, 255, 255, 0.12)');
    const hx = cx + lean;
    R(ctx, hx - 6, y - 4, 12, 12, HAIR[i % 5]);
    R(ctx, hx - 5, y - 6, 10, 2, HAIR[i % 5]);
    R(ctx, hx - 4, y - 5, 5, 1, 'rgba(255, 255, 255, 0.2)');
    R(ctx, hx + 6, y + 1, 2, 4, '#c8946a');
    // A camera up, every third one, its flash going off as he comes past (never while he stinks: they've stopped)
    if (i % 3 === 0) {
      R(ctx, hx - 4, y - 14, 10, 7, '#18181c'); R(ctx, hx - 2, y - 16, 4, 2, '#18181c'); R(ctx, hx + 1, y - 12, 3, 3, '#52525b');
      if (!shat && Math.abs(d) < 260 && (Math.floor(f / 5) + i * 7) % 23 === 0) {
        R(ctx, hx - 1, y - 24, 2, 14, '#ffffff'); R(ctx, hx - 7, y - 18, 14, 2, '#ffffff'); R(ctx, hx - 3, y - 20, 6, 6, '#ffffff');
      }
    }
  });
  // (the lot of them dimmed back with the room)
  R(ctx, ROOM_L, 480, ROOM_R - ROOM_L, FLOOR - 480, 'rgba(6, 6, 18, 0.3)');
};

/** His mark: an X of yellow gaffer tape on the carpet, glinting till he's on it. */
const drawMark = (ctx: CanvasRenderingContext2D, rt: WalkOn | null, f: number) => {
  const y = FLOOR + 9;
  for (let k = -10; k <= 10; k += 2) {
    const yy = y + Math.round(k * 0.35);
    R(ctx, MARK_X + k - 1, yy - 1, 3, 2, '#b8860b'); R(ctx, MARK_X + k - 1, yy - 1, 3, 1, '#fde047');
    R(ctx, MARK_X - k - 1, yy - 1, 3, 2, '#b8860b'); R(ctx, MARK_X - k - 1, yy - 1, 3, 1, '#fde047');
  }
  if (rt?.onMark === undefined && f % 60 < 8) { R(ctx, MARK_X - 9, y - 4, 3, 1, '#ffffff'); R(ctx, MARK_X - 8, y - 5, 1, 3, '#ffffff'); }
};

export const walkOnLayout: StageLayout = {
  left: ROOM_L - 400,
  // (the stage's intro stands him 150 in from here)
  startX: START_X - 150,
  bossStartX: START_X - 150,
  startsStanding: true,
  verticalCamera: false,
  runsInArena: true,
  ownBossBarrier: true,
  build: state => {
    state.stage = { kind: 'walkOn', t: 0, fade: 0, done: false, gunSaid: false } as WalkOn;
    // The room: the floor, the side walls (to the floor this time: the doors are shut), the ceiling, the risers
    const blocks: Block[] = [
      { x: ROOM_L - 400, y: FLOOR, w: ROOM_R - ROOM_L + 800, h: 80, type: 'ground', hidden: true },
      { x: ROOM_L - 100, y: -3000, w: 100, h: 3000 + FLOOR, type: 'wall', hidden: true },
      { x: ROOM_R, y: -3000, w: 100, h: 3000 + FLOOR, type: 'wall', hidden: true },
      { x: ROOM_L - 100, y: ROOM_TOP - 400, w: ROOM_R - ROOM_L + 200, h: 400, type: 'wall', hidden: true },
      ...RISERS.map(r => ({ x: r.x, y: r.y, w: r.w, h: RISER_H, type: 'platform' as const, oneWay: true, hidden: true })),
    ];
    state.blocks = blocks;
    state.groundRuns = [];
    state.enemies = [];
    state.pickups = [];
    // (no door to kick: he's in)
    state.doorState = 'done';
    state.doorOpenAmount = 0;
    state.camera = { x: VIEW_X, y: VIEW_Y };
    state.cameraOverride = { x: VIEW_X, y: VIEW_Y };
    state.view = { x: VIEW_X, y: VIEW_Y, w: VIEW_W, h: VIEW_H };
    state.cameraRestY = VIEW_Y;
    state.cameraMinX = VIEW_X;
  },
  update,
  // (the ceremony's music, from the first step: the ending's arrangement of the title, which carries on into it)
  music: () => 'ending',
  zoom: () => ({ scale: VIEW_SCALE, x: VIEW_X, y: VIEW_Y }),
  drawBackdrop: ctx => { ctx.fillStyle = '#05050a'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); return true; },
  drawBack: (ctx, state) => { drawRoomBack(ctx, state); drawPress(ctx, state); drawMark(ctx, getWalkOn(state), state.frame); },
  // (the left-hand door he came in by swinging shut behind him)
  drawFront: (ctx, state) => drawWalls(ctx, { doorOpen: [Math.max(0, 1 - (getWalkOn(state)?.t ?? 99) / 50), 0], doorsShut: false, windowBroken: [false, false], wrecked: {} }, state.frame),
  drawHud: (ctx, state) => {
    const rt = getWalkOn(state);
    if (rt && rt.fade > 0) { ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, rt.fade / FADE).toFixed(3)})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  },
  footstep: (_state, floor) => (floor.type === 'platform' ? 'metal' : 'dirt'),
};
