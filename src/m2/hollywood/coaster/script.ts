// What's said on each ride, in order (the user: the PA and Meathead never step on each other, and every line he can
// say on a ride actually gets said on it). Each ride's a short script: beats, each at a mark along the track (track.ts),
// or 'board' (said parked, before the train goes: it waits for them). One speaker at a time: a beat whose mark comes up
// while somebody's still talking waits its turn (index.ts runs them), and the train doesn't let him off at the end till
// the script's done. So each ride's lines are budgeted against its stretches (the recorded lengths, the marks' times
// at the ride's speeds): a line that wouldn't be done before the next beat's moment (or the ride's end) is cut or
// moved, not left to pile up. Keep them in step if a ride or a line changes.
//
// The budget, as built (seconds from the train going; the longest line each beat can pick):
//   ride 1 (17.4 s): the PA's spiel 0-7.5 (the first ride; the Steve plug, 5.5, the second; after that a short one,
//            and his lift line after it), the drop 7.6-8.6, the loop 8.8-11.8, the loops going back 11.9-14.9.
//   ride 2 (19.4 s): the drop 2.1-3.1, the loop 3.3-6.3, the top hat 6.4-9.1 (it goes on to 11.9), the cobra's roll
//            11.9-14.0 (the roll itself 12.8-13.6, up and over into it first), the double loop 14.8-17.8.
//   ride 3 (27.0 s): the PA's insanity warning 0-7.9 (the first time; after that his lift line), the drop 9.2-10.2,
//            the insanity loops 13.1-15.1, 17.3-19.0, 19.2-21.6, the corkscrew 21.8-23.9 (it's 21.6-23.6: "I'M A
//            ROTISSERIE CHICKEN" said on it now, not stepped on), the brakes 24.7-26.5.
//   the launch: the PA, parked (6.7: the boosters spooling up), then over the loops and off the end (4.8: the flight
//            goes on till it's done). Meathead says NOTHING on it (the user: the PA talks too much for him to be heard).

import type { GameState } from '../../../m1/game/core/state';
import * as L from './lines';

export type RideName = 'r1' | 'r2' | 'r3' | 'launch' | 'back';
export type Who = 'mh' | 'pa';
/** What a beat can go on: the stage run's own once (true the first time a key's asked for), whether this is his first
 *  time on the train, what's been said so far this ride (by beat). */
export interface Env { state: GameState; first: boolean; once: (k: string) => boolean; said: Map<string, string> }
/** A beat: where (a mark, or 'board'), who says it, and what it picks from (null: nothing this time). */
export interface Beat { at: string; who: Who; pool: (e: Env) => readonly string[] | null }

const R = L.RIDE_LINES;
const mh = (at: string, pool: (e: Env) => readonly string[] | null): Beat => ({ at, who: 'mh', pool });
const pa = (at: string, pool: (e: Env) => readonly string[] | null): Beat => ({ at, who: 'pa', pool });
const board = mh('board', e => (e.first ? L.BOARD : L.BOARD_AGAIN));

export const SCRIPTS: Record<RideName, Beat[]> = {
  r1: [
    board,
    // (the ride's welcome the first time; the Steve plug the next; a short one after that, and his own on the lift)
    pa('depart', e => (e.once('spiel') ? [L.SPIEL_STATION[0]] : e.once('steve-narr') ? [L.SPIEL_LIFT[1]] : [L.SPIEL_STATION[1], L.SPIEL_LIFT[0]])),
    mh('lift', e => ((e.said.get('depart') ?? '').length < 50 ? R.lift : null)),
    mh('drop', () => R.drop),
    mh('loop', () => R.loop),
    mh('twin', () => R.loop),
  ],
  r2: [
    board,
    mh('drop', () => R.drop),
    mh('loop', () => R.loop),
    mh('tophat', () => R.tophat),
    // (up and over into the long roll: said as it goes over and round)
    mh('cobra', () => R.roll),
    mh('double', () => R.loop),
  ],
  r3: [
    board,
    pa('depart', e => (e.once('insane') ? L.SPIEL_INSANE : null)),
    mh('lift', e => (e.said.has('depart') ? null : R.lift)),
    mh('drop', () => R.drop),
    mh('insane0', () => R.insane0),
    mh('insane3', () => R.insane4),
    mh('insane5', () => R.insane8),
    mh('over', () => R.roll),
    mh('home', () => R.brakes),
  ],
  launch: [
    pa('board', () => L.SPIEL_EXPERIMENTAL),
    pa('loop', () => L.SPIEL_FLIGHT),
  ],
  back: [
    mh('drop', () => R.drop),
  ],
};
