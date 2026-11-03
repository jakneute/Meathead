// FOREIGN LANDS' HIDDEN ARMOR: THE KEGGER HELMET, in THE HALLS OF VALHALLA under Norway's troll toll bridge (the owner's
// brief, 2026-11-01: "the foreign land location for confuctious is in the norway section. after the toll bridge go back
// and there will be a 'doorman' in another troll suit (you cannot attack him) on the lower righthand side of the bridge
// who asks for the blood of every norweigean cosplayer to 'enter the halls of valhallaa' killing every single npc
// associated with the norway section and talking to him with the up button will raise a cheap looking 'halls of
// valhalla' entrance area under the bridge where you can press up to enter. under the bridge. there, confucktious will
// be." And: "foreign lands has no cannon, you just exit the hall").
//
//   THE DOORMAN: once he's been past the toll (TOLL PAID, the gate up, or swum the river to its far bank), a park guy in
//     a cheap troll suit stands on the bank under the bridge, just left of the right troll, under its inner knee (the
//     owner, 2026-11-02: "he should be at the bottom at a place i can reach him... just walk to the left of the troll":
//     the right troll straddles the walk now, toll.ts, so from the street he walks in under it straight to him). He
//     flags him down as he comes near (waving; a hey the first time, a call now and then; a call after him if he walks
//     off), till he's talked to him. Not an enemy: nothing hits him, nothing he does hurts (he's drawn, not in the enemy list). UP by him
//     talks: the first time, his demand (the blood of every Norwegian cosplayer); after, how many are still breathing;
//     all dead, he raises the halls.
//   THE COUNT: every Norwegian Norway's build put down, from the village on (the owner: "all npcs in the level
//     associated with norway must die to make the troll happy"): the village's two, the little troll bridge's viking,
//     the lutefisk booth's sampler lady, the longship's viking, the stave church's four and the two past it, the
//     sampler lady on the left troll, the toll gang's four, the two vikings past the gate, the shield viking on the
//     right troll's shoulder: 19. Norway has no other people (no guests, no harmless cast). Once only a few are left,
//     the count comes with where the nearest still is. One's
//     counted dead once its health is gone or it's blown away (a kill, a drowning, the troll's hand; and the ones a
//     checkpoint's safe start leaves out: they're out of the world for good, so nothing's ever stuck waiting on one).
//     The kills outlive a death, the way the toll's gate does: whoever's dead stays dead on the respawn (and counted),
//     for this way into the land; a fresh way into the land starts the count again, the cast all back. Once the halls
//     are up, they stay up for good (the save: upgrades/state.ts benSpot('valhalla')).
//   THE HALLS: up out of the river at the bridge's right end on a hydraulic lift (a theme park's plywood facade: painted
//     logs and shields, a plastic dragon head over the door, the foam-axe sign, the fog machine), a dock of planks on
//     barrels in front of it right across the river, flush with both banks (one-way: up through it out of the water), and
//     the left troll's plug goes up into it on the same lift (toll.ts: the owner, "blocks on both sides can rise. why
//     not"): he walks in under the bridge from either end to the door. The troll under the bridge retires once the dock's
//     over the river. UP at its door: in.
//   THE HALL (down under the bridge, valhallaArt.ts draws it): a ride's old Viking show set gone gym-bro hideout. Ben.
//   THE MEETUP (a cutscene, SKIP >> for all of it, bubbles; confucktious/meetup.ts's script): the FIRST meeting's long
//     intro if he's never met Ben anywhere, else the short LATER one; his gross-up chugging through the helmet's straw
//     and headbutting the camera (gross.ts); Meathead wants it; Ben sells it and sets the trial.
//   THE TRIAL (in play; invented): HEADBUTT THE KEG: a keg hung on a chain from the ceiling; jump up under it, head
//     first, three times (it swings, foam off it, a grunt from Ben; the third bursts its tap). Shooting it or hitting it
//     any other way is a miss (a dry line; a hint after two). Can't get stuck: any upward bump of his head into it
//     counts, wherever it's swung to; the jump's button is up on screen while he's near it.
//   THE GIFT (a cutscene, skippable): the helmet is his (setPiece, setBenGave, saved there and then); Ben's tease,
//     Meathead enamored; the YOU GOT card (90 frames, every button let go once, a fresh press closes it; PRESS ANY
//     BUTTON only once it's armed). Not a follow-up piece: no hidden art.
//   THE PRACTICE: the INTERN (m2:fl_foamviking: one of Norway's vikings in a foam-axe costume, harmless: no contact
//     damage, nothing he throws ever hurts), one at a time, another along a moment after each goes, lobbing foam axes
//     at his head: off the helmet they bounce with a clank (ducking, more of him's covered: gear.ts), off the rest of him
//     with a squeak. Nothing in the hall hurts him (noContactHurt). Ben nudges him out the door.
//   OUT: UP at the hall's door (its back, the EXIT sign) walks him back out onto the dock under the bridge, any time.
//   ONCE GOT: Ben's there (an idle line, the nudges), the intern too; the helmet isn't given again (benGave: the cheats'
//     armor toggles don't skip the meetup).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import type { Block, Enemy, EnemyKind } from '../../../m1/types';
import { NO_CONTROLS } from '../../../m1/game/platform/input';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { pickLine, silenceAll } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { makeKindEnemy, mid } from '../../../m1/game/enemies/kinds';
import { isNude, isShat } from '../../../m1/game/player/gut';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { registerM2Kind } from '../../kinds';
import { inPlay } from '../../moves/grab';
import { setUi } from '../../store';
import { onFloorish, upStart } from '../../upZone';
import { saveProgress } from '../../save';
import { setPiece, setBenMet, benGave, setBenGave, benSpot, setBenSpot } from '../../upgrades/state';
import { helmetStops } from '../../upgrades/gear';
import type { EquipControl } from '../../upgrades/equipInfo';
import {
  NUDGE_OUT, BYE_MEATHEAD, PIECE_LINES, benSays, drawBenGross, drawBenGrossBack, warmBenGross, meetupScript, startScript, tickScript, skipScript,
  type BenPose, type BenTalk, type Script, type Beat, type ByPants, giftCoda,
  makeGate, markGate, gateBump, type Gate,
} from '../../upgrades/confucktious';
import { ledge, solid, teleport, meatheadSays, speak, saidOver, landVisit, type Said } from '../section';
import { SECTIONS, GY } from '../geometry';
import { drawCast, womanOf, type Costume } from '../cast';
import { VIKING_COSTUME } from './kinds';
import { tollPaid, stopArmAt, liftPlug } from './toll';
import { walkOff, walkOffDue, type WalkOff } from '../../walkOffCall';
import { isTalking } from '../../../m1/game/platform/speech';
import { DOORMAN_VOICE, DOOR_DEMAND, DOOR_DEMAND_MH, DOOR_LEFT, doorCount, DOOR_RAISE, DOOR_RAISE_FIRST, DOOR_RAISE_MH, DOOR_OPEN, DOOR_HEY, DOOR_CALL, DOOR_WALKOFF, DOOR_WHERE, type DoorWhere } from './lines';

const { x0 } = SECTIONS.norway;
const X = (rx: number) => x0 + rx, Y = (h: number) => GY - h;
const L = PIECE_LINES.helmet;

// ---------------------------------------------------------------------------------------------------------------
// Where (Norway-relative x; heights up from the promenade, or world y in the hall)

/** The facade (its ends, its height), its door's middle, the dock in front of it (flush with the bank, over the
 *  river's right end). */
export const FACADE = { a: 4640, b: 4888, h: 236 };
export const DOOR = 4764;
export const DOCK = { a: 4400, b: 4900 };
/** The doorman (his feet's middle, on the ground): on the bank under the bridge, just left of the right troll's inner
 *  leg, under its knee, right on the walk in to the halls (the owner: "just walk to the left of the troll"). */
export const DOORMAN = { x: 4954, h: 0 };
/** How near he starts flagging him down, how near a call comes, how often. */
const WAVE_NEAR = 560, CALL_NEAR = 460, CALL_EVERY = 330;
/** The hall: its ends, its floor and ceiling (world y), straight down under the bridge, past the ground. */
export const HALL = { a: 4380, b: 5220, floor: GY + 2400, ceil: GY + 2000 };
/** The hall's door (inside: its middle), the keg (its chain's x, its bottom's height off the floor, its size), where Ben
 *  waits by his throne, where he watches the trial from, where the intern turns up. */
export const IN_DOOR = 4450;
export const KEG = { x: 4700, up: 128, w: 40, h: 50 };
export const THRONE = 4960, BEN_HOME = 4900, BEN_TRIAL = 4800, PRACTICE_X = 5130;
/** The lift's time to come up (frames). */
const RISE = 200;
/** The YOU GOT card's least time up before it can be closed (frames). */
const CARD_HOLD = 90;
/** The meetup's run this visit (state.stageMemo: kept across deaths, gone on a fresh way into the land). */
const MEMO = 'm2:benForeign';
/** The save's record of the halls being up. */
const SPOT = 'valhalla';

const midX = (state: GameState) => state.player.pos.x + state.player.width / 2;
const feetY = (state: GameState) => state.player.pos.y + state.player.height;
const pantsOf = (state: GameState): keyof ByPants => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');
const byPants = (state: GameState, r: ByPants) => r[pantsOf(state)];

/** He's in the hall (on its floor, or in the air in it). */
export const inHall = (state: GameState) => {
  const cx = midX(state), fy = feetY(state);
  return cx > X(HALL.a) - 10 && cx < X(HALL.b) + 10 && fy <= HALL.floor + 8 && fy > HALL.ceil - 60;
};
/** The camera's down in the hall (its own lighting, its own drawing). */
export const hallView = (state: GameState) => state.camera.y + CANVAS_HEIGHT / 2 > GY + 1200 && state.camera.x + CANVAS_WIDTH / 2 > X(HALL.a) - 600 && state.camera.x + CANVAS_WIDTH / 2 < X(HALL.b) + 600;
/** The halls are up for good. */
export const hallsUp = () => benSpot(SPOT) || benGave('helmet');

// ---------------------------------------------------------------------------------------------------------------
// The count: every enemy Norway's build put down, by a name that's the same every build

/** This way into the land's kills (by name), and every name there's been (the total). */
let countVisit = -1;
const killed = new Set<string>();
const names = new Set<string>();
/** Where each was put (Norway x; the longship's viking -1): for the doorman's where-hint. */
const homes = new Map<string, number>();
const fresh = () => { if (countVisit !== landVisit()) { countVisit = landVisit(); killed.clear(); names.clear(); homes.clear(); demanded = false; hookVisit = -1; } };
/** He's been hailed this way into the land (the first hey). */
let hookVisit = -1;
/** He's been told what the doorman wants (this way into the land). */
let demanded = false;
/** How many are still breathing. */
export const leftAlive = () => { fresh(); return names.size - killed.size; };

/**
 * Norway's build, once its cast is down: `spawned` everyone it put down, `ship` the longship's viking (its spot's
 * wherever the ship was). Whoever's been killed this way into the land isn't put back (and is counted dead: the toll
 * gang's gate counts on their health), the rest are watched.
 */
export const trackCast = (state: GameState, spawned: Enemy[], ship: Enemy | null) => {
  fresh();
  const h = hallOf(state), gone = new Set<Enemy>();
  h.tracked = [];
  for (const e of spawned) {
    const name = e === ship ? 'ship' : `${e.kind}@${Math.round(e.homeX ?? e.pos.x)}@${Math.round(e.homeY ?? e.pos.y)}`;
    names.add(name);
    homes.set(name, e === ship ? -1 : Math.round((e.homeX ?? e.pos.x) - x0));
    if (killed.has(name)) { e.health = 0; gone.add(e); continue; }
    h.tracked.push({ e, name, away: 0 });
  }
  if (gone.size) state.enemies = state.enemies.filter(e => !gone.has(e));
};
/** Where the nearest one still breathing is (nearest the doorman), or null. */
const whereLeft = (): DoorWhere | null => {
  let best: number | null = null;
  const at = (x: number) => (x < 0 ? 2300 : x);
  for (const n of names) if (!killed.has(n)) { const x = homes.get(n) ?? 0; if (best === null || at(x) > at(best)) best = x; }
  if (best === null) return null;
  if (best < 0) return 'ship';
  return best < 1000 ? 'village' : best < 1500 ? 'plank' : best < 1900 ? 'booth' : best < 3500 ? 'church' : best < 3800 ? 'fisk' : best < 4380 ? 'trollL' : best < 5000 ? 'deck' : 'trollR';
};
/** Each frame: anybody tracked who's dead (or gone from the world for good) counted. */
const tally = (state: GameState) => {
  const h = hallOf(state), check = state.frame % 30 === 0, cam = state.camera.x + CANVAS_WIDTH / 2;
  for (const t of h.tracked) {
    if (killed.has(t.name)) continue;
    const e = t.e;
    if (e.health <= 0 || e.isBlownAway || e.pos.y > GY + 1500) { killed.add(t.name); continue; }
    // (gone out of the world some other way, near enough to be awake and still not in it a few seconds on: never coming
    // back, so not left for him to hunt)
    if (check) {
      if (Math.abs(mid(e).x - cam) < 500 && !state.enemies.includes(e)) { if (++t.away >= 6) killed.add(t.name); }
      else t.away = 0;
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The intern: one of Norway's vikings in a foam-axe costume (harmless; grabbable), lobbing foam at his head

const foamAxe = (g: CanvasRenderingContext2D, x: number, y: number, up: boolean) => {
  // (a pool-noodle handle, a fat foam blade: orange, the craft-store sticker on it)
  const a = up ? -2.3 : -1.2, ex = x + Math.cos(a) * 20, ey = y + Math.sin(a) * 20;
  g.strokeStyle = '#1A0B06'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(ex, ey); g.stroke();
  g.strokeStyle = '#FACC15'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.lineTo(ex, ey); g.stroke();
  g.save(); g.translate(ex, ey); g.rotate(a + Math.PI / 2);
  g.fillStyle = '#1A0B06'; g.beginPath(); g.moveTo(-1, -4); g.quadraticCurveTo(12, -11, 13, 0); g.quadraticCurveTo(12, 11, -1, 5); g.closePath(); g.fill();
  g.fillStyle = '#F97316'; g.beginPath(); g.moveTo(0, -3); g.quadraticCurveTo(11, -9.6, 11.6, 0); g.quadraticCurveTo(11, 9.6, 0, 4); g.closePath(); g.fill();
  g.fillStyle = '#FDBA74'; g.fillRect(2, -4, 6, 2); g.fillStyle = '#C2410C'; g.fillRect(3, 2, 7, 2);
  g.restore();
};
const FOAM_COSTUME: Costume = {
  ...VIKING_COSTUME, id: 'foamviking',
  hold: (g, _B, F, x, y) => { if (F.pose !== 'strike' && F.pose !== 'after') foamAxe(g, x, y, F.pose === 'tell'); },
  mouth: 'o',
};
/** His throw: the tell's frames, the wait between. */
const TELL = 24, BETWEEN = 96;
registerM2Kind({
  kind: 'm2:fl_foamviking', stats: { w: 38, h: 74, hp: 90, contact: 0, mass: 200 },
  humanoid: true, grab: 'body', pathing: false,
  gender: e => (womanOf(e) ? 'f' : 'm'),
  head: { x: 1, y: -68, r: 10 },
  // (stands his ground facing him; every so often, a foam axe lobbed at his head)
  ai: (ctx, e) => {
    const { state } = ctx, pm = mid(state.player), dx = pm.x - mid(e).x;
    e.facing = dx < 0 ? -1 : 1; e.vel.x = 0;
    e.aiTimer = (e.aiTimer || 0) + 1;
    const p = state.player, ready = !p.inCutscene && p.health > 0 && inHall(state) && Math.abs(dx) > 70;
    if (e.aiState === 'tell') { if (e.aiTimer >= TELL) { e.aiState = 'strike'; e.aiTimer = 0; lobFoam(state, e); } }
    else if (e.aiState === 'strike') { if (e.aiTimer >= 10) { e.aiState = 'after'; e.aiTimer = 0; } }
    else if (e.aiState === 'after') { if (e.aiTimer >= 20) { e.aiState = 'near'; e.aiTimer = 0; } }
    else if (e.aiTimer >= BETWEEN && ready) { e.aiState = 'tell'; e.aiTimer = 0; }
    return false;
  },
  draw: (c, e, f) => drawCast(c, e, f, FOAM_COSTUME),
});

/** A foam axe in the air (world), turning; `hit` once it's hit him (or the floor): it only bounces after. */
export interface Foam { x: number; y: number; vx: number; vy: number; rot: number; vr: number; hit: boolean; life: number }
const FOAM_G = 0.32, FOAM_T = 44;
const lobFoam = (state: GameState, e: Enemy) => {
  const p = state.player, h = hallOf(state);
  // (at his head, led a little the way he's going)
  const sx = mid(e).x + (e.facing ?? 1) * 10, sy = e.pos.y + 14;
  const tx = p.pos.x + p.width / 2 + p.vel.x * FOAM_T * 0.4, ty = p.pos.y + (p.isDucking ? 34 : 8);
  h.foam.push({ x: sx, y: sy, vx: (tx - sx) / FOAM_T, vy: (ty - sy) / FOAM_T - 0.5 * FOAM_G * FOAM_T, rot: 0, vr: (e.facing ?? 1) * 0.3, hit: false, life: 240 });
  playSound('whoosh', 0.5, 4);
};
const runFoam = (state: GameState, h: Hall) => {
  const p = state.player;
  for (const a of h.foam) {
    a.vy += FOAM_G; a.x += a.vx; a.y += a.vy; a.rot += a.vr; a.life--;
    if (a.y > HALL.floor - 4) { a.y = HALL.floor - 4; a.vy = a.hit ? 0 : -Math.abs(a.vy) * 0.3; a.vx *= 0.6; a.vr *= 0.5; if (!a.hit) playSound('thud', 0.25, 8); a.hit = true; }
    if (a.hit || p.health <= 0) continue;
    // (off the helmet: a clank, sparks (gear.ts does those), and Ben's word the first time; anywhere else on him, a squeak:
    // it's foam. Never a hurt)
    if (helmetStops(state, a.x - 7, a.y - 7, 14, 14)) {
      a.hit = true; a.vx = -a.vx * 0.7; a.vy = -5; a.vr = -a.vr * 2;
      if (!h.goodSaid && h.phase === 'done') { h.goodSaid = true; silenceAll(); benSays(h.ben, pickLine(L.good)); }
      continue;
    }
    if (a.x > p.pos.x - 4 && a.x < p.pos.x + p.width + 4 && a.y > p.pos.y && a.y < p.pos.y + p.height) {
      a.hit = true; a.vx = -a.vx * 0.3; a.vy = -2.5;
      playSound('boing', 0.5, 8); playSound('thud', 0.2, 10);
    }
  }
  h.foam = h.foam.filter(a => a.life > 0);
};

// ---------------------------------------------------------------------------------------------------------------
// State (keyed on state.stage: rebuilt with the stage on every death)

type Phase = 'out' | 'meet' | 'trial' | 'gift' | 'card' | 'done';
export interface Hall {
  /** Norway's cast being counted. */
  tracked: { e: Enemy; name: string; away: number }[];
  /** The halls coming up (0 down, 1 up), the dock once it's there; the doorman's words, his pose, when he can be talked
   *  to again (busy talking), up's last state (a press is a fresh one). */
  lift: number; dock: Block | null;
  door: { said: Said | null; busy: boolean; pose: 'stand' | 'talk' | 'raise' | 'wave'; poseT: number; upBuf?: number; callAt: number; leave: WalkOff };
  upWas: boolean; upBuf?: number;
  phase: Phase;
  /** The scene's clock, a token (bumped on a skip: a line's done-callback from before it does nothing). */
  all: number; token: number;
  script: Script | null;
  ben: BenTalk & { pose: BenPose; facing: 1 | -1; poseT: number; piece: 'helmet' | null; x: number };
  /** The keg: its swing (angle, speed), headbutts that landed, the last one's frame, a jolt, its tap burst (frames in,
   *  -1 not yet); misses (and when the next miss line can come). */
  keg: { a: number; va: number; hits: number; at: number; burst: number };
  misses: number; missAt: number;
  /** The trial's done (the pass said, waiting on the lines). */
  passAt: number;
  cardT: number; cardArmed: boolean;
  practice: Enemy | null; respawn: number; goodSaid: boolean;
  foam: Foam[];
  nudgeAt: number;
  /** The way out (the door) barred while the trial's on (trialGate.ts). */
  gate: Gate;
  was: Partial<Controls>;
}
const stores = new WeakMap<object, Hall>();
export const hallOf = (state: GameState): Hall => {
  const key = (state.stage ?? state) as object;
  let h = stores.get(key);
  if (!h) stores.set(key, h = {
    tracked: [], lift: hallsUp() ? 1 : 0, dock: null,
    door: { said: null, busy: false, pose: 'stand', poseT: 0, callAt: 0, leave: walkOff() }, upWas: false,
    gate: makeGate('no-ben-gate', X(IN_DOOR) - 26, HALL.floor - 96, 52, 96),
    phase: 'out', all: 0, token: 0, script: null,
    ben: { said: null, pose: 'flurry', facing: -1, poseT: 0, piece: 'helmet', x: BEN_HOME },
    keg: { a: 0, va: 0, hits: 0, at: -999, burst: -1 }, misses: 0, missAt: 0, passAt: -1,
    cardT: 0, cardArmed: false, practice: null, respawn: 30, goodSaid: false, foam: [], nudgeAt: 0, was: {},
  });
  return h;
};
/** The hall's turned off contact hurts (and turns them back on as he leaves). */
let setNoContact = false;

/** The doorman's there: once he's been past the toll (or the halls are up already). */
export const doormanThere = (state: GameState) => hallsUp() || tollPaid() || state.checkpoint >= 14 || pastVisit === landVisit();
/** He's been past the toll this way into the land some other way (swum the river: across under the bridge to its far
 *  bank), so the doorman's there for him too (the owner: "i have no access to the troll under the bridge"). */
let pastVisit = -1;
const notePast = (state: GameState) => { if (pastVisit !== landVisit() && midX(state) > X(4890) && feetY(state) <= GY + 8 && feetY(state) > Y(DOORMAN.h + 300)) pastVisit = landVisit(); };

// ---------------------------------------------------------------------------------------------------------------
// Building it: the dock (once the halls are up), the hall's box down under the bridge

const putDock = (state: GameState, h: Hall) => {
  if (h.dock) return;
  h.dock = ledge(state, X(DOCK.a), GY, DOCK.b - DOCK.a, { hidden: true, tag: 'no-valhalla-dock' });
  // (right across the river: the troll under the bridge retires)
  stopArmAt(X(DOCK.a));
};
export const buildValhalla = (state: GameState) => {
  const h = hallOf(state);
  stopArmAt(null);
  liftPlug(h.lift);
  if (h.lift >= 1) putDock(state, h);
  // (the hall: floor, ceiling and end walls, thick, far down under everything)
  const a = X(HALL.a), b = X(HALL.b), T = 240;
  solid(state, a - T, HALL.floor, b - a + T * 2, T, { hidden: true, tag: 'no-valhalla' });
  solid(state, a - T, HALL.ceil - T, b - a + T * 2, T, { hidden: true, tag: 'no-valhalla' });
  solid(state, a - T, HALL.ceil - T, T, HALL.floor - HALL.ceil + T * 2, { hidden: true, tag: 'no-valhalla' });
  solid(state, b, HALL.ceil - T, T, HALL.floor - HALL.ceil + T * 2, { hidden: true, tag: 'no-valhalla' });
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame (before the section's own update)

export const updateValhalla = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, p = state.player, h = hallOf(state);
  tally(state);
  liftPlug(h.lift);
  const upNow = !!controls.up, upPress = upNow && !h.upWas;
  h.upWas = upNow;
  if (h.lift > 0 && h.lift < 1) runRise(state, h);
  if (!inHall(state)) {
    // (out of the hall: bumping into things hurts again; the intern and his foam gone with him)
    if (setNoContact) { p.noContactHurt = false; setNoContact = false; }
    if (h.practice) { const e = h.practice; state.enemies = state.enemies.filter(o => o !== e); h.practice = null; }
    h.foam = [];
    if (h.ben.said) h.ben.said = null;
    return outside(state, h, controls, upPress);
  }
  h.ben.poseT++;
  // (a practice room: nothing down here hurts him)
  p.noContactHurt = true; setNoContact = true;
  const pressed = (k: keyof Controls) => !!controls[k] && !h.was[k];
  const anyPress = pressed('jump') || pressed('shoot') || pressed('special') || pressed('secondary') || pressed('charge');
  h.was = { ...controls };
  swingKeg(state, h);
  runFoam(state, h);
  // In, on his feet: what's on
  if (h.phase === 'out' && p.isGrounded && p.health > 0) {
    if (benGave('helmet')) {
      h.phase = 'done'; h.ben.piece = null; h.respawn = 40; h.nudgeAt = state.frame + 900;
      h.ben.x = BEN_HOME; setPose(h, 'fold');
      benSays(h.ben, pickLine(byPants(state, L.idle)));
    } else if (state.stageMemo[MEMO]) startTrial(state, h);
    else startMeet(state, h);
  }
  let out = controls, tips: EquipControl[] | null = null;
  switch (h.phase) {
    case 'meet': out = runMeet(state, h); break;
    case 'trial': tips = runTrial(state, h); break;
    case 'gift': out = runGift(state, h); break;
    case 'card': {
      p.inCutscene = true; p.vel.x = 0;
      h.cardT++;
      // (a buffer before it'll close: CARD_HOLD frames, then every button let go once, then a fresh press; its PRESS
      // ANY BUTTON shows only once it's armed)
      const held = !!(controls.jump || controls.shoot || controls.special || controls.secondary || controls.charge);
      if (!h.cardArmed && h.cardT > CARD_HOLD && !held) h.cardArmed = true;
      setUi({ gotPiece: 'helmet', gotPieceReady: h.cardArmed });
      if (h.cardArmed && anyPress) {
        h.phase = 'done'; p.inCutscene = false; setUi({ gotPiece: null, gotPieceReady: false });
        h.respawn = 20; h.nudgeAt = state.frame + 2400;
        setPose(h, 'fold');
        const tok = h.token;
        setTimeout(() => { if (hallOf(state) === h && h.token === tok) benSays(h.ben, L.practice[0]); }, 500);
      }
      out = { ...NO_CONTROLS };
      break;
    }
    case 'done': runDone(state, h); break;
  }
  if (h.phase !== 'card') setUi({ gotPiece: null });
  setUi({ chordTips: tips });
  // The door barred while the trial's on (UP at it: Ben's bark); unbarred on the pass
  markGate(state, h.gate, h.phase === 'trial' && h.passAt < 0);
  const byDoor = Math.abs(midX(state) - X(IN_DOOR)) < 52 && !p.inCutscene && p.health > 0;
  if (h.phase === 'trial') gateBump(state, h.gate, h.ben, byDoor && upPress);
  // The way out: UP at the door, any time he's in control once the trial's passed
  const atDoor = byDoor && h.phase === 'done';
  if (atDoor) setUi({ upPrompt: 'LEAVE VALHALLA' });
  if (upStart(h, upPress, atDoor, p.isGrounded)) {
    if (h.phase === 'done') { silenceAll(); h.ben.said = null; meatheadSays(state, pickLine(BYE_MEATHEAD), true); }
    setUi({ upPrompt: null, chordTips: null });
    teleport(state, X(DOOR), GY); p.facing = -1;
    playSound('slam', 0.5, 2);
    return { ...NO_CONTROLS };
  }
  return out;
};

/** Up top: the doorman (talking, raising the halls), the halls' door. */
const outside = (state: GameState, h: Hall, controls: Controls, upPress: boolean): Controls => {
  const p = state.player, cx = midX(state), fy = feetY(state);
  if (h.door.said === null && h.door.pose !== 'raise') h.door.pose = 'stand';
  h.door.poseT++;
  notePast(state);
  if (!doormanThere(state)) return controls;
  // (painting Ben's gross-up ahead, once the halls are up and he's near them)
  if (h.lift >= 1 && Math.abs(cx - X(DOOR)) < 700 && Math.abs(fy - GY) < 500) warmBenGross();
  // (on his feet there or hopping; a press mid-hop goes as he lands: upZone.ts. The owner's, 2026-11-02: "i really
  // don't want players to miss it. same for all")
  const free = !p.inCutscene && p.health > 0;
  // The doorman: up by him talks
  // (flagging him down till he's talked to him: waving as he comes near, a hey the first time, a call now and then, a
  // call after him if he walks off; never over anybody, never in a cutscene)
  const d = Math.abs(cx - X(DOORMAN.x)), low = Math.abs(fy - GY) < 260, unmet = !demanded && !hallsUp();
  const waving = unmet && free && low && d < WAVE_NEAR && !h.door.busy && !h.door.said;
  if (waving) h.door.pose = 'wave';
  if (unmet && free && low && !h.door.busy && !h.door.said && d < CALL_NEAR && !isTalking()) {
    if (hookVisit !== landVisit()) { hookVisit = landVisit(); h.door.callAt = state.frame; doorCalls(h, pickLine(byPants(state, DOOR_HEY))); }
    else if (state.frame - h.door.callAt > CALL_EVERY) { h.door.callAt = state.frame; doorCalls(h, pickLine(byPants(state, DOOR_CALL))); }
  }
  if (walkOffDue(state, h.door.leave, X(DOORMAN.x), unmet && hookVisit === landVisit(), unmet && !h.door.busy && !h.door.said)) doorCalls(h, pickLine(byPants(state, DOOR_WALKOFF)));
  const byMan = free && d < 84 && onFloorish(fy, Y(DOORMAN.h)) && !h.door.busy;
  if (byMan) setUi({ upPrompt: 'TALK' });
  if (upStart(h.door, upPress, byMan, p.isGrounded)) { talk(state, h); return { ...controls, up: false }; }
  // The halls' door: up on the dock by it goes in
  const byDoor = h.lift >= 1 && free && Math.abs(cx - X(DOOR)) < 52 && onFloorish(fy, GY);
  if (byDoor) setUi({ upPrompt: 'ENTER THE HALLS OF VALHALLA' });
  if (upStart(h, upPress, byDoor, p.isGrounded)) {
    setUi({ upPrompt: null });
    silenceAll(); h.door.said = null; h.door.busy = false;
    teleport(state, X(IN_DOOR) + 46, HALL.floor); p.facing = 1;
    playSound('slam', 0.5, 2);
    return { ...NO_CONTROLS };
  }
  return controls;
};

/** The doorman's say (one at a time: no talk-over). */
const doorSays = (h: Hall, text: string, after?: () => void) => speak(DOORMAN_VOICE, text, s => { h.door.said = s; }, true, after);
/** A call-out (a bark: dropped if anybody's talking). */
const doorCalls = (h: Hall, text: string) => speak(DOORMAN_VOICE, text, s => { h.door.said = s; }, false);
const talk = (state: GameState, h: Hall) => {
  // (a call-out of his still going: cut off, he's got him now)
  if (h.door.said) { silenceAll(); h.door.said = null; }
  h.door.busy = true; h.door.pose = 'talk'; h.door.poseT = 0;
  const done = () => { if (hallOf(state) === h) { h.door.busy = false; if (h.door.pose === 'talk') h.door.pose = 'stand'; } };
  const n = leftAlive();
  if (hallsUp() && h.lift > 0) { doorSays(h, pickLine(byPants(state, DOOR_OPEN)), done); return; }
  if (n <= 0) {
    // (every last one: up they come; for good)
    setBenSpot(SPOT); saveProgress();
    h.door.pose = 'raise'; h.door.poseT = 0;
    // (never asked yet and it's done already: impressed)
    const raise = demanded ? DOOR_RAISE : DOOR_RAISE_FIRST; demanded = true;
    doorSays(h, pickLine(byPants(state, raise)), () => meatheadSays(state, pickLine(byPants(state, DOOR_RAISE_MH)), true, done));
    if (h.lift <= 0) { h.lift = 0.001; playSound('rumble', 0.9, -6); playSound('clang', 0.6, -10); }
    return;
  }
  if (!demanded) {
    demanded = true;
    doorSays(h, pickLine(byPants(state, DOOR_DEMAND)), () => meatheadSays(state, pickLine(byPants(state, DOOR_DEMAND_MH)), true, done));
    return;
  }
  // (only a few left: where the nearest still is, so it can always be finished)
  const where = n <= 6 ? whereLeft() : null;
  doorSays(h, pickLine(byPants(state, DOOR_LEFT)), () => doorSays(h, doorCount(n), where ? () => doorSays(h, DOOR_WHERE[where], done) : done));
};
/** The halls coming up out of the river: the lift's rumble, the river boiling round it, fog off it; the dock last. */
const runRise = (state: GameState, h: Hall) => {
  h.lift = Math.min(1, h.lift + 1 / RISE);
  const f = state.frame, onIt = Math.abs(state.camera.x + CANVAS_WIDTH / 2 - X(DOOR)) < 900;
  if (onIt) {
    if (f % 6 === 0) shakeScreen(state, 2, 2);
    if (f % 40 === 0) playSound('rumble', 0.6, -4);
    if (f % 3 === 0) state.particles.push({ pos: { x: X(FACADE.a) + Math.random() * (FACADE.b - FACADE.a), y: GY + 28 }, vel: { x: (Math.random() - 0.5) * 3, y: -2 - Math.random() * 4 }, life: 30, color: Math.random() < 0.5 ? 'rgba(224,242,254,0.85)' : '#93C5FD', size: 3 + Math.random() * 3 });
  }
  if (h.lift >= 1) {
    putDock(state, h);
    if (onIt) { playSound('slam', 0.9, -8); playSound('splash', 0.8, -4); shakeScreen(state, 6, 5); }
    if (h.door.pose === 'raise') h.door.pose = 'stand';
  }
};

const setPose = (h: Hall, pose: BenPose) => { if (h.ben.pose !== pose) { h.ben.pose = pose; h.ben.poseT = 0; } };
const freeze = (state: GameState) => { const p = state.player; p.inCutscene = true; p.vel.x = 0; state.projectiles = state.projectiles.filter(q => q.owner !== 'player'); };
const faceBen = (state: GameState, h: Hall) => {
  const p = state.player, bx = X(h.ben.x);
  p.facing = bx > midX(state) ? 1 : -1;
  h.ben.facing = p.facing === 1 ? -1 : 1;
};

// ---- the meetup (the first meeting's long intro, or a later one's short one: meetup.ts)
const startMeet = (state: GameState, h: Hall) => {
  h.phase = 'meet'; h.all = 0; h.token++;
  state.stageMemo[MEMO] = '1';
  h.script = startScript(meetupScript(pantsOf(state), L));
  freeze(state);
  setPose(h, 'flurry'); h.ben.facing = -1;
};
const runMeet = (state: GameState, h: Hall): Controls => {
  const s = h.script!;
  freeze(state); h.all++;
  const end = () => { setBenMet(true); saveProgress(); h.script = null; startTrial(state, h); };
  if (h.all > SKIP_AFTER) { offerSkip(); if (takeSkip()) { silenceAll(); skipScript(s); h.ben.said = null; end(); return { ...NO_CONTROLS }; } }
  // (a beat of him shadowboxing under the keg first; then he turns to Meathead for the lot)
  if (h.all > 40) {
    tickScript(state, s, h.ben);
    if (s.i > 0 || s.waiting) { setPose(h, s.pose); faceBen(state, h); }
    if (s.done) end();
  }
  return { ...NO_CONTROLS };
};

// ---- the trial: three headbutts on the keg
const startTrial = (state: GameState, h: Hall) => {
  h.phase = 'trial'; h.misses = 0; h.passAt = -1;
  if (h.keg.burst >= 0) { h.keg = { a: 0, va: 0, hits: 0, at: -999, burst: -1 }; }
  state.player.inCutscene = false;
  setPose(h, 'fold');
};
/** The keg's box (world) where it's swung to: its middle x, its top and bottom. */
export const kegBox = (h: Hall) => {
  const len = HALL.floor - KEG.up - KEG.h / 2 - HALL.ceil;
  const cx = X(KEG.x) + Math.sin(h.keg.a) * len, cy = HALL.ceil + Math.cos(h.keg.a) * len;
  return { cx, top: cy - KEG.h / 2, bottom: cy + KEG.h / 2, l: cx - KEG.w / 2, r: cx + KEG.w / 2 };
};
const swingKeg = (state: GameState, h: Hall) => {
  const k = h.keg;
  k.va += -Math.sin(k.a) * 0.012; k.va *= 0.985; k.a += k.va;
  if (k.burst >= 0) {
    k.burst++;
    // (the tap blown: beer gushing out of it, then a dribble)
    const b = kegBox(h), n = k.burst < 70 ? 3 : k.burst % 6 === 0 ? 1 : 0;
    for (let i = 0; i < n; i++) state.particles.push({ pos: { x: b.cx + 6, y: b.bottom - 8 }, vel: { x: 1 + Math.random() * 3, y: -1 + Math.random() * 2 }, life: 40, color: i % 2 ? '#F59E0B' : 'rgba(255,248,220,0.9)', size: 2 + Math.random() * 3, grav: 0.25 } as typeof state.particles[number]);
  }
};
const JUMP_TIP: EquipControl[] = [{ pad: ['A'], kb: ['@jump'], label: 'JUMP UNDER THE KEG: HEADBUTT IT' }];
const runTrial = (state: GameState, h: Hall): EquipControl[] | null => {
  const p = state.player, cx = midX(state), b = kegBox(h);
  // Passed: the lines, then the gift
  if (h.passAt >= 0) {
    const t = state.frame - h.passAt;
    if (t === 50) {
      const tok = h.token;
      benSays(h.ben, pickLine(L.pass), () => { if (h.token === tok) meatheadSays(state, pickLine(byPants(state, L.passed)), true, () => { if (h.token === tok && h.phase === 'trial') startGift(state, h); }); });
    }
    // (in case a line never gets its turn)
    if (t > 900 && h.phase === 'trial') startGift(state, h);
    return null;
  }
  // Ben watching from beside it, facing him
  const want = BEN_TRIAL;
  h.ben.x += Math.max(-3, Math.min(3, want - h.ben.x));
  h.ben.facing = cx < X(h.ben.x) ? -1 : 1;
  if (h.ben.pose !== 'fold' && h.ben.poseT > 40) setPose(h, 'fold');
  // His head up into it (on the way up, anywhere under it): a headbutt
  const headIn = p.pos.x + p.width - 6 > b.l && p.pos.x + 6 < b.r && p.pos.y < b.bottom + 4 && p.pos.y > b.top - 10;
  if (headIn && p.vel.y < 0 && p.health > 0 && state.frame - h.keg.at > 24) headbutt(state, h, b);
  else if (headIn && p.vel.y < 0) { p.vel.y = Math.max(p.vel.y, 1); }
  // Anything else into it: his shots (stopped by it, a clunk), a miss
  for (const q of state.projectiles) {
    if (q.owner !== 'player' || q.visualOnly) continue;
    if (q.pos.x + q.width > b.l && q.pos.x < b.r && q.pos.y + q.height > b.top && q.pos.y < b.bottom) {
      q.pos.y = -99999; q.vel.x = 0; q.vel.y = 0;
      h.keg.va += 0.01 * Math.sign(q.vel.x || 1); playSound('clang', 0.5, -4);
      miss(state, h);
    }
  }
  state.projectiles = state.projectiles.filter(q => q.pos.y > -90000);
  return Math.abs(cx - b.cx) < 300 && p.health > 0 ? JUMP_TIP : null;
};
const miss = (state: GameState, h: Hall) => {
  if (state.frame < h.missAt) return;
  h.missAt = state.frame + 150; h.misses++;
  silenceAll(); h.ben.said = null;
  const tok = h.token;
  benSays(h.ben, pickLine(L.miss), h.misses === 2 ? () => { if (h.token === tok && h.phase === 'trial' && h.keg.hits < 3) benSays(h.ben, L.hint[0]); } : undefined);
};
const headbutt = (state: GameState, h: Hall, b: ReturnType<typeof kegBox>) => {
  const p = state.player, k = h.keg;
  k.hits++; k.at = state.frame;
  // (him knocked back down off it; it swings off his head)
  p.vel.y = 2.5; p.pos.y = Math.max(p.pos.y, b.bottom + 1);
  k.va += (midX(state) < b.cx ? 1 : -1) * 0.05;
  playSound('clang', 1, -10); playSound('thud', 0.9, -6); shakeScreen(state, 5 + k.hits * 2, 4);
  for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: b.cx + (Math.random() - 0.5) * 30, y: b.bottom }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 2 }, life: 26, color: i % 3 ? 'rgba(255,250,235,0.9)' : '#FDE047', size: 2 + Math.random() * 3, grav: 0.2 } as typeof state.particles[number]);
  silenceAll(); h.ben.said = null; h.token++;
  if (k.hits < 3) {
    setPose(h, 'give'); h.ben.poseT = 0;
    benSays(h.ben, L.more?.[k.hits - 1] ?? pickLine(L.miss));
  } else {
    // (the third: the tap blows out of it, beer everywhere)
    k.burst = 0; h.passAt = state.frame;
    playSound('crunch', 0.8, -4); playSound('splash', 0.8, 2); shakeScreen(state, 9, 6);
    setPose(h, 'give');
  }
};

// ---- the gift
const startGift = (state: GameState, h: Hall) => {
  h.phase = 'gift'; h.all = 0; h.token++;
  // (his for good, there and then: a skip, a death, a quit can't lose it)
  setPiece('helmet', true); setBenGave('helmet'); saveProgress();
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
const runGift = (state: GameState, h: Hall): Controls => {
  const p = state.player, s = h.script!;
  freeze(state); h.all++;
  faceBen(state, h);
  const toCard = () => { h.script = null; h.ben.piece = null; setPose(h, 'fold'); h.phase = 'card'; h.cardT = 0; h.cardArmed = false; };
  if (h.all > SKIP_AFTER) { offerSkip(); if (takeSkip()) { silenceAll(); skipScript(s); h.token++; h.ben.said = null; toCard(); return { ...NO_CONTROLS }; } }
  if (h.all > 20) tickScript(state, s, h.ben);
  setPose(h, s.pose);
  // (the helmet off his head and onto Meathead's, once the gift's said)
  if (h.ben.piece && s.i >= 1) {
    h.ben.piece = null; playSound('powerup', 0.8, 0);
    for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: midX(state) + (Math.random() - 0.5) * 40, y: p.pos.y + 4 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 3 }, life: 30, color: i % 2 ? '#F7E08E' : '#E5E7EB', size: 3 });
  }
  if (s.done) toCard();
  return { ...NO_CONTROLS };
};

// ---- after: practice, the nudges
const runDone = (state: GameState, h: Hall) => {
  const p = state.player, cx = midX(state), bx = X(h.ben.x);
  h.ben.x += Math.max(-2, Math.min(2, BEN_HOME - h.ben.x));
  // (Ben: hands on his hips watching when he's close; shadowboxing when he's off)
  if (Math.abs(cx - bx) < 220 || h.ben.said) setPose(h, 'fold'); else setPose(h, 'flurry');
  h.ben.facing = cx < bx ? -1 : 1;
  // The intern: one at a time, another a moment after each goes
  const e = h.practice;
  const gone = !e || e.health <= 0 || e.isBlownAway || !inPlay(state, e);
  if (gone) {
    if (e) { h.practice = null; h.respawn = 90; }
    else if (--h.respawn <= 0) {
      const d = makeKindEnemy('m2:fl_foamviking' as EnemyKind, X(PRACTICE_X), HALL.floor);
      d.homeX = d.pos.x; d.homeY = d.pos.y; d.initialX = d.pos.x + (state.frame % 7) * 13; d.variant = state.frame % 13; d.facing = -1; d.seen = true;
      d.aiTimer = BETWEEN - 40;
      state.enemies.push(d); h.practice = d;
      playSound('poof', 0.6, -2);
      for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: X(PRACTICE_X) + (Math.random() - 0.5) * 50, y: HALL.floor - 30 + (Math.random() - 0.5) * 40 }, vel: { x: (Math.random() - 0.5) * 2, y: -0.5 - Math.random() }, life: 40, color: 'rgba(226,232,240,0.6)', size: 7 });
    }
  }
  // (now and then: the door)
  if (state.frame > h.nudgeAt && !p.inCutscene && !h.ben.said) {
    h.nudgeAt = state.frame + 2700;
    benSays(h.ben, pickLine(byPants(state, NUDGE_OUT)));
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing hooks (valhallaArt.ts draws the place)

/** Screen space: his gross-up while it's up; SKIP >> while the scene can be skipped. */
export const drawHallHud = (c: CanvasRenderingContext2D, state: GameState) => {
  if (!inHall(state)) return;
  const h = hallOf(state), sc = h.script;
  if ((h.phase === 'meet' || h.phase === 'gift') && sc?.gross) {
    drawBenGrossBack(c, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawBenGross(c, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10, 0.9 + 0.1 * Math.min(1, sc.grossT / 10), state.frame, h.phase === 'meet' ? 'helmet' : null, !!h.ben.said);
    // (his words over it, in a bubble: it's a skippable scene)
    if (h.ben.said) saidOver(c, h.ben.said.text, CANVAS_WIDTH / 2 + 60, 120);
  }
  if ((h.phase === 'meet' || h.phase === 'gift') && h.all > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
};
/** Where Ben's feet are (world). */
export const benAt = (state: GameState) => ({ x: X(hallOf(state).ben.x), y: HALL.floor });
