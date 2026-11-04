// JUNGLE LAND'S HIDDEN ARMOR: THE PAULDRONS (the COCO-NUTS), up the river's THIRD MAINTENANCE SHAFT (the owner's brief,
// 2026-11-01: "con-fuck-tious on jungle land is in the third maintenance shaft in the swimming section. you jump up
// several platforms until you eventually go into his lair."). A SEMI-OBVIOUS OPTIONAL PLATFORMING CHALLENGE (the
// placement rule's second kind): the third air pocket's grate hangs open and the shaft goes on up, ledges up its sides.
//
//   THE CLIMB: up out of the third air pocket (MAINT. ACCESS 3), six ledges up the shaft, side to side (one-way: up
//     through them from under), a held jump each; a slip drops him back in the pocket's water (no harm). The other two
//     pockets are as they were.
//   THE LAIR: up top, in the park's old pump room over the culvert (benLairArt.ts draws it): CON-FUCK-TIOUS working
//     out by his tackling dummy, the COCO-NUTS strapped on his shoulders.
//   THE MEETUP (a cutscene, SKIP >> for all of it, bubbles; confucktious/meetup.ts's script): the FIRST meeting's long
//     intro if he's never met Ben anywhere, else the short LATER one; Ben's gross-up, shoulder-barging the camera in the
//     coco-nuts (gross.ts); Meathead wants them; Ben sells them and sets the trial.
//   THE TRIAL (in play): THE HEAD PLANT ITSELF (the owner's "for any pickup that gives a follow up attack, make sure you
//     'pass' when you do the follow up attack. the shoulder pads do not" / "perhaps a new exercise?"). Ben lends the
//     coco-nuts (taken back if he leaves on it; never saved lent) and his TACKLING DUMMY's out on its spring post
//     (benLairDummy.ts: harmless, grabbable): shoulder charge it, keep holding, tap grab: PLANTED, in the floor to the
//     chin; then B by the head: punted off, through the uprights he's chalked on the back wall (the way it flies is
//     the way he kicks from; that way it's lofted over the bar between the posts every time (addKickAim); the other
//     way still passes, with Ben's GOOD ENOUGH (PADS_WIDE)). A charge with no plant after it is a miss (a dry
//     line; a hint after two); the head dug back out before he kicks it, Ben says so. Can't get stuck: the dummy's
//     stood back up whatever's done to it, any plant from either side counts, nothing hurts, the buttons are up on
//     screen near it (the charge and the tap, then the kick once it's planted).
//   THE GIFT (a cutscene, skippable): the coco-nuts are his (setPiece, setBenGave, saved there and then); Ben's tease,
//     Meathead enamored; the last piece of the eight, his last word (giftCoda). (THE HIDDEN ART OF FOLLOW-UPS now comes in the meetup, before the trial line: the owner's "get
//     the sequencing right".) The art: if it's his first follow-up piece (the save's followArt()
//     not set, and Ben's handed over no other follow-up piece), the big beat: the gross-up, how it works (hold the
//     charge, tap grab, no hit needed; mid-sized guys only), what the coco-nuts' own follow-up is (the head plant and
//     the kick), Meathead's cartoon Japanese, Ben lost; the buttons up on screen while he explains. Else a line
//     bringing it up with the head plant in it. Then the YOU GOT card (PieceGotCard.tsx, from equipInfo):
//     90 frames, every button let go once, then a fresh press closes it; PRESS ANY BUTTON only once it's armed.
//   THE PRACTICE: a tour guide (m2:jg_dummy: Jungle Land's guide, harmless: no contact damage, never attacks; grabbable,
//     on the floor, so the PLANTED follow-up and the FIELD GOAL work on him without the hand armor), one at a time,
//     another along a moment after each goes (planted, dead, kicked off). Nothing in the lair hurts him (noContactHurt).
//     The follow-up's buttons stay up till he's planted one (the gift's visit only). Ben nudges him to the cannon.
//   THE CANNON (upgrades/returnCannon.ts, Jungle's look): only once the trial's passed. The owner (2026-11-01): "after
//     ben in the jungle stage, a cannon will shoot you to the start of the audience section in the aquarium". It rests
//     pointing up, leans the little it needs toward the tank, fires him up the old OVERFLOW pipe in the ceiling, and he
//     comes flying out of the pipe's end in the dinosaur tank's left wall (over the tunnel's mouth), on the arc down into
//     the tank's water where the gallery's audience starts (nothing in the water there: the piranhas are far down the
//     tank). Past THE DINOSAUR TANK checkpoint's x, so that checkpoint's his, as it would be swimming there.
//   ONCE GOT: Ben's there (an idle line, the nudges), the practice guide too; the coco-nuts aren't given again (benGave:
//     the cheats' armor toggles don't skip the meetup).
//
// What outlives a death: what he's got (the save) and the meetup having run this visit (state.stageMemo: back up after a
// death, it's straight to the trial). The section's own code is untouched: benLairSection.ts wraps it.

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
import { isNude, isShat } from '../../../m1/game/player/gut';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { registerM2Kind } from '../../kinds';
import { grabHolding, inPlay } from '../../moves/grab';
import { setUi } from '../../store';
import { saveProgress } from '../../save';
import { has, setPiece, setBenMet, benGave, setBenGave, setFollowArt, lendPiece, unlendPiece } from '../../upgrades/state';
import { lastMelee, type MeleeHit } from '../../upgrades/lastHit';
import { buriedAs, addKickAim } from '../../moves/followups';
import { FOLLOW } from '../../upgrades/equipInfo';
import type { EquipControl } from '../../upgrades/equipInfo';
import { makeCannon, updateCannon, cannonBusy, type Cannon } from '../../upgrades/returnCannon';
import {
  NUDGE, BYE_MEATHEAD, BYE_BEN, PIECE_LINES, PADS_WIDE, artBeats, grabArt, artTipRange,
  benSays, drawBenGross, drawBenGrossBack, warmBenGross, meetupScript, startScript, tickScript, skipScript,
  type BenPose, type BenTalk, type Script, type Beat, type ByPants, giftCoda,
  makeGate, syncGate, gateBump, cannonLocked, type Gate,
} from '../../upgrades/confucktious';
import { meatheadSays, saidOver, ledge } from '../section';
import type { Block } from '../../../m1/types';
import { SECTIONS } from '../geometry';
import { drawGuide } from '../clearing/guideArt';
import { lookOf } from '../temple/people';
import { WS, POCKETS, POCKET_TOP } from './course';
import { drawTackle, TACKLE_H, TACKLE_HEAD } from './benLairDummy';

const { x0 } = SECTIONS.river;
const R = (x: number) => x0 + x;
const L = PIECE_LINES.pauldrons;

// ---------------------------------------------------------------------------------------------------------------
// Where (river-relative x; world y)

const P3 = POCKETS[2];
/** The third pocket's shaft, from its chamber up to the lair's floor. */
export const SHAFT = { a: P3.x, b: P3.x + P3.w };
/** The lair: its ends, its floor, its ceiling (the old pump room, up over the culvert's roof). */
export const LAIR = { a: SHAFT.a, b: 9700, floor: -60, ceil: -440 };
/** The climb: each ledge's ends and top, bottom first (side to side up the shaft; the last to the lair floor's lip). */
const LW = 64;
export const LEDGES: [number, number, number][] = [
  [SHAFT.a, SHAFT.a + LW, 552], [SHAFT.b - LW, SHAFT.b, 440], [SHAFT.a, SHAFT.a + LW, 340],
  [SHAFT.b - LW, SHAFT.b, 240], [SHAFT.a, SHAFT.a + LW, 140], [SHAFT.b - LW, SHAFT.b, 40],
];
/** The tackling dummy's spot, Ben's (by the old pump, watching), the chalk uprights on the back wall (their middle: the
 *  way a head punted from the shaft's side flies; on the clear stretch of wall between the squat rack and the hammock's
 *  standpipe), and how they're chalked (px over the floor: the crossbar, the posts' tops; each post off the middle). */
export const DUMMY_X = 9060, BEN_X = 8960, UPRIGHTS_X = 9310;
export const UPRIGHTS_BAR = 140, UPRIGHTS_TOP = 222, UPRIGHTS_HALF = 34;
/** The hammock (strung between two pipes), where the practice guide turns up, the cannon, the overflow pipe's end out of
 *  the tank's left wall (its mouth's height; where the cannon shoots him out), where he comes down in the tank (the
 *  gallery's start), the overflow pipe over the cannon (its width). */
export const HAMMOCK = { a: 9370, b: 9530 };
export const PRACTICE_X = 9560;
export const CANNON_X = 9640;
export const OUTLET_X = 10000, OUTLET_Y = 500, LAND_X = 10200;
export const OVERFLOW_W = 70;
/** The YOU GOT card's least time up before it can be closed (frames). */
const CARD_HOLD = 90;
/** The meetup's run this visit (state.stageMemo: kept across deaths, gone on a fresh way into the land). */
const MEMO = 'm2:benJungle';
/** The dummy stood back up this long after it goes (frames); a charge on it with no plant inside this: a miss. */
const RESPAWN_TRIAL = 60, MISS_AFTER = 70;

const midX = (state: GameState) => state.player.pos.x + state.player.width / 2;
const feetY = (state: GameState) => state.player.pos.y + state.player.height;
/** He's up in the lair (on its floor, or in the air in it). */
export const inLair = (state: GameState) => {
  const cx = midX(state), fy = feetY(state);
  return cx > R(LAIR.a) - 10 && cx < R(LAIR.b) + 10 && fy <= LAIR.floor + 6 && fy > LAIR.ceil - 40;
};
/** He's somewhere in the shaft or the lair (the gross-up's painted ahead from here). */
export const upShaft = (state: GameState) => {
  const cx = midX(state), fy = feetY(state);
  return cx > R(SHAFT.a) - 20 && cx < R(LAIR.b) + 20 && fy < WS - 4 && fy > LAIR.ceil - 40;
};
/** The camera's looking at the lair or the shaft (its own lighting). */
export const lairView = (state: GameState) => {
  const cx = state.camera.x + CANVAS_WIDTH / 2, cy = state.camera.y + CANVAS_HEIGHT / 2;
  return cx > R(SHAFT.a) - 420 && cx < R(LAIR.b) + 420 && cy < POCKET_TOP + 60;
};
const pantsOf = (state: GameState): keyof ByPants => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');
const byPants = (state: GameState, r: ByPants) => r[pantsOf(state)];

// ---------------------------------------------------------------------------------------------------------------
// The practice one: one of the park's tour guides (harmless; grabbable: the follow-ups work on him)

registerM2Kind({
  kind: 'm2:jg_dummy', stats: { w: 38, h: 66, hp: 160, contact: 0, mass: 200 },
  humanoid: true, grab: 'body', pathing: false,
  gender: e => (lookOf(dummySeed(e)).woman ? 'f' : 'm'),
  head: { x: 1, y: -64, r: 9 },
  // (stands his ground facing him, shuffling up when he's off; never attacks)
  ai: (ctx, e) => {
    const pm = mid(ctx.state.player), dx = pm.x - mid(e).x;
    e.aiState = 'near';
    e.facing = dx < 0 ? -1 : 1;
    e.vel.x = Math.abs(dx) > 110 && Math.abs(dx) < 520 ? Math.sign(dx) * 0.7 : 0;
    return false;
  },
  draw: (c, e, f) => drawGuide(c, e, f, dummySeed(e)),
});
function dummySeed(e: Enemy) { return (e.variant ?? 0) * 31 + 7717; }

// The trial's: his tackling dummy on its spring post (harmless: no contact damage, never attacks, never goes anywhere
// it isn't knocked; grabbable, stood on the floor: the head plant works on it; a sack of sawdust inside, not blood)
registerM2Kind({
  kind: 'm2:jg_tackle', stats: { w: 34, h: TACKLE_H, hp: 400, contact: 0, mass: 160 },
  humanoid: true, grab: 'body', pathing: false, gender: 'n', blood: '#C8A86A',
  head: TACKLE_HEAD,
  ai: (ctx, e) => {
    const dx = mid(ctx.state.player).x - mid(e).x;
    e.aiState = 'near';
    e.facing = dx < 0 ? -1 : 1;
    // (bolted down: nothing moves it off its spot (the owner's "make sure the dummy you charge into cannot move when
    // you hit him"); planted or in his hands, the follow-up's got it)
    if (anchorTackle(e)) return true;
    if (Math.abs(e.vel.y) < 0.2) e.vel.x *= 0.8;
    // (kept in the room, off the shaft's hole)
    const lo = R(SHAFT.b) + 20, hi = R(LAIR.b) - 30;
    if (e.pos.x < lo) { e.pos.x = lo; e.vel.x = 0; } else if (e.pos.x + e.width > hi) { e.pos.x = hi - e.width; e.vel.x = 0; }
    return true;
  },
  draw: (c, e, f) => drawTackle(c, e, f),
});

// ---------------------------------------------------------------------------------------------------------------
// State (keyed on state.stage: rebuilt with the stage on every death)

type Phase = 'out' | 'meet' | 'trial' | 'gift' | 'card' | 'done';
export interface Lair {
  phase: Phase;
  /** The scene's clock, a token (bumped on a skip: a line's done-callback from before it does nothing). */
  all: number; token: number;
  /** The meetup's script, then the gift's (their gross-ups: script.gross). */
  script: Script | null;
  ben: BenTalk & { pose: BenPose; facing: 1 | -1; poseT: number; piece: 'pauldrons' | null; x: number; lift: number };
  /** The trial: the dummy (null: gone, stood back up at `dummyAt`), the last hit seen, a charge that hit it waiting on
   *  a plant (frame, 0 none), it planted, misses, the next miss line's frame, the pass's beat (frame, -1), the punt the
   *  wide way. */
  dummy: Enemy | null; dummyAt: number; hitSeen: MeleeHit | null; chargeAt: number; planted: boolean;
  misses: number; missAt: number; passAt: number; wide: boolean;
  /** The way the trial dummy's head was last kicked (its aim saw it; 0: not yet). */
  kickDir: 0 | 1 | -1;
  /** The gift: its beats' indexes for the hidden art's how-to (the buttons up while they're said), the big beat or not,
   *  the pads gone over to Meathead. */
  howA: number; howB: number; artFull: boolean; handed: boolean;
  cardT: number; cardArmed: boolean;
  practice: Enemy | null; respawn: number; goodSaid: boolean; tipsTill: boolean;
  nudgeAt: number;
  cannon: Cannon;
  /** The way out (the shaft's hole) blocked while the trial's on: his bench dragged over it (trialGate.ts). */
  gate: Gate;
  was: Partial<Controls>;
}
const stores = new WeakMap<object, Lair>();
export const lairOf = (state: GameState): Lair => {
  const key = (state.stage ?? state) as object;
  let h = stores.get(key);
  if (!h) stores.set(key, h = {
    phase: 'out', all: 0, token: 0, script: null,
    ben: { said: null, pose: 'flurry', facing: -1, poseT: 0, piece: 'pauldrons', x: BEN_X, lift: 0 },
    dummy: null, dummyAt: 0, hitSeen: null, chargeAt: 0, planted: false, misses: 0, missAt: 0, passAt: -1, wide: false, kickDir: 0,
    howA: -1, howB: -1, artFull: false, handed: false,
    cardT: 0, cardArmed: false, practice: null, respawn: 30, goodSaid: false, tipsTill: false, nudgeAt: 0,
    // (fired up the overflow pipe; out of its end in the tank's left wall, on the arc down into the tank by the gallery)
    cannon: makeCannon(R(CANNON_X), LAIR.floor, { x: R(OUTLET_X) + 30, y: OUTLET_Y + 22 }, { x: R(LAND_X), y: WS + 24 }),
    gate: makeGate('jl-ben-gate', R(SHAFT.a), LAIR.floor, SHAFT.b - SHAFT.a, 16),
    was: {},
  });
  return h;
};
/** The lair's turned off contact hurts (and turns them back on as he leaves). */
let setNoContact = false;
/** The coco-nuts lent for the trial (taken back if it's not finished; never saved lent: upgrades/state.ts). */
const lend = () => { lendPiece('pauldrons'); };
const unlend = () => unlendPiece('pauldrons');
/** The trial's dummy and the practice guides never leave the room (knocked down the shaft: gone, the next one along). */
const sweepLost = (state: GameState) => {
  if (!state.enemies.some(o => (o.kind === 'm2:jg_tackle' || o.kind === 'm2:jg_dummy') && !inRoomBox(o))) return;
  state.enemies = state.enemies.filter(o => !((o.kind === 'm2:jg_tackle' || o.kind === 'm2:jg_dummy') && !inRoomBox(o)) || grabHolding() === o);
};
const inRoomBox = (e: Enemy) => { const cx = e.pos.x + e.width / 2, fy = e.pos.y + e.height; return cx > R(LAIR.a) - 10 && cx < R(LAIR.b) + 10 && fy <= LAIR.floor + 40 && fy > LAIR.ceil - 60; };

// ---------------------------------------------------------------------------------------------------------------
// Building it: the shaft and the lair cut out of the river's rock, the ledges up the shaft

/** Cuts a box out of the section's plain rock (its hidden walls; nothing tagged, nothing one-way): each one it touches
 *  split into what's left round it. */
const carve = (state: GameState, x: number, y: number, w: number, h: number) => {
  const out: Block[] = [];
  state.blocks = state.blocks.filter(b => {
    if (b.type !== 'wall' || !b.hidden || b.tag || b.oneWay) return true;
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
  // (a lend left over from a go cut short: back on his shoulders)
  unlend();
  // (the shaft up from the pocket's chamber, the room, the overflow pipe up from over the cannon: the cannon's shot)
  carve(state, R(SHAFT.a), LAIR.floor, SHAFT.b - SHAFT.a, POCKET_TOP - LAIR.floor);
  carve(state, R(LAIR.a), LAIR.ceil, LAIR.b - LAIR.a, LAIR.floor - LAIR.ceil);
  carve(state, R(CANNON_X) - OVERFLOW_W / 2, LAIR.ceil - 720, OVERFLOW_W, 720);
  for (const [a, b, y] of LEDGES) ledge(state, R(a), y, b - a, { hidden: true, tag: 'jl-shaft' });
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame (before the section's own update)

export const updateLair = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, p = state.player, h = lairOf(state);
  // (the cannon's prompt is set each frame it's near: Jungle Land doesn't clear it itself, and nothing else here sets it)
  setUi({ upPrompt: null });
  if (upShaft(state)) warmBenGross();
  if (!inLair(state)) {
    // (out of the lair: bumping into things hurts again; the practice one's gone with him)
    if (setNoContact) { p.noContactHurt = false; setNoContact = false; }
    // (the safety net: however he got out, the lent coco-nuts come off; the gate's out of the way of coming back up)
    unlend();
    syncGate(state, h.gate, false);
    sweepLost(state);
    if (h.practice && !state.enemies.includes(h.practice)) h.practice = null;
    if (h.dummy && !state.enemies.includes(h.dummy)) h.dummy = null;
    if (!upShaft(state)) clearDummy(state, h);
    if (h.practice) { const e = h.practice; state.enemies = state.enemies.filter(o => o !== e); h.practice = null; }
    if (h.ben.said) h.ben.said = null;
    if (upShaft(state) || cannonBusy(h.cannon)) setUi({ gotPiece: null, chordTips: null });
    return updateCannon(ctx, h.cannon, controls, cannonHooks(h));
  }
  h.ben.poseT++;
  // (a practice room: nothing up here hurts him (the owner: "make sure test enemies cannot hurt you"))
  p.noContactHurt = true; setNoContact = true;
  const pressed = (k: keyof Controls) => !!controls[k] && !h.was[k];
  const anyPress = pressed('jump') || pressed('shoot') || pressed('special') || pressed('secondary') || pressed('charge');
  h.was = { ...controls };
  // Up, on his feet past the shaft's lip: what's on
  if (h.phase === 'out' && p.isGrounded && p.health > 0 && midX(state) > R(SHAFT.b) + 16) {
    if (benGave('pauldrons')) {
      h.phase = 'done'; h.ben.piece = null; h.respawn = 40; h.nudgeAt = state.frame + 900;
      h.ben.x = HAMMOCK.a - 30; setPose(h, 'fold');
      benSays(h.ben, pickLine(byPants(state, L.idle)));
    } else if (state.stageMemo[MEMO]) startTrial(state, h);
    else startMeet(state, h);
  }
  let out = controls, tips: EquipControl[] | null = null;
  switch (h.phase) {
    case 'meet': ({ out, tips } = runMeet(state, h)); break;
    case 'trial': tips = runTrial(ctx, h); break;
    case 'gift': ({ out, tips } = runGift(state, h)); break;
    case 'card': {
      p.inCutscene = true; p.vel.x = 0;
      h.cardT++;
      // (a buffer before it'll close: CARD_HOLD frames, then every button let go once, then a fresh press; its PRESS
      // ANY BUTTON shows only once it's armed)
      const held = !!(controls.jump || controls.shoot || controls.special || controls.secondary || controls.charge);
      if (!h.cardArmed && h.cardT > CARD_HOLD && !held) h.cardArmed = true;
      setUi({ gotPiece: 'pauldrons', gotPieceReady: h.cardArmed });
      if (h.cardArmed && anyPress) {
        h.phase = 'done'; p.inCutscene = false; setUi({ gotPiece: null, gotPieceReady: false });
        h.respawn = 20; h.nudgeAt = state.frame + 2400; h.tipsTill = true;
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
  // The way out: the shaft's hole under his bench while the trial's on (stood on it: Ben's bark); clear on the pass
  syncGate(state, h.gate, h.phase === 'trial' && h.passAt < 0);
  if (h.phase === 'trial') gateBump(state, h.gate, h.ben);
  sweepLost(state);
  if (h.practice && !state.enemies.includes(h.practice)) h.practice = null;
  // The cannon: only once the trial's passed (no getting in, no prompt, before: chained, UP at it gets Ben's bark)
  if (h.phase === 'trial') cannonLocked(state, h.cannon, out, h.ben);
  if (h.phase === 'done' || cannonBusy(h.cannon)) out = updateCannon(ctx, h.cannon, out, cannonHooks(h));
  return out;
};

const cannonHooks = (h: Lair) => ({
  onBoard: (st: GameState) => {
    if (h.practice) { const e = h.practice; st.enemies = st.enemies.filter(o => o !== e); h.practice = null; }
    clearDummy(st, h);
    silenceAll(); h.ben.said = null; setUi({ chordTips: null });
    meatheadSays(st, pickLine(BYE_MEATHEAD), true, () => { if (lairOf(st) === h) benSays(h.ben, pickLine(BYE_BEN)); });
  },
  onExit: (st: GameState, x: number, y: number) => {
    // (out of the overflow pipe's end in the tank's wall, a gush of water with him)
    for (let i = 0; i < 26; i++) st.particles.push({ pos: { x: x - 20 + Math.random() * 20, y: y - 40 + Math.random() * 30 }, vel: { x: 2 + Math.random() * 5, y: -2 + Math.random() * 4 }, life: 40, color: i % 3 ? 'rgba(224, 242, 254, 0.85)' : '#7DD3FC', size: 3 + Math.random() * 4 });
    playSound('splash', 0.9, -4); playSound('glug', 0.7, -6); shakeScreen(st, 5, 4);
    // (the camera to the tank's water: it rests on the last ground he stood on (the lair's floor), and open water under him
    // reads to it as a pit it doesn't follow him down into)
    st.cameraRestY = st.camera.y = WS + 10 - 550;
  },
});

const setPose = (h: Lair, pose: BenPose) => { if (h.ben.pose !== pose) { h.ben.pose = pose; h.ben.poseT = 0; } };
const freeze = (state: GameState) => { const p = state.player; p.inCutscene = true; p.vel.x = 0; state.projectiles = state.projectiles.filter(q => q.owner !== 'player'); };
const faceBen = (state: GameState, h: Lair) => {
  const p = state.player, bx = R(h.ben.x);
  p.facing = bx > midX(state) ? 1 : -1;
  h.ben.facing = p.facing === 1 ? -1 : 1;
};

// ---- the meetup (the first meeting's long intro, or a later one's short one: meetup.ts)
const startMeet = (state: GameState, h: Lair) => {
  h.phase = 'meet'; h.all = 0; h.token++;
  state.stageMemo[MEMO] = '1';
  // (the hidden art of follow-ups before the trial line (the owner's: "ben mentions the 'hidden art' of follow ups after
  // he already guided me to the follow up. get the sequencing right"): the big beat only with his first follow-up piece,
  // whichever land: none taught, none of the others handed over)
  // (full unless a GRAB follow-up piece is his already: the flash kick's art said nothing of grabs; after the flash kick,
  // the short opener, no weeb exchange)
  const ga = grabArt('pauldrons');
  h.artFull = ga.full;
  const art = artBeats(pantsOf(state), h.artFull, { extra: L.follow?.[0], again: L.followAgain?.[0], known: ga.known });
  const beats = meetupScript(pantsOf(state), L, undefined, art);
  // (the buttons up from the how through the head plant's own line)
  [h.howA, h.howB] = artTipRange(beats, art);
  h.script = startScript(beats);
  freeze(state);
  setPose(h, 'flurry'); h.ben.facing = -1;
};
const runMeet = (state: GameState, h: Lair): { out: Controls; tips: EquipControl[] | null } => {
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
  // (the buttons up while he says how the art goes)
  return { out: { ...NO_CONTROLS }, tips: s.i >= h.howA && s.i <= h.howB ? ART_TIPS : null };
};

// ---- the trial
const startTrial = (state: GameState, h: Lair) => {
  h.phase = 'trial'; h.misses = 0; h.missAt = 0; h.passAt = -1; h.chargeAt = 0; h.planted = false; h.wide = false; h.kickDir = 0; h.hitSeen = lastMelee();
  state.player.inCutscene = false;
  // (the coco-nuts off his shoulders and onto Meathead's for it; the dummy stood up)
  h.ben.piece = null; h.ben.x = BEN_X; setPose(h, 'fold');
  if (!has('pauldrons')) {
    lend(); playSound('powerup', 0.6, 2);
    const p = state.player;
    for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: midX(state) + (Math.random() - 0.5) * 40, y: p.pos.y + 14 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 3 }, life: 30, color: i % 2 ? '#F0CC78' : '#8A5C34', size: 3 });
  }
  if (!h.dummy) h.dummyAt = state.frame + 30;
};
/** The dummy: one at a time, stood back up a moment after it goes (knocked over, killed, its head punted off). One in
 *  the floor to the neck isn't gone: it's planted. */
const keepDummy = (state: GameState, h: Lair) => {
  const e = h.dummy;
  if (e) {
    if (buriedAs(e) === 'head' || grabHolding() === e) return;
    // (its AI's off while it's stunned by a hit: held on its spot from here too)
    anchorTackle(e);
    if (e.health > 0 && !e.isBlownAway && state.enemies.includes(e)) return;
    h.dummy = null; h.dummyAt = state.frame + RESPAWN_TRIAL;
    return;
  }
  if (state.frame < h.dummyAt || cannonBusy(h.cannon)) return;
  // (not stood up right on top of him)
  if (Math.abs(R(DUMMY_X) - midX(state)) < 50) { h.dummyAt = state.frame + 30; return; }
  state.enemies = state.enemies.filter(o => o.kind !== 'm2:jg_tackle');
  const k = makeKindEnemy('m2:jg_tackle' as EnemyKind, R(DUMMY_X), LAIR.floor);
  k.homeX = k.pos.x; k.homeY = k.pos.y; k.variant = 0; k.facing = -1; k.seen = true;
  state.enemies.push(k); h.dummy = k;
  playSound('poof', 0.5, -4); playSound('thud', 0.5, -8);
  for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: R(DUMMY_X) + (Math.random() - 0.5) * 40, y: LAIR.floor - 4 }, vel: { x: (Math.random() - 0.5) * 3, y: -0.5 - Math.random() * 1.5 }, life: 26, color: i % 2 ? '#C8A86A' : '#A8A29E', size: 3 });
};
/** The dummy back on its spot (its base plate's bolted to the floor): any knock, throw or blast, it's stood straight
 *  back where it was. Not while it's planted or in his hands (the follow-up's), nor once it's done for (stood up
 *  again new). True: it was put back. */
const anchorTackle = (e: Enemy) => {
  if (e.health <= 0 || e.isBlownAway || grabHolding() === e || buriedAs(e) || e.homeX === undefined || e.homeY === undefined) return false;
  e.pos.x = e.homeX; e.pos.y = e.homeY; e.vel.x = 0; e.vel.y = 0;
  return true;
};
const clearDummy = (state: GameState, h: Lair) => {
  if (h.dummy && grabHolding() !== h.dummy && buriedAs(h.dummy) !== 'head') { const e = h.dummy; state.enemies = state.enemies.filter(o => o !== e); h.dummy = null; }
  if (state.enemies.some(o => o.kind === 'm2:jg_tackle' && o !== h.dummy)) state.enemies = state.enemies.filter(o => o.kind !== 'm2:jg_tackle' || o === h.dummy);
};
/** The trial's punt toward the uprights: lofted so the top of its arc is between the chalk posts, well over the
 *  crossbar (benLairArt.ts draws them from UPRIGHTS_*: the top of the arc halfway between the bar and the posts' tops),
 *  every time (the owner's "make sure the punted dummie's head goes over the 'uprights'"). The other way, or not the
 *  trial's dummy: the usual kick. */
const UPRIGHTS_AIM_Y = LAIR.floor - (UPRIGHTS_BAR + UPRIGHTS_TOP) / 2;
addKickAim((state, e, x, _y, dir) => {
  if (!inLair(state)) return null;
  const h = lairOf(state);
  if (h.phase !== 'trial' || e !== h.dummy) return null;
  h.kickDir = dir;
  return (R(UPRIGHTS_X) - x) * dir > 0 ? { x: R(UPRIGHTS_X), y: UPRIGHTS_AIM_Y } : null;
});
const PLANT_TIPS: EquipControl[] = [
  { pad: ['B'], kb: ['@special'], label: 'SHOULDER CHARGE HIM' },
  { ...FOLLOW, label: 'TAP AS YOU HOLD THE SHOULDER CHARGE: PLANTED' },
];
const KICK_TIPS: EquipControl[] = [{ pad: ['B'], kb: ['@special'], label: 'BY THE HEAD IN THE GROUND: FIELD GOAL' }];
const runTrial = (ctx: FrameContext, h: Lair): EquipControl[] | null => {
  const { state } = ctx, p = state.player, cx = midX(state);
  // (back up after leaving on it: lent again)
  if (!has('pauldrons')) lend();
  h.ben.facing = cx < R(h.ben.x) ? -1 : 1;
  if (h.ben.pose !== 'fold' && h.ben.poseT > 30) setPose(h, 'fold');
  if (h.passAt >= 0) {
    const t = state.frame - h.passAt;
    if (t === 50) {
      const tok = h.token;
      benSays(h.ben, pickLine(h.wide ? PADS_WIDE : L.pass), () => { if (h.token === tok) meatheadSays(state, pickLine(byPants(state, L.passed)), true, () => { if (h.token === tok && h.phase === 'trial') startGift(state, h); }); });
    }
    // (in case a line never gets its turn)
    if (t > 900 && h.phase === 'trial') startGift(state, h);
    return null;
  }
  const e = h.dummy, now = e ? buriedAs(e) : null;
  // (a charge that landed on it: waiting on the plant)
  const hit = lastMelee();
  if (hit && hit !== h.hitSeen) { h.hitSeen = hit; if (e && hit.e === e && hit.move === 'charge') h.chargeAt = state.frame; }
  // Its head punted off: passed (through the uprights if it flew their way)
  if (e && now === 'kicked') {
    h.passAt = state.frame; h.chargeAt = 0; h.planted = false;
    const hx = mid(e).x, dir = h.kickDir || Math.sign(hx - cx);
    h.wide = (R(UPRIGHTS_X) - hx) * dir <= 0;
    silenceAll(); h.ben.said = null; h.token++;
    return null;
  }
  // Planted: now the kick
  if (e && now === 'head' && !h.planted) {
    h.planted = true; h.chargeAt = 0;
    silenceAll(); h.ben.said = null;
    benSays(h.ben, L.more?.[0] ?? pickLine(L.miss));
  } else if (h.planted && now !== 'head') {
    // (dug back out before he kicked it, or knocked loose: up again, plant it again)
    h.planted = false;
    silenceAll(); h.ben.said = null;
    benSays(h.ben, L.more?.[1] ?? pickLine(L.miss));
  }
  keepDummy(state, h);
  // (a charge, and no plant after it: a miss; a hint after two)
  if (h.chargeAt && !h.planted && grabHolding() !== e && state.frame - h.chargeAt > MISS_AFTER && state.frame >= h.missAt) {
    h.chargeAt = 0; h.missAt = state.frame + 150; h.misses++;
    silenceAll(); h.ben.said = null;
    const tok = h.token;
    benSays(h.ben, pickLine(L.miss), h.misses === 2 ? () => { if (h.token === tok && h.phase === 'trial' && h.passAt < 0) benSays(h.ben, L.hint[0]); } : undefined);
  }
  if (!e || p.health <= 0) return null;
  const d = Math.abs(cx - mid(e).x);
  return h.planted ? (d < 300 ? KICK_TIPS : null) : d < 380 ? PLANT_TIPS : null;
};

// ---- the gift, and the hidden art of follow-ups
const startGift = (state: GameState, h: Lair) => {
  h.phase = 'gift'; h.all = 0; h.token++; h.handed = false;
  // (the hidden art's been said before the trial (startMeet): here, only the gift)
  // (his for good, there and then: a skip, a death, a quit can't lose them)
  setPiece('pauldrons', true); setBenGave('pauldrons'); saveProgress();
  // (the dummy's done its job: off the floor (what's left of it))
  clearDummy(state, h);
  freeze(state);
  setPose(h, 'give');
  const pants = pantsOf(state);
  const beats: Beat[] = [
    { who: 'ben', text: L.gift[0], pose: 'give' },
    { who: 'ben', text: L.tease[0], pose: 'fold' },
    { who: 'mh', text: pickLine(L.enamored[pants]) },
  ];
  h.howA = h.howB = -1;
  // (the last piece of the eight: the full set, his last word)
  beats.push(...giftCoda(pants));
  h.script = startScript(beats);
};
// (in the order he does them: the charge, then the tap, then the kick (the owner's: the tips "seem to be backwards"))
const ART_TIPS: EquipControl[] = [
  { pad: ['B'], kb: ['@special'], label: 'SHOULDER CHARGE HIM' },
  { ...FOLLOW, label: 'TAP AS YOU HOLD A SHOULDER CHARGE: PLANTED' },
  { pad: ['B'], kb: ['@special'], label: 'BY THE HEAD IN THE GROUND: FIELD GOAL' },
];
const runGift = (state: GameState, h: Lair): { out: Controls; tips: EquipControl[] | null } => {
  const p = state.player, s = h.script!;
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
  // (the coco-nuts off his shoulders and onto Meathead's, once the gift's said)
  if (!h.handed && s.i >= 1) {
    h.handed = true; h.ben.piece = null; playSound('powerup', 0.8, 0);
    for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: midX(state) + (Math.random() - 0.5) * 40, y: p.pos.y + 14 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 3 }, life: 30, color: i % 2 ? '#F0CC78' : '#8A5C34', size: 3 });
  }
  if (s.done) toCard();
  const tips = s.i >= h.howA && s.i <= h.howB && !s.done ? ART_TIPS : null;
  return { out: { ...NO_CONTROLS }, tips };
};

// ---- after: practice, the nudges
const runDone = (state: GameState, h: Lair): EquipControl[] | null => {
  const p = state.player, cx = midX(state), bx = R(h.ben.x);
  // (Ben: hands on his hips watching when he's close; shadowboxing when he's off)
  if (Math.abs(cx - bx) < 220 || h.ben.said) { setPose(h, 'fold'); h.ben.facing = cx < bx ? -1 : 1; }
  else { setPose(h, 'flurry'); h.ben.facing = cx < bx ? -1 : 1; }
  // The practice one: one at a time, another a moment after each goes (planted, kicked off, dead)
  const e = h.practice;
  const gone = !e || e.health <= 0 || e.isBlownAway || !inPlay(state, e);
  if (e && grabHolding() === e && !h.goodSaid && has('pauldrons')) { h.goodSaid = true; h.tipsTill = false; silenceAll(); benSays(h.ben, pickLine(L.good)); }
  if (gone && !cannonBusy(h.cannon)) {
    if (e) { h.practice = null; h.respawn = 80; }
    else if (--h.respawn <= 0) {
      const d = makeKindEnemy('m2:jg_dummy' as EnemyKind, R(PRACTICE_X), LAIR.floor);
      d.homeX = d.pos.x; d.homeY = d.pos.y; d.variant = state.frame % 9; d.facing = -1; d.seen = true;
      state.enemies.push(d); h.practice = d;
      playSound('poof', 0.6, -2);
      for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: R(PRACTICE_X) + (Math.random() - 0.5) * 50, y: LAIR.floor - 40 + (Math.random() - 0.5) * 50 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 30, color: i % 2 ? '#D6C08A' : '#FFFFFF', size: 6 });
    }
  }
  // (one dug back out of the floor while the next's about: just the one at a time)
  const extra = state.enemies.filter(o => o.kind === 'm2:jg_dummy' && o !== h.practice && o.health > 0);
  if (extra.length) state.enemies = state.enemies.filter(o => !extra.includes(o));
  // (now and then: the cannon)
  if (state.frame > h.nudgeAt && !p.inCutscene && !h.ben.said && !cannonBusy(h.cannon)) {
    h.nudgeAt = state.frame + 2700;
    benSays(h.ben, pickLine(byPants(state, NUDGE)));
  }
  return h.tipsTill && h.practice ? ART_TIPS : null;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing hooks (benLairArt.ts draws the place)

/** Screen space: his gross-up while it's up; SKIP >> while the scene can be skipped. */
export const drawLairHud = (c: CanvasRenderingContext2D, state: GameState) => {
  if (!inLair(state)) return;
  const h = lairOf(state), sc = h.script;
  if ((h.phase === 'meet' || h.phase === 'gift') && sc?.gross) {
    drawBenGrossBack(c, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawBenGross(c, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10, 0.9 + 0.1 * Math.min(1, sc.grossT / 10), state.frame, h.phase === 'meet' ? 'pauldrons' : null, !!h.ben.said);
    // (his words over it, in a bubble: it's a skippable scene)
    if (h.ben.said) saidOver(c, h.ben.said.text, CANVAS_WIDTH / 2 + 60, 120);
  }
  if ((h.phase === 'meet' || h.phase === 'gift') && h.all > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
};
/** Where Ben's feet are (world). */
export const benAt = (state: GameState) => { const b = lairOf(state).ben; return { x: R(b.x), y: LAIR.floor - b.lift }; };
