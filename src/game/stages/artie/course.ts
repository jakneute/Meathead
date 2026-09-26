// Artie Avalanche's stage, laid out as data. It's built left to right from x = 0
// with a cursor running along the ground, then shifted so it ends flat at the
// boss door. Up is negative y: the trail climbs to the tram station, the tram
// hauls you up the mountain, the summit has the moose and the harder stretch,
// and the ski run brings you all the way back down to the door.
//
//   trailhead (teaching, then applying: icicles, crumbling ice, crevasses)
//   -> tram ride (kill everything that smashes in)
//   -> moose (mid-boss) -> summit trail (wind, snowballs, combos)
//   -> skier -> avalanche ski run -> ranger cabin -> boss door

import { BOSS_DOOR_X, GROUND_Y } from '../../../constants';
import type { GroundRun } from '../../terrain';

export type WildKind = 'wolverine' | 'goat' | 'eagle' | 'shooter' | 'charger' | 'shielder';

export interface Ledge { x: number; y: number; w: number; crumble: boolean }
export interface Overhang { x: number; y: number; w: number; h: number }
export interface IcicleSpot { x: number; y: number }
export interface WindZone { x1: number; x2: number; push: number; gust?: { on: number; off: number } }
export interface SnowballChute { x: number; y: number; every: number; size: number; speed: number }
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
  moose: { x1: number; x2: number; y: number };
  skier: { x: number; y: number };
  ski: { x1: number; x2: number; obstacles: SkiObstacle[] };
  cabin: { x: number; y: number; stopX: number };
  /** Where each checkpoint starts you: 0 trailhead, 1 top of the tram, 2 after the moose, 3 on skis. */
  checkpoints: { x: number; y: number }[];
  left: number;
  startX: number;
}

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
  pit(len: number, dy = 0) { this.x += len; this.y += dy; return this; }
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
  // Safe start: one wolverine on the flat, to meet the wildlife
  c.flat(700);
  spawn('wolverine', 540);
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
  spawn('charger', 2850);
  c.flat(100);
  // Now crumbling ice over a real crevasse
  const crev1 = c.x;
  c.pit(320);
  ledges.push({ x: crev1 + 40, y: c.y, w: 80, crumble: true });
  ledges.push({ x: crev1 + 170, y: c.y - 25, w: 80, crumble: true });
  c.flat(380);
  // A goat up on a rock, an eagle overhead
  ledges.push({ x: c.x - 220, y: c.groundAt(c.x - 220) - 110, w: 110, crumble: false });
  spawn('goat', c.x - 180, 110);
  spawn('eagle', c.x - 100, 250);
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
  c.flat(420);
  spawn('eagle', c.x - 250, 220);
  spawn('shielder', c.x - 150);
  pickups.push({ x: c.x - 60, y: c.y - 30, type: 'small_health' });
  c.slope(200, -40);
  c.flat(200);
  // The lower tram station: the cabin's docked on the deck
  const tramX = c.x, tramY = c.y;
  c.flat(560);

  // ============ UNDER THE TRAM ============
  // The cabin climbs 1500 over 2800 along the cable; the mountainside stays well below it
  const TRAM_DX = 2800, TRAM_DY = -1500, CABIN_W = 560;
  const topX = tramX + TRAM_DX, topY = tramY + TRAM_DY;
  c.pit(0, 440);                      // drop off the end of the deck into the valley
  c.slope(540, -60);
  const deckX = topX + CABIN_W;
  c.slope(deckX - 20 - c.x, topY + 72 - c.y); // the mountainside
  c.slope(20, topY - c.y);                     // up onto the upper station deck
  // ============ SUMMIT ============
  c.flat(490);
  const cp1 = { x: deckX + 100, y: topY };
  // The moose's clearing: one screen, walled in while he's alive
  const mooseX1 = c.x;
  c.flat(800);
  const moose = { x1: mooseX1, x2: c.x, y: c.y };
  const cp2 = { x: c.x + 60, y: c.y };
  // Wind, taught on the flat: it shoves you back
  c.flat(400);
  winds.push({ x1: mooseX1 + 900, x2: mooseX1 + 1180, push: -2.2 });
  c.slope(300, -80);
  c.flat(100);
  // Wind in gusts over crumbling ice across a crevasse
  const crev3 = c.x;
  c.pit(340);
  ledges.push({ x: crev3 + 40, y: c.y, w: 80, crumble: true });
  ledges.push({ x: crev3 + 150, y: c.y - 25, w: 80, crumble: true });
  ledges.push({ x: crev3 + 255, y: c.y - 5, w: 70, crumble: true });
  winds.push({ x1: crev3 - 60, x2: crev3 + 360, push: -2.6, gust: { on: 110, off: 90 } });
  c.flat(360);
  // Snowballs, taught on the flat: small and slow, jump them
  chutes.push({ x: c.x - 10, y: c.y, every: 170, size: 34, speed: 3 });
  ledges.push({ x: c.x - 220, y: c.y - 100, w: 90, crumble: false });
  spawn('goat', c.x - 190, 100);
  // Then big ones barrelling down a slope at you
  c.slope(500, -150);
  chutes.push({ x: c.x - 10, y: c.y, every: 140, size: 56, speed: 4 });
  spawn('eagle', c.x - 250, 260);
  c.flat(250);
  spawn('shooter', c.x - 100);
  // The hardest gap: three crumbling ledges, icicles and gusts
  const crev4 = c.x;
  c.pit(420);
  ledges.push({ x: crev4 + 45, y: c.y, w: 70, crumble: true });
  ledges.push({ x: crev4 + 170, y: c.y - 40, w: 70, crumble: true });
  ledges.push({ x: crev4 + 295, y: c.y - 10, w: 70, crumble: true });
  overhang(crev4 + 20, crev4 + 400, 220, [crev4 + 110, crev4 + 230, crev4 + 340]);
  winds.push({ x1: crev4 - 40, x2: crev4 + 440, push: -2.4, gust: { on: 80, off: 110 } });
  c.flat(400);
  spawn('eagle', c.x - 330, 230);
  spawn('charger', c.x - 200);
  spawn('shielder', c.x - 60);
  pickups.push({ x: c.x - 380, y: c.y - 30, type: 'large_health' });
  // The summit ridge, and a skier admiring the view
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
  run(400, 70, [['rock', 300]]);
  run(500, 90, [['log', 260]]);
  run(300, 50);
  jump(140);
  run(400, 80, [['branch', 220]]);
  run(500, 100, [['pine', 300]]);
  run(400, 70, [['rock', 150], ['rock', 330]]);
  run(300, 40);
  jump(170);
  run(500, 110, [['log', 200], ['branch', 400]]);
  run(600, 120, [['pine', 250]]);
  run(400, 55);
  jump(180);
  run(500, 120, [['rock', 150], ['log', 350]]);
  run(500, 110, [['branch', 150], ['pine', 380]]);
  run(400, 90);
  jump(160);
  run(600, 140, [['rock', 200], ['pine', 420]]);
  run(500, 110, [['log', 150], ['branch', 330]]);
  run(500, 100, [['rock', 180], ['log', 380]]);
  jump(150);
  run(500, 110, [['pine', 200], ['branch', 400]]);
  // The rest of the way down to the valley floor, easing out
  const drop = GROUND_Y - c.y;
  run(900, drop * 0.7, [['rock', 300], ['log', 620]]);
  run(700, GROUND_Y - c.y);
  const ski = { x1: skiX1, x2: c.x, obstacles };
  const cp3 = { x: skiX1 + 40, y: c.groundAt(skiX1 + 40) };

  // ============ THE RANGER CABIN, THEN THE DOOR ============
  const cabinX = c.x + 300;
  c.flat(1500);
  const cabin = { x: cabinX, y: GROUND_Y, stopX: cabinX + 700 };

  // Shift everything so the run-out ends at the boss door
  const dx = BOSS_DOOR_X - c.x;
  const sx = (v: number) => v + dx;
  const course: Course = {
    runs: c.runs.map(r => ({ x1: sx(r.x1), y1: r.y1, x2: sx(r.x2), y2: r.y2 })),
    ledges: ledges.map(l => ({ ...l, x: sx(l.x) })),
    overhangs: overhangs.map(o => ({ ...o, x: sx(o.x) })),
    icicles: icicles.map(i => ({ ...i, x: sx(i.x) })),
    winds: winds.map(w => ({ ...w, x1: sx(w.x1), x2: sx(w.x2) })),
    chutes: chutes.map(ch => ({ ...ch, x: sx(ch.x) })),
    spawns: spawns.map(s => ({ ...s, x: sx(s.x) })),
    pickups: pickups.map(p => ({ ...p, x: sx(p.x) })),
    tram: { x: sx(tramX), y: tramY, toX: sx(topX), toY: topY },
    moose: { x1: sx(moose.x1), x2: sx(moose.x2), y: moose.y },
    skier: { x: sx(skier.x), y: skier.y },
    ski: { x1: sx(ski.x1), x2: sx(ski.x2), obstacles: ski.obstacles.map(o => ({ ...o, x: sx(o.x) })) },
    cabin: { x: sx(cabin.x), y: cabin.y, stopX: sx(cabin.stopX) },
    checkpoints: [{ x: sx(150), y: GROUND_Y }, { x: sx(cp1.x), y: cp1.y }, { x: sx(cp2.x), y: cp2.y }, { x: sx(cp3.x), y: cp3.y }],
    left: sx(0),
    startX: sx(0),
  };
  return course;
};

/** Built once: the layout never changes. */
export const COURSE = buildCourse();
