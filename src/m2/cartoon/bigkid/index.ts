// THE BIG-KID RIDES: section 5 of Cartoon Land (job 5's to build; the skeleton's stand-in for now). The user's design
// (cartoon-spec.md, verbatim there): more platforming among bigger, more intense rides based on 'big kid' Y7 shows and
// early adult animation (the Simpsons and the like, parodied); Meathead refuses to ride them (prejudiced against rides
// without a track: they're for "pussies"); trackless, they try to run into him. Posters for STUPID DAD, a failed
// mid-90s show the producers put too much stock in (the setup for the boss).
//
// Checkpoints 40-49. The way back: its left end (the White House's end); on: its right end (the knockoff area).

import { stubSection } from '../stub';

export const bigkid = stubSection({
  id: 'bigkid', cp: 40, name: 'THE BIG-KID RIDES',
  sign: ['THE BIG-KID ZONE', 'NO TRACKS. NO LIMITS.'],
  soon: ['TRACKLESS RIDES', 'THEY RAM YOU', 'STUPID DAD POSTERS'],
  more: [[4000, ['STUPID DAD', 'TUESDAYS 8/7C', '(1995)']]],
});
