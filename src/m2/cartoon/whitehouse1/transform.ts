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
import { drawPlayerSpeech } from '../../../m1/game/render/world';
import { hands, meatheadSays, byPants } from '../section';
import { INK, type Ctx } from '../kit';
import { whOf, CAT_MEMO, type Scene } from './state';
import { ERASED, REDRAWN, CHELSEA_INTRO, CHELSEA_INTRO2, SHUT_UP_FIRST, REDRAWN_AGAIN } from './lines';
import { chelseaSays, placeChelsea, scripted, chelseaTo, setChelseaPose } from './chelsea';
import { X, Y } from './layout';
import { toonPart, toonFlat, type Rp } from './punditArt';
import { GY } from '../geometry';
import { whMust } from './onceLines';
import { dith } from '../amphi/paint';

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
  meatheadSays(state, whMust(byPants(state, REDRAWN_AGAIN)), false);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

// THE ANIMATOR'S ARM (the user: "make it look like a hand coming onto the canvas from the fourth wall, not a small
// hovering arm, but a full arm for erasing and drawing. like the game canvas is an art canvas"): drawn in screen space
// over everything, the letterbox too, because it's on OUR side of the picture: a real man's arm leaning in over the
// paper from where he sits, off the bottom right corner, shoulder to fingertips, huge (foreshortened toward us: the
// shoulder biggest), a rolled-up work shirt sleeve, a hairy forearm, a wristwatch, the hand round a fat pink eraser or
// a yellow pencil; its shadow cast down on the picture under it (it's hovering over the paper). The picture treated as
// paper: eraser crumbs rolling off, a smudge of rubbed graphite where he was, the cat's blue pencil roughs under the
// ink as it goes down.
const HAND: Rp = ['#FCDCC0', '#F2C8A6', '#DCA482', '#BC8462'];
const SLEEVE: Rp = ['#B8CDEE', '#86A6DA', '#5F80B8', '#42608E'];
const ERASER: Rp = ['#FFD2E4', '#F9A8C8', '#E0789E', '#B8507A'];
const PENCIL: Rp = ['#FFF0A0', '#F8C83A', '#D89A1A', '#A86C0A'];
/** Where the arm comes from: its shoulder, off the bottom right corner of the screen. */
const SHOULDER: [number, number] = [CANVAS_WIDTH + 20, CANVAS_HEIGHT + 60];
/** The hand's size over the world's (it's on our side of the picture, nearer than the paper). */
const HS = 1.3;
/** Hand plus tool, wrist to the tool's working end (screen px). */
const REACH = { eraser: 150 * HS, pencil: 176 * HS };

/** A tapered tube a to b (ra to rb) in its ramp, shaded across its length (lit along its top edge, shade and deep
 *  along its underside, dithered seams), inked fat. */
const armTube = (c: Ctx, a: [number, number], b: [number, number], ra: number, rb: number, r: Rp, ink = 3.4) => {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  c.save(); c.translate(a[0], a[1]); c.rotate(ang);
  // (which side's up on screen: the light comes from the top)
  const up = Math.cos(ang) >= 0 ? -1 : 1;
  const path = () => { c.beginPath(); c.moveTo(0, -ra); c.lineTo(L, -rb); c.arc(L, 0, rb, -Math.PI / 2, Math.PI / 2); c.lineTo(0, ra); c.arc(0, 0, ra, Math.PI / 2, Math.PI * 1.5); c.closePath(); };
  path(); c.fillStyle = r[1]; c.fill();
  c.save(); c.clip();
  const R = Math.max(ra, rb) + 2, band = (a0: number, a1: number, col: string | CanvasPattern) => { c.fillStyle = col; const y0 = up * a0 * R, y1 = up * a1 * R; c.fillRect(-R, Math.min(y0, y1), L + 2 * R, Math.abs(y1 - y0)); };
  band(0.62, 1.1, r[0]); band(0.5, 0.62, dith(c, r[0]));
  band(-0.3, -0.42, dith(c, r[2])); band(-0.42, -1.1, r[2]); band(-0.72, -0.82, dith(c, r[3])); band(-0.82, -1.1, r[3]);
  c.restore();
  path(); c.strokeStyle = INK; c.lineWidth = ink; c.lineJoin = 'round'; c.stroke();
  c.restore();
};
/** The animator's arm, screen space: the tool's working end at (tx, ty). */
const animatorArm = (c: Ctx, tx: number, ty: number, tool: 'eraser' | 'pencil', f: number) => {
  const S = SHOULDER, sd = Math.atan2(ty - S[1], tx - S[0]), cs = Math.cos(sd), sn = Math.sin(sd);
  // (the elbow: partway, crooked up over the picture, the forearm and the hand coming down onto the paper from above
  // in one line, the way a man leans over a drawing desk)
  const L = Math.hypot(tx - S[0], ty - S[1]), nx = -sn, ny = cs, sgn = ny <= 0 ? 1 : -1, bow = Math.min(300, L * 0.55);
  const E: [number, number] = [S[0] + (tx - S[0]) * 0.46 + nx * sgn * bow, S[1] + (ty - S[1]) * 0.46 + ny * sgn * bow];
  const dir = Math.atan2(ty - E[1], tx - E[0]), reach = Math.min(REACH[tool], Math.hypot(tx - E[0], ty - E[1]) - 40);
  const Wr: [number, number] = [tx - Math.cos(dir) * reach, ty - Math.sin(dir) * reach];
  // (its shadow first, cast down on the paper under it: off down and right, soft, the whole arm's shape)
  c.save(); c.globalAlpha = 0.22; c.strokeStyle = '#1A1030'; c.lineCap = 'round'; c.lineJoin = 'round';
  const so = 34;
  c.lineWidth = 150; c.beginPath(); c.moveTo(S[0] + so, S[1] + so); c.lineTo(E[0] + so, E[1] + so); c.stroke();
  c.lineWidth = 70; c.beginPath(); c.moveTo(E[0] + so, E[1] + so); c.lineTo(Wr[0] + so, Wr[1] + so); c.stroke();
  c.lineWidth = 56; c.beginPath(); c.moveTo(Wr[0] + so, Wr[1] + so); c.lineTo(tx + so * 0.6, ty + so * 0.6); c.stroke();
  c.restore();
  // (the forearm: bare, hairy, the veins; then the sleeve over the upper arm, rolled up thick at the elbow)
  armTube(c, E, Wr, 40, 27, HAND);
  c.save(); c.translate(E[0], E[1]); c.rotate(Math.atan2(Wr[1] - E[1], Wr[0] - E[0]));
  const fl = Math.hypot(Wr[0] - E[0], Wr[1] - E[1]);
  c.strokeStyle = HAND[3]; c.lineWidth = 1.6;
  for (let k = 0; k < 16; k++) { const x = 30 + ((k * 37) % Math.max(1, fl - 60)), y = -24 + ((k * 13) % 36) * (1 - x / fl * 0.35); c.beginPath(); c.moveTo(x, y); c.lineTo(x + 5, y - 2); c.stroke(); }
  c.strokeStyle = HAND[2]; c.lineWidth = 2; c.beginPath(); c.moveTo(fl * 0.35, 8); c.quadraticCurveTo(fl * 0.6, 2, fl * 0.85, 10); c.stroke();
  c.restore();
  armTube(c, S, E, 118, 66, SLEEVE, 4);
  // (the rolled cuff at the elbow: three fat rolls, each lit on top; a plaid stripe or two across the sleeve)
  c.save(); c.translate(E[0], E[1]); c.rotate(Math.atan2(S[1] - E[1], S[0] - E[0]));
  for (let k = 0; k < 3; k++) armTube(c, [6 + k * 18, 0], [6 + k * 18 + 1, 0], 70 + k * 6, 70 + k * 6, k === 1 ? SLEEVE : [SLEEVE[0], SLEEVE[0], SLEEVE[1], SLEEVE[2]], 3);
  c.restore();
  c.save(); c.translate(S[0], S[1]); c.rotate(Math.atan2(E[1] - S[1], E[0] - S[0]));
  const ul = Math.hypot(E[0] - S[0], E[1] - S[1]);
  c.globalAlpha = 0.35; c.fillStyle = '#2E4A80';
  for (let k = 1; k < 4; k++) c.fillRect(ul * 0.18 * k, -110 + k * 6, 6, 220 - k * 12);
  c.globalAlpha = 1;
  c.restore();
  // (the wristwatch: a leather strap round the wrist, the gold case, the face, its hands going)
  c.save(); c.translate(Wr[0], Wr[1]); c.rotate(dir); c.scale(HS, HS);
  toonPart(c, () => c.roundRect(-14, -30, 20, 60, 6), ['#7A5A3A', '#523A22', '#3A2814', '#24180A'], -14, 6, 2.6);
  toonPart(c, () => c.arc(-4, -10, 14, 0, Math.PI * 2), ['#FFF0A8', '#F2C84A', '#D09A30', '#A06C1C'], -18, 10, 2.6);
  toonFlat(c, () => c.arc(-4, -10, 10, 0, Math.PI * 2), '#FFFDF2', 1.4);
  c.strokeStyle = INK; c.lineWidth = 1.8; c.beginPath(); c.moveTo(-4, -10); c.lineTo(-4 + Math.cos(f * 0.08) * 7, -10 + Math.sin(f * 0.08) * 7); c.moveTo(-4, -10); c.lineTo(0, -15); c.stroke();
  // (the hand, along the arm's line, the tool out past the fingertips toward the paper)
  if (tool === 'eraser') {
    // (a fat pink eraser block, its working end worn round and gray with graphite, the brand on its side)
    toonPart(c, () => c.roundRect(88, -34, 66, 50, 10), ERASER, 88, 154, 3.4);
    toonFlat(c, () => { c.moveTo(146, -32); c.quadraticCurveTo(160, -9, 146, 14); c.lineTo(140, 14); c.lineTo(140, -32); c.closePath(); }, '#B8A0AC', 2.4);
    c.fillStyle = ERASER[0]; c.fillRect(94, -30, 46, 4);
    c.fillStyle = '#FFFFFF'; c.fillRect(100, -16, 34, 12); c.fillStyle = '#E0789E'; c.fillRect(104, -13, 26, 5);
  } else {
    // (a yellow pencil, hexagonal faces in steps, the shaved wood cone, the graphite point; the pink eraser end and its
    // crimped ferrule back over the hand)
    toonPart(c, () => { c.moveTo(20, -36); c.lineTo(144, -12); c.lineTo(142, 0); c.lineTo(18, -24); c.closePath(); }, PENCIL, 18, 144, 2.6);
    c.strokeStyle = PENCIL[2]; c.lineWidth = 1.4; c.beginPath(); c.moveTo(20, -30); c.lineTo(143, -6); c.stroke();
    toonFlat(c, () => { c.moveTo(144, -12); c.lineTo(176, 2); c.lineTo(142, 0); c.closePath(); }, '#F2D6A8', 2.2);
    toonFlat(c, () => { c.moveTo(166, -2); c.lineTo(176, 2); c.lineTo(165, 3); c.closePath(); }, '#3A3A44', 1.4);
    toonPart(c, () => { c.moveTo(6, -38); c.lineTo(22, -35); c.lineTo(20, -23); c.lineTo(4, -26); c.closePath(); }, ['#F2F2F6', '#C8CCD6', '#9CA2B0', '#6A707E'], 4, 22, 2);
    toonPart(c, () => { c.moveTo(-6, -40); c.lineTo(6, -38); c.lineTo(4, -26); c.lineTo(-8, -28); c.closePath(); }, ERASER, -8, 6, 2);
  }
  // (the back of the hand, the knuckles, the fingers curled round the tool (each lit along its top, a nail), the thumb
  // pinching it from the other side)
  toonPart(c, () => c.roundRect(4, -42, 82, 70, 26), HAND, 4, 86, 3.4);
  c.fillStyle = HAND[0]; c.fillRect(20, -36, 40, 4);
  c.strokeStyle = HAND[3]; c.lineWidth = 2; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(62, -30 + k * 15); c.lineTo(70, -28 + k * 15); c.stroke(); }
  for (let k = 0; k < 4; k++) { const fy = -32 + k * 15; toonPart(c, () => c.roundRect(72, fy, 32, 15, 7), HAND, 72, 104, 2.6); toonFlat(c, () => c.roundRect(94, fy + 3, 8, 8, 3), '#FBE6DA', 1.2); }
  toonPart(c, () => c.roundRect(48, 18, 46, 18, 9), HAND, 48, 94, 2.6);
  toonFlat(c, () => c.roundRect(82, 21, 10, 10, 4), '#FBE6DA', 1.2);
  c.restore();
};

/** Where the tool's working end is (world), and which tool, while the hand's in the picture (or coming, going). */
const toolAt = (state: GameState): { tool: 'eraser' | 'pencil'; x: number; y: number; inK: number } | null => {
  const sc = whOf(state).scene, f = state.frame;
  if (!sc) return null;
  const x = sc.x, feet = sc.y, head = feet - TALL - 8;
  const at = (tool: 'eraser' | 'pencil', line: number) => {
    const inK = Math.min(1, sc.t / IN), out = sc.step === 'blank' ? Math.min(1, sc.t / 18) : sc.step === 'draw' && sc.draw >= 1 ? Math.min(1, (sc.t - IN - DRAW) / OUT) : 0;
    const k = inK * (1 - out), e = k * k * (3 - 2 * k);
    const work = tool === 'eraser' ? [Math.sin(f * 0.55) * 22, Math.cos(f * 1.1) * 3] : [Math.sin(f * 0.4) * 22, Math.sin(f * 1.3) * 2];
    return { tool, x: x + 4 + work[0], y: line + work[1], inK: e };
  };
  if (sc.step === 'erase') return at('eraser', head + (TALL + 12) * sc.erase - 4);
  if (sc.step === 'blank' && sc.t < 20) return at('eraser', feet - 4);
  if (sc.step === 'draw') return at('pencil', head - 12 + (TALL + 34) * sc.draw);
  return null;
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
  // (the smudge of rubbed-out graphite where he was, gray and pink, fading as the cat's drawn in over it)
  const smudge = sc.step === 'erase' ? sc.erase : sc.step === 'blank' ? 1 : sc.step === 'draw' ? Math.max(0, 1 - sc.draw * 1.4) : 0;
  if (smudge > 0) {
    c.save(); c.globalAlpha = 0.28 * smudge;
    const top = sc.step === 'erase' ? head : head;
    const bot = sc.step === 'erase' ? head + (TALL + 12) * sc.erase : feet;
    for (let yy = top; yy < bot; yy += 5) { const w = 22 + Math.sin(yy * 0.37) * 8; c.fillStyle = (yy >> 2) % 3 ? '#7A7480' : '#C890A8'; c.fillRect(x - w + Math.sin(yy * 0.9) * 4, yy, w * 2, 3); }
    c.restore();
  }
  if (sc.step === 'erase' && sc.t > IN) {
    // What's left of him (below the line the eraser's got down to), the rubbed edge ragged
    const cut = head + (TALL + 12) * sc.erase;
    drawHimClipped(c, state, false, cut + Math.sin(f * 0.7) * 2, feet + 20);
    c.fillStyle = 'rgba(249, 168, 200, 0.5)'; for (let k = -3; k <= 3; k++) c.fillRect(x + k * 7 - 2, cut - 1 + ((k + f) % 3), 4, 2);
  }
  if (sc.step === 'draw' && sc.t > IN) {
    // The animator's blue pencil roughs under it (the head's circle, the ears, the line of action, the barrel of a
    // chest, the limbs' sticks, the tail's S), then what's inked of the cat so far (above the pencil's line), the line
    // being laid down along its edge
    const edge = head - 12 + (TALL + 34) * sc.draw;
    c.save(); c.beginPath(); c.rect(x - 80, edge - 2, 160, feet + 20 - edge); c.clip();
    c.strokeStyle = 'rgba(96, 156, 232, 0.75)'; c.lineWidth = 1.2;
    const w = (k: number) => Math.sin(k * 3.1 + 1) * 1.2;
    c.beginPath(); c.arc(x + 3, feet - 61, 12, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(x - 6, feet - 70); c.lineTo(x - 4, feet - 82); c.lineTo(x + 2, feet - 72); c.moveTo(x + 6, feet - 72); c.lineTo(x + 10, feet - 84); c.lineTo(x + 13, feet - 70); c.stroke();
    c.beginPath(); c.ellipse(x + 2, feet - 37, 15, 14, 0.1, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(x + 6 + w(1), feet - 76); c.quadraticCurveTo(x - 4, feet - 40, x + 2, feet - 2); c.stroke();
    c.beginPath(); c.moveTo(x - 4, feet - 22); c.lineTo(x - 6, feet - 10); c.lineTo(x - 5, feet); c.moveTo(x + 5, feet - 22); c.lineTo(x + 9, feet - 11); c.lineTo(x + 7, feet); c.stroke();
    c.beginPath(); c.moveTo(x + 9, feet - 45); c.lineTo(x + 16, feet - 34); c.lineTo(x + 15, feet - 27); c.moveTo(x - 6, feet - 45); c.lineTo(x - 10, feet - 34); c.lineTo(x - 9, feet - 26); c.stroke();
    c.beginPath(); c.moveTo(x - 9, feet - 27); c.bezierCurveTo(x - 24, feet - 24, x - 34, feet - 40, x - 26, feet - 56); c.stroke();
    c.restore();
    drawHimClipped(c, state, true, head - 40, edge);
    if (sc.draw < 1) { c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 26, edge); for (let k = -26; k <= 26; k += 4) c.lineTo(x + k, edge + Math.sin(k * 0.6 + f) * 1.5); c.stroke(); }
  }
};

/** Screen space: the letterbox bars while it's on, SKIP >>. */
export const drawTransformHud = (c: Ctx, state: GameState) => {
  const sc = whOf(state).scene;
  if (!sc) return;
  const k = Math.min(1, sc.all / 24), bh = Math.round(36 * k * k * (3 - 2 * k));
  c.fillStyle = '#05030A'; c.fillRect(0, 0, CANVAS_WIDTH, bh); c.fillRect(0, CANVAS_HEIGHT - bh, CANVAS_WIDTH, bh);
  // (the animator's arm, on our side of the picture: over the letterbox too, slid in from the corner and back out)
  const t = toolAt(state);
  if (t && t.inK > 0) {
    const sx = t.x - state.camera.x, sy = t.y - state.camera.y, e = t.inK;
    animatorArm(c, SHOULDER[0] + (sx - SHOULDER[0]) * e, SHOULDER[1] + (sy - SHOULDER[1]) * e, t.tool, state.frame);
    // (his words never under the arm: put back on top, where they were)
    c.save(); c.translate(-state.camera.x, -state.camera.y); drawPlayerSpeech(c, state); c.restore();
  }
  if (sc.all > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
};
export { Y };
