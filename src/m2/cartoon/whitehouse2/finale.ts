// THE FINALE (the user's: "at the end of the socks segment a tv screen with bill and Hillary thank you for your service
// by stopping those 'bad men'. the projector screen showing the cartoon chaos collapses showing meathead wasn't actually
// a cat but it was a clever tv projector making it look like he was. like an early snapchat filter or something. you see
// tons of dead bodies in the aftermath. meathead then leaves the cartoon studio."). One cutscene from Newt's puff (no
// input, no HUD, SKIP >> for the lot), in the Oval Office:
//
//   Chelsea, green, gulping, still in character: "LOOK, SOCKS! IT'S MOM AND DAD! ON TV!"; Meathead's over it; a big
//   cartoon TV swings down out of the ceiling on its arm: the show's BILL and HILLARY at the UN, thanking Socks for his
//   service (by the state of him); "WHO THE FUCK ARE YOU TWO?"; the TV snows out. The picture judders (Chelsea: the walls
//   are wobbly); the actress's own voice breaks through ("OH NO. NO, NO, NO, NO!"); the PROJECTION SCREEN comes down: the
//   cartoon falls away from the top, the picture squashing down with it as the cloth comes down in a heap over the
//   stage's lip, and behind it the real stage. The cat's still on him a moment (the projector, up on its truss, still
//   painting it on him, flickering), then it slides off him like a decal (an early Snapchat filter) and he's himself:
//   "I WASN'T A CAT. IT WAS A FUCKING PROJECTOR."; the projector sparks and dies; the work lights clank on. The Newt actor
//   in front of the desk, flayed; "OH. SO THAT'S WHAT A POOF LOOKS LIKE."; the woman who played Chelsea (a grown woman in
//   the costume, the wig half off) on her knees being sick, and sick, and sick: "GET OUT. JUST GET OUT OF HERE."; his
//   answer. Then it's his: the stage, the bodies, the stage door on the far right.
//
// After it (COLLAPSED_MEMO): the actress stays retching where she knelt (and, now and then if he's near, between
// heaves, at him to go) till he's gone out of the White House; a later visit, she's gone (ACTRESS_GONE_MEMO): her wig
// and her mess on the floor.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import type { WeaponType } from '../../../m1/types';
import type { Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine, silenceAll, isTalking } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { drawPlayer } from '../../../m1/game/render/player/player';
import { signText } from '../../signLetters';
import { speak, meatheadSays, byPants, hands, saidOver } from '../section';
import { GY } from '../geometry';
import { INK, toonLetters, box, type Ctx } from '../kit';
import { toonPart, toonTop, toonFlat, toonRamp, type Rp } from '../whitehouse1/punditArt';
import { shape, shapeTop, limb, rampOf } from '../amphi/paint';
import { chelseaSays, scripted, chelseaTo, setChelseaPose, chelseaOf } from '../whitehouse1/chelsea';
import { wh2Of, COLLAPSED_MEMO, ACTRESS_GONE_MEMO, type Finale } from './state';
import { NEWT_ARENA, RESOLUTE, CEIL, OVAL_WALL, X, Y } from './layout';
import {
  BILL, HILLARY, ACTRESS, BILL_TV, HILLARY_TV, TV_REPLY, QUEASY_NEWT, NEWT_LINES, WOBBLY, ACTRESS_FALL, NOT_A_CAT, SEES_NEWT, ACTRESS_OUT,
  ACTRESS_ANSWER, ACTRESS_NAG,
} from './lines';
import { unlockNewt } from './pundits';

/** Where it happens: the Newt actor's body (his head, in front of the desk), the actress (on her knees), the projector's
 *  truss tower (the stage's corner), the TV over the desk. */
export const NEWT_BODY = { x: X(10150), y: GY };
export const ACTRESS_AT = { x: X(10600), y: GY };
export const RIG_X = X(10050);
const TV_X = X((RESOLUTE.a + RESOLUTE.b) / 2), TV_W = 230, TV_H = 160;
const CHELSEA_SPOT = ACTRESS_AT.x;

export const finaleOn = (state: GameState) => { const f = wh2Of(state).finale; return !!f && f.step !== 'done'; };

/** Newt's puff: on. */
export const startFinale = (state: GameState) => {
  const s = wh2Of(state), p = state.player;
  s.finale = { step: 'queasy', t: 0, all: 0, line: 0, tv: 0, talking: null, fall: 0, slip: 0, beam: 0, work: 0, x: p.pos.x + p.width / 2, y: p.pos.y + p.height };
  p.inCutscene = true; p.vel.x = 0;
  scripted(state, true);
  state.projectiles = state.projectiles.filter(q => q.owner !== 'player');
};

/** The screen's down: the projection gone for good (the memo), the checkpoint his, the Oval opened. */
const screenDown = (state: GameState) => {
  const s = wh2Of(state);
  state.stageMemo[COLLAPSED_MEMO] = '1';
  s.real = true;
  if (state.checkpoint < 37) state.checkpoint = 37;
  s.actress.x = ACTRESS_AT.x; s.actress.y = ACTRESS_AT.y; s.actress.nagAt = state.frame + 900;
};
const finish = (state: GameState, F: Finale, skipped: boolean) => {
  const s = wh2Of(state), p = state.player;
  if (skipped) silenceAll();
  if (!s.real) screenDown(state);
  F.step = 'done'; F.fall = 1; F.slip = 1; F.beam = 0; F.work = 1; F.tv = 0; F.talking = null;
  p.catForm = false; p.inCutscene = false; p.hidden = false;
  scripted(state, false);
  unlockNewt(state);
  openOval(state);
};
/** The Oval Office's far wall gone (the wings, the stage door past it). */
export const openOval = (state: GameState) => { const w = wh2Of(state).ovalWall; if (w) w.x = -1e7; };

/** Each frame it's on: the scene. Returns the controls (none of his). */
export const updateFinale = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, s = wh2Of(state), F = s.finale, p = state.player;
  if (!F || F.step === 'done') return controls;
  F.t++; F.all++;
  p.inCutscene = true; p.vel.x = 0;
  if (F.all > SKIP_AFTER) { offerSkip(); if (takeSkip()) { finish(state, F, true); return hands(); } }
  const go = (step: Finale['step']) => { F.step = step; F.t = 0; F.line = 0; };
  // (a line's done: on to the next step, if the scene's still at the one that said it (not skipped, not timed out))
  const after = (from: Finale['step'], to: Finale['step']) => () => { if (F.step === from) go(to); };
  const once = (fn: () => void) => { if (F.line === 0) { F.line = -1; fn(); } };
  const ch = chelseaOf(state);
  switch (F.step) {
    case 'queasy':
      // (Chelsea over by the desk, green, holding it in; her line; his)
      if (chelseaTo(state, CHELSEA_SPOT, 5)) { setChelseaPose(state, ch.said ? 'cheer' : 'queasy'); ch.facing = -1; }
      if (F.t === 50) chelseaSays(state, QUEASY_NEWT[0], () => { F.line = 1; });
      if (F.line === 1) { F.line = -1; meatheadSays(state, pickLine(byPants(state, NEWT_LINES.after)), true, after('queasy', 'tvdown')); }
      if (F.t > 900) go('tvdown');
      break;
    case 'tvdown':
      // (the TV down out of the ceiling on its arm, whirring)
      F.tv = Math.min(1, F.t / 50);
      if (F.t % 8 === 0 && F.t < 50) playSound('engine', 0.2, 18);
      if (F.t === 52) { playSound('click', 0.6, 0); playSound('ding', 0.4, 6); }
      setChelseaPose(state, 'point');
      if (F.t > 66) go('bill');
      break;
    case 'bill':
      once(() => { F.talking = 'bill'; speak(BILL, pickLine(byPants(state, BILL_TV)), x => { tvSaid.bill = x?.text ?? null; }, true, () => { F.talking = null; after('bill', 'hillary')(); }); });
      if (F.t > 900) go('hillary');
      break;
    case 'hillary':
      once(() => { F.talking = 'hillary'; speak(HILLARY, pickLine(byPants(state, HILLARY_TV)), x => { tvSaid.hillary = x?.text ?? null; }, true, () => { F.talking = null; after('hillary', 'reply')(); }); });
      if (F.t > 900) go('reply');
      break;
    case 'reply':
      once(() => meatheadSays(state, pickLine(byPants(state, TV_REPLY)), true, after('reply', 'tvoff')));
      if (F.t > 600) go('tvoff');
      break;
    case 'tvoff':
      // (it snows out, clicks off)
      if (F.t === 1) playSound('rumble', 0.4, 20);
      if (F.t === 30) playSound('click', 0.6, -4);
      if (F.t > 50) go('shake');
      break;
    case 'shake':
      // (the picture judders; a deep groan from up top; Chelsea, scared, still in character)
      if (F.t % 14 === 0) { playSound('rumble', 0.5, -10); shakeScreen(state, 3, 6); }
      if (F.t === 10) chelseaSays(state, WOBBLY[0], () => { F.line = 1; });
      setChelseaPose(state, 'cower');
      if (F.line === 1 || F.t > 400) { go('fall'); speak(ACTRESS, ACTRESS_FALL[0], x => { s.actress.said = x; }, false); playSound('crack', 1, -8); }
      break;
    case 'fall': {
      // (the screen comes down: faster and faster, a tear and a crash, the dust)
      const T = 64, k = Math.min(1, F.t / T);
      F.fall = k * k;
      if (F.t % 10 === 0 && k < 1) playSound('whoosh', 0.5, -8 + F.t * 0.1);
      if (F.t === T) {
        playSound('crash', 1, -10); playSound('slam', 1, -14); shakeScreen(state, 12, 14);
        for (let i = 0; i < 40; i++) state.particles.push({ pos: { x: state.camera.x + Math.random() * CANVAS_WIDTH, y: GY + 10 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 3 }, life: 50 + Math.random() * 30, color: Math.random() < 0.5 ? '#9CA3AF' : '#D1D5DB', size: 3 + Math.random() * 3, grav: 0.02 } as typeof state.particles[number]);
        screenDown(state);
        F.beam = 1;
      }
      if (F.t > T + 40) go('catslip');
      break;
    }
    case 'catslip':
      // (the projector still painting the cat on him, flickering; then the cat sliding off him like a sticker)
      p.catForm = false;
      F.beam = 1;
      if (F.t > 40) F.slip = Math.min(1, (F.t - 40) / 80);
      if (F.t % 6 === 0) playSound('beep', 0.12, 22 + (F.t % 12));
      if (F.t === 60) playSound('scratch', 0.6, -6);
      if (F.slip >= 1) once(() => meatheadSays(state, pickLine(byPants(state, NOT_A_CAT)), true, after('catslip', 'spark')));
      if (F.t > 700) go('spark');
      break;
    case 'spark':
      // (the projector sparks and dies; the work lights clank on, one bank after another)
      p.catForm = false;
      if (F.t === 1) { playSound('taser', 0.9, -4); playSound('crack', 0.8, 2); F.beam = 0; }
      if (F.t === 30 || F.t === 46 || F.t === 62) playSound('clang', 0.7, -12 + F.t * 0.1);
      F.work = Math.min(1, Math.max(0, (F.t - 28) / 40));
      if (F.t > 80) go('look');
      break;
    case 'look':
      // (he turns to the body)
      p.facing = NEWT_BODY.x < p.pos.x + p.width / 2 ? -1 : 1;
      once(() => meatheadSays(state, pickLine(byPants(state, SEES_NEWT)), true, after('look', 'actress')));
      if (F.t > 700) go('actress');
      break;
    case 'actress':
      // (her, on her knees, being sick: get out)
      p.facing = ACTRESS_AT.x < p.pos.x + p.width / 2 ? -1 : 1;
      if (F.t === 20) heave(state, 50);
      if (F.t === 80) once(() => speak(ACTRESS, pickLine(byPants(state, ACTRESS_OUT)), x => { s.actress.said = x; }, true, () => { F.line = 2; }));
      if (F.line === 2) { F.line = -2; heave(state, 40); meatheadSays(state, pickLine(byPants(state, ACTRESS_ANSWER)), true, () => { F.line = 3; }); }
      if (F.line === 3 || F.t > 1200) finish(state, F, false);
      break;
  }
  return hands();
};
const tvSaid: { bill: string | null; hillary: string | null } = { bill: null, hillary: null };

// ---------------------------------------------------------------------------------------------------------------
// The actress, after (being sick, nonstop; at him to go)

/** A heave: a gush of it (frames of it coming). */
const heave = (state: GameState, n: number) => { const a = wh2Of(state).actress; a.heave = Math.max(a.heave, n); playSound('retch', 0.6, Math.random() * 4 - 2); playSound('gush', 0.5, 0); };
/** Each frame the screen's down and he's in part two: her, at it; the vomit; her at him now and then. */
export const updateActress = (state: GameState) => {
  const a = wh2Of(state).actress, p = state.player;
  if (state.stageMemo[ACTRESS_GONE_MEMO]) return;
  if (!a.x) { a.x = ACTRESS_AT.x; a.y = ACTRESS_AT.y; a.nagAt = state.frame + 600; }
  // (nonstop: a heave every couple of seconds, a gush each)
  if (a.heave <= 0 && state.frame % 130 === 0) heave(state, 34 + Math.floor(Math.random() * 30));
  if (a.heave > 0) {
    a.heave--; a.puddle = Math.min(1, a.puddle + 0.002);
    const mx = a.x + 26, my = a.y - 44;
    for (let i = 0; i < 2; i++) state.particles.push({ pos: { x: mx, y: my }, vel: { x: 1.2 + Math.random() * 1.6, y: 0.5 + Math.random() * 1.5 }, life: 26, color: ['#B9A548', '#CFC066', '#9C8C3A', '#E2D27A'][(state.frame + i) % 4], size: 2 + Math.random() * 2.5, grav: 0.35 } as typeof state.particles[number]);
  }
  // (at him to go, between heaves, if he's near and nobody's talking)
  const near = Math.abs(p.pos.x + p.width / 2 - a.x) < 520;
  if (near && !p.inCutscene && p.health > 0 && state.frame > a.nagAt && !isTalking() && a.heave <= 0) {
    a.nagAt = state.frame + 480 + Math.floor(Math.random() * 300);
    speak(ACTRESS, pickLine(byPants(state, ACTRESS_NAG)), x => { a.said = x; }, false);
  }
};
/** She's gone (he's left the White House): a later visit has her wig and her mess. */
export const actressLeaves = (state: GameState) => { if (state.stageMemo[COLLAPSED_MEMO]) state.stageMemo[ACTRESS_GONE_MEMO] = '1'; };

const SKIN = rampOf('#E2AE8C'), WIG = rampOf('#E8A15C'), SWEATER = rampOf('#7C5CC4'), SKIRT = rampOf('#0F766E'), SOCK = rampOf('#F1F5F9'), SHOE = rampOf('#1A1A24'), OWN_HAIR = rampOf('#3B2A22'), BILE = rampOf('#C8B858');
/** The actress (world): a grown woman in the show's Chelsea costume (the purple sweater, its white collar, the plaid,
 *  the white knee socks, the Mary Janes), on her knees, one hand braced on the floor, being sick. The orange curly wig
 *  half off (pinned at one side, hanging), her own dark hair flat under its cap, the pink headband askew, the stage
 *  freckles painted on, the mascara run; the puddle growing in front of her. Real, under the work lights: no cartoon ink. */
export const drawActress = (c: Ctx, state: GameState) => {
  const a = wh2Of(state).actress, f = state.frame;
  if (!a.x || state.stageMemo[ACTRESS_GONE_MEMO]) return;
  const x = a.x, y = a.y, h = a.heave > 0, lurch = h ? Math.sin(f * 0.6) * 2 : Math.sin(f * 0.05);
  // (the puddle in front of her, growing: banded, chunks in it, a wet shine)
  const pw = 26 + a.puddle * 40;
  c.fillStyle = BILE[3]; c.beginPath(); c.ellipse(x + 44, y + 1, pw + 3, 5 + a.puddle * 2, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = BILE[1]; c.beginPath(); c.ellipse(x + 44, y, pw, 4 + a.puddle * 2, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = BILE[0]; c.beginPath(); c.ellipse(x + 40, y - 1, pw * 0.6, 2.2, 0, 0, Math.PI * 2); c.fill();
  for (let k = 0; k < 5; k++) { c.fillStyle = k % 2 ? '#8A6A2A' : '#E8D88A'; c.fillRect(x + 30 + ((k * 13) % Math.max(8, pw)), y - 1 + (k % 2), 3, 2); }
  c.fillStyle = 'rgba(255,255,240,0.6)'; c.fillRect(x + 34, y - 2, 8, 1);
  c.save(); c.translate(x, y);
  // (kneeling: the shins flat on the floor behind, the white knee socks, the Mary Janes and their straps)
  shapeTop(c, () => c.roundRect(-36, -9, 30, 9, 3), SOCK, -9, 0);
  shapeTop(c, () => c.roundRect(-46, -10, 12, 8, [3, 1, 1, 3]), SHOE, -10, -2); c.fillStyle = '#5A5A66'; c.fillRect(-44, -9, 6, 1);
  limb(c, -6, -10, 6, -2, -26, 6.5, SKIN, 0, 1);
  // (the plaid skirt: teal, the yellow and red lines across)
  shape(c, () => { c.moveTo(-15, -18); c.lineTo(13, -18); c.lineTo(17, -35); c.lineTo(-10, -39); c.closePath(); }, SKIRT, -15, 17);
  c.fillStyle = '#FACC15'; c.fillRect(-10, -31, 22, 1); c.fillRect(-12, -24, 26, 1); c.fillStyle = '#DC2626'; c.fillRect(-4, -37, 1, 19); c.fillRect(6, -35, 1, 17);
  // (the body bent over: the purple sweater in steps, stained, the big white collar)
  c.save(); c.translate(0, -36 + lurch * 0.5); c.rotate(0.85 + (h ? 0.12 : 0));
  shape(c, () => c.roundRect(-11, -31, 24, 34, 7), SWEATER, -11, 13);
  c.fillStyle = SWEATER[3]; c.fillRect(-11, -6, 24, 4); for (let k = 0; k < 6; k++) c.fillRect(-9 + k * 4, -4, 1, 4);
  shapeTop(c, () => { c.moveTo(-11, -31); c.quadraticCurveTo(0, -22, 13, -31); c.lineTo(11, -35); c.lineTo(-9, -35); c.closePath(); }, rampOf('#F8FAFC'), -35, -24);
  c.fillStyle = BILE[1]; c.fillRect(-2, -27, 9, 3); c.fillRect(2, -20, 6, 2); c.fillStyle = BILE[0]; c.fillRect(-1, -27, 3, 1);
  c.restore();
  // (the arm braced on the floor, the cuff, the hand splayed)
  limb(c, 14, -46, 4.5, 22, -6, 4, SWEATER, 0, 1);
  shapeTop(c, () => c.ellipse(24, -2, 5.5, 3, 0, 0, Math.PI * 2), SKIN, -5, 1);
  // (the head down over the puddle)
  const hx = 26, hy = -46 + lurch;
  shapeTop(c, () => c.ellipse(hx - 4, hy - 6, 11.5, 9.5, 0.4, 0, Math.PI * 2), OWN_HAIR, hy - 15, hy + 3);
  c.fillStyle = '#C8B8A8'; c.fillRect(hx - 10, hy - 12, 10, 2);
  shape(c, () => c.ellipse(hx, hy, 10.5, 11.5, 0.5, 0, Math.PI * 2), SKIN, hx - 11, hx + 11);
  c.fillStyle = '#E88A8A'; c.beginPath(); c.ellipse(hx + 3, hy + 2, 3.5, 2, 0.4, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#A0522A'; for (const [dx, dy] of [[1, -1], [4, 0], [6, 1], [3, 2], [5, 3]]) c.fillRect(hx + dx, hy + dy, 1, 1);
  // (the eye squeezed shut, the mascara run down the cheek)
  c.fillStyle = '#1F1A2E'; c.fillRect(hx + 1, hy - 5, 5, 1.5); c.fillRect(hx + 2, hy - 3, 1, 5); c.fillRect(hx + 4, hy - 3, 1, 7);
  // (the mouth open, retching)
  c.fillStyle = '#3F0606'; c.beginPath(); c.ellipse(hx + 7, hy + 7, 3.2, h ? 4.2 : 2, 0.4, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#E5E7EB'; c.fillRect(hx + 5, hy + 5, 4, 1);
  // (the wig half off, hanging off its pins at one side: orange curls in steps)
  for (const [dx, dy, r] of [[-12, -14, 6.5], [-17, -6, 6.5], [-10, -21, 5.5], [-4, -19, 5.5], [-19, 3, 5.5], [-22, 11, 5], [-15, 9, 5]] as [number, number, number][]) { c.fillStyle = WIG[3]; c.beginPath(); c.arc(hx + dx - 6, hy + dy + 4, r, 0, Math.PI * 2); c.fill(); c.fillStyle = WIG[1]; c.beginPath(); c.arc(hx + dx - 7, hy + dy + 3, r * 0.75, 0, Math.PI * 2); c.fill(); c.fillStyle = WIG[0]; c.fillRect(hx + dx - 9, hy + dy + 1, 2, 2); }
  c.fillStyle = '#9CA3AF'; c.fillRect(hx - 8, hy - 9, 3, 1); c.fillRect(hx - 12, hy - 4, 3, 1);
  c.strokeStyle = '#D9468E'; c.lineWidth = 3.4; c.beginPath(); c.arc(hx - 9, hy - 3, 12, Math.PI * 1.2, Math.PI * 1.75); c.stroke();
  c.strokeStyle = '#F9A8D4'; c.lineWidth = 1.2; c.beginPath(); c.arc(hx - 9, hy - 4, 12, Math.PI * 1.25, Math.PI * 1.6); c.stroke();
  // (the stream, while she heaves)
  if (h) { c.strokeStyle = BILE[2]; c.lineWidth = 5; c.beginPath(); c.moveTo(hx + 8, hy + 8); c.quadraticCurveTo(hx + 18, hy + 20, hx + 20, -2); c.stroke(); c.strokeStyle = BILE[0]; c.lineWidth = 2; c.stroke(); }
  c.restore();
};
/** Her words (screen space: over the work lights). */
export const drawActressSaid = (c: Ctx, state: GameState) => {
  const a = wh2Of(state).actress, x = a.x || ACTRESS_AT.x, y = a.y || ACTRESS_AT.y;
  if (a.said) saidOver(c, a.said.text, x - state.camera.x + 20, y - 80 - state.camera.y, '#FBCFE8', 260);
};

// ---------------------------------------------------------------------------------------------------------------
// The TV (the show's: on its arm out of the ceiling), the Clintons on it

const TV_TOP = Y(CEIL);
const tvBox = (F: Finale) => { const drop = 190 * F.tv; return { x: TV_X - TV_W / 2, y: TV_TOP - TV_H + drop + 20, w: TV_W, h: TV_H }; };
// (the show's people on the TV are cartoons: part one's toon kit, inked fat)
const SKIN_B: Rp = ['#FFE0CC', '#F6C3AA', '#E0A088', '#C07A62'];
const SUIT_B: Rp = ['#4A64B4', '#22408E', '#182E6A', '#0E1E4A'];
const HAIR_B: Rp = ['#F2F4F8', '#CBD5E1', '#A0A8B8', '#7A8294'];
const PINK_H: Rp = ['#FBCFE8', '#F472B6', '#DB2777', '#9D174D'];
const BLOND: Rp = ['#FFF6C8', '#FDE68A', '#E8C060', '#B8903A'];
const drawBill = (c: Ctx, x: number, y: number, talk: boolean, f: number) => {
  // (the navy suit, the red tie, a saxophone pin; the thumbs up, bobbing as he talks)
  toonPart(c, () => { c.moveTo(x - 30, y + 60); c.quadraticCurveTo(x - 30, y + 18, x, y + 16); c.quadraticCurveTo(x + 30, y + 18, x + 30, y + 60); c.closePath(); }, SUIT_B, x - 30, x + 30, 2.4);
  toonFlat(c, () => { c.moveTo(x - 6, y + 16); c.lineTo(x + 6, y + 16); c.lineTo(x, y + 28); c.closePath(); }, '#F2F2F8', 1.2);
  toonPart(c, () => { c.moveTo(x - 3.5, y + 18); c.lineTo(x + 3.5, y + 18); c.lineTo(x + 2.5, y + 44); c.lineTo(x, y + 47); c.lineTo(x - 2.5, y + 44); c.closePath(); }, toonRamp('#DC2626'), x - 3.5, x + 3.5, 1.4);
  c.fillStyle = '#E2B33C'; c.fillRect(x - 18, y + 26, 2, 6); c.fillRect(x - 18, y + 31, 4, 2);
  toonPart(c, () => c.ellipse(x, y - 4, 19, 21, 0, 0, Math.PI * 2), SKIN_B, x - 19, x + 19, 2.4);
  // (the big puffy gray hair in steps, the big red nose, the grin, the bags under the eyes)
  toonTop(c, () => { c.moveTo(x - 20, y - 4); c.quadraticCurveTo(x - 27, y - 35, x, y - 33); c.quadraticCurveTo(x + 27, y - 35, x + 20, y - 4); c.quadraticCurveTo(x + 12, y - 20, x, y - 20); c.quadraticCurveTo(x - 12, y - 20, x - 20, y - 4); c.closePath(); }, HAIR_B, y - 35, y - 4, 2.4);
  c.strokeStyle = HAIR_B[3]; c.lineWidth = 1; for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(x - 12 + k * 8, y - 24, 5, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
  for (const ex of [-7, 7]) { c.fillStyle = INK; c.beginPath(); c.arc(x + ex, y - 6, 2.2, 0, Math.PI * 2); c.fill(); c.fillStyle = '#FFFFFF'; c.fillRect(x + ex, y - 7, 1, 1); c.fillStyle = SKIN_B[2]; c.fillRect(x + ex - 3, y - 2, 6, 1); }
  toonPart(c, () => c.ellipse(x, y + 2, 7.5, 6.5, 0, 0, Math.PI * 2), toonRamp('#E05A5A'), x - 7.5, x + 7.5, 2);
  c.fillStyle = '#FFFFFF'; c.fillRect(x - 3, y - 1, 2, 2);
  const open = talk ? [2, 6, 3, 7][(f >> 2) % 4] : 3;
  toonFlat(c, () => c.ellipse(x, y + 11, 9, open / 2 + 1, 0, 0, Math.PI * 2), '#5A0E14', 1.6); c.fillStyle = '#FFFFFF'; c.fillRect(x - 6, y + 9, 12, 1.5);
  const bob = talk ? ((f >> 4) % 2) * 3 : 0;
  toonPart(c, () => c.roundRect(x + 29, y + 22 - bob, 13, 13, 3), SKIN_B, x + 29, x + 42, 1.8);
  toonPart(c, () => c.roundRect(x + 32, y + 11 - bob, 5.5, 13, 2), SKIN_B, x + 32, x + 37.5, 1.6);
};
const drawHillary = (c: Ctx, x: number, y: number, talk: boolean, f: number) => {
  // (the pink suit, the pearls; the blonde bob, the black headband)
  toonPart(c, () => { c.moveTo(x - 26, y + 60); c.quadraticCurveTo(x - 26, y + 18, x, y + 16); c.quadraticCurveTo(x + 26, y + 18, x + 26, y + 60); c.closePath(); }, PINK_H, x - 26, x + 26, 2.4);
  toonFlat(c, () => { c.moveTo(x - 5, y + 17); c.lineTo(x - 12, y + 30); c.lineTo(x - 2, y + 40); c.closePath(); }, PINK_H[0], 1.2);
  toonFlat(c, () => { c.moveTo(x + 5, y + 17); c.lineTo(x + 12, y + 30); c.lineTo(x + 2, y + 40); c.closePath(); }, PINK_H[2], 1.2);
  for (let k = -3; k <= 3; k++) { c.fillStyle = INK; c.beginPath(); c.arc(x + k * 4, y + 21 + Math.abs(k), 2.6, 0, Math.PI * 2); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(x + k * 4, y + 21 + Math.abs(k), 1.8, 0, Math.PI * 2); c.fill(); }
  toonPart(c, () => c.ellipse(x, y - 2, 16, 19, 0, 0, Math.PI * 2), SKIN_B, x - 16, x + 16, 2.4);
  toonTop(c, () => { c.moveTo(x - 20, y + 10); c.quadraticCurveTo(x - 25, y - 31, x, y - 27); c.quadraticCurveTo(x + 25, y - 31, x + 20, y + 10); c.lineTo(x + 14, y + 10); c.quadraticCurveTo(x + 14, y - 10, x, y - 14); c.quadraticCurveTo(x - 14, y - 10, x - 14, y + 10); c.closePath(); }, BLOND, y - 31, y + 10, 2.4);
  c.strokeStyle = BLOND[3]; c.lineWidth = 1; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x + s * 16, y - 12); c.quadraticCurveTo(x + s * 20, y, x + s * 17, y + 8); c.stroke(); }
  c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.arc(x, y - 6, 18, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
  for (const ex of [-6, 6]) { c.fillStyle = INK; c.beginPath(); c.arc(x + ex, y - 3, 2.1, 0, Math.PI * 2); c.fill(); c.fillStyle = '#FFFFFF'; c.fillRect(x + ex, y - 4, 1, 1); c.fillStyle = INK; c.fillRect(x + ex - 3, y - 7, 6, 1); }
  c.fillStyle = '#F29A9A'; c.fillRect(x - 11, y + 3, 4, 2); c.fillRect(x + 7, y + 3, 4, 2);
  const open = talk ? [2, 6, 3, 7][(f >> 2) % 4] : 2;
  toonFlat(c, () => c.ellipse(x, y + 9, 7, open / 2 + 1, 0, 0, Math.PI * 2), '#9D174D', 1.6); c.fillStyle = '#FFFFFF'; c.fillRect(x - 5, y + 7, 10, 1.5);
};
/** The TV (world, over the set): its telescoping arm out of the ceiling; the cabinet (wood grain in steps, the dials,
 *  the speaker grille, rabbit ears); the screen's bulge: the Clintons at the UN (the emblem in its laurels, the flags,
 *  the banner), scan lines; snow; off. */
const drawTv = (c: Ctx, state: GameState, F: Finale) => {
  if (F.tv <= 0) return;
  const B = tvBox(F), f = state.frame;
  // (the arm: three sleeves telescoping, a ceiling plate)
  const STL: Rp = ['#D8DCE6', '#9CA3AF', '#6B7280', '#4B5563'];
  for (let k = 0; k < 3; k++) { const y0 = TV_TOP + ((B.y - 30 - TV_TOP) * k) / 3, y1 = TV_TOP + ((B.y - 30 - TV_TOP) * (k + 1)) / 3 + 4, w = 10 - k * 2; toonPart(c, () => c.rect(TV_X - w / 2, y0, w, y1 - y0), STL, TV_X - w / 2, TV_X + w / 2, 2); }
  toonTop(c, () => c.roundRect(TV_X - 24, TV_TOP - 4, 48, 10, 3), STL, TV_TOP - 4, TV_TOP + 6, 2);
  toonPart(c, () => c.roundRect(TV_X - 30, B.y - 34, 60, 22, 4), STL, TV_X - 30, TV_X + 30, 2);
  // (the rabbit ears)
  for (const s of [-1, 1]) { c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(B.x + B.w * 0.75, B.y - 12); c.lineTo(B.x + B.w * 0.75 + s * 34, B.y - 48); c.stroke(); c.strokeStyle = '#D8DCE6'; c.lineWidth = 1.2; c.stroke(); c.fillStyle = INK; c.beginPath(); c.arc(B.x + B.w * 0.75 + s * 34, B.y - 48, 3, 0, Math.PI * 2); c.fill(); }
  toonTop(c, () => c.ellipse(B.x + B.w * 0.75, B.y - 12, 12, 5, 0, Math.PI, 0), ['#5A5866', '#2A2830', '#1A1820', '#0C0B10'], B.y - 17, B.y - 12, 1.6);
  // (the cabinet: wood grain in steps, a gilt trim, the dials and the grille down the side)
  const WOODR: Rp = ['#C27A3E', '#8A5226', '#6A3C18', '#4A280E'];
  toonTop(c, () => c.roundRect(B.x - 16, B.y - 14, B.w + 64, B.h + 28, 16), WOODR, B.y - 14, B.y + B.h + 14, 4);
  c.strokeStyle = WOODR[2]; c.lineWidth = 1; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(B.x - 8, B.y - 6 + k * 30); c.quadraticCurveTo(B.x + B.w / 2, B.y - 2 + k * 30 + (k % 2) * 6, B.x + B.w + 40, B.y - 6 + k * 30); c.stroke(); }
  const px0 = B.x + B.w + 8;
  toonPart(c, () => c.roundRect(px0, B.y + 4, 32, B.h - 8, 6), ['#5A5866', '#2A2830', '#1A1820', '#0C0B10'], px0, px0 + 32, 2);
  for (let k = 0; k < 2; k++) { const dy = B.y + 22 + k * 34; toonPart(c, () => c.arc(px0 + 16, dy, 10, 0, Math.PI * 2), toonRamp('#E2B33C'), px0 + 6, px0 + 26, 2); c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(px0 + 16, dy); c.lineTo(px0 + 16 + Math.cos(k * 2 + 0.6) * 8, dy + Math.sin(k * 2 + 0.6) * 8); c.stroke(); }
  for (let y = B.y + 80; y < B.y + B.h - 12; y += 5) { c.fillStyle = '#0C0B10'; c.fillRect(px0 + 6, y, 20, 2); }
  c.fillStyle = F.step === 'tvoff' && F.t > 30 ? '#4A0A0A' : '#EF4444'; c.fillRect(px0 + 12, B.y + B.h - 12, 8, 4);
  // (the screen's bezel, its glass bulging)
  toonFlat(c, () => c.roundRect(B.x - 4, B.y - 4, B.w + 8, B.h + 8, 16), '#1A1820', 2.4);
  const off = F.step === 'tvoff' && F.t > 30 || ['shake', 'fall'].includes(F.step);
  c.save(); c.beginPath(); c.roundRect(B.x, B.y, B.w, B.h, 14); c.clip();
  if (off) { box(c, B.x, B.y, B.w, B.h, '#0E1018'); if (F.step === 'tvoff' && F.t < 44) { c.fillStyle = '#FFFFFF'; c.fillRect(B.x + B.w / 2 - 3, B.y + B.h / 2 - 2, 6, 4); } }
  else if (F.step === 'tvoff' || F.step === 'tvdown' && F.t < 54) { for (let y = B.y; y < B.y + B.h; y += 3) for (let x = B.x; x < B.x + B.w; x += 6) box(c, x, y, 6, 3, ((x * 7 + y * 13 + f * 31) % 97) < 48 ? '#E5E7EB' : '#4B5563'); }
  else {
    // (the UN: a banded blue wall, the emblem (the globe in its laurels), the banner, the flags along the bottom)
    const BL = ['#3A7AD8', '#4A8AE2', '#5A9AEA', '#6AAAF0', '#7AB8F4'];
    BL.forEach((col, i) => box(c, B.x, B.y + (i * B.h) / 5, B.w, B.h / 5 + 1, col));
    const ex = B.x + B.w / 2, ey = B.y + 46;
    c.strokeStyle = '#F8FAFC'; c.lineWidth = 2.4; c.beginPath(); c.arc(ex, ey, 22, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 1.2; c.beginPath(); c.moveTo(ex - 22, ey); c.lineTo(ex + 22, ey); c.moveTo(ex, ey - 22); c.lineTo(ex, ey + 22); c.stroke(); c.beginPath(); c.arc(ex, ey, 12, 0, Math.PI * 2); c.stroke();
    for (const s of [-1, 1]) for (let k = 0; k < 6; k++) { const a = Math.PI / 2 + s * (0.5 + k * 0.32); c.fillStyle = '#F8FAFC'; c.beginPath(); c.ellipse(ex + Math.cos(a) * 30, ey + Math.sin(a) * 30, 4, 2, a, 0, Math.PI * 2); c.fill(); }
    toonFlat(c, () => c.roundRect(B.x + 40, B.y + 6, B.w - 80, 14, 3), '#1E3A8A', 1.6);
    signText(c, 'U.N. SUMMIT', B.x + B.w / 2, B.y + 17, toonLetters(1, ['#FFFFFF', '#FFFFFF', '#FDE68A', '#FDE047']));
    for (let k = 0; k < 9; k++) { const fx = B.x + 6 + k * 26; c.fillStyle = INK; c.fillRect(fx, B.y + B.h - 34, 1, 34); c.fillStyle = ['#DC2626', '#FFFFFF', '#16A34A', '#FDE047', '#1D4ED8'][k % 5]; c.fillRect(fx + 1, B.y + B.h - 34, 12, 8); c.fillStyle = ['#1D4ED8', '#DC2626', '#FFFFFF', '#16A34A', '#FFFFFF'][k % 5]; c.fillRect(fx + 1, B.y + B.h - 30, 12, 3); }
    drawBill(c, B.x + 64, B.y + 92, F.talking === 'bill', f);
    drawHillary(c, B.x + B.w - 64, B.y + 94, F.talking === 'hillary', f);
  }
  for (let y = B.y; y < B.y + B.h; y += 3) { c.fillStyle = 'rgba(0,0,0,0.14)'; c.fillRect(B.x, y, B.w, 1); }
  c.fillStyle = 'rgba(255,255,255,0.16)'; c.beginPath(); c.ellipse(B.x + 40, B.y + 30, 34, 22, -0.5, 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(B.x + 8, B.y + 8, 30, B.h - 16);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The fall, the beam, the cat sliding off him

/** How far down the screen's top edge is (world y) as it falls. */
export const fallEdge = (state: GameState, F: Finale) => { const top = state.camera.y - 40; return top + (GY + 30 - top) * F.fall; };
/** Draw the cartoon (`cartoon`) as the screen coming down over the real stage (already drawn): clipped below the falling
 *  edge, squashed down into it, and the cloth's rolled top edge. */
export const drawFalling = (c: Ctx, state: GameState, F: Finale, cartoon: () => void) => {
  const edge = fallEdge(state, F), top = state.camera.y - 40, k = Math.max(0.02, (GY + 30 - edge) / (GY + 30 - top));
  c.save();
  c.beginPath(); c.rect(state.camera.x - 20, edge, CANVAS_WIDTH + 40, GY + 200 - edge); c.clip();
  c.translate(0, GY + 30); c.scale(1, k); c.translate(0, -(GY + 30));
  cartoon();
  c.restore();
  // (the cloth's edge: the screen's top batten, its rolled hem folding over in steps, grommets and the ties torn off them,
  // the cloth's raw back showing gray under the picture)
  const x0 = state.camera.x - 20, x1 = state.camera.x + CANVAS_WIDTH + 20, CL = ['#8A8696', '#B9B5C2', '#D8D6DE', '#ECEAF0', '#FFFFFF'];
  const hem = (dy: number, amp: number, col: string) => { c.fillStyle = col; c.beginPath(); c.moveTo(x0, edge + 18); c.lineTo(x0, edge + 8 + dy); for (let x = x0; x <= x1; x += 40) c.quadraticCurveTo(x + 20, edge - amp + dy - Math.sin(x * 0.05 + F.t * 0.3) * 4, x + 40, edge + 6 + dy); c.lineTo(x1, edge + 18); c.closePath(); c.fill(); };
  hem(-2, 8, INK); hem(0, 6, CL[1]); hem(2, 4, CL[2]); hem(4, 2, CL[3]);
  c.fillStyle = CL[0]; c.fillRect(x0, edge + 14, x1 - x0, 4);
  c.fillStyle = INK; c.fillRect(x0, edge + 18, x1 - x0, 6); c.fillStyle = '#5A4A3A'; c.fillRect(x0, edge + 19, x1 - x0, 4); c.fillStyle = '#7A6A5A'; c.fillRect(x0, edge + 19, x1 - x0, 1);
  for (let x = Math.floor(x0 / 60) * 60; x < x1; x += 60) { c.fillStyle = INK; c.beginPath(); c.arc(x, edge + 10, 3, 0, Math.PI * 2); c.fill(); c.fillStyle = '#C8CCD4'; c.beginPath(); c.arc(x, edge + 10, 2, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#2A2830'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, edge + 8); c.lineTo(x + 3, edge - 6 - (x % 120 ? 4 : 0)); c.stroke(); }
};
/** The shake: the cartoon judders (the screen going). */
export const shakeOffset = (state: GameState, F: Finale | null) => (F && F.step === 'shake' ? { x: (Math.random() - 0.5) * 6, y: (Math.random() - 0.5) * 4 } : null);

/** Over him (world): the projector's beam, the projected cat on him, slipping off; the TV; the cutscene's words. */
export const drawFinaleFront = (c: Ctx, state: GameState) => {
  const s = wh2Of(state), F = s.finale, p = state.player;
  if (!F) return;
  if (F.step !== 'done') drawTv(c, state, F);
  const tvB = tvBox(F);
  if (tvSaid.bill && F.talking === 'bill') saidOver(c, tvSaid.bill, tvB.x + 60, tvB.y - 18, '#BFDBFE', 260);
  if (tvSaid.hillary && F.talking === 'hillary') saidOver(c, tvSaid.hillary, tvB.x + tvB.w - 60, tvB.y - 18, '#FBCFE8', 260);
  if (F.step === 'catslip' || (F.step === 'fall' && F.beam > 0)) {
    // (the beam: from the lens up on the truss down onto him, the cartoon's colors in it)
    const lx = RIG_X + 60, ly = GY - 410, px = p.pos.x + p.width / 2, py = p.pos.y + p.height / 2;
    c.save(); c.globalCompositeOperation = 'lighter';
    const g = c.createLinearGradient(lx, ly, px, py); g.addColorStop(0, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(167,139,250,0.12)');
    c.fillStyle = g; c.beginPath(); c.moveTo(lx, ly - 6); c.lineTo(px + 70, py - 70); c.lineTo(px + 70, py + 60); c.lineTo(px - 70, py + 60); c.lineTo(lx, ly + 6); c.closePath(); c.fill();
    c.restore();
    // (the cat painted on him, flickering, its colors split; sliding off sideways)
    const k = F.slip, flick = (state.frame >> 1) % 7 === 0 ? 0.35 : 0.85;
    const dx = k * k * 140, jit = (Math.random() - 0.5) * 3;
    c.save(); c.globalAlpha = flick * (1 - k * 0.7);
    if (k > 0) c.filter = 'saturate(1.8) hue-rotate(10deg)';
    c.translate(dx + jit, k * 16);
    const clone = { ...p, catForm: true, hidden: false, inCutscene: true };
    drawPlayer(c, clone, state, { currentWeapon: p.currentWeapon as WeaponType, showFilthShield: false, invincibilityEnabled: false });
    c.restore();
    // (scan lines over it)
    c.fillStyle = 'rgba(0,0,0,0.25)'; for (let y = p.pos.y - 20; y < p.pos.y + p.height + 10; y += 3) c.fillRect(p.pos.x - 30 + dx, y, p.width + 60, 1);
  }
};
/** Screen space: the letterbox, SKIP >>. */
export const drawFinaleHud = (c: Ctx, state: GameState) => {
  const F = wh2Of(state).finale;
  if (!F || F.step === 'done') return;
  const k = Math.min(1, F.all / 24), bh = Math.round(36 * k * k * (3 - 2 * k));
  c.fillStyle = '#05030A'; c.fillRect(0, 0, CANVAS_WIDTH, bh); c.fillRect(0, CANVAS_HEIGHT - bh, CANVAS_WIDTH, bh);
  if (F.all > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
};

/** The lighting: none while it's the cartoon; the projector's beam on him in the dark as the screen's down; then the
 *  work lights coming up (and after, the real stage's: soft, all over; the exit sign red). */
export const finaleLight = (state: GameState, base: Light[]) => {
  const F = wh2Of(state).finale, p = state.player, px = p.pos.x + p.width / 2, py = p.pos.y + p.height / 2;
  const work = F && F.step !== 'done' ? F.work : 1, beam = F && F.step !== 'done' ? F.beam : 0;
  const lights: Light[] = base.map(l => ({ ...l, a: l.a * work }));
  if (beam > 0) { lights.push({ x: px, y: py, r: 170, a: 0.95 * beam, color: '#C4B5FD' }); lights.push({ x: RIG_X + 60, y: GY - 410, r: 60, a: 0.9 * beam, color: '#FFFFFF' }); }
  lights.push({ x: px, y: p.pos.y + 10, r: 150, a: 0.35 });
  return { dark: 0.66 - 0.22 * work, shade: [10, 9, 14] as [number, number, number], rim: 0.5, lights };
};
export { NEWT_ARENA, OVAL_WALL };
