// CHELSEA AND SOCKS' WACKY WHITE HOUSE ADVENTURES, part two: section 4 of Cartoon Land (job 4's to build; the skeleton's
// stand-in for now). The user's design (cartoon-spec.md, verbatim there): the rest of the pundit mini-bosses, in order:
// RUSH LIMBAUGH, BOB DOLE, and in the Oval Office at the end NEWT GINGRICH; then a TV screen, Bill and Hillary thanking
// him for his service stopping those 'bad men'; the projector screen showing the cartoon chaos collapses (he was never a
// cat: a clever TV projector, like an early Snapchat filter); tons of dead bodies in the aftermath; he leaves the studio.
//
// Checkpoints 30-39. The way back: its left end (part one's end); on: its right end (the big-kid rides).

import { stubSection } from '../stub';

export const whitehouse2 = stubSection({
  id: 'whitehouse2', cp: 30, name: 'THE OVAL OFFICE',
  sign: ['THE WEST WING', 'TO THE OVAL OFFICE'],
  soon: ['LIMBAUGH', 'DOLE', 'GINGRICH', 'THE PROJECTOR COLLAPSES'],
  indoors: '#E8DFC8', ground: ['#1E3A8A', '#93C5FD'],
});
