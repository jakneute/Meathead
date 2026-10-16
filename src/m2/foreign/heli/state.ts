// The helicopter's own state (one lot per stage build: state.stage is rebuilt every time he dies, so the shooter starts
// again from the landmark he died at; what outlives a death is state.stageMemo (geo.ts MEMO) and the checkpoint).

import type { GameState } from '../../../m1/game/core/state';
import type { Enemy, Projectile } from '../../../m1/types';
import { foreignState, type Said } from '../section';
import type { MechId } from './lines';

/** Where the ride's got to. */
export type Phase =
  | 'pad'      // on foot on the helipad (the queue, Harry waving by his helicopter)
  | 'board'    // the cutscene: he's taken over to it and climbs in; Harry's welcome
  | 'lift'     // up off the pad, the camera going up with it, still the cutscene
  | 'tour'     // round the park, Harry preaching; "SHUT UP, HIPPIE."; Harry out the door, down to the ground, turned
  | 'fly'      // his: the gauntlet (the goon waves and the landmarks)
  | 'end'      // every landmark down: Harry's rocket, the hit, the fall
  | 'gone';    // crashed (the ride's over for good) / off to Harry's arena

/** A landmark mech: where it is in its fight, its health, its business. */
export interface Mech {
  id: MechId; i: number;
  hp: number; max: number;
  st: 'wait' | 'intro' | 'fight' | 'dying' | 'dead';
  t: number;
  /** Its moves: which is on, how far into it, the gap before the next. */
  move: number; mt: number; gap: number; last: number;
  flash: number; hurtSaid: boolean;
  /** Googly eyes: each pupil's offset and its swing (they lag and wobble). */
  eyes: { x: number; y: number; vx: number; vy: number }[];
  /** Its own (an arm angle, the clock's hand, the shells open, the minarets up, the moai risen; the lean, the fall). */
  a: number; b: number; k: number;
  /** The Leaning Tower: how far over (radians: 0 upright, -PI/2 flat), its fall's speed; IMMUNE pops. */
  lean: number; lv: number; pinged: number;
  /** Its taunts' next frame. */
  talkAt: number;
  /** Its arrival (mechs.ts reveal): how far it's sunk into the ground (0 stood up, 1 gone under), its legs unfolded
   *  (0 folded up, 1 stood), its eyes open (0 shut), its shake (px). Before it: a replica on its plinth. */
  sink: number; unfold: number; open: number; shake: number;
  /** Its stomp in from where it came up to its plinth (0 .. 1: there). */
  walk: number;
  /** How long its arrival takes (frames: the first's the longest). */
  introLen: number;
}

/** A shot of theirs (an engine enemy projectile: the engine does its hurt): how it's drawn, any fall on it, any burst. */
export interface ShotLook { col: string; r: number; shape: 'orb' | 'note' | 'rivet' | 'marble' | 'gear' | 'cup' | 'block' | 'rock' | 'feather'; g?: number; burst?: { at: number; n: number; speed: number }; t: number; bounce?: boolean }

/** A beam (a searchlight, a clock hand, an eye laser, a stare, a hug): from (x, y) at angle `a`, `len` long; warning
 *  first (a thin line), then firing. */
export interface Beam { x: number; y: number; a: number; len: number; w: number; warn: number; fire: number; t: number; turn: number; src: string; col: string; track?: number; dmg: number; follow?: () => { x: number; y: number } }

/** Something dropped on a column (a minaret, the giant thumb, a rock): a warning at x, then it comes down. */
export interface Drop { x: number; w: number; t: number; warn: number; kind: 'minaret' | 'thumb' | 'rock'; y: number; src: string; done?: boolean; hit?: boolean }

/** Their minions (keychains, seagulls, gears, lions, scarabs, little heads): small, shot down by anything. */
export interface Minion { kind: 'keychain' | 'gull' | 'gear' | 'lion' | 'scarab' | 'head'; x: number; y: number; vx: number; vy: number; hp: number; t: number; r: number; src: string; flash: number; dead?: boolean }

/** His homing rockets (Y): his own (not the engine's). */
export interface Rocket { x: number; y: number; vx: number; vy: number; t: number; dead?: boolean }

/** A blast (a rocket, a wreck): its look. */
export interface Boom { x: number; y: number; r: number; t: number; big: boolean }

export interface Heli {
  phase: Phase; t: number;
  /** The helicopter's middle bottom (world), his seat in it, its tilt, its flip (0..1 upside down), the rotor's turn. */
  ox: number; oy: number; seat: number; tilt: number; flip: number; rotor: number;
  /** His flying: his own velocity, the knock he last took. */
  vx: number; vy: number; pb: number;
  /** The boost (B): which way, frames left, cooldown. */
  boost: { dx: number; dy: number; t: number } | null; boostCd: number;
  /** The machine gun's next round, the rockets' charges (0..3, fractional while one's coming back). */
  gunCd: number; charges: number; rockets: Rocket[]; wasY: boolean; wasB: boolean;
  booms: Boom[];
  /** The circuit: which landmark's round in front (fractional while the park turns), the clouds' drift. */
  prog: number; spin: number;
  mechs: Mech[]; cur: number;
  /** Between landmarks: the waves left, the next's frame. */
  waves: ((state: GameState) => void)[]; waveAt: number; transit: boolean; transitFrom: number; transitT: number;
  goons: Enemy[];
  /** The last frame a lackey came down onto the fight plane (its entrance done: goons.ts). */
  goonLandAt: number;
  shots: Map<Projectile, ShotLook>;
  beams: Beam[]; drops: Drop[]; minions: Minion[];
  /** Who's saying what: Harry, the landmark, a guest in the queue (over who), a goon (over whom). */
  harry: Said | null; harryBusy: boolean; mech: Said | null; guest: { s: Said; x: number } | null; goonSaid: { s: Said; e: Enemy } | null;
  guestAt: number; heckleAt: number; goonBarkAt: number; gloatAt: number; lastHp: number;
  /** Harry: where he is (world), his pose, his facing, whether he's turned (the swearing). Once he's out the door he's
   *  on the GROUND below, chasing along the park's service road after the helicopter (on foot, and jetpack hops),
   *  working the ride's remote that runs the landmarks: `hop` his height off the road, `hvy` its speed; `remote` frames
   *  left of the remote held up and keyed. */
  hx: number; hy: number; hvx: number; hvy: number; hpose: 'stand' | 'wave' | 'pilot' | 'shoved' | 'fall' | 'jet' | 'aim' | 'fire' | 'gloat' | 'run' | 'remote' | 'down'; turned: boolean;
  hop: number; remote: number; hfacing: 1 | -1;
  /** The view: the stage's zoom (1 on the pad, Z in the air), the reveal's pull back (1: none); how high the park's
   *  camera has got (0 on the pad, 1 up). */
  zoom: number; pull: number; up: number;
  /** Where on screen the pull's about (the screen's middle; the cabin for the kick's punch in). */
  pullX: number; pullY: number;
  /** The last frame he killed something (his snarl in the seat). */
  killAt: number;
  /** Lackeys during a fight: the next group's frame (0: not counting), how many groups so far. */
  fightGoonAt: number; fightGoonN: number;
  /** Cutscene bits: the step it's on, done flags; the skip. */
  step: number; flags: Record<string, boolean>;
  /** The camera's ours (cameraOverride) from the lift on; where it's got to. */
  cam: boolean; camX: number; camY: number;
  /** The end: Harry's rocket (world), the fall, the white. */
  hrocket: { x: number; y: number } | null; fall: number; white: number;
  /** The controls card (frames left). */
  tips: number;
  /** Back here after it's all over (a revisit): the pad's empty. */
  over: boolean;
}

export const heliOf = (state: GameState) => foreignState<Heli>(state, 'heli', () => ({
  phase: 'pad', t: 0, ox: 0, oy: 0, seat: 0, tilt: 0, flip: 0, rotor: 0, vx: 0, vy: 0, pb: 0, boost: null, boostCd: 0,
  gunCd: 0, charges: 3, rockets: [], wasY: false, wasB: false, booms: [], prog: -2.6, spin: 0, mechs: [], cur: 0,
  waves: [], waveAt: 0, transit: false, transitFrom: 0, transitT: 0, goons: [], goonLandAt: -9999, shots: new Map(), beams: [], drops: [], minions: [],
  harry: null, harryBusy: false, mech: null, guest: null, goonSaid: null, guestAt: -9999, heckleAt: 0, goonBarkAt: -9999, gloatAt: -9999, lastHp: -1,
  hx: 0, hy: 0, hvx: 0, hvy: 0, hpose: 'wave', turned: false, hop: 0, remote: 0, hfacing: 1, zoom: 1, pull: 1, up: 0, pullX: 400, pullY: 300, killAt: -999, fightGoonAt: 0, fightGoonN: 0, step: 0, flags: {}, cam: false, camX: 0, camY: 0,
  hrocket: null, fall: 0, white: 0, tips: 0, over: false,
}));
