// FUTURE LAND'S HIDDEN ARMOR: THE ARMGUARDS (the BEEF BRACERS), in XENOSCARE's old RIDE-OPS BREAK ROOM under the stalker
// basement's west end. The owner's brief (2026-11-01): "for space land, his lair is to the left at the start of the
// stalking section. when you go left, you'll have to pass a brief hallway avoiding the alien, guaranteeing at least one
// ambush until you get into ben's lair where you're safe. the cannon will shoot you back to the start of the stalker
// section. there should be a light that guides you leftward. front and back ambushes should work in reverse if it
// detects the player going backwards." An OUTSIDE-THE-BOX EXPLORATION find: everybody runs right, away from where she
// smashed him down; the green lights say left.
//
//   THE WAY IN: from where he lands (under the hole in the hold's floor), a trail of green emergency floor lights
//     chases off WEST along the floor (his only light down there that isn't hers or his), past the old end wall into a
//     brief service hallway under the antechamber (the basement's height and floor, benLairArt.ts dresses it: a lit
//     CAST ONLY arrow box over its mouth); at its end, a hatch in the floor, its lid up, a warm light out of it, a ladder
//     down. Her go in the hallway is certain (basement.ts hallGo: a front ambush between him and the hatch); a locker
//     and a dark corner on the way. The ambushes there and anywhere he's heading back west are mirrored (basement.ts
//     heading).
//   THE LAIR: down the hatch, the old ride-ops break room (closed in '98, forgotten): a gym-bro hideout (benLairArt.ts):
//     a dead animatronic arm bolted across for a pull-up bar, a barbell of conduit with the ride's rubber alien eggs for
//     plates on a ride-car seat for a bench, the cast lockers (SMITH taped on one), a hot plate and a pot, a CRT on a
//     cart playing a workout tape, a mini fridge; warm, its own light. SAFE: nothing of hers runs down here (basement.ts
//     underHall), nothing in it hurts him (noContactHurt), nothing else's shots get in.
//   THE MEETUP (a cutscene, SKIP >> for all of it; confucktious/meetup.ts): the first meeting's long intro or a later
//     one's short one; his gross-up in the BEEF BRACERS, the LED scrolling, an uppercut at the lens (gross.ts).
//   THE TRIAL (in play; invented): THE SPARRING ALIEN. Ben lends the bracers (taken back if he climbs out on it; never
//     saved lent) and wheels out his sparring partner (one of the ride's busted animatronic greens on its rod, stuck in a
//     tire: harmless, grabbable): uppercut it, keep holding, tap grab: the NINJA DROP, head first into the floor. An
//     uppercut that lands with no drop after it's a miss (a dry line; a hint after two); one knocked over some other way
//     is wheeled back out. Can't get stuck: it keeps coming, nothing hurts, the buttons are up on screen near it.
//   THE GIFT (a cutscene, skippable): his (setPiece, setBenGave, saved there and then); the tease, Meathead enamored;
//     THE HIDDEN ART OF FOLLOW-UPS if it's his first follow-up piece (the big beat, the buttons up while it's said),
//     else Ben's brief mention and Meathead's cartoon Japanese. Then the YOU GOT card (90 frames, every button let go,
//     a fresh press).
//   THE PRACTICE: the sparring alien, one at a time, wheeled back out a moment after each goes; Ben's word the first
//     time it's dropped after the gift. Ben nudges him to the cannon.
//   THE CANNON (upgrades/returnCannon.ts, Future's look): only once the trial's passed; under the hatch's east side,
//     straight up out of it; he comes up out of a floor grate by where he landed (the start of the stalker section),
//     and she's given a breather before she's out again (basement.ts restHunter, the onLand hook).
//   ONCE GOT: Ben's idle line, the alien, the cannon; the bracers aren't given twice (benGave: cheats don't skip it).
//
// What outlives a death: what he's got (the save) and the meetup having run this visit (state.stageMemo).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import type { Block, Enemy, EnemyKind } from '../../../m1/types';
import { NO_CONTROLS } from '../../../m1/game/platform/input';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { pickLine, silenceAll } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip } from '../../../m1/game/platform/skip';
import { makeKindEnemy, mid } from '../../../m1/game/enemies/kinds';
import { isNude, isShat } from '../../../m1/game/player/gut';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { registerM2Kind } from '../../kinds';
import { grabHolding, inPlay } from '../../moves/grab';
import { lastMelee, type MeleeHit } from '../../upgrades/lastHit';
import { FOLLOW_WINDOW } from '../../upgrades/tune';
import { setUi } from '../../store';
import { saveProgress } from '../../save';
import { has, setPiece, setBenMet, benGave, setBenGave, followArt, setFollowArt, FOLLOW_PIECES } from '../../upgrades/state';
import { FOLLOW, type EquipControl } from '../../upgrades/equipInfo';
import { makeCannon, updateCannon, cannonBusy, type Cannon } from '../../upgrades/returnCannon';
import {
  NUDGE, PIECE_LINES, ART_OPEN, ART_MH, ART_HOW, ART_WEEB, ART_HUH, ART_AGAIN, MH_CANNON_ASK, BEN_CANNON_SP, MH_HATCH_SP, BRACER_WEEB, BRACER_HUH,
  benSays, warmBenGross, meetupScript, startScript, tickScript, skipScript,
  type BenPose, type BenTalk, type Script, type Beat, type ByPants,
} from '../../upgrades/confucktious';
import { meatheadSays } from '../section';
import { BASE_L, BF, LAND_X, HATCH, LAIR, underHall } from './geo';
import { drawSpar, SPAR_H } from './benLairSpar';

const L = PIECE_LINES.armguards;

// ---------------------------------------------------------------------------------------------------------------
// Where (world)

/** The cannon (under the hatch's east side: straight up out of it), Ben's spot, the sparring alien's. */
export const CANNON_X = HATCH.b - 40, BEN_X = LAIR.a + 450, SPAR_X = LAIR.a + 640;
/** The floor grate the cannon puts him up out of (and down on again): right where he landed falling in, the stalker
 *  section's starting point (the owner: "the cannon in future land should launch you to the starting point of the
 *  stalker section"). */
export const GRATE_X = LAND_X;
/** The YOU GOT card's least time up before it can be closed (frames). */
const CARD_HOLD = 90;
/** The meetup's run this visit; his line down the hatch said this visit (state.stageMemo). */
const MEMO = 'm2:benFuture', IN_MEMO = 'm2:benFutureIn';
/** The alien wheeled back out this long after it goes (frames): in the trial, after. */
const RESPAWN_TRIAL = 70, RESPAWN = 110;
/** An uppercut that hit it with no drop after it inside this (frames): a miss. */
const MISS_AFTER = 70;

const midX = (state: GameState) => state.player.pos.x + state.player.width / 2;
const feetY = (state: GameState) => state.player.pos.y + state.player.height;
/** In the break room (on its floor, or up in it; not still in the hatch's shaft). */
export const inLair = (state: GameState) => {
  const cx = midX(state), fy = feetY(state);
  return cx > LAIR.a - 10 && cx < LAIR.b + 10 && fy > LAIR.top + 30 && fy <= LAIR.floor + 6;
};
/** Down the hatch or in the room (its lighting and camera). */
export const belowHall = (state: GameState) => underHall(midX(state), feetY(state));
/** On the hallway's way west (his gross-up's painted ahead from here). */
const nearWay = (state: GameState) => midX(state) < LAND_X && feetY(state) > BF - 300;
const pantsOf = (state: GameState): keyof ByPants => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');
const byPants = <T>(state: GameState, r: { clean: T; shitty: T; nude: T }) => r[pantsOf(state)];

// ---------------------------------------------------------------------------------------------------------------
// The sparring alien: one of the ride's busted animatronic greens on its rod, stuck in a tire (harmless: no contact
// damage, never attacks; grabbable: the ninja drop works on it; a person, as the follow-ups see it: head first, legs up)

registerM2Kind({
  kind: 'm2:sp_spar', stats: { w: 34, h: SPAR_H, hp: 180, contact: 0, mass: 140 },
  humanoid: true, grab: 'body', pathing: false, gender: 'n', blood: '#22C55E',
  head: { x: 0, y: -SPAR_H + 14, r: 13 },
  // (stood in its tire facing him, rocking; it doesn't go anywhere it isn't knocked)
  ai: (ctx, e) => {
    const dx = mid(ctx.state.player).x - mid(e).x;
    e.aiState = 'near';
    e.facing = dx < 0 ? -1 : 1;
    if (Math.abs(e.vel.y) < 0.2) e.vel.x *= 0.8;
    // (kept in the room)
    const lo = LAIR.a + 30, hi = LAIR.b - 30;
    if (e.pos.x < lo) { e.pos.x = lo; e.vel.x = 0; } else if (e.pos.x + e.width > hi) { e.pos.x = hi - e.width; e.vel.x = 0; }
    return true;
  },
  draw: (c, e, f) => drawSpar(c, e, f),
});

// ---------------------------------------------------------------------------------------------------------------
// State (keyed on state.stage: rebuilt with the stage on every death)

type Phase = 'out' | 'meet' | 'trial' | 'gift' | 'card' | 'done';
export interface Lair {
  phase: Phase;
  all: number; token: number;
  script: Script | null;
  ben: BenTalk & { pose: BenPose; facing: 1 | -1; poseT: number; piece: 'armguards' | null };
  /** The sparring alien (null: gone, wheeled back out at `respawn`). */
  spar: Enemy | null; respawn: number;
  /** The trial: the last uppercut he threw (frame), it in his hands off one (the drop), the last hit seen, an uppercut
   *  that hit it waiting on a drop (frame, 0 none), misses, the next miss line's frame, the pass's beat (frame, -1). */
  upAt: number; dropping: boolean; hitSeen: MeleeHit | null; cutAt: number; misses: number; missAt: number; passAt: number;
  /** The gift: its how-to beats' indexes (the buttons up while they're said), the big beat or not. */
  howA: number; howB: number; artFull: boolean;
  cardT: number; cardArmed: boolean;
  goodSaid: boolean; tipsTill: boolean; nudgeAt: number;
  /** When he came up out of the grate (its lid flapping). */
  grateAt: number;
  cannon: Cannon;
  was: Partial<Controls>;
  /** It set the HUD's prompts (so it clears them going out, and only then). */
  ui: boolean;
}
const stores = new WeakMap<object, Lair>();
export const lairOf = (state: GameState): Lair => {
  const key = (state.stage ?? state) as object;
  let h = stores.get(key);
  if (!h) stores.set(key, h = {
    phase: 'out', all: 0, token: 0, script: null,
    ben: { said: null, pose: 'flurry', facing: 1, poseT: 0, piece: 'armguards' },
    spar: null, respawn: 0,
    upAt: -999, dropping: false, hitSeen: null, cutAt: 0, misses: 0, missAt: 0, passAt: -1,
    howA: -1, howB: -1, artFull: false,
    cardT: 0, cardArmed: false, goodSaid: false, tipsTill: false, nudgeAt: 0, grateAt: -999,
    // (straight up out of the hatch; up out of the grate by where he landed, and down on it)
    cannon: makeCannon(CANNON_X, LAIR.floor, { x: GRATE_X, y: BF }, { x: GRATE_X, y: BF }),
    was: {}, ui: false,
  });
  return h;
};
/** The bracers lent for the trial (taken back if it's not finished). */
let lent = false;
const lend = () => { if (!has('armguards')) { setPiece('armguards', true); lent = true; } };
const unlend = () => { if (lent && !benGave('armguards')) setPiece('armguards', false); lent = false; };
let setNoContact = false;

// ---------------------------------------------------------------------------------------------------------------
// Building it: the hallway, the hatch and the room cut out of the ground under the antechamber

/** Cuts the air out of the ground's blocks (each one it touches split into what's left round it). */
const carve = (state: GameState, x: number, y: number, w: number, h: number) => {
  const out: Block[] = [];
  state.blocks = state.blocks.filter(b => {
    if (b.type !== 'ground' || b.oneWay) return true;
    if (b.x >= x + w || b.x + b.w <= x || b.y >= y + h || b.y + b.h <= y) return true;
    if (b.y < y) out.push({ ...b, h: y - b.y });
    if (b.y + b.h > y + h) out.push({ ...b, y: y + h, h: b.y + b.h - (y + h) });
    const y0 = Math.max(b.y, y), y1 = Math.min(b.y + b.h, y + h);
    if (b.x < x) out.push({ ...b, y: y0, w: x - b.x, h: y1 - y0 });
    if (b.x + b.w > x + w) out.push({ ...b, x: x + w, y: y0, w: b.x + b.w - (x + w), h: y1 - y0 });
    return false;
  });
  state.blocks.push(...out);
};

/** The hallway (the hold's floor slab over it), the hatch through its floor, the room under it. `ceilB`: the
 *  hallway's ceiling (the slab's underside, the basement's). */
export const buildBenLair = (state: GameState, ceilB: number) => {
  // (a lend left over from a go cut short: back in the gift shop bag)
  unlend();
  carve(state, HATCH.a - 20, ceilB, BASE_L - 50 - (HATCH.a - 20), BF - ceilB);
  carve(state, HATCH.a, BF - 2, HATCH.b - HATCH.a, LAIR.top - BF + 4);
  carve(state, LAIR.a, LAIR.top, LAIR.b - LAIR.a, LAIR.floor - LAIR.top);
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame (the queen section's update, after the ladders)

export const updateBenLair = (ctx: FrameContext, controls: Controls, onLand: () => void): Controls => {
  const { state } = ctx, p = state.player, h = lairOf(state);
  if (nearWay(state)) warmBenGross();
  calm(state);
  const room = inLair(state);
  if (!room) {
    // (out of the room: bumping into things hurts again; a lend's taken back; the alien left down there; his words gone)
    if (setNoContact) { p.noContactHurt = false; setNoContact = false; }
    if (h.phase === 'trial') unlend();
    if (!belowHall(state)) clearSpar(state, h);
    if (h.ben.said && !belowHall(state) && !cannonBusy(h.cannon)) h.ben.said = null;
    if (h.ui) { h.ui = false; setUi({ gotPiece: null, gotPieceReady: false, chordTips: null }); }
    return updateCannon(ctx, h.cannon, controls, cannonHooks(h, onLand));
  }
  h.ui = true;
  h.ben.poseT++;
  // (a practice room: nothing down here hurts him)
  p.noContactHurt = true; setNoContact = true;
  const pressed = (k: keyof Controls) => !!controls[k] && !h.was[k];
  const anyPress = pressed('jump') || pressed('shoot') || pressed('special') || pressed('secondary') || pressed('charge');
  h.was = { ...controls };
  // (down the hatch the first time this visit: his line)
  if (!state.stageMemo[IN_MEMO] && p.isGrounded && p.health > 0) {
    state.stageMemo[IN_MEMO] = '1';
    meatheadSays(state, pickLine(byPants(state, MH_HATCH_SP)), true);
  }
  // In, on his feet past the hatch: what's on
  if (h.phase === 'out' && p.isGrounded && p.health > 0 && midX(state) > HATCH.b + 30) {
    if (benGave('armguards')) {
      h.phase = 'done'; h.ben.piece = null; h.respawn = state.frame + 40; h.nudgeAt = state.frame + 900;
      setPose(h, 'fold'); faceBen(state, h);
      benSays(h.ben, pickLine(byPants(state, L.idle)));
    } else if (state.stageMemo[MEMO]) startTrial(state, h);
    else startMeet(state, h);
  }
  let out = controls, tips: EquipControl[] | null = null;
  switch (h.phase) {
    case 'meet': out = runMeet(state, h); break;
    case 'trial': tips = runTrial(state, h); break;
    case 'gift': ({ out, tips } = runGift(state, h)); break;
    case 'card': {
      p.inCutscene = true; p.vel.x = 0;
      h.cardT++;
      // (a buffer before it'll close: CARD_HOLD frames, every button let go once, then a fresh press; PRESS ANY BUTTON
      // only once it's armed)
      const held = !!(controls.jump || controls.shoot || controls.special || controls.secondary || controls.charge);
      if (!h.cardArmed && h.cardT > CARD_HOLD && !held) h.cardArmed = true;
      setUi({ gotPiece: 'armguards', gotPieceReady: h.cardArmed });
      if (h.cardArmed && anyPress) {
        h.phase = 'done'; p.inCutscene = false; setUi({ gotPiece: null, gotPieceReady: false });
        h.nudgeAt = state.frame + 2400; h.tipsTill = true;
        if (!h.spar) h.respawn = state.frame + 30;
        setPose(h, 'fold');
        const tok = h.token;
        setTimeout(() => { if (lairOf(state) === h && h.token === tok) benSays(h.ben, L.practice[0]); }, 500);
      }
      out = { ...NO_CONTROLS };
      break;
    }
    case 'done': tips = runDone(state, h); break;
  }
  if (h.phase !== 'card') setUi({ gotPiece: null });
  setUi({ chordTips: tips });
  // The cannon: only once the trial's passed (no getting in, no prompt, before)
  if (h.phase === 'done' || cannonBusy(h.cannon)) out = updateCannon(ctx, h.cannon, out, cannonHooks(h, onLand));
  return out;
};

/** Nothing gets at him down there: shots in the hatch or the room that aren't his are gone. */
const calm = (state: GameState) => {
  if (!state.projectiles.length) return;
  state.projectiles = state.projectiles.filter(q => q.owner === 'player' || !underHall(q.pos.x, q.pos.y));
};

/** The alien: one at a time, wheeled back out a while after each goes. */
const keepSpar = (state: GameState, h: Lair, wait: number) => {
  const e = h.spar;
  if (e && (e.health <= 0 || e.isBlownAway || !inPlay(state, e))) {
    // (dropped, held or knocked over: left lying (legs up out of the floor) a moment, then the next one)
    if (grabHolding() !== e) { h.spar = null; h.respawn = state.frame + wait; }
    return;
  }
  if (e || state.frame < h.respawn || cannonBusy(h.cannon)) return;
  // (not wheeled out right on top of him)
  if (Math.abs(SPAR_X - midX(state)) < 60) { h.respawn = state.frame + 30; return; }
  // (the last one's body gone first: one at a time)
  state.enemies = state.enemies.filter(o => o.kind !== 'm2:sp_spar');
  const k = makeKindEnemy('m2:sp_spar' as EnemyKind, SPAR_X, LAIR.floor);
  k.homeX = k.pos.x; k.homeY = k.pos.y; k.variant = 0; k.facing = -1; k.seen = true;
  state.enemies.push(k); h.spar = k;
  playSound('clink', 0.6, -6); playSound('thud', 0.5, -8);
  for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: SPAR_X + (Math.random() - 0.5) * 40, y: LAIR.floor - 4 }, vel: { x: (Math.random() - 0.5) * 3, y: -0.5 - Math.random() * 1.5 }, life: 26, color: i % 2 ? '#57534E' : '#A8A29E', size: 3 });
};
const clearSpar = (state: GameState, h: Lair) => {
  if (h.spar && grabHolding() !== h.spar) { const e = h.spar; state.enemies = state.enemies.filter(o => o !== e); h.spar = null; }
  if (state.enemies.some(o => o.kind === 'm2:sp_spar' && o !== h.spar)) state.enemies = state.enemies.filter(o => o.kind !== 'm2:sp_spar' || o === h.spar);
};

const cannonHooks = (h: Lair, onLand: () => void) => ({
  onBoard: (st: GameState) => {
    clearSpar(st, h);
    silenceAll(); h.ben.said = null; setUi({ chordTips: null });
    meatheadSays(st, pickLine(MH_CANNON_ASK), true, () => { if (lairOf(st) === h) benSays(h.ben, pickLine(BEN_CANNON_SP)); });
  },
  onExit: (st: GameState, x: number, y: number) => {
    // (up out of the floor grate by where he landed: it bangs up, steam and grit with him)
    h.grateAt = st.frame;
    for (let i = 0; i < 22; i++) st.particles.push({ pos: { x: x - 18 + Math.random() * 36, y: y - 4 - Math.random() * 10 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 3 }, life: 44, color: i % 3 ? 'rgba(203, 213, 225, 0.7)' : '#57534E', size: 3 + Math.random() * 5 });
    playSound('clang', 0.8, -6); shakeScreen(st, 5, 4);
    onLand();
  },
  onLand: () => onLand(),
});

const setPose = (h: Lair, pose: BenPose) => { if (h.ben.pose !== pose) { h.ben.pose = pose; h.ben.poseT = 0; } };
const freeze = (state: GameState) => { const p = state.player; p.inCutscene = true; p.vel.x = 0; state.projectiles = state.projectiles.filter(q => q.owner !== 'player'); };
const faceBen = (state: GameState, h: Lair) => {
  const p = state.player;
  p.facing = BEN_X > midX(state) ? 1 : -1;
  h.ben.facing = p.facing === 1 ? -1 : 1;
};

// ---- the meetup (the first meeting's long intro, or a later one's short one: meetup.ts)
const startMeet = (state: GameState, h: Lair) => {
  h.phase = 'meet'; h.all = 0; h.token++;
  state.stageMemo[MEMO] = '1';
  // (the gross-up back up for the sell: the bracers, the uppercut at the lens)
  const sell = L.sell[0];
  h.script = startScript(meetupScript(pantsOf(state), L).map((b): Beat => (b.who === 'ben' && b.text === sell ? { ...b, gross: true } : b)));
  freeze(state);
  setPose(h, 'flurry'); h.ben.facing = 1;
};
const runMeet = (state: GameState, h: Lair): Controls => {
  const s = h.script!;
  freeze(state); h.all++;
  const end = () => { setBenMet(true); saveProgress(); h.script = null; startTrial(state, h); };
  if (h.all > SKIP_AFTER) { offerSkip(); if (takeSkip()) { silenceAll(); skipScript(s); h.ben.said = null; end(); return { ...NO_CONTROLS }; } }
  // (a beat of him shadowboxing in them first; then he turns to Meathead for the lot)
  if (h.all > 40) {
    tickScript(state, s, h.ben);
    if (s.i > 0 || s.waiting) { setPose(h, s.pose); faceBen(state, h); }
    if (s.done) end();
  }
  return { ...NO_CONTROLS };
};

// ---- the trial
const startTrial = (state: GameState, h: Lair) => {
  h.phase = 'trial'; h.misses = 0; h.passAt = -1; h.missAt = 0; h.cutAt = 0; h.dropping = false; h.hitSeen = lastMelee();
  state.player.inCutscene = false;
  // (the bracers off his arms and onto Meathead's for it; the alien wheeled out)
  h.ben.piece = null; setPose(h, 'fold');
  if (!has('armguards')) {
    lend(); playSound('powerup', 0.6, 2);
    const p = state.player;
    for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: midX(state) + (Math.random() - 0.5) * 30, y: p.pos.y + 24 + Math.random() * 10 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 3 }, life: 30, color: i % 2 ? '#FF3B3B' : '#E2E8F0', size: 3 });
  }
  if (!h.spar) h.respawn = state.frame + 30;
};
const UP_TIPS: EquipControl[] = [
  { pad: ['DPAD_UP', 'B'], join: '+', kb: ['@up', '@special'], label: 'UPPERCUT HIM' },
  { ...FOLLOW, label: 'TAP AS YOU HOLD THE UPPERCUT: NINJA DROP' },
];
const runTrial = (state: GameState, h: Lair): EquipControl[] | null => {
  const p = state.player, cx = midX(state);
  // (back in after climbing out on it: lent again)
  if (!has('armguards')) lend();
  if (h.passAt >= 0) {
    const t = state.frame - h.passAt;
    if (t === 50) {
      const tok = h.token;
      benSays(h.ben, pickLine(L.pass), () => { if (h.token === tok) meatheadSays(state, pickLine(byPants(state, L.passed)), true, () => { if (h.token === tok && h.phase === 'trial') startGift(state, h); }); });
    }
    // (in case a line never gets its turn)
    if (t > 900 && h.phase === 'trial') startGift(state, h);
    keepSpar(state, h, 9999);
    return null;
  }
  h.ben.facing = cx < BEN_X ? -1 : 1;
  if (h.ben.pose !== 'fold' && h.ben.poseT > 30) setPose(h, 'fold');
  keepSpar(state, h, RESPAWN_TRIAL);
  const e = h.spar;
  if (p.isUppercutting) h.upAt = state.frame;
  // (an uppercut that landed on it: waiting on the drop)
  const hit = lastMelee();
  if (hit && hit !== h.hitSeen) { h.hitSeen = hit; if (e && hit.e === e && hit.move === 'uppercut') h.cutAt = state.frame; }
  // (it in his hands off an uppercut: the ninja drop's on; let go of (in the floor, or bounced off it): passed)
  if (e && grabHolding() === e && !h.dropping && state.frame - h.upAt <= FOLLOW_WINDOW + 8) h.dropping = true;
  if (h.dropping && grabHolding() !== e) {
    h.dropping = false; h.passAt = state.frame; h.cutAt = 0;
    silenceAll(); h.ben.said = null; h.token++;
    setPose(h, 'fold');
    return null;
  }
  // (an uppercut, and no drop after it: a miss; a hint after two)
  if (h.cutAt && !h.dropping && state.frame - h.cutAt > MISS_AFTER && state.frame >= h.missAt) {
    h.cutAt = 0; h.missAt = state.frame + 150; h.misses++;
    silenceAll(); h.ben.said = null;
    const tok = h.token;
    benSays(h.ben, pickLine(L.miss), h.misses === 2 ? () => { if (h.token === tok && h.phase === 'trial' && h.passAt < 0) benSays(h.ben, L.hint[0]); } : undefined);
  }
  return e && Math.abs(cx - mid(e).x) < 380 && p.health > 0 ? UP_TIPS : null;
};

// ---- the gift, and the hidden art of follow-ups
const startGift = (state: GameState, h: Lair) => {
  h.phase = 'gift'; h.all = 0; h.token++;
  // (the big beat only with his first follow-up piece, whichever land: none taught, none of the others handed over)
  h.artFull = !followArt() && !FOLLOW_PIECES.some(pc => pc !== 'armguards' && benGave(pc));
  // (his for good, there and then: a skip, a death, a quit can't lose them)
  setPiece('armguards', true); setBenGave('armguards'); lent = false; saveProgress();
  freeze(state);
  setPose(h, 'give');
  const pants = pantsOf(state);
  const beats: Beat[] = [
    { who: 'ben', text: L.gift[0], pose: 'give' },
    { who: 'ben', text: L.tease[0], pose: 'fold' },
    { who: 'mh', text: pickLine(L.enamored[pants]) },
  ];
  if (h.artFull) {
    beats.push({ who: 'ben', text: ART_OPEN[0], gross: true }, { who: 'mh', text: pickLine(ART_MH[pants]) });
    h.howA = beats.length;
    for (const text of ART_HOW) beats.push({ who: 'ben', text });
    h.howB = beats.length - 1;
    beats.push({ who: 'mh', text: pickLine(ART_WEEB[pants]) }, { who: 'ben', text: ART_HUH[0] });
  } else {
    h.howA = h.howB = beats.length;
    beats.push({ who: 'ben', text: ART_AGAIN[0] }, { who: 'mh', text: pickLine(BRACER_WEEB[pants]) }, { who: 'ben', text: BRACER_HUH[0] });
  }
  h.script = startScript(beats);
};
const ART_TIPS: EquipControl[] = [
  { ...FOLLOW, label: 'TAP AS YOU HOLD AN UPPERCUT: NINJA DROP' },
  { pad: ['DPAD_LEFT', 'DPAD_RIGHT'], join: '/', kb: ['@left', '@right'], label: 'ON THE WAY DOWN: STEER IT' },
];
const runGift = (state: GameState, h: Lair): { out: Controls; tips: EquipControl[] | null } => {
  const s = h.script!;
  freeze(state); h.all++;
  faceBen(state, h);
  const toCard = () => {
    setFollowArt(true); saveProgress();
    h.script = null; h.ben.piece = null; setPose(h, 'fold');
    h.phase = 'card'; h.cardT = 0; h.cardArmed = false;
  };
  if (h.all > SKIP_AFTER) { offerSkip(); if (takeSkip()) { silenceAll(); skipScript(s); h.token++; h.ben.said = null; toCard(); return { out: { ...NO_CONTROLS }, tips: null }; } }
  if (h.all > 20) tickScript(state, s, h.ben);
  setPose(h, s.pose);
  if (s.done) toCard();
  const tips = s.i >= h.howA && s.i <= h.howB && !s.done ? ART_TIPS : null;
  return { out: { ...NO_CONTROLS }, tips };
};

// ---- after: practice, the nudges
const runDone = (state: GameState, h: Lair): EquipControl[] | null => {
  const p = state.player, cx = midX(state);
  // (Ben: hands on his hips watching when he's close; shadowboxing when he's off)
  if (Math.abs(cx - BEN_X) < 220 || h.ben.said) setPose(h, 'fold'); else setPose(h, 'flurry');
  h.ben.facing = cx < BEN_X ? -1 : 1;
  const e = h.spar;
  if (p.isUppercutting) h.upAt = state.frame;
  if (e && grabHolding() === e && !h.dropping && state.frame - h.upAt <= FOLLOW_WINDOW + 8) h.dropping = true;
  if (h.dropping && grabHolding() !== e) {
    h.dropping = false; h.tipsTill = false;
    // (the first one after the gift: his word)
    if (!h.goodSaid && has('armguards')) { h.goodSaid = true; const tok = h.token; setTimeout(() => { if (lairOf(state) === h && h.token === tok) { silenceAll(); benSays(h.ben, pickLine(L.good)); } }, 700); }
  }
  keepSpar(state, h, RESPAWN);
  // (now and then: the cannon)
  if (state.frame > h.nudgeAt && !p.inCutscene && !h.ben.said && !cannonBusy(h.cannon)) {
    h.nudgeAt = state.frame + 2700;
    benSays(h.ben, pickLine(byPants(state, NUDGE)));
  }
  return h.tipsTill && h.spar ? ART_TIPS.slice(0, 1).concat(UP_TIPS.slice(0, 1)) : null;
};

/** Where Ben's feet are (world). */
export const benAt = () => ({ x: BEN_X, y: LAIR.floor });
/** The view's mostly the room (its own light). */
export const lairView = (state: GameState) => state.camera.y + 300 > LAIR.top && state.camera.x + CANVAS_WIDTH / 2 < BASE_L;
