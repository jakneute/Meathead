// THE MEETUP SCRIPT, shared by every land: which intro he gets (the owner: the first meeting, wherever it happens,
// "establishes his character and his purpose in the game. subsequent visits acknowledge you're back and won't be as
// lengthy"), then that land's piece. Each land supplies only its piece (PIECE_LINES[piece]: ask, sell, the trial) and
// runs the rest itself (its trial, its gift, its tease); this picks FIRST or LATER off the save's benMet().
//
// Use: `meetupScript(pants, piece)` once as the scene starts (and setBenMet(true) when it ends or is skipped: the
// land's call), then `tickScript(state, s, ben)` every frame of the scene. `s.gross`: his gross-up is up (the
// land draws drawBenGross while it is; it holds at least GROSS_MIN frames). `s.pose`: the pose the current line wants.
// `s.done`: the script's over. `skipScript(s)` on a skip (any line still to finish does nothing after).

import type { GameState } from '../../../m1/game/core/state';
import { pickLine } from '../../../m1/game/platform/speech';
import { meatheadSays } from '../../adventure/section';
import { benMet } from '../state';
import { benSays, type BenTalk } from './talk';
import type { BenPose } from './art';
import { MEET, NAME, RIDDLE, FIRST_WHY, PURPOSE, FIRST_REACT, FIRST_ASIDE, AGAIN, AGAIN_MH, type ByPants, type PieceLines } from './lines';

export type Pants = keyof ByPants;
export interface Beat { who: 'ben' | 'mh'; text: string; gross?: boolean; pose?: BenPose }
/** The whole scene's lines, in order: the first meeting's intro or a later one's, then the piece's. */
export const meetupScript = (pants: Pants, piece: PieceLines, first = !benMet()): Beat[] => {
  const p = (r: ByPants) => pickLine(r[pants]);
  const intro: Beat[] = first ? [
    { who: 'mh', text: p(MEET) },
    { who: 'ben', text: NAME[0], gross: true },
    { who: 'ben', text: p(RIDDLE), gross: true },
    { who: 'mh', text: p(FIRST_WHY) },
    ...PURPOSE.map((text): Beat => ({ who: 'ben', text })),
    { who: 'mh', text: p(FIRST_REACT) },
    { who: 'ben', text: FIRST_ASIDE[0] },
  ] : [
    { who: 'ben', text: p(AGAIN), gross: true },
    { who: 'mh', text: p(AGAIN_MH) },
    { who: 'ben', text: pickLine(NAME) },
  ];
  return [...intro, { who: 'mh', text: p(piece.ask) }, { who: 'ben', text: piece.sell[0] }, { who: 'ben', text: piece.trial[0], pose: 'offer' }];
};

/** The gross-up's least time up (frames), however quick its lines. */
export const GROSS_MIN = 150;
export interface Script { beats: Beat[]; i: number; waiting: boolean; token: number; gross: boolean; grossT: number; pose: BenPose; done: boolean }
export const startScript = (beats: Beat[]): Script => ({ beats, i: 0, waiting: false, token: 0, gross: false, grossT: 0, pose: 'stand', done: false });
export const skipScript = (s: Script) => { s.token++; s.done = true; s.gross = false; s.waiting = false; };

/** Each frame of the scene: the next line once the last's done (never two at once), the gross-up on or off. */
export const tickScript = (state: GameState, s: Script, ben: BenTalk) => {
  if (s.done) return;
  if (s.gross) s.grossT++;
  if (s.waiting) return;
  const cur = s.beats[s.i];
  // (the gross-up stays up its least time before the scene cuts back from it)
  if ((!cur || !cur.gross) && s.gross && s.grossT < GROSS_MIN) return;
  if (!cur) { s.done = true; s.gross = false; return; }
  if (cur.gross && !s.gross) s.grossT = 0;
  s.gross = !!cur.gross;
  if (cur.pose) s.pose = cur.pose;
  s.waiting = true;
  const tok = s.token, next = () => { if (s.token === tok) { s.waiting = false; s.i++; } };
  if (cur.who === 'ben') benSays(ben, cur.text, next);
  else meatheadSays(state, cur.text, true, next);
};
