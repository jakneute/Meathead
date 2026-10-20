// The amphitheater's cutscenes (no input, no HUD, SKIP >> for the lot):
//
//   THE BOSS DOOR (the user's: "since most boss doors involve kicking down a door, this 'boss door' is the security
//   guards nuts. you kick him there, he keels over, and you have free access to the stage"). Up to the guard at the
//   stage steps: he puts a hand up ("SHOW'S IN PROGRESS. NO GUESTS ON STAGE."); a beat; Meathead's boot, the other lands'
//   door kick (the kick pose), right in the nuts (a punch, a bell); THE CLOSE-UP: the guard's face as it lands (the eyes
//   pop, cross and water, the face goes gray, the mouth from a little O to every tooth); back out: he keels over, onto
//   his knees and over on his side, curled up round it, his line; Meathead's. The rope's unhooked; the way's open.
//
//   STUPID DAD'S INTRO. Up the steps onto the stage: the show stops dead (the tape winds down, the laugh track's cut,
//   the TV rolls) and the family doesn't (they keep going, glitching). Meathead walks to his mark; STUPID DAD, CLOSE UP,
//   squinting at him over his can, half in character (he thinks it's the Boy); Meathead's answer; one of the family's
//   tapes stuck and the laugh track in the wrong place; he heaves himself up off the couch (rocking twice first), his
//   line; crushes the can on his forehead, drops it, belches; shuffles forward to the front, the threat; Meathead's word.
//
//   THE PLACEHOLDER (the fight's the user's to design: "mechanics come later"). A PLEASE STAND BY card (the show's own
//   color bars: STUPID DAD, BOSS FIGHT COMING SOON) over the black; behind it the stage empties (him gone, the family
//   powered down); then VICTORY, the walk-away with the MALLET, the hub, the land cleared. His deaths (the standard one,
//   the weakness's) aren't built: they wait for the user.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import { NO_CONTROLS } from '../../../m1/game/platform/input';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { silenceAll, pickLine } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { KICK_POSE_FRAMES, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { signText } from '../../signLetters';
import { meatheadSays, byPants, saidOver, box } from '../section';
import { INK } from '../kit';
import type { Amphi, Speaker } from './state';
import { GUARD_DOWN, markIntroSeen } from './state';
import { X, x0, x1, PIT_Y, STAGE_Y, KICK_AT, MARK, DAD_SEAT, CP_STEPS, CP_DAD } from './layout';
import { stageSays, freezeShow, laughTrack } from './show';
import { drawGuardCloseup, type GuardPose } from './guard';
import { drawDadCloseup } from './dad';
import { GUARD_STOP, GUARD_DOWN_LINES, MH_KICKED, MH_SEES, MH_ON, DAD_NOTICE, DAD_UP, DAD_FIGHT, GLITCH_TAPE } from './lines';

type Ctx = CanvasRenderingContext2D;

/** The camera's row in the pit and on the stage (his feet this far down the screen). */
const ROW = 500;
const camFor = (x: number) => Math.max(x0, Math.min(x1 - CANVAS_WIDTH, x - CANVAS_WIDTH / 2));
const pmidX = (state: GameState) => state.player.pos.x + state.player.width / 2;
const pick = <T,>(pool: readonly T[]) => pickLine(pool);

/** Walk him to world x (a scripted walk: only left/right get through), or stop him there. */
const walkTo = (state: GameState, x: number): Controls => {
  const p = state.player, me = pmidX(state);
  if (Math.abs(me - x) > 3) return { ...NO_CONTROLS, [x > me ? 'right' : 'left']: true };
  p.vel.x = 0;
  return { ...NO_CONTROLS };
};
const holdCamera = (state: GameState, camX: number, floorY: number) => {
  state.cameraOverride = { x: camX, y: floorY - ROW };
};
const said = (s: Amphi, who: Speaker, text: string, then: () => void) => stageSays(s, who, text, then);

// ---------------------------------------------------------------------------------------------------------------
// THE BOSS DOOR: the guard's nuts

/** The kick's beats (frames into the boot): the boot comes up, it lands. */
const BOOT_UP = 4, BOOT_HIT = 12, BOOT_DONE = 34, CLOSE_T = 96, KEEL_T = 84;

export const startKick = (state: GameState, s: Amphi) => {
  s.kick = { step: 'walk', t: 0, skipT: 0, waiting: false, camX: state.camera.x };
  s.guard = 'kick'; s.guardT = 0;
  state.player.inCutscene = true;
};

/** The guard's pose through it. */
export const guardPoseOf = (s: Amphi): { pose: GuardPose; t: number } => {
  if (s.guard === 'down') return { pose: 'down', t: 1 };
  const k = s.kick;
  if (!k) return { pose: 'stand', t: 0 };
  if (k.step === 'walk') return { pose: 'stand', t: 0 };
  if (k.step === 'warn' || k.step === 'beat' || (k.step === 'boot' && k.t < BOOT_HIT)) return { pose: 'stop', t: 0 };
  if (k.step === 'boot' || k.step === 'close') return { pose: 'hit', t: 0 };
  if (k.step === 'keel') return { pose: 'keel', t: Math.min(1, k.t / KEEL_T) };
  return { pose: 'down', t: 1 };
};

const endKick = (state: GameState, s: Amphi) => {
  const p = state.player;
  s.kick = null; s.guard = 'down';
  if (s.wall) { state.blocks = state.blocks.filter(b => b !== s.wall); s.wall = null; }
  state.stageMemo[GUARD_DOWN] = '1';
  state.checkpoint = Math.max(state.checkpoint, CP_STEPS);
  p.inCutscene = false; p.kickPose = 0;
  state.cameraOverride = null;
};

export const updateKick = (ctx: FrameContext, s: Amphi): Controls => {
  const { state } = ctx, p = state.player, k = s.kick!;
  k.t++; k.skipT++;
  p.inCutscene = true;
  // (the boot's pose runs down on its own here: nothing else counts it down in Meathead 2)
  if ((p.kickPose ?? 0) > 0) p.kickPose!--;
  if (k.skipT > SKIP_AFTER) offerSkip();
  if (k.skipT > SKIP_AFTER && takeSkip()) {
    silenceAll(); state.playerVulgarityTimer = 0; s.said.clear();
    if (pmidX(state) < X(KICK_AT) - 40) { p.pos.x = X(KICK_AT) - p.width / 2; p.vel.x = 0; }
    endKick(state, s);
    return { ...NO_CONTROLS };
  }
  let out: Controls = { ...NO_CONTROLS };
  k.camX += (camFor(X(KICK_AT) + 30) - k.camX) * 0.12;
  holdCamera(state, k.camX, PIT_Y);
  switch (k.step) {
    case 'walk':
      out = walkTo(state, X(KICK_AT));
      if (Math.abs(pmidX(state) - X(KICK_AT)) <= 3 && p.isGrounded) {
        p.facing = 1; k.step = 'warn'; k.t = 0; k.waiting = true;
        said(s, 'guard', pick(byPants(state, GUARD_STOP)), () => { k.waiting = false; k.step = 'beat'; k.t = 0; });
      }
      break;
    case 'warn': p.facing = 1; break;
    case 'beat': if (k.t >= 22) { k.step = 'boot'; k.t = 0; } break;
    case 'boot':
      if (k.t === BOOT_UP) { p.kickPose = KICK_POSE_FRAMES; playSound('whoosh', 0.7, -4); }
      if (k.t === BOOT_HIT) {
        playSound('punch', 1, -6); playSound('ding', 0.9, 14); shakeScreen(state, 8, 4);
        for (let i = 0; i < 8; i++) state.particles.push({ pos: { x: X(KICK_AT) + 30, y: PIT_Y - 36 }, vel: { x: (Math.random() - 0.3) * 4, y: -1 - Math.random() * 3 }, life: 22, color: i % 2 ? '#FDE047' : '#FFFFFF', size: 2 + Math.random() * 2 });
      }
      if (k.t >= BOOT_DONE) { k.step = 'close'; k.t = 0; playSound('sadBolt', 0.8, 9); }
      break;
    case 'close':
      if (k.t === 40) playSound('sadBolt', 0.6, 3);
      if (k.t >= CLOSE_T) { k.step = 'keel'; k.t = 0; }
      break;
    case 'keel':
      if (k.t === 10) { k.waiting = true; said(s, 'guard', pick(byPants(state, GUARD_DOWN_LINES)), () => { k.waiting = false; }); }
      if (k.t === 44) { playSound('thud', 0.7, -4); shakeScreen(state, 3, 2); }
      if (k.t === KEEL_T) playSound('thud', 0.8, -8);
      if (k.t >= KEEL_T && !k.waiting) { k.step = 'line'; k.t = 0; k.waiting = true; meatheadSays(state, pick(byPants(state, MH_KICKED)), true, () => { if (s.kick !== k) return; k.waiting = false; endKick(state, s); }); }
      break;
    case 'line': break;
  }
  return out;
};

// ---------------------------------------------------------------------------------------------------------------
// STUPID DAD's intro, and the placeholder

/** The card: fade to black, up, fade back (frames). */
const CARD_IN = 24, CARD_HOLD = 170, CARD_OUT = 24;
export const CARD_T = CARD_IN + CARD_HOLD + CARD_OUT;

export const startIntro = (state: GameState, s: Amphi, retry: boolean) => {
  s.intro = { step: retry ? 'card' : 'walk', t: 0, skipT: 0, waiting: false, camX: state.camera.x, dadU: 0, crushed: false, closeup: false, closeT: 0, cardT: 0, emptied: false };
  markIntroSeen();
  freezeShow(state, s);
  state.checkpoint = Math.max(state.checkpoint, CP_DAD);
  state.player.inCutscene = true;
};

/** Each frame of it; true once the card's done (on to VICTORY). */
export const updateIntro = (ctx: FrameContext, s: Amphi): { out: Controls; done: boolean } => {
  const { state } = ctx, p = state.player, i = s.intro!;
  i.t++; i.skipT++;
  p.inCutscene = true;
  const toCard = () => { i.step = 'card'; i.t = 0; i.closeup = false; i.waiting = false; };
  if (i.step !== 'card') {
    if (i.skipT > SKIP_AFTER) offerSkip();
    if (i.skipT > SKIP_AFTER && takeSkip()) { silenceAll(); state.playerVulgarityTimer = 0; s.said.clear(); s.show.token++; toCard(); }
  }
  let out: Controls = { ...NO_CONTROLS };
  const me = pmidX(state);
  let want = camFor((X(MARK) + X(DAD_SEAT.x)) / 2 + 40);
  switch (i.step) {
    case 'walk':
      out = walkTo(state, X(MARK));
      want = camFor(Math.max(me + 200, (X(MARK) + X(DAD_SEAT.x)) / 2));
      if (Math.abs(me - X(MARK)) <= 3 && p.isGrounded && i.t > 30) { p.facing = 1; i.step = 'close'; i.t = 0; i.closeup = true; i.closeT = 0; playSound('ding', 0.5, -2); }
      break;
    case 'close':
      // (him, close up, squinting over his can; then he says it)
      i.closeT++;
      if (i.t === 30) { i.waiting = true; said(s, 'dad', pick(byPants(state, DAD_NOTICE)), () => { i.waiting = false; i.closeup = false; i.step = 'sees'; i.t = 0; i.waiting = true; meatheadSays(state, pick(byPants(state, MH_SEES)), true, () => { if (i.step !== 'sees') return; i.waiting = false; i.step = 'glitch'; i.t = 0; }); }); }
      break;
    case 'sees': break;
    case 'glitch':
      if (i.t === 1) {
        const who = (['mom', 'boy', 'gramps'] as const)[Math.floor(Math.random() * 3)];
        i.waiting = true;
        said(s, who, pick(GLITCH_TAPE[who]), () => { laughTrack(state, 0.6); i.waiting = false; });
      }
      if (i.t > 40 && !i.waiting) { i.step = 'rise'; i.t = 0; i.waiting = true; said(s, 'dad', pick(byPants(state, DAD_UP)), () => { i.waiting = false; }); }
      break;
    case 'rise':
      if (i.t === 30 || i.t === 52) playSound('thud', 0.3, -12);
      if (i.t >= 100 && !i.waiting) { i.step = 'crush'; i.t = 0; }
      break;
    case 'crush':
      if (i.t === 18) playSound('crunch', 0.8, 2);
      if (i.t === 32) { i.crushed = true; playSound('clink', 0.6, -2); }
      if (i.t === 42) playSound('burp', 0.8, -3);
      if (i.t >= 64) { i.step = 'fight'; i.t = 0; i.waiting = true; said(s, 'dad', pick(byPants(state, DAD_FIGHT)), () => { i.waiting = false; }); }
      break;
    case 'fight':
      i.dadU = Math.min(1, i.dadU + 1 / 70);
      if (i.dadU >= 1 && !i.waiting) { i.step = 'on'; i.t = 0; i.waiting = true; meatheadSays(state, pick(byPants(state, MH_ON)), true, () => { if (i.step !== 'on') return; i.waiting = false; toCard(); }); }
      break;
    case 'on': break;
    case 'card':
      i.cardT++;
      if (i.cardT === CARD_IN) { i.emptied = true; playSound('beep', 0.4, -10); }
      if (i.cardT >= CARD_T) return { out, done: true };
      break;
  }
  i.camX += (want - i.camX) * 0.08;
  holdCamera(state, i.camX, STAGE_Y);
  return { out, done: false };
};

// ---------------------------------------------------------------------------------------------------------------
// Drawn over the lot (screen space): the letterbox, the close-ups, the card, SKIP

const bars = (c: Ctx, k: number) => { const b = Math.round(k * 44); c.fillStyle = '#000'; c.fillRect(0, 0, CANVAS_WIDTH, b); c.fillRect(0, CANVAS_HEIGHT - b, CANVAS_WIDTH, b); };

export const drawKickHud = (c: Ctx, state: GameState, s: Amphi) => {
  const k = s.kick;
  if (!k) return;
  if (k.step === 'close') {
    // (the close-up: a cartoon impact burst behind his face, DING)
    const t = Math.min(1, k.t / CLOSE_T), f = state.frame;
    c.fillStyle = '#7A1E5A'; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2 + (f % 8 < 4 ? 0.04 : 0);
      c.fillStyle = i % 2 ? '#F59E0B' : '#FDE047'; c.beginPath(); c.moveTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
      c.lineTo(CANVAS_WIDTH / 2 + Math.cos(a) * 900, CANVAS_HEIGHT / 2 + 20 + Math.sin(a) * 900); c.lineTo(CANVAS_WIDTH / 2 + Math.cos(a + 0.17) * 900, CANVAS_HEIGHT / 2 + 20 + Math.sin(a + 0.17) * 900); c.closePath(); c.fill();
    }
    drawGuardCloseup(c, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30, 3.4 + Math.min(1, k.t / 10) * 0.4, f, t);
    if (k.t < 30) signText(c, 'DING!', CANVAS_WIDTH / 2 + 220, 150, { sx: 4, sy: 4, bold: true, slant: 1, fill: ['#FFFFFF', '#FDE047'], ink: INK, shadow: '#7A1E5A', drop: 3 });
  }
  bars(c, Math.min(1, k.skipT / 20));
  if (k.skipT > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
};

/** The PLEASE STAND BY card: the show's color bars, STUPID DAD, BOSS FIGHT COMING SOON. */
const card = (c: Ctx, f: number) => {
  const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
  const cols = ['#C0C0C0', '#C0C000', '#00C0C0', '#00C000', '#C000C0', '#C00000', '#0000C0'];
  cols.forEach((col, i) => box(c, (i * W) / 7, 0, W / 7 + 1, H * 0.62, col));
  ['#0000C0', '#131313', '#C000C0', '#131313', '#00C0C0', '#131313', '#C0C0C0'].forEach((col, i) => box(c, (i * W) / 7, H * 0.62, W / 7 + 1, H * 0.08, col));
  box(c, 0, H * 0.7, W, H * 0.3, '#131313');
  for (let i = 0; i < 3; i++) box(c, W * 0.18 + i * W * 0.1, H * 0.7, W * 0.08, H * 0.3, ['#00214C', '#FFFFFF', '#32006A'][i]);
  // (the board in the middle)
  box(c, W / 2 - 250, 150, 500, 230, INK); box(c, W / 2 - 246, 154, 492, 222, '#1E3A8A');
  signText(c, 'STUPID DAD', W / 2, 220, { sx: 5, sy: 5, bold: true, slant: 1, fill: ['#FFFFFF', '#FDE047', '#F59E0B'], ink: INK, shadow: '#3B0764', drop: 3 });
  signText(c, 'BOSS FIGHT', W / 2, 284, { sx: 3, sy: 3, bold: true, fill: ['#FFFFFF', '#FECDD3'], ink: INK, shadow: '#7F1D1D', drop: 2 });
  signText(c, 'COMING SOON', W / 2, 330, { sx: 3, sy: 3, bold: true, fill: '#FB7185', ink: INK, bulbs: { lit: (f >> 4) % 2 === 0, col: '#FEF3C7', dim: '#7A2A10' } });
  signText(c, 'PLEASE STAND BY', W / 2, 362, { sx: 1, sy: 2, bold: true, fill: '#FFFFFF' });
  // (the network's bug in the corner)
  signText(c, 'UBX', W - 60, H - 30, { sx: 2, sy: 2, bold: true, fill: '#FDE047', ink: INK });
};

export const drawIntroHud = (c: Ctx, state: GameState, s: Amphi) => {
  const i = s.intro;
  if (!i) return;
  const f = state.frame;
  if (i.closeup) {
    // (his close-up: the set's wallpaper behind him in bands, banded down to the paneling)
    const bands = ['#D9B45A', '#CBA44C', '#B8923C', '#7A4A2A', '#5E361C'];
    bands.forEach((col, k) => { c.fillStyle = col; c.fillRect(0, (k * CANVAS_HEIGHT) / bands.length, CANVAS_WIDTH, CANVAS_HEIGHT / bands.length + 1); });
    c.fillStyle = 'rgba(122,74,42,0.35)'; for (let x = 20; x < CANVAS_WIDTH; x += 56) for (let y = 30; y < CANVAS_HEIGHT * 0.6; y += 56) { c.beginPath(); c.moveTo(x, y - 12); c.lineTo(x + 10, y); c.lineTo(x, y + 12); c.lineTo(x - 10, y); c.closePath(); c.fill(); }
    const k = Math.min(1, i.closeT / 14), talking = s.said.has('dad');
    drawDadCloseup(c, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40, 3.6 + k * 0.4, f, { face: talking ? 'bleary' : 'squint', talking });
    const sd = s.said.get('dad');
    if (sd) saidOver(c, sd.text, CANVAS_WIDTH / 2, 92, '#FDE047', 520);
  }
  if (i.step === 'card') {
    const a = i.cardT < CARD_IN ? i.cardT / CARD_IN : i.cardT > CARD_T - CARD_OUT ? (CARD_T - i.cardT) / CARD_OUT : 1;
    c.globalAlpha = Math.max(0, Math.min(1, a)); c.fillStyle = '#000'; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    if (i.cardT >= CARD_IN && i.cardT <= CARD_T - CARD_OUT) card(c, f);
    c.globalAlpha = 1;
  }
  bars(c, 1);
  if (i.step !== 'card' && i.skipT > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
};
