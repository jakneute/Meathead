// LEARN THE MAGIC OF HOW CARTOONS ARE MADE (EST. 1994), laid out (x from the section's start, heights up from the ground
// line: Y(h) = GY - h). A walk-through dark ride on foot: one long building, a row of rooms (dioramas cut away along
// the back, the path in front of them), each a step of how a 1994 cartoon got made. Each room sits dim till he walks
// in, then its lights come up (soft fills, never a spotlight) and the narrator tells him about it over the PA (pa.ts).
// Teach, then escalate: each of the staff alone first, then mixed; the platforming climbs (a wall of storyboards),
// teaches a moving cel over safe floor, then the land's own mechanic (the stacks of drawings lean like the square's
// towers) over the reject pile, cels over the paint vat, the camera crane up a wall of film cans. Everything goes both
// ways (he'll be back through here).
//
//   0      THE LOBBY (cp 10, lit from the start): the queue, the marquee; a tour guide. In from the square's door.
//   800    1 THE VISION: Dave (a ponytail, a coffee mug, one doodle on a napkin, framed like a genius), awards; an
//          intern (the coffee) alone, then a guide.
//   1800   2 THE WRITERS' ROOM (cp 11): eleven of America's funniest men; the pitch exec (the laser) alone; an intern.
//   2800   3 STORYBOARDS: a rolling wall of storyboards across the path, too tall to jump: up the flat file and a
//          drafting table, over it (a pickup on top), down the pencil box; Pencil Pete (the spin) past it.
//   3800   4 THE VOICE BOOTH (cp 12): take forty of "meow"; studio security (the tackle), an intern, an exec.
//   4800   5 MODEL SHEETS: the art director's stamp; THE DRYING RACK (a cel shuttling on its trolley over the floor,
//          safe: the moving platform taught) up to a shelf (a pickup); Pencil Pete, a guide, an intern.
//   5600   6 OVERSEAS (cp 13): the long room. Rows of light tables, the night shift drawing, a clock at quarter to
//          three; THE REJECT PILE across the path (sink in and he's coughed back out, hurt), three STACKS OF DRAWINGS
//          standing in it that lean under him (cartoon/sway.ts's towers, the studio's paper look), a light table out
//          in it at the far end; an intern and a guide before it, an exec lasering from the far side, security.
//   7600   7 INK AND PAINT (cp 14): the painters; THE PAINT VAT across the path, two cels on the overhead track
//          shuttling over it (off the near one onto the far one as they pass); Pencil Pete, an exec, an intern.
//   8600   8 THE CAMERA: the rostrum camera; a wall of film cans across the path, too tall: THE CAMERA CRANE's seat
//          going up and down to its top (a pickup), a crate down the far side; security, Pencil Pete.
//   9200   9 PREMIERE NIGHT (cp 15): the red carpet, the show's big promo board ("this process was used to make..."),
//          the mixed crowd; then THE SCREEN: walk in behind it and on (to the cartoon White House).

import { SECTIONS, GY } from '../geometry';
import type { TowerDef } from '../sway';

export const x0 = SECTIONS.studio.x0, x1 = SECTIONS.studio.x1;
export const X = (rx: number) => x0 + rx;
export const Y = (h: number) => GY - h;

/** The ceiling's height over the path. */
export const CEIL_H = 560;
export const CEIL = GY - CEIL_H;
/** How far back the rooms' back walls are (the scale they're drawn at about the eye), the props in them, the rail. */
export const D_BACK = 0.78, D_PROPS = 0.86, D_RAIL = 0.95;

// ---------------------------------------------------------------------------------------------------------------
// The rooms

export type RoomId = 'lobby' | 'vision' | 'writers' | 'storyboards' | 'voice' | 'models' | 'overseas' | 'inkpaint' | 'camera' | 'premiere';
export interface Room { id: RoomId; a: number; b: number; num: number; name: string }
export const ROOMS: Room[] = [
  { id: 'lobby', a: 0, b: 800, num: 0, name: 'THE LOBBY' },
  { id: 'vision', a: 800, b: 1800, num: 1, name: 'THE VISION' },
  { id: 'writers', a: 1800, b: 2800, num: 2, name: "THE WRITERS' ROOM" },
  { id: 'storyboards', a: 2800, b: 3800, num: 3, name: 'STORYBOARDS' },
  { id: 'voice', a: 3800, b: 4800, num: 4, name: 'THE VOICE BOOTH' },
  { id: 'models', a: 4800, b: 5600, num: 5, name: 'MODEL SHEETS' },
  { id: 'overseas', a: 5600, b: 7600, num: 6, name: 'OVERSEAS' },
  { id: 'inkpaint', a: 7600, b: 8600, num: 7, name: 'INK AND PAINT' },
  { id: 'camera', a: 8600, b: 9200, num: 8, name: 'THE CAMERA' },
  { id: 'premiere', a: 9200, b: 10000, num: 9, name: 'PREMIERE NIGHT' },
];
/** Its lights come up once he's this far into it. */
export const LIGHT_IN = 90;
/** Which room x is in. */
export const roomAt = (rx: number) => ROOMS.find(r => rx >= r.a && rx < r.b) ?? (rx < 0 ? ROOMS[0] : ROOMS[ROOMS.length - 1]);

// ---------------------------------------------------------------------------------------------------------------
// The path, the pits, solids, ledges

/** THE REJECT PILE (crumpled drawings, deep: in, and he's coughed back out, hurt; the staff go under for good) and THE
 *  PAINT VAT (the same, in cel paint). */
export const REJECTS: [number, number] = [6150, 7150];
export const VAT: [number, number] = [7850, 8350];
export const PITS: [number, number][] = [REJECTS, VAT];
/** The path: [from, to] at the ground line (between: the pits). */
export const GROUND: [number, number][] = [[-200, REJECTS[0]], [REJECTS[1], VAT[0]], [VAT[1], 10200]];

/** Storyboards: the flat file (a step), the rolling storyboard wall (too tall to jump), the pencil box (the step down,
 *  and back up). */
export const FLATFILE = { a: 3060, b: 3160, h: 105 };
export const STORYWALL = { a: 3250, b: 3330, h: 230 };
export const PENCILBOX = { a: 3330, b: 3415, h: 110 };
/** The drafting table between the flat file and the wall (a ledge). */
export const DRAFTING = { a: 3172, b: 3242, h: 170 };
/** Model sheets: the shelf the drying rack's cel reaches (a pickup up there). */
export const SHELF = { a: 5385, b: 5525, h: 240 };
/** Overseas: the empty light tables at either end of the pile (steps up onto the stacks). */
export const NEAR_DESK = { a: 6020, b: 6120, h: 100 };
export const FAR_DESK = { a: 7060, b: 7160, h: 110 };
/** The camera: the wall of film cans (too tall), the crate down its far side. */
export const FILMCANS = { a: 8800, b: 8900, h: 280 };
export const CRATE = { a: 8900, b: 8990, h: 150 };
/** Solid things (walls with a standable top, lit along it): [from, to, top height]. */
export const SOLIDS: [number, number, number][] = [
  [FLATFILE.a, FLATFILE.b, FLATFILE.h], [STORYWALL.a, STORYWALL.b, STORYWALL.h], [PENCILBOX.a, PENCILBOX.b, PENCILBOX.h],
  [NEAR_DESK.a, NEAR_DESK.b, NEAR_DESK.h], [FAR_DESK.a, FAR_DESK.b, FAR_DESK.h],
  [FILMCANS.a, FILMCANS.b, FILMCANS.h], [CRATE.a, CRATE.b, CRATE.h],
];
/** Ledges (one-way, to stand on): [from, to, height]. */
export const LEDGES: [number, number, number][] = [[DRAFTING.a, DRAFTING.b, DRAFTING.h], [SHELF.a, SHELF.b, SHELF.h]];

// ---------------------------------------------------------------------------------------------------------------
// The stacks of drawings (the land's towers: world coordinates)

const T = (rx: number, h: number): TowerDef => ({ x: X(rx), y: GY + 6, h: h + 6, w: 96 });
export const STACKS: TowerDef[] = [T(6260, 200), T(6590, 220), T(6920, 200)];

// ---------------------------------------------------------------------------------------------------------------
// What moves that he stands on: the drying rack's cel, the paint room's two cels, the camera crane's seat

export interface MoverDef {
  id: 'rack' | 'celA' | 'celB' | 'crane';
  /** Its middle goes between (xa, ha) and (xb, hb): x from the section's start, its top's height. */
  xa: number; xb: number; ha: number; hb: number;
  /** How long there and back (frames), where it starts in that (0..1), how long it waits at each end (0..0.4 of it). */
  period: number; phase: number; dwell: number;
  w: number;
}
export const MOVERS: MoverDef[] = [
  { id: 'rack', xa: 5050, xb: 5335, ha: 120, hb: 120, period: 380, phase: 0, dwell: 0.12, w: 100 },
  { id: 'celA', xa: 7900, xb: 8100, ha: 80, hb: 80, period: 300, phase: 0, dwell: 0.1, w: 100 },
  { id: 'celB', xa: 8100, xb: 8300, ha: 125, hb: 125, period: 300, phase: 0.5, dwell: 0.1, w: 100 },
  { id: 'crane', xa: 8730, xb: 8730, ha: 20, hb: 300, period: 400, phase: 0, dwell: 0.16, w: 100 },
];
/** The overhead track the cels hang off (height). */
export const TRACK_H = 330;

// ---------------------------------------------------------------------------------------------------------------
// The staff, the pickups, the checkpoints

/** [kind, x, height of its feet, variant]. Encounter pass (cartoon-spec.md, 2026-10-21): nobody within a checkpoint's
 *  safe reach (spawnSafe.ts SAFE_X), the staff up on the climbs and over the pits, not lined up on the floor. */
export const CAST: [string, number, number, number?][] = [
  // (the lobby, the vision, the writers: each of them alone first, as before)
  ['m2:ct_guide', 560, 0],
  ['m2:ct_intern', 1150, 0], ['m2:ct_guide', 1520, 0],
  ['m2:ct_exec', 2300, 0], ['m2:ct_intern', 2600, 0],
  // (storyboards: an intern up on the drafting table lobbing coffee down the climb (shove her off it); Pencil Pete at
  // the pencil box's foot, where he comes down off the wall: the point's spiky, so no dive kick on the way down)
  ['m2:ct_intern', DRAFTING.a + 35, DRAFTING.h], ['m2:ct_pencil', 3500, 0],
  // (the voice booth: security with an intern right behind him (charge the guard and he flattens her), the exec at
  // the back with the laser)
  ['m2:ct_guard', 4300, 0], ['m2:ct_intern', 4370, 0], ['m2:ct_exec', 4720, 0],
  // (model sheets: a guide's plates flung flat (jump them), Pete spinning across the floor under the drying rack: up
  // on the moving cel out of his way)
  ['m2:ct_guide', 5020, 0], ['m2:ct_pencil', 5290, 0],
  // (overseas: a guide on the near light table, the step up onto the stacks (knock him into the pile: they go under
  // for good); the exec on the far table lasering him on the leaning stacks; security waiting at the far lip, a bull
  // rush as he lands (sidestep it and he pulls up at the edge; charge him in))
  ['m2:ct_guide', NEAR_DESK.a + 50, NEAR_DESK.h], ['m2:ct_exec', FAR_DESK.a + 50, FAR_DESK.h], ['m2:ct_guard', 7250, 0],
  // (ink and paint: Pete on the far side of the vat, spinning at him as he steps off the cel (into the paint with
  // him); the exec behind; an intern up on the film cans, coffee at him riding the crane's seat up; security at its
  // foot)
  ['m2:ct_pencil', 8440, 0], ['m2:ct_exec', 8530, 0],
  ['m2:ct_guard', 8640, 0], ['m2:ct_intern', FILMCANS.a + 50, FILMCANS.h],
  // (premiere night: the mixed crowd in front of the screen, out of the checkpoint's reach)
  ['m2:ct_guard', 9650, 0], ['m2:ct_pencil', 9715, 0], ['m2:ct_guide', 9785, 0], ['m2:ct_exec', 9845, 0],
];
/** Back later (been behind the screen): the staff gone home but the night security. */
export const NIGHT_CAST: [string, number, number, number?][] = [['m2:ct_guard', 2300, 0], ['m2:ct_guard', 7250, 0], ['m2:ct_guard', 9650, 0]];
/** Pickups (lean): [x, height, type]. */
export const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [
  [1700, 0, 'small_ammo'],
  [STORYWALL.a + 40, STORYWALL.h, 'small_ammo'],
  [SHELF.a + 90, SHELF.h, 'small_health'],
  [NEAR_DESK.a + 50, NEAR_DESK.h, 'small_health'],
  [FILMCANS.a + 50, FILMCANS.h, 'small_health'],
  [9100, 0, 'small_ammo'],
];
export const CHECKPOINTS = [
  { name: 'THE MAGIC OF CARTOONS', cp: 10, x: X(200), y: GY },
  { name: "THE WRITERS' ROOM", cp: 11, x: X(1850), y: GY },
  { name: 'THE VOICE BOOTH', cp: 12, x: X(3860), y: GY },
  { name: 'OVERSEAS', cp: 13, x: X(5660), y: GY },
  { name: 'INK AND PAINT', cp: 14, x: X(7640), y: GY },
  { name: 'PREMIERE NIGHT', cp: 15, x: X(9240), y: GY },
];

/** THE SCREEN at the end: its frame (on its legs, how tall), and past this x behind it he's on his way. */
export const SCREEN = { a: 9640, b: 9900, h: 340, out: 9880 };
/** Back out of the lobby's front doors (to the square). */
export const FRONT_DOOR = 60;

/** Once each a visit, passing: [the gag, from x]. */
export const GAG_AT: [string, number][] = [['grind', 5750], ['screen', 9600]];
/** Where the narrator's extra stories go off (once each, passing): [story, from x]. */
export const STORY_AT: [string, number][] = [['rejects', 6100], ['screen', 9560]];
