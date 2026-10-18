// THE ENGINE: the end of the train. A big flashing arrow that says KILL (Meathead 1's joke: Riggs in his cab) over the
// back of the cab, where Tucker leans out over the tender. The cab's walled off; the way to do it is from out here.
//
// The playtest's: coming up onto the tender, a CUTSCENE first (no controls, no HUD, SKIP >> for all of it): Tucker pops
// up out of the cab's back and lays into him (manic, petty, the ledger: the user's Mel Gibson), Meathead's say, Tucker's
// kicker, the KILL arrow drops in. He isn't something to shoot till that's done (he's not even at his window). Then it's
// played: up on the tender (the fireman shoveling coal at him), Tucker reads him the ledger, line after line, and the
// arrow's up all the while. He EVADES anything but the ray gun (a special weapon fired at him, or anything of it flying
// at his window: he ducks below the sill, a crack about it: it's not legal tender); the plain ray gun's bolt through his
// window is the shot. Left too long, Tucker cuts the tender loose (the same as any car).
//
// Shot, the user's: an ANIMATED, GRAPHIC close-up of the bullet going through his eye (the mutilation close-up rule:
// tucker.ts's close-up with this job's wound painter: the slug coming in, the lens starring, the eye bursting, the gout
// out the back of his head, the hole clean through (sky through it), the blood running), his last words; he slumps over
// the sill, apparently dead, on the whistle cord (the whistle stuck on: Riggs's horn); nobody's driving; the train runs
// on, faster, into the buffer stop at Sawdust Gulch: the crash; black; the town (the town's section). From then on he's
// got the eye wound for the rest of the land (TUCKER_EYE_MEMO, drawn on his figure by tucker.ts). A cutscene from the
// shot on: no HUD, SKIP >> for the lot.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { playSound, playHornDrone } from '../../../m1/game/platform/audio';
import { pickLine, silenceAll, takeFreshLine } from '../../../m1/game/platform/speech';
import { shakeScreen } from '../../../m1/game/core/state';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { hands, meatheadSays, speak, saidOver, teleport, byPants, landVisit, type Said } from '../section';
import { DOORS, GY } from '../geometry';
import { TUCKER_VOICE, type ByPants } from '../talk';
import { box, mix, INK, painted, burned, type Ctx } from '../kit';
import { signText } from '../../signLetters';
import { drawTucker, drawTuckerCloseup, registerWoundPainter } from '../tucker';
import { trainOf } from './state';
import { CARS, CAR_X, RAIL, TENDER, ENGINE, CAB, ENGINE_SCALE } from './layout';
import { cutTender, cancelCut } from './cars';
import { screenX, screenY, inView } from './view';
import { TUBE_RANT, TUBE_TIMEUP, TUCKER_SHOT, KILL_SEEN, SHOT_LINE, DRIVER_LINE, TUCKER_INSULT, MH_COMEBACK, TUCKER_DARE, TUCKER_DODGE, MH_RAYGUN } from './lines';

/** The train's crashed into Sawdust Gulch (for good: a revisit finds it stood still). */
export const CRASH_MEMO = 'frontier-train-crashed';
export const crashed = (state: GameState) => state.stageMemo[CRASH_MEMO] === '1';
/** Tucker's been shot through the eye: the wound's on him for the rest of the land (tucker.ts draws it). */
export const TUCKER_EYE_MEMO = 'frontier-tucker-eye';

type Step = 'wait' | 'insult' | 'rant' | 'close' | 'slump' | 'speed' | 'crash' | 'done';
interface Scene {
  step: Step; t: number; all: number;
  /** The insult: which beat it's at (his line, Meathead's, his kicker), and is one being said. */
  beat: number;
  /** The rant: which line's next, and is one being said. */
  rantI: number; busy: boolean; timeT: number; timeSaid: boolean;
  said: Said | null; talking: boolean;
  /** Up at his window (0 down in the cab, 1 leaning out); ducked below the sill (frames left); dodged yet; the shoot
   *  button last frame. */
  up: number; duck: number; dodged: boolean; shootWas: boolean;
  /** Where the buffer stop is (world x of its face), the crash's flash, the fade to black. */
  bumper: number; flash: number; fade: number;
  lineDone: boolean;
}
const SCENES = new WeakMap<object, Scene>();
const scOf = (state: GameState): Scene => {
  const k = state.stage as object;
  let s = SCENES.get(k);
  if (!s) { s = { step: 'wait', t: 0, all: 0, beat: 0, rantI: 0, busy: false, timeT: 0, timeSaid: false, said: null, talking: false, up: 0, duck: 0, dodged: false, shootWas: false, bumper: 0, flash: 0, fade: 0, lineDone: false }; SCENES.set(k, s); }
  return s;
};
const cut = (s: Scene) => s.step === 'close' || s.step === 'slump' || s.step === 'speed' || s.step === 'crash';

const tuckerSay = (s: Scene, text: string | null, done?: () => void) => {
  if (!text) { setTimeout(() => done?.(), 0); return; }
  s.talking = true;
  speak(TUCKER_VOICE, text, said => { s.said = said; if (!said) s.talking = false; }, true, () => { s.talking = false; done?.(); });
};
const pick = (state: GameState, pool: ByPants) => pickLine(byPants(state, pool));

const ES = ENGINE_SCALE;
const ENGINE_X = CAR_X[ENGINE], ENGINE_FRONT = ENGINE_X + CARS[ENGINE].len;
/** Where a shot at him counts: from a bit back over the tender up to his window (before the cab wall eats it). */
const ZONE = { x0: ENGINE_X - 110, x1: ENGINE_X + 6, y0: CAB.sill - 130, y1: CAB.sill + 8 };
/** The camera on the cab for the insult (the zoomed view: the tender and the cab's back in the middle). */
const INSULT_CAM = ENGINE_X - 470;

// ---------------------------------------------------------------------------------------------------------------
// Each frame

export const updateEngine = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, p = state.player, s = scOf(state), tr = trainOf(state);
  const cx = p.pos.x + p.width / 2;
  s.t++;
  s.duck = Math.max(0, s.duck - 1);
  if (tr.phase === 'still' || s.step === 'done') return controls;
  if (cut(s)) {
    s.all++;
    p.inCutscene = true;
    for (const e of state.enemies) if (e.health > 0) { e.puppet = true; e.vel.x = 0; }
    if (s.all > SKIP_AFTER) { offerSkip(); if (takeSkip()) { finish(state, s, true); return hands(); } }
  }
  switch (s.step) {
    case 'wait':
      // (up onto the tender's back: the insult)
      if (tr.phase === 'ride' && cx > CAR_X[TENDER] - 30 && p.health > 0 && !p.inCutscene) {
        // (seen it this visit (a retry): he's just up at his window, the arrow over him)
        if (insultedOn === landVisit()) { endInsult(state, s); return controls; }
        s.step = 'insult'; s.t = 0; s.all = 0; s.beat = 0; s.busy = false;
        silenceAll();
        p.inCutscene = true; p.vel.x = 0;
        state.cameraOverride = { x: INSULT_CAM, y: state.camera.y };
        state.projectiles = state.projectiles.filter(pj => pj.owner !== 'player');
        playSound('clang', 0.8, 4);
      }
      return controls;
    case 'insult': return insult(ctx, s);
    case 'rant': {
      s.up = 1;
      // (the ledger, line after line; him once, after the first, about the arrow)
      if (!s.busy && p.health > 0 && !s.timeSaid) {
        const list = byPants(state, TUBE_RANT);
        if (s.rantI === 1 && !tr.said.kill) { tr.said.kill = true; s.busy = true; meatheadSays(state, pick(state, KILL_SEEN), true, () => { s.busy = false; }); }
        else if (s.rantI < list.length) { const i = s.rantI++; s.busy = true; tuckerSay(s, takeFreshLine([list[i]]), () => { s.busy = false; }); }
      }
      // (left too long: the tender goes)
      if (++s.timeT > 2100 && !s.timeSaid) { s.timeSaid = true; silenceAll(); tuckerSay(s, pick(state, TUBE_TIMEUP)); cutTender(state, 110); }
      // (a special weapon fired anywhere near: he's already ducking. Anything of his flying into the window: the ray
      // gun's bolt is the shot (unless he's down); anything else, he ducks it)
      const near = cx > CAR_X[TENDER] - 700 && p.health > 0 && !p.inCutscene;
      if (near && controls.shoot && !s.shootWas && p.currentWeapon !== 'GUN') dodge(state, s);
      s.shootWas = !!controls.shoot;
      let hit = false;
      for (const pj of state.projectiles) {
        if (pj.owner !== 'player' || pj.health <= 0 || pj.pos.x + pj.width < ZONE.x0 - 40 || pj.pos.x > ZONE.x1 || pj.pos.y + pj.height < ZONE.y0 || pj.pos.y > ZONE.y1) continue;
        if (pj.isRay && s.duck <= 0 && pj.pos.x + pj.width > ZONE.x0) { pj.health = 0; hit = true; }
        else if (!pj.isRay) dodge(state, s);
      }
      if (hit) shoot(ctx, s);
      return controls;
    }
    case 'close':
      // (the close-up: the slug through his eye; his last words; then back out)
      if (s.t === 32) { playSound('glass', 1, 4); playSound('splat', 1, -2); playSound('gorespray', 0.9, 0); shakeScreen(state, 10, 5); }
      if (s.t === 70) { s.lineDone = false; tuckerSay(s, pick(state, TUCKER_SHOT), () => { s.lineDone = true; }); }
      if (s.t > 190 && s.lineDone) {
        s.step = 'slump'; s.t = 0; s.lineDone = false;
        state.stageMemo[TUCKER_EYE_MEMO] = '1';
        playHornDrone(9);
        meatheadSays(state, pick(state, SHOT_LINE), true, () => meatheadSays(state, pick(state, DRIVER_LINE), true, () => { s.lineDone = true; }));
      }
      return hands();
    case 'slump':
      // (slumped on the whistle cord: the whistle stuck on; nobody driving: faster)
      tr.vTarget = 15;
      if (s.t % 40 === 0) shakeScreen(state, 3, 2);
      if (s.lineDone && s.t > 90) { s.step = 'speed'; s.t = 0; s.bumper = ENGINE_FRONT + 1300; tr.passers.push({ kind: 'bumper', x: s.bumper, len: 200, t: 0 }); }
      return hands();
    case 'speed': {
      // (the end of the line coming: Sawdust Gulch's buffer stop)
      const b = tr.passers.find(q => q.kind === 'bumper');
      s.bumper = b ? b.x : ENGINE_FRONT;
      if (s.t % 30 === 0) shakeScreen(state, 4, 3);
      if (s.bumper <= ENGINE_FRONT + 4) {
        s.step = 'crash'; s.t = 0; s.flash = 1; tr.v = 0; tr.vTarget = 0;
        playSound('crash', 1, -10); playSound('boom', 1, -16); playSound('crunch', 1, -8); shakeScreen(state, 24, 9);
        for (let n = 0; n < 60; n++) state.particles.push({ pos: { x: ENGINE_FRONT - Math.random() * 90, y: GY - 60 - Math.random() * 200 }, vel: { x: (Math.random() - 0.3) * 14, y: -4 - Math.random() * 10 }, life: 60 + Math.random() * 40, color: n % 4 === 0 ? '#E4E4E7' : n % 4 === 1 ? '#8A5A30' : n % 4 === 2 ? '#3F3F46' : '#B91C1C', size: 3 + Math.random() * 5 });
      }
      return hands();
    }
    case 'crash':
      s.flash = Math.max(0, s.flash - 0.04);
      s.fade = Math.max(0, Math.min(1, (s.t - 60) / 40));
      if (s.t > 104) finish(state, s, false);
      return hands();
  }
  return controls;
};

/** The insult (a cutscene): he pops up at his window and lays into him; Meathead's say; his kicker; the arrow. */
const insult = (ctx: FrameContext, s: Scene): Controls => {
  const { state } = ctx, p = state.player;
  s.all++;
  p.inCutscene = true;
  for (const e of state.enemies) if (e.health > 0) { e.puppet = true; e.vel.x = 0; }
  if (s.all > SKIP_AFTER) { offerSkip(); if (takeSkip()) { silenceAll(); endInsult(state, s); return hands(); } }
  s.up = Math.min(1, s.up + 0.05);
  if (s.t === 8) playSound('whoosh', 0.7, 2);
  if (!s.busy && s.t > 30) {
    s.busy = true;
    if (s.beat === 0) tuckerSay(s, pick(state, TUCKER_INSULT), () => { s.beat = 1; s.busy = false; });
    else if (s.beat === 1) meatheadSays(state, pick(state, MH_COMEBACK), true, () => { s.beat = 2; s.busy = false; });
    else if (s.beat === 2) tuckerSay(s, pick(state, TUCKER_DARE), () => { s.beat = 3; s.busy = false; s.t = 0; });
    else if (s.t > 24) { s.busy = false; endInsult(state, s); return hands(); }
    else s.busy = false;
  }
  return hands();
};
/** The visit the insult was seen in (a retry that visit doesn't sit through it again). */
let insultedOn = -1;
const endInsult = (state: GameState, s: Scene) => {
  const p = state.player;
  insultedOn = landVisit();
  s.step = 'rant'; s.t = 0; s.rantI = 0; s.busy = false; s.up = 1; s.said = null; s.talking = false; s.timeT = 0;
  p.inCutscene = false;
  state.cameraOverride = null;
  for (const e of state.enemies) e.puppet = false;
  playSound('clang', 0.6, -2);
};

/** Down below the sill: whatever it was goes over him; a crack about it (not over anybody else's words). */
const dodge = (state: GameState, s: Scene) => {
  if (s.duck > 6) return;
  s.duck = 46;
  playSound('whoosh', 0.6, 6);
  if (s.busy || s.talking) return;
  s.busy = true;
  tuckerSay(s, pick(state, TUCKER_DODGE), () => {
    if (!s.dodged) { s.dodged = true; meatheadSays(state, pick(state, MH_RAYGUN), true, () => { s.busy = false; }); }
    else s.busy = false;
  });
};

const shoot = (ctx: FrameContext, s: Scene) => {
  const { state } = ctx;
  silenceAll();
  cancelCut(state);
  s.said = null; s.talking = false;
  s.step = 'close'; s.t = 0; s.all = 0;
  state.player.inCutscene = true;
  state.cameraOverride = { x: ENGINE_X - 300, y: state.camera.y };
  ctx.fx.spawnDamageNumber({ x: ENGINE_X - 60, y: CAB.sill - 60 }, 'HEADSHOT!', true, '#F87171');
  playSound('gun', 1, -4);
  shakeScreen(state, 8, 4);
};

/** The scene's over (run through, or skipped): the memos, and on to Sawdust Gulch. */
const finish = (state: GameState, s: Scene, skipped: boolean) => {
  if (skipped) silenceAll();
  state.stageMemo[CRASH_MEMO] = '1';
  state.stageMemo[TUCKER_EYE_MEMO] = '1';
  s.step = 'done'; s.said = null; s.fade = 0; s.flash = 0;
  const p = state.player;
  p.inCutscene = false;
  state.cameraOverride = null;
  for (const e of state.enemies) e.puppet = false;
  teleport(state, DOORS.town.start.x, DOORS.town.start.y);
  onCrashed?.(state);
};
/** (index.ts's: what the train does once it's crashed: stood still, whole again, nobody on it) */
let onCrashed: ((state: GameState) => void) | null = null;
export const whenCrashed = (f: (state: GameState) => void) => { onCrashed = f; };

// ---------------------------------------------------------------------------------------------------------------
// The close-up's wound: the slug through his near eye (the mutilation close-up rule), in the head's units (its middle
// at the origin, facing right, about 24 across). k 0..1: the slug coming in (to 0.22), then the hit and after.

const EX = 6.4, EY = -2.6;
const SKY = '#BFE0F8';
const rnd = (n: number) => { const v = Math.sin(n * 91.7 + 13.3) * 43758.5453; return v - Math.floor(v); };

registerWoundPainter('eye', (c, k) => {
  const line = (pts: number[], w: number, col: string) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.stroke(); };
  const ell = (x: number, y: number, rx: number, ry: number, col: string) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(0.05, rx), Math.max(0.05, ry), 0, 0, Math.PI * 2); c.fill(); };
  if (k < 0.22) {
    // (the slug coming in from in front of him: lead nose, a brass base, the air rippling round it, its streak)
    const q = k / 0.22, bx = 46 - (46 - (EX + 2)) * q * q;
    for (let i = 0; i < 4; i++) { c.globalAlpha = 0.35 - i * 0.07; line([bx + 2 + i * 4, EY - 0.3, bx + 10 + i * 6, EY - 0.3], 1.2 - i * 0.2, '#F8FAFC'); }
    c.globalAlpha = 1;
    c.strokeStyle = 'rgba(248, 250, 252, 0.5)'; c.lineWidth = 0.3;
    for (let r = 1; r < 3; r++) { c.beginPath(); c.ellipse(bx + r * 2.4, EY, r * 0.8, r * 1.6, 0, 0, Math.PI * 2); c.stroke(); }
    ell(bx + 1.4, EY, 1.6, 1.1, '#B88A2A'); ell(bx, EY, 1.5, 1.05, '#71717A'); ell(bx - 0.4, EY - 0.3, 0.6, 0.4, '#D4D4D8');
    return;
  }
  const ki = (k - 0.22) / 0.78;
  // ---- the hole: the socket ripped open, a ring of meat, and clean through it the sky beyond his head
  const open = Math.min(1, ki * 6);
  ell(EX, EY, 3.1 * open, 2.8 * open, '#5A0E0E');
  ell(EX, EY, 2.5 * open, 2.2 * open, '#8A1414');
  ell(EX + 0.2, EY + 0.1, 1.6 * open, 1.4 * open, '#2A0505');
  ell(EX + 0.3, EY + 0.1, 1.05 * open, 0.95 * open, SKY);
  ell(EX + 0.1, EY - 0.2, 0.4 * open, 0.3 * open, '#FFFFFF');
  // (the spectacles' lens, starred: cracks out from the hole)
  c.globalAlpha = 0.85;
  for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2 + 0.3; line([EX + Math.cos(a) * 1.6, EY + Math.sin(a) * 1.5, EX + Math.cos(a) * 3.2, EY + Math.sin(a) * 2.9], 0.25, '#E8F0F8'); }
  c.globalAlpha = 1;
  // ---- out the front: the eye's jelly, blood, glass, blown out toward the gun
  if (ki < 0.6) {
    const t = ki / 0.6;
    for (let i = 0; i < 16; i++) {
      const a = -0.9 + rnd(i) * 1.8, sp = 10 + rnd(i + 30) * 22, x = EX + Math.cos(a) * sp * t, y = EY + Math.sin(a) * sp * t + 14 * t * t;
      c.globalAlpha = 1 - t * 0.7;
      if (i % 4 === 0) ell(x, y, 0.9, 0.7, i % 8 ? '#F1F5F9' : '#4A7AB0');
      else if (i % 4 === 1) { c.fillStyle = '#E8F0F8'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 0.8, y - 0.5); c.lineTo(x + 0.4, y + 0.7); c.closePath(); c.fill(); }
      else ell(x, y, 0.6 + rnd(i) * 0.6, 0.5 + rnd(i) * 0.5, '#B91C1C');
    }
    c.globalAlpha = 1;
  }
  // ---- out the back of his head: the gout (blood, brains, bits of skull), a mist after it
  if (ki < 0.75) {
    const t = ki / 0.75;
    c.globalAlpha = Math.max(0, 0.7 - t);
    ell(-12 - t * 18, -3 + t * 2, 3 + t * 10, 2 + t * 6, '#7F1D1D');
    c.globalAlpha = 1;
    for (let i = 0; i < 22; i++) {
      const a = Math.PI + (rnd(i + 70) - 0.5) * 1.6, sp = 8 + rnd(i + 90) * 28, x = -10.5 + Math.cos(a) * sp * t, y = -3 + Math.sin(a) * sp * t + 18 * t * t;
      c.globalAlpha = 1 - t * 0.6;
      if (i % 5 === 0) ell(x, y, 1.3, 0.9, '#F2A8B0');
      else if (i % 5 === 1) ell(x, y, 0.8, 0.6, '#F5F0E6');
      else ell(x, y, 0.5 + rnd(i) * 0.9, 0.4 + rnd(i) * 0.7, i % 2 ? '#991B1B' : '#B91C1C');
    }
    c.globalAlpha = 1;
  }
  // (the exit wound at the back of his head)
  ell(-10.4, -3.2, 1.6 * open, 2.1 * open, '#5A0E0E'); ell(-10.6, -3.2, 0.9 * open, 1.3 * open, '#2A0505');
  // ---- the blood: running out of the hole, down his cheek, over the muttonchop, dripping off his jaw
  const run = Math.min(1, ki * 1.6);
  line([EX - 0.6, EY + 2, EX - 0.8, EY + 2 + 6 * run, EX - 0.2, EY + 2 + 13 * run], 1.6, '#8A1414');
  line([EX - 0.3, EY + 2, EX - 0.5, EY + 2 + 6 * run, EX + 0.1, EY + 2 + 13 * run], 0.5, '#D43A3A');
  line([EX + 1.4, EY + 2.2, EX + 2, EY + 2.2 + 7 * run], 1, '#8A1414');
  if (run >= 1) for (let i = 0; i < 3; i++) { const d = ((ki * 3 + i / 3) % 1); ell(EX + 0.1, EY + 15 + d * 10, 0.6, 0.9, '#991B1B'); }
  // (a wisp of smoke curling out of the hole, late)
  if (ki > 0.55) { c.globalAlpha = Math.min(0.6, (ki - 0.55) * 2); for (let i = 0; i < 3; i++) ell(EX + 2 + i * 1.6, EY - 3 - i * 2.4 - (ki - 0.55) * 8, 0.8 + i * 0.5, 0.7 + i * 0.4, '#D6D3D1'); c.globalAlpha = 1; }
});

// ---------------------------------------------------------------------------------------------------------------
// Drawing: the engine (the first pass's, blown up to the big cars' size), Tucker in the back of the cab (his own size),
// the KILL arrow, the buffer stop and the crash

const RED = '#A3262A', RED_L = '#D4483E', BLACK = '#26262C', BRASS = '#E0B040', WOOD = '#8A5A30';

const wheel = (c: Ctx, x: number, y: number, r: number, a: number) => {
  c.fillStyle = INK; c.beginPath(); c.arc(x, y, r + 1.5, 0, Math.PI * 2); c.fill();
  c.fillStyle = RED; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#5A1A1A'; c.beginPath(); c.arc(x, y, r - 3, 0, Math.PI * 2); c.fill();
  c.strokeStyle = RED_L; c.lineWidth = 2;
  for (let k = 0; k < 8; k++) { const t = a + (k * Math.PI) / 4; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(t) * (r - 3), y + Math.sin(t) * (r - 3)); c.stroke(); }
  c.fillStyle = BRASS; c.beginPath(); c.arc(x, y, 3, 0, Math.PI * 2); c.fill();
};

/** Behind the cast: the engine (the boiler, the stack smoking, the cab with Tucker leaning out of the back of it). */
export const drawEngineBack = (c: Ctx, state: GameState) => {
  const s = scOf(state), tr = trainOf(state), f = state.frame, x = ENGINE_X, y = GY, roll = tr.dist / 40;
  if (!inView(state, x - 200, x + CARS[ENGINE].len + 100, 100)) return;
  const crushed = s.step === 'crash' || s.step === 'done' ? Math.min(40, s.t * 4) : 0;
  const stuck = s.step === 'slump' || s.step === 'speed';
  // ---- the machine, in the first pass's units, blown up about the rail under its back end
  c.save(); c.translate(x, y); c.scale(ES, ES); c.translate(-x, -y);
  // (the smoke out of the stack, streaming back over the train)
  const going = tr.v > 1;
  for (let k = 0; k < (going ? 9 : 3); k++) {
    const t = (f * (going ? 0.045 : 0.015) + k / (going ? 9 : 3)) % 1;
    const sx = x + 271 - t * (going ? 420 : 20), sy = y - 150 - t * (going ? 40 : 90);
    c.globalAlpha = 0.65 * (1 - t); c.fillStyle = mix('#3F3F46', '#E4E4E7', t); c.beginPath(); c.arc(sx, sy, 12 + t * 26, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
  }
  // (the cab: red, its roof, a side window)
  box(c, x - 8, y - 196, 106, 10, BLACK);
  box(c, x - 4, y - 188, 100, 154, INK); box(c, x - 2, y - 186, 96, 150, RED); box(c, x - 2, y - 186, 96, 5, RED_L);
  box(c, x + 34, y - 160, 40, 36, '#1A1210'); box(c, x + 34, y - 160, 40, 3, '#3A2A20');
  // (the boiler, its bands, the domes, the bell, the balloon stack, the headlamp, the cowcatcher)
  const b0 = x + 96 - crushed * 0.3, bw = 200 - crushed;
  box(c, b0, y - 132, bw, 70, INK); box(c, b0 + 2, y - 130, bw - 4, 66, BLACK); box(c, b0 + 2, y - 130, bw - 4, 10, '#4A4A54');
  for (let k = 1; k < 4; k++) box(c, b0 + k * bw / 4, y - 132, 5, 70, BRASS);
  box(c, b0 + 40, y - 152, 26, 22, INK); box(c, b0 + 42, y - 150, 22, 20, BRASS);
  box(c, b0 + 100, y - 146, 14, 14, BRASS); box(c, b0 + 105, y - 152, 4, 6, BLACK);
  c.fillStyle = INK; c.beginPath(); c.moveTo(b0 + 160, y - 130); c.lineTo(b0 + 150, y - 190); c.lineTo(b0 + 196, y - 190); c.lineTo(b0 + 186, y - 130); c.closePath(); c.fill();
  c.fillStyle = BLACK; c.beginPath(); c.moveTo(b0 + 162, y - 130); c.lineTo(b0 + 153, y - 187); c.lineTo(b0 + 193, y - 187); c.lineTo(b0 + 184, y - 130); c.closePath(); c.fill();
  box(c, b0 + 150, y - 193, 46, 6, BRASS);
  const front = b0 + bw;
  box(c, front - 24, y - 162, 28, 26, INK); box(c, front - 22, y - 160, 24, 22, WOOD); box(c, front - 12, y - 155, 12, 12, '#E8D890');
  box(c, front - 4, y - 64, 30, 30, INK); box(c, front - 2, y - 62, 26, 26, RED);
  c.fillStyle = INK; c.beginPath(); c.moveTo(front + 22, y - 40); c.lineTo(front + 62 - crushed * 0.6, y - 2); c.lineTo(front + 22, y - 2); c.closePath(); c.fill();
  c.strokeStyle = RED_L; c.lineWidth = 3; for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(front + 24 + k * 7, y - 4); c.lineTo(front + 24, y - 36 + k * 7); c.stroke(); }
  // (the frame, the drivers and their rods, the pilot wheels: all on the rail)
  box(c, x - 4, y - 34, 330 - crushed, 12, INK);
  const dr = 24, dy = y - (y - RAIL + dr * ES) / ES, pr = 12, py = y - (y - RAIL + pr * ES) / ES;
  for (const wx of [x + 40, x + 110, x + 180]) wheel(c, wx, dy, dr, roll);
  wheel(c, x + 250 - crushed * 0.5, py, pr, roll); wheel(c, x + 290 - crushed * 0.6, py, pr, roll);
  const rx = Math.cos(roll) * 13, ry = Math.sin(roll) * 13;
  c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.moveTo(x + 40 + rx, dy + ry); c.lineTo(x + 180 + rx, dy + ry); c.stroke();
  c.strokeStyle = '#C8C8D0'; c.lineWidth = 3; c.stroke();
  c.strokeStyle = '#A1A1AA'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 180 + rx, dy + ry); c.lineTo(x + 250, y - 46); c.stroke();
  // (the steam off the whistle, stuck on)
  if (stuck) for (let k = 0; k < 4; k++) { c.globalAlpha = 0.6; c.fillStyle = '#F8FAFC'; c.beginPath(); c.arc(x + 20 - k * 6, y - 200 - k * 12 - (f % 12), 6 + k * 3, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
  c.restore();
  // ---- the cab's back (his own size from here: the opening he leans out of, the sill)
  const back = GY - 300;
  box(c, x - 3, back, 40, CAB.sill - back, '#1A1210'); box(c, x - 3, back, 40, 4, '#3A2A20');
  // ---- Tucker, leaning out of the back of the cab (clipped at the sill): manic, shaking his fist; ducked under it;
  // slumped over it once shot. Not at his window till the insult.
  if (tr.phase !== 'still' && s.step !== 'done' && s.step !== 'wait') {
    const shot = s.step !== 'insult' && s.step !== 'rant';
    c.save(); c.beginPath(); c.rect(x - 140, GY - 420, 220, CAB.sill - (GY - 420));
    // (slumped, he hangs out over the sill: below it too, outside the cab)
    if (shot) c.rect(x - 170, CAB.sill - 4, 168, 130);
    c.clip();
    if (!shot) {
      const down = (1 - s.up) * 90 + (s.duck > 0 ? Math.min(1, s.duck / 8, (46 - s.duck + 8) / 8) * 80 : 0);
      drawTucker(c, x - 12, CAB.feet + down, -1, f, 'cab', { talking: s.talking, face: s.duck > 0 ? 'shock' : 'manic' });
    } else {
      // (slumped over the sill head down, his arms hanging, the eye shot through)
      c.translate(x - 4, CAB.sill + 2); c.rotate(-1.9);
      drawTucker(c, 0, 50, -1, f, 'cab', { face: 'out', wounds: { eye: true } });
    }
    c.restore();
  }
  box(c, x - 40, CAB.sill - 3, 64, 8, INK); box(c, x - 39, CAB.sill - 2, 62, 6, WOOD); box(c, x - 39, CAB.sill - 2, 62, 2, '#E8C890');
  if (tr.phase === 'still' || s.step === 'done') { box(c, x + 60, GY - 230, 110, 34, INK); box(c, x + 62, GY - 228, 106, 30, '#FEF3C7'); signText(c, 'OUT OF', x + 115, GY - 218, painted(1, '#7F1D1D', '#FEF3C7')); signText(c, 'SERVICE', x + 115, GY - 206, painted(1, '#7F1D1D', '#FEF3C7')); }
  // (the whistle cord, pulled tight by his weight once he's slumped on it)
  c.strokeStyle = '#D6D3D1'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 12, GY - 310); c.lineTo(x + 12 + (stuck ? -10 : 0), stuck ? CAB.sill - 10 : GY - 250); c.stroke();
};

/** Over the world: the KILL arrow over him, the buffer stop and the station at the end of the line. */
export const drawEngineFront = (c: Ctx, state: GameState) => {
  const s = scOf(state), tr = trainOf(state), f = state.frame;
  if (tr.phase === 'still' || s.step === 'done') return;
  const hx = ENGINE_X - 18;
  // (the KILL arrow, as Meathead 1 had over Riggs: a red arrow down at him, KILL over it, flashing; dropped in at the end
  // of the insult)
  const arrow = s.step === 'rant' || (s.step === 'insult' && s.beat >= 3);
  if (arrow && Math.floor(f / 10) % 2 === 0) {
    const ax = hx, ay = CAB.sill - 112 + Math.sin(f * 0.2) * 4;
    c.fillStyle = '#DC2626'; c.beginPath(); c.moveTo(ax, ay + 16); c.lineTo(ax - 12, ay); c.lineTo(ax + 12, ay); c.fill();
    c.font = 'bold 14px "Press Start 2P"'; c.textAlign = 'center';
    c.fillStyle = '#000'; c.fillText('KILL', ax + 2, ay - 6); c.fillStyle = '#F87171'; c.fillText('KILL', ax, ay - 8); c.textAlign = 'left';
  }
  // (the end of the line: SAWDUST GULCH's buffer stop and its platform, coming)
  const b = tr.passers.find(q => q.kind === 'bumper');
  if (b) drawBumper(c, b.x, s.step === 'crash' ? s.t : 0);
};

/** The buffer stop (timbers, a red-and-white striped beam) and Sawdust Gulch's station front behind it. */
const drawBumper = (c: Ctx, x0: number, crashT: number) => {
  c.save(); c.translate(x0, GY); c.scale(1.5, 1.5); c.translate(-x0, -GY);
  const x = x0;
  // (the station: a plywood false front, its name, END OF LINE)
  box(c, x + 40, GY - 260, 260, 260, INK); box(c, x + 42, GY - 258, 256, 258, '#B08A5A');
  for (let k = x + 50; k < x + 296; k += 16) box(c, k, GY - 258, 1, 258, '#8A6A40');
  box(c, x + 60, GY - 240, 220, 40, INK); box(c, x + 62, GY - 238, 216, 36, '#FEF3C7');
  signText(c, 'SAWDUST GULCH', x + 170, GY - 210, burned(2, 9));
  box(c, x + 110, GY - 150, 120, 26, INK); box(c, x + 112, GY - 148, 116, 22, '#7F1D1D'); signText(c, 'END OF LINE', x + 170, GY - 131, painted(1, '#FDE047', '#1C1209'));
  // (the bumper: heavy timbers, the striped beam the engine's going into)
  const sq = Math.min(30, crashT * 3);
  box(c, x + sq, GY - 70, 40, 70, INK); box(c, x + 2 + sq, GY - 68, 36, 68, '#5A3A1E');
  for (let k = 0; k < 4; k++) box(c, x + 2 + sq, GY - 64 + k * 14, 36, 7, k % 2 ? '#F8FAFC' : '#DC2626');
  c.restore();
};

/** Screen space: his words (the insult's with his face up close over them); the eye close-up and his last words under
 *  it; the crash's flash; the black; SKIP. */
export const drawEngineHud = (c: Ctx, state: GameState) => {
  const s = scOf(state), f = state.frame;
  if (s.step === 'insult') {
    // (his face up close in a frame while he's at it: manic, red, every tooth)
    if (s.talking) {
      const w = 220, h = 150, cx = CANVAS_WIDTH / 2, y = 70;
      box(c, cx - w / 2 - 6, y - 6, w + 12, h + 12, INK); box(c, cx - w / 2 - 4, y - 4, w + 8, h + 8, '#6B4423'); box(c, cx - w / 2 - 4, y - 4, w + 8, 3, '#9A6A3A');
      c.save(); c.beginPath(); c.rect(cx - w / 2, y, w, h); c.clip();
      for (let i = 0; i < 5; i++) box(c, cx - w / 2, y + (i * h) / 5, w, h / 5 + 1, mix('#3A2A20', '#1A1210', i / 5));
      drawTuckerCloseup(c, cx, y + h / 2 + 8, 3.6, f, { face: 'manic', talking: true, red: true, jolt: 0.2 });
      c.restore();
      if (s.said) saidOver(c, s.said.text, cx, y + h + 34, '#FDE68A', 340);
    }
    if (s.all > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
  } else if (s.said && (s.step === 'rant' || s.step === 'wait')) {
    saidOver(c, s.said.text, screenX(state, ENGINE_X - 18), screenY(state, CAB.sill - 140), '#FDE68A', 260);
  }
  if (s.step === 'close') {
    const t = s.t, k = Math.max(0, Math.min(1, (t - 6) / 120)), z = Math.min(1, t / 10);
    const w = 400 * (0.6 + 0.4 * z), h = 250 * (0.6 + 0.4 * z), cx = CANVAS_WIDTH / 2, cy = 200, x = cx - w / 2, y = cy - h / 2;
    c.save();
    c.globalAlpha = Math.min(1, z * 1.4);
    box(c, x - 8, y - 8, w + 16, h + 16, INK); box(c, x - 6, y - 6, w + 12, h + 12, '#6B4423'); box(c, x - 6, y - 6, w + 12, 3, '#9A6A3A');
    for (const [qx, qy] of [[x - 6, y - 6], [x + w - 4, y - 6], [x - 6, y + h - 4], [x + w - 4, y + h - 4]]) box(c, qx, qy, 10, 10, BRASS);
    c.beginPath(); c.rect(x, y, w, h); c.clip();
    // (behind his head: the sky the slug's going on into, in bands)
    for (let i = 0; i < 6; i++) box(c, x, y + (i * h) / 6, w, h / 6 + 1, mix('#7DB8F0', SKY, i / 6));
    // (him: facing the shot (mirrored), manic, then the hit: the jolt, the shock, out)
    const face = k < 0.22 ? 'manic' : k < 0.55 ? 'shock' : 'out';
    const jolt = k > 0.2 && k < 0.36 ? 1.4 : k < 0.22 ? 0.15 : 0.05;
    c.translate(cx, 0); c.scale(-1, 1); c.translate(-cx, 0);
    drawTuckerCloseup(c, cx + 6 + (k > 0.22 ? Math.min(14, (k - 0.22) * 60) : 0), cy + 10, 6.2, state.frame, { face, talking: s.talking && k > 0.4, red: k < 0.22, jolt, wounds: { eye: k > 0.26 }, making: { wound: 'eye', k } });
    c.restore();
    if (s.said) saidOver(c, s.said.text, cx, y + h + 34, '#FDE68A', 340);
  }
  if (s.flash > 0) { c.fillStyle = `rgba(255, 255, 255, ${s.flash})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  if (s.fade > 0) { c.fillStyle = `rgba(0, 0, 0, ${s.fade})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  if (cut(s) && s.all > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
};

/** The engine's scene has the camera (for the section's camera, while it does). */
export const engineHasCamera = (state: GameState) => cut(scOf(state)) || scOf(state).step === 'insult';
/** The headlamp, for the lighting. */
export const headlamp = () => ({ x: ENGINE_X + 473, y: GY - 250 });
