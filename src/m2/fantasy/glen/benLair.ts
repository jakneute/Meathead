// FAIRY LAND'S HIDDEN ARMOR: THE AMULET (the PISS-OFF PENDANT), in the dragon's lair's old machine room, down a service
// tunnel off the dwarf mine's shaft. The owner's brief (2026-11-01): "before the pit, there's a ladder that goes up and
// down. if you're observant, when it goes down into the bottomless pit, there's an entryway underneath the main path you
// can take that takes you to a lair right underneath the dragon's lair part of the main stage. the cannon will send you
// to the start of the dragon's lair." An OUTSIDE-THE-BOX EXPLORATION find (the placement rule's first kind), far enough
// off the path for a return cannon.
//
//   THE WAY IN: the mine shaft's chain of four staircases, the last one (layout.ts S4, by the UNICORN MEADOW sign) swings
//     between docked level with the meadow and hanging down into the shaft. Ride it down and at its low end, in the
//     shaft's far wall under the meadow's edge, there's an old timbered adit: an iron-bracketed plank sticking out of it
//     level with the stair's low end (lit along its top), and its mouth in the shaft's side wall (drawn on that wall in
//     perspective), half boarded up. THE TELL: warm light beaming out through the gaps in the boards, raking across the
//     shaft and the plank, pink fairy dust drifting in it (the owner: "like a light beaming out of the wall for the
//     secret passageway"). He steps off the stair's low end onto the plank and walks in.
//   THE TUNNEL: past the adit's few feet of mine timber, a timbered incline of forty treads down (walked like any
//     stairs; each tread lit along its edge), broken through at its foot into the park's own service tunnel (the cast's
//     utilidor under Fantasyland, parodied): concrete, a lavender stripe, conduit, caged bulbs, Ben's junk stashed along
//     it; the long run along to the dragon's lair. The earth over it is drawn in cross
//     section once he's in (its `reveal`: the meadow's near ground fades into the cutaway).
//   THE LAIR (benLairArt.ts paints it): right under the dragon's lair, its old MACHINE ROOM from when the dragon was a
//     real animatronic (SIR SCORCH-A-LOT, 1979-2004, replaced by a theater major in a suit): his great rotting head on
//     a pallet (one eye still lit, red; Ben's sleeping bag in its open jaw), the hydraulic rams that worked him up
//     through the ceiling, the propane manifold for the fire (blue pilot lights) and the fog drum, turned gym-bro
//     hideout: a jousting lance for a barbell with kite shields for plates on two hydraulic jacks, a fiberglass dragon
//     EGG with a handle bolted on for a kettlebell. Its own dark, the dragon's eye and the pilots glowing in it.
//   THE MEETUP (a cutscene, SKIP >> for all of it; confucktious/meetup.ts): the first meeting's long intro or a later
//     one's short one; Ben's gross-up dangling the pendant off its chain like a hypnotist's watch, then losing his
//     temper at the lens (gross.ts).
//   THE TRIAL (in play; invented): THREE KNIGHTS. Ben lends him the pendant (switched on for it; taken back, and the
//     switch put back, if he leaves on it; never saved lent) and blows up three of the gift shop's BOP-A-KNIGHTS
//     (inflatable punching-bag knights, sand in the bottom, a foam sword stuck to each): they wobble up to him and bop
//     him. A bop takes nothing off him (the lair's a practice room) but goes into the pendant's meter all the same
//     (amulet.ts feedAmulet). Hit back and a knight pops: a dry line (a hint after two), and it's blown up again a
//     moment after. Take enough and the pendant does the rest: FUCK OFF, and the yell pops every knight on the screen.
//     That's the pass. Can't get stuck: the knights keep coming, and nothing in there hurts.
//   THE GIFT (a cutscene, skippable): it's his (setPiece, setBenGave, saved there and then; the switch left on); Ben's
//     tease (it works on bosses, and the pause menu's switch), Meathead enamored, his cartoon Japanese, Ben lost. Then
//     the YOU GOT card (PieceGotCard.tsx, with the switch's note): 90 frames, every button let go, a fresh press.
//   THE PRACTICE: the knights keep blowing back up (three about, each blown up again a few seconds after it pops), so
//     he can get mad at them as long as he likes; Ben's word the first time it goes off after the gift.
//   THE CANNON (upgrades/returnCannon.ts, FAIRY look): only once the trial's passed (Ben nudges him to it). It rests
//     pointing up a chute in the ceiling; he comes flying out of a staff trapdoor in the dragon's lair's floor, and down
//     on the path at the lair's start, by its sign (anybody about holds off a moment for the landing).
//   ONCE GOT: Ben's idle line, the knights, the cannon; the pendant isn't given twice (benGave: cheats don't skip it).
//
// What outlives a death: what he's got (the save) and the meetup having run this visit (state.stageMemo). The glen's own
// code is untouched: benLairSection.ts wraps it (and keeps the glen's passing lines and checkpoints from going off
// under the ground).

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
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { registerM2Kind } from '../../kinds';
import { setUi } from '../../store';
import { saveProgress } from '../../save';
import { has, setPiece, setBenMet, benGave, setBenGave, amuletOn, setAmuletOn, lendPiece, unlendPiece } from '../../upgrades/state';
import { feedAmulet, amuletShielded } from '../../upgrades/amulet';
import { makeCannon, updateCannon, cannonBusy, type Cannon } from '../../upgrades/returnCannon';
import {
  NUDGE, PIECE_LINES, MH_TUNNEL, AMULET_WEEB, AMULET_HUH, MH_CANNON_ASK, BEN_CANNON_FY,
  benSays, warmBenGross, meetupScript, startScript, tickScript, skipScript,
  type BenPose, type BenTalk, type Script, type Beat, giftCoda,
  makeGate, syncGate, gateBump, cannonLocked, type Gate,
} from '../../upgrades/confucktious';
import { meatheadSays, solid, byPants, pantsOf } from '../section';
import { stairEnd } from '../stairs';
import { GY } from '../geometry';
import { X, Y, x0, GAP2, STAIRS } from './layout';
import { drawBop } from './benLairBop';

const L = PIECE_LINES.amulet;

// ---------------------------------------------------------------------------------------------------------------
// Where (x from the glen's start: X(); heights up from the path: Y(), so under the ground they're negative)

/** The shaft's last staircase hanging down into it: its low end (world). */
const LOW = stairEnd(STAIRS[6], 0);
/** The plank out of the adit, level with the stair's low end (a step down off it), in the shaft. */
export const LIP = { a: Math.round(LOW.x - x0) + 3, b: GAP2.b, top: Math.round(GY - LOW.y) - 2 };
/** The adit: in under the meadow's edge, the hole's top, its floor (the plank's). */
export const MOUTH = { a: GAP2.b, b: GAP2.b + 150, top: -22, floor: LIP.top };
/** The stairs down (walked like any stairs: each riser low enough to step up and to walk down off without a drop): how
 *  many treads, each one's width, each one's drop (a whole pixel each, rounded: stepAt). */
export const STEP_N = 40, STEP_W = 19.2, STEP_D = 16.5;
export const STEPS_A = MOUTH.b, STEPS_B = MOUTH.b + STEP_N * STEP_W;
/** The tunnel's and the machine room's floor. */
export const FLOOR = MOUTH.floor - STEP_N * STEP_D;
/** Step i's floor and ceiling. */
export const stepAt = (i: number) => { const f = Math.round(MOUTH.floor - (i + 1) * STEP_D); return { a: Math.round(STEPS_A + i * STEP_W), b: Math.round(STEPS_A + (i + 1) * STEP_W), floor: f, top: Math.min(MOUTH.top, f + 160) }; };
/** The long run along to the room. */
export const TUN = { a: STEPS_B, b: 11260, top: FLOOR + 160 };
/** The machine room, right under the dragon's lair. */
export const ROOM = { a: 11260, b: 12360, top: FLOOR + 420 };
export const RH = ROOM.top - FLOOR;
/** In the room (from its left end): the cannon and the chute over it, the dragon's head, Ben, the knights' spots. */
export const CANNON_LX = 80, CHUTE = { a: 52, b: 108, top: -40 };
export const HEAD_LX = 250, BEN_LX = 520;
const KNIGHTS_LX = [340, 700, 940];
/** Where the cannon shoots him out (the staff trapdoor in the dragon's lair's floor) and where he comes down (by the
 *  lair's sign, at its start). */
export const TRAPDOOR_RX = ROOM.a + CANNON_LX;
const LAND_RX = 11080;
/** The YOU GOT card's least time up before it can be closed (frames). */
const CARD_HOLD = 90;
/** The meetup's run this visit; his line in through the adit said this visit (state.stageMemo). */
const MEMO = 'm2:benFairy', IN_MEMO = 'm2:benFairyIn';
/** A popped knight's blown up again this long after (frames), in the trial and after. */
const REBLOW = 200, REBLOW_TRIAL = 90;
/** What a knight's bop puts into the pendant's meter (its own share on top: amulet.ts). */
const BOP_N = 6;

const midX = (state: GameState) => state.player.pos.x + state.player.width / 2;
const feetY = (state: GameState) => state.player.pos.y + state.player.height;
/** The air under the ground: [from, to, top, floor] (x from the glen's start, heights). */
export const AIR: [number, number, number, number][] = [
  [MOUTH.a, MOUTH.b, MOUTH.top, MOUTH.floor],
  ...Array.from({ length: STEP_N }, (_, i) => { const s = stepAt(i); return [s.a, s.b, s.top, s.floor] as [number, number, number, number]; }),
  [TUN.a, TUN.b, TUN.top, FLOOR],
  [ROOM.a, ROOM.b, ROOM.top, FLOOR],
  [ROOM.a + CHUTE.a, ROOM.a + CHUTE.b, CHUTE.top, ROOM.top - 1],
];
/** Under the ground: in the adit, the tunnel or the room (or the chute). */
export const underground = (state: GameState) => {
  const rx = midX(state) - x0, h = GY - feetY(state);
  return AIR.some(([a, b, top, floor]) => rx > a - 4 && rx < b + 4 && h > floor - 6 && h < top + 4);
};
/** In the machine room (on its floor, or up in it). */
export const inRoom = (state: GameState) => {
  const rx = midX(state) - x0, h = GY - feetY(state);
  return rx > ROOM.a - 4 && rx < ROOM.b && h > FLOOR - 6 && h < ROOM.top;
};
/** The camera's down under the ground (the cutaway's own dark). */
export const underView = (state: GameState) => {
  const cx = state.camera.x + CANVAS_WIDTH / 2 - x0, cy = state.camera.y + CANVAS_HEIGHT / 2;
  return cx > MOUTH.a - 200 && cx < ROOM.b + 400 && cy > GY + 60;
};
/** On the way (the shaft's chain, the meadow's edge): his gross-up's painted ahead from here. */
const nearWay = (state: GameState) => { const rx = midX(state) - x0; return rx > GAP2.a && rx < ROOM.b; };

// ---------------------------------------------------------------------------------------------------------------
// The knights: BOP-A-KNIGHTS, the gift shop's inflatable punching bags (harmless: no contact, no attacks of the
// engine's; their bops are the lair's own, and take nothing off him)

interface Bop { lean: number; lv: number; wind: number; cool: number; hit: boolean }
const bops = new WeakMap<Enemy, Bop>();
export const bopOf = (e: Enemy): Bop => { let b = bops.get(e); if (!b) bops.set(e, b = { lean: 0, lv: 0, wind: 0, cool: 40 + Math.floor(Math.random() * 40), hit: false }); return b; };
/** The bop's reach (px between their middles), its wind-up and its swing (frames). */
const REACH = 60, WIND = 16, SWING = 8;

registerM2Kind({
  kind: 'm2:fy_bop', stats: { w: 34, h: 74, hp: 12, contact: 0, mass: 60 },
  grab: 'none', pathing: false, gender: 'n', blood: '#F9A8D4',
  head: { x: 0, y: -60, r: 12 },
  ai: (ctx, e) => {
    const { state } = ctx, p = state.player, b = bopOf(e);
    const dx = mid(p).x - mid(e).x, adx = Math.abs(dx), grounded = Math.abs(e.vel.y) < 0.2;
    e.aiState = 'near';
    e.facing = dx < 0 ? -1 : 1;
    // (the wobble: a spring back to upright)
    b.lv += -b.lean * 0.12; b.lv *= 0.82; b.lean += b.lv;
    if (b.cool > 0) b.cool--;
    if (b.wind > 0) {
      // (winding back, away from him; then the swing in)
      b.wind--;
      e.vel.x = 0;
      if (b.wind > SWING) b.lean += (-0.5 - b.lean) * 0.25;
      else {
        b.lean += (0.75 - b.lean) * 0.5;
        if (!b.hit && b.wind <= SWING - 3 && adx < REACH + 10 && Math.abs(feetY(state) - (e.pos.y + e.height)) < 50 && p.health > 0 && !p.inCutscene) {
          b.hit = true;
          softBop(state, e);
        }
      }
      if (b.wind === 0) { b.cool = 50 + Math.floor(Math.random() * 30); b.hit = false; }
      return true;
    }
    if (adx < REACH && b.cool <= 0 && !p.inCutscene && p.health > 0) { b.wind = WIND + SWING; return true; }
    // (hopping up to him on its sandbag bottom, a little lean into each hop)
    if (adx > REACH - 10 && grounded && state.frame % 34 === (e.variant ?? 0) * 7 % 34) { e.vel.y = -3.6; e.vel.x = Math.sign(dx) * 2.2; b.lv += 0.08; playSound('boing', 0.25, 6); }
    else if (grounded) e.vel.x *= 0.7;
    // (kept in the room)
    const lo = X(ROOM.a) + 30, hi = X(ROOM.b) - 30;
    if (e.pos.x < lo) { e.pos.x = lo; e.vel.x = Math.abs(e.vel.x); } else if (e.pos.x + e.width > hi) { e.pos.x = hi - e.width; e.vel.x = -Math.abs(e.vel.x); }
    return true;
  },
  draw: (c, e, f) => drawBop(c, e, f, bopOf(e).lean),
});

/** A knight's foam sword bops him: a squeak and a shove, nothing off him, into the pendant's meter. */
const softBop = (state: GameState, e: Enemy) => {
  const p = state.player, away = mid(p).x < mid(e).x ? -1 : 1;
  feedAmulet(BOP_N);
  playSound('boing', 0.7, 10); playSound('punch', 0.25, 8);
  if (!p.isCharging && !p.isSliding) { p.vel.x = away * 4; if (p.isGrounded) p.vel.y = -2.5; }
  const x = mid(p).x - away * 10, y = p.pos.y + 18;
  for (let i = 0; i < 8; i++) state.particles.push({ pos: { x, y }, vel: { x: away * (1 + Math.random() * 2), y: -1 - Math.random() * 2 }, life: 18, color: i % 2 ? '#FFFFFF' : '#F9A8D4', size: 3 });
  const h = lairOf(state);
  h.bopped++;
};

// ---------------------------------------------------------------------------------------------------------------
// State (keyed on state.stage: rebuilt with the stage on every death)

type Phase = 'out' | 'meet' | 'trial' | 'gift' | 'card' | 'done';
export interface Lair {
  phase: Phase;
  all: number; token: number;
  script: Script | null;
  ben: BenTalk & { pose: BenPose; facing: 1 | -1; poseT: number; piece: 'amulet' | null };
  /** The knights about, by spot (null: popped, blown up again at `at[i]`). */
  knights: (Enemy | null)[]; at: number[];
  /** The trial: misses (knights he popped himself), the next miss line's frame, the pass's beat started (frame); bops
   *  taken (for Ben's word as it builds); the pendant raging last frame (the yell's going off is its rising edge). */
  misses: number; missAt: number; passAt: number; bopped: number; moreSaid: number; shWas: boolean;
  cardT: number; cardArmed: boolean;
  goodSaid: boolean; nudgeAt: number;
  /** How far the cutaway's lifted (0 the meadow's near ground, 1 the earth in cross section). */
  reveal: number;
  /** When he came flying out of the trapdoor (its lid flapping). */
  hatchAt: number;
  /** The checkpoint he had up top (passing one's x down here doesn't count). */
  cpUp: number;
  cannon: Cannon;
  /** The way out (the tunnel's mouth) walled up with his shields while the trial's on (trialGate.ts). */
  gate: Gate;
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
    ben: { said: null, pose: 'stand', facing: -1, poseT: 0, piece: 'amulet' },
    knights: KNIGHTS_LX.map(() => null), at: KNIGHTS_LX.map(() => 0),
    misses: 0, missAt: 0, passAt: -1, bopped: 0, moreSaid: 0, shWas: false,
    cardT: 0, cardArmed: false, goodSaid: false, nudgeAt: 0, reveal: 0, hatchAt: -999, cpUp: state.checkpoint,
    // (up the chute; out of the trapdoor in the lair's floor over it, down at the lair's start)
    cannon: makeCannon(X(ROOM.a + CANNON_LX), Y(FLOOR), { x: X(TRAPDOOR_RX), y: GY }, { x: X(LAND_RX), y: GY }),
    gate: makeGate('fy-ben-gate', X(ROOM.a - 30), Y(TUN.top), 30, TUN.top - FLOOR),
    was: {}, ui: false,
  });
  return h;
};
/** The pendant lent for the trial (taken back if it's not finished), and its switch, if it had to be flipped on for it. */
let flipped = false;
const lend = () => {
  lendPiece('amulet');
  if (!amuletOn()) { setAmuletOn(true); flipped = true; }
};
const unlend = () => {
  unlendPiece('amulet');
  if (flipped && !benGave('amulet')) setAmuletOn(false);
  flipped = false;
};
let setNoContact = false;

// ---------------------------------------------------------------------------------------------------------------
// Building it

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

export const buildLair = (state: GameState) => {
  // (a lend left over from a go cut short: back in the gift shop bag)
  unlend();
  for (const [a, b, top, floor] of AIR) carve(state, X(a), Y(top), b - a, top - floor);
  // (the plank out of the adit into the shaft)
  solid(state, X(LIP.a), Y(LIP.top), LIP.b - LIP.a, 14, { hidden: true, tag: 'fy-lip' });
  lairOf(state).cpUp = state.checkpoint;
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame (before the glen's own update)

export const updateLair = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, p = state.player, h = lairOf(state);
  const under = underground(state), room = inRoom(state);
  h.reveal = Math.max(0, Math.min(1, h.reveal + (under || (cannonBusy(h.cannon) && h.cannon.phase !== 'fly') ? 0.08 : -0.06)));
  if (nearWay(state)) warmBenGross();
  // (a checkpoint's x passed down here isn't one passed up top: back to the one he had)
  if (under) { if (state.checkpoint > h.cpUp) state.checkpoint = h.cpUp; } else h.cpUp = state.checkpoint;
  // (in through the adit the first time this visit: his line)
  if (under && !state.stageMemo[IN_MEMO] && midX(state) - x0 > MOUTH.a + 20 && p.isGrounded && p.health > 0) {
    state.stageMemo[IN_MEMO] = '1';
    meatheadSays(state, pickLine(byPants(state, MH_TUNNEL)), true);
  }
  calm(state);
  if (!room) {
    // (out of the room: bumping into things hurts again; a lend's taken back; the knights let down; his words gone)
    if (setNoContact) { p.noContactHurt = false; setNoContact = false; }
    // (the safety net: however he got out, the lent pendant comes off; the shields out of the way of coming back in)
    unlend();
    syncGate(state, h.gate, false);
    if (!under) clearKnights(state, h);
    if (h.ben.said && !under && !cannonBusy(h.cannon)) h.ben.said = null;
    if (h.ui) { h.ui = false; setUi({ gotPiece: null, gotPieceReady: false, chordTips: null }); }
    return updateCannon(ctx, h.cannon, controls, cannonHooks(h));
  }
  h.ui = true;
  h.ben.poseT++;
  // (a practice room: nothing down here hurts him)
  p.noContactHurt = true; setNoContact = true;
  const pressed = (k: keyof Controls) => !!controls[k] && !h.was[k];
  const anyPress = pressed('jump') || pressed('shoot') || pressed('special') || pressed('secondary') || pressed('charge');
  h.was = { ...controls };
  // In, on his feet past the cannon: what's on
  if (h.phase === 'out' && p.isGrounded && p.health > 0 && midX(state) - x0 > ROOM.a + 140) {
    if (benGave('amulet')) {
      h.phase = 'done'; h.ben.piece = null; h.nudgeAt = state.frame + 900;
      setPose(h, 'fold'); faceBen(state, h);
      benSays(h.ben, pickLine(byPants(state, L.idle)));
    } else if (state.stageMemo[MEMO]) startTrial(state, h);
    else startMeet(state, h);
  }
  let out = controls;
  switch (h.phase) {
    case 'meet': out = runMeet(state, h); break;
    case 'trial': runTrial(state, h); break;
    case 'gift': out = runGift(state, h); break;
    case 'card': {
      p.inCutscene = true; p.vel.x = 0;
      h.cardT++;
      // (a buffer before it'll close: CARD_HOLD frames, every button let go once, then a fresh press; PRESS ANY BUTTON
      // only once it's armed)
      const held = !!(controls.jump || controls.shoot || controls.special || controls.secondary || controls.charge);
      if (!h.cardArmed && h.cardT > CARD_HOLD && !held) h.cardArmed = true;
      setUi({ gotPiece: 'amulet', gotPieceReady: h.cardArmed });
      if (h.cardArmed && anyPress) {
        h.phase = 'done'; p.inCutscene = false; setUi({ gotPiece: null, gotPieceReady: false });
        h.nudgeAt = state.frame + 2400; h.shWas = amuletShielded();
        // (the knights back up a moment after: practice)
        for (let i = 0; i < KNIGHTS_LX.length; i++) if (!h.knights[i]) h.at[i] = state.frame + 60 + i * 30;
        setPose(h, 'fold');
        const tok = h.token;
        setTimeout(() => { if (lairOf(state) === h && h.token === tok) benSays(h.ben, L.practice[0]); }, 500);
      }
      out = { ...NO_CONTROLS };
      break;
    }
    case 'done': runDone(state, h); break;
  }
  if (h.phase !== 'card') setUi({ gotPiece: null });
  setUi({ chordTips: null });
  // The way out: the tunnel's mouth walled up while the trial's on (into it: Ben's bark); down on the pass
  syncGate(state, h.gate, h.phase === 'trial' && h.passAt < 0);
  if (h.phase === 'trial') gateBump(state, h.gate, h.ben);
  // The cannon: only once the trial's passed (chained till then, UP at it gets Ben's bark)
  if (h.phase === 'trial') cannonLocked(state, h.cannon, out, h.ben);
  if (h.phase === 'done' || cannonBusy(h.cannon)) out = updateCannon(ctx, h.cannon, out, cannonHooks(h));
  return out;
};

/** Nothing down here gets at him: shots in the room or the tunnel that aren't his are gone; anything else that's got
 *  down here (nobody should) but the knights is put back up on the path. */
const calm = (state: GameState) => {
  const inBox = (x: number, y: number) => { const rx = x - x0, h = GY - y; return rx > MOUTH.a - 10 && rx < ROOM.b + 10 && h < -14 && h > FLOOR - 40; };
  if (state.projectiles.length) state.projectiles = state.projectiles.filter(q => q.owner === 'player' || !inBox(q.pos.x, q.pos.y));
  for (const e of state.enemies) {
    if (e.health <= 0 || e.type === 'boss' || e.kind === 'm2:fy_bop') continue;
    if (inBox(e.pos.x + e.width / 2, e.pos.y + e.height)) { e.pos.y = GY - e.height; e.vel.x = 0; e.vel.y = 0; }
  }
};

/** The knights: each spot's blown up again a while after it pops (or as soon as it's wanted). */
const blowKnights = (state: GameState, h: Lair, wait: number) => {
  for (let i = 0; i < KNIGHTS_LX.length; i++) {
    const e = h.knights[i];
    if (e && (e.health <= 0 || e.isBlownAway || !state.enemies.includes(e))) {
      h.knights[i] = null; h.at[i] = state.frame + wait;
      // (the popped one's left lying a moment, then gone)
      const dead = e;
      setTimeout(() => { if (lairOf(state) === h) state.enemies = state.enemies.filter(o => o !== dead); }, 1500);
      continue;
    }
    if (!e && state.frame >= h.at[i] && !cannonBusy(h.cannon)) {
      const x = X(ROOM.a + KNIGHTS_LX[i]);
      // (not blown up right on top of him)
      if (Math.abs(x - midX(state)) < 70) { h.at[i] = state.frame + 30; continue; }
      const k = makeKindEnemy('m2:fy_bop' as EnemyKind, x, Y(FLOOR));
      k.homeX = k.pos.x; k.homeY = k.pos.y; k.variant = i; k.facing = -1; k.seen = true;
      state.enemies.push(k); h.knights[i] = k;
      bopOf(k).lean = 0.6; bopOf(k).cool = 50 + i * 20;
      playSound('whoosh', 0.4, 8); playSound('boing', 0.3, 4);
      for (let j = 0; j < 10; j++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 30, y: Y(FLOOR) - 20 - Math.random() * 40 }, vel: { x: (Math.random() - 0.5) * 2, y: -0.5 - Math.random() }, life: 26, color: j % 2 ? '#F9A8D4' : '#FFFFFF', size: 3 });
    }
  }
};
const clearKnights = (state: GameState, h: Lair) => {
  const gone = h.knights.filter((e): e is Enemy => !!e);
  if (gone.length) state.enemies = state.enemies.filter(o => !gone.includes(o));
  h.knights = KNIGHTS_LX.map(() => null);
};

const cannonHooks = (h: Lair) => ({
  onBoard: (st: GameState) => {
    clearKnights(st, h);
    silenceAll(); h.ben.said = null; setUi({ chordTips: null });
    meatheadSays(st, pickLine(MH_CANNON_ASK), true, () => { if (lairOf(st) === h) benSays(h.ben, pickLine(BEN_CANNON_FY)); });
  },
  onExit: (st: GameState, x: number, y: number) => {
    // (out of the trapdoor in the lair's floor: it bangs open, dust and a puff of the fog with him; anybody about holds
    // off a moment for the landing)
    h.hatchAt = st.frame;
    for (let i = 0; i < 22; i++) st.particles.push({ pos: { x: x - 16 + Math.random() * 32, y: y - 4 - Math.random() * 10 }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 3 }, life: 40, color: i % 3 ? '#C8C0D8' : '#F9A8D4', size: 3 + Math.random() * 4 });
    playSound('slam', 0.8, -2); shakeScreen(st, 5, 4);
    for (const e of st.enemies) if (e.health > 0 && e.type !== 'boss' && Math.abs(mid(e).x - X(LAND_RX)) < 420 && Math.abs(e.pos.y + e.height - GY) < 200) e.pauseTimer = Math.max(e.pauseTimer ?? 0, 120);
  },
});

const setPose = (h: Lair, pose: BenPose) => { if (h.ben.pose !== pose) { h.ben.pose = pose; h.ben.poseT = 0; } };
const freeze = (state: GameState) => { const p = state.player; p.inCutscene = true; p.vel.x = 0; state.projectiles = state.projectiles.filter(q => q.owner !== 'player'); };
const faceBen = (state: GameState, h: Lair) => {
  const p = state.player, bx = X(ROOM.a + BEN_LX);
  p.facing = bx > midX(state) ? 1 : -1;
  h.ben.facing = p.facing === 1 ? -1 : 1;
};

// ---- the meetup
const startMeet = (state: GameState, h: Lair) => {
  h.phase = 'meet'; h.all = 0; h.token++;
  state.stageMemo[MEMO] = '1';
  // (the gross-up back up for the sell: the pendant dangled, and the tantrum)
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
  // (a beat of him shadowboxing first; then he turns to Meathead for the lot)
  if (h.all > 40) {
    tickScript(state, s, h.ben);
    if (s.i > 0 || s.waiting) { setPose(h, s.pose); faceBen(state, h); }
    if (s.done) end();
  }
  return { ...NO_CONTROLS };
};

// ---- the trial
const startTrial = (state: GameState, h: Lair) => {
  h.phase = 'trial'; h.misses = 0; h.passAt = -1; h.missAt = 0; h.bopped = 0; h.moreSaid = 0;
  state.player.inCutscene = false;
  // (the pendant off his neck and onto Meathead's for it; the knights blown up)
  h.ben.piece = null; setPose(h, 'fold');
  if (!has('amulet') || !amuletOn()) {
    lend(); playSound('powerup', 0.6, 2);
    const p = state.player;
    for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: midX(state) + (Math.random() - 0.5) * 30, y: p.pos.y + 16 + Math.random() * 10 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 3 }, life: 30, color: i % 2 ? '#F472B6' : '#FACC15', size: 3 });
  }
  h.shWas = amuletShielded();
  for (let i = 0; i < KNIGHTS_LX.length; i++) if (!h.knights[i]) h.at[i] = state.frame + 20 + i * 25;
};
const runTrial = (state: GameState, h: Lair) => {
  const cx = midX(state);
  // (back in after walking out on it: lent again)
  if (!has('amulet') || !amuletOn()) lend();
  h.ben.facing = cx < X(ROOM.a + BEN_LX) ? -1 : 1;
  const sh = amuletShielded(), yelled = sh && !h.shWas;
  h.shWas = sh;
  if (h.passAt >= 0) {
    blowKnights(state, h, 9999);
    if (state.frame - h.passAt > 900 && h.phase === 'trial') startGift(state, h);
    return;
  }
  // (the knights he pops himself: a miss, and that one's blown up again a moment after)
  const before = h.knights.filter(k => k && (k.health <= 0 || k.isBlownAway)).length;
  if (yelled) {
    // (FUCK OFF: the pass, Meathead's word, then the gift)
    h.passAt = state.frame; setPose(h, 'fold');
    silenceAll(); h.ben.said = null; h.token++;
    const tok = h.token;
    setTimeout(() => {
      if (lairOf(state) !== h || h.token !== tok) return;
      benSays(h.ben, pickLine(L.pass), () => { if (h.token === tok) meatheadSays(state, pickLine(byPants(state, L.passed)), true, () => { if (h.token === tok && h.phase === 'trial') startGift(state, h); }); });
    }, 900);
    blowKnights(state, h, 9999);
    return;
  }
  if (before && !sh && state.frame >= h.missAt) {
    h.missAt = state.frame + 150; h.misses++;
    silenceAll(); h.ben.said = null;
    const tok = h.token;
    benSays(h.ben, pickLine(L.miss), h.misses === 2 ? () => { if (h.token === tok && h.phase === 'trial' && h.passAt < 0) benSays(h.ben, L.hint[0]); } : undefined);
  }
  // (Ben's word as it builds: after the first couple of bops, and again)
  if (h.moreSaid < 2 && h.bopped >= (h.moreSaid + 1) * 2 && !h.ben.said && L.more) { benSays(h.ben, L.more[h.moreSaid]); h.moreSaid++; }
  blowKnights(state, h, REBLOW_TRIAL);
};

// ---- the gift
const startGift = (state: GameState, h: Lair) => {
  h.phase = 'gift'; h.all = 0; h.token++;
  // (his for good, there and then: a skip, a death, a quit can't lose it; the switch left on)
  setPiece('amulet', true); setBenGave('amulet'); flipped = false; saveProgress();
  freeze(state);
  setPose(h, 'give');
  const pants = pantsOf(state);
  const beats: Beat[] = [
    { who: 'ben', text: L.gift[0], pose: 'give' },
    { who: 'ben', text: L.tease[0], pose: 'fold' },
    { who: 'mh', text: pickLine(L.enamored[pants]) },
    { who: 'mh', text: pickLine(AMULET_WEEB[pants]) },
    { who: 'ben', text: AMULET_HUH[0] },
  ];
  // (the last piece of the eight: the full set, his last word)
  beats.push(...giftCoda(pants));
  h.script = startScript(beats);
};
const runGift = (state: GameState, h: Lair): Controls => {
  const s = h.script!;
  freeze(state); h.all++;
  faceBen(state, h);
  const toCard = () => { h.script = null; setPose(h, 'fold'); h.phase = 'card'; h.cardT = 0; h.cardArmed = false; };
  if (h.all > SKIP_AFTER) { offerSkip(); if (takeSkip()) { silenceAll(); skipScript(s); h.token++; h.ben.said = null; toCard(); return { ...NO_CONTROLS }; } }
  if (h.all > 20) tickScript(state, s, h.ben);
  setPose(h, s.pose);
  if (s.done) toCard();
  return { ...NO_CONTROLS };
};

// ---- after: the knights, the nudges
const runDone = (state: GameState, h: Lair) => {
  const p = state.player, cx = midX(state), bx = X(ROOM.a + BEN_LX);
  if (Math.abs(cx - bx) < 240 || h.ben.said) setPose(h, 'fold'); else setPose(h, 'flurry');
  h.ben.facing = cx < bx ? -1 : 1;
  blowKnights(state, h, REBLOW);
  // (the first FUCK OFF after the gift: his word)
  const sh = amuletShielded(), yelled = sh && !h.shWas;
  h.shWas = sh;
  if (yelled && !h.goodSaid && has('amulet')) { h.goodSaid = true; const tok = h.token; setTimeout(() => { if (lairOf(state) === h && h.token === tok) { silenceAll(); benSays(h.ben, pickLine(L.good)); } }, 1200); }
  // (now and then: the cannon)
  if (state.frame > h.nudgeAt && !p.inCutscene && !h.ben.said && !cannonBusy(h.cannon)) {
    h.nudgeAt = state.frame + 2700;
    benSays(h.ben, pickLine(byPants(state, NUDGE)));
  }
};

/** Where Ben's feet are (world). */
export const benAt = () => ({ x: X(ROOM.a + BEN_LX), y: Y(FLOOR) });
