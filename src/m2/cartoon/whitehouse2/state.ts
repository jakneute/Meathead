// The White House, part two's own state (in Cartoon Land's, under 'whitehouse2'): the hazards as they go (the drawers,
// the burners, the globe, the lasers), what the new mean men throw, who's barking what, the pundits' fights, the finale
// (the Clintons' TV, the screen coming down, the real stage). Rebuilt with the stage on every death; what outlives a
// death is below (keyed by landVisit(): what he's said) or in state.stageMemo (the memos).
//
// The memos (they outlive deaths and visits): each pundit beaten (never back); the globe broken; the Clintons' TV and
// the screen down (part one's COLLAPSED_MEMO: after it the whole White House is the stage behind it); who of the mean
// men's actors he killed (each half's list, by their place in its CAST: their bodies lie there after).

import type { GameState } from '../../../m1/game/core/state';
import type { Enemy, Block } from '../../../m1/types';
import type { Said } from '../section';
import { cartoonState, landVisit } from '../section';
import { CAT_MEMO, PEROT_MEMO, FALWELL_MEMO, COLLAPSED_MEMO } from '../whitehouse1/state';

export const LIMBAUGH_MEMO = 'ct-wh-limbaugh';
export const DOLE_MEMO = 'ct-wh-dole';
export const NEWT_MEMO = 'ct-wh-newt';
/** The globe's come off its stand and split on the map cabinet's step. */
export const GLOBE_MEMO = 'ct-wh2-globe';
/** The mean men's actors he killed: part one's and part two's (comma lists of their places in each half's CAST). */
export const DEAD1_MEMO = 'ct-wh1-dead';
export const DEAD2_MEMO = 'ct-wh2-dead';
/** The Chelsea actress has been and gone (a later visit: her wig, the mess). */
export const ACTRESS_GONE_MEMO = 'ct-wh-actress-gone';
export { COLLAPSED_MEMO, CAT_MEMO };

/** Kills recorded (the actor's dead: a body there once the screen's down). */
export const deadList = (state: GameState, memo: string) => new Set((state.stageMemo[memo] ?? '').split(',').filter(Boolean).map(Number));
export const markDead = (state: GameState, memo: string, ix: number) => {
  const s = deadList(state, memo);
  if (s.has(ix)) return;
  s.add(ix);
  state.stageMemo[memo] = [...s].join(',');
};

/**
 * A fresh start somewhere along (the checkpoint-skip cheat, or a save): the world the way a run that got there left it.
 * Past the White House's door he's been redrawn; past each pundit's room he's beaten; past the Oval Office the screen's
 * down. (Part one's build calls this too, first: it reads the memos.)
 */
export const presetMemos = (state: GameState) => {
  const cp = state.checkpoint, m = state.stageMemo;
  if (cp >= 21) m[CAT_MEMO] ??= '1';
  if (cp >= 23) m[PEROT_MEMO] ??= '1';
  if (cp >= 26) m[FALWELL_MEMO] ??= '1';
  if (cp >= 32) m[LIMBAUGH_MEMO] ??= '1';
  if (cp >= 34) m[DOLE_MEMO] ??= '1';
  if (cp >= 35) m[GLOBE_MEMO] ??= '1';
  if (cp >= 37) { m[NEWT_MEMO] ??= '1'; m[COLLAPSED_MEMO] ??= '1'; }
};

/** Something the new mean men throw: a dittohead's sound wave (along the floor, rings spreading), a spin doctor's
 *  dust devil (not thrown: the spin itself is the hit; nothing here). */
export interface Wave { x: number; y: number; vx: number; t: number; from: Enemy | null; dead?: boolean }

/** A pundit's throw: Limbaugh's cigar (lobbed, lit) and his golden microphone (flung out on its cord and reeled back);
 *  Dole's pineapple (lobbed; it bursts in chunks later on) and his campaign button (flung flat); Newt's rolled-up
 *  Contract (lobbed) and his gavel (flung, spinning). */
export interface PunditThrow {
  kind: 'cigar' | 'mic' | 'pineapple' | 'chunk' | 'button' | 'contract' | 'gavel';
  x: number; y: number; vx: number; vy: number; t: number; spin: number; dead?: boolean;
  /** (a pineapple) bursts into chunks where it lands; (the mic) the hand it's reeled back to, the way out. */
  burst?: boolean; ox?: number; oy?: number; back?: boolean;
}

export type PunditId = 'limbaugh' | 'dole' | 'newt';
export interface Pundit {
  id: PunditId;
  phase: 'wait' | 'intro' | 'on' | 'dying' | 'done';
  t: number;
  hp: number; max: number; flash: number;
  e: Enemy | null;
  walls: Block[];
  ledges: Block[];
  said: Said | null; barkAt: number; baffleAt: number;
  introStep: number;
  throws: PunditThrow[];
  /** What he's doing: idle, wind (the tell), second (the tell again), after, leap, hop, flop (Dole's pratfall, Newt's
   *  tantrum: his window). */
  act: string; actT: number; nextAct: number;
}

export interface Drawer { cab: number; k: number; side: -1 | 1; b: Block; out: number; was: number }
export interface Globe {
  /** 'stand' (waiting), 'tell' (wobbling), 'roll', 'split' (broken in two). */
  st: 'stand' | 'tell' | 'roll' | 'split';
  x: number; y: number; vx: number; vy: number; spin: number; t: number;
  /** The halves (split): where each lies, its rock. */
  halves: { x: number; rock: number; v: number }[];
}

/** The finale's scene (after Newt's puff): see finale.ts. */
export interface Finale {
  step: 'queasy' | 'tvdown' | 'bill' | 'hillary' | 'reply' | 'tvoff' | 'shake' | 'fall' | 'catslip' | 'spark' | 'look' | 'actress' | 'answer' | 'done';
  t: number; all: number; line: number;
  /** The TV on its arm: how far down (0..1); talking (who). */
  tv: number; talking: 'bill' | 'hillary' | null;
  /** The screen: how far it's fallen (0..1); the projected cat sliding off him (0..1); the projector's beam (0..1); the
   *  house's work lights coming up (0..1). */
  fall: number; slip: number; beam: number; work: number;
  /** Where he's stood (his feet). */
  x: number; y: number;
}

export interface Wh2 {
  barks: Map<Enemy, Said>; barkAt: number;
  waves: Wave[];
  drawers: Drawer[];
  globe: Globe;
  hazHit: WeakMap<Enemy, number>;
  limbaugh: Pundit; dole: Pundit; newt: Pundit;
  finale: Finale | null;
  /** The screen came down this stage (the projection's gone: no cartoon, no cat, no puffs). */
  real: boolean;
  /** The Chelsea actress (after the screen's down): retching, her words; her spot. */
  actress: { said: Said | null; at: number; x: number; y: number; nagAt: number; heave: number; puddle: number };
  /** The way out's wall (the Oval's far wall till the screen's down). */
  ovalWall: Block | null;
  /** The cast he was built with (their places in CAST: a kill marks the actor dead). */
  castIx: WeakMap<Enemy, number>;
}

const pundit = (id: PunditId, max: number): Pundit => ({
  id, phase: 'wait', t: 0, hp: max, max, flash: 0, e: null, walls: [], ledges: [], said: null, barkAt: -999, baffleAt: -999,
  introStep: 0, throws: [], act: 'idle', actT: 0, nextAct: 60,
});

/** Their health (~40 s, ~45 s and ~60 s of concentrated hairballs: on from Perot's 3900 and Falwell's 5400). */
// (a third of what they were, the user's: they dragged; then two thirds of that, the user's again)
export const LIMBAUGH_HP = 1110, DOLE_HP = 1290, NEWT_HP = 1650;

export const wh2Of = (state: GameState) => cartoonState<Wh2>(state, 'whitehouse2', () => ({
  barks: new Map(), barkAt: -999, waves: [], drawers: [],
  globe: { st: 'stand', x: 0, y: 0, vx: 0, vy: 0, spin: 0, t: 0, halves: [] },
  hazHit: new WeakMap(),
  limbaugh: pundit('limbaugh', LIMBAUGH_HP), dole: pundit('dole', DOLE_HP), newt: pundit('newt', NEWT_HP),
  finale: null, real: false,
  actress: { said: null, at: 0, x: 0, y: 0, nagAt: 0, heave: 0, puddle: 0 },
  ovalWall: null, castIx: new WeakMap(),
}));

/** What he's said this visit (once each a visit: a death doesn't make him say it again). */
let saidVisit = -1;
const said = new Set<string>();
export const saidOnce = (k: string) => {
  if (saidVisit !== landVisit()) { saidVisit = landVisit(); said.clear(); }
  if (said.has(k)) return false;
  said.add(k);
  return true;
};
