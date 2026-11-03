// WILDERNESS LAND'S HIDDEN ARMOR: THE SABATONS (the COWBELL CLODHOPPERS), in the Mother Lode's drowned old ASSAY OFFICE,
// through a little maze under the flooded shaft's bed. The owner's brief (2026-11-01): "in wilderness land, illuminate
// the dark underwater section. going up will bring the critical path forward but if you go down, there will be a
// minimaze you gotta pass until you get to the lair there. the cannon will shoot you to the start of the log ride";
// "a MINI-maze, NOT too difficult, and NO AIR POCKETS in it". An OUTSIDE-THE-BOX EXPLORATION find.
//
//   THE WAY IN: the long swim under the rock comes out under open water at its east end (the way up the far shaft:
//     the critical path, as it was). Right under that, in the bed, the old WINZE (a shaft sunk down from inside the
//     mine): its timber collar, a warm light up out of it, a plank nailed on (ASSAY OFFICE, an arrow down).
//   THE MAZE (no air pockets, the owner's): four cells across, three down, under the bed (a cell every 250 px across
//     and 380 down, each 100 open, long tunnels between: the owner's "make the tunnels a lot longer, but the layout can
//     stay the same"). In at the top right, out at the bottom left into the office's pool. The way through is six
//     cells; three dead ends (Ben's spray paint: NOPE), one cell each. About 2.2 times the swim it was (the first build
//     timed 435 frames straight through, 822 with all three wrong turns); his air goes at half its rate down here
//     (air.ts), so it costs about what the short maze did: straight through about a third of his air, all three wrong
//     turns about three quarters. The surface is right over the winze: he can top up before he goes down. Each cell and
//     each tunnel has a dim work light (it reads; the right way isn't marked). Swimming the flooded shaft, the rock over
//     it all is faded away (the owner's "make sure all the underground elements are shown when in the swimming
//     section"): the maze and the office are in view from the water.
//   THE LAIR: up out of the maze into the pool at the office's east end; climb out (a step under the water's edge).
//     The office (1880s, the park dug it out for the tour, then the shaft flooded and the tour was dropped): a gym-bro
//     hideout (benLairArt.ts): an ore cart on a stub of track for a plate rack (cart wheels for plates), a
//     pickaxe-handle barbell, an anvil, the assay counter and its scales, a cot with a wool blanket, a lantern on a hook,
//     the dud dynamite stacked against the west wall (the target), drips off the ceiling. SAFE: nothing in it hurts
//     him (noContactHurt), nobody else's shots get in.
//   THE MEETUP (a cutscene, SKIP >> for all of it; confucktious/meetup.ts): the first meeting's long intro or a later
//     one's short one; his gross-up dangling the COWBELL CLODHOPPERS, the cowbell clanking, the stomp at the lens;
//     then, before the trial line (the owner's "get the sequencing right"), THE HIDDEN ART OF FOLLOW-UPS if it's his
//     first follow-up piece (the big beat, the buttons up while it's said), else Ben's brief mention (artBeats).
//   THE TRIAL (in play; invented): THE SCARECROW. Ben lends the boots (taken back if he leaves on it; never saved
//     lent) and stands his scarecrow out (a straw cowboy on a post in a nail keg, his hat full of nails: spiky, which
//     the boots don't care about; harmless, grabbable): dive kick it, keep holding, tap grab: the MISSILE, west into
//     the dud dynamite (not so dud: it blows, harmless, the room rumbles, a fresh stack's set down: the owner's). A dive
//     kick that lands with no missile after it's a miss (a dry line; a hint after two); a missile the other way, or
//     short, Ben says so (CROW_WRONG / CROW_SHORT: a miss too) and it's stood back up; one knocked over some other way
//     is stood back up. Can't get stuck: it keeps coming, nothing hurts, the buttons are up
//     on screen near it.
//   THE GIFT (a cutscene, skippable): his (setPiece, setBenGave, saved there and then); the tease, Meathead enamored;
//     Meathead's cartoon Japanese if the art wasn't the big beat. Then the YOU GOT card (90 frames, every button let
//     go, a fresh press).
//   THE PRACTICE: the scarecrow, one at a time, stood back up a moment after each goes; Ben's word the first time it's
//     thrown after the gift. Ben nudges him to the cannon.
//   THE CANNON (upgrades/returnCannon.ts, Wilderness's look): only once the trial's passed; by the pool, straight up an
//     old ore chute; he comes up through the log ride station's service hatch on its platform (the start of the log
//     ride: TIMBER TUMBLE's checkpoint, nothing about), and lands on his feet.
//   ONCE GOT: Ben's idle line, the scarecrow, the cannon; the boots aren't given twice (benGave: cheats don't skip it).
//
// What outlives a death: what he's got (the save) and the meetup having run this visit (state.stageMemo).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import type { Block, Enemy, EnemyKind } from '../../../m1/types';
import type { WaterBody } from '../../../m1/game/stages/index';
import { NO_CONTROLS } from '../../../m1/game/platform/input';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { pickLine, silenceAll } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip } from '../../../m1/game/platform/skip';
import { makeKindEnemy, mid } from '../../../m1/game/enemies/kinds';
import { isNude, isShat } from '../../../m1/game/player/gut';
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
  NUDGE, PIECE_LINES, artBeats, artTipRange, MH_CANNON_ASK, BEN_CANNON_FR, MH_MAZE, MH_LANDED_FR, BOOT_WEEB, BOOT_HUH, CROW_WRONG, CROW_SHORT,
  benSays, warmBenGross, meetupScript, startScript, tickScript, skipScript,
  type BenPose, type BenTalk, type Script, type Beat, type ByPants, giftCoda,
} from '../../upgrades/confucktious';
import { meatheadSays, ledge } from '../section';
import { SECTIONS, GY } from '../geometry';
import { FY, X, Y } from './layout';
import { drawCrow, CROW_H } from './benLairCrow';

const L = PIECE_LINES.sabatons;

// ---------------------------------------------------------------------------------------------------------------
// Where (x from the section's start, heights: Y(h); world via X() / Y())

/** The maze: its cells' grid (its left edge, its top), a cell's pitch across and down, and its opening (inset INSET
 *  each side). The owner's (2026-11-02): "make the tunnels a lot longer, but the layout can stay the same": the same
 *  cells and joins, the pitch up from 140 to 250 across and 380 down (the way through about 2.2 times as long; the
 *  winze where it was, under the open water; the office moved west and down with the outlet: OFFICE_DX/DY). */
export const MAZE = { a: 13530, top: -900, cols: 4, rows: 3 } as const;
export const CELL_X = 250, CELL_Y = 380, OPEN = 100, INSET = 20;
/** How far the office (and its pool, chute, cannon, Ben, the scarecrow, the dynamite) sits from where it was first
 *  built (x, height): its art's own x's are drawn shifted by it (benLairArt.ts). */
export const OFFICE_DX = -330, OFFICE_DY = -480;
/** Its open cells, [col, row] (col 0 the west end, row 0 the top); everything else in the grid is rock. */
export const CELLS: [number, number][] = [
  // (the way through: in at the top right, down, west, down, west, west, out)
  [3, 0], [3, 1], [2, 1], [2, 2], [1, 2], [0, 2],
  // (the dead ends)
  [2, 0], [3, 2], [1, 1],
];
/** Which open cells join: [col, row, col2, row2]. */
export const JOINS: [number, number, number, number][] = [
  [3, 0, 3, 1], [3, 1, 2, 1], [2, 1, 2, 2], [2, 2, 1, 2], [1, 2, 0, 2],
  [3, 0, 2, 0], [3, 1, 3, 2], [2, 1, 1, 1],
];
/** The dead ends' last cells (Ben's NOPE on the rock). */
export const NOPES: [number, number][] = [[2, 0], [3, 2], [1, 1]];
/** A cell's opening (rx, heights: top over bottom). */
export const cellBox = (c: number, r: number) => ({ a: MAZE.a + CELL_X * c + INSET, b: MAZE.a + CELL_X * c + INSET + OPEN, top: MAZE.top - CELL_Y * r - INSET, bot: MAZE.top - CELL_Y * r - INSET - OPEN });
/** The opening between two joined cells. */
export const joinBox = ([c1, r1, c2, r2]: [number, number, number, number]) => {
  const A = cellBox(c1, r1), B = cellBox(c2, r2);
  return { a: Math.min(A.a, B.a), b: Math.max(A.b, B.b), top: Math.max(A.top, B.top), bot: Math.min(A.bot, B.bot) };
};
/** The winze down through the bed into the top right cell (under the open water at the long swim's east end). */
export const WINZE = { a: 14300, b: 14400, top: -880, bot: -920 } as const;
/** The way out of the bottom left cell west into the office's pool. */
export const OUTLET = { a: 13840 + OFFICE_DX, b: 13880 + OFFICE_DX, top: -1200 + OFFICE_DY, bot: -1300 + OFFICE_DY } as const;
/** The office: its walls, ceiling, floor; the pool in its floor at its east end (down to the outlet's foot), the
 *  water's surface in it; the ore chute up over the cannon (blind at its top: he's gone by then). */
export const ROOM = { a: 13040 + OFFICE_DX, b: 13840 + OFFICE_DX, top: -940 + OFFICE_DY, floor: -1200 + OFFICE_DY } as const;
export const POOL = { a: 13720 + OFFICE_DX, b: 13840 + OFFICE_DX, surface: -1216 + OFFICE_DY, bot: -1300 + OFFICE_DY } as const;
export const CHUTE = { a: 13630 + OFFICE_DX, b: 13690 + OFFICE_DX, top: -900 + OFFICE_DY } as const;
/** The cannon (by the pool), Ben (between it and the cot), the scarecrow's post, the dynamite against the west wall. */
export const CANNON_RX = 13660 + OFFICE_DX, BEN_RX = 13550 + OFFICE_DX, CROW_RX = 13372 + OFFICE_DX, TNT = { a: 13044 + OFFICE_DX, b: 13130 + OFFICE_DX } as const;
/** The bottom of everything down here (height: under the pool's foot). */
export const UNDER_BOT = POOL.bot - 180;
/** Where the cannon puts him: up through the service hatch on the log ride station's platform (TIMBER TUMBLE, cp 30, at
 *  its x 200: past it, so it's his), and down on it again. */
const LR = SECTIONS.logride.x0;
export const HATCH_X = LR + 260;

const W = (rx: number) => X(rx);
/** The world boxes of everything open down there (the cells, their joins, the winze, the outlet). */
export const MAZE_OPEN = (): { x: number; y: number; w: number; h: number }[] => {
  const out = [...CELLS.map(([c, r]) => cellBox(c, r)), ...JOINS.map(joinBox), WINZE, OUTLET];
  return out.map(o => ({ x: W(o.a), y: Y(o.top), w: o.b - o.a, h: o.top - o.bot }));
};

/** The YOU GOT card's least time up before it can be closed (frames). */
const CARD_HOLD = 90;
/** The meetup's run this visit; his line down the winze said this visit (state.stageMemo). */
const MEMO = 'm2:benFrontier', IN_MEMO = 'm2:benFrontierIn';
/** The scarecrow stood back up this long after it goes (frames): in the trial, after. */
const RESPAWN_TRIAL = 70, RESPAWN = 110;
/** A dive kick that hit it with no missile after it inside this (frames): a miss. */
const MISS_AFTER = 70;

const midX = (state: GameState) => state.player.pos.x + state.player.width / 2;
const feetY = (state: GameState) => state.player.pos.y + state.player.height;
/** In the office (on its floor, or up in it; not down in the pool). */
export const inLair = (state: GameState) => {
  const cx = midX(state), fy = feetY(state);
  return cx > W(ROOM.a) - 10 && cx < W(ROOM.b) + 10 && fy > Y(ROOM.top) + 30 && fy <= Y(ROOM.floor) + 6;
};
/** Down under the flooded shaft's bed: the maze, the pool, the office (its lighting, its camera). */
export const underBed = (state: GameState) => {
  const cx = midX(state), cy = state.player.pos.y + state.player.height / 2;
  return cx > W(ROOM.a) - 40 && cx < W(14440) && cy > Y(-880) + 8 && cy < Y(UNDER_BOT);
};
/** In the maze (or its winze, or the pool under the office's floor). */
export const inMaze = (state: GameState) => underBed(state) && !inLair(state);
/** In the flooded shaft's water (the long swim): its lights. */
export const inSump = (state: GameState) => { const cx = midX(state), fy = feetY(state); return cx > X(12980) && cx < X(14440) && fy > FY + 10 && fy < Y(-880) + 10; };
const pantsOf = (state: GameState): keyof ByPants => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');
const byPants = <T>(state: GameState, r: { clean: T; shitty: T; nude: T }) => r[pantsOf(state)];

// ---------------------------------------------------------------------------------------------------------------
// The water down there: the maze (under the flooded shaft: its surface is the shaft's, far up: no air anywhere in it,
// the owner's), and the pool in the office's floor (its own surface: air over it)

const SUMP_SURFACE = FY + 16;
export const benWaterAt = (x: number, y: number): WaterBody | null => {
  if (x > W(POOL.a) && x < W(POOL.b) && y > Y(POOL.surface) - 14 && y < Y(POOL.bot) + 10) return { key: 'benpool', x1: W(POOL.a), x2: W(POOL.b), surface: Y(POOL.surface), bottom: Y(POOL.bot), kind: 'clean' };
  if (x > W(OUTLET.a) && x < W(WINZE.b + 20) && y > Y(-880) && y < Y(POOL.bot) + 10) return { key: 'benmaze', x1: W(OUTLET.a), x2: W(14420), surface: SUMP_SURFACE, bottom: Y(POOL.bot), kind: 'clean' };
  return null;
};

// ---------------------------------------------------------------------------------------------------------------
// The scarecrow: a straw cowboy on a post in a nail keg, nails up through his hat (spiky: the boots don't care; and it
// does nothing even without them: no damage), harmless (no contact damage, never attacks), grabbable (the missile works
// on it; a person, as the follow-ups see it)

registerM2Kind({
  kind: 'm2:fr_crow', stats: { w: 36, h: CROW_H, hp: 400, contact: 0, mass: 120 },
  humanoid: true, grab: 'body', pathing: false, gender: 'm', blood: '#C8A456',
  head: { x: 0, y: -CROW_H + 18, r: 13 },
  spiky: { source: 'm2:fr_hotwax', label: 'NAILS!', damage: 0 },
  ai: (ctx, e) => {
    const dx = mid(ctx.state.player).x - mid(e).x;
    e.aiState = 'near';
    e.facing = dx < 0 ? -1 : 1;
    if (Math.abs(e.vel.y) < 0.2) e.vel.x *= 0.8;
    // (kept in the room, out of the pool)
    const lo = W(ROOM.a) + 30, hi = W(POOL.a) - 10;
    if (e.pos.x < lo) { e.pos.x = lo; e.vel.x = 0; } else if (e.pos.x + e.width > hi) { e.pos.x = hi - e.width; e.vel.x = 0; }
    return true;
  },
  draw: (c, e, f) => drawCrow(c, e, f),
});

// ---------------------------------------------------------------------------------------------------------------
// State (keyed on state.stage: rebuilt with the stage on every death)

type Phase = 'out' | 'meet' | 'trial' | 'gift' | 'card' | 'done';
export interface Lair {
  phase: Phase;
  all: number; token: number;
  script: Script | null;
  ben: BenTalk & { pose: BenPose; facing: 1 | -1; poseT: number; piece: 'sabatons' | null };
  /** The scarecrow (null: gone, stood back up at `respawn`). */
  crow: Enemy | null; respawn: number;
  /** The trial: the last dive kick (frame), it in his hands off one (the missile), the last hit seen, a dive kick that
   *  hit it waiting on a missile (frame, 0 none), misses, the next miss line's frame, the pass's beat (frame, -1). */
  kickAt: number; throwing: boolean; hitSeen: MeleeHit | null; kickHit: number; misses: number; missAt: number; passAt: number;
  /** The gift: its how-to beats' indexes (the buttons up while they're said), the big beat or not. */
  howA: number; howB: number; artFull: boolean;
  cardT: number; cardArmed: boolean;
  goodSaid: boolean; tipsTill: boolean; nudgeAt: number;
  /** The scarecrow last into the dynamite (frame: the boom; the stack's gone a moment, then a fresh one's set down). */
  tntAt: number;
  /** The scarecrow let fly off a dive kick, watched till it's into the dynamite or plainly isn't going to be: it, when
   *  (frame), which way (+1 east: away from the dynamite). */
  fly: { e: Enemy; at: number; dir: number } | null;
  cannon: Cannon;
  /** It's shot him out to the log ride (its flight's the log ride's to finish: put back to rest when he's next here). */
  flew: boolean;
  was: Partial<Controls>;
  /** It set the HUD's prompts (so it clears them going out, and only then). */
  ui: boolean;
  /** How far the rock over the maze and the office has faded away (0: solid rock from up in the flooded shaft, 1:
   *  gone: he's down the winze). */
  reveal: number;
}
const stores = new WeakMap<object, Lair>();
export const lairOf = (state: GameState): Lair => {
  const key = (state.stage ?? state) as object;
  let h = stores.get(key);
  if (!h) {
    // (straight up the chute; up through the station's hatch and down on the platform beside it: a short hop, not the
    // usual arc, under the station's roof)
    const cn = makeCannon(W(CANNON_RX), Y(ROOM.floor), { x: HATCH_X, y: GY }, { x: HATCH_X, y: GY });
    cn.want = 0; cn.vy0 = -12; cn.T = 40;
    stores.set(key, h = {
      phase: 'out', all: 0, token: 0, script: null,
      ben: { said: null, pose: 'stand', facing: 1, poseT: 0, piece: 'sabatons' },
      crow: null, respawn: 0,
      kickAt: -999, throwing: false, hitSeen: null, kickHit: 0, misses: 0, missAt: 0, passAt: -1,
      howA: -1, howB: -1, artFull: false,
      cardT: 0, cardArmed: false, goodSaid: false, tipsTill: false, nudgeAt: 0, tntAt: -999, fly: null,
      cannon: cn, flew: false,
      was: {}, ui: false, reveal: 0,
    });
  }
  return h;
};
/** The boots lent for the trial (taken back if it's not finished). */
let lent = false;
const lend = () => { if (!has('sabatons')) { setPiece('sabatons', true); lent = true; } };
const unlend = () => { if (lent && !benGave('sabatons')) setPiece('sabatons', false); lent = false; };
let setNoContact = false;

// ---------------------------------------------------------------------------------------------------------------
// Building it: the winze, the maze, the outlet, the pool, the office and its chute, cut out of the ground under the bed

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
const carveBox = (state: GameState, o: { a: number; b: number; top: number; bot: number }) => carve(state, W(o.a), Y(o.top), o.b - o.a, o.top - o.bot);

export const buildBenLair = (state: GameState) => {
  // (a lend left over from a go cut short: back in the tack room)
  unlend();
  for (const o of MAZE_OPEN()) carve(state, o.x, o.y, o.w, o.h);
  carveBox(state, { a: ROOM.a, b: ROOM.b, top: ROOM.top, bot: ROOM.floor });
  carveBox(state, { a: POOL.a, b: POOL.b, top: ROOM.floor + 2, bot: POOL.bot });
  carveBox(state, { a: CHUTE.a, b: CHUTE.b, top: CHUTE.top, bot: ROOM.top - 2 });
  // (the step out under the pool's west lip, lit (benLairArt.ts): stand on it, jump out)
  ledge(state, W(POOL.a), Y(POOL.surface) + 26, 46, { hidden: true });
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame (the town's update, first)

export const updateBenLair = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, p = state.player, h = lairOf(state);
  // (back after the cannon took him to the log ride: its flight was the log ride's to finish)
  if (h.flew && h.cannon.phase === 'fly') { h.cannon.phase = 'rest'; h.cannon.t = 0; h.cannon.ang = 0; h.flew = false; }
  if (underBed(state) || (inSump(state) && midX(state) > X(13900))) warmBenGross();
  // (the rock over it all faded away while he's swimming the flooded shaft or down under its bed (the owner's: "make
  // sure all the underground elements are shown when in the swimming section"): the maze, its lamps, the office, Ben
  // all in view from the water; solid again once he's out of it)
  h.reveal = Math.max(0, Math.min(1, h.reveal + (underBed(state) || inSump(state) || (cannonBusy(h.cannon) && h.cannon.phase !== 'fly') ? 0.08 : -0.06)));
  calm(state);
  // (down the winze the first time this visit: his line)
  if (!state.stageMemo[IN_MEMO] && inMaze(state) && p.health > 0 && feetY(state) > Y(WINZE.bot) + 30) {
    state.stageMemo[IN_MEMO] = '1';
    meatheadSays(state, pickLine(byPants(state, MH_MAZE)), true);
  }
  const room = inLair(state);
  if (!room) {
    // (out of the room: bumping into things hurts again; a lend's taken back; the scarecrow left down there; his words gone)
    if (setNoContact) { p.noContactHurt = false; setNoContact = false; }
    if (h.phase === 'trial') unlend();
    if (!underBed(state)) clearCrow(state, h);
    if (h.ben.said && !underBed(state) && !cannonBusy(h.cannon)) h.ben.said = null;
    if (h.ui) { h.ui = false; setUi({ gotPiece: null, gotPieceReady: false, chordTips: null }); }
    return runCannon(ctx, h, controls);
  }
  h.ui = true;
  h.ben.poseT++;
  // (a practice room: nothing down here hurts him)
  p.noContactHurt = true; setNoContact = true;
  const pressed = (k: keyof Controls) => !!controls[k] && !h.was[k];
  const anyPress = pressed('jump') || pressed('shoot') || pressed('special') || pressed('secondary') || pressed('charge');
  h.was = { ...controls };
  // In, on his feet on the office's floor: what's on
  if (h.phase === 'out' && p.isGrounded && p.health > 0 && !p.swimming) {
    if (benGave('sabatons')) {
      h.phase = 'done'; h.ben.piece = null; h.respawn = state.frame + 40; h.nudgeAt = state.frame + 900;
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
      setUi({ gotPiece: 'sabatons', gotPieceReady: h.cardArmed });
      if (h.cardArmed && anyPress) {
        h.phase = 'done'; p.inCutscene = false; setUi({ gotPiece: null, gotPieceReady: false });
        h.nudgeAt = state.frame + 2400; h.tipsTill = true;
        if (!h.crow) h.respawn = state.frame + 30;
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
  tickTnt(state, h);
  // The cannon: only once the trial's passed (no getting in, no prompt, before)
  if (h.phase === 'done' || cannonBusy(h.cannon)) out = runCannon(ctx, h, out);
  return out;
};

/** The cannon's frame; up the chute he's out of sight (it's blind at the top: he's gone before he'd reach it). */
const runCannon = (ctx: FrameContext, h: Lair, controls: Controls): Controls => {
  const out = updateCannon(ctx, h.cannon, controls, cannonHooks(h));
  const p = ctx.state.player;
  if (h.cannon.phase === 'up' && p.pos.y < Y(ROOM.top) + 4) p.hidden = true;
  return out;
};

/** Nothing gets at him down there: shots under the bed that aren't his are gone. */
const calm = (state: GameState) => {
  if (!state.projectiles.length) return;
  state.projectiles = state.projectiles.filter(q => q.owner === 'player' || !(q.pos.x > W(ROOM.a) - 40 && q.pos.x < W(14440) && q.pos.y > Y(-880) + 8 && q.pos.y < Y(UNDER_BOT)));
};

/** How long the dynamite's gone after it blows (frames), before a fresh stack's set down. */
export const TNT_GONE = 75;
/** The dynamite's there to hit (not blown and not yet replaced). */
const tntUp = (state: GameState, h: Lair) => state.frame - h.tntAt >= TNT_GONE;
/** A straw puff where the scarecrow was (it's gone: blown up, or taken off to be stood back up). */
const strawPuff = (state: GameState, e: Enemy) => {
  for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: mid(e).x + (Math.random() - 0.5) * 30, y: e.pos.y + Math.random() * e.height }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 3 }, life: 30, color: i % 3 ? '#C8A456' : '#6A5236', size: 3, grav: 0.15 });
};
/** The scarecrow off the floor (blown up, or not where it should be): stood back up on its post `wait` frames on. */
const dropCrow = (state: GameState, h: Lair, e: Enemy, wait: number) => {
  if (grabHolding() === e) return;
  strawPuff(state, e);
  state.enemies = state.enemies.filter(o => o !== e);
  if (h.crow === e || !h.crow) { h.crow = null; h.respawn = state.frame + wait; }
};
/**
 * The scarecrow into the dynamite: it goes up (the owner's: "when it hits the dynamite, it explodes. doesn't affect
 * anything, rumbles, some debris, new dynamite shows up"): the boom, a flash there, the room shaking, sticks and
 * splinters and straw everywhere; nothing hurt, nothing broken; the stack gone a moment, then a fresh one set down.
 */
const boomTnt = (state: GameState, h: Lair, e: Enemy, wait: number) => {
  h.tntAt = state.frame;
  const x = (W(TNT.a) + W(TNT.b)) / 2, y = Y(ROOM.floor) - 50;
  playSound('boom', 1, -6); playSound('crash', 0.8, -4); shakeScreen(state, 14, 8);
  const P = state.particles;
  for (let i = 0; i < 26; i++) { const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.6, sp = 2 + Math.random() * 7; P.push({ pos: { x, y }, vel: { x: Math.cos(a) * sp + 1.5, y: Math.sin(a) * sp }, life: 12 + Math.random() * 14, color: i % 3 ? '#FDBA74' : '#FEF08A', size: 5 + Math.random() * 7 }); }
  for (let i = 0; i < 22; i++) P.push({ pos: { x: x + (Math.random() - 0.5) * 60, y: y + (Math.random() - 0.5) * 60 }, vel: { x: 1 + Math.random() * 6, y: -2 - Math.random() * 6 }, life: 50 + Math.random() * 30, color: ['#C2302A', '#8A1C18', '#8A6A44', '#5A4028', '#E2C46A'][i % 5], size: 2 + Math.random() * 4, grav: 0.3 });
  for (let i = 0; i < 12; i++) P.push({ pos: { x: x + (Math.random() - 0.5) * 70, y: y - Math.random() * 40 }, vel: { x: 0.5 + Math.random() * 1.5, y: -0.6 - Math.random() * 1.2 }, life: 60 + Math.random() * 30, color: 'rgba(120, 110, 100, 0.55)', size: 8 + Math.random() * 8 });
  // (dust shaken down off the ceiling all along the room)
  for (let i = 0; i < 16; i++) P.push({ pos: { x: W(ROOM.a) + Math.random() * (ROOM.b - ROOM.a), y: Y(ROOM.top) + 18 }, vel: { x: 0, y: 1 + Math.random() }, life: 40, color: '#8A7A62', size: 2, grav: 0.2 });
  dropCrow(state, h, e, wait);
};
/** Each frame in the room: a fresh stack set down once the last one's blown; anything flung into it fast blows it. */
const tickTnt = (state: GameState, h: Lair) => {
  if (state.frame - h.tntAt === TNT_GONE) {
    playSound('thud', 0.7, -8); playSound('clink', 0.5, -2);
    for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: W(TNT.a) + Math.random() * (TNT.b - TNT.a), y: Y(ROOM.floor) - 4 }, vel: { x: (Math.random() - 0.5) * 3, y: -0.5 - Math.random() * 1.5 }, life: 26, color: i % 2 ? '#A8A29E' : '#8A6A44', size: 3 });
  }
  // (knocked into it hard some other way than the missile: it goes up all the same)
  const e = h.crow;
  if (e && !h.fly && e.isBlownAway && tntUp(state, h) && e.pos.x < W(TNT.b) + 14 && Math.abs(e.vel.x) > 3) boomTnt(state, h, e, h.phase === 'trial' ? RESPAWN_TRIAL : RESPAWN);
};
/** The flying scarecrow: into the dynamite ('hit': it's blown), or done flying without getting there ('wrong': thrown
 *  the other way; 'short': the right way, not far enough); null while it's still going. */
const watchFly = (state: GameState, h: Lair, wait: number): 'hit' | 'wrong' | 'short' | null => {
  const fl = h.fly;
  if (!fl) return null;
  const e = fl.e, t = state.frame - fl.at, gone = !state.enemies.includes(e);
  if (!gone && tntUp(state, h) && e.pos.x < W(TNT.b) + 14 && e.pos.y + e.height > Y(ROOM.floor) - 150) { h.fly = null; boomTnt(state, h, e, wait); return 'hit'; }
  if (gone || grabHolding() === e || t > 110 || (t > 14 && Math.abs(e.vel.x) < 0.6)) {
    h.fly = null;
    if (!gone) dropCrow(state, h, e, wait);
    return fl.dir > 0 ? 'wrong' : 'short';
  }
  return null;
};
/** Ben on a throw that didn't go in the dynamite (the owner's: "if i throw the scarecrow not at the dynamite, he
 *  should acknowledge it"). In the trial it counts as a miss (the hint after two). */
const missThrow = (state: GameState, h: Lair, res: 'wrong' | 'short') => {
  if (state.frame < h.missAt) return;
  h.missAt = state.frame + 150;
  silenceAll(); h.ben.said = null;
  const tok = h.token, trial = h.phase === 'trial';
  if (trial) h.misses++;
  benSays(h.ben, pickLine(byPants(state, res === 'wrong' ? CROW_WRONG : CROW_SHORT)), trial && h.misses === 2 ? () => { if (h.token === tok && h.phase === 'trial' && h.passAt < 0) benSays(h.ben, L.hint[0]); } : undefined);
};

/** The scarecrow: one at a time, stood back up a while after each goes. */
const keepCrow = (state: GameState, h: Lair, wait: number) => {
  const e = h.crow;
  // (knocked into the pool: fished out and stood back up)
  if (e && grabHolding() !== e && mid(e).x > W(POOL.a) - 4 && e.pos.y + e.height > Y(ROOM.floor) + 8) {
    playSound('splash', 0.7, -4);
    state.enemies = state.enemies.filter(o => o !== e); h.crow = null; h.respawn = state.frame + wait; return;
  }
  if (e && (e.health <= 0 || e.isBlownAway || !inPlay(state, e))) {
    // (thrown, held or knocked over: left lying a moment, then the next one)
    if (grabHolding() !== e) { h.crow = null; h.respawn = state.frame + wait; }
    return;
  }
  if (e || state.frame < h.respawn || cannonBusy(h.cannon)) return;
  // (not stood up right on top of him)
  if (Math.abs(W(CROW_RX) - midX(state)) < 60) { h.respawn = state.frame + 30; return; }
  // (the last one's body gone first: one at a time)
  state.enemies = state.enemies.filter(o => o.kind !== 'm2:fr_crow');
  const k = makeKindEnemy('m2:fr_crow' as EnemyKind, W(CROW_RX), Y(ROOM.floor));
  k.homeX = k.pos.x; k.homeY = k.pos.y; k.variant = 0; k.facing = 1; k.seen = true;
  state.enemies.push(k); h.crow = k;
  playSound('thud', 0.6, -8); playSound('clink', 0.4, -2);
  for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: W(CROW_RX) + (Math.random() - 0.5) * 40, y: Y(ROOM.floor) - 4 }, vel: { x: (Math.random() - 0.5) * 3, y: -0.5 - Math.random() * 1.5 }, life: 26, color: i % 2 ? '#C8A456' : '#6A5236', size: 3 });
};
const clearCrow = (state: GameState, h: Lair) => {
  if (h.crow && grabHolding() !== h.crow) { const e = h.crow; state.enemies = state.enemies.filter(o => o !== e); h.crow = null; }
  if (state.enemies.some(o => o.kind === 'm2:fr_crow' && o !== h.crow)) state.enemies = state.enemies.filter(o => o.kind !== 'm2:fr_crow' || o === h.crow);
};

const cannonHooks = (h: Lair) => ({
  onBoard: (st: GameState) => {
    clearCrow(st, h);
    silenceAll(); h.ben.said = null; setUi({ chordTips: null });
    meatheadSays(st, pickLine(MH_CANNON_ASK), true, () => { if (lairOf(st) === h) benSays(h.ben, pickLine(BEN_CANNON_FR)); });
  },
  onExit: (st: GameState, x: number, y: number) => {
    // (up through the service hatch in the station's platform: it bangs up, splinters and dust with him; his word once
    // he's down: the log ride's frame from here, so it's said now, queued)
    h.flew = true; st.player.hidden = false;
    for (let i = 0; i < 22; i++) st.particles.push({ pos: { x: x - 18 + Math.random() * 36, y: y - 4 - Math.random() * 10 }, vel: { x: (Math.random() - 0.5) * 4, y: -1.5 - Math.random() * 4 }, life: 40, color: i % 3 ? '#A07A4A' : 'rgba(214, 200, 170, 0.8)', size: 3 + Math.random() * 4 });
    playSound('crash', 0.7, -2); shakeScreen(st, 5, 4);
    const tok = h.token;
    setTimeout(() => { if (lairOf(st) === h && h.token === tok && st.player.health > 0) meatheadSays(st, pickLine(byPants(st, MH_LANDED_FR)), true); }, 900);
  },
});

const setPose = (h: Lair, pose: BenPose) => { if (h.ben.pose !== pose) { h.ben.pose = pose; h.ben.poseT = 0; } };
const freeze = (state: GameState) => { const p = state.player; p.inCutscene = true; p.vel.x = 0; state.projectiles = state.projectiles.filter(q => q.owner !== 'player'); };
const faceBen = (state: GameState, h: Lair) => {
  const p = state.player;
  p.facing = W(BEN_RX) > midX(state) ? 1 : -1;
  h.ben.facing = p.facing === 1 ? -1 : 1;
};

// ---- the meetup (the first meeting's long intro, or a later one's short one: meetup.ts)
const startMeet = (state: GameState, h: Lair) => {
  h.phase = 'meet'; h.all = 0; h.token++;
  state.stageMemo[MEMO] = '1';
  // (the gross-up back up for the sell: the boots, the stomp at the lens)
  const sell = L.sell[0];
  // (the hidden art of follow-ups before the trial line: what follow-ups are, then the scarecrow; the big beat only with
  // his first follow-up piece, whichever land: none taught, none of the others handed over)
  h.artFull = !followArt() && !FOLLOW_PIECES.some(pc => pc !== 'sabatons' && benGave(pc));
  const art = artBeats(pantsOf(state), h.artFull, { extra: L.follow?.[0], again: L.followAgain?.[0] });
  const beats = meetupScript(pantsOf(state), L, undefined, art).map((b): Beat => (b.who === 'ben' && b.text === sell ? { ...b, gross: true } : b));
  // (the buttons up from the how through what this piece's own follow-up does)
  [h.howA, h.howB] = artTipRange(beats, art);
  h.script = startScript(beats);
  freeze(state);
  setPose(h, 'stand'); faceBen(state, h);
};
const runMeet = (state: GameState, h: Lair): { out: Controls; tips: EquipControl[] | null } => {
  const s = h.script!;
  freeze(state); h.all++;
  const end = () => { setBenMet(true); saveProgress(); h.script = null; startTrial(state, h); };
  if (h.all > SKIP_AFTER) { offerSkip(); if (takeSkip()) { silenceAll(); skipScript(s); h.ben.said = null; end(); return { out: { ...NO_CONTROLS }, tips: null }; } }
  // (a beat of him turning from his lifting; then he turns to Meathead for the lot)
  if (h.all > 40) {
    tickScript(state, s, h.ben);
    if (s.i > 0 || s.waiting) { setPose(h, s.pose); faceBen(state, h); }
    if (s.done) { end(); return { out: { ...NO_CONTROLS }, tips: null }; }
  }
  // (the buttons up while he says how the art goes)
  return { out: { ...NO_CONTROLS }, tips: s.i >= h.howA && s.i <= h.howB ? KICK_TIPS : null };
};

// ---- the trial
const startTrial = (state: GameState, h: Lair) => {
  h.phase = 'trial'; h.misses = 0; h.passAt = -1; h.missAt = 0; h.kickHit = 0; h.throwing = false; h.hitSeen = lastMelee();
  state.player.inCutscene = false;
  // (the boots off his feet and onto Meathead's for it; the scarecrow stood up)
  h.ben.piece = null; setPose(h, 'fold');
  if (!has('sabatons')) {
    lend(); playSound('powerup', 0.6, 2);
    const p = state.player;
    for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: midX(state) + (Math.random() - 0.5) * 30, y: p.pos.y + p.height - 6 - Math.random() * 8 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 3 }, life: 30, color: i % 2 ? '#F0C850' : '#A4532A', size: 3 });
  }
  if (!h.crow) h.respawn = state.frame + 30;
};
const KICK_TIPS: EquipControl[] = [
  { pad: ['DPAD_DOWN', 'B'], join: '+', kb: ['@down', '@special'], label: 'IN THE AIR: DIVE KICK HIM' },
  { ...FOLLOW, label: 'TAP AS YOU HOLD THE DIVE KICK: MISSILE' },
];
/** He's got it off a dive kick (the missile's on): in his hands inside the window. */
const tookIt = (state: GameState, h: Lair, e: Enemy | null) => !!e && grabHolding() === e && !h.throwing && state.frame - h.kickAt <= FOLLOW_WINDOW + 8;
const runTrial = (state: GameState, h: Lair): EquipControl[] | null => {
  const p = state.player, cx = midX(state);
  // (back in after leaving on it: lent again)
  if (!has('sabatons')) lend();
  if (h.passAt >= 0) {
    const t = state.frame - h.passAt;
    if (t === 50) {
      const tok = h.token;
      benSays(h.ben, pickLine(L.pass), () => { if (h.token === tok) meatheadSays(state, pickLine(byPants(state, L.passed)), true, () => { if (h.token === tok && h.phase === 'trial') startGift(state, h); }); });
    }
    // (in case a line never gets its turn)
    if (t > 900 && h.phase === 'trial') startGift(state, h);
    keepCrow(state, h, 9999);
    return null;
  }
  h.ben.facing = cx < W(BEN_RX) ? -1 : 1;
  if (h.ben.pose !== 'fold' && h.ben.poseT > 30) setPose(h, 'fold');
  keepCrow(state, h, RESPAWN_TRIAL);
  const e = h.crow;
  if (p.isDivekicking) h.kickAt = state.frame;
  // (a dive kick that landed on it: waiting on the missile)
  const hit = lastMelee();
  if (hit && hit !== h.hitSeen) { h.hitSeen = hit; if (e && hit.e === e && hit.move === 'divekick') h.kickHit = state.frame; }
  // (it in his hands off a dive kick: the missile's on; let go of (thrown): passed)
  if (tookIt(state, h, e)) h.throwing = true;
  // (let go of (the missile): watched till it's in the dynamite (passed: it blows) or it isn't (Ben says so, it's stood
  // back up))
  if (h.throwing && grabHolding() !== e) {
    h.throwing = false; h.kickHit = 0;
    if (e) h.fly = { e, at: state.frame, dir: Math.sign(e.vel.x) || p.facing };
  }
  const res = watchFly(state, h, RESPAWN_TRIAL);
  if (res === 'hit') {
    h.passAt = state.frame;
    silenceAll(); h.ben.said = null; h.token++;
    setPose(h, 'fold');
    return null;
  }
  if (res) missThrow(state, h, res);
  // (a dive kick, and no missile after it: a miss; a hint after two)
  if (h.kickHit && !h.throwing && state.frame - h.kickHit > MISS_AFTER && state.frame >= h.missAt) {
    h.kickHit = 0; h.missAt = state.frame + 150; h.misses++;
    silenceAll(); h.ben.said = null;
    const tok = h.token;
    benSays(h.ben, pickLine(L.miss), h.misses === 2 ? () => { if (h.token === tok && h.phase === 'trial' && h.passAt < 0) benSays(h.ben, L.hint[0]); } : undefined);
  }
  return e && Math.abs(cx - mid(e).x) < 420 && p.health > 0 ? KICK_TIPS : null;
};

// ---- the gift, and the hidden art of follow-ups
const startGift = (state: GameState, h: Lair) => {
  h.phase = 'gift'; h.all = 0; h.token++;
  // (the hidden art's been said before the trial (startMeet): here, only the gift, and Meathead naming his new move)
  // (his for good, there and then: a skip, a death, a quit can't lose them)
  setPiece('sabatons', true); setBenGave('sabatons'); lent = false; saveProgress();
  freeze(state);
  setPose(h, 'give');
  const pants = pantsOf(state);
  const beats: Beat[] = [
    { who: 'ben', text: L.gift[0], pose: 'give' },
    { who: 'ben', text: L.tease[0], pose: 'fold' },
    { who: 'mh', text: pickLine(L.enamored[pants]) },
  ];
  // (the art already taught with the big beat has its own cartoon Japanese; otherwise he names the move his way)
  if (!h.artFull) beats.push({ who: 'mh', text: pickLine(BOOT_WEEB[pants]) }, { who: 'ben', text: BOOT_HUH[0] });
  h.howA = h.howB = -1;
  // (the last piece of the eight: the full set, his last word)
  beats.push(...giftCoda(pants));
  h.script = startScript(beats);
};
/** The practice's tips, in the order he does them (the owner's: "say down+B while in air followed by the tap Y as you
 *  hold B"): the dive kick, then the tap. */
const PRACTICE_TIPS: EquipControl[] = [
  KICK_TIPS[0],
  { ...FOLLOW, label: 'TAP AS YOU HOLD A DIVE KICK: MISSILE' },
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
  const tips: EquipControl[] | null = null;
  return { out: { ...NO_CONTROLS }, tips };
};

// ---- after: practice, the nudges
const runDone = (state: GameState, h: Lair): EquipControl[] | null => {
  const p = state.player, cx = midX(state);
  // (Ben: arms folded watching when he's close; shadowboxing when he's off)
  if (Math.abs(cx - W(BEN_RX)) < 220 || h.ben.said) setPose(h, 'fold'); else setPose(h, 'flurry');
  h.ben.facing = cx < W(BEN_RX) ? -1 : 1;
  const e = h.crow;
  if (p.isDivekicking) h.kickAt = state.frame;
  if (tookIt(state, h, e)) h.throwing = true;
  if (h.throwing && grabHolding() !== e) {
    h.throwing = false;
    if (e) h.fly = { e, at: state.frame, dir: Math.sign(e.vel.x) || p.facing };
  }
  // (into the dynamite: it blows, and his word (the first one after the gift always; after that, now and then); the
  // other way, or short: he says so)
  const res = watchFly(state, h, RESPAWN);
  if (res === 'hit') {
    h.tipsTill = false;
    if (!h.goodSaid || state.frame >= h.missAt) {
      h.goodSaid = true; h.missAt = state.frame + 420;
      const tok = h.token;
      setTimeout(() => { if (lairOf(state) === h && h.token === tok && h.phase === 'done' && !cannonBusy(h.cannon)) { silenceAll(); benSays(h.ben, pickLine(L.good)); } }, 700);
    }
  } else if (res) missThrow(state, h, res);
  keepCrow(state, h, RESPAWN);
  // (now and then: the cannon)
  if (state.frame > h.nudgeAt && !p.inCutscene && !h.ben.said && !cannonBusy(h.cannon)) {
    h.nudgeAt = state.frame + 2700;
    benSays(h.ben, pickLine(byPants(state, NUDGE)));
  }
  return h.tipsTill && h.crow ? PRACTICE_TIPS : null;
};

/** Where Ben's feet are (world). */
export const benAt = () => ({ x: W(BEN_RX), y: Y(ROOM.floor) });
