// The theater's own state (one lot per stage build: state.stage is rebuilt when he dies, so a death mid-show starts
// the whole show over from the lobby; the show done is kept in state.stageMemo, SHOW_MEMO).

import type { Enemy, Block } from '../../../m1/types';
import type { GameState } from '../../../m1/game/core/state';
import { foreignState, type Said } from '../section';
import type { CultureId } from './lines';

/** Every kind of animatronic on the revolving stage. */
export type MType =
  | 'bull' | 'matador' | 'dancer' | 'leprechaun' | 'mummy' | 'sphinx' | 'bear' | 'cossack' | 'windmill' | 'maid'
  | 'kangaroo' | 'croc' | 'wrangler' | 'minotaur' | 'hoplite' | 'samba' | 'float';

/** One animatronic: where it is (feet), what it's doing, its real health (its enemy is only a hitbox: show.ts). */
export interface Member {
  type: MType;
  /** Which showpiece, its place in the troupe, a seed for its look. */
  sp: number; k: number; seed: number;
  x: number; y: number; vx: number; vy: number; f: 1 | -1;
  st: string; t: number; cd: number;
  hp: number; max: number; w: number; h: number;
  e: Enemy | null; flash: number;
  dead: boolean; deadT: number;
  /** Who this attack's landed on already (him, or another of the troupe). */
  hit: Set<Member | 'him'>;
  /** Its own (a windmill's blade angle, a beam's sweep, a turn's count, a hop's count). */
  a: number; b: number;
  /** Where it starts each time its curtain goes up. */
  home: number; homeY: number;
}
/** A troupe moving as one (the step-dance line, the shield wall). */
export interface Line { x: number; f: 1 | -1; st: string; t: number; turn: number }
export interface Showpiece { id: CultureId; members: Member[]; visits: number; dead: boolean; line: Line }

/** Something one of them threw (a gold coin, a clog, a boomerang). */
export interface TShot { kind: 'coin' | 'clog' | 'boomerang'; x: number; y: number; vx: number; vy: number; t: number; bounces: number; from: Member; hit: Set<Member | 'him'>; spin: number; dead?: boolean }

export type Mood = 'idle' | 'cheer' | 'boo' | 'gasp' | 'laugh' | 'ovation';
export type Phase = 'wait' | 'intro' | 'rise' | 'play' | 'cancel' | 'timeout' | 'drop' | 'turn' | 'call' | 'done';

export interface Theater {
  phase: Phase; t: number;
  /** The showpiece on (or coming); its clock (frames left); the curtain (0 up, 1 down); the set on the turntable (-1:
   *  bare); the turntable's turn (for the drawing). */
  cur: number; clock: number; curtain: number; set: number; turn: number;
  shows: Showpiece[]; shots: TShot[];
  /** The sphinx's beam this frame (for the drawing): from its eyes to the floor. */
  beam: { x0: number; y0: number; x1: number; y1: number } | null;
  /** The stage-left wing shut behind him once it's on; the stage-right wing door (shut till the show's over). */
  lockL: Block | null; lockR: Block | null; lockK: number;
  /** Who's saying what: the narrator, somebody in the seats (where), the whole house. */
  pa: Said | null; paBusy: boolean; guest: { s: Said; x: number } | null; chant: Said | null;
  said: Record<string, boolean>;
  lastHp: number; paHurtAt: number; guestAt: number; oleAt: number; killed: number;
  /** The house: its mood and how long it's had it; phones up (0..1); the spotlight on him (0..1). */
  mood: Mood; moodT: number; phones: number; spot: number;
  /** Over before this build (a revisit): the house empty, the stage struck. */
  doneAtBuild: boolean;
  confetti: { x: number; y: number; vx: number; vy: number; col: string; t: number }[];
}

export const theaterOf = (state: GameState, make: () => Theater) => foreignState<Theater>(state, 'theater', make);
