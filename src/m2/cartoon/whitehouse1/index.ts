// CHELSEA AND SOCKS' WACKY WHITE HOUSE ADVENTURES, part one: section 3 of Cartoon Land (job 3's to build; the skeleton's
// stand-in for now). The user's design (cartoon-spec.md, verbatim there): behind the screen, a cartoonish White House; a
// third hand's eraser erases Meathead's sprite and a pen draws him back as a Socks the cat / Meathead hybrid (same moves,
// same special weapons, the ray gun a hairball spit; claws to climb walls; claw charges; scratch beatdown; grabs and
// throws still work); Chelsea runs about nagging like Navi (unharmable), he tells her to shut up; the first pundit
// mini-bosses, in order: ROSS PEROT, JERRY FALWELL ("mario bosses": tanky, jump about and throw shit, 30-60 s of
// concentrated fire, taunting in Saturday-morning-cartoon versions of their 90s talking points; Meathead baffled; can't
// be grabbed: "too greasy"). Satire: "who the hell are these people", not dunking on them.
//
// Checkpoints 20-29. The way back: its left end (the studio's end); on: its right end (part two).

import { stubSection } from '../stub';

export const whitehouse1 = stubSection({
  id: 'whitehouse1', cp: 20, name: 'THE WACKY WHITE HOUSE',
  sign: ["CHELSEA & SOCKS'", 'WACKY WHITE HOUSE ADVENTURES'],
  soon: ['ERASED AND REDRAWN AS A CAT', 'PEROT', 'FALWELL'],
  indoors: '#F1EAD8', ground: ['#B91C1C', '#FCA5A5'],
});
