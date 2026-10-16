// Foreign Lands, laid out: every section of the stage in its own stretch of the world, left to right, far from
// everything else (from FLX on, well clear of Hollywood Land's HWX).
//
// TWO STRETCHES (the user's): the streets (the World Showcase walk) and the helicopter, about half the play time each.
//
//   THE STREETS are ONE continuous walk (the user: "fewer raw transitions"): the ten pavilions and the helipad butt
//   right up against each other along the lagoon promenade, every one's ends on the promenade at GY, so he walks from
//   Mexico to the helicopter's boarding without a door, a fade or a cut. (The CULTURES OF THE WORLD theater that sat
//   between Canada and the helipad was AXED: the user, 2026-10-16.) The sections are only in the code (whose set
//   pieces, whose enemies, whose checkpoints). No gaps between them: never widen one into the next; if a pavilion needs
//   more room, move every later street section on (and their DOORS) together, or grow it UP (-y).
//   THE HELICOPTER (boarding, the jacking, the shooter round the giant globe) is walked into off the end of Canada (its
//   helipad on the promenade; the flight goes on high over it). HELICOPTER HARRY's arena is cut to (Harry's rocket and
//   the crash put him there), so it sits on its own past a generous gap.
//
// Budget (OWNERSHIP.md): the land plays about as long as Hollywood Land (~79000 world px of play there). The streets
// ~39000 px of play (the pavilions ~3600-3800 each, China's Great Wall 5200 counting its climb by playtime); the
// helicopter about as long again to play (the shooter is auto-scrolled: count it
// by time, ~7 min), then Harry.
//
// Shared file (see OWNERSHIP.md): section owners may only append minimally, and must re-read it before editing.

import { GROUND_Y } from '../../m1/constants';

export const GY = GROUND_Y;
/** Where Foreign Lands starts in the world. */
export const FLX = 600000;

/** The sections, in order: where each runs (world x). The streets' are back to back (one continuous walk). */
export const SECTIONS = {
  /** The way in from the hub (FOREIGN LANDS' gate), then MEXICO: the pyramid climbed up and over (its dusk-lit
   *  marketplace plaza inside, under the terraces), the taco cart, papel picado, the fake volcano. */
  mexico: { x0: FLX, x1: FLX + 4200 },
  /** NORWAY: the stave church climbed, the longship on the wave machine's pool, troll statues, the fjord. */
  norway: { x0: FLX + 4200, x1: FLX + 8000 },
  /** CHINA: THE GREAT WALL, the land's big climb (ramparts up a ridge, watchtowers climbed inside, the gate tower, the
   *  pagoda at the top), the dragon dance, fireworks. */
  china: { x0: FLX + 8000, x1: FLX + 13200 },
  /** GERMANY: the biergarten, the giant cuckoo clock's wheel of figures up to the castle's battlements. */
  germany: { x0: FLX + 13200, x1: FLX + 17000 },
  /** ITALY: Venice: the canals and their gondolas, the palace, the little leaning tower climbed. */
  italy: { x0: FLX + 17000, x1: FLX + 21000 },
  /** JAPAN (stub): the five-story pagoda, torii gates, a koi pond, a vending-machine alley. */
  japan: { x0: FLX + 21000, x1: FLX + 24600 },
  /** MOROCCO (stub): the bazaar's rooftops and hanging carpets, the minaret-ish tower. */
  morocco: { x0: FLX + 24600, x1: FLX + 28200 },
  /** FRANCE (stub): a Paris street, a cafe, an Eiffel-ish tower base climbed. */
  france: { x0: FLX + 28200, x1: FLX + 31800 },
  /** UNITED KINGDOM (stub): a London street, phone booths, a double-decker bus, a pub, fog. */
  uk: { x0: FLX + 31800, x1: FLX + 35400 },
  /** CANADA (stub): the Rockies, a waterfall climb, a lumber camp. */
  canada: { x0: FLX + 35400, x1: FLX + 39000 },
  /** HELICOPTER RIDES ACROSS THE WORLD: walked into off the end of Canada (the helipad, the queue he skips, the
   *  boarding), Harry's tolerance tour, the jacking, the shooter (high over the helipad: heli/geo.ts). */
  heli: { x0: FLX + 39000, x1: FLX + 42000 },
  /** HELICOPTER HARRY (stub): where the crash puts him, the land's boss. */
  harry: { x0: FLX + 52000, x1: FLX + 55000 },
} as const;
export type ForeignId = keyof typeof SECTIONS;
export const SECTION_ORDER: ForeignId[] = ['mexico', 'norway', 'china', 'germany', 'italy', 'japan', 'morocco', 'france', 'uk', 'canada', 'heli', 'harry'];
/** The streets: one continuous walk (the camera runs along the whole of it; no section walls between them). The
 *  helipad's on the end of it (in flight the helicopter section holds the camera itself: its cameraX). */
export const STREETS: ForeignId[] = ['mexico', 'norway', 'china', 'germany', 'italy', 'japan', 'morocco', 'france', 'uk', 'canada', 'heli'];
export const STREETS_X0 = SECTIONS.mexico.x0, STREETS_X1 = SECTIONS.heli.x1;
export const isStreet = (id: ForeignId) => STREETS.includes(id);

/** Where he's put going into a section from the one before it (start) and back into it from the one after (end).
 *  Feet (x, y). Only the cut uses them (heli -> harry, and back): the streets are walked. */
export const DOORS: Record<ForeignId, { start: { x: number; y: number }; end: { x: number; y: number } }> =
  Object.fromEntries(SECTION_ORDER.map(id => [id, { start: { x: SECTIONS[id].x0 + 200, y: GY }, end: { x: SECTIONS[id].x1 - 250, y: GY } }])) as Record<ForeignId, { start: { x: number; y: number }; end: { x: number; y: number } }>;
/** The section before and after one (null: the land's start, the boss's arena). */
export const prevOf = (id: ForeignId): ForeignId | null => SECTION_ORDER[SECTION_ORDER.indexOf(id) - 1] ?? null;
export const nextOf = (id: ForeignId): ForeignId | null => SECTION_ORDER[SECTION_ORDER.indexOf(id) + 1] ?? null;
