// LEARN THE MAGIC OF HOW CARTOONS ARE MADE (EST. 1994): section 2 of Cartoon Land (job 2's to build; the skeleton's
// stand-in for now). The user's design (cartoon-spec.md, verbatim there): "you walk through this building, fighting off
// enemies inside as lights come on as you progress showing animators working and glossing over the process as you
// advance. make it seem like the americans are the real visionaries and the Koreans who do the hard tedious work
// animating it are the 'suckers'. the voice then goes 'this process was used to make this season's hot new tv show:
// Chelsea Clinton and socks the cat's wacky white house adventures.'" (The satire's target is the narration's smugness.)
// At its end, behind the screen: on into the cartoon White House (whitehouse1).
//
// Checkpoints 10-19. The way back: its left end (in front of the studio's door, DOORS.kiddie.end); on: its right end.

import { stubSection } from '../stub';

export const studio = stubSection({
  id: 'studio', cp: 10, name: 'THE MAGIC OF CARTOONS',
  sign: ['THE MAGIC OF CARTOONS', 'EST. 1994'],
  soon: ['THE LIGHTS COME UP', 'THE VISIONARIES', 'THE "SUCKERS"'],
  indoors: '#241638', ground: ['#3B2A55', '#C4B5FD'],
});
