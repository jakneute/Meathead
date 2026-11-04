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
import { benMet, benGaveCount, benGave, GRAB_FOLLOW_PIECES, type ArmorPiece } from '../state';
import { benSays, type BenTalk } from './talk';
import type { BenPose } from './art';
import {
  MEET, NAME, RIDDLE, FIRST_WHY, PURPOSE, FIRST_REACT, FIRST_ASIDE, AGAIN, AGAIN_MH, ART_OPEN, ART_GRAB_OPEN, ART_MH, ART_HOW, ART_WEEB, ART_HUH, ART_AGAIN,
  BACKSTORY, AGAIN_LAST, FINAL_SET, FINAL_MH, FINAL_DATTE, FINAL_GO,
  type ByPants, type PieceLines, type StoryLine,
} from './lines';

export type Pants = keyof ByPants;
export interface Beat { who: 'ben' | 'mh'; text: string; gross?: boolean; pose?: BenPose }
/** The whole scene's lines, in order: the first meeting's intro or a later one's, then the piece's. */
/** THE HIDDEN ART OF FOLLOW-UPS, for a follow-up piece's meetup: said before the trial line, so what follow-ups are
 *  comes first and the land's trial then teaches its own (the owner's: "ben mentions the 'hidden art' of follow ups
 *  after he already guided me to the follow up. get the sequencing right"). `full`: his first follow-up piece, any land
 *  (the big beat); else the brief mention (`again`, ART_AGAIN by default). `extra`: a line said right after the how (the
 *  shins' flash kick). `how` / `extra` are the beats (indexes in `beats`, -1 none) the buttons are up for; with
 *  `againIsExtra`, the brief mention's an extra (its own buttons), not a how. */
export interface ArtBeats { beats: Beat[]; how: [number, number]; extra: [number, number] }
/** `how`: the lines that say how it goes (ART_HOW by default: the grab's; [] for none: the flash kick first, whose own
 *  lines go in `extra`). `known`: the art's already been taught with a follow-up that isn't a grab (the flash kick), so
 *  a grab piece's full beat opens short (ART_GRAB_OPEN), no Meathead thrill, no weeb exchange (it ran then). */
export const artBeats = (pants: Pants, full: boolean, opts: { extra?: string | string[]; again?: string; againIsExtra?: boolean; how?: string[]; known?: boolean } = {}): ArtBeats => {
  if (!full) return { beats: [{ who: 'ben', text: opts.again ?? ART_AGAIN[0] }], how: opts.againIsExtra ? [-1, -1] : [0, 0], extra: opts.againIsExtra ? [0, 0] : [-1, -1] };
  const beats: Beat[] = opts.known
    ? [{ who: 'ben', text: ART_GRAB_OPEN[0], gross: true }]
    : [{ who: 'ben', text: ART_OPEN[0], gross: true }, { who: 'mh', text: pickLine(ART_MH[pants]) }];
  const howLines = opts.how ?? ART_HOW;
  const how: [number, number] = howLines.length ? [beats.length, beats.length + howLines.length - 1] : [-1, -1];
  for (const text of howLines) beats.push({ who: 'ben', text });
  let extra: [number, number] = [-1, -1];
  const ex = opts.extra === undefined ? [] : typeof opts.extra === 'string' ? [opts.extra] : opts.extra;
  if (ex.length) { extra = [beats.length, beats.length + ex.length - 1]; for (const text of ex) beats.push({ who: 'ben', text }); }
  if (!opts.known) beats.push({ who: 'mh', text: pickLine(ART_WEEB[pants]) }, { who: 'ben', text: ART_HUH[0] });
  return { beats, how, extra };
};
/** A grab follow-up piece's meetup: the full beat unless a GRAB follow-up piece (other than `mine`) has been given
 *  already (the flash kick's art says nothing of grabs); `known`: the flash kick's been, so the art's no news. */
export const grabArt = (mine: ArmorPiece) => ({
  full: !GRAB_FOLLOW_PIECES.some(pc => pc !== mine && benGave(pc)),
  known: benGave('legs'),
});
/** Where `art` starts in a meetup script built with it (it goes in just before the trial line, the last beat). */
export const artStart = (script: Beat[], art: ArtBeats) => script.length - 1 - art.beats.length;

export const meetupScript = (pants: Pants, piece: PieceLines, first = !benMet(), art?: ArtBeats): Beat[] => {
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
    // (the last lair he's met in, whichever land: its own hello)
    { who: 'ben', text: p(meetingNo() === LAST_MEETING ? AGAIN_LAST : AGAIN), gross: true },
    { who: 'mh', text: p(AGAIN_MH) },
    { who: 'ben', text: pickLine(NAME) },
    ...storyBeats(pants),
  ];
  return [...intro, { who: 'mh', text: p(piece.ask) }, { who: 'ben', text: piece.sell[0] }, ...(art?.beats ?? []), { who: 'ben', text: piece.trial[0], pose: piece.trialPose ?? 'offer' }];
};

/** Which meeting this is: the lairs he's met Ben in, this one counted (1..8), whatever order the lands came in (the
 *  pieces Ben's handed over, plus this one: a lair whose piece he's given gets the idle line, not a meetup). */
export const meetingNo = () => benGaveCount() + 1;
export const LAST_MEETING = 8;
const toBeats = (pants: Pants, s: StoryLine[]): Beat[] => s.map(l => (l.who === 'ben' ? { who: 'ben', text: l.text } : { who: 'mh', text: pickLine(l.lines[pants]) }));
/** This later meeting's beat of his backstory (BACKSTORY: the 2nd meeting's first, one more each meeting; the 8th's are
 *  after its gift: giftCoda). */
export const storyBeats = (pants: Pants, n = meetingNo()): Beat[] => {
  const s = BACKSTORY[n - 2];
  return n >= 2 && n < LAST_MEETING && s ? toBeats(pants, s) : [];
};
/** After a gift's own lines (gift, tease, Meathead's): the last piece's (the owner's "special dialogue if your meeting
 *  with ben is the final one. like 'you got all the pieces'"), else nothing. Call it after setBenGave. */
export const giftCoda = (pants: Pants): Beat[] => (benGaveCount() < LAST_MEETING ? [] : [
  { who: 'ben', text: FINAL_SET[0], pose: 'fold' },
  { who: 'mh', text: pickLine(FINAL_MH[pants]) },
  { who: 'ben', text: FINAL_DATTE[0] },
  { who: 'ben', text: FINAL_GO[0] },
]);
/** The beats (in a meetup script built with `art`) the art's buttons are up for: its how, through its piece's own line. */
export const artTipRange = (script: Beat[], art: ArtBeats): [number, number] => {
  const at = artStart(script, art);
  if (art.how[0] < 0) return [-1, -1];
  return [at + art.how[0], at + Math.max(art.how[1], art.extra[1])];
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
