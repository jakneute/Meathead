// Oily Oscar's stage, laid out as data. A Texas oil field, late afternoon.
//
//   I.   The field: crashed down among the pumpjacks. Oil on the ground in two
//        kinds (a slick you slide about on, tar that holds your feet), pits of
//        crude to fall in, pipelines to get up on. The field's security (Texas
//        rangers, Hell's Angels, a deputy behind a riot shield) and its
//        wildlife (armadillos, longhorns, grackles, rattlesnakes).
//   II.  The break room: a little prefab bunker, the union on its break inside.
//        Nobody in there can be touched, and the far door's locked till break's
//        over. A gas line along the wall that could be popped. And then lit.
//   III. The chase: out the far side on a biker's chopper, across the field,
//        the union in their pickups, the rangers in their cruisers, the rest
//        of the bikers, until enough of them are wrecked (it goes round and
//        round till then). Every car and truck that goes ends up in a derrick.
//   IV.  The field office: two of the union out back having a smoke under the
//        NO SMOKING sign. Then Oscar's door, the field burning behind it.
//
// Each part is built in its own coordinates and shifted into place.

import type { EnemyKind } from '../../../types';
import type { GroundRun } from '../../core/terrain';
import { GROUND_Y, BOSS_DOOR_X } from '../../../constants';

export const CP = { FIELD: 0, FIELD_MID: 1, BUNKER: 2, CHASE: 3, END: 4 } as const;

export interface Spawn { kind: EnemyKind; x: number; y: number; variant?: number }
export interface PickupSpot { x: number; y: number; type: 'small_health' | 'large_health' | 'small_ammo' | 'large_ammo' }
/** Something you jump up through and stand on: a pipeline, a derrick's platform. */
export interface Ledge { x: number; y: number; w: number; look: 'pipe' | 'deck' }
/** Oil on the ground: a slick (slide about on it), or tar (it holds your feet). */
export interface OilPatch { x1: number; x2: number; kind: 'slick' | 'tar' }
/** A pit full of crude: fall in and that's it. */
export interface CrudePit { x1: number; x2: number; surface: number }
/** Scenery: a pumpjack nodding away, a derrick, a tank, a flare stack, a sign. */
export interface Prop { look: 'pumpjack' | 'derrick' | 'tank' | 'flare' | 'sign'; x: number; y: number; text?: string }

export interface Course {
  runs: GroundRun[];
  ledges: Ledge[];
  spawns: Spawn[];
  pickups: PickupSpot[];
  oil: OilPatch[];
  pits: CrudePit[];
  props: Prop[];
  /** The field (from where you land to the bunker and out past it). */
  field: { x1: number; x2: number };
  /** The break room: its walls, its floor and roof, the gas line (where it can be popped), the bikers out the far side. */
  bunker: { x1: number; x2: number; roof: number; vein: { x: number; y: number }; bikers: number[] };
  /** The chase: where the road starts, how long one lap of it is (it repeats), how many laps are laid down. */
  chase: { x1: number; x2: number; lap: number; laps: number };
  /** Out back of the field office: where he rides in from, where the two are smoking, the wall they end up on. */
  end: { x1: number; x2: number; smokers: number; wall: number };
  checkpoints: { x: number; y: number }[];
  left: number;
  startX: number;
}

const Y = GROUND_Y;
const FIELD_X0 = -70000;
const CHASE_X0 = -40000;
/** One lap of the chase's road (it's the same all the way round), and how many are laid down end to end. */
export const LAP = 6400, LAPS = 3;
const END_X0 = BOSS_DOOR_X - 2600;

/** How the chase's road rises and falls across a lap: a height every 320 px (up and down all the way: everything's always above or below him). */
const LAP_HEIGHTS = [0, -40, -90, -120, -90, -30, 20, 60, 90, 60, 10, -50, -110, -140, -100, -40, 10, 40, 30, 0];

const part = (x0: number) => {
  const runs: GroundRun[] = [], ledges: Ledge[] = [], spawns: Spawn[] = [], pickups: PickupSpot[] = [], oil: OilPatch[] = [], pits: CrudePit[] = [], props: Prop[] = [];
  return {
    runs, ledges, spawns, pickups, oil, pits, props,
    ground: (x1: number, x2: number, y1 = Y, y2 = y1) => { runs.push({ x1: x0 + x1, y1, x2: x0 + x2, y2 }); },
    ledge: (x: number, y: number, w: number, look: Ledge['look'] = 'pipe') => { ledges.push({ x: x0 + x, y, w, look }); },
    spawn: (kind: EnemyKind, x: number, y = Y, variant?: number) => { spawns.push({ kind, x: x0 + x, y, variant }); },
    pickup: (x: number, y: number, type: PickupSpot['type']) => { pickups.push({ x: x0 + x, y, type }); },
    slick: (x1: number, x2: number) => { oil.push({ x1: x0 + x1, x2: x0 + x2, kind: 'slick' }); },
    tar: (x1: number, x2: number) => { oil.push({ x1: x0 + x1, x2: x0 + x2, kind: 'tar' }); },
    pit: (x1: number, x2: number, surface = Y + 40) => { pits.push({ x1: x0 + x1, x2: x0 + x2, surface }); },
    prop: (look: Prop['look'], x: number, y = Y, text?: string) => { props.push({ look, x: x0 + x, y, text }); },
  };
};

const build = () => {
  // ============ THE FIELD ============
  const f = part(FIELD_X0);
  // Landed in the dirt: a slick to learn on, flat and safe
  f.ground(0, 900); f.slick(420, 640);
  f.prop('pumpjack', 250); f.prop('sign', 760, Y, 'DANGER: H2S');
  f.spawn('armadillo', 780); f.spawn('armadillo', 1000);
  // Up onto a pad, a ranger on it
  f.ground(900, 1100, Y, Y - 60); f.ground(1100, 1500, Y - 60); f.ground(1500, 1700, Y - 60, Y);
  f.prop('derrick', 1260, Y - 60);
  f.spawn('ranger', 1400, Y - 60);
  f.spawn('grackle', 1650, Y - 260);
  // Tar to learn on (it holds you: a shoulder charge gets you out), then a slick right up to the lip of a pit of crude
  f.ground(1700, 2500); f.tar(1850, 2150); f.slick(2330, 2490);
  f.prop('pumpjack', 2000);
  f.pickup(1560, Y - 90, 'small_health');
  f.pit(2500, 2690);
  f.ground(2690, 3400);
  // A pipeline to get up on, a ranger on it; a biker coming; a longhorn
  f.ledge(2860, Y - 110, 220, 'pipe');
  f.spawn('ranger', 2980, Y - 110);
  f.spawn('biker', 3150);
  f.spawn('longhorn', 3320);
  f.pickup(2760, Y - 30, 'small_ammo');
  f.prop('tank', 3100);
  // Down into the low ground: tar and slicks with them in it
  f.ground(3400, 3600, Y, Y + 60); f.ground(3600, 4400, Y + 60);
  f.tar(3720, 3960); f.slick(4080, 4270);
  f.spawn('rattlesnake', 3640, Y + 60);
  f.spawn('biker', 4020, Y + 60);
  f.spawn('deputy', 4330, Y + 60);
  f.prop('pumpjack', 3860, Y + 60); f.prop('flare', 4200, Y + 60);
  f.pickup(3500, Y + 10, 'large_health');
  f.ground(4400, 4600, Y + 60, Y);
  // A pipeline across the last pit
  f.ground(4600, 4760); f.pit(4760, 4930); f.ledge(4745, Y - 36, 200, 'pipe'); f.ground(4930, 7000);
  f.spawn('grackle', 4700, Y - 280);
  f.spawn('armadillo', 5000);
  f.spawn('ranger', 5100);
  f.pickup(4640, Y - 30, 'small_ammo');
  f.prop('derrick', 4560, Y); f.prop('sign', 5140, Y, 'BREAK ROOM');
  // The break room (the fuel for the job's in there)
  f.pickup(5270, Y - 30, 'large_ammo');

  // ============ THE CHASE ============
  const c = part(CHASE_X0);
  const n = LAP_HEIGHTS.length, step = LAP / n;
  for (let lap = 0; lap < LAPS + 1; lap++) {
    for (let i = 0; i < n; i++) {
      const x1 = lap * LAP + i * step;
      c.ground(x1, x1 + step, Y + LAP_HEIGHTS[i], Y + LAP_HEIGHTS[(i + 1) % n]);
    }
  }

  // ============ OUT BACK OF THE FIELD OFFICE ============
  const e = part(END_X0);
  e.ground(-800, 2600);
  // The refill before the door
  e.pickup(2380, Y - 30, 'large_health'); e.pickup(2450, Y - 30, 'large_ammo');
  return { f, c, e };
};

const buildCourse = (): Course => {
  const { f, c, e } = build();
  const all = [f, c, e];
  const runs = all.flatMap(p => p.runs);
  runs.sort((a, b) => a.x1 - b.x1 || a.y1 - b.y1);
  // (the stage draws all of its own ground, the pits of crude between it included)
  for (const r of runs) { r.surface ??= 'dirt'; r.pitAfter = 'clouds'; }
  return {
    runs,
    ledges: all.flatMap(p => p.ledges),
    spawns: all.flatMap(p => p.spawns),
    pickups: all.flatMap(p => p.pickups),
    oil: all.flatMap(p => p.oil),
    pits: all.flatMap(p => p.pits),
    props: all.flatMap(p => p.props),
    field: { x1: FIELD_X0, x2: FIELD_X0 + 7000 },
    bunker: { x1: FIELD_X0 + 5200, x2: FIELD_X0 + 5900, roof: Y - 240, vein: { x: FIELD_X0 + 5445, y: Y - 44 }, bikers: [FIELD_X0 + 6080, FIELD_X0 + 5995, FIELD_X0 + 6165, FIELD_X0 + 6260] },
    chase: { x1: CHASE_X0, x2: CHASE_X0 + LAP * (LAPS + 1), lap: LAP, laps: LAPS },
    end: { x1: END_X0 - 800, x2: BOSS_DOOR_X, smokers: END_X0 + 1060, wall: END_X0 + 1110 },
    checkpoints: [
      { x: FIELD_X0 + 150, y: Y }, { x: FIELD_X0 + 2780, y: Y }, { x: FIELD_X0 + 5050, y: Y },
      { x: CHASE_X0 + 300, y: Y }, { x: END_X0 + 1500, y: Y },
    ],
    left: FIELD_X0 - 2000,
    startX: FIELD_X0,
  };
};

export const COURSE = buildCourse();

export type Place = 'field' | 'bunker' | 'outside' | 'chase' | 'end';
export const placeOf = (x: number): Place => {
  const C = COURSE;
  if (x >= C.end.x1 - 400) return 'end';
  if (x >= C.chase.x1 - 2000 && x < C.chase.x2 + 2000) return 'chase';
  if (x >= C.bunker.x1 && x < C.bunker.x2) return 'bunker';
  if (x >= C.bunker.x2) return 'outside';
  return 'field';
};

/** The crude pit at x, if there is one. */
export const pitAt = (x: number) => COURSE.pits.find(p => x > p.x1 && x < p.x2);
