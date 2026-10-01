// Oily Oscar's stage, laid out as data. A Texas oil field, late afternoon.
//
//   I.   The field: crashed down among the pumpjacks. Oil on the ground in two
//        kinds (a slick you slide about on, tar that holds your feet), pits of
//        crude to fall in, pipelines to get up on. The field's security (Texas
//        rangers, bikers, a deputy behind a riot shield) and its
//        wildlife (armadillos, longhorns, grackles, rattlesnakes).
//   II.  The break room: a little prefab bunker, the union on its break inside.
//        Nobody in there can be touched, and the far door's locked till break's
//        over. A gas line along the wall that could be popped. And then lit.
//   II½. The yard out back of it: the bikers' camp (their choppers parked up in rows behind, more of them cruising
//        about), and a stretch of rigs to get across: derrick decks on skids being dragged back and forth over the
//        pits, a derrick's lift going up and down, and the ground spouting oil (it knocks you flying; set the vent
//        alight first and it's a column of fire instead). Then Dirty Dan and his chopper.
//   III. The chase: out the far side on a biker's chopper, across the field,
//        the union in their pickups, the rangers in their cruisers, the rest
//        of the bikers, until enough of them are wrecked (it goes round and
//        round till then). Every car and truck that goes ends up in a derrick.
//   IV.  The field office: two of the union out back having a smoke under the
//        NO SMOKING sign. Then a stretch where the ground spouts oil, the broken gas lines lighting the vents for you,
//        and Oscar's door, the field burning behind it.
//
// Each part is built in its own coordinates and shifted into place.

import type { EnemyKind } from '../../../types';
import type { GroundRun } from '../../core/terrain';
import { GROUND_Y, BOSS_DOOR_X } from '../../../constants';

export const CP = { FIELD: 0, FIELD_MID: 1, FIELD_MID2: 2, BUNKER: 3, YARD: 4, CHASE: 5, END: 6, END_MID: 7, BAR: 8, BOSS: 9 } as const;

export interface Spawn { kind: EnemyKind; x: number; y: number; variant?: number }
export interface PickupSpot { x: number; y: number; type: 'small_health' | 'large_health' | 'small_ammo' | 'large_ammo' }
/** Something you jump up through and stand on: a pipeline, a derrick's platform. */
export interface Ledge { x: number; y: number; w: number; look: 'pipe' | 'deck' | 'stage' }
/** Oil on the ground: a slick (slide about on it), or tar (it holds your feet). */
export interface OilPatch { x1: number; x2: number; kind: 'slick' | 'tar'; /** It keeps leaking back after it's burned off. */ refills?: boolean }
/**
 * A ruptured gas line spitting fire: on and off in a rhythm (it hisses and sparks just before), pointing up out of the
 * ground (or a pit), or along it. Its flame hurts, burns anything in it, and lights any oil it touches.
 */
export interface Jet { x: number; y: number; dir: 'up' | 'left' | 'right'; len: number; period: number; phase: number; on: number }
/**
 * A vent in the ground that spouts oil: it bubbles and the ground shakes, then a column of crude goes up out of it (it
 * knocks anything in it flying, and hurts). Put a flame to it first (his flamethrower, burning oil over it, a gas
 * line's fire reaching it) and the next one's a column of fire instead, and that's worse.
 */
export interface Geyser { x: number; y: number; period: number; phase: number }
/** A derrick on the move: a deck on skids dragged back and forth (dx), or a derrick's lift going up and down (dy). `x` is its left edge mid-travel. */
export interface Mover { x: number; y: number; w: number; dx: number; dy: number; period: number; phase: number; look: 'skid' | 'lift' }
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
  jets: Jet[];
  geysers: Geyser[];
  movers: Mover[];
  pits: CrudePit[];
  props: Prop[];
  /** The field (from where you land to the bunker and out past it). */
  field: { x1: number; x2: number };
  /** The break room: its walls, its floor and roof, the gas line (where it can be popped), the bikers out the far side. */
  bunker: { x1: number; x2: number; roof: number; vein: { x: number; y: number }; bikers: number[] };
  /** The yard out back of the break room, up to the bikers (where their camp's drawn behind). */
  yard: { x1: number; x2: number };
  /** The chase: where the road starts, how long one lap of it is (it repeats), how many laps are laid down. */
  chase: { x1: number; x2: number; lap: number; laps: number };
  /** Out back of the field office: where he rides in from, where the two are smoking, the wall they end up on. */
  end: { x1: number; x2: number; smokers: number; wall: number };
  /**
   * The bikers' bar: its walls and ceiling, the band's stage, the bathroom at the back (you go in to see it), and the three
   * gas lines (one low behind the jukebox, one high over the stage, one in the bathroom).
   */
  bar: { x1: number; x2: number; ceil: number; stage: { x: number; y: number; w: number }; bathroom: { x1: number; x2: number }; veins: { x: number; y: number }[] };
  checkpoints: { x: number; y: number }[];
  left: number;
  startX: number;
}

const Y = GROUND_Y;
const FIELD_X0 = -70000;
const CHASE_X0 = -40000;
/** One lap of the chase's road (it's the same all the way round), and how many are laid down end to end. */
export const LAP = 6400, LAPS = 3;
/** The yard out back of the break room (it pushes the bikers, and the far end of the field, along); the stretch of geysers added out back of the field office. */
const YARD = 2700, GEYSERS = 1000;
const END_X0 = BOSS_DOOR_X - 7600 - GEYSERS;
/** The bikers' bar, the last room before Oscar's (local to the office end): its walls, the band's stage, the bathroom in the back. */
const BAR_X1 = 6150, BAR_X2 = 7350;

/** How the chase's road rises and falls across a lap: a height every 320 px (up and down all the way: everything's always above or below him). */
const LAP_HEIGHTS = [0, -40, -90, -120, -90, -30, 20, 60, 90, 60, 10, -50, -110, -140, -100, -40, 10, 40, 30, 0];

const part = (x0: number) => {
  const runs: GroundRun[] = [], ledges: Ledge[] = [], spawns: Spawn[] = [], pickups: PickupSpot[] = [], oil: OilPatch[] = [], pits: CrudePit[] = [], props: Prop[] = [], jets: Jet[] = [];
  const geysers: Geyser[] = [], movers: Mover[] = [];
  return {
    runs, ledges, spawns, pickups, oil, pits, props, jets, geysers, movers,
    geyser: (x: number, y: number, period: number, phase: number) => { geysers.push({ x: x0 + x, y, period, phase }); },
    mover: (x: number, y: number, w: number, dx: number, dy: number, period: number, phase: number, look: Mover['look']) => { movers.push({ x: x0 + x, y, w, dx, dy, period, phase, look }); },
    jet: (x: number, y: number, dir: Jet['dir'], len: number, period: number, phase: number, on = 60) => { jets.push({ x: x0 + x, y, dir, len, period, phase, on }); },
    ground: (x1: number, x2: number, y1 = Y, y2 = y1) => { runs.push({ x1: x0 + x1, y1, x2: x0 + x2, y2 }); },
    ledge: (x: number, y: number, w: number, look: Ledge['look'] = 'pipe') => { ledges.push({ x: x0 + x, y, w, look }); },
    spawn: (kind: EnemyKind, x: number, y = Y, variant?: number) => { spawns.push({ kind, x: x0 + x, y, variant }); },
    pickup: (x: number, y: number, type: PickupSpot['type']) => { pickups.push({ x: x0 + x, y, type }); },
    slick: (x1: number, x2: number, refills = false) => { oil.push({ x1: x0 + x1, x2: x0 + x2, kind: 'slick', refills }); },
    tar: (x1: number, x2: number, refills = false) => { oil.push({ x1: x0 + x1, x2: x0 + x2, kind: 'tar', refills }); },
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
  f.pit(2500, 2660);
  f.ground(2660, 3400);
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
  // A derrick's deck to get up on, a ranger up on it; then a wide pit of crude with one pipe across the middle of it
  // to hop via
  f.ground(4600, 4900);
  f.prop('derrick', 4760); f.ledge(4690, Y - 120, 150, 'deck');
  f.spawn('ranger', 4770, Y - 120);
  f.pickup(4640, Y - 30, 'small_ammo');
  f.pit(4900, 5260); f.ledge(5030, Y - 50, 110, 'pipe');
  f.spawn('grackle', 5080, Y - 300);
  // A slick down the run-in to a rise, bikers and a longhorn up on top of it
  f.ground(5260, 5500); f.slick(5290, 5490);
  f.ground(5500, 5700, Y, Y - 80); f.ground(5700, 6100, Y - 80); f.ground(6100, 6300, Y - 80, Y);
  f.spawn('biker', 5820, Y - 80); f.spawn('longhorn', 6020, Y - 80);
  f.prop('pumpjack', 5900, Y - 80); f.prop('tank', 6240, Y);
  f.pickup(5760, Y - 110, 'small_health');
  // Tar with the deputy stood the far side of it, a rattlesnake in the scrub; a flare stack burning
  f.ground(6300, 7000); f.tar(6350, 6560);
  f.spawn('deputy', 6660); f.spawn('rattlesnake', 6800); f.spawn('armadillo', 6920);
  f.prop('flare', 6450); f.pickup(6600, Y - 30, 'small_ammo');
  // A pipeline across the last pit
  const S = 2400;
  f.ground(4600 + S, 4760 + S); f.pit(4760 + S, 4930 + S); f.ledge(4745 + S, Y - 36, 200, 'pipe'); f.ground(4930 + S, 8900);
  f.spawn('grackle', 4700 + S, Y - 280);
  f.spawn('armadillo', 5000 + S);
  f.spawn('ranger', 5100 + S);
  f.pickup(4640 + S, Y - 30, 'small_health');
  f.prop('derrick', 4560 + S, Y); f.prop('sign', 5140 + S, Y, 'BREAK ROOM');
  // The break room (the fuel for the job's in there)
  f.pickup(5270 + S, Y - 30, 'large_ammo');

  // ============ THE YARD ============
  // Out the far side, the bikers' camp behind, and the rigs to get across before Dirty Dan's chopper.
  // A vent on its own first: watch it go (and see what fire does to it)
  f.geyser(8740, Y, 230, 0);
  f.spawn('biker', 8840);
  // A pit of crude with a derrick deck on skids dragged back and forth across it
  f.pit(8900, 9300); f.mover(9045, Y - 24, 130, 190, 0, 280, 0, 'skid');
  f.spawn('grackle', 9100, Y - 300);
  // A derrick's lift up to its deck (a biker up there), the ground under it spouting, a slick round the vents
  f.ground(9300, 9900);
  f.mover(9360, Y - 120, 110, 0, 150, 260, 0, 'lift');
  f.ledge(9500, Y - 240, 170, 'deck'); f.prop('derrick', 9585, Y);
  f.spawn('biker', 9580, Y - 240); f.spawn('biker', 9760);
  f.slick(9560, 9860); f.geyser(9640, Y, 200, 60); f.geyser(9820, Y, 200, 160);
  f.pickup(9330, Y - 30, 'small_ammo');
  // A wide pit: a lift up out of it, then a skid across the rest
  f.pit(9900, 10350); f.mover(9930, Y - 70, 110, 0, 110, 230, 1.5, 'lift'); f.mover(10140, Y - 120, 120, 150, 0, 250, 0.8, 'skid');
  f.spawn('grackle', 10100, Y - 320);
  // Three vents in tar, the bikers coming at him over it, a flare stack going
  f.ground(10350, 12100);
  f.tar(10560, 10860); f.geyser(10500, Y, 210, 0); f.geyser(10700, Y, 210, 70); f.geyser(10900, Y, 210, 140);
  f.ledge(10600, Y - 130, 140, 'pipe');
  f.spawn('biker', 10620); f.spawn('biker', 10820); f.spawn('ranger', 10615, Y - 130);
  f.prop('flare', 10420); f.prop('sign', 10990, Y, 'NO PARKING (HOGS ONLY)');
  f.pickup(10400, Y - 30, 'small_health'); f.pickup(10980, Y - 30, 'small_ammo');

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
  e.ground(-800, 1950);
  // ============ THE VENTS ============
  // The ground spouting, the broken gas lines going off beside the vents and lighting them for you: wait for the fire
  // to go out of one, or get past while it's only oil
  e.geyser(1880, Y, 200, 0); e.jet(1800, Y, 'right', 100, 200, 120, 50);
  e.pit(1950, 2110); e.ledge(1990, Y - 40, 90, 'pipe');
  e.ground(2110, 2760);
  e.slick(2200, 2400, true); e.geyser(2300, Y, 220, 90);
  e.ledge(2380, Y - 120, 150, 'deck'); e.prop('derrick', 2455, Y);
  e.geyser(2600, Y, 190, 30); e.jet(2690, Y, 'left', 110, 190, 140, 50);
  e.spawn('biker', 2240, Y, 7); e.spawn('ranger', 2450, Y - 120, 7); e.spawn('biker', 2460, Y, 7);
  e.pickup(2130, Y - 30, 'small_health');
  // ============ AND THE REST OF IT ============
  const r = part(END_X0 + GEYSERS);
  r.ground(1760, 2300);
  // ============ AND THE LAST OF IT, BURNING, UP TO OSCAR'S DOOR ============
  // (what's left of the mob that came after him, bloodied and furious; gas lines ruptured everywhere, spitting fire,
  // and the oil pooling back as fast as it burns off)
  // A broken line licking fire along the ground onto a slick, again and again: watch it go up, burn off, pool back
  r.slick(1860, 2160, true); r.jet(1820, Y, 'right', 110, 330, 0, 70); r.jet(2200, Y, 'left', 110, 330, 165, 70);
  r.spawn('ranger', 2260, Y, 7); r.spawn('biker', 2150, Y, 7);
  r.pickup(1760, Y - 30, 'small_ammo');
  // A pit of crude, a pipeline across it, a jet of fire straight up through the middle of it
  r.pit(2300, 2560); r.ledge(2285, Y - 40, 290, 'pipe'); r.jet(2430, Y + 40, 'up', 200, 150, 40, 55);
  r.ground(2560, 2960);
  r.spawn('biker', 2800, Y, 7);
  r.pickup(2900, Y - 30, 'small_health');
  // Tar with a line spitting fire along it (it burns a long time): up on the derrick decks over it
  r.ground(2960, 3700); r.tar(3000, 3440, true); r.jet(2975, Y, 'right', 120, 520, 100, 80);
  r.ledge(3050, Y - 110, 120, 'deck'); r.ledge(3230, Y - 160, 120, 'deck'); r.ledge(3410, Y - 110, 120, 'deck');
  r.prop('derrick', 3290, Y);
  r.spawn('ranger', 3290, Y - 160, 7); r.spawn('deputy', 3620, Y, 7);
  // Down a slick into the low ground, two jets in it going off in turn, bikers coming up it at him
  r.ground(3700, 3900, Y, Y + 80); r.ground(3900, 4400, Y + 80); r.ground(4400, 4550, Y + 80, Y);
  r.slick(3740, 4360, true); r.jet(3980, Y + 80, 'up', 160, 240, 0, 60); r.jet(4220, Y + 80, 'up', 160, 240, 120, 60);
  r.spawn('biker', 4120, Y + 80, 7); r.spawn('biker', 4320, Y + 80, 7); r.spawn('ranger', 4500, Y, 7);
  r.pickup(3760, Y - 30, 'small_health');
  // A trench of tar with a jet at each end taking turns setting it going, pipe stands over it, a jet up between them
  r.ground(4550, 5550);
  r.tar(4700, 5260, true); r.jet(4690, Y, 'right', 170, 300, 0, 90); r.jet(5270, Y, 'left', 170, 300, 150, 90);
  r.ledge(4760, Y - 90, 100, 'pipe'); r.ledge(4930, Y - 150, 100, 'pipe'); r.ledge(5100, Y - 90, 100, 'pipe');
  r.jet(5040, Y, 'up', 120, 180, 90, 50);
  r.spawn('biker', 4620, Y, 7); r.spawn('ranger', 4980, Y - 150, 7); r.spawn('biker', 5400, Y, 7);
  r.pickup(5480, Y - 30, 'small_health');
  // Up over the last pit on pipe stands, a jet up through the middle one
  const D = 1000;
  r.ground(4550 + D, 4600 + D); r.pit(4600 + D, 5000 + D);
  r.ledge(4640 + D, Y - 70, 100, 'pipe'); r.ledge(4770 + D, Y - 130, 100, 'pipe'); r.ledge(4900 + D, Y - 70, 100, 'pipe');
  r.jet(4820 + D, Y + 40, 'up', 280, 200, 60, 60);
  r.ground(5000 + D, 7600);
  r.spawn('deputy', 5060 + D, Y, 7);
  // The bikers' bar (see bar.ts): the band's stage to get up on
  r.ledge(BAR_X1 + 70, Y - 100, 210, 'stage');
  // The refill before the door
  r.pickup(7450, Y - 30, 'large_health'); r.pickup(7520, Y - 30, 'large_ammo');
  return { f, c, e, r };
};

/** Where everything after the vents out back of the field office is laid out from. */
const R0 = END_X0 + GEYSERS;

const buildCourse = (): Course => {
  const { f, c, e, r } = build();
  const all = [f, c, e, r];
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
    jets: all.flatMap(p => p.jets),
    geysers: all.flatMap(p => p.geysers),
    movers: all.flatMap(p => p.movers),
    pits: all.flatMap(p => p.pits),
    props: all.flatMap(p => p.props),
    field: { x1: FIELD_X0, x2: FIELD_X0 + 9400 + YARD },
    yard: { x1: FIELD_X0 + 8300, x2: FIELD_X0 + 8300 + YARD + 400 },
    bunker: { x1: FIELD_X0 + 7600, x2: FIELD_X0 + 8300, roof: Y - 240, vein: { x: FIELD_X0 + 7845, y: Y - 44 }, bikers: [8480, 8395, 8565, 8660].map(x => FIELD_X0 + YARD + x) },
    chase: { x1: CHASE_X0, x2: CHASE_X0 + LAP * (LAPS + 1), lap: LAP, laps: LAPS },
    end: { x1: END_X0 - 800, x2: BOSS_DOOR_X, smokers: END_X0 + 1060, wall: END_X0 + 1110 },
    bar: {
      x1: R0 + BAR_X1, x2: R0 + BAR_X2, ceil: Y - 270,
      stage: { x: R0 + BAR_X1 + 70, y: Y - 100, w: 210 },
      bathroom: { x1: R0 + BAR_X2 - 150, x2: R0 + BAR_X2 },
      veins: [{ x: R0 + BAR_X1 + 395, y: Y - 20 }, { x: R0 + BAR_X1 + 330, y: Y - 137 }, { x: R0 + BAR_X2 - 60, y: Y - 37 }],
    },
    checkpoints: [
      { x: FIELD_X0 + 150, y: Y }, { x: FIELD_X0 + 2780, y: Y }, { x: FIELD_X0 + 4640, y: Y }, { x: FIELD_X0 + 7450, y: Y },
      // (out the far side of the break room, in the yard)
      { x: FIELD_X0 + 8620, y: Y },
      { x: CHASE_X0 + 300, y: Y }, { x: END_X0 + 1300, y: Y }, { x: R0 + 2900, y: Y }, { x: R0 + BAR_X1 - 80, y: Y },
      // (back for Oscar: in the middle of what's left of the bar)
      { x: R0 + (BAR_X1 + BAR_X2) / 2, y: Y },
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
