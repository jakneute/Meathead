// CON-FUCK-TIOUS (BEN SMITH): the hidden armor's teacher, met once in every land at that land's armor find. What's
// shared by every meetup lives here; each land places him (its own secret spot, its trial, its practice target, its
// return cannon) in its own code. The first: Cartoon Land's ball-pit cave (cartoon/kiddie/hidden.ts).
//
//   lines.ts   his lines and Meathead's at him (MEET, NAME, RIDDLE, NUDGE, BYE; PIECE_LINES per piece), his voice
//   art.ts     him in the world (drawBen: the poses, holding the piece he's about to give, or bare-handed after)
//   gross.ts   his gross-up (drawBenGross: the face for every land, each piece's prop and animation over it; PROPS)
//   talk.ts    him saying something (benSays: his words over his head only while they're said)
//   meetup.ts  the meetup's script: the FIRST meeting's long intro (any land) or a LATER one's short one, then the
//              land's piece (meetupScript, tickScript); which off the save's benMet()
//
// Also shared: the return cannon (upgrades/returnCannon.ts) and the YOU GOT card (upgrades/PieceGotCard.tsx, put up
// through ui.gotPiece).

export * from './lines';
export * from './art';
export * from './gross';
export * from './talk';
export * from './meetup';
export * from './trialGate';
