// THE TRANSFORMATION (the user's: "suddenly a third hand eraser comes in and erases meathead's sprite, then a pen comes
// in and draws a socks the cat/meathead hybrid of meathead"). A cutscene the first time he's in (no input, no HUD,
// SKIP >> for the lot), in the cartoon White House's entrance hall, him still himself:
//
//   a beat; then the animator's hand (huge, a shirt cuff, from off the top of the picture) comes down with a fat pink
//   eraser and rubs him out, stroke by stroke from the flat-top down, crumbs falling ("HEY. HEY! WHAT THE FUCK?");
//   nothing there a beat; the hand's back with a pen and draws him back in, from the ears down, an ink line along the
//   edge of it as it goes: SOCKS THE CAT / MEATHEAD, the same brute (render/player/catBody.ts); he looks himself over
//   (his line, by the state of him); CHELSEA runs in with her briefing (the user's, near enough) and he tells her to
//   shut up. Then he's the cat (Player.catForm) the whole White House.
//
// Once it's run (CAT_MEMO), a later way in from the studio's a quick scribble back into the cat (the pen zipping over
// him, a puff of ink) and his line, no scene.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import type { WeaponType } from '../../../m1/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine, silenceAll } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { drawPlayer } from '../../../m1/game/render/player/player';
import { hands, meatheadSays, byPants } from '../section';
import { INK, type Ctx } from '../kit';
import { whOf, CAT_MEMO, type Scene } from './state';
import { ERASED, REDRAWN, CHELSEA_INTRO, CHELSEA_INTRO2, SHUT_UP_FIRST, REDRAWN_AGAIN } from './lines';
import { chelseaSays, placeChelsea, scripted, chelseaTo, setChelseaPose } from './chelsea';
import { X, Y } from './layout';
import { GY } from '../geometry';

/** The scene's beats (frames). */
const LOOK = 40, IN = 36, RUB = 100, BLANK = 34, DRAW = 120, OUT = 30;
/** His height, drawn (feet to the top of the flat-top / the cat's ears). */
const TALL = 86;

export const catDone = (state: GameState) => !!state.stageMemo[CAT_MEMO];

const finish = (state: GameState, sc: Scene, skipped: boolean) => {
  if (skipped) silenceAll();
  const p = state.player;
  state.stageMemo[CAT_MEMO] = '1';
  p.catForm = true; p.hidden = false; p.inCutscene = false;
  scripted(state, false);
  if (skipped) placeChelsea(state, sc.x + 90, GY, -1);
  whOf(state).scene = null;
};

/** Each frame: the scene if it's on (or due), the scribble if that's on. Returns the controls (none in the scene). */
export const updateTransform = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, p = state.player, s = whOf(state);
  if (s.scribble > 0) { s.scribble--; if (s.scribble % 4 === 0) playSound('whoosh', 0.25, 14 + (s.scribble % 8)); }
  if (!s.scene) {
    const rx = p.pos.x + p.width / 2 - X(0);
    if (!catDone(state) && rx > 150 && rx < 900 && p.isGrounded && p.health > 0 && !p.inCutscene) {
      s.scene = { t: 0, all: 0, step: 'look', line: 0, erase: 0, draw: 0, x: p.pos.x + p.width / 2, y: p.pos.y + p.height };
      p.inCutscene = true; p.vel.x = 0;
      state.projectiles = state.projectiles.filter(q => q.owner !== 'player');
      for (const e of state.enemies) if (e.health > 0 && Math.abs(e.pos.x - p.pos.x) < 1200) { e.puppet = true; e.pauseTimer = 2; e.vel.x = 0; }
      scripted(state, true); placeChelsea(state, X(1180), GY, -1);
    } else return controls;
  }
  const sc = s.scene!;
  sc.t++; sc.all++;
  p.inCutscene = true; p.vel.x = 0; p.facing = 1;
  for (const e of state.enemies) if (e.puppet) { e.pauseTimer = 2; e.vel.x = 0; }
  if (sc.all > SKIP_AFTER) { offerSkip(); if (takeSkip()) { for (const e of state.enemies) e.puppet = false; finish(state, sc, true); return hands(); } }
  const go = (step: Scene['step']) => { sc.step = step; sc.t = 0; };
  switch (sc.step) {
    case 'look':
      if (sc.t > LOOK) { go('erase'); playSound('whoosh', 0.6, -4); }
      break;
    case 'erase':
      if (sc.t === IN) meatheadSays(state, ERASED[0], true);
      if (sc.t > IN) {
        sc.erase = Math.min(1, (sc.t - IN) / RUB);
        if (sc.t % 9 === 0) playSound('scratch', 0.35, -8 + (sc.t % 18 ? 2 : 0));
        // (crumbs off the eraser)
        if (sc.t % 3 === 0) state.particles.push({ pos: { x: sc.x + (Math.random() - 0.5) * 40, y: sc.y - TALL * (1 - sc.erase) }, vel: { x: (Math.random() - 0.5) * 2, y: 0.5 + Math.random() }, life: 40, color: Math.random() < 0.6 ? '#F9A8C8' : '#9CA3AF', size: 2 + Math.random() * 2, grav: 0.15 } as typeof state.particles[number]);
      }
      p.hidden = sc.t > IN;
      if (sc.erase >= 1 && sc.t > IN + RUB + 10) go('blank');
      break;
    case 'blank':
      p.hidden = true;
      if (sc.t > BLANK) { go('draw'); playSound('whoosh', 0.6, -2); }
      break;
    case 'draw':
      p.hidden = true; p.catForm = true;
      if (sc.t > IN) {
        sc.draw = Math.min(1, (sc.t - IN) / DRAW);
        if (sc.t % 6 === 0) playSound('scratch', 0.25, 10);
      }
      if (sc.draw >= 1 && sc.t > IN + DRAW + OUT) { p.hidden = false; go('chelsea'); sc.line = 1; meatheadSays(state, pickLine(byPants(state, REDRAWN)), true, () => { sc.line = 2; }); }
      break;
    case 'chelsea': {
      p.hidden = false; p.catForm = true;
      // (she runs in from the far side, stops by him, briefs him; he tells her to shut up)
      const there = chelseaTo(state, sc.x + 90, 5);
      if (there) { setChelseaPose(state, sc.line >= 3 && sc.line < 5 ? 'wag' : 'stand'); }
      if (sc.line === 2 && there) { sc.line = -1; chelseaSays(state, CHELSEA_INTRO[0], () => { sc.line = 3; }); }
      if (sc.line === 3) { sc.line = -1; chelseaSays(state, pickLine(byPants(state, CHELSEA_INTRO2)), () => { sc.line = 4; }); }
      if (sc.line === 4) { sc.line = -1; meatheadSays(state, pickLine(byPants(state, SHUT_UP_FIRST)), true, () => { sc.line = 5; }); }
      if (sc.line === 5 || sc.t > 1400) { for (const e of state.enemies) e.puppet = false; finish(state, sc, false); }
      break;
    }
  }
  return hands();
};

/** A later way in (been redrawn before): straight into the cat, a scribble over him, his line. */
export const scribbleIn = (state: GameState) => {
  whOf(state).scribble = 26;
  playSound('poof', 0.6, 6);
  meatheadSays(state, pickLine(byPants(state, REDRAWN_AGAIN)), false);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** The animator's hand, off the top of the picture: its fingertips (where it holds the tool) at (x, y), what it holds. */
const animatorHand = (c: Ctx, x: number, y: number, tool: 'eraser' | 'pen', f: number) => {
  c.save(); c.translate(x, y); c.rotate(-0.5);
  // (the arm up and off the picture: a rolled-up shirt sleeve over the forearm)
  const ink = (path: () => void, fill: string, w = 3) => { c.beginPath(); path(); c.fillStyle = fill; c.fill(); c.lineJoin = 'round'; c.strokeStyle = INK; c.lineWidth = w; c.stroke(); };
  ink(() => c.roundRect(4, -260, 46, 220, 18), '#F2C8A6');
  ink(() => c.roundRect(-2, -300, 58, 120, 10), '#F8FAFC');
  c.strokeStyle = '#CBD5E1'; c.lineWidth = 2; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(0, -200 + k * 8); c.lineTo(54, -204 + k * 8); c.stroke(); }
  // (the tool, held in the fingers)
  if (tool === 'eraser') {
    ink(() => c.roundRect(-16, -14, 54, 26, 6), '#F9A8C8');
    c.fillStyle = '#FBCFE8'; c.fillRect(-12, -10, 46, 5);
    c.fillStyle = '#F472B6'; c.fillRect(-16, 4, 54, 4);
  } else {
    ink(() => { c.moveTo(-6, 0); c.lineTo(46, -10); c.lineTo(50, 4); c.lineTo(-2, 12); c.closePath(); }, '#1E3A8A');
    ink(() => { c.moveTo(-6, 0); c.lineTo(-24, 10); c.lineTo(-2, 12); c.closePath(); }, '#D4D4D8', 2);
    c.fillStyle = INK; c.beginPath(); c.arc(-22, 10, 2.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#FACC15'; c.fillRect(30, -8, 4, 16);
  }
  // (the hand: the palm and the fingers wrapped round it, a thumb over the top, knuckles)
  ink(() => c.roundRect(0, -46, 52, 46, 16), '#F2C8A6');
  for (let k = 0; k < 4; k++) ink(() => c.roundRect(2 + k * 12, -12, 12, 22, 6), '#F2C8A6', 2.4);
  ink(() => c.roundRect(-8, -34, 26, 14, 7), '#F2C8A6', 2.4);
  c.fillStyle = '#D9A07C'; for (let k = 0; k < 4; k++) c.fillRect(6 + k * 12, -14, 4, 2);
  void f;
  c.restore();
};

/** Him, drawn clipped (the scene's): what's left of him being rubbed out, or what's drawn of the cat so far. */
const drawHimClipped = (c: Ctx, state: GameState, cat: boolean, top: number, bottom: number) => {
  const p = state.player;
  c.save();
  c.beginPath(); c.rect(p.pos.x - 120, top, p.width + 240, bottom - top); c.clip();
  const clone = { ...p, hidden: false, catForm: cat, inCutscene: true };
  drawPlayer(c, clone, state, { currentWeapon: p.currentWeapon as WeaponType, showFilthShield: false, invincibilityEnabled: false });
  c.restore();
};

/** The scene and the scribble (world space: over everything). */
export const drawTransform = (c: Ctx, state: GameState) => {
  const s = whOf(state), sc = s.scene, f = state.frame, p = state.player;
  if (s.scribble > 0) {
    // (the pen zipping over him: loops of ink, a puff)
    const k = 1 - s.scribble / 26, cx = p.pos.x + p.width / 2, top = p.pos.y - 10;
    c.strokeStyle = INK; c.lineWidth = 2.5; c.beginPath();
    for (let i = 0; i <= 24 * Math.min(1, k * 1.3); i++) { const t = i / 24, x = cx + Math.sin(t * 19) * 26, y = top + t * (p.height + 10); if (i) c.lineTo(x, y); else c.moveTo(x, y); }
    c.stroke();
  }
  if (!sc) return;
  const x = sc.x, feet = sc.y, head = feet - TALL - 8;
  if (sc.step === 'erase' && sc.t > IN) {
    // What's left of him (below the line the eraser's got down to), the rubbed edge ragged
    const cut = head + (TALL + 12) * sc.erase;
    drawHimClipped(c, state, false, cut + Math.sin(f * 0.7) * 2, feet + 20);
    c.fillStyle = 'rgba(249, 168, 200, 0.5)'; for (let k = -3; k <= 3; k++) c.fillRect(x + k * 7 - 2, cut - 1 + ((k + f) % 3), 4, 2);
  }
  if (sc.step === 'draw' && sc.t > IN) {
    // What's drawn of the cat so far (above the pen's line), an ink line along the edge
    const edge = head - 12 + (TALL + 34) * sc.draw;
    drawHimClipped(c, state, true, head - 40, edge);
    if (sc.draw < 1) { c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 26, edge); for (let k = -26; k <= 26; k += 4) c.lineTo(x + k, edge + Math.sin(k * 0.6 + f) * 1.5); c.stroke(); }
  }
  // The hand: in from off the top, rubbing back and forth (the eraser) / zigzagging along the line (the pen), back out
  const handAt = (tool: 'eraser' | 'pen', k: number, line: number) => {
    const inK = Math.min(1, sc.t / IN), out = sc.step === 'blank' ? Math.min(1, sc.t / 18) : sc.step === 'draw' && sc.draw >= 1 ? Math.min(1, (sc.t - IN - DRAW) / OUT) : 0;
    const rub = tool === 'eraser' ? Math.sin(f * 0.55) * 24 : Math.sin(f * 0.4) * 22;
    const hx = x + 10 + (inK < 1 ? (1 - inK) * 260 : rub) + out * 260, hy = (inK < 1 ? line - (1 - inK) * 380 : line) - out * 380;
    animatorHand(c, hx, hy, tool, f);
    void k;
  };
  if (sc.step === 'erase') handAt('eraser', sc.erase, head + (TALL + 12) * sc.erase - 4);
  if (sc.step === 'blank' && sc.t < 20) handAt('eraser', 1, feet - 4);
  if (sc.step === 'draw') handAt('pen', sc.draw, head - 12 + (TALL + 34) * sc.draw);
};

/** Screen space: the letterbox bars while it's on, SKIP >>. */
export const drawTransformHud = (c: Ctx, state: GameState) => {
  const sc = whOf(state).scene;
  if (!sc) return;
  const k = Math.min(1, sc.all / 24), bh = Math.round(36 * k * k * (3 - 2 * k));
  c.fillStyle = '#05030A'; c.fillRect(0, 0, CANVAS_WIDTH, bh); c.fillRect(0, CANVAS_HEIGHT - bh, CANVAS_WIDTH, bh);
  if (sc.all > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
};
export { Y };
