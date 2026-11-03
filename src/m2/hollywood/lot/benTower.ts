// HOLLYWOOD LAND'S HIDDEN ARMOR: THE LEG ARMOR (the TROPHY SHIN-DIGS), in the drained tank on top of the HAPPYWOOD WATER
// TOWER. The owner's brief (2026-11-01): "the location in hollywood is the happywood water tower. only now it's much
// larger and has a tricky sequence of several rope mechanics you gotta pass to get there. you cannot depend on uppercut
// spam to get there. it is an enclosed vertical scaffolding that requires the use of the wires as it moves up and
// diagonal. it's quite a ways up too. the water tower is like, maybe hundreds of feet high. should take a skilled player
// without falling maybe 15-30 seconds if they know what they are doing. when you get to the water tower, you enter it
// and ben is inside." / "the location shortly after the piss trap" / "the cannon in hollywood just shoots you back to
// the bottom of the water tower. just cause." A SEMI-OBVIOUS OPTIONAL PLATFORMING CHALLENGE (the placement rule's second
// kind): the tower straddles the western town's street just past the flash flood tank (the tourist-pee trap).
//
//   THE TOWER: an enclosed scaffold 800 wide, five decks stacked up it (~250 ft to the tank's floor, ~300 to its roof),
//     walled in on both sides from the first deck up; the street runs on under it between its legs. Every deck is solid
//     steel grating, wall to wall, but for one RIG HATCH: a double trapdoor that only swings open with his weight on the
//     rig that ends under it (the rig's pull line trips its latch). So no uppercut, jump or charge gets through a deck:
//     the only way up a level is the wire. Up through it, off the rig's end: the swoop (charge at the end of the line,
//     the land's own trick), or jump off and uppercut, or pump the swing and jump. A fall lands him on the deck under
//     him (the hatches are shut again); nothing up there hurts. Stood on a shut hatch, holding down drops it (the way
//     down; a HOLD DOWN prompt).
//     THE FIVE LEVELS (a different rope trick each):
//       0  the street to LEVEL 1: one rig, up and across (the harness hangs a jump up, out of the walkers' way: nobody's
//          yanked up the tower just walking past). Charge at the end: the hatch is right over it.
//       1  a camera dolly on its own loop (a shuttle): catch it as it comes, ride it up across.
//       2  a CHAIN: the first rig ends out in the air, short; jump across to the second's harness (hung too high to reach
//          off the deck), and it takes him up the other way.
//       3  REEL IN: the rig ends a long cable under the hatch: charging off the end from there falls short. Hold up to
//          reel in first, then charge.
//       4  a fast dolly hung high: up onto the perch, jump into its harness as it comes past; up under the tank, and the
//          tank's own manhole swings open over him: up into the tank.
//   THE TANK (benTowerArt.ts draws it): drained, a gym-bro hideout. Its own lighting; echoey.
//   THE MEETUP (a cutscene, SKIP >> for all of it; confucktious/meetup.ts): the first meeting's long intro or a later
//     one's short one; Ben's gross-up holding up one of the statuettes for an acceptance speech, then a flash kick up
//     across the screen, the other statuette taped down his shin (gross.ts).
//   THE TRIAL (in play; invented): ACTION! Ben lends him the shin-digs (taken back if he drops out of the tank on it;
//     never saved lent). His red stage curtain drops across the tank, down to a gap at the floor: walking into it bumps
//     him back (a dry line; a hint after two); a SLIDE goes under it. Past it, three sandbags hung off the pipes: a FLASH
//     KICK (up as he holds the slide) knocks one down; a jump or an uppercut into one just swings it (a dry line). Any
//     order, any number at once. Can't get stuck: the slide's always there to go back, and nothing hurts.
//   THE GIFT (a cutscene, skippable): they're his (setPiece, setBenGave, saved there and then); Ben's tease, Meathead
//     enamored. THE HIDDEN ART OF FOLLOW-UPS: if this is his first follow-up piece, the big beat (the gross-up, how
//     follow-ups go, the buttons up as he says it) and then how this one's the odd one out (no grab: up as he holds the
//     slide); else just that this one cheats. Then the YOU GOT card: 90 frames, every button let go, a fresh press.
//   THE PRACTICE: Steve's stunt double (m2:hw_double: harmless, never attacks; trippable, kickable in half), one at a
//     time, the union sends another a moment after each goes; the sandbags are hung again a while after they're kicked
//     down. Nothing in the tank hurts him (noContactHurt). The flash kick's buttons stay up till he's done one.
//   THE CANNON (upgrades/returnCannon.ts, HOLLYWOOD look): only once the trial's passed (Ben nudges him). It points
//     straight up the tank's roof vent and stays that way: it fires him out of the top of the tower and he comes down
//     past the whole thing, outside it, onto the street at its foot. "Just cause."
//   ONCE GOT: Ben's idle line, the practice, the cannon; the shin-digs aren't given twice (benGave: cheats don't skip it).
//
// What outlives a death: what he's got (the save) and the meetup having run this visit (state.stageMemo: back up after
// a death, it's straight to the trial). The lot's own code is untouched but for the old little tower (layout.ts):
// benTowerSection.ts wraps it.

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
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { registerM2Kind } from '../../kinds';
import { inPlay } from '../../moves/grab';
import { setUi } from '../../store';
import { saveProgress } from '../../save';
import { has, setPiece, setBenMet, benGave, setBenGave, followArt, setFollowArt, FOLLOW_PIECES, lendPiece, unlendPiece } from '../../upgrades/state';
import { FOLLOW, type EquipControl } from '../../upgrades/equipInfo';
import { FLASH_RADIUS } from '../../upgrades/tune';
import { makeCannon, updateCannon, cannonBusy, type Cannon } from '../../upgrades/returnCannon';
import {
  BYE_MEATHEAD, PIECE_LINES, artBeats, artStart, ART_FLASH, ART_AGAIN_FLASH,
  LEGS_CURTAIN, MH_HATCH, NUDGE_HW, MH_CANNON_ASK, BEN_CANNON, MH_FALL, MH_LANDED,
  benSays, warmBenGross, meetupScript, startScript, tickScript, skipScript,
  type BenPose, type BenTalk, type Script, type Beat, type ByPants, giftCoda,
  makeGate, syncGate, gateBump, cannonLocked, type Gate,
} from '../../upgrades/confucktious';
import { meatheadSays, solid, ledge, hollywoodWires, type StuntWire } from '../section';
import { wireOn, wireU } from '../wires';
import { GY } from '../geometry';
import { X, Y } from './layout';
import { drawDouble } from './benTowerDouble';

const L = PIECE_LINES.legs;
void BYE_MEATHEAD;

// ---------------------------------------------------------------------------------------------------------------
// Where (x from the lot's start: X(); heights up from the street: Y())

/** The scaffold's inside (its two walls just outside these), each wall's thickness, a deck's. */
export const IN_A = 5060, IN_B = 5860, WALL = 40, DECK_T = 24;
/** The decks' tops (up from the street): [0] the street, [1..4] the levels, [5] the tank's floor. */
export const DECKS = [0, 460, 940, 1500, 2040, 2640];
/** Each deck's rig hatch (its left edge; 150 wide), [1..5]. */
export const HATCH_W = 150;
export const HATCH_X = [0, 5300, 5560, 5520, 5250, 5690];
/** The tank: its inside's ends, how high inside; the vent in its roof over the cannon. */
export const TANK = { a: 5000, b: 5920, h: 380 };
export const VENT = { a: 5850, b: 5920 };
export const TANK_F = DECKS[5];
/** Level 4's perch (under the fast dolly's run), the raft hammock up in the tank: [x0, x1, height]. */
export const PERCH: [number, number, number] = [5150, 5260, DECKS[4] + 120];
export const RAFT: [number, number, number] = [5020, 5160, TANK_F + 250];
/** In the tank: Ben, the curtain (its ends; down to this gap off the floor), the three sandbags (x, how high their feet
 *  hang), the cannon, where the stunt double turns up. */
export const BEN_X = 5090;
export const CURTAIN = { a: 5600, b: 5632, gap: 30 };
export const BAGS0: [number, number][] = [[5200, 120], [5370, 150], [5540, 120]];
export const BAG_W = 28, BAG_H = 38;
export const CANNON_X = 5885;
export const DOUBLE_X = 5330;
/** Where the cannon shoots him out (high over the tank's roof, just off the tower's right side) and where he comes down
 *  (the street at the tower's foot). */
const EXIT = { x: 6000, h: 3300 }, LAND = { x: 6000 };

/** A rig's track a little under the deck over it; its harness at its far end hangs this far under (his feet) the deck's
 *  underside. */
const rigUnder = (k: number) => Y(DECKS[k] - DECK_T - 24);
const feetUnder = (k: number, gap = 156) => Y(DECKS[k] - DECK_T - gap);
/** Its chains go up to the deck over it (and no further: the decks are stacked close). */
const chainTo = (k: number, rigH: number) => DECKS[k] - DECK_T - rigH + 6;
/** The tower's rigs, bottom up (each one's hatch: HATCHES below). */
export const TOWER_WIRES: StuntWire[] = [
  // 0: the street up to level 1 (its harness a jump up, so walking under it on the street doesn't yank him up)
  { from: { x: X(5800), y: Y(170) }, to: { x: X(HATCH_X[1] + HATCH_W - 37), y: feetUnder(1) }, rigY: rigUnder(1), speed: 6, chain: chainTo(1, DECKS[1] - DECK_T - 24) },
  // 1: level 1, a camera dolly on its own loop
  { from: { x: X(5120), y: Y(DECKS[1] + 80) }, to: { x: X(HATCH_X[2] + 37), y: feetUnder(2) }, rigY: rigUnder(2), shuttle: true, speed: 7, chain: chainTo(2, DECKS[2] - DECK_T - 24) },
  // 2a: level 2, out into the air short of the far wall...
  { from: { x: X(5820), y: Y(DECKS[2] + 80) }, to: { x: X(5330), y: Y(DECKS[2] + 250) }, rigY: Y(DECKS[2] + 400), speed: 6, chain: chainTo(3, DECKS[2] + 400) },
  // 2b: ...across to this one's harness (too high to reach off the deck), back up the other way
  { from: { x: X(5240), y: Y(DECKS[2] + 340) }, to: { x: X(HATCH_X[3] + 37), y: feetUnder(3) }, rigY: rigUnder(3), speed: 6, chain: chainTo(3, DECKS[3] - DECK_T - 24) },
  // 3: level 3, a long cable at the end (reel in, then charge)
  { from: { x: X(5810), y: Y(DECKS[3] + 80) }, to: { x: X(HATCH_X[4] + HATCH_W - 37), y: Y(DECKS[4] - 48 - 200 - 82) }, rigY: Y(DECKS[4] - 48), speed: 6, chain: chainTo(4, DECKS[4] - 48) },
  // 4: level 4, a fast dolly hung high (off the perch), up under the tank's manhole
  { from: { x: X(5110), y: Y(DECKS[4] + 300) }, to: { x: X(HATCH_X[5] + 37), y: feetUnder(5) }, rigY: rigUnder(5), shuttle: true, speed: 10, chain: chainTo(5, DECKS[5] - DECK_T - 24) },
];
/** Which rig opens which deck's hatch ([1..5]). */
const HATCH_WIRE = [-1, 0, 1, 3, 4, 5];

const midX = (state: GameState) => state.player.pos.x + state.player.width / 2;
const feetY = (state: GameState) => state.player.pos.y + state.player.height;
const feetY2 = (e: Enemy) => e.pos.y + e.height;
/** In the tank (on its floor, or up in it). */
export const inTank = (state: GameState) => {
  const cx = midX(state), fy = feetY(state);
  return cx > X(TANK.a) - 10 && cx < X(TANK.b) + 10 && fy <= Y(TANK_F) + 6 && fy > Y(TANK_F + TANK.h) - 40;
};
/** Up the tower (inside its walls, over the street), or in the tank. */
export const upTower = (state: GameState) => {
  const cx = midX(state), fy = feetY(state);
  return cx > X(TANK.a) - 60 && cx < X(TANK.b) + 60 && fy < Y(DECKS[1]) + 6 && fy > Y(TANK_F + TANK.h) - 60;
};
/** The camera's on the tank (its own dark). */
export const tankView = (state: GameState) => {
  const cy = state.camera.y + CANVAS_HEIGHT / 2, cx = state.camera.x + CANVAS_WIDTH / 2;
  return cx > X(TANK.a) - 300 && cx < X(TANK.b) + 300 && cy < Y(TANK_F) + 160 && cy > Y(TANK_F + TANK.h) - 300;
};
const pantsOf = (state: GameState): keyof ByPants => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');
const byPants = (state: GameState, r: ByPants) => r[pantsOf(state)];

// ---------------------------------------------------------------------------------------------------------------
// The practice one: Steve's stunt double (harmless; trippable, kickable in half; grabbable)

registerM2Kind({
  kind: 'm2:hw_double', stats: { w: 38, h: 72, hp: 160, contact: 0, mass: 200 },
  humanoid: true, grab: 'body', pathing: false, gender: 'm',
  head: { x: 1, y: -66, r: 10 },
  // (stands his ground facing him, shuffling up when he's off; never attacks: he's paid by the fall)
  ai: (ctx, e) => {
    const pm = mid(ctx.state.player), dx = pm.x - mid(e).x;
    e.aiState = 'near';
    e.facing = dx < 0 ? -1 : 1;
    e.vel.x = Math.abs(dx) > 120 && Math.abs(dx) < 520 ? Math.sign(dx) * 0.6 : 0;
    return false;
  },
  draw: (c, e, f) => drawDouble(c, e, f, (e.variant ?? 0) * 37 + 4401),
});

// ---------------------------------------------------------------------------------------------------------------
// State (keyed on state.stage: rebuilt with the stage on every death)

export interface Hatch {
  k: number; x0: number; x1: number; top: number;
  wire: StuntWire;
  open: boolean; hold: number; down: number;
  block: Block | null;
  /** How far its leaves have swung down (0 shut, 1 hanging). */
  swing: number;
}
export interface Bag { x: number; h: number; down: boolean; at: number; sway: number; sv: number }
type Phase = 'out' | 'meet' | 'trial' | 'gift' | 'card' | 'done';
export interface Tower {
  hatches: Hatch[];
  phase: Phase;
  all: number; token: number;
  script: Script | null;
  ben: BenTalk & { pose: BenPose; facing: 1 | -1; poseT: number; piece: 'legs' | null };
  bags: Bag[];
  /** The curtain's down across the tank (the trial), and him at it: which side he was last on, slid in under it. */
  curtain: boolean; curSide: 1 | -1; slidIn: boolean;
  /** The trial: misses (curtain bumps, sandbags swung), the next miss line's frame, the pass's beat started (frame). */
  misses: number; missAt: number; passAt: number;
  /** The gift: the hidden art's beats (their indexes: the follow-ups' how-to, the flash kick's), the big beat or not. */
  howA: number; howB: number; flashA: number; flashB: number; artFull: boolean;
  cardT: number; cardArmed: boolean;
  practice: Enemy | null; respawn: number; goodSaid: boolean; tipsTill: boolean;
  nudgeAt: number;
  cannon: Cannon;
  /** The vent's lid over the cannon (shut but while it's firing). */
  lid: Block | null;
  /** The way out (the manhole he came up) chained shut while the trial's on (trialGate.ts): no dropping through it. */
  gate: Gate;
  was: Partial<Controls>;
  ui: boolean;
}
const stores = new WeakMap<object, Tower>();
export const towerOf = (state: GameState): Tower => {
  const key = (state.stage ?? state) as object;
  let h = stores.get(key);
  if (!h) stores.set(key, h = {
    hatches: [],
    phase: 'out', all: 0, token: 0, script: null,
    ben: { said: null, pose: 'flurry', facing: 1, poseT: 0, piece: 'legs' },
    bags: BAGS0.map(([x, hh]) => ({ x, h: hh, down: false, at: -999, sway: 0, sv: 0 })),
    curtain: false, curSide: 1, slidIn: false,
    misses: 0, missAt: 0, passAt: -1,
    howA: -1, howB: -1, flashA: -1, flashB: -1, artFull: false,
    cardT: 0, cardArmed: false, practice: null, respawn: 40, goodSaid: false, tipsTill: false, nudgeAt: 0,
    // (straight up the roof vent; out high over the tower's right side, down past the lot of it to the street)
    cannon: makeCannon(X(CANNON_X), Y(TANK_F), { x: X(EXIT.x), y: Y(EXIT.h) }, { x: X(LAND.x), y: GY }),
    lid: null,
    gate: makeGate('hw-ben-gate', X(HATCH_X[5]), Y(TANK_F), HATCH_W, DECK_T),
    was: {}, ui: false,
  });
  return h;
};
/** The shin-digs lent for the trial (taken back if it's not finished; never saved lent: upgrades/state.ts). */
const lend = () => { lendPiece('legs'); };
const unlend = () => unlendPiece('legs');
let setNoContact = false;

// ---------------------------------------------------------------------------------------------------------------
// Building it

export const buildTower = (state: GameState) => {
  // (a lend left over from a go cut short: back in the box)
  unlend();
  const h = towerOf(state);
  const tag = 'hw-tower';
  // The decks (wall to wall, but for each one's hatch; the tank's floor is wider, its own walls'), each hatch's trapdoor
  for (let k = 1; k <= 5; k++) {
    const a = k === 5 ? TANK.a : IN_A, b = k === 5 ? TANK.b : IN_B, top = Y(DECKS[k]);
    const x0 = HATCH_X[k], x1 = x0 + HATCH_W;
    solid(state, X(a), top, x0 - a, DECK_T, { hidden: true, tag });
    solid(state, X(x1), top, b - x1, DECK_T, { hidden: true, tag });
    const hk: Hatch = { k, x0: X(x0), x1: X(x1), top, wire: TOWER_WIRES[HATCH_WIRE[k]], open: false, hold: 0, down: 0, block: null, swing: 0 };
    hk.block = solid(state, hk.x0, top, HATCH_W, DECK_T, { hidden: true, tag: 'hw-hatch' });
    h.hatches.push(hk);
  }
  // The scaffold's walls (from under the first deck up to the tank), the tank's (up to its ceiling), the ceiling (but for
  // the vent over the cannon, its lid shut)
  const wb = DECKS[1] - DECK_T, top = TANK_F + TANK.h + 40;
  solid(state, X(IN_A - WALL), Y(TANK_F), WALL, TANK_F - wb, { hidden: true, tag });
  solid(state, X(IN_B), Y(TANK_F), WALL, TANK_F - wb, { hidden: true, tag });
  solid(state, X(TANK.a - WALL), Y(top), WALL, top - TANK_F + DECK_T, { hidden: true, tag });
  solid(state, X(TANK.b), Y(top), WALL, top - TANK_F + DECK_T, { hidden: true, tag });
  solid(state, X(TANK.a - WALL), Y(top), VENT.a - TANK.a + WALL, 40, { hidden: true, tag });
  h.lid = solid(state, X(VENT.a), Y(top), VENT.b - VENT.a, 40, { hidden: true, tag: 'hw-lid' });
  // The perch on level 4, the raft up in the tank
  for (const [a, b, hh] of [PERCH, RAFT]) ledge(state, X(a), Y(hh), b - a, { hidden: true, tag });
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame (before the lot's own update)

const overlaps = (state: GameState, x: number, y: number, w: number, hh: number) => {
  const p = state.player;
  return p.pos.x < x + w && p.pos.x + p.width > x && p.pos.y < y + hh && p.pos.y + p.height > y;
};

/** The rig hatches: open with his weight on the rig at the end under one (and while he's still going through it), or
 *  stood on one holding down; shut again once he's clear of it (never on him). */
const runHatches = (state: GameState, h: Tower, controls: Controls) => {
  const p = state.player, all = hollywoodWires(state), on = wireOn(state), cx = midX(state), fy = feetY(state);
  for (const hk of h.hatches) {
    const i = all.indexOf(hk.wire);
    const loaded = i >= 0 && on === i && wireU(state, i) > 0.97;
    if (loaded) hk.hold = 40;
    // (stood on it shut: hold down to drop through)
    const stood = !hk.open && p.isGrounded && Math.abs(fy - hk.top) < 3 && cx > hk.x0 + 6 && cx < hk.x1 - 6 && p.health > 0 && !p.inCutscene
      // (stood still on it: not a slide across it with down held (the tank's trial runs over the manhole))
      && !p.isSliding && !p.isCharging && Math.abs(p.vel.x) < 1
      // (the tank's manhole chained shut while Ben's trial's on: no dropping out through it)
      && !(hk.k === 5 && h.gate.block);
    if (stood) { setUi({ holdDownPrompt: 'DROP DOWN' }); hk.down = controls.down ? hk.down + 1 : 0; if (hk.down > 10) hk.hold = 24; }
    else hk.down = 0;
    const inCol = p.pos.x + p.width > hk.x0 - 4 && p.pos.x < hk.x1 + 4 && fy > hk.top - 170 && p.pos.y < hk.top + DECK_T + 240;
    const want = hk.hold > 0 || (hk.open && inCol);
    if (hk.hold > 0) hk.hold--;
    if (want && !hk.open) {
      hk.open = true;
      if (hk.block) { const b = hk.block; state.blocks = state.blocks.filter(o => o !== b); hk.block = null; }
      playSound('clang', 0.7, -6); playSound('whoosh', 0.4, -8);
      if (loaded && !state.stageMemo['m2:hwHatch']) { state.stageMemo['m2:hwHatch'] = '1'; meatheadSays(state, pickLine(byPants(state, MH_HATCH)), true); }
    } else if (!want && hk.open && !overlaps(state, hk.x0 - 1, hk.top - 1, HATCH_W + 2, DECK_T + 2)) {
      hk.open = false;
      hk.block = solid(state, hk.x0, hk.top, HATCH_W, DECK_T, { hidden: true, tag: 'hw-hatch' });
      playSound('slam', 0.5, -4);
    }
    hk.swing += ((hk.open ? 1 : 0) - hk.swing) * 0.3;
    if (Math.abs(hk.swing - (hk.open ? 1 : 0)) < 0.01) hk.swing = hk.open ? 1 : 0;
  }
};

export const updateTower = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, p = state.player, h = towerOf(state);
  runHatches(state, h, controls);
  runLid(state, h);
  if (upTower(state) && feetY(state) < Y(DECKS[3])) warmBenGross();
  const tank = inTank(state);
  if (!tank) {
    // (out of the tank: bumping into things hurts again; a lend's taken back; the practice one's gone with him)
    if (setNoContact) { p.noContactHurt = false; setNoContact = false; }
    // (the safety net: however he got out, the lent shin-digs come off; the chain's off the manhole for coming back up)
    unlend();
    syncGate(state, h.gate, false);
    if (h.practice) { const e = h.practice; state.enemies = state.enemies.filter(o => o !== e); h.practice = null; }
    if (h.ben.said && !cannonBusy(h.cannon)) h.ben.said = null;
    if (h.ui) { h.ui = false; setUi({ gotPiece: null, gotPieceReady: false, chordTips: null }); }
    return updateCannon(ctx, h.cannon, controls, cannonHooks(h));
  }
  h.ui = true;
  h.ben.poseT++;
  calm(state);
  // (a practice room: nothing up here hurts him)
  p.noContactHurt = true; setNoContact = true;
  const pressed = (k: keyof Controls) => !!controls[k] && !h.was[k];
  const anyPress = pressed('jump') || pressed('shoot') || pressed('special') || pressed('secondary') || pressed('charge');
  h.was = { ...controls };
  swayBags(state, h);
  // Up out of the manhole, on his feet off it: what's on
  const hk5 = h.hatches[4];
  if (h.phase === 'out' && p.isGrounded && p.health > 0 && (midX(state) < hk5.x0 - 4 || midX(state) > hk5.x1 + 4)) {
    if (benGave('legs')) {
      h.phase = 'done'; h.ben.piece = null; h.respawn = 40; h.nudgeAt = state.frame + 900;
      setPose(h, 'fold'); faceBen(state, h);
      benSays(h.ben, pickLine(byPants(state, L.idle)));
    } else if (state.stageMemo[MEMO]) startTrial(state, h);
    else startMeet(state, h);
  }
  let out = controls, tips: EquipControl[] | null = null;
  switch (h.phase) {
    case 'meet': ({ out, tips } = runMeet(state, h)); break;
    case 'trial': tips = runTrial(state, h); break;
    case 'gift': ({ out, tips } = runGift(state, h)); break;
    case 'card': {
      p.inCutscene = true; p.vel.x = 0;
      h.cardT++;
      // (a buffer before it'll close: CARD_HOLD frames, every button let go once, then a fresh press; PRESS ANY BUTTON
      // only once it's armed)
      const held = !!(controls.jump || controls.shoot || controls.special || controls.secondary || controls.charge);
      if (!h.cardArmed && h.cardT > CARD_HOLD && !held) h.cardArmed = true;
      setUi({ gotPiece: 'legs', gotPieceReady: h.cardArmed });
      if (h.cardArmed && anyPress) {
        h.phase = 'done'; p.inCutscene = false; setUi({ gotPiece: null, gotPieceReady: false });
        h.respawn = 20; h.nudgeAt = state.frame + 2400; h.tipsTill = true;
        setPose(h, 'fold');
        const tok = h.token;
        setTimeout(() => { if (towerOf(state) === h && h.token === tok) benSays(h.ben, L.practice[0]); }, 500);
      }
      out = { ...NO_CONTROLS };
      break;
    }
    case 'done': tips = runDone(state, h); break;
  }
  if (h.phase !== 'card') setUi({ gotPiece: null });
  setUi({ chordTips: tips });
  // The way out: the manhole chained shut while the trial's on (stood on it holding down: Ben's bark); off on the pass
  syncGate(state, h.gate, h.phase === 'trial' && h.passAt < 0);
  if (h.phase === 'trial') {
    const fy = feetY(state), cx = midX(state);
    gateBump(state, h.gate, h.ben, !!controls.down && p.isGrounded && Math.abs(fy - h.gate.y) < 3 && cx > h.gate.x + 6 && cx < h.gate.x + h.gate.w - 6);
  }
  // (the stunt double never leaves the tank: through the manhole somehow, he's gone, the union sends the next)
  if (h.practice && (feetY2(h.practice) > Y(TANK_F) + 30 || !state.enemies.includes(h.practice))) { const e = h.practice; state.enemies = state.enemies.filter(o => o !== e); h.practice = null; }
  // The cannon: only once the trial's passed (no getting in, no prompt, before: chained, UP at it gets Ben's bark)
  if (h.phase === 'trial') cannonLocked(state, h.cannon, out, h.ben);
  if (h.phase === 'done' || cannonBusy(h.cannon)) out = updateCannon(ctx, h.cannon, out, cannonHooks(h));
  return out;
};

/** The YOU GOT card's least time up before it can be closed (frames). */
const CARD_HOLD = 90;
/** The meetup's run this visit (state.stageMemo: kept across deaths, gone on a fresh way into the land). */
const MEMO = 'm2:benHollywood';
/** A kicked-down sandbag's hung again this long after (practice). */
const REHANG = 360;

/** Nothing in the tank gets at him: shots in it that aren't his are gone; anything else in it but the stunt double is
 *  put back down on the street. */
const calm = (state: GameState) => {
  const inBox = (x: number, y: number) => x > X(TANK.a) - 20 && x < X(TANK.b) + 20 && y < Y(TANK_F) + 10 && y > Y(TANK_F + TANK.h) - 40;
  if (state.projectiles.length) state.projectiles = state.projectiles.filter(q => q.owner === 'player' || !inBox(q.pos.x, q.pos.y));
  for (const e of state.enemies) {
    if (e.health <= 0 || e.type === 'boss' || e.kind === 'm2:hw_double') continue;
    if (inBox(e.pos.x + e.width / 2, e.pos.y + e.height)) { e.pos.x = X(TANK.b) + 120; e.pos.y = GY - e.height; e.vel.x = 0; e.vel.y = 0; }
  }
};

/** The vent's lid over the cannon: open while it's firing, shut otherwise (never on him). */
const runLid = (state: GameState, h: Tower) => {
  const busy = cannonBusy(h.cannon), top = Y(TANK_F + TANK.h + 40);
  if (busy && h.lid) { const b = h.lid; state.blocks = state.blocks.filter(o => o !== b); h.lid = null; }
  else if (!busy && !h.lid && !overlaps(state, X(VENT.a), top, VENT.b - VENT.a, 40)) h.lid = solid(state, X(VENT.a), top, VENT.b - VENT.a, 40, { hidden: true, tag: 'hw-lid' });
};

const cannonHooks = (h: Tower) => ({
  onBoard: (st: GameState) => {
    if (h.practice) { const e = h.practice; st.enemies = st.enemies.filter(o => o !== e); h.practice = null; }
    silenceAll(); h.ben.said = null; setUi({ chordTips: null });
    // (where does it go? the bottom. just 'cause.)
    meatheadSays(st, pickLine(MH_CANNON_ASK), true, () => { if (towerOf(st) === h) benSays(h.ben, pickLine(BEN_CANNON)); });
  },
  onExit: (st: GameState, x: number, y: number) => {
    // (out of the top of the tower, high over it: a puff of the tank's dust with him; then the long way down)
    for (let i = 0; i < 18; i++) st.particles.push({ pos: { x: x - 16 + Math.random() * 32, y: y + Math.random() * 30 }, vel: { x: (Math.random() - 0.5) * 3, y: 1 + Math.random() * 2 }, life: 40, color: i % 3 ? '#A8A29E' : '#D6D3D1', size: 3 + Math.random() * 3 });
    playSound('whoosh', 1, -10);
    meatheadSays(st, pickLine(MH_FALL), true);
  },
  onLand: (st: GameState) => { shakeScreen(st, 8, 6); playSound('thud', 1, -8); meatheadSays(st, pickLine(byPants(st, MH_LANDED)), true); },
});

const setPose = (h: Tower, pose: BenPose) => { if (h.ben.pose !== pose) { h.ben.pose = pose; h.ben.poseT = 0; } };
const freeze = (state: GameState) => { const p = state.player; p.inCutscene = true; p.vel.x = 0; state.projectiles = state.projectiles.filter(q => q.owner !== 'player'); };
const faceBen = (state: GameState, h: Tower) => {
  const p = state.player, bx = X(BEN_X);
  p.facing = bx > midX(state) ? 1 : -1;
  h.ben.facing = p.facing === 1 ? -1 : 1;
};

// ---- the meetup
const startMeet = (state: GameState, h: Tower) => {
  h.phase = 'meet'; h.all = 0; h.token++;
  state.stageMemo[MEMO] = '1';
  // (the gross-up back up for the sell: the acceptance speech)
  const sell = L.sell[0];
  // (the hidden art of follow-ups before the trial line (the owner's: "ben mentions the 'hidden art' of follow ups after
  // he already guided me to the follow up. get the sequencing right"): the big beat (with the shins' flash kick after
  // the how) only with his first follow-up piece, whichever land; else the brief mention, the flash kick's own)
  h.artFull = !followArt() && !FOLLOW_PIECES.some(pc => pc !== 'legs' && benGave(pc));
  const art = artBeats(pantsOf(state), h.artFull, { extra: ART_FLASH[0], again: ART_AGAIN_FLASH[0], againIsExtra: true });
  const beats = meetupScript(pantsOf(state), L, undefined, art).map((b): Beat => (b.who === 'ben' && b.text === sell ? { ...b, gross: true } : b));
  const at = artStart(beats, art), abs = (i: number) => (i < 0 ? -1 : at + i);
  h.howA = abs(art.how[0]); h.howB = abs(art.how[1]); h.flashA = abs(art.extra[0]); h.flashB = abs(art.extra[1]);
  h.script = startScript(beats);
  freeze(state);
  setPose(h, 'flurry'); h.ben.facing = 1;
};
const runMeet = (state: GameState, h: Tower): { out: Controls; tips: EquipControl[] | null } => {
  const s = h.script!;
  freeze(state); h.all++;
  const end = () => { setBenMet(true); saveProgress(); h.script = null; startTrial(state, h); };
  if (h.all > SKIP_AFTER) { offerSkip(); if (takeSkip()) { silenceAll(); skipScript(s); h.ben.said = null; end(); return { out: { ...NO_CONTROLS }, tips: null }; } }
  // (a beat of him shadowboxing first; then he turns to Meathead for the lot)
  if (h.all > 40) {
    tickScript(state, s, h.ben);
    if (s.i > 0 || s.waiting) { setPose(h, s.pose); faceBen(state, h); }
    if (s.done) { end(); return { out: { ...NO_CONTROLS }, tips: null }; }
  }
  // (the buttons up while he says how the art goes, and the flash kick)
  const tips = h.howA >= 0 && s.i >= h.howA && s.i <= h.howB ? HOW_TIPS : h.flashA >= 0 && s.i >= h.flashA && s.i <= h.flashB ? FLASH_TIPS : null;
  return { out: { ...NO_CONTROLS }, tips };
};

// ---- the trial
const startTrial = (state: GameState, h: Tower) => {
  h.phase = 'trial'; h.misses = 0; h.passAt = -1; h.missAt = 0;
  state.player.inCutscene = false;
  // (the curtain down across the tank (he's on the manhole's side of it), the sandbags hung)
  h.curtain = true; h.curSide = midX(state) < X((CURTAIN.a + CURTAIN.b) / 2) ? -1 : 1; h.slidIn = false;
  for (const b of h.bags) { b.down = false; b.sway = 0; b.sv = 0; }
  playSound('whoosh', 0.8, -10); playSound('thud', 0.6, -6);
  // (the shin-digs off his shins and onto Meathead's for it)
  h.ben.piece = null; setPose(h, 'fold');
  if (!has('legs')) {
    lend(); playSound('powerup', 0.6, 2);
    const p = state.player;
    for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: midX(state) + (Math.random() - 0.5) * 30, y: p.pos.y + 40 + Math.random() * 20 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 3 }, life: 30, color: i % 2 ? '#FAD43A' : '#B4BCC8', size: 3 });
  }
};
const SLIDE_TIPS: EquipControl[] = [
  { pad: ['DPAD_DOWN', 'B'], join: '+', kb: ['@down', '@special'], label: 'SLIDE TACKLE' },
  { pad: ['DPAD_UP'], kb: ['@up'], label: 'PRESS AS YOU HOLD THE SLIDE: FLASH KICK' },
];
/** A sandbag's box (world): x0, top, w, h. */
export const bagBox = (b: Bag): [number, number, number, number] => [X(b.x) - BAG_W / 2, Y(TANK_F + b.h) - BAG_H, BAG_W, BAG_H];
/** In the flash kick's circle (its own reach: tune.ts FLASH_RADIUS, about his middle). */
const inFlash = (state: GameState, [x, y, w, hh]: [number, number, number, number]) => {
  const p = state.player, cx = midX(state), cy = p.pos.y + p.height / 2 - 6;
  const nx = Math.max(x, Math.min(cx, x + w)), ny = Math.max(y, Math.min(cy, y + hh));
  return (nx - cx) ** 2 + (ny - cy) ** 2 <= FLASH_RADIUS * FLASH_RADIUS;
};
/** The sandbags: swinging back to still; a flash kick through one knocks it down (true); anything else into it swings
 *  it (`bumped`). */
const swayBags = (state: GameState, h: Tower) => {
  for (const b of h.bags) { b.sv += -b.sway * 0.02; b.sv *= 0.96; b.sway += b.sv; }
};
const kickBags = (state: GameState, h: Tower): { kicked: number; bumped: boolean } => {
  const p = state.player;
  let kicked = 0, bumped = false;
  for (const b of h.bags) {
    if (b.down) continue;
    const bx = bagBox(b);
    if (p.flashKick && inFlash(state, bx)) {
      b.down = true; b.at = state.frame; kicked++;
      playSound('punch', 1, -6); playSound('thud', 0.8, -4); playSound('poof', 0.6, -6);
      const [x, y] = bx;
      for (let i = 0; i < 20; i++) state.particles.push({ pos: { x: x + Math.random() * BAG_W, y: y + Math.random() * BAG_H }, vel: { x: (Math.random() - 0.5) * 5, y: -2 - Math.random() * 3 }, life: 30 + Math.random() * 20, color: i % 3 ? '#D8C08A' : '#A88A52', size: 2 + Math.random() * 2, grav: 0.3 } as typeof state.particles[number]);
      shakeScreen(state, 5, 4);
    } else if (overlaps(state, bx[0], bx[1], bx[2], bx[3])) {
      if (Math.abs(b.sv) < 0.02) { b.sv = (midX(state) < X(b.x) ? 1 : -1) * 0.12; playSound('thud', 0.4, 2); }
      bumped = true;
    }
  }
  return { kicked, bumped };
};
/** Him at the curtain: under it sliding; walking into it, bumped back out (true). */
const runCurtain = (state: GameState, h: Tower): boolean => {
  const p = state.player, fy = feetY(state), mx = X((CURTAIN.a + CURTAIN.b) / 2);
  const over = p.pos.x + p.width > X(CURTAIN.a) && p.pos.x < X(CURTAIN.b) && fy > Y(TANK_F + TANK.h);
  if (!over) { h.curSide = midX(state) < mx ? -1 : 1; h.slidIn = false; return false; }
  if (p.isSliding) { h.slidIn = true; return false; }
  // (slid partway under and stopped: out the far side; walked into it: back out)
  const side = h.slidIn ? -h.curSide as 1 | -1 : h.curSide;
  p.pos.x = side < 0 ? X(CURTAIN.a) - p.width - 1 : X(CURTAIN.b) + 1; p.vel.x = 0;
  if (h.slidIn) { h.curSide = side; h.slidIn = false; return false; }
  playSound('thud', 0.5, -10);
  return true;
};
const miss = (state: GameState, h: Tower, lines: string[]) => {
  if (state.frame < h.missAt) return;
  h.missAt = state.frame + 150; h.misses++;
  silenceAll(); h.ben.said = null;
  const tok = h.token;
  benSays(h.ben, pickLine(lines), h.misses === 2 ? () => { if (h.token === tok && h.phase === 'trial' && h.passAt < 0) benSays(h.ben, L.hint[0]); } : undefined);
};
const runTrial = (state: GameState, h: Tower): EquipControl[] | null => {
  const p = state.player, cx = midX(state);
  // (back up after dropping out on it: lent again)
  if (!has('legs')) lend();
  h.ben.facing = cx < X(BEN_X) ? -1 : 1;
  if (h.passAt >= 0) {
    if (state.frame - h.passAt > 900 && h.phase === 'trial') startGift(state, h);
    return null;
  }
  if (h.curtain && runCurtain(state, h)) miss(state, h, LEGS_CURTAIN);
  const { kicked, bumped } = kickBags(state, h);
  const down = h.bags.filter(b => b.down).length;
  if (kicked) {
    silenceAll(); h.ben.said = null; h.token++;
    if (down < 3) benSays(h.ben, L.more?.[down - 1] ?? pickLine(L.miss));
    else {
      // (all three: the pass, Meathead's word, then the gift)
      h.passAt = state.frame; setPose(h, 'fold');
      const tok = h.token;
      benSays(h.ben, pickLine(L.pass), () => { if (h.token === tok) meatheadSays(state, pickLine(byPants(state, L.passed)), true, () => { if (h.token === tok && h.phase === 'trial') startGift(state, h); }); });
      return null;
    }
  } else if (bumped && !p.flashKick) miss(state, h, L.miss);
  return p.health > 0 ? SLIDE_TIPS : null;
};

// ---- the gift, and the hidden art of follow-ups
const startGift = (state: GameState, h: Tower) => {
  h.phase = 'gift'; h.all = 0; h.token++;
  // (the hidden art's been said before the trial (startMeet): here, only the gift)
  // (his for good, there and then: a skip, a death, a quit can't lose them; the curtain goes back up)
  setPiece('legs', true); setBenGave('legs'); saveProgress();
  h.curtain = false;
  freeze(state);
  setPose(h, 'give');
  const pants = pantsOf(state);
  const beats: Beat[] = [
    { who: 'ben', text: L.gift[0], pose: 'give' },
    { who: 'ben', text: L.tease[0], pose: 'fold' },
    { who: 'mh', text: pickLine(L.enamored[pants]) },
  ];
  h.howA = h.howB = h.flashA = h.flashB = -1;
  // (the last piece of the eight: the full set, his last word)
  beats.push(...giftCoda(pants));
  h.script = startScript(beats);
};
const HOW_TIPS: EquipControl[] = [{ ...FOLLOW, label: 'TAP AS YOU HOLD A CHARGE MOVE: FOLLOW-UP' }];
const FLASH_TIPS: EquipControl[] = [
  { pad: ['DPAD_DOWN', 'B'], join: '+', kb: ['@down', '@special'], label: 'SLIDE TACKLE (TRIPS GUYS)' },
  { pad: ['DPAD_UP'], kb: ['@up'], label: 'PRESS AS YOU HOLD THE SLIDE: FLASH KICK (FREE)' },
];
const runGift = (state: GameState, h: Tower): { out: Controls; tips: EquipControl[] | null } => {
  const s = h.script!;
  freeze(state); h.all++;
  faceBen(state, h);
  const toCard = () => {
    setFollowArt(true); saveProgress();
    h.script = null; setPose(h, 'fold');
    h.phase = 'card'; h.cardT = 0; h.cardArmed = false;
  };
  if (h.all > SKIP_AFTER) { offerSkip(); if (takeSkip()) { silenceAll(); skipScript(s); h.token++; h.ben.said = null; toCard(); return { out: { ...NO_CONTROLS }, tips: null }; } }
  if (h.all > 20) tickScript(state, s, h.ben);
  setPose(h, s.pose);
  if (s.done) { toCard(); return { out: { ...NO_CONTROLS }, tips: null }; }
  const tips = s.i >= h.howA && s.i <= h.howB ? HOW_TIPS : s.i >= h.flashA && s.i <= h.flashB ? FLASH_TIPS : null;
  return { out: { ...NO_CONTROLS }, tips };
};

// ---- after: practice, the nudges
const runDone = (state: GameState, h: Tower): EquipControl[] | null => {
  const p = state.player, cx = midX(state), bx = X(BEN_X);
  // (Ben: hands on his hips watching when he's close; shadowboxing when he's off)
  if (Math.abs(cx - bx) < 220 || h.ben.said) setPose(h, 'fold'); else setPose(h, 'flurry');
  h.ben.facing = cx < bx ? -1 : 1;
  // (the sandbags: kicked down, hung again a while after)
  for (const b of h.bags) if (b.down && state.frame - b.at > REHANG) { b.down = false; b.sway = 0; b.sv = 0.08; playSound('whoosh', 0.3, 6); }
  kickBags(state, h);
  if (p.flashKick) h.tipsTill = false;
  // The practice one: one at a time, another along a moment after each goes (kicked in half, tripped off, dead)
  const e = h.practice;
  const gone = !e || e.health <= 0 || e.isBlownAway || !inPlay(state, e);
  if (e && gone && !h.goodSaid && has('legs')) { h.goodSaid = true; silenceAll(); benSays(h.ben, pickLine(L.good)); }
  if (gone && !cannonBusy(h.cannon)) {
    if (e) { h.practice = null; h.respawn = 80; }
    else if (--h.respawn <= 0) {
      const d = makeKindEnemy('m2:hw_double' as EnemyKind, X(DOUBLE_X), Y(TANK_F));
      d.homeX = d.pos.x; d.homeY = d.pos.y; d.variant = state.frame % 9; d.facing = 1; d.seen = true;
      state.enemies.push(d); h.practice = d;
      playSound('poof', 0.6, -2);
      for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: X(DOUBLE_X) + (Math.random() - 0.5) * 50, y: Y(TANK_F) - 40 + (Math.random() - 0.5) * 50 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 30, color: i % 2 ? '#FAD43A' : '#FFFFFF', size: 6 });
    }
  }
  // (one left over while the next's about: just the one at a time)
  const extra = state.enemies.filter(o => o.kind === 'm2:hw_double' && o !== h.practice && o.health > 0 && !o.isBlownAway);
  if (extra.length) state.enemies = state.enemies.filter(o => !extra.includes(o));
  // (now and then: the cannon)
  if (state.frame > h.nudgeAt && !p.inCutscene && !h.ben.said && !cannonBusy(h.cannon)) {
    h.nudgeAt = state.frame + 2700;
    benSays(h.ben, pickLine(byPants(state, NUDGE_HW)));
  }
  return h.tipsTill ? FLASH_TIPS : null;
};

/** Where Ben's feet are (world). */
export const benAt = () => ({ x: X(BEN_X), y: Y(TANK_F) });
