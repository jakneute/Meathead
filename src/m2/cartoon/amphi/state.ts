// The amphitheater's own state (in Cartoon Land's, under 'amphi'): the show as it plays (show.ts), the guard and the
// boss door's cutscene, DAD GUY's intro and the placeholder's end, the VICTORY and the walk-away. Rebuilt with the
// stage on every death; what has to outlive one: the guard down (GUARD_DOWN in state.stageMemo: checkpoints restore
// the world as the run left it), the intro seen (once a visit, keyed by landVisit()), what he's said (once a visit).

import { bossIntroSeen, markBossIntroSeen } from '../../bossIntro';
import type { GameState } from '../../../m1/game/core/state';
import type { Block } from '../../../m1/types';
import type { Said } from '../section';
import type { Victory } from '../../victory';
import type { WalkAway } from '../../walkAway';
import { cartoonState, landVisit } from '../section';
import type { Fight } from './fight';

/** The guard's been kicked (he's down for good: the run's). */
export const GUARD_DOWN = 'ct-amphi-guard';

/** Who's talking on stage (their words drawn over them while said). */
export type Speaker = 'dad' | 'mom' | 'boy' | 'sis' | 'gramps' | 'guard';

/** The show, playing on a loop till he walks on: what it's at, for how long; the Boy along his track (0 at the couch,
 *  1 at the kitchen door) and whether he's got a beer; DAD GUY's pose; a token so a stale line's onDone is dropped. */
export type ShowPhase = 'watch' | 'call' | 'laugh' | 'fetch' | 'kitchen' | 'back' | 'hand' | 'take' | 'drink' | 'tag' | 'frozen';
export type DadPose = 'sit' | 'sip' | 'call' | 'reach' | 'tv' | 'squint' | 'rise' | 'stand' | 'crush' | 'shuffle' | 'gone'
  // (the fight's: sat, the mallet swat (t: wound back 0 .. swung through 1), catching a bottle, puking, baffled (hands on
  // his head); stood: dragging the couch, the Donkey Kong hammer (t: up 0 .. down 1), staggering, lifting the mallet
  // and not, opening the fridge)
  | 'swat' | 'catch' | 'puke' | 'baffled' | 'drag' | 'hammer' | 'stagger' | 'heave' | 'fridge'
  // (his standard death: arms up over his head as the fridge comes down on him)
  | 'cower';
export interface Show {
  phase: ShowPhase; t: number; waiting: boolean; token: number;
  boyU: number; boyBeer: boolean; boyArm: number;
  dad: DadPose; dadT: number; canFull: boolean;
  /** How hard the family's glitching (0 their stiff loop .. 1 sparks and spinning heads). */
  glitch: number;
  /** A family member mid-line on the tape (their mouth flaps). */
  tape: Speaker | null;
}

/** The boss door's cutscene: the warning, the boot, the close-up, him going down, the lines. */
export type KickStep = 'walk' | 'warn' | 'beat' | 'boot' | 'close' | 'keel' | 'line';
export interface Kick { step: KickStep; t: number; skipT: number; waiting: boolean; camX: number }

/** DAD GUY's intro (up to the fight: him dragging the couch up front and dropping back onto it). */
export type IntroStep = 'walk' | 'notice' | 'close' | 'sees' | 'glitch' | 'rise' | 'crush' | 'fight' | 'drag' | 'settle' | 'on';
export interface Intro {
  step: IntroStep; t: number; skipT: number; waiting: boolean; camX: number;
  /** The can (crushed, dropped). */
  crushed: boolean;
  /** The couch dragged up front (0 where the show had it .. 1 on the play plane, the fight's spot). */
  couchU: number;
  closeup: boolean; closeT: number;
}

export interface Amphi {
  show: Show;
  said: Map<Speaker, Said>;
  /** The guard: up (the wall), being kicked, down; his pose's clock. */
  guard: 'up' | 'kick' | 'down'; guardT: number; wall: Block | null;
  kick: Kick | null;
  intro: Intro | null;
  /** THE FIGHT (fight.ts), once the intro's done (or straight on, a retry). */
  fight: Fight | null;
  /** The living room's left-hand wall flown in from the grid (0 up there .. 1 down on the deck: the room shut). */
  flat: number;
  /** Over: VICTORY, the walk-away. */
  won: boolean; wonAt: number; victory: Victory | null; walk: WalkAway | null;
  /** When the guard last groaned. */
  groanAt: number;
}

const freshShow = (): Show => ({ phase: 'watch', t: 120, waiting: false, token: 0, boyU: 0, boyBeer: false, boyArm: 0, dad: 'sit', dadT: 0, canFull: true, glitch: 0, tape: null });
export const amphiOf = (state: GameState) => cartoonState<Amphi>(state, 'amphi', () => ({
  show: freshShow(), said: new Map(),
  guard: 'up', guardT: 0, wall: null, kick: null, intro: null, fight: null, flat: 0,
  won: false, wonAt: 0, victory: null, walk: null, groanAt: -99999,
}));

/** DAD GUY's intro seen this visit (a death or a checkpoint doesn't show it again). */
export const introSeen = (state: GameState) => bossIntroSeen(state, 'dad');
export const markIntroSeen = (state: GameState) => markBossIntroSeen(state, 'dad');

/** What he's said this visit (once each a visit: a death doesn't make him say it again). */
let saidVisit = -1;
const said = new Set<string>();
export const saidOnce = (k: string) => {
  if (saidVisit !== landVisit()) { saidVisit = landVisit(); said.clear(); }
  if (said.has(k)) return false;
  said.add(k);
  return true;
};
