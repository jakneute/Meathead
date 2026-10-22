// The boulevard, laid out (x from the section's start, heights up from the ground line). Every stretch has a job: the
// hustlers come in one at a time, then mix; the stunt wires are taught safe, then over a hole, then under fire, then
// down off a height. He jumps about 145 up and 210 across at most; his hands hang 80 over his feet.
//
//   0      Under the HAPPYWOOD BLVD arch (the PA's welcome). The Walk of Fame's stars for nobodies start. Steve's
//          first standee. An AS SEEN IN bench behind a velvet rope, guests photographing it.
//   1000   The hustlers alone: a Marilyn, then a living statue (still, gold: it looks like part of the street).
//   1720   STUNT WIRE 1, the teach: a harmless one over a planter (jump it or ride it; walk up to the harness and he
//          takes hold; it runs the way he faces; up/down reel him in and out; jump to let go).
//   2500   An Elvis, alone. The movie palace (GROWMAN'S CHINA-ISH THEATRE, plywood, sandbags behind): the handprints
//          of nobodies; a Marilyn out front; up a trash can onto its marquee for a small ammo, a statue posed up there.
//   3500   CHECKPOINT. STUNT WIRE 2, over the SINKHOLE in the star pavement (fall in and that's it): a pirate waiting
//          at its landing (don't charge his cutlass: shoot him from the wire).
//   4600   A caped hero, alone (the shield). A statue up on an awning with a small health. The mixed street: an Elvis
//          and a Marilyn side by side, a pirate behind them (charge them into him); tip jars, an AS SEEN IN hydrant.
//   6300   CHECKPOINT. STUNT WIRE 3, under fire: over the ROAD WORK trench, heroes throwing shields at him from the far
//          side, one from the street (low: reel up over it) and one from up on a billboard's catwalk (high: pay out
//          under it).
//   7550   CHECKPOINT. The SCAFFOLD: STUNT WIRE 4, THE SWOOP: up the front of a plywood hotel facade to its end stop
//          under the deck (out of a jump's reach: its bracing and sandbags block the street under it, CLOSED SET);
//          charge at the end of the line and he's launched up onto the deck (a statue, a hero, a small ammo); STUNT
//          WIRE 5 down off the end of the deck, across to the street.
//   9150   The STUDIO TOUR TRAM's stretch: out of its garage on the right, down the street at him, into its garage on
//          the left, again and again (it hurts whoever's in its way: the hustlers too). Up on the bus shelters, or its
//          roof, as it goes by; or STUNT WIRE 6 over the street: reel up over the tram's canopy as it comes under,
//          or charge on past; charge the hustlers stood in the street out of his way.
//   10400  CHECKPOINT. The queue plaza of THRONES OF THE STARS: the last of them all at once; the marquee; on, after the
//          gap, to the coaster.
//
// Back the other way it all still goes: the wires run back from whichever end he finds them at, the deck's wire takes
// him back up onto it.

import { SECTIONS, GY } from '../geometry';
import type { StuntWire } from '../section';

export const X = (rx: number) => SECTIONS.blvd.x0 + rx;
export const Y = (h: number) => GY - h;
/** His hands over his feet, hanging (wires.ts): a harness for him stood on something `h` high hangs at Y(h) - HANDS. */
export const HANDS = 80;

export const SINK = { a: 4000, b: 4380 } as const;
export const TRENCH = { a: 6650, b: 7150 } as const;
export const DECK = { a: 8050, b: 8650, h: 330 } as const;
/** The tram's run: between its two garages (it comes out of the right one, going left). */
export const TRAM = { a: 9150, b: 10350, len: 300, h: 92, v: 5, period: 520 } as const;
export const MARQUEE_X = 11150;
/** The swoop's wire: from the street to its end stop by the scaffold, his feet `h` up there (the deck's 330: only the
 *  swoop off the end gets him up to it). */
export const SWOOP = { a: 7610, b: 7985, h: 130 } as const;
/** The wire over the tram's street. */
export const TRAM_WIRE = { a: 9230, b: 10280 } as const;

/** Ground: [from x, to x] at street level (between them: the sinkhole, the trench). */
export const GROUND: [number, number][] = [[-200, SINK.a], [SINK.b, TRENCH.a], [TRENCH.b, 11700]];

export type SolidWhat = 'planter' | 'trashcan' | 'bracing';
/** Solid things (walk into them, stand on them): [x, top height, w, what]. */
export const SOLIDS: [number, number, number, SolidWhat][] = [
  [1900, 90, 180, 'planter'],
  [2930, 70, 50, 'trashcan'],
  // (under the scaffold's deck: the facade's bracing and sandbags, ground to deck: no way under, CLOSED SET)
  [8150, DECK.h - 16, 70, 'bracing'],
];
export type LedgeWhat = 'marquee' | 'awning' | 'catwalk' | 'scaffold' | 'deck' | 'shelter';
/** Things to stand on (one-way): [x, height, width, what]. */
export const LEDGES: [number, number, number, LedgeWhat][] = [
  [2960, 150, 220, 'marquee'],
  [5380, 120, 150, 'awning'],
  [7380, 220, 150, 'catwalk'],
  // (the scaffold's first lift only: the deck's up out of a jump from it; the wire's swoop gets him up there)
  [7760, 110, 130, 'scaffold'],
  [DECK.a, DECK.h, DECK.b - DECK.a, 'deck'],
  [9420, 120, 130, 'shelter'], [9830, 120, 130, 'shelter'],
];

/** The stunt wires: [from x, height he stands on there, to x, height his feet hang at there, the rig's height]
 *  (keep the order: wires are matched by their place in the list). */
const WIRE_DEFS: [number, number, number, number, number][] = [
  // the teach: over the planter (the rig hoists him over it; up/down reel him)
  [1720, 0, 2240, 0, 300],
  // over the sinkhole
  [3880, 0, 4500, 0, 330],
  // under fire over the trench: the heroes' shields come in low from the street, high from the catwalk (reel up or
  // down out of the way)
  [6540, 0, 7230, 0, 340],
  // THE SWOOP: up the hotel front to the end stop under the deck; charge there and he's launched up onto it
  [SWOOP.a, 0, SWOOP.b, SWOOP.h, 560],
  // down off the deck's end, across to the street
  [8600, DECK.h, 9120, 0, 560],
  // over the tram's street: the tram comes at him under it (reel up over its canopy, or charge on past before it
  // comes); the hustlers stood in the street in his way (charge them off)
  [TRAM_WIRE.a, 0, TRAM_WIRE.b, 0, 380],
];
export const WIRES: StuntWire[] = WIRE_DEFS.map(([a, ha, b, hb, rig]) => ({ from: { x: X(a), y: Y(ha) - HANDS }, to: { x: X(b), y: Y(hb) }, rigY: Y(rig) }));

export type BlvdKind = 'm2:hw_marilyn' | 'm2:hw_elvis' | 'm2:hw_hero' | 'm2:hw_pirate' | 'm2:hw_statue';
/** Who's where: [kind, x, height of what it stands on]. */
export const ENEMIES: [BlvdKind, number, number][] = [
  // alone: a Marilyn, a statue
  ['m2:hw_marilyn', 1080, 0], ['m2:hw_statue', 1450, 0],
  // an Elvis alone; the palace: a Marilyn out front of it, and a statue posed up on the marquee by the ammo (gold, still:
  // part of the sign till he's up there with it)
  ['m2:hw_elvis', 2560, 0], ['m2:hw_marilyn', 2850, 0], ['m2:hw_statue', 3080, 150],
  // a pirate on the sinkhole's far bank, waiting at the wire's landing (the cutlass: shoot him off the wire, or reel up
  // and drop in behind him; don't charge in off it)
  ['m2:hw_pirate', 4430, 0],
  // a hero alone (the shield); a statue up on the awning with the health; then an Elvis and a Marilyn shoulder to
  // shoulder with a pirate at their backs (charge them: they're flung into him, whose cutlass a charge can't take)
  ['m2:hw_hero', 4950, 0], ['m2:hw_statue', 5470, 120], ['m2:hw_elvis', 5660, 0], ['m2:hw_marilyn', 5720, 0], ['m2:hw_pirate', 5870, 0],
  // the trench, under fire: heroes on the far side, one on the ground, one up on the billboard's catwalk
  ['m2:hw_hero', 7450, 220], ['m2:hw_hero', 7310, 0],
  // the deck: a statue, a hero
  ['m2:hw_statue', 8350, DECK.h], ['m2:hw_hero', 8540, DECK.h],
  // the tram's street: an Elvis up on the far bus shelter (the way out of the tram's path is his: clear him off it), a
  // pirate in the street (let the tram have him)
  ['m2:hw_elvis', 9890, 120], ['m2:hw_pirate', 10000, 0],
  // the queue plaza (past the checkpoint's reach): a statue (still: it's on him from behind once he's by), a pirate
  // (shoot him), a Marilyn and an Elvis side by side (charge one into the other), a hero behind them (the bodies fly into
  // him round his shield)
  ['m2:hw_statue', 10800, 0], ['m2:hw_pirate', 10880, 0], ['m2:hw_marilyn', 10960, 0], ['m2:hw_elvis', 11010, 0], ['m2:hw_hero', 11120, 0],
];

/** Lying about up the side routes (lean: small, each for going out of the way). */
export const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [
  [3100, 150, 'small_ammo'],
  [5450, 120, 'small_health'],
  [8450, DECK.h, 'small_ammo'],
  [9890, 120, 'small_health'],
];

/** The lampposts (a PA horn on some, a Steve flier on every one): [x, has a horn]. */
// (each in a gap between the fronts, never in front of a shop's sign; the gaps between the holes' edges and the fronts)
export const LAMPS: [number, boolean][] = [
  [260, true], [1450, false], [2060, false], [2550, true], [3500, false], [4420, true], [4810, false], [5310, false], [5700, false],
  [6585, true], [7200, false], [9000, true], [9605, false], [10450, true], [10880, false],
];
/** Steve's standees (life-size cutouts) and posters (on facades): [x, kind]. */
export const STEVES: [number, 'standee' | 'poster'][] = [[520, 'standee'], [3300, 'standee'], [5120, 'poster'], [6220, 'standee'], [7640, 'poster'], [9060, 'standee'], [10700, 'standee']];

/** The Walk of Fame (a star every so far along the pavement, for nobodies and things). */
export const STAR_NAMES = [
  "THE GUY WHO SAID 'CUT' ONCE", "A STUNT DOG'S UNDERSTUDY", 'YOUR NAME HERE $49.99', 'A LAMP FROM A SITCOM',
  'THE SECOND KEY GRIP', 'MOST OF A STUNTMAN', 'CRAFT SERVICES (1987)', 'THE VOICE OF A CEREAL', 'AN EXTRA WHO SNEEZED',
  'BOOM MIC IN SHOT', 'A FAMOUS PAIR OF PANTS', 'STUNTMAN STEVE (PENDING)', "SOMEBODY'S NEPHEW", 'THE SHARK (BACK HALF)',
  'A GUY WHO OWNS A LIMO', 'YOUR NAME HERE $49.99',
];
export const STAR_STEP = 300;

export const CHECKPOINTS = [
  { name: 'HOLLYWOOD BLVD', cp: 0, x: X(150), y: GY },
  { name: 'THE WALK OF FAME', cp: 1, x: X(3500), y: GY },
  { name: 'THE ROAD WORK', cp: 2, x: X(6300), y: GY },
  { name: 'THE SCAFFOLD', cp: 3, x: X(7560), y: GY },
  { name: 'THRONES OF THE STARS', cp: 4, x: X(10420), y: GY },
];
