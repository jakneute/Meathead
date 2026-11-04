// CARTOON LAND'S HIDDEN ARMOR: THE HAND ARMOR, in the cave under the Sky-High Trolley's ball pit (the owner's brief,
// 2026-11-01: "on the third ball pit in the sillyland, there's a trolley that goes over the ball pit. make sure the
// camera pans down a bit when on the track so you can see the ball pit for one. in the middle of the ball pit is an
// opening with light coming down. if you drop down the opening, you will fall into a big hole and con-fuck-tious will be
// there... when you're done, there's a cannon you can hop into that will blast you through the surface and to the end
// of the tram line.") An OUTSIDE-THE-BOX EXPLORATION find (the placement rule's first kind), far enough off the path
// for a return cannon.
//
//   THE CAMERA: on the trolley's track (or the trolley's roof, or a lid) over the pit, it eases down (cameraRow) so the
//     balls are in view. Off it, back up, eased the same.
//   THE OPENING: a hole in the balls in the middle of the pit, light shining down into it (hiddenArt.ts). Drop into it
//     and he falls through into the cave (instead of the pit's bounce); anywhere else in the pit is as ever.
//   THE CAVE: a big hole under the park (world: under the square's far end, well under the ground's blocks). He drops
//     in through the shaft onto a heap of balls that came down with the light. CON-FUCK-TIOUS is down here, at his
//     heavy bag in the giant white cartoon gloves.
//   THE MEETUP (a cutscene, SKIP >> for all of it, bubbles; confucktious/meetup.ts's script): if it's the first time he's
//     met Ben anywhere, the long intro (who Ben is, what he's for: junk armor hidden in every land); if he's met him in
//     another land, the short one. Either way Ben's gross-up, the gloves on him and a beatdown flurry at the camera
//     (gross.ts); Meathead wants the gloves; Ben sells them and sets the trial.
//   THE TRIAL (in play; invented, the owner's "fill in the unspecified"): TAKE THE SHAKER OUT OF MY HAND (his protein
//     shaker). A grab at it (the beatdown's Y + B, its prompt up beside him) and Ben whips it away: twice, a dry line
//     each, a hint after the second ("...think about low"). The third grab goes low: right in Ben's nuts (the cheap
//     shot, foreshadowed, never said). Can't get stuck: three grabs near him, whatever happens.
//   THE GIFT (a cutscene, skippable): the gloves are his (setPiece('hands'), saved there and then); Ben's tease (the
//     owner's line), Meathead's enamored line (the owner's). Then the YOU GOT card (PieceGotCard.tsx: what it is, what
//     it does, the buttons, the surprise kept a surprise), PRESS ANY BUTTON.
//   THE PRACTICE: a padded CAPTAIN SPRINKLES understudy (m2:ct_dummy, the square's cupcake mascot: bulky, grab-proof
//     without the gloves, harmless: no contact damage, never attacks), one at a time, another along a moment after each
//     goes down. Ben nudges him to the cannon now and then (the owner: "you are encouraged to step into the cannon when
//     you are done").
//   THE CANNON (upgrades/returnCannon.ts): up by it to get in; it swings toward the trolley line's end, fires him up
//     through a hole in the ceiling and out of the pit's opening on the arc to safe ground past the end station.
//   ONCE GOT: he's still there (a line, then the nudges), the practice one too; the gloves aren't given again (has()).
//
// Nothing here outlives a death but what he's got (the gloves, in the save) and the meetup having run this visit: a
// death in the cave puts him back at the trolley's checkpoint, as ever.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import type { Enemy, EnemyKind } from '../../../m1/types';
import { NO_CONTROLS } from '../../../m1/game/platform/input';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { pickLine, silenceAll } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { makeKindEnemy, mid } from '../../../m1/game/enemies/kinds';
import { CANVAS_WIDTH, CANVAS_HEIGHT, KICK_POSE_FRAMES } from '../../../m1/constants';
import { registerM2Kind, registerKindCallouts } from '../../kinds';
import { grabLocked, grabHolding } from '../../moves/grab';
import { pollM2, pressed as m2Pressed, btn as m2Btn } from '../../input';
import { setUi } from '../../store';
import { saveProgress } from '../../save';
import { has, setPiece, setBenMet, benGave, setBenGave } from '../../upgrades/state';
import { makeCannon, updateCannon, cannonBusy, cannonCeilingX, type Cannon } from '../../upgrades/returnCannon';
import { NUDGE, BYE_MEATHEAD, BYE_BEN, PIECE_LINES, benSays, drawBenGross, drawBenGrossBack, warmBenGross, frameBen, releaseBenCam, meetupScript, startScript, tickScript, skipScript, giftCoda, type BenPose, type BenTalk, type Script, makeGate, markGate, cannonLocked, type Gate } from '../../upgrades/confucktious';
import { teleport, meatheadSays, byPants, pantsOf, solid, landVisit, saidOver } from '../section';
import { GY } from '../geometry';
import { drawMascot } from './kindArt';
import { KILL_CALLS } from './lines';
import { bouncing } from '../pitBounce';
import { X, TROLLEY, PITS, HOLE } from './layout';

// ---------------------------------------------------------------------------------------------------------------
// Where

export const HOLE_X = X((HOLE.a + HOLE.b) / 2);
/** The trolley's pit (the third), from the layout. */
const PIT3 = PITS[2];
/** The cave (world): its ends, its floor, its ceiling; under the square's far end, well under the ground's blocks. */
export const CAVE = { a: X(12100), b: X(13300), floor: GY + 2600, ceil: GY + 2600 - 430 };
/** The YOU GOT card's least time up before it can be closed (frames). */
const CARD_HOLD = 90;
/** Where he comes down (the shaft), where Ben stands, his heavy bag, where the practice one turns up, the cannon. */
export const SHAFT_X = CAVE.a + 150, CANNON_X = CAVE.a + 380, BEN_X = CAVE.a + 700, BAG_X = BEN_X + 52, PRACTICE_X = CAVE.a + 960;
/** Out of the pit's opening, on to safe ground past the trolley's end station (nobody there, nothing running). */
const EXIT = { x: HOLE_X, y: GY + 18 }, DEST = { x: X(12330), y: GY };

/** He's down in the cave (or on his way up out of it). */
export const inCave = (state: GameState) => {
  const p = state.player, cx = p.pos.x + p.width / 2;
  return p.pos.y + p.height > GY + 1500 && cx > CAVE.a - 200 && cx < CAVE.b + 200;
};
/** Up on the trolley's track (its roof, a lid) over its pit: the camera eases down to show the balls. */
export const overTrolleyPit = (state: GameState) => {
  const p = state.player, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  return cx > X(PIT3[0]) && cx < X(PIT3[1]) && feet < GY - 100 && feet > GY - TROLLEY.h - 220;
};

// ---------------------------------------------------------------------------------------------------------------
// The practice one: a padded understudy in the square's cupcake suit (harmless; grab-proof without the gloves)

registerM2Kind({
  kind: 'm2:ct_dummy', stats: { w: 66, h: 106, hp: 260, contact: 0, mass: 440 },
  humanoid: true, gender: 'm', head: { x: 2, y: -84, r: 18 }, grab: 'none', pathing: false,
  // (stands its ground facing him, shuffling up close when he's off; never attacks)
  ai: (ctx, e) => {
    const pm = mid(ctx.state.player), dx = pm.x - mid(e).x;
    e.aiState = 'near';
    e.facing = dx < 0 ? -1 : 1;
    e.vel.x = Math.abs(dx) > 120 && Math.abs(dx) < 500 ? Math.sign(dx) * 0.6 : 0;
    return false;
  },
  draw: (c, e, f) => drawMascot(c, e, f),
});
registerKindCallouts('m2:ct_dummy', KILL_CALLS['m2:ct_mascot']);

// ---------------------------------------------------------------------------------------------------------------
// State (keyed on state.stage: rebuilt with the stage on every death)

type Phase = 'out' | 'meet' | 'trial' | 'gift' | 'card' | 'done';
export interface Hidden {
  phase: Phase;
  /** The cutscene's clock (all of it), its current beat, and a token (bumped on a skip: a line's done-callback from
   *  before it does nothing). */
  all: number; beat: number; token: number;
  /** The meetup's script (its gross-up: script.gross). */
  script: Script | null;
  ben: BenTalk & { pose: BenPose; facing: 1 | -1; poseT: number; piece: 'hands' | null };
  /** The trial: grabs at the pebble so far, the grab's lock last frame, when the nut shot landed. */
  tries: number; lockWas: boolean; nutsAt: number;
  /** The third try: Meathead's nut kick (frames in, -1 not on; the side he kicks from); the shaker dropped out of
   *  Ben's hand (falling, then lying there). */
  kickT: number; kickDir: 1 | -1; kickFrom: number;
  shaker: { x: number; y: number; vx: number; vy: number } | null;
  /** The card's up since. */
  cardT: number;
  /** The card's buffer's over and every button's been let go: a press closes it. */
  cardArmed: boolean;
  practice: Enemy | null; respawn: number; goodSaid: boolean;
  nudgeAt: number;
  cannon: Cannon;
  /** The cannon chained while the trial's on (trialGate.ts: the cave's no other way out). */
  gate: Gate;
  /** Buttons last frame (the card's any-button). */
  was: Partial<Controls>;
}
const stores = new WeakMap<object, Hidden>();
export const hiddenOf = (state: GameState): Hidden => {
  const key = (state.stage ?? state) as object;
  let h = stores.get(key);
  if (!h) stores.set(key, h = {
    phase: 'out', all: 0, beat: 0, token: 0, script: null,
    ben: { said: null, pose: 'flurry', facing: 1, poseT: 0, piece: 'hands' },
    tries: 0, lockWas: false, nutsAt: -1, kickT: -1, kickDir: 1, kickFrom: 0, shaker: null, cardT: 0, cardArmed: false, practice: null, respawn: 30, goodSaid: false, nudgeAt: 0,
    cannon: makeCannon(CANNON_X, CAVE.floor, EXIT, DEST), gate: makeGate('ct-ben-gate', CANNON_X, CAVE.floor, 0, 0), was: {},
  });
  return h;
};
/** The meetup's run this visit (a death after it, back down: straight to the trial). */
let metVisit = -1;
/** The cave's turned off contact hurts (and turns them back on as he leaves). */
let setNoContact = false;

/** Where the cannon's shot punches up through the ceiling (the art's hole). */
export const cannonHoleX = (state: GameState) => cannonCeilingX(hiddenOf(state).cannon, CAVE.ceil);

// ---------------------------------------------------------------------------------------------------------------
// Each frame (the section's update, before the hazards: the opening has to beat the pit's bounce to him)

export const buildHidden = (state: GameState) => {
  // (the cave's floor and its two end walls)
  solid(state, CAVE.a - 60, CAVE.floor, CAVE.b - CAVE.a + 120, 400, { hidden: true, tag: 'ct-cave-floor' });
  solid(state, CAVE.a - 60, CAVE.ceil - 1200, 60, 1600 + (CAVE.floor - CAVE.ceil), { hidden: true, tag: 'ct-cave-l' });
  solid(state, CAVE.b, CAVE.ceil - 1200, 60, 1600 + (CAVE.floor - CAVE.ceil), { hidden: true, tag: 'ct-cave-r' });
};

export const updateHidden = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, p = state.player, h = hiddenOf(state);
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  // Into the opening: down into the cave
  if (!inCave(state) && p.health > 0 && !p.inCutscene && !bouncing(state) && p.vel.y > 0 && cx > X(HOLE.a) + 6 && cx < X(HOLE.b) - 6 && feet > GY + 4 && feet < GY + 70) {
    for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: cx + (Math.random() - 0.5) * 40, y: GY }, vel: { x: (Math.random() - 0.5) * 5, y: -2 - Math.random() * 4 }, life: 30, color: ['#EF4444', '#FDE047', '#3B82F6', '#22C55E', '#F472B6'][i % 5], size: 5 });
    playSound('whoosh', 0.7, -8);
    teleport(state, SHAFT_X, CAVE.ceil - 40);
    p.vel.y = 9; p.vel.x = 0;
    state.camera.y = CAVE.floor - 500;
    warmBenGross();
    h.phase = 'out';
  }
  // (the camera on him and Ben whenever Ben's talking, the meetup and the gift through (the owner's "make sure he is in
  // frame at every meeting"); the cannon's got the camera once it's busy)
  if (cannonBusy(h.cannon)) releaseBenCam(state);
  else frameBen(state, inCave(state) && (h.phase === 'meet' || h.phase === 'gift' || h.phase === 'card' || !!h.ben.said), BEN_X, CAVE.floor, { a: CAVE.a - 40, b: CAVE.b + 40 });
  if (!inCave(state)) {
    // (out of the cave: bumping into things hurts again)
    if (setNoContact) { p.noContactHurt = false; setNoContact = false; }
    // (out of the cave: the practice one's gone with him)
    if (h.practice) { state.enemies = state.enemies.filter(e => e !== h.practice); h.practice = null; }
    h.ben.said = null;
    setUi({ gotPiece: null, beatPrompt: null });
    return updateCannon(ctx, h.cannon, controls);
  }
  h.ben.poseT++;
  // (a practice room: nothing down here hurts him, the practice one least of all; the owner: "make sure test enemies
  // cannot hurt you". Its contact damage is nothing already, but a bump still counts as a hurt in the engine: the
  // flinch, the knockback, the i-frames)
  p.noContactHurt = true; setNoContact = true;
  updateShaker(h);
  const pressed = (k: keyof Controls) => !!controls[k] && !h.was[k];
  const anyPress = pressed('jump') || pressed('shoot') || pressed('special') || pressed('secondary') || pressed('charge');
  h.was = { ...controls };
  // Down, and on his feet: what's on
  if (h.phase === 'out' && p.isGrounded && p.health > 0) {
    if (benGave('hands')) { h.phase = 'done'; h.ben.piece = null; h.respawn = 40; h.nudgeAt = state.frame + 900; setPose(h, 'fold'); benSays(h.ben, pickLine(byPants(state, PIECE_LINES.hands.idle))); }
    else if (metVisit === landVisit()) startTrial(state, h);
    else startMeet(state, h);
  }
  let out = controls;
  switch (h.phase) {
    case 'meet': out = runMeet(state, h); break;
    case 'trial': runTrial(ctx, h); break;
    case 'gift': out = runGift(state, h); break;
    case 'card': {
      p.inCutscene = true; p.vel.x = 0;
      h.cardT++;
      // (a buffer before it'll close (the owner: "give a buffer before input can be accepted ... so the player doesn't
      // accidentally close it if they mash buttons"): CARD_HOLD frames, then every button let go once, and only then a
      // fresh press closes it; its PRESS ANY BUTTON shows only once it's armed)
      const held = !!(controls.jump || controls.shoot || controls.special || controls.secondary || controls.charge);
      if (!h.cardArmed && h.cardT > CARD_HOLD && !held) h.cardArmed = true;
      setUi({ gotPiece: 'hands', gotPieceReady: h.cardArmed });
      if (h.cardArmed && anyPress) {
        h.phase = 'done'; p.inCutscene = false; setUi({ gotPiece: null, gotPieceReady: false });
        h.respawn = 20; h.nudgeAt = state.frame + 2400;
        setPose(h, 'fold');
        setTimeout(() => { if (hiddenOf(state) === h) benSays(h.ben, PIECE_LINES.hands.practice[0]); }, 500);
      }
      out = { ...NO_CONTROLS };
      break;
    }
    case 'done': runDone(state, h); break;
  }
  if (h.phase !== 'card') setUi({ gotPiece: null });
  if (h.phase !== 'trial') setUi({ beatPrompt: null });
  // (the cannon chained till the shaker's his: UP at it, Ben's bark)
  markGate(state, h.gate, h.phase === 'trial' && h.nutsAt < 0);
  if (h.phase === 'trial') cannonLocked(state, h.cannon, out, h.ben);
  // The cannon: only once the trial's cleared (the owner: "the canon shouldn't be accidentally enterable until you clear
  // the challenge"): no getting in, no prompt, before
  if (h.phase === 'done' || h.phase === 'out' || cannonBusy(h.cannon)) {
    out = updateCannon(ctx, h.cannon, out, {
      onBoard: (st) => {
        if (h.practice) { st.enemies = st.enemies.filter(e => e !== h.practice); h.practice = null; }
        silenceAll(); h.ben.said = null;
        meatheadSays(st, pickLine(BYE_MEATHEAD), true, () => { if (hiddenOf(st) === h) benSays(h.ben, pickLine(BYE_BEN)); });
      },
      onExit: (st, x, y) => {
        for (let i = 0; i < 30; i++) st.particles.push({ pos: { x: x + (Math.random() - 0.5) * 50, y: y - 10 }, vel: { x: (Math.random() - 0.5) * 9, y: -4 - Math.random() * 9 }, life: 40, color: ['#EF4444', '#FDE047', '#3B82F6', '#22C55E', '#F472B6', '#FB923C'][i % 6], size: 6, grav: 0.35 } as typeof st.particles[number]);
        playSound('boing', 0.9, -10); shakeScreen(st, 6, 5);
      },
    });
  }
  return out;
};

const setPose = (h: Hidden, pose: BenPose) => { if (h.ben.pose !== pose) { h.ben.pose = pose; h.ben.poseT = 0; } };
const freeze = (state: GameState) => { const p = state.player; p.inCutscene = true; p.vel.x = 0; state.projectiles = state.projectiles.filter(q => q.owner !== 'player'); };

// ---- the meetup (the first meeting's long intro, or a later one's short one: meetup.ts)
const startMeet = (state: GameState, h: Hidden) => {
  h.phase = 'meet'; h.all = 0; h.token++;
  metVisit = landVisit();
  h.script = startScript(meetupScript(pantsOf(state), PIECE_LINES.hands));
  freeze(state);
  setPose(h, 'flurry'); h.ben.facing = 1;
};
const runMeet = (state: GameState, h: Hidden): Controls => {
  const p = state.player, s = h.script!;
  freeze(state); h.all++;
  p.facing = BEN_X > p.pos.x + p.width / 2 ? 1 : -1;
  const end = () => { setBenMet(true); saveProgress(); h.script = null; startTrial(state, h); };
  if (h.all > SKIP_AFTER) { offerSkip(); if (takeSkip()) { silenceAll(); skipScript(s); h.ben.said = null; end(); return { ...NO_CONTROLS }; } }
  // (a beat of him at his heavy bag first; then he turns to Meathead for the lot)
  if (h.all > 40) {
    tickScript(state, s, h.ben);
    if (s.i > 0 || s.waiting) { setPose(h, s.pose); h.ben.facing = -1; }
    if (s.done) end();
  }
  return { ...NO_CONTROLS };
};

// ---- the trial
const startTrial = (state: GameState, h: Hidden) => {
  h.phase = 'trial'; h.tries = 0; h.nutsAt = -1;
  state.player.inCutscene = false;
  setPose(h, 'offer'); h.ben.facing = -1; h.lockWas = grabLocked();
};
const runTrial = (ctx: FrameContext, h: Hidden) => {
  const { state } = ctx, p = state.player, L = PIECE_LINES.hands;
  const cx = p.pos.x + p.width / 2, dx = Math.abs(cx - BEN_X);
  h.ben.facing = cx < BEN_X ? -1 : 1;
  const lock = grabLocked(), started = lock && !h.lockWas;
  h.lockWas = lock;
  if (h.nutsAt >= 0) {
    // (the nut shot's landed: winded, then he gives it up)
    setUi({ beatPrompt: null });
    if (state.frame - h.nutsAt === 50) {
      const tok = h.token;
      benSays(h.ben, pickLine(L.pass), () => { if (h.token === tok) meatheadSays(state, pickLine(byPants(state, L.passed)), true, () => { if (h.token === tok && h.phase === 'trial') startGift(state, h); }); });
    }
    // (in case a line never gets its turn)
    if (state.frame - h.nutsAt > 900 && h.phase === 'trial') startGift(state, h);
    return;
  }
  // The third try: a nut kick (the owner: "for the third grab attempt, just make meathead do the nut kick and make it
  // look more natural"): a step in, the boot up between his legs (the engine's kick pose, as the cheap shot's), Ben
  // doubled over, the shaker out of his hand
  if (h.kickT >= 0) { runKick(state, h); return; }
  // (back to holding it out once he's whipped it away)
  if (h.ben.pose === 'yank' && h.ben.poseT > 40) setPose(h, 'offer');
  setUi({ beatPrompt: dx < 170 && p.health > 0 ? 'TAKE THE SHAKER' : null });
  // (the third: caught before the grab gets it (it's polled here first this frame), and a kick instead)
  if (h.tries === 2 && dx < 150 && p.isGrounded && p.health > 0 && !lock) {
    pollM2(state.frame);
    const beat = m2Pressed('beatKey') || (m2Btn('y') && m2Pressed('b')) || (m2Pressed('y') && m2Btn('b'));
    if (beat) {
      h.tries = 3; h.kickT = 0; h.kickDir = cx < BEN_X ? 1 : -1; h.kickFrom = cx;
      p.inCutscene = true; p.vel.x = 0; p.facing = h.kickDir;
      silenceAll(); h.ben.said = null;
      playSound('whoosh', 0.6, -4);
      setUi({ beatPrompt: null });
      return;
    }
  }
  if (!started || dx > 150) return;
  h.tries++;
  if (h.tries < 3) {
    setPose(h, 'yank');
    playSound('whoosh', 0.8, 6);
    silenceAll(); h.ben.said = null;
    benSays(h.ben, pickLine(L.miss), h.tries === 2 ? () => { if (hiddenOf(state) === h && h.nutsAt < 0) benSays(h.ben, L.hint[0]); } : undefined);
  }
};
/** The kick's beats: the step in, the boot's up (it lands), him free again. */
const KICK_IN = 14, KICK_HIT = KICK_IN + 8, KICK_END = KICK_HIT + 34;
/** Where his middle stands from Ben's for it (the kick's foot reaches ~40 ahead). */
const KICK_OFF = 50;
const runKick = (state: GameState, h: Hidden) => {
  const p = state.player, t = ++h.kickT;
  p.inCutscene = true; p.vel.x = 0; p.facing = h.kickDir;
  state.playerStunTimer = Math.max(state.playerStunTimer, 2);
  setUi({ beatPrompt: null });
  // (a step in to him, easing to a stop)
  const toX = BEN_X - h.kickDir * KICK_OFF;
  if (t <= KICK_IN) { const k = t / KICK_IN; p.pos.x = h.kickFrom + (toX - h.kickFrom) * (k * (2 - k)) - p.width / 2; }
  if (t === KICK_IN) { p.kickPose = KICK_POSE_FRAMES; playSound('whoosh', 0.9, -6); }
  if ((p.kickPose ?? 0) > 0 && t > KICK_IN) p.kickPose!--;
  if (t === KICK_HIT) {
    // (it lands: doubled over, eyes crossed, the shaker out of his hand)
    setPose(h, 'nuts');
    playSound('punch', 1, -8); playSound('crunch', 0.7, 4); playSound('twinkle', 0.7, 12); shakeScreen(state, 8, 5);
    h.shaker = { x: BEN_X + h.ben.facing * 22, y: CAVE.floor - 64, vx: -h.kickDir * 1.6, vy: -4 };
  }
  if (t >= KICK_END) { h.kickT = -1; p.inCutscene = false; p.kickPose = 0; h.nutsAt = state.frame; }
};
/** The dropped shaker: down it falls, a bounce, and it lies there. */
const updateShaker = (h: Hidden) => {
  const s = h.shaker;
  if (!s || (s.vy === 0 && s.vx === 0)) return;
  s.vy += 0.45; s.x += s.vx; s.y += s.vy;
  if (s.y >= CAVE.floor - 2) { s.y = CAVE.floor - 2; if (Math.abs(s.vy) > 2) { s.vy = -s.vy * 0.35; s.vx *= 0.5; playSound('clink', 0.4, 4); } else { s.vy = 0; s.vx = 0; } }
};

// ---- the gift
const startGift = (state: GameState, h: Hidden) => {
  h.phase = 'gift'; h.all = 0; h.beat = 0; h.token++;
  // (his for good, there and then: a skip, a death, a quit can't lose them)
  setPiece('hands', true); setBenGave('hands'); saveProgress();
  freeze(state);
  setPose(h, 'give');
};
const runGift = (state: GameState, h: Hidden): Controls => {
  const p = state.player, L = PIECE_LINES.hands;
  freeze(state); h.all++;
  p.facing = BEN_X > p.pos.x + p.width / 2 ? 1 : -1;
  h.ben.facing = p.facing === 1 ? -1 : 1;
  const toCard = () => { h.ben.piece = null; setPose(h, 'fold'); h.phase = 'card'; h.cardT = 0; h.cardArmed = false; };
  if (h.all > SKIP_AFTER) { offerSkip(); if (takeSkip()) { silenceAll(); h.token++; h.ben.said = null; if (h.script) { skipScript(h.script); h.script = null; } toCard(); return { ...NO_CONTROLS }; } }
  const tok = h.token;
  switch (h.beat) {
    case 0: if (h.all > 20) { h.beat = 100; benSays(h.ben, L.gift[0], () => { if (h.token === tok) h.beat = 1; }); } break;
    // (the gloves off his hands and onto Meathead's)
    case 1: h.beat = 101; h.ben.piece = null; setPose(h, 'fold'); playSound('powerup', 0.8, 0);
      for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: p.pos.x + p.width / 2 + (Math.random() - 0.5) * 40, y: p.pos.y + 30 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 3 }, life: 30, color: i % 2 ? '#FFFFFF' : '#FDE047', size: 3 });
      benSays(h.ben, L.tease[0], () => { if (h.token === tok) h.beat = 2; });
      break;
    case 2: h.beat = 102; meatheadSays(state, pickLine(byPants(state, L.enamored)), true, () => { if (h.token === tok) h.beat = 3; }); break;
    // (the last piece of the eight: the full set, his last word; else straight to the card)
    case 3: { const coda = giftCoda(pantsOf(state)); if (!coda.length) { toCard(); break; } h.beat = 4; h.script = startScript(coda); break; }
    case 4: tickScript(state, h.script!, h.ben); setPose(h, h.script!.pose); if (h.script!.done) { h.script = null; toCard(); } break;
  }
  return { ...NO_CONTROLS };
};

// ---- after: practice, the nudges
const runDone = (state: GameState, h: Hidden) => {
  const p = state.player, cx = p.pos.x + p.width / 2, L = PIECE_LINES.hands;
  // (Ben: at his heavy bag when he's off; arms folded, watching, when he's close)
  const close = Math.abs(cx - BEN_X) < 200;
  if (close) { setPose(h, 'fold'); h.ben.facing = cx < BEN_X ? -1 : 1; }
  else { setPose(h, 'flurry'); h.ben.facing = 1; }
  // The practice one: one at a time, another a moment after each goes
  const e = h.practice;
  const gone = !e || ((e.health <= 0 || e.isBlownAway || !state.enemies.includes(e)) && grabHolding() !== e);
  if (e && grabHolding() === e && !h.goodSaid && has('hands')) { h.goodSaid = true; benSays(h.ben, pickLine(L.good)); }
  if (gone && !cannonBusy(h.cannon)) {
    if (e) { h.practice = null; h.respawn = 80; }
    else if (--h.respawn <= 0) {
      const d = makeKindEnemy('m2:ct_dummy' as EnemyKind, PRACTICE_X, CAVE.floor);
      d.homeX = d.pos.x; d.homeY = d.pos.y; d.variant = state.frame % 7; d.facing = -1; d.seen = true;
      state.enemies.push(d); h.practice = d;
      playSound('poof', 0.6, -2);
      for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: PRACTICE_X + (Math.random() - 0.5) * 60, y: CAVE.floor - 50 + (Math.random() - 0.5) * 60 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 30, color: i % 2 ? '#F9A8D4' : '#FFFFFF', size: 6 });
    }
  }
  // (now and then: the cannon, grasshopper)
  if (state.frame > h.nudgeAt && !p.inCutscene && !h.ben.said && !cannonBusy(h.cannon)) {
    h.nudgeAt = state.frame + 2700;
    benSays(h.ben, pickLine(byPants(state, NUDGE)));
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing hooks (hiddenArt.ts draws the place; here, what's on screen of the scene)

/** Screen space: his gross-up while it's up; SKIP >> while the scene can be skipped. */
export const drawHiddenHud = (c: CanvasRenderingContext2D, state: GameState) => {
  if (!inCave(state)) return;
  const h = hiddenOf(state);
  const sc = h.phase === 'meet' ? h.script : null;
  if (sc?.gross) {
    drawBenGrossBack(c, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawBenGross(c, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10, 0.9 + 0.1 * Math.min(1, sc.grossT / 10), state.frame, 'hands', !!h.ben.said);
    // (his words over it, in a bubble: it's a skippable scene)
    if (h.ben.said) saidOver(c, h.ben.said.text, CANVAS_WIDTH / 2 + 60, 120);
  }
  if ((h.phase === 'meet' || h.phase === 'gift') && h.all > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
};
