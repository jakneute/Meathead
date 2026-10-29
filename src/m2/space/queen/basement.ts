// THE BASEMENT: XENOSCARE's maintenance tunnels, deep under the hold, in the dark, and the queen stalking him through
// them (a chase, not a fight). He came down through the floor she smashed (show.ts), and it ends up a long flight of
// stairs at its east end, at the space disco's door.
//
//   THE PLACE     two levels, the whole height of it on one screen: the floor, and the catwalks over it (ladders up,
//                 pipe runs to hop up on half way, drop down through them); vents in the ceiling, ducts in the back wall
//                 at the floor. A tight light round him, a flickering emergency strip here and there, the rest near
//                 black. The hum, drips, a hiss in the pipes, her screech far off.
//   HER           silent (screeches, clicks, hydraulics: no words). Not set encounters: a stalker. She roams the vents
//                 on her own schedule and comes out where she likes: ahead of him, behind him, up on the catwalks over
//                 him, down on the floor under him, or crawling along the ceiling and dropping. Every time, told a beat
//                 before she can get at him: her clicks coming, the vent rattling (dust down out of it), a screech. She
//                 prowls her level, stops and sniffs, doubles back now and then, and goes back up a vent. Sometimes it's
//                 nothing (a vent rattles and nobody comes; her silhouette goes by over the near pipes and on). She
//                 sees him if he's on her level, in front of her and near (or right on her); she HEARS him (shooting,
//                 jumping, landing, charging are loud; walking's quiet; standing still, nothing): loud enough with her
//                 about, she comes to it; loud enough with her away, she's out sooner, near the noise. Seen, she runs
//                 him down, and up or down a level after him (she crouches and screeches first, then leaps). Getting past
//                 her once is nothing: she's back, any time, right up to the disco's door. And she can't be outrun:
//                 the basement's in stretches (WINDOWS), each one a go he has to hide through; somewhere in each (rolled
//                 each life) she's out for him if she hasn't been yet, ahead of him on his level, coming his way, a
//                 hiding spot in reach (a breather after the last go first). Not hidden through it, it's owed: she's
//                 back for it. Rushing doesn't skip them: past each stretch's FORCE point she's out for it right away,
//                 to a spot picked once ahead of where he'll have got to (forceGo), so the first three are
//                 certain at any speed (the user's: "certain to jump in front of you if you press on quickly").
//                 The stairs' finale waits on them all (four from the top, fewer from the checkpoints).
//   THE STAIRS    the panic run (the user's: "you don't see it coming, but you hear it"): at their foot she's out
//                 behind him, unseen, and he hears her coming: her claws clicking faster and nearer, her footfalls,
//                 the stairs rattling under her, screeches, the stalker song's panic arrangement. Keep going up and he
//                 makes the door, just (she's quicker than his walk; charging up them, easily); stop (no headway for half a second) or turn back down
//                 (more than a step's worth) and she's on him: a screech and the lunge, in from off the screen behind,
//                 the first he sees of her. The door kicked in, she's shut out. Touched: one shot.
//   THE KILL      she snatches him up to her face; a beat, her jaws opening in his face, her claw closing over his
//                 head; she tears it off; the neck geysers; she drops the body (it twitches); she screeches over the head
//                 and pitches it (the camera in close for it: his own death, 'headripped').
//   HIDING        the cast members' lockers and dark corners (the floor), the air handlers' cabinets (the catwalks):
//                 hold up at one and he's in. In, she goes right by. In with her on him (seen, and close), she finds him.
//   WEAPONS       go through her (nothing down here hurts her); they're loud.
//   THE TEACHING  the first: her silhouette over the pipes ahead, then out of a vent ahead and walking his way, slowly,
//                 lockers right there. Then she's loose.
//
// Kept across his deaths: nothing of hers (a death's back at the checkpoint, the opener past it done, a grace spell
// before she's first out); the door, once kicked in, stays in.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Light, SceneLight } from '../../../m1/game/render/lighting';
import type { Block } from '../../../m1/types';
import type { MeatheadDeath } from '../../../m1/game/player/deathAnim';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { KICK_POSE_FRAMES, CANVAS_WIDTH, CANVAS_HEIGHT, PARTICLE_PALETTES } from '../../../m1/constants';
import { registerHurtLines } from '../../kinds';
import { registerDeathKind, registerDeathAnim } from '../../../m1/game/player/deathAnim';
import { registerDeathDraw, body } from '../../../m1/game/render/player/deathAnim';
import { drawBloodPool } from '../../../m1/game/render/spatter';
import { onLadder, type LadderDef } from '../../moves/ladders';
import { setUi, isLandCleared } from '../../store';
import { hands, meatheadSays, box } from '../section';
import { ink, limb } from '../../../m1/game/render/npc/kit';
import { stamp, setStampHold } from '../../../m1/game/render/stamp';
import { GY } from '../geometry';
import { BASE_L, BASE_R, DOOR_X, BF, CATWALK_Y, CEIL_B, STAIRS_A, STAIRS_B, LAND_X, stairsY } from './geo';
import { drawQueen } from './art';
import { bandedGradient } from '../../../m1/game/render/pixelArt';
import { inBossFight } from '../../bossQuiet';
import { type Ramp, dith } from './paint';
import { neon, engraved, emboss, textW, stencil } from './letters';
import { FELL_MEMO } from './show';
import * as L from './lines';

export { CEIL_B };

type Ctx = CanvasRenderingContext2D;
const pick = pickLine;
const dressed = (state: GameState): L.Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

const B = BASE_L;
/** The checkpoint half way (the graveyard). */
export const GRAVEYARD_CP = 72;
/** The checkpoint on the far stretch (between the catwalks, clear of the hiding spots and her ways in). */
export const TUNNEL_CP = 73, TUNNEL_CP_X = B + 5720;
/** The boss's checkpoint (outside the disco's door, the refill by it): his once he's kicked the door in. */
export const DISCO_CP = 74;
/** How big she's drawn down here (she has to fit under the catwalks). */
const QS = 0.85;

// ---------------------------------------------------------------------------------------------------------------
// The kill: her own death for him ('headripped'): his head torn off, the neck geysering, the body dropped, twitching

const JAW = 'm2:sp_queen_jaw';
const RIPPED = 'own:headripped' as const;
registerHurtLines(JAW, L.HURT_JAW, L.DEATH_JAW);
registerDeathKind(JAW, RIPPED);
/** The kill's timeline (frames into it): the snatch; the beat (her jaws opening in his face, her claw closing on his
 *  head); the pull; the rip (he dies there); his body held a moment, geysering; dropped; she screeches over the head,
 *  then pitches it. */
const K_SNATCH = 12, K_GRIP = 36, K_PULL = 58, K_RIP = 66, K_DROP = K_RIP + 22, K_TOSS = K_RIP + 70, K_END = K_TOSS + 70;
/** Where he lands when she lets go (his feet's floor). */
const ripKill = { floor: BF };
const GORE = PARTICLE_PALETTES.GORE;
/** (headripped) Frames from his death to her letting go; his fall from then. */
const DROP_AT = K_DROP - K_RIP;
const fallOf = (d: MeatheadDeath, t: number) => (t < DROP_AT ? 0 : Math.min((ripKill.floor ?? d.y) - d.y, 0.5 * 0.7 * (t - DROP_AT) ** 2));
/** The neck's stump, t frames in (his body's middle top). */
const stumpAt = (d: MeatheadDeath, t: number) => ({ x: d.x, y: d.y - 56 + fallOf(d, t) });
registerDeathAnim(RIPPED, {
  frames: 190, airOk: true,
  tick: (ctx, d, t) => {
    const P = ctx.state.particles;
    // (the geyser out of the neck: straight up, hard, while she holds him; then in pumps, weaker, lying there)
    const st = stumpAt(d, t), down = fallOf(d, t) >= (ripKill.floor ?? d.y) - d.y - 0.5;
    const pump = !down ? 1 : t % 18 < 6 ? Math.max(0, 1 - (t - DROP_AT) / 90) : 0;
    if (pump > 0) for (let k = 0; k < (down ? 2 : 4); k++) {
      const up = down ? -d.facing : 0;
      P.push({ pos: { x: st.x + (down ? -d.facing * 30 : 0), y: down ? (ripKill.floor - 10) : st.y }, vel: { x: (Math.random() - 0.5) * 2.5 + up * 3 * pump, y: -(down ? 3 : 7 + Math.random() * 4) * pump }, life: 50, color: GORE[(t + k) % GORE.length], size: 2 + Math.random() * 3, grav: 0.35 });
    }
    // (her: screeching over the head; pitching it; it bouncing)
    if (t === 16) { playSound('roar', 1, -2); playSound('screams', 0.8, -6); shakeScreen(ctx.state, 8, 4); }
    if (t === K_TOSS - K_RIP) playSound('whoosh', 0.8, -4);
    if (t === K_TOSS - K_RIP + 22) playSound('thud', 0.6, 4);
    const fall = fallOf(d, t), was = fallOf(d, t - 1), floor = (ripKill.floor ?? d.y) - d.y;
    if (fall >= floor && was < floor) {
      playSound('thud', 1, -8); playSound('splat', 0.8, -4); shakeScreen(ctx.state, 6, 3);
      for (let k = 0; k < 10; k++) P.push({ pos: { x: d.x, y: ripKill.floor - 4 }, vel: { x: (Math.random() - 0.5) * 6, y: -1 - Math.random() * 3 }, life: 40, color: GORE[k % GORE.length], size: 2 + Math.random() * 3, grav: 0.35 });
    }
  },
});
registerDeathDraw(RIPPED, (ctx, state, d, weapon, t) => {
  const fall = fallOf(d, t), floor = (ripKill.floor ?? d.y) - d.y, down = fall >= floor - 0.5;
  const facing = d.facing, since = t - DROP_AT;
  if (down) drawBloodPool(ctx, Math.round(d.x - facing * 26), Math.round(ripKill.floor) + 1, Math.round(10 + Math.min(34, since * 0.6)), 517);
  ctx.save();
  ctx.translate(0, fall);
  // (held: hanging limp off her claw; dropped: over onto his back, and twitching a while (a jerk, a kick), then still)
  const twitch = down && since < 110 && (since % 23 < 3 || since % 37 < 2) ? 1 : 0;
  const tip = down ? -facing * Math.PI / 2 : t < DROP_AT ? 0.05 * Math.sin(t * 0.5) : -facing * Math.min(Math.PI / 2, (t - DROP_AT) * 0.12);
  ctx.translate(d.x, d.y); ctx.rotate(tip + twitch * 0.06); ctx.translate(-d.x, -d.y + (twitch ? -2 : 0));
  body(ctx, state, d, weapon, { isGrounded: down && !twitch, vel: { x: twitch ? 3 : 0, y: down ? 0 : 1 }, headless: 24, deathFace: 'dead' });
  ctx.restore();
});

/** Kept across his deaths: the disco's door is in. */
export const DOOR_MEMO = 'm2:space:discoDoor';

// ---------------------------------------------------------------------------------------------------------------
// The layout (two levels: the floor at BF, the catwalks at CATWALK_Y)

/** The catwalks: [from, to] (one-way grating: up through from below, down through them). */
export const CATWALKS: [number, number][] = [[B + 1500, B + 2200], [B + 2650, B + 3400], [B + 3800, B + 4700], [B + 5000, B + 5560], [B + 5850, B + 6350]];
/** The pipe runs half way up (a hop up onto one, then on up through the catwalk): [x, w]. */
export const PIPES: [number, number][] = [[B + 1700, 110], [B + 2950, 100], [B + 4100, 110], [B + 5200, 100], [B + 6100, 100]];
export const PIPE_Y = BF - 130;
/** The ladders up to the catwalks (each a little in from a catwalk's end: stepped off onto it). */
const LADDER_X: [number, 1 | -1][] = [[B + 1550, 1], [B + 2150, -1], [B + 2700, 1], [B + 3850, 1], [B + 4650, -1], [B + 5050, 1], [B + 5900, 1], [B + 6300, -1]];
export const LADDERS: LadderDef[] = LADDER_X.map(([x, inward]) => ({ x, top: CATWALK_Y, bottom: BF, ledge: { x: x + inward * 34, y: CATWALK_Y } }));
/** The catwalk at x (or null). */
const catwalkAt = (x: number) => CATWALKS.find(([a, b]) => x >= a && x <= b) ?? null;

/** Where he can hide: the cast members' lockers and dark corners (the floor), the air handlers' cabinets (up top). */
export const HIDES: { x: number; y: number; kind: 'locker' | 'dark' | 'cabinet' }[] = [
  { x: B + 780, y: BF, kind: 'locker' }, { x: B + 1300, y: BF, kind: 'locker' }, { x: B + 1900, y: BF, kind: 'locker' }, { x: B + 2450, y: BF, kind: 'locker' },
  { x: B + 3200, y: BF, kind: 'dark' }, { x: B + 3600, y: BF, kind: 'locker' }, { x: B + 4380, y: BF, kind: 'locker' }, { x: B + 4880, y: BF, kind: 'dark' },
  { x: B + 5420, y: BF, kind: 'locker' }, { x: B + 6000, y: BF, kind: 'locker' }, { x: B + 6280, y: BF, kind: 'dark' },
  { x: B + 1800, y: CATWALK_Y, kind: 'cabinet' }, { x: B + 3100, y: CATWALK_Y, kind: 'cabinet' }, { x: B + 4200, y: CATWALK_Y, kind: 'cabinet' }, { x: B + 5350, y: CATWALK_Y, kind: 'cabinet' }, { x: B + 6080, y: CATWALK_Y, kind: 'cabinet' },
];
/** The vents in the ceiling she comes and goes by; the ducts in the back wall at the floor (under the catwalks). */
export const VENTS = [B + 1100, B + 1400, B + 1800, B + 2400, B + 2900, B + 3300, B + 3650, B + 4050, B + 4400, B + 4800, B + 5250, B + 5500, B + 6050, B + 6320, B + 6450];
export const DUCTS = [B + 1000, B + 2050, B + 2550, B + 3400, B + 4500, B + 5150, B + 6250];
/** The emergency strips (flickering), along the ceiling. */
export const STRIPS = [B + 420, B + 1180, B + 1960, B + 2640, B + 3300, B + 4080, B + 4600, B + 5150, B + 5600, B + 6100, B + 6520];

/** The floor's height at x (the stairs at the east end). */
const floorY = (x: number) => stairsY(x);
/** A level's height at x: 0 the floor, 1 the catwalks. */
const levelY = (lvl: 0 | 1, x: number) => (lvl ? CATWALK_Y : floorY(x));

/** Laid out: the catwalks and the pipe runs (one-way), the stairs are ground (index.ts lays them). */
export const layBasement = (state: GameState) => {
  for (const [a, b] of CATWALKS) state.blocks.push({ x: a, y: CATWALK_Y, w: b - a, h: 14, type: 'platform', oneWay: true, grating: true, hidden: true, tag: 'q-catwalk' } as Block);
  for (const [x, w] of PIPES) state.blocks.push({ x, y: PIPE_Y, w, h: 14, type: 'platform', oneWay: true, hidden: true, tag: 'q-pipe' } as Block);
};

// ---------------------------------------------------------------------------------------------------------------
// The state

type Mode = 'away' | 'tell' | 'drop' | 'prowl' | 'hunt' | 'search' | 'climb' | 'ceil' | 'crouch' | 'leap' | 'kill' | 'ambush';
/** How she comes out: down a ceiling vent, out of a wall duct, or along the ceiling first. */
type Entry = 'vent' | 'duct' | 'ceil';
export interface Hunter {
  /** Set up against where he really is (the first frame: the checkpoint's put him there after the build). */
  init: boolean;
  mode: Mode; t: number; x: number; y: number; lvl: 0 | 1; dir: 1 | -1; speed: number;
  /** Where she's going (her points along her level), which she's at, how long she's stood sniffing. */
  path: { x: number; stop?: number }[]; leg: number; sniff: number;
  /** How she's coming out this time; after the drop, straight at him (the stairs' finale). */
  entry: Entry; huntOnDrop: boolean;
  /** The leap (between levels): from, to. */
  leap: { x0: number; y0: number; x1: number; y1: number; lvl: 0 | 1; then: Mode } | null;
  /** Frames till she's out again (away); how long she's been out; when she last saw him; where she last had him. */
  next: number; out: number; lastSeen: number; lastX: number;
  /** The opener's done; the finale's on (the stairs); a fake going (a vent rattling for nothing). */
  opened: boolean; finale: boolean; fake: { x: number; t: number } | null;
  /** The vent rattling as she comes (its x, how long). */
  rattle: { x: number; t: number } | null;
  /** The foreground pass (her silhouette over the near pipes: which way, how far through). */
  fg: { t: number; dir: 1 | -1; len?: number } | null;
  /** His noise (decays). */
  noise: number;
  /** He's hidden (in which spot), and since when; his heart. */
  hid: number; hidT: number; heart: number;
  /** He was hidden while she went by close: his say once she's gone. */
  passedClose: boolean;
  /** Said: the dark, the first sighting, the useless gun; when he last said something in hiding. */
  saidDark: boolean; saidSpot: boolean; saidGun: boolean; hideSaidAt: number;
  /** The door: shut, being kicked (the frames), in. */
  door: 'shut' | 'kicking' | 'in'; doorT: number; block: Block | null;
  wasGrounded: boolean; lastVy: number; lastShoot: boolean; lastJump: boolean; lastMove: boolean;
  /** This life's one free loud thing (a shot or a charge move): nothing hears it; he catches himself. Then a couple
   *  of seconds' grace (a rapid-fire weapon's next few shots, a held trigger: still the one warning), the frame it
   *  started; past it, the next one's his death (the noise ambush, and there's no hiding from it: `doom`). */
  warned: boolean; freeMove: boolean; warnedAt: number; doom: boolean;
  /** His weapon's wait between shots, last frame (it going up: a shot fired). */
  lastCd: number;
  /** The kill: the camera in on it (0..1). */
  cam: number;
  /** The hiding spot she tore open on him (seen getting in), -1 none: gutted, its door gone. */
  torn: number;
  /** Frames till she's next seen going by in the foreground (between her real goes, to keep him sweating). */
  fgNext: number;
  /** On her way to a way out (a vent, a duct) to leave by. */
  leaving: boolean;
  /** The goes he has to hide through: each stretch's trigger (rolled each life), the point past which she's out for it
   *  no matter what (FORCE), and whether he's hidden through it. */
  win: { a: number; b: number; at: number; force: number; done: boolean }[];
  /** This scurry's a stretch's go: she runs along the ceiling to the one spot picked at its start (fx, on level flvl) and
   *  drops there, no re-aiming. */
  forced: boolean; fx: number; flvl: 0 | 1;
  /** Out on a stretch's go (from its scurry till she's climbed back out): nothing pulls her off it for another. */
  committed: boolean;
  /** He's been hidden with her near, this go; the frame she last went (the breather's from then). */
  hidNear: boolean; goneAt: number;
  /** The stairs' panic run (heard, never seen till she has him): frames in, the furthest he's got (x), frames since he
   *  last got further, where she is behind him (x, unseen), and her lunge on (he stopped, or turned back). */
  chase: { t: number; best: number; still: number; herX: number; lunge: boolean } | null;
  /** A stretch's go comes one of two ways, taking turns (the user's: "the player has to identify a back or front
   *  ambush, like recognizing mechanics for a boss fight"): from in FRONT, she's up on the ceiling first, crawling in
   *  where he can see her, then down in front of him; from BEHIND, she sprints at him out of the dark behind, her red at
   *  that edge growing as she comes (`rush`). Which the next is; how long she's been seen on the ceiling this crawl (a
   *  front one doesn't drop till she has been). (His noise's ambush is its own, as it was.) */
  rush: boolean; nextBack: boolean; ceilSeen: number;
  /** The back ambush's wind-up (frames of it so far; RUSH_WIND, she's sprinting) and the side she's coming from. */
  rushT: number; rushSide: 1 | -1;
  /** A front ambush's tell (its length: the pass, then the drop); 0 otherwise. */
  frontT: number;
  /** This go's the back ambush's (lost him: she snoops about a good while before she goes). */
  wasRush: boolean;
}
export const makeHunter = (state: GameState): Hunter => {
  const cx = state.player.pos.x + state.player.width / 2;
  return {
    init: false, mode: 'away', t: 0, x: 0, y: BF, lvl: 0, dir: -1, speed: 1.5, path: [], leg: 0, sniff: 0,
    entry: 'vent', huntOnDrop: false, leap: null,
    next: 360, out: 0, lastSeen: -9999, lastX: cx,
    opened: cx > B + 620, finale: false, fake: null, rattle: null, fg: null,
    noise: 0, hid: -1, hidT: 0, torn: -1, fgNext: 420, leaving: false, heart: 0, passedClose: false,
    saidDark: cx > B + 400, saidSpot: cx > B + 700, saidGun: false, hideSaidAt: -99999,
    door: state.stageMemo[DOOR_MEMO] ? 'in' : 'shut', doorT: 0, block: null,
    wasGrounded: true, lastVy: 0, lastShoot: false, lastJump: false, lastMove: false, warned: false, freeMove: false, warnedAt: -9999, doom: false, lastCd: 0,
    cam: 0,
    win: WINDOWS.map(([a, b, force]) => ({ a, b, force, at: rnd(a, force), done: false })), forced: false, fx: 0, flvl: 0, committed: false, hidNear: false, goneAt: -9999,
    chase: null, rush: false, nextBack: false, ceilSeen: 0, rushT: 0, rushSide: -1, frontT: 0, wasRush: false,
  };
};
export const buildHunter = (state: GameState, h: Hunter) => {
  if (h.door === 'in') return;
  h.block = { x: DOOR_X - 20, y: -4000, w: 40, h: 4000 + GY, type: 'wall', hidden: true, tag: 'disco-door' } as Block;
  state.blocks.push(h.block);
};
export const doorIn = (h: Hunter) => h.door === 'in';
/** In already (back at the boss's checkpoint outside the disco's door, or a fresh start there: the checkpoint's set
 *  after the build): the door down, and she's done with (the chase was over at the kick: nothing of hers on the
 *  landing or the stairs). */
export const forceDoorIn = (state: GameState, h: Hunter) => {
  to(h, 'away'); h.next = 1e9; h.finale = true; h.fg = null; h.rattle = null; h.fake = null;
  if (h.door === 'in') return;
  h.door = 'in'; state.stageMemo[DOOR_MEMO] = '1';
  if (h.block) { state.blocks = state.blocks.filter(b => b !== h.block); h.block = null; }
};
export const doorKicking = (h: Hunter) => h.door === 'kicking';

const pmid = (state: GameState) => state.player.pos.x + state.player.width / 2;
const pfeet = (state: GameState) => state.player.pos.y + state.player.height;
/** Which level he's on (or between: on a ladder, a pipe, in the air). */
const plevel = (state: GameState): 0 | 1 | -1 => {
  const f = pfeet(state), x = pmid(state);
  if (onLadder(state) || !state.player.isGrounded) return Math.abs(f - CATWALK_Y) < 30 && catwalkAt(x) ? 1 : Math.abs(f - floorY(x)) < 30 ? 0 : -1;
  return Math.abs(f - CATWALK_Y) < 8 ? 1 : Math.abs(f - floorY(x)) < 12 ? 0 : -1;
};
const inPlay = (h: Hunter) => h.mode !== 'away' && h.mode !== 'tell';
const to = (h: Hunter, m: Mode) => { h.mode = m; h.t = 0; if (m === 'away') { h.committed = false; h.wasRush = false; } if (m !== 'ceil') h.ceilSeen = 0; if (m !== 'hunt') h.rush = false; };
const vol = (state: GameState, x: number, k: number) => Math.max(0, k * (1 - Math.abs(x - pmid(state)) / 1000));

// ---------------------------------------------------------------------------------------------------------------
// Each frame (the stage's controls in; what the engine gets out, or null: his own)

export const tickHunter = (ctx: FrameContext, h: Hunter, controls: Controls): Controls | null => {
  const { state } = ctx, p = state.player, cx = pmid(state);
  if (cx < B - 60 || cx > DOOR_X + 40 && h.door !== 'kicking') return null;
  // (the tunnels' hum and drips never under the disco's fight, right by the door: bossQuiet.ts)
  if (inBossFight(state)) return null;
  if (!h.init) {
    h.init = true;
    h.opened = h.opened || cx > B + 620;
    h.saidDark = h.saidDark || cx > B + 400; h.saidSpot = h.saidSpot || cx > B + 700; h.lastX = cx;
    // (the stretches behind where he starts (a checkpoint): done; the rest still owed)
    for (const w of h.win) w.done = w.b < cx + 100;
  }
  h.t++;
  if (h.door === 'kicking') return kick(ctx, h);
  // The ambience: hum, drips, the pipes, her far off
  ambience(state, h);
  if (!h.saidDark && cx > B + 420 && p.isGrounded) { h.saidDark = true; meatheadSays(state, pick(L.MH_DARK), false); }
  // Hiding: up at a spot (on its level, his feet down, not in the middle of anything)
  const spot = HIDES.findIndex(s => Math.abs(s.x - cx) < 36 && Math.abs(s.y - pfeet(state)) < 10);
  let out: Controls | null = null;
  if (h.mode !== 'kill' && p.health > 0) {
    if (spot >= 0 && h.hid < 0) setUi({ holdUpPrompt: 'HIDE' });
    if (spot >= 0 && controls.up && p.isGrounded && (h.hid >= 0 || !p.isCharging)) {
      if (h.hid < 0) {
        // (did she see him get in? on her level and looking his way, or right on him: then she knows where he is)
        const sawIt = inPlay(h) && h.mode !== 'leap' && h.mode !== 'crouch' && sees(state, h);
        h.hid = spot; h.hidT = 0;
        playSound('clink', 0.5, -6);
        if (state.frame - h.hideSaidAt > 900) { h.hideSaidAt = state.frame; meatheadSays(state, pick((HIDES[spot].kind === 'locker' ? L.MH_HIDE : L.MH_HIDE_DARK)[dressed(state)]), false); }
        // (in, with her on him and close, or with her watching: she saw that. He's fucked: she comes straight for it)
        if (sawIt || (h.mode === 'hunt' && Math.abs(h.x - cx) < 240 && Math.abs(h.y - pfeet(state)) < 60)) {
          h.hidT = -1;
          if (h.mode !== 'hunt') spotted(state, h);
        }
      }
      h.hidT = h.hidT < 0 ? h.hidT : h.hidT + 1;
      p.hidden = true; p.hiding = true; p.vel.x = 0; p.pos.x += (HIDES[spot].x - cx) * 0.4;
      p.isCharging = false; p.isSliding = false; p.isUppercutting = false; p.isDivekicking = false;
      out = hands();
    } else if (h.hid >= 0) { h.hid = -1; p.hidden = false; p.hiding = false; playSound('clink', 0.4, -2); }
  }
  // (his heart, in there: quicker with her near)
  // (the music's heartbeat carries it now: the low thud pitched down read as a whoosh (the user's))
  if (h.hid >= 0 && --h.heart <= 0) { h.heart = 44; }
  // (his noise only counts in the tunnels: on the stairs (the run, and after it) he's meant to go fast, charging and
  // all; nothing he does there brings her, ambushes him or gets a warning)
  if (!h.finale) hearHim(state, h, controls);
  if (!h.finale) maybeChase(state, h);
  if (h.chase) tickChase(state, h);
  // (past a stretch's FORCE point with its go still owed: whatever she's off doing out of his sight (a go of her own
  // somewhere, not on him) she drops it for this; nothing's popped off the screen)
  if (!h.finale && h.opened && !h.forced && !h.committed && h.hid < 0 && (h.mode === 'tell' || h.mode === 'prowl' || h.mode === 'search')
    && h.win.some(w => !w.done && cx >= w.force) && state.frame - h.goneAt >= FORCE_BREATHER
    && (h.x < state.camera.x - 80 || h.x > state.camera.x + CANVAS_WIDTH + 80)) { to(h, 'away'); h.leaving = false; h.rattle = null; }
  if (h.mode === 'away') schedule(state, h);
  runHer(ctx, h);
  if (h.mode !== 'kill') h.cam = Math.max(0, h.cam - 0.03);
  return out;
};

/** Her screech, kept rare (the user: the stalk had too many whooshing noises): none within `gap` frames of the last. The
 *  tells and the kill screech go straight to playSound (always heard). */
let lastScreech = -9999;
const screech = (state: GameState, v: number, pitch: number, gap = 300) => {
  if (state.frame - lastScreech < gap) return;
  lastScreech = state.frame; playSound('screams', v, pitch);
};

const ambience = (state: GameState, h: Hunter) => {
  const r = Math.random();
  if (r < 1 / 160) playSound('tinkle', 0.15, -4 + Math.random() * 8);
  // (no hum, hiss or far-off screeches under it (the user: too many whooshes): the drips and her skitter carry it)
  // (somewhere off in the vents: a skitter that's her, or isn't)
  if (h.mode === 'away' && Math.random() < 1 / 500) playSound('click', 0.12, -6 + Math.random() * 6);
};

const hearHim = (state: GameState, h: Hunter, controls: Controls) => {
  const p = state.player;
  if (h.hid >= 0) { h.noise *= 0.95; return; }
  let n = 0;
  if (Math.abs(p.vel.x) > 0.5 && p.isGrounded) n += 0.5;
  // (a shot: the trigger pressed, or any weapon going off (its wait between shots starting over: a held trigger's
  // every shot, the crossbow's stream and all))
  const cd = p.shootCooldown ?? 0, went = cd > h.lastCd; h.lastCd = cd;
  const shot = (!!controls.shoot && !h.lastShoot) || went, moving = p.isCharging || p.isSliding || p.isUppercutting || p.isDivekicking, moveStart = moving && !h.lastMove;
  // (the first loud thing this life, a shot or a charge move: nothing hears it; he catches himself, whispering. One
  // warning a life, the two shared; after it, every one counts)
  if (!h.warned && (shot || moveStart)) {
    h.warned = true; h.freeMove = !shot; h.warnedAt = state.frame;
    meatheadSays(state, pick(shot ? L.MH_WARN_SHOOT : L.MH_WARN_MOVE), false);
  } else if (state.frame - h.warnedAt < WARN_GRACE) {
    // (the grace after his warning: nothing more hears him yet)
  } else {
    // (loud past his one warning: she's on it, down out of the ceiling right in front of him, screeching; a moment to
    // hide in (she's not looking yet), then she's on him)
    if ((shot || (moveStart && !h.freeMove)) && h.opened && !h.finale && !['hunt', 'kill', 'ambush', 'leap', 'crouch'].includes(h.mode)) { ambush(state, h); h.doom = true; }
    if (shot) {
      n += 45;
      if (inPlay(h) && !h.saidGun) { h.saidGun = true; meatheadSays(state, pick(L.MH_USELESS), false); }
    }
    if (moving && !h.freeMove) n += moveStart ? 30 : 2.5;
  }
  if (controls.jump && !h.lastJump && p.isGrounded) n += 14;
  if (!h.wasGrounded && p.isGrounded && h.lastVy > 7) n += 40;
  h.lastShoot = !!controls.shoot; h.lastJump = !!controls.jump; h.wasGrounded = p.isGrounded; h.lastVy = p.vel.y; h.lastMove = moving;
  if (!moving) h.freeMove = false;
  h.noise = h.noise * 0.97 + n;
  // (loud with her out and in earshot: she comes to it, on her level; on his level already, faster)
  if (n >= 14 && (h.mode === 'prowl' || h.mode === 'search') && Math.abs(h.x - pmid(state)) < 800) {
    h.path = [{ x: clampLvl(h, pmid(state)), stop: 90 }, ...h.path.slice(h.leg)]; h.leg = 0; to(h, 'prowl'); h.speed = Math.max(h.speed, 2.6);
    playSound('screams', 0.3, -6);
  }
};

/** The ambush (his noise: the special case, as it always was): how far in front of him she comes down, how long she
 *  screeches (his window to hide) before she's on him. */
const AMBUSH_AHEAD = 230, AMBUSH_T = 60;
/** After his one warning: this long (frames) before any more noise counts (the user's: "give it a couple seconds, to
 *  make sure rapid fire weapons like the crossbow don't immediately trigger it"). */
const WARN_GRACE = 120;
const ambush = (state: GameState, h: Hunter) => {
  h.leaving = false;
  const cx = pmid(state), dir = (state.player.facing || 1) as 1 | -1, lv = plevel(state);
  h.lvl = lv === 1 && catwalkAt(cx) ? 1 : 0;
  h.x = cx + dir * AMBUSH_AHEAD; h.x = clampLvl(h, h.x);
  if (Math.abs(h.x - cx) < 120) { h.x = cx - dir * AMBUSH_AHEAD; h.x = clampLvl(h, h.x); }
  h.y = levelY(h.lvl, h.x); h.dir = h.x > cx ? -1 : 1; h.entry = 'vent';
  h.fg = null; h.rattle = null; h.fake = null; h.path = []; h.leg = 0; h.forced = false;
  to(h, 'ambush');
  playSound('clang', 1, -6); playSound('screams', 0.9, -4); shakeScreen(state, 8, 4); dust(state, h.x, CEIL_B + 4, 10);
};
/** A stretch's go from BEHIND (the back ambush): how far back she bursts out, the least room it needs, her sprint's
 *  top speed (under her hunt's: a race he can read), and how near him a hiding spot has to be for it. */
// (the user's: "5 seconds of increasing glowing intensity until it sprints on screen"): RUSH_WIND frames of her coming
// (off the screen behind him, kept there, unseen: the red at that edge and her sounds swelling), then the sprint in
// from just off it (RUSH_FROM) at RUSH_TOP
const RUSH_WIND = 300, RUSH_FROM = CANVAS_WIDTH / 2 + 170, RUSH_MIN = CANVAS_WIDTH / 2 + 100, RUSH_TOP = 12, RUSH_COVER = 340;
const rushGo = (state: GameState, h: Hunter) => {
  const cx = pmid(state), dir = (state.player.facing || 1) as 1 | -1, lv = plevel(state);
  const lvl: 0 | 1 = lv === 1 && catwalkAt(cx) ? 1 : 0, y = lvl ? CATWALK_Y : BF;
  // (her level's ends where he is: she's away, nowhere yet)
  h.lvl = lvl; h.x = cx;
  const x = clampLvl(h, cx - dir * RUSH_FROM);
  if (Math.abs(x - cx) < RUSH_MIN) return false;
  if (!HIDES.some((sp, i) => i !== h.torn && Math.abs(sp.y - y) < 10 && Math.abs(sp.x - cx) < RUSH_COVER)) return false;
  h.fake = null; h.fg = null; h.rattle = null; h.path = []; h.leg = 0; h.sniff = 0; h.leaving = false;
  h.out = 0; h.passedClose = false; h.hidNear = false; h.forced = false; h.committed = true;
  h.x = x; h.y = levelY(lvl, x); h.dir = x > cx ? -1 : 1; h.entry = 'duct';
  to(h, 'hunt'); h.rush = true; h.wasRush = true; h.rushT = 0; h.rushSide = (x < cx ? -1 : 1); h.lastSeen = state.frame; h.lastX = cx;
  // (behind him in the dark: a grille banged out, her screech, and she's coming flat out)
  playSound('clang', 0.8, -6); playSound('screams', 0.9, -4); shakeScreen(state, 4, 2);
  return true;
};

/** Her x kept on her level (a catwalk's ends; the basement's). */
const clampLvl = (h: Hunter, x: number) => {
  if (h.lvl === 1) { const cw = catwalkAt(h.x) ?? CATWALKS[0]; return Math.max(cw[0] + 30, Math.min(cw[1] - 30, x)); }
  return Math.max(B + 40, Math.min(STAIRS_B - 20, x));
};

// ---------------------------------------------------------------------------------------------------------------
// Her schedule: out again when she likes (sooner if he's loud), from where she likes

/** The stretches he has to hide through (x): each a go of hers he can't get by without a hiding spot: [from, to, FORCE].
 *  Each go comes by his progress, never a clock he can outrun: past its trigger (rolled each life, from the stretch's
 *  start to its FORCE) with a breather since her last go, or past FORCE with only FORCE_BREATHER since (whatever she's off
 *  doing out of sight dropped for it). Her spot's picked once, at the start: FORCE_STAND ahead of where he'll be after
 *  SCURRY_RUN frames at the speed he's going (forward only), and she starts that run's length further on (off the screen
 *  ahead) and scuttles back toward him to it at SCURRY, so they meet there: walking (PLAYER_MOVE_SPEED 4.44) she drops
 *  ~600 in front of him; stopped, ~860; charging flat out (CHARGE_SPEED 14.4, ~860 in the run) still ~600 if he keeps
 *  it up, and if he outruns even that she drops where she's got to (behind him) rather than starting over. The FORCE
 *  points keep the spot clear of the stairs' foot even at a flat-out charge (FORCE + 860 + 600 short of STAIRS_A - 30)
 *  for the first three; the last (right before the stairs) is in front of anyone not charging the whole way. */
const WINDOWS: [number, number, number][] = [[B + 1650, B + 2550, B + 2150], [B + 3000, B + 4300, B + 3700], [B + 4500, B + 5500, B + 4700], [B + 5800, B + 6150, B + 5800]];
/** Frames after she's gone before she's out for an owed go (never two back to back); on the last stretch, shorter; past
 *  a stretch's FORCE, just this beat. */
const BREATHER = 300, BREATHER_LAST = 150, FORCE_BREATHER = 90;
/** A stretch's go: at the drop, how far ahead of him she lands (aimed for, the least, the most; the least right at the
 *  stairs' foot), and how far behind him a hiding spot counts as in reach (a hiding spot's needed from there to 200 short
 *  of her, on his level). */
const FORCE_STAND = 600, FORCE_MIN = 480, FORCE_MAX = 820, FORCE_END_MIN = 320, FORCE_BACK = 380;
/** Her run along the ceiling (her old way in for a stretch's go, before the front ambush's pass: kept for a crawl
 *  already on): the most it lasts (then she drops where she is). */
const SCURRY_T = 150;
/** ...and seen first: up there on the screen (this far in from its edges) this many frames before she drops, coming on
 *  in no nearer him than CEIL_NEAR for it; the most the crawl can take then. */
const CEIL_IN = 60, CEIL_SEEN = 45, CEIL_NEAR = 300, SCURRY_T_MAX = SCURRY_T + 110;
const owed = (h: Hunter) => h.win.some(w => !w.done);
/** The front ambush, down: slow, peeking about (the user's: "slow moving ones where it peeks around for a bit, you
 *  generally will need to hide longer for those"): her walk, and her way, from in front of him (`ahead`: the side she's
 *  on) toward him and past, stopping to sniff and look about, back over it, on past again. */
const PEEK_SPEED = 1.25;
const peekPath = (h: Hunter, cx: number, ahead: 1 | -1) => [
  { x: clampLvl(h, cx + ahead * 140), stop: rnd(80, 130) },
  { x: clampLvl(h, cx - ahead * 160), stop: rnd(90, 140) },
  { x: clampLvl(h, cx + ahead * 60), stop: rnd(70, 110) },
  { x: clampLvl(h, cx - ahead * 480), stop: rnd(40, 80) },
];
/** Hidden through a go of hers: it pays the first stretch still owed that he's in or past. */
const paid = (h: Hunter, cx: number) => { const w = h.win.find(v => !v.done && v.a <= cx + 300); if (w) w.done = true; };

/** An owed go: her spot picked now, once (FORCE_STAND ahead of where he'll be when she gets there, a hiding spot in his
 *  reach), and her out on the ceiling ahead of it (off the screen; from where she already is, if she's off it out there),
 *  scuttling back toward him to it; her claws and her red lead in from ahead. False: not now (on a ladder, in the air). */
const forceGo = (state: GameState, h: Hunter) => {
  const cx = pmid(state), lv = plevel(state);
  if (lv < 0 || onLadder(state)) return false;
  // (they take turns (the user's: "the player has to identify a back or front ambush"): this one from behind, if
  // there's the room and a hiding spot near him for it)
  if (h.nextBack) { h.nextBack = false; if (rushGo(state, h)) return true; } else h.nextBack = true;
  // (in front: the pass over the pipes, then down in front of him)
  const a = forceAim(state, h, cx);
  // (no room for one in front of him (the stairs' foot just ahead): from behind instead, the sprint; a front one never
  // comes down behind him)
  if ((a.x - cx) * ((state.player.facing || 1) as number) < 180 && rushGo(state, h)) return true;
  frontGo(state, h, a.x, a.lvl === 1 && lv === 1 ? 1 : 0, true);
  return true;
};

/** The FRONT ambush (the user's: its tell is her "crawling across the top" in the foreground, "very quickly", and
 *  "very shortly after that jump in front of you"): her silhouette over the near pipes, fast, his way; then down out of
 *  the ceiling in front of him at x (kept on the screen: the drop's seen; she's out of nowhere only off it), on level
 *  lvl, slow, peeking about (peekPath). `forced`: a stretch's go (committed to it). */
// (the playtest: 50 and 14 wanted "ninja reaction times": slowed a fair way)
const FRONT_PASS = 95, FRONT_DROP = FRONT_PASS + 40, FRONT_IN = 150;
const frontGo = (state: GameState, h: Hunter, x: number, lvl: 0 | 1, forced: boolean) => {
  const cx = pmid(state), ahead = (state.player.facing || 1) as 1 | -1, camL = state.camera.x;
  if ((x - cx) * ahead < 180) x = cx + ahead * 300;
  h.fake = null; h.rattle = null; h.path = []; h.leg = 0; h.sniff = 0; h.leaving = false; h.huntOnDrop = false;
  h.out = 0; h.passedClose = false; h.hidNear = false; h.forced = false; h.committed = forced;
  h.lvl = lvl;
  h.x = clampLvl(h, Math.max(camL + FRONT_IN, Math.min(camL + CANVAS_WIDTH - FRONT_IN, x)));
  if (Math.abs(h.x - cx) < 180) h.x = clampLvl(h, cx + ahead * 260);
  h.y = levelY(lvl, h.x); h.entry = 'vent'; h.dir = h.x > cx ? -1 : 1;
  h.fg = { t: 0, dir: ahead, len: FRONT_PASS };
  to(h, 'tell'); h.frontT = FRONT_DROP;
  playSound('click', 0.6, 4); playSound('screams', 0.5, -6);
};

/** Where a stretch's go comes down, against where he'll be (cx): its x and level. */
const forceAim = (state: GameState, h: Hunter, cx: number) => {
  const lv = plevel(state), cw = lv === 1 ? catwalkAt(cx) : null;
  const lvl: 0 | 1 = cw && cw[1] - 30 - cx >= FORCE_MIN ? 1 : 0;
  const hi = lvl ? cw![1] - 30 : STAIRS_A - 30, room = hi - cx;
  const ys = [lvl ? CATWALK_Y : BF, lv === 1 ? CATWALK_Y : BF];
  const cover = (x: number) => HIDES.some((sp, i) => i !== h.torn && ys.some(y => Math.abs(sp.y - y) < 10) && sp.x > cx - FORCE_BACK && sp.x < x - 200);
  let x: number;
  if (room >= FORCE_END_MIN) {
    let d = Math.min(FORCE_STAND, room);
    for (let k = Math.min(FORCE_MIN, room); k <= Math.min(FORCE_MAX, room); k += 20) if (cover(cx + k)) { d = k; if (k >= Math.min(FORCE_STAND, room)) break; }
    x = cx + d;
  } else x = Math.max(B + 40, cx - FORCE_STAND);
  return { x, lvl };
};

/** A stretch's go, at the drop: her down right where she is (her spot, or wherever the cap caught her; behind him if he
 *  outran her), on the level picked (the floor if there's no catwalk under her, or he's past her); facing him, coming
 *  his way and on past. Never moved. */
const landForced = (state: GameState, h: Hunter) => {
  const cx = pmid(state), x = Math.max(B + 40, Math.min(STAIRS_A - 30, h.x));
  h.lvl = h.flvl === 1 && x >= cx && catwalkAt(x) ? 1 : 0; h.x = x; h.y = levelY(h.lvl, x); h.entry = 'ceil'; h.dir = cx < x ? -1 : 1;
  h.rattle = null;
  const on = Math.sign(cx - x) || -1;
  h.path = peekPath(h, cx, (-on) as 1 | -1); h.speed = PEEK_SPEED;
  h.leg = 0; h.sniff = 0;
};

const schedule = (state: GameState, h: Hunter) => {
  const p = state.player, cx = pmid(state);
  if (p.health <= 0 || state.deathTimer > 0 || p.inCutscene) return;
  // (the opener: the teaching one, ahead of him, coming his way slowly, lockers right there)
  if (!h.opened) {
    if (cx > B + 620) {
      h.opened = true;
      emerge(state, h, 0, B + 1400, 'vent', [{ x: B + 120 }], 1.4, true);
    }
    return;
  }
  // (an owed go: its stretch's trigger passed, a breather since her last; on the last stretch, sooner; past its FORCE
  // point, right away (just a beat after her last))
  if (!h.finale) {
    const due = h.win.find(w => !w.done && cx >= w.at), last = cx > WINDOWS[WINDOWS.length - 1][0];
    const wait = h.win.some(w => !w.done && cx >= w.force) ? FORCE_BREATHER : last ? BREATHER_LAST : BREATHER;
    if (due && state.frame - h.goneAt >= wait && forceGo(state, h)) return;
  }
  // (the stairs: the panic run (maybeChase, below))
  if (h.finale) return;
  // (a fake going: the vent rattling for nothing)
  if (h.fake) {
    h.fake.t++;
    if (h.fake.t % 9 === 0) playSound('click', vol(state, h.fake.x, 0.4), -2);
    if (h.fake.t === 60) { playSound('clang', vol(state, h.fake.x, 0.5), -4); dust(state, h.fake.x, CEIL_B + 4, 6); }
    if (h.fake.t > 110) { h.fake = null; h.next = Math.max(h.next, 200); }
    return;
  }
  h.next--;
  // (and between times, every so often, her in the foreground: stalking along the near pipes, over him, on her way
  // somewhere ahead of him; she's not done with him)
  if (!h.fg && --h.fgNext <= 0) { h.fg = { t: 0, dir: Math.random() < 0.7 ? ((p.facing || 1) as 1 | -1) : ((-(p.facing || 1)) as 1 | -1) }; h.fgNext = rnd(360, 600); playSound('click', 0.4, -4); }
  // (his noise, with her away: out sooner, near it)
  if (h.noise > 60) h.next = Math.min(h.next, h.noise > 100 ? 20 : 90);
  if (h.next > 0) return;
  const r = Math.random();
  // (now and then it's nothing: a rattle, or her shape going by over the near pipes and on)
  if (r < 0.12 && h.noise < 60) { h.fake = { x: pickVent(cx + (Math.random() < 0.5 ? -1 : 1) * rnd(200, 500), -1) ?? cx, t: 0 }; h.next = rnd(300, 520); return; }
  if (r < 0.2 && h.noise < 60) { h.fg = { t: 0, dir: Math.random() < 0.5 ? -1 : 1 }; screech(state, 0.25, -10); h.next = rnd(320, 560); return; }
  // (out for real: one of the two ambushes, taking turns with the stretches' goes (the user's: "three ambushes: back
  // ambush, front ambush, noise ambush. only noise ambushes come from above"): from BEHIND, the sprint (if there's the
  // room and a hiding spot near him); else from in FRONT, along the ceiling first, seen crawling in, then down in front
  // of him)
  if (h.nextBack) { h.nextBack = false; if (rushGo(state, h)) { h.committed = false; return; } } else h.nextBack = true;
  const lvl = plevel(state), his: 0 | 1 = lvl === 1 && catwalkAt(cx) ? 1 : 0, ahead = (p.facing || 1) as 1 | -1;
  const at = Math.max(B + 40, Math.min(STAIRS_A - 30, cx + ahead * rnd(320, 420)));
  if (Math.abs(at - cx) < 200) { h.next = 60; return; }
  frontGo(state, h, at, his, false);
};

/** A vent near x (on a catwalk, for the catwalks: `lvl` 1; any: -1). */
const pickVent = (x: number, lvl: 1 | -1) => {
  const ok = VENTS.filter(v => lvl < 0 || !!catwalkAt(v));
  if (!ok.length) return null;
  return ok.reduce((a, v) => (Math.abs(v - x) < Math.abs(a - x) ? v : a));
};

/** She's coming: the tell first (her clicks nearer, the vent rattling, a screech), then out. */
const emerge = (state: GameState, h: Hunter, lvl: 0 | 1, from: number, entry: Entry, path: { x: number; stop?: number }[], speed: number, opener: boolean) => {
  h.lvl = lvl; h.x = from; h.y = levelY(lvl, from); h.entry = entry; h.huntOnDrop = false;
  h.path = path.map(q => ({ ...q, x: lvl ? Math.max((catwalkAt(from) ?? [from, from])[0] + 30, Math.min((catwalkAt(from) ?? [from, from])[1] - 30, q.x)) : Math.max(B + 40, Math.min(STAIRS_A - 30, q.x)) }));
  h.leg = 0; h.speed = speed; h.out = 0; h.passedClose = false; h.hidNear = false; h.forced = false;
  h.fg = opener ? { t: 0, dir: from > pmid(state) ? -1 : 1 } : null;
  h.rattle = { x: from, t: 0 };
  h.dir = pmid(state) < from ? -1 : 1;
  to(h, 'tell');
  playSound('screams', opener ? 0.35 : 0.3, -8);
};

// ---------------------------------------------------------------------------------------------------------------
// Her, each frame

const runHer = (ctx: FrameContext, h: Hunter) => {
  const { state } = ctx, p = state.player, cx = pmid(state);
  if (h.fg) { h.fg.t++; if (h.fg.t > (h.fg.len ?? 170)) h.fg = null; }
  if (h.rattle) { h.rattle.t++; if (h.rattle.t > 160) h.rattle = null; }
  if (inPlay(h)) h.out++;
  // (hidden with her out and near (and not seen getting in): a go he's hidden through)
  if (inPlay(h) && h.mode !== 'kill' && h.hid >= 0 && h.hidT >= 0 && Math.abs(h.x - cx) < 450) h.hidNear = true;
  switch (h.mode) {
    case 'away': return;
    case 'tell': {
      // (her clicks getting nearer, the vent (or the duct) rattling, dust down out of it; a screech; then out)
      const T = h.frontT ? h.frontT : h.finale ? 70 : 120;
      if (h.t % 10 === 0) playSound('click', vol(state, h.x, 0.25 + h.t / 400), -2);
      if (h.fg && h.fg.t === 40 && !h.saidSpot) { h.saidSpot = true; meatheadSays(state, pick(L.MH_SPOT), false); }
      if (h.t % 14 === 0) dust(state, h.x, h.entry === 'duct' ? h.y - 70 : CEIL_B + 4, 3);
      if (h.t === T - 30) { playSound('clang', vol(state, h.x, 0.6), -4); shakeScreen(state, 2, 2); }
      if (h.t >= T) {
        if (h.entry === 'ceil') { to(h, 'ceil'); h.y = CEIL_B; playSound('thud', vol(state, h.x, 0.5), -10); }
        else {
          // (the front ambush: down in front of him, then slow, peeking about)
          if (h.frontT) { h.frontT = 0; h.path = peekPath(h, cx, (Math.sign(h.x - cx) || 1) as 1 | -1); h.leg = 0; h.speed = PEEK_SPEED; playSound('screams', 0.7, -4); }
          to(h, 'drop'); playSound('thud', vol(state, h.x, 0.8), -8);
        }
      }
      return;
    }
    case 'ceil': {
      if (h.forced) {
        // (a stretch's go: scuttling along the ceiling upside down to the one spot picked at the start, no re-aiming;
        // her claws on it, heard as near wherever she is; there (or out of time), down where she is)
        // (and never down before he's seen her up there a while (the user's: the front ambush's tell is the ceiling
        // crawl): her spot off the screen, she comes on in over him till she has been, no nearer than CEIL_NEAR)
        const camL = state.camera.x, inView = h.x > camL + CEIL_IN && h.x < camL + CANVAS_WIDTH - CEIL_IN;
        if (inView) h.ceilSeen++;
        const need = h.ceilSeen < CEIL_SEEN, side = Math.sign(h.x - cx) || 1;
        const goal = need && Math.abs(h.fx - cx) > CEIL_NEAR ? clampLvl(h, cx + side * CEIL_NEAR) : h.fx;
        const d = goal - h.x;
        if (Math.abs(d) > 1) { h.dir = d < 0 ? -1 : 1; h.x += Math.sign(d) * Math.min(Math.abs(d), h.speed); }
        if (h.t % 4 === 0) playSound('click', Math.max(0.22, vol(state, h.x, 0.5)), 4);
        if (h.t % 6 === 0) dust(state, h.x, CEIL_B + 10, 2);
        if ((!need && Math.abs(h.x - cx) <= Math.abs(h.fx - cx) + 1) || h.t >= SCURRY_T_MAX) {
          h.forced = false; landForced(state, h); to(h, 'drop'); playSound('thud', Math.max(0.4, vol(state, h.x, 0.8)), -8);
        }
        return;
      }
      // (along the ceiling upside down, over him: the clicks, the dust coming down under her; then she drops, on his
      // level, out in front of him (a beat first: she stops, screeches))
      const over = Math.abs(h.x - cx) < 260;
      if (!over && h.t < 400) { h.dir = cx < h.x ? -1 : 1; h.x += h.dir * 2.4; }
      if (h.t % 7 === 0) playSound('click', vol(state, h.x, 0.5), 2);
      if (h.t % 8 === 0) dust(state, h.x, CEIL_B + 10, 2);
      if (over || h.t >= 400) {
        if (!h.sniff) { h.sniff = 1; screech(state, vol(state, h.x, 0.6) + 0.2, -6); }
        if (++h.sniff > 34) {
          h.sniff = 0;
          // (down in front of him, on his level, far enough off to do something about it)
          const lv = plevel(state), lvl: 0 | 1 = lv === 1 ? 1 : 0, ahead = (p.facing || 1) as 1 | -1;
          h.lvl = lvl; h.x = lvl ? Math.max((catwalkAt(cx) ?? [cx, cx])[0] + 30, Math.min((catwalkAt(cx) ?? [cx, cx])[1] - 30, cx + ahead * 280)) : Math.max(B + 40, Math.min(STAIRS_A - 30, cx + ahead * 280));
          if (Math.abs(h.x - cx) < 200) h.x = Math.max(B + 40, Math.min(STAIRS_A - 30, cx - ahead * 280));
          h.y = levelY(lvl, h.x); h.path = peekPath(h, cx, ahead); h.leg = 0; h.speed = PEEK_SPEED;
          to(h, 'drop');
        }
      }
      return;
    }
    case 'drop':
      h.dir = cx < h.x ? -1 : 1;
      if (h.t === 16) { playSound('land', vol(state, h.x, 0.9), -10); shakeScreen(state, 4, 3); dust(state, h.x, h.y - 4, 8); }
      if (h.t >= 22) {
        if (h.huntOnDrop) { to(h, 'hunt'); h.lastSeen = state.frame; playSound('roar', 0.8, -8); meatheadSays(state, pick(L.MH_SEEN), false); }
        else to(h, 'prowl');
      }
      return;
    case 'prowl': {
      const tgt = h.path[h.leg];
      if (!tgt || (h.out > 900 && !h.leaving)) { leave(h); return; }
      // (her way kept to her level: at its end (the stairs, the wall), she's there; she turns, she doesn't walk into it)
      const dx = clampLvl(h, tgt.x) - h.x;
      if (Math.abs(dx) > 4) { h.dir = dx < 0 ? -1 : 1; h.x += h.dir * Math.min(Math.abs(dx), h.speed); h.sniff = 0; }
      else if ((h.sniff += 1) >= (tgt.stop ?? 0)) {
        h.leg++; h.sniff = 0;
        // (at the way out she was heading for: up it)
        if (h.leaving && h.leg >= h.path.length) { leave(h); return; }
        // (the end of her way: now and then she doubles back a stretch before she goes)
        if (h.leg >= h.path.length && Math.random() < 0.3 && h.out < 600) h.path.push({ x: clampLvl(h, h.x - h.dir * rnd(250, 450)), stop: rnd(30, 90) });
      } else if (h.sniff % 30 === 0) { h.dir = (-h.dir) as 1 | -1; if (h.sniff % 90 === 0) playSound('snort', 0.3 + vol(state, h.x, 0.25), -4); }
      h.x = clampLvl(h, h.x); h.y = levelY(h.lvl, h.x);
      steps(state, h, 24);
      if (sees(state, h)) spotted(state, h);
      else if (senses(state, h)) { h.dir = cx < h.x ? -1 : 1; startLeap(state, h, 'hunt'); }
      if (h.hid >= 0 && Math.abs(h.x - cx) < 260) h.passedClose = true;
      break;
    }
    case 'hunt': hunting(ctx, h); break;
    case 'ambush':
      // (down, rearing, screeching at him: not looking yet; then she's on him, or, hidden, she's lost him right there)
      if (h.t === 14) { playSound('land', 0.9, -10); shakeScreen(state, 5, 3); dust(state, h.x, h.y - 4, 8); }
      if (h.t % 20 === 15) screech(state, 0.5, -2, 150);
      if (h.t >= AMBUSH_T) {
        // (past his warning: she heard exactly where he is; in a locker or not, she has him)
        if (h.hid >= 0 && h.doom) { h.hidT = -1; spotted(state, h); }
        else if (h.hid >= 0) { to(h, 'search'); h.path = [{ x: clampLvl(h, cx), stop: 160 }]; h.speed = 1.8; }
        else spotted(state, h);
      }
      break;
    case 'search': {
      const tgt = h.path[0];
      const sx = tgt ? clampLvl(h, tgt.x) : h.x;
      if (tgt && Math.abs(sx - h.x) > 4) { h.dir = sx < h.x ? -1 : 1; h.x += h.dir * Math.min(h.speed, Math.abs(sx - h.x)); }
      else if (h.t % 30 === 0) { h.dir = (-h.dir) as 1 | -1; if (h.t % 90 === 0) playSound('snort', 0.4, -4); }
      h.x = clampLvl(h, h.x); h.y = levelY(h.lvl, h.x);
      steps(state, h, 26);
      if (h.hid >= 0 && Math.abs(h.x - cx) < 300) h.passedClose = true;
      if (sees(state, h)) spotted(state, h);
      // (the back ambush lost him: she snoops about a good while (the user's: "he still snoops around for back ambushes
      // too"), a step this way and that)
      if (h.t > (h.wasRush ? 300 : 220)) leave(h);
      break;
    }
    case 'crouch':
      // (the leap's tell: down on her haunches, the screech)
      if (h.t === 1) { playSound('screams', 0.6, -4); playSound('click', 0.6, 8); }
      if (h.t >= 24 && h.leap) { to(h, 'leap'); playSound('whoosh', 0.9, -8); }
      break;
    case 'leap': {
      const lp = h.leap!;
      // (the stairs' lunge: quicker, and at him wherever he's got to)
      const lunge = !!h.chase?.lunge;
      if (lunge) { lp.x1 = cx - 46; lp.y1 = levelY(0, lp.x1); }
      const k = Math.min(1, h.t / (lunge ? LUNGE_T : 30));
      h.x = lp.x0 + (lp.x1 - lp.x0) * k;
      h.y = lp.y0 + (lp.y1 - lp.y0) * k - Math.sin(k * Math.PI) * (lunge ? 60 : 90);
      if (k >= 1) {
        h.lvl = lp.lvl; h.y = lp.y1; h.leap = null;
        if (lp.then === 'kill') { if (p.health > 0 && state.deathTimer <= 0) startKill(state, h); else to(h, 'away'); return; }
        playSound('land', vol(state, h.x, 0.9), -10); shakeScreen(state, 5, 3); dust(state, h.x, h.y - 4, 6);
        to(h, lp.then); h.lastSeen = state.frame;
        if (lp.then === 'prowl') { h.path = [{ x: clampLvl(h, cx), stop: 60 }]; h.leg = 0; }
      }
      break;
    }
    case 'climb':
      // (the crouch, then up: a whoosh, a bang up in the ceiling as she goes through it)
      if (h.t === CLIMB_CROUCH) playSound('whoosh', vol(state, h.x, 0.7), -6);
      if (h.t === CLIMB_CROUCH + 8) { playSound('clang', vol(state, h.x, 0.5), -2); dust(state, h.x, CEIL_B + 4, 6); }
      if (h.t >= CLIMB_T) {
        to(h, 'away'); h.next = h.finale ? 9999 : rnd(200, 380); h.goneAt = state.frame;
        if (h.hidNear) paid(h, cx);
        h.hidNear = false;
        if (h.passedClose && p.health > 0) meatheadSays(state, pick(L.MH_PASSED), false);
        h.passedClose = false;
      }
      return;
    case 'kill': killing(ctx, h); return;
  }
  // Touched (on her level, him not hidden): one shot
  if (h.hid < 0 && p.health > 0 && state.deathTimer <= 0 && h.mode !== 'leap' && h.mode !== 'crouch' && Math.abs(h.x - cx) < 48 && Math.abs(pfeet(state) - h.y) < 70) startKill(state, h);
};

/** Off she goes (the user's: "when it 'despawns' it jumps up offscreen"): from where she stands, a crouch and a leap
 *  straight up, past the ceiling and off the top of the screen, into the dark up there. */
const leave = (h: Hunter) => {
  h.leaving = false; h.path = []; h.leg = 0; h.sniff = 0;
  to(h, 'climb'); h.entry = 'vent';
};

/** She sees him: on her level, in front of her and near enough (or right on her), not hidden. */
const sees = (state: GameState, h: Hunter) => {
  const p = state.player, dx = pmid(state) - h.x;
  if (h.hid >= 0 || p.health <= 0 || p.inCutscene || h.mode === 'ambush') return false;
  if (Math.abs(pfeet(state) - h.y) > 70) return false;
  return Math.abs(dx) < 110 || (Math.abs(dx) < 380 && Math.sign(dx) === h.dir);
};
/** She knows he's right over her, or under her (close, moving, not hidden): up (or down) after him. */
const senses = (state: GameState, h: Hunter) => {
  const p = state.player, lv = plevel(state);
  if (h.hid >= 0 || p.health <= 0 || lv < 0 || lv === h.lvl) return false;
  // (walking's quiet: going on past her a level up (or down) is the way by her that isn't hiding; a jump, a hard
  // landing, a shot near her, and she's up after him)
  return Math.abs(pmid(state) - h.x) < 150 && h.noise > 8;
};
const spotted = (state: GameState, h: Hunter) => {
  h.leaving = false;
  to(h, 'hunt'); h.lastSeen = state.frame;
  playSound('roar', 0.9, -6); shakeScreen(state, 4, 2);
  meatheadSays(state, pick(L.MH_SEEN), false);
};

/** Up or down a level, to him: the crouch (the tell), then the leap, landing short of him. */
const startLeap = (state: GameState, h: Hunter, then: Mode) => {
  const cx = pmid(state), lv = plevel(state), lvl: 0 | 1 = lv === 1 ? 1 : 0;
  if (lvl === h.lvl) return;
  let x1 = cx - Math.sign(cx - h.x || h.dir) * 90;
  if (lvl === 1) { const cw = catwalkAt(cx); if (!cw) return; x1 = Math.max(cw[0] + 30, Math.min(cw[1] - 30, x1)); }
  h.leap = { x0: h.x, y0: h.y, x1, y1: levelY(lvl, x1), lvl, then };
  h.dir = x1 < h.x ? -1 : x1 > h.x ? 1 : h.dir;
  to(h, 'crouch');
};

/** After him: on his level, flat out; up or down after him; lost him (hidden, unseen), searching; gone, off. */
/** Her top speed after him (px a frame). */
const HUNT_TOP = 15.5;
const hunting = (ctx: FrameContext, h: Hunter) => {
  const { state } = ctx, cx = pmid(state);
  // (the back ambush coming: off the screen behind him, kept there, unseen, heard, her red at that edge swelling;
  // hidden or not, then she's in)
  if (h.rush && h.rushT < RUSH_WIND) {
    h.rushT++;
    const k = h.rushT / RUSH_WIND, every = Math.round(40 - k * 34);
    h.x = clampLvl(h, cx + h.rushSide * RUSH_FROM); h.y = levelY(h.lvl, h.x); h.dir = (-h.rushSide) as 1 | -1;
    h.t = 0; h.lastSeen = state.frame; h.lastX = cx;
    if (h.rushT % every === 0) { playSound('click', 0.15 + k * 0.6, 2 + k * 8); if (k > 0.35) playSound('thud', 0.1 + k * 0.5, -14 + k * 4); }
    if (k > 0.7 && h.rushT % 50 === 0) screech(state, 0.3 + k * 0.5, -6, 40);
    if (h.rushT === RUSH_WIND) { playSound('screams', 0.95, -2); playSound('roar', 0.6, -6); }
    return;
  }
  // (he's in a hiding spot: lost him. The back ambush runs on in to about where he went, stops, and looks about there
  // (the user's: "it stops generally around your hiding area, looks around, then leaves"))
  if (h.hid >= 0 && h.hidT >= 0 && !(h.wasRush && Math.abs(cx - h.x) > 90)) { to(h, 'search'); h.path = [{ x: clampLvl(h, h.wasRush ? h.x : cx), stop: 140 }]; h.speed = 2; return; }
  const lv = plevel(state);
  const same = Math.abs(pfeet(state) - h.y) < 70;
  if (same || sees(state, h)) { h.lastSeen = state.frame; h.lastX = cx; }
  h.dir = cx < h.x ? -1 : 1;
  // (seen, he's as good as dead: she gets up to speed in half a second, then outruns him, charging or not (his charge is
  // 14 a frame); only the run up the stairs to the door is a chase he can win)
  const fast = h.finale ? 3.9 : Math.min(h.rush ? RUSH_TOP : HUNT_TOP, 5 + h.t * 0.35);
  // (the back ambush's sprint: once she's up with him, it's a hunt like any)
  if (h.rush && Math.abs(cx - h.x) < 160) h.rush = false;
  // (and coming, heard: off the screen behind him, never seen till she's on it; her claws and her feet on the floor,
  // quicker and louder the nearer she is, a screech as she closes)
  if (h.rush) {
    const near = Math.max(0, Math.min(1, 1 - (Math.abs(cx - h.x) - 160) / (RUSH_FROM - 160)));
    const every = Math.round(12 - near * 8);
    if (h.t % every === 0) { playSound('thud', 0.25 + near * 0.6, -12 + near * 4); playSound('click', 0.3 + near * 0.5, 4 + near * 6); }
    if (near > 0.6 && h.t % 40 === 0) screech(state, 0.5 + near * 0.4, -4, 60);
  }
  // (the back ambush: she's after where he was on his level, not him; up (or down) a level when she gets there, he's
  // out of her sight: she's lost him, and snoops about there (the user's: avoided by hiding, or "by taking a different
  // altitude and still pressing on"))
  if (h.wasRush && !same && !sees(state, h)) {
    if (Math.abs(cx - h.x) < 200 || state.frame - h.lastSeen > 90) { to(h, 'search'); h.path = [{ x: clampLvl(h, h.x + Math.sign(cx - h.x) * 120), stop: 140 }]; h.speed = 2; return; }
  } else if (!same && lv >= 0 && lv !== h.lvl && Math.abs(cx - h.x) < 260 && (lv === 0 || catwalkAt(cx))) { startLeap(state, h, 'hunt'); return; }
  const want = clampLvl(h, cx);
  if (Math.abs(want - h.x) > 3) h.x += Math.sign(want - h.x) * Math.min(fast, Math.abs(want - h.x));
  // (at the end of her catwalk and him down below and on: down she goes)
  else if (h.lvl === 1 && !same && lv === 0 && Math.abs(cx - h.x) > 40) { startLeap(state, h, 'hunt'); return; }
  h.y = levelY(h.lvl, h.x);
  steps(state, h, 12);
  // (seen getting in: she tears it open, the door (the tarp) flung off, and him out of it by the head)
  if (h.hid >= 0 && h.hidT < 0 && Math.abs(h.x - cx) < 60) {
    const sp = HIDES[h.hid];
    h.torn = h.hid; state.player.hidden = false; state.player.hiding = false; h.hid = -1;
    playSound('crash', 1, -4); playSound('clang', 1, -8); playSound('roar', 0.9, -4); shakeScreen(state, 10, 5);
    for (let k = 0; k < 18; k++) state.particles.push({ pos: { x: sp.x + (Math.random() - 0.5) * 40, y: sp.y - 20 - Math.random() * 100 }, vel: { x: -h.dir * (2 + Math.random() * 7), y: -2 - Math.random() * 5 }, life: 50, color: sp.kind === 'dark' ? '#1E293B' : k % 3 ? '#475569' : '#94A3B8', size: 3 + Math.random() * 6, grav: 0.35 });
    startKill(state, h); return;
  }
  // (lost him: out of sight a good while, a way off; not on the stairs (she's on him to the door))
  if (!h.finale && state.frame - h.lastSeen > 200 && Math.abs(cx - h.x) > 500) { to(h, 'search'); h.path = [{ x: clampLvl(h, h.lastX), stop: 120 }]; h.speed = 2.2; }
};

/** Her leaving leap: the crouch (frames), then up and gone by CLIMB_T. */
const CLIMB_CROUCH = 10, CLIMB_T = 30;

const steps = (state: GameState, h: Hunter, every: number) => {
  // (her heavy footfalls only when she's in view (the user: whooshing thuds from her out of sight); the clicks of her
  // claws carry from anywhere: they're the tell)
  const seen = h.x > state.camera.x - 40 && h.x < state.camera.x + CANVAS_WIDTH + 40;
  if (seen && h.t % every === 0) playSound('thud', vol(state, h.x, 0.5), -12);
  if (h.t % 13 === 0) playSound('click', vol(state, h.x, 0.35), 4);
};
/** Dust down out of the ceiling (or a duct): grey, in steps. */
const dust = (state: GameState, x: number, y: number, n: number) => {
  for (let i = 0; i < n; i++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 50, y }, vel: { x: (Math.random() - 0.5) * 0.8, y: 0.6 + Math.random() * 1.2 }, life: 50, color: i % 2 ? '#57534E' : '#78716C', size: 2 + Math.random() * 2, grav: 0.05 });
};

// ---------------------------------------------------------------------------------------------------------------
// The stairs: the panic run (the user's: "you can hear it coming after you and it will jump you and kill you if you stop
// or backtrack before you get to the door"; "you don't see it coming, but you hear it"). She's never drawn till the
// lunge: all of it's in the sounds (and the stalker song's 'panic', cues.ts).

/** How far short of the stairs' foot it starts (with every go paid; with one still owed, right at the foot). */
const CHASE_FOOT = 120, CHASE_FOOT_OWED = 40;
/** Frames at the start before stopping counts (the first screech: his cue to go). */
const CHASE_GRACE = 40;
/** Stopped: this many frames with no headway (half a second). Turned back: this far back down from the furthest he's got. */
const CHASE_STILL = 30, CHASE_BACK = 48;
/** Her, behind him unseen, a real race (the user's: "a standard walk without charging should just barely give you
 *  enough time to clear it"; charging up them's encouraged): she starts CHASE_START back and comes CHASE_PACE px a
 *  frame (his walk's PLAYER_MOVE_SPEED is 4.44), and this close she has him. From the trigger (120 short of the foot)
 *  to the door (DOOR_X - 100) is 1180px: walking, 266 frames; her closing at 1.06 a frame, (385 - 70) / 1.06 = 297
 *  frames: a steady walk makes it by ~31 frames (0.5 s: room for a first-timer's hop or hitch; the hallway taught him to
 *  walk). Charging (14.4 a frame in bursts) makes it easily. */
const CHASE_PACE = 5.5, CHASE_START = 385, CHASE_CATCH = 70;
/** The lunge: frames from off the screen behind him to him. */
const LUNGE_T = 18;

const maybeChase = (state: GameState, h: Hunter) => {
  const p = state.player, cx = pmid(state);
  if (p.health <= 0 || state.deathTimer > 0 || p.inCutscene || h.hid >= 0) return;
  if (cx <= STAIRS_A - (owed(h) ? CHASE_FOOT_OWED : CHASE_FOOT)) return;
  // (her on him already (seen, leaping, the ambush, the kill): that's its own; out somewhere he can see her: not till
  // she's off the screen (gone back up for this, never popped out of sight))
  if (!['away', 'prowl', 'search', 'tell', 'climb'].includes(h.mode)) return;
  if (h.mode !== 'away' && h.x > state.camera.x - 80 && h.x < state.camera.x + CANVAS_WIDTH + 80) return;
  to(h, 'away'); h.next = 1e9; h.finale = true; h.fg = null; h.rattle = null; h.fake = null; h.leaving = false;
  // (the door in already, or the land's done (a revisit): the basement's empty of her; no run)
  if (h.door !== 'shut' || isLandCleared('space')) return;
  h.chase = { t: 0, best: cx, still: 0, herX: cx - CHASE_START, lunge: false };
  // (the cue: down there behind him, a duct's grille banged out, her screech; and him)
  playSound('clang', 0.8, -6); playSound('screams', 0.85, -6); shakeScreen(state, 4, 3);
  meatheadSays(state, pick(L.MH_SEEN), false);
};

const tickChase = (state: GameState, h: Hunter) => {
  const c = h.chase!, p = state.player, cx = pmid(state);
  if (c.lunge || h.mode === 'kill' || p.health <= 0 || state.deathTimer > 0 || h.door !== 'shut') return;
  c.t++;
  // (headway: any further toward the door than he's been (walking, or a jump up the steps), and the clock's reset)
  if (cx > c.best + 0.25) { c.best = cx; c.still = 0; }
  else if (c.t > CHASE_GRACE) c.still++;
  // (her, coming up behind: a touch quicker than his walk)
  c.herX += CHASE_PACE;
  const gap = cx - c.herX;
  if (c.still >= CHASE_STILL || c.best - cx > CHASE_BACK || gap < CHASE_CATCH) { lunge(state, h); return; }
  // (what he hears: louder and quicker the longer it goes and the nearer she gets)
  const near = Math.max(0, Math.min(1, (CHASE_START - gap) / (CHASE_START - CHASE_CATCH)));
  const k = Math.min(1, Math.max(Math.min(1, c.t / 300) * 0.75, near));
  // her claws on the steps, clicking faster
  if (c.t % Math.round(12 - 7 * k) === 0) playSound('click', 0.3 + 0.5 * k, 2 + 5 * k + Math.random() * 2);
  // her weight on them
  if (c.t % Math.round(28 - 12 * k) === 0) playSound('thud', 0.25 + 0.4 * k, -12);
  // the stairs rattling under her
  if (c.t % 90 === 50) { playSound('clang', 0.25 + 0.4 * k, -8 + Math.random() * 4); shakeScreen(state, 1 + 2 * k, 2); }
  // screeches (spaced: the user's fewer-whooshes rule)
  if (c.t % 150 === 100) screech(state, 0.4 + 0.5 * k, -7 + 4 * k, 140);
  // closing (he's stopped): her breath, right behind
  if (c.still > 6 && c.still % 8 === 0) playSound('snort', 0.5 + 0.4 * near, -4);
};

/** He stopped (or turned back, or let her close): a screech, and she's out of the dark behind him, at him. */
const lunge = (state: GameState, h: Hunter) => {
  const c = h.chase!, cx = pmid(state);
  c.lunge = true;
  const from = Math.max(B + 40, Math.min(cx - 260, state.camera.x - 90));
  h.lvl = 0; h.x = from; h.y = levelY(0, from); h.dir = 1; h.fg = null; h.rattle = null;
  h.leap = { x0: from, y0: h.y, x1: cx - 46, y1: levelY(0, cx - 46), lvl: 0, then: 'kill' };
  to(h, 'leap');
  playSound('screams', 1, -2); playSound('roar', 0.8, -6); shakeScreen(state, 6, 3);
};

// ---------------------------------------------------------------------------------------------------------------
// The kill: snatched up to her face, the beat, his head torn off, the body dropped; she screeches over the head and
// pitches it

const startKill = (state: GameState, h: Hunter) => {
  to(h, 'kill');
  const p = state.player;
  p.inCutscene = true; p.carried = true; p.vel.x = 0; p.vel.y = 0;
  p.isCharging = false; p.isSliding = false; p.isUppercutting = false; p.isDivekicking = false;
  h.dir = pmid(state) < h.x ? -1 : 1;
  // (where his body drops: the floor under where she holds him (on the stairs, the step there))
  ripKill.floor = h.lvl ? h.y : levelY(0, heldAt(h, K_RIP).x);
  playSound('roar', 1, -4); shakeScreen(state, 8, 4);
};
/** Where he's held (his feet), t frames into it: up off the floor in her claws, out in front of her face (yanked down
 *  on the pull). */
const heldAt = (h: Hunter, t: number) => {
  const k = Math.min(1, t / K_SNATCH), e = 1 - (1 - k) * (1 - k);
  const pull = t >= K_PULL && t < K_RIP ? Math.sin(((t - K_PULL) / (K_RIP - K_PULL)) * Math.PI) * 10 : 0;
  return { x: h.x + h.dir * (60 + 64 * e), feet: h.y - 118 * e + pull };
};
/** Her mouth (the tip of her outer jaws), drawn at QS from her feet. */
const mouthAt = (h: Hunter) => ({ x: h.x + h.dir * 78, y: h.y - 176 });
/** Her outer jaws, opening in his face over the beat (0..1); wide over the head after. */
const jawOpen = (t: number) => (t < K_SNATCH ? 0.3 : t < K_RIP ? Math.min(1, 0.3 + (t - K_SNATCH) / 40) : t < K_TOSS ? 1 : 0.4);
/** Where his head is in her claw after the rip: up to her face, held up there while she screeches. */
const headHeld = (h: Hunter, t: number) => {
  const at = heldAt(h, K_RIP), from = { x: at.x, y: at.feet - 62 }, to2 = { x: h.x + h.dir * 96, y: h.y - 214 };
  const k = Math.min(1, (t - K_RIP) / 12), e = 1 - (1 - k) * (1 - k), shake = t < K_TOSS && t > K_RIP + 14 ? Math.sin(t * 1.3) * 3 : 0;
  return { x: from.x + (to2.x - from.x) * e + shake, y: from.y + (to2.y - from.y) * e };
};

const killing = (ctx: FrameContext, h: Hunter) => {
  const { state } = ctx, p = state.player;
  h.cam = t2cam(h);
  const t = h.t;
  if (t <= K_RIP) {
    // (held up in front of her face, kicking; her claw on his head; the pull)
    const at = heldAt(h, t), kick = t > K_SNATCH && t < K_PULL && (t >> 2) % 2 ? 1 : 0;
    p.pos.x = at.x - p.width / 2 + kick * h.dir; p.pos.y = at.feet - p.height; p.vel.x = 0; p.vel.y = kick ? -1 : 0;
    p.facing = (h.dir > 0 ? -1 : 1);
    if (t === 2) playSound('screams', 0.7, -6);
    if (t === K_SNATCH + 8) playSound('snort', 0.7, -14);
    if (t === K_GRIP) { playSound('clink', 0.8, -10); playSound('click', 0.8, -4); }
    if (t > K_SNATCH && t % 12 === 0) playSound('click', 0.6, 2 - t / 20);
    if (t > K_GRIP && t < K_PULL && t % 6 === 0) playSound('grind', 0.4, 4 + (t - K_GRIP) / 4);
    if (t === K_PULL) { playSound('crunch', 0.8, -10); shakeScreen(state, 4, 2); }
    if (t > K_SNATCH + 10 && t % 6 === 0) state.particles.push({ pos: { x: mouthAt(h).x + h.dir * 4, y: mouthAt(h).y + 14 }, vel: { x: 0, y: 1 }, life: 30, color: '#D9F99D', size: 2, grav: 0.2 });
  }
  if (t === K_RIP) {
    // (off it comes: the rip, the pop, the spray; dead)
    const at = heldAt(h, t), hx = at.x, hy = at.feet - 56;
    playSound('crunch', 1, -2); playSound('splat', 1, -4); playSound('gorespray', 1, -2); shakeScreen(state, 14, 7);
    for (let i = 0; i < 30; i++) state.particles.push({ pos: { x: hx, y: hy }, vel: { x: (Math.random() - 0.5) * 8, y: -4 - Math.random() * 7 }, life: 55, color: GORE[i % GORE.length], size: 2 + Math.random() * 4, grav: 0.35 });
    // (still held where he is (by the body, her other claw): dropped when she lets go (his death's own drawing))
    p.carried = true; p.invincibilityTimer = 0; p.inCutscene = false;
    hurtPlayer(ctx, 9999, JAW, { x: 0, y: 0 }, 0);
    p.vel.x = 0; p.vel.y = 0;
  }
  if (t > K_RIP && t <= K_DROP) { const at = heldAt(h, K_RIP); p.pos.x = at.x - p.width / 2; p.pos.y = at.feet - p.height; p.vel.x = 0; p.vel.y = 0; }
  if (t === K_DROP) { p.carried = false; playSound('whoosh', 0.5, -6); }
  // (done: she turns, and she's off up a vent (the respawn's long since put things back, as a rule))
  if (t > K_END) leave(h);
};
/** The kill cam: in close for it (eased in while he's alive), back out once she's pitched the head. */
const t2cam = (h: Hunter) => Math.min(1, h.cam + 0.06);
/** The kill's clock: her own frames till the rip; after it the world's held while his death plays, so her side of it
 *  (the head up to her face, the screech, the toss) runs off his death's own time. */
const killT = (state: GameState, h: Hunter) => (h.mode === 'kill' && state.meatheadDeath?.kind === RIPPED ? K_RIP + (state.deathScene?.t ?? 0) : h.t);
/** The camera in, by the kill's clock. */
const camK = (state: GameState, h: Hunter) => {
  if (h.mode !== 'kill') return h.cam;
  const t = killT(state, h);
  return t < K_TOSS + 10 ? h.cam : Math.max(0, 1 - (t - K_TOSS - 10) * 0.03);
};
/** His head, pitched (from K_TOSS): an arc back behind her, a bounce, then it lies there. */
const headFlight = (h: Hunter, t: number) => {
  const st = headHeld(h, K_TOSS), s2 = t - K_TOSS, floor = h.y - 10, g = 0.5, vy = -7, vx = -h.dir * 5;
  const land = (-vy + Math.sqrt(vy * vy + 2 * g * (floor - st.y))) / g;
  if (s2 <= land) return { x: st.x + vx * s2, y: st.y + vy * s2 + 0.5 * g * s2 * s2, r: vx * 0.06 * s2 };
  const b = s2 - land, bv = 2.4, bt = (2 * bv) / g, x1 = st.x + vx * land;
  if (b <= bt) return { x: x1 + vx * 0.5 * b, y: floor - (bv * b - 0.5 * g * b * b), r: vx * 0.06 * (land + b) };
  const roll = Math.min(18, (b - bt) * 0.8);
  return { x: x1 + vx * 0.5 * bt + Math.sign(vx) * roll, y: floor, r: vx * 0.06 * (land + bt) + Math.sign(vx) * roll * 0.1 };
};
/** The camera in on the kill: her head and his, filling the screen. */
export const hunterZoom = (state: GameState, h: Hunter) => {
  const cam = camK(state, h);
  // (pushed in, the big stamps (the stairs' one above all) are scaled up from the ones they have, not painted again
  // huge at the held scale: that stall was the push-in's slowdown)
  setStampHold(cam > 0);
  if (cam <= 0) return null;
  const k = cam * cam * (3 - 2 * cam), m = mouthAt(h), fx = m.x + h.dir * 30, fy = m.y + 10;
  const z = 1 + k * 1.4;
  return { scale: z, x: fx, y: fy, shiftX: k * (state.camera.x + CANVAS_WIDTH / 2 - fx), shiftY: k * (state.camera.y + CANVAS_HEIGHT / 2 - fy) };
};

// ---------------------------------------------------------------------------------------------------------------
// The disco's door, at the top of the stairs: up to it, the boot (the chase is over: she's held off for it)

// (right up at it, walked there himself: the user's "the player has to physically walk up to the door")
export const atDoor = (state: GameState, h: Hunter) => h.door === 'shut' && pmid(state) > DOOR_X - 100 && state.player.isGrounded && state.player.health > 0 && state.deathTimer <= 0 && h.mode !== 'kill' && !h.chase?.lunge;
export const startKick = (state: GameState, h: Hunter) => {
  h.door = 'kicking'; h.doorT = 0;
  // (made it: the run's over; her, down the stairs behind him, one last screech, shut out)
  if (h.chase) { h.chase = null; playSound('screams', 0.7, -8); }
  const p = state.player;
  if (h.hid >= 0) { h.hid = -1; p.hidden = false; }
  p.inCutscene = true;
};
/** Frames the kicked door takes to go over flat. */
const DOOR_FALL = 16;
const kick = (ctx: FrameContext, h: Hunter): Controls => {
  const { state } = ctx, p = state.player;
  h.doorT++;
  const t = h.doorT;
  p.inCutscene = true; p.facing = 1;
  if (t < 10) { p.vel.x = 0; p.pos.x += (DOOR_X - 90 - p.width / 2 - p.pos.x) * 0.3; }
  if ((p.kickPose || 0) > 0) p.kickPose!--;
  if (t === 8) { p.kickPose = KICK_POSE_FRAMES; playSound('whoosh', 0.7, -4); }
  if (t === 18) {
    if (h.block) { state.blocks = state.blocks.filter(b => b !== h.block); h.block = null; }
    state.stageMemo[DOOR_MEMO] = '1';
    // (the boss's checkpoint: his now, outside the door, the refill by it)
    state.checkpoint = Math.max(state.checkpoint, DISCO_CP);
    playSound('crash', 1, -4); playSound('boom', 0.6, 2); shakeScreen(state, 14, 7);
    for (let i = 0; i < 26; i++) state.particles.push({ pos: { x: DOOR_X - 10 + Math.random() * 20, y: GY - 20 - Math.random() * 150 }, vel: { x: 2 + Math.random() * 6, y: -2 - Math.random() * 4 }, life: 50, color: ['#C026D3', '#F472B6', '#FDE047', '#A1A1AA'][i % 4], size: 3 + Math.random() * 5, grav: 0.35 });
    // (and she's done with: the chase is over)
    to(h, 'away'); h.next = 1e9; h.finale = true; h.fg = null; h.rattle = null; h.fake = null;
  }
  // (the door down flat: a slam and a puff of dust off the floor)
  if (t === 18 + DOOR_FALL) { playSound('slam', 1, -10); playSound('thud', 0.8, -8); shakeScreen(state, 8, 4); for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: DOOR_X + 60 + Math.random() * 200, y: GY - 4 }, vel: { x: (Math.random() - 0.3) * 4, y: -1 - Math.random() * 2 }, life: 40, color: 'rgba(214, 211, 209, 0.6)', size: 4 + Math.random() * 6 }); }
  // (down: his again, to walk in himself (the user's: nobody walks him into a boss's room))
  if (t > 18 + DOOR_FALL) { h.door = 'in'; p.inCutscene = false; p.kickPose = 0; }
  return hands();
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** World space, in the play plane: her (dropping, prowling, after him, on the ceiling, leaping, the kill). */
export const drawHunter = (c: Ctx, state: GameState, h: Hunter) => {
  if (!inPlay(h)) return;
  const f = state.frame;
  if (h.mode === 'ceil') {
    // (upside down along the ceiling: her feet to it, hanging, crawling)
    c.save(); c.translate(h.x, CEIL_B); c.scale(QS, -QS); c.translate(-h.x, -GY);
    drawQueen(c, h.x, h.dir, { pose: 'stalk', t: f, ext: 0, alive: 1, beat: 0, free: true, stride: h.sniff ? 0 : f * (h.forced ? 0.5 : 0.16) });
    c.restore();
    return;
  }
  // (out of the vent (down from the ceiling) or the duct (out of the back wall, coming forward out of the dark))
  let dy = 0, alpha = 1;
  if (h.mode === 'drop') { if (h.entry === 'duct') alpha = Math.min(1, h.t / 18); else dy = -(h.y - CEIL_B) * Math.max(0, 1 - h.t / 16); }
  if (h.mode === 'ambush') dy = -(h.y - CEIL_B) * Math.max(0, 1 - h.t / 14);
  // (leaving: down on her haunches, then a leap straight up off the top of the screen, quickening)
  if (h.mode === 'climb') { const k = Math.max(0, h.t - CLIMB_CROUCH) / (CLIMB_T - CLIMB_CROUCH); dy = -(h.y - (state.camera.y - 220)) * Math.min(1, k * k * 1.4 + k * 0.3); }
  const crouch = h.mode === 'crouch' || (h.mode === 'climb' && h.t < CLIMB_CROUCH) ? 0.82 : h.mode === 'ambush' && h.t >= 14 ? 0.9 + Math.sin(h.t * 0.6) * 0.03 : 1;
  const kill = h.mode === 'kill', kt = killT(state, h);
  const pose = kill ? (kt < K_SNATCH ? 'swipe' : kt >= K_RIP + 14 && kt < K_TOSS ? 'roar' : 'grab') : h.mode === 'crouch' || h.mode === 'ambush' ? 'roar' : h.mode === 'leap' ? 'swipe' : h.mode === 'hunt' ? 'stalk' : h.mode === 'search' || (h.mode === 'prowl' && h.sniff > 0) ? 'idle' : 'stalk';
  const moving = h.mode === 'prowl' && h.sniff === 0 || h.mode === 'hunt' || h.mode === 'search';
  if (alpha < 1) c.globalAlpha = alpha;
  // (after him flat out (the back ambush on the screen, a hunt): a sprint, not a walk: low, leaning into it, her legs
  // going twice as quick, bobbing with each bound)
  const sprint = h.mode === 'hunt' && !h.finale;
  const bob = sprint ? Math.abs(Math.sin(f * 0.6)) * -6 : 0;
  c.save(); c.translate(h.x, h.y + dy + bob); if (sprint) c.rotate(h.dir * 0.16); c.scale(QS, QS * crouch * (sprint ? 0.9 : 1)); c.translate(-h.x, -GY);
  drawQueen(c, h.x, h.dir, { pose, t: f, ext: 0, alive: 1, beat: 0, free: true, stride: moving ? f * (sprint ? 0.7 : h.mode === 'hunt' ? 0.35 : 0.16) : 0, jaw: kill ? jawOpen(kt) : undefined, inner: kill ? (kt >= K_RIP + 14 && kt < K_TOSS ? 1 : 0) : undefined });
  c.restore();
  c.globalAlpha = 1;
  if (kill) drawRip(c, state, h);
};

/** The kill, her side of it: her claw closing over his head (the beat), his head in it after (up to her face while
 *  she screeches; then pitched, bouncing, lying there). World. */
const drawRip = (c: Ctx, state: GameState, h: Hunter) => {
  const t = killT(state, h);
  // (her hand: down onto the top of his head, the fingers closing round it; the pull; up with it to her face)
  const shoulder = { x: h.x + h.dir * 26, y: h.y - 196 };
  if (t >= K_GRIP && t < K_RIP) {
    const at = heldAt(h, t), k = Math.min(1, (t - K_GRIP) / 10);
    const hx = at.x, hy = at.feet - 58, reach = Math.min(1, (t - K_GRIP) / 6);
    claw(c, shoulder, { x: shoulder.x + (hx - shoulder.x) * reach, y: shoulder.y + (hy - shoulder.y) * reach }, h.dir, k);
    if (t >= K_PULL) { box(c, hx - 9, hy + 10, 18, 3, '#991B1B'); box(c, hx - 2, hy + 12, 3, 4 + (t - K_PULL), '#B91C1C'); }
  }
  if (t >= K_RIP) {
    const flying = t >= K_TOSS, hp = flying ? headFlight(h, t) : { ...headHeld(h, t), r: 0 };
    drawHead(c, hp.x, hp.y, hp.r, h.dir);
    if (!flying) claw(c, shoulder, { x: hp.x, y: hp.y }, h.dir, 1);
  }
};
/** Her hand over a head at `on` (its middle), the arm down to it from her shoulder: the palm on top, four long fingers
 *  curled down round it (k: how far closed), claws at their ends. World. */
const claw = (c: Ctx, from: { x: number; y: number }, on: { x: number; y: number }, dir: 1 | -1, k: number) => {
  const wx = on.x + dir * 14, wy = on.y - 16;
  limb(c, from.x, from.y, (from.x + wx) / 2 + dir * 6, (from.y + wy) / 2 - 10, 8, '#1F2028');
  limb(c, (from.x + wx) / 2 + dir * 6, (from.y + wy) / 2 - 10, wx, wy, 7, '#1F2028');
  ink(c, () => c.ellipse(on.x + dir * 4, on.y - 13, 14, 7, 0, 0, Math.PI * 2), '#1F2028', 1.5);
  box(c, Math.round(on.x - 6), Math.round(on.y - 18), 12, 2, '#6B7280');
  for (let i = 0; i < 4; i++) {
    const fx = on.x - dir * 10 + dir * i * 7, sx = (i - 1.5) * (3 + k * 3);
    const tipX = fx + sx, tipY = on.y - 8 + k * 14;
    limb(c, fx, on.y - 14, tipX, tipY, 4, '#343744');
    box(c, Math.round(tipX) - 1, Math.round(tipY), 3, 3, '#D1D5DB');
  }
};

/** His head, off: the flat-top, the brow, X eyes, the mouth hanging open, the ragged neck end dripping. World, its
 *  middle at (x, y), turned r. */
const drawHead = (c: Ctx, x: number, y: number, r: number, dir: 1 | -1) => {
  c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(r); c.scale(-dir, 1);
  box(c, -11, -11, 22, 22, '#3B1F0E');
  box(c, -10, -10, 20, 20, '#E0A060');
  box(c, -10, 4, 20, 6, '#C8864A');
  box(c, -11, -14, 22, 6, '#18181B'); for (let i = 0; i < 5; i++) box(c, -10 + i * 4, -16, 2, 3, '#18181B');
  box(c, -8, -5, 7, 2, '#18181B'); box(c, 2, -5, 7, 2, '#18181B');
  for (const ex of [-6, 4]) { box(c, ex, -2, 1, 1, '#18181B'); box(c, ex + 2, -2, 1, 1, '#18181B'); box(c, ex + 1, -1, 1, 1, '#18181B'); box(c, ex, 0, 1, 1, '#18181B'); box(c, ex + 2, 0, 1, 1, '#18181B'); }
  box(c, -4, 4, 9, 4, '#450A0A'); box(c, -2, 7, 4, 2, '#F472B6');
  // (his glasses, still on, smashed: knocked crooked, the lenses webbed with cracks, one rim snapped open)
  c.save(); c.rotate(-0.12);
  for (const rx of [-9, 1]) {
    c.fillStyle = 'rgba(190, 220, 248, 0.24)'; c.fillRect(rx + 1, -3, 7, 4);
    c.strokeStyle = 'rgba(244, 250, 255, 0.9)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(rx + 2, -2); c.lineTo(rx + 4, 0); c.lineTo(rx + 7, -3); c.moveTo(rx + 4, 0); c.lineTo(rx + 5, 1); c.stroke();
    box(c, rx, -5, 9, 2, '#09090B'); box(c, rx, -3, 1, 5, '#09090B'); if (rx < 0) box(c, rx + 8, -3, 1, 5, '#09090B'); box(c, rx, 1, rx < 0 ? 9 : 6, 1, '#09090B');
    box(c, rx + 1, -5, 5, 1, '#52525B');
  }
  box(c, -12, -4, 3, 1, '#09090B'); box(c, 10, -4, 3, 1, '#09090B');
  c.restore();
  // (the neck end: ragged, red, a bit of spine)
  box(c, -8, 10, 16, 4, '#991B1B'); box(c, -6, 13, 4, 3, '#7F1D1D'); box(c, 2, 13, 5, 2, '#7F1D1D'); box(c, -1, 11, 3, 4, '#F5F5F4');
  c.restore();
};

/** World space: the hiding spots (lockers, dark corners, the cabinets up top), him in one, the door. */
export const drawHides = (c: Ctx, state: GameState, h: Hunter) => {
  const v = state.camera.x;
  for (let i = 0; i < HIDES.length; i++) {
    const s = HIDES[i], y = s.y;
    if (s.x < v - 100 || s.x > v + CANVAS_WIDTH + 100) continue;
    const inIt = h.hid === i;
    // (torn open on him: the door (the tarp, the heap) ripped off and gone, the inside gutted, the hinges bent out)
    if (h.torn === i) {
      const top = s.kind === 'locker' ? y - 128 : s.kind === 'cabinet' ? y - 108 : y - 110, w = s.kind === 'dark' ? 80 : 56;
      box(c, s.x - w / 2 - 2, top - 2, w + 4, y - top + 2, '#020203');
      box(c, s.x - w / 2, top, w, y - top, '#0B0B10');
      if (s.kind !== 'dark') { box(c, s.x - w / 2 - 2, top, 4, y - top, '#475569'); for (const hy of [top + 18, y - 30]) { box(c, s.x - w / 2 - 8, hy, 8, 3, '#94A3B8'); box(c, s.x - w / 2 - 12, hy - 4, 4, 4, '#94A3B8'); } }
      for (let k = 0; k < 5; k++) box(c, s.x - w / 2 + 6 + k * (w / 5), y - 4 - (k % 2) * 3, 6, 4, k % 2 ? '#334155' : '#7F1D1D');
      continue;
    }
    if (s.kind === 'locker') {
      stamp(c, `sp-q-locker2-${i}`, s.x - 30, y - 132, 60, 134, g => {
        // (a cast member's locker: steel, banded round in steps, its vents, a name plate, the handle; dented, a sticker)
        const L = s.x - 26, T = y - 128;
        g.fillStyle = '#05070B'; g.fillRect(L - 1, T - 1, 54, 130);
        const bands = ['#2A3646', '#3A4A60', '#475A74', '#52677F', '#475A74', '#3A4A60', '#2E3B4D', '#232D3B'];
        bands.forEach((col, k) => { g.fillStyle = col; g.fillRect(L + k * 6.5, T, 7, 128); });
        g.fillStyle = '#7A8CA4'; g.fillRect(L + 20, T + 2, 2, 124);
        g.fillStyle = '#05070B'; g.fillRect(L, T + 4, 52, 1); g.fillRect(L, T + 122, 52, 2);
        for (let k = 0; k < 5; k++) { g.fillStyle = '#0B1220'; g.fillRect(s.x - 14, y - 116 + k * 6, 28, 3); g.fillStyle = '#6A7C94'; g.fillRect(s.x - 14, y - 113 + k * 6, 28, 1); }
        // (the name: punched on label-maker tape, the letters raised white, stuck on a touch crooked)
        const who = ['BRENDA', 'GARY', 'SID', 'CHUCK', 'SUSAN', 'GLENN', 'LILLY', 'MATT', 'JJ'][i % 9], tw = textW(who, 1, { gap: 1, space: 3 }) + 6;
        g.fillStyle = '#05070B'; g.fillRect(Math.round(s.x - tw / 2) - 1, y - 86, tw + 2, 13); g.fillStyle = '#1E293B'; g.fillRect(Math.round(s.x - tw / 2), y - 85, tw, 11); g.fillStyle = '#334155'; g.fillRect(Math.round(s.x - tw / 2), y - 85, tw, 1);
        emboss(g, who, s.x, y - 83, 1, '#F1F5F9', '#FFFFFF', '#05070B');
        g.fillStyle = '#05070B'; g.fillRect(s.x + 13, y - 65, 5, 14); g.fillStyle = '#A8B4C4'; g.fillRect(s.x + 14, y - 64, 3, 12); g.fillStyle = '#E2E8F0'; g.fillRect(s.x + 14, y - 64, 1, 12);
        // (a dent; a sticker (a smiley alien); a padlock that's not locked)
        g.fillStyle = '#2A3646'; g.fillRect(s.x - 18, y - 40, 8, 5); g.fillStyle = '#6A7C94'; g.fillRect(s.x - 18, y - 41, 8, 1);
        g.fillStyle = '#16A34A'; g.fillRect(s.x - 4, y - 32, 10, 10); g.fillStyle = '#05070B'; g.fillRect(s.x - 2, y - 29, 2, 2); g.fillRect(s.x + 2, y - 29, 2, 2); g.fillRect(s.x - 1, y - 25, 4, 1);
        g.fillStyle = '#CA8A04'; g.fillRect(s.x + 12, y - 48, 7, 6); g.fillStyle = '#FDE047'; g.fillRect(s.x + 12, y - 48, 7, 1);
      });
      if (inIt && state.frame % 90 > 4) { box(c, s.x - 8, y - 110, 4, 3, '#F8FAFC'); box(c, s.x + 4, y - 110, 4, 3, '#F8FAFC'); box(c, s.x - 7, y - 110, 2, 2, '#DC2626'); box(c, s.x + 5, y - 110, 2, 2, '#DC2626'); }
    } else if (s.kind === 'cabinet') {
      // (an air handler's cabinet up on the catwalk: its door hanging open a crack, the louvers, room for one idiot)
      stamp(c, `sp-q-cab2-${i}`, s.x - 34, y - 112, 68, 114, g => {
        // (an air handler's cabinet up on the catwalk: steel, shaded in steps, its door hanging open a crack, the
        // louvers, a fan behind them, room for one idiot)
        const L = s.x - 30, T = y - 108;
        g.fillStyle = '#05050A'; g.fillRect(L - 1, T - 1, 62, 110);
        g.fillStyle = '#3A3A44'; g.fillRect(L, T, 60, 108); g.fillStyle = '#4E4E5A'; g.fillRect(L, T, 44, 108); g.fillStyle = '#5E5E6C'; g.fillRect(L, T, 30, 108);
        g.fillStyle = '#8A8A98'; g.fillRect(L, T, 60, 2); g.fillStyle = '#26262E'; g.fillRect(L + 54, T + 2, 6, 106);
        g.fillStyle = '#0A0A0F'; g.fillRect(s.x - 22, y - 98, 44, 58);
        g.fillStyle = '#1A1A22'; g.beginPath(); g.arc(s.x, y - 69, 18, 0, Math.PI * 2); g.fill();
        g.strokeStyle = '#2E2E3A'; g.lineWidth = 3; for (let k = 0; k < 4; k++) { const an = k * Math.PI / 2 + 0.4; g.beginPath(); g.moveTo(s.x, y - 69); g.lineTo(s.x + Math.cos(an) * 16, y - 69 + Math.sin(an) * 16); g.stroke(); }
        for (let k = 0; k < 6; k++) { g.fillStyle = '#05050A'; g.fillRect(s.x - 22, y - 96 + k * 9, 44, 4); g.fillStyle = '#5E5E6C'; g.fillRect(s.x - 22, y - 92 + k * 9, 44, 1); }
        g.fillStyle = '#05050A'; g.fillRect(s.x + 26, y - 104, 3, 100);
        g.fillStyle = '#A16207'; g.fillRect(s.x - 18, y - 22, 36, 10); g.fillStyle = '#FACC15'; g.fillRect(s.x - 18, y - 22, 36, 1);
        stencil(g, 'AHU-2', s.x, y - 20, 1, '#1A0E04', { seed: i, spray: '', runs: false });
      });
      if (inIt && state.frame % 90 > 4) { box(c, s.x - 7, y - 76, 3, 2, '#F8FAFC'); box(c, s.x + 4, y - 76, 3, 2, '#F8FAFC'); }
    } else {
      // (a dark corner: behind a heap of broken animatronics and a tarp)
      stamp(c, `sp-q-dark2-${i}`, s.x - 60, y - 120, 120, 122, g => {
        // (a dark corner: behind a heap of broken animatronics and a tarp thrown over it, folds in steps)
        g.fillStyle = '#030305'; g.fillRect(s.x - 40, y - 110, 80, 110);
        const tarp = () => { g.moveTo(s.x - 56, y); g.quadraticCurveTo(s.x - 40, y - 120, s.x + 10, y - 112); g.quadraticCurveTo(s.x + 50, y - 100, s.x + 56, y); g.closePath(); };
        g.fillStyle = '#05070B'; g.beginPath(); tarp(); g.fill();
        g.save(); g.beginPath(); tarp(); g.clip();
        g.fillStyle = '#16233A'; g.fillRect(s.x - 60, y - 120, 120, 122);
        g.fillStyle = '#1E3050'; g.beginPath(); g.ellipse(s.x - 10, y - 80, 40, 34, -0.3, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#2A4268'; g.beginPath(); g.ellipse(s.x - 18, y - 92, 22, 14, -0.3, 0, Math.PI * 2); g.fill();
        for (let k = 0; k < 4; k++) { g.strokeStyle = '#0B1424'; g.lineWidth = 2; g.beginPath(); g.moveTo(s.x - 30 + k * 18, y - 100 + k * 4); g.quadraticCurveTo(s.x - 26 + k * 20, y - 50, s.x - 34 + k * 22, y); g.stroke(); }
        g.restore();
        // (out from under it: a green alien's head, its eyes; a white arm, a hand)
        g.fillStyle = '#052E16'; g.beginPath(); g.ellipse(s.x - 30, y - 30, 17, 19, 0.3, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#15803D'; g.beginPath(); g.ellipse(s.x - 30, y - 30, 16, 18, 0.3, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#22C55E'; g.beginPath(); g.ellipse(s.x - 34, y - 36, 8, 8, 0.3, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#0A0A0A'; g.beginPath(); g.ellipse(s.x - 36, y - 30, 5, 3, 0.5, 0, Math.PI * 2); g.ellipse(s.x - 24, y - 30, 5, 3, -0.5, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#FFFFFF'; g.fillRect(s.x - 37, y - 31, 1, 1); g.fillRect(s.x - 25, y - 31, 1, 1);
        g.fillStyle = '#05070B'; g.fillRect(s.x + 19, y - 27, 26, 16); g.fillStyle = '#E7E5E4'; g.fillRect(s.x + 20, y - 26, 24, 14); g.fillStyle = '#FFFFFF'; g.fillRect(s.x + 20, y - 26, 24, 2); g.fillStyle = '#18181B'; g.fillRect(s.x + 26, y - 24, 8, 6);
      });
      if (inIt && state.frame % 90 > 4) { box(c, s.x - 4, y - 70, 3, 2, '#F8FAFC'); box(c, s.x + 5, y - 70, 3, 2, '#F8FAFC'); }
    }
  }
  // (a vent rattling: her coming, or nothing)
  for (const r of [h.rattle, h.fake]) {
    if (!r || r.t > 150 || h.mode === 'ceil' && r === h.rattle) continue;
    const j = (state.frame >> 1) % 2 ? 2 : -2, duct = r === h.rattle && h.entry === 'duct';
    if (duct) { const y = BF - 70; box(c, r.x - 32 + j, y, 64, 44, '#020203'); for (let s = 0; s < 6; s++) box(c, r.x - 30 + j + s * 11, y + 2, 4, 40, '#3F3F4C'); }
    else { box(c, r.x - 30 + j, CEIL_B - 2, 60, 9, '#020203'); for (let s = 0; s < 6; s++) box(c, r.x - 28 + j + s * 10, CEIL_B - 2, 3, 9, '#4B4B57'); }
  }
};
/** The disco's doorway: one doorway in one wall, the wall between the stairwell and the hall (drawn over both rooms'
 *  back walls where they meet), seen the same from the stairs and from the dance floor. World. */
export const drawDiscoDoor = (c: Ctx, state: GameState, h: Hunter) => drawDoor(c, state, h);

/** The doorway's measures: its opening (the leaves fill it), the wall's columns either side, the wall's top. */
export const DOORWAY = { l: DOOR_X - 56, r: DOOR_X + 56, top: GY - 212, L: DOOR_X - 80, R: DOOR_X + 80, wall: GY - 600 };
/** The sign on the header: GALACTIC GROOVE in neon on its raceway, and the brass plate under it (the glow passes keep
 *  off it). */
export const DOOR_SIGN = { x: DOOR_X - 66, y: GY - 346, w: 132, h: 68 };
const D_PINK: Ramp = ['#1A0410', '#4A1A38', '#EC4899', '#F9A8D4', '#FFF1F7'];
const D_CYAN: Ramp = ['#04161C', '#16404A', '#22D3EE', '#A5F3FC', '#F0FDFF'];

/** The wall and its doorway, still: the wall's columns and the header over the door (the club's front: purple, banded
 *  dark up high to lit at the door, ribbed), the chrome casing round the opening, the neon's raceway on its brackets,
 *  the brass MEMBERS ONLY plate screwed on under it, the threshold. */
const paintDoorway = (g: Ctx) => {
  const D = DOORWAY, x = DOOR_X;
  // (the wall: the rooms' edges inked; its face banded down to the door, stepped, a dithered seam every so often)
  box(g, D.L - 2, D.wall, D.R - D.L + 4, GY - D.wall, '#05020B');
  bandedGradient(g, D.L, D.wall, D.R - D.L, GY - D.wall, ['#0B0418', '#150826', '#200C38', '#2A0F48', '#3B1468', '#2A0F48'], 12);
  for (let y = D.wall + 40; y < D.top - 20; y += 50) { g.fillStyle = dith(g, '#3B1468', 1, (y >> 1) % 2); g.fillRect(D.L, y, D.R - D.L, 2); }
  // (the columns' edges: lit on the left, shaded on the right, the wall's ribs up them)
  box(g, D.L, D.wall, 2, GY - D.wall, '#5B21B6'); box(g, D.L + 2, D.wall, 1, GY - D.wall, '#7C3AED');
  box(g, D.R - 3, D.wall, 3, GY - D.wall, '#12061E');
  for (const rx of [D.L + 6, D.R - 10]) { box(g, rx, D.wall + 8, 4, D.top - D.wall - 40, '#1C0A33'); box(g, rx, D.wall + 8, 1, D.top - D.wall - 40, '#4C1D95'); }
  // (its foot: the baseboard, chrome, like the hall's)
  box(g, D.L, GY - 8, D.R - D.L, 8, '#52525B'); box(g, D.L, GY - 8, D.R - D.L, 2, '#A1A1AA'); box(g, D.L, GY - 2, D.R - D.L, 2, '#27272A');
  // (the opening: the casing round it, chrome banded round (lit outside, shaded into the opening))
  box(g, D.l - 9, D.top - 9, D.r - D.l + 18, GY - D.top + 9, '#05020B');
  const jamb = ['#3F3F46', '#8E8E99', '#D4D4D8', '#F4F4F5', '#A1A1AA', '#52525B', '#27272A', '#18181B'];
  jamb.forEach((col, k) => { box(g, D.l - 8 + k, D.top - 8, 1, GY - D.top + 8, col); box(g, D.r + 7 - k, D.top - 8, 1, GY - D.top + 8, col); });
  ['#F4F4F5', '#D4D4D8', '#A1A1AA', '#8E8E99', '#52525B', '#3F3F46', '#27272A', '#18181B'].forEach((col, k) => box(g, D.l - 8 + k, D.top - 8 + k, D.r - D.l + 16 - k * 2, 1, col));
  box(g, D.l, D.top, D.r - D.l, GY - D.top, '#0A0510');
  // (the threshold: a chrome strip, lit)
  box(g, D.l, GY - 3, D.r - D.l, 3, '#71717A'); box(g, D.l, GY - 3, D.r - D.l, 1, '#E4E4E7');
  // (the neon's raceway: a black box on two brackets bolted to the header, its screws)
  const S = DOOR_SIGN;
  for (const bx of [S.x + 16, S.x + S.w - 22]) { box(g, bx - 1, S.y - 10, 8, 12, '#05020B'); box(g, bx, S.y - 9, 6, 10, '#52525B'); box(g, bx, S.y - 9, 6, 1, '#A1A1AA'); box(g, bx + 2, S.y - 7, 2, 2, '#18181B'); }
  box(g, S.x - 2, S.y - 2, S.w + 4, 48, '#05020B'); box(g, S.x, S.y, S.w, 44, '#12061E'); box(g, S.x, S.y, S.w, 2, '#3A2A4C'); box(g, S.x, S.y + 42, S.w, 2, '#0A0410');
  for (const [rx, ry] of [[S.x + 3, S.y + 3], [S.x + S.w - 5, S.y + 3], [S.x + 3, S.y + 39], [S.x + S.w - 5, S.y + 39]]) { box(g, rx, ry, 2, 2, '#71717A'); box(g, rx, ry, 1, 1, '#D4D4D8'); }
  // (the plate: brass, its edge bevelled, screwed on; the words cut in)
  const pw = textW('MEMBERS ONLY', 1, { gap: 1, space: 3 }) + 16, plx = Math.round(x - pw / 2), ply = S.y + 54;
  box(g, plx - 1, ply - 1, pw + 2, 15, '#1A0E04'); box(g, plx, ply, pw, 13, '#A07A22'); box(g, plx, ply, pw, 1, '#F0D27A'); box(g, plx, ply + 12, pw, 1, '#5A400A'); box(g, plx + pw - 1, ply + 1, 1, 11, '#6A4A10');
  for (const sx of [plx + 2, plx + pw - 4]) { box(g, sx, ply + 5, 2, 2, '#5A400A'); box(g, sx, ply + 5, 1, 1, '#FFF1BE'); }
  engraved(g, 'MEMBERS ONLY', x, ply + 3, 1, '#3A2606', '#E8C060');
};

/** GALACTIC GROOVE's doorway at the top of the stairs: its wall and casing (stamped), the bulbs round it chasing, the
 *  neon on the header (lit, chasing), the double doors (tufted, portholes); kicked in, flat on the floor in it. */
const drawDoor = (c: Ctx, state: GameState, h: Hunter) => {
  const D = DOORWAY;
  if (D.R < state.camera.x - 60 || D.L > state.camera.x + CANVAS_WIDTH + 60) return;
  const f = state.frame, x = DOOR_X;
  stamp(c, 'sp-q-doorway', D.L - 4, D.wall - 4, D.R - D.L + 8, GY - D.wall + 8, paintDoorway);
  // (the bulbs round the casing, chasing: up the columns, across over the opening (under the plate))
  const bulbs: [number, number][] = [];
  for (let y = GY - 30; y > D.top - 14; y -= 30) bulbs.push([D.L + 3, y]);
  for (let bx = D.l - 4; bx <= D.r - 2; bx += 22) bulbs.push([bx, D.top - 20]);
  for (let y = D.top - 14; y < GY - 20; y += 30) bulbs.push([D.R - 9, y]);
  bulbs.forEach(([bx, by], i) => { const on = (i + Math.floor(f / 6)) % 3 === 0; box(c, bx - 1, by - 1, 8, 8, '#05020B'); box(c, bx, by, 6, 6, on ? '#FDE047' : '#78350F'); if (on) box(c, bx + 1, by + 1, 2, 2, '#FFFBEB'); });
  // (the neon on the header: GALACTIC in pink over GROOVE in cyan, chasing; a letter flaring now and then)
  const S = DOOR_SIGN, chase = (k: number) => (i: number) => ((i + k + Math.floor(f / 8)) % 7 === 0 ? 2 : 1);
  neon(c, 'GALACTIC', x, S.y + 5, 2, D_PINK, { slant: 0.5, lit: chase(0), clips: false });
  neon(c, 'GROOVE', x, S.y + 25, 2, D_CYAN, { slant: 0.5, lit: chase(8), clips: false });
  // (kicked: the door goes over, off its hinges, falling away from us into the hall about its bottom edge, faster and
  // faster (seen face on: it shortens down to the floor), flat on the floor in the doorway)
  const fall = h.door === 'kicking' ? Math.max(0, Math.min(1, (h.doorT - 18) / DOOR_FALL)) : h.door === 'in' ? 1 : 0;
  if (fall > 0) {
    // (the way through, behind it: the hall's colors at its foot, stepped up into the dark)
    const col = f % 40 < 20 ? '244, 114, 182' : '125, 211, 252';
    for (let k = 0; k < 4; k++) box(c, D.l, GY - 40 - k * 40, D.r - D.l, 40, `rgba(${col}, ${(0.2 - k * 0.045).toFixed(3)})`);
    const sy = Math.max(0.06, Math.cos(fall * fall * (Math.PI / 2)));
    c.save(); c.translate(x, GY); c.scale(1, sy); c.translate(-x, -GY);
    ink(c, () => c.rect(x - 54, GY - 206, 108, 206), '#7E22CE', 2);
    box(c, x - 50, GY - 200, 44, 194, '#A855F7'); box(c, x + 6, GY - 200, 44, 194, '#A855F7');
    box(c, x - 50, GY - 200, 100, 4, '#E9D5FF');
    c.restore();
    if (fall >= 1) { box(c, x - 54, GY - 13, 108, 3, '#C084FC'); box(c, x - 54, GY - 10, 108, 7, '#7E22CE'); }
    return;
  }
  // (the double doors in the opening: purple vinyl, dark toward their hinges, tufted, a porthole each with the hall's
  // colors through it, chrome push bars)
  ink(c, () => c.rect(x - 54, GY - 206, 108, 206), '#7E22CE', 2);
  box(c, x - 2, GY - 206, 4, 206, '#3B0764');
  box(c, x - 50, GY - 200, 44, 194, '#A855F7'); box(c, x + 6, GY - 200, 44, 194, '#A855F7');
  box(c, x - 50, GY - 200, 44, 4, '#E9D5FF'); box(c, x + 6, GY - 200, 44, 4, '#E9D5FF');
  box(c, x - 50, GY - 196, 6, 190, '#7E22CE'); box(c, x + 44, GY - 196, 6, 190, '#7E22CE');
  c.fillStyle = dith(c, '#7E22CE'); c.fillRect(x - 44, GY - 196, 4, 190); c.fillRect(x + 40, GY - 196, 4, 190);
  for (const dx of [x - 28, x + 28]) {
    box(c, dx - 12, GY - 178, 24, 24, '#05020B');
    box(c, dx - 10, GY - 176, 20, 20, ['#F472B6', '#22D3EE', '#FDE047', '#A78BFA'][(Math.floor(f / 15) + (dx > x ? 1 : 0)) % 4]);
    box(c, dx - 10, GY - 176, 20, 20, 'rgba(10, 5, 16, 0.55)'); box(c, dx - 8, GY - 174, 6, 2, '#FFFFFF');
    for (let r = 0; r < 4; r++) for (let k = 0; k < 2; k++) { box(c, dx - 16 + k * 18, GY - 130 + r * 26, 14, 22, '#9333EA'); box(c, dx - 16 + k * 18, GY - 130 + r * 26, 14, 2, '#C084FC'); box(c, dx - 10 + k * 18, GY - 120 + r * 26, 2, 2, '#581C87'); }
    box(c, dx + (dx > x ? -20 : 16), GY - 112, 4, 18, '#D4D4D8');
  }
  if (f % 30 < 3) box(c, x - 50, GY - 200, 100, 194, 'rgba(255, 255, 255, 0.08)');
};

// ---- Her red, in the air: a soft banded falloff (stamped once into small sprites, ordered-dithered between steps,
// drawn up 2x unsmoothed so the bands and the dither read as pixels), never a flat filled shape. Low and dim: the
// basement stays near black; it's a hint of her, not a lamp on her.

/** A sprite of `w`x`h` (drawn 2x): intensity `fn(u, v)` (0..1 over -1..1) quantized to `steps` with a 2x2 Bayer
 *  dither between them, in one color up to alpha `maxA`. */
const glowSprite = (w: number, h: number, fn: (u: number, v: number) => number, rgb: [number, number, number], maxA: number, steps: number) => {
  const s = document.createElement('canvas'); s.width = w; s.height = h;
  const g = s.getContext('2d')!, img = g.createImageData(w, h), d = img.data;
  const bayer = [0.125, 0.625, 0.875, 0.375];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const v = Math.max(0, Math.min(1, fn((x + 0.5) / w * 2 - 1, (y + 0.5) / h * 2 - 1))) * steps;
    const lv = Math.min(steps, Math.floor(v) + (v - Math.floor(v) > bayer[(y & 1) * 2 + (x & 1)] ? 1 : 0));
    const i = (y * w + x) * 4;
    d[i] = rgb[0]; d[i + 1] = rgb[1]; d[i + 2] = rgb[2]; d[i + 3] = Math.round(lv / steps * maxA * 255);
  }
  g.putImageData(img, 0, 0);
  return s;
};
let redSprites: { halo: HTMLCanvasElement; shaft: HTMLCanvasElement; edge: HTMLCanvasElement; top: HTMLCanvasElement } | null = null;
const reds = () => redSprites ??= {
  // (round her: falls off fast, the middle no brighter than a dim ember)
  halo: glowSprite(96, 96, (u, v) => Math.pow(Math.max(0, 1 - Math.hypot(u, v)), 1.6), [150, 22, 22], 0.34, 6),
  // (a haze shaft down from her: narrow at the top, spreading, fading to nothing by the foot; soft at its sides)
  shaft: glowSprite(48, 128, (u, v) => { const k = (v + 1) / 2, wd = 0.25 + 0.75 * k; return Math.max(0, 1 - Math.abs(u) / wd) * Math.pow(1 - k, 1.4); }, [170, 30, 30], 0.2, 5),
  // (her light bleeding in at the screen's left edge (mirrored for the right): strongest at the edge, round in height)
  edge: glowSprite(64, 150, (u, v) => Math.pow(Math.max(0, (1 - u) / 2), 1.8) * Math.max(0, 1 - v * v), [160, 24, 24], 0.3, 5),
  // (and down from the top edge, over her in a vent)
  top: glowSprite(120, 40, (u, v) => Math.pow(Math.max(0, (1 - v) / 2), 1.8) * Math.max(0, 1 - u * u), [160, 24, 24], 0.3, 5),
};
const sprite = (c: Ctx, s: HTMLCanvasElement, x: number, y: number, w: number, h: number, a: number) => {
  if (a <= 0.004) return;
  c.globalAlpha = Math.min(1, a); c.drawImage(s, Math.round(x), Math.round(y), Math.round(w), Math.round(h)); c.globalAlpha = 1;
};
/** Her pulse: a slow breath, a tick up on each click (`clickT` frames since her last), now and then a dropout. */
const redPulse = (f: number, clickT: number) => 0.82 + 0.12 * Math.sin(f * 0.075) + 0.16 * Math.max(0, 1 - clickT / 4) - ((f * 7919) % 211 < 4 ? 0.3 : 0);

/** Her glow up on the ceiling round her (screen space; sx, top: her body's middle, the ceiling's line), `k` 0..1 how
 *  much of it (fading in/out with her), `s` its size: a halo, a little bloom along the pipes over her, two haze shafts
 *  angling down through the dark, a spill where they land on the floor, a few motes drifting in them. */
const redAir = (c: Ctx, f: number, sx: number, cy: number, top: number, floor: number, k: number, s: number, clickT: number, seed: number) => {
  if (k <= 0.01) return;
  const R = reds(), p = redPulse(f, clickT) * k, sm = c.imageSmoothingEnabled;
  c.imageSmoothingEnabled = false;
  sprite(c, R.halo, sx - 230 * s, cy - 170 * s, 460 * s, 340 * s, 0.75 * p);
  // (the ceiling over her: the bloom caught along the pipes and ducts up there, stepped out from her)
  for (const [w, a] of [[320, 0.05], [200, 0.06], [100, 0.08]] as const) { c.fillStyle = `rgba(200, 40, 40, ${(a * p).toFixed(3)})`; c.fillRect(Math.round(sx - w * s), top, Math.round(2 * w * s), 3); c.fillRect(Math.round(sx - w * s * 0.8), top + 8, Math.round(1.6 * w * s), 2); }
  // (the shafts: two, leaning a little either way, swaying slowly)
  const len = Math.max(60, floor - cy);
  for (let i = 0; i < 2; i++) {
    const lean = (i ? 0.16 : -0.12) + Math.sin(f * 0.011 + i * 2 + seed) * 0.04, w = (i ? 150 : 120) * s;
    c.save(); c.translate(sx + (i ? 24 : -30) * s, cy); c.rotate(lean);
    sprite(c, R.shaft, -w / 2, 0, w, len, (i ? 0.7 : 0.85) * p);
    c.restore();
  }
  // (the spill on the floor under her: a flat smear of it, dim)
  sprite(c, R.halo, sx - 170 * s, floor - 16 * s, 340 * s, 32 * s, 0.45 * p);
  // (dust in the light: a few motes going down slow, faint)
  for (let i = 0; i < 7; i++) {
    const ph = ((f * 0.35 + i * 61 + seed * 37) % 260) / 260, y = cy + ph * len * 0.85, x = sx + Math.sin(f * 0.02 + i * 1.9) * (14 + ph * 70) * s;
    const a = Math.sin(ph * Math.PI) * 0.4 * p;
    if (a > 0.02) { c.fillStyle = `rgba(254, 202, 202, ${a.toFixed(3)})`; c.fillRect(Math.round(x), Math.round(y), 2, 2); }
  }
  c.imageSmoothingEnabled = sm;
};

/** Her edge hint: how much is showing each side and down from the top (eased, so it fades in and out, and crossfades as
 *  she goes from off the side to up over the screen); the height and the top's x it's at (eased: it never jumps between
 *  the ceiling and the floor); whether she's coming (held: it only changes once she's been going the other way a while,
 *  so her turning about where she stands doesn't flick it), and where she was last frame. */
const edgeK = { l: 0, r: 0, t: 0, y: 0, x: 0, come: false, other: 0, lastX: 0, grow: 0 };
/** Her coming at him from off the screen (the stalk, not the stairs): her red bleeding in at that edge ahead of her,
 *  growing a little as she nears, ticking with her clicks; gone once she's on the screen or turns off. Everything off
 *  where she really is, continuously: the side by how far off it she is, fading into the top as she comes on under a
 *  vent. Screen space. */
const drawEdgeHint = (c: Ctx, state: GameState, h: Hunter) => {
  const cam = state.camera, f = state.frame, cx = pmid(state);
  let l = 0, r = 0, t = 0, y = edgeK.y, x = edgeK.x;
  const shown = edgeK.l + edgeK.r + edgeK.t >= 0.01;
  if (!h.finale && !h.chase && h.mode !== 'kill' && h.mode !== 'away') {
    // (coming: out of a vent for him, after him, or going his way; stood still (sniffing, turning about), as she was)
    const moved = h.x - edgeK.lastX;
    let come = edgeK.come;
    if (h.mode === 'tell' || h.mode === 'hunt') { come = true; edgeK.other = 0; }
    else if (Math.abs(moved) > 0.3 && Math.abs(moved) < 60) {
      const toward = Math.sign(moved) === Math.sign(cx - h.x);
      edgeK.other = toward === edgeK.come ? 0 : edgeK.other + 1;
      if (edgeK.other > 20 || !shown) { come = toward; edgeK.other = 0; }
    }
    edgeK.come = come;
    const sx = h.x - cam.x;
    // (how far off the screen she is, by the nearer side; inside it, negative)
    const o = sx < CANVAS_WIDTH / 2 ? -sx : sx - CANVAS_WIDTH;
    const side = Math.max(0, Math.min(1, (o + 20) / 80)), near = Math.max(0, Math.min(1, 1 - Math.max(0, o) / 700));
    if (come) { const v = side * (0.35 + 0.65 * near); if (sx < CANVAS_WIDTH / 2) l = v; else r = v; }
    // (the back ambush's sprint: the red behind him swelling, bigger and bigger, the nearer she gets)
    const wind = h.rush ? (h.rushT < RUSH_WIND ? h.rushT / RUSH_WIND : 1) : 0;
    edgeK.grow += ((h.rush ? Math.max(wind, near) : 0) - edgeK.grow) * 0.15;
    if (h.rush && h.rushT < RUSH_WIND) { const v = 0.15 + 0.85 * wind; if (h.rushSide < 0) { l = v; r = 0; } else { r = v; l = 0; } }
    // (on the screen but up in a vent, coming: a little down out of the top over her)
    if (h.mode === 'tell' && h.entry !== 'duct') t = (1 - side) * Math.min(1, h.t / 60);
    const ty = (h.mode === 'tell' || h.mode === 'ceil' ? CEIL_B + 60 : h.y - 110) - cam.y;
    y = shown ? edgeK.y + (ty - edgeK.y) * 0.06 : ty;
    x = shown ? edgeK.x + (sx - edgeK.x) * 0.2 : sx;
  }
  if (!h.rush) edgeK.grow *= 0.85;
  edgeK.lastX = h.x; edgeK.y = y; edgeK.x = x;
  const ease = (a: number, b: number) => a + (b - a) * (b > a ? 0.04 : 0.08);
  edgeK.l = ease(edgeK.l, l); edgeK.r = ease(edgeK.r, r); edgeK.t = ease(edgeK.t, t);
  if (edgeK.l + edgeK.r + edgeK.t < 0.01) return;
  const period = h.mode === 'tell' ? 10 : h.mode === 'ceil' ? (h.forced ? 4 : 7) : 13, p = redPulse(f, h.t % period);
  const g = edgeK.grow, W = 150 + 260 * g, H = 420 + 260 * g, A = 0.55 + 0.35 * g;
  const R = reds(), sm = c.imageSmoothingEnabled, yy = Math.max(H / 2 - 60, Math.min(CANVAS_HEIGHT - H / 2 + 60, y));
  c.imageSmoothingEnabled = false;
  sprite(c, R.edge, 0, yy - H / 2, W, H, A * edgeK.l * p);
  if (edgeK.r > 0.004) { c.save(); c.translate(CANVAS_WIDTH, 0); c.scale(-1, 1); sprite(c, R.edge, 0, yy - H / 2, W, H, A * edgeK.r * p); c.restore(); }
  sprite(c, R.top, x - 180, 0, 360, 120, 0.4 * edgeK.t * p);
  c.imageSmoothingEnabled = sm;
};

/** Her on the ceiling (the real go, in the world): how much of her glow's showing (eased in, and off as she drops),
 *  and where it was last. */
let ceilK = 0, ceilX = 0;

/** Screen space, over everything: the foreground pipes (parallax, near), and her silhouette crawling along them. */
let sil: HTMLCanvasElement | null = null;
export const drawHunterFront = (c: Ctx, state: GameState, h: Hunter) => {
  const cam = state.camera.x;
  if (cam + CANVAS_WIDTH < B - 100 || cam > STAIRS_A + 100) return;
  // (only down in it: not looking at the hold above, not on the stairs)
  if (state.camera.y < GY - 200) return;
  c.save(); c.beginPath(); c.rect(0, 0, Math.max(0, Math.min(CANVAS_WIDTH, STAIRS_A - 60 - cam)), CANVAS_HEIGHT); c.clip();
  const off = -((cam - B) * 1.35);
  // (her real go along the ceiling: her red in the air round her and down under her, behind the near pipes)
  ceilK += ((inPlay(h) && h.mode === 'ceil' ? 1 : 0) - ceilK) * (h.mode === 'ceil' ? 0.05 : 0.1);
  if (h.mode === 'ceil') ceilX = h.x;
  if (ceilK > 0.01) { const camY = state.camera.y; redAir(c, state.frame, ceilX - cam, CEIL_B + 100 - camY, CEIL_B - 2 - camY, BF - camY, ceilK, 0.75, h.t % 7, 3); }
  // (the pipes: near, out of focus, nearly black; shaded round in steps, a lit line along the top, the emergency
  // strips' red caught along their undersides; their joints and brackets)
  const run = (y: number, h: number) => {
    c.fillStyle = '#030306'; c.fillRect(0, y, CANVAS_WIDTH, h);
    c.fillStyle = '#0C0C14'; c.fillRect(0, y + 2, CANVAS_WIDTH, Math.max(1, h * 0.35));
    c.fillStyle = '#1A1A26'; c.fillRect(0, y + 1, CANVAS_WIDTH, 2);
    c.fillStyle = '#3A0E10'; c.fillRect(0, y + h - 2, CANVAS_WIDTH, 2);
    for (let k = 0; k < 8; k++) { const jx = ((off * 1 + k * 160) % 1280 + 1280) % 1280 - 160; c.fillStyle = '#0A0A12'; c.fillRect(jx, y - 2, 10, h + 4); c.fillStyle = '#22222E'; c.fillRect(jx, y - 2, 10, 1); }
  };
  run(36, 26); run(74, 14);
  for (let k = 0; k < 12; k++) {
    const x = ((off + k * 700) % (12 * 700) + 12 * 700) % (12 * 700) - 200;
    if (x < -80 || x > CANVAS_WIDTH + 80) continue;
    c.fillStyle = '#030306'; c.fillRect(x, 36, 34, CANVAS_HEIGHT);
    c.fillStyle = '#0C0C14'; c.fillRect(x + 4, 36, 10, CANVAS_HEIGHT); c.fillStyle = '#1A1A26'; c.fillRect(x + 3, 36, 2, CANVAS_HEIGHT);
    c.fillStyle = '#3A0E10'; c.fillRect(x + 31, 36, 2, CANVAS_HEIGHT);
    c.fillStyle = '#0B0B12'; c.fillRect(x - 6, 120 + (k % 3) * 120, 46, 12); c.fillStyle = '#20202C'; c.fillRect(x - 6, 120 + (k % 3) * 120, 46, 1);
  }
  if (h.fg) {
    const L = h.fg.len ?? 170, k = h.fg.t / L, sx = h.fg.dir < 0 ? CANVAS_WIDTH + 260 - k * (CANVAS_WIDTH + 520) : -260 + k * (CANVAS_WIDTH + 520);
    if (!sil) { sil = document.createElement('canvas'); sil.width = 640; sil.height = 420; }
    const g = sil.getContext('2d')!;
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, 640, 420);
    g.save(); g.translate(320, 390); g.scale(1.25, 1.25); g.rotate(h.fg.dir * 0.05); g.translate(0, -GY);
    drawQueen(g, 0, h.fg.dir, { pose: 'stalk', t: state.frame, ext: 0, alive: 1, beat: 0, free: true, stride: h.fg.t * 0.2 * (170 / L) });
    g.restore();
    g.globalCompositeOperation = 'source-in'; g.fillStyle = '#030306'; g.fillRect(0, 0, 640, 420); g.globalCompositeOperation = 'source-over';
    // (her red round her: in the air, on the pipes, down through the dark to the floor; in and out with her)
    const env = Math.max(0, Math.min(1, h.fg.t / (24 * L / 170), (L - h.fg.t) / (24 * L / 170))), pulse = redPulse(state.frame, h.fg.t % 9);
    redAir(c, state.frame, sx, 190, 36, BF - state.camera.y, env, 1, h.fg.t % 9, 0);
    c.save(); c.translate(Math.round(sx), 40); c.scale(1, -1);
    c.drawImage(sil, -320, -390, 640, 420);
    c.restore();
    const ex = sx + h.fg.dir * 120, ey = 40 + 300;
    // (her eyes: a touch brighter than the rest of her, a faint halo round them stepped out)
    c.fillStyle = `rgba(132, 255, 80, ${(0.07 * env * pulse).toFixed(3)})`; c.fillRect(ex - 18, ey - 5, 39, 14); c.fillRect(ex - 14, ey - 2, 31, 8);
    box(c, ex - 10, ey, 7, 4, '#84FF50'); box(c, ex + 4, ey, 7, 4, '#84FF50');
    box(c, ex - 8, ey + 1, 3, 2, '#D9FFC8'); box(c, ex + 6, ey + 1, 3, 2, '#D9FFC8');
  }
  c.restore();
  // (her coming from off the screen: her red ahead of her at that edge)
  drawEdgeHint(c, state, h);
  // (the kill cam's bars)
  const camB = camK(state, h);
  if (camB > 0) { const bar = Math.round(camB * 44); c.fillStyle = '#000'; c.fillRect(0, 0, CANVAS_WIDTH, bar); c.fillRect(0, CANVAS_HEIGHT - bar, CANVAS_WIDTH, bar); }
  if (h.mode === 'kill' && killT(state, h) >= K_RIP && killT(state, h) < K_RIP + 3) { c.fillStyle = 'rgba(255, 255, 255, 0.3)'; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
};

/** The dark: a tight light round him, the strips flickering, her eyes when she's out. Null outside the basement. */
export const hunterLighting = (state: GameState, h: Hunter): SceneLight | null => {
  const p = state.player, cx = pmid(state);
  if (cx < B - 80 || cx > DOOR_X + 20 || pfeet(state) < GY - 40 && cx < STAIRS_A) return null;
  const lights: Light[] = [{ x: cx, y: p.pos.y + 30, r: h.hid >= 0 ? 60 : 150, a: 1 }];
  for (const s of STRIPS) {
    if (Math.abs(s - cx) > 900) continue;
    const on = Math.sin(state.frame * 0.13 + s) > -0.6 && (state.frame + s) % 97 > 6;
    if (on) lights.push({ x: s, y: CEIL_B + 20, r: 110, a: 0.6, color: 'rgba(239, 68, 68, 0.12)' });
  }
  // (the catwalks' cage lamps, dim)
  for (const [a, b] of CATWALKS) if (Math.abs((a + b) / 2 - cx) < 1000) lights.push({ x: (a + b) / 2, y: CATWALK_Y - 120, r: 90, a: 0.45, color: 'rgba(253, 186, 116, 0.08)' });
  // (her: the green under her crest; a little of her shape out of the dark, so she reads)
  if (inPlay(h)) {
    const hy = h.mode === 'ceil' ? CEIL_B + 160 : h.y - 190;
    if (h.mode === 'ceil') {
      // (on the ceiling: her red, soft, round her and up along the pipes over her, a faint cone of it down through the
      // dark, a little on the floor under her; breathing, ticking with her clicks, in as she comes on)
      const k = Math.min(1, h.t / 30), q = redPulse(state.frame, h.t % 7) * k;
      lights.push({ x: h.x + h.dir * 50, y: hy, r: 80, a: 0.8 * k, color: 'rgba(132, 255, 80, 0.22)' });
      lights.push({ x: h.x, y: CEIL_B + 100, r: 160, a: 0.32 * q, color: 'rgba(200, 30, 30, 0.22)' });
      lights.push({ x: h.x, y: CEIL_B + 14, r: 260, a: 0.22 * q, color: 'rgba(170, 30, 30, 0.2)' });
      lights.push({ x: h.x, y: CEIL_B + 150, r: BF - CEIL_B - 150, cone: 120, a: 0.12 * q, color: 'rgba(150, 25, 25, 0.16)' });
      lights.push({ x: h.x, y: BF - 4, r: 130, a: 0.14 * q, color: 'rgba(150, 25, 25, 0.18)' });
    } else {
      lights.push({ x: h.x + h.dir * 50, y: hy, r: 80, a: 0.8, color: 'rgba(132, 255, 80, 0.22)' });
      lights.push({ x: h.x, y: h.y - 110, r: 170, a: 0.3 });
    }
  }
  // (the hold's light down through the hole he came down)
  if (state.stageMemo[FELL_MEMO] && Math.abs(LAND_X - cx) < 900) lights.push({ x: LAND_X, y: CEIL_B + 140, r: 240, a: 0.55, color: 'rgba(167, 139, 250, 0.10)' });
  // (the kill: lit up close)
  if (h.mode === 'kill') lights.push({ x: mouthAt(h).x, y: mouthAt(h).y, r: 140, a: 0.9 });
  // (the stairs: the disco's light down them from the door)
  if (cx > STAIRS_A - 600) lights.push({ x: DOOR_X - 60, y: GY - 100, r: 340, a: 0.5, color: 'rgba(244, 114, 182, 0.1)' });
  if (Math.abs(DOOR_X - cx) < 900) lights.push({ x: DOOR_X, y: GY - 120, r: 200, a: 0.8, color: 'rgba(244, 114, 182, 0.12)' });
  // (the neon over the door: its pink and cyan out over the header and down the stairwell's top)
  if (Math.abs(DOOR_X - cx) < 1000) { lights.push({ x: DOOR_X - 20, y: DOOR_SIGN.y + 14, r: 170, a: 0.8, color: 'rgba(244, 114, 182, 0.16)' }); lights.push({ x: DOOR_X + 10, y: DOOR_SIGN.y + 34, r: 130, a: 0.6, color: 'rgba(34, 211, 238, 0.12)' }); }
  void BASE_R;
  return { dark: 0.94, shade: [2, 2, 8], lights, rim: 0.3 };
};
