// Artie Avalanche's stage, laid out as data. It's built left to right from x = 0
// with a cursor running along the ground, then shifted so it ends flat at the
// boss door. Up is negative y: the trail climbs to the tram station, the tram
// hauls you up the mountain, the summit has the moose and the harder stretch,
// and the ski run brings you all the way back down to the door.
//
//   trailhead (teaching, then applying: icicles, crumbling ice, crevasses)
//   -> tram ride (kill everything that smashes in)
//   -> the high woods (wind) -> moose (mid-boss) -> the ice cave (snowballs, icicles under a low roof, combos)
//   -> skier -> avalanche ski run -> ranger cabin -> boss door

import { BOSS_DOOR_X, GROUND_Y } from '../../../constants';
import type { GroundRun } from '../../core/terrain';

/** Checkpoints through the stage, in order. Dying starts you at the last one you reached. */
export const CP = { TRAILHEAD: 0, STATION: 1, TOP: 2, CLEARING: 3, AFTER_MOOSE: 4, CAVE: 5, SKI: 6, DOOR: 7 } as const;

export type WildKind = 'wolverine' | 'goat' | 'eagle' | 'shooter' | 'charger' | 'shielder';

export interface Ledge { x: number; y: number; w: number; crumble: boolean; /** Up in the woods: a pine's bough, or a fallen trunk (else a shelf of rock). */ look?: 'bough' | 'log' }
/** A pine in the high woods (drawn behind everything): its foot, how tall. */
export interface Pine { x: number; y: number; h: number }
export interface Overhang { x: number; y: number; w: number; h: number }
export interface IcicleSpot { x: number; y: number }
export interface WindZone { x1: number; x2: number; push: number; gust?: { on: number; off: number } }
/** `from`: it only rolls once you're past here (so nothing bowls you back into the crevasse you just crossed). */
export interface SnowballChute { x: number; y: number; every: number; size: number; speed: number; from: number }
export interface Spawn { kind: WildKind; x: number; y: number }
export interface PickupSpot { x: number; y: number; type: 'small_health' | 'large_health' | 'small_ammo' | 'large_ammo' }
export type SkiObstacleKind = 'rock' | 'log' | 'pine' | 'branch';
export interface SkiObstacle { kind: SkiObstacleKind; x: number; ground: number }

export interface Course {
  runs: GroundRun[];
  ledges: Ledge[];
  overhangs: Overhang[];
  icicles: IcicleSpot[];
  winds: WindZone[];
  chutes: SnowballChute[];
  spawns: Spawn[];
  pickups: PickupSpot[];
  tram: { x: number; y: number; toX: number; toY: number };
  /** The drop under the whole tram ride, full of cloud. */
  gorge: { x1: number; x2: number; y: number };
  moose: { x1: number; x2: number; y: number };
  /** The ice cave the summit trail runs through (from past the moose's clearing to the ridge where the skier is): its
   * roof's underside (sampled every CAVE_STEP along it), flush with the tops of the icicle overhangs: no going over them. */
  cave: { x1: number; x2: number; roof: number[] };
  /** The high woods between the top of the tram and the moose's clearing (the pines through them, and round the clearing). */
  woods: { x1: number; x2: number; pines: Pine[] };
  skier: { x: number; y: number };
  ski: { x1: number; x2: number; obstacles: SkiObstacle[] };
  cabin: { x: number; y: number; stopX: number };
  /** Where each checkpoint (CP) starts you. */
  checkpoints: { x: number; y: number }[];
  left: number;
  startX: number;
}

/** The ice cave's roof: how high over the ground (flush with the tops of the icicle overhangs), and how finely it's sampled. */
export const CAVE_H = 266, CAVE_STEP = 20;

/** A cursor walking along the ground, laying runs and dropping features. */
class Cursor {
  x = 0;
  y = GROUND_Y;
  runs: GroundRun[] = [];
  /** Flat ground. */
  flat(len: number) { return this.slope(len, 0); }
  /** Straight ground rising (dy < 0) or falling (dy > 0) over len. */
  slope(len: number, dy: number) {
    this.runs.push({ x1: this.x, y1: this.y, x2: this.x + len, y2: this.y + dy });
    this.x += len;
    this.y += dy;
    return this;
  }
  /** A gap in the ground (the far side at the same height unless told otherwise). */
  pit(len: number, dy = 0, style?: 'clouds') {
    if (style && this.runs.length) this.runs[this.runs.length - 1].pitAfter = style;
    this.x += len; this.y += dy; return this;
  }
  /** Ground height at an x already laid (or the cursor height past the end). */
  groundAt(x: number) {
    for (const r of this.runs) if (x >= r.x1 && x <= r.x2) return r.x2 === r.x1 ? r.y1 : r.y1 + ((x - r.x1) / (r.x2 - r.x1)) * (r.y2 - r.y1);
    return this.y;
  }
}

export const buildCourse = (): Course => {
  const c = new Cursor();
  const ledges: Ledge[] = [], overhangs: Overhang[] = [], icicles: IcicleSpot[] = [], winds: WindZone[] = [];
  const chutes: SnowballChute[] = [], spawns: Spawn[] = [], pickups: PickupSpot[] = [];
  const spawn = (kind: WildKind, x: number, above = 0) => spawns.push({ kind, x, y: c.groundAt(x) - above });
  /** A rock overhang `clear` above the ground at x1, with icicles along it. */
  const overhang = (x1: number, x2: number, clear: number, icicleXs: number[]) => {
    const y = Math.min(c.groundAt(x1), c.groundAt(x2)) - clear;
    overhangs.push({ x: x1, y: y - 46, w: x2 - x1, h: 46 });
    for (const x of icicleXs) icicles.push({ x, y });
  };

  // ============ TRAILHEAD ============
  // Safe start: one wolverine at the end of the flat, to meet the wildlife (nothing near where you start)
  c.flat(700);
  spawn('wolverine', 660);
  // A gentle climb with a goon at the top
  c.slope(400, -60);
  spawn('shooter', 1060);
  c.flat(200);
  // Your first gap: short and harmless-looking
  c.pit(100);
  c.flat(500);
  // Icicles, taught over solid ground: they shake, then drop
  overhang(1480, 1820, 190, [1560, 1650, 1740]);
  pickups.push({ x: 1870, y: c.groundAt(1870) - 30, type: 'small_health' });
  // Crumbling ice, taught over solid ground: climb the ledges before they give way to reach the ammo
  c.flat(600);
  // (ledges clear his head, so you walk under them if you'd rather not)
  ledges.push({ x: 1990, y: c.groundAt(1990) - 100, w: 90, crumble: true });
  ledges.push({ x: 2130, y: c.groundAt(2130) - 175, w: 90, crumble: true });
  ledges.push({ x: 2270, y: c.groundAt(2270) - 245, w: 90, crumble: true });
  ledges.push({ x: 2390, y: c.groundAt(2390) - 300, w: 100, crumble: false });
  pickups.push({ x: 2430, y: c.groundAt(2390) - 330, type: 'large_ammo' });
  // Climb, with a charger coming down at you
  c.slope(400, -90);
  spawn('charger', 2620); // (met on the climb, well short of the crevasse)
  c.flat(100);
  // Now crumbling ice over a real crevasse
  const crev1 = c.x;
  c.pit(320);
  ledges.push({ x: crev1 + 40, y: c.y, w: 80, crumble: true });
  ledges.push({ x: crev1 + 170, y: c.y - 25, w: 80, crumble: true });
  // Land, catch your breath: a goat up on a rock and an eagle overhead are well past the landing
  c.flat(640);
  ledges.push({ x: c.x - 200, y: c.groundAt(c.x - 200) - 110, w: 110, crumble: false });
  spawn('goat', c.x - 160, 110);
  spawn('eagle', c.x - 40, 250);
  // Icicles over a climb, wolverines coming down it
  const climb = c.x;
  c.slope(400, -100);
  overhang(climb + 100, climb + 320, 200, [climb + 150, climb + 230, climb + 300]);
  spawn('wolverine', climb + 250);
  spawn('wolverine', climb + 350);
  c.flat(100);
  // Everything so far at once: crumbling ice over a crevasse, under icicles
  const crev2 = c.x;
  c.pit(280);
  ledges.push({ x: crev2 + 45, y: c.y, w: 80, crumble: true });
  ledges.push({ x: crev2 + 165, y: c.y - 30, w: 80, crumble: true });
  overhang(crev2 - 20, crev2 + 300, 210, [crev2 + 90, crev2 + 210]);
  c.flat(620);
  spawn('shielder', c.x - 200);
  spawn('eagle', c.x - 90, 220);
  pickups.push({ x: c.x - 60, y: c.y - 30, type: 'small_health' });
  // One more stretch before the station: a climb under icicles with a goat and a wolverine coming down it, then a
  // crevasse on crumbling ice with an eagle over it, a goon and a shield goon waiting on the far side
  const climb2 = c.x;
  c.slope(360, -80);
  overhang(climb2 + 80, climb2 + 300, 200, [climb2 + 120, climb2 + 200, climb2 + 280]);
  spawn('goat', climb2 + 300);
  spawn('wolverine', climb2 + 340);
  c.flat(160);
  const crev2b = c.x;
  c.pit(300);
  ledges.push({ x: crev2b + 40, y: c.y, w: 80, crumble: true });
  ledges.push({ x: crev2b + 175, y: c.y - 20, w: 80, crumble: true });
  spawn('eagle', crev2b + 200, 240);
  c.flat(620);
  ledges.push({ x: c.x - 380, y: c.y - 105, w: 110, crumble: false });
  spawn('shooter', c.x - 330, 105);
  spawn('shielder', c.x - 150);
  pickups.push({ x: c.x - 520, y: c.y - 30, type: 'small_ammo' });
  c.slope(200, -40);
  c.flat(200);
  // The lower tram station: the cabin's docked on the deck
  const tramX = c.x, tramY = c.y;
  c.flat(560);

  // ============ UNDER THE TRAM ============
  // The cabin climbs 1500 over 2800 along the cable
  const TRAM_DX = 2800, TRAM_DY = -1500, CABIN_W = 560;
  const topX = tramX + TRAM_DX, topY = tramY + TRAM_DY;
  const deckX = topX + CABIN_W;
  // Nothing under the cable but cloud, all the way up: once you're on the tram there's no walking anywhere
  const gorge = { x1: c.x, x2: deckX, y: topY };
  c.pit(deckX - c.x, topY - c.y, 'clouds'); // (the stage draws the clouds)
  // ============ SUMMIT ============
  c.flat(490);
  const cp1 = { x: deckX + 100, y: topY };
  // Off the tram: patch up and reload before the moose
  pickups.push({ x: deckX + 230, y: topY - 30, type: 'large_health' });
  pickups.push({ x: deckX + 320, y: topY - 30, type: 'large_ammo' });
  // ============ THE HIGH WOODS ============
  // Up into the pines: the same sort of going as the trail below (a bit of climbing, a gap or two), in among the
  // trees: a fallen trunk to get up on, a frozen creek, a big pine to climb by its boughs to the ammo in it
  const woodsX1 = c.x;
  const pines: Pine[] = [];
  const pine = (x: number, h: number) => pines.push({ x, y: c.groundAt(x), h });
  c.flat(300);
  // A fallen trunk across the path (up on it, over it); a wolverine on the far side
  ledges.push({ x: c.x - 150, y: c.y - 44, w: 170, crumble: false, look: 'log' });
  spawn('wolverine', c.x - 20);
  // The wind, taught on the flat through a gap in the trees: it shoves you back
  const windFlat = c.x;
  c.flat(400);
  winds.push({ x1: windFlat + 60, x2: windFlat + 360, push: -2.2 });
  c.slope(220, -50);
  // The frozen creek: a short gap, a bough hanging over it, the wind gusting down it
  const creek = c.x;
  c.flat(80);
  c.pit(130);
  ledges.push({ x: creek + 110, y: c.y - 70, w: 90, crumble: false, look: 'bough' });
  winds.push({ x1: creek - 40, x2: creek + 250, push: -2.1, gust: { on: 100, off: 110 } });
  c.flat(360);
  // A big pine: up its boughs to a large ammo; a goat on a stump, an eagle over the treetops
  const big = c.x - 240;
  ledges.push({ x: big - 70, y: c.y - 90, w: 80, crumble: false, look: 'bough' });
  ledges.push({ x: big + 20, y: c.y - 170, w: 80, crumble: false, look: 'bough' });
  ledges.push({ x: big - 60, y: c.y - 250, w: 90, crumble: false, look: 'bough' });
  pickups.push({ x: big - 15, y: c.y - 280, type: 'large_ammo' });
  pines.push({ x: big, y: c.y, h: 330 });
  ledges.push({ x: c.x - 70, y: c.y - 60, w: 60, crumble: false });
  spawn('goat', c.x - 40, 60);
  spawn('eagle', c.x - 60, 260);
  // A windswept gap in the trees: crumbling ice either side of a solid bough (somewhere to wait out a gust)
  c.flat(160);
  const gapW = c.x;
  c.pit(340);
  ledges.push({ x: gapW + 40, y: c.y, w: 80, crumble: true });
  ledges.push({ x: gapW + 150, y: c.y - 25, w: 80, crumble: false, look: 'bough' });
  ledges.push({ x: gapW + 255, y: c.y - 5, w: 70, crumble: true });
  winds.push({ x1: gapW - 60, x2: gapW + 360, push: -2.1, gust: { on: 100, off: 100 } });
  c.flat(300);
  spawn('wolverine', c.x - 120);
  c.slope(260, -40);
  c.flat(220);
  // (the trees all through it, thick; thinning out round the clearing's edges)
  for (let x = woodsX1 + 40; x < c.x; x += 70 + Math.round(((x * 37) % 50))) if (Math.abs(x - big) > 80) pine(x, 150 + ((x * 13) % 110));
  // The moose's clearing: one screen, walled in while he's alive (open: pines only round its edges)
  const mooseX1 = c.x;
  // (a checkpoint at its edge: die to the moose and you're back here, not the far side of the woods)
  const cpClearing = { x: mooseX1 - 150, y: c.y };
  c.flat(800);
  const moose = { x1: mooseX1, x2: c.x, y: c.y };
  for (const dx of [-60, 20, 70]) pine(mooseX1 + dx, 190 + (dx & 63));
  for (const dx of [-60, -10, 50]) pine(c.x + dx, 200 + (dx & 31));
  const woods = { x1: woodsX1, x2: c.x + 100, pines };
  const cp2 = { x: c.x + 60, y: c.y };
  // ============ THE ICE CAVE ============
  // The summit trail runs through the mountain, in a cave of ice: its roof is low, and flush with the tops of the
  // overhangs, so the icicles have to be got past underneath (and nothing's gone over from above)
  const caveX1 = c.x + 150;
  // In past the mouth
  c.flat(400);
  c.slope(300, -80);
  c.flat(100);
  // Crumbling ice across a crevasse (the middle ledge solid)
  const crev3 = c.x;
  c.pit(340);
  ledges.push({ x: crev3 + 40, y: c.y, w: 80, crumble: true });
  ledges.push({ x: crev3 + 150, y: c.y - 25, w: 80, crumble: false }); // (solid: somewhere to get your footing)
  ledges.push({ x: crev3 + 255, y: c.y - 5, w: 70, crumble: true });
  c.flat(520);
  // Snowballs, taught on the flat: small and slow, jump them
  chutes.push({ x: c.x - 10, y: c.y, every: 170, size: 34, speed: 3, from: crev3 + 400 });
  ledges.push({ x: c.x - 200, y: c.y - 100, w: 90, crumble: false });
  spawn('goat', c.x - 170, 100);
  // Then big ones barrelling down a slope at you
  c.slope(500, -150);
  chutes.push({ x: c.x - 10, y: c.y, every: 140, size: 56, speed: 4, from: c.x - 900 });
  spawn('eagle', c.x - 250, 170);
  c.flat(250);
  spawn('shooter', c.x - 150); // (back from the edge, so he can't shoot you into the crevasse while you wait on a ledge, and clear of the chute's mouth, so its snowballs don't flatten him unless you shove him into them)
  // The hardest gap: three crumbling ledges under icicles (the roof right on top of them: under, or not at all)
  const crev4 = c.x;
  c.pit(420);
  ledges.push({ x: crev4 + 45, y: c.y, w: 70, crumble: true });
  ledges.push({ x: crev4 + 170, y: c.y - 40, w: 70, crumble: false });
  ledges.push({ x: crev4 + 295, y: c.y - 10, w: 70, crumble: true });
  overhang(crev4 + 20, crev4 + 400, 220, [crev4 + 110, crev4 + 230, crev4 + 340]);
  c.flat(620);
  // (a checkpoint just past it: halfway through the cave)
  const cpCave = { x: crev4 + 480, y: c.y };
  pickups.push({ x: c.x - 560, y: c.y - 30, type: 'large_health' });
  spawn('charger', c.x - 240);
  spawn('eagle', c.x - 130, 170);
  spawn('shielder', c.x - 60);
  // One more stretch before the ridge: big snowballs down a slope, a last crevasse with icicles off the roof over it,
  // then the wildlife up top
  const slope5 = c.x;
  c.slope(450, -120);
  chutes.push({ x: c.x - 10, y: c.y, every: 150, size: 50, speed: 4, from: slope5 - 200 });
  c.flat(220);
  spawn('shooter', c.x - 120);
  const crev5 = c.x;
  c.pit(360);
  ledges.push({ x: crev5 + 40, y: c.y, w: 75, crumble: true });
  ledges.push({ x: crev5 + 150, y: c.y - 30, w: 75, crumble: false });
  ledges.push({ x: crev5 + 260, y: c.y - 5, w: 70, crumble: true });
  spawn('eagle', crev5 + 180, 160);
  c.flat(560);
  spawn('goat', c.x - 360);
  spawn('wolverine', c.x - 220);
  spawn('wolverine', c.x - 160);
  pickups.push({ x: c.x - 480, y: c.y - 30, type: 'small_health' });
  // Out of the cave onto the summit ridge, and a skier admiring the view
  c.flat(80);
  const caveX2 = c.x;
  c.flat(280);
  const skier = { x: c.x - 60, y: c.y };

  // ============ SKI RUN ============
  // Straight down the mountain to the door, obstacles all the way, an avalanche behind
  const skiX1 = c.x;
  const obstacles: SkiObstacle[] = [];
  const ob = (kind: SkiObstacleKind, at: number) => obstacles.push({ kind, x: at, ground: c.groundAt(at) });
  /** Downhill run with obstacles at these distances along it. */
  const run = (len: number, drop: number, obs: [SkiObstacleKind, number][] = []) => {
    const x0 = c.x;
    c.slope(len, drop);
    for (const [k, d] of obs) ob(k, x0 + d);
  };
  /** A little kicker, then a crevasse to jump. */
  const jump = (gap: number) => { c.slope(70, -16); c.pit(gap, 30); };
  // The run, as a plan: each stretch's length and how steep it is (relative), the obstacles along it, the jumps. The
  // drops are fitted to the height there is to come down, leaving the last of it for the run-out at the bottom
  type Step = { run: number; steep: number; obs?: [SkiObstacleKind, number][] } | { jump: number };
  const PLAN: Step[] = [
    { run: 400, steep: 70 }, { run: 500, steep: 90, obs: [['log', 260]] }, { run: 300, steep: 50 }, { jump: 140 },
    { run: 400, steep: 80, obs: [['branch', 220]] }, { run: 500, steep: 100, obs: [['pine', 300]] }, { run: 400, steep: 70, obs: [['rock', 150], ['rock', 330]] },
    { run: 300, steep: 40 }, { jump: 170 },
    { run: 500, steep: 110, obs: [['log', 200], ['branch', 400]] }, { run: 600, steep: 120, obs: [['pine', 250]] }, { run: 400, steep: 55 }, { jump: 180 },
    { run: 500, steep: 120, obs: [['rock', 150], ['log', 350]] }, { run: 500, steep: 110, obs: [['branch', 150], ['pine', 380]] }, { run: 400, steep: 90 }, { jump: 160 },
    { run: 600, steep: 140, obs: [['rock', 200], ['pine', 420]] }, { run: 500, steep: 110, obs: [['log', 150], ['branch', 330]] },
    { run: 500, steep: 100, obs: [['rock', 180], ['log', 380]] }, { jump: 150 },
    { run: 500, steep: 110, obs: [['pine', 200], ['branch', 400]] },
    // (the longer way down: a stretch through the trees, a double jump, a slalom of rocks and branches, a last long drop)
    { run: 500, steep: 90, obs: [['pine', 120], ['pine', 300], ['branch', 440]] }, { run: 400, steep: 70, obs: [['log', 260]] }, { jump: 150 },
    { run: 250, steep: 40 }, { jump: 170 },
    { run: 500, steep: 120, obs: [['rock', 120], ['branch', 260], ['rock', 400]] }, { run: 500, steep: 110, obs: [['branch', 140], ['log', 300], ['pine', 440]] },
    { run: 400, steep: 80 }, { jump: 190 },
    { run: 600, steep: 150, obs: [['log', 180], ['rock', 360], ['branch', 520]] }, { run: 500, steep: 110, obs: [['pine', 220], ['rock', 400]] },
    { run: 400, steep: 70, obs: [['branch', 200]] }, { jump: 160 },
    { run: 600, steep: 130, obs: [['rock', 200], ['log', 420]] },
  ];
  const jumps = PLAN.filter(p => 'jump' in p).length;
  const height = GROUND_Y - c.y - jumps * 14;
  const steepTotal = PLAN.reduce((n, p) => n + ('run' in p ? p.steep : 0), 0);
  const k = (height * 0.8) / steepTotal;
  for (const p of PLAN) {
    if ('jump' in p) jump(p.jump);
    else run(p.run, p.steep * k, p.obs);
  }
  // The rest of the way down to the valley floor, easing out
  const drop = GROUND_Y - c.y;
  run(900, drop * 0.7, [['rock', 300], ['log', 620]]);
  run(700, GROUND_Y - c.y);
  const ski = { x1: skiX1, x2: c.x, obstacles };
  const cp3 = { x: skiX1 + 40, y: c.groundAt(skiX1 + 40) };

  // ============ THE RANGER CABIN, THEN THE DOOR ============
  const cabinX = c.x + 300;
  c.flat(1500);
  const cabin = { x: cabinX, y: GROUND_Y, stopX: cabinX + 560 };
  // Patch up and reload before Artie
  pickups.push({ x: c.x - 420, y: GROUND_Y - 30, type: 'large_health' });
  pickups.push({ x: c.x - 340, y: GROUND_Y - 30, type: 'large_ammo' });

  const lineAt = (x: number) => {
    const r = c.runs.find(r => x >= r.x1 && x <= r.x2);
    if (r) return r.x2 === r.x1 ? r.y1 : r.y1 + ((x - r.x1) / (r.x2 - r.x1)) * (r.y2 - r.y1);
    const before = [...c.runs].reverse().find(r => r.x2 < x), after = c.runs.find(r => r.x1 > x);
    if (!before || !after) return c.y;
    return before.y2 + ((x - before.x2) / (after.x1 - before.x2)) * (after.y1 - before.y2);
  };
  const roof: number[] = [];
  for (let x = caveX1; x <= caveX2; x += CAVE_STEP) roof.push(lineAt(x) - CAVE_H);
  const cave = { x1: caveX1, x2: caveX2, roof };
  // Icicles off the roof itself: a pair just inside (the lesson again, under a roof now), and a run of them over the
  // last crevasse, to get past underneath while the ledges crumble
  for (const x of [caveX1 + 140, caveX1 + 230, crev5 + 110, crev5 + 200, crev5 + 290]) icicles.push({ x, y: lineAt(x) - CAVE_H });

  // Shift everything so the run-out ends at the boss door
  const dx = BOSS_DOOR_X - c.x;
  const sx = (v: number) => v + dx;
  const course: Course = {
    runs: c.runs.map(r => ({ ...r, x1: sx(r.x1), x2: sx(r.x2) })),
    ledges: ledges.map(l => ({ ...l, x: sx(l.x) })),
    overhangs: overhangs.map(o => ({ ...o, x: sx(o.x) })),
    icicles: icicles.map(i => ({ ...i, x: sx(i.x) })),
    winds: winds.map(w => ({ ...w, x1: sx(w.x1), x2: sx(w.x2) })),
    chutes: chutes.map(ch => ({ ...ch, x: sx(ch.x), from: sx(ch.from) })),
    spawns: spawns.map(s => ({ ...s, x: sx(s.x) })),
    pickups: pickups.map(p => ({ ...p, x: sx(p.x) })),
    tram: { x: sx(tramX), y: tramY, toX: sx(topX), toY: topY },
    gorge: { x1: sx(gorge.x1), x2: sx(gorge.x2), y: gorge.y },
    moose: { x1: sx(moose.x1), x2: sx(moose.x2), y: moose.y },
    cave: { x1: sx(cave.x1), x2: sx(cave.x2), roof: cave.roof },
    woods: { x1: sx(woods.x1), x2: sx(woods.x2), pines: woods.pines.map(p => ({ ...p, x: sx(p.x) })) },
    skier: { x: sx(skier.x), y: skier.y },
    ski: { x1: sx(ski.x1), x2: sx(ski.x2), obstacles: ski.obstacles.map(o => ({ ...o, x: sx(o.x) })) },
    cabin: { x: sx(cabin.x), y: cabin.y, stopX: sx(cabin.stopX) },
    checkpoints: [
      { x: sx(150), y: GROUND_Y }, { x: sx(tramX - 160), y: tramY }, { x: sx(cp1.x), y: cp1.y },
      { x: sx(cpClearing.x), y: cpClearing.y }, { x: sx(cp2.x), y: cp2.y }, { x: sx(cpCave.x), y: cpCave.y },
      { x: sx(cp3.x), y: cp3.y }, { x: BOSS_DOOR_X - 650, y: GROUND_Y },
    ],
    left: sx(0),
    startX: sx(0),
  };
  return course;
};

/** Built once: the layout never changes. */
export const COURSE = buildCourse();
