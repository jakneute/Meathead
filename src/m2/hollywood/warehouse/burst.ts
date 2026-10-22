// THE BURST-IN (the coaster's launch: section.ts takeBurstIn), the user's playtest notes: he comes in through the
// CEILING (only the roof: the launch drops him through it). Out of the white of the flight, the dim of a secret shoot
// (the sets lit, the crew stood about, the director by his monitors), the PRODUCER laying down the law to the cast and
// crew (no phones; tell anybody and he sends an assassin to your home); he looks up at the noise; the roof bursts, the
// throne-train and him come down through it, the train lands on the producer (flat, the blood out from under it: there
// for good), he lands on his feet. Then, one at a time: the director (a member of the public on
// his secret set: they're shooting REVENGERS: END-OF-THE-WORLD'S-DAY here, at Happy Land of all places, for the tax
// write-off, and nobody can know), him (no idea what the fuss is), the director again (everybody knows this movie),
// him (never heard of it), the director (it's a secret; Area 51), the director thinking it over (bribe him or kill
// him?)... and while he's still thinking, the walls all come down flat, outward. The public, outside, staring in over
// them, phones up. KILL THEM ALL! THEY CANNOT KNOW!: the crew in the background run out over the fallen walls at the
// public (a brawl along the back from then on); the foreground crew come at him (the section's enemies). His shrug.
// A cutscene: HUD hidden, one speaker at a time, SKIP >> for the lot.
//
// Launched in again later (the lever's still on): the walls already down; he drops in through his own hole, a line, on.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Enemy, EnemyKind } from '../../../m1/types';
import type { Controls } from '../../../m1/game/platform/input';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine, silenceAll } from '../../../m1/game/platform/speech';
import { shakeScreen } from '../../../m1/game/core/state';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { hands, meatheadSays, takeBurstIn, box, COASTER_LAUNCHED_MEMO } from '../section';
import { lookOf } from '../../adventure/temple/people';
import { X, GY, x0, ROOF_Y, BACK_Y, WALLS_MEMO } from './layout';
import { whOf } from './state';
import { BURST, BURST_WHAT, BURST_NEVER, BACK_AGAIN, CROWD_GASP, DIR_WHO, DIR_TITLE, DIR_SECRET, DIR_PONDER, DIR_KILL, PROD_RULES, PROD_ASSASSIN } from './lines';
import { crowdSay, dirSay, prodSay } from './talk';
import { drawDirector } from './kindArt';
import { INK as KINK, stamp, signText, checker, pixelBlob, hash, poly } from '../blvd/kit';
import { bodyOf, legs, arm, torso, part, px, dk, headShape, faceOn } from '../../spooky/costume';

/** Where the wreck comes down (its middle), where he lands, where the director stands (x from the section's start). */
export const WRECK_X = 380;
const LAND_X = 470, DIR_X = 600;
/** The producer: under the wreck's left end (where it comes down on him). */
export const PROD_X = 300;
/** Not yet: the roof's far off while the producer's talking. */
const LATER = 1e9;
/** The hole the train made in the roof (x from the section's start): there for good. */
export const ROOF_HOLE = { a: 250, b: 520 } as const;
export const wallsDown = (state: GameState) => !!state.stageMemo[WALLS_MEMO];
/** The director's a man (his voice is): the first man's seed. */
const DIR_SEED = [5, 7, 9, 11, 13, 15, 17, 19, 21].find(s => !lookOf(s).woman) ?? 5;
const CAM = { x: x0 - 40, y: GY - 550 };
/** Up at the roof for the crash (it's off the top of the usual view), down with him as he falls (ct: frames since the
 *  roof went; before it, on the set with the producer). */
const ROOF_CAM = GY - 720;
const camY = (ct: number) => { if (ct < 0) return CAM.y; const k = Math.max(0, Math.min(1, (ct - 10) / 40)); return ROOF_CAM + (CAM.y - ROOF_CAM) * k * k * (3 - 2 * k); };
/** The roof's gone (the burst-in on: once it's burst; for good after). */
export const roofHoled = (state: GameState) => { const b = whOf(state).burst; return b.on ? b.t >= b.c0 : wallsDown(state); };

/** The director, as a person to draw (not on the engine's list: the scene's). */
const dirPuppet = new WeakMap<object, Enemy>();
const puppetOf = (state: GameState) => {
  let e = dirPuppet.get(state.stage as object);
  if (!e) { e = makeKindEnemy('m2:hww_director' as EnemyKind, X(DIR_X), GY); e.initialX = DIR_SEED; e.variant = 0; dirPuppet.set(state.stage as object, e); }
  return e;
};

/** The crew in the background, out at the public (the burst-in's KILL THEM ALL). */
const sendRunners = (state: GameState) => {
  const b = whOf(state).burst;
  if (b.runners.length) return;
  for (let k = 0; k < 7; k++) b.runners.push({ x: x0 + 40 + k * 105 + ((k * 37) % 40), seed: 300 + k * 13, t: 0, at: k * 6 });
};

const done = (state: GameState, skipped: boolean) => {
  const b = whOf(state).burst, p = state.player;
  if (skipped) silenceAll();
  b.on = false; b.fall = 1; b.falling = -1; b.tx = X(WRECK_X); b.ty = GY; b.tv = 0; b.tilt = 1; b.landed = true;
  b.dir.mode = 'gone'; b.dir.said = null;
  if (b.prod.mode !== 'dead') b.prod.at = state.frame - 999;
  b.prod.mode = 'dead'; b.prod.said = null; b.c0 = Math.min(b.c0, b.t);
  whOf(state).crowd = null;
  sendRunners(state);
  state.stageMemo[WALLS_MEMO] = '1';
  if (p.carried || p.pos.y + p.height < GY - 2) { p.pos.x = X(LAND_X) - p.width / 2; p.pos.y = GY - p.height; p.vel.x = 0; p.vel.y = 0; }
  p.carried = false; p.spriteRot = 0;
  p.inCutscene = false;
  state.cameraOverride = null;
};

/** The coaster's just put him here flying (once a launch): the burst-in, or (the walls already down) just a drop in.
 *  (Belt and braces: launched, in here, the walls still up and no burst-in running, however he got here: it runs.) */
export const takeLaunch = (state: GameState) => {
  const o = whOf(state), b = o.burst, p = state.player;
  const launched = takeBurstIn();
  const missed = !launched && !b.on && !!state.stageMemo[COASTER_LAUNCHED_MEMO] && !wallsDown(state) && p.health > 0;
  if (!launched && !missed) return;
  p.carried = false; p.cartSeat = false; p.inCutscene = false; p.spriteRot = 0; p.hidden = false;
  if (wallsDown(state)) {
    // (down through his own hole in the roof)
    p.pos.x = X(LAND_X) - p.width / 2; p.pos.y = ROOF_Y - 60 - p.height; p.vel.x = 1; p.vel.y = 6;
    state.camera.x = CAM.x; state.camera.y = CAM.y;
    meatheadSays(state, pickLine(BACK_AGAIN), false);
    return;
  }
  Object.assign(b, { on: true, t: 0, c0: LATER, prod: { mode: 'rant', said: null, at: -9999 }, fall: 0, falling: -1, tx: X(WRECK_X), ty: ROOF_Y - 40, tv: 0, tilt: 0, my: ROOF_Y - 140, mv: 0, landed: false, step: 0, runners: [] });
  b.dir = { x: X(DIR_X), face: -1, mode: 'up', said: null };
  p.inCutscene = true; p.carried = true; p.vel.x = 0; p.vel.y = 0;
  p.pos.x = X(LAND_X) - p.width / 2; p.pos.y = b.my - p.height;
  state.camera.x = CAM.x; state.camera.y = CAM.y;
  state.cameraOverride = { x: CAM.x, y: CAM.y };
};

export const updateBurst = (ctx: FrameContext): Controls | null => {
  const { state } = ctx, o = whOf(state), b = o.burst, p = state.player, f = state.frame, d = b.dir;
  if (!b.on) return null;
  b.t++;
  p.inCutscene = true;
  if (b.t > SKIP_AFTER) { offerSkip(); if (takeSkip()) { done(state, true); return hands(); } }
  // First, the producer, laying down the law to the cast and crew (one line, then the user's); he looks up at the noise;
  // the roof goes
  const P = b.prod;
  if (b.t === 30 && P.mode === 'rant') prodSay(state, PROD_RULES, () => prodSay(state, PROD_ASSASSIN, () => { if (P.mode !== 'rant') return; P.mode = 'look'; b.c0 = b.t + 28; playSound('rumble', 0.7, -4); shakeScreen(state, 6, 3); }));
  if (b.c0 === LATER && b.t > 1500) { P.mode = 'look'; b.c0 = b.t + 1; }
  const ct = b.t - b.c0;
  state.cameraOverride = { x: CAM.x, y: camY(ct) };
  // (the crew on the set stood where they are: it's the director's scene)
  for (const e of state.enemies) if (e.pos.x < x0 + 1400 && e.health > 0) { e.vel.x = 0; e.pauseTimer = Math.max(e.pauseTimer ?? 0, 2); }
  // The roof goes: the train and him down through it
  if (ct === 0) {
    playSound('crash', 1, -10); playSound('boom', 0.8, -6); shakeScreen(state, 16, 7);
    for (let k = 0; k < 46; k++) state.particles.push({ pos: { x: X(ROOF_HOLE.a) + Math.random() * (ROOF_HOLE.b - ROOF_HOLE.a), y: ROOF_Y - Math.random() * 30 }, vel: { x: (Math.random() - 0.5) * 5, y: 1 + Math.random() * 4 }, life: 60, color: ['#78716C', '#A8A29E', '#57534E', '#1C1917'][k % 4], size: 3 + Math.random() * 6, grav: 0.4 });
  }
  if (ct >= 0) {
    if (b.ty < GY) {
      b.tv = Math.min(24, b.tv + 0.9); b.ty += b.tv; b.tilt = Math.min(1, b.tilt + 0.035);
      if (b.ty >= GY) {
        b.ty = GY; b.tilt = 1;
        playSound('crash', 1, -12); playSound('grind', 0.7, -6); shakeScreen(state, 20, 8);
        for (let k = 0; k < 30; k++) state.particles.push({ pos: { x: b.tx + (Math.random() - 0.5) * 220, y: GY - 6 }, vel: { x: (Math.random() - 0.5) * 7, y: -1 - Math.random() * 3 }, life: 50, color: 'rgba(168, 162, 158, 0.8)', size: 5 + Math.random() * 6 });
        // (the producer, under it: flat. The blood out from under it, up the set)
        if (P.mode !== 'dead') {
          P.mode = 'dead'; P.said = null; P.at = state.frame;
          playSound('splat', 1, -6); playSound('crunch', 1, -4);
          for (let k = 0; k < 44; k++) state.particles.push({ pos: { x: X(PROD_X) + (Math.random() - 0.5) * 70, y: GY - 10 }, vel: { x: (Math.random() - 0.5) * 12, y: -2 - Math.random() * 9 }, life: 40 + Math.random() * 30, color: ['#B91C1C', '#7F1D1D', '#DC2626'][k % 3], size: 2 + Math.random() * 4, grav: 0.4 });
          // (bits of him: gut, khaki, the vest, the shirt, teeth)
          for (let k = 0; k < 14; k++) state.particles.push({ pos: { x: X(PROD_X) + (Math.random() - 0.5) * 60, y: GY - 12 }, vel: { x: (k % 2 ? 1 : -1) * (2 + Math.random() * 6), y: -3 - Math.random() * 7 }, life: 50 + Math.random() * 30, color: ['#A84850', '#D07078', '#C8B48A', '#1E2E5A', '#8AB4E8', '#F4F0E8', '#4A0E18'][k % 7], size: k % 7 === 5 ? 2 : 3 + Math.random() * 3, grav: 0.5 });
        }
        // (the director up out of his chair at the noise)
        d.mode = 'up';
      }
    }
    if (!b.landed && ct >= 6) {
      b.mv = Math.min(20, b.mv + 0.8); b.my += b.mv;
      p.spriteRot = (p.spriteRot ?? 0) + 0.28;
      if (b.my >= GY) { b.my = GY; b.landed = true; p.spriteRot = 0; p.carried = false; p.vel.y = 0; playSound('thud', 1, -8); shakeScreen(state, 8, 4); }
      p.pos.x = X(LAND_X) - p.width / 2; p.pos.y = b.my - p.height; p.facing = 1;
    }
  }
  if (b.landed) { p.pos.y = GY - p.height; p.vel.x = 0; p.facing = 1; }
  // Then, one at a time: who the fuck is he; the movie (he doesn't know it); the secret; buy him or bury him
  if (b.landed && b.step === 0 && ct > 86) {
    b.step = 1;
    dirSay(state, DIR_WHO, () => meatheadSays(state, pickLine(BURST_WHAT), true, () => dirSay(state, DIR_TITLE, () => meatheadSays(state, pickLine(BURST_NEVER), true,
      () => dirSay(state, DIR_SECRET, () => { d.mode = 'think'; dirSay(state, DIR_PONDER, () => { b.step = 2; b.falling = 0; playSound('rumble', 0.8, -10); shakeScreen(state, 30, 2); }); })))));
  }
  // ...while he's still thinking it over, the walls go: all of them, flat, outward
  if (b.falling >= 0) {
    b.falling++;
    if (b.falling > 40 && b.fall < 1) {
      b.fall = Math.min(1, b.fall + 0.022 + b.fall * 0.04);
      if (b.fall >= 1) {
        playSound('boom', 1, -12); playSound('crash', 1, -10); shakeScreen(state, 20, 8);
        for (let k = 0; k < 40; k++) state.particles.push({ pos: { x: CAM.x + Math.random() * CANVAS_WIDTH, y: GY - 60 - Math.random() * 30 }, vel: { x: (Math.random() - 0.5) * 6, y: -1 - Math.random() * 3 }, life: 50, color: 'rgba(168, 162, 158, 0.8)', size: 5 + Math.random() * 6 });
      }
    }
  }
  // The public, staring in; KILL THEM ALL (the crew out at them, behind; the ones on the set at him)
  if (b.fall >= 1 && b.step === 2 && b.falling > 120) {
    b.step = 3;
    crowdSay(state, CROWD_GASP, CAM.x + 420, 3, () => { d.mode = 'yell'; sendRunners(state); dirSay(state, DIR_KILL, () => { d.mode = 'run'; meatheadSays(state, pickLine(BURST), true, () => { b.step = 4; }); }); });
  }
  if (d.mode === 'run') { d.x += 6; d.face = 1; if (d.x > CAM.x + CANVAS_WIDTH + 80) d.mode = 'gone'; }
  for (const r of b.runners) r.t++;
  // (the phones going off in the crowd)
  if (b.fall >= 1 && f % 9 === 0) o.flashes.push({ x: CAM.x + Math.random() * CANVAS_WIDTH, y: BACK_Y - 60 - Math.random() * 20, at: f });
  if ((b.step === 4 && d.mode === 'gone') || b.t > 4500) done(state, false);
  return hands();
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** World, on the play plane: the director (by his chair and the monitor, then up, thinking, yelling, off). */
export const drawBurstDirector = (c: CanvasRenderingContext2D, state: GameState) => {
  const b = whOf(state).burst, d = b.dir;
  if (!b.on || d.mode === 'gone') return;
  const e = puppetOf(state), f = state.frame;
  e.pos.x = d.x - e.width / 2; e.pos.y = GY - e.height; e.facing = d.face;
  e.aiState = d.mode === 'yell' ? 'action' : 'approach'; e.vel.x = d.mode === 'run' ? 6 : 0;
  // (his chair, behind him, till he's off: the director's chair, his name on its back)
  if (d.mode !== 'run') { c.save(); c.translate(X(DIR_X) + 20, GY); stamp(c, 'hww-burstchair', -4, -86, 50, 88, paintChair); c.restore(); }
  c.save(); c.translate(Math.round(d.x), GY); c.scale(d.face, 1);
  drawDirector(c, e, f, DIR_SEED, false);
  c.restore();
  // (thinking it over: a hand to the chin's a "...")
  if (d.mode === 'think' && !d.said) { c.fillStyle = '#F5F5F4'; for (let k = 0; k < 3; k++) if ((f >> 4) % 4 > k) { c.beginPath(); c.arc(d.x - 8 + k * 8, GY - 104, 2, 0, Math.PI * 2); c.fill(); } }
};
/** World, on the play plane, before the wreck (it comes down on him; drawn over his body after): the producer. Stood
 *  on the set laying down the law (the fleece vest, the checked shirt, the khakis, the headset, the clipboard, a finger
 *  jabbing at the crew), looking up at the noise, then flat under the train: his legs out from under it, the clipboard
 *  flung, the blood spreading. Dead for good (the walls down: every visit after). */
export const drawProducer = (c: CanvasRenderingContext2D, state: GameState) => {
  const b = whOf(state).burst, P = b.prod, f = state.frame, x = X(PROD_X), y = GY;
  if (!(b.on ? true : wallsDown(state))) return;
  if (b.on && P.mode !== 'dead') {
    const look = P.mode === 'look', jab = !look && !!P.said && f % 16 < 8, talk = !!P.said && f % 10 < 5;
    const pose = look ? 'look' : jab ? 'jab' : 'stand';
    c.save(); c.translate(x, y);
    stamp(c, `hww-producer-${pose}-${talk || look ? 1 : 0}`, -44, -124, 96, 128, g => paintProducer(g, pose, talk || look));
    c.restore();
    return;
  }
  // Flat under the train: the blood out from under it (spreading, stepped), the legs out the left end (the khakis, a
  // sneaker on, one off), the clipboard flung, its pages
  // (the pool spreads in eight stepped stamps; the spatter and what's left of him are one stamp each; only the fingers
  // are live)
  const since = f - P.at, k = b.on ? Math.min(1, since / 120) : 1, step = Math.round(k * POOL_STEPS);
  c.save(); c.translate(x, y);
  stamp(c, `hww-producer-pool-${step}`, -170, -8, 340, 24, g => paintPool(g, step / POOL_STEPS));
  stamp(c, 'hww-producer-spatter', -170, -8, 340, 24, paintSpatter);
  stamp(c, 'hww-producer-flat2', -170, -44, 340, 52, paintProducerFlat);
  // (the fingers of the hand out the right end: twitching a while after, and now and then for good)
  const twitch = since < 600 || f % 420 < 24;
  for (let i = 0; i < 4; i++) {
    const curl = twitch && Math.sin(f * 0.7 + i * 1.9) > 0.2, fy = -10 + i * 2.5, len = curl ? 2 : 5 - (i === 3 ? 1 : 0);
    box(c, 71, fy - 0.5, len + 1, 3, KINK); box(c, 71, fy, len, 2, i % 2 ? '#D49A74' : '#E2AC86'); if (!curl) box(c, 71 + len - 1, fy, 1, 1, '#F2C8A8');
  }
  c.restore();
};

/** The stepped reds of him: the dried edge to the wet shine. Guts: their pinks. */
const BLOOD = ['#2A0404', '#4A0808', '#7A1010', '#A81818', '#D03030', '#F07070', '#FFD0D0'];
const GUT = ['#3A0E12', '#7A2A30', '#A84850', '#D07078', '#F0A8A8'];
const BONE = ['#8A8270', '#C8C0B0', '#F4F0E8'];
const POOL_STEPS = 8;
/** The pool out from under the wreck (feet at 0): stepped rings of red, each dithered into the next, lobes where it's
 *  run off along the floor, a wet shine on it. k: how far it's spread (0..1). */
const paintPool = (g: CanvasRenderingContext2D, k: number) => {
  const cx = -14, rx = 30 + 110 * k, ry = 3 + 5 * k;
  const lobes: [number, number, number][] = [[-0.85, 2, 0.28], [0.7, 3, 0.24], [-0.4, 5, 0.2], [0.95, 1, 0.14], [-1.05, 4, 0.12]];
  const ring = (s: number, col: string, dither?: string) => {
    pixelBlob(g, cx, 3, rx * s, ry * s, col);
    for (const [dx, dy, r] of lobes) pixelBlob(g, cx + dx * rx * s, 3 + dy * k * s, rx * r * s, ry * 0.55 * s, col);
    if (dither) { g.save(); g.beginPath(); g.ellipse(cx, 3, rx * s * 0.97, ry * s * 0.9, 0, 0, Math.PI * 2); g.clip(); checker(g, cx - rx * s, 3 - ry * s, rx * s * 2, ry * s * 2, dither); g.restore(); }
  };
  ring(1, BLOOD[0], BLOOD[1]);
  ring(0.9, BLOOD[1], BLOOD[2]);
  ring(0.68, BLOOD[2], BLOOD[3]);
  ring(0.42, BLOOD[3]);
  pixelBlob(g, cx - 6, 2, rx * 0.2, Math.max(1, ry * 0.3), BLOOD[4]);
  // (the wet: the ceiling lights in it, long thin shines along the floor)
  for (let i = 0; i < 6; i++) {
    const sx = cx + (hash(i * 4.7) - 0.5) * rx * 1.3, sy = 1 + hash(i * 2.3) * ry * 1.2, w = 3 + hash(i * 9.1) * 8 * (0.4 + k);
    box(g, sx, sy, w, 1, BLOOD[5]); if (i % 2 === 0) box(g, sx + 1, sy, 2, 1, BLOOD[6]);
  }
};
/** The spatter, flung out both ways along the floor from where it came down on him: drops with their tails pointing
 *  back at him, bigger near, specks between. */
const paintSpatter = (g: CanvasRenderingContext2D) => {
  for (let i = 0; i < 34; i++) {
    const side = i % 2 ? 1 : -1, dist = 40 + hash(i * 7.7) * 120, near = 1 - (dist - 40) / 120;
    const x = 2 + side * dist, y = -4 + hash(i * 5.3) * 14, s = Math.round(1 + near * 3 + hash(i * 1.9));
    // (its tail, back toward him)
    for (let t = 1; t <= s + 2; t++) box(g, x - side * (s / 2 + t * 1.6), y + (hash(i) - 0.5) * t * 0.3, 2, 1, t > s ? BLOOD[1] : BLOOD[2]);
    box(g, x - s / 2 - 1, y - s / 2, s + 2, s + 1, BLOOD[0]); box(g, x - s / 2, y - s / 2, s, s, BLOOD[3]);
    if (s > 2) box(g, x - s / 2, y - s / 2, 1, 1, BLOOD[5]);
    // (a speck or two past it)
    box(g, x + side * (s + 3 + hash(i * 3.3) * 6), y + 1, 1, 1, BLOOD[2]);
  }
};
const shape = (g: CanvasRenderingContext2D, pts: [number, number][], col: string, ink = true) => {
  if (ink) { g.strokeStyle = KINK; g.lineWidth = 2; g.lineJoin = 'round'; g.beginPath(); pts.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.closePath(); g.stroke(); }
  poly(g, pts, col);
};
/** A loop of gut: beads along a wiggle, inked, each lit on its upper left. */
const gut = (g: CanvasRenderingContext2D, x: number, y: number, n: number, dir: number, amp: number, ph: number) => {
  const at = (t: number): [number, number] => [x + dir * t * 2.4, y + Math.sin(t * 0.9 + ph) * amp - t * 0.15];
  for (let t = 0; t < n; t++) { const [a, b] = at(t); pixelBlob(g, a, b, 4, 3.5, KINK); }
  for (let t = 0; t < n; t++) { const [a, b] = at(t); pixelBlob(g, a, b, 3, 2.5, t % 3 === 0 ? GUT[1] : GUT[2]); }
  for (let t = 0; t < n; t += 2) { const [a, b] = at(t); box(g, a - 2, b - 2, 2, 1, GUT[3]); if (t % 4 === 0) box(g, a - 2, b - 2, 1, 1, GUT[4]); }
};
/** What's left showing of him under the wreck (feet at 0; the wreck's left car down over -35..+45). Out the left end:
 *  the khakis, pressed flat and soaked dark toward the car, a thighbone out through them, a sneaker on and a sock foot,
 *  the other sneaker flung; the gush of him out the edge (the fleece vest and the checked shirt in rags, the ribs, the
 *  guts in loops, the liver), the laminate on its lanyard. Out the right end: an arm, palm up (the fingers live), an
 *  eye out on its cord, teeth, the clipboard flung and bloodied, the glasses snapped, the headset. */
const paintProducerFlat = (g: CanvasRenderingContext2D) => {
  const K = ['#5A4A2A', '#8A7650', '#B8A47A', '#C8B48A', '#DCCCA8'];
  const SOAK = ['#3A0A06', '#5A1A10', '#7A3420'];
  const VEST = ['#0E1630', '#1E2E5A', '#34488A'], SHIRT = ['#3A5A98', '#5A84C8', '#8AB4E8'];
  const skin = ['#A86A4A', '#D49A74', '#E2AC86', '#F2C8A8'];
  // The legs: the far one (on top, toes up), the near one (flat, sock foot); thinner as they go in under it (squashed)
  shape(g, [[-34, -16], [-86, -19], [-88, -10], [-34, -12]], K[2]);
  box(g, -86, -19, 50, 1, K[3]); box(g, -70, -16, 1, 4, K[1]); box(g, -58, -15, 8, 1, K[1]);
  shape(g, [[-34, -9], [-94, -11], [-95, -1], [-34, -3]], K[3]);
  box(g, -94, -11, 58, 2, K[4]); box(g, -94, -3, 58, 1, K[1]); box(g, -76, -9, 1, 5, K[1]); box(g, -60, -8, 1, 4, K[2]);
  // (soaked through, toward the car: dithered from the khaki into the dark)
  checker(g, -64, -20, 8, 20, SOAK[2]); box(g, -56, -19, 8, 18, SOAK[2]); checker(g, -48, -19, 6, 18, SOAK[1]); box(g, -42, -18, 9, 17, SOAK[1]);
  box(g, -56, -19, 20, 1, '#9A4A30'); box(g, -42, -9, 9, 1, '#8A3A26');
  // (the thighbone out through a tear, the knob of it, the blood round the hole)
  pixelBlob(g, -60, -18, 6, 3, BLOOD[1]);
  shape(g, [[-62, -18], [-50, -27], [-47, -25], [-59, -16]], BONE[1]);
  box(g, -60, -19, 9, 1, BONE[2]); pixelBlob(g, -48, -27, 3.5, 3, KINK); pixelBlob(g, -48, -27, 2.5, 2, BONE[2]); box(g, -49, -28, 1, 1, '#FFFFFF');
  box(g, -51, -24, 3, 2, BLOOD[3]); box(g, -55, -21, 2, 3, BLOOD[2]);
  // (the sneaker still on, toes up; laces; the sock foot of the other, flopped over)
  box(g, -101, -19, 10, 18, KINK); box(g, -100, -18, 8, 16, '#E8E8E4'); box(g, -100, -18, 8, 2, '#FFFFFF'); box(g, -100, -4, 8, 2, '#A8A8A4');
  for (let i = 0; i < 3; i++) box(g, -98, -15 + i * 3, 4, 1, '#3F3F46');
  box(g, -94, -25, 8, 7, KINK); box(g, -93, -24, 6, 5, '#F4F0E8'); box(g, -93, -24, 6, 1, '#FFFFFF'); box(g, -90, -21, 2, 2, BLOOD[3]);
  shape(g, [[-95, -10], [-104, -9], [-106, -3], [-95, -1]], '#F1EFEA'); box(g, -104, -4, 8, 2, '#C8C4BC'); box(g, -101, -8, 2, 2, BLOOD[3]); box(g, -98, -4, 1, 2, BLOOD[2]);
  // (the other sneaker, flung, on its side, its laces out)
  box(g, -137, -9, 16, 9, KINK); box(g, -136, -8, 14, 7, '#E8E8E4'); box(g, -136, -8, 14, 1, '#FFFFFF'); box(g, -136, -3, 14, 2, '#A8A8A4'); box(g, -136, -1, 14, 1, '#6A6A70');
  box(g, -132, -10, 6, 2, '#E8E8E4'); g.strokeStyle = '#E8E8E4'; g.lineWidth = 1; g.beginPath(); g.moveTo(-128, -9); g.quadraticCurveTo(-120, -14, -116, -4); g.stroke();
  // The gush of him out the left edge: the vest in rags, the checked shirt, soaked; the ribs; the liver; the guts
  shape(g, [[-30, -30], [-46, -26], [-52, -20], [-44, -18], [-40, -12], [-30, -10]], VEST[1]);
  box(g, -44, -25, 10, 1, VEST[2]); checker(g, -48, -22, 8, 6, VEST[0]); box(g, -34, -28, 1, 18, '#A8A8B0');
  shape(g, [[-30, -36], [-40, -34], [-38, -30], [-44, -29], [-36, -26], [-30, -27]], SHIRT[2]);
  for (let i = 0; i < 4; i++) box(g, -40 + i * 3, -35, 1, 9, SHIRT[1]); box(g, -40, -31, 10, 1, SHIRT[0]);
  checker(g, -40, -32, 6, 6, BLOOD[2]);
  for (let i = 0; i < 3; i++) { g.strokeStyle = KINK; g.lineWidth = 3; g.beginPath(); g.arc(-30, -18 + i * 6, 11 - i, Math.PI * 0.95, Math.PI * 1.5); g.stroke(); g.strokeStyle = BONE[2]; g.lineWidth = 1.4; g.stroke(); }
  pixelBlob(g, -40, -6, 9, 5, KINK); pixelBlob(g, -40, -6, 8, 4, '#4A0E18'); box(g, -45, -9, 5, 1, '#7A2A38'); box(g, -45, -9, 2, 1, '#B85868');
  gut(g, -32, -4, 11, -1, 3, 0.4);
  gut(g, -36, -14, 7, -1, 2.5, 2.1);
  gut(g, -30, 0, 9, -1, 2, 4.0);
  box(g, -58, -2, 2, 3, GUT[3]); box(g, -62, -1, 3, 2, GUT[2]);
  // (dripping off the guts, beading on the floor)
  for (let i = 0; i < 5; i++) { const dx = -34 - i * 6, h = 2 + (i * 3) % 5; box(g, dx, -h, 1, h, BLOOD[3]); box(g, dx - 1, 0, 3, 1, BLOOD[1]); }
  // (the laminate on its lanyard, in the pool)
  g.strokeStyle = '#DC2626'; g.lineWidth = 1; g.beginPath(); g.moveTo(-36, -2); g.quadraticCurveTo(-56, 2, -68, -1); g.stroke();
  box(g, -76, -6, 10, 7, KINK); box(g, -75, -5, 8, 5, '#F8FAFC'); box(g, -75, -5, 8, 1, '#B91C1C'); box(g, -74, -2, 5, 1, '#3F3F46'); box(g, -71, -3, 3, 2, BLOOD[3]);
  // Out the right end: his arm, palm up (the fingers are live), the checked sleeve, a run of red out the cuff
  shape(g, [[38, -12], [58, -11], [58, -4], [38, -3]], SHIRT[2]);
  for (let i = 0; i < 5; i++) box(g, 41 + i * 4, -11, 1, 7, SHIRT[1]); box(g, 38, -8, 20, 1, SHIRT[1]); box(g, 38, -5, 20, 1, SHIRT[0]);
  checker(g, 38, -12, 8, 9, BLOOD[2]);
  shape(g, [[58, -10], [66, -11], [71, -12], [72, -2], [66, -3], [58, -4]], skin[2]);
  box(g, 59, -10, 7, 1, skin[3]); box(g, 59, -5, 12, 1, skin[1]); box(g, 64, -8, 3, 2, skin[1]);
  box(g, 64, -14, 4, 3, KINK); box(g, 65, -13, 2, 2, skin[2]);
  box(g, 56, -3, 8, 2, BLOOD[3]); box(g, 58, -1, 10, 1, BLOOD[2]);
  // (his eye, out on its cord: the white, the blue, the pupil, the veins; the cord back in under the car)
  g.strokeStyle = GUT[2]; g.lineWidth = 1.5; g.beginPath(); g.moveTo(40, -1); g.quadraticCurveTo(70, 4, 86, 0); g.stroke();
  pixelBlob(g, 90, -3, 5, 4.5, KINK); pixelBlob(g, 90, -3, 4, 3.5, '#F4F0E8'); box(g, 90, -5, 4, 4, '#4A84C8'); box(g, 91, -4, 2, 2, '#0A0A0E'); box(g, 92, -5, 1, 1, '#FFFFFF');
  box(g, 86, -4, 2, 1, BLOOD[4]); box(g, 87, -1, 3, 1, BLOOD[4]); box(g, 88, -6, 1, 1, BLOOD[4]);
  // (teeth)
  for (const [tx, ty] of [[76, -1], [81, 2], [100, 1], [-84, 3]]) { box(g, tx - 1, ty - 1, 4, 4, KINK); box(g, tx, ty, 2, 2, '#F4F0E8'); }
  // (the clipboard, flung and bloodied: board, page, clip)
  shape(g, [[104, -8], [128, -10], [129, -3], [105, -1]], '#7A4A1E');
  shape(g, [[107, -8], [125, -10], [126, -4], [108, -3]], '#F4F0E8', false);
  box(g, 113, -11, 6, 2, '#A8A8B0'); for (let i = 0; i < 3; i++) box(g, 109, -7 + i * 1.5, 12, 1, '#8A8A94');
  box(g, 110, -8, 3, 3, BLOOD[3]); box(g, 118, -6, 2, 2, BLOOD[3]); box(g, 122, -9, 1, 1, BLOOD[2]); box(g, 108, -1, 18, 1, '#4A2A10');
  // (his glasses, snapped at the bridge: one lens cracked, the other gone, an arm bent back)
  g.strokeStyle = KINK; g.lineWidth = 1.6;
  g.strokeRect(136, -7, 6, 4); g.strokeRect(145, -5, 6, 4);
  box(g, 137, -6, 4, 2, '#A8D0E8'); box(g, 137, -6, 1, 1, '#FFFFFF');
  g.lineWidth = 1; g.strokeStyle = '#E8F4FA'; g.beginPath(); g.moveTo(137, -3); g.lineTo(139, -5); g.lineTo(141, -6); g.stroke();
  g.strokeStyle = KINK; g.beginPath(); g.moveTo(151, -3); g.lineTo(156, -8); g.moveTo(136, -5); g.lineTo(132, -2); g.stroke();
  box(g, 159, -1, 3, 2, '#A8D0E8');
  // (the headset, kicked off on the other side: band, cup, mic)
  g.strokeStyle = KINK; g.lineWidth = 3; g.beginPath(); g.arc(-152, -2, 8, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
  g.strokeStyle = '#3F3F46'; g.lineWidth = 1.4; g.stroke();
  pixelBlob(g, -160, -3, 3.5, 4, KINK); pixelBlob(g, -160, -3, 2.5, 3, '#27272A'); box(g, -161, -5, 1, 2, '#52525B');
  g.strokeStyle = '#3F3F46'; g.lineWidth = 1; g.beginPath(); g.moveTo(-144, -3); g.lineTo(-138, -7); g.stroke(); box(g, -139, -8, 2, 2, KINK);
};

/** A director's chair (feet at 0, its left): the frame crossed under the seat, the canvas, DIRECTOR on its back. */
const paintChair = (g: CanvasRenderingContext2D) => {
  const W = ['#3A2410', '#5C3A1A', '#80562A', '#A87A3E', '#C99E5C'];
  for (const lx of [2, 34]) { box(g, lx - 1, -84, 5, 84, KINK); box(g, lx, -84, 3, 84, W[3]); box(g, lx, -84, 1, 84, W[4]); }
  g.strokeStyle = KINK; g.lineWidth = 4; g.beginPath(); g.moveTo(3, -2); g.lineTo(36, -42); g.moveTo(36, -2); g.lineTo(3, -42); g.stroke();
  g.strokeStyle = W[2]; g.lineWidth = 2; g.stroke();
  box(g, -1, -48, 42, 8, KINK); box(g, 0, -47, 40, 6, '#18181B'); box(g, 0, -47, 40, 1, '#3A3A44');
  box(g, -1, -82, 42, 24, KINK); box(g, 0, -81, 40, 22, '#18181B'); box(g, 0, -81, 40, 2, '#3A3A44'); box(g, 0, -61, 40, 2, '#0A0A0E');
  signText(g, 'DIRECTOR', 20, -66, { sx: 1, sy: 1, fill: '#F4F0E8' });
};
/** The producer, stood laying down the law (or looking up at the noise): the fleece vest over the checked shirt, the
 *  khakis, the sneakers, the lanyard, the bald dome and its gray horseshoe, the glasses, the headset; the clipboard in
 *  one hand, the other jabbing at the crew (or both up). Feet at 0, facing right. */
const paintProducer = (g: CanvasRenderingContext2D, pose: 'stand' | 'jab' | 'look', talk: boolean) => {
  const B = bodyOf(14, 'stand', 0, false);
  B.L = { ...B.L, skin: '#E2AC86', hair: '#9A9A9A', bald: true, long: false, heavy: true, face: 3 };
  B.w = 27; B.hipW = 26;
  const skin = B.L.skin, shirt = '#8AB4E8', vest = '#1E2E5A', khaki = '#C8B48A';
  legs(g, B, { col: khaki, shoe: 'sneaker', shoeCol: '#E8E8E4', detail: (gg, _h, kn, ft) => px(gg, (kn[0] + ft[0]) / 2, (kn[1] + ft[1]) / 2 - 3, 1, 6, dk(khaki, 0.25)) });
  const far: [number, number] = pose === 'look' ? [-B.w / 2 - 8, B.shY - 28] : [-B.w / 2 - 6, B.shY + 18];
  const near: [number, number] = pose === 'look' ? [B.w / 2 + 6, B.shY - 30] : pose === 'jab' ? [B.w / 2 + 22, B.shY + 2] : [B.w / 2 + 3, B.shY + 22];
  arm(g, B, -1, far[0], far[1], { sleeve: shirt, hand: skin });
  // (the clipboard in the far hand: brown board, the clip, the page)
  part(g, () => g.rect(far[0] - 8, far[1] - 12, 14, 18), '#7A4A1E', far[0] - 8, far[1] - 12, 14, 18, 1);
  px(g, far[0] - 6, far[1] - 9, 10, 13, '#F4F0E8'); px(g, far[0] - 3, far[1] - 13, 4, 3, '#A8A8B0');
  for (let k = 0; k < 3; k++) px(g, far[0] - 5, far[1] - 6 + k * 3, 7, 1, '#8A8A94');
  torso(g, B, shirt);
  for (let y = B.shY + 3; y < B.hipY; y += 4) px(g, -B.w / 2 + 2, y, B.w - 4, 1, '#5A84C8');
  for (let x = -B.w / 2 + 3; x < B.w / 2 - 2; x += 4) px(g, x, B.shY + 2, 1, B.hipY - B.shY - 2, '#6A94D8');
  // (the fleece vest: its zip, its pocket, the logo)
  part(g, () => { g.moveTo(-B.w / 2, B.shY + 2); g.lineTo(-B.hipW / 2 - 1, B.hipY + 3); g.lineTo(-1, B.hipY + 3); g.lineTo(-2, B.shY + 2); g.closePath(); }, vest, -B.hipW / 2 - 1, B.shY + 2, B.w / 2 + 2, B.hipY - B.shY + 2, 1);
  part(g, () => { g.moveTo(B.w / 2, B.shY + 2); g.lineTo(B.hipW / 2 + 3, B.hipY + 3); g.lineTo(2, B.hipY + 3); g.lineTo(2, B.shY + 2); g.closePath(); }, vest, 2, B.shY + 2, B.w / 2 + 3, B.hipY - B.shY + 2, 1);
  px(g, 0, B.shY + 2, 1, B.hipY - B.shY, '#A8A8B0'); px(g, 5, B.shY + 8, 4, 3, '#E8C25A');
  // (the lanyard, the laminate)
  px(g, -3, B.shY + 1, 1, 14, '#DC2626'); px(g, 3, B.shY + 1, 1, 14, '#DC2626');
  part(g, () => g.rect(-4, B.shY + 14, 8, 10), '#F8FAFC', -4, B.shY + 14, 8, 10, 0.8); px(g, -3, B.shY + 15, 6, 2, '#B91C1C'); px(g, -3, B.shY + 19, 5, 1, '#3F3F46');
  // (the head: tipped back to look up; the horseshoe of gray hair round the back, the glasses, the headset)
  if (pose === 'look') { B.hy -= 2; B.hx -= 1; }
  headShape(g, B, skin);
  faceOn(g, B, { skin, eyes: pose === 'look' ? 'wide' : 'angry', mouth: pose === 'look' ? 'o' : talk ? 'teeth' : 'flat', md: 'ok', look: pose === 'look' ? -1 : 0.6, brows: '#7A7A7A' });
  part(g, () => { g.moveTo(B.hx - 9, B.hy - 2); g.quadraticCurveTo(B.hx - 10, B.hy + 6, B.hx - 5, B.hy + 7); g.lineTo(B.hx - 4, B.hy + 2); g.quadraticCurveTo(B.hx - 7, B.hy, B.hx - 6, B.hy - 3); g.closePath(); }, '#9A9A9A', B.hx - 10, B.hy - 3, 6, 10, 0.8);
  px(g, B.hx - 4, B.hy - 9, 5, 1, '#F8E0CC');
  for (const s of [-1, 1]) { g.strokeStyle = KINK; g.lineWidth = 1.6; g.strokeRect(B.hx + 2.5 + s * 3.6 - 2.6, B.hy - 3, 5.2, 3.6); }
  g.strokeStyle = KINK; g.lineWidth = 2; g.beginPath(); g.arc(B.hx, B.hy - 1, 10, Math.PI * 1.08, Math.PI * 1.92); g.stroke();
  part(g, () => g.ellipse(B.hx - 8, B.hy + 1, 3, 3.6, 0, 0, Math.PI * 2), '#27272A', B.hx - 11, B.hy - 3, 6, 8, 1);
  g.strokeStyle = '#3F3F46'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(B.hx - 7, B.hy + 3); g.quadraticCurveTo(B.hx - 1, B.hy + 10, B.hx + 6, B.hy + 8); g.stroke();
  arm(g, B, 1, near[0], near[1], { sleeve: shirt, hand: skin });
  // (the jabbing finger)
  if (pose === 'jab') px(g, near[0] + 3, near[1] - 1, 5, 2, skin);
};
/** The director's (and before him the producer's) words over him (in front of everything). */
export const drawBurstSaid = (c: CanvasRenderingContext2D, state: GameState, saidOver: (c: CanvasRenderingContext2D, s: string, x: number, y: number, col: string, w: number) => void) => {
  const b = whOf(state).burst, d = b.dir;
  if (b.on && b.prod.said && b.prod.mode !== 'dead') saidOver(c, b.prod.said.text, X(PROD_X), GY - 112, '#FECACA', 300);
  if (d.said && d.mode !== 'gone') saidOver(c, d.said.text, d.x, GY - 108, '#BFDBFE', 300);
};

/** Screen space: the dim of the inside before the walls go, the front wall's shadow coming down over us, SKIP >>. */
export const drawBurstHud = (c: CanvasRenderingContext2D, state: GameState) => {
  const b = whOf(state).burst;
  if (!b.on) return;
  if (b.fall < 1) { c.fillStyle = `rgba(0, 0, 0, ${0.4 * (1 - b.fall)})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  // (the white of the flight, going)
  if (b.t < 24) { c.fillStyle = `rgba(255, 255, 255, ${1 - b.t / 24})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  // (the fourth wall, coming down toward us: its shadow sweeping down the screen, then gone)
  if (b.fall > 0.3 && b.fall < 1) { const k = (b.fall - 0.3) / 0.7; c.fillStyle = `rgba(28, 25, 23, ${0.8 * (1 - k * 0.6)})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT * k); }
  if (b.t > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
};
