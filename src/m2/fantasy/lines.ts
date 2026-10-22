// What's said land-wide in Fairy Land, by voice (each section's own lines are in its folder's lines.ts). In the user's
// voice (blunt, short, vulgar, specific; talk less; fit the trigger); pick with pickLine; clean / shitty / naked pools
// where it's about the state of him. Pure data (tools/voices bundles it in node).

import { allOf, type ByPants } from './talk';

/**
 * From the loudspeaker on he thinks with his dick (the user's): his lines about Piper and the trials, for every
 * section after the square to use (on the way into a trial, passing her castle, a suitor down). The naked pool plays
 * up the boner. Never anything he couldn't know: he's never seen her (her voice, that's all).
 */
export const HORNY: ByPants = {
  clean: [
    'PIPER. PIPER. PIPER. MY BALLS ARE CHANTING IT.', 'EVERY SUITOR I KILL IS ONE LESS DICK IN LINE.', "THAT VOICE. SHE'S GOTTA BE A TEN.",
    "I'M NOT HERE FOR THE RIDES. I'M HERE TO GET RODE.", 'AUDIENCE MEANS SEX. I LOOKED IT UP. IN MY HEART.',
  ],
  shitty: [
    'SHIT PANTS, HARD DICK. I CAN WORK WITH THIS.', "SHE WON'T MIND THE SMELL. PIXIES LIVE IN DIRT.",
    "I'M COMING, PIPER. ALREADY CAME. OUT THE BACK.",
  ],
  nude: [
    'FULL MAST. FAIRY LAND, HERE I COME.', "NO PANTS. SAVES TIME WITH PIPER.", 'THIS BONER HAS A DESTINATION.',
    'MOVE, PEOPLE. THIS THING HAS THE RIGHT OF WAY.',
  ],
};

export const VOICE_LINES: Record<string, string[]> = {
  meathead: allOf(HORNY),
};
