// The crater section, laid out (world x from its start, D). Left to right:
//
//   THE IMPACT SITE (outdoors, the time of day's light)   D+0 .. D+5300
//     the furrow the saucer plowed, the bowl it ended up in, the wreck half buried in it (stand on its rim and its
//     dome), the dead all over; out across Futureland's lawns and walks (a crushed churro cart, a toppled monorail
//     pylon, a burning chunk of hull) to XENOSCARE's front: the fiberglass hull of a crashed alien ship, a boarding
//     ramp hatch in it (the runners go in there), the queue's way in at its end.
//   XENOSCARE (indoors: a haunted spaceship, the park's legally distinct derelict: bulkheads, pipes, fog, blacklight,
//   cardboard and fiberglass, speakers in plain sight)   D+5300 .. D+12500
//     the boarding queue (posters, rope rails), the teleporter pre-show (the BOO), then the ship: THE BRIDGE (the
//     tram), THE SPECIMEN BAY (catwalks; the animatronics start getting taken over), THE ENGINE ROOM (the tram again,
//     everything at once), the corridor aft to the hold (the queen's chamber).

import { SECTIONS, GY } from '../geometry';

export const { x0, x1 } = SECTIONS.crater;
export const D = x0;

/** The bowl the saucer's in: down into it, its floor, back up (world x), how deep. */
export const BOWL = { a: D + 760, b: D + 980, c: D + 1940, d: D + 2160, deep: 56 };
/** The wreck: its middle, the rim's ledge (its top's y), the dome's ledge. */
export const WRECK_X = D + 1440;
export const RIM = { x: D + 1190, w: 470, y: GY - 22 };
export const DOME = { x: D + 1360, w: 170, y: GY + 56 - 128 };
/** The churro cart (a solid box to hop), the toppled pylon (a ledge up on it), the burning chunk (scenery). */
export const CART = { x: D + 2900, w: 96, h: 60 };
export const PYLON = { x: D + 4180, w: 360, y: GY - 110 };
export const CHUNK_X = D + 3600;
/** XENOSCARE's front: the fiberglass head; the way in (its mouth); in from here it's indoors. */
export const FACADE_X = D + 5060;
export const HOUSE_DOOR = D + 5300;
/** The ship's boarding hatch, in its front (the runners go in it and are gone). */
export const MOUTH_X = HOUSE_DOOR - 180;
/** The queue (posters, rails) and the pre-show room: its doors (the way in's always open; the way out opens after the
 *  show), where the show starts, where the tube is. */
export const QUEUE_END = D + 6280;
export const PRESHOW = { l: D + 6300, r: D + 7300, trigger: D + 6560, tube: D + 6800 };
/** The ride's halls (each a room of its own: its back wall, its show). */
export const HALLS = {
  bridge: { l: D + 7300, r: D + 8800 },
  specimen: { l: D + 8800, r: D + 10300 },
  engine: { l: D + 10300, r: D + 11850 },
  exit: { l: D + 11850, r: x1 },
} as const;
/** The tram's runs (the ride's car, coming through every so often): from, to. */
export const TRAMS: [number, number][] = [[D + 7560, D + 8720], [D + 10420, D + 11760]];
/** Abduction Bay's catwalks: [x, y, w]. */
export const CATWALKS: [number, number, number][] = [
  [D + 9020, GY - 120, 260], [D + 9380, GY - 210, 240], [D + 9720, GY - 130, 280], [D + 10060, GY - 200, 160],
];
/** The probe lab's crates (stand on them: up out of the tram's way): [x, w, h]. */
export const CRATES: [number, number, number][] = [[D + 10560, 90, 74], [D + 11080, 110, 92], [D + 11500, 90, 74]];
/** The animatronics' rigs: where, what kind of pop. */
export type RigKind = 'floor' | 'ceiling' | 'wall' | 'crate';
/** `hijack`: one the real ones take over (an operator posted near it: see index.ts). Through the house the props are just
 *  the gag, BOO and back; only at the end, in the corridor aft to the hold, right before her, do they take them over. */
export const RIGS: { x: number; kind: RigKind; hijack?: boolean }[] = [
  { x: D + 5900, kind: 'crate' },
  { x: D + 7880, kind: 'ceiling' },
  { x: D + 8480, kind: 'wall' },
  { x: D + 9200, kind: 'floor' },
  { x: D + 9900, kind: 'crate' },
  { x: D + 10740, kind: 'ceiling' },
  { x: D + 11300, kind: 'wall' },
  { x: D + 12050, kind: 'floor', hijack: true },
  { x: D + 12360, kind: 'ceiling', hijack: true },
];
/** The ceiling's underside, indoors. */
export const CEIL = GY - 440;
