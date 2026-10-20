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

const SKIN = '#E7B796', WIG = '#E8A15C', WIG_SH = '#C9793A', SWEATER = '#7C5CC4', SKIRT = '#0F766E';
/** The actress (world): a grown woman in the show's Chelsea costume, on her knees, one hand on the floor, being sick. */
export const drawActress = (c: Ctx, state: GameState) => {
  const a = wh2Of(state).actress, f = state.frame;
  if (!a.x || state.stageMemo[ACTRESS_GONE_MEMO]) return;
  const x = a.x, y = a.y, h = a.heave > 0, lurch = h ? Math.sin(f * 0.6) * 2 : Math.sin(f * 0.05);
  // (the puddle in front of her, growing)
  c.fillStyle = '#9C8C3A'; c.beginPath(); c.ellipse(x + 44, y, 26 + a.puddle * 40, 4 + a.puddle * 2, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#CFC066'; c.beginPath(); c.ellipse(x + 40, y - 1, 16 + a.puddle * 26, 2.5, 0, 0, Math.PI * 2); c.fill();
  c.save(); c.translate(x, y);
  // (kneeling: the shins flat on the floor behind, white knee socks, black shoes)
  box(c, -34, -8, 30, 8, '#F1F5F9'); box(c, -42, -9, 10, 7, '#111827');
  box(c, -8, -24, 14, 18, SKIN);
  // (the plaid skirt, the thighs under it)
  c.fillStyle = SKIRT; c.beginPath(); c.moveTo(-14, -18); c.lineTo(12, -18); c.lineTo(16, -34); c.lineTo(-10, -38); c.closePath(); c.fill();
  c.fillStyle = '#FACC15'; c.fillRect(-8, -30, 18, 1); c.fillStyle = '#DC2626'; c.fillRect(-4, -36, 1, 18); c.fillRect(6, -34, 1, 16);
  // (the body bent over, the purple sweater (stained), the big white collar)
  c.save(); c.translate(0, -36 + lurch * 0.5); c.rotate(0.85 + (h ? 0.12 : 0));
  c.fillStyle = SWEATER; c.beginPath(); c.roundRect(-10, -30, 22, 32, 6); c.fill();
  c.fillStyle = '#5E44A0'; c.fillRect(-10, -6, 22, 4);
  c.fillStyle = '#F8FAFC'; c.beginPath(); c.moveTo(-10, -30); c.quadraticCurveTo(0, -22, 12, -30); c.lineTo(10, -34); c.lineTo(-8, -34); c.closePath(); c.fill();
  c.fillStyle = '#B9A548'; c.fillRect(-2, -26, 8, 3); c.fillRect(2, -20, 5, 2);
  c.restore();
  // (the arm braced on the floor)
  c.strokeStyle = SWEATER; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(14, -46); c.lineTo(22, -4); c.stroke(); c.lineCap = 'butt';
  c.fillStyle = SKIN; c.beginPath(); c.ellipse(24, -2, 5, 3, 0, 0, Math.PI * 2); c.fill();
  // (the head down over the puddle: the wig half off, her own dark hair in its cap, the pink headband askew, the stage
  // makeup smeared, freckles drawn on, the mouth open, retching)
  const hx = 26, hy = -46 + lurch;
  c.fillStyle = '#3B2A22'; c.beginPath(); c.ellipse(hx - 4, hy - 6, 11, 9, 0.4, 0, Math.PI * 2); c.fill();
  c.fillStyle = SKIN; c.beginPath(); c.ellipse(hx, hy, 10, 11, 0.5, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#E88A8A'; c.beginPath(); c.ellipse(hx + 3, hy + 2, 3.5, 2, 0.4, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#B5652E'; for (const [dx, dy] of [[1, -1], [4, 0], [6, 1], [3, 2]]) c.fillRect(hx + dx, hy + dy, 1, 1);
  c.fillStyle = '#1F1A2E'; c.fillRect(hx + 1, hy - 5, 4, 1.5); c.fillRect(hx + 2, hy - 2, 1, 4); c.fillRect(hx + 3, hy - 1, 1, 6);
  c.fillStyle = '#3F0606'; c.beginPath(); c.ellipse(hx + 7, hy + 7, 3, h ? 4 : 2, 0.4, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#E5E7EB'; c.fillRect(hx + 5, hy + 5, 4, 1);
  for (const [dx, dy, r] of [[-12, -14, 6], [-16, -6, 6], [-10, -20, 5], [-4, -18, 5], [-18, 2, 5]] as [number, number, number][]) { c.fillStyle = WIG_SH; c.beginPath(); c.arc(hx + dx - 6, hy + dy + 4, r, 0, Math.PI * 2); c.fill(); c.fillStyle = WIG; c.beginPath(); c.arc(hx + dx - 7, hy + dy + 3, r * 0.65, 0, Math.PI * 2); c.fill(); }
  c.strokeStyle = '#F472B6'; c.lineWidth = 3; c.beginPath(); c.arc(hx - 8, hy - 4, 12, Math.PI * 1.2, Math.PI * 1.75); c.stroke();
  // (the stream, while she heaves)
  if (h) { c.strokeStyle = '#CFC066'; c.lineWidth = 4; c.beginPath(); c.moveTo(hx + 8, hy + 8); c.quadraticCurveTo(hx + 18, hy + 20, hx + 20, -2); c.stroke(); c.strokeStyle = '#E2D27A'; c.lineWidth = 1.5; c.stroke(); }
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
const inkd = (c: Ctx, path: () => void, fill: string, w = 2.4) => { c.beginPath(); path(); c.fillStyle = fill; c.fill(); c.lineJoin = 'round'; c.strokeStyle = INK; c.lineWidth = w; c.stroke(); };
const drawBill = (c: Ctx, x: number, y: number, talk: boolean, f: number) => {
  inkd(c, () => { c.moveTo(x - 30, y + 60); c.quadraticCurveTo(x - 30, y + 18, x, y + 16); c.quadraticCurveTo(x + 30, y + 18, x + 30, y + 60); c.closePath(); }, '#1E3A8A');
  inkd(c, () => { c.moveTo(x - 4, y + 18); c.lineTo(x + 4, y + 18); c.lineTo(x + 2, y + 44); c.lineTo(x - 2, y + 44); c.closePath(); }, '#DC2626', 1.4);
  inkd(c, () => c.ellipse(x, y - 4, 19, 21, 0, 0, Math.PI * 2), '#F6C3AA');
  // (the big puffy gray hair, the big red nose, the grin)
  inkd(c, () => { c.moveTo(x - 20, y - 4); c.quadraticCurveTo(x - 26, y - 34, x, y - 32); c.quadraticCurveTo(x + 26, y - 34, x + 20, y - 4); c.quadraticCurveTo(x + 12, y - 20, x, y - 20); c.quadraticCurveTo(x - 12, y - 20, x - 20, y - 4); c.closePath(); }, '#CBD5E1');
  for (const ex of [-7, 7]) { c.fillStyle = INK; c.beginPath(); c.arc(x + ex, y - 6, 2, 0, Math.PI * 2); c.fill(); }
  inkd(c, () => c.ellipse(x, y + 2, 7, 6, 0, 0, Math.PI * 2), '#E05A5A', 2);
  const open = talk ? [2, 6, 3, 7][(f >> 2) % 4] : 3;
  inkd(c, () => c.ellipse(x, y + 11, 9, open / 2 + 1, 0, 0, Math.PI * 2), '#7F1D1D', 1.6); c.fillStyle = '#FFFFFF'; c.fillRect(x - 6, y + 9, 12, 1.5);
  // (the thumbs up)
  inkd(c, () => c.roundRect(x + 30, y + 22 - (talk ? (f >> 4) % 2 * 3 : 0), 12, 12, 3), '#F6C3AA', 1.8);
  inkd(c, () => c.roundRect(x + 33, y + 12 - (talk ? (f >> 4) % 2 * 3 : 0), 5, 12, 2), '#F6C3AA', 1.6);
};
const drawHillary = (c: Ctx, x: number, y: number, talk: boolean, f: number) => {
  inkd(c, () => { c.moveTo(x - 26, y + 60); c.quadraticCurveTo(x - 26, y + 18, x, y + 16); c.quadraticCurveTo(x + 26, y + 18, x + 26, y + 60); c.closePath(); }, '#F472B6');
  c.fillStyle = '#FFFFFF'; for (let k = -3; k <= 3; k++) { c.beginPath(); c.arc(x + k * 4, y + 21 + Math.abs(k), 2, 0, Math.PI * 2); c.fill(); }
  inkd(c, () => c.ellipse(x, y - 2, 16, 19, 0, 0, Math.PI * 2), '#F6C3AA');
  // (the blonde bob, the black headband)
  inkd(c, () => { c.moveTo(x - 20, y + 10); c.quadraticCurveTo(x - 24, y - 30, x, y - 26); c.quadraticCurveTo(x + 24, y - 30, x + 20, y + 10); c.lineTo(x + 14, y + 10); c.quadraticCurveTo(x + 14, y - 10, x, y - 14); c.quadraticCurveTo(x - 14, y - 10, x - 14, y + 10); c.closePath(); }, '#FDE68A');
  c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.arc(x, y - 6, 18, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
  for (const ex of [-6, 6]) { c.fillStyle = INK; c.beginPath(); c.arc(x + ex, y - 3, 2, 0, Math.PI * 2); c.fill(); }
  const open = talk ? [2, 6, 3, 7][(f >> 2) % 4] : 2;
  inkd(c, () => c.ellipse(x, y + 9, 7, open / 2 + 1, 0, 0, Math.PI * 2), '#BE185D', 1.6); c.fillStyle = '#FFFFFF'; c.fillRect(x - 5, y + 7, 10, 1.5);
};
/** The TV (world, over the set): its arm, the cabinet, the screen: the Clintons at the UN; snow; off. */
const drawTv = (c: Ctx, state: GameState, F: Finale) => {
  if (F.tv <= 0) return;
  const B = tvBox(F), f = state.frame;
  c.strokeStyle = INK; c.lineWidth = 8; c.beginPath(); c.moveTo(TV_X, TV_TOP); c.lineTo(TV_X, B.y); c.stroke(); c.strokeStyle = '#9CA3AF'; c.lineWidth = 4; c.stroke();
  inkd(c, () => c.roundRect(B.x - 14, B.y - 12, B.w + 28, B.h + 24, 14), '#7C4A1E', 4);
  for (let k = 0; k < 3; k++) box(c, B.x + B.w + 2, B.y + 20 + k * 22, 8, 8, '#E2B33C');
  const off = F.step === 'tvoff' && F.t > 30 || ['shake', 'fall'].includes(F.step);
  c.save(); c.beginPath(); c.roundRect(B.x, B.y, B.w, B.h, 12); c.clip();
  if (off) box(c, B.x, B.y, B.w, B.h, '#111827');
  else if (F.step === 'tvoff' || F.step === 'tvdown' && F.t < 54) { for (let y = B.y; y < B.y + B.h; y += 3) for (let x = B.x; x < B.x + B.w; x += 6) box(c, x, y, 6, 3, ((x * 7 + y * 13 + f * 31) % 97) < 48 ? '#E5E7EB' : '#4B5563'); }
  else {
    // (the UN: a blue wall, the laurels, a banner; Bill and Hillary in front)
    box(c, B.x, B.y, B.w, B.h, '#60A5FA');
    c.strokeStyle = '#F8FAFC'; c.lineWidth = 3; c.beginPath(); c.arc(B.x + B.w / 2, B.y + 40, 26, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(B.x + B.w / 2, B.y + 40, 34, Math.PI * 0.6, Math.PI * 1.4); c.stroke(); c.beginPath(); c.arc(B.x + B.w / 2, B.y + 40, 34, -Math.PI * 0.4, Math.PI * 0.4); c.stroke();
    signText(c, 'U.N. SUMMIT', B.x + B.w / 2, B.y + 14, toonLetters(1, ['#FFFFFF', '#FFFFFF', '#FDE68A', '#FDE047']));
    drawBill(c, B.x + 64, B.y + 92, F.talking === 'bill', f);
    drawHillary(c, B.x + B.w - 64, B.y + 94, F.talking === 'hillary', f);
  }
  c.fillStyle = 'rgba(255,255,255,0.15)'; c.fillRect(B.x + 10, B.y + 8, 40, B.h - 16);
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
  // (the cloth's edge: rolled, folding over, a tear down from one corner)
  const x0 = state.camera.x - 20, x1 = state.camera.x + CANVAS_WIDTH + 20;
  c.fillStyle = '#E8E6EC'; c.beginPath(); c.moveTo(x0, edge + 8);
  for (let x = x0; x <= x1; x += 40) c.quadraticCurveTo(x + 20, edge - 6 - Math.sin(x * 0.05 + F.t) * 4, x + 40, edge + 6);
  c.lineTo(x1, edge + 16); c.lineTo(x0, edge + 16); c.closePath(); c.fill();
  c.fillStyle = '#B9B5C2'; c.fillRect(x0, edge + 12, x1 - x0, 4);
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
