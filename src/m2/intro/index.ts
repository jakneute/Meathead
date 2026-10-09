// The way in (Meathead 2's intro stage): out of his truck in the parking garage, down the long hallway on its moving
// walkways, through the security checkpoint, out into America USA (the free bit at the front of the park: every
// American city there ever was, done as a shopping street, flags on everything, a PA that won't shut up), and into the
// line for the ticket window. Then through the gate, into the hub.
//
// Postal rules: park security leaves him alone as long as he leaves everybody alone. They stroll about, keep an eye on
// him, and that's all. Hit anybody (a guard, somebody in the line, the ticket lady) and the whole park's security comes
// at him with nightsticks (they hit soft). Security doesn't send more on its own; but walk through the checkpoint's metal detector and they keep coming out of the security
// office, for as long as he wants to practice on them.
//
// The line's real: he waits his turn behind the people in front (they're served one at a time), people line up
// behind him, and if he holds it up at the window they let him know. Or he plows through the lot of them. At the window
// he shows his ticket: clean, it's a ticket; shitty, so's the ticket; naked, there's no ticket (it was in his pants), so
// he knocks the ticket lady out and goes in anyway.

import type { StageLayout } from '../../m1/game/stages/index';
import type { GameState } from '../../m1/game/core/state';
import type { FrameContext } from '../../m1/game/core/context';
import type { Enemy } from '../../m1/types';
import { groundBlocks } from '../../m1/game/core/terrain';
import { makeKindEnemy } from '../../m1/game/enemies/kinds';
import { GROUND_Y, CANVAS_WIDTH } from '../../m1/constants';
import { NO_CONTROLS } from '../../m1/game/platform/input';
import { registerKindDrawer } from '../../m1/game/render/enemies';
import { drawSecurity, isWomanGuard } from '../cast/security';
/** A guard's voice: hers or his. */
const guardVoice = (e: Enemy) => (isWomanGuard(e) ? GUARD_F_VOICE : GUARD_VOICE);
import { playSound, audioRunning, getAudioContext } from '../../m1/game/platform/audio';
import { say, MEATHEAD_VOICE } from '../../m1/game/platform/speech';
import { isShat, isNude } from '../../m1/game/player/gut';
import { shakeScreen } from '../../m1/game/core/state';
import { SKIP_AFTER, offerSkip, takeSkip } from '../../m1/game/platform/skip';
import { createGrab, updateGrab, drawGrab, grabbing, type Grab } from '../moves/grab';
import { setUi, goTo, isLeaving, arrived, carryGut, takeGut } from '../store';
import { stopWeapons } from '../weapons';
import { CAST, type CastMember } from '../cast/people';
import {
  TICKET_VOICE, GUARD_VOICE, GUARD_F_VOICE, PA_VOICE, GUEST_VOICE, GUEST2_VOICE, type Dressed, MEATHEAD_TICKET, MEATHEAD_PARKED, TICKET_LADY, TICKET_NEXT, TICKET_ALARM,
  GUARD_ALERT, GUARD_BARK, GUARD_IDLE, GUARD_WELCOME, PA_LINES, GUEST_HURRY, GUEST_CUT, TICKET_CUT, GUEST_HIT, GUEST_REACT, GUEST_REACT_NOW,
} from './lines';
import { drawIntroBackdrop, drawIntroBack, drawIntroFront } from './draw';
import { X0, R, CEIL_Y, UPPER, floorY, GARAGE_END, CHECK_END, STAIRS_END, USA_START, WALKWAYS, WALKWAY_SPEED, OFFICE_X, DETECTOR_X, FRONT_X, WINDOW_X, SPACING, QUEUE_START, TURN_X, GATE_X, END_X } from './geometry';

export const INTRO_STAGE = 'M2 America USA';

const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];
const dressed = (state: GameState): Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');

/** Somebody in line: who they are (the cast), their place in it (lower first), what they're up to. */
export interface Guest { who: CastMember; number: number; state: 'arrive' | 'line' | 'served' | 'flee'; line?: string; voice: typeof GUEST_VOICE; reacted?: Dressed[] }
/** Who's talking right now, over their head (only while the voice is going). */
interface Said { text: string }

export interface Intro {
  grab: Grab;
  /** He's started something: park security's after him. */
  provoked: boolean;
  /** The line: his own place in it once he's joined (null till then), the next number to give out, the window's progress. */
  me: number | null; nextNumber: number; serveT: number; arriveT: number; hurryT: number; atWindowT: number;
  /** The ticket window: what she's saying, whether she's out cold; whether he's been let in. */
  lady: { said: Said | null; ko: number }; admitted: boolean;
  /** The ticket scene at the window: how it went, how far it's got. */
  scene: { kind: Dressed; t: number; done: boolean; punched: boolean; card: boolean; cardAt: number; pip: number } | null;
  /** The checkpoint's security office: the door, the next one out. */
  office: { open: number; cd: number; due: number };
  /** The PA (what it's saying, when next), the guards' barks. */
  pa: { said: Said | null; next: number; heard: string[] }; bark: { e: Enemy; said: Said } | null; barkNext: number;
  hp: WeakMap<Enemy, number>; hpWas: number; upWas: boolean;
  /** The metal detector: going off (frames left), and whether he's in it. */
  alarm: number; inDetector: boolean;
  /** The detector resetting after going off (walking through it meanwhile does nothing). */
  cool: number;
  /** He's walked through the detector (at least once). */
  tripped: boolean;
  /** A guard's welcomed him to the park. */
  welcomed: boolean;
  /** He's laid into the people in line: he can go to the window whenever he likes. */
  lineFight: boolean;
  /** The state of him the line last saw, and when somebody in it can next say something about it. */
  seenDressed: Dressed; reactNext: number;
  /** The way he gets here (the first time): the truck into the pillar, him out of its window. */
  arrival: { t: number; landed: number; said: boolean; done: number; waiting: boolean } | null;
}
export const getIntro = (state: GameState) => state.stage as Intro | null;

/** Who's in the line, by enemy (they're people the engine can hit). */
export const guests = new WeakMap<Enemy, Guest>();
/** Who's a woman and who's a man, of the people on the way in (for what's said over them: content/gender). */
export const introGender = (e: Enemy): 'm' | 'f' | null => (e.kind === 'parksec' ? (isWomanGuard(e) ? 'f' : 'm') : e.kind === 'parkguest' ? (guests.get(e)?.voice === GUEST_VOICE ? 'f' : 'm') : null);
/** The cast, for the line: people out for the day. Which one a guest is goes in their seed (homeX), so it's the same
 *  person drawn wherever they're drawn (in line, picked up, flung, dead). */
const LINE_CAST = ['jenny', 'matt', 'bev', 'gus', 'anna', 'sid', 'lucille', 'ed', 'tiffanie', 'glenn', 'stella', 'larry'];
/** ...the women among them (they speak in a woman's voice; the men in a man's). */
const WOMEN = new Set(['jenny', 'bev', 'anna', 'lucille', 'tiffanie', 'stella']);
const GUEST_SEED = 5000, GUEST_STEP = 101;
const castOf = (seed: number) => { const id = LINE_CAST[(Math.round((seed - GUEST_SEED) / GUEST_STEP) % LINE_CAST.length + LINE_CAST.length) % LINE_CAST.length]; return CAST.find(m => m.id === id) ?? CAST[0]; };
let castNext = 0;

/** Meathead 2's people, drawn its own way wherever the engine draws them: security, and the people in line. */
let registered = false;
export const registerIntro = () => {
  if (registered) return;
  registered = true;
  registerKindDrawer('parksec', (c, e, f) => drawSecurity(c, e, f));
  registerKindDrawer('parkguest', (c, e, f) => {
    const g = guests.get(e);
    c.save(); c.scale(1.12, 1.12);
    castOf(e.homeX || 0).draw(c, f + (e.homeX || 0), !!g?.line);
    c.restore();
  });
};

/** Somebody in line (a person the engine can hit), standing at `x`. */
const addGuest = (state: GameState, intro: Intro, x: number, arriving: boolean) => {
  const e = makeKindEnemy('parkguest', x, GROUND_Y);
  e.seen = true; e.harmless = true; e.puppet = true; e.facing = 1; e.shootTimer = 0;
  // (security and all: they walk on past whoever's stood there, into the line)
  e.noCrowd = true;
  // (one hit and they're done)
  e.health = 1; e.maxHealth = 1;
  e.homeX = GUEST_SEED + (castNext++) * GUEST_STEP;
  guests.set(e, { who: castOf(e.homeX), number: intro.nextNumber++, state: arriving ? 'arrive' : 'line', voice: WOMEN.has(castOf(e.homeX).id) ? GUEST_VOICE : GUEST2_VOICE });
  state.enemies.push(e);
  intro.hp.set(e, e.health);
  return e;
};

/** Park security, posted about the place (relative x). */
const POSTS = [500, 1150, 3640, 3950, 4250, 5900, 6750, 7650, 8500, 9400];
const addGuard = (state: GameState, intro: Intro, x: number) => {
  const e = makeKindEnemy('parksec', x, floorY(x - X0));
  e.seen = true; e.homeX = x + Math.floor(Math.random() * 997); e.facing = Math.random() < 0.5 ? -1 : 1;
  (e as Enemy & { post?: number }).post = x;
  state.enemies.push(e);
  intro.hp.set(e, e.health);
  return e;
};

const meatheadSays = (state: GameState, text: string, after = false, onDone?: () => void, always = false) => {
  const shown = say(text, MEATHEAD_VOICE, after ? 'queue' : 'casual', {
    always,
    onShow: () => { state.playerLastVulgarity = text; state.playerVulgarityTimer = 180; },
    onHide: () => { if (state.playerLastVulgarity === text) state.playerVulgarityTimer = 0; onDone?.(); },
  });
  // (it has to be said: if the voice won't (it's been said already, say), it's up on the screen anyway)
  if (!shown) { if (always) { state.playerLastVulgarity = text; state.playerVulgarityTimer = 150; } onDone?.(); }
};
/** Somebody says something over their own head, only while it's being said. */
const speak = (voice: typeof TICKET_VOICE, text: string, set: (s: Said | null) => void, after = false, onDone?: () => void, always = false) => {
  const s = { text };
  const shown = say(text, voice, after ? 'queue' : 'casual', { always, onShow: () => set(s), onHide: () => { set(null); onDone?.(); } });
  if (!shown) { if (always) { set(s); setTimeout(() => set(null), 2500); } onDone?.(); }
};

// ---------------------------------------------------------------------------------------------------------------

export const introLayout: StageLayout = {
  left: X0 - 400,
  startX: R(260),
  verticalCamera: false,
  // (his footsteps: the walkways' steel treads ring under him; everything else out here's concrete, brick or tile)
  footstep: (state) => { const x = state.player.pos.x + state.player.width / 2; return WALKWAYS.some(([a, b]) => x > R(a) && x < R(b)) && state.player.pos.y + state.player.height < UPPER + 2 ? 'metal' : 'hard'; },
  startsStanding: true,
  build: (state) => {
    arrived(); stopWeapons();
    { const g = takeGut(); if (g) state.player.gut = g; }
    // (up top: the garage level, out along the walkway to the checkpoint; the stairs down; America USA on the ground)
    const runs = [
      { x1: X0 - 400, y1: UPPER, x2: R(CHECK_END), y2: UPPER, surface: 'concrete' },
      { x1: R(CHECK_END), y1: UPPER, x2: R(STAIRS_END), y2: GROUND_Y, surface: 'concrete' },
      { x1: R(STAIRS_END), y1: GROUND_Y, x2: R(END_X) + 400, y2: GROUND_Y, surface: 'concrete' },
    ];
    state.groundRuns = runs;
    state.blocks.push(...groundBlocks(runs));
    // The garage, the hallway and the checkpoint have a ceiling; America USA's open to the sky. Walls at both ends.
    state.blocks.push(
      { x: X0 - 60, y: -3000, w: 60, h: 3600, type: 'wall', hidden: true, tag: 'intro-l' },
      { x: R(END_X), y: -3000, w: 60, h: 3600, type: 'wall', hidden: true, tag: 'intro-r' },
      { x: X0 - 60, y: -3000, w: R(GARAGE_END) - X0 + 60, h: 3000 + CEIL_Y, type: 'wall', hidden: true, tag: 'intro-ceiling' },
    );
    const intro: Intro = {
      grab: createGrab(state), provoked: false, me: null, nextNumber: 0, serveT: 0, arriveT: 0, hurryT: 0, atWindowT: 0,
      lady: { said: null, ko: 0 }, admitted: false, scene: null, office: { open: 0, cd: 0, due: 0 },
      pa: { said: null, next: 600, heard: [] }, bark: null, barkNext: 0, hp: new WeakMap(), hpWas: state.player.health, upWas: false, alarm: 0, inDetector: false, cool: 0, tripped: false, welcomed: false, lineFight: false, seenDressed: 'clean', reactNext: 0,
      arrival: crashedIn ? null : { t: 0, landed: 0, said: false, done: 0, waiting: true },
    };
    // (only the once: back here after dying, the truck's already in the pillar and he's already out of it)
    if (!crashedIn) { crashedIn = true; state.player.hidden = true; state.player.inCutscene = true; setUi({ introCutscene: true }); }
    // (back after dying: on his feet by his truck, on the garage floor; not where the engine puts him, up in the garage's
    // ceiling, where he'd be stuck out of sight)
    else { const p = state.player; p.hidden = false; p.inCutscene = false; p.pos = { x: R(190) - p.width / 2, y: UPPER - p.height }; p.vel = { x: 0, y: 0 }; p.facing = 1; }
    state.stage = intro;
    state.cameraMinX = X0 - 60;
    state.cameraMaxX = R(END_X) + 60 - CANVAS_WIDTH;
    for (const x of POSTS) addGuard(state, intro, R(x));
    // The line, already there: six people, the front one at the window
    for (let i = 0; i < 6; i++) addGuest(state, intro, R(FRONT_X - i * SPACING), false);
  },
  update: (ctx, controls) => {
    const { state } = ctx;
    const intro = getIntro(state);
    if (import.meta.env.DEV) (window as unknown as { __m2: GameState }).__m2 = state;
    if (isLeaving()) { stopWeapons(); carryGut(state.player.gut); state.player.vel.x = 0; return { ...NO_CONTROLS }; }
    if (!intro) return controls;
    const p = state.player, px = p.pos.x + p.width / 2;
    // (no ammo lying about this early: anything dropped's gone)
    state.pickups = state.pickups.filter(k => k.type !== 'small_ammo' && k.type !== 'large_ammo');
    // (security hits soft: most of whatever he took, given back)
    if (p.health < intro.hpWas && p.health > 0) p.health = Math.min(intro.hpWas, p.health + (intro.hpWas - p.health) * 0.65);
    intro.hpWas = p.health;

    // The way in: the truck, the pillar, him out of the window (nothing else to do till he's out)
    if (intro.arrival) { arrival(ctx, intro, controls); security(ctx, intro); return { ...NO_CONTROLS }; }

    walkways(state);
    watchForTrouble(ctx, intro);
    security(ctx, intro);
    detector(ctx, intro);
    line(ctx, intro);
    talk(ctx, intro);

    // The ticket scene: nothing else while it's on
    if (intro.scene) {
      // (everybody holds still for it: security's not on him, nobody swings at him, mid-swing or not, while the ticket's
      // out or the punch is going in; it all picks up again after, see security)
      for (const e of state.enemies) {
        if (e.health <= 0 || e.isBlownAway || guests.has(e)) continue;
        e.puppet = true; e.harmless = true; e.melee = undefined; e.shootTimer = 0;
        e.pauseTimer = Math.max(e.pauseTimer || 0, 2); e.vel.x = 0;
      }
      scene(ctx, intro);
      p.vel.x = 0;
      return { ...NO_CONTROLS };
    }
    // (the turnstile: no further without being let in)
    if (!intro.admitted && p.pos.x + p.width > R(TURN_X)) { p.pos.x = R(TURN_X) - p.width; if (p.vel.x > 0) p.vel.x = 0; }
    // (in, and through the gate: on to the hub)
    if (intro.admitted && px > R(GATE_X)) { goTo('hub'); return { ...NO_CONTROLS }; }

    controls = updateGrab(ctx, intro.grab, controls);
    // At the window: up shows his ticket (his turn, or he's past caring)
    // (anywhere from his spot at the window up to the turnstile)
  const atWindow = px > R(FRONT_X) - 34 && px < R(TURN_X) + 10 && p.isGrounded && !intro.admitted;
    const myTurn = atWindow && (intro.me !== null && !lineAhead(state, intro));
    // (he shows it only once everybody ahead of him has shown theirs, unless he's laid into the line)
    const mayShow = myTurn || (atWindow && intro.lineFight);
    const upPress = !!controls.up && !intro.upWas;
    intro.upWas = !!controls.up;
    if (atWindow && upPress && !grabbing(intro.grab)) {
      // (he shows his ticket, whatever's going on; it's only naked, with no ticket to show, that he hits her: see scene)
      if (intro.lady.ko > 0) startScene(state, intro, 'punch');
      else if (mayShow) startScene(state, intro, dressed(state));
      else {
        // (he's cut in: she won't, and the line lets him know)
        speak(TICKET_VOICE, pick(TICKET_CUT), s => { intro.lady.said = s; });
        const front = frontGuest(state, intro);
        if (front) { const g = guests.get(front)!; speak(g.voice, pick(GUEST_CUT[dressed(state)]), s => { g.line = s?.text; }, true); }
      }
    }
    intro.atWindowT = myTurn ? intro.atWindowT + 1 : 0;
    setUi({ near: null, map: null, nearExit: false, introTip: tipAt(state, intro), introPrompt: atWindow && !intro.scene ? (intro.lady.ko > 0 ? 'barge' : mayShow ? 'ticket' : 'wait') : null, introAhead: intro.me !== null ? countAhead(state, intro) : null });
    return controls;
  },
  drawBackdrop: (ctx, state) => { drawIntroBackdrop(ctx, state); return true; },
  drawBack: (ctx, state) => drawIntroBack(ctx, state),
  drawFront: (ctx, state) => { drawIntroFront(ctx, state); const intro = getIntro(state); if (intro) drawGrab(ctx, state, intro.grab); },
};

// ---------------------------------------------------------------------------------------------------------------
// The way in: in comes his truck, flat out, straight into the pillar at the end of the bay (the horn stuck on after);
// the door won't open, so out of the window he climbs and dives; he says his piece; the guard right there couldn't
// care less ("welcome to Happy Land, sir"). Only the once (crashedIn). Skippable, the lot.

let crashedIn = false;
/** Frames: the truck hits the pillar; he's up in the window; he dives out. */
export const CRASH_AT = 70, EMERGE_AT = 140, DIVE_AT = 164;
/** Where the truck is, and how long since it hit (for intro/art/upper's drawing). */
export const truckNow = (intro: Intro | null, f: number) => {
  const t = intro?.arrival ? intro.arrival.t : 100000;
  const dx = t < CRASH_AT ? -560 + 8 * t : t < CRASH_AT + 12 ? -7 * Math.sin(((t - CRASH_AT) / 12) * Math.PI) : 0;
  const dy = t < CRASH_AT ? ((t >> 1) % 3 === 0 ? -1 : 0) : t < CRASH_AT + 8 ? -Math.round(4 * Math.sin(((t - CRASH_AT) / 8) * Math.PI)) : 0;
  return { dx, dy, crash: t - CRASH_AT, f, emerging: !!intro?.arrival && t >= EMERGE_AT && t < DIVE_AT + 10 };
};

const arrival = (ctx: FrameContext, intro: Intro, controls: object) => {
  const { state } = ctx;
  const a = intro.arrival!, p = state.player;
  // (in the truck till he climbs out of its window)
  p.hidden = a.t < EMERGE_AT; p.inCutscene = true;
  // (it waits for the sound: a browser holds it back till the first key or click, and the crash with no crash in it is
  // nothing; a button on a pad lets it go too, sound or not, the browser not counting those)
  if (a.waiting) {
    setUi({ introCutscene: true, introTip: null, introPrompt: null });
    getAudioContext();
    if (audioRunning() || Object.values(controls).some(v => v === true)) a.waiting = false;
    else return;
  }
  a.t++;
  p.inCutscene = true;
  setUi({ introCutscene: true, introTip: null, introPrompt: null });
  if (a.t > SKIP_AFTER) offerSkip();
  if (a.t > SKIP_AFTER && takeSkip()) { endArrival(state, intro, true); return; }
  const t = a.t;
  // In it comes, flat out (him inside, so not out here yet)
  if (t < EMERGE_AT) { p.hidden = true; p.vel.x = 0; }
  if (t === 1) playSound('carroar', 0.9, -4);
  if (t === 36) playSound('truckhorn', 0.7);
  if (t === CRASH_AT) {
    playSound('crash', 1); playSound('crunch', 1, -6); playSound('glass', 0.8); playSound('slam', 0.9, -4);
    shakeScreen(state, 16, 12);
  }
  // (the horn, stuck on after, honking)
  if (t === CRASH_AT + 26 || t === CRASH_AT + 44) playSound('truckhorn', 0.55, -2);
  // Up in the window: climbing out of it (the door's in front of his legs: see intro/art/upper truckDoorFront)
  if (t >= EMERGE_AT && t < DIVE_AT) {
    const k = Math.min(1, (t - EMERGE_AT) / 16), sill = UPPER - 74;
    p.hidden = false; p.facing = -1;
    p.pos.x = R(258) - p.width / 2;
    // (rising up out of it, then wriggling, stuck at the hips a moment)
    p.pos.y = sill + 4 - k * 48 + (t - EMERGE_AT > 16 ? Math.round(Math.abs(Math.sin(t * 0.8)) * 2) : 0);
    p.vel.x = 0; p.vel.y = 0; p.isGrounded = false;
  }
  // ...and out he dives
  if (t === DIVE_AT) { p.vel.x = -3.4; p.vel.y = -6.5; playSound('jump', 0.8); playSound('whoosh', 0.5); }
  if (t > DIVE_AT + 4 && p.isGrounded && !a.landed) { a.landed = t; p.vel.x = 0; playSound('land', 1); playSound('thud', 0.6, -6); shakeScreen(state, 4, 3); }
  if (a.landed && t === a.landed + 18) p.facing = 1;
  // He says his piece; then the guard right there, who couldn't care less
  if (a.landed && t === a.landed + 26 && !a.said) {
    a.said = true;
    meatheadSays(state, pick(MEATHEAD_PARKED), true, () => {
      const guard = state.enemies.filter(e => e.kind === 'parksec' && e.health > 0).sort((x, y) => Math.abs(x.pos.x - p.pos.x) - Math.abs(y.pos.x - p.pos.x))[0];
      if (!guard) { a.done = 1; return; }
      remarked.add(guard); intro.welcomed = true;
      intro.bark = { e: guard, said: { text: '' } };
      speak(guardVoice(guard), GUARD_WELCOME.clean, s => { if (intro.bark) intro.bark.said = s ?? { text: '' }; if (!s) intro.bark = null; }, true, () => { a.done = 1; }, true);
    }, true);
  }
  // (it doesn't wait forever on the voices)
  if (a.done || (a.landed && t > a.landed + 330)) endArrival(state, intro, false);
};

const endArrival = (state: GameState, intro: Intro, skipped: boolean) => {
  const p = state.player;
  intro.arrival = null;
  p.hidden = false; p.inCutscene = false;
  setUi({ introCutscene: false });
  if (skipped) { p.pos.x = R(190) - p.width / 2; p.pos.y = UPPER - p.height; p.vel.x = 0; p.vel.y = 0; p.isGrounded = true; p.facing = 1; }
};

// ---------------------------------------------------------------------------------------------------------------
// The hallway's moving walkways: anybody stood on one goes along with it

const walkways = (state: GameState) => {
  const on = (x: number) => WALKWAYS.some(([a, b]) => x > R(a) && x < R(b));
  const p = state.player;
  if (p.isGrounded && on(p.pos.x + p.width / 2)) p.pos.x += WALKWAY_SPEED;
  // (anybody else: carried along, unless they're walking back against it: then they just walk, slowly, rather than
  // stand stuck on it treading)
  for (const e of state.enemies) {
    if (e.health <= 0 || e.isBlownAway || Math.abs(e.pos.y + e.height - UPPER) >= 3 || !on(e.pos.x + e.width / 2)) continue;
    const against = e.vel.x < -0.005 || (e.puppet && (e.facing ?? 1) < 0);
    if (!against) e.pos.x += WALKWAY_SPEED;
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Postal: has he started something?

const watchForTrouble = (ctx: FrameContext, intro: Intro) => {
  const { state } = ctx;
  let hit: Enemy | null = null;
  for (const e of state.enemies) {
    if (e.kind !== 'parksec' && !guests.has(e)) continue;
    const was = intro.hp.get(e);
    if (was !== undefined && e.health < was) hit = e;
    intro.hp.set(e, e.health);
  }
  // (somebody of theirs grabbed, or somebody in line)
  const held = intro.grab.held;
  if (held && (held.kind === 'parksec' || guests.has(held))) hit = held;
  if (hit) {
    const g = guests.get(hit);
    // (he's started on the line: nobody's making him wait his turn now)
    if (g) intro.lineFight = true;
    if (g && g.state !== 'flee') {
      g.state = 'flee';
      speak(g.voice, pick(GUEST_HIT), s => { g.line = s?.text; });
    }
    if (!intro.provoked) provoke(ctx, intro, hit);
  }
};

const provoke = (ctx: FrameContext, intro: Intro, near: Enemy | null) => {
  const { state } = ctx;
  intro.provoked = true;
  playSound('alert', 0.8);
  // (the nearest guard shouts it; the ticket lady too, if she's in earshot)
  const p = state.player, px = p.pos.x + p.width / 2;
  const guard = state.enemies.filter(e => e.kind === 'parksec' && e.health > 0).sort((a, b) => Math.abs(a.pos.x - px) - Math.abs(b.pos.x - px))[0];
  if (guard) { const said = { text: '' }; intro.bark = { e: guard, said }; speak(guardVoice(guard), pick(GUARD_ALERT[dressed(state)]), s => { if (intro.bark) intro.bark.said = s ?? { text: '' }; if (!s) intro.bark = null; }); }
  if (px > R(QUEUE_START) - 400 && intro.lady.ko <= 0) speak(TICKET_VOICE, pick(TICKET_ALARM), s => { intro.lady.said = s; }, true);
  intro.barkNext = state.frame + 420;
  void near;
};

// ---------------------------------------------------------------------------------------------------------------
// Park security

/** The detector going off sends out a set number from the office, one after another; then it needs a while to reset. */
const PRACTICE = { batch: 3, every: 60, reset: 360 };
/** Guards who've said their piece to him already (each says one thing, going by). */
const remarked = new WeakSet<Enemy>();
const security = (ctx: FrameContext, intro: Intro) => {
  const { state } = ctx;
  const p = state.player, px = p.pos.x + p.width / 2;
  for (const e of state.enemies) {
    if (e.kind !== 'parksec' || e.health <= 0 || e.isBlownAway) continue;
    e.shootTimer = 0; // (no guns in Happy Land)
    if (intro.provoked) { e.puppet = false; e.harmless = false; continue; }
    // Not started anything: strolling up and down their beat, keeping an eye on him
    e.puppet = true; e.harmless = true;
    if ((e.pauseTimer || 0) > 2) continue;
    e.pauseTimer = 2;
    const post = (e as Enemy & { post?: number }).post ?? e.pos.x;
    const cx = e.pos.x + e.width / 2, near = Math.abs(cx - px) < 170;
    if (near) {
      e.facing = px < cx ? -1 : 1; e.vel.x = 0;
      // (a word as he goes by: once each, now and then, depending on the state of him)
      // (the first of them he comes to welcomes him to the park, always; the rest, a word now and then)
      const first = !intro.welcomed;
      if (!intro.arrival && Math.abs(cx - px) < 120 && !intro.bark && state.frame > intro.barkNext && !remarked.has(e) && (first || Math.random() < 0.02)) {
        remarked.add(e); intro.welcomed = true;
        intro.bark = { e, said: { text: '' } };
        speak(guardVoice(e), first ? GUARD_WELCOME[dressed(state)] : pick(GUARD_IDLE[dressed(state)]), s => { if (intro.bark) intro.bark.said = s ?? { text: '' }; if (!s) intro.bark = null; }, false, undefined, first);
        intro.barkNext = state.frame + 360;
      }
      continue;
    }
    const dir = e.facing ?? 1;
    if ((dir > 0 && cx > post + 80) || (dir < 0 && cx < post - 80)) e.facing = -dir as 1 | -1;
    e.pos.x += (e.facing ?? 1) * 0.6;
    e.vel.x = (e.facing ?? 1) * 0.01;
  }
  // The checkpoint's security office: each time the metal detector goes off, a set number come out of it, one after
  // another (practice: set it off again, once it's reset, for more); nothing else he does brings more
  if (intro.office.open > 0) intro.office.open--;
  if (intro.office.cd > 0) intro.office.cd--;
  if (intro.office.due > 0 && intro.office.cd <= 0) {
    const e = addGuard(state, intro, R(OFFICE_X));
    e.facing = px < R(OFFICE_X) ? -1 : 1;
    intro.office.due--; intro.office.open = 40; intro.office.cd = PRACTICE.every;
    playSound('click', 0.6, -8);
  }
  // Now and then, one of them having a go at him
  if (intro.provoked && state.frame > intro.barkNext && !intro.bark) {
    const onScreen = state.enemies.filter(e => e.kind === 'parksec' && e.health > 0 && !e.isBlownAway && e.pos.x > state.camera.x && e.pos.x < state.camera.x + CANVAS_WIDTH);
    const e = onScreen[Math.floor(Math.random() * onScreen.length)];
    if (e) { intro.bark = { e, said: { text: '' } }; speak(guardVoice(e), pick(GUARD_BARK[dressed(state)]), s => { if (intro.bark) intro.bark.said = s ?? { text: '' }; if (!s) intro.bark = null; }); }
    intro.barkNext = state.frame + 480 + Math.floor(Math.random() * 300);
  }
  if (intro.bark && (intro.bark.e.health <= 0 || intro.bark.e.isBlownAway)) intro.bark = null;
};

/** The metal detector: walked through, it goes off, and that's security on him (jumped over, it never knows). */
const detector = (ctx: FrameContext, intro: Intro) => {
  const { state } = ctx;
  const p = state.player, px = p.pos.x + p.width / 2;
  if (intro.alarm > 0) intro.alarm--;
  if (intro.cool > 0) intro.cool--;
  const inIt = Math.abs(px - R(DETECTOR_X)) < 26 && p.pos.y + p.height > UPPER - 100;
  // (resetting, it lets him through without a peep)
  if (inIt && !intro.inDetector && intro.cool <= 0) {
    intro.alarm = 120; intro.cool = PRACTICE.reset; intro.tripped = true;
    intro.office.due += PRACTICE.batch;
    playSound('alarm', 0.9);
    playSound('click', 1, 12);
    if (!intro.provoked) provoke(ctx, intro, null);
  }
  intro.inDetector = inIt;
};

// ---------------------------------------------------------------------------------------------------------------
// The line

const inLine = (state: GameState) => state.enemies.filter(e => { const g = guests.get(e); return g && (g.state === 'line' || g.state === 'arrive') && e.health > 0 && !e.isBlownAway; });
/** Anybody still in line ahead of him (or ahead of everybody, if he's not in it). */
const lineAhead = (state: GameState, intro: Intro) => inLine(state).some(e => intro.me === null || guests.get(e)!.number < intro.me);
const countAhead = (state: GameState, intro: Intro) => inLine(state).filter(e => intro.me !== null && guests.get(e)!.number < intro.me).length;
const frontGuest = (state: GameState, intro: Intro) => {
  void intro;
  return inLine(state).sort((a, b) => guests.get(a)!.number - guests.get(b)!.number)[0] ?? null;
};

/** How long the window takes over each person (it's real time: he waits); how often somebody new turns up behind him. */
const SERVE = 270, ARRIVE = 420, HURRY_AFTER = 240, HURRY_EVERY = 400, MAX_BEHIND = 5;
const line = (ctx: FrameContext, intro: Intro) => {
  const { state } = ctx;
  const p = state.player, px = p.pos.x + p.width / 2;
  // (he joins the line on reaching it: behind everybody already in it)
  if (intro.me === null && !intro.admitted && px > R(QUEUE_START)) intro.me = intro.nextNumber++;
  // (back behind somebody who was behind him: they're ahead of him now, he's behind them; and off out of the line
  // altogether, behind everybody and past where it starts, he's lost his place: they all move up, nobody waits)
  if (intro.me !== null && !intro.admitted && p.isGrounded) {
    for (const e of inLine(state)) {
      const g = guests.get(e)!;
      if (g.number > intro.me && e.pos.x + e.width / 2 > px + 12) intro.me = g.number + 0.5;
    }
    const behind = inLine(state).some(e => guests.get(e)!.number > intro.me!);
    if (!behind && px < R(QUEUE_START) - 80) intro.me = null;
  }
  // Everybody's place: in number order (him too, if he's in it), from the window back
  const members: { n: number; e: Enemy | null }[] = inLine(state).map(e => ({ n: guests.get(e)!.number, e }));
  if (intro.me !== null && !intro.admitted) members.push({ n: intro.me, e: null });
  members.sort((a, b) => a.n - b.n);
  const meRank = members.findIndex(m => !m.e);
  members.forEach((m, rank) => {
    if (!m.e) return;
    const e = m.e, g = guests.get(e)!;
    e.harmless = true; e.puppet = true; e.shootTimer = 0;
    if ((e.pauseTimer || 0) > 2 || Math.abs(e.vel.y) > 0.5) return;
    e.pauseTimer = 2;
    // (their place: so far back from the window; behind him, so far back from wherever he's actually stood)
    let want = R(FRONT_X - rank * SPACING);
    if (meRank >= 0 && rank > meRank) want = Math.min(want, px - (rank - meRank) * SPACING);
    const cx = e.pos.x + e.width / 2;
    if (Math.abs(want - cx) > 1.5) { e.pos.x += Math.sign(want - cx) * 1.3; e.facing = 1; }
    else if (g.state === 'arrive') g.state = 'line';
    // (they don't let him walk through them: he can push in with his shoulder, or jump over, but not stroll through)
    if (intro.me !== null && g.number < intro.me && !p.isCharging && !grabbing(intro.grab) && p.isGrounded && px < cx && p.pos.x + p.width > e.pos.x + 6) {
      p.pos.x = e.pos.x + 6 - p.width; if (p.vel.x > 0) p.vel.x = 0;
    }
  });
  // The window: the one at the front, served (if he's in the line; till he turns up, it's waiting on its people)
  const front = members[0];
  if (intro.me !== null && front?.e && intro.lady.ko <= 0) {
    const e = front.e, cx = e.pos.x + e.width / 2;
    if (Math.abs(cx - R(FRONT_X)) < 3) {
      if (++intro.serveT >= SERVE) {
        intro.serveT = 0;
        guests.get(e)!.state = 'served';
        if (Math.random() < 0.6) speak(TICKET_VOICE, pick(TICKET_NEXT), s => { intro.lady.said = s; });
        playSound('click', 0.4, 6);
      }
    }
  } else intro.serveT = 0;
  // The served, through the turnstile and the gate; the hit, running off out of it
  for (const e of [...state.enemies]) {
    const g = guests.get(e);
    if (!g || e.health <= 0 || e.isBlownAway) continue;
    if (g.state === 'served') {
      e.pauseTimer = 2; e.facing = 1; e.pos.x += 1.4;
      if (e.pos.x > R(GATE_X) + 120) state.enemies = state.enemies.filter(o => o !== e);
    } else if (g.state === 'flee') {
      e.harmless = true; e.puppet = true;
      if ((e.pauseTimer || 0) > 2 || Math.abs(e.vel.y) > 0.5) continue;
      e.pauseTimer = 2; e.facing = -1; e.pos.x -= 3;
      if (e.pos.x < state.camera.x - 200) state.enemies = state.enemies.filter(o => o !== e);
    }
  }
  // People turning up behind him while he waits
  if (intro.me !== null && !intro.admitted && ++intro.arriveT >= ARRIVE) {
    intro.arriveT = 0;
    const behind = inLine(state).filter(e => guests.get(e)!.number > intro.me!).length;
    if (behind < MAX_BEHIND) addGuest(state, intro, Math.min(px, R(FRONT_X - (members.length) * SPACING)) - 420, true);
  }
  // The state of him: it happening right in front of them, the nearest one says so; stood near him like that, now and
  // then one of them has something to say about it (each says it once)
  const k = dressed(state);
  if (k !== 'clean' && px > R(QUEUE_START) - 300 && !intro.admitted) {
    const near = inLine(state).filter(e => Math.abs(e.pos.x + e.width / 2 - px) < 220);
    const now = k !== intro.seenDressed;
    if (now || state.frame > intro.reactNext) {
      const fresh = near.filter(e => !guests.get(e)!.reacted?.includes(k));
      const e = now ? near.sort((a, b) => Math.abs(a.pos.x - px) - Math.abs(b.pos.x - px))[0] : fresh[Math.floor(Math.random() * fresh.length)];
      if (e) {
        const g = guests.get(e)!;
        (g.reacted ??= []).push(k);
        speak(g.voice, pick((now ? GUEST_REACT_NOW : GUEST_REACT)[k]), s => { g.line = s?.text; }, now);
        intro.reactNext = state.frame + 300 + Math.floor(Math.random() * 240);
      } else if (!now) intro.reactNext = state.frame + 60;
    }
  }
  intro.seenDressed = k;
  // Holding it up: at the front, not showing his ticket: the people behind let him know
  if (intro.atWindowT > HURRY_AFTER && !intro.scene && (intro.atWindowT - HURRY_AFTER) % HURRY_EVERY === 0) {
    const behind = inLine(state).filter(e => guests.get(e)!.number > (intro.me ?? 0));
    const e = behind[Math.floor(Math.random() * behind.length)];
    if (e) { const g = guests.get(e)!; speak(g.voice, pick(GUEST_HURRY[dressed(state)]), s => { g.line = s?.text; }); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The ticket window

const startScene = (state: GameState, intro: Intro, kind: Dressed | 'punch') => {
  const k: Dressed = kind === 'punch' ? dressed(state) : kind;
  intro.scene = { kind: k, t: 0, done: false, punched: false, card: false, cardAt: 0, pip: -1 };
  const sc = intro.scene;
  if (kind === 'punch' || intro.lady.ko > 0) {
    // (past caring: over the counter at her, and in)
    sc.punched = true; sc.done = true;
    return;
  }
  // Naked: no ticket, nowhere he could have kept one: he panics, then she gets it in the face (up close, in a box)
  if (k === 'nude') { meatheadSays(state, pick(MEATHEAD_TICKET.nude), true, () => punchCam(intro), true); return; }
  // Him first, always: then out comes the ticket, then her (nobody talks over anybody)
  meatheadSays(state, pick(MEATHEAD_TICKET[k]), true, () => ladyTurn(intro), true);
};

/** The punch, up close (see punchCam.ts): how long it runs, the frame the fist lands. */
export const PIP_LEN = 170, PIP_HIT = 40;
const punchCam = (intro: Intro) => { const sc = intro.scene; if (sc && sc.pip < 0) sc.pip = 0; };

/** His line said: out comes the ticket (or the slap on his bare hip), and it's her turn. */
const ladyTurn = (intro: Intro) => {
  const sc = intro.scene;
  if (!sc || sc.card) return;
  sc.card = true; sc.cardAt = sc.t;
  speak(TICKET_VOICE, pick(TICKET_LADY[sc.kind]), s => { intro.lady.said = s; }, true, () => { if (intro.scene === sc) sc.done = true; }, true);
};

const scene = (ctx: FrameContext, intro: Intro) => {
  const sc = intro.scene!;
  sc.t++;
  // Naked: he panics (his line, or its time), then the punch, up close; then in he goes
  if (sc.kind === 'nude' && !sc.punched) {
    if (sc.pip < 0 && sc.t > 260) punchCam(intro);
    if (sc.pip >= 0 && ++sc.pip === PIP_HIT) knockOut(ctx, intro);
    setUi({ introTicket: null, introCutscene: true, introPrompt: null });
    if (sc.pip < PIP_LEN) return;
    intro.admitted = true; intro.scene = null;
    setUi({ introTicket: null, introCutscene: false });
    return;
  }
  // (it doesn't hang on the voices: his line's had its time, the ticket comes out; hers has had its time, on we go)
  if (!sc.card && !sc.punched && sc.t > 200) ladyTurn(intro);
  if (sc.card && !sc.done && sc.t - sc.cardAt > 330) sc.done = true;
  // (the ticket, up close: what he's got, or hasn't)
  setUi({ introTicket: sc.card && !sc.punched ? sc.kind : null, introCutscene: true, introPrompt: null });
  // (the lines might never get said, the voice busy or missing: it doesn't wait forever for them)
  if (!sc.done || sc.t < 150) {
    if (sc.punched && sc.t === 10) knockOut(ctx, intro);
    if (!sc.punched || sc.t < 40) return;
  }
  // How it ends: she lets him in (or she's in no state to stop him)
  intro.admitted = true;
  intro.scene = null;
  setUi({ introTicket: null, introCutscene: false });
};

const knockOut = (ctx: FrameContext, intro: Intro) => {
  const { state } = ctx;
  intro.lady.ko = 1; intro.lady.said = null;
  playSound('crunch', 1, -2); playSound('punch', 1);
  shakeScreen(state, 10, 6);
  state.damageNumbers.push({ id: `ko-${state.frame}`, text: 'K.O.!', pos: { x: R(WINDOW_X), y: GROUND_Y - 120 }, vel: { x: 0, y: -1.5 }, life: 100, maxLife: 100, isCritical: true, isCallout: true, color: '#FDE047' });
  if (!intro.provoked) provoke(ctx, intro, null);
};

// ---------------------------------------------------------------------------------------------------------------
// The PA, and who's saying what

const talk = (ctx: FrameContext, intro: Intro) => {
  const { state } = ctx;
  const px = state.player.pos.x + state.player.width / 2;
  if (intro.lady.ko > 0) intro.lady.ko++;
  if (px > R(USA_START) && state.frame > intro.pa.next && !intro.scene) {
    intro.pa.next = state.frame + 1500 + Math.floor(Math.random() * 600);
    // (never the same thing twice in the one life: once it's said them all, it's said its piece)
    const fresh = PA_LINES.filter(l => !intro.pa.heard.includes(l));
    if (fresh.length) { const line = pick(fresh); speak(PA_VOICE, line, s => { intro.pa.said = s; if (s && !intro.pa.heard.includes(line)) intro.pa.heard.push(line); }); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// What the panel in the corner's telling him, where he is

export type IntroTip = 'postal' | 'grabs' | 'line' | null;
const tipAt = (state: GameState, intro: Intro): IntroTip => {
  const x = state.player.pos.x + state.player.width / 2 - X0;
  if (intro.scene) return null;
  if (x < 1300) return 'postal';
  if (x > 3700 && x < CHECK_END) return 'grabs';
  if (x > QUEUE_START - 300 && !intro.admitted) return 'line';
  return null;
};
