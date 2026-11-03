// SPOOKY LAND'S HIDDEN ARMOR: THE CAPE (the CLEARANCE CAPE), in the castle's forgotten RESTRICTED SECTION. The owner's
// brief (2026-11-01): "the location in spooky land is in the library. at the top on the lefthand side, there's a hidden
// pathway up top that will lead there. a cannon will shoot you to the start of the bedroom." An OUTSIDE-THE-BOX
// EXPLORATION find (the placement rule's first kind).
//
//   THE WAY IN: from the left end of the library's third gallery, two old wall shelves up the dark top left corner (on
//     iron brackets, cobwebbed, their lips only dimly lit: standable, but up where the candlelight doesn't reach), then
//     the top board of the big bookcase, right under the ceiling. In the stone wall at its end (the kitchen's side of the
//     library) a short stretch of FALSE SHELF: books built into a stone wall, dust blowing out between them, a warm glow
//     behind. THE TELL: the draft (dust motes streaming out of the wall, the cobwebs waving) and that glow. He walks
//     straight through it: the shelf swings in, and the passage goes on through the wall into the loft.
//   THE LOFT (benLoftArt.ts draws it): a forgotten reading loft in the roof over the kitchen, walled off with the books
//     nobody was allowed to read, turned into a gym-bro hideout. Hidden behind the roof's dark till he's in it.
//   THE MEETUP (a cutscene, SKIP >> for all of it; confucktious/meetup.ts's script): the FIRST meeting's long intro if
//     he's never met Ben, else the short LATER one; Ben's gross-up sweeping the cape across his face like a movie vampire,
//     the price tag flapping (gross.ts); it's up again for the BLAH as he sells it.
//   THE TRIAL (in play; invented): PUT IT ON, SNUFF MY THREE CANDLES. Ben lends him the cape for it (has('cape') while the
//     trial's on; taken back if he walks out on it, lent again when he's back; never saved lent). The three: the HIGH one
//     on top of the tall bookcase (only the cape's jump gets up there off the floor), the FAR one on the pillar's sconce
//     (only reached floating off the bookcase's top: hold jump coming down), the one in the candle wheel over the COFFIN
//     (only the cape's jump off the coffin). Any order; through the flame snuffs it. A jump off the bookcase that comes
//     down on the floor short of the far one: a miss (a dry line), a hint after two. Can't get stuck: the lend makes every
//     one reachable, and nothing up there hurts.
//   THE GIFT (a cutscene, skippable): it's his (setPiece, setBenGave, saved there and then); Ben's tease, Meathead
//     enamored. The YOU GOT card (PieceGotCard.tsx): 90 frames, every button let go once, then a fresh press.
//   THE PRACTICE: the cape isn't a weapon: the candles relight a few seconds after each's snuffed, so the room's a float
//     course to fool about on; Ben's line the first time he gets the far one after the gift.
//   THE CANNON (upgrades/returnCannon.ts, SPOOKY look): only once the trial's passed (Ben nudges him to it). It rests
//     pointing up, swings over to the right (the owner, 2026-11-02: "the canon in spooky land's ben fires to the right,
//     meathead flies to the right and stops in the bedroom, not out a door"), and fires him up and right out of the
//     loft's old flue in the roof; he comes crashing down through the library's ceiling at its far right end (the broken
//     boards stay broken), shoots on right through the doorway into the master bedroom and stops on its floor at the start
//     (past THE MASTER BEDROOM checkpoint's x, short of where the brides come out of the first wardrobe).
//   ONCE GOT: Ben's idle line, the candles, the cannon; the cape isn't given again (benGave: cheats don't skip it).
//
// What outlives a death: what he's got (the save) and the meetup having run this visit (state.stageMemo).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import type { Block } from '../../../m1/types';
import { NO_CONTROLS } from '../../../m1/game/platform/input';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { pickLine, silenceAll } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip } from '../../../m1/game/platform/skip';
import { isNude, isShat } from '../../../m1/game/player/gut';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_GRAVITY, PLAYER_TERMINAL_VELOCITY } from '../../../m1/constants';
import { setUi } from '../../store';
import { saveProgress } from '../../save';
import { has, setPiece, setBenMet, benGave, setBenGave } from '../../upgrades/state';
import type { EquipControl } from '../../upgrades/equipInfo';
import { makeCannon, updateCannon, cannonBusy, type Cannon } from '../../upgrades/returnCannon';
import {
  NUDGE, BYE_MEATHEAD, BYE_BEN, PIECE_LINES, MH_PASSAGE, benSays, warmBenGross, meetupScript, startScript, tickScript, skipScript,
  type BenPose, type BenTalk, type Script, type Beat, type ByPants, giftCoda,
} from '../../upgrades/confucktious';
import { meatheadSays, ledge, solid, spookyState } from '../section';
import { GY } from '../geometry';
import { LIB, ROOMS, BOOKCASES, BOOK_EVERY, type Castle } from './layout';
import { HW } from './doorways';

const L = PIECE_LINES.cape;

// ---------------------------------------------------------------------------------------------------------------
// Where (world)

/** The stone wall between the kitchen and the library: its faces. */
export const PART_L = LIB - HW, PART_R = LIB + HW;
/** The loft's floor (the passage's, the bookcase's top board's), the passage's ceiling (the library's). */
export const F = GY - 830, PASS_TOP = GY - 950;
/** The loft: its left wall, its right (the stone wall's kitchen face), how high. */
export const LOFT = { a: PART_L - 900, b: PART_L, h: 440 };
export const LA = LOFT.a;
/** The way up: [x, top, w], the third gallery's left end up (the two wall shelves, the bookcase's top board). */
export const PATH: [number, number, number][] = [[LIB + 500, GY - 625, 120], [LIB + 280, GY - 730, 120], [PART_R, F, 180]];
/** In the loft (from its left wall): the cannon, the flue in the roof its shot goes out by (up and to the right of it), the coffin bench (its top), the tall bookcase (its
 *  top), the pillar, the candle wheel, where Ben stands, his chaise, the rose window. */
export const CANNON_LX = 100, CHIMNEY = { a: 276, b: 400 };
/** The barrel's lean for the shot (off straight up, to the right): out through CHIMNEY. */
const AIM = 0.5;
export const COFFIN = { a: 170, b: 310, top: 50 };
export const SHELF = { a: 760, b: 860, top: 160 };
export const PILLAR_LX = 440, WHEEL_LX = 240;
export const BEN_LX = 590;
/** The three candles: where (loft x), the flame's height off the floor; which is which. */
export interface Candle { lx: number; h: number; kind: 'high' | 'far' | 'wheel'; lit: boolean; outAt: number }
const CANDLES0: Omit<Candle, 'lit' | 'outAt'>[] = [{ lx: 828, h: 190, kind: 'high' }, { lx: PILLAR_LX, h: 315, kind: 'far' }, { lx: WHEEL_LX, h: 280, kind: 'wheel' }];
/** A flame's box (half width, half height) to snuff it through. */
const FLAME_HW = 9, FLAME_HH = 12;
/** Snuffed, it's back this long after (once the trial's done: practice). */
const RELIGHT = 240;
/** Where the shot comes down through the library's ceiling (its far right end, short of the doorway into the bedroom;
 *  his feet just under it); where he comes down on the bedroom's floor; how fast he's falling out of the hole. */
export const HOLE = { x: ROOMS[4].a - 230, y: GY - 950 };
const LAND_X = ROOMS[4].a + 166, HOLE_VY = 3;
/** The hole's been made (this visit: it stays). */
export const HOLE_MEMO = 'm2:benSpookyHole';
/** The YOU GOT card's least time up before it can be closed (frames). */
const CARD_HOLD = 90;
/** The meetup's run this visit; his passage line said this visit (state.stageMemo). */
const MEMO = 'm2:benSpooky', PASS_MEMO = 'm2:benSpookyPass';

const midX = (state: GameState) => state.player.pos.x + state.player.width / 2;
const feetY = (state: GameState) => state.player.pos.y + state.player.height;
/** In the loft (on its floor, or in the air in it). */
export const inLoft = (state: GameState) => {
  const cx = midX(state), fy = feetY(state);
  return cx > LA - 10 && cx < LOFT.b && fy <= F + 6 && fy > F - LOFT.h - 40;
};
/** In the loft or the passage through the wall (the loft shows: its dark lifts). */
export const inSecret = (state: GameState) => {
  const cx = midX(state), fy = feetY(state);
  return cx > LA - 10 && cx < PART_R + 6 && fy <= F + 6 && fy > F - LOFT.h - 40;
};
/** Up the top left of the library, on the way (his gross-up's painted ahead from here). */
const nearWay = (state: GameState) => { const cx = midX(state), fy = feetY(state); return cx > LA - 40 && cx < LIB + 800 && fy < GY - 480 && fy > F - LOFT.h - 60; };
/** The camera's on the loft (its own dark). */
export const loftView = (state: GameState) => {
  const cx = state.camera.x + CANVAS_WIDTH / 2, cy = state.camera.y + CANVAS_HEIGHT / 2;
  return cx > LA - 200 && cx < LOFT.b + 60 && cy < F + 200 && cy > F - LOFT.h - 300;
};
const pantsOf = (state: GameState): keyof ByPants => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');
const byPants = (state: GameState, r: ByPants) => r[pantsOf(state)];

// ---------------------------------------------------------------------------------------------------------------
// State (keyed on state.stage: rebuilt with the stage on every death)

type Phase = 'out' | 'meet' | 'trial' | 'gift' | 'card' | 'done';
export interface Loft {
  phase: Phase;
  all: number; token: number;
  script: Script | null;
  ben: BenTalk & { pose: BenPose; facing: 1 | -1; poseT: number; piece: 'cape' | null; x: number };
  candles: Candle[];
  /** The trial: snuffed so far; misses; a jump off the bookcase's top in the air; the pass's beat started (frame). */
  snuffed: number; misses: number; offShelf: boolean; passAt: number;
  cardT: number; cardArmed: boolean;
  goodSaid: boolean; nudgeAt: number;
  /** How far the loft's dark has lifted (0 hidden, 1 shown). */
  reveal: number;
  /** When he burst down through the library's ceiling (the boards swinging). */
  hatchAt: number;
  /** The roof's flue shut (solid) over the loft: open only while he's shot out of it. */
  flueShut: boolean;
  /** Frames the shot's been held going up to get him clear out of the roof. */
  upHold: number;
  cannon: Cannon;
  was: Partial<Controls>;
  /** It set the HUD's prompts (so it clears them going out, and only then). */
  ui: boolean;
}
const stores = new WeakMap<object, Loft>();
export const loftOf = (state: GameState): Loft => {
  const key = (state.stage ?? state) as object;
  let h = stores.get(key);
  if (!h) stores.set(key, h = {
    phase: 'out', all: 0, token: 0, script: null,
    ben: { said: null, pose: 'flurry', facing: 1, poseT: 0, piece: 'cape', x: BEN_LX },
    candles: CANDLES0.map(c => ({ ...c, lit: true, outAt: 0 })),
    snuffed: 0, misses: 0, offShelf: false, passAt: -1,
    cardT: 0, cardArmed: false, goodSaid: false, nudgeAt: 0, reveal: 0, hatchAt: -999,
    cannon: aimCannon(),
    was: {}, ui: false, flueShut: true, upHold: 0,
  });
  return h;
};
/** Up and right out of the roof's flue; down through the library's ceiling at its right end, falling, on right through
 *  the doorway and down on the bedroom's floor (its lean and its arc set here, not by the stock straight-up shot). */
const aimCannon = (): Cannon => {
  const cn = makeCannon(LA + CANNON_LX, F, { x: HOLE.x, y: HOLE.y + 70 }, { x: LAND_X, y: GY - 700 });
  cn.want = AIM; cn.vy0 = HOLE_VY;
  let y = cn.exit.y, vy = HOLE_VY, t = 0;
  while (t < 600) { vy = Math.min(PLAYER_TERMINAL_VELOCITY, vy + PLAYER_GRAVITY); y += vy; t++; if (vy > 0 && y >= cn.dest.y) break; }
  cn.T = t;
  return cn;
};
/** The cannon's frame: the roof's flue opened just while he's shot out of it, the shot held on till he's clear of it. */
const runCannon = (ctx: FrameContext, h: Loft, controls: Controls): Controls => {
  const { state } = ctx;
  const out = updateCannon(ctx, h.cannon, controls, cannonHooks(h));
  const cn = h.cannon;
  if (cn.phase !== 'up') h.upHold = 0;
  else if (cn.t >= 16 && feetY(state) > F - LOFT.h - 70 && h.upHold++ < 30) cn.t = 16;
  const shut = cn.phase !== 'up';
  if (shut !== h.flueShut) {
    h.flueShut = shut;
    if (shut) flue(state); else state.blocks = state.blocks.filter(b => b.tag !== 'sp-loft-flue');
  }
  return out;
};
const flue = (state: GameState) => solid(state, LA + CHIMNEY.a, F - LOFT.h - 60, CHIMNEY.b - CHIMNEY.a, 60, { hidden: true, tag: 'sp-loft-flue' });
/** The cape lent for the trial (taken back if it's not finished). */
let lent = false;
const lend = () => { if (!has('cape')) { setPiece('cape', true); lent = true; } };
const unlend = () => { if (lent && !benGave('cape')) setPiece('cape', false); lent = false; };
let setNoContact = false;

// ---------------------------------------------------------------------------------------------------------------
// Building it

/** Cuts a box out of the castle's hidden walls with this tag (each one it touches split into what's left round it). */
const carve = (state: GameState, tag: string, x: number, y: number, w: number, h: number) => {
  const out: Block[] = [];
  state.blocks = state.blocks.filter(b => {
    if (b.tag !== tag || b.oneWay) return true;
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

export const buildLoft = (state: GameState) => {
  // (a lend left over from a go cut short: back on the rack)
  unlend();
  // The passage through the stone wall (its floor the wall's own top under it), the loft (its floor down to the kitchen's
  // ceiling, its walls, its ceiling but for the chimney over the cannon), the way up, the coffin's lid, the bookcase's top
  carve(state, 'castle-partition', PART_L, PASS_TOP, PART_R - PART_L, F - PASS_TOP);
  const top = F - LOFT.h;
  solid(state, LA, F, LOFT.b - LA, GY - 580 - F, { hidden: true, tag: 'sp-loft' });
  solid(state, LA - 60, top - 60, 60, F - top + 60, { hidden: true, tag: 'sp-loft' });
  solid(state, LA, top - 60, CHIMNEY.a, 60, { hidden: true, tag: 'sp-loft' });
  solid(state, LA + CHIMNEY.b, top - 60, LOFT.b - LA - CHIMNEY.b, 60, { hidden: true, tag: 'sp-loft' });
  flue(state);
  // (the stone wall's kitchen face up from the passage to the loft's ceiling: the loft's right wall)
  solid(state, PART_L - 20, top - 60, 20 + HW, PASS_TOP - top + 60, { hidden: true, tag: 'sp-loft' });
  for (const [x, y, w] of PATH) ledge(state, x, y, w, { hidden: true, tag: 'sp-loftway' });
  ledge(state, LA + COFFIN.a, F - COFFIN.top, COFFIN.b - COFFIN.a, { hidden: true, tag: 'sp-loft' });
  ledge(state, LA + SHELF.a, F - SHELF.top, SHELF.b - SHELF.a, { hidden: true, tag: 'sp-loft' });
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame (before the castle's own update)

export const updateLoft = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, p = state.player, h = loftOf(state);
  const secret = inSecret(state), loft = inLoft(state);
  h.reveal = Math.max(0, Math.min(1, h.reveal + (secret || cannonBusy(h.cannon) && h.cannon.phase !== 'fly' ? 0.07 : -0.05)));
  if (nearWay(state)) warmBenGross();
  calm(state, secret);
  // (through the false shelf the first time this visit: his line)
  if (!state.stageMemo[PASS_MEMO] && midX(state) < PART_R - 10 && midX(state) > PART_L - 30 && Math.abs(feetY(state) - F) < 8 && p.health > 0) {
    state.stageMemo[PASS_MEMO] = '1';
    playSound('crack', 0.35, -10);
    meatheadSays(state, pickLine(byPants(state, MH_PASSAGE)), true);
  }
  if (!loft) {
    // (out of the loft: bumping into things hurts again; a lend's taken back; his words gone)
    if (setNoContact) { p.noContactHurt = false; setNoContact = false; }
    if (h.phase === 'trial') unlend();
    if (h.ben.said && !secret) h.ben.said = null;
    if (h.ui) { h.ui = false; setUi({ gotPiece: null, gotPieceReady: false, chordTips: null }); }
    return runCannon(ctx, h, controls);
  }
  h.ui = true;
  h.ben.poseT++;
  // (a practice room: nothing up here hurts him)
  p.noContactHurt = true; setNoContact = true;
  const pressed = (k: keyof Controls) => !!controls[k] && !h.was[k];
  const anyPress = pressed('jump') || pressed('shoot') || pressed('special') || pressed('secondary') || pressed('charge');
  h.was = { ...controls };
  // In, on his feet past the passage: what's on
  if (h.phase === 'out' && p.isGrounded && p.health > 0 && midX(state) < LOFT.b - 70) {
    if (benGave('cape')) {
      h.phase = 'done'; h.ben.piece = null; h.nudgeAt = state.frame + 900;
      setPose(h, 'fold'); faceBen(state, h);
      benSays(h.ben, pickLine(byPants(state, L.idle)));
    } else if (state.stageMemo[MEMO]) startTrial(state, h);
    else startMeet(state, h);
  }
  let out = controls, tips: EquipControl[] | null = null;
  switch (h.phase) {
    case 'meet': out = runMeet(state, h); break;
    case 'trial': tips = runTrial(ctx, h); break;
    case 'gift': out = runGift(state, h); break;
    case 'card': {
      p.inCutscene = true; p.vel.x = 0;
      h.cardT++;
      // (a buffer before it'll close: CARD_HOLD frames, every button let go once, then a fresh press; PRESS ANY BUTTON
      // only once it's armed)
      const held = !!(controls.jump || controls.shoot || controls.special || controls.secondary || controls.charge);
      if (!h.cardArmed && h.cardT > CARD_HOLD && !held) h.cardArmed = true;
      setUi({ gotPiece: 'cape', gotPieceReady: h.cardArmed });
      if (h.cardArmed && anyPress) {
        h.phase = 'done'; p.inCutscene = false; setUi({ gotPiece: null, gotPieceReady: false });
        h.nudgeAt = state.frame + 2400;
        setPose(h, 'fold');
        const tok = h.token;
        setTimeout(() => { if (loftOf(state) === h && h.token === tok) benSays(h.ben, L.practice[0]); }, 500);
      }
      out = { ...NO_CONTROLS };
      break;
    }
    case 'done': runDone(state, h); break;
  }
  if (h.phase !== 'card') setUi({ gotPiece: null });
  setUi({ chordTips: tips });
  // The cannon: only once the trial's passed
  if (h.phase === 'done' || cannonBusy(h.cannon)) out = runCannon(ctx, h, out);
  return out;
};

/** Nothing in the loft (or the passage) gets at him: the library's poltergeist shelf by the wall holds its books, any
 *  book or shot that's come through the wall's gone, and anything that's wandered in is put back out in the library. */
const calm = (state: GameState, secret: boolean) => {
  const cs = spookyState<Castle | null>(state, 'castle', () => null);
  if (cs) {
    if (secret) { const i = BOOKCASES.findIndex(([x]) => x < LIB + 200); if (i >= 0) cs.shelfT[i] = Math.max(cs.shelfT[i], BOOK_EVERY); }
    if (cs.books.length) cs.books = cs.books.filter(b => b.x > PART_R);
  }
  const inBox = (x: number, y: number) => x > LA - 20 && x < PART_R && y < F + 10 && y > F - LOFT.h - 80;
  if (state.projectiles.length) state.projectiles = state.projectiles.filter(q => q.owner === 'player' || !inBox(q.pos.x, q.pos.y));
  for (const e of state.enemies) {
    if (e.health <= 0 || e.type === 'boss') continue;
    if (inBox(e.pos.x + e.width / 2, e.pos.y + e.height)) { e.pos.x = PART_R + 40; e.vel.x = 0; }
  }
};

const cannonHooks = (h: Loft) => ({
  onBoard: (st: GameState) => {
    silenceAll(); h.ben.said = null; setUi({ chordTips: null });
    meatheadSays(st, pickLine(BYE_MEATHEAD), true, () => { if (loftOf(st) === h) benSays(h.ben, pickLine(BYE_BEN)); });
  },
  onExit: (st: GameState, x: number) => {
    // (down through the library's ceiling: the boards burst, plaster and splinters raining after him)
    h.hatchAt = st.frame; st.stageMemo[HOLE_MEMO] = '1';
    for (let i = 0; i < 28; i++) st.particles.push({ pos: { x: x - 24 + Math.random() * 48, y: HOLE.y + Math.random() * 10 }, vel: { x: 1 + Math.random() * 5, y: 1 + Math.random() * 3 }, life: 40, color: i % 4 === 0 ? '#6A4826' : i % 3 ? '#A8A29E' : '#E7E5E4', size: 2 + Math.random() * 4 });
    playSound('crash', 0.8, -2); playSound('crumble', 0.5, 4); shakeScreen(st, 6, 4);
  },
});

const setPose = (h: Loft, pose: BenPose) => { if (h.ben.pose !== pose) { h.ben.pose = pose; h.ben.poseT = 0; } };
const freeze = (state: GameState) => { const p = state.player; p.inCutscene = true; p.vel.x = 0; state.projectiles = state.projectiles.filter(q => q.owner !== 'player'); };
const faceBen = (state: GameState, h: Loft) => {
  const p = state.player, bx = LA + h.ben.x;
  p.facing = bx > midX(state) ? 1 : -1;
  h.ben.facing = p.facing === 1 ? -1 : 1;
};

// ---- the meetup
const startMeet = (state: GameState, h: Loft) => {
  h.phase = 'meet'; h.all = 0; h.token++;
  state.stageMemo[MEMO] = '1';
  // (the gross-up back up for the BLAH as he sells it)
  const sell = L.sell[0];
  h.script = startScript(meetupScript(pantsOf(state), L).map((b): Beat => (b.who === 'ben' && b.text === sell ? { ...b, gross: true } : b)));
  freeze(state);
  setPose(h, 'flurry'); h.ben.facing = 1;
};
const runMeet = (state: GameState, h: Loft): Controls => {
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
const startTrial = (state: GameState, h: Loft) => {
  h.phase = 'trial'; h.snuffed = h.candles.filter(c => !c.lit).length; h.misses = 0; h.offShelf = false; h.passAt = -1;
  state.player.inCutscene = false;
  // (the cape off his back and onto Meathead's for it)
  h.ben.piece = null; setPose(h, 'fold');
  if (!has('cape')) {
    lend(); playSound('whoosh', 0.8, -2); playSound('powerup', 0.6, 2);
    const p = state.player;
    for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: midX(state) + (Math.random() - 0.5) * 40, y: p.pos.y + 14 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 3 }, life: 30, color: i % 2 ? '#DC2626' : '#1E1E30', size: 3 });
  }
};
const FLOAT_TIP: EquipControl[] = [{ pad: ['A'], kb: ['@jump'], label: 'HOLD IN THE AIR: FLOAT' }];
/** Through a flame: out (a puff of smoke, a hiss). */
const snuffAt = (state: GameState): Candle | null => {
  const p = state.player, h = loftOf(state);
  for (const c of h.candles) {
    if (!c.lit) continue;
    const fx = LA + c.lx, fy = F - c.h;
    if (p.pos.x < fx + FLAME_HW && p.pos.x + p.width > fx - FLAME_HW && p.pos.y < fy + FLAME_HH && p.pos.y + p.height > fy - FLAME_HH) {
      c.lit = false; c.outAt = state.frame;
      playSound('poof', 0.7, 4); playSound('suck', 0.3, 8);
      for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: fx + (Math.random() - 0.5) * 6, y: fy - 4 }, vel: { x: (Math.random() - 0.5) * 1.2, y: -0.6 - Math.random() * 1.4 }, life: 50, color: i % 2 ? '#9CA3AF' : '#D1D5DB', size: 3 + Math.random() * 3 });
      return c;
    }
  }
  return null;
};
const runTrial = (ctx: FrameContext, h: Loft): EquipControl[] | null => {
  const { state } = ctx, p = state.player, cx = midX(state), fy = feetY(state);
  // (back in after walking out on it: the cape's lent again)
  if (!has('cape')) lend();
  // Ben watching from the middle, turned to him
  h.ben.facing = cx < LA + h.ben.x ? -1 : 1;
  if (h.passAt >= 0) {
    const t = state.frame - h.passAt;
    if (t > 900 && h.phase === 'trial') startGift(state, h);
    return null;
  }
  // The candles
  const c = snuffAt(state);
  if (c) {
    h.snuffed++;
    if (c.kind === 'far') h.offShelf = false;
    silenceAll(); h.ben.said = null; h.token++;
    if (h.snuffed < 3) benSays(h.ben, L.more?.[h.snuffed - 1] ?? pickLine(L.miss));
    else {
      // (all three: the pass, Meathead's word, then the gift)
      h.passAt = state.frame; setPose(h, 'fold');
      const tok = h.token;
      benSays(h.ben, pickLine(L.pass), () => { if (h.token === tok) meatheadSays(state, pickLine(byPants(state, L.passed)), true, () => { if (h.token === tok && h.phase === 'trial') startGift(state, h); }); });
      return null;
    }
  }
  // A miss: off the bookcase's top, down on the floor short of the far one
  const onShelf = p.isGrounded && Math.abs(fy - (F - SHELF.top)) < 4 && cx > LA + SHELF.a - 10 && cx < LA + SHELF.b + 10;
  if (onShelf) h.offShelf = true;
  else if (h.offShelf && p.isGrounded) {
    h.offShelf = false;
    const far = h.candles.find(k => k.kind === 'far')!;
    if (far.lit && Math.abs(fy - F) < 4 && cx < LA + SHELF.a) {
      h.misses++;
      silenceAll(); h.ben.said = null;
      const tok = h.token;
      benSays(h.ben, pickLine(L.miss), h.misses === 2 ? () => { if (h.token === tok && h.phase === 'trial' && h.passAt < 0) benSays(h.ben, L.hint[0]); } : undefined);
    }
  }
  return p.health > 0 ? FLOAT_TIP : null;
};

// ---- the gift
const startGift = (state: GameState, h: Loft) => {
  h.phase = 'gift'; h.all = 0; h.token++;
  // (his for good, there and then: a skip, a death, a quit can't lose it)
  setPiece('cape', true); setBenGave('cape'); lent = false; saveProgress();
  freeze(state);
  setPose(h, 'give');
  const pants = pantsOf(state);
  const beats: Beat[] = [
    { who: 'ben', text: L.gift[0], pose: 'give' },
    { who: 'ben', text: L.tease[0], pose: 'fold' },
    { who: 'mh', text: pickLine(L.enamored[pants]) },
  ];
  // (the last piece of the eight: the full set, his last word)
  beats.push(...giftCoda(pants));
  h.script = startScript(beats);
};
const runGift = (state: GameState, h: Loft): Controls => {
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

// ---- after: the float course, the nudges
const runDone = (state: GameState, h: Loft) => {
  const p = state.player, cx = midX(state), bx = LA + h.ben.x;
  if (Math.abs(cx - bx) < 260 || h.ben.said) { setPose(h, 'fold'); h.ben.facing = cx < bx ? -1 : 1; }
  else { setPose(h, 'flurry'); h.ben.facing = cx < bx ? -1 : 1; }
  // (the candles: snuffed, back on a while after)
  for (const c of h.candles) if (!c.lit && state.frame - c.outAt > RELIGHT) { c.lit = true; playSound('ignite', 0.3, 8); }
  const c = snuffAt(state);
  if (c && c.kind === 'far' && !h.goodSaid && !h.ben.said) { h.goodSaid = true; benSays(h.ben, pickLine(L.good)); }
  // (now and then: the cannon)
  if (state.frame > h.nudgeAt && !p.inCutscene && !h.ben.said && !cannonBusy(h.cannon)) {
    h.nudgeAt = state.frame + 2700;
    benSays(h.ben, pickLine(byPants(state, NUDGE)));
  }
};

/** Where Ben's feet are (world). */
export const benAt = (state: GameState) => ({ x: LA + loftOf(state).ben.x, y: F });
