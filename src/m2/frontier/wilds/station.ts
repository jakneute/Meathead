// LONESOME PINE STATION: the end of the wilds. A remote frontier whistle stop (the park's 1800s): a plank platform, a
// depot shack (its ticket window CLOSED), a timetable board, a bell on a post, a water tower; Tucker's train waiting
// behind the platform (a 4-4-0: the balloon stack, the cowcatcher, the big red drivers; its tender, a coach, the
// caboose). The scene, to the user's brief:
//
//   THE PITCH (a cutscene: HUD hidden, no controls, SKIP >> for the lot): it starts while Tucker's still off the
//     screen's edge (he can't be shot or hit before it: the playtest), Meathead walked up short of the gate; Tucker,
//     cheery, tips his cap and makes his pitch (Sawdust Gulch, mining and logging, these newfangled railroad tracks);
//     TICKET, PLEASE (his hand out); Meathead hasn't got one. (A retry this visit: just TICKET, PLEASE.)
//   THE PUNCH (played, not scripted): Tucker stands in the gate with his hand out, the way on shut behind him, nagging
//     now and then. Any hit on him (any move, any weapon: he can't be killed here, he's a stand-in that's never hurt)
//     and down he goes on his backside, his cap flying.
//   THE RAGE (a cutscene from the punch landing on, no controls, SKIP >> for the lot): up he springs, furious; a close-up of his face (tucker.ts): "NO ONE
//     BOARDS MY TRAIN WITHOUT A TICKET!"; he snatches up his cap and runs to his engine, up into the cab, hauls on the
//     whistle, and the train pulls out and speeds off; ALL ABOARD! EXCEPT YOU! out the cab window; Meathead goes after
//     it, and the scene ends with him at the train section's start (job 2 builds the caboose jump-on).
//
// Done for good once it's run (STATION_MEMO, state.stageMemo): back here later, the train's long gone, no Tucker, the
// timetable says WHENEVER; walk off the platform's right end to go on (DOORS.train.start).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import type { Enemy, EnemyKind, Block } from '../../../m1/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine, silenceAll } from '../../../m1/game/platform/speech';
import { shakeScreen } from '../../../m1/game/core/state';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { registerM2Kind } from '../../kinds';
import { hands, meatheadSays, speak, saidOver, teleport, byPants, type Said } from '../section';
import { DOORS } from '../geometry';
import { TUCKER_VOICE, type ByPants } from '../talk';
import { box, mix, onScreen, frontierSign, burned, INK, type Ctx } from '../kit';
import { signText } from '../../signLetters';
import { drawTucker, drawTuckerCap, drawTuckerCloseup, TUCKER_H, type TuckerPose } from '../tucker';
import { STATION, Y } from './layout';
import { TUCKER_GREET, TUCKER_PITCH, TUCKER_TICKET, NO_TICKET, TUCKER_BLOCK, TUCKER_OOF, TUCKER_RAGE, TUCKER_RUN, TUCKER_CAB, CHASE, STATION_EMPTY } from './lines';

/** The scene's run for good (kept across his deaths; a revisit's station is empty). */
export const STATION_MEMO = 'frontier-station-done';
export const stationDone = (state: GameState) => state.stageMemo[STATION_MEMO] === '1';
/** The pitch has been heard (a death after it, back at the station's checkpoint: straight to Tucker in the gate). */
const PITCH_MEMO = 'frontier-station-pitched';

// ---------------------------------------------------------------------------------------------------------------
// Tucker at the gate, as something to hit: a stand-in that's never hurt (any hit's the punch), drawn by the scene

const PUPPET = 'm2:fr_tucker_gate';
registerM2Kind({
  kind: PUPPET, stats: { w: 38, h: 90, hp: 99999, contact: 0, mass: 300 },
  ai: (_ctx, e) => { e.vel.x = 0; e.vel.y = 0; return true; },
  make: b => ({ ...b, harmless: true }),
  draw: () => {},
  head: { x: 2, y: -78, r: 12 }, gender: 'm', grab: 'none', midBoss: true, fixture: true, pathing: false,
  onGrab: () => { punchedByGrab = true; return { said: true, free: true }; },
});
let punchedByGrab = false;

type Step = 'wait' | 'pitch' | 'block' | 'punched' | 'rage' | 'run' | 'board' | 'leave' | 'chase' | 'gone';

interface Station {
  step: Step; t: number; all: number;
  /** Tucker: where he is (feet), his pose, facing, talking, his cap off; in the cab once he's boarded. */
  tx: number; pose: TuckerPose; face: 1 | -1; talking: boolean; capless: boolean; inCab: boolean;
  /** His cap, knocked off: flying, then lying. */
  cap: { x: number; y: number; vx: number; vy: number; rot: number; down: boolean } | null;
  /** The scripted lines: which one's up, and done. */
  line: number; lineDone: boolean;
  said: Said | null;
  /** The gate's stand-in and its wall. */
  puppet: Enemy | null; wall: Block | null;
  nagT: number;
  /** The train: how far it's pulled out, how fast, how far its wheels have turned. */
  trainX: number; trainV: number;
  /** The close-up (0 gone .. 1 up), the fade to black at the end. */
  close: number; fade: number;
  emptySaid: boolean;
}
const STATIONS = new WeakMap<object, Station>();
const stOf = (state: GameState): Station => {
  const k = state.stage as object;
  let s = STATIONS.get(k);
  if (!s) {
    s = { step: stationDone(state) ? 'gone' : 'wait', t: 0, all: 0, tx: STATION.gate, pose: 'stand', face: -1, talking: false, capless: false, inCab: false, cap: null, line: 0, lineDone: false, said: null, puppet: null, wall: null, nagT: 0, trainX: 0, trainV: 0, close: 0, fade: 0, emptySaid: false };
    STATIONS.set(k, s);
  }
  return s;
};

const tuckerSay = (state: GameState, s: Station, pool: ByPants, done?: () => void, queued = true) => {
  s.talking = true;
  speak(TUCKER_VOICE, pickLine(byPants(state, pool)), said => { s.said = said; if (!said) s.talking = false; }, queued, () => { s.talking = false; done?.(); });
};

const AWAY = -99999;
/** The way on shut (the wall past him), and, once the pitch is done (`puppet`), him in the gate as something to hit:
 *  never before (he's not to be shot or hit before his scene's had its say: the playtest). */
const closeGate = (state: GameState, s: Station, puppet = true) => {
  if (!s.puppet && puppet) {
    const e = makeKindEnemy(PUPPET as EnemyKind, STATION.gate, Y(STATION.deck.h));
    e.facing = -1; e.variant = 0;
    state.enemies.push(e); s.puppet = e;
  }
  if (!s.wall) { s.wall = { x: STATION.gate + 22, y: Y(STATION.deck.h) - 400, w: 30, h: 400, type: 'wall', hidden: true, tag: 'fr-gate' } as Block; state.blocks.push(s.wall); }
};
const openGate = (state: GameState, s: Station) => {
  if (s.puppet) { state.enemies = state.enemies.filter(e => e !== s.puppet); s.puppet = null; }
  if (s.wall) { s.wall.y = AWAY; s.wall = null; }
};

/** How far short of the gate the scene starts (he's off the edge of the screen there: nothing can reach him), and
 *  where he's walked up to for it. */
const TRIGGER = 520, STOP_SHORT = 220;

/** The pitch done (or skipped): Tucker in the gate with his hand out, something to hit now; the controls his. */
const toBlock = (state: GameState, s: Station) => {
  s.step = 'block'; s.t = 0; s.pose = 'ticket'; s.said = null; s.talking = false;
  state.player.inCutscene = false;
  state.stageMemo[PITCH_MEMO] = '1';
  closeGate(state, s);
};

/** The scene's over (run through, or skipped from the rage on): on to the train. */
const finish = (state: GameState, s: Station, skipped: boolean) => {
  if (skipped) silenceAll();
  openGate(state, s);
  state.stageMemo[STATION_MEMO] = '1';
  s.step = 'gone'; s.said = null; s.fade = 0; s.close = 0;
  const p = state.player;
  p.inCutscene = false;
  state.cameraOverride = null;
  teleport(state, DOORS.train.start.x, DOORS.train.start.y);
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame

export const updateStation = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, p = state.player, s = stOf(state);
  const cx = p.pos.x + p.width / 2;
  s.t++;
  if (s.step === 'gone') {
    if (!s.emptySaid && cx > STATION.deck.a + 60 && cx < STATION.deck.b) { s.emptySaid = true; meatheadSays(state, pickLine(STATION_EMPTY), false); }
    return controls;
  }
  if (s.step === 'wait') {
    s.pose = 'stand'; s.face = -1;
    // (the scene starts while he's still off the screen's edge, before Tucker's anywhere he can be shot or hit; a
    // retry this visit (the pitch heard) just gets TICKET, PLEASE again)
    if (cx > STATION.gate - TRIGGER && p.health > 0 && !p.inCutscene) {
      const heard = !!state.stageMemo[PITCH_MEMO];
      s.step = 'pitch'; s.t = heard ? 21 : 0; s.all = 0; s.line = heard ? 3 : 0; s.lineDone = false;
      closeGate(state, s, false);
      // (and nothing he'd already let fly gets there)
      state.projectiles = state.projectiles.filter(q => q.owner !== 'player');
    }
    return controls;
  }
  // (the cutscenes: no HUD, no controls, SKIP >> for the lot)
  const cut = s.step === 'pitch' || s.step === 'punched' || s.step === 'rage' || s.step === 'run' || s.step === 'board' || s.step === 'leave' || s.step === 'chase';
  if (cut) {
    s.all++;
    p.inCutscene = true;
    if (s.all > SKIP_AFTER) {
      offerSkip();
      if (takeSkip()) {
        if (s.step === 'pitch') { silenceAll(); toBlock(state, s); return hands(); }
        finish(state, s, true); return hands();
      }
    }
  }
  switch (s.step) {
    case 'pitch': {
      // (him walked up short of the gate (no controls of his own); Tucker's pitch, then his hand out; then him: no
      // ticket)
      const walk = cx < STATION.gate - STOP_SHORT && p.health > 0;
      if (!walk) p.vel.x = 0;
      if (s.t === 20) { s.pose = 'tip'; tuckerSay(state, s, TUCKER_GREET, () => { s.line = 1; }); }
      if (s.line === 1) { s.line = 2; s.pose = 'talk'; tuckerSay(state, s, TUCKER_PITCH, () => { s.line = 3; }); }
      if (s.line === 3) { s.line = 4; s.pose = 'ticket'; tuckerSay(state, s, TUCKER_TICKET, () => { s.line = 5; }); }
      if (s.line === 5) { s.line = 6; meatheadSays(state, pickLine(byPants(state, NO_TICKET)), true, () => { s.line = 7; }); }
      if (s.line === 7 && !walk) toBlock(state, s);
      return walk ? ({ ...hands(), right: true } as Controls) : hands();
    }
    case 'block': {
      // (in the way, hand out; nagging now and then; any hit on him and down he goes)
      s.pose = 'ticket'; s.face = cx < s.tx ? -1 : 1;
      if (++s.nagT > 420 && !s.talking) { s.nagT = 0; tuckerSay(state, s, TUCKER_BLOCK, undefined, false); }
      const e = s.puppet;
      const hit = punchedByGrab || !e || e.health < e.maxHealth || !state.enemies.includes(e);
      if (hit) {
        punchedByGrab = false;
        openGate(state, s);
        // (from the punch on, it's all a cutscene: no controls, no HUD; nothing more to be done to him)
        s.step = 'punched'; s.t = 0; s.all = 0; s.pose = 'sit'; s.capless = true;
        p.inCutscene = true; p.vel.x *= 0.3;
        state.projectiles = state.projectiles.filter(q => q.owner !== 'player');
        s.cap = { x: s.tx, y: Y(STATION.deck.h) - TUCKER_H + 6, vx: (cx < s.tx ? 1 : -1) * 3.2, vy: -6, rot: 0, down: false };
        playSound('punch', 1, -2); playSound('thud', 0.9, -6); shakeScreen(state, 6, 3);
        silenceAll(); s.said = null;
        tuckerSay(state, s, TUCKER_OOF, undefined, false);
        return hands();
      }
      return controls;
    }
    case 'punched':
      if (p.isGrounded) p.vel.x *= 0.8;
      if (s.t > 80 && !s.talking) {
        // (up he springs, red to the ears: the close-up, the line)
        s.step = 'rage'; s.t = 0; s.pose = 'furious'; s.face = cx < s.tx ? -1 : 1;
        p.vel.x = 0;
        playSound('slam', 0.7, -2);
        s.lineDone = false;
        tuckerSay(state, s, TUCKER_RAGE, () => { s.lineDone = true; });
      }
      return hands();
    case 'rage':
      s.close = Math.min(1, s.close + 0.12);
      state.cameraOverride = { x: STATION.camX, y: state.camera.y }; state.camera.x += (STATION.camX - state.camera.x) * 0.15;
      if (s.lineDone && s.t > 60) {
        s.close = 0;
        // (his cap snatched back up off the planks, and he's off to his engine)
        s.capless = false; s.cap = null;
        s.step = 'run'; s.t = 0; s.pose = 'run'; s.face = 1;
      }
      return hands();
    case 'run':
      state.cameraOverride = { x: STATION.camX, y: state.camera.y }; state.camera.x += (STATION.camX - state.camera.x) * 0.15;
      s.tx += 4.6;
      if (s.t === 1) tuckerSay(state, s, TUCKER_RUN, undefined, false);
      if (s.t % 12 === 0) playSound('step_wood', 0.5, 4);
      if (s.tx >= STATION.cab - 20) { s.step = 'board'; s.t = 0; s.inCab = true; s.pose = 'whistle'; }
      return hands();
    case 'board':
      state.cameraOverride = { x: STATION.camX, y: state.camera.y }; state.camera.x += (STATION.camX - state.camera.x) * 0.15;
      if (s.t === 10 || s.t === 34) playSound('horn', 0.9, 10);
      if (s.t === 50) { s.pose = 'cab'; s.lineDone = false; tuckerSay(state, s, TUCKER_CAB, () => { s.lineDone = true; }); }
      if (s.t > 60) { s.step = 'leave'; s.t = 0; s.trainV = 0.4; playSound('engine', 0.8, -8); meatheadSays(state, pickLine(byPants(state, CHASE)), true); }
      return hands();
    case 'leave':
      state.cameraOverride = { x: STATION.camX, y: state.camera.y };
      s.trainV = Math.min(15, s.trainV + 0.07 + s.trainV * 0.012);
      s.trainX += s.trainV;
      if (s.t % Math.max(4, Math.round(26 - s.trainV * 1.6)) === 0) playSound('thud', 0.35, -14 + s.trainV * 0.4);
      if (s.trainX > 1300 && s.lineDone) { s.step = 'chase'; s.t = 0; }
      return hands();
    case 'chase':
      // (after it: he runs off the right of the platform; the black comes down; on to the train)
      state.cameraOverride = { x: STATION.camX, y: state.camera.y };
      s.fade = Math.max(0, Math.min(1, (s.t - 30) / 24));
      if (s.t > 58) { finish(state, s, false); return hands(); }
      return { ...hands(), right: true } as Controls;
  }
  return controls;
};

/** Tucker's cap, knocked off, flying and landing. */
const tickCap = (s: Station) => {
  const c = s.cap;
  if (!c || c.down) return;
  c.vy += 0.4; c.x += c.vx; c.y += c.vy; c.rot += c.vx * 0.08;
  if (c.y > Y(STATION.deck.h) - 4) { c.y = Y(STATION.deck.h) - 4; c.down = true; c.rot = 0.2; }
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing: the station, the train, Tucker

const RED = '#A3262A', RED_L = '#D4483E', BLACK = '#26262C', BRASS = '#E0B040', WOOD = '#8A5A30', WOOD_L = '#B07A48';

/** A spoked driving wheel (red, a brass hub, spokes turned by `a`). */
const wheel = (c: Ctx, x: number, y: number, r: number, a: number) => {
  c.fillStyle = INK; c.beginPath(); c.arc(x, y, r + 1.5, 0, Math.PI * 2); c.fill();
  c.fillStyle = RED; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#5A1A1A'; c.beginPath(); c.arc(x, y, r - 3, 0, Math.PI * 2); c.fill();
  c.strokeStyle = RED_L; c.lineWidth = 2;
  for (let k = 0; k < 8; k++) { const t = a + (k * Math.PI) / 4; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(t) * (r - 3), y + Math.sin(t) * (r - 3)); c.stroke(); }
  c.fillStyle = BRASS; c.beginPath(); c.arc(x, y, 3, 0, Math.PI * 2); c.fill();
};

/** The train, its back end (the caboose's) at x0, rails at y; `roll` how far it's gone (the wheels and rods). */
const drawTrain = (c: Ctx, s: Station, f: number) => {
  const dx = s.trainX, y = Y(STATION.deck.h) + 40, roll = dx / 16;
  // ---- the caboose: red, a cupola on top, its back porch and rail, its lamp
  const cb = STATION.caboose + dx;
  box(c, cb, y - 92, 170, 76, INK); box(c, cb + 2, y - 90, 166, 72, RED); box(c, cb + 2, y - 90, 166, 6, RED_L);
  box(c, cb + 60, y - 118, 56, 30, INK); box(c, cb + 62, y - 116, 52, 28, RED); box(c, cb + 66, y - 110, 18, 12, '#FDE68A'); box(c, cb + 90, y - 110, 18, 12, '#FDE68A');
  box(c, cb - 4, y - 96, 178, 6, BLACK); box(c, cb + 56, y - 122, 64, 5, BLACK);
  for (const wx of [cb + 24, cb + 74, cb + 126]) box(c, wx, y - 76, 24, 20, '#FDE68A');
  box(c, cb - 10, y - 40, 14, 4, BLACK); box(c, cb - 10, y - 66, 3, 26, BLACK);
  box(c, cb - 6, y - 80, 8, 10, '#DC2626');
  wheel(c, cb + 30, y - 10, 10, roll); wheel(c, cb + 140, y - 10, 10, roll);
  // ---- the coach: maroon and gold, a row of windows, its name along the top
  const co = cb + 180;
  box(c, co, y - 96, 200, 80, INK); box(c, co + 2, y - 94, 196, 76, '#5A2A3A'); box(c, co + 2, y - 94, 196, 6, '#7A3A4E');
  box(c, co - 4, y - 102, 208, 8, BLACK); box(c, co + 2, y - 30, 196, 4, BRASS);
  for (let k = 0; k < 6; k++) box(c, co + 14 + k * 30, y - 80, 20, 24, '#FDE68A');
  signText(c, 'WILDERNESS LAND R.R.', co + 100, y - 38, { sx: 1, sy: 1, fill: '#F4CC4E' });
  wheel(c, co + 34, y - 10, 10, roll); wheel(c, co + 166, y - 10, 10, roll);
  // ---- the tender: black, the woodpile heaped in it, its brass trim
  const te = co + 210;
  box(c, te, y - 70, 96, 56, INK); box(c, te + 2, y - 68, 92, 52, BLACK); box(c, te + 2, y - 68, 92, 4, BRASS);
  for (let k = 0; k < 6; k++) box(c, te + 6 + k * 14, y - 82 + (k % 2) * 4, 14, 14, k % 2 ? WOOD : WOOD_L);
  wheel(c, te + 22, y - 10, 10, roll); wheel(c, te + 74, y - 10, 10, roll);
  // ---- the engine: the cab (red, its window: Tucker in it), the boiler (black, brass bands), the domes, the balloon
  //      stack, the headlamp, the bell, the cowcatcher, the big red drivers and their rods
  const en = te + 104, cab = en, front = en + 200;
  box(c, cab, y - 124, 66, 104, INK); box(c, cab + 2, y - 122, 62, 100, RED); box(c, cab + 2, y - 122, 62, 5, RED_L);
  box(c, cab - 6, y - 132, 78, 9, BLACK);
  // (the cab window: dark inside; Tucker leaning out of it once he's aboard, from the sill up; the whistle cord)
  box(c, cab + 16, y - 102, 38, 32, '#1A1210');
  if (s.inCab) {
    if (s.pose === 'whistle') { c.strokeStyle = '#D6D3D1'; c.lineWidth = 1; c.beginPath(); c.moveTo(cab + 47, y - 124); c.lineTo(cab + 47, y - 26 - 104 + Math.max(0, Math.sin(f * 0.2)) * 6 + 8); c.stroke(); }
    c.save(); c.beginPath(); c.rect(cab - 30, y - 220, 140, 150); c.clip();
    drawTucker(c, cab + 38, y - 26, 1, f, s.pose, { talking: s.talking });
    c.restore();
  }
  box(c, cab + 14, y - 72, 42, 4, WOOD_L); box(c, cab + 14, y - 72, 42, 1, '#E8C890');
  // (the boiler)
  box(c, cab + 64, y - 92, 126, 48, INK); box(c, cab + 66, y - 90, 122, 44, BLACK); box(c, cab + 66, y - 90, 122, 8, '#4A4A54');
  for (const bx of [cab + 90, cab + 130, cab + 170]) box(c, bx, y - 92, 5, 48, BRASS);
  // (the domes, the bell, the stack)
  box(c, cab + 100, y - 110, 22, 20, INK); box(c, cab + 102, y - 108, 18, 18, BRASS);
  box(c, cab + 140, y - 104, 12, 12, BRASS); box(c, cab + 144, y - 108, 4, 4, BLACK);
  c.fillStyle = INK; c.beginPath(); c.moveTo(cab + 160, y - 92); c.lineTo(cab + 152, y - 140); c.lineTo(cab + 190, y - 140); c.lineTo(cab + 182, y - 92); c.closePath(); c.fill();
  c.fillStyle = BLACK; c.beginPath(); c.moveTo(cab + 162, y - 92); c.lineTo(cab + 155, y - 137); c.lineTo(cab + 187, y - 137); c.lineTo(cab + 180, y - 92); c.closePath(); c.fill();
  box(c, cab + 152, y - 142, 38, 5, BRASS);
  // (the headlamp: a big box lamp, lit)
  box(c, front - 22, y - 120, 24, 22, INK); box(c, front - 20, y - 118, 20, 18, WOOD); box(c, front - 12, y - 114, 10, 10, '#FEF08A');
  // (the cowcatcher: red slats in a wedge)
  c.fillStyle = INK; c.beginPath(); c.moveTo(front - 6, y - 44); c.lineTo(front + 34, y - 4); c.lineTo(front - 6, y - 4); c.closePath(); c.fill();
  c.strokeStyle = RED_L; c.lineWidth = 3; for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(front - 4 + k * 7, y - 6); c.lineTo(front - 4, y - 40 + k * 7); c.stroke(); }
  // (the drivers, the little pilot wheels, the rods going round with them)
  for (const wx of [cab + 34, cab + 96]) wheel(c, wx, y - 22, 22, roll);
  wheel(c, cab + 150, y - 12, 11, roll); wheel(c, cab + 178, y - 12, 11, roll);
  const rx = Math.cos(roll) * 12, ry = Math.sin(roll) * 12;
  c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.moveTo(cab + 34 + rx, y - 22 + ry); c.lineTo(cab + 96 + rx, y - 22 + ry); c.stroke();
  c.strokeStyle = '#C8C8D0'; c.lineWidth = 3; c.stroke();
  c.strokeStyle = '#A1A1AA'; c.lineWidth = 3; c.beginPath(); c.moveTo(cab + 96 + rx, y - 22 + ry); c.lineTo(cab + 150, y - 40); c.stroke();
  // ---- the smoke out of the stack (thick and fast when it goes), the steam off the whistle
  const going = s.step === 'leave' || s.step === 'chase';
  for (let k = 0; k < (going ? 8 : 3); k++) {
    const t = ((f * (going ? 0.05 : 0.015) + k / (going ? 8 : 3)) % 1);
    const sx = cab + 171 - t * (going ? 120 : 20), sy = y - 150 - t * 90;
    c.globalAlpha = 0.7 * (1 - t); c.fillStyle = mix('#52525B', '#E4E4E7', t); c.beginPath(); c.arc(sx, sy, 10 + t * 22, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
  }
  if (s.step === 'board' && s.t > 8 && s.t < 50) for (let k = 0; k < 4; k++) { c.globalAlpha = 0.6; c.fillStyle = '#F8FAFC'; c.beginPath(); c.arc(cab + 110 + k * 4, y - 120 - k * 10 - (s.t % 10), 6 + k * 3, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
};

/** The platform, the depot, the board, the bell, the tower: behind the train (the tower) and in front of it. */
const drawDepot = (c: Ctx) => {
  const deckY = Y(STATION.deck.h);
  // (the water tower, behind)
  const tw = STATION.tower;
  for (const lx of [tw - 40, tw + 34]) box(c, lx, deckY - 150, 8, 150, '#5A3A1E');
  box(c, tw - 50, deckY - 230, 100, 84, INK); box(c, tw - 48, deckY - 228, 96, 80, WOOD); box(c, tw - 48, deckY - 228, 96, 6, WOOD_L);
  for (let k = 0; k < 3; k++) box(c, tw - 48, deckY - 210 + k * 22, 96, 3, '#3F3F46');
  c.fillStyle = INK; c.beginPath(); c.moveTo(tw - 54, deckY - 228); c.lineTo(tw, deckY - 262); c.lineTo(tw + 54, deckY - 228); c.closePath(); c.fill();
  c.fillStyle = '#5A3A1E'; c.beginPath(); c.moveTo(tw - 50, deckY - 229); c.lineTo(tw, deckY - 258); c.lineTo(tw + 50, deckY - 229); c.closePath(); c.fill();
  // (the depot shack: plank walls, a shake roof, its name board, the ticket window (CLOSED), the timetable)
  const dp = STATION.depot;
  box(c, dp - 90, deckY - 150, 180, 150, INK); box(c, dp - 88, deckY - 148, 176, 148, '#9A6A3A');
  for (let x = dp - 88; x < dp + 88; x += 12) box(c, x, deckY - 148, 1, 148, '#6B4423');
  c.fillStyle = INK; c.beginPath(); c.moveTo(dp - 106, deckY - 146); c.lineTo(dp, deckY - 206); c.lineTo(dp + 106, deckY - 146); c.closePath(); c.fill();
  c.fillStyle = '#5A3A22'; c.beginPath(); c.moveTo(dp - 100, deckY - 148); c.lineTo(dp, deckY - 202); c.lineTo(dp + 100, deckY - 148); c.closePath(); c.fill();
  for (let k = 1; k < 4; k++) box(c, dp - 100 + k * 12, deckY - 148 - k * 13, 200 - k * 24, 2, '#3A2414');
  box(c, dp - 86, deckY - 178, 172, 26, INK); box(c, dp - 84, deckY - 176, 168, 22, '#C89A5E');
  signText(c, 'LONESOME PINE STATION', dp, deckY - 160, burned(1, 3));
  // (the ticket window: bars, its CLOSED sign hung in it)
  box(c, dp - 50, deckY - 110, 46, 40, INK); box(c, dp - 48, deckY - 108, 42, 36, '#2A1A10');
  for (let k = 0; k < 4; k++) box(c, dp - 46 + k * 11, deckY - 108, 2, 36, '#A1A1AA');
  box(c, dp - 44, deckY - 96, 34, 14, '#FEF3C7'); signText(c, 'CLOSED', dp - 27, deckY - 86, { sx: 1, sy: 1, fill: '#B91C1C' });
  // (the door)
  box(c, dp + 20, deckY - 100, 40, 100, INK); box(c, dp + 22, deckY - 98, 36, 98, '#6B4423'); box(c, dp + 50, deckY - 52, 4, 4, BRASS);
};

/** The platform's planks (in front of the train's wheels), its lit edge (standable), the bell post at the gate, the
 *  timetable board on its own post (SAWDUST GULCH: ON TIME; later, WHENEVER). */
const drawDeck = (c: Ctx, state: GameState, gone: boolean) => {
  const deckY = Y(STATION.deck.h), a = Math.max(STATION.deck.a, state.camera.x - 40), b = Math.min(STATION.deck.b + 200, state.camera.x + 840);
  box(c, a, deckY, b - a, 44, INK); box(c, a, deckY + 1, b - a, 40, '#7A5030');
  for (let x = Math.floor(a / 30) * 30; x < b; x += 30) box(c, x, deckY + 1, 1, 40, '#4A2C16');
  box(c, a, deckY, b - a, 3, '#D8B080');
  for (let x = Math.floor(a / 120) * 120; x < b; x += 120) box(c, x + 50, deckY + 41, 10, 60, '#4A2C16');
  // (the gate: two posts, the bell on one)
  const g = STATION.gate + 20;
  box(c, g, deckY - 60, 6, 60, '#5A3A1E'); box(c, g + 26, deckY - 60, 6, 60, '#5A3A1E');
  box(c, g - 6, deckY - 76, 4, 30, '#3F3F46'); c.fillStyle = BRASS; c.beginPath(); c.moveTo(g - 14, deckY - 50); c.lineTo(g - 10, deckY - 66); c.lineTo(g - 2, deckY - 66); c.lineTo(g + 2, deckY - 50); c.closePath(); c.fill();
  const tb = STATION.gate + 130;
  box(c, tb - 3, deckY - 120, 6, 120, '#5A3A1E');
  box(c, tb - 46, deckY - 150, 92, 50, INK); box(c, tb - 44, deckY - 148, 88, 46, '#1E2A22');
  signText(c, 'DEPARTURES', tb, deckY - 136, { sx: 1, sy: 1, fill: '#F4CC4E' });
  signText(c, 'SAWDUST GULCH', tb, deckY - 122, { sx: 1, sy: 1, fill: '#FEF3C7' });
  signText(c, gone ? 'WHENEVER' : 'ON TIME', tb, deckY - 110, { sx: 1, sy: 1, fill: gone ? '#F87171' : '#86EFAC' });
};

/** Behind him: the depot and tower, the train (Tucker in its cab), the deck, Tucker on the platform, his cap. */
export const drawStationBack = (c: Ctx, state: GameState) => {
  if (!onScreen(state, STATION.depot - 140, STATION.deck.b + 1600)) return;
  const s = stOf(state), f = state.frame;
  tickCap(s);
  drawDepot(c);
  if (s.step !== 'gone') drawTrain(c, s, f);
  drawDeck(c, state, s.step === 'gone');
  if (!s.inCab && s.step !== 'gone') drawTucker(c, s.tx, Y(STATION.deck.h), s.face, f, s.pose, { talking: s.talking, capless: s.capless });
  if (s.cap) drawTuckerCap(c, s.cap.x, s.cap.y, s.cap.rot);
  if (s.step === 'gone') frontierSign(c, STATION.deck.b - 150, Y(STATION.deck.h), ['TO SAWDUST GULCH', 'FOLLOW THE TRACKS >'], { seed: 7 });
};

/** Over the world: what Tucker's saying, over his head (or under the close-up while it's up). */
export const drawStationFront = (c: Ctx, state: GameState) => {
  const s = stOf(state);
  if (!s.said || s.step === 'rage') return;
  const x = s.inCab ? STATION.cab + s.trainX + 40 : s.tx;
  const y = s.inCab ? Y(STATION.deck.h) - 150 : Y(STATION.deck.h) - TUCKER_H - (s.pose === 'sit' ? -10 : 14);
  saidOver(c, s.said.text, x, y, '#FDE68A', 240);
};

/** Screen space: the close-up of his face (the rage), the fade to black, SKIP >>. */
export const drawStationHud = (c: Ctx, state: GameState) => {
  const s = stOf(state);
  if (s.step === 'rage' && s.close > 0) {
    const k = s.close, w = 360 * (0.6 + 0.4 * k), h = 220 * (0.6 + 0.4 * k), cx = CANVAS_WIDTH / 2, cy = 190;
    const x = cx - w / 2, y = cy - h / 2;
    c.save();
    c.globalAlpha = Math.min(1, k * 1.4);
    // (its frame: a wooden one, brass at the corners)
    box(c, x - 8, y - 8, w + 16, h + 16, INK); box(c, x - 6, y - 6, w + 12, h + 12, '#6B4423'); box(c, x - 6, y - 6, w + 12, 3, '#9A6A3A');
    for (const [qx, qy] of [[x - 6, y - 6], [x + w - 4, y - 6], [x - 6, y + h - 4], [x + w - 4, y + h - 4]]) box(c, qx, qy, 10, 10, BRASS);
    c.beginPath(); c.rect(x, y, w, h); c.clip();
    // (behind his head: rage red in bands)
    for (let i = 0; i < 6; i++) box(c, x, y + (i * h) / 6, w, h / 6 + 1, mix('#7F1D1D', '#F97316', i / 6));
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2 + state.frame * 0.01; c.strokeStyle = 'rgba(254, 240, 138, 0.25)'; c.lineWidth = 6; c.beginPath(); c.moveTo(cx, cy + 40); c.lineTo(cx + Math.cos(a) * 400, cy + 40 + Math.sin(a) * 400); c.stroke(); }
    drawTuckerCloseup(c, cx - 8, cy + 6, 5.2 * (0.7 + 0.3 * k), state.frame, { face: 'manic', talking: s.talking, red: true, jolt: s.talking ? 0.5 : 0.15 });
    c.restore();
    if (s.said) saidOver(c, s.said.text, cx, y + h + 34, '#FDE68A', 320);
  }
  if (s.fade > 0) { c.fillStyle = `rgba(0, 0, 0, ${s.fade})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  const cut = s.step === 'pitch' || s.step === 'punched' || s.step === 'rage' || s.step === 'run' || s.step === 'board' || s.step === 'leave' || s.step === 'chase';
  if (cut && s.all > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
};

/** The station's done or not, for the section's way on (the platform's right end goes on to the train once it is). */
export const stationGone = (state: GameState) => stOf(state).step === 'gone';
