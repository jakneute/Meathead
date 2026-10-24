// Is he sat in (or carried along by) a set piece's own pose: the helicopter's seat, a dragon's back, a broom, a cart, a
// log, a throne, paddling, carried along? Then the weapons that take his pose over (the mallet's swings, the spellbook's
// reading and flexing) keep out of it: idle, nothing of theirs drawn over him, no move started, so the seat's own pose
// shows every time, whatever he had out going in (the user's: "make sure any equipped weapon is bypassed and he takes
// the same pose every time").

import type { Player } from '../../m1/types';

export const seated = (pl: Player) => !!(pl.copterSeat || pl.tragon || pl.broomRide || pl.cartSeat || pl.logSeat || pl.throne || pl.carried || pl.logPaddle);
